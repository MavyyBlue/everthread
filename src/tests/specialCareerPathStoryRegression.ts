import { specialCareerPathStoryEvents, specialCareerStoryEventById, specialCareerStoryEvents } from '../data/specialCareerStoryEvents';
import { createNewGame } from '../systems/CharacterSystem';
import { processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import { ensureSpecialCareerRelationships } from '../systems/SpecialCareerRelationshipSystem';
import {
  processSpecialCareerStoriesYear,
  queueSpecialCareerStoryStart,
  specialCareerPathStoryStartCandidates,
  type SpecialCareerPathStoryArc,
} from '../systems/SpecialCareerStorySystem';
import { archiveSpecialCareerWorld, ensureSpecialCareerWorld, type SpecialCareerWorldKind } from '../systems/SpecialCareerWorldSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';
import type { GameState, SocialWorld } from '../types/game';

type PathCase = {
  kind: SpecialCareerWorldKind;
  arc: SpecialCareerPathStoryArc;
  group: string;
  opening: string;
  openingChoice: string;
  follow: string;
  followChoice: string;
  followYears: number;
};

const PATH_CASES: PathCase[] = [
  {kind:'acting',arc:'acting_reunion',group:':cast',opening:'special_career_acting_reunion_opening',openingChoice:'reconnect',follow:'special_career_acting_reunion_followthrough',followChoice:'read_together',followYears:1},
  {kind:'music',arc:'music_reconnection',group:':management',opening:'special_career_music_reconnection_opening',openingChoice:'lean_in',follow:'special_career_music_reconnection_followthrough',followChoice:'revisit',followYears:1},
  {kind:'sports',arc:'sports_legacy',group:':coaching',opening:'special_career_sports_legacy_opening',openingChoice:'meet',follow:'special_career_sports_legacy_followthrough',followChoice:'share',followYears:1},
  {kind:'modeling',arc:'modeling_reunion',group:':agency',opening:'special_career_modeling_reunion_opening',openingChoice:'meet',follow:'special_career_modeling_reunion_followthrough',followChoice:'return_room',followYears:1},
  {kind:'racing',arc:'racing_reunion',group:':engineering',opening:'special_career_racing_reunion_opening',openingChoice:'compare_notes',follow:'special_career_racing_reunion_followthrough',followChoice:'use_insight',followYears:1},
  {kind:'directing',arc:'directing_reunion',group:':department_heads',opening:'special_career_directing_reunion_opening',openingChoice:'reconnect',follow:'special_career_directing_reunion_followthrough',followChoice:'develop',followYears:1},
];

function careerEvidence(kind:SpecialCareerWorldKind):Record<string,number|string|boolean>{
  if(kind==='acting')return{active:false,retired:true,retirementAge:32,credits:5,projectsCompleted:3,skill:78,reputation:65};
  if(kind==='music')return{active:false,retired:true,retirementAge:32,professionalStartAge:23,songsReleased:4,albumsReleased:2,skill:80,reputation:67,fanbase:18000};
  if(kind==='sports')return{active:false,retired:true,retirementAge:32,pro:false,proContracts:2,seasonsPlayed:6,sport:'Basketball',skill:82,reputation:70};
  if(kind==='modeling')return{active:false,retired:true,retirementAge:32,jobs:8,campaignsCompleted:5,technique:81,reputation:69};
  if(kind==='racing')return{active:false,retired:true,retirementAge:32,racingPathway:false,contractsSigned:2,seasons:6,skill:83,reputation:71};
  return{active:false,retired:true,retirementAge:32,filmsDirected:4,projectsCompleted:4,skill:80,reputation:68};
}

function pathFixture(testCase:PathCase,seed:string){
  const state=createNewGame({seed});state.character.age=30;state.currentYear=2070;state.education=[];
  state.specialCareers[testCase.kind]=careerEvidence(testCase.kind);
  const world=ensureSpecialCareerWorld(state,testCase.kind,`history-${testCase.kind}`,{announce:false});ensureSpecialCareerRelationships(state,world);
  for(const member of world.members){const rel=state.relationships.find(item=>item.npcId===member.npcId);if(rel)rel.score=20;const npc=state.npcs[member.npcId];if(npc)npc.hiddenOpinion=-10;}
  const group=world.groups.find(item=>item.kind.includes(testCase.group));if(!group?.memberNpcIds.length)throw new Error(`Fixture ${testCase.kind} has no ${testCase.group} group member.`);
  const targetId=group.memberNpcIds[0]!;const targetRel=state.relationships.find(item=>item.npcId===targetId)!;targetRel.score=88;targetRel.compatibility=84;state.npcs[targetId]!.hiddenOpinion=72;
  archiveSpecialCareerWorld(world,31);state.character.age=34;state.currentYear=2074;
  return{state,world,targetId,targetRel};
}

function setPending(state:GameState,pending:ReturnType<typeof processDelayedEvents>){if(pending)state.pendingEvent=pending;return pending;}
function careerTrack(state:GameState,kind:SpecialCareerWorldKind){return state.specialCareers[kind] as Record<string,number|string|boolean>;}
function worldStillArchived(world:SocialWorld){return !world.active&&typeof world.endedAge==='number'&&world.members.every(member=>member.leftAge!==undefined);}

export async function runSpecialCareerPathStoryRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Special-career path-story regression failed: ${message}`);}

  verify(specialCareerPathStoryEvents.length===12,'1 4D8B must define twelve path-specific beats: two for each deep career');
  verify(specialCareerStoryEvents.length===18&&Object.keys(specialCareerStoryEventById).length===18,'2 the dedicated registry must combine six generic and twelve path-specific beats without duplicate ids');

  for(const [index,testCase] of PATH_CASES.entries()){
    const fixture=pathFixture(testCase,`path-story-${testCase.kind}`);const candidates=specialCareerPathStoryStartCandidates(fixture.state);
    verify(candidates.some(candidate=>candidate.arc===testCase.arc&&candidate.kind===testCase.kind&&candidate.worldId===fixture.world.id&&candidate.npcId===fixture.targetId),`${3+index*6} ${testCase.kind} must resurface an exact living collaborator from its own recently archived Career World`);
    const rngBefore=fixture.state.rngCounter;
    verify(queueSpecialCareerStoryStart(fixture.state,testCase.arc,testCase.kind,fixture.world.id,fixture.targetId),`${4+index*6} ${testCase.kind} exact-target path opening must queue through the shared story scheduler`);
    const delayed=fixture.state.delayedEvents.find(event=>event.eventId===testCase.opening);
    verify(delayed?.payload?.npcId===fixture.targetId&&delayed.payload?.storyWorldId===fixture.world.id&&delayed.payload?.storyCareerKind===testCase.kind,`${5+index*6} ${testCase.kind} opening payload must retain exact NPC, archived world, and career lineage`);
    const opening=setPending(fixture.state,processDelayedEvents(fixture.state));
    verify(opening?.eventId===testCase.opening&&opening.payload?.npcId===fixture.targetId,`${6+index*6} ${testCase.kind} opening must surface through the normal delayed-event pipeline with the exact NPC`);
    verify(resolvePendingEvent(fixture.state,testCase.openingChoice).success,`${7+index*6} ${testCase.kind} opening choice must resolve through the ordinary EventSystem`);
    const follow=fixture.state.delayedEvents.find(event=>event.eventId===testCase.follow);
    verify(follow?.dueAge===34+testCase.followYears&&follow.payload?.npcId===fixture.targetId&&worldStillArchived(fixture.world)&&careerTrack(fixture.state,testCase.kind).retired===true&&fixture.state.rngCounter!==rngBefore,`${8+index*6} ${testCase.kind} follow-up must preserve the exact NPC while leaving retirement and the archived Career World untouched`);
  }

  const active=pathFixture(PATH_CASES[0]!,'path-story-active-world');active.world.active=true;active.world.endedAge=undefined;
  verify(!specialCareerPathStoryStartCandidates(active.state).some(candidate=>candidate.worldId===active.world.id),'39 path-specific reunion stories must not use a currently active Career World');

  const justEnded=pathFixture(PATH_CASES[0]!,'path-story-just-ended');justEnded.world.endedAge=justEnded.state.character.age;
  verify(!specialCareerPathStoryStartCandidates(justEnded.state).some(candidate=>candidate.worldId===justEnded.world.id),'40 a just-ended world remains the generic mentor/rival lane and must not simultaneously seed a path reunion');

  const old=pathFixture(PATH_CASES[0]!,'path-story-too-old');old.world.endedAge=old.state.character.age-7;
  verify(!specialCareerPathStoryStartCandidates(old.state).some(candidate=>candidate.worldId===old.world.id),'41 archived acting worlds older than their bounded reunion window must stop generating new openings');

  const dead=pathFixture(PATH_CASES[0]!,'path-story-dead-target');dead.state.npcs[dead.targetId]!.alive=false;
  verify(!specialCareerPathStoryStartCandidates(dead.state).some(candidate=>candidate.worldId===dead.world.id),'42 dead former collaborators must not be replaced by an unrelated NPC just to keep a reunion alive');

  const estranged=pathFixture(PATH_CASES[0]!,'path-story-estranged-target');estranged.targetRel.estranged=true;
  verify(!specialCareerPathStoryStartCandidates(estranged.state).some(candidate=>candidate.worldId===estranged.world.id),'43 estranged former collaborators must be excluded before a new path story starts');

  const mismatch=pathFixture(PATH_CASES[1]!,'path-story-kind-mismatch');
  verify(!queueSpecialCareerStoryStart(mismatch.state,'acting_reunion','music',mismatch.world.id,mismatch.targetId),'44 a path-specific arc cannot be queued against a different career kind');

  const markers=pathFixture(PATH_CASES[0]!,'path-story-markers');const markerRng=markers.state.rngCounter;
  verify(queueSpecialCareerStoryStart(markers.state,'acting_reunion','acting',markers.world.id,markers.targetId),'45 a valid path story must queue before marker validation');
  const markerTrack=careerTrack(markers.state,'acting');
  verify(Number(markerTrack.storyPathLastStartAge)===34&&Number(markerTrack.storyPathArcStarts)===1&&Number(markerTrack.storyArcStarts)===1&&markerTrack.storyPathLastNpcId===markers.targetId&&markerTrack.storyPathLastWorldId===markers.world.id&&markerTrack.storyPathLastArc==='acting_reunion','46 path-story cooldown and lineage markers must stay bounded on the existing career track');
  verify(markers.state.rngCounter===markerRng,'47 direct path-story queueing must not consume the core simulation RNG stream');
  verify(!queueSpecialCareerStoryStart(markers.state,'acting_reunion','acting',markers.world.id,markers.targetId),'48 duplicate path openings for the same exact NPC must be rejected');

  const cooldown=pathFixture(PATH_CASES[0]!,'path-story-cooldown');verify(queueSpecialCareerStoryStart(cooldown.state,'acting_reunion','acting',cooldown.world.id,cooldown.targetId),'49 cooldown fixture must begin with one valid path story');cooldown.state.delayedEvents=[];cooldown.state.character.age=36;cooldown.state.currentYear=2076;
  const allowedIds=new Set(cooldown.world.groups.filter(group=>group.kind.includes(':cast')||group.kind.includes(':crew')).flatMap(group=>group.memberNpcIds));const alternate=cooldown.world.members.find(member=>allowedIds.has(member.npcId)&&member.npcId!==cooldown.targetId);if(alternate){const rel=cooldown.state.relationships.find(item=>item.npcId===alternate.npcId)!;rel.score=92;cooldown.state.npcs[alternate.npcId]!.hiddenOpinion=80;}
  verify(!specialCareerPathStoryStartCandidates(cooldown.state).some(candidate=>candidate.kind==='acting'),'50 one path-specific story start must suppress another in that career during the five-year cooldown even with a different eligible collaborator');

  const continuity=pathFixture(PATH_CASES[0]!,'path-story-continuity');verify(queueSpecialCareerStoryStart(continuity.state,'acting_reunion','acting',continuity.world.id,continuity.targetId),'51 continuity fixture must queue the acting reunion');const opening=setPending(continuity.state,processDelayedEvents(continuity.state));verify(opening?.eventId==='special_career_acting_reunion_opening','52 acting reunion opening must load from the dedicated registry');const fameBefore=continuity.state.fame.fame;const opinionBefore=continuity.state.npcs[continuity.targetId]!.hiddenOpinion;verify(resolvePendingEvent(continuity.state,'reconnect').success,'53 acting reunion opening must resolve normally');const follow=continuity.state.delayedEvents.find(event=>event.eventId==='special_career_acting_reunion_followthrough');verify(follow?.payload?.npcId===continuity.targetId&&follow?.dueAge===35,'54 acting reunion follow-up must preserve the same exact NPC one year later');
  continuity.targetRel.type='friend';continuity.state.character.age=35;continuity.state.currentYear=2075;const followPending=setPending(continuity.state,processDelayedEvents(continuity.state));verify(followPending?.eventId==='special_career_acting_reunion_followthrough'&&followPending.payload?.npcId===continuity.targetId,'55 personal relationship evolution must not erase archived professional continuity');verify(resolvePendingEvent(continuity.state,'read_together').success,'56 path follow-through must resolve through normal event effects');verify(continuity.state.fame.fame===fameBefore+2&&continuity.state.npcs[continuity.targetId]!.hiddenOpinion>opinionBefore&&worldStillArchived(continuity.world)&&careerTrack(continuity.state,'acting').retired===true,'57 path-story consequences may strengthen future-facing systems but must not reactivate retirement or the archived production');

  for(const kind of ['sports','racing'] as const){const testCase=PATH_CASES.find(item=>item.kind===kind)!;const fixture=pathFixture(testCase,`path-story-final-retirement-${kind}`);const candidate=specialCareerPathStoryStartCandidates(fixture.state).find(item=>item.kind===kind);verify(Boolean(candidate),`58 ${kind} competitive retirement fixture must still allow relationship-history stories`);if(candidate){queueSpecialCareerStoryStart(fixture.state,candidate.arc,candidate.kind,candidate.worldId,candidate.npcId);const pending=setPending(fixture.state,processDelayedEvents(fixture.state));if(pending)resolvePendingEvent(fixture.state,pending.choices[0]!.id);}verify(careerTrack(fixture.state,kind).retired===true,`59 ${kind} story contact must never undo final competitive retirement`);}

  const scan=pathFixture(PATH_CASES[2]!,'path-story-scan');const scanRng=scan.state.rngCounter;processSpecialCareerStoriesYear(scan.state);const queuedAfter=scan.state.delayedEvents.filter(event=>event.eventId.startsWith('special_career_')).length;processSpecialCareerStoriesYear(scan.state);
  verify(scan.state.rngCounter===scanRng,'62 combined generic/path story scanning must retain its dedicated deterministic RNG substream');
  verify(Number(scan.state.flags.specialCareerStoryScanAge)===scan.state.character.age&&scan.state.delayedEvents.filter(event=>event.eventId.startsWith('special_career_')).length===queuedAfter&&queuedAfter<=1,'63 the combined scanner must remain same-age idempotent and start at most one story per age');

  const ai=pathFixture(PATH_CASES[0]!,'path-story-ai-playthrough');verify(queueSpecialCareerStoryStart(ai.state,'acting_reunion','acting',ai.world.id,ai.targetId),'64 AI playthrough fixture must contain a real queued acting reunion');ai.state.flags.specialCareerStoryScanAge=35;
  await withEverthreadAiTestbench({state:ai.state,screen:'life'},async bench=>{
    const aged=bench.execute('life.age_up');
    verify(aged.result.success&&aged.invariantIssues.length===0,'65 AI testbench must Age Up through the real GameEngine with no invariant failure');
    verify(bench.getState().pendingEvent?.eventId==='special_career_acting_reunion_opening'&&bench.getState().pendingEvent?.payload?.npcId===ai.targetId,'66 the AI-readable player flow must surface the exact archived collaborator event rather than a test-only shortcut');
    const resolved=bench.execute({id:'event.choose',args:{choiceId:'reconnect'}});
    verify(resolved.result.success&&resolved.invariantIssues.length===0,'67 AI semantic event choice must resolve the new path story through GameEngine and normal EventSystem ownership');
    const queued=bench.getState().delayedEvents.find(event=>event.eventId==='special_career_acting_reunion_followthrough');
    verify(queued?.payload?.npcId===ai.targetId&&careerTrack(bench.getState(),'acting').retired===true&&bench.inspectCareer('acting').worlds.every(world=>!world.active),'68 AI playthrough must preserve exact NPC continuity, creative retirement, and archived Career World state after the choice');
  });

  return checks;
}
