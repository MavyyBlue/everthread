import type { Id } from './game';

export type PlaceLegacyMemoryKind='milestone'|'family_home'|'family_business';

export interface PlaceLegacyMemory {
  id:string;
  kind:PlaceLegacyMemoryKind;
  placeId:Id;
  placeLabel:string;
  districtId:string;
  districtLabel:string;
  text:string;
  generation:number;
  current:boolean;
  year?:number;
  age?:number;
  sourceId?:Id;
}

export interface PlaceLegacyPlace {
  placeId:Id;
  placeLabel:string;
  districtId:string;
  districtLabel:string;
  memories:PlaceLegacyMemory[];
  familyHomes:number;
  familyBusinesses:number;
  currentLifeMilestones:number;
  priorGenerationMilestones:number;
}

export interface GenerationalPlaceMemoryProjection {
  places:PlaceLegacyPlace[];
  totalMemories:number;
  familyLandmarks:number;
}
