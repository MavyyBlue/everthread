import type { GameState, RelationshipType, SocialWorld } from '../types/game';
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
