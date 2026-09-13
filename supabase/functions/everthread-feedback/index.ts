const PROJECT_URL = Deno.env.get('SUPABASE_URL') ?? 'https://oyzcwkirqivbauqfqhbk.supabase.co';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const PROD_ORIGIN = 'https://mavyyblue.github.io';
const MAX_BODY_BYTES = 40_000;
const MAX_DESCRIPTION = 2_400;
const RATE_LIMIT_PER_HOUR = 20;

const interfaceActions: Record<string, Set<string>> = {
  life: new Set(['age-up','events','timeline','stats','death-continuation']),
  people: new Set(['threadspace','person-profile','relationship-action','family-planning','search-filter']),
  activities: new Set(['wellness','social','travel','licenses','crime-prison','pets','collectibles']),
  career: new Set(['education','job-search','workplace','career-world','special-career','retirement']),
  assets: new Set(['banking-payments','borrowing-credit','investments','property','vehicles','business','estate-planning']),
  minigames: new Set(['pixel-overtake','strike-sequence','other-minigame','minigame-result']),
  'progress-saves': new Set(['achievements','life-saves','family-legacy','import-export']),
  settings: new Set(['appearance','accessibility','audio-haptics','preferences','feedback-center']),
  other: new Set(['other']),
};

const categories: Record<string, Set<string>> = {
  technical: new Set(['action-not-working','wrong-result','stale-interface','save-load','crash-freeze','visual-layout','performance','audio-haptics','other']),
  experience: new Set(['confusing','awkward-mobile','unclear-feedback','repetitive','difficulty-balance','accessibility','pacing','visual-clarity','other']),
  suggestion: new Set(['interface-improvement','new-action','content-variety','quality-of-life','accessibility','other']),
};

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;
  if (origin === PROD_ORIGIN) return true;
  try {
    const url = new URL(origin);
    return (url.hostname === 'localhost' || url.hostname === '127.0.0.1') && (url.protocol === 'http:' || url.protocol === 'https:');
  } catch { return false; }
}
function corsHeaders(origin: string | null) { return {
  'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : PROD_ORIGIN,
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}; }
function json(status:number,body:unknown,origin:string|null){return new Response(JSON.stringify(body),{status,headers:corsHeaders(origin)});}
function cleanText(value:unknown,max:number){return typeof value==='string'?value.replace(/\s+/g,' ').trim().slice(0,max):'';}
function validToken(value:unknown):value is string{return typeof value==='string'&&/^[A-Fa-f0-9]{64}$/.test(value);}
async function sha256Hex(value:string){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');}
function restHeaders(extra:Record<string,string>={}){if(!SERVICE_ROLE_KEY)throw new Error('Feedback service is missing server credentials.');return {'apikey':SERVICE_ROLE_KEY,'Authorization':`Bearer ${SERVICE_ROLE_KEY}`,'Content-Type':'application/json',...extra};}
async function rest(path:string,init:RequestInit={}){return fetch(`${PROJECT_URL}/rest/v1/${path}`,{...init,headers:restHeaders((init.headers??{}) as Record<string,string>)});}

function reportValidationError(report:any):string|undefined{
  if(!report||typeof report!=='object')return 'Report payload is missing.';
  if(report.schemaVersion!==1||report.product!=='Everthread: Life Unwritten')return 'Unsupported report format.';
  if(typeof report.id!=='string'||!/^ET-[0-9]{8}-[A-Z0-9]{6,12}$/.test(report.id))return 'Invalid report ID.';
  if(report.status!=='queued')return 'Only queued reports can be submitted.';
  if(!interfaceActions[report.interfaceId]?.has(report.actionId))return 'Invalid interface/action pair.';
  if(!categories[report.kind]?.has(report.categoryId))return 'Invalid report category.';
  if(cleanText(report.description,MAX_DESCRIPTION).length<8)return 'Report description is too short.';
  if(typeof report.createdAt!=='string'||Number.isNaN(Date.parse(report.createdAt)))return 'Invalid creation timestamp.';
  if(typeof report.updatedAt!=='string'||Number.isNaN(Date.parse(report.updatedAt)))return 'Invalid update timestamp.';
  if(report.diagnostics!=null&&JSON.stringify(report.diagnostics).length>20_000)return 'Diagnostics are too large.';
  return undefined;
}

async function rateLimit(req:Request){
  const forwarded=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??req.headers.get('cf-connecting-ip')??'unknown';
  const ua=(req.headers.get('user-agent')??'unknown').slice(0,160);
  const fingerprint=await sha256Hex(`${forwarded}|${ua}`);
  const cutoff=new Date(Date.now()-60*60*1000).toISOString();
  const countRes=await rest(`everthread_feedback_rate_limits?fingerprint_hash=eq.${encodeURIComponent(fingerprint)}&created_at=gte.${encodeURIComponent(cutoff)}&select=fingerprint_hash`,{headers:{'Prefer':'count=exact'}});
  if(!countRes.ok)throw new Error('Could not check feedback rate limit.');
  const count=Number((countRes.headers.get('content-range')??'').split('/')[1]??0);
  if(Number.isFinite(count)&&count>=RATE_LIMIT_PER_HOUR)return false;
  const insertRes=await rest('everthread_feedback_rate_limits',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify({fingerprint_hash:fingerprint})});
  if(!insertRes.ok)throw new Error('Could not record feedback rate limit.');
  if(Math.random()<0.05){const pruneBefore=new Date(Date.now()-48*60*60*1000).toISOString();void rest(`everthread_feedback_rate_limits?created_at=lt.${encodeURIComponent(pruneBefore)}`,{method:'DELETE'});}
  return true;
}
async function existingReport(id:string){const response=await rest(`everthread_feedback_reports?id=eq.${encodeURIComponent(id)}&select=id,status,cancellation_token_hash`);if(!response.ok)throw new Error('Could not inspect existing feedback report.');const rows=await response.json();return Array.isArray(rows)?rows[0]:undefined;}

async function submit(req:Request,origin:string|null,body:any){
  const report=body?.report;const token=body?.cancellationToken;const error=reportValidationError(report);
  if(error)return json(400,{ok:false,error},origin);
  if(!validToken(token))return json(400,{ok:false,error:'Invalid cancellation token.'},origin);
  if(!(await rateLimit(req)))return json(429,{ok:false,error:'Too many feedback submissions from this device. Please try again later.'},origin);
  const tokenHash=await sha256Hex(token.toLowerCase());const existing=await existingReport(report.id);
  if(existing){if(existing.cancellation_token_hash!==tokenHash)return json(409,{ok:false,error:'That report ID already exists.'},origin);return json(200,{ok:true,id:existing.id,status:existing.status,duplicate:true},origin);}
  const diagnostics=report.diagnostics&&typeof report.diagnostics==='object'?report.diagnostics:null;
  const payload={id:report.id,schema_version:1,product:'Everthread: Life Unwritten',status:'queued',created_at:report.createdAt,updated_at:report.updatedAt,interface_id:cleanText(report.interfaceId,64),interface_label:cleanText(report.interfaceLabel,120),action_id:cleanText(report.actionId,64),action_label:cleanText(report.actionLabel,160),kind:report.kind,category_id:cleanText(report.categoryId,64),category_label:cleanText(report.categoryLabel,160),description:cleanText(report.description,MAX_DESCRIPTION),diagnostics,app_version:cleanText(diagnostics?.appVersion,40)||null,source_commit:/^[0-9a-f]{7,40}$/.test(diagnostics?.sourceCommit??'')?diagnostics.sourceCommit:null,save_version:Number.isInteger(diagnostics?.saveVersion)?diagnostics.saveVersion:null,cancellation_token_hash:tokenHash,triage_status:'new'};
  const response=await rest('everthread_feedback_reports',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify(payload)});
  if(!response.ok){const detail=await response.text();console.error('feedback insert failed',response.status,detail.slice(0,500));return json(500,{ok:false,error:'Everthread could not submit this report right now. It is still saved on your device.'},origin);}
  return json(201,{ok:true,id:report.id,status:'queued'},origin);
}
async function withdraw(origin:string|null,body:any){
  const id=cleanText(body?.id,40);const token=body?.cancellationToken;
  if(!/^ET-[0-9]{8}-[A-Z0-9]{6,12}$/.test(id)||!validToken(token))return json(400,{ok:false,error:'Invalid withdrawal request.'},origin);
  const existing=await existingReport(id);if(!existing)return json(404,{ok:false,error:'That report is not in the central inbox.'},origin);
  const tokenHash=await sha256Hex(token.toLowerCase());if(existing.cancellation_token_hash!==tokenHash)return json(403,{ok:false,error:'This device cannot withdraw that report.'},origin);
  if(existing.status==='withdrawn')return json(200,{ok:true,id,status:'withdrawn',duplicate:true},origin);
  const now=new Date().toISOString();const reason=cleanText(body?.reason||'Player cancelled the report.',400);
  const response=await rest(`everthread_feedback_reports?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{'Prefer':'return=minimal'},body:JSON.stringify({status:'withdrawn',updated_at:now,withdrawn_at:now,withdrawal_reason:reason,triage_status:'resolved',resolution_class:'withdrawn_by_player',reviewed_at:now})});
  if(!response.ok)return json(500,{ok:false,error:'Everthread could not withdraw this report right now. Please try again.'},origin);
  return json(200,{ok:true,id,status:'withdrawn'},origin);
}

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get('origin');
  if(req.method==='OPTIONS'){if(!isAllowedOrigin(origin))return json(403,{ok:false,error:'Origin not allowed.'},origin);return new Response(null,{status:204,headers:corsHeaders(origin)});}
  if(req.method!=='POST')return json(405,{ok:false,error:'Method not allowed.'},origin);
  if(!isAllowedOrigin(origin))return json(403,{ok:false,error:'Origin not allowed.'},origin);
  const length=Number(req.headers.get('content-length')??0);if(Number.isFinite(length)&&length>MAX_BODY_BYTES)return json(413,{ok:false,error:'Report payload is too large.'},origin);
  try{const raw=await req.text();if(raw.length>MAX_BODY_BYTES)return json(413,{ok:false,error:'Report payload is too large.'},origin);const body=JSON.parse(raw);if(body?.operation==='submit')return await submit(req,origin,body);if(body?.operation==='withdraw')return await withdraw(origin,body);return json(400,{ok:false,error:'Unknown feedback operation.'},origin);}catch(error){console.error('feedback function error',error);return json(500,{ok:false,error:'Everthread could not reach the feedback inbox. Your local report is safe.'},origin);}
});
