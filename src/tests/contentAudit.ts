import { lifeEvents } from '../data/events';
import { jobs } from '../data/jobs';
import { educationPrograms } from '../data/education';
import { illnesses } from '../data/illnesses';
import { crimes } from '../data/crimes';
import { achievements, challenges } from '../data/achievements';
import { countries } from '../data/countries';
import { propertyDefinitions, securities, businessIndustries, petVariants, vehicleDefinitions, luxuryVehicleDefinitions, collectibleDefinitions } from '../data/assets';

export interface ContentAudit {
  events:number;
  eventCategories:Record<string,number>;
  jobs:number;
  careerLadders:number;
  educationPrograms:number;
  illnesses:number;
  relationshipEvents:number;
  careerEvents:number;
  crimes:number;
  achievements:number;
  challenges:number;
  properties:number;
  pets:number;
  vehicles:number;
  securities:number;
  businessIndustries:number;
  businessProducts:number;
  collectibles:number;
  countries:number;
  regionalNamePools:number;
  firstNamesPerPool:number;
  lastNamesPerPool:number;
}

export function auditContent():ContentAudit{
  const eventCategories:Record<string,number>={};for(const event of lifeEvents)eventCategories[event.category]=(eventCategories[event.category]??0)+1;
  const ladderRoots=new Set(jobs.map(job=>job.id.replace(/_\d+$/,'')));
  return {
    events:lifeEvents.length,eventCategories,jobs:jobs.length,careerLadders:ladderRoots.size,educationPrograms:educationPrograms.length,illnesses:illnesses.length,
    relationshipEvents:(eventCategories.friends??0)+(eventCategories.family??0)+(eventCategories.romance??0)+(eventCategories.relationships??0),careerEvents:eventCategories.work??0,
    crimes:crimes.length,achievements:achievements.length,challenges:challenges.length,properties:propertyDefinitions.length,pets:petVariants.length,
    vehicles:vehicleDefinitions.length+luxuryVehicleDefinitions.length,securities:securities.length,businessIndustries:businessIndustries.length,
    businessProducts:businessIndustries.reduce((sum,industry)=>sum+industry.productNames.length,0),collectibles:collectibleDefinitions.length,countries:countries.length,
    regionalNamePools:7,firstNamesPerPool:20,lastNamesPerPool:20,
  };
}

export function formatContentAudit(audit:ContentAudit){
  const lines=[
    `Events: ${audit.events}`,
    `Event categories: ${Object.entries(audit.eventCategories).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}=${v}`).join(', ')}`,
    `Career positions: ${audit.jobs} across ${audit.careerLadders} six-step ladders`,
    `Education programs: ${audit.educationPrograms}`,
    `Illness/health definitions: ${audit.illnesses}`,
    `Relationship-focused events: ${audit.relationshipEvents}`,
    `Career/work events: ${audit.careerEvents}`,
    `Crimes: ${audit.crimes}`,
    `Achievements: ${audit.achievements}`,
    `Challenges: ${audit.challenges}`,
    `Properties: ${audit.properties}`,
    `Pets: ${audit.pets}`,
    `Vehicles/boats/aircraft: ${audit.vehicles}`,
    `Fictional securities: ${audit.securities}`,
    `Business industries/products: ${audit.businessIndustries}/${audit.businessProducts}`,
    `Collectibles: ${audit.collectibles}`,
    `Countries: ${audit.countries}`,
    `Regional name pools: ${audit.regionalNamePools}; ${audit.firstNamesPerPool} first + ${audit.lastNamesPerPool} last names each`,
  ];
  return lines.join('\n');
}
