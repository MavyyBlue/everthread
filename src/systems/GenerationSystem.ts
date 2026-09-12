import type { Character, EngineResult, GameState, Npc, Relationship } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { netWorth } from './FinanceSystem';
import { jobById } from '../data/jobs';
import { migrateLegacyWorkplaceWorlds } from './WorkplaceSystem';
import { migrateLegacySchoolWorlds } from './SchoolWorldSystem';
import { ensureNpcLife, initializeMissingNpcLives } from './NpcLifeSystem';
import { estateTrustFromSettlement, settleEstate } from './EstateSystem';
import { characterIdentityFromNpc, npcGenderFromCharacterIdentity } from './NpcIdentitySystem';
import { ensureNpcAssetPortfolio, npcMortgageDebt, playerBusinessFromNpcHolding, playerPropertyFromNpcHolding } from './NpcAssetSystem';
import type { EstateTrustState } from '../types/estate';
import { syncPlayerFamilyTopology } from './FamilyTopologySystem';
import { createEmptyCreditState } from './CreditSystem';

export { previewEstate, setEstateAssetBequest, setEstateRetentionPreferences, setWill } from './EstateSystem';

function npcToCharacter(state:GameState,npc:Npc):Character {
  const rng=createRng(`${state.seed}-descendant-${npc.id}`,state.rngCounter);
  const identity=characterIdentityFromNpc(state,npc);
  return {
    id:npc.id,firstName:npc.firstName,lastName:npc.lastName,
    sex:identity.sex,genderIdentity:identity.genderIdentity,orientation:npc.sexuality,
    countryId:npc.countryId,city:npc.city,birthYear:state.currentYear-npc.age,age:npc.age,alive:true,
    appearance:{skinTone:rng.pick(['fair','light','medium','olive','tan','brown','deep brown','dark']),hairColor:rng.pick(['black','brown','auburn','blonde','red']),hairStyle:rng.pick(['straight','wavy','curly','coiled','cropped']),eyeColor:rng.pick(['brown','hazel','green','blue','gray']),accessories:[]},
    stats:{health:npc.health,happiness:npc.happiness,intelligence:clamp((npc.life?.aptitude??50)*.72+state.character.stats.intelligence*.18+rng.int(0,12)),appearance:clamp(state.character.stats.appearance*.45+rng.int(20,55))},
    secondary:{athleticism:clamp((npc.life?.health.fitness??50)*.62+state.character.secondary.athleticism*.18+rng.int(0,18)),discipline:clamp((npc.life?.education.performance??50)*.45+rng.int(20,45)),willpower:rng.int(25,80),karma:0,reputation:clamp(npc.life?.publicLife.reputation??50),stress:rng.int(0,25),fertility:npc.fertility,charisma:rng.int(25,85),creativity:rng.int(25,85),confidence:rng.int(20,80),addictionSusceptibility:rng.int(5,75),criminalNotoriety:clamp(npc.life?.legal.recordSeverity??0),academicPerformance:clamp(npc.life?.education.performance??50),workPerformance:clamp(npc.careerId?60+(npc.traits.includes('responsible')?8:0)+(npc.traits.includes('ambitious')?5:0):50)},
    talents:{music:clamp(state.character.talents.music*.35+rng.int(10,55)),acting:clamp(state.character.talents.acting*.35+rng.int(10,55)),athletics:clamp(state.character.talents.athletics*.35+rng.int(10,55)),business:clamp(state.character.talents.business*.35+rng.int(10,55)),crime:clamp(state.character.talents.crime*.35+rng.int(10,55)),social:clamp(state.character.talents.social*.35+rng.int(10,55)),combat:clamp(state.character.talents.combat*.35+rng.int(10,55))},
    birthCircumstance:'into the family you previously built',familyWealthTier:netWorth(state)>5000000?'wealthy':netWorth(state)>500000?'comfortable':'middle',traits:[...npc.traits],specialTalents:[],
  };
}

function relation(state:GameState,npcId:string,type:Relationship['type'],score:number,yearsKnown:number):Relationship {
  const existing=state.relationships.find(r=>r.npcId===npcId);
  return {id:makeStateId(state,'rel'),npcId,type,score:clamp(existing?.score??score),attraction:type==='spouse'||type==='partner'||type==='fiance'?clamp(existing?.attraction??50):0,compatibility:clamp(existing?.compatibility??55),yearsKnown:Math.max(0,yearsKnown),estranged:existing?.estranged};
}

function rebuildDescendantRelationships(state:GameState, originalChild:Npc, previousPlayerId:string):Relationship[] {
  const result:Relationship[]=[];const seen=new Set<string>();
  const add=(npcId:string,type:Relationship['type'],score:number,yearsKnown:number)=>{if(seen.has(npcId)||!state.npcs[npcId])return;seen.add(npcId);result.push(relation(state,npcId,type,score,yearsKnown));};

  const parentIds=new Set(originalChild.parentIds);
  for(const parentId of parentIds){const parent=state.npcs[parentId];add(parentId,'parent',72,originalChild.age);if(!parent)continue;for(const grandparentId of parent.parentIds)add(grandparentId,'grandparent',62,originalChild.age);if(parent.partnerId&&!parentIds.has(parent.partnerId))add(parent.partnerId,'stepparent',52,Math.max(0,originalChild.age-1));}

  const siblings:Npc[]=[];
  for(const npc of Object.values(state.npcs)){if(npc.id===previousPlayerId||npc.id===originalChild.id)continue;const sharedParents=npc.parentIds.filter(id=>parentIds.has(id));if(!sharedParents.length)continue;const fullSibling=sharedParents.length>=2&&npc.parentIds.length>=2&&originalChild.parentIds.length>=2;add(npc.id,fullSibling?'sibling':'half_sibling',58,Math.min(originalChild.age,npc.age));siblings.push(npc);}
  for(const sibling of siblings)for(const childId of sibling.childIds)add(childId,'niece_nephew',48,state.npcs[childId]?.age??0);
  for(const rel of [...result].filter(rel=>rel.type==='stepparent')){const stepparent=state.npcs[rel.npcId];for(const childId of stepparent?.childIds??[]){if(childId!==originalChild.id&&!parentIds.has(childId))add(childId,'stepsibling',45,Math.min(originalChild.age,state.npcs[childId]?.age??0));}}

  if(originalChild.partnerId&&state.npcs[originalChild.partnerId])add(originalChild.partnerId,originalChild.maritalStatus==='married'?'spouse':'partner',68,Math.max(1,Math.min(originalChild.age,state.npcs[originalChild.partnerId]!.age)-18));
  for(const childId of originalChild.childIds){add(childId,'child',72,state.npcs[childId]?.age??0);for(const grandchildId of state.npcs[childId]?.childIds??[])add(grandchildId,'grandchild',62,state.npcs[grandchildId]?.age??0);}
  for(const oldRel of state.relationships){if(result.length>=28)break;if(seen.has(oldRel.npcId)||!state.npcs[oldRel.npcId]?.alive)continue;if(['friend','best_friend'].includes(oldRel.type))add(oldRel.npcId,oldRel.type,Math.min(oldRel.score,65),Math.min(originalChild.age,oldRel.yearsKnown));}
  return result;
}

function descendantEducation(child:Npc):GameState['education'] {
  const records=child.life?.education.records??[];
  return records.map(record=>({stage:record.stage,institution:record.institution,major:record.credential?.replaceAll('_',' '),startAge:record.startAge,endAge:record.endAge,graduated:record.graduated,droppedOut:false,scholarship:false,performance:record.performance}));
}

function descendantEmployment(state:GameState,child:Npc):GameState['employment'] {
  const life=child.life;
  const historyRecords=(life?.career.history??[]).filter(record=>record.endAge!==undefined).map(record=>{const job=jobById[record.jobId];if(!job)return undefined;return{jobId:job.id,title:job.title,company:'Established Employer',startAge:record.startAge,endAge:record.endAge,salary:Math.round(((job.salaryRange[0]+job.salaryRange[1])/2)*state.economy.salaryIndex),performance:child.traits.includes('responsible')?68:child.traits.includes('ambitious')?72:58,level:Math.max(1,Number(job.id.match(/_(\d+)$/)?.[1]??1))};}).filter((record):record is NonNullable<typeof record>=>Boolean(record));
  const job=child.careerId?jobById[child.careerId]:undefined;
  if(!job)return{history:historyRecords,partTimeJobIds:[],partTimeJobs:[],partTimeHistory:[],freelanceReputation:10,retired:life?.career.retired??child.age>=67};
  const activeLifeRecord=[...(life?.career.history??[])].reverse().find(record=>record.jobId===job.id&&record.endAge===undefined);const level=Math.max(1,Number(job.id.match(/_(\d+)$/)?.[1]??1));const salary=Math.round(((job.salaryRange[0]+job.salaryRange[1])/2)*state.economy.salaryIndex);
  return{current:{jobId:job.id,title:job.title,company:'Established Employer',startAge:activeLifeRecord?.startAge??Math.max(job.minAge,child.age-Math.max(1,level*2)),salary,performance:child.traits.includes('responsible')?68:child.traits.includes('ambitious')?72:58,level},history:historyRecords,partTimeJobIds:[],partTimeJobs:[],partTimeHistory:[],freelanceReputation:10,retired:false};
}

export function continueAsChild(state:GameState,childId:string):EngineResult {
  if(state.character.alive)return{success:false,messages:[{text:'Generational continuation becomes available after the current life ends.'}]};
  const child=state.npcs[childId];const rel=state.relationships.find(r=>r.npcId===childId&&r.type==='child');if(!child||!rel||!child.alive)return{success:false,messages:[{text:'That descendant is not available.'}]};

  ensureNpcLife(state,child);ensureNpcAssetPortfolio(state,child);const originalChild=structuredClone(child);const previousCharacter=structuredClone(state.character);const previousPlayerId=previousCharacter.id;const parentLife=state.completedLives.at(-1);const settlement=settleEstate(state,childId);const livingChildren=state.relationships.filter(r=>r.type==='child'&&state.npcs[r.npcId]?.alive);const survivingSpouseRel=state.relationships.find(r=>r.type==='spouse'&&!r.estranged&&state.npcs[r.npcId]?.alive);const newCharacter=npcToCharacter(state,child);

  const parentNpc:Npc={id:previousPlayerId,firstName:previousCharacter.firstName,lastName:previousCharacter.lastName,age:previousCharacter.age,alive:false,health:0,happiness:previousCharacter.stats.happiness,wealth:0,countryId:previousCharacter.countryId,city:previousCharacter.city,sexuality:previousCharacter.orientation,fertility:previousCharacter.secondary.fertility,gender:npcGenderFromCharacterIdentity(previousCharacter.genderIdentity),...(previousCharacter.sex==='female'||previousCharacter.sex==='male'?{reproductiveSex:previousCharacter.sex}:{}),maritalStatus:survivingSpouseRel?'married':'single',traits:[...previousCharacter.traits],hiddenOpinion:80,memories:[],parentIds:state.relationships.filter(r=>['parent','stepparent'].includes(r.type)&&state.npcs[r.npcId]).map(r=>r.npcId),childIds:livingChildren.map(r=>r.npcId)};
  state.npcs[parentNpc.id]=parentNpc;delete state.npcs[childId];state.character=newCharacter;state.currentYear=newCharacter.birthYear+newCharacter.age;state.relationships=rebuildDescendantRelationships(state,originalChild,previousPlayerId);syncPlayerFamilyTopology(state);state.education=descendantEducation(originalChild);state.socialWorlds=[];state.employment=descendantEmployment(state,originalChild);migrateLegacySchoolWorlds(state);migrateLegacyWorkplaceWorlds(state);

  const npcLife=originalChild.life!;const inheritedImmediately=newCharacter.age>=18;const ownPropertyConversions=(originalChild.assetPortfolio?.properties??[]).map(holding=>playerPropertyFromNpcHolding(state,holding));const ownProperties=ownPropertyConversions.map(item=>item.property);const ownMortgages=ownPropertyConversions.flatMap(item=>item.mortgage?[item.mortgage]:[]);const ownBusinesses=(originalChild.assetPortfolio?.businesses??[]).filter(item=>item.active).map(holding=>playerBusinessFromNpcHolding(state,holding));const personalDebt=Math.max(0,Math.round(npcLife.finance.debt-npcMortgageDebt(originalChild)));const personalDebtLoan=personalDebt>0?{id:makeStateId(state,'loan'),kind:'personal' as const,principal:personalDebt,balance:personalDebt,annualRate:.08,annualPayment:Math.max(500,Math.round(personalDebt/8)),remainingYears:8}:undefined;
  const mergeUnique=<T extends {id:string}>(a:T[],b:T[])=>{const seen=new Set<string>();return[...a,...b].filter(item=>!seen.has(item.id)&&Boolean(seen.add(item.id)));};
  state.assets={properties:mergeUnique(ownProperties,inheritedImmediately?settlement.properties:[]),vehicles:[],collectibles:inheritedImmediately?settlement.collectibles:[]};
  state.businesses=mergeUnique(ownBusinesses,inheritedImmediately?settlement.businesses:[]);
  state.investments={...state.investments,positions:inheritedImmediately?settlement.investments:[]};
  state.finances={cash:Math.max(0,originalChild.wealth)+(inheritedImmediately?settlement.cash:0),annualIncome:state.employment.current?.salary??0,annualExpenses:0,taxesPaid:0,liabilities:mergeUnique(ownMortgages,[...(inheritedImmediately?settlement.liabilities:[]),...(personalDebtLoan?[personalDebtLoan]:[])]),credit:createEmptyCreditState()};
  state.legal={criminalRecord:npcLife.legal.incidents.map((incident,index)=>({crimeId:`npc_incident_${index+1}`,age:incident.age,convicted:incident.convicted,sentenceYears:incident.sentenceYears})),investigationHeat:clamp(npcLife.legal.recordSeverity*.25),imprisoned:npcLife.legal.sentenceRemaining>0,prisonSecurity:npcLife.legal.sentenceRemaining>0?'minimum':undefined,sentenceRemaining:npcLife.legal.sentenceRemaining,paroleEligible:npcLife.legal.sentenceRemaining>1};
  state.health={conditions:npcLife.health.conditions.map(condition=>({id:makeStateId(state,'condition'),illnessId:condition.illnessId,name:condition.name,severity:condition.severity,diagnosedAge:condition.diagnosedAge,chronic:condition.chronic,treated:condition.treated})),fitness:npcLife.health.fitness,wellness:npcLife.health.wellness,addictions:[]};
  const inheritedFame=Math.max(Math.round((parentLife?.fame??0)*.2),npcLife.publicLife.fame);state.fame={fame:clamp(inheritedFame),publicReputation:npcLife.publicLife.reputation,followers:Math.max(npcLife.publicLife.followers,Math.round(inheritedFame*500)),engagement:25,platforms:{},scandals:Array.from({length:npcLife.publicLife.scandals},(_,index)=>`Past public controversy ${index+1}`)};
  state.specialCareers={};state.pets=[];state.familyPlanning={};state.actionLedger={age:state.character.age,uses:{},lastUsedAge:{},revision:0};state.delayedEvents=[];state.pendingEvent=undefined;state.recentEventIds=[];
  let continuationTrust:EstateTrustState|undefined=inheritedImmediately?undefined:estateTrustFromSettlement(settlement,newCharacter.age);const priorNpcTrust=originalChild.inheritanceTrust;
  if(priorNpcTrust){const priorProperties=priorNpcTrust.properties??[];const priorBusinesses=priorNpcTrust.businesses??[];const convertedProperties=priorProperties.map(holding=>playerPropertyFromNpcHolding(state,holding));const priorCash=Math.max(0,priorNpcTrust.liquidValue??(priorProperties.length||priorBusinesses.length?0:priorNpcTrust.value));if(inheritedImmediately){state.finances.cash+=priorCash;state.assets.properties=mergeUnique(state.assets.properties,convertedProperties.map(item=>item.property));state.finances.liabilities=mergeUnique(state.finances.liabilities,convertedProperties.flatMap(item=>item.mortgage?[item.mortgage]:[]));state.businesses=mergeUnique(state.businesses,priorBusinesses.filter(item=>item.active).map(holding=>playerBusinessFromNpcHolding(state,holding)));}else{continuationTrust??={releaseAge:18,createdAge:newCharacter.age,cash:0,properties:[],businesses:[],collectibles:[],investments:[],liabilities:[],inheritanceValue:0};continuationTrust.cash+=priorCash;continuationTrust.properties=mergeUnique(continuationTrust.properties,convertedProperties.map(item=>item.property));continuationTrust.liabilities=mergeUnique(continuationTrust.liabilities,convertedProperties.flatMap(item=>item.mortgage?[item.mortgage]:[]));continuationTrust.businesses=mergeUnique(continuationTrust.businesses,priorBusinesses.filter(item=>item.active).map(holding=>playerBusinessFromNpcHolding(state,holding)));continuationTrust.inheritanceValue+=Math.max(0,priorNpcTrust.value);}}
  state.inheritance={will:[],inheritBusinesses:true,inheritProperties:true,assetBequests:[],...(continuationTrust?{trust:continuationTrust}:{})};
  state.legacy.generation+=1;state.flags.famousDescendant=(parentLife?.fame??0)>=60;
  if(inheritedImmediately){state.flags.inheritanceReceived=settlement.inheritanceValue;state.flags.inheritancePending=0;state.flags.lifetimeInheritance=Number(state.flags.lifetimeInheritance??0)+settlement.inheritanceValue;state.flags.inheritances=Number(state.flags.inheritances??0)+(settlement.inheritanceValue>0?1:0);}else{state.flags.inheritanceReceived=0;state.flags.inheritancePending=settlement.inheritanceValue;}
  const estateText=inheritedImmediately?`receiving ${Math.round(settlement.inheritanceValue).toLocaleString()} from the settled estate`:`with ${Math.round(settlement.inheritanceValue).toLocaleString()} protected in a family trust until age 18`;
  const settlementCosts=settlement.administrationCosts+settlement.estateLevy;
  state.timeline=[{id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'family',importance:3,text:`You continued the family as ${newCharacter.firstName} ${newCharacter.lastName}, ${estateText}${settlementCosts>0?` after ${Math.round(settlementCosts).toLocaleString()} in estate administration and settlement levy costs`:''}.`}];
  if(settlement.estateObligations>0||settlement.forcedSales>0){
    const obligationParts=[settlement.debtObligations>0?`${Math.round(settlement.debtObligations).toLocaleString()} of debt`:undefined,settlement.administrationCosts>0?`${Math.round(settlement.administrationCosts).toLocaleString()} of administration costs`:undefined,settlement.estateLevy>0?`${Math.round(settlement.estateLevy).toLocaleString()} of settlement levy`:undefined].filter(Boolean);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'asset',importance:2,text:`The previous generation's estate settled${obligationParts.length?` after paying ${obligationParts.join(', ')}`:''}${settlement.forcedSales?`; ${settlement.forcedSales} asset${settlement.forcedSales===1?' was':'s were'} sold to meet obligations or divide the estate fairly`:''}.`});
  }
  const inheritedAssetNames=[...settlement.properties.map(item=>item.name),...settlement.businesses.map(item=>item.name),...settlement.collectibles.map(item=>item.name)];
  if(inheritedAssetNames.length)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'asset',importance:2,text:`${inheritedImmediately?'Your inheritance included':'Your protected trust now holds'} ${inheritedAssetNames.join(', ')}.`});
  if(settlement.siblingValue>0)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'family',importance:2,text:`Other family heirs received ${Math.round(settlement.siblingValue).toLocaleString()} of the estate between them.`});
  if(state.employment.current)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'career',importance:2,text:`You entered this chapter already working as ${state.employment.current.title}.`});
  if(originalChild.partnerId){const partner=state.npcs[originalChild.partnerId];if(partner)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'relationship',importance:2,text:`Your existing ${originalChild.maritalStatus==='married'?'marriage':'relationship'} with ${partner.firstName} ${partner.lastName} continued with you.`});}
  state.yearlySnapshots=[];initializeMissingNpcLives(state);return{success:true,messages:[{text:inheritedImmediately?`Generation ${state.legacy.generation}: now playing as ${newCharacter.firstName}.`:`Generation ${state.legacy.generation}: now playing as ${newCharacter.firstName}. Their inheritance is protected until age 18.`}]};
}
