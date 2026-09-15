import catalog from '../assets/characterArtCatalog.json';
import type { AppearanceProfile, Character, CharacterVisualIdentity, GenderIdentity, Sex } from '../types/game';

export type CharacterAgeStage='infant-toddler'|'child'|'teen'|'adult'|'mature-adult'|'elder';

type PaletteEntry={id:string;label:string;colors:Record<string,string>};
type CatalogShape={
  kitId:string;version:string;
  families:Record<string,string[]>;
  skinPalettes:PaletteEntry[];hairPalettes:PaletteEntry[];irisPalettes:PaletteEntry[];
  defaultTokens:Record<string,string>;
  ageProfiles:Record<CharacterAgeStage,Record<string,string>>;
  expressions:string[];
  labels:Record<string,string>;
  assets:Record<string,{category:string;layer:number}>;
};

export const CHARACTER_ART_CATALOG=catalog as CatalogShape;
export const CHARACTER_VISUAL_VERSION=1 as const;

const families=CHARACTER_ART_CATALOG.families;
const family=(key:string)=>families[key]??[];
const paletteIds=(entries:PaletteEntry[])=>entries.map(entry=>entry.id);

export const CHARACTER_VISUAL_OPTIONS={
  faces:family('face'),eyes:family('eye'),brows:family('brow'),noses:family('nose'),mouths:family('mouth'),ears:family('ear'),
  hair:family('hair'),bodies:family('body'),clothing:family('clothing'),facialHair:family('facial-hair'),details:family('detail'),
  eyewear:family('eyewear'),accessories:family('accessory'),skinPalettes:paletteIds(CHARACTER_ART_CATALOG.skinPalettes),
  hairPalettes:paletteIds(CHARACTER_ART_CATALOG.hairPalettes),irisPalettes:paletteIds(CHARACTER_ART_CATALOG.irisPalettes),
  expressions:CHARACTER_ART_CATALOG.expressions,silhouettes:family('silhouette'),
} as const;

function hashString(value:string):number{
  let hash=2166136261>>>0;
  for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
  return hash>>>0;
}
function pick<T>(items:readonly T[],key:string,fallback:T):T{return items.length?items[hashString(key)%items.length]!:fallback;}
function optionalPick(items:readonly string[],key:string,chancePercent:number):string|undefined{
  const roll=hashString(`${key}:chance`)%100;if(roll>=chancePercent)return undefined;return pick(items,`${key}:value`,items[0]??'');
}
function valid(value:string|undefined,values:readonly string[],fallback:string):string{return value&&values.includes(value)?value:fallback;}
function validOptional(value:string|undefined,values:readonly string[]):string|undefined{return value&&values.includes(value)?value:undefined;}

const skinMap:Record<string,string>={porcelain:'skin.porcelain',fair:'skin.rose-ivory',light:'skin.warm-ivory',medium:'skin.beige',olive:'skin.olive',tan:'skin.warm-tan',brown:'skin.umber','deep brown':'skin.mahogany',dark:'skin.espresso'};
const hairMap:Record<string,string>={black:'hair-color.ink','dark brown':'hair-color.espresso',brown:'hair-color.warm-brown',auburn:'hair-color.auburn',blonde:'hair-color.honey-blonde',platinum:'hair-color.platinum',red:'hair-color.copper'};
const irisMap:Record<string,string>={brown:'iris.brown','dark brown':'iris.dark-brown',hazel:'iris.hazel',green:'iris.emerald',blue:'iris.blue',gray:'iris.gray',amber:'iris.amber'};
const hairStyleMap:Record<string,string>={straight:'hair.straight-long-15',wavy:'hair.wavy-medium-12',curly:'hair.curly-bob-13',coiled:'hair.coily-crop-08','short textured':'hair.textured-crop-03','long layered':'hair.wavy-long-16',cropped:'hair.buzzed-01'};

export function characterAgeStage(age:number):CharacterAgeStage{
  if(age<=4)return'infant-toddler';if(age<=12)return'child';if(age<=17)return'teen';if(age<=44)return'adult';if(age<=64)return'mature-adult';return'elder';
}

export function characterVisualLabel(id:string|undefined):string{
  if(!id)return'';return CHARACTER_ART_CATALOG.labels[id]??id.split('.').at(-1)?.replace(/-\d+$/,'').replaceAll('-',' ')??id;
}

export function bodyKind(bodyId:string):string{return bodyId.replace(/^body\./,'').replace(/-\d+$/,'');}

function generatedVisual(seed:string,legacy:AppearanceProfile,sex:Sex='female',gender:GenderIdentity='woman'):CharacterVisualIdentity{
  const opts=CHARACTER_VISUAL_OPTIONS;
  const faceFallback=opts.faces[0]??'face.oval-01',eyeFallback=opts.eyes[0]??'eye.almond-01',browFallback=opts.brows[0]??'brow.natural-01';
  const noseFallback=opts.noses[0]??'nose.soft-01',mouthFallback=opts.mouths[0]??'mouth.balanced-01',earFallback=opts.ears[0]??'ear.balanced-01';
  const hairFallback=opts.hair[0]??'hair.buzzed-01',bodyFallback=opts.bodies[1]??opts.bodies[0]??'body.average-01',clothingFallback=opts.clothing[0]??'clothing.crew-tee-01';
  const skinFallback=opts.skinPalettes[3]??opts.skinPalettes[0]??'skin.beige',hairColorFallback=opts.hairPalettes[2]??opts.hairPalettes[0]??'hair-color.espresso',irisFallback=opts.irisPalettes[1]??opts.irisPalettes[0]??'iris.brown';
  const facialHairChance=sex==='male'||gender==='man'?18:2;
  return {
    version:CHARACTER_VISUAL_VERSION,
    faceFamily:pick(opts.faces,`${seed}:face`,faceFallback),eyeFamily:pick(opts.eyes,`${seed}:eyes`,eyeFallback),browFamily:pick(opts.brows,`${seed}:brows`,browFallback),
    noseId:pick(opts.noses,`${seed}:nose`,noseFallback),mouthFamily:pick(opts.mouths,`${seed}:mouth`,mouthFallback),earId:pick(opts.ears,`${seed}:ears`,earFallback),
    hairId:hairStyleMap[legacy.hairStyle.toLowerCase()]??pick(opts.hair,`${seed}:hair`,hairFallback),
    skinPaletteId:skinMap[legacy.skinTone.toLowerCase()]??pick(opts.skinPalettes,`${seed}:skin`,skinFallback),
    hairPaletteId:hairMap[legacy.hairColor.toLowerCase()]??pick(opts.hairPalettes,`${seed}:hair-color`,hairColorFallback),
    irisPaletteId:irisMap[legacy.eyeColor.toLowerCase()]??pick(opts.irisPalettes,`${seed}:iris`,irisFallback),
    bodyId:pick(opts.bodies,`${seed}:body`,bodyFallback),clothingId:pick(opts.clothing,`${seed}:clothing`,clothingFallback),
    facialHairId:optionalPick(opts.facialHair,`${seed}:facial-hair`,facialHairChance),detailId:optionalPick(opts.details,`${seed}:detail`,20),
    eyewearId:optionalPick(opts.eyewear,`${seed}:eyewear`,12),accessoryId:optionalPick(opts.accessories,`${seed}:accessory`,24),expressionId:'neutral',
  };
}

export function normalizeCharacterVisualIdentity(input:CharacterVisualIdentity|undefined,seed:string,legacy:AppearanceProfile,sex:Sex='female',gender:GenderIdentity='woman'):CharacterVisualIdentity{
  const base=generatedVisual(seed,legacy,sex,gender);const opts=CHARACTER_VISUAL_OPTIONS;if(!input)return base;
  return {
    version:CHARACTER_VISUAL_VERSION,
    faceFamily:valid(input.faceFamily,opts.faces,base.faceFamily),eyeFamily:valid(input.eyeFamily,opts.eyes,base.eyeFamily),browFamily:valid(input.browFamily,opts.brows,base.browFamily),
    noseId:valid(input.noseId,opts.noses,base.noseId),mouthFamily:valid(input.mouthFamily,opts.mouths,base.mouthFamily),earId:valid(input.earId,opts.ears,base.earId),
    hairId:valid(input.hairId,opts.hair,base.hairId),skinPaletteId:valid(input.skinPaletteId,opts.skinPalettes,base.skinPaletteId),
    hairPaletteId:valid(input.hairPaletteId,opts.hairPalettes,base.hairPaletteId),irisPaletteId:valid(input.irisPaletteId,opts.irisPalettes,base.irisPaletteId),
    bodyId:valid(input.bodyId,opts.bodies,base.bodyId),clothingId:valid(input.clothingId,opts.clothing,base.clothingId),
    facialHairId:validOptional(input.facialHairId,opts.facialHair),detailId:validOptional(input.detailId,opts.details),eyewearId:validOptional(input.eyewearId,opts.eyewear),
    accessoryId:validOptional(input.accessoryId,opts.accessories),expressionId:valid(input.expressionId,opts.expressions,'neutral'),
  };
}

export function appearanceFromVisual(visual:CharacterVisualIdentity):AppearanceProfile{
  const skin=CHARACTER_ART_CATALOG.skinPalettes.find(item=>item.id===visual.skinPaletteId)?.label??characterVisualLabel(visual.skinPaletteId);
  const hairColor=CHARACTER_ART_CATALOG.hairPalettes.find(item=>item.id===visual.hairPaletteId)?.label??characterVisualLabel(visual.hairPaletteId);
  const eyeColor=CHARACTER_ART_CATALOG.irisPalettes.find(item=>item.id===visual.irisPaletteId)?.label??characterVisualLabel(visual.irisPaletteId);
  const extras=[visual.eyewearId,visual.accessoryId,visual.detailId].filter((value):value is string=>Boolean(value)).map(characterVisualLabel);
  return {skinTone:skin,hairColor,hairStyle:characterVisualLabel(visual.hairId),eyeColor,facialHair:visual.facialHairId?characterVisualLabel(visual.facialHairId):undefined,accessories:extras,visual};
}

export function normalizeAppearanceProfile(input:AppearanceProfile|undefined,seed:string,sex:Sex='female',gender:GenderIdentity='woman'):AppearanceProfile{
  const legacy=input??{skinTone:'medium',hairColor:'dark brown',hairStyle:'wavy',eyeColor:'brown',accessories:[]};
  return appearanceFromVisual(normalizeCharacterVisualIdentity(legacy.visual,seed,legacy,sex,gender));
}

export function normalizeCharacterAppearance(character:Character):boolean{
  const normalized=normalizeAppearanceProfile(character.appearance,`${character.id}:visual`,character.sex,character.genderIdentity);
  const before=JSON.stringify(character.appearance);const after=JSON.stringify(normalized);if(before===after)return false;character.appearance=normalized;return true;
}

export function createAppearanceDraft(seed:string,sex:Sex='female',gender:GenderIdentity='woman'):AppearanceProfile{
  const legacy:AppearanceProfile={skinTone:'medium',hairColor:'dark brown',hairStyle:'wavy',eyeColor:'brown',accessories:[]};
  return appearanceFromVisual(generatedVisual(seed,legacy,sex,gender));
}

export function randomizeAppearanceDraft(current:AppearanceProfile,seed:string,sex:Sex='female',gender:GenderIdentity='woman'):AppearanceProfile{
  return appearanceFromVisual(generatedVisual(seed,current,sex,gender));
}

export function describeAppearanceProfile(appearance:AppearanceProfile):string[]{
  const visual=appearance.visual;if(!visual)return[appearance.skinTone,appearance.hairColor,appearance.hairStyle,`${appearance.eyeColor} eyes`,appearance.facialHair,...appearance.accessories].filter((value):value is string=>Boolean(value));
  return [
    `${appearance.skinTone} skin`,`${characterVisualLabel(visual.faceFamily)} face`,`${characterVisualLabel(visual.eyeFamily)} ${appearance.eyeColor.toLowerCase()} eyes`,
    `${appearance.hairColor} ${appearance.hairStyle.toLowerCase()} hair`,`${characterVisualLabel(visual.bodyId)} frame`,appearance.facialHair,...appearance.accessories,
  ].filter((value):value is string=>Boolean(value));
}

export function paletteTokens(visual:CharacterVisualIdentity):Record<string,string>{
  const tokens={...CHARACTER_ART_CATALOG.defaultTokens};
  for(const entry of [CHARACTER_ART_CATALOG.skinPalettes.find(x=>x.id===visual.skinPaletteId),CHARACTER_ART_CATALOG.hairPalettes.find(x=>x.id===visual.hairPaletteId),CHARACTER_ART_CATALOG.irisPalettes.find(x=>x.id===visual.irisPaletteId)])if(entry)Object.assign(tokens,entry.colors);
  return tokens;
}

export function portraitAssetIds(visual:CharacterVisualIdentity,age:number):Array<{id:string;transform?:string;layer:number}>{
  const stage=characterAgeStage(age),profile=CHARACTER_ART_CATALOG.ageProfiles[stage]??{};const kind=bodyKind(visual.bodyId);const expression=visual.expressionId||'neutral';
  const candidates:Array<{id:string;transform?:string}>=[
    {id:`${visual.hairId}.back`},{id:visual.bodyId,transform:profile.torso},{id:`${visual.clothingId}.${kind}`,transform:profile.torso},{id:visual.earId},
    {id:`${visual.faceFamily}.${stage}`},{id:visual.detailId??''},{id:`${visual.eyeFamily}.${expression}`,transform:profile.eye},{id:`${visual.browFamily}.${expression}`,transform:profile.brow},
    {id:visual.noseId,transform:profile.nose},{id:`${visual.mouthFamily}.${expression}`,transform:profile.mouth},{id:visual.facialHairId??''},
    {id:`${visual.hairId}.front`},{id:visual.eyewearId??'',transform:profile.eye},{id:visual.accessoryId??''},{id:`expression-overlay.${expression}`},
  ];
  return candidates.filter(item=>Boolean(item.id)&&Boolean(CHARACTER_ART_CATALOG.assets[item.id])).map(item=>({...item,layer:CHARACTER_ART_CATALOG.assets[item.id]!.layer})).sort((a,b)=>a.layer-b.layer);
}
