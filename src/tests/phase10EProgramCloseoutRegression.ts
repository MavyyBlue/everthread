import { validateState } from '../core/invariants';
import { createInstitutionRouteRequest, resolveInstitutionDestination } from '../core/institutionRouting';
import { CONTEXTUAL_NAVIGATION, PRIMARY_NAVIGATION, primaryNavigationItems } from '../core/navigation';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { TOWN_PLACES } from '../data/townPlaces';
import { exportSave, importSave, migrateSave } from '../services/SaveSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { checkDeath } from '../systems/DeathSystem';
import { buildDynastyTransitionReview } from '../systems/DynastyTransitionSystem';
import { previewEstate } from '../systems/EstateSystem';
import { wealthBreakdown, netWorth } from '../systems/FinanceSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import {
  PLACE_LEGACY_PER_PLACE_LIMIT,
  PLACE_LEGACY_PLACE_LIMIT,
  PLACE_LEGACY_TOTAL_LIMIT,
  generationalPlaceMemoryProjection,
} from '../systems/GenerationalPlaceMemorySystem';
import {
  LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT,
  LIVING_MAP_TOTAL_CONTEXT_LIMIT,
  livingMapPlaceContext,
  livingMapProjection,
} from '../systems/LivingMapSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { buildPeopleWorkspaceModel, peopleWorkspaceSemanticView } from '../systems/PeopleWorkspaceSystem';
import { projectPlayerProfile } from '../systems/PlayerProfileSystem';
import { playerResidenceProjection } from '../systems/ResidentialLifeSystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import {
  buildTownMapProjection,
  coverTownMapCamera,
  fitTownMapCamera,
  townMapSemanticView,
} from '../systems/TownMapSystem';
import { emigrate, travel } from '../systems/TravelSystem';
import { businessWorkLocation, workingEverthreadProjection } from '../systems/WorkingEverthreadSystem';
import type { Business, GameState, Npc, PropertyAsset, Relationship, TimelineEntry } from '../types/game';
import { withEverthreadAiTestbench } from './aiInteractionTestbench';

function clone<T>(value:T):T{return structuredClone(value);}
function state(seed:string,age=36){
  const value=createNewGame({seed,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY});
  value.character.age=age;value.currentYear=2080;value.settings.autoSave=false;value.finances.cash=6_000_000;value.flags.financiallyIndependent=true;
  return value;
}
function property(overrides:Partial<PropertyAsset>={}):PropertyAsset{return{id:'10e-home',typeId:'starter_house_standard',name:'Threadwell Family House',location:EVERTHREAD_CITY,purchasePrice:360_000,marketValue:420_000,condition:91,age:7,amenities:[],origin:'purchased',primaryResidence:true,...overrides};}
function business(overrides:Partial<Business>={}):Business{return{id:'10e-business',industryId:'software',name:'Everthread Systems',foundedAge:28,origin:'founded',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,capital:250_000,revenue:180_000,expenses:95_000,profit:85_000,employees:9,demand:70,reputation:74,valuation:760_000,productIds:['software_product_1'],priceIndex:1,marketingBudget:9_000,compensationIndex:1,bankrupt:false,...overrides};}
function milestone(id:string,placeId:string,age=36,importance:1|2|3=3):TimelineEntry{return{id,year:2080-(36-age),age,category:'random',placeId,text:`Closeout milestone ${id}`,importance};}
function addChild(value:GameState,id:string,firstName:string,age=30){
  const npc:Npc={id,firstName,lastName:value.character.lastName,age,alive:true,health:91,happiness:78,wealth:45_000,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,sexuality:'bisexual',fertility:62,maritalStatus:'single',traits:['responsible','calm'],hiddenOpinion:82,memories:[],parentIds:[value.character.id],childIds:[],simulationTier:'full'};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:88,attraction:0,compatibility:80,yearsKnown:age};
  value.npcs[id]=npc;value.relationships.push(rel);ensureNpcLife(value,npc);return npc;
}
function addBackgroundPerson(value:GameState,index:number){
  const id=`10e-background-${index}`;const npc:Npc={id,firstName:`Person${index}`,lastName:'Closeout',age:18+(index%70),alive:true,health:70,happiness:60,wealth:5000,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,sexuality:'bisexual',fertility:50,maritalStatus:'single',traits:['calm'],hiddenOpinion:0,memories:[],parentIds:[],childIds:[],simulationTier:'background'};
  value.npcs[id]=npc;value.relationships.push({id:`rel-${id}`,npcId:id,type:'friend',score:35+(index%60),attraction:0,compatibility:50,yearsKnown:1+(index%12)});ensureNpcLife(value,npc);return npc;
}
function projectionSnapshot(value:GameState){return{
  residence:playerResidenceProjection(value),
  work:workingEverthreadProjection(value),
  legacy:generationalPlaceMemoryProjection(value),
  living:livingMapProjection(value),
  map:townMapSemanticView(value),
  people:peopleWorkspaceSemanticView(value),
  profile:projectPlayerProfile(value),
};}

export async function runPhase10EProgramCloseoutRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 10E Program Closeout regression failed: ${message}`);}
  const approx=(a:number,b:number,tolerance:number,message:string)=>verify(Math.abs(a-b)<=tolerance,`${message} (${a} vs ${b})`);

  verify(CURRENT_SAVE_VERSION===17,'01 program closeout must preserve certified save schema 17');
  const routeCount=TOWN_PLACES.reduce((sum,place)=>sum+(place.routes?.length??0),0);
  verify(TOWN_PLACES.length===25&&routeCount===29,'02 closeout must preserve the player-tested 25-place / 29-route Everthread town rather than pad content');
  const fresh=state('10e-fresh');
  verify(!('livingWorld' in (fresh as unknown as Record<string,unknown>))&&!('livingMap' in (fresh as unknown as Record<string,unknown>))&&!('placeHistory' in (fresh as unknown as Record<string,unknown>))&&!('residenceLedger' in (fresh as unknown as Record<string,unknown>)),'03 the complete Living Everthread program must still have no parallel world/map/place/residence authority');
  verify(PLACE_LEGACY_TOTAL_LIMIT===24&&PLACE_LEGACY_PLACE_LIMIT===8&&PLACE_LEGACY_PER_PLACE_LIMIT===6&&LIVING_MAP_TOTAL_CONTEXT_LIMIT===32&&LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT===6,'04 place-memory and living-map output bounds remain explicit at program closeout');

  const primaryIds=PRIMARY_NAVIGATION.map(item=>item.id);const contextualIds=CONTEXTUAL_NAVIGATION.map(item=>item.id);const ownerIds=new Set([...primaryIds,...contextualIds]);
  verify(JSON.stringify(primaryIds)===JSON.stringify(['life','people','map']),'05 permanent mobile navigation remains the player-tested Life / People / Map shell');
  verify(JSON.stringify(contextualIds)===JSON.stringify(['activities','career','assets']),'06 Activities / Career / Assets remain contextual owners rather than disappearing functionality');
  const resolvedRoutes=TOWN_PLACES.flatMap(place=>(place.routes??[]).map(route=>({placeId:place.id,serviceId:route.id,resolved:resolveInstitutionDestination(route.destination)})));
  verify(resolvedRoutes.every(item=>ownerIds.has(item.resolved.tab)),'07 every institution doorway still resolves to a reachable mature owner');
  verify(contextualIds.every(id=>resolvedRoutes.some(item=>item.resolved.tab===id)),'08 every contextual owner remains reachable from at least one authored town location');
  verify(contextualIds.every(id=>primaryNavigationItems(id,true).length===4&&primaryNavigationItems(id,true).at(-1)?.id===id),'09 each map-routed contextual owner becomes one temporary fourth navigation destination');
  verify(contextualIds.every(id=>primaryNavigationItems(id,false).length===3&&!primaryNavigationItems(id,false).some(item=>item.id===id)),'10 contextual destinations do not permanently crowd the mobile bar after route context is gone');
  verify(createInstitutionRouteRequest('everthread-air-terminal','travel',1)?.resolved.tab==='activities'&&createInstitutionRouteRequest('threadtone-music-studio','music',2)?.resolved.tab==='career','11 Airport and Threadtone Music Studio still route into their established Travel and Music owners');

  const integrated=state('10e-integrated');integrated.assets.properties.push(property());integrated.businesses.push(business());integrated.timeline.push(milestone('park','weaver-park'),milestone('diner','nightjar-diner',35,2));const child=addChild(integrated,'10e-child','Avery',14);child.life!.education.records.push({stage:'secondary',institution:'Everthread School',startAge:13,performance:74,graduated:false});
  const before=JSON.stringify(integrated),rngBefore=integrated.rngCounter,idBefore=integrated.idCounter,revisionBefore=integrated.actionLedger.revision;
  const snapshotsA=projectionSnapshot(integrated),snapshotsB=projectionSnapshot(integrated);
  verify(JSON.stringify(integrated)===before,'12 browsing Residence / Work / Legacy / Map / Threadspace / Profile together remains strictly read-only');
  verify(integrated.rngCounter===rngBefore,'13 the combined Living Everthread projection stack consumes no gameplay RNG');
  verify(integrated.idCounter===idBefore,'14 the combined Living Everthread projection stack allocates no runtime IDs');
  verify(integrated.actionLedger.revision===revisionBefore,'15 the combined Living Everthread projection stack consumes no gameplay actions');
  verify(JSON.stringify(snapshotsA)===JSON.stringify(snapshotsB),'16 repeated integrated projection produces byte-identical deterministic output');
  verify(snapshotsA.profile.fullName===snapshotsA.people.player.name&&snapshotsA.people.player.id===integrated.character.id,'17 Threadspace and Player Profile agree on the exact current protagonist identity');
  verify(snapshotsA.map.playerLocationLabel===snapshotsA.profile.location&&snapshotsA.profile.location.includes(EVERTHREAD_CITY),'18 Map and Player Profile agree on canonical residence label');
  verify(snapshotsA.residence.placeId==='threadwell-residential'&&snapshotsA.residence.visitable,'19 Residential Life projects the current home into the canonical Threadwell place');
  verify(livingMapPlaceContext(snapshotsA.living,'threadwell-residential')?.contexts.some(context=>context.kind==='home')===true,'20 Living Map composes You live here from Residential Life rather than owning residence itself');
  verify(snapshotsA.map.places.find(place=>place.id==='threadwell-residential')?.contexts?.some(context=>context.kind==='home')===true,'21 Town Map exposes the same derived home context used by Living Map');
  verify(businessWorkLocation(integrated,integrated.businesses[0]!).inEverthread,'22 player business location remains owned by Business/Working Everthread truth');
  verify(snapshotsA.living.places.some(place=>place.contexts.some(context=>context.kind==='business'&&context.sourceIds.includes('10e-business')))||snapshotsA.living.districts.some(district=>district.contexts.some(context=>context.kind==='business'&&context.sourceIds.includes('10e-business'))),'23 Living Map projects the current company without duplicating its business record');
  verify(snapshotsA.legacy.places.some(place=>place.placeId==='weaver-park'&&place.currentLifeMilestones>0),'24 a meaningful current-life place milestone survives into Generational Place Memory');
  verify(livingMapPlaceContext(snapshotsA.living,'weaver-park')?.contexts.some(context=>context.kind==='legacy')===true,'25 the same place memory decorates the map through composition rather than a second memory ledger');
  verify(snapshotsA.profile.assetSummary.homes===1&&snapshotsA.profile.assetSummary.businesses===1,'26 Player Profile asset summary derives exact counts from authoritative property/business state');

  const hidden=state('10e-hidden');hidden.timeline.push(milestone('blackline-memory','blackline-freight-yard'));const hiddenMap=buildTownMapProjection(hidden);
  verify(!hiddenMap.places.some(place=>place.id==='blackline-freight-yard'),'27 a remembered hidden place does not bypass the existing discovery gate');
  hidden.legal.investigationHeat=30;verify(buildTownMapProjection(hidden).places.some(place=>place.id==='blackline-freight-yard'),'28 existing legal/discovery truth still controls Blackline visibility at closeout');

  for(const width of [360,390,412,430]){
    const viewport={width,height:560};const fit=fitTownMapCamera(viewport),cover=coverTownMapCamera(viewport);
    verify(Number.isFinite(fit.scale)&&fit.scale>0&&Number.isFinite(cover.scale)&&cover.scale>0,`29-${width} Map camera remains finite on the supported ${width}px mobile width`);
    verify(cover.scale>=fit.scale,`30-${width} immersive cover camera never under-scales whole-map fit on ${width}px mobile`);
  }

  const stress=state('10e-bounded');stress.assets.properties.push(...Array.from({length:60},(_,index)=>property({id:`10e-property-${index}`,name:`Closeout Property ${index}`,primaryResidence:index===0})));stress.businesses.push(...Array.from({length:60},(_,index)=>business({id:`10e-business-${index}`,name:`Closeout Company ${index}`,industryId:index%2?'restaurant':'software'})));for(let index=0;index<240;index++)stress.timeline.push(milestone(`10e-memory-${index}`,index%3===0?'weaver-park':index%3===1?'nightjar-diner':'crossroads-mall',Math.max(0,36-(index%36)),3));for(let index=0;index<180;index++)addBackgroundPerson(stress,index);
  const stressBefore=JSON.stringify(stress);const stressLiving=livingMapProjection(stress),stressLegacy=generationalPlaceMemoryProjection(stress),stressPeople=peopleWorkspaceSemanticView(stress),stressModel=buildPeopleWorkspaceModel(stress);
  verify(stressLiving.totalContexts<=LIVING_MAP_TOTAL_CONTEXT_LIMIT,'37 living-map output remains globally bounded under many assets, companies, memories, and people');
  verify([...stressLiving.places,...stressLiving.districts].every(target=>target.contexts.length<=LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT),'38 no single place/district can accumulate unbounded life-context cards');
  verify(stressLegacy.totalMemories<=PLACE_LEGACY_TOTAL_LIMIT&&stressLegacy.places.length<=PLACE_LEGACY_PLACE_LIMIT,'39 generational place memory remains bounded under centuries of candidate history');
  verify(stressLegacy.places.every(place=>place.memories.length<=PLACE_LEGACY_PER_PLACE_LIMIT),'40 no one place monopolizes the bounded family-memory projection');
  verify(stressPeople.people.length<=96&&stressPeople.structuralEdges.length<=160&&stressPeople.truncated,'41 Threadspace semantic projection stays capped for a large lifetime cast');
  verify(new Set(stressModel.people.map(person=>person.id)).size===stressModel.people.length,'42 Threadspace keeps one canonical person node even under a large cast');
  verify(JSON.stringify(stress)===stressBefore,'43 large closeout projections remain read-only instead of normalizing during browsing');

  await withEverthreadAiTestbench({seed:'10e-actions',screen:'life'},async bench=>{
    verify(bench.availableActions('life').some(action=>action.id==='life.age_up'),'44 Life owner still exposes Age Up through the canonical action surface');
    verify(bench.availableActions('people').some(action=>action.id==='people.meet'),'45 People owner still exposes social gameplay after Map/contextual-nav changes');
    verify(bench.availableActions('activities').some(action=>action.id==='activities.gym'),'46 Activities owner still exposes established wellness gameplay');
    verify(bench.availableActions('career').some(action=>action.id==='career.music.song'),'47 Career owner still exposes the Music path reached from Threadtone Studio');
    const assets=new Set(bench.availableActions('assets').map(action=>action.id));verify(assets.has('assets.property.purchase')&&assets.has('assets.business.start')&&assets.has('assets.invest.buy'),'48 Assets owner still exposes property, business, and investment gameplay despite leaving permanent navigation');
    const benchBefore=JSON.stringify(bench.getState());bench.observe('life');bench.observe('people');bench.observe('activities');bench.observe('career');bench.observe('assets');verify(JSON.stringify(bench.getState())===benchBefore,'49 semantic navigation/observation across all mature owners remains mutation-free');
  });

  const saved=state('10e-save');saved.assets.properties.push(property());saved.businesses.push(business());saved.timeline.push(milestone('save-park','weaver-park'));addChild(saved,'save-child','Morgan',12);const savedSnapshot=projectionSnapshot(saved);const serialized=exportSave(saved);const loaded=importSave(serialized);const loadedSnapshot=projectionSnapshot(loaded);
  verify(loaded.saveVersion===CURRENT_SAVE_VERSION,'50 schema-17 save/import remains on the certified closeout schema');
  verify(JSON.stringify(loadedSnapshot)===JSON.stringify(savedSnapshot),'51 save/import preserves Residence / Work / Legacy / Map / Threadspace / Profile semantics together');
  verify(exportSave(importSave(exportSave(loaded)))===exportSave(loaded),'52 normalized schema-17 save cycles remain idempotent');
  verify(validateState(loaded).length===0,'53 integrated Living Everthread save/import remains invariant-clean');

  const legacy=state('10e-legacy-external');legacy.character.countryId='jp';legacy.character.city='Tokyo';legacy.travel.visitedCountries=['jp'];legacy.travel.visitedCities=['Tokyo, Japan'];const legacyRng=legacy.rngCounter,legacyId=legacy.idCounter;const normalized=migrateSave(clone(legacy));
  verify(normalized.character.countryId===EVERTHREAD_COUNTRY_ID&&normalized.character.city===EVERTHREAD_CITY,'54 current-schema legacy external residence deterministically normalizes back to Everthread');
  verify(normalized.travel.visitedCountries.includes('jp')&&normalized.travel.visitedCities.includes('Tokyo, Japan'),'55 residence repair preserves durable temporary-travel biography');
  verify(normalized.rngCounter===legacyRng&&normalized.idCounter===legacyId,'56 residence normalization consumes no gameplay RNG or runtime IDs');
  verify(JSON.stringify(migrateSave(clone(normalized)))===JSON.stringify(normalized),'57 current-schema Everthread-only normalization is idempotent');

  const rewind=state('10e-rewind',30);rewind.flags.rewindEnabled=true;rewind.assets.properties.push(property({id:'rewind-home'}));rewind.timeline.push(milestone('rewind-park','weaver-park',30));captureRewindSnapshot(rewind);const rewindSnapshot=projectionSnapshot(rewind);rewind.character.age=31;rewind.currentYear+=1;rewind.assets.properties=[];rewind.businesses.push(business({id:'after-rewind-business'}));rewind.timeline.push(milestone('after-rewind','nightjar-diner',31));
  verify(rewindToAge(rewind,30).success,'58 rewind restores a Living Everthread snapshot through the established Rewind authority');
  const rewoundSnapshot=projectionSnapshot(rewind);verify(rewoundSnapshot.profile.assetSummary.homes===rewindSnapshot.profile.assetSummary.homes&&rewoundSnapshot.residence.placeId===rewindSnapshot.residence.placeId,'59 rewind restores residential/profile ownership meaning atomically');
  verify(rewoundSnapshot.legacy.places.some(place=>place.placeId==='weaver-park')&&!rewind.timeline.some(entry=>entry.id==='after-rewind'),'60 rewind restores place-memory/timeline truth without retaining future history');
  verify(rewind.flags.rewinds===1&&validateState(rewind).length===0,'61 rewind marks exactly one use and leaves the restored state valid');

  const trip=state('10e-travel',25);const homeBefore={countryId:trip.character.countryId,city:trip.character.city};const vacation=travel(trip,'jp','Tokyo');
  verify(vacation.success&&trip.character.countryId===homeBefore.countryId&&trip.character.city===homeBefore.city,'62 a vacation records travel without displacing canonical Everthread residence');
  verify(trip.travel.visitedCountries.includes('jp')&&trip.travel.visitedCities.some(city=>city.includes('Tokyo')),'63 temporary travel remains durable biography even though residence stays Everthread');
  const beforeEmigrate=JSON.stringify(trip);verify(!emigrate(trip,'us','Chicago').success&&JSON.stringify(trip)===beforeEmigrate,'64 retired emigration compatibility API fails without mutating the save');

  const dynasty=state('10e-dynasty',66);dynasty.finances.cash=8_000_000;const parentOneId=dynasty.character.id;const heirOne=addChild(dynasty,'10e-heir-one','Avery',32);dynasty.assets.properties.push(property({id:'dynasty-home'}));dynasty.businesses.push(business({id:'dynasty-business'}));dynasty.timeline.push(milestone('dynasty-park','weaver-park',64),milestone('dynasty-home-memory','threadwell-residential',65));
  const estateBefore=previewEstate(dynasty);verify(estateBefore.distributableValue>0,'65 estate authority sees a positive distributable estate before dynasty closeout handoff');
  verify(checkDeath(dynasty,true),'66 forced death closes the first integrated Living Everthread generation through DeathSystem');
  const firstLife=dynasty.completedLives.at(-1)!;verify(firstLife.placeMilestones?.some(item=>item.placeId==='weaver-park')===true,'67 completed life archives meaningful place context before succession');
  const firstReview=buildDynastyTransitionReview(dynasty);const firstCandidate=firstReview.successors.find(item=>item.npcId===heirOne.id);verify(Boolean(firstCandidate),'68 dynasty review resolves the intended living successor before mutation');
  verify(continueAsChild(dynasty,heirOne.id).success,'69 first descendant continuation succeeds through the established Generation/Estate authority');
  verify(dynasty.legacy.generation===2&&dynasty.character.id===heirOne.id,'70 first continuation advances exactly one generation and preserves the successor identity');
  verify(dynasty.assets.properties.find(item=>item.id==='dynasty-home')?.origin==='inherited'&&dynasty.assets.properties.find(item=>item.id==='dynasty-home')?.inheritedFromNpcId===parentOneId,'71 inherited home provenance points to the exact immediate predecessor');
  verify(dynasty.businesses.find(item=>item.id==='dynasty-business')?.origin==='inherited'&&dynasty.businesses.find(item=>item.id==='dynasty-business')?.inheritedFromNpcId===parentOneId,'72 inherited company provenance points to the exact immediate predecessor');
  if(firstCandidate)approx(Number(dynasty.flags.inheritanceReceived),firstCandidate.projectedInheritance,1,'73 continuation receives the inheritance projected before successor confirmation');
  const generationTwoProjection=projectionSnapshot(dynasty);verify(generationTwoProjection.legacy.familyLandmarks>=2,'74 successor place legacy composes inherited home and business as surviving family landmarks');
  verify(livingMapPlaceContext(generationTwoProjection.living,'threadwell-residential')?.contexts.some(context=>context.kind==='home')===true,'75 successor Living Map still derives current residence from Residential Life after inheritance');
  verify(generationTwoProjection.living.places.some(place=>place.contexts.some(context=>context.kind==='legacy'&&context.label==='Family legacy')),'76 inherited family landmarks visibly compose into Living Map context');
  verify(generationTwoProjection.profile.generation===2&&generationTwoProjection.people.player.id===heirOne.id,'77 Profile and Threadspace both switch to the actual continued protagonist instead of recreating a blank life');
  verify(generationTwoProjection.profile.location.includes(EVERTHREAD_CITY)&&generationTwoProjection.map.playerLocationLabel.includes(EVERTHREAD_CITY),'78 descendant continuation preserves Everthread as canonical home across presentation surfaces');

  const parentTwoId=dynasty.character.id;dynasty.character.age=61;dynasty.currentYear+=29;const heirTwo=addChild(dynasty,'10e-heir-two','Rowan',29);dynasty.timeline.push(milestone('generation-two-diner','nightjar-diner',60));verify(checkDeath(dynasty,true),'79 second forced death archives the continued protagonist rather than corrupting the first completed life');
  verify(continueAsChild(dynasty,heirTwo.id).success,'80 second descendant continuation succeeds across the already-inherited estate');
  verify(Number(dynasty.legacy.generation)===3&&dynasty.completedLives.length===2&&dynasty.character.id===heirTwo.id,'81 two sequential handoffs produce generation three with exactly two completed lives');
  verify(dynasty.assets.properties.find(item=>item.id==='dynasty-home')?.inheritedFromNpcId===parentTwoId&&dynasty.businesses.find(item=>item.id==='dynasty-business')?.inheritedFromNpcId===parentTwoId,'82 multi-generation asset provenance advances to the immediate predecessor without duplicate shadow lineage');
  verify(new Set(dynasty.assets.properties.map(item=>item.id)).size===dynasty.assets.properties.length&&new Set(dynasty.businesses.map(item=>item.id)).size===dynasty.businesses.length,'83 repeated estate transfer never duplicates authoritative property/business IDs');
  const generationThreeProjection=projectionSnapshot(dynasty);verify(generationThreeProjection.legacy.places.some(place=>place.priorGenerationMilestones>0),'84 generation three can remember prior-life places through bounded archived timeline truth');
  verify(dynasty.completedLives.every(life=>(life.placeMilestones?.length??0)<=12),'85 completed-life place indexes remain bounded across repeated succession');
  const wealth=wealthBreakdown(dynasty);verify(wealth.netWorth===netWorth(dynasty)&&wealth.liabilities>=0&&wealth.propertyGross>=wealth.propertyEquity,'86 post-estate accounting reconciles through the authoritative Finance breakdown without treating debt as wealth');
  const uniqueCompletedIds=new Set(dynasty.completedLives.map(life=>life.id));verify(uniqueCompletedIds.size===dynasty.completedLives.length,'87 completed-life IDs remain unique across multi-generation closeout');
  verify(validateState(dynasty).length===0,'88 two-generation continuation with inherited place context remains invariant-clean');
  const dynastyLoaded=importSave(exportSave(dynasty));verify(validateState(dynastyLoaded).length===0&&projectionSnapshot(dynastyLoaded).profile.generation===3,'89 a generation-three integrated state survives save/import without biography reconstruction');
  verify(JSON.stringify(projectionSnapshot(dynastyLoaded))===JSON.stringify(projectionSnapshot(dynasty)),'90 save/import preserves the complete generation-three Living Everthread projection contract');

  const finalStates=[integrated,hidden,stress,loaded,normalized,rewind,trip,dynasty,dynastyLoaded];
  const finalStateErrors=finalStates.map((value,index)=>({index,errors:validateState(value)})).filter(item=>item.errors.length>0);
  verify(finalStateErrors.length===0,`91 all representative home/work/map/threadspace/profile/save/rewind/travel/dynasty states are invariant-clean at program closeout: ${JSON.stringify(finalStateErrors)}`);

  return checks;
}
