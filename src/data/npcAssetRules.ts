/**
 * Bounded NPC asset rules. NPC portfolios are intentionally leaner than the
 * controlled player's full property/business state so long dynasties remain
 * affordable to save and simulate.
 */
export const NPC_ASSET_LIMITS={
  organicProperties:2,
  organicBusinesses:2,
  portfolioProperties:6,
  portfolioBusinesses:4,
  simulatedPropertyValue:25_000_000,
  simulatedBusinessValue:50_000_000,
} as const;
