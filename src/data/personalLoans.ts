export interface PersonalLoanProductDefinition {
  id:string;
  institutionId:string;
  name:string;
  minAge:number;
  minAmount:number;
  maxAmount:number;
  termYears:number;
  baseRate:number;
  minCreditScore:number;
  minAnnualIncome:number;
  maxDebtPaymentRatio:number;
  bankruptcyRecoveryYears:number;
}

export const personalLoanProducts:PersonalLoanProductDefinition[]=[
  {id:'hearthline_relief',institutionId:'hearthline',name:'Relief Personal Loan',minAge:18,minAmount:1000,maxAmount:7500,termYears:3,baseRate:.135,minCreditScore:500,minAnnualIncome:12000,maxDebtPaymentRatio:.55,bankruptcyRecoveryYears:3},
  {id:'northstar_flex',institutionId:'northstar',name:'Flex Personal Loan',minAge:18,minAmount:2500,maxAmount:15000,termYears:5,baseRate:.105,minCreditScore:575,minAnnualIncome:22000,maxDebtPaymentRatio:.48,bankruptcyRecoveryYears:5},
  {id:'keystone_signature',institutionId:'keystone',name:'Signature Personal Loan',minAge:21,minAmount:5000,maxAmount:30000,termYears:5,baseRate:.079,minCreditScore:650,minAnnualIncome:38000,maxDebtPaymentRatio:.42,bankruptcyRecoveryYears:6},
  {id:'summit_prime',institutionId:'summit',name:'Prime Personal Loan',minAge:21,minAmount:10000,maxAmount:50000,termYears:6,baseRate:.059,minCreditScore:720,minAnnualIncome:65000,maxDebtPaymentRatio:.36,bankruptcyRecoveryYears:7},
];
export const personalLoanProductById=Object.fromEntries(personalLoanProducts.map(item=>[item.id,item])) as Record<string,PersonalLoanProductDefinition>;
