import { EverthreadIcon } from './EverthreadIcon';
import { ResidenceProjectionCard } from './RealtyLocationPanel';
import { locationSceneResidentialConnections, locationSceneResidentialPlans } from '../systems/LocationSceneSystem';
import { gameEngine } from '../stores/gameStore';
import type { LocationSceneResidentialActionId } from '../data/locationScenes';
import type { EngineResult, GameState } from '../types/game';

function unavailableResult(reason:string):EngineResult{return{success:false,messages:[{text:reason}]};}

function KnownHouseholds({state}:{state:GameState}){
  const connections=locationSceneResidentialConnections(state);
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Neighborhood board</p><h3>People connected here</h3></div><strong>{connections.length}</strong></div>
      <p>These are existing relationships whose current household projects into Threadwell. The district does not generate a separate neighbor list.</p>
      {connections.length?<div className="list-compact">{connections.map(connection=><div className="owned-card" key={connection.npcId}>
        <div><strong>{connection.name}</strong><small>{connection.relationship} · {connection.residenceLabel} · household {connection.householdSize}</small><span>{connection.detail}</span></div>
      </div>)}</div>:<p className="empty-card">No existing relationship currently has a visitable Threadwell household.</p>}
    </section>
    <p className="muted">Household membership, residence, family links, and locality all come from the existing NPC and Residential Life authorities.</p>
  </>;
}

function ResidentialPlans({state,actionId,onResult}:{state:GameState;actionId:LocationSceneResidentialActionId;onResult:(result:EngineResult)=>void}){
  const plans=locationSceneResidentialPlans(state,actionId);
  const run=(npcId:string,planId:string)=>{
    const latest=gameEngine.getState();
    const option=locationSceneResidentialPlans(latest,actionId).find(candidate=>candidate.npcId===npcId&&candidate.planId===planId);
    if(!option?.allowed){onResult(unavailableResult(option?.reason??'That residential plan is no longer available.'));return;}
    onResult(gameEngine.residentialExperience(npcId,planId));
  };
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Residential Life</p><h3>{actionId==='home.visits'?'Available home plans':actionId==='shared.home.hangout'?'Home hangouts':actionId==='shared.home.cook'?'Cook together': 'Sleepovers'}</h3></div><strong>{plans.filter(plan=>plan.allowed).length}</strong></div>
      {plans.length?<div className="list-compact">{plans.map(plan=><button key={`${plan.npcId}:${plan.planId}`} disabled={!plan.allowed} title={!plan.allowed?plan.reason:undefined} onClick={()=>run(plan.npcId,plan.planId)}>
        <span><strong>{plan.name} · {plan.label}</strong><small>{plan.residenceLabel}</small><em>{plan.allowed?plan.description:plan.reason}</em></span><b>{plan.allowed?'Choose':'Unavailable'}</b>
      </button>)}</div>:<p className="empty-card">No existing relationship currently projects a residential plan for this activity.</p>}
    </section>
    <p className="muted">Choosing a plan commits through Residential Life and the shared-experience action economy. Threadwell keeps no separate visit, household, or relationship state.</p>
  </>;
}

export function ResidentialLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneResidentialActionId|'homes.residence';onResult:(result:EngineResult)=>void}){
  if(actionId==='homes.residence')return <ResidenceProjectionCard state={state} contextLabel="Threadwell"/>;
  if(actionId==='home.neighbors')return <KnownHouseholds state={state}/>;
  if(actionId==='home.visits'||actionId==='shared.home.hangout'||actionId==='shared.home.cook'||actionId==='shared.home.sleepover')return <ResidentialPlans state={state} actionId={actionId} onResult={onResult}/>;
  return <p className="empty-card"><EverthreadIcon name="home" size={18}/> This Threadwell residential view is unavailable.</p>;
}
