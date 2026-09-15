import { useEffect, useMemo, useState } from 'react';
import type { GameState, Npc, Relationship } from '../types/game';
import type { ActionResultHandler } from '../core/actionVfx';
import { actionAllowed } from '../core/actionEconomy';
import { relationshipTypeLabel } from '../core/familyRelations';
import { gameEngine } from '../stores/gameStore';
import { CharacterPortrait } from './CharacterPortrait';
import { projectNpcAppearance } from '../systems/NpcVisualSystem';
import {
  YUKI_THREADROOM_TOPICS,
  type YukiThreadroomTopicId,
  yukiThreadroomGreeting,
  yukiThreadroomStatusLine,
  yukiThreadroomTopicLine,
} from '../systems/YukiThreadroomSystem';
import './YukiThreadroom.css';

type Props={
  state:GameState;
  npc:Npc;
  relationship:Relationship;
  onClose:()=>void;
  onResult:ActionResultHandler;
  onOpenDetails:()=>void;
};

const ROOM_ACTIONS=[
  {id:'conversation',label:'Talk a while'},
  {id:'spend_time',label:'Spend time'},
  {id:'compliment',label:'Say something sweet'},
  {id:'apologize',label:'Apologize'},
] as const;

export function YukiThreadroom({state,npc,relationship,onClose,onResult,onOpenDetails}:Props){
  const[selectedTopic,setSelectedTopic]=useState<YukiThreadroomTopicId>();
  const appearance=useMemo(()=>projectNpcAppearance(state,npc),[state,npc,gameEngine.getRevision()]);
  const line=selectedTopic
    ?yukiThreadroomTopicLine(selectedTopic,state,npc,relationship)
    :yukiThreadroomGreeting(state,npc,relationship);
  const status=yukiThreadroomStatusLine(npc,relationship);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[onClose]);

  const interact=(action:string)=>{
    const result=gameEngine.interactWithCharacter(npc.id,action);
    onResult(result,{derive:true});
    if(result.success)setSelectedTopic(undefined);
  };

  return <section className="yuki-threadroom" role="dialog" aria-modal="true" aria-label="Yuki hidden Threadroom">
    <div className="yuki-threadroom__ambient" aria-hidden="true"><span/><span/><span/></div>
    <header className="yuki-threadroom__header">
      <button className="yuki-threadroom__back" onClick={onClose} aria-label="Return to Threadspace">‹</button>
      <div><small>EVERTHREAD // PRIVATE THREAD</small><strong>YUKI</strong></div>
      <span className="yuki-threadroom__status"><i/>{status}</span>
    </header>

    <div className="yuki-threadroom__scroll">
      <section className="yuki-threadroom__stage">
        <div className="yuki-threadroom__portrait-shell">
          <div className="yuki-threadroom__halo" aria-hidden="true"/>
          <CharacterPortrait appearance={appearance} age={npc.age} size={232} frame="none" label="Yuki Aster portrait"/>
          <span className="yuki-threadroom__sigil" aria-hidden="true">✦</span>
        </div>
        <div className="yuki-threadroom__identity">
          <p className="eyebrow">A hidden thread first woven on 09/04/2026</p>
          <h1>Yuki Aster</h1>
          <p>{relationshipTypeLabel(relationship.type)} · age {npc.age} · {npc.city}</p>
        </div>
      </section>

      <section className="yuki-threadroom__dialogue" aria-live="polite">
        <span className="yuki-threadroom__speaker">YUKI</span>
        <p>{line}</p>
      </section>

      {npc.alive&&<section className="yuki-threadroom__quick-actions" aria-label="Spend time with Yuki">
        {ROOM_ACTIONS.map(action=>{
          const allowed=actionAllowed(state,[{policy:'social.npc.total',target:npc.id},{policy:'social.npc.action',target:`${npc.id}:${action.id}`}]);
          return <button key={action.id} disabled={!allowed} onClick={()=>interact(action.id)}>{action.label}</button>;
        })}
      </section>}

      <section className="yuki-threadroom__topics">
        <div className="yuki-threadroom__section-heading"><div><small>Ask Yuki about</small><h2>Conversation threads</h2></div><span>{YUKI_THREADROOM_TOPICS.length}</span></div>
        <div className="yuki-threadroom__topic-grid">
          {YUKI_THREADROOM_TOPICS.map(topic=><button key={topic.id} className={selectedTopic===topic.id?'active':''} onClick={()=>setSelectedTopic(topic.id)}>
            <strong>{topic.label}</strong><small>{topic.hint}</small>
          </button>)}
        </div>
      </section>

      <section className="yuki-threadroom__thread-card">
        <div><small>Relationship</small><strong>{relationshipTypeLabel(relationship.type)}</strong></div>
        <div><small>Thread strength</small><strong>{Math.round(relationship.score)}</strong></div>
        <div><small>Compatibility</small><strong>{Math.round(relationship.compatibility)}</strong></div>
        <div><small>Years known</small><strong>{relationship.yearsKnown}</strong></div>
      </section>

      <section className="yuki-threadroom__memory">
        <div className="yuki-threadroom__section-heading"><div><small>What Everthread remembers</small><h2>Our thread</h2></div></div>
        {npc.memories.slice(-4).reverse().map(memory=><p key={memory.id}>{memory.summary}</p>)}
      </section>

      <section className="yuki-threadroom__everthread-actions">
        <p>Yuki still lives inside the ordinary Everthread simulation. Dates, gifts, relationship milestones, family planning, household visits, work links, and every systemic consequence remain real.</p>
        <button onClick={onOpenDetails}>Life & relationship actions</button>
      </section>
    </div>
  </section>;
}
