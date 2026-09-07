import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, RelationshipType, SocialWorld } from '../types/game';
import type { SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

function careerKind(world:SocialWorld):SpecialCareerWorldKind|undefined {
  return (['acting','music','sports','modeling','racing','directing'] as const).find(kind=>world.id.startsWith(`special-${kind}-`));
}

function memberGroupKind(world:SocialWorld,npcId:string){
  const member=world.members.find(item=>item.npcId===npcId);
  const group=member?.groupIds.map(id=>world.groups.find(candidate=>candidate.id===id)).find(Boolean);
  return group?.kind??'';
}

function relationshipTypeForCareerMember(world:SocialWorld,npcId:string):RelationshipType {
  const member=world.members.find(item=>item.npcId===npcId);
  const groupKind=memberGroupKind(world,npcId);
  if(groupKind.includes(':rivals'))return'enemy';
  if(member?.role==='leader')return'boss';
  return'coworker';
}

export function ensureSpecialCareerRelationships(state:GameState,world:SocialWorld){
  const kind=careerKind(world);if(!kind)return;
  const rng=createRng(`${state.seed}-special-rel-${world.id}`);
  for(const member of world.members){
    const npc=state.npcs[member.npcId];if(!npc)continue;
    const existing=state.relationships.find(rel=>rel.npcId===npc.id);
    if(existing)continue;
    const type=relationshipTypeForCareerMember(world,npc.id);
    const hostile=type==='enemy';
    state.relationships.push({
      id:makeStateId(state,'rel'),npcId:npc.id,type,
      score:hostile?rng.int(12,32):type==='boss'?rng.int(38,62):rng.int(42,70),
      attraction:hostile?rng.int(0,28):rng.int(0,52),compatibility:rng.int(28,88),yearsKnown:Math.max(0,state.character.age-world.startedAge),
    });
    npc.memories.push({
      id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:`special_${kind}`,
      sentiment:hostile?-5:3,
      summary:hostile?`You became a professional rival of ${state.character.firstName} through ${world.name}.`:`You met ${state.character.firstName} through ${world.name}.`,
    });
  }
}
