import { countries } from '../data/countries';
import { validateState } from '../core/invariants';
import { estateRuleForCountry, quoteEstateAdministration } from '../data/estateRules';
import { createNewGame } from '../systems/CharacterSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { previewEstate, setEstateAssetBequest, setWill, settleEstate } from '../systems/EstateSystem';
import type { GameState, Npc, PropertyAsset, Relationship } from '../types/game';

function addChild(state:GameState,id:string,name:string,age=30):Npc{
  const npc:Npc={id,firstName:name,lastName:state.character.lastName,age,alive:true,health:90,happiness:75,wealth:0,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',traits:['responsible'],hiddenOpinion:75,memories:[],parentIds:[state.character.id],childIds:[],simulationTier:'background'};
  state.npcs[id]=npc;
  const relationship:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:85,attraction:0,compatibility:75,yearsKnown:age};
  state.relationships.push(relationship);
  return npc;
}

function addProperty(state:GameState,id:string,name:string,value:number):PropertyAsset{
  const asset:PropertyAsset={id,typeId:'starter_house_standard',name,location:state.character.city,purchasePrice:value,marketValue:value,condition:90,age:8,amenities:[]};
  state.assets.properties.push(asset);
  return asset;
}

function familyState(seed:string,cash=0,countryId='us'){
  const state=createNewGame({seed,countryId});
  state.character.age=62;
  state.currentYear=2088;
  state.finances.cash=cash;
  const a=addChild(state,`${seed}-a`,'Ari',34);
  const b=addChild(state,`${seed}-b`,'Bryn',29);
  return{state,a,b};
}

export function runEstateAdministrationRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Estate administration regression failed: ${message}`);}
  function approx(actual:number,expected:number,tolerance:number,message:string){verify(Math.abs(actual-expected)<=tolerance,`${message} (expected ${expected}±${tolerance}, got ${actual})`);}

  verify(countries.every(country=>{const rule=estateRuleForCountry(country.id);return rule.administrationRate>0&&rule.administrationAllowance>0&&rule.administrationCap>0&&rule.levyAllowance>0&&rule.levyRate>0;}),'every playable country resolves to a complete fictional estate rule');
  const light=estateRuleForCountry('sg');const structured=estateRuleForCountry('dk');
  verify(light.id==='light'&&structured.id==='structured','country fiscal context resolves to distinct estate rule bands');
  verify(structured.levyRate>light.levyRate&&structured.levyAllowance<light.levyAllowance,'higher-friction rule bands use a higher levy rate and lower protected allowance');
  verify(estateRuleForCountry('missing-country').id==='moderate','unknown countries use the deterministic moderate fallback');

  const quoted=quoteEstateAdministration('us',2_000_000,0);
  verify(quoted.countryName==='United States'&&quoted.rule.id==='moderate','US fixture resolves to its fictional moderate settlement profile');
  approx(quoted.administrationCosts,17_500,0,'administration cost applies only above the protected administration allowance');
  approx(quoted.levyBase,1_082_500,0,'levy base applies the protected levy allowance after administration');
  approx(quoted.estateLevy,48_713,0,'estate levy is calculated from the post-administration taxable base');
  approx(quoted.netEstateValue,1_933_787,0,'net estate subtracts administration and levy exactly once');

  const debtQuote=quoteEstateAdministration('us',2_000_000,400_000);
  approx(debtQuote.levyBase,682_500,0,'non-mortgage estate debt reduces the levy base before levy calculation');
  verify(debtQuote.estateLevy<quoted.estateLevy,'estate debt cannot increase the settlement levy');
  approx(debtQuote.totalObligations,448_213,0,'total obligations combine debt, administration, and levy once');

  const previewFixture=familyState('phase5b-preview',2_000_000,'us');const before=JSON.stringify(previewFixture.state);const rngBefore=previewFixture.state.rngCounter;const preview=previewEstate(previewFixture.state);
  verify(JSON.stringify(previewFixture.state)===before,'estate administration preview remains read-only');
  verify(previewFixture.state.rngCounter===rngBefore,'estate administration preview consumes no player RNG');
  approx(preview.grossEstateValue,2_000_000,0,'preview reports the gross candidate estate');
  approx(preview.administrationCosts,17_500,0,'preview exposes administration cost');
  approx(preview.estateLevy,48_713,0,'preview exposes estate levy');
  approx(preview.estateObligations,66_213,0,'preview exposes combined settlement obligations');
  approx(preview.distributableValue,1_933_787,1,'cash-only estate distributes the post-obligation value');
  verify(preview.ruleLabel==='Moderate settlement'&&preview.countryName==='United States','preview explains the fictional country rule used');

  const protectedFixture=familyState('phase5b-protected',1_000_000,'us');const protectedHome=addProperty(protectedFixture.state,'phase5b-home','Family Home',300_000);setWill(protectedFixture.state,[{npcId:protectedFixture.a.id,percentage:50},{npcId:protectedFixture.b.id,percentage:50}]);setEstateAssetBequest(protectedFixture.state,'property',protectedHome.id,protectedFixture.a.id);
  const protectedPreview=previewEstate(protectedFixture.state);
  verify(!protectedPreview.forcedSaleIds.includes(`property:${protectedHome.id}`),'cash pays settlement costs without disturbing a protected specific bequest');
  verify(protectedPreview.heirs.find(heir=>heir.npcId===protectedFixture.a.id)?.properties.some(property=>property.id===protectedHome.id),'specific property bequest survives ordinary administration and levy costs');

  const investmentProtection=familyState('phase5b-investment-protect',0,'us');const investmentHome=addProperty(investmentProtection.state,'investment-home','Protected Investment Home',1_000_000);setEstateAssetBequest(investmentProtection.state,'property',investmentHome.id,investmentProtection.a.id);investmentProtection.state.investments.positions=[{securityId:'aurora_index',units:1000,averageCost:100}];investmentProtection.state.investments.prices.aurora_index=100;
  const investmentProtectedPreview=previewEstate(investmentProtection.state);
  verify(!investmentProtectedPreview.forcedSaleIds.includes(`property:${investmentHome.id}`),'liquid investments settle obligations before a specifically bequeathed asset is forced to sell');
  verify(investmentProtectedPreview.heirs.find(heir=>heir.npcId===investmentProtection.a.id)?.properties.some(property=>property.id===investmentHome.id),'protected property remains assigned when investments can cover settlement costs');

  const forcedFixture=familyState('phase5b-forced',0,'us');const forcedHome=addProperty(forcedFixture.state,'forced-home','Only Estate Asset',2_000_000);setEstateAssetBequest(forcedFixture.state,'property',forcedHome.id,forcedFixture.a.id);const forcedPreview=previewEstate(forcedFixture.state);
  verify(forcedPreview.forcedSaleIds.includes(`property:${forcedHome.id}`),'a specific bequest can still be sold when no other estate value can pay settlement obligations');
  verify(!forcedPreview.heirs.some(heir=>heir.properties.some(property=>property.id===forcedHome.id)),'a forced-sold bequest is not duplicated into an heir allocation');
  verify(forcedPreview.distributableValue<forcedPreview.estateValue,'forced-sale friction remains visible instead of manufacturing full retained-asset value');

  const splitFixture=familyState('phase5b-split',1_000_000,'us');setWill(splitFixture.state,[{npcId:splitFixture.a.id,percentage:50},{npcId:splitFixture.b.id,percentage:50}]);const splitPreview=previewEstate(splitFixture.state);const siblingBefore=splitFixture.b.wealth;const splitSettlement=settleEstate(splitFixture.state,splitFixture.a.id);
  approx(splitSettlement.inheritanceValue+splitSettlement.siblingValue,splitPreview.distributableValue,1,'selected and offscreen heir values reconcile to the post-cost distributable estate');
  approx(splitFixture.b.wealth-siblingBefore,splitSettlement.siblingValue,1,'offscreen adult sibling receives only the post-cost inheritance allocated to them');
  approx(splitSettlement.administrationCosts,splitPreview.administrationCosts,0,'settlement preserves the previewed administration cost');
  approx(splitSettlement.estateLevy,splitPreview.estateLevy,0,'settlement preserves the previewed estate levy');

  const continuation=familyState('phase5b-continuation',1_500_000,'us');setWill(continuation.state,[{npcId:continuation.a.id,percentage:60},{npcId:continuation.b.id,percentage:40}]);const continuationPreview=previewEstate(continuation.state);const expectedHeir=continuationPreview.heirs.find(heir=>heir.npcId===continuation.a.id)!.inheritanceValue;continuation.state.character.alive=false;
  verify(continueAsChild(continuation.state,continuation.a.id).success,'adult descendant continuation succeeds through the post-cost estate settlement');
  approx(Number(continuation.state.flags.inheritanceReceived),expectedHeir,1,'descendant inheritance flag records the post-cost allocation rather than gross estate value');
  verify(continuation.state.timeline[0]?.text.includes('estate administration and settlement levy costs'),'generation handoff records that settlement costs were paid before inheritance');
  verify(continuation.state.saveVersion===12,'Phase 5B settlement remains intact after the Phase 5C schema migration');

  const minorFixture=familyState('phase5b-minor',900_000,'us');minorFixture.a.age=17;setWill(minorFixture.state,[{npcId:minorFixture.a.id,percentage:50},{npcId:minorFixture.b.id,percentage:50}]);const minorPreview=previewEstate(minorFixture.state);const minorExpected=minorPreview.heirs.find(heir=>heir.npcId===minorFixture.a.id)!.inheritanceValue;minorFixture.state.character.alive=false;
  verify(continueAsChild(minorFixture.state,minorFixture.a.id).success,'minor descendant continuation still succeeds with settlement costs enabled');
  approx(minorFixture.state.inheritance.trust?.inheritanceValue??-1,minorExpected,1,'minor trust contains only the descendant post-cost inheritance');
  verify(Number(minorFixture.state.flags.inheritancePending)===minorExpected,'pending inheritance reports the protected post-cost trust value');

  const dynasty=createNewGame({seed:'phase5b-dynasty',countryId:'us'});dynasty.character.age=62;dynasty.currentYear=2088;dynasty.finances.cash=2_000_000;let priorInheritance=Number.POSITIVE_INFINITY;
  for(let generation=0;generation<5;generation+=1){
    const heir=addChild(dynasty,`phase5b-dynasty-heir-${generation}`,`Heir${generation}`,30);
    const generationPreview=previewEstate(dynasty);const expected=generationPreview.heirs.find(entry=>entry.npcId===heir.id)!.inheritanceValue;
    verify(generationPreview.administrationCosts>0,'multi-generation wealthy estate continues to pay administration costs');
    verify(expected<priorInheritance,'repeated no-income dynasty succession cannot increase inherited wealth through estate duplication');
    dynasty.character.alive=false;
    verify(continueAsChild(dynasty,heir.id).success,'multi-generation post-cost succession completes');
    approx(Number(dynasty.flags.inheritanceReceived),expected,1,'each dynasty chapter receives exactly its previewed post-cost inheritance');
    verify(validateState(dynasty).length===0,'multi-generation post-cost succession preserves state invariants');
    priorInheritance=expected;dynasty.character.age=62;dynasty.currentYear+=32;
  }

  return checks;
}
