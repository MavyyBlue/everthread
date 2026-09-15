import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { AppearanceProfile } from '../types/game';
import { normalizeAppearanceProfile, paletteTokens, portraitAssetIds } from '../systems/CharacterVisualSystem';

type ArtPack=typeof import('../assets/characterArtPack');
let cachedPack:ArtPack|undefined;
let packPromise:Promise<ArtPack>|undefined;
function loadPack(){
  if(cachedPack)return Promise.resolve(cachedPack);
  packPromise??=import('../assets/characterArtPack').then(module=>{cachedPack=module;return module;});
  return packPromise;
}

export type PortraitFrame='none'|'creator'|'new-life'|'people';
const framePrefix:Record<Exclude<PortraitFrame,'none'>,string>={creator:'frame.creator-01', 'new-life':'frame.new-life-01', people:'frame.people-01'};

type PortraitStyle=CSSProperties&Record<`--et-${string}`,string|number>;

export function CharacterPortrait({appearance,age=18,size=96,label='Character portrait',frame='none',fallback}:{appearance:AppearanceProfile;age?:number;size?:number;label?:string;frame?:PortraitFrame;fallback?:ReactNode}){
  const[pack,setPack]=useState<ArtPack|undefined>(cachedPack);
  useEffect(()=>{let active=true;if(!pack)void loadPack().then(module=>{if(active)setPack(module);});return()=>{active=false;};},[pack]);
  const normalized=useMemo(()=>normalizeAppearanceProfile(appearance,`portrait:${appearance.hairStyle}:${appearance.eyeColor}`),[appearance]);
  const visual=normalized.visual!;
  const tokens=useMemo(()=>paletteTokens(visual),[visual]);
  const layers=useMemo(()=>portraitAssetIds(visual,age),[visual,age]);
  const style=useMemo(()=>{
    const next:PortraitStyle={width:size,height:size};
    for(const[key,value]of Object.entries(tokens))next[`--et-${key.replaceAll('.','-')}`]=value;
    return next;
  },[size,tokens]);
  if(!pack)return <div className="character-portrait character-portrait--loading" style={{width:size,height:size}} role="img" aria-label={label}>{fallback??<span aria-hidden="true">⋯</span>}</div>;
  const geometry=pack.CHARACTER_ART_SVG;
  const frameId=frame==='none'?undefined:framePrefix[frame];
  return <svg className={`character-portrait character-portrait--${frame}`} viewBox="0 0 512 512" style={style} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
    {frameId&&geometry[`${frameId}.backdrop`]?<g dangerouslySetInnerHTML={{__html:geometry[`${frameId}.backdrop`]!}}/>:null}
    {layers.map((item,index)=><g key={`${item.id}-${index}`} transform={item.transform||undefined} dangerouslySetInnerHTML={{__html:geometry[item.id]!}}/>)}
    {frameId&&geometry[`${frameId}.overlay`]?<g dangerouslySetInnerHTML={{__html:geometry[`${frameId}.overlay`]!}}/>:null}
  </svg>;
}

export function CharacterSilhouette({age=18,size=96,label='Character silhouette',frame='new-life'}:{age?:number;size?:number;label?:string;frame?:PortraitFrame}){
  const[pack,setPack]=useState<ArtPack|undefined>(cachedPack);
  useEffect(()=>{let active=true;if(!pack)void loadPack().then(module=>{if(active)setPack(module);});return()=>{active=false;};},[pack]);
  const stage=age<=4?'infant-toddler':age<=12?'child':age<=17?'teen':age<=44?'adult':age<=64?'mature-adult':'elder';
  const id=`silhouette.${stage}-${stage==='adult'?'07':stage==='mature-adult'?'09':stage==='elder'?'11':stage==='teen'?'05':stage==='child'?'03':'01'}`;
  const style:PortraitStyle={width:size,height:size};
  for(const[key,value]of Object.entries({
    'silhouette.base':'#4C485F','silhouette.shadow':'#353348','silhouette.highlight':'#767186','frame.base':'#202632','frame.line':'#495564','frame.accent':'#A8C6BF','frame.surface':'#2C3442'
  }))style[`--et-${key.replaceAll('.','-')}`]=value;
  if(!pack)return <div className="character-portrait character-portrait--loading" style={{width:size,height:size}} role="img" aria-label={label}><span aria-hidden="true">⋯</span></div>;
  const geometry=pack.CHARACTER_ART_SVG;const frameId=frame==='none'?undefined:framePrefix[frame];
  return <svg className={`character-portrait character-portrait--silhouette character-portrait--${frame}`} viewBox="0 0 512 512" style={style} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
    {frameId&&geometry[`${frameId}.backdrop`]?<g dangerouslySetInnerHTML={{__html:geometry[`${frameId}.backdrop`]!}}/>:null}
    {geometry[id]?<g dangerouslySetInnerHTML={{__html:geometry[id]!}}/>:null}
    {frameId&&geometry[`${frameId}.overlay`]?<g dangerouslySetInnerHTML={{__html:geometry[`${frameId}.overlay`]!}}/>:null}
  </svg>;
}
