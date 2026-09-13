import { createRng } from '../core/rng';

export const RACING_TOTAL_RACERS=8;
export const RACING_LANE_COUNT=3;
export const COMBAT_TOTAL_ROUNDS=8;
export const COMBAT_TARGETS=['red','blue','yellow','green'] as const;
export type CombatTarget=typeof COMBAT_TARGETS[number];

function boundedWhole(value:number,max:number){
  if(!Number.isFinite(value))return 0;
  return Math.max(0,Math.min(max,Math.floor(value)));
}

export function racingOpponentLanes(seedKey:string):number[]{
  const rng=createRng(`${seedKey}-racing-dodge`);
  return Array.from({length:RACING_TOTAL_RACERS},()=>rng.int(0,RACING_LANE_COUNT-1));
}

export function racingScore(avoided:number):number{
  return Math.round(boundedWhole(avoided,RACING_TOTAL_RACERS)/RACING_TOTAL_RACERS*100);
}

export function combatTargetSequence(seedKey:string):CombatTarget[]{
  const rng=createRng(`${seedKey}-combat-memory`);
  const result:CombatTarget[]=[];
  while(result.length<COMBAT_TOTAL_ROUNDS){
    const previous=result[result.length-1];
    const candidates=previous?COMBAT_TARGETS.filter(target=>target!==previous):COMBAT_TARGETS;
    result.push(rng.pick(candidates));
  }
  return result;
}

export function combatScore(completedRounds:number):number{
  return Math.round(boundedWhole(completedRounds,COMBAT_TOTAL_ROUNDS)/COMBAT_TOTAL_ROUNDS*100);
}
