import { primaryNavigationItems } from '../core/navigation';
import { createInstitutionRouteRequest, resolveInstitutionDestination } from '../core/institutionRouting';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { TOWN_MAP_HEIGHT, TOWN_MAP_WIDTH, TOWN_PLACES } from '../data/townPlaces';
import { migrateSave } from '../services/SaveSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { emigrate, travel } from '../systems/TravelSystem';

export function runPrePhase10EPlayerUxRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Pre-Phase 10E player-UX regression failed: ${message}`);}

  const base=primaryNavigationItems('life',false);
  verify(base.map(item=>item.id).join(',')==='life,people,map','1 the persistent mobile navigation must contain only Life, People, and Map');
  for(const contextual of ['activities','career','assets'] as const){
    const items=primaryNavigationItems(contextual,true);
    verify(items.length===4&&items.slice(0,3).map(item=>item.id).join(',')==='life,people,map'&&items[3]?.id===contextual,`2-${contextual} a map-routed ${contextual} owner must appear only as the single contextual fourth tab`);
  }
  verify(primaryNavigationItems('career',false).length===3,'3 a non-routed Career screen must not permanently restore the removed navigation item');

  const studio=TOWN_PLACES.find(place=>place.id==='threadtone-music-studio');
  verify(Boolean(studio&&studio.category==='career'&&studio.districtId==='eastworks'),'4 the Music career must have one authored public Eastworks studio location');
  verify(Boolean(studio&&studio.map.x>=0&&studio.map.x<=TOWN_MAP_WIDTH&&studio.map.y>=0&&studio.map.y<=TOWN_MAP_HEIGHT),'5 the Music Studio marker must stay on the authored map coordinate plane');
  verify(studio?.activityTags.includes('music')===true&&studio.visibility==='public','6 the Music Studio must be searchable as a public music place');
  verify(studio?.routes?.length===1&&studio.routes[0]?.destination==='music','7 the Music Studio must expose one honest route into the existing Music owner');
  verify(JSON.stringify(resolveInstitutionDestination('music'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'music'}),'8 Music routing must focus the established Career special-path authority');
  const requestA=createInstitutionRouteRequest('threadtone-music-studio','music',901);const requestB=createInstitutionRouteRequest('threadtone-music-studio','music',901);
  verify(Boolean(requestA&&requestA.placeId==='threadtone-music-studio'&&requestA.resolved.tab==='career'&&JSON.stringify(requestA)===JSON.stringify(requestB)),'9 Music Studio route requests must preserve authored place identity and resolve deterministically');

  const airport=TOWN_PLACES.find(place=>place.id==='everthread-air-terminal');
  const airportRoute=airport?.routes?.find(route=>route.id==='travel');
  verify(Boolean(airport&&airportRoute&&airportRoute.destination==='travel'&&!airport.activityTags.includes('emigration')),'10 the Airport must remain a travel doorway without advertising permanent relocation');
  verify(Boolean(airportRoute&&!/emigra/i.test(`${airportRoute.label} ${airportRoute.description}`)),'11 Airport route copy must describe temporary trips only');

  const vacation=createNewGame({seed:'pre10e-everthread-vacation'});vacation.character.age=30;vacation.finances.cash=1_000_000;const vacationHome=`${vacation.character.countryId}|${vacation.character.city}`;
  const vacationResult=travel(vacation,'jp');
  verify(vacationResult.success&&`${vacation.character.countryId}|${vacation.character.city}`===vacationHome&&vacation.travel.visitedCountries.includes('jp'),'12 an international vacation must record the destination without changing canonical residence');

  const familyTrip=createNewGame({seed:'pre10e-everthread-family-trip'});familyTrip.character.age=12;for(const npc of Object.values(familyTrip.npcs))npc.wealth=1_000_000;const familyHome=`${familyTrip.character.countryId}|${familyTrip.character.city}`;
  const familyResult=travel(familyTrip,'ca',undefined,true);
  verify(familyResult.success&&`${familyTrip.character.countryId}|${familyTrip.character.city}`===familyHome&&familyTrip.travel.visitedCountries.includes('ca'),'13 a family trip must stay temporary and leave the family home authority in Everthread');

  const blocked=createNewGame({seed:'pre10e-retired-emigration'});blocked.character.age=30;blocked.finances.cash=1_000_000;blocked.character.stats.intelligence=100;blocked.character.secondary.reputation=100;const blockedBefore=JSON.stringify(blocked);
  const blockedResult=emigrate(blocked,'jp');
  verify(!blockedResult.success&&/permanent home/i.test(blockedResult.messages[0]?.text??'')&&JSON.stringify(blocked)===blockedBefore,'14 the retired engine-level emigration action must fail without consuming or mutating gameplay state');

  const legacyExternal=createNewGame({seed:'pre10e-legacy-external'});legacyExternal.character.age=32;legacyExternal.character.countryId='jp';legacyExternal.character.city='Tokyo';legacyExternal.travel.visitedCountries=[EVERTHREAD_COUNTRY_ID,'jp'];legacyExternal.travel.visitedCities=[EVERTHREAD_CITY,'Tokyo, Japan'];const colocatedParent=legacyExternal.npcs[legacyExternal.relationships.find(rel=>rel.type==='parent')!.npcId]!;colocatedParent.countryId='jp';colocatedParent.city='Tokyo';const migrationRng=legacyExternal.rngCounter,migrationId=legacyExternal.idCounter;
  const normalized=migrateSave(legacyExternal);
  verify(normalized.character.countryId===EVERTHREAD_COUNTRY_ID&&normalized.character.city===EVERTHREAD_CITY,'15 current-schema saves left abroad by the retired mechanic must normalize back to Everthread');
  verify(normalized.npcs[colocatedParent.id]?.countryId===EVERTHREAD_COUNTRY_ID&&normalized.npcs[colocatedParent.id]?.city===EVERTHREAD_CITY,'16 a co-located family member from a retired-emigration save must return with the protagonist instead of remaining in an impossible household split');
  verify(normalized.travel.visitedCountries.includes('jp')&&normalized.travel.visitedCities.includes('Tokyo, Japan'),'17 normalization must preserve historical trip/location history rather than erasing where the life has been');
  verify(normalized.rngCounter===migrationRng&&normalized.idCounter===migrationId&&JSON.stringify(migrateSave(structuredClone(normalized)))===JSON.stringify(normalized),'18 residence normalization must be RNG/ID-neutral and idempotent');

  return checks;
}
