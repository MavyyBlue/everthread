import { getNamePool } from '../data/names';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import type { EngineResult, GameState, Npc, Orientation, RelationshipType, SocialWorld, SocialWorldMemberRole } from '../types/game';
import { ensureNpcLife } from './NpcLifeSystem';
import { assignGeneratedNpcOrientation } from './NpcOrientationSystem';

type Track = Record<string, number | string | boolean>;
type GroupKey = 'coaches' | 'training' | 'rivals';
type Rng = ReturnType<typeof createRng>;

type CombatGroupDefinition = {
  key: GroupKey;
  name: string;
  min: number;
  max: number;
  ageOffset: [number, number];
};

const NPC_TRAITS = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];
const GYM_NAMES = ['Second Bell Academy','Northline Combat Club','Crownless Fight Lab','Open Mat Collective','Iron Thread Athletics','Cornerstone Combat Gym','Halflight Training Hall','Atlas Ring Academy'];
const GROUPS: CombatGroupDefinition[] = [
  {key:'coaches',name:'Coaching Team',min:2,max:3,ageOffset:[-18,24]},
  {key:'training',name:'Training Partners',min:3,max:5,ageOffset:[-6,10]},
  {key:'rivals',name:'Circuit Rivals',min:2,max:4,ageOffset:[-4,10]},
];

function readTrack(state:GameState){return (state.specialCareers.combat??{}) as Track;}
function track(state:GameState){return (state.specialCareers.combat??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function groupKind(key:GroupKey){return `special:combat:${key}`;}
function groupFor(world:SocialWorld,key:GroupKey){return world.groups.find(group=>group.kind===groupKind(key));}
function activeMemberIds(state:GameState,world:SocialWorld,key:GroupKey){
  const group=groupFor(world,key);if(!group)return[];
  return group.memberNpcIds.filter(npcId=>{
    const member=world.members.find(item=>item.npcId===npcId);return Boolean(member&&member.leftAge===undefined&&state.npcs[npcId]?.alive);
  });
}
function average(values:number[],fallback=50){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:fallback;}
function relation(state:GameState,npcId:string){return state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged);}
function relationshipAverage(state:GameState,ids:string[],fallback=50){return average(ids.map(id=>relation(state,id)?.score).filter((value):value is number=>typeof value==='number'),fallback);}

function usedNames(state:GameState){
  return new Set(Object.values(state.npcs).map(npc=>`${npc.firstName}|${npc.lastName}`));
}
function uniqueName(state:GameState,rng:Rng,used:Set<string>){
  const pool=getNamePool(state.character.countryId);let firstName=rng.pick(pool.first);let lastName=rng.pick(pool.last);
  for(let tries=0;tries<16&&used.has(`${firstName}|${lastName}`);tries+=1){firstName=rng.pick(pool.first);lastName=rng.pick(pool.last);}
  used.add(`${firstName}|${lastName}`);return{firstName,lastName};
}
function createCombatNpc(state:GameState,key:GroupKey,definition:CombatGroupDefinition,rng:Rng,used:Set<string>):Npc{
  const {firstName,lastName}=uniqueName(state,rng,used);const minimumAge=key==='coaches'?22:16;const age=Math.max(minimumAge,state.character.age+rng.int(definition.ageOffset[0],definition.ageOffset[1]));
  const id=makeStateId(state,'special-combat-npc');const npc:Npc={
    id,firstName,lastName,age,alive:true,health:rng.int(key==='coaches'?55:64,98),happiness:rng.int(43,91),wealth:rng.int(3000,180000),countryId:state.character.countryId,city:state.character.city,
    sexuality:rng.pick<Orientation>(['straight','straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(18,88),maritalStatus:'single',traits:rng.shuffle(NPC_TRAITS).slice(0,3),hiddenOpinion:key==='rivals'?rng.int(-28,8):rng.int(-4,34),memories:[],parentIds:[],childIds:[],simulationTier:'background',
  };
  assignGeneratedNpcOrientation(state,npc);state.npcs[id]=npc;ensureNpcLife(state,npc);return npc;
}
function relationshipType(key:GroupKey,role:SocialWorldMemberRole):RelationshipType{
  if(key==='rivals')return'enemy';if(key==='coaches'&&role==='leader')return'coach';return'coworker';
}
function ensureCombatRelationship(state:GameState,world:SocialWorld,npc:Npc,key:GroupKey,role:SocialWorldMemberRole,rng:Rng){
  if(state.relationships.some(rel=>rel.npcId===npc.id))return;
  const type=relationshipType(key,role);const hostile=type==='enemy';
  state.relationships.push({id:makeStateId(state,'rel'),npcId:npc.id,type,score:hostile?rng.int(14,34):type==='coach'?rng.int(48,70):rng.int(44,72),attraction:hostile?rng.int(0,26):rng.int(0,48),compatibility:rng.int(30,88),yearsKnown:0});
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'special_combat',sentiment:hostile?-5:3,summary:hostile?`You became a recurring combat-sport rival of ${state.character.firstName} through ${world.name}.`:`You met ${state.character.firstName} through ${world.name}.`});
}
function addMember(state:GameState,world:SocialWorld,key:GroupKey,definition:CombatGroupDefinition,rng:Rng,used:Set<string>,leader=false){
  const npc=createCombatNpc(state,key,definition,rng,used);const group=groupFor(world,key);if(!group)throw new Error(`Combat world ${world.id} is missing ${key}.`);
  const role:SocialWorldMemberRole=leader?'leader':'member';group.memberNpcIds.push(npc.id);world.members.push({npcId:npc.id,role,joinedAge:state.character.age,groupIds:[group.id]});ensureCombatRelationship(state,world,npc,key,role,rng);return npc;
}

export function combatCareerWorlds(state:GameState){return (state.socialWorlds??[]).filter(world=>world.kind==='organization'&&world.id.startsWith('special-combat-'));}
export function activeCombatCareerWorld(state:GameState){return combatCareerWorlds(state).find(world=>world.active);}
export function archiveCombatCareerWorld(world:SocialWorld,age:number){world.active=false;world.endedAge??=age;for(const member of world.members)member.leftAge??=age;}

export function ensureCombatCareerWorld(state:GameState,options:{announce?:boolean}={}):SocialWorld{
  state.socialWorlds??=[];const existing=activeCombatCareerWorld(state);if(existing)return existing;
  const ordinal=combatCareerWorlds(state).length+1;const rng=createRng(`${state.seed}-combat-world-${state.character.age}-${ordinal}`);const id=makeStateId(state,'special-combat');const groups:SocialWorld['groups']=[];
  for(const definition of GROUPS)groups.push({id:makeStateId(state,'special-combat-group'),name:definition.name,kind:groupKind(definition.key),minAge:definition.key==='coaches'?22:16,memberNpcIds:[],prestige:rng.int(42,76)});
  const world:SocialWorld={id,kind:'organization',name:`${state.character.city} ${rng.pick(GYM_NAMES)}`,countryId:state.character.countryId,city:state.character.city,startedAge:state.character.age,active:true,members:[],groups};state.socialWorlds.push(world);
  const used=usedNames(state);
  for(const definition of GROUPS){const count=rng.int(definition.min,definition.max);for(let index=0;index<count;index+=1)addMember(state,world,definition.key,definition,rng,used,definition.key==='coaches'&&index===0);}
  const career=track(state);career.worldId=world.id;career.worldName=world.name;career.worldStartedAge=state.character.age;setN(career,'worldPrestige',average(groups.map(group=>group.prestige),50));
  if(options.announce!==false){const coach=activeMemberIds(state,world,'coaches')[0];const rival=activeMemberIds(state,world,'rivals')[0];state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You began training through ${world.name}. Its coaches, training partners, and recurring circuit rivals will persist as real people in your career history.`,npcIds:[coach,rival].filter((id):id is string=>Boolean(id))});}
  return world;
}

function replenishGroup(state:GameState,world:SocialWorld,key:GroupKey,rng:Rng,used:Set<string>){
  const definition=GROUPS.find(group=>group.key===key)!;let active=activeMemberIds(state,world,key);
  const livingLeader=key==='coaches'&&world.members.some(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive&&active.includes(member.npcId));
  if(key==='coaches'&&!livingLeader&&active.length<definition.max){
    const npc=addMember(state,world,key,definition,rng,used,true);active=[...active,npc.id];
  }
  while(active.length<definition.min){const leader=key==='coaches'&&!world.members.some(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive);const npc=addMember(state,world,key,definition,rng,used,leader);active=[...active,npc.id];}
}

export interface CombatCareerWorldView {
  worldId: string;
  worldName: string;
  coachNpcId?: string;
  rivalNpcIds: string[];
  trainingNpcIds: string[];
  coachSupport: number;
  trainingChemistry: number;
  rivalPressure: number;
  prestige: number;
}

export function combatCareerWorldView(state:GameState,world=activeCombatCareerWorld(state)):CombatCareerWorldView|undefined{
  if(!world)return;const coachIds=activeMemberIds(state,world,'coaches');const trainingIds=activeMemberIds(state,world,'training');const rivalIds=activeMemberIds(state,world,'rivals');
  const leader=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive&&coachIds.includes(member.npcId));
  const coachSupport=clamp(relationshipAverage(state,coachIds,55));const trainingChemistry=clamp(relationshipAverage(state,trainingIds,52));const rivalPressure=clamp(rivalIds.length?average(rivalIds.map(id=>100-(relation(state,id)?.score??50)),35):35);const prestige=clamp(average(world.groups.map(group=>group.prestige),50));
  return{worldId:world.id,worldName:world.name,coachNpcId:leader?.npcId??coachIds[0],rivalNpcIds:rivalIds,trainingNpcIds:trainingIds,coachSupport,trainingChemistry,rivalPressure,prestige};
}

function syncCompositeSkill(career:Track){
  const detail=average([n(career,'striking',25),n(career,'grappling',25),n(career,'defense',25),n(career,'stamina',25),n(career,'fightIQ',25)],25);setN(career,'skill',Math.max(n(career,'skill'),detail));return detail;
}

export function trainCombatCareer(state:GameState):EngineResult{
  if(state.character.age<12)return{success:false,messages:[{text:'Combat-sport training is not available yet.'}]};const gate=consumeAction(state,{policy:'special.training',target:'combat'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const career=track(state);career.active=true;const world=ensureCombatCareerWorld(state,{announce:!activeCombatCareerWorld(state)});const view=combatCareerWorldView(state,world);const coachBonus=view&&view.coachSupport>=70?1:view&&view.coachSupport<34?-1:0;
  setN(career,'striking',clamp(n(career,'striking',state.character.talents.combat*.3)+Math.max(1,3+coachBonus)));setN(career,'grappling',clamp(n(career,'grappling',state.character.talents.combat*.3)+Math.max(1,3+coachBonus)));setN(career,'defense',clamp(n(career,'defense',25)+Math.max(1,2+coachBonus)));setN(career,'stamina',clamp(n(career,'stamina',state.health.fitness)+Math.max(1,3+coachBonus)));setN(career,'fightIQ',clamp(n(career,'fightIQ',state.character.stats.intelligence*.4)+Math.max(1,2+coachBonus)));syncCompositeSkill(career);state.health.fitness=clamp(state.health.fitness+2);state.character.secondary.athleticism=clamp(state.character.secondary.athleticism+1);
  return{success:true,messages:[{text:`You completed a combat-sport training block at ${world.name}. Your persistent coaches and training partners now influence the environment around your career.`}]};
}

export function takeCombatFight(state:GameState,miniGameScore?:number):EngineResult{
  const career=track(state);if(state.character.age<16||career.active!==true)return{success:false,messages:[{text:'You are not ready for a sanctioned fictional bout.'}]};const gate=consumeAction(state,{policy:'special.fight'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const world=ensureCombatCareerWorld(state,{announce:false});const rosterRng=createRng(`${state.seed}-combat-roster-on-demand-${world.id}-${state.character.age}`);const used=usedNames(state);replenishGroup(state,world,'rivals',rosterRng,used);const view=combatCareerWorldView(state,world)!;const rng=createRng(`${state.seed}-combat-fight-${world.id}`,state.rngCounter);const opponentId=rng.pick(view.rivalNpcIds);const opponent=state.npcs[opponentId]!;const opponentRel=relation(state,opponentId);const rivalGroup=groupFor(world,'rivals');
  const detail=syncCompositeSkill(career);const playerPower=clamp(detail*.85+n(career,'skill',detail)*.15);const opponentPower=clamp(25+opponent.health*.18+(rivalGroup?.prestige??50)*.34+rng.int(-9,10),28,92);const challengeBonus=miniGameScore===undefined?0:(clamp(miniGameScore)-50)*.35;const win=rng.chance(clamp(50+(playerPower-opponentPower)*1.15+challengeBonus,8,92)/100);setN(career,'fights',n(career,'fights')+1);career.lastOpponentNpcId=opponentId;career.lastFightWorldId=world.id;career.lastFightResult=win?'win':'loss';setN(career,'lastFightAge',state.character.age);
  let purse=0;
  if(win){setN(career,'wins',n(career,'wins')+1);setN(career,'reputation',clamp(n(career,'reputation')+5));purse=Math.round((650+n(career,'reputation')*310)*(.84+view.prestige/250));state.finances.cash+=purse;state.fame.fame=clamp(state.fame.fame+2);if(rivalGroup)rivalGroup.prestige=clamp(rivalGroup.prestige+1);}else{setN(career,'losses',n(career,'losses')+1);setN(career,'reputation',clamp(n(career,'reputation')-1));state.character.stats.health=clamp(state.character.stats.health-rng.int(1,8));state.character.secondary.stress=clamp(state.character.secondary.stress+2);}
  setN(career,'lastFightPurse',purse);
  if(opponentRel){const delta=win?-3:2;opponentRel.score=clamp(opponentRel.score+delta);opponent.hiddenOpinion=clamp(opponent.hiddenOpinion+delta*.5,-100,100);setN(career,'rivalryTemperature',clamp(100-opponentRel.score));}
  opponent.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'combat_bout',sentiment:win?-5:2,summary:win?`${state.character.firstName} defeated you in a fictional sanctioned bout connected to ${world.name}.`:`You defeated ${state.character.firstName} in a fictional sanctioned bout connected to ${world.name}.`,permanent:false});opponent.memories=opponent.memories.slice(-36);
  const earnedFirstTitle=n(career,'wins')>=10&&n(career,'reputation')>=65&&n(career,'titles')<1;if(earnedFirstTitle){setN(career,'titles',1);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`Your record through ${world.name} earned you your first fictional combat-sport title.`,npcIds:[opponentId]});}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:win?2:1,text:win?`You defeated ${opponent.firstName} ${opponent.lastName} in a fictional sanctioned bout connected to ${world.name}${purse?` and earned ${purse.toLocaleString()}`:''}.`:`${opponent.firstName} ${opponent.lastName} defeated you in a fictional sanctioned bout connected to ${world.name}.`,npcIds:[opponentId]});state.rngCounter=rng.counter();
  return{success:win,messages:[{text:win?`You won against ${opponent.firstName} ${opponent.lastName}. The persistent rivalry and career record were updated.`:`You lost to ${opponent.firstName} ${opponent.lastName}. The result and exact rival remain part of your career history.`}],stateChanges:['combatCareer','relationships','timeline']};
}

export function processCombatCareerYear(state:GameState){
  const career=state.specialCareers.combat as Track|undefined;if(!career)return;const active=career.active===true&&career.leftPath!==true;
  if(!active){const world=activeCombatCareerWorld(state);if(world)archiveCombatCareerWorld(world,state.character.age);return;}
  if(n(career,'lastCombatWorldProcessAge',-1)===state.character.age)return;setN(career,'lastCombatWorldProcessAge',state.character.age);const world=ensureCombatCareerWorld(state,{announce:false});
  for(const member of world.members){const npc=state.npcs[member.npcId];if(!npc?.alive)member.leftAge??=state.character.age;}
  const rng=createRng(`${state.seed}-combat-world-year-${world.id}-${state.currentYear}`);const used=usedNames(state);for(const key of ['coaches','training','rivals'] as const)replenishGroup(state,world,key,rng,used);for(const group of world.groups)group.prestige=clamp(group.prestige+rng.int(-2,3));
  for(const member of world.members){if(member.leftAge!==undefined||!state.npcs[member.npcId]?.alive)continue;const rel=relation(state,member.npcId);if(rel)rel.yearsKnown=Math.max(rel.yearsKnown,state.character.age-member.joinedAge+1);}
  const view=combatCareerWorldView(state,world)!;
  career.worldId=world.id;career.worldName=world.name;setN(career,'worldPrestige',view.prestige);setN(career,'coachSupport',view.coachSupport);setN(career,'gymChemistry',view.trainingChemistry);setN(career,'rivalryTemperature',view.rivalPressure);const detail=syncCompositeSkill(career);setN(career,'careerMomentum',clamp(detail*.45+view.prestige*.18+view.coachSupport*.15+view.trainingChemistry*.12+(100-view.rivalPressure)*.10));
  if(view.coachSupport>=78){setN(career,'fightIQ',clamp(n(career,'fightIQ',25)+1));setN(career,'skill',clamp(n(career,'skill',detail)+.5));state.character.secondary.confidence=clamp(state.character.secondary.confidence+1);}else if(view.coachSupport<=28)state.character.secondary.stress=clamp(state.character.secondary.stress+2);
  if(view.rivalPressure>=78)state.character.secondary.stress=clamp(state.character.secondary.stress+1);
}
