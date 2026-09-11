import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './styles.css';
import './brand.css';
import './everthread-theme.css';
import { useGameState, gameEngine } from './stores/gameStore';
import { LifeScreen } from './screens/LifeScreen';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { CareerScreen } from './screens/CareerScreen';
import { AssetsScreen } from './screens/AssetsScreen';
import { EventSheet } from './components/EventSheet';
import { DeathSheet } from './components/DeathSheet';
import { MetaSheet } from './components/MetaSheet';
import { BottomSheet } from './components/BottomSheet';
import { NewLifeForm } from './components/NewLifeForm';
import { Toast } from './components/Toast';
import { ContextualInfoButton } from './components/ContextualInfoButton';
import { allocateSaveSlotId, getActiveSaveSlotId, listSaveSlots, loadGame, loadSettings, saveGame, setActiveSaveSlotId } from './services/SaveSystem';
import { normalizeEverthreadFont } from './core/visualIdentity';
import type { EngineResult } from './types/game';
import { ActionVfxLayer, type ActionVfxBurst } from './components/ActionVfxLayer';
import { captureActionVfxSnapshot, resolvedActionVfxKinds, type ActionVfxRequest, type ActionVfxSnapshot } from './core/actionVfx';

const PeopleScreen=lazy(()=>import('./screens/PeopleScreen').then(module=>({default:module.PeopleScreen})));
const tabs=[['life','Life','◉'],['people','People','♡'],['activities','Activities','＋'],['career','Career','▣'],['assets','Assets','◆']] as const;
const officialEverthreadIcon='./icons/everthread-icon-192.png';
type Tab=typeof tabs[number][0];

export default function App(){const state=useGameState(s=>s);const[tab,setTab]=useState<Tab>('life');const[meta,setMeta]=useState(false);const[newLife,setNewLife]=useState(false);const[toast,setToast]=useState('');const[booted,setBooted]=useState(false);const[vfxBursts,setVfxBursts]=useState<ActionVfxBurst[]>([]);const pressRef=useRef<{x:number;y:number;snapshot:ActionVfxSnapshot;at:number}|undefined>(undefined);const nextVfxId=useRef(1);
 useEffect(()=>{void(async()=>{try{let slotId=getActiveSaveSlotId();let saved=slotId?await loadGame(slotId):undefined;if(!saved){const slots=await listSaveSlots();slotId=slots[0]?.slotId;saved=slotId?await loadGame(slotId):undefined;}if(saved){Object.assign(saved.settings,loadSettings());setActiveSaveSlotId(saved.slotId);gameEngine.replaceState(saved);}else{const initial=gameEngine.getState();setActiveSaveSlotId(initial.slotId);await saveGame(initial);}}finally{setBooted(true);}})();},[]);
 useEffect(()=>{const root=document.documentElement;root.dataset.theme=state.settings.theme;root.dataset.font=normalizeEverthreadFont(state.settings.fontFamily);root.style.setProperty('--accent',state.settings.accent);root.style.setProperty('--text-scale',String(state.settings.textScale));if(state.settings.textColor){root.style.setProperty('--text',state.settings.textColor);root.dataset.customText='true';}else{root.style.removeProperty('--text');delete root.dataset.customText;}root.classList.toggle('high-contrast',state.settings.highContrast);root.classList.toggle('reduced-motion',state.settings.reducedMotion);},[state.settings]);
 useEffect(()=>{const handler=()=>{if(document.visibilityState==='hidden')void saveGame(gameEngine.getState());};document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler);},[]);
 const createRandomLife=async()=>{await gameEngine.flushSaves();await saveGame(gameEngine.getState());const slotId=await allocateSaveSlotId();setActiveSaveSlotId(slotId);gameEngine.newLife({slotId});setTab('life');};
 const onResult=(result:EngineResult,vfx?:ActionVfxRequest)=>{const current=gameEngine.getState();const press=pressRef.current;const kinds=resolvedActionVfxKinds(result.success,vfx,press?.snapshot,current);if(kinds.length&&press){const id=nextVfxId.current++;const burst={id,x:press.x,y:press.y,kinds};setVfxBursts(items=>[...items.slice(-5),burst]);window.setTimeout(()=>setVfxBursts(items=>items.filter(item=>item.id!==id)),1100);}pressRef.current=undefined;const message=result.messages.at(-1)?.text??(result.success?'Done.':'That did not work.');setToast(message);window.setTimeout(()=>setToast(''),2600);if(current.settings.haptics&&navigator.vibrate)navigator.vibrate(result.success?8:[20,30,20]);if(current.settings.sound)playResultTone(result.success);};
 if(!booted)return <div className="boot-screen"><img className="brand-icon" src={officialEverthreadIcon} alt="" aria-hidden="true"/><strong>Everthread</strong><small>Opening your life…</small></div>;
 return <div className="app-shell" onPointerDownCapture={event=>{const target=event.target as Element;if(!target.closest('button'))return;pressRef.current={x:event.clientX,y:event.clientY,snapshot:captureActionVfxSnapshot(gameEngine.getState()),at:performance.now()};}} onKeyDownCapture={event=>{if(event.key!=='Enter'&&event.key!==' ')return;const target=event.target as Element;const button=target.closest('button');if(!button)return;const rect=button.getBoundingClientRect();pressRef.current={x:rect.left+rect.width/2,y:rect.top+rect.height/2,snapshot:captureActionVfxSnapshot(gameEngine.getState()),at:performance.now()};}}><header className="app-bar"><button className="brand-button" onClick={()=>setTab('life')} aria-label="Go to Life"><img className="brand-icon brand-icon--small" src={officialEverthreadIcon} alt="" aria-hidden="true"/><span><strong>Everthread</strong><small>Life Unwritten</small></span></button><div style={{display:'flex',gap:8}}><ContextualInfoButton tab={tab} state={state}/><button className="icon-button" onClick={()=>setMeta(true)} aria-label="Progress, life saves, and settings">•••</button></div></header>
  <div className="screen-host">{tab==='life'&&<LifeScreen state={state} onResult={onResult}/>} {tab==='people'&&<Suspense fallback={<main className="screen"><div className="empty-card">Opening Threadspace…</div></main>}><PeopleScreen state={state} onResult={onResult}/></Suspense>} {tab==='activities'&&<ActivitiesScreen state={state} onResult={onResult}/>} {tab==='career'&&<CareerScreen state={state} onResult={onResult}/>} {tab==='assets'&&<AssetsScreen state={state} onResult={onResult}/>}</div>
  <nav className="bottom-nav" aria-label="Primary navigation">{tabs.map(([id,label,icon])=><button className={tab===id?'active':''} key={id} onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></button>)}</nav>
  <ActionVfxLayer bursts={vfxBursts} reducedMotion={state.settings.reducedMotion}/><EventSheet state={state} onResult={onResult}/><DeathSheet state={state} onResult={onResult} onNewLife={()=>setNewLife(true)} onRandomLife={()=>void createRandomLife()}/><MetaSheet open={meta} onClose={()=>setMeta(false)} onNewLife={()=>{setMeta(false);setNewLife(true);}} onLifeOpened={()=>{setMeta(false);setTab('life');}}/><BottomSheet open={newLife} title="Create a new life" onClose={()=>setNewLife(false)} wide><NewLifeForm onCreated={()=>{setNewLife(false);setTab('life');}}/></BottomSheet><Toast message={toast}/>
 </div>;
}

function playResultTone(success:boolean){try{const Ctx=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.frequency.value=success?520:190;gain.gain.value=.025;osc.connect(gain);gain.connect(ctx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.12);osc.stop(ctx.currentTime+.13);}catch{/* sound is optional */}}
