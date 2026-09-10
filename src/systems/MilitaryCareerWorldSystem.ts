import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, Npc, Orientation, RelationshipType, SocialWorld, SocialWorldMemberRole } from '../types/game';
import { ensureNpcLife } from './NpcLifeSystem';
import { assignGeneratedNpcOrientation } from './NpcOrientationSystem';
import { pickCollisionAwareNpcName } from './NpcNamingSystem';

type Track = Record<string, number | string | boolean>;
type GroupKey = 'command' | 'peers' | 'support';
type Rng = ReturnType<typeof createRng>;

type MilitaryGroupDefinition = {
  key: GroupKey;
  name: string;
  min: number;
  max: number;
  ageOffset: [number, number];
};

const NPC_TRAITS = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];
const UNIT_NAMES = ['Northstar Readiness Group','Meridian Service Unit','Harborlight Support Wing','Pioneer Response Group','Stonebridge Service Command','Crescent Logistics Unit','Silverline Readiness Wing','Aurora Support Command'];
const GROUPS: MilitaryGroupDefinition[] = [
  {key:'command',name:'Command Team',min:2,max:3,ageOffset:[2,20]},
  {key:'peers',name:'Service Peers',min:4,max:6,ageOffset:[-3,7]},
  {key:'support',name:'Unit Support',min:2,max:4,ageOffset:[-2,12]},
];

function readTrack(state:GameState){return (state.specialCareers.military??{}) as Track;}
function track(state:GameState){return (state.specialCareers.military??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function groupKind(key:GroupKey){return `special:military:${key}`;}
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

function usedNames(state:GameState){return new Set(Object.values(state.npcs).map(npc=>`${npc.firstName}|${npc.lastName}`));}
function uniqueName(state:GameState,rng:Rng,used:Set<string>){
  const {firstName,lastName}=pickCollisionAwareNpcName(state,rng);used.add(`${firstName}|${lastName}`);return{firstName,lastName};
}
function createMilitaryNpc(state:GameState,key:GroupKey,definition:MilitaryGroupDefinition,rng:Rng,used:Set<string>):Npc{
  const {firstName,lastName}=uniqueName(state,rng,used);const minimumAge=key==='command'?24:18;const age=Math.max(minimumAge,state.character.age+rng.int(definition.ageOffset[0],definition.ageOffset[1]));
  const id=makeStateId(state,'special-military-npc');const npc:Npc={
    id,firstName,lastName,age,alive:true,health:rng.int(62,98),happiness:rng.int(42,90),wealth:rng.int(5000,170000),countryId:state.character.countryId,city:state.character.city,
    sexuality:rng.pick<Orientation>(['straight','straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(18,88),maritalStatus:'single',traits:rng.shuffle(NPC_TRAITS).slice(0,3),hiddenOpinion:rng.int(-8,28),memories:[],parentIds:[],childIds:[],simulationTier:'background',
  };
  assignGeneratedNpcOrientation(state,npc);state.npcs[id]=npc;ensureNpcLife(state,npc);return npc;
}
function relationshipType(key:GroupKey,role:SocialWorldMemberRole):RelationshipType{return key==='command'&&role==='leader'?'boss':'coworker';}
function ensureMilitaryRelationship(state:GameState,world:SocialWorld,npc:Npc,key:GroupKey,role:SocialWorldMemberRole,rng:Rng){
  const existing=state.relationships.find(rel=>rel.npcId===npc.id);
  if(existing){if(key==='command'&&role==='leader')existing.type='boss';return;}
  const type=relationshipType(key,role);
  state.relationships.push({id:makeStateId(state,'rel'),npcId:npc.id,type,score:type==='boss'?rng.int(46,68):rng.int(42,72),attraction:rng.int(0,42),compatibility:rng.int(34,88),yearsKnown:0});
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'special_military',sentiment:type==='boss'?3:2,summary:type==='boss'?`You became part of ${state.character.firstName}'s command chain through ${world.name}.`:`You began serving alongside ${state.character.firstName} through ${world.name}.`});
}
function addMember(state:GameState,world:SocialWorld,key:GroupKey,definition:MilitaryGroupDefinition,rng:Rng,used:Set<string>,leader=false){
  const npc=createMilitaryNpc(state,key,definition,rng,used);const group=groupFor(world,key);if(!group)throw new Error(`Military world ${world.id} is missing ${key}.`);
  const role:SocialWorldMemberRole=leader?'leader':'member';group.memberNpcIds.push(npc.id);world.members.push({npcId:npc.id,role,joinedAge:state.character.age,groupIds:[group.id]});ensureMilitaryRelationship(state,world,npc,key,role,rng);return npc;
}
function addMemory(state:GameState,npcId:string|undefined,kind:string,sentiment:number,summary:string){
  if(!npcId)return;const npc=state.npcs[npcId];if(!npc)return;
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent:false});npc.memories=npc.memories.slice(-36);
}

export function militaryCareerWorlds(state:GameState){return (state.socialWorlds??[]).filter(world=>world.kind==='organization'&&world.id.startsWith('special-military-'));}
export function activeMilitaryCareerWorld(state:GameState){return militaryCareerWorlds(state).find(world=>world.active);}
export function archiveMilitaryCareerWorld(world:SocialWorld,age:number){world.active=false;world.endedAge??=age;for(const member of world.members)member.leftAge??=age;}

export function ensureMilitaryCareerWorld(state:GameState,options:{announce?:boolean;forceNew?:boolean}={}):SocialWorld{
  state.socialWorlds??=[];const existing=activeMilitaryCareerWorld(state);if(existing&&!options.forceNew)return existing;
  if(existing&&options.forceNew)archiveMilitaryCareerWorld(existing,state.character.age);
  const career=track(state);const branch=String(career.branch??'Military');const priorWorlds=militaryCareerWorlds(state);const ordinal=priorWorlds.length+1;const rng=createRng(`${state.seed}-military-world-${state.character.age}-${ordinal}-${branch}-${String(career.path??'service')}`);const id=makeStateId(state,'special-military');const groups:SocialWorld['groups']=[];
  for(const definition of GROUPS)groups.push({id:makeStateId(state,'special-military-group'),name:definition.name,kind:groupKind(definition.key),minAge:18,memberNpcIds:[],prestige:rng.int(44,76)});
  const usedWorldNames=new Set(priorWorlds.map(world=>world.name));const availableNames=rng.shuffle(UNIT_NAMES).filter(name=>!usedWorldNames.has(`${branch} · ${name}`));const unitName=availableNames[0]??`${rng.pick(UNIT_NAMES)} ${ordinal}`;
  const world:SocialWorld={id,kind:'organization',name:`${branch} · ${unitName}`,countryId:state.character.countryId,city:state.character.city,startedAge:state.character.age,active:true,members:[],groups};state.socialWorlds.push(world);
  const used=usedNames(state);
  for(const definition of GROUPS){const count=rng.int(definition.min,definition.max);for(let index=0;index<count;index+=1)addMember(state,world,definition.key,definition,rng,used,definition.key==='command'&&index===0);}
  career.worldId=world.id;career.worldName=world.name;career.postingStartedAge=state.character.age;setN(career,'postings',n(career,'postings')+1);setN(career,'postingEndAge',state.character.age+rng.int(3,6));
  if(typeof career.lastObservedRank!=='number')setN(career,'lastObservedRank',n(career,'rank',1));
  career.status='active service';
  if(options.announce!==false){const commander=activeMemberIds(state,world,'command')[0];const peer=activeMemberIds(state,world,'peers')[0];const commanderNpc=commander?state.npcs[commander]:undefined;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:commanderNpc?`You were posted to ${world.name} under Commander ${commanderNpc.firstName} ${commanderNpc.lastName}.`:`You were posted to ${world.name}.`,npcIds:[commander,peer].filter((value):value is string=>Boolean(value))});}
  return world;
}

function ensureCommandLeadership(state:GameState,world:SocialWorld,rng:Rng,used:Set<string>){
  const active=activeMemberIds(state,world,'command');const livingLeader=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive&&active.includes(member.npcId));
  if(livingLeader)return livingLeader.npcId;
  if(active.length){
    const promotedId=rng.pick(active);const member=world.members.find(item=>item.npcId===promotedId&&item.leftAge===undefined);if(member)member.role='leader';const rel=relation(state,promotedId);if(rel)rel.type='boss';
    const promoted=state.npcs[promotedId];if(promoted)addMemory(state,promotedId,'military_command_change',2,`You assumed command responsibilities in ${world.name} during ${state.character.firstName}'s service.`);return promotedId;
  }
  const definition=GROUPS.find(group=>group.key==='command')!;return addMember(state,world,'command',definition,rng,used,true).id;
}
function replenishGroup(state:GameState,world:SocialWorld,key:GroupKey,rng:Rng,used:Set<string>){
  const definition=GROUPS.find(group=>group.key===key)!;let active=activeMemberIds(state,world,key);
  if(key==='command')ensureCommandLeadership(state,world,rng,used);
  active=activeMemberIds(state,world,key);
  while(active.length<definition.min){const leader=key==='command'&&!world.members.some(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive);const npc=addMember(state,world,key,definition,rng,used,leader);active=[...active,npc.id];}
}

export interface MilitaryCareerWorldView {
  worldId: string;
  worldName: string;
  commanderNpcId?: string;
  peerNpcIds: string[];
  supportNpcIds: string[];
  commandSupport: number;
  unitCohesion: number;
  prestige: number;
}

export function militaryCareerWorldView(state:GameState,world=activeMilitaryCareerWorld(state)):MilitaryCareerWorldView|undefined{
  if(!world)return;const commandIds=activeMemberIds(state,world,'command');const peerIds=activeMemberIds(state,world,'peers');const supportIds=activeMemberIds(state,world,'support');
  const leader=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&state.npcs[member.npcId]?.alive&&commandIds.includes(member.npcId));const commanderNpcId=leader?.npcId;
  const commandSupport=clamp(relationshipAverage(state,commandIds,55));const unitCohesion=clamp(relationshipAverage(state,[...peerIds,...supportIds],52));const prestige=clamp(average(world.groups.map(group=>group.prestige),50));
  return{worldId:world.id,worldName:world.name,commanderNpcId,peerNpcIds:peerIds,supportNpcIds:supportIds,commandSupport,unitCohesion,prestige};
}

function contextualizePromotion(state:GameState,career:Track,world:SocialWorld,view:MilitaryCareerWorldView){
  const rank=n(career,'rank',1);const previous=n(career,'lastObservedRank',rank);if(rank<=previous){setN(career,'lastObservedRank',rank);return;}
  const commander=view.commanderNpcId?state.npcs[view.commanderNpcId]:undefined;
  const entry=[...state.timeline].reverse().find(item=>item.age===state.character.age&&item.category==='career'&&item.text===`You advanced to military rank ${rank}.`);
  if(entry&&commander){entry.text=`Under Commander ${commander.firstName} ${commander.lastName} at ${world.name}, you advanced to military rank ${rank}.`;entry.npcIds=[commander.id];}
  if(commander){addMemory(state,commander.id,'military_promotion',4,`${state.character.firstName} advanced to military rank ${rank} while serving in your unit.`);career.lastPromotionCommanderNpcId=commander.id;career.lastPromotionWorldId=world.id;setN(career,'lastPromotionAge',state.character.age);}
  setN(career,'lastObservedRank',rank);
}

function rotatePostingIfDue(state:GameState,career:Track,world:SocialWorld){
  if(state.character.age<n(career,'postingEndAge',state.character.age+1))return world;
  const oldView=militaryCareerWorldView(state,world);const oldCommander=oldView?.commanderNpcId;archiveMilitaryCareerWorld(world,state.character.age);const next=ensureMilitaryCareerWorld(state,{announce:false,forceNew:true});const nextView=militaryCareerWorldView(state,next);const nextCommander=nextView?.commanderNpcId;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`Your service posting changed from ${world.name} to ${next.name}.`,npcIds:[oldCommander,nextCommander].filter((value):value is string=>Boolean(value))});
  addMemory(state,oldCommander,'military_posting_change',1,`${state.character.firstName} completed a posting with ${world.name} and transferred to another unit.`);return next;
}

export function processMilitaryCareerYear(state:GameState){
  const career=state.specialCareers.military as Track|undefined;if(!career)return;const active=career.active===true&&career.leftPath!==true;
  if(!active){const world=activeMilitaryCareerWorld(state);if(world)archiveMilitaryCareerWorld(world,state.character.age);return;}
  if(n(career,'lastMilitaryWorldProcessAge',-1)===state.character.age)return;setN(career,'lastMilitaryWorldProcessAge',state.character.age);
  const world=ensureMilitaryCareerWorld(state,{announce:!activeMilitaryCareerWorld(state)});
  for(const member of world.members){const npc=state.npcs[member.npcId];if(!npc?.alive)member.leftAge??=state.character.age;}
  const rng=createRng(`${state.seed}-military-world-year-${world.id}-${state.currentYear}`);const used=usedNames(state);for(const key of ['command','peers','support'] as const)replenishGroup(state,world,key,rng,used);for(const group of world.groups)group.prestige=clamp(group.prestige+rng.int(-2,3));
  for(const member of world.members){if(member.leftAge!==undefined||!state.npcs[member.npcId]?.alive)continue;const rel=relation(state,member.npcId);if(rel)rel.yearsKnown=Math.max(rel.yearsKnown,state.character.age-member.joinedAge+1);}
  const view=militaryCareerWorldView(state,world)!;career.worldId=world.id;career.worldName=world.name;setN(career,'unitPrestige',view.prestige);setN(career,'commandSupport',view.commandSupport);setN(career,'unitCohesion',view.unitCohesion);
  const standing=clamp(n(career,'skill',40)*.38+state.character.secondary.discipline*.24+view.commandSupport*.18+view.unitCohesion*.12+view.prestige*.08);setN(career,'serviceStanding',standing);
  if(view.commandSupport>=78&&view.unitCohesion>=68){state.character.secondary.confidence=clamp(state.character.secondary.confidence+1);state.character.secondary.discipline=clamp(state.character.secondary.discipline+1);}else if(view.commandSupport<=28){state.character.secondary.stress=clamp(state.character.secondary.stress+2);}
  if(view.unitCohesion<=30)state.character.secondary.stress=clamp(state.character.secondary.stress+1);
  contextualizePromotion(state,career,world,view);const current=rotatePostingIfDue(state,career,world);const currentView=militaryCareerWorldView(state,current);if(currentView){career.worldId=current.id;career.worldName=current.name;setN(career,'unitPrestige',currentView.prestige);setN(career,'commandSupport',currentView.commandSupport);setN(career,'unitCohesion',currentView.unitCohesion);}career.status='active service';
}
