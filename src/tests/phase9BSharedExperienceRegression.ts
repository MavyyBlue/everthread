import { actionUsesThisAge } from '../core/actionEconomy';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { NPC_PREFERENCE_TAG_IDS, npcPreferenceTagById } from '../data/npcPreferences';
import { SHARED_EXPERIENCE_ACTIVITIES, sharedExperienceActivityById } from '../data/sharedExperiences';
import { TOWN_PLACES } from '../data/townPlaces';
import { GameEngine } from '../engine/GameEngine';
import { migrateSave } from '../services/SaveSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { shareExperienceWithNpc } from '../systems/RelationshipSystem';
import { evaluateSharedExperience, projectSharedExperienceOptions, sharedExperienceAvailability } from '../systems/SharedExperienceSystem';
import type { GameState, Npc, NpcMemory, Relationship } from '../types/game';
import type { NpcPreferenceProfile, NpcPreferenceTag } from '../types/npcPreferences';

function addNpc(state:GameState,id:string,age=30,traits:string[]=['calm']):{npc:Npc;rel:Relationship}{
  const npc:Npc={id,firstName:'Riley',lastName:'Thread',age,alive:true,health:80,happiness:60,wealth:12000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits,hiddenOpinion:0,memories:[],parentIds:[],childIds:[],simulationTier:'full'};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type:'friend',score:50,attraction:0,compatibility:50,yearsKnown:0};
  state.npcs[id]=npc;state.relationships.push(rel);ensureNpcLife(state,npc);return{npc,rel};
}

function adultState(seed:string,id='phase9b-npc'){
  const state=createNewGame({seed});state.character.age=30;state.character.stats.health=80;state.character.stats.happiness=50;state.currentYear=2058;
  const pair=addNpc(state,id,30);return{state,...pair};
}

function profile(likes:NpcPreferenceTag[]=[],dislikes:NpcPreferenceTag[]=[],aversions:NpcPreferenceTag[]=[]):NpcPreferenceProfile{return{version:1,likes,dislikes,aversions};}
function clone<T>(value:T):T{return structuredClone(value);}

export function runPhase9BSharedExperienceRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9B shared-experience regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===17,'01 Shared Experience Foundation must not create a new save schema when it only writes established relationship/memory/timeline authorities');
  verify(SHARED_EXPERIENCE_ACTIVITIES.length===10,'02 the foundation should expose ten authored reusable activities without inflating Phase 9C/9D content early');
  verify(new Set(SHARED_EXPERIENCE_ACTIVITIES.map(activity=>activity.id)).size===SHARED_EXPERIENCE_ACTIVITIES.length,'03 shared-experience activity ids must be unique');
  const placeIds=new Set(TOWN_PLACES.map(place=>place.id));
  verify(SHARED_EXPERIENCE_ACTIVITIES.every(activity=>activity.placeIds.length>0&&activity.placeIds.every(id=>placeIds.has(id))),'04 every activity must resolve only through canonical Everthread place ids');
  verify(SHARED_EXPERIENCE_ACTIVITIES.every(activity=>activity.preferenceTags.length>0&&activity.preferenceTags.every(tag=>NPC_PREFERENCE_TAG_IDS.includes(tag))),'05 every activity must consume the single Phase 9A preference vocabulary');
  verify(SHARED_EXPERIENCE_ACTIVITIES.every(activity=>activity.minAge>=0&&activity.minAge<=18&&activity.baseEnjoyment>=-8&&activity.baseEnjoyment<=8),'06 authored activity age gates and base enjoyment must stay bounded');
  verify(SHARED_EXPERIENCE_ACTIVITIES.every(activity=>sharedExperienceActivityById[activity.id]===activity),'07 the activity registry lookup must resolve the canonical definitions rather than duplicate data');

  const pure=adultState('phase9b-pure');pure.npc.preferences=profile(['nature','outdoors','relaxing']);
  const pureBefore=JSON.stringify(pure.state),pureRng=pure.state.rngCounter,pureId=pure.state.idCounter;
  const evalA=evaluateSharedExperience(pure.state,pure.npc.id,'weaver-park','park_walk',0),evalB=evaluateSharedExperience(pure.state,pure.npc.id,'weaver-park','park_walk',0);
  verify(Boolean(evalA)&&JSON.stringify(evalA)===JSON.stringify(evalB),'08 identical exact context must produce an identical read-only evaluation');
  verify(JSON.stringify(pure.state)===pureBefore&&pure.state.rngCounter===pureRng&&pure.state.idCounter===pureId,'09 evaluating an experience must consume neither gameplay RNG/runtime ids nor mutate save state');
  verify((evalA?.approval??-1)>=0&&(evalA?.approval??101)<=100,'10 visual approval must always be bounded to 0–100');
  verify(Boolean(evalA?.prose.includes('Riley')&&evalA.prose.includes('Weaver Park')&&evalA.activityLabel==='Walk the park'),'11 result prose must coherently identify the exact person, place, and activity');
  verify(!('preferenceScore' in (evalA as unknown as Record<string,unknown>))&&!('contextScore' in (evalA as unknown as Record<string,unknown>)),'12 player-facing result objects must not expose raw optimization weights');

  const neutral=adultState('phase9b-preference-neutral');neutral.npc.preferences=profile();neutral.npc.happiness=50;neutral.npc.hiddenOpinion=0;
  const liked=clone(neutral.state),disliked=clone(neutral.state),averse=clone(neutral.state);
  liked.npcs[neutral.npc.id]!.preferences=profile(['nature','outdoors','relaxing']);
  disliked.npcs[neutral.npc.id]!.preferences=profile([],['nature','outdoors','relaxing']);
  averse.npcs[neutral.npc.id]!.preferences=profile([],[],['nature']);
  const neutralScore=evaluateSharedExperience(neutral.state,neutral.npc.id,'weaver-park','park_walk',0)!.approval;
  const likedScore=evaluateSharedExperience(liked,neutral.npc.id,'weaver-park','park_walk',0)!.approval;
  const dislikedScore=evaluateSharedExperience(disliked,neutral.npc.id,'weaver-park','park_walk',0)!.approval;
  const averseScore=evaluateSharedExperience(averse,neutral.npc.id,'weaver-park','park_walk',0)!.approval;
  verify(likedScore>neutralScore&&neutralScore>dislikedScore,'13 intrinsic likes and dislikes must materially move the exact same shared experience in opposite directions');
  verify(averseScore<neutralScore-15,'14 a strong aversion must be meaningfully worse than neutral rather than cosmetic');

  const relationshipHigh=clone(neutral.state),relationshipLow=clone(neutral.state);const highRel=relationshipHigh.relationships.find(rel=>rel.npcId===neutral.npc.id)!,lowRel=relationshipLow.relationships.find(rel=>rel.npcId===neutral.npc.id)!;
  highRel.score=92;highRel.compatibility=95;highRel.yearsKnown=18;relationshipHigh.npcs[neutral.npc.id]!.hiddenOpinion=75;
  lowRel.score=12;lowRel.compatibility=15;lowRel.yearsKnown=0;relationshipLow.npcs[neutral.npc.id]!.hiddenOpinion=-75;
  verify(evaluateSharedExperience(relationshipHigh,neutral.npc.id,'weaver-park','park_walk',0)!.approval>evaluateSharedExperience(relationshipLow,neutral.npc.id,'weaver-park','park_walk',0)!.approval+20,'15 relationship history, compatibility, and NPC opinion must matter without replacing preference identity');
  verify(evaluateSharedExperience(neutral.state,neutral.npc.id,'weaver-park','park_walk',999)!.approval===evaluateSharedExperience(neutral.state,neutral.npc.id,'weaver-park','park_walk',8)!.approval,'16 caller-supplied surprise variation must be hard-clamped before evaluation');

  const childA=createNewGame({seed:'phase9b-child-tags'});childA.character.age=3;const childPair=addNpc(childA,'child-playmate',3);childPair.npc.happiness=50;childPair.npc.preferences=profile(['social']);
  const childB=clone(childA);childB.npcs[childPair.npc.id]!.preferences=profile();
  verify(evaluateSharedExperience(childA,childPair.npc.id,'weaver-park','park_play',0)!.approval===evaluateSharedExperience(childB,childPair.npc.id,'weaver-park','park_play',0)!.approval,'17 preference tags above either participant age must not silently influence a younger child experience');
  verify(npcPreferenceTagById.social.minAge>3,'18 the child-age regression must actually exercise a preference tag gated above age three');

  const projection=adultState('phase9b-projection');const projectionBefore=JSON.stringify(projection.state),projectionRng=projection.state.rngCounter,projectionId=projection.state.idCounter;const options=projectSharedExperienceOptions(projection.state,projection.npc.id);
  verify(options.length===SHARED_EXPERIENCE_ACTIVITIES.length&&options.some(option=>option.activityId==='diner_meal'&&option.placeId==='nightjar-diner'),'19 option projection must expose the authored activity/place pairs from canonical registries');
  verify(JSON.stringify(projection.state)===projectionBefore&&projection.state.rngCounter===projectionRng&&projection.state.idCounter===projectionId,'20 browsing shared-experience options must be strictly read-only and RNG/ID neutral');

  const invalid=adultState('phase9b-invalid');const invalidBefore=JSON.stringify(invalid.state);
  verify(!sharedExperienceAvailability(invalid.state,'missing-npc','weaver-park','park_walk').allowed,'21 a stale exact NPC id must fail safely');
  verify(!sharedExperienceAvailability(invalid.state,invalid.npc.id,'missing-place','park_walk').allowed,'22 a stale exact place id must fail safely');
  verify(!sharedExperienceAvailability(invalid.state,invalid.npc.id,'weaver-park','missing-activity').allowed,'23 a stale exact activity id must fail safely');
  verify(!sharedExperienceAvailability(invalid.state,invalid.npc.id,'nightjar-diner','park_walk').allowed,'24 an activity cannot be executed at a mismatched place');
  verify(JSON.stringify(invalid.state)===invalidBefore,'25 eligibility failures must not mutate authoritative state');

  const dead=adultState('phase9b-dead');dead.npc.alive=false;const deadBefore=JSON.stringify(dead.state);verify(!shareExperienceWithNpc(dead.state,dead.npc.id,'weaver-park','park_walk').success&&JSON.stringify(dead.state)===deadBefore,'26 dead NPCs must reject shared experiences without consuming state');
  const remoteNpc=adultState('phase9b-remote-npc');remoteNpc.npc.countryId='us';remoteNpc.npc.city='Chicago';const remoteNpcBefore=JSON.stringify(remoteNpc.state);verify(!shareExperienceWithNpc(remoteNpc.state,remoteNpc.npc.id,'weaver-park','park_walk').success&&JSON.stringify(remoteNpc.state)===remoteNpcBefore,'27 a remote NPC cannot silently participate in an Everthread-local outing');
  const remotePlayer=adultState('phase9b-remote-player');remotePlayer.state.character.countryId='us';remotePlayer.state.character.city='Chicago';const remotePlayerBefore=JSON.stringify(remotePlayer.state);verify(!shareExperienceWithNpc(remotePlayer.state,remotePlayer.npc.id,'weaver-park','park_walk').success&&JSON.stringify(remotePlayer.state)===remotePlayerBefore,'28 an emigrated player may browse Everthread but cannot execute a local outing from another city');
  const underage=createNewGame({seed:'phase9b-underage'});underage.character.age=4;const underagePair=addNpc(underage,'underage-friend',4);const underageBefore=JSON.stringify(underage);verify(!shareExperienceWithNpc(underage,underagePair.npc.id,'crossroads-mall','mall_games').success&&JSON.stringify(underage)===underageBefore,'29 both participants must satisfy the activity age gate before state is consumed');

  const committed=adultState('phase9b-commit');committed.state.character.stats.happiness=80;committed.npc.happiness=85;committed.npc.hiddenOpinion=80;committed.rel.score=90;committed.rel.compatibility=95;committed.rel.yearsKnown=18;committed.npc.preferences=profile(['nature','outdoors','relaxing']);
  const beforeScore=committed.rel.score,beforeOpinion=committed.npc.hiddenOpinion,beforeHappiness=committed.state.character.stats.happiness,beforeTimeline=committed.state.timeline.length,beforeMemories=committed.npc.memories.length,beforeRng=committed.state.rngCounter;
  const outcome=shareExperienceWithNpc(committed.state,committed.npc.id,'weaver-park','park_walk');
  verify(outcome.success&&Boolean(outcome.experience),'30 a valid exact shared experience must resolve through RelationshipSystem');
  verify(outcome.experience!.band==='great'&&outcome.experience!.approval>=80,'31 strongly compatible context plus matching preferences should be capable of a great experience');
  verify(committed.rel.score===Math.min(100,beforeScore+outcome.experience!.relationshipDelta)&&committed.npc.hiddenOpinion===Math.min(100,beforeOpinion+outcome.experience!.opinionDelta),'32 RelationshipSystem must be the authority that applies relationship score and NPC opinion consequences');
  verify(committed.state.character.stats.happiness===Math.min(100,beforeHappiness+outcome.experience!.happinessDelta),'33 the committed experience must apply its bounded player happiness consequence exactly once');
  verify(committed.state.timeline.length===beforeTimeline+1&&committed.state.timeline.at(-1)?.npcIds?.[0]===committed.npc.id,'34 the exact target and coherent prose must be recorded once in the existing relationship timeline');
  verify(committed.npc.memories.length===beforeMemories+1&&committed.npc.memories.at(-1)?.kind==='shared_experience:park_walk','35 a meaningful outcome must be remembered by the exact NPC through the existing NPC memory authority');
  verify(committed.state.rngCounter===beforeRng+1,'36 a committed experience must consume exactly one gameplay RNG draw for bounded surprise');
  verify(actionUsesThisAge(committed.state,'social.npc.total',committed.npc.id)===1&&actionUsesThisAge(committed.state,'social.npc.action',`${committed.npc.id}:shared:park_walk`)===1,'37 shared experiences must reuse the established per-NPC social action economy');
  verify(Boolean(outcome.experience!.discoveredPreferenceTag&&committed.rel.knownPreferenceTags?.includes(outcome.experience!.discoveredPreferenceTag)),'38 lived experience should plausibly teach at most one relevant preference through relationship-owned knowledge');

  const afterFirst=JSON.stringify(committed.state);const repeat=shareExperienceWithNpc(committed.state,committed.npc.id,'weaver-park','park_walk');
  verify(!repeat.success&&JSON.stringify(committed.state)===afterFirst,'39 repeating the same shared activity with the same NPC in one age must be blocked without duplicate consequences');

  const cap=adultState('phase9b-cap');cap.npc.preferences=profile();
  verify(shareExperienceWithNpc(cap.state,cap.npc.id,'crossroads-mall','mall_browse').success,'40 first distinct shared experience should fit inside the established annual NPC-social budget');
  verify(shareExperienceWithNpc(cap.state,cap.npc.id,'crossroads-mall','mall_games').success,'41 second distinct shared experience should fit inside the established annual NPC-social budget');
  verify(shareExperienceWithNpc(cap.state,cap.npc.id,'crossroads-mall','movie_outing').success,'42 third distinct shared experience should fit inside the established annual NPC-social budget');
  const capSnapshot=JSON.stringify(cap.state);verify(!shareExperienceWithNpc(cap.state,cap.npc.id,'nightjar-diner','diner_meal').success&&JSON.stringify(cap.state)===capSnapshot,'43 a fourth substantial social experience with the same NPC in one age must be blocked without mutation');

  const exact=adultState('phase9b-exact-a','target-a');const other=addNpc(exact.state,'target-b',30);exact.npc.preferences=profile(['nature','outdoors','relaxing']);const otherBefore=JSON.stringify({npc:other.npc,rel:other.rel});
  verify(shareExperienceWithNpc(exact.state,exact.npc.id,'weaver-park','park_walk').success,'44 exact-target fixture must resolve successfully');
  verify(JSON.stringify({npc:other.npc,rel:other.rel})===otherBefore,'45 a shared experience must never leak score, opinion, knowledge, or memory changes onto a different NPC');

  const deterministicA=adultState('phase9b-deterministic'),deterministicB=adultState('phase9b-deterministic');deterministicA.npc.preferences=profile(['food','local','social']);deterministicB.npc.preferences=profile(['food','local','social']);
  const deterministicResultA=shareExperienceWithNpc(deterministicA.state,deterministicA.npc.id,'nightjar-diner','diner_meal');const deterministicResultB=shareExperienceWithNpc(deterministicB.state,deterministicB.npc.id,'nightjar-diner','diner_meal');
  verify(JSON.stringify(deterministicResultA)===JSON.stringify(deterministicResultB)&&JSON.stringify(deterministicA.state)===JSON.stringify(deterministicB.state),'46 identical seeded exact contexts must resolve to identical committed experience results and state');

  const bounded=adultState('phase9b-memory-bound');bounded.state.character.stats.happiness=90;bounded.npc.happiness=90;bounded.npc.hiddenOpinion=90;bounded.rel.score=90;bounded.rel.compatibility=95;bounded.rel.yearsKnown=20;bounded.npc.preferences=profile(['nature','outdoors','relaxing']);
  bounded.npc.memories=Array.from({length:36},(_,index):NpcMemory=>({id:`old-memory-${index}`,year:2020+index,age:20+index,kind:'fixture',sentiment:index%2?2:-2,summary:`Old memory ${index}`,permanent:index<5}));
  verify(shareExperienceWithNpc(bounded.state,bounded.npc.id,'weaver-park','park_walk').success&&bounded.npc.memories.length===36,'47 relationship-authored NPC memories must remain bounded for long lives');
  verify(['old-memory-0','old-memory-1','old-memory-2','old-memory-3','old-memory-4'].every(id=>bounded.npc.memories.some(memory=>memory.id===id)),'48 bounded relationship memory trimming must preserve established permanent memories when capacity allows');

  const migrated=migrateSave(clone(committed.state));
  verify(migrated.saveVersion===17&&migrated.relationships.find(rel=>rel.npcId===committed.npc.id)?.score===committed.rel.score,'49 save normalization must preserve committed shared-experience relationship consequences without a new parallel ledger');
  verify(migrated.npcs[committed.npc.id]?.memories.some(memory=>memory.kind==='shared_experience:park_walk')===true,'50 save normalization must preserve meaningful shared-experience NPC history');

  const engineFixture=adultState('phase9b-engine');engineFixture.npc.preferences=profile(['food','local','social']);engineFixture.state.settings.autoSave=false;const globals=globalThis as unknown as {localStorage?:Storage};if(!globals.localStorage)Object.defineProperty(globalThis,'localStorage',{value:{length:0,clear(){},getItem(){return null;},key(){return null;},removeItem(){},setItem(){}},configurable:true});const engine=new GameEngine(engineFixture.state);const revisionBefore=engine.getRevision();const engineResult=engine.shareExperience(engineFixture.npc.id,'nightjar-diner','diner_meal');
  verify(engineResult.success&&Boolean(engineResult.experience)&&engine.getRevision()===revisionBefore+1,'51 GameEngine must expose the controlled shared-experience action and emit one revision on success');
  const failedRevision=engine.getRevision();const failedEngine=engine.shareExperience('missing-npc','nightjar-diner','diner_meal');verify(!failedEngine.success&&engine.getRevision()===failedRevision,'52 a stale GameEngine shared-experience request must fail without a phantom rerender/save mutation');

  const reusable=adultState('phase9b-reusable-context');reusable.npc.happiness=50;reusable.npc.preferences=profile(['cute']);const defaultContext=evaluateSharedExperience(reusable.state,reusable.npc.id,'crossroads-mall','mall_games',0)!;const exactContentContext=evaluateSharedExperience(reusable.state,reusable.npc.id,'crossroads-mall','mall_games',0,{preferenceTags:['cute']})!;
  verify(exactContentContext.approval>defaultContext.approval,'53 later gift/date/cross-world content must be able to feed exact preference tags through the same evaluator instead of creating parallel scoring logic');

  return checks;
}
