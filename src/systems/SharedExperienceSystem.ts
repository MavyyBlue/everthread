import { clamp } from '../core/math';
import { actionGateStatus } from '../core/actionEconomy';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { NPC_PREFERENCE_TAG_IDS, npcPreferenceTagById } from '../data/npcPreferences';
import { SHARED_EXPERIENCE_ACTIVITIES, sharedExperienceActivityById } from '../data/sharedExperiences';
import { TOWN_PLACES, type TownPlaceDefinition } from '../data/townPlaces';
import type { GameState, Npc, Relationship } from '../types/game';
import type { NpcPreferenceProfile, NpcPreferenceTag } from '../types/npcPreferences';
import type { SharedExperienceBand, SharedExperienceEvaluationContext, SharedExperienceOption, SharedExperienceResult } from '../types/sharedExperiences';
import { generateNpcPreferenceProfile, npcPreferenceLevel } from './NpcPreferenceSystem';
import { townPlaceDiscovered } from './TownMapSystem';

const townPlaceById=Object.fromEntries(TOWN_PLACES.map(place=>[place.id,place])) as Record<string,TownPlaceDefinition>;
const preferenceTagSet=new Set<string>(NPC_PREFERENCE_TAG_IDS);

const bandReaction:Record<SharedExperienceBand,(name:string)=>string>={
  awful:name=>`${name} clearly wanted the outing to end.`,
  rough:name=>`${name} never really settled into it.`,
  mixed:name=>`It had a few good moments, but the rhythm never fully clicked with ${name}.`,
  good:name=>`${name} relaxed into it, and the time together felt easy.`,
  great:name=>`${name} lit up, and neither of you seemed eager for the time together to end.`,
};

const memoryReaction:Record<SharedExperienceBand,string>={
  awful:'You wanted the outing to end.',
  rough:'You never really settled into it.',
  mixed:'It had a few good moments, but the rhythm never fully clicked.',
  good:'You relaxed into it and enjoyed the time together.',
  great:'You loved the time together and wanted it to last.',
};

export interface SharedExperienceAvailability {allowed:boolean;reason?:string;npc?:Npc;relationship?:Relationship;place?:TownPlaceDefinition}

function sameEverthreadLocation(countryId:string,city:string){return countryId===EVERTHREAD_COUNTRY_ID&&city===EVERTHREAD_CITY;}
function activityAgeAppropriate(playerAge:number,npcAge:number,activity:{minAge:number;maxAge?:number}){return playerAge>=activity.minAge&&npcAge>=activity.minAge&&(activity.maxAge===undefined||(playerAge<=activity.maxAge&&npcAge<=activity.maxAge));}
function distinctPreferenceTags(tags:readonly NpcPreferenceTag[]){return [...new Set(tags.filter(tag=>preferenceTagSet.has(tag)))];}
function ageAppropriatePreferenceTags(state:GameState,npc:Npc,tags:readonly NpcPreferenceTag[]){
  const participantAge=Math.min(state.character.age,npc.age);
  return distinctPreferenceTags(tags).filter(tag=>npcPreferenceTagById[tag].minAge<=participantAge);
}

function preferenceInfluence(profile:NpcPreferenceProfile,tags:readonly NpcPreferenceTag[]){
  let score=0;
  for(const tag of distinctPreferenceTags(tags)){
    const level=npcPreferenceLevel(profile,tag);
    score+=level==='like'?8:level==='dislike'?-10:level==='aversion'?-24:0;
  }
  return clamp(score,-32,24);
}

function preferenceSignalTag(profile:NpcPreferenceProfile,tags:readonly NpcPreferenceTag[]){
  const ranked=distinctPreferenceTags(tags).map((tag,index)=>{
    const level=npcPreferenceLevel(profile,tag);
    const signal=level==='aversion'?4:level==='dislike'?3:level==='like'?2:1;
    return{tag,index,signal};
  }).sort((a,b)=>b.signal-a.signal||a.index-b.index);
  return ranked[0]?.tag;
}

function relationshipInfluence(rel:Relationship){
  const score=(rel.score-50)*.08;
  const compatibility=(rel.compatibility-50)*.18;
  const familiarity=Math.min(20,Math.max(0,rel.yearsKnown))*.18;
  return clamp(score+compatibility+familiarity,-14,16);
}

function wellbeingInfluence(state:GameState,npc:Npc){
  let value=(state.character.stats.happiness-50)*.025+(npc.happiness-50)*.04+(npc.hiddenOpinion*.04);
  if(state.character.stats.health<30)value-=6;
  else if(state.character.stats.health<50)value-=2;
  if(npc.health<30)value-=6;
  else if(npc.health<50)value-=2;
  return clamp(value,-14,10);
}

function bandForApproval(approval:number):SharedExperienceBand{
  return approval<25?'awful':approval<45?'rough':approval<60?'mixed':approval<80?'good':'great';
}

function consequencesForBand(band:SharedExperienceBand){
  if(band==='awful')return{relationshipDelta:-9,opinionDelta:-6,happinessDelta:-3,meaningfulMemory:true};
  if(band==='rough')return{relationshipDelta:-5,opinionDelta:-3,happinessDelta:-1,meaningfulMemory:true};
  if(band==='mixed')return{relationshipDelta:0,opinionDelta:0,happinessDelta:0,meaningfulMemory:false};
  if(band==='good')return{relationshipDelta:4,opinionDelta:2,happinessDelta:2,meaningfulMemory:false};
  return{relationshipDelta:7,opinionDelta:4,happinessDelta:4,meaningfulMemory:true};
}

export function sharedExperienceAvailability(state:GameState,npcId:string,placeId:string,activityId:string,actionKey=`shared:${activityId}`):SharedExperienceAvailability{
  const npc=state.npcs[npcId];
  const relationship=state.relationships.find(rel=>rel.npcId===npcId);
  const place=townPlaceById[placeId];
  const activity=sharedExperienceActivityById[activityId];
  if(!npc||!relationship)return{allowed:false,reason:'That relationship is no longer available.'};
  if(!npc.alive)return{allowed:false,reason:`You cannot make plans with ${npc.firstName}; they have died.`};
  if(!place||!activity)return{allowed:false,reason:'That shared experience is not available.'};
  if(!activity.placeIds.includes(placeId))return{allowed:false,reason:`${activity.label} is not available at ${place.label}.`};
  if(!townPlaceDiscovered(state,place))return{allowed:false,reason:'That location has not been discovered.'};
  if(!sameEverthreadLocation(state.character.countryId,state.character.city))return{allowed:false,reason:'You need to be in Everthread to make plans at an Everthread location.'};
  if(!sameEverthreadLocation(npc.countryId,npc.city))return{allowed:false,reason:`${npc.firstName} is not currently in Everthread.`};
  if(!activityAgeAppropriate(state.character.age,npc.age,activity))return{allowed:false,reason:activity.maxAge!==undefined&&Math.max(state.character.age,npc.age)>activity.maxAge?`${activity.label} is meant for childhood and the teen years.`:`${activity.label} is not age-appropriate for both of you yet.`};
  const gate=actionGateStatus(state,[{policy:'social.npc.total',target:npcId},{policy:'social.npc.action',target:`${npcId}:${actionKey}`}]);
  if(!gate.allowed)return{allowed:false,reason:gate.message,npc,relationship,place};
  return{allowed:true,npc,relationship,place};
}

/**
 * Pure evaluation path. It reads the exact player/NPC/relationship/place/activity context and
 * never consumes gameplay RNG, runtime IDs, action economy, or save state. The caller supplies
 * a bounded variation only when committing a real experience.
 */
export function evaluateSharedExperience(state:GameState,npcId:string,placeId:string,activityId:string,variation=0,context:SharedExperienceEvaluationContext={}):SharedExperienceResult|undefined{
  const npc=state.npcs[npcId];
  const relationship=state.relationships.find(rel=>rel.npcId===npcId);
  const place=townPlaceById[placeId];
  const activity=sharedExperienceActivityById[activityId];
  if(!npc||!relationship||!place||!activity||!activity.placeIds.includes(placeId)||!activityAgeAppropriate(state.character.age,npc.age,activity))return;
  const profile=npc.preferences??generateNpcPreferenceProfile(state,npc);
  const effectivePreferenceTags=ageAppropriatePreferenceTags(state,npc,context.preferenceTags??activity.preferenceTags);
  const preferenceScore=preferenceInfluence(profile,effectivePreferenceTags);
  const contextScore=relationshipInfluence(relationship)+wellbeingInfluence(state,npc);
  const boundedVariation=clamp(Math.round(variation),-8,8);
  const contextualEnjoyment=clamp(Math.round(context.enjoymentModifier??0),-12,12);
  const approval=clamp(Math.round(50+activity.baseEnjoyment+contextualEnjoyment+preferenceScore+contextScore+boundedVariation),0,100);
  const band=bandForApproval(approval);
  const consequences=consequencesForBand(band);
  const prose=`You and ${npc.firstName} ${activity.copy.lead} ${place.label}. ${bandReaction[band](npc.firstName)}`;
  const memorySummary=`${state.character.firstName} and you ${activity.copy.memoryLead} ${place.label}. ${memoryReaction[band]}`;
  return{
    npcId:npc.id,relationshipId:relationship.id,placeId:place.id,placeLabel:place.label,activityId:activity.id,activityLabel:activity.label,
    approval,band,...consequences,prose,memorySummary,preferenceSignalTag:preferenceSignalTag(profile,effectivePreferenceTags),
  };
}

export function projectSharedExperienceOptions(state:GameState,npcId:string):SharedExperienceOption[]{
  const options:SharedExperienceOption[]=[];
  for(const activity of SHARED_EXPERIENCE_ACTIVITIES){
    for(const placeId of activity.placeIds){
      const place=townPlaceById[placeId];if(!place)continue;
      const availability=sharedExperienceAvailability(state,npcId,placeId,activity.id);
      options.push({activityId:activity.id,activityLabel:activity.label,placeId,placeLabel:place.label,allowed:availability.allowed,reason:availability.reason});
    }
  }
  return options;
}
