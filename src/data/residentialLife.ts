import type { ResidentialPlanDefinition } from '../types/residentialLife';

export const RESIDENTIAL_LIFE_PLANS:readonly ResidentialPlanDefinition[]=[
  {id:'visit-their-home',label:'Visit their home',description:'Spend ordinary time together where they actually live.',minAge:3,activityId:'home_hangout',target:'npc',nonFamilyOnly:true,preferenceTags:['home','cozy','quiet','social']},
  {id:'invite-home',label:'Invite them home',description:'Spend time together at the place you currently call home.',minAge:3,activityId:'home_hangout',target:'player',preferenceTags:['home','cozy','quiet','social'],enjoymentModifier:1},
  {id:'family-visit',label:'Visit family at home',description:'Make time for a real family visit instead of another generic outing.',minAge:3,activityId:'home_hangout',target:'npc',familyOnly:true,preferenceTags:['home','family','cozy','social'],enjoymentModifier:2},
  {id:'cook-at-home',label:'Cook together at home',description:'Share a meal-prep ritual in a real household setting.',minAge:8,activityId:'cook_together',target:'best',preferenceTags:['cooking','food','home','family','social'],enjoymentModifier:1},
  {id:'sleepover-at-home',label:'Have a sleepover',description:'Stay over at one of your actual homes for the night.',minAge:6,maxAge:17,activityId:'sleepover',target:'best',preferenceTags:['home','cozy','games','social'],enjoymentModifier:1},
] as const;

export const residentialLifePlanById=Object.fromEntries(RESIDENTIAL_LIFE_PLANS.map(plan=>[plan.id,plan])) as Record<string,ResidentialPlanDefinition>;
