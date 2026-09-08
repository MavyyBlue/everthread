import { makeStateId } from '../core/ids';
import type { Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { archiveSpecialCareerWorld, ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships } from '../systems/SpecialCareerEcosystemSystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { canAskOutNpc, canHookUpWithNpc, changeRelationshipType } from '../systems/RelationshipSystem';

export function runSocialAffiliationRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition {checks+=1;if(!condition)throw new Error(`Social-affiliation regression failed: ${message}`);}

  const state=createNewGame({seed:'social-affiliation-regression'});
  state.character.age=26;state.currentYear=2076;
  state.specialCareers.music={active:true,instrument:'vocals',skill:82,reputation:72,fanbase:12000,songsReleased:1};
  const careerWorld=ensureSpecialCareerWorld(state,'music','vocals',{announce:false});
  ensureSpecialCareerRelationships(state,careerWorld);
  const careerIds=new Set(careerWorld.members.map(member=>member.npcId));
  const leader=careerWorld.members.find(member=>member.role==='leader');
  const peer=careerWorld.members.find(member=>member.role!=='leader'&&state.relationships.find(rel=>rel.npcId===member.npcId)?.type==='coworker');
  verify(Boolean(leader&&peer),'music career world must provide a leader and coworker for affiliation checks');

  const workBefore=relationshipsForFolder(state,'work');
  verify(workBefore.every(rel=>!careerIds.has(rel.npcId)),'special-career coworkers and bosses must not leak into the Work folder without workplace affiliation');
  const careerBefore=relationshipsForFolder(state,'career');
  verify(careerWorld.members.every(member=>careerBefore.some(rel=>rel.npcId===member.npcId)),'Career Worlds must retain the persistent music collective roster');

  const peerRel=state.relationships.find(rel=>rel.npcId===peer!.npcId)!;
  peerRel.score=89;
  verify(!relationshipsForFolder(state,'friends').some(rel=>rel.npcId===peer!.npcId),'an ordinary institutional connection below the close-social threshold must not be mislabeled into Friends & Social');
  peerRel.score=100;
  verify(relationshipsForFolder(state,'friends').some(rel=>rel.npcId===peer!.npcId),'a 100-score career coworker must surface in Friends & Social without losing career affiliation');
  verify(peerRel.type==='coworker','Friends & Social overlap must not overwrite the authoritative coworker relationship type');

  const leaderRel=state.relationships.find(rel=>rel.npcId===leader!.npcId)!;
  leaderRel.score=100;
  verify(relationshipsForFolder(state,'friends').some(rel=>rel.npcId===leader!.npcId),'a very close boss/manager relationship must also surface in Friends & Social');
  verify(canAskOutNpc(state,leader!.npcId),'an uncommitted adult player must be able to ask out an adult boss/manager relationship');

  const peerNpc=state.npcs[peer!.npcId]!;
  peerNpc.age=25;peerNpc.hiddenOpinion=100;peerRel.compatibility=100;peerRel.attraction=100;peerRel.score=100;
  verify(canAskOutNpc(state,peerNpc.id),'an uncommitted adult career coworker must be eligible for Ask out');
  const dating=changeRelationshipType(state,peerNpc.id,'ask_out');
  verify(dating.success&&state.relationships.find(rel=>rel.npcId===peerNpc.id)?.type==='partner','asking out a highly compatible adult career coworker must be able to create a romantic relationship');
  verify(relationshipsForFolder(state,'career').some(rel=>rel.npcId===peerNpc.id),'becoming partners must not erase the original Career Worlds affiliation');
  verify(!relationshipsForFolder(state,'work').some(rel=>rel.npcId===peerNpc.id),'a career-world partner must still not leak into Work after the relationship type changes');

  const classmateMember=careerWorld.members.find(member=>member.npcId!==peerNpc.id&&member.npcId!==leader!.npcId)!;
  const classmateRel=state.relationships.find(rel=>rel.npcId===classmateMember.npcId)!;
  const classmateNpc=state.npcs[classmateMember.npcId]!;
  classmateRel.type='classmate';classmateRel.score=100;classmateNpc.age=24;
  verify(!canAskOutNpc(state,classmateNpc.id)&&canHookUpWithNpc(state,classmateNpc.id),'a committed adult player must receive Hook Up rather than Ask out for an eligible adult classmate');
  verify(relationshipsForFolder(state,'friends').some(rel=>rel.npcId===classmateNpc.id),'a 100-score classmate must surface in Friends & Social');

  const teacherMember=careerWorld.members.find(member=>![peerNpc.id,leader!.npcId,classmateNpc.id].includes(member.npcId))!;
  const teacherRel=state.relationships.find(rel=>rel.npcId===teacherMember.npcId)!;
  const teacherNpc=state.npcs[teacherMember.npcId]!;
  teacherRel.type='teacher';teacherRel.score=100;teacherNpc.age=35;
  verify(!canAskOutNpc(state,teacherNpc.id)&&canHookUpWithNpc(state,teacherNpc.id),'a committed adult player must receive Hook Up rather than Ask out for an eligible adult teacher relationship');
  state.character.age=17;
  verify(!canAskOutNpc(state,teacherNpc.id)&&!canHookUpWithNpc(state,teacherNpc.id),'a minor player must never be eligible to ask out or hook up with an adult teacher');
  state.character.age=26;

  teacherRel.type='sibling';
  verify(!canAskOutNpc(state,teacherNpc.id)&&!canHookUpWithNpc(state,teacherNpc.id),'family relationships must never become Ask out or Hook Up candidates through the institutional dating expansion');
  verify(!relationshipsForFolder(state,'friends').some(rel=>rel.npcId===teacherNpc.id),'a high-score family relationship must not be pulled into Friends & Social by the institutional closeness rule');

  const sourceNpc=state.npcs[leader!.npcId]!;
  const workplaceNpc=structuredClone(sourceNpc);
  workplaceNpc.id=makeStateId(state,'social-regression-work-npc');
  workplaceNpc.firstName='Workplace';workplaceNpc.lastName='History';workplaceNpc.age=31;workplaceNpc.partnerId=undefined;workplaceNpc.parentIds=[];workplaceNpc.childIds=[];workplaceNpc.memories=[];
  state.npcs[workplaceNpc.id]=workplaceNpc;
  const workplaceRel:Relationship={id:makeStateId(state,'rel'),npcId:workplaceNpc.id,type:'coworker',score:72,attraction:40,compatibility:60,yearsKnown:2};
  state.relationships.push(workplaceRel);
  state.socialWorlds.push({id:makeStateId(state,'workplace-regression'),kind:'workplace',name:'Regression Works',countryId:state.character.countryId,city:state.character.city,startedAge:24,active:true,members:[{npcId:workplaceNpc.id,role:'coworker',joinedAge:24,groupIds:[]}],groups:[]});
  verify(relationshipsForFolder(state,'work').some(rel=>rel.npcId===workplaceNpc.id),'a genuine workplace-affiliated coworker must remain visible in Work');
  workplaceRel.type='friend';workplaceRel.score=96;
  verify(relationshipsForFolder(state,'work').some(rel=>rel.npcId===workplaceNpc.id),'changing a workplace relationship into a friend must not erase workplace affiliation');
  verify(relationshipsForFolder(state,'friends').some(rel=>rel.npcId===workplaceNpc.id),'a workplace relationship explicitly becoming a friend must also appear in Friends & Social');

  archiveSpecialCareerWorld(careerWorld,state.character.age);
  verify(relationshipsForFolder(state,'career').some(rel=>rel.npcId===leader!.npcId),'archived career worlds must remain visible as career history rather than deleting the people');
  verify(!relationshipsForFolder(state,'work').some(rel=>rel.npcId===leader!.npcId),'archiving a career world must not cause its boss relationship to leak into Work');

  return checks;
}
