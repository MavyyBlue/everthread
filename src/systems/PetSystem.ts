import { petVariants } from '../data/assets';
import type { EngineResult, GameState } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';

const petNames=['Mochi','Pepper','Bean','Sunny','Nova','Pip','Clover','Miso','Juniper','Scout','Maple','Echo','Biscuit','Pixel','Waffles','Luna','Otis','Birdie','Noodle','Toast'];

export function adoptPet(state:GameState,variantId:string,name?:string):EngineResult {
  const def=petVariants.find(p=>p.id===variantId);if(!def)return{success:false,messages:[{text:'Pet type not found.'}]};if(def.legalTier==='restricted'&&state.character.age<21)return{success:false,messages:[{text:'Restricted exotic pets require age 21 under the game’s simplified rules.'}]};if(state.finances.cash<def.price)return{success:false,messages:[{text:`You need ${def.price.toLocaleString()} in game currency.`}]};
  const rng=createRng(`${state.seed}-pet`,state.rngCounter);state.finances.cash-=def.price;const petName=name?.trim()||rng.pick(petNames);state.pets.push({id:makeStateId(state,'pet'),variantId:def.id,name:petName,species:def.species,breed:def.breed,age:0,health:rng.int(75,100),happiness:rng.int(65,95),craziness:rng.int(5,95),relationship:55,alive:true});state.rngCounter=rng.counter();return{success:true,messages:[{text:`You adopted ${petName}, a ${def.breed}.`}]};
}

export function processPetsYear(state:GameState){const rng=createRng(`${state.seed}-pets-year`,state.rngCounter);for(const p of state.pets){if(!p.alive)continue;p.age+=1;const def=petVariants.find(v=>v.id===p.variantId);const max=def?.lifespan[1]??15;p.health=clamp(p.health-(p.age>max*.65?rng.int(1,5):rng.int(0,2)));p.happiness=clamp(p.happiness+rng.int(-3,2));const deathChance=p.age>(def?.lifespan[0]??8)?Math.max(.005,(p.age-(def?.lifespan[0]??8))*.045+(25-p.health)*.01):0;if(rng.chance(deathChance)){p.alive=false;state.character.stats.happiness=clamp(state.character.stats.happiness-8);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text:`Your pet ${p.name} died at age ${p.age}.`});}}
state.rngCounter=rng.counter();}

export function petInteraction(state:GameState, petId:string, action:'walk'|'feed'|'treat'|'vet'|'spend_time'|'rehome'):EngineResult {
  const p = state.pets.find(p=>p.id===petId);
  if(!p || !p.alive) return {success:false,messages:[{text:'That pet is unavailable.'}]};
  if(action==='rehome'){
    p.alive=false;
    state.character.stats.happiness=clamp(state.character.stats.happiness-4);
    return {success:true,messages:[{text:`You rehomed ${p.name}.`}]};
  }
  if(action==='vet'){
    const cost=300;
    if(state.finances.cash<cost)return{success:false,messages:[{text:'You cannot afford the vet visit.'}]};
    state.finances.cash-=cost;p.health=clamp(p.health+12);p.relationship=clamp(p.relationship+3);
  }
  if(action==='walk'){p.happiness=clamp(p.happiness+6);p.relationship=clamp(p.relationship+4);state.health.fitness=clamp(state.health.fitness+1);}
  if(action==='feed'){p.health=clamp(p.health+2);p.happiness=clamp(p.happiness+3);}
  if(action==='treat'){state.finances.cash-=15;p.happiness=clamp(p.happiness+5);p.relationship=clamp(p.relationship+2);}
  if(action==='spend_time'){p.happiness=clamp(p.happiness+7);p.relationship=clamp(p.relationship+6);state.character.stats.happiness=clamp(state.character.stats.happiness+3);}
  return{success:true,messages:[{text:`You ${action.replace('_',' ')} with ${p.name}.`}]};
}
