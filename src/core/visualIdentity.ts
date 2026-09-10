import type { GenderIdentity } from '../types/game';

export type EverthreadFontFamily = 'sans' | 'serif' | 'rounded' | 'mono';

declare module '../types/game' {
  interface SettingsState {
    /** Presentation-only preference; absent in older schema-9 saves. */
    fontFamily?: EverthreadFontFamily;
    /** Null/undefined follows the active light/dark theme automatically. */
    textColor?: string | null;
  }
}

export const EVERTHREAD_DEFAULT_ACCENT = '#16b8b0';

export const EVERTHREAD_FONT_OPTIONS: ReadonlyArray<{ value: EverthreadFontFamily; label: string }> = [
  { value: 'sans', label: 'Everthread Sans' },
  { value: 'serif', label: 'Story Serif' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'mono', label: 'Monospace' },
];

const PLAYER_CRESTS: Record<GenderIdentity, string> = {
  woman: './icons/player-female.png',
  man: './icons/player-male.png',
  nonbinary: './icons/player-neutral.png',
  other: './icons/player-neutral.png',
};

export function playerCrestForGender(gender: GenderIdentity | undefined): string {
  return gender ? PLAYER_CRESTS[gender] : PLAYER_CRESTS.nonbinary;
}

export function normalizeEverthreadFont(value: unknown): EverthreadFontFamily {
  return EVERTHREAD_FONT_OPTIONS.some(option => option.value === value) ? value as EverthreadFontFamily : 'sans';
}
