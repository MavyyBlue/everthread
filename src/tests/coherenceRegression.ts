import { createNewGame } from '../systems/CharacterSystem';
import {
  activeSpecialCareerPaths,
  fullTimeJobGate,
  partTimeJobGate,
  schoolEnrollmentGate,
  specialCareerCapacity,
  specialCareerStartGate,
} from '../systems/CommitmentSystem';
import { buildPeopleRelationshipGraph, relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { eventById } from '../data/events';
import { eventEligibleForState, forceEvent, resolvePendingEvent } from '../systems/EventSystem';

export function runCoherenceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Coherence regression failed: ${message}`);}

  const commitments=createNewGame({seed:'coherence-commitments'});
  commitments.character.age=25;commitments.education=[];commitments.employment.current=undefined;commitments.employment.partTimeJobs=[];
  commitments.specialCareers.acting={active:true,credits:1};commitments.specialCareers.music={active:true,songsReleased:1,professionalStartAge:20};
  verify(specialCareerCapacity(commitments).limit===2&&activeSpecialCareerPaths(commitments).length===2,'outside school the special-career limit must be two active paths');
  verify(!specialCareerStartGate(commitments,'modeling').allowed,'a third special career must be blocked outside school');
  verify(specialCareerStartGate(commitments,'acting').allowed,'an already-active path must remain usable even when capacity is full');
  commitments.specialCareers.sports={active:true};
  verify(specialCareerStartGate(commitments,'sports').allowed&&!specialCareerStartGate(commitments,'racing').allowed,'legacy saves above the new cap must preserve existing paths while blocking additional ones');
  commitments.specialCareers.sports=undefined;
  commitments.education=[{stage:'university',institution:'Test Institute',startAge:25,graduated:false,droppedOut:false,scholarship:false,performance:60} as any];
  commitments.specialCareers.music=undefined;
  verify(specialCareerCapacity(commitments).limit===1,'active enrollment must reduce special-career capacity to one');
  verify(!specialCareerStartGate(commitments,'modeling').allowed,'school plus one active special career must block a second special path');
  verify(!fullTimeJobGate(commitments).allowed,'full-time work must be unavailable during active school enrollment');
  verify(!partTimeJobGate(commitments).allowed,'part-time work must be unavailable when school and a special career are both active');
  commitments.specialCareers.acting=undefined;
  verify(partTimeJobGate(commitments).allowed,'school without a special career must still allow part-time work');
  commitments.specialCareers.modeling={active:true,jobs:1};commitments.employment.partTimeJobs=[{jobId:'pt',title:'Part time',company:'Test',startAge:25,salary:1000,performance:50,level:1,hoursPerWeek:10} as any];
  verify(specialCareerStartGate(commitments,'modeling').allowed,'an already-active school special path remains usable even if a legacy part-time job also exists');
  commitments.specialCareers.modeling=undefined;
  verify(!specialCareerStartGate(commitments,'acting').allowed,'starting a special career while enrolled must require leaving an existing part-time job first');

  const royal=createNewGame({seed:'coherence-royal'});royal.character.age=18;royal.flags.royalBirth=true;royal.education=[];royal.employment.partTimeJobs=[];
  verify(activeSpecialCareerPaths(royal).includes('royalty'),'an inherited royal role must already occupy a special-career commitment instead of being blocked later as a new optional path');

  const preparatory=createNewGame({seed:'coherence-preparatory'});preparatory.character.age=16;preparatory.education=[];preparatory.employment.partTimeJobs=[];
  preparatory.specialCareers.acting={active:true,skill:28};preparatory.specialCareers.music={active:true,skill:30};preparatory.specialCareers.modeling={active:true,technique:35};
  verify(activeSpecialCareerPaths(preparatory).length===0,'legacy raw active flags from acting/music/modeling training must not consume professional special-career slots without real career evidence');
  preparatory.specialCareers.acting.agent=1;
  verify(activeSpecialCareerPaths(preparatory).includes('acting'),'acting representation must count as an established special-career commitment even before the first credit');
  preparatory.specialCareers.acting=undefined;preparatory.specialCareers.music={active:true,songsReleased:1,professionalStartAge:16};
  verify(activeSpecialCareerPaths(preparatory).includes('music'),'a real music release must count as a special-career commitment even when legacy flags are inconsistent');

  const enrollment=createNewGame({seed:'coherence-enrollment'});enrollment.character.age=20;enrollment.education=[];enrollment.employment.partTimeJobs=[];
  enrollment.employment.current={jobId:'test',title:'Test role',company:'Test Co',startAge:20,salary:40000,performance:50,level:1};
  verify(!schoolEnrollmentGate(enrollment).allowed,'school enrollment must reject an existing full-time job instead of silently ending it');
  enrollment.employment.current=undefined;enrollment.specialCareers.acting={active:true,credits:1};enrollment.specialCareers.music={active:true,songsReleased:1,professionalStartAge:18};
  verify(!schoolEnrollmentGate(enrollment).allowed,'school enrollment must reject more than one active special career');
  enrollment.specialCareers.music=undefined;enrollment.employment.partTimeJobs=[{jobId:'pt',title:'Part time',company:'Test',startAge:20,salary:1000,performance:50,level:1,hoursPerWeek:10} as any];
  verify(!schoolEnrollmentGate(enrollment).allowed,'school plus one special career must require leaving an existing part-time job before enrollment');
  enrollment.employment.partTimeJobs=[];
  verify(schoolEnrollmentGate(enrollment).allowed,'school enrollment must allow one active special career when regular work is clear');

  const people=createNewGame({seed:'coherence-people'});people.character.age=30;people.relationships=[];people.socialWorlds=[];people.npcs={};
  const addNpc=(id:string,name:string,score:number)=>{people.npcs[id]={id,firstName:name,lastName:'Tester',age:30,alive:true,health:80,happiness:70,wealth:0,countryId:people.character.countryId,city:people.character.city,sexuality:'straight',fertility:50,maritalStatus:'single',traits:[],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]} as any;people.relationships.push({id:`rel-${id}`,npcId:id,type:'coworker',score,attraction:0,compatibility:50,yearsKnown:2} as any);};
  addNpc('school-current','CurrentSchool',20);addNpc('school-former','FormerSchool',99);addNpc('work-current','CurrentWork',20);addNpc('work-former','FormerWork',99);addNpc('career-current','CurrentCareer',20);addNpc('career-former','FormerCareer',99);
  people.socialWorlds.push(
    {id:'school-current-world',kind:'school',name:'Current School',startedAge:29,active:true,members:[{npcId:'school-current',role:'classmate',joinedAge:29,groupIds:[]}],groups:[]} as any,
    {id:'school-old-world',kind:'school',name:'Former School',startedAge:18,endedAge:22,active:false,members:[{npcId:'school-former',role:'classmate',joinedAge:18,leftAge:22,groupIds:[]}],groups:[]} as any,
    {id:'work-current-world',kind:'workplace',name:'Current Work',startedAge:29,active:true,members:[{npcId:'work-current',role:'boss',joinedAge:29,groupIds:[]}],groups:[],workplace:{employmentKey:'x',employmentKind:'full_time',industry:'Test',department:'Test',morale:50,culture:50,tension:20,reputation:50,managerNpcId:'work-current',layoffs:0,disputes:0}} as any,
    {id:'work-old-world',kind:'workplace',name:'Former Work',startedAge:20,endedAge:25,active:false,members:[{npcId:'work-former',role:'coworker',joinedAge:20,leftAge:25,groupIds:[]}],groups:[],workplace:{employmentKey:'y',employmentKind:'full_time',industry:'Test',department:'Test',morale:50,culture:50,tension:20,reputation:50,managerNpcId:'work-former',layoffs:0,disputes:0}} as any,
    {id:'special-music-current',kind:'organization',name:'Current Collective',startedAge:28,active:true,members:[{npcId:'career-current',role:'leader',joinedAge:28,groupIds:[]}],groups:[]} as any,
    {id:'special-modeling-old',kind:'organization',name:'Former Agency',startedAge:21,endedAge:24,active:false,members:[{npcId:'career-former',role:'coworker',joinedAge:21,leftAge:24,groupIds:[]}],groups:[]} as any,
  );
  verify(relationshipsForFolder(people,'school')[0]?.npcId==='school-current','School must order current affiliation above a higher-scored former relationship');
  verify(relationshipsForFolder(people,'work')[0]?.npcId==='work-current','Work must order the current boss/coworker above higher-scored former workplace relationships');
  verify(relationshipsForFolder(people,'career')[0]?.npcId==='career-current','Career Worlds must order current special-career people above former career-world relationships');
  const schoolGraph=buildPeopleRelationshipGraph(people,'school');const workGraph=buildPeopleRelationshipGraph(people,'work');const careerGraph=buildPeopleRelationshipGraph(people,'career');
  verify(schoolGraph.nodes.find(node=>node.id==='school-current')?.affiliation?.status==='current'&&schoolGraph.nodes.find(node=>node.id==='school-former')?.affiliation?.status==='former','School graph must expose current/former status for UI highlighting');
  verify(workGraph.nodes.find(node=>node.id==='work-current')?.affiliation?.role==='boss','Work graph must expose the current institutional role');
  verify(careerGraph.nodes.find(node=>node.id==='career-former')?.affiliation?.status==='former','Career graph must preserve former career-world affiliation instead of deleting it');

  const events=createNewGame({seed:'coherence-events'});events.character.age=12;
  const friendEvent=eventById['friends_the_overshare_1'];const friendLoan=eventById['friends_the_loan_request_1'];const familyEvent=eventById['family_family_favor_1'];
  verify(Boolean(friendEvent&&friendLoan&&familyEvent),'procedural coherence fixtures must resolve exact event definitions');
  events.relationships=events.relationships.filter(rel=>!['friend','best_friend'].includes(rel.type));
  verify(!eventEligibleForState(events,friendEvent!),'a procedural friend event must be ineligible without a living friend');
  const friendId='coherence-friend';events.npcs[friendId]={id:friendId,firstName:'Ari',lastName:'Friend',age:12,alive:true,health:80,happiness:70,wealth:0,countryId:events.character.countryId,city:events.character.city,sexuality:'straight',fertility:50,maritalStatus:'single',traits:[],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]} as any;events.relationships.push({id:'rel-coherence-friend',npcId:friendId,type:'friend',score:50,attraction:0,compatibility:60,yearsKnown:2} as any);
  verify(eventEligibleForState(events,friendEvent!),'a procedural friend event becomes eligible when a real living friend exists');
  verify(!eventEligibleForState(events,friendLoan!),'adult-like friend loan requests must remain age-gated at age twelve');
  events.character.age=16;verify(eventEligibleForState(events,friendLoan!),'friend loan requests may become eligible at a mature teen age when a friend exists');
  events.character.age=8;verify(!eventEligibleForState(events,familyEvent!),'generic family dilemmas that assume independence must not fire in early childhood');
  events.character.age=12;verify(eventEligibleForState(events,familyEvent!),'generic family dilemmas may become eligible after their maturity floor when family context exists');

  const parentRel=events.relationships.find(rel=>['parent','stepparent','grandparent','sibling'].includes(rel.type));const parentScore=parentRel?.score;const friendScore=events.relationships.find(rel=>rel.npcId===friendId)!.score;
  forceEvent(events,'friends_the_overshare_1');verify(events.pendingEvent?.payload?.npcId===friendId,'procedural friend events must bind to the exact eligible friend instead of using generic relationship context');resolvePendingEvent(events,'kind');verify(events.relationships.find(rel=>rel.npcId===friendId)!.score===friendScore+7,'friend-event relationship effects must apply to the bound friend');if(parentRel&&parentScore!==undefined)verify(parentRel.score===parentScore,'friend-event effects must not leak onto an unrelated family member');


  forceEvent(events,'family_family_favor_1');const familyTarget=typeof events.pendingEvent?.payload?.npcId==='string'?events.pendingEvent.payload.npcId:undefined;verify(Boolean(familyTarget&&events.relationships.some(rel=>rel.npcId===familyTarget&&['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew'].includes(rel.type))),'procedural family events must bind to an actual living family relationship');events.pendingEvent=undefined;

  const untargeted=createNewGame({seed:'coherence-untargeted'});untargeted.character.age=6;const baseline=untargeted.relationships.map(rel=>[rel.npcId,rel.score] as const);forceEvent(untargeted,'childhood_the_missing_toy_1');resolvePendingEvent(untargeted,'kind');verify(baseline.every(([npcId,score])=>untargeted.relationships.find(rel=>rel.npcId===npcId)?.score===score),'untargeted childhood events must not mutate a random persistent relationship');

  return checks;
}
