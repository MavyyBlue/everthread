import type {
  ConsequenceHistoryEntry,
  ConsequenceOrigin,
  ConsequencePriority,
  ConsequenceSchedulerState,
  ConsequenceTargetRef,
  ConsequenceValidity,
  DelayedEvent,
  GameState,
  PendingConsequenceContext,
  RelationshipType,
} from '../types/game';
import { makeStateId } from '../core/ids';

export const CONSEQUENCE_SCHEDULER_VERSION=1 as const;
export const MAX_ACTIVE_CONSEQUENCES=96;
export const MAX_CONSEQUENCE_HISTORY=160;
export const MAX_EVENT_COOLDOWNS=256;

const PRIORITY_WEIGHT:Record<ConsequencePriority,number>={low:0,normal:1,high:2,critical:3};
const VALID_PRIORITIES=new Set<ConsequencePriority>(['low','normal','high','critical']);
const VALID_TARGET_KINDS=new Set(['npc','property','vehicle','business','collectible','social_world','career','other']);

export interface ScheduleConsequenceRequest {
  eventId:string;
  dueAge:number;
  payload?:Record<string,unknown>;
  scheduledAge?:number;
  earliestAge?:number;
  latestAge?:number;
  priority?:ConsequencePriority;
  chainId?:string;
  origin?:ConsequenceOrigin;
  targetRefs?:ConsequenceTargetRef[];
  validity?:ConsequenceValidity;
  dedupeKey?:string;
  id?:string;
}

export interface ScheduleConsequenceResult {
  scheduled:boolean;
  consequence?:DelayedEvent;
  reason?:'duplicate'|'queue_full'|'invalid_window';
}

function finiteAge(value:unknown,fallback:number){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.floor(n)):fallback;}
function cleanString(value:unknown){return typeof value==='string'&&value.trim()?value.trim():undefined;}
function priority(value:unknown):ConsequencePriority{return typeof value==='string'&&VALID_PRIORITIES.has(value as ConsequencePriority)?value as ConsequencePriority:'normal';}
function cloneTargets(value:unknown):ConsequenceTargetRef[]|undefined{
  if(!Array.isArray(value))return undefined;
  const seen=new Set<string>();const out:ConsequenceTargetRef[]=[];
  for(const item of value){if(!item||typeof item!=='object')continue;const raw=item as Partial<ConsequenceTargetRef>;if(typeof raw.kind!=='string'||!VALID_TARGET_KINDS.has(raw.kind)||typeof raw.id!=='string'||!raw.id)continue;const key=`${raw.kind}:${raw.id}`;if(seen.has(key))continue;seen.add(key);out.push({kind:raw.kind as ConsequenceTargetRef['kind'],id:raw.id});}
  return out.length?out:undefined;
}
function cloneStringList(value:unknown){if(!Array.isArray(value))return undefined;const out=[...new Set(value.filter((item):item is string=>typeof item==='string'&&item.length>0))];return out.length?out:undefined;}
function cloneValidity(value:unknown):ConsequenceValidity|undefined{
  if(!value||typeof value!=='object')return undefined;const raw=value as ConsequenceValidity;
  const requiredRelationshipTypes=cloneStringList(raw.requiredRelationshipTypes) as RelationshipType[]|undefined;
  const requiredFlags=cloneStringList(raw.requiredFlags);const forbiddenFlags=cloneStringList(raw.forbiddenFlags);
  const out:ConsequenceValidity={};
  if(typeof raw.targetMustExist==='boolean')out.targetMustExist=raw.targetMustExist;
  if(typeof raw.targetMustBeAlive==='boolean')out.targetMustBeAlive=raw.targetMustBeAlive;
  if(requiredRelationshipTypes)out.requiredRelationshipTypes=requiredRelationshipTypes;
  if(requiredFlags)out.requiredFlags=requiredFlags;if(forbiddenFlags)out.forbiddenFlags=forbiddenFlags;
  return Object.keys(out).length?out:undefined;
}
function legacyNpcTarget(delayed:DelayedEvent){const npcId=cleanString(delayed.payload?.npcId);return npcId?[{kind:'npc' as const,id:npcId}]:undefined;}
function legacyRequiredRelationships(delayed:DelayedEvent){return cloneStringList(delayed.payload?.requiredRelationshipTypes) as RelationshipType[]|undefined;}
function inferredPriority(eventId:string):ConsequencePriority{if(eventId==='financial_independence_transition')return'critical';if(eventId.startsWith('special_career_'))return'high';return'normal';}
function inferredChainId(delayed:DelayedEvent){const arc=cleanString(delayed.payload?.storyArc),world=cleanString(delayed.payload?.storyWorldId),npc=cleanString(delayed.payload?.npcId);return arc&&npc?`special:${arc}:${world??'world'}:${npc}`:undefined;}
function inferredDedupeKey(delayed:DelayedEvent){const npc=cleanString(delayed.payload?.npcId);const world=cleanString(delayed.payload?.storyWorldId);return `consequence:${delayed.eventId}:${npc??'-'}:${world??'-'}`;}
function inferredOrigin(delayed:DelayedEvent,currentAge:number):ConsequenceOrigin{
  const originAge=finiteAge(delayed.payload?.originAge,finiteAge(delayed.scheduledAge,Math.min(currentAge,delayed.dueAge)));
  if(delayed.eventId==='financial_pressure_notice')return{kind:'system',id:'finance',age:originAge};
  if(delayed.eventId==='financial_independence_transition')return{kind:'system',id:'age_milestone',age:originAge};
  if(delayed.eventId.startsWith('special_career_'))return{kind:'system',id:'special_career_story',age:originAge};
  return{kind:'legacy',id:'delayed_event',age:originAge};
}

export function emptyConsequenceSchedulerState():ConsequenceSchedulerState{return{version:CONSEQUENCE_SCHEDULER_VERSION,eventCooldownAges:{},history:[]};}

export function normalizeDelayedConsequence(delayed:DelayedEvent,currentAge:number):DelayedEvent{
  const rawDueAge=finiteAge(delayed.dueAge,currentAge);
  const earliestAge=finiteAge(delayed.earliestAge,rawDueAge);
  const dueAge=Math.max(rawDueAge,earliestAge);
  const scheduledAge=finiteAge(delayed.scheduledAge,finiteAge(delayed.payload?.originAge,Math.min(currentAge,dueAge)));
  const latestRaw=delayed.latestAge===undefined?undefined:finiteAge(delayed.latestAge,dueAge);
  const targetRefs=cloneTargets(delayed.targetRefs)??legacyNpcTarget(delayed);const requiredRelationshipTypes=legacyRequiredRelationships(delayed);
  const validity=cloneValidity(delayed.validity)??(targetRefs?.some(target=>target.kind==='npc')&&requiredRelationshipTypes?{targetMustExist:true,targetMustBeAlive:true,requiredRelationshipTypes}:undefined);
  const chainId=cleanString(delayed.chainId)??inferredChainId(delayed);
  return{
    id:delayed.id,eventId:delayed.eventId,dueAge,
    ...(delayed.payload?{payload:structuredClone(delayed.payload)}:{}),scheduledAge,earliestAge,
    ...(latestRaw!==undefined?{latestAge:Math.max(earliestAge,latestRaw)}:{}),priority:priority(delayed.priority??inferredPriority(delayed.eventId)),
    ...(chainId?{chainId}:{}),
    origin:delayed.origin&&typeof delayed.origin==='object'?{kind:['event','system','legacy'].includes(delayed.origin.kind)?delayed.origin.kind:'legacy',id:cleanString(delayed.origin.id)??'unknown',age:finiteAge(delayed.origin.age,scheduledAge)}:inferredOrigin(delayed,currentAge),
    ...(targetRefs?{targetRefs}:{}),...(validity?{validity}:{}),dedupeKey:cleanString(delayed.dedupeKey)??`legacy:${delayed.id}`,
  };
}

function normalizedHistory(value:unknown):ConsequenceHistoryEntry[]{
  if(!Array.isArray(value))return[];const seen=new Set<string>();const out:ConsequenceHistoryEntry[]=[];
  for(const item of value){if(!item||typeof item!=='object')continue;const raw=item as Partial<ConsequenceHistoryEntry>;if(typeof raw.id!=='string'||!raw.id||seen.has(raw.id)||typeof raw.eventId!=='string'||!raw.eventId||(raw.status!=='completed'&&raw.status!=='cancelled'))continue;seen.add(raw.id);const scheduledAge=finiteAge(raw.scheduledAge,0),dueAge=finiteAge(raw.dueAge,scheduledAge),resolvedAge=finiteAge(raw.resolvedAge,dueAge);out.push({id:raw.id,eventId:raw.eventId,status:raw.status,scheduledAge,dueAge,resolvedAge,priority:priority(raw.priority),...(cleanString(raw.chainId)?{chainId:cleanString(raw.chainId)!}:{}),...(raw.origin?{origin:{kind:['event','system','legacy'].includes(raw.origin.kind)?raw.origin.kind:'legacy',id:cleanString(raw.origin.id)??'unknown',age:finiteAge(raw.origin.age,scheduledAge)}}:{}),...(cloneTargets(raw.targetRefs)?{targetRefs:cloneTargets(raw.targetRefs)!}:{}),...(cleanString(raw.dedupeKey)?{dedupeKey:cleanString(raw.dedupeKey)!}:{}),...(cleanString(raw.reason)?{reason:cleanString(raw.reason)!}:{})});}
  return out.sort((a,b)=>a.resolvedAge-b.resolvedAge||a.id.localeCompare(b.id)).slice(-MAX_CONSEQUENCE_HISTORY);
}
function normalizedCooldowns(value:unknown,currentAge:number,recentEventIds:readonly string[]){const map:Record<string,number>={};if(value&&typeof value==='object')for(const[id,age]of Object.entries(value as Record<string,unknown>)){const n=Number(age);if(id&&Number.isFinite(n))map[id]=Math.max(0,Math.floor(n));}
  if(!Object.keys(map).length&&recentEventIds.length){const total=recentEventIds.length;for(let index=0;index<total;index++){const id=recentEventIds[index]!;map[id]=Math.max(0,currentAge-(total-1-index));}}
  return Object.fromEntries(Object.entries(map).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,MAX_EVENT_COOLDOWNS));}

export function ensureConsequenceSchedulerState(state:GameState){
  const raw=(state as Partial<GameState>).consequenceScheduler as ConsequenceSchedulerState|undefined;
  const history=normalizedHistory(raw?.history);
  const normalized=(Array.isArray(state.delayedEvents)?state.delayedEvents:[])
    .filter(item=>item&&typeof item.id==='string'&&typeof item.eventId==='string')
    .map(item=>normalizeDelayedConsequence(item,state.character.age))
    .sort(compareConsequenceOrder);
  const seenIds=new Set<string>(),seenKeys=new Set<string>(),active:DelayedEvent[]=[],duplicateHistory:ConsequenceHistoryEntry[]=[];
  for(const item of normalized){
    if(seenIds.has(item.id))continue;
    const duplicateKey=Boolean(item.dedupeKey&&seenKeys.has(item.dedupeKey));
    if(duplicateKey){duplicateHistory.push(historyFromContext(item,'cancelled',state.character.age,'duplicate_normalized'));continue;}
    seenIds.add(item.id);if(item.dedupeKey)seenKeys.add(item.dedupeKey);active.push(item);
  }
  state.consequenceScheduler={version:CONSEQUENCE_SCHEDULER_VERSION,eventCooldownAges:normalizedCooldowns(raw?.eventCooldownAges,state.character.age,state.recentEventIds??[]),history:normalizedHistory([...history,...duplicateHistory])};
  state.delayedEvents=active;
  pruneConsequenceState(state);
  return state.consequenceScheduler;
}

function historyFromContext(context:PendingConsequenceContext|DelayedEvent,status:'completed'|'cancelled',resolvedAge:number,reason?:string):ConsequenceHistoryEntry{
  return{id:context.id,eventId:context.eventId,status,scheduledAge:finiteAge(context.scheduledAge,resolvedAge),dueAge:finiteAge(context.dueAge,resolvedAge),resolvedAge,priority:priority(context.priority),...(context.chainId?{chainId:context.chainId}:{}),...(context.origin?{origin:structuredClone(context.origin)}:{}),...(context.targetRefs?{targetRefs:structuredClone(context.targetRefs)}:{}),...(context.dedupeKey?{dedupeKey:context.dedupeKey}:{}),...(reason?{reason}:{})};
}
function addHistory(state:GameState,entry:ConsequenceHistoryEntry){ensureConsequenceSchedulerState(state);state.consequenceScheduler.history=[...state.consequenceScheduler.history.filter(item=>item.id!==entry.id),entry].sort((a,b)=>a.resolvedAge-b.resolvedAge||a.id.localeCompare(b.id)).slice(-MAX_CONSEQUENCE_HISTORY);}

export function pruneConsequenceState(state:GameState){
  if(!state.consequenceScheduler)state.consequenceScheduler=emptyConsequenceSchedulerState();
  state.consequenceScheduler.history=normalizedHistory(state.consequenceScheduler.history);
  state.consequenceScheduler.eventCooldownAges=normalizedCooldowns(state.consequenceScheduler.eventCooldownAges,state.character.age,state.recentEventIds??[]);
  if(state.delayedEvents.length<=MAX_ACTIVE_CONSEQUENCES)return;
  const ordered=[...state.delayedEvents].sort(compareConsequenceOrder);const keep=ordered.slice(0,MAX_ACTIVE_CONSEQUENCES);const dropped=ordered.slice(MAX_ACTIVE_CONSEQUENCES);state.delayedEvents=keep;
  state.consequenceScheduler.history=normalizedHistory([...state.consequenceScheduler.history,...dropped.map(item=>historyFromContext(item,'cancelled',state.character.age,'queue_bound'))]);
}

function compareConsequenceOrder(a:DelayedEvent,b:DelayedEvent){const p=PRIORITY_WEIGHT[priority(b.priority)]-PRIORITY_WEIGHT[priority(a.priority)];if(p)return p;const due=finiteAge(a.dueAge,0)-finiteAge(b.dueAge,0);if(due)return due;const scheduled=finiteAge(a.scheduledAge,a.dueAge)-finiteAge(b.scheduledAge,b.dueAge);if(scheduled)return scheduled;return a.id.localeCompare(b.id);}

function targetExists(state:GameState,target:ConsequenceTargetRef){if(target.kind==='npc')return Boolean(state.npcs[target.id]);if(target.kind==='property')return state.assets.properties.some(item=>item.id===target.id);if(target.kind==='vehicle')return state.assets.vehicles.some(item=>item.id===target.id);if(target.kind==='business')return state.businesses.some(item=>item.id===target.id);if(target.kind==='collectible')return state.assets.collectibles.some(item=>item.id===target.id);if(target.kind==='social_world')return state.socialWorlds.some(item=>item.id===target.id);if(target.kind==='career')return Boolean((state.specialCareers as Record<string,unknown>)[target.id]);return true;}
export function consequenceValidityFailure(state:GameState,consequence:DelayedEvent):string|undefined{
  const validity=consequence.validity;const targets=consequence.targetRefs??[];if(consequence.latestAge!==undefined&&state.character.age>consequence.latestAge)return'due_window_expired';
  if(validity?.requiredFlags?.some(flag=>!state.flags[flag]))return'required_flag_missing';if(validity?.forbiddenFlags?.some(flag=>Boolean(state.flags[flag])))return'forbidden_flag_present';
  for(const target of targets){const exists=targetExists(state,target);if((validity?.targetMustExist??true)&&!exists)return`missing_target:${target.kind}`;if(target.kind==='npc'&&exists&&(validity?.targetMustBeAlive??false)&&!state.npcs[target.id]?.alive)return'target_npc_dead';}
  if(validity?.requiredRelationshipTypes?.length){const npc=targets.find(target=>target.kind==='npc');if(!npc)return'relationship_target_missing';const rel=state.relationships.find(item=>item.npcId===npc.id&&!item.estranged);if(!rel||!validity.requiredRelationshipTypes.includes(rel.type))return'required_relationship_missing';}
  return undefined;
}

export function scheduleConsequence(state:GameState,request:ScheduleConsequenceRequest):ScheduleConsequenceResult{
  ensureConsequenceSchedulerState(state);const scheduledAge=finiteAge(request.scheduledAge,state.character.age);const earliestAge=finiteAge(request.earliestAge,finiteAge(request.dueAge,scheduledAge));const dueAge=Math.max(earliestAge,finiteAge(request.dueAge,earliestAge));const latestAge=request.latestAge===undefined?undefined:finiteAge(request.latestAge,dueAge);if(latestAge!==undefined&&latestAge<earliestAge)return{scheduled:false,reason:'invalid_window'};
  const key=cleanString(request.dedupeKey)??inferredDedupeKey({id:'candidate',eventId:request.eventId,dueAge,payload:request.payload});
  if(key&&(state.delayedEvents.some(item=>item.dedupeKey===key)||state.pendingEvent?.consequence?.dedupeKey===key))return{scheduled:false,reason:'duplicate'};
  if(state.delayedEvents.length>=MAX_ACTIVE_CONSEQUENCES)return{scheduled:false,reason:'queue_full'};
  const candidate=normalizeDelayedConsequence({id:request.id??makeStateId(state,'consequence'),eventId:request.eventId,dueAge,payload:request.payload,scheduledAge,earliestAge,...(latestAge!==undefined?{latestAge}:{}),priority:request.priority??inferredPriority(request.eventId),chainId:request.chainId,origin:request.origin??{kind:'system',id:'unknown',age:scheduledAge},targetRefs:request.targetRefs,validity:request.validity,dedupeKey:key},state.character.age);
  state.delayedEvents=[...state.delayedEvents,candidate];return{scheduled:true,consequence:candidate};
}

export function cancelConsequence(state:GameState,consequence:DelayedEvent,reason:string){ensureConsequenceSchedulerState(state);state.delayedEvents=state.delayedEvents.filter(item=>item.id!==consequence.id);addHistory(state,historyFromContext(consequence,'cancelled',state.character.age,reason));}
export function completePendingConsequence(state:GameState,context:PendingConsequenceContext|undefined){if(!context)return;addHistory(state,historyFromContext(context,'completed',state.character.age));}
export function cancelPendingConsequence(state:GameState,context:PendingConsequenceContext|undefined,reason:string){if(!context)return;addHistory(state,historyFromContext(context,'cancelled',state.character.age,reason));}

export function nextDueConsequence(state:GameState):DelayedEvent|undefined{
  ensureConsequenceSchedulerState(state);if(state.pendingEvent)return undefined;
  const due=state.delayedEvents.filter(item=>state.character.age>=Math.max(item.dueAge,item.earliestAge??item.dueAge)).sort(compareConsequenceOrder);
  for(const item of due){const failure=consequenceValidityFailure(state,item);if(failure){cancelConsequence(state,item,failure);continue;}return item;}return undefined;
}
export function takeNextDueConsequence(state:GameState):DelayedEvent|undefined{const next=nextDueConsequence(state);if(!next)return undefined;state.delayedEvents=state.delayedEvents.filter(item=>item.id!==next.id);return next;}
export function hasDueConsequence(state:GameState){return Boolean(nextDueConsequence(state));}

export function pendingContextFromConsequence(consequence:DelayedEvent):PendingConsequenceContext{return{id:consequence.id,eventId:consequence.eventId,scheduledAge:finiteAge(consequence.scheduledAge,consequence.dueAge),dueAge:consequence.dueAge,priority:priority(consequence.priority),...(consequence.chainId?{chainId:consequence.chainId}:{}),...(consequence.origin?{origin:structuredClone(consequence.origin)}:{}),...(consequence.targetRefs?{targetRefs:structuredClone(consequence.targetRefs)}:{}),...(consequence.dedupeKey?{dedupeKey:consequence.dedupeKey}:{})};}

export function eventLastTriggeredAge(state:GameState,eventId:string){const age=state.consequenceScheduler?.eventCooldownAges?.[eventId];if(Number.isFinite(age))return age;const index=state.recentEventIds?.lastIndexOf(eventId)??-1;if(index<0)return undefined;return Math.max(0,state.character.age-((state.recentEventIds.length-1)-index));}
export function recordEventTriggeredAge(state:GameState,eventId:string,age=state.character.age){ensureConsequenceSchedulerState(state);state.consequenceScheduler.eventCooldownAges[eventId]=finiteAge(age,state.character.age);pruneConsequenceState(state);}

export function resetConsequenceSchedulerForNewProtagonist(state:GameState){state.delayedEvents=[];state.pendingEvent=undefined;state.recentEventIds=[];state.consequenceScheduler=emptyConsequenceSchedulerState();}

/** Save migration/normalization entrypoint. Deterministic and RNG-neutral. */
export function migrateConsequenceSchedulerState(state:GameState){ensureConsequenceSchedulerState(state);return state;}
