import { actionUsesThisAge } from '../core/actionEconomy';
import { LOCATION_SCENE_ACTIONS, LOCATION_SCENE_V1_ENABLED, LOCATION_SCENES, locationSceneDefinition, locationSceneEnabled } from '../data/locationScenes';
import { propertyDefinitions, vehicleDefinitions, luxuryVehicleDefinitions } from '../data/assets';
import { createNewGame } from '../systems/CharacterSystem';
import { performWellnessActivity } from '../systems/HealthSystem';
import {
  coverLocationScene,
  locationSceneActionAvailability,
  locationSceneBackStep,
  locationSceneLabelAlignment,
  locationSceneCompanionPlan,
  locationSceneCompanions,
  locationSceneMusicPartnershipDecisionAvailability,
  locationSceneMusicProjection,
  locationSceneMotorsCatalogue,
  locationSceneHomeCatalogue,
  locationSceneResidenceProjection,
  locationSceneResidentialConnections,
  locationSceneResidentialPlans,
  locationScenePropRect,
  locationSceneUtilityTrayState,
  placeLocationSceneRect,
} from '../systems/LocationSceneSystem';
import { takeLicenseTest } from '../systems/TravelSystem';
import { buyProperty, getPropertySaleQuote, rentOutProperty, sellProperty } from '../systems/PropertySystem';
import { completeRomanticDate, shareResidentialExperienceWithNpc } from '../systems/RelationshipSystem';
import type { GameState, Npc, Relationship } from '../types/game';

function addFriend(state:GameState,id='location-scene-friend',age=30){
  const npc:Npc={id,firstName:'Riley',lastName:'Thread',age,alive:true,health:80,happiness:70,wealth:15000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['calm'],hiddenOpinion:10,memories:[],parentIds:[],childIds:[],simulationTier:'full'};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type:'friend',score:70,attraction:40,compatibility:75,yearsKnown:4};
  state.npcs[id]=npc;state.relationships.push(rel);return{npc,rel};
}

export function runLocationSceneRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Location scene regression failed: ${message}`);}

  verify(LOCATION_SCENE_V1_ENABLED,'01 first location-scene rollout must remain explicitly feature-gated');
  verify(LOCATION_SCENES.length===6&&LOCATION_SCENES.map(scene=>scene.id).join('|')==='weaver-park|threadtone-music-studio|central-everthread-bank|loomline-motors|hearthline-realty|threadwell-residential','02 location rollout must preserve the five certified scenes and add only Threadwell Residential in this slice');
  verify(locationSceneEnabled('weaver-park')&&locationSceneEnabled('threadtone-music-studio')&&locationSceneEnabled('central-everthread-bank')&&locationSceneEnabled('loomline-motors')&&locationSceneEnabled('hearthline-realty')&&locationSceneEnabled('threadwell-residential'),'03 all six integrated scene-backed places must bypass legacy map routing without widening the allowlist elsewhere');
  verify(locationSceneDefinition('weaver-park')?.background.endsWith('/weaver-park.png')&&locationSceneDefinition('threadtone-music-studio')?.background.endsWith('/threadtone-music-studio.png')&&locationSceneDefinition('central-everthread-bank')?.background.endsWith('/central-everthread-bank.png')&&locationSceneDefinition('loomline-motors')?.background.endsWith('/loomline-motors.png')&&locationSceneDefinition('hearthline-realty')?.background.endsWith('/hearthline-realty.png')&&locationSceneDefinition('threadwell-residential')?.background.endsWith('/threadwell-residential.png'),'04 each rollout scene must resolve its authored Astra environment rather than a generic backdrop');
  verify(LOCATION_SCENES.every(scene=>scene.canvas[0]===1024&&scene.canvas[1]===1536),'05 scene geometry must preserve the authored 1024x1536 portrait canvas');
  verify(LOCATION_SCENES.every(scene=>new Set(scene.groups.map(group=>group.id)).size===scene.groups.length),'06 semantic object ids must be unique within each location');
  verify(locationSceneDefinition('weaver-park')!.groups.flatMap(group=>group.actionIds).join('|')==='shared.park.walk|shared.park.play|date.park|wellness.walk|wellness.run|wellness.meditate','07 Weaver Park must expose only its focused social/date/wellness actions');
  verify(locationSceneDefinition('threadtone-music-studio')!.groups.flatMap(group=>group.actionIds).join('|')==='music.leave|music.retire|music.practice|music.tour|music.song|music.album|music.catalog|music.partnership','08 Threadtone must expose its focused career/release/catalog actions without mounting the generic Career surface');
  verify(LOCATION_SCENES.every(scene=>scene.groups.every(group=>group.actionIds.every(actionId=>Boolean(LOCATION_SCENE_ACTIONS[actionId])))),'09 every scene action must resolve through the literal first-slice allowlist');
  verify(LOCATION_SCENES.every(scene=>scene.groups.every(group=>group.hitRect.every(value=>value>=0&&value<=1)&&group.hitRect[0]+group.hitRect[2]<=1&&group.hitRect[1]+group.hitRect[3]<=1)),'10 semantic hotspot geometry must remain normalized to the authored art rectangle');

  const portrait=coverLocationScene(390,710);
  verify(Math.abs(portrait.width/portrait.height-2/3)<.000001&&portrait.left<=0&&portrait.top<=0&&portrait.left+portrait.width>=390&&portrait.top+portrait.height>=710,'11 immersive scene geometry must cover the full portrait viewport without distorting the authored aspect ratio');
  const narrow=coverLocationScene(320,430);verify(narrow.left<=0&&narrow.top<=0&&narrow.left+narrow.width>=320&&narrow.top+narrow.height>=430,'12 cover geometry must eliminate letterbox gaps on a narrow/short viewport');
  const parkTrail=placeLocationSceneRect(locationSceneDefinition('weaver-park')!.groups[1]!.hitRect,portrait);
  verify(parkTrail.width>=48&&parkTrail.height>=48,'13 hotspot placement must retain a minimum 48px touch target under immersive scene fitting');
  const deskProp=locationScenePropRect(locationSceneDefinition('threadtone-music-studio')!.propAlphaBounds,portrait,.62,.32,.90);
  verify(deskProp.left>=portrait.left&&deskProp.top>=portrait.top&&deskProp.left+deskProp.width<=portrait.left+portrait.width+1&&deskProp.top+deskProp.height<=portrait.top+portrait.height+1,'14 transparent prop placement must stay inside the authored scene bounds');

  const pure=createNewGame({seed:'location-scene-pure'});pure.character.age=30;addFriend(pure);pure.settings.autoSave=false;
  const pureBefore=JSON.stringify(pure),pureRng=pure.rngCounter,pureId=pure.idCounter,pureRevision=pure.actionLedger?.revision??0;
  for(const actionId of Object.keys(LOCATION_SCENE_ACTIONS) as Array<keyof typeof LOCATION_SCENE_ACTIONS>)locationSceneActionAvailability(pure,actionId);
  locationSceneCompanions(pure,'shared.park.walk');locationSceneCompanions(pure,'date.home');locationSceneMusicProjection(pure);locationSceneMotorsCatalogue();locationSceneMotorsCatalogue(true);locationSceneHomeCatalogue();locationSceneResidenceProjection(pure);locationSceneResidentialConnections(pure);locationSceneResidentialPlans(pure);locationSceneResidentialPlans(pure,'shared.home.cook');
  verify(JSON.stringify(pure)===pureBefore&&pure.rngCounter===pureRng&&pure.idCounter===pureId&&(pure.actionLedger?.revision??0)===pureRevision,'15 browsing scenes, availability, companions, music records, vehicle/home catalogues, residence/household projections, and residential plans must be save/RNG/runtime-id/action-ledger neutral');

  const child=createNewGame({seed:'location-scene-child'});child.character.age=2;
  verify(!locationSceneActionAvailability(child,'wellness.walk').available&&!locationSceneActionAvailability(child,'wellness.run').available&&!locationSceneActionAvailability(child,'wellness.meditate').available,'16 Park wellness objects must preserve the existing age gates rather than invent location shortcuts');
  child.character.age=3;verify(locationSceneActionAvailability(child,'wellness.walk').available,'17 Park walking must unlock at the existing age-three wellness boundary');
  const walkResult=performWellnessActivity(child,'walking');
  verify(walkResult.success&&!locationSceneActionAvailability(child,'wellness.walk').available&&actionUsesThisAge(child,'wellness.activity','walking')===1,'18 scene availability must immediately reflect the existing wellness action economy after a real action');

  const social=createNewGame({seed:'location-scene-social'});social.character.age=30;const friend=addFriend(social,'park-friend',30);
  const socialBefore=JSON.stringify(social);const socialOptions=locationSceneCompanions(social,'shared.park.walk');
  verify(socialOptions.some(option=>option.npcId===friend.npc.id)&&locationSceneActionAvailability(social,'shared.park.walk').available,'19 Park bench must project only currently eligible existing NPC plans');
  friend.npc.city='Chicago';verify(!locationSceneCompanions(social,'shared.park.walk').some(option=>option.npcId===friend.npc.id),'20 a remote NPC must disappear from Park companion choices through the existing locality gate');
  friend.npc.city=social.character.city;verify(locationSceneCompanions(social,'shared.park.walk').some(option=>option.npcId===friend.npc.id),'21 restoring the NPC to Everthread must restore the existing shared-experience eligibility projection');

  const music=createNewGame({seed:'location-scene-music'});music.character.age=4;music.settings.autoSave=false;music.specialCareers.music??={};
  verify(!locationSceneActionAvailability(music,'music.practice').available,'22 Threadtone practice must preserve the existing childhood age boundary');
  music.character.age=5;verify(locationSceneActionAvailability(music,'music.practice').available,'23 Threadtone practice must become available at the existing age-five boundary');
  music.character.age=12;(music.specialCareers.music as Record<string,unknown>).skill=19;
  verify(!locationSceneActionAvailability(music,'music.song').available,'24 recording booth releases must preserve teen-age and skill gates');
  music.character.age=16;(music.specialCareers.music as Record<string,unknown>).skill=35;
  verify(locationSceneActionAvailability(music,'music.song').available&&locationSceneActionAvailability(music,'music.album').available,'25 eligible releases must expose the same existing release quota through the booth');
  verify(!locationSceneActionAvailability(music,'music.retire').available,'26 producer desk retirement must not appear valid before an established music career exists');
  (music.specialCareers.music as Record<string,unknown>).professionalStartAge=16;
  verify(locationSceneActionAvailability(music,'music.leave').available,'27 producer desk Leave Music Path must use the existing active-commitment exit gate');
  verify(locationSceneActionAvailability(music,'music.retire').available,'28 producer desk retirement must use the established deep-career retirement gate rather than an age shortcut');

  const projectionBefore=JSON.stringify(music);const projection=locationSceneMusicProjection(music);
  verify(projection.lifecycle.status.length>0&&projection.catalog.length===0&&!projection.offer,'29 record-shelf projection must read existing music lifecycle/catalog/offer authorities without fabricating entries');
  verify(JSON.stringify(music)===projectionBefore,'30 record-shelf projection must remain strictly read-only');
  verify(!locationSceneMusicPartnershipDecisionAvailability(music).available,'31 distribution decisions must stay unavailable when the owning music system has no live offer');
  verify(locationSceneBackStep(true,true)==='detail'&&locationSceneBackStep(false,true)==='group'&&locationSceneBackStep(false,false)==='map','32 local Back policy must unwind focused detail, then object menu, then return to the preserved map');
  const park=locationSceneDefinition('weaver-park')!,studio=locationSceneDefinition('threadtone-music-studio')!;
  verify(locationSceneLabelAlignment(park.groups.find(group=>group.id==='trails')!.hitRect)==='start'&&locationSceneLabelAlignment(park.groups.find(group=>group.id==='pavilion')!.hitRect)==='end','33 edge hotspots must anchor their readable labels inward instead of clipping against the scene edge');
  verify(locationSceneLabelAlignment(studio.groups.find(group=>group.id==='records')!.hitRect)==='center','34 centered/small hotspots must keep an independent readable label width instead of shrinking the label to the raw hit rectangle');
  for(const [width,height] of [[360,666],[390,710],[412,781],[430,798]] as const){
    const stage=coverLocationScene(width,height);
    verify(LOCATION_SCENES.every(scene=>scene.groups.every(group=>{const rect=placeLocationSceneRect(group.hitRect,stage);const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;return centerX>=0&&centerX<=width&&centerY>=0&&centerY<=height;})),`35 portrait ${width}x${height} must keep every first-slice hotspot center visible under immersive cover fitting`);
  }
  verify(coverLocationScene(844,390).width>=844&&coverLocationScene(844,390).height>=390,'39 short-landscape art must still fill the entire location surface even when some artwork is necessarily cropped');
  verify(locationSceneUtilityTrayState(false,false)==='expanded'&&locationSceneUtilityTrayState(true,false)==='collapsed'&&locationSceneUtilityTrayState(false,true)==='hidden'&&locationSceneUtilityTrayState(true,true)==='hidden','40 utility tray presentation must collapse Things to do + Map as one drawer and hide the whole drawer while an object panel is open');

  const bank=locationSceneDefinition('central-everthread-bank')!;
  verify(bank.groups.flatMap(group=>group.actionIds).join('|')==='bank.summary|bank.payments|bank.accounts|bank.offers|bank.borrowing|bank.invest|bank.history','41 Central Bank must expose only the seven authored focused finance surfaces');
  verify(bank.groups.map(group=>group.id).join('|')==='kiosk|teller|advisor'&&bank.groups.every(group=>group.actionIds.every(actionId=>LOCATION_SCENE_ACTIONS[actionId].kind==='panel')),'42 Central Bank object grouping must preserve Astra kiosk/teller/advisor semantics without inventing direct money mutations');
  const bankChild=createNewGame({seed:'location-scene-bank-child'});bankChild.character.age=10;const bankBefore=JSON.stringify(bankChild);
  verify(bank.groups.flatMap(group=>group.actionIds).every(actionId=>locationSceneActionAvailability(bankChild,actionId).available)&&JSON.stringify(bankChild)===bankBefore,'43 Bank browsing, including the locked investment view, must remain inspectable and state-neutral before action-specific owner gates apply');
  const kioskProp=locationScenePropRect(bank.propAlphaBounds,portrait,bank.propPlacement.width,bank.propPlacement.maxHeight,bank.propPlacement.baseline);
  verify(kioskProp.left>=portrait.left&&kioskProp.top>=portrait.top&&kioskProp.left+kioskProp.width<=portrait.left+portrait.width+1&&kioskProp.top+kioskProp.height<=portrait.top+portrait.height+1,'44 Central Bank service-kiosk prop must remain aligned inside the shared immersive scene stage');

  const motors=locationSceneDefinition('loomline-motors')!;
  verify(motors.groups.flatMap(group=>group.actionIds).join('|')==='motors.catalog|motors.owned|motors.finance|license.driving','45 Loomline must expose only the authored vehicle-market, garage, finance, and driving-licence surfaces');
  verify(motors.groups.map(group=>group.id).join('|')==='showroom|service|finance'&&motors.groups.every(group=>group.actionIds.every(actionId=>LOCATION_SCENE_ACTIONS[actionId].kind==='panel')),'46 Loomline object grouping must preserve Astra showroom/service/finance semantics without inventing direct asset mutations');
  const fullCatalogue=locationSceneMotorsCatalogue(),financeCatalogue=locationSceneMotorsCatalogue(true),expectedCatalogue=[...vehicleDefinitions,...luxuryVehicleDefinitions];
  verify(fullCatalogue.map(vehicle=>vehicle.id).join('|')===expectedCatalogue.map(vehicle=>vehicle.id).join('|'),'47 Loomline showroom must retain every authoritative vehicle type instead of maintaining a parallel catalogue');
  verify(financeCatalogue.length===vehicleDefinitions.length&&financeCatalogue.every(vehicle=>vehicle.category==='car'||vehicle.category==='motorcycle'),'48 Loomline finance office must project only the vehicle categories already supported by existing secured financing');
  const motorsChild=createNewGame({seed:'location-scene-motors-child'});motorsChild.character.age=15;const motorsBefore=JSON.stringify(motorsChild);
  verify(locationSceneActionAvailability(motorsChild,'motors.catalog').available&&locationSceneActionAvailability(motorsChild,'motors.owned').available&&locationSceneActionAvailability(motorsChild,'motors.finance').available&&!locationSceneActionAvailability(motorsChild,'license.driving').available&&JSON.stringify(motorsChild)===motorsBefore,'49 Loomline browsing must remain inspectable and neutral before age-specific owner gates, while the driving test keeps its existing age-16 boundary');
  const driver=createNewGame({seed:'location-scene-driver'});driver.character.age=16;
  verify(locationSceneActionAvailability(driver,'license.driving').available,'50 Loomline driving licence must unlock through the existing licence action gate at age 16');
  const licenseResult=takeLicenseTest(driver,'driving',100);
  verify(licenseResult.success&&driver.travel.licenses.driving&&!locationSceneActionAvailability(driver,'license.driving').available&&actionUsesThisAge(driver,'license.test','driving')===1,'51 a submitted Loomline driving test must commit exactly through TravelSystem and immediately close the location gate');
  const showroomProp=locationScenePropRect(motors.propAlphaBounds,portrait,motors.propPlacement.width,motors.propPlacement.maxHeight,motors.propPlacement.baseline);
  verify(showroomProp.left>=portrait.left&&showroomProp.top>=portrait.top&&showroomProp.left+showroomProp.width<=portrait.left+portrait.width+1&&showroomProp.top+showroomProp.height<=portrait.top+portrait.height+1,'52 Loomline showroom-car prop must remain aligned inside the shared immersive scene stage');

  const realty=locationSceneDefinition('hearthline-realty')!;
  verify(realty.groups.flatMap(group=>group.actionIds).join('|')==='homes.catalog|homes.mortgage|homes.residence|homes.owned','53 Hearthline must expose only the authored catalogue, mortgage, residence, and owned-home surfaces');
  verify(realty.groups.map(group=>group.id).join('|')==='model|listings|agent'&&realty.groups.every(group=>group.actionIds.every(actionId=>LOCATION_SCENE_ACTIONS[actionId].kind==='panel')),'54 Hearthline object grouping must preserve Astra home-display/property-wall/property-office semantics without inventing direct property mutations');
  verify(locationSceneHomeCatalogue().map(home=>home.id).join('|')===propertyDefinitions.map(home=>home.id).join('|'),'55 Hearthline home display must project the authoritative property catalogue instead of maintaining a parallel market');
  const realtyChild=createNewGame({seed:'location-scene-realty-child'});realtyChild.character.age=10;const realtyChildBefore=JSON.stringify(realtyChild);const childResidence=locationSceneResidenceProjection(realtyChild);
  verify(['homes.catalog','homes.mortgage','homes.residence','homes.owned'].every(actionId=>locationSceneActionAvailability(realtyChild,actionId as keyof typeof LOCATION_SCENE_ACTIONS).available)&&childResidence.kind==='family'&&JSON.stringify(realtyChild)===realtyChildBefore,'56 Hearthline browsing and residence projection must remain inspectable and neutral before transaction-specific adulthood and finance gates apply');
  const owner=createNewGame({seed:'location-scene-realty-owner'});owner.character.age=30;owner.finances.cash=2_000_000;const homeDefinition=propertyDefinitions[0]!;const purchase=buyProperty(owner,homeDefinition.id,false);const ownedHome=owner.assets.properties[0]!;
  verify(purchase.success&&ownedHome.typeId===homeDefinition.id&&locationSceneResidenceProjection(owner).propertyId===ownedHome.id,'57 a Hearthline purchase must commit through PropertySystem and immediately become visible through the existing residence projection');
  const rent=rentOutProperty(owner,ownedHome.id);
  verify(rent.success&&Boolean(ownedHome.rental)&&!ownedHome.primaryResidence&&locationSceneResidenceProjection(owner).kind==='rented','58 Hearthline Rent out must remain landlord functionality owned by PropertySystem and must remove the property from current-residence truth');
  const saleQuote=getPropertySaleQuote(owner,ownedHome.id)!;const cashBeforeSale=owner.finances.cash;const sale=sellProperty(owner,ownedHome.id);
  verify(sale.success&&owner.assets.properties.length===0&&owner.finances.cash===cashBeforeSale+saleQuote.cashProceeds,'59 Hearthline sales must reconcile through the existing property sale quote/payoff authority rather than a location-specific balance path');
  const homeModelProp=locationScenePropRect(realty.propAlphaBounds,portrait,realty.propPlacement.width,realty.propPlacement.maxHeight,realty.propPlacement.baseline);
  verify(homeModelProp.left>=portrait.left&&homeModelProp.top>=portrait.top&&homeModelProp.left+homeModelProp.width<=portrait.left+portrait.width+1&&homeModelProp.top+homeModelProp.height<=portrait.top+portrait.height+1,'60 Hearthline home-model prop must remain aligned inside the shared immersive scene stage');

  const threadwell=locationSceneDefinition('threadwell-residential')!;
  verify(threadwell.groups.flatMap(group=>group.actionIds).join('|')==='homes.residence|home.neighbors|home.visits|shared.home.hangout|shared.home.cook|shared.home.sleepover|date.home','61 Threadwell must expose only residence projection, existing household connections, residential plans, and the existing cook-together date');
  verify(threadwell.groups.map(group=>group.id).join('|')==='board|porch|courtyard'&&threadwell.groups[0]!.actionIds.every(actionId=>LOCATION_SCENE_ACTIONS[actionId].kind==='panel')&&threadwell.groups[1]!.actionIds.every(actionId=>LOCATION_SCENE_ACTIONS[actionId].kind==='panel')&&LOCATION_SCENE_ACTIONS['date.home'].kind==='companion','62 Threadwell grouping must preserve Astra board/porch/courtyard semantics without inventing a neighborhood simulation');
  const resident=createNewGame({seed:'location-scene-threadwell-resident'});resident.character.age=30;const residentFriend=addFriend(resident,'threadwell-friend',30);
  const residentConnections=locationSceneResidentialConnections(resident),visitPlans=locationSceneResidentialPlans(resident,'home.visits');
  verify(residentConnections.some(option=>option.npcId===residentFriend.npc.id&&option.residenceLabel.includes('Riley'))&&visitPlans.some(option=>option.npcId===residentFriend.npc.id&&option.allowed&&option.residenceLabel.includes('Riley')),'63 Threadwell must derive known households and visit choices from the existing relationship and Residential Life projections');
  residentFriend.npc.city='Chicago';
  verify(!locationSceneResidentialConnections(resident).some(option=>option.npcId===residentFriend.npc.id)&&!locationSceneResidentialPlans(resident,'home.visits').some(option=>option.npcId===residentFriend.npc.id&&option.allowed),'64 remote NPC households must disappear from Threadwell connection/eligible-plan projections through existing locality rules');
  residentFriend.npc.city=resident.character.city;
  const hangoutPlans=locationSceneResidentialPlans(resident,'shared.home.hangout'),cookPlans=locationSceneResidentialPlans(resident,'shared.home.cook'),adultSleepover=locationSceneResidentialPlans(resident,'shared.home.sleepover');
  verify(hangoutPlans.length>0&&hangoutPlans.every(option=>option.activityId==='home_hangout')&&cookPlans.length>0&&cookPlans.every(option=>option.activityId==='cook_together')&&adultSleepover.length===0,'65 Threadwell focused actions must filter the existing residential plan registry rather than creating location-specific plan definitions');
  const youth=createNewGame({seed:'location-scene-threadwell-youth'});youth.character.age=15;const youthFriend=addFriend(youth,'threadwell-youth-friend',15);const sleepoverPlans=locationSceneResidentialPlans(youth,'shared.home.sleepover');
  verify(sleepoverPlans.some(option=>option.npcId===youthFriend.npc.id&&option.planId==='sleepover-at-home'&&option.allowed)&&locationSceneActionAvailability(youth,'shared.home.sleepover').available,'66 Threadwell sleepovers must reuse the certified age-6-to-17 Residential Life boundary and existing action gate');
  const commitState=createNewGame({seed:'location-scene-threadwell-commit'});commitState.character.age=30;const commitFriend=addFriend(commitState,'threadwell-commit-friend',30);const exactPlan=locationSceneResidentialPlans(commitState,'shared.home.hangout').find(option=>option.npcId===commitFriend.npc.id&&option.allowed)!;const commitResult=shareResidentialExperienceWithNpc(commitState,commitFriend.npc.id,exactPlan.planId);
  verify(commitResult.success&&commitState.timeline.at(-1)?.placeId==='threadwell-residential'&&actionUsesThisAge(commitState,'social.npc.action',`${commitFriend.npc.id}:residential:${exactPlan.planId}`)===1,'67 a Threadwell household action must commit through Residential Life/shared-experience ownership and its existing action ledger');
  const dateState=createNewGame({seed:'location-scene-threadwell-date',orientation:'pansexual'});dateState.character.age=30;const dateFriend=addFriend(dateState,'threadwell-date-friend',30);dateFriend.npc.sexuality='pansexual';dateFriend.rel.romance={pendingDate:{acceptedYear:dateState.currentYear,acceptedAge:dateState.character.age}};
  const homeDatePlan=locationSceneCompanionPlan('date.home');const dateOptions=locationSceneCompanions(dateState,'date.home');
  verify(homeDatePlan?.kind==='date'&&homeDatePlan.placeId==='threadwell-residential'&&homeDatePlan.activityId==='cook_together'&&dateOptions.some(option=>option.npcId===dateFriend.npc.id),'68 Threadwell at-home dates must use the generic companion projection over the existing romantic date plan');
  const dateResult=completeRomanticDate(dateState,dateFriend.npc.id,'threadwell-residential','cook_together');
  verify(dateResult.success&&!dateFriend.rel.romance?.pendingDate&&dateState.timeline.at(-1)?.placeId==='threadwell-residential'&&dateFriend.rel.romance?.dateHistory?.at(-1)?.activityId==='cook_together','69 selecting a Threadwell date must commit through RomanticDateSystem and preserve its existing momentum/history authority');
  const boardProp=locationScenePropRect(threadwell.propAlphaBounds,portrait,threadwell.propPlacement.width,threadwell.propPlacement.maxHeight,threadwell.propPlacement.baseline);
  verify(boardProp.left>=portrait.left&&boardProp.top>=portrait.top&&boardProp.left+boardProp.width<=portrait.left+portrait.width+1&&boardProp.top+boardProp.height<=portrait.top+portrait.height+1,'70 Threadwell neighborhood-board prop must remain aligned inside the shared immersive scene stage');

  return checks;
}
