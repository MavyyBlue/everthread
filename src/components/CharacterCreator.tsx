import { useMemo, useState, type ReactNode } from 'react';
import type { AppearanceProfile, CharacterVisualIdentity, GenderIdentity, Sex } from '../types/game';
import { CHARACTER_ART_CATALOG, CHARACTER_VISUAL_OPTIONS, appearanceFromVisual, characterVisualLabel, randomizeAppearanceDraft } from '../systems/CharacterVisualSystem';
import { CharacterPortrait } from './CharacterPortrait';
import { EverthreadIcon } from './EverthreadIcon';

type CreatorTab='face'|'hair'|'style'|'extras';
type VisualKey=keyof CharacterVisualIdentity;
type CreatorSectionId='skin'|'face-shape'|'eye-shape'|'eye-color'|'brows'|'nose'|'mouth'|'ears'|'hairstyle'|'hair-color'|'facial-hair'|'frame'|'clothing'|'glasses'|'details'|'accessories';


function CollapsibleSection({id,title,summary,collapsed,onToggle,children}:{id:CreatorSectionId;title:string;summary:string;collapsed:boolean;onToggle:(id:CreatorSectionId)=>void;children:ReactNode}){
  const contentId=`character-creator-section-${id}`;
  return <section className={`character-creator-section${collapsed?' collapsed':''}`}>
    <button type="button" className="character-creator-section-toggle" aria-expanded={!collapsed} aria-controls={contentId} onClick={()=>onToggle(id)}>
      <span><strong>{title}</strong><small>{summary}</small></span>
      <EverthreadIcon name="chevron" size={18} className="character-creator-section-chevron"/>
    </button>
    <div id={contentId} className="character-creator-section-content" hidden={collapsed}>{children}</div>
  </section>;
}

function OptionGrid({values,value,onChange,none=false}:{values:readonly string[];value:string|undefined;onChange:(value:string|undefined)=>void;none?:boolean}){
  return <div className="character-option-grid">{none&&<button type="button" className={!value?'active':''} aria-pressed={!value} onClick={()=>onChange(undefined)}>None</button>}{values.map(id=><button type="button" key={id} className={value===id?'active':''} aria-pressed={value===id} onClick={()=>onChange(id)}>{characterVisualLabel(id)}</button>)}</div>;
}

function PaletteGrid({kind,values,value,onChange}:{kind:'skin'|'hair'|'iris';values:readonly string[];value:string;onChange:(value:string)=>void}){
  const source=kind==='skin'?CHARACTER_ART_CATALOG.skinPalettes:kind==='hair'?CHARACTER_ART_CATALOG.hairPalettes:CHARACTER_ART_CATALOG.irisPalettes;
  return <div className="character-palette-grid">{values.map(id=>{const entry=source.find(item=>item.id===id);const color=entry?.colors[kind==='skin'?'skin.base':kind==='hair'?'hair.base':'eye.iris']??'#888';return <button type="button" key={id} className={value===id?'active':''} aria-pressed={value===id} onClick={()=>onChange(id)}><span style={{background:color}} aria-hidden="true"/><small>{entry?.label??characterVisualLabel(id)}</small></button>;})}</div>;
}

export function CharacterCreator({initialAppearance,sex,gender,onBack,onSave}:{initialAppearance:AppearanceProfile;sex:Sex;gender:GenderIdentity;onBack:()=>void;onSave:(appearance:AppearanceProfile)=>void}){
  const[tab,setTab]=useState<CreatorTab>('face');
  const[working,setWorking]=useState<AppearanceProfile>(()=>structuredClone(initialAppearance));
  const[collapsedSections,setCollapsedSections]=useState<Partial<Record<CreatorSectionId,boolean>>>({});
  const visual=working.visual!;
  const update=(key:VisualKey,value:string|number|undefined)=>setWorking(current=>{
    const next={...current.visual,[key]:value} as CharacterVisualIdentity;
    return appearanceFromVisual(next);
  });
  const randomSeed=useMemo(()=>`${Date.now()}-${Math.random()}-${sex}-${gender}`,[sex,gender]);
  const randomize=()=>setWorking(current=>randomizeAppearanceDraft(current,`${randomSeed}:${Date.now()}:${Math.random()}`,sex,gender));
  const toggleSection=(id:CreatorSectionId)=>setCollapsedSections(current=>({...current,[id]:!current[id]}));
  const selected=(value:string|undefined)=>value?characterVisualLabel(value):'None';
  const paletteSelected=(kind:'skin'|'hair'|'iris',id:string)=>{const source=kind==='skin'?CHARACTER_ART_CATALOG.skinPalettes:kind==='hair'?CHARACTER_ART_CATALOG.hairPalettes:CHARACTER_ART_CATALOG.irisPalettes;return source.find(item=>item.id===id)?.label??characterVisualLabel(id);};
  return <div className="character-creator" aria-label="Everthread character creator">
    <div className="character-creator-topbar"><button type="button" className="secondary-button" onClick={onBack}><EverthreadIcon name="back" size={18}/> Back</button><div><p className="eyebrow">Your appearance</p><h3>Character Creator</h3></div><button type="button" className="secondary-button" onClick={randomize}><EverthreadIcon name="spark" size={18}/> Randomize</button></div>
    <section className="character-creator-preview"><CharacterPortrait appearance={working} age={18} size={230} frame="creator" label="Character creator preview"/><small>Preview uses the adult portrait stage. Your character will naturally use age-appropriate proportions in life.</small></section>
    <nav className="character-creator-tabs" aria-label="Character customization categories">{(['face','hair','style','extras'] as CreatorTab[]).map(value=><button type="button" key={value} className={tab===value?'active':''} aria-pressed={tab===value} onClick={()=>setTab(value)}>{value}</button>)}</nav>
    <div className="character-creator-controls">
      {tab==='face'&&<>
        <CollapsibleSection id="skin" title="Skin tone" summary={paletteSelected('skin',visual.skinPaletteId)} collapsed={!!collapsedSections.skin} onToggle={toggleSection}><PaletteGrid kind="skin" values={CHARACTER_VISUAL_OPTIONS.skinPalettes} value={visual.skinPaletteId} onChange={value=>update('skinPaletteId',value)}/></CollapsibleSection>
        <CollapsibleSection id="face-shape" title="Face shape" summary={selected(visual.faceFamily)} collapsed={!!collapsedSections['face-shape']} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.faces} value={visual.faceFamily} onChange={value=>value&&update('faceFamily',value)}/></CollapsibleSection>
        <CollapsibleSection id="eye-shape" title="Eye shape" summary={selected(visual.eyeFamily)} collapsed={!!collapsedSections['eye-shape']} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.eyes} value={visual.eyeFamily} onChange={value=>value&&update('eyeFamily',value)}/></CollapsibleSection>
        <CollapsibleSection id="eye-color" title="Eye color" summary={paletteSelected('iris',visual.irisPaletteId)} collapsed={!!collapsedSections['eye-color']} onToggle={toggleSection}><PaletteGrid kind="iris" values={CHARACTER_VISUAL_OPTIONS.irisPalettes} value={visual.irisPaletteId} onChange={value=>update('irisPaletteId',value)}/></CollapsibleSection>
        <CollapsibleSection id="brows" title="Brows" summary={selected(visual.browFamily)} collapsed={!!collapsedSections.brows} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.brows} value={visual.browFamily} onChange={value=>value&&update('browFamily',value)}/></CollapsibleSection>
        <CollapsibleSection id="nose" title="Nose" summary={selected(visual.noseId)} collapsed={!!collapsedSections.nose} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.noses} value={visual.noseId} onChange={value=>value&&update('noseId',value)}/></CollapsibleSection>
        <CollapsibleSection id="mouth" title="Mouth" summary={selected(visual.mouthFamily)} collapsed={!!collapsedSections.mouth} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.mouths} value={visual.mouthFamily} onChange={value=>value&&update('mouthFamily',value)}/></CollapsibleSection>
        <CollapsibleSection id="ears" title="Ears" summary={selected(visual.earId)} collapsed={!!collapsedSections.ears} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.ears} value={visual.earId} onChange={value=>value&&update('earId',value)}/></CollapsibleSection>
      </>}
      {tab==='hair'&&<>
        <CollapsibleSection id="hairstyle" title="Hairstyle" summary={selected(visual.hairId)} collapsed={!!collapsedSections.hairstyle} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.hair} value={visual.hairId} onChange={value=>value&&update('hairId',value)}/></CollapsibleSection>
        <CollapsibleSection id="hair-color" title="Hair color" summary={paletteSelected('hair',visual.hairPaletteId)} collapsed={!!collapsedSections['hair-color']} onToggle={toggleSection}><PaletteGrid kind="hair" values={CHARACTER_VISUAL_OPTIONS.hairPalettes} value={visual.hairPaletteId} onChange={value=>update('hairPaletteId',value)}/></CollapsibleSection>
        <CollapsibleSection id="facial-hair" title="Facial hair" summary={selected(visual.facialHairId)} collapsed={!!collapsedSections['facial-hair']} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.facialHair} value={visual.facialHairId} none onChange={value=>update('facialHairId',value)}/></CollapsibleSection>
      </>}
      {tab==='style'&&<>
        <CollapsibleSection id="frame" title="Frame" summary={selected(visual.bodyId)} collapsed={!!collapsedSections.frame} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.bodies} value={visual.bodyId} onChange={value=>value&&update('bodyId',value)}/></CollapsibleSection>
        <CollapsibleSection id="clothing" title="Clothing" summary={selected(visual.clothingId)} collapsed={!!collapsedSections.clothing} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.clothing} value={visual.clothingId} onChange={value=>value&&update('clothingId',value)}/></CollapsibleSection>
      </>}
      {tab==='extras'&&<>
        <CollapsibleSection id="glasses" title="Glasses" summary={selected(visual.eyewearId)} collapsed={!!collapsedSections.glasses} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.eyewear} value={visual.eyewearId} none onChange={value=>update('eyewearId',value)}/></CollapsibleSection>
        <CollapsibleSection id="details" title="Facial details" summary={selected(visual.detailId)} collapsed={!!collapsedSections.details} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.details} value={visual.detailId} none onChange={value=>update('detailId',value)}/></CollapsibleSection>
        <CollapsibleSection id="accessories" title="Accessories" summary={selected(visual.accessoryId)} collapsed={!!collapsedSections.accessories} onToggle={toggleSection}><OptionGrid values={CHARACTER_VISUAL_OPTIONS.accessories} value={visual.accessoryId} none onChange={value=>update('accessoryId',value)}/></CollapsibleSection>
      </>}
    </div>
    <div className="character-creator-save"><button type="button" className="full-button" onClick={()=>onSave(working)}>Save appearance</button><small>Saving returns to New Life. You can tap your portrait again before beginning.</small></div>
  </div>;
}
