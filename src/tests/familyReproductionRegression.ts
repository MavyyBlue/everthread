import { actionUsesThisAge } from '../core/actionEconomy';
import { getNamePool, getNpcFirstNames, npcFirstNameGenderCounts, npcGenderForFirstName } from '../data/names';
import { createNewGame } from '../systems/CharacterSystem';
import { processNpcLives } from '../systems/NpcLifeSystem';
import { haveChild, meetPotentialPartner } from '../systems/RelationshipSystem';
import { canTryForBiologicalChild, npcReproductiveSex, reproductivePairCanConceive } from '../systems/ReproductionSystem';
import { assignNpcIdentity, characterIdentityFromNpc, npcGender, NPC_GENDER_WEIGHTS } from '../systems/NpcIdentitySystem';
import type { GameState, Npc } from '../types/game';
import type { NpcGender, NpcReproductiveSex } from '../types/reproduction';

function adult(seed:string){
  const state=createNewGame({seed,sex:'female',genderIdentity:'woman'});
  state.character.age=28;state.currentYear=2054;state.character.secondary.fertility=100;
  return state;
}

function partner(state:GameState,id:string,gender:NpcGender,reproductiveSex:NpcReproductiveSex):Npc{
  const npc:Npc={
    id,firstName:getNpcFirstNames(state.character.countryId,gender)[0]!,lastName:'Fixture',age:29,alive:true,health:90,happiness:80,wealth:15000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:100,maritalStatus:'married',gender,reproductiveSex,
    traits:['loyal'],hiddenOpinion:80,memories:[],parentIds:[],childIds:[],
  };
  state.npcs[id]=npc;
  state.relationships.push({id:`rel-${id}`,npcId:id,type:'spouse',score:90,attraction:90,compatibility:90,yearsKnown:5});
  return npc;
}

export function runFamilyReproductionRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Family reproduction regression failed: ${message}`);}

  verify(NPC_GENDER_WEIGHTS.female===50&&NPC_GENDER_WEIGHTS.male===45&&NPC_GENDER_WEIGHTS.nonbinary===5,'NPC gender weights should remain 50/45/5');
  for(const countryId of ['us','mx','fr','in','jp','za','eg']){
    const counts=npcFirstNameGenderCounts(countryId);
    const pool=getNamePool(countryId);
    verify(counts.female===10&&counts.male===9&&counts.nonbinary===1&&pool.first.length===20,`${countryId} name pool should encode exact 50/45/5 default gender odds`);
    verify(pool.first.every(name=>npcGenderForFirstName(countryId,name)!==undefined),`${countryId} active NPC names should all resolve to a gender`);
  }

  const initial=createNewGame({seed:'npc-identity-init'});
  verify(Object.values(initial.npcs).every(npc=>Boolean(npc.gender&&npc.reproductiveSex)&&npc.sex===undefined),'initial NPCs should persist gender and reproductive sex without the legacy NPC sex field');

  const named=adult('name-gender-coherence');
  const maya:Npc={id:'maya',firstName:'Maya',lastName:'Fixture',age:30,alive:true,health:90,happiness:80,wealth:0,countryId:'us',city:named.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',traits:[],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]};
  assignNpcIdentity(named,maya);
  verify(maya.gender==='female'&&maya.reproductiveSex==='female','binary NPC identity should follow its gender-matched name and reproductive sex');

  const nonbinaryState=adult('nonbinary-reproductive-odds');
  let female=0;let male=0;
  for(let index=0;index<1000;index++){
    const npc:Npc={id:`nb-${index}`,firstName:'Avery',lastName:'Fixture',age:25,alive:true,health:80,happiness:70,wealth:0,countryId:'us',city:nonbinaryState.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',gender:'nonbinary',traits:[],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]};
    const sex=npcReproductiveSex(nonbinaryState,npc);if(sex==='female')female+=1;else male+=1;
  }
  verify(female>450&&female<550&&male===1000-female,'nonbinary NPC reproductive sex should use a deterministic near-even 50/50 female/male split');

  verify(reproductivePairCanConceive('female','male'),'female/male pairing should be biologically compatible');
  verify(reproductivePairCanConceive('male','female'),'male/female pairing should be biologically compatible regardless of protagonist order');
  verify(!reproductivePairCanConceive('female','female')&&!reproductivePairCanConceive('male','male'),'same-sex reproductive pairings should not use the biological Try for a Child path');
  verify(!reproductivePairCanConceive('intersex','female')&&!reproductivePairCanConceive('intersex','male'),'player intersex reproductive capability stays unavailable until a richer model exists');

  const femalePair=adult('female-female-parenting');const wife=partner(femalePair,'wife','female','female');
  verify(!canTryForBiologicalChild(femalePair,wife.id),'female protagonist + female spouse should mute Try for a Child');
  const blocked=haveChild(femalePair,wife.id,false);
  verify(!blocked.success&&!femalePair.familyPlanning.pregnancy,'female/female biological attempt should be blocked without creating pregnancy');
  verify(actionUsesThisAge(femalePair,'family.child_attempt')===0,'an incompatible biological pairing should not consume the yearly child-attempt action');

  const malePartnerState=adult('female-male-parenting');const husband=partner(malePartnerState,'husband','male','male');
  verify(canTryForBiologicalChild(malePartnerState,husband.id),'female protagonist + male spouse should expose Try for a Child');

  const nonbinary=adult('nonbinary-sex-aware');const nbPartner=partner(nonbinary,'nb-partner','nonbinary','male');
  verify(canTryForBiologicalChild(nonbinary,nbPartner.id),'nonbinary NPC with male reproductive sex should be compatible with a female protagonist');

  const intersex=adult('intersex-player-parenting');intersex.character.sex='intersex';const intersexPartner=partner(intersex,'intersex-partner','male','male');
  verify(!canTryForBiologicalChild(intersex,intersexPartner.id),'intersex protagonist should keep biological family planning unavailable for now');

  const adoption=adult('same-sex-adoption');const adoptiveWife=partner(adoption,'adoptive-wife','female','female');
  const adoptionResult=haveChild(adoption,adoptiveWife.id,true);
  const adoptedRel=adoption.relationships.find(rel=>rel.type==='child');const adopted=adoptedRel?adoption.npcs[adoptedRel.npcId]:undefined;
  verify(adoptionResult.success&&!!adopted,'same-sex partnered adoption should remain available');
  verify(Boolean(adopted?.parentIds.includes(adoption.character.id)&&adopted?.parentIds.includes(adoptiveWife.id)&&adoptiveWife.childIds.includes(adopted!.id)),'partnered adoption should record both adults as parents bidirectionally');
  verify(Boolean(adopted?.gender&&adopted?.reproductiveSex),'newly adopted child NPC should receive persistent NPC identity');

  const legacy=adult('legacy-npc-identity');const legacyNpc:Npc={...partner(legacy,'legacy-partner','female','female'),firstName:getNpcFirstNames(legacy.character.countryId,'female')[0]!};delete legacyNpc.gender;delete legacyNpc.reproductiveSex;legacyNpc.sex='male';
  assignNpcIdentity(legacy,legacyNpc);
  verify(legacyNpc.gender==='male'&&legacyNpc.reproductiveSex==='male'&&legacyNpc.sex===undefined,'legacy Run-70 binary reproductive sex should be preserved during NPC identity normalization without renaming the existing person');

  const meeting=adult('new-romantic-identity');const beforeIds=new Set(Object.keys(meeting.npcs));meetPotentialPartner(meeting);const met=Object.values(meeting.npcs).find(npc=>!beforeIds.has(npc.id));
  verify(Boolean(met?.gender&&met?.reproductiveSex),'new potential partners should receive persistent gender and reproductive sex');
  verify(Boolean(met&&npcGenderForFirstName(met.countryId,met.firstName)===npcGender(meeting,met)),'new potential partner name should match the rolled NPC gender');

  const autonomous=createNewGame({seed:'same-sex-autonomous-adoption'});autonomous.character.age=35;autonomous.currentYear=2061;
  const familyBase={age:34,alive:true,health:95,happiness:85,wealth:60000,countryId:autonomous.character.countryId,city:autonomous.character.city,sexuality:'bisexual' as const,fertility:100,maritalStatus:'married' as const,gender:'female' as const,reproductiveSex:'female' as const,traits:['loyal','responsible','romantic'],hiddenOpinion:50,childIds:[] as string[]};
  const sister:Npc={...familyBase,id:'sister-a',firstName:'Maya',lastName:'Fixture',memories:[{id:'marriage-a',year:2052,age:25,kind:'marriage',sentiment:9,summary:'Married.',permanent:true}],parentIds:[],partnerId:'wife-b'};
  const wifeNpc:Npc={...familyBase,id:'wife-b',firstName:'Elena',lastName:'Fixture',memories:[{id:'marriage-b',year:2052,age:25,kind:'marriage',sentiment:9,summary:'Married.',permanent:true}],parentIds:[],childIds:[],partnerId:'sister-a'};
  autonomous.npcs[sister.id]=sister;autonomous.npcs[wifeNpc.id]=wifeNpc;autonomous.relationships.push({id:'sister-rel',npcId:sister.id,type:'sibling',score:80,attraction:0,compatibility:80,yearsKnown:35});
  processNpcLives(autonomous);
  verify(sister.childIds.length===1&&wifeNpc.childIds.includes(sister.childIds[0]!),'biologically incompatible autonomous NPC couples should still be able to expand through linked adoption');
  verify(sister.memories.some(memory=>memory.kind==='adoption')&&!sister.memories.some(memory=>memory.kind==='child_birth'),'same-sex autonomous family expansion should be recorded as adoption rather than an offscreen biological birth');

  const descendantState=adult('descendant-identity-projection');const descendant:Npc={id:'descendant',firstName:'Avery',lastName:'Fixture',age:20,alive:true,health:90,happiness:80,wealth:0,countryId:'us',city:descendantState.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',gender:'nonbinary',reproductiveSex:'male',traits:[],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]};
  const projected=characterIdentityFromNpc(descendantState,descendant);
  verify(projected.genderIdentity==='nonbinary'&&projected.sex==='male','descendant continuation identity projection should preserve NPC gender and reproductive sex instead of rerolling them');

  return checks;
}
