import { actionUsesThisAge } from '../core/actionEconomy';
import type { GameState, Npc, Orientation, RelationshipType } from '../types/game';
import type { NpcGender } from '../types/reproduction';
import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife, processNpcLives } from '../systems/NpcLifeSystem';
import { npcGender } from '../systems/NpcIdentitySystem';
import {
  assignGeneratedNpcOrientation,
  generatedOrientationMatchesNpcGender,
  npcNpcRomanticallyCompatible,
  orientationAttractedToGender,
  pickRomanticTargetGender,
  playerNpcRomanticallyCompatible,
  playerNpcSexuallyCompatible,
} from '../systems/NpcOrientationSystem';
import { canAskOutNpc, canHookUpWithNpc, changeRelationshipType, hookUpWithNpc, meetPotentialPartner } from '../systems/RelationshipSystem';
import { redeemSecretCode, YUKI_SECRET_CODE } from '../systems/SecretCodeSystem';
import { ensureSchoolWorldForEducationRecord } from '../systems/SchoolWorldSystem';
import { ensureWorkplaceForCareerRecord } from '../systems/WorkplaceSystem';
import { ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { ensureCombatCareerWorld } from '../systems/CombatCareerWorldSystem';
import { ensureMilitaryCareerWorld } from '../systems/MilitaryCareerWorldSystem';
import { ensurePoliticsCareerWorld } from '../systems/PoliticsCareerWorldSystem';

function adult(seed:string,orientation:Orientation='straight',gender:'woman'|'man'|'nonbinary'='man'){
  const sex=gender==='woman'?'female':gender==='man'?'male':'intersex';
  const state=createNewGame({seed,countryId:'us',sex,genderIdentity:gender,orientation});
  state.character.age=25;state.currentYear=2051;
  return state;
}

function npcFixture(state:GameState,id:string,gender:NpcGender,sexuality:Orientation,age=25):Npc{
  return{
    id,firstName:gender==='female'?'Avery':gender==='male'?'Jordan':'River',lastName:'Fixture',age,alive:true,health:92,happiness:80,wealth:12000,
    countryId:state.character.countryId,city:state.character.city,sexuality,fertility:72,maritalStatus:'single',gender,
    reproductiveSex:gender==='female'?'female':'male',traits:['calm','loyal'],hiddenOpinion:90,memories:[],parentIds:[],childIds:[],simulationTier:'full',
  };
}

function addRelation(state:GameState,npc:Npc,type:RelationshipType='friend'){
  state.npcs[npc.id]=npc;
  state.relationships.push({id:`rel-${npc.id}`,npcId:npc.id,type,score:100,attraction:100,compatibility:100,yearsKnown:3});
  return npc;
}

function allWorldMembersCoherent(state:GameState,npcIds:string[]){
  return npcIds.every(id=>{const npc=state.npcs[id];return Boolean(npc&&generatedOrientationMatchesNpcGender(npcGender(state,npc),npc.sexuality));});
}

export function runNpcOrientationCoherenceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`NPC orientation coherence regression failed: ${message}`);}

  verify(orientationAttractedToGender('straight','female','male'),'straight female identity should romantically target male identity');
  verify(!orientationAttractedToGender('straight','female','female'),'straight female identity should not romantically target female identity');
  verify(orientationAttractedToGender('straight','male','female'),'straight male identity should romantically target female identity');
  verify(!orientationAttractedToGender('straight','male','male'),'straight male identity should not romantically target male identity');
  verify(orientationAttractedToGender('gay','male','male'),'gay identity should support same-gender attraction');
  verify(!orientationAttractedToGender('gay','male','female'),'gay male identity should not target female identity');
  verify(orientationAttractedToGender('lesbian','female','female'),'lesbian identity should target female identity');
  verify(!orientationAttractedToGender('lesbian','female','male'),'lesbian identity should not target male identity');
  verify(orientationAttractedToGender('bisexual','female','nonbinary'),'bisexual identity should support non-binary attraction');
  verify(orientationAttractedToGender('pansexual','male','nonbinary'),'pansexual identity should support non-binary attraction');
  verify(orientationAttractedToGender('asexual','female','male','romantic'),'asexuality should not be treated as aromantic without a separate romantic-orientation model');
  verify(!orientationAttractedToGender('asexual','female','male','sexual'),'asexuality should block sexual compatibility');

  const generated=adult('orientation-generated');
  const female=npcFixture(generated,'generated-female','female','gay');const male=npcFixture(generated,'generated-male','male','lesbian');const nonbinary=npcFixture(generated,'generated-nonbinary','nonbinary','straight');
  const beforeGeneratedRng=generated.rngCounter;
  assignGeneratedNpcOrientation(generated,female);assignGeneratedNpcOrientation(generated,male);assignGeneratedNpcOrientation(generated,nonbinary);
  verify(generatedOrientationMatchesNpcGender('female',female.sexuality),'new female NPCs should receive a coherent generated orientation label');
  verify(generatedOrientationMatchesNpcGender('male',male.sexuality),'new male NPCs should receive a coherent generated orientation label');
  verify(generatedOrientationMatchesNpcGender('nonbinary',nonbinary.sexuality),'new non-binary NPCs should receive a coherent generated orientation label');
  verify(generated.rngCounter===beforeGeneratedRng,'generated orientation assignment should not consume the main simulation RNG stream');
  const deterministicA=npcFixture(generated,'orientation-repeat','female','straight');const deterministicB=npcFixture(generated,'orientation-repeat','female','straight');
  assignGeneratedNpcOrientation(generated,deterministicA);assignGeneratedNpcOrientation(generated,deterministicB);
  verify(deterministicA.sexuality===deterministicB.sexuality,'generated orientation assignment should be deterministic for the same life and NPC id');
  const towardFemale=npcFixture(generated,'orientation-toward-female','female','straight');assignGeneratedNpcOrientation(generated,towardFemale,'female');
  verify(orientationAttractedToGender(towardFemale.sexuality,'female','female','romantic'),'targeted generation should produce an orientation attracted to the intended gender');
  const pickedTarget=pickRomanticTargetGender(generated,'lesbian','female','target-fixture');
  verify(pickedTarget==='female','romantic target generation should honor the initiating orientation');

  const legacy=adult('orientation-legacy');const odd=addRelation(legacy,npcFixture(legacy,'legacy-odd','male','lesbian'));
  const oddRng=legacy.rngCounter;ensureNpcLife(legacy,odd);
  verify(odd.gender==='male'&&odd.sexuality==='lesbian','loading/ensuring an established odd legacy identity should preserve its historical gender and orientation');
  verify(legacy.rngCounter===oddRng,'legacy identity hydration should not consume the main RNG stream');

  const mutual=adult('orientation-mutual','straight','man');
  const straightWoman=npcFixture(mutual,'straight-woman','female','straight');
  const gayMan=npcFixture(mutual,'gay-man','male','gay');
  verify(playerNpcRomanticallyCompatible(mutual,straightWoman),'mutually compatible straight identities should pass romantic compatibility');
  verify(!playerNpcRomanticallyCompatible(mutual,gayMan),'one-sided orientation mismatch should fail mutual romantic compatibility');
  mutual.character.orientation='gay';
  verify(playerNpcRomanticallyCompatible(mutual,gayMan),'mutually compatible gay identities should pass romantic compatibility');
  mutual.character.orientation='asexual';
  verify(playerNpcRomanticallyCompatible(mutual,straightWoman),'asexual players should still be able to form romantic relationships');
  verify(!playerNpcSexuallyCompatible(mutual,straightWoman),'asexual players should not pass sexual compatibility');

  const blocked=adult('orientation-ask-block','straight','man');const blockedNpc=addRelation(blocked,npcFixture(blocked,'blocked-date','male','gay'));
  const blockedRng=blocked.rngCounter;const blockedTimeline=blocked.timeline.length;
  verify(!canAskOutNpc(blocked,blockedNpc.id),'Ask Out availability should hide for mutually incompatible orientations');
  const blockedAsk=changeRelationshipType(blocked,blockedNpc.id,'ask_out');
  verify(!blockedAsk.success&&blocked.relationships.find(rel=>rel.npcId===blockedNpc.id)?.type==='friend','incompatible Ask Out should fail without changing relationship type');
  verify(actionUsesThisAge(blocked,'relationship.milestone',blockedNpc.id)===0,'incompatible Ask Out should fail before consuming the milestone action');
  verify(blocked.rngCounter===blockedRng&&blocked.timeline.length===blockedTimeline,'incompatible Ask Out should fail before RNG or timeline mutation');

  const allowed=adult('orientation-ask-allowed','straight','man');const allowedNpc=addRelation(allowed,npcFixture(allowed,'allowed-date','female','straight'));
  verify(canAskOutNpc(allowed,allowedNpc.id),'Ask Out should remain available for mutually compatible identities');
  const allowedAsk=changeRelationshipType(allowed,allowedNpc.id,'ask_out');
  verify(allowedAsk.success&&allowed.relationships.find(rel=>rel.npcId===allowedNpc.id)?.type==='partner','compatible Ask Out should retain the ordinary relationship transition path');

  const hookup=adult('orientation-hookup','straight','man');
  const spouse=addRelation(hookup,npcFixture(hookup,'hookup-spouse','female','straight'),'spouse');spouse.maritalStatus='married';
  const asexualTarget=addRelation(hookup,npcFixture(hookup,'hookup-target','female','asexual'),'friend');
  const hookupRng=hookup.rngCounter;const hookupTimeline=hookup.timeline.length;
  verify(!canHookUpWithNpc(hookup,asexualTarget.id),'Hook Up availability should respect mutual sexual compatibility');
  const hookupResult=hookUpWithNpc(hookup,asexualTarget.id);
  verify(!hookupResult.success,'a sexually incompatible hookup should be rejected');
  verify(actionUsesThisAge(hookup,'relationship.milestone',asexualTarget.id)===0&&hookup.rngCounter===hookupRng&&hookup.timeline.length===hookupTimeline,'blocked hookup should consume neither action economy, RNG, nor timeline state');
  verify(hookup.relationships.find(rel=>rel.npcId===spouse.id)?.type==='spouse','blocked hookup should not disturb the current commitment');

  const meet=adult('orientation-meet','lesbian','woman');const existingIds=new Set(Object.keys(meet.npcs));const meetResult=meetPotentialPartner(meet);
  const met=Object.values(meet.npcs).find(npc=>!existingIds.has(npc.id));
  verify(meetResult.success&&Boolean(met),'Meet Someone should still create a persistent NPC');
  verify(Boolean(met&&npcGender(meet,met)==='female'),'lesbian Meet Someone should select a compatible target gender');
  verify(Boolean(met&&playerNpcRomanticallyCompatible(meet,met)),'Meet Someone should create mutual romantic compatibility rather than a cosmetic label match');
  verify(Boolean(met&&generatedOrientationMatchesNpcGender(npcGender(meet,met),met.sexuality)),'Meet Someone should create a coherent orientation label for the new NPC');

  let parentsCoherent=true;let parentsMutual=true;
  for(let i=0;i<80;i+=1){const state=createNewGame({seed:`orientation-parent-${i}`,countryId:'us'});const parents=Object.values(state.npcs).filter(npc=>npc.id.startsWith('parent-'));parentsCoherent&&=parents.every(npc=>generatedOrientationMatchesNpcGender(npcGender(state,npc),npc.sexuality));if(parents.length===2)parentsMutual&&=npcNpcRomanticallyCompatible(state,parents[0]!,parents[1]!);else parentsMutual=false;}
  verify(parentsCoherent,'new-life parent factories should not generate gender/orientation label contradictions');
  verify(parentsMutual,'new-life parent couples should be mutually romantically compatible');

  const autonomous=adult('orientation-autonomous','pansexual','man');
  const familyNpc=npcFixture(autonomous,'orientation-family-child','female','lesbian',28);familyNpc.traits=['romantic','loyal'];familyNpc.hiddenOpinion=30;familyNpc.maritalStatus='single';
  addRelation(autonomous,familyNpc,'child');ensureNpcLife(autonomous,familyNpc);processNpcLives(autonomous);
  const autonomousPartner=familyNpc.partnerId?autonomous.npcs[familyNpc.partnerId]:undefined;
  verify(Boolean(autonomousPartner),'close-family autonomous matchmaking fallback should still be able to create a partner');
  verify(Boolean(autonomousPartner&&npcNpcRomanticallyCompatible(autonomous,familyNpc,autonomousPartner)),'autonomous matchmaking should create mutually compatible partners');
  verify(Boolean(autonomousPartner&&generatedOrientationMatchesNpcGender(npcGender(autonomous,autonomousPartner),autonomousPartner.sexuality)),'autonomous partners should receive coherent generated orientation labels');

  const school=adult('orientation-school');school.character.age=16;school.currentYear=2042;
  const schoolWorld=ensureSchoolWorldForEducationRecord(school,{stage:'secondary',institution:'Fixture Secondary',startAge:14,graduated:false,droppedOut:false,scholarship:false,performance:70},false);
  verify(allWorldMembersCoherent(school,schoolWorld.members.map(member=>member.npcId)),'school-world NPC factories should use coherent generated orientations');

  const workplace=adult('orientation-workplace');
  const workplaceWorld=ensureWorkplaceForCareerRecord(workplace,{jobId:'fixture-job',title:'Fixture Worker',company:'Fixture Works',startAge:25,salary:50000,performance:60,level:1},'full_time',false);
  verify(allWorldMembersCoherent(workplace,workplaceWorld.members.map(member=>member.npcId)),'workplace NPC factories should use coherent generated orientations');

  const special=adult('orientation-special');const specialWorld=ensureSpecialCareerWorld(special,'acting','Fixture',{announce:false});
  verify(allWorldMembersCoherent(special,specialWorld.members.map(member=>member.npcId)),'special-career world NPC factories should use coherent generated orientations');

  const combat=adult('orientation-combat');const combatWorld=ensureCombatCareerWorld(combat,{announce:false});
  verify(allWorldMembersCoherent(combat,combatWorld.members.map(member=>member.npcId)),'combat-world NPC factories should use coherent generated orientations');

  const military=adult('orientation-military');const militaryWorld=ensureMilitaryCareerWorld(military,{announce:false});
  verify(allWorldMembersCoherent(military,militaryWorld.members.map(member=>member.npcId)),'military-world NPC factories should use coherent generated orientations');

  const politics=adult('orientation-politics');politics.specialCareers.politics={office:1,active:true};const politicsWorld=ensurePoliticsCareerWorld(politics,{announce:false});
  verify(Boolean(politicsWorld&&allWorldMembersCoherent(politics,politicsWorld.members.map(member=>member.npcId))),'politics-world NPC factories should use coherent generated orientations');

  const yukiState=adult('orientation-yuki','straight','man');yukiState.flags.sandbox=true;const yukiResult=redeemSecretCode(yukiState,YUKI_SECRET_CODE);const yuki=Object.values(yukiState.npcs).find(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster');
  verify(yukiResult.success&&Boolean(yuki),'9426 should still weave Yuki into a Sandbox life');
  verify(Boolean(yuki&&yuki.gender==='female'&&yuki.sexuality==='pansexual'),'Yuki should retain her authored female + pansexual identity');
  verify(Boolean(yuki&&playerNpcRomanticallyCompatible(yukiState,yuki)),'Yuki should pass the same ordinary romantic compatibility authority rather than a secret bypass');
  verify(Boolean(yuki&&canAskOutNpc(yukiState,yuki.id)),'Yuki should retain the ordinary Ask Out path when age and commitment gates allow it');

  return checks;
}
