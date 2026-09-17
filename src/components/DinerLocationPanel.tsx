import { EverthreadIcon } from './EverthreadIcon';
import { formatMoney } from '../core/format';
import { personalItemPurchaseStatus } from '../systems/PersonalInventorySystem';
import { locationSceneDinerOwnedPersonalItems, locationSceneDinerPersonalCatalogue } from '../systems/LocationSceneSystem';
import { gameEngine } from '../stores/gameStore';
import type { LocationSceneDinerActionId } from '../data/locationScenes';
import type { EngineResult, GameState } from '../types/game';

export function DinerLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneDinerActionId;onResult:(result:EngineResult)=>void}){
  if(actionId!=='shop.diner')return <p className="empty-card"><EverthreadIcon name="diner" size={18}/> This Nightjar counter view is unavailable.</p>;
  const items=locationSceneDinerPersonalCatalogue();
  const owned=locationSceneDinerOwnedPersonalItems(state);
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Nightjar counter</p><h3>Local goods & keepsakes</h3></div><strong>{items.length}</strong></div>
      <p>Nightjar does not invent a priced meal menu or nourishment economy. These are the real personal items already assigned to the diner by Everthread's existing inventory catalogue.</p>
    </section>
    <div className="list-compact">{items.map(item=>{const status=personalItemPurchaseStatus(state,item.id);return <button key={item.id} disabled={!status.allowed} title={!status.allowed?status.message:undefined} onClick={()=>onResult(gameEngine.purchasePersonalItem(item.id))}>
      <span><strong>{item.name}</strong><small>{item.category} · {formatMoney(item.price)}</small><em>{status.allowed?item.description:status.message}</em></span><b>Buy</b>
    </button>;})}</div>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Your Nightjar finds</p><h3>Already yours</h3></div><strong>{owned.length}</strong></div>
      {owned.length?<div className="list-compact">{owned.map(({item,definition})=><div className="owned-card" key={item.id}><div><strong>{definition.name}</strong><small>{definition.category} · bought for {formatMoney(item.purchasePrice)} · age {item.acquiredAge}</small><span>{definition.description}</span></div></div>)}</div>:<p className="empty-card">You have not bought a personal item from Nightjar Diner yet.</p>}
      <p className="muted">This is a read-only view of personal inventory. Cash, item instances, limits, gifting, and removal stay with the existing inventory and relationship owners.</p>
    </section>
  </>;
}
