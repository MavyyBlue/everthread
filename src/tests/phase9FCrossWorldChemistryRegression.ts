import { actionUsesThisAge, consumeAction } from '../core/actionEconomy';
import { validateState } from '../core/invariants';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { CROSS_WORLD_CHEMISTRY_PLANS } from '../data/crossWorldChemistry';
import { NPC_PREFERENCE_TAG_IDS } from '../data/npcPreferences';
import { sharedExperienceActivityById } from '../data/sharedExperiences';
import { TOWN_PLACES } from '../data/townPlaces';
import { exportSave, importSave } from '../services/SaveSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { crossWorldChemistryContext, projectCrossWorldChemistryPlans } from '../systems/CrossWorldChemistrySystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import { shareCrossWorldExperienceWithNpc } from '../systems/RelationshipSystem';
import { specialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import type { GameState, Npc, Relationship, RelationshipType, SocialWorld, SocialWorldMemberRole } from '../types/game';
import type { CrossWorldChemistryContextKind } from '../types/crossWorldChemistry';

const placeIds=new Set(TOWN_PLACES.map(place=>place.id));
const preferenceTags=new Set<string>(NPC_PREFERENCE_TAG_IDS);

function clone<T>(value:T):T{return structuredClone(value);}
function state(seed:string,age=24){const value=createNewGame({seed});value.seed=seed;value.rngCounter=0;value.character.age=age;value.currentYear=2064;value.character.stats.happiness=90;value.character.stats.health=95;value.education=[];value.settings.autoSave=false;return value;}
function addNpc(value:GameState,id:string,type:RelationshipType='friend',age=value.character.age){
  const npc:Npc={id,firstName:'Morgan',lastName:'Thread',age,alive:true,health:95,happiness:92,wealth:5000,countryId:value.character.countryId,city:value.character.city,sexuality:'pansexual',fertility:70,maritalStatus:'single',traits:['loyal','playful'],hiddenOpinion:80,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['music','creative','cozy','social'],dislikes:[],aversions:[]}};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type,score:90,attraction:30,compatibility:90,yearsKnown:4};value.npcs[id]=npc;value.relationships.push(rel);ensureNpcLife(value,npc);return{npc,rel};
}
function addWorld(value:GameState,npcId:string,kind:'organization'|'workplace'|'school',options:{id?:string;name?:string;role?:SocialWorldMemberRole;groupKind?:string;active?:boolean;leftAge?:number}={}){
  const id=options.id??`${kind}-world`;const groupId=`${id}:group`;
  const world:SocialWorld={id,kind,name:options.name??id,countryId:value.character.countryId,city:value.character.city,startedAge:value.character.age-2,active:options.active??true,members:[{npcId,role:options.role??'member',joinedAge:value.character.age-2,...(options.leftAge!==undefined?{leftAge:options.leftAge}:{}),groupIds:[groupId]}],groups:[{id:groupId,name:'Shared group',kind:options.groupKind??`${id}:peers`,minAge:0,memberNpcIds:[npcId],playerJoinedAge:value.character.age-2,playerRole:'member',prestige:60}]};
  if(kind==='workplace')world.workplace={employmentKey:'test',employmentKind:'full_time',industry:'general',department:'main',morale:50,culture:50,tension:25,reputation:50,managerNpcId:options.role==='boss'?npcId:undefined,layoffs:0,disputes:0};
  if(kind==='school')world.school={stage:'university',educationKey:'test',attendance:85,conduct:85,socialStanding:50,honors:0,disciplinaryActions:0};
  value.socialWorlds.push(world);return world;
}
function addOrg(value:GameState,npcId:string,kind:CrossWorldChemistryContextKind,groupSuffix='peers',role:SocialWorldMemberRole='member'){
  return addWorld(value,npcId,'organization',{id:`special-${kind}-test`,name:`${kind} world`,role,groupKind:`${kind}:${groupSuffix}`});
}

export function runPhase9FCrossWorldChemistryRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9F cross-world chemistry regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===17,'01 cross-world chemistry must reuse schema 17 without adding durable state');
  verify(CROSS_WORLD_CHEMISTRY_PLANS.length===22&&new Set(CROSS_WORLD_CHEMISTRY_PLANS.map(plan=>plan.id)).size===22,'02 the authored cross-world plan registry must contain 22 unique plans');
  const expectedKinds:CrossWorldChemistryContextKind[]=['school','family','friend','workplace','acting','music','sports','modeling','racing','directing','combat','military','politics'];
  verify(expectedKinds.every(kind=>CROSS_WORLD_CHEMISTRY_PLANS.some(plan=>plan.contextKinds.includes(kind))),'03 every required school/family/friend/work/career context must have authored plans');
  verify(CROSS_WORLD_CHEMISTRY_PLANS.every(plan=>Boolean(sharedExperienceActivityById[plan.activityId])&&placeIds.has(plan.placeId)&&sharedExperienceActivityById[plan.activityId].placeIds.includes(plan.placeId)),'04 every cross-world plan must reuse a valid certified shared activity/place pair');
  verify(CROSS_WORLD_CHEMISTRY_PLANS.every(plan=>plan.preferenceTags.length>0&&plan.preferenceTags.every(tag=>preferenceTags.has(tag))),'05 every cross-world plan must use the existing preference vocabulary rather than a second chemistry taxonomy');

  const friend=state('9f-friend');const friendPair=addNpc(friend,'friend-peer','best_friend');const friendBefore=JSON.stringify(friend),friendRng=friend.rngCounter,friendId=friend.idCounter;const friendPlans=projectCrossWorldChemistryPlans(friend,friendPair.npc.id);
  verify(crossWorldChemistryContext(friend,friendPair.npc.id)?.kind==='friend'&&friendPlans.length===2,'06 adult best friends must project friendship plans from the real relationship record');
  verify(JSON.stringify(friend)===friendBefore&&friend.rngCounter===friendRng&&friend.idCounter===friendId,'07 cross-world browsing must be read-only and RNG/runtime-ID neutral');
  const family=state('9f-family');const familyPair=addNpc(family,'family-peer','sibling');verify(crossWorldChemistryContext(family,familyPair.npc.id)?.kind==='family'&&projectCrossWorldChemistryPlans(family,familyPair.npc.id).length===2,'08 adult family relationships must project family plans without a parallel family graph');
  const teen=state('9f-teen',16);const teenFriend=addNpc(teen,'teen-friend','friend',16);verify(projectCrossWorldChemistryPlans(teen,teenFriend.npc.id).length===0,'09 generic teen friendship must remain owned by Phase 9C rather than duplicate a 9F surface');

  const school=state('9f-school',20);const schoolPair=addNpc(school,'school-peer','friend',20);addWorld(school,schoolPair.npc.id,'school',{id:'school-active',role:'classmate'});verify(crossWorldChemistryContext(school,schoolPair.npc.id)?.kind==='school'&&projectCrossWorldChemistryPlans(school,schoolPair.npc.id).every(plan=>plan.context.kind==='school'),'10 active adult classmates must retain school context even after promotion to friend');
  const teacher=state('9f-teacher',20);const teacherPair=addNpc(teacher,'teacher-peer','friend',35);addWorld(teacher,teacherPair.npc.id,'school',{id:'school-teacher',role:'teacher'});verify(crossWorldChemistryContext(teacher,teacherPair.npc.id)?.kind==='friend','11 teachers/principals must not be misclassified as classmate chemistry');
  const work=state('9f-work');const workPair=addNpc(work,'work-peer','friend');addWorld(work,workPair.npc.id,'workplace',{id:'work-active',role:'coworker'});verify(crossWorldChemistryContext(work,workPair.npc.id)?.kind==='workplace'&&projectCrossWorldChemistryPlans(work,workPair.npc.id).some(plan=>plan.id==='work-lunch'),'12 active coworkers promoted to friend must retain workplace context from Workplace truth');
  const boss=state('9f-boss');const bossPair=addNpc(boss,'boss-peer','boss');addWorld(boss,bossPair.npc.id,'workplace',{id:'work-boss',role:'boss'});verify(crossWorldChemistryContext(boss,bossPair.npc.id)?.roleLabel==='Manager','13 active boss membership must project the real manager role');
  const leftWork=state('9f-left-work');const leftPair=addNpc(leftWork,'left-peer','friend');addWorld(leftWork,leftPair.npc.id,'workplace',{id:'work-old',role:'coworker',leftAge:leftWork.character.age-1});verify(crossWorldChemistryContext(leftWork,leftPair.npc.id)?.kind==='friend','14 archived/left workplace membership must stop owning current context and fall back to the current relationship');

  const professionalKinds:CrossWorldChemistryContextKind[]=['acting','music','sports','modeling','racing','directing','combat','military','politics'];
  for(const kind of professionalKinds){const value=state(`9f-${kind}`,kind==='racing'?20:24);const pair=addNpc(value,`${kind}-peer`,'coworker',value.character.age);addOrg(value,pair.npc.id,kind,kind==='acting'?'cast':kind==='music'?'creative':kind==='sports'?'team':kind==='modeling'?'agency':kind==='racing'?'race_team':kind==='directing'?'production_leads':kind==='combat'?'training':kind==='military'?'peers':'staff');verify(crossWorldChemistryContext(value,pair.npc.id)?.kind===kind&&projectCrossWorldChemistryPlans(value,pair.npc.id).length>=2,`15 ${kind} members must project their exact active professional world instead of generic coworker context`);}
  const rival=state('9f-rival');const rivalPair=addNpc(rival,'rival-peer','enemy');addOrg(rival,rivalPair.npc.id,'racing','rivals');verify(projectCrossWorldChemistryPlans(rival,rivalPair.npc.id).length===0,'16 enemies/professional rivals must not be offered friendly chemistry plans');
  const opposition=state('9f-opposition');const oppositionPair=addNpc(opposition,'opposition-peer','friend');addOrg(opposition,oppositionPair.npc.id,'politics','opposition');verify(crossWorldChemistryContext(opposition,oppositionPair.npc.id)?.kind==='friend','17 a reconciled/friendly opposition member must not inherit a false professional chemistry context');
  const estranged=state('9f-estranged');const estrangedPair=addNpc(estranged,'estranged-peer','spouse');estrangedPair.rel.estranged=true;verify(projectCrossWorldChemistryPlans(estranged,estrangedPair.npc.id).length===0,'18 estranged relationships must remain excluded from ordinary chemistry plans');
  const dead=state('9f-dead');const deadPair=addNpc(dead,'dead-peer');deadPair.npc.alive=false;verify(projectCrossWorldChemistryPlans(dead,deadPair.npc.id).length===0,'19 dead NPCs must fail projection safely');
  const stale=state('9f-stale');const stalePair=addNpc(stale,'stale-peer');delete stale.npcs[stalePair.npc.id];verify(projectCrossWorldChemistryPlans(stale,stalePair.npc.id).length===0,'20 stale NPC ids must fail projection safely');
  const remote=state('9f-remote');const remotePair=addNpc(remote,'remote-peer');addWorld(remote,remotePair.npc.id,'workplace',{id:'remote-work',role:'coworker'});remotePair.npc.city='Elsewhere';const remotePlans=projectCrossWorldChemistryPlans(remote,remotePair.npc.id);verify(remotePlans.length===2&&remotePlans.every(plan=>!plan.allowed&&plan.reason?.includes('not currently in Everthread')),'21 remote exact NPCs must remain visible but disabled through the existing shared-experience availability authority');

  const commit=state('9f-commit');const commitPair=addNpc(commit,'music-peer','coworker');const musicWorld=addOrg(commit,commitPair.npc.id,'music','creative');commitPair.rel.score=88;commitPair.rel.compatibility=100;commitPair.npc.hiddenOpinion=100;commitPair.npc.happiness=100;commit.character.stats.happiness=100;const beforeChem=specialCareerWorldView(commit,musicWorld)?.chemistry??0;const beforeScore=commitPair.rel.score,beforeOpinion=commitPair.npc.hiddenOpinion,beforeTimeline=commit.timeline.length,beforeRng=commit.rngCounter,beforeMemories=commitPair.npc.memories.length;const result=shareCrossWorldExperienceWithNpc(commit,commitPair.npc.id,'music-home-session');
  verify(result.success&&result.experience?.band==='great'&&result.experience.activityLabel==='Jam together','22 an exact contextual plan must commit through the real shared evaluator and preserve contextual copy');
  verify(commit.rngCounter===beforeRng+1&&commit.timeline.length===beforeTimeline+1&&actionUsesThisAge(commit,'social.npc.total',commitPair.npc.id)===1&&actionUsesThisAge(commit,'social.npc.action',`${commitPair.npc.id}:chemistry:music-home-session`)===1,'23 a committed chemistry outing must consume exactly one gameplay RNG draw, timeline entry, total-social use, and exact plan use');
  verify(commitPair.rel.score===Math.min(100,beforeScore+(result.experience?.relationshipDelta??0))&&commitPair.npc.hiddenOpinion===Math.min(100,beforeOpinion+(result.experience?.opinionDelta??0)),'24 relationship score and hidden opinion must remain RelationshipSystem-owned consequences from the shared result');
  verify(commitPair.npc.memories.length===beforeMemories+1&&commitPair.npc.memories.at(-1)?.kind==='cross_world:music:music-home-session','25 meaningful shared-world outings must use the existing bounded NPC memory authority with exact context/plan identity');
  verify((specialCareerWorldView(commit,musicWorld)?.chemistry??0)>beforeChem,'26 the existing special-career world view must immediately observe the changed real relationship instead of reading a second chemistry score');
  verify(!('crossWorldChemistry' in (commit as unknown as Record<string,unknown>))&&!('chemistryHistory' in (commit as unknown as Record<string,unknown>)),'27 9F must add no durable cross-world chemistry ledger to GameState');
  const repeatRng=commit.rngCounter,repeatTimeline=commit.timeline.length;const repeat=shareCrossWorldExperienceWithNpc(commit,commitPair.npc.id,'music-home-session');verify(!repeat.success&&commit.rngCounter===repeatRng&&commit.timeline.length===repeatTimeline,'28 repeating the same contextual plan in one year must be blocked before RNG/timeline mutation');

  const budget=state('9f-budget');const budgetPair=addNpc(budget,'budget-peer');addWorld(budget,budgetPair.npc.id,'workplace',{role:'coworker'});consumeAction(budget,{policy:'social.npc.total',target:budgetPair.npc.id,units:3});const budgetBefore=JSON.stringify(budget);verify(projectCrossWorldChemistryPlans(budget,budgetPair.npc.id).every(plan=>!plan.allowed)&&!shareCrossWorldExperienceWithNpc(budget,budgetPair.npc.id,'work-lunch').success&&JSON.stringify(budget)===budgetBefore,'29 the shared three-per-person yearly social budget must block contextual plans without hidden mutation');

  const save=state('9f-save');const savePair=addNpc(save,'save-peer','coworker');addOrg(save,savePair.npc.id,'music','creative');savePair.rel.score=90;savePair.rel.compatibility=100;savePair.npc.hiddenOpinion=100;shareCrossWorldExperienceWithNpc(save,savePair.npc.id,'music-home-session');const restored=importSave(exportSave(save));verify(restored.relationships.find(rel=>rel.npcId===savePair.npc.id)?.score===savePair.rel.score&&restored.npcs[savePair.npc.id]?.memories.some(memory=>memory.kind==='cross_world:music:music-home-session'),'30 ordinary save/export/import must preserve authoritative relationship/memory consequences without special 9F state');

  const rewind=state('9f-rewind');rewind.flags.rewindEnabled=true;const rewindPair=addNpc(rewind,'rewind-peer','coworker');addOrg(rewind,rewindPair.npc.id,'music','creative');rewindPair.rel.score=90;rewindPair.rel.compatibility=100;rewindPair.npc.hiddenOpinion=100;captureRewindSnapshot(rewind);const rewindBaseline=clone(rewind);shareCrossWorldExperienceWithNpc(rewind,rewindPair.npc.id,'music-home-session');verify(rewindToAge(rewind,rewind.character.age).success,'31 rewind must accept a snapshot that predates a cross-world outing');const rewoundRel=rewind.relationships.find(rel=>rel.npcId===rewindPair.npc.id);verify(rewoundRel?.score===rewindBaseline.relationships.find(rel=>rel.npcId===rewindPair.npc.id)?.score&&rewind.rngCounter===rewindBaseline.rngCounter&&rewind.timeline.length===rewindBaseline.timeline.length&&rewind.npcs[rewindPair.npc.id]?.memories.length===rewindBaseline.npcs[rewindPair.npc.id]?.memories.length,'32 rewind must atomically restore relationship/RNG/timeline/memory truth with no cross-world residue');

  const deterministicA=state('9f-deterministic');const deterministicPair=addNpc(deterministicA,'det-peer','coworker');addOrg(deterministicA,deterministicPair.npc.id,'music','creative');deterministicPair.rel.score=88;deterministicPair.rel.compatibility=95;deterministicPair.npc.hiddenOpinion=80;const deterministicB=clone(deterministicA);const resultA=shareCrossWorldExperienceWithNpc(deterministicA,deterministicPair.npc.id,'music-home-session');const resultB=shareCrossWorldExperienceWithNpc(deterministicB,deterministicPair.npc.id,'music-home-session');verify(JSON.stringify(resultA)===JSON.stringify(resultB)&&JSON.stringify(deterministicA)===JSON.stringify(deterministicB),'33 identical seeded states/actions must produce byte-identical cross-world results and state');
  const invariantIssues=[...validateState(commit),...validateState(save),...validateState(deterministicA)];verify(invariantIssues.length===0,`34 committed cross-world states must remain invariant-clean (${invariantIssues.join(' | ')})`);

  const childState=state('9f-child');childState.character.alive=false;const child=addNpc(childState,'heir','child',18);childState.character.age=50;child.npc.age=18;const worldPair=addNpc(childState,'world-peer','friend',50);addWorld(childState,worldPair.npc.id,'workplace',{role:'coworker'});const handoff=continueAsChild(childState,child.npc.id);verify(handoff.success&&!('crossWorldChemistry' in (childState as unknown as Record<string,unknown>)),'35 descendant continuation must require no copied cross-world ledger because context is always projected from the successor’s existing truth');

  return checks;
}
