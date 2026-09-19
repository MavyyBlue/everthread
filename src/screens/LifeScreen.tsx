import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { Avatar } from '../components/Avatar';
import { StatBar } from '../components/StatBar';
import { Timeline } from '../components/Timeline';
import { gameEngine } from '../stores/gameStore';
import { netWorth } from '../systems/FinanceSystem';
import { playerCareerLabel } from '../systems/CareerIdentitySystem';
import { exactMoney, formatMoney } from '../core/format';
import { creditAvailable } from '../systems/CreditSystem';
import { CreditBankingPanel } from '../components/CreditBankingPanel';
import { InstitutionRouteBanner } from '../components/InstitutionRouteBanner';
import type { InstitutionRouteRequest } from '../core/institutionRouting';
import { activeWorldConditionCards } from '../systems/WorldConditionSystem';
import { EverthreadIcon } from '../components/EverthreadIcon';
import './LifeScreen.css';

export function LifeScreen({state,onResult,routeRequest,onReturnToMap,onOpenProfile}:{state:GameState;onResult:(r:EngineResult)=>void;routeRequest?:InstitutionRouteRequest;onReturnToMap?:()=>void;onOpenProfile:()=>void}){
  const routed=routeRequest?.resolved.tab==='life'?routeRequest:undefined;
  const bankingView=routed?.resolved.tab==='life'?routed.resolved.bankingView:undefined;
  const[bankingOpen,setBankingOpen]=useState(Boolean(routed));
  const availableCredit=creditAvailable(state);
  const netWorthValue=netWorth(state);
  const careerLabel=playerCareerLabel(state);
  const worldConditions=activeWorldConditionCards(state);
  return <main className="screen life-screen life-screen--journal">
    <InstitutionRouteBanner request={routed} onBackToMap={onReturnToMap}/>
    <section className="life-overview" aria-label="Your life at a glance">
      <button className="life-profile-link" onClick={onOpenProfile} aria-label={`Open profile for ${state.character.firstName} ${state.character.lastName}`}>
        <Avatar character={state.character} size={52}/>
        <span className="life-profile-copy"><span className="eyebrow">Generation {state.legacy.generation}</span><strong>{state.character.firstName} {state.character.lastName}</strong><span>Age {state.character.age} · {state.character.city}</span></span>
        <span className="life-profile-affordance">Profile <EverthreadIcon name="chevron" size={16}/></span>
      </button>
      <div className="life-vitals" aria-label="Primary stats"><StatBar label="Health" value={state.character.stats.health}/><StatBar label="Happiness" value={state.character.stats.happiness}/><StatBar label="Intelligence" value={state.character.stats.intelligence}/><StatBar label="Appearance" value={state.character.stats.appearance}/></div>
      <details className="life-disclosure life-finances">
        <summary><span>Life & finances</span><span className="life-disclosure-meta" title={exactMoney(state.finances.cash)}>Cash {formatMoney(state.finances.cash)}</span></summary>
        <div className="life-disclosure-body">
          <div className="quick-facts"><div title={exactMoney(netWorthValue)}><small>Net worth</small><strong>{formatMoney(netWorthValue)}</strong></div><div><small>Career</small><strong>{careerLabel}</strong></div><div><small>Fame</small><strong>{Math.round(state.fame.fame)}</strong></div><div title={exactMoney(availableCredit)}><small>Credit available</small><strong>{formatMoney(availableCredit)}</strong></div></div>
          <button className="credit-banking-button" onClick={()=>setBankingOpen(true)}>Credit & Banking <EverthreadIcon name="chevron" size={16}/></button>
        </div>
      </details>
    </section>
    <details className="life-disclosure life-worlds">
      <summary><span>Persistent Worlds</span><span className="life-disclosure-meta">{worldConditions.length?`${worldConditions.length} active`:'Stable'}</span></summary>
      <section className="life-disclosure-body" aria-label="Persistent world conditions">{worldConditions.length?<div className="world-condition-list">{worldConditions.map(condition=><article className="world-condition-item" key={condition.id}><div className="world-condition-heading"><div><strong>{condition.title}</strong><small>{condition.scopeLabel} · {condition.intensityLabel}</small></div><b>{condition.remainingYears}y</b></div><p>{condition.description}</p><small>{condition.effectSummary.join(' ')}</small></article>)}</div>:<p className="world-condition-stable">No major multi-year conditions are affecting your world.</p>}</section>
    </details>
    <section className="timeline-card life-journal" aria-labelledby="life-timeline-heading"><div className="section-heading"><div><p className="eyebrow">One life. Every thread.</p><h1 id="life-timeline-heading">Your Life Timeline</h1></div><span>{state.timeline.length} entries</span></div><Timeline entries={state.timeline}/></section>
    {bankingOpen&&<CreditBankingPanel state={state} onResult={onResult} onClose={()=>setBankingOpen(false)} initialView={bankingView}/>}
    <div className="age-up-dock"><button className="age-up" disabled={!!state.pendingEvent||!state.character.alive||!!state.flags.ageUpLocked} onClick={()=>{if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(18);onResult(gameEngine.ageUp());}} aria-label={`Age up from ${state.character.age} to ${state.character.age+1}`}><span className="age-up-plus"><EverthreadIcon name={state.pendingEvent||state.flags.ageUpLocked||!state.character.alive?"lock":"plus"} size={24}/></span><span><strong>Age Up</strong><small>{state.pendingEvent?'Resolve your event first':state.character.alive?'Move life forward one year':'Life complete'}</small></span></button></div>
  </main>;
}
