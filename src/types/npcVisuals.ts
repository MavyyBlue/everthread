import type { AppearanceProfile, Id } from './game';

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
    /**
     * Biological contributors used only to derive an unmaterialized portrait.
     * This is visual provenance, not a second family tree: legal/adoptive family
     * truth remains parentIds/childIds. Absent for adoption and legacy NPCs.
     */
    appearanceParentIds?: Id[];
  }
  interface Relationship {
    /** Once learned, portrait knowledge never regresses when relationship scores fall. */
    portraitRevealed?: boolean;
  }
}

export {};
