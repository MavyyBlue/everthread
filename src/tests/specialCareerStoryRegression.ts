import { createNewGame } from '../systems/CharacterSystem';
import { processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import { ensureSpecialCareerRelationships } from '../systems/SpecialCareerRelationshipSystem';
import { specialCareerInfluenceView } from '../systems/SpecialCareerInfluenceSystem';
import {
  processSpecialCareerStoriesYear,
  queueSpecialCareerStoryStart,
  specialCareerStoryStartCandidates,
} from '../systems/SpecialCareerStorySystem';
import { archiveSpecialCareerWorld, ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { specialCareerStoryEventById, specialCareerStoryEvents } from '../data/specialCareerStoryEvents';
import type { GameState } from '../types/game';

function modelingFixture(seed:string){
  const state=createNewGame({seed});state.character.age=28;state.currentYear=2068;state.education=[];
  state.specialCareers.modeling={active:true,jobs:7,technique:78,reputation:65};
  const world=ensureSpecialCareerWorld(state,'modeling','agency',{announce:false});ensureSpecialCareerRelationships(state,world);
  let influence=specialCareerInfluenceView(state,world,'modeling');
  const leaderId=influence.leaderNpcId!;const leader=state.npcs[leaderId]!;const leaderRel=state.relationships.find(rel=>rel.npcId===leaderId)!;
  leaderRel.score=94;leaderRel.compatibility=92;leader.hiddenOpinion=85;
  influence=specialCareerInfluenceView(state,world,'modeling');
  const rivalId=influence.rivalNpcId!;const rival=state.npcs[rivalId]!;const rivalRel=state.relationships.find(rel=>rel.npcId===rivalId)!;
  rivalRel.score=16;rival.hiddenOpinion=-82;
  return{state,world,leaderId,rivalId,leaderRel,rivalRel};
}

function setPending(state:GameState,pending:ReturnType<typeof processDelayedEvents>){if(pending)state.pendingEvent=pending;return pending;}

export function runSpecialCareerStoryRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Special-career story regression failed: ${message}`);}

  verify(specialCareerStoryEvents.length===6,'1 the 4D8A content slice must define six explicit chain beats');
  verify(Object.keys(specialCareerStoryEventById).length===6,'2 story event ids must remain unique in the dedicated delayed-event registry');

  const mentor=modelingFixture('story-mentor-chain');const mentorRng=mentor.state.rngCounter;const mentorScore=mentor.leaderRel.score;
  verify(queueSpecialCareerStoryStart(mentor.state,'mentor','modeling',mentor.world.id,mentor.leaderId),'3 a real Career World leader must be queueable as an exact mentor-story target');
  verify(mentor.state.rngCounter===mentorRng,'4 queuing a story opening must not consume the core simulation RNG stream');
  const openingDelay=mentor.state.delayedEvents.find(event=>event.eventId==='special_career_mentor_opening');
  verify(openingDelay?.dueAge===28&&openingDelay.payload?.npcId===mentor.leaderId,'5 the opening must target the exact leader and become due in the current Age Up');
  verify(Array.isArray(openingDelay?.payload?.requiredRelationshipTypes),'6 opening payload must require a living persisted relationship so backlogged stories can cancel safely');
  verify(!queueSpecialCareerStoryStart(mentor.state,'mentor','modeling',mentor.world.id,mentor.leaderId),'7 the same mentor opening cannot be queued twice for the same NPC');
  verify(Number(mentor.state.specialCareers.modeling?.storyArcStarts??0)===1&&Number(mentor.state.specialCareers.modeling?.storyMentorLastStartAge??-1)===28,'8 story starts and mentor cooldown age must persist on the existing career track');

  const opening=setPending(mentor.state,processDelayedEvents(mentor.state));
  verify(opening?.eventId==='special_career_mentor_opening','9 the standard delayed-event pipeline must load dedicated special-career story definitions');
  verify(opening?.description.includes(`${mentor.state.npcs[mentor.leaderId]!.firstName} ${mentor.state.npcs[mentor.leaderId]!.lastName}`),'10 the opening copy must render the exact persistent NPC name');
  verify(resolvePendingEvent(mentor.state,'accept').success,'11 accepting mentor guidance must resolve through the normal event-choice engine');
  verify(mentor.leaderRel.score===mentorScore+7,'12 mentor choices must feed the existing Relationship/hidden-opinion systems rather than a parallel professional graph');
  const mentorFollow=mentor.state.delayedEvents.find(event=>event.eventId==='special_career_mentor_followthrough');
  verify(mentorFollow?.dueAge===30&&mentorFollow.payload?.npcId===mentor.leaderId,'13 the mentor follow-up must preserve the exact NPC two years later');

  mentor.leaderRel.type='friend';mentor.state.character.age=30;mentor.state.currentYear=2070;
  const follow=setPending(mentor.state,processDelayedEvents(mentor.state));
  verify(follow?.eventId==='special_career_mentor_followthrough','14 an evolving personal relationship type must not erase the underlying career-story continuity');
  const fameBefore=mentor.state.fame.fame;const publicRepBefore=mentor.state.fame.publicReputation;
  verify(resolvePendingEvent(mentor.state,'take_intro').success,'15 the second mentor beat must resolve normally');
  verify(mentor.state.fame.fame===fameBefore+2&&mentor.state.fame.publicReputation===publicRepBefore+3,'16 accepting the introduction must create bounded public-career consequences');
  const mentorLegacy=mentor.state.delayedEvents.find(event=>event.eventId==='special_career_mentor_legacy');
  verify(mentorLegacy?.dueAge===32&&mentorLegacy.payload?.npcId===mentor.leaderId,'17 the third mentor beat must remain bound to the same person');

  archiveSpecialCareerWorld(mentor.world,30);mentor.state.character.age=32;mentor.state.currentYear=2072;
  const legacy=setPending(mentor.state,processDelayedEvents(mentor.state));
  verify(legacy?.eventId==='special_career_mentor_legacy','18 mentor history may resurface after the original Career World is archived');
  verify(resolvePendingEvent(mentor.state,'thank').success,'19 the final mentor beat must close without requiring the old world to reactivate');
  verify(mentor.state.timeline.at(-1)?.npcIds?.[0]===mentor.leaderId,'20 resolved career-story timeline history must retain the exact NPC reference');
  verify(!mentor.world.active,'21 completing a story follow-up must not resurrect an archived Career World');

  const rivalry=modelingFixture('story-rival-chain');
  verify(queueSpecialCareerStoryStart(rivalry.state,'rivalry','modeling',rivalry.world.id,rivalry.rivalId),'22 a real Career World rival must be queueable as an exact rivalry-story target');
  const rivalOpening=setPending(rivalry.state,processDelayedEvents(rivalry.state));verify(rivalOpening?.eventId==='special_career_rival_opening','23 the rivalry opening must surface through the delayed-event pipeline');
  verify(resolvePendingEvent(rivalry.state,'deescalate').success,'24 a rivalry choice must be able to schedule a later reckoning');
  const rivalFollow=rivalry.state.delayedEvents.find(event=>event.eventId==='special_career_rival_followthrough');
  verify(rivalFollow?.dueAge===29&&rivalFollow.payload?.npcId===rivalry.rivalId,'25 the rivalry follow-up must preserve the exact rival one year later');
  rivalry.state.npcs[rivalry.rivalId]!.alive=false;rivalry.state.character.age=29;rivalry.state.currentYear=2069;
  verify(processDelayedEvents(rivalry.state)===undefined,'26 a delayed career story must cancel cleanly if its exact NPC dies before the follow-up');
  verify(!rivalry.state.delayedEvents.some(event=>event.eventId==='special_career_rival_followthrough'),'27 cancelled dead-NPC story beats must be removed instead of retrying forever');

  const candidates=modelingFixture('story-candidates');
  const candidateList=specialCareerStoryStartCandidates(candidates.state);
  verify(candidateList.some(candidate=>candidate.arc==='mentor'&&candidate.npcId===candidates.leaderId),'28 strong real leader support must create a mentor-story candidate');
  verify(candidateList.some(candidate=>candidate.arc==='rivalry'&&candidate.npcId===candidates.rivalId),'29 a hot real rivalry must create a rivalry-story candidate');
  candidates.leaderRel.estranged=true;
  verify(!specialCareerStoryStartCandidates(candidates.state).some(candidate=>candidate.arc==='mentor'&&candidate.npcId===candidates.leaderId),'30 estranged targets must be excluded before a new career story begins');

  const ended=createNewGame({seed:'story-just-ended'});ended.character.age=31;ended.currentYear=2071;ended.education=[];ended.specialCareers.acting={active:true,credits:5,skill:82,reputation:70};
  const endedWorld=ensureSpecialCareerWorld(ended,'acting','lead',{announce:false});ensureSpecialCareerRelationships(ended,endedWorld);const endedInfluence=specialCareerInfluenceView(ended,endedWorld,'acting');const endedLeader=endedInfluence.leaderNpcId!;const endedLeaderRel=ended.relationships.find(rel=>rel.npcId===endedLeader)!;endedLeaderRel.score=96;endedLeaderRel.compatibility=95;ended.npcs[endedLeader]!.hiddenOpinion=90;archiveSpecialCareerWorld(endedWorld,31);
  verify(specialCareerStoryStartCandidates(ended).some(candidate=>candidate.arc==='mentor'&&candidate.worldId===endedWorld.id),'31 a project that ended this age may still seed a story about the people who just worked on it');
  ended.character.age=32;ended.currentYear=2072;
  verify(!specialCareerStoryStartCandidates(ended).some(candidate=>candidate.worldId===endedWorld.id),'32 older archived worlds must not keep generating fresh story openings forever');

  const scan=modelingFixture('story-scan-idempotence');const scanRng=scan.state.rngCounter;processSpecialCareerStoriesYear(scan.state);const queuedAfterFirst=scan.state.delayedEvents.filter(event=>event.eventId.startsWith('special_career_')).length;processSpecialCareerStoriesYear(scan.state);
  verify(scan.state.rngCounter===scanRng,'33 annual career-story scanning must use its own deterministic substream without perturbing core RNG');
  verify(scan.state.delayedEvents.filter(event=>event.eventId.startsWith('special_career_')).length===queuedAfterFirst,'34 same-age story scanning must be idempotent even when the first scan starts no story');
  verify(Number(scan.state.flags.specialCareerStoryScanAge)===scan.state.character.age,'35 the annual scan age must persist as a bounded primitive for idempotence');
  verify(queuedAfterFirst<=1,'36 one Age Up may start at most one new special-career chain');

  const cap=modelingFixture('story-queue-cap');cap.state.delayedEvents.push({id:'story-cap-1',eventId:'special_career_mentor_followthrough',dueAge:40,payload:{npcId:cap.leaderId}},{id:'story-cap-2',eventId:'special_career_rival_followthrough',dueAge:40,payload:{npcId:cap.rivalId}});const beforeCap=cap.state.delayedEvents.length;processSpecialCareerStoriesYear(cap.state);
  verify(cap.state.delayedEvents.length===beforeCap,'37 two queued career-story beats must suppress new openings instead of flooding the event queue');

  return checks;
}
