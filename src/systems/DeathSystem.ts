import type { CompletedLife, GameState } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { netWorth } from './FinanceSystem';
import { illnessById } from '../data/illnesses';

export function deathProbability(state:GameState){
  const age=state.character.age;const health=state.character.stats.health;
  const ageBase=age<45?.00035:age<60?.0015+(age-45)*.00045:age<75?.009+(age-60)*.0015:age<90?.032+(age-75)*.004:Math.min(.60,.10+(age-90)*.025);
  const healthFactor=health>=75?.55:health>=50?1:health>=25?2.4:5.2;
  const illnessFactor=state.health.conditions.reduce((s,c)=>s+(illnessById[c.illnessId]?.mortalityFactor??0)*(c.severity/100),0);
  const dangerous=(state.specialCareers.combat?.active?0.001:0)+(state.specialCareers.military?.active?0.0015:0)+(state.flags.fugitive?0.0025:0);
  return clamp((ageBase*healthFactor+illnessFactor+dangerous)*100,0,82)/100;
}

function determineCause(state:GameState,rng:ReturnType<typeof createRng>){
  const severe=[...state.health.conditions].sort((a,b)=>b.severity-a.severity)[0];
  if(severe&&severe.severity>58&&rng.chance(.62))return `complications related to ${severe.name}`;
  if(state.character.age>=82&&rng.chance(.7))return 'old age';
  if(state.flags.fugitive&&rng.chance(.35))return 'an incident while living as a fugitive';
  if(state.specialCareers.combat?.active&&rng.chance(.18))return 'complications from accumulated sports injuries';
  const causes=['a sudden illness','an unexpected accident','natural causes','a brief final illness'];return rng.pick(causes);
}

function epitaph(state:GameState,cause:string){const nw=netWorth(state);const children=state.relationships.filter(r=>r.type==='child').length;const career=state.employment.current?.title??state.employment.history.at(-1)?.title;const options=[
  `${state.character.firstName} kept turning pages until the book finally closed.`,
  `${state.character.firstName} left behind ${children?`${children} child${children===1?'':'ren'}, `:''}${nw>1000000?'a formidable estate, ':''}and enough stories to argue about for years.`,
  `${state.character.firstName}${career?`, once a ${career},`:''} discovered that no life goes exactly to plan—and made a life of it anyway.`,
  `${state.character.firstName}'s final chapter ended with ${cause}. The footnotes are considerably stranger.`,
];return options[Math.abs(state.rngCounter)%options.length]!;}

export function checkDeath(state:GameState,force=false):boolean {
  if(!state.character.alive)return true;const rng=createRng(`${state.seed}-death`,state.rngCounter);const chance=deathProbability(state);if(!force&&!rng.chance(chance)){state.rngCounter=rng.counter();return false;}
  const cause=determineCause(state,rng);state.character.alive=false;state.character.causeOfDeath=cause;const value=netWorth(state);const children=state.relationships.filter(r=>r.type==='child').length;const spouseRel=state.relationships.find(r=>r.type==='spouse');const spouse=spouseRel?state.npcs[spouseRel.npcId]:undefined;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'death',importance:3,text:`You died at age ${state.character.age} from ${cause}.`});
  const milestones=state.timeline.filter(t=>t.importance===3).slice(-12).map(t=>t.text);const life:CompletedLife={id:makeStateId(state,'life'),character:structuredClone(state.character),ageAtDeath:state.character.age,cause,netWorth:value,career:state.employment.current?.title??state.employment.history.at(-1)?.title,spouse:spouse?`${spouse.firstName} ${spouse.lastName}`:undefined,children,fame:state.fame.fame,milestones,epitaph:epitaph(state,cause),timeline:structuredClone(state.timeline)};
  state.completedLives.push(life);state.legacy.completedLifeIds.push(life.id);state.rngCounter=rng.counter();return true;
}
