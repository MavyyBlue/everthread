import type { CompletedLife, GameState } from '../types/game';
import { netWorth } from './FinanceSystem';

export interface FeaturedLife {
  slotId: string;
  lifeId?: string;
  name: string;
  generation: number;
  age: number;
  completed: boolean;
  netWorth: number;
  fame: number;
  score: number;
  career?: string;
  yearsSimulated: number;
  peakFamilyWealth: number;
  completedLives: number;
  legacyRewards: number;
}

export interface ArchivedLife {
  slotId: string;
  lineageName: string;
  generation: number;
  life: CompletedLife;
}

function primaryStatAverage(life: { character: GameState['character'] }) {
  const stats=life.character.stats;
  return (stats.health+stats.happiness+stats.intelligence+stats.appearance)/4;
}

function legacyScore(input:{age:number;netWorth:number;fame:number;children:number;milestones:number;career?:string;character:GameState['character']}) {
  const wealthScore=Math.log10(Math.max(0,input.netWorth)+1)*12;
  const score=input.age*.8+primaryStatAverage(input)*.45+wealthScore+input.fame*.5+input.children*1.5+input.milestones*2+(input.career?4:0);
  return Math.max(0,Math.round(score));
}

function completedGeneration(state:GameState,life:CompletedLife,index:number){
  return Math.max(1,Math.floor(life.generation??index+1));
}

export function archivedLives(states:GameState[]):ArchivedLife[]{
  const rows:ArchivedLife[]=[];
  for(const state of states){
    state.completedLives.forEach((life,index)=>rows.push({slotId:state.slotId,lineageName:`${state.character.firstName} ${state.character.lastName}`,generation:completedGeneration(state,life,index),life}));
  }
  return rows.sort((a,b)=>{
    const aYear=a.life.timeline.at(-1)?.year??0;const bYear=b.life.timeline.at(-1)?.year??0;
    return bYear-aYear||b.generation-a.generation||b.life.ageAtDeath-a.life.ageAtDeath;
  });
}

export function featuredLife(states:GameState[]):FeaturedLife|undefined{
  const candidates:FeaturedLife[]=[];
  for(const state of states){
    const currentChildren=state.relationships.filter(rel=>rel.type==='child').length;
    const currentMilestones=state.timeline.filter(entry=>entry.importance===3).length;
    const currentCareer=state.employment.current?.title??state.employment.history.at(-1)?.title;
    const currentWorth=netWorth(state);
    const currentAlreadyArchived=!state.character.alive&&state.completedLives.some(life=>life.character.id===state.character.id);
    if(!currentAlreadyArchived)candidates.push({
      slotId:state.slotId,name:`${state.character.firstName} ${state.character.lastName}`,generation:state.legacy.generation,age:state.character.age,completed:false,
      netWorth:currentWorth,fame:state.fame.fame,score:legacyScore({age:state.character.age,netWorth:currentWorth,fame:state.fame.fame,children:currentChildren,milestones:currentMilestones,career:currentCareer,character:state.character}),career:currentCareer,
      yearsSimulated:state.legacy.totalYearsSimulated,peakFamilyWealth:state.legacy.totalFamilyWealth,completedLives:state.completedLives.length,legacyRewards:state.legacy.accountCollectibleIds.length,
    });
    state.completedLives.forEach((life,index)=>{
      candidates.push({
        slotId:state.slotId,lifeId:life.id,name:`${life.character.firstName} ${life.character.lastName}`,generation:completedGeneration(state,life,index),age:life.ageAtDeath,completed:true,
        netWorth:life.netWorth,fame:life.fame,score:legacyScore({age:life.ageAtDeath,netWorth:life.netWorth,fame:life.fame,children:life.children,milestones:life.milestones.length,career:life.career,character:life.character}),career:life.career,
        yearsSimulated:state.legacy.totalYearsSimulated,peakFamilyWealth:state.legacy.totalFamilyWealth,completedLives:state.completedLives.length,legacyRewards:state.legacy.accountCollectibleIds.length,
      });
    });
  }
  return candidates.sort((a,b)=>b.score-a.score||b.generation-a.generation||b.age-a.age)[0];
}
