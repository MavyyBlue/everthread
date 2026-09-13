import { loadFeedbackReports, type FeedbackReport } from './reporting';

export const FEEDBACK_REMOTE_ENDPOINT='https://oyzcwkirqivbauqfqhbk.supabase.co/functions/v1/everthread-feedback';
export const FEEDBACK_SYNC_STORAGE_KEY='everthread-feedback-sync-v1';
export const FEEDBACK_SYNC_BATCH=10;

export type FeedbackRemoteStatus='pending'|'submitted'|'withdrawn'|'error';
export type FeedbackTriageStatus='new'|'triaged'|'reproducing'|'fixing'|'regression_added'|'certified'|'resolved'|'unable_to_reproduce';
export type FeedbackResolutionClass='backend_defect'|'interface_defect'|'experience_design'|'expected_but_unclear'|'suggestion'|'unable_to_reproduce'|'withdrawn_by_player';

export interface FeedbackSyncRecord {
  reportId:string;
  cancellationToken:string;
  remoteStatus:FeedbackRemoteStatus;
  updatedAt:string;
  lastAttemptAt?:string;
  submittedAt?:string;
  withdrawnAt?:string;
  error?:string;
  receivedAt?:string;
  triageStatus?:FeedbackTriageStatus;
  resolutionClass?:FeedbackResolutionClass;
  reviewedAt?:string;
  reviewedAgainstCommit?:string;
  fixCommit?:string;
  certificationRunId?:number;
  playerMessage?:string;
  lastStatusCheckAt?:string;
  statusError?:string;
}

interface StorageLike { getItem(key:string):string|null; setItem(key:string,value:string):void; }
type FetchLike=(input:string|URL|Request,init?:RequestInit)=>Promise<Response>;

interface FeedbackSyncOptions {
  storage?:StorageLike;
  fetcher?:FetchLike;
  now?:()=>Date;
  token?:string;
}

interface FeedbackRemoteBody {
  ok?:boolean;
  error?:string;
  status?:string;
  id?:string;
  receivedAt?:string;
  triageStatus?:FeedbackTriageStatus;
  resolutionClass?:FeedbackResolutionClass;
  reviewedAt?:string;
  reviewedAgainstCommit?:string;
  fixCommit?:string;
  certificationRunId?:number;
  playerMessage?:string;
  withdrawnAt?:string;
}

function safeStorage():StorageLike|undefined{
  if(typeof localStorage==='undefined')return undefined;
  return localStorage;
}

function safeFetcher():FetchLike|undefined{
  if(typeof fetch==='undefined')return undefined;
  return fetch.bind(globalThis);
}

function validToken(value:unknown):value is string{return typeof value==='string'&&/^[A-Fa-f0-9]{64}$/.test(value);}

function randomCancellationToken(){
  if(typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function')return undefined;
  const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}

function isTriageStatus(value:unknown):value is FeedbackTriageStatus{
  return value==='new'||value==='triaged'||value==='reproducing'||value==='fixing'||value==='regression_added'||value==='certified'||value==='resolved'||value==='unable_to_reproduce';
}
function isResolutionClass(value:unknown):value is FeedbackResolutionClass{
  return value==='backend_defect'||value==='interface_defect'||value==='experience_design'||value==='expected_but_unclear'||value==='suggestion'||value==='unable_to_reproduce'||value==='withdrawn_by_player';
}

function isSyncRecord(value:unknown):value is FeedbackSyncRecord{
  if(!value||typeof value!=='object')return false;
  const record=value as Partial<FeedbackSyncRecord>;
  return typeof record.reportId==='string'&&validToken(record.cancellationToken)&&
    (record.remoteStatus==='pending'||record.remoteStatus==='submitted'||record.remoteStatus==='withdrawn'||record.remoteStatus==='error')&&
    typeof record.updatedAt==='string'&&
    (record.triageStatus===undefined||isTriageStatus(record.triageStatus))&&
    (record.resolutionClass===undefined||isResolutionClass(record.resolutionClass));
}

export function loadFeedbackSyncRecords(storage:StorageLike|undefined=safeStorage()):FeedbackSyncRecord[]{
  if(!storage)return[];
  try{
    const parsed=JSON.parse(storage.getItem(FEEDBACK_SYNC_STORAGE_KEY)??'[]') as unknown;
    return Array.isArray(parsed)?parsed.filter(isSyncRecord):[];
  }catch{return[];}
}

export function persistFeedbackSyncRecords(records:FeedbackSyncRecord[],storage:StorageLike|undefined=safeStorage()){
  const unique=new Map<string,FeedbackSyncRecord>();
  for(const record of records)if(!unique.has(record.reportId))unique.set(record.reportId,record);
  const bounded=[...unique.values()].slice(0,100);
  try{storage?.setItem(FEEDBACK_SYNC_STORAGE_KEY,JSON.stringify(bounded));}catch{/* Sync metadata must never break gameplay. */}
  return bounded;
}

export function feedbackSyncRecord(reportId:string,storage:StorageLike|undefined=safeStorage()){
  return loadFeedbackSyncRecords(storage).find(record=>record.reportId===reportId);
}

function upsertSyncRecord(record:FeedbackSyncRecord,storage:StorageLike|undefined){
  const rest=loadFeedbackSyncRecords(storage).filter(item=>item.reportId!==record.reportId);
  persistFeedbackSyncRecords([record,...rest],storage);
  return record;
}

export function ensureFeedbackSyncRecord(reportId:string,options:{storage?:StorageLike;now?:()=>Date;token?:string}={}):FeedbackSyncRecord|undefined{
  const storage=options.storage??safeStorage();
  const existing=feedbackSyncRecord(reportId,storage);if(existing)return existing;
  const token=options.token??randomCancellationToken();if(!token||!validToken(token))return undefined;
  const now=(options.now??(()=>new Date()))().toISOString();
  return upsertSyncRecord({reportId,cancellationToken:token.toLowerCase(),remoteStatus:'pending',updatedAt:now},storage);
}

async function responseBody(response:Response):Promise<FeedbackRemoteBody>{
  try{return await response.json() as FeedbackRemoteBody;}catch{return{};}
}

function applyPlayerStatus(record:FeedbackSyncRecord,body:FeedbackRemoteBody,checkedAt:string):FeedbackSyncRecord{
  return {
    ...record,
    updatedAt:checkedAt,
    lastStatusCheckAt:checkedAt,
    statusError:undefined,
    receivedAt:body.receivedAt??record.receivedAt,
    triageStatus:isTriageStatus(body.triageStatus)?body.triageStatus:record.triageStatus,
    resolutionClass:isResolutionClass(body.resolutionClass)?body.resolutionClass:record.resolutionClass,
    reviewedAt:body.reviewedAt??record.reviewedAt,
    reviewedAgainstCommit:body.reviewedAgainstCommit??record.reviewedAgainstCommit,
    fixCommit:body.fixCommit??record.fixCommit,
    certificationRunId:Number.isInteger(body.certificationRunId)?body.certificationRunId:record.certificationRunId,
    playerMessage:typeof body.playerMessage==='string'?body.playerMessage:record.playerMessage,
    withdrawnAt:body.withdrawnAt??record.withdrawnAt,
  };
}

export async function refreshFeedbackStatus(reportId:string,options:FeedbackSyncOptions={}):Promise<FeedbackSyncRecord|undefined>{
  const storage=options.storage??safeStorage();
  const now=options.now??(()=>new Date());
  const fetcher=options.fetcher??safeFetcher();
  const record=feedbackSyncRecord(reportId,storage);
  if(!record||record.remoteStatus==='pending'||record.remoteStatus==='error')return record;
  if(!fetcher)return upsertSyncRecord({...record,lastStatusCheckAt:now().toISOString(),statusError:'Review status is unavailable in this browser.'},storage);
  const checkedAt=now().toISOString();
  try{
    const response=await fetcher(FEEDBACK_REMOTE_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:'status',id:reportId,cancellationToken:record.cancellationToken})});
    const body=await responseBody(response);
    if(!response.ok)return upsertSyncRecord({...record,lastStatusCheckAt:checkedAt,statusError:body.error??`Status check failed (${response.status}).`},storage);
    return upsertSyncRecord(applyPlayerStatus(record,body,checkedAt),storage);
  }catch(error){
    return upsertSyncRecord({...record,lastStatusCheckAt:checkedAt,statusError:error instanceof Error?error.message:'Could not refresh review status.'},storage);
  }
}

async function performSync(report:FeedbackReport,options:FeedbackSyncOptions={}):Promise<FeedbackSyncRecord|undefined>{
  const storage=options.storage??safeStorage();
  const now=options.now??(()=>new Date());
  const fetcher=options.fetcher??safeFetcher();
  let record=ensureFeedbackSyncRecord(report.id,{storage,now,token:options.token});
  if(!record)return undefined;
  if(report.status==='queued'&&record.remoteStatus==='submitted')return record;
  if(report.status==='withdrawn'&&record.remoteStatus==='withdrawn')return record;
  if(!fetcher){
    return upsertSyncRecord({...record,remoteStatus:'error',updatedAt:now().toISOString(),error:'Feedback delivery is unavailable in this browser.'},storage);
  }

  const attemptAt=now().toISOString();
  record=upsertSyncRecord({...record,updatedAt:attemptAt,lastAttemptAt:attemptAt,error:undefined},storage);
  const payload=report.status==='withdrawn'
    ?{operation:'withdraw',id:report.id,cancellationToken:record.cancellationToken,reason:report.withdrawalReason??'Player cancelled the report.'}
    :{operation:'submit',report,cancellationToken:record.cancellationToken};
  try{
    const response=await fetcher(FEEDBACK_REMOTE_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const body=await responseBody(response);
    const finishedAt=now().toISOString();
    if(report.status==='withdrawn'&&response.status===404){
      return upsertSyncRecord({...record,remoteStatus:'withdrawn',updatedAt:finishedAt,withdrawnAt:finishedAt,error:undefined},storage);
    }
    if(!response.ok){
      return upsertSyncRecord({...record,remoteStatus:'error',updatedAt:finishedAt,error:body.error??`Feedback delivery failed (${response.status}).`},storage);
    }
    if(report.status==='withdrawn'){
      return upsertSyncRecord({...record,remoteStatus:'withdrawn',updatedAt:finishedAt,withdrawnAt:body.withdrawnAt??finishedAt,error:undefined,triageStatus:'resolved',resolutionClass:'withdrawn_by_player'},storage);
    }
    return upsertSyncRecord({...record,remoteStatus:'submitted',updatedAt:finishedAt,submittedAt:record.submittedAt??finishedAt,error:undefined},storage);
  }catch(error){
    const finishedAt=now().toISOString();
    return upsertSyncRecord({...record,remoteStatus:'error',updatedAt:finishedAt,error:error instanceof Error?error.message:'Could not reach the feedback inbox.'},storage);
  }
}

const syncLocks=new Map<string,Promise<FeedbackSyncRecord|undefined>>();

export function syncFeedbackReport(report:FeedbackReport,options:FeedbackSyncOptions={}):Promise<FeedbackSyncRecord|undefined>{
  const prior=syncLocks.get(report.id);
  const task=(prior?prior.catch(()=>undefined):Promise.resolve(undefined)).then(()=>performSync(report,options));
  syncLocks.set(report.id,task);
  void task.finally(()=>{if(syncLocks.get(report.id)===task)syncLocks.delete(report.id);});
  return task;
}

export async function syncFeedbackQueue(reports:FeedbackReport[],options:FeedbackSyncOptions={}){
  const storage=options.storage??safeStorage();
  const syncById=new Map(loadFeedbackSyncRecords(storage).map(record=>[record.reportId,record]));
  const candidates=reports.filter(report=>report.status==='queued'||(syncById.has(report.id)&&syncById.get(report.id)?.remoteStatus!=='withdrawn')).slice(0,FEEDBACK_SYNC_BATCH);
  const results:FeedbackSyncRecord[]=[];
  for(const report of candidates){
    const result=await syncFeedbackReport(report,{...options,storage});
    if(!result)continue;
    const refreshed=result.remoteStatus==='submitted'?await refreshFeedbackStatus(report.id,{...options,storage}):result;
    if(refreshed)results.push(refreshed);
  }
  return results;
}

export function syncStoredFeedbackQueue(options:FeedbackSyncOptions={}){
  return syncFeedbackQueue(loadFeedbackReports(),options);
}

export function feedbackDeliveryLabel(record:FeedbackSyncRecord|undefined,status:FeedbackReport['status']){
  if(status==='withdrawn'){
    if(record?.remoteStatus==='withdrawn')return 'Withdrawn from central inbox';
    if(record?.remoteStatus==='error')return 'Withdrawal will retry when online';
    return 'Withdrawn on this device';
  }
  if(record?.remoteStatus==='submitted')return record.receivedAt?'Received by Everthread':'Sent to Everthread Feedback Inbox';
  if(record?.remoteStatus==='error')return 'Saved locally · delivery will retry';
  return 'Saved locally · sending when online';
}

export function feedbackReviewLabel(record:FeedbackSyncRecord|undefined){
  switch(record?.triageStatus){
    case 'new':return 'Received';
    case 'triaged':return 'Reviewed';
    case 'reproducing':return 'Under investigation';
    case 'fixing':return 'Fix in progress';
    case 'regression_added':return 'Fix being verified';
    case 'certified':return 'Fix certified';
    case 'resolved':return 'Resolved';
    case 'unable_to_reproduce':return 'Unable to reproduce';
    default:return 'Awaiting review';
  }
}

export function feedbackDispositionLabel(record:FeedbackSyncRecord|undefined){
  switch(record?.resolutionClass){
    case 'backend_defect':return 'Backend defect';
    case 'interface_defect':return 'Interface defect';
    case 'experience_design':return 'Experience / design issue';
    case 'expected_but_unclear':return 'Expected behavior · presentation issue';
    case 'suggestion':return 'Suggestion noted';
    case 'unable_to_reproduce':return 'Unable to reproduce';
    case 'withdrawn_by_player':return 'Withdrawn by player';
    default:return undefined;
  }
}
