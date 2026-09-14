import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { validateState, enforceStateInvariants } from '../core/invariants';
import { personalItemDefinitions, personalItemById } from '../data/personalItems';
import { TOWN_PLACES } from '../data/townPlaces';
import { createNewGame } from '../systems/CharacterSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { netWorth } from '../systems/FinanceSystem';
import { PERSONAL_INVENTORY_MAX_ITEMS, discardPersonalItem, personalItemPurchaseStatus, purchasePersonalItem } from '../systems/PersonalInventorySystem';
import { projectPlayerProfile } from '../systems/PlayerProfileSystem';
import { migrateSave } from '../services/SaveSystem';
import type { GameState, Npc, Relationship } from '../types/game';

function addAdultChild(state:GameState,id='phase8d-child'):Npc{
  const npc:Npc={id,firstName:'Avery',lastName:state.character.lastName,age:30,alive:true,health:86,happiness:73,wealth:25_000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:65,maritalStatus:'single',traits:['responsible','curious'],hiddenOpinion:70,memories:[],parentIds:[state.character.id],childIds:[],simulationTier:'full'};
  state.npcs[id]=npc;ensureNpcLife(state,npc);const relationship:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:82,attraction:0,compatibility:74,yearsKnown:30};state.relationships.push(relationship);return npc;
}

export function runPhase8DPlayerProfileInventoryRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 8D player-profile/inventory regression failed: ${message}`);}
  const places=new Set(TOWN_PLACES.map(place=>place.id));

  const fresh=createNewGame({seed:'phase8d-fresh'});
  verify(CURRENT_SAVE_VERSION===16&&fresh.saveVersion===16,'01 Phase 8D must advance current saves to schema 16');
  verify(Array.isArray(fresh.personalInventory.items)&&fresh.personalInventory.items.length===0,'02 new lives must initialize one empty personal inventory authority');

  const legacy=createNewGame({seed:'phase8d-migrate'});legacy.saveVersion=15;delete (legacy as unknown as {personalInventory?:unknown}).personalInventory;const migrationRng=legacy.rngCounter,migrationId=legacy.idCounter;const migrated=migrateSave(legacy);
  verify(migrated.saveVersion===16&&migrated.personalInventory.items.length===0,'03 schema-15 saves must migrate to an empty personal inventory');
  verify(migrated.rngCounter===migrationRng&&migrated.idCounter===migrationId,'04 personal-inventory migration must consume neither gameplay RNG nor runtime IDs');
  const remigrated=migrateSave(structuredClone(migrated));verify(JSON.stringify(remigrated.personalInventory)===JSON.stringify(migrated.personalInventory),'05 current-schema personal-inventory normalization must be idempotent');

  verify(personalItemDefinitions.length===24,'06 Phase 8D must ship 24 meaningful personal-item definitions rather than cosmetic duplicates');
  verify(new Set(personalItemDefinitions.map(item=>item.id)).size===personalItemDefinitions.length,'07 personal-item ids must be unique');
  verify(new Set(personalItemDefinitions.map(item=>item.name)).size===personalItemDefinitions.length,'08 personal-item names must be unique');
  verify(personalItemDefinitions.every(item=>item.price>0&&Number.isFinite(item.price)),'09 personal-item prices must be finite and positive');
  verify(personalItemDefinitions.every(item=>item.minAge>=0&&item.minAge<=18),'10 personal-item age gates must be bounded');
  verify(personalItemDefinitions.every(item=>places.has(item.vendorPlaceId)),'11 every personal item must point at a real Everthread place');
  verify(personalItemDefinitions.every(item=>item.preferenceTags.length>=2),'12 personal items must carry compact future Shared-Lives preference tags');
  verify(new Set(personalItemDefinitions.map(item=>item.category)).size===4,'13 the personal-item catalog must cover all four authored personal categories');
  verify(new Set(personalItemDefinitions.map(item=>item.vendorPlaceId)).size===3,'14 the initial catalog must use three established Everthread commerce landmarks');
  verify(personalItemDefinitions.every(item=>!TOWN_PLACES.find(place=>place.id===item.vendorPlaceId)?.routes),'15 personal-item vendors must not fake a second map mechanic in Phase 8D');

  const profileState=createNewGame({seed:'phase8d-profile'});profileState.character.age=25;profileState.currentYear=2051;const beforeProfile=JSON.stringify(profileState),profileRng=profileState.rngCounter,profileId=profileState.idCounter;const profileA=projectPlayerProfile(profileState),profileB=projectPlayerProfile(profileState);
  verify(JSON.stringify(profileA)===JSON.stringify(profileB),'16 identical player-profile projections must be deterministic');
  verify(JSON.stringify(profileState)===beforeProfile&&profileState.rngCounter===profileRng&&profileState.idCounter===profileId,'17 player-profile projection must be strictly read-only and RNG/ID neutral');
  verify(profileA.fullName.includes(profileState.character.firstName)&&profileA.generation===1&&profileA.age===25,'18 profile projection must expose authoritative playable identity');
  verify(profileA.location==='Everthread','19 profile location must use the established setting/location label projection');
  verify(profileA.personalItems.length===0&&profileA.valuableCollectibles.length===0,'20 empty ownership must project without inventing possessions');

  const purchaseState=createNewGame({seed:'phase8d-purchase'});purchaseState.character.age=22;purchaseState.currentYear=2048;purchaseState.finances.cash=1000;const def=personalItemById.woven_scarf!;const cashBefore=purchaseState.finances.cash,nwBefore=netWorth(purchaseState),purchaseRng=purchaseState.rngCounter,purchaseId=purchaseState.idCounter,assetCount=purchaseState.assets.collectibles.length;const browseBefore=JSON.stringify(purchaseState);const available=personalItemPurchaseStatus(purchaseState,def.id);
  verify(available.allowed&&JSON.stringify(purchaseState)===browseBefore,'21 browsing purchase eligibility must be deterministic and mutation-free');
  const result=purchasePersonalItem(purchaseState,def.id);verify(result.success,'22 an eligible Everthread resident must be able to buy a personal item');
  verify(purchaseState.finances.cash===cashBefore-def.price,'23 personal-item purchase must subtract Cash exactly once');
  verify(netWorth(purchaseState)===nwBefore-def.price,'24 personal items must not silently restore spent Cash as asset/net-worth value');
  verify(purchaseState.assets.collectibles.length===assetCount,'25 personal-item purchase must not duplicate ownership into valuable collectibles');
  verify(purchaseState.personalInventory.items.length===1&&purchaseState.personalInventory.items[0]!.itemId===def.id,'26 purchased personal item must exist exactly once in its own authority');
  verify(purchaseState.personalInventory.items[0]!.sourcePlaceId===def.vendorPlaceId&&purchaseState.personalInventory.items[0]!.acquiredAge===22&&purchaseState.personalInventory.items[0]!.acquiredYear===2048,'27 personal item must retain deterministic acquisition provenance');
  verify(purchaseState.rngCounter===purchaseRng&&purchaseState.idCounter===purchaseId+1,'28 successful purchase must allocate one runtime id and consume no gameplay RNG');
  const projectedPurchase=projectPlayerProfile(purchaseState);verify(projectedPurchase.personalItems.length===1&&projectedPurchase.personalItems[0]!.name===def.name,'29 shared profile must project the authoritative personal item instead of copying it');

  const sameItemSecond=purchasePersonalItem(purchaseState,def.id);const sameItemThird=purchasePersonalItem(purchaseState,def.id);verify(sameItemSecond.success&&!sameItemThird.success,'30 per-item yearly purchase limit must allow two then block further duplicates');
  const totalState=createNewGame({seed:'phase8d-total-limit'});totalState.character.age=30;totalState.finances.cash=10000;for(const item of personalItemDefinitions.slice(0,6))verify(purchasePersonalItem(totalState,item.id).success,`31-${item.id} first six distinct personal purchases should be allowed`);verify(!purchasePersonalItem(totalState,personalItemDefinitions[6]!.id).success,'32 total yearly personal-shopping limit must block the seventh purchase');

  const noCash=createNewGame({seed:'phase8d-no-cash'});noCash.character.age=22;noCash.finances.cash=0;const noCashBefore=JSON.stringify(noCash);verify(!purchasePersonalItem(noCash,def.id).success&&JSON.stringify(noCash)===noCashBefore,'33 insufficient Cash must fail without side effects');
  const abroad=createNewGame({seed:'phase8d-abroad'});abroad.character.age=22;abroad.finances.cash=1000;abroad.character.countryId='jp';abroad.character.city='Tokyo';verify(!personalItemPurchaseStatus(abroad,def.id).allowed,'34 Everthread personal shops must respect authoritative physical residence while abroad');
  const imprisoned=createNewGame({seed:'phase8d-prison'});imprisoned.character.age=22;imprisoned.finances.cash=1000;imprisoned.legal.imprisoned=true;imprisoned.legal.sentenceRemaining=2;verify(!personalItemPurchaseStatus(imprisoned,def.id).allowed,'35 ordinary personal shopping must be unavailable while incarcerated');
  const underage=createNewGame({seed:'phase8d-underage'});underage.character.age=5;underage.finances.cash=1000;verify(!personalItemPurchaseStatus(underage,'polished_fountain_pen').allowed,'36 authored age gates must be enforced by the inventory owner');
  const deceased=createNewGame({seed:'phase8d-deceased'});deceased.character.age=80;deceased.character.alive=false;deceased.finances.cash=1000;verify(!personalItemPurchaseStatus(deceased,def.id).allowed,'37 personal shopping must be unavailable after life completion');
  const full=createNewGame({seed:'phase8d-full'});full.character.age=30;full.finances.cash=10000;full.personalInventory.items=Array.from({length:PERSONAL_INVENTORY_MAX_ITEMS},(_,index)=>({id:`full-${index}`,itemId:def.id,acquiredAge:20,acquiredYear:2046,sourcePlaceId:def.vendorPlaceId,purchasePrice:def.price}));verify(!personalItemPurchaseStatus(full,def.id).allowed,'38 bounded personal inventory must block purchases at the hard cap');
  verify(!purchasePersonalItem(purchaseState,'missing-personal-item').success,'39 stale personal-item ids must fail safely');

  const discardState=createNewGame({seed:'phase8d-discard'});discardState.character.age=22;discardState.finances.cash=1000;verify(purchasePersonalItem(discardState,'nightjar_mug').success,'40 discard fixture purchase must succeed');const owned=discardState.personalInventory.items[0]!,discardCash=discardState.finances.cash,discardRng=discardState.rngCounter,discardId=discardState.idCounter;verify(discardPersonalItem(discardState,owned.id).success&&discardState.personalInventory.items.length===0,'41 discard must remove the exact personal item once');verify(discardState.finances.cash===discardCash&&discardState.rngCounter===discardRng&&discardState.idCounter===discardId,'42 discard must not refund Cash, consume RNG, or allocate ids');verify(!discardPersonalItem(discardState,owned.id).success,'43 stale instance discard must fail safely without duplicating removal');

  const dirty=createNewGame({seed:'phase8d-sanitize'});dirty.character.age=30;dirty.personalInventory.items=[{id:'same',itemId:def.id,acquiredAge:999,acquiredYear:0,sourcePlaceId:'',purchasePrice:-5},{id:'same',itemId:def.id,acquiredAge:20,acquiredYear:2040,sourcePlaceId:def.vendorPlaceId,purchasePrice:def.price},{id:'unknown',itemId:'missing',acquiredAge:20,acquiredYear:2040,sourcePlaceId:def.vendorPlaceId,purchasePrice:1}];enforceStateInvariants(dirty);verify(dirty.personalInventory.items.length===1&&dirty.personalInventory.items[0]!.id==='same','44 invariant repair must remove duplicate/unknown personal inventory rows deterministically');verify(dirty.personalInventory.items[0]!.acquiredAge===30&&dirty.personalInventory.items[0]!.purchasePrice===0&&dirty.personalInventory.items[0]!.sourcePlaceId===def.vendorPlaceId,'45 invariant repair must clamp personal-item provenance without inventing ownership');verify(validateState(dirty).length===0,'46 repaired personal inventory must satisfy central state invariants');

  const rewindState=createNewGame({seed:'phase8d-rewind',rewindEnabled:true});rewindState.character.age=24;rewindState.currentYear=2050;rewindState.finances.cash=1000;verify(captureRewindSnapshot(rewindState),'47 rewind fixture must capture a current-schema snapshot');const rewindCash=rewindState.finances.cash;verify(purchasePersonalItem(rewindState,'nightjar_mug').success&&Number(rewindState.personalInventory.items.length)===1,'48 rewind fixture purchase must create one durable personal item');verify(rewindToAge(rewindState,24).success,'49 rewind must restore the saved age successfully');verify(rewindState.personalInventory.items.length===0&&rewindState.finances.cash===rewindCash,'50 rewind must restore personal inventory and Cash atomically from the snapshot');verify(validateState(rewindState).length===0,'51 rewound Phase 8D state must remain invariant-valid');

  const saved=migrateSave(structuredClone(purchaseState));verify(saved.personalInventory.items.length===purchaseState.personalInventory.items.length&&saved.personalInventory.items[0]!.id===purchaseState.personalInventory.items[0]!.id,'52 current-schema save round-trip must preserve exact personal-item instance ownership');
  const collectibleState=createNewGame({seed:'phase8d-collectible-projection'});collectibleState.assets.collectibles.push({id:'asset-collectible',itemId:'art_1',name:'Valuable Test Piece',estimatedValue:5000,authenticity:98,condition:90,rarity:'rare'});const assetProjection=projectPlayerProfile(collectibleState);verify(assetProjection.valuableCollectibles.length===1&&assetProjection.personalItems.length===0&&assetProjection.valuableCollectibles[0]!.id==='asset-collectible','53 valuable collectibles must be projected from Assets exactly once and never copied into personal inventory');

  const dynasty=createNewGame({seed:'phase8d-dynasty'});dynasty.character.age=65;dynasty.currentYear=2091;dynasty.finances.cash=5000;verify(purchasePersonalItem(dynasty,'pocket_journal').success,'54 dynasty fixture must own one ordinary personal item');dynasty.assets.collectibles.push({id:'dynasty-collectible',itemId:'art_1',name:'Family Artwork',estimatedValue:20000,authenticity:99,condition:92,rarity:'rare'});const child=addAdultChild(dynasty);dynasty.character.alive=false;verify(continueAsChild(dynasty,child.id).success,'55 descendant continuation fixture must succeed');verify(dynasty.personalInventory.items.length===0,'56 ordinary personal possessions must not magically transfer to a new protagonist');verify(dynasty.assets.collectibles.some(item=>item.id==='dynasty-collectible'),'57 valuable collectible inheritance must remain owned by the established estate/asset authority');verify(validateState(dynasty).length===0,'58 Phase 8D descendant continuation must remain state-valid');

  return checks;
}
