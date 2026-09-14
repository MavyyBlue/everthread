import { actionGateStatus } from '../core/actionEconomy';
import { personalItemById } from '../data/personalItems';
import type { GameState, Npc, PersonalItemInstance, Relationship } from '../types/game';
import type { PersonalGiftEvaluation, PersonalGiftOption } from '../types/gifts';
import { evaluateSharedPreferenceContext } from './SharedExperienceSystem';

export interface PersonalGiftAvailability {
  allowed:boolean;
  reason?:string;
  npc?:Npc;
  relationship?:Relationship;
  item?:PersonalItemInstance;
  definition?:NonNullable<(typeof personalItemById)[string]>;
}

function giftReaction(name:string,itemName:string,band:PersonalGiftEvaluation['band']){
  if(band==='great')return`${name} lights up at ${itemName}; you clearly understood their taste.`;
  if(band==='good')return`${name} smiles at ${itemName}; it fits them well.`;
  if(band==='mixed')return`${name} thanks you for ${itemName}, though the reaction is more polite than excited.`;
  if(band==='rough')return`${name} appreciates the thought, but ${itemName} clearly is not their thing.`;
  return`${name} looks genuinely uncomfortable with ${itemName}.`;
}

function giftMemoryReaction(itemName:string,band:PersonalGiftEvaluation['band']){
  if(band==='great')return`The ${itemName} felt unusually thoughtful and exactly right.`;
  if(band==='good')return`The ${itemName} was a thoughtful gift that suited you.`;
  if(band==='mixed')return`You appreciated the gesture, even if the ${itemName} did not mean much to you.`;
  if(band==='rough')return`The ${itemName} was not really your thing.`;
  return`The ${itemName} made you distinctly uncomfortable.`;
}

export function personalGiftAvailability(state:GameState,npcId:string,instanceId:string):PersonalGiftAvailability{
  const npc=state.npcs[npcId];
  const relationship=state.relationships.find(rel=>rel.npcId===npcId);
  const item=state.personalInventory?.items?.find(entry=>entry.id===instanceId);
  const definition=item?personalItemById[item.itemId]:undefined;
  if(!npc||!relationship)return{allowed:false,reason:'That relationship is no longer available.'};
  if(!npc.alive)return{allowed:false,reason:`You cannot give ${npc.firstName} a gift; they have died.`,npc,relationship};
  if(!item||!definition)return{allowed:false,reason:'That personal item is no longer in your inventory.',npc,relationship};
  if(npc.age<definition.minAge)return{allowed:false,reason:`${definition.name} is not age-appropriate for ${npc.firstName} yet.`,npc,relationship,item,definition};
  const gate=actionGateStatus(state,[{policy:'social.npc.total',target:npcId},{policy:'social.npc.action',target:`${npcId}:gift`}]);
  if(!gate.allowed)return{allowed:false,reason:gate.message,npc,relationship,item,definition};
  return{allowed:true,npc,relationship,item,definition};
}

export function evaluatePersonalGift(state:GameState,npcId:string,instanceId:string,variation=0):PersonalGiftEvaluation|undefined{
  const availability=personalGiftAvailability(state,npcId,instanceId);
  const {npc,relationship,item,definition}=availability;
  if(!availability.allowed||!npc||!relationship||!item||!definition)return;
  const categoryBoost=definition.category==='gift'?2:definition.category==='keepsake'?1:0;
  const romanticBoost=npc.traits.includes('romantic')?2:0;
  const evaluation=evaluateSharedPreferenceContext(state,npcId,definition.preferenceTags,4,variation,categoryBoost+romanticBoost);
  if(!evaluation)return;
  return{
    npcId:npc.id,relationshipId:relationship.id,instanceId:item.id,itemId:definition.id,itemName:definition.name,
    ...evaluation,
    prose:`You gave ${npc.firstName} ${definition.name}. ${giftReaction(npc.firstName,definition.name,evaluation.band)}`,
    memorySummary:`${state.character.firstName} gave you ${definition.name}. ${giftMemoryReaction(definition.name,evaluation.band)}`,
  };
}

export function projectPersonalGiftOptions(state:GameState,npcId:string):PersonalGiftOption[]{
  return (state.personalInventory?.items??[]).map(item=>{
    const definition=personalItemById[item.itemId];
    const availability=personalGiftAvailability(state,npcId,item.id);
    return{
      instanceId:item.id,itemId:item.itemId,itemName:definition?.name??'Unknown item',description:definition?.description??'',
      category:definition?.category??'keepsake',acquiredAge:item.acquiredAge,allowed:availability.allowed,reason:availability.reason,
    };
  });
}
