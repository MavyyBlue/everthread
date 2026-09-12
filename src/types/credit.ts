import type { Money } from './game';

export type CreditAccountStatus='open'|'closed'|'defaulted';
export type CreditTransactionKind='purchase'|'payment'|'interest'|'annual_fee'|'late_fee'|'secured_deposit'|'deposit_refund';
export type CreditInquiryOutcome='approved'|'declined';
export type CreditDerogatoryKind='late_payment'|'missed_payment'|'default'|'foreclosure'|'bankruptcy';

export interface CreditTransaction {
  id:string;
  accountId:string;
  institutionId:string;
  productId:string;
  year:number;
  age:number;
  kind:CreditTransactionKind;
  amount:Money;
  description:string;
}

export interface CreditInquiry {
  id:string;
  institutionId:string;
  productId:string;
  year:number;
  age:number;
  outcome:CreditInquiryOutcome;
  reason?:string;
}

export interface CreditDerogatory {
  id:string;
  kind:CreditDerogatoryKind;
  year:number;
  age:number;
  severity:number;
  summary:string;
}

export interface CreditAccount {
  id:string;
  institutionId:string;
  productId:string;
  productName:string;
  openedYear:number;
  openedAge:number;
  status:CreditAccountStatus;
  creditLimit:Money;
  balance:Money;
  annualRate:number;
  annualFee:Money;
  lateFee:Money;
  securedDeposit:Money;
  statementBalance:Money;
  minimumDue:Money;
  paymentsTowardStatement:Money;
  statementAge:number;
  onTimePayments:number;
  latePayments:number;
  missedPayments:number;
}

export interface CreditHistorySummary {
  onTimePayments:number;
  latePayments:number;
  missedPayments:number;
  defaults:number;
  closedGoodStanding:number;
  archivedAccountYears:number;
}

export interface CreditState {
  accounts:CreditAccount[];
  inquiries:CreditInquiry[];
  transactions:CreditTransaction[];
  derogatories:CreditDerogatory[];
  history:CreditHistorySummary;
}

declare module './game' {
  interface FinancesState {
    credit:CreditState;
  }
}
