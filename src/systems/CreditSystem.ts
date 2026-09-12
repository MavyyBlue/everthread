import type { EngineResult, GameState } from '../types/game';
import type { CreditAccount, CreditDerogatoryKind, CreditInquiryOutcome, CreditState, CreditTransactionKind } from '../types/credit';
import { creditCardProductById, creditCardProducts, creditInstitutionById, type CreditCardProductDefinition } from '../data/creditInstitutions';
import { makeStateId } from '../core/ids';
import { clamp, roundMoney } from '../core/math';
import { consumeAction } from '../core/actionEconomy';

const MAX_ACTIVE_CREDIT_ACCOUNTS=5;
const MAX_STORED_CREDIT_ACCOUNTS=12;
const MAX_CREDIT_TRANSACTIONS=160;
const MAX_CREDIT_INQUIRIES=24;
const MAX_CREDIT_DEROGATORIES=20;

export interface CreditProfile {
  score:number;
  rating:'Building'|'Poor'|'Fair'|'Good'|'Very good'|'Excellent';
  totalLimit:number;
  totalBalance:number;
  availableCredit:number;
  utilization:number;
  debtToIncome:number;
  oldestAccountYears:number;
  recentInquiries:number;
  paymentReliability:number;
  factors:string[];
}

export interface CreditUnderwritingSnapshot {
  profile:CreditProfile;
  annualIncome:number;
  annualDebtPayments:number;
  debtPaymentRatio:number;
  yearsSinceBankruptcy?:number;
}

export interface CreditInquiryRecord {
  institutionId:string;
  productId:string;
  outcome:CreditInquiryOutcome;
  reason?:string;
}

export interface CreditOffer {
  product:CreditCardProductDefinition;
  institutionName:string;
  startingLimit:number;
  eligible:boolean;
  reason?:string;
  statusLabel:string;
}

export function createEmptyCreditState():CreditState {
  return{accounts:[],inquiries:[],transactions:[],derogatories:[],history:{onTimePayments:0,latePayments:0,missedPayments:0,defaults:0,closedGoodStanding:0,archivedAccountYears:0}};
}

export function ensureCreditState(state:GameState):CreditState {
  const finances=state.finances as GameState['finances']&{credit?:CreditState};
  finances.credit??=createEmptyCreditState();
  finances.credit.accounts??=[];finances.credit.inquiries??=[];finances.credit.transactions??=[];finances.credit.derogatories??=[];
  finances.credit.history??={onTimePayments:0,latePayments:0,missedPayments:0,defaults:0,closedGoodStanding:0,archivedAccountYears:0};
  return finances.credit;
}

function activeAccounts(state:GameState){return ensureCreditState(state).accounts.filter(account=>account.status==='open');}
export function creditAvailable(state:GameState){return roundMoney(activeAccounts(state).reduce((sum,account)=>sum+Math.max(0,account.creditLimit-account.balance),0));}
export function creditCardDebt(state:GameState){return roundMoney(activeAccounts(state).reduce((sum,account)=>sum+Math.max(0,account.balance),0));}
export function securedCreditDeposits(state:GameState){return roundMoney(activeAccounts(state).reduce((sum,account)=>sum+Math.max(0,account.securedDeposit),0));}

export function getCreditTransactionHistory(state:GameState){
  const transactions=ensureCreditState(state).transactions;
  return{
    current:transactions.filter(item=>item.year===state.currentYear).slice().reverse(),
    older:transactions.filter(item=>item.year!==state.currentYear).slice().reverse().slice(0,36),
  };
}

function annualIncomeForCredit(state:GameState){
  const current=(state.employment.current?.salary??0)+(state.employment.partTimeJobs??[]).reduce((sum,job)=>sum+job.salary,0);
  return Math.max(0,current,state.finances.annualIncome??0);
}

function installmentDebt(state:GameState){return state.finances.liabilities.reduce((sum,loan)=>sum+Math.max(0,loan.balance),0);}

function recentDerogatoryPenalty(state:GameState){
  let penalty=0;
  for(const event of ensureCreditState(state).derogatories){const ageGap=Math.max(0,state.character.age-event.age);const decay=Math.max(0,1-ageGap/8);penalty+=event.severity*decay;}
  return penalty;
}

export function getCreditProfile(state:GameState):CreditProfile {
  const credit=ensureCreditState(state);const open=credit.accounts.filter(account=>account.status==='open');const totalLimit=open.reduce((sum,account)=>sum+account.creditLimit,0);const totalBalance=open.reduce((sum,account)=>sum+account.balance,0);const utilization=totalLimit>0?totalBalance/totalLimit:0;
  const accountYears=open.reduce((max,account)=>Math.max(max,state.character.age-account.openedAge),0);const archivedYears=Math.max(0,credit.history.archivedAccountYears??0);const oldestAccountYears=Math.max(accountYears,Math.min(20,archivedYears));
  const paymentCount=credit.history.onTimePayments+credit.history.latePayments+credit.history.missedPayments;const paymentReliability=paymentCount?credit.history.onTimePayments/paymentCount:1;
  const inquiries=credit.inquiries.filter(item=>state.character.age-item.age<=2).length;const income=annualIncomeForCredit(state);const debt=installmentDebt(state)+totalBalance;const debtToIncome=income>0?debt/income:(debt>0?9:0);
  let score=520;
  if(open.length||credit.history.closedGoodStanding||archivedYears)score+=35;
  score+=Math.min(95,oldestAccountYears*11);
  score+=Math.min(95,credit.history.onTimePayments*8);
  score-=credit.history.latePayments*24+credit.history.missedPayments*52+credit.history.defaults*90;
  if(totalLimit>0){if(utilization<=.09)score+=55;else if(utilization<=.29)score+=35;else if(utilization<=.49)score+=10;else if(utilization<=.74)score-=35;else score-=80;}
  score-=Math.max(0,inquiries-1)*9;
  if(debtToIncome>.45)score-=Math.min(75,(debtToIncome-.45)*90);
  score-=recentDerogatoryPenalty(state);
  const lastBankruptcyAge=Number(state.flags.lastBankruptcyAge??Number.NaN);if(Number.isFinite(lastBankruptcyAge)&&state.character.age-lastBankruptcyAge<8)score-=Math.max(0,150-(state.character.age-lastBankruptcyAge)*18);
  score=Math.round(clamp(score,300,850));
  const rating:CreditProfile['rating']=!(open.length||credit.history.closedGoodStanding||archivedYears)?'Building':score<580?'Poor':score<640?'Fair':score<700?'Good':score<760?'Very good':'Excellent';
  const factors:string[]=[];
  if(!(open.length||credit.history.closedGoodStanding||archivedYears))factors.push('You are still establishing a credit file.');
  else if(oldestAccountYears<2)factors.push('Your credit history is still young.');else factors.push('Account age is helping your credit profile.');
  if(totalLimit>0){if(utilization<=.29)factors.push('Low revolving utilization is helping you.');else if(utilization>.74)factors.push('Very high revolving utilization is hurting you.');else if(utilization>.49)factors.push('Higher revolving utilization is weighing on your profile.');}
  if(credit.history.missedPayments||credit.history.latePayments)factors.push(`${credit.history.latePayments+credit.history.missedPayments} late or missed payment${credit.history.latePayments+credit.history.missedPayments===1?'':'s'} are hurting your history.`);else if(credit.history.onTimePayments)factors.push('Consistent on-time payments are helping you.');
  if(inquiries>=3)factors.push('Several recent applications are weighing on your profile.');
  if(debtToIncome>.65)factors.push('Existing debt is high relative to your income.');
  if(!factors.length)factors.push('Your current file has no major positive or negative signals yet.');
  return{score,rating,totalLimit:roundMoney(totalLimit),totalBalance:roundMoney(totalBalance),availableCredit:roundMoney(Math.max(0,totalLimit-totalBalance)),utilization:clamp(utilization*100),debtToIncome,oldestAccountYears,recentInquiries:inquiries,paymentReliability:clamp(paymentReliability*100),factors:factors.slice(0,4)};
}

export function getCreditUnderwritingSnapshot(state:GameState):CreditUnderwritingSnapshot {
  const profile=getCreditProfile(state);const income=annualIncomeForCredit(state);const revolvingAnnual=activeAccounts(state).reduce((sum,account)=>sum+Math.max(account.minimumDue,account.balance*.05),0);const installmentAnnual=state.finances.liabilities.reduce((sum,loan)=>sum+Math.max(0,loan.annualPayment),0);const annualDebtPayments=roundMoney(revolvingAnnual+installmentAnnual);const rawBankruptcyAge=Number(state.flags.lastBankruptcyAge??Number.NaN);const yearsSinceBankruptcy=Number.isFinite(rawBankruptcyAge)?Math.max(0,state.character.age-rawBankruptcyAge):undefined;return{profile,annualIncome:roundMoney(income),annualDebtPayments,debtPaymentRatio:income>0?annualDebtPayments/income:(annualDebtPayments>0?9:0),...(yearsSinceBankruptcy!==undefined?{yearsSinceBankruptcy}:{})};
}

export function recordCreditInquiry(state:GameState,record:CreditInquiryRecord){
  const credit=ensureCreditState(state);credit.inquiries.push({id:makeStateId(state,'credit-inquiry'),institutionId:record.institutionId,productId:record.productId,year:state.currentYear,age:state.character.age,outcome:record.outcome,...(record.reason?{reason:record.reason}:{})});if(credit.inquiries.length>MAX_CREDIT_INQUIRIES)credit.inquiries=credit.inquiries.slice(-MAX_CREDIT_INQUIRIES);
}

function offerReason(state:GameState,product:CreditCardProductDefinition,profile:CreditProfile):string|undefined {
  if(state.character.age<product.minAge)return`Available starting at age ${product.minAge}.`;
  if(activeAccounts(state).some(account=>account.productId===product.id))return'You already have this product.';
  if(activeAccounts(state).length>=MAX_ACTIVE_CREDIT_ACCOUNTS)return'You already have the maximum number of active revolving accounts.';
  if(product.secured&&state.finances.cash<product.depositRequired)return`This secured card requires ${product.depositRequired.toLocaleString()} cash for the refundable deposit.`;
  const yearsEstablished=profile.oldestAccountYears;
  if((product.minAccountYears??0)>yearsEstablished)return`This product requires about ${product.minAccountYears} year${product.minAccountYears===1?'':'s'} of established credit history.`;
  if(!product.secured&&profile.score<product.minCreditScore)return`Your current credit profile is below this lender's ${product.minCreditScore} underwriting threshold.`;
  const income=annualIncomeForCredit(state);if(income<product.minAnnualIncome)return`This lender requires at least ${product.minAnnualIncome.toLocaleString()} in annual income.`;
  if(profile.debtToIncome>product.maxDebtToIncome)return'Your existing debt is too high relative to income for this product.';
  if(profile.recentInquiries>(product.recentInquiryLimit??5))return'Too many recent credit applications are limiting approval.';
  const lastBankruptcyAge=Number(state.flags.lastBankruptcyAge??Number.NaN);if(!product.secured&&Number.isFinite(lastBankruptcyAge)&&state.character.age-lastBankruptcyAge<5)return'This lender requires more recovery time after bankruptcy.';
  return undefined;
}

function startingLimit(state:GameState,product:CreditCardProductDefinition,profile:CreditProfile){
  if(product.secured)return product.depositRequired;
  const [min,max]=product.limitRange;const income=annualIncomeForCredit(state);const scoreFactor=clamp((profile.score-product.minCreditScore)/180,0,1);const incomeFactor=clamp((income-product.minAnnualIncome)/Math.max(1,product.minAnnualIncome*3),0,1);return Math.round(min+(max-min)*(scoreFactor*.62+incomeFactor*.38));
}

export function getCreditOffers(state:GameState):CreditOffer[]{
  const profile=getCreditProfile(state);
  return creditCardProducts.map(product=>{const reason=offerReason(state,product,profile);const eligible=!reason;return{product,institutionName:creditInstitutionById[product.institutionId]?.name??product.institutionId,startingLimit:startingLimit(state,product,profile),eligible,reason,statusLabel:eligible?(product.secured?'Deposit-backed approval':'Prequalified'):'Requirements not met'};}).filter(offer=>state.character.age>=Math.max(16,offer.product.minAge-2));
}

function appendTransaction(state:GameState,account:CreditAccount,kind:CreditTransactionKind,amount:number,description:string){
  const credit=ensureCreditState(state);credit.transactions.push({id:makeStateId(state,'credit-tx'),accountId:account.id,institutionId:account.institutionId,productId:account.productId,year:state.currentYear,age:state.character.age,kind,amount:roundMoney(Math.max(0,amount)),description});if(credit.transactions.length>MAX_CREDIT_TRANSACTIONS)credit.transactions=credit.transactions.slice(-MAX_CREDIT_TRANSACTIONS);
}

export function applyForCreditCard(state:GameState,productId:string):EngineResult {
  if(!state.character.alive)return{success:false,messages:[{text:'Credit applications are unavailable after this life has ended.'}]};
  const product=creditCardProductById[productId];if(!product)return{success:false,messages:[{text:'That credit offer is no longer available.'}]};
  const gate=consumeAction(state,[{policy:'credit.application.total'},{policy:'credit.application.product',target:product.id}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const profile=getCreditProfile(state);const reason=offerReason(state,product,profile);const outcome=reason?'declined':'approved';recordCreditInquiry(state,{institutionId:product.institutionId,productId:product.id,outcome,...(reason?{reason}:{})});
  const institution=creditInstitutionById[product.institutionId];
  if(reason){state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:1,text:`${institution?.name??'A lender'} declined your ${product.name} application: ${reason}`});return{success:false,stateChanges:['creditInquiry'],messages:[{text:`Application declined: ${reason}`}]};}
  const credit=ensureCreditState(state);const limit=startingLimit(state,product,profile);const deposit=product.secured?product.depositRequired:0;if(deposit>0)state.finances.cash-=deposit;
  const account:CreditAccount={id:makeStateId(state,'credit-account'),institutionId:product.institutionId,productId:product.id,productName:product.name,openedYear:state.currentYear,openedAge:state.character.age,status:'open',creditLimit:limit,balance:0,annualRate:product.annualRate,annualFee:product.annualFee,lateFee:product.lateFee,securedDeposit:deposit,statementBalance:0,minimumDue:0,paymentsTowardStatement:0,statementAge:state.character.age,onTimePayments:0,latePayments:0,missedPayments:0,autoPay:true,pastDueAmount:0};credit.accounts.push(account);if(deposit)appendTransaction(state,account,'secured_deposit',deposit,'Refundable secured-card deposit');
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`${institution?.name??'A lender'} approved your ${product.name} card with a ${limit.toLocaleString()} credit line.${deposit?` You placed a refundable ${deposit.toLocaleString()} security deposit.`:''}`,moneyDelta:deposit?-deposit:undefined});return{success:true,stateChanges:['creditAccount','creditInquiry'],messages:[{text:`Approved for ${product.name} with ${limit.toLocaleString()} of available credit.`}]};
}

function accountById(state:GameState,accountId:string){return ensureCreditState(state).accounts.find(account=>account.id===accountId&&account.status==='open');}
function refreshStatement(account:CreditAccount){account.statementBalance=roundMoney(Math.max(account.statementBalance,account.balance));account.minimumDue=account.statementBalance>0?roundMoney(Math.min(account.statementBalance,Math.max(25,account.statementBalance*.05))):0;}

export function chargeCreditCard(state:GameState,accountId:string,amount:number):EngineResult {
  const account=accountById(state,accountId);if(!account)return{success:false,messages:[{text:'That credit account is not available.'}]};const clean=roundMoney(amount);if(!Number.isFinite(clean)||clean<=0)return{success:false,messages:[{text:'Enter a valid purchase amount.'}]};
  const available=Math.max(0,account.creditLimit-account.balance);if(clean>available+.001)return{success:false,messages:[{text:`That purchase exceeds the card's ${Math.round(available).toLocaleString()} available credit.`}]};
  const gate=consumeAction(state,[{policy:'credit.purchase.total'},{policy:'credit.purchase.account',target:account.id}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  account.balance=roundMoney(account.balance+clean);refreshStatement(account);appendTransaction(state,account,'purchase',clean,'Everyday credit purchase');state.character.stats.happiness=clamp(state.character.stats.happiness+(clean>=100?1:0));return{success:true,stateChanges:['creditBalance'],messages:[{text:`You charged ${clean.toLocaleString()} to ${account.productName}.`}]};
}

export function payCreditCard(state:GameState,accountId:string,amount:number):EngineResult {
  const account=accountById(state,accountId);if(!account)return{success:false,messages:[{text:'That credit account is not available.'}]};const clean=roundMoney(amount);if(!Number.isFinite(clean)||clean<=0)return{success:false,messages:[{text:'Enter a valid payment amount.'}]};if(account.balance<=0)return{success:false,messages:[{text:'This card has no balance to pay.'}]};const payment=Math.min(clean,account.balance,state.finances.cash);if(payment<=0)return{success:false,messages:[{text:'You do not have enough cash for a card payment.'}]};
  state.finances.cash=roundMoney(state.finances.cash-payment);account.balance=roundMoney(Math.max(0,account.balance-payment));account.paymentsTowardStatement=roundMoney(account.paymentsTowardStatement+payment);account.pastDueAmount=roundMoney(Math.max(0,(account.pastDueAmount??0)-payment));appendTransaction(state,account,'payment',payment,'Card payment from cash');return{success:true,stateChanges:['cash','creditBalance'],messages:[{text:`You paid ${payment.toLocaleString()} toward ${account.productName}.`}]};
}

export function closeCreditCard(state:GameState,accountId:string):EngineResult {
  const account=accountById(state,accountId);if(!account)return{success:false,messages:[{text:'That credit account is not available.'}]};if(account.balance>.5)return{success:false,messages:[{text:'Pay this card to zero before closing it.'}]};const credit=ensureCreditState(state);account.status='closed';const years=Math.max(0,state.character.age-account.openedAge);credit.history.closedGoodStanding+=1;credit.history.archivedAccountYears=Math.max(credit.history.archivedAccountYears,years);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:1,text:`You closed ${account.productName} in good standing after ${years} year${years===1?'':'s'}.`});if(account.securedDeposit>0){state.finances.cash=roundMoney(state.finances.cash+account.securedDeposit);appendTransaction(state,account,'deposit_refund',account.securedDeposit,'Secured-card deposit returned');account.securedDeposit=0;}compactCreditAccounts(state);return{success:true,stateChanges:['creditAccount','cash'],messages:[{text:`You closed ${account.productName} in good standing.`}]};
}


export function dischargeCreditForBankruptcy(state:GameState):number{
  const credit=ensureCreditState(state);let discharged=0;
  for(const account of credit.accounts){if(account.status!=='open')continue;const appliedDeposit=Math.min(account.securedDeposit,account.balance);account.balance=roundMoney(Math.max(0,account.balance-appliedDeposit));account.securedDeposit=roundMoney(Math.max(0,account.securedDeposit-appliedDeposit));if(account.securedDeposit>0){state.finances.cash=roundMoney(state.finances.cash+account.securedDeposit);appendTransaction(state,account,'deposit_refund',account.securedDeposit,'Remaining secured deposit returned during bankruptcy');account.securedDeposit=0;}if(account.balance>0){discharged+=account.balance;credit.history.defaults+=1;recordCreditDerogatory(state,'default',75,`${account.productName} was discharged in bankruptcy.`);}account.balance=0;account.statementBalance=0;account.minimumDue=0;account.paymentsTowardStatement=0;account.status='defaulted';}
  compactCreditAccounts(state);return roundMoney(discharged);
}

export function recordCreditDerogatory(state:GameState,kind:CreditDerogatoryKind,severity:number,summary:string){
  const credit=ensureCreditState(state);if(credit.derogatories.some(item=>item.kind===kind&&item.age===state.character.age&&item.summary===summary))return;credit.derogatories.push({id:makeStateId(state,'credit-derog'),kind,year:state.currentYear,age:state.character.age,severity:Math.max(1,Math.min(100,severity)),summary});if(credit.derogatories.length>MAX_CREDIT_DEROGATORIES)credit.derogatories=credit.derogatories.slice(-MAX_CREDIT_DEROGATORIES);if(kind==='default')credit.history.defaults+=1;
}

function compactCreditAccounts(state:GameState){const credit=ensureCreditState(state);if(credit.accounts.length<=MAX_STORED_CREDIT_ACCOUNTS)return;const open=credit.accounts.filter(account=>account.status==='open');const closed=credit.accounts.filter(account=>account.status!=='open').sort((a,b)=>b.openedYear-a.openedYear);credit.accounts=[...open,...closed.slice(0,Math.max(0,MAX_STORED_CREDIT_ACCOUNTS-open.length))];}

export function processAnnualCredit(state:GameState):{interest:number;fees:number}{
  let interestTotal=0;let feeTotal=0;const credit=ensureCreditState(state);for(const account of credit.accounts){if(account.status!=='open')continue;
    if(account.statementBalance>0&&account.autoPay!==false){const remaining=roundMoney(Math.max(0,account.minimumDue-account.paymentsTowardStatement));if(remaining>.5&&state.finances.cash>.5)payCreditCard(state,account.id,remaining);}
    if(account.statementBalance>0){
      const short=roundMoney(Math.max(0,account.minimumDue-account.paymentsTowardStatement));
      if(short<=.001){account.onTimePayments+=1;credit.history.onTimePayments+=1;account.pastDueAmount=0;}
      else if(account.paymentsTowardStatement>0){account.pastDueAmount=short;account.latePayments+=1;credit.history.latePayments+=1;recordCreditDerogatory(state,'late_payment',22,`${account.productName} received less than the required minimum payment.`);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You paid less than the minimum due on ${account.productName}, hurting your credit history.`});const fee=Math.min(account.lateFee,Math.max(0,account.creditLimit-account.balance));if(fee>0){account.balance=roundMoney(account.balance+fee);feeTotal+=fee;appendTransaction(state,account,'late_fee',fee,'Late-payment fee');}}
      else{account.pastDueAmount=short;account.missedPayments+=1;credit.history.missedPayments+=1;recordCreditDerogatory(state,'missed_payment',45,`${account.productName} missed its required payment.`);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You missed the required payment on ${account.productName}, hurting your credit history.`});const fee=Math.min(account.lateFee,Math.max(0,account.creditLimit-account.balance));if(fee>0){account.balance=roundMoney(account.balance+fee);feeTotal+=fee;appendTransaction(state,account,'late_fee',fee,'Missed-payment fee');}}
    }
    if(account.balance>0&&account.annualRate>0){const interest=roundMoney(account.balance*account.annualRate);const applied=Math.min(interest,Math.max(0,account.creditLimit-account.balance));if(applied>0){account.balance=roundMoney(account.balance+applied);interestTotal+=applied;appendTransaction(state,account,'interest',applied,'Annual revolving interest');}}
    if(account.annualFee>0){const fee=Math.min(account.annualFee,Math.max(0,account.creditLimit-account.balance));if(fee>0){account.balance=roundMoney(account.balance+fee);feeTotal+=fee;appendTransaction(state,account,'annual_fee',fee,'Annual card fee');}}
    account.statementBalance=roundMoney(account.balance);const baseMinimum=account.balance>0?roundMoney(Math.min(account.balance,Math.max(25,account.balance*.05))):0;account.pastDueAmount=roundMoney(Math.min(account.balance,Math.max(0,account.pastDueAmount??0)));account.minimumDue=account.balance>0?roundMoney(Math.min(account.balance,baseMinimum+account.pastDueAmount)):0;account.paymentsTowardStatement=0;account.statementAge=state.character.age;
    if(account.balance>account.creditLimit+.01){account.balance=account.creditLimit;}
  }
  credit.inquiries=credit.inquiries.filter(item=>state.character.age-item.age<=6).slice(-MAX_CREDIT_INQUIRIES);credit.derogatories=credit.derogatories.filter(item=>item.kind==='bankruptcy'||state.character.age-item.age<=10).slice(-MAX_CREDIT_DEROGATORIES);credit.transactions=credit.transactions.filter(item=>state.currentYear-item.year<=3).slice(-MAX_CREDIT_TRANSACTIONS);compactCreditAccounts(state);return{interest:roundMoney(interestTotal),fees:roundMoney(feeTotal)};
}

export function migrateCreditState(state:GameState){ensureCreditState(state);sanitizeCreditState(state);}

export function sanitizeCreditState(state:GameState){
  const credit=ensureCreditState(state);const seen=new Set<string>();credit.accounts=credit.accounts.filter(account=>account&&typeof account.id==='string'&&!seen.has(account.id)).map(account=>{seen.add(account.id);account.creditLimit=Math.max(0,roundMoney(account.creditLimit));account.balance=Math.max(0,Math.min(account.creditLimit,roundMoney(account.balance)));account.securedDeposit=Math.max(0,roundMoney(account.securedDeposit));account.statementBalance=Math.max(0,Math.min(account.creditLimit,roundMoney(account.statementBalance??account.balance)));account.minimumDue=Math.max(0,Math.min(account.statementBalance,roundMoney(account.minimumDue??0)));account.paymentsTowardStatement=Math.max(0,roundMoney(account.paymentsTowardStatement??0));account.annualRate=Math.max(0,Math.min(1,Number(account.annualRate)||0));account.annualFee=Math.max(0,roundMoney(account.annualFee));account.lateFee=Math.max(0,roundMoney(account.lateFee));account.onTimePayments=Math.max(0,Math.floor(account.onTimePayments??0));account.latePayments=Math.max(0,Math.floor(account.latePayments??0));account.missedPayments=Math.max(0,Math.floor(account.missedPayments??0));account.autoPay=account.autoPay!==false;account.pastDueAmount=Math.max(0,Math.min(account.balance,roundMoney(account.pastDueAmount??0)));account.status=['open','closed','defaulted'].includes(account.status)?account.status:'closed';return account;});credit.inquiries=(credit.inquiries??[]).slice(-MAX_CREDIT_INQUIRIES);credit.transactions=(credit.transactions??[]).slice(-MAX_CREDIT_TRANSACTIONS);credit.derogatories=(credit.derogatories??[]).slice(-MAX_CREDIT_DEROGATORIES);credit.history.onTimePayments=Math.max(0,Math.floor(credit.history.onTimePayments??0));credit.history.latePayments=Math.max(0,Math.floor(credit.history.latePayments??0));credit.history.missedPayments=Math.max(0,Math.floor(credit.history.missedPayments??0));credit.history.defaults=Math.max(0,Math.floor(credit.history.defaults??0));credit.history.closedGoodStanding=Math.max(0,Math.floor(credit.history.closedGoodStanding??0));credit.history.archivedAccountYears=Math.max(0,Math.floor(credit.history.archivedAccountYears??0));compactCreditAccounts(state);
}
