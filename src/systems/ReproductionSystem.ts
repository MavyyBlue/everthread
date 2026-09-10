import type { GameState, Npc, RelationshipType, Sex } from '../types/game';
import type { NpcReproductiveSex } from '../types/reproduction';
import { clamp } from '../core/math';
import { assignNpcIdentity, npcReproductiveSex as projectedNpcReproductiveSex } from './NpcIdentitySystem';

const CURRENT_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);

type ReproductiveAgePoint = readonly [age:number,factor:number];

// Gameplay fertility curves: age modifies the existing fertility stat rather than replacing it.
// These are intentionally smooth simulation weights, not a clinical prediction for an individual.
const FEMALE_REPRODUCTIVE_AGE_CURVE:readonly ReproductiveAgePoint[]=[
  [16,.75],[18,.90],[20,1],[29,1],[32,.92],[35,.78],[38,.60],[40,.42],[42,.27],[44,.14],[46,.07],[48,.03],[50,.012],[52,.003],[53,0],
];
const MALE_REPRODUCTIVE_AGE_CURVE:readonly ReproductiveAgePoint[]=[
  [16,.82],[18,.92],[20,1],[39,1],[45,.96],[50,.90],[55,.82],[60,.72],[65,.62],[70,.50],[75,.38],[80,.27],[90,.12],[100,.05],[110,.02],[120,0],
];

export const npcReproductiveSex=projectedNpcReproductiveSex;

/** Compatibility wrapper retained for the Run-70 call site; it now assigns the full NPC identity. */
export function assignNpcReproductiveSex(state:GameState,npc:Npc):NpcReproductiveSex {
  return assignNpcIdentity(state,npc).reproductiveSex;
}

export function reproductivePairCanConceive(a:Sex|NpcReproductiveSex,b:Sex|NpcReproductiveSex):boolean {
  return (a==='female'&&b==='male')||(a==='male'&&b==='female');
}

function interpolateAgeCurve(age:number,curve:readonly ReproductiveAgePoint[]):number {
  const normalized=Math.max(0,Number.isFinite(age)?age:0);
  if(normalized<curve[0]![0])return 0;
  for(let index=1;index<curve.length;index++){
    const [rightAge,rightFactor]=curve[index]!;
    const [leftAge,leftFactor]=curve[index-1]!;
    if(normalized>rightAge)continue;
    if(rightAge===leftAge)return rightFactor;
    const progress=(normalized-leftAge)/(rightAge-leftAge);
    return clamp(leftFactor+(rightFactor-leftFactor)*progress,0,1);
  }
  return clamp(curve.at(-1)![1],0,1);
}

/** Age pressure applied to a reproductive role. Intersex protagonist biology remains separately unmodeled. */
export function reproductiveAgeFactor(sex:Sex|NpcReproductiveSex,age:number):number {
  if(sex==='intersex')return 0;
  return interpolateAgeCurve(age,sex==='female'?FEMALE_REPRODUCTIVE_AGE_CURVE:MALE_REPRODUCTIVE_AGE_CURVE);
}

export function reproductivePairAgeFactor(aSex:Sex|NpcReproductiveSex,aAge:number,bSex:Sex|NpcReproductiveSex,bAge:number):number {
  if(!reproductivePairCanConceive(aSex,bSex))return 0;
  return clamp(reproductiveAgeFactor(aSex,aAge)*reproductiveAgeFactor(bSex,bAge),0,1);
}

/**
 * Player-facing annual conception chance. The pre-Slice-4 fertility formula is preserved as the
 * young-adult baseline, then multiplied by the shared reproductive-age curve. No extra RNG draw.
 */
export function ageAdjustedConceptionChance(
  a:{sex:Sex|NpcReproductiveSex;age:number;fertility:number},
  b:{sex:Sex|NpcReproductiveSex;age:number;fertility:number},
):number {
  if(!reproductivePairCanConceive(a.sex,b.sex))return 0;
  const baseline=clamp((a.fertility+b.fertility)/200,.08,.92);
  return clamp(baseline*reproductivePairAgeFactor(a.sex,a.age,b.sex,b.age),0,.92);
}

export interface BiologicalChildGate {
  allowed:boolean;
  partner?:Npc;
  partnerSex?:NpcReproductiveSex;
  ageFactor?:number;
  conceptionChance?:number;
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
  const ageFactor=reproductivePairAgeFactor(state.character.sex,state.character.age,partnerSex,partner.age);
  if(ageFactor<=0){
    return{
      allowed:false,partner,partnerSex,ageFactor,conceptionChance:0,
      reason:'Biological conception is no longer modeled as viable at this reproductive age. Adoption is still available.',
    };
  }
  const conceptionChance=ageAdjustedConceptionChance(
    {sex:state.character.sex,age:state.character.age,fertility:state.character.secondary.fertility},
    {sex:partnerSex,age:partner.age,fertility:partner.fertility},
  );
  return{allowed:true,partner,partnerSex,ageFactor,conceptionChance};
}

export function canTryForBiologicalChild(state:GameState,partnerId?:string):boolean {
  return biologicalChildGate(state,partnerId).allowed;
}
