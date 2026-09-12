import type { EngineResult, GameState, Loan } from '../types/game';
import { assetFinancePrograms, type AssetFinanceKind, type AssetFinanceProgramDefinition } from '../data/assetFinancing';
import { creditInstitutionById } from '../data/creditInstitutions';
import { getCreditUnderwritingSnapshot, recordCreditInquiry } from './CreditSystem';
import { consumeAction } from '../core/actionEconomy';
import { makeStateId } from '../core/ids';
import { clamp, roundMoney } from '../core/math';

export interface AssetFinanceRequest {
  kind:AssetFinanceKind;
  price:number;
  downPaymentRate:number;
}

export interface AssetFinanceOffer {
  id:string;
  program:AssetFinanceProgramDefinition;
  institutionName:string;
  eligible:boolean;
  reason?:string;
  annualRate:number;
  termYears:number;
  downPayment:number;
  amountFinanced:number;
  annualPayment:number;
  monthlyEquivalent:number;
  financeCharge:number;
  totalFinancingCost:number;
  projectedPaymentToIncome:number;
}

export interface AssetFinanceApplication {
  result:EngineResult;
  offer?:AssetFinanceOffer;
  loan?:Loan;
}

function cleanRequest(request:AssetFinanceRequest):AssetFinanceRequest {
  const price=roundMoney(Math.max(0,Number(request.price)||0));
  const downPaymentRate=clamp(Number(request.downPaymentRate)||0,0,.95);
  return{kind:request.kind,price,downPaymentRate};
}

function annualPayment(principal:number,annualRate:number,years:number){
  if(principal<=0)return 0;
  if(annualRate<=0)return roundMoney(principal/Math.max(1,years));
  const factor=Math.pow(1+annualRate,years);
  return roundMoney(principal*(annualRate*factor)/(factor-1));
}

function quoteRate(program:AssetFinanceProgramDefinition,score:number,downPaymentRate:number){
  const riskSteps=Math.max(0,(700-score)/100);
  const downBonus=Math.max(0,downPaymentRate-program.minDownPaymentRate)*.03;
  return Math.round(clamp(program.baseAnnualRate+riskSteps*program.riskRateStep-downBonus,.025,program.maxAnnualRate)*10000)/10000;
}

function carryingCost(kind:AssetFinanceKind,price:number){
  return kind==='home'?roundMoney(price*.018):roundMoney(Math.max(450,price*.025));
}

function declineReason(state:GameState,program:AssetFinanceProgramDefinition,request:AssetFinanceRequest,annualPaymentAmount:number){
  const snapshot=getCreditUnderwritingSnapshot(state);const profile=snapshot.profile;
  if(state.character.age<program.minAge)return`This lender requires the borrower to be at least ${program.minAge}.`;
  if(request.downPaymentRate+1e-9<program.minDownPaymentRate)return`This offer requires at least ${Math.round(program.minDownPaymentRate*100)}% down.`;
  const down=roundMoney(request.price*request.downPaymentRate);if(state.finances.cash<down)return`You need ${down.toLocaleString()} cash for this down payment.`;
  if(snapshot.annualIncome<program.minAnnualIncome)return`This lender requires at least ${program.minAnnualIncome.toLocaleString()} in annual income.`;
  if(snapshot.yearsSinceBankruptcy!==undefined&&snapshot.yearsSinceBankruptcy<program.bankruptcyRecoveryYears)return`This lender requires ${program.bankruptcyRecoveryYears} years of recovery after bankruptcy.`;
  if(profile.score<program.minCreditScore)return`Your current credit profile is below this lender's ${program.minCreditScore} underwriting threshold.`;
  if(profile.debtToIncome>program.maxDebtToIncome)return'Your existing debt balance is too high relative to income for this lender.';
  if(profile.recentInquiries>program.recentInquiryLimit)return'Too many recent credit applications are limiting approval.';
  if(snapshot.annualIncome>0){const projected=(snapshot.annualDebtPayments+annualPaymentAmount+carryingCost(request.kind,request.price))/snapshot.annualIncome;if(projected>program.maxPaymentToIncome)return`The projected annual debt and ownership payments would use ${Math.round(projected*100)}% of income; this lender's limit is ${Math.round(program.maxPaymentToIncome*100)}%.`;}
  return undefined;
}

export function getAssetFinanceOffers(state:GameState,rawRequest:AssetFinanceRequest):AssetFinanceOffer[]{
  const request=cleanRequest(rawRequest);const snapshot=getCreditUnderwritingSnapshot(state);const programs=assetFinancePrograms.filter(item=>item.kind===request.kind);
  return programs.map(program=>{
    const downPayment=roundMoney(request.price*request.downPaymentRate);const amountFinanced=roundMoney(Math.max(0,request.price-downPayment));const annualRate=quoteRate(program,snapshot.profile.score,request.downPaymentRate);const payment=annualPayment(amountFinanced,annualRate,program.termYears);const reason=declineReason(state,program,request,payment);const projectedPaymentToIncome=snapshot.annualIncome>0?(snapshot.annualDebtPayments+payment+carryingCost(request.kind,request.price))/snapshot.annualIncome:9;const financeCharge=roundMoney(Math.max(0,payment*program.termYears-amountFinanced));const totalFinancingCost=roundMoney(downPayment+payment*program.termYears);
    return{id:program.id,program,institutionName:creditInstitutionById[program.institutionId]?.name??program.institutionId,eligible:!reason,reason,annualRate,termYears:program.termYears,downPayment,amountFinanced,annualPayment:payment,monthlyEquivalent:roundMoney(payment/12),financeCharge,totalFinancingCost,projectedPaymentToIncome};
  }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||a.totalFinancingCost-b.totalFinancingCost||a.annualRate-b.annualRate);
}

export function bestAssetFinanceOffer(state:GameState,request:AssetFinanceRequest){return getAssetFinanceOffers(state,request).find(offer=>offer.eligible);}

export function acceptAssetFinanceOffer(state:GameState,rawRequest:AssetFinanceRequest,offerId:string):AssetFinanceApplication {
  const request=cleanRequest(rawRequest);if(request.price<=0)return{result:{success:false,messages:[{text:'That asset does not have a valid financing price.'}]}};
  const offer=getAssetFinanceOffers(state,request).find(item=>item.id===offerId);if(!offer)return{result:{success:false,messages:[{text:'That lender offer is no longer available.'}]}};
  if(!offer.eligible)return{offer,result:{success:false,messages:[{text:`Financing not approved: ${offer.reason??'The lender requirements are not met.'}`}]}};
  const gate=consumeAction(state,[{policy:'credit.application.total'},{policy:'credit.application.product',target:`asset:${offer.id}`}]);if(!gate.allowed)return{offer,result:{success:false,messages:[{text:gate.message!}]}};
  if(state.finances.cash<offer.downPayment)return{offer,result:{success:false,messages:[{text:`You need ${offer.downPayment.toLocaleString()} cash for the down payment.`}]}};
  recordCreditInquiry(state,{institutionId:offer.program.institutionId,productId:offer.program.id,outcome:'approved'});
  state.finances.cash=roundMoney(state.finances.cash-offer.downPayment);
  const loan:Loan={id:makeStateId(state,'loan'),kind:request.kind==='home'?'mortgage':'car',principal:offer.amountFinanced,balance:offer.amountFinanced,annualRate:offer.annualRate,annualPayment:offer.annualPayment,remainingYears:offer.termYears,delinquency:{status:'current',arrears:0,missedPayments:0},autoPay:true};
  state.finances.liabilities.push(loan);
  return{offer,loan,result:{success:true,stateChanges:['creditInquiry','financingLiability'],messages:[{text:`${offer.institutionName} approved ${offer.program.name}: ${offer.downPayment.toLocaleString()} down, ${offer.amountFinanced.toLocaleString()} financed at ${(offer.annualRate*100).toFixed(1)}% APR for ${offer.termYears} years.`}]}};
}
