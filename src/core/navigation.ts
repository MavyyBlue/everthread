export const PRIMARY_NAVIGATION=[
  {id:'life',label:'Life',icon:'◉'},
  {id:'people',label:'People',icon:'♡'},
  {id:'map',label:'Map',icon:'⌖'},
] as const;

export const CONTEXTUAL_NAVIGATION=[
  {id:'activities',label:'Activities',icon:'＋'},
  {id:'career',label:'Career',icon:'▣'},
  {id:'assets',label:'Assets',icon:'◆'},
] as const;

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
