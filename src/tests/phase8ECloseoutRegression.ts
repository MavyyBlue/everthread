import { ASSET_SECTION_NAVIGATION, CONTEXTUAL_NAVIGATION, PRIMARY_NAVIGATION, primaryNavigationItems } from '../core/navigation';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { createInstitutionRouteRequest, resolveInstitutionDestination } from '../core/institutionRouting';
import { TOWN_PLACES, type TownPlaceCategory } from '../data/townPlaces';
import { migrateSave } from '../services/SaveSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { projectPlayerProfile } from '../systems/PlayerProfileSystem';
import {
  buildTownMapProjection,
  coverTownMapCamera,
  fitTownMapCamera,
  townMapSemanticView,
} from '../systems/TownMapSystem';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';

export async function runPhase8ECloseoutRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 8E closeout regression failed: ${message}`);}

  const primaryIds=PRIMARY_NAVIGATION.map(item=>item.id);const contextualIds=CONTEXTUAL_NAVIGATION.map(item=>item.id);const ownerIds=new Set([...primaryIds,...contextualIds]);
  verify(JSON.stringify(primaryIds)===JSON.stringify(['life','people','map']),'01 persistent primary navigation must keep Life, People, and Map first-class without six-way mobile crowding');
  verify(new Set([...primaryIds,...contextualIds]).size===PRIMARY_NAVIGATION.length+CONTEXTUAL_NAVIGATION.length,'02 persistent and contextual navigation ids must remain unique');
  verify([...PRIMARY_NAVIGATION,...CONTEXTUAL_NAVIGATION].every(item=>item.label.trim().length>0&&item.icon.trim().length>0),'03 every navigation destination needs a visible label and compact icon');
  verify(!primaryIds.some(id=>String(id)==='assets')&&primaryNavigationItems('assets',true).some(item=>item.id==='assets'),'04 the legacy Assets owner must remain reachable as a map-routed contextual destination rather than a permanent tab');

  const assetSections=ASSET_SECTION_NAVIGATION.map(item=>item.id);
  verify(JSON.stringify(assetSections)===JSON.stringify(['money','property','invest','business','estate','more']),'05 all six established Assets sections must remain directly reachable');
  verify(new Set(assetSections).size===ASSET_SECTION_NAVIGATION.length,'06 Assets section ids must remain unique');

  const routes=TOWN_PLACES.flatMap(place=>(place.routes??[]).map(route=>({place,route,resolved:resolveInstitutionDestination(route.destination)})));
  verify(routes.length===29,'07 closeout must preserve all 29 current institution service doorways');
  verify(routes.every(({resolved})=>ownerIds.has(resolved.tab)),'08 every map institution route must terminate in a still-reachable core or contextual owner');
  verify(routes.filter(({resolved})=>resolved.tab==='assets').every(({resolved})=>resolved.tab!=='assets'||assetSections.includes(resolved.assetsTab)),'09 every Assets-bound map route must terminate in a still-reachable Assets section');
  verify(routes.some(({resolved})=>resolved.tab==='assets'&&resolved.assetsTab==='money')&&routes.some(({resolved})=>resolved.tab==='assets'&&resolved.assetsTab==='property')&&routes.some(({resolved})=>resolved.tab==='assets'&&resolved.assetsTab==='invest')&&routes.some(({resolved})=>resolved.tab==='assets'&&resolved.assetsTab==='business'),'10 map routing must complement rather than replace the established money/property/invest/business entry points');
  verify(createInstitutionRouteRequest('central-everthread-bank','banking',100)?.resolved.tab==='life','11 bank routing must still land in the established Life banking owner');
  verify(createInstitutionRouteRequest('everthread-air-terminal','travel',101)?.resolved.tab==='activities','12 travel routing must still land in the established Activities owner');
  verify(createInstitutionRouteRequest('everthread-college','admissions',102)?.resolved.tab==='career','13 education routing must still land in the established Career/Education owner');

  await withEverthreadAiTestbench({seed:'phase8e-assets',screen:'assets'},async bench=>{
    const actionIds=new Set(bench.availableActions('assets').map(action=>action.id));
    const required=[
      'assets.property.purchase','assets.property.rent','assets.property.renovate','assets.property.sell',
      'assets.vehicle.purchase','assets.vehicle.repair','assets.collectible.purchase',
      'assets.invest.buy','assets.invest.sell','assets.business.start','assets.business.product',
    ];
    verify(required.every(id=>actionIds.has(id)),'14 every established Assets gameplay family must remain exposed by the canonical semantic action surface');
    const before=JSON.stringify(bench.getState());
    bench.observe('assets');bench.observe('people');bench.observe('life');
    verify(JSON.stringify(bench.getState())===before,'15 merely navigating semantic owner views must not mutate gameplay state');
  });

  const browse=createNewGame({seed:'phase8e-browse'});browse.character.age=29;const browseBefore=JSON.stringify(browse),rngBefore=browse.rngCounter,idBefore=browse.idCounter;
  const categories:TownPlaceCategory[]=['finance','education','health','career'];
  buildTownMapProjection(browse);
  buildTownMapProjection(browse,{query:'bank'});
  buildTownMapProjection(browse,{query:'school',categories});
  buildTownMapProjection(browse,{categories:[]});
  townMapSemanticView(browse);
  projectPlayerProfile(browse);
  for(const place of TOWN_PLACES){for(const route of place.routes??[])createInstitutionRouteRequest(place.id,route.id,200);}
  verify(JSON.stringify(browse)===browseBefore,'16 map/profile/route browsing must remain strictly read-only across a mixed closeout browsing session');
  verify(browse.rngCounter===rngBefore&&browse.idCounter===idBefore,'17 read-only Phase 8 browsing must consume neither gameplay RNG nor runtime ids');

  for(const width of [360,390,412,430]){
    const viewport={width,height:560};const fit=fitTownMapCamera(viewport),cover=coverTownMapCamera(viewport);
    verify(Number.isFinite(fit.scale)&&Number.isFinite(cover.scale),`18-${width} map cameras must stay finite on the supported ${width}px phone width`);
    verify(cover.scale>=fit.scale,`19-${width} immersive cover view must never be smaller than whole-map fit at ${width}px`);
  }

  const legacy=createNewGame({seed:'phase8e-schema14'});legacy.saveVersion=14;legacy.character.countryId='us';legacy.character.city='New York';legacy.travel.visitedCountries=['us'];legacy.travel.visitedCities=['New York'];delete (legacy as unknown as {personalInventory?:unknown}).personalInventory;delete (legacy.character as unknown as {namePoolCountryId?:unknown}).namePoolCountryId;
  const legacyInput=structuredClone(legacy),legacyRng=legacy.rngCounter,legacyId=legacy.idCounter;
  const migratedA=migrateSave(legacyInput),migratedB=migrateSave(structuredClone(legacy));
  verify(migratedA.saveVersion===CURRENT_SAVE_VERSION&&CURRENT_SAVE_VERSION===18,'20 a schema-14 save must migrate all the way through the Phase 8 closeout schema 18 baseline');
  verify(migratedA.character.city==='Everthread'&&migratedA.personalInventory.items.length===0,'21 combined setting/inventory migration must produce Everthread residence plus an empty personal inventory without inventing possessions');
  verify(migratedA.rngCounter===legacyRng&&migratedA.idCounter===legacyId,'22 combined Phase 8 migration must remain RNG- and runtime-ID-neutral');
  verify(JSON.stringify(migratedA)===JSON.stringify(migratedB),'23 identical legacy inputs must migrate deterministically');
  const remigrated=migrateSave(structuredClone(migratedA));
  verify(JSON.stringify(remigrated)===JSON.stringify(migratedA),'24 current-schema normalization must be idempotent after the complete Phase 8 migration chain');

  const externalFixture=createNewGame({seed:'phase8e-external-fixture'});externalFixture.character.countryId='jp';externalFixture.character.city='Tokyo';const fixtureBefore=JSON.stringify(externalFixture);const hometown=buildTownMapProjection(externalFixture);const profile=projectPlayerProfile(externalFixture);
  verify(!hometown.playerInEverthread&&profile.location==='Tokyo, Japan','25 read-only projections must tolerate an out-of-setting fixture without silently mutating it');
  verify(JSON.stringify(externalFixture)===fixtureBefore,'26 hometown browsing and player-profile projection must remain non-mutating even for an invalid external fixture');

  const hidden=createNewGame({seed:'phase8e-hidden'});const hiddenBefore=JSON.stringify(hidden);const normal=buildTownMapProjection(hidden),inclusive=buildTownMapProjection(hidden,{includeUndiscovered:true});
  verify(normal.hiddenPlaceCount===1&&inclusive.places.length===TOWN_PLACES.length,'27 underworld visibility must remain a projection of existing state rather than durable map discovery state');
  verify(JSON.stringify(hidden)===hiddenBefore,'28 inspecting undiscovered places for QA must not reveal or persist them in gameplay state');

  return checks;
}
