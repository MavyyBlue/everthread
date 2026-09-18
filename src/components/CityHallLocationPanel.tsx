import { useState } from 'react';
import { actionAllowed } from '../core/actionEconomy';
import { exactMoney, formatMoney } from '../core/format';
import { businessIndustries } from '../data/assets';
import type { LocationSceneCityHallPanelActionId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import { locationScenePoliticsProjection } from '../systems/LocationSceneSystem';
import { businessWorkLocation } from '../systems/WorkingEverthreadSystem';
import type { EngineResult, GameState } from '../types/game';

function personName(state:GameState,id?:string){
  const npc=id?state.npcs[id]:undefined;
  return npc?`${npc.firstName} ${npc.lastName}`:undefined;
}

function PoliticsRecord({state}:{state:GameState}){
  const projection=locationScenePoliticsProjection(state),view=projection.view;
  const chief=personName(state,view?.chiefStaffNpcId),opponent=personName(state,view?.opponentNpcId);
  return <div className="location-scene__cityhall-panel">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Public office</p><h3>{projection.officeLabel}</h3></div><strong>{projection.office>0?Math.round(projection.approval):'—'}</strong></div>
      <p>{projection.office>0?`Current status: ${projection.status}. Approval remains owned by the existing Politics career system.`:'You do not currently hold elected office. Past political chapters remain available below when they exist.'}</p>
      <div className="sheet-stat-grid">
        <div><small>Approval</small><strong>{projection.office>0?Math.round(projection.approval):'—'}</strong></div>
        <div><small>Election wins</small><strong>{projection.electionsWon}</strong></div>
        <div><small>Office chapters</small><strong>{projection.history.length}</strong></div>
        <div><small>Current world</small><strong>{view?'Active':'—'}</strong></div>
      </div>
    </section>
    {view&&<section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Current political world</p><h3>{view.worldName}</h3></div><span>{Math.round(view.politicalStanding)} standing</span></div>
      <div className="sheet-stat-grid"><div><small>Staff</small><strong>{Math.round(view.staffSupport)}</strong></div><div><small>Coalition</small><strong>{Math.round(view.coalitionSupport)}</strong></div><div><small>Opposition</small><strong>{Math.round(view.oppositionPressure)}</strong></div><div><small>Prestige</small><strong>{Math.round(view.prestige)}</strong></div></div>
      <p className="muted">{chief?`Chief of staff: ${chief}`:'No current chief of staff'}{opponent?` · Opposition: ${opponent}`:''}</p>
    </section>}
    {projection.history.length>0&&<section className="action-card"><div className="section-heading"><div><p className="eyebrow">Public-life history</p><h3>Office chapters</h3></div><strong>{projection.history.length}</strong></div><div className="stack">{projection.history.slice(0,8).map(world=><div className="owned-card" key={world.id}><span><strong>{world.name}</strong><small>Age {world.startedAge}{world.endedAge!==undefined?`–${world.endedAge}`:' · current'} · {world.active?'active':'historical'}</small></span></div>)}</div></section>}
    <p className="muted">City Hall reads the existing Politics career world and relationship history. It does not create a second office, approval, election, or civic-reputation ledger.</p>
  </div>;
}

function BusinessStart({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[bizName,setBizName]=useState('');const[bizIndustry,setBizIndustry]=useState(businessIndustries[0]!.id);
  const selected=businessIndustries.find(industry=>industry.id===bizIndustry)??businessIndustries[0]!;
  const canAct=state.character.age>=18&&actionAllowed(state,{policy:'business.start'});
  return <section className="action-card">
    <div className="section-heading"><div><p className="eyebrow">Company services</p><h3>Start a company</h3></div><strong>{formatMoney(selected.startupCapital)}</strong></div>
    <p>Formation still uses the existing BusinessSystem: startup capital comes from authoritative cash, the company enters the one business ledger, and later annual results stay with that owner.</p>
    <label className="form-field"><span>Name</span><input value={bizName} onChange={event=>setBizName(event.target.value)} placeholder="Company name"/></label>
    <label className="form-field"><span>Industry</span><select value={bizIndustry} onChange={event=>setBizIndustry(event.target.value)}>{businessIndustries.map(industry=><option key={industry.id} value={industry.id}>{industry.name} · {formatMoney(industry.startupCapital)}</option>)}</select></label>
    <div className="sheet-stat-grid"><div><small>Startup capital</small><strong>{formatMoney(selected.startupCapital)}</strong></div><div><small>Your cash</small><strong>{formatMoney(state.finances.cash)}</strong></div></div>
    <button className="full-button" disabled={!canAct} onClick={()=>onResult(gameEngine.startBusiness(bizIndustry,bizName))}>Found company</button>
    {!canAct&&<p className="muted">Company formation requires adulthood and the existing annual business-start action allowance.</p>}
  </section>;
}

function BusinessManagement({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  if(!state.businesses.length)return <div className="empty-card">You do not own a company yet. Use Start a company at this desk when you are ready.</div>;
  return <div className="location-scene__cityhall-panel">
    {state.businesses.map(business=>{const work=businessWorkLocation(state,business);return <section className="business-card" key={business.id}>
      <div className="section-heading"><div><p className="eyebrow">{business.bankrupt?'Closed':'Operating'}</p><h3>{business.name}</h3></div><strong title={exactMoney(business.valuation)}>{formatMoney(business.valuation)}</strong></div>
      <p className="muted">{business.origin==='inherited'?'Inherited family company · ':'Based in '}{work.locationLabel}.</p>
      <div className="finance-grid"><div title={exactMoney(business.revenue)}><small>Revenue</small><strong>{formatMoney(business.revenue)}</strong></div><div title={exactMoney(business.profit)}><small>Profit</small><strong>{formatMoney(business.profit)}</strong></div><div><small>Employees</small><strong>{business.employees}</strong></div><div><small>Reputation</small><strong>{Math.round(business.reputation)}</strong></div></div>
      {!business.bankrupt&&<div className="action-grid"><button disabled={!actionAllowed(state,{policy:'business.product',target:business.id})} onClick={()=>onResult(gameEngine.addBusinessProduct(business.id))}>Launch product</button><button onClick={()=>onResult(gameEngine.tuneBusiness(business.id,'marketingBudget',Math.max(1000,business.marketingBudget*1.25)))}>Raise marketing</button><button onClick={()=>onResult(gameEngine.tuneBusiness(business.id,'compensationIndex',Math.min(1.8,business.compensationIndex+.1)))}>Raise pay</button></div>}
    </section>;})}
    <p className="muted">These cards are a focused City Hall projection of the same business records used by Assets. Product launches and tuning still mutate only BusinessSystem-owned companies.</p>
  </div>;
}

export function CityHallLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneCityHallPanelActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='politics.record')return <PoliticsRecord state={state}/>;
  if(actionId==='business.start')return <BusinessStart state={state} onResult={onResult}/>;
  return <BusinessManagement state={state} onResult={onResult}/>;
}
