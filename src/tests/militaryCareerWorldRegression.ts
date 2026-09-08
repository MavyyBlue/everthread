import { createNewGame } from '../systems/CharacterSystem';
import { GameEngine } from '../engine/GameEngine';
import { enlistMilitary, militaryTraining } from '../systems/SpecialCareerSystem';
import {
  activeMilitaryCareerWorld,
  ensureMilitaryCareerWorld,
  militaryCareerWorldView,
  militaryCareerWorlds,
  processMilitaryCareerYear,
} from '../systems/MilitaryCareerWorldSystem';
import { leaveSpecialCareer } from '../systems/SpecialCareerExitSystem';
import { npcCareerProjection, playerCareerLabel } from '../systems/CareerIdentitySystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { specialCareerReentryGate } from '../systems/CommitmentSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';
import type { GameState, SocialWorld } from '../types/game';

type Track = Record<string, number | string | boolean>;
function track(state:GameState){return state.specialCareers.military as Track;}
function group(world:SocialWorld,key:'command'|'peers'|'support'){return world.groups.find(item=>item.kind===`special:military:${key}`)!;}
function activeGroupIds(state:GameState,world:SocialWorld,key:'command'|'peers'|'support'){
  return group(world,key).memberNpcIds.filter(id=>world.members.some(member=>member.npcId===id&&member.leftAge===undefined)&&state.npcs[id]?.alive);
}
function adultFixture(seed:string,age=25){const state=createNewGame({seed});state.character.age=age;state.currentYear=2060+age;state.education=[];state.employment.current=undefined;state.employment.partTimeJobs=[];state.legal.criminalRecord=[];return state;}
function finiteBounded(value:unknown){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100;}

export async function runMilitaryCareerWorldRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Military-career world regression failed: ${message}`);}

  const child=adultFixture('military-underage',17);
  verify(!enlistMilitary(child,'Army').success&&militaryCareerWorlds(child).length===0,'1 military enlistment must reject a minor without creating a persistent unit');
  const recordBlocked=adultFixture('military-record-blocked');recordBlocked.legal.criminalRecord.push({crimeId:'fixture',age:20,convicted:true});
  verify(!enlistMilitary(recordBlocked,'Army').success&&militaryCareerWorlds(recordBlocked).length===0,'2 the existing criminal-record enlistment rule must remain authoritative');

  const state=adultFixture('military-world-foundation');const enlisted=enlistMilitary(state,'Army');
  verify(enlisted.success&&track(state).active===true,'3 a qualified adult must still be able to enter military service through the existing career action');
  verify(track(state).branch==='Army'&&track(state).path==='enlisted'&&Number(track(state).rank)===1,'4 enlistment must preserve the existing branch path and entry-rank semantics');
  verify(militaryCareerWorlds(state).length===0,'5 enlistment itself must not invent a parallel UI-only world before annual service processing');
  const rngBeforeWorld=state.rngCounter;processMilitaryCareerYear(state);const world=activeMilitaryCareerWorld(state);
  verify(Boolean(world)&&militaryCareerWorlds(state).length===1,'6 the first service-processing pass must create exactly one active military unit');
  verify(Boolean(world?.id.startsWith('special-military-'))&&world?.kind==='organization','7 the military ecosystem must reuse generic SocialWorld ownership under the special-military namespace');
  verify(world?.groups.length===3&&Boolean(group(world!,'command'))&&Boolean(group(world!,'peers'))&&Boolean(group(world!,'support')),'8 the unit must contain command service-peer and support groups');
  verify(activeGroupIds(state,world!,'command').length>=2&&activeGroupIds(state,world!,'command').length<=3,'9 the active command team must remain within its bounded roster');
  verify(activeGroupIds(state,world!,'peers').length>=4&&activeGroupIds(state,world!,'peers').length<=6,'10 service peers must remain within their bounded roster');
  verify(activeGroupIds(state,world!,'support').length>=2&&activeGroupIds(state,world!,'support').length<=4,'11 unit support must remain within its bounded roster');
  const commanderMember=world!.members.find(member=>member.role==='leader'&&activeGroupIds(state,world!,'command').includes(member.npcId));
  verify(Boolean(commanderMember)&&state.relationships.find(rel=>rel.npcId===commanderMember!.npcId)?.type==='boss','12 the unit must have one exact living commander represented through the ordinary relationship graph');
  verify(activeGroupIds(state,world!,'command').filter(id=>id!==commanderMember!.npcId).every(id=>state.relationships.find(rel=>rel.npcId===id)?.type==='coworker'),'13 non-commanding command staff must remain ordinary professional peers rather than duplicate bosses');
  verify([...activeGroupIds(state,world!,'peers'),...activeGroupIds(state,world!,'support')].every(id=>state.relationships.find(rel=>rel.npcId===id)?.type==='coworker'),'14 peers and support members must use existing professional relationship types');
  verify(world!.members.every(member=>Boolean(state.npcs[member.npcId])&&Boolean(state.relationships.find(rel=>rel.npcId===member.npcId))),'15 every military-world roster entry must resolve to one real NPC and relationship');
  const careerPeople=new Set(relationshipsForFolder(state,'career').map(rel=>rel.npcId));
  verify(world!.members.every(member=>careerPeople.has(member.npcId)),'16 People → Career Worlds must discover the military roster through the existing generic special-world affiliation logic');
  verify(playerCareerLabel(state)==='Army Service','17 active Army service must outrank unemployment in the player career identity');
  verify(world!.name.startsWith('Army · '),'18 the persistent unit identity must retain the player’s chosen branch');
  const commander=state.npcs[commanderMember!.npcId]!;commander.careerId='unrelated-standard-job';const commanderProjection=npcCareerProjection(state,commander);
  verify(commanderProjection.specialCareer?.kind==='military'&&commanderProjection.career.includes('Unit Commander')&&commanderProjection.career.includes(world!.name),'19 an active exact commander must present their military role rather than an unrelated autonomous standard job');
  verify(commanderProjection.annualIncome>0&&Number.isFinite(commanderProjection.annualIncome),'20 military-world NPC occupation projection must expose finite positive estimated income without mutating NPC career truth');
  const sameWorld=ensureMilitaryCareerWorld(state,{announce:false});
  verify(sameWorld===world&&militaryCareerWorlds(state).length===1,'21 repeated military-world assurance must reuse the active posting instead of creating duplicates');
  const viewSnapshot=JSON.stringify(state);const view=militaryCareerWorldView(state,world)!;
  verify(JSON.stringify(state)===viewSnapshot,'22 military Career World observation must remain strictly read-only');
  verify(view.commanderNpcId===commander.id&&view.peerNpcIds.length>=4&&view.supportNpcIds.length>=2,'23 the read-only military view must expose the exact commander peers and support members');
  verify(state.rngCounter===rngBeforeWorld,'24 persistent unit creation and passive projection must not consume the authoritative core RNG stream');
  verify(track(state).status==='active service'&&Number(track(state).postings)===1,'25 the career track must retain bounded current-service and posting-count markers');
  verify(Number(track(state).postingEndAge)>=state.character.age+3&&Number(track(state).postingEndAge)<=state.character.age+6,'26 a posting must receive a bounded deterministic service window rather than churn every Age Up');
  verify(finiteBounded(track(state).unitPrestige)&&finiteBounded(track(state).commandSupport)&&finiteBounded(track(state).unitCohesion)&&finiteBounded(track(state).serviceStanding),'27 military ecosystem metrics must remain finite and bounded');

  const skillBefore=Number(track(state).skill);const disciplineBefore=state.character.secondary.discipline;const fitnessBefore=state.health.fitness;const trained=militaryTraining(state);
  verify(trained.success&&Number(track(state).skill)===skillBefore+4,'28 the existing military training action must remain playable and advance its established skill track');
  verify(state.character.secondary.discipline===Math.min(100,disciplineBefore+3)&&state.health.fitness===Math.min(100,fitnessBefore+2),'29 military training must preserve its established discipline and fitness consequences');
  verify(!militaryTraining(state).success&&Number(track(state).skill)===skillBefore+4,'30 the central action economy must continue blocking same-age military-training spam');

  const annual=adultFixture('military-world-annual');enlistMilitary(annual,'Army');processMilitaryCareerYear(annual);const annualWorld=activeMilitaryCareerWorld(annual)!;const annualRng=annual.rngCounter;annual.character.age+=1;annual.currentYear+=1;processMilitaryCareerYear(annual);
  verify(annual.rngCounter===annualRng,'31 annual military-world simulation must use a dedicated deterministic substream without consuming core RNG');
  verify(Number(track(annual).lastMilitaryWorldProcessAge)===annual.character.age,'32 annual service processing must persist a same-age idempotence marker');
  verify(annualWorld.members.filter(member=>member.leftAge===undefined).every(member=>(annual.relationships.find(rel=>rel.npcId===member.npcId)?.yearsKnown??0)>=2),'33 continuing unit relationships must age from each member’s actual join age');
  const annualSnapshot=JSON.stringify(annual);processMilitaryCareerYear(annual);
  verify(JSON.stringify(annual)===annualSnapshot&&annual.rngCounter===annualRng,'34 repeated same-age military processing must be exactly idempotent');

  const peerReplace=adultFixture('military-peer-replacement');enlistMilitary(peerReplace,'Army');processMilitaryCareerYear(peerReplace);const peerWorld=activeMilitaryCareerWorld(peerReplace)!;const deadPeer=activeGroupIds(peerReplace,peerWorld,'peers')[0]!;peerReplace.npcs[deadPeer]!.alive=false;peerReplace.character.age+=1;peerReplace.currentYear+=1;processMilitaryCareerYear(peerReplace);
  verify(peerWorld.members.find(member=>member.npcId===deadPeer)?.leftAge===peerReplace.character.age,'35 a deceased service peer must be marked as having left the active unit roster');
  verify(activeGroupIds(peerReplace,peerWorld,'peers').length>=4&&activeGroupIds(peerReplace,peerWorld,'peers').length<=6,'36 annual processing must replenish service peers only within the configured bounded roster');
  verify(!activeGroupIds(peerReplace,peerWorld,'peers').includes(deadPeer),'37 deceased peers must never remain active military affiliates');
  const joinedNow=peerWorld.members.filter(member=>member.joinedAge===peerReplace.character.age&&activeGroupIds(peerReplace,peerWorld,'peers').includes(member.npcId));
  verify(joinedNow.every(member=>(peerReplace.relationships.find(rel=>rel.npcId===member.npcId)?.yearsKnown??0)===1),'38 replacement personnel must begin their relationship clock when they actually join rather than inheriting the unit’s age');

  const commandReplace=adultFixture('military-command-replacement');enlistMilitary(commandReplace,'Army');processMilitaryCareerYear(commandReplace);const commandWorld=activeMilitaryCareerWorld(commandReplace)!;const originalCommander=commandWorld.members.find(member=>member.role==='leader'&&member.leftAge===undefined)!;commandReplace.npcs[originalCommander.npcId]!.alive=false;commandReplace.character.age+=1;commandReplace.currentYear+=1;processMilitaryCareerYear(commandReplace);const replacementCommander=commandWorld.members.find(member=>member.role==='leader'&&member.leftAge===undefined&&commandReplace.npcs[member.npcId]?.alive);
  verify(commandWorld.members.find(member=>member.npcId===originalCommander.npcId)?.leftAge===commandReplace.character.age,'39 a deceased commander must leave the active affiliation without being erased from history');
  verify(Boolean(replacementCommander)&&replacementCommander!.npcId!==originalCommander.npcId,'40 a unit that loses its commander must deterministically establish a new exact living leader');
  verify(commandReplace.relationships.find(rel=>rel.npcId===replacementCommander!.npcId)?.type==='boss','41 command succession must update the ordinary relationship graph to match the new exact authority');
  verify(activeGroupIds(commandReplace,commandWorld,'command').length<=3,'42 command succession must never grow the active command roster beyond its configured maximum');

  const promotion=adultFixture('military-promotion-context');enlistMilitary(promotion,'Army');processMilitaryCareerYear(promotion);const promotionWorld=activeMilitaryCareerWorld(promotion)!;const promotionCommander=militaryCareerWorldView(promotion,promotionWorld)!.commanderNpcId!;promotion.character.age+=1;promotion.currentYear+=1;track(promotion).rank=Number(track(promotion).rank)+1;const promotedRank=Number(track(promotion).rank);promotion.timeline.push({id:'fixture-rank-line',year:promotion.currentYear,age:promotion.character.age,category:'career',importance:2,text:`You advanced to military rank ${promotedRank}.`});processMilitaryCareerYear(promotion);const contextualLine=promotion.timeline.find(entry=>entry.id==='fixture-rank-line')!;
  verify(contextualLine.npcIds?.[0]===promotionCommander&&contextualLine.text.includes(promotionWorld.name)&&contextualLine.text.includes(promotion.npcs[promotionCommander]!.firstName),'43 a generic annual rank-up must be contextualized to the exact current commander and unit instead of creating a duplicate promotion');
  verify(promotion.npcs[promotionCommander]!.memories.some(memory=>memory.kind==='military_promotion'&&memory.summary.includes(`rank ${promotedRank}`)),'44 the exact commander must remember the player’s promotion through normal NPC memory');
  verify(track(promotion).lastPromotionCommanderNpcId===promotionCommander&&track(promotion).lastPromotionWorldId===promotionWorld.id&&Number(track(promotion).lastPromotionAge)===promotion.character.age,'45 promotion context must retain bounded exact-person and exact-world references on the military track');

  const posting=adultFixture('military-posting-rotation');enlistMilitary(posting,'Army');processMilitaryCareerYear(posting);const firstPosting=activeMilitaryCareerWorld(posting)!;const firstPostingNpc=firstPosting.members[0]!.npcId;track(posting).postingEndAge=posting.character.age+1;posting.character.age+=1;posting.currentYear+=1;processMilitaryCareerYear(posting);const secondPosting=activeMilitaryCareerWorld(posting)!;
  verify(militaryCareerWorlds(posting).length===2&&secondPosting.id!==firstPosting.id&&secondPosting.active,'46 a due service posting must create one new active unit chapter rather than rewriting the old unit');
  verify(!firstPosting.active&&firstPosting.endedAge===posting.character.age&&firstPosting.members.every(member=>member.leftAge===posting.character.age),'47 reassignment must archive the completed unit and all its active affiliations at the transition age');
  verify(Number(track(posting).postings)===2&&track(posting).worldId===secondPosting.id&&track(posting).worldName===secondPosting.name,'48 the military track must point to the new posting while preserving the prior Social World in history');
  verify(relationshipsForFolder(posting,'career').some(rel=>rel.npcId===firstPostingNpc),'49 former unit contacts must remain available in People → Career Worlds after a posting change');
  verify(npcCareerProjection(posting,posting.npcs[firstPostingNpc]!).specialCareer===undefined,'50 an archived military affiliation must stop overriding that NPC’s current autonomous occupation');

  const exit=adultFixture('military-world-exit');enlistMilitary(exit,'Army');processMilitaryCareerYear(exit);const exitWorld=activeMilitaryCareerWorld(exit)!;const preservedNpc=exitWorld.members[0]!.npcId;const relationshipCount=exit.relationships.length;const left=leaveSpecialCareer(exit,'military');
  verify(left.success&&track(exit).leftPath===true&&track(exit).active===false&&track(exit).status==='left service','51 Leave Path must preserve the existing shared lifecycle while marking military service inactive');
  verify(!exitWorld.active&&exitWorld.endedAge===exit.character.age&&exitWorld.members.every(member=>member.leftAge===exit.character.age),'52 leaving military service must archive the current unit immediately rather than waiting for another Age Up');
  verify(exit.relationships.length===relationshipCount&&Boolean(exit.npcs[preservedNpc])&&relationshipsForFolder(exit,'career').some(rel=>rel.npcId===preservedNpc),'53 leaving service must preserve exact people relationships and Career World history');
  verify(!specialCareerReentryGate(exit,'military').allowed,'54 same-age re-entry must remain blocked by the shared career-freedom lifecycle gate');
  exit.character.age+=1;exit.currentYear+=1;const returnEngine=new GameEngine(exit);const returned=returnEngine.enlist('Army');
  verify(returned.success&&track(exit).leftPath===false&&Number(track(exit).returns)===1,'55 a later legal re-entry through the real GameEngine must clear Leave Path and record the return');
  processMilitaryCareerYear(exit);const returnedWorld=activeMilitaryCareerWorld(exit)!;
  verify(militaryCareerWorlds(exit).length===2&&returnedWorld.id!==exitWorld.id&&militaryCareerWorlds(exit).filter(item=>item.active).length===1,'56 returning to service must create a new active posting while the original unit stays archived');

  const officer=adultFixture('military-officer-label');enlistMilitary(officer,'Air Service',true);
  verify(playerCareerLabel(officer)==='Air Service','57 branch-aware career identity must not render the duplicate label “Air Service Service”');

  const integrated=adultFixture('military-ageup-integration',24);const integratedEngine=new GameEngine(integrated);const integratedEnlist=integratedEngine.enlist('Army');const ageResult=integratedEngine.ageUp();
  verify(integratedEnlist.success&&ageResult.success&&Boolean(activeMilitaryCareerWorld(integrated)),'58 the normal player GameEngine Age Up path must invoke the new military ecosystem and create a playable persistent unit');
  verify(militaryCareerWorlds(integrated).filter(item=>item.active).length===1,'59 the integrated Age Up path must never create duplicate simultaneous active military units');

  const longevity=adultFixture('military-long-service');enlistMilitary(longevity,'Army');for(let year=0;year<28;year+=1){processMilitaryCareerYear(longevity);longevity.character.age+=1;longevity.currentYear+=1;}processMilitaryCareerYear(longevity);const longWorlds=militaryCareerWorlds(longevity);
  verify(longWorlds.length>=4&&longWorlds.length<=11&&longWorlds.filter(item=>item.active).length===1,'60 multi-decade service must produce bounded posting history with exactly one current unit');
  verify(longWorlds.reduce((sum,item)=>sum+item.members.length,0)<=143,'61 long-service persistent cast growth must remain bounded rather than adding unbounded NPCs every year');
  verify(new Set(longWorlds.map(item=>item.name)).size===longWorlds.length,'62 recurring postings must retain distinct persistent unit identities rather than accidentally reusing the same organization name');

  const aiSource=adultFixture('military-ai-inspection');enlistMilitary(aiSource,'Army');processMilitaryCareerYear(aiSource);const aiWorld=activeMilitaryCareerWorld(aiSource)!;const aiCommander=militaryCareerWorldView(aiSource,aiWorld)!.commanderNpcId!;const aiSourceSnapshot=JSON.stringify(aiSource);
  await withEverthreadAiTestbench({state:aiSource,screen:'people'},async bench=>{
    const inspected=bench.inspectNpc(aiCommander) as {affiliations?:Array<{id:string;active:boolean}>}|undefined;
    verify(inspected?.affiliations?.some(item=>item.id===aiWorld.id&&item.active)===true,'63 the isolated AI testbench must be able to inspect the exact commander and active military affiliation without a parallel gameplay model');
    const observation=bench.observe();const people=(observation.data.people??[]) as Array<{id?:string}>;
    verify(people.some(person=>person.id===aiCommander),'64 the AI People observation must surface persistent military personnel through the normal relationship graph');
  });
  verify(JSON.stringify(aiSource)===aiSourceSnapshot,'65 AI inspection of the military ecosystem must not mutate the caller-owned player fixture');

  return checks;
}
