import { createNewGame } from '../systems/CharacterSystem';
import { migrateSave } from '../services/SaveSystem';
import {
  CHARACTER_ART_CATALOG, CHARACTER_VISUAL_OPTIONS, appearanceFromVisual, characterAgePresentation, characterAgeStage, characterVisualLabel,
  createAppearanceDraft, describeAppearanceProfile, normalizeAppearanceProfile, normalizeCharacterAppearance, paletteTokens,
  portraitAssetIds, randomizeAppearanceDraft,
} from '../systems/CharacterVisualSystem';
import type { AppearanceProfile, CharacterVisualIdentity, GameState, Npc } from '../types/game';
import { meetPotentialPartner } from '../systems/RelationshipSystem';
import { normalizeNpcVisualState, npcPortraitRevealMode, projectNpcAppearance } from '../systems/NpcVisualSystem';

export function runCharacterVisualRegression(){
  let checks=0;const verify=(condition:unknown,message:string)=>{checks+=1;if(!condition)throw new Error(`Character Visual regression failed: ${message}`);};
  const assets=CHARACTER_ART_CATALOG.assets;

  verify(Object.keys(assets).length===624,'Astra art pack should expose exactly 624 vetted modular SVG assets');
  verify(CHARACTER_VISUAL_OPTIONS.faces.length===8,'face catalog should expose 8 families');
  verify(CHARACTER_VISUAL_OPTIONS.eyes.length===12,'eye catalog should expose 12 families');
  verify(CHARACTER_VISUAL_OPTIONS.brows.length===10,'brow catalog should expose 10 families');
  verify(CHARACTER_VISUAL_OPTIONS.noses.length===10,'nose catalog should expose 10 styles');
  verify(CHARACTER_VISUAL_OPTIONS.mouths.length===12,'mouth catalog should expose 12 families');
  verify(CHARACTER_VISUAL_OPTIONS.ears.length===6,'ear catalog should expose 6 styles');
  verify(CHARACTER_VISUAL_OPTIONS.hair.length===30,'hair catalog should expose 30 hairstyles');
  verify(CHARACTER_VISUAL_OPTIONS.bodies.length===6,'body catalog should expose 6 frames');
  verify(CHARACTER_VISUAL_OPTIONS.clothing.length===24,'clothing catalog should expose 24 styles');
  verify(CHARACTER_VISUAL_OPTIONS.facialHair.length===12,'facial-hair catalog should expose 12 options');
  verify(CHARACTER_VISUAL_OPTIONS.details.length===16,'detail catalog should expose 16 options');
  verify(CHARACTER_VISUAL_OPTIONS.eyewear.length===12,'eyewear catalog should expose 12 options');
  verify(CHARACTER_VISUAL_OPTIONS.accessories.length===16,'accessory catalog should expose 16 options');
  verify(CHARACTER_VISUAL_OPTIONS.skinPalettes.length===16&&CHARACTER_VISUAL_OPTIONS.hairPalettes.length===16&&CHARACTER_VISUAL_OPTIONS.irisPalettes.length===12,'palette counts should match the approved art kit');
  verify(CHARACTER_VISUAL_OPTIONS.expressions.length===8,'expression catalog should expose 8 canonical expressions');

  const stages=['infant-toddler','child','teen','adult','mature-adult','elder'] as const;
  verify(stages.every(stage=>CHARACTER_VISUAL_OPTIONS.faces.every(face=>Boolean(assets[`${face}.${stage}`]))),'every face family should resolve for all six age stages');
  verify(CHARACTER_VISUAL_OPTIONS.hair.every(hair=>Boolean(assets[`${hair}.back`])&&Boolean(assets[`${hair}.front`])),'every hairstyle should provide paired back/front geometry');
  verify(CHARACTER_VISUAL_OPTIONS.eyes.every(eye=>CHARACTER_VISUAL_OPTIONS.expressions.every(expression=>Boolean(assets[`${eye}.${expression}`]))),'every eye family should support every expression');
  verify(CHARACTER_VISUAL_OPTIONS.brows.every(brow=>CHARACTER_VISUAL_OPTIONS.expressions.every(expression=>Boolean(assets[`${brow}.${expression}`]))),'every brow family should support every expression');
  verify(CHARACTER_VISUAL_OPTIONS.mouths.every(mouth=>CHARACTER_VISUAL_OPTIONS.expressions.every(expression=>Boolean(assets[`${mouth}.${expression}`]))),'every mouth family should support every expression');
  verify(CHARACTER_VISUAL_OPTIONS.clothing.every(clothing=>CHARACTER_VISUAL_OPTIONS.bodies.every(body=>Boolean(assets[`${clothing}.${body.replace(/^body\./,'').replace(/-\d+$/,'')}`]))),'every clothing style should resolve for every body frame');

  verify(characterAgeStage(0)==='infant-toddler'&&characterAgeStage(4)==='infant-toddler','0–4 should use the infant/toddler art stage');
  verify(characterAgeStage(5)==='child'&&characterAgeStage(12)==='child','5–12 should use the child art stage');
  verify(characterAgeStage(13)==='teen'&&characterAgeStage(17)==='teen','13–17 should use the teen art stage');
  verify(characterAgeStage(18)==='adult'&&characterAgeStage(44)==='adult','18–44 should use the adult art stage');
  verify(characterAgeStage(45)==='mature-adult'&&characterAgeStage(64)==='mature-adult','45–64 should use the mature-adult art stage');
  verify(characterAgeStage(65)==='elder','65+ should use the elder art stage');

  const draft=createAppearanceDraft('character-visual-draft','female','woman');
  verify(Boolean(draft.visual),'new creator drafts should contain one canonical modular visual identity');
  verify(describeAppearanceProfile(draft).some(value=>value.includes('face'))&&describeAppearanceProfile(draft).some(value=>value.includes('eyes')),'profile description should expose physical portrait traits from the same appearance authority');
  verify(portraitAssetIds(draft.visual!,18).length>=10&&portraitAssetIds(draft.visual!,18).every(item=>Boolean(assets[item.id])),'adult portrait projection should resolve only existing art assets');
  verify(stages.every((_,index)=>portraitAssetIds(draft.visual!,[0,7,15,25,52,75][index]!).every(item=>Boolean(assets[item.id]))),'the same stable visual identity should render through all age stages');


  const agingVisual:CharacterVisualIdentity={
    ...structuredClone(draft.visual!),
    hairPaletteId:'hair-color.warm-brown',
    clothingId:'clothing.lab-coat-22',
    facialHairId:'facial-hair.full-beard-11',
    detailId:'detail.elder-age-marks-16',
  };
  const agingSnapshot=JSON.stringify(agingVisual);
  const infantPresentation=characterAgePresentation(agingVisual,0);
  verify(infantPresentation.stage==='infant-toddler'&&infantPresentation.clothingId!=='clothing.lab-coat-22'&&!infantPresentation.facialHairId&&!infantPresentation.detailIds.includes('detail.elder-age-marks-16'),'infant presentation should suppress occupational clothing, facial hair, and elder-only details without changing identity');
  verify(JSON.stringify(characterAgePresentation(agingVisual,0))===JSON.stringify(infantPresentation),'age presentation should be deterministic for the same stable identity and age');
  const teenPresentation=characterAgePresentation(agingVisual,16);
  verify(teenPresentation.clothingId!=='clothing.lab-coat-22'&&['facial-hair.chin-stubble-01','facial-hair.light-mustache-02'].includes(teenPresentation.facialHairId??''),'teen presentation should remain youth-safe while allowing only light projected facial hair');
  const adultPresentation=characterAgePresentation(agingVisual,18);
  verify(adultPresentation.clothingId==='clothing.lab-coat-22'&&adultPresentation.facialHairId==='facial-hair.full-beard-11'&&!adultPresentation.detailIds.includes('detail.elder-age-marks-16'),'adult presentation should restore the stored personal style while keeping elder-only details hidden');
  verify(characterAgePresentation(agingVisual,45).detailIds.some(id=>id==='detail.under-eye-soft-12'||id==='detail.under-eye-defined-13'),'mature presentation should add a deterministic subtle 45+ facial-aging detail');
  verify(characterAgePresentation(agingVisual,55).detailIds.includes('detail.mature-lines-14'),'later mature-adult presentation should add mature facial lines');
  verify(characterAgePresentation(agingVisual,65).detailIds.includes('detail.elder-lines-15'),'elder presentation should add elder facial lines');
  const lateElder=characterAgePresentation(agingVisual,75);
  verify(lateElder.detailIds.includes('detail.elder-lines-15')&&lateElder.detailIds.includes('detail.elder-age-marks-16'),'later elder presentation should layer elder lines and age marks');
  const grayAge=Array.from({length:40},(_,index)=>45+index).find(age=>characterAgePresentation(agingVisual,age).hairPaletteId!==agingVisual.hairPaletteId);
  verify(grayAge!==undefined&&grayAge>=48&&grayAge<=64,'natural hair should begin deterministic graying within the mature-life window instead of rerolling from gameplay RNG');
  verify(characterAgePresentation(agingVisual,grayAge!).hairPaletteId==='hair-color.silver'&&characterAgePresentation(agingVisual,grayAge!+12).hairPaletteId==='hair-color.white','natural hair aging should progress from the stored color to silver and then white predictably');
  const dyedVisual={...agingVisual,hairPaletteId:'hair-color.midnight-blue'};
  verify(characterAgePresentation(dyedVisual,95).hairPaletteId==='hair-color.midnight-blue','stylized/dyed hair palettes should remain authored presentation instead of being forcibly grayed');
  const infantAssets=portraitAssetIds(agingVisual,0).map(item=>item.id),adultAssets=portraitAssetIds(agingVisual,18).map(item=>item.id);
  verify(!infantAssets.includes('facial-hair.full-beard-11')&&!infantAssets.some(id=>id.startsWith('clothing.lab-coat-22.'))&&!infantAssets.includes('detail.elder-age-marks-16'),'portrait asset projection should enforce infant-safe presentation at render time');
  verify(adultAssets.includes('facial-hair.full-beard-11')&&adultAssets.some(id=>id.startsWith('clothing.lab-coat-22.')),'adult portrait assets should return to the stored facial-hair and clothing identity');
  const silverTokens=paletteTokens(agingVisual,grayAge!),silverPalette=CHARACTER_ART_CATALOG.hairPalettes.find(item=>item.id==='hair-color.silver')!;
  verify(silverTokens['hair.base']===silverPalette.colors['hair.base'],'age-aware palette tokens should render the projected silver hair palette without rewriting the saved palette');
  const agingAppearance=appearanceFromVisual(agingVisual);
  const infantDescription=describeAppearanceProfile(agingAppearance,0).map(value=>value.toLowerCase()),adultDescription=describeAppearanceProfile(agingAppearance,18).map(value=>value.toLowerCase());
  verify(!infantDescription.some(value=>value.includes('beard'))&&!infantDescription.some(value=>value.includes('elder age marks'))&&adultDescription.some(value=>value.includes('full beard')),'age-aware profile copy should match visible facial-hair/detail presentation');
  verify(JSON.stringify(agingVisual)===agingSnapshot,'all age presentation projections must leave the stable visual identity byte-for-byte unchanged');

  const randomizedA=randomizeAppearanceDraft(draft,'same-cosmetic-seed','female','woman');
  const randomizedB=randomizeAppearanceDraft(draft,'same-cosmetic-seed','female','woman');
  verify(JSON.stringify(randomizedA)===JSON.stringify(randomizedB),'cosmetic randomization should be deterministic for the same cosmetic seed');
  verify(JSON.stringify(draft)!==JSON.stringify(randomizedA),'cosmetic randomization should produce a distinct draft without mutating the original');

  const seed='character-visual-gameplay-rng-neutral';
  const baseline=createNewGame({seed});
  const custom=createNewGame({seed,appearance:randomizedA});
  const stripAppearance=(state:GameState)=>{const clone=structuredClone(state);clone.character.appearance={skinTone:'x',hairColor:'x',hairStyle:'x',eyeColor:'x',accessories:[]};return clone;};
  verify(baseline.rngCounter===custom.rngCounter,'custom appearance must preserve the historical gameplay RNG counter');
  verify(JSON.stringify(stripAppearance(baseline))===JSON.stringify(stripAppearance(custom)),'custom appearance must not alter any non-appearance gameplay state for an identical seeded life');
  verify(custom.character.appearance.visual?.hairId===randomizedA.visual?.hairId&&custom.character.appearance.hairStyle===characterVisualLabel(randomizedA.visual?.hairId),'created character profile and portrait should share the saved hairstyle identity');

  const legacy=structuredClone(baseline) as GameState;delete legacy.character.appearance.visual;
  const migrated=migrateSave(structuredClone(legacy));
  verify(migrated.saveVersion===18&&Boolean(migrated.character.appearance.visual),'current schema-17 saves without modular portrait data should normalize without a schema bump');
  const remigrated=migrateSave(structuredClone(migrated));
  verify(JSON.stringify(remigrated.character.appearance)===JSON.stringify(migrated.character.appearance),'appearance normalization should be deterministic and idempotent');
  verify(migrated.rngCounter===legacy.rngCounter&&migrated.idCounter===legacy.idCounter,'legacy appearance normalization must consume no gameplay RNG or runtime IDs');

  const dirty=structuredClone(migrated.character);dirty.appearance.visual={...dirty.appearance.visual!,faceFamily:'face.not-real',hairId:'hair.not-real',skinPaletteId:'skin.not-real'} as CharacterVisualIdentity;
  verify(normalizeCharacterAppearance(dirty),'invalid visual IDs should be repaired through the existing appearance authority');
  verify(Boolean(assets[`${dirty.appearance.visual!.faceFamily}.adult`])&&Boolean(assets[`${dirty.appearance.visual!.hairId}.front`]),'repaired face/hair IDs should resolve to real art assets');
  verify(CHARACTER_VISUAL_OPTIONS.skinPalettes.includes(dirty.appearance.visual!.skinPaletteId),'repaired skin palette should resolve to the approved palette catalog');

  const legacyAppearance:AppearanceProfile={skinTone:'olive',hairColor:'auburn',hairStyle:'curly',eyeColor:'hazel',accessories:[]};
  const normalized=normalizeAppearanceProfile(legacyAppearance,'legacy-label-compat','male','man');
  verify(normalized.skinTone==='Olive'&&normalized.hairColor==='Auburn'&&normalized.eyeColor==='Hazel','legacy physical labels should map into the nearest matching approved palette labels');
  verify(normalized.visual?.hairId==='hair.curly-bob-13','legacy curly hair should map to the approved modular curly hairstyle family');
  const roundTrip=appearanceFromVisual(normalized.visual!);
  verify(roundTrip.hairStyle===normalized.hairStyle&&roundTrip.eyeColor===normalized.eyeColor,'visual-to-profile projection should preserve display labels from the same selected identity');

  const npcState=createNewGame({seed:'character-visual-npc-identity'});
  const npcRng=npcState.rngCounter,npcIds=npcState.idCounter;
  const visualChanges=normalizeNpcVisualState(npcState);
  const parentRels=npcState.relationships.filter(rel=>rel.type==='parent');
  const parentVisuals=parentRels.map(rel=>npcState.npcs[rel.npcId]?.appearance?.visual);
  verify(visualChanges>0&&parentRels.every(rel=>npcPortraitRevealMode(npcState,rel.npcId)==='portrait'),'close-family relationships should reveal through the existing relationship authority without redundant relationship flags');
  verify(parentVisuals.every(Boolean),'revealed family NPCs should receive one stable portrait identity on their existing NPC record');
  verify(JSON.stringify(parentVisuals[0])!==JSON.stringify(parentVisuals[1]),'separate NPC ids should deterministically produce distinct portrait identities rather than cloned faces');
  verify(npcState.rngCounter===npcRng&&npcState.idCounter===npcIds,'NPC portrait normalization must consume neither gameplay RNG nor runtime ids');
  const normalizedNpcSnapshot=JSON.stringify(npcState);verify(normalizeNpcVisualState(npcState)===0&&JSON.stringify(npcState)===normalizedNpcSnapshot,'NPC portrait normalization should be idempotent');

  const backgroundSource=npcState.npcs[parentRels[0]!.npcId]!;
  const backgroundNpc: Npc={...structuredClone(backgroundSource),id:'background-visual-lazy',firstName:'Background',appearance:undefined,parentIds:[],childIds:[],partnerId:undefined,simulationTier:'background'};
  npcState.npcs[backgroundNpc.id]=backgroundNpc;
  normalizeNpcVisualState(npcState);
  verify(backgroundNpc.appearance===undefined,'background-only NPCs should stay visually lazy instead of inflating long-life saves');

  const acquaintance=createNewGame({seed:'character-visual-acquaintance'});acquaintance.character.age=22;verify(meetPotentialPartner(acquaintance).success,'fixture should create a new relationship candidate');
  const acquaintanceRel=acquaintance.relationships.find(rel=>rel.type==='friend'&&rel.yearsKnown===0)!;const acquaintanceNpc=acquaintance.npcs[acquaintanceRel.npcId]!;
  const projectionBefore=JSON.stringify(acquaintance);const projectionRng=acquaintance.rngCounter,projectionIds=acquaintance.idCounter;
  verify(npcPortraitRevealMode(acquaintance,acquaintanceNpc.id)==='silhouette','a brand-new low-familiarity relationship should begin as a silhouette');
  projectNpcAppearance(acquaintance,acquaintanceNpc);
  verify(JSON.stringify(acquaintance)===projectionBefore&&acquaintance.rngCounter===projectionRng&&acquaintance.idCounter===projectionIds,'read-only NPC portrait projection must not mutate state, RNG, or ids');
  normalizeNpcVisualState(acquaintance);
  verify(acquaintanceNpc.appearance===undefined&&acquaintanceRel.portraitRevealed!==true,'unrevealed acquaintances should not persist hidden portrait payloads');
  acquaintanceRel.yearsKnown=1;const revealRng=acquaintance.rngCounter,revealIds=acquaintance.idCounter;normalizeNpcVisualState(acquaintance);
  verify(acquaintanceRel.portraitRevealed===true&&npcPortraitRevealMode(acquaintance,acquaintanceNpc.id)==='portrait'&&Boolean(acquaintanceNpc.appearance?.visual),'relationship familiarity should durably reveal the exact NPC portrait');
  verify(acquaintance.rngCounter===revealRng&&acquaintance.idCounter===revealIds,'familiarity reveal must remain gameplay-RNG and runtime-id neutral');
  acquaintanceRel.score=0;acquaintanceRel.yearsKnown=0;normalizeNpcVisualState(acquaintance);
  verify(npcPortraitRevealMode(acquaintance,acquaintanceNpc.id)==='portrait','once learned, portrait knowledge should not disappear when a relationship later worsens');
  const acquaintanceRoundTrip=migrateSave(structuredClone(acquaintance));
  verify(JSON.stringify(acquaintanceRoundTrip.npcs[acquaintanceNpc.id]?.appearance)===JSON.stringify(acquaintanceNpc.appearance)&&acquaintanceRoundTrip.relationships.find(rel=>rel.npcId===acquaintanceNpc.id)?.portraitRevealed===true,'save normalization should preserve exact revealed NPC identity and player-specific portrait knowledge');

  return checks;
}
