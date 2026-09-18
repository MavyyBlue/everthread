import { actionAllowed } from '../core/actionEconomy';
import type { LocationSceneCollegePanelActionId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import { admissionProfile, availablePrograms } from '../systems/EducationSystem';
import { locationSceneCollegeProjection } from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';

function recordStatus(record:GameState['education'][number]){
  if(record.graduated)return'Graduated';
  if(record.droppedOut)return'Left program';
  if(record.endAge!==undefined)return'Completed';
  return'Current';
}

export function CollegeLocationPanel({state,actionId,onResult}:{state:GameState;actionId:LocationSceneCollegePanelActionId;onResult:(result:EngineResult)=>void}){
  const projection=locationSceneCollegeProjection(state);
  const active=[...state.education].reverse().find(record=>!record.graduated&&!record.droppedOut&&!record.endAge);

  if(actionId==='college.admissions'){
    const programs=availablePrograms(state);
    const canApply=!active&&actionAllowed(state,{policy:'education.enroll'});
    return <div className="location-scene__school-panel">
      <div className="location-scene__status-card"><small>Admissions</small><strong>{active?'Current enrollment':'Post-secondary programs'}</strong><span>{active?`${active.major??active.stage.replaceAll('_',' ')} · ${active.institution}`:'Applications use your existing academics, conduct, activities, reputation, and prior education.'}</span></div>
      {active&&<div className="empty-card">You can compare programs here, but the existing education system will not start another program while you are already enrolled.</div>}
      <div className="list-compact">{programs.map(program=>{const profile=admissionProfile(state,program);return <button key={program.id} disabled={!canApply} onClick={()=>onResult(gameEngine.enroll(program.id))}><span><strong>{program.name}</strong><small>{program.years} years · base tuition {program.tuition.toLocaleString()} · profile {Math.round(profile.score)}/{Math.round(profile.threshold)}</small></span><b>{canApply?(profile.competitive?'Apply':'Reach'):'Unavailable'}</b></button>;})}</div>
      {!programs.length&&<div className="empty-card">No post-secondary programs currently match the existing age and readiness gates.</div>}
    </div>;
  }

  const world=projection.world;
  const college=world?.school;
  const current=projection.currentRecord;
  if(!projection.local||!world||!college||!current)return <div className="empty-card">Your current education is not based at Everthread College.</div>;

  return <div className="location-scene__school-panel">
    <div className="location-scene__status-card"><small>Current program</small><strong>{current.major??current.stage.replaceAll('_',' ')}</strong><span>{current.institution}</span></div>
    <div className="sheet-stat-grid">
      <div><small>Academic</small><strong>{Math.round(state.character.secondary.academicPerformance)}</strong></div>
      <div><small>Attendance</small><strong>{Math.round(college.attendance)}</strong></div>
      <div><small>Conduct</small><strong>{Math.round(college.conduct)}</strong></div>
      <div><small>Social standing</small><strong>{Math.round(college.socialStanding)}</strong></div>
      <div><small>Honors</small><strong>{college.honors}</strong></div>
      <div><small>Discipline</small><strong>{college.disciplinaryActions}</strong></div>
    </div>
    <div className="section-heading"><div><p className="eyebrow">Education history</p><h3>Your record</h3></div><span>{state.education.length} stages</span></div>
    <div className="stack">{[...state.education].reverse().map((record,index)=><div className="owned-card" key={`${record.stage}:${record.startAge}:${record.institution}:${index}`}><span><strong>{record.major??record.stage.replaceAll('_',' ')}</strong><small>{record.institution} · age {record.startAge}{record.endAge!==undefined?`–${record.endAge}`:''} · performance {Math.round(record.performance)}</small></span><b>{recordStatus(record)}</b></div>)}</div>
  </div>;
}
