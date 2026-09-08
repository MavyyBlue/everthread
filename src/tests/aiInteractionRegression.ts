import { createNewGame } from '../systems/CharacterSystem';
import { ensureSpecialCareerRelationships } from '../systems/SpecialCareerRelationshipSystem';
import { ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
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
    verify(bench.observe('people').actions.some(action=>action.id==='people.ask_out'&&action.targetId===newRel!.npcId),'18 relationship-specific action availability must reuse the real Ask Out eligibility projection');

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

  return checks;
}
