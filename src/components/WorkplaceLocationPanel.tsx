import { actionAllowed } from '../core/actionEconomy';
import { formatMoney } from '../core/format';
import { gameEngine } from '../stores/gameStore';
import { locationSceneWorkplaceProjection } from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';

export function WorkplaceLocationPanel({state,placeId,onResult}:{state:GameState;placeId:string;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneWorkplaceProjection(state,placeId);
  if(!projection.entries.length)return <div className="empty-card">You do not currently work at this location.</div>;
  return <div className="stack">
    {projection.entries.map(entry=>{
      const {world,record,kind}=entry;const workplace=world.workplace!;const isPartTime=kind==='part_time';const hours='hoursPerWeek' in record?record.hoursPerWeek:undefined;
      const members=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);const manager=workplace.managerNpcId?state.npcs[workplace.managerNpcId]:undefined;
      const relation=(npcId:string)=>state.relationships.find(item=>item.npcId===npcId&&!item.estranged);
      const harderAllowed=isPartTime?actionAllowed(state,{policy:'career.part_time.work_harder',target:workplace.employmentKey}):actionAllowed(state,{policy:'career.work_harder'});
      const raiseAllowed=isPartTime?actionAllowed(state,{policy:'career.part_time.raise',target:workplace.employmentKey}):actionAllowed(state,{policy:'career.raise'});
      const canWorkActivity=actionAllowed(state,{policy:'workplace.activity.total'});
      const canFeedback=Boolean(manager&&actionAllowed(state,{policy:'workplace.feedback',target:world.id}));
      return <section className="action-card" key={world.id}>
        <div className="section-heading"><div><p className="eyebrow">{isPartTime?'Part-time workplace':'Your workplace'}</p><h3>{entry.displayTitle}</h3></div><strong>{formatMoney(record.salary)}/yr</strong></div>
        <p>{record.company}{hours?` · ${hours} hrs/week`:''}</p>
        <div className="sheet-stat-grid"><div><small>Performance</small><strong>{Math.round(record.performance)}</strong></div><div><small>Morale</small><strong>{Math.round(workplace.morale)}</strong></div><div><small>Tension</small><strong>{Math.round(workplace.tension)}</strong></div><div><small>Reputation</small><strong>{Math.round(workplace.reputation)}</strong></div></div>
        <div className="button-row">
          <button disabled={!harderAllowed} onClick={()=>onResult(isPartTime?gameEngine.workHarderPartTime(record.jobId):gameEngine.workHarder())}>{harderAllowed?'Work harder':'Extra effort used'}</button>
          <button disabled={!raiseAllowed} onClick={()=>onResult(isPartTime?gameEngine.askPartTimeRaise(record.jobId):gameEngine.askForRaise())}>{raiseAllowed?'Ask for a raise':'Raise requested'}</button>
          <button className="danger-soft" onClick={()=>onResult(isPartTime?gameEngine.quitPartTimeJob(record.jobId):gameEngine.resign())}>{isPartTime?'Quit shift':'Resign'}</button>
        </div>
        <div className="button-row">
          <button disabled={!canWorkActivity||!actionAllowed(state,{policy:'workplace.activity.kind',target:'collaborate'})} onClick={()=>onResult(gameEngine.collaborateAtWork(world.id))}>Collaborate</button>
          <button disabled={!canWorkActivity||!actionAllowed(state,{policy:'workplace.activity.kind',target:'network'})} onClick={()=>onResult(gameEngine.networkAtWork(world.id))}>Network</button>
          <button disabled={!canFeedback} onClick={()=>onResult(gameEngine.askBossFeedback(world.id))}>Boss feedback</button>
        </div>
        <div className="sheet-section">
          <div className="section-heading"><div><p className="eyebrow">Your team</p><h3>{world.name}</h3></div><span>{Math.max(0,members.length-1)} coworkers</span></div>
          <p className="muted">{workplace.department}{manager?` · Manager: ${manager.firstName} ${manager.lastName}`:''}. These are the same persistent people shown in Threadspace → Work.</p>
          <div className="list-compact">{members.slice(0,10).map(member=>{const npc=state.npcs[member.npcId]!;const rel=relation(npc.id);const role=member.role==='boss'?'Manager':member.role==='direct_report'?'Direct report':'Coworker';const canTalk=actionAllowed(state,[{policy:'social.npc.total',target:npc.id},{policy:'social.npc.action',target:`${npc.id}:conversation`}]);const canSpend=actionAllowed(state,[{policy:'social.npc.total',target:npc.id},{policy:'social.npc.action',target:`${npc.id}:spend_time`}]);return <article className="school-group-card" key={npc.id}><div><strong>{npc.firstName} {npc.lastName}</strong><small>{role} · chemistry {Math.round(rel?.score??50)}</small></div><div className="school-group-actions"><button className="secondary-button" disabled={!canTalk} onClick={()=>onResult(gameEngine.interactWithCharacter(npc.id,'conversation'))}>Talk</button><button disabled={!canSpend} onClick={()=>onResult(gameEngine.interactWithCharacter(npc.id,'spend_time'))}>Build chemistry</button></div></article>;})}</div>
        </div>
      </section>;
    })}
  </div>;
}
