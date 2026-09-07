import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import type { EngineResult, GameState, SocialWorld } from '../types/game';
import { activeSpecialCareerWorld, ensureSpecialCareerWorld } from './SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships } from './SpecialCareerRelationshipSystem';

type Track = Record<string, number | string | boolean>;
type Rng = ReturnType<typeof createRng>;
export type ModelingCampaignKind = 'editorial' | 'commercial' | 'runway';
export type ModelingAgencyOfferKind = 'initial' | 'renewal';

export interface ModelingAgencyOfferView {
  kind: ModelingAgencyOfferKind;
  agency: string;
  years: number;
  commission: number;
  reach: number;
  expiresAge: number;
}

export interface ModelingCampaignEntry {
  slot: number;
  title: string;
  client: string;
  kind: ModelingCampaignKind;
  startedAge: number;
  completedAge: number;
  score: number;
  reception: string;
  grossPay: number;
  netPay: number;
}

const HISTORY_SLOTS = 6;
const EDITORIAL_CLIENTS = ['Threadline Journal','Northglass Quarterly','Paperlight Review','Meridian Edit','Blue Hour Magazine','Open Frame Journal'];
const COMMERCIAL_CLIENTS = ['Aster Goods','Harbor & Pine','Luma Sport','Arc & Loom','Vela Home','Fieldnote Supply'];
const RUNWAY_CLIENTS = ['Vela House','Formline Atelier','Northglass Collection','Aster House','Meridian Studio','Lumen Row'];
const CAMPAIGN_LABELS = ['First Light','After Hours','New Season','Open City','Soft Focus','Crosscurrent','Daybreak','Night Window','Second Look','Northbound'];

function n(record:Track,key:string,def=0){return typeof record[key]==='number'?record[key] as number:def;}
function s(record:Track,key:string,def=''){return typeof record[key]==='string'?record[key] as string:def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function track(state:GameState){return (state.specialCareers.modeling ??= {}) as Track;}
function readTrack(state:GameState){return (state.specialCareers.modeling ?? {}) as Track;}
function slotKey(slot:number,key:string){return `campaign${slot}${key}`;}
function average(values:number[],fallback=50){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:fallback;}

function modelingRelationships(state:GameState,world:SocialWorld){
  const active=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);
  const manager=active.find(member=>member.role==='leader');
  const campaignIds=new Set(world.groups.filter(group=>group.kind.includes(':campaign')).flatMap(group=>group.memberNpcIds));
  const rivalIds=new Set(world.groups.filter(group=>group.kind.includes(':rivals')).flatMap(group=>group.memberNpcIds));
  const campaignScores=active.filter(member=>campaignIds.has(member.npcId)).map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  const supportScores=active.filter(member=>!rivalIds.has(member.npcId)).map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  const managerScore=manager?state.relationships.find(rel=>rel.npcId===manager.npcId)?.score??50:50;
  return {chemistry:clamp(average(supportScores,50)),campaignChemistry:clamp(average(campaignScores,average(supportScores,50))),managerScore:clamp(managerScore),managerNpcId:manager?.npcId};
}

function campaignPool(kind:ModelingCampaignKind){return kind==='editorial'?EDITORIAL_CLIENTS:kind==='commercial'?COMMERCIAL_CLIENTS:RUNWAY_CLIENTS;}
function campaignTitle(state:GameState,career:Track,kind:ModelingCampaignKind,rng:Rng){
  const index=Math.max(0,Math.floor(n(career,'campaignsStarted')));
  const clientOrder=createRng(`${state.seed}-modeling-client-${kind}`).shuffle(campaignPool(kind));
  const labelOrder=createRng(`${state.seed}-modeling-campaign-label-${kind}`).shuffle(CAMPAIGN_LABELS);
  const client=clientOrder[index%clientOrder.length]!;
  const label=labelOrder[index%labelOrder.length]!;
  const cycle=Math.floor(index/Math.max(clientOrder.length,labelOrder.length));
  return {client,title:cycle>0?`${client} — ${label} ${cycle+1}`:`${client} — ${label}`};
}

function reception(score:number){
  if(score>=90)return'defining campaign';
  if(score>=78)return'standout campaign';
  if(score>=62)return'strong campaign';
  if(score>=46)return'mixed campaign';
  return'underwhelming campaign';
}

function writeCampaignHistory(career:Track,entry:Omit<ModelingCampaignEntry,'slot'>){
  const count=n(career,'campaignHistoryCount')+1;setN(career,'campaignHistoryCount',count);
  const slot=((count-1)%HISTORY_SLOTS)+1;
  career[slotKey(slot,'Title')]=entry.title;career[slotKey(slot,'Client')]=entry.client;career[slotKey(slot,'Kind')]=entry.kind;career[slotKey(slot,'Reception')]=entry.reception;
  setN(career,slotKey(slot,'StartedAge'),entry.startedAge);setN(career,slotKey(slot,'CompletedAge'),entry.completedAge);setN(career,slotKey(slot,'Score'),entry.score);setN(career,slotKey(slot,'GrossPay'),entry.grossPay);setN(career,slotKey(slot,'NetPay'),entry.netPay);
}

function campaignHistoryFromTrack(career:Track):ModelingCampaignEntry[]{
  const entries:ModelingCampaignEntry[]=[];
  for(let slot=1;slot<=HISTORY_SLOTS;slot+=1){
    const title=s(career,slotKey(slot,'Title'));if(!title)continue;
    const rawKind=s(career,slotKey(slot,'Kind'),'commercial');const kind:ModelingCampaignKind=rawKind==='editorial'||rawKind==='runway'?rawKind:'commercial';
    entries.push({slot,title,client:s(career,slotKey(slot,'Client'),'client'),kind,startedAge:n(career,slotKey(slot,'StartedAge')),completedAge:n(career,slotKey(slot,'CompletedAge')),score:n(career,slotKey(slot,'Score')),reception:s(career,slotKey(slot,'Reception'),'completed'),grossPay:n(career,slotKey(slot,'GrossPay')),netPay:n(career,slotKey(slot,'NetPay'))});
  }
  return entries.sort((a,b)=>b.completedAge-a.completedAge||b.slot-a.slot);
}

export function modelingCampaignHistory(state:GameState){return campaignHistoryFromTrack(readTrack(state));}

export function modelingAgencyOffer(state:GameState):ModelingAgencyOfferView|undefined {
  const career=readTrack(state);if(career.agencyOfferPending!==true)return;
  const expiresAge=n(career,'agencyOfferExpiresAge',state.character.age);if(state.character.age>expiresAge)return;
  const kind=s(career,'agencyOfferKind','initial')==='renewal'?'renewal':'initial';
  return {kind,agency:s(career,'agencyOfferAgency','agency'),years:Math.max(1,Math.round(n(career,'agencyOfferYears',2))),commission:clamp(n(career,'agencyOfferCommission',.18),.08,.35),reach:clamp(n(career,'agencyOfferReach',1.12),1,1.5),expiresAge};
}

function ensureModelingWorld(state:GameState,announce=false){
  const world=ensureSpecialCareerWorld(state,'modeling','agency',{announce});ensureSpecialCareerRelationships(state,world);return world;
}

function createAgencyOffer(state:GameState,career:Track,world:SocialWorld,kind:ModelingAgencyOfferKind,rng:Rng){
  const relations=modelingRelationships(state,world);const reputation=n(career,'reputation',20);const technique=n(career,'technique',25);const jobs=n(career,'jobs');const fame=state.fame.fame;
  const strength=clamp(technique*.30+reputation*.24+state.character.stats.appearance*.14+relations.managerScore*.11+relations.chemistry*.09+Number(career.worldPrestige??50)*.07+fame*.05);
  const tier=strength>=78||fame>=65?'premier':strength>=56||jobs>=4?'standard':'development';
  const years=tier==='premier'?rng.int(3,4):tier==='standard'?rng.int(2,3):2;
  const commission=tier==='premier'?rng.int(12,16)/100:tier==='standard'?rng.int(15,19)/100:rng.int(18,22)/100;
  const reach=tier==='premier'?rng.int(120,130)/100:tier==='standard'?rng.int(113,122)/100:rng.int(107,115)/100;
  career.agencyOfferPending=true;career.agencyOfferKind=kind;career.agencyOfferAgency=world.name;setN(career,'agencyOfferYears',years);setN(career,'agencyOfferCommission',commission);setN(career,'agencyOfferReach',reach);setN(career,'agencyOfferCreatedAge',state.character.age);setN(career,'agencyOfferExpiresAge',state.character.age+1);setN(career,'agencyOffersReceived',n(career,'agencyOffersReceived')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`${world.name} offered you a ${years}-year ${kind==='renewal'?'renewal':'representation'} contract: ${Math.round(commission*100)}% commission for a ${Math.round((reach-1)*100)}% booking-reach boost.`,npcIds:relations.managerNpcId?[relations.managerNpcId]:undefined});
}

export function modelingAgencyAction(state:GameState,action:'seek'|'accept'|'decline'):EngineResult {
  const career=track(state);const world=activeSpecialCareerWorld(state,'modeling');
  if(action==='seek'){
    if(career.agencyContractActive===true)return{success:false,messages:[{text:'You already have active modeling representation.'}]};
    if(career.agencyOfferPending===true)return{success:false,messages:[{text:'You already have a modeling agency offer to review.'}]};
    if(!world||n(career,'jobs')<1)return{success:false,messages:[{text:'Land at least one modeling booking before seeking formal representation.'}]};
    const gate=consumeAction(state,{policy:'special.model.agency_seek'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
    const rng=createRng(`${state.seed}-model-agency-seek-${world.id}`,state.rngCounter);const relations=modelingRelationships(state,world);const profile=clamp(n(career,'technique',25)*.35+n(career,'reputation',20)*.2+state.character.stats.appearance*.15+relations.managerScore*.12+relations.chemistry*.08+Number(career.worldPrestige??50)*.1);
    const success=profile>=72||rng.chance(clamp(.25+profile/150,.35,.88));
    if(success)createAgencyOffer(state,career,world,'initial',rng);else state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You approached ${world.name} about representation, but they wanted a stronger booking record first.`,npcIds:relations.managerNpcId?[relations.managerNpcId]:undefined});
    state.rngCounter=rng.counter();return{success,messages:[{text:success?'A modeling representation offer is ready in Career Worlds.':'The agency passed for now. Build technique, reputation, and stronger industry relationships before trying again.'}]};
  }
  const offer=modelingAgencyOffer(state);if(!offer)return{success:false,messages:[{text:'You do not have an active modeling agency offer.'}]};
  const gate=consumeAction(state,{policy:'special.model.business'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};career.agencyOfferPending=false;
  if(action==='decline'){
    setN(career,'agencyOffersDeclined',n(career,'agencyOffersDeclined')+1);career.agencyStatus='unrepresented';
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You declined ${offer.agency}'s ${offer.kind==='renewal'?'renewal':'representation'} offer and remained independent.`});
    return{success:true,messages:[{text:`You declined ${offer.agency}'s offer.`}]};
  }
  career.agencyContractActive=true;career.agencyStatus='represented';career.agencyName=offer.agency;setN(career,'agencyContractYears',offer.years);setN(career,'agencyContractRemaining',offer.years);setN(career,'agencyCommission',offer.commission);setN(career,'agencyReach',offer.reach);setN(career,'agencySignedAge',state.character.age);setN(career,'agencyOffersAccepted',n(career,'agencyOffersAccepted')+1);if(offer.kind==='renewal')setN(career,'agencyRenewals',n(career,'agencyRenewals')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You signed a ${offer.years}-year ${offer.kind==='renewal'?'renewal':'representation'} agreement with ${offer.agency}.`});
  return{success:true,messages:[{text:`You signed with ${offer.agency}: ${Math.round(offer.commission*100)}% commission and a ${Math.round((offer.reach-1)*100)}% booking-reach boost.`}]};
}

function bookingKind(action:'audition'|'photoshoot'|'runway',rng:Rng):ModelingCampaignKind {
  if(action==='runway')return'runway';
  if(action==='photoshoot')return rng.chance(.7)?'commercial':'editorial';
  return rng.chance(.62)?'editorial':'commercial';
}

function bookingThreshold(action:'audition'|'photoshoot'|'runway'){return action==='runway'?61:action==='photoshoot'?46:49;}

function bookedPay(career:Track,kind:ModelingCampaignKind,score:number,rng:Rng){
  const base=kind==='runway'?rng.int(5000,42000):kind==='commercial'?rng.int(2500,26000):rng.int(900,9500);
  const scale=1+n(career,'reputation',20)/115+n(career,'jobs')/45;
  const reach=career.agencyContractActive===true?n(career,'agencyReach',1):1;
  return Math.round(clamp(base*scale*reach*(.82+score/150),400,260000));
}

function beginCampaign(state:GameState,career:Track,world:SocialWorld,kind:ModelingCampaignKind,action:'audition'|'photoshoot'|'runway',bookingScore:number,rng:Rng){
  const named=campaignTitle(state,career,kind,rng);const gross=bookedPay(career,kind,bookingScore,rng);const commissionRate=career.agencyContractActive===true?clamp(n(career,'agencyCommission',.18),0,.35):0;const commission=Math.round(gross*commissionRate);const netBooked=Math.max(0,gross-commission);const advance=Math.round(netBooked*.2);
  career.campaignActive=true;career.currentCampaignTitle=named.title;career.currentCampaignClient=named.client;career.currentCampaignKind=kind;career.currentCampaignSource=action;setN(career,'currentCampaignStartedAge',state.character.age);setN(career,'currentCampaignGross',gross);setN(career,'currentCampaignCommission',commission);setN(career,'currentCampaignAdvance',advance);setN(career,'currentCampaignBookingScore',bookingScore);setN(career,'campaignsStarted',n(career,'campaignsStarted')+1);
  state.finances.cash+=advance;setN(career,'careerEarnings',n(career,'careerEarnings')+advance);state.character.secondary.stress=clamp(state.character.secondary.stress+(kind==='runway'?3:2));
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You booked ${named.title}, a ${kind} campaign through ${world.name}. ${advance.toLocaleString()} was paid up front; the campaign resolves after you age up.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  return{title:named.title,kind,gross,advance};
}

export function modelingCareerAction(state:GameState,action:'lesson'|'audition'|'photoshoot'|'runway'):EngineResult {
  if(state.character.age<14)return{success:false,messages:[{text:'Professional modeling becomes available in the teen years.'}]};
  const career=track(state);
  if(action==='lesson'){
    const gate=consumeAction(state,{policy:'special.training',target:'modeling'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(career,'technique',clamp(n(career,'technique',25)+5));career.modelingPathway=true;return{success:true,messages:[{text:`You took a modeling lesson. Technique: ${Math.round(n(career,'technique'))}.`}]};
  }
  if(career.campaignActive===true)return{success:false,messages:[{text:'You already have a modeling campaign underway. Age up to complete it before booking another.'}]};
  const gate=consumeAction(state,[{policy:'special.model.total'},{policy:'special.model.kind',target:action}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-model-booking-${action}`,state.rngCounter);const existingWorld=activeSpecialCareerWorld(state,'modeling');const relations=existingWorld?modelingRelationships(state,existingWorld):{chemistry:50,campaignChemistry:50,managerScore:50,managerNpcId:undefined};const technique=n(career,'technique',25);const contractBoost=career.agencyContractActive===true?(n(career,'agencyReach',1)-1)*28:0;
  const bookingScore=clamp(state.character.stats.appearance*.38+technique*.31+state.character.secondary.charisma*.15+n(career,'reputation',20)*.08+relations.campaignChemistry*.05+relations.managerScore*.03+contractBoost+rng.int(-17,19));
  const success=bookingScore>=bookingThreshold(action);
  if(!success){setN(career,'technique',clamp(technique+1));state.rngCounter=rng.counter();return{success:false,messages:[{text:`You were considered for the ${action} booking, but did not land it.`}]};}
  career.active=true;career.modelingPathway=true;setN(career,'jobs',n(career,'jobs')+1);setN(career,'technique',clamp(technique+2));setN(career,'reputation',clamp(n(career,'reputation',20)+2));if(action==='runway')setN(career,'runwayCampaigns',n(career,'runwayCampaigns')+1);
  const firstJob=n(career,'jobs')===1;const world=ensureModelingWorld(state,firstJob);const kind=bookingKind(action,rng);const result=beginCampaign(state,career,world,kind,action,bookingScore,rng);state.rngCounter=rng.counter();return{success:true,messages:[{text:`You booked ${result.title}, a ${kind} campaign worth ${result.gross.toLocaleString()} before commission. The campaign resolves after you age up.`}]};
}

function finalizeCampaign(state:GameState,career:Track,world:SocialWorld,momentum:number,prestige:number,relationships:ReturnType<typeof modelingRelationships>,rng:Rng){
  if(career.campaignActive!==true||state.character.age<=n(career,'currentCampaignStartedAge',state.character.age))return;
  const kind=s(career,'currentCampaignKind','commercial') as ModelingCampaignKind;const startedAge=n(career,'currentCampaignStartedAge',state.character.age-1);const gross=n(career,'currentCampaignGross');const commission=n(career,'currentCampaignCommission');const advance=n(career,'currentCampaignAdvance');const netBooked=Math.max(0,gross-commission);const score=clamp(n(career,'technique',25)*.31+state.character.stats.appearance*.24+state.character.secondary.charisma*.11+momentum*.14+relationships.campaignChemistry*.08+relationships.managerScore*.05+prestige*.05+(100-state.character.secondary.stress)*.02+rng.int(-11,13));const bonus=score>=86?Math.round(netBooked*.2):score>=74?Math.round(netBooked*.08):0;const completionPay=Math.max(0,netBooked-advance)+bonus;const netTotal=netBooked+bonus;state.finances.cash+=completionPay;setN(career,'careerEarnings',n(career,'careerEarnings')+completionPay);setN(career,'agencyCommissionPaid',n(career,'agencyCommissionPaid')+commission);
  const repDelta=score>=88?8:score>=74?5:score>=58?3:score>=42?0:-3;setN(career,'reputation',clamp(n(career,'reputation',20)+repDelta));state.fame.fame=clamp(state.fame.fame+(score>=88?6:score>=74?3:score>=60?1:0));state.fame.followers+=Math.max(0,Math.round((kind==='runway'?1800:kind==='commercial'?900:450)*(score/100)));
  const pressureGain=(kind==='runway'?8:kind==='commercial'?5:3)+(score<45?4:0);setN(career,'imagePressure',clamp(n(career,'imagePressure')+pressureGain));setN(career,'campaignsCompleted',n(career,'campaignsCompleted')+1);if(score>=75)setN(career,'majorCampaigns',n(career,'majorCampaigns')+1);
  const entry={title:s(career,'currentCampaignTitle','Campaign'),client:s(career,'currentCampaignClient','client'),kind,startedAge,completedAge:state.character.age,score,reception:reception(score),grossPay:gross,netPay:netTotal};writeCampaignHistory(career,entry);career.lastCampaignTitle=entry.title;career.lastCampaignClient=entry.client;career.lastCampaignKind=kind;career.lastCampaignReception=entry.reception;setN(career,'lastCampaignAge',state.character.age);setN(career,'lastCampaignScore',score);setN(career,'bestCampaignScore',Math.max(n(career,'bestCampaignScore'),score));setN(career,'lastCampaignGross',gross);setN(career,'lastCampaignNet',netTotal);setN(career,'lastCampaignCommission',commission);setN(career,'lastCampaignBonus',bonus);career.campaignActive=false;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:score>=86?3:score>=68?2:1,text:`${entry.title} completed at ${Math.round(score)}/100 with ${entry.reception}: ${gross.toLocaleString()} gross pay, ${commission.toLocaleString()} agency commission, and ${netTotal.toLocaleString()} net compensation.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  if(career.agencyContractActive!==true&&career.agencyOfferPending!==true&&score>=72)createAgencyOffer(state,career,world,'initial',rng);
}

function processAgencyContract(state:GameState,career:Track,world:SocialWorld,momentum:number,relationships:ReturnType<typeof modelingRelationships>,rng:Rng){
  let offerExpiredThisPass=false;
  if(career.agencyOfferPending===true&&state.character.age>n(career,'agencyOfferExpiresAge',state.character.age)){career.agencyOfferPending=false;setN(career,'agencyOffersExpired',n(career,'agencyOffersExpired')+1);offerExpiredThisPass=true;}
  if(career.agencyContractActive===true&&state.character.age>n(career,'agencySignedAge',state.character.age)&&n(career,'lastAgencyContractAge',-1)!==state.character.age){
    setN(career,'lastAgencyContractAge',state.character.age);setN(career,'agencyContractRemaining',Math.max(0,n(career,'agencyContractRemaining')-1));
    if(n(career,'agencyContractRemaining')<=0){
      career.agencyContractActive=false;career.agencyStatus='unrepresented';setN(career,'agencyContractsCompleted',n(career,'agencyContractsCompleted')+1);
      const renewalScore=clamp(momentum*.38+n(career,'reputation',20)*.28+relationships.managerScore*.18+relationships.chemistry*.10+state.fame.fame*.06);
      if(renewalScore>=62){createAgencyOffer(state,career,world,'renewal',rng);career.agencyStatus='renewal pending';}
      else{setN(career,'agencyReleases',n(career,'agencyReleases')+1);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`Your representation term with ${s(career,'agencyName',world.name)} ended without a renewal. You remained connected to the modeling network but became unrepresented.`,npcIds:relationships.managerNpcId?[relationships.managerNpcId]:undefined});}
    }
  }
  if(!offerExpiredThisPass&&career.agencyContractActive!==true&&career.agencyOfferPending!==true&&n(career,'jobs')>=2&&n(career,'agencyOffersReceived')===0){createAgencyOffer(state,career,world,'initial',rng);}
}

export function processModelingCareerYear(state:GameState,career:Track,world:SocialWorld,context:{momentum:number;chemistry:number;rivalry:number;prestige:number},rng:Rng){
  if(n(career,'lastModelingCycleAge',-1)===state.character.age)return;setN(career,'lastModelingCycleAge',state.character.age);const relationships=modelingRelationships(state,world);setN(career,'agencyRelationship',relationships.managerScore);setN(career,'campaignChemistry',relationships.campaignChemistry);
  finalizeCampaign(state,career,world,context.momentum,context.prestige,relationships,rng);processAgencyContract(state,career,world,context.momentum,relationships,rng);
  const contractDemand=career.agencyContractActive===true?Math.max(0,(n(career,'agencyReach',1)-1)*70):0;const pressure=clamp(n(career,'imagePressure')*.55+state.character.secondary.stress*.18+Math.max(0,58-relationships.managerScore)*.45+context.rivalry*.08+contractDemand,0,100);setN(career,'industryPressure',pressure);setN(career,'imagePressure',clamp(n(career,'imagePressure')*.78+(career.campaignActive===true?4:0)));
  if(pressure>=75){state.character.secondary.stress=clamp(state.character.secondary.stress+2);state.character.stats.happiness=clamp(state.character.stats.happiness-1);if(pressure>=88&&rng.chance(.24))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`The pace and scrutiny around ${world.name} became exhausting. You felt pressure to protect your boundaries and recovery time.`,npcIds:relationships.managerNpcId?[relationships.managerNpcId]:undefined});}
}
