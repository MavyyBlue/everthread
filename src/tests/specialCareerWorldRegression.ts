import { createNewGame } from '../systems/CharacterSystem';
import { ensureSpecialCareerWorld, processSpecialCareerWorldsYear, specialCareerWorlds } from '../systems/SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships, processSpecialCareerEcosystemsYear, specialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import { buildPeopleRelationshipGraph, peopleFolderSummaries } from '../systems/PeopleGraphSystem';
import { processAnnualFinance } from '../systems/FinanceSystem';

function assert(condition:unknown,message:string):asserts condition{
  if(!condition)throw new Error(`Special-career world regression failed: ${message}`);
}

export function runSpecialCareerWorldRegression(){
  const state=createNewGame({seed:'phase4-special-career-world-regression'});
  state.character.age=24;
  state.currentYear=2050;

  const originalNpcCount=Object.keys(state.npcs).length;
  const firstProduction=ensureSpecialCareerWorld(state,'acting','supporting',{forceNew:true,announce:false});
  assert(firstProduction.kind==='organization','acting productions must use organization social worlds');
  assert(firstProduction.active,'new acting production must be active');
  assert(firstProduction.members.length>=8,'acting production must create a meaningful recurring cast and crew');
  assert(Object.keys(state.npcs).length>originalNpcCount,'career worlds must persist their NPCs in authoritative state');

  const sameProduction=ensureSpecialCareerWorld(state,'acting','supporting',{announce:false});
  assert(sameProduction.id===firstProduction.id,'non-forced ensure must reuse the active career world');

  const secondProduction=ensureSpecialCareerWorld(state,'acting','lead',{forceNew:true,announce:false});
  assert(secondProduction.id!==firstProduction.id,'a newly booked production must create distinct history');
  assert(!firstProduction.active&&firstProduction.endedAge===24,'the previous production must archive instead of disappearing');
  assert(firstProduction.members.every(member=>member.leftAge===24),'archived production members must receive a leave age');

  state.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:78,fitness:84,reputation:72,contractYears:2,contractRemaining:2,salary:850000};
  const team=ensureSpecialCareerWorld(state,'sports','Basketball',{announce:false});
  ensureSpecialCareerRelationships(state,team);
  const teamRelations=team.members.map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)).filter(Boolean);
  assert(teamRelations.length===team.members.length,'every special-career world member must be reachable through the player relationship graph');
  assert(teamRelations.some(rel=>rel?.type==='boss'),'career leaders must become persistent boss/manager relationships');
  assert(teamRelations.some(rel=>rel?.type==='enemy'),'career rival groups must create real enemy relationships');
  const teamView=specialCareerWorldView(state,team);
  assert(teamView?.kind==='sports','career-world projection must identify the ecosystem kind');
  assert(teamView.memberCount===team.members.length,'career-world projection must expose the live recurring roster');
  const careerFolder=peopleFolderSummaries(state).find(folder=>folder.id==='career');
  assert((careerFolder?.count??0)>=team.members.length,'Career Worlds folder must expose the persistent special-career roster');
  const careerGraph=buildPeopleRelationshipGraph(state,'career');
  assert(Boolean(teamView.rivalNpcId&&careerGraph.nodes.some(node=>node.id===teamView.rivalNpcId)),'Career Worlds graph must keep the professional rival discoverable');

  // The same seeded career should perform differently when its persistent team relationships differ.
  const supportive=structuredClone(state);const fractured=structuredClone(state);
  for(const candidate of [supportive,fractured]){candidate.character.age=25;candidate.currentYear=2051;}
  for(const member of team.members){
    const supportiveRel=supportive.relationships.find(rel=>rel.npcId===member.npcId);
    const fracturedRel=fractured.relationships.find(rel=>rel.npcId===member.npcId);
    if(supportiveRel&&supportiveRel.type!=='enemy')supportiveRel.score=92;
    if(fracturedRel&&fracturedRel.type!=='enemy')fracturedRel.score=12;
  }
  processSpecialCareerWorldsYear(supportive);processSpecialCareerEcosystemsYear(supportive);
  processSpecialCareerWorldsYear(fractured);processSpecialCareerEcosystemsYear(fractured);
  assert(Number(supportive.specialCareers.sports?.careerChemistry)>Number(fractured.specialCareers.sports?.careerChemistry),'persistent career relationships must change measured ecosystem chemistry');
  assert(Number(supportive.specialCareers.sports?.careerMomentum)>Number(fractured.specialCareers.sports?.careerMomentum),'career chemistry must feed into annual career momentum');

  const teamId=team.id;
  state.character.age=25;
  state.currentYear=2051;
  processSpecialCareerWorldsYear(state);
  processSpecialCareerEcosystemsYear(state);
  assert(team.active,'persistent sports teams must survive Age Up while the pro career is active');
  assert((state.specialCareers.sports?.worldPrestige as number|undefined)!==undefined,'annual processing must expose bounded career-world prestige');
  assert((state.specialCareers.sports?.careerMomentum as number|undefined)!==undefined,'career ecosystems must calculate annual momentum');
  assert(typeof state.specialCareers.sports?.rivalNpcId==='string','sports ecosystem must preserve a named persistent rival');
  assert(Number(state.specialCareers.sports?.contractRemaining)===1,'professional contracts must count down after a completed season');
  assert(Number(state.specialCareers.sports?.seasonsPlayed)===1,'professional sports must resolve one season per Age Up');
  assert(Number(state.specialCareers.sports?.lastSeasonAge)===25,'sports season history must record the exact processed age');
  assert(Number.isFinite(Number(state.specialCareers.sports?.lastSeasonScore))&&Number(state.specialCareers.sports?.lastSeasonScore)>=0&&Number(state.specialCareers.sports?.lastSeasonScore)<=100,'sports season performance must be bounded');
  assert(Number(state.specialCareers.sports?.seasonSalaryDue)===850000,'the completed season must preserve its earned salary before contract resolution');
  assert(typeof state.specialCareers.sports?.seasonRecord==='string','sports season must retain a readable result/record');
  assert(Number(state.specialCareers.sports?.careerAppearances)>0,'sports season must accumulate career appearances');
  const contractAfterFirstPass=Number(state.specialCareers.sports?.contractRemaining);
  const seasonsAfterFirstPass=Number(state.specialCareers.sports?.seasonsPlayed);
  processSpecialCareerEcosystemsYear(state);
  assert(Number(state.specialCareers.sports?.contractRemaining)===contractAfterFirstPass,'special-career annual processing must be idempotent within the same age');
  assert(Number(state.specialCareers.sports?.seasonsPlayed)===seasonsAfterFirstPass,'duplicate same-age processing must not create a second sports season');
  assert(!secondProduction.active&&secondProduction.endedAge===25,'temporary productions must close after their active year');
  assert(Number(state.specialCareers.acting?.projectsCompleted)===1,'completed acting productions must become career history instead of disappearing');
  assert(Number.isFinite(Number(state.specialCareers.acting?.lastProjectScore)),'completed projects must retain a career impact score');
  assert(specialCareerWorlds(state,'sports').some(world=>world.id===teamId),'sports team history must remain addressable');

  state.character.age=26;
  state.currentYear=2052;
  processSpecialCareerWorldsYear(state);
  processSpecialCareerEcosystemsYear(state);
  assert(Number(state.specialCareers.sports?.seasonsPlayed)===2,'a second age must resolve exactly one additional professional season');
  assert(Number(state.specialCareers.sports?.lastSeasonAge)===26,'the latest sports season must advance with age');
  assert(Number(state.specialCareers.sports?.seasonSalaryDue)>0,'season salary must remain earned even when the expiring contract is renewed or released');
  assert(state.specialCareers.sports?.pro===false||Number(state.specialCareers.sports?.contractRemaining)>0,'expired sports contracts must either renew or release the player cleanly');

  const financeState=createNewGame({seed:'phase4-sports-salary-regression'});
  financeState.character.age=30;financeState.currentYear=2060;
  financeState.specialCareers.sports={active:true,pro:false,freeAgent:true,sport:'Basketball',lastSeasonAge:30,seasonSalaryDue:100000,salary:250000};
  processAnnualFinance(financeState);
  assert(financeState.finances.annualIncome===Math.round(100000*financeState.economy.salaryIndex),'annual finance must pay a completed season salary even after release into free agency');

  const retirementState=createNewGame({seed:'phase4-sports-retirement-regression'});
  retirementState.character.age=48;retirementState.currentYear=2080;
  retirementState.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:78,fitness:70,reputation:70,contractYears:2,contractRemaining:2,salary:500000};
  const retirementTeam=ensureSpecialCareerWorld(retirementState,'sports','Basketball',{announce:false});
  ensureSpecialCareerRelationships(retirementState,retirementTeam);
  processSpecialCareerWorldsYear(retirementState);processSpecialCareerEcosystemsYear(retirementState);
  assert(retirementState.specialCareers.sports?.retired===true,'professional sports must reach a clean retirement end state by the hard age boundary');
  assert(retirementState.specialCareers.sports?.pro===false&&retirementState.specialCareers.sports?.active===false,'retirement must close professional and pathway activity together');
  assert(!retirementTeam.active&&retirementTeam.endedAge===48,'retirement must archive the final team world without deleting its history');

  state.specialCareers.sports!.active=false;
  state.character.age=27;
  state.currentYear=2053;
  processSpecialCareerWorldsYear(state);
  processSpecialCareerEcosystemsYear(state);
  assert(!team.active&&team.endedAge!==undefined,'ending the special career must archive its persistent world');

  return 41;
}
