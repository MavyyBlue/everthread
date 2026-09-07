import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import type { createRng } from '../core/rng';
import type { GameState, SocialWorld } from '../types/game';

type Track = Record<string, number | string | boolean>;
type Rng = ReturnType<typeof createRng>;
export type ScreenCareerKind = 'acting' | 'directing';

export interface ScreenCareerOfferView {
  kind: ScreenCareerKind;
  expiresAge: number;
  sourceProject: string;
  role?: string;
  pay?: number;
  budget?: number;
  fee?: number;
}

function n(record:Track,key:string,def=0){return typeof record[key]==='number'?record[key] as number:def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function s(record:Track,key:string,def=''){return typeof record[key]==='string'?record[key] as string:def;}

function track(state:GameState,kind:ScreenCareerKind):Track {
  return (state.specialCareers[kind] ??= {}) as Track;
}

export function screenCareerOffer(state:GameState,kind:ScreenCareerKind):ScreenCareerOfferView|undefined {
  const career=track(state,kind);
  if(career.offerPending!==true)return;
  const expiresAge=n(career,'offerExpiresAge',state.character.age);
  if(state.character.age>expiresAge)return;
  if(kind==='acting')return{kind,expiresAge,sourceProject:s(career,'offerFromProject','recent work'),role:s(career,'offerRole','supporting'),pay:n(career,'offerPay')};
  return{kind,expiresAge,sourceProject:s(career,'offerFromProject','recent work'),budget:n(career,'offerBudget'),fee:n(career,'offerFee')};
}

function clearOffer(career:Track){
  career.offerPending=false;
  career.offerAccepted=false;
}

export function expireScreenCareerOffers(state:GameState){
  for(const kind of ['acting','directing'] as const){
    const career=track(state,kind);
    if(career.offerPending!==true)continue;
    const expires=n(career,'offerExpiresAge',state.character.age);
    if(state.character.age<=expires)continue;
    career.offerPending=false;
    setN(career,'offersExpired',n(career,'offersExpired')+1);
  }
}

export function beginActingProject(state:GameState,career:Track,world:SocialWorld,role:string,pay:number,source:'audition'|'offer'){
  career.active=true;
  career.currentProjectActive=true;
  career.currentProjectWorldId=world.id;
  career.currentProjectName=world.name;
  career.currentProjectRole=role;
  career.currentProjectSource=source;
  setN(career,'currentProjectPay',pay);
  setN(career,'currentProjectStartedAge',state.character.age);
  if(source==='offer'){
    clearOffer(career);
    career.offerAccepted=true;
    setN(career,'offersAccepted',n(career,'offersAccepted')+1);
  }
}

export function beginDirectingProject(state:GameState,career:Track,world:SocialWorld,budget:number,stake:number,fee:number,source:'self-backed'|'studio-offer'){
  career.active=true;
  career.currentProjectActive=true;
  career.currentProjectWorldId=world.id;
  career.currentProjectName=world.name;
  career.currentProjectSource=source;
  setN(career,'currentProjectBudget',budget);
  setN(career,'currentProjectStake',stake);
  setN(career,'currentProjectFee',fee);
  setN(career,'currentProjectStartedAge',state.character.age);
  if(source==='studio-offer'){
    clearOffer(career);
    career.offerAccepted=true;
    setN(career,'offersAccepted',n(career,'offersAccepted')+1);
  }
}

function actingReception(score:number){
  if(score>=88)return'breakout reception';
  if(score>=72)return'strong reviews';
  if(score>=52)return'mixed-to-positive reception';
  if(score>=35)return'mixed reception';
  return'poor reception';
}

function directingReception(score:number,box:number,budget:number){
  if(score>=86&&box>=budget*1.5)return'critical and commercial breakout';
  if(score>=72&&box>=budget)return'strong release';
  if(box>=budget)return'commercial success with mixed reviews';
  if(score>=62)return'well-reviewed but financially soft release';
  return'difficult release';
}

function actingOffer(state:GameState,career:Track,world:SocialWorld,score:number,rng:Rng){
  if(score<54)return;
  const reputation=n(career,'reputation',35);const agent=n(career,'agent');
  const chance=clamp(.06+(score-50)/115+reputation/420+agent*.05,.08,.78);
  if(score<88&&!rng.chance(chance))return;
  const role=rng.weighted([
    {item:'supporting',weight:Math.max(15,78-score)},
    {item:'lead',weight:Math.max(6,score-61)},
  ]);
  const base=role==='lead'?52000:14000;
  const pay=Math.round(base*(1+state.fame.fame/55+reputation/180)*rng.int(88,168)/100);
  career.offerPending=true;
  career.offerRole=role;
  career.offerFromProject=world.name;
  setN(career,'offerPay',pay);
  setN(career,'offerCreatedAge',state.character.age);
  setN(career,'offerExpiresAge',state.character.age+1);
  setN(career,'offersReceived',n(career,'offersReceived')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`After ${world.name}, you received an offer for a ${role} role paying ${pay.toLocaleString()}.`});
}

function directingOffer(state:GameState,career:Track,world:SocialWorld,score:number,box:number,budget:number,rng:Rng){
  if(score<58||box<budget*.72)return;
  const reputation=n(career,'reputation',38);
  const chance=clamp(.05+(score-54)/125+reputation/450+Math.min(20,state.fame.fame)/160,.07,.72);
  if(!(score>=88&&box>=budget*1.25)&&!rng.chance(chance))return;
  const nextBudget=Math.round(clamp(budget*rng.int(90,175)/100,750000,80000000));
  const fee=Math.round(nextBudget*clamp(.021+score/4200,.023,.045));
  career.offerPending=true;
  career.offerFromProject=world.name;
  setN(career,'offerBudget',nextBudget);
  setN(career,'offerFee',fee);
  setN(career,'offerCreatedAge',state.character.age);
  // Directing uses a two-age action cooldown, so the offer survives long enough to become actionable.
  setN(career,'offerExpiresAge',state.character.age+2);
  setN(career,'offersReceived',n(career,'offersReceived')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`The release of ${world.name} led to a studio-backed directing offer with a ${nextBudget.toLocaleString()} budget.`});
}

function finalizeActing(state:GameState,career:Track,world:SocialWorld,score:number,rng:Rng){
  const role=s(career,'currentProjectRole','supporting');
  const pay=n(career,'currentProjectPay');
  const reception=actingReception(score);
  const bonus=score>=68?Math.round(pay*clamp((score-58)/115,.08,.42)):0;
  if(bonus>0)state.finances.cash+=bonus;
  const repDelta=score>=88?7:score>=72?4:score>=55?1:score<35?-3:0;
  const fameDelta=score>=88?6:score>=74?3:score>=60?1:0;
  setN(career,'reputation',clamp(n(career,'reputation',30)+repDelta));
  state.fame.fame=clamp(state.fame.fame+fameDelta);
  career.currentProjectActive=false;
  career.lastProjectName=world.name;
  career.lastProjectRole=role;
  career.lastProjectReception=reception;
  setN(career,'lastProjectReleaseAge',state.character.age);
  setN(career,'lastProjectPay',pay);
  setN(career,'lastProjectBonus',bonus);
  state.timeline.push({
    id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:score>=88?3:score>=72?2:1,
    text:`${world.name} released to ${reception}. Your ${role} performance scored ${Math.round(score)}/100.${bonus?` You earned a ${bonus.toLocaleString()} performance bonus.`:''}`,
  });
  actingOffer(state,career,world,score,rng);
}

function finalizeDirecting(state:GameState,career:Track,world:SocialWorld,score:number,rng:Rng){
  const budget=Math.max(1,n(career,'currentProjectBudget',1500000));
  const fee=n(career,'currentProjectFee',Math.round(budget*.025));
  const marketing=budget*.18;
  const box=Math.max(0,Math.round(budget*(.25+score/60)*rng.int(55,145)/100+marketing*rng.int(1,4)));
  const profitable=box>=budget;
  const reception=directingReception(score,box,budget);
  const bonus=box>=budget*1.5?Math.round(fee*clamp((box/budget-1)*.22,.12,.65)):0;
  if(bonus>0)state.finances.cash+=bonus;
  setN(career,'boxOfficeBest',Math.max(n(career,'boxOfficeBest'),box));
  setN(career,'lastBoxOffice',box);
  setN(career,'lastProjectBudget',budget);
  setN(career,'lastProjectFee',fee);
  setN(career,'lastProjectBonus',bonus);
  setN(career,profitable?'profitableFilms':'flops',n(career,profitable?'profitableFilms':'flops')+1);
  setN(career,'reputation',clamp(n(career,'reputation',35)+(score>=84?6:score>=68?3:profitable?1:score<38?-3:0)));
  state.fame.fame=clamp(state.fame.fame+(box>budget*2?8:box>budget?3:score>=78?1:0));
  career.currentProjectActive=false;
  career.lastProjectName=world.name;
  career.lastProjectReception=reception;
  setN(career,'lastProjectReleaseAge',state.character.age);
  state.timeline.push({
    id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:box>=budget*1.5||score>=86?3:profitable||score>=70?2:1,
    text:`${world.name} released with ${reception}: impact ${Math.round(score)}/100, box office ${box.toLocaleString()} on a ${budget.toLocaleString()} budget.${bonus?` Your performance bonus was ${bonus.toLocaleString()}.`:''}`,
  });
  directingOffer(state,career,world,score,box,budget,rng);
}

/** Adds path-specific release economics/history after the shared project-impact score is resolved. */
export function finalizeScreenCareerProject(state:GameState,kind:ScreenCareerKind,career:Track,world:SocialWorld,score:number,rng:Rng){
  if(kind==='acting')finalizeActing(state,career,world,score,rng);
  else finalizeDirecting(state,career,world,score,rng);
}
