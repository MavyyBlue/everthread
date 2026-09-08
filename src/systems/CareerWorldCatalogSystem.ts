import type { GameState, SocialWorld } from '../types/game';
import type { SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

export type PersistentCareerWorldKind = SpecialCareerWorldKind | 'combat' | 'military' | 'politics';

export const PERSISTENT_CAREER_WORLD_KINDS: readonly PersistentCareerWorldKind[] = [
  'acting','music','sports','combat','military','politics','modeling','racing','directing',
] as const;

const WORLD_LABELS:Record<PersistentCareerWorldKind,string> = {
  acting:'Acting production',
  music:'Music collective',
  sports:'Professional team',
  combat:'Combat gym & circuit',
  military:'Military posting',
  politics:'Political office',
  modeling:'Modeling network',
  racing:'Race team',
  directing:'Film production',
};

export function persistentCareerWorldKind(world:SocialWorld):PersistentCareerWorldKind|undefined {
  if(world.kind!=='organization')return undefined;
  return PERSISTENT_CAREER_WORLD_KINDS.find(kind=>world.id.startsWith(`special-${kind}-`));
}

export function persistentCareerWorlds(state:GameState,kind?:PersistentCareerWorldKind){
  const worlds=(state.socialWorlds??[]).filter(world=>Boolean(persistentCareerWorldKind(world)));
  return kind?worlds.filter(world=>persistentCareerWorldKind(world)===kind):worlds;
}

export function persistentCareerWorldLabel(kind:PersistentCareerWorldKind){return WORLD_LABELS[kind];}
