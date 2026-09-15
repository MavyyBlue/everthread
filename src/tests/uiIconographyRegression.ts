import { EVERTHREAD_ICON_PATHS, TOWN_PLACE_ICON_BY_ID, townPlaceIconName, type EverthreadIconName } from '../core/everthreadIcons';
import { PRIMARY_NAVIGATION, CONTEXTUAL_NAVIGATION } from '../core/navigation';
import { visualSettingsSignature } from '../core/visualIdentity';
import { ACTION_VFX_ICON_NAMES } from '../core/actionVfx';
import { TOWN_PLACES } from '../data/townPlaces';
import { createNewGame } from '../systems/CharacterSystem';

export function runUiIconographyRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`UI iconography regression failed: ${message}`);}

  const iconNames=Object.keys(EVERTHREAD_ICON_PATHS) as EverthreadIconName[];
  verify(iconNames.length===58,'Astra geometry library should expose the vetted 25 map + 33 UI glyph vocabulary');
  for(const name of iconNames){
    const markup=EVERTHREAD_ICON_PATHS[name];
    verify(typeof markup==='string'&&markup.length>0,`${name} should have packaged vector geometry`);
    verify(!/<script|on\w+=|https?:|javascript:/i.test(markup),`${name} geometry should remain local static vector markup`);
  }

  verify(TOWN_PLACES.length===25,'current certified town should still contain 25 canonical places');
  verify(Object.keys(TOWN_PLACE_ICON_BY_ID).length===TOWN_PLACES.length,'every canonical town place should have exactly one presentation icon mapping');
  for(const place of TOWN_PLACES){
    const icon=townPlaceIconName(place.id);
    verify(Boolean(icon),`${place.id} should have a mapped pictogram`);
    verify(iconNames.includes(icon!),`${place.id} pictogram should exist in the packaged geometry library`);
  }
  verify(townPlaceIconName('blackline-freight-yard')==='freight','hidden Blackline should use its freight glyph without changing discovery ownership');
  verify(townPlaceIconName('not-a-place')===undefined,'unknown place IDs should not invent a pictogram');

  const primary=Object.fromEntries(PRIMARY_NAVIGATION.map(item=>[item.id,item.icon]));
  verify(primary.life==='leaf'&&primary.people==='people'&&primary.map==='map','primary Life / People / Map navigation should use the new coherent icon family');
  const contextual=Object.fromEntries(CONTEXTUAL_NAVIGATION.map(item=>[item.id,item.icon]));
  verify(contextual.activities==='plus'&&contextual.career==='flag'&&contextual.assets==='inventory','contextual fourth-tab navigation should stay recognizable without changing routing');

  const semanticNames=Object.values(ACTION_VFX_ICON_NAMES).filter(Boolean) as EverthreadIconName[];
  verify(semanticNames.length===12,'all twelve Astra semantic result meanings should be registered with the existing VFX presentation layer');
  verify(semanticNames.every(name=>iconNames.includes(name)),'every semantic result icon should resolve to vetted packaged geometry');

  const state=createNewGame({seed:'ui-iconography-theme-reactivity'});
  const settings=state.settings;
  const sameObject=settings;
  const initial=visualSettingsSignature(settings);
  settings.theme=settings.theme==='dark'?'light':'dark';
  const afterTheme=visualSettingsSignature(settings);
  verify(settings===sameObject,'test should exercise the production in-place settings mutation model');
  verify(afterTheme!==initial,'theme changes must alter the root visual settings signature even when object identity is stable');
  settings.accent='#7f5cff';
  const afterAccent=visualSettingsSignature(settings);
  verify(afterAccent!==afterTheme,'accent changes must invalidate root visual presentation');
  settings.fontFamily='serif';
  const afterFont=visualSettingsSignature(settings);
  verify(afterFont!==afterAccent,'font changes must invalidate root visual presentation');
  settings.textColor='#f0ece4';
  const afterText=visualSettingsSignature(settings);
  verify(afterText!==afterFont,'custom text color changes must invalidate root visual presentation');
  settings.textScale=(settings.textScale??1)+.1;
  const afterScale=visualSettingsSignature(settings);
  verify(afterScale!==afterText,'text-scale changes must invalidate root visual presentation');
  settings.highContrast=!settings.highContrast;
  const afterContrast=visualSettingsSignature(settings);
  verify(afterContrast!==afterScale,'high-contrast changes must invalidate root visual presentation');
  settings.reducedMotion=!settings.reducedMotion;
  verify(visualSettingsSignature(settings)!==afterContrast,'reduced-motion changes must invalidate root visual presentation');

  return checks;
}
