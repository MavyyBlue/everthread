import { businessIndustries, propertyDefinitions } from '../data/assets';
import { NPC_ASSET_LIMITS } from '../data/npcAssetRules';
import { makeStateId } from '../core/ids';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import type { Business, GameState, Loan, Npc, PropertyAsset } from '../types/game';
import type { NpcAssetPortfolio, NpcBusinessHolding, NpcPropertyHolding } from '../types/npcAssets';

const MAX_NEW_PROPERTIES=NPC_ASSET_LIMITS.organicProperties;
const MAX_NEW_BUSINESSES=NPC_ASSET_LIMITS.organicBusinesses;
export const MAX_NPC_PROPERTIES=NPC_ASSET_LIMITS.portfolioProperties;
export const MAX_NPC_BUSINESSES=NPC_ASSET_LIMITS.portfolioBusinesses;
const NPC_PROPERTY_VALUE_CAP=NPC_ASSET_LIMITS.simulatedPropertyValue;
const NPC_BUSINESS_VALUE_CAP=NPC_ASSET_LIMITS.simulatedBusinessValue;
const PROPERTY_BY_ID=new Map(propertyDefinitions.map(item=>[item.id,item] as const));
const BUSINESS_BY_ID=new Map(businessIndustries.map(item=>[item.id,item] as const));

function safeMoney(value:number){return Math.max(0,Number.isFinite(value)?Math.round(value):0);}
function stableLegacyPropertyId(npc:Npc){return `npc-property-legacy-${npc.id}`;}
function propertyNet(property:NpcPropertyHolding){return Math.max(0,safeMoney(property.marketValue)-safeMoney(property.mortgageBalance));}
function businessNet(business:NpcBusinessHolding){return business.active?safeMoney(business.valuation):0;}

function nearestPropertyDefinition(value:number){
  const target=Math.max(1,value);let best=propertyDefinitions[0]!;let bestDistance=Infinity;
  for(const candidate of propertyDefinitions){const distance=Math.abs(Math.log(Math.max(1,candidate.basePrice)/target));if(distance<bestDistance){best=candidate;bestDistance=distance;}}
  return best;
}

function legacyPropertyFromProjection(npc:Npc):NpcPropertyHolding|undefined {
  const value=safeMoney(npc.life?.finance.propertyValue??0);if(!value)return undefined;
  const def=nearestPropertyDefinition(value);const mortgage=Math.min(value,safeMoney(npc.life?.finance.debt??0));
  return{id:stableLegacyPropertyId(npc),typeId:def.id,name:def.name,location:npc.city,purchasePrice:value,marketValue:value,mortgageBalance:mortgage,condition:78,propertyAge:Math.max(0,Math.min(40,npc.age-24)),acquiredAge:Math.max(18,npc.age-Math.max(1,Math.min(12,npc.age-18))),origin:'generated'};
}

export function ensureNpcAssetPortfolio(_state:GameState,npc:Npc):NpcAssetPortfolio {
  const portfolio=npc.assetPortfolio??={properties:[],businesses:[]};
  portfolio.properties=Array.isArray(portfolio.properties)?portfolio.properties:[];
  portfolio.businesses=Array.isArray(portfolio.businesses)?portfolio.businesses:[];
  if(!portfolio.properties.length){const legacy=legacyPropertyFromProjection(npc);if(legacy)portfolio.properties.push(legacy);}
  npc.assetPortfolio=portfolio;syncNpcAssetProjection(npc);return portfolio;
}

/**
 * Minor NPC inheritance uses the same hard cardinality caps as a released NPC
 * portfolio. Overflow is converted to liquid trust value immediately, so a
 * child receiving several estates cannot become an unbounded save-size sink.
 */
export function normalizeNpcInheritanceTrust(npc:Npc){
  const trust=npc.inheritanceTrust;if(!trust)return;
  const sourceProperties=Array.isArray(trust.properties)?trust.properties:[];
  const sourceBusinesses=Array.isArray(trust.businesses)?trust.businesses:[];
  let liquid=Number.isFinite(trust.liquidValue)?Math.max(0,Math.round(trust.liquidValue!)):Math.max(0,(sourceProperties.length||sourceBusinesses.length)?0:Math.round(trust.value??0));
  const propertyIds=new Set<string>();const properties:NpcPropertyHolding[]=[];
  for(const property of sourceProperties){if(!property?.id||propertyIds.has(property.id))continue;propertyIds.add(property.id);if(properties.length<MAX_NPC_PROPERTIES)properties.push(property);else liquid+=propertyNet(property);}
  const businessIds=new Set<string>();const businesses:NpcBusinessHolding[]=[];
  for(const business of sourceBusinesses){if(!business?.id||businessIds.has(business.id))continue;businessIds.add(business.id);if(businesses.length<MAX_NPC_BUSINESSES)businesses.push(business);else liquid+=businessNet(business);}
  trust.properties=properties;trust.businesses=businesses;trust.liquidValue=safeMoney(liquid);
  const represented=trust.liquidValue+properties.reduce((sum,item)=>sum+propertyNet(item),0)+businesses.reduce((sum,item)=>sum+businessNet(item),0);
  trust.value=Math.max(safeMoney(trust.value??0),safeMoney(represented));
}

export function addNpcInheritanceTrustHoldings(npc:Npc,properties:NpcPropertyHolding[],businesses:NpcBusinessHolding[]){
  const trust=npc.inheritanceTrust;if(!trust)return 0;normalizeNpcInheritanceTrust(npc);
  const propertyIds=new Set((trust.properties??[]).map(item=>item.id));const businessIds=new Set((trust.businesses??[]).map(item=>item.id));let liquidated=0;
  for(const property of properties){if(propertyIds.has(property.id))continue;propertyIds.add(property.id);if((trust.properties?.length??0)<MAX_NPC_PROPERTIES)trust.properties!.push(structuredClone(property));else liquidated+=propertyNet(property);}
  for(const business of businesses){if(businessIds.has(business.id))continue;businessIds.add(business.id);if((trust.businesses?.length??0)<MAX_NPC_BUSINESSES)trust.businesses!.push(structuredClone(business));else liquidated+=businessNet(business);}
  trust.liquidValue=safeMoney((trust.liquidValue??0)+liquidated);normalizeNpcInheritanceTrust(npc);return liquidated;
}

export function initializeNpcAssetPortfolios(state:GameState){for(const npc of Object.values(state.npcs))ensureNpcAssetPortfolio(state,npc);}
export function migrateNpcAssetPortfolios(state:GameState){initializeNpcAssetPortfolios(state);for(const npc of Object.values(state.npcs))normalizeNpcInheritanceTrust(npc);}

export function npcPropertyGross(npc:Npc){return (npc.assetPortfolio?.properties??[]).reduce((sum,item)=>sum+safeMoney(item.marketValue),0);}
export function npcMortgageDebt(npc:Npc){return (npc.assetPortfolio?.properties??[]).reduce((sum,item)=>sum+safeMoney(item.mortgageBalance),0);}
export function npcPropertyEquity(npc:Npc){return Math.max(0,npcPropertyGross(npc)-npcMortgageDebt(npc));}
export function npcBusinessValue(npc:Npc){return (npc.assetPortfolio?.businesses??[]).reduce((sum,item)=>sum+businessNet(item),0);}
export function npcAssetNetValue(npc:Npc){return npcPropertyEquity(npc)+npcBusinessValue(npc);}
export function npcNetWorth(npc:Npc){const debt=Math.max(0,npc.life?.finance.debt??0);const mortgage=npcMortgageDebt(npc);const unsecured=Math.max(0,debt-mortgage);return Math.max(0,Math.round(Math.max(0,npc.wealth)+npcPropertyEquity(npc)+npcBusinessValue(npc)-unsecured));}

export function syncNpcAssetProjection(npc:Npc){if(npc.life)npc.life.finance.propertyValue=npcPropertyGross(npc);}

function addAssetMemory(state:GameState,npc:Npc,kind:string,sentiment:number,summary:string){npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:npc.age,kind,sentiment,summary,permanent:true});if(npc.memories.length>36)npc.memories=npc.memories.slice(-36);}

function maybeBuyNpcProperty(state:GameState,npc:Npc,rng:ReturnType<typeof createRng>,allowGrowth:boolean){
  if(!allowGrowth||npc.age<26)return;
  const portfolio=ensureNpcAssetPortfolio(state,npc);if(portfolio.properties.length>=MAX_NEW_PROPERTIES)return;
  const first=portfolio.properties.length===0;
  if(first){if(npc.wealth<55_000||!npc.traits.includes('responsible')||!rng.chance(.045))return;}
  else{if(npc.age<32||npc.wealth<220_000||!(npc.traits.includes('ambitious')||npc.traits.includes('responsible'))||!rng.chance(.012))return;}
  const income=Math.max(0,npc.life?.finance.annualIncome??0);const budget=Math.max(90_000,Math.min(2_500_000,npc.wealth*(first?1.8:1.3)+income*2.4));
  const options=propertyDefinitions.filter(def=>def.basePrice*state.economy.housingIndex<=budget);if(!options.length)return;
  const def=rng.pick(options);const price=safeMoney(def.basePrice*state.economy.housingIndex*rng.int(92,108)/100);const down=safeMoney(price*(first ? .22 : .30));if(npc.wealth<down+12_000)return;
  npc.wealth-=down;portfolio.properties.push({id:makeStateId(state,'npc-property'),typeId:def.id,name:def.name,location:npc.city,purchasePrice:price,marketValue:price,mortgageBalance:Math.max(0,price-down),condition:rng.int(80,96),propertyAge:0,acquiredAge:npc.age,origin:'purchased'});
  syncNpcAssetProjection(npc);addAssetMemory(state,npc,first?'home':'property',5,first?`Bought a ${def.name}.`:`Bought an additional ${def.name}.`);
}

function businessName(npc:Npc,industryName:string,index:number){const noun=industryName.replace(/\b(Group|Company|Firm|Studio|Studios|Brand|Shops|Services|Network)\b/gi,'').trim();return `${npc.lastName} ${noun}${index>0?` ${index+1}`:''}`.trim();}
function maybeStartNpcBusiness(state:GameState,npc:Npc,rng:ReturnType<typeof createRng>,allowGrowth:boolean){
  if(!allowGrowth||npc.age<25||npc.age>67)return;const portfolio=ensureNpcAssetPortfolio(state,npc);if(portfolio.businesses.filter(item=>item.active).length>=MAX_NEW_BUSINESSES)return;
  const aptitude=npc.life?.aptitude??50;if(npc.wealth<70_000||!(npc.traits.includes('ambitious')||aptitude>=72)||!rng.chance(.018))return;
  if(portfolio.businesses.length>=MAX_NPC_BUSINESSES){const oldestClosed=portfolio.businesses.findIndex(item=>!item.active);if(oldestClosed<0)return;portfolio.businesses.splice(oldestClosed,1);}
  const capacity=Math.max(75_000,npc.wealth*1.7);const options=businessIndustries.filter(industry=>industry.startupCapital<=capacity);if(!options.length)return;
  const industry=rng.pick(options);const contribution=Math.min(npc.wealth-25_000,safeMoney(industry.startupCapital*.55));if(contribution<industry.startupCapital*.28)return;
  npc.wealth-=contribution;const valuation=safeMoney(contribution*rng.int(105,125)/100);portfolio.businesses.push({id:makeStateId(state,'npc-business'),industryId:industry.id,name:businessName(npc,industry.name,portfolio.businesses.length),foundedYear:state.currentYear,acquiredAge:npc.age,valuation,annualProfit:0,employees:Math.max(1,Math.round(contribution/45_000)),reputation:rng.int(42,67),active:true,origin:'purchased'});addAssetMemory(state,npc,'business',6,`Founded ${portfolio.businesses.at(-1)!.name}.`);
}

export interface NpcAssetYearResult {mortgagePayment:number;businessCashFlow:number;}
export function processNpcAssetPortfolioYear(state:GameState,npc:Npc,allowGrowth=true):NpcAssetYearResult {
  const portfolio=ensureNpcAssetPortfolio(state,npc);const rng=createRng(`${state.seed}-npc-assets-${npc.id}-${state.currentYear}`);const mortgageBefore=npcMortgageDebt(npc);const unsecuredDebt=Math.max(0,(npc.life?.finance.debt??0)-mortgageBefore);let mortgagePayment=0;let businessCashFlow=0;
  for(const property of portfolio.properties){property.propertyAge=Math.max(0,property.propertyAge+1);property.condition=clamp(property.condition-rng.int(0,2));const move=(state.economy.housingIndex-1)*.018+rng.int(-2,4)/100;property.marketValue=safeMoney(Math.min(NPC_PROPERTY_VALUE_CAP,Math.max(1000,property.marketValue*clamp(1+move,.985,1.055))));if(property.mortgageBalance>0){const payment=Math.min(property.mortgageBalance,Math.max(1000,property.mortgageBalance*.055));property.mortgageBalance=safeMoney(property.mortgageBalance-payment);mortgagePayment+=payment;}}
  for(const business of portfolio.businesses){if(!business.active)continue;const industry=BUSINESS_BY_ID.get(business.industryId);if(!industry){business.active=false;business.annualProfit=0;continue;}const shock=(rng.next()-.5)*2*industry.volatility;const margin=(industry.marginRange[0]+industry.marginRange[1])/2;const returnRate=clamp(margin*.42+shock*.12+(state.economy.businessDemandIndex-1)*.08,-.18,.24);business.annualProfit=Math.round(business.valuation*returnRate);const growth=clamp(returnRate*.58+shock*.045,-.17,.20);business.valuation=safeMoney(Math.min(NPC_BUSINESS_VALUE_CAP,Math.max(0,business.valuation*(1+growth))));business.reputation=clamp(business.reputation+(returnRate>0?rng.int(0,3):rng.int(-4,1)));business.employees=Math.max(1,Math.min(5000,Math.round(business.employees*(1+clamp(growth,-.08,.10)))));if(business.annualProfit>0)businessCashFlow+=Math.round(business.annualProfit*.25);else businessCashFlow-=Math.min(npc.wealth,Math.round(Math.abs(business.annualProfit)*.18));if(business.valuation<10_000&&business.annualProfit<0&&rng.chance(.35)){business.active=false;business.valuation=0;business.annualProfit=0;addAssetMemory(state,npc,'business_loss',-7,`${business.name} closed after sustained losses.`);}}
  if(npc.life)npc.life.finance.debt=Math.max(0,Math.round(unsecuredDebt+npcMortgageDebt(npc)));
  maybeBuyNpcProperty(state,npc,rng,allowGrowth);maybeStartNpcBusiness(state,npc,rng,allowGrowth);syncNpcAssetProjection(npc);
  if(npc.life)npc.life.finance.debt=Math.max(0,Math.round(unsecuredDebt+npcMortgageDebt(npc)));
  return{mortgagePayment,businessCashFlow};
}

export function npcPropertyFromPlayerAsset(_state:GameState,owner:Npc,property:PropertyAsset,mortgage?:Loan,inheritedFromNpcId?:string):NpcPropertyHolding {
  return{id:property.id,typeId:property.typeId,name:property.name,location:property.location,purchasePrice:safeMoney(property.purchasePrice),marketValue:safeMoney(property.marketValue),mortgageBalance:safeMoney(mortgage?.balance??0),condition:clamp(property.condition),propertyAge:Math.max(0,Math.floor(property.age)),acquiredAge:owner.age,origin:'inherited',...(inheritedFromNpcId?{inheritedFromNpcId}:{})};
}
export function npcBusinessFromPlayerBusiness(state:GameState,owner:Npc,business:Business,inheritedFromNpcId?:string):NpcBusinessHolding {
  const foundedYear=state.currentYear-Math.max(0,state.character.age-business.foundedAge);return{id:business.id,industryId:business.industryId,name:business.name,foundedYear,acquiredAge:owner.age,valuation:safeMoney(business.valuation),annualProfit:Math.round(Number.isFinite(business.profit)?business.profit:0),employees:Math.max(1,Math.floor(business.employees)),reputation:clamp(business.reputation),active:!business.bankrupt,origin:'inherited',...(inheritedFromNpcId?{inheritedFromNpcId}:{})};
}

export function playerPropertyFromNpcHolding(state:GameState,property:NpcPropertyHolding):{property:PropertyAsset;mortgage?:Loan}{
  const mortgageId=property.mortgageBalance>0?makeStateId(state,'loan'):undefined;const converted:PropertyAsset={id:property.id,typeId:property.typeId,name:property.name,location:property.location,purchasePrice:safeMoney(property.purchasePrice),marketValue:safeMoney(property.marketValue),condition:clamp(property.condition),age:Math.max(0,Math.floor(property.propertyAge)),amenities:[...(PROPERTY_BY_ID.get(property.typeId)?.amenities??[])],...(mortgageId?{mortgageId}:{})};
  const mortgage=mortgageId?{id:mortgageId,kind:'mortgage' as const,principal:safeMoney(property.mortgageBalance),balance:safeMoney(property.mortgageBalance),annualRate:.052,annualPayment:Math.max(1000,Math.round(property.mortgageBalance/25+property.mortgageBalance*.052)),remainingYears:25,assetId:property.id}:undefined;return{property:converted,...(mortgage?{mortgage}:{})};
}
export function playerBusinessFromNpcHolding(state:GameState,business:NpcBusinessHolding):Business {
  const years=Math.max(0,state.currentYear-business.foundedYear);const foundedAge=Math.max(18,state.character.age-years);const profit=Math.round(business.annualProfit);const revenue=Math.max(Math.abs(profit)*3,Math.round(business.valuation*.28),1);return{id:business.id,industryId:business.industryId,name:business.name,foundedAge,capital:Math.round(business.valuation*.32),revenue,expenses:Math.max(0,revenue-profit),profit,employees:Math.max(1,Math.floor(business.employees)),demand:clamp(50+(state.economy.businessDemandIndex-1)*35),reputation:clamp(business.reputation),valuation:safeMoney(business.valuation),productIds:[],priceIndex:1,marketingBudget:0,compensationIndex:1,bankrupt:!business.active};
}

export function addNpcPropertyHolding(state:GameState,npc:Npc,holding:NpcPropertyHolding){const portfolio=ensureNpcAssetPortfolio(state,npc);if(portfolio.properties.some(item=>item.id===holding.id))return false;if(portfolio.properties.length>=MAX_NPC_PROPERTIES){npc.wealth=Math.max(0,Math.round(npc.wealth+propertyNet(holding)));return false;}portfolio.properties.push(structuredClone(holding));syncNpcAssetProjection(npc);return true;}
export function addNpcBusinessHolding(state:GameState,npc:Npc,holding:NpcBusinessHolding){const portfolio=ensureNpcAssetPortfolio(state,npc);if(portfolio.businesses.some(item=>item.id===holding.id))return false;if(portfolio.businesses.length>=MAX_NPC_BUSINESSES){npc.wealth=Math.max(0,Math.round(npc.wealth+businessNet(holding)));return false;}portfolio.businesses.push(structuredClone(holding));return true;}
export function clearNpcAssetPortfolio(npc:Npc){npc.assetPortfolio={properties:[],businesses:[]};syncNpcAssetProjection(npc);}
