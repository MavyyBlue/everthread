import type { Sex } from './game';

export type NpcGender = 'female' | 'male' | 'nonbinary';
export type NpcReproductiveSex = 'female' | 'male';

declare module './game' {
  interface Npc {
    /** Persistent NPC identity. Procedural NPCs never use the player-only intersex option. */
    gender?: NpcGender;
    /** Biological family-planning role. Binary NPC genders match this value; nonbinary NPCs receive a 50/50 female/male assignment. */
    reproductiveSex?: NpcReproductiveSex;
    /** Run-70 compatibility field. New NPC generation no longer writes this legacy value. */
    sex?: Sex;
  }
}

export {};
