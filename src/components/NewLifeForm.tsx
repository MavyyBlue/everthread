import { useState } from 'react';
import { gameEngine } from '../stores/gameStore';
import { allocateSaveSlotId, saveGame, setActiveSaveSlotId } from '../services/SaveSystem';
import { CharacterPortrait, CharacterSilhouette } from './CharacterPortrait';
import { CharacterCreator } from './CharacterCreator';
import { createAppearanceDraft } from '../systems/CharacterVisualSystem';
import type { CharacterCreationOptions } from '../systems/CharacterSystem';
import type { AppearanceProfile, GenderIdentity, Orientation, Sex } from '../types/game';

type SliderDefinition = { label: string; value: number; setValue: (value: number) => void };

export function NewLifeForm({onCreated}:{onCreated:()=>void}){
  const[firstName,setFirst]=useState('');const[lastName,setLast]=useState('');const[sex,setSex]=useState<Sex>('female');const[gender,setGender]=useState<GenderIdentity>('woman');const[orientation,setOrientation]=useState<Orientation>('straight');
  const[sandbox,setSandbox]=useState(false);const[advanced,setAdvanced]=useState(false);const[intelligence,setIntelligence]=useState(60);const[appearance,setAppearance]=useState(60);const[health,setHealth]=useState(80);const[creating,setCreating]=useState(false);
  const[creatorOpen,setCreatorOpen]=useState(false);const[savedAppearance,setSavedAppearance]=useState<AppearanceProfile|undefined>();
  const[appearanceSeed]=useState(()=>`new-life-appearance-${Date.now()}-${Math.random()}`);
  const create=async(options:CharacterCreationOptions)=>{if(creating)return;setCreating(true);try{await gameEngine.flushSaves();await saveGame(gameEngine.getState());const slotId=await allocateSaveSlotId();setActiveSaveSlotId(slotId);gameEngine.newLife({...options,slotId});onCreated();}finally{setCreating(false);}};
  const createCustom=()=>void create({firstName:firstName||undefined,lastName:lastName||undefined,sex,genderIdentity:gender,orientation,appearance:savedAppearance,sandbox,rewindEnabled:sandbox,advanced:advanced?{intelligence,appearance,health}:undefined});
  const initialCreatorAppearance=savedAppearance??createAppearanceDraft(appearanceSeed,sex,gender);

  if(creatorOpen)return <CharacterCreator initialAppearance={initialCreatorAppearance} sex={sex} gender={gender} onBack={()=>setCreatorOpen(false)} onSave={value=>{setSavedAppearance(value);setCreatorOpen(false);}}/>;

  return <div className="form-stack">
    <section className="creation-identity-preview">
      <button type="button" className="creation-portrait-button" onClick={()=>setCreatorOpen(true)} aria-label={savedAppearance?'Edit character appearance':'Customize character appearance'}>
        {savedAppearance?<CharacterPortrait appearance={savedAppearance} age={18} size={108} frame="new-life" label="Your customized character preview"/>:<CharacterSilhouette age={18} size={108} frame="new-life" label="Uncustomized character silhouette"/>}
        <span>{savedAppearance?'Edit look':'Customize'}</span>
      </button>
      <div><p className="eyebrow">Your thread</p><h3>{firstName.trim()||'New life'} {lastName.trim()}</h3><small>Tap the portrait to shape how your character looks. The same physical appearance will follow your profile and portrait in life.</small></div>
    </section>
    <div className="two-col"><label className="form-field"><span>First name</span><input value={firstName} onChange={e=>setFirst(e.target.value)} placeholder="Random if blank"/></label><label className="form-field"><span>Last name</span><input value={lastName} onChange={e=>setLast(e.target.value)} placeholder="Random if blank"/></label></div>
    <div className="info-card"><strong>Home · Everthread</strong><small>Every new life begins in Everthread. Procedural naming keeps cultural variety without making a real-world country your hidden home.</small></div>
    <div className="two-col"><label className="form-field"><span>Sex</span><select value={sex} onChange={e=>setSex(e.target.value as Sex)}><option>female</option><option>male</option><option>intersex</option></select></label><label className="form-field"><span>Gender</span><select value={gender} onChange={e=>setGender(e.target.value as GenderIdentity)}><option value="woman">woman</option><option value="man">man</option><option value="nonbinary">nonbinary</option><option value="other">other</option></select></label></div>
    <label className="form-field"><span>Orientation</span><select value={orientation} onChange={e=>setOrientation(e.target.value as Orientation)}>{['straight','gay','lesbian','bisexual','pansexual','asexual'].map(o=><option key={o}>{o}</option>)}</select></label>
    <label className="toggle-row"><span><strong>Advanced creation</strong><small>Influence normally hidden starting stats.</small></span><input type="checkbox" checked={advanced} onChange={e=>setAdvanced(e.target.checked)}/></label>
    {advanced&&<div className="slider-stack">{([{label:'Intelligence',value:intelligence,setValue:setIntelligence},{label:'Appearance',value:appearance,setValue:setAppearance},{label:'Health',value:health,setValue:setHealth}] satisfies SliderDefinition[]).map(({label,value,setValue})=><label key={label}><span>{label}: {value}</span><input type="range" min="10" max="100" value={value} onChange={e=>setValue(Number(e.target.value))}/></label>)}</div>}
    <label className="toggle-row"><span><strong>Sandbox mode</strong><small>Enables rewind and future cheat/customization controls.</small></span><input type="checkbox" checked={sandbox} onChange={e=>setSandbox(e.target.checked)}/></label>
    <div className="button-row"><button className="full-button" disabled={creating} onClick={createCustom}>{creating?'Creating…':'Create life'}</button><button className="secondary-button" disabled={creating} onClick={()=>void create({})}>Fully random</button></div>
    <p className="muted">Creating a new life adds a separate save slot. Your current life remains available in Life Saves.</p>
  </div>;
}
