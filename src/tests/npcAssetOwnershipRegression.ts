import { createNewGame } from '../systems/CharacterSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife, npcLifeSummary, processNpcLives, syncNpcHouseholdProjection } from '../systems/NpcLifeSystem';
import { previewEstate, processNpcInheritanceTrusts, releaseMatureInheritanceTrust, setEstateAssetBequest, setWill, settleEstate } from '../systems/EstateSystem';
import { migrateSave, SAVE_VERSION } from '../services/SaveSystem';
import { enforceStateInvariants, validateState } from '../core/invariants';
import {
  addNpcBusinessHolding,
  addNpcInheritanceTrustHoldings,
  addNpcPropertyHolding,
  MAX_NPC_BUSINESSES,
  MAX_NPC_PROPERTIES,
  npcBusinessValue,
  npcMortgageDebt,
  npcNetWorth,
  npcPropertyEquity,
  npcPropertyGross,
  processNpcAssetPortfolioYear,
} from '../systems/NpcAssetSystem';
import { settleNpcEstateOnDeath } from '../systems/NpcEstateSystem';
import type { Business, GameState, Loan, Npc, PropertyAsset, Relationship } from '../types/game';
import type { NpcBusinessHolding, NpcPropertyHolding } from '../types/npcAssets';

function npcFixture(state:GameState,id:string,age=35,tier:Npc['simulationTier']='full'){
  const npc:Npc={id,firstName:id.replaceAll('-',' '),lastName:'Fixture',age,alive:true,health:92,happiness:80,wealth:0,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['responsible','ambitious'],hiddenOpinion:65,memories:[],parentIds:[],childIds:[],simulationTier:tier};
  state.npcs[id]=npc;ensureNpcLife(state,npc);npc.wealth=0;npc.life!.finance.debt=0;npc.life!.finance.propertyValue=0;npc.assetPortfolio={properties:[],businesses:[]};syncNpcHouseholdProjection(state,npc);return npc;
}
function childFixture(state:GameState,id:string,age=30){
  const npc=npcFixture(state,id,age,'background');npc.parentIds=[state.character.id];
  const rel:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:84,attraction:0,compatibility:72,yearsKnown:age};state.relationships.push(rel);return npc;
}
function propertyHolding(id:string,value=100000,mortgage=0):NpcPropertyHolding{return{id,typeId:'starter_house_standard',name:`${id} Home`,location:'Fixture City',purchasePrice:value,marketValue:value,mortgageBalance:mortgage,condition:88,propertyAge:6,acquiredAge:29,origin:'purchased'};}
function businessHolding(id:string,value=50000):NpcBusinessHolding{return{id,industryId:'software',name:`${id} Studio`,foundedYear:2050,acquiredAge:30,valuation:value,annualProfit:12000,employees:4,reputation:70,active:true,origin:'purchased'};}
function playerProperty(state:GameState,id:string,value:number,mortgage=0){
  const mortgageId=mortgage>0?`loan-${id}`:undefined;const property:PropertyAsset={id,typeId:'starter_house_standard',name:`${id} Home`,location:state.character.city,purchasePrice:value,marketValue:value,condition:86,age:8,amenities:[],...(mortgageId?{mortgageId}:{})};state.assets.properties.push(property);
  if(mortgageId){const loan:Loan={id:mortgageId,kind:'mortgage',principal:mortgage,balance:mortgage,annualRate:.052,annualPayment:5000,remainingYears:20,assetId:id};state.finances.liabilities.push(loan);}return property;
}
function playerBusiness(state:GameState,id:string,value:number){const business:Business={id,industryId:'software',name:`${id} Studio`,foundedAge:30,capital:30000,revenue:90000,expenses:60000,profit:30000,employees:5,demand:65,reputation:72,valuation:value,productIds:[],priceIndex:1,marketingBudget:0,compensationIndex:1,bankrupt:false};state.businesses.push(business);return business;}

export function runNpcAssetOwnershipRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`NPC asset ownership regression failed: ${message}`);}

  const fresh=createNewGame({seed:'npc-assets-schema-fresh'});
  verify(fresh.saveVersion===11&&SAVE_VERSION===11,'new lives and save service use schema 11');
  verify(Object.values(fresh.npcs).every(npc=>Boolean(npc.assetPortfolio)),'fresh persistent NPCs initialize an asset portfolio');

  const legacy=createNewGame({seed:'npc-assets-v9-migration'});const legacyNpc=npcFixture(legacy,'legacy-owner',44);legacyNpc.life!.finance.propertyValue=180000;legacyNpc.life!.finance.debt=72000;delete legacyNpc.assetPortfolio;legacy.saveVersion=9;const legacyCounter=legacy.rngCounter;
  const migrated=migrateSave(legacy);const migratedNpc=migrated.npcs[legacyNpc.id]!;const migratedPortfolio=migratedNpc.assetPortfolio!;
  verify(migrated.saveVersion===11,'v9 saves migrate to schema 11');
  verify(migrated.rngCounter===legacyCounter,'v9 asset migration consumes no player RNG');
  verify(migratedPortfolio.properties.length===1&&migratedPortfolio.businesses.length===0,'legacy aggregate property becomes one lean explicit holding without inventing a business');
  verify(migratedPortfolio.properties[0]!.id===`npc-property-legacy-${legacyNpc.id}`,'legacy property receives a deterministic stable id');
  verify(migratedPortfolio.properties[0]!.marketValue===180000&&migratedPortfolio.properties[0]!.mortgageBalance===72000,'legacy property value and compatible debt are preserved');
  verify(migratedNpc.life!.finance.propertyValue===180000,'legacy property projection still matches the explicit portfolio');
  const remigrated=migrateSave(migrated);verify(JSON.stringify(remigrated.npcs[legacyNpc.id]!.assetPortfolio)===JSON.stringify(migratedPortfolio),'schema 11 migration is idempotent for explicit NPC holdings');

  const oldTrust=createNewGame({seed:'npc-assets-old-trust'});const trustNpc=npcFixture(oldTrust,'old-trust-heir',16);trustNpc.inheritanceTrust={releaseAge:18,value:12345};oldTrust.saveVersion=9;const migratedTrust=migrateSave(oldTrust).npcs[trustNpc.id]!.inheritanceTrust!;
  verify(migratedTrust.liquidValue===12345,'legacy value-only NPC inheritance trust migrates as liquid value');
  verify((migratedTrust.properties?.length??-1)===0&&(migratedTrust.businesses?.length??-1)===0,'legacy trust migration does not invent owned assets');

  const accounting=createNewGame({seed:'npc-assets-accounting'});const owner=npcFixture(accounting,'accounting-owner',41);owner.wealth=50000;addNpcPropertyHolding(accounting,owner,propertyHolding('accounting-home',200000,120000));addNpcBusinessHolding(accounting,owner,businessHolding('accounting-business',100000));owner.life!.finance.debt=140000;syncNpcHouseholdProjection(accounting,owner);
  verify(npcPropertyGross(owner)===200000&&npcMortgageDebt(owner)===120000&&npcPropertyEquity(owner)===80000,'property gross, mortgage, and equity derive from explicit holdings');
  verify(npcBusinessValue(owner)===100000,'business value derives from active explicit interests');
  verify(npcNetWorth(owner)===210000,'NPC net worth counts liquid wealth plus asset equity minus unsecured debt exactly once');
  verify(owner.life!.finance.propertyValue===200000&&owner.life!.finance.housing==='owning','household projection uses explicit property ownership without a second property authority');
  const summary=npcLifeSummary(owner)!;verify(summary.propertyValue===200000&&summary.businessValue===100000&&summary.netWorth===210000,'NPC profile summary exposes reconciled asset and net-worth values');
  verify(summary.properties.some(item=>item.id==='accounting-home')&&summary.businesses.some(item=>item.id==='accounting-business'),'NPC profile summary exposes individually addressable holdings');

  const background=createNewGame({seed:'npc-assets-background-bound'});const backgroundNpc=npcFixture(background,'background-wealthy',42,'background');backgroundNpc.wealth=5_000_000;
  for(let year=0;year<120;year++){background.currentYear=2060+year;processNpcAssetPortfolioYear(background,backgroundNpc,false);}
  verify(backgroundNpc.assetPortfolio!.properties.length===0&&backgroundNpc.assetPortfolio!.businesses.length===0,'background-tier simulation does not create new explicit assets when growth is disabled');
  verify(backgroundNpc.wealth===5_000_000,'disabling background acquisition does not fabricate purchase costs');


  const backgroundSeed=createNewGame({seed:'npc-assets-background-seed'});const seededBackground=npcFixture(backgroundSeed,'background-seed',44,'background');seededBackground.wealth=900000;delete seededBackground.life;delete seededBackground.assetPortfolio;ensureNpcLife(backgroundSeed,seededBackground);
  verify(seededBackground.life!.finance.propertyValue===0&&seededBackground.assetPortfolio!.properties.length===0,'new background-tier life state does not seed an explicit property portfolio');

  const backgroundWorld=createNewGame({seed:'bg-proof-0'});backgroundWorld.character.age=40;backgroundWorld.currentYear=2060;const worldNpc=npcFixture(backgroundWorld,'bg-proof',41,'background');backgroundWorld.npcs={[worldNpc.id]:worldNpc};backgroundWorld.relationships=[];worldNpc.health=100;worldNpc.happiness=90;worldNpc.wealth=5_000_000;worldNpc.assetPortfolio={properties:[],businesses:[]};worldNpc.life!.finance.propertyValue=0;worldNpc.life!.finance.debt=0;
  for(let year=0;year<20&&worldNpc.alive;year++){backgroundWorld.currentYear=2060+year;processNpcLives(backgroundWorld);}
  verify(worldNpc.alive&&worldNpc.simulationTier==='background','background world fixture remains eligible for coarse simulation across the audit window');
  verify(worldNpc.assetPortfolio!.properties.length===0&&worldNpc.assetPortfolio!.businesses.length===0,'real NPC-life processing does not promote background wealth into new explicit holdings');

  const progression=createNewGame({seed:'npc-assets-progression'});const progressing=npcFixture(progression,'progressing-owner',38);progressing.wealth=1_000_000;addNpcPropertyHolding(progression,progressing,propertyHolding('persistent-home',250000,100000));addNpcBusinessHolding(progression,progressing,businessHolding('persistent-business',160000));progressing.life!.finance.debt=100000;const homeId=progressing.assetPortfolio!.properties[0]!.id;const businessId=progressing.assetPortfolio!.businesses[0]!.id;
  for(let year=0;year<40;year++){progression.currentYear=2080+year;processNpcAssetPortfolioYear(progression,progressing,true);}
  verify(progressing.assetPortfolio!.properties.some(item=>item.id===homeId),'owned property keeps its stable id across decades of progression');
  verify(progressing.assetPortfolio!.businesses.some(item=>item.id===businessId),'owned business keeps its stable id across decades of progression');
  verify(progressing.assetPortfolio!.properties.length<=MAX_NPC_PROPERTIES&&progressing.assetPortfolio!.businesses.length<=MAX_NPC_BUSINESSES,'NPC portfolios remain bounded after decades of growth');
  verify(progressing.life!.finance.propertyValue===npcPropertyGross(progressing),'annual asset progression keeps the legacy property projection reconciled');
  verify(progressing.life!.finance.debt>=npcMortgageDebt(progressing),'annual finance never loses mortgage obligations from total NPC debt');

  const duplicates=createNewGame({seed:'npc-assets-duplicate-repair'});const dupA=npcFixture(duplicates,'dup-a'),dupB=npcFixture(duplicates,'dup-b');dupA.assetPortfolio={properties:[propertyHolding('shared-property',90000)],businesses:[businessHolding('shared-business',40000)]};dupB.assetPortfolio={properties:[propertyHolding('shared-property',90000)],businesses:[businessHolding('shared-business',40000)]};enforceStateInvariants(duplicates);
  const propertyIds=Object.values(duplicates.npcs).flatMap(npc=>npc.assetPortfolio?.properties.map(item=>item.id)??[]);const businessIds=Object.values(duplicates.npcs).flatMap(npc=>npc.assetPortfolio?.businesses.map(item=>item.id)??[]);
  verify(propertyIds.filter(id=>id==='shared-property').length===1&&businessIds.filter(id=>id==='shared-business').length===1,'invariant repair prevents duplicate cross-NPC asset ownership');
  verify(validateState(duplicates).length===0,'duplicate ownership repair leaves a valid state');

  const playerEstate=createNewGame({seed:'npc-assets-player-estate'});playerEstate.character.age=60;playerEstate.currentYear=2086;playerEstate.finances.cash=0;const selected=childFixture(playerEstate,'selected-child',31);const sibling=childFixture(playerEstate,'asset-sibling',29);const estateHome=playerProperty(playerEstate,'estate-home',100000,40000);const estateBusiness=playerBusiness(playerEstate,'estate-business',40000);setWill(playerEstate,[{npcId:selected.id,percentage:50},{npcId:sibling.id,percentage:50}]);setEstateAssetBequest(playerEstate,'property',estateHome.id,sibling.id);setEstateAssetBequest(playerEstate,'business',estateBusiness.id,sibling.id);const siblingBefore=sibling.wealth;settleEstate(playerEstate,selected.id);
  verify(sibling.assetPortfolio!.properties.some(item=>item.id===estateHome.id),'adult offscreen heir receives the actual retained player property');
  verify(sibling.assetPortfolio!.businesses.some(item=>item.id===estateBusiness.id),'adult offscreen heir receives the actual retained player business');
  verify(sibling.wealth===siblingBefore,'retained player assets are not also duplicated into offscreen heir liquid wealth');
  verify(sibling.life!.finance.debt===40000,'retained inherited property mortgage is carried to the offscreen heir exactly once');
  verify(npcNetWorth(sibling)===100000,'offscreen heir net worth equals inherited asset equity rather than gross value plus duplicated cash');

  const minorEstate=createNewGame({seed:'npc-assets-minor-offscreen'});minorEstate.character.age=60;minorEstate.currentYear=2086;minorEstate.finances.cash=0;const adultSelected=childFixture(minorEstate,'adult-selected',30);const minorSibling=childFixture(minorEstate,'minor-sibling',12);const minorHome=playerProperty(minorEstate,'minor-home',80000,20000);const minorBusiness=playerBusiness(minorEstate,'minor-business',30000);setWill(minorEstate,[{npcId:adultSelected.id,percentage:50},{npcId:minorSibling.id,percentage:50}]);setEstateAssetBequest(minorEstate,'property',minorHome.id,minorSibling.id);setEstateAssetBequest(minorEstate,'business',minorBusiness.id,minorSibling.id);settleEstate(minorEstate,adultSelected.id);
  verify(Boolean(minorSibling.inheritanceTrust),'minor offscreen heir receives a protected NPC inheritance trust');
  verify(minorSibling.assetPortfolio!.properties.length===0&&minorSibling.assetPortfolio!.businesses.length===0,'minor offscreen heir cannot directly control retained inherited assets');
  verify(minorSibling.inheritanceTrust!.properties?.some(item=>item.id===minorHome.id)&&minorSibling.inheritanceTrust!.businesses?.some(item=>item.id===minorBusiness.id),'minor trust keeps individually addressable retained assets');
  minorSibling.age=18;processNpcInheritanceTrusts(minorEstate);
  verify(!minorSibling.inheritanceTrust&&minorSibling.assetPortfolio!.properties.some(item=>item.id===minorHome.id)&&minorSibling.assetPortfolio!.businesses.some(item=>item.id===minorBusiness.id),'protected NPC assets release into the heir portfolio at adulthood');
  verify(minorSibling.life!.finance.debt===20000,'released inherited NPC property adds its mortgage once at adulthood');

  const npcEstate=createNewGame({seed:'npc-assets-npc-estate'});const deceased=npcFixture(npcEstate,'npc-parent',58);const npcHeir=npcFixture(npcEstate,'npc-heir',30);deceased.childIds=[npcHeir.id];npcHeir.parentIds=[deceased.id];deceased.wealth=60000;addNpcPropertyHolding(npcEstate,deceased,propertyHolding('npc-estate-home',80000,40000));addNpcBusinessHolding(npcEstate,deceased,businessHolding('npc-estate-business',30000));deceased.life!.finance.debt=40000;deceased.alive=false;const npcEstateResult=settleNpcEstateOnDeath(npcEstate,deceased);
  verify(npcEstateResult.estateValue===130000&&npcEstateResult.distributedValue===71500,'NPC estate preserves existing 55% inheritance tuning after debt');
  verify(npcHeir.assetPortfolio!.properties.some(item=>item.id==='npc-estate-home')&&npcHeir.assetPortfolio!.businesses.some(item=>item.id==='npc-estate-business'),'adult NPC child can inherit retained NPC property and business interests');
  verify(npcHeir.wealth===1500,'NPC heir receives only the liquid residual after retained asset equity');
  verify(npcHeir.life!.finance.debt===40000,'NPC heir receives inherited mortgage exactly once');
  verify(deceased.wealth===0&&deceased.life!.finance.debt===0&&deceased.assetPortfolio!.properties.length===0&&deceased.assetPortfolio!.businesses.length===0,'deceased NPC estate clears source wealth, debt, and holdings exactly once');
  const heirAfterFirstEstate=JSON.stringify({wealth:npcHeir.wealth,debt:npcHeir.life!.finance.debt,portfolio:npcHeir.assetPortfolio});const repeatedEstate=settleNpcEstateOnDeath(npcEstate,deceased);
  verify(repeatedEstate.distributedValue===0,'a second settlement of the same cleared NPC estate has no distributable value');
  verify(JSON.stringify({wealth:npcHeir.wealth,debt:npcHeir.life!.finance.debt,portfolio:npcHeir.assetPortfolio})===heirAfterFirstEstate,'NPC estate settlement is idempotent and cannot duplicate inherited holdings');

  const playerNpcEstate=createNewGame({seed:'npc-assets-player-heir'});playerNpcEstate.character.age=30;const playerParent=npcFixture(playerNpcEstate,'player-parent',60);playerParent.childIds=[playerNpcEstate.character.id];playerParent.wealth=60000;addNpcPropertyHolding(playerNpcEstate,playerParent,propertyHolding('player-inherited-home',80000,40000));addNpcBusinessHolding(playerNpcEstate,playerParent,businessHolding('player-inherited-business',30000));playerParent.life!.finance.debt=40000;playerParent.alive=false;const playerBeforeCash=playerNpcEstate.finances.cash;const playerInheritance=settleNpcEstateOnDeath(playerNpcEstate,playerParent);
  verify(playerNpcEstate.assets.properties.some(item=>item.id==='player-inherited-home')&&playerNpcEstate.businesses.some(item=>item.id==='player-inherited-business'),'adult player child receives retained NPC assets rather than aggregate cash');
  verify(playerNpcEstate.finances.liabilities.filter(item=>item.kind==='mortgage'&&item.assetId==='player-inherited-home').length===1,'adult player inherited property carries one mortgage liability');
  verify(playerNpcEstate.finances.cash-playerBeforeCash===1500,'adult player receives only NPC-estate liquid residual');
  verify(Number(playerNpcEstate.flags.inheritanceReceived)===playerInheritance.distributedValue&&Number(playerNpcEstate.flags.lifetimeInheritance)===playerInheritance.distributedValue,'NPC-to-player inheritance flags use the post-debt distributed share');

  const minorPlayerEstate=createNewGame({seed:'npc-assets-minor-player-heir'});minorPlayerEstate.character.age=16;const minorParent=npcFixture(minorPlayerEstate,'minor-player-parent',54);minorParent.childIds=[minorPlayerEstate.character.id];minorParent.wealth=60000;addNpcPropertyHolding(minorPlayerEstate,minorParent,propertyHolding('minor-player-home',80000,40000));addNpcBusinessHolding(minorPlayerEstate,minorParent,businessHolding('minor-player-business',30000));minorParent.life!.finance.debt=40000;minorParent.alive=false;const minorPlayerCash=minorPlayerEstate.finances.cash;settleNpcEstateOnDeath(minorPlayerEstate,minorParent);
  verify(Boolean(minorPlayerEstate.inheritance.trust),'minor player receives NPC-parent inheritance in the protected player trust');
  verify(minorPlayerEstate.finances.cash===minorPlayerCash&&minorPlayerEstate.assets.properties.every(item=>item.id!=='minor-player-home'),'minor player cannot immediately control NPC-parent inherited cash/property');
  verify(minorPlayerEstate.inheritance.trust!.properties.some(item=>item.id==='minor-player-home')&&minorPlayerEstate.inheritance.trust!.businesses.some(item=>item.id==='minor-player-business'),'minor player trust retains explicit NPC-parent assets');
  verify(Number(minorPlayerEstate.flags.lifetimeInheritance??0)===0&&Number(minorPlayerEstate.flags.inheritances??0)===0,'minor NPC-parent inheritance is pending rather than counted as received twice');
  const pendingMinorInheritance=Number(minorPlayerEstate.flags.inheritancePending??0);minorPlayerEstate.character.age=18;verify(releaseMatureInheritanceTrust(minorPlayerEstate),'minor NPC-parent trust releases at adulthood');
  verify(Number(minorPlayerEstate.flags.lifetimeInheritance)===pendingMinorInheritance&&Number(minorPlayerEstate.flags.inheritances)===1,'released NPC-parent inheritance is counted exactly once in lifetime inheritance history');
  verify(minorPlayerEstate.assets.properties.some(item=>item.id==='minor-player-home')&&minorPlayerEstate.businesses.some(item=>item.id==='minor-player-business'),'released player trust converts retained NPC-parent assets into playable ownership');

  const continuation=createNewGame({seed:'npc-assets-continuation'});continuation.character.age=62;continuation.currentYear=2088;continuation.finances.cash=0;const descendant=childFixture(continuation,'asset-descendant',32);descendant.wealth=20000;addNpcPropertyHolding(continuation,descendant,propertyHolding('descendant-home',100000,30000));addNpcBusinessHolding(continuation,descendant,businessHolding('descendant-business',40000));descendant.life!.finance.debt=40000;const parentHome=playerProperty(continuation,'parent-home',50000,10000);const parentBusiness=playerBusiness(continuation,'parent-business',20000);setEstateAssetBequest(continuation,'property',parentHome.id,descendant.id);setEstateAssetBequest(continuation,'business',parentBusiness.id,descendant.id);continuation.character.alive=false;
  verify(continueAsChild(continuation,descendant.id).success,'generational continuation succeeds for an NPC descendant with personal assets');
  verify(continuation.assets.properties.some(item=>item.id==='descendant-home')&&continuation.assets.properties.some(item=>item.id==='parent-home'),'continuation merges descendant-owned property with newly inherited parent property');
  verify(continuation.businesses.some(item=>item.id==='descendant-business')&&continuation.businesses.some(item=>item.id==='parent-business'),'continuation merges descendant-owned business with newly inherited parent business');
  verify(continuation.finances.liabilities.filter(item=>item.kind==='mortgage').length===2,'continuation converts each distinct property mortgage exactly once');
  verify(continuation.finances.liabilities.filter(item=>item.kind==='personal').reduce((sum,item)=>sum+item.balance,0)===10000,'continuation separates descendant unsecured debt from already represented mortgage debt');
  verify(continuation.finances.cash>=20000,'continuation preserves descendant liquid wealth in addition to any parent-estate residual');
  verify(new Set(continuation.assets.properties.map(item=>item.id)).size===continuation.assets.properties.length&&new Set(continuation.businesses.map(item=>item.id)).size===continuation.businesses.length,'continuation never duplicates asset ownership ids');
  verify(validateState(continuation).length===0,'continued descendant with merged family wealth remains state-valid');

  const cap=createNewGame({seed:'npc-assets-cap'});const capped=npcFixture(cap,'capped-heir',50);for(let i=0;i<MAX_NPC_PROPERTIES;i++)addNpcPropertyHolding(cap,capped,propertyHolding(`cap-home-${i}`,50000));const capWealth=capped.wealth;verify(!addNpcPropertyHolding(cap,capped,propertyHolding('overflow-home',60000,10000)),'NPC property portfolio rejects explicit holdings beyond its hard cap');verify(capped.wealth===capWealth+50000,'overflow inherited property is liquidated to equity rather than silently lost or duplicated');
  for(let i=0;i<MAX_NPC_BUSINESSES;i++)addNpcBusinessHolding(cap,capped,businessHolding(`cap-business-${i}`,20000));const businessCapWealth=capped.wealth;verify(!addNpcBusinessHolding(cap,capped,businessHolding('overflow-business',25000)),'NPC business portfolio rejects explicit interests beyond its hard cap');verify(capped.wealth===businessCapWealth+25000,'overflow inherited business is liquidated once instead of expanding the save without bound');
  verify(capped.assetPortfolio!.properties.length===MAX_NPC_PROPERTIES&&capped.assetPortfolio!.businesses.length===MAX_NPC_BUSINESSES,'portfolio caps stay structurally enforced');
  verify(validateState(enforceStateInvariants(cap)).length===0,'bounded maximum NPC portfolio remains state-valid');

  const trustCap=createNewGame({seed:'npc-assets-trust-cap'});const trustHeir=npcFixture(trustCap,'trust-cap-heir',12,'background');trustHeir.inheritanceTrust={releaseAge:18,value:0,liquidValue:0,properties:[],businesses:[]};const trustProperties=Array.from({length:MAX_NPC_PROPERTIES+2},(_,index)=>propertyHolding(`trust-home-${index}`,50000));const trustBusinesses=Array.from({length:MAX_NPC_BUSINESSES+2},(_,index)=>businessHolding(`trust-business-${index}`,20000));addNpcInheritanceTrustHoldings(trustHeir,trustProperties,trustBusinesses);
  verify(trustHeir.inheritanceTrust!.properties!.length===MAX_NPC_PROPERTIES&&trustHeir.inheritanceTrust!.businesses!.length===MAX_NPC_BUSINESSES,'minor NPC trust holdings obey the same hard cardinality caps as released portfolios');
  verify(trustHeir.inheritanceTrust!.liquidValue===140000,'minor NPC trust overflow is converted to liquid equity/value instead of expanding the save');
  verify(trustHeir.inheritanceTrust!.value===520000,'bounded trust still reconciles to the complete represented inheritance value');
  verify(validateState(enforceStateInvariants(trustCap)).length===0,'maximum bounded NPC inheritance trust remains state-valid');

  const scale=createNewGame({seed:'npc-assets-scale-world'});scale.character.age=35;scale.currentYear=2055;scale.npcs={};scale.relationships=[];scale.timeline=Array.from({length:3000},(_,index)=>({id:`scale-timeline-${index}`,year:2000+(index%55),age:index%100,category:'random' as const,importance:1 as const,text:`Scale history ${index}`}));
  for(let index=0;index<600;index++){const npc=npcFixture(scale,`scale-npc-${index}`,22+(index%35),'background');npc.wealth=100000+(index%9)*25000;}
  const scaleTimelineCount=scale.timeline.length;for(let year=0;year<12;year++){scale.currentYear+=1;scale.character.age+=1;processNpcLives(scale);}enforceStateInvariants(scale);const scaleNpcs=Object.values(scale.npcs);
  verify(scale.timeline.length===scaleTimelineCount,'large NPC-world processing preserves thousands of authoritative timeline entries instead of truncating history');
  verify(scaleNpcs.length>=600,'large NPC-world scale fixture remains populated after multi-year processing');
  verify(scaleNpcs.every(npc=>(npc.assetPortfolio?.properties.length??0)<=MAX_NPC_PROPERTIES&&(npc.assetPortfolio?.businesses.length??0)<=MAX_NPC_BUSINESSES),'hundreds of NPCs remain within per-person asset cardinality bounds across years');
  verify(scaleNpcs.filter(npc=>npc.simulationTier==='background').every(npc=>(npc.assetPortfolio?.properties.length??0)===0&&(npc.assetPortfolio?.businesses.length??0)===0),'background NPC population does not organically accumulate explicit asset records at scale');
  verify(validateState(scale).length===0,'hundreds-NPC multi-year asset simulation remains state-valid');

  const previewState=createNewGame({seed:'npc-assets-preview-readonly'});previewState.character.age=55;const previewChild=childFixture(previewState,'preview-child',28);playerProperty(previewState,'preview-home',70000);const beforePreview=JSON.stringify(previewState);previewEstate(previewState);verify(JSON.stringify(previewState)===beforePreview,'estate preview remains strictly read-only with NPC asset portfolios present');verify(previewChild.assetPortfolio!.properties.length===0,'estate preview does not prematurely assign player property to an NPC heir');

  return checks;
}
