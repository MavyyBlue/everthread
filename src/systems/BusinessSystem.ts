import { businessIndustries } from '../data/assets';
import type { Business, EngineResult, GameState } from '../types/game';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';

export function startBusiness(state:GameState,industryId:string,name:string):EngineResult {
  if(state.character.age<18)return{success:false,messages:[{text:'You must be an adult to start a company.'}]};
  const industry=businessIndustries.find(i=>i.id===industryId);if(!industry)return{success:false,messages:[{text:'Unknown industry.'}]};
  if(state.finances.cash<industry.startupCapital)return{success:false,messages:[{text:`You need ${industry.startupCapital.toLocaleString()} in available cash to fund this business.`}]};
  state.finances.cash-=industry.startupCapital;
  const business:Business={id:makeStateId(state,'biz'),industryId,name:name.trim()||`New ${industry.name}`,foundedAge:state.character.age,capital:industry.startupCapital,revenue:0,expenses:0,profit:0,employees:Math.max(1,Math.round(industry.startupCapital/50000)),demand:55,reputation:35,valuation:industry.startupCapital,productIds:[`${industryId}_product_1`],priceIndex:1,marketingBudget:Math.round(industry.startupCapital*.05),compensationIndex:1,bankrupt:false};
  state.businesses.push(business);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'business',importance:3,text:`You founded ${business.name}, a ${industry.name.toLowerCase()} business.`,moneyDelta:-industry.startupCapital});
  return{success:true,messages:[{text:`${business.name} is open for business.`}]};
}

export function processBusinessesYear(state:GameState) {
  const rng=createRng(`${state.seed}-business`,state.rngCounter);
  for(const b of state.businesses){
    if(b.bankrupt)continue; const industry=businessIndustries.find(i=>i.id===b.industryId);if(!industry)continue;
    const age=Math.max(1,state.character.age-b.foundedAge+1); const founderSkill=state.character.talents.business/100;
    const reputationFactor=.55+b.reputation/130; const demandFactor=.55+b.demand/130; const productFactor=.75+b.productIds.length*.08;
    const scale=Math.max(1,b.employees)*42000; const market=state.economy.businessDemandIndex;
    const shock=1+(rng.next()-.5)*2*industry.volatility; const priceEffect=Math.max(.55,1.15-Math.abs(b.priceIndex-1.05)*.6);
    b.revenue=Math.max(0,Math.round(scale*reputationFactor*demandFactor*productFactor*market*shock*priceEffect));
    const marginBase=industry.marginRange[0]+(industry.marginRange[1]-industry.marginRange[0])*(.35+founderSkill*.5);
    const payroll=b.employees*32000*b.compensationIndex; const ops=b.revenue*Math.max(.25,.58-marginBase); b.expenses=Math.round(payroll+ops+b.marketingBudget);
    b.profit=Math.round(b.revenue-b.expenses); b.capital+=b.profit;
    if(b.profit>0){const distribution=Math.round(b.profit*.25);state.finances.cash+=distribution;b.capital-=distribution;b.reputation=clamp(b.reputation+rng.int(0,3));b.demand=clamp(b.demand+rng.int(-2,4));}
    else {b.reputation=clamp(b.reputation+rng.int(-4,1));b.demand=clamp(b.demand+rng.int(-5,2));}
    if(b.profit>0 && rng.chance(.32+founderSkill*.2)) b.employees+=Math.max(1,Math.round(b.employees*rng.int(3,14)/100));
    if(b.profit<0 && b.capital<0){b.employees=Math.max(0,Math.floor(b.employees*.75));if(b.capital < -industry.startupCapital*.65 && rng.chance(.45)){b.bankrupt=true;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'business',importance:3,text:`${b.name} went bankrupt after ${age} years.`});}}
    b.valuation=Math.max(0,Math.round(Math.max(b.capital,0)+Math.max(0,b.profit)*rng.int(5,12)+b.revenue*rng.int(40,110)/100));
  }
  state.rngCounter=rng.counter();
}

export function tuneBusiness(state:GameState,businessId:string,field:'priceIndex'|'marketingBudget'|'compensationIndex',value:number):EngineResult {
  const b=state.businesses.find(b=>b.id===businessId&&!b.bankrupt);if(!b)return{success:false,messages:[{text:'Business unavailable.'}]};
  if(field==='priceIndex')b.priceIndex=clamp(value,.5,2);if(field==='marketingBudget')b.marketingBudget=Math.max(0,Math.min(value,Math.max(0,b.capital)));if(field==='compensationIndex')b.compensationIndex=clamp(value,.6,1.8);
  return{success:true,messages:[{text:`Updated ${field.replace('Index','').replace(/([A-Z])/g,' $1').toLowerCase()} for ${b.name}.`}]};
}

export function addBusinessProduct(state:GameState,businessId:string):EngineResult {
  const b=state.businesses.find(b=>b.id===businessId&&!b.bankrupt);if(!b)return{success:false,messages:[{text:'Business unavailable.'}]};
  const industry=businessIndustries.find(i=>i.id===b.industryId)!;if(b.productIds.length>=industry.productNames.length)return{success:false,messages:[{text:'This business has already launched every current product line.'}]};
  const cost=Math.round(industry.startupCapital*(.12+b.productIds.length*.05));if(b.capital<cost)return{success:false,messages:[{text:`The company needs ${cost.toLocaleString()} in capital for the next launch.`}]};
  b.capital-=cost;b.productIds.push(`${b.industryId}_product_${b.productIds.length+1}`);b.demand=clamp(b.demand+6);return{success:true,messages:[{text:`${b.name} launched ${industry.productNames[b.productIds.length-1]}.`}]};
}
