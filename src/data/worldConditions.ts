import type { WorldConditionDefinition } from '../types/content';

/**
 * Phase 7C conditions are durable world context, not random-event definitions.
 * Their state owner is WorldConditionSystem; downstream systems only read the
 * active modifier projection and remain authoritative for their own outcomes.
 */
export const worldConditionDefinitions: readonly WorldConditionDefinition[] = [
  {
    id:'growth_wave',title:'Growth Wave',description:'Hiring, wages, and business activity are running stronger than usual.',scope:'country',exclusiveGroup:'economic_cycle',durationRange:[3,5],cooldownYears:7,weight:1.1,
    effects:{salaryGrowthRateDelta:.012,businessDemandGrowthRateDelta:.045,housingGrowthRateDelta:.012,jobApplicationScoreDelta:3,layoffChanceDelta:-.004,investmentDriftDelta:.015,publicityPayMultiplier:1.04},
    effectSummary:['Hiring is easier and layoffs are less common.','Salary growth and business demand run stronger.','Housing and investment values tend to run warmer.'],
  },
  {
    id:'economic_slowdown',title:'Economic Slowdown',description:'Employers and customers are pulling back for a sustained stretch.',scope:'country',exclusiveGroup:'economic_cycle',durationRange:[2,4],cooldownYears:7,weight:1,
    effects:{salaryGrowthRateDelta:-.018,businessDemandGrowthRateDelta:-.055,housingGrowthRateDelta:-.018,jobApplicationScoreDelta:-4,layoffChanceDelta:.012,investmentDriftDelta:-.025,publicityPayMultiplier:.96},
    effectSummary:['Hiring is tougher and layoff pressure rises.','Salary growth and business demand weaken.','Housing and investments face a modest drag.'],
  },
  {
    id:'cost_surge',title:'Cost Surge',description:'Everyday costs are climbing faster than the usual economic cycle.',scope:'country',exclusiveGroup:'cost_pressure',durationRange:[2,3],cooldownYears:6,weight:.85,
    effects:{inflationRateDelta:.022,businessDemandGrowthRateDelta:-.012,travelCostMultiplier:1.08,householdCostMultiplier:1.08},
    effectSummary:['Everyday household costs rise.','Inflation pressure is stronger.','Travel and consumer demand feel the squeeze.'],
  },
  {
    id:'housing_squeeze',title:'Housing Squeeze',description:'Limited housing supply is keeping purchase and living costs elevated.',scope:'country',exclusiveGroup:'housing_cycle',durationRange:[2,4],cooldownYears:6,weight:.8,
    effects:{housingGrowthRateDelta:.04,householdCostMultiplier:1.03},
    effectSummary:['Home prices face stronger upward pressure.','Household costs are slightly higher while the squeeze lasts.'],
  },
  {
    id:'travel_disruption',title:'Travel Disruption',description:'A global transport bottleneck is making long-distance trips more expensive.',scope:'global',exclusiveGroup:'mobility_cycle',durationRange:[1,2],cooldownYears:7,weight:.65,
    effects:{travelCostMultiplier:1.55},
    effectSummary:['Trips cost substantially more while transport capacity is strained.'],
  },
  {
    id:'media_frenzy',title:'Media Frenzy',description:'Public attention is unusually intense across entertainment and social platforms.',scope:'global',exclusiveGroup:'media_cycle',durationRange:[2,3],cooldownYears:5,weight:.7,
    effects:{fameOrganicGrowthMultiplier:1.35,fameScandalChanceDelta:.015,publicityPayMultiplier:1.12},
    effectSummary:['Audience growth is faster for people with an existing platform.','Publicity opportunities pay more, but scrutiny is harsher.'],
  },
  {
    id:'market_jitters',title:'Market Jitters',description:'Global investors are repricing risk and markets are moving more sharply.',scope:'global',exclusiveGroup:'market_cycle',durationRange:[2,3],cooldownYears:5,weight:.75,
    effects:{investmentDriftDelta:-.03,investmentVolatilityMultiplier:1.25},
    effectSummary:['Investment returns face a negative drift.','Price swings are more volatile.'],
  },
] as const;

export const worldConditionById = Object.fromEntries(worldConditionDefinitions.map(definition=>[definition.id,definition])) as Record<string,WorldConditionDefinition>;
