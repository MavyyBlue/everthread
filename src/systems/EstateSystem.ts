import type { Business, CollectibleAsset, EngineResult, GameState, InvestmentPosition, Loan, Npc, PropertyAsset } from '../types/game';
import type { EstateAssetBequest, EstateAssetKind, EstateHeirRole, EstateTrustState } from '../types/estate';
import { makeStateId } from '../core/ids';
import { quoteEstateAdministration } from '../data/estateRules';
import { addNpcBusinessHolding, addNpcInheritanceTrustHoldings, addNpcPropertyHolding, npcBusinessFromPlayerBusiness, npcPropertyFromPlayerAsset } from './NpcAssetSystem';
import { creditCardDebt, securedCreditDeposits } from './CreditSystem';

type HeirShare={npc:Npc;ratio:number;role:EstateHeirRole};
type EstateItem=
  | {kind:'property';id:string;name:string;value:number;property:PropertyAsset;mortgage?:Loan;requestedBeneficiaryId?:string}
  | {kind:'business';id:string;name:string;value:number;business:Business;requestedBeneficiaryId?:string}
  | {kind:'collectible';id:string;name:string;value:number;collectible:CollectibleAsset;requestedBeneficiaryId?:string};

type EstateAllocation={heir:HeirShare;items:EstateItem[];cash:number;investmentValue:number;total:number};
type EstateForcedSaleReason='obligations'|'fairness';
type EstateForcedSale={key:string;kind:EstateAssetKind;id:string;name:string;value:number;saleValue:number;reason:EstateForcedSaleReason};
type EstatePlan={heirs:HeirShare[];allocations:Map<string,EstateAllocation>;remainingInvestmentRatio:number;grossEstateValue:number;estateValue:number;debtObligations:number;administrationCosts:number;administrationAllowance:number;estateLevy:number;levyAllowance:number;levyRate:number;ruleLabel:string;countryName:string;estateObligations:number;forcedSaleIds:string[];forcedSales:EstateForcedSale[]};

export interface EstateHeirPreview {
  npcId:string;
  name:string;
  role:EstateHeirRole;
  percentage:number;
  cash:number;
  investmentValue:number;
  inheritanceValue:number;
  heldUntilAge?:number;
  properties:Array<{id:string;name:string;value:number}>;
  businesses:Array<{id:string;name:string;value:number}>;
  collectibles:Array<{id:string;name:string;value:number}>;
}

export interface EstatePreview {grossEstateValue:number;estateValue:number;debtObligations:number;administrationCosts:number;administrationAllowance:number;estateLevy:number;levyAllowance:number;levyRate:number;ruleLabel:string;countryName:string;estateObligations:number;distributableValue:number;forcedSaleIds:string[];forcedSales:Array<{key:string;kind:EstateAssetKind;id:string;name:string;value:number;saleValue:number;reason:EstateForcedSaleReason}>;heirs:EstateHeirPreview[];}
export interface EstateSettlement {
  cash:number;
  properties:PropertyAsset[];
  businesses:Business[];
  collectibles:CollectibleAsset[];
  investments:InvestmentPosition[];
  liabilities:Loan[];
  inheritanceValue:number;
  siblingValue:number;
  forcedSales:number;
  debtObligations:number;
  administrationCosts:number;
  administrationAllowance:number;
  estateLevy:number;
  estateObligations:number;
}

export function livingEstateHeirs(state:GameState):Array<{npc:Npc;role:EstateHeirRole}>{
  const result:Array<{npc:Npc;role:EstateHeirRole}>=[];
  const spouseRel=state.relationships.find(rel=>rel.type==='spouse'&&!rel.estranged&&state.npcs[rel.npcId]?.alive);
  if(spouseRel){const spouse=state.npcs[spouseRel.npcId];if(spouse)result.push({npc:spouse,role:'spouse'});}
  for(const rel of state.relationships.filter(rel=>rel.type==='child')){
    const npc=state.npcs[rel.npcId];if(npc?.alive)result.push({npc,role:'child'});
  }
  return result;
}

function heirShares(state:GameState):HeirShare[]{
  const eligible=livingEstateHeirs(state);
  if(!eligible.length)return[];
  const spouse=eligible.find(entry=>entry.role==='spouse');
  const children=eligible.filter(entry=>entry.role==='child');
  const validIds=new Set(eligible.map(entry=>entry.npc.id));
  const rawWill=(state.inheritance.will??[]).filter(entry=>validIds.has(entry.npcId)&&Number.isFinite(entry.percentage)&&entry.percentage>=0);
  const spouseExplicit=Boolean(spouse&&rawWill.some(entry=>entry.npcId===spouse.npc.id));
  const positive=rawWill.filter(entry=>entry.percentage>0);
  const positiveTotal=positive.reduce((sum,entry)=>sum+entry.percentage,0);

  if(positiveTotal>0){
    if(spouse&&!spouseExplicit&&children.length){
      const childEntries=positive.filter(entry=>children.some(child=>child.npc.id===entry.npcId));
      const childTotal=childEntries.reduce((sum,entry)=>sum+entry.percentage,0);
      if(childTotal>0){
        const childRatio=new Map(childEntries.map(entry=>[entry.npcId,(entry.percentage/childTotal)*.5]));
        return [
          {npc:spouse.npc,role:'spouse',ratio:.5},
          ...children.map(child=>({npc:child.npc,role:'child' as const,ratio:childRatio.get(child.npc.id)??0})),
        ];
      }
    }
    const ratioById=new Map(positive.map(entry=>[entry.npcId,entry.percentage/positiveTotal]));
    return eligible.map(entry=>({npc:entry.npc,role:entry.role,ratio:ratioById.get(entry.npc.id)??0}));
  }

  if(spouse&&children.length)return [
    {npc:spouse.npc,role:'spouse',ratio:.5},
    ...children.map(child=>({npc:child.npc,role:'child' as const,ratio:.5/children.length})),
  ];
  if(spouse)return[{npc:spouse.npc,role:'spouse',ratio:1}];
  return children.map(child=>({npc:child.npc,role:'child',ratio:1/children.length}));
}

function mortgageFor(state:GameState,property:PropertyAsset){return property.mortgageId?state.finances.liabilities.find(loan=>loan.id===property.mortgageId):undefined;}
function propertyEquity(state:GameState,property:PropertyAsset){return Math.max(0,property.marketValue-(mortgageFor(state,property)?.balance??0));}
function propertySaleValue(state:GameState,property:PropertyAsset){return Math.max(0,property.marketValue-(mortgageFor(state,property)?.balance??0)-Math.round(property.marketValue*.035));}
function itemSaleValue(state:GameState,item:EstateItem){if(item.kind==='property')return propertySaleValue(state,item.property);if(item.kind==='business')return item.business.bankrupt?0:item.business.valuation*.95;return item.collectible.estimatedValue*.92;}
function estateAssetExists(state:GameState,kind:EstateAssetKind,assetId:string){if(kind==='property')return state.assets.properties.some(asset=>asset.id===assetId);if(kind==='business')return state.businesses.some(asset=>asset.id===assetId&&!asset.bankrupt);return state.assets.collectibles.some(asset=>asset.id===assetId);}

function validBequestMap(state:GameState,heirs:HeirShare[]){
  const livingIds=new Set(heirs.map(heir=>heir.npc.id));const result=new Map<string,string>();
  for(const bequest of state.inheritance.assetBequests??[]){if(!livingIds.has(bequest.beneficiaryNpcId)||!estateAssetExists(state,bequest.kind,bequest.assetId))continue;result.set(`${bequest.kind}:${bequest.assetId}`,bequest.beneficiaryNpcId);}
  return result;
}

function makeCandidateItems(state:GameState,bequests:Map<string,string>){
  let liquid=Math.max(0,state.finances.cash)+securedCreditDeposits(state);const items:EstateItem[]=[];
  for(const vehicle of state.assets.vehicles)liquid+=Math.max(0,vehicle.value*.96);
  for(const property of state.assets.properties){const value=propertyEquity(state,property);const requestedBeneficiaryId=bequests.get(`property:${property.id}`);if((requestedBeneficiaryId||state.inheritance.inheritProperties)&&value>0)items.push({kind:'property',id:property.id,name:property.name,value,property,mortgage:mortgageFor(state,property),...(requestedBeneficiaryId?{requestedBeneficiaryId}:{})});else liquid+=propertySaleValue(state,property);}
  for(const business of state.businesses){if(business.bankrupt)continue;const requestedBeneficiaryId=bequests.get(`business:${business.id}`);if(requestedBeneficiaryId||state.inheritance.inheritBusinesses)items.push({kind:'business',id:business.id,name:business.name,value:Math.max(0,business.valuation),business,...(requestedBeneficiaryId?{requestedBeneficiaryId}:{})});else liquid+=Math.max(0,business.valuation*.95);}
  for(const collectible of state.assets.collectibles){const requestedBeneficiaryId=bequests.get(`collectible:${collectible.id}`);items.push({kind:'collectible',id:collectible.id,name:collectible.name,value:Math.max(0,collectible.estimatedValue),collectible,...(requestedBeneficiaryId?{requestedBeneficiaryId}:{})});}
  return{liquid,items};
}

function buildEstatePlan(state:GameState):EstatePlan{
  const heirs=heirShares(state);const allocations=new Map<string,EstateAllocation>();
  if(!heirs.length)return{heirs,allocations,remainingInvestmentRatio:0,grossEstateValue:0,estateValue:0,debtObligations:0,administrationCosts:0,administrationAllowance:0,estateLevy:0,levyAllowance:0,levyRate:0,ruleLabel:'',countryName:'',estateObligations:0,forcedSaleIds:[],forcedSales:[]};
  const bequests=validBequestMap(state,heirs);let{liquid,items}=makeCandidateItems(state,bequests);const forcedSaleIds:string[]=[];const forcedSales:EstateForcedSale[]=[];
  const debtObligations=state.finances.liabilities.filter(loan=>loan.kind!=='mortgage').reduce((sum,loan)=>sum+Math.max(0,loan.balance),0)+creditCardDebt(state);
  const originalInvestmentValue=state.investments.positions.reduce((sum,position)=>sum+position.units*(state.investments.prices[position.securityId]??0),0);
  const grossBeforeDebt=liquid+originalInvestmentValue+items.reduce((sum,item)=>sum+item.value,0);
  const administration=quoteEstateAdministration(state.character.countryId,grossBeforeDebt,debtObligations);
  const estateObligations=administration.totalObligations;
  let obligationRemaining=estateObligations;
  let remainingInvestmentValue=originalInvestmentValue;
  const fromLiquid=Math.min(liquid,obligationRemaining);liquid-=fromLiquid;obligationRemaining-=fromLiquid;
  const sellItemsForObligations=(candidates:EstateItem[])=>{
    const saleOrder=[...candidates].sort((a,b)=>(itemSaleValue(state,b)/Math.max(1,b.value))-(itemSaleValue(state,a)/Math.max(1,a.value)));
    const sold=new Set<string>();
    for(const item of saleOrder){if(obligationRemaining<=0)break;const proceeds=itemSaleValue(state,item);const key=`${item.kind}:${item.id}`;sold.add(key);forcedSaleIds.push(key);forcedSales.push({key,kind:item.kind,id:item.id,name:item.name,value:item.value,saleValue:proceeds,reason:'obligations'});const paid=Math.min(proceeds,obligationRemaining);obligationRemaining-=paid;liquid+=Math.max(0,proceeds-paid);}
    if(sold.size)items=items.filter(item=>!sold.has(`${item.kind}:${item.id}`));
  };
  if(obligationRemaining>0)sellItemsForObligations(items.filter(item=>!item.requestedBeneficiaryId));
  if(obligationRemaining>0&&remainingInvestmentValue>0){const paid=Math.min(remainingInvestmentValue,obligationRemaining);remainingInvestmentValue-=paid;obligationRemaining-=paid;}
  if(obligationRemaining>0)sellItemsForObligations(items.filter(item=>Boolean(item.requestedBeneficiaryId)));
  if(obligationRemaining>0){remainingInvestmentValue=0;liquid=0;items=[];}
  const remainingInvestmentRatio=originalInvestmentValue>0?remainingInvestmentValue/originalInvestmentValue:0;
  const initialTotal=liquid+remainingInvestmentValue+items.reduce((sum,item)=>sum+item.value,0);
  const targetById=new Map(heirs.map(heir=>[heir.npc.id,initialTotal*heir.ratio]));
  const assignedItems=new Map(heirs.map(heir=>[heir.npc.id,[] as EstateItem[]]));
  const assignedValue=new Map(heirs.map(heir=>[heir.npc.id,remainingInvestmentValue*heir.ratio]));
  for(const item of items.filter(item=>item.requestedBeneficiaryId)){const heirId=item.requestedBeneficiaryId!;assignedItems.get(heirId)?.push(item);assignedValue.set(heirId,(assignedValue.get(heirId)??0)+item.value);}
  const unassigned=items.filter(item=>!item.requestedBeneficiaryId).sort((a,b)=>b.value-a.value);
  for(const item of unassigned){const ranked=[...heirs].sort((a,b)=>((targetById.get(b.npc.id)??0)-(assignedValue.get(b.npc.id)??0))-((targetById.get(a.npc.id)??0)-(assignedValue.get(a.npc.id)??0)));const heir=ranked[0]!;const remaining=Math.max(0,(targetById.get(heir.npc.id)??0)-(assignedValue.get(heir.npc.id)??0));if(heirs.length>1&&item.value>remaining*1.10){const proceeds=itemSaleValue(state,item);const key=`${item.kind}:${item.id}`;liquid+=proceeds;forcedSaleIds.push(key);forcedSales.push({key,kind:item.kind,id:item.id,name:item.name,value:item.value,saleValue:proceeds,reason:'fairness'});continue;}assignedItems.get(heir.npc.id)!.push(item);assignedValue.set(heir.npc.id,(assignedValue.get(heir.npc.id)??0)+item.value);}
  const retainedTotal=[...assignedItems.values()].flat().reduce((sum,item)=>sum+item.value,0);const distributable=liquid+remainingInvestmentValue+retainedTotal;
  const finalTargets=new Map(heirs.map(heir=>[heir.npc.id,distributable*heir.ratio]));const needs=heirs.map(heir=>({heir,need:Math.max(0,(finalTargets.get(heir.npc.id)??0)-(assignedValue.get(heir.npc.id)??0))}));const totalNeed=needs.reduce((sum,entry)=>sum+entry.need,0);
  for(const{heir,need}of needs){const cash=totalNeed>0?liquid*(need/totalNeed):liquid*heir.ratio;const investmentValue=remainingInvestmentValue*heir.ratio;const itemValue=(assignedItems.get(heir.npc.id)??[]).reduce((sum,item)=>sum+item.value,0);allocations.set(heir.npc.id,{heir,items:assignedItems.get(heir.npc.id)??[],cash,investmentValue,total:itemValue+investmentValue+cash});}
  return{heirs,allocations,remainingInvestmentRatio,grossEstateValue:grossBeforeDebt,estateValue:administration.netEstateValue,debtObligations,administrationCosts:administration.administrationCosts,administrationAllowance:administration.administrationAllowance,estateLevy:administration.estateLevy,levyAllowance:administration.levyAllowance,levyRate:administration.rule.levyRate,ruleLabel:administration.rule.label,countryName:administration.countryName,estateObligations,forcedSaleIds,forcedSales};
}

export function previewEstate(state:GameState):EstatePreview{
  const plan=buildEstatePlan(state);return{grossEstateValue:plan.grossEstateValue,estateValue:plan.estateValue,debtObligations:plan.debtObligations,administrationCosts:plan.administrationCosts,administrationAllowance:plan.administrationAllowance,estateLevy:plan.estateLevy,levyAllowance:plan.levyAllowance,levyRate:plan.levyRate,ruleLabel:plan.ruleLabel,countryName:plan.countryName,estateObligations:plan.estateObligations,distributableValue:[...plan.allocations.values()].reduce((sum,allocation)=>sum+allocation.total,0),forcedSaleIds:[...plan.forcedSaleIds],forcedSales:plan.forcedSales.map(item=>({...item})),heirs:plan.heirs.map(heir=>{const allocation=plan.allocations.get(heir.npc.id);const items=allocation?.items??[];return{npcId:heir.npc.id,name:`${heir.npc.firstName} ${heir.npc.lastName}`,role:heir.role,percentage:heir.ratio*100,cash:allocation?.cash??0,investmentValue:allocation?.investmentValue??0,inheritanceValue:allocation?.total??0,...(heir.role==='child'&&heir.npc.age<18?{heldUntilAge:18}:{}),properties:items.filter((item):item is Extract<EstateItem,{kind:'property'}>=>item.kind==='property').map(item=>({id:item.id,name:item.name,value:item.value})),businesses:items.filter((item):item is Extract<EstateItem,{kind:'business'}>=>item.kind==='business').map(item=>({id:item.id,name:item.name,value:item.value})),collectibles:items.filter((item):item is Extract<EstateItem,{kind:'collectible'}>=>item.kind==='collectible').map(item=>({id:item.id,name:item.name,value:item.value}))};})};
}

export function settleEstate(state:GameState,selectedChildId:string):EstateSettlement{
  const plan=buildEstatePlan(state);const selected=plan.allocations.get(selectedChildId);if(!selected||selected.heir.role!=='child')return{cash:0,properties:[],businesses:[],collectibles:[],investments:[],liabilities:[],inheritanceValue:0,siblingValue:0,forcedSales:plan.forcedSaleIds.length,debtObligations:plan.debtObligations,administrationCosts:plan.administrationCosts,administrationAllowance:plan.administrationAllowance,estateLevy:plan.estateLevy,estateObligations:plan.estateObligations};
  let siblingValue=0;
  for(const allocation of plan.allocations.values()){
    if(allocation.heir.npc.id===selectedChildId)continue;
    const heir=allocation.heir.npc;const propertyItems=allocation.items.filter((item):item is Extract<EstateItem,{kind:'property'}>=>item.kind==='property');const businessItems=allocation.items.filter((item):item is Extract<EstateItem,{kind:'business'}>=>item.kind==='business');const collectibleValue=allocation.items.filter((item):item is Extract<EstateItem,{kind:'collectible'}>=>item.kind==='collectible').reduce((sum,item)=>sum+item.value,0);const liquidValue=Math.max(0,allocation.cash+allocation.investmentValue+collectibleValue);const properties=propertyItems.map(item=>npcPropertyFromPlayerAsset(state,heir,item.property,item.mortgage,state.character.id));const businesses=businessItems.map(item=>npcBusinessFromPlayerBusiness(state,heir,item.business,state.character.id));
    if(allocation.heir.role==='child'&&heir.age<18){const trust=heir.inheritanceTrust??{releaseAge:18,value:0,liquidValue:0,properties:[],businesses:[]};trust.releaseAge=18;trust.value=Math.max(0,Math.round((trust.value??0)+allocation.total));trust.liquidValue=Math.max(0,Math.round((trust.liquidValue??0)+liquidValue));trust.properties??=[];trust.businesses??=[];heir.inheritanceTrust=trust;addNpcInheritanceTrustHoldings(heir,properties,businesses);}
    else{heir.wealth=Math.max(0,Math.round(heir.wealth+liquidValue));for(const property of properties){const retained=addNpcPropertyHolding(state,heir,property);if(retained&&heir.life)heir.life.finance.debt+=property.mortgageBalance;}for(const business of businesses)addNpcBusinessHolding(state,heir,business);}
    siblingValue+=allocation.total;
  }
  const properties=selected.items.filter((item):item is Extract<EstateItem,{kind:'property'}>=>item.kind==='property').map(item=>structuredClone(item.property));
  const businesses=selected.items.filter((item):item is Extract<EstateItem,{kind:'business'}>=>item.kind==='business').map(item=>structuredClone(item.business));
  const collectibles=selected.items.filter((item):item is Extract<EstateItem,{kind:'collectible'}>=>item.kind==='collectible').map(item=>structuredClone(item.collectible));
  const propertyIds=new Set(properties.map(property=>property.id));
  const liabilities=state.finances.liabilities.filter(loan=>loan.kind==='mortgage'&&loan.assetId&&propertyIds.has(loan.assetId)).map(loan=>structuredClone(loan));
  const investments=state.investments.positions.map(position=>({...position,units:position.units*plan.remainingInvestmentRatio*selected.heir.ratio})).filter(position=>position.units>0.000001);
  return{cash:selected.cash,properties,businesses,collectibles,investments,liabilities,inheritanceValue:selected.total,siblingValue,forcedSales:plan.forcedSaleIds.length,debtObligations:plan.debtObligations,administrationCosts:plan.administrationCosts,administrationAllowance:plan.administrationAllowance,estateLevy:plan.estateLevy,estateObligations:plan.estateObligations};
}

export function estateTrustFromSettlement(settlement:EstateSettlement,createdAge:number):EstateTrustState{
  return{releaseAge:18,createdAge,cash:settlement.cash,properties:structuredClone(settlement.properties),businesses:structuredClone(settlement.businesses),collectibles:structuredClone(settlement.collectibles),investments:structuredClone(settlement.investments),liabilities:structuredClone(settlement.liabilities),inheritanceValue:settlement.inheritanceValue};
}

export function releaseMatureInheritanceTrust(state:GameState):boolean{
  const trust=state.inheritance.trust;if(!trust||state.character.age<trust.releaseAge)return false;
  state.finances.cash+=trust.cash;state.assets.properties.push(...structuredClone(trust.properties));state.businesses.push(...structuredClone(trust.businesses));state.assets.collectibles.push(...structuredClone(trust.collectibles));
  for(const position of trust.investments){const existing=state.investments.positions.find(item=>item.securityId===position.securityId);if(existing){const totalUnits=existing.units+position.units;existing.averageCost=totalUnits>0?((existing.averageCost*existing.units)+(position.averageCost*position.units))/totalUnits:position.averageCost;existing.units=totalUnits;}else state.investments.positions.push(structuredClone(position));}
  state.finances.liabilities.push(...structuredClone(trust.liabilities));
  const amount=trust.inheritanceValue;delete state.inheritance.trust;state.flags.inheritanceReceived=amount;state.flags.inheritancePending=0;state.flags.lifetimeInheritance=Number(state.flags.lifetimeInheritance??0)+amount;state.flags.inheritances=Number(state.flags.inheritances??0)+(amount>0?1:0);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text:`Your protected inheritance became yours at age ${state.character.age}.`});return true;
}

export function processNpcInheritanceTrusts(state:GameState){
  for(const npc of Object.values(state.npcs)){const trust=npc.inheritanceTrust;if(!trust||npc.age<trust.releaseAge)continue;const properties=trust.properties??[];const businesses=trust.businesses??[];const liquid=Math.max(0,trust.liquidValue??(properties.length||businesses.length?0:trust.value));npc.wealth=Math.max(0,Math.round(npc.wealth+liquid));for(const property of properties){const retained=addNpcPropertyHolding(state,npc,property);if(retained&&npc.life)npc.life.finance.debt+=property.mortgageBalance;}for(const business of businesses)addNpcBusinessHolding(state,npc,business);npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:npc.age,kind:'inheritance',sentiment:5,summary:`Received a protected family inheritance at age ${npc.age}.`,permanent:true});if(npc.memories.length>36)npc.memories=npc.memories.slice(-36);delete npc.inheritanceTrust;}
}

function canEditEstatePlan(state:GameState):EngineResult|undefined{if(!state.character.alive)return{success:false,messages:[{text:'Estate planning must be completed during your lifetime.'}]};if(state.character.age<18)return{success:false,messages:[{text:'Estate planning becomes available at 18.'}]};return undefined;}

export function setWill(state:GameState,beneficiaries:Array<{npcId:string;percentage:number}>):EngineResult{
  const gate=canEditEstatePlan(state);if(gate)return gate;const heirs=livingEstateHeirs(state);const eligible=new Set(heirs.map(entry=>entry.npc.id));
  if(!beneficiaries.length){state.inheritance.will=[];return{success:true,messages:[{text:'Your estate returned to the default family shares.'}]};}
  if(new Set(beneficiaries.map(entry=>entry.npcId)).size!==beneficiaries.length)return{success:false,messages:[{text:'Each beneficiary can appear only once in your will.'}]};
  if(beneficiaries.some(entry=>!eligible.has(entry.npcId)))return{success:false,messages:[{text:'Residuary beneficiaries must be your living spouse or children.'}]};
  if(beneficiaries.some(entry=>!Number.isFinite(entry.percentage)||entry.percentage<0))return{success:false,messages:[{text:'Will percentages must be valid non-negative numbers.'}]};
  const total=beneficiaries.reduce((sum,entry)=>sum+entry.percentage,0);if(Math.abs(total-100)>.01)return{success:false,messages:[{text:'Will percentages must add up to 100%.'}]};
  state.inheritance.will=beneficiaries.map(entry=>({...entry}));return{success:true,messages:[{text:'Your residuary estate shares were updated.'}]};
}

export function setEstateAssetBequest(state:GameState,kind:EstateAssetKind,assetId:string,beneficiaryNpcId?:string):EngineResult{
  const gate=canEditEstatePlan(state);if(gate)return gate;if(!estateAssetExists(state,kind,assetId))return{success:false,messages:[{text:'That asset is no longer available to include in your estate plan.'}]};
  state.inheritance.assetBequests??=[];state.inheritance.assetBequests=state.inheritance.assetBequests.filter(entry=>!(entry.kind===kind&&entry.assetId===assetId));if(!beneficiaryNpcId)return{success:true,messages:[{text:'That asset will return to the residuary estate.'}]};
  if(!livingEstateHeirs(state).some(heir=>heir.npc.id===beneficiaryNpcId))return{success:false,messages:[{text:'Specific bequests can be left only to your living spouse or children.'}]};
  const bequest:EstateAssetBequest={kind,assetId,beneficiaryNpcId};state.inheritance.assetBequests.push(bequest);return{success:true,messages:[{text:'Your specific asset bequest was updated.'}]};
}

export function setEstateRetentionPreferences(state:GameState,preferences:Partial<Pick<GameState['inheritance'],'inheritBusinesses'|'inheritProperties'>>):EngineResult{
  const gate=canEditEstatePlan(state);if(gate)return gate;if(preferences.inheritBusinesses!==undefined)state.inheritance.inheritBusinesses=preferences.inheritBusinesses;if(preferences.inheritProperties!==undefined)state.inheritance.inheritProperties=preferences.inheritProperties;return{success:true,messages:[{text:'Your estate retention preferences were updated.'}]};
}
