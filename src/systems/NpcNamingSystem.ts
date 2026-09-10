import { getNamePool, getNpcFirstNames, npcGenderForFirstName } from '../data/names';
import type { SeededRng } from '../core/rng';
import type { GameState } from '../types/game';
import type { NpcGender } from '../types/reproduction';

export interface CastName {
  firstName:string;
  lastName:string;
}

export interface CollisionAwareNameOptions {
  gender?:NpcGender;
  fixedLastName?:string;
}

export interface PickNpcNameOptions extends CollisionAwareNameOptions {
  countryId?:string;
}

function normalizedPart(value:string){return value.trim().normalize('NFKC').toLowerCase();}
function fullNameKey(firstName:string,lastName:string){return `${normalizedPart(firstName)}\u0000${normalizedPart(lastName)}`;}

function circularCandidates(pool:readonly string[],initial:string):string[]{
  const index=pool.indexOf(initial);
  if(index<0)return[initial,...pool.filter(value=>value!==initial)];
  return [...pool.slice(index),...pool.slice(0,index)];
}

function betterScore(candidate:readonly number[],current:readonly number[]|undefined){
  if(!current)return true;
  for(let i=0;i<candidate.length;i+=1){if(candidate[i]!==current[i])return candidate[i]<current[i];}
  return false;
}

/**
 * Resolve a creation-time NPC name against an existing cast without consuming RNG.
 * The original first-name draw establishes the NPC gender bucket. Collision cleanup
 * may choose another name only inside that same bucket, preserving 50/45/5 weighting.
 */
export function resolveCollisionAwareName(
  countryId:string,
  initialFirstName:string,
  initialLastName:string,
  existingNames:readonly CastName[],
  options:CollisionAwareNameOptions={},
):CastName{
  const pool=getNamePool(countryId);
  const gender=options.gender??npcGenderForFirstName(countryId,initialFirstName);
  const firstPool=gender?getNpcFirstNames(countryId,gender):pool.first;
  const firstCandidates=circularCandidates(firstPool,initialFirstName);
  const lastSeed=options.fixedLastName??initialLastName;
  const lastCandidates=options.fixedLastName?[options.fixedLastName]:circularCandidates(pool.last,lastSeed);
  const firstCounts=new Map<string,number>();
  const fullCounts=new Map<string,number>();
  for(const name of existingNames){
    const firstKey=normalizedPart(name.firstName);
    firstCounts.set(firstKey,(firstCounts.get(firstKey)??0)+1);
    const fullKey=fullNameKey(name.firstName,name.lastName);
    fullCounts.set(fullKey,(fullCounts.get(fullKey)??0)+1);
  }
  let best:CastName={firstName:initialFirstName,lastName:lastSeed};
  let bestScore:readonly number[]|undefined;
  for(let firstIndex=0;firstIndex<firstCandidates.length;firstIndex+=1){
    const firstName=firstCandidates[firstIndex];
    const firstCount=firstCounts.get(normalizedPart(firstName))??0;
    for(let lastIndex=0;lastIndex<lastCandidates.length;lastIndex+=1){
      const lastName=lastCandidates[lastIndex];
      const fullCount=fullCounts.get(fullNameKey(firstName,lastName))??0;
      // First-name repetition is the visible collision players notice most. Exact
      // full-name repetition breaks ties, then circular distance keeps ordinary
      // unique random draws unchanged and gives saturated pools a stable fallback.
      const score=[firstCount,fullCount,firstIndex,lastIndex] as const;
      if(betterScore(score,bestScore)){best={firstName,lastName};bestScore=score;}
    }
  }
  return best;
}

function stateCastNames(state:GameState):CastName[]{
  return[
    {firstName:state.character.firstName,lastName:state.character.lastName},
    ...Object.values(state.npcs).map(npc=>({firstName:npc.firstName,lastName:npc.lastName})),
  ];
}

/**
 * Make the same initial random name draw as ordinary generation, then resolve any
 * avoidable collision deterministically. No retry RNG is consumed for collisions.
 */
export function pickCollisionAwareNpcName(state:GameState,rng:SeededRng,options:PickNpcNameOptions={}):CastName{
  const countryId=options.countryId??state.character.countryId;
  const pool=getNamePool(countryId);
  const firstPool=options.gender?getNpcFirstNames(countryId,options.gender):pool.first;
  const initialFirstName=rng.pick(firstPool);
  const initialLastName=options.fixedLastName??rng.pick(pool.last);
  return resolveCollisionAwareName(countryId,initialFirstName,initialLastName,stateCastNames(state),options);
}
