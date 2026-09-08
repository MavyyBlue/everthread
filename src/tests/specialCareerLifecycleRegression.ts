import { createNewGame } from '../systems/CharacterSystem';
import { isSpecialCareerPathActive, specialCareerReentryGate, specialCareerStartGate } from '../systems/CommitmentSystem';
import { leaveSpecialCareer, reactivateSpecialCareerPath } from '../systems/SpecialCareerExitSystem';
import {
  hasEstablishedDeepCareer,
  retireSpecialCareer,
  specialCareerLifecycleView,
  specialCareerLifecycleViews,
  specialCareerRetirementGate,
} from '../systems/SpecialCareerLifecycleSystem';
import { activeSpecialCareerWorld, ensureSpecialCareerWorld, processSpecialCareerWorldsYear, specialCareerWorlds } from '../systems/SpecialCareerWorldSystem';

export function runSpecialCareerLifecycleRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Special-career lifecycle regression failed: ${message}`);}

  const empty=createNewGame({seed:'lifecycle-empty'});empty.character.age=28;empty.education=[];
  verify(specialCareerLifecycleViews(empty).length===0,'1 untouched deep careers must not clutter the lifecycle projection');
  verify(!hasEstablishedDeepCareer(empty,'acting'),'2 training-free untouched acting must not count as an established professional career');

  const views=createNewGame({seed:'lifecycle-views'});views.character.age=31;views.education=[];
  views.specialCareers.acting={active:true,credits:4,skill:72};
  views.specialCareers.music={active:true,professionalStartAge:24,songsReleased:3,albumsReleased:1,fanbase:15000};
  views.specialCareers.sports={active:true,pro:true,sport:'Basketball',seasonsPlayed:2,contractRemaining:2,salary:600000};
  views.specialCareers.modeling={active:true,jobs:5,agencyContractActive:true,agencyContractRemaining:2};
  views.specialCareers.racing={active:true,racingPathway:true,freeAgent:true,seasons:3};
  views.specialCareers.directing={active:true,filmsDirected:2,currentProjectActive:true};
  verify(specialCareerLifecycleView(views,'acting').status==='Between productions','3 established acting between projects must project as between productions');
  verify(specialCareerLifecycleView(views,'music').status==='Independent artist','4 established music without a distribution agreement must project as independent');
  verify(specialCareerLifecycleView(views,'sports').status==='Under contract','5 professional sports contract status must outrank generic pathway state');
  verify(specialCareerLifecycleView(views,'modeling').status==='Represented','6 modeling representation must project as a current contract state');
  verify(specialCareerLifecycleView(views,'racing').status==='Free agent','7 racing free agency must remain distinct from retirement or leaving');
  verify(specialCareerLifecycleView(views,'directing').status==='In production','8 directing production must project as an active project');

  const leave=createNewGame({seed:'lifecycle-leave'});leave.character.age=30;leave.education=[];leave.specialCareers.acting={active:true,credits:6,skill:80};
  const leaveWorld=ensureSpecialCareerWorld(leave,'acting','supporting',{announce:false});const leaveRng=leave.rngCounter;
  verify(leaveSpecialCareer(leave,'acting').success,'9 an established actor between productions must be able to step away');
  verify(leave.specialCareers.acting.leftPath===true&&Number(leave.specialCareers.acting.credits)===6,'10 stepping away must preserve history behind an explicit lifecycle marker');
  verify(!leaveWorld.active&&!isSpecialCareerPathActive(leave,'acting'),'11 stepping away must archive the current world and free the commitment slot');
  verify(specialCareerLifecycleView(leave,'acting').status==='Stepped away','12 the lifecycle projection must distinguish stepped away from retired');
  verify(!specialCareerReentryGate(leave,'acting').allowed,'13 a same-age return must be blocked so Leave Path cannot become a path-swap reroll');
  verify(!specialCareerStartGate(leave,'acting').allowed,'14 the shared start gate must expose that same-age block to both UI disabled states and GameEngine enforcement');
  verify(leave.rngCounter===leaveRng,'15 voluntary exit must not consume simulation RNG');
  leave.character.age+=1;
  verify(specialCareerReentryGate(leave,'acting').allowed,'16 a creative path may become return-eligible after at least one Age Up');
  reactivateSpecialCareerPath(leave,'acting');
  verify(leave.specialCareers.acting.leftPath===false&&isSpecialCareerPathActive(leave,'acting'),'17 reactivation must restore current commitment from preserved professional evidence');
  verify(Number(leave.specialCareers.acting.returns??0)===1,'18 returning after an explicit step-away must be recorded without erasing history');

  const creativeRetire=createNewGame({seed:'lifecycle-creative-retirement'});creativeRetire.character.age=42;creativeRetire.education=[];creativeRetire.specialCareers.acting={active:true,credits:12,skill:91,reputation:88};
  const actingWorld=ensureSpecialCareerWorld(creativeRetire,'acting','lead',{announce:false});const beforeRetireRng=creativeRetire.rngCounter;
  verify(specialCareerRetirementGate(creativeRetire,'acting').allowed,'19 an established unbound actor must be able to choose formal retirement');
  verify(retireSpecialCareer(creativeRetire,'acting').success,'20 shared retirement must succeed for an unbound creative career');
  verify(creativeRetire.specialCareers.acting.retired===true&&Number(creativeRetire.specialCareers.acting.credits)===12,'21 creative retirement must preserve completed credits and mark retirement explicitly');
  verify(!actingWorld.active&&specialCareerLifecycleView(creativeRetire,'acting').comebackAllowed,'22 creative retirement must archive the active world while retaining future comeback eligibility');
  verify(!specialCareerReentryGate(creativeRetire,'acting').allowed,'23 a creative comeback cannot occur in the same age as retirement');
  verify(creativeRetire.rngCounter===beforeRetireRng,'24 retirement must not consume simulation RNG');
  creativeRetire.character.age+=1;
  verify(specialCareerReentryGate(creativeRetire,'acting').allowed,'25 acting retirement can become comeback-eligible on a later age');
  reactivateSpecialCareerPath(creativeRetire,'acting');
  verify(creativeRetire.specialCareers.acting.retired===false&&Number(creativeRetire.specialCareers.acting.comebacks??0)===1,'26 a successful creative comeback must clear retirement and record the comeback');

  const finalRetire=createNewGame({seed:'lifecycle-final-retirement'});finalRetire.character.age=38;finalRetire.education=[];finalRetire.specialCareers.sports={active:true,pro:false,freeAgent:true,sport:'Soccer',seasonsPlayed:9,championships:1};
  verify(retireSpecialCareer(finalRetire,'sports').success,'27 a professional athlete in free agency must be able to formally retire');
  verify(specialCareerLifecycleView(finalRetire,'sports').retirementFinal,'28 professional sports retirement must be marked final');
  finalRetire.character.age+=5;
  verify(!specialCareerReentryGate(finalRetire,'sports').allowed,'29 final athletic retirement must stay blocked even years later');
  verify(Number(finalRetire.specialCareers.sports.seasonsPlayed)===9,'30 final retirement must preserve sports history');

  const bound=createNewGame({seed:'lifecycle-bound'});bound.character.age=27;bound.education=[];bound.specialCareers.modeling={active:true,jobs:8,agencyContractActive:true,agencyContractRemaining:2};
  verify(!specialCareerRetirementGate(bound,'modeling').allowed,'31 a live modeling representation term must block voluntary retirement');
  bound.specialCareers.modeling.agencyContractActive=false;bound.specialCareers.modeling.agencyContractRemaining=0;bound.specialCareers.modeling.campaignActive=true;
  verify(!specialCareerRetirementGate(bound,'modeling').allowed,'32 a live campaign must also block modeling retirement');
  bound.specialCareers.modeling.campaignActive=false;
  verify(specialCareerRetirementGate(bound,'modeling').allowed,'33 an unbound established model must become retirement-eligible');

  const worldGuard=createNewGame({seed:'lifecycle-world-guard'});worldGuard.character.age=35;worldGuard.education=[];worldGuard.specialCareers.music={active:true,professionalStartAge:25,songsReleased:4,fanbase:22000,leftPath:true,leftPathAge:34};
  const musicWorld=ensureSpecialCareerWorld(worldGuard,'music','vocals',{announce:false});
  verify(musicWorld.active,'34 the fixture must begin with a legacy active music world');
  processSpecialCareerWorldsYear(worldGuard);
  verify(!musicWorld.active&&!activeSpecialCareerWorld(worldGuard,'music'),'35 a stepped-away persistent career must archive instead of surviving on historical activity flags');
  worldGuard.specialCareers.music.active=true;
  processSpecialCareerWorldsYear(worldGuard);
  verify(!activeSpecialCareerWorld(worldGuard,'music')&&specialCareerWorlds(worldGuard,'music').length===1,'36 world sync must not silently recreate a music organization for a stepped-away career');

  const retiredWorld=createNewGame({seed:'lifecycle-retired-world'});retiredWorld.character.age=36;retiredWorld.education=[];retiredWorld.specialCareers.modeling={active:true,jobs:7,retired:true,retirementAge:35};
  const modelWorld=ensureSpecialCareerWorld(retiredWorld,'modeling','agency',{announce:false});
  processSpecialCareerWorldsYear(retiredWorld);
  verify(!modelWorld.active&&!activeSpecialCareerWorld(retiredWorld,'modeling'),'37 a retired persistent career must not keep a current Career World alive');
  verify(!specialCareerStartGate(finalRetire,'sports').allowed,'38 the shared start gate must keep final sports retirement disabled in the existing Life Paths UI as well as the engine');

  return checks;
}
