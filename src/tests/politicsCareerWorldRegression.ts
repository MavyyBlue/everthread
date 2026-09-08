import { createNewGame } from '../systems/CharacterSystem';
import { GameEngine } from '../engine/GameEngine';
import { enterPolitics, politicalAction } from '../systems/SpecialCareerSystem';
import {
  activePoliticsCareerWorld,
  ensurePoliticsCareerWorld,
  politicsCareerWorldView,
  politicsCareerWorlds,
  politicsOfficeLabel,
  processPoliticsCareerYear,
} from '../systems/PoliticsCareerWorldSystem';
import { leaveSpecialCareer } from '../systems/SpecialCareerExitSystem';
import { npcCareerProjection, playerCareerLabel } from '../systems/CareerIdentitySystem';
import { affiliationForFolder, relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { specialCareerReentryGate } from '../systems/CommitmentSystem';
import type { GameState, SocialWorld } from '../types/game';

type Track = Record<string, number | string | boolean>;
function track(state:GameState){return state.specialCareers.politics as Track;}
function group(world:SocialWorld,key:'staff'|'coalition'|'opposition'){return world.groups.find(item=>item.kind===`special:politics:${key}`)!;}
function activeGroupIds(state:GameState,world:SocialWorld,key:'staff'|'coalition'|'opposition'){
  return group(world,key).memberNpcIds.filter(id=>world.members.some(member=>member.npcId===id&&member.leftAge===undefined)&&state.npcs[id]?.alive);
}
function politicalFixture(seed:string,age=30){
  const state=createNewGame({seed});state.character.age=age;state.currentYear=2060+age;state.education=[];state.employment.current=undefined;state.employment.partTimeJobs=[];state.legal.criminalRecord=[];state.finances.cash=2_000_000;state.character.secondary.charisma=100;state.character.secondary.reputation=100;state.character.stats.intelligence=100;state.fame.fame=100;state.character.secondary.stress=20;state.character.secondary.confidence=60;return state;
}
function winLocal(state:GameState){const result=enterPolitics(state,1);if(!result.success)throw new Error('Politics regression fixture unexpectedly lost a deterministic local campaign.');return result;}
function bounded(value:unknown){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;}

export async function runPoliticsCareerWorldRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Politics-career world regression failed: ${message}`);}

  const child=politicalFixture('politics-underage',24);verify(!enterPolitics(child,1).success&&politicsCareerWorlds(child).length===0,'1 politics entry must preserve the existing age-25 requirement without creating a world');
  const poor=politicalFixture('politics-budget');poor.finances.cash=100;verify(!enterPolitics(poor,1).success&&politicsCareerWorlds(poor).length===0,'2 an underfunded campaign must preserve the existing campaign-budget gate');
  const employed=politicalFixture('politics-employment');employed.employment.current={jobId:'fixture',title:'Fixture role',company:'Fixture Co',startAge:25,salary:50000,performance:60,level:1};const employedEngine=new GameEngine(employed);verify(!employedEngine.campaign(1).success&&employed.specialCareers.politics===undefined,'3 the real GameEngine must preserve special-career commitment gating against ordinary full-time employment');

  const state=politicalFixture('politics-world-foundation');const cashBefore=state.finances.cash;const elected=winLocal(state);
  verify(elected.success&&track(state).active===true&&Number(track(state).office)===1,'4 a qualified adult must still be able to win the existing local-office campaign');
  verify(Number(track(state).electionsWon)===1&&Number(track(state).approval)===55,'5 the existing election result must remain the authority for election count and initial approval');
  verify(state.finances.cash===cashBefore-25000,'6 the established local campaign budget must still be charged exactly once');
  verify(politicsCareerWorlds(state).length===0,'7 the election action itself must not create a parallel UI-only office world before annual processing');
  const rngBefore=state.rngCounter;processPoliticsCareerYear(state);const world=activePoliticsCareerWorld(state);
  verify(Boolean(world)&&politicsCareerWorlds(state).length===1,'8 first office processing must create exactly one active political Career World');
  verify(Boolean(world?.id.startsWith('special-politics-'))&&world?.kind==='organization','9 political persistence must reuse generic SocialWorld ownership under special-politics');
  verify(world?.groups.length===3&&Boolean(group(world!,'staff'))&&Boolean(group(world!,'coalition'))&&Boolean(group(world!,'opposition')),'10 a political world must contain staff coalition and opposition groups');
  verify(activeGroupIds(state,world!,'staff').length>=2&&activeGroupIds(state,world!,'staff').length<=3,'11 active office staff must remain within its bounded roster');
  verify(activeGroupIds(state,world!,'coalition').length>=2&&activeGroupIds(state,world!,'coalition').length<=4,'12 political allies must remain within their bounded roster');
  verify(activeGroupIds(state,world!,'opposition').length>=2&&activeGroupIds(state,world!,'opposition').length<=3,'13 opposition must remain within its bounded roster');
  const staffGroup=group(world!,'staff');const oppositionGroup=group(world!,'opposition');const chiefMember=world!.members.find(member=>member.role==='leader'&&member.groupIds.includes(staffGroup.id)&&member.leftAge===undefined);const opponentMember=world!.members.find(member=>member.role==='leader'&&member.groupIds.includes(oppositionGroup.id)&&member.leftAge===undefined);
  verify(Boolean(chiefMember)&&state.relationships.find(rel=>rel.npcId===chiefMember!.npcId)?.type==='coworker','14 the office must have one exact living chief of staff through the ordinary relationship graph');
  verify(Boolean(opponentMember)&&state.relationships.find(rel=>rel.npcId===opponentMember!.npcId)?.type==='enemy','15 the office must have one exact recurring opposition leader rather than an anonymous rival score');
  verify(world!.members.every(member=>Boolean(state.npcs[member.npcId])&&Boolean(state.relationships.find(rel=>rel.npcId===member.npcId))),'16 every political-world roster entry must resolve to a real NPC and relationship');
  const careerPeople=new Set(relationshipsForFolder(state,'career').map(rel=>rel.npcId));verify(world!.members.every(member=>careerPeople.has(member.npcId)),'17 People → Career Worlds must discover all current political affiliates through existing generic affiliation logic');
  verify(playerCareerLabel(state)==='Local Officeholder','18 current player career identity must reflect the held political office instead of unemployment');
  verify(politicsOfficeLabel(1)==='Local office'&&politicsOfficeLabel(3)==='Regional office'&&politicsOfficeLabel(4)==='National office','19 office-level labels must remain deterministic and player-readable');
  const chief=state.npcs[chiefMember!.npcId]!;chief.careerId='unrelated-standard-job';const chiefProjection=npcCareerProjection(state,chief);verify(chiefProjection.specialCareer?.kind==='politics'&&chiefProjection.career.includes('Chief of Staff')&&chiefProjection.career.includes(world!.name),'20 active staff career identity must outrank unrelated autonomous employment without mutating it');
  const opponent=state.npcs[opponentMember!.npcId]!;const opponentProjection=npcCareerProjection(state,opponent);verify(opponentProjection.specialCareer?.kind==='politics'&&opponentProjection.career.includes('Opposition Leader'),'21 the exact principal opponent must project a political role while the office world is active');
  verify(chiefProjection.annualIncome>0&&opponentProjection.annualIncome>0&&Number.isFinite(chiefProjection.annualIncome),'22 political NPC occupation projections must expose finite positive estimated income');
  const sameWorld=ensurePoliticsCareerWorld(state,{announce:false});verify(sameWorld===world&&politicsCareerWorlds(state).length===1,'23 repeated political-world assurance must reuse the current office rather than create duplicates');
  const snapshot=JSON.stringify(state);const view=politicsCareerWorldView(state,world)!;verify(JSON.stringify(state)===snapshot,'24 politics Career World observation must remain strictly read-only');
  verify(view.chiefStaffNpcId===chief.id&&view.opponentNpcId===opponent.id&&view.coalitionNpcIds.length>=2,'25 the read-only view must expose exact staff opposition and coalition identities');
  verify(state.rngCounter===rngBefore,'26 persistent office creation and passive political-world processing must not consume the authoritative core RNG stream');
  verify(Number(track(state).termEndAge)===state.character.age+4&&Number(track(state).termsStarted)===1,'27 the first office chapter must receive one bounded four-year term marker');
  verify([track(state).staffSupport,track(state).coalitionSupport,track(state).oppositionPressure,track(state).officePrestige,track(state).politicalStanding].every(bounded),'28 political ecosystem metrics must remain finite and bounded');
  verify(chief.memories.some(memory=>memory.kind==='special_politics')&&opponent.memories.some(memory=>memory.kind==='special_politics'),'29 exact recurring political NPCs must retain normal memories of entering the player’s political world');

  const annual=politicalFixture('politics-annual');winLocal(annual);processPoliticsCareerYear(annual);const annualWorld=activePoliticsCareerWorld(annual)!;const annualRng=annual.rngCounter;annual.character.age+=1;annual.currentYear+=1;processPoliticsCareerYear(annual);
  verify(annual.rngCounter===annualRng,'30 annual political-world processing must use a dedicated deterministic substream');
  verify(Number(track(annual).lastPoliticsWorldProcessAge)===annual.character.age,'31 annual political processing must persist a same-age idempotence marker');
  verify(annualWorld.members.filter(member=>member.leftAge===undefined).every(member=>(annual.relationships.find(rel=>rel.npcId===member.npcId)?.yearsKnown??0)>=2),'32 continuing political relationships must age from each member’s real join age');
  const annualSnapshot=JSON.stringify(annual);processPoliticsCareerYear(annual);verify(JSON.stringify(annual)===annualSnapshot&&annual.rngCounter===annualRng,'33 repeated same-age political processing must be exactly idempotent');

  const support=politicalFixture('politics-support-consequence');winLocal(support);processPoliticsCareerYear(support);const supportWorld=activePoliticsCareerWorld(support)!;const supportView=politicsCareerWorldView(support,supportWorld)!;for(const id of [...supportView.staffNpcIds,...supportView.coalitionNpcIds]){const rel=support.relationships.find(item=>item.npcId===id)!;rel.score=90;}for(const id of supportView.oppositionNpcIds){const rel=support.relationships.find(item=>item.npcId===id)!;rel.score=40;support.npcs[id]!.hiddenOpinion=-5;}track(support).approval=60;support.character.age+=1;support.currentYear+=1;const confidenceBefore=support.character.secondary.confidence;processPoliticsCareerYear(support);
  verify(Number(track(support).approval)>=62,'34 strong staff and coalition relationships must be able to improve annual approval beyond generic office drift');
  verify(support.character.secondary.confidence===Math.min(100,confidenceBefore+1),'35 a strongly supported office can modestly improve player confidence through systemic relationship context');
  verify(Number(track(support).politicalStanding)>=0&&Number(track(support).politicalStanding)<=100,'36 relationship-driven political standing must stay bounded after annual consequences');

  const staffReplace=politicalFixture('politics-staff-replacement');winLocal(staffReplace);processPoliticsCareerYear(staffReplace);const staffWorld=activePoliticsCareerWorld(staffReplace)!;const deadStaff=activeGroupIds(staffReplace,staffWorld,'staff').find(id=>!staffWorld.members.find(member=>member.npcId===id)?.role.includes('leader'))??activeGroupIds(staffReplace,staffWorld,'staff')[1]!;staffReplace.npcs[deadStaff]!.alive=false;staffReplace.character.age+=1;staffReplace.currentYear+=1;processPoliticsCareerYear(staffReplace);
  verify(staffWorld.members.find(member=>member.npcId===deadStaff)?.leftAge===staffReplace.character.age,'37 deceased political staff must leave active affiliation without being erased');
  verify(activeGroupIds(staffReplace,staffWorld,'staff').length>=2&&activeGroupIds(staffReplace,staffWorld,'staff').length<=3,'38 office staff must replenish only to configured bounds');
  const joinedStaff=staffWorld.members.filter(member=>member.joinedAge===staffReplace.character.age&&activeGroupIds(staffReplace,staffWorld,'staff').includes(member.npcId));verify(joinedStaff.every(member=>(staffReplace.relationships.find(rel=>rel.npcId===member.npcId)?.yearsKnown??0)===1),'39 replacement staff relationship clocks must start when they actually join');

  const chiefReplace=politicalFixture('politics-chief-replacement');winLocal(chiefReplace);processPoliticsCareerYear(chiefReplace);const chiefWorld=activePoliticsCareerWorld(chiefReplace)!;const oldChief=politicsCareerWorldView(chiefReplace,chiefWorld)!.chiefStaffNpcId!;chiefReplace.npcs[oldChief]!.alive=false;chiefReplace.character.age+=1;chiefReplace.currentYear+=1;processPoliticsCareerYear(chiefReplace);const newChief=politicsCareerWorldView(chiefReplace,chiefWorld)!.chiefStaffNpcId!;
  verify(chiefWorld.members.find(member=>member.npcId===oldChief)?.leftAge===chiefReplace.character.age,'40 a deceased chief of staff must be preserved as former affiliation');
  verify(newChief!==oldChief&&Boolean(chiefReplace.npcs[newChief]?.alive),'41 loss of a chief of staff must establish one exact living successor');
  verify(activeGroupIds(chiefReplace,chiefWorld,'staff').length<=3,'42 staff succession must not grow the active roster beyond its maximum');

  const opponentReplace=politicalFixture('politics-opponent-replacement');winLocal(opponentReplace);processPoliticsCareerYear(opponentReplace);const opponentWorld=activePoliticsCareerWorld(opponentReplace)!;const oldOpponent=politicsCareerWorldView(opponentReplace,opponentWorld)!.opponentNpcId!;opponentReplace.npcs[oldOpponent]!.alive=false;opponentReplace.character.age+=1;opponentReplace.currentYear+=1;processPoliticsCareerYear(opponentReplace);const newOpponent=politicsCareerWorldView(opponentReplace,opponentWorld)!.opponentNpcId!;
  verify(newOpponent!==oldOpponent&&opponentReplace.relationships.find(rel=>rel.npcId===newOpponent)?.type==='enemy','43 opposition succession must preserve one exact living political rival through the ordinary relationship graph');
  verify(activeGroupIds(opponentReplace,opponentWorld,'opposition').length>=2&&activeGroupIds(opponentReplace,opponentWorld,'opposition').length<=3,'44 opposition replacement must remain population-bounded');

  const reelection=politicalFixture('politics-reelection');winLocal(reelection);processPoliticsCareerYear(reelection);const reelectionWorld=activePoliticsCareerWorld(reelection)!;const originalTermEnd=Number(track(reelection).termEndAge);const yearsToElection=Math.max(1,originalTermEnd-reelection.character.age-1);reelection.character.age+=yearsToElection;reelection.currentYear+=yearsToElection;const secondWin=enterPolitics(reelection,1);verify(secondWin.success&&Number(track(reelection).electionsWon)===2,'45 the established campaign action must still permit a same-level reelection attempt near the term boundary');reelection.character.age+=1;reelection.currentYear+=1;processPoliticsCareerYear(reelection);
  verify(activePoliticsCareerWorld(reelection)===reelectionWorld&&politicsCareerWorlds(reelection).length===1,'46 a term-boundary reelection win must renew the existing office chapter instead of duplicating it');
  verify(Number(track(reelection).termEndAge)>originalTermEnd&&Number(track(reelection).observedElectionsWon)===2&&Number(track(reelection).termsStarted)===2,'47 an eligible observed reelection must renew the bounded term window exactly once');
  verify(reelection.timeline.some(entry=>entry.age===reelection.character.age&&entry.text.includes('another term')),'48 an eligible same-level reelection must become durable timeline history');

  const advancement=politicalFixture('politics-advancement');winLocal(advancement);processPoliticsCareerYear(advancement);const localWorld=activePoliticsCareerWorld(advancement)!;const localChief=politicsCareerWorldView(advancement,localWorld)!.chiefStaffNpcId!;advancement.character.age+=1;advancement.currentYear+=1;const regionalWin=enterPolitics(advancement,3);verify(regionalWin.success&&Number(track(advancement).office)===3,'49 a high-qualified officeholder must still be able to win the existing regional campaign');processPoliticsCareerYear(advancement);const regionalWorld=activePoliticsCareerWorld(advancement)!;
  verify(regionalWorld.id!==localWorld.id&&!localWorld.active&&regionalWorld.active&&politicsCareerWorlds(advancement).length===2,'50 election to a different office level must archive the old chapter and create one new active political world');
  verify(regionalWorld.name.startsWith('Regional office · ')&&playerCareerLabel(advancement)==='Regional Officeholder','51 higher-office continuity must update both persistent world identity and player career identity');
  verify(relationshipsForFolder(advancement,'career').some(rel=>rel.npcId===localChief),'52 former local-office contacts must remain available in People → Career Worlds after advancement');
  verify(regionalWorld.members.some(member=>member.npcId===localChief),'53 a strong living staff relationship may carry into a later office chapter instead of every election replacing the whole cast');
  verify(affiliationForFolder(advancement,'career',localChief)?.status==='current','54 a carried-over staff NPC must expose their newest current Career World affiliation');

  const term=politicalFixture('politics-term-end');winLocal(term);processPoliticsCareerYear(term);const termWorld=activePoliticsCareerWorld(term)!;const termChief=politicsCareerWorldView(term,termWorld)!.chiefStaffNpcId!;const endAge=Number(track(term).termEndAge);term.currentYear+=endAge-term.character.age;term.character.age=endAge;processPoliticsCareerYear(term);
  verify(!termWorld.active&&termWorld.endedAge===endAge&&termWorld.members.every(member=>member.leftAge===endAge),'55 an unrenewed term must archive its exact office world and affiliations');
  verify(Number(track(term).office)===0&&track(term).active===false&&track(term).status==='between offices'&&Number(track(term).termsCompleted)===1,'56 term completion must release the political commitment without destroying lifetime political history');
  verify(relationshipsForFolder(term,'career').some(rel=>rel.npcId===termChief)&&affiliationForFolder(term,'career',termChief)?.status==='former','57 completed-office contacts must remain visible as former Career World relationships');
  verify(npcCareerProjection(term,term.npcs[termChief]!).specialCareer===undefined,'58 an archived political affiliation must stop overriding the NPC’s current autonomous occupation');

  const exit=politicalFixture('politics-leave');winLocal(exit);processPoliticsCareerYear(exit);const exitWorld=activePoliticsCareerWorld(exit)!;const exitNpc=exitWorld.members[0]!.npcId;const relationshipCount=exit.relationships.length;const left=leaveSpecialCareer(exit,'politics');
  verify(left.success&&track(exit).leftPath===true&&track(exit).active===false&&Number(track(exit).office)===0&&track(exit).status==='left politics','59 Leave Path must use the shared lifecycle while clearing current political office');
  verify(!exitWorld.active&&exitWorld.members.every(member=>member.leftAge===exit.character.age),'60 Leave Path must archive the current political Career World immediately');
  verify(exit.relationships.length===relationshipCount&&Boolean(exit.npcs[exitNpc])&&relationshipsForFolder(exit,'career').some(rel=>rel.npcId===exitNpc),'61 leaving politics must preserve exact people relationships memories and Career World history');
  verify(!specialCareerReentryGate(exit,'politics').allowed,'62 same-age political re-entry must remain blocked by the shared career-freedom gate');
  exit.character.age+=1;exit.currentYear+=1;exit.finances.cash=2_000_000;const returnEngine=new GameEngine(exit);const returned=returnEngine.campaign(1);verify(returned.success&&track(exit).leftPath===false&&Number(track(exit).returns)===1,'63 a later legal return through the real GameEngine must clear Leave Path and record the return');
  const aged=returnEngine.ageUp();verify(aged.success&&Boolean(activePoliticsCareerWorld(exit))&&politicsCareerWorlds(exit).length===2,'64 the normal Age Up pipeline must create a fresh office world for a returning politician without resurrecting the archived one');
  verify(politicsCareerWorlds(exit).filter(item=>item.active).length===1,'65 normal political re-entry must never produce multiple simultaneous active political worlds');

  const deterministicA=politicalFixture('politics-deterministic');const deterministicB=politicalFixture('politics-deterministic');winLocal(deterministicA);winLocal(deterministicB);const beforeA=deterministicA.rngCounter;const beforeB=deterministicB.rngCounter;processPoliticsCareerYear(deterministicA);processPoliticsCareerYear(deterministicB);const strip=(value:GameState)=>JSON.stringify({worlds:politicsCareerWorlds(value),relationships:value.relationships,npcs:Object.fromEntries(Object.entries(value.npcs).filter(([id])=>id.includes('special-politics-npc'))),track:value.specialCareers.politics});
  verify(strip(deterministicA)===strip(deterministicB),'66 identical seeded political histories must create identical persistent office worlds and relationship casts');
  verify(deterministicA.rngCounter===beforeA&&deterministicB.rngCounter===beforeB,'67 deterministic political persistence must not perturb either life’s core RNG counter');

  const long=politicalFixture('politics-long-career');for(let termIndex=0;termIndex<5;termIndex+=1){long.finances.cash=2_000_000;const won=enterPolitics(long,termIndex<3?1:3);verify(won.success,`68.${termIndex+1} long-career fixture must win its deterministic campaign`);processPoliticsCareerYear(long);const current=activePoliticsCareerWorld(long)!;track(long).termEndAge=long.character.age+1;long.character.age+=1;long.currentYear+=1;processPoliticsCareerYear(long);verify(!current.active,`69.${termIndex+1} each synthetic completed term must archive before the next campaign`);long.character.age+=1;long.currentYear+=1;}
  verify(politicsCareerWorlds(long).length===5&&politicsCareerWorlds(long).filter(item=>item.active).length===0,'70 five completed political terms must remain historical with no phantom active office');
  const uniqueNames=new Set(politicsCareerWorlds(long).map(item=>item.name));verify(uniqueNames.size===5,'71 repeated office chapters must retain distinct persistent world identities');
  const politicsNpcIds=new Set(politicsCareerWorlds(long).flatMap(item=>item.members.map(member=>member.npcId)));verify(politicsNpcIds.size<=42,'72 multi-term political history must remain population-bounded through selective continuity and small rosters');

  return checks;
}
