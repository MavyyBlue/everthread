import { useMemo, useState } from 'react';
import { EverthreadIcon } from './EverthreadIcon';
import { SearchField } from './SearchField';
import { AssetPurchaseSheet, type AssetPurchaseTarget } from './AssetPurchaseSheet';
import { AssetSaleSheet, type AssetSaleTarget } from './AssetSaleSheet';
import { actionAllowed } from '../core/actionEconomy';
import { formatMoney } from '../core/format';
import { getSecuredLoanStatus } from '../systems/FinanceSystem';
import { primaryResidenceAvailability, propertyPurchaseAvailability } from '../systems/PropertySystem';
import { locationSceneHomeCatalogue, locationSceneResidenceProjection } from '../systems/LocationSceneSystem';
import { gameEngine } from '../stores/gameStore';
import type { LocationSceneRealtyActionId } from '../data/locationScenes';
import type { EngineResult, GameState } from '../types/game';

const homeCatalogue=locationSceneHomeCatalogue();

type HomeDefinition=(typeof homeCatalogue)[number];

function homePrice(state:GameState,home:HomeDefinition){return Math.round(home.basePrice*state.economy.housingIndex);}
function purchaseTarget(state:GameState,home:HomeDefinition):AssetPurchaseTarget{
  return{kind:'home',typeId:home.id,name:home.name,price:homePrice(state,home)};
}

function HomeCatalogue({state,mortgageFirst,onResult}:{state:GameState;mortgageFirst:boolean;onResult:(result:EngineResult)=>void}){
  const[q,setQ]=useState('');
  const[purchase,setPurchase]=useState<AssetPurchaseTarget>();
  const purchaseGate=propertyPurchaseAvailability(state);
  const homes=useMemo(()=>{const needle=q.trim().toLowerCase();return needle?homeCatalogue.filter(home=>`${home.name} ${home.amenities.join(' ')}`.toLowerCase().includes(needle)):homeCatalogue;},[q]);
  return <>
    <SearchField value={q} onChange={setQ} placeholder={mortgageFirst?'Search homes to compare financing':'Search homes'}/>
    {!purchaseGate.allowed&&<p className="warning-card">{purchaseGate.reason}</p>}
    <div className="list-compact">{homes.map(home=><button key={home.id} disabled={!purchaseGate.allowed} title={!purchaseGate.allowed?purchaseGate.reason:undefined} onClick={()=>setPurchase(purchaseTarget(state,home))}>
      <span><strong>{home.name}</strong><small>{formatMoney(homePrice(state,home))} · amenities: {home.amenities.join(', ')}</small></span><b>{mortgageFirst?'Terms':'Options'}</b>
    </button>)}</div>
    {!homes.length&&<p className="empty-card">No homes match that search.</p>}
    <p className="muted">{mortgageFirst?'Select a home to open the existing mortgage marketplace. Comparing terms is read-only; an inquiry and mortgage are created only after you sign an approved contract.':'This is the same authoritative home catalogue and housing index used by Everthread’s existing Assets market.'}</p>
    {purchase&&<AssetPurchaseSheet state={state} target={purchase} onResult={onResult} onClose={()=>setPurchase(undefined)}/>} 
  </>;
}

export function ResidenceProjectionCard({state,contextLabel}:{state:GameState;contextLabel:string}){
  const residence=locationSceneResidenceProjection(state);
  const property=residence.propertyId?state.assets.properties.find(item=>item.id===residence.propertyId):undefined;
  return <section className="action-card">
    <div className="section-heading"><div><p className="eyebrow">Residence projection</p><h3>{residence.label}</h3></div><strong>{residence.kind.replaceAll('_',' ')}</strong></div>
    <p>{residence.detail}</p>
    <div className="finance-grid">
      <div><small>City</small><strong>{residence.city}</strong></div>
      <div><small>Residence type</small><strong>{residence.kind.replaceAll('_',' ')}</strong></div>
      {property&&<><div><small>Home value</small><strong>{formatMoney(property.marketValue)}</strong></div><div><small>Condition</small><strong>{Math.round(property.condition)}%</strong></div></>}
    </div>
    {residence.familyLandmark&&<p className="muted">This residence is preserved as an inherited family landmark by the existing residential-life system.</p>}
    {!residence.visitable&&residence.reason&&<p className="warning-card">{residence.reason}</p>}
    <p className="muted">{contextLabel} only reads this projection. It does not create a second residence or lease record.</p>
  </section>;
}

function OwnedHomes({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[sale,setSale]=useState<AssetSaleTarget>();
  const residence=locationSceneResidenceProjection(state);
  return <>
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Property office</p><h3>Your homes & rentals</h3></div><strong>{state.assets.properties.length}</strong></div>
      {state.assets.properties.map(property=>{
        const loan=state.finances.liabilities.find(item=>item.kind==='mortgage'&&(item.assetId===property.id||item.id===property.mortgageId));
        const secured=loan?getSecuredLoanStatus(state,loan):undefined;
        const isHome=residence.propertyId===property.id;
        const makeHomeGate=primaryResidenceAvailability(state,property.id);
        const rental=property.rental;
        return <div className={`owned-card${secured?.status==='delinquent'?' owned-card--at-risk':''}`} key={property.id}>
          <div><strong>{property.name}{isHome?' · Home':''}</strong><small>{property.location} · value {formatMoney(property.marketValue)} · condition {Math.round(property.condition)}{loan?` · ${formatMoney(loan.balance)} financed · auto-pay ${loan.autoPay===false?'off':'on'}`:' · owned outright'}{rental?` · rental ${rental.occupied?'occupied':'vacant'} · ${formatMoney(rental.annualRent)}/yr`:''}{property.origin==='inherited'?' · family landmark':''}</small>{secured?.status==='delinquent'&&<em className="asset-risk-label">{formatMoney(secured.arrears)} past due · foreclosure risk</em>}</div>
          <div className="action-grid">{!isHome&&<button disabled={!makeHomeGate.allowed} title={!makeHomeGate.allowed?makeHomeGate.reason:undefined} onClick={()=>onResult(gameEngine.setHome(property.id))}>Make home</button>}<button disabled={!actionAllowed(state,{policy:'property.renovate',target:property.id})} onClick={()=>onResult(gameEngine.renovateProperty(property.id))}>Renovate</button>{!rental&&<button onClick={()=>onResult(gameEngine.rentProperty(property.id))}>Rent out</button>}<button onClick={()=>setSale({kind:'property',id:property.id})}>Sell</button></div>
        </div>;
      })}
      {!state.assets.properties.length&&<p className="empty-card">You do not own any homes or real estate yet.</p>}
    </section>
    <p className="muted">Rent out is landlord functionality only. Hearthline does not invent a tenant lease-signing system. Mortgage payments and auto-pay remain owned by Credit & Banking, and sale payoff remains owned by the existing property sale quote.</p>
    {sale&&<AssetSaleSheet state={state} target={sale} onResult={onResult} onClose={()=>setSale(undefined)}/>} 
  </>;
}

export function RealtyLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneRealtyActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='homes.catalog')return <HomeCatalogue state={state} mortgageFirst={false} onResult={onResult}/>;
  if(actionId==='homes.mortgage')return <HomeCatalogue state={state} mortgageFirst onResult={onResult}/>;
  if(actionId==='homes.residence')return <ResidenceProjectionCard state={state} contextLabel="Hearthline"/>;
  if(actionId==='homes.owned')return <OwnedHomes state={state} onResult={onResult}/>;
  return <p className="empty-card"><EverthreadIcon name="key" size={18}/> This Hearthline service is unavailable.</p>;
}
