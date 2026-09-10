import type { GameState, Npc, Relationship, RelationshipType } from '../types/game';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { ensureNpcLife } from './NpcLifeSystem';

const PARENTAL_TYPES = new Set<RelationshipType>(['parent','stepparent']);
const COOLDOWN_YEARS = 2;

function parentalRelationship(state:GameState,npcId:string){
  return state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged&&PARENTAL_TYPES.has(rel.type));
}

function tensionKind(partnerId:string){return `family_household_tension:${partnerId}`;}

function appendBoundedMemory(state:GameState,npc:Npc,kind:string,sentiment:number,summary:string,permanent=false){
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:npc.age,kind,sentiment,summary,permanent});
  if(npc.memories.length<=36)return;
  const permanentMemories=npc.memories.filter(memory=>memory.permanent);
  const recent=npc.memories.filter(memory=>!memory.permanent).slice(-Math.max(0,36-permanentMemories.length));
  npc.memories=[...permanentMemories.slice(-18),...recent].slice(-36);
}

function addFamilyMemory(state:GameState,npc:Npc,partnerId:string,sentiment:number,summary:string){
  appendBoundedMemory(state,npc,tensionKind(partnerId),sentiment,summary);
}

export function familyConflictPressure(state:GameState,firstNpcId:string,secondNpcId:string){
  const relationships=[parentalRelationship(state,firstNpcId),parentalRelationship(state,secondNpcId)].filter((rel):rel is Relationship=>Boolean(rel));
  if(relationships.length<2)return 0;
  const hostile=relationships.filter(rel=>rel.score<=20);
  if(!hostile.length)return 0;
  const worst=Math.min(...hostile.map(rel=>rel.score));
  return clamp(.25+(20-worst)/25+Math.max(0,hostile.length-1)*.15,.25,1);
}

function stabilityProtection(first:Npc,second:Npc){
  let protection=0;
  if(first.traits.includes('loyal'))protection+=.025;
  if(second.traits.includes('loyal'))protection+=.025;
  if(first.traits.includes('calm')&&second.traits.includes('calm'))protection+=.015;
  return protection;
}

function separationChance(first:Npc,second:Npc,pressure:number,tensionCount:number){
  const history=Math.min(.14,Math.max(0,tensionCount-2)*.03);
  const protection=stabilityProtection(first,second);
  const married=first.maritalStatus==='married'&&second.maritalStatus==='married';
  const engaged=first.maritalStatus==='engaged'||second.maritalStatus==='engaged';
  if(married)return clamp(.025+pressure*.11+history-protection,.01,.30);
  if(engaged)return clamp(.07+pressure*.16+history-protection,.03,.45);
  return clamp(.09+pressure*.18+history-protection,.04,.50);
}

function resetHouseholdAfterSeparation(state:GameState,npc:Npc){
  const life=ensureNpcLife(state,npc);
  if(life.legal.sentenceRemaining>0)return;
  life.household.status='independent';
  life.finance.housing=life.finance.propertyValue>0?'owning':'renting';
}

function separateCouple(state:GameState,first:Npc,second:Npc){
  const married=first.maritalStatus==='married'&&second.maritalStatus==='married';
  first.maritalStatus=married?'divorced':'single';second.maritalStatus=married?'divorced':'single';
  first.partnerId=undefined;second.partnerId=undefined;
  resetHouseholdAfterSeparation(state,first);resetHouseholdAfterSeparation(state,second);
  const kind=married?'divorce':'breakup';
  appendBoundedMemory(state,first,kind,-10,`${married?'Divorced':'Separated from'} ${second.firstName} ${second.lastName} after sustained household conflict.`,true);
  appendBoundedMemory(state,second,kind,-10,`${married?'Divorced':'Separated from'} ${first.firstName} ${first.lastName} after sustained household conflict.`,true);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text:`After sustained tension at home, ${first.firstName} and ${second.firstName} ${married?'divorced':'separated'}.`,npcIds:[first.id,second.id]});
}

interface FamilyCouple {first:Npc;second:Npc;key:string;}

function parentalCouples(state:GameState){
  const seen=new Set<string>();const couples:FamilyCouple[]=[];
  for(const rel of state.relationships){
    if(rel.estranged||!PARENTAL_TYPES.has(rel.type))continue;
    const first=state.npcs[rel.npcId];if(!first?.alive||!first.partnerId)continue;
    const second=state.npcs[first.partnerId];if(!second?.alive||!parentalRelationship(state,second.id))continue;
    if(second.partnerId!==first.id)continue;
    if(!['dating','engaged','married'].includes(first.maritalStatus)||!['dating','engaged','married'].includes(second.maritalStatus))continue;
    const key=[first.id,second.id].sort().join('|');if(seen.has(key))continue;seen.add(key);
    const [left,right]=first.id.localeCompare(second.id)<=0?[first,second]:[second,first];
    couples.push({first:left,second:right,key});
  }
  return couples.sort((a,b)=>a.key.localeCompare(b.key));
}

export function processFamilyConflictYear(state:GameState){
  let events=0;
  for(const {first,second} of parentalCouples(state)){
    const pressure=familyConflictPressure(state,first.id,second.id);if(pressure<=0)continue;
    const kind=tensionKind(second.id);const previous=first.memories.filter(memory=>memory.kind===kind);
    const latest=previous.at(-1);if(latest&&state.currentYear-latest.year<COOLDOWN_YEARS)continue;

    const sentiment=-Math.round(8+pressure*8);
    addFamilyMemory(state,first,second.id,sentiment,`Household tension grew around conflict involving ${state.character.firstName}.`);
    addFamilyMemory(state,second,first.id,sentiment,`Household tension grew around conflict involving ${state.character.firstName}.`);
    first.happiness=clamp(first.happiness-2-pressure*2);second.happiness=clamp(second.happiness-2-pressure*2);
    state.character.secondary.stress=clamp(state.character.secondary.stress+2+pressure*2);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`Tension between you and your family spilled into ${first.firstName} and ${second.firstName}'s relationship.`,npcIds:[first.id,second.id]});
    events+=1;

    const tensionCount=previous.length+1;if(tensionCount<2)continue;
    const rng=createRng(state.seed,state.rngCounter);
    const shouldSeparate=rng.chance(separationChance(first,second,pressure,tensionCount));state.rngCounter=rng.counter();
    if(shouldSeparate)separateCouple(state,first,second);
  }
  return events;
}
