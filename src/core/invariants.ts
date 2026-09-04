import type { GameState } from '../types/game';
import { clamp } from './math';

export function enforceStateInvariants(state: GameState): GameState {
  state.character.age = Math.max(0, Math.floor(state.character.age));
  state.character.stats.health = clamp(state.character.stats.health);
  state.character.stats.happiness = clamp(state.character.stats.happiness);
  state.character.stats.intelligence = clamp(state.character.stats.intelligence);
  state.character.stats.appearance = clamp(state.character.stats.appearance);
  for (const [key, value] of Object.entries(state.character.secondary)) {
    if (key === 'karma') continue;
    (state.character.secondary as unknown as Record<string, number>)[key] = clamp(value);
  }
  state.finances.cash = Number.isFinite(state.finances.cash) ? state.finances.cash : 0;
  state.legal.sentenceRemaining = Math.max(0, state.legal.sentenceRemaining);
  state.fame.fame = clamp(state.fame.fame);
  state.fame.publicReputation = clamp(state.fame.publicReputation);

  const spouseRelations = state.relationships.filter(r => r.type === 'spouse' && !r.estranged);
  if (spouseRelations.length > 1) {
    for (const duplicate of spouseRelations.slice(1)) duplicate.type = 'ex';
  }

  for (const rel of state.relationships) {
    rel.score = clamp(rel.score);
    rel.attraction = clamp(rel.attraction);
    rel.compatibility = clamp(rel.compatibility);
    if (!state.npcs[rel.npcId]) rel.estranged = true;
  }

  for (const npc of Object.values(state.npcs)) {
    npc.age = Math.max(0, Math.floor(npc.age));
    npc.health = clamp(npc.health);
    npc.happiness = clamp(npc.happiness);
    npc.fertility = clamp(npc.fertility);
    npc.hiddenOpinion = clamp(npc.hiddenOpinion, -100, 100);
    if (!npc.alive) { npc.imprisoned = false; npc.partnerId = undefined; }
  }
  for (const npc of Object.values(state.npcs)) {
    if (!npc.partnerId) continue;
    const partner = state.npcs[npc.partnerId];
    if (!partner?.alive || partner.id === npc.id) { npc.partnerId = undefined; continue; }
    if (!partner.partnerId) partner.partnerId = npc.id;
    else if (partner.partnerId !== npc.id) npc.partnerId = undefined;
  }

  return state;
}

export function validateState(state: GameState): string[] {
  const errors: string[] = [];
  if (!state.character?.id) errors.push('Missing character id');
  if (state.character.age < 0) errors.push('Negative player age');
  if (state.saveVersion < 1) errors.push('Invalid save version');
  const spouses = state.relationships.filter(r => r.type === 'spouse' && !r.estranged);
  if (spouses.length > 1) errors.push('Multiple active spouses');
  if (state.relationships.some(r => !state.npcs[r.npcId])) errors.push('Relationship references missing NPC');
  if (state.legal.sentenceRemaining < 0) errors.push('Negative prison sentence');
  if (state.timeline.some(entry => entry.age < 0)) errors.push('Timeline contains negative age');
  for (const npc of Object.values(state.npcs)) {
    if (!npc.partnerId) continue;
    if (npc.partnerId === npc.id) errors.push(`NPC ${npc.id} is partnered with self`);
    const partner = state.npcs[npc.partnerId];
    if (!partner) errors.push(`NPC ${npc.id} references missing partner ${npc.partnerId}`);
    else if (partner.partnerId !== npc.id) errors.push(`NPC partnership ${npc.id}/${partner.id} is asymmetric`);
  }
  return errors;
}
