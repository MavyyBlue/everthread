import { actionUsesThisAge } from '../core/actionEconomy';
import { createNewGame } from '../systems/CharacterSystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { biologicalChildGate } from '../systems/ReproductionSystem';
import { canAskOutNpc, changeRelationshipType } from '../systems/RelationshipSystem';
import { redeemSecretCode, YUKI_SECRET_CODE } from '../systems/SecretCodeSystem';

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

  const rel=state.relationships.find(item=>item.npcId===yuki.id);
  verify(rel?.type==='friend','Yuki should begin as a normal friend rather than bypassing relationship progression');
  verify(relationshipsForFolder(state,'friends').some(item=>item.npcId===yuki.id),'Yuki should appear in Friends & Social');
  verify(canAskOutNpc(state,yuki.id),'adult Yuki friendship should expose the normal Ask Out path');

  const ask=changeRelationshipType(state,yuki.id,'ask_out');
  verify(ask.success&&rel?.type==='partner','Yuki should use the normal successful dating transition');
  verify(biologicalChildGate(state,yuki.id).allowed,'male protagonist + female Yuki should expose normal biological family planning');

  state.character.age+=1;yuki.age+=1;
  const propose=changeRelationshipType(state,yuki.id,'propose');
  verify(propose.success&&rel?.type==='fiance','Yuki should use the normal proposal path');
  state.character.age+=1;yuki.age+=1;
  const marry=changeRelationshipType(state,yuki.id,'marry');
  verify(marry.success&&rel?.type==='spouse'&&yuki.maritalStatus==='married','Yuki should use the normal marriage path');
  verify(actionUsesThisAge(state,'relationship.milestone',yuki.id)>=1,'secret NPC relationship milestones should use ordinary action-economy tracking');

  const second=redeemSecretCode(state,YUKI_SECRET_CODE);
  verify(!second.success&&Object.values(state.npcs).filter(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster').length===1,'9426 must be idempotent and never create duplicate Yukis in one life');

  const femaleState=createNewGame({seed:'secret-code-yuki-female',sandbox:true,sex:'female',genderIdentity:'woman',orientation:'pansexual'});
  femaleState.character.age=25;
  redeemSecretCode(femaleState,YUKI_SECRET_CODE);
  const femaleYuki=Object.values(femaleState.npcs).find(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster')!;
  changeRelationshipType(femaleState,femaleYuki.id,'ask_out');
  verify(!biologicalChildGate(femaleState,femaleYuki.id).allowed,'female protagonist + female Yuki should preserve the established muted biological-family-planning rule');

  const childState=createNewGame({seed:'secret-code-yuki-child',sandbox:true});
  childState.character.age=8;
  redeemSecretCode(childState,YUKI_SECRET_CODE);
  const childYuki=Object.values(childState.npcs).find(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster')!;
  verify(childYuki.age===8&&!canAskOutNpc(childState,childYuki.id),'childhood redemption should create an age-matched friend while keeping dating age gates intact');

  return checks;
}
