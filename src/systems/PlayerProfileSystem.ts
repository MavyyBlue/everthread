import type { GameState } from '../types/game';
import { personalItemById } from '../data/personalItems';
import { TOWN_PLACES } from '../data/townPlaces';
import { locationLabel } from '../data/countries';
import { playerCareerLabel } from './CareerIdentitySystem';
import { relationshipTypeLabel } from '../core/familyRelations';
import { describeAppearanceProfile } from './CharacterVisualSystem';

const placeById=Object.fromEntries(TOWN_PLACES.map(place=>[place.id,place])) as Record<string,(typeof TOWN_PLACES)[number]>;
const ROMANTIC_TYPES=new Set<GameState['relationships'][number]['type']>(['partner','fiance','spouse']);

export interface PlayerProfileProjection {
  fullName:string;
  generation:number;
  age:number;
  location:string;
  career:string;
  education:string;
  relationship:string;
  traits:string[];
  appearance:string[];
  licenses:string[];
  completedAchievements:number;
  assetSummary:{homes:number;vehicles:number;businesses:number;collectibles:number};
  personalItems:Array<{id:string;itemId:string;name:string;description:string;category:string;sourcePlaceId:string;sourcePlaceLabel:string;purchasePrice:number;acquiredAge:number;acquiredYear:number}>;
  valuableCollectibles:Array<{id:string;name:string;estimatedValue:number;rarity:string;condition:number}>;
}

export function projectPlayerProfile(state:GameState):PlayerProfileProjection{
  const character=state.character;
  const latestEducation=state.education.at(-1);
  const romantic=state.relationships.find(rel=>ROMANTIC_TYPES.has(rel.type)&&!rel.estranged&&state.npcs[rel.npcId]?.alive);
  const romanticNpc=romantic?state.npcs[romantic.npcId]:undefined;
  const relationship=romantic&&romanticNpc?`${relationshipTypeLabel(romantic.type)} · ${romanticNpc.firstName} ${romanticNpc.lastName}`:'Not currently partnered';
  const licenses=[state.travel.licenses.driving?'Driving':undefined,state.travel.licenses.boating?'Boating':undefined,state.travel.licenses.pilot?'Pilot':undefined].filter((value):value is string=>Boolean(value));
  const personalItems=(state.personalInventory?.items??[]).flatMap(item=>{
    const def=personalItemById[item.itemId];if(!def)return[];
    return[{id:item.id,itemId:item.itemId,name:def.name,description:def.description,category:def.category,sourcePlaceId:item.sourcePlaceId,sourcePlaceLabel:placeById[item.sourcePlaceId]?.shortLabel??'Everthread',purchasePrice:item.purchasePrice,acquiredAge:item.acquiredAge,acquiredYear:item.acquiredYear}];
  });
  return{
    fullName:`${character.firstName}${character.middleName?` ${character.middleName}`:''} ${character.lastName}`,
    generation:state.legacy.generation,
    age:character.age,
    location:locationLabel(character.countryId,character.city),
    career:playerCareerLabel(state),
    education:latestEducation?`${latestEducation.institution}${latestEducation.graduated?' · graduated':latestEducation.droppedOut?' · left early':' · current'}`:'No formal education record yet',
    relationship,
    traits:[...character.traits],
    appearance:describeAppearanceProfile(character.appearance),
    licenses,
    completedAchievements:state.achievements.filter(item=>item.completed).length,
    assetSummary:{homes:state.assets.properties.length,vehicles:state.assets.vehicles.length,businesses:state.businesses.filter(item=>!item.bankrupt).length,collectibles:state.assets.collectibles.length},
    personalItems,
    valuableCollectibles:state.assets.collectibles.map(item=>({id:item.id,name:item.name,estimatedValue:item.estimatedValue,rarity:item.rarity,condition:item.condition})),
  };
}
