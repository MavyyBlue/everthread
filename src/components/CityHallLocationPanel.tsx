import type { LocationSceneCityHallPanelActionId } from '../data/locationScenes';
import { locationScenePoliticsProjection } from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';
import { BusinessLocationPanel } from './BusinessLocationPanel';

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

export function CityHallLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneCityHallPanelActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='politics.record')return <PoliticsRecord state={state}/>;
  return <BusinessLocationPanel state={state} actionId={actionId} onResult={onResult}/>;
}
