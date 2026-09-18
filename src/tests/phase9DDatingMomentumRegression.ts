import { actionUsesThisAge } from '../core/actionEconomy';
import { enforceStateInvariants, validateState } from '../core/invariants';
import { createRng } from '../core/rng';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { ROMANTIC_DATE_HISTORY_LIMIT, ROMANTIC_DATE_PLANS, ROMANTIC_MOMENTUM_REQUIRED } from '../data/romanticDates';
import { sharedExperienceActivityById } from '../data/sharedExperiences';
import { TOWN_PLACES } from '../data/townPlaces';
import { exportSave, importSave } from '../services/SaveSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import {
  askNpcOnDate,
  canAskNpcOnDate,
  canBecomePartners,
  canHookUpWithNpc,
  canReconcileWithNpc,
  cancelPendingDate,
  changeRelationshipType,
  completeRomanticDate,
} from '../systems/RelationshipSystem';
import { projectRomanticDateOptions, recordRomanticDate, romanticDateMomentum, romanticDateTargetAvailability, romanticMomentumReady } from '../systems/RomanticDateSystem';
import type { GameState, Npc, Relationship, RelationshipType } from '../types/game';

const placeIds=new Set(TOWN_PLACES.map(place=>place.id));

function seedWithRolls(prefix:string,predicate:(rolls:number[])=>boolean){
  for(let index=0;index<5000;index++){
    const seed=`${prefix}-${index}`;const rng=createRng(seed,0);const rolls=Array.from({length:10},()=>rng.next());
    if(predicate(rolls))return seed;
  }
  throw new Error(`Could not find deterministic seed for ${prefix}`);
}

function addNpc(state:GameState,id:string,age:number,type:RelationshipType='friend'):{npc:Npc;rel:Relationship}{
  const npc:Npc={id,firstName:'Riley',lastName:'Thread',age,alive:true,health:95,happiness:92,wealth:5000,countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:70,maritalStatus:'single',traits:['romantic','loyal'],hiddenOpinion:100,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['romance','food','film','nature'],dislikes:[],aversions:[]}};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type,score:100,attraction:100,compatibility:100,yearsKnown:4};
  state.npcs[id]=npc;state.relationships.push(rel);ensureNpcLife(state,npc);return{npc,rel};
}

function datingState(seed:string,playerAge=24,npcAge=24,type:RelationshipType='friend'){
  const state=createNewGame({seed});state.seed=seed;state.rngCounter=0;state.character.age=playerAge;state.currentYear=2060;state.character.orientation='pansexual';state.character.stats.happiness=90;state.character.stats.health=95;state.settings.autoSave=false;
  const pair=addNpc(state,'dating-target',npcAge,type);return{state,...pair};
}

function goodHistory(state:GameState,rel:Relationship,count=3){
  rel.romance={dateHistory:Array.from({length:count},(_,index)=>({year:state.currentYear-index,age:Math.max(14,state.character.age-index),placeId:'nightjar-diner',activityId:'diner_meal',approval:84,band:'good' as const}))};
}

function clone<T>(value:T):T{return structuredClone(value);}

export function runPhase9DDatingMomentumRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9D dating/momentum regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===18,'01 dating/momentum must extend existing Relationship state without a schema bump');
  verify(ROMANTIC_DATE_PLANS.length===8,'02 the first dating slice should expose eight meaningful date plans rather than cosmetic duplicates');
  verify(new Set(ROMANTIC_DATE_PLANS.map(plan=>plan.id)).size===ROMANTIC_DATE_PLANS.length,'03 date-plan ids must be unique');
  verify(ROMANTIC_DATE_PLANS.every(plan=>plan.minAge>=14),'04 every authored date plan must respect the established dating minimum age');
  verify(ROMANTIC_DATE_PLANS.every(plan=>placeIds.has(plan.placeId)&&sharedExperienceActivityById[plan.activityId]?.placeIds.includes(plan.placeId)),'05 every date plan must reuse a canonical town place and Phase 9B activity pair');
  verify(ROMANTIC_DATE_PLANS.every(plan=>!['sleepover','school_social'].includes(plan.activityId)),'06 date planning must not repurpose youth-only activities as romance shortcuts');

  const browse=datingState('phase9d-browse');const browseBefore=JSON.stringify(browse.state),browseRng=browse.state.rngCounter,browseId=browse.state.idCounter;
  verify(projectRomanticDateOptions(browse.state,browse.npc.id).length===0&&JSON.stringify(browse.state)===browseBefore&&browse.state.rngCounter===browseRng&&browse.state.idCounter===browseId,'07 date-option browsing must stay empty before acceptance and remain read-only/RNG/runtime-ID neutral');

  const underage=datingState('phase9d-child',13,13);verify(!canAskNpcOnDate(underage.state,underage.npc.id)&&!askNpcOnDate(underage.state,underage.npc.id).success,'08 pre-teen/young-teen targets must remain below the dating gate without mutation');
  const teenAdult=datingState('phase9d-teen-adult',16,19);verify(!canAskNpcOnDate(teenAdult.state,teenAdult.npc.id),'09 a teen must not be offered an adult date target');
  const adultMinor=datingState('phase9d-adult-minor',20,17);verify(!canAskNpcOnDate(adultMinor.state,adultMinor.npc.id),'10 an adult must not be offered a minor date target');
  const incompatible=datingState('phase9d-incompatible');incompatible.state.character.orientation='straight';incompatible.state.character.genderIdentity='man';incompatible.npc.gender='male';incompatible.npc.sexuality='gay';verify(!canAskNpcOnDate(incompatible.state,incompatible.npc.id),'11 date eligibility must preserve mutual orientation compatibility');
  const committed=datingState('phase9d-committed');const other=addNpc(committed.state,'existing-partner',25,'partner');other.npc.maritalStatus='dating';verify(!canAskNpcOnDate(committed.state,committed.npc.id),'12 a current partner/fiance/spouse must block another ordinary date invitation');
  const dead=datingState('phase9d-dead');dead.npc.alive=false;verify(!canAskNpcOnDate(dead.state,dead.npc.id),'13 deceased NPCs must not retain date controls');
  const estranged=datingState('phase9d-estranged');estranged.rel.estranged=true;verify(!canAskNpcOnDate(estranged.state,estranged.npc.id),'14 estranged relationships must not expose date invitations');
  const stale=datingState('phase9d-stale');delete stale.state.npcs[stale.npc.id];verify(!canAskNpcOnDate(stale.state,stale.npc.id),'15 stale NPC ids must fail cleanly without projecting a date path');

  const rejectSeed=seedWithRolls('phase9d-reject-invite',rolls=>rolls[0]!>.92);
  const rejected=datingState(rejectSeed);const rejectedBeforeType=rejected.rel.type,rejectedBeforeTimeline=rejected.state.timeline.length;const rejectedInvite=askNpcOnDate(rejected.state,rejected.npc.id);
  verify(!rejectedInvite.success&&!rejectedInvite.accepted&&!rejected.rel.romance?.pendingDate&&rejected.rel.type===rejectedBeforeType,'16 an NPC may reject an individual date without silently changing relationship type or creating pending plans');
  verify(actionUsesThisAge(rejected.state,'relationship.date.invite',rejected.npc.id)===1&&rejected.state.rngCounter===1&&rejected.state.timeline.length===rejectedBeforeTimeline+1&&canAskNpcOnDate(rejected.state,rejected.npc.id),'17 a rejected date consumes exactly one invitation roll/timeline entry while preserving future possibility');

  const successSeed=seedWithRolls('phase9d-success-sequence',rolls=>rolls[0]!<.92&&rolls[2]!<.92&&rolls[4]!<.92&&rolls[6]!<.92);
  const accepted=datingState(successSeed);const inviteRng=accepted.state.rngCounter,inviteTimeline=accepted.state.timeline.length;
  const invite=askNpcOnDate(accepted.state,accepted.npc.id);
  verify(invite.success&&invite.accepted&&invite.pendingDate&&Boolean(accepted.rel.romance?.pendingDate),'18 a compatible invitation can be accepted and persist a pending exact-NPC date choice');
  verify(actionUsesThisAge(accepted.state,'relationship.date.invite',accepted.npc.id)===1&&accepted.state.rngCounter===inviteRng+1,'19 an accepted invitation consumes exactly one date-invite opportunity and one gameplay RNG draw');
  verify(accepted.state.timeline.length===inviteTimeline+1&&accepted.state.timeline.at(-1)?.npcIds?.[0]===accepted.npc.id,'20 invitation acceptance must record exactly one exact-target relationship timeline entry');
  verify(accepted.rel.type==='friend'&&accepted.npc.maritalStatus==='single','21 accepting a date must not itself jump the relationship to partner/dating status');
  const pendingSnapshot=JSON.stringify(accepted.state),pendingRng=accepted.state.rngCounter,pendingTimeline=accepted.state.timeline.length,pendingUses=actionUsesThisAge(accepted.state,'relationship.date.invite',accepted.npc.id);const duplicateInvite=askNpcOnDate(accepted.state,accepted.npc.id);
  verify(!duplicateInvite.success&&duplicateInvite.pendingDate&&JSON.stringify(accepted.state)===pendingSnapshot&&accepted.state.rngCounter===pendingRng&&accepted.state.timeline.length===pendingTimeline&&actionUsesThisAge(accepted.state,'relationship.date.invite',accepted.npc.id)===pendingUses,'22 a pending accepted date must block duplicate invites without consuming another action/RNG/timeline entry');

  const optionsBefore=JSON.stringify(accepted.state),optionsRng=accepted.state.rngCounter,optionsId=accepted.state.idCounter;const options=projectRomanticDateOptions(accepted.state,accepted.npc.id);
  verify(options.length===ROMANTIC_DATE_PLANS.length,'23 an accepted adult date should expose the full curated date-plan set');
  verify(JSON.stringify(accepted.state)===optionsBefore&&accepted.state.rngCounter===optionsRng&&accepted.state.idCounter===optionsId,'24 date-plan projection must be read-only and gameplay-RNG/runtime-ID neutral');
  verify(options.every(option=>option.allowed&&sharedExperienceActivityById[option.activityId]?.placeIds.includes(option.placeId)),'25 every projected date option must still pass the real shared-experience availability path');

  const cancel=datingState(successSeed);askNpcOnDate(cancel.state,cancel.npc.id);const cancelRng=cancel.state.rngCounter,cancelTimeline=cancel.state.timeline.length,cancelUses=actionUsesThisAge(cancel.state,'relationship.date.invite',cancel.npc.id);const cancelResult=cancelPendingDate(cancel.state,cancel.npc.id);
  verify(cancelResult.success&&!cancel.rel.romance?.pendingDate,'26 cancelling an accepted date must clear only the pending plan');
  verify(cancel.state.rngCounter===cancelRng&&cancel.state.timeline.length===cancelTimeline&&actionUsesThisAge(cancel.state,'relationship.date.invite',cancel.npc.id)===cancelUses,'27 cancelling plans must not refund/consume action economy or gameplay RNG or invent a timeline event');

  const noPending=datingState('phase9d-no-pending');const noPendingBefore=JSON.stringify(noPending.state);verify(!completeRomanticDate(noPending.state,noPending.npc.id,'nightjar-diner','diner_meal').success&&JSON.stringify(noPending.state)===noPendingBefore,'28 direct date execution without an accepted invitation must fail without mutation');
  const invalid=datingState(successSeed);askNpcOnDate(invalid.state,invalid.npc.id);const invalidBefore=JSON.stringify(invalid.state);const invalidResult=completeRomanticDate(invalid.state,invalid.npc.id,'weaver-park','diner_meal');verify(!invalidResult.success&&Boolean(invalid.rel.romance?.pendingDate)&&JSON.stringify(invalid.state)===invalidBefore,'29 an invalid/non-curated activity-place pair must fail before mutation and preserve the pending accepted date');
  const remote=datingState(successSeed);askNpcOnDate(remote.state,remote.npc.id);remote.npc.city='Elsewhere';const remoteOptions=projectRomanticDateOptions(remote.state,remote.npc.id);verify(remoteOptions.length===ROMANTIC_DATE_PLANS.length&&remoteOptions.every(option=>!option.allowed&&Boolean(option.reason))&&Boolean(remote.rel.romance?.pendingDate),'30 if the target becomes remote after accepting, date choices must remain visible-but-disabled while preserving the pending plan for later recovery');

  const dateState=datingState(successSeed);askNpcOnDate(dateState.state,dateState.npc.id);const knownBefore=dateState.rel.knownPreferenceTags?.length??0,dateRng=dateState.state.rngCounter,dateTimeline=dateState.state.timeline.length,dateAttraction=dateState.rel.attraction;
  const firstDate=completeRomanticDate(dateState.state,dateState.npc.id,'nightjar-diner','diner_meal');
  verify(firstDate.success&&Boolean(firstDate.experience),'31 an accepted curated date must execute successfully through the shared-experience path');
  verify(actionUsesThisAge(dateState.state,'social.npc.total',dateState.npc.id)===1&&actionUsesThisAge(dateState.state,'social.npc.action',`${dateState.npc.id}:date:diner_meal`)===1,'32 a real date must reuse the established per-NPC social opportunity plus a date-specific action key');
  verify(dateState.state.rngCounter===dateRng+1,'33 completing a date must consume exactly one gameplay RNG draw for the shared-experience variation');
  verify(dateState.state.timeline.length===dateTimeline+1&&dateState.state.timeline.at(-1)?.npcIds?.[0]===dateState.npc.id,'34 completing a date must write exactly one exact-target timeline result');
  verify(dateState.rel.romance?.dateHistory?.length===1&&dateState.rel.romance.dateHistory[0]?.placeId==='nightjar-diner'&&dateState.rel.romance.dateHistory[0]?.activityId==='diner_meal','35 completed dates must write one compact bounded history record with exact place/activity identity');
  verify(!dateState.rel.romance?.pendingDate,'36 a completed date must clear its pending invitation exactly once');
  verify(Boolean(firstDate.experience?.prose.includes('date')),'37 date prose must remain coherent and explicitly contextualize the shared experience as a date');
  verify(dateState.rel.attraction>dateAttraction-1,'38 a strongly successful date must preserve or improve attraction rather than acting like a generic non-romantic outing');
  verify((dateState.rel.knownPreferenceTags?.length??0)-knownBefore<=1,'39 one date may reveal at most one relevant preference through the existing relationship-owned knowledge authority');
  verify(!canBecomePartners(dateState.state,dateState.npc.id)&&romanticDateMomentum(dateState.rel)<ROMANTIC_MOMENTUM_REQUIRED,'40 one successful date must not immediately unlock official partnership');

  const invite2=askNpcOnDate(dateState.state,dateState.npc.id);const secondDate=invite2.accepted?completeRomanticDate(dateState.state,dateState.npc.id,'crossroads-mall','movie_outing'):undefined;
  verify(Boolean(invite2.accepted&&secondDate?.success),'41 a second accepted date can use a different shared activity in the same year without colliding with the first date action key');
  const invite3=askNpcOnDate(dateState.state,dateState.npc.id);const thirdDate=invite3.accepted?completeRomanticDate(dateState.state,dateState.npc.id,'weaver-park','park_walk'):undefined;
  verify(Boolean(invite3.accepted&&thirdDate?.success),'42 the existing three-per-person social cap permits a third distinct date but no unbounded same-year spam');
  const threeDateHistoryLength=Number(dateState.rel.romance?.dateHistory?.length??0);verify(threeDateHistoryLength===3&&actionUsesThisAge(dateState.state,'social.npc.total',dateState.npc.id)===3&&actionUsesThisAge(dateState.state,'relationship.date.invite',dateState.npc.id)===3,'43 three real dates must reconcile exactly with bounded date history and existing annual social/invite limits');
  verify(romanticDateMomentum(dateState.rel)>=ROMANTIC_MOMENTUM_REQUIRED&&romanticMomentumReady(dateState.rel),'44 roughly three genuinely successful dates must build enough hidden romantic momentum');
  verify(canBecomePartners(dateState.state,dateState.npc.id),'45 sufficient momentum must unlock the attempt to become official partners without changing relationship type yet');
  const milestoneBefore=actionUsesThisAge(dateState.state,'relationship.milestone',dateState.npc.id);const partnership=changeRelationshipType(dateState.state,dateState.npc.id,'become_partners');
  verify(actionUsesThisAge(dateState.state,'relationship.milestone',dateState.npc.id)===milestoneBefore+1,'46 Become Partners must remain an ordinary bounded relationship milestone distinct from date invitations');
  verify(partnership.success&&dateState.rel.type==='partner'&&dateState.npc.maritalStatus==='dating','47 a successful Become Partners attempt must convert the exact existing relationship and household identity without creating another record');

  const premature=datingState('phase9d-premature');const prematureBeforeRng=premature.state.rngCounter,prematureTimeline=premature.state.timeline.length;const prematureResult=changeRelationshipType(premature.state,premature.npc.id,'become_partners');
  verify(!prematureResult.success&&premature.rel.type==='friend'&&actionUsesThisAge(premature.state,'relationship.milestone',premature.npc.id)===0&&premature.state.rngCounter===prematureBeforeRng&&premature.state.timeline.length===prematureTimeline,'48 Become Partners must fail before action economy/RNG/timeline mutation when real date momentum is missing');

  const rejectPartnerSeed=seedWithRolls('phase9d-reject-partner',rolls=>rolls[0]!>.92);const rejectPartner=datingState(rejectPartnerSeed);goodHistory(rejectPartner.state,rejectPartner.rel);const historyBefore=JSON.stringify(rejectPartner.rel.romance?.dateHistory);const rejectPartnerResult=changeRelationshipType(rejectPartner.state,rejectPartner.npc.id,'become_partners');
  verify(!rejectPartnerResult.success&&rejectPartner.rel.type==='friend'&&JSON.stringify(rejectPartner.rel.romance?.dateHistory)===historyBefore,'49 sufficient momentum must unlock only an attempt; rejection must be possible and preserve the established date history');
  rejectPartner.state.character.age+=1;rejectPartner.state.currentYear+=1;rejectPartner.npc.age+=1;verify(canBecomePartners(rejectPartner.state,rejectPartner.npc.id),'50 partnership rejection must not automatically eliminate future possibility after the yearly milestone gate resets');

  const bounded=datingState('phase9d-bounded');for(let index=0;index<12;index++)recordRomanticDate(bounded.rel,{year:2040+index,age:18+index,placeId:'nightjar-diner',activityId:'diner_meal',approval:70+index%20,band:index%2?'good':'mixed'});verify(bounded.rel.romance?.dateHistory?.length===ROMANTIC_DATE_HISTORY_LIMIT&&bounded.rel.romance.dateHistory[0]?.year===2044,'51 romantic date history must stay hard-bounded to the most recent meaningful window');

  const malformed=datingState('phase9d-malformed');malformed.rel.romance={pendingDate:{acceptedYear:Number.NaN,acceptedAge:-4},dateHistory:Array.from({length:12},(_,index)=>({year:2040+index,age:index-2,placeId:'nightjar-diner',activityId:'diner_meal',approval:index===0?250:70,band:'good' as const}))};enforceStateInvariants(malformed.state);verify((malformed.rel.romance?.dateHistory?.length??0)<=ROMANTIC_DATE_HISTORY_LIMIT&&!malformed.rel.romance?.pendingDate&&malformed.rel.romance!.dateHistory!.every(entry=>entry.approval>=0&&entry.approval<=100&&entry.age>=0)&&validateState(malformed.state).length===0,'52 invariant repair must bound/sanitize romantic history and remove malformed pending-date state deterministically');

  const roundTrip=datingState(successSeed);goodHistory(roundTrip.state,roundTrip.rel,2);roundTrip.rel.romance!.pendingDate={acceptedYear:roundTrip.state.currentYear,acceptedAge:roundTrip.state.character.age};const imported=importSave(exportSave(roundTrip.state));const importedRel=imported.relationships.find(rel=>rel.npcId===roundTrip.npc.id)!;verify(JSON.stringify(importedRel.romance)===JSON.stringify(roundTrip.rel.romance),'53 save round-trip must preserve exact bounded date history and a legitimate pending accepted date on current schema 18');

  const dynasty=datingState('phase9d-dynasty');goodHistory(dynasty.state,dynasty.rel,3);const heir=addNpc(dynasty.state,'phase9d-heir',22,'child');heir.npc.parentIds=[dynasty.state.character.id];dynasty.state.character.alive=false;const continuation=continueAsChild(dynasty.state,heir.npc.id);const inheritedFriend=dynasty.state.relationships.find(rel=>rel.npcId==='dating-target');verify(continuation.success&&inheritedFriend?.type==='friend'&&inheritedFriend.romance===undefined,'54 descendant continuation must not inherit the previous protagonist romantic-date history or pending momentum');

  const deterministicBase=datingState(successSeed);const deterministicA=clone(deterministicBase.state),deterministicB=clone(deterministicBase.state);const runDeterministic=(state:GameState)=>{const inviteResult=askNpcOnDate(state,'dating-target');const dateResult=inviteResult.accepted?completeRomanticDate(state,'dating-target','nightjar-diner','diner_meal'):undefined;return JSON.stringify({inviteResult,dateResult,state});};verify(runDeterministic(deterministicA)===runDeterministic(deterministicB),'55 identical seeded Ask on Date + date histories must remain deterministic across exact cloned states');

  const ageBoundary=datingState(successSeed,16,17);const boundaryInvite=askNpcOnDate(ageBoundary.state,ageBoundary.npc.id);verify(Boolean(boundaryInvite.accepted&&ageBoundary.rel.romance?.pendingDate),'56 a valid teen date can persist as an accepted pending plan before an age-boundary transition');
  ageBoundary.state.character.age=17;ageBoundary.npc.age=18;ageBoundary.state.currentYear+=1;const boundaryAvailability=romanticDateTargetAvailability(ageBoundary.state,ageBoundary.npc.id);verify(!boundaryAvailability.allowed&&Boolean(ageBoundary.rel.romance?.pendingDate)&&projectRomanticDateOptions(ageBoundary.state,ageBoundary.npc.id).length===0,'57 a temporarily teen/adult-incompatible pending date must stay preserved while execution options become unavailable');
  const boundaryRng=ageBoundary.state.rngCounter,boundaryTimeline=ageBoundary.state.timeline.length,boundaryUses=actionUsesThisAge(ageBoundary.state,'relationship.date.invite',ageBoundary.npc.id);const boundaryCancel=cancelPendingDate(ageBoundary.state,ageBoundary.npc.id);verify(boundaryCancel.success&&!ageBoundary.rel.romance?.pendingDate&&ageBoundary.state.rngCounter===boundaryRng&&ageBoundary.state.timeline.length===boundaryTimeline&&actionUsesThisAge(ageBoundary.state,'relationship.date.invite',ageBoundary.npc.id)===boundaryUses,'58 temporarily unavailable accepted plans must remain explicitly cancellable without hidden RNG/timeline/action-economy mutation');

  const deceasedPending=datingState(successSeed);askNpcOnDate(deceasedPending.state,deceasedPending.npc.id);deceasedPending.npc.alive=false;enforceStateInvariants(deceasedPending.state);verify(deceasedPending.rel.romance===undefined,'59 invariant repair must remove an unresolved pending date when the exact NPC dies instead of leaving unreachable durable plan state');

  const estrangedCommitment=datingState('phase9d-estranged-commitment');const estrangedPartner=addNpc(estrangedCommitment.state,'estranged-partner',25,'partner');estrangedPartner.rel.estranged=true;estrangedPartner.npc.maritalStatus='dating';verify(!canAskNpcOnDate(estrangedCommitment.state,estrangedCommitment.npc.id)&&canHookUpWithNpc(estrangedCommitment.state,estrangedCommitment.npc.id),'60 an estranged living partner/fiance/spouse must remain a current commitment for exclusivity and hookup semantics until the relationship type actually ends');
  const estrangedReconcile=datingState('phase9d-estranged-reconcile',24,24,'ex');const separatedPartner=addNpc(estrangedReconcile.state,'separated-current-partner',25,'partner');separatedPartner.rel.estranged=true;verify(!canReconcileWithNpc(estrangedReconcile.state,estrangedReconcile.npc.id),'61 an estranged current commitment must still block reconciliation with an ex, preserving the certified commitment rule');

  return checks;
}
