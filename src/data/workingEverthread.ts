import { defaultWorkplaceVenueForIndustry } from './workplaceLocations';
export interface WorkingDistrictRule {districtId:string;anchorPlaceId?:string}

const MARKET_ROW=new Set(['Retail','Food Service','Coffee & Bakery','Hospitality','Hospitality Culinary','Real Estate']);
const CENTRAL_WEAVE=new Set(['Accounting','Banking','Finance','Insurance','Government','Law','Medicine','Nursing','Dentistry','Mental Wellness','Pharmaceutical Research','Biotechnology','Emergency Services']);
const CAMPUS_GREEN=new Set(['Education','University','Library & Archives','Social Services','Veterinary Medicine']);
const SOUTH_BELT=new Set(['Agriculture','Aviation','Aviation Maintenance','Construction','Environmental Services','Logistics','Public Transit','Transportation']);

const EXACT_WORK_ANCHORS:Record<string,string>={
  Accounting:'central-everthread-bank',Banking:'central-everthread-bank',Finance:'central-everthread-bank',Insurance:'central-everthread-bank',
  Government:'everthread-city-hall',Law:'everthread-courthouse',Medicine:'everthread-general-hospital',Nursing:'everthread-general-hospital',Dentistry:'everthread-general-hospital','Emergency Services':'public-safety-center',
  Education:'everthread-school',University:'everthread-college',
  Aviation:'everthread-air-terminal','Aviation Maintenance':'everthread-air-terminal',
  Retail:'crossroads-mall','Real Estate':'hearthline-realty',
};

export function workingDistrictRuleForIndustry(industry:string):WorkingDistrictRule{
  const implemented=defaultWorkplaceVenueForIndustry(industry);if(implemented)return{districtId:implemented.districtId,anchorPlaceId:implemented.placeId};
  if(MARKET_ROW.has(industry))return{districtId:'market-row',...(EXACT_WORK_ANCHORS[industry]?{anchorPlaceId:EXACT_WORK_ANCHORS[industry]}:{})};
  if(CENTRAL_WEAVE.has(industry))return{districtId:'central-weave',...(EXACT_WORK_ANCHORS[industry]?{anchorPlaceId:EXACT_WORK_ANCHORS[industry]}:{})};
  if(CAMPUS_GREEN.has(industry))return{districtId:'campus-green',...(EXACT_WORK_ANCHORS[industry]?{anchorPlaceId:EXACT_WORK_ANCHORS[industry]}:{})};
  if(SOUTH_BELT.has(industry))return{districtId:'south-belt',...(EXACT_WORK_ANCHORS[industry]?{anchorPlaceId:EXACT_WORK_ANCHORS[industry]}:{})};
  return{districtId:'eastworks'};
}

export const BUSINESS_DISTRICT_RULES:Record<string,WorkingDistrictRule>={
  restaurant:{districtId:'market-row'},coffee:{districtId:'market-row'},retail:{districtId:'market-row'},fashion:{districtId:'market-row'},food_products:{districtId:'market-row'},events:{districtId:'market-row'},beauty:{districtId:'market-row'},property_services:{districtId:'market-row',anchorPlaceId:'hearthline-realty'},
  fitness:{districtId:'campus-green',anchorPlaceId:'pulseworks-gym'},education:{districtId:'campus-green'},healthcare:{districtId:'central-weave'},
  software:{districtId:'eastworks',anchorPlaceId:'loomworks-business-district'},consumer_tech:{districtId:'eastworks',anchorPlaceId:'loomworks-business-district'},manufacturing:{districtId:'eastworks'},automotive:{districtId:'eastworks'},media:{districtId:'eastworks'},consulting:{districtId:'eastworks',anchorPlaceId:'loomworks-business-district'},gaming:{districtId:'eastworks',anchorPlaceId:'loomworks-business-district'},
  logistics:{districtId:'south-belt'},green_energy:{districtId:'south-belt'},
};

export const POST_SECONDARY_STAGES=new Set(['university','community_college','graduate','professional','trade']);
