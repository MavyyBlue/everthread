import { createNewGame } from '../systems/CharacterSystem';
import { ensureSpecialCareerWorld, processSpecialCareerWorldsYear, specialCareerWorlds } from '../systems/SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships, processSpecialCareerEcosystemsYear, specialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import { buildPeopleRelationshipGraph, peopleFolderSummaries } from '../systems/PeopleGraphSystem';
import { processAnnualFinance } from '../systems/FinanceSystem';
import { auditionActing, directFilm } from '../systems/SpecialCareerSystem';
import { expireScreenCareerOffers, screenCareerOffer } from '../systems/ScreenCareerCycleSystem';

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

  const actingState=createNewGame({seed:'phase4-screen-acting-cycle-regression'});
  actingState.character.age=30;actingState.currentYear=2070;actingState.fame.fame=100;
  actingState.specialCareers.acting={active:true,skill:100,reputation:100,agent:1,offerPending:true,offerRole:'lead',offerPay:60000,offerExpiresAge:31,offerFromProject:'Prior Breakout'};
  assert(Boolean(screenCareerOffer(actingState,'acting')),'a valid acting offer must be readable before acceptance');
  const actingCashBefore=actingState.finances.cash;
  const acceptedRole=auditionActing(actingState);
  assert(acceptedRole.success,'a pending acting offer must be accepted through the existing acting action');
  const actingWorld=specialCareerWorlds(actingState,'acting').find(world=>world.active);
  assert(Boolean(actingWorld),'accepting an acting offer must create a live persistent production world');
  assert(actingState.specialCareers.acting?.currentProjectActive===true,'accepted acting work must enter an in-production state instead of releasing immediately');
  assert(actingState.specialCareers.acting?.currentProjectRole==='lead','accepted acting work must preserve the offered role');
  assert(actingState.finances.cash-actingCashBefore===60000,'accepted acting offers must pay the recorded booking fee exactly once');
  const overlapRole=auditionActing(actingState,100);
  assert(!overlapRole.success,'an actor already committed to a production must not silently replace it with another booking');
  for(const group of actingWorld!.groups)group.prestige=100;
  for(const member of actingWorld!.members){const rel=actingState.relationships.find(item=>item.npcId===member.npcId);if(rel&&rel.type!=='enemy')rel.score=100;}
  actingState.character.age=31;actingState.currentYear=2071;
  processSpecialCareerWorldsYear(actingState);processSpecialCareerEcosystemsYear(actingState);
  assert(!actingWorld!.active&&actingWorld!.endedAge===31,'acting productions must archive on the release age instead of disappearing');
  assert(Number(actingState.specialCareers.acting?.projectsCompleted)===1,'an acting production must become completed career history only after the next Age Up');
  assert(!Boolean(actingState.specialCareers.acting?.currentProjectActive),'acting release processing must close the in-production state');
  assert(actingState.specialCareers.acting?.lastProjectName===actingWorld!.name,'acting release history must preserve the exact production name');
  assert(actingState.specialCareers.acting?.lastProjectRole==='lead','acting release history must preserve the exact role');
  assert(typeof actingState.specialCareers.acting?.lastProjectReception==='string','acting release history must preserve a readable reception result');
  assert(Number(actingState.specialCareers.acting?.lastProjectReleaseAge)===31,'acting release history must preserve the release age');
  assert(Number(actingState.specialCareers.acting?.lastProjectBonus)>=0,'acting release economics must preserve the resolved performance bonus');
  assert(Boolean(screenCareerOffer(actingState,'acting')),'an exceptional acting release must generate a bounded follow-up offer');
  const actingOfferExpiry=Number(actingState.specialCareers.acting?.offerExpiresAge);
  actingState.character.age=actingOfferExpiry+1;expireScreenCareerOffers(actingState);
  assert(actingState.specialCareers.acting?.offerPending===false,'screen-career offers must expire instead of persisting forever');
  assert(Number(actingState.specialCareers.acting?.offersExpired)===1,'expired screen-career offers must be counted for career history');

  const directingState=createNewGame({seed:'phase4-screen-directing-cycle-regression'});
  directingState.character.age=35;directingState.currentYear=2090;directingState.finances.cash=0;directingState.fame.fame=100;
  directingState.specialCareers.directing={active:true,skill:100,reputation:100,offerPending:true,offerBudget:20000000,offerFee:650000,offerExpiresAge:37,offerFromProject:'Previous Feature'};
  assert(Boolean(screenCareerOffer(directingState,'directing')),'a valid directing offer must be readable before acceptance');
  const directingCashBefore=directingState.finances.cash;
  const acceptedFilm=directFilm(directingState,1500000);
  assert(acceptedFilm.success,'a studio-backed directing offer must be actionable without a personal production stake');
  const directingWorld=specialCareerWorlds(directingState,'directing').find(world=>world.active);
  assert(Boolean(directingWorld),'accepting a directing offer must create a live film-production world');
  assert(Number(directingState.specialCareers.directing?.currentProjectBudget)===20000000,'directing offers must preserve their exact offered production budget');
  assert(Number(directingState.specialCareers.directing?.currentProjectStake)===0,'studio-backed directing offers must not charge the normal self-backed stake');
  assert(directingState.finances.cash-directingCashBefore===650000,'studio-backed directing offers must pay the recorded director fee at production start');
  assert(Number(directingState.specialCareers.directing?.projectsCompleted??0)===0,'directing a film must no longer resolve its release in the same action');
  const overlapFilm=directFilm(directingState,1500000);
  assert(!overlapFilm.success,'a director with a film already in production must not start an overlapping feature');
  for(const group of directingWorld!.groups)group.prestige=100;
  for(const member of directingWorld!.members){const rel=directingState.relationships.find(item=>item.npcId===member.npcId);if(rel)rel.score=100;}
  directingState.character.age=36;directingState.currentYear=2091;
  processSpecialCareerWorldsYear(directingState);processSpecialCareerEcosystemsYear(directingState);
  assert(!directingWorld!.active&&directingWorld!.endedAge===36,'directing productions must archive on release while preserving the exact world');
  assert(Number(directingState.specialCareers.directing?.projectsCompleted)===1,'directing projects must become completed career history after release');
  assert(!Boolean(directingState.specialCareers.directing?.currentProjectActive),'directing release processing must close the active production state');
  assert(Number(directingState.specialCareers.directing?.lastProjectBudget)===20000000,'directing release history must preserve the exact production budget');
  assert(Number(directingState.specialCareers.directing?.lastBoxOffice)>0,'directing release processing must resolve a positive bounded box-office result');
  assert(Number(directingState.specialCareers.directing?.profitableFilms??0)+Number(directingState.specialCareers.directing?.flops??0)===1,'each completed directing project must resolve exactly one commercial outcome');
  assert(directingState.specialCareers.directing?.lastProjectName===directingWorld!.name,'directing release history must preserve the exact film name');
  assert(typeof directingState.specialCareers.directing?.lastProjectReception==='string','directing release history must preserve a readable reception result');

  return 77;
}
