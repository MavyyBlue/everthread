import type { EngineResult, GameState } from '../types/game';
import { exactMoney, formatMoney } from '../core/format';
import { getPropertySaleQuote, getVehicleSaleQuote } from '../systems/PropertySystem';
import { gameEngine } from '../stores/gameStore';

export type AssetSaleTarget={kind:'property'|'vehicle';id:string};

export function AssetSaleSheet({state,target,onResult,onClose}:{state:GameState;target:AssetSaleTarget;onResult:(result:EngineResult)=>void;onClose:()=>void}){
  const quote=target.kind==='property'?getPropertySaleQuote(state,target.id):getVehicleSaleQuote(state,target.id);
  if(!quote)return null;
  const confirm=()=>{const result=target.kind==='property'?gameEngine.sellProperty(target.id):gameEngine.sellVehicle(target.id);onResult(result);if(result.success)onClose();};
  return <div className="sheet-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section className="bottom-sheet asset-sale-sheet" role="dialog" aria-modal="true" aria-label={`Sell ${quote.name}`}>
      <header className="sheet-header"><span className="sheet-handle"/><h2>Sell {quote.name}</h2><button className="icon-button" onClick={onClose} aria-label="Close sale details">×</button></header>
      <div className="sheet-body">
        <section className="hero-card asset-sale-summary"><p className="eyebrow">Sale preview</p><h2 title={exactMoney(quote.marketValue)}>{formatMoney(quote.marketValue)}</h2><p>Review the lender payoff and selling costs before confirming. This preview does not change your save.</p></section>
        <div className="finance-grid asset-sale-grid"><div><small>Current value</small><strong>{formatMoney(quote.marketValue)}</strong></div><div><small>Selling costs</small><strong>{formatMoney(quote.sellingCosts)}</strong></div><div><small>Lender payoff</small><strong>{quote.loanPayoff?formatMoney(quote.loanPayoff):'None'}</strong></div><div><small>{quote.deficiency>0?'Deficiency debt':'Cash proceeds'}</small><strong>{formatMoney(quote.deficiency>0?quote.deficiency:quote.cashProceeds)}</strong></div></div>
        {quote.deficiency>0?<section className="action-card asset-sale-warning"><h3>Underwater sale</h3><p>The sale recovery will not fully repay the financing balance. The remaining {formatMoney(quote.deficiency)} becomes unsecured debt after the asset is sold.</p></section>:<section className="action-card"><h3>After payoff</h3><p>{quote.loanPayoff>0?`The lender is paid first. You receive ${formatMoney(quote.cashProceeds)} in cash after selling costs.`:`You receive ${formatMoney(quote.cashProceeds)} in cash after selling costs.`}</p></section>}
        <button className="full-button danger-soft" onClick={confirm}>Confirm sale</button>
      </div>
    </section>
  </div>;
}
