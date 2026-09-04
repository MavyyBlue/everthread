import { useState } from 'react';
import type { EngineResult, GameState } from '../types/game';
import { SearchField } from '../components/SearchField';
import { gameEngine } from '../stores/gameStore';
import { availableJobs } from '../systems/CareerSystem';
import { availablePrograms } from '../systems/EducationSystem';
import { formatMoney } from '../core/format';
import { actionAllowed } from '../core/actionEconomy';
import { MiniGameOverlay } from '../minigames/MiniGameOverlay';
import { relatedMiniGameSkill, skipMiniGame, type MiniGameKind } from '../minigames/framework';

export function CareerScreen({state,onResult}:{state:GameState;onResult:(r:EngineResult)=>void}){const[tab,setTab]=useState<'work'|'education'|'special'>('work');const[q,setQ]=useState('');const jobs=availableJobs(state).filter(j=>`${j.title} ${j.industry}`.toLowerCase().includes(q.toLowerCase())).slice(0,80);const programs=availablePrograms(state).filter(p=>p.name.toLowerCase().includes(q.toLowerCase()));const currentStudy=[...state.education].reverse().find(e=>!e.graduated&&!e.droppedOut&&!e.endAge);const workedHarder=!actionAllowed(state,{policy:'career.work_harder'});const raiseAsked=!actionAllowed(state,{policy:'career.raise'});const canStartJob=actionAllowed(state,{policy:'career.job_start'});const canFreelance=actionAllowed(state,{policy:'career.freelance'});const canSchoolEffort=actionAllowed(state,{policy:'education.effort'});const canEnroll=actionAllowed(state,{policy:'education.enroll'});
 return <main className="screen"><div className="screen-title"><div><p className="eyebrow">Work & learning</p><h1>Career</h1></div></div><div className="segmented segmented--sticky"><button className={tab==='work'?'active':''} onClick={()=>setTab('work')}>Work</button><button className={tab==='education'?'active':''} onClick={()=>setTab('education')}>Education</button><button className={tab==='special'?'active':''} onClick={()=>setTab('special')}>Life paths</button></div>
 {tab==='work'&&<><section className="hero-card">{state.employment.current?<><p className="eyebrow">Current role</p><h2>{state.employment.current.title}</h2><p>{state.employment.current.company} · {formatMoney(state.employment.current.salary)}/year</p><div className="sheet-stat-grid"><div><small>Performance</small><strong>{Math.round(state.employment.current.performance)}</strong></div><div><small>Level</small><strong>{state.employment.current.level}</strong></div><div><small>Stress</small><strong>{Math.round(state.character.secondary.stress)}</strong></div></div><div className="button-row"><button disabled={workedHarder} onClick={()=>onResult(gameEngine.workHarder())}>{workedHarder?'Extra effort used':'Work harder'}</button><button disabled={raiseAsked} onClick={()=>onResult(gameEngine.askForRaise())}>{raiseAsked?'Raise requested':'Ask raise'}</button><button className="danger-soft" onClick={()=>onResult(gameEngine.resign())}>Resign</button></div></>:<><p className="eyebrow">Current role</p><h2>{state.character.age<16?'Not old enough to work yet':'Unemployed'}</h2><p>Qualified listings update from your age, education, stats, and legal history.</p></>}</section>{state.character.age>=50&&<button className="full-button" onClick={()=>onResult(gameEngine.retire())}>Retire from working life</button>}<div className="section-heading"><h2>Job market</h2><span>{jobs.length} shown</span></div><SearchField value={q} onChange={setQ} placeholder="Search qualified jobs"/><div className="list-compact">{jobs.map(job=><button key={job.id} disabled={!canStartJob||!actionAllowed(state,[{policy:'career.application.total'},{policy:'career.application.job',target:job.id}])} onClick={()=>onResult(gameEngine.applyForJob(job.id))}><span><strong>{job.title}</strong><small>{job.industry} · {job.salaryRange[0].toLocaleString()}–{job.salaryRange[1].toLocaleString()}</small></span><b>Apply</b></button>)}</div><section className="action-card"><h2>Freelance</h2><div className="action-grid">{['writing','programming','design'].map(k=><button key={k} disabled={!canFreelance} onClick={()=>onResult(gameEngine.performActivity(`freelance_${k}`))}>{k}</button>)}</div></section></>}
 {tab==='education'&&<>{currentStudy&&<section className="hero-card"><p className="eyebrow">Currently enrolled</p><h2>{currentStudy.major??currentStudy.stage}</h2><p>{currentStudy.institution}</p><div className="button-row"><button disabled={!canSchoolEffort} onClick={()=>onResult(gameEngine.performActivity('study'))}>Study harder</button><button disabled={!canSchoolEffort} onClick={()=>onResult(gameEngine.performActivity('skip_class'))}>Skip class</button><button className="danger-soft" onClick={()=>onResult(gameEngine.dropOut())}>Drop out</button></div></section>}<SearchField value={q} onChange={setQ} placeholder="Search education"/><div className="list-compact">{programs.map(p=><button key={p.id} disabled={!canEnroll} onClick={()=>onResult(gameEngine.enroll(p.id))}><span><strong>{p.name}</strong><small>{p.years} years · base tuition {p.tuition.toLocaleString()} · intelligence {p.minIntelligence}+</small></span><b>Apply</b></button>)}</div><section className="action-card"><h2>Education history</h2>{state.education.map((e,i)=><p className="history-line" key={`${e.stage}-${i}`}><strong>{e.stage.replace('_',' ')}</strong><span>{e.graduated?'Graduated':e.droppedOut?'Dropped out':'In progress'}</span></p>)}</section></>}
 {tab==='special'&&<SpecialPaths state={state} onResult={onResult}/>}</main>;
}

function SpecialPaths({state,onResult}:{state:GameState;onResult:(r:EngineResult)=>void}){
 const[challenge,setChallenge]=useState<{kind:MiniGameKind;run:(score:number)=>EngineResult}>();
 const launchChallenge=(kind:MiniGameKind,run:(score:number)=>EngineResult):EngineResult|void=>{
  if(!state.settings.minigames){const resolved=skipMiniGame(state,kind,relatedMiniGameSkill(state,kind));return run(resolved.score);}
  setChallenge({kind,run});
 };
 const pathActive=(key:keyof GameState['specialCareers'])=>state.specialCareers[key]?.active===true;
 const training=(target:string)=>!actionAllowed(state,{policy:'special.training',target});
 const publicMove=(kind:string)=>!actionAllowed(state,[{policy:'special.politics.total'},{policy:'special.politics.kind',target:kind}]);
 const modelMove=(kind:string)=>!actionAllowed(state,[{policy:'special.model.total'},{policy:'special.model.kind',target:kind}]);
 const crimeOrgMove=(kind:string)=>!actionAllowed(state,[{policy:'special.crime_org.total'},{policy:'special.crime_org.kind',target:kind}]);
 return <><div className="special-paths">
 <Path title="Acting" stat={`Skill ${Math.round(Number(state.specialCareers.acting?.skill??0))}`} actions={[
  ['Lesson',()=>gameEngine.actingLesson(),training('acting')||(state.character.age>=18&&state.finances.cash<120)],
  ['Find agent',()=>gameEngine.actingAgent(),Number(state.specialCareers.acting?.agent??0)>=1],
  ['Audition',()=>launchChallenge('acting',score=>gameEngine.actingAudition(score)),state.character.age<14||!actionAllowed(state,{policy:'special.audition'})],
 ]} onResult={onResult}/>
 <Path title="Music" stat={`Skill ${Math.round(Number(state.specialCareers.music?.skill??0))}`} actions={[
  ['Practice vocals',()=>gameEngine.musicPractice('vocals'),training('music')],
  ['Release song',()=>gameEngine.musicRelease('song'),!actionAllowed(state,{policy:'special.music_release'})],
  ['Release album',()=>gameEngine.musicRelease('album'),!actionAllowed(state,{policy:'special.music_release'})],
  ['Tour',()=>gameEngine.musicTour(),!actionAllowed(state,{policy:'special.tour',target:'music'})],
 ]} onResult={onResult}/>
 <Path title="Professional sports" stat={String(state.specialCareers.sports?.sport??'Choose a sport')} actions={[
  ['Join basketball',()=>gameEngine.sportsJoin('Basketball'),pathActive('sports')],
  ['Train',()=>gameEngine.sportsTrain(),training('sports')],
  ['Seek pro contract',()=>launchChallenge('sports',score=>gameEngine.sportsPro(score)),state.character.age<18||Number(state.specialCareers.sports?.skill??0)<58||state.specialCareers.sports?.pro===true||!actionAllowed(state,{policy:'special.pro_contract'})],
 ]} onResult={onResult}/>
 <Path title="Combat sports" stat={`Wins ${Number(state.specialCareers.combat?.wins??0)} · titles ${Number(state.specialCareers.combat?.titles??0)}`} actions={[
  ['Train',()=>gameEngine.combatTrain(),training('combat')],
  ['Take fight',()=>launchChallenge('combat',score=>gameEngine.combatFight(score)),state.character.age<16||!pathActive('combat')||!actionAllowed(state,{policy:'special.fight'})],
 ]} onResult={onResult}/>
 <Path title="Politics" stat={`Office level ${Number(state.specialCareers.politics?.office??0)} · approval ${Math.round(Number(state.specialCareers.politics?.approval??0))}`} actions={[
  ['Run local',()=>gameEngine.campaign(1),!actionAllowed(state,{policy:'special.campaign'})],
  ['Run regional',()=>gameEngine.campaign(3),!actionAllowed(state,{policy:'special.campaign'})],
  ['Run national',()=>gameEngine.campaign(4),!actionAllowed(state,{policy:'special.campaign'})],
  ['Speech',()=>gameEngine.politicalAction('speech'),publicMove('speech')],
 ]} onResult={onResult}/>
 <Path title="Military" stat={`${String(state.specialCareers.military?.branch??'Not enlisted')} · rank ${Number(state.specialCareers.military?.rank??0)}`} actions={[
  ['Enlist Army',()=>gameEngine.enlist('Army'),pathActive('military')],
  ['Officer path',()=>gameEngine.enlist('Air Service',true),pathActive('military')],
  ['Train',()=>gameEngine.militaryTrain(),training('military')],
 ]} onResult={onResult}/>
 <Path title="Royalty" stat={state.flags.royalBirth?'Born into royal household':'Not currently royal'} actions={[
  ['Perform royal duty',()=>gameEngine.royalDuty(),!actionAllowed(state,{policy:'special.royal_duty'})],
 ]} onResult={onResult}/>
 <Path title="Modeling" stat={`Jobs ${Number(state.specialCareers.modeling?.jobs??0)}`} actions={[
  ['Lesson',()=>gameEngine.model('lesson'),training('modeling')],
  ['Audition',()=>gameEngine.model('audition'),modelMove('audition')],
  ['Photoshoot',()=>gameEngine.model('photoshoot'),modelMove('photoshoot')],
  ['Runway',()=>gameEngine.model('runway'),modelMove('runway')],
 ]} onResult={onResult}/>
 <Path title="Motorsport" stat={`Skill ${Math.round(Number(state.specialCareers.racing?.skill??0))}`} actions={[
  ['Join',()=>gameEngine.race('join'),pathActive('racing')],
  ['Train',()=>gameEngine.race('train'),training('racing')],
  ['Race',()=>launchChallenge('racing',score=>gameEngine.race('race',score)),!pathActive('racing')||!actionAllowed(state,{policy:'special.race'})],
 ]} onResult={onResult}/>
 <Path title="Film directing" stat={`Films ${Number(state.specialCareers.directing?.filmsDirected??0)}`} actions={[
  ['Direct indie film',()=>gameEngine.directFilm(1500000),!actionAllowed(state,{policy:'special.direct_film'})],
  ['Direct major film',()=>gameEngine.directFilm(25000000),!actionAllowed(state,{policy:'special.direct_film'})],
 ]} onResult={onResult}/>
 <Path title="Organized crime" stat={`${String(state.specialCareers.crimeOrg?.rank??'Not joined')} · standing ${Math.round(Number(state.specialCareers.crimeOrg?.standing??0))}`} actions={[
  ['Join',()=>gameEngine.joinCrimeOrg(),pathActive('crimeOrg')],
  ['Abstract earning job',()=>gameEngine.crimeOrgAction('earn'),crimeOrgMove('earn')],
  ['Contribute',()=>gameEngine.crimeOrgAction('contribute'),crimeOrgMove('contribute')],
  ['Become informant',()=>gameEngine.crimeOrgAction('informant'),crimeOrgMove('informant')],
 ]} onResult={onResult}/>
 </div>{challenge&&<MiniGameOverlay kind={challenge.kind} seedKey={`${state.seed}-${state.character.age}-${state.actionLedger.revision}`} onCancel={()=>setChallenge(undefined)} onResolveFromSkill={()=>skipMiniGame(state,challenge.kind,relatedMiniGameSkill(state,challenge.kind))} onComplete={result=>{const action=challenge.run;setChallenge(undefined);onResult(action(result.score));}}/>}</>;
}

type PathAction=[label:string,run:()=>EngineResult|void,disabled?:boolean];
function Path({title,stat,actions,onResult}:{title:string;stat:string;actions:PathAction[];onResult:(r:EngineResult)=>void}){return <section className="path-card"><div><h2>{title}</h2><p>{stat}</p></div><div className="action-grid">{actions.map(([label,fn,disabled])=><button key={label} disabled={disabled} onClick={()=>{const result=fn();if(result)onResult(result);}}>{label}</button>)}</div></section>}
