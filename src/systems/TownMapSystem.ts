import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID, locationLabel } from '../data/countries';
import {
  TOWN_MAP_HEIGHT,
  TOWN_MAP_WIDTH,
  TOWN_PLACES,
  type TownPlaceCategory,
  type TownPlaceDefinition,
} from '../data/townPlaces';
import type { GameState } from '../types/game';

export interface TownMapBounds {left:number;right:number;top:number;bottom:number}
export interface TownMapCamera {x:number;y:number;scale:number}
export interface TownMapViewport {width:number;height:number}
export interface TownMapProjectionOptions {query?:string;categories?:readonly TownPlaceCategory[];includeUndiscovered?:boolean}
export interface TownMapProjection {
  places:TownPlaceDefinition[];
  hiddenPlaceCount:number;
  playerInEverthread:boolean;
  playerLocationLabel:string;
}

export const TOWN_MAP_MIN_SCALE=.2;
export const TOWN_MAP_MAX_SCALE=2.2;

export function townPlaceDiscovered(state:GameState,place:TownPlaceDefinition){
  if(place.visibility==='public')return true;
  if(place.visibility==='underworld_discovery'){
    const crime=state.specialCareers.crimeOrg;
    return Boolean(crime?.active||crime?.rank||Number(crime?.standing??0)>0||state.legal.criminalRecord.length>0||state.legal.investigationHeat>=30);
  }
  return true;
}

export function buildTownMapProjection(state:GameState,options:TownMapProjectionOptions={}):TownMapProjection{
  const query=(options.query??'').trim().toLowerCase();
  const categorySet=options.categories===undefined?undefined:new Set(options.categories);
  let hiddenPlaceCount=0;
  const places=TOWN_PLACES.filter(place=>{
    const discovered=townPlaceDiscovered(state,place);
    if(!discovered&&!options.includeUndiscovered){hiddenPlaceCount+=1;return false;}
    if(categorySet&&!categorySet.has(place.category))return false;
    if(!query)return true;
    const haystack=[place.label,place.shortLabel,place.category,place.description,...place.activityTags].join(' ').toLowerCase();
    return haystack.includes(query);
  });
  return{
    places,
    hiddenPlaceCount,
    playerInEverthread:state.character.countryId===EVERTHREAD_COUNTRY_ID&&state.character.city===EVERTHREAD_CITY,
    playerLocationLabel:locationLabel(state.character.countryId,state.character.city),
  };
}

export function clampTownMapScale(value:number){
  if(!Number.isFinite(value))return TOWN_MAP_MIN_SCALE;
  return Math.max(TOWN_MAP_MIN_SCALE,Math.min(TOWN_MAP_MAX_SCALE,value));
}

export function fitTownMapCamera(viewport:TownMapViewport,padding=28):TownMapCamera{
  const usableWidth=Math.max(1,viewport.width-padding*2);
  const usableHeight=Math.max(1,viewport.height-padding*2);
  const scale=clampTownMapScale(Math.min(usableWidth/TOWN_MAP_WIDTH,usableHeight/TOWN_MAP_HEIGHT));
  return{x:(viewport.width-TOWN_MAP_WIDTH*scale)/2,y:(viewport.height-TOWN_MAP_HEIGHT*scale)/2,scale};
}

export function constrainTownMapCamera(camera:TownMapCamera,viewport:TownMapViewport,overscroll=72):TownMapCamera{
  const scale=clampTownMapScale(camera.scale);
  const width=TOWN_MAP_WIDTH*scale,height=TOWN_MAP_HEIGHT*scale;
  const x=width<=viewport.width?(viewport.width-width)/2:Math.max(viewport.width-width-overscroll,Math.min(overscroll,camera.x));
  const y=height<=viewport.height?(viewport.height-height)/2:Math.max(viewport.height-height-overscroll,Math.min(overscroll,camera.y));
  return{x,y,scale};
}

export function townMapWorldBounds(camera:TownMapCamera,viewport:TownMapViewport,margin=120):TownMapBounds{
  return{
    left:(-camera.x)/camera.scale-margin,
    right:(viewport.width-camera.x)/camera.scale+margin,
    top:(-camera.y)/camera.scale-margin,
    bottom:(viewport.height-camera.y)/camera.scale+margin,
  };
}

export function townMapPlacesInBounds(places:readonly TownPlaceDefinition[],bounds:TownMapBounds){
  return places.filter(place=>place.map.x>=bounds.left&&place.map.x<=bounds.right&&place.map.y>=bounds.top&&place.map.y<=bounds.bottom);
}

export function townMapMarkerVisible(place:TownPlaceDefinition,scale:number){
  if(place.importance===3)return true;
  if(place.importance===2)return scale>=.38;
  return scale>=.55;
}

export function townMapLabelVisible(place:TownPlaceDefinition,scale:number){return scale>=place.map.labelMinScale;}

export function townMapSemanticView(state:GameState){
  const projection=buildTownMapProjection(state);
  return{
    map:{width:TOWN_MAP_WIDTH,height:TOWN_MAP_HEIGHT},
    playerInEverthread:projection.playerInEverthread,
    playerLocationLabel:projection.playerLocationLabel,
    placeCount:projection.places.length,
    hiddenPlaceCount:projection.hiddenPlaceCount,
    places:projection.places.map(place=>({
      id:place.id,label:place.label,category:place.category,districtId:place.districtId,
      x:place.map.x,y:place.map.y,activityTags:[...place.activityTags],route:place.route?{...place.route}:undefined,
    })),
  };
}
