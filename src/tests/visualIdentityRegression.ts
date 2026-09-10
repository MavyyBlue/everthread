import { buildSaveExportFilename } from '../core/exportFilename';
import { normalizeEverthreadFont, playerCrestForGender } from '../core/visualIdentity';
import { createNewGame } from '../systems/CharacterSystem';

export function runVisualIdentityRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Visual identity regression failed: ${message}`);}

  verify(playerCrestForGender('woman')==='./icons/player-female.png','woman identity resolves to the supplied female player crest');
  verify(playerCrestForGender('man')==='./icons/player-male.png','man identity resolves to the supplied male player crest');
  verify(playerCrestForGender('nonbinary')==='./icons/player-neutral.png','nonbinary identity resolves to the supplied neutral player crest');
  verify(playerCrestForGender('other')==='./icons/player-neutral.png','other identity resolves to the supplied neutral player crest');
  verify(playerCrestForGender(undefined)==='./icons/player-neutral.png','missing legacy identity falls back safely to the neutral crest');
  verify(normalizeEverthreadFont('serif')==='serif'&&normalizeEverthreadFont('not-a-font')==='sans','font preference normalization is bounded to supported offline families');

  const state=createNewGame({seed:'visual-identity-export-fixture',firstName:'Aria',lastName:'Vale'});
  verify(state.settings.accent==='#16b8b0','fresh installs begin with the Everthread teal jewel accent');
  verify(state.settings.fontFamily==='sans'&&state.settings.textColor===null,'fresh installs initialize presentation-only font and automatic text-color preferences');
  state.character.age=27;state.legacy.generation=4;
  const before=JSON.stringify({character:state.character,legacy:state.legacy});
  const first=buildSaveExportFilename(state,new Date('2032-05-06T07:08:09Z'));
  const second=buildSaveExportFilename(state,new Date('2032-05-06T07:08:10Z'));
  verify(first==='everthread-aria-vale-g4-age-27-20320506-070809.json','save export filename includes identity, generation, age, and a UTC timestamp');
  verify(first!==second,'repeated exports one second apart receive distinct filenames');
  verify(JSON.stringify({character:state.character,legacy:state.legacy})===before,'filename generation does not mutate deterministic game state');

  state.character.firstName=' Élodie ';
  state.character.lastName="O'River / Test";
  const sanitized=buildSaveExportFilename(state,new Date('2032-05-06T07:08:09Z'));
  verify(sanitized.startsWith('everthread-elodie-o-river-test-g4-age-27-'),'save filenames sanitize punctuation and diacritics for mobile downloads');

  return checks;
}
