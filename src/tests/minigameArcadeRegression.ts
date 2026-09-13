import { miniGames } from '../minigames/framework';
import {
  COMBAT_TARGETS,
  COMBAT_TOTAL_ROUNDS,
  RACING_LANE_COUNT,
  RACING_TOTAL_RACERS,
  combatScore,
  combatTargetSequence,
  racingOpponentLanes,
  racingScore,
} from '../minigames/arcadeChallenges';

function fail(message:string):never{throw new Error(message);}
function check(condition:unknown,message:string){if(!condition)fail(message);}
function equal<T>(actual:T,expected:T,message:string){if(actual!==expected)fail(`${message} (expected ${String(expected)}, got ${String(actual)})`);}

export function runMinigameArcadeRegression(){
  let checks=0;
  const ok=(condition:unknown,message:string)=>{check(condition,message);checks++;};
  const eq=<T>(actual:T,expected:T,message:string)=>{equal(actual,expected,message);checks++;};

  eq(miniGames.racing.mechanic,'racing_dodge','racing did not route to its dedicated dodge mechanic');
  eq(miniGames.racing.rounds,RACING_TOTAL_RACERS,'racing opportunity count drifted from the eight-racer contract');
  eq(miniGames.combat.mechanic,'combat_memory','combat did not route to its dedicated memory mechanic');
  eq(miniGames.combat.rounds,COMBAT_TOTAL_ROUNDS,'combat round count drifted from the eight-sequence contract');

  const racingA=racingOpponentLanes('arcade-regression-seed');
  const racingB=racingOpponentLanes('arcade-regression-seed');
  eq(racingA.length,RACING_TOTAL_RACERS,'racing did not generate exactly eight opponents');
  eq(JSON.stringify(racingA),JSON.stringify(racingB),'racing lane generation was not deterministic');
  ok(racingA.every(lane=>Number.isInteger(lane)&&lane>=0&&lane<RACING_LANE_COUNT),'racing generated an invalid lane');
  eq(racingScore(0),0,'zero avoided racers did not score zero');
  eq(racingScore(5),63,'five avoided racers did not map to the expected normalized score');
  eq(racingScore(8),100,'eight avoided racers did not score 100');
  eq(racingScore(99),100,'racing score did not clamp over-completion');

  const combatA=combatTargetSequence('arcade-regression-seed');
  const combatB=combatTargetSequence('arcade-regression-seed');
  eq(combatA.length,COMBAT_TOTAL_ROUNDS,'combat did not generate exactly eight pattern steps');
  eq(JSON.stringify(combatA),JSON.stringify(combatB),'combat pattern generation was not deterministic');
  ok(combatA.every(target=>COMBAT_TARGETS.includes(target)),'combat generated an unknown target');
  ok(combatA.every((target,index)=>index===0||target!==combatA[index-1]),'combat generated adjacent duplicate flashes');
  eq(combatScore(0),0,'zero completed combat sequences did not score zero');
  eq(combatScore(5),63,'five completed combat sequences did not map to the expected normalized score');
  eq(combatScore(8),100,'all combat sequences did not score 100');
  eq(combatScore(-2),0,'combat score did not clamp negative completion');

  return checks;
}

const checks=runMinigameArcadeRegression();
console.log(`Activity-specific minigame regression: ${checks}/${checks} checks passed.`);
