import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { gameEngine } from '../stores/gameStore';
import { creditCardProductById, creditInstitutionById } from '../data/creditInstitutions';
import { assetFinanceProgramById } from '../data/assetFinancing';
import { creditAvailable, getCreditOffers, getCreditProfile, getCreditTransactionHistory } from '../systems/CreditSystem';
import { paymentSummary } from '../systems/PaymentSystem';
import { getBankruptcyDecision, getPersonalLoanOffers } from '../systems/PersonalBorrowingSystem';
import { personalLoanProductById } from '../data/personalLoans';
import { exactMoney, formatMoney } from '../core/format';

const money=(value:number)=>formatMoney(Math.max(0,value));
const pct=(value:number)=>`${(value*100).toFixed(value*100%1?1:0)}%`;

export function CreditBankingPanel({state,onResult,onClose}:{state:GameState;onResult:(result:EngineResult)=>void;onClose:()=>void}){
  const hasAccounts=state.finances.credit.accounts.some(account=>account.status==='open');
  const[tab,setTab]=useState<'overview'|'accounts'|'offers'|'borrowing'|'history'>(hasAccounts?'overview':'offers');
  const[selectedProductId,setSelectedProductId]=useState<string>();
  const[selectedAccountId,setSelectedAccountId]=useState<string>();
  const[showPayments,setShowPayments]=useState(false);
  const[amount,setAmount]=useState(50);
  const profile=getCreditProfile(state);const offers=getCreditOffers(state);const selectedOffer=selectedProductId?offers.find(offer=>offer.product.id===selectedProductId):undefined;
  const openAccounts=state.finances.credit.accounts.filter(account=>account.status==='open');const selectedAccount=selectedAccountId?openAccounts.find(account=>account.id===selectedAccountId):undefined;
  const transactionHistory=getCreditTransactionHistory(state);
  const currentTransactions=transactionHistory.current;
  const olderTransactions=transactionHistory.older;
  const apply=()=>{if(!selectedOffer)return;const result=gameEngine.applyForCreditCard(selectedOffer.product.id);onResult(result);if(result.success){setSelectedProductId(undefined);setTab('accounts');}};
  const doPayment=()=>{if(!selectedAccount)return;const result=gameEngine.payCreditCard(selectedAccount.id,amount);onResult(result);};
  const doPurchase=()=>{if(!selectedAccount)return;const result=gameEngine.chargeCreditCard(selectedAccount.id,amount);onResult(result);};
  const doClose=()=>{if(!selectedAccount)return;const result=gameEngine.closeCreditCard(selectedAccount.id);onResult(result);if(result.success)setSelectedAccountId(undefined);};

  return <div className="sheet-backdrop banking-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="bottom-sheet bottom-sheet--wide banking-sheet" role="dialog" aria-modal="true" aria-label="Credit and banking">
      <header className="sheet-header"><span className="sheet-handle"/><h2>Credit & Banking</h2><button className="icon-button banking-close" onClick={onClose} aria-label="Close credit and banking">×</button></header>
      <div className="sheet-body">
        {showPayments?<PaymentsView state={state} onResult={onResult} onBack={()=>setShowPayments(false)}/>:selectedOffer?<ContractView state={state} offer={selectedOffer} onBack={()=>setSelectedProductId(undefined)} onApply={apply}/>:selectedAccount?<AccountView state={state} account={selectedAccount} amount={amount} setAmount={setAmount} onBack={()=>setSelectedAccountId(undefined)} onPayment={doPayment} onPurchase={doPurchase} onCloseAccount={doClose}/>:<>
          <div className="segmented segmented--scroll banking-tabs">
            <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Overview</button>
            <button className={tab==='accounts'?'active':''} onClick={()=>setTab('accounts')}>Accounts</button>
            <button className={tab==='offers'?'active':''} onClick={()=>setTab('offers')}>Offers</button>
            <button className={tab==='borrowing'?'active':''} onClick={()=>setTab('borrowing')}>Borrowing</button>
            <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button>
          </div>
          {tab==='overview'&&<Overview state={state} profile={profile} onOpenPayments={()=>setShowPayments(true)}/>}
          {tab==='accounts'&&<Accounts state={state} onOpen={setSelectedAccountId}/>}
          {tab==='offers'&&<Offers offers={offers} onOpen={setSelectedProductId}/>}
          {tab==='borrowing'&&<Borrowing state={state} onResult={onResult}/>}
          {tab==='history'&&<History state={state} current={currentTransactions} older={olderTransactions}/>}
        </>}
      </div>
    </section>
  </div>;
}

function Overview({state,profile,onOpenPayments}:{state:GameState;profile:ReturnType<typeof getCreditProfile>;onOpenPayments:()=>void}){
  const payments=paymentSummary(state);const activeBills=payments.obligations.length;
  return <>
    <section className="banking-score-card"><div><p className="eyebrow">Your credit</p><h3>{profile.rating}</h3><strong>{profile.score}</strong><small>Game credit score</small></div><div className="banking-score-meter"><span style={{width:`${Math.max(0,Math.min(100,(profile.score-300)/5.5))}%`}}/></div></section>
    <div className="finance-grid banking-metrics"><div><small>Available credit</small><strong title={exactMoney(profile.availableCredit)}>{money(profile.availableCredit)}</strong></div><div><small>Total balance</small><strong title={exactMoney(profile.totalBalance)}>{money(profile.totalBalance)}</strong></div><div><small>Utilization</small><strong>{Math.round(profile.utilization)}%</strong></div><div><small>Recent inquiries</small><strong>{profile.recentInquiries}</strong></div><div><small>Payment reliability</small><strong>{Math.round(profile.paymentReliability)}%</strong></div><div><small>Oldest history</small><strong>{profile.oldestAccountYears} yr</strong></div></div>
    <button className={`banking-payment-summary${payments.pastDue>0?' banking-payment-summary--danger':''}`} onClick={onOpenPayments}>
      <span><small>Bills & Payments</small><strong>{activeBills?`${activeBills} active obligation${activeBills===1?'':'s'}`:'Nothing due'}</strong><em>{payments.pastDue>0?`${money(payments.pastDue)} past due`:`${payments.autoPayCount} on annual auto-pay`}</em></span>
      <b>{payments.dueNow>0?money(payments.dueNow):'View'}</b>
    </button>
    <section className="action-card"><h3>What is affecting your credit</h3>{profile.factors.map((factor,index)=><p className="banking-factor" key={`${index}-${factor}`}>{factor}</p>)}</section>
  </>;
}

function PaymentsView({state,onResult,onBack}:{state:GameState;onResult:(result:EngineResult)=>void;onBack:()=>void}){
  const summary=paymentSummary(state);
  const pay=(id:string)=>onResult(gameEngine.payPaymentObligation(id));
  const toggle=(id:string,value:boolean)=>onResult(gameEngine.setPaymentAutoPay(id,value));
  return <>
    <button className="banking-back-button" onClick={onBack}>← Back to overview</button>
    <section className="hero-card banking-payments-hero"><p className="eyebrow">Bills & Payments</p><h2>{summary.pastDue>0?`${money(summary.pastDue)} past due`:`${money(summary.dueNow)} due`}</h2><p>Manage annual minimum card payments, personal loans, and financed home or vehicle bills here. Auto-pay uses available cash when you Age Up.</p></section>
    <div className="finance-grid banking-payment-metrics"><div><small>Cash available</small><strong title={exactMoney(state.finances.cash)}>{money(state.finances.cash)}</strong></div><div><small>Total due</small><strong>{money(summary.dueNow)}</strong></div><div><small>Past due</small><strong>{money(summary.pastDue)}</strong></div><div><small>Auto-pay on</small><strong>{summary.autoPayCount}/{summary.obligations.length}</strong></div></div>
    {summary.obligations.length?<div className="banking-obligation-list">{summary.obligations.map(item=><section className={`banking-obligation-card${item.status==='past_due'?' banking-obligation-card--danger':''}`} key={item.id}>
      <div className="banking-obligation-heading"><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><b>{money(item.balance)}</b></div>
      <div className="banking-obligation-status"><span><small>{item.status==='past_due'?'Past due':item.status==='paid_ahead'?'Next annual bill':'Due now'}</small><strong>{item.status==='paid_ahead'?'Paid ahead':item.dueNow>0?money(item.dueNow):'Nothing due'}</strong></span>{item.status==='past_due'&&item.consequence&&<em>Pay before the next Age Up to avoid {item.consequence}.</em>}</div>
      <div className="banking-obligation-actions"><button className={`autopay-switch${item.autoPay?' active':''}`} role="switch" aria-checked={item.autoPay} onClick={()=>toggle(item.id,!item.autoPay)}><span/><b>Annual auto-pay {item.autoPay?'On':'Off'}</b></button><button className="secondary-button" disabled={(item.status==='past_due'?item.pastDue:item.dueNow)<=.5||state.finances.cash+0.001<(item.status==='past_due'?item.pastDue:item.dueNow)} onClick={()=>pay(item.id)}>{item.status==='past_due'?'Pay past due':'Pay bill'}</button></div>
    </section>)}</div>:<section className="action-card"><h3>No active bills</h3><p className="muted">Personal loans, financed homes, financed vehicles, and credit-card balances will appear here when they have an active obligation.</p></section>}
    <p className="muted banking-note">For credit cards, annual auto-pay covers the required minimum, not the full balance. You can still make an extra or full payment from the individual account screen.</p>
  </>;
}

function Accounts({state,onOpen}:{state:GameState;onOpen:(id:string)=>void}){
  const open=state.finances.credit.accounts.filter(account=>account.status==='open');
  return <><section className="hero-card banking-intro"><p className="eyebrow">Borrowing capacity</p><h2>{money(creditAvailable(state))} available</h2><p>Credit is borrowed money, not cash or net worth. Card balances become liabilities until you repay them.</p></section>{open.length?<div className="stack banking-account-list">{open.map(account=>{const institution=creditInstitutionById[account.institutionId]?.name??account.institutionId;const available=Math.max(0,account.creditLimit-account.balance);return <button className="banking-account-card" key={account.id} onClick={()=>onOpen(account.id)}><span><strong>{account.productName}</strong><small>{institution}</small><em>{money(account.balance)} balance · {money(available)} available</em></span><b>{pct(account.annualRate)} APR</b></button>})}</div>:<section className="hero-card banking-intro"><h2>No open credit accounts</h2><p>Visit Offers to compare starter and established-credit products.</p></section>}</>;
}

function Offers({offers,onOpen}:{offers:ReturnType<typeof getCreditOffers>;onOpen:(id:string)=>void}){
  return <><section className="hero-card banking-intro"><p className="eyebrow">Marketplace</p><h2>Compare before you apply</h2><p>Browsing is harmless. A formal application creates a recent inquiry and can affect future underwriting.</p></section>{!offers.length&&<section className="action-card"><h3>No credit offers yet</h3><p className="muted">Starter credit products begin appearing at age 16.</p></section>}<div className="banking-offer-list">{offers.map(offer=><button className={`banking-offer-card ${offer.eligible?'eligible':'locked'}`} key={offer.product.id} onClick={()=>onOpen(offer.product.id)}><div><strong>{offer.institutionName}</strong><h3>{offer.product.name}</h3><small>{offer.statusLabel}</small></div><div className="banking-offer-metrics"><span><small>Starting line</small><strong>{money(offer.startingLimit)}</strong></span><span><small>APR</small><strong>{pct(offer.product.annualRate)}</strong></span><span><small>Deposit</small><strong>{offer.product.depositRequired?money(offer.product.depositRequired):'None'}</strong></span></div></button>)}</div></>;
}

function ContractView({state,offer,onBack,onApply}:{state:GameState;offer:ReturnType<typeof getCreditOffers>[number];onBack:()=>void;onApply:()=>void}){
  const product=offer.product;const institution=creditInstitutionById[product.institutionId];
  return <><button className="banking-back-button" onClick={onBack}>← Back to offers</button><section className="hero-card banking-contract"><p className="eyebrow">Credit agreement</p><h2>{institution?.name}</h2><h3>{product.name}</h3><p>{institution?.description}</p></section><div className="finance-grid banking-contract-grid"><div><small>Starting credit line</small><strong>{money(offer.startingLimit)}</strong></div><div><small>Purchase APR</small><strong>{pct(product.annualRate)}</strong></div><div><small>Annual fee</small><strong>{product.annualFee?money(product.annualFee):'None'}</strong></div><div><small>Late fee</small><strong>{money(product.lateFee)}</strong></div><div><small>Security deposit</small><strong>{product.depositRequired?money(product.depositRequired):'None'}</strong></div><div><small>Minimum payment</small><strong>5% or 25</strong></div></div><section className="action-card"><h3>Payment default</h3><p>Annual minimum-payment auto-pay starts on. You can turn it off later from Bills & Payments.</p></section><section className="action-card"><h3>Underwriting</h3><p className={offer.eligible?'banking-approved':'banking-declined'}>{offer.eligible?'You currently meet this product’s visible requirements. Final acceptance creates a formal inquiry.':offer.reason}</p>{product.depositRequired>0&&<p className="muted">A secured deposit is refundable and remains part of your net worth while the account is open.</p>}</section><button className="full-button" disabled={!offer.eligible||state.character.age<product.minAge} onClick={onApply}>{offer.eligible?'Accept & apply':'Requirements not met'}</button></>;
}

function AccountView({state,account,amount,setAmount,onBack,onPayment,onPurchase,onCloseAccount}:{state:GameState;account:GameState['finances']['credit']['accounts'][number];amount:number;setAmount:(value:number)=>void;onBack:()=>void;onPayment:()=>void;onPurchase:()=>void;onCloseAccount:()=>void}){
  const institution=creditInstitutionById[account.institutionId];const available=Math.max(0,account.creditLimit-account.balance);
  return <><button className="banking-back-button" onClick={onBack}>← Back to accounts</button><section className="hero-card banking-contract"><p className="eyebrow">{institution?.name}</p><h2>{account.productName}</h2><div className="banking-account-balance"><strong>{money(account.balance)}</strong><small>of {money(account.creditLimit)} used</small></div></section><div className="finance-grid banking-contract-grid"><div><small>Available</small><strong>{money(available)}</strong></div><div><small>APR</small><strong>{pct(account.annualRate)}</strong></div><div><small>Statement balance</small><strong>{money(account.statementBalance)}</strong></div><div><small>Minimum due</small><strong>{money(account.minimumDue)}</strong></div><div><small>Past due</small><strong>{money(account.pastDueAmount??0)}</strong></div><div><small>Auto-pay</small><strong>{account.autoPay===false?'Off':'On'}</strong></div><div><small>Paid toward statement</small><strong>{money(account.paymentsTowardStatement)}</strong></div><div><small>Secured deposit</small><strong>{account.securedDeposit?money(account.securedDeposit):'None'}</strong></div></div><label className="form-field banking-amount"><span>Amount</span><input type="number" min="1" step="25" value={amount} onChange={event=>setAmount(Number(event.target.value)||0)}/></label><div className="button-row"><button disabled={amount<=0||amount>available} onClick={onPurchase}>Charge purchase</button><button disabled={amount<=0||account.balance<=0||state.finances.cash<=0} onClick={onPayment}>Extra payment</button></div><p className="muted banking-note">Required bills and annual auto-pay live in Bills & Payments. Extra payment here lets you reduce or clear the card balance early.</p><button className="secondary-button danger-soft banking-close-account" disabled={account.balance>.5} onClick={onCloseAccount}>Close account{account.balance>.5?' (pay balance first)':''}</button></>;
}

function Borrowing({state,onResult}:{state:GameState;onResult:(result:EngineResult)=>void}){
  const offers=getPersonalLoanOffers(state);const bankruptcy=getBankruptcyDecision(state);const[amounts,setAmounts]=useState<Record<string,number>>({});const[confirmBankruptcy,setConfirmBankruptcy]=useState(false);const personal=state.finances.liabilities.filter(loan=>loan.kind==='personal'&&loan.balance>.5);
  const apply=(productId:string,min:number,max:number)=>{const amount=Math.max(min,Math.min(max,amounts[productId]??min));onResult(gameEngine.applyForPersonalLoan(productId,amount));};
  return <><section className="hero-card banking-intro"><p className="eyebrow">Personal borrowing</p><h2>Loans with consequences</h2><p>Compare without penalty. Applying creates a formal inquiry; borrowed cash becomes a real liability with annual payments.</p></section>
    {personal.length>0&&<section className="action-card"><h3>Current unsecured debt</h3>{personal.map(loan=><p className="history-line" key={loan.id}><span>{loan.productId?personalLoanProductById[loan.productId]?.name??'Personal loan':loan.origin==='deficiency'?'Deficiency debt':loan.origin==='hardship'?'Hardship debt':'Personal debt'}<small>{pct(loan.annualRate)} APR · {loan.delinquency?.status==='delinquent'?`${money(loan.delinquency.arrears)} past due`:`${money(loan.annualPayment)} annual payment`} · auto-pay ${loan.autoPay===false?'off':'on'}</small></span><strong>{money(loan.balance)}</strong></p>)}</section>}
    <div className="banking-offer-list">{offers.map(offer=><section className={`banking-offer-card ${offer.eligible?'eligible':'locked'}`} key={offer.product.id}><div><strong>{offer.institutionName}</strong><h3>{offer.product.name}</h3><small>{offer.eligible?`Prequalified up to ${money(offer.maxApproved)}`:offer.reason}</small></div><div className="banking-offer-metrics"><span><small>APR</small><strong>{pct(offer.rate)}</strong></span><span><small>Term</small><strong>{offer.product.termYears} yr</strong></span><span><small>Max</small><strong>{money(offer.maxApproved)}</strong></span></div>{offer.eligible&&<><label className="form-field banking-amount"><span>Borrow amount</span><input type="number" min={offer.product.minAmount} max={offer.maxApproved} step="100" value={amounts[offer.product.id]??offer.product.minAmount} onChange={event=>setAmounts(current=>({...current,[offer.product.id]:Number(event.target.value)||offer.product.minAmount}))}/></label><button className="full-button" onClick={()=>apply(offer.product.id,offer.product.minAmount,offer.maxApproved)}>Apply for loan</button></>}</section>)}</div>
    <section className="action-card"><p className="eyebrow">Last resort</p><h3>Bankruptcy</h3><p>Eligible unsecured personal and credit-card debt can be discharged. Mortgages, vehicle financing, and student debt survive. Bankruptcy creates a severe credit derogatory and restricts future borrowing for years.</p><div className="finance-grid banking-contract-grid"><div><small>Dischargeable</small><strong>{money(bankruptcy.dischargeableDebt)}</strong></div><div><small>Secured survives</small><strong>{money(bankruptcy.securedDebt)}</strong></div><div><small>Student survives</small><strong>{money(bankruptcy.studentDebt)}</strong></div></div>{!bankruptcy.eligible&&<p className="muted">{bankruptcy.reason}</p>}{bankruptcy.eligible&&!confirmBankruptcy&&<button className="secondary-button danger-soft" onClick={()=>setConfirmBankruptcy(true)}>Review bankruptcy filing</button>}{bankruptcy.eligible&&confirmBankruptcy&&<div className="stack"><p><strong>This cannot be undone.</strong> The filing will close/default eligible revolving accounts and discharge eligible personal debt while preserving non-dischargeable obligations.</p><div className="button-row"><button className="secondary-button" onClick={()=>setConfirmBankruptcy(false)}>Cancel</button><button className="danger-soft" onClick={()=>{onResult(gameEngine.fileVoluntaryBankruptcy());setConfirmBankruptcy(false);}}>File bankruptcy</button></div></div>}</section>
  </>;
}

function History({state,current,older}:{state:GameState;current:GameState['finances']['credit']['transactions'];older:GameState['finances']['credit']['transactions']}){
  const render=(items:typeof current)=>items.map(item=>{const account=state.finances.credit.accounts.find(candidate=>candidate.id===item.accountId);return <p className="history-line" key={item.id}><span>{item.description}<small>{account?.productName??'Credit account'} · age {item.age}</small></span><strong className={item.kind==='payment'||item.kind==='deposit_refund'?'banking-positive':''}>{item.kind==='payment'||item.kind==='deposit_refund'?'-':'+'}{money(item.amount)}</strong></p>});
  const inquiryName=(productId:string)=>creditCardProductById[productId]?.name??assetFinanceProgramById[productId]?.name??personalLoanProductById[productId]?.name??productId;
  return <><section className="action-card"><p className="eyebrow">{state.currentYear}</p><h2>Transactions this year</h2>{current.length?render(current):<p className="muted">No credit transactions have posted this year.</p>}</section>{older.length>0&&<section className="action-card"><h3>Recent prior activity</h3>{render(older)}</section>}<section className="action-card"><h3>Major credit history</h3>{state.finances.credit.derogatories.length?state.finances.credit.derogatories.slice(-12).reverse().map(item=><p className="history-line" key={item.id}><span>{item.summary}<small>Age {item.age} · {item.year}</small></span><strong>{item.kind.replaceAll('_',' ')}</strong></p>):<p className="muted">No major negative credit events recorded.</p>}</section><section className="action-card"><h3>Applications & financing</h3>{state.finances.credit.inquiries.length?state.finances.credit.inquiries.slice(-12).reverse().map(item=><p className="history-line" key={item.id}><span>{creditInstitutionById[item.institutionId]?.name??item.institutionId}<small>{inquiryName(item.productId)} · age {item.age} · {item.year}{item.reason?` · ${item.reason}`:''}</small></span><strong>{item.outcome}</strong></p>):<p className="muted">No formal credit applications or financing contracts yet.</p>}</section></>;
}
