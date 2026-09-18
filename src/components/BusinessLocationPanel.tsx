import { useState } from 'react';
import { actionAllowed } from '../core/actionEconomy';
import { exactMoney, formatMoney } from '../core/format';
import { businessIndustries } from '../data/assets';
import type { LocationSceneBusinessPanelActionId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import { businessWorkLocation } from '../systems/WorkingEverthreadSystem';
import type { EngineResult, GameState } from '../types/game';

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
  if(!state.businesses.length)return <div className="empty-card">You do not own a company yet. Use Start a company when you are ready.</div>;
  return <div className="location-scene__business-panel">
    {state.businesses.map(business=>{const work=businessWorkLocation(state,business);return <section className="business-card" key={business.id}>
      <div className="section-heading"><div><p className="eyebrow">{business.bankrupt?'Closed':'Operating'}</p><h3>{business.name}</h3></div><strong title={exactMoney(business.valuation)}>{formatMoney(business.valuation)}</strong></div>
      <p className="muted">{business.origin==='inherited'?'Inherited family company · ':'Based in '}{work.locationLabel}.</p>
      <div className="finance-grid"><div title={exactMoney(business.revenue)}><small>Revenue</small><strong>{formatMoney(business.revenue)}</strong></div><div title={exactMoney(business.profit)}><small>Profit</small><strong>{formatMoney(business.profit)}</strong></div><div><small>Employees</small><strong>{business.employees}</strong></div><div><small>Reputation</small><strong>{Math.round(business.reputation)}</strong></div></div>
      {!business.bankrupt&&<div className="action-grid"><button disabled={!actionAllowed(state,{policy:'business.product',target:business.id})} onClick={()=>onResult(gameEngine.addBusinessProduct(business.id))}>Launch product</button><button onClick={()=>onResult(gameEngine.tuneBusiness(business.id,'marketingBudget',Math.max(1000,business.marketingBudget*1.25)))}>Raise marketing</button><button onClick={()=>onResult(gameEngine.tuneBusiness(business.id,'compensationIndex',Math.min(1.8,business.compensationIndex+.1)))}>Raise pay</button></div>}
    </section>;})}
    <p className="muted">These cards project the same business records used by Assets. Product launches and tuning still mutate only BusinessSystem-owned companies.</p>
  </div>;
}

export function BusinessLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneBusinessPanelActionId;onResult:(result:EngineResult)=>void}){
  return actionId==='business.start'?<BusinessStart state={state} onResult={onResult}/>:<BusinessManagement state={state} onResult={onResult}/>;
}
