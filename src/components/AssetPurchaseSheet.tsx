import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { gameEngine } from '../stores/gameStore';
import { exactMoney, formatMoney } from '../core/format';
import { getAssetFinanceOffers } from '../systems/AssetFinancingSystem';
import { getCreditProfile } from '../systems/CreditSystem';

export interface AssetPurchaseTarget {
  kind:'home'|'vehicle';
  typeId:string;
  name:string;
  price:number;
  financeEligible?:boolean;
}

const money=(value:number)=>formatMoney(Math.max(0,value));
const pct=(value:number)=>`${(value*100).toFixed(value*100%1?1:0)}%`;
const downChoices=[.1,.2,.35,.5];

export function AssetPurchaseSheet({state,target,onResult,onClose}:{state:GameState;target:AssetPurchaseTarget;onResult:(result:EngineResult)=>void;onClose:()=>void}){
  const financingAllowed=target.financeEligible!==false;
  const[mode,setMode]=useState<'outright'|'finance'>(financingAllowed?'finance':'outright');
  const[downPaymentRate,setDownPaymentRate]=useState(.2);
  const profile=getCreditProfile(state);
  const offers=getAssetFinanceOffers(state,{kind:target.kind,price:target.price,downPaymentRate});
  const purchaseOutright=()=>{const result=target.kind==='home'?gameEngine.purchaseProperty(target.typeId,false):gameEngine.purchaseVehicle(target.typeId);onResult(result);if(result.success)onClose();};
  const finance=(offerId:string)=>{const result=target.kind==='home'?gameEngine.financeProperty(target.typeId,offerId,downPaymentRate):gameEngine.financeVehicle(target.typeId,offerId,downPaymentRate);onResult(result);if(result.success)onClose();};
  return <div className="sheet-backdrop asset-finance-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="bottom-sheet bottom-sheet--wide asset-finance-sheet" role="dialog" aria-modal="true" aria-label={`Purchase ${target.name}`}>
      <header className="sheet-header"><span className="sheet-handle"/><h2>{target.name}</h2><button className="icon-button" onClick={onClose} aria-label="Close purchase options">×</button></header>
      <div className="sheet-body asset-finance-body">
        <section className="hero-card asset-finance-summary"><p className="eyebrow">{target.kind==='home'?'Home purchase':'Vehicle purchase'}</p><h2 title={exactMoney(target.price)}>{money(target.price)}</h2><p>Choose cash or compare installment offers. Revolving Credit Available is borrowing capacity for cards and is not cash for this purchase.</p></section>
        <div className="segmented"><button className={mode==='outright'?'active':''} onClick={()=>setMode('outright')}>Buy Outright</button><button className={mode==='finance'?'active':''} disabled={!financingAllowed} onClick={()=>setMode('finance')}>{financingAllowed?'Finance':'Finance unavailable'}</button></div>
        {!financingAllowed&&<p className="muted asset-finance-restriction">This financing marketplace currently covers homes, cars, and motorcycles. Specialized boat and aircraft financing will use separate lender rules in a later slice.</p>}{mode==='outright'?<section className="action-card asset-finance-outright"><h3>Pay in full</h3><div className="history-line"><span>Cash price</span><strong>{money(target.price)}</strong></div><div className="history-line"><span>Cash available</span><strong>{money(state.finances.cash)}</strong></div><p className="muted">No lender, inquiry, APR, or installment liability is created.</p><button className="full-button" disabled={state.finances.cash<target.price} onClick={purchaseOutright}>{state.finances.cash>=target.price?'Buy outright':`Need ${money(target.price-state.finances.cash)} more cash`}</button></section>:<>
          <section className="action-card asset-finance-controls"><div className="section-heading"><div><p className="eyebrow">Down payment</p><h3>{Math.round(downPaymentRate*100)}% · {money(target.price*downPaymentRate)}</h3></div><strong>{profile.score}<small>{profile.rating}</small></strong></div><div className="segmented segmented--scroll">{downChoices.map(rate=><button key={rate} className={downPaymentRate===rate?'active':''} onClick={()=>setDownPaymentRate(rate)}>{Math.round(rate*100)}%</button>)}</div><p className="muted">Browsing these estimates does not create an inquiry. Signing an approved contract does.</p></section>
          <div className="asset-finance-offers">{offers.map(offer=><section className={`asset-finance-offer ${offer.eligible?'eligible':'declined'}`} key={offer.id}><div className="section-heading"><div><p className="eyebrow">{offer.institutionName}</p><h3>{offer.program.name}</h3></div><strong>{pct(offer.annualRate)}<small>APR</small></strong></div><div className="finance-grid asset-finance-metrics"><div><small>Down payment</small><strong>{money(offer.downPayment)}</strong></div><div><small>Amount financed</small><strong>{money(offer.amountFinanced)}</strong></div><div><small>Term</small><strong>{offer.termYears} years</strong></div><div><small>Annual payment</small><strong>{money(offer.annualPayment)}</strong></div><div><small>Monthly equivalent</small><strong>{money(offer.monthlyEquivalent)}</strong></div><div><small>Total if held to term</small><strong>{money(offer.totalFinancingCost)}</strong></div></div><p className="muted">Estimated finance charge over the full term: {money(offer.financeCharge)}. Total shown includes the down payment plus all scheduled financing payments.</p>{offer.eligible?<><p className="banking-approved">Estimated approval under your current credit, income, debt, cash, and down-payment profile.</p><p className="muted">Projected annual debt/ownership burden: {Math.round(offer.projectedPaymentToIncome*100)}% of income. Annual auto-pay starts on and can be changed later in Credit & Banking → Bills & Payments.</p><button className="full-button" onClick={()=>finance(offer.id)}>Sign this financing contract</button></>:<p className="banking-declined">Declined: {offer.reason}</p>}</section>)}</div>
        </>}
      </div>
    </section>
  </div>;
}
