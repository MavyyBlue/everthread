import type { GameState, Npc, NpcMemory, Relationship } from '../types/game';
import { actionUsesThisAge } from '../core/actionEconomy';
import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife, processNpcLives } from '../systems/NpcLifeSystem';
import { haveChild } from '../systems/RelationshipSystem';
import {
  ageAdjustedConceptionChance,
  biologicalChildGate,
  reproductiveAgeFactor,
  reproductivePairAgeFactor,
} from '../systems/ReproductionSystem';

function adult(seed:string,sex:'female'|'male'='female'){
  const state=createNewGame({seed,sex,genderIdentity:sex==='female'?'woman':'man',orientation:'pansexual'});
  state.character.age=25;state.currentYear=2051;state.character.secondary.fertility=100;
  return state;
}

function spouse(state:GameState,id:string,sex:'female'|'male',age=25,fertility=100){
  const npc:Npc={id,firstName:'River',lastName:'Fixture',age,alive:true,health:100,happiness:85,wealth:90000,countryId:state.character.countryId,city:state.character.city,
    sexuality:'pansexual',fertility,maritalStatus:'married',gender:sex,reproductiveSex:sex,traits:['responsible','loyal'],hiddenOpinion:90,memories:[],parentIds:[],childIds:[],simulationTier:'full'};
  state.npcs[id]=npc;state.relationships.push({id:`rel-${id}`,npcId:id,type:'spouse',score:95,attraction:90,compatibility:95,yearsKnown:5});ensureNpcLife(state,npc);return npc;
}

function autonomousCouple(seed:string,femaleAge:number,maleAge:number){
  const state=adult(seed,'male');state.character.age=40;state.currentYear=2070;
  const female:Npc={id:'family-female',firstName:'Ari',lastName:'Fixture',age:femaleAge,alive:true,health:100,happiness:90,wealth:100000,countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:100,maritalStatus:'married',gender:'female',reproductiveSex:'female',traits:['responsible','loyal','romantic'],hiddenOpinion:70,memories:[],parentIds:[],childIds:[],partnerId:'family-male',simulationTier:'full'};
  const male:Npc={id:'family-male',firstName:'Sam',lastName:'Fixture',age:maleAge,alive:true,health:100,happiness:90,wealth:100000,countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:100,maritalStatus:'married',gender:'male',reproductiveSex:'male',traits:['responsible','loyal','romantic'],hiddenOpinion:70,memories:[],parentIds:[],childIds:[],partnerId:'family-female',simulationTier:'full'};
  const marriage:NpcMemory={id:'marriage-memory',year:state.currentYear-8,age:Math.max(18,femaleAge-8),kind:'marriage',sentiment:9,summary:'Married Sam Fixture.',permanent:true};female.memories.push(marriage);
  male.memories.push({...marriage,id:'marriage-memory-male',summary:'Married Ari Fixture.'});
  state.npcs[female.id]=female;state.npcs[male.id]=male;
  const rel:Relationship={id:'family-rel',npcId:female.id,type:'sibling',score:88,attraction:0,compatibility:86,yearsKnown:35};state.relationships.push(rel);
  ensureNpcLife(state,female);ensureNpcLife(state,male);return{state,female,male};
}

export function runAgeAwareReproductionRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Age-aware reproduction regression failed: ${message}`);}

  verify(reproductiveAgeFactor('female',25)===1&&reproductiveAgeFactor('male',25)===1,'young-adult reproductive-age factors should preserve the existing fertility baseline');
  verify(reproductiveAgeFactor('female',35)<reproductiveAgeFactor('female',30)&&reproductiveAgeFactor('female',40)<reproductiveAgeFactor('female',35),'female reproductive-age pressure should increase through the later thirties and forties');
  verify(reproductiveAgeFactor('female',50)<.02&&reproductiveAgeFactor('female',53)===0,'female reproductive-age curve should make conception exceptionally unlikely by 50 and unavailable from 53');
  verify(reproductiveAgeFactor('male',60)>reproductiveAgeFactor('female',60)&&reproductiveAgeFactor('male',60)>0,'male reproductive-age decline should remain slower rather than using the old shared age cutoff');
  verify(reproductivePairAgeFactor('female',25,'male',25)===1&&reproductivePairAgeFactor('female',25,'female',25)===0,'pair age factor should preserve reproductive-sex compatibility authority');

  const youngChance=ageAdjustedConceptionChance({sex:'female',age:25,fertility:100},{sex:'male',age:25,fertility:100});
  const age40Chance=ageAdjustedConceptionChance({sex:'female',age:40,fertility:100},{sex:'male',age:25,fertility:100});
  const age50Chance=ageAdjustedConceptionChance({sex:'female',age:50,fertility:100},{sex:'male',age:25,fertility:100});
  const age51Chance=ageAdjustedConceptionChance({sex:'female',age:51,fertility:100},{sex:'male',age:51,fertility:100});
  verify(Math.abs(youngChance-.92)<1e-9,'young high-fertility annual conception chance should preserve the pre-Slice-4 92% ceiling');
  verify(age40Chance<youngChance*.5&&age40Chance>age50Chance,'age-adjusted conception chance should materially decline without replacing the underlying fertility stat');
  verify(age50Chance<.02&&age51Chance<.01,'high stored fertility should not overpower the late reproductive-age pressure exposed by the age-51 diagnostic pregnancy');

  const femaleState=adult('age-aware-player-female','female');const malePartner=spouse(femaleState,'male-partner','male',25,100);
  const youngGate=biologicalChildGate(femaleState,malePartner.id);
  verify(youngGate.allowed&&Math.abs((youngGate.conceptionChance??0)-.92)<1e-9,'player family-planning gate should expose the young-adult baseline chance');
  femaleState.character.age=40;const laterGate=biologicalChildGate(femaleState,malePartner.id);
  verify(laterGate.allowed&&(laterGate.conceptionChance??1)<(youngGate.conceptionChance??0),'the same player fertility stats should receive age pressure as the protagonist ages');
  femaleState.character.age=53;const terminalGate=biologicalChildGate(femaleState,malePartner.id);
  verify(!terminalGate.allowed&&terminalGate.ageFactor===0&&terminalGate.conceptionChance===0,'player biological family planning should stop once the shared reproductive-age curve reaches zero');
  const blockedRng=femaleState.rngCounter;const blocked=haveChild(femaleState,malePartner.id,false);
  verify(!blocked.success&&femaleState.rngCounter===blockedRng&&actionUsesThisAge(femaleState,'family.child_attempt')===0,'age-ineligible biological attempts should fail before consuming action economy or RNG');

  const adoptionState=adult('age-aware-adoption','female');adoptionState.character.age=55;const adoptionPartner=spouse(adoptionState,'adoption-partner','male',57,100);
  const adopted=haveChild(adoptionState,adoptionPartner.id,true);
  verify(adopted.success&&adoptionState.relationships.some(rel=>rel.type==='child'),'player adoption should remain available when biological conception is age-ineligible');
  verify(actionUsesThisAge(adoptionState,'family.adoption')===1&&actionUsesThisAge(adoptionState,'family.child_attempt')===0,'adoption should retain its separate action-economy policy');

  const maleState=adult('age-aware-older-male','male');maleState.character.age=60;const femalePartner=spouse(maleState,'younger-female','female',25,100);
  const olderMaleGate=biologicalChildGate(maleState,femalePartner.id);
  verify(olderMaleGate.allowed&&(olderMaleGate.conceptionChance??0)>0,'an older male protagonist with a reproductively viable female partner should no longer be blocked by a shared age cutoff');

  const nonbinaryState=adult('age-aware-nonbinary','female');const nonbinaryPartner=spouse(nonbinaryState,'nonbinary-partner','male',25,100);nonbinaryPartner.gender='nonbinary';nonbinaryPartner.reproductiveSex='male';
  verify(biologicalChildGate(nonbinaryState,nonbinaryPartner.id).allowed,'nonbinary NPCs should continue using their established reproductive-sex authority');

  let pregnancyState:GameState|undefined;let pregnancyPartner:Npc|undefined;
  for(let index=0;index<30&&!pregnancyState;index++){
    const candidate=adult(`age-aware-pregnancy-${index}`,'female');const partner=spouse(candidate,`pregnancy-partner-${index}`,'male',25,100);const result=haveChild(candidate,partner.id,false);
    if(result.success){pregnancyState=candidate;pregnancyPartner=partner;}
  }
  verify(!!pregnancyState&&!!pregnancyPartner,'young-adult high-fertility setup should still be able to create a pregnancy');
  verify(pregnancyState!.familyPlanning.pregnancy?.dueAge===pregnancyState!.character.age+1,'age-aware chance should not alter established one-year pregnancy timing');
  verify(actionUsesThisAge(pregnancyState!,'family.child_attempt')===1,'successful biological attempts should retain ordinary child-attempt action consumption');

  let youngAutonomousBirth=false;
  for(let index=0;index<20&&!youngAutonomousBirth;index++){
    const fixture=autonomousCouple(`age-aware-autonomous-young-${index}`,29,54);processNpcLives(fixture.state);
    youngAutonomousBirth=fixture.female.memories.some(memory=>memory.kind==='child_birth');
  }
  verify(youngAutonomousBirth,'autonomous family pressure should still allow a younger female + older male couple to have a biological child');

  let oldFemaleBiologicalBirth=false;
  for(let index=0;index<20;index++){
    const fixture=autonomousCouple(`age-aware-autonomous-late-${index}`,53,30);processNpcLives(fixture.state);
    if(fixture.female.memories.some(memory=>memory.kind==='child_birth')){oldFemaleBiologicalBirth=true;break;}
  }
  verify(!oldFemaleBiologicalBirth,'autonomous family pressure must not force a biological child after the reproductive-age curve reaches zero');

  return checks;
}
