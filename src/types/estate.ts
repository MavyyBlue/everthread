import type { Id } from './game';

export type EstateAssetKind = 'property' | 'business' | 'collectible';

export interface EstateAssetBequest {
  kind: EstateAssetKind;
  assetId: Id;
  beneficiaryNpcId: Id;
}

declare module './game' {
  interface InheritanceState {
    assetBequests?: EstateAssetBequest[];
  }
}
