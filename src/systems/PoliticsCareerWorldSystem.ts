import { getNamePool } from '../data/names';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, Npc, Orientation, RelationshipType, SocialWorld, SocialWorldMemberRole } from '../types/game';
import { ensureNpcLife } from './NpcLifeSystem';
import { assignGeneratedNpcOrientation } from './NpcOrientationSystem';

type Track = Record<string, number | string | boolean>;
type GroupKey = 'staff' | 'coalition' | 'opposition';
type Rng = ReturnType<typeof createRng>;

type PoliticsGroupDefinition = {
  key: GroupKey;
  name: string;
  min: number;
  max: number;
  ageOffset: [number, number];
};

const NPC_TRAITS = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];
const OFFICE_NAMES = {
  local:['Civic Hall','Community Council','Municipal Forum','Neighborhood Chamber'],
  regional:['Regional Assembly','Commonwealth Council','Regional Forum','Public Affairs Chamber'],
  national:['National Chamber','Federal Forum','Public Executive Office','National Civic Council'],
} as const;
const GROUPS: PoliticsGroupDefinition[] = [
  {key:'staff',name:'Office Staff',min:2,max:3,ageOffset:[-5,18]},
  {key:'coalition',name:'Political Allies',min:2,max:4,ageOffset:[-8,22]},
  {key:'opposition',name:'Political Opposition',min:2,max:3,ageOffset:[-7,20]},
];

function readTrack(state:GameState){return (state.specialCareers.politics??{}) as Track;}
function track(state:GameState){return (state.specialCareers.politics??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function groupKind(key:GroupKey){return `special:politics:${key}`;}
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
function hiddenOpinionAverage(state:GameState,ids:string[],fallback=0){return average(ids.map(id=>state.npcs[id]?.hiddenOpinion).filter((value):value is number=>typeof value==='number'),fallback);}

export function politicsOfficeLabel(level:number){if(level>=4)return 'National office';if(level>=3)return 'Regional office';if(level>=2)return 'City office';return 'Local office';}
function officeNamePool(level:number){return level>=4?OFFICE_NAMES.national:level>=3?OFFICE_NAMES.regional:OFFICE_NAMES.local;}
function usedNames(state:GameState){return new Set(Object.values(state.npcs).map(npc=>`${npc.firstName}|${npc.lastName}`));}
function uniqueName(state:GameState,rng:Rng,used:Set<string>){
  const pool=getNamePool(state.character.countryId);let firstName=rng.pick(pool.first);let lastName=rng.pick(pool.last);
  for(let tries=0;tries<16&&used.has(`${firstName}|${lastName}`);tries+=1){firstName=rng.pick(pool.first);lastName=rng.pick(pool.last);}
  used.add(`${firstName}|${lastName}`);return{firstName,lastName};
}
function createPoliticsNpc(state:GameState,key:GroupKey,definition:PoliticsGroupDefinition,rng:Rng,used:Set<string>):Npc{
  const {firstName,lastName}=uniqueName(state,rng,used);const minimumAge=25;const age=Math.max(minimumAge,state.character.age+rng.int(definition.ageOffset[0],definition.ageOffset[1]));
  const id=makeStateId(state,'special-politics-npc');const npc:Npc={
    id,firstName,lastName,age,alive:true,health:rng.int(55,96),happiness:rng.int(40,90),wealth:rng.int(8000,320000),countryId:state.character.countryId,city:state.character.city,
    sexuality:rng.pick<Orientation>(['straight','straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(18,88),maritalStatus:'single',traits:rng.shuffle(NPC_TRAITS).slice(0,3),hiddenOpinion:key==='opposition'?rng.int(-35,4):rng.int(-5,34),memories:[],parentIds:[],childIds:[],simulationTier:'background',
  };
  assignGeneratedNpcOrientation(state,npc);state.npcs[id]=npc;ensureNpcLife(state,npc);return npc;
}
function relationshipType(key:GroupKey):RelationshipType{return key==='opposition'?'enemy':'coworker';}
function ensurePoliticsRelationship(state:GameState,world:SocialWorld,npc:Npc,key:GroupKey,rng:Rng){
  const existing=state.relationships.find(rel=>rel.npcId===npc.id);
  if(existing)return;
  const type=relationshipType(key);state.relationships.push({id:makeStateId(state,'rel'),npcId:npc.id,type,score:key==='opposition'?rng.int(16,40):key==='staff'?rng.int(52,76):rng.int(44,72),attraction:rng.int(0,40),compatibility:rng.int(30,88),yearsKnown:0});
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'special_politics',sentiment:key==='opposition'?-2:2,summary:key==='opposition'?`You became a recurring political opponent of ${state.character.firstName} through ${world.name}.`:`You began working in ${state.character.firstName}'s political circle through ${world.name}.`});
}
function addMemory(state:GameState,npcId:string|undefined,kind:string,sentiment:number,summary:string){
  if(!npcId)return;const npc=state.npcs[npcId];if(!npc)return;npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent:false});npc.memories=npc.memories.slice(-36);
}
function memberRole(key:GroupKey,index:number):SocialWorldMemberRole{return (key==='staff'||key==='opposition')&&index===0?'leader':'member';}
function addMember(state:GameState,world:SocialWorld,key:GroupKey,definition:PoliticsGroupDefinition,rng:Rng,used:Set<string>,role:SocialWorldMemberRole='member'){
  const npc=createPoliticsNpc(state,key,definition,rng,used);const group=groupFor(world,key);if(!group)throw new Error(`Politics world ${world.id} is missing ${key}.`);group.memberNpcIds.push(npc.id);world.members.push({npcId:npc.id,role,joinedAge:state.character.age,groupIds:[group.id]});ensurePoliticsRelationship(state,world,npc,key,rng);return npc;
}
function carryoverCandidate(state:GameState,world:SocialWorld|undefined,key:GroupKey){
  if(!world)return undefined;const group=groupFor(world,key);const ids=(group?.memberNpcIds??[]).filter(id=>state.npcs[id]?.alive);const candidates=ids.map(id=>({id,rel:relation(state,id)})).filter(item=>{
    if(!item.rel)return false;if(key==='opposition')return item.rel.type==='enemy'&&item.rel.score<=55;return item.rel.type!=='enemy'&&item.rel.score>=42;
  });
  candidates.sort((a,b)=>key==='opposition'?a.rel!.score-b.rel!.score:b.rel!.score-a.rel!.score||a.id.localeCompare(b.id));return candidates[0]?.id;
}
function attachExistingMember(state:GameState,world:SocialWorld,npcId:string,key:GroupKey,role:SocialWorldMemberRole){
  const group=groupFor(world,key);if(!group||!state.npcs[npcId])return false;group.memberNpcIds.push(npcId);world.members.push({npcId,role,joinedAge:state.character.age,groupIds:[group.id]});return true;
}

export function politicsCareerWorlds(state:GameState){return (state.socialWorlds??[]).filter(world=>world.kind==='organization'&&world.id.startsWith('special-politics-'));}
export function activePoliticsCareerWorld(state:GameState):SocialWorld|undefined{return politicsCareerWorlds(state).filter(world=>world.active).sort((a,b)=>b.startedAge-a.startedAge||b.id.localeCompare(a.id))[0];}
export function archivePoliticsCareerWorld(world:SocialWorld,age:number){world.active=false;world.endedAge??=age;for(const member of world.members)member.leftAge??=age;}

function createPoliticsCareerWorld(state:GameState,officeLevel:number,options:{announce?:boolean}={}):SocialWorld{
  state.socialWorlds??=[];const career=track(state);const priorWorlds=politicsCareerWorlds(state).slice().sort((a,b)=>(b.endedAge??b.startedAge)-(a.endedAge??a.startedAge)||b.startedAge-a.startedAge);const prior=priorWorlds[0];const ordinal=priorWorlds.length+1;const rng=createRng(`${state.seed}-politics-world-${state.character.age}-${ordinal}-${officeLevel}`);const id=makeStateId(state,'special-politics');const groups:SocialWorld['groups']=[];
  for(const definition of GROUPS)groups.push({id:makeStateId(state,'special-politics-group'),name:definition.name,kind:groupKind(definition.key),minAge:25,memberNpcIds:[],prestige:rng.int(42,76)});
  const existingNames=new Set(priorWorlds.map(world=>world.name));const basePool=rng.shuffle(officeNamePool(officeLevel));const base=basePool.find(name=>!existingNames.has(`${politicsOfficeLabel(officeLevel)} · ${name}`))??`${rng.pick(officeNamePool(officeLevel))} ${ordinal}`;const world:SocialWorld={id,kind:'organization',name:`${politicsOfficeLabel(officeLevel)} · ${base}`,countryId:state.character.countryId,city:state.character.city,startedAge:state.character.age,active:true,members:[],groups};state.socialWorlds.push(world);const used=usedNames(state);
  for(const definition of GROUPS){const target=rng.int(definition.min,definition.max);const carried=carryoverCandidate(state,prior,definition.key);let count=0;if(carried&&attachExistingMember(state,world,carried,definition.key,memberRole(definition.key,0)))count=1;for(let index=count;index<target;index+=1)addMember(state,world,definition.key,definition,rng,used,memberRole(definition.key,index));}
  career.worldId=world.id;career.worldName=world.name;setN(career,'worldOfficeLevel',officeLevel);career.status='in office';setN(career,'termStartedAge',state.character.age);setN(career,'termEndAge',state.character.age+4);setN(career,'observedElectionsWon',n(career,'electionsWon'));setN(career,'termsStarted',n(career,'termsStarted')+1);
  if(options.announce!==false){const view=politicsCareerWorldView(state,world);const chief=view?.chiefStaffNpcId?state.npcs[view.chiefStaffNpcId]:undefined;const opponent=view?.opponentNpcId?state.npcs[view.opponentNpcId]:undefined;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:chief?`Your ${politicsOfficeLabel(officeLevel).toLowerCase()} took shape at ${world.name}, with ${chief.firstName} ${chief.lastName} leading your staff.`:`Your ${politicsOfficeLabel(officeLevel).toLowerCase()} took shape at ${world.name}.`,npcIds:[chief?.id,opponent?.id].filter((value):value is string=>Boolean(value))});}
  return world;
}

export function ensurePoliticsCareerWorld(state:GameState,options:{announce?:boolean;forceNew?:boolean}={}):SocialWorld|undefined{
  const career=readTrack(state);const office=n(career,'office');if(office<=0||career.leftPath===true)return undefined;const existing=activePoliticsCareerWorld(state);if(existing&&!options.forceNew&&n(career,'worldOfficeLevel',office)===office)return existing;if(existing)archivePoliticsCareerWorld(existing,state.character.age);return createPoliticsCareerWorld(state,office,{announce:options.announce});
}

function ensureGroupLeadership(state:GameState,world:SocialWorld,key:'staff'|'opposition',rng:Rng,used:Set<string>){
  const active=activeMemberIds(state,world,key);const group=groupFor(world,key);if(!group)return undefined;const livingLeader=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&active.includes(member.npcId)&&member.groupIds.includes(group.id)&&state.npcs[member.npcId]?.alive);if(livingLeader)return livingLeader.npcId;
  if(active.length){const promotedId=rng.pick(active);const member=world.members.find(item=>item.npcId===promotedId&&item.leftAge===undefined&&item.groupIds.includes(group.id));if(member)member.role='leader';addMemory(state,promotedId,'politics_role_change',key==='opposition'?-1:2,key==='staff'?`You became the senior staff lead in ${world.name}.`:`You became the principal political opponent in ${world.name}.`);return promotedId;}
  const definition=GROUPS.find(item=>item.key===key)!;return addMember(state,world,key,definition,rng,used,'leader').id;
}
function replenishGroup(state:GameState,world:SocialWorld,key:GroupKey,rng:Rng,used:Set<string>){
  const definition=GROUPS.find(item=>item.key===key)!;if(key==='staff'||key==='opposition')ensureGroupLeadership(state,world,key,rng,used);let active=activeMemberIds(state,world,key);while(active.length<definition.min){const role=(key==='staff'||key==='opposition')&&!world.members.some(member=>member.role==='leader'&&member.leftAge===undefined&&member.groupIds.includes(groupFor(world,key)!.id)&&state.npcs[member.npcId]?.alive)?'leader':'member';const npc=addMember(state,world,key,definition,rng,used,role);active=[...active,npc.id];}
}

export interface PoliticsCareerWorldView {
  worldId: string;
  worldName: string;
  officeLevel: number;
  chiefStaffNpcId?: string;
  opponentNpcId?: string;
  staffNpcIds: string[];
  coalitionNpcIds: string[];
  oppositionNpcIds: string[];
  staffSupport: number;
  coalitionSupport: number;
  oppositionPressure: number;
  prestige: number;
  politicalStanding: number;
}

export function politicsCareerWorldView(state:GameState,world=activePoliticsCareerWorld(state)):PoliticsCareerWorldView|undefined{
  if(!world)return;const career=readTrack(state);const staffIds=activeMemberIds(state,world,'staff');const coalitionIds=activeMemberIds(state,world,'coalition');const oppositionIds=activeMemberIds(state,world,'opposition');const staffGroup=groupFor(world,'staff');const oppositionGroup=groupFor(world,'opposition');const chiefStaffNpcId=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&member.groupIds.includes(staffGroup?.id??'')&&state.npcs[member.npcId]?.alive)?.npcId;const opponentNpcId=world.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&member.groupIds.includes(oppositionGroup?.id??'')&&state.npcs[member.npcId]?.alive)?.npcId;
  const staffSupport=clamp(relationshipAverage(state,staffIds,55));const coalitionSupport=clamp(relationshipAverage(state,coalitionIds,52));const oppositionRelationship=relationshipAverage(state,oppositionIds,30);const oppositionOpinion=hiddenOpinionAverage(state,oppositionIds,-15);const oppositionPressure=clamp((100-oppositionRelationship)*.72+Math.max(0,-oppositionOpinion)*.28);const prestige=clamp(average(world.groups.map(group=>group.prestige),50));const approval=clamp(n(career,'approval',50));const politicalStanding=clamp(approval*.42+staffSupport*.2+coalitionSupport*.2+prestige*.12+(100-oppositionPressure)*.06);
  return{worldId:world.id,worldName:world.name,officeLevel:n(career,'worldOfficeLevel',n(career,'office',1)),chiefStaffNpcId,opponentNpcId,staffNpcIds:staffIds,coalitionNpcIds:coalitionIds,oppositionNpcIds:oppositionIds,staffSupport,coalitionSupport,oppositionPressure,prestige,politicalStanding};
}

function renewTermIfElectionObserved(state:GameState,career:Track,world:SocialWorld,view:PoliticsCareerWorldView){
  const wins=n(career,'electionsWon');const observed=n(career,'observedElectionsWon');if(wins<=observed)return false;setN(career,'observedElectionsWon',wins);
  // The legacy campaign action can be invoked before a term is due. Preserve that action's result, but only a win observed at the term boundary renews the office chapter.
  if(state.character.age<n(career,'termEndAge',state.character.age+1))return false;
  setN(career,'termStartedAge',state.character.age);setN(career,'termEndAge',state.character.age+4);setN(career,'termsStarted',n(career,'termsStarted')+1);const chief=view.chiefStaffNpcId?state.npcs[view.chiefStaffNpcId]:undefined;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You began another term at ${world.name}.`,npcIds:chief?[chief.id]:undefined});addMemory(state,chief?.id,'politics_term_renewed',3,`${state.character.firstName} began another term while you remained part of the political staff.`);return true;
}
function finishTerm(state:GameState,career:Track,world:SocialWorld,view:PoliticsCareerWorldView){
  archivePoliticsCareerWorld(world,state.character.age);setN(career,'office',0);career.active=false;career.status='between offices';setN(career,'termsCompleted',n(career,'termsCompleted')+1);const chief=view.chiefStaffNpcId?state.npcs[view.chiefStaffNpcId]:undefined;const opponent=view.opponentNpcId?state.npcs[view.opponentNpcId]:undefined;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`Your term at ${world.name} concluded. The people and political history from that office were preserved.`,npcIds:[chief?.id,opponent?.id].filter((value):value is string=>Boolean(value))});addMemory(state,chief?.id,'politics_term_end',1,`${state.character.firstName}'s term at ${world.name} concluded.`);addMemory(state,opponent?.id,'politics_term_end',0,`${state.character.firstName}'s term at ${world.name} concluded.`);
}

export function processPoliticsCareerYear(state:GameState){
  const career=state.specialCareers.politics as Track|undefined;if(!career)return;const office=n(career,'office');const active=office>0&&career.leftPath!==true;
  if(!active){const world=activePoliticsCareerWorld(state);if(world)archivePoliticsCareerWorld(world,state.character.age);return;}
  if(n(career,'lastPoliticsWorldProcessAge',-1)===state.character.age)return;setN(career,'lastPoliticsWorldProcessAge',state.character.age);
  let world=activePoliticsCareerWorld(state);if(world&&n(career,'worldOfficeLevel',office)!==office){archivePoliticsCareerWorld(world,state.character.age);world=undefined;}
  if(!world)world=createPoliticsCareerWorld(state,office,{announce:true});
  for(const member of world.members){const npc=state.npcs[member.npcId];if(!npc?.alive)member.leftAge??=state.character.age;}
  const rng=createRng(`${state.seed}-politics-world-year-${world.id}-${state.currentYear}`);const used=usedNames(state);for(const key of ['staff','coalition','opposition'] as const)replenishGroup(state,world,key,rng,used);for(const group of world.groups)group.prestige=clamp(group.prestige+rng.int(-2,3));
  for(const member of world.members){if(member.leftAge!==undefined||!state.npcs[member.npcId]?.alive)continue;const rel=relation(state,member.npcId);if(rel)rel.yearsKnown=Math.max(rel.yearsKnown,state.character.age-member.joinedAge+1);}
  const view=politicsCareerWorldView(state,world)!;career.worldId=world.id;career.worldName=world.name;setN(career,'worldOfficeLevel',office);setN(career,'staffSupport',view.staffSupport);setN(career,'coalitionSupport',view.coalitionSupport);setN(career,'oppositionPressure',view.oppositionPressure);setN(career,'officePrestige',view.prestige);setN(career,'politicalStanding',view.politicalStanding);career.chiefStaffNpcId=view.chiefStaffNpcId??'';career.opponentNpcId=view.opponentNpcId??'';career.status='in office';
  const renewed=renewTermIfElectionObserved(state,career,world,view);let approvalDelta=0;if(view.staffSupport>=72)approvalDelta+=1;else if(view.staffSupport<=32)approvalDelta-=1;if(view.coalitionSupport>=68)approvalDelta+=1;else if(view.coalitionSupport<=30)approvalDelta-=1;if(view.oppositionPressure>=78)approvalDelta-=1;setN(career,'approval',clamp(n(career,'approval',50)+approvalDelta));
  if(view.staffSupport>=75&&view.coalitionSupport>=68)state.character.secondary.confidence=clamp(state.character.secondary.confidence+1);if(view.staffSupport<=30||view.oppositionPressure>=82)state.character.secondary.stress=clamp(state.character.secondary.stress+1);
  const approval=n(career,'approval',50);for(const npcId of [...view.staffNpcIds,...view.coalitionNpcIds]){const rel=relation(state,npcId);if(rel)rel.score=clamp(rel.score+(approval>=65?1:approval<=32?-1:0));const npc=state.npcs[npcId];if(npc)npc.hiddenOpinion=clamp(npc.hiddenOpinion+(approval>=65?1:approval<=32?-1:0),-100,100);}for(const npcId of view.oppositionNpcIds){const rel=relation(state,npcId);if(rel&&approval>=70)rel.score=clamp(rel.score-1);const npc=state.npcs[npcId];if(npc&&approval>=70)npc.hiddenOpinion=clamp(npc.hiddenOpinion-1,-100,100);}
  if(!renewed&&state.character.age>=n(career,'termEndAge',state.character.age+1))finishTerm(state,career,world,view);
}
