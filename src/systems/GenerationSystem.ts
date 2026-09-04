import type { Business, Character, CollectibleAsset, EngineResult, GameState, InvestmentPosition, Loan, Npc, PropertyAsset, Relationship } from '../types/game';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { netWorth } from './FinanceSystem';
import { jobById } from '../data/jobs';

function npcToCharacter(state:GameState,npc:Npc):Character {
  const rng=createRng(`${state.seed}-descendant-${npc.id}`,state.rngCounter);
  return {
    id:npc.id,firstName:npc.firstName,lastName:npc.lastName,
    sex:rng.pick(['female','male','intersex'] as const),genderIdentity:rng.pick(['woman','man','nonbinary'] as const),orientation:npc.sexuality,
    countryId:npc.countryId,city:npc.city,birthYear:state.currentYear-npc.age,age:npc.age,alive:true,
    appearance:{skinTone:rng.pick(['fair','light','medium','olive','tan','brown','deep brown','dark']),hairColor:rng.pick(['black','brown','auburn','blonde','red']),hairStyle:rng.pick(['straight','wavy','curly','coiled','cropped']),eyeColor:rng.pick(['brown','hazel','green','blue','gray']),accessories:[]},
    stats:{health:npc.health,happiness:npc.happiness,intelligence:clamp(state.character.stats.intelligence*.45+rng.int(20,55)),appearance:clamp(state.character.stats.appearance*.45+rng.int(20,55))},
    secondary:{athleticism:clamp(state.character.secondary.athleticism*.35+rng.int(20,60)),discipline:rng.int(25,80),willpower:rng.int(25,80),karma:0,reputation:clamp(state.fame.fame*.25+45),stress:rng.int(0,25),fertility:npc.fertility,charisma:rng.int(25,85),creativity:rng.int(25,85),confidence:rng.int(20,80),addictionSusceptibility:rng.int(5,75),criminalNotoriety:0,academicPerformance:rng.int(35,80),workPerformance:50},
    talents:{music:clamp(state.character.talents.music*.35+rng.int(10,55)),acting:clamp(state.character.talents.acting*.35+rng.int(10,55)),athletics:clamp(state.character.talents.athletics*.35+rng.int(10,55)),business:clamp(state.character.talents.business*.35+rng.int(10,55)),crime:clamp(state.character.talents.crime*.35+rng.int(10,55)),social:clamp(state.character.talents.social*.35+rng.int(10,55)),combat:clamp(state.character.talents.combat*.35+rng.int(10,55))},
    birthCircumstance:'into the family you previously built',familyWealthTier:netWorth(state)>5000000?'wealthy':netWorth(state)>500000?'comfortable':'middle',traits:[...npc.traits],specialTalents:[],
  };
}

type HeirShare={npc:Npc;ratio:number};
type EstateItem=
  | {kind:'property';id:string;value:number;property:PropertyAsset;mortgage?:Loan}
  | {kind:'business';id:string;value:number;business:Business}
  | {kind:'collectible';id:string;value:number;collectible:CollectibleAsset};

interface EstateSettlement {
  cash:number;
  properties:PropertyAsset[];
  businesses:Business[];
  collectibles:CollectibleAsset[];
  investments:InvestmentPosition[];
  liabilities:Loan[];
  inheritanceValue:number;
  siblingValue:number;
  forcedSales:number;
}

function livingChildShares(state:GameState):HeirShare[] {
  const children=state.relationships
    .filter(rel=>rel.type==='child')
    .map(rel=>state.npcs[rel.npcId])
    .filter((npc):npc is Npc=>Boolean(npc?.alive));
  if(!children.length)return[];
  const validWill=state.inheritance.will.filter(entry=>entry.percentage>0&&children.some(child=>child.id===entry.npcId));
  const willTotal=validWill.reduce((sum,entry)=>sum+entry.percentage,0);
  if(willTotal>0){
    const ratioById=new Map(validWill.map(entry=>[entry.npcId,entry.percentage/willTotal]));
    return children.map(npc=>({npc,ratio:ratioById.get(npc.id)??0})).filter(entry=>entry.ratio>0);
  }
  return children.map(npc=>({npc,ratio:1/children.length}));
}

function mortgageFor(state:GameState,property:PropertyAsset){
  return property.mortgageId?state.finances.liabilities.find(loan=>loan.id===property.mortgageId):undefined;
}

function propertyEquity(state:GameState,property:PropertyAsset){return Math.max(0,property.marketValue-(mortgageFor(state,property)?.balance??0));}
function propertySaleValue(state:GameState,property:PropertyAsset){return Math.max(0,property.marketValue-(mortgageFor(state,property)?.balance??0)-Math.round(property.marketValue*.035));}
function itemSaleValue(state:GameState,item:EstateItem){
  if(item.kind==='property')return propertySaleValue(state,item.property);
  if(item.kind==='business')return item.business.bankrupt?0:item.business.valuation*.95;
  return item.collectible.estimatedValue*.92;
}

function settleEstate(state:GameState,selectedChildId:string):EstateSettlement {
  const heirs=livingChildShares(state);
  const selected=heirs.find(heir=>heir.npc.id===selectedChildId);
  if(!selected)return{cash:0,properties:[],businesses:[],collectibles:[],investments:[],liabilities:[],inheritanceValue:0,siblingValue:0,forcedSales:0};

  let liquid=Math.max(0,state.finances.cash);
  let forcedSales=0;
  const candidateItems:EstateItem[]=[];

  for(const vehicle of state.assets.vehicles)liquid+=Math.max(0,vehicle.value*.96);

  for(const property of state.assets.properties){
    const equity=propertyEquity(state,property);
    if(state.inheritance.inheritProperties&&equity>0)candidateItems.push({kind:'property',id:property.id,value:equity,property,mortgage:mortgageFor(state,property)});
    else liquid+=propertySaleValue(state,property);
  }
  for(const business of state.businesses){
    if(state.inheritance.inheritBusinesses&&!business.bankrupt&&business.valuation>0)candidateItems.push({kind:'business',id:business.id,value:business.valuation,business});
    else if(!business.bankrupt)liquid+=business.valuation*.95;
  }
  for(const collectible of state.assets.collectibles)candidateItems.push({kind:'collectible',id:collectible.id,value:Math.max(0,collectible.estimatedValue),collectible});

  // Mortgages are settled with or travel alongside their properties. Other debts are estate obligations.
  const nonMortgageDebt=state.finances.liabilities.filter(loan=>loan.kind!=='mortgage').reduce((sum,loan)=>sum+Math.max(0,loan.balance),0);
  if(liquid<nonMortgageDebt){
    // Sell the least costly-to-liquidate legacy items first so debts cannot disappear while valuable assets survive untouched.
    candidateItems.sort((a,b)=>(itemSaleValue(state,b)/Math.max(1,b.value))-(itemSaleValue(state,a)/Math.max(1,a.value)));
    while(liquid<nonMortgageDebt&&candidateItems.length){const sold=candidateItems.shift()!;liquid+=itemSaleValue(state,sold);forcedSales+=1;}
  }
  liquid=Math.max(0,liquid-nonMortgageDebt);

  const investmentValue=state.investments.positions.reduce((sum,position)=>sum+position.units*(state.investments.prices[position.securityId]??0),0);
  const initialTotal=liquid+investmentValue+candidateItems.reduce((sum,item)=>sum+item.value,0);
  const preliminaryTargets=new Map(heirs.map(heir=>[heir.npc.id,initialTotal*heir.ratio]));
  const assignedValue=new Map(heirs.map(heir=>[heir.npc.id,investmentValue*heir.ratio]));
  const assignedItems=new Map(heirs.map(heir=>[heir.npc.id,[] as EstateItem[]]));

  // Preserve indivisible assets only when an heir can absorb them without grossly defeating the will/equal-share target.
  for(const item of [...candidateItems].sort((a,b)=>b.value-a.value)){
    const ranked=[...heirs].sort((a,b)=>((preliminaryTargets.get(b.npc.id)??0)-(assignedValue.get(b.npc.id)??0))-((preliminaryTargets.get(a.npc.id)??0)-(assignedValue.get(a.npc.id)??0)));
    const heir=ranked[0]!;
    const remaining=Math.max(0,(preliminaryTargets.get(heir.npc.id)??0)-(assignedValue.get(heir.npc.id)??0));
    if(heirs.length>1&&item.value>remaining*1.10){liquid+=itemSaleValue(state,item);forcedSales+=1;continue;}
    assignedItems.get(heir.npc.id)!.push(item);assignedValue.set(heir.npc.id,(assignedValue.get(heir.npc.id)??0)+item.value);
  }

  const retainedTotal=[...assignedItems.values()].flat().reduce((sum,item)=>sum+item.value,0);
  const finalTotal=liquid+investmentValue+retainedTotal;
  const finalTargets=new Map(heirs.map(heir=>[heir.npc.id,finalTotal*heir.ratio]));
  const cashNeeds=heirs.map(heir=>({heir,need:Math.max(0,(finalTargets.get(heir.npc.id)??0)-(assignedValue.get(heir.npc.id)??0))}));
  const totalNeed=cashNeeds.reduce((sum,entry)=>sum+entry.need,0);
  const cashByHeir=new Map<string,number>();
  for(const {heir,need} of cashNeeds)cashByHeir.set(heir.npc.id,totalNeed>0?liquid*(need/totalNeed):liquid*heir.ratio);

  let siblingValue=0;
  for(const heir of heirs){
    const itemValue=(assignedItems.get(heir.npc.id)??[]).reduce((sum,item)=>sum+item.value,0);
    const inheritedInvestment=investmentValue*heir.ratio;
    const inheritedCash=cashByHeir.get(heir.npc.id)??0;
    const total=itemValue+inheritedInvestment+inheritedCash;
    if(heir.npc.id!==selectedChildId){heir.npc.wealth=Math.max(0,Math.round(heir.npc.wealth+total));siblingValue+=total;}
  }

  const selectedItems=assignedItems.get(selectedChildId)??[];
  const properties=selectedItems.filter((item):item is Extract<EstateItem,{kind:'property'}>=>item.kind==='property').map(item=>structuredClone(item.property));
  const businesses=selectedItems.filter((item):item is Extract<EstateItem,{kind:'business'}>=>item.kind==='business').map(item=>structuredClone(item.business));
  const collectibles=selectedItems.filter((item):item is Extract<EstateItem,{kind:'collectible'}>=>item.kind==='collectible').map(item=>structuredClone(item.collectible));
  const propertyIds=new Set(properties.map(property=>property.id));
  const liabilities=state.finances.liabilities.filter(loan=>loan.kind==='mortgage'&&loan.assetId&&propertyIds.has(loan.assetId)).map(loan=>structuredClone(loan));
  const investments=state.investments.positions.map(position=>({...position,units:position.units*selected.ratio})).filter(position=>position.units>0.000001);
  const itemValue=selectedItems.reduce((sum,item)=>sum+item.value,0);
  const selectedInvestmentValue=investmentValue*selected.ratio;
  const selectedCash=cashByHeir.get(selectedChildId)??0;
  return {cash:selectedCash,properties,businesses,collectibles,investments,liabilities,inheritanceValue:itemValue+selectedInvestmentValue+selectedCash,siblingValue,forcedSales};
}

function relation(state:GameState,npcId:string,type:Relationship['type'],score:number,yearsKnown:number):Relationship {
  const existing=state.relationships.find(r=>r.npcId===npcId);
  return {id:makeStateId(state,'rel'),npcId,type,score:clamp(existing?.score??score),attraction:type==='spouse'||type==='partner'||type==='fiance'?clamp(existing?.attraction??50):0,compatibility:clamp(existing?.compatibility??55),yearsKnown:Math.max(0,yearsKnown),estranged:existing?.estranged};
}

function rebuildDescendantRelationships(state:GameState, originalChild:Npc, previousPlayerId:string):Relationship[] {
  const result:Relationship[]=[];
  const seen=new Set<string>();
  const add=(npcId:string,type:Relationship['type'],score:number,yearsKnown:number)=>{
    if(seen.has(npcId)||!state.npcs[npcId])return;
    seen.add(npcId);result.push(relation(state,npcId,type,score,yearsKnown));
  };

  const parentIds=new Set(originalChild.parentIds);
  for(const parentId of parentIds){
    const parent=state.npcs[parentId];add(parentId,'parent',72,originalChild.age);
    if(!parent)continue;
    for(const grandparentId of parent.parentIds)add(grandparentId,'grandparent',62,originalChild.age);
    if(parent.partnerId&&!parentIds.has(parent.partnerId))add(parent.partnerId,'stepparent',52,Math.max(0,originalChild.age-1));
  }

  const siblings:Npc[]=[];
  for(const npc of Object.values(state.npcs)){
    if(npc.id===previousPlayerId||npc.id===originalChild.id)continue;
    const sharedParents=npc.parentIds.filter(id=>parentIds.has(id));
    if(!sharedParents.length)continue;
    const fullSibling=sharedParents.length>=2&&npc.parentIds.length>=2&&originalChild.parentIds.length>=2;
    add(npc.id,fullSibling?'sibling':'half_sibling',58,Math.min(originalChild.age,npc.age));siblings.push(npc);
  }

  // Children of a biological sibling remain nieces/nephews after control changes.
  for(const sibling of siblings)for(const childId of sibling.childIds)add(childId,'niece_nephew',48,state.npcs[childId]?.age??0);

  // A stepparent's other children are stepsiblings when they do not already share a biological parent with the player.
  for(const rel of [...result].filter(rel=>rel.type==='stepparent')){
    const stepparent=state.npcs[rel.npcId];
    for(const childId of stepparent?.childIds??[]){if(childId!==originalChild.id&&!parentIds.has(childId))add(childId,'stepsibling',45,Math.min(originalChild.age,state.npcs[childId]?.age??0));}
  }

  if(originalChild.partnerId&&state.npcs[originalChild.partnerId]) add(originalChild.partnerId,originalChild.maritalStatus==='married'?'spouse':'partner',68,Math.max(1,Math.min(originalChild.age,state.npcs[originalChild.partnerId]!.age)-18));
  for(const childId of originalChild.childIds){
    add(childId,'child',72,state.npcs[childId]?.age??0);
    for(const grandchildId of state.npcs[childId]?.childIds??[])add(grandchildId,'grandchild',62,state.npcs[grandchildId]?.age??0);
  }

  // Keep established friendships so changing protagonists does not erase the descendant's entire social world.
  for(const oldRel of state.relationships){
    if(result.length>=28)break;
    if(seen.has(oldRel.npcId)||!state.npcs[oldRel.npcId]?.alive)continue;
    if(['friend','best_friend'].includes(oldRel.type)) add(oldRel.npcId,oldRel.type,Math.min(oldRel.score,65),Math.min(originalChild.age,oldRel.yearsKnown));
  }
  return result;
}

function descendantEmployment(state:GameState,child:Npc):GameState['employment'] {
  const job=child.careerId?jobById[child.careerId]:undefined;
  if(!job)return{history:[],partTimeJobIds:[],freelanceReputation:10,retired:child.age>=67};
  const level=Math.max(1,Number(job.id.match(/_(\d+)$/)?.[1]??1));
  const salary=Math.round(((job.salaryRange[0]+job.salaryRange[1])/2)*state.economy.salaryIndex);
  return {current:{jobId:job.id,title:job.title,company:'Established Employer',startAge:Math.max(job.minAge,child.age-Math.max(1,level*2)),salary,performance:child.traits.includes('responsible')?68:child.traits.includes('ambitious')?72:58,level},history:[],partTimeJobIds:[],freelanceReputation:10,retired:false};
}

export function continueAsChild(state:GameState,childId:string):EngineResult {
  if(state.character.alive)return{success:false,messages:[{text:'Generational continuation becomes available after the current life ends.'}]};
  const child=state.npcs[childId];
  const rel=state.relationships.find(r=>r.npcId===childId&&r.type==='child');
  if(!child||!rel||!child.alive)return{success:false,messages:[{text:'That descendant is not available.'}]};

  const originalChild=structuredClone(child);
  const previousCharacter=structuredClone(state.character);
  const previousPlayerId=previousCharacter.id;
  const parentLife=state.completedLives.at(-1);
  const settlement=settleEstate(state,childId);
  const livingChildren=state.relationships.filter(r=>r.type==='child'&&state.npcs[r.npcId]?.alive);
  const newCharacter=npcToCharacter(state,child);

  const parentNpc:Npc={
    id:previousPlayerId,firstName:previousCharacter.firstName,lastName:previousCharacter.lastName,age:previousCharacter.age,alive:false,
    health:0,happiness:previousCharacter.stats.happiness,wealth:0,countryId:previousCharacter.countryId,city:previousCharacter.city,sexuality:previousCharacter.orientation,
    fertility:previousCharacter.secondary.fertility,maritalStatus:'widowed',traits:[...previousCharacter.traits],hiddenOpinion:80,memories:[],
    parentIds:state.relationships.filter(r=>['parent','stepparent'].includes(r.type)&&state.npcs[r.npcId]).map(r=>r.npcId),childIds:livingChildren.map(r=>r.npcId),
  };
  state.npcs[parentNpc.id]=parentNpc;
  delete state.npcs[childId];
  state.character=newCharacter;
  state.currentYear=newCharacter.birthYear+newCharacter.age;
  state.relationships=rebuildDescendantRelationships(state,originalChild,previousPlayerId);
  state.education=[];
  state.employment=descendantEmployment(state,originalChild);
  state.assets={properties:settlement.properties,vehicles:[],collectibles:settlement.collectibles};
  state.businesses=settlement.businesses;
  state.investments={...state.investments,positions:settlement.investments};
  state.finances={cash:Math.max(0,originalChild.wealth)+settlement.cash,annualIncome:state.employment.current?.salary??0,annualExpenses:0,taxesPaid:0,liabilities:settlement.liabilities};
  state.legal={criminalRecord:[],investigationHeat:0,imprisoned:Boolean(originalChild.imprisoned),prisonSecurity:originalChild.imprisoned?'minimum':undefined,sentenceRemaining:originalChild.imprisoned?1:0,paroleEligible:false};
  state.health={conditions:[],fitness:clamp(35+originalChild.health*.25),wellness:clamp(40+originalChild.happiness*.25),addictions:[]};
  const inheritedFame=Math.max(Math.round((parentLife?.fame??0)*.2),originalChild.famous?25:0);
  state.fame={fame:inheritedFame,publicReputation:55,followers:Math.round(inheritedFame*500),engagement:25,platforms:{},scandals:[]};
  state.specialCareers={};
  state.pets=[];
  state.delayedEvents=[];
  state.pendingEvent=undefined;
  state.recentEventIds=[];
  state.legacy.generation+=1;
  state.flags.famousDescendant=(parentLife?.fame??0)>=60;
  state.flags.inheritanceReceived=settlement.inheritanceValue;
  state.flags.lifetimeInheritance=Number(state.flags.lifetimeInheritance??0)+settlement.inheritanceValue;
  state.flags.inheritances=Number(state.flags.inheritances??0)+(settlement.inheritanceValue>0?1:0);
  state.timeline=[{id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'family',importance:3,text:`You continued the family as ${newCharacter.firstName} ${newCharacter.lastName}, receiving ${Math.round(settlement.inheritanceValue).toLocaleString()} of the settled estate${settlement.forcedSales?` after ${settlement.forcedSales} asset${settlement.forcedSales===1?' was':'s were'} sold to settle debts or divide the estate fairly`:''}.`}];
  if(state.employment.current)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'career',importance:2,text:`You entered this chapter already working as ${state.employment.current.title}.`});
  if(originalChild.partnerId){const partner=state.npcs[originalChild.partnerId];if(partner)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:newCharacter.age,category:'relationship',importance:2,text:`Your existing ${originalChild.maritalStatus==='married'?'marriage':'relationship'} with ${partner.firstName} ${partner.lastName} continued with you.`});}
  state.yearlySnapshots=[];
  return{success:true,messages:[{text:`Generation ${state.legacy.generation}: now playing as ${newCharacter.firstName}.`}]};
}

export function setWill(state:GameState,beneficiaries:Array<{npcId:string;percentage:number}>):EngineResult {
  const children=new Set(state.relationships.filter(r=>r.type==='child').map(r=>r.npcId));
  if(beneficiaries.some(b=>!children.has(b.npcId)))return{success:false,messages:[{text:'Beneficiaries must be your children under the current will system.'}]};
  const total=beneficiaries.reduce((s,b)=>s+b.percentage,0);
  if(Math.abs(total-100)>.01)return{success:false,messages:[{text:'Will percentages must add up to 100%.'}]};
  state.inheritance.will=beneficiaries;
  return{success:true,messages:[{text:'Your will was updated.'}]};
}
