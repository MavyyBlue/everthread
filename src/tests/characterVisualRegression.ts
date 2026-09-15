import { createNewGame } from '../systems/CharacterSystem';
import { migrateSave } from '../services/SaveSystem';
import {
  CHARACTER_ART_CATALOG, CHARACTER_VISUAL_OPTIONS, appearanceFromVisual, characterAgeStage, characterVisualLabel,
  createAppearanceDraft, describeAppearanceProfile, normalizeAppearanceProfile, normalizeCharacterAppearance,
  portraitAssetIds, randomizeAppearanceDraft,
} from '../systems/CharacterVisualSystem';
import type { AppearanceProfile, CharacterVisualIdentity, GameState } from '../types/game';

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
  verify(migrated.saveVersion===17&&Boolean(migrated.character.appearance.visual),'current schema-17 saves without modular portrait data should normalize without a schema bump');
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

  return checks;
}
