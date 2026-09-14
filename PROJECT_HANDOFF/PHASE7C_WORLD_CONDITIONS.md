# Everthread — Phase 7C Persistent World Conditions

## Status

**CI Green, certified, and deployed in GitHub Actions Run #122.**

Certification evidence:
- Expanded source: `0770106f52eea3182e86d120fa38c6b90be589e4`
- Source SHA-256: `68e4de3efd82b607323dd30077c083712caaa2fad06016a5dd63bce886337338`
- Dependency SHA-256: `17bbe76f88a9e07edafce170006116f5f23c5ff2c4b9e550d88191e7a617bb13`
- Package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`
- Certified artifact: `10330720998`, digest `b51b536835184ad4944631cfe73591cc9964f8d1ec6350c2f06e74220aab61d7`
- Pages artifact: `10330661334`, digest `03c1a3d1229797859118a26d3a1020638e070e6effc561d20c0f13d0bd720b6e`
- Canonical preflight: 4/4 Green; production build: 170 modules; Pages deployment: success.

Certified by GitHub Actions **Run #122** (`34797847276`) on expanded source **`0770106f52eea3182e86d120fa38c6b90be589e4`**, imported from upload wrapper `60e5646c274cd36024a778a93a1b8c1af3a401c5`. Package remains `0.12.0`; certified save schema is **14**.

## Goal

Make the wider world persist across years and materially shape the player’s life without creating a second economy, a second event scheduler, or hidden outcome authority. Conditions are context that existing systems consume, not replacement simulation state.

## Ownership

- `WorldConditionSystem` owns active/resolved condition lifecycle, exact scope/country, duration, intensity, cooldown/start bookkeeping, deterministic annual selection/expiry, and modifier projection.
- `EconomySystem` continues to own inflation/salary/housing/business-demand indices.
- Career, Business, Property, Investment, Travel, Fame, and Finance continue to own their existing outcomes/records.
- `ConsequenceSystem` remains the only delayed-consequence scheduler. Phase 7C creates no parallel queue and does not write `pendingEvent`.
- Life UI is read-only projection; it never mutates condition state.

## Data / content

Seven definitions in `src/data/worldConditions.ts`, all outside random `GameEventDefinition` selection:

1. Growth Wave — country economic expansion.
2. Economic Slowdown — country economic contraction.
3. Cost Surge — country living/inflation pressure.
4. Housing Squeeze — country housing pressure.
5. Travel Disruption — global mobility cost shock.
6. Media Frenzy — global attention/publicity environment.
7. Market Jitters — global investment volatility/drift pressure.

Ordinary random events remain **691**. Phase 7B systemic stories remain **15**. Older dedicated special-career stories remain **18**.

## Durable state / bounds

`GameState.worldConditions` contains:

- `active`: max **4**;
- `history`: max **48** resolved entries;
- `lastStartedYearByDefinition`: durable cooldown bookkeeping.

Each active record stores only stable ID, definition ID, scope, optional exact country ID, start/end year, and intensity. Definitions contain descriptions/effects; no copied economic truth lives in state.

Country conditions remain attached to their origin country. Emigration does not delete them; they stop applying when the player is elsewhere. Returning before expiry makes them relevant again. Global conditions apply regardless of country.

## Determinism

Annual world-condition selection uses a dedicated deterministic stream derived from seed/current year/current country. It does **not** consume or advance `state.rngCounter`. Existing system RNG draw shapes are preserved. Starts are bounded to at most one new condition per year, respect exclusive groups and durable cooldowns, and only allocate runtime IDs when a condition/timeline record is actually emitted.

## System effects

Modifiers are bounded projections, not direct ownership:

- economy: inflation, salary, housing, business-demand growth pressure;
- career: application score and bounded layoff pressure;
- business/property: downstream via existing demand/housing indices;
- investment: drift/volatility modifiers;
- travel: trip-cost multiplier;
- fame: organic follower growth, scandal chance, publicity pay;
- finance: ordinary household living-cost multiplier.

Do not let world conditions directly grant jobs, fire the player, set home values, mint investment returns, pay publicity cash, create debt, file bankruptcy, liquidate assets, or decide any other result already owned elsewhere.

## UI / inspectability

Life screen shows a compact **World around you** card containing only currently relevant conditions. Each row gives title, Global/country scope, Mild/Strong/Severe intensity, remaining years, description, and concise effect summary. Starts and expiry are also recorded in the normal bounded timeline under category `world`. No modal/event interruption is added.

## Save migration

Phase 7C advanced schema **13 → 14**. Migration creates empty world-condition state for old saves and no retroactive history. It is regression-protected as deterministic, idempotent, RNG-neutral, runtime-ID-neutral, rewind-safe, import/export safe, and descendant-safe. `CURRENT_SAVE_VERSION` remains the shared version authority.

## Certified QA

`phase7CWorldConditionRegression.ts`: **42/42**.

Coverage includes content/pool isolation, migration, deterministic generation, century-scale bounds, cooldown/exclusive-group behavior, expiry/history, country/global relevance through emigration/return, UI cards, Economy/Business/Property/Investment/Travel/Fame/Finance effects, unchanged downstream RNG draw shapes, save round-trip, queue isolation, exact country scope, and invariants.

Canonical Run #122: both TypeScript gates PASS; complete regression wall PASS; Integrated Long-Life **105/105**; Phase 7A **36/36**; Phase 7B1 **33/33**; Phase 7B2 **35/35**; Phase 7B3 **36/36**; Phase 7C **42/42**; production build PASS at **170 modules**; certified restore smoke and Pages deployment PASS.

## Phase closeout rule

Run #122 certified/deployed 7C and the final feedback review found all known reports resolved. This documentation-only closeout sync is the final repository synchronization step. Once it is CI-certified, **Phase 7 is closed in both gameplay and tracking state. Stop implementation planning.** Do not invent a Phase 8 or queue another feature slice; Mavyy and Yuki brainstorm the future direction together first.
