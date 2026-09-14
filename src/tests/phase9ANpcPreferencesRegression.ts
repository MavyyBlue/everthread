import { CURRENT_SAVE_VERSION } from '../core/saveVersion';
import { enforceStateInvariants, validateState } from '../core/invariants';
import { NPC_PREFERENCE_TAG_IDS, npcPreferenceTagDefinitions, npcPreferenceTagById } from '../data/npcPreferences';
import { personalItemDefinitions } from '../data/personalItems';
import { migrateSave } from '../services/SaveSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import {
  NPC_PREFERENCE_AVERSION_LIMIT,
  NPC_PREFERENCE_DISLIKE_LIMIT,
  NPC_PREFERENCE_KNOWLEDGE_LIMIT,
  NPC_PREFERENCE_LIKE_LIMIT,
  advanceNpcPreferenceKnowledge,
  generateNpcPreferenceProfile,
  ensureNpcPreferenceProfile,
  initializeNpcPreferenceKnowledge,
  npcPreferenceKnowledgeBudget,
  npcPreferenceLevel,
  npcPreferenceValue,
  projectKnownNpcPreferences,
  revealNpcPreference,
} from '../systems/NpcPreferenceSystem';
import type { GameState, Npc, Relationship } from '../types/game';
import type { NpcPreferenceTag } from '../types/npcPreferences';

function addNpc(state:GameState,id:string,age=28,traits:string[]=['curious']):Npc{
  const npc:Npc={id,firstName:'Riley',lastName:'Thread',age,alive:true,health:85,happiness:70,wealth:12000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits,hiddenOpinion:55,memories:[],parentIds:[],childIds:[],simulationTier:'full'};
  state.npcs[id]=npc;ensureNpcLife(state,npc);ensureNpcPreferenceProfile(state,npc);return npc;
}

function addRelationship(state:GameState,npc:Npc,type:Relationship['type']='friend',yearsKnown=5,score=65):Relationship{
  const rel:Relationship={id:`rel-${npc.id}`,npcId:npc.id,type,score,attraction:0,compatibility:60,yearsKnown};state.relationships.push(rel);return rel;
}

function addAdultChild(state:GameState,id='phase9a-child'):Npc{
  const child=addNpc(state,id,30,['responsible','curious']);child.firstName='Avery';child.lastName=state.character.lastName;child.parentIds=[state.character.id];
  state.relationships.push({id:`rel-${id}`,npcId:id,type:'child',score:84,attraction:0,compatibility:76,yearsKnown:30});return child;
}

export function runPhase9ANpcPreferencesRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Phase 9A NPC-preference regression failed: ${message}`);}

  const fresh=createNewGame({seed:'phase9a-fresh'});
  verify(CURRENT_SAVE_VERSION===17&&fresh.saveVersion===17,'01 Phase 9A must advance the current save schema to 17');
  verify(Object.values(fresh.npcs).every(npc=>npc.preferences===undefined),'02 newborn lives must keep intrinsic preference storage lazy until an NPC becomes socially relevant');
  verify(fresh.relationships.every(rel=>rel.knownPreferenceTags===undefined),'03 newborn relationship knowledge must also remain lazy instead of bloating untouched fresh saves');
  verify(NPC_PREFERENCE_TAG_IDS.length===38&&npcPreferenceTagDefinitions.length===38,'04 the shared preference vocabulary must contain 38 authored tags');
  verify(new Set(NPC_PREFERENCE_TAG_IDS).size===NPC_PREFERENCE_TAG_IDS.length,'05 preference tag ids must be unique');
  verify(npcPreferenceTagDefinitions.every(def=>def.label.trim().length>0&&def.minAge>=0&&def.minAge<=18),'06 every preference tag needs a readable label and bounded age gate');
  verify(personalItemDefinitions.every(item=>item.preferenceTags.every(tag=>NPC_PREFERENCE_TAG_IDS.includes(tag))),'07 all Phase 8D gift-item tags must use the single Shared-Lives preference vocabulary');

  const deterministicA=createNewGame({seed:'phase9a-deterministic'}),deterministicB=createNewGame({seed:'phase9a-deterministic'});deterministicA.character.age=25;deterministicB.character.age=25;initializeNpcPreferenceKnowledge(deterministicA);initializeNpcPreferenceKnowledge(deterministicB);
  verify(JSON.stringify(Object.values(deterministicA.npcs).map(npc=>npc.preferences))===JSON.stringify(Object.values(deterministicB.npcs).map(npc=>npc.preferences)),'08 identical seeded lives must generate identical NPC preferences once they become relevant');
  verify(JSON.stringify(deterministicA.relationships.map(rel=>rel.knownPreferenceTags))===JSON.stringify(deterministicB.relationships.map(rel=>rel.knownPreferenceTags)),'09 identical seeded protagonists must learn the same initial preference knowledge');

  const bounded=createNewGame({seed:'phase9a-bounds'});bounded.character.age=25;const boundedNpc=addNpc(bounded,'bounded-npc',27,['calm','romantic']);const boundedProfile=boundedNpc.preferences!;const nonNeutral=[...boundedProfile.likes,...boundedProfile.dislikes,...boundedProfile.aversions];
  verify(boundedProfile.likes.length===NPC_PREFERENCE_LIKE_LIMIT,'10 each generated profile must have exactly four positive preferences');
  verify(boundedProfile.dislikes.length<=NPC_PREFERENCE_DISLIKE_LIMIT&&boundedProfile.aversions.length<=NPC_PREFERENCE_AVERSION_LIMIT,'11 negative preferences and strong aversion must remain compact');
  verify(new Set(nonNeutral).size===nonNeutral.length,'12 a preference tag cannot occupy multiple levels in one NPC profile');
  const neutralTag=NPC_PREFERENCE_TAG_IDS.find(tag=>!nonNeutral.includes(tag))!;verify(npcPreferenceLevel(boundedProfile,neutralTag)==='neutral'&&npcPreferenceValue(boundedProfile,neutralTag)===0,'13 unspecified interests must remain neutral instead of inventing a hidden weight');

  let calmQuiet=0,plainQuiet=0,calmLikes=0;for(let index=0;index<500;index++){
    const calm=generateNpcPreferenceProfile({seed:'phase9a-traits'},{id:`calm-${index}`,traits:['calm']});const plain=generateNpcPreferenceProfile({seed:'phase9a-traits'},{id:`plain-${index}`,traits:[]});
    calmQuiet+=npcPreferenceValue(calm,'quiet');plainQuiet+=npcPreferenceValue(plain,'quiet');if(calm.likes.includes('quiet'))calmLikes+=1;
  }
  verify(calmQuiet>plainQuiet+60,'14 traits must materially bias compatible interests across a cohort');
  verify(calmLikes>0&&calmLikes<500,'15 trait influence must not hard-code every calm NPC to like Quiet time');
  let aversionProfiles=0;for(let index=0;index<500;index++)if(generateNpcPreferenceProfile({seed:'phase9a-aversions'},{id:`npc-${index}`,traits:[]}).aversions.length)aversionProfiles+=1;
  verify(aversionProfiles>40&&aversionProfiles<180,'16 strong aversions must be occasional rather than universal or impossible');

  const migrationSource=createNewGame({seed:'phase9a-migration'});migrationSource.character.age=32;for(const rel of migrationSource.relationships){rel.yearsKnown=20;rel.score=88;delete rel.knownPreferenceTags;}for(const npc of Object.values(migrationSource.npcs))delete npc.preferences;migrationSource.saveVersion=16;
  const migrationRng=migrationSource.rngCounter,migrationId=migrationSource.idCounter;const migratedA=migrateSave(structuredClone(migrationSource)),migratedB=migrateSave(structuredClone(migrationSource));
  verify(migratedA.saveVersion===17&&Object.values(migratedA.npcs).every(npc=>Boolean(npc.preferences)),'17 schema-16 relationship targets must migrate to schema 17 with durable intrinsic NPC preference profiles');
  verify(migratedA.rngCounter===migrationRng&&migratedA.idCounter===migrationId,'18 preference migration must consume neither gameplay RNG nor runtime ids');
  verify(JSON.stringify(migratedA)===JSON.stringify(migratedB),'19 identical schema-16 inputs must migrate deterministically');
  const remigrated=migrateSave(structuredClone(migratedA));verify(JSON.stringify(remigrated)===JSON.stringify(migratedA),'20 current-schema preference normalization must be idempotent');
  verify(migratedA.relationships.every(rel=>rel.knownPreferenceTags===undefined),'21 migration must not retroactively invent protagonist knowledge or rewrite established relationship records');

  const childPlayer=createNewGame({seed:'phase9a-child-player'});childPlayer.character.age=4;const childNpc=addNpc(childPlayer,'child-known',8);const childRel=addRelationship(childPlayer,childNpc,'sibling',8,90);initializeNpcPreferenceKnowledge(childPlayer);
  verify(npcPreferenceKnowledgeBudget(childPlayer,childRel)===0&&(childRel.knownPreferenceTags?.length??0)===0,'22 protagonists under five must not receive passive preference knowledge');
  childPlayer.character.age=10;delete childRel.knownPreferenceTags;initializeNpcPreferenceKnowledge(childPlayer);verify((((childRel as Relationship).knownPreferenceTags?.length)??0)<=2,'23 child protagonists must reveal only a small age-appropriate slice of another person');

  const ageGate=createNewGame({seed:'phase9a-age-gate'});ageGate.character.age=25;const teenNpc=addNpc(ageGate,'teen-pref',16);const teenRel=addRelationship(ageGate,teenNpc,'best_friend',10,90);teenRel.knownPreferenceTags=['nightlife','games'];enforceStateInvariants(ageGate);
  verify(!teenRel.knownPreferenceTags?.includes('nightlife')&&teenRel.knownPreferenceTags?.includes('games'),'24 preference knowledge must discard interests that are not age-appropriate for the NPC');
  verify(!revealNpcPreference(ageGate,teenNpc.id,'nightlife'),'25 explicit discovery must not reveal an age-inappropriate interest');

  const discovery=createNewGame({seed:'phase9a-discovery'});discovery.character.age=28;const discoveryNpc=addNpc(discovery,'discovery-npc',28,['curious','private']);const discoveryRel=addRelationship(discovery,discoveryNpc,'friend',0,50);initializeNpcPreferenceKnowledge(discovery);const discoveryRng=discovery.rngCounter,discoveryId=discovery.idCounter;
  const initialDiscoveryKnowledge=discoveryRel.knownPreferenceTags;verify(initialDiscoveryKnowledge===undefined,'26 a brand-new ordinary relationship must keep preference knowledge storage lazy until something is actually learned');
  discoveryRel.yearsKnown=8;discoveryRel.score=82;advanceNpcPreferenceKnowledge(discovery);const knownAfter=discoveryRel.knownPreferenceTags?.length??0;
  verify(knownAfter===npcPreferenceKnowledgeBudget(discovery,discoveryRel)&&knownAfter>0,'27 years known and relationship context must deterministically expand passive knowledge');
  verify(discovery.rngCounter===discoveryRng&&discovery.idCounter===discoveryId,'28 learning passive preference knowledge must not consume gameplay RNG or runtime ids');
  const explicitTag=NPC_PREFERENCE_TAG_IDS.find(tag=>!discoveryRel.knownPreferenceTags?.includes(tag)&&npcPreferenceTagById[tag].minAge<=discoveryNpc.age)!;verify(revealNpcPreference(discovery,discoveryNpc.id,explicitTag),'29 an exact eligible preference can be explicitly learned for future shared experiences');
  const explicitCount=discoveryRel.knownPreferenceTags!.length;verify(revealNpcPreference(discovery,discoveryNpc.id,explicitTag)&&discoveryRel.knownPreferenceTags!.length===explicitCount,'30 learning the same preference twice must deduplicate rather than duplicate knowledge');
  verify(!revealNpcPreference(discovery,'missing-npc','music'),'31 stale NPC ids must fail preference revelation safely');

  const projectionBefore=JSON.stringify(discovery),projectionRng=discovery.rngCounter,projectionId=discovery.idCounter;const projectedA=projectKnownNpcPreferences(discovery,discoveryNpc.id),projectedB=projectKnownNpcPreferences(discovery,discoveryNpc.id);
  verify(JSON.stringify(projectedA)===JSON.stringify(projectedB)&&projectedA.length===discoveryRel.knownPreferenceTags!.length,'32 known-interest projection must be deterministic and reveal only learned tags');
  verify(JSON.stringify(discovery)===projectionBefore&&discovery.rngCounter===projectionRng&&discovery.idCounter===projectionId,'33 viewing an NPC interests section must be strictly read-only and RNG/ID neutral');
  verify(projectedA.every(item=>item.level===npcPreferenceLevel(discoveryNpc.preferences!,item.tag)&&item.label===npcPreferenceTagById[item.tag].label),'34 player-facing labels and levels must derive from the intrinsic NPC profile rather than parallel UI truth');

  const malformed=createNewGame({seed:'phase9a-malformed'});malformed.character.age=25;const malformedNpc=addNpc(malformed,'malformed-npc',15);const malformedRel=addRelationship(malformed,malformedNpc,'friend',10,80);malformedNpc.preferences={version:1,likes:['music','music','bogus' as NpcPreferenceTag,'nightlife'],dislikes:['music','games','games'],aversions:['games','food','food']};malformedRel.knownPreferenceTags=['music','music','nightlife','bogus' as NpcPreferenceTag,'games','food','art','quiet','nature','writing'];enforceStateInvariants(malformed);
  verify(validateState(malformed).length===0,'35 central invariants must deterministically repair malformed preference profiles and knowledge');
  verify(new Set([...malformedNpc.preferences!.likes,...malformedNpc.preferences!.dislikes,...malformedNpc.preferences!.aversions]).size===malformedNpc.preferences!.likes.length+malformedNpc.preferences!.dislikes.length+malformedNpc.preferences!.aversions.length,'36 repair must remove duplicated/overlapping intrinsic preferences');
  verify((malformedRel.knownPreferenceTags?.length??0)<=NPC_PREFERENCE_KNOWLEDGE_LIMIT&&!malformedRel.knownPreferenceTags?.includes('nightlife'),'37 repair must bound knowledge, remove unknown tags, and respect NPC age gates');

  const roundTrip=migrateSave(structuredClone(discovery));const rtNpc=roundTrip.npcs[discoveryNpc.id]!,rtRel=roundTrip.relationships.find(rel=>rel.npcId===discoveryNpc.id)!;
  verify(JSON.stringify(rtNpc.preferences)===JSON.stringify(discoveryNpc.preferences)&&JSON.stringify(rtRel.knownPreferenceTags)===JSON.stringify(discoveryRel.knownPreferenceTags),'38 save normalization must preserve exact current preference profile and learned knowledge');

  const dynasty=createNewGame({seed:'phase9a-dynasty'});dynasty.character.age=64;dynasty.currentYear=2090;dynasty.character.traits=['calm','loyal'];const heir=addAdultChild(dynasty);const sibling=addNpc(dynasty,'phase9a-sibling',27,['witty','competitive']);sibling.parentIds=[dynasty.character.id];dynasty.relationships.push({id:'rel-phase9a-sibling',npcId:sibling.id,type:'child',score:80,attraction:0,compatibility:70,yearsKnown:27,knownPreferenceTags:[...NPC_PREFERENCE_TAG_IDS.slice(0,8)]});const siblingProfile=JSON.stringify(sibling.preferences);dynasty.character.alive=false;
  verify(continueAsChild(dynasty,heir.id).success,'39 descendant continuation must succeed with preference state present');
  const newSiblingRel=dynasty.relationships.find(rel=>rel.npcId===sibling.id)!;verify((newSiblingRel.knownPreferenceTags?.length??0)<=6,'40 the new protagonist must derive their own bounded knowledge instead of inheriting the previous protagonist eight-tag knowledge');
  verify(JSON.stringify(dynasty.npcs[sibling.id]!.preferences)===siblingProfile,'41 an NPC intrinsic preference profile must persist unchanged across protagonist handoff');
  verify(validateState(dynasty).length===0,'42 dynasty continuation with preferences must remain invariant-clean');

  const bulk=createNewGame({seed:'phase9a-bulk'});bulk.character.age=35;const bulkRng=bulk.rngCounter,bulkId=bulk.idCounter;let storedTags=0;for(let index=0;index<1000;index++){const profile=generateNpcPreferenceProfile(bulk,{id:`bulk-${index}`,traits:index%2===0?['curious']:['calm']});storedTags+=profile.likes.length+profile.dislikes.length+profile.aversions.length;}
  verify(storedTags<=1000*(NPC_PREFERENCE_LIKE_LIMIT+NPC_PREFERENCE_DISLIKE_LIMIT),'43 one thousand generated NPC profiles must remain structurally bounded');
  verify(bulk.rngCounter===bulkRng&&bulk.idCounter===bulkId,'44 bulk preference generation must remain isolated from gameplay RNG/runtime IDs');

  const lazyBackground=createNewGame({seed:'phase9a-lazy-background'});lazyBackground.character.age=30;const background:Npc={id:'phase9a-background',firstName:'Morgan',lastName:'Vale',age:31,alive:true,health:82,happiness:68,wealth:9000,countryId:lazyBackground.character.countryId,city:lazyBackground.character.city,sexuality:'straight',fertility:55,maritalStatus:'single',traits:['calm'],hiddenOpinion:0,memories:[],parentIds:[],childIds:[],simulationTier:'background'};lazyBackground.npcs[background.id]=background;ensureNpcLife(lazyBackground,background);
  verify(!background.preferences&&validateState(lazyBackground).length===0,'45 unrepresented background NPCs must keep preference storage lazy until they become protagonist-relevant');

  return checks;
}
