import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { FAMILY_RELATIONSHIP_TYPE_SET } from '../core/familyRelations';
import type { GameState, Relationship, RelationshipType } from '../types/game';

export type PlayerKinshipType = Extract<RelationshipType,
  | 'parent' | 'stepparent' | 'grandparent'
  | 'sibling' | 'half_sibling' | 'stepsibling'
  | 'aunt_uncle' | 'cousin' | 'niece_nephew'
  | 'child' | 'grandchild'
>;

const KINSHIP_PRIORITY:Record<PlayerKinshipType,number>={
  parent:100,child:100,
  stepparent:92,sibling:90,half_sibling:88,stepsibling:82,
  grandparent:78,grandchild:78,
  aunt_uncle:66,niece_nephew:66,
  cousin:54,
};

const DEFAULT_SCORE:Record<PlayerKinshipType,number>={
  parent:72,stepparent:52,grandparent:62,sibling:58,half_sibling:54,stepsibling:45,
  aunt_uncle:50,cousin:46,niece_nephew:48,child:72,grandchild:62,
};

const ROMANTIC_HISTORY_TYPES = new Set<RelationshipType>(['partner','fiance','spouse','ex']);

function addLink(map:Map<string,Set<string>>,from:string,to:string){
  if(!from||!to||from===to)return;
  let set=map.get(from);if(!set){set=new Set<string>();map.set(from,set);}set.add(to);
}

function topologyIndexes(state:GameState){
  const childrenByParent=new Map<string,Set<string>>();
  const parentsByChild=new Map<string,Set<string>>();
  for(const npc of Object.values(state.npcs)){
    for(const parentId of npc.parentIds??[]){addLink(childrenByParent,parentId,npc.id);addLink(parentsByChild,npc.id,parentId);}
    for(const childId of npc.childIds??[]){addLink(childrenByParent,npc.id,childId);addLink(parentsByChild,childId,npc.id);}
  }
  return{childrenByParent,parentsByChild};
}

function livingOrHistoricalNpc(state:GameState,id:string){return id!==state.character.id&&Boolean(state.npcs[id]);}

export function derivePlayerFamilyTopology(state:GameState):Map<string,PlayerKinshipType>{
  const {childrenByParent,parentsByChild}=topologyIndexes(state);const playerId=state.character.id;
  const result=new Map<string,PlayerKinshipType>();
  const add=(id:string,type:PlayerKinshipType)=>{
    if(!livingOrHistoricalNpc(state,id))return;
    const existing=result.get(id);if(!existing||KINSHIP_PRIORITY[type]>KINSHIP_PRIORITY[existing])result.set(id,type);
  };
  const parents=new Set(parentsByChild.get(playerId)??[]);
  for(const rel of state.relationships)if(rel.type==='parent'&&state.npcs[rel.npcId])parents.add(rel.npcId);
  const children=new Set(childrenByParent.get(playerId)??[]);
  for(const rel of state.relationships)if(rel.type==='child'&&state.npcs[rel.npcId])children.add(rel.npcId);

  for(const id of parents)add(id,'parent');
  for(const id of children)add(id,'child');

  const grandparents=new Set<string>();
  for(const parentId of parents){
    for(const grandparentId of parentsByChild.get(parentId)??[]){grandparents.add(grandparentId);add(grandparentId,'grandparent');}
    const parent=state.npcs[parentId];const stepId=parent?.partnerId;
    if(stepId&&!parents.has(stepId)){add(stepId,'stepparent');for(const stepChildId of childrenByParent.get(stepId)??[])if(stepChildId!==playerId)add(stepChildId,'stepsibling');}
  }

  const siblings=new Set<string>();
  for(const parentId of parents){for(const childId of childrenByParent.get(parentId)??[])if(childId!==playerId)siblings.add(childId);}
  for(const siblingId of siblings){
    const siblingParents=parentsByChild.get(siblingId)??new Set<string>();
    let shared=0;for(const parentId of parents)if(siblingParents.has(parentId))shared+=1;
    const full=shared>=2&&parents.size>=2&&siblingParents.size>=2;
    add(siblingId,full?'sibling':'half_sibling');
  }

  const auntsUncles=new Set<string>();
  for(const parentId of parents){
    const parentParents=parentsByChild.get(parentId)??new Set<string>();
    for(const grandparentId of parentParents){
      for(const candidateId of childrenByParent.get(grandparentId)??[]){
        if(candidateId===parentId||parents.has(candidateId)||candidateId===playerId)continue;
        auntsUncles.add(candidateId);add(candidateId,'aunt_uncle');
      }
    }
  }

  for(const relativeId of siblings){for(const childId of childrenByParent.get(relativeId)??[])add(childId,'niece_nephew');}
  for(const auntUncleId of auntsUncles){for(const childId of childrenByParent.get(auntUncleId)??[])add(childId,'cousin');}
  for(const childId of children){for(const grandchildId of childrenByParent.get(childId)??[])add(grandchildId,'grandchild');}

  return result;
}

function derivedRelationship(state:GameState,npcId:string,type:PlayerKinshipType):Relationship{
  const npc=state.npcs[npcId]!;const rng=createRng(`${state.seed}-family-topology-${state.character.id}-${npcId}`);
  return{
    id:`rel-family-${state.character.id}-${npcId}`,
    npcId,type,score:clamp(DEFAULT_SCORE[type]+rng.int(-8,8)),attraction:0,
    compatibility:clamp(52+rng.int(-12,18)),yearsKnown:Math.max(0,Math.min(state.character.age,npc.age)),
  };
}

export function syncPlayerFamilyTopology(state:GameState){
  const topology=derivePlayerFamilyTopology(state);const byNpc=new Map(state.relationships.map(rel=>[rel.npcId,rel] as const));let added=0;let retyped=0;
  for(const [npcId,type] of topology){
    const existing=byNpc.get(npcId);
    if(!existing){const rel=derivedRelationship(state,npcId,type);state.relationships.push(rel);byNpc.set(npcId,rel);added+=1;continue;}
    if(existing.type===type)continue;
    // Structural family identity wins over friendship/professional/enemy labels. Active romance and
    // romantic history are left untouched here so topology repair never silently dissolves a player
    // relationship or erases an established ex-partner history; impossible graph states can be
    // diagnosed separately without rewriting unrelated relationship history.
    if(!ROMANTIC_HISTORY_TYPES.has(existing.type)){
      const wasFamily=FAMILY_RELATIONSHIP_TYPE_SET.has(existing.type);existing.type=type;existing.attraction=0;if(!wasFamily)existing.compatibility=clamp(existing.compatibility);retyped+=1;
    }
  }
  return{added,retyped,total:topology.size};
}

export function kinshipTypeForPlayer(state:GameState,npcId:string){return derivePlayerFamilyTopology(state).get(npcId);}
