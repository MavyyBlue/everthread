import type { GameState } from '../types/game';

export type ActionPolicyId = keyof typeof ACTION_POLICIES;

interface ActionPolicy {
  maxPerAge?: number;
  cooldownAges?: number;
  message: string;
}

export interface ActionClaim {
  policy: ActionPolicyId;
  target?: string;
  units?: number;
}

export interface ActionGateResult {
  allowed: boolean;
  message?: string;
  blockedPolicy?: ActionPolicyId;
}

/**
 * Central anti-spam policy registry. A single game action can claim more than one
 * policy atomically (for example: one application to this exact job, and one of
 * the player's limited job-application attempts for the year).
 *
 * These are deliberately game-scale limits: one Age Up represents a full year,
 * so a click represents a meaningful chunk of that year rather than one literal
 * real-world instance of the activity.
 */
export const ACTION_POLICIES = {
  'career.application.total': { maxPerAge: 5, message: 'You have already made several serious job applications this year. Age up before applying again.' },
  'career.application.job': { maxPerAge: 1, message: 'You already applied for that role this year.' },
  'career.job_start': { maxPerAge: 1, message: 'You already started a new job this year. Age up before changing roles again.' },
  'career.work_harder': { maxPerAge: 1, message: 'You already made an extra push at work this year.' },
  'career.raise': { maxPerAge: 1, message: 'You already asked for a raise this year.' },
  'career.freelance': { maxPerAge: 4, message: 'You have already taken on several freelance gigs this year.' },

  'education.effort': { maxPerAge: 1, message: 'You already made your major school-effort choice for this year.' },
  'education.enroll': { maxPerAge: 1, message: 'You already made a post-secondary enrollment decision this year.' },
  'school.group.join': { maxPerAge: 2, message: 'You have already made enough major school-activity commitments this year.' },
  'school.group.join.target': { maxPerAge: 1, message: 'You already made a membership decision about that school activity this year.' },
  'school.group.activity.total': { maxPerAge: 2, message: 'You have already committed substantial extra time to school activities this year.' },
  'school.group.activity.target': { maxPerAge: 1, message: 'You already gave that school activity extra attention this year.' },
  'school.risk': { maxPerAge: 1, message: 'You already took a major academic risk this year.' },
  'school.community': { maxPerAge: 1, message: 'You already completed a major school-community effort this year.' },

  'wellness.total': { maxPerAge: 3, message: 'You have already committed most of your spare time to wellness activities this year.' },
  'wellness.activity': { maxPerAge: 1, message: 'You already focused on that wellness activity this year.' },
  'health.treatment.condition': { maxPerAge: 2, message: 'You have already pursued substantial treatment for that condition this year.' },
  'health.treatment.kind': { maxPerAge: 1, message: 'You already tried that treatment route for this condition this year.' },
  'health.rehab': { maxPerAge: 1, message: 'You already made a rehabilitation attempt for this addiction this year.' },
  'habit.kind': { maxPerAge: 3, message: 'That habit has already taken up a lot of this year.' },

  'social.meet': { maxPerAge: 3, message: 'You have already made several serious attempts to meet new people this year.' },
  'social.npc.total': { maxPerAge: 3, message: 'You have already spent substantial time with this person this year.' },
  'social.npc.action': { maxPerAge: 1, message: 'You already chose that interaction with this person this year.' },
  'relationship.milestone': { maxPerAge: 1, message: 'You already tried that relationship step with this person this year.' },
  'family.child_attempt': { maxPerAge: 1, message: 'You already tried for a child this year.' },
  'family.adoption': { maxPerAge: 1, message: 'You already completed an adoption decision this year.' },

  'fame.post.total': { maxPerAge: 4, message: 'You have already made several major content pushes this year.' },
  'fame.post.platform': { maxPerAge: 2, message: 'You have already focused heavily on that platform this year.' },
  'fame.activity.total': { maxPerAge: 2, message: 'You have already taken on several major publicity opportunities this year.' },
  'fame.activity.kind': { maxPerAge: 1, message: 'You already completed that kind of publicity opportunity this year.' },

  'travel.trip': { maxPerAge: 3, message: 'You have already taken several substantial trips this year.' },
  'travel.emigrate': { maxPerAge: 1, message: 'You already made an emigration decision this year.' },
  'license.test': { maxPerAge: 1, message: 'You already attempted that license test this year.' },

  'crime.total': { maxPerAge: 3, message: 'You have already committed or attempted several crimes this year.' },
  'crime.kind': { maxPerAge: 1, message: 'You already attempted that crime this year.' },
  'prison.total': { maxPerAge: 2, message: 'You have already spent most of this prison year on major activities.' },
  'prison.kind': { maxPerAge: 1, message: 'You already did that prison activity this year.' },
  'prison.escape': { maxPerAge: 1, message: 'You already attempted an escape this year.' },

  'pet.adopt': { maxPerAge: 2, message: 'You have already adopted enough pets for one year.' },
  'collectible.purchase.total': { maxPerAge: 4, message: 'You have already spent enough time hunting for collectibles this year.' },
  'collectible.purchase.item': { maxPerAge: 1, message: 'You already pursued that collectible this year.' },
  'pet.total': { maxPerAge: 3, message: 'You have already spent substantial time caring for this pet this year.' },
  'pet.action': { maxPerAge: 1, message: 'You already did that activity with this pet this year.' },
  'property.renovate': { cooldownAges: 2, message: 'This property was renovated too recently for another major renovation.' },

  'business.start': { maxPerAge: 1, message: 'Founding a company is a major undertaking. Age up before starting another one.' },
  'business.product': { maxPerAge: 1, message: 'This business already completed a major product launch this year.' },

  'special.training': { maxPerAge: 1, message: 'You already completed a major training block for this path this year.' },
  'special.audition': { maxPerAge: 3, message: 'You have already completed several major auditions this year.' },
  'special.music_release': { maxPerAge: 2, message: 'You have already completed your major music releases for this year.' },
  'special.tour': { maxPerAge: 1, message: 'You already completed a major tour this year.' },
  'special.pro_contract': { maxPerAge: 1, message: 'You already pursued a professional contract this year.' },
  'special.fight': { maxPerAge: 2, message: 'You already fought enough major bouts this year.' },
  'special.campaign': { maxPerAge: 1, message: 'You already ran a major campaign this year.' },
  'special.politics.total': { maxPerAge: 2, message: 'You have already made several major political moves this year.' },
  'special.politics.kind': { maxPerAge: 1, message: 'You already made that kind of political move this year.' },
  'special.royal_duty': { maxPerAge: 1, message: 'You already completed your major ceremonial duties for this year.' },
  'special.model.total': { maxPerAge: 2, message: 'You have already completed several major modeling activities this year.' },
  'special.model.kind': { maxPerAge: 1, message: 'You already completed that kind of modeling activity this year.' },
  'special.race': { maxPerAge: 1, message: 'You already completed this year’s major racing event.' },
  'special.direct_film': { cooldownAges: 2, message: 'A feature production takes time. Age up before directing another major film.' },
  'special.crime_org.total': { maxPerAge: 2, message: 'You have already completed several major organization actions this year.' },
  'special.crime_org.kind': { maxPerAge: 1, message: 'You already completed that organization action this year.' },
  'special.organization.total': { maxPerAge: 2, message: 'You have already made several major operational decisions for this organization this year.' },
  'special.organization.kind': { maxPerAge: 1, message: 'You already completed that operational action this year.' },
} as const satisfies Record<string, ActionPolicy>;

function ensureLedger(state: GameState) {
  state.actionLedger ??= { age: state.character.age, uses: {}, lastUsedAge: {}, revision: 0 };
  if (state.actionLedger.age !== state.character.age) {
    state.actionLedger.age = state.character.age;
    state.actionLedger.uses = {};
  }
  state.actionLedger.lastUsedAge ??= {};
  state.actionLedger.uses ??= {};
  state.actionLedger.revision = Number.isFinite(state.actionLedger.revision) ? state.actionLedger.revision : 0;
  return state.actionLedger;
}

function claimKey(claim: ActionClaim): string {
  return claim.target ? `${claim.policy}:${claim.target}` : claim.policy;
}

export function actionGateStatus(state: GameState, claims: ActionClaim | ActionClaim[]): ActionGateResult {
  const list = Array.isArray(claims) ? claims : [claims];
  const ledger = state.actionLedger;
  const currentUses = ledger?.age === state.character.age ? ledger.uses : {};
  const lastUsedAge = ledger?.lastUsedAge ?? {};
  for (const claim of list) {
    const policy: ActionPolicy = ACTION_POLICIES[claim.policy];
    const key = claimKey(claim);
    const units = Math.max(1, Math.floor(claim.units ?? 1));
    if (policy.maxPerAge !== undefined && (currentUses[key] ?? 0) + units > policy.maxPerAge) {
      return { allowed: false, message: policy.message, blockedPolicy: claim.policy };
    }
    if (policy.cooldownAges !== undefined) {
      const lastUsed = lastUsedAge[key];
      if (lastUsed !== undefined && state.character.age - lastUsed < policy.cooldownAges) {
        return { allowed: false, message: policy.message, blockedPolicy: claim.policy };
      }
    }
  }
  return { allowed: true };
}

/** Consumes all claims atomically. Failed random outcomes still consume their attempt. */
export function consumeAction(state: GameState, claims: ActionClaim | ActionClaim[]): ActionGateResult {
  const list = Array.isArray(claims) ? claims : [claims];
  const status = actionGateStatus(state, list);
  if (!status.allowed) return status;
  const ledger = ensureLedger(state);
  for (const claim of list) {
    const key = claimKey(claim);
    const units = Math.max(1, Math.floor(claim.units ?? 1));
    ledger.uses[key] = (ledger.uses[key] ?? 0) + units;
    ledger.lastUsedAge[key] = state.character.age;
  }
  ledger.revision += 1;
  return { allowed: true };
}

export function actionAllowed(state: GameState, claims: ActionClaim | ActionClaim[]): boolean {
  return actionGateStatus(state, claims).allowed;
}

export function actionUsesThisAge(state: GameState, policy: ActionPolicyId, target?: string): number {
  const ledger = state.actionLedger;
  if (!ledger || ledger.age !== state.character.age) return 0;
  return ledger.uses[claimKey({ policy, target })] ?? 0;
}
