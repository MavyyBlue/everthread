import { countryById, EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import type { Character, GameState, Npc } from '../types/game';

const DEFAULT_NAME_POOL_COUNTRY_ID='us';

function validNamePoolCountryId(value:unknown):value is string{
  return typeof value==='string'&&value!==EVERTHREAD_COUNTRY_ID&&Boolean(countryById[value]);
}

export function characterNamePoolCountryId(character:Pick<Character,'countryId'|'namePoolCountryId'>){
  if(validNamePoolCountryId(character.namePoolCountryId))return character.namePoolCountryId;
  if(validNamePoolCountryId(character.countryId))return character.countryId;
  return DEFAULT_NAME_POOL_COUNTRY_ID;
}

export function npcNamePoolCountryId(state:GameState,npc:Pick<Npc,'countryId'|'namePoolCountryId'>){
  if(validNamePoolCountryId(npc.namePoolCountryId))return npc.namePoolCountryId;
  if(validNamePoolCountryId(npc.countryId))return npc.countryId;
  return characterNamePoolCountryId(state.character);
}

export function ensureNpcNamePoolCountryId(state:GameState,npc:Npc){
  const countryId=npcNamePoolCountryId(state,npc);
  npc.namePoolCountryId=countryId;
  return countryId;
}

/**
 * Normalize naming-profile metadata only. This remains separate from physical residence
 * so cultural naming context survives the canonical Everthread-home rule.
 */
export function normalizeNamePoolCountries(state:GameState){
  state.character.namePoolCountryId=characterNamePoolCountryId(state.character);
  for(const npc of Object.values(state.npcs??{}))npc.namePoolCountryId=npcNamePoolCountryId(state,npc);
}

/**
 * Canonical Everthread residence normalization. Schema-14 -> 15 used this to establish
 * the fictional home setting; current-schema loads also reuse it to repair saves from
 * the retired emigration mechanic. Current co-located family/local worlds move home,
 * while historical names, archived worlds, assets, relationships, timeline entries and
 * resolved world-condition history stay untouched. No RNG or runtime IDs are consumed.
 */
export function normalizeEverthreadResidence(state:GameState){
  const previousCountryId=state.character.countryId;
  const previousCity=state.character.city;
  normalizeNamePoolCountries(state);

  if(previousCountryId===EVERTHREAD_COUNTRY_ID&&previousCity===EVERTHREAD_CITY)return;

  for(const npc of Object.values(state.npcs??{})){
    if(npc.countryId===previousCountryId&&npc.city===previousCity){npc.countryId=EVERTHREAD_COUNTRY_ID;npc.city=EVERTHREAD_CITY;}
  }
  for(const world of state.socialWorlds??[]){
    if(world.active&&world.countryId===previousCountryId&&world.city===previousCity){world.countryId=EVERTHREAD_COUNTRY_ID;world.city=EVERTHREAD_CITY;}
  }
  for(const condition of state.worldConditions?.active??[]){
    if(condition.scope==='country'&&condition.countryId===previousCountryId)condition.countryId=EVERTHREAD_COUNTRY_ID;
  }

  state.character.countryId=EVERTHREAD_COUNTRY_ID;
  state.character.city=EVERTHREAD_CITY;
  state.travel.visitedCountries=[...new Set([...(state.travel.visitedCountries??[]),EVERTHREAD_COUNTRY_ID])];
  state.travel.visitedCities=[...new Set([...(state.travel.visitedCities??[]),EVERTHREAD_CITY])];
}

export const migrateEverthreadSetting=normalizeEverthreadResidence;
