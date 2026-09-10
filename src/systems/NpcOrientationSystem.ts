import { createRng } from '../core/rng';
import type { GameState, GenderIdentity, Npc, Orientation } from '../types/game';
import type { NpcGender } from '../types/reproduction';
import { assignNpcIdentity, npcGender, npcGenderFromCharacterIdentity } from './NpcIdentitySystem';

export type AttractionContext='romantic'|'sexual';

const ALL_GENDERS:readonly NpcGender[]=['female','male','nonbinary'];
const GENDER_WEIGHTS:Readonly<Record<NpcGender,number>>={female:50,male:45,nonbinary:5};

type WeightedOrientation={item:Orientation;weight:number};

/**
 * Everthread's procedural orientation label set. This is deliberately about
 * generator coherence, not a claim that real people must use these labels in
 * any particular way. Authored/existing NPC identities are never rewritten.
 */
function generatedOrientationWeights(gender:NpcGender):readonly WeightedOrientation[]{
  if(gender==='female')return[
    {item:'straight',weight:52},{item:'bisexual',weight:18},{item:'pansexual',weight:12},{item:'lesbian',weight:12},{item:'asexual',weight:6},
  ];
  if(gender==='male')return[
    {item:'straight',weight:52},{item:'bisexual',weight:18},{item:'pansexual',weight:12},{item:'gay',weight:12},{item:'asexual',weight:6},
  ];
  return[
    {item:'bisexual',weight:35},{item:'pansexual',weight:50},{item:'asexual',weight:15},
  ];
}

export function characterRomanticGender(genderIdentity:GenderIdentity):NpcGender{
  return npcGenderFromCharacterIdentity(genderIdentity);
}

export function orientationAttractedToGender(orientation:Orientation,selfGender:NpcGender,targetGender:NpcGender,context:AttractionContext='romantic'){
  if(orientation==='asexual')return context==='romantic';
  if(orientation==='bisexual'||orientation==='pansexual')return true;
  if(orientation==='lesbian')return targetGender==='female';
  if(orientation==='gay')return targetGender===selfGender;
  if(selfGender==='female')return targetGender==='male';
  if(selfGender==='male')return targetGender==='female';
  return targetGender!=='nonbinary';
}

export function generatedOrientationMatchesNpcGender(gender:NpcGender,orientation:Orientation){
  return generatedOrientationWeights(gender).some(entry=>entry.item===orientation);
}

export function assignGeneratedNpcOrientation(state:GameState,npc:Npc,romanticTargetGender?:NpcGender):Orientation{
  const gender=assignNpcIdentity(state,npc).gender;
  const base=generatedOrientationWeights(gender);
  const compatible=romanticTargetGender===undefined
    ?base
    :base.filter(entry=>orientationAttractedToGender(entry.item,gender,romanticTargetGender,'romantic'));
  const choices=compatible.length?compatible:([{item:'pansexual',weight:1}] satisfies WeightedOrientation[]);
  const rng=createRng(`${state.seed}-npc-orientation-${npc.id}${romanticTargetGender?`-toward-${romanticTargetGender}`:''}`);
  npc.sexuality=rng.weighted(choices.map(entry=>({item:entry.item,weight:entry.weight})));
  return npc.sexuality;
}

export function romanticTargetGenders(orientation:Orientation,selfGender:NpcGender):NpcGender[]{
  return ALL_GENDERS.filter(target=>orientationAttractedToGender(orientation,selfGender,target,'romantic'));
}

export function pickRomanticTargetGender(state:GameState,orientation:Orientation,selfGender:NpcGender,key:string):NpcGender{
  const eligible=romanticTargetGenders(orientation,selfGender);
  const pool=eligible.length?eligible:[...ALL_GENDERS];
  const rng=createRng(`${state.seed}-npc-romantic-target-gender-${key}`);
  return rng.weighted(pool.map(item=>({item,weight:GENDER_WEIGHTS[item]})));
}

export function npcNpcRomanticallyCompatible(state:GameState,a:Npc,b:Npc){
  const aGender=npcGender(state,a);const bGender=npcGender(state,b);
  return orientationAttractedToGender(a.sexuality,aGender,bGender,'romantic')&&orientationAttractedToGender(b.sexuality,bGender,aGender,'romantic');
}

export function playerNpcRomanticallyCompatible(state:GameState,npc:Npc){
  const playerGender=characterRomanticGender(state.character.genderIdentity);const targetGender=npcGender(state,npc);
  return orientationAttractedToGender(state.character.orientation,playerGender,targetGender,'romantic')&&orientationAttractedToGender(npc.sexuality,targetGender,playerGender,'romantic');
}

export function playerNpcSexuallyCompatible(state:GameState,npc:Npc){
  const playerGender=characterRomanticGender(state.character.genderIdentity);const targetGender=npcGender(state,npc);
  return orientationAttractedToGender(state.character.orientation,playerGender,targetGender,'sexual')&&orientationAttractedToGender(npc.sexuality,targetGender,playerGender,'sexual');
}

export function orientationLabel(orientation:Orientation){
  return orientation.charAt(0).toUpperCase()+orientation.slice(1);
}
