import type { EngineResult } from './game';
import type { NpcPreferenceTag } from './npcPreferences';

export type SharedExperienceBand='awful'|'rough'|'mixed'|'good'|'great';

export interface SharedExperienceActivityCopy {
  lead:string;
  memoryLead:string;
}

export interface SharedExperienceActivityDefinition {
  id:string;
  label:string;
  minAge:number;
  maxAge?:number;
  placeIds:readonly string[];
  preferenceTags:readonly NpcPreferenceTag[];
  baseEnjoyment:number;
  copy:SharedExperienceActivityCopy;
}

export interface SharedExperienceEvaluationContext {
  /** Optional exact content tags, used by later date/gift/cross-world callers without forking the evaluator. */
  preferenceTags?:readonly NpcPreferenceTag[];
  /** Small contextual nudge for the owning system; hard-clamped by the evaluator. */
  enjoymentModifier?:number;
}

export interface SharedPreferenceEvaluation {
  approval:number;
  band:SharedExperienceBand;
  relationshipDelta:number;
  opinionDelta:number;
  happinessDelta:number;
  meaningfulMemory:boolean;
  preferenceSignalTag?:NpcPreferenceTag;
}

export interface SharedExperienceResult extends SharedPreferenceEvaluation {
  npcId:string;
  relationshipId:string;
  placeId:string;
  placeLabel:string;
  activityId:string;
  activityLabel:string;
  prose:string;
  memorySummary:string;
  discoveredPreferenceTag?:NpcPreferenceTag;
}

export interface SharedExperienceOption {
  activityId:string;
  activityLabel:string;
  placeId:string;
  placeLabel:string;
  allowed:boolean;
  reason?:string;
}

export interface SharedExperienceActionResult extends EngineResult {
  experience?:SharedExperienceResult;
}
