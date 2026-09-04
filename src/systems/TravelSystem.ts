import { countries, countryById } from '../data/countries';
import type { EngineResult, GameState } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';

export function travel(state:GameState,countryId:string,city?:string,withFamily=false):EngineResult {
  const minimumAge=withFamily?5:18;
  if(state.character.age<minimumAge)return{success:false,messages:[{text:withFamily?'Family trips become available later in childhood.':'Independent vacations become available at age 18.'}]};
  const country=countryById[countryId];if(!country)return{success:false,messages:[{text:'Destination not found.'}]};
  const destination=city&&country.cities.includes(city)?city:country.cities[0]!;const distancePremium=countryId===state.character.countryId?1:2.3;const cost=Math.round((700+state.character.age*8)*distancePremium*(withFamily?1.8:1));
  let guardian:GameState['npcs'][string]|undefined;
  if(withFamily&&state.character.age<18){
    guardian=state.relationships.map(rel=>({rel,npc:state.npcs[rel.npcId]})).filter(({rel,npc})=>['parent','stepparent','grandparent'].includes(rel.type)&&npc?.alive).map(({npc})=>npc!).sort((a,b)=>b.wealth-a.wealth)[0];
    if(!guardian)return{success:false,messages:[{text:'A living parent or guardian is required for a family trip while you are under 18.'}]};
    if(guardian.wealth<cost)return{success:false,messages:[{text:'Your household cannot afford that family trip right now.'}]};
  } else if(state.finances.cash<cost)return{success:false,messages:[{text:`This trip requires about ${cost.toLocaleString()} in game currency.`}]};
  const gate=consumeAction(state,{policy:'travel.trip'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  if(guardian)guardian.wealth-=cost;else state.finances.cash-=cost;
  state.travel.visitedCountries=[...new Set([...state.travel.visitedCountries,countryId])];state.travel.visitedCities=[...new Set([...state.travel.visitedCities,`${destination}, ${country.name}`])];state.character.stats.happiness=clamp(state.character.stats.happiness+6);state.character.secondary.stress=clamp(state.character.secondary.stress-4);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'travel',importance:2,text:`You traveled to ${destination}, ${country.name}${withFamily?' with family':''}.`,moneyDelta:guardian?undefined:-cost});return{success:true,messages:[{text:`Trip complete: ${destination}, ${country.name}.`}]};
}

export function emigrate(state:GameState,countryId:string,city?:string):EngineResult {if(state.character.age<18)return{success:false,messages:[{text:'You must be an adult to emigrate independently.'}]};const country=countryById[countryId];if(!country)return{success:false,messages:[{text:'Country not found.'}]};if(countryId===state.character.countryId)return{success:false,messages:[{text:'You already live in that country.'}]};const convictions=state.legal.criminalRecord.filter(r=>r.convicted).length;const eligibility=state.character.stats.intelligence*.25+Math.min(30,state.finances.cash/10000)+state.character.secondary.reputation*.2-convictions*15;if(eligibility<30)return{success:false,messages:[{text:'Your current immigration eligibility is too low under the game’s simplified system.'}]};const gate=consumeAction(state,{policy:'travel.emigrate'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const destination=city&&country.cities.includes(city)?city:country.cities[0]!;state.character.countryId=countryId;state.character.city=destination;state.travel.emigrations+=1;state.travel.visitedCountries=[...new Set([...state.travel.visitedCountries,countryId])];state.travel.visitedCities=[...new Set([...state.travel.visitedCities,`${destination}, ${country.name}`])];state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'travel',importance:3,text:`You emigrated to ${destination}, ${country.name}.`});return{success:true,messages:[{text:`You now live in ${destination}. Salaries, taxes, education, and healthcare use ${country.name}'s game balance profile.`}]};}

export function takeLicenseTest(state:GameState,kind:'driving'|'boating'|'pilot',score:number):EngineResult {const minAge={driving:16,boating:16,pilot:18}[kind];if(state.character.age<minAge)return{success:false,messages:[{text:`You must be at least ${minAge} for this license.`}]};if(state.travel.licenses[kind])return{success:false,messages:[{text:`You already hold the ${kind} license.`}]};const gate=consumeAction(state,{policy:'license.test',target:kind});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-${kind}-license`,state.rngCounter);const target=kind==='pilot'?72:kind==='boating'?62:58;const effective=score+state.character.stats.intelligence*.12+state.character.secondary.discipline*.08+rng.int(-5,5);const success=effective>=target;if(success){state.travel.licenses[kind]=true;if(kind==='driving')state.flags.drivingLicense=true;if(kind==='boating')state.flags.boatLicense=true;if(kind==='pilot')state.flags.pilotLicense=true;}state.rngCounter=rng.counter();return{success,messages:[{text:success?`You passed the ${kind} license test.`:`You did not pass the ${kind} license test this time.`}]};}

export function randomDestination(state:GameState){const rng=createRng(state.seed,state.rngCounter);return rng.pick(countries);}
