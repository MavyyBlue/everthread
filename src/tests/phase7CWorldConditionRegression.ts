import { lifeEvents } from '../data/events';
import { worldConditionById, worldConditionDefinitions } from '../data/worldConditions';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import {
  MAX_ACTIVE_WORLD_CONDITIONS,
  MAX_WORLD_CONDITION_HISTORY,
  activeWorldConditionCards,
  processWorldConditionsYear,
  relevantWorldConditions,
  worldConditionModifiers,
} from '../systems/WorldConditionSystem';
import { processEconomyYear } from '../systems/EconomySystem';
import { initializeMarket, processMarketYear } from '../systems/InvestmentSystem';
import { processBusinessesYear } from '../systems/BusinessSystem';
import { processPropertiesYear } from '../systems/PropertySystem';
import { travel } from '../systems/TravelSystem';
import { fameActivity, processFameYear } from '../systems/FameSystem';
import { processAnnualFinance } from '../systems/FinanceSystem';
import { exportSave, importSave, migrateSave } from '../services/SaveSystem';
import type { GameState, WorldConditionIntensity, WorldConditionRecord } from '../types/game';

function adult(seed:string,countryId='us'){
  const state=createNewGame({seed,countryId});state.character.age=30;state.currentYear=2056;state.flags.financiallyIndependent=true;state.flags.financialSupportChoiceMade=true;state.finances.cash=500_000;return state;
}
function attachCondition(state:GameState,definitionId:string,intensity:WorldConditionIntensity=2,countryId=state.character.countryId){
  const definition=worldConditionById[definitionId];if(!definition)throw new Error(`Missing world-condition fixture ${definitionId}`);
  const condition:WorldConditionRecord={id:`fixture-${definitionId}-${countryId}`,definitionId,scope:definition.scope,...(definition.scope==='country'?{countryId}:{}),startYear:state.currentYear,endYear:state.currentYear+2,intensity};
  state.worldConditions.active.push(condition);state.worldConditions.lastStartedYearByDefinition[definitionId]=state.currentYear;return condition;
}
function businessFixture(state:GameState){state.businesses=[{id:'biz-world-test',industryId:'coffee',name:'World Test Coffee',foundedAge:25,capital:150_000,revenue:0,expenses:0,profit:0,employees:8,demand:60,reputation:60,valuation:200_000,productIds:['coffee_product_1'],priceIndex:1,marketingBudget:4_000,compensationIndex:1,bankrupt:false}];}
function propertyFixture(state:GameState){state.assets.properties=[{id:'home-world-test',typeId:'starter_house_standard',name:'World Test Home',location:state.character.city,purchasePrice:250_000,marketValue:250_000,condition:90,age:2,amenities:[]}];}

export function runPhase7CWorldConditionRegression(){
  let checks=0;function check(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 7C world-condition regression failed: ${message}`);}

  const ids=worldConditionDefinitions.map(definition=>definition.id);
  check(worldConditionDefinitions.length===7&&new Set(ids).size===7,'01 7C must expose seven unique data-driven persistent world-condition definitions');
  check(worldConditionDefinitions.every(definition=>definition.durationRange[0]>=1&&definition.durationRange[1]>=definition.durationRange[0]&&definition.cooldownYears>=definition.durationRange[0]),'02 every condition must have a bounded positive duration and cooldown');
  check(worldConditionDefinitions.every(definition=>definition.effectSummary.length>0&&Object.keys(definition.effects).length>0),'03 every condition must explain and actually carry systemic modifiers');
  check(lifeEvents.length===691&&worldConditionDefinitions.every(definition=>!lifeEvents.some(event=>event.id===definition.id)),'04 world conditions must remain outside the 691 ordinary random-event pool');

  const fresh=adult('phase7c-fresh');
  check(fresh.saveVersion===14&&fresh.worldConditions.active.length===0&&fresh.worldConditions.history.length===0,'05 new games must initialize schema 14 with an empty bounded world-condition state');
  const legacy=structuredClone(fresh) as GameState;delete (legacy as unknown as {worldConditions?:GameState['worldConditions']}).worldConditions;legacy.saveVersion=13;const legacyRng=legacy.rngCounter;const legacyId=legacy.idCounter;const migrated=migrateSave(legacy);
  check(migrated.saveVersion===14&&migrated.worldConditions.active.length===0&&migrated.worldConditions.history.length===0,'06 schema-13 migration must add empty world-condition state without retroactive history');
  check(migrated.rngCounter===legacyRng&&migrated.idCounter===legacyId,'07 world-condition migration must be RNG-neutral and runtime-ID-neutral');
  const migratedAgain=migrateSave(structuredClone(migrated));check(JSON.stringify(migratedAgain.worldConditions)===JSON.stringify(migrated.worldConditions),'08 migration must be idempotent');

  const a=adult('phase7c-deterministic');const b=adult('phase7c-deterministic');const aRng=a.rngCounter;const startsByDefinition=new Map<string,number[]>();let conflictFree=true;
  for(let year=0;year<120;year++){
    a.character.age+=1;a.currentYear+=1;b.character.age+=1;b.currentYear+=1;const beforeIds=new Set(a.worldConditions.active.map(item=>item.id));processWorldConditionsYear(a);processWorldConditionsYear(b);
    for(const item of a.worldConditions.active)if(!beforeIds.has(item.id)){const years=startsByDefinition.get(item.definitionId)??[];years.push(item.startYear);startsByDefinition.set(item.definitionId,years);}
    for(let i=0;i<a.worldConditions.active.length;i++)for(let j=i+1;j<a.worldConditions.active.length;j++){const left=a.worldConditions.active[i]!,right=a.worldConditions.active[j]!,leftDef=worldConditionById[left.definitionId],rightDef=worldConditionById[right.definitionId];const sameRegion=left.scope===right.scope&&(left.scope==='global'||left.countryId===right.countryId);if(sameRegion&&leftDef?.exclusiveGroup===rightDef?.exclusiveGroup)conflictFree=false;}
  }
  check(JSON.stringify(a.worldConditions)===JSON.stringify(b.worldConditions),'09 identical seed/year histories must generate identical persistent conditions');
  check(a.rngCounter===aRng&&b.rngCounter===aRng,'10 annual world-condition generation must not consume the shared gameplay RNG counter');
  check(a.worldConditions.active.length<=MAX_ACTIVE_WORLD_CONDITIONS&&a.worldConditions.history.length<=MAX_WORLD_CONDITION_HISTORY,'11 active conditions and completed history must remain bounded across a century');
  check(a.worldConditions.history.length>0&&startsByDefinition.size>0,'12 long simulation must actually produce and resolve persistent conditions');
  check(conflictFree,'13 mutually exclusive conditions must never overlap in the same scope/region');
  let cooldownsValid=true;for(const [definitionId,years] of startsByDefinition){const cooldown=worldConditionById[definitionId]!.cooldownYears;for(let i=1;i<years.length;i++)if(years[i]!-years[i-1]!<cooldown)cooldownsValid=false;}check(cooldownsValid,'14 repeated conditions must honor their durable cooldown years');

  const expiry=adult('phase7c-expiry');const expiring=attachCondition(expiry,'housing_squeeze');expiring.endYear=expiry.currentYear;const expiryRng=expiry.rngCounter;expiry.currentYear+=1;expiry.character.age+=1;processWorldConditionsYear(expiry);
  check(!expiry.worldConditions.active.some(item=>item.id===expiring.id)&&expiry.worldConditions.history.some(item=>item.id===expiring.id),'15 expired conditions must leave active state and enter bounded history');
  check(expiry.timeline.some(item=>item.category==='world'&&item.title==='World condition eased'),'16 relevant condition expiration must be inspectable in the life timeline');
  check(expiry.rngCounter===expiryRng,'17 expiration/bookkeeping must remain RNG-neutral');

  const locality=adult('phase7c-locality','us');attachCondition(locality,'housing_squeeze',2,'us');attachCondition(locality,'travel_disruption');locality.character.countryId='ca';
  const caModifiers=worldConditionModifiers(locality);check(caModifiers.housingGrowthRateDelta===0&&caModifiers.travelCostMultiplier>1,'18 emigrating away must stop old-country modifiers while global conditions continue');
  check(relevantWorldConditions(locality).length===1&&relevantWorldConditions(locality)[0]?.definitionId==='travel_disruption','19 relevant-condition projection must filter out conditions from a former country');
  const caCards=activeWorldConditionCards(locality);check(caCards.length===1&&caCards[0]?.scopeLabel==='Global'&&caCards[0].remainingYears===3,'20 player-facing condition cards must show only relevant scope with remaining duration');
  locality.character.countryId='us';const usCards=activeWorldConditionCards(locality);check(usCards.length===2&&usCards.some(card=>card.scopeLabel==='United States'),'21 returning to the affected country must reveal its still-active national condition');

  const economyBase=adult('phase7c-economy');economyBase.economy={inflationIndex:1,housingIndex:1,salaryIndex:1,businessDemandIndex:1,year:economyBase.currentYear};const growth=structuredClone(economyBase);const slowdown=structuredClone(economyBase);const cost=structuredClone(economyBase);const housing=structuredClone(economyBase);attachCondition(growth,'growth_wave');attachCondition(slowdown,'economic_slowdown');attachCondition(cost,'cost_surge');attachCondition(housing,'housing_squeeze');
  processEconomyYear(economyBase);processEconomyYear(growth);processEconomyYear(slowdown);processEconomyYear(cost);processEconomyYear(housing);
  check(growth.economy.salaryIndex>economyBase.economy.salaryIndex&&growth.economy.businessDemandIndex>economyBase.economy.businessDemandIndex&&growth.economy.housingIndex>economyBase.economy.housingIndex,'22 Growth Wave must flow through salary, business-demand, and housing economy authorities');
  check(slowdown.economy.salaryIndex<economyBase.economy.salaryIndex&&slowdown.economy.businessDemandIndex<economyBase.economy.businessDemandIndex&&slowdown.economy.housingIndex<economyBase.economy.housingIndex,'23 Economic Slowdown must suppress the same authoritative economy indices');
  check(cost.economy.inflationIndex>economyBase.economy.inflationIndex,'24 Cost Surge must raise authoritative inflation pressure');
  check(housing.economy.housingIndex>economyBase.economy.housingIndex,'25 Housing Squeeze must raise the authoritative housing index');
  check([growth,slowdown,cost,housing].every(state=>state.rngCounter===economyBase.rngCounter),'26 condition modifiers must not add extra EconomySystem RNG draws');

  const businessControl=structuredClone(economyBase);const businessGrowth=structuredClone(growth);businessFixture(businessControl);businessFixture(businessGrowth);processBusinessesYear(businessControl);processBusinessesYear(businessGrowth);
  check(businessGrowth.businesses[0]!.revenue>businessControl.businesses[0]!.revenue,'27 stronger world demand must increase revenue through the existing BusinessSystem formula');
  check(businessGrowth.rngCounter===businessControl.rngCounter,'28 business integration must preserve the existing RNG draw shape');

  const propertyControl=structuredClone(economyBase);const propertyHousing=structuredClone(housing);propertyFixture(propertyControl);propertyFixture(propertyHousing);processPropertiesYear(propertyControl);processPropertiesYear(propertyHousing);
  check(propertyHousing.assets.properties[0]!.marketValue>propertyControl.assets.properties[0]!.marketValue,'29 stronger housing conditions must flow through existing property valuation');
  check(propertyHousing.rngCounter===propertyControl.rngCounter,'30 property integration must preserve the existing RNG draw shape');

  const marketControl=adult('phase7c-market');const marketJitters=structuredClone(marketControl);attachCondition(marketJitters,'market_jitters');initializeMarket(marketControl);initializeMarket(marketJitters);processMarketYear(marketControl);processMarketYear(marketJitters);
  const controlBond=marketControl.investments.prices.civic_bond!;const jitterBond=marketJitters.investments.prices.civic_bond!;check(jitterBond!==controlBond&&worldConditionModifiers(marketJitters).investmentVolatilityMultiplier>1&&worldConditionModifiers(marketJitters).investmentDriftDelta<0,'31 Market Jitters must alter actual market evolution through drift/volatility modifiers');
  check(marketJitters.rngCounter===marketControl.rngCounter,'32 market conditions must not add extra InvestmentSystem RNG draws');

  const travelControl=adult('phase7c-travel','us');const travelDisrupted=structuredClone(travelControl);attachCondition(travelDisrupted,'travel_disruption');const travelCash=travelControl.finances.cash;const normalTrip=travel(travelControl,'ca');const disruptedTrip=travel(travelDisrupted,'ca');
  check(normalTrip.success&&disruptedTrip.success&&travelDisrupted.finances.cash<travelControl.finances.cash&&travelControl.finances.cash<travelCash,'33 Travel Disruption must raise the cost charged by the existing TravelSystem');

  const fameControl=adult('phase7c-fame');const fameMedia=structuredClone(fameControl);fameControl.fame.followers=20_000;fameControl.fame.engagement=60;fameMedia.fame.followers=20_000;fameMedia.fame.engagement=60;attachCondition(fameMedia,'media_frenzy');processFameYear(fameControl);processFameYear(fameMedia);
  check(fameMedia.fame.followers>fameControl.fame.followers,'34 Media Frenzy must increase organic follower growth through FameSystem');
  check(fameMedia.rngCounter===fameControl.rngCounter,'35 media conditions must preserve FameSystem RNG draw shape');
  const publicControl=adult('phase7c-publicity');const publicMedia=structuredClone(publicControl);publicControl.fame.fame=40;publicMedia.fame.fame=40;attachCondition(publicMedia,'media_frenzy');const publicCash=publicControl.finances.cash;const publicMediaCash=publicMedia.finances.cash;const normalCommercial=fameActivity(publicControl,'commercial');const frenzyCommercial=fameActivity(publicMedia,'commercial');
  check(normalCommercial.success&&frenzyCommercial.success&&(publicMedia.finances.cash-publicMediaCash)>(publicControl.finances.cash-publicCash),'36 Media Frenzy must increase actual paid publicity opportunities without bypassing FameSystem');

  const financeControl=adult('phase7c-finance');const financeCost=structuredClone(financeControl);financeControl.finances.cash=100_000;financeCost.finances.cash=100_000;attachCondition(financeCost,'cost_surge');processAnnualFinance(financeControl);processAnnualFinance(financeCost);
  check(financeCost.finances.annualExpenses>financeControl.finances.annualExpenses&&financeCost.finances.cash<financeControl.finances.cash,'37 Cost Surge must increase real household expenses through FinanceSystem rather than a flavor-only stat');

  const saved=adult('phase7c-save');const savedCondition=attachCondition(saved,'media_frenzy',3);const roundTrip=importSave(exportSave(saved));const restored=roundTrip.worldConditions.active.find(item=>item.id===savedCondition.id);
  check(restored?.definitionId==='media_frenzy'&&restored.intensity===3&&restored.endYear===savedCondition.endYear,'38 save round-trip must preserve exact condition identity, intensity, and duration');
  check(roundTrip.saveVersion===14&&validateState(roundTrip).length===0,'39 restored Phase 7C state must validate on schema 14');

  const queueIsolation=adult('phase7c-queue-isolation');const delayedBefore=queueIsolation.delayedEvents.length;const pendingBefore=queueIsolation.pendingEvent;for(let i=0;i<20;i++){queueIsolation.currentYear+=1;queueIsolation.character.age+=1;processWorldConditionsYear(queueIsolation);}
  check(queueIsolation.delayedEvents.length===delayedBefore&&queueIsolation.pendingEvent===pendingBefore,'40 world conditions must not create a parallel delayed-event/pending-event queue');
  check(queueIsolation.worldConditions.active.every(condition=>condition.scope==='global'||Boolean(condition.countryId)),'41 every active national condition must retain its exact country scope');
  check(validateState(queueIsolation).length===0,'42 generated 7C state must satisfy global invariants after repeated annual processing');

  return checks;
}
