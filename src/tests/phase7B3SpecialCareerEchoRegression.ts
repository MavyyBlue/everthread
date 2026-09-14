import { lifeEvents } from '../data/events';
import { specialCareerStoryEvents } from '../data/specialCareerStoryEvents';
import { systemicConsequenceEventById, systemicConsequenceEvents } from '../data/systemicConsequenceEvents';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { nextDueConsequence } from '../systems/ConsequenceSystem';
import { processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import {
  activeCombatCareerWorld,
  archiveCombatCareerWorld,
  combatCareerWorldView,
  takeCombatFight,
  trainCombatCareer,
} from '../systems/CombatCareerWorldSystem';
import {
  activeMilitaryCareerWorld,
  archiveMilitaryCareerWorld,
  militaryCareerWorldView,
  processMilitaryCareerYear,
} from '../systems/MilitaryCareerWorldSystem';
import {
  activePoliticsCareerWorld,
  archivePoliticsCareerWorld,
  ensurePoliticsCareerWorld,
  politicsCareerWorldView,
} from '../systems/PoliticsCareerWorldSystem';
import { enlistMilitary, militaryTraining, politicalAction } from '../systems/SpecialCareerSystem';
import {
  scheduleCombatBoutEcho,
  scheduleCombatTrainingEcho,
  scheduleMilitaryTrainingEcho,
  schedulePoliticsPolicyEcho,
  schedulePoliticsPressEcho,
} from '../systems/SystemicStorySystem';
import { exportSave, importSave } from '../services/SaveSystem';
import type { GameState } from '../types/game';

function adult(seed:string,age=30){const state=createNewGame({seed});state.character.age=age;state.currentYear=state.character.birthYear+age;state.finances.cash=2_000_000;return state;}
function advanceTo(state:GameState,age:number){state.character.age=age;state.currentYear=state.character.birthYear+age;}
function career(state:GameState,key:'combat'|'military'|'politics'){return state.specialCareers[key] as Record<string,number|string|boolean>;}
function politicsFixture(seed:string){const state=adult(seed,35);state.specialCareers.politics={active:true,office:1,approval:55,electionsWon:1};const world=ensurePoliticsCareerWorld(state,{announce:false});if(!world)throw new Error('Phase 7B3 fixture failed to create politics world.');const view=politicsCareerWorldView(state,world);if(!view?.chiefStaffNpcId||!view.opponentNpcId)throw new Error('Phase 7B3 fixture failed to create political targets.');return{state,world,view};}

export function runPhase7B3SpecialCareerEchoRegression(){
  let checks=0;function check(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 7B3 special-career echo regression failed: ${message}`);}

  const phase7b3Events=systemicConsequenceEvents.filter(event=>event.tags.includes('phase7b3'));
  check(lifeEvents.length===691,'01 ordinary random-event pool must remain exactly 691');
  check(phase7b3Events.length===5&&phase7b3Events.every(event=>event.probability===0),'02 Phase 7B3 must add exactly five system-owned probability-zero echoes');
  check(phase7b3Events.every(event=>!lifeEvents.some(random=>random.id===event.id)&&!specialCareerStoryEvents.some(story=>story.id===event.id)&&systemicConsequenceEventById[event.id]===event),'03 Phase 7B3 echoes must stay outside both random events and the older annual special-career story registry');

  const combatTrain=adult('phase7b3-combat-training',22);const combatRngBefore=combatTrain.rngCounter;const trained=trainCombatCareer(combatTrain);const combatWorld=activeCombatCareerWorld(combatTrain)!;const combatView=combatCareerWorldView(combatTrain,combatWorld)!;const coachId=combatView.coachNpcId!;const trainingStory=combatTrain.delayedEvents.find(item=>item.eventId==='systemic_combat_training_return');
  check(trained.success&&Boolean(trainingStory)&&combatTrain.rngCounter===combatRngBefore,'04 combat training must preserve its existing RNG behavior and schedule a long-tail echo');
  check(trainingStory?.dueAge===25&&trainingStory.payload?.careerKind==='combat'&&trainingStory.payload?.worldId===combatWorld.id&&trainingStory.payload?.npcId===coachId,'05 combat-training echo must bind career world and exact coach for three years later');
  check(trainingStory?.targetRefs?.some(ref=>ref.kind==='career'&&ref.id==='combat')===true&&trainingStory.targetRefs?.some(ref=>ref.kind==='social_world'&&ref.id===combatWorld.id)===true&&trainingStory.targetRefs?.some(ref=>ref.kind==='npc'&&ref.id===coachId)===true,'06 combat-training echo must carry exact career/world/NPC refs');
  const idBeforeTrainingDuplicate=combatTrain.idCounter;const duplicateTraining=scheduleCombatTrainingEcho(combatTrain,combatWorld.id,coachId);check(!duplicateTraining.scheduled&&duplicateTraining.reason==='duplicate'&&combatTrain.idCounter===idBeforeTrainingDuplicate,'07 unresolved combat-training echo must dedupe without consuming a runtime id');
  archiveCombatCareerWorld(combatWorld,23);advanceTo(combatTrain,25);const trainingPending=processDelayedEvents(combatTrain);check(trainingPending?.eventId==='systemic_combat_training_return'&&trainingPending.description.includes(combatWorld.name)&&trainingPending.description.includes(combatTrain.npcs[coachId]!.firstName),'08 archived combat history must still resolve the exact world and coach');
  combatTrain.pendingEvent=trainingPending;const coachRel=combatTrain.relationships.find(rel=>rel.npcId===coachId)!;const coachScoreBefore=coachRel.score;const combatSkillBefore=Number(career(combatTrain,'combat').skill??0);const trainingResolution=resolvePendingEvent(combatTrain,'credit_coach');
  check(coachRel.score===Math.min(100,coachScoreBefore+7)&&Number(career(combatTrain,'combat').skill)===Math.min(100,combatSkillBefore+2),'09 combat-training choice must mutate exact coach relationship and existing combat skill authority');
  check(trainingResolution.stateChanges?.some(change=>change.startsWith('specialCareer:combat:skill '))===true&&combatTrain.timeline.at(-1)?.category==='career','10 combat-training resolution must expose semantic career change and career timeline history');

  const combatFight=adult('phase7b3-combat-bout',22);trainCombatCareer(combatFight);const fightWorld=activeCombatCareerWorld(combatFight)!;const fightAction=takeCombatFight(combatFight,100);const opponentId=String(career(combatFight,'combat').lastOpponentNpcId??'');const boutStory=combatFight.delayedEvents.find(item=>item.eventId==='systemic_combat_bout_return');
  check(Boolean(opponentId)&&Boolean(boutStory)&&boutStory?.dueAge===24,'11 a completed sanctioned bout must schedule a two-year rivalry echo regardless of win/loss');
  check(boutStory?.payload?.worldId===fightWorld.id&&boutStory.payload?.npcId===opponentId&&boutStory.payload?.careerKind==='combat','12 bout echo must bind the exact fight world opponent and combat track');
  const boutRoundTrip=importSave(exportSave(combatFight));const savedBout=boutRoundTrip.delayedEvents.find(item=>item.eventId==='systemic_combat_bout_return');check(savedBout?.payload?.npcId===opponentId&&savedBout.targetRefs?.some(ref=>ref.kind==='npc'&&ref.id===opponentId)===true,'13 save round-trip must preserve exact bout target identity');
  check(typeof fightAction.success==='boolean','14 original combat action success semantics must remain the actual bout result rather than scheduling success');
  combatFight.npcs[opponentId]!.alive=false;advanceTo(combatFight,24);check(!nextDueConsequence(combatFight)&&combatFight.consequenceScheduler.history.some(item=>item.eventId==='systemic_combat_bout_return'&&item.reason==='target_npc_dead'),'15 dead exact combat rival must cancel the future echo rather than retargeting');

  const military=adult('phase7b3-military',24);enlistMilitary(military,'Army');processMilitaryCareerYear(military);const militaryWorld=activeMilitaryCareerWorld(military)!;const militaryView=militaryCareerWorldView(military,militaryWorld)!;const commanderId=militaryView.commanderNpcId!;const militaryAction=militaryTraining(military);const militaryStory=military.delayedEvents.find(item=>item.eventId==='systemic_military_training_return');
  check(militaryAction.success&&militaryStory?.dueAge===27,'16 successful military training must schedule a three-year service echo');
  check(militaryStory?.payload?.careerKind==='military'&&militaryStory.payload?.worldId===militaryWorld.id&&militaryStory.payload?.npcId===commanderId,'17 military echo must retain the exact posting and commander when that world exists');
  archiveMilitaryCareerWorld(militaryWorld,25);advanceTo(military,27);const militaryPending=processDelayedEvents(military);check(militaryPending?.eventId==='systemic_military_training_return'&&militaryPending.payload?.npcId===commanderId,'18 military history must remain eligible after the original posting archives');
  military.pendingEvent=militaryPending;const commanderRel=military.relationships.find(rel=>rel.npcId===commanderId)!;const commanderScoreBefore=commanderRel.score;const militarySkillBefore=Number(career(military,'military').skill);const militaryResolution=resolvePendingEvent(military,'carry_standard');
  check(commanderRel.score===Math.min(100,commanderScoreBefore+5)&&Number(career(military,'military').skill)===Math.min(100,militarySkillBefore+3),'19 military follow-up must reconcile through the exact commander relationship and service skill track');
  check(militaryResolution.stateChanges?.some(change=>change.startsWith('specialCareer:military:skill '))===true,'20 military echo must expose a semantic special-career state change');

  const militaryNoWorld=adult('phase7b3-military-no-world',24);enlistMilitary(militaryNoWorld,'Army');const noWorldAction=militaryTraining(militaryNoWorld);const noWorldStory=militaryNoWorld.delayedEvents.find(item=>item.eventId==='systemic_military_training_return');
  check(noWorldAction.success&&noWorldStory?.targetRefs?.length===1&&noWorldStory.targetRefs[0]?.kind==='career'&&noWorldStory.targetRefs[0].id==='military','21 same-age post-enlistment training must schedule safely without inventing a UI-only military world');
  const noWorldRng=militaryNoWorld.rngCounter;const noWorldId=militaryNoWorld.idCounter;const noWorldDuplicate=scheduleMilitaryTrainingEcho(militaryNoWorld);check(!noWorldDuplicate.scheduled&&militaryNoWorld.rngCounter===noWorldRng&&militaryNoWorld.idCounter===noWorldId,'22 career-only military echo must dedupe without RNG or id consumption');

  const deadCommander=adult('phase7b3-dead-commander',24);enlistMilitary(deadCommander,'Army');processMilitaryCareerYear(deadCommander);const deadMilitaryWorld=activeMilitaryCareerWorld(deadCommander)!;const deadMilitaryView=militaryCareerWorldView(deadCommander,deadMilitaryWorld)!;militaryTraining(deadCommander);deadCommander.npcs[deadMilitaryView.commanderNpcId!]!.alive=false;advanceTo(deadCommander,27);check(!nextDueConsequence(deadCommander)&&deadCommander.consequenceScheduler.history.some(item=>item.eventId==='systemic_military_training_return'&&item.reason==='target_npc_dead'),'23 dead exact commander must cancel instead of selecting a replacement');

  const policy=politicsFixture('phase7b3-policy');const policyRngBefore=policy.state.rngCounter;const policyAction=politicalAction(policy.state,'policy');const policyStory=policy.state.delayedEvents.find(item=>item.eventId==='systemic_politics_policy_return');
  check(Boolean(policyStory)&&policy.state.rngCounter>policyRngBefore&&typeof policyAction.success==='boolean','24 policy action must keep its existing RNG/result semantics while scheduling afterward');
  check(policyStory?.dueAge===37&&policyStory.payload?.careerKind==='politics'&&policyStory.payload?.worldId===policy.world.id&&policyStory.payload?.npcId===policy.view.chiefStaffNpcId,'25 policy echo must bind the exact office and chief of staff');
  const policyIdBefore=policy.state.idCounter;const policyDuplicate=schedulePoliticsPolicyEcho(policy.state,policy.world.id,policy.view.chiefStaffNpcId);check(!policyDuplicate.scheduled&&policyDuplicate.reason==='duplicate'&&policy.state.idCounter===policyIdBefore,'26 policy echo must dedupe without id consumption');
  archivePoliticsCareerWorld(policy.world,36);advanceTo(policy.state,37);const policyPending=processDelayedEvents(policy.state);check(policyPending?.eventId==='systemic_politics_policy_return'&&policyPending.payload?.worldId===policy.world.id,'27 policy record must be able to echo after the original office world archives');
  policy.state.pendingEvent=policyPending;const chiefRel=policy.state.relationships.find(rel=>rel.npcId===policy.view.chiefStaffNpcId)!;const chiefBefore=chiefRel.score;const approvalBefore=Number(career(policy.state,'politics').approval);const publicRepBefore=policy.state.fame.publicReputation;const policyResolution=resolvePendingEvent(policy.state,'revise_position');
  check(chiefRel.score===Math.min(100,chiefBefore+6)&&Number(career(policy.state,'politics').approval)===Math.min(100,approvalBefore+2)&&policy.state.fame.publicReputation===Math.min(100,publicRepBefore+3),'28 policy choice must affect exact chief relationship, political approval, and public reputation through existing authorities');
  check(policyResolution.stateChanges?.some(change=>change.startsWith('specialCareer:politics:approval '))===true,'29 policy echo must expose political approval as an exact semantic state change');

  const press=politicsFixture('phase7b3-press');politicalAction(press.state,'press');const pressStory=press.state.delayedEvents.find(item=>item.eventId==='systemic_politics_press_return');
  check(pressStory?.payload?.npcId===press.view.opponentNpcId&&pressStory?.payload?.worldId===press.world.id&&pressStory?.dueAge===37,'30 press confrontation must bind the exact opposition leader and office world for two years later');
  press.state.npcs[press.view.opponentNpcId!]!.alive=false;advanceTo(press.state,37);check(!nextDueConsequence(press.state)&&press.state.consequenceScheduler.history.some(item=>item.eventId==='systemic_politics_press_return'&&item.reason==='target_npc_dead'),'31 dead exact political opponent must cancel rather than retargeting the confrontation');

  const politicsNoWorld=adult('phase7b3-politics-no-world',35);politicsNoWorld.specialCareers.politics={active:true,office:1,approval:55};const directRng=politicsNoWorld.rngCounter;const directPress=schedulePoliticsPressEcho(politicsNoWorld);check(directPress.scheduled&&politicsNoWorld.rngCounter===directRng&&directPress.consequence?.targetRefs?.length===1&&directPress.consequence.targetRefs[0]?.kind==='career','32 direct career-only politics scheduling must be RNG-neutral and must not invent world/NPC state');
  const directCombat=adult('phase7b3-direct-combat',22);directCombat.specialCareers.combat={active:true,skill:50,reputation:40};const directCombatRng=directCombat.rngCounter;const fakeWorld='missing-world';const fakeNpc='missing-npc';const directBout=scheduleCombatBoutEcho(directCombat,fakeWorld,fakeNpc);check(directBout.scheduled&&directCombat.rngCounter===directCombatRng,'33 direct Phase 7B3 scheduling itself must consume no gameplay RNG');
  advanceTo(directCombat,24);check(!nextDueConsequence(directCombat)&&directCombat.consequenceScheduler.history.some(item=>item.eventId==='systemic_combat_bout_return'&&item.reason==='missing_target:social_world'),'34 invalid exact world target must cancel deterministically before any retargeting');

  check(combatTrain.saveVersion===16&&military.saveVersion===16&&policy.state.saveVersion===16,'35 Phase 7B3 story state remains compatible with current schema 16');
  const states:Record<string,GameState>={combatTrain,combatFight,military,militaryNoWorld,deadCommander,policy:policy.state,press:press.state,politicsNoWorld,directCombat};const invariantErrors=Object.fromEntries(Object.entries(states).map(([key,state])=>[key,validateState(state)]));check(Object.values(invariantErrors).every(errors=>errors.length===0),`36 Phase 7B3 fixtures must satisfy global state invariants: ${JSON.stringify(invariantErrors)}`);

  return checks;
}
