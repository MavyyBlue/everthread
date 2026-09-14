import { EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { TOWN_DISTRICTS, TOWN_MAP_HEIGHT, TOWN_MAP_WIDTH, TOWN_PLACES, type TownPlaceCategory } from '../data/townPlaces';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { createNewGame } from '../systems/CharacterSystem';
import {
  buildTownMapProjection,
  coverTownMapCamera,
  clampTownMapScale,
  constrainTownMapCamera,
  fitTownMapCamera,
  townMapLabelVisible,
  townMapMarkerVisible,
  townMapPlacesInBounds,
  townMapSemanticView,
  townMapWorldBounds,
  townPlaceDiscovered,
} from '../systems/TownMapSystem';

export function runPhase8BTownMapRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 8B town-map regression failed: ${message}`);}

  const ids=TOWN_PLACES.map(place=>place.id);
  verify(TOWN_PLACES.length>=24,'1 the initial registry must contain the full planned town foundation instead of a token map');
  verify(new Set(ids).size===ids.length,'2 every place must have one stable unique id');
  verify(new Set(TOWN_DISTRICTS.map(district=>district.id)).size===TOWN_DISTRICTS.length,'3 district layout ids must be unique');
  verify(TOWN_PLACES.every(place=>TOWN_DISTRICTS.some(district=>district.id===place.districtId)),'4 every place must belong to a real authored district');
  verify(TOWN_PLACES.every(place=>place.map.x>=0&&place.map.x<=TOWN_MAP_WIDTH&&place.map.y>=0&&place.map.y<=TOWN_MAP_HEIGHT),'5 every place coordinate must stay inside the authored map bounds');
  verify(TOWN_MAP_WIDTH===1536&&TOWN_MAP_HEIGHT===961,'5b the authored coordinate system must match the supplied Everthread map artwork native dimensions');
  verify(TOWN_DISTRICTS.every(d=>d.map.x>=0&&d.map.y>=0&&d.map.x+d.map.width<=TOWN_MAP_WIDTH&&d.map.y+d.map.height<=TOWN_MAP_HEIGHT),'6 district rectangles must stay inside map bounds');

  const requiredIds=['central-everthread-bank','loomline-motors','hearthline-realty','threadwell-residential','crossroads-mall','nightjar-diner','weaver-park','everthread-market','everthread-school','everthread-college','everthread-general-hospital','pulseworks-gym','silverframe-studios','facet-modeling-agency','everthread-speedway','everthread-stadium','everthread-defense-garrison','everthread-city-hall','everthread-courthouse','public-safety-center','everthread-correctional','everthread-air-terminal','loomworks-business-district','blackline-freight-yard'];
  verify(requiredIds.every(id=>ids.includes(id)),'7 every Phase 8B-required institution/location family must have a concrete stable registry entry');
  verify(TOWN_PLACES.some(place=>place.category==='finance')&&TOWN_PLACES.some(place=>place.category==='residential')&&TOWN_PLACES.some(place=>place.category==='travel'),'8 the registry must span finance, residential, and travel rather than only career landmarks');
  verify(TOWN_PLACES.filter(place=>place.category==='justice').length>=3,'9 civic justice must include multiple distinct facilities plus prison coverage');
  verify(TOWN_PLACES.some(place=>place.visibility==='underworld_discovery'),'10 the appropriate underworld-career location must be discoverable rather than universally advertised');
  verify(TOWN_PLACES.every(place=>place.activityTags.length>0),'11 every place must expose data-driven activity tags for later shared-experience/routing work');
  const routedServices=TOWN_PLACES.flatMap(place=>place.routes??[]);
  verify(routedServices.every(route=>Boolean(route.id&&route.label&&route.description&&route.destination)),'12 routing metadata must remain authored service metadata and never embed map-owned gameplay actions');

  const state=createNewGame({seed:'phase8b-map'});
  verify(state.saveVersion===CURRENT_SAVE_VERSION&&CURRENT_SAVE_VERSION===15,'13 Phase 8B must not add durable save state or bump schema 15');
  verify(state.character.countryId===EVERTHREAD_COUNTRY_ID,'14 the map foundation must sit on the certified Everthread home-setting authority');
  const before=JSON.stringify(state);const rngBefore=state.rngCounter,idBefore=state.idCounter;
  const first=buildTownMapProjection(state);const second=buildTownMapProjection(state);
  verify(JSON.stringify(first)===JSON.stringify(second),'15 identical read-only map projections must be deterministic');
  verify(JSON.stringify(state)===before&&state.rngCounter===rngBefore&&state.idCounter===idBefore,'16 map browsing/projection must not mutate GameState, consume gameplay RNG, or allocate runtime ids');
  verify(first.playerInEverthread&&first.playerLocationLabel==='Everthread','17 local players must be identified from country/city authority without a duplicate current-place field');
  verify(first.hiddenPlaceCount===1&&!first.places.some(place=>place.id==='blackline-freight-yard'),'18 a normal new life must not start with the underworld location exposed');
  verify(!townPlaceDiscovered(state,TOWN_PLACES.find(place=>place.id==='blackline-freight-yard')!),'19 underworld discovery must be a pure existing-state projection');

  state.specialCareers.crimeOrg={active:true,rank:'associate',standing:10};
  const discovered=buildTownMapProjection(state);
  verify(discovered.hiddenPlaceCount===0&&discovered.places.some(place=>place.id==='blackline-freight-yard'),'20 existing organized-crime participation can reveal the underworld location without adding discovery save state');
  state.specialCareers.crimeOrg=undefined;state.legal.investigationHeat=35;
  verify(buildTownMapProjection(state).places.some(place=>place.id==='blackline-freight-yard'),'21 existing legal heat can also reveal that location coherently');
  state.legal.investigationHeat=0;

  const hospital=buildTownMapProjection(state,{query:'medical'});
  verify(hospital.places.length===1&&hospital.places[0]?.id==='everthread-general-hospital','22 search must match activity/description semantics deterministically');
  const education=buildTownMapProjection(state,{categories:['education']});
  verify(education.places.length===2&&education.places.every(place=>place.category==='education'),'23 category filtering must return only the requested family');
  const none=buildTownMapProjection(state,{categories:[] as TownPlaceCategory[]});
  verify(none.places.length===0,'24 explicitly turning every category off must produce a deliberately blank filtered map');

  for(const width of [360,390,412,430]){
    const viewport={width,height:560};
    const camera=fitTownMapCamera(viewport);
    verify(Number.isFinite(camera.scale)&&camera.scale>=.2&&camera.scale<=2.2,`25-${width} mobile fit must produce a bounded valid scale at ${width}px`);
    verify(Math.abs((camera.x+TOWN_MAP_WIDTH*camera.scale/2)-width/2)<.001,`26-${width} fit must center the authored town horizontally at ${width}px`);
    const cover=coverTownMapCamera(viewport);
    verify(TOWN_MAP_WIDTH*cover.scale>=width&&TOWN_MAP_HEIGHT*cover.scale>=560,`26b-${width} initial map view must fill the flush Threadspace viewport without letterbox gaps at ${width}px`);
  }
  verify(clampTownMapScale(-2)===.2&&clampTownMapScale(9)===2.2,'27 zoom scale must remain bounded');
  const constrained=constrainTownMapCamera({x:9999,y:-9999,scale:1},{width:390,height:560});
  verify(constrained.x<=72&&constrained.y>=560-TOWN_MAP_HEIGHT-72,'28 panning constraints must prevent the town from being completely lost offscreen');
  const bounds=townMapWorldBounds({x:0,y:0,scale:1},{width:390,height:560},0);
  const culled=townMapPlacesInBounds(first.places,bounds);
  verify(culled.length>0&&culled.length<first.places.length,'29 viewport culling must omit offscreen places rather than mounting the whole registry');
  const bank=TOWN_PLACES.find(place=>place.id==='central-everthread-bank')!;const diner=TOWN_PLACES.find(place=>place.id==='nightjar-diner')!;
  verify(townMapMarkerVisible(bank,.22)&&!townMapMarkerVisible(diner,.22)&&townMapMarkerVisible(diner,.7),'30 zoom-based progressive disclosure must keep major landmarks visible while deferring minor pins');
  verify(!townMapLabelVisible(diner,.6)&&townMapLabelVisible(diner,.9),'31 labels must progressively appear at authored zoom thresholds');

  const semanticA=townMapSemanticView(state),semanticB=townMapSemanticView(state);
  verify(JSON.stringify(semanticA)===JSON.stringify(semanticB),'32 the semantic map view must be stable for QA/future AI consumers');
  verify(semanticA.places.every(place=>typeof place.x==='number'&&typeof place.y==='number'&&Array.isArray(place.activityTags)),'33 semantic projection must expose identity/layout/tags without copying simulation results');

  state.character.countryId='jp';state.character.city='Tokyo';
  const abroad=buildTownMapProjection(state);
  verify(!abroad.playerInEverthread&&abroad.playerLocationLabel==='Tokyo, Japan','34 the Everthread map must remain a browseable hometown projection after authoritative emigration rather than rewriting residence');
  verify(state.saveVersion===15,'35 browsing Everthread after emigration must not alter the save schema or location authority');

  return checks;
}
