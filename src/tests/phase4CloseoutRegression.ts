import { createNewGame } from '../systems/CharacterSystem';
import { GameEngine } from '../engine/GameEngine';
import { enforceStateInvariants, validateState } from '../core/invariants';
import { ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { activeCombatCareerWorld, combatCareerWorlds } from '../systems/CombatCareerWorldSystem';
import { activeMilitaryCareerWorld, militaryCareerWorldView, militaryCareerWorlds, processMilitaryCareerYear } from '../systems/MilitaryCareerWorldSystem';
import { activePoliticsCareerWorld, politicsCareerWorldView, politicsCareerWorlds, processPoliticsCareerYear } from '../systems/PoliticsCareerWorldSystem';
import { persistentCareerWorldKind, persistentCareerWorldLabel, persistentCareerWorlds, PERSISTENT_CAREER_WORLD_KINDS } from '../systems/CareerWorldCatalogSystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { npcCareerProjection, playerCareerLabel } from '../systems/CareerIdentitySystem';
import { migrateSave, SAVE_VERSION } from '../services/SaveSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';
import type { GameState, SocialWorld } from '../types/game';

type Track = Record<string,number|string|boolean>;
function track(state:GameState,key:'combat'|'military'|'politics'|'acting'){return (state.specialCareers[key]??={}) as Track;}
function adultFixture(seed:string,age=30){
  const state=createNewGame({seed});state.character.age=age;state.currentYear=2060+age;state.education=[];state.employment.current=undefined;state.employment.partTimeJobs=[];state.finances.cash=2_000_000;state.legal.criminalRecord=[];state.character.secondary.charisma=100;state.character.secondary.reputation=100;state.character.stats.intelligence=100;state.fame.fame=100;return state;
}
function activeSpecial(state:GameState,kind:string){return state.socialWorlds.filter(world=>world.kind==='organization'&&world.active&&world.id.startsWith(`special-${kind}-`));}
function cloneWorld(world:SocialWorld,id:string){const copy=structuredClone(world);copy.id=id;copy.name=`${world.name} copy`;return copy;}

export async function runPhase4CloseoutRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 4 closeout regression failed: ${message}`);}

  verify(PERSISTENT_CAREER_WORLD_KINDS.length===9&&new Set(PERSISTENT_CAREER_WORLD_KINDS).size===9,'catalog defines each Phase 4 persistent Career World kind exactly once');
  for(const kind of PERSISTENT_CAREER_WORLD_KINDS)verify(Boolean(persistentCareerWorldLabel(kind)),'catalog provides a player-facing label for every persistent Career World kind');
  const fakeBase=adultFixture('phase4-catalog-fake');const fakeWorld=(id:string):SocialWorld=>({id,kind:'organization',name:id,countryId:fakeBase.character.countryId,city:fakeBase.character.city,startedAge:30,active:true,members:[],groups:[]});
  for(const kind of PERSISTENT_CAREER_WORLD_KINDS)verify(persistentCareerWorldKind(fakeWorld(`special-${kind}-fixture`))===kind,`catalog recognizes ${kind} world IDs`);
  verify(persistentCareerWorldKind(fakeWorld('ordinary-organization-fixture'))===undefined,'catalog rejects non-special organizations');

  const integrity=adultFixture('phase4-integrity');const integrityEngine=new GameEngine(integrity);verify(integrityEngine.combatTrain().success,'real GameEngine combat training creates the closeout integrity fixture');const combat=activeCombatCareerWorld(integrity)!;
  verify(Boolean(combat)&&persistentCareerWorlds(integrity,'combat')[0]===combat,'combat world is discoverable through the unified Career World catalog');
  combat.endedAge=integrity.character.age-1;combat.groups[0]!.prestige=160;const firstMember=combat.members[0]!;const firstGroup=combat.groups.find(group=>firstMember.groupIds.includes(group.id))!;firstGroup.memberNpcIds.push(firstMember.npcId);combat.groups.push({...structuredClone(firstGroup),memberNpcIds:[firstMember.npcId]});firstMember.groupIds=[];combat.members.push({...structuredClone(firstMember),groupIds:[firstGroup.id]});
  const beforeRepair=validateState(integrity);verify(beforeRepair.some(error=>error.includes('ended age')),'validation detects an active Career World carrying a stale ended age');
  verify(beforeRepair.some(error=>error.includes('duplicate member')),'validation detects duplicated Career World membership rows or group links');
  verify(beforeRepair.some(error=>error.includes('invalid prestige')),'validation detects out-of-range Career World group prestige');
  verify(beforeRepair.some(error=>error.includes('duplicate group records')),'validation detects duplicate Career World group records');
  enforceStateInvariants(integrity);
  verify(combat.active&&combat.endedAge===undefined,'invariant repair preserves an active valid world while clearing stale ended-age metadata');
  verify(combat.groups.every(group=>Number.isFinite(group.prestige)&&group.prestige>=0&&group.prestige<=100),'invariant repair clamps every Career World group prestige');
  verify(new Set(combat.members.map(member=>member.npcId)).size===combat.members.length,'invariant repair collapses duplicate member rows by exact NPC identity');
  verify(combat.groups.every(group=>new Set(group.memberNpcIds).size===group.memberNpcIds.length),'invariant repair removes duplicate group member IDs');
  verify(new Set(combat.groups.map(group=>group.id)).size===combat.groups.length,'invariant repair collapses duplicate group records without deleting valid membership');
  verify(combat.members.every(member=>member.groupIds.every(groupId=>combat.groups.some(group=>group.id===groupId&&group.memberNpcIds.includes(member.npcId)))),'invariant repair restores member-to-group symmetry');
  verify(combat.groups.every(group=>group.memberNpcIds.every(npcId=>combat.members.some(member=>member.npcId===npcId&&member.groupIds.includes(group.id)))),'invariant repair restores group-to-member symmetry');
  verify(validateState(integrity).length===0,'repaired live Career World passes full state validation');

  const duplicate=cloneWorld(combat,'special-combat-duplicate-fixture');integrity.socialWorlds.push(duplicate);verify(validateState(integrity).some(error=>error==='Multiple active combat Career Worlds'),'validation detects duplicate active combat worlds before normalization');enforceStateInvariants(integrity);
  verify(activeSpecial(integrity,'combat').length===1,'invariant repair leaves at most one active combat world');
  verify(activeCombatCareerWorld(integrity)?.id===String(track(integrity,'combat').worldId),'duplicate repair prefers the world referenced by the authoritative career track');
  verify(!duplicate.active&&duplicate.endedAge===integrity.character.age&&duplicate.members.every(member=>member.leftAge===integrity.character.age),'discarded duplicate world is archived with former member affiliations instead of erased');

  const archived=cloneWorld(combat,'special-combat-archived-fixture');archived.active=false;delete archived.endedAge;for(const member of archived.members)delete member.leftAge;integrity.socialWorlds.push(archived);verify(validateState(integrity).some(error=>error.includes('missing an ended age')),'validation detects archived worlds missing termination metadata');enforceStateInvariants(integrity);
  verify(!archived.active&&archived.endedAge!==undefined&&archived.members.every(member=>member.leftAge!==undefined),'invariant repair closes orphaned archived affiliations without deleting historical people');

  const orphanCombat=adultFixture('phase4-orphan-combat');const orphanCombatEngine=new GameEngine(orphanCombat);orphanCombatEngine.combatTrain();const orphanCombatWorld=activeCombatCareerWorld(orphanCombat)!;track(orphanCombat,'combat').active=false;enforceStateInvariants(orphanCombat);verify(!orphanCombatWorld.active&&orphanCombatWorld.members.every(member=>member.leftAge!==undefined),'inactive combat career cannot retain a phantom active gym/circuit world');

  const orphanMilitary=adultFixture('phase4-orphan-military');const orphanMilitaryEngine=new GameEngine(orphanMilitary);verify(orphanMilitaryEngine.enlist('Army').success,'military fixture enlists through the real GameEngine');processMilitaryCareerYear(orphanMilitary);const orphanMilitaryWorld=activeMilitaryCareerWorld(orphanMilitary)!;track(orphanMilitary,'military').active=false;enforceStateInvariants(orphanMilitary);verify(!orphanMilitaryWorld.active&&orphanMilitaryWorld.members.every(member=>member.leftAge!==undefined),'inactive military career cannot retain a phantom active posting');

  const orphanPolitics=adultFixture('phase4-orphan-politics');const orphanPoliticsEngine=new GameEngine(orphanPolitics);verify(orphanPoliticsEngine.campaign(1).success,'politics fixture wins through the existing election authority');processPoliticsCareerYear(orphanPolitics);const orphanPoliticsWorld=activePoliticsCareerWorld(orphanPolitics)!;track(orphanPolitics,'politics').office=0;track(orphanPolitics,'politics').active=false;enforceStateInvariants(orphanPolitics);verify(!orphanPoliticsWorld.active&&orphanPoliticsWorld.members.every(member=>member.leftAge!==undefined),'politics without elected office cannot retain a phantom active office world');

  const deep=adultFixture('phase4-deep-duplicate');const acting=ensureSpecialCareerWorld(deep,'acting','fixture',{announce:false});track(deep,'acting').worldId=acting.id;const actingDuplicate=cloneWorld(acting,'special-acting-duplicate-fixture');deep.socialWorlds.push(actingDuplicate);verify(validateState(deep).some(error=>error==='Multiple active acting Career Worlds'),'validation detects duplicate active deep-career worlds as well as 4E worlds');enforceStateInvariants(deep);verify(activeSpecial(deep,'acting').length===1&&activeSpecial(deep,'acting')[0]!.id===acting.id,'deep-career duplicate repair preserves the track-referenced current world');verify(!actingDuplicate.active&&actingDuplicate.members.every(member=>member.leftAge!==undefined),'deep-career duplicate repair archives rather than deletes displaced history');

  const coexist=adultFixture('phase4-coexist');const engine=new GameEngine(coexist);verify(engine.combatTrain().success,'combat can begin as the first active special-career commitment');verify(engine.enlist('Army').success,'military can begin as the second active special-career commitment');processMilitaryCareerYear(coexist);verify(activeSpecial(coexist,'combat').length===1&&activeSpecial(coexist,'military').length===1,'two legal simultaneous special careers retain one active world each');
  const cashBeforeBlockedCampaign=coexist.finances.cash;verify(!engine.campaign(1).success&&coexist.finances.cash===cashBeforeBlockedCampaign,'third special career is blocked before campaign funds are consumed');
  const combatNpc=activeCombatCareerWorld(coexist)!.members[0]!.npcId;verify(engine.leaveSpecialCareer('combat').success,'Leave Path succeeds for the active combat career');verify(activeSpecial(coexist,'combat').length===0&&relationshipsForFolder(coexist,'career').some(rel=>rel.npcId===combatNpc),'leaving combat archives its world immediately while preserving Career World people');
  verify(engine.campaign(1).success,'freeing one commitment slot permits a real political campaign');processPoliticsCareerYear(coexist);verify(activeSpecial(coexist,'military').length===1&&activeSpecial(coexist,'politics').length===1,'military and politics can coexist without overwriting one another');
  verify(persistentCareerWorlds(coexist).some(world=>world.id.startsWith('special-combat-')&&!world.active)&&persistentCareerWorlds(coexist).some(world=>world.id.startsWith('special-military-')&&world.active)&&persistentCareerWorlds(coexist).some(world=>world.id.startsWith('special-politics-')&&world.active),'unified catalog presents archived and current 4E career chapters together');
  verify(playerCareerLabel(coexist).includes('Army Service')&&playerCareerLabel(coexist).includes('Officeholder'),'player career identity reports both active cross-system commitments coherently');
  const militaryView=militaryCareerWorldView(coexist)!;const commander=coexist.npcs[militaryView.commanderNpcId!]!;commander.careerId='fixture-unrelated-job';const commanderProjection=npcCareerProjection(coexist,commander);verify(commanderProjection.specialCareer?.kind==='military'&&commanderProjection.career.includes('Unit Commander'),'active military NPC projection outranks an unrelated autonomous occupation');
  const politicsView=politicsCareerWorldView(coexist)!;const chief=coexist.npcs[politicsView.chiefStaffNpcId!]!;chief.careerId='fixture-unrelated-job';const chiefProjection=npcCareerProjection(coexist,chief);verify(chiefProjection.specialCareer?.kind==='politics'&&chiefProjection.career.includes('Chief of Staff'),'active political NPC projection outranks an unrelated autonomous occupation');
  verify(validateState(coexist).length===0,'cross-career coexistence state passes full validation');
  await withEverthreadAiTestbench({state:coexist,screen:'career'},async bench=>{
    const before=JSON.stringify(bench.getState());const observation=bench.observe('career');const observedWorlds=(observation.data.worlds??[]) as Array<{id:string;active:boolean}>;
    verify(observedWorlds.some(world=>world.id.startsWith('special-combat-')&&!world.active)&&observedWorlds.some(world=>world.id.startsWith('special-military-')&&world.active)&&observedWorlds.some(world=>world.id.startsWith('special-politics-')&&world.active),'AI testbench Career observation exposes archived/current supplemental Career Worlds through the same unified catalog as the player UI');
    verify(JSON.stringify(bench.getState())===before,'AI testbench unified Career World observation remains strictly read-only');
  });

  const serialized=JSON.stringify(coexist);const restored=migrateSave(JSON.parse(serialized) as unknown);verify(restored.saveVersion===SAVE_VERSION&&SAVE_VERSION===11,'Phase 4 closeout preserves save schema 11');
  verify(validateState(restored).length===0,'serialized Phase 4 state migrates back into a valid state');
  verify(activeMilitaryCareerWorld(restored)?.id===activeMilitaryCareerWorld(coexist)?.id&&activePoliticsCareerWorld(restored)?.id===activePoliticsCareerWorld(coexist)?.id,'save round-trip preserves exact active military and political world IDs');
  const restoredMilitary=militaryCareerWorldView(restored)!;const restoredPolitics=politicsCareerWorldView(restored)!;verify(restoredMilitary.commanderNpcId===militaryView.commanderNpcId&&restoredPolitics.chiefStaffNpcId===politicsView.chiefStaffNpcId,'save round-trip preserves exact persistent authority NPC references');
  verify(restored.relationships.some(rel=>rel.npcId===restoredMilitary.commanderNpcId)&&restored.relationships.some(rel=>rel.npcId===restoredPolitics.chiefStaffNpcId),'save round-trip preserves ordinary relationship ownership for Career World authorities');
  verify(persistentCareerWorlds(restored).length===persistentCareerWorlds(coexist).length,'save round-trip preserves complete current/former Career World history');

  const corruptSave=structuredClone(coexist);const corruptMilitary=activeMilitaryCareerWorld(corruptSave)!;const corruptDuplicate=cloneWorld(corruptMilitary,'special-military-save-duplicate');corruptSave.socialWorlds.push(corruptDuplicate);corruptMilitary.groups[0]!.prestige=Number.POSITIVE_INFINITY;const repairedSave=migrateSave(JSON.parse(JSON.stringify(corruptSave,(key,value)=>value===Number.POSITIVE_INFINITY?999:value)) as unknown);verify(activeSpecial(repairedSave,'military').length===1,'save migration repairs duplicate active special-career worlds before play resumes');verify(repairedSave.socialWorlds.filter(world=>world.id.startsWith('special-military-')).every(world=>world.groups.every(group=>group.prestige>=0&&group.prestige<=100)),'save migration repairs invalid Career World group values');verify(validateState(repairedSave).length===0,'repaired imported/migrated Phase 4 state passes validation');

  const repeated=adultFixture('phase4-repeated-chapters');const repeatedEngine=new GameEngine(repeated);const baseNpcCount=Object.keys(repeated.npcs).length;
  for(let chapter=0;chapter<6;chapter+=1){verify(repeatedEngine.combatTrain().success,`combat chapter ${chapter+1} can begin through the real re-entry lifecycle`);verify(repeatedEngine.leaveSpecialCareer('combat').success,`combat chapter ${chapter+1} can archive through Leave Path`);repeated.character.age+=1;repeated.currentYear+=1;}
  const repeatedWorlds=combatCareerWorlds(repeated);verify(repeatedWorlds.length===6&&repeatedWorlds.every(world=>!world.active&&world.endedAge!==undefined),'six repeated career chapters remain six archived histories rather than resurrected/duplicated active worlds');
  verify(Object.keys(repeated.npcs).length-baseNpcCount<=72,'repeated Phase 4 career chapters keep cumulative NPC growth within the configured bounded roster envelope');
  verify(repeatedWorlds.every(world=>world.members.every(member=>member.leftAge!==undefined)),'every archived repeated chapter closes all active affiliations');
  verify(validateState(enforceStateInvariants(repeated)).length===0,'multi-chapter long-life fixture remains valid after final invariant normalization');

  return checks;
}
