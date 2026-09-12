import { countryById } from '../data/countries';
import type { EngineResult, GameState, Loan } from '../types/game';
import { clamp, roundMoney } from '../core/math';
import { makeStateId } from '../core/ids';
import { creditCardDebt, dischargeCreditForBankruptcy, processAnnualCredit, recordCreditDerogatory, securedCreditDeposits } from './CreditSystem';

export interface WealthBreakdown {
  cash:number;
  propertyGross:number;
  propertyEquity:number;
  vehicles:number;
  collectibles:number;
  investments:number;
  investmentCostBasis:number;
  investmentGain:number;
  businesses:number;
  mortgageDebt:number;
  securedCreditDeposits:number;
  creditCardDebt:number;
  otherLiabilities:number;
  liabilities:number;
  netWorth:number;
}

export function wealthBreakdown(state:GameState):WealthBreakdown {
  const propertyGross=state.assets.properties.reduce((sum,property)=>sum+property.marketValue,0);
  const mortgageByAsset=new Map(state.finances.liabilities.filter(loan=>loan.kind==='mortgage'&&loan.assetId).map(loan=>[loan.assetId!,loan.balance]));
  const propertyDebt=state.assets.properties.reduce((sum,property)=>sum+(mortgageByAsset.get(property.id)??0),0);
  const vehicles=state.assets.vehicles.reduce((sum,vehicle)=>sum+vehicle.value,0);
  const collectibles=state.assets.collectibles.reduce((sum,item)=>sum+item.estimatedValue,0);
  const investments=state.investments.positions.reduce((sum,position)=>sum+position.units*(state.investments.prices[position.securityId]??0),0);
  const investmentCostBasis=state.investments.positions.reduce((sum,position)=>sum+position.units*position.averageCost,0);
  const businesses=state.businesses.reduce((sum,business)=>sum+(business.bankrupt?0:business.valuation),0);
  const loanLiabilities=state.finances.liabilities.reduce((sum,loan)=>sum+loan.balance,0);
  const revolvingDebt=creditCardDebt(state);
  const deposits=securedCreditDeposits(state);
  const liabilities=loanLiabilities+revolvingDebt;
  const otherLiabilities=Math.max(0,liabilities-propertyDebt);
  const cash=state.finances.cash;
  return {
    cash,
    propertyGross,
    propertyEquity:propertyGross-propertyDebt,
    vehicles,
    collectibles,
    investments,
    investmentCostBasis,
    investmentGain:investments-investmentCostBasis,
    businesses,
    securedCreditDeposits:deposits,
    creditCardDebt:revolvingDebt,
    mortgageDebt:propertyDebt,
    otherLiabilities,
    liabilities,
    netWorth:roundMoney(cash+deposits+propertyGross+vehicles+collectibles+investments+businesses-liabilities),
  };
}

export function assetValue(state:GameState) {
  const breakdown=wealthBreakdown(state);
  return breakdown.securedCreditDeposits+breakdown.propertyGross+breakdown.vehicles+breakdown.collectibles+breakdown.investments+breakdown.businesses;
}
export function liabilityValue(state:GameState){return wealthBreakdown(state).liabilities;}
export function netWorth(state:GameState){return wealthBreakdown(state).netWorth;}

type SecuredLoanKind='mortgage'|'car';

export interface SecuredLoanStatus {
  loanId:string;
  kind:SecuredLoanKind;
  collateralName:string;
  collateralValue:number;
  status:'current'|'delinquent';
  arrears:number;
  missedPayments:number;
  lastMissedPaymentAge?:number;
  consequence:'foreclosure'|'repossession';
}

function isSecuredLoan(loan:Loan):loan is Loan&{kind:SecuredLoanKind}{return loan.kind==='mortgage'||loan.kind==='car';}

export function scheduledLoanPaymentAmount(loan:Loan){const interest=Math.max(0,loan.balance*loan.annualRate);return roundMoney(Math.min(Math.max(0,loan.balance+interest),Math.max(0,loan.annualPayment)));}

function readLoanDelinquency(loan:Loan){
  const raw=loan.delinquency;
  const arrears=roundMoney(Math.max(0,Number(raw?.arrears??0)));
  const missedPayments=Math.max(0,Math.floor(Number(raw?.missedPayments??0)));
  const status: 'current'|'delinquent'=arrears>.5&&missedPayments>0?'delinquent':'current';
  return{status,arrears,missedPayments,lastMissedPaymentAge:Number.isFinite(raw?.lastMissedPaymentAge)?Number(raw!.lastMissedPaymentAge):undefined};
}

function ensureLoanDelinquency(loan:Loan){
  const normalized=readLoanDelinquency(loan);
  loan.delinquency={status:normalized.status,arrears:normalized.arrears,missedPayments:normalized.missedPayments,...(normalized.lastMissedPaymentAge===undefined?{}:{lastMissedPaymentAge:normalized.lastMissedPaymentAge})};
  return loan.delinquency;
}

function collateralDetails(state:GameState,loan:Loan){
  if(loan.kind==='mortgage'){
    const property=state.assets.properties.find(item=>item.id===loan.assetId||item.mortgageId===loan.id);
    return{name:property?.name??'financed home',value:property?.marketValue??0};
  }
  if(loan.kind==='car'){
    const vehicle=state.assets.vehicles.find(item=>item.id===loan.assetId);
    return{name:vehicle?.name??'financed vehicle',value:vehicle?.value??0};
  }
  return{name:'loan',value:0};
}

export function getSecuredLoanStatus(state:GameState,loanOrId:Loan|string):SecuredLoanStatus|undefined{
  const loan=typeof loanOrId==='string'?state.finances.liabilities.find(item=>item.id===loanOrId):loanOrId;
  if(!loan||!isSecuredLoan(loan))return undefined;
  const delinquency=readLoanDelinquency(loan);const collateral=collateralDetails(state,loan);
  return{loanId:loan.id,kind:loan.kind,collateralName:collateral.name,collateralValue:collateral.value,status:delinquency.status,arrears:delinquency.arrears,missedPayments:delinquency.missedPayments,...(delinquency.lastMissedPaymentAge===undefined?{}:{lastMissedPaymentAge:delinquency.lastMissedPaymentAge}),consequence:loan.kind==='mortgage'?'foreclosure':'repossession'};
}

export function addUnsecuredDebt(state:GameState,rawAmount:number,origin:'hardship'|'deficiency'|'legacy'='hardship'){
  const amount=roundMoney(Math.max(0,rawAmount));if(amount<=.5)return 0;
  const existing=state.finances.liabilities.find(loan=>loan.kind==='personal'&&loan.origin!=='borrowed');
  if(existing){existing.principal=roundMoney(existing.principal+amount);existing.balance=roundMoney(existing.balance+amount);existing.annualPayment=Math.max(existing.annualPayment,Math.round(existing.balance*.16));existing.remainingYears=Math.max(existing.remainingYears,8);}
  else state.finances.liabilities.push({id:makeStateId(state,'loan'),kind:'personal',principal:amount,balance:amount,annualRate:.12,annualPayment:Math.max(1200,Math.round(amount*.16)),remainingYears:8,autoPay:true,origin});
  return amount;
}

export function payPersonalLoanBill(state:GameState,loanId:string):EngineResult{
  const loan=state.finances.liabilities.find(item=>item.id===loanId&&item.kind==='personal');if(!loan)return{success:false,messages:[{text:'That personal loan is no longer active.'}]};const delinquency=ensureLoanDelinquency(loan);const due=delinquency.status==='delinquent'?roundMoney(Math.min(loan.balance,delinquency.arrears)):scheduledLoanPaymentAmount(loan);if(due<=.5)return{success:false,messages:[{text:'This personal loan has no payment due.'}]};if(state.finances.cash+0.001<due)return{success:false,messages:[{text:`You need ${Math.round(due).toLocaleString()} cash to make this payment.`}]};state.finances.cash=roundMoney(state.finances.cash-due);loan.balance=roundMoney(Math.max(0,loan.balance-due));if(delinquency.status==='delinquent')loan.delinquency={status:'current',arrears:0,missedPayments:0};else{loan.prepaidThroughAge=state.character.age+1;loan.remainingYears=Math.max(0,loan.remainingYears-1);}if(loan.balance<=.5)state.finances.liabilities=state.finances.liabilities.filter(item=>item.id!==loan.id);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You paid ${Math.round(due).toLocaleString()} toward a personal loan.`,moneyDelta:-due});return{success:true,stateChanges:['cash','financingLiability'],messages:[{text:delinquency.status==='delinquent'?'Past-due personal loan cured.':'Personal-loan bill paid ahead for the next Age Up.'}]};
}

function missPersonalPayment(state:GameState,loan:Loan){const delinquency=ensureLoanDelinquency(loan);const payment=scheduledLoanPaymentAmount(loan);const misses=delinquency.status==='delinquent'?delinquency.missedPayments+1:1;const arrears=roundMoney(Math.min(loan.balance,delinquency.arrears+payment));loan.delinquency={status:'delinquent',arrears,missedPayments:misses,lastMissedPaymentAge:state.character.age};recordCreditDerogatory(state,misses>=3?'default':'missed_payment',misses>=3?68:32,`Missed personal-loan payment${misses>=3?'; account entered serious default':''}.`);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:misses>=3?3:2,text:`You missed a ${Math.round(payment).toLocaleString()} personal-loan payment. ${Math.round(arrears).toLocaleString()} is now past due.`});}

function clearPaidMortgageLinks(state:GameState){
  const active=new Set(state.finances.liabilities.filter(loan=>loan.kind==='mortgage').map(loan=>loan.id));
  for(const property of state.assets.properties)if(property.mortgageId&&!active.has(property.mortgageId))delete property.mortgageId;
}

export function cureSecuredLoan(state:GameState,loanId:string):EngineResult{
  const loan=state.finances.liabilities.find(item=>item.id===loanId);if(!loan||!isSecuredLoan(loan))return{success:false,messages:[{text:'That secured loan is no longer active.'}]};
  const delinquency=ensureLoanDelinquency(loan);if(delinquency.status!=='delinquent'||delinquency.arrears<=.5)return{success:false,messages:[{text:'This secured loan is current. There is no past-due payment to cure.'}]};
  const cureAmount=roundMoney(Math.min(delinquency.arrears,loan.balance));if(state.finances.cash+0.001<cureAmount)return{success:false,messages:[{text:`You need ${Math.round(cureAmount).toLocaleString()} cash to cure this past-due payment.`}]};
  state.finances.cash=roundMoney(state.finances.cash-cureAmount);loan.balance=roundMoney(Math.max(0,loan.balance-cureAmount));loan.remainingYears=Math.max(0,loan.remainingYears-1);loan.delinquency={status:'current',arrears:0,missedPayments:0};
  const collateral=collateralDetails(state,loan);if(loan.balance<=.5)state.finances.liabilities=state.finances.liabilities.filter(item=>item.id!==loan.id);clearPaidMortgageLinks(state);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You cured the past-due payment on ${collateral.name} for ${Math.round(cureAmount).toLocaleString()}.`,moneyDelta:-cureAmount,detail:'The secured loan returned to current status before collateral action.'});
  return{success:true,stateChanges:['cash','financingLiability'],messages:[{text:`Past-due payment cured. ${collateral.name} is no longer at immediate risk.`}]};
}

export function paySecuredLoanBill(state:GameState,loanId:string):EngineResult{
  const loan=state.finances.liabilities.find(item=>item.id===loanId);if(!loan||!isSecuredLoan(loan))return{success:false,messages:[{text:'That secured loan is no longer active.'}]};
  const delinquency=ensureLoanDelinquency(loan);if(delinquency.status==='delinquent')return cureSecuredLoan(state,loanId);
  const dueAge=state.character.age+1;if((loan.prepaidThroughAge??-1)>=dueAge)return{success:false,messages:[{text:'The next annual payment on this loan is already paid.'}]};
  const payment=scheduledLoanPaymentAmount(loan);if(payment<=.5)return{success:false,messages:[{text:'This loan has no scheduled payment due.'}]};if(state.finances.cash+0.001<payment)return{success:false,messages:[{text:`You need ${Math.round(payment).toLocaleString()} cash to pay this annual bill.`}]};
  const interest=roundMoney(Math.max(0,loan.balance*loan.annualRate));state.finances.cash=roundMoney(state.finances.cash-payment);loan.balance=roundMoney(Math.max(0,loan.balance+interest-payment));loan.remainingYears=Math.max(0,loan.remainingYears-1);loan.prepaidThroughAge=dueAge;loan.delinquency={status:'current',arrears:0,missedPayments:0};
  const collateral=collateralDetails(state,loan);if(loan.balance<=.5){state.finances.liabilities=state.finances.liabilities.filter(item=>item.id!==loan.id);clearPaidMortgageLinks(state);}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You paid the next annual financing bill on ${collateral.name} for ${Math.round(payment).toLocaleString()}.`,moneyDelta:-payment,detail:`The payment included ${Math.round(interest).toLocaleString()} of scheduled interest and is credited through age ${dueAge}.`});
  return{success:true,stateChanges:['cash','financingLiability'],messages:[{text:`Paid ${Math.round(payment).toLocaleString()} toward ${collateral.name}. The next Age Up will not charge this loan again.`}]};
}

function specialCareerIncome(state:GameState) {
  const sports=state.specialCareers.sports as Record<string,number|string|boolean>|undefined;
  const racing=state.specialCareers.racing as Record<string,number|string|boolean>|undefined;
  const military=state.specialCareers.military as Record<string,number|string|boolean>|undefined;
  const politics=state.specialCareers.politics as Record<string,number|string|boolean>|undefined;
  const royalty=state.specialCareers.royalty as Record<string,number|string|boolean>|undefined;
  let total=0;
  const completedSeasonSalary=Number(sports?.lastSeasonAge)===state.character.age?Number(sports?.seasonSalaryDue??0):0;
  if(completedSeasonSalary>0)total+=completedSeasonSalary;
  else if(sports?.active===true&&sports.pro===true)total+=Number(sports.salary??0);
  const completedRacingIncome=Number(racing?.lastSeasonAge)===state.character.age?Number(racing?.seasonSalaryDue??0)+Number(racing?.seasonPrizeDue??0):0;
  if(completedRacingIncome>0)total+=completedRacingIncome;
  if(military?.active===true){const rank=Number(military.rank??1);const officer=military.path==='officer';total+=Math.round((officer?52000:34000)+rank*(officer?11500:6500));}
  if(politics?.office){const office=Math.max(1,Math.min(5,Number(politics.office)));total+=[0,42000,78000,132000,210000,310000][office]!;}
  if(royalty?.active===true){const rank=Math.max(1,Number(royalty.rank??1));total+=Math.round(28000+rank*42000);}
  return Math.round(total*state.economy.salaryIndex);
}

function liquidateInvestmentsForDebt(state:GameState){
  const value=state.investments.positions.reduce((sum,pos)=>sum+pos.units*(state.investments.prices[pos.securityId]??0),0);
  if(value<=0)return 0;
  state.investments.positions=[];
  state.finances.cash+=value;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You liquidated investments worth ${Math.round(value).toLocaleString()} to cover serious financial pressure.`,moneyDelta:value});
  return value;
}

function payDownPersonalDebt(state:GameState,maxAmount=Number.POSITIVE_INFINITY){
  if(state.finances.cash<=0||maxAmount<=0)return 0;let remaining=Math.min(state.finances.cash,maxAmount);let paid=0;
  for(const loan of state.finances.liabilities.filter(l=>l.kind==='personal').sort((a,b)=>b.annualRate-a.annualRate)){
    if(state.finances.cash<=0||remaining<=0)break;
    const amount=Math.min(state.finances.cash,remaining,loan.balance);loan.balance=roundMoney(loan.balance-amount);state.finances.cash=roundMoney(state.finances.cash-amount);remaining=roundMoney(remaining-amount);paid=roundMoney(paid+amount);
  }
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.balance>.5);return paid;
}

function repossessVehicle(state:GameState,loan:Loan){
  const vehicle=state.assets.vehicles.find(item=>item.id===loan.assetId);
  const name=vehicle?.name??'financed vehicle';
  const recovery=roundMoney((vehicle?.value??0)*.82);
  const surplus=roundMoney(Math.max(0,recovery-loan.balance));
  const deficiency=roundMoney(Math.max(0,loan.balance-recovery));
  if(vehicle)state.assets.vehicles=state.assets.vehicles.filter(item=>item.id!==vehicle.id);
  state.finances.liabilities=state.finances.liabilities.filter(item=>item.id!==loan.id);
  if(surplus>0)state.finances.cash=roundMoney(state.finances.cash+surplus);
  if(deficiency>0)addUnsecuredDebt(state,deficiency,'deficiency');
  state.flags.repossessions=Number(state.flags.repossessions??0)+1;
  recordCreditDerogatory(state,'default',72,`Repossession of ${name}.`);
  state.character.stats.happiness=clamp(state.character.stats.happiness-9);
  state.character.secondary.reputation=clamp(state.character.secondary.reputation-4);
  state.character.secondary.stress=clamp(state.character.secondary.stress+12);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:3,text:`${name} was repossessed after its past-due payment was left unresolved.${deficiency>0?` ${Math.round(deficiency).toLocaleString()} remained as unsecured deficiency debt.`:surplus>0?` ${Math.round(surplus).toLocaleString()} of surplus value returned to you.`:''}`,moneyDelta:surplus,detail:`Repossession recovery ${Math.round(recovery).toLocaleString()} against ${Math.round(loan.balance).toLocaleString()} owed.`});
}

function forecloseProperty(state:GameState,loan:Loan){
  const property=state.assets.properties.find(item=>item.id===loan.assetId||item.mortgageId===loan.id);
  const name=property?.name??'financed home';
  const marketValue=property?.marketValue??0;
  const recovery=roundMoney(Math.max(0,marketValue-Math.round(marketValue*.08)));
  const residual=roundMoney(Math.max(0,recovery-loan.balance));
  const deficiency=roundMoney(Math.max(0,loan.balance-recovery));
  if(property)state.assets.properties=state.assets.properties.filter(item=>item.id!==property.id);
  state.finances.liabilities=state.finances.liabilities.filter(item=>item.id!==loan.id);
  let residualDebtPaid=0;if(residual>0){state.finances.cash=roundMoney(state.finances.cash+residual);residualDebtPaid=payDownPersonalDebt(state,residual);}
  const residualReturned=roundMoney(Math.max(0,residual-residualDebtPaid));
  if(deficiency>0)addUnsecuredDebt(state,deficiency,'deficiency');
  state.flags.foreclosures=Number(state.flags.foreclosures??0)+1;
  state.flags.mortgageMisses=0;
  recordCreditDerogatory(state,'foreclosure',80,`Foreclosure on ${name}.`);
  state.character.stats.happiness=clamp(state.character.stats.happiness-12);
  state.character.secondary.reputation=clamp(state.character.secondary.reputation-5);
  state.character.secondary.stress=clamp(state.character.secondary.stress+15);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:3,text:`You lost ${name} to foreclosure after leaving its past-due payment unresolved.${residual>0?` Remaining equity covered ${Math.round(residualDebtPaid).toLocaleString()} of existing unsecured debt${residualReturned>0?` and returned ${Math.round(residualReturned).toLocaleString()} to you`:''}.`:deficiency>0?` ${Math.round(deficiency).toLocaleString()} remained as unsecured deficiency debt.`:''}`,moneyDelta:residualReturned,detail:`Foreclosure recovery ${Math.round(recovery).toLocaleString()} against ${Math.round(loan.balance).toLocaleString()} owed.`});
}

function resolveUncuredSecuredLoans(state:GameState){
  if(state.character.age<18)return;
  for(const loan of [...state.finances.liabilities]){
    if(!isSecuredLoan(loan))continue;
    const delinquency=readLoanDelinquency(loan);
    if(delinquency.status!=='delinquent'||delinquency.arrears<=.5||delinquency.lastMissedPaymentAge===undefined||state.character.age<=delinquency.lastMissedPaymentAge)continue;
    if(loan.kind==='mortgage')forecloseProperty(state,loan);else repossessVehicle(state,loan);
  }
}

export interface BankruptcyPreview {eligible:boolean;dischargeableDebt:number;securedDebt:number;studentDebt:number;yearsSinceLast?:number;reason?:string;}
export function bankruptcyPreview(state:GameState):BankruptcyPreview{const personal=state.finances.liabilities.filter(l=>l.kind==='personal').reduce((sum,l)=>sum+l.balance,0);const revolving=creditCardDebt(state);const dischargeableDebt=roundMoney(personal+revolving);const securedDebt=roundMoney(state.finances.liabilities.filter(l=>l.kind==='mortgage'||l.kind==='car').reduce((sum,l)=>sum+l.balance,0));const studentDebt=roundMoney(state.finances.liabilities.filter(l=>l.kind==='student').reduce((sum,l)=>sum+l.balance,0));const last=Number(state.flags.lastBankruptcyAge??Number.NaN);const yearsSinceLast=Number.isFinite(last)?Math.max(0,state.character.age-last):undefined;const gross=Math.max(0,state.finances.annualIncome,state.employment.current?.salary??0);const debtPayments=state.finances.liabilities.reduce((sum,l)=>sum+Math.max(0,l.annualPayment),0);const distressed=dischargeableDebt>=Math.max(15000,gross*.4)&&(gross<=0||debtPayments/gross>.5||dischargeableDebt>gross*.8||Number(state.flags.cashShortfallYears??0)>=2);let reason:string|undefined;if(state.character.age<18)reason='Bankruptcy is available only to adults.';else if(dischargeableDebt<=.5)reason='You have no eligible unsecured debt to discharge.';else if(yearsSinceLast!==undefined&&yearsSinceLast<7)reason='You must complete seven years of recovery before filing bankruptcy again.';else if(!distressed)reason='Your current unsecured debt and payment burden do not meet the game’s serious-financial-distress threshold.';return{eligible:!reason,dischargeableDebt,securedDebt,studentDebt,...(yearsSinceLast===undefined?{}:{yearsSinceLast}),...(reason?{reason}:{})};}

export function declareBankruptcy(state:GameState,source:'automatic'|'voluntary'='automatic'){
  const personal=state.finances.liabilities.filter(l=>l.kind==='personal');
  const revolving=creditCardDebt(state);
  if(!personal.length&&revolving<=0)return false;
  const personalDischarged=personal.reduce((sum,l)=>sum+l.balance,0);
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.kind!=='personal');
  const revolvingDischarged=dischargeCreditForBankruptcy(state);const discharged=personalDischarged+revolvingDischarged;
  state.finances.cash=Math.max(0,state.finances.cash);
  state.flags.bankruptcies=Number(state.flags.bankruptcies??0)+1;
  state.flags.lastBankruptcyAge=state.character.age;
  recordCreditDerogatory(state,'bankruptcy',100,'Bankruptcy discharged unsecured debt.');
  state.flags.cashShortfallYears=0;
  state.character.stats.happiness=clamp(state.character.stats.happiness-14);
  state.character.secondary.reputation=clamp(state.character.secondary.reputation-12);
  state.character.secondary.stress=clamp(state.character.secondary.stress+15);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:3,text:`You ${source==='voluntary'?'filed for':'entered'} bankruptcy and discharged ${Math.round(discharged).toLocaleString()} of unsecured in-game debt.`});
  return true;
}

interface AnnualLoanPayment {
  loan:Loan;
  payment:number;
}

function missSecuredPayment(state:GameState,entry:AnnualLoanPayment,restoreAppliedPayment=true){
  const {loan,payment}=entry;if(!isSecuredLoan(loan)||payment<=.5)return 0;
  const delinquency=ensureLoanDelinquency(loan);if(delinquency.status==='delinquent')return 0;
  if(restoreAppliedPayment){loan.balance=roundMoney(loan.balance+payment);loan.remainingYears+=1;}
  loan.delinquency={status:'delinquent',arrears:roundMoney(payment),missedPayments:1,lastMissedPaymentAge:state.character.age};
  const collateral=collateralDetails(state,loan);const consequence=loan.kind==='mortgage'?'foreclosure':'repossession';
  if(loan.kind==='mortgage')state.flags.mortgageMisses=Number(state.flags.mortgageMisses??0)+1;
  recordCreditDerogatory(state,'missed_payment',loan.kind==='mortgage'?36:30,`Missed secured payment on ${collateral.name}.`);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:3,text:`You missed the ${Math.round(payment).toLocaleString()} annual payment on ${collateral.name}. Cure the past-due amount before your next Age Up or risk ${consequence}.`,detail:`The loan remains secured by ${collateral.name}; the missed payment was not treated as paid.`});
  return payment;
}

function handleCashShortfall(state:GameState,grossIncome:number,loanPayments:AnnualLoanPayment[]){
  if(state.character.age<18){
    if(state.finances.cash<0){const support=-state.finances.cash;state.finances.cash=0;state.flags.guardianSupportReceived=Number(state.flags.guardianSupportReceived??0)+support;}
    state.flags.cashShortfallYears=0;return 0;
  }
  if(state.finances.cash>=0){state.flags.cashShortfallYears=0;return 0;}
  let shortfall=roundMoney(-state.finances.cash);state.finances.cash=0;
  state.flags.cashShortfallYears=Number(state.flags.cashShortfallYears??0)+1;
  let missedPayments=0;
  const secured=[...loanPayments].filter(entry=>isSecuredLoan(entry.loan)&&entry.payment>.5).sort((a,b)=>{
    const kindPriority=(loan:Loan)=>loan.kind==='car'?0:1;
    return kindPriority(a.loan)-kindPriority(b.loan)||b.payment-a.payment;
  });
  for(const entry of secured){
    if(shortfall<=.5)break;
    const released=missSecuredPayment(state,entry);if(released<=0)continue;missedPayments=roundMoney(missedPayments+released);
    if(released>=shortfall){state.finances.cash=roundMoney(state.finances.cash+released-shortfall);shortfall=0;}else shortfall=roundMoney(shortfall-released);
  }

  if(shortfall>.5){
    addUnsecuredDebt(state,shortfall);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You could not cover ${Math.round(shortfall).toLocaleString()} of annual costs and added it to unsecured debt.`,moneyDelta:-shortfall});
  }

  const personalDebt=state.finances.liabilities.filter(l=>l.kind==='personal').reduce((sum,l)=>sum+l.balance,0);
  const severeThreshold=Math.max(45000,grossIncome*1.35);
  if(personalDebt>severeThreshold||Number(state.flags.cashShortfallYears)>=4){
    liquidateInvestmentsForDebt(state);payDownPersonalDebt(state);
    const remaining=state.finances.liabilities.filter(l=>l.kind==='personal').reduce((sum,l)=>sum+l.balance,0);
    if(remaining>Math.max(25000,grossIncome*.75))declareBankruptcy(state);
  }
  return missedPayments;
}


export function processAnnualFinance(state:GameState) {
  resolveUncuredSecuredLoans(state);
  const country=countryById[state.character.countryId];
  const salary=state.employment.current?.salary??0;
  const partTimeIncome=(state.employment.partTimeJobs??[]).reduce((sum,job)=>sum+job.salary,0);
  const specialIncome=specialCareerIncome(state);
  const rentalIncome=state.assets.properties.reduce((s,p)=>s+(p.rental?.occupied?p.rental.annualRent:0),0);
  const businessDistribution=state.businesses.reduce((s,b)=>s+(b.profit>0?Math.round(b.profit*.25):0),0);
  const gross=salary+partTimeIncome+specialIncome+rentalIncome+businessDistribution;
  const taxes=Math.round(gross*(country?.taxRate??.24));
  const age=state.character.age;
  const dependentMinor=age<18;
  const baseline=dependentMinor?0:Math.round((15500+age*90)*state.economy.inflationIndex);
  const children=state.relationships.filter(r=>r.type==='child'&&state.npcs[r.npcId]?.alive&&state.npcs[r.npcId]!.age<18).length;
  const childCosts=dependentMinor?0:Math.round(children*6500*state.economy.inflationIndex);
  // Ordinary leisure, clothing, local transport, subscriptions and other discretionary consumption rise with means.
  // Explicit player purchases/travel remain separate; this prevents high earners from unrealistically banking every unused salary dollar.
  const afterTaxIncome=Math.max(0,gross-taxes);
  const lifestyleRate=gross<35000?.03:gross<80000?.07:gross<160000?.10:.14;
  const lifestyleCosts=dependentMinor?0:Math.round(afterTaxIncome*lifestyleRate);
  const petCosts=dependentMinor?0:Math.round(state.pets.filter(p=>p.alive).length*900*state.economy.inflationIndex);
  const propertyCosts=dependentMinor?0:Math.round(state.assets.properties.reduce((s,p)=>s+p.marketValue*.018,0));
  const vehicleCosts=dependentMinor?0:Math.round(state.assets.vehicles.reduce((s,v)=>s+Math.max(450,v.value*.025),0));
  let debtPayments=0;const loanPayments:AnnualLoanPayment[]=[];
  for(const loan of state.finances.liabilities){
    if(loan.balance<=0||dependentMinor)continue;
    if(isSecuredLoan(loan)&&readLoanDelinquency(loan).status==='delinquent')continue;
    if(Number.isFinite(loan.prepaidThroughAge)&&Number(loan.prepaidThroughAge)>=state.character.age){if(Number(loan.prepaidThroughAge)===state.character.age)delete loan.prepaidThroughAge;continue;}
    const interest=roundMoney(Math.max(0,loan.balance*loan.annualRate));const payment=scheduledLoanPaymentAmount(loan);
    if(isSecuredLoan(loan)&&loan.autoPay===false){loan.balance=roundMoney(Math.max(0,loan.balance+interest));missSecuredPayment(state,{loan,payment},false);continue;}
    if(loan.kind==='personal'&&loan.autoPay===false){loan.balance=roundMoney(Math.max(0,loan.balance+interest));missPersonalPayment(state,loan);continue;}
    if(loan.kind==='personal'&&readLoanDelinquency(loan).status==='delinquent'){loan.balance=roundMoney(Math.max(0,loan.balance+interest));missPersonalPayment(state,loan);continue;}
    loan.balance=roundMoney(Math.max(0,loan.balance+interest-payment));loan.remainingYears=Math.max(0,loan.remainingYears-1);debtPayments+=payment;loanPayments.push({loan,payment:roundMoney(payment)});
  }
  const scheduledCashExpenses=baseline+lifestyleCosts+childCosts+petCosts+propertyCosts+vehicleCosts+debtPayments+taxes;
  // Business distributions are credited by BusinessSystem before finance processing, so do not add them twice here.
  state.finances.cash=roundMoney(state.finances.cash+salary+partTimeIncome+specialIncome+rentalIncome-scheduledCashExpenses);
  const missedSecuredPayments=handleCashShortfall(state,gross,loanPayments);
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.balance>.5);clearPaidMortgageLinks(state);
  const cashExpenses=roundMoney(Math.max(0,scheduledCashExpenses-missedSecuredPayments));
  const creditCosts=processAnnualCredit(state);const expenses=roundMoney(cashExpenses+creditCosts.interest+creditCosts.fees);
  state.finances.annualIncome=gross;state.finances.annualExpenses=expenses;state.finances.taxesPaid=taxes;
  const investmentReturn=state.investments.positions.reduce((sum,pos)=>{const hist=state.investments.history[pos.securityId]??[];if(hist.length<2)return sum;return sum+pos.units*(hist.at(-1)!-hist.at(-2)!);},0);
  state.finances.lastYearSummary={income:gross,expenses:expenses-taxes,taxes,investmentReturn:roundMoney(investmentReturn),businessProfit:state.businesses.reduce((s,b)=>s+b.profit,0),netChange:gross-expenses};
  state.legacy.totalFamilyWealth=Math.max(state.legacy.totalFamilyWealth,netWorth(state));
}
