import type { EngineResult, GameState } from '../types/game';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import { activeSpecialCareerWorld, ensureSpecialCareerWorld, processSpecialCareerWorldsYear } from './SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships, processSpecialCareerEcosystemsYear } from './SpecialCareerEcosystemSystem';
import { beginActingProject, beginDirectingProject, screenCareerOffer } from './ScreenCareerCycleSystem';
import { beginMusicTour, launchMusicRelease, musicPartnershipDecision, processMusicCareerYear } from './MusicCareerCycleSystem';
import { processCombatCareerYear, takeCombatFight, trainCombatCareer } from './CombatCareerWorldSystem';

type CareerTrack = Record<string, number | string | boolean>;
const track = (state:GameState,key:keyof GameState['specialCareers']) => (state.specialCareers[key] ??= {}) as CareerTrack;
const n = (r:CareerTrack,key:string,def=0) => typeof r[key]==='number' ? r[key] as number : def;
const setN=(r:CareerTrack,key:string,value:number)=>{r[key]=Math.round(value*100)/100;};

function careerWorld(state:GameState,kind:Parameters<typeof ensureSpecialCareerWorld>[1],context='',options:Parameters<typeof ensureSpecialCareerWorld>[3]={}):ReturnType<typeof ensureSpecialCareerWorld>{
  const world=ensureSpecialCareerWorld(state,kind,context,options);
  ensureSpecialCareerRelationships(state,world);
  return world;
}

export function processSpecialCareersYear(state:GameState){
  const rng=createRng(`${state.seed}-special`,state.rngCounter);
  for(const [key,raw] of Object.entries(state.specialCareers)){
    if(!raw)continue;const r=raw as CareerTrack;
    if(r.active===true){setN(r,'years',n(r,'years')+1);setN(r,'skill',clamp(n(r,'skill',20)+rng.int(-1,2)));setN(r,'reputation',clamp(n(r,'reputation',20)+rng.int(-2,3)));}
    if(key==='sports'&&r.active===true&&state.character.age>34){setN(r,'fitness',clamp(n(r,'fitness',70)-rng.int(1,4)));}
    if(key==='combat'&&r.active===true&&state.character.age>32){setN(r,'stamina',clamp(n(r,'stamina',70)-rng.int(1,3)));}
    if(key==='military'&&r.active===true&&rng.chance(.14)){setN(r,'rank',Math.min(10,n(r,'rank',1)+1));state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You advanced to military rank ${n(r,'rank')}.`});}
    if(key==='politics'&&r.office){setN(r,'approval',clamp(n(r,'approval',50)+rng.int(-8,8)));}
    if(key==='royalty'&&r.active===true){setN(r,'respect',clamp(n(r,'respect',55)+rng.int(-4,4)));}
    if(key==='crimeOrg'&&r.active===true){setN(r,'standing',clamp(n(r,'standing',30)+rng.int(-4,5)));}
  }
  state.rngCounter=rng.counter();
  processCombatCareerYear(state);
  processSpecialCareerWorldsYear(state);
  processSpecialCareerEcosystemsYear(state);
  processMusicCareerYear(state);
}

export function takeActingLesson(state:GameState):EngineResult {
  if(state.character.age<8)return{success:false,messages:[{text:'Acting lessons are not available yet.'}]};
  const cost=state.character.age>=18?120:0;
  if(state.finances.cash<cost)return{success:false,messages:[{text:`An acting lesson costs ${cost.toLocaleString()} in game currency.`}]};
  const gate=consumeAction(state,{policy:'special.training',target:'acting'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const r=track(state,'acting');setN(r,'skill',clamp(n(r,'skill',state.character.talents.acting*.35)+5));r.active=true;state.finances.cash-=cost;
  return{success:true,messages:[{text:`You practiced acting. Acting skill: ${Math.round(n(r,'skill'))}.`}]};
}

export function auditionActing(state:GameState,miniGameScore?:number):EngineResult {
  if(state.character.age<14)return{success:false,messages:[{text:'Professional auditions become available in the teen years.'}]};
  if(activeSpecialCareerWorld(state,'acting'))return{success:false,messages:[{text:'You are already committed to an acting production. Age up to complete it before taking another role.'}]};
  const r=track(state,'acting');
  const offer=screenCareerOffer(state,'acting');
  const gate=consumeAction(state,{policy:'special.audition'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-acting`,state.rngCounter);const skill=n(r,'skill',state.character.talents.acting*.4);
  if(offer){
    const role=offer.role??'supporting';const pay=Math.max(0,Math.round(offer.pay??0));
    state.finances.cash+=pay;setN(r,'credits',n(r,'credits')+1);setN(r,'skill',clamp(skill+2));setN(r,'reputation',clamp(n(r,'reputation',20)+(role==='lead'?6:3)));if(role==='lead')setN(r,'leadRoles',n(r,'leadRoles')+1);
    const world=careerWorld(state,'acting',role,{forceNew:true,announce:false});beginActingProject(state,r,world,role,pay,'offer');
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You accepted the ${role} offer for ${world.name}. Production is now underway.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
    state.rngCounter=rng.counter();return{success:true,messages:[{text:`You accepted a ${role} role in ${world.name} for ${pay.toLocaleString()}. The production will resolve after you age up.`}]};
  }
  const agent=n(r,'agent',0);const challengeBonus=miniGameScore===undefined?0:(clamp(miniGameScore)-50)*.22;const success=rng.chance(clamp(skill*.65+state.character.stats.appearance*.15+state.fame.fame*.08+agent*4+challengeBonus+rng.int(-15,20),5,92)/100);let text='';
  if(success){
    const role=rng.weighted([{item:'extra',weight:35},{item:'supporting',weight:50},{item:'lead',weight:Math.max(3,skill-45)}]);
    const basePay=role==='lead'?40000:role==='supporting'?9000:350;const pay=Math.round(basePay*(1+state.fame.fame/45)*rng.int(70,180)/100);
    state.finances.cash+=pay;setN(r,'credits',n(r,'credits')+1);setN(r,'skill',clamp(skill+3));setN(r,'reputation',clamp(n(r,'reputation',20)+(role==='lead'?8:role==='supporting'?4:1)));if(role==='lead')setN(r,'leadRoles',n(r,'leadRoles')+1);state.fame.fame=clamp(state.fame.fame+(role==='lead'?5:role==='supporting'?2:0));
    const world=careerWorld(state,'acting',role,{forceNew:true,announce:false});beginActingProject(state,r,world,role,pay,'audition');
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You joined the cast of ${world.name} for a ${role} role. Production is now underway.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
    text=`You booked a ${role} role in ${world.name} for ${pay.toLocaleString()}. The production will resolve after you age up.`;
  }else{text='You auditioned, but the production chose someone else.';setN(r,'skill',clamp(skill+1));}
  state.rngCounter=rng.counter();return{success,messages:[{text}]};
}

export function hireActingAgent(state:GameState):EngineResult {
  const r=track(state,'acting');if(n(r,'skill')<30)return{success:false,messages:[{text:'Build more acting skill before seeking representation.'}]};if(n(r,'agent')>=1)return{success:false,messages:[{text:'You already have fictional talent representation.'}]};setN(r,'agent',1);return{success:true,messages:[{text:'You signed with a fictional talent agent. Future auditions receive a small advantage.'}]};
}

export function practiceMusic(state:GameState,instrument='vocals'):EngineResult {
  const gate=consumeAction(state,{policy:'special.training',target:'music'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const r=track(state,'music');r.active=true;r.instrument=instrument;setN(r,'skill',clamp(n(r,'skill',state.character.talents.music*.35)+5));state.character.secondary.creativity=clamp(state.character.secondary.creativity+1);return{success:true,messages:[{text:`You practiced ${instrument}. Music skill: ${Math.round(n(r,'skill'))}.`}]};
}

export function releaseMusic(state:GameState,kind:'song'|'album'):EngineResult {
  if(state.character.age<13)return{success:false,messages:[{text:'Music releases become available in the teen years.'}]};const r=track(state,'music');const skill=n(r,'skill',state.character.talents.music*.35);if(skill<20)return{success:false,messages:[{text:'You need more musical skill before releasing material.'}]};const gate=consumeAction(state,{policy:'special.music_release'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const beforeCount=n(r,'songsReleased')+n(r,'albumsReleased');const world=careerWorld(state,'music',String(r.instrument??'music'),{announce:beforeCount===0});const rng=createRng(`${state.seed}-music`,state.rngCounter);const result=launchMusicRelease(state,r,world,kind,rng);
  state.rngCounter=rng.counter();return{success:true,messages:[{text:`${result.title} launched with ${result.streams.toLocaleString()} streams, ${result.reception}, and ${result.royalties.toLocaleString()} in royalties. Its catalog tail will continue across future Age Ups.`}]};
}

export function tourMusic(state:GameState):EngineResult {
  const r=track(state,'music');if(n(r,'fanbase')<2500)return{success:false,messages:[{text:'You need a larger fanbase before touring.'}]};if(r.tourActive===true)return{success:false,messages:[{text:'You already have a tour underway. Age up to complete it before starting another.'}]};const gate=consumeAction(state,{policy:'special.tour',target:'music'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-tour`,state.rngCounter);const world=careerWorld(state,'music',String(r.instrument??'music'),{announce:false});const result=beginMusicTour(state,r,world,rng);state.rngCounter=rng.counter();return result;
}

export function musicPartnershipAction(state:GameState,action:'accept'|'decline'):EngineResult {
  return musicPartnershipDecision(state,action);
}

const sports=['American football','Basketball','Baseball','Soccer','Hockey','Tennis','Golf','Volleyball'];
export function joinSportsPath(state:GameState,sport:string):EngineResult {
  if(!sports.includes(sport))return{success:false,messages:[{text:'Unknown sport.'}]};if(state.character.age<8)return{success:false,messages:[{text:'Organized sports become available later in childhood.'}]};const r=track(state,'sports');if(r.retired===true)return{success:false,messages:[{text:'You have already retired from professional competition in this life.'}]};if(r.active===true)return{success:false,messages:[{text:`You are already committed to the ${String(r.sport??'sports')} pathway.`}]};r.active=true;r.sport=sport;r.freeAgent=false;setN(r,'skill',Math.max(n(r,'skill'),state.character.talents.athletics*.4));setN(r,'fitness',state.health.fitness);return{success:true,messages:[{text:`You joined the ${sport} pathway.`}]};
}

export function trainSport(state:GameState):EngineResult {
  const r=track(state,'sports');if(!r.active)return{success:false,messages:[{text:'Join a sports pathway first.'}]};const gate=consumeAction(state,{policy:'special.training',target:'sports'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(r,'skill',clamp(n(r,'skill')+4));setN(r,'fitness',clamp(n(r,'fitness',state.health.fitness)+4));state.health.fitness=clamp(state.health.fitness+3);state.character.secondary.athleticism=clamp(state.character.secondary.athleticism+2);return{success:true,messages:[{text:`You trained for ${String(r.sport)}.`}]};
}

export function pursueProSports(state:GameState,miniGameScore?:number):EngineResult {
  const r=track(state,'sports');if(r.retired===true)return{success:false,messages:[{text:'Your professional playing career is already retired.'}]};if(state.character.age<18||n(r,'skill')<58)return{success:false,messages:[{text:'You need adulthood and stronger athletic skill before pursuing a professional contract.'}]};if(r.pro===true)return{success:false,messages:[{text:'You already hold a professional sports contract.'}]};const gate=consumeAction(state,{policy:'special.pro_contract'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-pro-sport`,state.rngCounter);const challengeBonus=miniGameScore===undefined?0:(clamp(miniGameScore)-50)*.2;const success=rng.chance(clamp(n(r,'skill')*.75+n(r,'fitness')*.2+challengeBonus+rng.int(-15,20),5,90)/100);
  let text='No professional team offered you a contract this time.';
  if(success){
    r.active=true;r.pro=true;r.freeAgent=false;const years=rng.int(1,5);const salary=rng.int(80000,3200000);setN(r,'contractYears',years);setN(r,'contractRemaining',years);setN(r,'salary',salary);setN(r,'contractSignedAge',state.character.age);setN(r,'proContracts',n(r,'proContracts')+1);setN(r,'teamsPlayedFor',n(r,'teamsPlayedFor')+1);setN(r,'seasonSalaryDue',0);state.fame.fame=clamp(state.fame.fame+8);const world=careerWorld(state,'sports',String(r.sport??'sport'),{announce:false});state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You signed a ${years}-year professional ${String(r.sport)} contract with ${world.name} at ${salary.toLocaleString()} per year.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});text=`You signed with ${world.name} for ${salary.toLocaleString()} per year.`;
  }
  state.rngCounter=rng.counter();return{success,messages:[{text}]};
}

export function trainCombat(state:GameState):EngineResult {return trainCombatCareer(state);}
export function takeFight(state:GameState,miniGameScore?:number):EngineResult {return takeCombatFight(state,miniGameScore);}

export function enlistMilitary(state:GameState,branch:string,officer=false):EngineResult {
  if(state.character.age<18)return{success:false,messages:[{text:'Military service requires adulthood.'}]};if(state.legal.criminalRecord.some(r=>r.convicted))return{success:false,messages:[{text:'Your criminal record prevents entry under current game rules.'}]};const r=track(state,'military');if(r.active===true)return{success:false,messages:[{text:'You are already in military service.'}]};r.active=true;r.branch=branch;r.path=officer?'officer':'enlisted';setN(r,'rank',officer?2:1);setN(r,'skill',40);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You joined the ${branch} on the ${officer?'officer':'enlisted'} path.`});return{success:true,messages:[{text:'You entered military service.'}]};
}

export function militaryTraining(state:GameState):EngineResult {
  const r=track(state,'military');if(!r.active)return{success:false,messages:[{text:'You are not in military service.'}]};const gate=consumeAction(state,{policy:'special.training',target:'military'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(r,'skill',clamp(n(r,'skill')+4));state.character.secondary.discipline=clamp(state.character.secondary.discipline+3);state.health.fitness=clamp(state.health.fitness+2);return{success:true,messages:[{text:'You completed another period of training.'}]};
}

export function enterPolitics(state:GameState,officeLevel=1):EngineResult {
  if(state.character.age<25)return{success:false,messages:[{text:'You need more life experience before running for office.'}]};const r=track(state,'politics');const rng=createRng(`${state.seed}-politics`,state.rngCounter);const budget=Math.max(5000,officeLevel*25000);if(state.finances.cash<budget)return{success:false,messages:[{text:`A campaign at this level needs at least ${budget.toLocaleString()} in game funds.`}]};const gate=consumeAction(state,{policy:'special.campaign'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};state.finances.cash-=budget;const score=state.character.secondary.charisma*.3+state.character.secondary.reputation*.25+state.fame.fame*.15+state.character.stats.intelligence*.15+rng.int(-20,25)-state.legal.criminalRecord.filter(x=>x.convicted).length*12;const win=score>42+officeLevel*7;if(win){r.active=true;r.office=officeLevel;setN(r,'approval',55);setN(r,'electionsWon',n(r,'electionsWon')+1);state.fame.fame=clamp(state.fame.fame+officeLevel*3);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You won election to public office level ${officeLevel}.`});}state.rngCounter=rng.counter();return{success:win,messages:[{text:win?'You won the election.':'You lost the election.'}]};
}

export function politicalAction(state:GameState,action:'speech'|'policy'|'press'|'fundraise'):EngineResult {
  const r=track(state,'politics');if(!r.office)return{success:false,messages:[{text:'You do not currently hold elected office.'}]};const gate=consumeAction(state,[{policy:'special.politics.total'},{policy:'special.politics.kind',target:action}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-political-action`,state.rngCounter);const delta=action==='policy'?rng.int(-6,8):action==='speech'?rng.int(-3,6):action==='press'?rng.int(-5,5):rng.int(-2,3);setN(r,'approval',clamp(n(r,'approval',50)+delta));if(action==='fundraise')state.finances.cash+=rng.int(0,2500);state.rngCounter=rng.counter();return{success:delta>=0,messages:[{text:`Your ${action} changed approval by ${delta>=0?'+':''}${delta}.`}]};
}

export function royalDuty(state:GameState):EngineResult {
  if(!state.flags.royalBirth&&!track(state,'royalty').active)return{success:false,messages:[{text:'You are not part of a royal household.'}]};const gate=consumeAction(state,{policy:'special.royal_duty'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const r=track(state,'royalty');r.active=true;setN(r,'rank',Math.max(n(r,'rank'),Number(state.flags.royalRank??1)));setN(r,'respect',clamp(n(r,'respect',55)+3));state.fame.fame=clamp(state.fame.fame+1);return{success:true,messages:[{text:'You performed ceremonial royal duties. Public respect improved.'}]};
}

export function modelingAction(state:GameState, action:'lesson'|'audition'|'photoshoot'|'runway'):EngineResult {
  if(state.character.age<14)return{success:false,messages:[{text:'Professional modeling becomes available in the teen years.'}]};
  const r=track(state,'modeling');r.active=true;const rng=createRng(`${state.seed}-model`,state.rngCounter);
  if(action==='lesson'){
    const gate=consumeAction(state,{policy:'special.training',target:'modeling'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(r,'technique',clamp(n(r,'technique',25)+5));state.rngCounter=rng.counter();return{success:true,messages:[{text:'You took a modeling lesson.'}]};
  }
  const gate=consumeAction(state,[{policy:'special.model.total'},{policy:'special.model.kind',target:action}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const quality=state.character.stats.appearance*.45+n(r,'technique',25)*.35+state.character.secondary.charisma*.2+rng.int(-20,18);const success=quality>(action==='runway'?63:45);
  if(success){
    const pay=rng.int(action==='runway'?3000:500,action==='runway'?30000:8000);state.finances.cash+=pay;setN(r,'jobs',n(r,'jobs')+1);if(action==='runway')setN(r,'runwayCampaigns',n(r,'runwayCampaigns')+1);setN(r,'reputation',clamp(n(r,'reputation',20)+4));state.fame.fame=clamp(state.fame.fame+(action==='runway'?5:1));const firstJob=n(r,'jobs')===1;const world=careerWorld(state,'modeling',action,{announce:firstJob});state.rngCounter=rng.counter();return{success:true,messages:[{text:`You booked the ${action} job through ${world.name} and earned ${pay.toLocaleString()}.`}]};
  }
  state.rngCounter=rng.counter();return{success:false,messages:[{text:`You did not book the ${action} job.`}]};
}

export function racingAction(state:GameState, action:'join'|'train'|'race',miniGameScore?:number):EngineResult {
  const r=track(state,'racing');const rng=createRng(`${state.seed}-racing`,state.rngCounter);
  if(action==='join'){
    if(state.character.age<16)return{success:false,messages:[{text:'You are too young for the racing pathway.'}]};if(r.active===true)return{success:false,messages:[{text:'You are already in the racing pathway.'}]};r.active=true;setN(r,'skill',state.character.secondary.athleticism*.35+20);setN(r,'seasons',0);const world=careerWorld(state,'racing','motorsport',{announce:true});state.rngCounter=rng.counter();return{success:true,messages:[{text:`You entered fictional motorsport with ${world.name}.`}]};
  }
  if(!r.active)return{success:false,messages:[{text:'Join the racing pathway first.'}]};
  if(action==='train'){
    const gate=consumeAction(state,{policy:'special.training',target:'racing'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(r,'skill',clamp(n(r,'skill')+5));state.rngCounter=rng.counter();return{success:true,messages:[{text:'You trained your racing skill.'}]};
  }
  const gate=consumeAction(state,{policy:'special.race'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(r,'seasons',n(r,'seasons')+1);const challengeShift=miniGameScore===undefined?0:(clamp(miniGameScore)-50)/18;const finish=clamp(Math.round(14-n(r,'skill')/8-challengeShift+rng.int(-4,7)),1,20);if(finish===1){setN(r,'titles',n(r,'titles')+1);state.fame.fame=clamp(state.fame.fame+8);state.finances.cash+=150000;}else{state.finances.cash+=Math.max(0,45000-finish*1800);}state.rngCounter=rng.counter();const suffix=finish===1?'st':finish===2?'nd':finish===3?'rd':'th';return{success:finish<=5,messages:[{text:`You finished ${finish}${suffix} in the season event.`}]};
}

export function directFilm(state:GameState,budget:number):EngineResult {
  if(state.character.age<21)return{success:false,messages:[{text:'You need more experience before directing a full production.'}]};
  if(activeSpecialCareerWorld(state,'directing'))return{success:false,messages:[{text:'You already have a film in production. Age up to complete it before starting another.'}]};
  const r=track(state,'directing');const offer=screenCareerOffer(state,'directing');const actualBudget=Math.round(offer?.budget??budget);
  if(!Number.isFinite(actualBudget)||actualBudget<250000)return{success:false,messages:[{text:'That production budget is not available.'}]};
  const source=offer?'studio-offer' as const:'self-backed' as const;const stake=offer?0:Math.round(actualBudget*.05);
  if(!offer&&state.finances.cash<stake)return{success:false,messages:[{text:'You need enough cash or backing to cover part of the production risk.'}]};
  const gate=consumeAction(state,{policy:'special.direct_film'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  state.finances.cash-=stake;const rng=createRng(`${state.seed}-director`,state.rngCounter);const skill=n(r,'skill',state.character.secondary.creativity*.45+state.character.stats.intelligence*.2);const fee=Math.round(offer?.fee??actualBudget*.025);state.finances.cash+=fee;r.active=true;setN(r,'filmsDirected',n(r,'filmsDirected')+1);setN(r,'skill',clamp(skill+4));
  const world=careerWorld(state,'directing',`film-${n(r,'filmsDirected')}`,{forceNew:true,announce:false});beginDirectingProject(state,r,world,actualBudget,stake,fee,source);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You began directing ${world.name}, a ${source==='studio-offer'?'studio-backed':'self-backed'} production budgeted at ${actualBudget.toLocaleString()}.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  state.rngCounter=rng.counter();return{success:true,messages:[{text:`${world.name} entered production on a ${actualBudget.toLocaleString()} budget. Your director fee is ${fee.toLocaleString()}; release results will resolve after you age up.`}]};
}

export function joinCrimeOrganization(state:GameState):EngineResult {
  if(state.character.age<18)return{success:false,messages:[{text:'This fictional organization path requires adulthood.'}]};const r=track(state,'crimeOrg');if(r.active===true)return{success:false,messages:[{text:'You are already in this fictional organization.'}]};r.active=true;r.rank='Associate';setN(r,'rankLevel',1);setN(r,'standing',25);return{success:true,messages:[{text:'You joined a fictional criminal organization as an Associate. Mechanics remain abstract and non-instructional.'}]};
}

export function crimeOrganizationAction(state:GameState,action:'earn'|'contribute'|'reputation'|'informant'):EngineResult {
  const r=track(state,'crimeOrg');if(!r.active)return{success:false,messages:[{text:'You are not in a criminal organization.'}]};const gate=consumeAction(state,[{policy:'special.crime_org.total'},{policy:'special.crime_org.kind',target:action}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-crime-org`,state.rngCounter);if(action==='earn'){const money=rng.int(500,10000)*Math.max(1,n(r,'rankLevel',1));state.finances.cash+=money;state.legal.investigationHeat=clamp(state.legal.investigationHeat+5);setN(r,'standing',clamp(n(r,'standing')+3));}if(action==='contribute'){const amount=Math.min(state.finances.cash,2000*n(r,'rankLevel',1));state.finances.cash-=amount;setN(r,'standing',clamp(n(r,'standing')+Math.round(amount/1000)));}if(action==='reputation')setN(r,'standing',clamp(n(r,'standing')+4));if(action==='informant'){r.informant=true;setN(r,'standing',clamp(n(r,'standing')-18));state.legal.investigationHeat=clamp(state.legal.investigationHeat-12);}if(n(r,'standing')>65&&n(r,'rankLevel')<6){setN(r,'rankLevel',n(r,'rankLevel')+1);r.rank=['Associate','Soldier','Lieutenant','Captain','Underboss','Boss'][n(r,'rankLevel')-1]!;setN(r,'standing',42);}state.rngCounter=rng.counter();return{success:true,messages:[{text:`Organization action complete. Standing: ${Math.round(n(r,'standing'))}; rank: ${String(r.rank)}.`}]};
}

export function startSpecialOrganization(state:GameState,kind:'museum'|'zoo'|'secretAgency'|'commune'|'casino'):EngineResult {
  if(state.character.age<18)return{success:false,messages:[{text:'You must be an adult.'}]};const costs={museum:500000,zoo:2500000,secretAgency:5000000,commune:250000,casino:8000000};const cost=costs[kind];const r=track(state,kind);if(r.active===true)return{success:false,messages:[{text:'This organization is already active.'}]};if(state.finances.cash<cost)return{success:false,messages:[{text:`Starting this organization requires ${cost.toLocaleString()} in game currency.`}]};state.finances.cash-=cost;r.active=true;setN(r,'reputation',40);setN(r,'value',cost);if(kind==='zoo')setN(r,'welfare',85);if(kind==='museum')setN(r,'exhibits',Math.min(10,state.assets.collectibles.length));if(kind==='secretAgency')setN(r,'agents',3);if(kind==='commune')setN(r,'followers',12);if(kind==='casino')setN(r,'security',65);return{success:true,messages:[{text:`You opened your fictional ${kind==='secretAgency'?'intelligence agency':kind}.`}]};
}

export function runSpecialOrganization(state:GameState,kind:'museum'|'zoo'|'secretAgency'|'commune'|'casino',action:string):EngineResult {
  const r=track(state,kind);if(!r.active)return{success:false,messages:[{text:'This organization is not active.'}]};const gate=consumeAction(state,[{policy:'special.organization.total',target:kind},{policy:'special.organization.kind',target:`${kind}:${action}`}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-${kind}`,state.rngCounter);let income=0;
  if(kind==='museum'){if(action==='add_exhibit')setN(r,'exhibits',Math.min(state.assets.collectibles.length,n(r,'exhibits')+1));income=n(r,'exhibits')*rng.int(500,2200);}
  if(kind==='zoo'){if(action==='welfare')setN(r,'welfare',clamp(n(r,'welfare')+5));if(action==='expand')setN(r,'animals',n(r,'animals',8)+rng.int(1,4));income=n(r,'animals',8)*rng.int(700,2400);}
  if(kind==='secretAgency'){if(action==='recruit')setN(r,'agents',n(r,'agents')+1);if(action==='mission'){const success=rng.chance(clamp(n(r,'agents')*5+n(r,'reputation')*.4,10,85)/100);setN(r,'reputation',clamp(n(r,'reputation')+(success?4:-3)));income=success?rng.int(10000,80000):0;}}
  if(kind==='commune'){if(action==='gathering')setN(r,'followers',n(r,'followers')+rng.int(-2,8));if(action==='support')setN(r,'reputation',clamp(n(r,'reputation')+4));income=Math.max(0,n(r,'followers')*rng.int(20,80));}
  if(kind==='casino'){if(action==='security')setN(r,'security',clamp(n(r,'security')+4));if(action==='marketing')setN(r,'reputation',clamp(n(r,'reputation')+3));income=Math.round(n(r,'value',8000000)*rng.int(-2,5)/100);}
  state.finances.cash+=income;setN(r,'value',Math.max(0,n(r,'value')+income*.6));state.rngCounter=rng.counter();return{success:true,messages:[{text:`Operation complete${income?`; net game income ${income.toLocaleString()}`:''}.`}]};
}
