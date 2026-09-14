import { NPC_PREFERENCE_TAG_IDS, npcPreferenceTagById } from '../data/npcPreferences';
import { createRng } from '../core/rng';
import type { GameState, Npc, Relationship, RelationshipType } from '../types/game';
import type { KnownNpcPreference, NpcPreferenceLevel, NpcPreferenceProfile, NpcPreferenceTag } from '../types/npcPreferences';

export const NPC_PREFERENCE_PROFILE_VERSION=1 as const;
export const NPC_PREFERENCE_LIKE_LIMIT=4;
export const NPC_PREFERENCE_DISLIKE_LIMIT=3;
export const NPC_PREFERENCE_AVERSION_LIMIT=1;
export const NPC_PREFERENCE_KNOWLEDGE_LIMIT=8;
export const NPC_PREFERENCE_PASSIVE_KNOWLEDGE_LIMIT=6;

const preferenceTagSet=new Set<string>(NPC_PREFERENCE_TAG_IDS);
const CLOSE_RELATIONSHIP_TYPES=new Set<RelationshipType>(['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','aunt_uncle','cousin','niece_nephew','best_friend','partner','fiance','spouse','child','grandchild']);

const TRAIT_BIAS:Readonly<Record<string,Partial<Record<NpcPreferenceTag,number>>>>={
  ambitious:{professional:18,technology:12,fitness:7,travel:6},
  reckless:{nightlife:22,motorsport:18,playful:10,quiet:-12},
  calm:{quiet:20,relaxing:18,nature:12,nightlife:-12},
  romantic:{romance:24,music:12,food:8,nostalgia:8},
  aggressive:{fitness:18,sports:16,motorsport:8,relaxing:-8},
  responsible:{family:14,cooking:10,home:10,nightlife:-10},
  curious:{reading:22,technology:18,logic:12,travel:10},
  private:{quiet:22,reading:12,home:10,social:-16,nightlife:-10},
  witty:{games:12,playful:12,film:8,music:6},
  patient:{plants:18,craft:16,cooking:10,logic:8},
  competitive:{sports:22,games:16,motorsport:14,fitness:8},
  generous:{family:12,social:10,food:8,cute:6},
  loyal:{family:12,local:8,nostalgia:6},
  stubborn:{classic:10,local:6,professional:4},
};

function uniqueValidTags(items:unknown,max:number,blocked=new Set<NpcPreferenceTag>()):NpcPreferenceTag[]{
  if(!Array.isArray(items))return[];
  const seen=new Set<NpcPreferenceTag>();const result:NpcPreferenceTag[]=[];
  for(const raw of items){
    if(typeof raw!=='string'||!preferenceTagSet.has(raw))continue;
    const tag=raw as NpcPreferenceTag;if(seen.has(tag)||blocked.has(tag))continue;
    seen.add(tag);result.push(tag);if(result.length>=max)break;
  }
  return result;
}

function traitBias(npc:Pick<Npc,'traits'>,tag:NpcPreferenceTag){
  return npc.traits.reduce((sum,trait)=>sum+(TRAIT_BIAS[trait]?.[tag]??0),0);
}

export function generateNpcPreferenceProfile(state:Pick<GameState,'seed'>,npc:Pick<Npc,'id'|'traits'>):NpcPreferenceProfile{
  const rng=createRng(`${state.seed}-npc-preferences-v${NPC_PREFERENCE_PROFILE_VERSION}-${npc.id}`);
  const ranked=NPC_PREFERENCE_TAG_IDS.map((tag,index)=>({tag,index,score:rng.int(-48,48)+traitBias(npc,tag)}))
    .sort((a,b)=>b.score-a.score||a.index-b.index);
  const likes=ranked.slice(0,NPC_PREFERENCE_LIKE_LIMIT).map(item=>item.tag);
  const likeSet=new Set(likes);
  const bottom=[...ranked].reverse().filter(item=>!likeSet.has(item.tag)).slice(0,NPC_PREFERENCE_DISLIKE_LIMIT).map(item=>item.tag);
  const aversions:NpcPreferenceTag[]=[];
  if(bottom.length&&rng.chance(.2))aversions.push(bottom.shift()!);
  return{version:NPC_PREFERENCE_PROFILE_VERSION,likes,dislikes:bottom,aversions};
}

export function ensureNpcPreferenceProfile(state:GameState,npc:Npc):NpcPreferenceProfile{
  const current=npc.preferences;
  if(current?.version===NPC_PREFERENCE_PROFILE_VERSION)return current;
  npc.preferences=generateNpcPreferenceProfile(state,npc);return npc.preferences;
}

function normalizeNpcPreferenceProfile(state:GameState,npc:Npc):NpcPreferenceProfile{
  const current=ensureNpcPreferenceProfile(state,npc);
  const likes=uniqueValidTags(current.likes,NPC_PREFERENCE_LIKE_LIMIT);
  const blocked=new Set(likes);
  const aversions=uniqueValidTags(current.aversions,NPC_PREFERENCE_AVERSION_LIMIT,blocked);for(const tag of aversions)blocked.add(tag);
  const dislikes=uniqueValidTags(current.dislikes,NPC_PREFERENCE_DISLIKE_LIMIT,blocked);
  if(likes.length===current.likes.length&&dislikes.length===current.dislikes.length&&aversions.length===current.aversions.length
    &&likes.every((tag,index)=>tag===current.likes[index])&&dislikes.every((tag,index)=>tag===current.dislikes[index])&&aversions.every((tag,index)=>tag===current.aversions[index]))return current;
  npc.preferences={version:NPC_PREFERENCE_PROFILE_VERSION,likes,dislikes,aversions};return npc.preferences;
}

export function npcPreferenceLevel(profile:NpcPreferenceProfile,tag:NpcPreferenceTag):NpcPreferenceLevel{
  if(profile.aversions.includes(tag))return'aversion';
  if(profile.dislikes.includes(tag))return'dislike';
  if(profile.likes.includes(tag))return'like';
  return'neutral';
}

export function npcPreferenceValue(profile:NpcPreferenceProfile,tag:NpcPreferenceTag){
  const level=npcPreferenceLevel(profile,tag);return level==='like'?1:level==='dislike'?-1:level==='aversion'?-2:0;
}

function playerKnowledgeAgeCap(age:number){return age<5?0:age<9?1:age<13?2:age<16?3:NPC_PREFERENCE_PASSIVE_KNOWLEDGE_LIMIT;}

export function npcPreferenceKnowledgeBudget(state:GameState,rel:Relationship){
  const npc=state.npcs[rel.npcId];if(!npc)return 0;
  let budget=0;
  if(rel.yearsKnown>=1)budget+=1;
  if(rel.yearsKnown>=3)budget+=1;
  if(rel.yearsKnown>=7)budget+=1;
  if(rel.yearsKnown>=15)budget+=1;
  if(CLOSE_RELATIONSHIP_TYPES.has(rel.type))budget+=1;
  if(rel.score>=75||rel.score<=25)budget+=1;
  return Math.max(0,Math.min(NPC_PREFERENCE_PASSIVE_KNOWLEDGE_LIMIT,playerKnowledgeAgeCap(state.character.age),budget));
}

function passiveKnowledgeOrder(state:GameState,npc:Npc):NpcPreferenceTag[]{
  const profile=ensureNpcPreferenceProfile(state,npc);
  const rng=createRng(`${state.seed}-npc-preference-knowledge-v1-${state.character.id}-${npc.id}`);
  const shuffled=rng.shuffle(NPC_PREFERENCE_TAG_IDS.filter(tag=>npcPreferenceTagById[tag].minAge<=npc.age));
  return shuffled.sort((a,b)=>{
    const aSignal=npcPreferenceLevel(profile,a)==='neutral'?1:0;
    const bSignal=npcPreferenceLevel(profile,b)==='neutral'?1:0;
    return aSignal-bSignal;
  });
}

function sanitizeKnownTags(state:GameState,rel:Relationship){
  // Undefined means the current protagonist has not established preference knowledge yet.
  // Save normalization must preserve that absence instead of rewriting old relationship records.
  if(rel.knownPreferenceTags===undefined)return;
  const npc=state.npcs[rel.npcId];if(!npc){rel.knownPreferenceTags=[];return;}
  rel.knownPreferenceTags=uniqueValidTags(rel.knownPreferenceTags,NPC_PREFERENCE_KNOWLEDGE_LIMIT).filter(tag=>npcPreferenceTagById[tag].minAge<=npc.age);
}

export function initializeNpcPreferenceKnowledge(state:GameState){
  for(const rel of state.relationships){
    const npc=state.npcs[rel.npcId];if(!npc){rel.knownPreferenceTags=[];continue;}
    // Keep preference storage lazy until the protagonist can actually know something.
    // Once a tag is known, passiveKnowledgeOrder persists the intrinsic profile exactly once.
    if(rel.knownPreferenceTags!==undefined){sanitizeKnownTags(state,rel);if(rel.knownPreferenceTags.length&&!npc.preferences)ensureNpcPreferenceProfile(state,npc);continue;}
    const budget=npcPreferenceKnowledgeBudget(state,rel);
    if(budget>0)rel.knownPreferenceTags=passiveKnowledgeOrder(state,npc).slice(0,budget);
  }
}

export function advanceNpcPreferenceKnowledge(state:GameState){
  for(const rel of state.relationships){
    const npc=state.npcs[rel.npcId];if(!npc)continue;
    const budget=npcPreferenceKnowledgeBudget(state,rel);
    if(rel.knownPreferenceTags===undefined&&budget<=0)continue;
    rel.knownPreferenceTags??=[];sanitizeKnownTags(state,rel);
    const known=rel.knownPreferenceTags;if(known.length>=budget)continue;
    const knownSet=new Set(known);
    for(const tag of passiveKnowledgeOrder(state,npc)){
      if(knownSet.has(tag))continue;
      known.push(tag);knownSet.add(tag);
      if(known.length>=budget||known.length>=NPC_PREFERENCE_KNOWLEDGE_LIMIT)break;
    }
  }
}

export function revealNpcPreference(state:GameState,npcId:string,tag:NpcPreferenceTag){
  const rel=state.relationships.find(item=>item.npcId===npcId);const npc=state.npcs[npcId];
  if(!rel||!npc||!preferenceTagSet.has(tag)||npcPreferenceTagById[tag].minAge>npc.age)return false;
  ensureNpcPreferenceProfile(state,npc);rel.knownPreferenceTags??=[];sanitizeKnownTags(state,rel);
  if(rel.knownPreferenceTags.includes(tag))return true;
  if(rel.knownPreferenceTags.length>=NPC_PREFERENCE_KNOWLEDGE_LIMIT)return false;
  rel.knownPreferenceTags.push(tag);return true;
}

export function projectKnownNpcPreferences(state:GameState,npcId:string):KnownNpcPreference[]{
  const npc=state.npcs[npcId];const rel=state.relationships.find(item=>item.npcId===npcId);if(!npc||!rel||!npc.preferences)return[];
  const seen=new Set<NpcPreferenceTag>();const result:KnownNpcPreference[]=[];
  for(const raw of rel.knownPreferenceTags??[]){
    if(!preferenceTagSet.has(raw)||seen.has(raw)||npcPreferenceTagById[raw].minAge>npc.age)continue;
    seen.add(raw);result.push({tag:raw,label:npcPreferenceTagById[raw].label,level:npcPreferenceLevel(npc.preferences,raw)});
    if(result.length>=NPC_PREFERENCE_KNOWLEDGE_LIMIT)break;
  }
  return result;
}

export function normalizeNpcPreferenceState(state:GameState){
  // Normalize only profiles that already exist. Keeping unrepresented background NPCs lazy
  // prevents preference storage from scaling with the entire simulated population.
  for(const npc of Object.values(state.npcs))if(npc.preferences)normalizeNpcPreferenceProfile(state,npc);
  for(const rel of state.relationships){
    sanitizeKnownTags(state,rel);
    if((rel.knownPreferenceTags?.length??0)>0){const npc=state.npcs[rel.npcId];if(npc&&!npc.preferences)ensureNpcPreferenceProfile(state,npc);}
  }
}

export function migrateNpcPreferenceState(state:GameState){
  // Schema 17 introduces intrinsic NPC preferences without retroactively inventing what
  // an existing protagonist already knows. Persist profiles only for current relationship
  // targets; relationship knowledge remains untouched until normal play reveals it.
  for(const rel of state.relationships){const npc=state.npcs[rel.npcId];if(npc)ensureNpcPreferenceProfile(state,npc);}
}
