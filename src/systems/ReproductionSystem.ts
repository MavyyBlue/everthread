import { createRng } from '../core/rng';
import type { GameState, Npc, RelationshipType, Sex } from '../types/game';

const CURRENT_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);

export function npcReproductiveSex(state:GameState,npc:Npc):Sex {
  if(npc.sex)return npc.sex;
  const rng=createRng(`${state.seed}-npc-reproductive-sex-${npc.id}`);
  const roll=rng.int(1,100);
  return roll<=49?'female':roll<=98?'male':'intersex';
}

export function assignNpcReproductiveSex(state:GameState,npc:Npc):Sex {
  npc.sex??=npcReproductiveSex(state,npc);
  return npc.sex;
}

export function reproductivePairCanConceive(a:Sex,b:Sex):boolean {
  return (a==='female'&&b==='male')||(a==='male'&&b==='female');
}

export interface BiologicalChildGate {
  allowed:boolean;
  partner?:Npc;
  partnerSex?:Sex;
  reason?:string;
}

export function biologicalChildGate(state:GameState,partnerId?:string):BiologicalChildGate {
  const partner=partnerId?state.npcs[partnerId]:undefined;
  const rel=partnerId?state.relationships.find(item=>item.npcId===partnerId):undefined;
  if(!partner||!partner.alive||!rel||!CURRENT_ROMANTIC_TYPES.has(rel.type)){
    return{allowed:false,reason:'A current partner is required for this path.'};
  }
  const partnerSex=npcReproductiveSex(state,partner);
  if(!reproductivePairCanConceive(state.character.sex,partnerSex)){
    return{
      allowed:false,partner,partnerSex,
      reason:'Try for child requires one female and one male reproductive partner in Everthread’s current biological-parenting model. Adoption is still available.',
    };
  }
  return{allowed:true,partner,partnerSex};
}

export function canTryForBiologicalChild(state:GameState,partnerId?:string):boolean {
  return biologicalChildGate(state,partnerId).allowed;
}
