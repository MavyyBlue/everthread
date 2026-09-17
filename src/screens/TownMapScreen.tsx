import { useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { TOWN_DISTRICTS, TOWN_MAP_HEIGHT, TOWN_MAP_WIDTH, TOWN_PLACE_CATEGORIES, TOWN_PLACES, type TownPlaceCategory } from '../data/townPlaces';
import {
  buildTownMapProjection,
  clampTownMapScale,
  constrainTownMapCamera,
  coverTownMapCamera,
  fitTownMapCamera,
  townMapInspectableMemories,
  townMapLabelVisible,
  townMapMarkerVisible,
  townMapPlacesInBounds,
  townMapWorldBounds,
  type TownMapCamera,
} from '../systems/TownMapSystem';
import type { EngineResult, GameState } from '../types/game';
import townMapArtwork from '../assets/everthread-town-map.png';
import { EverthreadIcon } from '../components/EverthreadIcon';
import { LocationScene } from '../components/LocationScene';
import { locationSceneEnabled, type LocationScenePlaceId } from '../data/locationScenes';
import { townPlaceIconName } from '../core/everthreadIcons';
import './TownMapScreen.css';

type PointerPoint={x:number;y:number};
export default function TownMapScreen({state,onNavigate,onResult,initialSelectedId}:{state:GameState;onNavigate:(placeId:string,serviceId:string)=>void;onResult:(result:EngineResult)=>void;initialSelectedId?:string}){
  const viewportRef=useRef<HTMLDivElement|null>(null);
  const pointersRef=useRef(new Map<number,PointerPoint>());
  const gestureRef=useRef<{lastSingle?:PointerPoint;distance?:number;midpoint?:PointerPoint}>({});
  const initialized=useRef(false);
  const[viewport,setViewport]=useState({width:390,height:560});
  const[camera,setCamera]=useState<TownMapCamera>({x:0,y:0,scale:.28});
  const[panelOpen,setPanelOpen]=useState(false);
  const[showLiving,setShowLiving]=useState(true);
  const[query,setQuery]=useState('');
  const[categories,setCategories]=useState<TownPlaceCategory[]>(TOWN_PLACE_CATEGORIES.map(item=>item.id));
  const[selectedId,setSelectedId]=useState<string|undefined>(initialSelectedId);
  const[activeSceneId,setActiveSceneId]=useState<LocationScenePlaceId>();
  const[sceneSelectedId,setSceneSelectedId]=useState<LocationScenePlaceId>();
  const sceneInvokerRef=useRef<HTMLButtonElement|null>(null);

  const projection=useMemo(()=>buildTownMapProjection(state,{query,categories}),[state,query,categories]);
  const livingByPlace=useMemo(()=>new Map(projection.living.places.map(item=>[item.placeId,item] as const)),[projection.living.places]);
  const selected=TOWN_PLACES.find(place=>place.id===selectedId);
  const selectedLiving=selected?livingByPlace.get(selected.id):undefined;
  const selectedMemories=selected?townMapInspectableMemories(projection,selected.id):[];

  useLayoutEffect(()=>{
    const element=viewportRef.current;if(!element)return;
    const read=()=>{
      const rect=element.getBoundingClientRect();const next={width:Math.max(1,rect.width),height:Math.max(1,rect.height)};setViewport(next);
      if(!initialized.current){initialized.current=true;setCamera(coverTownMapCamera(next));}
      else setCamera(current=>constrainTownMapCamera(current,next));
    };
    read();const observer=new ResizeObserver(read);observer.observe(element);return()=>observer.disconnect();
  },[]);

  const worldBounds=useMemo(()=>townMapWorldBounds(camera,viewport,150),[camera,viewport]);
  const renderedPlaces=useMemo(()=>{
    const inBounds=townMapPlacesInBounds(projection.places,worldBounds);
    if(query.trim())return inBounds;
    return inBounds.filter(place=>place.id===selectedId||place.id===sceneSelectedId||townMapMarkerVisible(place,camera.scale));
  },[projection.places,worldBounds,query,selectedId,sceneSelectedId,camera.scale]);

  const applyCamera=(next:TownMapCamera)=>setCamera(constrainTownMapCamera(next,viewport));
  const fitMap=()=>applyCamera(fitTownMapCamera(viewport));
  const zoomAt=(screenX:number,screenY:number,nextScale:number)=>{
    const rect=viewportRef.current?.getBoundingClientRect();if(!rect)return;
    setCamera(current=>{
      const scale=clampTownMapScale(nextScale);
      const localX=screenX-rect.left,localY=screenY-rect.top;
      const worldX=(localX-current.x)/current.scale,worldY=(localY-current.y)/current.scale;
      return constrainTownMapCamera({x:localX-worldX*scale,y:localY-worldY*scale,scale},viewport);
    });
  };
  const zoomCenter=(factor:number)=>{const rect=viewportRef.current?.getBoundingClientRect();if(rect)zoomAt(rect.left+rect.width/2,rect.top+rect.height/2,camera.scale*factor);};
  const onWheel=(event:ReactWheelEvent<HTMLDivElement>)=>{event.preventDefault();zoomAt(event.clientX,event.clientY,camera.scale*(event.deltaY>0?.9:1.1));};
  const interactiveTarget=(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest('button,input,label'));
  const point=(event:ReactPointerEvent<HTMLDivElement>)=>({x:event.clientX,y:event.clientY});
  const distance=(a:PointerPoint,b:PointerPoint)=>Math.hypot(a.x-b.x,a.y-b.y);
  const midpoint=(a:PointerPoint,b:PointerPoint)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  const onPointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(interactiveTarget(event.target))return;event.currentTarget.setPointerCapture(event.pointerId);pointersRef.current.set(event.pointerId,point(event));
    const values=[...pointersRef.current.values()];gestureRef.current=values.length===1?{lastSingle:values[0]}:values.length>=2?{distance:distance(values[0]!,values[1]!),midpoint:midpoint(values[0]!,values[1]!)}:{};
  };
  const onPointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(!pointersRef.current.has(event.pointerId))return;pointersRef.current.set(event.pointerId,point(event));const values=[...pointersRef.current.values()];
    if(values.length===1){const previous=gestureRef.current.lastSingle,next=values[0]!;if(previous)setCamera(current=>constrainTownMapCamera({...current,x:current.x+next.x-previous.x,y:current.y+next.y-previous.y},viewport));gestureRef.current={lastSingle:next};return;}
    if(values.length>=2){const a=values[0]!,b=values[1]!,nextDistance=distance(a,b),nextMidpoint=midpoint(a,b);const previousDistance=gestureRef.current.distance,previousMidpoint=gestureRef.current.midpoint;const rect=viewportRef.current?.getBoundingClientRect();
      if(previousDistance&&previousMidpoint&&rect)setCamera(current=>{const scale=clampTownMapScale(current.scale*(nextDistance/previousDistance));const oldLocal={x:previousMidpoint.x-rect.left,y:previousMidpoint.y-rect.top};const newLocal={x:nextMidpoint.x-rect.left,y:nextMidpoint.y-rect.top};const world={x:(oldLocal.x-current.x)/current.scale,y:(oldLocal.y-current.y)/current.scale};return constrainTownMapCamera({x:newLocal.x-world.x*scale,y:newLocal.y-world.y*scale,scale},viewport);});
      gestureRef.current={distance:nextDistance,midpoint:nextMidpoint};
    }
  };
  const endPointer=(event:ReactPointerEvent<HTMLDivElement>)=>{pointersRef.current.delete(event.pointerId);const values=[...pointersRef.current.values()];gestureRef.current=values.length===1?{lastSingle:values[0]}:values.length>=2?{distance:distance(values[0]!,values[1]!),midpoint:midpoint(values[0]!,values[1]!)}:{};};
  const openPlace=(placeId:string,event:ReactMouseEvent<HTMLButtonElement>)=>{
    if(locationSceneEnabled(placeId)){sceneInvokerRef.current=event.currentTarget;setSelectedId(undefined);setSceneSelectedId(placeId as LocationScenePlaceId);setActiveSceneId(placeId as LocationScenePlaceId);return;}
    setSceneSelectedId(undefined);setSelectedId(placeId);
  };
  const closeLocationScene=()=>{setActiveSceneId(undefined);window.setTimeout(()=>sceneInvokerRef.current?.focus(),0);};
  const toggleCategory=(category:TownPlaceCategory)=>setCategories(current=>current.includes(category)?current.filter(item=>item!==category):[...current,category]);
  const resetFilters=()=>{setQuery('');setCategories(TOWN_PLACE_CATEGORIES.map(item=>item.id));};
  const placeScale=1/camera.scale;
  const renderedDistrictContexts=useMemo(()=>showLiving&&camera.scale>=.32?projection.living.districts.filter(item=>{const district=TOWN_DISTRICTS.find(candidate=>candidate.id===item.districtId);if(!district)return false;const x=district.map.x+district.map.width/2,y=district.map.y+district.map.height/2;return x>=worldBounds.left&&x<=worldBounds.right&&y>=worldBounds.top&&y<=worldBounds.bottom;}):[],[showLiving,camera.scale,projection.living.districts,worldBounds]);

  return <main className="town-map-screen" aria-label="Everthread town map">
    <div className="town-map-status" aria-live="polite"><strong>Everthread</strong><small>{projection.playerInEverthread?'You currently live in Everthread.':`Hometown map · you currently live in ${projection.playerLocationLabel}.`}</small></div>
    <button className={`town-map-explore-toggle ${panelOpen?'active':''}`} onClick={()=>setPanelOpen(value=>!value)} aria-expanded={panelOpen} aria-controls="town-map-explore-panel"><EverthreadIcon name="filter" size={17}/>Explore</button>
    {panelOpen&&<aside id="town-map-explore-panel" className="town-map-explore-panel" aria-label="Map filters and view controls">
      <div className="town-map-panel-heading"><strong>Explore Everthread</strong><small>{projection.places.length} places</small></div>
      <label className="town-map-living-toggle"><input type="checkbox" checked={showLiving} onChange={event=>setShowLiving(event.target.checked)}/><span><strong>Your life on the map</strong><small>{projection.living.connectedPlaceCount} places · {projection.living.connectedDistrictCount} districts connected</small></span></label>
      <div className="town-map-view-controls"><button onClick={fitMap}>Fit Map</button><button onClick={()=>zoomCenter(.84)}>−</button><span>{Math.round(camera.scale*100)}%</span><button onClick={()=>zoomCenter(1.18)}>+</button></div>
      <label className="town-map-search"><span><EverthreadIcon name="search" size={15}/>Find a place or activity</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Bank, park, racing…"/></label>
      <div className="town-map-category-grid"><strong>Show categories</strong>{TOWN_PLACE_CATEGORIES.map(item=><label key={item.id}><input type="checkbox" checked={categories.includes(item.id)} onChange={()=>toggleCategory(item.id)}/><span>{item.label}</span></label>)}</div>
      <button className="town-map-reset" onClick={resetFilters}>Reset filters</button>
      {projection.hiddenPlaceCount>0&&<p className="town-map-panel-note">Some places are discovered through the life you lead.</p>}
    </aside>}
    <div className="town-map-viewport" ref={viewportRef} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer}>
      <div className="town-map-world" style={{width:TOWN_MAP_WIDTH,height:TOWN_MAP_HEIGHT,transform:`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`}}>
        <img className="town-map-artwork" src={townMapArtwork} width={TOWN_MAP_WIDTH} height={TOWN_MAP_HEIGHT} draggable={false} alt="" aria-hidden="true"/>
        {renderedPlaces.map(place=>{const living=showLiving?livingByPlace.get(place.id):undefined;return <button key={place.id} className={`town-map-place town-map-place--${place.category} ${selectedId===place.id||sceneSelectedId===place.id?'selected':''} ${living?'has-living-context':''}`} style={{left:place.map.x,top:place.map.y,transform:`translate(-50%,-50%) scale(${placeScale})`}} onClick={event=>openPlace(place.id,event)} aria-label={`${locationSceneEnabled(place.id)?'Enter':'Open'} ${place.label}${living?` · ${living.contexts.map(item=>item.label).join(', ')}`:''}`}>
          <span className="town-map-place-glyph" aria-hidden="true">{townPlaceIconName(place.id)?<EverthreadIcon name={townPlaceIconName(place.id)!} size={27}/>:<span>{place.map.glyph}</span>}{living&&<b className="town-map-context-count">{living.contexts.length}</b>}</span>
          {townMapLabelVisible(place,camera.scale)&&<span className="town-map-place-label">{place.shortLabel}{living&&<small>{living.contexts[0]?.label}</small>}</span>}
        </button>})}
        {renderedDistrictContexts.map(item=>{const district=TOWN_DISTRICTS.find(candidate=>candidate.id===item.districtId)!;const x=district.map.x+district.map.width/2,y=district.map.y+district.map.height/2;return <div key={`living-${item.districtId}`} className="town-map-district-context" style={{left:x,top:y,transform:`translate(-50%,-50%) scale(${placeScale})`}} aria-label={`${item.districtLabel}: ${item.contexts.map(context=>context.label).join(', ')}`}>
          <strong>{item.contexts[0]?.label}</strong><small>{item.districtLabel}{item.contexts.length>1?` · +${item.contexts.length-1}`:''}</small>
        </div>})}
      </div>
      {!projection.places.length&&<div className="town-map-empty">No places match these filters.</div>}
      <div className="town-map-gesture-hint">Drag to move · pinch to zoom · tap a place</div>
    </div>
    {activeSceneId&&<LocationScene state={state} placeId={activeSceneId} onClose={closeLocationScene} onResult={onResult}/>}
    <BottomSheet open={Boolean(selected)} title={selected?.label??'Place'} onClose={()=>setSelectedId(undefined)}>
      {selected&&<div className="town-place-sheet">
        <p className="eyebrow">{TOWN_PLACE_CATEGORIES.find(item=>item.id===selected.category)?.label} · {TOWN_DISTRICTS.find(item=>item.id===selected.districtId)?.label}</p>
        <h2>{selected.label}</h2><p>{selected.description}</p>
        <div className="town-place-tags">{selected.activityTags.map(tag=><span key={tag}>{tag}</span>)}</div>
        {showLiving&&selectedLiving&&<section className="town-place-living"><small>Your life here</small><div className="town-place-living-list">{selectedLiving.contexts.map(context=><div key={context.id}><span className={`town-place-living-icon town-place-living-icon--${context.kind}`} aria-hidden="true"></span><span><strong>{context.label}</strong><small>{context.detail}</small></span>{context.count>1&&<b>{context.count}</b>}</div>)}</div></section>}
        {showLiving&&selectedMemories.length>0&&<section className="town-place-memories" aria-label="Memories from this place"><small>Memories here</small><p>Meaningful moments your thread remembers at this location.</p><div className="town-place-memory-list">{selectedMemories.map(memory=><article key={memory.id}><div><strong>{memory.current?'Current life':`Generation ${memory.generation}`}</strong><small>{[Number.isFinite(memory.age)?`Age ${memory.age}`:undefined,Number.isFinite(memory.year)?String(memory.year):undefined].filter(Boolean).join(' · ')}</small></div><p>{memory.text}</p></article>)}</div></section>}
        {selected.routes?.length?<div className="town-place-services"><small>Available here</small><div className="town-place-service-list">{selected.routes.map(route=><button key={route.id} onClick={()=>onNavigate(selected.id,route.id)}><span><strong>{route.label}</strong><small>{route.description}</small></span><b aria-hidden="true"><EverthreadIcon name="chevron" size={18}/></b></button>)}</div><p>These open established Everthread screens. The destination system still owns eligibility, costs, limits, and outcomes.</p></div>:<div className="town-place-route"><small>Map landmark</small><strong>No routed mechanic yet</strong><p>This place remains part of Everthread without inventing a duplicate or fake system. Later world-life phases can add experiences when an authoritative owner exists.</p></div>}
      </div>}
    </BottomSheet>
  </main>;
}
