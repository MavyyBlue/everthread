import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import type { CareerRecord, EngineResult, GameState, PartTimeCareerRecord, Relationship, SocialWorld } from '../types/game';
import { activeSpecialCareerPaths, type SpecialCareerPathKey } from './CommitmentSystem';
import { archiveSpecialCareerWorld, specialCareerWorlds, type SpecialCareerWorldKind } from './SpecialCareerWorldSystem';
import { employmentRecordKey, syncWorkplaceWorlds } from './WorkplaceSystem';

type Track = Record<string, number | string | boolean>;
export type StrainKind = 'Burnout' | 'Emotional Volatility' | 'Chronic Strain';

const STRAIN_KINDS:StrainKind[]=['Burnout','Emotional Volatility','Chronic Strain'];
const SPECIAL_WORLD_KEYS = new Set<SpecialCareerPathKey>(['acting','music','sports','modeling','racing','directing']);

function flagNumber(state:GameState,key:string,def=0){const value=state.flags[key];return typeof value==='number'?value:def;}
function setFlagNumber(state:GameState,key:string,value:number){state.flags[key]=Math.round(value*100)/100;}
function flagString(state:GameState,key:string){const value=state.flags[key];return typeof value==='string'?value:undefined;}
function currentSchoolWorld(state:GameState){return state.socialWorlds.find(world=>world.kind==='school'&&world.active&&world.school);}
function relFor(state:GameState,npcId?:string){return npcId?state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged):undefined;}
function activeWorldFor(state:GameState,key:SpecialCareerPathKey){return SPECIAL_WORLD_KEYS.has(key)?specialCareerWorlds(state,key as SpecialCareerWorldKind).find(world=>world.active):undefined;}
function career(state:GameState,key:SpecialCareerPathKey){return (state.specialCareers[key]??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}

export function stressStrainView(state:GameState){
  const kind=flagString(state,'stressStrainKind') as StrainKind|undefined;
  const severity=clamp(flagNumber(state,'stressStrainSeverity'));
  return kind&&severity>0?{kind,severity}:undefined;
}

export function stressIncidentChance(state:GameState){
  const stress=state.character.secondary.stress;if(stress<90)return 0;
  const severity=stressStrainView(state)?.severity??0;
  return clamp(.18+(stress-90)*.025+severity*.0015,.18,.58);
}

export function stressConsequenceView(state:GameState){
  const stress=state.character.secondary.stress;const chance=stressIncidentChance(state);const strain=stressStrainView(state);
  return {stress,highRisk:stress>=90,chance,strain,label:stress>=97?'critical strain':stress>=90?'high strain':stress>=75?'elevated':'manageable'};
}

function setStrain(state:GameState,kind:StrainKind,severity:number){state.flags.stressStrainKind=kind;setFlagNumber(state,'stressStrainSeverity',clamp(severity));}
function reduceStrain(state:GameState,amount:number){const current=stressStrainView(state);if(!current)return;const next=clamp(current.severity-amount);if(next<=4){delete state.flags.stressStrainKind;delete state.flags.stressStrainSeverity;}else setStrain(state,current.kind,next);}

export function therapySession(state:GameState):EngineResult{
  if(state.character.age<13)return{success:false,messages:[{text:'Therapy becomes available in the teen years.'}]};
  const cost=state.character.age>=18?600:0;if(cost>0&&state.finances.cash<cost)return{success:false,messages:[{text:`A therapy session costs ${cost.toLocaleString()} in game currency.`}]};
  const gate=consumeAction(state,[{policy:'wellness.total'},{policy:'wellness.activity',target:'therapy'}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  if(cost>0)state.finances.cash-=cost;const before=state.character.secondary.stress;state.character.secondary.stress=clamp(before-24);state.health.wellness=clamp(state.health.wellness+7);state.character.stats.happiness=clamp(state.character.stats.happiness+3);reduceStrain(state,28);
  const relief=Math.round(before-state.character.secondary.stress);return{success:true,messages:[{text:`You attended therapy and reduced stress by ${relief} points.${cost===0?' A guardian-supported session covered the in-game cost.':''}`}]};
}

export function relationshipStressRecovery(state:GameState,npcId:string):EngineResult|undefined{
  const rel=relFor(state,npcId);const npc=state.npcs[npcId];if(!rel||!npc?.alive)return;
  const closeBonus=['spouse','fiance','partner','best_friend'].includes(rel.type)?4:['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild'].includes(rel.type)?3:rel.type==='friend'?2:1;
  if(rel.score<20){state.character.secondary.stress=clamp(state.character.secondary.stress+1);return{success:true,messages:[{text:`Time with ${npc.firstName} felt tense and did not help you decompress.`}]};}
  const relief=clamp(Math.round(2+rel.score/18+closeBonus),2,13);const before=state.character.secondary.stress;state.character.secondary.stress=clamp(before-relief);if(rel.score>=75)reduceStrain(state,3);const actual=Math.round(before-state.character.secondary.stress);
  return{success:true,messages:[{text:`Spending time with ${npc.firstName} helped you decompress${actual?` (-${actual} stress)`:''}.`}]};
}

function maybeDevelopStrain(state:GameState,rng:ReturnType<typeof createRng>){
  const stress=state.character.secondary.stress;if(stress<90){reduceStrain(state,stress<70?10:5);return;}
  const existing=stressStrainView(state);if(existing){setStrain(state,existing.kind,existing.severity+rng.int(2,7)+(stress>=97?2:0));return;}
  const chance=clamp(.12+(stress-90)*.022,.12,.36);if(rng.chance(chance)){const kind=rng.pick(STRAIN_KINDS);setStrain(state,kind,rng.int(18,34));state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'health',importance:2,text:`Sustained pressure developed into ${kind.toLowerCase()}, increasing the chance of stress-related mistakes and conflict until you recover.`});}
}

function addMemory(state:GameState,rel:Relationship|undefined,kind:string,sentiment:number,summary:string){if(!rel)return;const npc=state.npcs[rel.npcId];if(!npc)return;npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent:sentiment<=-8});npc.memories=npc.memories.slice(-36);}
function incrementIncident(state:GameState,key:string){const next=flagNumber(state,key)+1;setFlagNumber(state,key,next);return next;}
function markReviewed(state:GameState,key:string,count:number){setFlagNumber(state,key,count);}
function reviewNeeded(state:GameState,countKey:string,reviewKey:string){const count=flagNumber(state,countKey);return count>=3&&count>flagNumber(state,reviewKey);}

type WorkplaceEmployment = {kind:'full_time';record:CareerRecord}|{kind:'part_time';record:PartTimeCareerRecord};

function workplaceEmployment(state:GameState,world:SocialWorld):WorkplaceEmployment|undefined{
  const workplace=world.workplace;if(!workplace)return;
  if(workplace.employmentKind==='full_time'){
    const record=state.employment.current;
    return record&&employmentRecordKey(record,'full_time')===workplace.employmentKey?{kind:'full_time',record}:undefined;
  }
  const record=(state.employment.partTimeJobs??[]).find(item=>employmentRecordKey(item,'part_time')===workplace.employmentKey);
  return record?{kind:'part_time',record}:undefined;
}

function endWorkplaceEmployment(state:GameState,employment:WorkplaceEmployment){
  if(employment.kind==='full_time'){
    const record=employment.record;record.endAge=state.character.age;
    state.employment.history.push({...record});state.employment.current=undefined;
  }else{
    const record=employment.record;record.endAge=state.character.age;
    state.employment.partTimeHistory??=[];state.employment.partTimeHistory.push({...record});
    state.employment.partTimeJobs=(state.employment.partTimeJobs??[]).filter(item=>item!==record);
    state.employment.partTimeJobIds=state.employment.partTimeJobs.map(item=>item.jobId);
  }
}

function workplaceIncident(state:GameState,world:SocialWorld,rng:ReturnType<typeof createRng>){
  const employment=workplaceEmployment(state,world);if(!employment||!world.workplace)return;const current=employment.record;const incidentKey=`stressWorkIncidents:${world.id}`;const reviewKey=`stressWorkReviewed:${world.id}`;const kind=rng.weighted([{item:'mistake' as const,weight:4},{item:'conflict' as const,weight:3},{item:'accident' as const,weight:2}]);const count=incrementIncident(state,incidentKey);
  const drop=rng.int(5,10);current.performance=clamp(current.performance-drop);if(employment.kind==='full_time')state.character.secondary.workPerformance=current.performance;world.workplace.tension=clamp(world.workplace.tension+rng.int(5,9));world.workplace.reputation=clamp(world.workplace.reputation-rng.int(1,4));
  let text='';let npcIds:string[]|undefined;
  if(kind==='accident'){const healthHit=rng.int(1,5);state.character.stats.health=clamp(state.character.stats.health-healthHit);text=`High strain contributed to a minor workplace accident at ${world.name}. Your health and performance took a hit.`;}
  else if(kind==='conflict'){world.workplace.disputes+=1;const candidates=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);const target=candidates.length?rng.pick(candidates):undefined;const rel=target?relFor(state,target.npcId):undefined;if(rel){const delta=-rng.int(5,10);rel.score=clamp(rel.score+delta);addMemory(state,rel,'stress_conflict',delta,`${state.character.firstName} clashed with you during a high-stress work period.`);npcIds=[rel.npcId];}text=`High strain spilled into a workplace conflict at ${world.name}.`;}
  else{text=`Under severe pressure, you made a costly mistake at ${world.name}. Your performance record suffered.`;}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:count>=3?2:1,text:`${text} Stress-related workplace incidents: ${count}.`,npcIds});
  if(!reviewNeeded(state,incidentKey,reviewKey))return;markReviewed(state,reviewKey,count);const managerRel=relFor(state,world.workplace.managerNpcId);const dismissalChance=clamp(.12+(count-3)*.11+Math.max(0,48-current.performance)/115+Math.max(0,42-(managerRel?.score??50))/170+state.character.secondary.stress/900,.12,.70);
  if(rng.chance(dismissalChance)){
    endWorkplaceEmployment(state,employment);state.character.stats.happiness=clamp(state.character.stats.happiness-9);syncWorkplaceWorlds(state,false);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`After ${count} stress-related incidents and a formal review, ${world.name} ended your ${employment.kind==='part_time'?'part-time ':''}employment.`});
  }else{
    world.workplace.tension=clamp(world.workplace.tension+4);current.performance=clamp(current.performance-2);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`After ${count} stress-related incidents, ${world.name} placed you under a formal warning rather than dismissing you.`});
  }
}

function activeEducationRecord(state:GameState){return [...state.education].reverse().find(record=>!record.graduated&&!record.droppedOut&&!record.endAge);}
function archiveSchoolWorld(world:SocialWorld,age:number){world.active=false;world.endedAge??=age;for(const member of world.members)member.leftAge??=age;for(const group of world.groups)if(group.playerJoinedAge!==undefined)group.playerLeftAge??=age;}
function schoolIncident(state:GameState,world:SocialWorld,rng:ReturnType<typeof createRng>){
  if(!world.school)return;const incidentKey=`stressSchoolIncidents:${world.id}`;const reviewKey=`stressSchoolReviewed:${world.id}`;const count=incrementIncident(state,incidentKey);const kind=rng.weighted([{item:'missed_work' as const,weight:4},{item:'conflict' as const,weight:3},{item:'exhaustion' as const,weight:3}]);world.school.attendance=clamp(world.school.attendance-rng.int(4,9));world.school.conduct=clamp(world.school.conduct-rng.int(2,7));state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance-rng.int(4,9));let text='';let npcIds:string[]|undefined;
  if(kind==='conflict'){world.school.disciplinaryActions+=1;const candidates=world.members.filter(member=>member.leftAge===undefined&&['classmate','teacher','coach'].includes(member.role)&&state.npcs[member.npcId]?.alive);const target=candidates.length?rng.pick(candidates):undefined;const rel=target?relFor(state,target.npcId):undefined;if(rel){const delta=-rng.int(4,9);rel.score=clamp(rel.score+delta);addMemory(state,rel,'school_stress_conflict',delta,`${state.character.firstName} clashed with you during a high-stress school period.`);npcIds=[rel.npcId];}text=`Severe stress contributed to a conflict at ${world.name}.`;}
  else if(kind==='exhaustion'){state.character.stats.happiness=clamp(state.character.stats.happiness-3);text=`Exhaustion disrupted your school performance at ${world.name}.`;}
  else{text=`High strain caused you to fall behind on important school work at ${world.name}.`;}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:count>=3?2:1,text:`${text} Stress-related school incidents: ${count}.`,npcIds});
  if(!reviewNeeded(state,incidentKey,reviewKey))return;markReviewed(state,reviewKey,count);const record=activeEducationRecord(state);const postSecondary=Boolean(record&&['university','community_college','graduate','professional','trade'].includes(record.stage));const dismissalChance=clamp(.07+(count-3)*.09+Math.max(0,45-state.character.secondary.academicPerformance)/140+Math.max(0,45-world.school.conduct)/160,.07,.52);
  if(postSecondary&&record&&rng.chance(dismissalChance)){
    record.droppedOut=true;record.endAge=state.character.age;archiveSchoolWorld(world,state.character.age);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:3,text:`After repeated stress-related incidents and an academic review, ${world.name} dismissed you from the program.`});
  }else{
    world.school.disciplinaryActions+=1;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:postSecondary?`${world.name} placed you on academic/disciplinary probation after repeated stress-related incidents.`:`${world.name} created a formal support and discipline plan after repeated stress-related incidents.`});
  }
}

function specialCareerCandidates(state:GameState){return activeSpecialCareerPaths(state).map(key=>({key,world:activeWorldFor(state,key)})).filter((entry):entry is {key:SpecialCareerPathKey;world:SocialWorld}=>Boolean(entry.world));}
function specialCareerIncident(state:GameState,key:SpecialCareerPathKey,world:SocialWorld,rng:ReturnType<typeof createRng>){
  const c=career(state,key);const incidentKey=`stressIncidents:${world.id}`;const reviewKey=`stressReviewed:${world.id}`;const count=n(c,incidentKey)+1;setN(c,incidentKey,count);const kind=rng.weighted([{item:'mistake' as const,weight:4},{item:'conflict' as const,weight:3},{item:'accident' as const,weight:2}]);setN(c,'reputation',clamp(n(c,'reputation',45)-rng.int(2,6)));let text='';let npcIds:string[]|undefined;
  if(kind==='accident'){state.character.stats.health=clamp(state.character.stats.health-rng.int(1,5));text=`High strain contributed to a minor accident during your work with ${world.name}.`;}
  else if(kind==='conflict'){const leader=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive);const rel=leader?relFor(state,leader.npcId):undefined;if(rel){const delta=-rng.int(5,10);rel.score=clamp(rel.score+delta);addMemory(state,rel,'career_stress_conflict',delta,`${state.character.firstName} clashed with you under severe professional stress.`);npcIds=[rel.npcId];}text=`Severe stress spilled into a conflict inside ${world.name}.`;}
  else{text=`Under severe pressure, you made a visible professional mistake in ${world.name}.`;}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:count>=3?2:1,text:`${text} Stress-related incidents in this career: ${count}.`,npcIds});
  const reviewed=n(c,reviewKey);if(count<3||count<=reviewed)return;setN(c,reviewKey,count);const leaderRel=world.members.find(member=>member.role==='leader')?.npcId;const leaderScore=relFor(state,leaderRel)?.score??50;const dismissalChance=clamp(.10+(count-3)*.10+Math.max(0,48-n(c,'reputation',45))/140+Math.max(0,42-leaderScore)/170+state.character.secondary.stress/1000,.10,.62);
  if(!rng.chance(dismissalChance)){state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`A formal review in ${world.name} ended with a warning. Continued strain could still threaten your position.`});return;}
  if(key==='sports'){
    c.pro=false;c.active=true;c.freeAgent=true;c.renewalOfferPending=false;setN(c,'contractRemaining',0);archiveSpecialCareerWorld(world,state.character.age);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`${world.name} released you after repeated stress-related incidents. You entered professional sports free agency.`});return;
  }
  if(key==='racing'){
    c.contractActive=false;c.active=false;c.freeAgent=true;c.contractOfferPending=false;setN(c,'contractRemaining',0);archiveSpecialCareerWorld(world,state.character.age);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`${world.name} released you after repeated stress-related incidents. You entered racing free agency.`});return;
  }
  if(key==='modeling'&&c.agencyContractActive===true){c.agencyContractActive=false;c.agencyStatus='unrepresented';setN(c,'agencyContractRemaining',0);setN(c,'agencyReleases',n(c,'agencyReleases')+1);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`Your representation ended after repeated stress-related incidents. You remained a model but became unrepresented.`});return;}
  if(key==='music'&&c.distributionPartner===true){c.distributionPartner=false;c.partnershipActive=false;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`Your distribution partnership ended after repeated stress-related professional incidents. Your music career and catalog history remain yours.`});return;}
  setN(c,'reputation',clamp(n(c,'reputation',45)-8));state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`Repeated stress-related incidents damaged your standing in ${world.name}, but this career does not currently have a formal employer-release lifecycle.`});
}

export function processStressConsequencesYear(state:GameState){
  if(flagNumber(state,'lastStressConsequenceAge',-1)===state.character.age)return;setFlagNumber(state,'lastStressConsequenceAge',state.character.age);
  const rng=createRng(`${state.seed}-stress-consequence-${state.currentYear}-${state.character.age}`);maybeDevelopStrain(state,rng);if(state.character.secondary.stress<90)return;if(!rng.chance(stressIncidentChance(state)))return;
  const candidates:Array<{kind:'work'|'school'|'special';weight:number;world:SocialWorld;key?:SpecialCareerPathKey}>=[];for(const work of state.socialWorlds.filter(world=>world.kind==='workplace'&&world.active&&world.workplace)){const employment=workplaceEmployment(state,work);if(employment)candidates.push({kind:'work',weight:employment.kind==='full_time'?1.2:.8,world:work});}const school=currentSchoolWorld(state);if(school)candidates.push({kind:'school',weight:1,world:school});for(const entry of specialCareerCandidates(state))candidates.push({kind:'special',weight:1.1,world:entry.world,key:entry.key});if(!candidates.length)return;const selected=rng.weighted(candidates.map(item=>({item,weight:item.weight})));if(selected.kind==='work')workplaceIncident(state,selected.world,rng);else if(selected.kind==='school')schoolIncident(state,selected.world,rng);else if(selected.key)specialCareerIncident(state,selected.key,selected.world,rng);
}
