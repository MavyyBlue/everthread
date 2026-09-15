import { createNewGame } from '../systems/CharacterSystem';
import { CHARACTER_VISUAL_OPTIONS, createAppearanceDraft } from '../systems/CharacterVisualSystem';
import { continueAsChild } from '../systems/GenerationSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { assignNpcAppearanceParentage, normalizeNpcAppearance, normalizeNpcVisualState, projectNpcAppearance } from '../systems/NpcVisualSystem';
import { haveChild, processFamilyPlanningYear } from '../systems/RelationshipSystem';
import { migrateSave } from '../services/SaveSystem';
import type { CharacterVisualIdentity, GameState, Npc } from '../types/game';

const HERITABLE_KEYS=[
  'faceFamily','eyeFamily','browFamily','noseId','mouthFamily','earId','skinPaletteId','hairPaletteId','irisPaletteId',
] as const satisfies readonly (keyof CharacterVisualIdentity)[];
const PERSONAL_STYLE_KEYS=[
  'hairId','bodyId','clothingId','facialHairId','detailId','eyewearId','accessoryId','expressionId',
] as const satisfies readonly (keyof CharacterVisualIdentity)[];
const HERITABLE_OPTIONS:Record<(typeof HERITABLE_KEYS)[number],readonly string[]>={
  faceFamily:CHARACTER_VISUAL_OPTIONS.faces,eyeFamily:CHARACTER_VISUAL_OPTIONS.eyes,browFamily:CHARACTER_VISUAL_OPTIONS.brows,
  noseId:CHARACTER_VISUAL_OPTIONS.noses,mouthFamily:CHARACTER_VISUAL_OPTIONS.mouths,earId:CHARACTER_VISUAL_OPTIONS.ears,
  skinPaletteId:CHARACTER_VISUAL_OPTIONS.skinPalettes,hairPaletteId:CHARACTER_VISUAL_OPTIONS.hairPalettes,irisPaletteId:CHARACTER_VISUAL_OPTIONS.irisPalettes,
};

function fixture(seed:string){
  const state=createNewGame({seed,sex:'female',genderIdentity:'woman',appearance:createAppearanceDraft(`${seed}:player-look`,'female','woman')});
  state.character.age=28;state.currentYear=2054;state.character.secondary.fertility=100;
  const spouse:Npc={
    id:`${seed}-spouse`,firstName:'Rowan',lastName:state.character.lastName,age:29,alive:true,health:95,happiness:90,wealth:50_000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:100,maritalStatus:'married',gender:'male',reproductiveSex:'male',
    appearance:createAppearanceDraft(`${seed}:spouse-look`,'male','man'),traits:['loyal','responsible'],hiddenOpinion:85,memories:[],parentIds:[],childIds:[],
  };
  state.npcs[spouse.id]=spouse;
  state.relationships.push({id:`rel-${spouse.id}`,npcId:spouse.id,type:'spouse',score:92,attraction:90,compatibility:88,yearsKnown:6});
  return{state,spouse};
}

function syntheticChild(state:GameState,spouse:Npc,id:string):Npc{
  const child:Npc={
    id,firstName:'Kai',lastName:state.character.lastName,age:0,alive:true,health:95,happiness:90,wealth:0,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',gender:'female',reproductiveSex:'female',
    traits:['curious'],hiddenOpinion:70,memories:[],parentIds:[state.character.id,spouse.id],childIds:[],simulationTier:'background',
  };
  assignNpcAppearanceParentage(child,[state.character.id,spouse.id]);
  state.npcs[id]=child;
  return child;
}

function matchesParent(value:string|undefined,a:string|undefined,b:string|undefined){return value===a||value===b;}
function sharedHeritable(a:CharacterVisualIdentity,b:CharacterVisualIdentity){return HERITABLE_KEYS.filter(key=>a[key]===b[key]).length;}

export function runFamilyVisualInheritanceRegression(){
  let checks=0;const verify=(condition:unknown,message:string)=>{checks+=1;if(!condition)throw new Error(`Family Visual Inheritance regression failed: ${message}`);};

  const {state,spouse}=fixture('family-visual-core');
  const playerVisual=state.character.appearance.visual!,spouseVisual=spouse.appearance!.visual!;
  const siblingA=syntheticChild(state,spouse,'family-visual-child-a');
  const siblingB=syntheticChild(state,spouse,'family-visual-child-b');
  const siblingC=syntheticChild(state,spouse,'family-visual-child-c');
  const beforeProjection=JSON.stringify(state),rngBefore=state.rngCounter,idsBefore=state.idCounter;
  const visualA=projectNpcAppearance(state,siblingA).visual!,visualB=projectNpcAppearance(state,siblingB).visual!,visualC=projectNpcAppearance(state,siblingC).visual!;
  verify(JSON.stringify(state)===beforeProjection&&state.rngCounter===rngBefore&&state.idCounter===idsBefore,'read-only family resemblance projection must not mutate GameState, gameplay RNG, or runtime ids');
  verify(HERITABLE_KEYS.every(key=>matchesParent(String(visualA[key]),String(playerVisual[key]),String(spouseVisual[key]))),'every inherited structural/color trait should come from an actual biological visual contributor');
  verify(HERITABLE_KEYS.every(key=>matchesParent(String(visualB[key]),String(playerVisual[key]),String(spouseVisual[key]))),'a second sibling should inherit from the same two real contributors rather than a hidden genetics store');
  verify(HERITABLE_KEYS.every(key=>HERITABLE_OPTIONS[key].includes(String(visualA[key]))),'inherited structural/color component ids must remain valid in the shared portrait renderer catalog');
  const overlapAB=sharedHeritable(visualA,visualB),overlapAC=sharedHeritable(visualA,visualC),overlapBC=sharedHeritable(visualB,visualC);
  verify(Math.max(overlapAB,overlapAC,overlapBC)>=5,'siblings should share a recognizable deterministic family tendency across multiple inherited features');
  verify([overlapAB,overlapAC,overlapBC].some(value=>value<HERITABLE_KEYS.length),'siblings should vary instead of becoming exact inherited-feature clones');

  const unrelatedA=structuredClone(siblingA);delete unrelatedA.appearanceParentIds;
  const unrelatedVisual=projectNpcAppearance(state,unrelatedA).visual!;
  verify(PERSONAL_STYLE_KEYS.every(key=>visualA[key]===unrelatedVisual[key]),'hair style, body, clothing, facial hair, details, eyewear, accessories, and expression should remain the child own deterministic presentation');

  verify(siblingA.appearance===undefined,'background biological descendants should remain visually lazy before they become relevant');
  normalizeNpcVisualState(state);
  verify(siblingA.appearance===undefined,'ordinary runtime normalization must not materialize an unrelated background descendant portrait');
  const lazyRoundTrip=migrateSave(structuredClone(state));
  verify(lazyRoundTrip.npcs[siblingA.id]?.appearance===undefined&&JSON.stringify(lazyRoundTrip.npcs[siblingA.id]?.appearanceParentIds)===JSON.stringify(siblingA.appearanceParentIds),'save normalization should preserve lazy biological visual provenance without inflating background portraits');

  state.relationships.push({id:'rel-family-visual-child-a',npcId:siblingA.id,type:'child',score:80,attraction:0,compatibility:75,yearsKnown:0});
  const revealRng=state.rngCounter,revealIds=state.idCounter;normalizeNpcVisualState(state);
  verify(Boolean(siblingA.appearance?.visual),'a biologically related child should materialize the inherited identity when the relationship makes the portrait relevant');
  verify(state.rngCounter===revealRng&&state.idCounter===revealIds,'materializing inherited family identity must consume no gameplay RNG or runtime ids');
  const materialized=JSON.stringify(siblingA.appearance);
  spouse.appearance=createAppearanceDraft('family-visual-parent-restyle','male','man');
  verify(JSON.stringify(projectNpcAppearance(state,siblingA))===materialized,'once materialized, a child face must never change because a parent appearance later changes');
  const materializedRoundTrip=migrateSave(structuredClone(state));
  verify(JSON.stringify(materializedRoundTrip.npcs[siblingA.id]?.appearance)===materialized,'save/load should preserve the exact materialized inherited face byte-for-byte');

  const biological=fixture('family-visual-player-birth');
  biological.state.familyPlanning.pregnancy={partnerId:biological.spouse.id,conceivedAge:27,dueAge:28,expectedChildren:2};
  const biologicalRng=biological.state.rngCounter;processFamilyPlanningYear(biological.state);
  const born=biological.state.relationships.filter(rel=>rel.type==='child').map(rel=>biological.state.npcs[rel.npcId]!).filter(Boolean);
  verify(born.length===2,'player pregnancy fixture should create the expected twin siblings through the real family-planning path');
  verify(born.every(child=>JSON.stringify(child.appearanceParentIds)===JSON.stringify([biological.state.character.id,biological.spouse.id])),'biological player births should record only visual biological contributors on the existing NPC record');
  const afterBirthRng=biological.state.rngCounter;normalizeNpcVisualState(biological.state);
  verify(born.every(child=>Boolean(child.appearance?.visual))&&biological.state.rngCounter===afterBirthRng,'newborn close-family portraits should materialize inherited faces without extra gameplay RNG after the ordinary birth draws');
  verify(biological.state.rngCounter!==biologicalRng,'the birth itself should still retain its established gameplay RNG behavior');

  const adoption=fixture('family-visual-adoption');
  const adoptResult=haveChild(adoption.state,adoption.spouse.id,true);const adoptedRel=adoption.state.relationships.find(rel=>rel.type==='child');const adopted=adoptedRel?adoption.state.npcs[adoptedRel.npcId]:undefined;
  verify(adoptResult.success&&Boolean(adopted),'real adoption path should still create a child normally');
  verify(adopted?.appearanceParentIds===undefined,'adoption must never be misrepresented as biological visual inheritance even though family parentIds are correctly linked');
  normalizeNpcVisualState(adoption.state);
  verify(Boolean(adopted?.appearance?.visual),'adopted close-family children still receive their own stable portrait identity when revealed');

  const legacy=fixture('family-visual-legacy');const legacyChild=syntheticChild(legacy.state,legacy.spouse,'legacy-child');delete legacyChild.appearanceParentIds;
  legacy.state.relationships.push({id:'legacy-child-rel',npcId:legacyChild.id,type:'child',score:80,attraction:0,compatibility:70,yearsKnown:8});
  const legacyBefore=projectNpcAppearance(legacy.state,legacyChild);const legacyMigrated=migrateSave(structuredClone(legacy.state));
  verify(legacyMigrated.npcs[legacyChild.id]?.appearanceParentIds===undefined,'current-schema old children must not have biological visual provenance fabricated from ambiguous parentIds');
  verify(JSON.stringify(legacyMigrated.npcs[legacyChild.id]?.appearance)===JSON.stringify(legacyBefore),'legacy child portrait normalization should preserve the pre-inheritance deterministic identity instead of retroactively changing old families');

  const lineage=fixture('family-visual-lineage');const lineageParent=syntheticChild(lineage.state,lineage.spouse,'lineage-parent');lineageParent.age=27;normalizeNpcAppearance(lineage.state,lineageParent);
  const lineagePartner:Npc={id:'lineage-partner',firstName:'Ari',lastName:'Vale',age:28,alive:true,health:92,happiness:86,wealth:20_000,countryId:lineage.state.character.countryId,city:lineage.state.character.city,sexuality:'bisexual',fertility:80,maritalStatus:'married',gender:'nonbinary',reproductiveSex:'male',appearance:createAppearanceDraft('family-visual-lineage-partner','male','nonbinary'),traits:['calm'],hiddenOpinion:70,memories:[],parentIds:[],childIds:[]};lineage.state.npcs[lineagePartner.id]=lineagePartner;
  const grandchild:Npc={id:'lineage-grandchild',firstName:'Nova',lastName:lineage.state.character.lastName,age:0,alive:true,health:96,happiness:92,wealth:0,countryId:lineage.state.character.countryId,city:lineage.state.character.city,sexuality:'bisexual',fertility:70,maritalStatus:'single',gender:'female',reproductiveSex:'female',traits:['curious'],hiddenOpinion:65,memories:[],parentIds:[lineageParent.id,lineagePartner.id],childIds:[],simulationTier:'background'};assignNpcAppearanceParentage(grandchild,[lineageParent.id,lineagePartner.id]);lineage.state.npcs[grandchild.id]=grandchild;
  const lineageParentVisual=lineageParent.appearance!.visual!,grandchildVisual=projectNpcAppearance(lineage.state,grandchild).visual!;
  verify(HERITABLE_KEYS.every(key=>matchesParent(String(grandchildVisual[key]),String(lineageParentVisual[key]),String(lineagePartner.appearance!.visual![key]))),'later generations should inherit only through their immediate biological contributors rather than consulting a separate grandparent/genetics ledger');
  verify(HERITABLE_KEYS.some(key=>grandchildVisual[key]===lineageParentVisual[key]&&(lineageParentVisual[key]===lineage.state.character.appearance.visual![key]||lineageParentVisual[key]===lineage.spouse.appearance!.visual![key])),'a grandparent feature should be able to emerge naturally through the inherited identity of the intermediate parent');

  const continuation=fixture('family-visual-continuation');const heir=syntheticChild(continuation.state,continuation.spouse,'inherited-heir');heir.age=22;ensureNpcLife(continuation.state,heir);continuation.state.relationships.push({id:'heir-rel',npcId:heir.id,type:'child',score:90,attraction:0,compatibility:80,yearsKnown:22});normalizeNpcAppearance(continuation.state,heir);const heirFace=JSON.stringify(heir.appearance);
  continuation.state.character.age=64;continuation.state.currentYear=2090;continuation.state.character.alive=false;
  verify(continueAsChild(continuation.state,heir.id).success,'an inherited-appearance adult child should remain a valid descendant continuation target');
  verify(JSON.stringify(continuation.state.character.appearance)===heirFace,'descendant continuation must preserve the exact inherited NPC face when that person becomes playable');

  return checks;
}
