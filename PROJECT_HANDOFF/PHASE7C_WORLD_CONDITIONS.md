# Everthread — Phase 7C Persistent World Conditions

## Status

**Local candidate; GitHub Actions certification pending.**

Built from newest certified repository source **Run #121 / `c163e8d121c75465ec17d17aa54dd725edb05128`** (docs-only). Certified gameplay baseline remains **Run #120 / `4dd4378ec8986056fc3348dec5b2c6b1594b236b`** until this candidate clears canonical CI. Package remains `0.12.0`. Certified save schema is 13; this candidate advances to **14**.

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

Phase 7C advances schema **13 → 14**. Migration creates empty world-condition state for old saves and no retroactive history. It must remain deterministic, idempotent, RNG-neutral, runtime-ID-neutral, rewind-safe, import/export safe, and descendant-safe. `CURRENT_SAVE_VERSION` remains the shared version authority.

## Local QA

`phase7CWorldConditionRegression.ts`: **42/42**.

Coverage includes content/pool isolation, migration, deterministic generation, century-scale bounds, cooldown/exclusive-group behavior, expiry/history, country/global relevance through emigration/return, UI cards, Economy/Business/Property/Investment/Travel/Fame/Finance effects, unchanged downstream RNG draw shapes, save round-trip, queue isolation, exact country scope, and invariants.

Both TypeScript gates PASS. Complete regression wall PASS. Integrated Long-Life **105/105**. Phase 7A **36/36**. Phase 7B1 **33/33**. Phase 7B2 **35/35**. Phase 7B3 **36/36**. Production build PASS at **170 modules**. GitHub Actions remains certification authority.

## Phase closeout rule

Phase 7 is **not closed merely because local 7C is green**. Required sequence: certify/deploy 7C → refresh player feedback → synchronize Phase 7 closeout docs → certify that closeout. Only then is Phase 7 closed.

After Phase 7 closes, **stop implementation planning**. Do not invent a Phase 8 or queue another feature slice. Mavyy and Yuki brainstorm the future direction together first.
