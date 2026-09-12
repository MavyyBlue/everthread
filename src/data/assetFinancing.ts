export type AssetFinanceKind='vehicle'|'home';

export interface AssetFinanceProgramDefinition {
  id:string;
  institutionId:string;
  name:string;
  kind:AssetFinanceKind;
  minAge:number;
  minCreditScore:number;
  minAnnualIncome:number;
  maxDebtToIncome:number;
  maxPaymentToIncome:number;
  minDownPaymentRate:number;
  termYears:number;
  baseAnnualRate:number;
  riskRateStep:number;
  maxAnnualRate:number;
  recentInquiryLimit:number;
  bankruptcyRecoveryYears:number;
}

export const assetFinancePrograms:AssetFinanceProgramDefinition[]=[
  {id:'keystone_drive',institutionId:'keystone',name:'Drive Flex',kind:'vehicle',minAge:18,minCreditScore:550,minAnnualIncome:12000,maxDebtToIncome:1.6,maxPaymentToIncome:.48,minDownPaymentRate:.10,termYears:6,baseAnnualRate:.109,riskRateStep:.024,maxAnnualRate:.199,recentInquiryLimit:6,bankruptcyRecoveryYears:2},
  {id:'northstar_auto',institutionId:'northstar',name:'Auto Standard',kind:'vehicle',minAge:18,minCreditScore:620,minAnnualIncome:18000,maxDebtToIncome:1.15,maxPaymentToIncome:.40,minDownPaymentRate:.10,termYears:5,baseAnnualRate:.072,riskRateStep:.018,maxAnnualRate:.149,recentInquiryLimit:5,bankruptcyRecoveryYears:3},
  {id:'harbor_motor',institutionId:'harbor_pine',name:'Motor Preferred',kind:'vehicle',minAge:18,minCreditScore:680,minAnnualIncome:26000,maxDebtToIncome:.85,maxPaymentToIncome:.34,minDownPaymentRate:.15,termYears:4,baseAnnualRate:.054,riskRateStep:.014,maxAnnualRate:.109,recentInquiryLimit:4,bankruptcyRecoveryYears:5},
  {id:'hearthline_home',institutionId:'hearthline',name:'Home Foundation',kind:'home',minAge:18,minCreditScore:610,minAnnualIncome:26000,maxDebtToIncome:1.05,maxPaymentToIncome:.40,minDownPaymentRate:.10,termYears:30,baseAnnualRate:.064,riskRateStep:.010,maxAnnualRate:.099,recentInquiryLimit:5,bankruptcyRecoveryYears:4},
  {id:'harbor_home',institutionId:'harbor_pine',name:'Home Preferred',kind:'home',minAge:18,minCreditScore:680,minAnnualIncome:38000,maxDebtToIncome:.75,maxPaymentToIncome:.34,minDownPaymentRate:.20,termYears:20,baseAnnualRate:.051,riskRateStep:.008,maxAnnualRate:.079,recentInquiryLimit:4,bankruptcyRecoveryYears:5},
  {id:'atlas_home',institutionId:'atlas_national',name:'Home Reserve',kind:'home',minAge:21,minCreditScore:735,minAnnualIncome:65000,maxDebtToIncome:.55,maxPaymentToIncome:.30,minDownPaymentRate:.20,termYears:15,baseAnnualRate:.043,riskRateStep:.006,maxAnnualRate:.064,recentInquiryLimit:3,bankruptcyRecoveryYears:7},
];

export const assetFinanceProgramById=Object.fromEntries(assetFinancePrograms.map(item=>[item.id,item])) as Record<string,AssetFinanceProgramDefinition>;
