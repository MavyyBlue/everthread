export type TownPlaceCategory='finance'|'commerce'|'residential'|'education'|'health'|'recreation'|'career'|'civic'|'justice'|'travel'|'underworld';
export type TownPlaceVisibility='public'|'underworld_discovery';
export type TownInstitutionDestination='banking'|'payments'|'money'|'investments'|'property_homes'|'property_owned_homes'|'property_vehicles'|'property_owned_vehicles'|'business'|'education'|'education_admissions'|'healthcare'|'wellness'|'travel'|'legal'|'work'|'acting'|'music'|'directing'|'modeling'|'racing'|'sports'|'military'|'politics'|'organized_crime';

export interface TownPlaceRoute {
  id:string;
  label:string;
  description:string;
  destination:TownInstitutionDestination;
}

export interface TownPlaceDefinition {
  id:string;
  label:string;
  shortLabel:string;
  category:TownPlaceCategory;
  districtId:string;
  description:string;
  activityTags:readonly string[];
  routes?:readonly TownPlaceRoute[];
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

export const TOWN_MAP_WIDTH=1536;
export const TOWN_MAP_HEIGHT=961;

export const TOWN_DISTRICTS:readonly TownDistrictDefinition[]=[
  {id:'threadwell',label:'Threadwell',description:'Homes, quiet streets, and neighborhood life.',map:{x:105,y:85,width:425,height:675}},
  {id:'campus-green',label:'Campus Green',description:'Schools, college grounds, recreation, and open space.',map:{x:535,y:70,width:500,height:250}},
  {id:'central-weave',label:'Central Weave',description:'Everthread’s civic and financial center.',map:{x:500,y:300,width:455,height:330}},
  {id:'market-row',label:'Market Row',description:'Everyday shopping, food, vehicles, and housing services.',map:{x:220,y:410,width:385,height:355}},
  {id:'eastworks',label:'Eastworks',description:'Studios, agencies, companies, and major venues.',map:{x:900,y:285,width:335,height:395}},
  {id:'south-belt',label:'South Belt',description:'Large-footprint facilities, transport, and regional infrastructure.',map:{x:1050,y:70,width:445,height:825}},
];

export const TOWN_PLACES:readonly TownPlaceDefinition[]=[
  {id:'central-everthread-bank',label:'Central Everthread Bank',shortLabel:'Central Bank',category:'finance',districtId:'central-weave',description:'Everthread’s primary retail bank and financial-services landmark.',activityTags:['banking','credit','investing'],routes:[{id:'money',label:'Money & liabilities',description:'Review cash, assets, debt, and your latest financial summary.',destination:'money'},{id:'banking',label:'Credit & Banking',description:'Open credit accounts, borrowing, offers, and credit history.',destination:'banking'},{id:'payments',label:'Bills & Payments',description:'Manage card, personal-loan, mortgage, and vehicle-finance payments.',destination:'payments'},{id:'investments',label:'Investments',description:'Open the existing fictional securities market.',destination:'investments'}],visibility:'public',importance:3,map:{x:640,y:438,glyph:'B',labelMinScale:.48}},
  {id:'loomline-motors',label:'Loomline Motors',shortLabel:'Car Dealership',category:'commerce',districtId:'market-row',description:'A city dealership district for personal vehicles and financing.',activityTags:['vehicles','financing'],routes:[{id:'browse-vehicles',label:'Browse vehicles & financing',description:'Shop the established vehicle market and compare financing at purchase.',destination:'property_vehicles'},{id:'owned-vehicles',label:'Your vehicles',description:'Manage repairs, financing context, and vehicle sales.',destination:'property_owned_vehicles'}],visibility:'public',importance:2,map:{x:292,y:650,glyph:'CAR',labelMinScale:.68}},
  {id:'hearthline-realty',label:'Hearthline Realty & Leasing',shortLabel:'Realty / Leasing',category:'commerce',districtId:'market-row',description:'Local property sales, rentals, and leasing services.',activityTags:['property','rentals','mortgages'],routes:[{id:'browse-homes',label:'Homes & mortgages',description:'Browse homes and compare established mortgage financing at purchase.',destination:'property_homes'},{id:'owned-homes',label:'Your homes & rentals',description:'Manage renovations, rentals, financing context, and property sales.',destination:'property_owned_homes'}],visibility:'public',importance:2,map:{x:450,y:648,glyph:'R',labelMinScale:.64}},
  {id:'threadwell-residential',label:'Threadwell Residential District',shortLabel:'Residential District',category:'residential',districtId:'threadwell',description:'A broad neighborhood district representing ordinary Everthread homes.',activityTags:['home','households','family'],visibility:'public',importance:3,map:{x:292,y:300,glyph:'HOME',labelMinScale:.5}},
  {id:'crossroads-mall',label:'Crossroads Mall',shortLabel:'Mall',category:'commerce',districtId:'market-row',description:'A large indoor shopping and leisure center near the center of town.',activityTags:['shopping','social','leisure'],visibility:'public',importance:3,map:{x:402,y:418,glyph:'M',labelMinScale:.48}},
  {id:'nightjar-diner',label:'Nightjar Diner',shortLabel:'Diner',category:'commerce',districtId:'market-row',description:'A familiar all-day diner and casual meeting spot.',activityTags:['food','social','dates'],visibility:'public',importance:1,map:{x:486,y:500,glyph:'D',labelMinScale:.84}},
  {id:'weaver-park',label:'Weaver Park',shortLabel:'Park',category:'recreation',districtId:'campus-green',description:'A central public park with paths, lawns, and community gathering space.',activityTags:['outdoors','wellness','social'],routes:[{id:'outdoor-wellness',label:'Outdoor wellness',description:'Open established walking, running, meditation, and wellness activities.',destination:'wellness'}],visibility:'public',importance:3,map:{x:620,y:260,glyph:'P',labelMinScale:.46}},
  {id:'everthread-market',label:'Everthread Market',shortLabel:'Grocery Store',category:'commerce',districtId:'market-row',description:'A neighborhood grocery store serving everyday household needs.',activityTags:['groceries','household'],visibility:'public',importance:1,map:{x:350,y:530,glyph:'G',labelMinScale:.82}},
  {id:'everthread-school',label:'Everthread Community School',shortLabel:'School',category:'education',districtId:'campus-green',description:'The town’s main compulsory-school campus.',activityTags:['school','education','youth'],routes:[{id:'education',label:'School & education',description:'Open your established school world, effort, activities, and education history.',destination:'education'}],visibility:'public',importance:3,map:{x:762,y:174,glyph:'S',labelMinScale:.48}},
  {id:'everthread-college',label:'Everthread College',shortLabel:'College',category:'education',districtId:'campus-green',description:'A local post-secondary campus for study and training.',activityTags:['college','education','training'],routes:[{id:'admissions',label:'College & admissions',description:'Open established post-secondary programs, admissions, and education history.',destination:'education_admissions'}],visibility:'public',importance:3,map:{x:858,y:175,glyph:'C',labelMinScale:.48}},
  {id:'everthread-general-hospital',label:'Everthread General Hospital',shortLabel:'Hospital',category:'health',districtId:'central-weave',description:'The town’s major hospital and medical-care center.',activityTags:['health','medical','recovery'],routes:[{id:'healthcare',label:'Healthcare',description:'Open conditions, treatment, and specialist care.',destination:'healthcare'}],visibility:'public',importance:3,map:{x:852,y:370,glyph:'H',labelMinScale:.48}},
  {id:'pulseworks-gym',label:'Pulseworks Gym',shortLabel:'Gym',category:'recreation',districtId:'campus-green',description:'A public fitness and training facility beside Campus Green.',activityTags:['fitness','training','wellness'],routes:[{id:'wellness',label:'Training & wellness',description:'Open established fitness and wellness activities.',destination:'wellness'}],visibility:'public',importance:1,map:{x:928,y:250,glyph:'GYM',labelMinScale:.78}},
  {id:'silverframe-studios',label:'Silverframe Studios',shortLabel:'Film Studio',category:'career',districtId:'eastworks',description:'Everthread’s principal film and production studio complex.',activityTags:['acting','directing','film'],routes:[{id:'acting',label:'Acting',description:'Open the established Acting life path.',destination:'acting'},{id:'directing',label:'Film directing',description:'Open the established Film directing life path.',destination:'directing'}],visibility:'public',importance:2,map:{x:985,y:445,glyph:'FILM',labelMinScale:.62}},
  {id:'threadtone-music-studio',label:'Threadtone Music Studio',shortLabel:'Music Studio',category:'career',districtId:'eastworks',description:'A recording, rehearsal, and production studio for Everthread musicians.',activityTags:['music','recording','career'],routes:[{id:'music',label:'Music career',description:'Open the established Music life path for practice, releases, and touring.',destination:'music'}],visibility:'public',importance:2,map:{x:1098,y:382,glyph:'MUS',labelMinScale:.64}},
  {id:'facet-modeling-agency',label:'Facet Modeling Agency',shortLabel:'Modeling Agency',category:'career',districtId:'eastworks',description:'A professional modeling and campaign agency.',activityTags:['modeling','fashion','career'],routes:[{id:'modeling',label:'Modeling',description:'Open the established Modeling life path.',destination:'modeling'}],visibility:'public',importance:2,map:{x:904,y:397,glyph:'MOD',labelMinScale:.64}},
  {id:'everthread-speedway',label:'Everthread Speedway',shortLabel:'Speedway',category:'career',districtId:'south-belt',description:'A paved motorsport circuit and racing facility.',activityTags:['motorsport','racing','training'],routes:[{id:'racing',label:'Motorsport',description:'Open the established Motorsport life path.',destination:'racing'}],visibility:'public',importance:3,map:{x:1326,y:154,glyph:'RACE',labelMinScale:.48}},
  {id:'everthread-stadium',label:'Everthread Stadium',shortLabel:'Stadium',category:'career',districtId:'eastworks',description:'The city’s major athletics and event stadium.',activityTags:['sports','events','training'],routes:[{id:'sports',label:'Professional sports',description:'Open the established Professional sports life path.',destination:'sports'}],visibility:'public',importance:3,map:{x:970,y:164,glyph:'STAD',labelMinScale:.5}},
  {id:'everthread-defense-garrison',label:'Everthread Defense Garrison',shortLabel:'Military Base',category:'career',districtId:'south-belt',description:'A regional service garrison for military careers and training.',activityTags:['military','service','training'],routes:[{id:'military',label:'Military service',description:'Open the established Military life path.',destination:'military'}],visibility:'public',importance:2,map:{x:1146,y:655,glyph:'BASE',labelMinScale:.64}},
  {id:'everthread-city-hall',label:'Everthread City Hall',shortLabel:'City Hall',category:'civic',districtId:'central-weave',description:'The civic center for municipal and public-life functions.',activityTags:['civic','politics','business'],routes:[{id:'politics',label:'Civic & political life',description:'Open the established Politics life path.',destination:'politics'},{id:'business',label:'Company services',description:'Open established company formation and business management.',destination:'business'}],visibility:'public',importance:3,map:{x:704,y:485,glyph:'CITY',labelMinScale:.46}},
  {id:'everthread-courthouse',label:'Everthread Courthouse',shortLabel:'Courthouse',category:'justice',districtId:'central-weave',description:'The town courthouse for formal legal proceedings.',activityTags:['legal','justice','civic'],routes:[{id:'legal',label:'Cases & legal proceedings',description:'Open the established crime, pending-case, and legal-risk surface.',destination:'legal'}],visibility:'public',importance:2,map:{x:765,y:520,glyph:'COURT',labelMinScale:.68}},
  {id:'public-safety-center',label:'Everthread Public Safety Center',shortLabel:'Public Safety',category:'justice',districtId:'central-weave',description:'Police, public safety, and civic-response services.',activityTags:['legal','police','civic'],routes:[{id:'legal',label:'Public safety & legal risk',description:'Open the established legal-risk and pending-case surface.',destination:'legal'}],visibility:'public',importance:2,map:{x:830,y:525,glyph:'SAFE',labelMinScale:.68}},
  {id:'everthread-correctional',label:'Everthread Correctional Center',shortLabel:'Prison',category:'justice',districtId:'south-belt',description:'A secure regional correctional facility.',activityTags:['legal','prison','justice'],routes:[{id:'corrections',label:'Corrections & legal status',description:'Open established prison actions when imprisoned, or legal-risk actions otherwise.',destination:'legal'}],visibility:'public',importance:2,map:{x:1218,y:765,glyph:'PRSN',labelMinScale:.72}},
  {id:'everthread-air-terminal',label:'Everthread Air Terminal',shortLabel:'Airport / Travel',category:'travel',districtId:'south-belt',description:'The town’s passenger terminal and gateway for longer-distance travel.',activityTags:['travel','vacation','emigration'],routes:[{id:'travel',label:'Travel & emigration',description:'Open established vacation, family-trip, and emigration controls.',destination:'travel'}],visibility:'public',importance:3,map:{x:1373,y:505,glyph:'AIR',labelMinScale:.46}},
  {id:'loomworks-business-district',label:'Loomworks Business District',shortLabel:'Business District',category:'career',districtId:'eastworks',description:'A dense office and commercial district for ordinary employment and companies.',activityTags:['work','business','employment'],routes:[{id:'work',label:'Jobs & workplaces',description:'Open established full-time, part-time, workplace, and freelance career controls.',destination:'work'},{id:'business',label:'Companies',description:'Open established company formation and business management.',destination:'business'}],visibility:'public',importance:3,map:{x:880,y:490,glyph:'WORK',labelMinScale:.48}},
  {id:'blackline-freight-yard',label:'Blackline Freight Yard',shortLabel:'Blackline Yard',category:'underworld',districtId:'eastworks',description:'An old freight yard with a reputation for business that stays off the books.',activityTags:['underworld','organized crime'],routes:[{id:'organized-crime',label:'Organized crime',description:'Open the established organized-crime life path.',destination:'organized_crime'}],visibility:'underworld_discovery',importance:1,map:{x:1055,y:548,glyph:'BLK',labelMinScale:.78}},
] as const;

export const TOWN_PLACE_CATEGORIES:readonly {id:TownPlaceCategory;label:string}[]=[
  {id:'finance',label:'Finance'},{id:'commerce',label:'Shops & services'},{id:'residential',label:'Residential'},
  {id:'education',label:'Education'},{id:'health',label:'Health'},{id:'recreation',label:'Recreation'},
  {id:'career',label:'Career'},{id:'civic',label:'Civic'},{id:'justice',label:'Justice'},
  {id:'travel',label:'Travel'},{id:'underworld',label:'Underworld'},
];
