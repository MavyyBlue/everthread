import type { Id } from './game';

export type WorkingEverthreadKind='institution'|'workplace'|'business';

export interface WorkingEverthreadLocation {
  id:string;
  kind:WorkingEverthreadKind;
  sourceId:Id;
  name:string;
  countryId:Id;
  city:string;
  active:boolean;
  inEverthread:boolean;
  locationLabel:string;
  districtId?:string;
  districtLabel?:string;
  anchorPlaceId?:Id;
  anchorPlaceLabel?:string;
  detail:string;
}

export interface WorkingEverthreadProjection {
  institution?:WorkingEverthreadLocation;
  workplaces:WorkingEverthreadLocation[];
  businesses:WorkingEverthreadLocation[];
}
