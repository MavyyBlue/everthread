import { createNewGame } from '../systems/CharacterSystem';
import { createFeedbackReport, queueFeedbackReport, withdrawFeedbackReport, type FeedbackDraft } from '../feedback/reporting';
import {
  FEEDBACK_REMOTE_ENDPOINT,
  FEEDBACK_SYNC_BATCH,
  FEEDBACK_SYNC_STORAGE_KEY,
  ensureFeedbackSyncRecord,
  feedbackDeliveryLabel,
  loadFeedbackSyncRecords,
  syncFeedbackQueue,
  syncFeedbackReport,
} from '../feedback/remoteInbox';

let passed=0;let failed=0;
function verify(condition:boolean,label:string){if(condition){passed++;}else{failed++;console.error(`FAIL  ${label}`);}}
class MemoryStorage{private data=new Map<string,string>();getItem(key:string){return this.data.get(key)??null;}setItem(key:string,value:string){this.data.set(key,value);} }

const FIXED_TOKEN='A'.repeat(64);
const state=createNewGame({seed:'feedback-remote-regression',firstName:'Remote',lastName:'Thread'});
const draft:FeedbackDraft={interfaceId:'settings',actionId:'feedback-center',kind:'technical',categoryId:'other',description:'Central feedback delivery regression report for Everthread.',includeDiagnostics:true};

async function run(){
  verify(FEEDBACK_REMOTE_ENDPOINT==='https://oyzcwkirqivbauqfqhbk.supabase.co/functions/v1/everthread-feedback','remote feedback endpoint is pinned to the Everthread Supabase function');
  verify(FEEDBACK_SYNC_BATCH===10,'automatic startup synchronization is intentionally bounded');

  const storage=new MemoryStorage();
  const record=ensureFeedbackSyncRecord('ET-20260913-REMOTE01',{storage,token:FIXED_TOKEN,now:()=>new Date('2026-09-13T18:00:00.000Z')});
  verify(record?.cancellationToken===FIXED_TOKEN.toLowerCase()&&record.remoteStatus==='pending','sync metadata stores a private cancellation token outside the report');
  verify(loadFeedbackSyncRecords(storage).length===1,'sync metadata persists independently from life saves and report exports');

  const report=createFeedbackReport(draft,state,{now:new Date('2026-09-13T18:01:00.000Z'),token:'REMOTE02',buildInfo:{version:'0.12.0',commit:'d73bbfa6fdf8afb430f2604a09c9ac3053d60962'}});
  const reportBefore=JSON.stringify(report);
  const calls:Array<{operation:string;cancellationToken?:string;id?:string;report?:{id:string}}>=[];
  const fetcher=async(_input:string|URL|Request,init?:RequestInit)=>{
    const body=JSON.parse(String(init?.body??'{}')) as {operation:string;cancellationToken?:string;id?:string;report?:{id:string}};calls.push(body);
    return new Response(JSON.stringify({ok:true,id:body.report?.id??body.id,status:body.operation==='withdraw'?'withdrawn':'queued'}),{status:body.operation==='withdraw'?200:201,headers:{'Content-Type':'application/json'}});
  };
  const delivery=await syncFeedbackReport(report,{storage,fetcher,token:'B'.repeat(64),now:()=>new Date('2026-09-13T18:02:00.000Z')});
  verify(delivery?.remoteStatus==='submitted'&&Boolean(delivery.submittedAt),'queued report becomes centrally submitted after a successful response');
  verify(calls.length===1&&calls[0].operation==='submit'&&calls[0].report?.id===report.id,'central submission sends the structured report through the narrow submit operation');
  verify(calls[0].cancellationToken==='b'.repeat(64),'central submission sends the device cancellation secret without adding it to the report payload');
  verify(JSON.stringify(report)===reportBefore,'remote submission does not mutate the player report or GameState-derived diagnostics');
  await syncFeedbackReport(report,{storage,fetcher,now:()=>new Date('2026-09-13T18:03:00.000Z')});
  verify(calls.length===1,'already-submitted queued reports are idempotent and do not send duplicate requests');
  verify(feedbackDeliveryLabel(delivery,'queued')==='Sent to Everthread Feedback Inbox','submitted reports expose clear delivery status to the player');

  queueFeedbackReport(report,storage);
  const withdrawn=withdrawFeedbackReport(report.id,'I realized this was expected behavior.',storage,new Date('2026-09-13T18:04:00.000Z')).find(item=>item.id===report.id)!;
  const withdrawal=await syncFeedbackReport(withdrawn,{storage,fetcher,now:()=>new Date('2026-09-13T18:05:00.000Z')});
  verify(withdrawal?.remoteStatus==='withdrawn'&&calls.at(-1)?.operation==='withdraw','player cancellation is propagated to the central inbox');
  verify(calls.at(-1)?.cancellationToken==='b'.repeat(64),'withdrawal reuses the same private cancellation secret');

  const missingStorage=new MemoryStorage();
  const missingWithdrawn={...report,id:'ET-20260913-MISSING1',status:'withdrawn' as const,withdrawnAt:'2026-09-13T18:06:00.000Z',withdrawalReason:'Cancelled before delivery.'};
  const missingFetcher=async()=>new Response(JSON.stringify({ok:false,error:'not found'}),{status:404,headers:{'Content-Type':'application/json'}});
  const missingResult=await syncFeedbackReport(missingWithdrawn,{storage:missingStorage,fetcher:missingFetcher,token:'C'.repeat(64),now:()=>new Date('2026-09-13T18:07:00.000Z')});
  verify(missingResult?.remoteStatus==='withdrawn','a report cancelled before it ever reached the server safely resolves a 404 withdrawal');

  const errorStorage=new MemoryStorage();
  const errorReport={...report,id:'ET-20260913-NETERR1'};
  const errorBefore=JSON.stringify(errorReport);
  const errorResult=await syncFeedbackReport(errorReport,{storage:errorStorage,fetcher:async()=>{throw new Error('offline');},token:'D'.repeat(64),now:()=>new Date('2026-09-13T18:08:00.000Z')});
  verify(errorResult?.remoteStatus==='error'&&errorResult.error==='offline','network failures retain retryable delivery state instead of losing the report');
  verify(JSON.stringify(errorReport)===errorBefore,'network failure leaves the original report untouched');

  const batchStorage=new MemoryStorage();let batchCalls=0;
  const batchReports=Array.from({length:FEEDBACK_SYNC_BATCH+3},(_,index)=>createFeedbackReport(draft,state,{now:new Date(Date.UTC(2026,8,13,19,0,index)),token:`R${String(index).padStart(5,'0')}`}));
  const batchFetcher=async()=>{batchCalls++;return new Response(JSON.stringify({ok:true,status:'queued'}),{status:201,headers:{'Content-Type':'application/json'}});};
  await syncFeedbackQueue(batchReports,{storage:batchStorage,fetcher:batchFetcher,token:'E'.repeat(64),now:()=>new Date('2026-09-13T19:30:00.000Z')});
  verify(batchCalls===FEEDBACK_SYNC_BATCH,'startup retry sends only the bounded batch instead of flooding the inbox');

  const broken=new MemoryStorage();broken.setItem(FEEDBACK_SYNC_STORAGE_KEY,'not-json');
  verify(loadFeedbackSyncRecords(broken).length===0,'corrupt sync metadata fails closed without affecting reports or saves');

  console.log(`Feedback central inbox regression: ${passed}/${passed+failed} checks passed.`);
  if(failed)throw new Error(`Feedback central inbox regression failed ${failed} check(s).`);
}

void run();
