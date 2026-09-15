import type { AppearanceProfile, GameState, Npc, Relationship, RelationshipType } from '../types/game';
import type { NpcPortraitRevealMode } from '../types/npcVisuals';
import { normalizeAppearanceProfile } from './CharacterVisualSystem';
import { characterIdentityFromNpc } from './NpcIdentitySystem';

const GENERATED_NPC_APPEARANCE:AppearanceProfile={
  skinTone:'generated',hairColor:'generated',hairStyle:'generated',eyeColor:'generated',accessories:[],
};

const IMMEDIATE_REVEAL_TYPES=new Set<RelationshipType>([
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','aunt_uncle','cousin','niece_nephew','child','grandchild',
  'best_friend','partner','fiance','spouse','ex',
]);

function visualSeed(state:GameState,npc:Npc){return`${state.seed}:npc-visual:${npc.id}`;}

export function projectNpcAppearance(state:GameState,npc:Npc):AppearanceProfile{
  const identity=characterIdentityFromNpc(state,npc);
  return normalizeAppearanceProfile(npc.appearance??GENERATED_NPC_APPEARANCE,visualSeed(state,npc),identity.sex,identity.genderIdentity);
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
  for(const rel of state.relationships){
    if(rel.portraitRevealed!==true)continue;
    const npc=state.npcs[rel.npcId];
    if(!npc){errors.push(`Revealed portrait relationship ${rel.id} references a missing NPC`);continue;}
    if(!npc.appearance?.visual)errors.push(`Revealed NPC ${npc.id} is missing stable portrait identity`);
  }
  return errors;
}
