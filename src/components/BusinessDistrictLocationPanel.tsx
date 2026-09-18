import { useState } from 'react';
import { actionAllowed } from '../core/actionEconomy';
import { formatMoney } from '../core/format';
import type { LocationSceneBusinessDistrictPanelActionId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import { availableJobs } from '../systems/CareerSystem';
import { fullTimeJobGate, partTimeJobGate } from '../systems/CommitmentSystem';
import { locationSceneBusinessDistrictProjection } from '../systems/LocationSceneSystem';
import { availablePartTimeJobs, partTimeHourLimit, totalPartTimeHours, workplaceForCareerRecord } from '../systems/WorkplaceSystem';
import { workplaceWorldLocation } from '../systems/WorkingEverthreadSystem';
import type { EngineResult, GameState } from '../types/game';
import { BusinessLocationPanel } from './BusinessLocationPanel';

function WorkDesk({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneBusinessDistrictProjection(state);const current=state.employment.current;const world=projection.workplace;
  if(!current)return <div className="location-scene__business-district-panel">
    <div className="empty-card">You do not currently have a full-time ordinary job. The Employment Office can show qualified listings without inventing a Loomworks workplace.</div>
    {state.employment.retired&&<p className="muted">Your ordinary working-life retirement remains recorded by the existing CareerSystem.</p>}
  </div>;
  const local=projection.localWorkplace;const location=projection.workplaceLocation;
  return <div className="location-scene__business-district-panel">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Current role</p><h3>{current.title}</h3></div><strong>{formatMoney(current.salary)}/yr</strong></div>
      <p>{current.company}{location?` · ${location.locationLabel}`:''}</p>
      <div className="sheet-stat-grid"><div><small>Performance</small><strong>{Math.round(current.performance)}</strong></div><div><small>Level</small><strong>{current.level}</strong></div><div><small>Stress</small><strong>{Math.round(state.character.secondary.stress)}</strong></div><div><small>Loomworks</small><strong>{local?'Local':'Elsewhere'}</strong></div></div>
      {local?<div className="button-row"><button disabled={!actionAllowed(state,{policy:'career.work_harder'})} onClick={()=>onResult(gameEngine.workHarder())}>Work harder</button><button disabled={!actionAllowed(state,{policy:'career.raise'})} onClick={()=>onResult(gameEngine.askForRaise())}>Ask raise</button><button className="danger-soft" onClick={()=>onResult(gameEngine.resign())}>Resign</button></div>:<p className="muted">This role is physically based somewhere else in Everthread. Loomworks shows the record but does not teleport workplace actions here.</p>}
      {local&&state.character.age>=50&&!state.employment.retired&&<button className="secondary-button full-button" onClick={()=>onResult(gameEngine.retire())}>Retire from working life</button>}
    </section>
    {local&&world?.workplace&&<section className="action-card"><div className="section-heading"><div><p className="eyebrow">Persistent workplace</p><h3>{world.name}</h3></div><span>{world.workplace.department}</span></div><div className="sheet-stat-grid"><div><small>Morale</small><strong>{Math.round(world.workplace.morale)}</strong></div><div><small>Culture</small><strong>{Math.round(world.workplace.culture)}</strong></div><div><small>Tension</small><strong>{Math.round(world.workplace.tension)}</strong></div><div><small>Reputation</small><strong>{Math.round(world.workplace.reputation)}</strong></div></div><p className="muted">People, manager relationships, and workplace history remain owned by the existing persistent workplace world.</p></section>}
  </div>;
}

function JobListings({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[q,setQ]=useState('');const gate=fullTimeJobGate(state);const jobs=gate.allowed?availableJobs(state).filter(job=>`${job.title} ${job.industry}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0,40):[];
  const canStart=gate.allowed&&actionAllowed(state,{policy:'career.job_start'});
  return <div className="location-scene__business-district-panel">
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Employment Office</p><h3>Qualified job listings</h3></div><strong>{jobs.length}</strong></div>
      {!gate.allowed?<div className="empty-card">{gate.message}</div>:<><label className="form-field"><span>Search listings</span><input value={q} onChange={event=>setQ(event.target.value)} placeholder="Title or industry"/></label>{jobs.length?<div className="list-compact">{jobs.map(job=><button key={job.id} disabled={!canStart||!actionAllowed(state,[{policy:'career.application.total'},{policy:'career.application.job',target:job.id}])} onClick={()=>onResult(gameEngine.applyForJob(job.id))}><span><strong>{job.title}</strong><small>{job.industry} · {formatMoney(job.salaryRange[0])}–{formatMoney(job.salaryRange[1])}</small></span><b>Apply</b></button>)}</div>:<div className="empty-card">No currently qualified listings match this search.</div>}</>}
      <p className="muted">Applications still use CareerSystem qualifications, interview RNG, legal-history effects, job-start limits, and Working Everthread workplace anchoring.</p>
    </section>
  </div>;
}

function PartTimeWork({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const gate=partTimeJobGate(state);const options=gate.allowed?availablePartTimeJobs(state):[];const hours=totalPartTimeHours(state),limit=partTimeHourLimit(state);
  return <div className="location-scene__business-district-panel">
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Employment Office</p><h3>Part-time work</h3></div><strong>{hours}/{limit} hrs</strong></div>
      {(state.employment.partTimeJobs??[]).map(record=>{const world=workplaceForCareerRecord(state,record,'part_time');const location=world?workplaceWorldLocation(world):undefined;return <article className="school-group-card joined" key={`${record.jobId}-${record.startAge}`}><div><strong>{record.title}</strong><small>{record.company} · {record.hoursPerWeek} hrs/week · {formatMoney(record.salary)}/year</small>{location&&<small>{location.locationLabel}</small>}</div><div className="school-group-actions"><button className="secondary-button" onClick={()=>onResult(gameEngine.quitPartTimeJob(record.jobId))}>Quit</button></div></article>;})}
      {!gate.allowed&&<div className="empty-card">{gate.message}{(state.employment.partTimeJobs??[]).length?' Existing part-time jobs stay recorded until you leave them.':''}</div>}
      {gate.allowed&&options.slice(0,8).map(job=>{const canStart=(state.employment.partTimeJobs??[]).length<3&&hours+10<=limit&&actionAllowed(state,[{policy:'career.part_time.start'},{policy:'career.part_time.job',target:job.id}]);return <article className="school-group-card" key={job.id}><div><strong>{job.title}</strong><small>{job.industry} · 10 hrs/week · about {formatMoney(job.hourlyRate*10*52)}/year before local wage scaling</small></div><div className="school-group-actions"><button disabled={!canStart} onClick={()=>onResult(gameEngine.startPartTimeJob(job.id,10))}>Apply</button></div></article>;})}
      {gate.allowed&&!options.length&&!(state.employment.partTimeJobs??[]).length&&<div className="empty-card">No part-time listing is age-appropriate right now.</div>}
      <p className="muted">Part-time hour capacity, application RNG, workplace worlds, pay, and history remain owned by the existing Workplace/Career systems.</p>
    </section>
  </div>;
}

export function BusinessDistrictLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneBusinessDistrictPanelActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='work.role')return <WorkDesk state={state} onResult={onResult}/>;
  if(actionId==='work.jobs')return <JobListings state={state} onResult={onResult}/>;
  if(actionId==='work.parttime')return <PartTimeWork state={state} onResult={onResult}/>;
  return <BusinessLocationPanel state={state} actionId={actionId} onResult={onResult}/>;
}
