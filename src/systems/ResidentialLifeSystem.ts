import { FAMILY_RELATIONSHIP_TYPE_SET } from '../core/familyRelations';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { RESIDENTIAL_LIFE_PLANS, residentialLifePlanById } from '../data/residentialLife';
import type { GameState, Npc, PropertyAsset, Relationship } from '../types/game';
import type { NpcPropertyHolding } from '../types/npcAssets';
import type { NpcHouseholdProjection, ResidenceProjection, ResidentialPlan, ResidentialPlanDefinition } from '../types/residentialLife';
import { sharedExperienceAvailability } from './SharedExperienceSystem';

const RESIDENTIAL_SOCIAL_TYPES=new Set<GameState['relationships'][number]['type']>([
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','aunt_uncle','cousin','niece_nephew','child','grandchild',
  'friend','best_friend','classmate','partner','fiance','spouse',
]);
const THREADWELL_PLACE_ID='threadwell-residential';

function inEverthread(countryId:string,city:string){return countryId===EVERTHREAD_COUNTRY_ID&&city===EVERTHREAD_CITY;}
function inheritedFromLabel(state:GameState,npcId?:string){const npc=npcId?state.npcs[npcId]:undefined;return npc?`${npc.firstName} ${npc.lastName}`:undefined;}
function localPlayerProperties(state:GameState){return state.assets.properties.filter(property=>property.location===state.character.city&&!property.rental);}
function localNpcProperties(npc:Npc){return (npc.assetPortfolio?.properties??[]).filter(property=>property.location===npc.city);}
function preferredPlayerProperty(state:GameState){const local=localPlayerProperties(state);return local.find(property=>property.primaryResidence)??local[0];}
function preferredNpcProperty(npc:Npc){const local=localNpcProperties(npc);return local.find(property=>property.primaryResidence)??local[0];}

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
