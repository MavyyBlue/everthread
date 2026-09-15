import type { AppearanceProfile, CharacterVisualIdentity, GameState, Npc, Relationship, RelationshipType } from '../types/game';
import type { NpcPortraitRevealMode } from '../types/npcVisuals';
import { appearanceFromVisual, normalizeAppearanceProfile } from './CharacterVisualSystem';
import { characterIdentityFromNpc } from './NpcIdentitySystem';

const GENERATED_NPC_APPEARANCE:AppearanceProfile={
  skinTone:'generated',hairColor:'generated',hairStyle:'generated',eyeColor:'generated',accessories:[],
};

const IMMEDIATE_REVEAL_TYPES=new Set<RelationshipType>([
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','aunt_uncle','cousin','niece_nephew','child','grandchild',
  'best_friend','partner','fiance','spouse','ex',
]);

const HERITABLE_VISUAL_KEYS=[
  'faceFamily','eyeFamily','browFamily','noseId','mouthFamily','earId','skinPaletteId','hairPaletteId','irisPaletteId',
] as const satisfies readonly (keyof CharacterVisualIdentity)[];
type HeritableVisualKey=typeof HERITABLE_VISUAL_KEYS[number];

function hashString(value:string):number{
  let hash=2166136261>>>0;
  for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
  return hash>>>0;
}

function visualSeed(state:GameState,npc:Npc){return`${state.seed}:npc-visual:${npc.id}`;}

function distinctParentIds(ids:readonly string[]|undefined,npcId?:string):string[]{
  if(!ids?.length)return[];const seen=new Set<string>();const result:string[]=[];
  for(const id of ids){if(!id||id===npcId||seen.has(id))continue;seen.add(id);result.push(id);if(result.length===2)break;}
  return result;
}

/**
 * Records only visual biological provenance. Family/legal parentage continues
 * to belong exclusively to parentIds/childIds and FamilyTopologySystem.
 */
export function assignNpcAppearanceParentage(npc:Npc,parentIds:readonly string[]):void{
  const resolved=distinctParentIds(parentIds,npc.id);
  if(resolved.length)npc.appearanceParentIds=resolved;
}

function inheritedValue(
  key:HeritableVisualKey,
  base:CharacterVisualIdentity,
  parents:readonly CharacterVisualIdentity[],
  familySeed:string,
  childSeed:string,
):string{
  if(parents.length===1){
    // One modeled biological contributor means the unknown contributor is
    // represented by the child's own deterministic base identity rather than
    // cloning every visible feature from the known parent.
    return hashString(`${childSeed}:${key}:known-parent`)%100<66?String(parents[0]![key]):String(base[key]);
  }
  const anchorIndex=hashString(`${familySeed}:${key}:family-anchor`)%parents.length;
  const alternateIndex=(anchorIndex+1+(hashString(`${childSeed}:${key}:alternate`)%Math.max(1,parents.length-1)))%parents.length;
  const useAnchor=hashString(`${childSeed}:${key}:variation`)%100<72;
  return String(parents[useAnchor?anchorIndex:alternateIndex]![key]);
}

function inheritedVisual(
  base:CharacterVisualIdentity,
  parents:readonly CharacterVisualIdentity[],
  familySeed:string,
  childSeed:string,
):CharacterVisualIdentity{
  if(!parents.length)return base;
  const inherited={...base};
  for(const key of HERITABLE_VISUAL_KEYS)(inherited[key] as string)=inheritedValue(key,base,parents,familySeed,childSeed);
  // Hair style, body, clothing, facial hair, details, eyewear, accessories and
  // expression stay individual presentation rather than becoming "genetic".
  return inherited;
}

function projectedAppearanceForParent(state:GameState,parentId:string,seen:Set<string>):AppearanceProfile|undefined{
  if(parentId===state.character.id)return normalizeAppearanceProfile(
    state.character.appearance,`${state.character.id}:visual`,state.character.sex,state.character.genderIdentity,
  );
  const parent=state.npcs[parentId];if(!parent||seen.has(parentId))return undefined;
  return projectNpcAppearanceInternal(state,parent,seen);
}

function projectNpcAppearanceInternal(state:GameState,npc:Npc,seen:Set<string>):AppearanceProfile{
  const identity=characterIdentityFromNpc(state,npc);const seed=visualSeed(state,npc);
  // Once an NPC has a materialized appearance, it is their permanent identity.
  // Parent appearance/style changes can never retroactively rewrite the child.
  if(npc.appearance)return normalizeAppearanceProfile(npc.appearance,seed,identity.sex,identity.genderIdentity);
  const base=normalizeAppearanceProfile(GENERATED_NPC_APPEARANCE,seed,identity.sex,identity.genderIdentity);
  const parentIds=distinctParentIds(npc.appearanceParentIds,npc.id);if(!parentIds.length||!base.visual)return base;
  const nextSeen=new Set(seen);nextSeen.add(npc.id);
  const parentVisuals=parentIds
    .map(parentId=>projectedAppearanceForParent(state,parentId,nextSeen)?.visual)
    .filter((visual):visual is CharacterVisualIdentity=>Boolean(visual));
  if(!parentVisuals.length)return base;
  const familySeed=`${state.seed}:npc-family-visual:${[...parentIds].sort().join('|')}`;
  return appearanceFromVisual(inheritedVisual(base.visual,parentVisuals,familySeed,seed));
}

export function projectNpcAppearance(state:GameState,npc:Npc):AppearanceProfile{
  return projectNpcAppearanceInternal(state,npc,new Set());
}

export function normalizeNpcAppearance(state:GameState,npc:Npc):boolean{
  const normalized=projectNpcAppearance(state,npc);
  if(JSON.stringify(npc.appearance)===JSON.stringify(normalized))return false;
  npc.appearance=normalized;
  return true;
}

export function npcRelationshipQualifiesForPortrait(rel:Relationship):boolean{
  if(rel.portraitRevealed===true)return true;
  if(IMMEDIATE_REVEAL_TYPES.has(rel.type))return true;
  if((rel.knownPreferenceTags?.length??0)>0)return true;
  if(Boolean(rel.romance?.pendingDate)||(rel.romance?.dateHistory?.length??0)>0)return true;
  if(rel.yearsKnown>=1)return true;
  if(rel.score>=55)return true;
  return false;
}

export function npcPortraitRevealMode(state:GameState,npcId:string):NpcPortraitRevealMode{
  const rel=state.relationships.find(item=>item.npcId===npcId);
  return rel&&npcRelationshipQualifiesForPortrait(rel)?'portrait':'silhouette';
}

export function normalizeNpcVisualState(state:GameState,repairExisting=false):number{
  let changes=0;
  for(const rel of state.relationships){
    const npc=state.npcs[rel.npcId];if(!npc)continue;
    if(!npcRelationshipQualifiesForPortrait(rel))continue;
    // Kin/established romantic types already encode that the protagonist knows this
    // face, so do not redundantly mutate old Relationship records on migration. The
    // durable flag is reserved for familiarity learned through otherwise-transient
    // relationship state (time, score, dates, known preferences, etc.).
    if(!IMMEDIATE_REVEAL_TYPES.has(rel.type)&&rel.portraitRevealed!==true){rel.portraitRevealed=true;changes+=1;}
    // Runtime invariants execute after many actions. Once a revealed NPC already has
    // stable visual identity, leave it alone instead of rebuilding/stringifying it.
    // Save migration opts into repairExisting so imported/current-schema data still
    // receives full deterministic normalization exactly once on load.
    if(repairExisting||!npc.appearance?.visual){
      if(normalizeNpcAppearance(state,npc))changes+=1;
    }
  }
  return changes;
}

export function validateNpcVisualState(state:GameState):string[]{
  const errors:string[]=[];
  for(const npc of Object.values(state.npcs)){
    const parentIds=distinctParentIds(npc.appearanceParentIds,npc.id);
    if((npc.appearanceParentIds?.length??0)!==parentIds.length)errors.push(`NPC ${npc.id} has invalid visual parent provenance`);
  }
  for(const rel of state.relationships){
    if(rel.portraitRevealed!==true)continue;
    const npc=state.npcs[rel.npcId];
    if(!npc){errors.push(`Revealed portrait relationship ${rel.id} references a missing NPC`);continue;}
    if(!npc.appearance?.visual)errors.push(`Revealed NPC ${npc.id} is missing stable portrait identity`);
  }
  return errors;
}
