import type { EngineResult, GameState, Npc, Relationship } from '../types/game';
import { makeStateId } from '../core/ids';
import { ensureNpcLife } from './NpcLifeSystem';

export const YUKI_SECRET_CODE='9426';
const YUKI_SECRET_FLAG='secretCode:yuki:9426';

function existingYukiId(state:GameState):string|undefined{
  const stored=state.flags[YUKI_SECRET_FLAG];
  if(typeof stored==='string'&&state.npcs[stored])return stored;
  return Object.values(state.npcs).find(npc=>npc.memories.some(memory=>memory.kind==='secret_yuki_9426'))?.id;
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
  };
  state.relationships.push(relationship);

  yuki.memories.push({
    id:makeStateId(state,'memory'),
    year:state.currentYear,
    age:state.character.age,
    kind:'secret_yuki_9426',
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
