import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  COMBAT_TARGETS,
  COMBAT_TOTAL_ROUNDS,
  RACING_LANE_COUNT,
  RACING_TOTAL_RACERS,
  combatScore,
  combatTargetSequence,
  racingOpponentLanes,
  racingScore,
  type CombatTarget,
} from './arcadeChallenges';
import './arcade.css';

interface ChallengeProps{
  seedKey:string;
  reducedMotion?:boolean;
  onFinish:(score:number,summary:string)=>void;
}

export function RacingDodgeChallenge({seedKey,reducedMotion=false,onFinish}:ChallengeProps){
  const lanes=useMemo(()=>racingOpponentLanes(seedKey),[seedKey]);
  const[playerLane,setPlayerLane]=useState(1);
  const[index,setIndex]=useState(0);
  const[avoided,setAvoided]=useState(0);
  const[feedback,setFeedback]=useState<'clear'|'hit'|undefined>();
  const playerLaneRef=useRef(playerLane);
  const avoidedRef=useRef(avoided);
  const pointerStart=useRef<{x:number;y:number}|undefined>(undefined);
  const advanceTimer=useRef<number|undefined>(undefined);
  const finishRef=useRef(onFinish);
  const finished=useRef(false);
  playerLaneRef.current=playerLane;
  avoidedRef.current=avoided;
  finishRef.current=onFinish;

  const moveLane=(direction:-1|1)=>{
    if(finished.current)return;
    setPlayerLane(current=>Math.max(0,Math.min(RACING_LANE_COUNT-1,current+direction)));
  };

  useEffect(()=>{
    if(finished.current||index>=lanes.length)return;
    setFeedback(undefined);
    const resolveTimer=window.setTimeout(()=>{
      const safe=playerLaneRef.current!==lanes[index];
      const nextAvoided=avoidedRef.current+(safe?1:0);
      avoidedRef.current=nextAvoided;
      setAvoided(nextAvoided);
      setFeedback(safe?'clear':'hit');
      advanceTimer.current=window.setTimeout(()=>{
        if(index+1>=lanes.length){
          finished.current=true;
          finishRef.current(racingScore(nextAvoided),`You avoided ${nextAvoided} of ${RACING_TOTAL_RACERS} racers and reached the finish line.`);
        }else setIndex(current=>current+1);
      },reducedMotion?180:320);
    },reducedMotion?1150:1250);
    return()=>{
      window.clearTimeout(resolveTimer);
      if(advanceTimer.current!==undefined)window.clearTimeout(advanceTimer.current);
    };
  },[index,lanes,reducedMotion]);

  const pointerDown=(event:PointerEvent<HTMLDivElement>)=>{
    pointerStart.current={x:event.clientX,y:event.clientY};
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const pointerUp=(event:PointerEvent<HTMLDivElement>)=>{
    const start=pointerStart.current;pointerStart.current=undefined;
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    if(!start)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dx)<34||Math.abs(dx)<=Math.abs(dy))return;
    moveLane(dx<0?-1:1);
  };
  const keyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(event.key==='ArrowLeft'){event.preventDefault();moveLane(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();moveLane(1);}
  };
  const opponentLane=lanes[index]??1;
  const leftFor=(lane:number)=>`${((lane+.5)/RACING_LANE_COUNT)*100}%`;

  return <div className={`racing-dodge-game${reducedMotion?' reduced-motion':''}`}>
    <div className="arcade-status-row"><p className="minigame-progress">Racer {Math.min(index+1,RACING_TOTAL_RACERS)} / {RACING_TOTAL_RACERS}</p><strong>Passed {avoided}</strong></div>
    <p>Swipe left or right to change lanes before each rival reaches you.</p>
    <div className="pixel-road" tabIndex={0} role="group" aria-label="Three-lane racing challenge. Swipe or use left and right arrow keys to change lanes." onPointerDown={pointerDown} onPointerUp={pointerUp} onKeyDown={keyDown}>
      <div className="pixel-finish-line" aria-hidden="true"/>
      <div className="pixel-lane-line pixel-lane-line--one" aria-hidden="true"/><div className="pixel-lane-line pixel-lane-line--two" aria-hidden="true"/>
      <div key={`opponent-${index}`} className={`pixel-car pixel-car--opponent${feedback==='hit'?' pixel-car--impact':''}`} style={{left:leftFor(opponentLane)}} aria-label={`Rival car in lane ${opponentLane+1}`}><span/><i/></div>
      <div className="pixel-car pixel-car--player" style={{left:leftFor(playerLane)}} aria-label={`Your car in lane ${playerLane+1}`}><span/><i/></div>
      {feedback&&<div className={`racing-feedback ${feedback}`} aria-live="polite">{feedback==='clear'?'PASS!':'BUMP!'}</div>}
    </div>
    <div className="racing-controls" aria-label="Lane controls"><button type="button" onClick={()=>moveLane(-1)} disabled={playerLane===0} aria-label="Move left">◀</button><span>Swipe to dodge</span><button type="button" onClick={()=>moveLane(1)} disabled={playerLane===RACING_LANE_COUNT-1} aria-label="Move right">▶</button></div>
    <small>Eight fictional overtakes. Arrow buttons and keyboard controls are available as a touch alternative.</small>
  </div>;
}

const targetLetter:Record<CombatTarget,string>={red:'R',blue:'B',yellow:'Y',green:'G'};

export function CombatMemoryChallenge({seedKey,reducedMotion=false,onFinish}:ChallengeProps){
  const targets=useMemo(()=>combatTargetSequence(seedKey),[seedKey]);
  const[round,setRound]=useState(1);
  const[phase,setPhase]=useState<'showing'|'input'>('showing');
  const[activeTarget,setActiveTarget]=useState<CombatTarget>();
  const[inputIndex,setInputIndex]=useState(0);
  const[completedRounds,setCompletedRounds]=useState(0);
  const locked=useRef(true);
  const finishRef=useRef(onFinish);
  const finished=useRef(false);
  finishRef.current=onFinish;

  useEffect(()=>{
    if(phase!=='showing'||finished.current)return;
    locked.current=true;setInputIndex(0);setActiveTarget(undefined);
    const timers:number[]=[];
    const cadence=reducedMotion?620:520;
    const hold=reducedMotion?390:300;
    for(let step=0;step<round;step++){
      timers.push(window.setTimeout(()=>setActiveTarget(targets[step]),120+step*cadence));
      timers.push(window.setTimeout(()=>setActiveTarget(undefined),120+step*cadence+hold));
    }
    timers.push(window.setTimeout(()=>{setActiveTarget(undefined);locked.current=false;setPhase('input');},150+round*cadence));
    return()=>timers.forEach(timer=>window.clearTimeout(timer));
  },[phase,round,targets,reducedMotion]);

  const press=(target:CombatTarget)=>{
    if(phase!=='input'||locked.current||finished.current)return;
    const expected=targets[inputIndex];
    if(target!==expected){
      locked.current=true;finished.current=true;
      finishRef.current(combatScore(completedRounds),`You completed ${completedRounds} of ${COMBAT_TOTAL_ROUNDS} memory sequences before missing round ${round}.`);
      return;
    }
    if(inputIndex+1<round){setInputIndex(current=>current+1);return;}
    const nextCompleted=completedRounds+1;
    setCompletedRounds(nextCompleted);locked.current=true;
    if(round>=COMBAT_TOTAL_ROUNDS){
      finished.current=true;
      finishRef.current(combatScore(nextCompleted),`Perfect sequence: you completed all ${COMBAT_TOTAL_ROUNDS} training patterns.`);
      return;
    }
    setRound(current=>current+1);setPhase('showing');setInputIndex(0);
  };

  return <div className={`combat-memory-game${reducedMotion?' reduced-motion':''}`}>
    <div className="arcade-status-row"><p className="minigame-progress">Sequence {round} / {COMBAT_TOTAL_ROUNDS}</p><strong>Cleared {completedRounds}</strong></div>
    <p>{phase==='showing'?'Watch the colored targets flash.':'Repeat the pattern in the same order.'}</p>
    <div className="punching-bag-board" aria-label="Training bag memory board">
      <div className="pixel-punching-bag" aria-hidden="true"><span/><i/></div>
      {COMBAT_TARGETS.map(target=><button type="button" key={target} className={`combat-target combat-target--${target}${activeTarget===target?' active':''}`} disabled={phase==='showing'} onClick={()=>press(target)} aria-label={`${target} target`}>{targetLetter[target]}</button>)}
    </div>
    <div className="combat-memory-progress" aria-label={`${inputIndex} of ${round} inputs entered`}>{Array.from({length:round},(_,index)=><span key={index} className={phase==='input'&&index<inputIndex?'filled':''}>{index+1}</span>)}</div>
    <small>The pattern grows by one target each round, up to eight. Missing a target ends the challenge; this is an abstract memory exercise, not real fighting instruction.</small>
  </div>;
}
