import type { NpcPreferenceTag } from './npcPreferences';

export type CrossWorldChemistryContextKind =
  | 'school' | 'family' | 'friend' | 'workplace'
  | 'acting' | 'music' | 'sports' | 'modeling' | 'racing' | 'directing'
  | 'combat' | 'military' | 'politics';

export interface CrossWorldChemistryPlanDefinition {
  id:string;
  label:string;
  description:string;
  contextKinds:readonly CrossWorldChemistryContextKind[];
  minAge:number;
  activityId:string;
  placeId:string;
  preferenceTags:readonly NpcPreferenceTag[];
  enjoymentModifier?:number;
}

export interface CrossWorldChemistryContext {
  kind:CrossWorldChemistryContextKind;
  label:string;
  roleLabel:string;
  worldId?:string;
  worldName?:string;
}

export interface CrossWorldChemistryPlan extends CrossWorldChemistryPlanDefinition {
  npcId:string;
  placeLabel:string;
  context:CrossWorldChemistryContext;
  allowed:boolean;
  reason?:string;
}
