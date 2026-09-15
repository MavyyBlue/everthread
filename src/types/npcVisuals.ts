import type { AppearanceProfile } from './game';

export type NpcPortraitRevealMode='silhouette'|'portrait';

/**
 * NPC portrait identity lives on the existing NPC record. Whether the current
 * protagonist has learned that portrait is player-specific knowledge and lives
 * on the existing Relationship record.
 */
declare module './game' {
  interface Npc {
    /** Stable modular portrait identity. Background-only NPCs may remain lazy. */
    appearance?: AppearanceProfile;
  }
  interface Relationship {
    /** Once learned, portrait knowledge never regresses when relationship scores fall. */
    portraitRevealed?: boolean;
  }
}

export {};
