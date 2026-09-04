import type { EngineResult, GameState } from '../types/game';
import { Avatar } from '../components/Avatar';
import { StatBar } from '../components/StatBar';
import { Timeline } from '../components/Timeline';
import { gameEngine } from '../stores/gameStore';
import { netWorth } from '../systems/FinanceSystem';

export function LifeScreen({state,onResult}:{state:GameState;onResult:(r:EngineResult)=>void}){
  const countryMoney=new Intl.NumberFormat(undefined,{maximumFractionDigits:0}).format(state.finances.cash);
  return <main className="screen life-screen">
    <section className="identity-card">
      <Avatar character={state.character} size={58}/>
      <div><p className="eyebrow">Generation {state.legacy.generation}</p><h1>{state.character.firstName} {state.character.lastName}</h1><p>Age {state.character.age} · {state.character.city}</p></div>
      <div className="money-chip"><small>Cash</small><strong>{countryMoney}</strong></div>
    </section>
    <section className="stats-card" aria-label="Primary stats"><StatBar label="Health" value={state.character.stats.health}/><StatBar label="Happiness" value={state.character.stats.happiness}/><StatBar label="Intelligence" value={state.character.stats.intelligence}/><StatBar label="Appearance" value={state.character.stats.appearance}/></section>
    <section className="quick-facts"><div><small>Net worth</small><strong>{Math.round(netWorth(state)).toLocaleString()}</strong></div><div><small>Career</small><strong>{state.employment.current?.title??(state.character.age<18?'Growing up':'Unemployed')}</strong></div><div><small>Fame</small><strong>{Math.round(state.fame.fame)}</strong></div></section>
    <section className="timeline-card"><div className="section-heading"><div><p className="eyebrow">Your story</p><h2>Life timeline</h2></div><span>{state.timeline.length} entries</span></div><Timeline entries={state.timeline}/></section>
    <div className="age-up-dock"><button className="age-up" disabled={!!state.pendingEvent||!state.character.alive||!!state.flags.ageUpLocked} onClick={()=>{if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(18);onResult(gameEngine.ageUp());}} aria-label={`Age up from ${state.character.age} to ${state.character.age+1}`}><span className="age-up-plus">＋</span><span><strong>Age Up</strong><small>{state.pendingEvent?'Resolve your event first':state.character.alive?'Move life forward one year':'Life complete'}</small></span></button></div>
  </main>;
}
