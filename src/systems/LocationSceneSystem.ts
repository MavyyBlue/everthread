import { actionGateStatus } from '../core/actionEconomy';
import { LOCATION_SCENE_ACTIONS, type LocationSceneActionId, type LocationSceneCompanionPlanDefinition, type LocationSceneRect } from '../data/locationScenes';
import { crimeById } from '../data/crimes';
import { collectibleDefinitions, propertyDefinitions, vehicleDefinitions, luxuryVehicleDefinitions } from '../data/assets';
import { MUSIC_RELEASE_MIN_AGE, SPECIAL_CAREER_MIN_AGES } from './SpecialCareerSystem';
import { WELLNESS_MIN_AGES } from './HealthSystem';
import { specialCareerStartGate } from './CommitmentSystem';
import { specialCareerExitGate } from './SpecialCareerExitSystem';
import { specialCareerLifecycleView, specialCareerRetirementGate } from './SpecialCareerLifecycleSystem';
import { activePoliticsCareerWorld, politicsCareerWorldView, politicsCareerWorlds, politicsOfficeLabel } from './PoliticsCareerWorldSystem';
import { musicCatalog, musicPartnershipOffer } from './MusicCareerCycleSystem';
import { romanticDatePlanFor } from './RomanticDateSystem';
import { canDropOut } from './EducationSystem';
import { currentSchoolWorld, schoolAdmissionsFactors } from './SchoolWorldSystem';
import { businessWorkLocation, schoolInstitutionLocation, workplaceWorldLocation } from './WorkingEverthreadSystem';
import { activeWorkplaceWorlds, currentWorkplaceWorld, workplaceRecord } from './WorkplaceSystem';
import { workplaceRoleTitle } from '../data/workplaceLocations';
import { FREELANCE_MIN_AGE } from './CareerSystem';
import { projectYouthSocialPlans } from './YouthSocialSystem';
import { sharedExperienceAvailability } from './SharedExperienceSystem';
import { campusHousingAvailability } from './ResidentialLifeSystem';
import { npcHouseholdResidenceProjection, playerResidenceProjection, projectResidentialPlans } from './ResidentialLifeSystem';
import { personalInventoryCatalogForPlace, personalInventoryOwnedFromPlace } from './PersonalInventorySystem';
import type { GameState } from '../types/game';

export interface LocationSceneAvailability{available:boolean;reason?:string}
export interface LocationSceneCompanionOption{npcId:string;name:string;detail:string}
export interface LocationSceneResidentialConnection{npcId:string;name:string;relationship:string;residenceLabel:string;detail:string;householdSize:number}
export interface LocationSceneResidentialPlanOption{npcId:string;name:string;planId:string;label:string;description:string;residenceLabel:string;activityId:string;allowed:boolean;reason?:string}
export type LocationSceneCompanionPlan=LocationSceneCompanionPlanDefinition;
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
export function locationScenePersonalCatalogue(placeId:string){return personalInventoryCatalogForPlace(placeId);}
export function locationSceneOwnedPersonalItems(state:GameState,placeId:string){return personalInventoryOwnedFromPlace(state,placeId);}
export function locationSceneMallPersonalCatalogue(giftsOnly=false){
  const items=locationScenePersonalCatalogue('crossroads-mall');
  return giftsOnly?items.filter(item=>item.category==='gift'):items.filter(item=>item.category!=='gift');
}
export function locationSceneMallOwnedPersonalItems(state:GameState){return locationSceneOwnedPersonalItems(state,'crossroads-mall');}
export function locationSceneDinerPersonalCatalogue(){return locationScenePersonalCatalogue('nightjar-diner');}
export function locationSceneDinerOwnedPersonalItems(state:GameState){return locationSceneOwnedPersonalItems(state,'nightjar-diner');}
export function locationSceneMarketPersonalCatalogue(){return locationScenePersonalCatalogue('everthread-market');}
export function locationSceneMarketOwnedPersonalItems(state:GameState){return locationSceneOwnedPersonalItems(state,'everthread-market');}
export function locationSceneMallCollectibleCatalogue(){return collectibleDefinitions;}

export function locationSceneLegalProjection(state:GameState){
  const pendingCrimeId=typeof state.flags.pendingCharge==='string'?state.flags.pendingCharge:undefined;
  const history=state.legal.criminalRecord.map(record=>({record,crime:crimeById[record.crimeId]}));
  const fugitive=state.flags.fugitive===true;
  const statusLabel=state.legal.imprisoned?'In custody':fugitive?'Fugitive':pendingCrimeId?'Pending case':state.legal.investigationHeat>0?'Under scrutiny':'No active proceeding';
  return{pendingCrimeId,pendingCrime:pendingCrimeId?crimeById[pendingCrimeId]:undefined,history,convictions:history.filter(entry=>entry.record.convicted).length,fugitive,statusLabel};
}

export function locationSceneBusinessDistrictProjection(state:GameState){
  const workplace=currentWorkplaceWorld(state);const workplaceLocation=workplace?workplaceWorldLocation(workplace,state):undefined;
  const localWorkplace=Boolean(workplaceLocation?.inEverthread&&workplaceLocation.anchorPlaceId==='loomworks-business-district');
  const businesses=state.businesses.map(business=>({business,location:businessWorkLocation(state,business)}));
  return{workplace,workplaceLocation,localWorkplace,businesses,localBusinesses:businesses.filter(entry=>entry.location.inEverthread&&entry.location.anchorPlaceId==='loomworks-business-district')};
}


export function locationSceneWorkplaceProjection(state:GameState,placeId:string){
  const entries=activeWorkplaceWorlds(state).flatMap(world=>{
    const location=workplaceWorldLocation(world,state);if(!location?.inEverthread||location.anchorPlaceId!==placeId)return[];
    const record=workplaceRecord(state,world);if(!record)return[];
    return[{world,record,location,kind:world.workplace!.employmentKind,displayTitle:workplaceRoleTitle(record.jobId,record.title,location.anchorPlaceId)}];
  });
  return{placeId,entries,fullTime:entries.find(entry=>entry.kind==='full_time'),partTime:entries.filter(entry=>entry.kind==='part_time')};
}

function locationSceneEducationProjection(state:GameState,placeId:'everthread-school'|'everthread-college'){
  const currentRecord=[...state.education].reverse().find(record=>!record.graduated&&!record.droppedOut&&!record.endAge);
  const world=currentSchoolWorld(state);const institution=schoolInstitutionLocation(state);
  const local=Boolean(currentRecord&&world?.school&&institution?.inEverthread&&institution.anchorPlaceId===placeId);
  return{local,currentRecord:local?currentRecord:undefined,world:local?world:undefined,institution,factors:schoolAdmissionsFactors(state)};
}

export function locationSceneSchoolProjection(state:GameState){return locationSceneEducationProjection(state,'everthread-school');}
export function locationSceneCollegeProjection(state:GameState){return locationSceneEducationProjection(state,'everthread-college');}

function locationSceneSchoolUnavailableReason(state:GameState){
  const projection=locationSceneSchoolProjection(state);
  if(!projection.institution)return'You are not currently enrolled in school.';
  if(projection.institution.inEverthread&&projection.institution.anchorPlaceId==='everthread-college')return'Your current education is based at Everthread College.';
  if(!projection.institution.inEverthread)return`Your current school is in ${projection.institution.locationLabel}, not at Everthread Community School.`;
  return'You are not currently enrolled at Everthread Community School.';
}

function locationSceneCollegeUnavailableReason(state:GameState){
  const projection=locationSceneCollegeProjection(state);
  if(!projection.institution)return'You are not currently enrolled in a post-secondary program.';
  if(projection.institution.inEverthread&&projection.institution.anchorPlaceId==='everthread-school')return'Your current education is based at Everthread Community School.';
  if(!projection.institution.inEverthread)return`Your current education is in ${projection.institution.locationLabel}, not at Everthread College.`;
  return'You are not currently enrolled at Everthread College.';
}

export function locationSceneCompanionPlan(actionId:LocationSceneActionId){return LOCATION_SCENE_ACTIONS[actionId]?.companionPlan;}

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
  'wellness.walk':'walking','wellness.run':'running','wellness.meditate':'meditation','wellness.gym':'gym','wellness.martial':'martial_arts','wellness.diet':'diet',
};

function musicTrack(state:GameState){return state.specialCareers.music??{};}
function numberValue(value:unknown,fallback=0){return typeof value==='number'&&Number.isFinite(value)?value:fallback;}

function politicsTrack(state:GameState){return state.specialCareers.politics??{};}
function politicsCampaignLevel(actionId:LocationSceneActionId){return actionId==='politics.local'?1:actionId==='politics.regional'?3:actionId==='politics.national'?4:undefined;}
export function locationScenePoliticsCampaignBudget(actionId:LocationSceneActionId){const level=politicsCampaignLevel(actionId);return level===undefined?undefined:Math.max(5000,level*25000);}
export function locationScenePoliticsProjection(state:GameState){
  const track=politicsTrack(state),world=activePoliticsCareerWorld(state),view=world?politicsCareerWorldView(state,world):undefined;
  const office=numberValue(track.office);const approval=numberValue(track.approval,office>0?55:0);
  const history=politicsCareerWorlds(state).slice().sort((a,b)=>(b.endedAge??b.startedAge)-(a.endedAge??a.startedAge)||b.startedAge-a.startedAge||b.id.localeCompare(a.id));
  return{office,officeLabel:office>0?politicsOfficeLabel(office):'No elected office',approval,electionsWon:numberValue(track.electionsWon),status:typeof track.status==='string'?track.status:office>0?'in office':'not in office',world,view,history};
}

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
    if(actionId==='shared.school.social'){
      const schoolSocial=projectYouthSocialPlans(state,npc.id).find(option=>option.id==='school-social'&&option.allowed&&option.currentSchoolPeer);
      if(schoolSocial)candidates.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,detail:`${relationship.type.replaceAll('_',' ')} · current school peer`});
    }else if(actionId==='shared.college.social'){
      const college=locationSceneCollegeProjection(state);const member=college.world?.members.find(item=>item.npcId===npc.id&&item.role==='classmate'&&item.leftAge===undefined);
      if(member){const availability=sharedExperienceAvailability(state,npc.id,plan.placeId,plan.activityId);if(availability.allowed)candidates.push({npcId:npc.id,name:`${npc.firstName} ${npc.lastName}`,detail:`${relationship.type.replaceAll('_',' ')} · current College classmate`});}
    }else if(plan.kind==='shared'){
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
  if(actionId.startsWith('school.')||actionId==='shared.school.social'){
    const school=locationSceneSchoolProjection(state);if(!school.local)return{available:false,reason:locationSceneSchoolUnavailableReason(state)};
    if(actionId==='school.records'||actionId==='school.groups')return{available:true};
    if(actionId==='school.study'||actionId==='school.skip'){
      const gate=actionGateStatus(state,{policy:'education.effort'});return gate.allowed?{available:true}:{available:false,reason:gate.message};
    }
    if(actionId==='school.dropout')return canDropOut(state)?{available:true}:{available:false,reason:'Compulsory schooling cannot be left at your current age.'};
    if(actionId==='school.volunteer'){
      const gate=actionGateStatus(state,{policy:'school.community'});return gate.allowed?{available:true}:{available:false,reason:gate.message};
    }
    if(actionId==='shared.school.social'){
      const companions=locationSceneCompanions(state,actionId);return companions.length?{available:true}:{available:false,reason:'No eligible current school peer is available for a school social right now.'};
    }
  }
  if(actionId.startsWith('college.')){
    if(actionId==='college.admissions')return state.character.age>=17?{available:true}:{available:false,reason:'Post-secondary admissions become available at age 17.'};
    const college=locationSceneCollegeProjection(state);if(!college.local)return{available:false,reason:locationSceneCollegeUnavailableReason(state)};
    if(actionId==='college.groups')return{available:true};
    if(actionId==='college.housing'){const housing=campusHousingAvailability(state);return housing.allowed||state.residentialLife?.campusHousing?{available:true}:{available:false,reason:housing.reason};}
    if(actionId==='college.study'){
      const gate=actionGateStatus(state,{policy:'education.effort'});return gate.allowed?{available:true}:{available:false,reason:gate.message};
    }
    if(actionId==='college.dropout')return canDropOut(state)?{available:true}:{available:false,reason:'Your current program cannot be left right now.'};
  }
  if(actionId==='shared.college.social'){
    const college=locationSceneCollegeProjection(state);if(!college.local)return{available:false,reason:locationSceneCollegeUnavailableReason(state)};
    const companions=locationSceneCompanions(state,actionId);return companions.length?{available:true}:{available:false,reason:'No eligible current College classmate is available to socialize right now.'};
  }
  const companionPlan=locationSceneCompanionPlan(actionId);
  if(companionPlan){
    const companions=locationSceneCompanions(state,actionId);
    return companions.length?{available:true}:{available:false,reason:companionPlan.kind==='date'?'No scheduled eligible date is waiting here. Schedule a date from an NPC profile first.':'No eligible person is currently available for that plan.'};
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
  if(actionId==='politics.record'||actionId==='business.start'||actionId==='business.manage'||actionId==='work.role'||actionId==='work.jobs'||actionId==='work.parttime')return{available:true};
  if(actionId==='work.freelance.writing'||actionId==='work.freelance.programming'||actionId==='work.freelance.design'){
    if(state.character.age<FREELANCE_MIN_AGE)return{available:false,reason:`Freelance work becomes available at age ${FREELANCE_MIN_AGE}.`};
    const gate=actionGateStatus(state,{policy:'career.freelance'});return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='legal.case'||actionId==='legal.status'||actionId==='legal.history')return{available:true};
  if(actionId==='politics.leave'){const gate=specialCareerExitGate(state,'politics');return gate.allowed?{available:true}:{available:false,reason:gate.message};}
  const campaignLevel=politicsCampaignLevel(actionId);
  if(campaignLevel!==undefined){
    if(state.character.age<SPECIAL_CAREER_MIN_AGES.politics)return{available:false,reason:`Political campaigns become available at age ${SPECIAL_CAREER_MIN_AGES.politics}.`};
    const start=specialCareerStartGate(state,'politics');if(!start.allowed)return{available:false,reason:start.message};
    const budget=Math.max(5000,campaignLevel*25000);if(state.finances.cash<budget)return{available:false,reason:`This campaign needs at least ${budget.toLocaleString()} in available game funds.`};
    const gate=actionGateStatus(state,{policy:'special.campaign'});return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId==='politics.speech'){
    const office=numberValue(politicsTrack(state).office);if(office<=0)return{available:false,reason:'You do not currently hold elected office.'};
    const start=specialCareerStartGate(state,'politics');if(!start.allowed)return{available:false,reason:start.message};
    const gate=actionGateStatus(state,[{policy:'special.politics.total'},{policy:'special.politics.kind',target:'speech'}]);return gate.allowed?{available:true}:{available:false,reason:gate.message};
  }
  if(actionId.startsWith('bank.'))return{available:true};
  if(actionId==='motors.catalog'||actionId==='motors.owned'||actionId==='motors.finance')return{available:true};
  if(actionId.startsWith('homes.'))return{available:true};
  if(actionId.startsWith('shop.'))return{available:true};
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
