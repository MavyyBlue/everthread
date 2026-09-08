import { createNewGame } from '../systems/CharacterSystem';
import { createRng } from '../core/rng';
import {
  processStressConsequencesYear,
  relationshipStressRecovery,
  stressConsequenceView,
  stressIncidentChance,
  therapySession,
} from '../systems/StressConsequenceSystem';
import { activeSpecialCareerPaths, isSpecialCareerPathActive } from '../systems/CommitmentSystem';
import { leaveSpecialCareer, reactivateSpecialCareerPath, specialCareerExitGate } from '../systems/SpecialCareerExitSystem';
import { ensureSpecialCareerWorld, processSpecialCareerWorldsYear } from '../systems/SpecialCareerWorldSystem';
import { processSpecialCareerEcosystemsYear } from '../systems/SpecialCareerEcosystemSystem';
import { processSportsSeasonYear, sportsContractDecision, sportsContractOffer, expireSportsContractOffer } from '../systems/SportsCareerCycleSystem';
import type { GameState, SocialWorld } from '../types/game';

export function runStressCareerRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Stress/career regression failed: ${message}`);}
  const track=(state:GameState,key:keyof GameState['specialCareers'])=>(state.specialCareers[key]??={}) as Record<string,number|string|boolean>;

  const risk=createNewGame({seed:'stress-risk'});risk.character.age=30;risk.character.secondary.stress=89;
  verify(stressIncidentChance(risk)===0,'1 stress below 90 must not receive the high-strain incident modifier');
  risk.character.secondary.stress=90;const at90=stressIncidentChance(risk);
  verify(at90>0,'2 stress at 90 must introduce nonzero incident risk');
  risk.character.secondary.stress=100;const at100=stressIncidentChance(risk);
  verify(at100>at90,'3 incident opportunity must rise between 90 and 100 stress');
  verify(at100<1,'4 even maximum stress must not guarantee an incident');
  risk.flags.stressStrainKind='Burnout';risk.flags.stressStrainSeverity=80;
  verify(stressIncidentChance(risk)>at100,'5 an active strain state must increase high-stress incident opportunity');
  const view=stressConsequenceView(risk);
  verify(view.highRisk&&view.strain?.kind==='Burnout','6 the read-only stress projection must expose high-risk and strain state');

  const therapyChild=createNewGame({seed:'therapy-child'});therapyChild.character.age=12;therapyChild.character.secondary.stress=100;
  verify(!therapySession(therapyChild).success,'7 therapy must remain unavailable before the teen years');
  therapyChild.character.age=13;therapyChild.finances.cash=0;const minorCash=therapyChild.finances.cash;const minorTherapy=therapySession(therapyChild);
  verify(minorTherapy.success,'8 therapy must become available at age 13');
  verify(therapyChild.finances.cash===minorCash,'9 dependent-minor therapy must be guardian-supported instead of charging personal cash');
  verify(therapyChild.character.secondary.stress===76,'10 therapy must provide substantially stronger bounded stress relief than meditation');
  verify(!therapySession(therapyChild).success,'11 therapy must obey the existing once-per-activity yearly wellness gate');

  const therapyAdult=createNewGame({seed:'therapy-adult'});therapyAdult.character.age=30;therapyAdult.character.secondary.stress=95;therapyAdult.finances.cash=500;const adultRevision=therapyAdult.actionLedger.revision;
  verify(!therapySession(therapyAdult).success,'12 adult therapy must reject insufficient funds');
  verify(therapyAdult.actionLedger.revision===adultRevision,'13 a blocked therapy payment must not consume the wellness action');
  therapyAdult.finances.cash=1000;therapyAdult.flags.stressStrainKind='Chronic Strain';therapyAdult.flags.stressStrainSeverity=40;const adultTherapy=therapySession(therapyAdult);
  verify(adultTherapy.success&&therapyAdult.finances.cash===400,'14 adult therapy must charge exactly 600 in game currency');
  verify(Number(therapyAdult.flags.stressStrainSeverity??0)<40,'15 therapy must also reduce temporary strain severity');

  const social=createNewGame({seed:'stress-social'});social.character.age=25;social.character.secondary.stress=80;const close=stateNpc(social,'close','Close','Friend',25,'best_friend',90);const weak=stateNpc(social,'weak','Weak','Friend',25,'friend',30);const closeBefore=social.character.secondary.stress;relationshipStressRecovery(social,close);
  verify(social.character.secondary.stress<closeBefore,'16 Spend Time recovery must lower stress for a close healthy relationship');
  const closeRelief=closeBefore-social.character.secondary.stress;social.character.secondary.stress=80;relationshipStressRecovery(social,weak);const weakRelief=80-social.character.secondary.stress;
  verify(closeRelief>weakRelief,'17 stronger/closer relationships must provide more stress recovery than weak relationships');
  const hostile=stateNpc(social,'hostile','Tense','Person',25,'friend',10);social.character.secondary.stress=60;relationshipStressRecovery(social,hostile);
  verify(social.character.secondary.stress>=60,'18 hostile relationships must not function as free stress medicine');

  const exit=createNewGame({seed:'career-exit'});exit.character.age=30;exit.education=[];
  verify(!specialCareerExitGate(exit,'music').allowed,'19 leaving an inactive special path must be rejected');
  exit.specialCareers.acting={active:true,credits:4,currentProjectActive:true};
  verify(!specialCareerExitGate(exit,'acting').allowed,'20 an active acting production must lock voluntary career exit');
  exit.specialCareers.acting.currentProjectActive=false;
  verify(specialCareerExitGate(exit,'acting').allowed,'21 an actor between productions must be able to leave the path');
  const actingLeave=leaveSpecialCareer(exit,'acting');
  verify(actingLeave.success&&exit.specialCareers.acting.leftPath===true,'22 leaving a path must persist an explicit stepped-away marker');
  verify(Number(exit.specialCareers.acting.credits)===4,'23 leaving must preserve completed acting credits/history');
  verify(!isSpecialCareerPathActive(exit,'acting'),'24 historical acting credits must stop consuming capacity after explicit exit');
  reactivateSpecialCareerPath(exit,'acting');
  verify(isSpecialCareerPathActive(exit,'acting'),'25 explicit reactivation must restore historical professional evidence as a current path');

  exit.specialCareers.music={active:true,professionalStartAge:20,songsReleased:3,tourActive:true};
  verify(!specialCareerExitGate(exit,'music').allowed,'26 an active music tour must lock voluntary exit until completion');
  exit.specialCareers.music.tourActive=false;
  verify(leaveSpecialCareer(exit,'music').success,'27 a musician between tours must be able to leave while preserving catalog history');
  verify(Number(exit.specialCareers.music.songsReleased)===3&&!isSpecialCareerPathActive(exit,'music'),'28 leaving music must preserve releases while freeing the commitment slot');

  exit.specialCareers.sports={active:true,pro:true,sport:'Basketball',seasonsPlayed:5,contractRemaining:2,salary:500000};
  verify(!specialCareerExitGate(exit,'sports').allowed,'29 a live professional sports contract must block voluntary exit');
  exit.specialCareers.sports.pro=false;exit.specialCareers.sports.freeAgent=true;exit.specialCareers.sports.contractRemaining=0;
  verify(specialCareerExitGate(exit,'sports').allowed,'30 a sports free agent must be free to leave the special-career path');
  verify(leaveSpecialCareer(exit,'sports').success&&!isSpecialCareerPathActive(exit,'sports'),'31 leaving sports free agency must free its capacity slot');
  verify(Number(exit.specialCareers.sports.seasonsPlayed)===5,'32 sports exit must preserve completed season history');

  exit.specialCareers.racing={active:true,racingPathway:true,contractActive:true,contractRemaining:1,seasons:4};
  verify(!specialCareerExitGate(exit,'racing').allowed,'33 a live racing contract must block voluntary exit');
  exit.specialCareers.racing.contractActive=false;exit.specialCareers.racing.contractRemaining=0;
  verify(leaveSpecialCareer(exit,'racing').success&&exit.specialCareers.racing.racingPathway===false,'34 leaving an unbound racing path must clear current pathway commitment without deleting history');
  verify(Number(exit.specialCareers.racing.seasons)===4,'35 racing exit must preserve historical seasons');

  exit.specialCareers.modeling={active:true,jobs:6,campaignActive:true};
  verify(!specialCareerExitGate(exit,'modeling').allowed,'36 an active modeling campaign must lock voluntary exit');
  exit.specialCareers.modeling.campaignActive=false;exit.specialCareers.modeling.agencyContractActive=true;exit.specialCareers.modeling.agencyContractRemaining=2;
  verify(!specialCareerExitGate(exit,'modeling').allowed,'37 a live modeling representation term must lock voluntary exit');
  exit.specialCareers.modeling.agencyContractActive=false;exit.specialCareers.modeling.agencyContractRemaining=0;
  verify(leaveSpecialCareer(exit,'modeling').success&&Number(exit.specialCareers.modeling.jobs)===6,'38 an unbound model must be able to leave without erasing prior bookings');

  const royal=createNewGame({seed:'exit-royal'});royal.flags.royalBirth=true;royal.character.age=30;
  verify(!specialCareerExitGate(royal,'royalty').allowed,'39 inherited royalty must not masquerade as an ordinary quit-able employment path');
  exit.specialCareers.combat={active:true,wins:8};
  verify(leaveSpecialCareer(exit,'combat').success&&Number(exit.specialCareers.combat.wins)===8,'40 non-contract special paths must be leaveable while preserving history');
  exit.specialCareers.music={leftPath:true,songsReleased:9,professionalStartAge:18};
  verify(!activeSpecialCareerPaths(exit).includes('music'),'41 explicit exit must override old professional-history evidence in capacity calculations');

  const offerState=createNewGame({seed:'sports-offer'});offerState.character.age=29;offerState.education=[];offerState.specialCareers.sports={active:true,pro:false,sport:'Basketball',renewalOfferPending:true,renewalOfferTeam:'Test Comets',renewalOfferYears:3,renewalOfferSalary:900000,renewalOfferExpiresAge:30};const offerWorld=manualSpecialWorld(offerState,'sports','Test Comets');
  const offer=sportsContractOffer(offerState);
  verify(Boolean(offer&&offer.team==='Test Comets'&&offer.years===3&&offer.salary===900000),'42 sports renewal projection must preserve exact team term and salary');
  const accept=sportsContractDecision(offerState,'accept');
  verify(accept.success,'43 a pending sports renewal must be player-accept-able');
  verify(offerState.specialCareers.sports.pro===true&&offerState.specialCareers.sports.freeAgent===false,'44 accepting renewal must restore active professional status');
  verify(Number(offerState.specialCareers.sports.contractRemaining)===3,'45 accepting renewal must install the exact offered term');
  verify(Number(offerState.specialCareers.sports.salary)===900000,'46 accepting renewal must install the exact offered salary');
  verify(offerState.specialCareers.sports.renewalOfferPending===false,'47 accepting renewal must clear the pending decision');

  const declineState=createNewGame({seed:'sports-decline'});declineState.character.age=29;declineState.specialCareers.sports={active:true,pro:false,sport:'Basketball',renewalOfferPending:true,renewalOfferTeam:'Test Forge',renewalOfferYears:2,renewalOfferSalary:700000,renewalOfferExpiresAge:30};const declineWorld=manualSpecialWorld(declineState,'sports','Test Forge');
  verify(sportsContractDecision(declineState,'decline').success&&declineState.specialCareers.sports.freeAgent===true,'48 declining renewal must enter free agency instead of auto-renewing');
  verify(!declineWorld.active,'49 declining renewal must archive the former team affiliation without deleting it');

  const expiry=createNewGame({seed:'sports-expiry'});expiry.character.age=31;expiry.specialCareers.sports={active:true,pro:false,sport:'Basketball',renewalOfferPending:true,renewalOfferTeam:'Test Halos',renewalOfferYears:2,renewalOfferSalary:600000,renewalOfferExpiresAge:30};const expiryWorld=manualSpecialWorld(expiry,'sports','Test Halos');expireSportsContractOffer(expiry);
  verify(expiry.specialCareers.sports.freeAgent===true&&expiry.specialCareers.sports.renewalOfferPending===false,'50 an expired sports renewal must convert cleanly to free agency');
  verify(!expiryWorld.active,'51 renewal expiry must archive the old team world');

  const pendingWorldState=createNewGame({seed:'sports-pending-world'});pendingWorldState.character.age=30;pendingWorldState.specialCareers.sports={active:true,pro:false,sport:'Basketball',renewalOfferPending:true,renewalOfferTeam:'Pending Pulse',renewalOfferYears:2,renewalOfferSalary:650000,renewalOfferExpiresAge:31};const pendingWorld=manualSpecialWorld(pendingWorldState,'sports','Pending Pulse');processSpecialCareerWorldsYear(pendingWorldState);
  verify(pendingWorld.active,'52 a valid pending sports renewal must keep the exact team world active while the player still has time to decide');
  processSpecialCareerEcosystemsYear(pendingWorldState);
  verify(Number(pendingWorldState.specialCareers.sports.seasonsPlayed??0)===0&&Number(pendingWorldState.specialCareers.sports.ecosystemYears??0)===0,'53 a pending renewal may preserve team affiliation but must not simulate a phantom sports season or career year');

  const contract=createNewGame({seed:'sports-contract-cycle'});contract.character.age=30;contract.currentYear=2060;contract.character.secondary.stress=20;contract.health.fitness=90;contract.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:95,fitness:90,reputation:90,contractYears:1,contractRemaining:1,salary:800000};const contractWorld=manualSpecialWorld(contract,'sports','Cycle Comets');const rng=createRng('sports-contract-cycle-regression');processSportsSeasonYear(contract,contract.specialCareers.sports as Record<string,number|string|boolean>,contractWorld,{momentum:90,chemistry:90,rivalry:10,prestige:90},rng);
  verify(Number(contract.specialCareers.sports.seasonSalaryDue)===800000,'54 an expiring sports term must stamp final-season salary before the decision state');
  verify(contract.specialCareers.sports.pro===false,'55 an expired sports term must not silently install a new professional contract');
  verify(Boolean(contract.specialCareers.sports.renewalOfferPending)||contract.specialCareers.sports.freeAgent===true,'56 contract expiry must produce either a player renewal decision or free agency');

  const hardRetire=createNewGame({seed:'sports-hard-retirement'});hardRetire.character.age=48;hardRetire.currentYear=2080;hardRetire.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:80,fitness:75,reputation:70,contractYears:3,contractRemaining:3,salary:500000};const hardWorld=manualSpecialWorld(hardRetire,'sports','Legacy Atlas');processSportsSeasonYear(hardRetire,hardRetire.specialCareers.sports as Record<string,number|string|boolean>,hardWorld,{momentum:70,chemistry:65,rivalry:30,prestige:65},createRng('hard-retirement-regression'));
  verify(hardRetire.specialCareers.sports.retired===true,'57 the established hard-age sports retirement end-state must remain compatible even during a nominal contract');
  verify(!hardWorld.active,'58 involuntary hard retirement must archive the final team world');

  const lowStress=workState('stress-low',50);processStressConsequencesYear(lowStress);const lowWorld=lowStress.socialWorlds.find(world=>world.kind==='workplace')!;
  verify(Number(lowStress.flags[`stressWorkIncidents:${lowWorld.id}`]??0)===0,'59 ordinary stress must not create high-strain workplace incidents');

  const highStress=findWorkIncidentState();const highWorld=highStress.socialWorlds.find(world=>world.kind==='workplace')!;const incidentCount=Number(highStress.flags[`stressWorkIncidents:${highWorld.id}`]??0);
  verify(incidentCount===1,'60 high stress must be capable of producing a bounded single workplace incident during one age');
  const afterFirst=incidentCount;processStressConsequencesYear(highStress);
  verify(Number(highStress.flags[`stressWorkIncidents:${highWorld.id}`]??0)===afterFirst,'61 stress consequence processing must be idempotent within the same age');

  const partTimeIncident=findPartTimeIncidentState(false);const partWorld=partTimeIncident.socialWorlds.find(world=>world.id==='work-parttime-world')!;
  verify(Number(partTimeIncident.flags[`stressWorkIncidents:${partWorld.id}`]??0)>=1,'62 active part-time workplaces must participate in high-stress incident risk instead of being immune');
  const partTimeDismissal=findPartTimeIncidentState(true);
  verify(partTimeDismissal.employment.partTimeJobs.length===0&&partTimeDismissal.employment.current?.company==='Stable Fulltime','63 a repeated part-time incident review may end that part-time job without deleting a separate full-time role');
  verify(partTimeDismissal.employment.partTimeHistory.some(record=>record.company==='Synthetic Side Job'&&record.endAge===partTimeDismissal.character.age),'64 stress-driven part-time dismissal must archive the exact employment record into part-time history');

  return checks;
}

function stateNpc(state:GameState,id:string,first:string,last:string,age:number,type:GameState['relationships'][number]['type'],score:number){state.npcs[id]={id,firstName:first,lastName:last,age,alive:true,health:80,happiness:70,wealth:0,countryId:state.character.countryId,city:state.character.city,sexuality:'straight',fertility:50,maritalStatus:'single',traits:[],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]};state.relationships.push({id:`rel-${id}`,npcId:id,type,score,attraction:0,compatibility:60,yearsKnown:2});return id;}

function manualSpecialWorld(state:GameState,kind:'sports'|'music'|'modeling'|'racing',name:string):SocialWorld{const world:SocialWorld={id:`special-${kind}-${state.idCounter++}`,kind:'organization',name,countryId:state.character.countryId,city:state.character.city,startedAge:state.character.age,active:true,members:[],groups:[]};state.socialWorlds.push(world);return world;}

function workState(seed:string,stress:number){const state=createNewGame({seed});state.character.age=30;state.currentYear=2060;state.character.secondary.stress=stress;state.flags.stressStrainKind='Burnout';state.flags.stressStrainSeverity=100;state.education=[];state.socialWorlds=[];state.employment.current={jobId:'stress_test_job',title:'Stress Tester',company:'Synthetic Works',startAge:25,salary:50000,performance:60,level:1};state.employment.history=[];const world:SocialWorld={id:'work-stress-world',kind:'workplace',name:'Synthetic Works',countryId:state.character.countryId,city:state.character.city,startedAge:25,active:true,members:[],groups:[],workplace:{employmentKey:'full_time|25|Synthetic Works',employmentKind:'full_time',industry:'Testing',department:'QA',morale:55,culture:55,tension:40,reputation:55,layoffs:0,disputes:0}};state.socialWorlds.push(world);return state;}

function findWorkIncidentState(){for(let index=0;index<80;index+=1){const state=workState(`stress-work-incident-${index}`,100);processStressConsequencesYear(state);const world=state.socialWorlds[0]!;if(Number(state.flags[`stressWorkIncidents:${world.id}`]??0)>0)return state;}throw new Error('Stress/career regression failed: deterministic high-stress sample did not produce a workplace incident');}


function partTimeWorkState(seed:string,preloadReview=false){
  const state=createNewGame({seed});state.character.age=30;state.currentYear=2060;state.character.secondary.stress=100;state.flags.stressStrainKind='Burnout';state.flags.stressStrainSeverity=100;state.education=[];state.socialWorlds=[];
  state.employment.current={jobId:'stable_full',title:'Stable Role',company:'Stable Fulltime',startAge:24,salary:60000,performance:70,level:1};state.employment.history=[];
  const part={jobId:'stress_part',title:'Side Role',company:'Synthetic Side Job',startAge:28,salary:12000,performance:preloadReview?10:55,level:1,hoursPerWeek:10};state.employment.partTimeJobs=[part];state.employment.partTimeJobIds=[part.jobId];state.employment.partTimeHistory=[];
  const world:SocialWorld={id:'work-parttime-world',kind:'workplace',name:'Synthetic Side Job',countryId:state.character.countryId,city:state.character.city,startedAge:28,active:true,members:[],groups:[],workplace:{employmentKey:'part_time|28|Synthetic Side Job',employmentKind:'part_time',industry:'Testing',department:'Support',morale:50,culture:50,tension:45,reputation:50,layoffs:0,disputes:0}};state.socialWorlds.push(world);
  if(preloadReview)state.flags[`stressWorkIncidents:${world.id}`]=2;
  return state;
}

function findPartTimeIncidentState(requireDismissal:boolean){
  for(let index=0;index<240;index+=1){const state=partTimeWorkState(`stress-parttime-${requireDismissal?'dismiss':'incident'}-${index}`,requireDismissal);processStressConsequencesYear(state);const count=Number(state.flags['stressWorkIncidents:work-parttime-world']??0);if(requireDismissal?state.employment.partTimeJobs.length===0:count>0)return state;}
  throw new Error(`Stress/career regression failed: deterministic part-time ${requireDismissal?'dismissal':'incident'} sample was not found`);
}
