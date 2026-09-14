import type { GameState, WorldConditionIntensity, WorldConditionModifiers, WorldConditionRecord, WorldConditionState } from '../types/game';
import { worldConditionById, worldConditionDefinitions } from '../data/worldConditions';
import { countryById } from '../data/countries';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';

export const MAX_ACTIVE_WORLD_CONDITIONS=4;
export const MAX_WORLD_CONDITION_HISTORY=48;
const WORLD_CONDITION_START_CHANCE_EMPTY=.34;
const WORLD_CONDITION_START_CHANCE_ONE=.22;
const WORLD_CONDITION_START_CHANCE_BUSY=.10;

export function createEmptyWorldConditionState():WorldConditionState{
  return{active:[],history:[],lastStartedYearByDefinition:{}};
}

function validIntensity(value:unknown):WorldConditionIntensity{
  const number=Math.round(Number(value));return number<=1?1:number>=3?3:2;
}

function normalizeRecord(raw:Partial<WorldConditionRecord>,fallbackYear:number):WorldConditionRecord|undefined{
  const definition=typeof raw.definitionId==='string'?worldConditionById[raw.definitionId]:undefined;if(!definition)return undefined;
  const startYear=Number.isFinite(raw.startYear)?Math.floor(Number(raw.startYear)):fallbackYear;
  const endYear=Math.max(startYear,Number.isFinite(raw.endYear)?Math.floor(Number(raw.endYear)):startYear);
  const scope=definition.scope;
  const countryId=scope==='country'&&typeof raw.countryId==='string'&&raw.countryId?raw.countryId:undefined;
  if(scope==='country'&&!countryId)return undefined;
  return{id:typeof raw.id==='string'&&raw.id?raw.id:`world-${definition.id}-${countryId??'global'}-${startYear}`,definitionId:definition.id,scope,countryId,startYear,endYear,intensity:validIntensity(raw.intensity)};
}

export function ensureWorldConditionState(state:GameState):WorldConditionState{
  const raw=(state as GameState&{worldConditions?:WorldConditionState}).worldConditions??createEmptyWorldConditionState();
  const seen=new Set<string>();const active:WorldConditionRecord[]=[];
  for(const item of Array.isArray(raw.active)?raw.active:[]){const normalized=normalizeRecord(item,state.currentYear);if(!normalized||seen.has(normalized.id))continue;seen.add(normalized.id);active.push(normalized);if(active.length>=MAX_ACTIVE_WORLD_CONDITIONS)break;}
  const history=(Array.isArray(raw.history)?raw.history:[]).map(item=>{const normalized=normalizeRecord(item,state.currentYear);if(!normalized)return undefined;return{...normalized,resolvedYear:Math.max(normalized.endYear,Number.isFinite(item.resolvedYear)?Math.floor(Number(item.resolvedYear)):normalized.endYear)};}).filter((item):item is NonNullable<typeof item>=>Boolean(item)).slice(-MAX_WORLD_CONDITION_HISTORY);
  const lastStartedYearByDefinition:Record<string,number>={};
  for(const [id,year] of Object.entries(raw.lastStartedYearByDefinition??{}))if(worldConditionById[id]&&Number.isFinite(year))lastStartedYearByDefinition[id]=Math.floor(Number(year));
  state.worldConditions={active,history,lastStartedYearByDefinition};return state.worldConditions;
}

export function migrateWorldConditionState(state:GameState){ensureWorldConditionState(state);}

function sameRegion(condition:WorldConditionRecord,scope:'global'|'country',countryId?:string){return condition.scope===scope&&(scope==='global'||condition.countryId===countryId);}
function intensityScale(intensity:WorldConditionIntensity){return intensity===1?.75:intensity===3?1.25:1;}

export function relevantWorldConditions(state:GameState,countryId=state.character.countryId){
  const active=(state.worldConditions?.active??[]);return active.filter(condition=>condition.scope==='global'||condition.countryId===countryId);
}

export function worldConditionModifiers(state:GameState,countryId=state.character.countryId):WorldConditionModifiers{
  const result:WorldConditionModifiers={inflationRateDelta:0,salaryGrowthRateDelta:0,housingGrowthRateDelta:0,businessDemandGrowthRateDelta:0,jobApplicationScoreDelta:0,layoffChanceDelta:0,investmentDriftDelta:0,investmentVolatilityMultiplier:1,travelCostMultiplier:1,fameOrganicGrowthMultiplier:1,fameScandalChanceDelta:0,publicityPayMultiplier:1,householdCostMultiplier:1};
  for(const condition of relevantWorldConditions(state,countryId)){
    const definition=worldConditionById[condition.definitionId];if(!definition)continue;const scale=intensityScale(condition.intensity);const effects=definition.effects;
    result.inflationRateDelta+=(effects.inflationRateDelta??0)*scale;
    result.salaryGrowthRateDelta+=(effects.salaryGrowthRateDelta??0)*scale;
    result.housingGrowthRateDelta+=(effects.housingGrowthRateDelta??0)*scale;
    result.businessDemandGrowthRateDelta+=(effects.businessDemandGrowthRateDelta??0)*scale;
    result.jobApplicationScoreDelta+=(effects.jobApplicationScoreDelta??0)*scale;
    result.layoffChanceDelta+=(effects.layoffChanceDelta??0)*scale;
    result.investmentDriftDelta+=(effects.investmentDriftDelta??0)*scale;
    result.fameScandalChanceDelta+=(effects.fameScandalChanceDelta??0)*scale;
    for(const [key,base] of [
      ['investmentVolatilityMultiplier',effects.investmentVolatilityMultiplier],['travelCostMultiplier',effects.travelCostMultiplier],['fameOrganicGrowthMultiplier',effects.fameOrganicGrowthMultiplier],['publicityPayMultiplier',effects.publicityPayMultiplier],['householdCostMultiplier',effects.householdCostMultiplier],
    ] as const)if(base!==undefined)result[key]*=1+(base-1)*scale;
  }
  result.jobApplicationScoreDelta=clamp(result.jobApplicationScoreDelta,-20,20);
  result.layoffChanceDelta=clamp(result.layoffChanceDelta,-.04,.06);
  result.investmentVolatilityMultiplier=clamp(result.investmentVolatilityMultiplier,.5,2);
  result.travelCostMultiplier=clamp(result.travelCostMultiplier,.6,2.5);
  result.fameOrganicGrowthMultiplier=clamp(result.fameOrganicGrowthMultiplier,.5,2);
  result.fameScandalChanceDelta=clamp(result.fameScandalChanceDelta,-.03,.05);
  result.publicityPayMultiplier=clamp(result.publicityPayMultiplier,.5,1.75);
  result.householdCostMultiplier=clamp(result.householdCostMultiplier,.7,1.5);
  return result;
}

function conditionScopeLabel(state:GameState,condition:WorldConditionRecord){return condition.scope==='global'?'Global':countryById[condition.countryId??'']?.name??'National';}
function conditionDetail(condition:WorldConditionRecord){const definition=worldConditionById[condition.definitionId];return definition?.effectSummary.join(' ')??'';}

export function activeWorldConditionCards(state:GameState){
  return relevantWorldConditions(state).map(condition=>{const definition=worldConditionById[condition.definitionId]!;return{id:condition.id,title:definition.title,description:definition.description,scopeLabel:conditionScopeLabel(state,condition),intensityLabel:condition.intensity===1?'Mild':condition.intensity===3?'Severe':'Strong',remainingYears:Math.max(1,condition.endYear-state.currentYear+1),effectSummary:definition.effectSummary};}).sort((a,b)=>a.scopeLabel.localeCompare(b.scopeLabel)||a.title.localeCompare(b.title));
}

function expireConditions(state:GameState){
  const world=ensureWorldConditionState(state);const next:WorldConditionRecord[]=[];
  for(const condition of world.active){
    if(condition.endYear>=state.currentYear){next.push(condition);continue;}
    world.history.push({...condition,resolvedYear:condition.endYear});
    if(condition.scope==='global'||condition.countryId===state.character.countryId){const definition=worldConditionById[condition.definitionId];state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'world',importance:1,title:'World condition eased',text:`${definition?.title??'A persistent condition'} has eased after shaping the previous few years.`});}
  }
  world.active=next.slice(-MAX_ACTIVE_WORLD_CONDITIONS);world.history=world.history.slice(-MAX_WORLD_CONDITION_HISTORY);
}

export function processWorldConditionsYear(state:GameState){
  expireConditions(state);const world=ensureWorldConditionState(state);if(world.active.length>=MAX_ACTIVE_WORLD_CONDITIONS)return;
  const localCount=relevantWorldConditions(state).length;const startChance=localCount===0?WORLD_CONDITION_START_CHANCE_EMPTY:localCount===1?WORLD_CONDITION_START_CHANCE_ONE:WORLD_CONDITION_START_CHANCE_BUSY;
  const rng=createRng(`${state.seed}-world-conditions-${state.currentYear}-${state.character.countryId}`,0);if(!rng.chance(startChance))return;
  const candidates=worldConditionDefinitions.filter(definition=>{
    const targetCountry=definition.scope==='country'?state.character.countryId:undefined;
    const lastStart=world.lastStartedYearByDefinition[definition.id];if(lastStart!==undefined&&state.currentYear-lastStart<definition.cooldownYears)return false;
    if(world.active.some(condition=>condition.definitionId===definition.id&&sameRegion(condition,definition.scope,targetCountry)))return false;
    return !world.active.some(condition=>{const activeDefinition=worldConditionById[condition.definitionId];return activeDefinition?.exclusiveGroup===definition.exclusiveGroup&&sameRegion(condition,definition.scope,targetCountry);});
  });
  if(!candidates.length)return;const definition=rng.weighted(candidates.map(item=>({item,weight:item.weight})));const duration=rng.int(definition.durationRange[0],definition.durationRange[1]);const intensity=rng.weighted<WorldConditionIntensity>([{item:1,weight:4},{item:2,weight:5},{item:3,weight:1}]);
  const condition:WorldConditionRecord={id:makeStateId(state,'world'),definitionId:definition.id,scope:definition.scope,...(definition.scope==='country'?{countryId:state.character.countryId}:{}),startYear:state.currentYear,endYear:state.currentYear+duration-1,intensity};
  world.active.push(condition);world.lastStartedYearByDefinition[definition.id]=state.currentYear;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'world',importance:2,title:`${conditionScopeLabel(state,condition)} condition`,text:`${definition.title}: ${definition.description}`,detail:conditionDetail(condition)});
}
