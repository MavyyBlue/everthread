import type { EngineResult, GameState, Loan } from '../types/game';
import { roundMoney } from '../core/math';
import { creditInstitutionById } from '../data/creditInstitutions';
import { ensureCreditState, payCreditCard } from './CreditSystem';
import { getSecuredLoanStatus, paySecuredLoanBill, scheduledLoanPaymentAmount } from './FinanceSystem';

export type PaymentObligationKind='credit_card'|'mortgage'|'vehicle';

export interface PaymentObligation {
  id:string;
  kind:PaymentObligationKind;
  sourceId:string;
  title:string;
  subtitle:string;
  balance:number;
  dueNow:number;
  pastDue:number;
  autoPay:boolean;
  status:'current'|'past_due'|'paid_ahead';
  consequence?:'foreclosure'|'repossession';
}

function creditObligationId(accountId:string){return`credit:${accountId}`;}
function loanObligationId(loanId:string){return`loan:${loanId}`;}

function currentCardDue(minimumDue:number,payments:number,balance:number){return roundMoney(Math.min(Math.max(0,balance),Math.max(0,minimumDue-payments)));}

function securedLoanTitle(loan:Loan){return loan.kind==='mortgage'?'Home financing':'Vehicle financing';}

export function getPaymentObligations(state:GameState):PaymentObligation[]{
  const cards=ensureCreditState(state).accounts.filter(account=>account.status==='open'&&account.balance>.5).map(account=>{
    const institution=creditInstitutionById[account.institutionId]?.name??account.institutionId;
    const dueNow=currentCardDue(account.minimumDue,account.paymentsTowardStatement,account.balance);
    const pastDue=roundMoney(Math.min(account.balance,Math.max(0,account.pastDueAmount??0)));
    return{id:creditObligationId(account.id),kind:'credit_card' as const,sourceId:account.id,title:account.productName,subtitle:`${institution} · minimum payment`,balance:roundMoney(account.balance),dueNow,pastDue,autoPay:account.autoPay!==false,status:pastDue>.5?'past_due' as const:'current' as const};
  });
  const secured=state.finances.liabilities.filter(loan=>loan.kind==='mortgage'||loan.kind==='car').map(loan=>{
    const detail=getSecuredLoanStatus(state,loan)!;const paidAhead=Number.isFinite(loan.prepaidThroughAge)&&Number(loan.prepaidThroughAge)>=state.character.age+1;
    const dueNow=detail.status==='delinquent'?roundMoney(Math.min(detail.arrears,loan.balance)):paidAhead?0:scheduledLoanPaymentAmount(loan);
    return{id:loanObligationId(loan.id),kind:loan.kind==='mortgage'?'mortgage' as const:'vehicle' as const,sourceId:loan.id,title:detail.collateralName,subtitle:`${securedLoanTitle(loan)} · ${(loan.annualRate*100).toFixed(1)}% APR`,balance:roundMoney(loan.balance),dueNow,pastDue:detail.status==='delinquent'?roundMoney(detail.arrears):0,autoPay:loan.autoPay!==false,status:detail.status==='delinquent'?'past_due' as const:paidAhead?'paid_ahead' as const:'current' as const,consequence:detail.consequence};
  });
  return[...secured,...cards].sort((a,b)=>Number(b.status==='past_due')-Number(a.status==='past_due')||b.dueNow-a.dueNow||a.title.localeCompare(b.title));
}

export function paymentSummary(state:GameState){const obligations=getPaymentObligations(state);return{obligations,dueNow:roundMoney(obligations.reduce((sum,item)=>sum+item.dueNow,0)),pastDue:roundMoney(obligations.reduce((sum,item)=>sum+item.pastDue,0)),autoPayCount:obligations.filter(item=>item.autoPay).length};}

export function setPaymentAutoPay(state:GameState,obligationId:string,enabled:boolean):EngineResult{
  if(obligationId.startsWith('credit:')){const id=obligationId.slice(7);const account=ensureCreditState(state).accounts.find(item=>item.id===id&&item.status==='open');if(!account)return{success:false,messages:[{text:'That credit-card bill is no longer active.'}]};account.autoPay=enabled;return{success:true,stateChanges:['paymentPreference'],messages:[{text:`Annual minimum-payment auto-pay is now ${enabled?'on':'off'} for ${account.productName}.`}]};}
  if(obligationId.startsWith('loan:')){const id=obligationId.slice(5);const loan=state.finances.liabilities.find(item=>item.id===id&&(item.kind==='mortgage'||item.kind==='car'));if(!loan)return{success:false,messages:[{text:'That financing bill is no longer active.'}]};loan.autoPay=enabled;const collateral=getSecuredLoanStatus(state,loan)?.collateralName??'this financed asset';return{success:true,stateChanges:['paymentPreference'],messages:[{text:`Annual auto-pay is now ${enabled?'on':'off'} for ${collateral}.`}]};}
  return{success:false,messages:[{text:'That payment obligation is not available.'}]};
}

export function payPaymentObligation(state:GameState,obligationId:string):EngineResult{
  const obligation=getPaymentObligations(state).find(item=>item.id===obligationId);if(!obligation)return{success:false,messages:[{text:'That bill is no longer due.'}]};const paymentAmount=obligation.status==='past_due'?obligation.pastDue:obligation.dueNow;if(paymentAmount<=.5)return{success:false,messages:[{text:'There is no payment currently due on this bill.'}]};
  if(state.finances.cash+0.001<paymentAmount)return{success:false,messages:[{text:`You need ${Math.round(paymentAmount).toLocaleString()} cash to pay this ${obligation.status==='past_due'?'past-due amount':'bill'}.`}]};
  if(obligation.kind==='credit_card')return payCreditCard(state,obligation.sourceId,paymentAmount);
  return paySecuredLoanBill(state,obligation.sourceId);
}

export function migratePaymentState(state:GameState){
  for(const loan of state.finances?.liabilities??[]){if(loan.kind!=='mortgage'&&loan.kind!=='car')continue;loan.autoPay=loan.autoPay!==false;if(!Number.isFinite(loan.prepaidThroughAge))delete loan.prepaidThroughAge;else loan.prepaidThroughAge=Math.floor(Number(loan.prepaidThroughAge));}
  for(const account of ensureCreditState(state).accounts){account.autoPay=account.autoPay!==false;account.pastDueAmount=roundMoney(Math.min(Math.max(0,account.balance),Math.max(0,account.pastDueAmount??0)));}
}
