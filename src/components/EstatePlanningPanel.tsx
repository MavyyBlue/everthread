import { useEffect, useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import type { EstateAssetKind } from '../types/estate';
import { gameEngine } from '../stores/gameStore';
import { livingEstateHeirs, previewEstate } from '../systems/EstateSystem';
import { formatMoney } from '../core/format';

export function EstatePlanningPanel({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const heirs=livingEstateHeirs(state);
  const preview=previewEstate(state);
  const[shares,setShares]=useState<Record<string,number>>({});

  useEffect(()=>{
    setShares(Object.fromEntries(preview.heirs.map(heir=>[heir.npcId,heir.percentage])));
  },[state.inheritance.will,heirs.map(heir=>`${heir.role}:${heir.npc.id}`).join('|')]);

  if(state.character.age<18){
    const trust=state.inheritance.trust;
    if(trust)return <section className="hero-card"><p className="eyebrow">Protected inheritance</p><h2>{formatMoney(trust.inheritanceValue)} held in trust</h2><p>Your inherited estate is protected from normal spending and asset actions until age {trust.releaseAge}. It will transfer into your controllable finances and assets when you reach adulthood.</p><div className="finance-grid"><div><small>Release age</small><strong>{trust.releaseAge}</strong></div><div><small>Trust cash</small><strong>{formatMoney(trust.cash)}</strong></div><div><small>Properties</small><strong>{trust.properties.length}</strong></div><div><small>Businesses & heirlooms</small><strong>{trust.businesses.length+trust.collectibles.length}</strong></div></div></section>;
    return <section className="hero-card"><p className="eyebrow">Estate planning</p><h2>Available at 18</h2><p>When you become an adult, you can set residuary shares and leave specific family assets to a spouse or child.</p></section>;
  }
  if(!heirs.length)return <section className="hero-card"><p className="eyebrow">Estate planning</p><h2>No eligible family heirs yet</h2><p>Your estate plan becomes useful once you have a living spouse or child. Until then, your current assets remain part of this life.</p></section>;

  const shareTotal=heirs.reduce((sum,heir)=>sum+(Number(shares[heir.npc.id])||0),0);
  const bequestFor=(kind:EstateAssetKind,assetId:string)=>state.inheritance.assetBequests?.find(entry=>entry.kind===kind&&entry.assetId===assetId)?.beneficiaryNpcId??'';
  const assign=(kind:EstateAssetKind,assetId:string,beneficiaryNpcId:string)=>onResult(gameEngine.setEstateAssetBequest(kind,assetId,beneficiaryNpcId||undefined));
  const saveShares=()=>onResult(gameEngine.setWill(heirs.map(heir=>({npcId:heir.npc.id,percentage:Number(shares[heir.npc.id])||0}))));
  const defaultShares=()=>onResult(gameEngine.setWill([]));
  const assets:Array<{kind:EstateAssetKind;id:string;name:string;detail:string}>=[];
  for(const property of state.assets.properties)assets.push({kind:'property',id:property.id,name:property.name,detail:`Property · ${formatMoney(property.marketValue)}`});
  for(const business of state.businesses.filter(business=>!business.bankrupt))assets.push({kind:'business',id:business.id,name:business.name,detail:`Business · ${formatMoney(business.valuation)}`});
  for(const collectible of state.assets.collectibles)assets.push({kind:'collectible',id:collectible.id,name:collectible.name,detail:`Collectible · ${formatMoney(collectible.estimatedValue)}`});

  return <div className="stack">
    <section className="hero-card"><p className="eyebrow">Phase 5 · estate plan</p><h2>{formatMoney(preview.distributableValue)} estimated for family heirs</h2><p>Debts and fictionalized estate-settlement costs are paid before inheritance is divided. By default, a surviving spouse receives half of the residuary estate and living children divide the other half. These gameplay values are not real-world tax or legal guidance.</p><div className="finance-grid"><div><small>Gross estate</small><strong>{formatMoney(preview.grossEstateValue)}</strong></div><div><small>Estate debts</small><strong>{formatMoney(preview.debtObligations)}</strong></div><div><small>Administration</small><strong>{formatMoney(preview.administrationCosts)}</strong></div><div><small>Estate levy</small><strong>{formatMoney(preview.estateLevy)}</strong></div><div><small>Eligible heirs</small><strong>{heirs.length}</strong></div><div><small>Likely forced sales</small><strong>{preview.forcedSaleIds.length}</strong></div></div><p className="muted">{preview.countryName}: {preview.ruleLabel} · administration begins above {formatMoney(preview.administrationAllowance)} · levy allowance {formatMoney(preview.levyAllowance)} · {(preview.levyRate*100).toFixed(1)}% above the levy allowance after debts and administration.</p></section>

    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Residuary estate</p><h2>Percentage shares</h2></div><strong>{shareTotal.toFixed(1)}%</strong></div><p className="muted">These percentages divide cash, investments, and assets not specifically left to someone. Existing child-only plans from the previous build reserve the default spouse share rather than silently excluding a surviving spouse.</p>{heirs.map(heir=><label className="form-field" key={heir.npc.id}><span>{heir.npc.firstName} {heir.npc.lastName} · {heir.role}</span><input type="number" min="0" max="100" step="1" value={Number.isFinite(shares[heir.npc.id])?shares[heir.npc.id]:0} onChange={event=>setShares(current=>({...current,[heir.npc.id]:Math.max(0,Math.min(100,Number(event.target.value)||0))}))}/></label>)}<div className="button-row"><button disabled={Math.abs(shareTotal-100)>.01} onClick={saveShares}>Save shares</button><button className="secondary-button" onClick={defaultShares}>Default family shares</button></div>{Math.abs(shareTotal-100)>.01&&<p className="warning-card">Shares must add up to exactly 100% before saving.</p>}</section>

    <section className="action-card"><p className="eyebrow">Unassigned family assets</p><h2>Retention preferences</h2><label className="toggle-row"><span><strong>Keep unassigned properties in the family when practical</strong><small>Debt or an impossible fair division can still require a sale.</small></span><input type="checkbox" checked={state.inheritance.inheritProperties} onChange={event=>onResult(gameEngine.setEstateRetentionPreferences({inheritProperties:event.target.checked}))}/></label><label className="toggle-row"><span><strong>Keep unassigned businesses in the family when practical</strong><small>Bankrupt businesses are never inherited as operating assets.</small></span><input type="checkbox" checked={state.inheritance.inheritBusinesses} onChange={event=>onResult(gameEngine.setEstateRetentionPreferences({inheritBusinesses:event.target.checked}))}/></label></section>

    <section className="action-card"><p className="eyebrow">Specific bequests</p><h2>Leave an asset to one family heir</h2><p className="muted">A named bequest takes priority over percentage balancing, but it cannot make estate debt disappear.</p>{assets.length?assets.map(asset=><label className="form-field" key={`${asset.kind}:${asset.id}`}><span><strong>{asset.name}</strong><small>{asset.detail}</small></span><select value={bequestFor(asset.kind,asset.id)} onChange={event=>assign(asset.kind,asset.id,event.target.value)}><option value="">Residuary estate</option>{heirs.map(heir=><option key={heir.npc.id} value={heir.npc.id}>{heir.npc.firstName} {heir.npc.lastName} · {heir.role}</option>)}</select></label>):<p className="muted">You do not currently own a property, operating business, or collectible that can receive a specific bequest.</p>}</section>

    <section className="action-card"><p className="eyebrow">Projected inheritance</p><h2>What each heir would receive</h2>{preview.heirs.map(heir=><div className="owned-card" key={heir.npcId}><div><strong>{heir.name} · {heir.role}</strong><small>{heir.percentage.toFixed(1)}% residuary share · estimated {formatMoney(heir.inheritanceValue)}</small>{heir.heldUntilAge&&<small>Protected in trust until age {heir.heldUntilAge}.</small>}{[...heir.properties,...heir.businesses,...heir.collectibles].length>0&&<small>Specific/retained assets: {[...heir.properties,...heir.businesses,...heir.collectibles].map(asset=>asset.name).join(', ')}</small>}</div></div>)}</section>
  </div>;
}
