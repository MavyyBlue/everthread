import { jobById, jobs } from '../data/jobs';
import { educationById } from '../data/education';
import { countryById } from '../data/countries';
import type { EngineResult, GameState } from '../types/game';
import type { JobDefinition as ContentJob } from '../types/content';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { actionGateStatus, consumeAction } from '../core/actionEconomy';
import { currentWorkplaceWorld, syncWorkplaceWorlds } from './WorkplaceSystem';

function completedPrograms(state:GameState) { return state.education.filter(e=>e.graduated).map(e=>e.programId).filter(Boolean) as string[]; }
function hasSecondary(state:GameState) { return state.education.some(e=>e.stage==='secondary'&&e.graduated); }

export function relevantExperienceYears(state:GameState,job:ContentJob){
  const records=[...state.employment.history,...(state.employment.current?[state.employment.current]:[])];
  return records.reduce((years,record)=>{
    const previous=jobById[record.jobId];
    if(!previous||previous.industry!==job.industry)return years;
    const endAge=record.endAge??state.character.age;
    return years+Math.max(0,endAge-record.startAge);
  },0);
}

function salaryCeiling(state:GameState,job:ContentJob){
  const country=countryById[state.character.countryId];
  const marketHigh=job.salaryRange[1]*(country?.salaryMultiplier??1)*state.economy.salaryIndex;
  return Math.max(1,Math.round(marketHigh*1.6));
}

export function qualifiesForJob(state:GameState, job:ContentJob) {
  if(state.character.age<job.minAge) return false;
  if(job.educationRequirement==='secondary' && !hasSecondary(state) && state.character.age>=18) return false;
  if(job.educationRequirement==='trade_school' && !state.education.some(e=>e.graduated&&e.stage==='trade')) return false;
  if(job.educationRequirement==='pilot_license' && !state.flags.pilotLicense) return false;
  const programs=completedPrograms(state);
  if(!['secondary','trade_school','pilot_license'].includes(job.educationRequirement)) {
    const direct=programs.includes(job.educationRequirement);
    const tagged=programs.some(id=>educationById[id]?.careerTags.some(tag=>job.industry.toLowerCase().includes(tag.replace('_',' ')) || job.educationRequirement.includes(tag)));
    const specialSchool=state.education.some(e=>e.graduated&&e.programId===job.educationRequirement);
    if(!(direct||tagged||specialSchool)) return false;
  }
  const s=state.character;
  for(const [key,min] of Object.entries(job.statRequirements)) {
    const actual = key in s.stats ? (s.stats as unknown as Record<string,number>)[key] : (s.secondary as unknown as Record<string,number>)[key];
    if((actual??0) < Number(min)-10) return false;
  }
  if(job.experienceRequirement>0&&relevantExperienceYears(state,job)<job.experienceRequirement)return false;
  return true;
}

export function availableJobs(state:GameState) {
  return jobs.filter(j=>qualifiesForJob(state,j)).sort((a,b)=>a.salaryRange[0]-b.salaryRange[0]);
}

export function applyForJob(state:GameState,jobId:string):EngineResult {
  const job=jobById[jobId]; if(!job) return {success:false,messages:[{text:'That job listing is no longer available.'}]};
  if(state.legal.imprisoned) return {success:false,messages:[{text:'You cannot apply for ordinary jobs while imprisoned.'}]};
  const startGate=actionGateStatus(state,{policy:'career.job_start'});if(!startGate.allowed)return{success:false,messages:[{text:startGate.message!}]};
  if(!qualifiesForJob(state,job)) return {success:false,messages:[{text:`You do not currently meet the requirements for ${job.title}.`}]};
  const applicationGate=consumeAction(state,[{policy:'career.application.total'},{policy:'career.application.job',target:job.id}]);if(!applicationGate.allowed)return{success:false,messages:[{text:applicationGate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);
  const interviewScore=state.character.secondary.charisma*.25+state.character.secondary.discipline*.15+state.character.stats.intelligence*.2+state.character.secondary.reputation*.15+rng.int(0,35);
  const legalPenalty=state.legal.criminalRecord.filter(r=>r.convicted).length*8;
  const success=interviewScore-legalPenalty >= 46 + Math.min(28,job.experienceRequirement*3);
  state.rngCounter=rng.counter();
  if(!success){
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You interviewed for ${job.title} but did not receive an offer.`});
    return {success:false,messages:[{text:`The interview for ${job.title} did not result in an offer.`}]};
  }
  if(state.employment.current){ state.employment.current.endAge=state.character.age; state.employment.history.push({...state.employment.current}); }
  const country=countryById[state.character.countryId]; const salary=Math.round(rng.int(job.salaryRange[0],job.salaryRange[1])*(country?.salaryMultiplier??1)*state.economy.salaryIndex);
  state.employment.current={jobId:job.id,title:job.title,company:generateCompany(job.industry,rng.int(0,999)),startAge:state.character.age,salary,performance:55,level:Number(job.id.match(/_(\d+)$/)?.[1]??1)};
  state.employment.retired=false;
  consumeAction(state,{policy:'career.job_start'});
  state.character.secondary.workPerformance=55;
  syncWorkplaceWorlds(state,true);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You accepted a position as ${job.title} at ${state.employment.current.company}.`,moneyDelta:salary});
  return {success:true,messages:[{text:`Hired as ${job.title} for ${salary.toLocaleString()} per year.`}]};
}

function generateCompany(industry:string,n:number){
  const first=['North','Silver','Civic','Bright','Cedar','Harbor','Aster','Blue','Copper','Mosaic','Juniper','Summit'][n%12];
  const second=['Works','Group','Collective','Partners','Labs','Services','Systems','House','Network','Company'][Math.floor(n/12)%10];
  return `${first} ${second}`;
}

export function processCareerYear(state:GameState) {
  const current=state.employment.current; if(!current || state.employment.retired) return;
  const job=jobById[current.jobId]; if(!job) return;
  const rng=createRng(state.seed,state.rngCounter);
  const workplace=currentWorkplaceWorld(state);
  const workplaceState=workplace?.workplace?.employmentKind==='full_time'?workplace.workplace:undefined;
  const bossRel=workplaceState?.managerNpcId?state.relationships.find(rel=>rel.npcId===workplaceState.managerNpcId&&!rel.estranged):undefined;
  const annualWageGrowth=state.economy.lastSalaryGrowthRate??0;
  if(annualWageGrowth!==0) current.salary=Math.min(salaryCeiling(state,job),Math.max(1,Math.round(current.salary*(1+annualWageGrowth))));
  const workplaceModifier=workplaceState?Math.round((workplaceState.reputation-50)/18+(workplaceState.morale-50)/25-(workplaceState.tension-50)/20+(bossRel?((bossRel.score-50)/28):0)):0;
  current.performance=clamp(current.performance + rng.int(-4,4) + (state.character.secondary.discipline>65?2:0) - Math.round(state.character.secondary.stress/45) + workplaceModifier);
  state.character.secondary.workPerformance=current.performance;
  state.character.secondary.stress=clamp(state.character.secondary.stress+Math.round(job.stress/25)-2+(workplaceState&&workplaceState.tension>70?2:0));
  state.character.stats.health=clamp(state.character.stats.health-(rng.chance(job.healthRisk/500)?rng.int(1,3):0));
  const years=state.character.age-current.startAge;

  const demandPressure=Math.max(0,1-state.economy.businessDemandIndex);
  const layoffChance=Math.min(.085,.007+demandPressure*.06+(workplaceState?Math.max(0,42-workplaceState.morale)*.00035:0));
  if(years>=1&&rng.chance(layoffChance)){
    if(workplaceState)workplaceState.layoffs+=1;
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`A restructuring eliminated your ${current.title} position at ${current.company}.`});
    current.endAge=state.character.age;state.employment.history.push({...current});state.employment.current=undefined;state.character.stats.happiness=clamp(state.character.stats.happiness-9);state.character.secondary.stress=clamp(state.character.secondary.stress+6);syncWorkplaceWorlds(state,false);state.rngCounter=rng.counter();return;
  }

  if(job.promotionPath && years>=Math.max(2,job.experienceRequirement) && current.performance>=70 && rng.chance(.18 + current.performance/500 + (workplaceState?.reputation??50)/1000)) {
    const next=jobById[job.promotionPath]; if(next){
      current.jobId=next.id; current.title=next.title; current.level+=1; current.salary=Math.min(salaryCeiling(state,next),Math.round(current.salary*rng.int(112,128)/100)); current.performance=58;
      if(workplaceState)workplaceState.reputation=clamp(workplaceState.reputation+6);
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You were promoted to ${next.title} at ${current.company}.`,moneyDelta:current.salary});
    }
  } else {
    const previous=jobs.find(candidate=>candidate.promotionPath===job.id);
    if(previous&&current.performance<38&&rng.chance(.20)){
      current.jobId=previous.id;current.title=previous.title;current.level=Math.max(1,current.level-1);current.salary=Math.max(1,Math.round(current.salary*rng.int(76,88)/100));current.performance=46;
      if(workplaceState){workplaceState.reputation=clamp(workplaceState.reputation-7);workplaceState.tension=clamp(workplaceState.tension+5);}
      state.character.stats.happiness=clamp(state.character.stats.happiness-7);
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`After a difficult review cycle, you were demoted to ${previous.title}.`});
    } else if(current.performance<22 && rng.chance(.35)) {
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You were fired from your job as ${current.title}.`});
      current.endAge=state.character.age; state.employment.history.push({...current}); state.employment.current=undefined; state.character.stats.happiness=clamp(state.character.stats.happiness-12);syncWorkplaceWorlds(state,false);
    } else if(rng.chance(.02+(workplaceState?.reputation??50)/2500)) {
      const bonus=Math.round(current.salary*rng.int(3,12)/100); state.finances.cash+=bonus;
      if(workplaceState)workplaceState.morale=clamp(workplaceState.morale+2);
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You received a performance bonus of ${bonus.toLocaleString()}.`,moneyDelta:bonus});
    }
  }
  if(job.famePotential>0 && current.level>=4 && rng.chance(job.famePotential/300)) state.fame.fame=clamp(state.fame.fame+1);
  syncWorkplaceWorlds(state,false);state.rngCounter=rng.counter();
}

export function workHarder(state:GameState):EngineResult {
  const current=state.employment.current; if(!current) return {success:false,messages:[{text:'You do not have a job to work harder at.'}]};
  const gate=consumeAction(state,{policy:'career.work_harder'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  current.performance=clamp(current.performance+7); state.character.secondary.workPerformance=current.performance; state.character.secondary.stress=clamp(state.character.secondary.stress+5); state.character.stats.happiness=clamp(state.character.stats.happiness-1);
  const workplace=currentWorkplaceWorld(state);if(workplace?.workplace){workplace.workplace.reputation=clamp(workplace.workplace.reputation+2);workplace.workplace.tension=clamp(workplace.workplace.tension+1);}
  return {success:true,messages:[{text:'You put in extra effort. Performance rose, and so did stress.'}]};
}

export function askForRaise(state:GameState):EngineResult {
  const current=state.employment.current;if(!current)return{success:false,messages:[{text:'You are not currently employed.'}]};
  const job=jobById[current.jobId];
  if(job){
    const ceiling=salaryCeiling(state,job);
    if(current.salary>=ceiling)return{success:false,messages:[{text:'Your pay is already at the top of this role’s current salary band.'}]};
  }
  const gate=consumeAction(state,{policy:'career.raise'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const workplace=currentWorkplaceWorld(state);const bossRel=workplace?.workplace?.managerNpcId?state.relationships.find(rel=>rel.npcId===workplace.workplace!.managerNpcId&&!rel.estranged):undefined;
  const rng=createRng(state.seed,state.rngCounter); const success=rng.chance(clamp(current.performance+state.character.secondary.charisma/2+(bossRel?.score??50)*.15-52,8,82)/100);
  if(success){const pct=rng.int(4,12); const proposed=Math.round(current.salary*(1+pct/100));current.salary=job?Math.min(proposed,salaryCeiling(state,job)):proposed;}
  else current.performance=clamp(current.performance-rng.int(0,3));
  state.rngCounter=rng.counter(); return {success,messages:[{text:success?`Your raise was approved. New salary: ${current.salary.toLocaleString()}.`:'Your raise request was declined.'}]};
}

export function resign(state:GameState):EngineResult {
  const current=state.employment.current;if(!current)return{success:false,messages:[{text:'You have no job to resign from.'}]};
  current.endAge=state.character.age;state.employment.history.push({...current});state.employment.current=undefined;syncWorkplaceWorlds(state,false);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You resigned from your position as ${current.title}.`});
  return {success:true,messages:[{text:'You resigned.'}]};
}

export function retire(state:GameState):EngineResult {
  if(state.character.age<50) return {success:false,messages:[{text:'Retirement is not available at your current age.'}]};
  if(state.employment.current){state.employment.current.endAge=state.character.age;state.employment.history.push({...state.employment.current});state.employment.current=undefined;}
  state.employment.partTimeJobs??=[];state.employment.partTimeHistory??=[];
  for(const record of state.employment.partTimeJobs){record.endAge=state.character.age;state.employment.partTimeHistory.push({...record});}
  state.employment.partTimeJobs=[];state.employment.partTimeJobIds=[];
  state.employment.retired=true;syncWorkplaceWorlds(state,false); state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:'You retired from working life.'});
  return {success:true,messages:[{text:'You retired.'}]};
}

export function takeFreelanceGig(state:GameState,category:'writing'|'programming'|'design'|'tutoring'|'photography'|'music'|'consulting'):EngineResult {
  if(state.character.age<14)return{success:false,messages:[{text:'You are too young for freelance work.'}]};
  const gate=consumeAction(state,{policy:'career.freelance'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const skill={writing:state.character.stats.intelligence,programming:state.character.stats.intelligence,design:state.character.secondary.creativity,tutoring:state.character.stats.intelligence,photography:state.character.secondary.creativity,music:state.character.talents.music,consulting:state.character.secondary.charisma}[category];
  const rng=createRng(state.seed,state.rngCounter); const success=rng.chance(clamp(skill+state.employment.freelanceReputation-35,10,90)/100);
  const pay=success?Math.round(rng.int(80,850)*(1+state.employment.freelanceReputation/100)):0;
  if(success){state.finances.cash+=pay;state.employment.freelanceReputation=clamp(state.employment.freelanceReputation+2);state.character.stats.happiness=clamp(state.character.stats.happiness+2);}else state.employment.freelanceReputation=clamp(state.employment.freelanceReputation-1);
  state.rngCounter=rng.counter();return{success,messages:[{text:success?`Your ${category} gig paid ${pay.toLocaleString()}.`:`The ${category} gig did not work out.`}]};
}
