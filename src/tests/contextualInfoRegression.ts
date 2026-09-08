import { careerInfluenceSnapshots } from '../components/ContextualInfoButton';
import { createNewGame } from '../systems/CharacterSystem';
import { processSpecialCareerInfluenceYear } from '../systems/SpecialCareerInfluenceSystem';
import { ensureSpecialCareerRelationships } from '../systems/SpecialCareerRelationshipSystem';
import { ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';

export function runContextualInfoRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Contextual info regression failed: ${message}`);}

  const empty=createNewGame({seed:'context-info-empty'});
  verify(careerInfluenceSnapshots(empty).length===0,'1 the developer projection must stay empty without an active special Career World');

  const state=createNewGame({seed:'context-info-sports'});state.character.age=29;state.currentYear=2059;state.character.secondary.stress=35;
  state.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:82,fitness:86,reputation:65,contractRemaining:2,salary:700000};
  const world=ensureSpecialCareerWorld(state,'sports','Basketball',{announce:false});ensureSpecialCareerRelationships(state,world);
  const leaderId=world.members.find(member=>member.role==='leader')?.npcId;const rivalIds=new Set(world.groups.filter(group=>group.kind.includes(':rivals')).flatMap(group=>group.memberNpcIds));const rivalId=world.members.find(member=>rivalIds.has(member.npcId))?.npcId;
  const leaderRel=leaderId?state.relationships.find(rel=>rel.npcId===leaderId):undefined;const rivalRel=rivalId?state.relationships.find(rel=>rel.npcId===rivalId):undefined;
  if(!leaderId||!rivalId||!leaderRel||!rivalRel)throw new Error('Contextual info regression fixture could not resolve sports leader/rival relationships.');
  leaderRel.score=94;leaderRel.compatibility=90;state.npcs[leaderId]!.hiddenOpinion=80;rivalRel.score=10;state.npcs[rivalId]!.traits=['competitive','aggressive','ambitious'];

  const projected=careerInfluenceSnapshots(state);
  verify(projected.length===1&&projected[0]?.worldId===world.id,'2 the UI projection must expose the exact active Career World');
  verify((projected[0]?.leaderSupport??0)>75&&(projected[0]?.rivalPressure??0)>70,'3 the UI projection must expose meaningful live leader and rival inputs');
  verify(projected[0]?.processed===false,'4 influence must be labeled as projected before the annual influence processor runs');

  processSpecialCareerInfluenceYear(state,'sports',world);
  const processed=careerInfluenceSnapshots(state);const stored=Number(state.specialCareers.sports?.opportunityModifier??0);
  verify(processed[0]?.processed===true&&processed[0]?.opportunityModifier===stored,'5 after processing, the UI must show the exact stored opportunity modifier rather than silently recomputing another result');

  return checks;
}
