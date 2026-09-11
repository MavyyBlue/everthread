import { makeStateId } from '../core/ids';
import type { GameState, Npc } from '../types/game';
import type { NpcBusinessHolding, NpcPropertyHolding } from '../types/npcAssets';
import { addNpcBusinessHolding, addNpcInheritanceTrustHoldings, addNpcPropertyHolding, clearNpcAssetPortfolio, ensureNpcAssetPortfolio, npcBusinessValue, npcMortgageDebt, npcPropertyGross, playerBusinessFromNpcHolding, playerPropertyFromNpcHolding } from './NpcAssetSystem';

interface NpcEstateAsset {kind:'property'|'business';value:number;property?:NpcPropertyHolding;business?:NpcBusinessHolding;}
interface HeirAllocation {npc?:Npc;player:boolean;share:number;remaining:number;assets:NpcEstateAsset[];}

function propertyNet(property:NpcPropertyHolding){return Math.max(0,property.marketValue-property.mortgageBalance);}
function businessNet(business:NpcBusinessHolding){return business.active?Math.max(0,business.valuation):0;}

function pushNpcTrust(heir:Npc,share:number,liquid:number,properties:NpcPropertyHolding[],businesses:NpcBusinessHolding[]){
  const trust=heir.inheritanceTrust??{releaseAge:18,value:0,liquidValue:0,properties:[],businesses:[]};
  trust.releaseAge=18;trust.value=Math.max(0,Math.round((trust.value??0)+share));trust.liquidValue=Math.max(0,Math.round((trust.liquidValue??0)+liquid));trust.properties??=[];trust.businesses??=[];
  heir.inheritanceTrust=trust;addNpcInheritanceTrustHoldings(heir,properties,businesses);
}

function mergePlayerTrust(state:GameState,share:number,liquid:number,properties:NpcPropertyHolding[],businesses:NpcBusinessHolding[]){
  const trust=state.inheritance.trust??{releaseAge:18,createdAge:state.character.age,cash:0,properties:[],businesses:[],collectibles:[],investments:[],liabilities:[],inheritanceValue:0};
  trust.cash+=liquid;trust.inheritanceValue+=share;
  for(const holding of properties){const converted=playerPropertyFromNpcHolding(state,holding);if(!trust.properties.some(item=>item.id===converted.property.id))trust.properties.push(converted.property);if(converted.mortgage&&!trust.liabilities.some(item=>item.id===converted.mortgage!.id))trust.liabilities.push(converted.mortgage);}
  for(const holding of businesses){const converted=playerBusinessFromNpcHolding(state,holding);if(!trust.businesses.some(item=>item.id===converted.id))trust.businesses.push(converted);}
  state.inheritance.trust=trust;state.flags.inheritancePending=Number(state.flags.inheritancePending??0)+share;
}

function transferToNpc(state:GameState,source:Npc,heir:Npc,allocation:HeirAllocation){
  const properties=allocation.assets.filter(item=>item.kind==='property'&&item.property).map(item=>({...item.property!,acquiredAge:heir.age,origin:'inherited' as const,inheritedFromNpcId:source.id}));
  const businesses=allocation.assets.filter(item=>item.kind==='business'&&item.business).map(item=>({...item.business!,acquiredAge:heir.age,origin:'inherited' as const,inheritedFromNpcId:source.id}));
  const assetValue=allocation.assets.reduce((sum,item)=>sum+item.value,0);const liquid=Math.max(0,allocation.share-assetValue);
  if(heir.age<18){pushNpcTrust(heir,allocation.share,liquid,properties,businesses);return;}
  heir.wealth=Math.max(0,Math.round(heir.wealth+liquid));
  for(const property of properties){const retained=addNpcPropertyHolding(state,heir,property);if(retained&&heir.life)heir.life.finance.debt+=Math.max(0,property.mortgageBalance);}
  for(const business of businesses)addNpcBusinessHolding(state,heir,business);
}

function transferToPlayer(state:GameState,source:Npc,allocation:HeirAllocation){
  if(allocation.share<=0)return;
  const properties=allocation.assets.filter(item=>item.kind==='property'&&item.property).map(item=>item.property!);
  const businesses=allocation.assets.filter(item=>item.kind==='business'&&item.business).map(item=>item.business!);
  const assetValue=allocation.assets.reduce((sum,item)=>sum+item.value,0);const liquid=Math.max(0,allocation.share-assetValue);
  if(state.character.age<18)mergePlayerTrust(state,allocation.share,liquid,properties,businesses);
  else{
    state.finances.cash+=liquid;
    for(const holding of properties){const converted=playerPropertyFromNpcHolding(state,holding);if(!state.assets.properties.some(item=>item.id===converted.property.id))state.assets.properties.push(converted.property);if(converted.mortgage&&!state.finances.liabilities.some(item=>item.id===converted.mortgage!.id))state.finances.liabilities.push(converted.mortgage);}
    for(const holding of businesses){const converted=playerBusinessFromNpcHolding(state,holding);if(!state.businesses.some(item=>item.id===converted.id))state.businesses.push(converted);}
    state.flags.inheritanceReceived=Number(state.flags.inheritanceReceived??0)+allocation.share;
    state.flags.lifetimeInheritance=Number(state.flags.lifetimeInheritance??0)+allocation.share;state.flags.inheritances=Number(state.flags.inheritances??0)+1;
  }
  const retained=[...properties.map(item=>item.name),...businesses.map(item=>item.name)];
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'money',importance:2,text:state.character.age<18?`A ${Math.round(allocation.share).toLocaleString()} inheritance from ${source.firstName} ${source.lastName} was placed in a protected family trust${retained.length?`, including ${retained.join(' and ')}`:''}.`:`You inherited ${Math.round(allocation.share).toLocaleString()} from ${source.firstName} ${source.lastName}${retained.length?`, including ${retained.join(' and ')}`:''}.`,moneyDelta:state.character.age<18?0:liquid,npcIds:[source.id]});
}

export function settleNpcEstateOnDeath(state:GameState,npc:Npc){
  const life=npc.life;if(!life)return{estateValue:0,distributedValue:0,heirs:0};const portfolio=ensureNpcAssetPortfolio(state,npc);
  const playerIsChild=npc.childIds.includes(state.character.id)&&state.character.alive;const livingChildren=npc.childIds.map(id=>state.npcs[id]).filter((child):child is Npc=>Boolean(child?.alive));const heirCount=livingChildren.length+(playerIsChild?1:0);
  const gross=Math.max(0,npc.wealth)+npcPropertyGross(npc)+npcBusinessValue(npc);const debt=Math.max(0,life.finance.debt,npcMortgageDebt(npc));const estateValue=Math.max(0,Math.round(gross-debt));const distributedValue=heirCount?Math.max(0,Math.round(estateValue*.55)):0;
  if(heirCount&&distributedValue>0){
    const share=distributedValue/heirCount;const allocations:HeirAllocation[]=[...livingChildren.map(child=>({npc:child,player:false,share,remaining:share,assets:[]})),...(playerIsChild?[{player:true,share,remaining:share,assets:[]} as HeirAllocation]:[])];
    const assets:NpcEstateAsset[]=[...portfolio.properties.map(property=>({kind:'property' as const,value:propertyNet(property),property})),...portfolio.businesses.filter(business=>business.active).map(business=>({kind:'business' as const,value:businessNet(business),business}))].filter(item=>item.value>0).sort((a,b)=>b.value-a.value);
    for(const asset of assets){const eligible=allocations.filter(allocation=>allocation.remaining+1>=asset.value).sort((a,b)=>b.remaining-a.remaining);const target=eligible[0];if(!target)continue;target.assets.push(asset);target.remaining=Math.max(0,target.remaining-asset.value);}
    for(const allocation of allocations){if(allocation.player)transferToPlayer(state,npc,allocation);else if(allocation.npc)transferToNpc(state,npc,allocation.npc,allocation);}
  }
  npc.wealth=0;life.finance.debt=0;clearNpcAssetPortfolio(npc);return{estateValue,distributedValue,heirs:heirCount};
}
