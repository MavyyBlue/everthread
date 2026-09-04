import type { Id, Money, Percent } from './game';

export interface JobDefinition {
  id: Id;
  title: string;
  industry: string;
  salaryRange: [Money, Money];
  educationRequirement: string;
  experienceRequirement: number;
  statRequirements: Partial<Record<'intelligence' | 'appearance' | 'athleticism' | 'charisma' | 'creativity' | 'discipline', number>>;
  promotionPath?: Id;
  famePotential: Percent;
  stress: Percent;
  healthRisk: Percent;
  minAge: number;
}

export interface EducationProgram {
  id: Id;
  name: string;
  kind: string;
  years: number;
  tuition: Money;
  minIntelligence: number;
  careerTags: string[];
}

export interface IllnessDefinition {
  id: Id;
  name: string;
  category: 'common' | 'chronic' | 'genetic' | 'infectious' | 'mental_wellness' | 'injury' | 'age_related';
  minAge: number;
  prevalence: number;
  severityRange: [number, number];
  healthDrain: number;
  mortalityFactor: number;
  chronicChance: number;
  treatmentCost: Money;
  treatmentEffectiveness: number;
}

export interface CountryDefinition {
  id: Id;
  name: string;
  cities: string[];
  currency: string;
  taxRate: number;
  universityCost: Money;
  healthcareModel: string;
  salaryMultiplier: number;
  lifeExpectancyModifier: number;
  crimeModifier: number;
  royalFamily: boolean;
  militaryBranches: string[];
}

export interface PropertyDefinition {
  id: Id;
  name: string;
  basePrice: Money;
  upkeepRate: number;
  appreciationVolatility: number;
  amenities: string[];
}

export interface PetVariantDefinition {
  id: Id;
  species: string;
  breed: string;
  price: Money;
  lifespan: [number, number];
  activityNeed: Percent;
  legalTier: 'common' | 'restricted';
}

export interface CrimeDefinition {
  id: Id;
  name: string;
  minAge: number;
  rewardRange: [Money, Money];
  baseSuccess: number;
  detectionChance: number;
  injuryChance: number;
  sentenceRange: [number, number];
  notoriety: number;
}

export interface SecurityDefinition {
  id: Id;
  ticker: string;
  name: string;
  type: 'stock' | 'bond' | 'fund' | 'speculative';
  basePrice: number;
  volatility: number;
  drift: number;
}

export interface BusinessIndustryDefinition {
  id: Id;
  name: string;
  startupCapital: Money;
  marginRange: [number, number];
  volatility: number;
  productNames: string[];
}

export interface AchievementDefinition {
  id: Id;
  name: string;
  description: string;
  category: string;
  target: number;
  metric: string;
  hidden?: boolean;
}

export interface ChallengeDefinition {
  id: Id;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  requirements: Array<{ metric: string; target: number; comparator?: '>=' | '<=' | '==' }>;
  reward: string;
}
