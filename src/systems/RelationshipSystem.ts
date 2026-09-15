import type { EngineResult, GameState, Npc, Orientation, Relationship, RelationshipType } from '../types/game';
import type { SharedExperienceActionResult, SharedExperienceEvaluationContext, SharedExperienceResult } from '../types/sharedExperiences';
import type { DateInvitationResult, RomanticDateActionResult } from '../types/romanticDates';
import type { PersonalGiftActionResult } from '../types/gifts';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { consumeAction } from '../core/actionEconomy';
import { ensureNpcLife } from './NpcLifeSystem';
import { biologicalChildGate } from './ReproductionSystem';
import { assignNpcIdentity } from './NpcIdentitySystem';
import { assignGeneratedNpcOrientation, characterRomanticGender, pickRomanticTargetGender, playerNpcRomanticallyCompatible, playerNpcSexuallyCompatible } from './NpcOrientationSystem';
import { pickCollisionAwareNpcName } from './NpcNamingSystem';
import { scheduleFriendArgumentStory, scheduleMarriageExpectationsStory, scheduleParentingPresenceStory, scheduleReconciliationStory } from './SystemicStorySystem';
import { ensureNpcPreferenceProfile, revealNpcPreference } from './NpcPreferenceSystem';
import { evaluateSharedExperience, sharedExperienceAvailability } from './SharedExperienceSystem';
import { ROMANTIC_CANDIDATE_TYPES, datingAgesCompatible, romanticDateMomentum, romanticDatePlanFor, romanticDateTargetAvailability, romanticMomentumReady, recordRomanticDate } from './RomanticDateSystem';
import { sharedExperienceActivityById } from '../data/sharedExperiences';
import { evaluatePersonalGift, personalGiftAvailability } from './GiftSystem';
import { takePersonalItemInstance } from './PersonalInventorySystem';
import { crossWorldChemistryPlanFor } from './CrossWorldChemistrySystem';
import { residentialPlanFor } from './ResidentialLifeSystem';

export const DATING_MIN_AGE=14;

export type RelationshipInteractionAction='conversation'|'compliment'|'insult'|'spend_time'|'give_money'|'gift'|'ask_money'|'argue'|'apologize'|'prank'|'fight'|'counseling'|'vacation';

type RelationshipInteractionEffect={base:number;happiness:number;karma?:number};

const interactionEffects:Record<RelationshipInteractionAction,RelationshipInteractionEffect> = {
  conversation:{base:3,happiness:1}, compliment:{base:5,happiness:2}, insult:{base:-12,happiness:-1,karma:-2}, spend_time:{base:7,happiness:4},
  give_money:{base:8,happiness:1,karma:2}, gift:{base:6,happiness:3}, ask_money:{base:-2,happiness:0}, argue:{base:-9,happiness:-2},
  apologize:{base:7,happiness:1,karma:1}, prank:{base:1,happiness:2}, fight:{base:-20,happiness:-5,karma:-4}, counseling:{base:8,happiness:2}, vacation:{base:11,happiness:6},
};

type RelationshipInteractionCopy={timeline:(npcName:string)=>string;memory:(playerName:string)=>string};

const interactionCopy:Record<RelationshipInteractionAction,RelationshipInteractionCopy>={
  conversation:{timeline:npcName=>`You had a conversation with ${npcName}.`,memory:playerName=>`${playerName} had a conversation with you.`},
  compliment:{timeline:npcName=>`You complimented ${npcName}.`,memory:playerName=>`${playerName} complimented you.`},
  insult:{timeline:npcName=>`You insulted ${npcName}.`,memory:playerName=>`${playerName} insulted you.`},
  spend_time:{timeline:npcName=>`You spent time with ${npcName}.`,memory:playerName=>`${playerName} spent time with you.`},
  give_money:{timeline:npcName=>`You gave ${npcName} some money.`,memory:playerName=>`${playerName} gave you some money.`},
  gift:{timeline:npcName=>`You gave ${npcName} a gift.`,memory:playerName=>`${playerName} gave you a gift.`},
  ask_money:{timeline:npcName=>`You asked ${npcName} for money.`,memory:playerName=>`${playerName} asked you for money.`},
  argue:{timeline:npcName=>`You argued with ${npcName}.`,memory:playerName=>`${playerName} argued with you.`},
  apologize:{timeline:npcName=>`You apologized to ${npcName}.`,memory:playerName=>`${playerName} apologized to you.`},
  prank:{timeline:npcName=>`You pranked ${npcName}.`,memory:playerName=>`${playerName} pranked you.`},
  fight:{timeline:npcName=>`You fought with ${npcName}.`,memory:playerName=>`${playerName} fought with you.`},
  counseling:{timeline:npcName=>`You went to counseling with ${npcName}.`,memory:playerName=>`${playerName} went to counseling with you.`},
  vacation:{timeline:npcName=>`You went on vacation with ${npcName}.`,memory:playerName=>`${playerName} went on vacation with you.`},
};

export function relationshipInteractionText(action:RelationshipInteractionAction,playerName:string,npcName:string){
  const copy=interactionCopy[action];
  return{timeline:copy.timeline(npcName),memory:copy.memory(playerName)};
}

const RELATIONSHIP_MEMORY_LIMIT=36;

function addRelationshipMemory(state:GameState,npc:Npc,kind:string,sentiment:number,summary:string,permanent=false){
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent});
  if(npc.memories.length<=RELATIONSHIP_MEMORY_LIMIT)return;
  const permanentMemories=npc.memories.filter(memory=>memory.permanent).slice(-18);
  const recent=npc.memories.filter(memory=>!memory.permanent).slice(-Math.max(0,RELATIONSHIP_MEMORY_LIMIT-permanentMemories.length));
  npc.memories=[...permanentMemories,...recent].slice(-RELATIONSHIP_MEMORY_LIMIT);
}

const CURRENT_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);

function currentRomanticCommitments(state:GameState,excludeNpcId?:string){
  return state.relationships.filter(rel=>rel.npcId!==excludeNpcId&&CURRENT_ROMANTIC_TYPES.has(rel.type)&&state.npcs[rel.npcId]?.alive);
}

export function hasCurrentRomanticCommitment(state:GameState,excludeNpcId?:string){return currentRomanticCommitments(state,excludeNpcId).length>0;}

export function canAskNpcOnDate(state:GameState,npcId:string){
  const availability=romanticDateTargetAvailability(state,npcId);
  return Boolean(availability.allowed&&!availability.relationship?.romance?.pendingDate);
}

export function canBecomePartners(state:GameState,npcId:string){
  const availability=romanticDateTargetAvailability(state,npcId);
  return Boolean(availability.allowed&&!availability.relationship?.romance?.pendingDate&&availability.relationship&&romanticMomentumReady(availability.relationship));
}

export function canHookUpWithNpc(state:GameState,npcId:string){
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  return Boolean(
    npc?.alive&&rel&&state.character.age>=18&&npc.age>=18&&
    ROMANTIC_CANDIDATE_TYPES.has(rel.type)&&currentRomanticCommitments(state,npcId).length>0&&playerNpcSexuallyCompatible(state,npc)
  );
}

export function canReconcileWithNpc(state:GameState,npcId:string){
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  return Boolean(npc?.alive&&rel?.type==='ex'&&datingAgesCompatible(state.character.age,npc.age)&&!hasCurrentRomanticCommitment(state,npcId));
}

export function hookupDiscoveryChance(streak:number,commitmentType:RelationshipType,partner?:Npc){
  const repeated=Math.max(0,Math.floor(streak)-1)*.10;
  const commitmentBonus=commitmentType==='spouse'?.05:commitmentType==='fiance'?.03:0;
  const jealousyBonus=partner?.traits.includes('jealous')?.05:0;
  return clamp(.12+repeated+commitmentBonus+jealousyBonus,.12,.72);
}

export function hookUpWithNpc(state:GameState,npcId:string):EngineResult {
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(item=>item.npcId===npcId);
  if(!npc||!rel||!npc.alive)return{success:false,messages:[{text:'That relationship is unavailable.'}]};
  if(state.character.age<18||npc.age<18)return{success:false,messages:[{text:'Hookups are only available between adults.'}]};
  if(!ROMANTIC_CANDIDATE_TYPES.has(rel.type))return{success:false,messages:[{text:'A hookup is not available from this relationship.'}]};
  if(!playerNpcSexuallyCompatible(state,npc))return{success:false,messages:[{text:`You and ${npc.firstName} are not mutually compatible for a hookup.`}]};
  const commitments=currentRomanticCommitments(state,npcId);
  if(!commitments.length)return{success:false,messages:[{text:'You are not currently in another relationship. Ask this person on a date instead.'}]};
  const gate=consumeAction(state,{policy:'relationship.milestone',target:npcId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const acceptance=clamp(rel.attraction*.50+rel.score*.25+rel.compatibility*.15+clamp(npc.hiddenOpinion,0,100)*.10,5,100)/100;
  if(!rng.chance(acceptance)){
    const text=`${npc.firstName} was not interested in hooking up.`;
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:1,text,npcIds:[npcId]});
    state.rngCounter=rng.counter();
    return{success:false,messages:[{text}]};
  }

  const countKey=`hookupCount:${npcId}`;
  const streak=Number(state.flags[countKey]??0)+1;
  state.flags[countKey]=streak;
  state.flags.hookups=Number(state.flags.hookups??0)+1;
  rel.score=clamp(rel.score+4);rel.attraction=clamp(rel.attraction+2);npc.hiddenOpinion=clamp(npc.hiddenOpinion+3,-100,100);
  addRelationshipMemory(state,npc,'hookup',4,`Hooked up with ${state.character.firstName}.`,streak>=2);
  state.character.stats.happiness=clamp(state.character.stats.happiness+2);
  state.character.secondary.karma-=4;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:1,text:`You hooked up with ${npc.firstName}.`,npcIds:[npcId],relationshipDelta:4});

  const messages=[{text:`You and ${npc.firstName} hooked up.`}];
  for(const commitment of commitments){
    const partner=state.npcs[commitment.npcId];if(!partner?.alive)continue;
    if(!rng.chance(hookupDiscoveryChance(streak,commitment.type,partner)))continue;
    const oldType=commitment.type;
    const damage=Math.round(clamp(18+(streak-1)*4+(oldType==='spouse'?6:oldType==='fiance'?3:0)+(partner.traits.includes('jealous')?5:0),18,46));
    commitment.score=clamp(commitment.score-damage);
    partner.hiddenOpinion=clamp(partner.hiddenOpinion-damage*.9,-100,100);
    addRelationshipMemory(state,partner,'infidelity_discovery',-damage,`Discovered that ${state.character.firstName} hooked up with ${npc.firstName}.`,true);
    state.flags.infidelityDiscoveries=Number(state.flags.infidelityDiscoveries??0)+1;
    state.character.secondary.stress=clamp(state.character.secondary.stress+6);
    state.character.stats.happiness=clamp(state.character.stats.happiness-5);
    const endingChance=clamp(.05+(streak-1)*.07+(100-commitment.score)*.004+(partner.traits.includes('jealous')?.10:0)+(oldType==='spouse'?.08:oldType==='fiance'?.05:0),.05,.75);
    const ended=rng.chance(endingChance);
    if(ended){
      commitment.type='ex';
      partner.maritalStatus=oldType==='spouse'?'divorced':'single';
      ensureNpcLife(state,partner);
      if(oldType==='spouse')state.flags.divorces=Number(state.flags.divorces??0)+1;
      state.character.secondary.stress=clamp(state.character.secondary.stress+4);
    }
    const falloutText=ended
      ?`${partner.firstName} found out about your hookup with ${npc.firstName} and ended your ${oldType==='spouse'?'marriage':oldType==='fiance'?'engagement':'relationship'}.`
      :`${partner.firstName} found out about your hookup with ${npc.firstName}. Your relationship took a serious hit.`;
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:ended?3:2,text:falloutText,npcIds:[partner.id,npc.id],relationshipDelta:-damage});
    messages.push({text:falloutText});
  }
  state.rngCounter=rng.counter();
  return{success:true,messages};
}

export { processNpcLives as ageNpcs } from './NpcLifeSystem';

function personalityMultiplier(npc:Npc, action:string) {
  let mod=0;
  if (npc.traits.includes('loyal') && ['spend_time','apologize','conversation'].includes(action)) mod+=3;
  if (npc.traits.includes('generous') && action==='ask_money') mod+=5;
  if (npc.traits.includes('selfish') && action==='ask_money') mod-=6;
  if (npc.traits.includes('aggressive') && ['insult','prank'].includes(action)) mod-=4;
  if (npc.traits.includes('romantic') && ['gift','vacation'].includes(action)) mod+=4;
  if (npc.traits.includes('stubborn') && action==='apologize') mod-=2;
  return mod;
}

export function interactWithNpc(state:GameState,npcId:string,action:string):EngineResult {
  const npc=state.npcs[npcId];
  const rel=state.relationships.find(r=>r.npcId===npcId);
  if (!npc || !rel) return {success:false,messages:[{text:'That relationship no longer exists.'}]};
  if (!npc.alive) return {success:false,messages:[{text:`You cannot interact with ${npc.firstName}; they have died.`}]};
  if(action==='hook_up')return hookUpWithNpc(state,npcId);
  if(action==='gift')return{success:false,messages:[{text:'Choose an owned item from your personal inventory to give as a gift.'}]};
  const interactionAction=action as RelationshipInteractionAction;
  const spec=interactionEffects[interactionAction];
  if (!spec) return {success:false,messages:[{text:'That interaction is not available.'}]};
  if(action==='give_money'&&state.finances.cash<500)return{success:false,messages:[{text:'You do not have enough cash for that.'}]};
  const gate=consumeAction(state,[{policy:'social.npc.total',target:npcId},{policy:'social.npc.action',target:`${npcId}:${action}`}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  let delta=spec.base+personalityMultiplier(npc,action)+rng.int(-3,3);
  if (action==='give_money') {
    state.finances.cash-=500; npc.wealth+=500;
  }
  if (action==='ask_money') {
    if (npc.wealth < 250 || !rng.chance(clamp(rel.score+npc.hiddenOpinion,0,180)/200)) delta-=4;
    else { const amount=Math.min(npc.wealth,rng.int(100,1200)); npc.wealth-=amount; state.finances.cash+=amount; }
  }
  rel.score=clamp(rel.score+delta); npc.hiddenOpinion=clamp(npc.hiddenOpinion+delta*.35,-100,100);
  const copy=relationshipInteractionText(interactionAction,state.character.firstName,npc.firstName);
  addRelationshipMemory(state,npc,action,delta,copy.memory,Math.abs(delta)>=10);
  state.character.stats.happiness=clamp(state.character.stats.happiness+spec.happiness);
  state.character.secondary.karma+=spec.karma??0;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:Math.abs(delta)>10?2:1,text:copy.timeline,npcIds:[npcId],relationshipDelta:delta});
  state.rngCounter=rng.counter();
  if(interactionAction==='spend_time'&&rel.type==='child')scheduleParentingPresenceStory(state,npcId);
  if(interactionAction==='argue'&&['friend','best_friend'].includes(rel.type))scheduleFriendArgumentStory(state,npcId);
  return {success:true,messages:[{text:`${npc.firstName}'s relationship with you ${delta>=0?'improved':'worsened'} (${delta>=0?'+':''}${Math.round(delta)}).`}]};
}

interface CommitSharedExperienceOptions {
  actionKey?:string;
  context?:SharedExperienceEvaluationContext;
  memoryKind?:string;
  formatProse?:(experience:SharedExperienceResult,npc:Npc)=>string;
  formatMemory?:(experience:SharedExperienceResult,npc:Npc)=>string;
}

function commitSharedExperience(state:GameState,npcId:string,placeId:string,activityId:string,options:CommitSharedExperienceOptions={}):SharedExperienceActionResult {
  const actionKey=options.actionKey??`shared:${activityId}`;
  const availability=sharedExperienceAvailability(state,npcId,placeId,activityId,actionKey);
  if(!availability.allowed)return{success:false,messages:[{text:availability.reason??'That shared experience is not available.'}]};
  const npc=availability.npc!,rel=availability.relationship!;
  const gate=consumeAction(state,[{policy:'social.npc.total',target:npcId},{policy:'social.npc.action',target:`${npcId}:${actionKey}`}]);
  if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  ensureNpcPreferenceProfile(state,npc);
  const rng=createRng(state.seed,state.rngCounter);
  const experience=evaluateSharedExperience(state,npcId,placeId,activityId,rng.int(-8,8),options.context);
  if(!experience)return{success:false,messages:[{text:'That shared experience could not be resolved.'}]};
  if(options.formatProse)experience.prose=options.formatProse(experience,npc);
  if(options.formatMemory)experience.memorySummary=options.formatMemory(experience,npc);
  rel.score=clamp(rel.score+experience.relationshipDelta);
  npc.hiddenOpinion=clamp(npc.hiddenOpinion+experience.opinionDelta,-100,100);
  state.character.stats.happiness=clamp(state.character.stats.happiness+experience.happinessDelta);
  const signal=experience.preferenceSignalTag;
  const alreadyKnown=signal?Boolean(rel.knownPreferenceTags?.includes(signal)):true;
  if(signal&&revealNpcPreference(state,npcId,signal)&&!alreadyKnown)experience.discoveredPreferenceTag=signal;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',placeId,importance:experience.meaningfulMemory?2:1,text:experience.prose,npcIds:[npcId],relationshipDelta:experience.relationshipDelta});
  if(experience.meaningfulMemory)addRelationshipMemory(state,npc,options.memoryKind??`shared_experience:${activityId}`,experience.relationshipDelta,experience.memorySummary,experience.band==='awful'||experience.band==='great');
  state.rngCounter=rng.counter();
  return{success:true,messages:[{text:experience.prose}],experience};
}

export function shareExperienceWithNpc(state:GameState,npcId:string,placeId:string,activityId:string):SharedExperienceActionResult {
  return commitSharedExperience(state,npcId,placeId,activityId);
}

export function shareCrossWorldExperienceWithNpc(state:GameState,npcId:string,planId:string):SharedExperienceActionResult {
  const plan=crossWorldChemistryPlanFor(state,npcId,planId);
  if(!plan)return{success:false,messages:[{text:'That shared-world plan is not available for this person.'}]};
  if(!plan.allowed)return{success:false,messages:[{text:plan.reason??'That shared-world plan is not available right now.'}]};
  const result=commitSharedExperience(state,npcId,plan.placeId,plan.activityId,{
    actionKey:`chemistry:${plan.id}`,
    context:{preferenceTags:plan.preferenceTags,enjoymentModifier:plan.enjoymentModifier??0},
    memoryKind:`cross_world:${plan.context.kind}:${plan.id}`,
  });
  if(result.experience)result.experience.activityLabel=plan.label;
  return result;
}

export function shareResidentialExperienceWithNpc(state:GameState,npcId:string,planId:string):SharedExperienceActionResult {
  const plan=residentialPlanFor(state,npcId,planId);
  if(!plan)return{success:false,messages:[{text:'That residential plan is not available for this person.'}]};
  if(!plan.allowed)return{success:false,messages:[{text:plan.reason??'That residential plan is not available right now.'}]};
  const result=commitSharedExperience(state,npcId,plan.placeId,plan.activityId,{
    actionKey:`residential:${plan.id}`,
    context:{preferenceTags:plan.preferenceTags,enjoymentModifier:plan.enjoymentModifier??0},
    memoryKind:`residential:${plan.id}:${plan.residence.propertyId??plan.residence.kind}`,
    formatProse:experience=>experience.prose.replace(experience.placeLabel,plan.residenceLabel),
    formatMemory:experience=>experience.memorySummary.replace(experience.placeLabel,plan.residenceLabel),
  });
  if(result.experience){result.experience.activityLabel=plan.label;result.experience.placeLabel=plan.residenceLabel;}
  return result;
}

export function givePersonalItemGift(state:GameState,npcId:string,instanceId:string):PersonalGiftActionResult {
  const availability=personalGiftAvailability(state,npcId,instanceId);
  if(!availability.allowed)return{success:false,messages:[{text:availability.reason??'That gift is not available.'}]};
  const npc=availability.npc!,rel=availability.relationship!;
  const rng=createRng(state.seed,state.rngCounter);
  const gift=evaluatePersonalGift(state,npcId,instanceId,rng.int(-8,8));
  if(!gift)return{success:false,messages:[{text:'That gift could not be evaluated.'}]};
  const gate=consumeAction(state,[{policy:'social.npc.total',target:npcId},{policy:'social.npc.action',target:`${npcId}:gift`}]);
  if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  ensureNpcPreferenceProfile(state,npc);
  const transferred=takePersonalItemInstance(state,instanceId);
  if(!transferred)return{success:false,messages:[{text:'That personal item is no longer in your inventory.'}]};
  rel.score=clamp(rel.score+gift.relationshipDelta);
  npc.hiddenOpinion=clamp(npc.hiddenOpinion+gift.opinionDelta,-100,100);
  state.character.stats.happiness=clamp(state.character.stats.happiness+gift.happinessDelta);
  const signal=gift.preferenceSignalTag;
  const alreadyKnown=signal?Boolean(rel.knownPreferenceTags?.includes(signal)):true;
  if(signal&&revealNpcPreference(state,npcId,signal)&&!alreadyKnown)gift.discoveredPreferenceTag=signal;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:gift.meaningfulMemory?2:1,text:gift.prose,npcIds:[npcId],relationshipDelta:gift.relationshipDelta});
  if(gift.meaningfulMemory)addRelationshipMemory(state,npc,`gift:${gift.itemId}`,gift.relationshipDelta,gift.memorySummary,gift.band==='awful'||gift.band==='great');
  state.rngCounter=rng.counter();
  return{success:true,stateChanges:['personalInventory','relationship'],messages:[{text:gift.prose}],gift};
}

function dateReaction(experience:SharedExperienceResult){
  if(experience.band==='great')return'The date had unmistakable chemistry.';
  if(experience.band==='good')return'The date left you both wanting another.';
  if(experience.band==='mixed')return'The time together was pleasant, but the spark was hard to read.';
  if(experience.band==='rough')return'The date felt strained and never quite found its rhythm.';
  return'The date went badly enough to linger afterward.';
}

function dateMemoryReaction(experience:SharedExperienceResult){
  if(experience.band==='great')return'The chemistry felt unmistakable.';
  if(experience.band==='good')return'The date felt warm and promising.';
  if(experience.band==='mixed')return'The spark was difficult to read.';
  if(experience.band==='rough')return'The date felt strained.';
  return'The date went badly.';
}

export function askNpcOnDate(state:GameState,npcId:string):DateInvitationResult {
  const availability=romanticDateTargetAvailability(state,npcId);
  if(!availability.allowed)return{success:false,messages:[{text:availability.reason??'That date invitation is not available.'}]};
  const npc=availability.npc!,rel=availability.relationship!;
  if(rel.romance?.pendingDate)return{success:false,messages:[{text:`${npc.firstName} already agreed to a date. Choose where to go first.`}],accepted:true,pendingDate:true};
  const gate=consumeAction(state,{policy:'relationship.date.invite',target:npcId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const chance=clamp(rel.score*.34+rel.compatibility*.24+rel.attraction*.32+npc.hiddenOpinion*.10,8,92)/100;
  const accepted=rng.chance(chance);
  const text=accepted?`${npc.firstName} says yes to a date. Choose somewhere to go together.`:`${npc.firstName} is not ready to go on a date with you right now.`;
  if(accepted){rel.romance??={};rel.romance.pendingDate={acceptedYear:state.currentYear,acceptedAge:state.character.age};}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:1,text,npcIds:[npcId]});
  state.rngCounter=rng.counter();
  return{success:accepted,messages:[{text}],accepted,pendingDate:accepted};
}

export function cancelPendingDate(state:GameState,npcId:string):EngineResult {
  const rel=state.relationships.find(item=>item.npcId===npcId);const npc=state.npcs[npcId];
  if(!rel||!npc?.alive||!rel.romance?.pendingDate)return{success:false,messages:[{text:'There is no pending date to cancel.'}]};
  delete rel.romance.pendingDate;
  return{success:true,stateChanges:['relationship.romance.pendingDate'],messages:[{text:`You cancelled the pending date with ${npc.firstName}.`}]};
}

export function completeRomanticDate(state:GameState,npcId:string,placeId:string,activityId:string):RomanticDateActionResult {
  const availability=romanticDateTargetAvailability(state,npcId);const rel=availability.relationship;const npc=availability.npc;
  if(!availability.allowed||!rel||!npc)return{success:false,messages:[{text:availability.reason??'That date is no longer available.'}]};
  if(!rel.romance?.pendingDate)return{success:false,messages:[{text:`Ask ${npc.firstName} on a date first.`}]};
  const plan=romanticDatePlanFor(state,npcId,placeId,activityId);
  if(!plan)return{success:false,messages:[{text:'That is not an available date plan right now.'}]};
  const activity=sharedExperienceActivityById[activityId];if(!activity)return{success:false,messages:[{text:'That date activity is unavailable.'}]};
  const context:SharedExperienceEvaluationContext={preferenceTags:['romance',...activity.preferenceTags],enjoymentModifier:plan.enjoymentModifier??0};
  const result=commitSharedExperience(state,npcId,placeId,activityId,{
    actionKey:`date:${activityId}`,context,memoryKind:`romantic_date:${activityId}`,
    formatProse:experience=>`${experience.prose} ${dateReaction(experience)}`,
    formatMemory:experience=>`${experience.memorySummary} ${dateMemoryReaction(experience)}`,
  }) as RomanticDateActionResult;
  if(!result.success||!result.experience)return result;
  const experience=result.experience;
  recordRomanticDate(rel,{year:state.currentYear,age:state.character.age,placeId,activityId,approval:experience.approval,band:experience.band});
  delete rel.romance!.pendingDate;
  const attractionDelta=experience.band==='great'?5:experience.band==='good'?3:experience.band==='rough'?-2:experience.band==='awful'?-5:0;
  rel.attraction=clamp(rel.attraction+attractionDelta);
  result.momentumUnlocked=romanticMomentumReady(rel);
  if(result.momentumUnlocked)result.messages.push({text:`You and ${npc.firstName} have built enough romantic momentum to talk about becoming partners.`});
  return result;
}

export function meetPotentialPartner(state:GameState):EngineResult {
  if (state.character.age<DATING_MIN_AGE) return {success:false,messages:[{text:'Dating becomes available in the teen years.'}]};
  const gate=consumeAction(state,{policy:'social.meet'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const minPartnerAge=state.character.age>=18?18:14;
  const maxPartnerAge=state.character.age>=18?Math.max(18,state.character.age+4):17;
  const age=Math.max(minPartnerAge,Math.min(maxPartnerAge,state.character.age+rng.int(-4,4)));
  const id=makeStateId(state,'npc');
  const playerGender=characterRomanticGender(state.character.genderIdentity);
  const targetGender=pickRomanticTargetGender(state,state.character.orientation,playerGender,id);
  const {firstName,lastName}=pickCollisionAwareNpcName(state,rng,{gender:targetGender});
  const npc:Npc={
    id,firstName,lastName,age,alive:true,health:rng.int(55,98),happiness:rng.int(40,92),wealth:rng.int(0,180000),
    countryId:state.character.countryId,city:state.character.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian']),fertility:rng.int(20,92),maritalStatus:'single',
    traits:rng.shuffle(['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','witty','private']).slice(0,3),hiddenOpinion:rng.int(0,35),memories:[],parentIds:[],childIds:[]
  };
  assignGeneratedNpcOrientation(state,npc,playerGender);
  state.npcs[id]=npc;ensureNpcLife(state,npc);
  const rel:Relationship={id:makeStateId(state,'rel'),npcId:id,type:'friend',score:rng.int(20,48),attraction:rng.int(35,95),compatibility:rng.int(25,95),yearsKnown:0};
  state.relationships.push(rel); state.rngCounter=rng.counter();
  return {success:true,messages:[{text:`You met ${npc.firstName} ${npc.lastName}, age ${age}. Compatibility: ${rel.compatibility}%.`}]};
}

export function changeRelationshipType(state:GameState,npcId:string,action:'become_partners'|'propose'|'marry'|'break_up'|'divorce'|'reconcile'):EngineResult {
  const npc=state.npcs[npcId]; const rel=state.relationships.find(r=>r.npcId===npcId);
  if(!npc||!rel||!npc.alive) return {success:false,messages:[{text:'That relationship is unavailable.'}]};
  if(action==='become_partners'){
    const availability=romanticDateTargetAvailability(state,npcId);
    if(!availability.allowed)return{success:false,messages:[{text:availability.reason??'Becoming partners is not available right now.'}]};
    if(rel.romance?.pendingDate)return{success:false,messages:[{text:`Finish your pending date with ${npc.firstName} before talking about becoming partners.`}]};
    if(!romanticMomentumReady(rel))return{success:false,messages:[{text:`You and ${npc.firstName} need more genuinely good dates before becoming partners is an option.`}]};
  }
  if(action==='reconcile'){
    if(state.character.age<DATING_MIN_AGE||npc.age<DATING_MIN_AGE)return{success:false,messages:[{text:'Dating becomes available in the teen years.'}]};
    if(state.character.age<18&&npc.age>=18)return{success:false,messages:[{text:'Teen dating is limited to other teens.'}]};
    if(state.character.age>=18&&npc.age<18)return{success:false,messages:[{text:'Adult dating is limited to adults.'}]};
  }
  if((action==='propose'||action==='marry')&&(state.character.age<18||npc.age<18))return{success:false,messages:[{text:'Engagement and marriage are adult relationship milestones.'}]};
  if(action==='reconcile'&&hasCurrentRomanticCommitment(state,npcId))return{success:false,messages:[{text:'You are already in a relationship with someone else.'}]};
  if((action==='propose'||action==='marry')&&hasCurrentRomanticCommitment(state,npcId))return{success:false,messages:[{text:'You already have another current romantic commitment.'}]};
  if(action==='propose'&&rel.type!=='partner')return{success:false,messages:[{text:'You need to be partners before proposing.'}]};
  if(action==='marry'&&!['partner','fiance'].includes(rel.type))return{success:false,messages:[{text:'Marriage is not available in this relationship yet.'}]};
  if(action==='break_up'&&!['partner','fiance'].includes(rel.type))return{success:false,messages:[{text:'There is no dating relationship to end.'}]};
  if(action==='divorce'&&rel.type!=='spouse')return{success:false,messages:[{text:'You are not married to this person.'}]};
  if(action==='reconcile'&&rel.type!=='ex')return{success:false,messages:[{text:'Only an ex can be reconciled with.'}]};
  const gate=consumeAction(state,{policy:'relationship.milestone',target:npcId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const baseChance=clamp(rel.score*.55+rel.compatibility*.25+rel.attraction*.2+npc.hiddenOpinion*.15,0,100)/100;
  let success=true; let newType:RelationshipType=rel.type; let text='';
  if(action==='become_partners') {
    const chance=clamp(baseChance+Math.min(.12,romanticDateMomentum(rel)*.025),.12,.92);
    success=rng.chance(chance); newType=success?'partner':rel.type;
    text=success?`${npc.firstName} wants to make the relationship official. You are now partners.`:`${npc.firstName} likes what you have, but is not ready to become partners yet.`;
    if(success)npc.maritalStatus='dating';
  }
  if(action==='propose') {
    success=rng.chance(clamp(baseChance+.08,0,.97));newType=success?'fiance':rel.type;text=success?`${npc.firstName} says yes.`:`${npc.firstName} is not ready to get engaged.`;if(success)npc.maritalStatus='engaged';
  }
  if(action==='marry') {success=true;newType='spouse';text=`You married ${npc.firstName} ${npc.lastName}.`;npc.maritalStatus='married';}
  if(action==='break_up'||action==='divorce') { if(!['partner','fiance','spouse'].includes(rel.type)) success=false; else {newType='ex';npc.maritalStatus=action==='divorce'?'divorced':'single';rel.score=clamp(rel.score-18);text=`You ${action==='divorce'?'divorced':'broke up with'} ${npc.firstName}.`;} }
  if(action==='reconcile') { if(rel.type!=='ex') success=false; else success=rng.chance(Math.max(.15,baseChance-.1)); newType=success?'partner':'ex';text=success?`You and ${npc.firstName} decided to try again.`:`${npc.firstName} does not want to reopen the relationship.`;if(success)npc.maritalStatus='dating'; }
  if(!success && !text) text='That relationship step is not available right now.';
  if(success){rel.type=newType;if(CURRENT_ROMANTIC_TYPES.has(newType))assignNpcIdentity(state,npc);ensureNpcLife(state,npc);if(action==='marry')state.flags.marriages=Number(state.flags.marriages??0)+1;if(action==='reconcile')state.flags.reconciliations=Number(state.flags.reconciliations??0)+1;}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:success?3:1,text,npcIds:[npcId]});
  state.rngCounter=rng.counter();
  if(success&&action==='reconcile')scheduleReconciliationStory(state,npcId);
  if(success&&action==='marry')scheduleMarriageExpectationsStory(state,npcId);
  return {success,messages:[{text}]};
}

function pickChildName(state:GameState,rng:ReturnType<typeof createRng>){
  return pickCollisionAwareNpcName(state,rng,{fixedLastName:state.character.lastName}).firstName;
}

export function processFamilyPlanningYear(state:GameState):void {
  const pregnancy=state.familyPlanning?.pregnancy;
  if(!pregnancy||pregnancy.dueAge>state.character.age)return;
  const partner=state.npcs[pregnancy.partnerId];
  const rng=createRng(state.seed,state.rngCounter);
  const names:string[]=[];
  const count=Math.max(1,Math.min(3,Math.floor(pregnancy.expectedChildren||1)));
  for(let i=0;i<count;i++){
    const id=makeStateId(state,'child');
    const firstName=pickChildName(state,rng);names.push(firstName);
    const child:Npc={id,firstName,lastName:state.character.lastName,age:0,alive:true,health:rng.int(68,100),happiness:rng.int(65,95),wealth:0,countryId:state.character.countryId,city:state.character.city,
      sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:rng.int(55,90),memories:[],parentIds:[state.character.id,...(partner?[partner.id]:[])],childIds:[]};
    assignGeneratedNpcOrientation(state,child);state.npcs[id]=child;ensureNpcLife(state,child);state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'child',score:75,attraction:0,compatibility:rng.int(45,90),yearsKnown:0});
    if(partner&&!partner.childIds.includes(id))partner.childIds.push(id);
    state.legacy.familyTreeNpcIds.push(id);
  }
  const text=count===1?`${names[0]} was born.`:`You welcomed ${count===2?'twins':'triplets'}: ${names.join(', ')}.`;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text,npcIds:partner?[partner.id]:undefined});
  delete state.familyPlanning.pregnancy;
  state.flags.lastFamilyExpansionAge=state.character.age;
  state.rngCounter=rng.counter();
}

export function haveChild(state:GameState,partnerId?:string,adopt=false):EngineResult {
  if(state.character.age<16) return {success:false,messages:[{text:'You are too young to become a parent.'}]};
  state.familyPlanning=state.familyPlanning??{};
  if(state.familyPlanning.pregnancy)return{success:false,messages:[{text:'You are already expecting a child. Age up to let the pregnancy progress.'}]};
  const hasNewborn=state.relationships.some(rel=>rel.type==='child'&&state.npcs[rel.npcId]?.alive&&state.npcs[rel.npcId]?.age===0);
  if(hasNewborn)return{success:false,messages:[{text:'Your family already welcomed a child this year. Age up before expanding it again.'}]};
  const partner=partnerId?state.npcs[partnerId]:undefined;
  const rel=partnerId?state.relationships.find(r=>r.npcId===partnerId):undefined;
  if(!adopt && (!partner||!rel||!['partner','fiance','spouse'].includes(rel.type))) return {success:false,messages:[{text:'A current partner is required for this path.'}]};
  if(adopt && partnerId && (!partner||!rel||!['partner','fiance','spouse'].includes(rel.type))) return {success:false,messages:[{text:'Only a current partner can be recorded as a co-parent for this adoption.'}]};
  if(!adopt && partner && partner.age<16) return {success:false,messages:[{text:"Both parents must meet the game's minimum parenting age."}]};
  const biologicalGate=!adopt?biologicalChildGate(state,partnerId):undefined;
  if(biologicalGate&&!biologicalGate.allowed)return{success:false,messages:[{text:biologicalGate.reason??'This pairing cannot try for a biological child.'}]};
  const rng=createRng(state.seed,state.rngCounter);
  const fertility=adopt?1:biologicalGate?.conceptionChance??0;
  if(!adopt){
    const gate=consumeAction(state,{policy:'family.child_attempt'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
    if(!rng.chance(fertility)){state.rngCounter=rng.counter();return{success:false,messages:[{text:'You tried for a child, but there was no pregnancy this year.'}]};}
    const expectedChildren=rng.chance(.012)?3:rng.chance(.035)?2:1;
    state.familyPlanning.pregnancy={partnerId:partner!.id,conceivedAge:state.character.age,dueAge:state.character.age+1,expectedChildren};
    state.rngCounter=rng.counter();
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`You and ${partner!.firstName} learned that a child is on the way.`,npcIds:[partner!.id]});
    return{success:true,messages:[{text:`You and ${partner!.firstName} are expecting${expectedChildren>1?` ${expectedChildren===2?'twins':'triplets'}`:' a child'}.`} ]};
  }
  const gate=consumeAction(state,{policy:'family.adoption'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const count=1;
  const names:string[]=[];
  for(let i=0;i<count;i++){
    const id=makeStateId(state,'child'); const firstName=pickChildName(state,rng); names.push(firstName);
    const child:Npc={id,firstName,lastName:state.character.lastName,age:0,alive:true,health:rng.int(68,100),happiness:rng.int(65,95),wealth:0,countryId:state.character.countryId,city:state.character.city,
      sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:rng.int(55,90),memories:[],parentIds:[state.character.id,...(partner?[partner.id]:[])],childIds:[]};
    assignGeneratedNpcOrientation(state,child);state.npcs[id]=child;ensureNpcLife(state,child); state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'child',score:75,attraction:0,compatibility:rng.int(45,90),yearsKnown:0});
    if(partner&&!partner.childIds.includes(id))partner.childIds.push(id); state.legacy.familyTreeNpcIds.push(id);
  }
  const text=adopt?`You adopted ${count>1?`${count} children`:names[0]}.`:`${count===1?`${names[0]} was born.`:`You welcomed ${count===2?'twins':'triplets'}: ${names.join(', ')}.`}`;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text,npcIds:partner?[partner.id]:undefined}); state.rngCounter=rng.counter();
  return {success:true,messages:[{text}]};
}
