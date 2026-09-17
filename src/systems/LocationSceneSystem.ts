import { actionGateStatus } from '../core/actionEconomy';
import { LOCATION_SCENE_ACTIONS, type LocationSceneActionId, type LocationSceneRect } from '../data/locationScenes';
import { propertyDefinitions, vehicleDefinitions, luxuryVehicleDefinitions } from '../data/assets';
import { MUSIC_RELEASE_MIN_AGE } from './SpecialCareerSystem';
import { WELLNESS_MIN_AGES } from './HealthSystem';
import { specialCareerStartGate } from './CommitmentSystem';
import { specialCareerExitGate } from './SpecialCareerExitSystem';
import { specialCareerLifecycleView, specialCareerRetirementGate } from './SpecialCareerLifecycleSystem';
import { musicCatalog, musicPartnershipOffer } from './MusicCareerCycleSystem';
import { romanticDatePlanFor } from './RomanticDateSystem';
import { sharedExperienceAvailability } from './SharedExperienceSystem';
import { npcHouseholdResidenceProjection, playerResidenceProjection, projectResidentialPlans } from './ResidentialLifeSystem';
import type { GameState } from '../types/game';

export interface LocationSceneAvailability{available:boolean;reason?:string}
export interface LocationSceneCompanionOption{npcId:string;name:string;detail:string}
export interface LocationSceneResidentialConnection{npcId:string;name:string;relationship:string;residenceLabel:string;detail:string;householdSize:number}
export interface LocationSceneResidentialPlanOption{npcId:string;name:string;planId:string;label:string;description:string;residenceLabel:string;activityId:string;allowed:boolean;reason?:string}
export interface LocationSceneCompanionPlan{kind:'shared'|'date';placeId:string;activityId:string}
export interface LocationSceneStage{left:number;top:number;width:number;height:number}

export type LocationSceneBackStep='detail'|'group'|'map';
export type LocationSceneLabelAlignment='start'|'center'|'end';
export type LocationSceneUtilityTrayState='expanded'|'collapsed'|'hidden';

export function locationSceneUtilityTrayState(collapsed:boolean,panelOpen:boolean):LocationSceneUtilityTrayState{
  return panelOpen?'hidden':collapsed?'collapsed':'expanded';
}

export function locationSceneBackStep(detailOpen:boolean,groupOpen:boolean):LocationSceneBackStep{
  return detailOpen?'detail':groupOpen?'group':'map';
}

export function locationSceneMotorsCatalogue(financingOnly=false){
  const catalogue=[...vehicleDefinitions,...luxuryVehicleDefinitions];
  return financingOnly?catalogue.filter(vehicle=>vehicle.category==='car'||vehicle.category==='motorcycle'):catalogue;
}

export function locationSceneHomeCatalogue(){return propertyDefinitions;}
export function locationSceneResidenceProjection(state:GameState){return playerResidenceProjection(state);}

const companionPlans:Partial<Record<LocationSceneActionId,LocationSceneCompanionPlan>>={
  'shared.park.walk':{kind:'shared',placeId:'weaver-park',activityId:'park_walk'},
  'shared.park.play':{kind:'shared',placeId:'weaver-park',activityId:'park_play'},
  'date.park':{kind:'date',placeId:'weaver-park',activityId:'park_walk'},
  'date.home':{kind:'date',placeId:'threadwell-residential',activityId:'cook_together'},
};
export function locationSceneCompanionPlan(actionId:LocationSceneActionId){return companionPlans[actionId];}

export function locationSceneResidentialConnections(state:GameState):LocationSceneResidentialConnection[]{
  const connections:LocationSceneResidentialConnection[]=[];
  for(const relationship of state.relationships){
    const npc=state.npcs[relationship.npcId];if(!npc?.alive||relationship.estranged)continue;
    const household=npcHouseholdResidenceProjection(state,npc.id);if(household?.residence.placeId!=='threadwell-residential'||!household.residence.visitable)continue;
    connections.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,relationship:relationship.type.replaceAll('_',' '),residenceLabel:household.residence.label,detail:household.residence.detail,householdSize:household.memberIds.length});
  }
  return connections.sort((a,b)=>a.name.localeCompare(b.name)||a.npcId.localeCompare(b.npcId));
}

function residentialActivityForAction(actionId:LocationSceneActionId){
  if(actionId==='shared.home.hangout')return'home_hangout';
  if(actionId==='shared.home.cook')return'cook_together';
  if(actionId==='shared.home.sleepover')return'sleepover';
  return undefined;
}

export function locationSceneResidentialPlans(state:GameState,actionId:LocationSceneActionId='home.visits'):LocationSceneResidentialPlanOption[]{
  const activityId=residentialActivityForAction(actionId);const options:LocationSceneResidentialPlanOption[]=[];
  for(const relationship of state.relationships){
    const npc=state.npcs[relationship.npcId];if(!npc?.alive||relationship.estranged)continue;
    for(const plan of projectResidentialPlans(state,npc.id)){
      if(activityId&&plan.activityId!==activityId)continue;
      options.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,planId:plan.id,label:plan.label,description:plan.description,residenceLabel:plan.residenceLabel,activityId:plan.activityId,allowed:plan.allowed,...(!plan.allowed&&plan.reason?{reason:plan.reason}:{})});
    }
  }
  return options.sort((a,b)=>a.name.localeCompare(b.name)||a.label.localeCompare(b.label)||a.planId.localeCompare(b.planId));
}

export function locationSceneLabelAlignment(rect:LocationSceneRect):LocationSceneLabelAlignment{
  const center=rect[0]+rect[2]/2;
  return center<.34?'start':center>.66?'end':'center';
}

const wellnessActionMap:Partial<Record<LocationSceneActionId,keyof typeof WELLNESS_MIN_AGES>>={
  'wellness.walk':'walking','wellness.run':'running','wellness.meditate':'meditation',
};

function musicTrack(state:GameState){return state.specialCareers.music??{};}
function numberValue(value:unknown,fallback=0){return typeof value==='number'&&Number.isFinite(value)?value:fallback;}

export function coverLocationScene(width:number,height:number):LocationSceneStage{
  const safeWidth=Math.max(1,width),safeHeight=Math.max(1,height);
  const scale=Math.max(safeWidth/1024,safeHeight/1536);
  const sceneWidth=1024*scale,sceneHeight=1536*scale;
  return{left:(safeWidth-sceneWidth)/2,top:(safeHeight-sceneHeight)/2,width:sceneWidth,height:sceneHeight};
}

export function placeLocationSceneRect(rect:LocationSceneRect,stage:LocationSceneStage,minSize=48){
  const rawWidth=rect[2]*stage.width,rawHeight=rect[3]*stage.height;
  const width=Math.max(minSize,rawWidth),height=Math.max(minSize,rawHeight);
  return{
    left:stage.left+rect[0]*stage.width-(width-rawWidth)/2,
    top:stage.top+rect[1]*stage.height-(height-rawHeight)/2,
    width,height,
  };
}

export function locationScenePropRect(bounds:LocationSceneRect,stage:LocationSceneStage,width=.62,maxHeight=.32,baseline=.90){
  let normalizedWidth=width;
  let normalizedHeight=normalizedWidth*bounds[3]/bounds[2]/1.5;
  if(normalizedHeight>maxHeight){normalizedHeight=maxHeight;normalizedWidth=normalizedHeight*1.5*bounds[2]/bounds[3];}
  return{
    left:stage.left+(.5-normalizedWidth/2)*stage.width,
    top:stage.top+(baseline-normalizedHeight)*stage.height,
    width:normalizedWidth*stage.width,
    height:normalizedHeight*stage.height,
  };
}

export function locationSceneCompanions(state:GameState,actionId:LocationSceneActionId):LocationSceneCompanionOption[]{
  const plan=locationSceneCompanionPlan(actionId);if(!plan)return[];
  const candidates:LocationSceneCompanionOption[]=[];
  for(const relationship of state.relationships){
    const npc=state.npcs[relationship.npcId];if(!npc?.alive)continue;
    if(plan.kind==='shared'){
      const availability=sharedExperienceAvailability(state,npc.id,plan.placeId,plan.activityId);
      if(availability.allowed)candidates.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,detail:`${relationship.type.replaceAll('_',' ')} · relationship ${Math.round(relationship.score)}`});
    }else{
      const date=romanticDatePlanFor(state,npc.id,plan.placeId,plan.activityId);
      if(date?.allowed)candidates.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,detail:`Accepted date plan · ${date.placeLabel}`});
    }
  }
  return candidates.sort((a,b)=>a.name.localeCompare(b.name)||a.npcId.localeCompare(b.npcId));
}

export function locationSceneActionAvailability(state:GameState,actionId:LocationSceneActionId):LocationSceneAvailability{
  const definition=LOCATION_SCENE_ACTIONS[actionId];if(!definition)return{available:false,reason:'This location action is not connected.'};
  const wellness=wellnessActionMap[actionId];
  if(wellness){
    const minAge=WELLNESS_MIN_AGES[wellness];
    if(state.character.age<minAge)return{available:false,reason:`${definition.label} becomes available at age ${minAge}.`};
    const gate=actionGateStatus(state,[{policy:'wellness.total'},{policy:'wellness.activity',target:wellness}]);
    return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(locationSceneCompanionPlan(actionId)){
    const companions=locationSceneCompanions(state,actionId);
    return companions.length?{available:true}:{available:false,reason:actionId.startsWith('date.')?'No accepted eligible date is waiting for this location right now.':'No eligible person is currently available for that plan.'};
  }
  if(actionId==='home.neighbors')return{available:true};
  if(actionId==='home.visits'||actionId==='shared.home.hangout'||actionId==='shared.home.cook'||actionId==='shared.home.sleepover'){
    const plans=locationSceneResidentialPlans(state,actionId);return plans.some(plan=>plan.allowed)?{available:true}:{available:false,reason:'No eligible residential plan is available for that activity right now.'};
  }
  if(actionId==='music.practice'){
    if(state.character.age<5)return{available:false,reason:'Music practice becomes available in childhood.'};
    const gate=actionGateStatus(state,{policy:'special.training',target:'music'});
    return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='music.song'||actionId==='music.album'){
    if(state.character.age<MUSIC_RELEASE_MIN_AGE)return{available:false,reason:'Music releases become available in the teen years.'};
    const track=musicTrack(state),skill=numberValue(track.skill,state.character.talents.music*.35);
    if(skill<20)return{available:false,reason:'You need more musical skill before releasing material.'};
    const start=specialCareerStartGate(state,'music');if(!start.allowed)return{available:false,reason:start.message};
    const gate=actionGateStatus(state,{policy:'special.music_release'});
    return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='music.tour'){
    const track=musicTrack(state);const start=specialCareerStartGate(state,'music');if(!start.allowed)return{available:false,reason:start.message};
    if(numberValue(track.fanbase)<2500)return{available:false,reason:'You need a larger fanbase before touring.'};
    if(track.tourActive===true)return{available:false,reason:'You already have a tour underway. Age up to complete it before starting another.'};
    const gate=actionGateStatus(state,{policy:'special.tour',target:'music'});
    return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='music.leave'){
    const gate=specialCareerExitGate(state,'music');return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='music.retire'){
    const gate=specialCareerRetirementGate(state,'music');return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='music.catalog'||actionId==='music.partnership')return{available:true};
  if(actionId.startsWith('bank.'))return{available:true};
  if(actionId==='motors.catalog'||actionId==='motors.owned'||actionId==='motors.finance')return{available:true};
  if(actionId.startsWith('homes.'))return{available:true};
  if(actionId==='license.driving'){
    if(state.character.age<16)return{available:false,reason:'Driving licence tests unlock at age 16.'};
    if(state.travel.licenses.driving)return{available:false,reason:'You already hold a driving licence.'};
    const gate=actionGateStatus(state,{policy:'license.test',target:'driving'});
    return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  return{available:false,reason:'This location action is not connected.'};
}

export function locationSceneMusicProjection(state:GameState){
  const track=musicTrack(state);
  return{
    lifecycle:specialCareerLifecycleView(state,'music'),
    catalog:musicCatalog(state),
    offer:musicPartnershipOffer(state),
    skill:numberValue(track.skill,state.character.talents.music*.35),
    fanbase:numberValue(track.fanbase),
    distributionPartner:track.distributionPartner===true?String(track.distributionPartnerName??'distribution partner'):undefined,
  };
}

export function locationSceneMusicPartnershipDecisionAvailability(state:GameState):LocationSceneAvailability{
  const offer=musicPartnershipOffer(state);if(!offer)return{available:false,reason:'You do not have an active music partnership offer.'};
  const start=specialCareerStartGate(state,'music');if(!start.allowed)return{available:false,reason:start.message};
  const gate=actionGateStatus(state,{policy:'special.music_business'});
  return gate.allowed?{available:true}:{available:false,reason:gate.message};
}
