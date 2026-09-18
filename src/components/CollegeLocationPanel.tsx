import { actionAllowed } from '../core/actionEconomy';
import type { LocationSceneCollegePanelActionId } from '../data/locationScenes';
import { POST_SECONDARY_STAGES } from '../data/workingEverthread';
import { gameEngine } from '../stores/gameStore';
import { admissionProfile, availablePrograms } from '../systems/EducationSystem';
import { locationSceneCollegeProjection } from '../systems/LocationSceneSystem';
import { campusHousingAvailability, playerResidenceProjection } from '../systems/ResidentialLifeSystem';
import type { EngineResult, GameState } from '../types/game';
import { SchoolGroupList } from './SchoolGroupList';

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
    const canApply=!active&&state.character.age>=17&&actionAllowed(state,{policy:'education.enroll'});
    const collegeHistory=[...state.education].filter(record=>POST_SECONDARY_STAGES.has(record.stage)).reverse();
    return <div className="location-scene__school-panel">
      <div className="location-scene__status-card"><small>Admissions kiosk</small><strong>{active?'Current enrollment':'Post-secondary programs'}</strong><span>{active?`${active.major??active.stage.replaceAll('_',' ')} · ${active.institution}`:'Applications use your existing academics, conduct, activities, reputation, and prior education.'}</span></div>
      {active&&<div className="empty-card">You can review programs and College history here, but the education system will not start another program while you are already enrolled.</div>}
      <div className="list-compact">{programs.map(program=>{const profile=admissionProfile(state,program);return <button key={program.id} disabled={!canApply} onClick={()=>onResult(gameEngine.enroll(program.id))}><span><strong>{program.name}</strong><small>{program.years} years · base tuition {program.tuition.toLocaleString()} · profile {Math.round(profile.score)}/{Math.round(profile.threshold)}</small></span><b>{canApply?(profile.competitive?'Apply':'Reach'):'Unavailable'}</b></button>;})}</div>
      {!programs.length&&<div className="empty-card">No post-secondary programs currently match the existing age and readiness gates.</div>}
      <div className="section-heading"><div><p className="eyebrow">College history</p><h3>Your post-secondary record</h3></div><span>{collegeHistory.length} {collegeHistory.length===1?'stage':'stages'}</span></div>
      {collegeHistory.length?<div className="stack">{collegeHistory.map((record,index)=><div className="owned-card" key={`${record.stage}:${record.startAge}:${record.institution}:${index}`}><span><strong>{record.major??record.stage.replaceAll('_',' ')}</strong><small>{record.institution} · age {record.startAge}{record.endAge!==undefined?`–${record.endAge}`:''} · performance {Math.round(record.performance)}</small></span><b>{recordStatus(record)}</b></div>)}</div>:<div className="empty-card">Your College history will appear here after you begin a post-secondary program.</div>}
    </div>;
  }

  const world=projection.world;
  const current=projection.currentRecord;
  if(!projection.local||!world||!world.school||!current)return <div className="empty-card">Your current education is not based at Everthread College.</div>;

  if(actionId==='college.groups')return <SchoolGroupList state={state} world={world} onResult={onResult} heading="College groups"/>;

  const housing=state.residentialLife?.campusHousing;
  const availability=campusHousingAvailability(state);
  const residence=playerResidenceProjection(state);
  const previousHome=housing?.previousPrimaryResidencePropertyId?state.assets.properties.find(property=>property.id===housing.previousPrimaryResidencePropertyId):undefined;
  return <div className="location-scene__school-panel">
    <div className="location-scene__status-card"><small>Residence Life</small><strong>{housing?'Campus resident':'Campus housing available'}</strong><span>{housing?'Your College dorm is your current residence.':'Dorm residency is optional and included with your current Everthread College enrollment.'}</span></div>
    <div className="sheet-stat-grid">
      <div><small>Current home</small><strong>{residence.kind==='campus'?'College dorm':residence.kind.replaceAll('_',' ')}</strong></div>
      <div><small>Extra rent</small><strong>0</strong></div>
      <div><small>Housing loan</small><strong>None</strong></div>
      <div><small>Enrollment</small><strong>{current.major??current.stage.replaceAll('_',' ')}</strong></div>
    </div>
    {previousHome&&<div className="empty-card">{previousHome.name} remains your owned property while you live on campus. If it is still eligible when you move out or your enrollment ends, it becomes your home again.</div>}
    {!housing&&!availability.allowed&&<div className="warning-card">{availability.reason}</div>}
    <div className="button-row">{housing?<button onClick={()=>onResult(gameEngine.moveOutOfCollegeDorm())}>Move out of dorm</button>:<button disabled={!availability.allowed} onClick={()=>onResult(gameEngine.moveIntoCollegeDorm())}>Move into dorm</button>}</div>
    <p className="muted">Campus housing creates no property asset, rent payment, mortgage, or separate debt. Your existing assets stay yours.</p>
  </div>;
}
