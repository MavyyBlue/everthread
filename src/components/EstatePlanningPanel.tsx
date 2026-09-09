import { useEffect, useState } from 'react';
import type { EngineResult, GameState, Npc } from '../types/game';
import type { EstateAssetKind } from '../types/estate';
import { gameEngine } from '../stores/gameStore';
import { previewEstate } from '../systems/EstateSystem';
import { formatMoney } from '../core/format';

function livingChildren(state:GameState){
  return state.relationships.filter(rel=>rel.type==='child').map(rel=>state.npcs[rel.npcId]).filter((npc):npc is Npc=>Boolean(npc?.alive));
}

export function EstatePlanningPanel({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const children=livingChildren(state);
  const preview=previewEstate(state);
  const[shares,setShares]=useState<Record<string,number>>({});

  useEffect(()=>{
    const willById=new Map(state.inheritance.will.map(entry=>[entry.npcId,entry.percentage]));
    const equal=children.length?100/children.length:0;
    setShares(Object.fromEntries(children.map(child=>[child.id,willById.size?(willById.get(child.id)??0):equal])));
  },[state.inheritance.will,children.map(child=>child.id).join('|')]);

  if(state.character.age<18)return <section className="hero-card"><p className="eyebrow">Estate planning</p><h2>Available at 18</h2><p>When you become an adult, you can set residuary shares and leave specific family assets to individual children.</p></section>;
  if(!children.length)return <section className="hero-card"><p className="eyebrow">Estate planning</p><h2>No eligible descendants yet</h2><p>Your estate plan becomes useful once you have a living child. Until then, your current assets remain part of this life.</p></section>;

  const shareTotal=children.reduce((sum,child)=>sum+(Number(shares[child.id])||0),0);
  const bequestFor=(kind:EstateAssetKind,assetId:string)=>state.inheritance.assetBequests?.find(entry=>entry.kind===kind&&entry.assetId===assetId)?.beneficiaryNpcId??'';
  const assign=(kind:EstateAssetKind,assetId:string,beneficiaryNpcId:string)=>onResult(gameEngine.setEstateAssetBequest(kind,assetId,beneficiaryNpcId||undefined));
  const saveShares=()=>onResult(gameEngine.setWill(children.map(child=>({npcId:child.id,percentage:Number(shares[child.id])||0}))));
  const equalShares=()=>onResult(gameEngine.setWill([]));
  const assets:Array<{kind:EstateAssetKind;id:string;name:string;detail:string}>=[];
  for(const property of state.assets.properties)assets.push({kind:'property',id:property.id,name:property.name,detail:`Property · ${formatMoney(property.marketValue)}`});
  for(const business of state.businesses.filter(business=>!business.bankrupt))assets.push({kind:'business',id:business.id,name:business.name,detail:`Business · ${formatMoney(business.valuation)}`});
  for(const collectible of state.assets.collectibles)assets.push({kind:'collectible',id:collectible.id,name:collectible.name,detail:`Collectible · ${formatMoney(collectible.estimatedValue)}`});

  return <div className="stack">
    <section className="hero-card"><p className="eyebrow">Phase 5 · estate plan</p><h2>{formatMoney(preview.distributableValue)} estimated for heirs</h2><p>Estate obligations are settled first. Specific bequests are honored when the estate can support them; the remaining estate follows your percentage shares.</p><div className="finance-grid"><div><small>Estimated estate</small><strong>{formatMoney(preview.estateValue)}</strong></div><div><small>Estate obligations</small><strong>{formatMoney(preview.estateObligations)}</strong></div><div><small>Living children</small><strong>{children.length}</strong></div><div><small>Likely forced sales</small><strong>{preview.forcedSaleIds.length}</strong></div></div></section>

    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Residuary estate</p><h2>Percentage shares</h2></div><strong>{shareTotal.toFixed(1)}%</strong></div><p className="muted">These percentages divide cash, investments, and assets not specifically left to someone.</p>{children.map(child=><label className="form-field" key={child.id}><span>{child.firstName} {child.lastName}</span><input type="number" min="0" max="100" step="1" value={Number.isFinite(shares[child.id])?shares[child.id]:0} onChange={event=>setShares(current=>({...current,[child.id]:Math.max(0,Math.min(100,Number(event.target.value)||0))}))}/></label>)}<div className="button-row"><button disabled={Math.abs(shareTotal-100)>.01} onClick={saveShares}>Save shares</button><button className="secondary-button" onClick={equalShares}>Equal shares</button></div>{Math.abs(shareTotal-100)>.01&&<p className="warning-card">Shares must add up to exactly 100% before saving.</p>}</section>

    <section className="action-card"><p className="eyebrow">Unassigned family assets</p><h2>Retention preferences</h2><label className="toggle-row"><span><strong>Keep unassigned properties in the family when practical</strong><small>Debt or an impossible fair division can still require a sale.</small></span><input type="checkbox" checked={state.inheritance.inheritProperties} onChange={event=>onResult(gameEngine.setEstateRetentionPreferences({inheritProperties:event.target.checked}))}/></label><label className="toggle-row"><span><strong>Keep unassigned businesses in the family when practical</strong><small>Bankrupt businesses are never inherited as operating assets.</small></span><input type="checkbox" checked={state.inheritance.inheritBusinesses} onChange={event=>onResult(gameEngine.setEstateRetentionPreferences({inheritBusinesses:event.target.checked}))}/></label></section>

    <section className="action-card"><p className="eyebrow">Specific bequests</p><h2>Leave an asset to one child</h2><p className="muted">A named bequest takes priority over percentage balancing, but it cannot make estate debt disappear.</p>{assets.length?assets.map(asset=><label className="form-field" key={`${asset.kind}:${asset.id}`}><span><strong>{asset.name}</strong><small>{asset.detail}</small></span><select value={bequestFor(asset.kind,asset.id)} onChange={event=>assign(asset.kind,asset.id,event.target.value)}><option value="">Residuary estate</option>{children.map(child=><option key={child.id} value={child.id}>{child.firstName} {child.lastName}</option>)}</select></label>):<p className="muted">You do not currently own a property, operating business, or collectible that can receive a specific bequest.</p>}</section>

    <section className="action-card"><p className="eyebrow">Projected inheritance</p><h2>What each child would receive</h2>{preview.heirs.map(heir=><div className="owned-card" key={heir.npcId}><div><strong>{heir.name}</strong><small>{heir.percentage.toFixed(1)}% residuary share · estimated {formatMoney(heir.inheritanceValue)}</small>{[...heir.properties,...heir.businesses,...heir.collectibles].length>0&&<small>Specific/retained assets: {[...heir.properties,...heir.businesses,...heir.collectibles].map(asset=>asset.name).join(', ')}</small>}</div></div>)}</section>
  </div>;
}
