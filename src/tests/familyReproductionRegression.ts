import { actionUsesThisAge } from '../core/actionEconomy';
import { createNewGame } from '../systems/CharacterSystem';
import { haveChild, meetPotentialPartner } from '../systems/RelationshipSystem';
import { canTryForBiologicalChild, npcReproductiveSex, reproductivePairCanConceive } from '../systems/ReproductionSystem';
import type { GameState, Npc, Sex } from '../types/game';

function adult(seed:string){
  const state=createNewGame({seed,sex:'female',genderIdentity:'woman'});
  state.character.age=28;state.currentYear=2054;state.character.secondary.fertility=100;
  return state;
}

function partner(state:GameState,id:string,sex:Sex):Npc{
  const npc:Npc={
    id,firstName:'Alex',lastName:'Fixture',age:29,alive:true,health:90,happiness:80,wealth:15000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:100,maritalStatus:'married',sex,
    traits:['loyal'],hiddenOpinion:80,memories:[],parentIds:[],childIds:[],
  };
  state.npcs[id]=npc;
  state.relationships.push({id:`rel-${id}`,npcId:id,type:'spouse',score:90,attraction:90,compatibility:90,yearsKnown:5});
  return npc;
}

export function runFamilyReproductionRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Family reproduction regression failed: ${message}`);}

  verify(reproductivePairCanConceive('female','male'),'female/male pairing should be biologically compatible');
  verify(reproductivePairCanConceive('male','female'),'male/female pairing should be biologically compatible regardless of protagonist order');
  verify(!reproductivePairCanConceive('female','female')&&!reproductivePairCanConceive('male','male'),'same-sex pairings should not use the biological Try for child path');
  verify(!reproductivePairCanConceive('intersex','female')&&!reproductivePairCanConceive('intersex','male'),'intersex reproductive capability stays conservative until a richer fertility model exists');

  const femalePair=adult('female-female-parenting');const wife=partner(femalePair,'wife','female');
  verify(!canTryForBiologicalChild(femalePair,wife.id),'female protagonist + female spouse should not expose Try for child');
  const blocked=haveChild(femalePair,wife.id,false);
  verify(!blocked.success&&!femalePair.familyPlanning.pregnancy,'female/female biological attempt should be blocked without creating pregnancy');
  verify(actionUsesThisAge(femalePair,'family.child_attempt')===0,'an incompatible biological pairing should not consume the yearly child-attempt action');

  const malePartnerState=adult('female-male-parenting');const husband=partner(malePartnerState,'husband','male');
  verify(canTryForBiologicalChild(malePartnerState,husband.id),'female protagonist + male spouse should expose Try for child');

  const nonbinary=adult('nonbinary-sex-aware');nonbinary.character.genderIdentity='nonbinary';nonbinary.character.sex='female';const nbPartner=partner(nonbinary,'nb-partner','male');
  verify(canTryForBiologicalChild(nonbinary,nbPartner.id),'nonbinary identity should defer reproductive compatibility to biological sex rather than the gender label');

  const adoption=adult('same-sex-adoption');const adoptiveWife=partner(adoption,'adoptive-wife','female');
  const adoptionResult=haveChild(adoption,adoptiveWife.id,true);
  const adoptedRel=adoption.relationships.find(rel=>rel.type==='child');const adopted=adoptedRel?adoption.npcs[adoptedRel.npcId]:undefined;
  verify(adoptionResult.success&&!!adopted,'same-sex partnered adoption should remain available');
  verify(Boolean(adopted?.parentIds.includes(adoption.character.id)&&adopted?.parentIds.includes(adoptiveWife.id)&&adoptiveWife.childIds.includes(adopted!.id)),'partnered adoption should record both adults as parents bidirectionally');

  const fallbackA=adult('legacy-npc-sex');const legacyA: Npc={...partner(fallbackA,'legacy-partner','female')};delete legacyA.sex;
  const beforeCounter=fallbackA.rngCounter;const first=npcReproductiveSex(fallbackA,legacyA);const second=npcReproductiveSex(fallbackA,legacyA);
  verify(first===second&&fallbackA.rngCounter===beforeCounter,'legacy NPC reproductive sex fallback should be deterministic without consuming simulation RNG');

  const meeting=adult('new-romantic-sex');const beforeIds=new Set(Object.keys(meeting.npcs));meetPotentialPartner(meeting);const met=Object.values(meeting.npcs).find(npc=>!beforeIds.has(npc.id));
  verify(Boolean(met?.sex),'new potential partners should receive an explicit reproductive sex when created');

  return checks;
}
