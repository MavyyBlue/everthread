import { businessIndustries } from '../data/assets';
import { lifeEvents } from '../data/events';
import { systemicConsequenceEventById, systemicConsequenceEvents } from '../data/systemicConsequenceEvents';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { nextDueConsequence } from '../systems/ConsequenceSystem';
import { processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import { addBusinessProduct, startBusiness } from '../systems/BusinessSystem';
import { renovateProperty, sellProperty } from '../systems/PropertySystem';
import {
  scheduleBusinessProductStory,
  schedulePropertyRenovationStory,
  scheduleWorkplaceConcernStory,
} from '../systems/SystemicStorySystem';
import { askBossForFeedback, ensureWorkplaceForCareerRecord, reportCoworkerIssue } from '../systems/WorkplaceSystem';
import { exportSave, importSave } from '../services/SaveSystem';
import type { GameState, PropertyAsset, SocialWorld } from '../types/game';

function adult(seed:string,age=30){const state=createNewGame({seed});state.character.age=age;state.currentYear=state.character.birthYear+age;state.finances.cash=2_000_000;return state;}
function propertyFixture(seed='phase7b2-property'){
  const state=adult(seed,31);const property:PropertyAsset={id:'phase7b2-home',typeId:'test-home',name:'Juniper House',location:state.character.city,purchasePrice:250_000,marketValue:250_000,condition:45,age:4,amenities:['garden']};state.assets.properties.push(property);return{state,property};
}
function workplaceFixture(seed='phase7b2-workplace'){
  const state=adult(seed,30);const record={jobId:'phase7b2-role',title:'Systems Coordinator',company:'Threadline Works',startAge:28,salary:62_000,performance:64,level:2};state.employment.current=record;const world=ensureWorkplaceForCareerRecord(state,record,'full_time',false);const bossId=world.workplace?.managerNpcId;const coworkerId=world.members.find(member=>member.role==='coworker')?.npcId;if(!bossId||!coworkerId)throw new Error('Phase 7B2 fixture failed to create workplace cast.');return{state,world,bossId,coworkerId};
}
function advanceTo(state:GameState,age:number){state.character.age=age;state.currentYear=state.character.birthYear+age;}

export function runPhase7B2OwnershipWorkRegression(){
  let checks=0;function check(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 7B2 ownership/work regression failed: ${message}`);}

  const phase7b2Events=systemicConsequenceEvents.filter(event=>event.tags.includes('phase7b2'));
  check(lifeEvents.length===691,'01 ordinary random-event pool must remain exactly 691');
  check(phase7b2Events.length===5&&phase7b2Events.every(event=>event.probability===0),'02 Phase 7B2 must add exactly five system-owned probability-zero stories');
  check(phase7b2Events.every(event=>!lifeEvents.some(random=>random.id===event.id)&&systemicConsequenceEventById[event.id]===event),'03 Phase 7B2 ids must stay outside the random pool and resolve through the systemic registry');

  const {state:propertyState,property}=propertyFixture();const propertyRngBefore=propertyState.rngCounter;const renovate=renovateProperty(propertyState,property.id);const propertyStory=propertyState.delayedEvents.find(item=>item.eventId==='systemic_property_renovation_return');
  check(renovate.success&&Boolean(propertyStory),'04 successful renovation must schedule a property follow-up');
  check(propertyStory?.dueAge===33&&propertyStory.payload?.propertyId===property.id&&propertyStory.targetRefs?.[0]?.kind==='property'&&propertyStory.targetRefs[0].id===property.id,'05 renovation follow-up must bind the exact property for two years later');
  check(propertyState.rngCounter===propertyRngBefore,'06 renovation plus consequence scheduling must remain gameplay-RNG neutral');
  const idBeforePropertyDuplicate=propertyState.idCounter;const duplicateProperty=schedulePropertyRenovationStory(propertyState,property.id);check(!duplicateProperty.scheduled&&duplicateProperty.reason==='duplicate'&&propertyState.idCounter===idBeforePropertyDuplicate,'07 unresolved property follow-ups must dedupe without consuming an id');
  advanceTo(propertyState,33);const propertyPending=processDelayedEvents(propertyState);check(propertyPending?.eventId==='systemic_property_renovation_return'&&propertyPending.description.includes(property.name)&&!propertyPending.description.includes('{PROPERTY_NAME}'),'08 property follow-up must render the exact live property name');
  propertyState.pendingEvent=propertyPending;const propertyConditionBefore=property.condition;const propertyValueBefore=property.marketValue;const propertyResolution=resolvePendingEvent(propertyState,'protect_work');
  check(property.condition===Math.min(100,propertyConditionBefore+8)&&property.marketValue>propertyValueBefore,'09 property choice must mutate the exact authoritative property condition and value');
  check(propertyResolution.stateChanges?.some(change=>change.startsWith(`propertyCondition:${property.id}`))===true&&propertyResolution.stateChanges?.some(change=>change.startsWith(`propertyValue:${property.id}`))===true,'10 property consequence must expose exact semantic state changes');
  check(propertyState.timeline.at(-1)?.category==='asset','11 property consequence history must land in the asset timeline category');

  const {state:soldPropertyState,property:soldProperty}=propertyFixture('phase7b2-property-sold');renovateProperty(soldPropertyState,soldProperty.id);const sale=sellProperty(soldPropertyState,soldProperty.id);advanceTo(soldPropertyState,33);check(sale.success&&!nextDueConsequence(soldPropertyState)&&soldPropertyState.consequenceScheduler.history.some(item=>item.eventId==='systemic_property_renovation_return'&&item.reason==='missing_target:property'),'12 a sold exact property must cancel its future story instead of retargeting');

  const founderState=adult('phase7b2-founder',29);const industry=businessIndustries[0]!;const start=startBusiness(founderState,industry.id,'Lantern Thread');const business=founderState.businesses[0]!;const founderStory=founderState.delayedEvents.find(item=>item.eventId==='systemic_business_founder_return');
  check(start.success&&Boolean(founderStory)&&founderStory?.dueAge===32,'13 founding a business must schedule its three-year founder follow-up');
  check(founderStory?.payload?.businessId===business.id&&founderStory.targetRefs?.[0]?.kind==='business'&&founderStory.targetRefs[0].id===business.id,'14 founder story must bind the exact business identity');
  const founderRoundTrip=importSave(exportSave(founderState));const savedFounder=founderRoundTrip.delayedEvents.find(item=>item.eventId==='systemic_business_founder_return');check(savedFounder?.payload?.businessId===business.id&&savedFounder.targetRefs?.[0]?.id===business.id,'15 save round-trip must preserve the exact business consequence');
  advanceTo(founderState,32);const founderPending=processDelayedEvents(founderState);check(founderPending?.description.includes(business.name)===true&&!founderPending?.description.includes('{BUSINESS_NAME}'),'16 founder story must render the exact business name from authoritative state');
  founderState.pendingEvent=founderPending;const founderDemandBefore=business.demand;const founderRepBefore=business.reputation;const founderResolution=resolvePendingEvent(founderState,'protect_trust');
  check(business.demand===Math.min(100,founderDemandBefore+2)&&business.reputation===Math.min(100,founderRepBefore+8),'17 founder choice must change the exact business demand/reputation authority');
  check(founderResolution.stateChanges?.some(change=>change.startsWith(`businessDemand:${business.id}`))===true&&founderResolution.stateChanges?.some(change=>change.startsWith(`businessReputation:${business.id}`))===true,'18 business consequence must expose exact semantic state changes');
  check(founderState.timeline.at(-1)?.category==='business','19 business consequence history must land in the business timeline category');

  const productState=adult('phase7b2-product',30);startBusiness(productState,industry.id,'Signal Orchard');const productBusiness=productState.businesses[0]!;const productAction=addBusinessProduct(productState,productBusiness.id);const productStory=productState.delayedEvents.find(item=>item.eventId==='systemic_business_product_return');
  check(productAction.success&&productStory?.dueAge===32&&productStory.payload?.businessId===productBusiness.id,'20 successful product expansion must schedule an exact two-year business follow-up');
  const productIdBefore=productState.idCounter;const duplicateProduct=scheduleBusinessProductStory(productState,productBusiness.id);check(!duplicateProduct.scheduled&&duplicateProduct.reason==='duplicate'&&productState.idCounter===productIdBefore,'21 product-launch story must dedupe while unresolved');
  productState.businesses=[];advanceTo(productState,32);check(!nextDueConsequence(productState)&&productState.consequenceScheduler.history.some(item=>item.eventId==='systemic_business_product_return'&&item.reason==='missing_target:business'),'22 a missing exact business must cancel instead of redirecting the story');

  const feedbackFixture=workplaceFixture();const feedbackRngBefore=feedbackFixture.state.rngCounter;const feedbackAction=askBossForFeedback(feedbackFixture.state);const feedbackStory=feedbackFixture.state.delayedEvents.find(item=>item.eventId==='systemic_workplace_feedback_return');
  check(feedbackAction.success&&Boolean(feedbackStory)&&feedbackFixture.state.rngCounter>feedbackRngBefore,'23 asking a manager for feedback must preserve its normal RNG action and schedule a follow-up afterward');
  check(feedbackStory?.dueAge===32&&feedbackStory.payload?.worldId===feedbackFixture.world.id&&feedbackStory.payload?.npcId===feedbackFixture.bossId&&feedbackStory.targetRefs?.some(ref=>ref.kind==='social_world'&&ref.id===feedbackFixture.world.id)===true&&feedbackStory.targetRefs?.some(ref=>ref.kind==='npc'&&ref.id===feedbackFixture.bossId)===true,'24 manager-feedback story must preserve exact workplace and manager targets');
  feedbackFixture.world.active=false;feedbackFixture.world.endedAge=31;advanceTo(feedbackFixture.state,32);const feedbackPending=processDelayedEvents(feedbackFixture.state);check(feedbackPending?.eventId==='systemic_workplace_feedback_return'&&feedbackPending.description.includes(feedbackFixture.world.name)&&feedbackPending.description.includes(feedbackFixture.state.npcs[feedbackFixture.bossId]!.firstName),'25 professional history must be able to echo after leaving while still targeting the archived workplace and exact manager');
  feedbackFixture.state.pendingEvent=feedbackPending;const bossRel=feedbackFixture.state.relationships.find(rel=>rel.npcId===feedbackFixture.bossId)!;const bossScoreBefore=bossRel.score;const workRepBefore=feedbackFixture.world.workplace!.reputation;resolvePendingEvent(feedbackFixture.state,'show_growth');
  check(bossRel.score===Math.min(100,bossScoreBefore+6)&&feedbackFixture.world.workplace!.reputation===Math.min(100,workRepBefore+7),'26 feedback follow-up must mutate the exact manager relationship and workplace world');
  check(feedbackFixture.state.npcs[feedbackFixture.bossId]!.memories.some(memory=>memory.kind==='event_choice'),'27 manager follow-up must persist through existing NPC memory authority');

  const deadBossFixture=workplaceFixture('phase7b2-dead-boss');askBossForFeedback(deadBossFixture.state);deadBossFixture.state.npcs[deadBossFixture.bossId]!.alive=false;advanceTo(deadBossFixture.state,32);check(!nextDueConsequence(deadBossFixture.state)&&deadBossFixture.state.consequenceScheduler.history.some(item=>item.eventId==='systemic_workplace_feedback_return'&&item.reason==='target_npc_dead'),'28 dead exact manager targets must cancel rather than retarget');

  const concernFixture=workplaceFixture('phase7b2-concern');const concernAction=reportCoworkerIssue(concernFixture.state,concernFixture.coworkerId);const concernStory=concernFixture.state.delayedEvents.find(item=>item.eventId==='systemic_workplace_concern_return');
  check(concernAction.success&&concernStory?.payload?.npcId===concernFixture.coworkerId&&concernStory.payload?.worldId===concernFixture.world.id,'29 formal coworker concern must schedule the exact person and workplace');
  concernFixture.world.active=false;concernFixture.world.endedAge=31;advanceTo(concernFixture.state,32);const concernPending=processDelayedEvents(concernFixture.state);check(concernPending?.eventId==='systemic_workplace_concern_return','30 coworker concern history must remain eligible after the workplace archives');
  concernFixture.state.pendingEvent=concernPending;const coworkerRel=concernFixture.state.relationships.find(rel=>rel.npcId===concernFixture.coworkerId)!;const coworkerScoreBefore=coworkerRel.score;const tensionBefore=concernFixture.world.workplace!.tension;resolvePendingEvent(concernFixture.state,'repair');check(coworkerRel.score===Math.min(100,coworkerScoreBefore+8)&&concernFixture.world.workplace!.tension===Math.max(0,tensionBefore-4),'31 concern follow-up must reconcile through exact relationship/workplace truth');

  const deadCoworkerFixture=workplaceFixture('phase7b2-dead-coworker');reportCoworkerIssue(deadCoworkerFixture.state,deadCoworkerFixture.coworkerId);deadCoworkerFixture.state.npcs[deadCoworkerFixture.coworkerId]!.alive=false;advanceTo(deadCoworkerFixture.state,32);check(!nextDueConsequence(deadCoworkerFixture.state)&&deadCoworkerFixture.state.consequenceScheduler.history.some(item=>item.eventId==='systemic_workplace_concern_return'&&item.reason==='target_npc_dead'),'32 dead coworker target must cancel without selecting a replacement coworker');

  const directWork=workplaceFixture('phase7b2-direct-work');const directRngBefore=directWork.state.rngCounter;const direct=scheduleWorkplaceConcernStory(directWork.state,directWork.world.id,directWork.coworkerId);check(direct.scheduled&&directWork.state.rngCounter===directRngBefore,'33 direct Phase 7B2 scheduling must remain gameplay-RNG neutral');
  check(propertyState.saveVersion===13&&founderState.saveVersion===13&&feedbackFixture.state.saveVersion===13,'34 Phase 7B2 must not require a save-schema increment');
  const states:Record<string,GameState>={property:propertyState,soldProperty:soldPropertyState,founder:founderState,feedback:feedbackFixture.state,concern:concernFixture.state};const invariantErrors=Object.fromEntries(Object.entries(states).map(([key,state])=>[key,validateState(state)]));check(Object.values(invariantErrors).every(errors=>errors.length===0),`35 Phase 7B2 fixtures must satisfy global state invariants: ${JSON.stringify(invariantErrors)}`);

  return checks;
}
