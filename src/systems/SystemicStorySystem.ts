import type { GameState, RelationshipType, SocialWorld, SpecialCareerState } from '../types/game';
import { SPECIAL_CAREER_STORY_RELATIONSHIPS } from '../data/specialCareerStoryEvents';
import { scheduleConsequence } from './ConsequenceSystem';

const FRIEND_ARGUMENT_VALID_TYPES:RelationshipType[]=['friend','best_friend','enemy','partner','fiance','spouse','ex'];
const CURRENT_ROMANTIC_TYPES:RelationshipType[]=['partner','fiance','spouse'];

function scheduleNpcStory(state:GameState,request:{eventId:string;storyId:string;npcId:string;years:number;requiredRelationshipTypes:RelationshipType[]}){
  return scheduleConsequence(state,{
    eventId:request.eventId,
    dueAge:state.character.age+request.years,
    payload:{npcId:request.npcId,originAge:state.character.age},
    priority:'normal',
    chainId:`phase7b1:${request.storyId}:${request.npcId}:${state.character.age}`,
    origin:{kind:'system',id:request.storyId,age:state.character.age},
    targetRefs:[{kind:'npc',id:request.npcId}],
    validity:{targetMustExist:true,targetMustBeAlive:true,requiredRelationshipTypes:request.requiredRelationshipTypes},
    dedupeKey:`phase7b1:${request.storyId}:${request.npcId}`,
  });
}

export function scheduleParentingPresenceStory(state:GameState,npcId:string){
  return scheduleNpcStory(state,{eventId:'systemic_parenting_presence_return',storyId:'parenting_presence',npcId,years:2,requiredRelationshipTypes:['child']});
}

export function scheduleFriendArgumentStory(state:GameState,npcId:string){
  return scheduleNpcStory(state,{eventId:'systemic_friend_argument_return',storyId:'friend_argument',npcId,years:2,requiredRelationshipTypes:FRIEND_ARGUMENT_VALID_TYPES});
}

export function scheduleReconciliationStory(state:GameState,npcId:string){
  return scheduleNpcStory(state,{eventId:'systemic_reconciliation_checkin',storyId:'romance_reconciliation',npcId,years:2,requiredRelationshipTypes:CURRENT_ROMANTIC_TYPES});
}

export function scheduleMarriageExpectationsStory(state:GameState,npcId:string){
  return scheduleNpcStory(state,{eventId:'systemic_marriage_expectations_return',storyId:'marriage_expectations',npcId,years:3,requiredRelationshipTypes:['spouse']});
}

export function scheduleSchoolConductStory(state:GameState,world:SocialWorld){
  return scheduleConsequence(state,{
    eventId:'systemic_school_conduct_return',
    dueAge:state.character.age+2,
    payload:{worldId:world.id,originAge:state.character.age},
    priority:'normal',
    chainId:`phase7b1:school_conduct:${world.id}:${state.character.age}`,
    origin:{kind:'system',id:'school_academic_shortcut',age:state.character.age},
    targetRefs:[{kind:'social_world',id:world.id}],
    validity:{targetMustExist:true},
    dedupeKey:`phase7b1:school_conduct:${world.id}`,
  });
}

export function schedulePropertyRenovationStory(state:GameState,propertyId:string){
  return scheduleConsequence(state,{
    eventId:'systemic_property_renovation_return',
    dueAge:state.character.age+2,
    payload:{propertyId,originAge:state.character.age},
    priority:'normal',
    chainId:`phase7b2:property_renovation:${propertyId}:${state.character.age}`,
    origin:{kind:'system',id:'property_renovation',age:state.character.age},
    targetRefs:[{kind:'property',id:propertyId}],
    validity:{targetMustExist:true},
    dedupeKey:`phase7b2:property_renovation:${propertyId}`,
  });
}

export function scheduleBusinessFounderStory(state:GameState,businessId:string){
  return scheduleConsequence(state,{
    eventId:'systemic_business_founder_return',
    dueAge:state.character.age+3,
    payload:{businessId,originAge:state.character.age},
    priority:'normal',
    chainId:`phase7b2:business_founder:${businessId}:${state.character.age}`,
    origin:{kind:'system',id:'business_founding',age:state.character.age},
    targetRefs:[{kind:'business',id:businessId}],
    validity:{targetMustExist:true},
    dedupeKey:`phase7b2:business_founder:${businessId}`,
  });
}

export function scheduleBusinessProductStory(state:GameState,businessId:string){
  return scheduleConsequence(state,{
    eventId:'systemic_business_product_return',
    dueAge:state.character.age+2,
    payload:{businessId,originAge:state.character.age},
    priority:'normal',
    chainId:`phase7b2:business_product:${businessId}:${state.character.age}`,
    origin:{kind:'system',id:'business_product_launch',age:state.character.age},
    targetRefs:[{kind:'business',id:businessId}],
    validity:{targetMustExist:true},
    dedupeKey:`phase7b2:business_product:${businessId}`,
  });
}

function scheduleWorkplaceStory(state:GameState,request:{eventId:string;storyId:string;worldId:string;npcId:string;years:number}){
  return scheduleConsequence(state,{
    eventId:request.eventId,
    dueAge:state.character.age+request.years,
    payload:{worldId:request.worldId,npcId:request.npcId,originAge:state.character.age},
    priority:'normal',
    chainId:`phase7b2:${request.storyId}:${request.worldId}:${request.npcId}:${state.character.age}`,
    origin:{kind:'system',id:request.storyId,age:state.character.age},
    targetRefs:[{kind:'social_world',id:request.worldId},{kind:'npc',id:request.npcId}],
    validity:{targetMustExist:true,targetMustBeAlive:true},
    dedupeKey:`phase7b2:${request.storyId}:${request.worldId}:${request.npcId}`,
  });
}

export function scheduleWorkplaceFeedbackStory(state:GameState,worldId:string,npcId:string){
  return scheduleWorkplaceStory(state,{eventId:'systemic_workplace_feedback_return',storyId:'workplace_feedback',worldId,npcId,years:2});
}

export function scheduleWorkplaceConcernStory(state:GameState,worldId:string,npcId:string){
  return scheduleWorkplaceStory(state,{eventId:'systemic_workplace_concern_return',storyId:'workplace_concern',worldId,npcId,years:2});
}

type Phase7B3CareerKind=Extract<keyof SpecialCareerState,'combat'|'military'|'politics'>;

function scheduleSpecialCareerEcho(state:GameState,request:{eventId:string;storyId:string;careerKind:Phase7B3CareerKind;years:number;worldId?:string;npcId?:string}){
  const targetRefs:Array<{kind:'career'|'social_world'|'npc';id:string}>=[{kind:'career',id:request.careerKind}];
  if(request.worldId)targetRefs.push({kind:'social_world',id:request.worldId});
  if(request.npcId)targetRefs.push({kind:'npc',id:request.npcId});
  return scheduleConsequence(state,{
    eventId:request.eventId,
    dueAge:state.character.age+request.years,
    payload:{careerKind:request.careerKind,originAge:state.character.age,...(request.worldId?{worldId:request.worldId}:{}),...(request.npcId?{npcId:request.npcId}:{})},
    priority:'normal',
    chainId:`phase7b3:${request.storyId}:${request.careerKind}:${request.worldId??'-'}:${request.npcId??'-'}:${state.character.age}`,
    origin:{kind:'system',id:request.storyId,age:state.character.age},
    targetRefs,
    validity:{targetMustExist:true,...(request.npcId?{targetMustBeAlive:true,requiredRelationshipTypes:SPECIAL_CAREER_STORY_RELATIONSHIPS}:{})},
    dedupeKey:`phase7b3:${request.storyId}:${request.careerKind}:${request.worldId??'-'}:${request.npcId??'-'}`,
  });
}

export function scheduleCombatTrainingEcho(state:GameState,worldId:string,coachNpcId:string){
  return scheduleSpecialCareerEcho(state,{eventId:'systemic_combat_training_return',storyId:'combat_training',careerKind:'combat',years:3,worldId,npcId:coachNpcId});
}

export function scheduleCombatBoutEcho(state:GameState,worldId:string,opponentNpcId:string){
  return scheduleSpecialCareerEcho(state,{eventId:'systemic_combat_bout_return',storyId:'combat_bout',careerKind:'combat',years:2,worldId,npcId:opponentNpcId});
}

export function scheduleMilitaryTrainingEcho(state:GameState,worldId?:string,commanderNpcId?:string){
  return scheduleSpecialCareerEcho(state,{eventId:'systemic_military_training_return',storyId:'military_training',careerKind:'military',years:3,...(worldId?{worldId}:{}),...(commanderNpcId?{npcId:commanderNpcId}:{})});
}

export function schedulePoliticsPolicyEcho(state:GameState,worldId?:string,chiefStaffNpcId?:string){
  return scheduleSpecialCareerEcho(state,{eventId:'systemic_politics_policy_return',storyId:'politics_policy',careerKind:'politics',years:2,...(worldId?{worldId}:{}),...(chiefStaffNpcId?{npcId:chiefStaffNpcId}:{})});
}

export function schedulePoliticsPressEcho(state:GameState,worldId?:string,opponentNpcId?:string){
  return scheduleSpecialCareerEcho(state,{eventId:'systemic_politics_press_return',storyId:'politics_press',careerKind:'politics',years:2,...(worldId?{worldId}:{}),...(opponentNpcId?{npcId:opponentNpcId}:{})});
}

