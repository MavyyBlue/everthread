import type { RomanticDatePlanDefinition } from '../types/romanticDates';

export const ROMANTIC_DATE_HISTORY_LIMIT=8;
export const ROMANTIC_MOMENTUM_REQUIRED=3;

export const ROMANTIC_DATE_PLANS:readonly RomanticDatePlanDefinition[]=[
  {id:'park-date',label:'Park date',description:'Take a walk and see whether the conversation finds its own rhythm.',placeId:'weaver-park',activityId:'park_walk',minAge:14,enjoymentModifier:2},
  {id:'mall-date',label:'Mall date',description:'Browse Crossroads Mall together and make an afternoon of it.',placeId:'crossroads-mall',activityId:'mall_browse',minAge:14,enjoymentModifier:1},
  {id:'arcade-date',label:'Arcade date',description:'Keep it playful with games and a little friendly competition.',placeId:'crossroads-mall',activityId:'mall_games',minAge:14,enjoymentModifier:2},
  {id:'movie-date',label:'Movie date',description:'Catch a movie together and share the rest of the evening afterward.',placeId:'crossroads-mall',activityId:'movie_outing',minAge:14,enjoymentModifier:2},
  {id:'diner-date',label:'Diner date',description:'Share a booth and a meal at Nightjar Diner.',placeId:'nightjar-diner',activityId:'diner_meal',minAge:14,enjoymentModifier:3},
  {id:'cook-date',label:'Cook together',description:'Make something together in Threadwell and see how the quieter time feels.',placeId:'threadwell-residential',activityId:'cook_together',minAge:14,enjoymentModifier:2},
  {id:'gym-date',label:'Workout date',description:'Train together at Pulseworks and turn the session into a date.',placeId:'pulseworks-gym',activityId:'gym_session',minAge:14,enjoymentModifier:1},
  {id:'stadium-date',label:'Stadium date',description:'Take in a game or event together at Everthread Stadium.',placeId:'everthread-stadium',activityId:'stadium_event',minAge:14,enjoymentModifier:2},
] as const;

export const romanticDatePlanById=Object.fromEntries(ROMANTIC_DATE_PLANS.map(plan=>[plan.id,plan])) as Record<string,RomanticDatePlanDefinition>;
