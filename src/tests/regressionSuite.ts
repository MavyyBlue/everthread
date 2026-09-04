import type { GameState, Npc, Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { ageUp, finalizeAgeUp, rewindToAge } from '../systems/AgingSystem';
import { forceEvent, processDelayedEvents, resolvePendingEvent } from '../systems/EventSystem';
import { deathProbability } from '../systems/DeathSystem';
import { enrollProgram } from '../systems/EducationSystem';
import { availableJobs, applyForJob, askForRaise, workHarder } from '../systems/CareerSystem';
import { processAnnualFinance, netWorth, wealthBreakdown } from '../systems/FinanceSystem';
import { buyProperty } from '../systems/PropertySystem';
import { countryById } from '../data/countries';
import { meetPotentialPartner, haveChild, ageNpcs, processFamilyPlanningYear } from '../systems/RelationshipSystem';
import { jobById } from '../data/jobs';
import { eventById } from '../data/events';
import { enforceStateInvariants, validateState } from '../core/invariants';
import { availableCrimes, commitCrime, resolveLegalCase } from '../systems/CrimeSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { migrateSave } from '../services/SaveSystem';
import { processMarketYear } from '../systems/InvestmentSystem';
import { runSimulation } from './simulationHarness';
import { formatMoney } from '../core/format';

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
      const state=highStatAdult('adult-dating');state.character.age=18;
      for(let i=0;i<25;i++){const before=new Set(Object.keys(state.npcs));meetPotentialPartner(state);const added=Object.values(state.npcs).find(n=>!before.has(n.id));assert(added,'dating action did not add NPC');assert(added.age>=18,`adult dating generated age ${added.age}`);}
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
      const state=createNewGame({seed:'legacy-rewind',rewindEnabled:true});ageUp(state);if(state.pendingEvent){resolvePendingEvent(state,state.pendingEvent.choices[0]!.id);finalizeAgeUp(state);}assert(state.yearlySnapshots.length>0,'rewind snapshot was not created');const snapshot=JSON.parse(state.yearlySnapshots[0]!.state) as Record<string,unknown>;snapshot.saveVersion=3;delete snapshot.idCounter;delete snapshot.familyPlanning;state.yearlySnapshots[0]!.state=JSON.stringify(snapshot);const result=rewindToAge(state,state.yearlySnapshots[0]!.age);assert(result.success,'legacy snapshot rewind failed');equal(state.saveVersion,5,'rewind did not migrate snapshot to schema v5');assert(Number.isFinite(state.idCounter),'rewound state has no deterministic ID counter');assert(state.familyPlanning,'rewound state has no family-planning state');
    }
  },
  {
    name:'save migrations restore current required structures',
    run:()=>{
      const current=createNewGame({seed:'migration'});const legacy=structuredClone(current) as GameState;legacy.saveVersion=1;delete (legacy as unknown as {travel?:unknown}).travel;delete (legacy as unknown as {inheritance?:unknown}).inheritance;delete (legacy as unknown as {familyPlanning?:unknown}).familyPlanning;legacy.yearlySnapshots=[];
      const migrated=migrateSave(legacy);equal(migrated.saveVersion,5,'save did not migrate to version 5');assert(Number.isFinite(migrated.idCounter)&&migrated.idCounter>=10000,'v3→v4 migration did not initialize deterministic id counter');assert(migrated.travel,'travel state missing after migration');assert(migrated.inheritance,'inheritance state missing after migration');assert(migrated.familyPlanning,'family-planning state missing after migration');equal(validateState(migrated).length,0,'migrated save violates invariants');
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
