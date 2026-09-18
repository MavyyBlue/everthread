import type { LocationSceneSchoolPanelActionId } from '../data/locationScenes';
import { locationSceneSchoolProjection } from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';
import { SchoolGroupList } from './SchoolGroupList';

function recordStatus(record:GameState['education'][number]){
  if(record.graduated)return'Graduated';
  if(record.droppedOut)return'Left program';
  if(record.endAge!==undefined)return'Completed';
  return'Current';
}

export function SchoolLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneSchoolPanelActionId;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneSchoolProjection(state);
  const world=projection.world;
  const school=world?.school;
  const current=projection.currentRecord;
  if(!projection.local||!world||!school||!current)return <div className="empty-card">Your current education is not based at Everthread Community School.</div>;

  if(actionId==='school.records')return <div className="location-scene__school-panel">
    <div className="location-scene__status-card"><small>Current school stage</small><strong>{current.major??current.stage.replaceAll('_',' ')}</strong><span>{current.institution}</span></div>
    <div className="sheet-stat-grid">
      <div><small>Academic</small><strong>{Math.round(state.character.secondary.academicPerformance)}</strong></div>
      <div><small>Attendance</small><strong>{Math.round(school.attendance)}</strong></div>
      <div><small>Conduct</small><strong>{Math.round(school.conduct)}</strong></div>
      <div><small>Social standing</small><strong>{Math.round(school.socialStanding)}</strong></div>
      <div><small>Honors</small><strong>{school.honors}</strong></div>
      <div><small>Discipline</small><strong>{school.disciplinaryActions}</strong></div>
    </div>
    <div className="section-heading"><div><p className="eyebrow">Education history</p><h3>Your record</h3></div><span>{state.education.length} stages</span></div>
    <div className="stack">{[...state.education].reverse().map((record,index)=><div className="owned-card" key={`${record.stage}:${record.startAge}:${record.institution}:${index}`}><span><strong>{record.major??record.stage.replaceAll('_',' ')}</strong><small>{record.institution} · age {record.startAge}{record.endAge!==undefined?`–${record.endAge}`:''} · performance {Math.round(record.performance)}</small></span><b>{recordStatus(record)}</b></div>)}</div>
  </div>;

  return <SchoolGroupList state={state} world={world} onResult={onResult}/>;
}
