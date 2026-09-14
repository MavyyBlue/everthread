export type TownPlaceCategory='finance'|'commerce'|'residential'|'education'|'health'|'recreation'|'career'|'civic'|'justice'|'travel'|'underworld';
export type TownPlaceVisibility='public'|'underworld_discovery';
export type TownRouteTab='life'|'people'|'activities'|'career'|'assets';

export interface TownPlaceRoute {
  tab:TownRouteTab;
  section?:string;
  legacyLabel:string;
}

export interface TownPlaceDefinition {
  id:string;
  label:string;
  shortLabel:string;
  category:TownPlaceCategory;
  districtId:string;
  description:string;
  activityTags:readonly string[];
  route?:TownPlaceRoute;
  visibility:TownPlaceVisibility;
  importance:1|2|3;
  map:{x:number;y:number;glyph:string;labelMinScale:number};
}

export interface TownDistrictDefinition {
  id:string;
  label:string;
  description:string;
  map:{x:number;y:number;width:number;height:number};
}

export const TOWN_MAP_WIDTH=1440;
export const TOWN_MAP_HEIGHT=1100;

export const TOWN_DISTRICTS:readonly TownDistrictDefinition[]=[
  {id:'threadwell',label:'Threadwell',description:'Homes, quiet streets, and neighborhood life.',map:{x:70,y:70,width:420,height:280}},
  {id:'campus-green',label:'Campus Green',description:'Schools, college grounds, recreation, and open space.',map:{x:525,y:65,width:430,height:300}},
  {id:'central-weave',label:'Central Weave',description:'Everthread’s civic and financial center.',map:{x:500,y:390,width:470,height:310}},
  {id:'market-row',label:'Market Row',description:'Everyday shopping, food, vehicles, and housing services.',map:{x:65,y:390,width:405,height:360}},
  {id:'eastworks',label:'Eastworks',description:'Studios, agencies, companies, and major venues.',map:{x:1000,y:120,width:365,height:600}},
  {id:'south-belt',label:'South Belt',description:'Large-footprint facilities, transport, and regional infrastructure.',map:{x:80,y:790,width:1280,height:245}},
];

export const TOWN_PLACES:readonly TownPlaceDefinition[]=[
  {id:'central-everthread-bank',label:'Central Everthread Bank',shortLabel:'Central Bank',category:'finance',districtId:'central-weave',description:'Everthread’s primary retail bank and financial-services landmark.',activityTags:['banking','credit','investing'],route:{tab:'assets',section:'money',legacyLabel:'Assets · Money'},visibility:'public',importance:3,map:{x:635,y:475,glyph:'B',labelMinScale:.48}},
  {id:'loomline-motors',label:'Loomline Motors',shortLabel:'Car Dealership',category:'commerce',districtId:'market-row',description:'A city dealership district for personal vehicles and financing.',activityTags:['vehicles','financing'],route:{tab:'assets',section:'property',legacyLabel:'Assets · Property'},visibility:'public',importance:2,map:{x:155,y:675,glyph:'CAR',labelMinScale:.68}},
  {id:'hearthline-realty',label:'Hearthline Realty & Leasing',shortLabel:'Realty / Leasing',category:'commerce',districtId:'market-row',description:'Local property sales, rentals, and leasing services.',activityTags:['property','rentals','mortgages'],route:{tab:'assets',section:'property',legacyLabel:'Assets · Property'},visibility:'public',importance:2,map:{x:340,y:675,glyph:'R',labelMinScale:.64}},
  {id:'threadwell-residential',label:'Threadwell Residential District',shortLabel:'Residential District',category:'residential',districtId:'threadwell',description:'A broad neighborhood district representing ordinary Everthread homes.',activityTags:['home','households','family'],visibility:'public',importance:3,map:{x:270,y:205,glyph:'HOME',labelMinScale:.5}},
  {id:'crossroads-mall',label:'Crossroads Mall',shortLabel:'Mall',category:'commerce',districtId:'market-row',description:'A large indoor shopping and leisure center near the center of town.',activityTags:['shopping','social','leisure'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:3,map:{x:250,y:500,glyph:'M',labelMinScale:.48}},
  {id:'nightjar-diner',label:'Nightjar Diner',shortLabel:'Diner',category:'commerce',districtId:'market-row',description:'A familiar all-day diner and casual meeting spot.',activityTags:['food','social','dates'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:1,map:{x:385,y:565,glyph:'D',labelMinScale:.84}},
  {id:'weaver-park',label:'Weaver Park',shortLabel:'Park',category:'recreation',districtId:'campus-green',description:'A central public park with paths, lawns, and community gathering space.',activityTags:['outdoors','wellness','social'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:3,map:{x:745,y:285,glyph:'P',labelMinScale:.46}},
  {id:'everthread-market',label:'Everthread Market',shortLabel:'Grocery Store',category:'commerce',districtId:'market-row',description:'A neighborhood grocery store serving everyday household needs.',activityTags:['groceries','household'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:1,map:{x:130,y:520,glyph:'G',labelMinScale:.82}},
  {id:'everthread-school',label:'Everthread Community School',shortLabel:'School',category:'education',districtId:'campus-green',description:'The town’s main compulsory-school campus.',activityTags:['school','education','youth'],route:{tab:'career',section:'education',legacyLabel:'Career · Education'},visibility:'public',importance:3,map:{x:615,y:165,glyph:'S',labelMinScale:.48}},
  {id:'everthread-college',label:'Everthread College',shortLabel:'College',category:'education',districtId:'campus-green',description:'A local post-secondary campus for study and training.',activityTags:['college','education','training'],route:{tab:'career',section:'education',legacyLabel:'Career · Education'},visibility:'public',importance:3,map:{x:855,y:165,glyph:'C',labelMinScale:.48}},
  {id:'everthread-general-hospital',label:'Everthread General Hospital',shortLabel:'Hospital',category:'health',districtId:'central-weave',description:'The town’s major hospital and medical-care center.',activityTags:['health','medical','recovery'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:3,map:{x:870,y:585,glyph:'H',labelMinScale:.48}},
  {id:'pulseworks-gym',label:'Pulseworks Gym',shortLabel:'Gym',category:'recreation',districtId:'campus-green',description:'A public fitness and training facility beside Campus Green.',activityTags:['fitness','training','wellness'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:1,map:{x:885,y:300,glyph:'GYM',labelMinScale:.78}},
  {id:'silverframe-studios',label:'Silverframe Studios',shortLabel:'Film Studio',category:'career',districtId:'eastworks',description:'Everthread’s principal film and production studio complex.',activityTags:['acting','directing','film'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'public',importance:2,map:{x:1120,y:240,glyph:'FILM',labelMinScale:.62}},
  {id:'facet-modeling-agency',label:'Facet Modeling Agency',shortLabel:'Modeling Agency',category:'career',districtId:'eastworks',description:'A professional modeling and campaign agency.',activityTags:['modeling','fashion','career'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'public',importance:2,map:{x:1240,y:355,glyph:'MOD',labelMinScale:.64}},
  {id:'everthread-speedway',label:'Everthread Speedway',shortLabel:'Speedway',category:'career',districtId:'south-belt',description:'A paved motorsport circuit and racing facility.',activityTags:['motorsport','racing','training'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'public',importance:3,map:{x:245,y:905,glyph:'RACE',labelMinScale:.48}},
  {id:'everthread-stadium',label:'Everthread Stadium',shortLabel:'Stadium',category:'career',districtId:'eastworks',description:'The city’s major athletics and event stadium.',activityTags:['sports','events','training'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'public',importance:3,map:{x:1160,y:545,glyph:'STAD',labelMinScale:.5}},
  {id:'everthread-defense-garrison',label:'Everthread Defense Garrison',shortLabel:'Military Base',category:'career',districtId:'south-belt',description:'A regional service garrison for military careers and training.',activityTags:['military','service','training'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'public',importance:2,map:{x:520,y:920,glyph:'BASE',labelMinScale:.64}},
  {id:'everthread-city-hall',label:'Everthread City Hall',shortLabel:'City Hall',category:'civic',districtId:'central-weave',description:'The civic center for municipal and public-life functions.',activityTags:['civic','politics','business'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'public',importance:3,map:{x:735,y:515,glyph:'CITY',labelMinScale:.46}},
  {id:'everthread-courthouse',label:'Everthread Courthouse',shortLabel:'Courthouse',category:'justice',districtId:'central-weave',description:'The town courthouse for formal legal proceedings.',activityTags:['legal','justice','civic'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:2,map:{x:590,y:620,glyph:'COURT',labelMinScale:.68}},
  {id:'public-safety-center',label:'Everthread Public Safety Center',shortLabel:'Public Safety',category:'justice',districtId:'central-weave',description:'Police, public safety, and civic-response services.',activityTags:['legal','police','civic'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:2,map:{x:770,y:635,glyph:'SAFE',labelMinScale:.68}},
  {id:'everthread-correctional',label:'Everthread Correctional Center',shortLabel:'Prison',category:'justice',districtId:'south-belt',description:'A secure regional correctional facility.',activityTags:['legal','prison','justice'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:2,map:{x:780,y:920,glyph:'PRSN',labelMinScale:.72}},
  {id:'everthread-air-terminal',label:'Everthread Air Terminal',shortLabel:'Airport / Travel',category:'travel',districtId:'south-belt',description:'The town’s passenger terminal and gateway for longer-distance travel.',activityTags:['travel','vacation','emigration'],route:{tab:'activities',legacyLabel:'Activities'},visibility:'public',importance:3,map:{x:1120,y:915,glyph:'AIR',labelMinScale:.46}},
  {id:'loomworks-business-district',label:'Loomworks Business District',shortLabel:'Business District',category:'career',districtId:'eastworks',description:'A dense office and commercial district for ordinary employment and companies.',activityTags:['work','business','employment'],route:{tab:'career',legacyLabel:'Career'},visibility:'public',importance:3,map:{x:1190,y:430,glyph:'WORK',labelMinScale:.48}},
  {id:'blackline-freight-yard',label:'Blackline Freight Yard',shortLabel:'Blackline Yard',category:'underworld',districtId:'eastworks',description:'An old freight yard with a reputation for business that stays off the books.',activityTags:['underworld','organized crime'],route:{tab:'career',section:'special',legacyLabel:'Career · Life Paths'},visibility:'underworld_discovery',importance:1,map:{x:1320,y:665,glyph:'BLK',labelMinScale:.78}},
] as const;

export const TOWN_PLACE_CATEGORIES:readonly {id:TownPlaceCategory;label:string}[]=[
  {id:'finance',label:'Finance'},{id:'commerce',label:'Shops & services'},{id:'residential',label:'Residential'},
  {id:'education',label:'Education'},{id:'health',label:'Health'},{id:'recreation',label:'Recreation'},
  {id:'career',label:'Career'},{id:'civic',label:'Civic'},{id:'justice',label:'Justice'},
  {id:'travel',label:'Travel'},{id:'underworld',label:'Underworld'},
];
