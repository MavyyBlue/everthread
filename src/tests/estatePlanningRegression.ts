import { createNewGame } from '../systems/CharacterSystem';
import { ageUp } from '../systems/AgingSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { checkDeath } from '../systems/DeathSystem';
import { previewEstate, setEstateAssetBequest, setEstateRetentionPreferences, setWill } from '../systems/EstateSystem';
import { migrateSave, SAVE_VERSION } from '../services/SaveSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import type { Business, CollectibleAsset, GameState, Npc, PropertyAsset, Relationship } from '../types/game';

function child(state:GameState,id:string,name:string,age=28):Npc{
  const npc:Npc={id,firstName:name,lastName:state.character.lastName,age,alive:true,health:88,happiness:76,wealth:0,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',traits:['responsible','patient'],hiddenOpinion:70,memories:[],parentIds:[state.character.id],childIds:[],simulationTier:'background'};
  state.npcs[id]=npc;ensureNpcLife(state,npc);
  const relationship:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:85,attraction:0,compatibility:75,yearsKnown:age};state.relationships.push(relationship);
  return npc;
}

function spouse(state:GameState,id='estate-spouse',name='Morgan',age=58):Npc{
  const npc:Npc={id,firstName:name,lastName:state.character.lastName,age,alive:true,health:88,happiness:76,wealth:20000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:45,maritalStatus:'married',traits:['loyal','responsible'],hiddenOpinion:80,memories:[],parentIds:[],childIds:[],simulationTier:'background'};
  state.npcs[id]=npc;ensureNpcLife(state,npc);
  state.relationships.push({id:`rel-${id}`,npcId:id,type:'spouse',score:88,attraction:80,compatibility:80,yearsKnown:20});
  return npc;
}

function property(state:GameState,id:string,name:string,value:number):PropertyAsset{
  const asset:PropertyAsset={id,typeId:'starter_house_standard',name,location:state.character.city,purchasePrice:value,marketValue:value,condition:85,age:10,amenities:[]};state.assets.properties.push(asset);return asset;
}
function collectible(state:GameState,id:string,name:string,value:number):CollectibleAsset{
  const asset:CollectibleAsset={id,itemId:'fixture-collectible',name,estimatedValue:value,authenticity:100,condition:90,rarity:'rare'};state.assets.collectibles.push(asset);return asset;
}
function business(state:GameState,id:string,name:string,value:number):Business{
  const asset:Business={id,industryId:'software',name,foundedAge:30,capital:100000,revenue:250000,expenses:150000,profit:100000,employees:8,demand:70,reputation:75,valuation:value,productIds:[],priceIndex:1,marketingBudget:10000,compensationIndex:1,bankrupt:false};state.businesses.push(asset);return asset;
}
function fixture(seed:string){const state=createNewGame({seed});state.character.age=60;state.currentYear=2086;state.finances.cash=120000;const a=child(state,'estate-a','Ari',32),b=child(state,'estate-b','Bryn',29);return{state,a,b};}

export function runEstatePlanningRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Estate planning regression failed: ${message}`);}
  function approx(actual:number,expected:number,tolerance:number,message:string){verify(Math.abs(actual-expected)<=tolerance,`${message} (expected ${expected}±${tolerance}, got ${actual})`);}

  const fresh=createNewGame({seed:'estate-schema-fresh'});
  verify(fresh.saveVersion===10&&SAVE_VERSION===10,'Phase 5A estate planning remains available on save schema 10');
  verify(Array.isArray(fresh.inheritance.assetBequests)&&fresh.inheritance.assetBequests.length===0,'new lives initialize an empty specific-bequest list');

  const legacy=createNewGame({seed:'estate-schema-legacy'});legacy.saveVersion=9;const legacyCounter=legacy.rngCounter;delete legacy.inheritance.assetBequests;
  const migrated=migrateSave(legacy);
  verify(migrated.saveVersion===10&&Array.isArray(migrated.inheritance.assetBequests),'existing v9 saves migrate deterministically while preserving estate-planning defaults');
  verify(migrated.rngCounter===legacyCounter,'estate migration normalization does not consume player RNG');

  const minor=createNewGame({seed:'estate-minor'});const minorChild=child(minor,'minor-child','Mina',1);
  verify(!setWill(minor,[{npcId:minorChild.id,percentage:100}]).success,'minors cannot author an estate plan');

  const base=fixture('estate-specific');const home=property(base.state,'family-home','Family Home',300000);const studio=business(base.state,'family-studio','Family Studio',240000);const heirloom=collectible(base.state,'heirloom','Silver Heirloom',60000);
  verify(setWill(base.state,[{npcId:base.a.id,percentage:70},{npcId:base.b.id,percentage:30}]).success,'adult residuary percentages can be set');
  verify(setEstateAssetBequest(base.state,'property',home.id,base.b.id).success,'a property can be specifically bequeathed');
  verify(setEstateAssetBequest(base.state,'business',studio.id,base.a.id).success,'a business can be specifically bequeathed');
  verify(setEstateAssetBequest(base.state,'collectible',heirloom.id,base.b.id).success,'a collectible can be specifically bequeathed');
  const beforePreview=JSON.stringify(base.state);const projected=previewEstate(base.state);
  verify(JSON.stringify(base.state)===beforePreview,'estate preview is strictly read-only');
  const previewA=projected.heirs.find(heir=>heir.npcId===base.a.id)!;const previewB=projected.heirs.find(heir=>heir.npcId===base.b.id)!;
  verify(previewB.properties.some(asset=>asset.id===home.id),'specific property bequest is attached to its named child in preview');
  verify(previewA.businesses.some(asset=>asset.id===studio.id),'specific business bequest is attached to its named child in preview');
  verify(previewB.collectibles.some(asset=>asset.id===heirloom.id),'specific collectible bequest is attached to its named child in preview');

  verify(setEstateRetentionPreferences(base.state,{inheritProperties:false,inheritBusinesses:false}).success,'retention preferences are controlled through the estate system');
  const retainedSpecific=previewEstate(base.state);
  verify(retainedSpecific.heirs.find(heir=>heir.npcId===base.b.id)?.properties.some(asset=>asset.id===home.id),'specific property bequest overrides the fallback unassigned-property sale preference');
  verify(retainedSpecific.heirs.find(heir=>heir.npcId===base.a.id)?.businesses.some(asset=>asset.id===studio.id),'specific business bequest overrides the fallback unassigned-business sale preference');

  const debt=fixture('estate-debt-priority');debt.state.finances.cash=0;const debtHome=property(debt.state,'debt-home','Protected Home',220000);const saleFirst=collectible(debt.state,'sale-first','Liquid Heirloom',100000);debt.state.finances.liabilities=[{id:'estate-personal',kind:'personal',principal:70000,balance:70000,annualRate:.08,annualPayment:8000,remainingYears:10}];
  setWill(debt.state,[{npcId:debt.a.id,percentage:50},{npcId:debt.b.id,percentage:50}]);setEstateAssetBequest(debt.state,'property',debtHome.id,debt.a.id);
  const debtPreview=previewEstate(debt.state);
  verify(debtPreview.forcedSaleIds.includes(`collectible:${saleFirst.id}`),'unassigned transferable assets are sold before a protected specific bequest to settle debt');
  verify(!debtPreview.forcedSaleIds.includes(`property:${debtHome.id}`),'specific bequest survives when other estate assets can satisfy obligations');

  const severe=fixture('estate-severe-debt');severe.state.finances.cash=0;const severeHome=property(severe.state,'severe-home','Last Asset Home',150000);collectible(severe.state,'small-item','Small Item',20000);severe.state.finances.liabilities=[{id:'huge-debt',kind:'personal',principal:400000,balance:400000,annualRate:.08,annualPayment:30000,remainingYears:12}];setEstateAssetBequest(severe.state,'property',severeHome.id,severe.a.id);
  const severePreview=previewEstate(severe.state);
  verify(severePreview.forcedSaleIds.includes(`property:${severeHome.id}`),'specific bequests can still be sold when estate obligations cannot otherwise be paid');
  verify(severePreview.distributableValue===0,'insolvent estates do not pass unsecured debt away while preserving heir value');

  const investmentDebt=fixture('estate-investment-debt');investmentDebt.state.finances.cash=0;investmentDebt.state.assets={properties:[],vehicles:[],collectibles:[]};investmentDebt.state.businesses=[];investmentDebt.state.investments.positions=[{securityId:'aurora_index',units:1000,averageCost:100}];investmentDebt.state.investments.prices.aurora_index=100;investmentDebt.state.finances.liabilities=[{id:'investment-debt',kind:'personal',principal:60000,balance:60000,annualRate:.08,annualPayment:8000,remainingYears:8}];
  const investmentPreview=previewEstate(investmentDebt.state);approx(investmentPreview.distributableValue,100000-investmentPreview.estateObligations,1,'estate debt and settlement costs are paid from investments before remaining units pass to heirs');

  const zeroShare=fixture('estate-zero-share');zeroShare.state.finances.cash=0;const zeroHome=property(zeroShare.state,'zero-home','Named Home',180000);setWill(zeroShare.state,[{npcId:zeroShare.a.id,percentage:100}]);setEstateAssetBequest(zeroShare.state,'property',zeroHome.id,zeroShare.b.id);
  const zeroPreview=previewEstate(zeroShare.state);const zeroB=zeroPreview.heirs.find(heir=>heir.npcId===zeroShare.b.id)!;
  verify(zeroB.percentage===0&&zeroB.properties.some(asset=>asset.id===zeroHome.id),'a child with a zero residuary share can still receive a valid specific bequest');

  const handoff=fixture('estate-handoff');handoff.state.finances.cash=50000;const handoffHome=property(handoff.state,'handoff-home','Handoff Home',250000);setWill(handoff.state,[{npcId:handoff.a.id,percentage:40},{npcId:handoff.b.id,percentage:60}]);setEstateAssetBequest(handoff.state,'property',handoffHome.id,handoff.a.id);const handoffPreview=previewEstate(handoff.state);const expected=handoffPreview.heirs.find(heir=>heir.npcId===handoff.a.id)!.inheritanceValue;handoff.state.character.alive=false;
  verify(continueAsChild(handoff.state,handoff.a.id).success,'continuation succeeds with an estate plan');
  verify(handoff.state.assets.properties.some(asset=>asset.id===handoffHome.id),'selected adult descendant receives the property specifically bequeathed to them');
  approx(Number(handoff.state.flags.inheritanceReceived),expected,1,'actual continuation inheritance matches the pre-handoff estate preview');
  verify(handoff.state.inheritance.will.length===0&&(handoff.state.inheritance.assetBequests?.length??0)===0,'a deceased parent estate plan does not leak into the new protagonist generation');

  const deadBeneficiary=fixture('estate-dead-beneficiary');const deadHome=property(deadBeneficiary.state,'dead-home','Fallback Home',120000);setEstateAssetBequest(deadBeneficiary.state,'property',deadHome.id,deadBeneficiary.b.id);deadBeneficiary.b.alive=false;
  const deadPreview=previewEstate(deadBeneficiary.state);
  verify(!deadPreview.heirs.some(heir=>heir.npcId===deadBeneficiary.b.id),'dead descendants are removed from estate allocations');
  verify(deadPreview.heirs.some(heir=>heir.properties.some(asset=>asset.id===deadHome.id))||deadPreview.forcedSaleIds.includes(`property:${deadHome.id}`),'an invalidated bequest returns to normal estate handling instead of disappearing');

  const spouseEstate=fixture('estate-spouse-default');const surviving=spouse(spouseEstate.state);spouseEstate.state.finances.cash=400000;
  setWill(spouseEstate.state,[{npcId:spouseEstate.a.id,percentage:70},{npcId:spouseEstate.b.id,percentage:30}]);
  const spousePreview=previewEstate(spouseEstate.state);const spouseShare=spousePreview.heirs.find(heir=>heir.npcId===surviving.id);const spouseA=spousePreview.heirs.find(heir=>heir.npcId===spouseEstate.a.id);const spouseB=spousePreview.heirs.find(heir=>heir.npcId===spouseEstate.b.id);
  approx(spouseShare?.percentage??0,50,.01,'a legacy child-only will reserves the default surviving-spouse half');
  approx(spouseA?.percentage??0,35,.01,'legacy child shares are proportionally applied inside the descendant half');
  approx(spouseB?.percentage??0,15,.01,'legacy child shares preserve their relative weighting inside the descendant half');
  verify(setWill(spouseEstate.state,[{npcId:surviving.id,percentage:25},{npcId:spouseEstate.a.id,percentage:50},{npcId:spouseEstate.b.id,percentage:25}]).success,'new estate plans can explicitly include a surviving spouse');
  verify(setEstateAssetBequest(spouseEstate.state,'collectible',collectible(spouseEstate.state,'spouse-heirloom','Spouse Heirloom',25000).id,surviving.id).success,'specific assets can be left to a spouse');

  const widowState=fixture('estate-widow-state');const widow=spouse(widowState.state,'widow-spouse','Jamie',59);verify(checkDeath(widowState.state,true),'forced death did not occur');
  verify(widow.maritalStatus==='widowed','surviving spouse marital status did not transition to widowed at death');
  verify(widow.memories.some(memory=>memory.kind==='bereavement'),'surviving spouse did not retain a bereavement memory');
  verify(previewEstate(widowState.state).heirs.some(heir=>heir.npcId===widow.id&&heir.role==='spouse'),'widowed survivor is still recognized as the deceased character spouse for estate settlement');

  const trustState=createNewGame({seed:'estate-minor-trust'});trustState.character.age=48;trustState.currentYear=2074;trustState.finances.cash=250000;const teen=child(trustState,'teen-heir','Tess',17);const trustHome=property(trustState,'trust-home','Trust Home',300000);setEstateAssetBequest(trustState,'property',trustHome.id,teen.id);const trustPreview=previewEstate(trustState);const trustExpected=trustPreview.heirs.find(heir=>heir.npcId===teen.id)!.inheritanceValue;trustState.character.alive=false;
  verify(continueAsChild(trustState,teen.id).success,'minor descendant continuation failed');
  verify(Boolean(trustState.inheritance.trust)&&Number(trustState.flags.inheritancePending)===trustExpected,'minor inheritance was not placed into the protected trust');
  verify(trustState.assets.properties.length===0&&trustState.finances.cash<trustExpected,'minor could immediately control inherited property or fortune');
  verify(ageUp(trustState).success,'minor heir could not age to trust release');
  verify(trustState.character.age===18&&!trustState.inheritance.trust,'protected inheritance did not release at age 18');
  verify(trustState.assets.properties.some(asset=>asset.id===trustHome.id),'specifically inherited property did not transfer from trust at adulthood');
  verify(Number(trustState.flags.inheritanceReceived)===trustExpected&&Number(trustState.flags.inheritancePending)===0,'inheritance receipt flags did not move from pending to received at adulthood');

  const siblingTrust=fixture('estate-offscreen-minor');siblingTrust.b.age=12;siblingTrust.state.finances.cash=200000;setWill(siblingTrust.state,[{npcId:siblingTrust.a.id,percentage:50},{npcId:siblingTrust.b.id,percentage:50}]);const beforeMinorWealth=siblingTrust.b.wealth;siblingTrust.state.character.alive=false;
  verify(continueAsChild(siblingTrust.state,siblingTrust.a.id).success,'adult sibling continuation failed in minor sibling trust scenario');
  const offscreenMinor=siblingTrust.state.npcs[siblingTrust.b.id];verify(Boolean(offscreenMinor?.inheritanceTrust)&&offscreenMinor?.wealth===beforeMinorWealth,'offscreen minor sibling received spendable inheritance before adulthood');

  return checks;
}
