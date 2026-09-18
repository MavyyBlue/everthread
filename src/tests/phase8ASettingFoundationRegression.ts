import { countryById, EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID, namingProfileCountries } from '../data/countries';
import { createNewGame } from '../systems/CharacterSystem';
import { migrateSave } from '../services/SaveSystem';
import { validateState } from '../core/invariants';
import type { GameState, SocialWorld, WorldConditionRecord } from '../types/game';

function check(condition:unknown,message:string):asserts condition{if(!condition)throw new Error(`Phase 8A setting regression failed: ${message}`);}
function stripNameProfiles(state:GameState){
  delete (state.character as unknown as {namePoolCountryId?:string}).namePoolCountryId;
  for(const npc of Object.values(state.npcs))delete npc.namePoolCountryId;
}
function organization(id:string,name:string,countryId:string,city:string,active:boolean):SocialWorld{
  return{id,kind:'organization',name,countryId,city,startedAge:12,...(!active?{endedAge:18}:{}),active,members:[],groups:[]};
}
function nationalCondition(id:string,definitionId:string,countryId:string,year:number):WorldConditionRecord{
  return{id,definitionId,scope:'country',countryId,startYear:year,endYear:year+2,intensity:2};
}

export function runPhase8ASettingFoundationRegression(){
  let checks=0;const verify=(condition:unknown,message:string)=>{checks+=1;check(condition,message);};

  const fresh=createNewGame({seed:'phase8a-everthread-home'});
  verify(fresh.saveVersion===18,'new lives must initialize current schema 18');
  verify(fresh.character.countryId===EVERTHREAD_COUNTRY_ID&&fresh.character.city===EVERTHREAD_CITY,'player-facing new lives must begin in Everthread');
  verify(Boolean(countryById[fresh.character.namePoolCountryId])&&fresh.character.namePoolCountryId!==EVERTHREAD_COUNTRY_ID,'new lives must retain a real naming profile separate from physical residence');
  verify(Object.values(fresh.npcs).every(npc=>npc.countryId===EVERTHREAD_COUNTRY_ID&&npc.city===EVERTHREAD_CITY),'new-life parent cast must share the local Everthread setting');
  verify(Object.values(fresh.npcs).every(npc=>npc.namePoolCountryId===fresh.character.namePoolCountryId),'new-life parent naming metadata must preserve the player naming profile');
  verify(fresh.timeline[0]?.text.includes('Everthread')&&!fresh.timeline[0]?.text.includes('Everthread, Everthread'),'birth copy must present Everthread as a place rather than a duplicated city/country label');
  verify(fresh.travel.visitedCountries.includes(EVERTHREAD_COUNTRY_ID)&&fresh.travel.visitedCities.includes(EVERTHREAD_CITY),'new-life travel history must begin with the canonical Everthread home');
  verify(namingProfileCountries.length>1&&!namingProfileCountries.some(country=>country.id===EVERTHREAD_COUNTRY_ID),'procedural naming profiles must preserve broad cultural variety without treating Everthread as a culture pool');

  const explicit=createNewGame({seed:'phase8a-explicit-scenario',countryId:'jp'});
  verify(explicit.character.countryId==='jp'&&explicit.character.namePoolCountryId==='jp','low-level explicit country fixtures must retain legacy scenario semantics for existing systems/tests');
  const split=createNewGame({seed:'phase8a-split-profile',namePoolCountryId:'jp'});
  verify(split.character.countryId===EVERTHREAD_COUNTRY_ID&&split.character.namePoolCountryId==='jp','residence and naming profile must be independently controllable without a second location authority');

  const legacy=createNewGame({seed:'phase8a-migration',countryId:'jp'});legacy.saveVersion=14;legacy.character.age=31;legacy.currentYear=2057;
  const oldCountry=legacy.character.countryId;const oldCity=legacy.character.city;
  const localNpc=Object.values(legacy.npcs)[0]!;const remoteNpc=Object.values(legacy.npcs)[1]!;remoteNpc.city='Osaka'===oldCity?'Kyoto':'Osaka';
  legacy.socialWorlds.push(organization('phase8a-active','Current Local Circle',oldCountry,oldCity,true));
  legacy.socialWorlds.push(organization('phase8a-archived','Old Local Circle',oldCountry,oldCity,false));
  legacy.worldConditions.active=[nationalCondition('phase8a-growth','growth_wave',oldCountry,legacy.currentYear)];
  legacy.worldConditions.history=[{...nationalCondition('phase8a-history','housing_squeeze',oldCountry,legacy.currentYear-5),resolvedYear:legacy.currentYear-3}];
  legacy.worldConditions.lastStartedYearByDefinition={growth_wave:legacy.currentYear,housing_squeeze:legacy.currentYear-5};
  stripNameProfiles(legacy);
  const rngBefore=legacy.rngCounter;const idBefore=legacy.idCounter;
  const namesBefore=Object.fromEntries(Object.values(legacy.npcs).map(npc=>[npc.id,`${npc.firstName}|${npc.lastName}`]));
  const relationshipsBefore=JSON.stringify(legacy.relationships);const educationBefore=JSON.stringify(legacy.education);const assetsBefore=JSON.stringify(legacy.assets);const timelineBefore=JSON.stringify(legacy.timeline);const historyBefore=JSON.stringify(legacy.worldConditions.history);
  const migrated=migrateSave(structuredClone(legacy));
  verify(migrated.saveVersion===18&&migrated.character.countryId===EVERTHREAD_COUNTRY_ID&&migrated.character.city===EVERTHREAD_CITY,'legacy pre-setting protagonists must migrate into canonical Everthread residence before current-schema normalization');
  verify(migrated.character.namePoolCountryId===oldCountry,'Everthread setting migration must retain the protagonist legacy country as cultural naming context');
  verify(migrated.npcs[localNpc.id]?.countryId===EVERTHREAD_COUNTRY_ID&&migrated.npcs[localNpc.id]?.city===EVERTHREAD_CITY&&migrated.npcs[localNpc.id]?.namePoolCountryId===oldCountry,'local NPCs must move with the protagonist while keeping their established naming profile');
  verify(migrated.npcs[remoteNpc.id]?.countryId===oldCountry&&migrated.npcs[remoteNpc.id]?.city===remoteNpc.city&&migrated.npcs[remoteNpc.id]?.namePoolCountryId===oldCountry,'NPCs already living elsewhere must retain their physical location and naming profile');
  verify(migrated.socialWorlds.find(world=>world.id==='phase8a-active')?.countryId===EVERTHREAD_COUNTRY_ID,'active local SocialWorlds must follow the migrated present-day setting');
  verify(migrated.socialWorlds.find(world=>world.id==='phase8a-archived')?.countryId===oldCountry,'archived SocialWorlds must remain historical instead of being rewritten');
  verify(migrated.worldConditions.active[0]?.countryId===EVERTHREAD_COUNTRY_ID,'active local world conditions must continue affecting the migrated setting');
  verify(JSON.stringify(migrated.worldConditions.history)===historyBefore,'resolved world-condition history must not be rewritten by the setting migration');
  verify(migrated.travel.visitedCountries.includes(oldCountry)&&migrated.travel.visitedCountries.includes(EVERTHREAD_COUNTRY_ID)&&migrated.travel.visitedCities.includes(EVERTHREAD_CITY),'migration must add Everthread without erasing prior travel history');
  verify(migrated.rngCounter===rngBefore&&migrated.idCounter===idBefore,'setting migration must consume neither gameplay RNG nor runtime IDs');
  verify(JSON.stringify(Object.fromEntries(Object.values(migrated.npcs).map(npc=>[npc.id,`${npc.firstName}|${npc.lastName}`])))===JSON.stringify(namesBefore),'setting migration must never regenerate established NPC names');
  verify(JSON.stringify(migrated.relationships)===relationshipsBefore&&JSON.stringify(migrated.education)===educationBefore&&JSON.stringify(migrated.assets)===assetsBefore&&JSON.stringify(migrated.timeline)===timelineBefore,'migration must preserve relationships, education history, assets, and timeline history');
  verify(validateState(migrated).length===0,'migrated setting state must satisfy global invariants');

  const remigrated=migrateSave(structuredClone(migrated));
  verify(JSON.stringify(remigrated)===JSON.stringify(migrated),'current-schema normalization must be idempotent after the one-time setting migration');
  const legacyExternal=structuredClone(migrated);legacyExternal.character.countryId='jp';legacyExternal.character.city='Tokyo';const normalized=migrateSave(legacyExternal);
  verify(normalized.character.countryId===EVERTHREAD_COUNTRY_ID&&normalized.character.city===EVERTHREAD_CITY&&normalized.character.namePoolCountryId===oldCountry,'current-schema saves from the retired emigration mechanic must deterministically return the protagonist to Everthread while preserving naming context');

  return checks;
}
