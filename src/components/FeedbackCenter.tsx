import { useEffect, useMemo, useState } from 'react';
import type { GameState } from '../types/game';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_INTERFACES,
  FEEDBACK_MAX_DESCRIPTION,
  activeFeedbackReports,
  createFeedbackReport,
  fetchFeedbackBuildInfo,
  formatFeedbackReport,
  loadFeedbackReports,
  queueFeedbackReport,
  serializeFeedbackInbox,
  validateFeedbackDraft,
  withdrawFeedbackReport,
  type FeedbackBuildInfo,
  type FeedbackDraft,
  type FeedbackKind,
  type FeedbackReport,
} from '../feedback/reporting';
import '../feedback/feedback.css';

const DEFAULT_INTERFACE=FEEDBACK_INTERFACES[0];
const DEFAULT_KIND:FeedbackKind='technical';

function makeDraft():FeedbackDraft{return{
  interfaceId:DEFAULT_INTERFACE.id,
  actionId:DEFAULT_INTERFACE.actions[0].id,
  kind:DEFAULT_KIND,
  categoryId:FEEDBACK_CATEGORIES[DEFAULT_KIND][0].id,
  description:'',
  includeDiagnostics:true,
};}

export function FeedbackCenter({state}:{state:GameState}){
  const[formOpen,setFormOpen]=useState(false);
  const[draft,setDraft]=useState<FeedbackDraft>(()=>makeDraft());
  const[reports,setReports]=useState<FeedbackReport[]>(()=>loadFeedbackReports());
  const[message,setMessage]=useState('');
  const[buildInfo,setBuildInfo]=useState<FeedbackBuildInfo>();
  useEffect(()=>{void fetchFeedbackBuildInfo().then(setBuildInfo);},[]);
  const surface=useMemo(()=>FEEDBACK_INTERFACES.find(item=>item.id===draft.interfaceId)??DEFAULT_INTERFACE,[draft.interfaceId]);
  const categories=FEEDBACK_CATEGORIES[draft.kind];
  const active=activeFeedbackReports(reports);

  const resetForm=()=>{setDraft(makeDraft());setMessage('');setFormOpen(false);};
  const changeInterface=(interfaceId:string)=>{
    const next=FEEDBACK_INTERFACES.find(item=>item.id===interfaceId)??DEFAULT_INTERFACE;
    setDraft(current=>({...current,interfaceId:next.id,actionId:next.actions[0].id}));
  };
  const changeKind=(kind:FeedbackKind)=>setDraft(current=>({...current,kind,categoryId:FEEDBACK_CATEGORIES[kind][0].id}));
  const createReport=()=>{
    const error=validateFeedbackDraft(draft);if(error){setMessage(error);return;}
    try{
      const report=createFeedbackReport(draft,state,{buildInfo});
      setReports(queueFeedbackReport(report));
      setDraft(makeDraft());setFormOpen(false);setMessage(`Report ${report.id} saved to this device.`);
    }catch(error){setMessage(error instanceof Error?error.message:'Could not create the report.');}
  };
  const copyReport=async(report:FeedbackReport)=>{
    try{await navigator.clipboard.writeText(formatFeedbackReport(report));setMessage(`${report.id} copied.`);}catch{setMessage('Copy is not available in this browser. Use Export feedback inbox instead.');}
  };
  const shareReport=async(report:FeedbackReport)=>{
    const text=formatFeedbackReport(report);
    if(typeof navigator.share==='function'){
      try{await navigator.share({title:`Everthread report ${report.id}`,text});setMessage(`${report.id} opened in your share sheet.`);return;}catch(error){if((error as Error)?.name==='AbortError')return;}
    }
    await copyReport(report);
  };
  const cancelReport=(report:FeedbackReport)=>{
    if(!confirm(`Cancel ${report.id}? It will stay in your local history as withdrawn so a future exported inbox can show reviewers not to investigate it.`))return;
    setReports(withdrawFeedbackReport(report.id));setMessage(`${report.id} marked withdrawn.`);
  };
  const exportInbox=()=>{
    const text=serializeFeedbackInbox(reports);
    const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');
    anchor.href=url;anchor.download=`everthread-feedback-inbox-${new Date().toISOString().slice(0,10)}.json`;anchor.click();URL.revokeObjectURL(url);
    setMessage('Feedback inbox exported. You can attach this JSON when asking Yuki to review reports.');
  };

  return <section className="feedback-center sheet-section" aria-label="Help and feedback">
    <div className="feedback-heading"><div><p className="eyebrow">Help & feedback</p><h3>Report an issue or suggestion</h3><small>Reports are QA metadata, not part of your character or save. They stay on this device until you share or export them.</small></div><span>{active.length} queued</span></div>
    {!formOpen&&<button type="button" className="full-button" onClick={()=>{setMessage('');setFormOpen(true);}}>Report issue or suggestion</button>}
    {formOpen&&<div className="feedback-form" role="group" aria-label="Create Everthread report">
      <label className="form-field"><span>Where did it happen?</span><select value={draft.interfaceId} onChange={event=>changeInterface(event.target.value)}>{FEEDBACK_INTERFACES.map(item=><option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
      <label className="form-field"><span>What were you doing?</span><select value={draft.actionId} onChange={event=>setDraft(current=>({...current,actionId:event.target.value}))}>{surface.actions.map(action=><option value={action.id} key={action.id}>{action.label}</option>)}</select></label>
      <label className="form-field"><span>What kind of report?</span><select value={draft.kind} onChange={event=>changeKind(event.target.value as FeedbackKind)}><option value="technical">Technical issue</option><option value="experience">Experience issue</option><option value="suggestion">Suggestion</option></select></label>
      <label className="form-field"><span>Which best describes it?</span><select value={draft.categoryId} onChange={event=>setDraft(current=>({...current,categoryId:event.target.value}))}>{categories.map(category=><option value={category.id} key={category.id}>{category.label}</option>)}</select></label>
      <label className="form-field"><span>Tell Yuki what happened</span><textarea value={draft.description} maxLength={FEEDBACK_MAX_DESCRIPTION} rows={5} placeholder={draft.kind==='suggestion'?'What would you like Everthread to do differently?':'What did you expect, and what happened instead?'} onChange={event=>setDraft(current=>({...current,description:event.target.value}))}/><small>{draft.description.length}/{FEEDBACK_MAX_DESCRIPTION}</small></label>
      <label className="feedback-diagnostics"><input type="checkbox" checked={draft.includeDiagnostics} onChange={event=>setDraft(current=>({...current,includeDiagnostics:event.target.checked}))}/><span><strong>Include safe diagnostic context</strong><small>Recommended. Includes build, game seed/RNG position, age, current career, counts, settings, pending event ID and recent timeline IDs — never your full save.</small></span></label>
      <div className="feedback-form-actions"><button type="button" className="full-button" onClick={createReport}>Save report</button><button type="button" className="ghost-button" onClick={resetForm}>Cancel</button></div>
    </div>}
    {message&&<p className="feedback-message" role="status">{message}</p>}
    <details className="feedback-history" open={reports.length>0}>
      <summary><span><strong>My reports</strong><small>{reports.length?`${active.length} queued · ${reports.length-active.length} withdrawn`:'No reports on this device'}</small></span><b>{reports.length}</b></summary>
      <div className="feedback-report-list">
        {reports.map(report=><article className={`feedback-report-card ${report.status}`} key={report.id}>
          <div className="feedback-report-top"><div><strong>{report.id}</strong><small>{report.interfaceLabel} → {report.actionLabel}</small></div><span>{report.status}</span></div>
          <p>{report.description}</p><small>{report.kind} · {report.categoryLabel}</small>
          <div className="feedback-report-actions"><button type="button" onClick={()=>void shareReport(report)}>Share</button><button type="button" onClick={()=>void copyReport(report)}>Copy</button>{report.status==='queued'&&<button type="button" className="danger-soft" onClick={()=>cancelReport(report)}>Cancel report</button>}</div>
          {report.status==='withdrawn'&&<small className="feedback-withdrawn">Withdrawn {report.withdrawnAt?new Date(report.withdrawnAt).toLocaleString():''}. Share/export the updated inbox if a reviewer already received the original.</small>}
        </article>)}
        {!reports.length&&<p className="empty-card">No feedback reports have been created on this device.</p>}
      </div>
    </details>
    {reports.length>0&&<button type="button" onClick={exportInbox}>Export feedback inbox JSON</button>}
    <small className="feedback-privacy">Technical reports are not automatically dismissed when backend tests pass. A reviewer should next inspect the interface/experience path before classifying expected behavior.</small>
  </section>;
}
