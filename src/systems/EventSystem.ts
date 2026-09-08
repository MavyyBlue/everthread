import { eventById, lifeEvents } from '../data/events';
import type { ChoiceEffect, EngineResult, GameEventDefinition, GameState, PendingEvent, Relationship } from '../types/game';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';

const RARE_THRESHOLD=.03;
const rareEvents=lifeEvents.filter(event=>event.probability>0&&event.probability<RARE_THRESHOLD);
const routineEvents=lifeEvents.filter(event=>event.probability>=RARE_THRESHOLD);
const routineByCategory=new Map<string,GameEventDefinition[]>();
for(const event of routineEvents){const list=routineByCategory.get(event.category)??[];list.push(event);routineByCategory.set(event.category,list);}

const categoryWeight:Record<string,number>={childhood:1.05,school:1,friends:.9,family:1,romance:.85,work:1,money:.72,health:.72,travel:.48,fame:.42,crime_legal:.42,strange:.38,relationships:.55,aging:.5};
const FAMILY_RELATIONSHIP_TYPES=['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew'];
const FRIEND_RELATIONSHIP_TYPES=['friend','best_friend'];
const ROMANTIC_RELATIONSHIP_TYPES=['partner','fiance','spouse'];
const SIBLING_RELATIONSHIP_TYPES=['sibling','half_sibling','stepsibling'];
const PROCEDURAL_CATEGORIES=new Set(['childhood','school','friends','family','romance','work','money','health','travel','fame','crime_legal','strange']);
const PROCEDURAL_MATURITY_FLOOR:Record<string,number>={friends:10,family:12,health:10,travel:14,strange:10};

type TargetRule={minAge?:number;maxAge?:number;types?:string[];needsCare?:boolean};

function routineEventChance(age:number){if(age<=2)return .42;if(age<=5)return .56;if(age<=13)return .64;if(age<=17)return .72;if(age<=40)return .70;if(age<=60)return .67;if(age<=80)return .64;return .60;}
function isProceduralScenario(event:GameEventDefinition){return PROCEDURAL_CATEGORIES.has(event.category)&&/_\d+$/.test(event.id);}
function proceduralMaturityFloor(event:GameEventDefinition){const base=PROCEDURAL_MATURITY_FLOOR[event.category]??event.minAge;if(event.category==='friends'&&event.id.includes('_the_loan_request_'))return Math.max(base,16);if(event.category==='family'&&event.id.includes('_money_between_relatives_'))return Math.max(base,16);if(event.category==='family'&&event.id.includes('_the_care_question_'))return Math.max(base,16);return base;}
function hasLivingRelationship(state:GameState,types:readonly string[]){return state.relationships.some(rel=>types.includes(rel.type)&&!rel.estranged&&state.npcs[rel.npcId]?.alive);}
function inferredTargetSelector(event:GameEventDefinition){
  const targetTag=event.tags.find(tag=>tag.startsWith('target:')&&!tag.startsWith('target:min-age:')&&!tag.startsWith('target:max-age:')&&!tag.startsWith('target:relationship:')&&!['target:adult','target:minor','target:needs-care'].includes(tag));if(targetTag)return targetTag.slice('target:'.length);
  if(!isProceduralScenario(event))return undefined;
  if(event.category==='friends')return'friend';
  if(event.category==='family')return'family';
  if(event.category==='romance')return'romantic';
  if(event.category==='school')return'school_peer';
  return undefined;
}

function targetRule(event:GameEventDefinition):TargetRule{
  const rule:TargetRule={};
  for(const tag of event.tags){
    if(tag==='target:adult')rule.minAge=Math.max(rule.minAge??0,18);
    else if(tag==='target:minor')rule.maxAge=Math.min(rule.maxAge??17,17);
    else if(tag==='target:needs-care')rule.needsCare=true;
    else if(tag.startsWith('target:min-age:')){const value=Number(tag.slice('target:min-age:'.length));if(Number.isFinite(value))rule.minAge=Math.max(rule.minAge??0,value);}
    else if(tag.startsWith('target:max-age:')){const value=Number(tag.slice('target:max-age:'.length));if(Number.isFinite(value))rule.maxAge=Math.min(rule.maxAge??value,value);}
    else if(tag.startsWith('target:relationship:'))rule.types=tag.slice('target:relationship:'.length).split('|').filter(Boolean);
  }
  // Compatibility-aware rules for the existing procedural library. New content should prefer explicit target:* tags.
  if(event.id.includes('family_family_favor_'))rule.minAge=Math.max(rule.minAge??0,12);
  if(event.id.includes('family_money_between_relatives_'))rule.minAge=Math.max(rule.minAge??0,18);
  if(event.id.includes('family_the_care_question_'))rule.needsCare=true;
  if(event.id.includes('family_sibling_competition_')){rule.types=SIBLING_RELATIONSHIP_TYPES;rule.minAge=Math.max(rule.minAge??0,6);}
  if(event.id.includes('friends_the_loan_request_'))rule.minAge=Math.max(rule.minAge??0,16);
  return rule;
}

function schoolAffiliationIds(state:GameState,roles?:string[]){const world=(state.socialWorlds??[]).find(item=>item.kind==='school'&&item.active);if(!world)return new Set<string>();return new Set(world.members.filter(member=>(!roles||roles.includes(member.role))&&state.npcs[member.npcId]?.alive).map(member=>member.npcId));}
function workplaceAffiliationIds(state:GameState,roles?:string[]){const worlds=(state.socialWorlds??[]).filter(item=>item.kind==='workplace'&&item.active);return new Set(worlds.flatMap(world=>world.members.filter(member=>member.leftAge===undefined&&(!roles||roles.includes(member.role))&&state.npcs[member.npcId]?.alive).map(member=>member.npcId)));}
function currentWorkplaceForPayload(state:GameState,npcId?:string){return(state.socialWorlds??[]).find(world=>world.kind==='workplace'&&world.active&&world.workplace&&(!npcId||world.members.some(member=>member.npcId===npcId&&member.leftAge===undefined)));}

function baseTargetCandidates(state:GameState,event:GameEventDefinition){
  const selector=inferredTargetSelector(event);if(!selector)return[];let candidates:Relationship[]=[];
  if(selector==='school'||selector==='school_peer'||selector==='school_authority'){const roles=selector==='school_peer'?['classmate']:selector==='school_authority'?['teacher','principal','coach']:undefined;const ids=schoolAffiliationIds(state,roles);candidates=state.relationships.filter(rel=>ids.has(rel.npcId)&&!rel.estranged&&state.npcs[rel.npcId]?.alive);}
  else if(selector==='work'||selector==='work_peer'||selector==='work_boss'){const roles=selector==='work_peer'?['coworker','direct_report']:selector==='work_boss'?['boss']:undefined;const ids=workplaceAffiliationIds(state,roles);candidates=state.relationships.filter(rel=>ids.has(rel.npcId)&&!rel.estranged&&state.npcs[rel.npcId]?.alive);}
  else{const allowed=selector==='romantic'?ROMANTIC_RELATIONSHIP_TYPES:selector==='family'?FAMILY_RELATIONSHIP_TYPES:selector==='friend'?FRIEND_RELATIONSHIP_TYPES:[];candidates=state.relationships.filter(rel=>allowed.includes(rel.type)&&!rel.estranged&&state.npcs[rel.npcId]?.alive);}
  return candidates;
}

function targetMatchesRule(state:GameState,event:GameEventDefinition,rel:Relationship){const npc=state.npcs[rel.npcId];if(!npc?.alive)return false;const rule=targetRule(event);if(rule.minAge!==undefined&&npc.age<rule.minAge)return false;if(rule.maxAge!==undefined&&npc.age>rule.maxAge)return false;if(rule.types?.length&&!rule.types.includes(rel.type))return false;if(rule.needsCare&&npc.age<55&&npc.health>55)return false;return true;}
function eligibleTargetCandidates(state:GameState,event:GameEventDefinition){return baseTargetCandidates(state,event).filter(rel=>targetMatchesRule(state,event,rel));}

function eligible(state:GameState,event:GameEventDefinition){
  const age=state.character.age;const maturityFloor=isProceduralScenario(event)?proceduralMaturityFloor(event):event.minAge;if(age<Math.max(event.minAge,maturityFloor)||age>event.maxAge)return false;
  if(event.countries?.length&&!event.countries.includes(state.character.countryId))return false;
  if(event.requiredFlags?.some(f=>!state.flags[f]))return false;
  if(event.forbiddenFlags?.some(f=>state.flags[f]))return false;
  if(event.tags.includes('requires:employed')&&!state.employment.current&&!(state.employment.partTimeJobs??[]).length)return false;
  if(event.tags.includes('requires:famous')&&state.fame.fame<10)return false;
  if(event.tags.includes('school')&&!state.education.some(e=>!e.graduated&&!e.droppedOut&&!e.endAge))return false;
  if(event.tags.includes('requires:school_npc')&&!schoolAffiliationIds(state).size)return false;
  if(event.tags.includes('requires:work_npc')&&!workplaceAffiliationIds(state).size)return false;
  if(event.tags.includes('romance')&&!hasLivingRelationship(state,ROMANTIC_RELATIONSHIP_TYPES))return false;
  if(event.tags.includes('requires:romantic')&&!hasLivingRelationship(state,ROMANTIC_RELATIONSHIP_TYPES))return false;
  if(event.tags.includes('requires:family')&&!hasLivingRelationship(state,FAMILY_RELATIONSHIP_TYPES))return false;
  if(event.tags.includes('requires:friend')&&!hasLivingRelationship(state,FRIEND_RELATIONSHIP_TYPES))return false;
  if(inferredTargetSelector(event)&&eligibleTargetCandidates(state,event).length===0)return false;
  if(event.id==='inheritance_notice'&&!state.relationships.some(r=>['parent','sibling'].includes(r.type)&&!state.npcs[r.npcId]?.alive))return false;
  const lastIndex=state.recentEventIds.lastIndexOf(event.id);if(lastIndex>=0&&state.recentEventIds.length-lastIndex<=event.cooldown)return false;
  return true;
}

export function eventEligibleForState(state:GameState,event:GameEventDefinition){return eligible(state,event);}
function toPending(event:GameEventDefinition,description:string,payload?:Record<string,unknown>):PendingEvent{return{eventId:event.id,title:event.title,description,choices:event.choices.map(c=>({id:c.id,label:c.label})),...(payload?{payload}:{})};}
function renderDescription(state:GameState,event:GameEventDefinition,rng:ReturnType<typeof createRng>,payload?:Record<string,unknown>){let description=rng.pick(event.descriptions);const npcId=typeof payload?.npcId==='string'?payload.npcId:undefined;const npc=npcId?state.npcs[npcId]:undefined;const npcName=npc?`${npc.firstName} ${npc.lastName}`:'someone close to you';description=description.replace(/\{NPC_NAME\}/g,npcName).replace(/\{NPC_FIRST\}/g,npc?.firstName??'someone').replace(/\{ORIGIN_AGE\}/g,String(payload?.originAge??state.character.age));if(npc&&isProceduralScenario(event)){if(event.category==='friends')description=description.replace(/your friend/i,npcName).replace(/a friend/i,npcName);if(event.category==='family')description=description.replace(/someone in the family/i,npcName).replace(/a relative/i,npcName).replace(/someone/i,npcName);if(event.category==='romance')description=description.replace(/someone you like/i,npcName);}return description;}

export function processDelayedEvents(state:GameState):PendingEvent|undefined{
  const dueEvents=state.delayedEvents.filter(delayed=>delayed.dueAge<=state.character.age).sort((a,b)=>a.dueAge-b.dueAge);
  for(const due of dueEvents){state.delayedEvents=state.delayedEvents.filter(delayed=>delayed.id!==due.id);const event=eventById[due.eventId];if(!event)continue;const npcId=typeof due.payload?.npcId==='string'?due.payload.npcId:undefined;const requiredTypes=Array.isArray(due.payload?.requiredRelationshipTypes)?due.payload.requiredRelationshipTypes.filter((value):value is string=>typeof value==='string'):[];if(npcId&&requiredTypes.length){const rel=state.relationships.find(r=>r.npcId===npcId&&!r.estranged);if(!rel||!state.npcs[npcId]?.alive||!requiredTypes.includes(rel.type))continue;}const rng=createRng(`${state.seed}-event-text`,state.rngCounter);const description=renderDescription(state,event,rng,due.payload);state.rngCounter=rng.counter();return toPending(event,description,due.payload);}
  return undefined;
}

function pickRareEvent(state:GameState,rng:ReturnType<typeof createRng>){const triggered:GameEventDefinition[]=[];for(const event of rareEvents)if(eligible(state,event)&&rng.chance(event.probability))triggered.push(event);if(!triggered.length)return undefined;return rng.weighted(triggered.map(event=>({item:event,weight:Math.max(.000001,event.probability)})));}

function eventContextPayload(state:GameState,event:GameEventDefinition,rng:ReturnType<typeof createRng>):Record<string,unknown>|undefined{
  const selector=inferredTargetSelector(event);if(!selector)return isProceduralScenario(event)?{suppressRelationshipFallback:true}:undefined;const candidates=eligibleTargetCandidates(state,event);if(!candidates.length)return{suppressRelationshipFallback:true};
  const chosen=rng.weighted(candidates.map(rel=>{const npc=state.npcs[rel.npcId]!;const recent=npc.memories.slice(-6);const memorySignal=recent.length?recent.reduce((sum,memory)=>sum+Math.abs(memory.sentiment),0)/recent.length:0;return{item:rel,weight:1+Math.abs(npc.hiddenOpinion)/45+Math.abs(rel.score-50)/65+memorySignal/18};}));
  const world=selector.startsWith('work')?currentWorkplaceForPayload(state,chosen.npcId):undefined;return{npcId:chosen.npcId,...(world?{worldId:world.id}:{})};
}

function pickRoutineEvent(state:GameState,rng:ReturnType<typeof createRng>){if(!rng.chance(routineEventChance(state.character.age)))return undefined;const age=state.character.age;const categoryCandidates=[...routineByCategory.entries()].filter(([,events])=>events.some(event=>age>=event.minAge&&age<=event.maxAge)).map(([category])=>category);const remaining=[...categoryCandidates];while(remaining.length){const category=rng.weighted(remaining.map(item=>({item,weight:categoryWeight[item]??.6})));remaining.splice(remaining.indexOf(category),1);const candidates=(routineByCategory.get(category)??[]).filter(event=>eligible(state,event));if(!candidates.length)continue;return rng.weighted(candidates.map(event=>({item:event,weight:Math.max(.01,event.probability)})));}return undefined;}

export function triggerRandomEvent(state:GameState):PendingEvent|undefined{if(state.pendingEvent)return state.pendingEvent;const delayed=processDelayedEvents(state);if(delayed){state.pendingEvent=delayed;return delayed;}const rng=createRng(`${state.seed}-events`,state.rngCounter);const event=pickRareEvent(state,rng)??pickRoutineEvent(state,rng);if(!event){state.rngCounter=rng.counter();return undefined;}const payload=eventContextPayload(state,event,rng);const description=renderDescription(state,event,rng,payload);state.pendingEvent=toPending(event,description,payload);state.recentEventIds=[...state.recentEventIds.slice(-35),event.id];state.rngCounter=rng.counter();return state.pendingEvent;}

function relationshipCandidates(state:GameState,selector:string|undefined,payload?:Record<string,unknown>):Relationship[]{const alive=(rel:Relationship)=>Boolean(state.npcs[rel.npcId]?.alive&&!rel.estranged);if(selector==='payload'){const npcId=typeof payload?.npcId==='string'?payload.npcId:undefined;return npcId?state.relationships.filter(rel=>rel.npcId===npcId&&alive(rel)):[];}const candidates=state.relationships.filter(alive);if(selector==='romantic')return candidates.filter(rel=>ROMANTIC_RELATIONSHIP_TYPES.includes(rel.type));if(selector==='family')return candidates.filter(rel=>FAMILY_RELATIONSHIP_TYPES.includes(rel.type));if(selector==='friend')return candidates.filter(rel=>FRIEND_RELATIONSHIP_TYPES.includes(rel.type));if(selector==='school'||selector==='school_peer'||selector==='school_authority'){const roles=selector==='school_peer'?['classmate']:selector==='school_authority'?['teacher','principal','coach']:undefined;const ids=schoolAffiliationIds(state,roles);return candidates.filter(rel=>ids.has(rel.npcId));}if(selector==='work'||selector==='work_peer'||selector==='work_boss'){const roles=selector==='work_peer'?['coworker','direct_report']:selector==='work_boss'?['boss']:undefined;const ids=workplaceAffiliationIds(state,roles);return candidates.filter(rel=>ids.has(rel.npcId));}return candidates;}
function selectRelationshipTarget(state:GameState,selector:string|undefined,rng:ReturnType<typeof createRng>,payload?:Record<string,unknown>){const options=relationshipCandidates(state,selector,payload);return options.length?rng.pick(options):undefined;}

function applyEffect(state:GameState,effect:ChoiceEffect|undefined,rng:ReturnType<typeof createRng>,payload?:Record<string,unknown>){if(!effect)return;let selectedRelationship:Relationship|undefined;
  if(effect.stats)for(const[k,v]of Object.entries(effect.stats))if(v!==undefined)(state.character.stats as unknown as Record<string,number>)[k]=clamp((state.character.stats as unknown as Record<string,number>)[k]+Number(v));
  if(effect.secondary)for(const[k,v]of Object.entries(effect.secondary))if(v!==undefined){const obj=state.character.secondary as unknown as Record<string,number>;obj[k]=k==='karma'?(obj[k]??0)+Number(v):clamp((obj[k]??0)+Number(v));}
  if(effect.money)state.finances.cash+=effect.money;if(effect.fame)state.fame.fame=clamp(state.fame.fame+effect.fame);if(effect.reputation)state.fame.publicReputation=clamp(state.fame.publicReputation+effect.reputation);if(effect.health)state.character.stats.health=clamp(state.character.stats.health+effect.health);if(effect.legalHeat)state.legal.investigationHeat=clamp(state.legal.investigationHeat+effect.legalHeat);
  if(effect.flags)Object.assign(state.flags,effect.flags);
  if(effect.relationship){const selector=effect.relationship.npcSelector??(typeof payload?.npcId==='string'?'payload':undefined);const rel=selector?selectRelationshipTarget(state,selector,rng,payload):payload?.suppressRelationshipFallback===true?undefined:selectRelationshipTarget(state,undefined,rng,payload);selectedRelationship=rel;if(rel){rel.score=clamp(rel.score+effect.relationship.delta);const npc=state.npcs[rel.npcId]!;npc.hiddenOpinion=clamp(npc.hiddenOpinion+effect.relationship.delta*.4,-100,100);if(effect.relationship.setType){rel.type=effect.relationship.setType;if(effect.relationship.setType==='ex'){npc.maritalStatus='divorced';npc.partnerId=undefined;}}npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:'event_choice',sentiment:effect.relationship.delta,summary:'A shared event changed the relationship.',permanent:Math.abs(effect.relationship.delta)>=15});}}
  if(effect.workplace){const payloadWorldId=typeof payload?.worldId==='string'?payload.worldId:undefined;const world=(payloadWorldId?state.socialWorlds.find(item=>item.id===payloadWorldId):undefined)??currentWorkplaceForPayload(state,typeof payload?.npcId==='string'?payload.npcId:undefined);if(world?.workplace){for(const[key,value]of Object.entries(effect.workplace))if(value!==undefined){const obj=world.workplace as unknown as Record<string,number|string|undefined>;const current=Number(obj[key]??0);obj[key]=clamp(current+Number(value));}}}
  if(effect.schedule){const target=effect.schedule.npcSelector==='effect'?selectedRelationship:effect.schedule.npcSelector?selectRelationshipTarget(state,effect.schedule.npcSelector,rng,payload):undefined;if(!effect.schedule.npcSelector||target){state.delayedEvents.push({id:makeStateId(state,'delay'),eventId:effect.schedule.eventId,dueAge:state.character.age+Math.max(1,effect.schedule.years),payload:{originAge:state.character.age,...(target?{npcId:target.npcId}:{}),...(effect.schedule.requiredRelationshipTypes?{requiredRelationshipTypes:effect.schedule.requiredRelationshipTypes}:{})}});}}
}

export function resolvePendingEvent(state:GameState,choiceId:string):EngineResult{const pending=state.pendingEvent;if(!pending)return{success:false,messages:[{text:'There is no unresolved event.'}]};const def=eventById[pending.eventId];if(!def){state.pendingEvent=undefined;return{success:false,messages:[{text:'The event definition could not be loaded.'}]};}const choice=def.choices.find(c=>c.id===choiceId);if(!choice)return{success:false,messages:[{text:'That choice is not available.'}]};const rng=createRng(`${state.seed}-choice`,state.rngCounter);applyEffect(state,choice.effects,rng,pending.payload);let outcomeText='';if(choice.outcomes?.length){const outcome=rng.weighted(choice.outcomes.map(o=>({item:o,weight:o.weight})));outcomeText=outcome.text;applyEffect(state,outcome.effects,rng,pending.payload);}const summary=outcomeText||`You chose: ${choice.label}.`;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:def.category==='health'?'health':def.category==='work'?'career':def.category==='school'?'school':def.category.includes('crime')?'legal':def.category==='money'?'money':def.category==='fame'?'fame':def.category==='family'?'family':def.category==='travel'?'travel':'random',importance:2,title:def.title,text:`${pending.description} ${summary}`,...(typeof pending.payload?.npcId==='string'?{npcIds:[pending.payload.npcId]}:{})});state.pendingEvent=undefined;state.rngCounter=rng.counter();return{success:true,messages:[{text:summary}]};}

export function forceEvent(state:GameState,eventId:string):EngineResult{const event=eventById[eventId];if(!event)return{success:false,messages:[{text:'Event not found.'}]};const rng=createRng(`${state.seed}-force`,state.rngCounter);const payload=eventContextPayload(state,event,rng);state.pendingEvent=toPending(event,renderDescription(state,event,rng,payload),payload);state.rngCounter=rng.counter();return{success:true,messages:[{text:`Triggered ${event.title}.`}]};}
