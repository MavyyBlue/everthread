import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, SocialWorld, SocialWorldMember } from '../types/game';
import { SPECIAL_CAREER_STORY_RELATIONSHIPS } from '../data/specialCareerStoryEvents';
import { specialCareerWorldKind } from './SpecialCareerEcosystemSystem';
import { specialCareerInfluenceView } from './SpecialCareerInfluenceSystem';
import { specialCareerWorlds, type SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;
export type SpecialCareerStoryArc =
  | 'mentor'
  | 'rivalry'
  | 'acting_reunion'
  | 'music_reconnection'
  | 'sports_legacy'
  | 'modeling_reunion'
  | 'racing_reunion'
  | 'directing_reunion';
export type SpecialCareerPathStoryArc = Exclude<SpecialCareerStoryArc, 'mentor' | 'rivalry'>;

export interface SpecialCareerStoryCandidate {
  arc: SpecialCareerStoryArc;
  kind: SpecialCareerWorldKind;
  worldId: string;
  npcId: string;
  weight: number;
}

type PathStoryConfig = {
  arc: SpecialCareerPathStoryArc;
  lookback: number;
  minRelationship: number;
  groupFragments: string[];
};

const START_EVENT: Record<SpecialCareerStoryArc, string> = {
  mentor: 'special_career_mentor_opening',
  rivalry: 'special_career_rival_opening',
  acting_reunion: 'special_career_acting_reunion_opening',
  music_reconnection: 'special_career_music_reconnection_opening',
  sports_legacy: 'special_career_sports_legacy_opening',
  modeling_reunion: 'special_career_modeling_reunion_opening',
  racing_reunion: 'special_career_racing_reunion_opening',
  directing_reunion: 'special_career_directing_reunion_opening',
};

const PATH_STORY_CONFIG: Record<SpecialCareerWorldKind, PathStoryConfig> = {
  acting: { arc: 'acting_reunion', lookback: 6, minRelationship: 45, groupFragments: [':cast', ':crew'] },
  music: { arc: 'music_reconnection', lookback: 6, minRelationship: 42, groupFragments: [':management', ':creative'] },
  sports: { arc: 'sports_legacy', lookback: 7, minRelationship: 38, groupFragments: [':coaching', ':team'] },
  modeling: { arc: 'modeling_reunion', lookback: 6, minRelationship: 40, groupFragments: [':agency', ':campaign'] },
  racing: { arc: 'racing_reunion', lookback: 7, minRelationship: 38, groupFragments: [':engineering', ':race_team'] },
  directing: { arc: 'directing_reunion', lookback: 6, minRelationship: 45, groupFragments: [':department_heads', ':producers', ':cast'] },
};

const STORY_PREFIX = 'special_career_';
const MAX_QUEUED_STORY_EVENTS = 2;
const PATH_STORY_COOLDOWN_YEARS = 5;
const SAME_TARGET_SUPPRESSION_YEARS = 10;

function readTrack(state: GameState, kind: SpecialCareerWorldKind) { return (state.specialCareers[kind] ?? {}) as Track; }
function track(state: GameState, kind: SpecialCareerWorldKind) { return (state.specialCareers[kind] ??= {}) as Track; }
function n(record: Track, key: string, def = 0) { return typeof record[key] === 'number' ? Number(record[key]) : def; }
function setN(record: Track, key: string, value: number) { record[key] = Math.round(value * 100) / 100; }
function relation(state: GameState, npcId?: string) { return npcId ? state.relationships.find(rel => rel.npcId === npcId && !rel.estranged) : undefined; }
function storyEvent(id: string) { return id.startsWith(STORY_PREFIX); }
function currentOrJustEnded(state: GameState, world: SocialWorld) { return world.active || world.endedAge === state.character.age; }
function queuedForNpc(state: GameState, npcId: string) {
  return state.delayedEvents.some(delayed => storyEvent(delayed.eventId) && delayed.payload?.npcId === npcId)
    || Boolean(state.pendingEvent && storyEvent(state.pendingEvent.eventId) && state.pendingEvent.payload?.npcId === npcId);
}
function cooldownReady(career: Track, key: string, age: number, years: number) { return age - n(career, key, -99) >= years; }
function exactWorld(state: GameState, kind: SpecialCareerWorldKind, worldId: string) {
  const world = state.socialWorlds.find(item => item.id === worldId); return world && specialCareerWorldKind(world) === kind ? world : undefined;
}
function pathStoryArcKind(arc: SpecialCareerStoryArc): SpecialCareerWorldKind | undefined {
  return (Object.keys(PATH_STORY_CONFIG) as SpecialCareerWorldKind[]).find(kind => PATH_STORY_CONFIG[kind].arc === arc);
}
function pathStoryAgeGap(state: GameState, world: SocialWorld) {
  return typeof world.endedAge === 'number' ? state.character.age - world.endedAge : -1;
}
function recentArchivedWorld(state: GameState, world: SocialWorld, kind: SpecialCareerWorldKind) {
  if (world.active || typeof world.endedAge !== 'number') return false;
  const gap = pathStoryAgeGap(state, world); const config = PATH_STORY_CONFIG[kind];
  return gap >= 1 && gap <= config.lookback;
}
function pathStoryCareerEvidence(state: GameState, kind: SpecialCareerWorldKind) {
  const career = readTrack(state, kind);
  if (kind === 'acting') return n(career, 'credits') > 0 || n(career, 'projectsCompleted') > 0;
  if (kind === 'music') return n(career, 'songsReleased') + n(career, 'albumsReleased') > 0 || typeof career.professionalStartAge === 'number';
  if (kind === 'sports') return n(career, 'seasonsPlayed') > 0 || n(career, 'proContracts') > 0 || career.retired === true;
  if (kind === 'modeling') return n(career, 'jobs') > 0 || n(career, 'campaignsCompleted') > 0;
  if (kind === 'racing') return n(career, 'seasons') > 0 || n(career, 'contractsSigned') > 0 || career.retired === true;
  return n(career, 'filmsDirected') > 0 || n(career, 'projectsCompleted') > 0;
}
function pathGroupMemberIds(world: SocialWorld, config: PathStoryConfig) {
  return new Set(world.groups.filter(group => config.groupFragments.some(fragment => group.kind.includes(fragment))).flatMap(group => group.memberNpcIds));
}
function pathMemberEligible(state: GameState, career: Track, member: SocialWorldMember, allowedIds: Set<string>, config: PathStoryConfig) {
  if (!allowedIds.has(member.npcId)) return false;
  const npc = state.npcs[member.npcId]; const rel = relation(state, member.npcId);
  if (!npc?.alive || !rel || rel.type === 'enemy' || queuedForNpc(state, member.npcId)) return false;
  if (rel.score < config.minRelationship || npc.hiddenOpinion < -20) return false;
  const lastTarget = typeof career.storyPathLastNpcId === 'string' ? career.storyPathLastNpcId : undefined;
  if (lastTarget === member.npcId && state.character.age - n(career, 'storyPathLastStartAge', -99) < SAME_TARGET_SUPPRESSION_YEARS) return false;
  return true;
}
function pathCandidateWeight(state: GameState, world: SocialWorld, member: SocialWorldMember, config: PathStoryConfig) {
  const rel = relation(state, member.npcId)!; const npc = state.npcs[member.npcId]!; const gap = Math.max(1, pathStoryAgeGap(state, world));
  const recency = (config.lookback - gap + 1) / config.lookback;
  const relationship = Math.max(0, rel.score - config.minRelationship) / 22;
  const opinion = Math.max(0, npc.hiddenOpinion + 20) / 85;
  const role = member.role === 'leader' ? .35 : 0;
  return clamp(.85 + recency * 1.15 + relationship + opinion + role, .8, 5);
}

/**
 * Read-only eligibility projection for the 4D8A mentor/rival openings. These begin only from
 * a current or just-completed Career World, preserving the original generic story behavior.
 */
export function specialCareerStoryStartCandidates(state: GameState): SpecialCareerStoryCandidate[] {
  const candidates: SpecialCareerStoryCandidate[] = [];
  for (const world of specialCareerWorlds(state)) {
    if (!currentOrJustEnded(state, world)) continue;
    const kind = specialCareerWorldKind(world); if (!kind) continue;
    const career = readTrack(state, kind); const influence = specialCareerInfluenceView(state, world, kind);
    const leaderId = influence.leaderNpcId; const leaderRel = relation(state, leaderId); const leader = leaderId ? state.npcs[leaderId] : undefined;
    if (leader?.alive && leaderRel && !queuedForNpc(state, leader.id) && influence.leaderSupport >= 68 && leaderRel.score >= 60 && cooldownReady(career, 'storyMentorLastStartAge', state.character.age, 7)) {
      const tenure = Math.max(0, state.character.age - world.startedAge); const weight = clamp(.8 + (influence.leaderSupport - 68) / 18 + Math.min(2, tenure * .15), .8, 5);
      candidates.push({ arc: 'mentor', kind, worldId: world.id, npcId: leader.id, weight });
    }
    const rivalId = influence.rivalNpcId; const rivalRel = relation(state, rivalId); const rival = rivalId ? state.npcs[rivalId] : undefined;
    if (rival?.alive && rivalRel && !queuedForNpc(state, rival.id) && influence.rivalPressure >= 58 && rivalRel.score <= 48 && cooldownReady(career, 'storyRivalryLastStartAge', state.character.age, 6)) {
      const heat = Math.max(0, 48 - rivalRel.score); const weight = clamp(.8 + (influence.rivalPressure - 58) / 16 + heat / 22, .8, 5);
      candidates.push({ arc: 'rivalry', kind, worldId: world.id, npcId: rival.id, weight });
    }
  }
  return candidates.sort((a, b) => b.weight - a.weight || a.arc.localeCompare(b.arc) || a.kind.localeCompare(b.kind) || a.worldId.localeCompare(b.worldId) || a.npcId.localeCompare(b.npcId));
}

/**
 * 4D8B read-only projection. Path-specific stories deliberately look backward at recently archived
 * professional worlds so an exact former castmate, manager, coach, agency contact, engineer, or
 * crew member can resurface without resurrecting the old Career World.
 */
export function specialCareerPathStoryStartCandidates(state: GameState): SpecialCareerStoryCandidate[] {
  const candidates: SpecialCareerStoryCandidate[] = [];
  for (const world of specialCareerWorlds(state)) {
    const kind = specialCareerWorldKind(world); if (!kind || !recentArchivedWorld(state, world, kind) || !pathStoryCareerEvidence(state, kind)) continue;
    const career = readTrack(state, kind); const config = PATH_STORY_CONFIG[kind];
    if (!cooldownReady(career, 'storyPathLastStartAge', state.character.age, PATH_STORY_COOLDOWN_YEARS)) continue;
    const allowedIds = pathGroupMemberIds(world, config);
    const best = world.members
      .filter(member => pathMemberEligible(state, career, member, allowedIds, config))
      .map(member => ({ member, weight: pathCandidateWeight(state, world, member, config) }))
      .sort((a, b) => b.weight - a.weight || a.member.npcId.localeCompare(b.member.npcId))[0];
    if (best) candidates.push({ arc: config.arc, kind, worldId: world.id, npcId: best.member.npcId, weight: best.weight });
  }
  return candidates.sort((a, b) => b.weight - a.weight || a.kind.localeCompare(b.kind) || a.worldId.localeCompare(b.worldId) || a.npcId.localeCompare(b.npcId));
}

/** Exact, deterministic queue operation shared by annual scanning and regression fixtures. */
export function queueSpecialCareerStoryStart(state: GameState, arc: SpecialCareerStoryArc, kind: SpecialCareerWorldKind, worldId: string, npcId: string) {
  const world = exactWorld(state, kind, worldId); const npc = state.npcs[npcId]; const rel = relation(state, npcId); if (!world || !npc?.alive || !rel) return false;
  if (!world.members.some(member => member.npcId === npcId)) return false;
  const pathKind = pathStoryArcKind(arc);
  if (pathKind) {
    if (pathKind !== kind || !recentArchivedWorld(state, world, kind) || !pathStoryCareerEvidence(state, kind)) return false;
    const career = readTrack(state, kind); const config = PATH_STORY_CONFIG[kind]; const allowedIds = pathGroupMemberIds(world, config); const member = world.members.find(item => item.npcId === npcId)!;
    if (!cooldownReady(career, 'storyPathLastStartAge', state.character.age, PATH_STORY_COOLDOWN_YEARS) || !pathMemberEligible(state, career, member, allowedIds, config)) return false;
  }
  const eventId = START_EVENT[arc];
  if (state.delayedEvents.some(delayed => delayed.eventId === eventId && delayed.payload?.npcId === npcId)) return false;
  if (state.pendingEvent?.eventId === eventId && state.pendingEvent.payload?.npcId === npcId) return false;
  const career = track(state, kind); setN(career, 'storyArcStarts', n(career, 'storyArcStarts') + 1);
  if (arc === 'mentor') setN(career, 'storyMentorLastStartAge', state.character.age);
  else if (arc === 'rivalry') setN(career, 'storyRivalryLastStartAge', state.character.age);
  else {
    setN(career, 'storyPathLastStartAge', state.character.age); setN(career, 'storyPathArcStarts', n(career, 'storyPathArcStarts') + 1);
    career.storyPathLastNpcId = npcId; career.storyPathLastWorldId = world.id; career.storyPathLastArc = arc;
  }
  state.delayedEvents.push({
    id: makeStateId(state, 'delay'), eventId, dueAge: state.character.age,
    payload: { npcId, originAge: state.character.age, storyArc: arc, storyCareerKind: kind, storyWorldId: world.id, requiredRelationshipTypes: SPECIAL_CAREER_STORY_RELATIONSHIPS },
  });
  return true;
}

/**
 * Annual career-story scan. Generic current-world stories and path-specific archived-world stories
 * share one deterministic scheduler, one queue cap, and one-start-per-age budget.
 */
export function processSpecialCareerStoriesYear(state: GameState) {
  if (Number(state.flags.specialCareerStoryScanAge ?? -1) === state.character.age) return;
  state.flags.specialCareerStoryScanAge = state.character.age;
  const queued = state.delayedEvents.filter(delayed => storyEvent(delayed.eventId)).length; if (queued >= MAX_QUEUED_STORY_EVENTS) return;
  const candidates = [...specialCareerStoryStartCandidates(state), ...specialCareerPathStoryStartCandidates(state)]
    .sort((a, b) => b.weight - a.weight || a.arc.localeCompare(b.arc) || a.kind.localeCompare(b.kind) || a.worldId.localeCompare(b.worldId) || a.npcId.localeCompare(b.npcId));
  if (!candidates.length) return;
  const rng = createRng(`${state.seed}-special-career-story-${state.character.age}`);
  const strongest = candidates[0]!.weight; const chance = clamp(.16 + candidates.length * .025 + strongest * .025, .18, .38); if (!rng.chance(chance)) return;
  const chosen = rng.weighted(candidates.map(candidate => ({ item: candidate, weight: candidate.weight })));
  queueSpecialCareerStoryStart(state, chosen.arc, chosen.kind, chosen.worldId, chosen.npcId);
}
