import { EverthreadIcon } from './EverthreadIcon';
import { formatMoney } from '../core/format';
import { collectiblePurchaseAvailability } from '../systems/PropertySystem';
import { personalItemPurchaseStatus } from '../systems/PersonalInventorySystem';
import { locationSceneMallCollectibleCatalogue, locationSceneMallOwnedPersonalItems, locationSceneMallPersonalCatalogue } from '../systems/LocationSceneSystem';
import { gameEngine } from '../stores/gameStore';
import type { LocationSceneMallActionId } from '../data/locationScenes';
import type { EngineResult, GameState } from '../types/game';

function PersonalShop({state,giftsOnly,onResult}:{state:GameState;giftsOnly:boolean;onResult:(result:EngineResult)=>void}){
  const items=locationSceneMallPersonalCatalogue(giftsOnly);
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Crossroads vendors</p><h3>{giftsOnly?'Gift boutique':'Personal items'}</h3></div><strong>{items.length}</strong></div>
      <p>{giftsOnly?'These are the gift-category items already sold at Crossroads Mall. Buying one adds the real item to personal inventory; giving it to someone still happens through the existing relationship gift flow.':'These are the non-gift personal items already assigned to Crossroads Mall by the authoritative personal-inventory catalogue.'}</p>
    </section>
    <div className="list-compact">{items.map(item=>{const status=personalItemPurchaseStatus(state,item.id);return <button key={item.id} disabled={!status.allowed} title={!status.allowed?status.message:undefined} onClick={()=>onResult(gameEngine.purchasePersonalItem(item.id))}>
      <span><strong>{item.name}</strong><small>{item.category} · {formatMoney(item.price)}</small><em>{status.allowed?item.description:status.message}</em></span><b>Buy</b>
    </button>;})}</div>
    <p className="muted">Crossroads does not keep a second inventory or balance. Cash, purchase limits, item instances, and later gifting remain owned by the existing personal-inventory and relationship systems.</p>
  </>;
}

function MallInventory({state}:{state:GameState}){
  const owned=locationSceneMallOwnedPersonalItems(state);
  return <section className="action-card">
    <div className="section-heading"><div><p className="eyebrow">Your purchases</p><h3>From Crossroads Mall</h3></div><strong>{owned.length}</strong></div>
    {owned.length?<div className="list-compact">{owned.map(({item,definition})=><div className="owned-card" key={item.id}><div><strong>{definition.name}</strong><small>{definition.category} · bought for {formatMoney(item.purchasePrice)} · age {item.acquiredAge}</small><span>{definition.description}</span></div></div>)}</div>:<p className="empty-card">You have not bought a personal item from Crossroads Mall yet.</p>}
    <p className="muted">This is a read-only projection of your existing personal inventory. Removing or gifting an item elsewhere updates this list automatically.</p>
  </section>;
}

function CollectibleShop({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const items=locationSceneMallCollectibleCatalogue();
  return <>
    <section className="action-card">
      <div className="section-heading"><div><p className="eyebrow">Collector stalls</p><h3>Collectible market</h3></div><strong>{state.assets.collectibles.length} owned</strong></div>
      <p>Base estimates are shown for orientation only. The existing collectible owner rolls the actual market price and authenticity only when you choose <strong>Find</strong>.</p>
      {state.assets.collectibles.slice(0,8).map(item=><p className="history-line" key={item.id}><span>{item.name} · {item.rarity}</span><strong>{formatMoney(item.estimatedValue)}</strong></p>)}
      {state.assets.collectibles.length>8&&<p className="muted">+ {state.assets.collectibles.length-8} more collectible{state.assets.collectibles.length-8===1?'':'s'} in Assets.</p>}
    </section>
    <div className="list-compact">{items.map(item=>{const gate=collectiblePurchaseAvailability(state,item.id);return <button key={item.id} disabled={!gate.allowed} title={!gate.allowed?gate.reason:undefined} onClick={()=>onResult(gameEngine.purchaseCollectible(item.id))}>
      <span><strong>{item.name}</strong><small>{item.family} · base estimate {formatMoney(item.baseValue)} · {item.rarity}</small></span><b>Find</b>
    </button>;})}</div>
    <p className="muted">Browsing this list consumes no gameplay RNG. Crossroads never predicts the rolled purchase price, authenticity, condition, or value.</p>
  </>;
}

export function MallLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneMallActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='shop.style')return <PersonalShop state={state} giftsOnly={false} onResult={onResult}/>;
  if(actionId==='shop.gifts')return <PersonalShop state={state} giftsOnly onResult={onResult}/>;
  if(actionId==='shop.collection')return <CollectibleShop state={state} onResult={onResult}/>;
  if(actionId==='shop.inventory')return <MallInventory state={state}/>;
  return <p className="empty-card"><EverthreadIcon name="mall" size={18}/> This Crossroads Mall view is unavailable.</p>;
}
