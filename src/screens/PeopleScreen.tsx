import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { SearchField } from '../components/SearchField';
import { BottomSheet } from '../components/BottomSheet';
import { RelationshipTree } from '../components/RelationshipTree';
import { gameEngine } from '../stores/gameStore';
import { actionAllowed } from '../core/actionEconomy';
import { buildPeopleRelationshipGraph, peopleFolderSummaries, type PeopleFolderId } from '../systems/PeopleGraphSystem';

const folderGlyph: Record<PeopleFolderId,string> = {
  player_family:'⌂', relatives:'⌘', friends:'○', romance:'♡', school:'◇', work:'□',
};

export function PeopleScreen({state,onResult}:{state:GameState;onResult:(r:EngineResult)=>void}){
  const[q,setQ]=useState('');
  const[selectedNpcId,setSelectedNpcId]=useState<string>();
  const[folder,setFolder]=useState<PeopleFolderId>();
  const query=q.trim().toLowerCase();
  const rows=state.relationships
    .filter(r=>{const n=state.npcs[r.npcId];return n&&(!query||`${n.firstName} ${n.lastName} ${r.type}`.toLowerCase().includes(query));})
    .sort((a,b)=>b.score-a.score);
  const summaries=peopleFolderSummaries(state);
  const graph=folder?buildPeopleRelationshipGraph(state,folder):undefined;
  const selected=selectedNpcId?state.relationships.find(r=>r.npcId===selectedNpcId):undefined;
  const npc=selected?state.npcs[selected.npcId]:undefined;
  const npcWorlds=npc?state.socialWorlds.filter(world=>world.members.some(member=>member.npcId===npc.id)):[];
  const partner=state.relationships.find(r=>['partner','fiance','spouse'].includes(r.type));
  const expecting=state.familyPlanning.pregnancy;
  const canTryChild=actionAllowed(state,{policy:'family.child_attempt'});
  const canAdopt=actionAllowed(state,{policy:'family.adoption'});
  const newbornPresent=state.relationships.some(r=>r.type==='child'&&state.npcs[r.npcId]?.alive&&state.npcs[r.npcId]?.age===0);

  const personSheet=<BottomSheet open={!!selected} title={npc?`${npc.firstName} ${npc.lastName}`:'Relationship'} onClose={()=>setSelectedNpcId(undefined)}>{selected&&npc&&<>
    <div className="sheet-stat-grid"><div><small>Relationship</small><strong>{Math.round(selected.score)}</strong></div><div><small>Compatibility</small><strong>{Math.round(selected.compatibility)}</strong></div><div><small>Age</small><strong>{npc.age}</strong></div><div><small>Status</small><strong>{npc.alive?npc.maritalStatus:'deceased'}</strong></div></div>
    <div className="action-grid">{['conversation','compliment','spend_time','gift','apologize','prank','argue','insult'].map(a=><button key={a} disabled={!npc.alive||!actionAllowed(state,[{policy:'social.npc.total',target:npc.id},{policy:'social.npc.action',target:`${npc.id}:${a}`}])} onClick={()=>onResult(gameEngine.interactWithCharacter(npc.id,a))}>{a.replace('_',' ')}</button>)}</div>
    {npc.alive&&<div className="sheet-section"><h3>Relationship</h3><div className="action-grid">{selected.type==='friend'&&<button disabled={state.character.age<14||npc.age<14||(state.character.age<18?npc.age>=18:npc.age<18)||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'ask_out'))}>Ask out</button>}{selected.type==='partner'&&<button disabled={state.character.age<18||npc.age<18||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'propose'))}>Propose</button>}{['partner','fiance'].includes(selected.type)&&<button disabled={state.character.age<18||npc.age<18||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'marry'))}>Marry</button>}{['partner','fiance'].includes(selected.type)&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'break_up'))}>Break up</button>}{selected.type==='spouse'&&<button disabled={!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'divorce'))}>Divorce</button>}{selected.type==='ex'&&<button disabled={state.character.age<14||npc.age<14||(state.character.age<18?npc.age>=18:npc.age<18)||!actionAllowed(state,{policy:'relationship.milestone',target:npc.id})} onClick={()=>onResult(gameEngine.relationshipAction(npc.id,'reconcile'))}>Reconcile</button>}</div></div>}
    <div className="sheet-section"><h3>Connections</h3><p className="muted">To you: {selected.type.replaceAll('_',' ')}.</p>{npc.partnerId&&state.npcs[npc.partnerId]&&<p className="memory">Partner link: {state.npcs[npc.partnerId]!.firstName} {state.npcs[npc.partnerId]!.lastName}</p>}{npc.parentIds.map(id=>state.npcs[id]).filter(Boolean).map(parent=><p className="memory" key={`parent-${parent!.id}`}>Parent: {parent!.firstName} {parent!.lastName}</p>)}{npc.childIds.map(id=>state.npcs[id]).filter(Boolean).map(child=><p className="memory" key={`child-${child!.id}`}>Child: {child!.firstName} {child!.lastName}</p>)}</div>
    {npcWorlds.length>0&&<div className="sheet-section"><h3>Shared worlds</h3>{npcWorlds.slice().sort((a,b)=>b.startedAge-a.startedAge).map(world=>{const member=world.members.find(item=>item.npcId===npc.id);return <p className="memory" key={world.id}><strong>{world.name}</strong> · {member?.role??'member'} · {world.active?'current':`ages ${world.startedAge}–${world.endedAge??state.character.age}`}</p>})}</div>}
    <div className="sheet-section"><h3>Memories</h3>{npc.memories.slice(-5).reverse().map(m=><p className="memory" key={m.id}>{m.summary}</p>)}{!npc.memories.length&&<p className="muted">No major memories yet.</p>}</div>
  </>}</BottomSheet>;

  if(folder&&graph){
    const summary=summaries.find(item=>item.id===folder)!;
    return <main className="screen people-tree-screen">
      <div className="screen-title"><div><p className="eyebrow">Relationship tree</p><h1>{summary.title}</h1></div><button className="secondary-button" onClick={()=>setFolder(undefined)}>‹ Folders</button></div>
      <section className="tree-intro-card"><div><strong>{summary.count} {summary.count===1?'person':'people'}</strong><p>{summary.description}</p></div><span className="tree-folder-glyph">{folderGlyph[folder]}</span></section>
      {summary.count>0?<RelationshipTree state={state} graph={graph} onSelect={setSelectedNpcId}/>:<div className="empty-card">No one is in this relationship folder yet. As persistent NPC worlds expand, new connections will appear here automatically.</div>}
      {folder==='player_family'&&state.character.age>=18&&<FamilyPlanningCard state={state} onResult={onResult} partnerId={partner?.npcId} expecting={expecting} canTryChild={canTryChild} canAdopt={canAdopt} newbornPresent={newbornPresent}/>} 
      {personSheet}
    </main>;
  }

  return <main className="screen"><div className="screen-title"><div><p className="eyebrow">People</p><h1>Relationships</h1></div><button className="secondary-button" disabled={!actionAllowed(state,{policy:'social.meet'})} onClick={()=>onResult(gameEngine.performActivity('meet_date'))}>Meet someone</button></div>
    <SearchField value={q} onChange={setQ} placeholder="Search every relationship"/>
    {query?<><div className="section-heading"><h2>Search results</h2><span>{rows.length} found</span></div><div className="stack">{rows.map(rel=><PersonRow key={rel.id} state={state} npcId={rel.npcId} onSelect={setSelectedNpcId}/>) }{rows.length===0&&<div className="empty-card">No matching relationships.</div>}</div></>:
    <><div className="section-heading"><div><p className="eyebrow">Your circles</p><h2>Relationship folders</h2></div><span>{state.relationships.length} people</span></div><div className="people-folder-grid">{summaries.map(summary=><button className="people-folder-card" key={summary.id} onClick={()=>setFolder(summary.id)}><div className="people-folder-top"><span className="people-folder-glyph">{folderGlyph[summary.id]}</span><strong>{summary.count}</strong></div><h3>{summary.title}</h3><p>{summary.description}</p><small>{summary.previewNames.length?summary.previewNames.join(' · '):'No connections yet'}</small><span className="folder-open-label">Open tree ›</span></button>)}</div></>}
    {state.character.age>=18&&<FamilyPlanningCard state={state} onResult={onResult} partnerId={partner?.npcId} expecting={expecting} canTryChild={canTryChild} canAdopt={canAdopt} newbornPresent={newbornPresent}/>} 
    {personSheet}
  </main>;
}

function PersonRow({state,npcId,onSelect}:{state:GameState;npcId:string;onSelect:(id:string)=>void}){
  const rel=state.relationships.find(r=>r.npcId===npcId);const n=state.npcs[npcId];if(!rel||!n)return null;
  return <button className="person-card" onClick={()=>onSelect(npcId)}><div className="npc-monogram">{n.firstName[0]}</div><div className="grow"><strong>{n.firstName} {n.lastName}</strong><small>{rel.type.replaceAll('_',' ')} · age {n.age}{!n.alive?' · deceased':''}</small><div className="mini-meter"><span style={{width:`${rel.score}%`}}/></div></div><strong>{Math.round(rel.score)}</strong></button>;
}

function FamilyPlanningCard({state,onResult,partnerId,expecting,canTryChild,canAdopt,newbornPresent}:{state:GameState;onResult:(r:EngineResult)=>void;partnerId?:string;expecting:GameState['familyPlanning']['pregnancy'];canTryChild:boolean;canAdopt:boolean;newbornPresent:boolean}){
  return <section className="action-card"><h2>Build your family</h2><p>{expecting?`You are expecting ${expecting.expectedChildren===2?'twins':expecting.expectedChildren===3?'triplets':'a child'} next year.`:'Parenthood is persistent: children age, form relationships, build careers, and can carry the thread into another generation.'}</p><div className="button-row"><button onClick={()=>onResult(gameEngine.haveChild(partnerId,false))} disabled={!partnerId||!!expecting||!canTryChild||newbornPresent}>{expecting?'Expecting':!canTryChild?'Tried this year':'Try for child'}</button><button onClick={()=>onResult(gameEngine.haveChild(undefined,true))} disabled={!!expecting||!canAdopt||newbornPresent}>{!canAdopt?'Adopted this year':'Adopt'}</button></div></section>;
}
