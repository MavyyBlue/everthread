import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent as ReactWheelEvent } from 'react';
import type { GameState } from '../types/game';
import {
  DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS,
  DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS,
  buildPeopleWorkspaceModel,
  projectPeopleWorkspace,
  type PeopleWorkspaceLayoutNode,
} from '../systems/PeopleWorkspaceSystem';
import { PEOPLE_FOLDERS, type PeopleFolderId } from '../systems/PeopleGraphSystem';
import './PeopleWorkspace.css';

const MIN_SCALE=.08;
const MAX_SCALE=2.25;
const NODE_CULL_BUFFER=280;
const folderGlyph:Record<PeopleFolderId,string>={
  player_family:'⌂',relatives:'⌘',friends:'○',romance:'♡',school:'◇',work:'□',career:'◎',
};

type Camera={x:number;y:number;scale:number};
type PointerPoint={x:number;y:number};

function clampScale(value:number){return Math.max(MIN_SCALE,Math.min(MAX_SCALE,value));}
function nodeSize(kind:PeopleWorkspaceLayoutNode['kind']){
  if(kind==='player')return{w:156,h:82};
  if(kind==='folder')return{w:150,h:82};
  return{w:158,h:78};
}

export function PeopleWorkspace({state,onSelect,controls}:{state:GameState;onSelect:(npcId:string)=>void;controls?:ReactNode}){
  const viewportRef=useRef<HTMLDivElement|null>(null);
  const pointersRef=useRef(new Map<number,PointerPoint>());
  const gestureRef=useRef<{lastSingle?:PointerPoint;distance?:number;midpoint?:PointerPoint}>({});
  const[viewport,setViewport]=useState({width:390,height:520});
  const[camera,setCamera]=useState<Camera>({x:0,y:0,scale:.58});
  const[filterOpen,setFilterOpen]=useState(false);
  const[visibleFolders,setVisibleFolders]=useState<PeopleFolderId[]>([...DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS]);
  const[expandedFolders,setExpandedFolders]=useState<PeopleFolderId[]>([...DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS]);
  const[query,setQuery]=useState('');
  const[includeDeceased,setIncludeDeceased]=useState(true);
  const[includeFormer,setIncludeFormer]=useState(true);
  const[minRelationship,setMinRelationship]=useState(0);

  const model=useMemo(()=>buildPeopleWorkspaceModel(state),[state]);
  const projection=useMemo(()=>projectPeopleWorkspace(model,{
    visibleFolderIds:visibleFolders,expandedFolderIds:expandedFolders,query,includeDeceased,includeFormer,minRelationship,
  }),[model,visibleFolders,expandedFolders,query,includeDeceased,includeFormer,minRelationship]);
  const nodeById=useMemo(()=>new Map(projection.nodes.map(node=>[node.id,node] as const)),[projection.nodes]);

  useLayoutEffect(()=>{
    const element=viewportRef.current;if(!element)return;
    const update=()=>setViewport({width:Math.max(1,element.clientWidth),height:Math.max(1,element.clientHeight)});
    update();const observer=new ResizeObserver(update);observer.observe(element);return()=>observer.disconnect();
  },[]);

  const worldBounds=useMemo(()=>{
    const margin=NODE_CULL_BUFFER/camera.scale;
    return{
      left:(-viewport.width/2-camera.x)/camera.scale-margin,
      right:(viewport.width/2-camera.x)/camera.scale+margin,
      top:(-viewport.height/2-camera.y)/camera.scale-margin,
      bottom:(viewport.height/2-camera.y)/camera.scale+margin,
    };
  },[camera,viewport]);

  const renderedNodes=useMemo(()=>projection.nodes.filter(node=>{
    const size=nodeSize(node.kind);return node.x+size.w/2>=worldBounds.left&&node.x-size.w/2<=worldBounds.right&&node.y+size.h/2>=worldBounds.top&&node.y-size.h/2<=worldBounds.bottom;
  }),[projection.nodes,worldBounds]);
  const renderedIds=useMemo(()=>new Set(renderedNodes.map(node=>node.id)),[renderedNodes]);
  const renderedEdges=useMemo(()=>projection.edges.filter(edge=>renderedIds.has(edge.from)&&renderedIds.has(edge.to)),[projection.edges,renderedIds]);

  const toggleFolder=(folderId:PeopleFolderId)=>setExpandedFolders(current=>current.includes(folderId)?current.filter(id=>id!==folderId):[...current,folderId]);
  const toggleVisible=(folderId:PeopleFolderId)=>{
    setVisibleFolders(current=>{
      if(current.includes(folderId)){
        setExpandedFolders(expanded=>expanded.filter(id=>id!==folderId));
        return current.filter(id=>id!==folderId);
      }
      return PEOPLE_FOLDERS.map(folder=>folder.id).filter(id=>id===folderId||current.includes(id));
    });
  };
  const resetFilters=()=>{
    setVisibleFolders([...DEFAULT_PEOPLE_WORKSPACE_VISIBLE_FOLDERS]);
    setExpandedFolders([...DEFAULT_PEOPLE_WORKSPACE_EXPANDED_FOLDERS]);
    setQuery('');setIncludeDeceased(true);setIncludeFormer(true);setMinRelationship(0);
  };

  const focusPlayer=()=>setCamera({x:0,y:0,scale:.78});
  const fitVisible=()=>{
    if(!projection.nodes.length)return;
    let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
    for(const node of projection.nodes){
      const size=nodeSize(node.kind);left=Math.min(left,node.x-size.w/2);right=Math.max(right,node.x+size.w/2);top=Math.min(top,node.y-size.h/2);bottom=Math.max(bottom,node.y+size.h/2);
    }
    const width=Math.max(1,right-left),height=Math.max(1,bottom-top);
    const scale=clampScale(Math.min(1.25,(viewport.width-56)/(width+180),(viewport.height-72)/(height+180)));
    const centerX=(left+right)/2,centerY=(top+bottom)/2;
    setCamera({x:-centerX*scale,y:-centerY*scale,scale});
  };

  const zoomAt=(screenX:number,screenY:number,nextScale:number)=>{
    const rect=viewportRef.current?.getBoundingClientRect();if(!rect)return;
    setCamera(current=>{
      const scale=clampScale(nextScale);
      const localX=screenX-rect.left-rect.width/2;
      const localY=screenY-rect.top-rect.height/2;
      const worldX=(localX-current.x)/current.scale;
      const worldY=(localY-current.y)/current.scale;
      return{x:localX-worldX*scale,y:localY-worldY*scale,scale};
    });
  };

  const onWheel=(event:ReactWheelEvent<HTMLDivElement>)=>{
    event.preventDefault();const factor=event.deltaY>0 ? .9 : 1.1;zoomAt(event.clientX,event.clientY,camera.scale*factor);
  };
  const interactiveTarget=(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest('button,input,label'));
  const point=(event:ReactPointerEvent<HTMLDivElement>)=>({x:event.clientX,y:event.clientY});
  const distance=(a:PointerPoint,b:PointerPoint)=>Math.hypot(a.x-b.x,a.y-b.y);
  const midpoint=(a:PointerPoint,b:PointerPoint)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});

  const onPointerDown=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(interactiveTarget(event.target))return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId,point(event));
    const values=[...pointersRef.current.values()];
    if(values.length===1)gestureRef.current={lastSingle:values[0]};
    else if(values.length>=2)gestureRef.current={distance:distance(values[0]!,values[1]!),midpoint:midpoint(values[0]!,values[1]!)};
  };
  const onPointerMove=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(!pointersRef.current.has(event.pointerId))return;
    pointersRef.current.set(event.pointerId,point(event));
    const values=[...pointersRef.current.values()];
    if(values.length===1){
      const previous=gestureRef.current.lastSingle;const next=values[0]!;
      if(previous)setCamera(current=>({...current,x:current.x+next.x-previous.x,y:current.y+next.y-previous.y}));
      gestureRef.current={lastSingle:next};return;
    }
    if(values.length>=2){
      const a=values[0]!,b=values[1]!;const nextDistance=distance(a,b);const nextMidpoint=midpoint(a,b);
      const previousDistance=gestureRef.current.distance;const previousMidpoint=gestureRef.current.midpoint;
      const rect=viewportRef.current?.getBoundingClientRect();
      if(previousDistance&&previousMidpoint&&rect){
        setCamera(current=>{
          const scale=clampScale(current.scale*(nextDistance/previousDistance));
          const previousLocal={x:previousMidpoint.x-rect.left-rect.width/2,y:previousMidpoint.y-rect.top-rect.height/2};
          const nextLocal={x:nextMidpoint.x-rect.left-rect.width/2,y:nextMidpoint.y-rect.top-rect.height/2};
          const world={x:(previousLocal.x-current.x)/current.scale,y:(previousLocal.y-current.y)/current.scale};
          return{x:nextLocal.x-world.x*scale,y:nextLocal.y-world.y*scale,scale};
        });
      }
      gestureRef.current={distance:nextDistance,midpoint:nextMidpoint};
    }
  };
  const endPointer=(event:ReactPointerEvent<HTMLDivElement>)=>{
    pointersRef.current.delete(event.pointerId);
    const values=[...pointersRef.current.values()];
    gestureRef.current=values.length===1?{lastSingle:values[0]}:values.length>=2?{distance:distance(values[0]!,values[1]!),midpoint:midpoint(values[0]!,values[1]!)}:{};
  };

  const worldStyle={transform:`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`} as const;
  const visibleCount=projection.visiblePersonIds.length;

  return <section className="threadspace-card" aria-label="Threadspace relationship workspace">
    <button
      className={`threadspace-filter-toggle ${filterOpen?'active':''}`}
      onClick={()=>setFilterOpen(value=>!value)}
      aria-expanded={filterOpen}
      aria-controls="threadspace-filter-panel"
    >Filters</button>

    {filterOpen&&<aside id="threadspace-filter-panel" className="threadspace-filter-panel" aria-label="Threadspace filters and view controls">
      <div className="threadspace-filter-section">
        <div className="threadspace-panel-heading"><strong>View controls</strong><small>{visibleCount} visible</small></div>
        <div className="threadspace-view-primary"><button onClick={focusPlayer}>Focus on You</button><button onClick={fitVisible}>Fit Visible</button></div>
        <div className="threadspace-zoom-controls">
          <button aria-label="Zoom out" onClick={()=>setCamera(current=>({...current,scale:clampScale(current.scale*.85)}))}>−</button>
          <span>{Math.round(camera.scale*100)}%</span>
          <button aria-label="Zoom in" onClick={()=>setCamera(current=>({...current,scale:clampScale(current.scale*1.15)}))}>＋</button>
        </div>
      </div>

      <label className="threadspace-search"><span>Find a person, relationship, role, or world</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search Threadspace"/></label>
      <div className="threadspace-filter-grid">
        <label><input type="checkbox" checked={includeDeceased} onChange={event=>setIncludeDeceased(event.target.checked)}/>Show deceased</label>
        <label><input type="checkbox" checked={includeFormer} onChange={event=>setIncludeFormer(event.target.checked)}/>Show former affiliations</label>
      </div>
      <label className="threadspace-range"><span>Minimum relationship <strong>{minRelationship}</strong></span><input type="range" min="0" max="90" step="5" value={minRelationship} onChange={event=>setMinRelationship(Number(event.target.value))}/></label>
      <div className="threadspace-folder-filter"><strong>Visible circles</strong>{PEOPLE_FOLDERS.map(folder=><label key={folder.id}><input type="checkbox" checked={visibleFolders.includes(folder.id)} onChange={()=>toggleVisible(folder.id)}/><span>{folderGlyph[folder.id]}</span>{folder.title}</label>)}</div>
      <div className="threadspace-filter-actions"><button onClick={()=>setExpandedFolders([...visibleFolders])}>Expand Visible</button><button onClick={()=>setExpandedFolders([])}>Collapse All</button><button onClick={resetFilters}>Reset</button></div>
      {controls}
    </aside>}

    <div
      className="threadspace-viewport"
      ref={viewportRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <div className="threadspace-world" style={worldStyle}>
        <svg className="threadspace-edges" width="1" height="1" aria-hidden="true">
          {renderedEdges.map(edge=>{
            const from=nodeById.get(edge.from),to=nodeById.get(edge.to);if(!from||!to)return null;
            const labelX=(from.x+to.x)/2,labelY=(from.y+to.y)/2;
            return <g key={edge.id} className={`threadspace-edge threadspace-edge--${edge.kind}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}/>
              {camera.scale>=.48&&<text x={labelX} y={labelY-5}>{edge.label}</text>}
            </g>;
          })}
        </svg>
        {renderedNodes.map(node=>{
          if(node.kind==='player')return <div className="threadspace-node threadspace-node--player" key={node.id} style={{left:node.x,top:node.y}}><span className="threadspace-node-glyph">YOU</span><div><strong>{node.name}</strong><small>Age {state.character.age} · center of this life</small></div></div>;
          if(node.kind==='folder'){
            const folderId=node.folderId!;const folder=model.folders.find(item=>item.id===folderId)!;
            return <button className={`threadspace-node threadspace-node--folder ${node.expanded?'expanded':''}`} key={node.id} style={{left:node.x,top:node.y}} onClick={()=>toggleFolder(folderId)} aria-expanded={node.expanded}>
              <span className="threadspace-node-glyph">{folderGlyph[folderId]}</span><div><strong>{folder.title}</strong><small>{folder.count} {folder.count===1?'person':'people'} · {node.expanded?'collapse':'expand'}</small></div>
            </button>;
          }
          const person=node.person!;const rel=state.relationships.find(item=>item.npcId===person.id);const memberships=person.memberships.filter(item=>expandedFolders.includes(item.folderId)&&visibleFolders.includes(item.folderId));
          return <button className={`threadspace-node threadspace-node--person ${!person.alive?'deceased':''}`} key={node.id} style={{left:node.x,top:node.y}} onClick={()=>onSelect(person.id)}>
            <span className="threadspace-person-mark">{person.name[0]}</span><div className="threadspace-person-copy"><strong>{person.name}</strong><small>{rel?.type.replaceAll('_',' ')??'connection'} · age {person.age}{!person.alive?' · deceased':''}</small>{memberships.length>1&&<em>{memberships.length} circles</em>}</div><b>{Math.round(person.relationshipScore)}</b>
          </button>;
        })}
      </div>
      {projection.visibleFolderIds.length===0&&<div className="threadspace-empty">Turn on at least one relationship circle in Filters.</div>}
      {projection.visibleFolderIds.length>0&&projection.expandedFolderIds.length===0&&<div className="threadspace-hint">Tap a circle to unfold its people.</div>}
    </div>
  </section>;
}
