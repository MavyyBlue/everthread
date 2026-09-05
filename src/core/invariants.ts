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
  state.socialWorlds ??= [];
  state.employment.partTimeJobs ??= [];
  state.employment.partTimeHistory ??= [];
  const activeSchoolWorlds = state.socialWorlds.filter(world => world.kind === 'school' && world.active);
  if (activeSchoolWorlds.length > 1) {
    const keep = activeSchoolWorlds.slice().sort((a,b)=>b.startedAge-a.startedAge)[0];
    for (const world of activeSchoolWorlds) if (world !== keep) { world.active = false; world.endedAge ??= state.character.age; }
  }
  for (const world of state.socialWorlds) {
    world.members = (world.members ?? []).filter(member => Boolean(state.npcs[member.npcId]));
    world.groups ??= [];
    for (const group of world.groups) group.memberNpcIds = (group.memberNpcIds ?? []).filter(id => Boolean(state.npcs[id]));
    if (world.school) {
      world.school.attendance = clamp(world.school.attendance);
      world.school.conduct = clamp(world.school.conduct);
      world.school.socialStanding = clamp(world.school.socialStanding);
      world.school.honors = Math.max(0,Math.floor(world.school.honors));
      world.school.disciplinaryActions = Math.max(0,Math.floor(world.school.disciplinaryActions));
    }
    if (world.workplace) {
      world.workplace.morale = clamp(world.workplace.morale);
      world.workplace.culture = clamp(world.workplace.culture);
      world.workplace.tension = clamp(world.workplace.tension);
      world.workplace.reputation = clamp(world.workplace.reputation);
      world.workplace.layoffs = Math.max(0,Math.floor(world.workplace.layoffs));
      world.workplace.disputes = Math.max(0,Math.floor(world.workplace.disputes));
      if (world.workplace.managerNpcId && !state.npcs[world.workplace.managerNpcId]) world.workplace.managerNpcId = undefined;
    }
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
  if ((state.socialWorlds??[]).filter(world=>world.kind==='school'&&world.active).length>1) errors.push('Multiple active school worlds');
  if ((state.socialWorlds??[]).filter(world=>world.kind==='workplace'&&world.active&&world.workplace?.employmentKind==='full_time').length>1) errors.push('Multiple active full-time workplace worlds');
  if ((state.employment.partTimeJobs??[]).length>3) errors.push('Too many active part-time jobs');
  if ((state.employment.partTimeJobs??[]).some(job=>job.hoursPerWeek<=0||job.hoursPerWeek>15)) errors.push('Invalid part-time job hours');
  for (const world of state.socialWorlds??[]) {
    for (const member of world.members??[]) if (!state.npcs[member.npcId]) errors.push(`Social world ${world.id} references missing NPC ${member.npcId}`);
    if (world.school && (world.school.attendance<0||world.school.attendance>100||world.school.conduct<0||world.school.conduct>100||world.school.socialStanding<0||world.school.socialStanding>100)) errors.push(`School world ${world.id} contains invalid bounded stats`);
    if (world.workplace && (world.workplace.morale<0||world.workplace.morale>100||world.workplace.culture<0||world.workplace.culture>100||world.workplace.tension<0||world.workplace.tension>100||world.workplace.reputation<0||world.workplace.reputation>100)) errors.push(`Workplace world ${world.id} contains invalid bounded stats`);
  }
  return errors;
}
