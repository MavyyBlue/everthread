import { relationshipTypeLabel } from '../core/familyRelations';
import { validateState } from '../core/invariants';
import { eventById } from '../data/events';
import { migrateSave } from '../services/SaveSystem';
import { createNewGame } from '../systems/CharacterSystem';
import { checkDeath } from '../systems/DeathSystem';
import { derivePlayerFamilyTopology, syncPlayerFamilyTopology } from '../systems/FamilyTopologySystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife, processNpcLives } from '../systems/NpcLifeSystem';
import { relationshipsForFolder } from '../systems/PeopleGraphSystem';
import { buildPeopleWorkspaceModel } from '../systems/PeopleWorkspaceSystem';
import { eventEligibleForState } from '../systems/EventSystem';
import type { GameState, Npc, RelationshipType } from '../types/game';

function fixture(seed:string,age=32){
  const state=createNewGame({seed});
  state.character.age=age;state.currentYear=2026+age;state.npcs={};state.relationships=[];state.legacy.familyTreeNpcIds=[];
  return state;
}

function addNpc(state:GameState,id:string,age=35,options:Partial<Npc>={}){
  const npc:Npc={
    id,firstName:id.replaceAll('-',' '),lastName:'Kin',age,alive:true,health:88,happiness:72,wealth:18_000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:65,maritalStatus:'single',
    traits:['calm','loyal'],hiddenOpinion:20,memories:[],parentIds:[],childIds:[],simulationTier:'background',
    ...options,
  };
  state.npcs[id]=npc;ensureNpcLife(state,npc);return npc;
}

function addRelationship(state:GameState,npcId:string,type:RelationshipType,score=60){
  state.relationships.push({id:`rel-${npcId}`,npcId,type,score,attraction:0,compatibility:64,yearsKnown:10});
}

function link(parent:Npc,child:Npc|string){
  const childId=typeof child==='string'?child:child.id;
  if(!parent.childIds.includes(childId))parent.childIds.push(childId);
  if(typeof child!=='string'&&!child.parentIds.includes(parent.id))child.parentIds.push(parent.id);
}

function topologyFixture(){
  const state=fixture('phase5d-topology');const playerId=state.character.id;
  const g1=addNpc(state,'grand-a',74);const g2=addNpc(state,'grand-b',72);
  const p1=addNpc(state,'parent-a',52);const p2=addNpc(state,'parent-b',50);
  link(g1,p1);link(g2,p1);link(p1,playerId);link(p2,playerId);
  const aunt=addNpc(state,'aunt-a',48);link(g1,aunt);link(g2,aunt);
  const cousin=addNpc(state,'cousin-a',22);link(aunt,cousin);
  const sibling=addNpc(state,'sibling-a',29);link(p1,sibling);link(p2,sibling);
  const niece=addNpc(state,'niece-a',6);link(sibling,niece);
  const child=addNpc(state,'child-a',10);child.parentIds=[playerId];
  const grandchild=addNpc(state,'grandchild-a',1);link(child,grandchild);
  const step=addNpc(state,'step-parent',49,{maritalStatus:'married'});const stepSibling=addNpc(state,'step-sibling',17);link(step,stepSibling);p1.partnerId=step.id;p1.maritalStatus='married';step.partnerId=p1.id;
  // Existing social relationship proves structural family identity can replace a generic role while preserving affinity.
  addRelationship(state,cousin.id,'friend',83);
  return{state,g1,g2,p1,p2,aunt,cousin,sibling,niece,child,grandchild,step,stepSibling};
}

export function runFamilyTopologyRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Family topology regression failed: ${message}`);}

  const f=topologyFixture();const npcCount=Object.keys(f.state.npcs).length;const rngBefore=f.state.rngCounter;const idBefore=f.state.idCounter;
  const topology=derivePlayerFamilyTopology(f.state);
  verify(topology.get(f.p1.id)==='parent'&&topology.get(f.p2.id)==='parent','both structural parents are derived from the family graph');
  verify(topology.get(f.g1.id)==='grandparent'&&topology.get(f.g2.id)==='grandparent','grandparents are derived through parent ancestry');
  verify(topology.get(f.sibling.id)==='sibling','two shared parents derive a full sibling');
  verify(topology.get(f.step.id)==='stepparent'&&topology.get(f.stepSibling.id)==='stepsibling','current parent partnership derives real stepfamily links');
  verify(topology.get(f.aunt.id)==='aunt_uncle','a parent sibling is derived as aunt/uncle');
  verify(topology.get(f.cousin.id)==='cousin','an aunt/uncle child is derived as cousin');
  verify(topology.get(f.niece.id)==='niece_nephew','a sibling child is derived as niece/nephew');
  verify(topology.get(f.child.id)==='child'&&topology.get(f.grandchild.id)==='grandchild','player descendants remain part of the same topology projection');

  const sync=syncPlayerFamilyTopology(f.state);
  verify(sync.total>=10&&sync.added>0,'topology synchronization materializes missing family relationships');
  verify(Object.keys(f.state.npcs).length===npcCount,'topology synchronization never spawns NPCs just to fill a family tree');
  verify(f.state.rngCounter===rngBefore&&f.state.idCounter===idBefore,'topology synchronization consumes neither gameplay RNG nor runtime IDs');
  verify(f.state.relationships.find(rel=>rel.npcId===f.cousin.id)?.type==='cousin','a structurally related friend is represented by authoritative cousin kinship');
  verify(f.state.relationships.find(rel=>rel.npcId===f.cousin.id)?.score===83,'retyping a social relationship as family preserves its relationship score');
  const exFixture=topologyFixture();const exRel=exFixture.state.relationships.find(rel=>rel.npcId===exFixture.cousin.id)!;exRel.type='ex';const exScore=exRel.score;syncPlayerFamilyTopology(exFixture.state);
  verify(exRel.type==='ex'&&exRel.score===exScore,'topology repair preserves established romantic history instead of rewriting a structurally related ex as cousin');
  const relationshipCount=f.state.relationships.length;const second=syncPlayerFamilyTopology(f.state);
  verify(second.added===0&&f.state.relationships.length===relationshipCount,'repeated topology synchronization is idempotent and creates no duplicate relationships');
  verify(relationshipTypeLabel('aunt_uncle')==='aunt / uncle'&&relationshipTypeLabel('niece_nephew')==='niece / nephew','ambiguous kin labels render clearly in player-facing UI');

  const relatives=relationshipsForFolder(f.state,'relatives');
  verify(relatives.some(rel=>rel.npcId===f.aunt.id&&rel.type==='aunt_uncle'),'People → Relatives includes derived aunts/uncles');
  verify(relatives.some(rel=>rel.npcId===f.cousin.id&&rel.type==='cousin'),'People → Relatives includes derived cousins');
  const workspace=buildPeopleWorkspaceModel(f.state);const relativesFolder=workspace.folders.find(folder=>folder.id==='relatives');
  verify(Boolean(relativesFolder&&relativesFolder.count>=6),'Threadspace family projection counts the expanded kin taxonomy without adding a new folder/database');
  const auntWorkspacePerson=workspace.people.find(person=>person.id===f.aunt.id);
  verify(auntWorkspacePerson?.memberships.some(membership=>membership.folderId==='relatives'&&membership.label==='aunt / uncle')===true,'Threadspace membership labels render aunt/uncle clearly instead of exposing storage underscores');


  const familyEvent=eventById['family_favor_request'];
  const cousinOnly=fixture('phase5d-family-event',30);const eventCousin=addNpc(cousinOnly,'event-cousin',28);addRelationship(cousinOnly,eventCousin.id,'cousin',70);
  verify(Boolean(familyEvent&&eventEligibleForState(cousinOnly,familyEvent)),'existing procedural family events can target a living cousin when that is the available family context');
  const lend=familyEvent?.choices.find(choice=>choice.id==='lend');const requiredTypes=lend?.effects?.schedule?.requiredRelationshipTypes??[];
  verify(requiredTypes.includes('aunt_uncle')&&requiredTypes.includes('cousin'),'delayed family-favor continuity accepts aunt/uncle and cousin targets');

  const background=topologyFixture();syncPlayerFamilyTopology(background.state);background.aunt.simulationTier='background';background.cousin.simulationTier='background';background.state.relationships.find(rel=>rel.npcId===background.aunt.id)!.score=55;background.state.relationships.find(rel=>rel.npcId===background.cousin.id)!.score=55;
  background.state.character.age+=1;background.state.currentYear+=1;processNpcLives(background.state);
  verify(background.state.npcs[background.aunt.id]?.simulationTier==='background'&&background.state.npcs[background.cousin.id]?.simulationTier==='background','extended kin does not automatically promote background NPCs into full yearly simulation');
  background.state.relationships.find(rel=>rel.npcId===background.cousin.id)!.score=82;background.state.character.age+=1;background.state.currentYear+=1;processNpcLives(background.state);
  verify(background.state.npcs[background.cousin.id]?.simulationTier==='full','a genuinely close cousin can still promote naturally through the existing meaningful-relationship threshold');

  const migration=topologyFixture();migration.state.relationships=migration.state.relationships.filter(rel=>!['aunt_uncle','cousin'].includes(rel.type));const migrationRng=migration.state.rngCounter;const migrated=migrateSave(structuredClone(migration.state));
  verify(migrated.saveVersion===10,'broader kin topology requires no save-schema bump because it derives from existing family graph truth');
  verify(migrated.rngCounter===migrationRng,'current-schema family-topology backfill is RNG-neutral');
  verify(migrated.relationships.some(rel=>rel.npcId===migration.aunt.id&&rel.type==='aunt_uncle')&&migrated.relationships.some(rel=>rel.npcId===migration.cousin.id&&rel.type==='cousin'),'loading an existing schema-10 dynasty deterministically backfills aunt/uncle and cousin relationships');
  const migratedAgain=migrateSave(structuredClone(migration.state));
  verify(JSON.stringify(migrated.relationships)===JSON.stringify(migratedAgain.relationships),'family-topology migration/backfill is deterministic across identical saves');
  verify(validateState(migrated).length===0,'backfilled extended-family topology remains state-valid');

  const continuation=fixture('phase5d-continuation',56);const oldPlayer=continuation.character.id;
  const founderParent=addNpc(continuation,'founder-parent',82);link(founderParent,oldPlayer);addRelationship(continuation,founderParent.id,'parent',72);
  const oldSibling=addNpc(continuation,'founder-sibling',53);link(founderParent,oldSibling);addRelationship(continuation,oldSibling.id,'sibling',66);
  const oldSiblingChild=addNpc(continuation,'founder-sibling-child',24);link(oldSibling,oldSiblingChild);addRelationship(continuation,oldSiblingChild.id,'niece_nephew',58);
  const heir=addNpc(continuation,'heir',27);heir.parentIds=[oldPlayer];addRelationship(continuation,heir.id,'child',82);
  verify(checkDeath(continuation,true),'continuation topology fixture reaches the death/estate handoff');
  verify(continueAsChild(continuation,heir.id).success,'descendant continuation succeeds with an extended family graph present');
  verify(continuation.relationships.some(rel=>rel.npcId===oldSibling.id&&rel.type==='aunt_uncle'),'after continuation, the prior protagonist sibling is reclassified as the new protagonist aunt/uncle');
  verify(continuation.relationships.some(rel=>rel.npcId===oldSiblingChild.id&&rel.type==='cousin'),'after continuation, the prior protagonist niece/nephew becomes the new protagonist cousin');
  verify(validateState(continuation).length===0,'generation handoff with expanded topology remains state-valid');

  const scale=fixture('phase5d-scale',40);const scalePlayer=scale.character.id;const scaleGrand=addNpc(scale,'scale-grand',80);const scaleParent=addNpc(scale,'scale-parent',60);link(scaleGrand,scaleParent);link(scaleParent,scalePlayer);addRelationship(scale,scaleParent.id,'parent',72);
  for(let i=0;i<60;i+=1){
    const aunt=addNpc(scale,`scale-aunt-${i}`,45+(i%12));link(scaleGrand,aunt);
    for(let c=0;c<4;c+=1){const cousin=addNpc(scale,`scale-cousin-${i}-${c}`,18+((i+c)%25));link(aunt,cousin);}
  }
  const scaleStartNpcs=Object.keys(scale.npcs).length;const scaleRng=scale.rngCounter;syncPlayerFamilyTopology(scale);
  verify(scale.relationships.filter(rel=>rel.type==='aunt_uncle').length===60,'large-family topology materializes every first-order aunt/uncle without truncating the real graph');
  verify(scale.relationships.filter(rel=>rel.type==='cousin').length===240,'large-family topology materializes the expected cousin network without synthetic population growth');
  verify(Object.keys(scale.npcs).length===scaleStartNpcs&&scale.rngCounter===scaleRng,'hundreds of derived relatives add relationship topology only, not NPCs or RNG consumption');
  verify(scale.relationships.length<=Object.keys(scale.npcs).length+2,'expanded kin remains linearly bounded to the existing NPC population rather than forming pairwise relationship explosions');
  for(let year=0;year<4;year+=1){scale.character.age+=1;scale.currentYear+=1;processNpcLives(scale);}
  const extendedIds=new Set(scale.relationships.filter(rel=>rel.type==='aunt_uncle'||rel.type==='cousin').map(rel=>rel.npcId));
  verify([...extendedIds].every(id=>scale.npcs[id]?.simulationTier==='background'||(scale.relationships.find(rel=>rel.npcId===id)?.score??0)>=72),'large extended-family networks remain cheap unless an individual becomes meaningfully close');
  verify(validateState(scale).length===0,'hundreds-relative multi-year simulation remains state-valid after topology synchronization');

  return checks;
}
