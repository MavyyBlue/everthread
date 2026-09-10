import type { GameState, Npc, RelationshipType, Sex } from '../types/game';
import type { NpcReproductiveSex } from '../types/reproduction';
import { assignNpcIdentity, npcReproductiveSex as projectedNpcReproductiveSex } from './NpcIdentitySystem';

const CURRENT_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);

export const npcReproductiveSex=projectedNpcReproductiveSex;

/** Compatibility wrapper retained for the Run-70 call site; it now assigns the full NPC identity. */
export function assignNpcReproductiveSex(state:GameState,npc:Npc):NpcReproductiveSex {
  return assignNpcIdentity(state,npc).reproductiveSex;
}

export function reproductivePairCanConceive(a:Sex|NpcReproductiveSex,b:Sex|NpcReproductiveSex):boolean {
  return (a==='female'&&b==='male')||(a==='male'&&b==='female');
}

export interface BiologicalChildGate {
  allowed:boolean;
  partner?:Npc;
  partnerSex?:NpcReproductiveSex;
  reason?:string;
}

export function biologicalChildGate(state:GameState,partnerId?:string):BiologicalChildGate {
  const partner=partnerId?state.npcs[partnerId]:undefined;
  const rel=partnerId?state.relationships.find(item=>item.npcId===partnerId):undefined;
  if(!partner||!partner.alive||!rel||!CURRENT_ROMANTIC_TYPES.has(rel.type)){
    return{allowed:false,reason:'A current partner is required for this path.'};
  }
  const partnerSex=projectedNpcReproductiveSex(state,partner);
  if(state.character.sex==='intersex'){
    return{
      allowed:false,partner,partnerSex,
      reason:'Biological family planning for intersex protagonists is not modeled yet. Adoption is still available.',
    };
  }
  if(!reproductivePairCanConceive(state.character.sex,partnerSex)){
    return{
      allowed:false,partner,partnerSex,
      reason:'This pairing cannot conceive through Everthread’s current biological family-planning model. Adoption is still available.',
    };
  }
  return{allowed:true,partner,partnerSex};
}

export function canTryForBiologicalChild(state:GameState,partnerId?:string):boolean {
  return biologicalChildGate(state,partnerId).allowed;
}
