import type { GameState, Relationship, RelationshipType } from '../types/game';

export type PeopleFolderId = 'player_family' | 'relatives' | 'friends' | 'romance' | 'school' | 'work';

export interface PeopleFolderDefinition {
  id: PeopleFolderId;
  title: string;
  description: string;
  relationshipTypes: readonly RelationshipType[];
}

export interface PeopleFolderSummary extends PeopleFolderDefinition {
  count: number;
  previewNames: string[];
}

export type PeopleGraphEdgeKind = 'parent_child' | 'partner' | 'direct';

export interface PeopleGraphNode {
  id: string;
  isPlayer: boolean;
  name: string;
  age: number;
  alive: boolean;
  relationshipToPlayer?: RelationshipType;
  relationshipScore?: number;
}

export interface PeopleGraphEdge {
  id: string;
  from: string;
  to: string;
  kind: PeopleGraphEdgeKind;
  label: string;
}

export interface PeopleRelationshipGraph {
  folder: PeopleFolderDefinition;
  playerId: string;
  nodes: PeopleGraphNode[];
  edges: PeopleGraphEdge[];
}

export const PEOPLE_FOLDERS: readonly PeopleFolderDefinition[] = [
  {
    id: 'player_family',
    title: 'Player Family',
    description: 'Parents, guardians, current partner, children, and descendants closest to your household.',
    relationshipTypes: ['parent', 'stepparent', 'partner', 'fiance', 'spouse', 'child', 'grandchild'],
  },
  {
    id: 'relatives',
    title: 'Relatives',
    description: 'Grandparents, siblings, step and half family, nieces, and nephews.',
    relationshipTypes: ['grandparent', 'sibling', 'half_sibling', 'stepsibling', 'niece_nephew'],
  },
  {
    id: 'friends',
    title: 'Friends & Social',
    description: 'Friends, best friends, and people where the relationship has become openly hostile.',
    relationshipTypes: ['friend', 'best_friend', 'enemy'],
  },
  {
    id: 'romance',
    title: 'Romantic History',
    description: 'Current and former romantic relationships across this life.',
    relationshipTypes: ['partner', 'fiance', 'spouse', 'ex'],
  },
  {
    id: 'school',
    title: 'School',
    description: 'Persistent classmates and teachers from your education history.',
    relationshipTypes: ['classmate', 'teacher'],
  },
  {
    id: 'work',
    title: 'Work',
    description: 'Coworkers and bosses connected to your working life.',
    relationshipTypes: ['coworker', 'boss'],
  },
] as const;

function relationByNpc(state: GameState) {
  return new Map(state.relationships.map(rel => [rel.npcId, rel] as const));
}

export function folderForId(id: PeopleFolderId): PeopleFolderDefinition {
  return PEOPLE_FOLDERS.find(folder => folder.id === id) ?? PEOPLE_FOLDERS[0]!;
}

export function relationshipsForFolder(state: GameState, folderId: PeopleFolderId): Relationship[] {
  const folder = folderForId(folderId);
  const allowed = new Set<RelationshipType>(folder.relationshipTypes);
  return state.relationships.filter(rel => allowed.has(rel.type) && Boolean(state.npcs[rel.npcId]));
}

export function peopleFolderSummaries(state: GameState): PeopleFolderSummary[] {
  return PEOPLE_FOLDERS.map(folder => {
    const rels = relationshipsForFolder(state, folder.id);
    return {
      ...folder,
      count: rels.length,
      previewNames: rels
        .slice()
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(rel => {
          const npc = state.npcs[rel.npcId]!;
          return `${npc.firstName} ${npc.lastName}`;
        }),
    };
  });
}

function directLabel(type: RelationshipType): string {
  return type.replaceAll('_', ' ');
}

function parentChildLabel(state: GameState, from: string, to: string): string {
  if (from === state.character.id) return 'your child';
  if (to === state.character.id) return 'your parent';
  const fromNpc = state.npcs[from];
  const toNpc = state.npcs[to];
  if (fromNpc && toNpc) return `${fromNpc.firstName} → ${toNpc.firstName}`;
  return 'parent → child';
}

export function buildPeopleRelationshipGraph(state: GameState, folderId: PeopleFolderId): PeopleRelationshipGraph {
  const folder = folderForId(folderId);
  const rels = relationshipsForFolder(state, folderId);
  const relMap = relationByNpc(state);
  const memberIds = new Set(rels.map(rel => rel.npcId));
  const playerId = state.character.id;
  const nodes: PeopleGraphNode[] = [
    {
      id: playerId,
      isPlayer: true,
      name: `${state.character.firstName} ${state.character.lastName}`,
      age: state.character.age,
      alive: state.character.alive,
    },
    ...rels.map(rel => {
      const npc = state.npcs[rel.npcId]!;
      return {
        id: npc.id,
        isPlayer: false,
        name: `${npc.firstName} ${npc.lastName}`,
        age: npc.age,
        alive: npc.alive,
        relationshipToPlayer: rel.type,
        relationshipScore: rel.score,
      } satisfies PeopleGraphNode;
    }),
  ];

  const edges: PeopleGraphEdge[] = [];
  const edgeKeys = new Set<string>();
  const addEdge = (from: string, to: string, kind: PeopleGraphEdgeKind, label: string) => {
    if (from === to) return;
    const directional = kind === 'parent_child';
    const key = directional ? `${kind}:${from}>${to}` : `${kind}:${[from, to].sort().join('|')}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ id: key, from, to, kind, label });
  };

  // Player ↔ NPC structural links. These are the edges we actually know from state.
  for (const rel of rels) {
    const npc = state.npcs[rel.npcId]!;
    if (npc.parentIds.includes(playerId)) addEdge(playerId, npc.id, 'parent_child', parentChildLabel(state, playerId, npc.id));
    if (npc.childIds.includes(playerId)) addEdge(npc.id, playerId, 'parent_child', parentChildLabel(state, npc.id, playerId));
    if (['partner', 'fiance', 'spouse', 'ex'].includes(rel.type)) addEdge(playerId, npc.id, 'partner', directLabel(rel.type));
  }

  // NPC ↔ NPC links only come from persistent parent/child and partner fields. We never infer an edge from names or age.
  const members = [...memberIds].map(id => state.npcs[id]).filter(Boolean);
  for (const npc of members) {
    for (const parentId of npc!.parentIds) {
      if (memberIds.has(parentId)) addEdge(parentId, npc!.id, 'parent_child', parentChildLabel(state, parentId, npc!.id));
    }
    for (const childId of npc!.childIds) {
      if (memberIds.has(childId)) addEdge(npc!.id, childId, 'parent_child', parentChildLabel(state, npc!.id, childId));
    }
    if (npc!.partnerId && memberIds.has(npc!.partnerId)) {
      const partner = state.npcs[npc!.partnerId];
      const status = npc!.maritalStatus === 'married' && partner?.maritalStatus === 'married' ? 'spouses' : 'partners';
      addEdge(npc!.id, npc!.partnerId, 'partner', status);
    }
  }

  // Build reachability from the player using structural edges. Any direct relationship that is not structurally connected
  // in this folder gets one explicit player edge so every folder remains navigable without inventing family data.
  const reachable = new Set<string>([playerId]);
  const expandReachability = () => {
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of edges) {
        if (reachable.has(edge.from) && !reachable.has(edge.to)) { reachable.add(edge.to); changed = true; }
        if (reachable.has(edge.to) && !reachable.has(edge.from)) { reachable.add(edge.from); changed = true; }
      }
    }
  };
  expandReachability();
  for (const rel of rels) {
    if (!reachable.has(rel.npcId)) {
      addEdge(playerId, rel.npcId, 'direct', directLabel(rel.type));
      reachable.add(rel.npcId);
      expandReachability();
    }
  }

  // If adding one direct edge made a whole NPC subgraph reachable, keep the graph minimal and do not add redundant spokes.
  for (const rel of rels) {
    if (edges.some(edge => edge.from === rel.npcId || edge.to === rel.npcId)) continue;
    addEdge(playerId, rel.npcId, 'direct', directLabel(rel.type));
  }

  // Stable order improves deterministic snapshots and keeps the mobile tree from jumping between renders.
  nodes.sort((a, b) => Number(b.isPlayer) - Number(a.isPlayer) || (a.relationshipToPlayer ?? '').localeCompare(b.relationshipToPlayer ?? '') || a.name.localeCompare(b.name));
  edges.sort((a, b) => a.id.localeCompare(b.id));

  // Keep relationship map referenced so future graph enrichments can use direct scores without rebuilding it.
  void relMap;
  return { folder, playerId, nodes, edges };
}
