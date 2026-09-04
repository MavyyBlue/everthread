import { useMemo, type CSSProperties, type ReactNode } from 'react';
import type { GameState } from '../types/game';
import type { PeopleRelationshipGraph, PeopleGraphEdge } from '../systems/PeopleGraphSystem';

interface TreeEntry {
  nodeId: string;
  via?: PeopleGraphEdge;
  children: TreeEntry[];
  extraEdges: PeopleGraphEdge[];
}

function edgeOther(edge: PeopleGraphEdge, id: string) {
  return edge.from === id ? edge.to : edge.from;
}

function makeSpanningTree(graph: PeopleRelationshipGraph): TreeEntry {
  const adjacency = new Map<string, PeopleGraphEdge[]>();
  for (const node of graph.nodes) adjacency.set(node.id, []);
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push(edge);
    adjacency.get(edge.to)?.push(edge);
  }
  const visited = new Set<string>([graph.playerId]);
  const selectedEdgeIds = new Set<string>();
  const root: TreeEntry = { nodeId: graph.playerId, children: [], extraEdges: [] };
  const queue: TreeEntry[] = [root];
  while (queue.length) {
    const current = queue.shift()!;
    const edges = (adjacency.get(current.nodeId) ?? []).slice().sort((a, b) => {
      const rank = (edge: PeopleGraphEdge) => edge.kind === 'parent_child' ? 0 : edge.kind === 'partner' ? 1 : 2;
      return rank(a) - rank(b) || a.label.localeCompare(b.label);
    });
    for (const edge of edges) {
      const other = edgeOther(edge, current.nodeId);
      if (visited.has(other)) continue;
      visited.add(other);
      selectedEdgeIds.add(edge.id);
      const child: TreeEntry = { nodeId: other, via: edge, children: [], extraEdges: [] };
      current.children.push(child);
      queue.push(child);
    }
  }
  const entries = new Map<string, TreeEntry>();
  const collect = (entry: TreeEntry) => { entries.set(entry.nodeId, entry); entry.children.forEach(collect); };
  collect(root);
  for (const edge of graph.edges) {
    if (selectedEdgeIds.has(edge.id)) continue;
    entries.get(edge.from)?.extraEdges.push(edge);
    entries.get(edge.to)?.extraEdges.push(edge);
  }
  return root;
}

function connectionText(edge: PeopleGraphEdge | undefined, currentId: string) {
  if (!edge) return undefined;
  if (edge.kind === 'parent_child') {
    return edge.to === currentId ? `child link · ${edge.label}` : `parent link · ${edge.label}`;
  }
  return edge.label;
}

export function RelationshipTree({state,graph,onSelect}:{state:GameState;graph:PeopleRelationshipGraph;onSelect:(npcId:string)=>void}) {
  const tree = useMemo(() => makeSpanningTree(graph), [graph]);
  const nodeById = useMemo(() => new Map(graph.nodes.map(node => [node.id, node] as const)), [graph.nodes]);

  const renderEntry = (entry: TreeEntry, depth: number): ReactNode => {
    const node = nodeById.get(entry.nodeId);
    if (!node) return null;
    const rel = !node.isPlayer ? state.relationships.find(r => r.npcId === node.id) : undefined;
    const npc = !node.isPlayer ? state.npcs[node.id] : undefined;
    const extra = entry.extraEdges
      .map(edge => {
        const otherId = edgeOther(edge, node.id);
        const other = nodeById.get(otherId);
        return other ? `${edge.label} · ${other.name}` : undefined;
      })
      .filter(Boolean) as string[];
    return <div className="relationship-tree-entry" key={entry.nodeId} style={{'--tree-depth':Math.min(depth,4)} as CSSProperties}>
      <div className="relationship-tree-branch">
        {entry.via&&<span className="relationship-tree-link-label">{connectionText(entry.via,node.id)}</span>}
        {node.isPlayer?
          <div className="relationship-tree-card relationship-tree-card--player"><div className="npc-monogram">{state.character.firstName[0]}</div><div className="grow"><strong>{node.name}</strong><small>You · age {node.age}</small></div><span className="tree-you-badge">YOU</span></div>
          :<button className="relationship-tree-card" onClick={()=>onSelect(node.id)}><div className="npc-monogram">{npc?.firstName[0]??'?'}</div><div className="grow"><strong>{node.name}</strong><small>To you: {rel?.type.replaceAll('_',' ')??'connection'} · age {node.age}{!node.alive?' · deceased':''}</small>{extra.length>0&&<small className="tree-extra-link">Also linked: {extra.slice(0,2).join(' · ')}</small>}<div className="mini-meter"><span style={{width:`${Math.max(0,Math.min(100,node.relationshipScore??0))}%`}}/></div></div><strong>{Math.round(node.relationshipScore??0)}</strong></button>}
      </div>
      {entry.children.length>0&&<div className="relationship-tree-children">{entry.children.map(child=>renderEntry(child,depth+1))}</div>}
    </div>;
  };

  return <div className="relationship-tree" aria-label={`${graph.folder.title} relationship tree`}>{renderEntry(tree,0)}</div>;
}
