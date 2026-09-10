import type { Character, GenderIdentity } from '../types/game';
import { playerCrestForGender } from '../core/visualIdentity';

export function GenderCrest({gender,size=48,label='Player identity crest'}:{gender:GenderIdentity;size?:number;label?:string}){
  return <div className="avatar avatar--crest" style={{width:size,height:size}} aria-label={label} role="img">
    <img src={playerCrestForGender(gender)} alt="" aria-hidden="true" draggable={false}/>
  </div>;
}

export function Avatar({character,size=48}:{character:Character;size?:number}){
  return <GenderCrest gender={character.genderIdentity} size={size} label={`${character.firstName}'s Everthread identity crest`}/>;
}
