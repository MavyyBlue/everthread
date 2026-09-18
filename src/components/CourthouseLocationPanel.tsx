import { useState } from 'react';
import { formatMoney } from '../core/format';
import { crimeById } from '../data/crimes';
import type { LocationSceneCourthouseActionId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import { locationSceneLegalProjection } from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';

type Lawyer='public'|'budget'|'experienced'|'elite';
type Plea='contest'|'plead';
const LAWYERS:ReadonlyArray<{id:Lawyer;label:string;cost:number;detail:string}>=[
  {id:'public',label:'Public lawyer',cost:0,detail:'No direct fee. Uses the existing public-representation modifier.'},
  {id:'budget',label:'Budget lawyer',cost:900,detail:'Lower-cost private representation.'},
  {id:'experienced',label:'Experienced lawyer',cost:7500,detail:'Stronger representation at a substantial fee.'},
  {id:'elite',label:'Elite lawyer',cost:35000,detail:'The strongest existing representation option and highest fee.'},
];

function LegalCase({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneLegalProjection(state);const[lawyer,setLawyer]=useState<Lawyer>('public');const[plea,setPlea]=useState<Plea>('contest');
  if(!projection.pendingCrimeId)return <div className="empty-card">There is no pending criminal case to resolve. The Courthouse does not create cases or expose the crime catalogue.</div>;
  const definition=projection.pendingCrime??crimeById[projection.pendingCrimeId];const selected=LAWYERS.find(option=>option.id===lawyer)!;const affordable=state.finances.cash>=selected.cost;
  return <div className="location-scene__courthouse-panel">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Pending proceeding</p><h3>{definition?.name??'Pending criminal case'}</h3></div><strong>{Math.round(state.legal.investigationHeat)}</strong></div>
      <p>Resolving this case calls the existing CrimeSystem. Representation cost is paid from authoritative cash; conviction and sentence outcomes use the existing legal RNG and record.</p>
      <div className="sheet-stat-grid"><div><small>Legal heat</small><strong>{Math.round(state.legal.investigationHeat)}</strong></div><div><small>Your cash</small><strong>{formatMoney(state.finances.cash)}</strong></div></div>
    </section>
    <section className="action-card">
      <label className="form-field"><span>Representation</span><select value={lawyer} onChange={event=>setLawyer(event.target.value as Lawyer)}>{LAWYERS.map(option=><option key={option.id} value={option.id}>{option.label} · {formatMoney(option.cost)}</option>)}</select></label>
      <p className="muted">{selected.detail}</p>
      <label className="form-field"><span>Case approach</span><select value={plea} onChange={event=>setPlea(event.target.value as Plea)}><option value="contest">Contest charge</option><option value="plead">Plea route</option></select></label>
      {!affordable&&<p className="warning-card">You cannot afford this representation. Choose a lower-cost option or return later.</p>}
      <button className="full-button" disabled={!affordable} onClick={()=>onResult(gameEngine.resolveCase(lawyer,plea))}>Resolve case</button>
    </section>
    <p className="muted">This is fictional Everthread legal gameplay, not real-world legal advice.</p>
  </div>;
}

function LegalStatus({state}:{state:GameState}){
  const projection=locationSceneLegalProjection(state);
  return <div className="location-scene__courthouse-panel">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Current legal status</p><h3>{projection.statusLabel}</h3></div><strong>{Math.round(state.legal.investigationHeat)}</strong></div>
      <div className="sheet-stat-grid">
        <div><small>Investigation heat</small><strong>{Math.round(state.legal.investigationHeat)}</strong></div>
        <div><small>Pending case</small><strong>{projection.pendingCrimeId?'Yes':'No'}</strong></div>
        <div><small>Custody</small><strong>{state.legal.imprisoned?'Imprisoned':'Free'}</strong></div>
        <div><small>Fugitive</small><strong>{projection.fugitive?'Yes':'No'}</strong></div>
      </div>
      {state.legal.imprisoned&&<p className="memory"><strong>{state.legal.prisonSecurity??'minimum'} security</strong> · {state.legal.sentenceRemaining} year{state.legal.sentenceRemaining===1?'':'s'} remaining{state.legal.paroleEligible?' · parole eligible':''}.</p>}
      {projection.pendingCrimeId&&<p className="memory"><strong>Pending:</strong> {projection.pendingCrime?.name??projection.pendingCrimeId}</p>}
    </section>
    <p className="muted">The Courthouse only projects existing legal state. Prison activities and appeals remain with the correctional system.</p>
  </div>;
}

function LegalHistory({state}:{state:GameState}){
  const projection=locationSceneLegalProjection(state);
  return <section className="action-card">
    <div className="section-heading"><div><p className="eyebrow">Legal record</p><h3>Recorded incidents</h3></div><strong>{projection.history.length}</strong></div>
    <div className="sheet-stat-grid"><div><small>Convictions</small><strong>{projection.convictions}</strong></div><div><small>Total records</small><strong>{projection.history.length}</strong></div></div>
    {projection.history.length?<div className="stack">{projection.history.map((entry,index)=><div className="owned-card" key={`${entry.record.crimeId}-${entry.record.age}-${index}`}><div><strong>{entry.crime?.name??entry.record.crimeId}</strong><small>Age {entry.record.age} · {entry.record.convicted?'convicted':'no conviction recorded'}{entry.record.sentenceYears!==undefined?` · ${entry.record.sentenceYears} year${entry.record.sentenceYears===1?'':'s'}`:''}</small></div></div>)}</div>:<p className="empty-card">No criminal record is stored for this life.</p>}
    <p className="muted">This is a read-only view of the existing CrimeSystem record. The Courthouse does not fabricate charges, convictions, or sentencing history.</p>
  </section>;
}

export function CourthouseLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneCourthouseActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='legal.case')return <LegalCase state={state} onResult={onResult}/>;
  if(actionId==='legal.status')return <LegalStatus state={state}/>;
  return <LegalHistory state={state}/>;
}
