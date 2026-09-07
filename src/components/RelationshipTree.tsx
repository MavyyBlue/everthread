import { useMemo, type CSSProperties, type ReactNode } from 'react';
import type { GameState } from '../types/game';
import type { PeopleRelationshipGraph, PeopleGraphEdge } from '../systems/PeopleGraphSystem';

interface TreeEntry {nodeId:string;via?:PeopleGraphEdge;children:TreeEntry[];extraEdges:PeopleGraphEdge[];}
function edgeOther(edge:PeopleGraphEdge,id:string){return edge.from===id?edge.to:edge.from;}

function makeSpanningTree(graph:PeopleRelationshipGraph):TreeEntry{
  const adjacency=new Map<string,PeopleGraphEdge[]>();for(const node of graph.nodes)adjacency.set(node.id,[]);for(const edge of graph.edges){adjacency.get(edge.from)?.push(edge);adjacency.get(edge.to)?.push(edge);}
  const nodes=new Map(graph.nodes.map(node=>[node.id,node] as const));const visited=new Set<string>([graph.playerId]);const selectedEdgeIds=new Set<string>();const root:TreeEntry={nodeId:graph.playerId,children:[],extraEdges:[]};const queue:TreeEntry[]=[root];
  while(queue.length){const current=queue.shift()!;const edges=(adjacency.get(current.nodeId)??[]).slice().sort((a,b)=>{
    const aNode=nodes.get(edgeOther(a,current.nodeId));const bNode=nodes.get(edgeOther(b,current.nodeId));
    if(['school','work','career'].includes(graph.folder.id)){const status=Number(bNode?.affiliation?.status==='current')-Number(aNode?.affiliation?.status==='current');if(status)return status;const recent=(bNode?.affiliation?.endedAge??bNode?.affiliation?.startedAge??-1)-(aNode?.affiliation?.endedAge??aNode?.affiliation?.startedAge??-1);if(recent)return recent;}
    const rank=(edge:PeopleGraphEdge)=>edge.kind==='parent_child'?0:edge.kind==='partner'?1:2;const ar=rank(a)-rank(b);if(ar)return ar;
    return a.label.localeCompare(b.label)||(aNode?.name??'').localeCompare(bNode?.name??'');
  });
    for(const edge of edges){const other=edgeOther(edge,current.nodeId);if(visited.has(other))continue;visited.add(other);selectedEdgeIds.add(edge.id);const child:TreeEntry={nodeId:other,via:edge,children:[],extraEdges:[]};current.children.push(child);queue.push(child);}
  }
  const entries=new Map<string,TreeEntry>();const collect=(entry:TreeEntry)=>{entries.set(entry.nodeId,entry);entry.children.forEach(collect);};collect(root);for(const edge of graph.edges){if(selectedEdgeIds.has(edge.id))continue;entries.get(edge.from)?.extraEdges.push(edge);entries.get(edge.to)?.extraEdges.push(edge);}return root;
}

function connectionText(edge:PeopleGraphEdge|undefined,currentId:string){if(!edge)return undefined;if(edge.kind==='parent_child')return edge.to===currentId?`child link · ${edge.label}`:`parent link · ${edge.label}`;return edge.label;}
function roleText(role:string){return role.replaceAll('_',' ');}

export function RelationshipTree({state,graph,onSelect}:{state:GameState;graph:PeopleRelationshipGraph;onSelect:(npcId:string)=>void}){
  const tree=useMemo(()=>makeSpanningTree(graph),[graph]);const nodeById=useMemo(()=>new Map(graph.nodes.map(node=>[node.id,node] as const)),[graph.nodes]);
  const renderEntry=(entry:TreeEntry,depth:number):ReactNode=>{const node=nodeById.get(entry.nodeId);if(!node)return null;const rel=!node.isPlayer?state.relationships.find(r=>r.npcId===node.id):undefined;const npc=!node.isPlayer?state.npcs[node.id]:undefined;const extra=entry.extraEdges.map(edge=>{const otherId=edgeOther(edge,node.id);const other=nodeById.get(otherId);return other?`${edge.label} · ${other.name}`:undefined;}).filter(Boolean) as string[];const former=node.affiliation?.status==='former';const affiliation=node.affiliation?`${node.affiliation.status==='current'?'Current':'Former'} ${roleText(node.affiliation.role)} · ${node.affiliation.worldName}`:undefined;
    return <div className="relationship-tree-entry" key={entry.nodeId} style={{'--tree-depth':Math.min(depth,4)} as CSSProperties}><div className="relationship-tree-branch">{entry.via&&<span className="relationship-tree-link-label">{connectionText(entry.via,node.id)}</span>}{node.isPlayer?<div className="relationship-tree-card relationship-tree-card--player"><div className="npc-monogram">{state.character.firstName[0]}</div><div className="grow"><strong>{node.name}</strong><small>You · age {node.age}</small></div><span className="tree-you-badge">YOU</span></div>:<button className="relationship-tree-card" style={former?{opacity:.54,filter:'saturate(.55)'}:node.affiliation?.status==='current'?{background:'color-mix(in srgb,var(--accent) 8%,var(--surface))',borderColor:'color-mix(in srgb,var(--accent) 28%,var(--line))'}:undefined} onClick={()=>onSelect(node.id)}><div className="npc-monogram">{npc?.firstName[0]??'?'}</div><div className="grow"><strong>{node.name}</strong>{affiliation&&<small>{affiliation}</small>}<small>To you: {rel?.type.replaceAll('_',' ')??'connection'} · age {node.age}{!node.alive?' · deceased':''}</small>{extra.length>0&&<small className="tree-extra-link">Also linked: {extra.slice(0,2).join(' · ')}</small>}<div className="mini-meter"><span style={{width:`${Math.max(0,Math.min(100,node.relationshipScore??0))}%`,opacity:former ? .42 : 1}}/></div></div>{node.affiliation?.status==='current'?<span className="tree-you-badge">CURRENT · {Math.round(node.relationshipScore??0)}</span>:<strong>{Math.round(node.relationshipScore??0)}</strong>}</button>}</div>{entry.children.length>0&&<div className="relationship-tree-children">{entry.children.map(child=>renderEntry(child,depth+1))}</div>}</div>;
  };
  return <div className="relationship-tree" aria-label={`${graph.folder.title} relationship tree`}>{renderEntry(tree,0)}</div>;
}
