import { TOWN_PLACES, type TownInstitutionDestination } from '../data/townPlaces';

export type InstitutionBankingView='overview'|'payments';
export type InstitutionAssetsTab='money'|'property'|'invest'|'business'|'estate'|'more';
export type InstitutionPropertyView='browse'|'owned';
export type InstitutionAssetAnchor='homes'|'vehicles'|'owned-homes'|'owned-vehicles';
export type InstitutionActivitySheet='travel'|'crime'|'health'|'habits';
export type InstitutionActivityAnchor='wellness';
export type InstitutionCareerTab='work'|'education'|'special';
export type InstitutionCareerAnchor='work-market'|'education-current'|'education-admissions';
export type InstitutionSpecialPathFocus='acting'|'directing'|'modeling'|'racing'|'sports'|'military'|'politics'|'crimeOrg';

export type InstitutionResolvedRoute=
  | {tab:'life';bankingView:InstitutionBankingView}
  | {tab:'assets';assetsTab:InstitutionAssetsTab;propertyView?:InstitutionPropertyView;assetAnchor?:InstitutionAssetAnchor}
  | {tab:'activities';activitySheet?:InstitutionActivitySheet;activityAnchor?:InstitutionActivityAnchor}
  | {tab:'career';careerTab:InstitutionCareerTab;careerAnchor?:InstitutionCareerAnchor;specialPath?:InstitutionSpecialPathFocus};

export interface InstitutionRouteRequest {
  requestId:number;
  placeId:string;
  placeLabel:string;
  serviceId:string;
  serviceLabel:string;
  destination:TownInstitutionDestination;
  resolved:InstitutionResolvedRoute;
}

export function resolveInstitutionDestination(destination:TownInstitutionDestination):InstitutionResolvedRoute{
  switch(destination){
    case 'banking':return {tab:'life',bankingView:'overview'};
    case 'payments':return {tab:'life',bankingView:'payments'};
    case 'money':return {tab:'assets',assetsTab:'money'};
    case 'investments':return {tab:'assets',assetsTab:'invest'};
    case 'property_homes':return {tab:'assets',assetsTab:'property',propertyView:'browse',assetAnchor:'homes'};
    case 'property_owned_homes':return {tab:'assets',assetsTab:'property',propertyView:'owned',assetAnchor:'owned-homes'};
    case 'property_vehicles':return {tab:'assets',assetsTab:'property',propertyView:'browse',assetAnchor:'vehicles'};
    case 'property_owned_vehicles':return {tab:'assets',assetsTab:'property',propertyView:'owned',assetAnchor:'owned-vehicles'};
    case 'business':return {tab:'assets',assetsTab:'business'};
    case 'education':return {tab:'career',careerTab:'education',careerAnchor:'education-current'};
    case 'education_admissions':return {tab:'career',careerTab:'education',careerAnchor:'education-admissions'};
    case 'healthcare':return {tab:'activities',activitySheet:'health'};
    case 'wellness':return {tab:'activities',activityAnchor:'wellness'};
    case 'travel':return {tab:'activities',activitySheet:'travel'};
    case 'legal':return {tab:'activities',activitySheet:'crime'};
    case 'work':return {tab:'career',careerTab:'work',careerAnchor:'work-market'};
    case 'acting':return {tab:'career',careerTab:'special',specialPath:'acting'};
    case 'directing':return {tab:'career',careerTab:'special',specialPath:'directing'};
    case 'modeling':return {tab:'career',careerTab:'special',specialPath:'modeling'};
    case 'racing':return {tab:'career',careerTab:'special',specialPath:'racing'};
    case 'sports':return {tab:'career',careerTab:'special',specialPath:'sports'};
    case 'military':return {tab:'career',careerTab:'special',specialPath:'military'};
    case 'politics':return {tab:'career',careerTab:'special',specialPath:'politics'};
    case 'organized_crime':return {tab:'career',careerTab:'special',specialPath:'crimeOrg'};
  }
}

export function createInstitutionRouteRequest(placeId:string,serviceId:string,requestId:number):InstitutionRouteRequest|undefined{
  const place=TOWN_PLACES.find(candidate=>candidate.id===placeId);if(!place)return undefined;
  const service=place.routes?.find(candidate=>candidate.id===serviceId);if(!service)return undefined;
  return {requestId,placeId:place.id,placeLabel:place.label,serviceId:service.id,serviceLabel:service.label,destination:service.destination,resolved:resolveInstitutionDestination(service.destination)};
}
