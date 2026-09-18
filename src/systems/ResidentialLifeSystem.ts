import { FAMILY_RELATIONSHIP_TYPE_SET } from '../core/familyRelations';
import { makeStateId } from '../core/ids';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { RESIDENTIAL_LIFE_PLANS, residentialLifePlanById } from '../data/residentialLife';
import { POST_SECONDARY_STAGES } from '../data/workingEverthread';
import type { EngineResult, GameState, Npc, PropertyAsset, Relationship } from '../types/game';
import type { NpcPropertyHolding } from '../types/npcAssets';
import type { NpcHouseholdProjection, ResidenceProjection, ResidentialPlan, ResidentialPlanDefinition } from '../types/residentialLife';
import { sharedExperienceAvailability } from './SharedExperienceSystem';
import { schoolWorldForEducationRecord } from './SchoolWorldSystem';
import { schoolInstitutionLocation } from './WorkingEverthreadSystem';

const RESIDENTIAL_SOCIAL_TYPES=new Set<GameState['relationships'][number]['type']>([
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','aunt_uncle','cousin','niece_nephew','child','grandchild',
  'friend','best_friend','classmate','partner','fiance','spouse',
]);
const THREADWELL_PLACE_ID='threadwell-residential';
const COLLEGE_PLACE_ID='everthread-college';

function inEverthread(countryId:string,city:string){return countryId===EVERTHREAD_COUNTRY_ID&&city===EVERTHREAD_CITY;}
function inheritedFromLabel(state:GameState,npcId?:string){const npc=npcId?state.npcs[npcId]:undefined;return npc?`${npc.firstName} ${npc.lastName}`:undefined;}
function localPlayerProperties(state:GameState){return state.assets.properties.filter(property=>property.location===state.character.city&&!property.rental);}
function localNpcProperties(npc:Npc){return (npc.assetPortfolio?.properties??[]).filter(property=>property.location===npc.city);}
function preferredPlayerProperty(state:GameState){const local=localPlayerProperties(state);return local.find(property=>property.primaryResidence)??local[0];}
function preferredNpcProperty(npc:Npc){const local=localNpcProperties(npc);return local.find(property=>property.primaryResidence)??local[0];}

function campusEnrollmentContext(state:GameState){
  const currentRecord=[...state.education].reverse().find(record=>!record.graduated&&!record.droppedOut&&!record.endAge);
  if(!currentRecord||!POST_SECONDARY_STAGES.has(currentRecord.stage))return{eligible:false as const,reason:'Campus housing requires an active post-secondary enrollment.'};
  const world=schoolWorldForEducationRecord(state,currentRecord);
  const institution=schoolInstitutionLocation(state);
  if(!world?.active||!world.school)return{eligible:false as const,reason:'Campus housing requires the persistent school world for your active post-secondary enrollment.'};
  if(!institution?.inEverthread||institution.anchorPlaceId!==COLLEGE_PLACE_ID)return{eligible:false as const,reason:'Campus housing is available only while your current program is based at Everthread College.'};
  return{eligible:true as const,worldId:world.id,currentRecord,world,institution};
}

function restorePreviousPrimaryResidence(state:GameState,propertyId?:string){
  if(!propertyId||state.character.age<18)return;
  const property=state.assets.properties.find(item=>item.id===propertyId&&item.location===state.character.city&&!item.rental);
  if(!property)return;
  for(const item of state.assets.properties)item.primaryResidence=item.id===property.id||undefined;
}

function clearCampusHousing(state:GameState,restorePrevious:boolean){
  state.residentialLife??={};
  const housing=state.residentialLife.campusHousing;if(!housing)return false;
  const previous=housing.previousPrimaryResidencePropertyId;delete state.residentialLife.campusHousing;
  if(restorePrevious)restorePreviousPrimaryResidence(state,previous);
  return true;
}

export function campusHousingAvailability(state:GameState){
  if(state.legal.imprisoned||state.legal.sentenceRemaining>0)return{allowed:false as const,reason:'Campus housing is unavailable while your residence is institutional.'};
  const context=campusEnrollmentContext(state);
  return context.eligible?{allowed:true as const,schoolWorldId:context.worldId}:{allowed:false as const,reason:context.reason};
}

export function normalizeResidentialLifeState(state:GameState){
  state.residentialLife??={};
  const housing=state.residentialLife.campusHousing;if(!housing)return state.residentialLife;
  const validShape=housing.kind==='college_dorm'&&housing.placeId===COLLEGE_PLACE_ID&&typeof housing.schoolWorldId==='string'&&Number.isFinite(housing.startedAge)&&housing.startedAge>=0;
  const context=campusEnrollmentContext(state);
  const institutional=state.legal.imprisoned||state.legal.sentenceRemaining>0;
  if(!validShape||institutional||!context.eligible||context.worldId!==housing.schoolWorldId){clearCampusHousing(state,true);return state.residentialLife;}
  for(const property of state.assets.properties)delete property.primaryResidence;
  return state.residentialLife;
}

export const migrateResidentialLifeState=normalizeResidentialLifeState;

export function moveIntoCollegeDorm(state:GameState):EngineResult{
  state.residentialLife??={};if(state.residentialLife.campusHousing)return{success:false,messages:[{text:'You already live in Everthread College campus housing.'}]};
  const availability=campusHousingAvailability(state);if(!availability.allowed||!availability.schoolWorldId)return{success:false,messages:[{text:availability.reason??'Campus housing is not currently available.'}]};
  const previousPrimary=state.assets.properties.find(property=>property.primaryResidence===true)?.id;
  for(const property of state.assets.properties)delete property.primaryResidence;
  state.residentialLife.campusHousing={kind:'college_dorm',placeId:COLLEGE_PLACE_ID,schoolWorldId:availability.schoolWorldId,startedAge:state.character.age,...(previousPrimary?{previousPrimaryResidencePropertyId:previousPrimary}:{})};
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',placeId:COLLEGE_PLACE_ID,importance:2,text:'You moved into Everthread College campus housing. Housing is included with your current enrollment, with no separate rent or financing contract.'});
  return{success:true,stateChanges:['residence'],messages:[{text:'You moved into an Everthread College dorm. Campus housing is included with your enrollment; no separate rent or financing was created.'}]};
}

export function moveOutOfCollegeDorm(state:GameState):EngineResult{
  if(!state.residentialLife?.campusHousing)return{success:false,messages:[{text:'You are not currently living in campus housing.'}]};
  clearCampusHousing(state,true);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',placeId:COLLEGE_PLACE_ID,importance:2,text:'You moved out of Everthread College campus housing.'});
  return{success:true,stateChanges:['residence'],messages:[{text:'You moved out of campus housing. Your prior eligible home was restored when available.'}]};
}

export function clearCampusHousingForAlternativeHome(state:GameState){return clearCampusHousing(state,false);}

export function syncCampusHousingEligibility(state:GameState,announce=true){
  const housing=state.residentialLife?.campusHousing;if(!housing)return false;
  const context=campusEnrollmentContext(state);if(context.eligible&&context.worldId===housing.schoolWorldId)return false;
  clearCampusHousing(state,true);
  if(announce)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',placeId:COLLEGE_PLACE_ID,importance:2,text:'Your Everthread College campus housing ended with your post-secondary enrollment.'});
  return true;
}

function playerOwnedResidence(state:GameState,property:PropertyAsset):ResidenceProjection{
  const inheritedFrom=inheritedFromLabel(state,property.inheritedFromNpcId);
  const familyLandmark=property.origin==='inherited';
  return{
    kind:'owned',city:state.character.city,label:`Your ${property.name}`,propertyId:property.id,propertyName:property.name,
    ...(property.inheritedFromNpcId?{inheritedFromNpcId:property.inheritedFromNpcId}:{}),familyLandmark,
    detail:familyLandmark?`Inherited family home${inheritedFrom?` from ${inheritedFrom}`:''}.`:`Owned home in ${property.location}.`,
    ...(inEverthread(state.character.countryId,state.character.city)?{placeId:THREADWELL_PLACE_ID}:{}),
    visitable:inEverthread(state.character.countryId,state.character.city),
    ...(!inEverthread(state.character.countryId,state.character.city)?{reason:'Residential visits are currently modeled inside Everthread.'}:{}),
  };
}

export function playerResidenceProjection(state:GameState):ResidenceProjection{
  if(state.legal.imprisoned||state.legal.sentenceRemaining>0)return{kind:'institutional',city:state.character.city,label:'Correctional residence',detail:'Your current residence is institutional while you are incarcerated.',familyLandmark:false,visitable:false,reason:'Home visits are unavailable while you are incarcerated.'};
  const everthread=inEverthread(state.character.countryId,state.character.city);
  const housing=state.residentialLife?.campusHousing;
  if(housing&&everthread){const context=campusEnrollmentContext(state);if(context.eligible&&context.worldId===housing.schoolWorldId)return{kind:'campus',city:state.character.city,label:'Your Everthread College dorm',detail:'Campus housing included with your current post-secondary enrollment.',placeId:COLLEGE_PLACE_ID,familyLandmark:false,visitable:true};}

  if(state.character.age>=18){const property=preferredPlayerProperty(state);if(property)return playerOwnedResidence(state,property);}
  const family=state.character.age<18||state.flags.financiallyIndependent===false;
  return{
    kind:family?'family':'rented',city:state.character.city,label:family?'Your family home':'Your rented home',
    detail:family?`Your household home in ${state.character.city}.`:`Your current rented home in ${state.character.city}.`,familyLandmark:false,
    ...(everthread?{placeId:THREADWELL_PLACE_ID}:{}),visitable:everthread,...(!everthread?{reason:'Residential visits are currently modeled inside Everthread.'}:{}),
  };
}

export function npcHouseholdMemberIds(state:GameState,npcId:string):string[]{
  const npc=state.npcs[npcId];if(!npc?.alive)return[];
  const ids=new Set<string>([npc.id]);
  if(npc.age<18){
    for(const parentId of npc.parentIds){const parent=state.npcs[parentId];if(parent?.alive&&parent.city===npc.city){ids.add(parent.id);for(const siblingId of parent.childIds){const sibling=state.npcs[siblingId];if(sibling?.alive&&sibling.age<18&&sibling.city===npc.city)ids.add(sibling.id);}}}
  }else{
    const partner=npc.partnerId?state.npcs[npc.partnerId]:undefined;if(partner?.alive&&partner.city===npc.city)ids.add(partner.id);
    for(const childId of npc.childIds){const child=state.npcs[childId];if(child?.alive&&child.age<18&&child.city===npc.city)ids.add(child.id);}
    if(partner?.alive)for(const childId of partner.childIds){const child=state.npcs[childId];if(child?.alive&&child.age<18&&child.city===npc.city)ids.add(child.id);}
  }
  return [...ids].sort();
}

function npcPropertyResidence(state:GameState,npc:Npc,property:NpcPropertyHolding,owner:Npc,kind:'owned'|'family'|'shared'):ResidenceProjection{
  const inheritedFrom=inheritedFromLabel(state,property.inheritedFromNpcId);const familyLandmark=property.origin==='inherited';const everthread=inEverthread(npc.countryId,npc.city);
  const possessive=owner.id===npc.id?`${npc.firstName}'s`:`${owner.firstName}'s`;
  return{kind,city:npc.city,label:`${possessive} ${property.name}`,propertyId:property.id,propertyName:property.name,ownerNpcId:owner.id,...(property.inheritedFromNpcId?{inheritedFromNpcId:property.inheritedFromNpcId}:{}),familyLandmark,detail:familyLandmark?`Inherited family home${inheritedFrom?` from ${inheritedFrom}`:''}.`:`${kind==='owned'?'Owned':'Shared household'} home in ${property.location}.`,...(everthread?{placeId:THREADWELL_PLACE_ID}:{}),visitable:everthread,...(!everthread?{reason:`${npc.firstName} is not currently living in Everthread.`}:{})};
}

export function npcHouseholdResidenceProjection(state:GameState,npcId:string):NpcHouseholdProjection|undefined{
  const npc=state.npcs[npcId];if(!npc)return;
  const memberIds=npcHouseholdMemberIds(state,npcId);
  if(!npc.alive)return{npcId,memberIds,residence:{kind:'institutional',city:npc.city,label:`${npc.firstName}'s former residence`,detail:`${npc.firstName} has died.`,familyLandmark:false,visitable:false,reason:`You cannot visit ${npc.firstName}; they have died.`}};
  if(npc.imprisoned||npc.life?.legal.sentenceRemaining)return{npcId,memberIds,residence:{kind:'institutional',city:npc.city,label:`${npc.firstName}'s institutional residence`,detail:`${npc.firstName} is currently incarcerated.`,familyLandmark:false,visitable:false,reason:`${npc.firstName} is currently incarcerated.`}};

  if(npc.age<18&&npc.parentIds.includes(state.character.id)&&npc.city===state.character.city){
    const playerHome=playerResidenceProjection(state);
    return{npcId,memberIds,residence:{...playerHome,kind:'family',label:`${npc.firstName}'s family home`,detail:playerHome.familyLandmark?`The family household includes an inherited home: ${playerHome.label}.`:`${npc.firstName} lives in your household.`,ownerNpcId:undefined}};
  }

  const own=preferredNpcProperty(npc);if(own)return{npcId,memberIds,residence:npcPropertyResidence(state,npc,own,npc,npc.age<18?'family':'owned')};
  if(npc.age>=18&&playerRomanticRelationship(state,npc.id)&&npc.countryId===state.character.countryId&&npc.city===state.character.city){
    const playerHome=playerResidenceProjection(state);
    if(playerHome.visitable&&playerHome.kind!=='institutional')return{npcId,memberIds,residence:{...playerHome,kind:'shared',label:`${npc.firstName}'s shared home`,detail:playerHome.familyLandmark?`${npc.firstName} shares your inherited family home with you.`:`${npc.firstName} shares your current home with you.`,ownerNpcId:undefined}};
  }
  for(const memberId of memberIds){if(memberId===npc.id)continue;const member=state.npcs[memberId];if(!member)continue;const property=preferredNpcProperty(member);if(property&&property.location===npc.city)return{npcId,memberIds,residence:npcPropertyResidence(state,npc,property,member,npc.age<18?'family':'shared')};}

  const everthread=inEverthread(npc.countryId,npc.city);const partnered=Boolean(npc.partnerId)||playerRomanticRelationship(state,npc.id);const kind=npc.age<18?'family':partnered?'shared':'rented';
  return{npcId,memberIds,residence:{kind,city:npc.city,label:npc.age<18?`${npc.firstName}'s family home`:partnered?`${npc.firstName}'s shared home`:`${npc.firstName}'s rented home`,detail:npc.age<18?`Family household in ${npc.city}.`:partnered?`Shared household in ${npc.city}.`:`Rented home in ${npc.city}.`,familyLandmark:false,...(everthread?{placeId:THREADWELL_PLACE_ID}:{}),visitable:everthread,...(!everthread?{reason:`${npc.firstName} is not currently living in Everthread.`}:{})}};
}

function targetResidence(state:GameState,npcId:string,plan:ResidentialPlanDefinition){
  const player=playerResidenceProjection(state);const npc=npcHouseholdResidenceProjection(state,npcId)?.residence;
  if(plan.target==='player')return player;
  if(plan.target==='npc')return npc;
  if(player.visitable)return player;
  return npc;
}

function residentialRelationship(state:GameState,npcId:string):Relationship|undefined{
  return state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged&&RESIDENTIAL_SOCIAL_TYPES.has(rel.type));
}
function playerRomanticRelationship(state:GameState,npcId:string){
  const rel=state.relationships.find(item=>item.npcId===npcId&&!item.estranged);
  return Boolean(state.character.alive&&rel&&['partner','fiance','spouse'].includes(rel.type));
}

export function projectResidentialPlans(state:GameState,npcId:string):ResidentialPlan[]{
  const npc=state.npcs[npcId];const rel=residentialRelationship(state,npcId);if(!npc||!rel||!npc.alive)return[];
  const family=FAMILY_RELATIONSHIP_TYPE_SET.has(rel.type);const result:ResidentialPlan[]=[];
  for(const plan of RESIDENTIAL_LIFE_PLANS){
    if(plan.familyOnly&&!family)continue;if(plan.nonFamilyOnly&&family)continue;
    if(state.character.age<plan.minAge||npc.age<plan.minAge)continue;if(plan.maxAge!==undefined&&(state.character.age>plan.maxAge||npc.age>plan.maxAge))continue;
    const residence=targetResidence(state,npcId,plan);if(!residence)continue;const placeId=residence.placeId??THREADWELL_PLACE_ID;
    if(!residence.visitable||!residence.placeId){result.push({...plan,npcId,residence,residenceLabel:residence.label,placeId,allowed:false,reason:residence.reason??'That residence is not available for a visit right now.'});continue;}
    const availability=sharedExperienceAvailability(state,npcId,residence.placeId,plan.activityId,`residential:${plan.id}`);
    result.push({...plan,npcId,residence,residenceLabel:residence.label,placeId:residence.placeId,allowed:availability.allowed,...(!availability.allowed&&availability.reason?{reason:availability.reason}:{})});
  }
  return result;
}

export function residentialPlanFor(state:GameState,npcId:string,planId:string){
  if(!residentialLifePlanById[planId])return undefined;
  return projectResidentialPlans(state,npcId).find(plan=>plan.id===planId);
}
