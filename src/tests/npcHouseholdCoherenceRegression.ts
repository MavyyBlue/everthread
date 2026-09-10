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

function relationshipType(state:GameState,npcId:string){return state.relationships.find(item=>item.npcId===npcId)?.type;}
function maritalStatus(state:GameState,npcId:string){return state.npcs[npcId]?.maritalStatus;}
function partnerId(state:GameState,npcId:string){return state.npcs[npcId]?.partnerId;}
function householdStatus(state:GameState,npcId:string){return state.npcs[npcId]?.life?.household.status;}
function housing(state:GameState,npcId:string){return state.npcs[npcId]?.life?.finance.housing;}
function sentenceRemaining(state:GameState,npcId:string){return state.npcs[npcId]?.life?.legal.sentenceRemaining;}
function npcAlive(state:GameState,npcId:string){return state.npcs[npcId]?.alive;}

export function runNpcHouseholdCoherenceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`NPC household coherence regression failed: ${message}`);}

  const state=adultState('household-player-romance');
  const {npc}=addFriend(state);
  verify(householdStatus(state,npc.id)==='independent'&&housing(state,npc.id)==='renting','ordinary adult friend should begin in an independent household');

  const ask=changeRelationshipType(state,npc.id,'ask_out');
  verify(ask.success&&relationshipType(state,npc.id)==='partner'&&maritalStatus(state,npc.id)==='dating','Ask Out should create the normal dating relationship');
  verify(partnerId(state,npc.id)===undefined,'player romance must not be duplicated into NPC partnerId');
  verify(householdStatus(state,npc.id)==='partnered'&&housing(state,npc.id)==='shared','adult player partner should immediately project as partnered/shared');

  nextRelationshipYear(state,npc);
  const propose=changeRelationshipType(state,npc.id,'propose');
  verify(propose.success&&relationshipType(state,npc.id)==='fiance'&&maritalStatus(state,npc.id)==='engaged','proposal should preserve engagement identity');
  verify(householdStatus(state,npc.id)==='partnered'&&housing(state,npc.id)==='shared','fiance should remain partnered/shared without NPC partnerId');

  nextRelationshipYear(state,npc);
  const marry=changeRelationshipType(state,npc.id,'marry');
  verify(marry.success&&relationshipType(state,npc.id)==='spouse'&&maritalStatus(state,npc.id)==='married','marriage should preserve spouse identity');
  verify(partnerId(state,npc.id)===undefined&&householdStatus(state,npc.id)==='partnered'&&housing(state,npc.id)==='shared','player spouse should use Relationship truth while household projection stays partnered/shared');

  nextRelationshipYear(state,npc);
  const divorce=changeRelationshipType(state,npc.id,'divorce');
  verify(divorce.success&&relationshipType(state,npc.id)==='ex'&&maritalStatus(state,npc.id)==='divorced','divorce should preserve ex/divorced identity');
  verify(householdStatus(state,npc.id)==='independent'&&housing(state,npc.id)==='renting','divorce should immediately end shared household projection');

  nextRelationshipYear(state,npc);
  const reconcile=changeRelationshipType(state,npc.id,'reconcile');
  verify(reconcile.success&&relationshipType(state,npc.id)==='partner'&&maritalStatus(state,npc.id)==='dating','successful reconciliation should restore dating marital status rather than leaving divorced status');
  verify(partnerId(state,npc.id)===undefined&&householdStatus(state,npc.id)==='partnered'&&housing(state,npc.id)==='shared','reconciliation should immediately restore player-partner household projection without NPC partnerId');

  nextRelationshipYear(state,npc);
  const breakup=changeRelationshipType(state,npc.id,'break_up');
  verify(breakup.success&&relationshipType(state,npc.id)==='ex'&&maritalStatus(state,npc.id)==='single','breakup should return a dating partner to single/ex state');
  verify(householdStatus(state,npc.id)==='independent'&&housing(state,npc.id)==='renting','breakup should immediately restore independent housing');

  const owningState=adultState('household-owned-home');
  const {npc:owner,rel:ownerRel}=addFriend(owningState,'home-owner');
  ownerRel.type='spouse';owner.maritalStatus='married';owner.life!.finance.propertyValue=180000;owner.life!.finance.housing='owning';
  syncNpcHouseholdProjection(owningState,owner);
  verify(householdStatus(owningState,owner.id)==='partnered'&&housing(owningState,owner.id)==='owning','player partnership must not erase an NPC-owned home');
  ownerRel.type='ex';owner.maritalStatus='divorced';syncNpcHouseholdProjection(owningState,owner);
  verify(householdStatus(owningState,owner.id)==='independent'&&housing(owningState,owner.id)==='owning','relationship exit must preserve valid NPC property ownership');

  const legacyState=adultState('household-save-repair');
  const {npc:legacyNpc,rel:legacyRel}=addFriend(legacyState,'legacy-spouse');
  legacyRel.type='spouse';legacyNpc.maritalStatus='married';legacyNpc.life!.household.status='independent';legacyNpc.life!.finance.housing='family';
  const restored=importSave(exportSave(legacyState));
  verify(restored.saveVersion===9&&relationshipType(restored,legacyNpc.id)==='spouse','current-schema save round-trip should preserve relationship truth without a schema bump');
  verify(partnerId(restored,legacyNpc.id)===undefined&&householdStatus(restored,legacyNpc.id)==='partnered'&&housing(restored,legacyNpc.id)==='shared','loading a stale player-spouse household should repair its projection from Relationship truth');

  const legacyPartnerIdState=adultState('household-legacy-player-id');
  const {npc:legacyPartnerIdNpc,rel:legacyPartnerIdRel}=addFriend(legacyPartnerIdState,'legacy-player-id-spouse');
  legacyPartnerIdRel.type='spouse';legacyPartnerIdNpc.maritalStatus='married';legacyPartnerIdNpc.partnerId=legacyPartnerIdState.character.id;
  syncNpcHouseholdProjection(legacyPartnerIdState,legacyPartnerIdNpc);
  verify(partnerId(legacyPartnerIdState,legacyPartnerIdNpc.id)===undefined,'legacy NPC partnerId references to the controlled protagonist should be normalized away');
  verify(householdStatus(legacyPartnerIdState,legacyPartnerIdNpc.id)==='partnered'&&housing(legacyPartnerIdState,legacyPartnerIdNpc.id)==='shared','removing legacy player partnerId must retain household projection through Relationship truth');

  const prisonState=adultState('household-prison-release');
  const {npc:prisonNpc,rel:prisonRel}=addFriend(prisonState,'prison-partner');
  prisonRel.type='spouse';prisonNpc.maritalStatus='married';prisonNpc.life!.legal.sentenceRemaining=1;prisonNpc.imprisoned=true;
  syncNpcHouseholdProjection(prisonState,prisonNpc);
  verify(householdStatus(prisonState,prisonNpc.id)==='institutional'&&housing(prisonState,prisonNpc.id)==='institutional','custody should override romantic shared-housing projection');
  processNpcLives(prisonState);
  verify(npcAlive(prisonState,prisonNpc.id)===true&&sentenceRemaining(prisonState,prisonNpc.id)===0&&!prisonState.npcs[prisonNpc.id]?.imprisoned,'one-year custodial sentence should complete in the normal NPC-life processor');
  verify(householdStatus(prisonState,prisonNpc.id)==='partnered'&&housing(prisonState,prisonNpc.id)==='shared','release should restore a living player spouse to partnered/shared housing');

  const npcCoupleState=adultState('household-npc-couple');
  const first=fixtureNpc(npcCoupleState,'npc-couple-a');const second=fixtureNpc(npcCoupleState,'npc-couple-b');
  first.partnerId=second.id;second.partnerId=first.id;first.maritalStatus='dating';second.maritalStatus='dating';npcCoupleState.npcs[first.id]=first;npcCoupleState.npcs[second.id]=second;
  ensureNpcLife(npcCoupleState,first);ensureNpcLife(npcCoupleState,second);
  first.life!.finance.propertyValue=0;second.life!.finance.propertyValue=0;syncNpcHouseholdProjection(npcCoupleState,first);syncNpcHouseholdProjection(npcCoupleState,second);
  verify(householdStatus(npcCoupleState,first.id)==='partnered'&&householdStatus(npcCoupleState,second.id)==='partnered','existing NPC-to-NPC partnership authority should remain partnered');
  verify(housing(npcCoupleState,first.id)==='shared'&&housing(npcCoupleState,second.id)==='shared'&&partnerId(npcCoupleState,first.id)===second.id&&partnerId(npcCoupleState,second.id)===first.id,'player-household fix must preserve NPC partnerId/shared-housing behavior');

  const deathState=adultState('household-player-death');
  const {npc:survivor,rel:survivorRel}=addFriend(deathState,'surviving-spouse');
  survivorRel.type='spouse';survivor.maritalStatus='married';ensureNpcLife(deathState,survivor);
  verify(householdStatus(deathState,survivor.id)==='partnered'&&housing(deathState,survivor.id)==='shared','pre-death spouse fixture should be partnered/shared');
  verify(checkDeath(deathState,true),'forced player death should execute for cleanup fixture');
  verify(!deathState.character.alive&&maritalStatus(deathState,survivor.id)==='widowed','player death should retain established widowhood cleanup');
  verify(householdStatus(deathState,survivor.id)==='independent'&&housing(deathState,survivor.id)==='renting','surviving player spouse should no longer project a shared household after player death');
  const reloadedDeath=importSave(exportSave(deathState));
  verify(householdStatus(reloadedDeath,survivor.id)==='independent'&&housing(reloadedDeath,survivor.id)==='renting','loading a completed life must not resurrect player-romance household projection');

  const teenState=createNewGame({seed:'household-teen-romance'});teenState.character.age=16;teenState.currentYear=2042;
  const teen=fixtureNpc(teenState,'teen-partner');teen.age=16;teenState.npcs[teen.id]=teen;const teenRel:Relationship={id:'teen-rel',npcId:teen.id,type:'partner',score:100,attraction:100,compatibility:100,yearsKnown:2};teenState.relationships.push(teenRel);ensureNpcLife(teenState,teen);
  verify(householdStatus(teenState,teen.id)==='dependent'&&housing(teenState,teen.id)==='family','teen romance should not incorrectly imply adult shared housing');

  const generationState=adultState('household-descendant-continuity');generationState.character.age=45;generationState.currentYear=2071;
  const adopted=haveChild(generationState,undefined,true);verify(adopted.success,'descendant household fixture should create a child through the normal adoption path');
  const childRel=generationState.relationships.find(item=>item.type==='child')!;const child=generationState.npcs[childRel.npcId]!;child.age=25;ensureNpcLife(generationState,child);
  const descendantPartner=fixtureNpc(generationState,'descendant-partner');descendantPartner.age=26;descendantPartner.maritalStatus='married';descendantPartner.partnerId=child.id;generationState.npcs[descendantPartner.id]=descendantPartner;child.partnerId=descendantPartner.id;child.maritalStatus='married';ensureNpcLife(generationState,descendantPartner);ensureNpcLife(generationState,child);
  generationState.character.alive=false;const continued=continueAsChild(generationState,child.id);
  verify(continued.success&&relationshipType(generationState,descendantPartner.id)==='spouse','descendant continuation should preserve an established NPC marriage as player relationship truth');
  verify(partnerId(generationState,descendantPartner.id)===undefined,'descendant continuation should remove the former NPC partnerId once that partner becomes the controlled protagonist');
  verify(householdStatus(generationState,descendantPartner.id)==='partnered'&&housing(generationState,descendantPartner.id)==='shared','descendant spouse should project a shared household from the rebuilt player relationship');

  return checks;
}
