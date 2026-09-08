import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import type { createRng } from '../core/rng';
import type { EngineResult, GameState, SocialWorld } from '../types/game';
import { activeSpecialCareerWorld, archiveSpecialCareerWorld } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;
type Rng = ReturnType<typeof createRng>;

export interface SportsSeasonContext {
  momentum: number;
  chemistry: number;
  rivalry: number;
  prestige: number;
}

export interface SportsContractOfferView {
  team: string;
  years: number;
  salary: number;
  expiresAge: number;
}

type SportProfile = {
  appearances: number;
  teamSport: boolean;
  unit: string;
};

const SPORT_PROFILES: Record<string, SportProfile> = {
  'American football': { appearances: 17, teamSport: true, unit: 'games' },
  Basketball: { appearances: 82, teamSport: true, unit: 'games' },
  Baseball: { appearances: 162, teamSport: true, unit: 'games' },
  Soccer: { appearances: 34, teamSport: true, unit: 'matches' },
  Hockey: { appearances: 82, teamSport: true, unit: 'games' },
  Tennis: { appearances: 22, teamSport: false, unit: 'events' },
  Golf: { appearances: 20, teamSport: false, unit: 'events' },
  Volleyball: { appearances: 30, teamSport: true, unit: 'matches' },
};

function n(record:Track,key:string,def=0){return typeof record[key]==='number'?record[key] as number:def;}
function s(record:Track,key:string,def=''){return typeof record[key]==='string'?record[key] as string:def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function sportsTrack(state:GameState){return (state.specialCareers.sports??={}) as Track;}

function profileFor(career:Track):SportProfile {
  return SPORT_PROFILES[String(career.sport??'')] ?? {appearances:30,teamSport:true,unit:'games'};
}

function leaderRelationship(state:GameState,world:SocialWorld){
  const leader=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive);
  return leader?state.relationships.find(rel=>rel.npcId===leader.npcId):undefined;
}

function rivalRelationship(state:GameState,career:Track){
  const rivalId=typeof career.rivalNpcId==='string'?career.rivalNpcId:undefined;
  return rivalId?state.relationships.find(rel=>rel.npcId===rivalId):undefined;
}

function addSeasonTimeline(state:GameState,world:SocialWorld,career:Track,score:number,record:string,outcome:string,injuryText:string){
  const championship=career.seasonChampion===true;
  state.timeline.push({
    id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:championship?3:score>=76?2:1,
    text:`Your season with ${world.name} finished at ${Math.round(score)}/100: ${record}. ${outcome}${injuryText?` ${injuryText}`:''}`,
  });
}

function processSeasonResult(state:GameState,career:Track,world:SocialWorld,context:SportsSeasonContext,rng:Rng){
  const profile=profileFor(career);
  const skill=n(career,'skill',45);
  const fitness=clamp(n(career,'fitness',state.health.fitness));
  const agePenalty=Math.min(16,Math.max(0,state.character.age-33)*.85);
  let score=clamp(context.momentum*.44+skill*.20+fitness*.18+context.chemistry*.08+context.prestige*.06+(100-state.character.secondary.stress)*.04-agePenalty+rng.int(-11,11));

  const injuryChance=clamp(.025+Math.max(0,68-fitness)/750+Math.max(0,state.character.secondary.stress-65)/1200+Math.max(0,state.character.age-34)/210,.02,.22);
  let missed=0;let injuryText='';
  if(rng.chance(injuryChance)){
    missed=Math.max(1,Math.round(profile.appearances*rng.int(5,22)/100));
    const healthHit=rng.int(1,6);const fitnessHit=rng.int(2,8);
    score=clamp(score-rng.int(4,12));
    state.character.stats.health=clamp(state.character.stats.health-healthHit);
    state.health.fitness=clamp(state.health.fitness-fitnessHit);
    setN(career,'fitness',clamp(fitness-fitnessHit));
    setN(career,'injurySeasons',n(career,'injurySeasons')+1);
    career.seasonInjury=true;
    injuryText=`Physical trouble cost you ${missed} ${profile.unit}.`;
  }else{
    career.seasonInjury=false;
    setN(career,'fitness',clamp(fitness+(score>=72?1:0)));
  }

  const played=Math.max(1,profile.appearances-missed);
  let successes=0;let record='';let outcome='';let champion=false;
  if(profile.teamSport){
    const winRate=clamp(.16+score/160+rng.int(-7,7)/100,.08,.90);
    successes=Math.max(0,Math.min(played,Math.round(played*winRate)));
    const losses=Math.max(0,played-successes);
    record=`${successes}-${losses}`;
    if(score>=82&&rng.chance(clamp(.26+(score-82)/55,.26,.62))){champion=true;outcome='You finished the year as league champions.';}
    else if(score>=72)outcome='You made a deep postseason run.';
    else if(score>=58)outcome='You reached the postseason.';
    else outcome='You missed the postseason.';
  }else{
    const winRate=clamp((score-48)/185+rng.int(-3,3)/100,0,.34);
    successes=Math.max(0,Math.min(played,Math.round(played*winRate)));
    record=`${successes} wins in ${played} ${profile.unit}`;
    if(score>=84&&successes>=2&&rng.chance(clamp(.22+(score-84)/50,.22,.58))){champion=true;outcome='You captured the season-ending circuit crown.';}
    else if(score>=72)outcome='You produced multiple elite finishes.';
    else if(score>=56)outcome='You completed a competitive circuit season.';
    else outcome='You endured a difficult circuit season.';
  }

  const recognition=score>=76&&rng.chance(clamp(.18+(score-76)/55,.18,.52));
  career.seasonChampion=champion;
  career.seasonRecognized=recognition;
  career.seasonRecord=record;
  career.seasonOutcome=outcome;
  setN(career,'seasonAppearances',played);
  setN(career,'seasonSuccesses',successes);
  setN(career,'lastSeasonScore',score);
  setN(career,'bestSeasonScore',Math.max(n(career,'bestSeasonScore'),score));
  setN(career,'seasonsPlayed',n(career,'seasonsPlayed')+1);
  setN(career,'careerAppearances',n(career,'careerAppearances')+played);
  setN(career,'careerSuccesses',n(career,'careerSuccesses')+successes);
  setN(career,'lastSeasonAge',state.character.age);
  setN(career,'seasonSalaryDue',Math.max(0,n(career,'salary')));
  if(champion)setN(career,'championships',n(career,'championships')+1);
  if(recognition)setN(career,'seasonHonors',n(career,'seasonHonors')+1);

  const leaderRel=leaderRelationship(state,world);
  if(leaderRel)leaderRel.score=clamp(leaderRel.score+(score>=75?2:score<42?-2:0));
  const rivalRel=rivalRelationship(state,career);
  if(rivalRel&&champion)rivalRel.score=clamp(rivalRel.score-3);
  for(const group of world.groups){
    if(group.kind.includes(':team')||group.kind.includes(':race_team'))group.prestige=clamp(group.prestige+(score>=78?2:score<42?-2:score>=62?1:0));
  }
  state.character.secondary.stress=clamp(state.character.secondary.stress+(played>60?2:1));
  addSeasonTimeline(state,world,career,score,record,outcome,injuryText);
  return score;
}

function shouldRetire(state:GameState,career:Track,rng:Rng){
  const age=state.character.age;const fitness=n(career,'fitness',state.health.fitness);
  if(age>=48)return true;
  if(age<40)return false;
  const pressure=clamp((age-39)*.045+Math.max(0,58-fitness)/180+(career.seasonInjury===true ? .035 : 0),.03,.62);
  return rng.chance(pressure);
}

function retireFromSports(state:GameState,career:Track,world:SocialWorld){
  career.active=false;career.pro=false;career.freeAgent=false;career.retired=true;career.renewalOfferPending=false;
  setN(career,'retirementAge',state.character.age);setN(career,'contractRemaining',0);
  archiveSpecialCareerWorld(world,state.character.age);
  state.timeline.push({
    id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,
    text:`You retired from professional ${String(career.sport??'sports')} after ${Math.round(n(career,'seasonsPlayed'))} season${n(career,'seasonsPlayed')===1?'':'s'}.`,
  });
}

function createRenewalOffer(state:GameState,career:Track,world:SocialWorld,seasonScore:number,rng:Rng){
  const maxYears=state.character.age>=38?2:4;const years=rng.int(1,maxYears);const current=Math.max(50000,n(career,'salary',80000));const performanceFactor=.88+seasonScore/260+state.fame.fame/900;const salary=Math.round(clamp(current*performanceFactor*rng.int(94,112)/100,60000,7500000));career.renewalOfferPending=true;career.renewalOfferTeam=world.name;setN(career,'renewalOfferYears',years);setN(career,'renewalOfferSalary',salary);setN(career,'renewalOfferCreatedAge',state.character.age);setN(career,'renewalOfferExpiresAge',state.character.age+1);career.pro=false;career.freeAgent=false;setN(career,'contractRemaining',0);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`${world.name} offered you a ${years}-year renewal at ${salary.toLocaleString()} per year. The decision is yours.`});
}

function resolveContract(state:GameState,career:Track,world:SocialWorld,seasonScore:number,context:SportsSeasonContext,rng:Rng){
  let remaining=n(career,'contractRemaining',Math.max(1,n(career,'contractYears',1)));
  remaining=Math.max(0,remaining-1);setN(career,'contractRemaining',remaining);

  // Hard retirement remains an involuntary career end-state and is intentionally allowed to supersede a live term.
  if(shouldRetire(state,career,rng)){retireFromSports(state,career,world);return;}
  if(remaining>0)return;

  const agePenalty=Math.max(0,state.character.age-35)*2.2;
  const renewalChance=clamp(10+seasonScore*.48+context.momentum*.17+n(career,'reputation',45)*.14+context.chemistry*.08+n(career,'fitness',70)*.08-agePenalty,8,93)/100;
  if(rng.chance(renewalChance)){createRenewalOffer(state,career,world,seasonScore,rng);}
  else{
    career.pro=false;career.freeAgent=true;setN(career,'releasedAge',state.character.age);setN(career,'contractRemaining',0);
    archiveSpecialCareerWorld(world,state.character.age);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`${world.name} did not renew your contract after the season. You entered free agency.`});
  }
}

export function sportsContractOffer(state:GameState):SportsContractOfferView|undefined{
  const career=sportsTrack(state);if(career.renewalOfferPending!==true)return;const expiresAge=n(career,'renewalOfferExpiresAge',state.character.age);if(state.character.age>expiresAge)return;return{team:s(career,'renewalOfferTeam','current team'),years:Math.max(1,Math.round(n(career,'renewalOfferYears',1))),salary:Math.max(0,Math.round(n(career,'renewalOfferSalary'))),expiresAge};
}

export function expireSportsContractOffer(state:GameState){
  const career=sportsTrack(state);if(career.renewalOfferPending!==true)return;const expiresAge=n(career,'renewalOfferExpiresAge',state.character.age);if(state.character.age<=expiresAge)return;const world=activeSpecialCareerWorld(state,'sports');career.renewalOfferPending=false;career.pro=false;career.freeAgent=true;setN(career,'contractRemaining',0);if(world)archiveSpecialCareerWorld(world,state.character.age);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`Your renewal opportunity with ${s(career,'renewalOfferTeam',world?.name??'your team')} expired. You entered free agency.`});
}

export function sportsContractDecision(state:GameState,action:'accept'|'decline'):EngineResult{
  const offer=sportsContractOffer(state);if(!offer)return{success:false,messages:[{text:'There is no current professional sports renewal offer to review.'}]};const career=sportsTrack(state);const world=activeSpecialCareerWorld(state,'sports');
  if(action==='accept'&&!world)return{success:false,messages:[{text:'The team attached to that renewal could not be resolved. The offer remains pending so your career history is not mutated.'}]};
  const gate=consumeAction(state,{policy:'special.pro_contract'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};career.renewalOfferPending=false;
  if(action==='decline'){career.pro=false;career.freeAgent=true;setN(career,'contractRemaining',0);if(world)archiveSpecialCareerWorld(world,state.character.age);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You declined ${offer.team}'s renewal and entered professional sports free agency.`});return{success:true,messages:[{text:'You declined the renewal and entered free agency.'}]};}
  career.active=true;career.pro=true;career.freeAgent=false;career.leftPath=false;setN(career,'contractYears',offer.years);setN(career,'contractRemaining',offer.years);setN(career,'salary',offer.salary);setN(career,'contractSignedAge',state.character.age);setN(career,'contractRenewals',n(career,'contractRenewals')+1);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You accepted ${offer.team}'s ${offer.years}-year renewal at ${offer.salary.toLocaleString()} per year.`});return{success:true,messages:[{text:`You accepted the ${offer.years}-year renewal with ${offer.team}.`}]};
}

/** Resolves exactly one professional season for the current age, then contract/retirement state. */
export function processSportsSeasonYear(state:GameState,career:Track,world:SocialWorld,context:SportsSeasonContext,rng:Rng){
  if(career.pro!==true||career.retired===true)return;
  if(n(career,'lastSeasonAge',-1)===state.character.age)return;
  const score=processSeasonResult(state,career,world,context,rng);
  resolveContract(state,career,world,score,context,rng);
}
