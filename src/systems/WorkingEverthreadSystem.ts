import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID, locationLabel } from '../data/countries';
import { BUSINESS_DISTRICT_RULES, POST_SECONDARY_STAGES, workingDistrictRuleForIndustry } from '../data/workingEverthread';
import { TOWN_DISTRICTS, TOWN_PLACES } from '../data/townPlaces';
import type { Business, GameState, SocialWorld } from '../types/game';
import type { WorkingEverthreadLocation, WorkingEverthreadProjection } from '../types/workingEverthread';
import { activeWorkplaceWorlds } from './WorkplaceSystem';

const DISTRICT_BY_ID=new Map(TOWN_DISTRICTS.map(item=>[item.id,item] as const));
const PLACE_BY_ID=new Map(TOWN_PLACES.map(item=>[item.id,item] as const));

function inEverthread(countryId:string,city:string){return countryId===EVERTHREAD_COUNTRY_ID&&city===EVERTHREAD_CITY;}
function locationFields(countryId:string,city:string,districtId?:string,anchorPlaceId?:string){
  const local=inEverthread(countryId,city);const district=local&&districtId?DISTRICT_BY_ID.get(districtId):undefined;const place=local&&anchorPlaceId?PLACE_BY_ID.get(anchorPlaceId):undefined;
  const label=local?(place?`${place.label} · ${district?.label??EVERTHREAD_CITY}`:district?`${district.label} · ${EVERTHREAD_CITY}`:EVERTHREAD_CITY):locationLabel(countryId,city);
  return{inEverthread:local,locationLabel:label,...(district?{districtId:district.id,districtLabel:district.label}:{}),...(place?{anchorPlaceId:place.id,anchorPlaceLabel:place.label}:{})};
}

export function schoolInstitutionLocation(state:GameState):WorkingEverthreadLocation|undefined{
  const world=state.socialWorlds.find(item=>item.kind==='school'&&item.active&&item.school);if(!world?.school)return;
  const postSecondary=POST_SECONDARY_STAGES.has(world.school.stage);const placeId=postSecondary?'everthread-college':'everthread-school';const districtId='campus-green';const fields=locationFields(world.countryId,world.city,districtId,placeId);
  return{id:`institution:${world.id}`,kind:'institution',sourceId:world.id,name:world.name,countryId:world.countryId,city:world.city,active:world.active,...fields,detail:fields.inEverthread?`${postSecondary?'Post-secondary':'School'} life is rooted in ${fields.locationLabel}.`:`Current school world in ${fields.locationLabel}.`};
}

export function workplaceWorldLocation(world:SocialWorld):WorkingEverthreadLocation|undefined{
  if(world.kind!=='workplace'||!world.workplace)return;const rule=workingDistrictRuleForIndustry(world.workplace.industry);const fields=locationFields(world.countryId,world.city,rule.districtId,rule.anchorPlaceId);
  return{id:`workplace:${world.id}`,kind:'workplace',sourceId:world.id,name:world.name,countryId:world.countryId,city:world.city,active:world.active,...fields,detail:fields.inEverthread?`${world.workplace.department} · ${world.workplace.industry} work based in ${fields.locationLabel}.`:`${world.workplace.department} · ${world.workplace.industry} workplace in ${fields.locationLabel}.`};
}

export function businessWorkLocation(state:GameState,business:Business):WorkingEverthreadLocation{
  const countryId=business.countryId??state.character.countryId;const city=business.city??state.character.city;const rule=BUSINESS_DISTRICT_RULES[business.industryId]??{districtId:'eastworks',anchorPlaceId:'loomworks-business-district'};const fields=locationFields(countryId,city,rule.districtId,rule.anchorPlaceId);
  return{id:`business:${business.id}`,kind:'business',sourceId:business.id,name:business.name,countryId,city,active:!business.bankrupt,...fields,detail:fields.inEverthread?`${business.bankrupt?'Former company':'Player-founded company'} based in ${fields.locationLabel}.`:`${business.bankrupt?'Former company':'Player-founded company'} based in ${fields.locationLabel}.`};
}

export function workingEverthreadProjection(state:GameState):WorkingEverthreadProjection{
  return{institution:schoolInstitutionLocation(state),workplaces:activeWorkplaceWorlds(state).map(world=>workplaceWorldLocation(world)!).filter(Boolean),businesses:state.businesses.map(business=>businessWorkLocation(state,business))};
}
