import type { Id } from './game';

export type LivingMapContextKind =
  | 'home'
  | 'property'
  | 'school'
  | 'work'
  | 'business'
  | 'child_school'
  | 'legacy';

export interface LivingMapContext {
  id: string;
  kind: LivingMapContextKind;
  label: string;
  detail: string;
  count: number;
  priority: number;
  sourceIds: Id[];
}

export interface LivingMapPlaceContext {
  placeId: Id;
  contexts: LivingMapContext[];
}

export interface LivingMapDistrictContext {
  districtId: Id;
  districtLabel: string;
  contexts: LivingMapContext[];
}

export interface LivingMapProjection {
  places: LivingMapPlaceContext[];
  districts: LivingMapDistrictContext[];
  totalContexts: number;
  connectedPlaceCount: number;
  connectedDistrictCount: number;
}
