import type { EngineResult, GameState, PersonalInventoryState } from '../types/game';
import { personalItemById, personalItemDefinitions } from '../data/personalItems';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { actionGateStatus, consumeAction } from '../core/actionEconomy';
import { makeStateId } from '../core/ids';

export const PERSONAL_INVENTORY_MAX_ITEMS=80;

export function createEmptyPersonalInventoryState():PersonalInventoryState{return{items:[]};}

export function ensurePersonalInventoryState(state:GameState):PersonalInventoryState{
  state.personalInventory??=createEmptyPersonalInventoryState();
  state.personalInventory.items=Array.isArray(state.personalInventory.items)?state.personalInventory.items:[];
  const seen=new Set<string>();
  state.personalInventory.items=state.personalInventory.items.filter(item=>{
    if(!item||typeof item.id!=='string'||!item.id||seen.has(item.id)||!personalItemById[item.itemId])return false;
    seen.add(item.id);
    item.acquiredAge=Math.max(0,Math.min(state.character.age,Math.floor(Number.isFinite(item.acquiredAge)?item.acquiredAge:state.character.age)));
    item.acquiredYear=Math.max(1900,Math.floor(Number.isFinite(item.acquiredYear)?item.acquiredYear:state.currentYear));
    item.purchasePrice=Math.max(0,Math.round(Number.isFinite(item.purchasePrice)?item.purchasePrice:personalItemById[item.itemId]!.price));
    item.sourcePlaceId=typeof item.sourcePlaceId==='string'&&item.sourcePlaceId?item.sourcePlaceId:personalItemById[item.itemId]!.vendorPlaceId;
    return true;
  }).slice(-PERSONAL_INVENTORY_MAX_ITEMS);
  return state.personalInventory;
}

export function migratePersonalInventoryState(state:GameState){ensurePersonalInventoryState(state);}

export function canShopPersonalItems(state:GameState){
  if(!state.character.alive)return 'Personal shopping is unavailable after this life has ended.';
  if(state.legal.imprisoned)return 'Personal shopping is unavailable while you are incarcerated.';
  if(state.character.countryId!==EVERTHREAD_COUNTRY_ID||state.character.city!==EVERTHREAD_CITY)return 'These Everthread shops are only available while you are in town.';
  return undefined;
}

export function personalItemPurchaseStatus(state:GameState,itemId:string):{allowed:boolean;message?:string}{
  const def=personalItemById[itemId];if(!def)return{allowed:false,message:'Personal item not found.'};
  const shoppingGate=canShopPersonalItems(state);if(shoppingGate)return{allowed:false,message:shoppingGate};
  if(state.character.age<def.minAge)return{allowed:false,message:`${def.name} becomes available at age ${def.minAge}.`};
  if((state.personalInventory?.items?.length??0)>=PERSONAL_INVENTORY_MAX_ITEMS)return{allowed:false,message:'Your personal inventory is full. Discard or gift something before adding another item.'};
  if(state.finances.cash<def.price)return{allowed:false,message:`You need ${def.price.toLocaleString()} cash.`};
  const actionGate=actionGateStatus(state,[{policy:'personal.inventory.purchase.total'},{policy:'personal.inventory.purchase.item',target:itemId}]);
  if(!actionGate.allowed)return{allowed:false,message:actionGate.message};
  return{allowed:true};
}

export function purchasePersonalItem(state:GameState,itemId:string):EngineResult{
  ensurePersonalInventoryState(state);
  const def=personalItemById[itemId];const status=personalItemPurchaseStatus(state,itemId);
  if(!status.allowed||!def)return{success:false,messages:[{text:status.message??'That item is unavailable.'}]};
  const actionGate=consumeAction(state,[{policy:'personal.inventory.purchase.total'},{policy:'personal.inventory.purchase.item',target:itemId}]);
  if(!actionGate.allowed)return{success:false,messages:[{text:actionGate.message!}]};
  state.finances.cash-=def.price;
  state.personalInventory.items.push({id:makeStateId(state,'personal-item'),itemId:def.id,acquiredAge:state.character.age,acquiredYear:state.currentYear,sourcePlaceId:def.vendorPlaceId,purchasePrice:def.price});
  return{success:true,stateChanges:['cash','personalInventory'],messages:[{text:`Added ${def.name} to your personal inventory for ${def.price.toLocaleString()}.`}]};
}

export function takePersonalItemInstance(state:GameState,instanceId:string){
  ensurePersonalInventoryState(state);
  const index=state.personalInventory.items.findIndex(item=>item.id===instanceId);
  if(index<0)return undefined;
  return state.personalInventory.items.splice(index,1)[0];
}

export function discardPersonalItem(state:GameState,instanceId:string):EngineResult{
  const item=takePersonalItemInstance(state,instanceId);if(!item)return{success:false,messages:[{text:'That personal item is no longer in your inventory.'}]};
  const def=personalItemById[item.itemId];
  return{success:true,stateChanges:['personalInventory'],messages:[{text:`Removed ${def?.name??'the item'} from your personal inventory. No cash value was returned.`}]};
}

export function personalInventoryCatalog(){return personalItemDefinitions;}
