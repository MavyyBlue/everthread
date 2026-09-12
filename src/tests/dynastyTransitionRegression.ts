import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { checkDeath } from '../systems/DeathSystem';
import { buildDynastyTransitionReview } from '../systems/DynastyTransitionSystem';
import { previewEstate, setEstateAssetBequest, setWill } from '../systems/EstateSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { addNpcBusinessHolding, addNpcPropertyHolding } from '../systems/NpcAssetSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import type { GameState, Npc, PropertyAsset, Relationship } from '../types/game';
import type { NpcBusinessHolding, NpcPropertyHolding } from '../types/npcAssets';

function addChild(state:GameState,id:string,name:string,age=30):Npc{
  const npc:Npc={id,firstName:name,lastName:state.character.lastName,age,alive:true,health:86,happiness:73,wealth:25_000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:65,maritalStatus:'single',traits:['responsible','ambitious'],hiddenOpinion:70,memories:[],parentIds:[state.character.id],childIds:[],simulationTier:'full'};
  state.npcs[id]=npc;ensureNpcLife(state,npc);
  const relationship:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:82,attraction:0,compatibility:74,yearsKnown:age};state.relationships.push(relationship);return npc;
}
function addProperty(state:GameState,id:string,name:string,value:number):PropertyAsset{const property:PropertyAsset={id,typeId:'starter_house_standard',name,location:state.character.city,purchasePrice:value,marketValue:value,condition:90,age:5,amenities:[]};state.assets.properties.push(property);return property;}
function npcProperty(id:string,name:string,value:number,mortgage=0):NpcPropertyHolding{return{id,typeId:'starter_house_standard',name,location:'Test City',purchasePrice:value,marketValue:value,mortgageBalance:mortgage,condition:88,propertyAge:4,acquiredAge:24,origin:'purchased'};}
function npcBusiness(id:string,name:string,value:number):NpcBusinessHolding{return{id,industryId:'software',name,foundedYear:2040,acquiredAge:28,valuation:value,annualProfit:Math.round(value*.08),employees:8,reputation:70,active:true,origin:'purchased'};}

export function runDynastyTransitionRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Dynasty transition regression failed: ${message}`);}function approx(a:number,b:number,t=1,message='values differ'){verify(Math.abs(a-b)<=t,`${message} (${a} vs ${b})`);}

  const state=createNewGame({seed:'phase5e-review',countryId:'us'});state.character.age=68;state.currentYear=2094;state.finances.cash=900_000;
  const adult=addChild(state,'phase5e-adult','Avery',36);const minor=addChild(state,'phase5e-minor','Mika',15);adult.careerId='technology_3';adult.maritalStatus='married';adult.life!.finance.debt=35_000;adult.life!.publicLife.fame=22;adult.life!.publicLife.reputation=76;addNpcPropertyHolding(state,adult,npcProperty('avery-home','Avery Home',220_000,80_000));addNpcBusinessHolding(state,adult,npcBusiness('avery-studio','Avery Studio',140_000));
  const partner:Npc={...structuredClone(adult),id:'avery-partner',firstName:'Rowan',age:35,careerId:undefined,partnerId:adult.id,parentIds:[],childIds:[],assetPortfolio:{properties:[],businesses:[]},memories:[]};state.npcs[partner.id]=partner;adult.partnerId=partner.id;
  const grandchild:Npc={...structuredClone(minor),id:'avery-child',firstName:'Kai',age:6,parentIds:[adult.id,partner.id],childIds:[],partnerId:undefined,maritalStatus:'single',assetPortfolio:{properties:[],businesses:[]},memories:[]};state.npcs[grandchild.id]=grandchild;adult.childIds=[grandchild.id];partner.childIds=[grandchild.id];
  const familyHome=addProperty(state,'family-home','Family Home',500_000);setWill(state,[{npcId:adult.id,percentage:60},{npcId:minor.id,percentage:40}]);setEstateAssetBequest(state,'property',familyHome.id,adult.id);state.character.alive=false;
  const before=JSON.stringify(state);const rngBefore=state.rngCounter;const idBefore=state.idCounter;const review=buildDynastyTransitionReview(state);
  verify(JSON.stringify(state)===before,'death/estate/successor review is strictly read-only');verify(state.rngCounter===rngBefore&&state.idCounter===idBefore,'review consumes neither gameplay RNG nor runtime IDs');
  verify(review.writtenPlan&&review.generation===1&&review.nextGeneration===2,'review exposes written-plan and generation context');verify(review.successors.length===2,'only living child continuations appear as successor candidates');
  const adultReview=review.successors.find(item=>item.npcId===adult.id)!;const minorReview=review.successors.find(item=>item.npcId===minor.id)!;
  verify(adultReview.career!=='No current career'&&adultReview.relationshipStatus==='Married'&&adultReview.partnerName==='Rowan '+adult.lastName,'successor review exposes the adult descendant career and existing partnership');
  verify(adultReview.children===1&&adultReview.ownProperties.some(item=>item.id==='avery-home')&&adultReview.ownBusinesses.some(item=>item.id==='avery-studio'),'successor review exposes existing children and personally owned assets');
  verify(adultReview.debt===35_000&&adultReview.ownNetWorth>adult.wealth,'successor review exposes existing debt and reconciled personal net worth');
  verify(adultReview.projectedProperties.some(item=>item.id===familyHome.id)&&adultReview.projectedInheritance>0,'successor review uses the estate authority for named inherited assets and value');
  verify(minorReview.inheritanceHeldUntilAge===18&&minorReview.lifeStage==='minor','minor successor review makes protected inheritance timing visible before selection');
  approx(review.estate.distributableValue,previewEstate(state).distributableValue,1,'transition review delegates estate math to EstateSystem');

  const forced=createNewGame({seed:'phase5e-forced-sale',countryId:'us'});forced.character.age=70;forced.currentYear=2096;forced.finances.cash=0;const forcedChild=addChild(forced,'forced-child','Jordan',30);const onlyHome=addProperty(forced,'only-home','Only Home',2_000_000);setEstateAssetBequest(forced,'property',onlyHome.id,forcedChild.id);forced.character.alive=false;const forcedReview=buildDynastyTransitionReview(forced);
  verify(forcedReview.estate.forcedSales.some(item=>item.id===onlyHome.id&&item.name==='Only Home'&&item.reason==='obligations'),'estate review names an asset forced to sell for obligations instead of exposing only an opaque id');

  const fair=createNewGame({seed:'phase5e-fair-sale',countryId:'us'});fair.character.age=70;fair.currentYear=2096;fair.finances.cash=300_000;addChild(fair,'fair-a','Alex',31);addChild(fair,'fair-b','Blair',29);const indivisible=addProperty(fair,'indivisible-home','Clifftop House',1_200_000);fair.character.alive=false;const fairReview=buildDynastyTransitionReview(fair);
  verify(fairReview.estate.forcedSales.some(item=>item.id===indivisible.id&&item.reason==='fairness'),'estate review distinguishes fairness/division sales from obligation sales');

  const many=createNewGame({seed:'phase5e-many-successors',countryId:'us'});many.character.age=75;many.currentYear=2101;many.finances.cash=24_000_000;many.npcs={};many.relationships=[];for(let index=0;index<120;index++)addChild(many,`many-child-${index}`,`Child${index}`,18+(index%42));many.character.alive=false;const manyBefore=JSON.stringify(many);const manyReview=buildDynastyTransitionReview(many);
  verify(manyReview.successors.length===120&&manyReview.estate.heirs.length===120,'death transition projection keeps a very large direct-heir family complete for progressive UI disclosure');
  verify(JSON.stringify(many)===manyBefore,'large-heir transition projection remains read-only instead of preparing hidden settlement state');
  verify(manyReview.successors.every(candidate=>candidate.projectedInheritance>=0),'large-heir projection produces finite non-negative successor inheritance values');
  verify(manyReview.successors[0]!.age>=manyReview.successors.at(-1)!.age,'successor projection uses deterministic oldest-first ordering for a stable large-family decision list');

  const continuation=structuredClone(state);const projected=buildDynastyTransitionReview(continuation).successors.find(item=>item.npcId===adult.id)!;verify(continueAsChild(continuation,adult.id).success,'reviewed adult successor can be explicitly continued');approx(Number(continuation.flags.inheritanceReceived),projected.projectedInheritance,1,'confirmed continuation receives the inheritance shown in the pre-choice review');
  verify(continuation.assets.properties.some(item=>item.id==='avery-home')&&continuation.assets.properties.some(item=>item.id==='family-home'),'confirmed continuation preserves the successor own property and the previewed inherited property');
  verify(continuation.timeline.some(item=>item.text.includes('Other family heirs received')),'new protagonist timeline records what happened to the rest of the family estate');
  verify(continuation.timeline.some(item=>item.text.includes('estate settled')),'new protagonist timeline preserves visible estate-obligation consequences after the death screen is gone');
  verify(validateState(continuation).length===0,'reviewed and confirmed continuation remains state-valid');

  const dynasty=createNewGame({seed:'phase5e-dynasty-scale',countryId:'us'});dynasty.character.age=64;dynasty.currentYear=2088;dynasty.finances.cash=2_500_000;
  for(let index=0;index<280;index++){const npc:Npc={id:`scale-relative-${index}`,firstName:`Relative${index}`,lastName:'Scale',age:18+(index%65),alive:true,health:70,happiness:60,wealth:10_000,countryId:dynasty.character.countryId,city:dynasty.character.city,sexuality:'bisexual',fertility:50,maritalStatus:'single',traits:['calm'],hiddenOpinion:0,memories:[],parentIds:[],childIds:[],simulationTier:'background'};dynasty.npcs[npc.id]=npc;}
  const startingNpcCount=Object.keys(dynasty.npcs).length;let archivedEntries=0;const generations=12;
  for(let generation=0;generation<generations;generation++){
    const heir=addChild(dynasty,`scale-heir-${generation}`,`Heir${generation}`,28+(generation%5));
    dynasty.timeline=Array.from({length:600},(_,index)=>({id:`g${generation}-timeline-${index}`,year:dynasty.currentYear-(index%50),age:Math.max(0,dynasty.character.age-(index%50)),category:'random' as const,importance:(index%97===0?3:1) as 1|3,text:`Generation ${generation} persistent history entry ${index}`}));archivedEntries+=dynasty.timeline.length+1;
    checkDeath(dynasty,true);const transition=buildDynastyTransitionReview(dynasty);verify(transition.successors.some(item=>item.npcId===heir.id),'dynasty-scale death review still resolves the intended living descendant');verify(continueAsChild(dynasty,heir.id).success,'dynasty-scale continuation completes across sequential generations');verify(validateState(dynasty).length===0,'dynasty-scale continuation preserves invariants at every generation');dynasty.character.age=64;dynasty.currentYear+=36;dynasty.finances.cash+=150_000;
  }
  const storedEntries=dynasty.completedLives.reduce((sum,life)=>sum+life.timeline.length,0);verify(dynasty.legacy.generation===generations+1,'twelve sequential reviewed handoffs advance the dynasty exactly once per generation');verify(storedEntries===archivedEntries,'completed-life history preserves every authoritative life entry across many generations');verify(new Set(dynasty.completedLives.map(life=>life.id)).size===dynasty.completedLives.length,'completed-life ids remain unique across dynasty-scale continuation');verify(Object.keys(dynasty.npcs).length<=startingNpcCount+generations*50,'repeated succession with hundreds of background NPCs grows the historical cast linearly within the established per-generation bound');verify(JSON.stringify(dynasty).length<8_000_000,'twelve generations with thousands of archived life entries remain within a bounded single-save footprint');

  return checks;
}
