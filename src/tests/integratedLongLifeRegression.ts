import type { GameState, Npc, Relationship, RelationshipType } from '../types/game';
import type { NpcGender, NpcReproductiveSex } from '../types/reproduction';
import { createRng, type SeededRng } from '../core/rng';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { ageUp, finalizeAgeUp, rewindToAge } from '../systems/AgingSystem';
import { resolvePendingEvent } from '../systems/EventSystem';
import { checkDeath } from '../systems/DeathSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { biologicalChildGate } from '../systems/ReproductionSystem';
import { changeRelationshipType, haveChild, interactWithNpc } from '../systems/RelationshipSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { pickCollisionAwareNpcName } from '../systems/NpcNamingSystem';
import {
  LEGACY_IMPORT_MAX_CHARS,
  MAX_REWIND_SNAPSHOTS,
  MAX_REWIND_SNAPSHOT_CHARS,
  rewindSnapshotChars,
} from '../systems/RewindSystem';
import { exportSave, importSave, SAVE_VERSION } from '../services/SaveSystem';
import { runSimulation } from './simulationHarness';

interface DenseNpcOptions {
  age:number;
  gender:NpcGender;
  relationshipType?:RelationshipType;
  fixedLastName?:string;
  parentIds?:string[];
  maritalStatus?:Npc['maritalStatus'];
  score?:number;
  simulationTier?:Npc['simulationTier'];
}

function normalized(value:string){return value.trim().normalize('NFKC').toLowerCase();}
function fullNameKey(npc:{firstName:string;lastName:string}){return `${normalized(npc.firstName)}\u0000${normalized(npc.lastName)}`;}
function denseGender(index:number):NpcGender{return index===23?'nonbinary':index%2===0?'female':'male';}
function reproductiveSex(gender:NpcGender,index:number):NpcReproductiveSex{return gender==='female'?'female':gender==='male'?'male':index%2===0?'female':'male';}
function relation(id:string,npcId:string,type:RelationshipType,score=70,yearsKnown=5):Relationship{return{id,npcId,type,score,attraction:['partner','fiance','spouse'].includes(type)?85:0,compatibility:88,yearsKnown};}

function addDenseNpc(state:GameState,rng:SeededRng,id:string,index:number,options:DenseNpcOptions){
  const name=pickCollisionAwareNpcName(state,rng,{gender:options.gender,...(options.fixedLastName?{fixedLastName:options.fixedLastName}:{})});
  const npc:Npc={
    id,firstName:name.firstName,lastName:name.lastName,age:options.age,alive:true,health:96,happiness:78,wealth:35_000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:78,
    maritalStatus:options.maritalStatus??'single',traits:['calm','responsible','loyal'],hiddenOpinion:72,memories:[],
    parentIds:[...(options.parentIds??[])],childIds:[],simulationTier:options.simulationTier??'full',
    gender:options.gender,reproductiveSex:reproductiveSex(options.gender,index),
  };
  state.npcs[id]=npc;
  if(options.relationshipType)state.relationships.push(relation(`rel-${id}`,id,options.relationshipType,options.score??70,Math.max(1,Math.min(options.age,12))));
  ensureNpcLife(state,npc);
  return npc;
}

function resetFixtureClock(state:GameState){
  state.character.age+=1;state.currentYear+=1;
  for(const npc of Object.values(state.npcs))npc.age+=1;
  state.actionLedger.age=state.character.age;state.actionLedger.uses={};state.actionLedger.revision+=1;
}

function resolveAgeEvent(state:GameState){
  if(!state.pendingEvent)return;
  const choice=state.pendingEvent.choices[0];
  if(choice)resolvePendingEvent(state,choice.id);
  else state.pendingEvent=undefined;
  // The closeout stress fixture is testing long-lived cross-system state, not player mortality variance.
  state.character.stats.health=100;
  finalizeAgeUp(state);
}

function advanceResolvedYear(state:GameState){
  state.character.stats.health=100;
  const result=ageUp(state);
  if(!result.success)throw new Error(`Integrated long-life regression failed: Age Up was blocked at age ${state.character.age}: ${result.messages.map(message=>message.text).join(' | ')}`);
  resolveAgeEvent(state);
  if(!state.character.alive)throw new Error(`Integrated long-life regression failed: stress protagonist died unexpectedly at age ${state.character.age}`);
}

function stateErrors(state:GameState){return validateState(state);}
function uniqueRelationshipTargets(state:GameState){return new Set(state.relationships.map(item=>item.npcId)).size===state.relationships.length;}

export function runIntegratedLongLifeRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Integrated long-life regression failed: ${message}`);}

  // Existing CI already runs the 25-life mixed smoke test. This adds a family-biased batch
  // so the closeout specifically leans on romance, children, and autonomous family growth.
  const familyBatch=runSimulation({lives:6,seedPrefix:'slice8-family-stress',maxAge:105,mode:'bulk',policy:'family'});
  verify(familyBatch.completedLives===6,'family-biased multi-life simulation did not complete every requested life');
  verify(familyBatch.anomalyCount===0,`family-biased simulation reported anomalies: ${familyBatch.anomalySamples.join(' | ')}`);
  verify(Object.values(familyBatch.policyDistribution).reduce((sum,value)=>sum+value,0)===6,'family-biased simulation policy accounting diverged');
  verify(familyBatch.policyDistribution.family===6,'family-biased simulation did not retain the requested policy');
  verify(Number.isFinite(familyBatch.averageNetWorth)&&Number.isFinite(familyBatch.averageLifespan),'family-biased simulation produced non-finite aggregate output');
  verify(familyBatch.maxPeakNpcCount<500,'family-biased simulation allowed runaway NPC growth');
  verify(familyBatch.averagePeakNpcCount>=familyBatch.averageEndNpcCount,'reported end NPC population exceeded average peak population');

  const state=createNewGame({seed:'slice8-dense-dynasty',rewindEnabled:true});
  state.character.age=32;state.currentYear=state.character.birthYear+32;state.character.sex='male';state.character.genderIdentity='man';state.character.orientation='pansexual';
  state.character.stats.health=100;state.character.secondary.fertility=92;
  state.npcs={};state.relationships=[];state.socialWorlds=[];state.yearlySnapshots=[];state.legacy.familyTreeNpcIds=[];
  state.actionLedger.age=state.character.age;state.actionLedger.uses={};state.actionLedger.lastUsedAge={};state.actionLedger.revision=0;
  const nameRng=createRng('slice8-dense-naming');

  const spouse=addDenseNpc(state,nameRng,'slice8-spouse',0,{age:31,gender:'female',relationshipType:'spouse',maritalStatus:'married',score:92});
  spouse.reproductiveSex='female';spouse.fertility=92;spouse.hiddenOpinion=100;

  const initialChildren:Npc[]=[];
  for(let index=0;index<24;index+=1){
    const child=addDenseNpc(state,nameRng,`slice8-child-${index+1}`,index+1,{
      age:1+(index%15),gender:denseGender(index),relationshipType:'child',fixedLastName:state.character.lastName,
      parentIds:[state.character.id,spouse.id],score:82,simulationTier:'full',
    });
    initialChildren.push(child);spouse.childIds.push(child.id);state.legacy.familyTreeNpcIds.push(child.id);
  }
  const friends:Npc[]=[];
  for(let index=0;index<24;index+=1){
    friends.push(addDenseNpc(state,nameRng,`slice8-friend-${index+1}`,index+30,{
      age:22+(index%13),gender:denseGender(index),relationshipType:'friend',score:64,simulationTier:index%2===0?'full':'background',
    }));
  }
  ensureNpcLife(state,spouse);

  verify(state.relationships.filter(item=>item.type==='child').length===24,'dense fixture did not begin with 24 linked children');
  verify(Object.keys(state.npcs).length===49,'dense fixture NPC count was not the intended 49-person starting cast');
  const initialFirstNames=Object.values(state.npcs).map(npc=>normalized(npc.firstName));
  verify(new Set(initialFirstNames).size===initialFirstNames.length,'collision-aware naming left an avoidable first-name collision in the dense starting cast');
  const initialFullNames=Object.values(state.npcs).map(fullNameKey);
  verify(new Set(initialFullNames).size===initialFullNames.length,'collision-aware naming left an exact full-name collision in the dense starting cast');
  verify(spouse.partnerId===undefined,'player spouse incorrectly used NPC-to-NPC partnerId authority');
  verify(spouse.life?.household.status==='partnered','player spouse household projection was not partnered in the dense fixture');
  verify(stateErrors(state).length===0,`dense starting fixture violated invariants: ${stateErrors(state).join('; ')}`);

  const spouseRel=state.relationships.find(item=>item.npcId===spouse.id)!;
  verify(changeRelationshipType(state,spouse.id,'divorce').success,'dense fixture divorce transition failed');
  const divorcedRel=state.relationships.find(item=>item.npcId===spouse.id)!;
  const divorcedSpouse=state.npcs[spouse.id]!;
  verify(divorcedRel.type==='ex'&&divorcedSpouse.maritalStatus==='divorced','divorce did not synchronize relationship and NPC marital state');
  verify(divorcedSpouse.life?.household.status==='independent','divorce did not release the player spouse household projection');

  resetFixtureClock(state);divorcedRel.score=100;divorcedRel.attraction=100;divorcedRel.compatibility=100;divorcedSpouse.hiddenOpinion=100;state.rngCounter=0;
  verify(changeRelationshipType(state,spouse.id,'reconcile').success,'dense fixture reconciliation transition failed');
  const reconciledRel=state.relationships.find(item=>item.npcId===spouse.id)!;
  const reconciledSpouse=state.npcs[spouse.id]!;
  verify(reconciledRel.type==='partner'&&reconciledSpouse.maritalStatus==='dating','reconciliation did not restore dating state');
  verify(reconciledSpouse.life?.household.status==='partnered','reconciliation did not restore partnered household projection');

  resetFixtureClock(state);
  verify(changeRelationshipType(state,spouse.id,'marry').success,'dense fixture remarriage transition failed');
  const remarriedRel=state.relationships.find(item=>item.npcId===spouse.id)!;
  const remarriedSpouse=state.npcs[spouse.id]!;
  verify(remarriedRel.type==='spouse'&&remarriedSpouse.maritalStatus==='married','remarriage did not synchronize spouse state');

  const bioGate=biologicalChildGate(state,spouse.id);
  const ageFactor=bioGate.ageFactor;const conceptionChance=bioGate.conceptionChance;
  verify(bioGate.allowed&&typeof ageFactor==='number'&&ageFactor>0&&typeof conceptionChance==='number'&&conceptionChance>0,'age-aware biological family gate was not viable for the young-adult dense couple');
  const beforeAdoption=state.relationships.filter(item=>item.type==='child').length;
  verify(haveChild(state,spouse.id,true).success,'dense fixture adoption failed');
  verify(state.relationships.filter(item=>item.type==='child').length===beforeAdoption+1,'adoption did not add exactly one child relationship');
  const adopted=state.relationships.filter(item=>item.type==='child').map(item=>state.npcs[item.npcId]).find(npc=>npc?.age===0);
  verify(Boolean(adopted)&&adopted!.lastName===state.character.lastName,'adoption did not preserve the controlled family surname');

  const microcopyFriend=friends[2]!;
  verify(interactWithNpc(state,microcopyFriend.id,'conversation').success,'relationship interaction failed inside the dense pre-aging fixture');
  verify(state.timeline.at(-1)?.text===`You had a conversation with ${microcopyFriend.firstName}.`,'natural relationship timeline copy regressed inside the dense fixture');
  verify(microcopyFriend.memories.at(-1)?.summary===`${state.character.firstName} had a conversation with you.`,'natural NPC-memory copy regressed inside the dense fixture');

  const terminalFriend=friends[1]!;terminalFriend.health=0;
  let peakNpcCount=Object.keys(state.npcs).length;
  let maxSnapshotCount=0;let maxSnapshotChars=0;
  for(let year=0;year<15;year+=1){
    advanceResolvedYear(state);
    peakNpcCount=Math.max(peakNpcCount,Object.keys(state.npcs).length);
    maxSnapshotCount=Math.max(maxSnapshotCount,state.yearlySnapshots.length);
    maxSnapshotChars=Math.max(maxSnapshotChars,rewindSnapshotChars(state.yearlySnapshots));
    const errors=stateErrors(state);
    verify(errors.length===0,`dense annual state violated invariants at age ${state.character.age}: ${errors.join('; ')}`);
  }
  verify(!terminalFriend.alive,'terminal-health background NPC survived long-life annual processing');
  verify(!Object.values(state.npcs).some(npc=>npc.alive&&npc.health<=0),'long-life fixture retained a living terminal-health NPC');
  verify(peakNpcCount>=50,'dense fixture never exercised a 50+ NPC live state');
  verify(peakNpcCount<300,'dense long-life fixture allowed runaway NPC population growth');
  verify(maxSnapshotCount<=MAX_REWIND_SNAPSHOTS,'rewind count cap was exceeded during dense annual simulation');
  verify(maxSnapshotChars<=MAX_REWIND_SNAPSHOT_CHARS,'rewind character budget was exceeded during dense annual simulation');
  verify(state.yearlySnapshots.length>=2,'dense fixture retained too few rewind points for a meaningful rewind round-trip');

  const exported=exportSave(state);
  verify(exported.length<=LEGACY_IMPORT_MAX_CHARS,'dense steady-state export exceeded the legacy recovery ceiling');
  verify(exported.length<MAX_REWIND_SNAPSHOT_CHARS+6_000_000,'dense steady-state export grew implausibly beyond the bounded snapshot budget');
  const imported=importSave(exported);
  verify(imported.saveVersion===SAVE_VERSION,'dense save round-trip changed the active save schema');
  verify(stateErrors(imported).length===0,`dense imported save violated invariants: ${stateErrors(imported).join('; ')}`);
  verify(imported.yearlySnapshots.length<=MAX_REWIND_SNAPSHOTS&&rewindSnapshotChars(imported.yearlySnapshots)<=MAX_REWIND_SNAPSHOT_CHARS,'dense import failed to preserve rewind bounds');

  const rewindRecord=imported.yearlySnapshots[Math.max(0,imported.yearlySnapshots.length-4)]!;
  const rewindPayload=JSON.parse(rewindRecord.state) as GameState;
  verify(rewindPayload.yearlySnapshots.length===0,'retained dense rewind snapshot recursively embedded snapshot history');
  verify(!('ageUpLocked' in rewindPayload.flags),'retained dense rewind snapshot persisted the transient Age Up lock');
  const expectedNpcCount=Object.keys(rewindPayload.npcs).length;
  const originalPlayerId=imported.character.id;
  verify(rewindToAge(imported,rewindRecord.age).success,'dense save failed to rewind after export/import');
  verify(imported.character.age===rewindRecord.age&&imported.character.id===originalPlayerId,'rewind restored the wrong protagonist age or identity');
  verify(Object.keys(imported.npcs).length===expectedNpcCount,'rewind restored a different NPC population than its captured state');
  verify(imported.yearlySnapshots.every(snapshot=>snapshot.age<=rewindRecord.age),'rewind retained future snapshots beyond the restored age');
  verify(new Set(imported.yearlySnapshots.map(snapshot=>snapshot.age)).size===imported.yearlySnapshots.length,'rewind retained duplicate age entries');
  verify(stateErrors(imported).length===0,`rewound dense state violated invariants: ${stateErrors(imported).join('; ')}`);

  const rewindAge=imported.character.age;
  for(let year=0;year<3;year+=1)advanceResolvedYear(imported);
  verify(imported.character.age===rewindAge+3,'replayed dense state did not advance exactly three years after rewind');
  verify(new Set(imported.yearlySnapshots.map(snapshot=>snapshot.age)).size===imported.yearlySnapshots.length,'replay after rewind recreated duplicate snapshot ages');
  verify(imported.yearlySnapshots.length<=MAX_REWIND_SNAPSHOTS&&rewindSnapshotChars(imported.yearlySnapshots)<=MAX_REWIND_SNAPSHOT_CHARS,'replay after rewind broke snapshot bounds');
  verify(stateErrors(imported).length===0,`replayed dense state violated invariants: ${stateErrors(imported).join('; ')}`);

  const postRewindFriendRel=imported.relationships.find(item=>item.type==='friend'&&imported.npcs[item.npcId]?.alive);
  verify(Boolean(postRewindFriendRel),'rewound dense state lost every living friend target');
  const postRewindFriend=imported.npcs[postRewindFriendRel!.npcId]!;
  verify(interactWithNpc(imported,postRewindFriend.id,'compliment').success,'relationship action failed after rewind/save rehydration');
  verify(imported.timeline.at(-1)?.text===`You complimented ${postRewindFriend.firstName}.`,'relationship microcopy regressed after rewind/save rehydration');

  const successorRel=[...imported.relationships].filter(item=>item.type==='child'&&imported.npcs[item.npcId]?.alive&&imported.npcs[item.npcId]!.age>=18).sort((a,b)=>imported.npcs[b.npcId]!.age-imported.npcs[a.npcId]!.age)[0];
  verify(Boolean(successorRel),'dense dynasty had no living adult child available for continuation');
  const successorId=successorRel!.npcId;const generationBefore=imported.legacy.generation;const completedBefore=imported.completedLives.length;
  verify(checkDeath(imported,true),'forced player death did not complete the dense life');
  verify(imported.completedLives.length===completedBefore+1,'forced death did not append exactly one completed life');
  verify(continueAsChild(imported,successorId).success,'dense descendant continuation failed');
  verify(imported.legacy.generation===generationBefore+1,'descendant continuation did not increment generation exactly once');
  verify(imported.character.id===successorId&&imported.character.alive,'descendant continuation did not transfer control to the chosen living child');
  verify(imported.npcs[originalPlayerId]?.alive===false,'descendant continuation did not preserve the prior protagonist as a dead NPC ancestor');
  verify(imported.relationships.some(item=>item.npcId===originalPlayerId&&item.type==='parent'),'continued descendant lost the prior protagonist parent link');
  verify(imported.relationships.filter(item=>item.type==='sibling'||item.type==='half_sibling').length>=20,'continued descendant lost too much of the 24-child sibling set');
  verify(imported.yearlySnapshots.length===0,'descendant continuation inherited the prior protagonist rewind history');
  verify(imported.flags.rewindEnabled===true,'descendant continuation unexpectedly disabled the rewind-enabled save');
  verify(uniqueRelationshipTargets(imported),'descendant continuation produced duplicate relationship targets');
  verify(stateErrors(imported).length===0,`continued dense descendant violated invariants: ${stateErrors(imported).join('; ')}`);

  for(let year=0;year<5;year+=1){advanceResolvedYear(imported);const errors=stateErrors(imported);verify(errors.length===0,`continued descendant annual state violated invariants at age ${imported.character.age}: ${errors.join('; ')}`);}
  verify(imported.yearlySnapshots.length>0,'continued descendant did not begin a fresh rewind history');
  verify(imported.yearlySnapshots.every(snapshot=>(JSON.parse(snapshot.state) as GameState).character.id===successorId),'new-generation rewind history captured the prior protagonist instead of the descendant');

  const descendantExport=exportSave(imported);
  verify(descendantExport.length<=LEGACY_IMPORT_MAX_CHARS,'continued-descendant export exceeded the import recovery ceiling');
  const descendantRoundTrip=importSave(descendantExport);
  verify(descendantRoundTrip.character.id===successorId&&descendantRoundTrip.legacy.generation===generationBefore+1,'continued-descendant save round-trip lost protagonist or generation identity');
  verify(descendantRoundTrip.completedLives.length===completedBefore+1,'continued-descendant save round-trip lost completed-life history');
  verify(stateErrors(descendantRoundTrip).length===0,`continued-descendant imported save violated invariants: ${stateErrors(descendantRoundTrip).join('; ')}`);

  return checks;
}
