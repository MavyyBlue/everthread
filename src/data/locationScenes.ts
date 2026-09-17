export type LocationScenePlaceId='weaver-park'|'threadtone-music-studio'|'central-everthread-bank'|'loomline-motors';
export type LocationSceneBankActionId=
  |'bank.summary'|'bank.payments'|'bank.accounts'|'bank.offers'|'bank.borrowing'|'bank.invest'|'bank.history';
export type LocationSceneMotorsActionId='motors.catalog'|'motors.owned'|'motors.finance'|'license.driving';
export type LocationSceneActionId=
  |'wellness.walk'|'wellness.run'|'wellness.meditate'
  |'shared.park.walk'|'shared.park.play'|'date.park'
  |'music.leave'|'music.retire'|'music.practice'|'music.tour'|'music.song'|'music.album'|'music.catalog'|'music.partnership'
  |LocationSceneBankActionId|LocationSceneMotorsActionId;
export type LocationSceneActionKind='action'|'companion'|'panel';
export type LocationSceneRisk='normal'|'confirm';
export type LocationSceneRect=readonly[number,number,number,number];

export interface LocationSceneActionDefinition{
  id:LocationSceneActionId;label:string;description:string;kind:LocationSceneActionKind;risk:LocationSceneRisk;
}
export interface LocationSceneGroupDefinition{
  id:string;label:string;description:string;actionIds:readonly LocationSceneActionId[];order:number;hitRect:LocationSceneRect;
}
export interface LocationSceneDefinition{
  id:LocationScenePlaceId;label:string;tagline:string;background:string;propFile:string;
  canvas:readonly[1024,1536];propAlphaBounds:LocationSceneRect;
  propPlacement:{baseline:number;width:number;maxHeight:number};groups:readonly LocationSceneGroupDefinition[];
}

export const LOCATION_SCENE_V1_ENABLED=true;

export const LOCATION_SCENE_ACTIONS:Readonly<Record<LocationSceneActionId,LocationSceneActionDefinition>>={
  'wellness.walk':{id:'wellness.walk',label:'Walk',description:'Take an easy walk through the park.',kind:'action',risk:'normal'},
  'wellness.run':{id:'wellness.run',label:'Run',description:'Follow the running trail at your own pace.',kind:'action',risk:'normal'},
  'wellness.meditate':{id:'wellness.meditate',label:'Meditate',description:'Settle into a quiet moment.',kind:'action',risk:'normal'},
  'shared.park.walk':{id:'shared.park.walk',label:'Walk together',description:'Choose someone to spend this time with.',kind:'companion',risk:'normal'},
  'shared.park.play':{id:'shared.park.play',label:'Play outside',description:'Choose someone to spend this time with.',kind:'companion',risk:'normal'},
  'date.park':{id:'date.park',label:'Park date',description:'Choose an eligible person with an accepted date plan.',kind:'companion',risk:'normal'},
  'music.leave':{id:'music.leave',label:'Leave Music Path',description:'Step away from music while keeping your completed history.',kind:'action',risk:'confirm'},
  'music.retire':{id:'music.retire',label:'Retire',description:'Review retirement from your music career.',kind:'action',risk:'confirm'},
  'music.practice':{id:'music.practice',label:'Practice vocals',description:'Spend time developing your voice.',kind:'action',risk:'normal'},
  'music.tour':{id:'music.tour',label:'Tour',description:'Take your music on the road.',kind:'action',risk:'normal'},
  'music.song':{id:'music.song',label:'Release Song',description:'Put your next song out into the world.',kind:'action',risk:'normal'},
  'music.album':{id:'music.album',label:'Release Album',description:'Bring a collection of songs together.',kind:'action',risk:'normal'},
  'music.catalog':{id:'music.catalog',label:'Your music',description:'Releases, streams, and career history.',kind:'panel',risk:'normal'},
  'music.partnership':{id:'music.partnership',label:'Distribution offers',description:'Review your current music partnership offer.',kind:'panel',risk:'normal'},
  'bank.summary':{id:'bank.summary',label:'Money summary',description:'Cash, assets, liabilities, and net worth.',kind:'panel',risk:'normal'},
  'bank.payments':{id:'bank.payments',label:'Bills & Payments',description:'Required payments, arrears, and auto-pay.',kind:'panel',risk:'normal'},
  'bank.accounts':{id:'bank.accounts',label:'Your accounts',description:'Balances, credit limits, and account controls.',kind:'panel',risk:'normal'},
  'bank.offers':{id:'bank.offers',label:'Credit offers',description:'Review terms before applying.',kind:'panel',risk:'normal'},
  'bank.borrowing':{id:'bank.borrowing',label:'Borrowing',description:'Personal loans and debt options.',kind:'panel',risk:'normal'},
  'bank.invest':{id:'bank.invest',label:'Investments',description:'Browse your fictional in-game market.',kind:'panel',risk:'normal'},
  'bank.history':{id:'bank.history',label:'Credit history',description:'Review your recorded credit history.',kind:'panel',risk:'normal'},
  'motors.catalog':{id:'motors.catalog',label:'Browse vehicles',description:'Shop the established vehicle catalogue.',kind:'panel',risk:'normal'},
  'motors.owned':{id:'motors.owned',label:'Your vehicles',description:'Review your garage, repairs, financing context, and sales.',kind:'panel',risk:'normal'},
  'motors.finance':{id:'motors.finance',label:'Vehicle financing',description:'Compare current terms on finance-eligible vehicles.',kind:'panel',risk:'normal'},
  'license.driving':{id:'license.driving',label:'Driving licence',description:'Take the existing driving licence skill check.',kind:'panel',risk:'normal'},
};

export const LOCATION_SCENES:readonly LocationSceneDefinition[]=[
  {
    id:'weaver-park',label:'Weaver Park',tagline:'A little room to breathe.',
    background:'./location-scenes/backgrounds/weaver-park.png',propFile:'./location-scenes/props/park-bench.png',canvas:[1024,1536],
    propAlphaBounds:[0,21,1222,1233],propPlacement:{baseline:.90,width:.62,maxHeight:.32},
    groups:[
      {id:'bench',label:'Park bench',description:'Time together',actionIds:['shared.park.walk','shared.park.play','date.park'],order:1,hitRect:[.26214,.58,.47572,.32]},
      {id:'trails',label:'Walking trail',description:'Outdoor wellness',actionIds:['wellness.walk','wellness.run'],order:2,hitRect:[.04,.335,.28,.19]},
      {id:'pavilion',label:'Quiet pavilion',description:'A quieter moment',actionIds:['wellness.meditate'],order:3,hitRect:[.65,.255,.28,.19]},
    ],
  },
  {
    id:'threadtone-music-studio',label:'Threadtone Music Studio',tagline:'Find your sound. Make it yours.',
    background:'./location-scenes/backgrounds/threadtone-music-studio.png',propFile:'./location-scenes/props/producer-desk.png',canvas:[1024,1536],
    propAlphaBounds:[11,45,1235,1167],propPlacement:{baseline:.90,width:.62,maxHeight:.32},
    groups:[
      {id:'desk',label:'Producer’s desk',description:'Your music career',actionIds:['music.leave','music.retire'],order:1,hitRect:[.24602,.58,.50797,.32]},
      {id:'rehearsal',label:'Rehearsal nook',description:'Practice & touring',actionIds:['music.practice','music.tour'],order:2,hitRect:[.07,.335,.28,.19]},
      {id:'booth',label:'Recording booth',description:'Your next release',actionIds:['music.song','music.album'],order:3,hitRect:[.60,.305,.28,.19]},
      {id:'records',label:'Record shelf',description:'Your work & partnerships',actionIds:['music.catalog','music.partnership'],order:4,hitRect:[.41,.25,.14,.12]},
    ],
  },
  {
    id:'central-everthread-bank',label:'Central Everthread Bank',tagline:'A clearer view of your finances.',
    background:'./location-scenes/backgrounds/central-everthread-bank.png',propFile:'./location-scenes/props/service-kiosk.png',canvas:[1024,1536],
    propAlphaBounds:[97,32,1101,1199],propPlacement:{baseline:.90,width:.62,maxHeight:.32},
    groups:[
      {id:'kiosk',label:'Banking kiosk',description:'Your money at a glance',actionIds:['bank.summary','bank.payments'],order:1,hitRect:[.27962,.58,.44077,.32]},
      {id:'teller',label:'Teller counter',description:'Accounts & borrowing',actionIds:['bank.accounts','bank.offers','bank.borrowing'],order:2,hitRect:[.10,.375,.28,.19]},
      {id:'advisor',label:'Advisor office',description:'Investing & credit history',actionIds:['bank.invest','bank.history'],order:3,hitRect:[.68,.375,.28,.19]},
    ],
  },
  {
    id:'loomline-motors',label:'Loomline Motors',tagline:'Your next set of keys.',
    background:'./location-scenes/backgrounds/loomline-motors.png',propFile:'./location-scenes/props/showroom-car.png',canvas:[1024,1536],
    propAlphaBounds:[0,53,1240,1161],propPlacement:{baseline:.90,width:.62,maxHeight:.32},
    groups:[
      {id:'showroom',label:'Showroom car',description:'Browse the vehicle market',actionIds:['motors.catalog'],order:1,hitRect:[.24367,.58,.51266,.32]},
      {id:'service',label:'Service bay',description:'Your garage',actionIds:['motors.owned'],order:2,hitRect:[.05,.33,.36,.23]},
      {id:'finance',label:'Finance office',description:'Purchase planning',actionIds:['motors.finance','license.driving'],order:3,hitRect:[.60,.29,.36,.29]},
    ],
  },
] as const;

const locationSceneById=Object.fromEntries(LOCATION_SCENES.map(scene=>[scene.id,scene])) as Record<LocationScenePlaceId,LocationSceneDefinition>;
export function locationSceneDefinition(placeId:string){return locationSceneById[placeId as LocationScenePlaceId];}
export function locationSceneEnabled(placeId:string){return LOCATION_SCENE_V1_ENABLED&&Boolean(locationSceneDefinition(placeId));}
