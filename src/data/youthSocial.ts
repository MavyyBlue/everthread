export interface YouthSocialPlanDefinition {
  id:string;
  label:string;
  description:string;
  minAge:number;
  maxAge:number;
  activityId:string;
  placeId:string;
  schoolOnly?:boolean;
}

/**
 * Player-facing youth plans. These are contextual labels over the canonical shared-experience
 * activities; they do not create a second outcome/scoring system.
 */
export const YOUTH_SOCIAL_PLANS:readonly YouthSocialPlanDefinition[]=[
  {id:'park-playdate',label:'Park playdate',description:'Run around, play, and spend an easy afternoon outside.',minAge:3,maxAge:12,activityId:'park_play',placeId:'weaver-park'},
  {id:'home-visit',label:'Home visit',description:'Hang out somewhere familiar without needing a big plan.',minAge:4,maxAge:17,activityId:'home_hangout',placeId:'threadwell-residential'},
  {id:'sleepover',label:'Sleepover',description:'Stay up late, snack, talk, and make a proper childhood memory.',minAge:6,maxAge:17,activityId:'sleepover',placeId:'threadwell-residential'},
  {id:'arcade-games',label:'Arcade & game shop',description:'Spend the outing chasing scores, games, and whatever looks fun.',minAge:7,maxAge:17,activityId:'mall_games',placeId:'crossroads-mall'},
  {id:'movie-afternoon',label:'Movie afternoon',description:'Catch a movie together and make an outing of it.',minAge:8,maxAge:17,activityId:'movie_outing',placeId:'crossroads-mall'},
  {id:'school-social',label:'School social',description:'Spend time together at an age-appropriate school social event.',minAge:8,maxAge:17,activityId:'school_social',placeId:'everthread-school',schoolOnly:true},
  {id:'stadium-day',label:'Stadium day',description:'Go see a game or event together.',minAge:8,maxAge:17,activityId:'stadium_event',placeId:'everthread-stadium'},
  {id:'cook-together',label:'Cook together',description:'Make something at home and see how well you work together.',minAge:10,maxAge:17,activityId:'cook_together',placeId:'threadwell-residential'},
  {id:'mall-hangout',label:'Mall hangout',description:'Wander the shops and spend an afternoon together.',minAge:10,maxAge:17,activityId:'mall_browse',placeId:'crossroads-mall'},
  {id:'diner-hangout',label:'Diner hangout',description:'Grab food and talk somewhere casual.',minAge:10,maxAge:17,activityId:'diner_meal',placeId:'nightjar-diner'},
  {id:'park-walk',label:'Walk & talk',description:'Take a quieter walk through the park and catch up.',minAge:11,maxAge:17,activityId:'park_walk',placeId:'weaver-park'},
] as const;
