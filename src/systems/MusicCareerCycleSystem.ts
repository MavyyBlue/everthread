import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import type { EngineResult, GameState, SocialWorld } from '../types/game';
import { activeSpecialCareerWorld } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;
type Rng = ReturnType<typeof createRng>;
export type MusicReleaseKind = 'song' | 'album';
export type MusicTourScale = 'clubs' | 'theaters' | 'arenas';

export interface MusicCatalogEntry {
  slot: number;
  title: string;
  kind: MusicReleaseKind;
  launchAge: number;
  quality: number;
  launchStreams: number;
  lifetimeStreams: number;
  lastAnnualStreams: number;
  reception: string;
}

export interface MusicPartnershipOfferView {
  partner: string;
  advance: number;
  royaltyShare: number;
  reach: number;
  expiresAge: number;
  sourceRelease: string;
}

const SONG_TITLES = [
  'Neon Weather','Quiet Voltage','Paper Satellites','Afterimage','Low Orbit','Static Bloom','Borrowed Light','Glass Summer',
  'Midnight Receiver','Soft Collision','Second Signal','Blue Hour Drive','Northbound Static','Open Circuit','Half Awake','Slow Comet',
];
const ALBUM_TITLES = [
  'Rooms Without Clocks','North of Midnight','The Shape of Distance','Signals After Dark','Everything Between Stations','Soft Machinery',
  'A Map of Almost','Weather for Strangers','The Last Bright Place','Things We Left in Orbit','Ordinary Constellations','No Fixed Address',
];
const PARTNERS = ['Harborline Distribution','Violet Arc Music','Northglass Audio','Parallel House','Lumen Signal','Open Frame Records'];
const CATALOG_SLOTS = 6;

function n(record:Track,key:string,def=0){return typeof record[key]==='number'?record[key] as number:def;}
function s(record:Track,key:string,def=''){return typeof record[key]==='string'?record[key] as string:def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function track(state:GameState){return (state.specialCareers.music ??= {}) as Track;}
function readTrack(state:GameState){return (state.specialCareers.music ?? {}) as Track;}
function average(values:number[],fallback=50){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:fallback;}

function musicRelationships(state:GameState,world:SocialWorld){
  const active=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);
  const manager=active.find(member=>member.role==='leader');
  const creativeIds=new Set(world.groups.filter(group=>group.kind.includes(':creative')).flatMap(group=>group.memberNpcIds));
  const scores=active.map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  const creativeScores=active.filter(member=>creativeIds.has(member.npcId)).map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  const managerScore=manager?state.relationships.find(rel=>rel.npcId===manager.npcId)?.score??50:50;
  return {chemistry:clamp(average(scores,50)),creativeChemistry:clamp(average(creativeScores,average(scores,50))),managerScore:clamp(managerScore),managerNpcId:manager?.npcId};
}

function uniqueReleaseTitle(career:Track,kind:MusicReleaseKind,rng:Rng){
  const pool=kind==='album'?ALBUM_TITLES:SONG_TITLES;
  const used=new Set(musicCatalogFromTrack(career).map(entry=>entry.title));
  for(let tries=0;tries<pool.length*2;tries+=1){const title=rng.pick(pool);if(!used.has(title))return title;}
  return `${rng.pick(pool)} ${Math.max(2,n(career,'catalogCount')+1)}`;
}

function receptionFor(quality:number,streams:number,kind:MusicReleaseKind){
  const scale=kind==='album'?1.35:1;
  if(quality>=88&&streams>=180000*scale)return'breakout release';
  if(quality>=76)return'strong reception';
  if(quality>=58)return'solid reception';
  if(quality>=40)return'mixed reception';
  return'quiet release';
}

function catalogSlotKey(slot:number,key:string){return `catalog${slot}${key}`;}

function writeCatalogEntry(career:Track,entry:Omit<MusicCatalogEntry,'slot'>){
  const count=n(career,'catalogCount')+1;setN(career,'catalogCount',count);
  const slot=((count-1)%CATALOG_SLOTS)+1;
  career[catalogSlotKey(slot,'Title')]=entry.title;
  career[catalogSlotKey(slot,'Kind')]=entry.kind;
  career[catalogSlotKey(slot,'Reception')]=entry.reception;
  setN(career,catalogSlotKey(slot,'LaunchAge'),entry.launchAge);
  setN(career,catalogSlotKey(slot,'Quality'),entry.quality);
  setN(career,catalogSlotKey(slot,'LaunchStreams'),entry.launchStreams);
  setN(career,catalogSlotKey(slot,'LifetimeStreams'),entry.lifetimeStreams);
  setN(career,catalogSlotKey(slot,'LastAnnualStreams'),entry.lastAnnualStreams);
  setN(career,catalogSlotKey(slot,'LastProcessedAge'),entry.launchAge);
  return slot;
}

function musicCatalogFromTrack(career:Track):MusicCatalogEntry[]{
  const entries:MusicCatalogEntry[]=[];
  for(let slot=1;slot<=CATALOG_SLOTS;slot+=1){
    const title=s(career,catalogSlotKey(slot,'Title'));if(!title)continue;
    const kind=s(career,catalogSlotKey(slot,'Kind'),'song')==='album'?'album':'song';
    entries.push({slot,title,kind,launchAge:n(career,catalogSlotKey(slot,'LaunchAge')),
      quality:n(career,catalogSlotKey(slot,'Quality')),launchStreams:n(career,catalogSlotKey(slot,'LaunchStreams')),
      lifetimeStreams:n(career,catalogSlotKey(slot,'LifetimeStreams')),lastAnnualStreams:n(career,catalogSlotKey(slot,'LastAnnualStreams')),
      reception:s(career,catalogSlotKey(slot,'Reception'),'released')});
  }
  return entries.sort((a,b)=>b.launchAge-a.launchAge||b.slot-a.slot);
}

export function musicCatalog(state:GameState){return musicCatalogFromTrack(readTrack(state));}

export function musicPartnershipOffer(state:GameState):MusicPartnershipOfferView|undefined {
  const career=readTrack(state);if(career.partnershipOfferPending!==true)return;
  const expiresAge=n(career,'partnershipOfferExpiresAge',state.character.age);if(state.character.age>expiresAge)return;
  return {partner:s(career,'partnershipOfferPartner','distribution partner'),advance:n(career,'partnershipOfferAdvance'),royaltyShare:n(career,'partnershipOfferShare'),reach:n(career,'partnershipOfferReach',1),expiresAge,sourceRelease:s(career,'partnershipOfferSource','recent release')};
}

function maybeCreatePartnershipOffer(state:GameState,career:Track,title:string,quality:number,streams:number,rng:Rng){
  if(career.distributionPartner===true||career.partnershipOfferPending===true)return;
  const reputation=n(career,'reputation',30);const fanbase=n(career,'fanbase');
  if(quality<62||streams<15000)return;
  const chance=clamp(.04+(quality-58)/145+Math.min(40,reputation)/500+Math.min(150000,fanbase)/900000,.05,.68);
  if(!(quality>=88&&streams>=90000)&&!rng.chance(chance))return;
  const partner=rng.pick(PARTNERS);const advance=Math.round(clamp(streams*rng.int(7,18)/100+reputation*600,4000,275000));
  const share=rng.int(18,32)/100;const reach=rng.int(116,142)/100;
  career.partnershipOfferPending=true;career.partnershipOfferPartner=partner;career.partnershipOfferSource=title;
  setN(career,'partnershipOfferAdvance',advance);setN(career,'partnershipOfferShare',share);setN(career,'partnershipOfferReach',reach);setN(career,'partnershipOfferCreatedAge',state.character.age);setN(career,'partnershipOfferExpiresAge',state.character.age+1);setN(career,'partnershipOffersReceived',n(career,'partnershipOffersReceived')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`The response to ${title} brought a distribution partnership offer from ${partner}: ${advance.toLocaleString()} up front for broader reach and a ${Math.round(share*100)}% royalty share.`});
}

/** Launches a release immediately, then its catalog tail continues during later Age Ups. */
export function launchMusicRelease(state:GameState,career:Track,world:SocialWorld,kind:MusicReleaseKind,rng:Rng){
  const relationships=musicRelationships(state,world);const skill=n(career,'skill',state.character.talents.music*.35);const reputation=n(career,'reputation',25);const fanbase=n(career,'fanbase');
  const partnerReach=career.distributionPartner===true?n(career,'distributionReach',1.25):1;
  const partnerShare=career.distributionPartner===true?n(career,'distributionShare',.24):0;
  const quality=clamp(skill*.46+state.character.secondary.creativity*.26+reputation*.10+relationships.creativeChemistry*.09+relationships.managerScore*.04+state.fame.fame*.05+rng.int(-12,14));
  const audienceFactor=1+Math.min(2.4,fanbase/90000)+state.fame.fame/48;
  const streams=Math.max(75,Math.round(quality*quality*(kind==='album'?28:10)*audienceFactor*partnerReach*rng.int(82,122)/100));
  const grossRoyalty=streams*.004;const royalties=Math.round(grossRoyalty*(1-partnerShare));
  const title=uniqueReleaseTitle(career,kind,rng);const reception=receptionFor(quality,streams,kind);
  const fanGain=Math.max(5,Math.round(streams*(kind==='album'?.032:.023)*(0.75+quality/180)));
  state.finances.cash+=royalties;setN(career,kind==='album'?'albumsReleased':'songsReleased',n(career,kind==='album'?'albumsReleased':'songsReleased')+1);setN(career,'fanbase',Math.max(0,fanbase+fanGain));setN(career,'catalogLifetimeStreams',n(career,'catalogLifetimeStreams')+streams);setN(career,'catalogRoyalties',n(career,'catalogRoyalties')+royalties);setN(career,'lastReleaseAge',state.character.age);setN(career,'lastReleaseQuality',quality);setN(career,'lastReleaseStreams',streams);setN(career,'lastReleaseRoyalties',royalties);setN(career,'releaseMomentum',clamp(quality*.72+Math.min(100,Math.log10(Math.max(10,streams))*14)*.28));
  career.lastReleaseTitle=title;career.lastReleaseKind=kind;career.lastReleaseReception=reception;
  state.fame.followers+=Math.round(streams*.018);state.fame.fame=clamp(state.fame.fame+(quality>=88?(kind==='album'?7:5):quality>=70?2:quality>=55?1:0));
  writeCatalogEntry(career,{title,kind,launchAge:state.character.age,quality,launchStreams:streams,lifetimeStreams:streams,lastAnnualStreams:streams,reception});
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:quality>=88?3:quality>=72?2:1,text:`You released ${kind==='album'?'the album':'the single'} ${title} through ${world.name}. It launched with ${streams.toLocaleString()} streams, ${reception}, and ${royalties.toLocaleString()} in royalties.`});
  maybeCreatePartnershipOffer(state,career,title,quality,streams,rng);
  return {title,quality,streams,royalties,reception,fanGain};
}

function chooseTourScale(career:Track):MusicTourScale {
  const fanbase=n(career,'fanbase');
  if(fanbase>=180000)return'arenas';
  if(fanbase>=24000)return'theaters';
  return'clubs';
}

export function beginMusicTour(state:GameState,career:Track,world:SocialWorld,rng:Rng):EngineResult {
  if(career.tourActive===true)return{success:false,messages:[{text:'You already have a tour underway. Age up to complete it before starting another.'}]};
  const scale=chooseTourScale(career);const shows=scale==='arenas'?rng.int(16,30):scale==='theaters'?rng.int(12,24):rng.int(7,16);
  const name=`${s(career,'lastReleaseTitle',world.name)} Tour`;
  career.tourActive=true;career.currentTourScale=scale;career.currentTourName=name;setN(career,'currentTourShows',shows);setN(career,'currentTourStartedAge',state.character.age);setN(career,'toursStarted',n(career,'toursStarted')+1);
  state.character.secondary.stress=clamp(state.character.secondary.stress+3);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You announced the ${shows}-show ${name}, playing ${scale}. The tour will resolve after you age up.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  return{success:true,messages:[{text:`You launched a ${shows}-show ${scale} tour. Attendance, costs, fatigue, and career impact will resolve after you age up.`}]};
}

export function musicPartnershipDecision(state:GameState,action:'accept'|'decline'):EngineResult {
  const career=track(state);const offer=musicPartnershipOffer(state);if(!offer)return{success:false,messages:[{text:'You do not have an active music partnership offer.'}]};
  const gate=consumeAction(state,{policy:'special.music_business'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  career.partnershipOfferPending=false;
  if(action==='decline'){
    setN(career,'partnershipOffersDeclined',n(career,'partnershipOffersDeclined')+1);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You declined the distribution partnership offer from ${offer.partner} and kept full control of future royalties.`});
    return{success:true,messages:[{text:`You declined ${offer.partner}'s offer.`}]};
  }
  career.distributionPartner=true;career.distributionPartnerName=offer.partner;setN(career,'distributionShare',offer.royaltyShare);setN(career,'distributionReach',offer.reach);setN(career,'distributionSignedAge',state.character.age);setN(career,'partnershipOffersAccepted',n(career,'partnershipOffersAccepted')+1);state.finances.cash+=offer.advance;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You signed with ${offer.partner}, receiving ${offer.advance.toLocaleString()} up front. Future releases gain broader reach while ${Math.round(offer.royaltyShare*100)}% of royalties go to the partner.`});
  return{success:true,messages:[{text:`You accepted ${offer.partner}'s distribution partnership and received ${offer.advance.toLocaleString()} up front.`}]};
}

function processCatalogTail(state:GameState,career:Track,momentum:number,chemistry:number){
  let totalTailStreams=0;let totalTailRoyalties=0;
  const reach=career.distributionPartner===true?n(career,'distributionReach',1.25):1;const share=career.distributionPartner===true?n(career,'distributionShare',.24):0;
  for(const entry of musicCatalogFromTrack(career)){
    const years=state.character.age-entry.launchAge;if(years<1||years>3)continue;
    const processedAge=n(career,catalogSlotKey(entry.slot,'LastProcessedAge'),entry.launchAge);if(processedAge===state.character.age)continue;
    const decay=years===1?.42:years===2?.19:.08;
    const support=clamp(.72+momentum/220+chemistry/500+state.fame.fame/650,.65,1.55);
    const streams=Math.max(20,Math.round(entry.launchStreams*decay*support*reach));
    const royalties=Math.round(streams*.004*(1-share));
    setN(career,catalogSlotKey(entry.slot,'LastProcessedAge'),state.character.age);setN(career,catalogSlotKey(entry.slot,'LastAnnualStreams'),streams);setN(career,catalogSlotKey(entry.slot,'LifetimeStreams'),entry.lifetimeStreams+streams);
    totalTailStreams+=streams;totalTailRoyalties+=royalties;
  }
  if(totalTailStreams>0){
    state.finances.cash+=totalTailRoyalties;setN(career,'catalogLifetimeStreams',n(career,'catalogLifetimeStreams')+totalTailStreams);setN(career,'catalogRoyalties',n(career,'catalogRoyalties')+totalTailRoyalties);setN(career,'lastCatalogTailStreams',totalTailStreams);setN(career,'lastCatalogTailRoyalties',totalTailRoyalties);setN(career,'fanbase',n(career,'fanbase')+Math.round(totalTailStreams*.006));state.fame.followers+=Math.round(totalTailStreams*.004);
  }else{setN(career,'lastCatalogTailStreams',0);setN(career,'lastCatalogTailRoyalties',0);}
  return totalTailStreams;
}

function finalizeMusicTour(state:GameState,career:Track,world:SocialWorld,momentum:number,relationships:ReturnType<typeof musicRelationships>,rng:Rng){
  if(career.tourActive!==true||state.character.age<=n(career,'currentTourStartedAge',state.character.age))return;
  const scale=(s(career,'currentTourScale','clubs') as MusicTourScale);const shows=Math.max(1,Math.round(n(career,'currentTourShows',8)));const fanbase=n(career,'fanbase');
  const profile=scale==='arenas'?{capacity:15000,ticket:105,cost:185000,difficulty:.17}:scale==='theaters'?{capacity:3600,ticket:72,cost:47000,difficulty:.09}:{capacity:850,ticket:44,cost:9000,difficulty:.02};
  const performance=clamp(n(career,'skill',45)*.28+momentum*.25+relationships.creativeChemistry*.15+relationships.managerScore*.09+state.fame.fame*.08+state.health.fitness*.08+(100-state.character.secondary.stress)*.07+rng.int(-11,12));
  const draw=clamp(.23+performance/180+Math.log10(Math.max(100,fanbase))/12+(career.distributionPartner===true?n(career,'distributionReach',1.2)-1:0)*.22-profile.difficulty,.18,.98);
  const attendance=Math.round(shows*profile.capacity*draw);const gross=Math.round(attendance*profile.ticket);const costs=Math.round(shows*profile.cost*state.economy.inflationIndex);const net=gross-costs;
  state.finances.cash+=net;const fanDelta=Math.max(0,Math.round(attendance*.018*(.6+performance/120)));setN(career,'fanbase',Math.max(0,fanbase+fanDelta));state.fame.followers+=Math.round(attendance*.012);state.fame.fame=clamp(state.fame.fame+(performance>=85?6:performance>=70?3:performance>=55?1:0));
  const fatigue=clamp(shows*.65+state.character.secondary.stress*.22-state.health.fitness*.12,3,38);state.character.secondary.stress=clamp(state.character.secondary.stress+fatigue*.45);if(fatigue>24)state.health.fitness=clamp(state.health.fitness-2);
  career.tourActive=false;career.lastTourName=s(career,'currentTourName','Tour');career.lastTourScale=scale;setN(career,'lastTourShows',shows);setN(career,'lastTourScore',performance);setN(career,'lastTourAttendance',attendance);setN(career,'lastTourGross',gross);setN(career,'lastTourCosts',costs);setN(career,'lastTourNet',net);setN(career,'lastTourFanGain',fanDelta);setN(career,'lastTourFatigue',fatigue);setN(career,'lastTourAge',state.character.age);setN(career,'toursCompleted',n(career,'toursCompleted')+1);setN(career,'bestTourScore',Math.max(n(career,'bestTourScore'),performance));setN(career,'touringGross',n(career,'touringGross')+gross);setN(career,'touringNet',n(career,'touringNet')+net);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:performance>=84?3:performance>=68?2:1,text:`${s(career,'lastTourName')} finished at ${Math.round(performance)}/100: ${attendance.toLocaleString()} attendance, ${gross.toLocaleString()} gross, ${costs.toLocaleString()} costs, and ${net.toLocaleString()} net.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
}

/** Annual music lifecycle. Runs after the shared career ecosystem has calculated momentum. */
export function processMusicCareerYear(state:GameState){
  const career=state.specialCareers.music as Track|undefined;if(!career?.active)return;
  if(n(career,'lastMusicCycleAge',-1)===state.character.age)return;setN(career,'lastMusicCycleAge',state.character.age);
  const world=activeSpecialCareerWorld(state,'music');if(!world)return;
  const relationships=musicRelationships(state,world);const momentum=clamp(n(career,'careerMomentum',50));const rng=createRng(`${state.seed}-music-cycle-${world.id}-${state.currentYear}`);
  const pressure=clamp((60-relationships.managerScore)*1.1+Math.max(0,55-relationships.creativeChemistry)*.45+state.character.secondary.stress*.13,0,100);setN(career,'managementPressure',pressure);setN(career,'creativeChemistry',relationships.creativeChemistry);setN(career,'managerRelationship',relationships.managerScore);
  const tailStreams=processCatalogTail(state,career,momentum,relationships.creativeChemistry);
  finalizeMusicTour(state,career,world,momentum,relationships,rng);
  if(career.partnershipOfferPending===true&&state.character.age>n(career,'partnershipOfferExpiresAge',state.character.age)){career.partnershipOfferPending=false;setN(career,'partnershipOffersExpired',n(career,'partnershipOffersExpired')+1);}
  const releasedRecently=n(career,'lastReleaseAge',-99)>=state.character.age-1;
  if(!releasedRecently&&tailStreams<Math.max(250,n(career,'fanbase')*.04)){
    const decline=Math.round(n(career,'fanbase')*clamp(.008+(55-momentum)/2200,.005,.045));setN(career,'fanbase',Math.max(0,n(career,'fanbase')-decline));setN(career,'lastFanbaseDrift',-decline);
  }else setN(career,'lastFanbaseDrift',Math.round(tailStreams*.006));
  if(pressure>=72){state.character.secondary.stress=clamp(state.character.secondary.stress+2);if(rng.chance(.28))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`Pressure around ${world.name} increased as management pushed for stronger momentum and better collaboration.`,npcIds:relationships.managerNpcId?[relationships.managerNpcId]:undefined});}
}
