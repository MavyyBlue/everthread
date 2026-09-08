import { useRef, useState, type CSSProperties } from 'react';
import type { GameState } from '../types/game';
import { specialCareerWorldKind } from '../systems/SpecialCareerEcosystemSystem';
import { specialCareerInfluenceView } from '../systems/SpecialCareerInfluenceSystem';
import { specialCareerWorlds, type SpecialCareerWorldKind } from '../systems/SpecialCareerWorldSystem';

export type MainInfoTab='life'|'people'|'activities'|'career'|'assets';
type Track=Record<string,number|string|boolean>;

type InfoEntry={title:string;summary:string;notes:string[]};
const CAREER_WORLD_RELATIONSHIP_NOTE='Build chemistry, Seek guidance, and Ease rivalry use the normal NPC relationship limits. Chemistry affects next-year momentum, release/tour performance, campaign results, racing seasons, or project impact; hostile rivalry and weak chemistry increase pressure.';
const MUSIC_COLLECTIVE_NOTE='A music collective is your persistent creative/management circle. Distribution offers are separate business terms, so an expired offer does not erase those relationships or their career history.';
const TAB_INFO:Record<MainInfoTab,InfoEntry>={
  life:{
    title:'How Life works',
    summary:'Life is the main simulation view. Age Up advances exactly one year, processes the connected world systems in order, and can stop on a required event before death resolution finishes.',
    notes:[
      'The timeline is persistent history, not just flavor text. Important entries can reference relationships, money, careers, health, legal state, fame, and delayed consequences.',
      'Primary and secondary stats are inputs to many systems rather than independent meters. A choice can improve one area while creating pressure somewhere else.',
      'Age Up is protected against double activation. If a required event is open, the next year cannot begin until that event is resolved.',
    ],
  },
  people:{
    title:'How People works',
    summary:'People is a view over persistent NPCs, family structure, personal relationships, and social affiliations. Those are related systems, but they do not overwrite one another.',
    notes:[
      'An NPC can remain your coworker, classmate, or Career World colleague even if the personal relationship later becomes a friend, enemy, partner, or ex.',
      'Relationship score is only one input. NPC traits, hidden opinion, memories, age, life history, and current circumstances can all affect later behavior.',
      'Important NPCs continue aging and living offscreen, including careers, family, health, money, public life, moves, and death.',
    ],
  },
  activities:{
    title:'How Activities works',
    summary:'Activities contains actions that spend meaningful time or opportunity during the current age. The simulation enforces those limits in the engine, not only by disabling buttons.',
    notes:[
      'Many random attempts consume their opportunity even when they fail. This prevents repeating the same action until a favorable roll appears.',
      'Wellness, travel, crime, fame, pets, and other activities can feed systems outside this tab. Their effects are intentionally interconnected.',
      'Age and life circumstances can lock activities. Those rules are simulation rules, so old saves and alternate UI paths cannot bypass them.',
    ],
  },
  career:{
    title:'How Career works',
    summary:'Career combines education, ordinary employment, part-time work, and special Career Worlds. Career Worlds add persistent professional people whose relationships can influence actual outcomes.',
    notes:[
      'Leader support and rival pressure usually change opportunity quality, momentum, project impact, or professional pressure before they create a dramatic event.',
      'Strong leaders can mentor or advocate. Weak leader relationships combined with stress, incidents, or scandals can create conduct reviews. Rivalries can cool down or become remembered grudges.',
      'The influence layer does not independently fire or release you. Existing contract, lifecycle, and stress systems still own formal career end states.',
      CAREER_WORLD_RELATIONSHIP_NOTE,
    ],
  },
  assets:{
    title:'How Assets works',
    summary:'Assets brings together money-bearing systems such as property, vehicles, investments, businesses, collectibles, liabilities, and market conditions.',
    notes:[
      'Values can change with the bounded economy and market cycles. Net worth is derived from assets and liabilities rather than stored as a separate pile of money.',
      'Some assets create recurring expenses, debt service, rental income, business profit, or investment returns during Age Up.',
      'Purchase rules and financing checks live in the simulation layer so a UI shortcut cannot create free equity or impossible borrowing.',
    ],
  },
};

export interface CareerInfluenceSnapshot{
  worldId:string;
  worldName:string;
  kind:SpecialCareerWorldKind;
  leaderName?:string;
  rivalName?:string;
  leaderSupport:number;
  rivalPressure:number;
  opportunityModifier:number;
  conductRisk:number;
  processed:boolean;
  lastEvent?:string;
}

function numeric(track:Track,key:string){const value=track[key];return typeof value==='number'?value:undefined;}
function text(track:Track,key:string){const value=track[key];return typeof value==='string'?value:undefined;}
function fullName(state:GameState,npcId?:string){const npc=npcId?state.npcs[npcId]:undefined;return npc?`${npc.firstName} ${npc.lastName}`:undefined;}
function signed(value:number){const rounded=Math.round(value);return rounded>0?`+${rounded}`:String(rounded);}
function kindLabel(kind:SpecialCareerWorldKind){return kind==='sports'?'sports':kind;}

/** Read-only developer/UI projection. It never processes a career year or mutates simulation state. */
export function careerInfluenceSnapshots(state:GameState):CareerInfluenceSnapshot[]{
  const snapshots:CareerInfluenceSnapshot[]=[];
  for(const world of specialCareerWorlds(state)){
    if(!world.active)continue;
    const kind=specialCareerWorldKind(world);if(!kind)continue;
    const influence=specialCareerInfluenceView(state,world,kind);
    const track=(state.specialCareers[kind]??{}) as Track;
    const processed=numeric(track,'lastInfluenceAge')===state.character.age&&text(track,'lastInfluenceWorldId')===world.id;
    const storedOpportunity=processed?numeric(track,'opportunityModifier'):undefined;
    snapshots.push({
      worldId:world.id,worldName:world.name,kind,
      leaderName:fullName(state,influence.leaderNpcId),rivalName:fullName(state,influence.rivalNpcId),
      leaderSupport:influence.leaderSupport,rivalPressure:influence.rivalPressure,
      opportunityModifier:storedOpportunity??influence.opportunityModifier,conductRisk:influence.conductRisk,
      processed,lastEvent:text(track,'influenceLastEvent'),
    });
  }
  return snapshots;
}

function popoverStyle(x:number,y:number):CSSProperties{
  const viewportWidth=window.innerWidth;const viewportHeight=window.innerHeight;const width=Math.max(220,Math.min(360,viewportWidth-24));const half=width/2;
  const left=Math.min(Math.max(x,12+half),viewportWidth-12-half);const above=y>viewportHeight*.54;const available=above?y-28:viewportHeight-y-28;
  return {position:'fixed',zIndex:190,left,top:above?y-16:y+16,transform:above?'translate(-50%,-100%)':'translate(-50%,0)',width,maxHeight:Math.max(160,Math.min(560,available)),overflow:'hidden',pointerEvents:'none',padding:'13px 14px',borderRadius:18,border:'1px solid var(--line)',background:'color-mix(in srgb,var(--surface) 96%,transparent)',boxShadow:'0 20px 64px rgba(0,0,0,.38)',backdropFilter:'blur(18px)',textAlign:'left'};
}

export function ContextualInfoButton({tab,state}:{tab:MainInfoTab;state:GameState}){
  const[open,setOpen]=useState(false);const[anchor,setAnchor]=useState({x:0,y:0});const activePointer=useRef<number|undefined>(undefined);const keyboardHeld=useRef(false);const info=TAB_INFO[tab];
  const influence=tab==='career'?careerInfluenceSnapshots(state):[];const hasMusicWorld=influence.some(item=>item.kind==='music');const notes=tab==='career'&&hasMusicWorld?[...info.notes,MUSIC_COLLECTIVE_NOTE]:info.notes;
  const beginAt=(x:number,y:number)=>{setAnchor({x,y});setOpen(true);};
  const endHold=()=>{activePointer.current=undefined;keyboardHeld.current=false;setOpen(false);};
  return <>
    <button className="icon-button" style={{touchAction:'none'}}
      aria-label={`Explain ${tab} systems — press and hold`} aria-expanded={open} aria-describedby={open?'contextual-info-popover':undefined} title="Press and hold for screen information"
      onContextMenu={event=>event.preventDefault()}
      onPointerDown={event=>{if(event.pointerType==='mouse'&&event.button!==0)return;activePointer.current=event.pointerId;try{event.currentTarget.setPointerCapture(event.pointerId);}catch{/* Pointer capture is optional. */}beginAt(event.clientX,event.clientY);}}
      onPointerMove={event=>{if(activePointer.current===event.pointerId)setAnchor({x:event.clientX,y:event.clientY});}}
      onPointerUp={event=>{if(activePointer.current!==event.pointerId)return;try{event.currentTarget.releasePointerCapture(event.pointerId);}catch{/* It may already be released. */}endHold();}}
      onPointerCancel={endHold} onLostPointerCapture={()=>{if(activePointer.current!==undefined)endHold();}}
      onKeyDown={event=>{if((event.key==='Enter'||event.key===' ')&&!event.repeat){event.preventDefault();keyboardHeld.current=true;const rect=event.currentTarget.getBoundingClientRect();beginAt(rect.left+rect.width/2,rect.bottom-2);}}}
      onKeyUp={event=>{if((event.key==='Enter'||event.key===' ')&&keyboardHeld.current){event.preventDefault();endHold();}}} onBlur={()=>{if(keyboardHeld.current)endHold();}}>ⓘ</button>
    {open&&<aside id="contextual-info-popover" role="tooltip" style={popoverStyle(anchor.x,anchor.y)}>
      <strong style={{display:'block',fontSize:'.88rem',marginBottom:5}}>{info.title}</strong>
      <p style={{fontSize:'.7rem',lineHeight:1.38,margin:'0 0 8px',color:'var(--text)'}}>{info.summary}</p>
      <div style={{display:'grid',gap:5}}>{notes.map(note=><p key={note} style={{fontSize:'.67rem',lineHeight:1.35,margin:0,color:'var(--muted)'}}>• {note}</p>)}</div>
      {tab==='career'&&influence.length>0&&<div style={{marginTop:9,paddingTop:8,borderTop:'1px solid var(--line)'}}><strong style={{display:'block',fontSize:'.7rem',marginBottom:5}}>Live career influence</strong>{influence.map(item=><div key={item.worldId} style={{fontSize:'.64rem',lineHeight:1.35,marginTop:5,color:'var(--muted)'}}><strong style={{color:'var(--text)'}}>{item.worldName} · {kindLabel(item.kind)}</strong><br/>{item.leaderName?`Leader ${item.leaderName}`:'No active leader'}{item.rivalName?` · Rival ${item.rivalName}`:' · No current rival'}<br/>Support {Math.round(item.leaderSupport)} · rival pressure {Math.round(item.rivalPressure)} · opportunity {signed(item.opportunityModifier)} · conduct {Math.round(item.conductRisk)} · {item.processed?'processed this age':'current projection'}{item.lastEvent?` · latest: ${item.lastEvent}`:''}</div>)}</div>}
      <small style={{display:'block',fontSize:'.6rem',lineHeight:1.3,marginTop:8,color:'var(--muted)'}}>Read-only. This preview disappears when you release the info button and never consumes an action or changes game state.</small>
    </aside>}
  </>;
}
