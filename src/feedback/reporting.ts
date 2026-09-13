import type { GameState } from '../types/game';
import packageInfo from '../../package.json';

export const FEEDBACK_SCHEMA_VERSION=1;
export const FEEDBACK_STORAGE_KEY='everthread-feedback-reports-v1';
export const FEEDBACK_MAX_REPORTS=100;
export const FEEDBACK_MAX_DESCRIPTION=2400;

export type FeedbackKind='technical'|'experience'|'suggestion';
export type FeedbackReportStatus='queued'|'withdrawn';

export interface FeedbackActionDefinition { id:string; label:string; }
export interface FeedbackInterfaceDefinition { id:string; label:string; actions:FeedbackActionDefinition[]; }
export interface FeedbackCategoryDefinition { id:string; label:string; }

export const FEEDBACK_INTERFACES:FeedbackInterfaceDefinition[]=[
  {id:'life',label:'Life',actions:[
    {id:'age-up',label:'Age Up'},{id:'events',label:'Events & choices'},{id:'timeline',label:'Life timeline'},{id:'stats',label:'Stats & identity'},{id:'death-continuation',label:'Death & descendant continuation'},
  ]},
  {id:'people',label:'People',actions:[
    {id:'threadspace',label:'Threadspace'},{id:'person-profile',label:'Person profile'},{id:'relationship-action',label:'Relationship action'},{id:'family-planning',label:'Family planning'},{id:'search-filter',label:'Search, filters & navigation'},
  ]},
  {id:'activities',label:'Activities',actions:[
    {id:'wellness',label:'Health & wellness'},{id:'social',label:'Social activities'},{id:'travel',label:'Travel & emigration'},{id:'licenses',label:'Licenses'},{id:'crime-prison',label:'Crime & prison'},{id:'pets',label:'Pets'},{id:'collectibles',label:'Collectibles'},
  ]},
  {id:'career',label:'Career',actions:[
    {id:'education',label:'Education'},{id:'job-search',label:'Job search & applications'},{id:'workplace',label:'Workplace'},{id:'career-world',label:'Career Worlds'},{id:'special-career',label:'Special career action'},{id:'retirement',label:'Retirement / leaving a path'},
  ]},
  {id:'assets',label:'Assets & Money',actions:[
    {id:'banking-payments',label:'Banking, bills & payments'},{id:'borrowing-credit',label:'Credit & borrowing'},{id:'investments',label:'Investments'},{id:'property',label:'Property'},{id:'vehicles',label:'Vehicles / boats / aircraft'},{id:'business',label:'Business'},{id:'estate-planning',label:'Estate planning'},
  ]},
  {id:'minigames',label:'Minigames',actions:[
    {id:'pixel-overtake',label:'Pixel Overtake racing'},{id:'strike-sequence',label:'Strike Sequence combat'},{id:'other-minigame',label:'Another minigame'},{id:'minigame-result',label:'Minigame result / reward'},
  ]},
  {id:'progress-saves',label:'Progress & Life Saves',actions:[
    {id:'achievements',label:'Achievements & challenges'},{id:'life-saves',label:'Life Saves'},{id:'family-legacy',label:'Family Legacy'},{id:'import-export',label:'Import / export save'},
  ]},
  {id:'settings',label:'Settings',actions:[
    {id:'appearance',label:'Appearance'},{id:'accessibility',label:'Accessibility & motion'},{id:'audio-haptics',label:'Sound & haptics'},{id:'preferences',label:'Gameplay preferences'},{id:'feedback-center',label:'Report Issue / Suggestion'},
  ]},
  {id:'other',label:'Something else',actions:[{id:'other',label:'Other / not sure'}]},
];

export const FEEDBACK_CATEGORIES:Record<FeedbackKind,FeedbackCategoryDefinition[]>={
  technical:[
    {id:'action-not-working',label:'Action or button does not work'},
    {id:'wrong-result',label:'Wrong result or state change'},
    {id:'stale-interface',label:'Interface did not update'},
    {id:'save-load',label:'Save, load, import or persistence problem'},
    {id:'crash-freeze',label:'Crash, freeze or blank screen'},
    {id:'visual-layout',label:'Visual or layout defect'},
    {id:'performance',label:'Slow, laggy or excessive battery use'},
    {id:'audio-haptics',label:'Sound or haptics problem'},
    {id:'other',label:'Other technical issue'},
  ],
  experience:[
    {id:'confusing',label:'Confusing or unclear'},
    {id:'awkward-mobile',label:'Awkward on a phone / touch screen'},
    {id:'unclear-feedback',label:'Result or consequence was not communicated well'},
    {id:'repetitive',label:'Too repetitive'},
    {id:'difficulty-balance',label:'Difficulty or balance feels wrong'},
    {id:'accessibility',label:'Accessibility problem'},
    {id:'pacing',label:'Pacing feels wrong'},
    {id:'visual-clarity',label:'Hard to read or visually understand'},
    {id:'other',label:'Other experience issue'},
  ],
  suggestion:[
    {id:'interface-improvement',label:'Interface improvement'},
    {id:'new-action',label:'New action or interaction'},
    {id:'content-variety',label:'More content or variety'},
    {id:'quality-of-life',label:'Quality-of-life improvement'},
    {id:'accessibility',label:'Accessibility suggestion'},
    {id:'other',label:'Other suggestion'},
  ],
};

export interface FeedbackDraft {
  interfaceId:string;
  actionId:string;
  kind:FeedbackKind;
  categoryId:string;
  description:string;
  includeDiagnostics:boolean;
}

export interface FeedbackBuildInfo {
  format:1;
  version:string;
  commit:string;
}

export interface FeedbackDiagnostics {
  appVersion:string;
  sourceCommit?:string;
  buildAsset?:string;
  page?:string;
  platform?:string;
  saveVersion:number;
  gameSeed:string;
  rngCounter:number;
  currentYear:number;
  characterAge:number;
  characterAlive:boolean;
  countryId:string;
  city:string;
  generation:number;
  currentCareer?:{jobId:string;title:string;company:string;level:number};
  counts:{npcs:number;relationships:number;socialWorlds:number;businesses:number;pets:number;liabilities:number;delayedEvents:number};
  pendingEvent?:{id:string;eventId?:string;title:string};
  settings:{theme:string;textScale:number;minigames:boolean;highContrast:boolean;reducedMotion:boolean;animations:boolean};
  recentTimeline:Array<{id:string;age:number;category:string;title?:string}>;
}

export interface FeedbackReport {
  schemaVersion:1;
  id:string;
  product:'Everthread: Life Unwritten';
  status:FeedbackReportStatus;
  createdAt:string;
  updatedAt:string;
  interfaceId:string;
  interfaceLabel:string;
  actionId:string;
  actionLabel:string;
  kind:FeedbackKind;
  categoryId:string;
  categoryLabel:string;
  description:string;
  diagnostics?:FeedbackDiagnostics;
  withdrawnAt?:string;
  withdrawalReason?:string;
}

export interface FeedbackInboxExport {
  format:1;
  product:'Everthread: Life Unwritten';
  exportedAt:string;
  activeCount:number;
  withdrawnCount:number;
  reports:FeedbackReport[];
}

interface StorageLike { getItem(key:string):string|null; setItem(key:string,value:string):void; }

function safeStorage():StorageLike|undefined{
  if(typeof localStorage==='undefined')return undefined;
  return localStorage;
}

function cleanText(value:string,max:number){return value.replace(/\s+/g,' ').trim().slice(0,max);}

function lookupInterface(interfaceId:string){return FEEDBACK_INTERFACES.find(item=>item.id===interfaceId);}
function lookupCategory(kind:FeedbackKind,categoryId:string){return FEEDBACK_CATEGORIES[kind].find(item=>item.id===categoryId);}

export function validateFeedbackDraft(draft:FeedbackDraft):string|undefined{
  const surface=lookupInterface(draft.interfaceId);
  if(!surface)return 'Choose the Everthread interface where this happened.';
  if(!surface.actions.some(action=>action.id===draft.actionId))return 'Choose an action that belongs to the selected interface.';
  if(!lookupCategory(draft.kind,draft.categoryId))return 'Choose a report category.';
  const description=cleanText(draft.description,FEEDBACK_MAX_DESCRIPTION);
  if(description.length<8)return 'Tell us a little more about what happened or what you would change.';
  return undefined;
}

function buildAssetFingerprint(){
  if(typeof performance==='undefined')return undefined;
  const resources=performance.getEntriesByType('resource').map(entry=>entry.name);
  const asset=resources.find(name=>/\/assets\/index-[^/]+\.js(?:\?|$)/.test(name));
  if(!asset)return undefined;
  try{return new URL(asset).pathname.split('/').pop();}catch{return asset.split('/').pop();}
}

export function captureFeedbackDiagnostics(state:GameState,buildInfo?:Partial<FeedbackBuildInfo>):FeedbackDiagnostics{
  const current=state.employment.current;
  return {
    appVersion:buildInfo?.version??packageInfo.version,
    sourceCommit:buildInfo?.commit&&buildInfo.commit!=='unavailable'?buildInfo.commit:undefined,
    buildAsset:buildAssetFingerprint(),
    page:typeof location!=='undefined'?location.href:undefined,
    platform:typeof navigator!=='undefined'?navigator.userAgent:undefined,
    saveVersion:state.saveVersion,
    gameSeed:state.seed,
    rngCounter:state.rngCounter,
    currentYear:state.currentYear,
    characterAge:state.character.age,
    characterAlive:state.character.alive,
    countryId:state.character.countryId,
    city:state.character.city,
    generation:state.legacy.generation,
    currentCareer:current?{jobId:current.jobId,title:current.title,company:current.company,level:current.level}:undefined,
    counts:{
      npcs:Object.keys(state.npcs).length,
      relationships:state.relationships.length,
      socialWorlds:state.socialWorlds.length,
      businesses:state.businesses.length,
      pets:state.pets.length,
      liabilities:state.finances.liabilities.length,
      delayedEvents:state.delayedEvents.length,
    },
    pendingEvent:state.pendingEvent?{id:state.pendingEvent.eventId,eventId:state.pendingEvent.eventId,title:state.pendingEvent.title}:undefined,
    settings:{
      theme:state.settings.theme,
      textScale:state.settings.textScale,
      minigames:state.settings.minigames,
      highContrast:state.settings.highContrast,
      reducedMotion:state.settings.reducedMotion,
      animations:state.settings.animations,
    },
    recentTimeline:state.timeline.slice(-8).map(entry=>({id:entry.id,age:entry.age,category:entry.category,title:entry.title})),
  };
}

function randomToken(){
  if(typeof crypto!=='undefined'&&typeof crypto.getRandomValues==='function'){
    const bytes=new Uint8Array(4);crypto.getRandomValues(bytes);return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('').toUpperCase().slice(0,6);
  }
  return Math.random().toString(36).slice(2,8).toUpperCase().padEnd(6,'0');
}

export function createFeedbackReport(draft:FeedbackDraft,state:GameState,options:{now?:Date;token?:string;buildInfo?:Partial<FeedbackBuildInfo>}={}):FeedbackReport{
  const error=validateFeedbackDraft(draft);if(error)throw new Error(error);
  const surface=lookupInterface(draft.interfaceId)!;
  const action=surface.actions.find(item=>item.id===draft.actionId)!;
  const category=lookupCategory(draft.kind,draft.categoryId)!;
  const now=options.now??new Date();
  const stamp=now.toISOString().slice(0,10).replace(/-/g,'');
  const token=cleanText(options.token??randomToken(),12).replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,8)||'REPORT';
  const iso=now.toISOString();
  return {
    schemaVersion:1,
    id:`ET-${stamp}-${token}`,
    product:'Everthread: Life Unwritten',
    status:'queued',
    createdAt:iso,
    updatedAt:iso,
    interfaceId:surface.id,
    interfaceLabel:surface.label,
    actionId:action.id,
    actionLabel:action.label,
    kind:draft.kind,
    categoryId:category.id,
    categoryLabel:category.label,
    description:cleanText(draft.description,FEEDBACK_MAX_DESCRIPTION),
    diagnostics:draft.includeDiagnostics?captureFeedbackDiagnostics(state,options.buildInfo):undefined,
  };
}

function isReport(value:unknown):value is FeedbackReport{
  if(!value||typeof value!=='object')return false;
  const report=value as Partial<FeedbackReport>;
  return report.schemaVersion===1&&typeof report.id==='string'&&report.product==='Everthread: Life Unwritten'&&(report.status==='queued'||report.status==='withdrawn')&&typeof report.createdAt==='string'&&typeof report.updatedAt==='string'&&typeof report.interfaceId==='string'&&typeof report.actionId==='string'&&(report.kind==='technical'||report.kind==='experience'||report.kind==='suggestion')&&typeof report.categoryId==='string'&&typeof report.description==='string';
}

export function loadFeedbackReports(storage:StorageLike|undefined=safeStorage()):FeedbackReport[]{
  if(!storage)return[];
  try{
    const parsed=JSON.parse(storage.getItem(FEEDBACK_STORAGE_KEY)??'[]') as unknown;
    if(!Array.isArray(parsed))return[];
    return parsed.filter(isReport).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,FEEDBACK_MAX_REPORTS);
  }catch{return[];}
}

export function persistFeedbackReports(reports:FeedbackReport[],storage:StorageLike|undefined=safeStorage()){
  const bounded=[...reports].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,FEEDBACK_MAX_REPORTS);
  try{storage?.setItem(FEEDBACK_STORAGE_KEY,JSON.stringify(bounded));}catch{/* Reporting must never break gameplay when browser storage is unavailable/full. */}
  return bounded;
}

export function queueFeedbackReport(report:FeedbackReport,storage:StorageLike|undefined=safeStorage()){
  const existing=loadFeedbackReports(storage).filter(item=>item.id!==report.id);
  return persistFeedbackReports([report,...existing],storage);
}

export function withdrawFeedbackReport(reportId:string,reason='Player cancelled the report.',storage:StorageLike|undefined=safeStorage(),now=new Date()){
  const reports=loadFeedbackReports(storage);
  const index=reports.findIndex(report=>report.id===reportId);
  if(index<0)return reports;
  const report=reports[index];
  if(report.status==='withdrawn')return reports;
  const iso=now.toISOString();
  reports[index]={...report,status:'withdrawn',updatedAt:iso,withdrawnAt:iso,withdrawalReason:cleanText(reason,400)};
  return persistFeedbackReports(reports,storage);
}

export function activeFeedbackReports(reports:FeedbackReport[]){return reports.filter(report=>report.status==='queued');}

export function exportFeedbackInbox(reports:FeedbackReport[],now=new Date()):FeedbackInboxExport{
  return {
    format:1,
    product:'Everthread: Life Unwritten',
    exportedAt:now.toISOString(),
    activeCount:reports.filter(report=>report.status==='queued').length,
    withdrawnCount:reports.filter(report=>report.status==='withdrawn').length,
    reports:[...reports],
  };
}

export function serializeFeedbackInbox(reports:FeedbackReport[],now=new Date()){
  return JSON.stringify(exportFeedbackInbox(reports,now),null,2);
}

export function formatFeedbackReport(report:FeedbackReport){
  const diagnostics=report.diagnostics;
  const diagnosticLines=diagnostics?[
    `Build: ${diagnostics.appVersion}${diagnostics.sourceCommit?` · ${diagnostics.sourceCommit}`:''}${diagnostics.buildAsset?` · ${diagnostics.buildAsset}`:''}`,
    `Save schema: ${diagnostics.saveVersion} · seed: ${diagnostics.gameSeed} · RNG counter: ${diagnostics.rngCounter}`,
    `Life: year ${diagnostics.currentYear} · age ${diagnostics.characterAge} · generation ${diagnostics.generation} · ${diagnostics.countryId}/${diagnostics.city}`,
    diagnostics.currentCareer?`Career: ${diagnostics.currentCareer.title} @ ${diagnostics.currentCareer.company} · level ${diagnostics.currentCareer.level} · ${diagnostics.currentCareer.jobId}`:'Career: none',
    diagnostics.pendingEvent?`Pending event: ${diagnostics.pendingEvent.eventId??diagnostics.pendingEvent.id} · ${diagnostics.pendingEvent.title}`:'Pending event: none',
    `Counts: NPCs ${diagnostics.counts.npcs} · relationships ${diagnostics.counts.relationships} · worlds ${diagnostics.counts.socialWorlds} · businesses ${diagnostics.counts.businesses} · pets ${diagnostics.counts.pets} · liabilities ${diagnostics.counts.liabilities} · delayed events ${diagnostics.counts.delayedEvents}`,
    `Settings: ${diagnostics.settings.theme} theme · text ${Math.round(diagnostics.settings.textScale*100)}% · minigames ${diagnostics.settings.minigames?'on':'off'} · reduced motion ${diagnostics.settings.reducedMotion?'on':'off'} · high contrast ${diagnostics.settings.highContrast?'on':'off'}`,
    diagnostics.recentTimeline.length?`Recent timeline: ${diagnostics.recentTimeline.map(entry=>`${entry.id}@${entry.age}`).join(', ')}`:'Recent timeline: none',
  ]:['Diagnostics: not included'];
  return [
    `${report.id} — ${report.status.toUpperCase()}`,
    `${report.interfaceLabel} → ${report.actionLabel}`,
    `${report.kind.toUpperCase()} · ${report.categoryLabel}`,
    `Created: ${report.createdAt}`,
    ...diagnosticLines,
    '',
    report.description,
    report.status==='withdrawn'?`\nWithdrawn: ${report.withdrawnAt??report.updatedAt} · ${report.withdrawalReason??'Player cancelled the report.'}`:'',
  ].filter(Boolean).join('\n');
}

export async function fetchFeedbackBuildInfo():Promise<FeedbackBuildInfo|undefined>{
  if(typeof fetch==='undefined')return undefined;
  try{
    const response=await fetch('./build-info.json',{cache:'no-store'});
    if(!response.ok)return undefined;
    const value=await response.json() as Partial<FeedbackBuildInfo>;
    if(value.format!==1||typeof value.version!=='string'||typeof value.commit!=='string')return undefined;
    return {format:1,version:value.version,commit:value.commit};
  }catch{return undefined;}
}
