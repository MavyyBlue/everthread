import { useState } from 'react';
import { actionAllowed } from '../core/actionEconomy';
import { formatMoney } from '../core/format';
import type { LocationSceneBusinessDistrictPanelActionId } from '../data/locationScenes';
import { workplaceRoleTitle } from '../data/workplaceLocations';
import { gameEngine } from '../stores/gameStore';
import { availableJobOffers } from '../systems/CareerSystem';
import { fullTimeJobGate, partTimeJobGate } from '../systems/CommitmentSystem';
import { availablePartTimeJobOffers, partTimeHourLimit, totalPartTimeHours, workplaceForCareerRecord } from '../systems/WorkplaceSystem';
import { currentWorkplaceWorld } from '../systems/WorkplaceSystem';
import { workplaceWorldLocation } from '../systems/WorkingEverthreadSystem';
import type { EngineResult, GameState } from '../types/game';
import { BusinessLocationPanel } from './BusinessLocationPanel';

function WorkDesk({state}:{state:GameState}){
  const current=state.employment.current;const world=currentWorkplaceWorld(state);const location=world?workplaceWorldLocation(world,state):undefined;
  if(!current)return <div className="location-scene__business-district-panel">
    <div className="empty-card">You do not currently have a full-time ordinary job. The Employment Office can show qualified listings.</div>
    {state.employment.retired&&<p className="muted">Your ordinary working-life retirement remains recorded by the existing CareerSystem.</p>}
  </div>;
  const displayTitle=workplaceRoleTitle(current.jobId,current.title,location?.anchorPlaceId);
  return <div className="location-scene__business-district-panel">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Current role</p><h3>{displayTitle}</h3></div><strong>{formatMoney(current.salary)}/yr</strong></div>
      <p>{current.company}{location?` · ${location.locationLabel}`:''}</p>
      <div className="sheet-stat-grid"><div><small>Performance</small><strong>{Math.round(current.performance)}</strong></div><div><small>Level</small><strong>{current.level}</strong></div><div><small>Stress</small><strong>{Math.round(state.character.secondary.stress)}</strong></div><div><small>Workplace</small><strong>{location?.anchorPlaceLabel??location?.districtLabel??'External'}</strong></div></div>
      {location?.anchorPlaceId?<p className="muted">Loomworks is your employment hub. Workplace activity happens at {location.anchorPlaceLabel??location.locationLabel}, where this job is physically based.</p>:<p className="muted">Loomworks is your employment hub. This role is currently known only to {location?.districtLabel??location?.locationLabel??'its broader work district'}; until a dedicated workplace scene exists, Loomworks does not fabricate one.</p>}
    </section>
  </div>;
}

function JobListings({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[q,setQ]=useState('');const gate=fullTimeJobGate(state);const normalized=q.trim().toLowerCase();
  const offers=gate.allowed?availableJobOffers(state).filter(offer=>`${offer.title} ${offer.job.industry} ${offer.placeLabel??''}`.toLowerCase().includes(normalized)).slice(0,60):[];
  const canStart=gate.allowed&&actionAllowed(state,{policy:'career.job_start'});
  return <div className="location-scene__business-district-panel">
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Employment Office</p><h3>Qualified job listings</h3></div><strong>{offers.length}</strong></div>
      {!gate.allowed?<div className="empty-card">{gate.message}</div>:<><label className="form-field"><span>Search listings</span><input value={q} onChange={event=>setQ(event.target.value)} placeholder="Title, industry, or workplace"/></label>{offers.length?<div className="list-compact">{offers.map(offer=><button key={offer.offerId} disabled={!canStart||!actionAllowed(state,[{policy:'career.application.total'},{policy:'career.application.job',target:offer.offerId}])} onClick={()=>onResult(gameEngine.applyForJob(offer.job.id,offer.placeId))}><span><strong>{offer.title}</strong><small>{offer.placeLabel?`${offer.placeLabel} · `:''}{offer.job.industry} · {formatMoney(offer.job.salaryRange[0])}–{formatMoney(offer.job.salaryRange[1])}</small></span><b>Apply</b></button>)}</div>:<div className="empty-card">No currently qualified listings match this search.</div>}</>}
      <p className="muted">Loomworks handles applications. Successful hires keep CareerSystem qualifications, interview RNG, legal-history effects, and job-start limits, then their persistent workplace lives at the listed Everthread location.</p>
    </section>
  </div>;
}

function PartTimeWork({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const gate=partTimeJobGate(state);const offers=gate.allowed?availablePartTimeJobOffers(state):[];const hours=totalPartTimeHours(state),limit=partTimeHourLimit(state);
  return <div className="location-scene__business-district-panel">
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Employment Office</p><h3>Part-time work</h3></div><strong>{hours}/{limit} hrs</strong></div>
      {(state.employment.partTimeJobs??[]).map(record=>{const world=workplaceForCareerRecord(state,record,'part_time');const location=world?workplaceWorldLocation(world,state):undefined;const title=workplaceRoleTitle(record.jobId,record.title,location?.anchorPlaceId);return <article className="school-group-card joined" key={`${record.jobId}-${record.startAge}`}><div><strong>{title}</strong><small>{record.company} · {record.hoursPerWeek} hrs/week · {formatMoney(record.salary)}/year</small>{location&&<small>Based at {location.anchorPlaceLabel??location.locationLabel}</small>}</div><div className="school-group-actions"><button className="secondary-button" onClick={()=>onResult(gameEngine.quitPartTimeJob(record.jobId))}>Quit</button></div></article>;})}
      {!gate.allowed&&<div className="empty-card">{gate.message}{(state.employment.partTimeJobs??[]).length?' Existing part-time jobs stay recorded until you leave them.':''}</div>}
      {gate.allowed&&offers.slice(0,18).map(offer=>{const canStart=(state.employment.partTimeJobs??[]).length<3&&hours+10<=limit&&actionAllowed(state,[{policy:'career.part_time.start'},{policy:'career.part_time.job',target:offer.offerId}]);return <article className="school-group-card" key={offer.offerId}><div><strong>{offer.title}</strong><small>{offer.placeLabel?`${offer.placeLabel} · `:''}{offer.job.industry} · 10 hrs/week · about {formatMoney(offer.job.hourlyRate*10*52)}/year before local wage scaling</small></div><div className="school-group-actions"><button disabled={!canStart} onClick={()=>onResult(gameEngine.startPartTimeJob(offer.job.id,10,offer.placeId))}>Apply</button></div></article>;})}
      {gate.allowed&&!offers.length&&!(state.employment.partTimeJobs??[]).length&&<div className="empty-card">No part-time listing is age-appropriate right now.</div>}
      <p className="muted">Applications happen here; each accepted shift keeps its own persistent workplace, manager, coworkers, pay, and history at the listed location.</p>
    </section>
  </div>;
}

export function BusinessDistrictLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneBusinessDistrictPanelActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='work.role')return <WorkDesk state={state}/>;
  if(actionId==='work.jobs')return <JobListings state={state} onResult={onResult}/>;
  if(actionId==='work.parttime')return <PartTimeWork state={state} onResult={onResult}/>;
  return <BusinessLocationPanel state={state} actionId={actionId} onResult={onResult}/>;
}
