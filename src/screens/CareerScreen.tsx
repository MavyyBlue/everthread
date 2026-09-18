import { useLayoutEffect, useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { SearchField } from '../components/SearchField';
import { workplaceRoleTitle } from '../data/workplaceLocations';
import { SpecialCareerWorldPanel } from '../components/SpecialCareerWorldPanel';
import { gameEngine } from '../stores/gameStore';
import { availableJobOffers } from '../systems/CareerSystem';
import { admissionProfile, availablePrograms, canDropOut } from '../systems/EducationSystem';
import { currentSchoolWorld, schoolAdmissionsFactors } from '../systems/SchoolWorldSystem';
import { availablePartTimeJobOffers, currentWorkplaceWorld, partTimeHourLimit, totalPartTimeHours, workplaceForCareerRecord } from '../systems/WorkplaceSystem';
import { formatMoney } from '../core/format';
import { actionAllowed } from '../core/actionEconomy';
import { MiniGameOverlay } from '../minigames/MiniGameOverlay';
import { relatedMiniGameSkill, skipMiniGame, type MiniGameKind } from '../minigames/framework';
import {
  fullTimeJobGate,
  isSpecialCareerPathActive,
  partTimeJobGate,
  schoolEnrollmentGate,
  specialCareerCapacity,
  specialCareerPathLabel,
  specialCareerStartGate,
  type SpecialCareerPathKey,
} from '../systems/CommitmentSystem';
import { specialCareerExitGate } from '../systems/SpecialCareerExitSystem';
import { specialCareerLifecycleView, specialCareerLifecycleViews, specialCareerRetirementGate, type DeepCareerPath } from '../systems/SpecialCareerLifecycleSystem';
import { sportsContractOffer } from '../systems/SportsCareerCycleSystem';
import { careerActionVfx, type ActionResultHandler, type ActionVfxKind } from '../core/actionVfx';
import { careerDisclosure, schoolGroupAgeVisible, specialActionAgeVisible, specialPathAgeVisible } from './progressiveDisclosure';
import { InstitutionRouteBanner } from '../components/InstitutionRouteBanner';
import type { InstitutionRouteRequest, InstitutionSpecialPathFocus } from '../core/institutionRouting';
import { schoolInstitutionLocation, workplaceWorldLocation } from '../systems/WorkingEverthreadSystem';

const DEEP_CAREER_KEYS=new Set<SpecialCareerPathKey>(['acting','music','sports','modeling','racing','directing']);
function isDeepCareerKey(key:SpecialCareerPathKey):key is DeepCareerPath{return DEEP_CAREER_KEYS.has(key);}

export function CareerScreen({state,onResult,routeRequest,onReturnToMap}:{state:GameState;onResult:ActionResultHandler;routeRequest?:InstitutionRouteRequest;onReturnToMap?:()=>void}){
  const routed=routeRequest?.resolved.tab==='career'?routeRequest:undefined;
  const routeView=routed?.resolved.tab==='career'?routed.resolved:undefined;
  const[tab,setTab]=useState<'work'|'education'|'special'>(routeView?.careerTab??'work');
  const[q,setQ]=useState('');
  const visibility=careerDisclosure(state);
  const fullTimeAvailability=fullTimeJobGate(state);
  const partTimeAvailability=partTimeJobGate(state);
  const enrollmentAvailability=schoolEnrollmentGate(state);
  const jobs=fullTimeAvailability.allowed?availableJobOffers(state).filter(offer=>`${offer.title} ${offer.job.industry} ${offer.placeLabel??''}`.toLowerCase().includes(q.toLowerCase())).slice(0,80):[];
  const programs=availablePrograms(state).filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));
  const currentStudy=[...state.education].reverse().find(e=>!e.graduated&&!e.droppedOut&&!e.endAge);
  const school=currentSchoolWorld(state);
  const schoolFactors=schoolAdmissionsFactors(state);
  const workedHarder=!actionAllowed(state,{policy:'career.work_harder'});
  const raiseAsked=!actionAllowed(state,{policy:'career.raise'});
  const canStartJob=fullTimeAvailability.allowed&&actionAllowed(state,{policy:'career.job_start'});
  const canFreelance=actionAllowed(state,{policy:'career.freelance'});
  const canSchoolEffort=actionAllowed(state,{policy:'education.effort'});
  const canEnroll=enrollmentAvailability.allowed&&actionAllowed(state,{policy:'education.enroll'});
  const canSchoolRisk=actionAllowed(state,{policy:'school.risk'});
  const canSchoolCommunity=actionAllowed(state,{policy:'school.community'});
  const activeGroups=school?.groups.filter(group=>group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined)??[];
  const workplace=currentWorkplaceWorld(state);
  const workLocation=workplace?workplaceWorldLocation(workplace,state):undefined;
  const schoolLocation=schoolInstitutionLocation(state);
  const manager=workplace?.workplace?.managerNpcId?state.npcs[workplace.workplace.managerNpcId]:undefined;
  const activeWorkMembers=workplace?.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive)??[];
  const partTimeOptions=partTimeAvailability.allowed?availablePartTimeJobOffers(state):[];
  const partTimeHours=totalPartTimeHours(state);
  const partTimeLimit=partTimeHourLimit(state);
  const canWorkActivity=actionAllowed(state,{policy:'workplace.activity.total'});
  const canBossFeedback=workplace?actionAllowed(state,{policy:'workplace.feedback',target:workplace.id}):false;
  const routeAnchor=routeView?.specialPath?`special-${routeView.specialPath}`:routeView?.careerAnchor;
  useLayoutEffect(()=>{if(!routeAnchor)return;const frame=requestAnimationFrame(()=>{const exact=document.querySelector(`[data-institution-anchor=\"${routeAnchor}\"]`);const fallback=routeAnchor==='education-admissions'?document.querySelector('[data-institution-anchor=\"education-current\"]'):undefined;(exact??fallback)?.scrollIntoView({block:'start'});});return()=>cancelAnimationFrame(frame);},[routeAnchor,tab]);

  return <main className="screen">
    <div className="screen-title"><div><p className="eyebrow">Work & learning</p><h1>Career</h1></div></div>
    <InstitutionRouteBanner request={routed} onBackToMap={onReturnToMap}/>
    <div className="segmented segmented--sticky"><button className={tab==='work'?'active':''} onClick={()=>setTab('work')}>Work</button><button className={tab==='education'?'active':''} onClick={()=>setTab('education')}>Education</button><button className={tab==='special'?'active':''} onClick={()=>setTab('special')}>Life Paths</button></div>

    {tab==='work'&&<><div className="institution-route-anchor institution-route-anchor--marker" data-institution-anchor="work-market" aria-hidden="true"/>
      {(state.employment.current||visibility.fullTimeWork)&&<section className="hero-card">{state.employment.current?<><p className="eyebrow">Current role</p><h2>{workplaceRoleTitle(state.employment.current.jobId,state.employment.current.title,workLocation?.anchorPlaceId)}</h2><p>{state.employment.current.company} · {formatMoney(state.employment.current.salary)}/year</p>{workLocation&&<p className="muted">Based in {workLocation.locationLabel}.</p>}<div className="sheet-stat-grid"><div><small>Performance</small><strong>{Math.round(state.employment.current.performance)}</strong></div><div><small>Level</small><strong>{state.employment.current.level}</strong></div><div><small>Stress</small><strong>{Math.round(state.character.secondary.stress)}</strong></div></div><div className="button-row"><button disabled={workedHarder} onClick={()=>onResult(gameEngine.workHarder())}>{workedHarder?'Extra effort used':'Work harder'}</button><button disabled={raiseAsked} onClick={()=>onResult(gameEngine.askForRaise())}>{raiseAsked?'Raise requested':'Ask raise'}</button><button className="danger-soft" onClick={()=>onResult(gameEngine.resign())}>Resign</button></div></>:<><p className="eyebrow">Current role</p><h2>Unemployed</h2><p>Qualified listings update from your age, education, stats, and legal history.</p></>}</section>}
      {workplace?.workplace&&<section className="school-world-card workplace-world-card"><div className="section-heading"><div><p className="eyebrow">Persistent workplace</p><h2>{workplace.name}</h2></div><span>{activeWorkMembers.filter(member=>member.role!=='boss').length} coworkers</span></div><p>{workplace.workplace.department}{manager?` · Manager: ${manager.firstName} ${manager.lastName}`:''}</p>{workLocation&&<p className="muted">Workplace location: {workLocation.locationLabel}.</p>}<div className="sheet-stat-grid"><div><small>Morale</small><strong>{Math.round(workplace.workplace.morale)}</strong></div><div><small>Culture</small><strong>{Math.round(workplace.workplace.culture)}</strong></div><div><small>Tension</small><strong>{Math.round(workplace.workplace.tension)}</strong></div><div><small>Reputation</small><strong>{Math.round(workplace.workplace.reputation)}</strong></div></div><p className="muted">Coworkers and managers persist in People → Work even after friendships, rivalries, promotions, or job changes.</p><div className="button-row"><button disabled={!canWorkActivity||!actionAllowed(state,{policy:'workplace.activity.kind',target:'collaborate'})} onClick={()=>onResult(gameEngine.collaborateAtWork())}>Collaborate</button><button disabled={!canWorkActivity||!actionAllowed(state,{policy:'workplace.activity.kind',target:'network'})} onClick={()=>onResult(gameEngine.networkAtWork())}>Network</button><button disabled={!canBossFeedback} onClick={()=>onResult(gameEngine.askBossFeedback())}>Boss feedback</button></div></section>}
      {state.character.age>=50&&<button className="full-button" onClick={()=>onResult(gameEngine.retire())}>Retire from working life</button>}
      {visibility.fullTimeWork&&<><div className="section-heading"><h2>Job market</h2><span>{jobs.length} shown</span></div>
      {!fullTimeAvailability.allowed?<div className="empty-card">{fullTimeAvailability.message}</div>:<><SearchField value={q} onChange={setQ} placeholder="Search qualified jobs"/><div className="list-compact">{jobs.map(offer=><button key={offer.offerId} disabled={!canStartJob||!actionAllowed(state,[{policy:'career.application.total'},{policy:'career.application.job',target:offer.offerId}])} onClick={()=>onResult(gameEngine.applyForJob(offer.job.id,offer.placeId))}><span><strong>{offer.title}</strong><small>{offer.placeLabel?`${offer.placeLabel} · `:''}{offer.job.industry} · {offer.job.salaryRange[0].toLocaleString()}–{offer.job.salaryRange[1].toLocaleString()}</small></span><b>Apply</b></button>)}</div></>}</>}
      {visibility.partTimeWork&&<section className="action-card"><div className="section-heading"><div><p className="eyebrow">Flexible work</p><h2>Part-time jobs</h2></div><span>{partTimeHours}/{partTimeLimit} hrs/week</span></div>{(state.employment.partTimeJobs??[]).map(record=>{const world=workplaceForCareerRecord(state,record,'part_time');const location=world?workplaceWorldLocation(world,state):undefined;return <article className="school-group-card joined" key={`${record.jobId}-${record.startAge}`}><div><strong>{workplaceRoleTitle(record.jobId,record.title,location?.anchorPlaceId)}</strong><small>{record.company} · {record.hoursPerWeek} hrs/week · {formatMoney(record.salary)}/year · performance {Math.round(record.performance)}</small>{location?<small>Based in {location.locationLabel}</small>:null}</div><div className="school-group-actions"><button className="secondary-button" onClick={()=>onResult(gameEngine.quitPartTimeJob(record.jobId))}>Quit</button></div></article>;})}{!partTimeAvailability.allowed&&<p className="muted">{partTimeAvailability.message}{(state.employment.partTimeJobs??[]).length?' Existing jobs are preserved until you choose to leave them.':''}</p>}{partTimeAvailability.allowed&&partTimeOptions.slice(0,12).map(offer=>{const canStart=(state.employment.partTimeJobs??[]).length<3&&partTimeHours+10<=partTimeLimit&&actionAllowed(state,[{policy:'career.part_time.start'},{policy:'career.part_time.job',target:offer.offerId}]);return <article className="school-group-card" key={offer.offerId}><div><strong>{offer.title}</strong><small>{offer.placeLabel?`${offer.placeLabel} · `:''}{offer.job.industry} · 10 hrs/week · about {formatMoney(offer.job.hourlyRate*10*52)}/year before local wage scaling</small></div><div className="school-group-actions"><button disabled={!canStart} onClick={()=>onResult(gameEngine.startPartTimeJob(offer.job.id,10,offer.placeId))}>Apply</button></div></article>})}</section>}
      {visibility.freelance&&<section className="action-card"><h2>Freelance</h2><div className="action-grid">{['writing','programming','design'].map(k=><button key={k} disabled={!canFreelance} onClick={()=>onResult(gameEngine.performActivity(`freelance_${k}`))}>{k}</button>)}</div></section>}
      {!visibility.fullTimeWork&&!visibility.partTimeWork&&!visibility.freelance&&<div className="empty-card">Work opportunities will appear here as they become age-appropriate.</div>}
    </>}

    {tab==='education'&&<><div className="institution-route-anchor institution-route-anchor--marker" data-institution-anchor="education-current" aria-hidden="true"/>
      {routeView?.careerAnchor==='education-admissions'&&state.character.age<17&&<div className="empty-card institution-route-focus">Post-secondary admissions are not available at this life stage yet. The college remains on the map, while Education keeps the existing age and enrollment rules.</div>}
      {currentStudy&&<section className="hero-card"><p className="eyebrow">Currently enrolled</p><h2>{currentStudy.major??currentStudy.stage.replaceAll('_',' ')}</h2><p>{currentStudy.institution}</p>{schoolLocation&&<p className="muted">Campus: {schoolLocation.locationLabel}.</p>}<div className="sheet-stat-grid"><div><small>Academic</small><strong>{Math.round(state.character.secondary.academicPerformance)}</strong></div><div><small>Involvement</small><strong>{Math.round(schoolFactors.involvement)}</strong></div><div><small>Honors</small><strong>{schoolFactors.honors}</strong></div></div><div className="button-row"><button disabled={!canSchoolEffort} onClick={()=>onResult(gameEngine.performActivity('study'))}>{canSchoolEffort?'Study harder':'Effort used'}</button><button disabled={!canSchoolEffort} onClick={()=>onResult(gameEngine.performActivity('skip_class'))}>Skip class</button><button className="danger-soft" disabled={!canDropOut(state)} onClick={()=>onResult(gameEngine.dropOut())}>{canDropOut(state)?'Drop out':'Compulsory school'}</button></div></section>}
      {school?.school&&<section className="school-world-card"><div className="section-heading"><div><p className="eyebrow">Persistent school world</p><h2>{school.name}</h2></div><span>{school.members.filter(member=>member.role==='classmate').length} classmates</span></div><div className="sheet-stat-grid"><div><small>Attendance</small><strong>{Math.round(school.school.attendance)}</strong></div><div><small>Conduct</small><strong>{Math.round(school.school.conduct)}</strong></div><div><small>Social standing</small><strong>{Math.round(school.school.socialStanding)}</strong></div><div><small>Discipline</small><strong>{school.school.disciplinaryActions}</strong></div></div><p className="muted">Teachers, classmates, leadership, memories, and activity groups persist beyond this school stage and appear in People → School.</p><div className="button-row"><button disabled={!canSchoolCommunity} onClick={()=>onResult(gameEngine.performActivity('school_volunteer'))}>Volunteer</button>{visibility.academicShortcut&&<button className="danger-soft" disabled={!canSchoolRisk} onClick={()=>onResult(gameEngine.performActivity('school_cheat'))}>Academic shortcut</button>}</div></section>}
      {school&&<section className="action-card"><div className="section-heading"><div><p className="eyebrow">Clubs, teams & groups</p><h2>School activities</h2></div><span>{activeGroups.length}/3 active</span></div><div className="school-group-list">{school.groups.filter(group=>schoolGroupAgeVisible(state.character.age,group.minAge,group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined)).map(group=>{const joined=group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined;const canJoin=activeGroups.length<3&&state.character.age>=group.minAge&&actionAllowed(state,[{policy:'school.group.join'},{policy:'school.group.join.target',target:group.id}]);const canAttend=joined&&actionAllowed(state,[{policy:'school.group.activity.total'},{policy:'school.group.activity.target',target:group.id}]);return <article className={`school-group-card ${joined?'joined':''}`} key={group.id}><div><strong>{group.name}</strong><small>{group.kind} · {group.memberNpcIds.length} recurring people{joined?` · ${group.playerRole??'member'}`:''}</small></div><div className="school-group-actions">{joined?<><button disabled={!canAttend} onClick={()=>onResult(gameEngine.attendSchoolGroup(group.id))}>{canAttend?'Participate':'Done this year'}</button><button className="secondary-button" onClick={()=>onResult(gameEngine.leaveSchoolGroup(group.id))}>Leave</button></>:<button disabled={!canJoin} onClick={()=>onResult(gameEngine.joinSchoolGroup(group.id))}>Join</button>}</div></article>})}</div></section>}
      {!currentStudy&&state.character.age>=17&&<><div className="section-heading institution-route-anchor" data-institution-anchor="education-admissions"><div><p className="eyebrow">Admissions</p><h2>Post-secondary programs</h2></div><span>{programs.length} options</span></div><p className="muted">Admissions now consider academics, intelligence, conduct, activities, school standing, discipline, and reputation. Strong school involvement can matter without replacing academic requirements.</p>{!enrollmentAvailability.allowed&&<div className="empty-card">{enrollmentAvailability.message}</div>}<SearchField value={q} onChange={setQ} placeholder="Search education"/><div className="list-compact">{programs.map(program=>{const profile=admissionProfile(state,program);return <button key={program.id} disabled={!canEnroll} onClick={()=>onResult(gameEngine.enroll(program.id))}><span><strong>{program.name}</strong><small>{program.years} years · base tuition {program.tuition.toLocaleString()} · profile {Math.round(profile.score)}/{Math.round(profile.threshold)}</small></span><b>{profile.competitive?'Apply':'Reach'}</b></button>})}</div></>}
      <section className="action-card"><h2>Education history</h2>{state.education.map((e,i)=><p className="history-line" key={`${e.stage}-${e.startAge}-${i}`}><span><strong>{e.stage.replaceAll('_',' ')}</strong><small>{e.institution}{e.scholarship?` · ${Math.round((e.scholarshipPercent??0)*100)}% scholarship`:''}</small></span><span>{e.graduated?'Graduated':e.droppedOut?'Dropped out':'In progress'}</span></p>)}</section>
    </>}

    {tab==='special'&&<><SpecialCareerWorldPanel state={state} onResult={onResult}/><SpecialPaths state={state} onResult={onResult} focusPath={routeView?.specialPath}/></>}
  </main>;
}

function SpecialPaths({state,onResult,focusPath}:{state:GameState;onResult:ActionResultHandler;focusPath?:InstitutionSpecialPathFocus}){
  const[challenge,setChallenge]=useState<{kind:MiniGameKind;run:(score:number)=>EngineResult;vfx?:ActionVfxKind}>();
  const launchChallenge=(kind:MiniGameKind,run:(score:number)=>EngineResult,vfx?:ActionVfxKind):EngineResult|void=>{if(!state.settings.minigames){const resolved=skipMiniGame(state,kind,relatedMiniGameSkill(state,kind));return run(resolved.score);}setChallenge({kind,run,vfx});};
  const capacity=specialCareerCapacity(state);
  const lifecycle=specialCareerLifecycleViews(state);const inactiveLifecycle=lifecycle.filter(view=>!view.activeCommitment&&(view.leftPath||view.retired));
  const actingLife=specialCareerLifecycleView(state,'acting');const musicLife=specialCareerLifecycleView(state,'music');const sportsLife=specialCareerLifecycleView(state,'sports');const modelingLife=specialCareerLifecycleView(state,'modeling');const racingLife=specialCareerLifecycleView(state,'racing');const directingLife=specialCareerLifecycleView(state,'directing');
  const pathActive=(key:SpecialCareerPathKey)=>isSpecialCareerPathActive(state,key);
  const startBlocked=(key:SpecialCareerPathKey)=>!specialCareerStartGate(state,key).allowed;
  const training=(target:string)=>!actionAllowed(state,{policy:'special.training',target});
  const publicMove=(kind:string)=>!actionAllowed(state,[{policy:'special.politics.total'},{policy:'special.politics.kind',target:kind}]);
  const modelMove=(kind:string)=>!actionAllowed(state,[{policy:'special.model.total'},{policy:'special.model.kind',target:kind}]);
  const crimeOrgMove=(kind:string)=>!actionAllowed(state,[{policy:'special.crime_org.total'},{policy:'special.crime_org.kind',target:kind}]);
  const sportsTrack=state.specialCareers.sports;const renewal=sportsContractOffer(state);
  const sportsSeasons=Number(sportsTrack?.seasonsPlayed??0);const sportsRetired=sportsTrack?.retired===true;const sportsActive=pathActive('sports');const racingActive=pathActive('racing');
  const focusedPathVisible=!focusPath||specialPathAgeVisible(state,focusPath);
  return <>
    <section className="action-card"><div className="section-heading"><div><p className="eyebrow">Major commitments</p><h2>Special-career capacity</h2></div><span>{capacity.active.length}/{capacity.limit} active</span></div><p>{capacity.inSchool?'School leaves room for one active special-career path. Regular and part-time jobs are unavailable while you balance both.':'Outside school, you can pursue up to two active special-career paths at once.'}</p>{capacity.active.length>0&&<div className="stack">{capacity.active.map(key=>{const exit=specialCareerExitGate(state,key);const deep=isDeepCareerKey(key);const life=deep?specialCareerLifecycleView(state,key):undefined;const retirement=deep&&life?.established?specialCareerRetirementGate(state,key as DeepCareerPath):undefined;const retire=deep?()=>gameEngine.retireSpecialCareer(key as DeepCareerPath):undefined;return <article className="school-group-card joined" key={`active-${key}`}><div><strong>{specialCareerPathLabel(key)}</strong><small>{life?`${life.status} · `:''}{exit.allowed?'You may step away now. Completed history will remain.':exit.message}</small></div><div className="school-group-actions"><button className="secondary-button" disabled={!exit.allowed} onClick={()=>onResult(gameEngine.leaveSpecialCareer(key))}>Leave Path</button>{retirement&&retire&&<button className="danger-soft" disabled={!retirement.allowed} onClick={()=>onResult(retire())}>Retire</button>}</div></article>})}</div>}{inactiveLifecycle.length>0&&<div className="stack">{inactiveLifecycle.map(view=>{const gate=specialCareerStartGate(state,view.key);const detail=view.retirementFinal?'Final retirement. Career history remains available.':gate.allowed?`${view.retired?'Comeback':'Return'} available through your next successful professional action below.`:gate.message;return <article className="school-group-card" key={`inactive-${view.key}`}><div><strong>{view.label}</strong><small>{view.status} · {detail}</small></div></article>})}</div>}{capacity.overLimit&&<p className="muted">This older save is above the new limit. Existing paths are preserved and remain playable, but no additional special career can begin until you are back within capacity.</p>}</section>
    {focusPath&&!focusedPathVisible&&<div className="empty-card institution-route-focus">{specialCareerPathLabel(focusPath)} is not available at this life stage yet. The location remains visible on the map, while Career keeps the existing eligibility gate.</div>}
    {renewal&&<section className="action-card"><div className="section-heading"><div><p className="eyebrow">Sports contract decision</p><h2>{renewal.team}</h2></div><span>expires after age {renewal.expiresAge}</span></div><p>{renewal.years} year{renewal.years===1?'':'s'} · {formatMoney(renewal.salary)}/year. Your previous term is complete, so you may accept, decline into free agency, or leave Professional sports above.</p><div className="button-row"><button disabled={!actionAllowed(state,{policy:'special.pro_contract'})} onClick={()=>onResult(gameEngine.sportsContract('accept'),{primary:careerActionVfx('sports'),derive:true})}>Accept renewal</button><button className="secondary-button" disabled={!actionAllowed(state,{policy:'special.pro_contract'})} onClick={()=>onResult(gameEngine.sportsContract('decline'))}>Decline</button></div></section>}
    <div className="special-paths">
      {specialPathAgeVisible(state,'acting')&&<Path routeId="acting" focused={focusPath==='acting'} title="Acting" stat={`${actingLife.status} · Skill ${Math.round(Number(state.specialCareers.acting?.skill??0))}`} actions={[
        ['Lesson',()=>gameEngine.actingLesson(),training('acting')||(state.character.age>=18&&state.finances.cash<120)],
        ['Find agent',()=>gameEngine.actingAgent(),startBlocked('acting')||Number(state.specialCareers.acting?.agent??0)>=1],
        ['Audition',()=>launchChallenge('acting',score=>gameEngine.actingAudition(score),careerActionVfx('acting')),startBlocked('acting')||!actionAllowed(state,{policy:'special.audition'}),specialActionAgeVisible(state,'acting','Audition')],
      ]} vfx={careerActionVfx('acting')} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'music')&&<Path routeId="music" focused={focusPath==='music'} title="Music" stat={`${musicLife.status} · Skill ${Math.round(Number(state.specialCareers.music?.skill??0))}`} actions={[
        ['Practice vocals',()=>gameEngine.musicPractice('vocals'),training('music')],
        ['Release song',()=>gameEngine.musicRelease('song'),startBlocked('music')||!actionAllowed(state,{policy:'special.music_release'}),specialActionAgeVisible(state,'music','Release song')],
        ['Release album',()=>gameEngine.musicRelease('album'),startBlocked('music')||!actionAllowed(state,{policy:'special.music_release'}),specialActionAgeVisible(state,'music','Release album')],
        ['Tour',()=>gameEngine.musicTour(),startBlocked('music')||!actionAllowed(state,{policy:'special.tour',target:'music'})],
      ]} vfx={careerActionVfx('music')} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'sports')&&<Path routeId="sports" focused={focusPath==='sports'} title="Professional sports" stat={`${String(sportsTrack?.sport??'Choose a sport')} · ${sportsLife.status}${sportsSeasons?` · ${sportsSeasons} season${sportsSeasons===1?'':'s'}`:''}`} actions={[
        ['Basketball',()=>gameEngine.sportsJoin('Basketball'),sportsActive||sportsRetired||startBlocked('sports')],
        ['American football',()=>gameEngine.sportsJoin('American football'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Baseball',()=>gameEngine.sportsJoin('Baseball'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Soccer',()=>gameEngine.sportsJoin('Soccer'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Hockey',()=>gameEngine.sportsJoin('Hockey'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Tennis',()=>gameEngine.sportsJoin('Tennis'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Golf',()=>gameEngine.sportsJoin('Golf'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Volleyball',()=>gameEngine.sportsJoin('Volleyball'),sportsActive||sportsRetired||startBlocked('sports')],
        ['Train',()=>gameEngine.sportsTrain(),sportsRetired||!sportsActive||training('sports')],
        ['Seek pro contract',()=>launchChallenge('sports',score=>gameEngine.sportsPro(score),careerActionVfx('sports')),sportsRetired||!sportsActive||Boolean(renewal)||Number(sportsTrack?.skill??0)<58||sportsTrack?.pro===true||!actionAllowed(state,{policy:'special.pro_contract'}),specialActionAgeVisible(state,'sports','Seek pro contract')],
      ]} vfx={careerActionVfx('sports')} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'combat')&&<Path title="Combat sports" stat={`Wins ${Number(state.specialCareers.combat?.wins??0)} · titles ${Number(state.specialCareers.combat?.titles??0)}`} actions={[
        ['Train',()=>gameEngine.combatTrain(),startBlocked('combat')||training('combat')],
        ['Take fight',()=>launchChallenge('combat',score=>gameEngine.combatFight(score),careerActionVfx('combat')),!pathActive('combat')||!actionAllowed(state,{policy:'special.fight'}),specialActionAgeVisible(state,'combat','Take fight')],
      ]} vfx={careerActionVfx('combat')} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'politics')&&<Path routeId="politics" focused={focusPath==='politics'} title="Politics" stat={`Office level ${Number(state.specialCareers.politics?.office??0)} · approval ${Math.round(Number(state.specialCareers.politics?.approval??0))}`} actions={[
        ['Run local',()=>gameEngine.campaign(1),startBlocked('politics')||!actionAllowed(state,{policy:'special.campaign'})],
        ['Run regional',()=>gameEngine.campaign(3),startBlocked('politics')||!actionAllowed(state,{policy:'special.campaign'})],
        ['Run national',()=>gameEngine.campaign(4),startBlocked('politics')||!actionAllowed(state,{policy:'special.campaign'})],
        ['Speech',()=>gameEngine.politicalAction('speech'),startBlocked('politics')||publicMove('speech')],
      ]} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'military')&&<Path routeId="military" focused={focusPath==='military'} title="Military" stat={`${String(state.specialCareers.military?.branch??'Not enlisted')} · rank ${Number(state.specialCareers.military?.rank??0)}`} actions={[
        ['Enlist Army',()=>gameEngine.enlist('Army'),pathActive('military')||startBlocked('military')],
        ['Officer path',()=>gameEngine.enlist('Air Service',true),pathActive('military')||startBlocked('military')],
        ['Train',()=>gameEngine.militaryTrain(),!pathActive('military')||training('military')],
      ]} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'royalty')&&<Path title="Royalty" stat={state.flags.royalBirth?'Born into royal household':'Not currently royal'} actions={[
        ['Perform royal duty',()=>gameEngine.royalDuty(),startBlocked('royalty')||!actionAllowed(state,{policy:'special.royal_duty'})],
      ]} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'modeling')&&<Path routeId="modeling" focused={focusPath==='modeling'} title="Modeling" stat={`${modelingLife.status} · Jobs ${Number(state.specialCareers.modeling?.jobs??0)}`} actions={[
        ['Lesson',()=>gameEngine.model('lesson'),training('modeling')],
        ['Audition',()=>gameEngine.model('audition'),startBlocked('modeling')||modelMove('audition')],
        ['Photoshoot',()=>gameEngine.model('photoshoot'),startBlocked('modeling')||modelMove('photoshoot')],
        ['Runway',()=>gameEngine.model('runway'),startBlocked('modeling')||modelMove('runway')],
      ]} vfx={careerActionVfx('modeling')} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'racing')&&<Path routeId="racing" focused={focusPath==='racing'} title="Motorsport" stat={`${racingLife.status} · Skill ${Math.round(Number(state.specialCareers.racing?.skill??0))}`} actions={[
        ['Join',()=>gameEngine.race('join'),racingActive||startBlocked('racing')],
        ['Train',()=>gameEngine.race('train'),!racingActive||training('racing')],
        ['Race',()=>launchChallenge('racing',score=>gameEngine.race('race',score),careerActionVfx('racing')),!racingActive||!actionAllowed(state,{policy:'special.race'})],
      ]} vfx={careerActionVfx('racing')} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'directing')&&<Path routeId="directing" focused={focusPath==='directing'} title="Film directing" stat={`${directingLife.status} · Films ${Number(state.specialCareers.directing?.filmsDirected??0)}`} actions={[
        ['Direct indie film',()=>gameEngine.directFilm(1500000),startBlocked('directing')||!actionAllowed(state,{policy:'special.direct_film'})],
        ['Direct major film',()=>gameEngine.directFilm(25000000),startBlocked('directing')||!actionAllowed(state,{policy:'special.direct_film'})],
      ]} onResult={onResult}/>} 
      {specialPathAgeVisible(state,'crimeOrg')&&<Path routeId="crimeOrg" focused={focusPath==='crimeOrg'} title="Organized crime" stat={`${String(state.specialCareers.crimeOrg?.rank??'Not joined')} · standing ${Math.round(Number(state.specialCareers.crimeOrg?.standing??0))}`} actions={[
        ['Join',()=>gameEngine.joinCrimeOrg(),pathActive('crimeOrg')||startBlocked('crimeOrg')],
        ['Abstract earning job',()=>gameEngine.crimeOrgAction('earn'),!pathActive('crimeOrg')||crimeOrgMove('earn')],
        ['Contribute',()=>gameEngine.crimeOrgAction('contribute'),!pathActive('crimeOrg')||crimeOrgMove('contribute')],
        ['Become informant',()=>gameEngine.crimeOrgAction('informant'),!pathActive('crimeOrg')||crimeOrgMove('informant')],
      ]} vfx={careerActionVfx('crimeOrg')} onResult={onResult}/>} 
    </div>
    {challenge&&<MiniGameOverlay kind={challenge.kind} reducedMotion={state.settings.reducedMotion} seedKey={`${state.seed}-${state.character.age}-${state.actionLedger.revision}`} onCancel={()=>setChallenge(undefined)} onResolveFromSkill={()=>skipMiniGame(state,challenge.kind,relatedMiniGameSkill(state,challenge.kind))} onComplete={result=>{const action=challenge.run;const vfx=challenge.vfx;setChallenge(undefined);onResult(action(result.score),{primary:vfx,derive:true});}}/>}
  </>;
}

type PathAction=[label:string,run:()=>EngineResult|void,disabled?:boolean,visible?:boolean];
function Path({title,stat,actions,onResult,vfx,routeId,focused}:{title:string;stat:string;actions:PathAction[];onResult:ActionResultHandler;vfx?:ActionVfxKind;routeId?:InstitutionSpecialPathFocus;focused?:boolean}){return <section className={`path-card${routeId?' institution-route-anchor':''}${focused?' institution-route-focus':''}`} data-institution-anchor={routeId?`special-${routeId}`:undefined}><div><h2>{title}</h2><p>{stat}</p></div><div className="action-grid">{actions.filter(([, , , visible])=>visible!==false).map(([label,fn,disabled])=><button key={label} disabled={disabled} onClick={()=>{const result=fn();if(result)onResult(result,vfx?{primary:vfx}:undefined);}}>{label}</button>)}</div></section>}
