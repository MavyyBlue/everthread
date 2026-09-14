import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { Avatar } from '../components/Avatar';
import { StatBar } from '../components/StatBar';
import { Timeline } from '../components/Timeline';
import { gameEngine } from '../stores/gameStore';
import { netWorth } from '../systems/FinanceSystem';
import { playerCareerLabel } from '../systems/CareerIdentitySystem';
import { exactMoney, formatMoney } from '../core/format';
import { EVERTHREAD_UI_ICONS } from '../core/actionVfx';
import { creditAvailable } from '../systems/CreditSystem';
import { CreditBankingPanel } from '../components/CreditBankingPanel';
import { activeWorldConditionCards } from '../systems/WorldConditionSystem';

export function LifeScreen({state,onResult}:{state:GameState;onResult:(r:EngineResult)=>void}){
  const[bankingOpen,setBankingOpen]=useState(false);
  const cashLabel=formatMoney(state.finances.cash);
  const availableCredit=creditAvailable(state);
  const netWorthValue=netWorth(state);
  const careerLabel=playerCareerLabel(state);
  const worldConditions=activeWorldConditionCards(state);
  return <main className="screen life-screen">
    <section className="identity-card">
      <Avatar character={state.character} size={58}/>
      <div><p className="eyebrow">Generation {state.legacy.generation}</p><h1>{state.character.firstName} {state.character.lastName}</h1><p>Age {state.character.age} · {state.character.city}</p></div>
      <div className="life-money-summary">
        <div className="money-chip" title={exactMoney(state.finances.cash)}><small>Cash</small><div className="money-chip__value"><img className="money-chip__icon" src={EVERTHREAD_UI_ICONS.cash} alt="" aria-hidden="true"/><strong>{cashLabel}</strong></div></div>
        <div className="money-chip credit-chip" title={exactMoney(availableCredit)}><small>Credit available</small><div className="money-chip__value"><strong>{formatMoney(availableCredit)}</strong></div></div>
        <button className="credit-banking-button" onClick={()=>setBankingOpen(true)}>Credit & Banking <span>›</span></button>
      </div>
    </section>
    <section className="stats-card" aria-label="Primary stats"><StatBar label="Health" value={state.character.stats.health}/><StatBar label="Happiness" value={state.character.stats.happiness}/><StatBar label="Intelligence" value={state.character.stats.intelligence}/><StatBar label="Appearance" value={state.character.stats.appearance}/></section>
    <section className="quick-facts"><div title={exactMoney(netWorthValue)}><small>Net worth</small><strong>{formatMoney(netWorthValue)}</strong></div><div><small>Career</small><strong>{careerLabel}</strong></div><div><small>Fame</small><strong>{Math.round(state.fame.fame)}</strong></div></section>
    <section className="world-conditions-card" aria-label="Persistent world conditions"><div className="section-heading"><div><p className="eyebrow">World around you</p><h2>Persistent conditions</h2></div><span>{worldConditions.length?`${worldConditions.length} active`:'Stable'}</span></div>{worldConditions.length?<div className="world-condition-list">{worldConditions.map(condition=><article className="world-condition-item" key={condition.id}><div className="world-condition-heading"><div><strong>{condition.title}</strong><small>{condition.scopeLabel} · {condition.intensityLabel}</small></div><b>{condition.remainingYears}y</b></div><p>{condition.description}</p><small>{condition.effectSummary.join(' ')}</small></article>)}</div>:<p className="world-condition-stable">No major multi-year condition is currently distorting your local or global environment.</p>}</section>
    <section className="timeline-card"><div className="section-heading"><div><p className="eyebrow">Your story</p><h2>Life timeline</h2></div><span>{state.timeline.length} entries</span></div><Timeline entries={state.timeline}/></section>
    {bankingOpen&&<CreditBankingPanel state={state} onResult={onResult} onClose={()=>setBankingOpen(false)}/>}
    <div className="age-up-dock"><button className="age-up" disabled={!!state.pendingEvent||!state.character.alive||!!state.flags.ageUpLocked} onClick={()=>{if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(18);onResult(gameEngine.ageUp());}} aria-label={`Age up from ${state.character.age} to ${state.character.age+1}`}><span className="age-up-plus">＋</span><span><strong>Age Up</strong><small>{state.pendingEvent?'Resolve your event first':state.character.alive?'Move life forward one year':'Life complete'}</small></span></button></div>
  </main>;
}
