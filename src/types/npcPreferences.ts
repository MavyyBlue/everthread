import type { Npc, Relationship } from './game';

export type NpcPreferenceTag =
  | 'animals' | 'art' | 'classic' | 'collecting' | 'cooking' | 'cozy' | 'craft' | 'creative' | 'cute'
  | 'family' | 'fashion' | 'film' | 'fitness' | 'food' | 'games' | 'home' | 'local' | 'logic'
  | 'morning' | 'motorsport' | 'music' | 'nature' | 'nightlife' | 'nostalgia' | 'outdoors' | 'plants'
  | 'playful' | 'professional' | 'quiet' | 'reading' | 'relaxing' | 'romance' | 'shopping' | 'social'
  | 'sports' | 'technology' | 'travel' | 'writing';

export type NpcPreferenceLevel = 'like' | 'neutral' | 'dislike' | 'aversion';

export interface NpcPreferenceProfile {
  version: 1;
  likes: NpcPreferenceTag[];
  dislikes: NpcPreferenceTag[];
  aversions: NpcPreferenceTag[];
}

export interface KnownNpcPreference {
  tag: NpcPreferenceTag;
  label: string;
  level: NpcPreferenceLevel;
}

/** Player-specific knowledge belongs to the relationship, not to the NPC's intrinsic profile. */
declare module './game' {
  interface Npc {
    preferences?: NpcPreferenceProfile;
  }
  interface Relationship {
    knownPreferenceTags?: NpcPreferenceTag[];
  }
}

export type NpcWithPreferences = Npc & { preferences: NpcPreferenceProfile };
export type RelationshipWithPreferenceKnowledge = Relationship & { knownPreferenceTags: NpcPreferenceTag[] };
