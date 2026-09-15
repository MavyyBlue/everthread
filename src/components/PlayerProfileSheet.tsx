import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { BottomSheet } from './BottomSheet';
import { Avatar } from './Avatar';
import { projectPlayerProfile } from '../systems/PlayerProfileSystem';
import { playerResidenceProjection } from '../systems/ResidentialLifeSystem';
import { personalItemDefinitions } from '../data/personalItems';
import { TOWN_PLACES } from '../data/townPlaces';
import { personalItemPurchaseStatus } from '../systems/PersonalInventorySystem';
import { gameEngine } from '../stores/gameStore';
import { exactMoney, formatMoney } from '../core/format';
import './PlayerProfileSheet.css';

type ProfileView='profile'|'inventory'|'browse';
const placeById=Object.fromEntries(TOWN_PLACES.map(place=>[place.id,place])) as Record<string,(typeof TOWN_PLACES)[number]>;

export function PlayerProfileSheet({open,state,onClose,onResult}:{open:boolean;state:GameState;onClose:()=>void;onResult:(result:EngineResult)=>void}){
  const[view,setView]=useState<ProfileView>('profile');
  const[pendingDiscard,setPendingDiscard]=useState<string>();
  const profile=projectPlayerProfile(state);
  const residence=playerResidenceProjection(state);
  const inventoryCount=profile.personalItems.length+profile.valuableCollectibles.length;
  const close=()=>{setPendingDiscard(undefined);onClose();};
  return <BottomSheet open={open} title="Your profile" onClose={close} wide>
    <div className="player-profile-hero">
      <Avatar character={state.character} size={68}/>
      <div><p className="eyebrow">Generation {profile.generation}</p><h2>{profile.fullName}</h2><p>Age {profile.age} · {profile.location}</p></div>
    </div>
    <div className="segmented player-profile-tabs" role="tablist" aria-label="Player profile sections">
      {(['profile','inventory','browse'] as const).map(id=><button key={id} className={view===id?'active':''} onClick={()=>{setView(id);setPendingDiscard(undefined);}} role="tab" aria-selected={view===id}>{id==='profile'?'Profile':id==='inventory'?`Inventory (${inventoryCount})`:'Browse'}</button>)}
    </div>

    {view==='profile'&&<div className="player-profile-stack">
      <section className="player-profile-facts" aria-label="Current life summary">
        <div><small>Career</small><strong>{profile.career}</strong></div>
        <div><small>Education</small><strong>{profile.education}</strong></div>
        <div><small>Relationship</small><strong>{profile.relationship}</strong></div>
        <div><small>Achievements</small><strong>{profile.completedAchievements}</strong></div>
      </section>
      <section className="player-profile-section"><div className="section-heading"><div><p className="eyebrow">Residence</p><h3>{residence.label}</h3></div>{residence.familyLandmark&&<span>Family landmark</span>}</div><p className="profile-muted">{residence.detail}</p></section>
      <section className="player-profile-section"><div className="section-heading"><div><p className="eyebrow">Identity</p><h3>Traits & appearance</h3></div></div><div className="profile-chip-list">{profile.traits.map(trait=><span key={trait}>{trait}</span>)}{profile.appearance.map(value=><span key={value}>{value}</span>)}</div></section>
      <section className="player-profile-section"><div className="section-heading"><div><p className="eyebrow">Licenses</p><h3>Personal credentials</h3></div></div>{profile.licenses.length?<div className="profile-chip-list">{profile.licenses.map(license=><span key={license}>{license}</span>)}</div>:<p className="profile-muted">No travel or vehicle licenses yet.</p>}</section>
      <section className="player-profile-section"><div className="section-heading"><div><p className="eyebrow">Owned elsewhere</p><h3>Authoritative asset summary</h3></div></div><div className="player-profile-assets"><div><strong>{profile.assetSummary.homes}</strong><small>Homes</small></div><div><strong>{profile.assetSummary.vehicles}</strong><small>Vehicles</small></div><div><strong>{profile.assetSummary.businesses}</strong><small>Businesses</small></div><div><strong>{profile.assetSummary.collectibles}</strong><small>Collectibles</small></div></div><p className="profile-muted">These are projections only. Property, vehicles, companies, financing, collectibles, net worth, and estate ownership remain managed by their existing systems.</p></section>
    </div>}

    {view==='inventory'&&<div className="player-profile-stack">
      <section className="player-profile-section"><div className="section-heading"><div><p className="eyebrow">Personal inventory</p><h3>Everyday possessions & future gifts</h3></div><span>{profile.personalItems.length}</span></div><p className="profile-muted">These items are personal possessions, not financial assets. They do not add to net worth or estate value.</p>{profile.personalItems.length?<div className="profile-item-list">{profile.personalItems.map(item=><article className="profile-item-card" key={item.id}><div><strong>{item.name}</strong><small>{item.sourcePlaceLabel} · acquired age {item.acquiredAge}</small><p>{item.description}</p></div>{pendingDiscard===item.id?<div className="profile-item-actions"><button onClick={()=>setPendingDiscard(undefined)}>Keep</button><button className="danger-soft" onClick={()=>{setPendingDiscard(undefined);onResult(gameEngine.discardPersonalItem(item.id));}}>Remove</button></div>:<button className="profile-remove-button" onClick={()=>setPendingDiscard(item.id)}>Remove</button>}</article>)}</div>:<div className="empty-card">Your personal inventory is empty. Browse Everthread’s small everyday shops to pick up something meaningful.</div>}</section>
      <section className="player-profile-section"><div className="section-heading"><div><p className="eyebrow">Valuable collectibles</p><h3>Shown here, owned by Assets</h3></div><span>{profile.valuableCollectibles.length}</span></div><p className="profile-muted">These remain authoritative financial/estate assets and are intentionally not copied into personal inventory.</p>{profile.valuableCollectibles.length?<div className="profile-item-list">{profile.valuableCollectibles.map(item=><article className="profile-item-card profile-item-card--asset" key={item.id}><div><strong>{item.name}</strong><small>{item.rarity} · {Math.round(item.condition)}% condition</small></div><b title={exactMoney(item.estimatedValue)}>{formatMoney(item.estimatedValue)}</b></article>)}</div>:<div className="empty-card">No valuable collectibles owned.</div>}</section>
    </div>}

    {view==='browse'&&<div className="player-profile-stack">
      <section className="player-profile-shop-intro"><div><p className="eyebrow">Everthread personal shops</p><h3>Small things with personal meaning</h3><p>Shopping here is deterministic and uses Cash only. Nothing below is treated as an investment or estate asset.</p></div><strong title={exactMoney(state.finances.cash)}>{formatMoney(state.finances.cash)} cash</strong></section>
      <div className="profile-shop-list">{personalItemDefinitions.map(def=>{const status=personalItemPurchaseStatus(state,def.id);const vendor=placeById[def.vendorPlaceId];return <article className="profile-shop-card" key={def.id}><div><small>{vendor?.shortLabel??'Everthread'} · {def.category}</small><strong>{def.name}</strong><p>{def.description}</p><div className="profile-chip-list">{def.preferenceTags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div></div><div className="profile-shop-action"><b>{formatMoney(def.price)}</b><button disabled={!status.allowed} title={!status.allowed?status.message:undefined} onClick={()=>onResult(gameEngine.purchasePersonalItem(def.id))}>Buy</button>{!status.allowed&&<small>{status.message}</small>}</div></article>;})}</div>
    </div>}
  </BottomSheet>;
}
