import { EVERTHREAD_CITY } from '../data/countries';
import { TOWN_DISTRICTS, TOWN_PLACES } from '../data/townPlaces';
import type { CompletedLife, CompletedLifePlaceMilestone, GameState, TimelineEntry } from '../types/game';
import type { GenerationalPlaceMemoryProjection, PlaceLegacyMemory, PlaceLegacyPlace } from '../types/placeMemory';
import { businessWorkLocation } from './WorkingEverthreadSystem';

export const COMPLETED_LIFE_PLACE_MILESTONE_LIMIT=12;
export const PLACE_LEGACY_PER_PLACE_LIMIT=6;
export const PLACE_LEGACY_PLACE_LIMIT=8;
export const PLACE_LEGACY_TOTAL_LIMIT=24;

const PLACE_BY_ID=new Map(TOWN_PLACES.map(place=>[place.id,place] as const));
const DISTRICT_BY_ID=new Map(TOWN_DISTRICTS.map(district=>[district.id,district] as const));
const THREADWELL_PLACE_ID='threadwell-residential';

function validMilestone(entry:TimelineEntry):entry is TimelineEntry&{placeId:string;importance:2|3}{return Boolean(entry.placeId&&PLACE_BY_ID.has(entry.placeId)&&entry.importance>=2);}

export function timelinePlaceMilestones(entries:readonly TimelineEntry[],limit=COMPLETED_LIFE_PLACE_MILESTONE_LIMIT):CompletedLifePlaceMilestone[]{
  const result:CompletedLifePlaceMilestone[]=[];const seen=new Set<string>();
  for(let index=entries.length-1;index>=0&&result.length<Math.max(0,limit);index--){const entry=entries[index]!;if(!validMilestone(entry)||seen.has(entry.id))continue;seen.add(entry.id);result.push({id:entry.id,placeId:entry.placeId,year:entry.year,age:entry.age,category:entry.category,text:entry.text,importance:entry.importance});}
  return result.reverse();
}

export function snapshotCompletedLifePlaceMilestones(entries:readonly TimelineEntry[]){return timelinePlaceMilestones(entries,COMPLETED_LIFE_PLACE_MILESTONE_LIMIT);}

export function completedLifePlaceMilestones(life:CompletedLife):CompletedLifePlaceMilestone[]{
  if(Array.isArray(life.placeMilestones)){
    return life.placeMilestones.filter(item=>item&&typeof item.id==='string'&&typeof item.placeId==='string'&&PLACE_BY_ID.has(item.placeId)&&Number.isFinite(item.year)&&Number.isFinite(item.age)&&(item.importance===2||item.importance===3)).slice(-COMPLETED_LIFE_PLACE_MILESTONE_LIMIT).map(item=>({...item}));
  }
  return timelinePlaceMilestones(life.timeline??[]).map(item=>({...item}));
}

function placeFields(placeId:string){const place=PLACE_BY_ID.get(placeId);if(!place)return;const district=DISTRICT_BY_ID.get(place.districtId);if(!district)return;return{placeLabel:place.label,districtId:district.id,districtLabel:district.label};}

function milestoneMemory(milestone:CompletedLifePlaceMilestone,generation:number,current:boolean):PlaceLegacyMemory|undefined{
  const fields=placeFields(milestone.placeId);if(!fields)return;
  return{id:`${current?'current':'life'}:${generation}:${milestone.id}`,kind:'milestone',placeId:milestone.placeId,...fields,text:milestone.text,generation,current,year:milestone.year,age:milestone.age};
}

function currentFamilyLandmarks(state:GameState):PlaceLegacyMemory[]{
  const memories:PlaceLegacyMemory[]=[];const generation=state.legacy.generation;
  for(const property of state.assets.properties){if(property.origin!=='inherited'||property.location!==EVERTHREAD_CITY)continue;const fields=placeFields(THREADWELL_PLACE_ID);if(!fields)continue;memories.push({id:`family-home:${property.id}`,kind:'family_home',placeId:THREADWELL_PLACE_ID,...fields,text:`${property.name} remains part of your family thread.`,generation,current:true,sourceId:property.id});}
  for(const business of state.businesses){if(business.origin!=='inherited'||business.bankrupt)continue;const work=businessWorkLocation(state,business);if(!work.inEverthread||!work.anchorPlaceId)continue;const fields=placeFields(work.anchorPlaceId);if(!fields)continue;memories.push({id:`family-business:${business.id}`,kind:'family_business',placeId:work.anchorPlaceId,...fields,text:`${business.name} survives as a family business.`,generation,current:true,sourceId:business.id});}
  return memories;
}

export function generationalPlaceMemoryProjection(state:GameState):GenerationalPlaceMemoryProjection{
  const candidates:PlaceLegacyMemory[]=[...currentFamilyLandmarks(state)];
  for(const milestone of [...timelinePlaceMilestones(state.timeline)].reverse()) {const memory=milestoneMemory(milestone,state.legacy.generation,true);if(memory)candidates.push(memory);}
  const lives=state.completedLives.slice(-12);for(let index=lives.length-1;index>=0;index--){const life=lives[index]!;const generation=life.generation??Math.max(1,state.legacy.generation-(lives.length-index));for(const milestone of [...completedLifePlaceMilestones(life)].reverse()){const memory=milestoneMemory(milestone,generation,false);if(memory)candidates.push(memory);}}
  const grouped=new Map<string,PlaceLegacyMemory[]>();let accepted=0;
  for(const memory of candidates){if(accepted>=PLACE_LEGACY_TOTAL_LIMIT)break;const list=grouped.get(memory.placeId)??[];if(list.length>=PLACE_LEGACY_PER_PLACE_LIMIT)continue;list.push(memory);grouped.set(memory.placeId,list);accepted+=1;}
  const places:PlaceLegacyPlace[]=[];for(const [placeId,memories] of grouped){if(places.length>=PLACE_LEGACY_PLACE_LIMIT)break;const fields=placeFields(placeId);if(!fields)continue;places.push({placeId,...fields,memories:memories.map(memory=>({...memory})),familyHomes:memories.filter(memory=>memory.kind==='family_home').length,familyBusinesses:memories.filter(memory=>memory.kind==='family_business').length,currentLifeMilestones:memories.filter(memory=>memory.kind==='milestone'&&memory.current).length,priorGenerationMilestones:memories.filter(memory=>memory.kind==='milestone'&&!memory.current).length});}
  return{places,totalMemories:places.reduce((sum,place)=>sum+place.memories.length,0),familyLandmarks:places.reduce((sum,place)=>sum+place.familyHomes+place.familyBusinesses,0)};
}

export function placeLegacyForPlace(state:GameState,placeId:string){return generationalPlaceMemoryProjection(state).places.find(place=>place.placeId===placeId);}
