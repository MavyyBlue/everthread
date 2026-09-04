import type { GameState } from '../types/game';
import { createRng } from '../core/rng';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { ageUp, finalizeAgeUp } from '../systems/AgingSystem';
import { resolvePendingEvent } from '../systems/EventSystem';
import { availablePrograms, enrollProgram, studyHarder } from '../systems/EducationSystem';
import { availableJobs, applyForJob, workHarder, takeFreelanceGig } from '../systems/CareerSystem';
import { meetPotentialPartner, changeRelationshipType, haveChild, interactWithNpc } from '../systems/RelationshipSystem';
import { availableCrimes, commitCrime, resolveLegalCase, prisonActivity } from '../systems/CrimeSystem';
import { performWellnessActivity } from '../systems/HealthSystem';
import { buySecurity } from '../systems/InvestmentSystem';
import { buyProperty, rentOutProperty } from '../systems/PropertySystem';
import { startBusiness, addBusinessProduct } from '../systems/BusinessSystem';
import { assetValue, liabilityValue, netWorth, wealthBreakdown } from '../systems/FinanceSystem';
import { checkDeath } from '../systems/DeathSystem';
import { securities, propertyDefinitions, businessIndustries } from '../data/assets';
import { jobById } from '../data/jobs';
import * as Special from '../systems/SpecialCareerSystem';

export type SimulationProfile='ordinary'|'academic'|'entrepreneur'|'creative'|'athletic'|'criminal';
export type SimulationPolicy='neutral'|'conservative'|'reckless'|'social'|'family'|'career';
export type SimulationMode='full'|'bulk';

export interface LifeSimulationResult {
  seed:string;
  profile:SimulationProfile;
  policy:SimulationPolicy;
  lifespan:number;
  netWorth:number;
  cash:number;
  assetValue:number;
  liabilityValue:number;
  propertyEquity:number;
  vehicleValue:number;
  collectibleValue:number;
  investmentValue:number;
  investmentCostBasis:number;
  investmentGain:number;
  investmentContributions:number;
  investmentWithdrawals:number;
  businessValue:number;
  otherLiabilities:number;
  lifetimeInheritance:number;
  annualIncome:number;
  annualExpenses:number;
  highestEducation:string;
  primaryCareer:string;
  primaryIndustry:string;
  married:boolean;
  children:number;
  committedCrime:boolean;
  convictions:number;
  imprisonedYears:number;
  peakFame:number;
  causeOfDeath:string;
  forcedTerminalDeath:boolean;
  anomalies:string[];
}

export interface SimulationReport {
  requestedLives:number;
  completedLives:number;
  averageLifespan:number;
  medianLifespan:number;
  averageNetWorth:number;
  medianNetWorth:number;
  wealthPercentiles:{p10:number;p25:number;p75:number;p90:number;p99:number};
  millionaireRate:number;
  marriageRate:number;
  averageChildren:number;
  crimeRate:number;
  convictionRate:number;
  fameRate:number;
  forcedTerminalDeaths:number;
  anomalyCount:number;
  anomalySamples:string[];
  educationDistribution:Record<string,number>;
  careerDistribution:Record<string,number>;
  profileDistribution:Record<string,number>;
  policyDistribution:Record<string,number>;
  causeOfDeathDistribution:Record<string,number>;
  averageWealthSources:{cash:number;propertyEquity:number;vehicles:number;collectibles:number;investments:number;investmentCostBasis:number;investmentGain:number;investmentContributions:number;investmentWithdrawals:number;businesses:number;otherLiabilities:number;lifetimeInheritance:number};
  inheritanceRate:number;
}

export interface SimulationOptions {
  lives:number;
  seedPrefix?:string;
  maxAge?:number;
  keepAnomalySamples?:number;
  mode?:SimulationMode;
  policy?:SimulationPolicy|'mixed';
}

function bump(target:Record<string,number>,key:string){target[key]=(target[key]??0)+1;}
function median(values:number[]){if(!values.length)return 0;const sorted=[...values].sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]!:(sorted[mid-1]!+sorted[mid]!)/2;}
function percentile(values:number[],p:number){if(!values.length)return 0;const sorted=[...values].sort((a,b)=>a-b);const index=(sorted.length-1)*p;const low=Math.floor(index),high=Math.ceil(index);if(low===high)return sorted[low]!;const weight=index-low;return sorted[low]!*(1-weight)+sorted[high]!*weight;}
function activeSchool(state:GameState){return state.education.some(record=>!record.graduated&&!record.droppedOut&&!record.endAge);}

function chooseProfile(seed:string):SimulationProfile {
  const rng=createRng(`${seed}-profile`);
  return rng.weighted([
    {item:'ordinary' as const,weight:45},{item:'academic' as const,weight:18},{item:'entrepreneur' as const,weight:10},
    {item:'creative' as const,weight:10},{item:'athletic' as const,weight:9},{item:'criminal' as const,weight:8},
  ]);
}

function choosePolicy(seed:string,requested:SimulationPolicy|'mixed'='mixed'):SimulationPolicy {
  if(requested!=='mixed')return requested;
  const rng=createRng(`${seed}-policy`);
  return rng.weighted([
    {item:'neutral' as const,weight:35},{item:'conservative' as const,weight:15},{item:'reckless' as const,weight:12},
    {item:'social' as const,weight:12},{item:'family' as const,weight:14},{item:'career' as const,weight:12},
  ]);
}

function desiredChildren(seed:string,profile:SimulationProfile,policy:SimulationPolicy){
  const rng=createRng(`${seed}-family-target-${policy}`);
  let base=profile==='entrepreneur'?rng.int(0,2):profile==='criminal'?rng.int(0,2):rng.int(0,3);
  if(policy==='family')base=Math.min(4,base+1);
  if(policy==='career')base=Math.min(base,1);
  if(policy==='reckless'&&rng.chance(.25))base=Math.min(4,base+1);
  return base;
}

function resolveEventAutomatically(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  if(!state.pendingEvent)return;
  const choices=state.pendingEvent.choices;
  if(!choices.length){state.pendingEvent=undefined;finalizeAgeUp(state);return;}
  const rng=createRng(`${state.seed}-sim-event-${state.character.age}-${state.pendingEvent.eventId}`);
  let choice=choices[0]!;
  if(policy==='reckless'||profile==='criminal'&&policy!=='conservative') choice=choices.at(-1)??choice;
  else if(policy==='conservative'||policy==='family') choice=choices[0]!;
  else if(policy==='career'&&choices.length>1) choice=choices[Math.min(1,choices.length-1)]!;
  else choice=rng.pick(choices);
  resolvePendingEvent(state,choice.id);
  finalizeAgeUp(state);
}

function pursueEducation(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  const age=state.character.age;
  if(activeSchool(state)){
    const shouldStudy=profile==='academic'||profile==='ordinary'&&age>=14||createRng(`${state.seed}-study-${age}`).chance(.32);
    if(shouldStudy)studyHarder(state);
    return;
  }
  if(age<17||age>32)return;
  const postSecondary=state.education.filter(r=>r.programId);
  const hasPostSecondary=postSecondary.length>0;
  const hasDegree=postSecondary.some(r=>r.graduated);
  const rng=createRng(`${state.seed}-college-${age}`);
  let wantsCollege=profile==='academic'?1:profile==='criminal'?.18:profile==='athletic'?.55:profile==='creative'?.48:profile==='entrepreneur'?.42:.52;
  if(policy==='career')wantsCollege=Math.min(1,wantsCollege+.18);
  if(policy==='conservative')wantsCollege=Math.min(1,wantsCollege+.08);
  if(policy==='reckless')wantsCollege=Math.max(.08,wantsCollege-.18);
  if(hasPostSecondary&&!hasDegree)return;
  if(profile!=='academic'&&hasPostSecondary)return;
  if(profile==='academic'&&postSecondary.length>=2)return;
  if(!rng.chance(typeof wantsCollege==='number'?wantsCollege:.5))return;
  const programs=availablePrograms(state).filter(program=>{
    const advanced=['graduate','professional'].includes(program.kind);
    if(!hasPostSecondary)return !advanced;
    return profile==='academic'&&hasDegree&&advanced;
  });
  if(!programs.length)return;
  const preferred=programs.filter(program=>{
    if(profile==='academic')return ['science','computer_science','engineering','mathematics','physics','medical_school','law_school','graduate_school'].some(tag=>program.id.includes(tag));
    if(profile==='creative')return ['art','music','communications','english'].some(tag=>program.id.includes(tag));
    if(profile==='entrepreneur')return ['business','finance','economics','computer_science'].some(tag=>program.id.includes(tag));
    if(profile==='athletic')return ['business','education','psychology'].some(tag=>program.id.includes(tag));
    return true;
  });
  const pool=preferred.length?preferred:programs;
  for(const program of rng.shuffle(pool).slice(0,8)) if(enrollProgram(state,program.id).success)break;
}

function pursueCareer(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  if(state.character.age<16||state.legal.imprisoned)return;
  const rng=createRng(`${state.seed}-career-policy-${state.character.age}`);
  if(!state.employment.current&&!activeSchool(state)){
    const options=availableJobs(state);
    const entry=options.filter(job=>job.experienceRequirement===0||job.id.endsWith('_1'));
    const pool=entry.length?entry:options;
    if(pool.length){
      let candidates=rng.shuffle(pool);
      if(policy==='career')candidates=[...pool].sort((a,b)=>b.salaryRange[1]-a.salaryRange[1]);
      else if(policy==='conservative')candidates=[...pool].sort((a,b)=>(a.stress+a.healthRisk)-(b.stress+b.healthRisk)||b.salaryRange[0]-a.salaryRange[0]);
      else if(profile==='creative'){const creative=pool.filter(job=>job.famePotential>=20);if(creative.length)candidates=rng.shuffle(creative);}
      for(const job of candidates.slice(0,Math.min(policy==='career'?6:10,candidates.length))) if(applyForJob(state,job.id).success)break;
    }
    if(!state.employment.current&&rng.chance(.45))takeFreelanceGig(state,profile==='creative'?'design':profile==='academic'?'programming':'writing');
  } else if(state.employment.current&&rng.chance(policy==='career'?.68:policy==='reckless'?.18:profile==='academic'?.52:.32)) workHarder(state);
}

function pursueRelationships(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  const age=state.character.age;if(age<16||age>55)return;
  const rng=createRng(`${state.seed}-relationships-policy-${age}`);
  const romantic=state.relationships.find(r=>['partner','fiance','spouse'].includes(r.type)&&state.npcs[r.npcId]?.alive);
  const relationshipMultiplier=policy==='social'?1.7:policy==='family'?1.55:policy==='career'?.55:policy==='reckless'?1.2:policy==='conservative'?.9:1;
  if(!romantic&&rng.chance(Math.min(.8,(age<35?.14:.06)*relationshipMultiplier))){
    const met=meetPotentialPartner(state);
    if(met.success){
      const candidate=[...state.relationships].reverse().find(r=>r.type==='friend'&&state.npcs[r.npcId]?.alive);
      if(candidate){interactWithNpc(state,candidate.npcId,'spend_time');if(candidate.score>=45)changeRelationshipType(state,candidate.npcId,'ask_out');}
    }
    return;
  }
  if(!romantic)return;
  if(romantic.score<72&&rng.chance(Math.min(.9,.62*relationshipMultiplier)))interactWithNpc(state,romantic.npcId,'spend_time');
  if(romantic.type==='partner'&&romantic.yearsKnown>=2&&romantic.score>=62&&age>=20&&rng.chance(Math.min(.5,.15*relationshipMultiplier)))changeRelationshipType(state,romantic.npcId,'propose');
  if(romantic.type==='fiance'&&rng.chance(Math.min(.75,.4*relationshipMultiplier))){changeRelationshipType(state,romantic.npcId,'marry');}
  const target=desiredChildren(state.seed,profile,policy);const children=state.relationships.filter(r=>r.type==='child').length;
  if(['partner','fiance','spouse'].includes(romantic.type)&&children<target&&age>=22&&age<=42&&rng.chance(Math.min(.6,.24*(policy==='family'?1.7:policy==='career'?.55:1))))haveChild(state,romantic.npcId,false);
}

function pursueWealth(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  if(state.character.age<18||state.legal.imprisoned)return;
  const age=state.character.age;const rng=createRng(`${state.seed}-wealth-policy-${age}`);
  const investChance=policy==='reckless'?.24:policy==='conservative'?.18:policy==='career'?.18:policy==='family'?.10:policy==='social'?.08:.12;
  if(state.finances.cash>45000&&age>=22&&rng.chance(investChance)){
    const safe=securities.filter(sec=>sec.type==='fund'||sec.type==='bond');
    const aggressive=securities.filter(sec=>sec.type==='stock'||sec.type==='fund');
    const speculative=securities.filter(sec=>sec.type==='speculative'||sec.type==='stock');
    const pool=policy==='reckless'?(speculative.length?speculative:aggressive):policy==='conservative'?safe:profile==='entrepreneur'?aggressive:[...safe,...securities.filter(sec=>sec.type==='stock')];
    const fraction=policy==='reckless'?.2:policy==='conservative'?.1:.12;const amount=Math.min(state.finances.cash*fraction,18000+age*550);
    buySecurity(state,rng.pick(pool).id,amount);
  }
  const propertyChance=policy==='conservative'?.12:policy==='family'?.11:policy==='reckless'?.05:.08;
  if(state.assets.properties.length===0&&state.finances.cash>30000&&age>=25&&rng.chance(propertyChance)){
    const affordable=propertyDefinitions.filter(p=>p.basePrice*state.economy.housingIndex*.2<state.finances.cash*.75).sort((a,b)=>a.basePrice-b.basePrice);
    if(affordable.length){const result=buyProperty(state,affordable[Math.min(affordable.length-1,rng.int(0,Math.min(4,affordable.length-1)))]!.id,true);if(result.success&&profile==='entrepreneur'&&rng.chance(policy==='career'?.55:.35))rentOutProperty(state,state.assets.properties.at(-1)!.id);}
  }
  if(profile==='entrepreneur'&&state.businesses.length<2){
    const possible=businessIndustries.filter(b=>b.startupCapital<state.finances.cash*.65);
    if(possible.length&&rng.chance(policy==='career'?.24:policy==='reckless'?.22:.14)){
      const industry=rng.pick(possible);startBusiness(state,industry.id,`${state.character.lastName} ${industry.name}`);
    }
  }
  if(profile==='entrepreneur')for(const business of state.businesses)if(!business.bankrupt&&rng.chance(policy==='career'?.22:.14))addBusinessProduct(state,business.id);
}

function pursueSpecialPath(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  const age=state.character.age;const rng=createRng(`${state.seed}-special-policy-${age}`);
  if(profile==='creative'&&age>=13){
    if(state.character.talents.music>=state.character.talents.acting){
      Special.practiceMusic(state,'vocals');if(age>=16&&rng.chance(.36))Special.releaseMusic(state,rng.chance(.25)?'album':'song');if(rng.chance(.05))Special.tourMusic(state);
    }else{Special.takeActingLesson(state);if(age>=18&&rng.chance(.4))Special.auditionActing(state);if(rng.chance(.12))Special.hireActingAgent(state);}
  }
  if(profile==='athletic'&&age>=13&&age<=42){
    if(!state.specialCareers.sports?.active)Special.joinSportsPath(state,rng.pick(['basketball','soccer','tennis','baseball','hockey']));
    Special.trainSport(state);if(age>=18&&rng.chance(.25))Special.pursueProSports(state);
  }
  if(profile==='criminal'&&age>=14){
    if(state.legal.imprisoned){prisonActivity(state,rng.chance(.75)?'behave':'exercise');return;}
    if(state.flags.pendingCharge){resolveLegalCase(state,state.finances.cash>35000?'elite':state.finances.cash>7500?'experienced':state.finances.cash>900?'budget':'public',rng.chance(.35)?'plead':'contest');return;}
    if(rng.chance(policy==='reckless'?.42:policy==='conservative'?.16:.28)){
      const options=availableCrimes(state).filter(crime=>crime.id!=='escape_attempt'&&crime.id!=='prison_contraband');
      if(options.length)commitCrime(state,rng.pick(options).id);
      if(state.flags.pendingCharge)resolveLegalCase(state,state.finances.cash>7500?'experienced':'public',rng.chance(.45)?'plead':'contest');
    }
  }
}

function wellness(state:GameState,policy:SimulationPolicy){
  if(state.character.age<10)return;const rng=createRng(`${state.seed}-wellness-policy-${state.character.age}`);
  const routineChance=policy==='conservative'?.32:policy==='reckless'?.1:.2;
  if(state.character.stats.health<60||state.character.secondary.stress>70||rng.chance(routineChance))performWellnessActivity(state,state.character.secondary.stress>70?'meditation':rng.pick(['walking','running','gym'] as const));
}

function annualPolicy(state:GameState,profile:SimulationProfile,policy:SimulationPolicy){
  if(!state.character.alive)return;
  if(state.pendingEvent)resolveEventAutomatically(state,profile,policy);
  pursueEducation(state,profile,policy);
  pursueCareer(state,profile,policy);
  pursueRelationships(state,profile,policy);
  pursueWealth(state,profile,policy);
  pursueSpecialPath(state,profile,policy);
  wellness(state,policy);
}

function highestEducation(state:GameState){
  const completed=state.education.filter(r=>r.graduated);
  if(!completed.length)return 'none';
  const rank:Record<string,number>={primary:1,middle:2,secondary:3,trade:4,community_college:4,university:5,graduate:6,professional:7};
  return [...completed].sort((a,b)=>(rank[b.stage]??0)-(rank[a.stage]??0))[0]!.stage;
}

function collectAnomalies(state:GameState){
  const errors=validateState(state);
  if(!Number.isFinite(netWorth(state)))errors.push('Non-finite net worth');
  if(state.finances.liabilities.some(l=>!Number.isFinite(l.balance)||l.balance<0))errors.push('Invalid liability balance');
  if(state.assets.properties.some(p=>p.marketValue<0||!Number.isFinite(p.marketValue)))errors.push('Invalid property value');
  if(state.businesses.some(b=>![b.revenue,b.expenses,b.profit,b.valuation,b.capital].every(Number.isFinite)))errors.push('Non-finite business value');
  const activePartners=state.relationships.filter(r=>['fiance','spouse'].includes(r.type)&&!r.estranged);
  if(activePartners.length>1)errors.push('Multiple committed partners');
  for(const npc of Object.values(state.npcs))for(const parentId of npc.parentIds){const parent=state.npcs[parentId];if(parent?.alive&&parent.age-npc.age<16)errors.push(`Impossible living-family age gap: ${parent.id} age ${parent.age} / ${npc.id} age ${npc.age}`);}
  return [...new Set(errors)];
}

export function simulateLife(seed:string,maxAge=125,mode:SimulationMode='full',requestedPolicy:SimulationPolicy|'mixed'='mixed'):LifeSimulationResult {
  const profile=chooseProfile(seed);const policy=choosePolicy(seed,requestedPolicy);
  const state=createNewGame({seed});
  if(mode==='bulk'){state.flags.simulationBulk=true;state.achievements=[];state.challenges=[];}
  let peakFame=state.fame.fame;
  let forcedTerminalDeath=false;
  const annualAnomalies=new Set<string>();
  while(state.character.alive&&state.character.age<maxAge){
    annualPolicy(state,profile,policy);
    if(state.flags.pendingCharge&&!state.legal.imprisoned) resolveLegalCase(state,'public','contest');
    const result=ageUp(state);
    if(!result.success&&state.pendingEvent)resolveEventAutomatically(state,profile,policy);
    else if(state.pendingEvent)resolveEventAutomatically(state,profile,policy);
    peakFame=Math.max(peakFame,state.fame.fame);
    if(!Number.isFinite(state.finances.cash))annualAnomalies.add('Non-finite cash during simulation');
    if(state.character.age<0)annualAnomalies.add('Negative age during simulation');
    if(mode==='bulk'&&state.timeline.length>40)state.timeline=state.timeline.slice(-40);
  }
  if(state.character.alive){
    // The harness uses a terminal cap only to keep pathological balance bugs from hanging large runs.
    checkDeath(state,true);forcedTerminalDeath=true;
  }
  for(const error of collectAnomalies(state))annualAnomalies.add(error);
  const career=state.employment.current??state.employment.history.at(-1);
  const job=career?jobById[career.jobId]:undefined;
  const wealth=wealthBreakdown(state);
  return {
    seed,profile,policy,lifespan:state.character.age,netWorth:wealth.netWorth,cash:wealth.cash,assetValue:assetValue(state),liabilityValue:liabilityValue(state),propertyEquity:wealth.propertyEquity,vehicleValue:wealth.vehicles,collectibleValue:wealth.collectibles,investmentValue:wealth.investments,investmentCostBasis:wealth.investmentCostBasis,investmentGain:wealth.investmentGain,investmentContributions:Number(state.flags.investmentContributions??0),investmentWithdrawals:Number(state.flags.investmentWithdrawals??0),businessValue:wealth.businesses,otherLiabilities:wealth.otherLiabilities,lifetimeInheritance:Number(state.flags.lifetimeInheritance??0),annualIncome:state.finances.annualIncome,annualExpenses:state.finances.annualExpenses,highestEducation:highestEducation(state),
    primaryCareer:career?.title??'none',primaryIndustry:job?.industry??(state.businesses.some(b=>!b.bankrupt)?'Business Owner':'none'),
    married:Number(state.flags.marriages??0)>0||state.timeline.some(entry=>entry.text.startsWith('You married ')),children:state.relationships.filter(r=>r.type==='child').length,
    committedCrime:state.legal.criminalRecord.length>0,convictions:state.legal.criminalRecord.filter(r=>r.convicted).length,
    imprisonedYears:Number(state.flags.prisonYears??0),peakFame,causeOfDeath:state.character.causeOfDeath??'unknown',forcedTerminalDeath,
    anomalies:[...annualAnomalies],
  };
}

export function runSimulation(options:SimulationOptions):SimulationReport {
  const requested=Math.max(1,Math.floor(options.lives));const maxAge=options.maxAge??125;const prefix=options.seedPrefix??'everthread-sim';const sampleLimit=options.keepAnomalySamples??12;const mode=options.mode??'full';
  const lifespans:number[]=[];const wealth:number[]=[];const anomalySamples:string[]=[];
  const educationDistribution:Record<string,number>={};const careerDistribution:Record<string,number>={};const profileDistribution:Record<string,number>={};const policyDistribution:Record<string,number>={};const causeOfDeathDistribution:Record<string,number>={};
  let anomalyCount=0,completedLives=0,marriedCount=0,childrenTotal=0,crimeCount=0,convictedCount=0,fameCount=0,forcedTerminalDeaths=0,inheritanceCount=0;
  let cashTotal=0,propertyEquityTotal=0,vehiclesTotal=0,collectiblesTotal=0,investmentsTotal=0,investmentCostBasisTotal=0,investmentGainTotal=0,investmentContributionsTotal=0,investmentWithdrawalsTotal=0,businessesTotal=0,otherLiabilitiesTotal=0,lifetimeInheritanceTotal=0;
  for(let i=0;i<requested;i++){
    const result=simulateLife(`${prefix}-${i+1}`,maxAge,mode,options.policy??'mixed');completedLives+=1;lifespans.push(result.lifespan);wealth.push(result.netWorth);
    bump(educationDistribution,result.highestEducation);bump(careerDistribution,result.primaryIndustry);bump(profileDistribution,result.profile);bump(policyDistribution,result.policy);bump(causeOfDeathDistribution,result.causeOfDeath);
    anomalyCount+=result.anomalies.length;if(result.anomalies.length&&anomalySamples.length<sampleLimit)anomalySamples.push(`${result.seed}: ${result.anomalies.join('; ')}`);
    if(result.married)marriedCount+=1;childrenTotal+=result.children;if(result.committedCrime)crimeCount+=1;if(result.convictions>0)convictedCount+=1;if(result.peakFame>=25)fameCount+=1;if(result.forcedTerminalDeath)forcedTerminalDeaths+=1;if(result.lifetimeInheritance>0)inheritanceCount+=1;
    cashTotal+=result.cash;propertyEquityTotal+=result.propertyEquity;vehiclesTotal+=result.vehicleValue;collectiblesTotal+=result.collectibleValue;investmentsTotal+=result.investmentValue;investmentCostBasisTotal+=result.investmentCostBasis;investmentGainTotal+=result.investmentGain;investmentContributionsTotal+=result.investmentContributions;investmentWithdrawalsTotal+=result.investmentWithdrawals;businessesTotal+=result.businessValue;otherLiabilitiesTotal+=result.otherLiabilities;lifetimeInheritanceTotal+=result.lifetimeInheritance;
  }
  const denominator=Math.max(1,completedLives);const sum=(values:number[])=>values.reduce((a,b)=>a+b,0);
  return {
    requestedLives:requested,completedLives,
    averageLifespan:sum(lifespans)/denominator,medianLifespan:median(lifespans),
    averageNetWorth:sum(wealth)/denominator,medianNetWorth:median(wealth),wealthPercentiles:{p10:percentile(wealth,.10),p25:percentile(wealth,.25),p75:percentile(wealth,.75),p90:percentile(wealth,.90),p99:percentile(wealth,.99)},millionaireRate:wealth.filter(value=>value>=1_000_000).length/denominator,
    marriageRate:marriedCount/denominator,averageChildren:childrenTotal/denominator,
    crimeRate:crimeCount/denominator,convictionRate:convictedCount/denominator,fameRate:fameCount/denominator,
    forcedTerminalDeaths,anomalyCount,anomalySamples,
    educationDistribution,careerDistribution,profileDistribution,policyDistribution,causeOfDeathDistribution,
    averageWealthSources:{cash:cashTotal/denominator,propertyEquity:propertyEquityTotal/denominator,vehicles:vehiclesTotal/denominator,collectibles:collectiblesTotal/denominator,investments:investmentsTotal/denominator,investmentCostBasis:investmentCostBasisTotal/denominator,investmentGain:investmentGainTotal/denominator,investmentContributions:investmentContributionsTotal/denominator,investmentWithdrawals:investmentWithdrawalsTotal/denominator,businesses:businessesTotal/denominator,otherLiabilities:otherLiabilitiesTotal/denominator,lifetimeInheritance:lifetimeInheritanceTotal/denominator},
    inheritanceRate:inheritanceCount/denominator,
  };
}

function percent(value:number){return `${(value*100).toFixed(1)}%`;}
function topEntries(record:Record<string,number>,limit=12){return Object.entries(record).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([key,value])=>`${key}: ${value}`).join(', ');}

export function formatSimulationReport(report:SimulationReport){
  return [
    `Everthread simulation — ${report.completedLives.toLocaleString()} lives`,
    `Lifespan avg/median: ${report.averageLifespan.toFixed(1)} / ${report.medianLifespan.toFixed(1)}`,
    `Net worth avg/median: ${Math.round(report.averageNetWorth).toLocaleString()} / ${Math.round(report.medianNetWorth).toLocaleString()}`,
    `Wealth p10/p25/p75/p90/p99: ${Math.round(report.wealthPercentiles.p10).toLocaleString()} / ${Math.round(report.wealthPercentiles.p25).toLocaleString()} / ${Math.round(report.wealthPercentiles.p75).toLocaleString()} / ${Math.round(report.wealthPercentiles.p90).toLocaleString()} / ${Math.round(report.wealthPercentiles.p99).toLocaleString()}`,
    `Millionaires: ${percent(report.millionaireRate)} | Married: ${percent(report.marriageRate)} | Children avg: ${report.averageChildren.toFixed(2)}`,
    `Crime: ${percent(report.crimeRate)} | Convicted: ${percent(report.convictionRate)} | Fame 25+: ${percent(report.fameRate)}`,
    `Forced terminal deaths: ${report.forcedTerminalDeaths} | Anomalies: ${report.anomalyCount}`,
    `Avg wealth sources — cash ${Math.round(report.averageWealthSources.cash).toLocaleString()} | property equity ${Math.round(report.averageWealthSources.propertyEquity).toLocaleString()} | investments ${Math.round(report.averageWealthSources.investments).toLocaleString()} | businesses ${Math.round(report.averageWealthSources.businesses).toLocaleString()} | vehicles ${Math.round(report.averageWealthSources.vehicles).toLocaleString()} | collectibles ${Math.round(report.averageWealthSources.collectibles).toLocaleString()} | other debt ${Math.round(report.averageWealthSources.otherLiabilities).toLocaleString()}`,
    `Investing avg — contributed ${Math.round(report.averageWealthSources.investmentContributions).toLocaleString()} | withdrawn ${Math.round(report.averageWealthSources.investmentWithdrawals).toLocaleString()} | held cost basis ${Math.round(report.averageWealthSources.investmentCostBasis).toLocaleString()} | held gain ${Math.round(report.averageWealthSources.investmentGain).toLocaleString()}`,
    `Inheritance: ${percent(report.inheritanceRate)} of lives | avg lifetime received ${Math.round(report.averageWealthSources.lifetimeInheritance).toLocaleString()}`,
    `Profiles: ${topEntries(report.profileDistribution)}`,
    `Policies: ${topEntries(report.policyDistribution)}`,
    `Education: ${topEntries(report.educationDistribution)}`,
    `Careers: ${topEntries(report.careerDistribution)}`,
    `Death causes: ${topEntries(report.causeOfDeathDistribution)}`,
    ...(report.anomalySamples.length?[`Anomaly samples:`,...report.anomalySamples]:[]),
  ].join('\n');
}
