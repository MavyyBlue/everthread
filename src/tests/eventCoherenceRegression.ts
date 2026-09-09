import { eventById, lifeEvents } from '../data/events';
import { createNewGame } from '../systems/CharacterSystem';
import { eventEligibleForState, forceEvent, resolvePendingEvent } from '../systems/EventSystem';
import { COHERENT_PROCEDURAL_TITLES, coherentEventChoices, coherentTargetSelector, eventImpactDomains, isProceduralLifeEvent } from '../systems/EventCoherenceSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';
import type { GameState, Npc, RelationshipType } from '../types/game';

function addNpc(state:GameState,id:string,firstName:string,age:number){
  const npc:Npc={id,firstName,lastName:'Coherence',age,alive:true,health:82,happiness:70,wealth:12000,countryId:state.character.countryId,city:state.character.city,sexuality:'straight',fertility:55,maritalStatus:'single',traits:['patient'],hiddenOpinion:10,memories:[],parentIds:[],childIds:[],simulationTier:'background'};
  state.npcs[id]=npc;return npc;
}
function addRel(state:GameState,npcId:string,type:RelationshipType,score=55){state.relationships.push({id:`rel-${npcId}`,npcId,type,score,attraction:0,compatibility:60,yearsKnown:4});return state.relationships.at(-1)!;}
function adult(seed:string){const state=createNewGame({seed});state.character.age=30;state.currentYear=2056;return state;}
function friendState(seed='event-coherence-friend'){const state=adult(seed);const friend=addNpc(state,'coherence-friend','Riley',31);const rel=addRel(state,friend.id,'friend',58);return{state,friend,rel};}
function workState(){const state=adult('event-coherence-work');state.employment.current={jobId:'coherence-job',title:'Analyst',company:'Civic Works',startAge:27,salary:54000,performance:50,level:1};state.character.secondary.workPerformance=50;const coworker=addNpc(state,'coherence-coworker','Morgan',32);const boss=addNpc(state,'coherence-boss','Jordan',44);addRel(state,coworker.id,'coworker',52);addRel(state,boss.id,'boss',55);state.socialWorlds.push({id:'coherence-work-world',kind:'workplace',name:'Civic Works',countryId:state.character.countryId,city:state.character.city,startedAge:27,active:true,members:[{npcId:coworker.id,role:'coworker',joinedAge:27,groupIds:[]},{npcId:boss.id,role:'boss',joinedAge:27,groupIds:[]}],groups:[],workplace:{employmentKey:'full_time|27|Civic Works',employmentKind:'full_time',industry:'General',department:'Operations',morale:50,culture:50,tension:50,reputation:50,managerNpcId:boss.id,layoffs:0,disputes:0}});return{state,coworker,boss};}
function schoolState(){const state=createNewGame({seed:'event-coherence-school'});state.character.age=19;state.currentYear=2045;state.character.secondary.academicPerformance=50;state.education=[{stage:'university',institution:'Civic Institute',startAge:18,graduated:false,droppedOut:false,scholarship:false,performance:50}];const peer=addNpc(state,'coherence-classmate','Avery',19);addRel(state,peer.id,'classmate',54);state.socialWorlds.push({id:'coherence-school-world',kind:'school',name:'Civic Institute',countryId:state.character.countryId,city:state.character.city,startedAge:18,active:true,members:[{npcId:peer.id,role:'classmate',joinedAge:18,groupIds:[]}],groups:[],school:{stage:'university',educationKey:'university|18|Civic Institute|',attendance:85,conduct:78,socialStanding:50,honors:0,disciplinaryActions:0}});return{state,peer};}

export async function runEventCoherenceRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Event coherence regression failed: ${message}`);}

  const procedural=lifeEvents.filter(isProceduralLifeEvent);const titles=new Set(procedural.map(event=>event.title));
  verify(lifeEvents.length===691,'the established random-event pool must remain 691 events');
  verify(procedural.length===664,'all 664 procedural variants must be recognized by the coherence layer');
  verify(titles.size===80,'the procedural library must still contain 80 distinct dilemmas');
  verify(COHERENT_PROCEDURAL_TITLES.size===80,'the coherence registry must cover exactly the 80 established procedural dilemmas');
  verify([...titles].every(title=>COHERENT_PROCEDURAL_TITLES.has(title)),'every procedural dilemma title must have a coherence profile');
  verify(procedural.every(event=>coherentEventChoices(event).length===3),'every procedural event must present three coherent decisions');
  verify(procedural.every(event=>new Set(coherentEventChoices(event).map(choice=>choice.id)).size===3),'choice ids must be unique inside every event');
  verify(procedural.every(event=>new Set(coherentEventChoices(event).map(choice=>choice.label)).size===3),'choice labels must be distinct inside every event');
  verify(procedural.every(event=>coherentEventChoices(event).every(choice=>choice.label.trim().length>=3)),'choice labels must remain readable and non-empty');
  verify(procedural.every(event=>coherentEventChoices(event).every(choice=>Boolean(choice.effects||choice.outcomes?.length))),'every decision must have a consequence');
  verify(procedural.every(event=>coherentEventChoices(event).every(choice=>eventImpactDomains(choice).size>0)),'every choice must touch at least one simulation domain');
  verify(procedural.every(event=>coherentEventChoices(event).every(choice=>(choice.outcomes??[]).every(outcome=>outcome.weight>0&&outcome.text.trim().length>0))),'weighted outcomes must have positive weights and explanatory text');
  verify(procedural.every(event=>coherentEventChoices(event).every(choice=>!(choice.effects&&choice.outcomes?.length))),'procedural choices must not double-apply an unconditional effect and weighted consequence accidentally');

  const friends=procedural.filter(event=>event.category==='friends');const family=procedural.filter(event=>event.category==='family');const romance=procedural.filter(event=>event.category==='romance');const school=procedural.filter(event=>event.category==='school');const work=procedural.filter(event=>event.category==='work');const money=procedural.filter(event=>event.category==='money');const health=procedural.filter(event=>event.category==='health');const travel=procedural.filter(event=>event.category==='travel');const fame=procedural.filter(event=>event.category==='fame');const crime=procedural.filter(event=>event.category==='crime_legal');const strange=procedural.filter(event=>event.category==='strange');const childhood=procedural.filter(event=>event.category==='childhood');
  verify(friends.length===64&&friends.every(event=>coherentTargetSelector(event)==='friend'),'friend dilemmas must bind an exact friend');
  verify(family.length===64&&family.every(event=>coherentTargetSelector(event)==='family'),'family dilemmas must bind an exact family relationship');
  verify(romance.length===64&&romance.every(event=>coherentTargetSelector(event)==='romantic'),'romance dilemmas must bind the current romantic relationship');
  verify(friends.every(event=>coherentEventChoices(event).every(choice=>eventImpactDomains(choice).has('relationship'))),'every friend choice must affect the exact friendship');
  verify(family.every(event=>coherentEventChoices(event).every(choice=>eventImpactDomains(choice).has('relationship'))),'every family choice must affect the exact family relationship');
  verify(romance.every(event=>coherentEventChoices(event).every(choice=>eventImpactDomains(choice).has('relationship'))),'every romance choice must affect the exact partner relationship');
  verify(school.length===72,'school procedural variant count must remain stable');
  verify(school.every(event=>coherentEventChoices(event).some(choice=>{const d=eventImpactDomains(choice);return d.has('secondary')||d.has('relationship');})),'school dilemmas must affect academics, conduct-like stats, or exact peers');
  verify(work.length===80,'work procedural variant count must remain stable');
  verify(work.every(event=>coherentEventChoices(event).some(choice=>{const d=eventImpactDomains(choice);return d.has('secondary')||d.has('workplace')||d.has('relationship');})),'work dilemmas must affect career performance, workplace state, or exact colleagues');
  verify(money.length===48&&money.every(event=>coherentEventChoices(event).some(choice=>eventImpactDomains(choice).has('money'))),'money dilemmas must contain actual financial consequences');
  verify(health.length===48&&health.every(event=>coherentEventChoices(event).some(choice=>eventImpactDomains(choice).has('stats'))),'health dilemmas must contain health/stat consequences');
  verify(travel.length===40&&travel.every(event=>coherentEventChoices(event).some(choice=>{const d=eventImpactDomains(choice);return d.has('stats')||d.has('money')||d.has('secondary');})),'travel dilemmas must change the experience, cost, or wellbeing of the trip');
  verify(fame.length===40&&fame.every(event=>coherentEventChoices(event).some(choice=>eventImpactDomains(choice).has('fame'))),'fame dilemmas must affect fame or public reputation');
  verify(crime.length===40&&crime.every(event=>coherentEventChoices(event).some(choice=>eventImpactDomains(choice).has('legal'))),'crime/legal dilemmas must include legal-heat consequences');
  verify(strange.length===40&&strange.every(event=>coherentEventChoices(event).some(choice=>{const d=eventImpactDomains(choice);return d.has('stats')||d.has('secondary')||d.has('money');})),'strange dilemmas must leave a real player consequence');
  verify(childhood.length===64&&childhood.every(event=>coherentTargetSelector(event)===null),'childhood vignettes must not silently mutate an unrelated relationship');

  const loanEvent=eventById['friends_the_loan_request_1'];verify(Boolean(loanEvent),'friend loan event must still exist under its established id');
  verify(coherentEventChoices(loanEvent).map(choice=>choice.label).some(label=>label.startsWith('Lend ')),'loan request must offer an actual lending decision');
  verify(coherentEventChoices(loanEvent).map(choice=>choice.label).some(label=>label.includes('no repayment')),'loan request must offer a gift alternative');
  verify(coherentEventChoices(loanEvent).map(choice=>choice.label).includes('Decline the loan'),'loan request must offer a coherent refusal');
  const clubEvent=eventById['school_club_election_1'];verify(coherentEventChoices(clubEvent).some(choice=>choice.label==='Run a positive campaign'),'Club Election must offer an election-specific choice rather than generic studying');
  const promotionEvent=eventById['work_promotion_whisper_1'];verify(coherentEventChoices(promotionEvent).some(choice=>choice.label.includes('boss')),'Promotion Whisper must let the player address the career opportunity with their exact boss');
  const careEvent=eventById['family_the_care_question_1'];verify(coherentEventChoices(careEvent).some(choice=>choice.label.includes('care')),'Care Question must present care-specific decisions');

  const {state:friend,friend:friendNpc,rel:friendRel}=friendState();const parentRel=friend.relationships.find(rel=>rel.type==='parent')!;const parentBefore=parentRel.score;const cashBefore=friend.finances.cash;const friendBefore=friendRel.score;
  verify(eventEligibleForState(friend,loanEvent),'friend loan event must be eligible with an exact living friend');
  forceEvent(friend,loanEvent.id);verify(friend.pendingEvent?.payload?.npcId===friendNpc.id,'friend event must bind the exact persistent friend in its payload');
  verify(friend.pendingEvent?.choices.some(choice=>choice.id==='lend_friend'),'pending event must expose the coherent choice set to the player/AI');
  const lend=resolvePendingEvent(friend,'lend_friend');verify(lend.success,'coherent friend loan choice must resolve successfully through the real EventSystem');
  verify(friend.finances.cash<cashBefore,'lending money must actually reduce player cash');
  verify(friendRel.score>friendBefore,'lending money must improve the exact friend relationship');
  verify(parentRel.score===parentBefore,'targeted friend consequences must not leak onto unrelated family relationships');
  verify(friendNpc.memories.at(-1)?.summary.includes('The Loan Request')===true,'target NPC memory must name the event instead of using a generic shared-event sentence');
  verify(friendNpc.memories.at(-1)?.summary.includes('Lend')===true,'target NPC memory must preserve the player decision');
  const loanTimeline=friend.timeline.at(-1)!;verify(loanTimeline.moneyDelta===friend.finances.cash-cashBefore,'event timeline must record the actual money delta');
  verify(loanTimeline.relationshipDelta===friendRel.score-friendBefore,'event timeline must record the actual target relationship delta');
  verify(loanTimeline.npcIds?.[0]===friendNpc.id,'event timeline must link the exact targeted NPC');
  verify(lend.stateChanges?.some(change=>change.startsWith('cash '))===true&&lend.stateChanges?.some(change=>change.startsWith(`relationship:${friendNpc.id}`))===true,'semantic engine result must expose meaningful money and relationship changes');

  const {state:workStateValue,coworker}=workState();const workEvent=eventById['work_credit_where_due_1'];const performanceBefore=workStateValue.employment.current!.performance;forceEvent(workStateValue,workEvent.id);verify(workStateValue.pendingEvent?.payload?.npcId===coworker.id,'work credit event must target the exact persistent coworker');
  const workResult=resolvePendingEvent(workStateValue,'document_credit');verify(workResult.success,'work coherence choice must resolve');
  verify(workStateValue.character.secondary.workPerformance>performanceBefore,'work event must change the player work-performance stat');
  verify(workStateValue.employment.current!.performance===workStateValue.character.secondary.workPerformance,'work-event performance must synchronize to the authoritative current career record');
  verify(workResult.stateChanges?.some(change=>change.startsWith('workPerformance '))===true,'semantic result must surface career-performance impact');

  const {state:schoolStateValue,peer}=schoolState();const schoolEvent=eventById['school_group_project_gravity_1'];forceEvent(schoolStateValue,schoolEvent.id);verify(schoolStateValue.pendingEvent?.payload?.npcId===peer.id,'targeted school dilemma must bind the exact persistent classmate');
  const schoolResult=resolvePendingEvent(schoolStateValue,'organize_group');verify(schoolResult.success,'school coherence choice must resolve');
  verify(schoolStateValue.education[0]!.performance===schoolStateValue.character.secondary.academicPerformance,'school-event academic impact must synchronize to the authoritative active education record');
  verify(schoolResult.stateChanges?.some(change=>change.startsWith('academicPerformance '))===true,'semantic result must surface academic-performance impact');

  const travelState=adult('event-coherence-travel');const travelEvent=eventById['travel_wrong_turn_maybe_1'];verify(!eventEligibleForState(travelState,travelEvent),'travel vignette must not fire before the player has actual travel history');travelState.travel.visitedCities.push('Elsewhere');verify(eventEligibleForState(travelState,travelEvent),'travel vignette must become eligible after actual travel history exists');

  const reunionNoFriend=adult('event-coherence-reunion-none');reunionNoFriend.character.age=55;const reunion=eventById['late_life_reunion'];verify(!eventEligibleForState(reunionNoFriend,reunion),'late-life reunion must not select a random unrelated relationship when no friend exists');const reunionFriend=addNpc(reunionNoFriend,'reunion-friend','Casey',56);addRel(reunionNoFriend,reunionFriend.id,'friend',62);verify(eventEligibleForState(reunionNoFriend,reunion),'late-life reunion must become eligible with an exact living friend');forceEvent(reunionNoFriend,reunion.id);verify(reunionNoFriend.pendingEvent?.payload?.npcId===reunionFriend.id,'late-life reunion must bind that exact friend');verify(reunionNoFriend.pendingEvent?.choices.some(choice=>choice.label==='Reply warmly')===true,'late-life reunion must present reunion-specific choices');


  const legacy=friendState('event-coherence-legacy').state;const legacyDef=eventById['friends_the_loan_request_1'];const legacyTarget=legacy.relationships.find(rel=>rel.type==='friend')!;legacy.pendingEvent={eventId:legacyDef.id,title:legacyDef.title,description:'Legacy saved pending event.',choices:legacyDef.choices.map(choice=>({id:choice.id,label:choice.label})),payload:{npcId:legacyTarget.npcId}};const legacyResult=resolvePendingEvent(legacy,legacyDef.choices[0]!.id);verify(legacyResult.success,'an in-progress pre-4G pending event must still resolve using its saved legacy choice id');verify(legacy.pendingEvent===undefined,'legacy pending-event compatibility must clear the resolved event normally');

  const aiFixture=friendState('event-coherence-ai').state;forceEvent(aiFixture,loanEvent.id);await withEverthreadAiTestbench({state:aiFixture,screen:'life'},async testbench=>{const observation=testbench.observe();verify(observation.pendingEvent?.choices.some(choice=>choice.id==='decline_loan')===true,'AI observation must see the same coherent event choices as the player');verify(observation.actions.some(action=>action.id==='event.choose'&&action.targetId==='decline_loan'&&action.enabled)===true,'AI semantic surface must expose coherent pending-event decisions');const step=await testbench.execute({id:'event.choose',args:{choiceId:'decline_loan'}});verify(step.result.success,'AI testbench must resolve the coherent choice through the real GameEngine');verify(step.after.pendingEvent===undefined,'resolved coherent event must clear from the AI observation');});

  verify(checks===71,'the focused Phase 4G suite must retain its intentional 72-check contract');
  return checks;
}
