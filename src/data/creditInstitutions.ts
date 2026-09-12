export interface CreditInstitutionDefinition {
  id:string;
  name:string;
  description:string;
}

export interface CreditCardProductDefinition {
  id:string;
  institutionId:string;
  name:string;
  minAge:number;
  secured:boolean;
  depositRequired:number;
  minCreditScore:number;
  minAnnualIncome:number;
  maxDebtToIncome:number;
  limitRange:[number,number];
  annualRate:number;
  annualFee:number;
  lateFee:number;
  minAccountYears?:number;
  recentInquiryLimit?:number;
}

export const creditInstitutions:CreditInstitutionDefinition[]=[
  {id:'hearthline',name:'Hearthline Community Bank',description:'A neighborhood-focused institution with accessible starter products.'},
  {id:'meridian_union',name:'Meridian Youth Credit Union',description:'A fictional member-owned institution specializing in early credit building.'},
  {id:'northstar',name:'Northstar Bank',description:'A national bank with practical products for growing credit files.'},
  {id:'harbor_pine',name:'Harbor & Pine Financial',description:'A conservative lender that rewards established repayment history.'},
  {id:'atlas_national',name:'Atlas National',description:'A premium institution offering larger lines to strong borrowers.'},
  {id:'keystone',name:'Keystone Direct',description:'A digital lender with flexible underwriting and higher pricing for thin files.'},
];

export const creditCardProducts:CreditCardProductDefinition[]=[
  {id:'hearthline_seed',institutionId:'hearthline',name:'Seed Secured',minAge:16,secured:true,depositRequired:200,minCreditScore:0,minAnnualIncome:0,maxDebtToIncome:10,limitRange:[200,200],annualRate:.219,annualFee:0,lateFee:15,recentInquiryLimit:8},
  {id:'meridian_step',institutionId:'meridian_union',name:'Step Forward Secured',minAge:16,secured:true,depositRequired:500,minCreditScore:0,minAnnualIncome:0,maxDebtToIncome:10,limitRange:[500,500],annualRate:.189,annualFee:12,lateFee:15,recentInquiryLimit:8},
  {id:'keystone_start',institutionId:'keystone',name:'Startline',minAge:18,secured:false,depositRequired:0,minCreditScore:575,minAnnualIncome:8000,maxDebtToIncome:1.35,limitRange:[500,1800],annualRate:.249,annualFee:35,lateFee:25,recentInquiryLimit:6},
  {id:'northstar_foundation',institutionId:'northstar',name:'Foundation',minAge:18,secured:false,depositRequired:0,minCreditScore:620,minAnnualIncome:12000,maxDebtToIncome:1.1,limitRange:[1000,3500],annualRate:.179,annualFee:0,lateFee:25,minAccountYears:1,recentInquiryLimit:5},
  {id:'harbor_everyday',institutionId:'harbor_pine',name:'Everyday',minAge:18,secured:false,depositRequired:0,minCreditScore:665,minAnnualIncome:20000,maxDebtToIncome:.85,limitRange:[2500,7500],annualRate:.129,annualFee:0,lateFee:25,minAccountYears:2,recentInquiryLimit:4},
  {id:'atlas_reserve',institutionId:'atlas_national',name:'Reserve',minAge:21,secured:false,depositRequired:0,minCreditScore:725,minAnnualIncome:35000,maxDebtToIncome:.65,limitRange:[8000,20000],annualRate:.089,annualFee:95,lateFee:30,minAccountYears:4,recentInquiryLimit:3},
];

export const creditInstitutionById=Object.fromEntries(creditInstitutions.map(item=>[item.id,item])) as Record<string,CreditInstitutionDefinition>;
export const creditCardProductById=Object.fromEntries(creditCardProducts.map(item=>[item.id,item])) as Record<string,CreditCardProductDefinition>;
