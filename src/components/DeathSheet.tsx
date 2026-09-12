import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { gameEngine } from '../stores/gameStore';
import { netWorth } from '../systems/FinanceSystem';
import { buildDynastyTransitionReview, type DynastySuccessorPreview } from '../systems/DynastyTransitionSystem';
import { formatMoney } from '../core/format';
import type { ActionVfxRequest } from '../core/actionVfx';

function inheritedAssetNames(successor:DynastySuccessorPreview){
  return [...successor.projectedProperties,...successor.projectedBusinesses,...successor.projectedCollectibles].map(asset=>asset.name);
}

function ownAssetNames(successor:DynastySuccessorPreview){
  return [...successor.ownProperties,...successor.ownBusinesses].map(asset=>asset.name);
}

function summarizedNames(names:string[],limit=5){
  if(names.length<=limit)return names.join(', ');
  return `${names.slice(0,limit).join(', ')} + ${names.length-limit} more`;
}

export function DeathSheet({state,onResult,onNewLife,onRandomLife}:{state:GameState;onResult:(r:EngineResult,vfx?:ActionVfxRequest)=>void;onNewLife:()=>void;onRandomLife:()=>void}){
  const[selectedSuccessorId,setSelectedSuccessorId]=useState<string>();
  const[successorLimit,setSuccessorLimit]=useState(24);
  const[heirLimit,setHeirLimit]=useState(24);
  const[saleLimit,setSaleLimit]=useState(24);
  if(state.character.alive)return null;
  const last=state.completedLives.at(-1);
  const review=buildDynastyTransitionReview(state);
  const estate=review.estate;
  const selected=review.successors.find(candidate=>candidate.npcId===selectedSuccessorId);
  return <div className="death-overlay"><section className="death-card" role="dialog" aria-modal="true" aria-label="Life and estate review">
    <p className="eyebrow">Life complete · Generation {review.generation}</p>
    <h1>{state.character.firstName} {state.character.lastName}</h1>
    <p className="epitaph">{last?.epitaph}</p>
    <div className="finance-grid death-summary-grid"><div><small>Age</small><strong>{state.character.age}</strong></div><div><small>Final net worth</small><strong>{formatMoney(netWorth(state))}</strong></div><div><small>Children</small><strong>{review.successors.length}</strong></div><div><small>Fame</small><strong>{Math.round(state.fame.fame)}</strong></div></div>
    <div className="death-cause"><small>Cause of death</small><strong>{state.character.causeOfDeath}</strong></div>
    {last?.milestones?.length?<details className="death-details"><summary>Review major life milestones</summary><div className="stack">{last.milestones.map((milestone,index)=><p className="history-line" key={index}>{milestone}</p>)}</div></details>:null}

    {estate.heirs.length?<section className="action-card death-review-section">
      <p className="eyebrow">Estate outcome</p>
      <h2>{formatMoney(estate.distributableValue)} passes into the family</h2>
      <p>{review.writtenPlan?'Your written estate plan is being applied through the same settlement rules you saw while alive.':'No custom will controls the residuary estate, so the established family-share rules apply.'}</p>
      <div className="finance-grid"><div><small>Gross estate</small><strong>{formatMoney(estate.grossEstateValue)}</strong></div><div><small>Family receives</small><strong>{formatMoney(estate.distributableValue)}</strong></div><div><small>Debt paid</small><strong>{formatMoney(estate.debtObligations)}</strong></div><div><small>Administration</small><strong>{formatMoney(estate.administrationCosts)}</strong></div><div><small>Settlement levy</small><strong>{formatMoney(estate.estateLevy)}</strong></div><div><small>Assets sold</small><strong>{estate.forcedSales.length}</strong></div></div>
      <p className="muted">{estate.countryName}: {estate.ruleLabel}. These are fictional Everthread settlement rules, not real-world legal or tax guidance.</p>
      {estate.forcedSales.length?<details className="death-details"><summary>See why estate assets were sold</summary><div className="stack">{estate.forcedSales.slice(0,saleLimit).map(sale=><div className="owned-card" key={sale.key}><div><strong>{sale.name}</strong><small>{formatMoney(sale.saleValue)} realized · {sale.reason==='obligations'?'sold to satisfy estate obligations':'sold because the retained asset could not be divided fairly among the heirs'}</small></div></div>)}{estate.forcedSales.length>saleLimit?<button className="secondary-button death-more-button" onClick={()=>setSaleLimit(limit=>limit+24)}>Show more estate sales</button>:null}</div></details>:null}
      <details className="death-details" open><summary>See who receives the estate</summary><div className="stack">{estate.heirs.slice(0,heirLimit).map(heir=>{const assets=[...heir.properties,...heir.businesses,...heir.collectibles];return <div className="owned-card" key={heir.npcId}><div><strong>{heir.name} · {heir.role}</strong><small>{heir.percentage.toFixed(1)}% share · {formatMoney(heir.inheritanceValue)}</small><small>{formatMoney(heir.cash)} cash · {formatMoney(heir.investmentValue)} investments{assets.length?` · ${summarizedNames(assets.map(asset=>asset.name),3)}`:''}</small>{heir.heldUntilAge&&<small>Protected in trust until age {heir.heldUntilAge}.</small>}</div></div>;})}{estate.heirs.length>heirLimit?<button className="secondary-button death-more-button" onClick={()=>setHeirLimit(limit=>limit+24)}>Show more heirs</button>:null}</div></details>
    </section>:<section className="action-card death-review-section"><p className="eyebrow">Estate outcome</p><h2>No living spouse or child can inherit this estate</h2><p className="muted">This life still remains part of your Everthread legacy, but there is no eligible family continuation from the current household.</p></section>}

    <section className="death-review-section">
      <p className="eyebrow">Choose the next thread</p>
      <h2>Who will you become?</h2>
      <p className="muted">You are not creating a replacement character. You are choosing one of your living children and taking over the life they have already been living.</p>
      {review.successors.length?<div className="stack death-successor-list">{review.successors.slice(0,successorLimit).map(candidate=>{const selectedCard=candidate.npcId===selectedSuccessorId;const assets=inheritedAssetNames(candidate);return <button className={`person-card death-successor-card ${selectedCard?'selected':''}`} aria-pressed={selectedCard} key={candidate.npcId} onClick={()=>setSelectedSuccessorId(candidate.npcId)}><div className="npc-monogram">{candidate.name[0]}</div><div className="grow"><strong>{candidate.name}</strong><small>Age {candidate.age} · {candidate.city} · {candidate.career}</small><small>{candidate.relationshipStatus}{candidate.partnerName?` to ${candidate.partnerName}`:''} · {candidate.children} child{candidate.children===1?'':'ren'} · {formatMoney(candidate.ownNetWorth)} own net worth</small><small>Estate share · {formatMoney(candidate.projectedInheritance)}{candidate.inheritanceHeldUntilAge?` · protected until age ${candidate.inheritanceHeldUntilAge}`:assets.length?` · ${assets.slice(0,2).join(', ')}${assets.length>2?' + more':''}`:''}</small></div><b>{selectedCard?'✓':'›'}</b></button>;})}{review.successors.length>successorLimit?<button className="secondary-button death-more-button" onClick={()=>setSuccessorLimit(limit=>limit+24)}>Show more descendants</button>:null}</div>:<p className="muted">No living child is available for generational continuation.</p>}

      {selected?<article className="death-successor-review" aria-live="polite">
        <p className="eyebrow">Successor review · Generation {review.nextGeneration}</p>
        <h2>{selected.name}, age {selected.age}</h2>
        <p>Choosing {selected.name.split(' ')[0]} means continuing the life already in progress—not resetting them into a blank slate.</p>
        <div className="finance-grid"><div><small>Health</small><strong>{Math.round(selected.health)}</strong></div><div><small>Happiness</small><strong>{Math.round(selected.happiness)}</strong></div><div><small>Own net worth</small><strong>{formatMoney(selected.ownNetWorth)}</strong></div><div><small>Existing debt</small><strong>{formatMoney(selected.debt)}</strong></div><div><small>Inheritance</small><strong>{formatMoney(selected.projectedInheritance)}</strong></div><div><small>Projected wealth</small><strong>{formatMoney(selected.projectedStartingNetWorth)}</strong></div></div>
        <div className="death-successor-context"><div><small>Education</small><strong>{selected.education}</strong></div><div><small>Career</small><strong>{selected.career}</strong></div><div><small>Relationships</small><strong>{selected.relationshipStatus}{selected.partnerName?` · ${selected.partnerName}`:''} · {selected.children} child{selected.children===1?'':'ren'}</strong></div><div><small>Public life</small><strong>Fame {Math.round(selected.fame)} · reputation {Math.round(selected.reputation)}</strong></div></div>
        {ownAssetNames(selected).length?<p className="death-asset-line"><strong>Already theirs:</strong> {summarizedNames(ownAssetNames(selected))}</p>:null}
        {inheritedAssetNames(selected).length?<p className="death-asset-line"><strong>From this estate:</strong> {summarizedNames(inheritedAssetNames(selected))}</p>:null}
        {selected.inheritanceHeldUntilAge?<p className="warning-card">Because {selected.name.split(' ')[0]} is a minor, the inherited estate remains protected until age {selected.inheritanceHeldUntilAge}. Their existing life still continues normally in the meantime.</p>:null}
        <button className="full-button death-continue-button" onClick={()=>onResult(gameEngine.continueAsChild(selected.npcId),{derive:false})}>Continue as {selected.name} →</button>
      </article>:null}
    </section>

    <section className="death-new-life"><p className="eyebrow">Or begin elsewhere</p><p className="muted">Starting another life leaves this completed lineage in Past Lives. It does not make one of these descendants your next protagonist.</p><div className="button-row"><button className="secondary-button" onClick={onNewLife}>Create new life</button><button className="secondary-button" onClick={onRandomLife}>Random life</button></div></section>
  </section></div>;
}
