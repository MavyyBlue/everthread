import type { EngineResult, GameState, RelationshipType } from '../types/game';
import { GameEngine } from '../engine/GameEngine';
import { createNewGame } from '../systems/CharacterSystem';
import { validateState } from '../core/invariants';
import { canAskOutNpc, canHookUpWithNpc, canReconcileWithNpc } from '../systems/RelationshipSystem';
import { specialCareerExitGate } from '../systems/SpecialCareerExitSystem';
import {
  specialCareerLifecycleViews,
  specialCareerRetirementGate,
  type DeepCareerPath,
} from '../systems/SpecialCareerLifecycleSystem';
import { isSpecialCareerPathActive, specialCareerStartGate, type SpecialCareerPathKey } from '../systems/CommitmentSystem';
import { actionAllowed, actionGateStatus } from '../core/actionEconomy';
import { specialCareerWorlds } from '../systems/SpecialCareerWorldSystem';
import { persistentCareerWorlds, PERSISTENT_CAREER_WORLD_KINDS } from '../systems/CareerWorldCatalogSystem';
import { canReportCoworker } from '../systems/WorkplaceSystem';
import { peopleWorkspaceSemanticView } from '../systems/PeopleWorkspaceSystem';

export type AiScreen = 'life' | 'people' | 'activities' | 'career' | 'assets';

export interface AiActionView {
  id: string;
  label: string;
  enabled: boolean;
  reason?: string;
  args?: string[];
  targetId?: string;
}

export interface AiObservation {
  screen: AiScreen;
  character: {
    name: string;
    age: number;
    year: number;
    alive: boolean;
  };
  pendingEvent?: {
    eventId: string;
    title: string;
    description: string;
    choices: Array<{id:string;label:string}>;
    npcId?: string;
  };
  data: Record<string, unknown>;
  actions: AiActionView[];
}

export interface AiCommand {
  id: string;
  args?: Record<string, string | number | boolean | undefined>;
}

export interface AiStateDiff {
  path: string;
  before: unknown;
  after: unknown;
}

export interface AiInteractionStep {
  command: AiCommand;
  result: EngineResult;
  before: AiObservation;
  after: AiObservation;
  diff: AiStateDiff[];
  invariantIssues: string[];
}

export interface AiScenarioTranscript {
  seed: string;
  steps: AiInteractionStep[];
  final: AiObservation;
}

export function renderAiObservation(view:AiObservation){
  const lines=[`SCREEN ${view.screen}`,`${view.character.name} · Age ${view.character.age} · ${view.character.year} · ${view.character.alive?'Alive':'Deceased'}`];
  if(view.pendingEvent){lines.push(`EVENT ${view.pendingEvent.eventId}: ${view.pendingEvent.title}`,view.pendingEvent.description);for(const choice of view.pendingEvent.choices)lines.push(`  CHOICE ${choice.id}: ${choice.label}`);}
  lines.push(`STATE ${JSON.stringify(view.data)}`,'ACTIONS');
  for(const action of view.actions)lines.push(`  ${action.enabled?'[enabled]':'[disabled]'} ${action.id}${action.targetId?` target=${action.targetId}`:''}${action.args?.length?` args=${action.args.join(',')}`:''}${action.reason?` — ${action.reason}`:''}`);
  return lines.join('\n');
}

class MemoryStorage implements Storage {
  private values = new Map<string,string>();
  get length(){return this.values.size;}
  clear(){this.values.clear();}
  getItem(key:string){return this.values.get(key)??null;}
  key(index:number){return [...this.values.keys()][index]??null;}
  removeItem(key:string){this.values.delete(key);}
  setItem(key:string,value:string){this.values.set(String(key),String(value));}
  keys(){return [...this.values.keys()].sort();}
}

type GlobalRestore = () => void;

function replaceGlobal(name:'localStorage'|'indexedDB',value:unknown):GlobalRestore {
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,name);
  Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  return()=>{
    if(descriptor)Object.defineProperty(globalThis,name,descriptor);
    else delete (globalThis as unknown as Record<string,unknown>)[name];
  };
}

function safeId(value:string){return value.toLowerCase().replace(/[^a-z0-9_-]+/g,'-').slice(0,64)||'scenario';}
function boolGate(id:string,label:string,enabled:boolean,reason?:string,args?:string[],targetId?:string):AiActionView{
  return{ id,label,enabled,...(!enabled&&reason?{reason}:{}),...(args?{args}:{}),...(targetId?{targetId}:{}) };
}
function gateAction(id:string,label:string,gate:{allowed:boolean;message?:string},args?:string[],targetId?:string):AiActionView{
  return boolGate(id,label,gate.allowed,gate.allowed?undefined:gate.message,args,targetId);
}
function unresolvedReason(state:GameState){
  if(!state.character.alive)return'This life has ended.';
  if(state.pendingEvent)return'Resolve the current event before another gameplay action.';
  return undefined;
}
function primaryAction(id:string,label:string,state:GameState,args?:string[]):AiActionView{
  const reason=unresolvedReason(state);return boolGate(id,label,!reason,reason,args);
}

const DEEP_PATHS:DeepCareerPath[]=['acting','music','sports','modeling','racing','directing'];
const PEOPLE_INTERACTIONS=['conversation','compliment','spend_time','gift','apologize','prank','argue','insult'] as const;

function relationshipActions(state:GameState):AiActionView[]{
  const blocked=unresolvedReason(state);const actions:AiActionView[]=[];
  actions.push(boolGate('people.interact','Interact with an exact person',!blocked,blocked,['npcId','action']));
  const meetAllowed=!blocked&&actionAllowed(state,{policy:'social.meet'});
  actions.push(boolGate('people.meet','Meet someone',meetAllowed,blocked??(meetAllowed?undefined:'You already used this social opportunity.')));
  for(const rel of state.relationships.filter(item=>state.npcs[item.npcId]?.alive&&!item.estranged).slice(0,16)){
    const npc=state.npcs[rel.npcId]!;const target=`${npc.firstName} ${npc.lastName}`;
    for(const interaction of PEOPLE_INTERACTIONS){
      actions.push(boolGate(`people.interact.${interaction}`,`${interaction.replace('_',' ')} with ${target}`,!blocked,blocked,['npcId'],npc.id));
    }
    if(canAskOutNpc(state,npc.id))actions.push(boolGate('people.ask_out',`Ask out ${target}`,!blocked,blocked,['npcId'],npc.id));
    if(canHookUpWithNpc(state,npc.id))actions.push(boolGate('people.hook_up',`Hook up with ${target}`,!blocked,blocked,['npcId'],npc.id));
    if(canReconcileWithNpc(state,npc.id))actions.push(boolGate('people.reconcile',`Reconcile with ${target}`,!blocked,blocked,['npcId'],npc.id));
    if(rel.type==='partner'){
      actions.push(boolGate('people.propose',`Propose to ${target}`,!blocked,blocked,['npcId'],npc.id));
      actions.push(boolGate('people.break_up',`Break up with ${target}`,!blocked,blocked,['npcId'],npc.id));
    }
    if(rel.type==='fiance'){
      actions.push(boolGate('people.marry',`Marry ${target}`,!blocked,blocked,['npcId'],npc.id));
      actions.push(boolGate('people.break_up',`End engagement with ${target}`,!blocked,blocked,['npcId'],npc.id));
    }
    if(rel.type==='spouse')actions.push(boolGate('people.divorce',`Divorce ${target}`,!blocked,blocked,['npcId'],npc.id));
    if(canReportCoworker(state,npc.id))actions.push(boolGate('people.report_workplace',`Raise a work concern involving ${target}`,!blocked,blocked,['npcId'],npc.id));
  }
  if(state.character.age>=18){
    const partner=state.relationships.find(rel=>['partner','fiance','spouse'].includes(rel.type)&&state.npcs[rel.npcId]?.alive);
    const expecting=Boolean(state.familyPlanning.pregnancy);
    const newbornPresent=state.relationships.some(rel=>rel.type==='child'&&state.npcs[rel.npcId]?.alive&&state.npcs[rel.npcId]?.age===0);
    const childAllowed=Boolean(!blocked&&partner&&!expecting&&!newbornPresent&&actionAllowed(state,{policy:'family.child_attempt'}));
    const adoptAllowed=Boolean(!blocked&&!expecting&&!newbornPresent&&actionAllowed(state,{policy:'family.adoption'}));
    actions.push(boolGate('people.have_child','Try for a child',childAllowed,blocked??(!partner?'A current partner is required.':expecting?'A pregnancy is already in progress.':newbornPresent?'A newborn is already present this year.':childAllowed?undefined:'This family-planning opportunity is unavailable.'),['partnerId'],partner?.npcId));
    actions.push(boolGate('people.adopt','Adopt a child',adoptAllowed,blocked??(expecting?'A pregnancy is already in progress.':newbornPresent?'A newborn is already present this year.':adoptAllowed?undefined:'This adoption opportunity is unavailable.')));
  }
  return actions;
}

function careerActions(state:GameState):AiActionView[]{
  const blocked=unresolvedReason(state);const actions:AiActionView[]=[];
  const add=(view:AiActionView)=>actions.push(blocked?{...view,enabled:false,reason:blocked}:view);
  add(primaryAction('career.work_harder','Work harder',state));
  add(primaryAction('career.ask_raise','Ask for a raise',state));
  add(primaryAction('career.resign','Resign from current job',state));
  add(primaryAction('career.standard_retire','Retire from standard employment',state));

  add(primaryAction('career.acting.lesson','Take an acting lesson',state));
  add(gateAction('career.acting.audition','Audition for acting work',specialCareerStartGate(state,'acting')));
  add(gateAction('career.acting.agent','Seek acting representation',specialCareerStartGate(state,'acting')));
  add(primaryAction('career.music.practice','Practice music',state,['instrument']));
  add(gateAction('career.music.song','Release a song',specialCareerStartGate(state,'music')));
  add(gateAction('career.music.album','Release an album',specialCareerStartGate(state,'music')));
  add(gateAction('career.music.tour','Start a music tour',specialCareerStartGate(state,'music')));
  const combatStart=specialCareerStartGate(state,'combat');
  const combatTrainGate=combatStart.allowed?actionGateStatus(state,{policy:'special.training',target:'combat'}):combatStart;
  const combatFightGate=!isSpecialCareerPathActive(state,'combat')?{allowed:false,message:'Begin combat-sport training before taking a fight.'}:actionGateStatus(state,{policy:'special.fight'});
  add(gateAction('career.combat.train','Train in combat sports',combatTrainGate));
  add(gateAction('career.combat.fight','Take a combat-sport bout',combatFightGate,['score']));
  add(primaryAction('career.modeling.lesson','Take a modeling lesson',state));
  add(gateAction('career.modeling.audition','Attend a modeling audition',specialCareerStartGate(state,'modeling')));
  add(gateAction('career.modeling.photoshoot','Book a modeling photoshoot',specialCareerStartGate(state,'modeling')));
  add(gateAction('career.modeling.runway','Book runway work',specialCareerStartGate(state,'modeling')));
  add(gateAction('career.racing.join','Join motorsport',specialCareerStartGate(state,'racing')));
  add(gateAction('career.racing.train','Train for racing',specialCareerStartGate(state,'racing')));
  add(gateAction('career.racing.race','Enter a race',specialCareerStartGate(state,'racing'),['score']));
  add(gateAction('career.directing.film','Direct a film',specialCareerStartGate(state,'directing'),['budget']));

  for(const path of DEEP_PATHS){
    const lifecycle=specialCareerLifecycleViews(state).find(view=>view.key===path);
    if(!lifecycle)continue;
    add(gateAction('career.special.leave',`Leave ${lifecycle.label}`,specialCareerExitGate(state,path as SpecialCareerPathKey),['path'],path));
    add(gateAction('career.special.retire',`Retire from ${lifecycle.label}`,specialCareerRetirementGate(state,path),['path'],path));
  }
  return actions;
}

function screenActions(state:GameState,screen:AiScreen):AiActionView[]{
  if(screen==='life'){
    const reason=state.pendingEvent?'Resolve the current event before aging.':!state.character.alive?'This life has ended.':undefined;
    const actions=[boolGate('life.age_up','Age Up',!reason,reason)];
    if(state.pendingEvent)for(const choice of state.pendingEvent.choices)actions.push(boolGate('event.choose',choice.label,true,undefined,['choiceId'],choice.id));
    return actions;
  }
  if(screen==='people')return relationshipActions(state);
  if(screen==='activities')return[
    primaryAction('activities.gym','Go to the gym',state),primaryAction('activities.running','Go running',state),
    primaryAction('activities.walking','Go walking',state),primaryAction('activities.meditation','Meditate',state),
    primaryAction('activities.diet','Improve diet',state),primaryAction('activities.meet_date','Meet someone',state),
    primaryAction('activities.therapy','Attend therapy',state),
  ];
  if(screen==='career')return careerActions(state);
  return[
    primaryAction('assets.property.purchase','Purchase property',state,['typeId','mortgage']),
    primaryAction('assets.property.rent','Rent out property',state,['assetId']),
    primaryAction('assets.property.renovate','Renovate property',state,['assetId']),
    primaryAction('assets.property.sell','Sell property',state,['assetId']),
    primaryAction('assets.vehicle.purchase','Purchase vehicle',state,['typeId']),
    primaryAction('assets.vehicle.repair','Repair vehicle',state,['assetId']),
    primaryAction('assets.collectible.purchase','Purchase collectible',state,['itemId']),
    primaryAction('assets.invest.buy','Buy investment',state,['securityId','amount']),
    primaryAction('assets.invest.sell','Sell investment',state,['securityId','units']),
    primaryAction('assets.business.start','Start business',state,['industryId','name']),
    primaryAction('assets.business.product','Add business product',state,['businessId']),
  ];
}

function npcView(state:GameState,npcId:string){
  const npc=state.npcs[npcId];if(!npc)return undefined;const rel=state.relationships.find(item=>item.npcId===npcId);
  const affiliations=state.socialWorlds.filter(world=>world.members.some(member=>member.npcId===npcId)).map(world=>({id:world.id,name:world.name,kind:world.kind,active:world.active,startedAge:world.startedAge,endedAge:world.endedAge,role:world.members.find(member=>member.npcId===npcId)?.role}));
  return{id:npc.id,name:`${npc.firstName} ${npc.lastName}`,age:npc.age,alive:npc.alive,relationship:rel?{type:rel.type,score:rel.score,attraction:rel.attraction,compatibility:rel.compatibility,estranged:Boolean(rel.estranged)}:undefined,hiddenOpinion:npc.hiddenOpinion,careerId:npc.careerId,affiliations,memories:npc.memories.slice(-8).map(memory=>({age:memory.age,kind:memory.kind,sentiment:memory.sentiment,summary:memory.summary}))};
}

function observeData(state:GameState,screen:AiScreen):Record<string,unknown>{
  if(screen==='life')return{
    stats:structuredClone(state.character.stats),secondary:{stress:state.character.secondary.stress,confidence:state.character.secondary.confidence,karma:state.character.secondary.karma},
    cash:state.finances.cash,fame:state.fame.fame,publicReputation:state.fame.publicReputation,
    employment:state.employment.current?{title:state.employment.current.title,company:state.employment.current.company,salary:state.employment.current.salary}:undefined,
    recentTimeline:state.timeline.slice(-8).map(entry=>({age:entry.age,category:entry.category,title:entry.title,text:entry.text,npcIds:entry.npcIds})),
  };
  if(screen==='people')return{
    workspace:peopleWorkspaceSemanticView(state),
    people:state.relationships.map(rel=>npcView(state,rel.npcId)).filter(Boolean).slice(0,24),
  };
  if(screen==='activities')return{
    health:{health:state.character.stats.health,fitness:state.health.fitness,wellness:state.health.wellness,stress:state.character.secondary.stress,conditions:state.health.conditions.map(item=>({id:item.id,name:item.name,severity:item.severity,chronic:item.chronic,treated:item.treated})),addictions:structuredClone(state.health.addictions)},
    actionLedger:{age:state.actionLedger.age,uses:structuredClone(state.actionLedger.uses),lastUsedAge:structuredClone(state.actionLedger.lastUsedAge)},
  };
  if(screen==='career')return{
    employment:{current:state.employment.current?structuredClone(state.employment.current):undefined,history:state.employment.history.slice(-6).map(item=>structuredClone(item)),partTimeJobs:state.employment.partTimeJobs.map(item=>structuredClone(item))},
    lifecycles:specialCareerLifecycleViews(state),
    worlds:persistentCareerWorlds(state).map(world=>({id:world.id,name:world.name,active:world.active,startedAge:world.startedAge,endedAge:world.endedAge,memberCount:world.members.length})),
    tracks:structuredClone(state.specialCareers),
  };
  return{
    cash:state.finances.cash,liabilities:state.finances.liabilities.map(item=>structuredClone(item)),
    properties:state.assets.properties.map(item=>({id:item.id,typeId:item.typeId,name:item.name,marketValue:item.marketValue,condition:item.condition,rental:item.rental})),
    vehicles:state.assets.vehicles.map(item=>({id:item.id,typeId:item.typeId,name:item.name,value:item.value,condition:item.condition,category:item.category})),
    collectibles:state.assets.collectibles.map(item=>({id:item.id,itemId:item.itemId,name:item.name,estimatedValue:item.estimatedValue,rarity:item.rarity})),
    investments:state.investments.positions.map(item=>structuredClone(item)),
    businesses:state.businesses.map(item=>({id:item.id,name:item.name,industryId:item.industryId,profit:item.profit,valuation:item.valuation,bankrupt:item.bankrupt,productIds:[...item.productIds]})),
  };
}

function observation(state:GameState,screen:AiScreen):AiObservation{
  const pending=state.pendingEvent;const npcId=typeof pending?.payload?.npcId==='string'?pending.payload.npcId:undefined;
  return{
    screen,character:{name:`${state.character.firstName} ${state.character.lastName}`,age:state.character.age,year:state.currentYear,alive:state.character.alive},
    ...(pending?{pendingEvent:{eventId:pending.eventId,title:pending.title,description:pending.description,choices:pending.choices.map(choice=>({...choice})),...(npcId?{npcId}:{})}}:{}),
    data:observeData(state,screen),actions:screenActions(state,screen),
  };
}

function comparableState(state:GameState){
  return{
    age:state.character.age,year:state.currentYear,alive:state.character.alive,
    stats:structuredClone(state.character.stats),secondary:structuredClone(state.character.secondary),
    cash:state.finances.cash,annualIncome:state.finances.annualIncome,annualExpenses:state.finances.annualExpenses,
    fame:{fame:state.fame.fame,publicReputation:state.fame.publicReputation,followers:state.fame.followers},
    employment:structuredClone(state.employment),relationships:structuredClone(state.relationships),
    npcs:Object.fromEntries(Object.entries(state.npcs).map(([id,npc])=>[id,{age:npc.age,alive:npc.alive,health:npc.health,happiness:npc.happiness,wealth:npc.wealth,careerId:npc.careerId,hiddenOpinion:npc.hiddenOpinion,memories:npc.memories.slice(-6)}])),
    specialCareers:structuredClone(state.specialCareers),socialWorlds:state.socialWorlds.map(world=>({id:world.id,name:world.name,kind:world.kind,active:world.active,startedAge:world.startedAge,endedAge:world.endedAge,members:world.members.map(member=>({...member}))})),
    assets:structuredClone(state.assets),investments:structuredClone(state.investments),businesses:structuredClone(state.businesses),
    pendingEvent:state.pendingEvent?structuredClone(state.pendingEvent):undefined,delayedEvents:structuredClone(state.delayedEvents),
    timelineCount:state.timeline.length,timelineTail:state.timeline.slice(-8).map(entry=>structuredClone(entry)),
    rngCounter:state.rngCounter,idCounter:state.idCounter,actionRevision:state.actionLedger.revision,
  };
}

function diffValues(before:unknown,after:unknown,path='',output:AiStateDiff[]=[]):AiStateDiff[]{
  if(output.length>=96)return output;
  if(Object.is(before,after))return output;
  if(before===null||after===null||typeof before!=='object'||typeof after!=='object'){
    output.push({path:path||'state',before,after});return output;
  }
  if(Array.isArray(before)||Array.isArray(after)){
    if(JSON.stringify(before)!==JSON.stringify(after))output.push({path:path||'state',before,after});return output;
  }
  const a=before as Record<string,unknown>;const b=after as Record<string,unknown>;const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  for(const key of keys)diffValues(a[key],b[key],path?`${path}.${key}`:key,output);
  return output;
}

function additionalInvariantIssues(state:GameState){
  const issues:string[]=[];
  if(state.character.age<0)issues.push('character age is negative');
  if(!Number.isFinite(state.finances.cash))issues.push('cash is non-finite');
  const spouses=state.relationships.filter(rel=>rel.type==='spouse'&&!rel.estranged&&state.npcs[rel.npcId]?.alive);if(spouses.length>1)issues.push('multiple living active spouses');
  const delayedIds=new Set<string>();for(const delayed of state.delayedEvents){if(delayedIds.has(delayed.id))issues.push(`duplicate delayed-event id ${delayed.id}`);delayedIds.add(delayed.id);}
  for(const path of PERSISTENT_CAREER_WORLD_KINDS){if(persistentCareerWorlds(state,path).filter(world=>world.active).length>1)issues.push(`multiple active ${path} Career Worlds`);}
  return issues;
}

function invariantIssues(state:GameState){return [...validateState(state),...additionalInvariantIssues(state)];}

function argString(command:AiCommand,key:string):string{const value=command.args?.[key];if(typeof value==='string'&&value)return value;throw new Error(`Command ${command.id} requires string argument ${key}.`);}
function argNumber(command:AiCommand,key:string,defaultValue?:number){const value=command.args?.[key];if(typeof value==='number'&&Number.isFinite(value))return value;if(defaultValue!==undefined)return defaultValue;throw new Error(`Command ${command.id} requires numeric argument ${key}.`);}
function argBoolean(command:AiCommand,key:string,defaultValue=false){const value=command.args?.[key];return typeof value==='boolean'?value:defaultValue;}

function dispatch(engine:GameEngine,command:AiCommand):EngineResult{
  const state=engine.getState();
  if(!state.character.alive&&!command.id.startsWith('test.'))return{success:false,messages:[{text:'This life has ended.'}]};
  if(state.pendingEvent&&command.id!=='event.choose')return{success:false,messages:[{text:'Resolve the current event before another gameplay action.'}]};
  switch(command.id){
    case'life.age_up':return engine.ageUp();
    case'event.choose':return engine.resolveEvent(argString(command,'choiceId'));
    case'test.force_event':return engine.forceEvent(argString(command,'eventId'));
    case'test.force_death':return engine.forceDeath();
    case'activities.gym':return engine.performActivity('gym');
    case'activities.running':return engine.performActivity('running');
    case'activities.walking':return engine.performActivity('walking');
    case'activities.meditation':return engine.performActivity('meditation');
    case'activities.diet':return engine.performActivity('diet');
    case'activities.meet_date':return engine.performActivity('meet_date');
    case'activities.therapy':return engine.therapy();
    case'people.interact':return engine.interactWithCharacter(argString(command,'npcId'),argString(command,'action'));
    case'people.interact.conversation':return engine.interactWithCharacter(argString(command,'npcId'),'conversation');
    case'people.interact.compliment':return engine.interactWithCharacter(argString(command,'npcId'),'compliment');
    case'people.interact.spend_time':return engine.interactWithCharacter(argString(command,'npcId'),'spend_time');
    case'people.interact.gift':return engine.interactWithCharacter(argString(command,'npcId'),'gift');
    case'people.interact.apologize':return engine.interactWithCharacter(argString(command,'npcId'),'apologize');
    case'people.interact.prank':return engine.interactWithCharacter(argString(command,'npcId'),'prank');
    case'people.interact.argue':return engine.interactWithCharacter(argString(command,'npcId'),'argue');
    case'people.interact.insult':return engine.interactWithCharacter(argString(command,'npcId'),'insult');
    case'people.meet':return engine.performActivity('meet_date');
    case'people.report_workplace':return engine.reportCoworker(argString(command,'npcId'));
    case'people.have_child':{
      const explicit=typeof command.args?.partnerId==='string'?command.args.partnerId:undefined;
      const partnerId=explicit??state.relationships.find(rel=>['partner','fiance','spouse'].includes(rel.type)&&state.npcs[rel.npcId]?.alive)?.npcId;
      return engine.haveChild(partnerId,false);
    }
    case'people.adopt':return engine.haveChild(undefined,true);
    case'people.hook_up':return engine.interactWithCharacter(argString(command,'npcId'),'hook_up');
    case'people.ask_out':return engine.relationshipAction(argString(command,'npcId'),'ask_out');
    case'people.propose':return engine.relationshipAction(argString(command,'npcId'),'propose');
    case'people.marry':return engine.relationshipAction(argString(command,'npcId'),'marry');
    case'people.break_up':return engine.relationshipAction(argString(command,'npcId'),'break_up');
    case'people.divorce':return engine.relationshipAction(argString(command,'npcId'),'divorce');
    case'people.reconcile':return engine.relationshipAction(argString(command,'npcId'),'reconcile');
    case'career.apply':return engine.applyForJob(argString(command,'jobId'));
    case'career.work_harder':return engine.workHarder();
    case'career.ask_raise':return engine.askForRaise();
    case'career.resign':return engine.resign();
    case'career.standard_retire':return engine.retire();
    case'career.acting.lesson':return engine.actingLesson();
    case'career.acting.audition':return engine.actingAudition(typeof command.args?.score==='number'?command.args.score:undefined);
    case'career.acting.agent':return engine.actingAgent();
    case'career.music.practice':return engine.musicPractice(typeof command.args?.instrument==='string'?command.args.instrument:undefined);
    case'career.music.song':return engine.musicRelease('song');
    case'career.music.album':return engine.musicRelease('album');
    case'career.music.tour':return engine.musicTour();
    case'career.combat.train':return engine.combatTrain();
    case'career.combat.fight':return engine.combatFight(typeof command.args?.score==='number'?command.args.score:undefined);
    case'career.modeling.lesson':return engine.model('lesson');
    case'career.modeling.audition':return engine.model('audition');
    case'career.modeling.photoshoot':return engine.model('photoshoot');
    case'career.modeling.runway':return engine.model('runway');
    case'career.racing.join':return engine.race('join');
    case'career.racing.train':return engine.race('train');
    case'career.racing.race':return engine.race('race',typeof command.args?.score==='number'?command.args.score:undefined);
    case'career.directing.film':return engine.directFilm(argNumber(command,'budget'));
    case'career.special.leave':return engine.leaveSpecialCareer(argString(command,'path') as SpecialCareerPathKey);
    case'career.special.retire':return engine.retireSpecialCareer(argString(command,'path') as DeepCareerPath);
    case'assets.property.purchase':return engine.purchaseProperty(argString(command,'typeId'),argBoolean(command,'mortgage',true));
    case'assets.property.rent':return engine.rentProperty(argString(command,'assetId'));
    case'assets.property.renovate':return engine.renovateProperty(argString(command,'assetId'));
    case'assets.property.sell':return engine.sellProperty(argString(command,'assetId'));
    case'assets.vehicle.purchase':return engine.purchaseVehicle(argString(command,'typeId'));
    case'assets.vehicle.repair':return engine.repairVehicle(argString(command,'assetId'));
    case'assets.collectible.purchase':return engine.purchaseCollectible(argString(command,'itemId'));
    case'assets.invest.buy':return engine.invest(argString(command,'securityId'),argNumber(command,'amount'));
    case'assets.invest.sell':return engine.sellInvestment(argString(command,'securityId'),typeof command.args?.units==='number'?command.args.units:undefined);
    case'assets.business.start':return engine.startBusiness(argString(command,'industryId'),argString(command,'name'));
    case'assets.business.product':return engine.addBusinessProduct(argString(command,'businessId'));
    default:return{success:false,messages:[{text:`Unknown AI testbench action: ${command.id}`}]} ;
  }
}

export class EverthreadAiTestbench {
  private engine:GameEngine;
  private storage=new MemoryStorage();
  private restoreGlobals:GlobalRestore[]=[];
  private currentScreen:AiScreen='life';
  readonly seed:string;
  readonly sourceStateSnapshot?:string;

  constructor(options:{seed?:string;state?:GameState;screen?:AiScreen}={}){
    this.seed=options.seed??options.state?.seed??'ai-testbench';
    this.currentScreen=options.screen??'life';
    this.sourceStateSnapshot=options.state?JSON.stringify(options.state):undefined;
    const state=options.state?structuredClone(options.state):createNewGame({seed:this.seed});
    state.slotId=`ai-test-${safeId(this.seed)}`;
    this.restoreGlobals.push(replaceGlobal('indexedDB',undefined));
    this.restoreGlobals.push(replaceGlobal('localStorage',this.storage));
    this.engine=new GameEngine(state);
  }

  getState(){return this.engine.getState();}
  setScreen(screen:AiScreen){this.currentScreen=screen;return this.observe();}
  observe(screen=this.currentScreen){return observation(this.engine.getState(),screen);}
  renderText(screen=this.currentScreen){return renderAiObservation(this.observe(screen));}
  availableActions(screen=this.currentScreen){return this.observe(screen).actions;}
  inspectNpc(npcId:string){return npcView(this.engine.getState(),npcId);}
  inspectPeopleWorkspace(){return peopleWorkspaceSemanticView(this.engine.getState());}
  inspectCareer(path:DeepCareerPath){
    const state=this.engine.getState();return{lifecycle:specialCareerLifecycleViews(state).find(view=>view.key===path),track:structuredClone(state.specialCareers[path]??{}),worlds:specialCareerWorlds(state,path).map(world=>({id:world.id,name:world.name,active:world.active,startedAge:world.startedAge,endedAge:world.endedAge,members:world.members.map(member=>({...member}))}))};
  }
  inspectTimeline(limit=20){return this.engine.getState().timeline.slice(-Math.max(1,Math.floor(limit))).map(entry=>structuredClone(entry));}
  storageKeys(){return this.storage.keys();}
  async flushPersistence(){await this.engine.flushSaves();}

  execute(command:AiCommand|string):AiInteractionStep{
    const normalized=typeof command==='string'?{id:command}:command;const before=this.observe();const beforeState=comparableState(this.engine.getState());
    let result:EngineResult;try{result=dispatch(this.engine,normalized);}catch(error){result={success:false,messages:[{text:error instanceof Error?error.message:String(error)}]};}
    const afterState=comparableState(this.engine.getState());const issues=invariantIssues(this.engine.getState());
    return{command:normalized,result,before,after:this.observe(),diff:diffValues(beforeState,afterState),invariantIssues:issues};
  }

  runScenario(commands:Array<AiCommand|string>):AiScenarioTranscript{
    const steps:AiInteractionStep[]=[];for(const command of commands){const step=this.execute(command);steps.push(step);if(step.invariantIssues.length)break;}return{seed:this.seed,steps,final:this.observe()};
  }

  async dispose(){
    await this.engine.flushSaves();
    for(const restore of this.restoreGlobals.reverse())restore();
    this.restoreGlobals=[];
  }
}

export async function withEverthreadAiTestbench<T>(options:{seed?:string;state?:GameState;screen?:AiScreen},run:(bench:EverthreadAiTestbench)=>T|Promise<T>){
  const bench=new EverthreadAiTestbench(options);try{return await run(bench);}finally{await bench.dispose();}
}

export function relationshipTypeOf(state:GameState,npcId:string):RelationshipType|undefined{return state.relationships.find(rel=>rel.npcId===npcId)?.type;}
