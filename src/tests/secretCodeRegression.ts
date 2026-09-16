import { actionUsesThisAge } from '../core/actionEconomy';
import { createNewGame } from '../systems/CharacterSystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { biologicalChildGate } from '../systems/ReproductionSystem';
import { canAskNpcOnDate, changeRelationshipType } from '../systems/RelationshipSystem';
import { isSecretYukiNpc, normalizeSecretYukiState, redeemSecretCode, secretYukiAppearance, secretYukiNpcId, YUKI_SECRET_CODE } from '../systems/SecretCodeSystem';
import { peopleSurfaceForNpc, YUKI_THREADROOM_TOPICS, yukiThreadroomGreeting, yukiThreadroomTopicLine } from '../systems/YukiThreadroomSystem';
import { migrateSave } from '../services/SaveSystem';

export function runSecretCodeRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Secret-code regression failed: ${message}`);}

  const standard=createNewGame({seed:'secret-code-standard'});
  standard.character.age=24;
  const standardIds=Object.keys(standard.npcs).length;
  const blocked=redeemSecretCode(standard,YUKI_SECRET_CODE);
  verify(!blocked.success&&Object.keys(standard.npcs).length===standardIds,'secret codes must not mutate non-Sandbox lives');

  const state=createNewGame({seed:'secret-code-yuki',sandbox:true,sex:'male',genderIdentity:'man',orientation:'pansexual'});
  state.character.age=24;
  const beforeRng=state.rngCounter;
  const wrong=redeemSecretCode(state,'1111');
  verify(!wrong.success&&!Object.values(state.npcs).some(npc=>npc.firstName==='Yuki'),'unknown codes should fail without creating a secret NPC');

  const result=redeemSecretCode(state,YUKI_SECRET_CODE);
  const yukis=Object.values(state.npcs).filter(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster');
  const yuki=yukis[0];
  verify(result.success&&yukis.length===1&&!!yuki,'9426 should create exactly one Yuki Aster NPC');
  verify(state.rngCounter===beforeRng,'fixed secret-code redemption should not consume the simulation RNG stream');
  verify(yuki.age===state.character.age&&yuki.city===state.character.city&&yuki.countryId===state.character.countryId,'Yuki should enter age-matched in the protagonist current location');
  verify(yuki.gender==='female'&&yuki.reproductiveSex==='female'&&yuki.sexuality==='pansexual','Yuki should have stable romance/reproduction identity');
  verify(yuki.memories.some(memory=>memory.kind==='secret_yuki_9426'&&memory.permanent),'Yuki should retain permanent secret-code origin history');
  verify(isSecretYukiNpc(state,yuki),'the authored secret identity should be recognized from secret-code provenance rather than name matching');
  verify(peopleSurfaceForNpc(state,yuki)==='yuki-threadroom','the authored secret identity should route to the unique Threadroom instead of the ordinary People profile');
  const decoy={...yuki,id:'npc-yuki-decoy',memories:[]};
  verify(!isSecretYukiNpc(state,decoy)&&peopleSurfaceForNpc(state,decoy)==='profile','an ordinary NPC with Yuki identity fields but no secret-code provenance must keep the ordinary People profile');
  const boundedState=createNewGame({seed:'secret-code-yuki-bounded-history',sandbox:true});boundedState.character.age=26;redeemSecretCode(boundedState,YUKI_SECRET_CODE);
  const boundedYuki=boundedState.npcs[secretYukiNpcId(boundedState)!]!;const boundedRel=boundedState.relationships.find(item=>item.npcId===boundedYuki.id)!;
  boundedYuki.memories=Array.from({length:36},(_,index)=>({id:`bounded-${index}`,year:boundedState.currentYear,age:boundedState.character.age,kind:'conversation',sentiment:1,summary:`Bounded memory ${index}`,permanent:index%2===0}));
  verify(!boundedYuki.memories.some(memory=>memory.kind==='secret_yuki_9426')&&isSecretYukiNpc(boundedState,boundedYuki)&&peopleSurfaceForNpc(boundedState,boundedYuki)==='yuki-threadroom','bounded NPC memory pruning must not revoke durable secret-code provenance or Yuki Threadroom routing');
  boundedState.settings.fontFamily='serif';boundedState.settings.textColor='#f4c7ff';
  verify(isSecretYukiNpc(boundedState,boundedYuki)&&peopleSurfaceForNpc(boundedState,boundedYuki)==='yuki-threadroom'&&boundedRel.portraitRevealed===true,'font and text-color changes must be presentation-only and must not change secret Yuki routing');
  verify(JSON.stringify(yuki.appearance)===JSON.stringify(secretYukiAppearance()),'secret-code spawn should materialize the curated Yuki portrait rather than a generated NPC face');
  verify(yuki.appearance?.visual?.hairId==='hair.wavy-long-16'&&yuki.appearance.visual.hairPaletteId==='hair-color.white'&&yuki.appearance.visual.irisPaletteId==='iris.ice-blue','Yuki portrait should preserve long white hair and ice-blue eyes');
  verify(yuki.appearance?.visual?.skinPaletteId==='skin.rose-ivory'&&yuki.appearance.visual.clothingId==='clothing.pullover-hoodie-04','Yuki portrait should preserve pale skin and the hoodie presentation');

  const relationship=()=>state.relationships.find(item=>item.npcId===yuki.id);
  verify(relationship()?.type==='friend','Yuki should begin as a normal friend rather than bypassing relationship progression');
  verify(relationship()?.portraitRevealed===true,'the hidden Yuki thread should reveal the authored portrait immediately');
  const threadroomBefore=JSON.stringify(state);const greeting=yukiThreadroomGreeting(state,yuki,relationship()!);const topicLines=YUKI_THREADROOM_TOPICS.map(topic=>yukiThreadroomTopicLine(topic.id,state,yuki,relationship()!));
  verify(greeting.length>20&&topicLines.length===6&&topicLines.every(line=>line.length>30),'Yuki Threadroom should provide a substantial authored greeting and six original conversation threads');
  verify(JSON.stringify(state)===threadroomBefore&&state.rngCounter===beforeRng,'reading Yuki Threadroom dialogue must be state- and RNG-neutral');
  verify(relationshipsForFolder(state,'friends').some(item=>item.npcId===yuki.id),'Yuki should appear in Friends & Social');
  verify(canAskNpcOnDate(state,yuki.id),'adult Yuki friendship should expose the normal Ask on Date path');

  relationship()!.romance={dateHistory:[0,1,2].map(offset=>({year:state.currentYear-offset,age:state.character.age-offset,placeId:'nightjar-diner',activityId:'diner_meal',approval:88,band:'good' as const}))};
  const ask=changeRelationshipType(state,yuki.id,'become_partners');
  verify(ask.success&&relationship()?.type==='partner','Yuki should use the normal successful Become Partners transition');
  verify(biologicalChildGate(state,yuki.id).allowed,'male protagonist + female Yuki should expose normal biological family planning');

  state.character.age+=1;yuki.age+=1;
  const propose=changeRelationshipType(state,yuki.id,'propose');
  verify(propose.success&&relationship()?.type==='fiance','Yuki should use the normal proposal path');
  state.character.age+=1;yuki.age+=1;
  const marry=changeRelationshipType(state,yuki.id,'marry');
  verify(marry.success&&relationship()?.type==='spouse'&&yuki.maritalStatus==='married','Yuki should use the normal marriage path');
  verify(actionUsesThisAge(state,'relationship.milestone',yuki.id)>=1,'secret NPC relationship milestones should use ordinary action-economy tracking');

  const second=redeemSecretCode(state,YUKI_SECRET_CODE);
  verify(!second.success&&Object.values(state.npcs).filter(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster').length===1,'9426 must be idempotent and never create duplicate Yukis in one life');

  const repairState=createNewGame({seed:'secret-code-yuki-repair',sandbox:true});repairState.character.age=24;redeemSecretCode(repairState,YUKI_SECRET_CODE);
  const repairYuki=repairState.npcs[secretYukiNpcId(repairState)!]!;const repairRel=repairState.relationships.find(item=>item.npcId===repairYuki.id)!;const repairRng=repairState.rngCounter;
  repairYuki.appearance=undefined;repairRel.portraitRevealed=false;delete repairState.flags['secretCode:yuki:9426'];
  verify(normalizeSecretYukiState(repairState)&&JSON.stringify(repairYuki.appearance)===JSON.stringify(secretYukiAppearance())&&Boolean(repairState.relationships.find(item=>item.npcId===repairYuki.id)?.portraitRevealed),'current-schema normalization should repair pre-authored randomized Yuki saves to the curated identity');
  verify(repairState.rngCounter===repairRng&&!normalizeSecretYukiState(repairState),'Yuki identity repair should consume no gameplay RNG and become idempotent after one repair');
  const prunedRepair=createNewGame({seed:'secret-code-yuki-pruned-repair',sandbox:true});prunedRepair.character.age=26;redeemSecretCode(prunedRepair,YUKI_SECRET_CODE);
  const prunedYuki=prunedRepair.npcs[secretYukiNpcId(prunedRepair)!]!;const prunedRel=prunedRepair.relationships.find(item=>item.npcId===prunedYuki.id)!;const prunedRng=prunedRepair.rngCounter;const prunedIds=prunedRepair.idCounter;
  prunedYuki.memories=prunedYuki.memories.filter(memory=>memory.kind!=='secret_yuki_9426');prunedYuki.appearance=undefined;prunedRel.portraitRevealed=false;
  verify(normalizeSecretYukiState(prunedRepair)&&isSecretYukiNpc(prunedRepair,prunedYuki)&&peopleSurfaceForNpc(prunedRepair,prunedYuki)==='yuki-threadroom','the durable secret-code flag must repair and route Yuki even after her bounded origin memory has been pruned');
  verify(prunedRepair.rngCounter===prunedRng&&prunedRepair.idCounter===prunedIds,'pruned-history Yuki repair must remain RNG- and runtime-ID-neutral');
  const legacyCurrent=createNewGame({seed:'secret-code-yuki-save-repair',sandbox:true});legacyCurrent.character.age=24;redeemSecretCode(legacyCurrent,YUKI_SECRET_CODE);
  const legacyYuki=legacyCurrent.npcs[secretYukiNpcId(legacyCurrent)!]!;const legacyRel=legacyCurrent.relationships.find(item=>item.npcId===legacyYuki.id)!;const legacyRng=legacyCurrent.rngCounter;
  legacyYuki.appearance=undefined;legacyRel.portraitRevealed=false;delete legacyCurrent.flags['secretCode:yuki:9426'];
  const migrated=migrateSave(JSON.parse(JSON.stringify(legacyCurrent)));const migratedYuki=migrated.npcs[secretYukiNpcId(migrated)!]!;
  verify(JSON.stringify(migratedYuki.appearance)===JSON.stringify(secretYukiAppearance())&&migrated.relationships.find(item=>item.npcId===migratedYuki.id)?.portraitRevealed===true,'save migration should repair an already-spawned pre-curation Yuki without requiring the code to be redeemed again');
  verify(migrated.rngCounter===legacyRng,'save-time Yuki portrait repair must remain gameplay-RNG neutral');

  const femaleState=createNewGame({seed:'secret-code-yuki-female',sandbox:true,sex:'female',genderIdentity:'woman',orientation:'pansexual'});
  femaleState.character.age=25;
  redeemSecretCode(femaleState,YUKI_SECRET_CODE);
  const femaleYuki=Object.values(femaleState.npcs).find(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster')!;
  const femaleRel=femaleState.relationships.find(item=>item.npcId===femaleYuki.id)!;femaleRel.romance={dateHistory:[0,1,2].map(offset=>({year:femaleState.currentYear-offset,age:femaleState.character.age-offset,placeId:'nightjar-diner',activityId:'diner_meal',approval:88,band:'good' as const}))};changeRelationshipType(femaleState,femaleYuki.id,'become_partners');
  verify(!biologicalChildGate(femaleState,femaleYuki.id).allowed,'female protagonist + female Yuki should preserve the established muted biological-family-planning rule');

  const childState=createNewGame({seed:'secret-code-yuki-child',sandbox:true});
  childState.character.age=8;
  redeemSecretCode(childState,YUKI_SECRET_CODE);
  const childYuki=Object.values(childState.npcs).find(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster')!;
  verify(childYuki.age===8&&!canAskNpcOnDate(childState,childYuki.id),'childhood redemption should create an age-matched friend while keeping dating age gates intact');
  const childRel=childState.relationships.find(item=>item.npcId===childYuki.id)!;const childRoom=yukiThreadroomGreeting(childState,childYuki,childRel)+yukiThreadroomTopicLine('us',childState,childYuki,childRel);
  verify(!/love|romantic|marriage/i.test(childRoom),'childhood Yuki Threadroom copy should remain friendship-appropriate');

  return checks;
}
