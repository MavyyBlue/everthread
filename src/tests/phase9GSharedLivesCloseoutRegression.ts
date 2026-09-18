import { actionUsesThisAge } from '../core/actionEconomy';
import { validateState } from '../core/invariants';
import { createRng } from '../core/rng';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { NPC_PREFERENCE_TAG_IDS } from '../data/npcPreferences';
import { personalItemDefinitions } from '../data/personalItems';
import { ROMANTIC_DATE_HISTORY_LIMIT } from '../data/romanticDates';
import { SHARED_EXPERIENCE_ACTIVITIES } from '../data/sharedExperiences';
import { YOUTH_SOCIAL_PLANS } from '../data/youthSocial';
import { CROSS_WORLD_CHEMISTRY_PLANS } from '../data/crossWorldChemistry';
import { exportSave, importSave } from '../services/SaveSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { crossWorldChemistryContext, projectCrossWorldChemistryPlans } from '../systems/CrossWorldChemistrySystem';
import { projectPersonalGiftOptions } from '../systems/GiftSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { projectKnownNpcPreferences } from '../systems/NpcPreferenceSystem';
import { purchasePersonalItem } from '../systems/PersonalInventorySystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import {
  askNpcOnDate,
  canAskNpcOnDate,
  canBecomePartners,
  changeRelationshipType,
  completeRomanticDate,
  givePersonalItemGift,
  shareCrossWorldExperienceWithNpc,
  shareExperienceWithNpc,
} from '../systems/RelationshipSystem';
import { projectRomanticDateOptions, romanticDateMomentum } from '../systems/RomanticDateSystem';
import { projectSharedExperienceOptions } from '../systems/SharedExperienceSystem';
import { specialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import { projectYouthSocialPlans } from '../systems/YouthSocialSystem';
import type { GameState, Npc, Relationship, RelationshipType, SocialWorld } from '../types/game';

function clone<T>(value:T):T{return structuredClone(value);}

function closeoutState(seed:string,age=24){
  const state=createNewGame({seed});
  state.seed=seed;state.rngCounter=0;state.character.age=age;state.currentYear=2064;
  state.character.countryId=EVERTHREAD_COUNTRY_ID;state.character.city=EVERTHREAD_CITY;state.character.orientation='pansexual';
  state.character.stats.health=95;state.character.stats.happiness=95;state.finances.cash=100_000;state.settings.autoSave=false;state.education=[];
  return state;
}

function addNpc(state:GameState,id='shared-life-target',type:RelationshipType='friend',age=state.character.age){
  const npc:Npc={
    id,firstName:'Morgan',lastName:'Thread',age,alive:true,health:95,happiness:95,wealth:5000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:70,maritalStatus:'single',
    traits:['romantic','loyal','playful'],hiddenOpinion:100,memories:[],parentIds:[],childIds:[],simulationTier:'full',
    preferences:{version:1,likes:['food','romance','music','cozy'],dislikes:[],aversions:[]},
  };
  const rel:Relationship={id:`rel-${id}`,npcId:id,type,score:92,attraction:100,compatibility:100,yearsKnown:6};
  state.npcs[id]=npc;state.relationships.push(rel);ensureNpcLife(state,npc);return{npc,rel};
}

function addMusicWorld(state:GameState,npcId:string){
  const groupId='special-music-closeout:creative';
  const world:SocialWorld={
    id:'special-music-closeout',kind:'organization',name:'Closeout Music Circle',countryId:state.character.countryId,city:state.character.city,
    startedAge:Math.max(14,state.character.age-2),active:true,
    members:[{npcId,role:'member',joinedAge:Math.max(14,state.character.age-2),groupIds:[groupId]}],
    groups:[{id:groupId,name:'Creative partners',kind:'music:creative',minAge:14,memberNpcIds:[npcId],playerJoinedAge:Math.max(14,state.character.age-2),playerRole:'member',prestige:65}],
  };
  state.socialWorlds.push(world);return world;
}

function advanceYear(state:GameState){
  state.character.age+=1;state.currentYear+=1;
  for(const npc of Object.values(state.npcs))if(npc.alive)npc.age+=1;
}

function seedWithRolls(prefix:string,predicate:(rolls:number[])=>boolean){
  for(let index=0;index<20_000;index+=1){
    const seed=`${prefix}-${index}`;const rng=createRng(seed,0);const rolls=Array.from({length:16},()=>rng.next());
    if(predicate(rolls))return seed;
  }
  throw new Error(`Could not find deterministic seed for ${prefix}`);
}

function integratedSeed(){
  // Sequence: shared experience, gift, cross-world, ask/date x3, become partners.
  // Invitation rolls land at 3/5/7 and partnership at 9.
  return seedWithRolls('phase9g-integrated',rolls=>[3,5,7,9].every(index=>rolls[index]!<.90));
}

function addDecoy(state:GameState){return addNpc(state,'shared-life-decoy','friend',state.character.age);}

function runIntegratedStory(state:GameState,targetId:string){
  const outputs:unknown[]=[];
  outputs.push(shareExperienceWithNpc(state,targetId,'nightjar-diner','diner_meal'));

  advanceYear(state);
  const purchase=purchasePersonalItem(state,'late_night_cocoa_set');outputs.push(purchase);
  const instanceId=state.personalInventory.items.find(item=>item.itemId==='late_night_cocoa_set')?.id;
  if(!instanceId)throw new Error('Integrated closeout story failed to create the cocoa gift instance.');
  outputs.push(givePersonalItemGift(state,targetId,instanceId));

  advanceYear(state);
  outputs.push(shareCrossWorldExperienceWithNpc(state,targetId,'music-home-session'));

  for(let index=0;index<3;index+=1){
    advanceYear(state);
    const invitation=askNpcOnDate(state,targetId);outputs.push(invitation);
    if(!invitation.success)throw new Error(`Integrated closeout date invitation ${index+1} unexpectedly rejected.`);
    const date=completeRomanticDate(state,targetId,'nightjar-diner','diner_meal');outputs.push(date);
    if(!date.success)throw new Error(`Integrated closeout date ${index+1} unexpectedly failed.`);
  }
  outputs.push(changeRelationshipType(state,targetId,'become_partners'));
  return outputs;
}

function storyFixture(){
  const state=closeoutState(integratedSeed());const target=addNpc(state);const decoy=addDecoy(state);const world=addMusicWorld(state,target.npc.id);
  return{state,target,decoy,world};
}

export function runPhase9GSharedLivesCloseoutRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9G Shared Lives closeout regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===18,'01 Phase 9 closeout remains compatible with schema 18; the Shared Lives stack adds no parallel durable authority');
  verify(NPC_PREFERENCE_TAG_IDS.length===38&&SHARED_EXPERIENCE_ACTIVITIES.length===13&&YOUTH_SOCIAL_PLANS.length===11&&personalItemDefinitions.length===24&&CROSS_WORLD_CHEMISTRY_PLANS.length===22,'02 closeout must preserve the certified Phase 9 content foundations rather than inflate counts for certification');

  const fresh=closeoutState('phase9g-fresh');
  verify(!('sharedLives' in (fresh as unknown as Record<string,unknown>))&&!('experienceHistory' in (fresh as unknown as Record<string,unknown>))&&!('chemistryHistory' in (fresh as unknown as Record<string,unknown>))&&!('giftHistory' in (fresh as unknown as Record<string,unknown>)),'03 GameState must still contain no parallel Shared Lives/experience/chemistry/gift ledger');

  const teen=closeoutState('phase9g-teen',16);const teenTarget=addNpc(teen,'teen-peer','friend',16);
  verify(projectYouthSocialPlans(teen,teenTarget.npc.id).length>0&&projectCrossWorldChemistryPlans(teen,teenTarget.npc.id).length===0,'04 teen friendship must remain on the youth-social surface instead of duplicating adult friendship chemistry');
  const adult=closeoutState('phase9g-adult',24);const adultTarget=addNpc(adult,'adult-peer','best_friend',24);
  verify(projectYouthSocialPlans(adult,adultTarget.npc.id).length===0&&projectCrossWorldChemistryPlans(adult,adultTarget.npc.id).some(plan=>plan.context.kind==='friend'),'05 adult friendship must leave youth plans behind and project through the adult cross-world layer');
  const incompatible=closeoutState('phase9g-incompatible',20);const minor=addNpc(incompatible,'minor-peer','friend',17);
  verify(!canAskNpcOnDate(incompatible,minor.npc.id),'06 adult/minor dating incompatibility must survive the combined Shared Lives surface');

  const projection=storyFixture();
  const projectionBefore=JSON.stringify(projection.state),projectionRng=projection.state.rngCounter,projectionId=projection.state.idCounter;
  projectKnownNpcPreferences(projection.state,projection.target.npc.id);
  projectSharedExperienceOptions(projection.state,projection.target.npc.id);
  projectPersonalGiftOptions(projection.state,projection.target.npc.id);
  projectRomanticDateOptions(projection.state,projection.target.npc.id);
  projectCrossWorldChemistryPlans(projection.state,projection.target.npc.id);
  verify(JSON.stringify(projection.state)===projectionBefore&&projection.state.rngCounter===projectionRng&&projection.state.idCounter===projectionId,'07 all Phase 9 browsing/projection surfaces together must remain read-only, RNG-neutral, and runtime-ID neutral');

  const story=storyFixture();const storyStart=clone(story.state);const decoyStart=clone(story.decoy);
  const storyOutputs=runIntegratedStory(story.state,story.target.npc.id);
  const shared=storyOutputs[0] as ReturnType<typeof shareExperienceWithNpc>;
  const gift=storyOutputs[2] as ReturnType<typeof givePersonalItemGift>;
  const cross=storyOutputs[3] as ReturnType<typeof shareCrossWorldExperienceWithNpc>;
  const partnership=storyOutputs.at(-1) as ReturnType<typeof changeRelationshipType>;
  verify(shared.success&&shared.experience?.band==='great','08 a high-fit ordinary outing must still resolve through the shared evaluator as a meaningful positive experience');
  verify((story.target.rel.knownPreferenceTags?.length??0)>=1&&(story.target.rel.knownPreferenceTags?.length??0)<=8,'09 ordinary experience/gift/date/cross-world actions must accumulate preference knowledge only through the bounded Phase 9A relationship field');
  const decoyAfter=story.state.npcs[story.decoy.npc.id]!,decoyRelAfter=story.state.relationships.find(rel=>rel.npcId===story.decoy.npc.id)!;
  verify(decoyRelAfter.score===decoyStart.rel.score&&decoyAfter.hiddenOpinion===decoyStart.npc.hiddenOpinion&&decoyAfter.memories.length===decoyStart.npc.memories.length,'10 combined Shared Lives actions must preserve exact-NPC targeting and leave an unrelated decoy relationship/opinion/memory state untouched');
  verify(gift.success&&Boolean(gift.gift)&&!story.state.personalInventory.items.some(item=>item.itemId==='late_night_cocoa_set'),'11 the integrated gift must transfer the exact owned ordinary item once and leave no phantom copy behind');
  verify(cross.success&&cross.experience?.activityLabel==='Jam together'&&crossWorldChemistryContext(story.state,story.target.npc.id)?.kind==='music','12 the same NPC must retain exact active music-world context while using the shared relationship consequence path');
  verify((specialCareerWorldView(story.state,story.world)?.chemistry??0)>0,'13 the existing special-career owner must observe chemistry from the real relationship rather than a parallel 9F score');
  verify((story.target.rel.romance?.dateHistory?.length??0)===3&&romanticDateMomentum(story.target.rel)>=3&&canBecomePartners(storyStart,story.target.npc.id)===false,'14 three genuinely successful dates must build bounded romantic history/momentum without being pre-unlocked at story start');
  verify(partnership.success&&story.target.rel.type==='partner'&&story.target.npc.maritalStatus==='dating','15 the integrated history must be able to reach the real probabilistic Become Partners milestone after momentum, not bypass it');
  verify(crossWorldChemistryContext(story.state,story.target.npc.id)?.kind==='music','16 becoming partners must not erase a separately owned active career-world context');
  verify((story.target.rel.romance?.dateHistory?.length??0)<=ROMANTIC_DATE_HISTORY_LIMIT&&(story.target.npc.memories?.length??0)<=36,'17 combined romance and NPC memory histories must remain within their established bounds');
  verify(story.state.timeline.filter(entry=>entry.npcIds?.includes(story.target.npc.id)).length>=8&&!story.state.timeline.some(entry=>entry.npcIds?.includes(story.decoy.npc.id)),'18 combined consequences must remain exact-targeted in timeline history with no spillover to the decoy');
  verify(validateState(story.state).length===0,'19 the full preference→outing→gift→cross-world→dating→partnership history must remain invariant-clean');
  const serialized=exportSave(story.state),restored=importSave(serialized);
  const normalizedSerialized=exportSave(restored);const normalizedReloaded=importSave(normalizedSerialized);
  verify(exportSave(normalizedReloaded)===normalizedSerialized,'20 once canonical load normalization has run, complete Shared Lives saves must be idempotent across repeated save/load cycles');
  const restoredRel=restored.relationships.find(rel=>rel.npcId===story.target.npc.id);
  verify(restoredRel?.type==='partner'&&restoredRel.score===story.target.rel.score&&JSON.stringify(restoredRel.knownPreferenceTags??[])===JSON.stringify(story.target.rel.knownPreferenceTags??[])&&JSON.stringify(restoredRel.romance?.dateHistory??[])===JSON.stringify(story.target.rel.romance?.dateHistory??[])&&restored.npcs[story.target.npc.id]?.memories.length===story.target.npc.memories.length,'21 save/load must preserve authoritative relationship, preference, romantic, and bounded NPC-memory consequences without a special Phase 9 ledger');
  verify(!('sharedLives' in (restored as unknown as Record<string,unknown>))&&!('crossWorldChemistry' in (restored as unknown as Record<string,unknown>)),'22 restored saves must still derive Shared Lives behavior from existing authorities rather than serialized shadow state');

  const deterministicA=storyFixture(),deterministicB={state:clone(deterministicA.state)};
  const targetA=deterministicA.target.npc.id,targetB=targetA;
  const resultsA=runIntegratedStory(deterministicA.state,targetA);const resultsB=runIntegratedStory(deterministicB.state,targetB);
  verify(JSON.stringify(resultsA)===JSON.stringify(resultsB)&&exportSave(deterministicA.state)===exportSave(deterministicB.state),'23 identical seeded combined Phase 9 histories must replay deterministically across all six Shared Lives slices');

  const budgetSeed=seedWithRolls('phase9g-budget',rolls=>rolls[3]!<.90);
  const budget=closeoutState(budgetSeed);const budgetTarget=addNpc(budget,'budget-target');addMusicWorld(budget,budgetTarget.npc.id);
  purchasePersonalItem(budget,'late_night_cocoa_set');const budgetGift=budget.personalInventory.items.find(item=>item.itemId==='late_night_cocoa_set')!;
  verify(shareExperienceWithNpc(budget,budgetTarget.npc.id,'nightjar-diner','diner_meal').success&&givePersonalItemGift(budget,budgetTarget.npc.id,budgetGift.id).success&&shareCrossWorldExperienceWithNpc(budget,budgetTarget.npc.id,'music-home-session').success,'24 three distinct Phase 9 action families must coexist inside the one established per-person social opportunity budget');
  verify(actionUsesThisAge(budget,'social.npc.total',budgetTarget.npc.id)===3,'25 ordinary outings, gifts, and cross-world chemistry must all count toward the same three-per-person yearly budget');
  const invitation=askNpcOnDate(budget,budgetTarget.npc.id);verify(invitation.success&&Boolean(budgetTarget.rel.romance?.pendingDate),'26 date invitation remains a separate milestone-style invitation and can create a pending exact-NPC date after the shared social budget is full');
  const budgetRng=budget.rngCounter,budgetTimeline=budget.timeline.length;const blockedDate=completeRomanticDate(budget,budgetTarget.npc.id,'nightjar-diner','diner_meal');
  verify(!blockedDate.success&&budget.rngCounter===budgetRng&&budget.timeline.length===budgetTimeline&&Boolean(budgetTarget.rel.romance?.pendingDate),'27 completing that pending date must respect the already-full shared social budget without consuming RNG/timeline or silently discarding the plan');

  const duplicate=closeoutState('phase9g-duplicate');const duplicateTarget=addNpc(duplicate,'duplicate-target');
  purchasePersonalItem(duplicate,'late_night_cocoa_set');purchasePersonalItem(duplicate,'late_night_cocoa_set');const copies=duplicate.personalInventory.items.filter(item=>item.itemId==='late_night_cocoa_set');
  verify(copies.length===2&&new Set(copies.map(item=>item.id)).size===2,'28 duplicate owned gift definitions must remain two exact inventory instances');
  givePersonalItemGift(duplicate,duplicateTarget.npc.id,copies[0]!.id);
  verify(duplicate.personalInventory.items.some(item=>item.id===copies[1]!.id)&&!duplicate.personalInventory.items.some(item=>item.id===copies[0]!.id),'29 gifting one duplicate instance must remove exactly that instance and preserve the other');

  const bad=closeoutState('phase9g-bad');const badTarget=addNpc(bad,'bad-target');badTarget.rel.score=0;badTarget.rel.compatibility=0;badTarget.npc.hiddenOpinion=-100;badTarget.npc.happiness=10;badTarget.npc.health=20;bad.character.stats.happiness=10;bad.character.stats.health=20;badTarget.npc.preferences={version:1,likes:[],dislikes:['outdoors'],aversions:['nature']};
  const badResult=shareExperienceWithNpc(bad,badTarget.npc.id,'weaver-park','park_walk');
  verify(badResult.success&&badResult.experience?.band==='awful'&&(badResult.experience.relationshipDelta??0)<0,'30 closeout must preserve genuinely bad shared outcomes rather than turning the system into unconditional relationship gains');
  verify(badTarget.npc.memories.some(memory=>memory.kind==='shared_experience:park_walk')&&(badTarget.rel.knownPreferenceTags?.includes('nature')??false),'31 meaningful bad outcomes must use the same bounded memory and preference-discovery authorities as good ones');

  const retrySeed=seedWithRolls('phase9g-retry',rolls=>rolls[0]!>.10&&rolls[1]!<.90);
  const retry=closeoutState(retrySeed);const retryTarget=addNpc(retry,'retry-target');retryTarget.rel.score=0;retryTarget.rel.compatibility=0;retryTarget.rel.attraction=0;retryTarget.npc.hiddenOpinion=-100;
  const rejected=askNpcOnDate(retry,retryTarget.npc.id);verify(!rejected.success&&!retryTarget.rel.romance?.pendingDate,'32 a rejected exact-NPC date invitation must remain a rejection without fabricating pending romantic state');
  retryTarget.rel.score=100;retryTarget.rel.compatibility=100;retryTarget.rel.attraction=100;retryTarget.npc.hiddenOpinion=100;const acceptedRetry=askNpcOnDate(retry,retryTarget.npc.id);
  verify(acceptedRetry.success&&Boolean(retryTarget.rel.romance?.pendingDate)&&actionUsesThisAge(retry,'relationship.date.invite',retryTarget.npc.id)===2,'33 rejection must not permanently eliminate future possibility; a later same-year invitation may succeed within the established invitation limit');

  const dead=closeoutState('phase9g-dead');const deadTarget=addNpc(dead,'dead-target');addMusicWorld(dead,deadTarget.npc.id);purchasePersonalItem(dead,'late_night_cocoa_set');const deadGift=dead.personalInventory.items[0]!;deadTarget.npc.alive=false;const deadBefore=JSON.stringify(dead);
  verify(!shareExperienceWithNpc(dead,deadTarget.npc.id,'nightjar-diner','diner_meal').success&&!givePersonalItemGift(dead,deadTarget.npc.id,deadGift.id).success&&!askNpcOnDate(dead,deadTarget.npc.id).success&&!shareCrossWorldExperienceWithNpc(dead,deadTarget.npc.id,'music-home-session').success&&JSON.stringify(dead)===deadBefore,'34 deceased exact targets must fail safely across outing/gift/date/cross-world entry points without hidden mutation');

  const stale=closeoutState('phase9g-stale');const staleTarget=addNpc(stale,'stale-target');addMusicWorld(stale,staleTarget.npc.id);delete stale.npcs[staleTarget.npc.id];const staleBefore=JSON.stringify(stale);
  verify(projectSharedExperienceOptions(stale,staleTarget.npc.id).every(option=>!option.allowed)&&projectPersonalGiftOptions(stale,staleTarget.npc.id).length===0&&projectRomanticDateOptions(stale,staleTarget.npc.id).length===0&&projectCrossWorldChemistryPlans(stale,staleTarget.npc.id).length===0&&JSON.stringify(stale)===staleBefore,'35 stale exact NPC ids must remain safely non-actionable across every Phase 9 projection without mutation');

  const rewind=storyFixture();rewind.state.flags.rewindEnabled=true;captureRewindSnapshot(rewind.state);const rewindBaseline=exportSave(rewind.state);runIntegratedStory(rewind.state,rewind.target.npc.id);
  verify(rewindToAge(rewind.state,24).success,'36 rewind must accept the pre-Shared-Lives snapshot after a multi-year integrated story');
  const rewindComparable=importSave(rewindBaseline);rewindComparable.flags.rewinds=1;
  verify(exportSave(rewind.state)===exportSave(rewindComparable),'37 rewind must atomically restore inventory, relationship, romance, preference knowledge, memories, timeline, action economy, RNG, and runtime IDs with only the legitimate rewind counter changed');

  const dynasty=storyFixture();runIntegratedStory(dynasty.state,dynasty.target.npc.id);advanceYear(dynasty.state);purchasePersonalItem(dynasty.state,'pocket_journal');const heir=addNpc(dynasty.state,'closeout-heir','child',18);heir.npc.parentIds=[dynasty.state.character.id];dynasty.state.character.alive=false;
  const handoff=continueAsChild(dynasty.state,heir.npc.id);
  verify(handoff.success&&dynasty.state.legacy.generation>=2&&dynasty.state.personalInventory.items.length===0,'38 descendant continuation must not carry the prior protagonist ordinary gift inventory into the successor generation');
  verify(!('sharedLives' in (dynasty.state as unknown as Record<string,unknown>))&&!('giftHistory' in (dynasty.state as unknown as Record<string,unknown>))&&!('chemistryHistory' in (dynasty.state as unknown as Record<string,unknown>))&&validateState(dynasty.state).length===0,'39 dynasty handoff must remain invariant-clean without copying any Phase 9 shadow authority');

  const bounded=closeoutState('phase9g-bounded');const boundedTarget=addNpc(bounded,'bounded-target');boundedTarget.rel.score=100;boundedTarget.rel.compatibility=100;boundedTarget.npc.hiddenOpinion=100;boundedTarget.npc.happiness=100;bounded.character.stats.happiness=100;
  for(let index=0;index<45;index+=1){const result=shareExperienceWithNpc(bounded,boundedTarget.npc.id,'nightjar-diner','diner_meal');if(!result.success)throw new Error(`Bounded-history closeout action ${index+1} failed.`);advanceYear(bounded);}
  verify(boundedTarget.npc.memories.length<=36&&(boundedTarget.rel.knownPreferenceTags?.length??0)<=8,'40 decades of meaningful Shared Lives activity must keep NPC memory and learned-preference history bounded');
  verify(validateState(bounded).length===0,'41 decades of repeated valid social consequences must remain invariant-clean after history pruning');

  return checks;
}
