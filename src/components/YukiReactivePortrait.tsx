import { useEffect, useMemo, useState } from 'react';
import type { AppearanceProfile } from '../types/game';
import {
  YUKI_THREADROOM_REACTIVE_STATES,
  yukiThreadroomBaseAsset,
  yukiThreadroomPatchAsset,
  type YukiThreadroomArtTier,
} from '../assets/yukiThreadroomAssets';
import { yukiThreadroomArtMode, type YukiThreadroomReactionState } from '../systems/YukiThreadroomSystem';
import { CharacterPortrait } from './CharacterPortrait';

const SPEECH_SEQUENCE:ReadonlyArray<{state:YukiThreadroomReactionState;ms:number}>=[
  {state:'yuki.talk-small',ms:110},
  {state:'yuki.talk-open',ms:140},
  {state:'yuki.talk-small',ms:100},
  {state:'yuki.idle',ms:90},
];

function preferredTier():YukiThreadroomArtTier{
  if(typeof window==='undefined'||!window.matchMedia)return'mobile';
  return window.matchMedia('(min-width: 701px)').matches?'master':'mobile';
}

function useArtTier():YukiThreadroomArtTier{
  const[tier,setTier]=useState<YukiThreadroomArtTier>(preferredTier);
  useEffect(()=>{
    if(!window.matchMedia)return;
    const query=window.matchMedia('(min-width: 701px)');
    const sync=()=>setTier(query.matches?'master':'mobile');
    query.addEventListener?.('change',sync);
    return()=>query.removeEventListener?.('change',sync);
  },[]);
  return tier;
}

function useDocumentVisible():boolean{
  const[visible,setVisible]=useState(()=>typeof document==='undefined'||document.visibilityState!=='hidden');
  useEffect(()=>{
    const sync=()=>setVisible(document.visibilityState!=='hidden');
    document.addEventListener('visibilitychange',sync);
    return()=>document.removeEventListener('visibilitychange',sync);
  },[]);
  return visible;
}

async function decodeImage(src:string):Promise<void>{
  const image=new Image();
  image.src=src;
  if(image.decode)await image.decode();
  else await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error(`Could not load ${src}`));});
}

export function YukiReactivePortrait({
  appearance,
  age,
  reaction,
  speaking,
  animated,
  label,
}:{
  appearance:AppearanceProfile;
  age:number;
  reaction:YukiThreadroomReactionState;
  speaking:boolean;
  animated:boolean;
  label:string;
}){
  const tier=useArtTier();
  const visible=useDocumentVisible();
  const[ready,setReady]=useState(false);
  const[failed,setFailed]=useState(false);
  const[frame,setFrame]=useState<YukiThreadroomReactionState>('yuki.idle');
  const customArt=yukiThreadroomArtMode(age)==='reactive-adult';
  const sources=useMemo(()=>customArt?[yukiThreadroomBaseAsset(tier),...YUKI_THREADROOM_REACTIVE_STATES.map(state=>yukiThreadroomPatchAsset(tier,state))]:[],[customArt,tier]);

  useEffect(()=>{
    let cancelled=false;
    setReady(false);setFailed(false);setFrame('yuki.idle');
    if(!customArt)return;
    void Promise.all(sources.map(decodeImage)).then(()=>{if(!cancelled)setReady(true);}).catch(()=>{if(!cancelled){setFailed(true);setReady(false);}});
    return()=>{cancelled=true;};
  },[customArt,sources]);

  useEffect(()=>{
    if(!customArt||!ready||failed)return;
    let cancelled=false;
    const timers:number[]=[];
    const later=(fn:()=>void,ms:number)=>{const id=window.setTimeout(()=>{if(!cancelled)fn();},ms);timers.push(id);};
    const show=(next:YukiThreadroomReactionState)=>{if(!cancelled)setFrame(next);};
    const clear=()=>{cancelled=true;for(const timer of timers)window.clearTimeout(timer);};

    if(!visible){show('yuki.idle');return clear;}
    if(!animated){show(reaction);return clear;}

    if(speaking){
      let index=0;
      let mouthFrames=0;
      const advance=()=>{
        const step=SPEECH_SEQUENCE[index%SPEECH_SEQUENCE.length]!;
        let next=step.state;
        mouthFrames+=next==='yuki.talk-small'||next==='yuki.talk-open'?1:0;
        if(mouthFrames>0&&mouthFrames%7===0){
          if(next==='yuki.talk-small')next='yuki.talk-small-blink';
          if(next==='yuki.talk-open')next='yuki.talk-open-blink';
        }
        show(next);index+=1;later(advance,step.ms);
      };
      advance();
      return clear;
    }

    if(reaction!=='yuki.idle'){show(reaction);return clear;}

    const blink=()=>{
      const wait=3600+Math.floor(Math.random()*3201);
      later(()=>{
        show('yuki.blink-half');
        later(()=>{show('yuki.blink-closed');later(()=>{show('yuki.blink-half');later(()=>{show('yuki.idle');blink();},50);},95);},45);
      },wait);
    };
    show('yuki.idle');blink();
    return clear;
  },[animated,customArt,failed,reaction,ready,speaking,visible]);

  if(!customArt||failed||!ready){
    return <div className="yuki-reactive-portrait yuki-reactive-portrait--fallback" data-art-mode={customArt&&failed?'fallback-error':'age-aware'}>
      <CharacterPortrait appearance={appearance} age={age} size={320} frame="none" label={label}/>
    </div>;
  }

  return <div className="yuki-reactive-portrait" data-art-mode="reactive" data-art-tier={tier} data-art-state={frame} aria-label={label} role="img">
    <img className="yuki-reactive-portrait__base" src={yukiThreadroomBaseAsset(tier)} alt="" aria-hidden="true"/>
    <img className="yuki-reactive-portrait__patch" src={yukiThreadroomPatchAsset(tier,frame)} alt="" aria-hidden="true"/>
  </div>;
}
