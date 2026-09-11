import type { EngineResult, GameState } from '../types/game';

export type ActionVfxKind =
  | 'acting'
  | 'music'
  | 'professionalSports'
  | 'combatSports'
  | 'modeling'
  | 'motorsport'
  | 'organizedCrime'
  | 'chemistryGain'
  | 'followersGain'
  | 'relationshipGain'
  | 'stressReduction'
  | 'stressIncrease'
  | 'moneyLoss'
  | 'relationshipLoss';

export type ActionResultHandler = (result: EngineResult, request?: ActionVfxRequest) => void;

export interface ActionVfxRequest {
  primary?: ActionVfxKind;
  derive?: boolean;
  suppressDerived?: ActionVfxKind[];
}

export interface ActionVfxSnapshot {
  cash: number;
  stress: number;
  followers: number;
  relationshipScores: Record<string, number>;
  timelineLength: number;
}

export const ACTION_VFX_ASSETS: Record<ActionVfxKind, string> = {
  acting: './vfx/action/acting.png',
  music: './vfx/action/music.png',
  professionalSports: './vfx/action/professional-sports.png',
  combatSports: './vfx/action/combat-sports.png',
  modeling: './vfx/action/modeling.png',
  motorsport: './vfx/action/motorsport.png',
  organizedCrime: './vfx/action/organized-crime.png',
  chemistryGain: './vfx/action/chemistry-followers.png',
  followersGain: './vfx/action/chemistry-followers.png',
  relationshipGain: './vfx/action/relationship-gain.png',
  stressReduction: './vfx/action/stress-reduction.png',
  stressIncrease: './vfx/action/stress-increase.png',
  moneyLoss: './vfx/action/money-loss.png',
  relationshipLoss: './vfx/action/relationship-loss.png',
};

export const EVERTHREAD_UI_ICONS = {
  cash: './icons/cash.png',
  deceased: './icons/deceased-stamp.png',
} as const;

const CAREER_ACTION_VFX: Record<string, ActionVfxKind> = {
  acting: 'acting',
  music: 'music',
  sports: 'professionalSports',
  combat: 'combatSports',
  modeling: 'modeling',
  racing: 'motorsport',
  crimeOrg: 'organizedCrime',
};

export function careerActionVfx(path: string): ActionVfxKind | undefined {
  return CAREER_ACTION_VFX[path];
}

export function captureActionVfxSnapshot(state: GameState): ActionVfxSnapshot {
  const relationshipScores: Record<string, number> = {};
  for (const relationship of state.relationships) relationshipScores[relationship.npcId] = relationship.score;
  return {
    cash: state.finances.cash,
    stress: state.character.secondary.stress,
    followers: state.fame.followers,
    relationshipScores,
    timelineLength: state.timeline.length,
  };
}

export function deriveActionVfxKinds(before: ActionVfxSnapshot, after: GameState): ActionVfxKind[] {
  const kinds: ActionVfxKind[] = [];
  if (after.finances.cash < before.cash - 0.001) kinds.push('moneyLoss');
  if (after.character.secondary.stress > before.stress + 0.001) kinds.push('stressIncrease');
  else if (after.character.secondary.stress < before.stress - 0.001) kinds.push('stressReduction');
  if (after.fame.followers > before.followers) kinds.push('followersGain');

  let relationshipGain = false;
  let relationshipLoss = false;
  for (const relationship of after.relationships) {
    const prior = before.relationshipScores[relationship.npcId];
    if (prior === undefined) continue;
    if (relationship.score > prior + 0.001) relationshipGain = true;
    if (relationship.score < prior - 0.001) relationshipLoss = true;
  }

  // Relationship scores are bounded to 0..100. A valid interaction at a bound can
  // still have a real semantic delta (and the engine records that delta in the new
  // timeline entry) even though the stored score remains 100 -> 100 or 0 -> 0.
  // Fold only entries created by this action into feedback so capped interactions
  // still get the correct heart VFX without replaying historical timeline effects.
  for (const entry of after.timeline.slice(Math.max(0, before.timelineLength))) {
    if ((entry.relationshipDelta ?? 0) > 0.001) relationshipGain = true;
    if ((entry.relationshipDelta ?? 0) < -0.001) relationshipLoss = true;
  }
  if (relationshipGain) kinds.push('relationshipGain');
  if (relationshipLoss) kinds.push('relationshipLoss');
  return kinds;
}

export function resolvedActionVfxKinds(
  success: boolean,
  request: ActionVfxRequest | undefined,
  before: ActionVfxSnapshot | undefined,
  after: GameState,
): ActionVfxKind[] {
  const kinds: ActionVfxKind[] = [];
  if (success && request?.primary) kinds.push(request.primary);
  const shouldDerive = request?.derive !== false;
  if (shouldDerive && before) kinds.push(...deriveActionVfxKinds(before, after));
  const suppressed = new Set(request?.suppressDerived ?? []);
  return [...new Set(kinds.filter(kind => !suppressed.has(kind) || kind === request?.primary))];
}
