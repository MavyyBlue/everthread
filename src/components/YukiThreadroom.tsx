import { useEffect, useMemo, useRef, useState } from 'react';
import type { EngineResult, GameState, Npc, Relationship } from '../types/game';
import type { ActionResultHandler } from '../core/actionVfx';
import { actionAllowed } from '../core/actionEconomy';
import { relationshipTypeLabel } from '../core/familyRelations';
import { gameEngine } from '../stores/gameStore';
import { projectNpcAppearance } from '../systems/NpcVisualSystem';
import {
  YUKI_THREADROOM_TOPICS,
  type YukiThreadroomReactionState,
  type YukiThreadroomTopicId,
  yukiThreadroomGreeting,
  yukiThreadroomInteractionReaction,
  yukiThreadroomStatusLine,
  yukiThreadroomTopicLine,
  yukiThreadroomTopicReaction,
} from '../systems/YukiThreadroomSystem';
import {
  YUKI_THREADROOM_ICONS,
  yukiThreadroomRoomAsset,
  type YukiThreadroomIconName,
  type YukiThreadroomLighting,
} from '../assets/yukiThreadroomAssets';
import { YukiReactivePortrait } from './YukiReactivePortrait';
import './YukiThreadroom.css';

type Props={
  state:GameState;
  npc:Npc;
  relationship:Relationship;
  onClose:()=>void;
  onResult:ActionResultHandler;
  onOpenDetails:()=>void;
};

type Panel='topics'|'memories';
type Presentation={key:number;line:string;reaction:YukiThreadroomReactionState;speaks:boolean};

const SYSTEM_ACTIONS=['spend_time','compliment','apologize'] as const;
type SystemAction=typeof SYSTEM_ACTIONS[number];

const ROOM_ACTIONS:ReadonlyArray<
  |{id:'talk';label:string;hint:string;icon:YukiThreadroomIconName;kind:'topics'}
  |{id:SystemAction;label:string;hint:string;icon:YukiThreadroomIconName;kind:'system';action:SystemAction}
  |{id:'open_up'|'quiet';label:string;hint:string;icon:YukiThreadroomIconName;kind:'topic';topic:YukiThreadroomTopicId}
>=[
  {id:'talk',label:'Talk',hint:'Choose a conversation thread',icon:'talk',kind:'topics'},
  {id:'spend_time',label:'Spend time',hint:'Share a little time together',icon:'tea',kind:'system',action:'spend_time'},
  {id:'compliment',label:'Compliment',hint:'Say something kind',icon:'heart',kind:'system',action:'compliment'},
  {id:'apologize',label:'Apologize',hint:'Try to mend the thread',icon:'listen',kind:'system',action:'apologize'},
  {id:'open_up',label:'Open up',hint:'Talk about the two of you',icon:'listen',kind:'topic',topic:'us'},
  {id:'quiet',label:'Sit quietly',hint:'No objective, just a moment',icon:'quiet',kind:'topic',topic:'quiet'},
];

function firstResultLine(result:EngineResult):string|undefined{
  return result.messages.map(message=>message.text.trim()).filter(Boolean).join(' ')||undefined;
}

function RoomIcon({name}: {name:YukiThreadroomIconName}){
  return <img src={YUKI_THREADROOM_ICONS[name]} alt="" aria-hidden="true"/>;
}

function systemPrefersReducedMotion():boolean{
  return typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function initialLighting(state:GameState):YukiThreadroomLighting{
  if(state.settings.theme==='light')return'day';
  if(state.settings.theme==='dark')return'evening';
  if(typeof window!=='undefined'&&window.matchMedia?.('(prefers-color-scheme: light)').matches)return'day';
  return'evening';
}

function useDialoguePresentation(presentation:Presentation,animated:boolean){
  const[visibleLine,setVisibleLine]=useState(presentation.line);
  const[speaking,setSpeaking]=useState(false);
  const[reaction,setReaction]=useState<YukiThreadroomReactionState>(presentation.reaction);

  useEffect(()=>{
    let cancelled=false;
    const timers:number[]=[];
    const later=(fn:()=>void,ms:number)=>{const id=window.setTimeout(()=>{if(!cancelled)fn();},ms);timers.push(id);};
    const cleanup=()=>{cancelled=true;for(const timer of timers)window.clearTimeout(timer);};

    setReaction(presentation.reaction);
    if(!animated){setVisibleLine(presentation.line);setSpeaking(false);return cleanup;}

    setVisibleLine('');setSpeaking(false);
    const startDelay=presentation.reaction==='yuki.idle'?120:360;
    later(()=>{
      if(!presentation.line){setSpeaking(false);return;}
      let index=0;
      setSpeaking(presentation.speaks);
      const reveal=()=>{
        index=Math.min(presentation.line.length,index+1);
        setVisibleLine(presentation.line.slice(0,index));
        if(index<presentation.line.length){later(reveal,24);return;}
        setSpeaking(false);
        later(()=>setReaction(presentation.reaction),140);
        later(()=>setReaction('yuki.idle'),900);
      };
      reveal();
    },startDelay);
    return cleanup;
  },[animated,presentation]);

  return{visibleLine,speaking,reaction};
}

export function YukiThreadroom({state,npc,relationship,onClose,onResult,onOpenDetails}:Props){
  const appearance=useMemo(()=>projectNpcAppearance(state,npc),[state,npc,gameEngine.getRevision()]);
  const greeting=yukiThreadroomGreeting(state,npc,relationship);
  const[lighting,setLighting]=useState<YukiThreadroomLighting>(()=>initialLighting(state));
  const[panel,setPanel]=useState<Panel>();
  const panelRef=useRef<HTMLDivElement>(null);
  const panelTrigger=useRef<HTMLElement|null>(null);
  const[systemReducedMotion]=useState(systemPrefersReducedMotion);
  const animated=npc.alive&&state.settings.animations&&!state.settings.reducedMotion&&!systemReducedMotion;
  const[presentation,setPresentation]=useState<Presentation>(()=>({key:0,line:greeting,reaction:npc.alive?'yuki.warm-blush':'yuki.focused',speaks:npc.alive}));
  const{visibleLine,speaking,reaction}=useDialoguePresentation(presentation,animated);
  const status=yukiThreadroomStatusLine(npc,relationship);

  const present=(line:string,nextReaction:YukiThreadroomReactionState,speaks=true)=>{
    setPresentation(current=>({key:current.key+1,line,reaction:nextReaction,speaks}));
  };

  const closePanel=()=>{
    setPanel(undefined);
    window.setTimeout(()=>panelTrigger.current?.focus(),0);
  };

  const openPanel=(next:Panel,trigger:HTMLElement)=>{
    panelTrigger.current=trigger;
    setPanel(next);
  };

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        if(panel){event.preventDefault();closePanel();}
        else onClose();
        return;
      }
      if(event.key!=='Tab'||!panel||!panelRef.current)return;
      const focusable=[...panelRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')];
      if(!focusable.length)return;
      const first=focusable[0]!;const last=focusable[focusable.length-1]!;
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[onClose,panel]);

  useEffect(()=>{
    if(!panel)return;
    const id=window.setTimeout(()=>panelRef.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus(),0);
    return()=>window.clearTimeout(id);
  },[panel]);

  const selectTopic=(topic:YukiThreadroomTopicId)=>{
    const response=yukiThreadroomTopicReaction(topic,relationship);
    present(yukiThreadroomTopicLine(topic,state,npc,relationship),response.state,response.speaks);
    const restoreFocus=panel!==undefined;
    setPanel(undefined);
    if(restoreFocus)window.setTimeout(()=>panelTrigger.current?.focus(),0);
  };

  const interact=(action:SystemAction)=>{
    const result=gameEngine.interactWithCharacter(npc.id,action);
    onResult(result,{derive:true});
    if(!result.success)return;
    const response=yukiThreadroomInteractionReaction(action);
    present(firstResultLine(result)??greeting,response.state,response.speaks);
  };

  const actionAllowedFor=(action:SystemAction)=>actionAllowed(state,[
    {policy:'social.npc.total',target:npc.id},
    {policy:'social.npc.action',target:`${npc.id}:${action}`},
  ]);

  return <section className="yuki-threadroom" role="dialog" aria-modal="true" aria-label="Yuki hidden Threadroom">
    <picture className="yuki-threadroom__background" aria-hidden="true">
      <source media="(max-width: 700px)" srcSet={yukiThreadroomRoomAsset(lighting,'mobile')}/>
      <img src={yukiThreadroomRoomAsset(lighting,'master')} alt=""/>
    </picture>
    <div className="yuki-threadroom__vignette" aria-hidden="true"/>

    <header className="yuki-threadroom__header">
      <button className="yuki-threadroom__icon-button yuki-threadroom__back" onClick={onClose} aria-label="Return to Threadspace"><RoomIcon name="back"/></button>
      <div className="yuki-threadroom__heading">
        <small>THREAD ROOM</small>
        <strong>Yuki Aster</strong>
        <span>{status}</span>
      </div>
      <button className="yuki-threadroom__icon-button" onClick={()=>setLighting(current=>current==='day'?'evening':'day')} aria-label={`Switch room lighting to ${lighting==='day'?'evening':'day'}`} title="Room lighting"><RoomIcon name={lighting==='day'?'moon':'sun'}/></button>
    </header>

    <div className="yuki-threadroom__portrait-stage" aria-hidden="false">
      <YukiReactivePortrait appearance={appearance} age={npc.age} reaction={reaction} speaking={speaking} animated={animated} label={`Yuki Aster, age ${npc.age}`}/>
    </div>

    <nav className="yuki-threadroom__side-tools" aria-label="Yuki room tools">
      <button onClick={onOpenDetails} aria-label="Open Yuki profile and relationship actions" title="Profile and life actions"><RoomIcon name="profile"/><span>Life</span></button>
      <button onClick={event=>openPanel('memories',event.currentTarget)} aria-label="Open memories with Yuki" title="Memories"><RoomIcon name="memory"/><span>Memory</span></button>
    </nav>

    <section className="yuki-threadroom__conversation" aria-label="Conversation with Yuki">
      <div className="yuki-threadroom__speaker-line"><span><RoomIcon name="aster"/>YUKI</span><small>{relationshipTypeLabel(relationship.type)} · age {npc.age}</small></div>
      <div className="yuki-threadroom__dialogue-text">
        <p aria-hidden="true">{visibleLine || '\u00a0'}</p>
        <span className="yuki-threadroom__sr-only" aria-live="polite">{presentation.line}</span>
      </div>

      {npc.alive&&<div className="yuki-threadroom__action-grid" aria-label="Interact with Yuki">
        {ROOM_ACTIONS.map(action=>{
          const disabled=action.kind==='system'&&!actionAllowedFor(action.action);
          const activate=(event:React.MouseEvent<HTMLButtonElement>)=>{
            if(action.kind==='topics'){openPanel('topics',event.currentTarget);return;}
            if(action.kind==='system'){interact(action.action);return;}
            selectTopic(action.topic);
          };
          return <button key={action.id} disabled={disabled} onClick={activate}>
            <RoomIcon name={action.icon}/><span><strong>{action.label}</strong><small>{action.hint}</small></span>
          </button>;
        })}
      </div>}
    </section>

    {panel&&<div className="yuki-threadroom__panel-backdrop" onMouseDown={event=>{if(event.currentTarget===event.target)closePanel();}}>
      <div ref={panelRef} className="yuki-threadroom__panel" role="dialog" aria-modal="true" aria-labelledby={`yuki-${panel}-title`}>
        <div className="yuki-threadroom__panel-header">
          <div><small>YUKI ASTER</small><h2 id={`yuki-${panel}-title`}>{panel==='topics'?'Conversation threads':'Our thread'}</h2></div>
          <button className="yuki-threadroom__panel-close" onClick={closePanel} aria-label={`Close ${panel}`}>×</button>
        </div>
        {panel==='topics'?<div className="yuki-threadroom__topic-list">
          {YUKI_THREADROOM_TOPICS.map(topic=><button key={topic.id} onClick={()=>selectTopic(topic.id)}><strong>{topic.label}</strong><small>{topic.hint}</small></button>)}
        </div>:<div className="yuki-threadroom__memory-list">
          <div className="yuki-threadroom__thread-stats">
            <div><small>Relationship</small><strong>{relationshipTypeLabel(relationship.type)}</strong></div>
            <div><small>Strength</small><strong>{Math.round(relationship.score)}</strong></div>
            <div><small>Compatibility</small><strong>{Math.round(relationship.compatibility)}</strong></div>
            <div><small>Years known</small><strong>{relationship.yearsKnown}</strong></div>
          </div>
          {npc.memories.length?npc.memories.slice(-8).reverse().map(memory=><article key={memory.id}><small>{memory.year}</small><p>{memory.summary}</p></article>):<p className="yuki-threadroom__empty">The thread is still new. Everthread has not written many shared memories here yet.</p>}
        </div>}
      </div>
    </div>}
  </section>;
}
