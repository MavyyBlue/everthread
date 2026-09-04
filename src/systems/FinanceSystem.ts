import { countryById } from '../data/countries';
import type { GameState, Loan } from '../types/game';
import { clamp, roundMoney } from '../core/math';
import { makeStateId } from '../core/ids';

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
  const liabilities=state.finances.liabilities.reduce((sum,loan)=>sum+loan.balance,0);
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
    mortgageDebt:propertyDebt,
    otherLiabilities,
    liabilities,
    netWorth:roundMoney(cash+propertyGross+vehicles+collectibles+investments+businesses-liabilities),
  };
}

export function assetValue(state:GameState) {
  const breakdown=wealthBreakdown(state);
  return breakdown.propertyGross+breakdown.vehicles+breakdown.collectibles+breakdown.investments+breakdown.businesses;
}
export function liabilityValue(state:GameState){return wealthBreakdown(state).liabilities;}
export function netWorth(state:GameState){return wealthBreakdown(state).netWorth;}

function specialCareerIncome(state:GameState) {
  const sports=state.specialCareers.sports as Record<string,number|string|boolean>|undefined;
  const military=state.specialCareers.military as Record<string,number|string|boolean>|undefined;
  const politics=state.specialCareers.politics as Record<string,number|string|boolean>|undefined;
  const royalty=state.specialCareers.royalty as Record<string,number|string|boolean>|undefined;
  let total=0;
  if(sports?.active===true&&sports.pro===true) total+=Number(sports.salary??0);
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

function payDownPersonalDebt(state:GameState){
  if(state.finances.cash<=0)return;
  for(const loan of state.finances.liabilities.filter(l=>l.kind==='personal').sort((a,b)=>b.annualRate-a.annualRate)){
    if(state.finances.cash<=0)break;
    const amount=Math.min(state.finances.cash,loan.balance);loan.balance-=amount;state.finances.cash-=amount;
  }
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.balance>.5);
}

function forecloseProperty(state:GameState){
  const candidates=state.assets.properties
    .map(property=>({property,loan:property.mortgageId?state.finances.liabilities.find(l=>l.id===property.mortgageId):undefined}))
    .filter((entry):entry is {property:GameState['assets']['properties'][number];loan:Loan}=>Boolean(entry.loan));
  if(!candidates.length)return false;
  candidates.sort((a,b)=>b.loan.annualPayment-a.loan.annualPayment);
  const {property,loan}=candidates[0]!;
  const residual=Math.max(0,property.marketValue-loan.balance-Math.round(property.marketValue*.08));
  state.assets.properties=state.assets.properties.filter(p=>p.id!==property.id);
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.id!==loan.id);
  state.finances.cash+=residual;
  state.flags.foreclosures=Number(state.flags.foreclosures??0)+1;
  state.flags.mortgageMisses=0;
  state.character.stats.happiness=clamp(state.character.stats.happiness-12);
  state.character.secondary.reputation=clamp(state.character.secondary.reputation-5);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:3,text:`You lost ${property.name} to foreclosure after sustained payment trouble.${residual>0?` Remaining equity returned ${Math.round(residual).toLocaleString()}.`:''}`,moneyDelta:residual});
  return true;
}

function declareBankruptcy(state:GameState){
  const personal=state.finances.liabilities.filter(l=>l.kind==='personal');
  if(!personal.length)return false;
  const discharged=personal.reduce((sum,l)=>sum+l.balance,0);
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.kind!=='personal');
  state.finances.cash=Math.max(0,state.finances.cash);
  state.flags.bankruptcies=Number(state.flags.bankruptcies??0)+1;
  state.flags.lastBankruptcyAge=state.character.age;
  state.flags.cashShortfallYears=0;
  state.character.stats.happiness=clamp(state.character.stats.happiness-14);
  state.character.secondary.reputation=clamp(state.character.secondary.reputation-12);
  state.character.secondary.stress=clamp(state.character.secondary.stress+15);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:3,text:`You declared bankruptcy and discharged ${Math.round(discharged).toLocaleString()} of unsecured in-game debt.`});
  return true;
}

function handleCashShortfall(state:GameState,grossIncome:number){
  if(state.finances.cash>=0){state.flags.cashShortfallYears=0;state.flags.mortgageMisses=0;return;}
  let shortfall=-state.finances.cash;
  state.finances.cash=0;
  state.flags.cashShortfallYears=Number(state.flags.cashShortfallYears??0)+1;

  const mortgages=state.finances.liabilities.filter(l=>l.kind==='mortgage'&&l.balance>0);
  if(mortgages.length){
    state.flags.mortgageMisses=Number(state.flags.mortgageMisses??0)+1;
    if(Number(state.flags.mortgageMisses)>=2&&forecloseProperty(state)){
      const covered=Math.min(shortfall,state.finances.cash);
      shortfall-=covered;
      state.finances.cash-=covered;
    }
  }

  if(shortfall>0){
    const existing=state.finances.liabilities.find(l=>l.kind==='personal');
    if(existing){existing.principal+=shortfall;existing.balance+=shortfall;existing.annualPayment=Math.max(existing.annualPayment,Math.round(existing.balance*.16));existing.remainingYears=Math.max(existing.remainingYears,8);}
    else state.finances.liabilities.push({id:makeStateId(state,'loan'),kind:'personal',principal:shortfall,balance:shortfall,annualRate:.12,annualPayment:Math.max(1200,Math.round(shortfall*.16)),remainingYears:8});
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:`You could not cover ${Math.round(shortfall).toLocaleString()} of annual costs and added it to unsecured debt.`,moneyDelta:-shortfall});
  }

  const personalDebt=state.finances.liabilities.filter(l=>l.kind==='personal').reduce((sum,l)=>sum+l.balance,0);
  const severeThreshold=Math.max(45000,grossIncome*1.35);
  if(personalDebt>severeThreshold||Number(state.flags.cashShortfallYears)>=4){
    liquidateInvestmentsForDebt(state);payDownPersonalDebt(state);
    const remaining=state.finances.liabilities.filter(l=>l.kind==='personal').reduce((sum,l)=>sum+l.balance,0);
    if(remaining>Math.max(25000,grossIncome*.75))declareBankruptcy(state);
  }
}

export function processAnnualFinance(state:GameState) {
  const country=countryById[state.character.countryId];
  const salary=state.employment.current?.salary??0;
  const specialIncome=specialCareerIncome(state);
  const rentalIncome=state.assets.properties.reduce((s,p)=>s+(p.rental?.occupied?p.rental.annualRent:0),0);
  const businessDistribution=state.businesses.reduce((s,b)=>s+(b.profit>0?Math.round(b.profit*.25):0),0);
  const gross=salary+specialIncome+rentalIncome+businessDistribution;
  const taxes=Math.round(gross*(country?.taxRate??.24));
  const age=state.character.age;
  const baseline=age<18?0:Math.round((15500+age*90)*state.economy.inflationIndex);
  const children=state.relationships.filter(r=>r.type==='child'&&state.npcs[r.npcId]?.alive&&state.npcs[r.npcId]!.age<18).length;
  const childCosts=Math.round(children*6500*state.economy.inflationIndex);
  // Ordinary leisure, clothing, local transport, subscriptions and other discretionary consumption rise with means.
  // Explicit player purchases/travel remain separate; this prevents high earners from unrealistically banking every unused salary dollar.
  const afterTaxIncome=Math.max(0,gross-taxes);
  const lifestyleRate=gross<35000?.03:gross<80000?.07:gross<160000?.10:.14;
  const lifestyleCosts=age<18?0:Math.round(afterTaxIncome*lifestyleRate);
  const petCosts=Math.round(state.pets.filter(p=>p.alive).length*900*state.economy.inflationIndex);
  const propertyCosts=Math.round(state.assets.properties.reduce((s,p)=>s+p.marketValue*.018,0));
  const vehicleCosts=Math.round(state.assets.vehicles.reduce((s,v)=>s+Math.max(450,v.value*.025),0));
  let debtPayments=0;
  for(const loan of state.finances.liabilities){
    if(loan.balance<=0)continue;const interest=loan.balance*loan.annualRate;const payment=Math.min(loan.balance+interest,loan.annualPayment);
    loan.balance=Math.max(0,loan.balance+interest-payment);loan.remainingYears=Math.max(0,loan.remainingYears-1);debtPayments+=payment;
  }
  state.finances.liabilities=state.finances.liabilities.filter(l=>l.balance>.5);
  const expenses=baseline+lifestyleCosts+childCosts+petCosts+propertyCosts+vehicleCosts+debtPayments+taxes;
  // Business distributions are credited by BusinessSystem before finance processing, so do not add them twice here.
  state.finances.cash+=salary+specialIncome+rentalIncome-expenses;
  handleCashShortfall(state,gross);
  state.finances.annualIncome=gross;state.finances.annualExpenses=expenses;state.finances.taxesPaid=taxes;
  const investmentReturn=state.investments.positions.reduce((sum,pos)=>{const hist=state.investments.history[pos.securityId]??[];if(hist.length<2)return sum;return sum+pos.units*(hist.at(-1)!-hist.at(-2)!);},0);
  state.finances.lastYearSummary={income:gross,expenses:expenses-taxes,taxes,investmentReturn:roundMoney(investmentReturn),businessProfit:state.businesses.reduce((s,b)=>s+b.profit,0),netChange:gross-expenses};
  state.legacy.totalFamilyWealth=Math.max(state.legacy.totalFamilyWealth,netWorth(state));
}
