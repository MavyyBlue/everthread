import { actionAllowed } from '../core/actionEconomy';
import { gameEngine } from '../stores/gameStore';
import type { EngineResult, GameState, SocialWorld } from '../types/game';

export function SchoolGroupList({state,world,onResult,heading='School activities'}:{state:GameState;world:SocialWorld;onResult:(result:EngineResult)=>void;heading?:string}){
  const activeGroups=world.groups.filter(group=>group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined);
  const visibleGroups=world.groups.filter(group=>group.playerJoinedAge!==undefined||state.character.age>=group.minAge);
  return <div className="location-scene__school-panel">
    <div className="location-scene__status-card"><small>{heading}</small><strong>{activeGroups.length}/3 active</strong><span>Groups remain part of your persistent school world.</span></div>
    <div className="school-group-list">{visibleGroups.map(group=>{
      const joined=group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined;
      const canJoin=!joined&&activeGroups.length<3&&state.character.age>=group.minAge&&actionAllowed(state,[{policy:'school.group.join'},{policy:'school.group.join.target',target:group.id}]);
      const canAttend=joined&&actionAllowed(state,[{policy:'school.group.activity.total'},{policy:'school.group.activity.target',target:group.id}]);
      return <article className={`school-group-card ${joined?'joined':''}`} key={group.id}>
        <div><strong>{group.name}</strong><small>{group.kind} · {group.memberNpcIds.length} recurring people{joined?` · ${group.playerRole??'member'}`:''}</small></div>
        <div className="school-group-actions">{joined?<><button disabled={!canAttend} onClick={()=>onResult(gameEngine.attendSchoolGroup(group.id))}>{canAttend?'Participate':'Done this year'}</button><button className="secondary-button" onClick={()=>onResult(gameEngine.leaveSchoolGroup(group.id))}>Leave</button></>:<button disabled={!canJoin} onClick={()=>onResult(gameEngine.joinSchoolGroup(group.id))}>{canJoin?'Join':'Unavailable'}</button>}</div>
      </article>;
    })}</div>
  </div>;
}
