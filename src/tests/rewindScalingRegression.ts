import { MAX_REWIND_SNAPSHOTS, MAX_REWIND_SNAPSHOT_CHARS, LEGACY_IMPORT_MAX_CHARS, captureRewindSnapshot, normalizeRewindSnapshots, rewindSnapshotChars } from '../systems/RewindSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { ageUp, finalizeAgeUp, rewindToAge } from '../systems/AgingSystem';
import { resolvePendingEvent } from '../systems/EventSystem';
import { importSave, migrateSave } from '../services/SaveSystem';

export function runRewindScalingRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Rewind-scaling regression failed: ${message}`);}

  const countLimited=normalizeRewindSnapshots(Array.from({length:14},(_,age)=>({age,state:`{\"age\":${age}}`})));
  verify(countLimited.length===MAX_REWIND_SNAPSHOTS,'rewind history should retain at most ten recent yearly points');
  verify(countLimited[0]?.age===4&&countLimited.at(-1)?.age===13,'count pruning should retain the newest yearly rewind points');

  const duplicate=normalizeRewindSnapshots([{age:7,state:'old'},{age:8,state:'eight'},{age:7,state:'new'}]);
  verify(duplicate.length===2&&duplicate.find(item=>item.age===7)?.state==='new','replayed ages should keep only the newest snapshot for that age');

  const malformed=normalizeRewindSnapshots([null,{age:-1,state:'bad'},{age:2,state:''},{age:3,state:'valid'}]);
  verify(malformed.length===1&&malformed[0]?.age===3,'malformed rewind records should be dropped during normalization');

  const padded=normalizeRewindSnapshots(Array.from({length:10},(_,index)=>({age:index,state:'x'.repeat(1_100_000)})));
  verify(rewindSnapshotChars(padded)<=MAX_REWIND_SNAPSHOT_CHARS,'rewind payload should stay inside the mobile snapshot character budget when multiple points exist');
  verify(padded.at(-1)?.age===9&&padded.length>=1,'budget pruning should always preserve the newest available rewind point');

  const captured=createNewGame({seed:'rewind-scaling-capture',rewindEnabled:true});
  captured.yearlySnapshots=Array.from({length:10},(_,age)=>({age,state:`legacy-${age}`}));
  captured.character.age=10;
  verify(captureRewindSnapshot(captured),'rewind-enabled state should capture a yearly point');
  verify(captured.yearlySnapshots.length===MAX_REWIND_SNAPSHOTS&&captured.yearlySnapshots.at(-1)?.age===10,'live snapshot capture should apply count retention immediately');
  const capturedState=JSON.parse(captured.yearlySnapshots.at(-1)!.state) as {flags?:Record<string,unknown>};
  verify(capturedState.flags?.ageUpLocked===undefined,'captured rewind state should never persist the transient Age Up lock');

  const replay=createNewGame({seed:'rewind-scaling-runtime',rewindEnabled:true});
  const aged=ageUp(replay);verify(aged.success&&replay.yearlySnapshots.length===1,'Age Up should still capture a rewind point before annual processing');
  if(replay.pendingEvent){resolvePendingEvent(replay,replay.pendingEvent.choices[0]!.id);finalizeAgeUp(replay);}
  const target=replay.yearlySnapshots[0]!;const rewind=rewindToAge(replay,target.age);
  verify(rewind.success&&replay.character.age===target.age,'a retained bounded snapshot should still restore the exact target age');
  verify(replay.yearlySnapshots.every(snapshot=>snapshot.age<=target.age),'rewinding should discard future rewind points');

  const legacy=createNewGame({seed:'rewind-scaling-legacy',rewindEnabled:true});
  legacy.yearlySnapshots=Array.from({length:35},(_,age)=>({age,state:JSON.stringify({padding:'x'.repeat(440_000),age})}));
  const legacyJson=JSON.stringify(legacy);
  verify(legacyJson.length>15_000_000&&legacyJson.length<LEGACY_IMPORT_MAX_CHARS,'synthetic pre-fix rewind save should exercise the legacy oversized-import recovery window');
  const imported=importSave(legacyJson);
  verify(imported.yearlySnapshots.length<=MAX_REWIND_SNAPSHOTS&&rewindSnapshotChars(imported.yearlySnapshots)<=MAX_REWIND_SNAPSHOT_CHARS,'legacy oversized saves should import and immediately normalize rewind history');

  const currentSchema=createNewGame({seed:'rewind-scaling-current',rewindEnabled:true});
  currentSchema.yearlySnapshots=Array.from({length:35},(_,age)=>({age,state:`snapshot-${age}`}));
  currentSchema.flags.ageUpLocked=true;
  const migrated=migrateSave(currentSchema);
  verify(migrated.saveVersion===10&&migrated.yearlySnapshots.length===MAX_REWIND_SNAPSHOTS,'current-schema saves should receive retention normalization without a schema bump');
  verify(migrated.flags.ageUpLocked===undefined,'migration should clear legacy transient Age Up locks, including states restored from old rewind snapshots');

  return checks;
}
