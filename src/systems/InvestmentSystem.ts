import { securities } from '../data/assets';
import type { EngineResult, GameState } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';

export function initializeMarket(state:GameState) {
  if(Object.keys(state.investments.prices).length) return;
  for(const security of securities){state.investments.prices[security.id]=security.basePrice;state.investments.history[security.id]=[security.basePrice];}
}

export function processMarketYear(state:GameState) {
  initializeMarket(state); const rng=createRng(`${state.seed}-market`,state.rngCounter);
  const regime=rng.weighted([
    {item:'bull' as const,weight:28},{item:'neutral' as const,weight:45},{item:'bear' as const,weight:18},{item:'bubble' as const,weight:6},{item:'crash' as const,weight:3}
  ]); state.investments.marketRegime=regime;
  const regimeDrift={bull:.055,neutral:.005,bear:-.07,bubble:.15,crash:-.30}[regime];
  for(const s of securities){
    const current=state.investments.prices[s.id]??s.basePrice;
    const noise=(rng.next()-.5)*2*s.volatility;
    const typeBias=s.type==='bond'?(regime==='crash'?.04:0):s.type==='speculative'?(regime==='bubble'?.35:regime==='crash'?-.25:0):0;
    const ret=Math.max(-.85,Math.min(1.8,s.drift+regimeDrift+noise+typeBias));
    const next=Math.max(.05,current*(1+ret)); state.investments.prices[s.id]=Math.round(next*100)/100;
    state.investments.history[s.id]=(state.investments.history[s.id]??[]).slice(-39).concat(state.investments.prices[s.id]!);
  }
  state.rngCounter=rng.counter();
}

export function portfolioValue(state:GameState) { return state.investments.positions.reduce((sum,p)=>sum+p.units*(state.investments.prices[p.securityId]??0),0); }

export function buySecurity(state:GameState,securityId:string,amount:number):EngineResult {
  initializeMarket(state); const sec=securities.find(s=>s.id===securityId); if(!sec)return{success:false,messages:[{text:'Unknown security.'}]};
  amount=Math.max(0,Math.min(state.finances.cash,amount)); if(amount<10)return{success:false,messages:[{text:'Choose an amount of at least 10 in game currency.'}]};
  const price=state.investments.prices[securityId]!; const units=amount/price; const existing=state.investments.positions.find(p=>p.securityId===securityId);
  if(existing){const oldValue=existing.units*existing.averageCost;existing.units+=units;existing.averageCost=(oldValue+amount)/existing.units;}else state.investments.positions.push({securityId,units,averageCost:price});
  state.finances.cash-=amount;state.flags.investmentContributions=Number(state.flags.investmentContributions??0)+amount;return{success:true,messages:[{text:`Invested ${amount.toLocaleString()} in ${sec.name} at ${price.toFixed(2)}.`}]};
}

export function sellSecurity(state:GameState,securityId:string,units?:number):EngineResult {
  const pos=state.investments.positions.find(p=>p.securityId===securityId); if(!pos)return{success:false,messages:[{text:'You do not own that security.'}]};
  const sellUnits=clamp(units??pos.units,0,pos.units); const value=sellUnits*(state.investments.prices[securityId]??0); pos.units-=sellUnits;state.finances.cash+=value;state.flags.investmentWithdrawals=Number(state.flags.investmentWithdrawals??0)+value;
  if(pos.units<.000001) state.investments.positions=state.investments.positions.filter(p=>p!==pos);
  return{success:true,messages:[{text:`Sold the position for ${Math.round(value).toLocaleString()}.`}]};
}
