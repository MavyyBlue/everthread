import { clamp } from '../core/math';
import { ROMANTIC_DATE_HISTORY_LIMIT, ROMANTIC_DATE_PLANS, ROMANTIC_MOMENTUM_REQUIRED } from '../data/romanticDates';
import { sharedExperienceActivityById } from '../data/sharedExperiences';
import { TOWN_PLACES } from '../data/townPlaces';
import type { GameState, Relationship, RelationshipType } from '../types/game';
import type { RomanticDateHistoryEntry, RomanticDateOption } from '../types/romanticDates';
import { playerNpcRomanticallyCompatible } from './NpcOrientationSystem';
import { sharedExperienceAvailability } from './SharedExperienceSystem';

export const ROMANTIC_CANDIDATE_TYPES=new Set<RelationshipType>(['friend','best_friend','classmate','coworker','boss','teacher','principal','coach']);
const CURRENT_ROMANTIC_TYPES=new Set<RelationshipType>(['partner','fiance','spouse']);
const townPlaceById=Object.fromEntries(TOWN_PLACES.map(place=>[place.id,place])) as Record<string,(typeof TOWN_PLACES)[number]>;

export function datingAgesCompatible(playerAge:number,npcAge:number){
  if(playerAge<14||npcAge<14)return false;
  if(playerAge<18)return npcAge<18;
  return npcAge>=18;
}

export function romanticDateMomentum(rel:Relationship){
  let momentum=0;
  for(const entry of rel.romance?.dateHistory??[]){
    momentum+=entry.band==='great'?1.25:entry.band==='good'?1:entry.band==='rough'?-0.5:entry.band==='awful'?-1:0;
  }
  return clamp(Math.round(momentum*100)/100,0,4);
}

export function successfulRomanticDates(rel:Relationship){
  return (rel.romance?.dateHistory??[]).filter(entry=>entry.band==='good'||entry.band==='great').length;
}

export function romanticMomentumReady(rel:Relationship){return romanticDateMomentum(rel)>=ROMANTIC_MOMENTUM_REQUIRED;}

export function currentRomanticCommitment(state:GameState,excludeNpcId?:string){
  return state.relationships.find(rel=>rel.npcId!==excludeNpcId&&CURRENT_ROMANTIC_TYPES.has(rel.type)&&state.npcs[rel.npcId]?.alive);
}

export function romanticDateTargetAvailability(state:GameState,npcId:string){
  const npc=state.npcs[npcId];const relationship=state.relationships.find(rel=>rel.npcId===npcId);
  if(!npc||!relationship)return{allowed:false,reason:'That relationship is no longer available.',relationship,npc};
  if(!npc.alive)return{allowed:false,reason:`You cannot ask ${npc.firstName} on a date; they have died.`,relationship,npc};
  if(relationship.estranged)return{allowed:false,reason:'That relationship is currently estranged.',relationship,npc};
  if(!ROMANTIC_CANDIDATE_TYPES.has(relationship.type))return{allowed:false,reason:'An individual date is not available from this relationship.',relationship,npc};
  if(!datingAgesCompatible(state.character.age,npc.age))return{allowed:false,reason:state.character.age<14||npc.age<14?'Dating becomes available in the teen years.':'Teen dating stays between teens, and adult dating stays between adults.',relationship,npc};
  if(currentRomanticCommitment(state,npcId))return{allowed:false,reason:'You are already in a relationship with someone else.',relationship,npc};
  if(!playerNpcRomanticallyCompatible(state,npc))return{allowed:false,reason:`You and ${npc.firstName} are not mutually compatible for dating.`,relationship,npc};
  return{allowed:true,relationship,npc};
}

export function projectRomanticDateOptions(state:GameState,npcId:string):RomanticDateOption[]{
  const target=romanticDateTargetAvailability(state,npcId);const rel=target.relationship;
  if(!target.allowed||!rel?.romance?.pendingDate)return[];
  const options:RomanticDateOption[]=[];
  for(const plan of ROMANTIC_DATE_PLANS){
    if(state.character.age<plan.minAge||target.npc!.age<plan.minAge)continue;
    const activity=sharedExperienceActivityById[plan.activityId];const place=townPlaceById[plan.placeId];if(!activity||!place)continue;
    const availability=sharedExperienceAvailability(state,npcId,plan.placeId,plan.activityId,`date:${plan.activityId}`);
    options.push({...plan,placeLabel:place.label,allowed:availability.allowed,reason:availability.reason});
  }
  return options;
}

export function recordRomanticDate(rel:Relationship,entry:RomanticDateHistoryEntry){
  rel.romance??={};rel.romance.dateHistory=[...(rel.romance.dateHistory??[]),entry].slice(-ROMANTIC_DATE_HISTORY_LIMIT);
}

export function romanticDatePlanFor(state:GameState,npcId:string,placeId:string,activityId:string){
  return projectRomanticDateOptions(state,npcId).find(option=>option.placeId===placeId&&option.activityId===activityId);
}
