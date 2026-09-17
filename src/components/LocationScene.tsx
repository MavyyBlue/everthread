import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { BottomSheet } from './BottomSheet';
import { EverthreadIcon } from './EverthreadIcon';
import { formatMoney } from '../core/format';
import { LOCATION_SCENE_ACTIONS, locationSceneDefinition, type LocationSceneActionId, type LocationSceneGroupDefinition, type LocationScenePlaceId } from '../data/locationScenes';
import { gameEngine } from '../stores/gameStore';
import {
  coverLocationScene,
  locationSceneActionAvailability,
  locationSceneBackStep,
  locationSceneLabelAlignment,
  locationSceneCompanions,
  locationSceneMusicPartnershipDecisionAvailability,
  locationSceneMusicProjection,
  locationScenePropRect,
  locationSceneUtilityTrayState,
  placeLocationSceneRect,
  type LocationSceneStage,
} from '../systems/LocationSceneSystem';
import type { EngineResult, GameState } from '../types/game';
import './LocationScene.css';

type DetailState=
  |{kind:'confirm';actionId:'music.leave'|'music.retire'}
  |{kind:'companion';actionId:'shared.park.walk'|'shared.park.play'|'date.park'}
  |{kind:'catalog';actionId:'music.catalog'}
  |{kind:'partnership';actionId:'music.partnership'};

function unavailableResult(reason:string):EngineResult{return{success:false,messages:[{text:reason}]};}
function actionIcon(actionId:LocationSceneActionId){
  if(actionId.startsWith('music.'))return'music' as const;
  if(actionId.startsWith('shared.')||actionId.startsWith('date.'))return'people' as const;
  return'leaf' as const;
}
function groupIcon(placeId:LocationScenePlaceId,groupId:string){
  if(placeId==='weaver-park')return groupId==='bench'?'people' as const:'leaf' as const;
  return'music' as const;
}
function InteractHandIcon({size=24}:{size?:number}){
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 16V9.5a2 2 0 0 1 4 0V15m0-4.5V7.5a2 2 0 0 1 4 0V15m0-4V9a2 2 0 0 1 4 0v7m0-3.5v-1a2 2 0 0 1 4 0V20c0 5.5-3.7 9-9.2 9h-1.1c-4.2 0-7.1-2-9-5l-3-4.7a2.1 2.1 0 0 1 3.1-2.8l3.2 2.4V16Z"/></svg>;
}

export function LocationScene({state,placeId,onClose,onResult}:{state:GameState;placeId:LocationScenePlaceId;onClose:()=>void;onResult:(result:EngineResult)=>void}){
  const scene=locationSceneDefinition(placeId)!;
  const sceneRef=useRef<HTMLElement|null>(null);
  const viewportRef=useRef<HTMLDivElement|null>(null);
  const groupInvokerRef=useRef<HTMLElement|null>(null);
  const onCloseRef=useRef(onClose);
  const selectedGroupIdRef=useRef<string|undefined>(undefined);
  const detailRef=useRef<DetailState|undefined>(undefined);
  onCloseRef.current=onClose;
  const[stage,setStage]=useState<LocationSceneStage>(()=>coverLocationScene(390,710));
  const[selectedGroupId,setSelectedGroupId]=useState<string>();
  const[detail,setDetail]=useState<DetailState>();
  const[trayCollapsed,setTrayCollapsed]=useState(false);
  selectedGroupIdRef.current=selectedGroupId;
  detailRef.current=detail;
  const[artLoaded,setArtLoaded]=useState(false);
  const[artFailed,setArtFailed]=useState(false);
  const groups=useMemo(()=>[...scene.groups].sort((a,b)=>a.order-b.order),[scene.groups]);
  const selectedGroup=groups.find(group=>group.id===selectedGroupId);
  const music=placeId==='threadtone-music-studio'?locationSceneMusicProjection(state):undefined;
  const utilityTrayState=locationSceneUtilityTrayState(trayCollapsed,Boolean(selectedGroupId));

  useLayoutEffect(()=>{
    const element=viewportRef.current;if(!element)return;
    const read=()=>{const rect=element.getBoundingClientRect();setStage(coverLocationScene(Math.max(1,rect.width),Math.max(1,rect.height)));};
    read();const observer=new ResizeObserver(read);observer.observe(element);return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    const marker=()=>({...((history.state??{}) as Record<string,unknown>),everthreadLocationScene:placeId});
    const rearmSceneHistory=()=>history.pushState(marker(),'');
    rearmSceneHistory();
    const onPopState=()=>{
      const step=locationSceneBackStep(Boolean(detailRef.current),Boolean(selectedGroupIdRef.current));
      if(step==='detail'){detailRef.current=undefined;setDetail(undefined);rearmSceneHistory();return;}
      if(step==='group'){selectedGroupIdRef.current=undefined;setSelectedGroupId(undefined);queueMicrotask(()=>groupInvokerRef.current?.focus());rearmSceneHistory();return;}
      onCloseRef.current();
    };
    window.addEventListener('popstate',onPopState);
    return()=>{
      window.removeEventListener('popstate',onPopState);
      if(history.state?.everthreadLocationScene===placeId){const next={...history.state};delete next.everthreadLocationScene;history.replaceState(next,'');}
    };
  },[placeId]);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key!=='Escape')return;
      event.preventDefault();
      const step=locationSceneBackStep(Boolean(detail),Boolean(selectedGroupId));
      if(step==='detail'){setDetail(undefined);return;}
      if(step==='group'){setSelectedGroupId(undefined);queueMicrotask(()=>groupInvokerRef.current?.focus());return;}
      if(history.state?.everthreadLocationScene===placeId)history.back();else onCloseRef.current();
    };
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[detail,selectedGroupId,placeId]);

  useEffect(()=>{
    if(!selectedGroupId)return;
    const root=sceneRef.current;
    const sheet=()=>root?.querySelector<HTMLElement>('.bottom-sheet');
    const focusTitle=()=>{const title=sheet()?.querySelector<HTMLElement>('.sheet-header h2');if(title){title.tabIndex=-1;title.focus();}};
    const frame=requestAnimationFrame(focusTitle);
    const onTrap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return;
      const activeSheet=sheet();if(!activeSheet)return;
      const focusable=[...activeSheet.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])')].filter(element=>!element.hasAttribute('hidden')&&element.getClientRects().length>0);
      if(!focusable.length){event.preventDefault();focusTitle();return;}
      const first=focusable[0]!,last=focusable.at(-1)!;
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      else if(!activeSheet.contains(document.activeElement)){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',onTrap,true);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',onTrap,true);};
  },[selectedGroupId,detail?.kind]);

  const requestClose=()=>{if(history.state?.everthreadLocationScene===placeId)history.back();else onCloseRef.current();};
  const closeSheet=()=>{
    if(detail){setDetail(undefined);return;}
    setSelectedGroupId(undefined);queueMicrotask(()=>groupInvokerRef.current?.focus());
  };
  const openGroup=(group:LocationSceneGroupDefinition,event?:ReactMouseEvent<HTMLElement>)=>{
    if(event?.currentTarget)groupInvokerRef.current=event.currentTarget;
    setDetail(undefined);setSelectedGroupId(group.id);
  };
  const openAllActions=(event:ReactMouseEvent<HTMLButtonElement>)=>{
    groupInvokerRef.current=event.currentTarget;setDetail(undefined);setSelectedGroupId('__all');
  };
  const visibleActions=selectedGroupId==='__all'?groups.flatMap(group=>group.actionIds.map(actionId=>({group,actionId}))):selectedGroup?selectedGroup.actionIds.map(actionId=>({group:selectedGroup,actionId})):[];

  const executeDirect=(actionId:LocationSceneActionId)=>{
    const latest=gameEngine.getState();const gate=locationSceneActionAvailability(latest,actionId);
    if(!gate.available){onResult(unavailableResult(gate.reason??'That action is not currently available.'));return;}
    let result:EngineResult;
    switch(actionId){
      case'wellness.walk':result=gameEngine.performActivity('walking');break;
      case'wellness.run':result=gameEngine.performActivity('running');break;
      case'wellness.meditate':result=gameEngine.performActivity('meditation');break;
      case'music.practice':result=gameEngine.musicPractice('vocals');break;
      case'music.tour':result=gameEngine.musicTour();break;
      case'music.song':result=gameEngine.musicRelease('song');break;
      case'music.album':result=gameEngine.musicRelease('album');break;
      case'music.leave':result=gameEngine.leaveSpecialCareer('music');break;
      case'music.retire':result=gameEngine.retireSpecialCareer('music');break;
      default:onResult(unavailableResult('That location action needs a focused selection first.'));return;
    }
    onResult(result);if(result.success){setDetail(undefined);setSelectedGroupId(undefined);}
  };

  const chooseAction=(actionId:LocationSceneActionId)=>{
    const action=LOCATION_SCENE_ACTIONS[actionId];
    if(actionId==='shared.park.walk'||actionId==='shared.park.play'||actionId==='date.park'){setDetail({kind:'companion',actionId});return;}
    if(actionId==='music.catalog'){setDetail({kind:'catalog',actionId});return;}
    if(actionId==='music.partnership'){setDetail({kind:'partnership',actionId});return;}
    if(action.risk==='confirm'&&(actionId==='music.leave'||actionId==='music.retire')){setDetail({kind:'confirm',actionId});return;}
    executeDirect(actionId);
  };

  const companionActionId=detail?.kind==='companion'?detail.actionId:undefined;
  const companions=companionActionId?locationSceneCompanions(state,companionActionId):[];
  const selectCompanion=(npcId:string)=>{
    if(!companionActionId)return;
    const latest=gameEngine.getState();const stillEligible=locationSceneCompanions(latest,companionActionId).some(option=>option.npcId===npcId);
    if(!stillEligible){onResult(unavailableResult('That person is no longer eligible for this plan.'));return;}
    const result=companionActionId==='date.park'?gameEngine.romanticDate(npcId,'weaver-park','park_walk'):gameEngine.shareExperience(npcId,'weaver-park',companionActionId==='shared.park.walk'?'park_walk':'park_play');
    onResult(result);if(result.success){setDetail(undefined);setSelectedGroupId(undefined);}
  };

  const partnershipDecision=(action:'accept'|'decline')=>{
    const latest=gameEngine.getState();const gate=locationSceneMusicPartnershipDecisionAvailability(latest);
    if(!gate.available){onResult(unavailableResult(gate.reason??'That offer is no longer available.'));return;}
    const result=gameEngine.musicPartnership(action);onResult(result);if(result.success){setDetail(undefined);setSelectedGroupId(undefined);}
  };

  const prop=locationScenePropRect(scene.propAlphaBounds,stage,scene.propPlacement.width,scene.propPlacement.maxHeight,scene.propPlacement.baseline);
  const sheetTitle=detail?.kind==='confirm'?'Confirm choice':detail?.kind==='companion'?LOCATION_SCENE_ACTIONS[detail.actionId].label:detail?.kind==='catalog'?'Your music':detail?.kind==='partnership'?'Distribution offers':selectedGroupId==='__all'?'Things to do':selectedGroup?.label??scene.label;

  return <section ref={sceneRef} className="location-scene" aria-label={scene.label}>
    <header className="location-scene__header" aria-hidden={Boolean(selectedGroupId)}>
      <button className="location-scene__back" onClick={requestClose} aria-label={`Back to map from ${scene.label}`}><EverthreadIcon name="back" size={20}/></button>
      <div><p className="eyebrow">Everthread · location</p><h1>{scene.label}</h1><small>{scene.tagline}</small></div>
      <span className="location-scene__place-icon" aria-hidden="true"><EverthreadIcon name={placeId==='weaver-park'?'park':'music'} size={25}/></span>
    </header>

    <div className="location-scene__viewport" aria-hidden={Boolean(selectedGroupId)} ref={viewportRef} data-art-state={artFailed?'failed':artLoaded?'ready':'loading'}>
      {!artLoaded&&!artFailed&&<div className="location-scene__loading" aria-live="polite"><span/><small>Opening {scene.label}…</small></div>}
      {artFailed&&<div className="location-scene__art-fallback"><EverthreadIcon name={placeId==='weaver-park'?'park':'music'} size={42}/><strong>{scene.label}</strong><small>The artwork could not load. Every location action is still available below.</small></div>}
      <div className="location-scene__art" style={{left:stage.left,top:stage.top,width:stage.width,height:stage.height}} aria-hidden="true">
        <img src={scene.background} alt="" draggable={false} onLoad={()=>setArtLoaded(true)} onError={()=>setArtFailed(true)}/>
      </div>
      {!artFailed&&<svg className="location-scene__prop" style={{left:prop.left,top:prop.top,width:prop.width,height:prop.height} as CSSProperties} viewBox={`${scene.propAlphaBounds[0]} ${scene.propAlphaBounds[1]} ${scene.propAlphaBounds[2]} ${scene.propAlphaBounds[3]}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <image href={scene.propFile} x="0" y="0" width="1254" height="1254"/>
      </svg>}
      {groups.map(group=>{const rect=placeLocationSceneRect(group.hitRect,stage),alignment=locationSceneLabelAlignment(group.hitRect);return <button key={group.id} className="location-scene__object" style={{left:rect.left,top:rect.top,width:rect.width,height:rect.height}} onClick={event=>openGroup(group,event)} aria-haspopup="dialog" aria-label={`${group.label}: ${group.description}`}>
        <span className={`location-scene__object-label location-scene__object-label--${alignment}`}><b><InteractHandIcon size={20}/></b><span><strong>{group.label}</strong><small>{group.description}</small></span><EverthreadIcon name={groupIcon(placeId,group.id)} size={16}/></span>
      </button>;})}
    </div>

    <div className={`location-scene__utility-tray is-${utilityTrayState}`} hidden={utilityTrayState==='hidden'} data-state={utilityTrayState}>
      <button className="location-scene__tray-toggle" onClick={()=>setTrayCollapsed(value=>!value)} aria-expanded={utilityTrayState==='expanded'} aria-controls="location-scene-utility-tray" aria-label={utilityTrayState==='collapsed'?'Show location controls':'Hide location controls'}>
        <EverthreadIcon name="chevron" size={18}/>
      </button>
      <footer id="location-scene-utility-tray" className="location-scene__footer" hidden={utilityTrayState!=='expanded'}>
        <button onClick={openAllActions} aria-haspopup="dialog"><EverthreadIcon name="plus" size={19}/><span><strong>Things to do</strong><small>{groups.length} spots · {groups.reduce((sum,group)=>sum+group.actionIds.length,0)} actions</small></span></button>
        <button onClick={requestClose}><EverthreadIcon name="map" size={19}/><span><strong>Map</strong><small>Return to Everthread</small></span></button>
      </footer>
    </div>

    <BottomSheet open={Boolean(selectedGroupId)} title={sheetTitle} onClose={closeSheet}>
      {selectedGroupId&&!detail&&<div className="location-scene__sheet">
        {selectedGroupId!=='__all'&&selectedGroup&&<><p className="eyebrow">{scene.label}</p><h3>{selectedGroup.description}</h3></>}
        <div className="location-scene__action-list">{visibleActions.map(({group,actionId})=>{const action=LOCATION_SCENE_ACTIONS[actionId],availability=locationSceneActionAvailability(state,actionId);return <button key={`${group.id}:${actionId}`} disabled={!availability.available} onClick={()=>chooseAction(actionId)}>
          <span className="location-scene__action-icon"><EverthreadIcon name={actionIcon(actionId)} size={19}/></span><span><strong>{action.label}</strong><small>{availability.available?action.description:availability.reason}</small>{selectedGroupId==='__all'&&<em>{group.label}</em>}</span><EverthreadIcon name="chevron" size={17}/>
        </button>;})}</div>
        <button className="secondary-button full-button location-scene__sheet-close" onClick={closeSheet}>Close</button>
      </div>}

      {detail?.kind==='confirm'&&<div className="location-scene__focused">
        <p className="eyebrow">Major commitment</p><h3>{LOCATION_SCENE_ACTIONS[detail.actionId].label}</h3>
        <p>{detail.actionId==='music.leave'?'Your completed music history, skills, earnings, releases, and relationships stay recorded. Leaving frees the special-career commitment slot.':'Retirement preserves your completed music history and closes the current professional chapter. Return rules remain owned by the existing career lifecycle.'}</p>
        {music&&<div className="location-scene__status-card"><small>Current music status</small><strong>{music.lifecycle.status}</strong><span>Skill {Math.round(music.skill)} · fans {Math.round(music.fanbase).toLocaleString()}</span></div>}
        {(()=>{const gate=locationSceneActionAvailability(state,detail.actionId);return !gate.available?<p className="warning-card">{gate.reason}</p>:null;})()}
        <div className="button-row"><button className="secondary-button" onClick={()=>setDetail(undefined)}>Back</button><button className="danger-soft" disabled={!locationSceneActionAvailability(state,detail.actionId).available} onClick={()=>executeDirect(detail.actionId)}>Confirm {detail.actionId==='music.leave'?'leave':'retirement'}</button></div>
      </div>}

      {detail?.kind==='companion'&&<div className="location-scene__focused">
        <p className="eyebrow">{scene.label}</p><h3>{LOCATION_SCENE_ACTIONS[detail.actionId].label}</h3><p>{LOCATION_SCENE_ACTIONS[detail.actionId].description}</p>
        {companions.length?<div className="location-scene__companion-list">{companions.map(option=><button key={option.npcId} onClick={()=>selectCompanion(option.npcId)}><span><strong>{option.name}</strong><small>{option.detail}</small></span><EverthreadIcon name="chevron" size={17}/></button>)}</div>:<div className="empty-card">No eligible person is available for this plan right now.</div>}
        <button className="secondary-button full-button location-scene__sheet-close" onClick={()=>setDetail(undefined)}>Back</button>
      </div>}

      {detail?.kind==='catalog'&&music&&<div className="location-scene__focused">
        <p className="eyebrow">Record shelf</p><h3>Your music</h3>
        <div className="location-scene__status-card"><small>{music.lifecycle.label}</small><strong>{music.lifecycle.status}</strong><span>Skill {Math.round(music.skill)} · fans {Math.round(music.fanbase).toLocaleString()}{music.distributionPartner?` · ${music.distributionPartner}`:''}</span></div>
        {music.catalog.length?<div className="location-scene__catalog">{music.catalog.map(entry=><article key={entry.slot}><div><strong>{entry.title}</strong><small>{entry.kind} · age {entry.launchAge}</small></div><p>{entry.reception}</p><span>{entry.lifetimeStreams.toLocaleString()} lifetime streams · quality {Math.round(entry.quality)}</span></article>)}</div>:<div className="empty-card">No releases are in your current catalog yet. Practice and release actions stay at their own studio objects.</div>}
        <button className="secondary-button full-button location-scene__sheet-close" onClick={()=>setDetail(undefined)}>Back</button>
      </div>}

      {detail?.kind==='partnership'&&music&&<div className="location-scene__focused">
        <p className="eyebrow">Record shelf</p><h3>Distribution offers</h3>
        {music.offer?<div className="location-scene__offer"><strong>{music.offer.partner}</strong><p>Offer tied to {music.offer.sourceRelease}.</p><div><span><small>Advance</small><b>{formatMoney(music.offer.advance)}</b></span><span><small>Royalty share</small><b>{Math.round(music.offer.royaltyShare*100)}%</b></span><span><small>Reach</small><b>{Math.round(music.offer.reach*100)}%</b></span></div>{(()=>{const gate=locationSceneMusicPartnershipDecisionAvailability(state);return !gate.available?<p className="warning-card">{gate.reason}</p>:null;})()}<div className="button-row"><button className="secondary-button" disabled={!locationSceneMusicPartnershipDecisionAvailability(state).available} onClick={()=>partnershipDecision('decline')}>Decline</button><button disabled={!locationSceneMusicPartnershipDecisionAvailability(state).available} onClick={()=>partnershipDecision('accept')}>Accept offer</button></div></div>:<div className="empty-card">There is no active distribution offer right now. New offers remain consequences of the existing music-release system.</div>}
        <button className="secondary-button full-button location-scene__sheet-close" onClick={()=>setDetail(undefined)}>Back</button>
      </div>}
    </BottomSheet>
  </section>;
}
