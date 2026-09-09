import type { Business, CollectibleAsset, EngineResult, GameState, InvestmentPosition, Loan, Npc, PropertyAsset } from '../types/game';
import type { EstateAssetBequest, EstateAssetKind } from '../types/estate';

type HeirShare={npc:Npc;ratio:number};
type EstateItem=
  | {kind:'property';id:string;name:string;value:number;property:PropertyAsset;mortgage?:Loan;requestedBeneficiaryId?:string}
  | {kind:'business';id:string;name:string;value:number;business:Business;requestedBeneficiaryId?:string}
  | {kind:'collectible';id:string;name:string;value:number;collectible:CollectibleAsset;requestedBeneficiaryId?:string};

type EstateAllocation={
  heir:HeirShare;
  items:EstateItem[];
  cash:number;
  investmentValue:number;
  total:number;
};

type EstatePlan={
  heirs:HeirShare[];
  allocations:Map<string,EstateAllocation>;
  remainingInvestmentRatio:number;
  estateValue:number;
  estateObligations:number;
  forcedSaleIds:string[];
};

export interface EstateHeirPreview {
  npcId:string;
  name:string;
  percentage:number;
  cash:number;
  investmentValue:number;
  inheritanceValue:number;
  properties:Array<{id:string;name:string;value:number}>;
  businesses:Array<{id:string;name:string;value:number}>;
  collectibles:Array<{id:string;name:string;value:number}>;
}

export interface EstatePreview {
  estateValue:number;
  estateObligations:number;
  distributableValue:number;
  forcedSaleIds:string[];
  heirs:EstateHeirPreview[];
}

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
}

function livingChildren(state:GameState){
  return state.relationships
    .filter(rel=>rel.type==='child')
    .map(rel=>state.npcs[rel.npcId])
    .filter((npc):npc is Npc=>Boolean(npc?.alive));
}

function livingChildShares(state:GameState):HeirShare[] {
  const children=livingChildren(state);
  if(!children.length)return[];
  const validWill=(state.inheritance.will??[]).filter(entry=>entry.percentage>0&&children.some(child=>child.id===entry.npcId));
  const willTotal=validWill.reduce((sum,entry)=>sum+entry.percentage,0);
  if(willTotal>0){
    const ratioById=new Map(validWill.map(entry=>[entry.npcId,entry.percentage/willTotal]));
    return children.map(npc=>({npc,ratio:ratioById.get(npc.id)??0}));
  }
  return children.map(npc=>({npc,ratio:1/children.length}));
}

function mortgageFor(state:GameState,property:PropertyAsset){
  return property.mortgageId?state.finances.liabilities.find(loan=>loan.id===property.mortgageId):undefined;
}

function propertyEquity(state:GameState,property:PropertyAsset){return Math.max(0,property.marketValue-(mortgageFor(state,property)?.balance??0));}
function propertySaleValue(state:GameState,property:PropertyAsset){return Math.max(0,property.marketValue-(mortgageFor(state,property)?.balance??0)-Math.round(property.marketValue*.035));}
function itemSaleValue(state:GameState,item:EstateItem){
  if(item.kind==='property')return propertySaleValue(state,item.property);
  if(item.kind==='business')return item.business.bankrupt?0:item.business.valuation*.95;
  return item.collectible.estimatedValue*.92;
}

function estateAssetExists(state:GameState,kind:EstateAssetKind,assetId:string){
  if(kind==='property')return state.assets.properties.some(asset=>asset.id===assetId);
  if(kind==='business')return state.businesses.some(asset=>asset.id===assetId&&!asset.bankrupt);
  return state.assets.collectibles.some(asset=>asset.id===assetId);
}

function validBequestMap(state:GameState,heirs:HeirShare[]){
  const livingIds=new Set(heirs.map(heir=>heir.npc.id));
  const result=new Map<string,string>();
  for(const bequest of state.inheritance.assetBequests??[]){
    if(!livingIds.has(bequest.beneficiaryNpcId)||!estateAssetExists(state,bequest.kind,bequest.assetId))continue;
    result.set(`${bequest.kind}:${bequest.assetId}`,bequest.beneficiaryNpcId);
  }
  return result;
}

function makeCandidateItems(state:GameState,bequests:Map<string,string>){
  let liquid=Math.max(0,state.finances.cash);
  const items:EstateItem[]=[];
  for(const vehicle of state.assets.vehicles)liquid+=Math.max(0,vehicle.value*.96);
  for(const property of state.assets.properties){
    const value=propertyEquity(state,property);
    const requestedBeneficiaryId=bequests.get(`property:${property.id}`);
    if((requestedBeneficiaryId||state.inheritance.inheritProperties)&&value>0){
      items.push({kind:'property',id:property.id,name:property.name,value,property,mortgage:mortgageFor(state,property),...(requestedBeneficiaryId?{requestedBeneficiaryId}:{})});
    }else liquid+=propertySaleValue(state,property);
  }
  for(const business of state.businesses){
    if(business.bankrupt)continue;
    const requestedBeneficiaryId=bequests.get(`business:${business.id}`);
    if(requestedBeneficiaryId||state.inheritance.inheritBusinesses){
      items.push({kind:'business',id:business.id,name:business.name,value:Math.max(0,business.valuation),business,...(requestedBeneficiaryId?{requestedBeneficiaryId}:{})});
    }else liquid+=Math.max(0,business.valuation*.95);
  }
  for(const collectible of state.assets.collectibles){
    const requestedBeneficiaryId=bequests.get(`collectible:${collectible.id}`);
    items.push({kind:'collectible',id:collectible.id,name:collectible.name,value:Math.max(0,collectible.estimatedValue),collectible,...(requestedBeneficiaryId?{requestedBeneficiaryId}:{})});
  }
  return{liquid,items};
}

function buildEstatePlan(state:GameState):EstatePlan {
  const heirs=livingChildShares(state);
  const allocations=new Map<string,EstateAllocation>();
  if(!heirs.length)return{heirs,allocations,remainingInvestmentRatio:0,estateValue:0,estateObligations:0,forcedSaleIds:[]};

  const bequests=validBequestMap(state,heirs);
  let {liquid,items}=makeCandidateItems(state,bequests);
  const forcedSaleIds:string[]=[];
  const estateObligations=state.finances.liabilities.filter(loan=>loan.kind!=='mortgage').reduce((sum,loan)=>sum+Math.max(0,loan.balance),0);
  const originalInvestmentValue=state.investments.positions.reduce((sum,position)=>sum+position.units*(state.investments.prices[position.securityId]??0),0);
  const grossBeforeDebt=liquid+originalInvestmentValue+items.reduce((sum,item)=>sum+item.value,0);
  let debtRemaining=estateObligations;

  const fromLiquid=Math.min(liquid,debtRemaining);liquid-=fromLiquid;debtRemaining-=fromLiquid;
  if(debtRemaining>0){
    const saleOrder=[...items].sort((a,b)=>{
      const requestedOrder=Number(Boolean(a.requestedBeneficiaryId))-Number(Boolean(b.requestedBeneficiaryId));
      if(requestedOrder)return requestedOrder;
      return (itemSaleValue(state,b)/Math.max(1,b.value))-(itemSaleValue(state,a)/Math.max(1,a.value));
    });
    const sold=new Set<string>();
    for(const item of saleOrder){
      if(debtRemaining<=0)break;
      const proceeds=itemSaleValue(state,item);sold.add(`${item.kind}:${item.id}`);forcedSaleIds.push(`${item.kind}:${item.id}`);
      const paid=Math.min(proceeds,debtRemaining);debtRemaining-=paid;liquid+=Math.max(0,proceeds-paid);
    }
    if(sold.size)items=items.filter(item=>!sold.has(`${item.kind}:${item.id}`));
  }

  let remainingInvestmentValue=originalInvestmentValue;
  if(debtRemaining>0&&remainingInvestmentValue>0){
    const paid=Math.min(remainingInvestmentValue,debtRemaining);remainingInvestmentValue-=paid;debtRemaining-=paid;
  }
  if(debtRemaining>0){
    // The estate is insolvent after every transferable asset has been exhausted. Heirs do not inherit unsecured estate debt.
    remainingInvestmentValue=0;liquid=0;items=[];
  }
  const remainingInvestmentRatio=originalInvestmentValue>0?remainingInvestmentValue/originalInvestmentValue:0;

  const initialTotal=liquid+remainingInvestmentValue+items.reduce((sum,item)=>sum+item.value,0);
  const targetById=new Map(heirs.map(heir=>[heir.npc.id,initialTotal*heir.ratio]));
  const assignedItems=new Map(heirs.map(heir=>[heir.npc.id,[] as EstateItem[]]));
  const assignedValue=new Map(heirs.map(heir=>[heir.npc.id,remainingInvestmentValue*heir.ratio]));

  // A valid specific bequest is honored before the residuary estate is balanced. It can exceed that heir's percentage share.
  for(const item of items.filter(item=>item.requestedBeneficiaryId)){
    const heirId=item.requestedBeneficiaryId!;
    assignedItems.get(heirId)?.push(item);
    assignedValue.set(heirId,(assignedValue.get(heirId)??0)+item.value);
  }

  const unassigned=items.filter(item=>!item.requestedBeneficiaryId).sort((a,b)=>b.value-a.value);
  for(const item of unassigned){
    const ranked=[...heirs].sort((a,b)=>((targetById.get(b.npc.id)??0)-(assignedValue.get(b.npc.id)??0))-((targetById.get(a.npc.id)??0)-(assignedValue.get(a.npc.id)??0)));
    const heir=ranked[0]!;
    const remaining=Math.max(0,(targetById.get(heir.npc.id)??0)-(assignedValue.get(heir.npc.id)??0));
    if(heirs.length>1&&item.value>remaining*1.10){
      liquid+=itemSaleValue(state,item);forcedSaleIds.push(`${item.kind}:${item.id}`);continue;
    }
    assignedItems.get(heir.npc.id)!.push(item);
    assignedValue.set(heir.npc.id,(assignedValue.get(heir.npc.id)??0)+item.value);
  }

  const retainedTotal=[...assignedItems.values()].flat().reduce((sum,item)=>sum+item.value,0);
  const distributable=liquid+remainingInvestmentValue+retainedTotal;
  const finalTargets=new Map(heirs.map(heir=>[heir.npc.id,distributable*heir.ratio]));
  const needs=heirs.map(heir=>({heir,need:Math.max(0,(finalTargets.get(heir.npc.id)??0)-(assignedValue.get(heir.npc.id)??0))}));
  const totalNeed=needs.reduce((sum,entry)=>sum+entry.need,0);

  for(const {heir,need} of needs){
    const cash=totalNeed>0?liquid*(need/totalNeed):liquid*heir.ratio;
    const investmentValue=remainingInvestmentValue*heir.ratio;
    const itemValue=(assignedItems.get(heir.npc.id)??[]).reduce((sum,item)=>sum+item.value,0);
    allocations.set(heir.npc.id,{heir,items:assignedItems.get(heir.npc.id)??[],cash,investmentValue,total:itemValue+investmentValue+cash});
  }

  return{heirs,allocations,remainingInvestmentRatio,estateValue:Math.max(0,grossBeforeDebt-estateObligations),estateObligations,forcedSaleIds};
}

export function previewEstate(state:GameState):EstatePreview {
  const plan=buildEstatePlan(state);
  return{
    estateValue:plan.estateValue,
    estateObligations:plan.estateObligations,
    distributableValue:[...plan.allocations.values()].reduce((sum,allocation)=>sum+allocation.total,0),
    forcedSaleIds:[...plan.forcedSaleIds],
    heirs:plan.heirs.map(heir=>{
      const allocation=plan.allocations.get(heir.npc.id);
      const items=allocation?.items??[];
      return{
        npcId:heir.npc.id,name:`${heir.npc.firstName} ${heir.npc.lastName}`,percentage:heir.ratio*100,
        cash:allocation?.cash??0,investmentValue:allocation?.investmentValue??0,inheritanceValue:allocation?.total??0,
        properties:items.filter((item):item is Extract<EstateItem,{kind:'property'}>=>item.kind==='property').map(item=>({id:item.id,name:item.name,value:item.value})),
        businesses:items.filter((item):item is Extract<EstateItem,{kind:'business'}>=>item.kind==='business').map(item=>({id:item.id,name:item.name,value:item.value})),
        collectibles:items.filter((item):item is Extract<EstateItem,{kind:'collectible'}>=>item.kind==='collectible').map(item=>({id:item.id,name:item.name,value:item.value})),
      };
    }),
  };
}

export function settleEstate(state:GameState,selectedChildId:string):EstateSettlement {
  const plan=buildEstatePlan(state);
  const selected=plan.allocations.get(selectedChildId);
  if(!selected)return{cash:0,properties:[],businesses:[],collectibles:[],investments:[],liabilities:[],inheritanceValue:0,siblingValue:0,forcedSales:plan.forcedSaleIds.length};

  let siblingValue=0;
  for(const allocation of plan.allocations.values()){
    if(allocation.heir.npc.id===selectedChildId)continue;
    allocation.heir.npc.wealth=Math.max(0,Math.round(allocation.heir.npc.wealth+allocation.total));
    siblingValue+=allocation.total;
  }

  const properties=selected.items.filter((item):item is Extract<EstateItem,{kind:'property'}>=>item.kind==='property').map(item=>structuredClone(item.property));
  const businesses=selected.items.filter((item):item is Extract<EstateItem,{kind:'business'}>=>item.kind==='business').map(item=>structuredClone(item.business));
  const collectibles=selected.items.filter((item):item is Extract<EstateItem,{kind:'collectible'}>=>item.kind==='collectible').map(item=>structuredClone(item.collectible));
  const propertyIds=new Set(properties.map(property=>property.id));
  const liabilities=state.finances.liabilities.filter(loan=>loan.kind==='mortgage'&&loan.assetId&&propertyIds.has(loan.assetId)).map(loan=>structuredClone(loan));
  const investments=state.investments.positions.map(position=>({...position,units:position.units*plan.remainingInvestmentRatio*selected.heir.ratio})).filter(position=>position.units>0.000001);
  return{cash:selected.cash,properties,businesses,collectibles,investments,liabilities,inheritanceValue:selected.total,siblingValue,forcedSales:plan.forcedSaleIds.length};
}

function canEditEstatePlan(state:GameState):EngineResult|undefined {
  if(!state.character.alive)return{success:false,messages:[{text:'Estate planning must be completed during your lifetime.'}]};
  if(state.character.age<18)return{success:false,messages:[{text:'Estate planning becomes available at 18.'}]};
  return undefined;
}

export function setWill(state:GameState,beneficiaries:Array<{npcId:string;percentage:number}>):EngineResult {
  const gate=canEditEstatePlan(state);if(gate)return gate;
  const children=new Set(livingChildren(state).map(child=>child.id));
  if(!beneficiaries.length){state.inheritance.will=[];return{success:true,messages:[{text:'Your residuary estate will be divided equally among your living children.'}]};}
  if(new Set(beneficiaries.map(entry=>entry.npcId)).size!==beneficiaries.length)return{success:false,messages:[{text:'Each child can appear only once in your will.'}]};
  if(beneficiaries.some(entry=>!children.has(entry.npcId)))return{success:false,messages:[{text:'Residuary beneficiaries must be your living children.'}]};
  if(beneficiaries.some(entry=>!Number.isFinite(entry.percentage)||entry.percentage<0))return{success:false,messages:[{text:'Will percentages must be valid non-negative numbers.'}]};
  const total=beneficiaries.reduce((sum,entry)=>sum+entry.percentage,0);
  if(Math.abs(total-100)>.01)return{success:false,messages:[{text:'Will percentages must add up to 100%.'}]};
  state.inheritance.will=beneficiaries.filter(entry=>entry.percentage>0).map(entry=>({...entry}));
  return{success:true,messages:[{text:'Your residuary estate shares were updated.'}]};
}

export function setEstateAssetBequest(state:GameState,kind:EstateAssetKind,assetId:string,beneficiaryNpcId?:string):EngineResult {
  const gate=canEditEstatePlan(state);if(gate)return gate;
  if(!estateAssetExists(state,kind,assetId))return{success:false,messages:[{text:'That asset is no longer available to include in your estate plan.'}]};
  state.inheritance.assetBequests??=[];
  state.inheritance.assetBequests=state.inheritance.assetBequests.filter(entry=>!(entry.kind===kind&&entry.assetId===assetId));
  if(!beneficiaryNpcId)return{success:true,messages:[{text:'That asset will return to the residuary estate.'}]};
  if(!livingChildren(state).some(child=>child.id===beneficiaryNpcId))return{success:false,messages:[{text:'Specific bequests can currently be left only to a living child.'}]};
  const bequest:EstateAssetBequest={kind,assetId,beneficiaryNpcId};state.inheritance.assetBequests.push(bequest);
  return{success:true,messages:[{text:'Your specific asset bequest was updated.'}]};
}

export function setEstateRetentionPreferences(state:GameState,preferences:Partial<Pick<GameState['inheritance'],'inheritBusinesses'|'inheritProperties'>>):EngineResult {
  const gate=canEditEstatePlan(state);if(gate)return gate;
  if(preferences.inheritBusinesses!==undefined)state.inheritance.inheritBusinesses=preferences.inheritBusinesses;
  if(preferences.inheritProperties!==undefined)state.inheritance.inheritProperties=preferences.inheritProperties;
  return{success:true,messages:[{text:'Your estate retention preferences were updated.'}]};
}
