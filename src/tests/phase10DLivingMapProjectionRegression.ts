import { enforceStateInvariants, validateState } from '../core/invariants';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import {
  LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT,
  LIVING_MAP_TOTAL_CONTEXT_LIMIT,
  livingMapDistrictContext,
  livingMapPlaceContext,
  livingMapProjection,
} from '../systems/LivingMapSystem';
import { buildTownMapProjection, townMapSemanticView } from '../systems/TownMapSystem';
import type { Business, GameState, Npc, PropertyAsset, SocialWorld, TimelineEntry } from '../types/game';

function clone<T>(value:T):T{return structuredClone(value);}
function state(seed:string){const value=createNewGame({seed,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY});value.character.age=35;value.currentYear=2075;value.settings.autoSave=false;value.finances.cash=5_000_000;return value;}
function property(overrides:Partial<PropertyAsset>={}):PropertyAsset{return{id:'10d-home',typeId:'starter_house_standard',name:'Threadwell Home',location:EVERTHREAD_CITY,purchasePrice:250_000,marketValue:300_000,condition:90,age:6,amenities:['yard'],origin:'purchased',...overrides};}
function business(overrides:Partial<Business>={}):Business{return{id:'10d-business',industryId:'software',name:'Threadlight Labs',foundedAge:30,origin:'founded',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,capital:200_000,revenue:100_000,expenses:60_000,profit:40_000,employees:7,demand:65,reputation:70,valuation:500_000,productIds:['software_product_1'],priceIndex:1,marketingBudget:8_000,compensationIndex:1,bankrupt:false,...overrides};}
function schoolWorld(id:string,stage:string):SocialWorld{return{id,kind:'school',name:stage==='university'?'Everthread College World':'Everthread School World',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,startedAge:20,active:true,members:[],groups:[],school:{stage,educationKey:`edu:${id}`,attendance:90,conduct:90,socialStanding:60,honors:0,disciplinaryActions:0}};}
function workWorld(id:string,industry:string,kind:'full_time'|'part_time'='full_time'):SocialWorld{return{id,kind:'workplace',name:`${industry} Works`,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,startedAge:25,active:true,members:[],groups:[],workplace:{employmentKey:`${kind}|25|${industry} Works`,employmentKind:kind,industry,department:'Operations',morale:60,culture:60,tension:20,reputation:55,layoffs:0,disputes:0}};}
function addChild(value:GameState,id:string,age:number,stage:string){const npc:Npc={id,firstName:'Avery',lastName:value.character.lastName,age,alive:true,health:90,happiness:80,wealth:5_000,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['responsible'],hiddenOpinion:80,memories:[],parentIds:[value.character.id],childIds:[],simulationTier:'full'};value.npcs[id]=npc;value.relationships.push({id:`rel-${id}`,npcId:id,type:'child',score:90,attraction:0,compatibility:80,yearsKnown:age});ensureNpcLife(value,npc);npc.life!.education.records=[{stage,institution:stage==='university'?'Everthread Institute':'Everthread School',startAge:Math.max(3,age-2),graduated:false,performance:75}];return npc;}
function milestone(id:string,placeId:string):TimelineEntry{return{id,year:2075,age:35,category:'relationship',placeId,text:`Remembered ${id}`,importance:3};}
function kinds(value:ReturnType<typeof livingMapPlaceContext>){return value?.contexts.map(item=>item.kind)??[];}

export function runPhase10DLivingMapProjectionRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 10D Living Map Projection regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===17,'01 Living Map Projection must remain save-schema neutral at version 17');
  const fresh=state('10d-fresh');verify(!('livingMap' in (fresh as unknown as Record<string,unknown>))&&!('mapContexts' in (fresh as unknown as Record<string,unknown>))&&!('mapPins' in (fresh as unknown as Record<string,unknown>)),'02 GameState must not gain a persisted map-context or pin ledger');
  verify(LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT===6&&LIVING_MAP_TOTAL_CONTEXT_LIMIT===32,'03 living-map context must have explicit century-safe bounds');

  const before=JSON.stringify(fresh),rng=fresh.rngCounter,ids=fresh.idCounter,revision=fresh.actionLedger.revision;const freshA=livingMapProjection(fresh),freshB=livingMapProjection(fresh);
  verify(JSON.stringify(freshA)===JSON.stringify(freshB),'04 identical state must produce byte-identical living-map projections');
  verify(JSON.stringify(fresh)===before&&fresh.rngCounter===rng&&fresh.idCounter===ids&&fresh.actionLedger.revision===revision,'05 living-map browsing must not mutate state, consume gameplay RNG/runtime IDs, or use the action ledger');
  const freshHome=livingMapPlaceContext(freshA,'threadwell-residential');verify(freshHome?.contexts[0]?.kind==='home'&&freshHome.contexts[0]?.label==='You live here','06 a local player residence must project onto the certified Threadwell home anchor');
  verify(freshA.connectedPlaceCount===1&&freshA.connectedDistrictCount===0,'07 a fresh adult life must not fabricate work, company, school, child, or legacy map context');

  const owned=state('10d-owned');owned.assets.properties.push(property({id:'owned-primary',primaryResidence:true}),property({id:'owned-rental',name:'Threadwell Rental',rental:{annualRent:18_000,reliability:70,occupied:true}}));const ownedProjection=livingMapProjection(owned);const ownedHome=livingMapPlaceContext(ownedProjection,'threadwell-residential');
  verify(kinds(ownedHome).includes('home')&&kinds(ownedHome).includes('property'),'08 home and property ownership remain distinct meanings even when they share the residential district marker');
  verify(ownedHome?.contexts.find(item=>item.kind==='property')?.count===2,'09 multiple owned properties aggregate into one bounded property context instead of multiple pins');
  verify(ownedHome?.contexts[0]?.kind==='home','10 the current residence has higher display priority than general property ownership');

  const school=state('10d-school');school.socialWorlds.push(schoolWorld('current-school','secondary'));const schoolProjection=livingMapProjection(school);verify(livingMapPlaceContext(schoolProjection,'everthread-school')?.contexts.some(item=>item.kind==='school'&&item.label==='Current school')===true,'11 current compulsory school projects to the existing school marker');
  school.socialWorlds=[schoolWorld('current-college','university')];const collegeProjection=livingMapProjection(school);verify(livingMapPlaceContext(collegeProjection,'everthread-college')?.contexts.some(item=>item.kind==='school')===true,'12 current post-secondary study projects to the existing college marker');
  verify(!livingMapPlaceContext(collegeProjection,'everthread-school')?.contexts.some(item=>item.kind==='school'),'13 changing current institution does not leave a stale school-map context behind');

  const exactWork=state('10d-exact-work');exactWork.socialWorlds.push(workWorld('finance-work','Finance'));const exactWorkProjection=livingMapProjection(exactWork);verify(livingMapPlaceContext(exactWorkProjection,'central-everthread-bank')?.contexts.some(item=>item.kind==='work'&&item.label==='You work here')===true,'14 exact 10B workplace anchors decorate the real existing place marker');
  verify(exactWorkProjection.districts.length===0,'15 an exact workplace anchor must not duplicate itself as a district badge');
  const districtWork=state('10d-district-work');districtWork.socialWorlds.push(workWorld('food-work','Food Service'));const districtWorkProjection=livingMapProjection(districtWork);verify(livingMapDistrictContext(districtWorkProjection,'market-row')?.contexts.some(item=>item.kind==='work')===true,'16 district-only 10B work meaning stays district-level instead of inventing a specific workplace pin');
  verify(!districtWorkProjection.places.some(item=>item.contexts.some(context=>context.sourceIds.includes('food-work'))),'17 district-only work must not be falsely attached to an arbitrary Market Row place');
  districtWork.socialWorlds.push(workWorld('food-part','Coffee & Bakery','part_time'));const multiDistrictWork=livingMapProjection(districtWork);verify(livingMapDistrictContext(multiDistrictWork,'market-row')?.contexts.find(item=>item.kind==='work')?.count===2,'18 multiple workplaces in the same district aggregate into one context');

  const exactBusiness=state('10d-exact-business');exactBusiness.businesses.push(business());const exactBusinessProjection=livingMapProjection(exactBusiness);verify(livingMapPlaceContext(exactBusinessProjection,'loomworks-business-district')?.contexts.some(item=>item.kind==='business'&&item.label==='Your company')===true,'19 an anchored active company decorates its 10B place anchor');
  const districtBusiness=state('10d-district-business');districtBusiness.businesses.push(business({id:'restaurant-company',industryId:'restaurant'}));const districtBusinessProjection=livingMapProjection(districtBusiness);verify(livingMapDistrictContext(districtBusinessProjection,'market-row')?.contexts.some(item=>item.kind==='business')===true,'20 a company known only to Market Row stays district-level');
  verify(!districtBusinessProjection.places.some(item=>item.contexts.some(context=>context.sourceIds.includes('restaurant-company'))),'21 district-only company projection must not pretend the business is Crossroads Mall or Nightjar Diner');
  districtBusiness.businesses[0]!.bankrupt=true;verify(!livingMapProjection(districtBusiness).districts.some(item=>item.contexts.some(context=>context.kind==='business')),'22 bankrupt companies retain 10B provenance but stop projecting as current Your company context');

  const children=state('10d-children');const schoolChild=addChild(children,'school-child',14,'secondary');const collegeChild=addChild(children,'college-child',20,'university');const childProjection=livingMapProjection(children);
  verify(livingMapPlaceContext(childProjection,'everthread-school')?.contexts.some(item=>item.kind==='child_school'&&item.sourceIds.includes(schoolChild.id))===true,'23 a current child school record can project Your child attends here without a child pin');
  verify(livingMapPlaceContext(childProjection,'everthread-college')?.contexts.some(item=>item.kind==='child_school'&&item.sourceIds.includes(collegeChild.id))===true,'24 a post-secondary child maps to the existing college place');
  children.relationships.find(item=>item.npcId===schoolChild.id)!.estranged=true;verify(!livingMapPlaceContext(livingMapProjection(children),'everthread-school')?.contexts.some(item=>item.kind==='child_school'),'25 estranged child location is not surfaced as a current social-map context');
  collegeChild.countryId='us';collegeChild.city='Chicago';verify(!livingMapPlaceContext(livingMapProjection(children),'everthread-college')?.contexts.some(item=>item.kind==='child_school'),'26 a child studying outside Everthread must not be pulled onto the hometown map');

  const legacy=state('10d-legacy');legacy.timeline.push(milestone('park-memory','weaver-park'));const legacyProjection=livingMapProjection(legacy);const parkLegacy=livingMapPlaceContext(legacyProjection,'weaver-park');verify(parkLegacy?.contexts.some(item=>item.kind==='legacy'&&item.label==='Life memory')===true,'27 current meaningful 10C timeline memory decorates the exact remembered place');
  legacy.assets.properties.push(property({id:'family-home',origin:'inherited',inheritedFromNpcId:'ancestor',primaryResidence:true}));const familyProjection=livingMapProjection(legacy);verify(livingMapPlaceContext(familyProjection,'threadwell-residential')?.contexts.some(item=>item.kind==='legacy'&&item.label==='Family legacy')===true,'28 inherited home provenance becomes Family legacy through the certified 10C projection');
  legacy.businesses.push(business({id:'family-company',origin:'inherited',inheritedFromNpcId:'ancestor'}));const familyBusinessProjection=livingMapProjection(legacy);verify(livingMapPlaceContext(familyBusinessProjection,'loomworks-business-district')?.contexts.some(item=>item.kind==='legacy'&&item.label==='Family legacy')===true,'29 surviving inherited company provenance becomes Family legacy at its existing work anchor');
  verify(livingMapPlaceContext(familyBusinessProjection,'loomworks-business-district')?.contexts.some(item=>item.kind==='business')===true,'30 an inherited active company can simultaneously be Your company and a family legacy without a duplicate business authority');

  const hidden=state('10d-hidden');hidden.timeline.push(milestone('underworld-memory','blackline-freight-yard'));verify(livingMapPlaceContext(livingMapProjection(hidden),'blackline-freight-yard')?.contexts.some(item=>item.kind==='legacy')===true,'31 raw living-map composition can understand canonical underworld history through 10C truth');const hiddenTown=buildTownMapProjection(hidden);verify(!hiddenTown.places.some(place=>place.id==='blackline-freight-yard')&&!hiddenTown.living.places.some(item=>item.placeId==='blackline-freight-yard'),'32 TownMapSystem must preserve discovery and not leak hidden-place living context before discovery');
  hidden.legal.investigationHeat=35;const discoveredTown=buildTownMapProjection(hidden);verify(discoveredTown.places.some(place=>place.id==='blackline-freight-yard')&&discoveredTown.living.places.some(item=>item.placeId==='blackline-freight-yard'),'33 once existing discovery truth reveals Blackline, its legacy context may appear normally');

  const searchable=buildTownMapProjection(owned,{query:'you live here'});verify(searchable.places.length===1&&searchable.places[0]?.id==='threadwell-residential','34 map search may find a place through derived living context without persisting search state');
  const companySearch=buildTownMapProjection(exactBusiness,{query:'your company'});verify(companySearch.places.some(item=>item.id==='loomworks-business-district'),'35 company context participates in ordinary map search');
  const districtOnlySearch=buildTownMapProjection(districtBusiness,{query:'your company'});verify(districtOnlySearch.places.length===0,'36 district-only context must not make an arbitrary place match a query');

  const semantic=townMapSemanticView(familyBusinessProjection?legacy:legacy);const semanticThreadwell=semantic.places.find(place=>place.id==='threadwell-residential');verify(Array.isArray(semanticThreadwell?.contexts)&&semanticThreadwell!.contexts.some(item=>item.kind==='home'),'37 semantic map view exposes the same place contexts used by visual projection');
  verify(semantic.living.connectedPlaceCount>=2&&semantic.living.totalContexts>=3,'38 semantic map summary exposes bounded living context without requiring UI inspection');
  verify(semantic.living.districts.every(item=>item.contexts.every(context=>Array.isArray(context.sourceIds))),'39 semantic district projection preserves traceable source IDs rather than flattening provenance');

  const abroad=state('10d-abroad');abroad.assets.properties.push(property({id:'everthread-property'}));abroad.character.countryId='jp';abroad.character.city='Tokyo';const abroadProjection=livingMapProjection(abroad);const abroadThreadwell=livingMapPlaceContext(abroadProjection,'threadwell-residential');verify(!abroadThreadwell?.contexts.some(item=>item.kind==='home'),'40 emigration removes You live here from the hometown map because residence authority is external');
  verify(abroadThreadwell?.contexts.some(item=>item.kind==='property')===true,'41 a retained Everthread property remains visibly owned after emigration without teleporting the player home');
  verify(buildTownMapProjection(abroad).playerLocationLabel==='Tokyo, Japan','42 living context must not rewrite the certified character location authority');

  const externalWork=state('10d-external-work');externalWork.socialWorlds.push({...workWorld('away-work','Finance'),countryId:'us',city:'Austin'});verify(!livingMapProjection(externalWork).places.some(item=>item.contexts.some(context=>context.sourceIds.includes('away-work')))&&!livingMapProjection(externalWork).districts.some(item=>item.contexts.some(context=>context.sourceIds.includes('away-work'))),'43 external work remains external and does not get a hometown badge');
  const externalCompany=state('10d-external-company');externalCompany.businesses.push(business({id:'away-company',countryId:'us',city:'Boston'}));verify(!livingMapProjection(externalCompany).places.some(item=>item.contexts.some(context=>context.sourceIds.includes('away-company')))&&!livingMapProjection(externalCompany).districts.some(item=>item.contexts.some(context=>context.sourceIds.includes('away-company'))),'44 external company provenance remains off the Everthread map');

  const bounded=state('10d-bounded');bounded.assets.properties.push(...Array.from({length:20},(_,index)=>property({id:`property-${index}`,name:`Property ${index}`})));bounded.businesses.push(...Array.from({length:20},(_,index)=>business({id:`business-${index}`,industryId:index%2?'restaurant':'software'})));bounded.socialWorlds.push(...Array.from({length:8},(_,index)=>workWorld(`work-${index}`,index%2?'Food Service':'Finance',index%3?'part_time':'full_time')));for(let index=0;index<20;index++)bounded.timeline.push(milestone(`memory-${index}`,index%2?'weaver-park':'crossroads-mall'));
  const boundedProjection=livingMapProjection(bounded);verify(boundedProjection.totalContexts<=LIVING_MAP_TOTAL_CONTEXT_LIMIT,'45 living-map projection remains globally bounded under many assets/workplaces/memories');
  verify([...boundedProjection.places,...boundedProjection.districts].every(item=>item.contexts.length<=LIVING_MAP_CONTEXTS_PER_TARGET_LIMIT),'46 no single map target can accumulate unbounded context cards');
  verify(livingMapPlaceContext(boundedProjection,'threadwell-residential')?.contexts.find(item=>item.kind==='property')?.count===20,'47 high property counts aggregate into one context rather than one marker per asset');
  verify(livingMapDistrictContext(boundedProjection,'market-row')?.contexts.some(item=>item.count>=1)===true,'48 high district-only activity stays aggregated rather than mounting background entities');

  const deterministicA=clone(bounded),deterministicB=clone(bounded);verify(JSON.stringify(livingMapProjection(deterministicA))===JSON.stringify(livingMapProjection(deterministicB))&&JSON.stringify(deterministicA)===JSON.stringify(deterministicB),'49 large living-map projections remain deterministic and read-only');
  enforceStateInvariants(owned);enforceStateInvariants(school);enforceStateInvariants(exactWork);enforceStateInvariants(exactBusiness);enforceStateInvariants(legacy);const issues=[...validateState(owned),...validateState(school),...validateState(exactWork),...validateState(exactBusiness),...validateState(legacy)];verify(issues.length===0,`50 representative 10D states remain invariant-clean because living-map context is projection-only (${issues.join(' | ')})`);

  return checks;
}
