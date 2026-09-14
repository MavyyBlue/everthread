import type { SharedExperienceActivityDefinition } from '../types/sharedExperiences';

export const SHARED_EXPERIENCE_ACTIVITIES:readonly SharedExperienceActivityDefinition[]=[
  {id:'park_walk',label:'Walk the park',minAge:4,placeIds:['weaver-park'],preferenceTags:['nature','outdoors','relaxing'],baseEnjoyment:2,copy:{lead:'took a slow walk through',memoryLead:'took a slow walk together through'}},
  {id:'park_play',label:'Play outside',minAge:3,placeIds:['weaver-park'],preferenceTags:['playful','outdoors','social'],baseEnjoyment:1,copy:{lead:'spent time playing around',memoryLead:'spent time playing together around'}},
  {id:'mall_browse',label:'Browse the mall',minAge:8,placeIds:['crossroads-mall'],preferenceTags:['shopping','fashion','social'],baseEnjoyment:0,copy:{lead:'wandered the shops at',memoryLead:'wandered the shops together at'}},
  {id:'mall_games',label:'Play games',minAge:5,placeIds:['crossroads-mall'],preferenceTags:['games','playful','social'],baseEnjoyment:1,copy:{lead:'played games together at',memoryLead:'played games together at'}},
  {id:'movie_outing',label:'Catch a movie',minAge:6,placeIds:['crossroads-mall'],preferenceTags:['film','food','social'],baseEnjoyment:1,copy:{lead:'caught a movie together at',memoryLead:'caught a movie together at'}},
  {id:'school_social',label:'Go to a school social',minAge:8,maxAge:17,placeIds:['everthread-school'],preferenceTags:['social','music','games'],baseEnjoyment:1,copy:{lead:'went to a school social together at',memoryLead:'went to a school social together at'}},
  {id:'diner_meal',label:'Share a meal',minAge:3,placeIds:['nightjar-diner'],preferenceTags:['food','local','social'],baseEnjoyment:2,copy:{lead:'shared a meal at',memoryLead:'shared a meal together at'}},
  {id:'home_hangout',label:'Hang out at home',minAge:3,placeIds:['threadwell-residential'],preferenceTags:['home','cozy','quiet','social'],baseEnjoyment:2,copy:{lead:'had a low-key hangout in',memoryLead:'had a low-key hangout together in'}},
  {id:'sleepover',label:'Have a sleepover',minAge:6,maxAge:17,placeIds:['threadwell-residential'],preferenceTags:['home','cozy','games','social'],baseEnjoyment:2,copy:{lead:'had a sleepover in',memoryLead:'had a sleepover together in'}},
  {id:'cook_together',label:'Cook together',minAge:8,placeIds:['threadwell-residential'],preferenceTags:['cooking','food','home'],baseEnjoyment:1,copy:{lead:'cooked something together in',memoryLead:'cooked something together in'}},
  {id:'gym_session',label:'Train together',minAge:12,placeIds:['pulseworks-gym'],preferenceTags:['fitness','social'],baseEnjoyment:0,copy:{lead:'trained together at',memoryLead:'trained together at'}},
  {id:'stadium_event',label:'Go to a game',minAge:6,placeIds:['everthread-stadium'],preferenceTags:['sports','local','social'],baseEnjoyment:1,copy:{lead:'went to an event at',memoryLead:'went to an event together at'}},
] as const;

export const sharedExperienceActivityById=Object.fromEntries(SHARED_EXPERIENCE_ACTIVITIES.map(activity=>[activity.id,activity])) as Record<string,SharedExperienceActivityDefinition>;
