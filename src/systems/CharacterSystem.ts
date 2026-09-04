import { countries } from '../data/countries';
import { getNamePool } from '../data/names';
import { achievements } from '../data/achievements';
import type { Character, GameState, Npc, Relationship, Sex, GenderIdentity, Orientation } from '../types/game';
import { clamp } from '../core/math';
import { createRng, randomSeed } from '../core/rng';

const traits = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];
const skinTones = ['porcelain','fair','light','medium','olive','tan','brown','deep brown','dark'];
const hairColors = ['black','dark brown','brown','auburn','blonde','platinum','red'];
const hairStyles = ['straight','wavy','curly','coiled','short textured','long layered','cropped'];
const eyeColors = ['brown','dark brown','hazel','green','blue','gray','amber'];
const birthCircumstances = ['a quiet morning','a thunderstorm','a clear winter night','a humid summer afternoon','a rainy spring morning','a crowded holiday weekend','just before sunrise','late in the evening'];

export interface CharacterCreationOptions {
  seed?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  sex?: Sex;
  genderIdentity?: GenderIdentity;
  orientation?: Orientation;
  countryId?: string;
  city?: string;
  advanced?: Partial<{
    intelligence:number; appearance:number; health:number; happiness:number; discipline:number; willpower:number; fertility:number;
    athleticism:number; music:number; acting:number; crime:number; business:number; social:number;
  }>;
  sandbox?: boolean;
  rewindEnabled?: boolean;
}

function npcFromParent(index:number, playerLastName:string, countryId:string, city:string, seed:string): Npc {
  const rng = createRng(`${seed}-parent-${index}`);
  const pool = getNamePool(countryId);
  const age = rng.int(20,44);
  return {
    id:`parent-${index}-${seed.slice(-6)}`,
    firstName:rng.pick(pool.first), lastName: index === 0 && rng.chance(.65) ? playerLastName : rng.pick(pool.last), age, alive:true,
    health:rng.int(62,98), happiness:rng.int(45,90), wealth:rng.int(1000,120000), countryId, city,
    sexuality:rng.pick<Orientation>(['straight','straight','straight','bisexual','gay','lesbian']), fertility:rng.int(35,88),
    maritalStatus:'married', traits:rng.shuffle(traits).slice(0,3), hiddenOpinion:rng.int(35,90), memories:[], parentIds:[], childIds:[],
  };
}

export function createNewGame(options: CharacterCreationOptions = {}): GameState {
  const seed = options.seed ?? randomSeed();
  const rng = createRng(seed);
  const country = options.countryId ? countries.find(c => c.id === options.countryId) ?? rng.pick(countries) : rng.pick(countries);
  const pool = getNamePool(country.id);
  const firstName = options.firstName?.trim() || rng.pick(pool.first);
  const lastName = options.lastName?.trim() || rng.pick(pool.last);
  const sex = options.sex ?? rng.pick<Sex>(['female','male','female','male','intersex']);
  const genderIdentity = options.genderIdentity ?? (sex === 'female' ? 'woman' : sex === 'male' ? 'man' : 'nonbinary');
  const orientation = options.orientation ?? rng.pick<Orientation>(['straight','straight','straight','bisexual','pansexual','gay','lesbian','asexual']);
  const city = options.city?.trim() || rng.pick(country.cities);
  const familyWealthTier = rng.weighted([
    {item:'poor' as const,weight:12},{item:'working' as const,weight:28},{item:'middle' as const,weight:38},{item:'comfortable' as const,weight:17},{item:'wealthy' as const,weight:5}
  ]);
  const adv = options.advanced ?? {};
  const stat = (value:number|undefined,min=28,max=88) => clamp(value ?? rng.int(min,max));
  const character: Character = {
    id:`player-${seed.slice(-10)}`, firstName, middleName:options.middleName, lastName, sex, genderIdentity, orientation,
    countryId:country.id, city, birthYear:2026, age:0, alive:true,
    appearance:{skinTone:rng.pick(skinTones),hairColor:rng.pick(hairColors),hairStyle:rng.pick(hairStyles),eyeColor:rng.pick(eyeColors),accessories:[]},
    stats:{health:stat(adv.health,70,100),happiness:stat(adv.happiness,55,95),intelligence:stat(adv.intelligence),appearance:stat(adv.appearance)},
    secondary:{
      athleticism:stat(adv.athleticism),discipline:stat(adv.discipline),willpower:stat(adv.willpower),karma:0,reputation:rng.int(45,60),stress:rng.int(0,8),
      fertility:stat(adv.fertility,35,92),charisma:stat(adv.social),creativity:rng.int(30,90),confidence:rng.int(25,75),addictionSusceptibility:rng.int(8,72),
      criminalNotoriety:0,academicPerformance:rng.int(40,70),workPerformance:50,
    },
    talents:{music:stat(adv.music,10,95),acting:stat(adv.acting,10,95),athletics:stat(adv.athleticism,10,95),business:stat(adv.business,10,95),crime:stat(adv.crime,10,95),social:stat(adv.social,10,95),combat:rng.int(10,95)},
    birthCircumstance:rng.pick(birthCircumstances),familyWealthTier,traits:rng.shuffle(traits).slice(0,3),specialTalents:[],
  };
  const p1 = npcFromParent(1,lastName,country.id,city,seed);
  const p2 = npcFromParent(2,lastName,country.id,city,seed);
  p1.partnerId=p2.id; p2.partnerId=p1.id; p1.childIds=[character.id]; p2.childIds=[character.id];
  const relationships: Relationship[] = [
    {id:`rel-${p1.id}`,npcId:p1.id,type:'parent',score:rng.int(58,92),attraction:0,compatibility:rng.int(45,88),yearsKnown:0},
    {id:`rel-${p2.id}`,npcId:p2.id,type:'parent',score:rng.int(58,92),attraction:0,compatibility:rng.int(45,88),yearsKnown:0},
  ];
  const familyCash = {poor:100,working:500,middle:1800,comfortable:7000,wealthy:30000}[familyWealthTier];
  const state: GameState = {
    saveVersion:4,slotId:'slot-1',seed,rngCounter:rng.counter(),idCounter:0,currentYear:2026,character,npcs:{[p1.id]:p1,[p2.id]:p2},relationships,
    education:[], employment:{history:[],partTimeJobIds:[],freelanceReputation:10,retired:false},
    finances:{cash:familyCash,annualIncome:0,annualExpenses:0,taxesPaid:0,liabilities:[]},
    assets:{properties:[],vehicles:[],collectibles:[]}, investments:{positions:[],prices:{},marketRegime:'neutral',history:{}}, businesses:[],
    health:{conditions:[],fitness:rng.int(35,70),wellness:rng.int(50,85),addictions:[]}, legal:{criminalRecord:[],investigationHeat:0,imprisoned:false,sentenceRemaining:0,paroleEligible:false},
    fame:{fame:0,publicReputation:50,followers:0,engagement:0,platforms:{},scandals:[]}, specialCareers:{}, pets:[],
    timeline:[{id:'birth',year:2026,age:0,category:'birth',importance:3,text:`You were born ${character.birthCircumstance} in ${city}, ${country.name}.`}],
    delayedEvents:[],recentEventIds:[],achievements:achievements.map(a=>({id:a.id,completed:false,progress:0})),challenges:[],
    legacy:{generation:1,totalFamilyWealth:familyCash,totalYearsSimulated:0,familyTreeNpcIds:[p1.id,p2.id],accountCollectibleIds:[],completedLifeIds:[]},completedLives:[],
    travel:{visitedCountries:[country.id],visitedCities:[city],emigrations:0,licenses:{driving:false,boating:false,pilot:false}},inheritance:{will:[],inheritBusinesses:true,inheritProperties:true},
    economy:{inflationIndex:1,housingIndex:1,salaryIndex:1,businessDemandIndex:1,year:2026},
    flags:{sandbox:options.sandbox ?? false,rewindEnabled:options.rewindEnabled ?? false,debugEnabled:false},
    settings:{theme:'system',accent:'#7357ff',sound:true,haptics:true,animations:true,textScale:1,notifications:false,minigames:true,profanityFilter:false,autoSave:true,highContrast:false,reducedMotion:false},
    yearlySnapshots:[],
  };
  if(country.royalFamily && familyWealthTier==='wealthy' && rng.chance(.015)){ state.flags.royalBirth=true; state.flags.royalRank=1; state.timeline.push({id:'royal-birth',year:2026,age:0,category:'family',importance:3,text:'You were born into a minor branch of the royal household.'}); }
  state.rngCounter=rng.counter();
  return state;
}
