# Everthread — Development Status

Last updated: 2026-09-04  
Current build line: 0.9.4 pre-release  
Save schema: 4

## Product direction

Everthread: Life Unwritten is an original, mobile-first procedural life simulator. The central interaction is Age Up: one year advances the world, connected systems process in a deterministic order, events may interrupt for a decision, consequences persist, and death can hand the family thread to a descendant.

The project is intentionally data-driven. React renders and requests actions; simulation systems own critical mutations. One `GameState` is the authoritative runtime/save state.

## Current architecture

- `src/engine/GameEngine.ts` — public action façade used by UI.
- `src/types/` — authoritative state and content contracts.
- `src/core/` — RNG, math, IDs, invariant enforcement.
- `src/systems/` — isolated simulation domains.
- `src/data/` — external content definitions for events, jobs, education, countries, health, crime, assets, achievements, and challenges.
- `src/services/SaveSystem.ts` — IndexedDB/local fallback, schema migration, JSON import/export.
- `src/screens/` and `src/components/` — mobile UI only; critical state is not intended to be mutated here.
- `src/tests/` — deterministic regression suite, content audit, and multi-life simulation harness.
- `src/minigames/` — reusable minigame contract/framework; full game implementations remain incomplete.

## Implemented foundations

These are functioning systems rather than navigation placeholders, though some still need additional depth.

- Seeded character generation and advanced starting-stat controls.
- Centralized primary/secondary stats and talents.
- Ordered one-year Age Up transaction with double-activation lock.
- Event interruption: Age Up pauses final death resolution until a decision is resolved.
- Data-driven event conditions, weighted outcomes, effects, rare-event handling, target-aware context payloads, and delayed consequences.
- Mobile life timeline and death summary.
- Persistent NPC records, relationship scores, memories, personality response modifiers, NPC aging, health drift, real career progression, linked autonomous partnerships, marriage/divorce/widowhood, bounded autonomous children, inheritance, and death.
- Dating, partner/fiancé/spouse/ex states, marriage/divorce/reconciliation, biological children and adoption.
- Automatic childhood schooling plus post-secondary programs, tuition, scholarships, student debt, graduation, dropout, and academic performance.
- 51 standard-career ladders / 306 job positions with requirements, interviews, salary, performance, promotion, termination, raises, retirement, and freelance gigs.
- Annual finances, tax, baseline living costs, dependent/pet/asset costs, loans, net worth, and yearly summaries.
- Dynamic bounded economy for cost, wage, housing, business-demand, and market-cycle pressure.
- Fictional investment market with stocks, funds, bonds, speculative assets, regimes, buy/sell, and portfolio history.
- Property purchase, mortgage, appreciation/condition, renovation, sale, and basic rental flow.
- Vehicles, boats/aircraft definitions, collectibles, and purchase/condition/value state.
- Business founding, products, employees, demand, reputation, annual P&L, valuation, growth, and bankruptcy state.
- Health conditions, treatment, wellness, fitness, addiction/recovery state.
- Abstract crime, detection, legal cases, lawyer tiers, conviction, prison, prison activities, appeal, and abstract escape outcome.
- Fame/social posting/publicity actions.
- Pets with annual aging/health and interactions.
- Travel, emigration, visited locations, and license checks.
- Acting, music, sports, combat sports, military, politics, royalty, modeling, racing, directing, organized-crime, museum, zoo, fictional intelligence agency, commune, and casino state tracks.
- Achievements, challenges, progress UI, past-life cemetery, legacy statistics, death records, and descendant continuation.
- Rewind snapshots for rewind-enabled saves.
- Theme, accent, text scaling, reduced motion, high contrast, sound, haptics, optional notification preference, profanity preference, minigame preference, and autosave preference.
- PWA manifest/service worker scaffolding and app-background autosave.
- JSON save export/import with validation and schema migration.
- Sandbox/debug surface for age, cash, forced death, RNG inspection, and rewind snapshots.

## Verification milestone

Added in the current hardening pass:

- Framework-independent deterministic regression suite: 32 passing tests.
- Multi-life simulation harness with `full` and faster `bulk` modes, independent aspiration profiles, six behavior policies, and wealth-percentile reporting.
- 1,000-life bulk run completed with zero detected structural state anomalies.
- Content audit executable from source data.
- Event selection refactored from scanning/rolling all 670 definitions every year to category-indexed routine selection plus a small exact-probability rare-event pass.
- Adult dating age bounds fixed.
- Parenting now rejects a biological path when either partner is below the game's minimum parenting age.
- Descendant inheritance no longer duplicates retained estate assets as full cash value; inherited mortgages remain attached to retained properties.
- Descendant relationship rebuilding now preserves parent/sibling/spouse/child structure instead of converting nearly everyone into a generic friend.
- Economy indices changed to bounded relative conditions so century-long lives do not destroy fixed game-currency milestones through nominal inflation.
- Existing standard-career wages now move with the same wage index used by newly hired workers.
- Achievement evaluation reduced from duplicate annual evaluation and optimized with indexed progress / per-evaluation metric caching.
- Multi-heir estate settlement now normalizes living beneficiaries, pays non-mortgage estate debts, divides investments proportionally, allocates retained businesses/properties/collectibles against heir entitlements, and sells indivisible assets when retaining them would badly violate the estate split.
- NPC heirs receive their offscreen estate value instead of the controlled descendant silently receiving every retained asset.
- Continued adult descendants preserve an established standard career, spouse/partner, children, grandchildren, grandparents, siblings/half-siblings and selected friendship context where the persistent NPC graph supports it.
- Wealthy NPC parents can now leave inheritance directly to the player character; lifetime inheritance and inheritance count are tracked for achievements/diagnostics.
- Investment lifetime contributions/withdrawals and current cost basis/gain are tracked for balance analysis.
- Long-run fictional security drift was recalibrated for the bounded relative economy; volatility, bubbles and crashes remain while average real compounding is lower.
- Annual finances now include modest income-scaled discretionary lifestyle costs so high earners do not unrealistically bank every unspent salary dollar.
- Three-generation continuation and wealth-source reconciliation are covered by regression tests.

### Latest 1,000-life balance samples

Neutral-policy sample after market/lifestyle calibration:

- Average / median lifespan: 79.4 / 82
- Average / median net worth: 1,280,720 / 686,454
- Wealth p10 / p25 / p75 / p90 / p99: 45 / 183,514 / 1,672,075 / 3,104,409 / 8,001,100
- Millionaire ending net worth: 41.1%
- Marriage frequency: 52.1%
- Average children: 0.55
- Any crime / conviction: 6.8% / 6.8%
- Fame 25+: 5.8%
- Average ending wealth sources: 762,211 cash / 120,700 property equity / 384,676 investments / 14,896 businesses / 1,762 other debt
- Average investing: 128,290 lifetime contributions / 127,285 held cost basis / 257,391 held unrealized gain
- Inheritance: 95.0% of lives receive some inheritance / 133,003 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

Mixed-policy sample:

- Average / median lifespan: 79.0 / 82
- Average / median net worth: 1,439,449 / 853,976
- Wealth p10 / p25 / p75 / p90 / p99: 6,664 / 251,163 / 1,833,612 / 3,428,529 / 8,361,194
- Millionaire ending net worth: 45.6%
- Marriage frequency: 55.0%
- Average children: 0.70
- Average ending wealth sources: 819,488 cash / 125,593 property equity / 464,355 investments / 31,751 businesses / 1,738 other debt
- Average investing: 160,502 lifetime contributions / 158,935 held cost basis / 305,420 held unrealized gain
- Inheritance: 94.6% of lives / 132,856 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

The diagnostic pass showed that the previous wealth distortion was primarily excessive long-run investment gain, not inheritance. On the same neutral seeds, average held investment gain fell from roughly 1.54M before calibration to roughly 257k after calibration. Ending cash remains high because the headless policies still use fewer optional consumption activities than a human player; avoid further core-economy tuning until richer lifestyle behavior and player data exist.

## Partially complete / needs deeper implementation

### NPC simulation

Close-family autonomous simulation is now materially deeper: NPCs can hold real careers, promote/lose jobs/retire, form linked partnerships, marry/divorce/become widowed, have bounded autonomous children, accumulate wealth, and leave inheritance. Player romantic partners are protected from autonomous matchmaking and malformed partner links are checked by invariants. Still needed:

- Better household moves, education progression, crime, fame, illness, imprisonment, and richer wealth behavior.
- Hidden opinions/memories influencing more autonomous decisions and event eligibility.
- More nuanced fertility, relationship compatibility, blended-family formation, and adoption.
- Performance validation across very large multi-generation family trees.

### Generations and inheritance

The latest pass now performs multi-heir estate settlement, proportional investment division, deterministic indivisible-asset allocation/sale, offscreen sibling inheritance, and preservation of established adult descendant careers/spouses/children plus deeper family derivation. Still needed:

- Asset-specific wills rather than percentage-only child beneficiaries.
- Estate taxes/administration costs using fictionalized country rules.
- NPC-owned property/business state rather than representing offscreen inherited assets only as NPC wealth.
- Autonomous descendant education/legal/health histories detailed enough to transfer directly instead of being inferred or reset.
- Aunt/uncle/cousin relationship types if the relationship model is expanded beyond the current supported taxonomy.
- Large-family performance validation across many sequential generations.

### Finance/debt

Loans, mortgage underwriting, annual shortfall debt, foreclosure, bankruptcy and a five-year post-bankruptcy mortgage lock now work as engine systems. Remaining depth:

- Car loans and optional personal-loan acquisition UI.
- Repossession for financed vehicles.
- Richer missed-payment / creditworthiness state instead of the current mortgage-miss counter.
- Voluntary bankruptcy UI and longer recovery consequences.
- Financial-hardship event chains and creditor/household consequences.
- More nuanced affordability rules across countries and household structures.

### Education / school social life

Core progression works. Missing or shallow:

- Persistent classmate/teacher/principal rosters.
- Clubs, student organizations, school sports, and original social groups.
- School disciplinary events and richer scholarship/admissions flows.
- Country-specific stage variation beyond current simplified common progression.

### Workplace

Boss/coworker concepts are not yet a full persistent workplace graph. Needed:

- Generated boss/coworkers tied to the job.
- Workplace-specific interactions and memories.
- Layoff, office feud, romance, reporting, rumor, lawsuit, bonus, and demotion consequences integrated with persistent coworkers.
- Multiple part-time jobs with hour limits.

### Special careers

The state tracks and basic actions are real, but most special paths are not yet at the specification's intended depth. Acting, music, sports, combat, politics, military, royalty, modeling, racing, directing, organized crime and specialized organizations need dedicated content/events, progression gates, contracts, rivals/teams/casts/staff, retirement/end states, and richer mobile screens.

### Minigames

Only the reusable framework exists. Full touch/keyboard/skippable implementations are still needed for driving, flight, prison escape, deployment, combat, racing, acting, and sports challenges.

### Events / consequences

679 event definitions exist and routine selection is efficient. The first five multi-year consequence chains now preserve exact NPC/origin-age context. Remaining work:

- Expand delayed consequences across parenting, crime/legal history, property, business, school, and special careers.
- Event cooldown currently follows recent-event history rather than storing an exact last-trigger year.
- Convert more existing relationship events to pre-bind specific persistent NPCs.
- National/world event layer remains shallow.
- More special-career, business, legal, prison, property, parenting and old-age follow-ups are needed.

### Mobile / accessibility / PWA QA

The shell is mobile-first and has safe-area CSS/accessibility settings, but final device QA has not been completed for all target widths (360/390/412/430px), browser screen readers, keyboard-only use, installability, offline cache upgrades, iOS standalone behavior, and Android standalone behavior.

## Known architecture / quality issues

1. Exact seeded replay now includes state-scoped runtime IDs and has a 50-year serialization regression. Remaining replay risk is future code introducing wall-clock/random state outside the seeded systems; keep the replay test mandatory.
2. Relationship milestone counters such as marriages are partly updated by `GameEngine` rather than entirely inside the owning system. Move these into domain actions so headless callers cannot bypass account metrics.
3. Simulation policies are separated and wealth-source diagnostics are available. Neutral and mixed populations should remain the balance baseline; do not tune core costs around a headless bot that still underuses optional lifestyle purchases.
4. Bulk simulation suppresses achievement/challenge evaluation and truncates timeline history intentionally for performance. Full-mode runs remain the correctness reference.
5. Save schema migration currently covers versions 1→4. Every future persisted state addition needs an explicit default/migration path.
6. No runtime error boundary / last-known-good transaction backup exists yet around every important action. IndexedDB persistence is versioned, but crash-safe transactional recovery needs hardening.

## Save schema history

### Version 1

Initial centralized life state.

### Version 2

Added travel history and license state.

### Version 3

Added inheritance configuration and rewind snapshots; migration fills missing achievements/challenges/completed lives/special-career/flag structures.

### Version 4 — current

Added persisted `idCounter` for deterministic state-scoped runtime IDs. Migration initializes a deterministic post-legacy counter and rewind restores migrate older snapshot payloads before use.

Next schema change should only occur when a new persisted field cannot be safely represented as an optional/defaulted version-4 field.

## Next development sequence

1. Build persistent school and workplace rosters with teacher/classmate/boss/coworker memories and target-aware event hooks.
2. Expand delayed consequences into parenting, crime/legal, property, business and special-career content.
3. Add richer autonomous descendant education, health, legal and household histories so generation handoffs preserve more than career/family state.
4. Add asset-specific wills plus fictionalized estate administration/tax rules without breaking the current multi-heir settlement.
5. Deepen special-career modules one family at a time without replacing working core systems.
6. Implement minigames through the existing framework.
7. Perform target-device mobile/accessibility/PWA QA.
8. Add crash-safe last-known-good transaction recovery around major engine actions.
9. Expand regional names substantially and verify long-dynasty repetition rates.
10. Run save-migration, large-family, full-mode and 10k/100k bulk simulation gates before release labeling.
