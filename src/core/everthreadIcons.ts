import iconPaths from '../assets/everthread-icon-paths.json';
import type { TownPlaceDefinition } from '../data/townPlaces';

export const EVERTHREAD_ICON_PATHS = iconPaths;
export type EverthreadIconName = keyof typeof iconPaths;
export type TownPlaceId = TownPlaceDefinition['id'];

/** Presentation-only mapping. Town place visibility/routing remains owned by TownMapSystem/TOWN_PLACES. */
export const TOWN_PLACE_ICON_BY_ID: Readonly<Record<string, EverthreadIconName>> = {
  'central-everthread-bank':'bank',
  'loomline-motors':'car',
  'hearthline-realty':'key',
  'threadwell-residential':'home',
  'crossroads-mall':'mall',
  'nightjar-diner':'diner',
  'weaver-park':'park',
  'everthread-market':'market',
  'everthread-school':'school',
  'everthread-college':'college',
  'everthread-general-hospital':'hospital',
  'pulseworks-gym':'gym',
  'silverframe-studios':'film',
  'threadtone-music-studio':'music',
  'facet-modeling-agency':'modeling',
  'everthread-speedway':'racing',
  'everthread-stadium':'stadium',
  'everthread-defense-garrison':'garrison',
  'everthread-city-hall':'cityhall',
  'everthread-courthouse':'justice',
  'public-safety-center':'safety',
  'everthread-correctional':'prison',
  'everthread-air-terminal':'airport',
  'loomworks-business-district':'business',
  'blackline-freight-yard':'freight',
} as const;

export function townPlaceIconName(placeId:string):EverthreadIconName|undefined{
  return TOWN_PLACE_ICON_BY_ID[placeId];
}
