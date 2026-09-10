import type { GameState } from '../types/game';

export interface RewindSnapshotRecord { age:number; state:string }

export const MAX_REWIND_SNAPSHOTS=10;
export const MAX_REWIND_SNAPSHOT_CHARS=6_000_000;
export const LEGACY_IMPORT_MAX_CHARS=40_000_000;

function validSnapshot(value:unknown):value is RewindSnapshotRecord{
  if(!value||typeof value!=='object')return false;
  const snapshot=value as Partial<RewindSnapshotRecord>;
  return Number.isInteger(snapshot.age)&&Number(snapshot.age)>=0&&typeof snapshot.state==='string'&&snapshot.state.length>0;
}

export function rewindSnapshotChars(snapshots:readonly RewindSnapshotRecord[]){
  return snapshots.reduce((total,snapshot)=>total+snapshot.state.length,0);
}

export function normalizeRewindSnapshots(value:unknown):RewindSnapshotRecord[]{
  if(!Array.isArray(value))return[];

  // Rewinding and replaying an age can produce a second snapshot for the same age.
  // Keep the newest copy so the UI has one stable rewind point per age.
  const seenAges=new Set<number>();
  const newestFirst:RewindSnapshotRecord[]=[];
  for(let index=value.length-1;index>=0;index-=1){
    const snapshot=value[index];
    if(!validSnapshot(snapshot))continue;
    const age=Number(snapshot.age);
    if(seenAges.has(age))continue;
    seenAges.add(age);
    newestFirst.push({age,state:snapshot.state});
  }

  const normalized=newestFirst.reverse().slice(-MAX_REWIND_SNAPSHOTS);
  let chars=rewindSnapshotChars(normalized);
  while(normalized.length>1&&chars>MAX_REWIND_SNAPSHOT_CHARS){
    const removed=normalized.shift();
    if(removed)chars-=removed.state.length;
  }
  return normalized;
}

export function captureRewindSnapshot(state:GameState){
  if(!state.flags.rewindEnabled)return false;
  const clone=structuredClone(state);
  clone.yearlySnapshots=[];
  delete clone.flags.ageUpLocked;
  const encoded=JSON.stringify(clone);
  state.yearlySnapshots=normalizeRewindSnapshots([...state.yearlySnapshots,{age:state.character.age,state:encoded}]);
  return true;
}
