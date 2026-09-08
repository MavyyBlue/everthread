import { createNewGame } from '../systems/CharacterSystem';
import { fullTimeJobGate, partTimeJobGate, specialCareerStartGate } from '../systems/CommitmentSystem';

export function runCommitmentExclusivityRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Commitment exclusivity regression failed: ${message}`);}

  const baseline=createNewGame({seed:'commitment-exclusive-baseline'});baseline.character.age=25;baseline.education=[];baseline.employment.current=undefined;baseline.employment.partTimeJobs=[];
  verify(fullTimeJobGate(baseline).allowed,'ordinary full-time work must remain available when no special career is active');
  verify(partTimeJobGate(baseline).allowed,'ordinary part-time work must remain available when no special career is active');

  baseline.specialCareers.music={active:true,professionalStartAge:22,songsReleased:2};
  verify(!fullTimeJobGate(baseline).allowed,'one established special career must block starting ordinary full-time work');
  verify(!partTimeJobGate(baseline).allowed,'one established special career must block starting ordinary part-time work');

  const fullTime=createNewGame({seed:'commitment-exclusive-fulltime'});fullTime.character.age=25;fullTime.education=[];fullTime.employment.partTimeJobs=[];fullTime.employment.current={jobId:'ft',title:'Analyst',company:'Test Co',startAge:25,salary:45000,performance:55,level:1};
  verify(!specialCareerStartGate(fullTime,'music').allowed,'an active full-time job must block establishing a new special career');

  const partTime=createNewGame({seed:'commitment-exclusive-parttime'});partTime.character.age=25;partTime.education=[];partTime.employment.current=undefined;partTime.employment.partTimeJobs=[{jobId:'pt',title:'Clerk',company:'Test Shop',startAge:25,salary:12000,performance:55,level:1,hoursPerWeek:10} as any];
  verify(!specialCareerStartGate(partTime,'acting').allowed,'an active part-time job must block establishing a new special career');

  const legacy=createNewGame({seed:'commitment-exclusive-legacy'});legacy.character.age=30;legacy.education=[];legacy.employment.current={jobId:'legacy-ft',title:'Legacy Role',company:'Old Co',startAge:28,salary:50000,performance:60,level:1};legacy.employment.partTimeJobs=[{jobId:'legacy-pt',title:'Legacy Side Job',company:'Old Shop',startAge:29,salary:10000,performance:60,level:1,hoursPerWeek:10} as any];legacy.specialCareers.music={active:true,professionalStartAge:24,songsReleased:4};
  verify(specialCareerStartGate(legacy,'music').allowed,'an already-established special path must remain usable in a legacy conflicting save');
  verify(!specialCareerStartGate(legacy,'acting').allowed,'a legacy conflicting save must not be allowed to add another incompatible special career');

  const training=createNewGame({seed:'commitment-exclusive-training'});training.character.age=20;training.education=[];training.employment.current=undefined;training.employment.partTimeJobs=[];training.specialCareers.acting={active:true,skill:35};
  verify(fullTimeJobGate(training).allowed&&partTimeJobGate(training).allowed,'preparatory acting training without professional evidence must not count as a special-career commitment');

  const steppedAway=createNewGame({seed:'commitment-exclusive-left'});steppedAway.character.age=32;steppedAway.education=[];steppedAway.employment.current=undefined;steppedAway.employment.partTimeJobs=[];steppedAway.specialCareers.music={leftPath:true,professionalStartAge:20,songsReleased:10};
  verify(fullTimeJobGate(steppedAway).allowed&&partTimeJobGate(steppedAway).allowed,'a voluntarily left historical special career must free ordinary work availability');

  return checks;
}
