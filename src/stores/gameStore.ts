import { useSyncExternalStore } from 'react';
import { GameEngine } from '../engine/GameEngine';
import type { GameState } from '../types/game';

export const gameEngine=new GameEngine();
export function useGameState<T>(selector:(state:GameState)=>T):T{useSyncExternalStore(cb=>gameEngine.subscribe(cb),()=>gameEngine.getRevision(),()=>gameEngine.getRevision());return selector(gameEngine.getState());}
