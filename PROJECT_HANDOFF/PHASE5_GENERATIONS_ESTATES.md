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

## Phase 5B — Estate administration candidate

Purpose: add meaningful estate friction without turning Everthread into a real-world legal simulator or breaking existing family-asset guarantees.

Implementation rules:

- `src/data/estateRules.ts` owns fictional gameplay profiles. Country fiscal context selects one of four bands; values are explicitly not real tax/legal claims.
- Small/modest estates receive an administration allowance. Above it, administration costs use a bounded percentage and cap.
- A separate levy allowance protects ordinary estates; levy applies only to the remainder after non-mortgage debt and administration.
- Mortgage debt remains attached to retained property and is already reflected in estate equity, so it is not charged again as an unsecured estate obligation.
- Settlement order protects player-authored intent: cash → unassigned transferable assets → liquid investments → specifically named bequests. A named bequest can still be sold when no other value can satisfy obligations.
- Heir allocation, offscreen sibling wealth, selected-descendant inheritance, and minor trusts all receive post-obligation value from the same `buildEstatePlan()` authority.
- No new persisted fields; save schema stays 9. Preview remains read-only and consumes no RNG.

Dedicated `estateAdministrationRegression.ts` currently passes 63/63 locally, including five sequential no-income generation handoffs that require inherited wealth to decline rather than duplicate and validate state invariants after each continuation.

Predeployment sanity also completed two 100-life bulk batches (mixed and family policy) with zero anomalies and zero forced terminal deaths. Phase 5B is not CI Green until GitHub reproduces the canonical preflight and deployment.

## Next after Phase 5B

Phase 5C should deepen individually addressable NPC-owned assets/businesses so family wealth can exist outside the controlled protagonist without relying only on aggregate NPC property value. Preserve simulation tiers and avoid forcing every background NPC into expensive full asset accounting.
