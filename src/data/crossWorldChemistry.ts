import type { CrossWorldChemistryPlanDefinition } from '../types/crossWorldChemistry';

export const CROSS_WORLD_CHEMISTRY_PLANS:readonly CrossWorldChemistryPlanDefinition[]=[
  {id:'school-study-break',label:'Take a study break',description:'Get away from coursework for a little while.',contextKinds:['school'],minAge:18,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['food','social','reading','logic'],enjoymentModifier:1},
  {id:'school-after-class-walk',label:'Walk after class',description:'Unwind together after the school day.',contextKinds:['school'],minAge:18,activityId:'park_walk',placeId:'weaver-park',preferenceTags:['nature','outdoors','relaxing','social']},

  {id:'family-cook',label:'Cook together',description:'Spend unhurried time making something together at home.',contextKinds:['family'],minAge:18,activityId:'cook_together',placeId:'threadwell-residential',preferenceTags:['cooking','food','family','home'],enjoymentModifier:1},
  {id:'family-diner',label:'Catch up over a meal',description:'Make room for a proper family catch-up.',contextKinds:['family'],minAge:18,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['food','family','social','local']},

  {id:'friend-games',label:'Play something together',description:'Keep the friendship light and playful for a while.',contextKinds:['friend'],minAge:18,activityId:'mall_games',placeId:'crossroads-mall',preferenceTags:['games','playful','social']},
  {id:'friend-park',label:'Take a walk together',description:'Have an easy conversation away from everything else.',contextKinds:['friend'],minAge:18,activityId:'park_walk',placeId:'weaver-park',preferenceTags:['nature','outdoors','relaxing','social']},

  {id:'work-lunch',label:'Grab food after work',description:'Talk away from the workplace and see how the rapport feels.',contextKinds:['workplace'],minAge:14,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['food','social','professional'],enjoymentModifier:1},
  {id:'work-walk',label:'Take an after-work walk',description:'Decompress together outside the office.',contextKinds:['workplace'],minAge:14,activityId:'park_walk',placeId:'weaver-park',preferenceTags:['relaxing','outdoors','social','professional']},

  {id:'screen-film-night',label:'Catch a movie together',description:'Share a film with someone from your screen-world circle.',contextKinds:['acting','directing'],minAge:14,activityId:'movie_outing',placeId:'crossroads-mall',preferenceTags:['film','creative','social','professional'],enjoymentModifier:1},
  {id:'screen-debrief',label:'Debrief over food',description:'Talk shop after the cameras stop rolling.',contextKinds:['acting','directing'],minAge:14,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['film','food','creative','professional','social']},

  {id:'music-home-session',label:'Jam together',description:'Make a little music without turning it into a formal career action.',contextKinds:['music'],minAge:14,activityId:'home_hangout',placeId:'threadwell-residential',preferenceTags:['music','creative','cozy','social'],enjoymentModifier:2},
  {id:'music-diner',label:'Grab food after a session',description:'Let the creative conversation continue somewhere casual.',contextKinds:['music'],minAge:14,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['music','food','creative','social']},

  {id:'athletic-training',label:'Train together',description:'Build rapport through a shared training session.',contextKinds:['sports','combat'],minAge:12,activityId:'gym_session',placeId:'pulseworks-gym',preferenceTags:['fitness','sports','professional','social'],enjoymentModifier:1},
  {id:'athletic-diner',label:'Grab food after training',description:'Cool down and talk away from the competitive setting.',contextKinds:['sports','combat'],minAge:12,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['food','sports','professional','social']},

  {id:'model-style-browse',label:'Browse styles together',description:'See whether your tastes click away from a formal campaign.',contextKinds:['modeling'],minAge:14,activityId:'mall_browse',placeId:'crossroads-mall',preferenceTags:['fashion','shopping','creative','professional'],enjoymentModifier:1},
  {id:'model-diner',label:'Grab food after a shoot',description:'Step out of the industry bubble for a casual meal.',contextKinds:['modeling'],minAge:14,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['fashion','food','professional','social']},

  {id:'racing-shop-talk',label:'Talk racing over food',description:'Trade stories about the circuit somewhere quieter.',contextKinds:['racing'],minAge:16,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['motorsport','technology','professional','social','food'],enjoymentModifier:1},
  {id:'racing-conditioning',label:'Condition together',description:'Put in a shared fitness session away from race day.',contextKinds:['racing'],minAge:16,activityId:'gym_session',placeId:'pulseworks-gym',preferenceTags:['motorsport','fitness','professional','social']},

  {id:'military-pt',label:'Train off duty',description:'Build unit rapport through an ordinary fitness session.',contextKinds:['military'],minAge:18,activityId:'gym_session',placeId:'pulseworks-gym',preferenceTags:['fitness','professional','social']},
  {id:'military-diner',label:'Grab an off-duty meal',description:'Get to know each other outside the unit routine.',contextKinds:['military'],minAge:18,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['food','social','professional','local']},

  {id:'politics-diner',label:'Talk over a meal',description:'Step away from the office and see whether the working rapport holds.',contextKinds:['politics'],minAge:18,activityId:'diner_meal',placeId:'nightjar-diner',preferenceTags:['food','professional','social','local'],enjoymentModifier:1},
  {id:'politics-walk',label:'Take a civic walk',description:'Talk through the human side of public life away from the office.',contextKinds:['politics'],minAge:18,activityId:'park_walk',placeId:'weaver-park',preferenceTags:['local','outdoors','professional','social','relaxing']},
] as const;

export const crossWorldChemistryPlanById=Object.fromEntries(CROSS_WORLD_CHEMISTRY_PLANS.map(plan=>[plan.id,plan])) as Record<string,CrossWorldChemistryPlanDefinition>;
