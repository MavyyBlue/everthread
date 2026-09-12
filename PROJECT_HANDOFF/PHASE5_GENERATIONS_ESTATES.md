# Everthread — Phase 5 Generations / Estates

## Authority

Phase 5 extends the existing GenerationSystem + EstateSystem + NPC family graph. It must not create a second inheritance database or bypass the one authoritative `GameState`. Existing three-/eight-generation behavior, specific-bequest guarantees, protected minor trusts, spouse/child estate shares, and anti-duplication rules remain compatibility requirements.

## Phase 5A — Green foundation

Already present on the Run #91 certified baseline:

- multi-heir residuary settlement;
- asset-specific property/business/collectible bequests;
- surviving-spouse default/explicit shares;
- debt-first settlement and fairness-driven liquidation;
- offscreen sibling inheritance;
- minor player/NPC inheritance trusts;
- widowhood/bereavement continuity;
- adult/minor descendant continuation with real NPC biography transfer.

Regression authorities: Estate Planning 46/46 and Family Continuity 18/18.

## Phase 5B — Estate administration — CI Green

Purpose: add meaningful estate friction without turning Everthread into a real-world legal simulator or breaking existing family-asset guarantees.

Implementation rules:

- `src/data/estateRules.ts` owns fictional gameplay profiles. Country fiscal context selects one of four bands; values are explicitly not real tax/legal claims.
- Small/modest estates receive an administration allowance. Above it, administration costs use a bounded percentage and cap.
- A separate levy allowance protects ordinary estates; levy applies only to the remainder after non-mortgage debt and administration.
- Mortgage debt remains attached to retained property and is already reflected in estate equity, so it is not charged again as an unsecured estate obligation.
- Settlement order protects player-authored intent: cash → unassigned transferable assets → liquid investments → specifically named bequests. A named bequest can still be sold when no other value can satisfy obligations.
- Heir allocation, offscreen sibling wealth, selected-descendant inheritance, and minor trusts all receive post-obligation value from the same `buildEstatePlan()` authority.
- No new persisted fields; save schema stays 9. Preview remains read-only and consumes no RNG.

Dedicated `estateAdministrationRegression.ts` passes 63/63, including five sequential no-income generation handoffs that require inherited wealth to decline rather than duplicate and validate state invariants after each continuation. GitHub Actions Run #92 reproduced canonical preflight and deployment; Phase 5B is CI Green.

## Phase 5C — NPC-owned assets/businesses — CI Green

Purpose: let important family wealth exist outside the controlled protagonist as real, persistent ownership without turning every background NPC into a player-sized finance simulation.

Implementation rules:

- `src/types/npcAssets.ts` owns lean persisted NPC property/business holding contracts; `src/data/npcAssetRules.ts` owns bounded portfolio limits. Full player Property/Business objects are not embedded into every NPC.
- Save schema advances to 10. v9 aggregate `NpcLifeState.finance.propertyValue` migrates deterministically into one stable explicit holding where needed, preserving net value and consuming no player RNG.
- `npc.wealth` is liquid wealth. `life.finance.propertyValue` is a compatibility/UI projection of explicit property holdings, not an independent wealth authority.
- Meaningful/full-tier NPCs may organically acquire a small number of holdings. Background-tier NPCs may retain/progress existing or inherited holdings but cannot seed new explicit property at creation or organically grow new portfolios through their coarse simulation cadence.
- NPC asset progression uses a dedicated deterministic substream so property/business consideration cannot reshuffle unrelated player/NPC life outcomes.
- NPC property mortgages live inside the holding and remain included once in total NPC debt. Net-worth and estate calculations subtract mortgage/unsecured obligations without double charging.
- Player estates transfer retained property/businesses to offscreen adult NPC heirs as actual holdings. Minor NPC heirs hold those assets in a protected trust until adulthood.
- NPC death settlement can transfer retained holdings to adult/minor NPC children or the player while preserving the established 55% NPC-estate distribution tuning. Source holdings are cleared after settlement, so repeated settlement cannot duplicate value.
- Descendant continuation converts the selected NPC's own holdings into playable Property/Business state, reconstructs mortgages once, preserves only the remaining unsecured debt as personal debt, and merges those assets with the parent estate by stable ID.
- Adult portfolios and minor inheritance trusts are both bounded to 6 properties / 4 businesses. Overflow liquidates to represented equity/value rather than silently deleting value or permitting unbounded save growth.
- People detail sheets expose liquid wealth, named property/business holdings, debt, and reconciled estimated net worth.

Dedicated `npcAssetOwnershipRegression.ts` passes 82/82 across migration, RNG neutrality, portfolio projection/accounting, creation/background-tier bounds, stable ownership IDs, adult/minor player and NPC inheritance, protected-trust caps and overflow reconciliation, mortgage transfer, idempotent death settlement, descendant continuation, cap liquidation, preview read-only behavior, a 600-background-NPC + 3,000-entry 12-year scale fixture, and state validation. `timelineScalingRegression.ts` passed 10/10 on the Phase 5C deployment: authoritative history remains complete while the Life page renders the newest 120 entries initially and reveals older entries in 120-entry increments. GitHub Actions Run #95 reproduced both TypeScript gates, the complete regression wall, 142-module production build, certified artifact creation, and Pages deployment on expanded commit `62e28aafb190f8b46d10b73fb6dd00985beb724d`. Phase 5C is CI Green.

Post-Run95 leisure testing found two presentation-only defects: the timeline component memoized by an in-place-mutated array reference, and capped 0/100 relationship interactions could lose VFX despite semantic deltas. Run #96 fixed both and is CI Green on expanded commit `3b58f04827ddc88a33c61b3cdf0d50f1e7584161`; Action VFX is 46/46 and Timeline Scaling is 11/11.

## Phase 5D — Broader family topology — predeployment candidate

Purpose: make large multi-generation families structurally truthful and legible without synthesizing filler relatives or turning every extended relative into an expensive fully simulated NPC.

Implementation rules:

- `FamilyTopologySystem` derives kinship from existing `parentIds` / `childIds` / current parent partnerships through indexed maps. It does not create NPCs and avoids all-pairs family comparison.
- Relationship taxonomy adds `aunt_uncle` and `cousin`; existing parent/child, grandparent/grandchild, sibling/half-sibling/step-sibling, stepparent, and niece/nephew relationships are reconciled from the same graph.
- Structural kinship can replace generic friendship/professional/enemy labels while preserving affinity/compatibility, but active romance and historical `ex` relationship types are not silently rewritten.
- People folders, Threadspace, profile/detail labels, generic family event selectors, delayed family-favor targets, and relevant special-career family targeting recognize the expanded kin taxonomy.
- Extended kin remain background-tier by default and do not automatically generate player timeline noise. Existing meaningful-relationship thresholds can still promote an individually close aunt/uncle/cousin to full simulation.
- Extended-family births can materialize the correct kin relationship without automatic full-tier promotion or automatic player timeline insertion.
- Descendant continuation resynchronizes topology after protagonist handoff, so kin labels transform correctly across generations without a second family database.
- Load repair enforces state invariants before topology derivation. Backfill is deterministic, consumes no gameplay RNG or runtime IDs, and requires no new persisted fields; save schema remains 10.

Dedicated `familyTopologyRegression.ts` passes 40/40 locally. The full established regression wall remains green, both TypeScript gates pass, and production build transforms 144 modules. An explicit 1,082-NPC extended-family benchmark (180 aunts/uncles + 900 cousins) synchronized topology in ~4.5 ms locally and advanced six years in ~362 ms; normal autonomy grew the cast to 1,182 with zero validation errors and no automatic full-tier promotion of extended kin. Run #96 remains authoritative until GitHub reproduces this candidate.

## Next after Phase 5D

Phase 5E should perform dynasty-scale validation and strengthen death → estate review → descendant continuation UX without creating a second estate or family truth. Multi-household custody/guardianship expansion remains deferred until a concrete gameplay need justifies additional persisted state.
