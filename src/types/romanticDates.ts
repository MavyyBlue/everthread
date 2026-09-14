import type { EngineResult } from './game';
import type { SharedExperienceActionResult, SharedExperienceBand } from './sharedExperiences';

export interface RomanticDateHistoryEntry {
  year:number;
  age:number;
  placeId:string;
  activityId:string;
  approval:number;
  band:SharedExperienceBand;
}

export interface RomanticRelationshipState {
  pendingDate?: {
    acceptedYear:number;
    acceptedAge:number;
  };
  dateHistory?: RomanticDateHistoryEntry[];
}

export interface RomanticDatePlanDefinition {
  id:string;
  label:string;
  description:string;
  placeId:string;
  activityId:string;
  minAge:number;
  enjoymentModifier?:number;
}

export interface RomanticDateOption extends RomanticDatePlanDefinition {
  placeLabel:string;
  allowed:boolean;
  reason?:string;
}

export interface DateInvitationResult extends EngineResult {
  accepted?:boolean;
  pendingDate?:boolean;
}

export interface RomanticDateActionResult extends SharedExperienceActionResult {
  momentumUnlocked?:boolean;
}

declare module './game' {
  interface Relationship {
    romance?: RomanticRelationshipState;
  }
}
