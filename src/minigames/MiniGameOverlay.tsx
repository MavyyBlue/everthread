import { useEffect, useMemo, useRef, useState } from 'react';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { miniGames, type MiniGameKind, type MiniGameResult } from './framework';

export function MiniGameOverlay({kind,seedKey,onComplete,onCancel,onResolveFromSkill}:{kind:MiniGameKind;seedKey:string;onComplete:(result:MiniGameResult)=>void;onCancel:()=>void;onResolveFromSkill:()=>MiniGameResult}){
  const def=miniGames[kind];
  const prefersReducedMotion=useMemo(()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,[]);
  const mechanic=prefersReducedMotion&&def.mechanic==='timing'?'sequence':def.mechanic;
  const[phase,setPhase]=useState<'intro'|'playing'|'result'>('intro');
  const[result,setResult]=useState<MiniGameResult>();
  const finish=(score:number,summary:string)=>{const rounded=Math.round(clamp(score));setResult({score:rounded,success:rounded>=def.target,summary});setPhase('result');};
  const resolveFromSkill=()=>{setResult(onResolveFromSkill());setPhase('result');};
  return <div className="minigame-overlay" role="dialog" aria-modal="true" aria-label={def.title}>
    <div className="minigame-shell">
      <div className="minigame-heading"><div><p className="eyebrow">Everthread challenge</p><h2>{def.title}</h2></div><span>{def.target}+ target</span></div>
      {phase==='intro'&&<div className="minigame-intro"><div className="minigame-mark">◇</div><p>{def.instructions}</p><p className="muted">Your character's underlying skill still matters to the final life-sim outcome. The minigame adds your performance to that system rather than replacing character progression.</p><div className="minigame-actions"><button className="full-button" onClick={()=>setPhase('playing')}>Start challenge</button><button onClick={resolveFromSkill}>Resolve from character skill</button><button className="ghost-button" onClick={onCancel}>Not now</button></div></div>}
      {phase==='playing'&&<>{mechanic==='timing'&&<TimingChallenge kind={kind} seedKey={seedKey} rounds={def.rounds} onFinish={finish}/>} {mechanic==='sequence'&&<SequenceChallenge kind={kind} seedKey={seedKey} length={def.rounds} onFinish={finish}/>} {mechanic==='grid_memory'&&<GridMemoryChallenge seedKey={seedKey} length={def.rounds} onFinish={finish}/>} {mechanic==='decision'&&<DecisionChallenge kind={kind} onFinish={finish}/>}<button className="minigame-forfeit" onClick={()=>finish(0,'You ended the challenge early.')}>End challenge</button></>}
      {phase==='result'&&result&&<div className="minigame-result"><div className={`minigame-score ${result.success?'success':''}`}>{result.score}</div><h3>{result.success?'Strong performance':'Challenge complete'}</h3><p>{result.summary}</p><p className="muted">Final success is resolved by Everthread using this score together with your character's relevant skills and circumstances.</p><button className="full-button" onClick={()=>onComplete(result)}>Use this result</button></div>}
    </div>
  </div>;
}

function TimingChallenge({kind,seedKey,rounds,onFinish}:{kind:MiniGameKind;seedKey:string;rounds:number;onFinish:(score:number,summary:string)=>void}){
  const rng=useMemo(()=>createRng(`${seedKey}-${kind}-timing`),[seedKey,kind]);
  const targets=useMemo(()=>Array.from({length:rounds},()=>rng.int(20,80)/100),[rng,rounds]);
  const[round,setRound]=useState(0);const[scores,setScores]=useState<number[]>([]);const started=useRef(0);
  useEffect(()=>{started.current=performance.now();},[round]);
  const target=targets[round]??.5;
  const tap=()=>{
    const elapsed=(performance.now()-started.current)%1700;const phase=elapsed/1700;const position=phase<.5?phase*2:(1-phase)*2;const score=clamp(100-Math.abs(position-target)*210);
    const next=[...scores,score];
    if(round+1>=rounds){onFinish(next.reduce((a,b)=>a+b,0)/next.length,`You completed ${rounds} timing beats.`);return;}
    setScores(next);setRound(r=>r+1);
  };
  return <div className="timing-game"><p className="minigame-progress">Beat {round+1} / {rounds}</p><p>Tap when the moving marker is inside the highlighted window.</p><button className="timing-track" onClick={tap} aria-label="Tap timing track"><span className="timing-target" style={{left:`calc(${target*100}% - 9%)`}}/><span className="timing-marker" key={round}/></button><small>{kind==='combat'?'Read the beat, not real fighting tactics.':kind==='racing'?'Fictional pace timing.':'Fictional clutch timing.'}</small></div>;
}

const actingCues=['Pause','Turn','Lift','Hold','Release','Focus'];
const flightCues=['North','Level','Check','Hold','Confirm','Reset'];
const pulseCues=['Ready','Hold','Go','Reset','Focus','Set'];
function SequenceChallenge({kind,seedKey,length,onFinish}:{kind:MiniGameKind;seedKey:string;length:number;onFinish:(score:number,summary:string)=>void}){
  const bank=kind==='flight'?flightCues:kind==='acting'?actingCues:pulseCues;
  const sequence=useMemo(()=>{const rng=createRng(`${seedKey}-${kind}-sequence`);return Array.from({length},()=>rng.pick(bank));},[seedKey,kind,length,bank]);
  const[showing,setShowing]=useState(true);const[input,setInput]=useState<string[]>([]);
  useEffect(()=>{const timer=setTimeout(()=>setShowing(false),1800);return()=>clearTimeout(timer);},[]);
  const choose=(cue:string)=>{const next=[...input,cue];setInput(next);if(next.length===sequence.length){const correct=next.reduce((n,value,i)=>n+(value===sequence[i]?1:0),0);onFinish(correct/sequence.length*100,`You matched ${correct} of ${sequence.length} cues in the correct position.`);}};
  return <div className="sequence-game"><p className="minigame-progress">Focus sequence · {length} cues</p>{showing?<><p>Remember this order:</p><div className="sequence-preview">{sequence.map((cue,i)=><span key={`${cue}-${i}`}>{cue}</span>)}</div></>:<><p>Repeat the sequence:</p><div className="sequence-entered">{input.map((cue,i)=><span key={`${cue}-${i}`}>{cue}</span>)}{Array.from({length:sequence.length-input.length},(_,i)=><span className="empty" key={`empty-${i}`}>?</span>)}</div><div className="minigame-choice-grid">{bank.map(cue=><button key={cue} onClick={()=>choose(cue)}>{cue}</button>)}</div></>}</div>;
}

function GridMemoryChallenge({seedKey,length,onFinish}:{seedKey:string;length:number;onFinish:(score:number,summary:string)=>void}){
  const route=useMemo(()=>{const rng=createRng(`${seedKey}-route-grid`);return rng.shuffle(Array.from({length:16},(_,i)=>i)).slice(0,length);},[seedKey,length]);
  const[showing,setShowing]=useState(true);const[input,setInput]=useState<number[]>([]);
  useEffect(()=>{const timer=setTimeout(()=>setShowing(false),1900);return()=>clearTimeout(timer);},[]);
  const choose=(cell:number)=>{if(showing)return;const next=[...input,cell];setInput(next);if(next.length===route.length){const correct=next.reduce((n,value,i)=>n+(value===route[i]?1:0),0);onFinish(correct/route.length*100,`You recalled ${correct} of ${route.length} abstract route tiles in order.`);}};
  return <div className="grid-memory-game"><p className="minigame-progress">Abstract route memory</p><p>{showing?'Memorize the highlighted tile order.':'Repeat the route by tapping the tiles in order.'}</p><div className="route-grid">{Array.from({length:16},(_,cell)=>{const routeIndex=route.indexOf(cell);const chosenIndex=input.indexOf(cell);return <button key={cell} disabled={showing} className={showing&&routeIndex>=0?'route-active':chosenIndex>=0?'route-chosen':''} onClick={()=>choose(cell)}>{showing&&routeIndex>=0?routeIndex+1:chosenIndex>=0?chosenIndex+1:''}</button>})}</div><small>This is a memory puzzle only. It does not simulate real custody or evasion methods.</small></div>;
}

const decisionBanks:Partial<Record<MiniGameKind,Array<{prompt:string;answers:string[];best:number}>>>={
  boating:[{prompt:'Conditions on the water become uncertain.',answers:['Reduce risk and reassess','Continue without checking','Ignore the change'],best:0},{prompt:'A safety check finds a problem.',answers:['Resolve it before continuing','Hide the checklist','Assume it cannot matter'],best:0},{prompt:'Another craft moves unpredictably.',answers:['Give space and proceed cautiously','Race toward it','Assume it will move'],best:0}],
  driving:[{prompt:'Conditions suddenly become harder to read.',answers:['Reduce risk and reassess','Maintain speed no matter what','Ignore the change'],best:0},{prompt:'You feel too tired to stay attentive.',answers:['Stop and recover','Push through indefinitely','Add distractions'],best:0},{prompt:'A warning needs attention.',answers:['Address it before continuing','Hide the warning','Assume it is harmless'],best:0}],
  deployment:[{prompt:'A fictional situation becomes unclear.',answers:['Pause and verify information','Guess and rush ahead','Ignore new information'],best:0},{prompt:'The team reports a safety concern.',answers:['Reassess the plan','Dismiss the concern','Increase pressure'],best:0},{prompt:'Conditions change unexpectedly.',answers:['Adapt conservatively','Pretend nothing changed','Compete for speed'],best:0}],
};
function DecisionChallenge({kind,onFinish}:{kind:MiniGameKind;onFinish:(score:number,summary:string)=>void}){
  const bank=decisionBanks[kind]??decisionBanks.driving!;const[index,setIndex]=useState(0);const[correct,setCorrect]=useState(0);const item=bank[index]!;
  const choose=(answer:number)=>{const next=correct+(answer===item.best?1:0);if(index+1>=bank.length){onFinish(next/bank.length*100,`You made ${next} of ${bank.length} strong safety-oriented decisions.`);return;}setCorrect(next);setIndex(i=>i+1);};
  return <div className="decision-game"><p className="minigame-progress">Decision {index+1} / {bank.length}</p><h3>{item.prompt}</h3><div className="minigame-choice-grid">{item.answers.map((answer,i)=><button key={answer} onClick={()=>choose(i)}>{answer}</button>)}</div></div>;
}
