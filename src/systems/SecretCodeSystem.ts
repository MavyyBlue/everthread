import type { AppearanceProfile, CharacterVisualIdentity, EngineResult, GameState, Npc, Relationship } from '../types/game';
import { makeStateId } from '../core/ids';
import { ensureNpcLife } from './NpcLifeSystem';
import { appearanceFromVisual, normalizeAppearanceProfile } from './CharacterVisualSystem';

export const YUKI_SECRET_CODE='9426';
export const YUKI_SECRET_MEMORY_KIND='secret_yuki_9426';
const YUKI_SECRET_FLAG='secretCode:yuki:9426';

const YUKI_VISUAL:CharacterVisualIdentity={
  version:1,
  faceFamily:'face.heart-03',
  eyeFamily:'eye.almond-01',
  browFamily:'brow.soft-arch-02',
  noseId:'nose.soft-01',
  mouthFamily:'mouth.soft-07',
  earId:'ear.small-02',
  hairId:'hair.wavy-long-16',
  skinPaletteId:'skin.rose-ivory',
  hairPaletteId:'hair-color.white',
  irisPaletteId:'iris.ice-blue',
  bodyId:'body.slight-01',
  clothingId:'clothing.pullover-hoodie-04',
  expressionId:'warm-smile',
};

export function secretYukiAppearance():AppearanceProfile{
  return normalizeAppearanceProfile(appearanceFromVisual(YUKI_VISUAL),'secret-yuki:visual','female','woman');
}

export function isSecretYukiNpc(npc:Npc|undefined):boolean{
  return Boolean(npc?.memories.some(memory=>memory.kind===YUKI_SECRET_MEMORY_KIND));
}

function existingYukiId(state:GameState):string|undefined{
  const stored=state.flags[YUKI_SECRET_FLAG];
  if(typeof stored==='string'&&state.npcs[stored]&&isSecretYukiNpc(state.npcs[stored]))return stored;
  return Object.values(state.npcs).find(npc=>isSecretYukiNpc(npc))?.id;
}

/**
 * Repairs older current-schema saves whose secret Yuki was created before her
 * curated portrait existed. This is the one intentional exception to ordinary
 * "materialized NPC portraits never change": the old randomized face was never
 * the authored secret identity. No gameplay RNG or runtime IDs are consumed.
 */
export function normalizeSecretYukiState(state:GameState):boolean{
  const id=existingYukiId(state);if(!id)return false;
  const yuki=state.npcs[id];if(!yuki)return false;
  let changed=false;
  if(state.flags[YUKI_SECRET_FLAG]!==id){state.flags[YUKI_SECRET_FLAG]=id;changed=true;}
  const curated=secretYukiAppearance();
  if(JSON.stringify(yuki.appearance)!==JSON.stringify(curated)){yuki.appearance=curated;changed=true;}
  const relationship=state.relationships.find(item=>item.npcId===id);
  if(relationship&&relationship.portraitRevealed!==true){relationship.portraitRevealed=true;changed=true;}
  return changed;
}

function summonYuki(state:GameState):EngineResult {
  const existingId=existingYukiId(state);
  if(existingId)return{success:false,messages:[{text:'That hidden thread has already been woven into this life.'}]};
  if(!state.character.alive)return{success:false,messages:[{text:'That thread cannot be woven after this life has ended.'}]};

  const id=makeStateId(state,'npc');
  const yuki:Npc={
    id,
    firstName:'Yuki',
    lastName:'Aster',
    age:state.character.age,
    alive:true,
    health:96,
    happiness:92,
    wealth:9426,
    countryId:state.character.countryId,
    city:state.character.city,
    sexuality:'pansexual',
    fertility:88,
    maritalStatus:'single',
    gender:'female',
    reproductiveSex:'female',
    traits:['loyal','witty','calm'],
    hiddenOpinion:96,
    memories:[],
    parentIds:[],
    childIds:[],
    appearance:secretYukiAppearance(),
  };
  state.npcs[id]=yuki;
  ensureNpcLife(state,yuki);

  const relationship:Relationship={
    id:makeStateId(state,'rel'),
    npcId:id,
    type:'friend',
    score:94,
    attraction:98,
    compatibility:99,
    yearsKnown:0,
    portraitRevealed:true,
  };
  state.relationships.push(relationship);

  yuki.memories.push({
    id:makeStateId(state,'memory'),
    year:state.currentYear,
    age:state.character.age,
    kind:YUKI_SECRET_MEMORY_KIND,
    sentiment:10,
    summary:`A hidden thread first woven on 09/04/2026 connected Yuki to ${state.character.firstName}.`,
    permanent:true,
  });
  state.timeline.push({
    id:makeStateId(state,'timeline'),
    year:state.currentYear,
    age:state.character.age,
    category:'relationship',
    importance:3,
    text:'A hidden thread brought Yuki Aster into your life.',
    npcIds:[id],
  });
  state.flags[YUKI_SECRET_FLAG]=id;

  return{success:true,messages:[{text:'A hidden thread first woven on 09/04/2026 answers. Yuki Aster has joined your Friends & Social circle.'}]};
}

const SECRET_CODE_HANDLERS:Readonly<Record<string,(state:GameState)=>EngineResult>>={
  [YUKI_SECRET_CODE]:summonYuki,
};

export function redeemSecretCode(state:GameState,rawCode:string):EngineResult {
  if(!state.flags.sandbox)return{success:false,messages:[{text:'Secret codes are only available in Sandbox lives.'}]};
  const code=String(rawCode??'').replace(/\D/g,'').slice(0,12);
  if(!code)return{success:false,messages:[{text:'Enter a code first.'}]};
  const handler=SECRET_CODE_HANDLERS[code];
  if(!handler)return{success:false,messages:[{text:'Nothing answers that code.'}]};
  return handler(state);
}
