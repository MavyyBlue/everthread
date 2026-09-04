import { useEffect, useState } from 'react';
import './styles.css';
import { useGameState, gameEngine } from './stores/gameStore';
import { LifeScreen } from './screens/LifeScreen';
import { PeopleScreen } from './screens/PeopleScreen';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { CareerScreen } from './screens/CareerScreen';
import { AssetsScreen } from './screens/AssetsScreen';
import { EventSheet } from './components/EventSheet';
import { DeathSheet } from './components/DeathSheet';
import { MetaSheet } from './components/MetaSheet';
import { BottomSheet } from './components/BottomSheet';
import { NewLifeForm } from './components/NewLifeForm';
import { Toast } from './components/Toast';
import { allocateSaveSlotId, getActiveSaveSlotId, listSaveSlots, loadGame, loadSettings, saveGame, setActiveSaveSlotId } from './services/SaveSystem';
import type { EngineResult } from './types/game';

const tabs=[['life','Life','◉'],['people','People','♡'],['activities','Activities','＋'],['career','Career','▣'],['assets','Assets','◆']] as const;
type Tab=typeof tabs[number][0];

export default function App(){const state=useGameState(s=>s);const[tab,setTab]=useState<Tab>('life');const[meta,setMeta]=useState(false);const[newLife,setNewLife]=useState(false);const[toast,setToast]=useState('');const[booted,setBooted]=useState(false);
 useEffect(()=>{void(async()=>{try{let slotId=getActiveSaveSlotId();let saved=slotId?await loadGame(slotId):undefined;if(!saved){const slots=await listSaveSlots();slotId=slots[0]?.slotId;saved=slotId?await loadGame(slotId):undefined;}if(saved){Object.assign(saved.settings,loadSettings());setActiveSaveSlotId(saved.slotId);gameEngine.replaceState(saved);}else{const initial=gameEngine.getState();setActiveSaveSlotId(initial.slotId);await saveGame(initial);}}finally{setBooted(true);}})();},[]);
 useEffect(()=>{const root=document.documentElement;root.dataset.theme=state.settings.theme;root.style.setProperty('--accent',state.settings.accent);root.style.setProperty('--text-scale',String(state.settings.textScale));root.classList.toggle('high-contrast',state.settings.highContrast);root.classList.toggle('reduced-motion',state.settings.reducedMotion);},[state.settings]);
 useEffect(()=>{const handler=()=>{if(document.visibilityState==='hidden')void saveGame(gameEngine.getState());};document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler);},[]);
 const createRandomLife=async()=>{await gameEngine.flushSaves();await saveGame(gameEngine.getState());const slotId=await allocateSaveSlotId();setActiveSaveSlotId(slotId);gameEngine.newLife({slotId});setTab('life');};
 const onResult=(result:EngineResult)=>{const message=result.messages.at(-1)?.text??(result.success?'Done.':'That did not work.');setToast(message);window.setTimeout(()=>setToast(''),2600);if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(result.success?8:[20,30,20]);if(state.settings.sound)playResultTone(result.success);};
 if(!booted)return <div className="boot-screen"><div className="brand-mark">E</div><strong>Everthread</strong><small>Opening your life…</small></div>;
 return <div className="app-shell"><header className="app-bar"><button className="brand-button" onClick={()=>setTab('life')} aria-label="Go to Life"><span className="brand-mark brand-mark--small">E</span><span><strong>Everthread</strong><small>Life Unwritten</small></span></button><button className="icon-button" onClick={()=>setMeta(true)} aria-label="Progress, life saves, and settings">•••</button></header>
  <div className="screen-host">{tab==='life'&&<LifeScreen state={state} onResult={onResult}/>} {tab==='people'&&<PeopleScreen state={state} onResult={onResult}/>} {tab==='activities'&&<ActivitiesScreen state={state} onResult={onResult}/>} {tab==='career'&&<CareerScreen state={state} onResult={onResult}/>} {tab==='assets'&&<AssetsScreen state={state} onResult={onResult}/>}</div>
  <nav className="bottom-nav" aria-label="Primary navigation">{tabs.map(([id,label,icon])=><button className={tab===id?'active':''} key={id} onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined}><span aria-hidden="true">{icon}</span><small>{label}</small></button>)}</nav>
  <EventSheet state={state} onResult={onResult}/><DeathSheet state={state} onResult={onResult} onNewLife={()=>setNewLife(true)} onRandomLife={()=>void createRandomLife()}/><MetaSheet open={meta} onClose={()=>setMeta(false)} onNewLife={()=>{setMeta(false);setNewLife(true);}} onLifeOpened={()=>{setMeta(false);setTab('life');}}/><BottomSheet open={newLife} title="Create a new life" onClose={()=>setNewLife(false)} wide><NewLifeForm onCreated={()=>{setNewLife(false);setTab('life');}}/></BottomSheet><Toast message={toast}/>
 </div>;
}

function playResultTone(success:boolean){try{const Ctx=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.frequency.value=success?520:190;gain.gain.value=.025;osc.connect(gain);gain.connect(ctx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.12);osc.stop(ctx.currentTime+.13);}catch{/* sound is optional */}}
