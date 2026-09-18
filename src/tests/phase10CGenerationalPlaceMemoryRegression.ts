import { enforceStateInvariants, validateState } from '../core/invariants';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { exportSave, importSave } from '../services/SaveSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { startBusiness } from '../systems/BusinessSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { checkDeath } from '../systems/DeathSystem';
import { dropOut } from '../systems/EducationSystem';
import { releaseMatureInheritanceTrust } from '../systems/EstateSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import {
  COMPLETED_LIFE_PLACE_MILESTONE_LIMIT,
  PLACE_LEGACY_PER_PLACE_LIMIT,
  PLACE_LEGACY_PLACE_LIMIT,
  PLACE_LEGACY_TOTAL_LIMIT,
  completedLifePlaceMilestones,
  generationalPlaceMemoryProjection,
  timelinePlaceMilestones,
} from '../systems/GenerationalPlaceMemorySystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { npcBusinessFromPlayerBusiness, playerBusinessFromNpcHolding } from '../systems/NpcAssetSystem';
import { buyProperty } from '../systems/PropertySystem';
import { shareExperienceWithNpc } from '../systems/RelationshipSystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import { resign } from '../systems/CareerSystem';
import type { Business, CompletedLife, GameState, Npc, PropertyAsset, Relationship, SocialWorld, TimelineEntry } from '../types/game';

function clone<T>(value:T):T{return structuredClone(value);}
function state(seed:string){const value=createNewGame({seed,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY});value.character.age=30;value.currentYear=2070;value.settings.autoSave=false;value.finances.cash=5_000_000;return value;}
function business(overrides:Partial<Business>={}):Business{return{id:'phase10c-business',industryId:'software',name:'Threadline Labs',foundedAge:25,origin:'founded',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,capital:300_000,revenue:160_000,expenses:90_000,profit:70_000,employees:8,demand:65,reputation:72,valuation:750_000,productIds:['software_product_1'],priceIndex:1,marketingBudget:8_000,compensationIndex:1,bankrupt:false,...overrides};}
function property(overrides:Partial<PropertyAsset>={}):PropertyAsset{return{id:'phase10c-home',typeId:'starter_house_standard',name:'Threadwell House',location:EVERTHREAD_CITY,purchasePrice:300_000,marketValue:360_000,condition:92,age:6,amenities:[],origin:'inherited',inheritedFromNpcId:'previous-thread',...overrides};}
function addFriend(value:GameState,id='phase10c-friend'){const npc:Npc={id,firstName:'Riley',lastName:'Thread',age:value.character.age,alive:true,health:85,happiness:85,wealth:20_000,countryId:value.character.countryId,city:value.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['calm'],hiddenOpinion:80,memories:[],parentIds:[],childIds:[],simulationTier:'full',preferences:{version:1,likes:['nature','outdoors','relaxing'],dislikes:[],aversions:[]}};const rel:Relationship={id:`rel-${id}`,npcId:id,type:'friend',score:90,attraction:0,compatibility:95,yearsKnown:15};value.npcs[id]=npc;value.relationships.push(rel);ensureNpcLife(value,npc);return{npc,rel};}
function addChild(value:GameState,id='phase10c-child',age=28){const npc:Npc={id,firstName:'Avery',lastName:value.character.lastName,age,alive:true,health:90,happiness:75,wealth:40_000,countryId:value.character.countryId,city:value.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['responsible'],hiddenOpinion:80,memories:[],parentIds:[value.character.id],childIds:[],simulationTier:'full'};value.npcs[id]=npc;value.relationships.push({id:`rel-${id}`,npcId:id,type:'child',score:85,attraction:0,compatibility:75,yearsKnown:age});ensureNpcLife(value,npc);return npc;}
function workplaceWorld():SocialWorld{return{id:'phase10c-work',kind:'workplace',name:'Central Finance Group',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,startedAge:25,active:true,members:[],groups:[],workplace:{employmentKey:'full_time|25|Central Finance Group',employmentKind:'full_time',industry:'Finance',department:'Operations',morale:65,culture:60,tension:20,reputation:60,layoffs:0,disputes:0}};}
function schoolWorld():SocialWorld{return{id:'phase10c-school',kind:'school',name:'Everthread College World',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,startedAge:29,active:true,members:[],groups:[],school:{stage:'university',educationKey:'phase10c-university',attendance:90,conduct:90,socialStanding:60,honors:0,disciplinaryActions:0}};}
function milestone(id:string,placeId:string,importance:1|2|3=3,age=30):TimelineEntry{return{id,year:2040+age,age,category:'random',placeId,text:`Milestone ${id}`,importance};}

export function runPhase10CGenerationalPlaceMemoryRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 10C Generational Place Memory regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===18,'01 Generational Place Memory must remain compatible with save schema 18');
  const fresh=state('10c-fresh');verify(!('placeMemory' in (fresh as unknown as Record<string,unknown>))&&!('placeHistory' in (fresh as unknown as Record<string,unknown>))&&!('locationLedger' in (fresh as unknown as Record<string,unknown>)),'02 GameState must not gain a parallel place-history/location ledger');
  verify(COMPLETED_LIFE_PLACE_MILESTONE_LIMIT===12&&PLACE_LEGACY_PER_PLACE_LIMIT===6&&PLACE_LEGACY_PLACE_LIMIT===8&&PLACE_LEGACY_TOTAL_LIMIT===24,'03 all place-legacy histories must be explicitly bounded');

  const filterEntries:TimelineEntry[]=[milestone('routine','weaver-park',1),milestone('meaningful','weaver-park',2),milestone('major','nightjar-diner',3),milestone('invalid','not-a-place',3)];
  const filtered=timelinePlaceMilestones(filterEntries);verify(filtered.length===2&&filtered[0]!.id==='meaningful'&&filtered[1]!.id==='major','04 only meaningful canonical place-tagged timeline milestones may enter place legacy');
  const many=Array.from({length:20},(_,index)=>milestone(`bounded-${index}`,'weaver-park',3,index));verify(timelinePlaceMilestones(many).length===12&&timelinePlaceMilestones(many)[0]!.id==='bounded-8','05 completed-life milestone snapshots retain only the latest bounded twelve meaningful entries');

  const readOnly=state('10c-readonly');readOnly.timeline.push(milestone('read-only','weaver-park',3));readOnly.assets.properties.push(property());readOnly.businesses.push(business({id:'inherited-readonly',origin:'inherited',inheritedFromNpcId:'ancestor'}));const before=JSON.stringify(readOnly),rng=readOnly.rngCounter,ids=readOnly.idCounter,revision=readOnly.actionLedger.revision;const projectedA=generationalPlaceMemoryProjection(readOnly),projectedB=generationalPlaceMemoryProjection(readOnly);
  verify(JSON.stringify(projectedA)===JSON.stringify(projectedB),'06 identical state must produce byte-identical generational place projections');
  verify(JSON.stringify(readOnly)===before&&readOnly.rngCounter===rng&&readOnly.idCounter===ids&&readOnly.actionLedger.revision===revision,'07 place-memory projection must be strictly read-only and consume no RNG/runtime IDs/actions');
  verify(projectedA.familyLandmarks===2&&projectedA.places.some(place=>place.placeId==='threadwell-residential'&&place.familyHomes===1)&&projectedA.places.some(place=>place.placeId==='loomworks-business-district'&&place.familyBusinesses===1),'08 inherited homes and surviving inherited businesses must project as family landmarks through their existing asset authorities');

  const unknown=state('10c-legacy-unknown');unknown.businesses.push(business({id:'legacy-unknown',origin:undefined,inheritedFromNpcId:undefined}));enforceStateInvariants(unknown);verify(unknown.businesses[0]!.origin===undefined&&generationalPlaceMemoryProjection(unknown).familyLandmarks===0,'09 legacy businesses with unknown provenance must not be fabricated into family businesses');
  const closed=state('10c-closed-business');closed.businesses.push(business({id:'closed-family',origin:'inherited',inheritedFromNpcId:'ancestor',bankrupt:true}));verify(generationalPlaceMemoryProjection(closed).familyLandmarks===0,'10 a closed inherited company remains historical ownership but is not a surviving family-business landmark');

  const shared=state('10c-shared');const friend=addFriend(shared);const sharedResult=shareExperienceWithNpc(shared,friend.npc.id,'weaver-park','park_walk');verify(sharedResult.success&&shared.timeline.at(-1)?.placeId==='weaver-park','11 committed shared experiences must tag their exact canonical place on the existing relationship timeline');
  verify(shared.timeline.at(-1)?.importance===2&&generationalPlaceMemoryProjection(shared).places.some(place=>place.placeId==='weaver-park'),'12 a meaningful shared experience becomes place legacy through timeline importance rather than a second outing ledger');
  const routine=state('10c-routine');routine.timeline.push(milestone('routine-only','weaver-park',1));verify(generationalPlaceMemoryProjection(routine).totalMemories===0,'13 routine importance-one visits must stay out of generational place memory');

  const propertyState=state('10c-property');verify(buyProperty(propertyState,'starter_house_standard',false).success,'14 ordinary PropertySystem purchase remains authoritative and succeeds');verify(propertyState.timeline.at(-1)?.placeId==='threadwell-residential','15 a meaningful Everthread property purchase tags Threadwell Residential on the existing asset timeline');
  propertyState.character.city='Chicago';propertyState.character.countryId='us';const countBeforeRemote=propertyState.timeline.length;verify(buyProperty(propertyState,'starter_house_standard',false).success,'16 PropertySystem still permits a valid remote-city property purchase');verify(propertyState.timeline.length===countBeforeRemote+1&&propertyState.timeline.at(-1)?.placeId===undefined,'17 remote property milestones must not be falsely attached to an Everthread place');

  const founded=state('10c-founded');verify(startBusiness(founded,'software','Blue Loom Labs').success,'18 ordinary BusinessSystem founding remains authoritative and succeeds');const foundedBusiness=founded.businesses[0]!;verify(foundedBusiness.origin==='founded'&&foundedBusiness.inheritedFromNpcId===undefined,'19 newly founded companies own explicit non-family provenance on the existing Business record');
  verify(founded.timeline.at(-1)?.placeId==='loomworks-business-district','20 a locally founded company records its established Working Everthread anchor as the founding milestone location');
  founded.character.countryId='us';founded.character.city='Seattle';verify(generationalPlaceMemoryProjection(founded).places.some(place=>place.placeId==='loomworks-business-district'&&place.currentLifeMilestones===1),'21 relocating later must not erase where a meaningful company milestone happened');

  const npcOwner=Object.values(state('10c-conversion').npcs)[0]!;const conversionState=state('10c-conversion-source');const inheritedSource=business({id:'conversion-business',origin:'inherited',inheritedFromNpcId:'earlier-owner',countryId:'us',city:'Chicago'});const holding=npcBusinessFromPlayerBusiness(conversionState,npcOwner,inheritedSource,'current-owner');const converted=playerBusinessFromNpcHolding(conversionState,holding);
  verify(holding.origin==='inherited'&&holding.inheritedFromNpcId==='current-owner'&&holding.city==='Chicago','22 player-to-NPC estate conversion preserves exact company base and inheritance provenance');
  verify(converted.origin==='inherited'&&converted.inheritedFromNpcId==='current-owner'&&converted.city==='Chicago','23 NPC-to-player conversion preserves known inherited provenance instead of rebasing or erasing it');
  const purchasedHolding={...holding,id:'purchased-holding',origin:'purchased' as const,inheritedFromNpcId:undefined};const purchasedConverted=playerBusinessFromNpcHolding(conversionState,purchasedHolding);verify(purchasedConverted.origin===undefined&&!purchasedConverted.inheritedFromNpcId,'24 a successor own purchased NPC company is not falsely rewritten as founded or inherited');

  const trust=state('10c-trust');trust.character.age=18;trust.inheritance.trust={releaseAge:18,createdAge:16,cash:0,properties:[property({id:'trust-home'})],businesses:[business({id:'trust-business',origin:'inherited',inheritedFromNpcId:'late-parent'})],collectibles:[],investments:[],liabilities:[],inheritanceValue:1_000_000};verify(releaseMatureInheritanceTrust(trust),'25 a mature protected inheritance still releases through EstateSystem');
  verify(trust.timeline.some(entry=>entry.placeId==='threadwell-residential'&&entry.text.includes('family home'))&&trust.timeline.some(entry=>entry.placeId==='loomworks-business-district'&&entry.text.includes('family business')),'26 trust release records exact family-home and family-business place milestones when ownership truly becomes playable');

  const career=state('10c-career');career.employment.current={jobId:'accounting_1',title:'Junior Accountant',company:'Central Finance Group',startAge:25,salary:55_000,performance:60,level:1};career.socialWorlds.push(workplaceWorld());verify(resign(career).success&&career.timeline.at(-1)?.placeId==='central-everthread-bank','27 a meaningful career exit uses the exact current workplace anchor already owned by Workplace/Working Everthread');
  const education=state('10c-education');education.character.age=30;education.education.push({stage:'university',institution:'Everthread College',startAge:29,graduated:false,droppedOut:false,scholarship:false,performance:70});education.socialWorlds.push(schoolWorld());verify(dropOut(education).success&&education.timeline.at(-1)?.placeId==='everthread-college','28 a meaningful education exit uses the current institution anchor without a second school-location authority');

  const death=state('10c-death');death.timeline.push(milestone('death-park','weaver-park',3),milestone('death-diner','nightjar-diner',2));verify(checkDeath(death,true),'29 forced death still completes through DeathSystem');const archived=death.completedLives.at(-1)!;verify(archived.placeMilestones?.length===2&&archived.placeMilestones[0]!.placeId==='weaver-park','30 death snapshots a bounded place-milestone index derived from the authoritative timeline');
  verify(archived.timeline.some(entry=>entry.id==='death-park')&&archived.timeline.some(entry=>entry.id==='death-diner'),'31 CompletedLife still preserves the full authoritative life timeline; the place snapshot is only an index/projection aid');
  const legacyLife=clone(archived);delete legacyLife.placeMilestones;verify(completedLifePlaceMilestones(legacyLife).length===2,'32 old schema-17 completed lives without the optional snapshot derive place memory from their existing timeline without migration RNG');

  const saved=state('10c-save');saved.businesses.push(business({id:'saved-family',origin:'inherited',inheritedFromNpcId:'saved-parent'}));saved.timeline.push(milestone('saved-place','nightjar-diner',3));checkDeath(saved,true);const loaded=importSave(exportSave(saved));verify(loaded.saveVersion===18&&loaded.businesses[0]?.origin==='inherited'&&loaded.businesses[0]?.inheritedFromNpcId==='saved-parent','33 schema-17 save/load preserves optional business family provenance');
  verify(loaded.completedLives.at(-1)?.placeMilestones?.some(item=>item.placeId==='nightjar-diner')===true,'34 schema-17 save/load preserves the bounded completed-life place index');
  verify(exportSave(importSave(exportSave(loaded)))===exportSave(loaded),'35 once normalized, repeated schema-17 save/load cycles remain idempotent with 10C optional metadata');

  const invalid=state('10c-invalid');invalid.timeline.push(milestone('bad-place','fake-place',3));invalid.completedLives.push({...archived,id:'legacy-invalid',placeMilestones:[{id:'bad',placeId:'fake-place',year:2000,age:20,category:'random',text:'bad',importance:3}]});verify(generationalPlaceMemoryProjection(invalid).totalMemories===0,'36 malformed/unknown place references are ignored by the read-only legacy projection instead of fabricating locations');
  invalid.timeline.at(-1)!.placeId=undefined;invalid.completedLives.at(-1)!.placeMilestones=[];verify(validateState(enforceStateInvariants(invalid)).length===0,'37 valid place-aware state remains canonical-invariant clean without history scans in the invariant hot path');

  const rewind=state('10c-rewind');rewind.flags.rewindEnabled=true;rewind.timeline.push(milestone('before-rewind','weaver-park',3,30));captureRewindSnapshot(rewind);rewind.character.age=31;rewind.currentYear+=1;rewind.timeline.push(milestone('after-rewind','nightjar-diner',3,31));verify(rewindToAge(rewind,30).success,'38 rewind still restores a place-aware schema-17 snapshot through existing Rewind authority');verify(rewind.timeline.some(entry=>entry.id==='before-rewind')&&!rewind.timeline.some(entry=>entry.id==='after-rewind'),'39 rewind atomically restores place milestones with the rest of authoritative timeline state');

  const dynasty=state('10c-dynasty');dynasty.character.age=65;dynasty.currentYear=2105;const oldPlayerId=dynasty.character.id;const heir=addChild(dynasty,'legacy-heir',30);dynasty.businesses.push(business({id:'dynasty-company',name:'Threadline Family Works',valuation:900_000}));dynasty.assets.properties.push(property({id:'dynasty-home',origin:'purchased',inheritedFromNpcId:undefined}));dynasty.character.alive=false;verify(continueAsChild(dynasty,heir.id).success,'40 descendant continuation remains functional with 10C provenance enabled');const inheritedCompany=dynasty.businesses.find(item=>item.id==='dynasty-company');const inheritedHome=dynasty.assets.properties.find(item=>item.id==='dynasty-home');
  verify(inheritedCompany?.origin==='inherited'&&inheritedCompany.inheritedFromNpcId===oldPlayerId,'41 estate continuation marks an inherited company with the exact immediate predecessor instead of a shadow family-business record');
  verify(inheritedHome?.origin==='inherited'&&inheritedHome.inheritedFromNpcId===oldPlayerId,'42 existing certified residential provenance remains the family-home authority');
  const dynastyLegacy=generationalPlaceMemoryProjection(dynasty);verify(dynastyLegacy.places.some(place=>place.familyBusinesses>0)&&dynastyLegacy.places.some(place=>place.familyHomes>0),'43 successor place legacy composes inherited business and home truth from their existing owners');
  verify(dynasty.timeline.some(entry=>entry.placeId==='loomworks-business-district'&&entry.text.includes('surviving family business'))&&dynasty.timeline.some(entry=>entry.placeId==='threadwell-residential'&&entry.text.includes('family home')),'44 immediate adult inheritance writes visible place-aware milestones for the new protagonist chapter');

  const bounded=state('10c-bounds');bounded.assets.properties.push(...Array.from({length:8},(_,index)=>property({id:`family-home-${index}`,name:`Family Home ${index}`})));bounded.businesses.push(...Array.from({length:8},(_,index)=>business({id:`family-business-${index}`,name:`Family Business ${index}`,origin:'inherited',inheritedFromNpcId:'ancestor'})));bounded.timeline.push(...Array.from({length:30},(_,index)=>milestone(`current-${index}`,index%2?'weaver-park':'nightjar-diner',3,index)));
  for(let lifeIndex=0;lifeIndex<12;lifeIndex++){const timeline=Array.from({length:12},(_,index)=>milestone(`life-${lifeIndex}-${index}`,index%3===0?'crossroads-mall':index%3===1?'everthread-school':'everthread-college',3,index));const life:CompletedLife={id:`life-${lifeIndex}`,generation:lifeIndex+1,character:clone(bounded.character),ageAtDeath:80,cause:'test',netWorth:0,children:0,fame:0,milestones:[],epitaph:'test',timeline};bounded.completedLives.push(life);}
  const boundedProjection=generationalPlaceMemoryProjection(bounded);verify(boundedProjection.totalMemories<=PLACE_LEGACY_TOTAL_LIMIT&&boundedProjection.places.length<=PLACE_LEGACY_PLACE_LIMIT,'45 generational place projection remains globally bounded across many lives/assets');
  verify(boundedProjection.places.every(place=>place.memories.length<=PLACE_LEGACY_PER_PLACE_LIMIT),'46 no single place can monopolize the bounded legacy projection');
  verify(boundedProjection.places[0]?.familyHomes>0,'47 surviving family landmarks receive priority over historical milestones when the global projection cap is under pressure');

  const completedOnly=state('10c-completed-only');completedOnly.completedLives.push({id:'prior-life',generation:1,character:clone(completedOnly.character),ageAtDeath:80,cause:'test',netWorth:0,children:0,fame:0,milestones:[],epitaph:'test',timeline:[milestone('prior-park','weaver-park',3,50)]});completedOnly.legacy.generation=2;const priorProjection=generationalPlaceMemoryProjection(completedOnly);verify(priorProjection.places[0]?.priorGenerationMilestones===1&&priorProjection.places[0]?.memories[0]?.generation===1,'48 completed-life timeline truth can project a prior-generation place memory without fabricating current ownership');

  const finalStates=[shared,propertyState,founded,trust,career,education,loaded,rewind,dynasty,bounded,completedOnly];verify(finalStates.every(value=>validateState(enforceStateInvariants(value)).length===0),'49 representative 10C relationship/property/business/trust/work/school/save/rewind/dynasty states remain invariant-clean');
  const deterministicA=clone(bounded),deterministicB=clone(bounded);verify(JSON.stringify(generationalPlaceMemoryProjection(deterministicA))===JSON.stringify(generationalPlaceMemoryProjection(deterministicB))&&JSON.stringify(deterministicA)===JSON.stringify(deterministicB),'50 large identical generational histories remain deterministic and projection-only');

  return checks;
}
