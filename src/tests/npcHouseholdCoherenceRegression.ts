import type { GameState, Npc, Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { checkDeath } from '../systems/DeathSystem';
import { ensureNpcLife, processNpcLives, syncNpcHouseholdProjection } from '../systems/NpcLifeSystem';
import { changeRelationshipType, haveChild } from '../systems/RelationshipSystem';
import { exportSave, importSave } from '../services/SaveSystem';
import { continueAsChild } from '../systems/GenerationSystem';

function adultState(seed:string){
  const state=createNewGame({seed});
  state.character.age=25;
  state.currentYear=2051;
  return state;
}

function fixtureNpc(state:GameState,id:string):Npc{
  return {
    id,firstName:'Rowan',lastName:'Fixture',age:25,alive:true,health:92,happiness:82,wealth:0,
    countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:70,maritalStatus:'single',
    traits:['loyal','responsible'],hiddenOpinion:100,memories:[],parentIds:[],childIds:[],simulationTier:'full',
  };
}

function addFriend(state:GameState,id='household-fixture'){
  const npc=fixtureNpc(state,id);
  state.npcs[npc.id]=npc;
  const rel:Relationship={id:`rel-${id}`,npcId:npc.id,type:'friend',score:100,attraction:100,compatibility:100,yearsKnown:4};
  state.relationships.push(rel);
  const life=ensureNpcLife(state,npc);
  life.finance.propertyValue=0;
  life.finance.housing='renting';
  life.household.status='independent';
  return{npc,rel};
}

function nextRelationshipYear(state:GameState,npc:Npc){state.character.age+=1;state.currentYear+=1;npc.age+=1;}

export function runNpcHouseholdCoherenceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`NPC household coherence regression failed: ${message}`);}

  const state=adultState('household-player-romance');
  const {npc,rel}=addFriend(state);
  verify(npc.life?.household.status==='independent'&&npc.life.finance.housing==='renting','ordinary adult friend should begin in an independent household');

  const ask=changeRelationshipType(state,npc.id,'ask_out');
  verify(ask.success&&rel.type==='partner'&&npc.maritalStatus==='dating','Ask Out should create the normal dating relationship');
  verify(npc.partnerId===undefined,'player romance must not be duplicated into NPC partnerId');
  verify(npc.life?.household.status==='partnered'&&npc.life.finance.housing==='shared','adult player partner should immediately project as partnered/shared');

  nextRelationshipYear(state,npc);
  const propose=changeRelationshipType(state,npc.id,'propose');
  verify(propose.success&&rel.type==='fiance'&&npc.maritalStatus==='engaged','proposal should preserve engagement identity');
  verify(npc.life?.household.status==='partnered'&&npc.life.finance.housing==='shared','fiance should remain partnered/shared without NPC partnerId');

  nextRelationshipYear(state,npc);
  const marry=changeRelationshipType(state,npc.id,'marry');
  verify(marry.success&&rel.type==='spouse'&&npc.maritalStatus==='married','marriage should preserve spouse identity');
  verify(npc.partnerId===undefined&&npc.life?.household.status==='partnered'&&npc.life.finance.housing==='shared','player spouse should use Relationship truth while household projection stays partnered/shared');

  nextRelationshipYear(state,npc);
  const divorce=changeRelationshipType(state,npc.id,'divorce');
  verify(divorce.success&&rel.type==='ex'&&npc.maritalStatus==='divorced','divorce should preserve ex/divorced identity');
  verify(npc.life?.household.status==='independent'&&npc.life.finance.housing==='renting','divorce should immediately end shared household projection');

  nextRelationshipYear(state,npc);
  const reconcile=changeRelationshipType(state,npc.id,'reconcile');
  verify(reconcile.success&&rel.type==='partner'&&npc.maritalStatus==='dating','successful reconciliation should restore dating marital status rather than leaving divorced status');
  verify(npc.partnerId===undefined&&npc.life?.household.status==='partnered'&&npc.life.finance.housing==='shared','reconciliation should immediately restore player-partner household projection without NPC partnerId');

  nextRelationshipYear(state,npc);
  const breakup=changeRelationshipType(state,npc.id,'break_up');
  verify(breakup.success&&rel.type==='ex'&&npc.maritalStatus==='single','breakup should return a dating partner to single/ex state');
  verify(npc.life?.household.status==='independent'&&npc.life.finance.housing==='renting','breakup should immediately restore independent housing');

  const owningState=adultState('household-owned-home');
  const {npc:owner,rel:ownerRel}=addFriend(owningState,'home-owner');
  ownerRel.type='spouse';owner.maritalStatus='married';owner.life!.finance.propertyValue=180000;owner.life!.finance.housing='owning';
  syncNpcHouseholdProjection(owningState,owner);
  verify(owner.life!.household.status==='partnered'&&owner.life!.finance.housing==='owning','player partnership must not erase an NPC-owned home');
  ownerRel.type='ex';owner.maritalStatus='divorced';syncNpcHouseholdProjection(owningState,owner);
  verify(owner.life!.household.status==='independent'&&owner.life!.finance.housing==='owning','relationship exit must preserve valid NPC property ownership');

  const legacyState=adultState('household-save-repair');
  const {npc:legacyNpc,rel:legacyRel}=addFriend(legacyState,'legacy-spouse');
  legacyRel.type='spouse';legacyNpc.maritalStatus='married';legacyNpc.life!.household.status='independent';legacyNpc.life!.finance.housing='family';
  const restored=importSave(exportSave(legacyState));
  const restoredNpc=restored.npcs[legacyNpc.id]!;
  const restoredRel=restored.relationships.find(item=>item.npcId===legacyNpc.id)!;
  verify(restored.saveVersion===9&&restoredRel.type==='spouse','current-schema save round-trip should preserve relationship truth without a schema bump');
  verify(restoredNpc.partnerId===undefined&&restoredNpc.life?.household.status==='partnered'&&restoredNpc.life.finance.housing==='shared','loading a stale player-spouse household should repair its projection from Relationship truth');

  const legacyPartnerIdState=adultState('household-legacy-player-id');
  const {npc:legacyPartnerIdNpc,rel:legacyPartnerIdRel}=addFriend(legacyPartnerIdState,'legacy-player-id-spouse');
  legacyPartnerIdRel.type='spouse';legacyPartnerIdNpc.maritalStatus='married';legacyPartnerIdNpc.partnerId=legacyPartnerIdState.character.id;
  syncNpcHouseholdProjection(legacyPartnerIdState,legacyPartnerIdNpc);
  verify(legacyPartnerIdNpc.partnerId===undefined,'legacy NPC partnerId references to the controlled protagonist should be normalized away');
  verify(legacyPartnerIdNpc.life?.household.status==='partnered'&&legacyPartnerIdNpc.life.finance.housing==='shared','removing legacy player partnerId must retain household projection through Relationship truth');

  const prisonState=adultState('household-prison-release');
  const {npc:prisonNpc,rel:prisonRel}=addFriend(prisonState,'prison-partner');
  prisonRel.type='spouse';prisonNpc.maritalStatus='married';prisonNpc.life!.legal.sentenceRemaining=1;prisonNpc.imprisoned=true;
  syncNpcHouseholdProjection(prisonState,prisonNpc);
  verify(prisonNpc.life!.household.status==='institutional'&&prisonNpc.life!.finance.housing==='institutional','custody should override romantic shared-housing projection');
  processNpcLives(prisonState);
  verify(prisonNpc.alive&&prisonNpc.life!.legal.sentenceRemaining===0&&!prisonNpc.imprisoned,'one-year custodial sentence should complete in the normal NPC-life processor');
  verify(prisonNpc.life!.household.status==='partnered'&&prisonNpc.life!.finance.housing==='shared','release should restore a living player spouse to partnered/shared housing');

  const npcCoupleState=adultState('household-npc-couple');
  const first=fixtureNpc(npcCoupleState,'npc-couple-a');const second=fixtureNpc(npcCoupleState,'npc-couple-b');
  first.partnerId=second.id;second.partnerId=first.id;first.maritalStatus='dating';second.maritalStatus='dating';npcCoupleState.npcs[first.id]=first;npcCoupleState.npcs[second.id]=second;
  ensureNpcLife(npcCoupleState,first);ensureNpcLife(npcCoupleState,second);
  first.life!.finance.propertyValue=0;second.life!.finance.propertyValue=0;syncNpcHouseholdProjection(npcCoupleState,first);syncNpcHouseholdProjection(npcCoupleState,second);
  verify(first.life!.household.status==='partnered'&&second.life!.household.status==='partnered','existing NPC-to-NPC partnership authority should remain partnered');
  verify(first.life!.finance.housing==='shared'&&second.life!.finance.housing==='shared'&&first.partnerId===second.id&&second.partnerId===first.id,'player-household fix must preserve NPC partnerId/shared-housing behavior');

  const deathState=adultState('household-player-death');
  const {npc:survivor,rel:survivorRel}=addFriend(deathState,'surviving-spouse');
  survivorRel.type='spouse';survivor.maritalStatus='married';ensureNpcLife(deathState,survivor);
  verify(survivor.life!.household.status==='partnered'&&survivor.life!.finance.housing==='shared','pre-death spouse fixture should be partnered/shared');
  verify(checkDeath(deathState,true),'forced player death should execute for cleanup fixture');
  verify(!deathState.character.alive&&survivor.maritalStatus==='widowed','player death should retain established widowhood cleanup');
  verify(survivor.life!.household.status==='independent'&&survivor.life!.finance.housing==='renting','surviving player spouse should no longer project a shared household after player death');
  const reloadedDeath=importSave(exportSave(deathState));const reloadedSurvivor=reloadedDeath.npcs[survivor.id]!;
  verify(reloadedSurvivor.life?.household.status==='independent'&&reloadedSurvivor.life.finance.housing==='renting','loading a completed life must not resurrect player-romance household projection');

  const teenState=createNewGame({seed:'household-teen-romance'});teenState.character.age=16;teenState.currentYear=2042;
  const teen=fixtureNpc(teenState,'teen-partner');teen.age=16;teenState.npcs[teen.id]=teen;const teenRel:Relationship={id:'teen-rel',npcId:teen.id,type:'partner',score:100,attraction:100,compatibility:100,yearsKnown:2};teenState.relationships.push(teenRel);ensureNpcLife(teenState,teen);
  verify(teen.life?.household.status==='dependent'&&teen.life.finance.housing==='family','teen romance should not incorrectly imply adult shared housing');

  const generationState=adultState('household-descendant-continuity');generationState.character.age=45;generationState.currentYear=2071;
  const adopted=haveChild(generationState,undefined,true);verify(adopted.success,'descendant household fixture should create a child through the normal adoption path');
  const childRel=generationState.relationships.find(item=>item.type==='child')!;const child=generationState.npcs[childRel.npcId]!;child.age=25;ensureNpcLife(generationState,child);
  const descendantPartner=fixtureNpc(generationState,'descendant-partner');descendantPartner.age=26;descendantPartner.maritalStatus='married';descendantPartner.partnerId=child.id;generationState.npcs[descendantPartner.id]=descendantPartner;child.partnerId=descendantPartner.id;child.maritalStatus='married';ensureNpcLife(generationState,descendantPartner);ensureNpcLife(generationState,child);
  generationState.character.alive=false;const continued=continueAsChild(generationState,child.id);
  const continuedSpouseRel=generationState.relationships.find(item=>item.npcId===descendantPartner.id);
  verify(continued.success&&continuedSpouseRel?.type==='spouse','descendant continuation should preserve an established NPC marriage as player relationship truth');
  verify(descendantPartner.partnerId===undefined,'descendant continuation should remove the former NPC partnerId once that partner becomes the controlled protagonist');
  verify(descendantPartner.life?.household.status==='partnered'&&descendantPartner.life.finance.housing==='shared','descendant spouse should project a shared household from the rebuilt player relationship');

  return checks;
}
