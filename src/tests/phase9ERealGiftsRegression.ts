import { actionUsesThisAge, consumeAction } from '../core/actionEconomy';
import { validateState } from '../core/invariants';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { personalItemById, personalItemDefinitions } from '../data/personalItems';
import { exportSave, importSave } from '../services/SaveSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { evaluatePersonalGift, personalGiftAvailability, projectPersonalGiftOptions } from '../systems/GiftSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import { givePersonalItemGift, interactWithNpc } from '../systems/RelationshipSystem';
import type { GameState, Npc, Relationship, RelationshipType } from '../types/game';
import type { NpcPreferenceProfile } from '../types/npcPreferences';

function addNpc(state:GameState,id='gift-target',age=24,type:RelationshipType='friend',profile?:NpcPreferenceProfile){
  const npc:Npc={id,firstName:'Morgan',lastName:'Thread',age,alive:true,health:95,happiness:80,wealth:5000,countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:70,maritalStatus:'single',traits:['romantic','loyal'],hiddenOpinion:35,memories:[],parentIds:[],childIds:[],simulationTier:'full',...(profile?{preferences:profile}:{})};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type,score:72,attraction:40,compatibility:76,yearsKnown:4};
  state.npcs[id]=npc;state.relationships.push(rel);ensureNpcLife(state,npc);return{npc,rel};
}

function addItem(state:GameState,itemId:string,id:string){
  const def=personalItemById[itemId];if(!def)throw new Error(`Missing personal item ${itemId}`);
  state.personalInventory.items.push({id,itemId,acquiredAge:state.character.age,acquiredYear:state.currentYear,sourcePlaceId:def.vendorPlaceId,purchasePrice:def.price});
  return state.personalInventory.items.at(-1)!;
}

function giftState(seed:string,itemId='late_night_cocoa_set',npcAge=24,profile?:NpcPreferenceProfile){
  const state=createNewGame({seed});state.seed=seed;state.rngCounter=0;state.character.age=24;state.currentYear=2064;state.character.stats.happiness=80;state.character.stats.health=95;state.settings.autoSave=false;
  const pair=addNpc(state,'gift-target',npcAge,'friend',profile);const item=addItem(state,itemId,'gift-instance-1');return{state,...pair,item};
}

function clone<T>(value:T):T{return structuredClone(value);}

export function runPhase9ERealGiftsRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9E real-gifts regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===18,'01 real gifts must reuse schema-17 inventory/relationship state without a save-schema bump');
  verify(personalItemDefinitions.length===24&&personalItemDefinitions.every(item=>item.preferenceTags.length>=2),'02 all 24 Phase 8D personal items must remain usable as preference-tagged gift content');

  const projection=giftState('phase9e-projection');addItem(projection.state,projection.item.itemId,'gift-instance-2');const collectibleCount=projection.state.assets.collectibles.length;projection.state.assets.collectibles.push({id:'valuable-asset',itemId:'art_1',name:'Valuable Artwork',estimatedValue:5000,authenticity:99,condition:95,rarity:'rare'});const beforeProjection=JSON.stringify(projection.state),projectionRng=projection.state.rngCounter,projectionId=projection.state.idCounter;const options=projectPersonalGiftOptions(projection.state,projection.npc.id);
  verify(options.length===2&&new Set(options.map(option=>option.instanceId)).size===2,'03 gift projection must expose each exact ordinary owned-item instance, including duplicate definitions, without collapsing ownership');
  verify(options.every(option=>option.itemId===projection.item.itemId&&option.allowed),'04 eligible owned personal items must project as giftable exact instances');
  verify(!options.some(option=>option.instanceId==='valuable-asset')&&projection.state.assets.collectibles.length===collectibleCount+1,'05 valuable collectibles must remain Assets-owned and never enter the ordinary gift chooser');
  verify(JSON.stringify(projection.state)===beforeProjection&&projection.state.rngCounter===projectionRng&&projection.state.idCounter===projectionId,'06 gift-option browsing must be strictly read-only and RNG/runtime-ID neutral');

  const empty=createNewGame({seed:'phase9e-empty'});const emptyNpc=addNpc(empty);verify(projectPersonalGiftOptions(empty,emptyNpc.npc.id).length===0,'07 an empty personal inventory must project no invented gift choices');
  const underage=giftState('phase9e-underage','roasted_coffee_tin',10);const underageBefore=JSON.stringify(underage.state);verify(!personalGiftAvailability(underage.state,underage.npc.id,underage.item.id).allowed&&!givePersonalItemGift(underage.state,underage.npc.id,underage.item.id).success&&JSON.stringify(underage.state)===underageBefore,'08 recipient age gates must reject inappropriate items without transfer, RNG, action, or relationship mutation');
  const dead=giftState('phase9e-dead');dead.npc.alive=false;const deadBefore=JSON.stringify(dead.state);verify(!givePersonalItemGift(dead.state,dead.npc.id,dead.item.id).success&&JSON.stringify(dead.state)===deadBefore,'09 deceased targets must reject gifts without losing the owned item or consuming state');
  const stale=giftState('phase9e-stale');delete stale.state.npcs[stale.npc.id];const staleBefore=JSON.stringify(stale.state);verify(!givePersonalItemGift(stale.state,stale.npc.id,stale.item.id).success&&JSON.stringify(stale.state)===staleBefore,'10 stale NPC ids must fail safely without transfer or hidden mutation');
  const missing=giftState('phase9e-missing-item');const missingBefore=JSON.stringify(missing.state);verify(!givePersonalItemGift(missing.state,missing.npc.id,'not-owned').success&&JSON.stringify(missing.state)===missingBefore,'11 stale/not-owned item instance ids must fail before action economy or RNG mutation');

  const legacy=giftState('phase9e-legacy-gift');const legacyCash=legacy.state.finances.cash,legacyWealth=legacy.npc.wealth,legacyInventory=JSON.stringify(legacy.state.personalInventory),legacyRng=legacy.state.rngCounter;const legacyResult=interactWithNpc(legacy.state,legacy.npc.id,'gift');
  verify(!legacyResult.success&&legacyResult.messages[0]?.text.includes('owned item'),'12 the old generic Gift action must direct callers to exact inventory ownership instead of conjuring a cash-funded present');
  verify(legacy.state.finances.cash===legacyCash&&legacy.npc.wealth===legacyWealth&&JSON.stringify(legacy.state.personalInventory)===legacyInventory&&legacy.state.rngCounter===legacyRng&&actionUsesThisAge(legacy.state,'social.npc.action',`${legacy.npc.id}:gift`)===0,'13 rejected legacy Gift must spend no cash, transfer no wealth/item, and consume no social opportunity or RNG');

  const likeProfile:NpcPreferenceProfile={version:1,likes:['cozy','food','romance'],dislikes:[],aversions:[]};
  const neutralProfile:NpcPreferenceProfile={version:1,likes:['sports','technology'],dislikes:['fashion'],aversions:[]};
  const dislikeProfile:NpcPreferenceProfile={version:1,likes:['sports'],dislikes:['cozy','food','romance'],aversions:[]};
  const aversionProfile:NpcPreferenceProfile={version:1,likes:['sports'],dislikes:['cozy','food'],aversions:['romance']};
  const like=giftState('phase9e-like','late_night_cocoa_set',24,likeProfile),neutral=giftState('phase9e-neutral','late_night_cocoa_set',24,neutralProfile),dislike=giftState('phase9e-dislike','late_night_cocoa_set',24,dislikeProfile),aversion=giftState('phase9e-aversion','late_night_cocoa_set',24,aversionProfile);
  const likeBefore=JSON.stringify(like.state),likeRng=like.state.rngCounter,likeId=like.state.idCounter;const likeEvaluation=evaluatePersonalGift(like.state,like.npc.id,like.item.id,0)!,neutralEvaluation=evaluatePersonalGift(neutral.state,neutral.npc.id,neutral.item.id,0)!,dislikeEvaluation=evaluatePersonalGift(dislike.state,dislike.npc.id,dislike.item.id,0)!,aversionEvaluation=evaluatePersonalGift(aversion.state,aversion.npc.id,aversion.item.id,0)!;
  verify(Boolean(likeEvaluation)&&JSON.stringify(like.state)===likeBefore&&like.state.rngCounter===likeRng&&like.state.idCounter===likeId,'14 exact gift evaluation must be pure/read-only and consume neither gameplay RNG nor runtime IDs');
  verify(likeEvaluation.approval>neutralEvaluation.approval,'15 an exact item matching NPC likes must score above the same item against neutral preferences');
  verify(neutralEvaluation.approval>dislikeEvaluation.approval,'16 disliked exact gift tags must materially reduce approval below a neutral gift');
  verify(dislikeEvaluation.approval>aversionEvaluation.approval,'17 an explicit aversion must be more damaging than ordinary dislikes through the single shared preference evaluator');
  verify(likeEvaluation.instanceId===like.item.id&&likeEvaluation.itemId===like.item.itemId&&likeEvaluation.npcId===like.npc.id&&likeEvaluation.relationshipId===like.rel.id,'18 gift evaluation must preserve exact item-instance, definition, NPC, and relationship identity');

  const success=giftState('phase9e-success','late_night_cocoa_set',24,likeProfile);success.rel.score=100;success.rel.compatibility=100;success.npc.hiddenOpinion=100;success.npc.happiness=100;success.state.character.stats.happiness=100;addItem(success.state,success.item.itemId,'gift-instance-2');const cashBefore=success.state.finances.cash,wealthBefore=success.npc.wealth,assetBefore=JSON.stringify(success.state.assets),scoreBefore=success.rel.score,opinionBefore=success.npc.hiddenOpinion,happinessBefore=success.state.character.stats.happiness,timelineBefore=success.state.timeline.length,rngBefore=success.state.rngCounter,knownBefore=success.rel.knownPreferenceTags?.length??0;
  const committed=givePersonalItemGift(success.state,success.npc.id,success.item.id);verify(committed.success&&Boolean(committed.gift),'19 an eligible exact owned item must commit successfully through the relationship-owned gift action');
  verify(success.state.personalInventory.items.length===1&&success.state.personalInventory.items[0]!.id==='gift-instance-2','20 committed gift transfer must remove exactly the selected instance while preserving an identical second owned copy');
  verify(success.state.finances.cash===cashBefore&&success.npc.wealth===wealthBefore&&JSON.stringify(success.state.assets)===assetBefore,'21 ordinary gifting must move no cash/wealth and must not duplicate personal items into financial Assets');
  verify(actionUsesThisAge(success.state,'social.npc.total',success.npc.id)===1&&actionUsesThisAge(success.state,'social.npc.action',`${success.npc.id}:gift`)===1,'22 real gifts must reuse the established per-person social and per-action yearly limits exactly once');
  verify(success.state.rngCounter===rngBefore+1,'23 one committed gift must consume exactly one gameplay RNG draw for bounded reaction variation');
  verify(success.state.timeline.length===timelineBefore+1&&success.state.timeline.at(-1)?.npcIds?.[0]===success.npc.id&&success.state.timeline.at(-1)?.text.includes(committed.gift!.itemName),'24 committed gift must write exactly one exact-target timeline entry naming the exact gift');
  verify(success.rel.score===Math.max(0,Math.min(100,scoreBefore+committed.gift!.relationshipDelta))&&success.npc.hiddenOpinion===Math.max(-100,Math.min(100,opinionBefore+committed.gift!.opinionDelta))&&success.state.character.stats.happiness===Math.max(0,Math.min(100,happinessBefore+committed.gift!.happinessDelta)),'25 relationship/opinion/happiness consequences must apply exactly from the shared evaluator result');
  verify((success.rel.knownPreferenceTags?.length??0)-knownBefore<=1,'26 one real gift may reveal at most one relevant preference through the existing Phase 9A knowledge authority');
  verify(!('personalInventory' in (success.npc as unknown as Record<string,unknown>)),'27 successful gifting must not create a broad durable NPC inventory shadow authority');
  verify(validateState(success.state).length===0,'28 committed real gift must leave canonical GameState invariants clean');

  const replayBefore=JSON.stringify(success.state),replayRng=success.state.rngCounter,replayTimeline=success.state.timeline.length,replayGiftUses=actionUsesThisAge(success.state,'social.npc.action',`${success.npc.id}:gift`);const replay=givePersonalItemGift(success.state,success.npc.id,success.item.id);
  verify(!replay.success&&JSON.stringify(success.state)===replayBefore&&success.state.rngCounter===replayRng&&success.state.timeline.length===replayTimeline&&actionUsesThisAge(success.state,'social.npc.action',`${success.npc.id}:gift`)===replayGiftUses,'29 replaying the transferred exact instance must fail without double-removal, duplicate consequences, RNG, timeline, or action use');
  const blockedSecond=success.state.personalInventory.items[0]!;const blockedSnapshot=JSON.stringify(success.state);verify(!givePersonalItemGift(success.state,success.npc.id,blockedSecond.id).success&&JSON.stringify(success.state)===blockedSnapshot,'30 a second gift to the same NPC in the same year must be blocked without consuming the still-owned second item');
  success.state.character.age+=1;success.state.currentYear+=1;success.npc.age+=1;verify(givePersonalItemGift(success.state,success.npc.id,blockedSecond.id).success&&Number(success.state.personalInventory.items.length)===0,'31 aging into a new action-economy year must allow a new exact gift to the same person');

  const otherTarget=giftState('phase9e-other-target','threadfox_plush',24,likeProfile);const other=addNpc(otherTarget.state,'gift-target-2',24,'friend',likeProfile);addItem(otherTarget.state,'pocket_journal','other-item');verify(givePersonalItemGift(otherTarget.state,otherTarget.npc.id,otherTarget.item.id).success&&givePersonalItemGift(otherTarget.state,other.npc.id,'other-item').success,'32 gift limits must be target-specific so two different people can receive one gift each in the same year');
  const totalBlocked=giftState('phase9e-total-block','threadfox_plush',24,likeProfile);for(let index=0;index<3;index++)verify(consumeAction(totalBlocked.state,{policy:'social.npc.total',target:totalBlocked.npc.id}).allowed,`33-${index} social total fixture should consume its bounded opportunity`);const totalBefore=JSON.stringify(totalBlocked.state);verify(!givePersonalItemGift(totalBlocked.state,totalBlocked.npc.id,totalBlocked.item.id).success&&JSON.stringify(totalBlocked.state)===totalBefore,'34 an exhausted per-person social budget must block gifting without item loss or reaction mutation');

  const styleGift=giftState('phase9e-style','woven_scarf');verify(personalGiftAvailability(styleGift.state,styleGift.npc.id,styleGift.item.id).allowed,'35 style-category possessions must be giftable; gifting is not restricted to items authored with category=gift');
  const hobbyGift=giftState('phase9e-hobby','pocket_journal');verify(personalGiftAvailability(hobbyGift.state,hobbyGift.npc.id,hobbyGift.item.id).allowed,'36 hobby possessions must remain valid exact gifts when owned');
  const keepsakeGift=giftState('phase9e-keepsake','nightjar_mug');verify(personalGiftAvailability(keepsakeGift.state,keepsakeGift.npc.id,keepsakeGift.item.id).allowed,'37 keepsakes must remain giftable ordinary possessions without becoming financial assets');

  const meaningful=giftState('phase9e-meaningful','late_night_cocoa_set',24,likeProfile);meaningful.rel.score=100;meaningful.rel.compatibility=100;meaningful.npc.hiddenOpinion=100;meaningful.npc.happiness=100;meaningful.state.character.stats.happiness=100;const meaningfulBefore=meaningful.npc.memories.length;const meaningfulResult=givePersonalItemGift(meaningful.state,meaningful.npc.id,meaningful.item.id);
  verify(meaningfulResult.success&&meaningfulResult.gift?.band==='great'&&meaningfulResult.gift.meaningfulMemory,'38 a strongly preference-matched gift must be capable of producing a great meaningful reaction');
  verify(meaningful.npc.memories.length===meaningfulBefore+1&&meaningful.npc.memories.at(-1)?.kind===`gift:${meaningful.item.itemId}`&&meaningful.npc.memories.at(-1)?.summary.includes(meaningfulResult.gift!.itemName),'39 meaningful gift memories must live on the exact NPC and retain exact item identity');
  verify(meaningful.npc.memories.at(-1)?.permanent===true,'40 exceptional great gifts may become permanent NPC memories through the existing bounded memory authority');

  const bounded=giftState('phase9e-memory-bound','late_night_cocoa_set',24,likeProfile);bounded.rel.score=100;bounded.rel.compatibility=100;bounded.npc.hiddenOpinion=100;bounded.npc.happiness=100;bounded.state.character.stats.happiness=100;bounded.npc.memories=Array.from({length:36},(_,index)=>({id:`old-${index}`,year:2020+index,age:index,kind:'old',sentiment:1,summary:`Old memory ${index}`,permanent:index<4}));verify(givePersonalItemGift(bounded.state,bounded.npc.id,bounded.item.id).success&&bounded.npc.memories.length<=36&&bounded.npc.memories.some(memory=>memory.kind===`gift:${bounded.item.itemId}`&&memory.permanent),'41 gift-authored memories must obey the established 36-entry bound while preserving meaningful permanent history');

  const bad=giftState('phase9e-bad','late_night_cocoa_set',24,aversionProfile);bad.rel.score=0;bad.rel.compatibility=0;bad.npc.hiddenOpinion=-100;bad.npc.happiness=0;bad.state.character.stats.happiness=0;const badScore=bad.rel.score,badOpinion=bad.npc.hiddenOpinion;const badResult=givePersonalItemGift(bad.state,bad.npc.id,bad.item.id);
  verify(badResult.success&&Boolean(badResult.gift)&&['awful','rough'].includes(badResult.gift!.band),'42 a strongly mismatched/averse gift can genuinely go badly instead of every owned item being free relationship gain');
  verify(bad.state.personalInventory.items.length===0&&bad.rel.score<=badScore&&bad.npc.hiddenOpinion<=badOpinion,'43 a committed bad gift must still transfer exactly once and apply its negative relationship/opinion consequences');
  verify(bad.npc.memories.some(memory=>memory.kind===`gift:${bad.item.itemId}`),'44 a meaningfully bad gift may become remembered by the exact NPC through the same bounded memory authority');
  verify((bad.rel.knownPreferenceTags?.length??0)<=1,'45 even an aversion reaction may reveal at most one relevant preference tag rather than dumping the hidden profile');

  const lazyFailure=giftState('phase9e-lazy-failure','roasted_coffee_tin',10);delete lazyFailure.npc.preferences;const lazyProfileBefore=lazyFailure.npc.preferences;givePersonalItemGift(lazyFailure.state,lazyFailure.npc.id,lazyFailure.item.id);verify(lazyFailure.npc.preferences===lazyProfileBefore,'46 failed/ineligible gift attempts must not persist a previously lazy NPC preference profile');
  const lazySuccess=giftState('phase9e-lazy-success','threadfox_plush');delete lazySuccess.npc.preferences;verify(givePersonalItemGift(lazySuccess.state,lazySuccess.npc.id,lazySuccess.item.id).success&&Boolean(lazySuccess.npc.preferences),'47 a committed gift may persist the intrinsic deterministic preference profile only through the existing Phase 9A authority');

  const saveRoundTrip=giftState('phase9e-save','late_night_cocoa_set',24,likeProfile);saveRoundTrip.rel.score=100;saveRoundTrip.rel.compatibility=100;saveRoundTrip.npc.hiddenOpinion=100;saveRoundTrip.npc.happiness=100;saveRoundTrip.state.character.stats.happiness=100;const giftedId=saveRoundTrip.item.id;verify(givePersonalItemGift(saveRoundTrip.state,saveRoundTrip.npc.id,giftedId).success,'48 save-round-trip fixture must commit a real gift');const imported=importSave(exportSave(saveRoundTrip.state));const importedNpc=imported.npcs[saveRoundTrip.npc.id];verify(!imported.personalInventory.items.some(item=>item.id===giftedId)&&Boolean(importedNpc?.memories.some(memory=>memory.kind===`gift:${saveRoundTrip.item.itemId}`)),'49 save round-trip must preserve exact item absence plus meaningful NPC-side gift history without resurrecting ownership');

  const rewind=giftState('phase9e-rewind','late_night_cocoa_set',24,likeProfile);rewind.state.flags.rewindEnabled=true;rewind.rel.score=100;rewind.rel.compatibility=100;rewind.npc.hiddenOpinion=100;rewind.npc.happiness=100;rewind.state.character.stats.happiness=100;verify(captureRewindSnapshot(rewind.state),'50 rewind fixture must capture the current schema before the gift');const rewindScore=rewind.rel.score,rewindOpinion=rewind.npc.hiddenOpinion,rewindMemoryCount=rewind.npc.memories.length,rewindTimeline=rewind.state.timeline.length,rewindRng=rewind.state.rngCounter;verify(givePersonalItemGift(rewind.state,rewind.npc.id,rewind.item.id).success&&rewind.state.personalInventory.items.length===0,'51 rewind fixture must remove the exact gift before restoration');verify(rewindToAge(rewind.state,24).success,'52 rewind must restore the captured age successfully after gifting');const restoredRel=rewind.state.relationships.find(rel=>rel.npcId===rewind.npc.id)!;const restoredNpc=rewind.state.npcs[rewind.npc.id]!;verify(rewind.state.personalInventory.items.some(item=>item.id===rewind.item.id)&&restoredRel.score===rewindScore&&restoredNpc.hiddenOpinion===rewindOpinion&&restoredNpc.memories.length===rewindMemoryCount&&rewind.state.timeline.length===rewindTimeline&&rewind.state.rngCounter===rewindRng&&actionUsesThisAge(rewind.state,'social.npc.action',`${rewind.npc.id}:gift`)===0,'53 rewind must atomically restore exact personal ownership and all relationship/NPC/action/RNG consequences from before the gift');

  const dynasty=giftState('phase9e-dynasty','threadfox_plush',24,likeProfile);const heir=addNpc(dynasty.state,'phase9e-heir',20,'child',likeProfile);heir.npc.parentIds=[dynasty.state.character.id];verify(givePersonalItemGift(dynasty.state,dynasty.npc.id,dynasty.item.id).success,'54 dynasty fixture must commit the ordinary gift before protagonist handoff');dynasty.state.character.alive=false;verify(continueAsChild(dynasty.state,heir.npc.id).success&&dynasty.state.personalInventory.items.length===0,'55 descendant continuation must not resurrect the previous protagonist gifted/ordinary personal item ownership');

  const collectible=giftState('phase9e-asset-separation','threadfox_plush');collectible.state.assets.collectibles.push({id:'collectible-only',itemId:'art_1',name:'Collector Piece',estimatedValue:12000,authenticity:99,condition:90,rarity:'rare'});const collectibleBefore=JSON.stringify(collectible.state);verify(!givePersonalItemGift(collectible.state,collectible.npc.id,'collectible-only').success&&JSON.stringify(collectible.state)===collectibleBefore,'56 passing an Asset collectible id to the ordinary gift action must fail without moving or duplicating financial/estate ownership');

  const deterministicBase=giftState('phase9e-deterministic','late_night_cocoa_set',24,likeProfile);const deterministicA=clone(deterministicBase.state),deterministicB=clone(deterministicBase.state);const run=(state:GameState)=>JSON.stringify({result:givePersonalItemGift(state,'gift-target','gift-instance-1'),state});verify(run(deterministicA)===run(deterministicB),'57 identical seeded exact gift actions must serialize identically across cloned authoritative states');

  const staleRelationship=giftState('phase9e-stale-rel');staleRelationship.state.relationships=staleRelationship.state.relationships.filter(rel=>rel.npcId!==staleRelationship.npc.id);const staleRelBefore=JSON.stringify(staleRelationship.state);verify(!givePersonalItemGift(staleRelationship.state,staleRelationship.npc.id,staleRelationship.item.id).success&&JSON.stringify(staleRelationship.state)===staleRelBefore,'58 an NPC without the authoritative relationship record must not accept or consume an owned gift');

  return checks;
}
