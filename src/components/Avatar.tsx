import type { Character, GenderIdentity } from '../types/game';
import { playerCrestForGender } from '../core/visualIdentity';
import { CharacterPortrait } from './CharacterPortrait';

export function GenderCrest({gender,size=48,label='Player identity crest'}:{gender:GenderIdentity;size?:number;label?:string}){
  return <div className="avatar avatar--crest" style={{width:size,height:size}} aria-label={label} role="img">
    <img src={playerCrestForGender(gender)} alt="" aria-hidden="true" draggable={false}/>
  </div>;
}

export function Avatar({character,size=48}:{character:Character;size?:number}){
  return <div className="avatar avatar--portrait" style={{width:size,height:size}}>
    <CharacterPortrait appearance={character.appearance} age={character.age} size={size} label={`${character.firstName}'s portrait`} fallback={<img src={playerCrestForGender(character.genderIdentity)} alt="" aria-hidden="true" draggable={false}/>}/>
  </div>;
}
