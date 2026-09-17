import { actionGateStatus } from '../core/actionEconomy';
import { LOCATION_SCENE_ACTIONS, type LocationSceneActionId, type LocationSceneRect } from '../data/locationScenes';
import { MUSIC_RELEASE_MIN_AGE } from './SpecialCareerSystem';
import { WELLNESS_MIN_AGES } from './HealthSystem';
import { specialCareerStartGate } from './CommitmentSystem';
import { specialCareerExitGate } from './SpecialCareerExitSystem';
import { specialCareerLifecycleView, specialCareerRetirementGate } from './SpecialCareerLifecycleSystem';
import { musicCatalog, musicPartnershipOffer } from './MusicCareerCycleSystem';
import { romanticDatePlanFor } from './RomanticDateSystem';
import { sharedExperienceAvailability } from './SharedExperienceSystem';
import type { GameState } from '../types/game';

export interface LocationSceneAvailability{available:boolean;reason?:string}
export interface LocationSceneCompanionOption{npcId:string;name:string;detail:string}
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
  const candidates:LocationSceneCompanionOption[]=[];
  for(const relationship of state.relationships){
    const npc=state.npcs[relationship.npcId];if(!npc?.alive)continue;
    if(actionId==='shared.park.walk'||actionId==='shared.park.play'){
      const activityId=actionId==='shared.park.walk'?'park_walk':'park_play';
      const availability=sharedExperienceAvailability(state,npc.id,'weaver-park',activityId);
      if(availability.allowed)candidates.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,detail:`${relationship.type.replaceAll('_',' ')} · relationship ${Math.round(relationship.score)}`});
    }else if(actionId==='date.park'){
      const plan=romanticDatePlanFor(state,npc.id,'weaver-park','park_walk');
      if(plan?.allowed)candidates.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,detail:'Accepted date plan · Weaver Park'});
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
  if(actionId==='shared.park.walk'||actionId==='shared.park.play'||actionId==='date.park'){
    const companions=locationSceneCompanions(state,actionId);
    return companions.length?{available:true}:{available:false,reason:actionId==='date.park'?'No accepted eligible park date is waiting right now.':'No eligible person is currently available for that plan.'};
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
