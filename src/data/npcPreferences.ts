import type { NpcPreferenceTag } from '../types/npcPreferences';

export interface NpcPreferenceTagDefinition {
  id: NpcPreferenceTag;
  label: string;
  minAge: number;
}

export const npcPreferenceTagDefinitions: readonly NpcPreferenceTagDefinition[] = [
  {id:'animals',label:'Animals & pets',minAge:3},
  {id:'art',label:'Art',minAge:4},
  {id:'classic',label:'Classic style',minAge:8},
  {id:'collecting',label:'Collecting',minAge:6},
  {id:'cooking',label:'Cooking',minAge:8},
  {id:'cozy',label:'Cozy comforts',minAge:3},
  {id:'craft',label:'Crafts',minAge:5},
  {id:'creative',label:'Creative projects',minAge:4},
  {id:'cute',label:'Cute things',minAge:2},
  {id:'family',label:'Family time',minAge:3},
  {id:'fashion',label:'Fashion',minAge:8},
  {id:'film',label:'Film & cinema',minAge:6},
  {id:'fitness',label:'Fitness',minAge:12},
  {id:'food',label:'Food & dining',minAge:3},
  {id:'games',label:'Games',minAge:5},
  {id:'home',label:'Home comforts',minAge:3},
  {id:'local',label:'Local culture',minAge:6},
  {id:'logic',label:'Puzzles & logic',minAge:7},
  {id:'morning',label:'Early mornings',minAge:8},
  {id:'motorsport',label:'Cars & motorsport',minAge:8},
  {id:'music',label:'Music',minAge:3},
  {id:'nature',label:'Nature',minAge:3},
  {id:'nightlife',label:'Nightlife',minAge:18},
  {id:'nostalgia',label:'Nostalgia',minAge:10},
  {id:'outdoors',label:'The outdoors',minAge:4},
  {id:'plants',label:'Plants & gardening',minAge:6},
  {id:'playful',label:'Playful activities',minAge:3},
  {id:'professional',label:'Professional polish',minAge:14},
  {id:'quiet',label:'Quiet time',minAge:3},
  {id:'reading',label:'Reading',minAge:5},
  {id:'relaxing',label:'Relaxing',minAge:3},
  {id:'romance',label:'Romantic gestures',minAge:14},
  {id:'shopping',label:'Shopping',minAge:8},
  {id:'social',label:'Social outings',minAge:6},
  {id:'sports',label:'Sports',minAge:6},
  {id:'technology',label:'Technology',minAge:7},
  {id:'travel',label:'Travel',minAge:8},
  {id:'writing',label:'Writing',minAge:6},
] as const;

export const npcPreferenceTagById = Object.fromEntries(npcPreferenceTagDefinitions.map(def=>[def.id,def])) as Record<NpcPreferenceTag,NpcPreferenceTagDefinition>;
export const NPC_PREFERENCE_TAG_IDS = npcPreferenceTagDefinitions.map(def=>def.id) as readonly NpcPreferenceTag[];
