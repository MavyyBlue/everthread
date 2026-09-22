import { enforceStateInvariants, validateState } from '../core/invariants';
import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { EVERTHREAD_CITY, EVERTHREAD_COUNTRY_ID } from '../data/countries';
import { workplaceVenuesForIndustry } from '../data/workplaceLocations';
import { exportSave, importSave } from '../services/SaveSystem';
import { rewindToAge } from '../systems/AgingSystem';
import { startBusiness } from '../systems/BusinessSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { npcBusinessFromPlayerBusiness, playerBusinessFromNpcHolding } from '../systems/NpcAssetSystem';
import { captureRewindSnapshot } from '../systems/RewindSystem';
import { playerResidenceProjection } from '../systems/ResidentialLifeSystem';
import { businessWorkLocation, schoolInstitutionLocation, workingEverthreadProjection, workplaceWorldLocation } from '../systems/WorkingEverthreadSystem';
import type { Business, GameState, Npc, SocialWorld } from '../types/game';

function clone<T>(value:T):T{return structuredClone(value);}
function state(seed:string,countryId=EVERTHREAD_COUNTRY_ID,city=EVERTHREAD_CITY){
  const value=createNewGame({seed,countryId,city});value.character.age=30;value.currentYear=2070;value.settings.autoSave=false;value.finances.cash=3_000_000;return value;
}
function schoolWorld(id:string,stage:string,countryId=EVERTHREAD_COUNTRY_ID,city=EVERTHREAD_CITY,active=true):SocialWorld{
  return{id,kind:'school',name:stage==='university'?'Everthread College World':'Everthread School World',countryId,city,startedAge:12,...(!active?{endedAge:18}:{}),active,members:[],groups:[],school:{stage,educationKey:`edu:${id}`,attendance:90,conduct:90,socialStanding:60,honors:0,disciplinaryActions:0}};
}
function workWorld(id:string,industry:string,kind:'full_time'|'part_time'='full_time',countryId=EVERTHREAD_COUNTRY_ID,city=EVERTHREAD_CITY,active=true):SocialWorld{
  return{id,kind:'workplace',name:`${industry} Works`,countryId,city,startedAge:24,...(!active?{endedAge:29}:{}),active,members:[],groups:[],workplace:{employmentKey:`${kind}|24|${industry} Works`,employmentKind:kind,industry,department:'Operations',morale:60,culture:60,tension:20,reputation:55,layoffs:0,disputes:0}};
}
function businessFixture(overrides:Partial<Business>={}):Business{return{id:'biz-fixture',industryId:'software',name:'Threadworks',foundedAge:30,countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY,capital:200_000,revenue:80_000,expenses:50_000,profit:30_000,employees:6,demand:60,reputation:60,valuation:400_000,productIds:['software_product_1'],priceIndex:1,marketingBudget:5_000,compensationIndex:1,bankrupt:false,...overrides};}

export function runPhase10BWorkingEverthreadRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 10B Working Everthread regression failed: ${message}`);}

  verify(CURRENT_SAVE_VERSION===18,'01 Working Everthread must remain backward-compatible under schema 18');
  const fresh=state('10b-fresh');verify(!('workLifeState' in (fresh as unknown as Record<string,unknown>))&&!('workplaceLedger' in (fresh as unknown as Record<string,unknown>))&&!('businessLocationLedger' in (fresh as unknown as Record<string,unknown>)),'02 GameState must not gain a parallel workplace/business/location ledger');

  const school=state('10b-school');school.socialWorlds.push(schoolWorld('school-k12','secondary'));
  const k12=schoolInstitutionLocation(school);verify(k12?.inEverthread===true&&k12.districtId==='campus-green'&&k12.anchorPlaceId==='everthread-school','03 an active local compulsory-school world must project to Campus Green / Everthread Community School');
  school.socialWorlds[0]=schoolWorld('school-college','university');const college=schoolInstitutionLocation(school);verify(college?.districtId==='campus-green'&&college.anchorPlaceId==='everthread-college','04 an active local post-secondary world must project to Everthread College');
  school.socialWorlds[0]=schoolWorld('school-trade','trade');verify(schoolInstitutionLocation(school)?.anchorPlaceId==='everthread-college','05 trade/post-secondary stages must use the existing post-secondary institution anchor rather than inventing a new place');
  school.socialWorlds[0]=schoolWorld('school-away','secondary','us','Chicago');const awaySchool=schoolInstitutionLocation(school);verify(awaySchool?.inEverthread===false&&awaySchool.locationLabel==='Chicago, United States'&&!awaySchool.districtId&&!awaySchool.anchorPlaceId,'06 an external school world must stay external and must not receive an Everthread district/anchor');
  school.socialWorlds=[schoolWorld('school-old','secondary',EVERTHREAD_COUNTRY_ID,EVERTHREAD_CITY,false)];verify(schoolInstitutionLocation(school)===undefined,'07 archived school worlds must not project as the current institution');

  const finance=workplaceWorldLocation(workWorld('work-fin','Finance'));verify(finance?.districtId==='central-weave'&&finance.anchorPlaceId==='central-everthread-bank','08 finance work must project to Central Weave / Central Everthread Bank');
  const medicine=workplaceWorldLocation(workWorld('work-med','Medicine'));verify(medicine?.districtId==='central-weave'&&medicine.anchorPlaceId==='everthread-general-hospital','09 medicine work must project to the existing hospital anchor');
  const government=workplaceWorldLocation(workWorld('work-gov','Government'));verify(government?.districtId==='central-weave'&&government.anchorPlaceId==='everthread-city-hall','10 government work must project to City Hall');
  const emergency=workplaceWorldLocation(workWorld('work-ems','Emergency Services'));verify(emergency?.anchorPlaceId==='public-safety-center','11 emergency-services work must project to the existing public-safety anchor');
  const retail=workplaceWorldLocation(workWorld('work-retail','Retail'));verify(retail?.districtId==='market-row'&&retail.anchorPlaceId==='crossroads-mall','12 retail work must project to Market Row / Crossroads Mall');
  const education=workplaceWorldLocation(workWorld('work-edu','Education'));verify(education?.districtId==='campus-green'&&education.anchorPlaceId==='everthread-school','13 education work must project to Campus Green / school');
  const university=workplaceWorldLocation(workWorld('work-university','University'));verify(university?.districtId==='campus-green'&&university.anchorPlaceId==='everthread-college','13a University work must project to the implemented Everthread College workplace rather than Community School');
  const aviation=workplaceWorldLocation(workWorld('work-air','Aviation'));verify(aviation?.districtId==='south-belt'&&aviation.anchorPlaceId==='everthread-air-terminal','14 aviation work must project to South Belt / Air Terminal');
  const technology=workplaceWorldLocation(workWorld('work-tech','Technology'));verify(technology?.districtId==='eastworks'&&!technology.anchorPlaceId,'15 ordinary work without a real implemented workplace must remain district-level in Eastworks instead of fabricating Loomworks as a workplace');
  const externalWork=workplaceWorldLocation(workWorld('work-away','Finance','full_time','us','Austin'));verify(externalWork?.inEverthread===false&&externalWork.locationLabel==='Austin, United States'&&!externalWork.districtId&&!externalWork.anchorPlaceId,'16 an external workplace must retain its real city/country and receive no Everthread district');

  const multi=state('10b-multi');multi.socialWorlds.push(workWorld('work-full','Finance','full_time'),workWorld('work-part','Retail','part_time'),workWorld('work-old','Medicine','full_time',EVERTHREAD_COUNTRY_ID,EVERTHREAD_CITY,false));const workProjection=workingEverthreadProjection(multi);
  verify(workProjection.workplaces.length===2&&workProjection.workplaces.some(item=>item.sourceId==='work-full')&&workProjection.workplaces.some(item=>item.sourceId==='work-part'),'17 current full-time and part-time workplace worlds must project separately');
  verify(!workProjection.workplaces.some(item=>item.sourceId==='work-old'),'18 archived workplaces must not appear in the active Working Everthread projection');
  const projectionBefore=JSON.stringify(multi),projectionRng=multi.rngCounter,projectionId=multi.idCounter,projectionRevision=multi.actionLedger.revision;const projectionA=workingEverthreadProjection(multi),projectionB=workingEverthreadProjection(multi);
  verify(JSON.stringify(projectionA)===JSON.stringify(projectionB),'19 repeated Working Everthread projections must be deterministic');
  verify(JSON.stringify(multi)===projectionBefore&&multi.rngCounter===projectionRng&&multi.idCounter===projectionId&&multi.actionLedger.revision===projectionRevision,'20 Working Everthread projection must be strictly read-only and consume no RNG/runtime IDs/actions');

  const founded=state('10b-founded');verify(startBusiness(founded,'software','Blue Loom Labs').success,'21 an adult with capital must still found a business through the existing BusinessSystem');const localBusiness=founded.businesses[0]!;
  verify(localBusiness.countryId===EVERTHREAD_COUNTRY_ID&&localBusiness.city===EVERTHREAD_CITY,'22 a newly founded business must persist the founder location inside the authoritative Business record');
  const localLocation=businessWorkLocation(founded,localBusiness);verify(localLocation.inEverthread&&localLocation.districtId==='eastworks'&&localLocation.anchorPlaceId==='loomworks-business-district','23 a local software company must project to Eastworks / Loomworks Business District');
  const originalBusinessLocation=JSON.stringify(localLocation);founded.character.countryId='us';founded.character.city='Seattle';verify(JSON.stringify(businessWorkLocation(founded,localBusiness))===originalBusinessLocation,'24 a founded company must not teleport when a low-level fixture moves the player after founding it');
  verify(localBusiness.countryId===EVERTHREAD_COUNTRY_ID&&localBusiness.city===EVERTHREAD_CITY,'25 a player-location change must not rewrite business-owned location provenance');

  const externalFounder=state('10b-external-business','us','Boston');verify(startBusiness(externalFounder,'restaurant','Beacon Table').success,'26 an external founder can still create a business through the ordinary business authority');const externalBusiness=externalFounder.businesses[0]!;const externalBusinessLocation=businessWorkLocation(externalFounder,externalBusiness);
  verify(externalBusiness.countryId==='us'&&externalBusiness.city==='Boston'&&externalBusinessLocation.inEverthread===false&&externalBusinessLocation.locationLabel==='Boston, United States'&&!externalBusinessLocation.districtId,'27 an externally founded business must remain external and must not receive an Everthread district');

  const industries=state('10b-business-industries');const restaurant=businessFixture({id:'restaurant',industryId:'restaurant'});const fitness=businessFixture({id:'fitness',industryId:'fitness'});const healthcare=businessFixture({id:'health',industryId:'healthcare'});const logistics=businessFixture({id:'logistics',industryId:'logistics'});const propertyServices=businessFixture({id:'property',industryId:'property_services'});
  verify(businessWorkLocation(industries,restaurant).districtId==='market-row','28 restaurant businesses must project to Market Row');
  verify(businessWorkLocation(industries,fitness).districtId==='campus-green'&&businessWorkLocation(industries,fitness).anchorPlaceId==='pulseworks-gym','29 fitness businesses must project to Campus Green / Pulseworks Gym');
  verify(businessWorkLocation(industries,healthcare).districtId==='central-weave','30 healthcare businesses must project to Central Weave');
  verify(businessWorkLocation(industries,logistics).districtId==='south-belt','31 logistics businesses must project to South Belt');
  verify(businessWorkLocation(industries,propertyServices).districtId==='market-row'&&businessWorkLocation(industries,propertyServices).anchorPlaceId==='hearthline-realty','32 property-services businesses must reuse the existing Hearthline Realty anchor');
  const bankrupt=businessFixture({id:'closed',bankrupt:true});const bankruptLocation=businessWorkLocation(industries,bankrupt);verify(bankruptLocation.active===false&&bankruptLocation.detail.includes('Former company'),'33 bankruptcy must preserve place provenance while marking the projected company inactive');

  const legacy=state('10b-legacy');const legacyBusiness=businessFixture({countryId:undefined,city:undefined});legacy.businesses.push(legacyBusiness);const legacyRng=legacy.rngCounter,legacyId=legacy.idCounter;enforceStateInvariants(legacy);
  verify(legacyBusiness.countryId===EVERTHREAD_COUNTRY_ID&&legacyBusiness.city===EVERTHREAD_CITY,'34 legacy player businesses missing location must deterministically repair to the current character location');
  verify(legacy.rngCounter===legacyRng&&legacy.idCounter===legacyId,'35 legacy business-location repair must consume no gameplay RNG or runtime IDs');
  const normalizedOnce=JSON.stringify(legacy);enforceStateInvariants(legacy);verify(JSON.stringify(legacy)===normalizedOnce,'36 business-location invariant repair must be idempotent');

  const npcState=state('10b-npc-conversion');const owner=Object.values(npcState.npcs)[0] as Npc;const sourceBusiness=businessFixture({id:'family-company',countryId:'us',city:'Chicago'});const holding=npcBusinessFromPlayerBusiness(npcState,owner,sourceBusiness,npcState.character.id);
  verify(holding.countryId==='us'&&holding.city==='Chicago'&&holding.origin==='inherited'&&holding.inheritedFromNpcId===npcState.character.id,'37 player→NPC estate conversion must preserve exact company location plus inheritance provenance');
  const convertedBack=playerBusinessFromNpcHolding(npcState,holding);verify(convertedBack.countryId==='us'&&convertedBack.city==='Chicago'&&convertedBack.id===sourceBusiness.id,'38 NPC→player conversion must preserve the same company location instead of rebasing it to the successor');
  owner.assetPortfolio={properties:[],businesses:[{...holding,id:'legacy-npc-company',countryId:undefined,city:undefined}]};const npcRng=npcState.rngCounter,npcId=npcState.idCounter;enforceStateInvariants(npcState);verify(owner.assetPortfolio.businesses[0]?.countryId===owner.countryId&&owner.assetPortfolio.businesses[0]?.city===owner.city,'39 legacy NPC businesses must repair location from their owning NPC rather than the current player');
  verify(npcState.rngCounter===npcRng&&npcState.idCounter===npcId,'40 NPC business-location repair must also remain RNG/ID neutral');

  const saveState=state('10b-save');saveState.businesses.push(businessFixture({id:'save-company',countryId:'us',city:'Denver'}));const restored=importSave(exportSave(saveState));const restoredBusiness=restored.businesses.find(item=>item.id==='save-company');verify(restoredBusiness?.countryId==='us'&&restoredBusiness.city==='Denver','41 save/export/import must preserve business-owned physical base exactly');
  const normalizedSave=exportSave(restored);verify(exportSave(importSave(normalizedSave))===normalizedSave,'42 once normalized, save→load→save must remain idempotent with Working Everthread metadata');

  const rewind=state('10b-rewind');rewind.flags.rewindEnabled=true;rewind.businesses.push(businessFixture({id:'rewind-company',countryId:EVERTHREAD_COUNTRY_ID,city:EVERTHREAD_CITY}));captureRewindSnapshot(rewind);rewind.businesses[0]!.countryId='us';rewind.businesses[0]!.city='Austin';verify(rewindToAge(rewind,rewind.character.age).success,'43 rewind must accept the pre-mutation snapshot for a business-location restoration');
  verify(rewind.businesses[0]?.countryId===EVERTHREAD_COUNTRY_ID&&rewind.businesses[0]?.city===EVERTHREAD_CITY,'44 rewind must atomically restore business location provenance from the snapshot');

  const residence=state('10b-residence');residence.assets.properties.push({id:'home',typeId:'starter_house_standard',name:'Threadwell Home',location:EVERTHREAD_CITY,purchasePrice:150_000,marketValue:180_000,condition:90,age:5,amenities:['yard'],origin:'purchased',primaryResidence:true});const residenceBefore=JSON.stringify(playerResidenceProjection(residence));workingEverthreadProjection(residence);verify(JSON.stringify(playerResidenceProjection(residence))===residenceBefore,'45 Working Everthread projection must not disturb certified 10A residence meaning');

  const combined=state('10b-combined');combined.socialWorlds.push(schoolWorld('combined-school','university'),workWorld('combined-work','Finance','full_time'),workWorld('combined-part','Retail','part_time'));combined.businesses.push(businessFixture({id:'combined-company',industryId:'fitness'}));const combinedProjection=workingEverthreadProjection(combined);
  verify(combinedProjection.institution?.anchorPlaceId==='everthread-college'&&combinedProjection.workplaces.length===2&&combinedProjection.businesses.length===1,'46 the combined projection must expose institution, multiple workplaces, and businesses without merging their authorities');
  verify(combinedProjection.workplaces.every(item=>item.kind==='workplace')&&combinedProjection.businesses.every(item=>item.kind==='business')&&combinedProjection.institution?.kind==='institution','47 projected place context must preserve source-kind identity for downstream UI/semantic consumers');
  verify(!('workingEverthread' in (combined as unknown as Record<string,unknown>))&&!('workLocations' in (combined as unknown as Record<string,unknown>)),'48 projection results must never be persisted back into GameState as shadow truth');

  const deterministicA=state('10b-determinism');deterministicA.socialWorlds.push(schoolWorld('det-school','secondary'),workWorld('det-work','Technology'));deterministicA.businesses.push(businessFixture({id:'det-company',industryId:'logistics'}));const deterministicB=clone(deterministicA);verify(JSON.stringify(workingEverthreadProjection(deterministicA))===JSON.stringify(workingEverthreadProjection(deterministicB))&&JSON.stringify(deterministicA)===JSON.stringify(deterministicB),'49 identical state must produce byte-identical Working Everthread projections without state mutation');
  const issues=[...validateState(founded),...validateState(externalFounder),...validateState(legacy),...validateState(npcState),...validateState(restored),...validateState(rewind),...validateState(combined)];verify(issues.length===0,`50 Working Everthread states must remain invariant-clean (${issues.join(' | ')})`);


  const medicineVenues=workplaceVenuesForIndustry('Medicine'),nursingVenues=workplaceVenuesForIndustry('Nursing'),dentistryVenues=workplaceVenuesForIndustry('Dentistry');
  verify(medicineVenues.map(item=>item.placeId).join('|')==='everthread-general-hospital'&&nursingVenues.map(item=>item.placeId).join('|')==='everthread-general-hospital'&&dentistryVenues.map(item=>item.placeId).join('|')==='everthread-general-hospital','51 implemented medical ordinary-work industries must now resolve to the single real Hospital venue without changing their Working Everthread owner');
  verify(workplaceVenuesForIndustry('Mental Wellness').length===0&&workplaceVenuesForIndustry('Pharmaceutical Research').length===0&&workplaceVenuesForIndustry('Emergency Services').length===0,'52 Hospital venue implementation must not opportunistically absorb adjacent Central Weave industries whose real places are not this scene');
  const hospitalSave=state('10b-hospital-save');hospitalSave.employment.current={jobId:'medicine_1',title:'Medical Resident',company:'Medicine Works',startAge:24,salary:72_000,performance:60,level:1};hospitalSave.socialWorlds.push(workWorld('hospital-save-world','Medicine'));hospitalSave.health.conditions.push({id:'hospital-save-condition',illnessId:'seasonal_cold',name:'Seasonal Cold',severity:20,diagnosedAge:30,chronic:false,treated:false});const hospitalSaved=exportSave(hospitalSave),hospitalRestored=importSave(hospitalSaved);const restoredHospitalWorld=hospitalRestored.socialWorlds.find(world=>world.id==='hospital-save-world')!;
  verify(hospitalRestored.health.conditions.some(condition=>condition.id==='hospital-save-condition')&&hospitalRestored.employment.current?.jobId==='medicine_1'&&workplaceWorldLocation(restoredHospitalWorld,hospitalRestored)?.anchorPlaceId==='everthread-general-hospital','53 schema-18 save round-trip must preserve existing patient and medical-work records while deriving Hospital location rather than persisting new Hospital state');
  const healthcareBusiness=businessFixture({id:'hospital-business-control',industryId:'healthcare'});verify(businessWorkLocation(hospitalRestored,healthcareBusiness).districtId==='central-weave'&&!businessWorkLocation(hospitalRestored,healthcareBusiness).anchorPlaceId,'54 a generic healthcare company must remain district-level and must not be fabricated into the Hospital workplace scene');

  return checks;
}
