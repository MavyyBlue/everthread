import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { BottomSheet } from '../components/BottomSheet';
import { PeopleWorkspace } from '../components/PeopleWorkspace';
import { gameEngine } from '../stores/gameStore';
import { actionAllowed } from '../core/actionEconomy';
import { canReportCoworker, workplaceRoleForNpc } from '../systems/WorkplaceSystem';
import { npcLifeSummary } from '../systems/NpcLifeSystem';
import { canAskOutNpc, canHookUpWithNpc, canReconcileWithNpc } from '../systems/RelationshipSystem';
import { npcCareerProjection } from '../systems/CareerIdentitySystem';
import { formatMoney } from '../core/format';

export function PeopleScreen({state,onResult}:{state:GameState;onResult:(r:EngineResult)=>void}){
  const[selectedNpcId,setSelectedNpcId]=useState<string>();
  const selected=selectedNpcId?state.relationships.find(r=>r.npcId===selectedNpcId):undefined;
  const npc=selected?state.npcs[selected.npcId]:undefined;
  const npcWorlds=npc?state.socialWorlds.filter(world=>world.members.some(member=>member.npcId===npc.id)):[];
  const currentWorkRole=npc?workplaceRoleForNpc(state,npc.id):undefined;
  const lifeSummary=npc?npcLifeSummary(npc):undefined;
  const careerProjection=npc?npcCareerProjection(state,npc):undefined;
  const partner=state.relationships.find(r=>['partner','fiance','spouse'].includes(r.type));
  const expecting=state.familyPlanning.pregnancy;
  const canTryChild=actionAllowed(state,{policy:'family.child_attempt'});
  const canAdopt=actionAllowed(state,{policy:'family.adoption'});
  const newbornPresent=state.relationships.some(r=>r.type==='child'&&state.npcs[r.npcId]?.alive&&state.npcs[r.npcId]?.age===0);

  const personSheet=<BottomSheet open={!!selected} title={npc?`${npc.firstName} ${npc.lastName}`:'Relationship'} onClose={()=>setSelectedNpcId(undefined)}>{selected&&npc&&<>
    <div className="sheet-stat-grid"><div><small>Relationship</small><strong>{Math.round(selected.score)}</strong></div><div><small>Compatibility</small><strong>{Math.round(selected.compatibility)}</strong></div><div><small>Age</small><strong>{npc.age}</strong></div><div><small>Status</small><strong>{npc.alive?npc.maritalStatus:'deceased'}</strong></div></div>
    <div className="action-grid">{['conversation','compliment','spend_time','gift','apologize','prank','argue','insult'].map(a=><button key={a} disabled={!npc.alive||!actionAllowed(state,[{policy:'social.npc.total',target:npc.id},{policy:'social.npc.action',target:`${npc.id}:${a}`}])} onClick={()=>onResult(gameEngine.interactWithCharacter(npc.id,a))}>{a.replace('_',' ')}</button>)}</div>
    {npc.alive&&<div className="sheet-section"><h3>Relationship</h3><div className="action-grid">{canAskOutNpc(state,npc.id)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'ask_out'))}>Ask out</button>}{canHookUpWithNpc(state,npc.id)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.interactWithCharacter(npc.id,'hook_up'))}>Hook Up</button>}{selected.type==='partner'&&<button disabled={state.character.age<18||npc.age<18||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'propose'))}>Propose</button>}{['partner','fiance'].includes(selected.type)&&<button disabled={state.character.age<18||npc.age<18||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'marry'))}>Marry</button>}{['partner','fiance'].includes(selected.type)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'break_up'))}>Break up</button>}{selected.type==='spouse'&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'divorce'))}>Divorce</button>}{canReconcileWithNpc(state,npc.id)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'reconcile'))}>Reconcile</button>}</div></div>}
    <div className="sheet-section"><h3>Connections</h3><p className="muted">To you: {selected.type.replaceAll('_',' ')}.</p>{npc.partnerId&&state.npcs[npc.partnerId]&&<p className="memory">Partner link: {state.npcs[npc.partnerId]!.firstName} {state.npcs[npc.partnerId]!.lastName}</p>}{npc.parentIds.map(id=>state.npcs[id]).filter(Boolean).map(parent=><p className="memory" key={`parent-${parent!.id}`}>Parent: {parent!.firstName} {parent!.lastName}</p>)}{npc.childIds.map(id=>state.npcs[id]).filter(Boolean).map(child=><p className="memory" key={`child-${child!.id}`}>Child: {child!.firstName} {child!.lastName}</p>)}</div>
    {lifeSummary&&<div className="sheet-section"><h3>Their life</h3><div className="sheet-stat-grid"><div><small>Education</small><strong>{lifeSummary.education}</strong></div><div><small>Career</small><strong>{careerProjection?.career??lifeSummary.career}</strong></div><div><small>Home</small><strong>{lifeSummary.housing}</strong></div><div><small>{careerProjection?.specialCareer?'Est. income':'Income'}</small><strong>{formatMoney(careerProjection?.annualIncome??lifeSummary.annualIncome)}/yr</strong></div></div><p className="memory">Finances: {formatMoney(npc.wealth)} available wealth · {formatMoney(lifeSummary.propertyValue)} property · {formatMoney(lifeSummary.debt)} debt.</p><p className="memory">Health: {lifeSummary.conditions.length?lifeSummary.conditions.join(', '):'no major recorded conditions'}.</p><p className="memory">Public/legal: fame {Math.round(lifeSummary.fame)} · {lifeSummary.followers.toLocaleString()} followers · {lifeSummary.legalIncidents} legal incident{lifeSummary.legalIncidents===1?'':'s'}{lifeSummary.sentenceRemaining?` · ${lifeSummary.sentenceRemaining} year${lifeSummary.sentenceRemaining===1?'':'s'} remaining in custody`:''}.</p>{lifeSummary.moves>0&&<p className="memory">Household: {lifeSummary.moves} move{lifeSummary.moves===1?'':'s'} recorded.</p>}</div>}
    {npcWorlds.length>0&&<div className="sheet-section"><h3>Shared worlds</h3>{npcWorlds.slice().sort((a,b)=>b.startedAge-a.startedAge).map(world=>{const member=world.members.find(item=>item.npcId===npc.id);return <p className="memory" key={world.id}><strong>{world.name}</strong> · {member?.role??'member'} · {world.active?'current':`ages ${world.startedAge}–${world.endedAge??state.character.age}`}</p>})}</div>}
    {currentWorkRole?.world.active&&['coworker','direct_report'].includes(currentWorkRole.role)&&<div className="sheet-section"><h3>Workplace</h3><p className="muted">This person is part of your current workplace at {currentWorkRole.world.name}. Formal concerns are limited and can affect team tension, your manager relationship, and this coworker.</p><button className="danger-soft full-button" disabled={!canReportCoworker(state,npc.id)} onClick={()=>onResult(gameEngine.reportCoworker(npc.id))}>Raise work concern</button></div>}
    <div className="sheet-section"><h3>Memories</h3>{npc.memories.slice(-5).reverse().map(m=><p className="memory" key={m.id}>{m.summary}</p>)}{!npc.memories.length&&<p className="muted">No major memories yet.</p>}</div>
  </>}</BottomSheet>;

  const workspaceControls=<PeopleWorkspaceActions
    state={state}
    onResult={onResult}
    partnerId={partner?.npcId}
    expecting={expecting}
    canTryChild={canTryChild}
    canAdopt={canAdopt}
    newbornPresent={newbornPresent}
  />;

  return <main className="screen people-workspace-screen">
    <PeopleWorkspace state={state} onSelect={setSelectedNpcId} controls={workspaceControls}/>
    {personSheet}
  </main>;
}

function PeopleWorkspaceActions({state,onResult,partnerId,expecting,canTryChild,canAdopt,newbornPresent}:{state:GameState;onResult:(r:EngineResult)=>void;partnerId?:string;expecting:GameState['familyPlanning']['pregnancy'];canTryChild:boolean;canAdopt:boolean;newbornPresent:boolean}){
  return <div className="threadspace-people-actions">
    <div className="threadspace-filter-section">
      <div className="threadspace-panel-heading"><strong>People actions</strong><small>Real gameplay actions</small></div>
      <div className="threadspace-people-action-grid">
        <button disabled={!actionAllowed(state,{policy:'social.meet'})} onClick={()=>onResult(gameEngine.performActivity('meet_date'))}>Meet someone</button>
      </div>
    </div>
    {state.character.age>=18&&<div className="threadspace-filter-section">
      <div className="threadspace-panel-heading"><strong>Build your family</strong><small>{expecting?'Expecting':'Persistent family'}</small></div>
      <p className="threadspace-panel-copy">{expecting?`You are expecting ${expecting.expectedChildren===2?'twins':expecting.expectedChildren===3?'triplets':'a child'} next year.`:'Children age, form relationships, build careers, and can carry the thread into another generation.'}</p>
      <div className="threadspace-people-action-grid">
        <button onClick={()=>onResult(gameEngine.haveChild(partnerId,false))} disabled={!partnerId||!!expecting||!canTryChild||newbornPresent}>{expecting?'Expecting':!canTryChild?'Tried this year':'Try for child'}</button>
        <button onClick={()=>onResult(gameEngine.haveChild(undefined,true))} disabled={!!expecting||!canAdopt||newbornPresent}>{!canAdopt?'Adopted this year':'Adopt'}</button>
      </div>
    </div>}
  </div>;
}
