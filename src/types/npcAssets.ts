import type { Id, Money, Percent } from './game';

export type NpcAssetOrigin = 'generated' | 'purchased' | 'inherited';

export interface NpcPropertyHolding {
  id: Id;
  typeId: Id;
  name: string;
  location: string;
  purchasePrice: Money;
  marketValue: Money;
  mortgageBalance: Money;
  condition: Percent;
  propertyAge: number;
  acquiredAge: number;
  origin: NpcAssetOrigin;
  inheritedFromNpcId?: Id;
}

export interface NpcBusinessHolding {
  id: Id;
  industryId: Id;
  name: string;
  foundedYear: number;
  acquiredAge: number;
  valuation: Money;
  annualProfit: Money;
  employees: number;
  reputation: Percent;
  active: boolean;
  origin: NpcAssetOrigin;
  inheritedFromNpcId?: Id;
}

export interface NpcAssetPortfolio {
  properties: NpcPropertyHolding[];
  businesses: NpcBusinessHolding[];
}

declare module './game' {
  interface Npc {
    assetPortfolio?: NpcAssetPortfolio;
  }
}
