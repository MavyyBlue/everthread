import { useState } from 'react';
import type { GameState } from '../types/game';
import { specialCareerWorldKind } from '../systems/SpecialCareerEcosystemSystem';
import { specialCareerInfluenceView } from '../systems/SpecialCareerInfluenceSystem';
import { specialCareerWorlds, type SpecialCareerWorldKind } from '../systems/SpecialCareerWorldSystem';
import { BottomSheet } from './BottomSheet';

export type MainInfoTab='life'|'people'|'activities'|'career'|'assets';
type Track=Record<string,number|string|boolean>;

type InfoEntry={title:string;summary:string;notes:string[]};
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
    summary:'Career combines education, ordinary employment, part-time work, and special Career Worlds. Career Worlds add persistent professional people whose relationships can now influence actual outcomes.',
    notes:[
      '4D6 does not guarantee a dramatic event every year. Most years leader support and rival pressure first change opportunity quality, momentum, project impact, or pressure in the background.',
      'Strong leaders can mentor or advocate. Weak leader relationships combined with stress, incidents, or scandals can create conduct reviews. Rivalries can cool down or become remembered grudges.',
      'The influence layer does not independently fire or release you. Existing contract, lifecycle, and stress systems still own formal career end states.',
      'Seek guidance, Ease rivalry, and Build chemistry use normal NPC relationship actions. Improving those relationships can change later career influence.',
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

export function ContextualInfoButton({tab,state}:{tab:MainInfoTab;state:GameState}){
  const[open,setOpen]=useState(false);const info=TAB_INFO[tab];const influence=tab==='career'?careerInfluenceSnapshots(state):[];
  return <>
    <button className="icon-button" onClick={()=>setOpen(true)} aria-label={`Explain ${tab} systems`} title="How this screen works">ⓘ</button>
    <BottomSheet open={open} title={info.title} onClose={()=>setOpen(false)} wide={tab==='career'}>
      <p className="eyebrow">Developer explanation</p>
      <p>{info.summary}</p>
      {tab==='career'&&<section className="sheet-section"><h3>Live 4D6 career influence</h3>{influence.length?influence.map(item=><article className="memory" key={item.worldId}>
        <strong>{item.worldName} · {kindLabel(item.kind)}</strong>
        <small>{item.leaderName?`Leader: ${item.leaderName}`:'No active leader'}{item.rivalName?` · Rival: ${item.rivalName}`:' · No current rival pressure target'}</small>
        <div className="sheet-stat-grid"><div><small>Leader support</small><strong>{Math.round(item.leaderSupport)}</strong></div><div><small>Rival pressure</small><strong>{Math.round(item.rivalPressure)}</strong></div><div><small>Opportunity</small><strong>{signed(item.opportunityModifier)}</strong></div><div><small>Conduct risk</small><strong>{Math.round(item.conductRisk)}</strong></div></div>
        <small>{item.processed?'This influence has been processed for the current age.':'This is the current relationship-based projection; the annual influence roll has not been processed for this age yet.'}</small>
        {item.lastEvent&&<p style={{margin:'8px 0 0'}}>Latest influence event: {item.lastEvent}</p>}
      </article>):<p className="muted">No active acting, music, sports, modeling, racing, or directing Career World exists right now. Once one is active, this panel will expose the leader/rival inputs that 4D6 is using even in years when no dramatic consequence fires.</p>}</section>}
      <section className="sheet-section"><h3>What the simulation is doing</h3>{info.notes.map(note=><p className="memory" key={note}>{note}</p>)}</section>
      <p className="muted">These explanations are read-only. Opening this sheet does not consume an action, advance RNG, autosave a new outcome, or change game state.</p>
    </BottomSheet>
  </>;
}
