import { createNewGame } from '../systems/CharacterSystem';
import {
  activeCombatCareerWorld,
  combatCareerWorldView,
  combatCareerWorlds,
  ensureCombatCareerWorld,
  processCombatCareerYear,
  takeCombatFight,
  trainCombatCareer,
} from '../systems/CombatCareerWorldSystem';
import { leaveSpecialCareer } from '../systems/SpecialCareerExitSystem';
import { npcCareerProjection, playerCareerLabel } from '../systems/CareerIdentitySystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';
import type { GameState, SocialWorld } from '../types/game';

type Track = Record<string, number | string | boolean>;

function track(state:GameState){return state.specialCareers.combat as Track;}
function group(world:SocialWorld,key:'coaches'|'training'|'rivals'){return world.groups.find(item=>item.kind===`special:combat:${key}`)!;}
function activeGroupIds(state:GameState,world:SocialWorld,key:'coaches'|'training'|'rivals'){
  return group(world,key).memberNpcIds.filter(id=>world.members.some(member=>member.npcId===id&&member.leftAge===undefined)&&state.npcs[id]?.alive);
}
function adultFixture(seed:string,age=24){const state=createNewGame({seed});state.character.age=age;state.currentYear=2060+age;state.education=[];state.employment.current=undefined;state.employment.partTimeJobs=[];return state;}
function finiteBounded(value:unknown){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;}

export async function runCombatCareerWorldRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Combat-career world regression failed: ${message}`);}

  const child=adultFixture('combat-world-underage',11);
  verify(!trainCombatCareer(child).success&&combatCareerWorlds(child).length===0,'1 combat training must reject an underage character without creating a Career World');

  const state=adultFixture('combat-world-foundation');const rngBeforeTraining=state.rngCounter;
  const trained=trainCombatCareer(state);
  verify(trained.success,'2 a qualified character must be able to begin combat-sport training');
  const world=activeCombatCareerWorld(state);
  verify(Boolean(world)&&combatCareerWorlds(state).length===1,'3 first successful training must create exactly one active combat Career World');
  verify(Boolean(world?.id.startsWith('special-combat-'))&&world?.kind==='organization','4 the combat environment must use the existing Social World organization model and special-combat id namespace');
  verify(world?.groups.length===3&&Boolean(group(world!,'coaches'))&&Boolean(group(world!,'training'))&&Boolean(group(world!,'rivals')),'5 the persistent combat world must contain coaching, training-partner, and rival groups');
  verify(activeGroupIds(state,world!,'coaches').length>=2&&activeGroupIds(state,world!,'coaches').length<=3,'6 active coaching staff must stay within the initial bounded roster');
  verify(activeGroupIds(state,world!,'training').length>=3&&activeGroupIds(state,world!,'training').length<=5,'7 active training partners must stay within the initial bounded roster');
  verify(activeGroupIds(state,world!,'rivals').length>=2&&activeGroupIds(state,world!,'rivals').length<=4,'8 active circuit rivals must stay within the initial bounded roster');
  const headCoach=world!.members.find(member=>member.role==='leader'&&activeGroupIds(state,world!,'coaches').includes(member.npcId));
  verify(Boolean(headCoach)&&state.relationships.find(rel=>rel.npcId===headCoach!.npcId)?.type==='coach','9 the combat world must persist an exact head coach through the normal relationship graph');
  verify(activeGroupIds(state,world!,'rivals').every(id=>state.relationships.find(rel=>rel.npcId===id)?.type==='enemy'),'10 generated circuit rivals must be exact persistent hostile career relationships');
  verify(state.rngCounter===rngBeforeTraining,'11 creating and training inside the combat world must not consume the core RNG stream when the action itself has no core-random outcome');

  const careerPeople=new Set(relationshipsForFolder(state,'career').map(rel=>rel.npcId));
  verify(world!.members.every(member=>careerPeople.has(member.npcId)),'12 People → Career Worlds must automatically include the combat roster through existing affiliation history');
  verify(playerCareerLabel(state)==='Combat Athlete','13 the active combat commitment must outrank unemployment in the player career identity');
  const coachNpc=state.npcs[headCoach!.npcId]!;coachNpc.careerId='unrelated-standard-job';const coachProjection=npcCareerProjection(state,coachNpc);
  verify(coachProjection.specialCareer?.kind==='combat'&&coachProjection.career.includes(world!.name)&&coachProjection.career.includes('Combat Coach'),'14 an active combat-world role must override an unrelated autonomous standard job on the NPC profile');
  verify(coachProjection.annualIncome>0&&Number.isFinite(coachProjection.annualIncome),'15 combat-world NPC occupation projection must expose a finite positive estimated income');
  verify(!trainCombatCareer(state).success&&combatCareerWorlds(state).length===1,'16 the existing action economy must block same-age training spam without duplicating the world');

  const fightRngBefore=state.rngCounter;const firstFightCount=Number(track(state).fights??0);const firstFight=takeCombatFight(state,100);const opponentId=String(track(state).lastOpponentNpcId??'');
  verify(Number(track(state).fights)===firstFightCount+1&&Boolean(opponentId),'17 an executed fight must advance the combat record and bind an exact opponent even when the simulated result is a loss');
  verify(activeGroupIds(state,world!,'rivals').includes(opponentId),'18 the exact fight opponent must come from the persistent rival roster rather than anonymous RNG');
  verify(track(state).lastFightWorldId===world!.id&&Number(track(state).lastFightAge)===state.character.age,'19 the combat track must retain the exact world and age of the latest fight');
  verify(['win','loss'].includes(String(track(state).lastFightResult)),'20 the latest fight result must persist as a bounded career marker');
  verify(state.timeline.at(-1)?.npcIds?.[0]===opponentId&&state.timeline.at(-1)?.text.includes(`${state.npcs[opponentId]!.firstName} ${state.npcs[opponentId]!.lastName}`),'21 the career timeline must name and link the exact persistent opponent');
  verify(state.npcs[opponentId]!.memories.some(memory=>memory.kind==='combat_bout'),'22 the exact rival must remember the shared bout through normal NPC memory');
  verify(state.rngCounter>fightRngBefore,'23 fight outcome randomness must consume the authoritative core RNG stream');
  verify(firstFight.stateChanges?.includes('combatCareer')===true,'24 executed fight outcomes must report their combat-career mutation even when success represents win/loss');
  takeCombatFight(state,50);const fightsAfterTwo=Number(track(state).fights);const third=takeCombatFight(state,50);
  verify(fightsAfterTwo===firstFightCount+2&&!third.success&&Number(track(state).fights)===fightsAfterTwo,'25 no more than two major combat bouts may be executed in one age');

  const annual=adultFixture('combat-world-annual');trainCombatCareer(annual);const annualWorld=activeCombatCareerWorld(annual)!;const annualCareer=track(annual);const annualRng=annual.rngCounter;
  annual.character.age+=1;annual.currentYear+=1;processCombatCareerYear(annual);
  verify(annual.rngCounter===annualRng,'26 annual combat-world simulation must use a dedicated deterministic substream without consuming core RNG');
  verify(Number(annualCareer.lastCombatWorldProcessAge)===annual.character.age,'27 annual combat-world processing must persist an idempotence marker for the current age');
  verify(finiteBounded(annualCareer.worldPrestige)&&finiteBounded(annualCareer.coachSupport)&&finiteBounded(annualCareer.gymChemistry)&&finiteBounded(annualCareer.rivalryTemperature)&&finiteBounded(annualCareer.careerMomentum),'28 combat ecosystem projections must remain finite and bounded');
  const memberCountAfterAnnual=annualWorld.members.length;processCombatCareerYear(annual);
  verify(annualWorld.members.length===memberCountAfterAnnual&&annual.rngCounter===annualRng,'29 same-age annual processing must be idempotent and cannot reroll roster growth');

  const replace=adultFixture('combat-world-replacement');trainCombatCareer(replace);const replaceWorld=activeCombatCareerWorld(replace)!;const deadRival=activeGroupIds(replace,replaceWorld,'rivals')[0]!;replace.npcs[deadRival]!.alive=false;replace.character.age+=1;replace.currentYear+=1;processCombatCareerYear(replace);
  verify(replaceWorld.members.find(member=>member.npcId===deadRival)?.leftAge===replace.character.age,'30 a dead persistent rival must be marked as having left the active combat roster');
  verify(activeGroupIds(replace,replaceWorld,'rivals').length>=2&&activeGroupIds(replace,replaceWorld,'rivals').length<=4,'31 annual processing must replenish the rival roster only to its bounded minimum/maximum range');
  verify(!activeGroupIds(replace,replaceWorld,'rivals').includes(deadRival),'32 a deceased rival must never remain an eligible active opponent');

  const coachReplace=adultFixture('combat-world-coach-replacement');trainCombatCareer(coachReplace);const coachWorld=activeCombatCareerWorld(coachReplace)!;const originalLeader=coachWorld.members.find(member=>member.role==='leader'&&member.leftAge===undefined)!;coachReplace.npcs[originalLeader.npcId]!.alive=false;coachReplace.character.age+=1;coachReplace.currentYear+=1;processCombatCareerYear(coachReplace);const replacementLeader=coachWorld.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&coachReplace.npcs[member.npcId]?.alive);
  verify(Boolean(replacementLeader)&&replacementLeader!.npcId!==originalLeader.npcId,'33 a lost head coach must be replaced by a new exact living leader instead of leaving a phantom authority');
  verify(coachReplace.relationships.find(rel=>rel.npcId===replacementLeader!.npcId)?.type==='coach','34 a replacement head coach must enter the ordinary relationship graph with the correct role');

  const view=combatCareerWorldView(annual,annualWorld)!;
  verify(Boolean(view.coachNpcId)&&view.rivalNpcIds.length>=2&&view.trainingNpcIds.length>=3,'35 the read-only combat world projection must expose exact coach, rival, and training-partner ids');
  const snapshot=JSON.stringify(annual);combatCareerWorldView(annual,annualWorld);
  verify(JSON.stringify(annual)===snapshot,'36 observing combat Career World state must never mutate simulation state');

  const exit=adultFixture('combat-world-exit');trainCombatCareer(exit);const exitWorld=activeCombatCareerWorld(exit)!;const preservedNpcId=exitWorld.members[0]!.npcId;const relationshipCount=exit.relationships.length;const left=leaveSpecialCareer(exit,'combat');
  verify(left.success&&track(exit).leftPath===true&&track(exit).active===false,'37 Leave Path must use the existing special-career lifecycle and mark combat inactive');
  verify(!exitWorld.active&&exitWorld.endedAge===exit.character.age&&exitWorld.members.every(member=>member.leftAge===exit.character.age),'38 leaving combat sports must archive the active gym/circuit world and all current affiliations');
  verify(exit.relationships.length===relationshipCount&&Boolean(exit.npcs[preservedNpcId]),'39 leaving the path must preserve every persistent person and relationship rather than deleting history');
  verify(relationshipsForFolder(exit,'career').some(rel=>rel.npcId===preservedNpcId),'40 archived combat contacts must remain visible in People → Career Worlds history');
  const archivedProjection=npcCareerProjection(exit,exit.npcs[preservedNpcId]!);
  verify(archivedProjection.specialCareer===undefined,'41 an archived combat affiliation must stop overriding that NPC’s current autonomous occupation');

  const sourceBefore=JSON.stringify(exit);exit.character.age+=1;exit.currentYear+=1;const returnSource=JSON.stringify(exit);
  await withEverthreadAiTestbench({state:exit,screen:'career'},async bench=>{
    const actions=bench.availableActions('career');const trainAction=actions.find(action=>action.id==='career.combat.train');const fightAction=actions.find(action=>action.id==='career.combat.fight');
    verify(trainAction?.enabled===true,'42 the AI testbench must expose a real enabled combat-training action when lifecycle re-entry is legal');
    verify(fightAction?.enabled===false,'43 the AI testbench must expose the combat fight action as disabled before the path has been reactivated');
    const trainedStep=bench.execute('career.combat.train');
    verify(trainedStep.result.success&&trainedStep.invariantIssues.length===0,'44 AI semantic combat training must execute the real GameEngine path with zero invariant failures');
    const benchWorlds=bench.getState().socialWorlds.filter(item=>item.kind==='organization'&&item.id.startsWith('special-combat-'));
    verify(benchWorlds.length===2&&benchWorlds.filter(item=>item.active).length===1&&benchWorlds.filter(item=>!item.active).length===1,'45 a legal return must create one new active combat world while preserving the archived original');
    verify((bench.getState().specialCareers.combat as Track).leftPath===false&&Number((bench.getState().specialCareers.combat as Track).returns)===1,'46 successful GameEngine re-entry must clear Leave Path through the shared lifecycle authority');
    const afterActions=bench.availableActions('career');
    verify(afterActions.find(action=>action.id==='career.combat.train')?.enabled===false&&afterActions.find(action=>action.id==='career.combat.fight')?.enabled===true,'47 testbench availability must reuse real action/lifecycle gates after training is consumed and fighting becomes available');
    const beforeFights=Number((bench.getState().specialCareers.combat as Track).fights??0);const fightStep=bench.execute({id:'career.combat.fight',args:{score:75}});const benchOpponent=String((bench.getState().specialCareers.combat as Track).lastOpponentNpcId??'');
    verify(Number((bench.getState().specialCareers.combat as Track).fights)===beforeFights+1&&fightStep.invariantIssues.length===0&&Boolean(benchOpponent),'48 AI semantic fighting must execute a real bout, bind an exact rival, and preserve invariants regardless of win/loss');
    verify(bench.getState().timeline.at(-1)?.npcIds?.[0]===benchOpponent&&bench.getState().npcs[benchOpponent]?.memories.some(memory=>memory.kind==='combat_bout'),'49 AI interaction inspection must see the same exact opponent in timeline and NPC memory');
  });
  verify(JSON.stringify(exit)===returnSource&&sourceBefore!==returnSource,'50 the isolated AI combat scenario must not mutate the caller-owned player fixture');

  const noDup=adultFixture('combat-world-no-duplicate');ensureCombatCareerWorld(noDup,{announce:false});ensureCombatCareerWorld(noDup,{announce:false});
  verify(combatCareerWorlds(noDup).length===1&&activeCombatCareerWorld(noDup)===combatCareerWorlds(noDup)[0],'51 repeated world assurance must reuse the active combat organization instead of creating duplicates');

  return checks;
}
