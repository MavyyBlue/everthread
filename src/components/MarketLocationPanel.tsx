import { EverthreadIcon } from './EverthreadIcon';
import { formatMoney } from '../core/format';
import { personalItemPurchaseStatus } from '../systems/PersonalInventorySystem';
import { locationSceneMarketOwnedPersonalItems, locationSceneMarketPersonalCatalogue } from '../systems/LocationSceneSystem';
import { gameEngine } from '../stores/gameStore';
import type { LocationSceneMarketActionId } from '../data/locationScenes';
import type { EngineResult, GameState } from '../types/game';

function MarketCatalogue({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const items=locationSceneMarketPersonalCatalogue();
  const pantry=items.filter(item=>item.preferenceTags.some(tag=>tag==='food'||tag==='cooking'));
  const household=items.filter(item=>!pantry.includes(item));
  const renderItems=(entries:typeof items)=>entries.length?<div className="list-compact">{entries.map(item=>{const status=personalItemPurchaseStatus(state,item.id);return <button key={item.id} disabled={!status.allowed} title={!status.allowed?status.message:undefined} onClick={()=>onResult(gameEngine.purchasePersonalItem(item.id))}>
    <span><strong>{item.name}</strong><small>{item.category} · {formatMoney(item.price)}</small><em>{status.allowed?item.description:status.message}</em></span><b>Buy</b>
  </button>;})}</div>:<p className="empty-card">No existing catalogue item currently qualifies for this shelf.</p>;
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Everthread Market</p><h3>Food & household items</h3></div><strong>{items.length}</strong></div>
      <p>These are the real personal-item catalogue entries already assigned to Everthread Market. The store does not invent consumable groceries, pantry quantities, hunger, or a second household budget.</p>
    </section>
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Pantry & kitchen</p><h3>Food-adjacent finds</h3></div><strong>{pantry.length}</strong></div>{renderItems(pantry)}</section>
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Household shelf</p><h3>Everyday extras</h3></div><strong>{household.length}</strong></div>{renderItems(household)}</section>
    <p className="muted">Cash, purchase limits, item instances, later gifting, and removal stay with the existing Personal Inventory and relationship owners.</p>
  </>;
}

function MarketInventory({state}:{state:GameState}){
  const owned=locationSceneMarketOwnedPersonalItems(state);
  return <section className="action-card">
    <div className="section-heading"><div><p className="eyebrow">Your Market purchases</p><h3>Already yours</h3></div><strong>{owned.length}</strong></div>
    {owned.length?<div className="list-compact">{owned.map(({item,definition})=><div className="owned-card" key={item.id}><div><strong>{definition.name}</strong><small>{definition.category} · bought for {formatMoney(item.purchasePrice)} · age {item.acquiredAge}</small><span>{definition.description}</span></div></div>)}</div>:<p className="empty-card">You have not bought a personal item from Everthread Market yet.</p>}
    <p className="muted">This is a read-only projection of personal inventory. Buying, gifting, or removing an item elsewhere updates this shelf automatically.</p>
  </section>;
}

export function MarketLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneMarketActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='shop.groceries')return <MarketCatalogue state={state} onResult={onResult}/>;
  if(actionId==='shop.market.inventory')return <MarketInventory state={state}/>;
  return <p className="empty-card"><EverthreadIcon name="market" size={18}/> This Everthread Market view is unavailable.</p>;
}
