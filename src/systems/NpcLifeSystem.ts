import { countryById } from '../data/countries';
import { illnesses } from '../data/illnesses';
import { jobs, jobById } from '../data/jobs';
import { getNamePool } from '../data/names';
import { schoolProfileFor } from '../data/schools';
import { makeStateId } from '../core/ids';
import { clamp } from '../core/math';
import { createRng, type SeededRng } from '../core/rng';
import { assignNpcIdentity, npcGender, npcReproductiveSex } from './NpcIdentitySystem';
import { assignGeneratedNpcOrientation, pickRomanticTargetGender } from './NpcOrientationSystem';
import { pickCollisionAwareNpcName, resolveCollisionAwareName } from './NpcNamingSystem';
import { reproductivePairAgeFactor, reproductivePairCanConceive } from './ReproductionSystem';
import { ensureNpcAssetPortfolio, npcBusinessValue, npcMortgageDebt, npcNetWorth, processNpcAssetPortfolioYear, syncNpcAssetProjection } from './NpcAssetSystem';
import { settleNpcEstateOnDeath } from './NpcEstateSystem';
import type {
  GameState,
  Npc,
  NpcEducationLifeRecord,
  NpcLifeState,
  Orientation,
  Relationship,
  RelationshipType,
} from '../types/game';

const FAMILY_RELATION_TYPES = new Set<RelationshipType>([
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew',
]);
const PLAYER_ROMANTIC_TYPES = new Set<RelationshipType>(['partner','fiance','spouse']);
const POST_SECONDARY_CREDENTIALS = [
  'trade_school','business','communications','computer_science','education','engineering','finance','nursing','psychology','science','art','english','history','political_science','architecture',
] as const;
const PROFESSIONAL_CREDENTIALS = ['graduate_school','law_school','medical_school','dental_school','veterinary_school'] as const;

function directRelationship(state:GameState,npcId:string){return state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged);}
function isPlayerFamily(state:GameState,npcId:string){const type=directRelationship(state,npcId)?.type;return Boolean(type&&FAMILY_RELATION_TYPES.has(type));}
function hasPlayerRomance(state:GameState,npcId:string){if(!state.character.alive)return false;const type=directRelationship(state,npcId)?.type;return Boolean(type&&PLAYER_ROMANTIC_TYPES.has(type));}

export function npcHealthIsTerminal(npc:Pick<Npc,'health'>){return npc.health<=0;}

export function repairLegacyLivingNpcHealth(state:GameState){
  let repaired=0;
  for(const npc of Object.values(state.npcs??{})){
    if(npc.alive&&Number.isFinite(npc.health)&&npcHealthIsTerminal(npc)){npc.health=1;repaired+=1;}
  }
  return repaired;
}

export function syncNpcHouseholdProjection(state:GameState,npc:Npc){
  const life=npc.life;if(!life||!npc.alive)return;
  if(npc.partnerId===state.character.id)npc.partnerId=undefined;
  life.household.dependents=npc.childIds.filter(id=>state.npcs[id]?.alive&&state.npcs[id]!.age<18).length;
  if(npc.imprisoned||life.legal.sentenceRemaining>0){life.household.status='institutional';life.finance.housing='institutional';return;}
  if(npc.age<18){life.household.status='dependent';life.finance.housing='family';return;}
  const partnered=Boolean(npc.partnerId)||hasPlayerRomance(state,npc.id);
  life.household.status=partnered?'partnered':'independent';
  if(life.finance.propertyValue>0){life.finance.housing='owning';return;}
  if(partnered){life.finance.housing='shared';return;}
  if(['family','shared','institutional','owning'].includes(life.finance.housing))life.finance.housing='renting';
}

function relationshipIsMeaningful(state:GameState,npcId:string){
  const rel=directRelationship(state,npcId);
  return Boolean(rel&&(
    FAMILY_RELATION_TYPES.has(rel.type)||
    ['friend','best_friend','enemy','partner','fiance','spouse','ex'].includes(rel.type)||
    rel.score>=72
  ));
}
function timelineRelevant(state:GameState,npcId:string){
  const rel=directRelationship(state,npcId);
  return Boolean(rel&&(FAMILY_RELATION_TYPES.has(rel.type)||['best_friend','partner','fiance','spouse'].includes(rel.type)||rel.score>=82));
}

function addNpcMemory(state:GameState,npc:Npc,kind:string,sentiment:number,summary:string,permanent=false){
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent});
  if(npc.memories.length>36){
    const permanentMemories=npc.memories.filter(memory=>memory.permanent);
    const recent=npc.memories.filter(memory=>!memory.permanent).slice(-Math.max(0,36-permanentMemories.length));
    npc.memories=[...permanentMemories.slice(-18),...recent].slice(-36);
  }
}

function boundedHistory<T>(items:T[],limit:number){if(items.length>limit)items.splice(0,items.length-limit);}
function medianJobIncome(state:GameState,npc:Npc){const job=npc.careerId?jobById[npc.careerId]:undefined;return job?Math.round(((job.salaryRange[0]+job.salaryRange[1])/2)*state.economy.salaryIndex):0;}
function schoolInstitution(npc:Npc,label:string){return `${npc.city} ${label}`;}

function credentialStage(credential:string){
  if(credential==='trade_school')return 'trade';
  if(PROFESSIONAL_CREDENTIALS.includes(credential as typeof PROFESSIONAL_CREDENTIALS[number]))return credential==='graduate_school'?'graduate':'professional';
  return 'university';
}
function credentialYears(credential:string){
  if(credential==='trade_school')return 2;
  if(credential==='graduate_school')return 2;
  if(['medical_school','dental_school','veterinary_school','law_school'].includes(credential))return 4;
  return 4;
}

function inferredEducationRecords(state:GameState,npc:Npc,rng:SeededRng,aptitude:number):NpcEducationLifeRecord[]{
  const records:NpcEducationLifeRecord[]=[];
  const profile=schoolProfileFor(npc.countryId);
  for(const stage of profile.stages){
    if(npc.age<stage.startAge)continue;
    const graduated=npc.age>=stage.endAge;
    records.push({stage:stage.stage,institution:schoolInstitution(npc,stage.label),startAge:stage.startAge,...(graduated?{endAge:stage.endAge}:{}),graduated,performance:clamp(40+aptitude*.45+rng.int(-12,12))});
    if(!graduated)return records;
  }
  if(npc.age<18)return records;
  const job=npc.careerId?jobById[npc.careerId]:undefined;
  let credential=job?.educationRequirement&&job.educationRequirement!=='secondary'&&job.educationRequirement!=='pilot_license'?job.educationRequirement:undefined;
  if(!credential&&aptitude>=58&&rng.chance(clamp((aptitude-45)/100,.12,.62))){
    credential=rng.pick(POST_SECONDARY_CREDENTIALS);
    if(aptitude>=82&&npc.age>=24&&rng.chance(.18))credential=rng.pick(PROFESSIONAL_CREDENTIALS);
  }
  if(credential){
    const years=credentialYears(credential);const startAge=18;const forcedByCareer=Boolean(job&&job.educationRequirement===credential);
    const graduated=forcedByCareer||npc.age>=startAge+years;
    records.push({stage:credentialStage(credential),institution:`${npc.city} Institute`,startAge,...(graduated?{endAge:startAge+years}:{}),graduated,performance:clamp(45+aptitude*.45+rng.int(-8,10)),credential});
  }
  return records;
}

export function buildNpcLifeState(state:GameState,npc:Npc):NpcLifeState{
  const rng=createRng(`${state.seed}-npc-life-${npc.id}`);
  const aptitude=clamp(rng.int(28,88)+(npc.traits.includes('curious')?7:0)+(npc.traits.includes('ambitious')?4:0));
  const records=inferredEducationRecords(state,npc,rng,aptitude);
  const credential=[...records].reverse().find(record=>record.graduated&&record.credential)?.credential;
  const careerHistory=npc.careerId?[{jobId:npc.careerId,startAge:Math.max(jobById[npc.careerId]?.minAge??18,npc.age-rng.int(1,Math.max(1,Math.min(12,npc.age-17))))}]:[];
  const income=medianJobIncome(state,npc);
  const propertyValue=npc.simulationTier!=='background'&&npc.age>=28&&npc.wealth>45000&&rng.chance(.36)?Math.round(Math.min(npc.wealth*.9,350000)*rng.int(70,115)/100):0;
  const debt=propertyValue?Math.round(propertyValue*rng.int(20,65)/100):npc.age>=22&&npc.wealth<12000&&rng.chance(.22)?rng.int(500,12000):0;
  const fame=npc.famous?rng.int(25,55):rng.int(0,8);
  const sentenceRemaining=npc.imprisoned?rng.int(1,3):0;
  const partnered=Boolean(npc.partnerId)||hasPlayerRomance(state,npc.id);
  const housing=npc.imprisoned?'institutional':npc.age<18?'family':propertyValue>0?'owning':partnered?'shared':'renting';
  return {
    aptitude,
    education:{records,performance:records.at(-1)?.performance??clamp(40+aptitude*.4),credential},
    career:{history:careerHistory,careerYears:careerHistory.length?Math.max(0,npc.age-careerHistory[0]!.startAge):0,retired:npc.age>=67&&!npc.careerId},
    finance:{annualIncome:income,debt,propertyValue,housing,creditStress:clamp(debt>Math.max(1,npc.wealth)?55:debt?28:8)},
    health:{conditions:[],fitness:clamp(35+rng.int(-8,35)-(Math.max(0,npc.age-55)*.35)),wellness:clamp((npc.health+npc.happiness)/2)},
    legal:{incidents:[],sentenceRemaining,recordSeverity:sentenceRemaining?35:0},
    publicLife:{fame,reputation:clamp(48+rng.int(-12,18)),followers:Math.round(fame*fame*35),scandals:0},
    household:{status:npc.imprisoned?'institutional':npc.age<18?'dependent':partnered?'partnered':'independent',moves:0,dependents:npc.childIds.filter(id=>state.npcs[id]?.alive&&state.npcs[id]!.age<18).length},
  };
}

export function ensureNpcLife(state:GameState,npc:Npc):NpcLifeState{
  assignNpcIdentity(state,npc);
  npc.life??=buildNpcLifeState(state,npc);
  npc.life.education.records??=[];
  npc.life.career.history??=[];
  npc.life.health.conditions??=[];
  npc.life.legal.incidents??=[];
  npc.life.finance.annualIncome=Number.isFinite(npc.life.finance.annualIncome)?npc.life.finance.annualIncome:medianJobIncome(state,npc);
  ensureNpcAssetPortfolio(state,npc);
  syncNpcHouseholdProjection(state,npc);
  return npc.life;
}

export function initializeMissingNpcLives(state:GameState){for(const npc of Object.values(state.npcs))ensureNpcLife(state,npc);}

function educationRequirementSatisfied(npc:Npc,requirement:string){
  if(requirement==='secondary')return npc.life!.education.records.some(record=>record.stage==='secondary'&&record.graduated);
  if(requirement==='pilot_license')return npc.life!.aptitude>=68;
  return npc.life!.education.records.some(record=>record.graduated&&record.credential===requirement);
}

function startEducationRecord(npc:Npc,stage:string,institution:string,startAge:number,credential?:string){
  if(npc.life!.education.records.some(record=>record.stage===stage&&record.startAge===startAge&&record.credential===credential))return;
  npc.life!.education.records.push({stage,institution,startAge,graduated:false,performance:npc.life!.education.performance,...(credential?{credential}:{})});
  boundedHistory(npc.life!.education.records,8);
}

function processNpcEducationYear(state:GameState,npc:Npc,rng:SeededRng){
  const life=npc.life!;const profile=schoolProfileFor(npc.countryId);const current=life.education.records.find(record=>!record.graduated&&record.endAge===undefined);
  if(current){
    const schoolStage=profile.stages.find(stage=>stage.stage===current.stage);
    const endAge=schoolStage?.endAge??(current.credential?current.startAge+credentialYears(current.credential):undefined);
    life.education.performance=clamp(life.education.performance+rng.int(-3,4)+(npc.traits.includes('responsible')?2:0)+(npc.traits.includes('reckless')?-2:0));
    current.performance=life.education.performance;
    if(endAge!==undefined&&npc.age>=endAge){current.graduated=true;current.endAge=endAge;if(current.credential)life.education.credential=current.credential;addNpcMemory(state,npc,'education',4,`Completed ${current.credential??current.stage} studies.`,true);}
    return;
  }
  const stage=profile.stages.find(item=>item.startAge===npc.age);
  if(stage){startEducationRecord(npc,stage.stage,schoolInstitution(npc,stage.label),npc.age);return;}
  const completedSecondary=life.education.records.some(record=>record.stage==='secondary'&&record.graduated);
  if(npc.age>=18&&npc.age<=23&&completedSecondary&&!life.education.credential&&!life.education.records.some(record=>['trade','university','graduate','professional'].includes(record.stage)&&!record.graduated)){
    const studyChance=clamp(.12+(life.aptitude-45)/120+(npc.traits.includes('ambitious')?.12:0)+(npc.traits.includes('curious')?.08:0)-(life.finance.creditStress/500),.06,.68);
    if(rng.chance(studyChance)){
      let credential:string=rng.pick(POST_SECONDARY_CREDENTIALS);
      if(life.aptitude>=84&&rng.chance(.10))credential=rng.pick(PROFESSIONAL_CREDENTIALS);
      startEducationRecord(npc,credentialStage(credential),`${npc.city} Institute`,npc.age,credential);
      addNpcMemory(state,npc,'education',3,`Started post-secondary study in ${credential.replaceAll('_',' ')}.`);
    }
  }
}

function closeCareerRecord(npc:Npc,age:number){const current=[...npc.life!.career.history].reverse().find(record=>record.endAge===undefined);if(current)current.endAge=age;}
function openCareerRecord(npc:Npc,jobId:string,age:number){npc.life!.career.history.push({jobId,startAge:age});boundedHistory(npc.life!.career.history,10);}

function updateNpcCareer(state:GameState,npc:Npc,rng:SeededRng){
  const life=npc.life!;
  if(npc.age<16||life.legal.sentenceRemaining>0)return;
  if(life.career.retired)return;
  if(!npc.careerId){
    if(npc.age>=67&&rng.chance(.55)){life.career.retired=true;return;}
    const chance=(npc.age>=18?.16:.04)+(npc.traits.includes('ambitious')?.08:0)+(npc.traits.includes('responsible')?.04:0);
    if(rng.chance(chance)){
      const options=jobs.filter(job=>job.experienceRequirement===0&&job.minAge<=npc.age&&educationRequirementSatisfied(npc,job.educationRequirement));
      const fallback=jobs.filter(job=>job.experienceRequirement===0&&job.minAge<=npc.age&&job.educationRequirement==='secondary');
      const available=options.length?options:fallback;
      if(available.length){const job=rng.weighted(available.map(item=>({item,weight:1+Math.max(0,life.aptitude-(item.statRequirements.intelligence??40))/45})));npc.careerId=job.id;openCareerRecord(npc,job.id,npc.age);addNpcMemory(state,npc,'career',4,`Started working as ${job.title}.`,true);}
    }
    return;
  }
  const job=jobById[npc.careerId];
  if(!job){closeCareerRecord(npc,npc.age);npc.careerId=undefined;return;}
  life.career.careerYears+=1;
  const jobLossChance=(npc.traits.includes('responsible')?.006:npc.traits.includes('reckless')?.024:.012)+(life.finance.creditStress>70?.005:0);
  if(rng.chance(jobLossChance)){closeCareerRecord(npc,npc.age);addNpcMemory(state,npc,'job_loss',-8,`Lost a job as ${job.title}.`,true);npc.careerId=undefined;npc.happiness=clamp(npc.happiness-7);return;}
  if(job.promotionPath&&npc.age>=20){
    const promotionChance=.045+(npc.traits.includes('ambitious')?.035:0)+(npc.traits.includes('responsible')?.02:0)+(life.education.performance>=75?.015:0);
    if(rng.chance(promotionChance)){const next=jobById[job.promotionPath];if(next){closeCareerRecord(npc,npc.age);npc.careerId=next.id;openCareerRecord(npc,next.id,npc.age);addNpcMemory(state,npc,'promotion',7,`Advanced to ${next.title}.`,true);}}
  }
  if(npc.age>=64&&rng.chance(clamp(.05+(npc.age-64)*.035,0,.55))){const current=jobById[npc.careerId]??job;closeCareerRecord(npc,npc.age);addNpcMemory(state,npc,'retirement',3,`Retired from work as ${current.title}.`,true);npc.careerId=undefined;life.career.retired=true;}
}

function processNpcFinanceYear(state:GameState,npc:Npc,rng:SeededRng,allowAssetGrowth=true){
  const life=npc.life!;const country=countryById[npc.countryId];const jobIncome=medianJobIncome(state,npc);life.finance.annualIncome=jobIncome;
  ensureNpcAssetPortfolio(state,npc);syncNpcAssetProjection(npc);syncNpcHouseholdProjection(state,npc);
  if(life.legal.sentenceRemaining>0)return;
  if(npc.age<18){life.finance.creditStress=0;return;}

  const assetYear=processNpcAssetPortfolioYear(state,npc,allowAssetGrowth);syncNpcHouseholdProjection(state,npc);
  const mortgageDebt=npcMortgageDebt(npc);let unsecuredDebt=Math.max(0,life.finance.debt-mortgageDebt);let unsecuredPayment=0;
  if(unsecuredDebt>0){unsecuredPayment=Math.min(unsecuredDebt,Math.max(300,unsecuredDebt*.08));unsecuredDebt=Math.max(0,Math.round(unsecuredDebt-unsecuredPayment));}
  life.finance.debt=Math.max(0,Math.round(mortgageDebt+unsecuredDebt));
  const businessIncome=Math.max(0,assetYear.businessCashFlow);const businessLoss=Math.min(0,assetYear.businessCashFlow);const income=jobIncome+businessIncome;life.finance.annualIncome=income;
  const tax=income*(country?.taxRate??.22);const baseCost=(npc.age<22?9000:14500)*state.economy.inflationIndex*(country?.salaryMultiplier??1);const dependentCost=life.household.dependents*3200*state.economy.inflationIndex;const housingCost=life.finance.housing==='owning'?life.finance.propertyValue*.018:life.finance.housing==='shared'?5200*state.economy.inflationIndex:8200*state.economy.inflationIndex;
  const scheduledDebtPayment=assetYear.mortgagePayment+unsecuredPayment;const disposable=income+businessLoss-tax-baseCost-dependentCost-housingCost-scheduledDebtPayment;
  const savingsRate=npc.traits.includes('responsible')?.52:npc.traits.includes('reckless')?.12:npc.traits.includes('ambitious')?.38:.28;
  const change=Math.round(disposable*savingsRate+rng.int(-1200,1200));
  if(change>=0)npc.wealth=Math.max(0,Math.round(npc.wealth+change));
  else {const shortfall=-change;const fromWealth=Math.min(npc.wealth,shortfall);npc.wealth-=fromWealth;unsecuredDebt+=Math.max(0,shortfall-fromWealth);}
  if(unsecuredDebt>0&&npc.wealth>12000){const payoff=Math.min(unsecuredDebt,Math.round(npc.wealth*.08));npc.wealth-=payoff;unsecuredDebt-=payoff;}
  life.finance.debt=Math.max(0,Math.round(npcMortgageDebt(npc)+unsecuredDebt));
  life.finance.creditStress=clamp((life.finance.debt/Math.max(1000,income+life.finance.propertyValue*.08))*65+(npc.wealth<1000?18:0));
}

function pickIllness(npc:Npc,rng:SeededRng){
  const eligible=illnesses.filter(illness=>illness.minAge<=npc.age&&!npc.life!.health.conditions.some(condition=>condition.illnessId===illness.id));
  if(!eligible.length)return undefined;
  return rng.weighted(eligible.map(item=>({item,weight:Math.max(.0001,item.prevalence)})));
}

function processNpcHealthYear(state:GameState,npc:Npc,rng:SeededRng,coarse=false){
  const life=npc.life!;const cycles=coarse?2:1;
  life.health.fitness=clamp(life.health.fitness+rng.int(-2,2)-(npc.age>55?1:0)+(npc.traits.includes('responsible')?.5:0));
  life.health.wellness=clamp((life.health.wellness*.8)+(npc.happiness*.2)+rng.int(-2,2));
  npc.health=clamp(npc.health-Math.max(0,(npc.age-55)*.08*cycles)+rng.int(-2,1));
  if(npcHealthIsTerminal(npc))return;
  for(const condition of [...life.health.conditions]){
    condition.years+=cycles;const def=illnesses.find(item=>item.id===condition.illnessId);if(def){npc.health=clamp(npc.health-def.healthDrain*.35*cycles);condition.severity=clamp(condition.severity+rng.int(-3,4));}
    if(npcHealthIsTerminal(npc))return;
    const careChance=clamp(.28+(npc.wealth>10000?.18:0)+(life.finance.creditStress<45?.08:0),.12,.68);
    if(!condition.treated&&rng.chance(careChance))condition.treated=true;
    if(!condition.chronic&&condition.years>=1&&rng.chance(condition.treated?.58:.28)){life.health.conditions=life.health.conditions.filter(item=>item!==condition);addNpcMemory(state,npc,'recovery',3,`Recovered from ${condition.name}.`);}
  }
  const onsetChance=clamp((npc.age<12?.012:npc.age<40?.022:npc.age<60?.035:npc.age<75?.055:.085)*cycles+(100-life.health.wellness)/2500,0,.22);
  if(life.health.conditions.length<4&&rng.chance(onsetChance)){
    const illness=pickIllness(npc,rng);if(illness){const severity=rng.int(illness.severityRange[0],illness.severityRange[1]);life.health.conditions.push({illnessId:illness.id,name:illness.name,severity,diagnosedAge:npc.age,chronic:rng.chance(illness.chronicChance),treated:false,years:0});addNpcMemory(state,npc,'health',-Math.round(severity/10),`Developed ${illness.name}.`,severity>=55);if(timelineRelevant(state,npc.id)&&severity>=55)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'health',importance:2,text:`${npc.firstName} developed a serious health problem.`,npcIds:[npc.id]});}
  }
}

function processNpcLegalYear(state:GameState,npc:Npc,rng:SeededRng,coarse=false){
  const life=npc.life!;
  if(life.legal.sentenceRemaining>0){
    life.legal.sentenceRemaining=Math.max(0,life.legal.sentenceRemaining-(coarse?2:1));npc.imprisoned=life.legal.sentenceRemaining>0;npc.happiness=clamp(npc.happiness-(coarse?3:2));
    if(!npc.imprisoned){syncNpcHouseholdProjection(state,npc);addNpcMemory(state,npc,'release',2,'Completed a custodial sentence.',true);if(timelineRelevant(state,npc.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'legal',importance:2,text:`${npc.firstName} completed a prison sentence.`,npcIds:[npc.id]});}
    return;
  }
  if(npc.age<14)return;
  const country=countryById[npc.countryId];const base=.0018*(coarse?2:1)*(country?.crimeModifier??1);const chance=base+(npc.traits.includes('reckless')?.0055:0)+(npc.traits.includes('aggressive')?.0025:0)+(life.finance.creditStress>75?.002:0);
  if(!rng.chance(chance))return;
  const serious=rng.chance(.24+(npc.traits.includes('aggressive')?.08:0));const convicted=rng.chance(serious?.52:.34);const sentence=convicted&&serious?rng.int(1,4):undefined;
  life.legal.incidents.push({age:npc.age,kind:serious?'serious':'minor',convicted,...(sentence?{sentenceYears:sentence}:{})});boundedHistory(life.legal.incidents,8);life.legal.recordSeverity=clamp(life.legal.recordSeverity+(convicted?(serious?28:12):5));
  addNpcMemory(state,npc,'legal',convicted?-10:-4,convicted?'Was convicted after a legal incident.':'Was involved in a legal incident.',convicted);
  if(sentence){life.legal.sentenceRemaining=sentence;npc.imprisoned=true;life.household.status='institutional';life.finance.housing='institutional';if(npc.careerId&&rng.chance(.75)){closeCareerRecord(npc,npc.age);npc.careerId=undefined;}}
  if(timelineRelevant(state,npc.id)&&convicted)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'legal',importance:2,text:`${npc.firstName} was convicted after an offscreen legal incident${sentence?` and received a ${sentence}-year sentence`:''}.`,npcIds:[npc.id]});
}

function processNpcPublicLifeYear(state:GameState,npc:Npc,rng:SeededRng,coarse=false){
  const life=npc.life!;const before=life.publicLife.fame;const job=npc.careerId?jobById[npc.careerId]:undefined;const potential=job?.famePotential??0;const cycles=coarse?2:1;
  if(potential>=8&&rng.chance(clamp(potential/180*cycles,.01,.18)))life.publicLife.fame=clamp(life.publicLife.fame+rng.int(1,Math.max(2,Math.round(potential/7))));
  else life.publicLife.fame=clamp(life.publicLife.fame-(life.publicLife.fame>15?.35*cycles:.08*cycles));
  if(life.publicLife.fame>=30&&rng.chance((npc.traits.includes('reckless')?.018:.006)*cycles)){life.publicLife.scandals+=1;life.publicLife.reputation=clamp(life.publicLife.reputation-rng.int(4,12));addNpcMemory(state,npc,'public_scandal',-8,'Went through a public reputation setback.',true);}
  life.publicLife.followers=Math.max(0,Math.round(life.publicLife.fame*life.publicLife.fame*42));npc.famous=life.publicLife.fame>=25;
  if(before<25&&life.publicLife.fame>=25&&timelineRelevant(state,npc.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'fame',importance:2,text:`${npc.firstName} became publicly notable through their own life path.`,npcIds:[npc.id]});
}

function partnershipCompatibility(a:Npc,b:Npc){
  let score=55;
  for(const trait of ['loyal','responsible','romantic','calm','ambitious'])if(a.traits.includes(trait)&&b.traits.includes(trait))score+=6;
  if(a.traits.includes('reckless')!==b.traits.includes('reckless'))score-=5;
  if(a.traits.includes('aggressive')&&b.traits.includes('calm'))score-=6;
  if(b.traits.includes('aggressive')&&a.traits.includes('calm'))score-=6;
  return clamp(score,20,92);
}

function createPartnerChild(state:GameState,partner:Npc,rng:SeededRng){
  if(partner.age<25||rng.chance(.78))return;
  const maxAge=Math.max(0,Math.min(12,partner.age-18));if(maxAge<=0)return;
  const id=makeStateId(state,'npc');const {firstName,lastName}=pickCollisionAwareNpcName(state,rng,{countryId:partner.countryId,fixedLastName:partner.lastName});const child:Npc={id,firstName,lastName,age:rng.int(0,maxAge),alive:true,health:rng.int(65,100),happiness:rng.int(48,92),wealth:0,countryId:partner.countryId,city:partner.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:0,memories:[],parentIds:[partner.id],childIds:[],simulationTier:'background'};assignGeneratedNpcOrientation(state,child);state.npcs[id]=child;partner.childIds.push(id);ensureNpcLife(state,child);
}

function createAutonomousPartner(state:GameState,npc:Npc,rng:SeededRng){
  if(npc.age<18||npc.partnerId||hasPlayerRomance(state,npc.id))return;
  const age=Math.max(18,npc.age+rng.int(-5,5));const id=makeStateId(state,'npc');
  const npcRomanticGender=npcGender(state,npc);const targetGender=pickRomanticTargetGender(state,npc.sexuality,npcRomanticGender,id);
  const {firstName,lastName}=pickCollisionAwareNpcName(state,rng,{countryId:npc.countryId,gender:targetGender});
  const partner:Npc={id,firstName,lastName,age,alive:true,health:rng.int(55,98),happiness:rng.int(42,94),wealth:rng.int(0,120000),countryId:npc.countryId,city:npc.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(20,92),maritalStatus:'dating',traits:rng.shuffle(['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','witty','private']).slice(0,3),hiddenOpinion:0,memories:[],parentIds:[],childIds:[],partnerId:npc.id,simulationTier:npc.simulationTier};
  assignGeneratedNpcOrientation(state,partner,npcRomanticGender);npc.partnerId=id;npc.maritalStatus='dating';state.npcs[id]=partner;ensureNpcLife(state,partner);
  // A distant background descendant may still form a relationship, but seeding a pre-existing
  // partner child would restart an invisible dynasty branch. Direct/meaningful relatives are
  // promoted to full simulation before this path and retain the richer family behavior.
  if(!(npc.simulationTier==='background'&&unrepresentedNpcDescendant(state,npc)))createPartnerChild(state,partner,rng);
  addNpcMemory(state,npc,'partner',5,`Began dating ${partner.firstName} ${partner.lastName}.`);addNpcMemory(state,partner,'partner',5,`Began dating ${npc.firstName} ${npc.lastName}.`);
  const relation=directRelationship(state,npc.id);
  if(relation?.type==='parent'){
    state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:'stepparent',score:rng.int(28,62),attraction:0,compatibility:rng.int(35,75),yearsKnown:0});
    for(const childId of partner.childIds)if(!state.relationships.some(rel=>rel.npcId===childId))state.relationships.push({id:makeStateId(state,'rel'),npcId:childId,type:'stepsibling',score:rng.int(25,58),attraction:0,compatibility:rng.int(30,75),yearsKnown:0});
  }
}

function recentMemoryMood(npc:Npc){const recent=npc.memories.slice(-8);return recent.length?recent.reduce((sum,memory)=>sum+memory.sentiment,0)/recent.length:0;}

function unrepresentedNpcDescendant(state:GameState,npc:Npc){return npc.parentIds.length>0&&!directRelationship(state,npc.id);}

function yearsSinceRelationshipBoundary(state:GameState,npc:Npc){
  const latest=[...npc.memories].reverse().find(memory=>['divorce','bereavement'].includes(memory.kind));
  return latest?Math.max(0,state.currentYear-latest.year):Math.max(0,npc.age-18);
}

function advanceNpcPartnership(state:GameState,npc:Npc,rng:SeededRng){
  if(!npc.partnerId)return;const partner=state.npcs[npc.partnerId];
  if(!partner?.alive){npc.partnerId=undefined;npc.maritalStatus=npc.maritalStatus==='married'?'widowed':'single';return;}
  if(hasPlayerRomance(state,npc.id))return;
  const compatibility=partnershipCompatibility(npc,partner);const stressPenalty=Math.max(0,-recentMemoryMood(npc)-recentMemoryMood(partner));
  const partnerMemory=[...npc.memories].reverse().find(memory=>memory.kind==='partner');
  const engagementMemory=[...npc.memories].reverse().find(memory=>memory.kind==='engagement');
  const yearsDating=partnerMemory?Math.max(0,state.currentYear-partnerMemory.year):0;
  const yearsEngaged=engagementMemory?Math.max(0,state.currentYear-engagementMemory.year):0;
  const shouldEngage=npc.maritalStatus==='dating'&&partner.maritalStatus==='dating'&&(yearsDating>=4||rng.chance(clamp(.055+(compatibility-50)/800,0.025,.13)));
  if(shouldEngage){npc.maritalStatus='engaged';partner.maritalStatus='engaged';addNpcMemory(state,npc,'engagement',6,`Became engaged to ${partner.firstName} ${partner.lastName}.`,true);addNpcMemory(state,partner,'engagement',6,`Became engaged to ${npc.firstName} ${npc.lastName}.`,true);}
  else if(npc.maritalStatus==='engaged'&&partner.maritalStatus==='engaged'&&(yearsEngaged>=2||rng.chance(.20))){npc.maritalStatus='married';partner.maritalStatus='married';addNpcMemory(state,npc,'marriage',9,`Married ${partner.firstName} ${partner.lastName}.`,true);addNpcMemory(state,partner,'marriage',9,`Married ${npc.firstName} ${npc.lastName}.`,true);if(isPlayerFamily(state,npc.id)||isPlayerFamily(state,partner.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`${npc.firstName} married ${partner.firstName} ${partner.lastName}.`,npcIds:[npc.id,partner.id]});}
  else if(npc.maritalStatus==='married'&&partner.maritalStatus==='married'){
    const divorceChance=clamp(.009+(55-compatibility)/1800+stressPenalty/1800-(npc.traits.includes('loyal')?.004:0),.002,.045);
    if(rng.chance(divorceChance)){npc.maritalStatus='divorced';partner.maritalStatus='divorced';npc.partnerId=undefined;partner.partnerId=undefined;addNpcMemory(state,npc,'divorce',-10,`Divorced ${partner.firstName} ${partner.lastName}.`,true);addNpcMemory(state,partner,'divorce',-10,`Divorced ${npc.firstName} ${npc.lastName}.`,true);if(isPlayerFamily(state,npc.id)||isPlayerFamily(state,partner.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:`${npc.firstName} and ${partner.firstName} divorced.`,npcIds:[npc.id,partner.id]});}
  }
}

function childRelationshipType(state:GameState,parentIds:string[]):RelationshipType|undefined{
  const types=parentIds.map(id=>directRelationship(state,id)?.type).filter(Boolean) as RelationshipType[];
  if(types.some(type=>type==='child'))return'grandchild';
  if(types.some(type=>['sibling','half_sibling','stepsibling'].includes(type)))return'niece_nephew';
  if(types.some(type=>type==='parent'))return'half_sibling';
  return undefined;
}

function createNpcChild(state:GameState,npc:Npc,partner:Npc,rng:SeededRng,adopted=false){
  const pool=getNamePool(npc.countryId);const id=makeStateId(state,'npc');const initialFirstName=rng.pick(pool.first);const lastName=rng.chance(.65)?npc.lastName:partner.lastName;
  const {firstName}=resolveCollisionAwareName(npc.countryId,initialFirstName,lastName,[{firstName:state.character.firstName,lastName:state.character.lastName},...Object.values(state.npcs)],{fixedLastName:lastName});
  const relationType=childRelationshipType(state,[npc.id,partner.id]);
  // Full simulation follows the newborn's actual player-facing relationship, not merely
  // the parent's closeness. Descendants beyond the supported kin taxonomy remain linked
  // in the NPC family graph but use background cadence instead of spawning full-tier branches.
  const child:Npc={id,firstName,lastName,age:0,alive:true,health:rng.int(68,100),happiness:rng.int(65,96),wealth:0,countryId:npc.countryId,city:npc.city,sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(25,92),maritalStatus:'single',traits:rng.shuffle(['curious','calm','ambitious','witty','responsible','reckless','loyal']).slice(0,2),hiddenOpinion:rng.int(5,25),memories:[],parentIds:[npc.id,partner.id],childIds:[],simulationTier:relationType?'full':'background'};
  assignGeneratedNpcOrientation(state,child);state.npcs[id]=child;npc.childIds.push(id);partner.childIds.push(id);state.legacy.familyTreeNpcIds.push(id);ensureNpcLife(state,child);
  if(relationType&&!state.relationships.some(rel=>rel.npcId===id))state.relationships.push({id:makeStateId(state,'rel'),npcId:id,type:relationType,score:rng.int(42,72),attraction:0,compatibility:rng.int(40,80),yearsKnown:0});
  addNpcMemory(state,npc,adopted?'adoption':'child_birth',10,adopted?`Adopted ${firstName}.`:`${firstName} was born.`,true);addNpcMemory(state,partner,adopted?'adoption':'child_birth',10,adopted?`Adopted ${firstName}.`:`${firstName} was born.`,true);
  if(relationType)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:2,text:adopted?`${firstName} ${lastName} joined your extended family through adoption.`:`${firstName} ${lastName} was born into your extended family.`,npcIds:[id,npc.id,partner.id]});
}

function maybeExpandNpcFamily(state:GameState,npc:Npc,processedCouples:Set<string>,rng:SeededRng,background=false){
  if(!npc.partnerId||npc.maritalStatus!=='married')return;const partner=state.npcs[npc.partnerId];if(!partner?.alive||partner.maritalStatus!=='married')return;
  const coupleKey=[npc.id,partner.id].sort().join('|');if(processedCouples.has(coupleKey))return;processedCouples.add(coupleKey);
  if(npc.age<18||partner.age<18)return;
  // Background roots can still build one bounded offscreen family. Once either partner is
  // already an unrepresented descendant, stop the branch here so distant family trees do not
  // recurse indefinitely behind the player-facing relationship model.
  if(background&&(unrepresentedNpcDescendant(state,npc)||unrepresentedNpcDescendant(state,partner)))return;
  const existingChildren=new Set([...npc.childIds,...partner.childIds]);const maxChildren=background?2:4;if(existingChildren.size>=maxChildren)return;
  const combinedHealth=(npc.health+partner.health)/200;const fertility=(npc.fertility+partner.fertility)/200;const wealthStability=clamp((npc.wealth+partner.wealth)/120000,.45,1.25);const compatibility=partnershipCompatibility(npc,partner)/100;
  const npcSex=npcReproductiveSex(state,npc);const partnerSex=npcReproductiveSex(state,partner);
  const canConceive=reproductivePairCanConceive(npcSex,partnerSex);
  const ageFactor=canConceive?reproductivePairAgeFactor(npcSex,npc.age,partnerSex,partner.age):0;
  const effectiveFertility=fertility*ageFactor;
  const familyVisibility=(isPlayerFamily(state,npc.id)||isPlayerFamily(state,partner.id))?2.4:1;
  const marriageMemory=[...npc.memories].reverse().find(memory=>memory.kind==='marriage');const yearsMarried=marriageMemory?Math.max(0,state.currentYear-marriageMemory.year):0;
  // Prevent implausible permanent childlessness caused only by unlucky RNG in stable close-family couples,
  // but never use that pressure to override reproductive-age viability. Adoption behavior remains unchanged.
  const familyOriented=[npc,partner].some(person=>person.traits.some(trait=>['romantic','responsible','loyal'].includes(trait)));
  if(!background&&familyVisibility>1&&existingChildren.size===0&&yearsMarried>=6&&canConceive&&effectiveFertility>=.45&&combinedHealth>=.62){createNpcChild(state,npc,partner,rng,false);return;}
  if(!background&&familyVisibility>1&&existingChildren.size===0&&yearsMarried>=8&&!canConceive&&familyOriented&&combinedHealth>=.55){createNpcChild(state,npc,partner,rng,true);return;}
  if(!background&&familyVisibility>1&&existingChildren.size===0&&yearsMarried>=7&&fertility<.45&&compatibility>=.68&&combinedHealth>=.62){createNpcChild(state,npc,partner,rng,true);return;}
  const chance=canConceive?(background?.018:.055)*effectiveFertility*combinedHealth*wealthStability*compatibility*familyVisibility*(existingChildren.size===0?1.4:Math.max(.35,1-existingChildren.size*.2)):0;
  if(chance>0&&rng.chance(chance)){createNpcChild(state,npc,partner,rng,false);return;}
  const adoptionChance=(background?.002:.006)*(compatibility>.62?1.4:1)*(existingChildren.size===0?1.6:1)*((!canConceive||fertility<.45)?2.2:1);
  if(rng.chance(adoptionChance))createNpcChild(state,npc,partner,rng,true);
}

export function relocateNpcHousehold(state:GameState,npcId:string,destination:string):string[]{
  const npc=state.npcs[npcId];if(!npc?.alive||!destination||destination===npc.city)return[];
  const members=new Map<string,Npc>();members.set(npc.id,npc);
  const partner=npc.partnerId?state.npcs[npc.partnerId]:undefined;
  if(partner?.alive&&ensureNpcLife(state,partner).legal.sentenceRemaining<=0)members.set(partner.id,partner);
  const parentIds=[npc.id,...(partner?.alive?[partner.id]:[])];
  for(const parentId of parentIds){for(const childId of state.npcs[parentId]?.childIds??[]){const child=state.npcs[childId];if(child?.alive&&child.age<18&&ensureNpcLife(state,child).legal.sentenceRemaining<=0)members.set(child.id,child);}}
  const moved:string[]=[];
  for(const member of members.values()){
    if(member.city===destination)continue;const old=member.city;member.city=destination;const life=ensureNpcLife(state,member);life.household.moves+=1;life.household.lastMoveAge=member.age;addNpcMemory(state,member,'move',2,`Moved from ${old} to ${destination}.`,true);moved.push(member.id);
  }
  return moved;
}

function processHouseholdMoves(state:GameState,npc:Npc,rng:SeededRng,coarse=false){
  const life=npc.life!;if(npc.age<18||life.legal.sentenceRemaining>0||hasPlayerRomance(state,npc.id))return;
  const partner=npc.partnerId?state.npcs[npc.partnerId]:undefined;
  if(partner?.alive){
    if(hasPlayerRomance(state,partner.id))return;
    // A shared household gets one relocation roll per year rather than one roll per adult.
    if(npc.id.localeCompare(partner.id)>0)return;
  }
  const playerIsDependent=npc.childIds.includes(state.character.id)&&state.character.age<18;
  const partnerHasDependentPlayer=Boolean(partner?.childIds.includes(state.character.id)&&state.character.age<18);
  if(playerIsDependent||partnerHasDependentPlayer)return;
  const country=countryById[npc.countryId];if(!country?.cities.length)return;
  const moveChance=(npc.happiness<35?.025:.006)*(coarse?2:1)+(npc.careerId&&life.career.history.at(-1)?.startAge===npc.age?.018:0);
  // Household relocation has its own deterministic substream. Considering a move must not
  // consume the shared life RNG and reshuffle unrelated marriage, fertility, health, career,
  // or legal outcomes. The household key makes partners share one stable yearly decision.
  const householdKey=[npc.id,partner?.alive?partner.id:undefined].filter((id):id is string=>Boolean(id)).sort().join('|');
  const moveRng=createRng(`${state.seed}-npc-household-move-${householdKey}-${state.currentYear}-${coarse?'background':'full'}`);
  if(!moveRng.chance(moveChance))return;
  const options=country.cities.filter(city=>city!==npc.city);if(!options.length)return;const old=npc.city;const destination=moveRng.pick(options);const moved=relocateNpcHousehold(state,npc.id,destination);
  if(moved.length&&moved.some(id=>timelineRelevant(state,id)))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:1,text:`${npc.firstName}'s household moved from ${old} to ${destination}.`,npcIds:moved});
}

export function npcMortalityChance(npc:Npc){
  const life=npc.life!;const conditionRisk=life.health.conditions.reduce((sum,condition)=>{const def=illnesses.find(item=>item.id===condition.illnessId);return sum+(def?.mortalityFactor??0)*(condition.severity/50);},0);
  return clamp(Math.max(.001,(npc.age-70)*.0055+(18-npc.health)*.002)+conditionRisk,0,.55);
}

function handleNpcDeath(state:GameState,npc:Npc){
  if(!npc.alive)return false;
  const life=npc.life!;npc.alive=false;npc.imprisoned=false;life.legal.sentenceRemaining=0;life.household.status='institutional';
  if(npc.partnerId){const partner=state.npcs[npc.partnerId];if(partner?.alive){if(partner.maritalStatus==='married')partner.maritalStatus='widowed';else partner.maritalStatus='single';partner.partnerId=undefined;addNpcMemory(state,partner,'bereavement',-12,`${npc.firstName} ${npc.lastName} died.`,true);}npc.partnerId=undefined;}
  settleNpcEstateOnDeath(state,npc);for(const rel of state.relationships.filter(r=>r.npcId===npc.id))rel.score=clamp(rel.score-10);
  if(timelineRelevant(state,npc.id)||isPlayerFamily(state,npc.id))state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'family',importance:3,text:`${npc.firstName} ${npc.lastName} died at age ${npc.age}.`,npcIds:[npc.id]});
  return true;
}

function processRelationshipDrift(state:GameState,rng:SeededRng){
  for(const rel of state.relationships){
    rel.yearsKnown+=1;const npc=state.npcs[rel.npcId];if(!npc?.alive)continue;
    const meaningful=relationshipIsMeaningful(state,npc.id);if(npc.simulationTier==='background'&&!meaningful&&state.character.age%2!==0)continue;
    const recent=npc.memories.slice(-6);const memoryMood=recent.length?recent.reduce((sum,memory)=>sum+memory.sentiment,0)/recent.length:0;const family=FAMILY_RELATION_TYPES.has(rel.type)||['spouse','partner','fiance'].includes(rel.type);
    const desired=clamp(52+npc.hiddenOpinion*.24+memoryMood*.9+(family?10:0));const pull=(desired-rel.score)*(family?.035:.055);const noise=family?rng.int(-1,1):rng.int(-2,1);rel.score=clamp(rel.score+pull+noise);
    npc.hiddenOpinion=clamp(npc.hiddenOpinion+memoryMood*.025,-100,100);
  }
}

export function processNpcLives(state:GameState,rng=createRng(state.seed,state.rngCounter)){
  const startingNpcs=Object.values(state.npcs);const processedCouples=new Set<string>();
  for(const npc of startingNpcs){
    if(!npc.alive)continue;ensureNpcLife(state,npc);npc.age+=1;const meaningful=relationshipIsMeaningful(state,npc.id);
    if(meaningful)npc.simulationTier='full';
    else if(unrepresentedNpcDescendant(state,npc))npc.simulationTier='background'; // Repair pre-fix full-tier distant descendants as they age.
    const background=npc.simulationTier==='background'&&!meaningful;
    if(npcHealthIsTerminal(npc)){handleNpcDeath(state,npc);continue;}
    processNpcEducationYear(state,npc,rng);
    const coarse=background;
    if(background&&npc.age%2!==0){npc.health=clamp(npc.health-Math.max(0,(npc.age-55)*.07));if(npcHealthIsTerminal(npc))handleNpcDeath(state,npc);continue;}
    processNpcHealthYear(state,npc,rng,coarse);if(npcHealthIsTerminal(npc)){handleNpcDeath(state,npc);continue;}processNpcLegalYear(state,npc,rng,coarse);updateNpcCareer(state,npc,rng);processNpcFinanceYear(state,npc,rng,!background);processNpcPublicLifeYear(state,npc,rng,coarse);processHouseholdMoves(state,npc,rng,coarse);
    if(npc.life!.legal.sentenceRemaining<=0){
      const partnerChance=(background?.014:.025)+(npc.traits.includes('romantic')?.018:0)+(npc.happiness>70?.006:0)+(recentMemoryMood(npc)>5?.004:0);
      const cadenceOk=!background||npc.age%4===0;
      const eligibleSingle=npc.age>=18&&!npc.partnerId&&!hasPlayerRomance(state,npc.id)&&['single','divorced','widowed'].includes(npc.maritalStatus);
      const boundedCloseFamilyAttempt=eligibleSingle&&!background&&isPlayerFamily(state,npc.id)&&npc.traits.includes('romantic')&&yearsSinceRelationshipBoundary(state,npc)>=8;
      if(cadenceOk&&eligibleSingle&&(boundedCloseFamilyAttempt||rng.chance(partnerChance*(background?2.5:1))))createAutonomousPartner(state,npc,rng);
      advanceNpcPartnership(state,npc,rng);maybeExpandNpcFamily(state,npc,processedCouples,rng,background);
    }
    npc.life!.lastFullSimulationAge=npc.age;
    if((npc.age>72||npc.health<18)&&rng.chance(npcMortalityChance(npc)))handleNpcDeath(state,npc);
  }
  processRelationshipDrift(state,rng);state.rngCounter=rng.counter();
}

export function npcLifeSummary(npc:Npc){
  const life=npc.life;if(!life)return undefined;const currentEducation=[...life.education.records].reverse().find(record=>!record.graduated);const highest=[...life.education.records].reverse().find(record=>record.graduated);
  return {
    education:currentEducation?`Studying ${currentEducation.credential?.replaceAll('_',' ')??currentEducation.stage}`:highest?.credential?.replaceAll('_',' ')??highest?.stage??'No recorded schooling',
    career:life.career.retired?'Retired':npc.careerId?jobById[npc.careerId]?.title??'Working':'Not currently employed',
    housing:life.finance.housing,
    annualIncome:life.finance.annualIncome,
    debt:life.finance.debt,
    propertyValue:life.finance.propertyValue,
    businessValue:npcBusinessValue(npc),
    netWorth:npcNetWorth(npc),
    properties:(npc.assetPortfolio?.properties??[]).map(property=>({id:property.id,name:property.name,value:property.marketValue,equity:Math.max(0,property.marketValue-property.mortgageBalance),location:property.location})),
    businesses:(npc.assetPortfolio?.businesses??[]).filter(business=>business.active).map(business=>({id:business.id,name:business.name,value:business.valuation,annualProfit:business.annualProfit})),
    conditions:life.health.conditions.map(condition=>condition.name),
    legalIncidents:life.legal.incidents.length,
    sentenceRemaining:life.legal.sentenceRemaining,
    fame:life.publicLife.fame,
    followers:life.publicLife.followers,
    moves:life.household.moves,
  };
}
