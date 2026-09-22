import { formatMoney } from '../core/format';
import type { LocationSceneHospitalActionId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import { locationSceneHospitalProjection, type LocationSceneHospitalTreatmentKind } from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';

function unavailable(reason:string):EngineResult{return{success:false,messages:[{text:reason}]};}
function humanize(value:string){return value.replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase());}
function costLabel(cost:number){return cost>0?formatMoney(cost):'Guardian supported';}

function HealthStatus({state}:{state:GameState}){
  const projection=locationSceneHospitalProjection(state);
  return <div className="stack">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Current health</p><h3>Your health overview</h3></div><strong>{Math.round(projection.health)}</strong></div>
      <div className="sheet-stat-grid">
        <div><small>Health</small><strong>{Math.round(projection.health)}</strong></div>
        <div><small>Wellness</small><strong>{Math.round(projection.wellness)}</strong></div>
        <div><small>Fitness</small><strong>{Math.round(projection.fitness)}</strong></div>
        <div><small>Stress</small><strong>{Math.round(projection.stress)}</strong></div>
      </div>
    </section>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Care record</p><h3>Active needs</h3></div><strong>{projection.conditions.length+projection.addictions.length}</strong></div>
      <div className="sheet-stat-grid">
        <div><small>Conditions</small><strong>{projection.conditions.length}</strong></div>
        <div><small>Recovery tracks</small><strong>{projection.addictions.length}</strong></div>
      </div>
      {!projection.conditions.length&&!projection.addictions.length&&<p className="empty-card">No active conditions or addiction-recovery records are stored for this life.</p>}
    </section>
    <p className="muted">This is a read-only view of existing Everthread health state. Opening the Hospital does not create conditions, patients, appointments, or medical records.</p>
  </div>;
}

function ConditionsAndTreatment({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneHospitalProjection(state);
  const commit=(conditionId:string,kind:LocationSceneHospitalTreatmentKind)=>{
    const latest=locationSceneHospitalProjection(gameEngine.getState());
    const entry=latest.conditions.find(item=>item.condition.id===conditionId);const gate=entry?.[kind];
    if(!gate?.available){onResult(unavailable(gate?.reason??'That condition is no longer available for treatment.'));return;}
    onResult(gameEngine.treat(conditionId,kind));
  };
  if(!projection.conditions.length)return <div className="stack"><p className="empty-card">You have no active health conditions requiring treatment right now.</p><p className="muted">The Hospital does not generate a condition merely because you opened this screen.</p></div>;
  return <div className="stack">
    {projection.conditions.map(entry=>{
      const {condition,definition,general,specialist}=entry;
      return <section className="action-card" key={condition.id}>
        <div className="section-heading"><div><p className="eyebrow">{definition?.category.replaceAll('_',' ')??'Health condition'}</p><h3>{condition.name}</h3></div><strong>{Math.round(condition.severity)}</strong></div>
        <div className="sheet-stat-grid"><div><small>Severity</small><strong>{Math.round(condition.severity)}</strong></div><div><small>Course</small><strong>{condition.chronic?'Chronic':'Acute'}</strong></div><div><small>Treated</small><strong>{condition.treated?'Yes':'No'}</strong></div><div><small>Diagnosed</small><strong>Age {condition.diagnosedAge}</strong></div></div>
        <div className="button-row">
          <button disabled={!general.available} onClick={()=>commit(condition.id,'general')}>General care · {costLabel(general.cost)}</button>
          <button disabled={!specialist.available} onClick={()=>commit(condition.id,'specialist')}>Specialist · {costLabel(specialist.cost)}</button>
        </div>
        {!general.available&&general.reason&&<p className="muted">General care: {general.reason}</p>}
        {!specialist.available&&specialist.reason&&specialist.reason!==general.reason&&<p className="muted">Specialist: {specialist.reason}</p>}
      </section>;
    })}
    <p className="muted">Treatment outcomes, cash effects, action use, and gameplay RNG remain owned by the existing HealthSystem.</p>
  </div>;
}

function Therapy({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneHospitalProjection(state);const therapy=projection.therapy;
  const commit=()=>{
    const latest=locationSceneHospitalProjection(gameEngine.getState()).therapy;
    if(!latest.available){onResult(unavailable(latest.reason??'Therapy is not currently available.'));return;}
    onResult(gameEngine.therapy());
  };
  return <div className="stack">
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Support rooms</p><h3>Therapy session</h3></div><strong>{costLabel(therapy.cost)}</strong></div>
      <div className="sheet-stat-grid"><div><small>Current stress</small><strong>{Math.round(projection.stress)}</strong></div><div><small>Wellness</small><strong>{Math.round(projection.wellness)}</strong></div></div>
      {!therapy.available&&therapy.reason&&<p className="warning-card">{therapy.reason}</p>}
      <button className="full-button" disabled={!therapy.available} onClick={commit}>Attend therapy</button>
    </section>
    <p className="muted">Therapy uses Everthread's existing stress-recovery rules and wellness action economy. This is fictional gameplay, not medical guidance.</p>
  </div>;
}

function RecoverySupport({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneHospitalProjection(state);
  const commit=(kind:string)=>{
    const latest=locationSceneHospitalProjection(gameEngine.getState()).addictions.find(item=>item.addiction.kind===kind);
    if(!latest?.rehab.available){onResult(unavailable(latest?.rehab.reason??'That recovery record is no longer available for rehabilitation.'));return;}
    onResult(gameEngine.rehab(kind));
  };
  if(!projection.addictions.length)return <div className="stack"><p className="empty-card">There is no active addiction-recovery record for this life.</p><p className="muted">The Hospital does not create an addiction or recovery need merely because you opened Support rooms.</p></div>;
  return <div className="stack">
    {projection.addictions.map(entry=><section className="action-card" key={entry.addiction.kind}>
      <div className="section-heading"><div><p className="eyebrow">Recovery support</p><h3>{humanize(entry.addiction.kind)}</h3></div><strong>{Math.round(entry.addiction.severity)}</strong></div>
      <div className="sheet-stat-grid"><div><small>Severity</small><strong>{Math.round(entry.addiction.severity)}</strong></div><div><small>Years tracked</small><strong>{entry.addiction.years}</strong></div><div><small>Status</small><strong>{entry.addiction.recovering?'Recovering':'Active'}</strong></div><div><small>Rehab cost</small><strong>{formatMoney(entry.rehab.cost)}</strong></div></div>
      {!entry.rehab.available&&entry.rehab.reason&&<p className="warning-card">{entry.rehab.reason}</p>}
      <button className="full-button" disabled={!entry.rehab.available} onClick={()=>commit(entry.addiction.kind)}>Enter rehabilitation</button>
    </section>)}
    <p className="muted">Recovery progression remains part of the existing HealthSystem and advances through the established yearly simulation.</p>
  </div>;
}

export function HospitalLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneHospitalActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='health.status')return <HealthStatus state={state}/>;
  if(actionId==='health.conditions')return <ConditionsAndTreatment state={state} onResult={onResult}/>;
  if(actionId==='health.therapy')return <Therapy state={state} onResult={onResult}/>;
  return <RecoverySupport state={state} onResult={onResult}/>;
}
