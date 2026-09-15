import { createNewGame } from '../systems/CharacterSystem';
import { ensureSpecialCareerRelationships } from '../systems/SpecialCareerRelationshipSystem';
import { ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { addNpcPropertyHolding } from '../systems/NpcAssetSystem';
import { specialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import { personalItemById } from '../data/personalItems';
import type { Npc, PropertyAsset, SocialWorld } from '../types/game';
import { EverthreadAiTestbench, withEverthreadAiTestbench } from './aiInteractionTestbench';

export async function runAiInteractionRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`AI interaction regression failed: ${message}`);}

  const pristine=createNewGame({seed:'ai-test-pristine'});pristine.character.age=24;pristine.currentYear=2064;pristine.education=[];const pristineSerialized=JSON.stringify(pristine);
  const bench=new EverthreadAiTestbench({state:pristine,screen:'life'});
  try{
    verify(bench.getState()!==pristine,'1 the testbench must clone supplied state instead of mutating the caller-owned player object');
    verify(bench.getState().slotId.startsWith('ai-test-'),'2 every testbench life must use an isolated test-only slot id');
    verify(JSON.stringify(pristine)===pristineSerialized,'3 constructing the testbench must leave the supplied source state byte-for-byte unchanged');

    const beforeObserve=JSON.stringify(bench.getState());const life=bench.observe('life');const afterObserve=JSON.stringify(bench.getState());
    verify(beforeObserve===afterObserve,'4 observing the AI interface must be read-only');
    verify(life.screen==='life'&&life.character.age===24,'5 Life observation must expose screen identity and authoritative character age');
    verify(life.actions.some(action=>action.id==='life.age_up'&&action.enabled),'6 Life observation must expose a stable enabled Age Up action');
    const rendered=bench.renderText('life');verify(rendered.includes('SCREEN life')&&rendered.includes('life.age_up'),'7 the testbench must provide a compact text interface suitable for AI inspection');
    const beforeCareerObserve=JSON.stringify(bench.getState());bench.observe('career');verify(JSON.stringify(bench.getState())===beforeCareerObserve,'8 Career observation and shared-gate projection must remain read-only');

    const allScreens=(['life','people','activities','career','assets'] as const).map(screen=>bench.observe(screen));verify(allScreens.every((observed,index)=>observed.screen===(['life','people','activities','career','assets'] as const)[index]&&Array.isArray(observed.actions)),'9 all five player navigation domains must have AI-readable semantic observations and action lists');

    const activities=bench.observe('activities');
    verify(activities.actions.some(action=>action.id==='activities.walking'),'10 Activities must expose stable semantic action ids rather than screen coordinates');
    const revisionBefore=bench.getState().actionLedger.revision;const walking=bench.execute('activities.walking');
    verify(walking.result.success,'11 a semantic activity command must execute through the real GameEngine');
    verify(bench.getState().actionLedger.revision>revisionBefore,'12 real action-economy state must advance through the AI interaction path');
    verify(walking.diff.length>0&&walking.invariantIssues.length===0,'13 each interaction must return a state diff and immediate invariant watch result');

    const meet=bench.execute('activities.meet_date');
    verify(meet.result.success,'14 the AI interface must be able to drive a real relationship-producing action');
    const newRel=bench.getState().relationships.at(-1);verify(Boolean(newRel),'15 relationship-producing actions must expose their real persisted NPC relationship');
    const person=bench.inspectNpc(newRel!.npcId);verify(Boolean(person)&&person!.id===newRel!.npcId&&person!.alive,'16 inspectNpc must resolve the exact persistent NPC id');
    verify(bench.observe('people').actions.some(action=>action.targetId===newRel!.npcId),'17 People observation must expose semantic actions targeted at the exact NPC');
    verify(bench.observe('people').actions.some(action=>action.id==='people.ask_date'&&action.targetId===newRel!.npcId),'18 relationship-specific action availability must reuse the real Ask on Date eligibility projection');

    const forced=bench.execute({id:'test.force_event',args:{eventId:'midlife_reassessment'}});
    verify(forced.result.success&&Boolean(bench.getState().pendingEvent),'19 private test setup commands may create a pending event through the real engine without player UI exposure');
    const pendingLife=bench.observe('life');
    verify(pendingLife.actions.some(action=>action.id==='life.age_up'&&!action.enabled),'20 unresolved events must disable Age Up in the semantic UI just as they block the player flow');
    verify(pendingLife.pendingEvent?.choices.length===bench.getState().pendingEvent?.choices.length,'21 pending EventSheet choices must be represented exactly by stable choice ids');
    verify(bench.observe('activities').actions.every(action=>!action.enabled),'22 non-event gameplay actions must be semantically blocked while a required event is unresolved');
    const blocked=bench.execute('activities.walking');verify(!blocked.result.success&&blocked.result.messages[0]?.text.includes('Resolve'),'23 command execution itself must enforce the unresolved-event interaction lock');
    const choiceId=bench.getState().pendingEvent!.choices[0]!.id;const resolved=bench.execute({id:'event.choose',args:{choiceId}});
    verify(resolved.result.success&&!bench.getState().pendingEvent,'24 event choices must resolve through GameEngine and clear the pending event');
    verify(resolved.invariantIssues.length===0,'25 event resolution must run invariant watches immediately after the interaction');

    await bench.flushPersistence();const keys=bench.storageKeys();
    const isolatedSaveKey=`everthread-save-${bench.getState().slotId}`;verify(keys.includes(isolatedSaveKey),'26 GameEngine autosaves must be intercepted under the testbench-owned in-memory save key');
    verify(JSON.stringify(pristine)===pristineSerialized,'27 the caller-owned source/player state must remain untouched after a complete interaction sequence');
  } finally {await bench.dispose();}

  const careerState=createNewGame({seed:'ai-test-career'});careerState.character.age=28;careerState.currentYear=2068;careerState.education=[];careerState.specialCareers.modeling={active:true,jobs:7,technique:78,reputation:65};
  const careerWorld=ensureSpecialCareerWorld(careerState,'modeling','agency',{announce:false});ensureSpecialCareerRelationships(careerState,careerWorld);
  await withEverthreadAiTestbench({state:careerState,screen:'career'},async careerBench=>{
    const careerView=careerBench.observe('career');
    const lifecycles=careerView.data.lifecycles as Array<{key:string;status:string;established:boolean}>;
    verify(lifecycles.some(view=>view.key==='modeling'&&view.established),'28 Career observation must expose the normalized lifecycle used by the real player UI');
    verify(careerView.actions.some(action=>action.id==='career.special.retire'&&action.targetId==='modeling'&&action.enabled),'29 lifecycle actions must expose the existing retirement gate and reason contract');
    const inspected=careerBench.inspectCareer('modeling');verify(inspected.worlds.some(world=>world.id===careerWorld.id&&world.active),'30 inspectCareer must identify the exact persistent Career World');
    const retirement=careerBench.execute({id:'career.special.retire',args:{path:'modeling'}});
    verify(retirement.result.success,'31 semantic retirement must call the same GameEngine retirement path as the player interface');
    verify(careerBench.inspectCareer('modeling').lifecycle?.retired===true,'32 AI observation must immediately reflect the authoritative retired lifecycle state');
    verify(careerBench.inspectCareer('modeling').worlds.every(world=>!world.active),'33 testbench retirement must archive the same Career World rather than maintaining a parallel fake state');
    const memberId=careerWorld.members[0]?.npcId;verify(Boolean(memberId),'34 career fixture must contain a persistent NPC for inspection');
    verify(careerBench.inspectNpc(memberId!)?.affiliations.some((item:{id:string})=>item.id===careerWorld.id)===true,'35 archived Career World affiliation history must remain inspectable through the AI interface');
    verify(retirement.invariantIssues.length===0,'36 lifecycle interaction must finish with no watched state invariant failures');
    verify(careerBench.renderText('career').includes('Retired'),'37 the AI text interface must immediately reflect changed lifecycle state');
  });

  const runDeterministic=async()=>withEverthreadAiTestbench({state:(()=>{const state=createNewGame({seed:'ai-test-determinism'});state.character.age=26;state.currentYear=2066;state.education=[];return state;})(),screen:'activities'},async deterministicBench=>{
    const transcript=deterministicBench.runScenario(['activities.walking','activities.meditation']);
    await deterministicBench.flushPersistence();return JSON.stringify(transcript);
  });
  const deterministicA=await runDeterministic();const deterministicB=await runDeterministic();
  verify(deterministicA===deterministicB,'38 identical seeded semantic interaction scripts must produce identical AI-readable transcripts');

  await withEverthreadAiTestbench({seed:'ai-test-unknown',screen:'life'},async unknownBench=>{
    const before=JSON.stringify(unknownBench.getState());const unknown=unknownBench.execute('not.a.real.action');
    verify(!unknown.result.success&&unknown.diff.length===0,'39 unknown semantic actions must fail cleanly without mutating game state');
    verify(JSON.stringify(unknownBench.getState())===before,'40 rejected unknown commands must preserve the complete isolated state');
    verify(unknown.invariantIssues.length===0,'41 even rejected commands must report the invariant-watch status');
  });

  const youthState=createNewGame({seed:'ai-test-youth-social'});youthState.character.age=12;youthState.currentYear=2052;youthState.education=[];
  const youthNpc={id:'ai-youth-peer',firstName:'Jamie',lastName:'Thread',age:12,alive:true,health:90,happiness:65,wealth:400,countryId:youthState.character.countryId,city:youthState.character.city,sexuality:'bisexual' as const,fertility:60,maritalStatus:'single' as const,traits:['playful','loyal'],hiddenOpinion:10,memories:[],parentIds:[],childIds:[],simulationTier:'full' as const};
  youthState.npcs[youthNpc.id]=youthNpc;youthState.relationships.push({id:'ai-youth-rel',npcId:youthNpc.id,type:'classmate',score:62,attraction:0,compatibility:72,yearsKnown:2});ensureNpcLife(youthState,youthNpc);
  await withEverthreadAiTestbench({state:youthState,screen:'people'},async youthBench=>{
    const people=youthBench.observe('people');const outing=people.actions.find(action=>action.id==='people.shared_experience'&&action.targetId===youthNpc.id&&action.label.includes('Arcade'));
    verify(Boolean(outing&&outing.enabled),'42 AI People parity must expose an enabled authored youth outing for the exact persistent classmate');
    verify(outing?.args?.join(',')==='npcId,placeId,activityId','43 shared-experience commands must expose exact semantic arguments rather than screen coordinates');
    const step=youthBench.execute({id:'people.shared_experience',args:{npcId:youthNpc.id,placeId:'crossroads-mall',activityId:'mall_games'}});
    verify(step.result.success&&step.diff.some(diff=>diff.path.includes('relationships')),'44 AI youth outings must execute through the real GameEngine and mutate the authoritative relationship');
    verify(step.invariantIssues.length===0,'45 AI youth-social execution must leave the shared game state invariant-clean');
  });

  const datingState=createNewGame({seed:'ai-test-dating-1'});datingState.seed='ai-test-dating-1';datingState.rngCounter=0;datingState.character.age=24;datingState.currentYear=2064;datingState.character.orientation='pansexual';datingState.character.stats.happiness=90;datingState.character.stats.health=95;datingState.education=[];
  const datingNpc:Npc={id:'ai-dating-peer',firstName:'Riley',lastName:'Thread',age:24,alive:true,health:95,happiness:90,wealth:5000,countryId:datingState.character.countryId,city:datingState.character.city,gender:'female',sexuality:'pansexual',fertility:70,maritalStatus:'single',traits:['romantic','loyal'],hiddenOpinion:100,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['romance','food','film','nature'],dislikes:[],aversions:[]}};
  datingState.npcs[datingNpc.id]=datingNpc;datingState.relationships.push({id:'ai-dating-rel',npcId:datingNpc.id,type:'friend',score:100,attraction:100,compatibility:100,yearsKnown:4});ensureNpcLife(datingState,datingNpc);
  await withEverthreadAiTestbench({state:datingState,screen:'people'},async datingBench=>{
    const initial=datingBench.observe('people');verify(initial.actions.some(action=>action.id==='people.ask_date'&&action.targetId===datingNpc.id&&action.enabled),'46 AI People parity must expose Ask on Date for the exact eligible NPC');
    const invite1=datingBench.execute({id:'people.ask_date',args:{npcId:datingNpc.id}});verify(invite1.result.success&&datingBench.getState().relationships.find(rel=>rel.npcId===datingNpc.id)?.romance?.pendingDate!==undefined,'47 semantic Ask on Date must execute through the real GameEngine and persist the accepted exact-NPC plan');
    const diner=datingBench.observe('people').actions.find(action=>action.id==='people.date'&&action.targetId===datingNpc.id&&action.label.includes('Diner'));verify(Boolean(diner?.enabled),'48 an accepted date must project exact location/activity choices through the AI People surface');
    const date1=datingBench.execute({id:'people.date',args:{npcId:datingNpc.id,placeId:'nightjar-diner',activityId:'diner_meal'}});verify(date1.result.success&&datingBench.getState().relationships.find(rel=>rel.npcId===datingNpc.id)?.romance?.dateHistory?.length===1,'49 semantic date execution must reuse the real shared-experience engine and persist bounded relationship-owned date history');
    const invite2=datingBench.execute({id:'people.ask_date',args:{npcId:datingNpc.id}});const date2=invite2.result.success?datingBench.execute({id:'people.date',args:{npcId:datingNpc.id,placeId:'crossroads-mall',activityId:'movie_outing'}}):undefined;
    const invite3=datingBench.execute({id:'people.ask_date',args:{npcId:datingNpc.id}});const date3=invite3.result.success?datingBench.execute({id:'people.date',args:{npcId:datingNpc.id,placeId:'weaver-park',activityId:'park_walk'}}):undefined;
    verify(Boolean(date2?.result.success&&date3?.result.success&&datingBench.getState().relationships.find(rel=>rel.npcId===datingNpc.id)?.romance?.dateHistory?.length===3),'50 three successful semantic dates must build the same bounded hidden romantic history as the player UI');
    verify(datingBench.observe('people').actions.some(action=>action.id==='people.become_partners'&&action.targetId===datingNpc.id&&action.enabled),'51 AI parity must expose Become Partners only after sufficient real date momentum exists');
    const partners=datingBench.execute({id:'people.become_partners',args:{npcId:datingNpc.id}});verify(partners.result.success&&datingBench.getState().relationships.find(rel=>rel.npcId===datingNpc.id)?.type==='partner'&&partners.invariantIssues.length===0,'52 semantic Become Partners must call the same bounded milestone path and leave authoritative state invariant-clean');
  });

  const giftState=createNewGame({seed:'ai-test-real-gift'});giftState.character.age=24;giftState.currentYear=2064;giftState.education=[];const giftDef=personalItemById.threadfox_plush!;giftState.personalInventory.items.push({id:'ai-gift-instance',itemId:giftDef.id,acquiredAge:24,acquiredYear:2064,sourcePlaceId:giftDef.vendorPlaceId,purchasePrice:giftDef.price});
  const giftNpc:Npc={id:'ai-gift-peer',firstName:'Casey',lastName:'Thread',age:24,alive:true,health:92,happiness:85,wealth:4000,countryId:giftState.character.countryId,city:giftState.character.city,sexuality:'pansexual',fertility:65,maritalStatus:'single',traits:['generous','loyal'],hiddenOpinion:70,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['cute','cozy','playful'],dislikes:[],aversions:[]}};giftState.npcs[giftNpc.id]=giftNpc;giftState.relationships.push({id:'ai-gift-rel',npcId:giftNpc.id,type:'friend',score:80,attraction:20,compatibility:82,yearsKnown:3});ensureNpcLife(giftState,giftNpc);
  await withEverthreadAiTestbench({state:giftState,screen:'people'},async giftBench=>{
    const people=giftBench.observe('people');const giftAction=people.actions.find(action=>action.id==='people.gift'&&action.targetId===giftNpc.id&&action.label.includes(giftDef.name));
    verify(Boolean(giftAction?.enabled),'53 AI People parity must expose the exact owned personal-item gift for the exact persistent NPC');
    verify(giftAction?.args?.join(',')==='npcId,itemInstanceId','54 real-gift semantic actions must require exact NPC and exact owned item-instance ids rather than a generic Gift button');
    verify(!people.actions.some(action=>action.id==='people.interact.gift'),'55 AI People parity must stop advertising the obsolete cash-funded generic Gift action');
    const giftStep=giftBench.execute({id:'people.gift',args:{npcId:giftNpc.id,itemInstanceId:'ai-gift-instance'}});
    verify(giftStep.result.success&&giftBench.getState().personalInventory.items.every(item=>item.id!=='ai-gift-instance'),'56 semantic real gifting must execute through GameEngine and transfer/remove the exact owned item once');
    verify(giftStep.diff.some(diff=>diff.path.includes('personalInventory'))&&giftStep.diff.some(diff=>diff.path.includes('relationships')),'57 AI gift execution must expose authoritative inventory plus relationship mutation rather than a synthetic UI-only result');
    verify(giftStep.invariantIssues.length===0,'58 AI exact-item gifting must leave the shared GameState invariant-clean');
  });

  const chemistryState=createNewGame({seed:'ai-test-cross-world'});chemistryState.character.age=24;chemistryState.currentYear=2064;chemistryState.education=[];chemistryState.rngCounter=0;
  const chemistryNpc:Npc={id:'ai-music-peer',firstName:'Avery',lastName:'Thread',age:24,alive:true,health:95,happiness:95,wealth:4500,countryId:chemistryState.character.countryId,city:chemistryState.character.city,sexuality:'pansexual',fertility:65,maritalStatus:'single',traits:['creative','loyal'],hiddenOpinion:90,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['music','creative','cozy','social'],dislikes:[],aversions:[]}};chemistryState.npcs[chemistryNpc.id]=chemistryNpc;chemistryState.relationships.push({id:'ai-music-rel',npcId:chemistryNpc.id,type:'coworker',score:84,attraction:10,compatibility:92,yearsKnown:3});ensureNpcLife(chemistryState,chemistryNpc);
  const chemistryWorld:SocialWorld={id:'special-music-ai-world',kind:'organization',name:'AI Session Crew',countryId:chemistryState.character.countryId,city:chemistryState.character.city,startedAge:22,active:true,members:[{npcId:chemistryNpc.id,role:'member',joinedAge:22,groupIds:['special-music-ai-world:creative']}],groups:[{id:'special-music-ai-world:creative',name:'Creative circle',kind:'music:creative',minAge:14,memberNpcIds:[chemistryNpc.id],playerJoinedAge:22,playerRole:'member',prestige:62}]};chemistryState.socialWorlds.push(chemistryWorld);
  await withEverthreadAiTestbench({state:chemistryState,screen:'people'},async chemistryBench=>{
    const people=chemistryBench.observe('people');const action=people.actions.find(item=>item.id==='people.cross_world_experience'&&item.targetId===chemistryNpc.id&&item.label.includes('Jam together'));
    verify(Boolean(action?.enabled&&action.label.includes('Creative partner')),'59 AI People parity must expose the exact active professional-world plan and role for the exact NPC');
    verify(action?.args?.join(',')==='npcId,planId','60 cross-world semantic actions must require exact NPC and authored plan ids rather than location coordinates');
    const beforeRel=chemistryBench.getState().relationships.find(rel=>rel.npcId===chemistryNpc.id)!.score;const beforeChem=specialCareerWorldView(chemistryBench.getState(),chemistryBench.getState().socialWorlds.find(world=>world.id===chemistryWorld.id)!)!.chemistry;
    const step=chemistryBench.execute({id:'people.cross_world_experience',args:{npcId:chemistryNpc.id,planId:'music-home-session'}});const afterState=chemistryBench.getState();const afterRel=afterState.relationships.find(rel=>rel.npcId===chemistryNpc.id)!.score;const afterChem=specialCareerWorldView(afterState,afterState.socialWorlds.find(world=>world.id===chemistryWorld.id)!)!.chemistry;
    verify(step.result.success&&afterRel>beforeRel,'61 semantic cross-world execution must call the real GameEngine/RelationshipSystem path and improve the exact relationship when the outing lands well');
    verify(afterChem>beforeChem,'62 AI cross-world execution must be observed by the existing career-world chemistry projection through that same relationship, with no parallel score');
    verify(step.diff.some(diff=>diff.path.includes('relationships'))&&step.invariantIssues.length===0,'63 AI cross-world execution must expose authoritative relationship mutation and leave shared state invariant-clean');
    verify(afterState.npcs[chemistryNpc.id]?.memories.some(memory=>memory.kind==='cross_world:music:music-home-session')===true,'64 the AI path must write the same bounded exact-context NPC memory as the player path');
  });


  const residenceAssetState=createNewGame({seed:'ai-test-residence-assets'});residenceAssetState.character.age=28;residenceAssetState.currentYear=2068;residenceAssetState.education=[];residenceAssetState.flags.financiallyIndependent=true;
  const aiHomeA:PropertyAsset={id:'ai-home-a',typeId:'starter_house_standard',name:'Juniper House',location:residenceAssetState.character.city,purchasePrice:150_000,marketValue:170_000,condition:90,age:4,amenities:['yard'],origin:'purchased',primaryResidence:true};
  const aiHomeB:PropertyAsset={id:'ai-home-b',typeId:'starter_house_value',name:'Willow House',location:residenceAssetState.character.city,purchasePrice:180_000,marketValue:205_000,condition:88,age:6,amenities:['garage'],origin:'purchased'};residenceAssetState.assets.properties.push(aiHomeA,aiHomeB);
  await withEverthreadAiTestbench({state:residenceAssetState,screen:'assets'},async residenceBench=>{
    const assets=residenceBench.observe('assets');const residence=assets.data.residence as {propertyId?:string;label?:string};
    verify(residence.propertyId==='ai-home-a'&&assets.actions.some(action=>action.id==='assets.property.set_home'&&action.enabled),'65 Assets semantic observation must expose the authoritative projected home plus the existing property-home action');
    const switched=residenceBench.execute({id:'assets.property.set_home',args:{assetId:'ai-home-b'}});const after=residenceBench.observe('assets').data.residence as {propertyId?:string;label?:string};
    verify(switched.result.success&&after.propertyId==='ai-home-b','66 semantic Make Home must call GameEngine/PropertySystem for the exact owned property and update the projected residence');
    verify(switched.diff.some(diff=>diff.path.includes('assets'))&&switched.invariantIssues.length===0,'67 semantic home designation must expose authoritative property mutation and leave shared state invariant-clean');
  });

  const residencePeopleState=createNewGame({seed:'ai-test-residence-people'});residencePeopleState.character.age=28;residencePeopleState.currentYear=2068;residencePeopleState.education=[];residencePeopleState.character.stats.happiness=90;
  const homeNpc:Npc={id:'ai-home-friend',firstName:'Jordan',lastName:'Thread',age:28,alive:true,health:95,happiness:90,wealth:65_000,countryId:residencePeopleState.character.countryId,city:residencePeopleState.character.city,sexuality:'pansexual',fertility:65,maritalStatus:'single',traits:['loyal','playful'],hiddenOpinion:90,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['home','cozy','social'],dislikes:[],aversions:[]}};residencePeopleState.npcs[homeNpc.id]=homeNpc;residencePeopleState.relationships.push({id:'ai-home-rel',npcId:homeNpc.id,type:'friend',score:88,attraction:15,compatibility:90,yearsKnown:4});ensureNpcLife(residencePeopleState,homeNpc);homeNpc.assetPortfolio={properties:[],businesses:[]};addNpcPropertyHolding(residencePeopleState,homeNpc,{id:'ai-npc-home',typeId:'starter_house_standard',name:'Maple Cottage',location:homeNpc.city,purchasePrice:120_000,marketValue:145_000,mortgageBalance:15_000,condition:91,propertyAge:5,acquiredAge:23,origin:'purchased',primaryResidence:true});
  await withEverthreadAiTestbench({state:residencePeopleState,screen:'people'},async residencePeopleBench=>{
    const people=residencePeopleBench.observe('people');const action=people.actions.find(item=>item.id==='people.residential_experience'&&item.targetId===homeNpc.id&&item.label.includes('Maple Cottage'));
    verify(Boolean(action?.enabled&&action.args?.join(',')==='npcId,planId'),'68 People semantic parity must expose an exact-NPC residential visit at that NPC actual household/home');
    const inspected=residencePeopleBench.inspectNpc(homeNpc.id);verify(inspected?.residence?.propertyId==='ai-npc-home'&&inspected?.residence?.label?.includes('Maple Cottage'),'69 inspectNpc must expose the same authoritative household residence projected for the player-facing person sheet');
    const beforeScore=residencePeopleBench.getState().relationships.find(rel=>rel.npcId===homeNpc.id)!.score;const visit=residencePeopleBench.execute({id:'people.residential_experience',args:{npcId:homeNpc.id,planId:'visit-their-home'}});const afterScore=residencePeopleBench.getState().relationships.find(rel=>rel.npcId===homeNpc.id)!.score;
    verify(visit.result.success&&afterScore>=beforeScore&&visit.result.messages.some(message=>message.text.includes('Maple Cottage')),'70 semantic residential execution must reuse the real relationship/shared-experience path while preserving the exact home context in player-visible prose');
    verify(residencePeopleBench.getState().npcs[homeNpc.id]?.memories.some(memory=>memory.kind.startsWith('residential:visit-their-home:ai-npc-home'))===true&&visit.invariantIssues.length===0,'71 residential AI execution must write the same bounded exact-property NPC memory and leave shared state invariant-clean');
  });

  const youthResidenceState=createNewGame({seed:'ai-test-residence-youth'});youthResidenceState.character.age=15;youthResidenceState.currentYear=2055;youthResidenceState.education=[];const youthHomeNpc:Npc={id:'ai-youth-home-friend',firstName:'Taylor',lastName:'Thread',age:15,alive:true,health:95,happiness:90,wealth:1000,countryId:youthResidenceState.character.countryId,city:youthResidenceState.character.city,sexuality:'pansexual',fertility:0,maritalStatus:'single',traits:['playful','loyal'],hiddenOpinion:90,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['home','cozy','games','social'],dislikes:[],aversions:[]}};youthResidenceState.npcs[youthHomeNpc.id]=youthHomeNpc;youthResidenceState.relationships.push({id:'ai-youth-home-rel',npcId:youthHomeNpc.id,type:'friend',score:90,attraction:0,compatibility:90,yearsKnown:5});ensureNpcLife(youthResidenceState,youthHomeNpc);
  await withEverthreadAiTestbench({state:youthResidenceState,screen:'people'},async youthResidenceBench=>{
    const actions=youthResidenceBench.observe('people').actions.filter(action=>action.targetId===youthHomeNpc.id);const residentialSleepovers=actions.filter(action=>action.id==='people.residential_experience'&&action.label.toLowerCase().includes('sleepover'));const genericSleepovers=actions.filter(action=>action.id==='people.shared_experience'&&action.label.toLowerCase().includes('sleepover'));
    verify(residentialSleepovers.length===1&&genericSleepovers.length===0,'72 AI People parity must deduplicate the 9C generic sleepover when the residence-aware 10A sleepover is available for the same exact youth NPC');
  });

  const workingState=createNewGame({seed:'ai-test-working-everthread'});workingState.character.age=30;workingState.currentYear=2070;workingState.education=[];
  const aiSchoolWorld:SocialWorld={id:'ai-working-school',kind:'school',name:'Everthread College World',countryId:'everthread',city:'Everthread',startedAge:29,active:true,members:[],groups:[],school:{stage:'university',educationKey:'ai-college',attendance:92,conduct:95,socialStanding:60,honors:1,disciplinaryActions:0}};
  const aiWorkWorld:SocialWorld={id:'ai-working-office',kind:'workplace',name:'Threadline Finance',countryId:'everthread',city:'Everthread',startedAge:28,active:true,members:[],groups:[],workplace:{employmentKey:'full_time|28|Threadline Finance',employmentKind:'full_time',industry:'Finance',department:'Operations',morale:65,culture:62,tension:18,reputation:58,layoffs:0,disputes:0}};
  const aiPartWorld:SocialWorld={id:'ai-working-retail',kind:'workplace',name:'Crossroads Retail',countryId:'everthread',city:'Everthread',startedAge:29,active:true,members:[],groups:[],workplace:{employmentKey:'part_time|29|Crossroads Retail',employmentKind:'part_time',industry:'Retail',department:'Sales',morale:62,culture:60,tension:20,reputation:55,layoffs:0,disputes:0}};
  workingState.socialWorlds.push(aiSchoolWorld,aiWorkWorld,aiPartWorld);workingState.businesses.push({id:'ai-working-business',industryId:'software',name:'Blue Loom Labs',foundedAge:27,countryId:'everthread',city:'Everthread',capital:200_000,revenue:100_000,expenses:70_000,profit:30_000,employees:5,demand:60,reputation:58,valuation:350_000,productIds:['software_product_1'],priceIndex:1,marketingBudget:5_000,compensationIndex:1,bankrupt:false});
  workingState.character.countryId='us';workingState.character.city='Seattle';
  await withEverthreadAiTestbench({state:workingState,screen:'career'},async workingBench=>{
    const career=workingBench.observe('career');const working=career.data.workingEverthread as {institution?:{anchorPlaceId?:string;districtId?:string};workplaces:Array<{sourceId:string;anchorPlaceId?:string;districtId?:string}>;businesses:Array<{sourceId:string;countryId:string;city:string;districtId?:string}>};
    verify(working.institution?.anchorPlaceId==='everthread-college'&&working.institution?.districtId==='campus-green','73 Career semantic observation must expose the exact local institution anchor from SchoolWorld truth');
    verify(working.workplaces.some(item=>item.sourceId==='ai-working-office'&&item.anchorPlaceId==='central-everthread-bank'&&item.districtId==='central-weave'),'74 Career semantic observation must project the active finance workplace to its exact Everthread work anchor');
    verify(working.workplaces.some(item=>item.sourceId==='ai-working-retail'&&item.anchorPlaceId==='crossroads-mall'&&item.districtId==='market-row')&&working.workplaces.length===2,'75 Career semantic observation must preserve distinct full-time and part-time workplace locations instead of merging work truth');
    const before=JSON.stringify(workingBench.getState());workingBench.observe('career');verify(JSON.stringify(workingBench.getState())===before,'76 Working Everthread semantic observation must remain read-only');
    const assets=workingBench.observe('assets');const business=(assets.data.businesses as Array<{id:string;countryId?:string;city?:string;workLocation?:{inEverthread?:boolean;districtId?:string;anchorPlaceId?:string;locationLabel?:string}}>).find(item=>item.id==='ai-working-business');
    verify(business?.countryId==='everthread'&&business.city==='Everthread'&&business.workLocation?.inEverthread===true&&business.workLocation.districtId==='eastworks','77 Assets semantic observation must expose the company-owned founding location even after the player relocates');
    verify(business?.workLocation?.anchorPlaceId==='loomworks-business-district'&&business.workLocation.locationLabel?.includes('Loomworks Business District'),'78 business semantic location must reuse the deterministic existing-town anchor rather than a synthetic workplace place');
  });

  return checks;
}
