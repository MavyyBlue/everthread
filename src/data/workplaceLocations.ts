import type { LocationScenePlaceId } from './locationScenes';

export interface WorkplaceVenueDefinition {
  placeId: LocationScenePlaceId;
  label: string;
  districtId: string;
  fullTimeIndustries: readonly string[];
  partTimeJobIds: readonly string[];
}

/**
 * Physical ordinary-work anchors that are already represented by dedicated
 * Everthread location scenes. These do not own employment state; they only
 * describe where an existing Career/Workplace record physically lives.
 */
export const WORKPLACE_VENUES: readonly WorkplaceVenueDefinition[] = [
  {placeId:'weaver-park',label:'Weaver Park',districtId:'campus-green',fullTimeIndustries:['Environmental Services'],partTimeJobIds:['pt_fitness']},
  {placeId:'central-everthread-bank',label:'Central Everthread Bank',districtId:'central-weave',fullTimeIndustries:['Accounting','Banking','Finance','Insurance'],partTimeJobIds:[]},
  {placeId:'loomline-motors',label:'Loomline Motors',districtId:'market-row',fullTimeIndustries:['Customer Support'],partTimeJobIds:['pt_support']},
  {placeId:'hearthline-realty',label:'Hearthline Realty & Leasing',districtId:'market-row',fullTimeIndustries:['Real Estate'],partTimeJobIds:[]},
  {placeId:'crossroads-mall',label:'Crossroads Mall',districtId:'market-row',fullTimeIndustries:['Retail','Customer Support'],partTimeJobIds:['pt_shop','pt_support','pt_events']},
  {placeId:'nightjar-diner',label:'Nightjar Diner',districtId:'market-row',fullTimeIndustries:['Coffee & Bakery','Food Service','Hospitality Culinary'],partTimeJobIds:['pt_cafe','pt_food']},
  {placeId:'pulseworks-gym',label:'Pulseworks Gym',districtId:'campus-green',fullTimeIndustries:[],partTimeJobIds:['pt_fitness']},
  {placeId:'everthread-school',label:'Everthread Community School',districtId:'campus-green',fullTimeIndustries:['Education','Library & Archives','Social Services'],partTimeJobIds:['pt_library','pt_tutor']},
  {placeId:'everthread-college',label:'Everthread College',districtId:'campus-green',fullTimeIndustries:['University','Library & Archives'],partTimeJobIds:['pt_library','pt_tutor']},
  {placeId:'everthread-market',label:'Everthread Market',districtId:'market-row',fullTimeIndustries:['Retail'],partTimeJobIds:['pt_shop']},
  {placeId:'everthread-city-hall',label:'Everthread City Hall',districtId:'central-weave',fullTimeIndustries:['Government','Office Administration'],partTimeJobIds:['pt_office','pt_admin']},
  {placeId:'everthread-courthouse',label:'Everthread Courthouse',districtId:'central-weave',fullTimeIndustries:['Law'],partTimeJobIds:['pt_admin']},
] as const;

const venueByPlaceId=new Map(WORKPLACE_VENUES.map(venue=>[venue.placeId,venue] as const));

export function workplaceVenueByPlaceId(placeId:string){return venueByPlaceId.get(placeId as LocationScenePlaceId);}
export function workplaceVenuesForIndustry(industry:string){return WORKPLACE_VENUES.filter(venue=>venue.fullTimeIndustries.includes(industry));}
export function workplaceVenuesForPartTimeJob(jobId:string){return WORKPLACE_VENUES.filter(venue=>venue.partTimeJobIds.includes(jobId));}
export function defaultWorkplaceVenueForIndustry(industry:string){return workplaceVenuesForIndustry(industry)[0];}
export function defaultWorkplaceVenueForPartTimeJob(jobId:string){return workplaceVenuesForPartTimeJob(jobId)[0];}

/** Company-name matching makes new venue-aware records self-describing without a save-schema bump. */
export function workplaceVenueForCompany(company:string,industry:string,jobId?:string){
  const exact=WORKPLACE_VENUES.find(venue=>venue.label===company);
  if(exact)return exact;
  if(jobId){const partTime=defaultWorkplaceVenueForPartTimeJob(jobId);if(partTime)return partTime;}
  return defaultWorkplaceVenueForIndustry(industry);
}

const ROLE_TITLES:Readonly<Record<string,string>>={
  'nightjar-diner:coffee_bakery_1':'Diner Assistant',
  'nightjar-diner:coffee_bakery_2':'Counter Server',
  'nightjar-diner:coffee_bakery_3':'Senior Server',
  'nightjar-diner:coffee_bakery_4':'Shift Supervisor',
  'nightjar-diner:coffee_bakery_5':'Diner Manager',
  'nightjar-diner:coffee_bakery_6':'Area Manager',
  'nightjar-diner:food_service_1':'Diner Crew',
  'nightjar-diner:food_service_5':'Diner Manager',
  'crossroads-mall:retail_1':'Mall Shop Assistant',
  'everthread-market:retail_1':'Grocery Associate',
  'everthread-market:retail_2':'Senior Grocery Associate',
  'loomline-motors:customer_support_1':'Service Desk Assistant',
  'crossroads-mall:customer_support_1':'Guest Services Assistant',
  'everthread-city-hall:office_administration_1':'Civic Office Assistant',
  'everthread-school:social_services_1':'Student Services Assistant',
  'weaver-park:environmental_services_1':'Park Services Technician',
  'everthread-courthouse:law_1':'Court Legal Associate',
  'nightjar-diner:pt_cafe':'Diner Crew',
  'nightjar-diner:pt_food':'Diner Shift Crew',
  'crossroads-mall:pt_shop':'Mall Shop Assistant',
  'everthread-market:pt_shop':'Grocery Assistant',
  'loomline-motors:pt_support':'Service Desk Assistant',
  'crossroads-mall:pt_support':'Guest Services Assistant',
  'everthread-school:pt_library':'School Library Aide',
  'everthread-college:pt_library':'Campus Library Aide',
  'everthread-college:pt_tutor':'College Peer Tutor',
  'everthread-city-hall:pt_office':'Civic Office Assistant',
  'everthread-city-hall:pt_admin':'Civic Records Assistant',
  'everthread-courthouse:pt_admin':'Court Records Assistant',
  'pulseworks-gym:pt_fitness':'Gym Floor Assistant',
  'weaver-park:pt_fitness':'Park Recreation Assistant',
};

export function workplaceRoleTitle(jobId:string,fallback:string,placeId?:string){return placeId?ROLE_TITLES[`${placeId}:${jobId}`]??fallback:fallback;}
