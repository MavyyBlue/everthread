import type { Id } from './game';
import type { NpcPreferenceTag } from './npcPreferences';

export type ResidenceKind = 'owned' | 'family' | 'rented' | 'shared' | 'campus' | 'institutional';
export type ResidentialPlanTarget = 'player' | 'npc' | 'best';

export interface ResidenceProjection {
  kind: ResidenceKind;
  city: string;
  label: string;
  detail: string;
  placeId?: Id;
  propertyId?: Id;
  propertyName?: string;
  ownerNpcId?: Id;
  inheritedFromNpcId?: Id;
  familyLandmark: boolean;
  visitable: boolean;
  reason?: string;
}

export interface NpcHouseholdProjection {
  npcId: Id;
  memberIds: Id[];
  residence: ResidenceProjection;
}

export interface ResidentialPlanDefinition {
  id: string;
  label: string;
  description: string;
  minAge: number;
  maxAge?: number;
  activityId: string;
  target: ResidentialPlanTarget;
  familyOnly?: boolean;
  nonFamilyOnly?: boolean;
  preferenceTags: NpcPreferenceTag[];
  enjoymentModifier?: number;
}

export interface ResidentialPlan extends ResidentialPlanDefinition {
  npcId: Id;
  residence: ResidenceProjection;
  residenceLabel: string;
  placeId: Id;
  allowed: boolean;
  reason?: string;
}
