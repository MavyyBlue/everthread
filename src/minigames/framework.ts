import type { GameState } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';

export type MiniGameKind='driving'|'flight'|'prison_escape'|'deployment'|'combat'|'racing'|'acting'|'sports';
export interface MiniGameResult{score:number;success:boolean;summary:string;}
export interface MiniGameDefinition{kind:MiniGameKind;title:string;instructions:string;target:number;durationSeconds:number;}
export const miniGames:Record<MiniGameKind,MiniGameDefinition>={
  driving:{kind:'driving',title:'Road Sense',instructions:'Tap the safe response as road situations appear. Keyboard: 1–3.',target:58,durationSeconds:30},
  flight:{kind:'flight',title:'Instrument Rhythm',instructions:'Match the indicated control sequence. Keyboard: arrow keys.',target:72,durationSeconds:35},
  prison_escape:{kind:'prison_escape',title:'Route Break',instructions:'Build a route across a procedural grid while avoiding alert tiles. Keyboard: arrows or WASD.',target:68,durationSeconds:40},
  deployment:{kind:'deployment',title:'Field Decisions',instructions:'Choose safe abstract responses to changing mission conditions. No real-world tactics are simulated.',target:64,durationSeconds:35},
  combat:{kind:'combat',title:'Three-Beat Fight',instructions:'Time attack, guard, and movement beats. This is an abstract arcade skill check.',target:60,durationSeconds:30},
  racing:{kind:'racing',title:'Apex Pulse',instructions:'Tap inside timing windows to maintain pace through fictional corners.',target:62,durationSeconds:35},
  acting:{kind:'acting',title:'Scene Focus',instructions:'Match emotional prompts to pacing cues.',target:58,durationSeconds:30},
  sports:{kind:'sports',title:'Clutch Sequence',instructions:'Complete a short timing sequence representing an important sports moment.',target:60,durationSeconds:30},
};

export function skipMiniGame(state:GameState,kind:MiniGameKind,relatedSkill:number):MiniGameResult{const def=miniGames[kind];const rng=createRng(`${state.seed}-minigame-${kind}`,state.rngCounter);const score=clamp(Math.round(relatedSkill*.65+rng.int(10,45)));state.rngCounter=rng.counter();return{score,success:score>=def.target,summary:`Accessibility skip resolved at ${score}/100 using seeded RNG and character skill.`};}
