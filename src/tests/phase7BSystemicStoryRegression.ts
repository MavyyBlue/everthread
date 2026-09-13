import { lifeEvents } from '../data/events';
import { educationPrograms } from '../data/education';
import { systemicConsequenceEventById, systemicConsequenceEvents } from '../data/systemicConsequenceEvents';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { admissionProfile } from '../systems/EducationSystem';
import { nextDueConsequence } from '../systems/ConsequenceSystem';
import { processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import { changeRelationshipType, interactWithNpc } from '../systems/RelationshipSystem';
import { cheatAtSchool } from '../systems/SchoolWorldSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { scheduleParentingPresenceStory, scheduleSchoolConductStory } from '../systems/SystemicStorySystem';
import { exportSave, importSave } from '../services/SaveSystem';
import type { GameState, Npc, RelationshipType, SocialWorld } from '../types/game';

function adult(seed:string,age=30){const state=createNewGame({seed});state.character.age=age;state.currentYear=state.character.birthYear+age;return state;}
function addNpc(state:GameState,id:string,firstName:string,age:number){
  const npc:Npc={id,firstName,lastName:'Story',age,alive:true,health:90,happiness:75,wealth:15000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',traits:['loyal','patient'],hiddenOpinion:75,memories:[],parentIds:[],childIds:[],simulationTier:'background'};
  state.npcs[id]=npc;ensureNpcLife(state,npc);return npc;
}
function addRel(state:GameState,npcId:string,type:RelationshipType,score=70){state.relationships.push({id:`rel-${npcId}`,npcId,type,score,attraction:90,compatibility:95,yearsKnown:6});return state.relationships.at(-1)!;}
function addChild(state:GameState,id='story-child'){const child=addNpc(state,id,'Ari',10);child.parentIds=[state.character.id];const rel=addRel(state,child.id,'child',72);return{child,rel};}
function addFriend(state:GameState,id='story-friend'){const friend=addNpc(state,id,'Riley',state.character.age);const rel=addRel(state,friend.id,'friend',68);return{friend,rel};}
function addRomance(state:GameState,id:string,type:RelationshipType){const npc=addNpc(state,id,id.includes('marriage')?'Morgan':'Jordan',state.character.age);npc.hiddenOpinion=100;const rel=addRel(state,npc.id,type,100);rel.attraction=100;rel.compatibility=100;if(type==='fiance')npc.maritalStatus='engaged';if(type==='ex')npc.maritalStatus='divorced';return{npc,rel};}
function schoolFixture(seed='phase7b-school'){
  const state=adult(seed,16);state.socialWorlds=[];state.education=[];state.character.secondary.academicPerformance=70;state.character.secondary.discipline=60;state.character.secondary.reputation=60;
  const world:SocialWorld={id:'story-school-world',kind:'school',name:'Everthread Secondary',countryId:state.character.countryId,city:state.character.city,startedAge:14,active:true,members:[],groups:[],school:{stage:'secondary',educationKey:'secondary|14|Everthread Secondary|',attendance:88,conduct:62,socialStanding:58,honors:0,disciplinaryActions:0}};
  state.socialWorlds.push(world);return{state,world};
}

export function runPhase7BSystemicStoryRegression(){
  let checks=0;function check(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 7B systemic-story regression failed: ${message}`);}

  check(lifeEvents.length===691,'01 random-event pool must remain exactly 691');
  check(systemicConsequenceEvents.length===5&&systemicConsequenceEvents.every(event=>event.probability===0&&event.tags.includes('phase7b1')),'02 five Phase 7B1 stories must remain system-owned and outside random selection');
  check(systemicConsequenceEvents.every(event=>!lifeEvents.some(random=>random.id===event.id)),'03 systemic story ids must not collide with the random library');
  check(Object.keys(systemicConsequenceEventById).length===5,'04 systemic event registry must expose exactly the authored 7B1 set');

  const parenting=adult('phase7b-parenting',32);const {child,parentingRel}=(()=>{const made=addChild(parenting);return{child:made.child,parentingRel:made.rel};})();const parentingRngBefore=parenting.rngCounter;
  const parentAction=interactWithNpc(parenting,child.id,'spend_time');const parentStory=parenting.delayedEvents.find(item=>item.eventId==='systemic_parenting_presence_return');
  check(parentAction.success&&Boolean(parentStory),'05 spending time with a real child must schedule the parenting follow-up');
  check(parentStory?.dueAge===34&&parentStory.targetRefs?.[0]?.kind==='npc'&&parentStory.targetRefs[0].id===child.id&&parentStory.validity?.requiredRelationshipTypes?.includes('child'),'06 parenting story must preserve exact child identity and child validity');
  check(parenting.rngCounter>parentingRngBefore,'07 originating relationship action may consume its normal RNG before deterministic scheduling');
  const idBeforeDuplicate=parenting.idCounter;const duplicateParent=scheduleParentingPresenceStory(parenting,child.id);check(!duplicateParent.scheduled&&duplicateParent.reason==='duplicate'&&parenting.idCounter===idBeforeDuplicate,'08 repeated unresolved parenting scheduling must dedupe without consuming an id');
  parenting.character.age=34;parenting.currentYear=parenting.character.birthYear+34;child.age=12;const parentingPending=processDelayedEvents(parenting);check(parentingPending?.payload?.npcId===child.id&&parentingPending.description.includes(child.firstName),'09 parenting story must surface the exact child with rendered copy');
  parenting.pendingEvent=parentingPending;const parentScoreBefore=parentingRel.score;const parentingResolution=resolvePendingEvent(parenting,'lean_in');check(parentingResolution.success&&parentingRel.score===parentScoreBefore+10,'10 parenting response must change the authoritative child relationship');
  check(parenting.consequenceScheduler.history.some(item=>item.eventId==='systemic_parenting_presence_return'&&item.status==='completed'),'11 parenting resolution must complete through ConsequenceSystem history');

  const deadChildState=adult('phase7b-parent-dead',35);const deadChild=addChild(deadChildState,'dead-story-child').child;interactWithNpc(deadChildState,deadChild.id,'spend_time');deadChild.alive=false;deadChildState.character.age=37;check(!nextDueConsequence(deadChildState)&&deadChildState.consequenceScheduler.history.some(item=>item.eventId==='systemic_parenting_presence_return'&&item.reason==='target_npc_dead'),'12 a dead child target must cancel rather than retarget');

  const friendship=adult('phase7b-friend',29);const {friend,rel:friendRel}=addFriend(friendship);const friendAction=interactWithNpc(friendship,friend.id,'argue');const friendStory=friendship.delayedEvents.find(item=>item.eventId==='systemic_friend_argument_return');
  check(friendAction.success&&friendStory?.payload?.npcId===friend.id,'13 arguing with a real friend must schedule an exact-target friendship echo');
  friendRel.type='partner';friendship.character.age=31;friendship.currentYear=friendship.character.birthYear+31;friend.age=31;const friendPending=processDelayedEvents(friendship);check(friendPending?.eventId==='systemic_friend_argument_return','14 friendship history may resurface after that same person becomes a romantic partner');
  friendship.pendingEvent=friendPending;const friendScoreBefore=friendRel.score;resolvePendingEvent(friendship,'own_part');check(friendRel.score===friendScoreBefore+9&&friend.memories.some(memory=>memory.kind==='event_choice'),'15 friendship follow-up must affect the same relationship and NPC memory authority');

  const reconciliation=adult('phase7b-reconcile',33);const {npc:ex,rel:reconciledRel}=addRomance(reconciliation,'reconcile-target','ex');const reconcileResult=changeRelationshipType(reconciliation,ex.id,'reconcile');const reconcileStory=reconciliation.delayedEvents.find(item=>item.eventId==='systemic_reconciliation_checkin');
  check(reconcileResult.success&&reconciledRel.type==='partner'&&reconcileStory?.dueAge===35,'16 successful reconciliation must schedule a two-year second-chance check-in');
  reconciliation.character.age=35;ex.age=35;const reconciliationPending=processDelayedEvents(reconciliation);check(reconciliationPending?.payload?.npcId===ex.id,'17 reconciliation check-in must preserve exact partner identity');
  reconciliation.pendingEvent=reconciliationPending;const reconcileScoreBefore=reconciledRel.score;resolvePendingEvent(reconciliation,'be_honest');check(reconciledRel.score===Math.min(100,reconcileScoreBefore+9),'18 reconciliation choice must resolve through authoritative relationship state');

  const failedReconcile=adult('phase7b-reconcile-invalid',34);const {npc:failedEx,rel:failedRel}=addRomance(failedReconcile,'reconcile-invalid','ex');changeRelationshipType(failedReconcile,failedEx.id,'reconcile');failedRel.type='ex';failedReconcile.character.age=36;check(!nextDueConsequence(failedReconcile)&&failedReconcile.consequenceScheduler.history.some(item=>item.eventId==='systemic_reconciliation_checkin'&&item.reason==='required_relationship_missing'),'19 ended reconciliation must cancel without silently choosing another partner');

  const marriage=adult('phase7b-marriage',30);const {npc:spouse,rel:spouseRel}=addRomance(marriage,'marriage-target','fiance');const marryResult=changeRelationshipType(marriage,spouse.id,'marry');const marriageStory=marriage.delayedEvents.find(item=>item.eventId==='systemic_marriage_expectations_return');
  check(marryResult.success&&spouseRel.type==='spouse'&&marriageStory?.dueAge===33&&marriageStory.validity?.requiredRelationshipTypes?.[0]==='spouse','20 marriage must schedule a spouse-only three-year expectations story');
  const marriageRoundTrip=importSave(exportSave(marriage));const savedMarriageStory=marriageRoundTrip.delayedEvents.find(item=>item.eventId==='systemic_marriage_expectations_return');check(savedMarriageStory?.payload?.npcId===spouse.id&&savedMarriageStory.targetRefs?.[0]?.id===spouse.id,'21 save round-trip must preserve the exact spouse consequence');
  spouseRel.type='ex';marriage.character.age=33;check(!nextDueConsequence(marriage)&&marriage.consequenceScheduler.history.some(item=>item.eventId==='systemic_marriage_expectations_return'&&item.reason==='required_relationship_missing'),'22 divorce/breakup state before due age must cancel the spouse-only story');

  const validMarriage=adult('phase7b-marriage-valid',31);const {npc:validSpouse,rel:validSpouseRel}=addRomance(validMarriage,'marriage-valid','fiance');changeRelationshipType(validMarriage,validSpouse.id,'marry');validMarriage.character.age=34;validSpouse.age=34;const marriagePending=processDelayedEvents(validMarriage);check(marriagePending?.eventId==='systemic_marriage_expectations_return'&&marriagePending.description.includes(validSpouse.firstName),'23 valid marriage story must surface with the exact spouse rendered');validMarriage.pendingEvent=marriagePending;const marriageScore=validSpouseRel.score;resolvePendingEvent(validMarriage,'renegotiate');check(validSpouseRel.score===Math.min(100,marriageScore+5),'24 marriage follow-up must reconcile through the real spouse relationship');

  const {state:school,world}=schoolFixture();const schoolRngBefore=school.rngCounter;const schoolAction=cheatAtSchool(school);const schoolStory=school.delayedEvents.find(item=>item.eventId==='systemic_school_conduct_return');
  check((schoolAction.success||!schoolAction.success)&&schoolStory?.targetRefs?.[0]?.kind==='social_world'&&schoolStory.targetRefs[0].id===world.id,'25 executed academic shortcut must schedule the exact school-world follow-up regardless of detection outcome');
  check(school.rngCounter>schoolRngBefore&&schoolStory?.dueAge===18&&schoolStory.payload?.worldId===world.id,'26 school action keeps normal RNG behavior while consequence targets the durable school world');
  school.character.age=18;school.currentYear=school.character.birthYear+18;const schoolPending=processDelayedEvents(school);check(schoolPending?.eventId==='systemic_school_conduct_return'&&schoolPending.description.includes(world.name)&&!schoolPending.description.includes('{WORLD_NAME}'),'27 school story must render the exact persistent school name without leaking a placeholder');
  const program=educationPrograms.find(item=>item.kind==='university')??educationPrograms[0]!;const admissionsBefore=admissionProfile(school,program).score;const conductBefore=world.school!.conduct;const standingBefore=world.school!.socialStanding;school.pendingEvent=schoolPending;const schoolResolution=resolvePendingEvent(school,'repair_record');const admissionsAfter=admissionProfile(school,program).score;
  check(world.school!.conduct===Math.min(100,conductBefore+12)&&world.school!.socialStanding===Math.min(100,standingBefore+4),'28 delayed school choice must mutate the exact school-world authority');
  check(admissionsAfter>admissionsBefore&&schoolResolution.stateChanges?.some(change=>change.startsWith(`schoolConduct:${world.id}`))===true,'29 repaired persistent school conduct must flow into admissions and the semantic state-change surface');

  const {state:missingSchool,world:missingWorld}=schoolFixture('phase7b-school-missing');const rngBeforeSchedule=missingSchool.rngCounter;const directSchool=scheduleSchoolConductStory(missingSchool,missingWorld);check(directSchool.scheduled&&missingSchool.rngCounter===rngBeforeSchedule,'30 direct systemic scheduling must remain gameplay-RNG neutral');missingSchool.socialWorlds=[];missingSchool.character.age=18;check(!nextDueConsequence(missingSchool)&&missingSchool.consequenceScheduler.history.some(item=>item.eventId==='systemic_school_conduct_return'&&item.reason==='missing_target:social_world'),'31 missing exact school world must cancel instead of redirecting to another school');

  check(parenting.saveVersion===13&&school.saveVersion===13,'32 Phase 7B1 must not require a save-schema increment');
  const invariantErrors={parenting:validateState(parenting),friendship:validateState(friendship),reconciliation:validateState(reconciliation),marriage:validateState(validMarriage),school:validateState(school)};check(Object.values(invariantErrors).every(errors=>errors.length===0),`33 resolved systemic-story fixtures must satisfy global state invariants: ${JSON.stringify(invariantErrors)}`);

  return checks;
}
