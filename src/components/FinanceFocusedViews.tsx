import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { gameEngine } from '../stores/gameStore';
import { assetValue, getSecuredLoanStatus, liabilityValue } from '../systems/FinanceSystem';
import { portfolioValue } from '../systems/InvestmentSystem';
import { securities } from '../data/assets';
import { exactMoney, formatMoney } from '../core/format';

export function MoneySummaryView({state}:{state:GameState}){
  const portfolio=portfolioValue(state);
  const creditDebt=state.finances.credit.accounts.filter(account=>account.status==='open'&&account.balance>0);
  return <>
    <div className="finance-grid">
      <div title={exactMoney(state.finances.cash)}><small>Cash</small><strong>{formatMoney(state.finances.cash)}</strong></div>
      <div title={exactMoney(assetValue(state))}><small>Assets</small><strong>{formatMoney(assetValue(state))}</strong></div>
      <div title={exactMoney(liabilityValue(state))}><small>Debt</small><strong>{formatMoney(liabilityValue(state))}</strong></div>
      <div title={exactMoney(portfolio)}><small>Portfolio</small><strong>{formatMoney(portfolio)}</strong></div>
    </div>
    {state.finances.lastYearSummary&&<section className="action-card"><p className="eyebrow">Last year</p><h2>Financial summary</h2>{Object.entries(state.finances.lastYearSummary).map(([key,value])=><p className="history-line" key={key}><span>{key.replace(/([A-Z])/g,' $1')}</span><strong title={exactMoney(value)}>{formatMoney(value)}</strong></p>)}</section>}
    <section className="action-card"><h2>Liabilities</h2>{state.finances.liabilities.length||creditDebt.length?<>{state.finances.liabilities.map(liability=>{const secured=getSecuredLoanStatus(state,liability);return <div className={`liability-card${secured?.status==='delinquent'?' liability-card--danger':''}`} key={liability.id}><div className="liability-card__main"><span>{liability.kind} · {Math.round(liability.annualRate*1000)/10}%<small>{formatMoney(liability.annualPayment)}/yr · {liability.remainingYears} yr remaining{secured?` · ${secured.collateralName}`:''}</small>{secured?.status==='delinquent'&&<em>{formatMoney(secured.arrears)} past due · {secured.consequence} risk</em>}</span><strong title={exactMoney(liability.balance)}>{formatMoney(liability.balance)}</strong></div></div>})}{creditDebt.map(account=><p className="history-line" key={account.id}><span>credit card · {Math.round(account.annualRate*1000)/10}%<small>{account.productName}{(account.pastDueAmount??0)>0?` · ${formatMoney(account.pastDueAmount??0)} past due`:''}</small></span><strong title={exactMoney(account.balance)}>{formatMoney(account.balance)}</strong></p>)}<p className="muted asset-payment-note">Required payments and auto-pay preferences are managed from Bills & Payments.</p></>:<p className="muted">No debt.</p>}</section>
  </>;
}

export function InvestmentMarketView({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const[amount,setAmount]=useState(1000);
  if(state.character.age<18)return <section className="hero-card"><p className="eyebrow">Locked</p><h2>Investing unlocks at 18</h2><p>Your childhood finances are managed as dependent finances. Market trading becomes available when you reach adulthood.</p></section>;
  return <>
    <section className="hero-card"><p className="eyebrow">Market regime</p><h2>{state.investments.marketRegime}</h2><p>All securities are fictional. Prices are generated from your save seed and evolve only inside the game.</p></section>
    <label className="form-field"><span>Trade amount</span><input type="number" min="10" step="100" value={amount} onChange={event=>setAmount(Number(event.target.value)||0)}/></label>
    <div className="stack">{securities.map(security=>{const price=state.investments.prices[security.id]??security.basePrice;const position=state.investments.positions.find(item=>item.securityId===security.id);return <div className="market-card" key={security.id}><div><strong>{security.ticker} · {security.name}</strong><small>{security.type} · {price.toFixed(2)}{position?` · you own ${formatMoney(position.units*price)}`:''}</small></div><div className="button-row"><button onClick={()=>onResult(gameEngine.invest(security.id,amount))}>Buy</button>{position&&<button onClick={()=>onResult(gameEngine.sellInvestment(security.id))}>Sell all</button>}</div></div>})}</div>
  </>;
}
