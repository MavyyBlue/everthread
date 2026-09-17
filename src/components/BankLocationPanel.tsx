import type { EngineResult, GameState } from '../types/game';
import type { LocationSceneBankActionId } from '../data/locationScenes';
import { CreditBankingFocusedView } from './CreditBankingPanel';
import { InvestmentMarketView, MoneySummaryView } from './FinanceFocusedViews';

export function BankLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneBankActionId;onResult:(result:EngineResult)=>void}){
  if(actionId==='bank.summary')return <MoneySummaryView state={state}/>;
  if(actionId==='bank.invest')return <InvestmentMarketView state={state} onResult={onResult}/>;
  const section={
    'bank.payments':'payments',
    'bank.accounts':'accounts',
    'bank.offers':'offers',
    'bank.borrowing':'borrowing',
    'bank.history':'history',
  }[actionId] as 'payments'|'accounts'|'offers'|'borrowing'|'history';
  return <CreditBankingFocusedView state={state} onResult={onResult} section={section}/>;
}
