import { YOUTH_SOCIAL_PLANS, type YouthSocialPlanDefinition } from '../data/youthSocial';
import { TOWN_PLACES } from '../data/townPlaces';
import type { GameState, RelationshipType } from '../types/game';
import { sharedExperienceAvailability } from './SharedExperienceSystem';

const YOUTH_MIN_AGE=3;
const YOUTH_MAX_AGE=17;
const PEER_TYPES=new Set<RelationshipType>(['classmate','friend','best_friend']);
const FAMILY_PEER_TYPES=new Set<RelationshipType>(['sibling','half_sibling','stepsibling','cousin']);

export type YouthSocialConnection='school_friend'|'friend'|'family';

export interface YouthSocialTargetAvailability {
  allowed:boolean;
  reason?:string;
  connection?:YouthSocialConnection;
  schoolPeer?:boolean;
  currentSchoolPeer?:boolean;
}

export interface YouthSocialPlan extends YouthSocialPlanDefinition {
  npcId:string;
  placeLabel:string;
  connection:YouthSocialConnection;
  schoolPeer:boolean;
  currentSchoolPeer:boolean;
  allowed:boolean;
  reason?:string;
}

const townPlaceById=Object.fromEntries(TOWN_PLACES.map(place=>[place.id,place])) as Record<string,(typeof TOWN_PLACES)[number]>;

function isSchoolPeer(state:GameState,npcId:string){
  return state.socialWorlds.some(world=>world.kind==='school'&&world.members.some(member=>member.npcId===npcId&&member.role==='classmate'));
}
function isCurrentSchoolPeer(state:GameState,npcId:string){
  return state.socialWorlds.some(world=>world.kind==='school'&&world.active&&world.members.some(member=>member.npcId===npcId&&member.role==='classmate'&&member.leftAge===undefined));
}

export function youthSocialTargetAvailability(state:GameState,npcId:string):YouthSocialTargetAvailability{
  const npc=state.npcs[npcId];const rel=state.relationships.find(item=>item.npcId===npcId);
  if(state.character.age<YOUTH_MIN_AGE||state.character.age>YOUTH_MAX_AGE)return{allowed:false,reason:'Youth social plans are available during childhood and the teen years.'};
  if(!npc||!rel)return{allowed:false,reason:'That relationship is no longer available.'};
  if(!npc.alive)return{allowed:false,reason:`You cannot make plans with ${npc.firstName}; they have died.`};
  if(rel.estranged)return{allowed:false,reason:'This relationship is currently estranged.'};
  const currentSchoolPeer=isCurrentSchoolPeer(state,npcId);
  const schoolPeer=currentSchoolPeer||isSchoolPeer(state,npcId)||rel.type==='classmate';
  if(FAMILY_PEER_TYPES.has(rel.type))return{allowed:true,connection:'family',schoolPeer,currentSchoolPeer};
  if(!PEER_TYPES.has(rel.type))return{allowed:false,reason:'Youth outings are currently for friends, classmates, siblings, and cousins.'};
  if(npc.age<YOUTH_MIN_AGE||npc.age>YOUTH_MAX_AGE)return{allowed:false,reason:`${npc.firstName} is outside the youth peer age range for these plans.`};
  if(Math.abs(npc.age-state.character.age)>3)return{allowed:false,reason:`${npc.firstName} is too far outside your age group for these peer plans.`};
  return{allowed:true,connection:schoolPeer?'school_friend':'friend',schoolPeer,currentSchoolPeer};
}

/** Read-only projection over existing Relationship/NPC/SchoolWorld truth plus Phase 9B availability. */
export function projectYouthSocialPlans(state:GameState,npcId:string):YouthSocialPlan[]{
  const target=youthSocialTargetAvailability(state,npcId);if(!target.allowed||!target.connection)return[];
  return YOUTH_SOCIAL_PLANS
    .filter(plan=>state.character.age>=plan.minAge&&state.character.age<=plan.maxAge&&(!plan.schoolOnly||target.currentSchoolPeer))
    .map(plan=>{
      const availability=sharedExperienceAvailability(state,npcId,plan.placeId,plan.activityId);
      return{...plan,npcId,placeLabel:townPlaceById[plan.placeId]?.label??plan.placeId,connection:target.connection!,schoolPeer:Boolean(target.schoolPeer),currentSchoolPeer:Boolean(target.currentSchoolPeer),allowed:availability.allowed,...(!availability.allowed&&availability.reason?{reason:availability.reason}:{})};
    });
}
