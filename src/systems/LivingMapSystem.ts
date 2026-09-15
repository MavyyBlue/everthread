import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { POST_SECONDARY_STAGES } from '../data/workingEverthread';
import { TOWN_DISTRICTS, TOWN_PLACES } from '../data/townPlaces';
import type { GameState, Npc } from '../types/game';
import type { GenerationalPlaceMemoryProjection } from '../types/placeMemory';
import type { LivingMapContext, LivingMapContextKind, LivingMapDistrictContext, LivingMapPlaceContext, LivingMapProjection } from '../types/livingMap';
import { generationalPlaceMemoryProjection } from './GenerationalPlaceMemorySystem';
import { playerResidenceProjection } from './ResidentialLifeSystem';
import { workingEverthreadProjection } from './WorkingEverthreadSystem';

export const LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT=6;
export const LIVING_MAP_TOTAL_CONTEXT_LIMIT=32;

const THREADWELL_PLACE_ID='threadwell-residential';
const PLACE_IDS=new Set(TOWN_PLACES.map(place=>place.id));
const DISTRICT_BY_ID=new Map(TOWN_DISTRICTS.map(district=>[district.id,district] as const));

type ContextSeed=Omit<LivingMapContext,'id'|'count'|'sourceIds'> & {sourceId?:string;count?:number;sourceIds?:string[]};

function inEverthread(countryId:string,city:string){return countryId===EVERTHREAD_COUNTRY_ID&&city===EVERTHREAD_CITY;}
function cleanSourceIds(seed:ContextSeed){return [...new Set([...(seed.sourceIds??[]),...(seed.sourceId?[seed.sourceId]:[])])].filter(Boolean).sort();}
function contextId(scope:string,targetId:string,kind:LivingMapContextKind){return `${scope}:${targetId}:${kind}`;}
function mergeContext(list:LivingMapContext[],scope:string,targetId:string,seed:ContextSeed){
  const existing=list.find(item=>item.kind===seed.kind);
  const sources=cleanSourceIds(seed);
  if(existing){
    existing.count+=seed.count??1;
    existing.sourceIds=[...new Set([...existing.sourceIds,...sources])].sort();
    if(seed.priority>existing.priority){existing.priority=seed.priority;existing.label=seed.label;existing.detail=seed.detail;}
    else if(existing.count>1){existing.detail=aggregateDetail(existing.kind,existing.count,existing.detail);}
    return;
  }
  list.push({id:contextId(scope,targetId,seed.kind),kind:seed.kind,label:seed.label,detail:seed.detail,count:seed.count??1,priority:seed.priority,sourceIds:sources});
}
function aggregateDetail(kind:LivingMapContextKind,count:number,fallback:string){
  if(kind==='work')return `You have ${count} active workplaces connected to this location.`;
  if(kind==='business')return `You have ${count} active companies based here.`;
  if(kind==='property')return `You own ${count} properties represented here.`;
  if(kind==='child_school')return `${count} of your children currently study here.`;
  return fallback;
}
function orderedContexts(items:LivingMapContext[]){return items.sort((a,b)=>b.priority-a.priority||a.kind.localeCompare(b.kind)).slice(0,LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT);}
function currentNpcEducation(npc:Npc){return [...(npc.life?.education.records??[])].reverse().find(record=>!record.graduated&&record.endAge===undefined);}
function childSchoolPlaceId(npc:Npc){
  if(!inEverthread(npc.countryId,npc.city))return undefined;
  const record=currentNpcEducation(npc);if(!record)return undefined;
  return POST_SECONDARY_STAGES.has(record.stage)||Boolean(record.credential)?'everthread-college':'everthread-school';
}

export function livingMapProjection(state:GameState,placeMemory=generationalPlaceMemoryProjection(state)):LivingMapProjection{
  const placeMap=new Map<string,LivingMapContext[]>();
  const districtMap=new Map<string,LivingMapContext[]>();
  const addPlace=(placeId:string,seed:ContextSeed)=>{if(!PLACE_IDS.has(placeId))return;const list=placeMap.get(placeId)??[];mergeContext(list,'place',placeId,seed);placeMap.set(placeId,list);};
  const addDistrict=(districtId:string,seed:ContextSeed)=>{if(!DISTRICT_BY_ID.has(districtId))return;const list=districtMap.get(districtId)??[];mergeContext(list,'district',districtId,seed);districtMap.set(districtId,list);};
  const addWorking=(location:{anchorPlaceId?:string;districtId?:string},seed:ContextSeed)=>{if(location.anchorPlaceId)addPlace(location.anchorPlaceId,seed);else if(location.districtId)addDistrict(location.districtId,seed);};

  const residence=playerResidenceProjection(state);
  if(residence.placeId&&residence.visitable)addPlace(residence.placeId,{kind:'home',label:'You live here',detail:residence.label,priority:100,sourceId:residence.propertyId??state.character.id});

  const localProperties=state.assets.properties.filter(property=>property.location===EVERTHREAD_CITY);
  if(localProperties.length)addPlace(THREADWELL_PLACE_ID,{kind:'property',label:localProperties.length===1?'Property owned':'Properties owned',detail:localProperties.length===1?`You own ${localProperties[0]!.name} here.`:`You own ${localProperties.length} properties represented in Threadwell.`,priority:72,count:localProperties.length,sourceIds:localProperties.map(property=>property.id)});

  const working=workingEverthreadProjection(state);
  if(working.institution?.active&&working.institution.inEverthread)addWorking(working.institution,{kind:'school',label:'Current school',detail:working.institution.name,priority:96,sourceId:working.institution.sourceId});
  for(const workplace of working.workplaces){if(!workplace.active||!workplace.inEverthread)continue;addWorking(workplace,{kind:'work',label:'You work here',detail:workplace.name,priority:92,sourceId:workplace.sourceId});}
  for(const business of working.businesses){if(!business.active||!business.inEverthread)continue;addWorking(business,{kind:'business',label:'Your company',detail:business.name,priority:88,sourceId:business.sourceId});}

  for(const relationship of state.relationships){
    if(relationship.type!=='child'||relationship.estranged)continue;
    const child=state.npcs[relationship.npcId];if(!child?.alive)continue;
    const placeId=childSchoolPlaceId(child);if(!placeId)continue;
    addPlace(placeId,{kind:'child_school',label:'Your child attends here',detail:`${child.firstName} ${child.lastName} currently studies here.`,priority:82,sourceId:child.id});
  }

  for(const legacy of placeMemory.places){
    if(!legacy.memories.length)continue;
    const family=legacy.familyHomes+legacy.familyBusinesses+legacy.priorGenerationMilestones>0;
    const detail=family
      ? `${legacy.memories.length} remembered thread ${legacy.memories.length===1?'connection':'connections'} · ${legacy.familyHomes+legacy.familyBusinesses} surviving family ${legacy.familyHomes+legacy.familyBusinesses===1?'landmark':'landmarks'}.`
      : `${legacy.currentLifeMilestones} meaningful ${legacy.currentLifeMilestones===1?'memory':'memories'} from your current life happened here.`;
    addPlace(legacy.placeId,{kind:'legacy',label:family?'Family legacy':'Life memory',detail,priority:family?78:62,count:legacy.memories.length,sourceIds:legacy.memories.map(memory=>memory.id)});
  }

  const places:LivingMapPlaceContext[]=[...placeMap.entries()].map(([placeId,contexts])=>({placeId,contexts:orderedContexts(contexts)})).sort((a,b)=>a.placeId.localeCompare(b.placeId));
  const districts:LivingMapDistrictContext[]=[...districtMap.entries()].map(([districtId,contexts])=>({districtId,districtLabel:DISTRICT_BY_ID.get(districtId)!.label,contexts:orderedContexts(contexts)})).sort((a,b)=>a.districtId.localeCompare(b.districtId));

  let remaining=LIVING_MAP_TOTAL_CONTEXT_LIMIT;
  const boundedPlaces:LivingMapPlaceContext[]=[];for(const place of places){if(remaining<=0)break;const contexts=place.contexts.slice(0,remaining);if(contexts.length){boundedPlaces.push({...place,contexts});remaining-=contexts.length;}}
  const boundedDistricts:LivingMapDistrictContext[]=[];for(const district of districts){if(remaining<=0)break;const contexts=district.contexts.slice(0,remaining);if(contexts.length){boundedDistricts.push({...district,contexts});remaining-=contexts.length;}}
  const totalContexts=boundedPlaces.reduce((sum,item)=>sum+item.contexts.length,0)+boundedDistricts.reduce((sum,item)=>sum+item.contexts.length,0);
  return{places:boundedPlaces,districts:boundedDistricts,totalContexts,connectedPlaceCount:boundedPlaces.length,connectedDistrictCount:boundedDistricts.length};
}

export function livingMapPlaceContext(projection:LivingMapProjection,placeId:string){return projection.places.find(item=>item.placeId===placeId);}
export function livingMapDistrictContext(projection:LivingMapProjection,districtId:string){return projection.districts.find(item=>item.districtId===districtId);}
