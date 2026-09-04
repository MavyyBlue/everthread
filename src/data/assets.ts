import type { PropertyDefinition, PetVariantDefinition, SecurityDefinition, BusinessIndustryDefinition } from '../types/content';

const propertyBases = [
  ['studio_flat','Studio Flat',95000,.026,.06,['compact kitchen']],
  ['small_apartment','Small Apartment',145000,.024,.055,['balcony']],
  ['city_condo','City Condo',260000,.022,.06,['doorman','gym access']],
  ['suburban_townhouse','Suburban Townhouse',310000,.024,.05,['garage','small garden']],
  ['starter_house','Starter House',285000,.027,.052,['yard']],
  ['family_house','Family House',430000,.026,.05,['yard','garage']],
  ['modern_house','Modern House',620000,.028,.065,['smart home','garage']],
  ['historic_home','Historic Home',720000,.04,.075,['period details','large rooms']],
  ['country_cottage','Country Cottage',350000,.03,.055,['garden','fireplace']],
  ['farmhouse','Farmhouse',560000,.035,.06,['acreage','barn']],
  ['lake_house','Lake House',780000,.032,.075,['water access','dock']],
  ['beach_house','Beach House',1150000,.04,.09,['ocean view','terrace']],
  ['mountain_chalet','Mountain Chalet',980000,.038,.08,['mountain view','fireplace']],
  ['luxury_condo','Luxury Condo',1450000,.032,.085,['concierge','fitness suite']],
  ['penthouse','Skyline Penthouse',3100000,.04,.10,['private terrace','concierge','panoramic view']],
  ['mansion','Grand Estate',4800000,.055,.11,['pool','guest wing','large grounds']],
  ['villa','Coastal Villa',5500000,.06,.12,['pool','sea view','courtyard']],
  ['urban_estate','Urban Estate',6900000,.06,.11,['security suite','garden','staff quarters']],
  ['ranch','Working Ranch',2300000,.05,.08,['acreage','stables','workshops']],
  ['island_retreat','Island Retreat',12500000,.075,.14,['private shore','guest villas','dock']],
] as const;

const marketTiers = [
  ['value','Value-Market',.68], ['standard','Standard',1], ['premium','Premium District',1.48]
] as const;

export const propertyDefinitions: PropertyDefinition[] = propertyBases.flatMap(([id,name,price,upkeep,volatility,amenities]) =>
  marketTiers.map(([tier,tierName,mult]) => ({
    id:`${id}_${tier}`,
    name:`${tierName} ${name}`,
    basePrice:Math.round(price * mult),
    upkeepRate:upkeep,
    appreciationVolatility:volatility,
    amenities:[...amenities],
  }))
);

export const securities: SecurityDefinition[] = [
  {id:'aurora_robotics',ticker:'AUR',name:'Aurora Robotics',type:'stock',basePrice:48,volatility:.24,drift:.05},
  {id:'northstar_health',ticker:'NTH',name:'Northstar Healthworks',type:'stock',basePrice:72,volatility:.17,drift:.04},
  {id:'lattice_cloud',ticker:'LTC',name:'Lattice Cloud Systems',type:'stock',basePrice:34,volatility:.30,drift:.055},
  {id:'greenline_transit',ticker:'GLT',name:'Greenline Transit Group',type:'stock',basePrice:41,volatility:.14,drift:.032},
  {id:'cinder_media',ticker:'CDR',name:'Cinder Media',type:'stock',basePrice:26,volatility:.33,drift:.04},
  {id:'harbor_foods',ticker:'HBF',name:'Harbor Foods Collective',type:'stock',basePrice:63,volatility:.13,drift:.028},
  {id:'aster_energy',ticker:'AST',name:'Aster Renewable Energy',type:'stock',basePrice:52,volatility:.22,drift:.05},
  {id:'meridian_bank',ticker:'MRD',name:'Meridian Financial',type:'stock',basePrice:88,volatility:.18,drift:.035},
  {id:'bluepeak_industries',ticker:'BPK',name:'Bluepeak Industries',type:'stock',basePrice:57,volatility:.20,drift:.035},
  {id:'velvet_labs',ticker:'VLT',name:'Velvet Consumer Labs',type:'stock',basePrice:19,volatility:.36,drift:.05},
  {id:'civic_bond',ticker:'CVB',name:'Civic Stability Bond',type:'bond',basePrice:100,volatility:.03,drift:.018},
  {id:'horizon_bond',ticker:'HZB',name:'Horizon Infrastructure Bond',type:'bond',basePrice:100,volatility:.045,drift:.022},
  {id:'broad_market',ticker:'BMF',name:'Broad Market Basket',type:'fund',basePrice:120,volatility:.11,drift:.04},
  {id:'future_industries',ticker:'FIF',name:'Future Industries Basket',type:'fund',basePrice:95,volatility:.17,drift:.05},
  {id:'quiet_income',ticker:'QIF',name:'Quiet Income Basket',type:'fund',basePrice:105,volatility:.065,drift:.028},
  {id:'spark_token',ticker:'SPK',name:'Spark Token',type:'speculative',basePrice:8,volatility:.78,drift:.01},
  {id:'orbit_coin',ticker:'ORB',name:'Orbit Coin',type:'speculative',basePrice:22,volatility:.92,drift:0},
  {id:'mintbyte',ticker:'MBT',name:'MintByte',type:'speculative',basePrice:3,volatility:1.10,drift:-.015},
];

export const businessIndustries: BusinessIndustryDefinition[] = [
  {id:'restaurant',name:'Restaurant Group',startupCapital:90000,marginRange:[.04,.18],volatility:.26,productNames:['Lunch Menu','Dinner Menu','Catering','Signature Dessert']},
  {id:'coffee',name:'Coffee Shops',startupCapital:65000,marginRange:[.08,.22],volatility:.18,productNames:['Espresso Line','Cold Drinks','Pastries','Subscriptions']},
  {id:'retail',name:'Specialty Retail',startupCapital:80000,marginRange:[.06,.20],volatility:.22,productNames:['Core Collection','Seasonal Collection','Premium Line','Online Store']},
  {id:'software',name:'Software Studio',startupCapital:140000,marginRange:[.12,.38],volatility:.34,productNames:['Team App','Creator Tool','Enterprise Suite','Mobile Product']},
  {id:'consumer_tech',name:'Consumer Technology',startupCapital:350000,marginRange:[.08,.30],volatility:.42,productNames:['Smart Device','Accessory Line','Home Hub','Subscription Service']},
  {id:'manufacturing',name:'Light Manufacturing',startupCapital:420000,marginRange:[.05,.18],volatility:.24,productNames:['Core Component','Industrial Line','Custom Orders','Maintenance Program']},
  {id:'automotive',name:'Automotive Services',startupCapital:220000,marginRange:[.07,.24],volatility:.21,productNames:['Repairs','Restoration','Fleet Service','Performance Package']},
  {id:'media',name:'Media Company',startupCapital:180000,marginRange:[.05,.28],volatility:.38,productNames:['Digital Series','Podcast Network','Events','Licensing']},
  {id:'consulting',name:'Consulting Firm',startupCapital:75000,marginRange:[.16,.42],volatility:.20,productNames:['Strategy Projects','Operations Projects','Training','Retainers']},
  {id:'healthcare',name:'Private Clinic Network',startupCapital:500000,marginRange:[.08,.22],volatility:.16,productNames:['General Care','Specialty Care','Diagnostics','Wellness Plans']},
  {id:'fashion',name:'Fashion Label',startupCapital:160000,marginRange:[.08,.32],volatility:.37,productNames:['Essentials','Seasonal Drop','Luxury Capsule','Accessories']},
  {id:'food_products',name:'Packaged Food Brand',startupCapital:190000,marginRange:[.07,.24],volatility:.24,productNames:['Core Snacks','Healthy Line','Premium Line','Beverages']},
  {id:'fitness',name:'Fitness Studios',startupCapital:110000,marginRange:[.10,.30],volatility:.20,productNames:['Memberships','Classes','Coaching','Merchandise']},
  {id:'education',name:'Learning Company',startupCapital:120000,marginRange:[.12,.34],volatility:.22,productNames:['Courses','Tutoring','Corporate Training','Learning App']},
  {id:'property_services',name:'Property Services',startupCapital:100000,marginRange:[.08,.26],volatility:.17,productNames:['Management','Maintenance','Leasing','Renovation']},
  {id:'events',name:'Events Company',startupCapital:90000,marginRange:[.08,.30],volatility:.31,productNames:['Private Events','Corporate Events','Festivals','Venue Services']},
  {id:'beauty',name:'Beauty Brand',startupCapital:130000,marginRange:[.10,.36],volatility:.32,productNames:['Skin Line','Hair Line','Fragrance','Professional Line']},
  {id:'gaming',name:'Game Studio',startupCapital:220000,marginRange:[.04,.40],volatility:.48,productNames:['Indie Game','Mobile Game','Expansion','Publishing Deal']},
  {id:'logistics',name:'Logistics Company',startupCapital:300000,marginRange:[.04,.16],volatility:.16,productNames:['Local Delivery','Freight','Warehousing','Priority Service']},
  {id:'green_energy',name:'Clean Energy Firm',startupCapital:800000,marginRange:[.05,.25],volatility:.33,productNames:['Solar Projects','Storage Projects','Commercial Contracts','Maintenance']},
];

const petBreeds: Record<string,string[]> = {
  Dog:['Mixed Breed','Retriever','Shepherd','Terrier','Spaniel','Poodle','Hound','Mastiff','Collie','Spitz','Corgi','Sighthound'],
  Cat:['Domestic Shorthair','Domestic Longhair','Siamese-type','Forest Cat','Rex-type','Bobtail','Colorpoint','Shorthair','Longhair','Hairless-type'],
  Bird:['Budgerigar','Cockatiel','Canary','Finch','Conure','Parrotlet','Dove','Lovebird'],
  Reptile:['Corn Snake','King Snake','Ball Python','Leopard Gecko','Crested Gecko','Bearded Dragon','Blue-Tongue Skink','Tortoise'],
  Rodent:['Hamster','Gerbil','Fancy Mouse','Fancy Rat','Guinea Pig','Chinchilla'],
  Exotic:['Pygmy Hedgehog','Sugar Glider','Fennec-type Fox','Miniature Pig','Capybara-type Rodent','Serval-type Cat']
};

export const petVariants: PetVariantDefinition[] = Object.entries(petBreeds).flatMap(([species,breeds]) => breeds.map((breed,index) => ({
  id:`${species.toLowerCase()}_${index+1}`,
  species,
  breed,
  price: species === 'Exotic' ? 2500 + index*900 : 120 + index*65,
  lifespan: species === 'Dog' ? [9,16] : species === 'Cat' ? [11,19] : species === 'Bird' ? [6,30] : species === 'Reptile' ? [8,35] : species === 'Rodent' ? [2,10] : [6,20],
  activityNeed: Math.min(90, 30 + ((index*11) % 55)),
  legalTier: species === 'Exotic' ? 'restricted' : 'common',
})));

const vehicleLines = [
  ['economy','Economy Hatchback',22000,.17],['compact','Compact Sedan',27000,.16],['family_sedan','Family Sedan',34000,.15],['crossover','Compact Crossover',38000,.16],
  ['suv','Family SUV',47000,.17],['utility','Utility Truck',45000,.15],['sport_coupe','Sport Coupe',62000,.19],['roadster','Roadster',74000,.20],
  ['luxury_sedan','Luxury Sedan',88000,.18],['luxury_suv','Luxury SUV',105000,.19],['grand_tourer','Grand Tourer',135000,.20],['supercar','Exotic Supercar',310000,.24],
  ['hypercar','Limited Hypercar',1200000,.20],['classic_compact','Classic Compact',28000,.08],['classic_coupe','Classic Coupe',85000,.06],['classic_exotic','Classic Exotic',420000,.04],
  ['commuter_bike','Commuter Motorcycle',9500,.20],['sport_bike','Sport Motorcycle',18000,.23],['touring_bike','Touring Motorcycle',24000,.18],['collector_bike','Collector Motorcycle',52000,.12],
] as const;
export const vehicleDefinitions = vehicleLines.flatMap(([id,name,price,depreciation]) => [
  {id:`${id}_base`,name,price,category:id.includes('bike')?'motorcycle' as const:'car' as const,depreciation},
  {id:`${id}_premium`,name:`Premium ${name}`,price:Math.round(price*1.35),category:id.includes('bike')?'motorcycle' as const:'car' as const,depreciation:depreciation*.92},
]);
export const luxuryVehicleDefinitions = [
  {id:'boat_daycruiser',name:'Day Cruiser',price:120000,category:'boat' as const,depreciation:.14},
  {id:'boat_sport',name:'Sport Yacht',price:650000,category:'boat' as const,depreciation:.12},
  {id:'boat_yacht',name:'Luxury Yacht',price:3200000,category:'boat' as const,depreciation:.10},
  {id:'air_light',name:'Light Aircraft',price:420000,category:'aircraft' as const,depreciation:.11},
  {id:'air_turboprop',name:'Private Turboprop',price:2400000,category:'aircraft' as const,depreciation:.09},
  {id:'air_jet',name:'Private Jet',price:14500000,category:'aircraft' as const,depreciation:.08},
  {id:'air_helicopter',name:'Private Helicopter',price:1800000,category:'aircraft' as const,depreciation:.12},
];

const collectibleFamilies = {
  Art:['Unknown Landscape','Modern Geometry','Portrait Study','Abstract Canvas','Street Art Panel','Sculptural Form','Miniature Painting','Studio Print'],
  Antique:['Brass Telescope','Mechanical Clock','Writing Desk','Ceremonial Box','Glass Decanter','Travel Trunk','Handmade Cabinet','Silver Tea Set'],
  Jewelry:['Vintage Brooch','Gemstone Ring','Art-Deco Necklace','Gold Bracelet','Signet Ring','Pearl Set','Watch','Jeweled Pendant'],
  Memorabilia:['Signed Poster','Tour Jacket','Championship Program','Screen-Used Prop','First Edition Script','Concert Print','Historic Ticket','Signed Photograph'],
  Artifact:['Ancient Coin','Carved Tablet Fragment','Ceremonial Vessel','Old Navigation Tool','Decorated Mask','Inscribed Seal','Trade Weight Set','Historic Map'],
};
export const collectibleDefinitions = Object.entries(collectibleFamilies).flatMap(([family,names],familyIndex)=>names.map((name,index)=>({
  id:`collectible_${family.toLowerCase()}_${index+1}`,name:`${name}`,family,baseValue:Math.round((500+familyIndex*900)*(1+index*.7)),rarity:['uncommon','scarce','rare','exceptional'][index%4],fakeChance:.08+familyIndex*.015
})));
