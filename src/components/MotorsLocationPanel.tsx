import { useMemo, useState } from 'react';
import { EverthreadIcon } from './EverthreadIcon';
import { LicenseQuiz } from './LicenseQuiz';
import { SearchField } from './SearchField';
import { AssetPurchaseSheet, type AssetPurchaseTarget } from './AssetPurchaseSheet';
import { AssetSaleSheet, type AssetSaleTarget } from './AssetSaleSheet';
import { actionAllowed } from '../core/actionEconomy';
import { formatMoney } from '../core/format';
import { relatedMiniGameSkill, skipMiniGame } from '../minigames/framework';
import { getSecuredLoanStatus } from '../systems/FinanceSystem';
import { locationSceneMotorsCatalogue } from '../systems/LocationSceneSystem';
import { gameEngine } from '../stores/gameStore';
import type { LocationSceneMotorsActionId } from '../data/locationScenes';
import type { EngineResult, GameState } from '../types/game';

const vehicleCatalogue=locationSceneMotorsCatalogue();
const financeableVehicleCatalogue=locationSceneMotorsCatalogue(true);

function purchaseTarget(vehicle:(typeof vehicleCatalogue)[number]):AssetPurchaseTarget{
  return{kind:'vehicle',typeId:vehicle.id,name:vehicle.name,price:vehicle.price,financeEligible:vehicle.category==='car'||vehicle.category==='motorcycle'};
}

function vehicleRequirement(state:GameState,vehicle:(typeof vehicleCatalogue)[number]){
  if(state.character.age<16)return'Purchases unlock at age 16.';
  if(vehicle.category==='boat'&&!state.flags.boatLicense)return'Boating licence required to purchase.';
  if(vehicle.category==='aircraft'&&!state.flags.pilotLicense)return'Pilot licence required to purchase.';
  return undefined;
}

function VehicleCatalogue({state,financingOnly,onResult}:{state:GameState;financingOnly:boolean;onResult:(result:EngineResult)=>void}){
  const[q,setQ]=useState('');
  const[purchase,setPurchase]=useState<AssetPurchaseTarget>();
  const source=financingOnly?financeableVehicleCatalogue:vehicleCatalogue;
  const vehicles=useMemo(()=>{const needle=q.trim().toLowerCase();return needle?source.filter(vehicle=>`${vehicle.name} ${vehicle.category}`.toLowerCase().includes(needle)):source;},[q,source]);
  return <>
    <SearchField value={q} onChange={setQ} placeholder={financingOnly?'Search finance-eligible vehicles':'Search vehicles'}/>
    <div className="list-compact location-scene__motors-list">{vehicles.map(vehicle=>{const requirement=vehicleRequirement(state,vehicle);return <button key={vehicle.id} disabled={state.character.age<16} onClick={()=>setPurchase(purchaseTarget(vehicle))}>
      <span><strong>{vehicle.name}</strong><small>{vehicle.category} · {formatMoney(vehicle.price)}{requirement?` · ${requirement}`:''}</small></span><b>{financingOnly?'Terms':'Options'}</b>
    </button>;})}</div>
    {!vehicles.length&&<p className="empty-card">No vehicles match that search.</p>}
    {!financingOnly&&<p className="muted">The catalogue is the same authoritative vehicle market used elsewhere. Boats and aircraft keep their existing licence requirements; financing remains limited to cars and motorcycles.</p>}
    {financingOnly&&<p className="muted">Comparing estimates is read-only. A credit inquiry and secured liability are created only if you sign an approved financing contract.</p>}
    {purchase&&<AssetPurchaseSheet state={state} target={purchase} onResult={onResult} onClose={()=>setPurchase(undefined)}/>} 
  </>;
}

function VehicleGarage({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[sale,setSale]=useState<AssetSaleTarget>();
  return <>
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Service bay</p><h3>Your vehicles</h3></div><strong>{state.assets.vehicles.length}</strong></div>
      {state.assets.vehicles.map(vehicle=>{const loan=state.finances.liabilities.find(item=>item.kind==='car'&&item.assetId===vehicle.id);const secured=loan?getSecuredLoanStatus(state,loan):undefined;return <div className={`owned-card${secured?.status==='delinquent'?' owned-card--at-risk':''}`} key={vehicle.id}>
        <div><strong>{vehicle.name}</strong><small>Value {formatMoney(vehicle.value)} · condition {Math.round(vehicle.condition)} · {vehicle.mileage.toLocaleString()} km{loan?` · ${formatMoney(loan.balance)} financed · auto-pay ${loan.autoPay===false?'off':'on'}`:' · owned outright'}</small>{secured?.status==='delinquent'&&<em className="asset-risk-label">{formatMoney(secured.arrears)} past due · repossession risk</em>}</div>
        <div className="button-row"><button onClick={()=>onResult(gameEngine.repairVehicle(vehicle.id))}>Repair</button><button onClick={()=>setSale({kind:'vehicle',id:vehicle.id})}>Sell</button></div>
      </div>;})}
      {!state.assets.vehicles.length&&<p className="empty-card">Your garage is empty.</p>}
    </section>
    <p className="muted">Loomline shows financing status for context only. Required payments and auto-pay remain owned by Central Everthread Bank.</p>
    {sale&&<AssetSaleSheet state={state} target={sale} onResult={onResult} onClose={()=>setSale(undefined)}/>} 
  </>;
}

function DrivingLicence({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const held=state.travel.licenses.driving;
  const available=state.character.age>=16&&!held&&actionAllowed(state,{policy:'license.test',target:'driving'});
  const resolveFromSkill=()=>{const resolved=skipMiniGame(state,'driving',relatedMiniGameSkill(state,'driving'));onResult(gameEngine.license('driving',resolved.score));};
  if(held)return <div className="location-scene__status-card"><small>Credential</small><strong>Driving licence held</strong><span>Your existing travel record remains the authority for this licence.</span></div>;
  return <>
    {state.character.age<16&&<p className="warning-card">Driving licence tests unlock at age 16.</p>}
    {state.settings.minigames?<LicenseQuiz kind="driving" onResult={onResult} disabled={!available}/>:<button className="full-button" disabled={!available} onClick={resolveFromSkill}>Resolve test from character skill</button>}
    <p className="muted">This uses Everthread’s existing fictional, safety-oriented licence check. Loomline does not store a separate licence state.</p>
  </>;
}

export function MotorsLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneMotorsActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='motors.catalog')return <VehicleCatalogue state={state} financingOnly={false} onResult={onResult}/>;
  if(actionId==='motors.finance')return <VehicleCatalogue state={state} financingOnly onResult={onResult}/>;
  if(actionId==='motors.owned')return <VehicleGarage state={state} onResult={onResult}/>;
  if(actionId==='license.driving')return <DrivingLicence state={state} onResult={onResult}/>;
  return <p className="empty-card"><EverthreadIcon name="car" size={18}/> This Loomline service is unavailable.</p>;
}
