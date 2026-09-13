import { createNewGame } from '../systems/CharacterSystem';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_INTERFACES,
  FEEDBACK_MAX_REPORTS,
  activeFeedbackReports,
  captureFeedbackDiagnostics,
  createFeedbackReport,
  exportFeedbackInbox,
  loadFeedbackReports,
  persistFeedbackReports,
  queueFeedbackReport,
  serializeFeedbackInbox,
  validateFeedbackDraft,
  withdrawFeedbackReport,
  type FeedbackDraft,
} from '../feedback/reporting';

let passed=0;let failed=0;
function verify(condition:boolean,label:string){if(condition){passed++;}else{failed++;console.error(`FAIL  ${label}`);}}
class MemoryStorage{private data=new Map<string,string>();getItem(key:string){return this.data.get(key)??null;}setItem(key:string,value:string){this.data.set(key,value);}}

const state=createNewGame({seed:'feedback-regression',firstName:'Test',lastName:'Thread'});
const baseDraft:FeedbackDraft={interfaceId:'career',actionId:'workplace',kind:'technical',categoryId:'action-not-working',description:'The workplace action button appeared to do nothing after I tapped it.',includeDiagnostics:true};

verify(new Set(FEEDBACK_INTERFACES.map(item=>item.id)).size===FEEDBACK_INTERFACES.length,'feedback interface ids are unique');
verify(FEEDBACK_INTERFACES.every(item=>item.actions.length>0&&new Set(item.actions.map(action=>action.id)).size===item.actions.length),'every feedback interface has unique action ids');
verify((Object.keys(FEEDBACK_CATEGORIES) as Array<keyof typeof FEEDBACK_CATEGORIES>).every(kind=>FEEDBACK_CATEGORIES[kind].length>0),'every feedback kind has at least one category');
verify(validateFeedbackDraft(baseDraft)===undefined,'valid technical report draft is accepted');
verify(Boolean(validateFeedbackDraft({...baseDraft,actionId:'not-a-career-action'})),'action must belong to selected interface');
verify(Boolean(validateFeedbackDraft({...baseDraft,description:'tiny'})),'too-short descriptions are rejected');

const before=JSON.stringify(state);const rngBefore=state.rngCounter;
const diagnostics=captureFeedbackDiagnostics(state,{version:'0.12.0',commit:'certified-test-commit'});
verify(JSON.stringify(state)===before&&state.rngCounter===rngBefore,'diagnostic capture is read-only and RNG-neutral');
verify(diagnostics.gameSeed==='feedback-regression'&&diagnostics.sourceCommit==='certified-test-commit','diagnostics preserve reproduction seed and build commit');

const created=createFeedbackReport(baseDraft,state,{now:new Date('2026-09-13T12:00:00.000Z'),token:'ABC123',buildInfo:{version:'0.12.0',commit:'candidate'}});
verify(created.id==='ET-20260913-ABC123'&&created.status==='queued','report id and initial queue status are stable');
verify(created.interfaceLabel==='Career'&&created.actionLabel==='Workplace','report stores human labels alongside stable ids');
verify(created.diagnostics?.gameSeed==='feedback-regression','report includes safe diagnostics when requested');
const noDiagnostics=createFeedbackReport({...baseDraft,includeDiagnostics:false},state,{now:new Date('2026-09-13T12:00:00.000Z'),token:'NODIAG'});
verify(noDiagnostics.diagnostics===undefined,'player can decline diagnostic context');

const storage=new MemoryStorage();
let reports=queueFeedbackReport(created,storage);
verify(reports.length===1&&loadFeedbackReports(storage)[0].id===created.id,'queued reports persist outside GameState storage');
reports=withdrawFeedbackReport(created.id,'I realized I overlooked the existing control.',storage,new Date('2026-09-13T12:05:00.000Z'));
verify(reports[0].status==='withdrawn'&&reports[0].withdrawalReason?.includes('overlooked')===true,'player cancellation marks report withdrawn without erasing history');
verify(activeFeedbackReports(reports).length===0,'withdrawn reports leave the active review queue');

const many=Array.from({length:FEEDBACK_MAX_REPORTS+7},(_,index)=>createFeedbackReport(baseDraft,state,{now:new Date(Date.UTC(2026,8,13,12,0,index)),token:`T${String(index).padStart(5,'0')}`}));
const bounded=persistFeedbackReports(many,storage);
verify(bounded.length===FEEDBACK_MAX_REPORTS,'local report history is bounded');
verify(loadFeedbackReports(storage).length===FEEDBACK_MAX_REPORTS,'bounded report history survives reload');

const inbox=exportFeedbackInbox([created,reports[0]],new Date('2026-09-13T13:00:00.000Z'));
verify(inbox.activeCount===1&&inbox.withdrawnCount===1,'exported inbox separates active and withdrawn counts');
const serialized=serializeFeedbackInbox([created,reports[0]],new Date('2026-09-13T13:00:00.000Z'));
verify(serialized.includes('"format": 1')&&serialized.includes(created.id),'feedback inbox export is structured and preserves report ids');

const brokenStorage=new MemoryStorage();brokenStorage.setItem('everthread-feedback-reports-v1','not-json');
verify(loadFeedbackReports(brokenStorage).length===0,'corrupt feedback storage fails closed without affecting saves');

console.log(`Activity feedback reporting regression: ${passed}/${passed+failed} checks passed.`);
if(failed)throw new Error(`Activity feedback reporting regression failed ${failed} check(s).`);
