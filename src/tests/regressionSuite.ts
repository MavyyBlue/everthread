import type { GameState, Npc, Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { ageUp, finalizeAgeUp, rewindToAge } from '../systems/AgingSystem';
import { forceEvent, processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import { deathProbability } from '../systems/DeathSystem';
import { enrollProgram } from '../systems/EducationSystem';
import { availableJobs, applyForJob, askForRaise, workHarder } from '../systems/CareerSystem';
import { processAnnualFinance, netWorth, wealthBreakdown } from '../systems/FinanceSystem';
import { buyCollectible, buyProperty, renovateProperty } from '../systems/PropertySystem';
import { countryById } from '../data/countries';
import { meetPotentialPartner, haveChild, ageNpcs, interactWithNpc, processFamilyPlanningYear } from '../systems/RelationshipSystem';
import { jobById } from '../data/jobs';
import { eventById } from '../data/events';
import { enforceStateInvariants, validateState } from '../core/invariants';
import { availableCrimes, commitCrime, resolveLegalCase } from '../systems/CrimeSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { migrateSave, nextSaveSlotId } from '../services/SaveSystem';
import { buySecurity, processMarketYear, sellSecurity } from '../systems/InvestmentSystem';
import { runSimulation } from './simulationHarness';
import { formatMoney } from '../core/format';
import { actionAllowed, actionUsesThisAge, consumeAction } from '../core/actionEconomy';
import { performWellnessActivity } from '../systems/HealthSystem';
import { fameActivity } from '../systems/FameSystem';
import { addBusinessProduct, startBusiness } from '../systems/BusinessSystem';
import { GameEngine } from '../engine/GameEngine';
import { adoptPet } from '../systems/PetSystem';
import { travel } from '../systems/TravelSystem';
import { buildPeopleRelationshipGraph, peopleFolderSummaries } from '../systems/PeopleGraphSystem';
import { racingAction } from '../systems/SpecialCareerSystem';
import { relatedMiniGameSkill, skipMiniGame } from '../minigames/framework';
import { featuredLife } from '../systems/LifeSaveSystem';

export interface RegressionResult {name:string;passed:boolean;error?:string;}
export interface RegressionReport {passed:number;failed:number;results:RegressionResult[];}
export interface RegressionCase {name:string;run:()=>void;}

function fail(message:string):never{throw new Error(message);}
function assert(condition:unknown,message:string):asserts condition{if(!condition)fail(message);}
function equal<T>(actual:T,expected:T,message:string){if(actual!==expected)fail(`${message} (expected ${String(expected)}, got ${String(actual)})`);}
function approx(actual:number,expected:number,tolerance:number,message:string){if(Math.abs(actual-expected)>tolerance)fail(`${message} (expected ${expected}±${tolerance}, got ${actual})`);}

function highStatAdult(seed:string){
  const state=createNewGame({seed,advanced:{intelligence:100,appearance:90,health:95,happiness:85,discipline:95,willpower:90,fertility:70,athleticism:90,music:85,acting:85,crime:80,business:90,social:90}});
  state.character.age=25;state.currentYear=2051;
  state.education.push({stage:'secondary',institution:'Test Secondary',startAge:14,endAge:18,graduated:true,droppedOut:false,scholarship:false,performance:95});
  return state;
}

function makeChild(state:GameState,id='test-child',age=20):Npc{
  return {id,firstName:'Ari',lastName:state.character.lastName,age,alive:true,health:90,happiness:80,wealth:0,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',traits:['responsible'],hiddenOpinion:80,memories:[],parentIds:[state.character.id],childIds:[]};
}

export const regressionCases:RegressionCase[]=[
  {
    name:'seeded character generation is behaviorally deterministic',
    run:()=>{
      const a=createNewGame({seed:'regression-seed'}),b=createNewGame({seed:'regression-seed'});
      equal(a.character.firstName,b.character.firstName,'first name differs');equal(a.character.lastName,b.character.lastName,'last name differs');
      equal(a.character.countryId,b.character.countryId,'country differs');equal(a.character.city,b.character.city,'city differs');
      equal(JSON.stringify(a.character.stats),JSON.stringify(b.character.stats),'primary stats differ');equal(JSON.stringify(a.character.talents),JSON.stringify(b.character.talents),'talents differ');
    }
  },
  {
    name:'age up increments exactly once and unresolved events block aging',
    run:()=>{
      const state=createNewGame({seed:'age-lock'});forceEvent(state,'midlife_reassessment');
      equal(ageUp(state).success,false,'age up should be blocked by pending event');equal(state.character.age,0,'blocked age up changed age');
      const choice=state.pendingEvent?.choices[0];assert(choice,'forced event has no choice');resolvePendingEvent(state,choice.id);finalizeAgeUp(state);
      equal(ageUp(state).success,true,'age up should succeed after event resolution');equal(state.character.age,1,'age did not increment exactly once');
      if(state.pendingEvent){const c=state.pendingEvent.choices[0];assert(c,'random event missing choice');resolvePendingEvent(state,c.id);finalizeAgeUp(state);}
    }
  },
  {
    name:'newborns cannot trade investments or initiate vacations',
    run:()=>{
      const state=createNewGame({seed:'newborn-adult-actions'});state.finances.cash=10000;
      equal(buySecurity(state,'broad_market_fund',1000).success,false,'newborn could buy a security');
      state.investments.positions.push({securityId:'broad_market_fund',units:2,averageCost:100});state.investments.prices['broad_market_fund']=100;
      equal(sellSecurity(state,'broad_market_fund').success,false,'newborn could sell a security');
      equal(travel(state,state.character.countryId).success,false,'newborn could initiate an independent vacation');
      equal(travel(state,state.character.countryId,undefined,true).success,false,'newborn could initiate a family trip');
      equal(adoptPet(state,'dog_labrador').success,false,'newborn could adopt a pet');
      equal(buyCollectible(state,'collectible_jewelry_7').success,false,'newborn could buy from the collectible market');
    }
  },
  {
    name:'wellness activities unlock at age-appropriate childhood and teen stages',
    run:()=>{
      const state=createNewGame({seed:'wellness-age-gates'});
      equal(performWellnessActivity(state,'walking').success,false,'newborn could perform a structured walking activity');
      equal(performWellnessActivity(state,'gym').success,false,'newborn could use the gym');
      state.character.age=3;assert(performWellnessActivity(state,'walking').success,'walking did not unlock at age 3');
      state.character.age=12;equal(performWellnessActivity(state,'gym').success,false,'gym unlocked before age 13');
      state.character.age=13;assert(performWellnessActivity(state,'gym').success,'gym did not unlock at age 13');
    }
  },
  {
    name:'dependent minors do not accumulate ordinary personal insolvency debt',
    run:()=>{
      const state=createNewGame({seed:'minor-finance'});state.finances.cash=0;state.economy.inflationIndex=1;
      for(let age=1;age<=17;age++){state.character.age=age;state.currentYear=2026+age;processAnnualFinance(state);equal(state.finances.taxesPaid,0,`minor with no income paid tax at age ${age}`);assert(!state.finances.liabilities.some(l=>l.kind==='personal'),`minor accumulated personal debt at age ${age}`);equal(state.finances.cash,0,`minor finance drifted below zero at age ${age}`);}
    }
  },
  {
    name:'negative dependent-minor cash is covered by guardians instead of converted to debt',
    run:()=>{
      const state=createNewGame({seed:'minor-shortfall-support'});state.character.age=10;state.finances.cash=-2400;processAnnualFinance(state);equal(state.finances.cash,0,'minor shortfall was not normalized to zero');assert(!state.finances.liabilities.some(l=>l.kind==='personal'),'minor shortfall created unsecured debt');assert(Number(state.flags.guardianSupportReceived)>=2400,'guardian support was not tracked');
    }
  },
  {
    name:'death probability rises materially with age at equal health',
    run:()=>{
      const state=createNewGame({seed:'death-curve'});state.health.conditions=[];state.character.stats.health=75;
      state.character.age=40;const young=deathProbability(state);state.character.age=85;const old=deathProbability(state);
      assert(old>young*10,`old-age death probability did not rise enough (${young} -> ${old})`);
    }
  },
  {
    name:'post-secondary education can create safe structured student debt',
    run:()=>{
      const state=highStatAdult('education-loan');state.character.age=18;state.currentYear=2044;state.finances.cash=0;
      const result=enrollProgram(state,'computer_science');assert(result.success,'computer science enrollment failed');
      assert(state.education.some(r=>r.programId==='computer_science'),'education record missing');assert(state.finances.liabilities.some(l=>l.kind==='student'&&l.balance>0),'student loan was not created');
    }
  },
  {
    name:'qualified adults can obtain at least one entry career without corrupting state',
    run:()=>{
      const state=highStatAdult('career-entry');state.education.push({stage:'university',institution:'Test University',programId:'computer_science',major:'Computer Science',startAge:18,endAge:22,graduated:true,droppedOut:false,scholarship:false,performance:95});
      const jobs=availableJobs(state).filter(j=>j.id.endsWith('_1')||j.experienceRequirement===0);assert(jobs.length>0,'no entry jobs available');
      let hired=false;for(const job of jobs.slice(0,20)){if(applyForJob(state,job.id).success){hired=true;break;}}
      assert(hired,'high-stat qualified adult could not get any entry job');assert(state.employment.current,'successful application did not create current employment');
    }
  },
  {
    name:'senior career listings require actual relevant experience',
    run:()=>{
      const state=highStatAdult('career-experience');state.character.age=20;state.currentYear=2046;state.character.secondary.charisma=100;state.character.secondary.discipline=100;
      assert(!availableJobs(state).some(job=>job.id==='real_estate_6'),'level-six real-estate role was available with no experience');
      state.character.age=30;state.currentYear=2056;state.employment.history.push({jobId:'real_estate_1',title:'Leasing Assistant',company:'Test Realty',startAge:18,endAge:27,salary:40000,performance:75,level:1});
      assert(availableJobs(state).some(job=>job.id==='real_estate_6'),'senior role stayed locked after enough relevant experience');
    }
  },
  {
    name:'career effort and raise requests are limited to one use per year',
    run:()=>{
      const state=highStatAdult('career-yearly-gates');state.character.age=30;state.currentYear=2056;state.character.secondary.charisma=100;
      state.employment.current={jobId:'real_estate_1',title:'Leasing Assistant',company:'Test Realty',startAge:29,salary:42000,performance:90,level:1};
      assert(workHarder(state).success,'first work-harder action failed');equal(workHarder(state).success,false,'work harder could be spammed in one year');
      askForRaise(state);const afterFirst=state.employment.current.salary;equal(askForRaise(state).success,false,'second raise request was not blocked');equal(state.employment.current.salary,afterFirst,'blocked raise request changed salary');
    }
  },
  {
    name:'central action ledger enforces compound limits atomically and resets by age',
    run:()=>{
      const state=highStatAdult('action-ledger');state.character.age=26;
      const claims=[{policy:'career.application.total' as const},{policy:'career.application.job' as const,target:'retail_1'}];
      assert(consumeAction(state,claims).allowed,'first compound action claim was rejected');equal(actionUsesThisAge(state,'career.application.total'),1,'total action use was not recorded');equal(actionUsesThisAge(state,'career.application.job','retail_1'),1,'target action use was not recorded');
      const blocked=consumeAction(state,claims);equal(blocked.allowed,false,'same targeted action was allowed twice');equal(actionUsesThisAge(state,'career.application.total'),1,'blocked compound claim partially consumed the total limit');
      assert(consumeAction(state,{policy:'property.renovate',target:'house'}).allowed,'first cooldown action was rejected');state.character.age+=1;equal(actionAllowed(state,{policy:'property.renovate',target:'house'}),false,'cooldown expired a year too early');state.character.age+=1;assert(actionAllowed(state,{policy:'property.renovate',target:'house'}),'cooldown did not expire after the configured interval');
      assert(actionAllowed(state,claims),'per-age action uses did not reset after aging');
    }
  },
  {
    name:'failed job applications consume the attempt and cannot be rerolled on the same listing',
    run:()=>{
      const state=highStatAdult('application-reroll');state.character.age=25;state.character.stats.intelligence=0;state.character.secondary.charisma=25;state.character.secondary.discipline=20;state.character.secondary.reputation=0;
      const first=applyForJob(state,'retail_1');equal(first.success,false,'guaranteed-low interview unexpectedly succeeded');const counterAfter=state.rngCounter;const second=applyForJob(state,'retail_1');equal(second.success,false,'failed application could be retried on the same listing');equal(state.rngCounter,counterAfter,'blocked retry consumed new randomness');equal(actionUsesThisAge(state,'career.application.total'),1,'blocked retry consumed another application slot');
    }
  },
  {
    name:'wellness actions cannot be spammed into unlimited same-year stat gains',
    run:()=>{
      const state=highStatAdult('wellness-spam');state.health.fitness=30;const before=state.health.fitness;assert(performWellnessActivity(state,'gym').success,'first gym action failed');equal(performWellnessActivity(state,'gym').success,false,'same wellness activity could be repeated in one year');assert(performWellnessActivity(state,'running').success,'second distinct wellness activity failed');assert(performWellnessActivity(state,'walking').success,'third distinct wellness activity failed');equal(performWellnessActivity(state,'meditation').success,false,'fourth major wellness activity exceeded yearly time budget');assert(state.health.fitness<=before+14,'wellness spam produced excessive same-year gains');state.character.age+=1;assert(performWellnessActivity(state,'gym').success,'wellness allowance did not reset after aging');
    }
  },
  {
    name:'relationship interactions have per-person and per-action yearly limits',
    run:()=>{
      const state=highStatAdult('social-spam');const npc=makeChild(state,'friend-spam',25);npc.parentIds=[];state.npcs[npc.id]=npc;const rel:Relationship={id:'friend-spam-rel',npcId:npc.id,type:'friend',score:50,attraction:0,compatibility:70,yearsKnown:3};state.relationships.push(rel);
      assert(interactWithNpc(state,npc.id,'conversation').success,'first conversation failed');equal(interactWithNpc(state,npc.id,'conversation').success,false,'same interaction could be farmed repeatedly');assert(interactWithNpc(state,npc.id,'compliment').success,'second distinct interaction failed');assert(interactWithNpc(state,npc.id,'spend_time').success,'third distinct interaction failed');equal(interactWithNpc(state,npc.id,'apologize').success,false,'fourth major interaction with same NPC exceeded yearly time budget');
    }
  },
  {
    name:'publicity income cannot be rerolled indefinitely in one year',
    run:()=>{
      const state=highStatAdult('fame-spam');state.fame.fame=80;state.finances.cash=1000;assert(fameActivity(state,'endorsement').success,'first endorsement failed');const after=state.finances.cash;equal(fameActivity(state,'endorsement').success,false,'endorsement could be repeated in the same year');equal(state.finances.cash,after,'blocked endorsement still changed cash');assert(fameActivity(state,'interview').success,'second distinct publicity action failed');equal(fameActivity(state,'commercial').success,false,'third major publicity action exceeded yearly opportunity budget');
    }
  },
  {
    name:'time-intensive business progression is limited per year',
    run:()=>{
      const state=highStatAdult('business-spam');state.finances.cash=2_000_000;assert(startBusiness(state,'software','First Studio').success,'first company startup failed');equal(startBusiness(state,'software','Second Studio').success,false,'multiple companies could be founded in the same year');const business=state.businesses[0];assert(business,'business missing after startup');assert(addBusinessProduct(state,business.id).success,'first product launch failed');equal(addBusinessProduct(state,business.id).success,false,'same business could launch multiple major products in one year');
    }
  },
  {
    name:'property renovation has a real cooldown and no instant net-worth arbitrage',
    run:()=>{
      const state=highStatAdult('renovation-spam');state.finances.cash=100_000;state.assets.properties=[{id:'reno-home',typeId:'starter_house_standard',name:'Reno Home',location:state.character.city,purchasePrice:100000,marketValue:100000,condition:50,age:10,amenities:[]}];const before=netWorth(state);assert(renovateProperty(state,'reno-home').success,'first renovation failed');assert(netWorth(state)<before,'renovation created guaranteed immediate net-worth profit');equal(renovateProperty(state,'reno-home').success,false,'property could be renovated twice at the same age');state.character.age+=1;equal(renovateProperty(state,'reno-home').success,false,'renovation cooldown expired after only one year');state.character.age+=1;assert(renovateProperty(state,'reno-home').success,'renovation remained blocked after cooldown elapsed');
    }
  },
  {
    name:'collectible hunting cannot reroll the same item indefinitely in one year',
    run:()=>{
      const state=highStatAdult('collectible-spam');state.finances.cash=10_000_000;const item='collectible_jewelry_7';const first=buyCollectible(state,item);assert(first.success,'first collectible purchase failed');const count=state.assets.collectibles.length;equal(buyCollectible(state,item).success,false,'same collectible could be rerolled repeatedly');equal(state.assets.collectibles.length,count,'blocked collectible attempt still created an item');
    }
  },
  {
    name:'failed-but-executed engine actions still emit their mutated state',
    run:()=>{
      const g=globalThis as unknown as {localStorage?:Storage};if(!g.localStorage)Object.defineProperty(globalThis,'localStorage',{value:{length:0,clear(){},getItem(){return null;},key(){return null;},removeItem(){},setItem(){}},configurable:true});
      const state=highStatAdult('engine-failed-outcome');state.character.stats.intelligence=0;state.character.secondary.charisma=25;state.character.secondary.discipline=20;state.character.secondary.reputation=0;const engine=new GameEngine(state);let emits=0;engine.subscribe(()=>{emits+=1;});const result=engine.applyForJob('retail_1');equal(result.success,false,'low interview unexpectedly succeeded');equal(emits,1,'failed outcome mutated state without notifying engine subscribers');equal(actionUsesThisAge(state,'career.application.total'),1,'failed engine action did not persist its consumed attempt');
    }
  },
  {
    name:'annual salary is credited once with predictable baseline expenses',
    run:()=>{
      const state=highStatAdult('finance-once');state.character.age=30;state.currentYear=2056;state.finances.cash=1000;state.finances.liabilities=[];state.assets={properties:[],vehicles:[],collectibles:[]};state.businesses=[];state.pets=[];state.relationships=state.relationships.filter(r=>r.type!=='child');
      state.economy.inflationIndex=1;state.economy.salaryIndex=1;state.employment.current={jobId:'test',title:'Tester',company:'Test Co',startAge:30,salary:50000,performance:60,level:1};
      const country=countryById[state.character.countryId];const taxes=Math.round(50000*(country?.taxRate??.24));const baseline=15500+30*90;const lifestyle=Math.round((50000-taxes)*.07);const expected=1000+50000-baseline-lifestyle-taxes;
      processAnnualFinance(state);approx(state.finances.cash,expected,.01,'annual cash flow is not salary minus baseline and taxes');equal(state.finances.annualIncome,50000,'annual income double-counted salary');
    }
  },
  {
    name:'adult dating does not generate minor partners',
    run:()=>{
      for(let i=0;i<25;i++){const state=highStatAdult(`adult-dating-${i}`);state.character.age=18;const before=new Set(Object.keys(state.npcs));assert(meetPotentialPartner(state).success,'dating action did not complete');const added=Object.values(state.npcs).find(n=>!before.has(n.id));assert(added,'dating action did not add NPC');assert(added.age>=18,`adult dating generated age ${added.age}`);}
    }
  },
  {
    name:'biological parenting rejects an underage partner',
    run:()=>{
      const state=highStatAdult('parent-age');state.character.age=18;const npc=makeChild(state,'young-partner',15);npc.parentIds=[];state.npcs[npc.id]=npc;state.relationships.push({id:'young-rel',npcId:npc.id,type:'partner',score:90,attraction:90,compatibility:90,yearsKnown:2});
      equal(haveChild(state,npc.id,false).success,false,'underage partner was allowed on biological parenting path');
    }
  },
  {
    name:'biological parenting creates a one-year pregnancy and blocks same-year retry spam',
    run:()=>{
      let state:GameState|undefined;let partner:Npc|undefined;
      for(let i=0;i<40;i++){
        const candidate=highStatAdult(`pregnancy-${i}`);candidate.character.age=24;candidate.currentYear=2050;candidate.character.secondary.fertility=100;
        const npc=makeChild(candidate,`pregnancy-partner-${i}`,25);npc.parentIds=[];npc.fertility=100;candidate.npcs[npc.id]=npc;candidate.relationships.push({id:`pregnancy-rel-${i}`,npcId:npc.id,type:'spouse',score:95,attraction:90,compatibility:95,yearsKnown:4});
        const result=haveChild(candidate,npc.id,false);if(result.success){state=candidate;partner=npc;break;}
      }
      assert(state&&partner,'could not produce deterministic successful pregnancy setup');
      assert(state.familyPlanning.pregnancy,'successful parenting attempt did not create pregnancy state');equal(state.relationships.filter(rel=>rel.type==='child').length,0,'pregnancy created an immediate child instead of waiting a year');
      equal(haveChild(state,partner.id,false).success,false,'second parenting attempt in the same year was allowed');
      state.character.age+=1;state.currentYear+=1;processFamilyPlanningYear(state);const children=state.relationships.filter(rel=>rel.type==='child');assert(children.length>=1&&children.length<=3,'pregnancy did not resolve into a valid birth');assert(children.every(rel=>state!.npcs[rel.npcId]?.age===0),'newborns were not age zero at birth');assert(!state.familyPlanning.pregnancy,'pregnancy state remained after birth');
    }
  },
  {
    name:'autonomous close-family NPCs can build linked careers, partnerships and descendants',
    run:()=>{
      const state=createNewGame({seed:'npc-seed-4'});state.character.age=22;state.currentYear=2048;
      const sibling:Npc={id:'autonomous-sibling',firstName:'Sam',lastName:state.character.lastName,age:22,alive:true,health:95,happiness:80,wealth:10000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:100,maritalStatus:'single',traits:['romantic','responsible','ambitious'],hiddenOpinion:60,memories:[],parentIds:[],childIds:[]};
      state.npcs[sibling.id]=sibling;state.relationships.push({id:'autonomous-sibling-rel',npcId:sibling.id,type:'sibling',score:80,attraction:0,compatibility:70,yearsKnown:22});
      for(let year=0;year<25;year++){state.currentYear+=1;state.character.age+=1;ageNpcs(state);}
      assert(sibling.careerId&&jobById[sibling.careerId],`autonomous NPC career is not a real job id: ${String(sibling.careerId)}`);assert(sibling.partnerId,'autonomous family NPC never formed a linked partnership');
      const partner=state.npcs[sibling.partnerId];assert(partner&&partner.partnerId===sibling.id,'autonomous partnership is not bidirectionally linked');assert(sibling.childIds.length>0,'autonomous married family NPC never formed a descendant');
      const childId=sibling.childIds[0]!;const child=state.npcs[childId];assert(child&&child.parentIds.includes(sibling.id)&&child.parentIds.includes(partner.id),'autonomous child has broken parent links');assert(state.relationships.some(rel=>rel.npcId===childId&&rel.type==='niece_nephew'),'sibling child was not derived as niece/nephew relation');
    }
  },
  {
    name:'player romantic partners are protected from autonomous matchmaking',
    run:()=>{
      const state=highStatAdult('protected-romance');const spouse=makeChild(state,'protected-spouse',25);spouse.parentIds=[];spouse.maritalStatus='married';spouse.traits=['romantic','reckless'];state.npcs[spouse.id]=spouse;state.relationships.push({id:'protected-spouse-rel',npcId:spouse.id,type:'spouse',score:80,attraction:80,compatibility:80,yearsKnown:4});
      for(let year=0;year<20&&spouse.alive;year++){state.currentYear+=1;state.character.age+=1;ageNpcs(state);assert(!spouse.partnerId,'player spouse was autonomously assigned another partner');}
    }
  },
  {
    name:'delayed romantic consequences preserve the exact NPC target across years',
    run:()=>{
      const state=highStatAdult('delayed-romance-target');const spouse=makeChild(state,'delayed-spouse',25);spouse.parentIds=[];spouse.firstName='Morgan';spouse.maritalStatus='married';state.npcs[spouse.id]=spouse;
      const spouseRel:Relationship={id:'delayed-spouse-rel',npcId:spouse.id,type:'spouse',score:82,attraction:85,compatibility:78,yearsKnown:5};state.relationships.push(spouseRel);
      const other=makeChild(state,'unrelated-friend',25);other.parentIds=[];state.npcs[other.id]=other;const otherRel:Relationship={id:'unrelated-friend-rel',npcId:other.id,type:'friend',score:70,attraction:0,compatibility:70,yearsKnown:3};state.relationships.push(otherRel);
      assert(forceEvent(state,'romance_boundary_crossed').success,'could not force romantic consequence origin event');assert(state.pendingEvent?.payload?.npcId===spouse.id,'origin event did not target the only romantic NPC');assert(state.pendingEvent.description.includes('Morgan'),'target name was not rendered into event text');
      assert(resolvePendingEvent(state,'hide').success,'origin event choice failed');const queued=state.delayedEvents.find(d=>d.eventId==='delayed_affair_discovery');assert(queued,'romantic consequence was not queued');equal(queued.payload?.npcId,spouse.id,'queued consequence lost romantic target');equal(queued.dueAge,28,'queued romantic consequence has wrong due age');
      const otherBefore=otherRel.score;state.character.age=28;state.currentYear=2054;const delayed=processDelayedEvents(state);assert(delayed&&delayed.eventId==='delayed_affair_discovery','due romantic consequence did not surface');equal(delayed.payload?.npcId,spouse.id,'surfaced romantic consequence changed target');state.pendingEvent=delayed;const spouseBefore=spouseRel.score;assert(resolvePendingEvent(state,'confess').success,'delayed romantic resolution failed');equal(spouseRel.score,spouseBefore-18,'delayed romantic effect did not apply to exact spouse');equal(otherRel.score,otherBefore,'delayed romantic effect leaked to unrelated NPC');
    }
  },
  {
    name:'delayed NPC consequences cancel when the required relationship no longer exists',
    run:()=>{
      const state=highStatAdult('delayed-cancel');const partner=makeChild(state,'cancel-partner',25);partner.parentIds=[];state.npcs[partner.id]=partner;const rel:Relationship={id:'cancel-rel',npcId:partner.id,type:'partner',score:75,attraction:80,compatibility:75,yearsKnown:3};state.relationships.push(rel);
      forceEvent(state,'romance_boundary_crossed');resolvePendingEvent(state,'hide');assert(state.delayedEvents.some(d=>d.eventId==='delayed_affair_discovery'),'test failed to queue delayed consequence');rel.type='ex';partner.maritalStatus='divorced';state.character.age=28;
      equal(processDelayedEvents(state),undefined,'invalid romantic consequence still surfaced after breakup');assert(!state.delayedEvents.some(d=>d.eventId==='delayed_affair_discovery'),'cancelled delayed consequence remained in queue');
    }
  },
  {
    name:'non-NPC delayed consequences preserve origin age context',
    run:()=>{
      const state=highStatAdult('delayed-health-context');state.character.age=42;state.currentYear=2068;forceEvent(state,'health_warning_signal');assert(resolvePendingEvent(state,'ignore').success,'health warning ignore choice failed');const queued=state.delayedEvents.find(d=>d.eventId==='delayed_health_warning_return');assert(queued,'health consequence was not queued');equal(queued.payload?.originAge,42,'health consequence lost origin age');state.character.age=44;const delayed=processDelayedEvents(state);assert(delayed,'health consequence did not surface');assert(delayed.description.includes('age 42'),'origin-age token was not rendered in delayed text');
    }
  },
  {
    name:'first delayed-consequence content set wires all five story chains',
    run:()=>{
      const expected:[string,string][]=[['romance_boundary_crossed','delayed_affair_discovery'],['family_favor_request','delayed_family_favor_return'],['health_warning_signal','delayed_health_warning_return'],['work_shortcut_offer','delayed_work_shortcut_audit'],['friend_confidence_shared','delayed_friend_confidence_breach']];
      for(const [origin,follow] of expected){const event=eventById[origin];assert(event,`missing origin consequence event ${origin}`);assert(eventById[follow],`missing delayed follow-up event ${follow}`);assert(event.choices.some(choice=>choice.effects?.schedule?.eventId===follow||choice.outcomes?.some(outcome=>outcome.effects?.schedule?.eventId===follow)),`origin ${origin} does not schedule ${follow}`);}
    }
  },
  {
    name:'state invariants collapse duplicate active spouses',
    run:()=>{
      const state=highStatAdult('duplicate-spouse');const a=makeChild(state,'spouse-a',25),b=makeChild(state,'spouse-b',26);a.parentIds=[];b.parentIds=[];state.npcs[a.id]=a;state.npcs[b.id]=b;
      state.relationships.push({id:'sa',npcId:a.id,type:'spouse',score:80,attraction:80,compatibility:80,yearsKnown:4},{id:'sb',npcId:b.id,type:'spouse',score:80,attraction:80,compatibility:80,yearsKnown:4});
      enforceStateInvariants(state);equal(state.relationships.filter(r=>r.type==='spouse'&&!r.estranged).length,1,'duplicate spouses survived invariant enforcement');
    }
  },
  {
    name:'criminal cases can progress from incident to resolved charge',
    run:()=>{
      const state=highStatAdult('crime-case');state.character.age=25;const options=availableCrimes(state);assert(options.length>0,'no crimes available');
      for(let i=0;i<30&&!state.flags.pendingCharge;i++)commitCrime(state,options[i%options.length]!.id);
      assert(state.flags.pendingCharge,'repeated detected crimes never created a pending charge');resolveLegalCase(state,'public','contest');assert(!state.flags.pendingCharge,'legal resolution left pendingCharge set');assert(state.legal.criminalRecord.length>0,'crime record missing');
    }
  },
  {
    name:'descendant continuation preserves estate assets without duplicating full net worth as cash',
    run:()=>{
      const state=highStatAdult('inheritance-reconcile');state.character.age=60;state.character.alive=false;state.finances.cash=100000;
      state.assets.properties=[{id:'home',typeId:'starter_house_standard',name:'Family House',location:state.character.city,purchasePrice:500000,marketValue:500000,condition:80,age:20,amenities:[],mortgageId:'mortgage'}];
      state.finances.liabilities=[{id:'mortgage',kind:'mortgage',principal:300000,balance:200000,annualRate:.05,annualPayment:20000,remainingYears:10,assetId:'home'}];
      const child=makeChild(state,'heir',25);state.npcs[child.id]=child;const childRel:Relationship={id:'heir-rel',npcId:child.id,type:'child',score:85,attraction:0,compatibility:70,yearsKnown:25};state.relationships.push(childRel);
      const estateBefore=netWorth(state);assert(estateBefore>=390000&&estateBefore<=410000,'test estate setup is wrong');
      const result=continueAsChild(state,child.id);assert(result.success,'continuation failed');
      assert(state.finances.cash<=100000.01,'heir received retained property value again as cash');assert(state.assets.properties.some(p=>p.id==='home'),'inherited property disappeared');assert(state.finances.liabilities.some(l=>l.id==='mortgage'),'inherited mortgage disappeared');
      assert(state.relationships.some(r=>r.type==='parent'),'continued child lost parent relationship history');
    }
  },
  {
    name:'multi-heir estate settlement divides investments and retained assets instead of gifting everything to the selected child',
    run:()=>{
      const state=highStatAdult('multi-heir-estate');state.character.age=70;state.character.alive=false;state.finances.cash=300000;state.finances.liabilities=[];
      state.assets={properties:[{id:'legacy-home',typeId:'starter_house_standard',name:'Legacy Home',location:state.character.city,purchasePrice:300000,marketValue:300000,condition:82,age:30,amenities:[]}],vehicles:[],collectibles:[]};
      state.investments.positions=[{securityId:'aurora_index',units:1000,averageCost:100}];state.investments.prices['aurora_index']=100;
      const heir=makeChild(state,'heir-a',32),sibling=makeChild(state,'heir-b',29);heir.wealth=40000;sibling.wealth=10000;state.npcs[heir.id]=heir;state.npcs[sibling.id]=sibling;
      state.relationships.push({id:'heir-a-rel',npcId:heir.id,type:'child',score:90,attraction:0,compatibility:75,yearsKnown:32},{id:'heir-b-rel',npcId:sibling.id,type:'child',score:85,attraction:0,compatibility:72,yearsKnown:29});
      state.inheritance.will=[{npcId:heir.id,percentage:50},{npcId:sibling.id,percentage:50}];
      const result=continueAsChild(state,heir.id);assert(result.success,'multi-heir continuation failed');
      assert(state.assets.properties.some(property=>property.id==='legacy-home'),'fairly absorbable retained home was sold unexpectedly');
      approx(state.investments.positions[0]?.units??0,500,.001,'selected heir did not receive only their investment share');
      assert((state.npcs[sibling.id]?.wealth??0)>300000,'sibling did not receive their offscreen estate share');
      assert(state.finances.cash<100000,'selected heir incorrectly received the sibling cash share');
      assert(Number(state.flags.inheritanceReceived)>300000&&Number(state.flags.inheritanceReceived)<400000,'selected inheritance value is outside expected half-estate range');
    }
  },
  {
    name:'continued descendants retain established career spouse and children',
    run:()=>{
      const state=highStatAdult('descendant-existing-life');state.character.age=68;state.character.alive=false;state.finances.cash=50000;const oldGrandparentId=state.relationships.find(rel=>rel.type==='parent')?.npcId;assert(oldGrandparentId,'old generation parent missing');
      const child=makeChild(state,'grown-heir',35);child.careerId='retail_2';child.maritalStatus='married';
      const partner=makeChild(state,'heir-partner',36);partner.parentIds=[];partner.maritalStatus='married';partner.partnerId=child.id;
      const grandchild=makeChild(state,'heir-child',8);grandchild.parentIds=[child.id,partner.id];const greatGrandchild=makeChild(state,'heir-grandchild',1);greatGrandchild.parentIds=[grandchild.id];grandchild.childIds=[greatGrandchild.id];
      child.partnerId=partner.id;child.childIds=[grandchild.id];partner.childIds=[grandchild.id];state.npcs[child.id]=child;state.npcs[partner.id]=partner;state.npcs[grandchild.id]=grandchild;state.npcs[greatGrandchild.id]=greatGrandchild;
      state.relationships.push({id:'grown-heir-rel',npcId:child.id,type:'child',score:88,attraction:0,compatibility:76,yearsKnown:35});
      const result=continueAsChild(state,child.id);assert(result.success,'continuation with established descendant failed');
      equal(state.employment.current?.jobId,'retail_2','descendant career was erased during continuation');
      assert(state.relationships.some(rel=>rel.npcId===partner.id&&rel.type==='spouse'),'descendant spouse was not preserved');
      assert(state.relationships.some(rel=>rel.npcId===grandchild.id&&rel.type==='child'),'descendant child was not preserved');assert(state.relationships.some(rel=>rel.npcId===greatGrandchild.id&&rel.type==='grandchild'),'descendant grandchild was not derived');assert(state.relationships.some(rel=>rel.npcId===oldGrandparentId&&rel.type==='grandparent'),'previous generation parent was not derived as a grandparent');
    }
  },
  {
    name:'wealthy NPC parents can leave inheritance directly to the player character',
    run:()=>{
      const state=highStatAdult('parent-inheritance');const parentRel=state.relationships.find(rel=>rel.type==='parent');assert(parentRel,'generated life has no parent');const parent=state.npcs[parentRel.npcId];assert(parent,'parent NPC missing');
      parent.wealth=200000;parent.age=110;parent.health=0;const before=state.finances.cash;
      for(let i=0;i<20&&parent.alive;i++)ageNpcs(state);
      assert(!parent.alive,'elderly test parent did not die');assert(state.finances.cash>before,'player received no cash inheritance from parent');assert(Number(state.flags.lifetimeInheritance??0)>0,'parent inheritance was not tracked for wealth diagnostics');assert(Number(state.flags.inheritances??0)>=1,'inheritance count did not advance');
    }
  },
  {
    name:'three-generation continuation preserves lineage without estate duplication',
    run:()=>{
      const state=highStatAdult('three-generation-thread');state.character.age=62;state.character.alive=false;state.finances.cash=120000;
      const firstHeir=makeChild(state,'generation-two',30);state.npcs[firstHeir.id]=firstHeir;state.relationships.push({id:'g2-rel',npcId:firstHeir.id,type:'child',score:90,attraction:0,compatibility:80,yearsKnown:30});
      assert(continueAsChild(state,firstHeir.id).success,'first generational handoff failed');equal(state.legacy.generation,2,'first handoff did not advance generation');const founderId=state.relationships.find(rel=>rel.type==='parent')?.npcId;assert(founderId,'founder was not preserved as parent NPC');
      state.character.age=55;state.character.alive=false;state.finances.cash=90000;const secondHeir=makeChild(state,'generation-three',24);secondHeir.parentIds=[state.character.id];state.npcs[secondHeir.id]=secondHeir;state.relationships.push({id:'g3-rel',npcId:secondHeir.id,type:'child',score:88,attraction:0,compatibility:78,yearsKnown:24});
      assert(continueAsChild(state,secondHeir.id).success,'second generational handoff failed');equal(state.legacy.generation,3,'second handoff did not advance generation');assert(state.relationships.some(rel=>rel.npcId===founderId&&rel.type==='grandparent'),'founder was not derived as third-generation grandparent');equal(validateState(state).length,0,'third-generation state violates invariants');
    }
  },
  {
    name:'wealth-source breakdown reconciles exactly to net worth',
    run:()=>{
      const state=highStatAdult('wealth-reconcile');state.finances.cash=12345;state.assets.properties=[{id:'equity-home',typeId:'starter_house_standard',name:'Equity Home',location:state.character.city,purchasePrice:200000,marketValue:180000,condition:80,age:12,amenities:[],mortgageId:'equity-mortgage'}];state.finances.liabilities=[{id:'equity-mortgage',kind:'mortgage',principal:220000,balance:190000,annualRate:.05,annualPayment:15000,remainingYears:20,assetId:'equity-home'},{id:'other-debt',kind:'personal',principal:5000,balance:5000,annualRate:.1,annualPayment:1000,remainingYears:5}];
      const wealth=wealthBreakdown(state);const recomposed=wealth.cash+wealth.propertyEquity+wealth.vehicles+wealth.collectibles+wealth.investments+wealth.businesses-wealth.otherLiabilities;approx(recomposed,wealth.netWorth,.01,'wealth-source components do not reconcile to net worth');assert(wealth.propertyEquity<0,'underwater property equity was incorrectly hidden as zero');
    }
  },
  {
    name:'identical seeded action histories serialize identically including runtime IDs',
    run:()=>{
      const play=(seed:string)=>{const state=createNewGame({seed});for(let year=0;year<50&&state.character.alive;year++){const result=ageUp(state);assert(result.success,`age-up failed at year ${year}`);if(state.pendingEvent){const choice=state.pendingEvent.choices[0];assert(choice,'pending replay event has no choice');resolvePendingEvent(state,choice.id);finalizeAgeUp(state);}}return state;};
      const a=play('exact-replay-seed'),b=play('exact-replay-seed');equal(JSON.stringify(a),JSON.stringify(b),'identical seeded histories produced different serialized states');equal(a.idCounter,b.idCounter,'deterministic ID counters diverged');
    }
  },
  {
    name:'state-scoped runtime IDs remain unique across a long generated life',
    run:()=>{
      const state=createNewGame({seed:'id-uniqueness'});for(let year=0;year<75&&state.character.alive;year++){ageUp(state);if(state.pendingEvent){resolvePendingEvent(state,state.pendingEvent.choices[0]!.id);finalizeAgeUp(state);}}
      const ids=[...Object.keys(state.npcs),...state.relationships.map(x=>x.id),...state.timeline.map(x=>x.id),...state.delayedEvents.map(x=>x.id),...state.businesses.map(x=>x.id),...state.pets.map(x=>x.id),...state.finances.liabilities.map(x=>x.id),...state.health.conditions.map(x=>x.id)];equal(new Set(ids).size,ids.length,'duplicate runtime IDs were generated');
    }
  },
  {
    name:'rewind migrates legacy snapshots before restoring them',
    run:()=>{
      const state=createNewGame({seed:'legacy-rewind',rewindEnabled:true});ageUp(state);if(state.pendingEvent){resolvePendingEvent(state,state.pendingEvent.choices[0]!.id);finalizeAgeUp(state);}assert(state.yearlySnapshots.length>0,'rewind snapshot was not created');const snapshot=JSON.parse(state.yearlySnapshots[0]!.state) as Record<string,unknown>;snapshot.saveVersion=3;delete snapshot.idCounter;delete snapshot.familyPlanning;state.yearlySnapshots[0]!.state=JSON.stringify(snapshot);const result=rewindToAge(state,state.yearlySnapshots[0]!.age);assert(result.success,'legacy snapshot rewind failed');equal(state.saveVersion,6,'rewind did not migrate snapshot to schema v6');assert(Number.isFinite(state.idCounter),'rewound state has no deterministic ID counter');assert(state.familyPlanning,'rewound state has no family-planning state');
    }
  },
  {
    name:'save migrations restore current required structures',
    run:()=>{
      const current=createNewGame({seed:'migration'});const legacy=structuredClone(current) as GameState;legacy.saveVersion=1;delete (legacy as unknown as {travel?:unknown}).travel;delete (legacy as unknown as {inheritance?:unknown}).inheritance;delete (legacy as unknown as {familyPlanning?:unknown}).familyPlanning;legacy.yearlySnapshots=[];
      const migrated=migrateSave(legacy);equal(migrated.saveVersion,6,'save did not migrate to version 6');assert(Number.isFinite(migrated.idCounter)&&migrated.idCounter>=10000,'v3→v4 migration did not initialize deterministic id counter');assert(migrated.travel,'travel state missing after migration');assert(migrated.inheritance,'inheritance state missing after migration');assert(migrated.familyPlanning,'family-planning state missing after migration');assert(migrated.actionLedger,'action ledger missing after migration');equal(validateState(migrated).length,0,'migrated save violates invariants');
    }
  },
  {
    name:'v5 migration preserves consumed yearly actions in the central ledger',
    run:()=>{
      const legacy=highStatAdult('action-ledger-migration');legacy.saveVersion=5;legacy.flags.lastWorkHarderAge=legacy.character.age;legacy.flags.lastRaiseRequestAge=legacy.character.age;delete (legacy as unknown as {actionLedger?:unknown}).actionLedger;const migrated=migrateSave(legacy);equal(migrated.saveVersion,6,'v5 save did not migrate to schema v6');equal(actionUsesThisAge(migrated,'career.work_harder'),1,'legacy work-effort use was lost');equal(actionUsesThisAge(migrated,'career.raise'),1,'legacy raise use was lost');equal(actionAllowed(migrated,{policy:'career.work_harder'}),false,'migrated save allowed a duplicate yearly work action');
    }
  },
  {
    name:'v4 migration repairs the runaway salary exploit and impossible senior role',
    run:()=>{
      const legacy=highStatAdult('salary-repair');legacy.saveVersion=4;delete (legacy as unknown as {familyPlanning?:unknown}).familyPlanning;legacy.character.age=20;legacy.currentYear=2046;legacy.finances.cash=1_015_749_743_505_505;legacy.finances.lastYearSummary={income:1_389_534_533_074_026,expenses:165_354_609_608_167,taxes:208_430_179_961_104,investmentReturn:0,businessProfit:0,netChange:1_015_749_743_504_755};legacy.employment.current={jobId:'real_estate_6',title:'Real Estate Executive',company:'Summit Labs',startAge:20,salary:1_389_534_533_074_026,performance:97,level:6};
      const migrated=migrateSave(legacy);assert((migrated.employment.current?.salary??Infinity)<250_000,'runaway salary was not repaired during v4→v5 migration');equal(migrated.employment.current?.jobId,'real_estate_1','impossible level-six role was not repaired to an experience-appropriate role');equal(migrated.finances.cash,750,'obvious exploit-year cash was not reverted to the pre-year balance');assert(!migrated.finances.lastYearSummary,'corrupted exploit-year financial summary was retained');assert(Boolean(migrated.flags.compensationRepairApplied),'salary repair was not recorded');assert(Boolean(migrated.flags.compensationCashRepairApplied),'cash repair was not recorded');assert(Boolean(migrated.flags.careerProgressionRepairApplied),'career progression repair was not recorded');
    }
  },
  {
    name:'mobile money formatting keeps extreme sandbox values compact',
    run:()=>{
      const label=formatMoney(1_015_749_743_504_755);assert(label.length<=8,`extreme money label is still too wide: ${label}`);assert(label.endsWith('Q'),'quadrillion-scale value did not use compact suffix');equal(formatMoney(686454),'686,454','ordinary six-digit money should remain fully readable');
    }
  },
  {
    name:'mortgage underwriting rejects clearly unaffordable purchases',
    run:()=>{
      const state=highStatAdult('mortgage-affordability');state.character.age=30;state.economy.housingIndex=1;state.finances.cash=50000;state.finances.annualIncome=20000;
      state.employment.current={jobId:'low-income',title:'Clerk',company:'Test Co',startAge:30,salary:20000,performance:60,level:1};
      const result=buyProperty(state,'starter_house_value',true);equal(result.success,false,'unaffordable mortgage was approved');equal(state.assets.properties.length,0,'rejected mortgage still created property');assert(!state.finances.liabilities.some(l=>l.kind==='mortgage'),'rejected mortgage still created liability');
    }
  },
  {
    name:'annual cash shortfalls become structured debt without negative cash',
    run:()=>{
      const state=highStatAdult('cash-shortfall');state.character.age=30;state.currentYear=2056;state.finances.cash=0;state.finances.liabilities=[];state.employment.current=undefined;state.assets={properties:[],vehicles:[],collectibles:[]};state.businesses=[];state.pets=[];state.economy.inflationIndex=1;
      processAnnualFinance(state);equal(state.finances.cash,0,'cash remained negative after shortfall handling');const loan=state.finances.liabilities.find(l=>l.kind==='personal');assert(loan&&loan.balance>0,'shortfall did not create structured personal debt');assert(Number(state.flags.cashShortfallYears)>=1,'shortfall year was not tracked');
    }
  },
  {
    name:'repeated severe shortfalls trigger bankruptcy instead of runaway negative balances',
    run:()=>{
      const state=highStatAdult('bankruptcy-pressure');state.character.age=35;state.currentYear=2061;state.finances.cash=0;state.finances.liabilities=[];state.employment.current=undefined;state.assets={properties:[],vehicles:[],collectibles:[]};state.businesses=[];state.pets=[];state.economy.inflationIndex=1;
      for(let i=0;i<8&&Number(state.flags.bankruptcies??0)===0;i++){processAnnualFinance(state);state.character.age+=1;state.currentYear+=1;assert(state.finances.cash>=0,'shortfall processing produced negative cash');}
      assert(Number(state.flags.bankruptcies??0)>=1,'sustained insolvency never triggered bankruptcy');assert(state.finances.cash>=0,'bankruptcy left negative cash');assert(!state.finances.liabilities.some(l=>l.kind==='personal'&&l.balance>0),'bankruptcy failed to discharge personal debt');
    }
  },
  {
    name:'two sustained mortgage shortfalls can foreclose while preserving residual equity correctly',
    run:()=>{
      const state=highStatAdult('foreclosure-equity');state.character.age=40;state.currentYear=2066;state.finances.cash=0;state.finances.annualIncome=0;state.employment.current=undefined;state.businesses=[];state.pets=[];state.assets={properties:[{id:'home',typeId:'starter_house_standard',name:'Test Home',location:state.character.city,purchasePrice:300000,marketValue:300000,condition:80,age:10,amenities:[],mortgageId:'mortgage'}],vehicles:[],collectibles:[]};state.finances.liabilities=[{id:'mortgage',kind:'mortgage',principal:240000,balance:200000,annualRate:.052,annualPayment:25000,remainingYears:20,assetId:'home'}];state.economy.inflationIndex=1;
      processAnnualFinance(state);state.character.age+=1;state.currentYear+=1;processAnnualFinance(state);
      equal(state.assets.properties.length,0,'property survived foreclosure threshold');assert(!state.finances.liabilities.some(l=>l.id==='mortgage'),'foreclosed mortgage survived');assert(Number(state.flags.foreclosures??0)>=1,'foreclosure was not recorded');assert(state.finances.cash>=0,'foreclosure created negative cash');
      const expectedResidualFloor=50000;assert(state.finances.cash>=expectedResidualFloor||!state.finances.liabilities.some(l=>l.kind==='personal'),'residual equity appears to have been consumed incorrectly');
    }
  },
  {
    name:'people folders separate immediate family, extended relatives, and friends without losing real NPC links',
    run:()=>{
      const state=highStatAdult('people-folders');
      const parent=state.relationships.find(rel=>rel.type==='parent');assert(parent,'test life has no parent');
      const parentNpc=state.npcs[parent.npcId]!;
      const sibling=makeChild(state,'graph-sibling',23);sibling.firstName='Sami';sibling.parentIds=[parentNpc.id];state.npcs[sibling.id]=sibling;parentNpc.childIds.push(sibling.id);state.relationships.push({id:'graph-sibling-rel',npcId:sibling.id,type:'sibling',score:72,attraction:0,compatibility:66,yearsKnown:20});
      const niece=makeChild(state,'graph-niece',3);niece.firstName='Nia';niece.parentIds=[sibling.id];state.npcs[niece.id]=niece;sibling.childIds.push(niece.id);state.relationships.push({id:'graph-niece-rel',npcId:niece.id,type:'niece_nephew',score:60,attraction:0,compatibility:64,yearsKnown:3});
      const friend=makeChild(state,'graph-friend',25);friend.firstName='Jo';friend.parentIds=[];state.npcs[friend.id]=friend;state.relationships.push({id:'graph-friend-rel',npcId:friend.id,type:'friend',score:80,attraction:0,compatibility:75,yearsKnown:5});
      const summaries=peopleFolderSummaries(state);assert((summaries.find(folder=>folder.id==='player_family')?.count??0)>=2,'player-family folder lost parents');equal(summaries.find(folder=>folder.id==='relatives')?.count,2,'extended-relative count is wrong');equal(summaries.find(folder=>folder.id==='friends')?.count,1,'friend folder count is wrong');
      const relatives=buildPeopleRelationshipGraph(state,'relatives');assert(relatives.nodes.some(node=>node.id===sibling.id),'sibling missing from relatives graph');assert(relatives.nodes.some(node=>node.id===niece.id),'niece/nephew missing from relatives graph');assert(relatives.edges.some(edge=>edge.kind==='parent_child'&&edge.from===sibling.id&&edge.to===niece.id),'known sibling→child link was not represented in relatives tree');assert(!relatives.edges.some(edge=>edge.kind==='direct'&&edge.to===niece.id),'niece/nephew received a redundant direct player edge instead of hanging from the known parent');assert(!relatives.nodes.some(node=>node.id===friend.id),'friend leaked into relatives graph');
    }
  },
  {
    name:'relationship graph does not invent NPC-to-NPC links between unrelated friends',
    run:()=>{
      const state=highStatAdult('people-no-invented-links');
      for(const [id,name] of [['friend-a','Ari'],['friend-b','Bea']] as const){const npc=makeChild(state,id,24);npc.firstName=name;npc.parentIds=[];npc.childIds=[];npc.partnerId=undefined;state.npcs[id]=npc;state.relationships.push({id:`${id}-rel`,npcId:id,type:'friend',score:60,attraction:0,compatibility:60,yearsKnown:2});}
      const graph=buildPeopleRelationshipGraph(state,'friends');const npcEdges=graph.edges.filter(edge=>edge.from!==state.character.id&&edge.to!==state.character.id);equal(npcEdges.length,0,'graph invented a relationship between unrelated friends');equal(graph.edges.filter(edge=>edge.kind==='direct').length,2,'friends were not connected directly to the player root');
    }
  },
  {
    name:'minigame score modifies world outcomes without replacing character progression',
    run:()=>{
      const low=highStatAdult('minigame-racing');const high=structuredClone(low);for(const state of [low,high]){state.character.age=24;state.specialCareers.racing={active:true,skill:42,seasons:0};}
      const lowResult=racingAction(low,'race',0);const highResult=racingAction(high,'race',100);const finish=(text:string)=>Number(text.match(/finished (\d+)/)?.[1]??99);const lowFinish=finish(lowResult.messages[0]?.text??'');const highFinish=finish(highResult.messages[0]?.text??'');assert(highFinish<=lowFinish,`higher minigame score worsened identical racing outcome (${lowFinish} -> ${highFinish})`);assert(highFinish-lowFinish<=0,'minigame modifier did not preserve monotonic direction');
    }
  },
  {
    name:'accessibility minigame skip is seeded, bounded, and improves with character skill',
    run:()=>{
      const weak=highStatAdult('minigame-skip');weak.character.talents.acting=10;weak.character.secondary.creativity=10;weak.specialCareers.acting={skill:5};const strong=structuredClone(weak);strong.character.talents.acting=95;strong.character.secondary.creativity=95;strong.specialCareers.acting={skill:90};
      const weakRngBefore=weak.rngCounter;const weakScore=skipMiniGame(weak,'acting',relatedMiniGameSkill(weak,'acting')).score;const strongScore=skipMiniGame(strong,'acting',relatedMiniGameSkill(strong,'acting')).score;equal(weak.rngCounter,weakRngBefore,'accessibility skip mutated core simulation RNG outside the engine action');assert(weakScore>=0&&weakScore<=100&&strongScore>=0&&strongScore<=100,'skip score escaped 0–100 bounds');assert(strongScore>weakScore,`higher character skill did not improve skip resolution (${weakScore} -> ${strongScore})`);
    }
  },
  {
    name:'independent life saves allocate stable non-colliding slot ids',
    run:()=>{
      equal(nextSaveSlotId([]),'slot-1','first save slot should be slot-1');equal(nextSaveSlotId(['slot-1','slot-3']),'slot-2','deleted slot was not safely reusable');equal(nextSaveSlotId(['legacy-name','slot-1','slot-2']),'slot-3','nonstandard imported ids confused slot allocation');
    }
  },
  {
    name:'family legacy showcase can feature a stronger earlier generation and falls back after its save is removed',
    run:()=>{
      const primary=createNewGame({seed:'featured-primary',slotId:'slot-1'});primary.character.age=8;primary.character.stats={health:45,happiness:45,intelligence:45,appearance:45};primary.finances.cash=100;primary.legacy.generation=3;primary.legacy.totalYearsSimulated=150;primary.legacy.totalFamilyWealth=900000;primary.completedLives=[];
      const gen1Char=structuredClone(primary.character);gen1Char.id='featured-gen-1';gen1Char.firstName='Mara';gen1Char.age=70;gen1Char.stats={health:55,happiness:60,intelligence:60,appearance:55};
      const gen2Char=structuredClone(primary.character);gen2Char.id='featured-gen-2';gen2Char.firstName='Ari';gen2Char.age=88;gen2Char.stats={health:90,happiness:92,intelligence:96,appearance:88};
      primary.completedLives.push({id:'life-gen-1',generation:1,character:gen1Char,ageAtDeath:70,cause:'old age',netWorth:120000,career:'Teacher',children:2,fame:8,milestones:['Graduated'],epitaph:'One life.',timeline:[]});
      primary.completedLives.push({id:'life-gen-2',generation:2,character:gen2Char,ageAtDeath:88,cause:'old age',netWorth:2500000,career:'Surgeon',children:3,fame:55,milestones:['Graduated','Married','Career peak','Legacy'],epitaph:'Another life.',timeline:[]});
      const secondary=createNewGame({seed:'featured-secondary',slotId:'slot-2'});secondary.character.firstName='Niko';secondary.character.age=72;secondary.character.stats={health:78,happiness:82,intelligence:84,appearance:76};secondary.finances.cash=600000;secondary.fame.fame=20;secondary.legacy.generation=1;
      const best=featuredLife([primary,secondary]);assert(best,'no featured life was selected');equal(best.lifeId,'life-gen-2','stronger Generation 2 life was not selected over weaker current generations');equal(best.generation,2,'featured completed life lost its generation');
      const fallback=featuredLife([secondary]);assert(fallback,'no fallback life was selected');equal(fallback.slotId,'slot-2','deleting the featured save did not promote the next surviving life');
    }
  },
  {
    name:'procedural market remains finite through a century of updates',
    run:()=>{
      const state=highStatAdult('market-century');for(let i=0;i<100;i++)processMarketYear(state);for(const price of Object.values(state.investments.prices))assert(Number.isFinite(price)&&price>0,'market produced invalid security price');
    }
  },
  {
    name:'multi-life integration smoke run completes without state anomalies',
    run:()=>{
      const report=runSimulation({lives:25,seedPrefix:'regression-sim',maxAge:125});equal(report.completedLives,25,'simulation did not complete requested lives');equal(report.anomalyCount,0,`simulation found ${report.anomalyCount} anomalies`);assert(report.averageLifespan>55&&report.averageLifespan<105,`implausible smoke-run lifespan ${report.averageLifespan}`);assert(report.forcedTerminalDeaths<=1,'too many lives hit terminal age cap');
    }
  },
];

export function runRegressionSuite(cases=regressionCases):RegressionReport{
  const results:RegressionResult[]=[];
  for(const test of cases){try{test.run();results.push({name:test.name,passed:true});}catch(error){results.push({name:test.name,passed:false,error:error instanceof Error?error.message:String(error)});}}
  return {passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results};
}

export function formatRegressionReport(report:RegressionReport){
  const lines=[`Everthread regression suite — ${report.passed} passed, ${report.failed} failed`];
  for(const result of report.results)lines.push(`${result.passed?'PASS':'FAIL'}  ${result.name}${result.error?` — ${result.error}`:''}`);
  return lines.join('\n');
}
