import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { createInstitutionRouteRequest, resolveInstitutionDestination } from '../core/institutionRouting';
import { TOWN_PLACES, type TownInstitutionDestination } from '../data/townPlaces';
import { createNewGame } from '../systems/CharacterSystem';
import { buildTownMapProjection } from '../systems/TownMapSystem';

export function runPhase8CInstitutionRoutingRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 8C institution-routing regression failed: ${message}`);}
  const place=(id:string)=>TOWN_PLACES.find(candidate=>candidate.id===id)!;
  const service=(placeId:string,serviceId:string)=>place(placeId).routes?.find(candidate=>candidate.id===serviceId)!;
  const resolved=(placeId:string,serviceId:string)=>resolveInstitutionDestination(service(placeId,serviceId).destination);

  const allServices=TOWN_PLACES.flatMap(item=>(item.routes??[]).map(route=>({place:item,route})));
  verify(allServices.length===28,'1 the certified initial town must expose the intended 28 institution service doorways without padding landmark-only places');
  verify(TOWN_PLACES.every(item=>new Set((item.routes??[]).map(route=>route.id)).size===(item.routes??[]).length),'2 service ids must be unique within each authored place');
  verify(allServices.every(({route})=>route.label.trim().length>0&&route.description.trim().length>0),'3 every routed service needs player-facing identity and context');
  verify(allServices.every(({route})=>!route.label.toLowerCase().includes('phase')),'4 routing copy must be player-facing rather than exposing development-phase terminology');
  const tabs=new Set(allServices.map(({route})=>resolveInstitutionDestination(route.destination).tab));
  verify(tabs.size===4&&tabs.has('life')&&tabs.has('assets')&&tabs.has('activities')&&tabs.has('career'),'5 routes must terminate only in the four mature existing owner screens, never a map-owned mechanic');

  const bankDestinations=new Set((place('central-everthread-bank').routes??[]).map(route=>route.destination));
  verify(['money','banking','payments','investments'].every(destination=>bankDestinations.has(destination as TownInstitutionDestination)),'6 Central Everthread Bank must route money, credit/banking, payments, and investments');
  verify(JSON.stringify(resolved('central-everthread-bank','banking'))===JSON.stringify({tab:'life',bankingView:'overview'}),'7 bank credit services must open the established Credit & Banking owner');
  verify(JSON.stringify(resolved('central-everthread-bank','payments'))===JSON.stringify({tab:'life',bankingView:'payments'}),'8 bank bill services must open established Bills & Payments directly');
  verify(JSON.stringify(resolved('central-everthread-bank','investments'))===JSON.stringify({tab:'assets',assetsTab:'invest'}),'9 bank investing must route to the established fictional securities market');
  verify(JSON.stringify(resolved('central-everthread-bank','money'))===JSON.stringify({tab:'assets',assetsTab:'money'}),'10 bank money overview must route to existing Assets financial summary');

  verify(JSON.stringify(resolved('loomline-motors','browse-vehicles'))===JSON.stringify({tab:'assets',assetsTab:'property',propertyView:'browse',assetAnchor:'vehicles'}),'11 dealership browsing must route to the existing vehicle market and financing-at-purchase flow');
  verify(JSON.stringify(resolved('loomline-motors','owned-vehicles'))===JSON.stringify({tab:'assets',assetsTab:'property',propertyView:'owned',assetAnchor:'owned-vehicles'}),'12 dealership ownership service must route to existing vehicle management');
  verify(JSON.stringify(resolved('hearthline-realty','browse-homes'))===JSON.stringify({tab:'assets',assetsTab:'property',propertyView:'browse',assetAnchor:'homes'}),'13 Realty must route home shopping and mortgage offers through existing property purchase ownership');
  verify(JSON.stringify(resolved('hearthline-realty','owned-homes'))===JSON.stringify({tab:'assets',assetsTab:'property',propertyView:'owned',assetAnchor:'owned-homes'}),'14 Realty must route rentals/renovations/sales through existing owned-home controls');

  verify(JSON.stringify(resolved('everthread-school','education'))===JSON.stringify({tab:'career',careerTab:'education',careerAnchor:'education-current'}),'15 the public school must route to the established Education surface');
  verify(JSON.stringify(resolved('everthread-college','admissions'))===JSON.stringify({tab:'career',careerTab:'education',careerAnchor:'education-admissions'}),'16 the college must route to established post-secondary admissions with owner-side eligibility intact');
  verify(JSON.stringify(resolved('everthread-general-hospital','healthcare'))===JSON.stringify({tab:'activities',activitySheet:'health'}),'17 the hospital must route directly to established healthcare treatment');
  verify(JSON.stringify(resolved('pulseworks-gym','wellness'))===JSON.stringify({tab:'activities',activityAnchor:'wellness'}),'19 the gym must route to established wellness actions without copying their limits or effects');
  verify(JSON.stringify(resolved('everthread-air-terminal','travel'))===JSON.stringify({tab:'activities',activitySheet:'travel'}),'20 the air terminal must route to established travel/emigration controls');

  for(const justiceId of ['everthread-courthouse','public-safety-center','everthread-correctional']){
    const route=place(justiceId).routes?.[0];
    verify(Boolean(route&&JSON.stringify(resolveInstitutionDestination(route.destination))===JSON.stringify({tab:'activities',activitySheet:'crime'})),`21-${justiceId} justice facilities must reuse the existing legal/crime/corrections owner`);
  }

  verify(JSON.stringify(resolved('loomworks-business-district','work'))===JSON.stringify({tab:'career',careerTab:'work',careerAnchor:'work-market'}),'22 the business district must route to established employment/workplace controls');
  verify(JSON.stringify(resolved('loomworks-business-district','business'))===JSON.stringify({tab:'assets',assetsTab:'business'}),'23 company management must remain owned by the established Assets business surface');
  verify(JSON.stringify(resolved('everthread-city-hall','politics'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'politics'}),'24 City Hall civic routing must land on the existing Politics life path');
  verify(JSON.stringify(resolved('everthread-city-hall','business'))===JSON.stringify({tab:'assets',assetsTab:'business'}),'25 City Hall company services must reuse established company formation/management');

  verify((place('silverframe-studios').routes??[]).some(route=>route.destination==='acting')&&(place('silverframe-studios').routes??[]).some(route=>route.destination==='directing'),'26 Silverframe Studios must expose both existing acting and directing authorities');
  verify(JSON.stringify(resolved('facet-modeling-agency','modeling'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'modeling'}),'27 modeling agency must route to the existing Modeling life path');
  verify(JSON.stringify(resolved('everthread-speedway','racing'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'racing'}),'28 speedway must route to the existing Motorsport life path');
  verify(JSON.stringify(resolved('everthread-stadium','sports'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'sports'}),'29 stadium must route to the existing Professional sports life path');
  verify(JSON.stringify(resolved('everthread-defense-garrison','military'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'military'}),'30 garrison must route to the existing Military life path');
  verify(JSON.stringify(resolved('blackline-freight-yard','organized-crime'))===JSON.stringify({tab:'career',careerTab:'special',specialPath:'crimeOrg'}),'31 Blackline must route to the existing organized-crime life path rather than owning crime state');

  verify(!place('threadwell-residential').routes&&!place('crossroads-mall').routes&&!place('nightjar-diner').routes&&!place('everthread-market').routes,'32 landmarks without a mature mechanic must remain honest landmarks instead of receiving fake destination actions');
  verify(createInstitutionRouteRequest('not-a-place','anything',1)===undefined,'33 stale place ids must fail safely');
  verify(createInstitutionRouteRequest('central-everthread-bank','not-a-service',1)===undefined,'34 stale service ids must fail safely');
  const requestA=createInstitutionRouteRequest('central-everthread-bank','banking',41)!;
  const requestB=createInstitutionRouteRequest('central-everthread-bank','banking',41)!;
  verify(JSON.stringify(requestA)===JSON.stringify(requestB),'35 identical route requests must resolve deterministically');
  verify(requestA.placeId==='central-everthread-bank'&&requestA.serviceId==='banking'&&requestA.placeLabel==='Central Everthread Bank','36 route context must preserve exact authored place/service identity for UI traceability');

  const state=createNewGame({seed:'phase8c-routing'});const before=JSON.stringify(state);const rngBefore=state.rngCounter,idBefore=state.idCounter;
  createInstitutionRouteRequest('loomline-motors','browse-vehicles',42);createInstitutionRouteRequest('everthread-general-hospital','healthcare',43);resolveInstitutionDestination('politics');
  verify(JSON.stringify(state)===before&&state.rngCounter===rngBefore&&state.idCounter===idBefore,'37 routing resolution must not mutate GameState, consume gameplay RNG, or allocate runtime ids');
  verify(state.saveVersion===CURRENT_SAVE_VERSION&&CURRENT_SAVE_VERSION===17,'38 institution routing must stay ephemeral and require no save-schema bump');
  const hidden=buildTownMapProjection(state);
  verify(!hidden.places.some(item=>item.id==='blackline-freight-yard'),'39 routing metadata must not bypass certified underworld discovery projection');
  state.specialCareers.crimeOrg={active:true,rank:'associate',standing:20};
  verify(buildTownMapProjection(state).places.some(item=>item.id==='blackline-freight-yard'),'40 existing organized-crime state still controls whether Blackline is reachable from the visible map');

  return checks;
}
