import type { GameState } from '../types/game';

export function actionUsedThisAge(state: GameState, key: string): boolean {
  return Number(state.flags[key] ?? Number.NaN) === state.character.age;
}

export function markActionThisAge(state: GameState, key: string): void {
  state.flags[key] = state.character.age;
}
