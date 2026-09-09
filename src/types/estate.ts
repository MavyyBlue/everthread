import type { Business, CollectibleAsset, Id, InvestmentPosition, Loan, PropertyAsset } from './game';

export type EstateAssetKind = 'property' | 'business' | 'collectible';
export type EstateHeirRole = 'spouse' | 'child';

export interface EstateAssetBequest {
  kind: EstateAssetKind;
  assetId: Id;
  beneficiaryNpcId: Id;
}

export interface EstateTrustState {
  releaseAge: number;
  createdAge: number;
  cash: number;
  properties: PropertyAsset[];
  businesses: Business[];
  collectibles: CollectibleAsset[];
  investments: InvestmentPosition[];
  liabilities: Loan[];
  inheritanceValue: number;
}

export interface NpcInheritanceTrustState {
  releaseAge: number;
  value: number;
}

declare module './game' {
  interface InheritanceState {
    assetBequests?: EstateAssetBequest[];
    trust?: EstateTrustState;
  }
  interface Npc {
    inheritanceTrust?: NpcInheritanceTrustState;
  }
}
