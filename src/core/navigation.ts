export const PRIMARY_NAVIGATION=[
  {id:'life',label:'Life',icon:'◉'},
  {id:'people',label:'People',icon:'♡'},
  {id:'map',label:'Map',icon:'⌖'},
  {id:'activities',label:'Activities',icon:'＋'},
  {id:'career',label:'Career',icon:'▣'},
  {id:'assets',label:'Assets',icon:'◆'},
] as const;

export type PrimaryNavigationTab=typeof PRIMARY_NAVIGATION[number]['id'];

export const ASSET_SECTION_NAVIGATION=[
  {id:'money',label:'Money'},
  {id:'property',label:'Property'},
  {id:'invest',label:'Invest'},
  {id:'business',label:'Business'},
  {id:'estate',label:'Estate'},
  {id:'more',label:'More'},
] as const;

export type AssetSectionTab=typeof ASSET_SECTION_NAVIGATION[number]['id'];
