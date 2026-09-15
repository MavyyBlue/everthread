import type { EverthreadIconName } from './everthreadIcons';

type NavigationItem={id:string;label:string;icon:EverthreadIconName};

export const PRIMARY_NAVIGATION=[
  {id:'life',label:'Life',icon:'leaf'},
  {id:'people',label:'People',icon:'people'},
  {id:'map',label:'Map',icon:'map'},
] as const satisfies readonly NavigationItem[];

export const CONTEXTUAL_NAVIGATION=[
  {id:'activities',label:'Activities',icon:'plus'},
  {id:'career',label:'Career',icon:'flag'},
  {id:'assets',label:'Assets',icon:'inventory'},
] as const satisfies readonly NavigationItem[];

export type PrimaryNavigationTab=(typeof PRIMARY_NAVIGATION)[number]['id']|(typeof CONTEXTUAL_NAVIGATION)[number]['id'];

export function primaryNavigationItems(tab:PrimaryNavigationTab,hasMapRoute:boolean){
  const contextual=hasMapRoute?CONTEXTUAL_NAVIGATION.find(item=>item.id===tab):undefined;
  return contextual?[...PRIMARY_NAVIGATION,contextual]:[...PRIMARY_NAVIGATION];
}

export const ASSET_SECTION_NAVIGATION=[
  {id:'money',label:'Money'},
  {id:'property',label:'Property'},
  {id:'invest',label:'Invest'},
  {id:'business',label:'Business'},
  {id:'estate',label:'Estate'},
  {id:'more',label:'More'},
] as const;

export type AssetSectionTab=typeof ASSET_SECTION_NAVIGATION[number]['id'];
