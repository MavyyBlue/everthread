import { useState } from 'react';
import type { EngineResult, GameState, Npc, SocialWorld } from '../types/game';
import { BottomSheet } from './BottomSheet';
import { gameEngine } from '../stores/gameStore';
import { actionAllowed } from '../core/actionEconomy';
import { formatMoney } from '../core/format';
import { specialCareerWorldKind, specialCareerWorldView, type SpecialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import { screenCareerOffer } from '../systems/ScreenCareerCycleSystem';
import type { SpecialCareerWorldKind } from '../systems/SpecialCareerWorldSystem';

const KIND_LABELS:Record<SpecialCareerWorldKind,string>={
  acting:'Acting production',music:'Music circle',sports:'Professional team',modeling:'Modeling agency',racing:'Race team',directing:'Film production',
};

type CareerTrack=Record<string,number|string|boolean>;

function careerTrack(state:GameState,kind:SpecialCareerWorldKind){return (state.specialCareers[kind]??{}) as CareerTrack;}
function person(state:GameState,id?:string):Npc|undefined{return id?state.npcs[id]:undefined;}
function relationScore(state:GameState,id?:string){return id?state.relationships.find(rel=>rel.npcId===id)?.score:undefined;}
function interactionAllowed(state:GameState,id:string|undefined,action:string){return Boolean(id)&&actionAllowed(state,[{policy:'social.npc.total',target:id!},{policy:'social.npc.action',target:`${id}:${action}`}]);}
function resolvedImpact(world:SocialWorld){return world.groups.find(group=>group.kind.endsWith(':resolved'))?.prestige;}
function worldSort(a:SocialWorld,b:SocialWorld){return Number(b.active)-Number(a.active)||b.startedAge-a.startedAge||b.id.localeCompare(a.id);}

export function SpecialCareerWorldPanel({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[open,setOpen]=useState(false);
  const worlds=state.socialWorlds.filter(world=>Boolean(specialCareerWorldKind(world))).slice().sort(worldSort);
  const active=worlds.filter(world=>world.active);
  const history=worlds.filter(world=>!world.active).slice(0,8);
  const actingOffer=screenCareerOffer(state,'acting');const directingOffer=screenCareerOffer(state,'directing');
  const offers=[actingOffer,directingOffer].filter(Boolean);
  const actingActive=active.some(world=>specialCareerWorldKind(world)==='acting');
  const directingActive=active.some(world=>specialCareerWorldKind(world)==='directing');
  const hasContent=worlds.length>0||offers.length>0;
  const acting=careerTrack(state,'acting');const directing=careerTrack(state,'directing');
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Persistent career worlds</p><h2>{active.length?`${active.length} active ${active.length===1?'ecosystem':'ecosystems'}`:'Career ecosystem'}</h2></div><span>{offers.length?`${offers.length} offer${offers.length===1?'':'s'}`:`${worlds.length} total`}</span></div>
      {active.length?<p className="muted">{active.slice(0,3).map(world=>world.name).join(' · ')}{active.length>3?` · +${active.length-3} more`:''}. Cast, team, staff, and rival relationships feed directly into career outcomes.</p>:offers.length?<p className="muted">Your recent work generated a follow-up opportunity. Offers expire with age and still respect the normal career action limits.</p>:<p className="muted">Book an acting role, release music, turn professional in sports, land modeling work, enter motorsport, or direct a film to create a persistent career world.</p>}
      <div className="button-row"><button disabled={!hasContent} onClick={()=>setOpen(true)}>{offers.length?'Review career offers':active.length?'Open career worlds':'View career history'}</button></div>
    </section>
    <BottomSheet open={open} title="Career worlds" onClose={()=>setOpen(false)} wide>
      {offers.length>0&&<div className="sheet-section"><h3>Pending offers</h3>
        {actingOffer&&<article className="school-group-card joined"><div><strong>Acting offer · {actingOffer.role}</strong><small>From {actingOffer.sourceProject} · {formatMoney(actingOffer.pay??0)} · expires after age {actingOffer.expiresAge}</small></div><div className="school-group-actions"><button disabled={actingActive||!actionAllowed(state,{policy:'special.audition'})} onClick={()=>onResult(gameEngine.actingAudition())}>Accept role</button></div></article>}
        {directingOffer&&<article className="school-group-card joined"><div><strong>Studio-backed directing offer</strong><small>From {directingOffer.sourceProject} · {formatMoney(directingOffer.budget??0)} budget · {formatMoney(directingOffer.fee??0)} fee · expires after age {directingOffer.expiresAge}</small></div><div className="school-group-actions"><button disabled={directingActive||!actionAllowed(state,{policy:'special.direct_film'})} onClick={()=>onResult(gameEngine.directFilm(directingOffer.budget??1500000))}>Accept film</button></div></article>}
      </div>}
      {active.length>0&&<div className="sheet-section"><h3>Active ecosystems</h3>{active.map(world=><CareerWorldCard key={world.id} state={state} world={world} onResult={onResult}/>)}</div>}
      {(acting.lastProjectName||directing.lastProjectName)&&<div className="sheet-section"><h3>Latest screen releases</h3>
        {acting.lastProjectName&&<p className="memory"><strong>{String(acting.lastProjectName)}</strong> · {String(acting.lastProjectRole??'role')} · {String(acting.lastProjectReception??'released')} · impact {Math.round(Number(acting.lastProjectScore??0))}/100{Number(acting.lastProjectBonus??0)>0?` · bonus ${formatMoney(Number(acting.lastProjectBonus))}`:''}</p>}
        {directing.lastProjectName&&<p className="memory"><strong>{String(directing.lastProjectName)}</strong> · {String(directing.lastProjectReception??'released')} · impact {Math.round(Number(directing.lastProjectScore??0))}/100 · box office {formatMoney(Number(directing.lastBoxOffice??0))}</p>}
      </div>}
      {history.length>0&&<div className="sheet-section"><h3>Career history</h3>{history.map(world=>{const kind=specialCareerWorldKind(world)!;const impact=resolvedImpact(world);return <p className="memory" key={world.id}><strong>{world.name}</strong> · {KIND_LABELS[kind]} · ages {world.startedAge}–{world.endedAge??state.character.age}{impact!==undefined?` · impact ${Math.round(impact)}/100`:''}</p>})}</div>}
      {!hasContent&&<p className="muted">No special-career worlds or offers have been created in this life yet.</p>}
    </BottomSheet>
  </>;
}

function CareerWorldCard({state,world,onResult}:{state:GameState;world:SocialWorld;onResult:(result:EngineResult)=>void}){
  const view=specialCareerWorldView(state,world) as SpecialCareerWorldView;
  const career=careerTrack(state,view.kind);
  const leader=person(state,view.leaderNpcId);const rival=person(state,view.rivalNpcId);const peer=person(state,view.peerNpcId);
  const momentum=Math.round(Number(career.careerMomentum??0));const awards=Number(career.awards??0);const scandals=Number(career.scandals??0);
  const project=view.kind==='acting'||view.kind==='directing';
  const interact=(npc:Npc|undefined,action:string)=>{if(npc)onResult(gameEngine.interactWithCharacter(npc.id,action));};
  const contractRemaining=Number(career.contractRemaining??career.contractYears??0);const salary=Number(career.salary??0);
  return <article className="school-group-card joined">
    <div className="section-heading"><div><p className="eyebrow">{KIND_LABELS[view.kind]}</p><h3>{world.name}</h3></div><span>{view.memberCount} people</span></div>
    <div className="sheet-stat-grid">
      {!project&&<div><small>Momentum</small><strong>{momentum||'—'}</strong></div>}
      <div><small>Chemistry</small><strong>{Math.round(view.chemistry)}</strong></div>
      <div><small>Prestige</small><strong>{Math.round(view.prestige)}</strong></div>
      <div><small>Rivalry</small><strong>{Math.round(view.rivalry)}</strong></div>
    </div>
    <p className="muted">{leader?`Lead: ${leader.firstName} ${leader.lastName} (${Math.round(relationScore(state,leader.id)??0)})`:'No current lead'}{rival?` · Rival: ${rival.firstName} ${rival.lastName} (${Math.round(view.rivalry)} pressure)`:''}</p>
    {view.kind==='acting'&&career.currentProjectActive===true&&career.currentProjectWorldId===world.id&&<p className="memory">In production: {String(career.currentProjectRole??'role')} · booked pay {formatMoney(Number(career.currentProjectPay??0))}. Release resolves on the next Age Up.</p>}
    {view.kind==='directing'&&career.currentProjectActive===true&&career.currentProjectWorldId===world.id&&<p className="memory">In production: {formatMoney(Number(career.currentProjectBudget??0))} budget · {String(career.currentProjectSource??'production')} · director fee {formatMoney(Number(career.currentProjectFee??0))}. Release resolves on the next Age Up.</p>}
    {view.kind==='sports'&&career.pro===true&&<p className="memory">Contract: {contractRemaining} year{contractRemaining===1?'':'s'} remaining{salary?` · ${formatMoney(salary)}/year`:''}.</p>}
    {view.kind==='sports'&&Number(career.seasonsPlayed??0)>0&&<p className="memory">Season {Number(career.seasonsPlayed)}: {String(career.seasonRecord??'record pending')} · performance {Math.round(Number(career.lastSeasonScore??0))}/100. {String(career.seasonOutcome??'')}</p>}
    {view.kind==='sports'&&Number(career.seasonsPlayed??0)>0&&<p className="memory">Career: {Number(career.careerAppearances??0)} appearances · {Number(career.championships??0)} championship{Number(career.championships??0)===1?'':'s'} · best season {Math.round(Number(career.bestSeasonScore??0))}/100.</p>}
    {(awards>0||scandals>0)&&<p className="memory">Career record: {awards} award{awards===1?'':'s'} · {scandals} public scandal{scandals===1?'':'s'}.</p>}
    <div className="button-row">
      <button disabled={!peer||!interactionAllowed(state,peer.id,'spend_time')} onClick={()=>interact(peer,'spend_time')}>Build chemistry</button>
      <button disabled={!leader||!interactionAllowed(state,leader.id,'conversation')} onClick={()=>interact(leader,'conversation')}>Seek guidance</button>
      {rival&&<button className="secondary-button" disabled={!interactionAllowed(state,rival.id,'conversation')} onClick={()=>interact(rival,'conversation')}>Ease rivalry</button>}
    </div>
    <p className="muted">These use the normal NPC relationship limits. Chemistry affects next-year momentum or project impact; hostile rivalry and weak chemistry increase scandal pressure.</p>
  </article>;
}
