import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, SocialWorld } from '../types/game';
import { SPECIAL_CAREER_STORY_RELATIONSHIPS } from '../data/specialCareerStoryEvents';
import { specialCareerWorldKind } from './SpecialCareerEcosystemSystem';
import { specialCareerInfluenceView } from './SpecialCareerInfluenceSystem';
import { specialCareerWorlds, type SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;
export type SpecialCareerStoryArc = 'mentor' | 'rivalry';

export interface SpecialCareerStoryCandidate {
  arc: SpecialCareerStoryArc;
  kind: SpecialCareerWorldKind;
  worldId: string;
  npcId: string;
  weight: number;
}

const START_EVENT:Record<SpecialCareerStoryArc,string>={
  mentor:'special_career_mentor_opening',
  rivalry:'special_career_rival_opening',
};
const STORY_PREFIX='special_career_';
const MAX_QUEUED_STORY_EVENTS=2;

function readTrack(state:GameState,kind:SpecialCareerWorldKind){return (state.specialCareers[kind]??{}) as Track;}
function track(state:GameState,kind:SpecialCareerWorldKind){return (state.specialCareers[kind]??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function relation(state:GameState,npcId?:string){return npcId?state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged):undefined;}
function storyEvent(id:string){return id.startsWith(STORY_PREFIX);}
function currentOrJustEnded(state:GameState,world:SocialWorld){return world.active||world.endedAge===state.character.age;}
function queuedForNpc(state:GameState,npcId:string){
  return state.delayedEvents.some(delayed=>storyEvent(delayed.eventId)&&delayed.payload?.npcId===npcId)
    || Boolean(state.pendingEvent&&storyEvent(state.pendingEvent.eventId)&&state.pendingEvent.payload?.npcId===npcId);
}
function cooldownReady(career:Track,key:string,age:number,years:number){return age-n(career,key,-99)>=years;}
function exactWorld(state:GameState,kind:SpecialCareerWorldKind,worldId:string){
  const world=state.socialWorlds.find(item=>item.id===worldId);return world&&specialCareerWorldKind(world)===kind?world:undefined;
}

/**
 * Read-only eligibility projection for new multi-year story openings. A story always starts from
 * a real current/just-completed Career World and an exact persistent NPC. Follow-ups are carried
 * by the existing delayed-event queue, so the same person can resurface years after that world ends.
 */
export function specialCareerStoryStartCandidates(state:GameState):SpecialCareerStoryCandidate[]{
  const candidates:SpecialCareerStoryCandidate[]=[];
  for(const world of specialCareerWorlds(state)){
    if(!currentOrJustEnded(state,world))continue;
    const kind=specialCareerWorldKind(world);if(!kind)continue;
    const career=readTrack(state,kind);const influence=specialCareerInfluenceView(state,world,kind);
    const leaderId=influence.leaderNpcId;const leaderRel=relation(state,leaderId);const leader=leaderId?state.npcs[leaderId]:undefined;
    if(leader?.alive&&leaderRel&&!queuedForNpc(state,leader.id)&&influence.leaderSupport>=68&&leaderRel.score>=60&&cooldownReady(career,'storyMentorLastStartAge',state.character.age,7)){
      const tenure=Math.max(0,state.character.age-world.startedAge);const weight=clamp(.8+(influence.leaderSupport-68)/18+Math.min(2,tenure*.15),.8,5);
      candidates.push({arc:'mentor',kind,worldId:world.id,npcId:leader.id,weight});
    }
    const rivalId=influence.rivalNpcId;const rivalRel=relation(state,rivalId);const rival=rivalId?state.npcs[rivalId]:undefined;
    if(rival?.alive&&rivalRel&&!queuedForNpc(state,rival.id)&&influence.rivalPressure>=58&&rivalRel.score<=48&&cooldownReady(career,'storyRivalryLastStartAge',state.character.age,6)){
      const heat=Math.max(0,48-rivalRel.score);const weight=clamp(.8+(influence.rivalPressure-58)/16+heat/22,.8,5);
      candidates.push({arc:'rivalry',kind,worldId:world.id,npcId:rival.id,weight});
    }
  }
  return candidates.sort((a,b)=>b.weight-a.weight||a.arc.localeCompare(b.arc)||a.kind.localeCompare(b.kind)||a.worldId.localeCompare(b.worldId)||a.npcId.localeCompare(b.npcId));
}

/** Exact, deterministic queue operation shared by annual scanning and regression fixtures. */
export function queueSpecialCareerStoryStart(state:GameState,arc:SpecialCareerStoryArc,kind:SpecialCareerWorldKind,worldId:string,npcId:string){
  const world=exactWorld(state,kind,worldId);const npc=state.npcs[npcId];const rel=relation(state,npcId);if(!world||!npc?.alive||!rel)return false;
  if(!world.members.some(member=>member.npcId===npcId))return false;
  const eventId=START_EVENT[arc];
  if(state.delayedEvents.some(delayed=>delayed.eventId===eventId&&delayed.payload?.npcId===npcId))return false;
  if(state.pendingEvent?.eventId===eventId&&state.pendingEvent.payload?.npcId===npcId)return false;
  const career=track(state,kind);const key=arc==='mentor'?'storyMentorLastStartAge':'storyRivalryLastStartAge';setN(career,key,state.character.age);setN(career,'storyArcStarts',n(career,'storyArcStarts')+1);
  state.delayedEvents.push({
    id:makeStateId(state,'delay'),eventId,dueAge:state.character.age,
    payload:{npcId,originAge:state.character.age,storyArc:arc,storyCareerKind:kind,storyWorldId:world.id,requiredRelationshipTypes:SPECIAL_CAREER_STORY_RELATIONSHIPS},
  });
  return true;
}

/**
 * Annual 4D8A story scan. It uses a deterministic career-story substream rather than consuming
 * the player's core RNG counter, starts at most one new chain per age, and refuses to flood the
 * delayed-event queue while older career stories are still waiting to resolve.
 */
export function processSpecialCareerStoriesYear(state:GameState){
  if(Number(state.flags.specialCareerStoryScanAge??-1)===state.character.age)return;
  state.flags.specialCareerStoryScanAge=state.character.age;
  const queued=state.delayedEvents.filter(delayed=>storyEvent(delayed.eventId)).length;if(queued>=MAX_QUEUED_STORY_EVENTS)return;
  const candidates=specialCareerStoryStartCandidates(state);if(!candidates.length)return;
  const rng=createRng(`${state.seed}-special-career-story-${state.character.age}`);
  const strongest=candidates[0]!.weight;const chance=clamp(.16+candidates.length*.025+strongest*.025,.18,.38);if(!rng.chance(chance))return;
  const chosen=rng.weighted(candidates.map(candidate=>({item:candidate,weight:candidate.weight})));
  queueSpecialCareerStoryStart(state,chosen.arc,chosen.kind,chosen.worldId,chosen.npcId);
}
