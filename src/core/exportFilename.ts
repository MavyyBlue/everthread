import type { GameState } from '../types/game';

function filenameSlug(value:string){
  const normalized=value.trim().toLowerCase().normalize('NFKD').replace(/\p{M}/gu,'');
  return normalized.replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'')||'life';
}

function utcStamp(date:Date){
  const pad=(value:number)=>String(value).padStart(2,'0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

export function buildSaveExportFilename(state:Pick<GameState,'character'|'legacy'>,date:Date){
  const first=filenameSlug(state.character.firstName);
  const last=filenameSlug(state.character.lastName);
  const generation=Number.isFinite(state.legacy.generation)?Math.max(1,Math.floor(state.legacy.generation)):1;
  const age=Number.isFinite(state.character.age)?Math.max(0,Math.floor(state.character.age)):0;
  return `everthread-${first}-${last}-g${generation}-age-${age}-${utcStamp(date)}.json`;
}
