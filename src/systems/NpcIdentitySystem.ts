import { createRng, type SeededRng } from '../core/rng';
import { npcGenderForFirstName } from '../data/names';
import type { GameState, GenderIdentity, Npc, Sex } from '../types/game';
import type { NpcGender, NpcReproductiveSex } from '../types/reproduction';

export const NPC_GENDER_WEIGHTS = Object.freeze({female:50,male:45,nonbinary:5} as const);

export interface NpcIdentity {
  gender:NpcGender;
  reproductiveSex:NpcReproductiveSex;
}

function weightedGender(rng:SeededRng):NpcGender {
  return rng.weighted<NpcGender>([
    {item:'female',weight:NPC_GENDER_WEIGHTS.female},
    {item:'male',weight:NPC_GENDER_WEIGHTS.male},
    {item:'nonbinary',weight:NPC_GENDER_WEIGHTS.nonbinary},
  ]);
}

export function npcGender(state:GameState,npc:Npc):NpcGender {
  if(npc.gender)return npc.gender;
  // Preserve the short-lived Run-70 binary reproductive assignment on legacy saves.
  // New NPCs never reach this branch because their generated name and gender agree.
  if(npc.sex==='female'||npc.sex==='male')return npc.sex;
  const named=npcGenderForFirstName(npc.countryId,npc.firstName);
  if(named)return named;
  return weightedGender(createRng(`${state.seed}-npc-gender-${npc.id}`));
}

function nonbinaryReproductiveSex(state:GameState,npc:Npc):NpcReproductiveSex {
  if(npc.sex==='female'||npc.sex==='male')return npc.sex;
  const rng=createRng(`${state.seed}-npc-nonbinary-reproductive-sex-${npc.id}`);
  return rng.chance(.5)?'female':'male';
}

export function npcReproductiveSex(state:GameState,npc:Npc):NpcReproductiveSex {
  if(npc.reproductiveSex)return npc.reproductiveSex;
  const gender=npcGender(state,npc);
  if(gender==='female'||gender==='male')return gender;
  return nonbinaryReproductiveSex(state,npc);
}

export function assignNpcIdentity(state:GameState,npc:Npc):NpcIdentity {
  const gender=npcGender(state,npc);
  const reproductiveSex=gender==='female'||gender==='male'?gender:npcReproductiveSex(state,npc);
  npc.gender=gender;
  npc.reproductiveSex=reproductiveSex;
  // `sex` was a short-lived Run-70 NPC-only compatibility field. Identity is now
  // represented by gender + reproductiveSex, reserving `Sex.intersex` for players.
  if(npc.sex!==undefined)delete npc.sex;
  return{gender,reproductiveSex};
}

export function npcGenderLabel(gender:NpcGender):string {
  return gender==='female'?'Female':gender==='male'?'Male':'Non-binary';
}

export function npcReproductiveSexLabel(sex:NpcReproductiveSex):string {
  return sex==='female'?'Female':'Male';
}

export function characterIdentityFromNpc(state:GameState,npc:Npc):{sex:Exclude<Sex,'intersex'>;genderIdentity:GenderIdentity} {
  const gender=npcGender(state,npc);
  return{
    sex:npcReproductiveSex(state,npc),
    genderIdentity:gender==='female'?'woman':gender==='male'?'man':'nonbinary',
  };
}

export function npcGenderFromCharacterIdentity(genderIdentity:GenderIdentity):NpcGender {
  return genderIdentity==='woman'?'female':genderIdentity==='man'?'male':'nonbinary';
}
