import type { GameState } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';

export type MiniGameKind='driving'|'boating'|'flight'|'prison_escape'|'deployment'|'combat'|'racing'|'acting'|'sports';
export type MiniGameMechanic='timing'|'sequence'|'grid_memory'|'decision';
export interface MiniGameResult{score:number;success:boolean;summary:string;}
export interface MiniGameDefinition{kind:MiniGameKind;title:string;instructions:string;target:number;durationSeconds:number;mechanic:MiniGameMechanic;rounds:number;}
export const miniGames:Record<MiniGameKind,MiniGameDefinition>={
  driving:{kind:'driving',title:'Road Sense',instructions:'Choose the safest response as fictional road situations appear.',target:58,durationSeconds:30,mechanic:'decision',rounds:3},
  boating:{kind:'boating',title:'Water Sense',instructions:'Choose conservative safety responses to fictional boating situations.',target:62,durationSeconds:30,mechanic:'decision',rounds:3},
  flight:{kind:'flight',title:'Instrument Rhythm',instructions:'Remember and repeat a short fictional control pattern.',target:72,durationSeconds:35,mechanic:'sequence',rounds:4},
  prison_escape:{kind:'prison_escape',title:'Route Break',instructions:'Memorize an abstract tile route, then repeat it. This does not model real escape tactics.',target:68,durationSeconds:35,mechanic:'grid_memory',rounds:6},
  deployment:{kind:'deployment',title:'Field Decisions',instructions:'Choose safe abstract responses to changing fictional mission conditions. No real-world tactics are simulated.',target:64,durationSeconds:35,mechanic:'decision',rounds:3},
  combat:{kind:'combat',title:'Three-Beat Fight',instructions:'Tap during the highlighted timing window across five abstract fight beats.',target:60,durationSeconds:30,mechanic:'timing',rounds:5},
  racing:{kind:'racing',title:'Apex Pulse',instructions:'Tap inside changing timing windows to maintain pace through fictional corners.',target:62,durationSeconds:35,mechanic:'timing',rounds:5},
  acting:{kind:'acting',title:'Scene Focus',instructions:'Remember the pacing cues, then perform them in the same order.',target:58,durationSeconds:30,mechanic:'sequence',rounds:4},
  sports:{kind:'sports',title:'Clutch Sequence',instructions:'Hit a series of timing windows representing an important fictional sports moment.',target:60,durationSeconds:30,mechanic:'timing',rounds:5},
};

function specialNumber(state:GameState,key:keyof GameState['specialCareers'],field:string){const raw=state.specialCareers[key]?.[field];return typeof raw==='number'?raw:0;}

export function relatedMiniGameSkill(state:GameState,kind:MiniGameKind):number{
  switch(kind){
    case 'acting': return clamp(Math.max(state.character.talents.acting,specialNumber(state,'acting','skill'))*.7+state.character.secondary.creativity*.3);
    case 'sports': return clamp(Math.max(state.character.talents.athletics,specialNumber(state,'sports','skill'))*.65+state.health.fitness*.35);
    case 'combat': return clamp(state.character.talents.combat*.45+state.character.secondary.athleticism*.3+specialNumber(state,'combat','fightIQ')*.25);
    case 'racing': return clamp(Math.max(state.character.secondary.athleticism,specialNumber(state,'racing','skill'))*.75+state.character.secondary.discipline*.25);
    case 'prison_escape': return clamp(state.character.talents.crime*.55+state.character.secondary.athleticism*.3+state.character.secondary.willpower*.15);
    case 'driving': return clamp(state.character.secondary.discipline*.55+state.character.stats.intelligence*.45);
    case 'boating': return clamp(state.character.secondary.discipline*.5+state.character.stats.intelligence*.4+state.character.secondary.willpower*.1);
    case 'flight': return clamp(state.character.secondary.discipline*.45+state.character.stats.intelligence*.55);
    case 'deployment': return clamp(state.character.secondary.discipline*.4+state.character.secondary.willpower*.25+state.character.stats.intelligence*.35);
  }
}

export function skipMiniGame(state:GameState,kind:MiniGameKind,relatedSkill=relatedMiniGameSkill(state,kind)):MiniGameResult{
  const def=miniGames[kind];
  const rng=createRng(`${state.seed}-minigame-${kind}-${state.character.age}-${state.rngCounter}`);
  const score=clamp(Math.round(relatedSkill*.68+rng.int(8,40)));
  return{score,success:score>=def.target,summary:`Challenge resolved at ${score}/100 using seeded RNG and character skill.`};
}
