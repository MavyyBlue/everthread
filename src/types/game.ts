export type Id = string;
export type Percent = number;
export type Money = number;

export type Sex = 'female' | 'male' | 'intersex';
export type GenderIdentity = 'woman' | 'man' | 'nonbinary' | 'other';
export type Orientation = 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual' | 'asexual';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TimelineCategory =
  | 'birth' | 'family' | 'school' | 'relationship' | 'career' | 'money' | 'health' | 'crime'
  | 'legal' | 'fame' | 'asset' | 'business' | 'travel' | 'achievement' | 'death' | 'random';

export interface PrimaryStats {
  health: Percent;
  happiness: Percent;
  intelligence: Percent;
  appearance: Percent;
}

export interface SecondaryStats {
  athleticism: Percent;
  discipline: Percent;
  willpower: Percent;
  karma: number;
  reputation: Percent;
  stress: Percent;
  fertility: Percent;
  charisma: Percent;
  creativity: Percent;
  confidence: Percent;
  addictionSusceptibility: Percent;
  criminalNotoriety: Percent;
  academicPerformance: Percent;
  workPerformance: Percent;
}

export interface Talents {
  music: Percent;
  acting: Percent;
  athletics: Percent;
  business: Percent;
  crime: Percent;
  social: Percent;
  combat: Percent;
}

export interface AppearanceProfile {
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  facialHair?: string;
  accessories: string[];
}

export interface Character {
  id: Id;
  firstName: string;
  middleName?: string;
  lastName: string;
  sex: Sex;
  genderIdentity: GenderIdentity;
  orientation: Orientation;
  countryId: Id;
  city: string;
  birthYear: number;
  age: number;
  alive: boolean;
  causeOfDeath?: string;
  appearance: AppearanceProfile;
  stats: PrimaryStats;
  secondary: SecondaryStats;
  talents: Talents;
  birthCircumstance: string;
  familyWealthTier: 'poor' | 'working' | 'middle' | 'comfortable' | 'wealthy';
  traits: string[];
  specialTalents: string[];
}

export interface NpcMemory {
  id: Id;
  year: number;
  age: number;
  kind: string;
  sentiment: number;
  summary: string;
  permanent?: boolean;
}

export interface Npc {
  id: Id;
  firstName: string;
  lastName: string;
  age: number;
  alive: boolean;
  health: Percent;
  happiness: Percent;
  wealth: Money;
  careerId?: Id;
  countryId: Id;
  city: string;
  sexuality: Orientation;
  fertility: Percent;
  maritalStatus: 'single' | 'dating' | 'engaged' | 'married' | 'divorced' | 'widowed';
  traits: string[];
  hiddenOpinion: number;
  memories: NpcMemory[];
  parentIds: Id[];
  childIds: Id[];
  partnerId?: Id;
  famous?: boolean;
  imprisoned?: boolean;
}

export type RelationshipType =
  | 'parent' | 'stepparent' | 'grandparent' | 'sibling' | 'half_sibling' | 'stepsibling' | 'niece_nephew'
  | 'friend' | 'best_friend' | 'enemy' | 'coworker' | 'classmate' | 'boss' | 'teacher'
  | 'partner' | 'fiance' | 'spouse' | 'ex' | 'child' | 'grandchild';

export interface Relationship {
  id: Id;
  npcId: Id;
  type: RelationshipType;
  score: Percent;
  attraction: Percent;
  compatibility: Percent;
  yearsKnown: number;
  estranged?: boolean;
}

export interface TimelineEntry {
  id: Id;
  year: number;
  age: number;
  category: TimelineCategory;
  title?: string;
  text: string;
  importance: 1 | 2 | 3;
  moneyDelta?: Money;
  relationshipDelta?: number;
  npcIds?: Id[];
  achievementId?: Id;
  detail?: string;
}

export interface EducationRecord {
  stage: string;
  institution: string;
  programId?: Id;
  major?: string;
  startAge: number;
  endAge?: number;
  graduated: boolean;
  droppedOut: boolean;
  scholarship: boolean;
  performance: Percent;
}

export interface CareerRecord {
  jobId: Id;
  title: string;
  company: string;
  startAge: number;
  endAge?: number;
  salary: Money;
  performance: Percent;
  level: number;
}

export interface EmploymentState {
  current?: CareerRecord;
  history: CareerRecord[];
  partTimeJobIds: Id[];
  freelanceReputation: Percent;
  retired: boolean;
}

export interface Loan {
  id: Id;
  kind: 'student' | 'mortgage' | 'car' | 'personal';
  principal: Money;
  balance: Money;
  annualRate: number;
  annualPayment: Money;
  remainingYears: number;
  assetId?: Id;
}

export interface FinancesState {
  cash: Money;
  annualIncome: Money;
  annualExpenses: Money;
  taxesPaid: Money;
  liabilities: Loan[];
  lastYearSummary?: {
    income: Money;
    expenses: Money;
    taxes: Money;
    investmentReturn: Money;
    businessProfit: Money;
    netChange: Money;
  };
}

export interface PropertyAsset {
  id: Id;
  typeId: Id;
  name: string;
  location: string;
  purchasePrice: Money;
  marketValue: Money;
  condition: Percent;
  age: number;
  amenities: string[];
  mortgageId?: Id;
  rental?: {
    tenantId?: Id;
    annualRent: Money;
    reliability: Percent;
    occupied: boolean;
  };
}

export interface VehicleAsset {
  id: Id;
  typeId: Id;
  name: string;
  purchasePrice: Money;
  value: Money;
  age: number;
  condition: Percent;
  mileage: number;
  category: 'car' | 'motorcycle' | 'boat' | 'aircraft';
}

export interface CollectibleAsset {
  id: Id;
  itemId: Id;
  name: string;
  estimatedValue: Money;
  authenticity: Percent;
  condition: Percent;
  rarity: string;
}

export interface AssetState {
  properties: PropertyAsset[];
  vehicles: VehicleAsset[];
  collectibles: CollectibleAsset[];
}

export interface InvestmentPosition {
  securityId: Id;
  units: number;
  averageCost: number;
}

export interface InvestmentState {
  positions: InvestmentPosition[];
  prices: Record<Id, number>;
  marketRegime: 'bull' | 'neutral' | 'bear' | 'bubble' | 'crash';
  history: Record<Id, number[]>;
}

export interface Business {
  id: Id;
  industryId: Id;
  name: string;
  foundedAge: number;
  capital: Money;
  revenue: Money;
  expenses: Money;
  profit: Money;
  employees: number;
  demand: Percent;
  reputation: Percent;
  valuation: Money;
  productIds: Id[];
  priceIndex: number;
  marketingBudget: Money;
  compensationIndex: number;
  bankrupt: boolean;
}

export interface HealthCondition {
  id: Id;
  illnessId: Id;
  name: string;
  severity: Percent;
  diagnosedAge: number;
  chronic: boolean;
  treated: boolean;
}

export interface HealthState {
  conditions: HealthCondition[];
  fitness: Percent;
  wellness: Percent;
  addictions: Array<{ kind: string; severity: Percent; years: number; recovering: boolean }>;
}

export interface LegalState {
  criminalRecord: Array<{ crimeId: Id; age: number; convicted: boolean; sentenceYears?: number }>;
  investigationHeat: Percent;
  imprisoned: boolean;
  prisonSecurity?: 'juvenile' | 'minimum' | 'medium' | 'maximum';
  sentenceRemaining: number;
  paroleEligible: boolean;
}

export interface FameState {
  fame: Percent;
  publicReputation: Percent;
  followers: number;
  engagement: Percent;
  platforms: Record<string, number>;
  scandals: string[];
}

export interface SpecialCareerState {
  acting?: Record<string, number | string | boolean>;
  music?: Record<string, number | string | boolean>;
  sports?: Record<string, number | string | boolean>;
  combat?: Record<string, number | string | boolean>;
  politics?: Record<string, number | string | boolean>;
  royalty?: Record<string, number | string | boolean>;
  military?: Record<string, number | string | boolean>;
  crimeOrg?: Record<string, number | string | boolean>;
  modeling?: Record<string, number | string | boolean>;
  racing?: Record<string, number | string | boolean>;
  directing?: Record<string, number | string | boolean>;
  secretAgency?: Record<string, number | string | boolean>;
  commune?: Record<string, number | string | boolean>;
  casino?: Record<string, number | string | boolean>;
  zoo?: Record<string, number | string | boolean>;
  museum?: Record<string, number | string | boolean>;
}

export interface Pet {
  id: Id;
  variantId: Id;
  name: string;
  species: string;
  breed: string;
  age: number;
  health: Percent;
  happiness: Percent;
  craziness: Percent;
  relationship: Percent;
  alive: boolean;
}

export interface DelayedEvent {
  id: Id;
  eventId: Id;
  dueAge: number;
  payload?: Record<string, unknown>;
}

export interface PendingEvent {
  eventId: Id;
  title: string;
  description: string;
  choices: Array<{ id: Id; label: string }>;
  payload?: Record<string, unknown>;
}

export interface AchievementProgress {
  id: Id;
  completed: boolean;
  completedAge?: number;
  progress: number;
}

export interface ChallengeProgress {
  id: Id;
  completed: boolean;
  progress: number;
  activated: boolean;
}

export interface LegacyState {
  generation: number;
  totalFamilyWealth: Money;
  totalYearsSimulated: number;
  familyTreeNpcIds: Id[];
  accountCollectibleIds: Id[];
  completedLifeIds: Id[];
}

export interface CompletedLife {
  id: Id;
  generation?: number;
  character: Character;
  ageAtDeath: number;
  cause: string;
  netWorth: Money;
  career?: string;
  spouse?: string;
  children: number;
  fame: number;
  milestones: string[];
  epitaph: string;
  timeline: TimelineEntry[];
}

export interface SettingsState {
  theme: ThemeMode;
  accent: string;
  sound: boolean;
  haptics: boolean;
  animations: boolean;
  textScale: number;
  notifications: boolean;
  minigames: boolean;
  profanityFilter: boolean;
  autoSave: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface EconomyState {
  inflationIndex: number;
  housingIndex: number;
  salaryIndex: number;
  businessDemandIndex: number;
  lastInflationRate?: number;
  lastSalaryGrowthRate?: number;
  lastHousingGrowthRate?: number;
  year: number;
}


export interface TravelState {
  visitedCountries: Id[];
  visitedCities: string[];
  emigrations: number;
  licenses: { driving:boolean; boating:boolean; pilot:boolean };
}

export interface InheritanceState {
  will: Array<{ npcId: Id; percentage: number }>;
  inheritBusinesses: boolean;
  inheritProperties: boolean;
}

export interface FamilyPlanningState {
  pregnancy?: {
    partnerId: Id;
    conceivedAge: number;
    dueAge: number;
    expectedChildren: number;
  };
}

export interface ActionLedgerState {
  age: number;
  uses: Record<string, number>;
  lastUsedAge: Record<string, number>;
  revision: number;
}

export interface GameFlags {
  sandbox: boolean;
  rewindEnabled: boolean;
  debugEnabled: boolean;
  [key: string]: boolean | number | string;
}

export interface GameState {
  saveVersion: number;
  slotId: string;
  seed: string;
  rngCounter: number;
  idCounter: number;
  currentYear: number;
  character: Character;
  npcs: Record<Id, Npc>;
  relationships: Relationship[];
  education: EducationRecord[];
  employment: EmploymentState;
  finances: FinancesState;
  assets: AssetState;
  investments: InvestmentState;
  businesses: Business[];
  health: HealthState;
  legal: LegalState;
  fame: FameState;
  specialCareers: SpecialCareerState;
  pets: Pet[];
  timeline: TimelineEntry[];
  delayedEvents: DelayedEvent[];
  pendingEvent?: PendingEvent;
  recentEventIds: Id[];
  achievements: AchievementProgress[];
  challenges: ChallengeProgress[];
  legacy: LegacyState;
  completedLives: CompletedLife[];
  travel: TravelState;
  inheritance: InheritanceState;
  familyPlanning: FamilyPlanningState;
  actionLedger: ActionLedgerState;
  economy: EconomyState;
  flags: GameFlags;
  settings: SettingsState;
  yearlySnapshots: Array<{ age: number; state: string }>;
  lastSavedAt?: string;
}

export interface EngineMessage {
  text: string;
  category?: TimelineCategory;
  importance?: 1 | 2 | 3;
}

export interface EngineResult {
  success: boolean;
  messages: EngineMessage[];
  events?: PendingEvent[];
  stateChanges?: string[];
}

export interface ChoiceEffect {
  stats?: Partial<PrimaryStats>;
  secondary?: Partial<SecondaryStats>;
  money?: number;
  relationship?: { npcSelector?: string; delta: number; setType?: RelationshipType };
  fame?: number;
  reputation?: number;
  flags?: Record<string, boolean | number | string>;
  schedule?: { eventId: Id; years: number; npcSelector?: string; requiredRelationshipTypes?: RelationshipType[] };
  health?: number;
  legalHeat?: number;
}

export interface EventChoice {
  id: Id;
  label: string;
  effects?: ChoiceEffect;
  outcomes?: Array<{ weight: number; text: string; effects?: ChoiceEffect }>;
}

export interface GameEventDefinition {
  id: Id;
  category: string;
  title: string;
  descriptions: string[];
  minAge: number;
  maxAge: number;
  countries?: Id[];
  requiredFlags?: string[];
  forbiddenFlags?: string[];
  probability: number;
  cooldown: number;
  tags: string[];
  choices: EventChoice[];
}
