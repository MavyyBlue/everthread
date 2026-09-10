import type { Sex } from './game';

declare module './game' {
  interface Npc {
    /** Biological sex used only for reproductive compatibility. Optional for legacy saves and deterministically derived when absent. */
    sex?: Sex;
  }
}

export {};
