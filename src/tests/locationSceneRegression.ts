import { actionUsesThisAge } from '../core/actionEconomy';
import { LOCATION_SCENE_ACTIONS, LOCATION_SCENE_V1_ENABLED, LOCATION_SCENES, locationSceneDefinition, locationSceneEnabled } from '../data/locationScenes';
import { createNewGame } from '../systems/CharacterSystem';
import { performWellnessActivity } from '../systems/HealthSystem';
import {
  containedLocationScene,
  locationSceneActionAvailability,
  locationSceneBackStep,
  locationSceneLabelAlignment,
  locationSceneCompanions,
  locationSceneMusicPartnershipDecisionAvailability,
  locationSceneMusicProjection,
  locationScenePropRect,
  placeLocationSceneRect,
} from '../systems/LocationSceneSystem';
import type { GameState, Npc, Relationship } from '../types/game';

function addFriend(state:GameState,id='location-scene-friend',age=30){
  const npc:Npc={id,firstName:'Riley',lastName:'Thread',age,alive:true,health:80,happiness:70,wealth:15000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits:['calm'],hiddenOpinion:10,memories:[],parentIds:[],childIds:[],simulationTier:'full'};
  const rel:Relationship={id:`rel-${id}`,npcId:id,type:'friend',score:70,attraction:40,compatibility:75,yearsKnown:4};
  state.npcs[id]=npc;state.relationships.push(rel);return{npc,rel};
}

export function runLocationSceneRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Location scene regression failed: ${message}`);}

  verify(LOCATION_SCENE_V1_ENABLED,'01 first location-scene rollout must remain explicitly feature-gated');
  verify(LOCATION_SCENES.length===2&&LOCATION_SCENES.map(scene=>scene.id).join('|')==='weaver-park|threadtone-music-studio','02 first rollout must contain only Weaver Park and Threadtone Music Studio');
  verify(locationSceneEnabled('weaver-park')&&locationSceneEnabled('threadtone-music-studio')&&!locationSceneEnabled('central-everthread-bank'),'03 unsupported places must retain their existing map routing until their own scene slice is integrated');
  verify(locationSceneDefinition('weaver-park')?.background.endsWith('/weaver-park.png')&&locationSceneDefinition('threadtone-music-studio')?.background.endsWith('/threadtone-music-studio.png'),'04 each rollout scene must resolve its authored Astra environment rather than a generic backdrop');
  verify(LOCATION_SCENES.every(scene=>scene.canvas[0]===1024&&scene.canvas[1]===1536),'05 scene geometry must preserve the authored 1024x1536 portrait canvas');
  verify(LOCATION_SCENES.every(scene=>new Set(scene.groups.map(group=>group.id)).size===scene.groups.length),'06 semantic object ids must be unique within each location');
  verify(locationSceneDefinition('weaver-park')!.groups.flatMap(group=>group.actionIds).join('|')==='shared.park.walk|shared.park.play|date.park|wellness.walk|wellness.run|wellness.meditate','07 Weaver Park must expose only its focused social/date/wellness actions');
  verify(locationSceneDefinition('threadtone-music-studio')!.groups.flatMap(group=>group.actionIds).join('|')==='music.leave|music.retire|music.practice|music.tour|music.song|music.album|music.catalog|music.partnership','08 Threadtone must expose its focused career/release/catalog actions without mounting the generic Career surface');
  verify(LOCATION_SCENES.every(scene=>scene.groups.every(group=>group.actionIds.every(actionId=>Boolean(LOCATION_SCENE_ACTIONS[actionId])))),'09 every scene action must resolve through the literal first-slice allowlist');
  verify(LOCATION_SCENES.every(scene=>scene.groups.every(group=>group.hitRect.every(value=>value>=0&&value<=1)&&group.hitRect[0]+group.hitRect[2]<=1&&group.hitRect[1]+group.hitRect[3]<=1)),'10 semantic hotspot geometry must remain normalized to the contained art rectangle');

  const portrait=containedLocationScene(390,560);
  verify(Math.abs(portrait.width/portrait.height-2/3)<.000001&&portrait.width<=390&&portrait.height<=560,'11 contained scene geometry must preserve the art aspect ratio without cover-cropping on a 390px phone');
  const narrow=containedLocationScene(320,430);verify(narrow.left>=0&&narrow.top>=0&&narrow.width<=320&&narrow.height<=430,'12 contained scene geometry must stay inside a narrow/short viewport');
  const parkTrail=placeLocationSceneRect(locationSceneDefinition('weaver-park')!.groups[1]!.hitRect,portrait);
  verify(parkTrail.width>=48&&parkTrail.height>=48,'13 hotspot placement must retain a minimum 48px touch target even when scene art is contained');
  const deskProp=locationScenePropRect(locationSceneDefinition('threadtone-music-studio')!.propAlphaBounds,portrait,.62,.32,.90);
  verify(deskProp.left>=portrait.left&&deskProp.top>=portrait.top&&deskProp.left+deskProp.width<=portrait.left+portrait.width+1&&deskProp.top+deskProp.height<=portrait.top+portrait.height+1,'14 transparent prop placement must stay inside the authored scene bounds');

  const pure=createNewGame({seed:'location-scene-pure'});pure.character.age=30;addFriend(pure);pure.settings.autoSave=false;
  const pureBefore=JSON.stringify(pure),pureRng=pure.rngCounter,pureId=pure.idCounter,pureRevision=pure.actionLedger?.revision??0;
  for(const actionId of Object.keys(LOCATION_SCENE_ACTIONS) as Array<keyof typeof LOCATION_SCENE_ACTIONS>)locationSceneActionAvailability(pure,actionId);
  locationSceneCompanions(pure,'shared.park.walk');locationSceneMusicProjection(pure);
  verify(JSON.stringify(pure)===pureBefore&&pure.rngCounter===pureRng&&pure.idCounter===pureId&&(pure.actionLedger?.revision??0)===pureRevision,'15 browsing scenes, availability, companions, and music records must be save/RNG/runtime-id/action-ledger neutral');

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

  return checks;
}
