# Everthread — Development Status

Last updated: 2026-09-04  
Current build line: 0.9.8 pre-release  
Save schema: 6

## Product direction

Everthread: Life Unwritten is an original, mobile-first procedural life simulator. The central interaction is Age Up: one year advances the world, connected systems process in a deterministic order, events may interrupt for a decision, consequences persist, and death can hand the family thread to a descendant.

The project is intentionally data-driven. React renders and requests actions; simulation systems own critical mutations. One `GameState` is the authoritative runtime/save state.

## Current architecture

- `src/engine/GameEngine.ts` — public action façade used by UI.
- `src/types/` — authoritative state and content contracts.
- `src/core/` — RNG, math, deterministic IDs, invariant enforcement, and the centralized action-economy ledger/policies.
- `src/systems/` — isolated simulation domains.
- `src/data/` — external content definitions for events, jobs, education, countries, health, crime, assets, achievements, and challenges.
- `src/services/SaveSystem.ts` — IndexedDB/local fallback, schema migration, JSON import/export.
- `src/screens/` and `src/components/` — mobile UI only; critical state is not intended to be mutated here.
- `src/tests/` — deterministic regression suite, content audit, and multi-life simulation harness.
- `src/minigames/` — reusable minigame definitions plus interactive timing, sequence, grid-memory, and decision challenge components with character-skill accessibility resolution.

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


### First mobile playtest hardening (0.9.5)

The first live human playtest exposed same-year action exploits that headless simulations did not reproduce naturally. The 0.9.5 pass hardens those systems at the simulation layer rather than only disabling buttons in React.

- Standard-career applications now enforce actual relevant industry experience for non-entry roles; interview difficulty is no longer a substitute for experience.
- Starting a new job is limited to once per age after a successful hire, preventing same-year job hopping.
- `Work harder` and `Ask for raise` are each limited to one use per age, and standard-role compensation is bounded against the current market pay band so annual raises cannot compound into runaway values.
- Save schema v5 repairs obvious v4 runaway-compensation saves: impossible salary is normalized, an experience-inappropriate current role is corrected, and a clearly identifiable exploit-year cash windfall is reverted without touching ordinary saves or sandbox saves.
- Biological parenting now creates a one-year pregnancy state instead of an immediate birth. A successful conception resolves after the next Age Up, same-year retry spam is blocked, and sibling names avoid duplicates while unused regional names remain.
- Mobile money labels use compact notation for million-plus values so debug/sandbox/extreme-save values cannot widen cards off-screen.
- PWA navigation now prefers the network while retaining an offline fallback, and service-worker cache versioning/update checks make new phone builds surface more reliably after deployment.
- Validation after these changes: 37/37 regressions; neutral and mixed-policy 1,000-life runs both completed with zero anomalies and zero forced terminal deaths.

### Relationship graph and playable minigames (0.9.8)

The People tab now uses the persistent NPC graph as a navigation surface instead of presenting every relationship as one flat list. The first real minigame layer also connects player execution to existing simulation outcomes without replacing character progression.

- People now opens into relationship folders: Player Family, Relatives, Friends & Social, Romantic History, School, and Work. Search still spans all direct player relationships.
- Opening a folder renders a mobile relationship tree rooted on the player. Structural edges come only from persisted `parentIds`, `childIds`, and `partnerId`; disconnected direct relationships receive a player link so the tree stays navigable without inventing NPC-to-NPC connections.
- Extended-family branches prefer known intermediate connections. For example, a niece/nephew with a known sibling parent hangs beneath that sibling instead of also receiving a redundant direct edge to the player.
- NPC detail sheets now expose known parent, child, and partner connections alongside memories and interactions.
- The reusable minigame layer now supports timing, sequence-memory, grid-memory, and safety-oriented decision mechanics. Reduced-motion environments automatically substitute a non-motion sequence challenge for timing games.
- Acting auditions, pro-sports contract attempts, combat bouts, motorsport races, and prison-escape attempts now accept minigame performance scores as bounded modifiers. Character stats/skills and seeded world RNG remain part of the final outcome.
- License quizzes remain interactive; when the minigame preference is disabled, licenses and supported special challenges resolve from character skill plus a pure seeded challenge score. Accessibility skip resolution does not mutate the core RNG outside the engine action.
- Validation after this pass: 55/55 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Childhood eligibility and dependent finances (0.9.7)

The second live playtest exposed a separate class of bug from same-year spam: some systems had frequency limits but no concept of whether the player was old enough to perform the action at all.

- Investment trading is adult-only at age 18+ at the system layer and presents a locked mobile state before adulthood. Pet adoption unlocks at age 5 and collectible-market purchases at age 12.
- Independent vacations are adult-only. Family trips unlock at age 5, require a living guardian while the player is a minor, and charge the guardian NPC's simulated household wealth instead of the child's personal cash.
- Structured wellness now unlocks in stages: walking 3+, running 5+, martial arts/meditation 6+, intentional diet activity 10+, gym 13+.
- Dependent minors do not personally absorb ordinary baseline/lifestyle/dependent/pet/property/vehicle costs or annual loan payments. Teen income can still be taxed when actual taxable income exists.
- A negative under-18 cash balance is covered by tracked guardian support instead of becoming an unsecured 12% personal loan.
- Validation after this pass: 51/51 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Action economy and anti-reroll hardening (0.9.6)

The first human playtest showed that isolated cooldown fixes were not enough: many buttons represented a full year of meaningful effort but could be tapped repeatedly until the random result became favorable. Everthread now treats yearly opportunity/time as a first-class simulation resource.

- `src/core/actionEconomy.ts` is the central policy registry and ledger API. Systems claim one or more policies atomically; React only queries the same policies for presentation.
- Failed random outcomes consume their opportunity when the attempt itself happened. Rejected job applications, failed auditions, lost fights, failed treatment and similar outcomes cannot be rerolled for free in the same age.
- Career, education, wellness/health, social/relationship, parenting, fame, travel/license, crime/prison, pets, collectibles, business progression, property renovation and major special-career actions now have explicit yearly limits or cooldowns where repetition would otherwise trivialize progression.
- Pure configuration/reallocation actions that do not generate a new outcome, such as investment allocation or business pricing/pay settings, remain intentionally flexible rather than receiving arbitrary cooldowns.
- `GameEngine.run()` now detects action-ledger/RNG/ID mutation even when an action returns `success:false`, ensuring a consumed failed attempt still notifies subscribers and autosaves.
- The React store subscribes to a private engine revision number rather than mutable `GameState` object identity, so every engine emission reliably invalidates the UI snapshot.
- Save schema v6 persists the ledger and migrates legacy annual career/family markers into it.
- Relationship marriage/reconciliation counters were moved into the owning relationship domain instead of being patched after the engine action emitted.
- Mobile controls on the major action surfaces disable once the same engine policy is exhausted, so the player receives immediate feedback instead of learning only from an error toast.
- Validation after this pass: 47/47 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

## Verification milestone

Added in the current hardening pass:

- Framework-independent deterministic regression suite: 55 passing tests.
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

Neutral-policy sample after the 0.9.8 relationship/minigame pass (headless balance behavior unchanged):

- Average / median lifespan: 78.6 / 81
- Average / median net worth: 1,210,543 / 637,451
- Wealth p10 / p25 / p75 / p90 / p99: 95 / 196,880 / 1,586,107 / 3,038,895 / 6,699,815
- Millionaire ending net worth: 40.5%
- Marriage frequency: 51.9%
- Average children: 0.53
- Any crime / conviction: 6.8% / 6.7%
- Fame 25+: 5.7%
- Average ending wealth sources: 707,011 cash / 117,743 property equity / 372,394 investments / 15,046 businesses / 1,651 other debt
- Average investing: 125,965 lifetime contributions / 125,034 held cost basis / 247,360 held unrealized gain
- Inheritance: 94.6% of lives receive some inheritance / 131,793 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

Mixed-policy sample:

- Average / median lifespan: 79.1 / 82
- Average / median net worth: 1,461,598 / 840,742
- Wealth p10 / p25 / p75 / p90 / p99: 4,863 / 244,661 / 1,759,906 / 3,533,598 / 9,083,312
- Millionaire ending net worth: 45.3%
- Marriage frequency: 54.8%
- Average children: 0.69
- Average ending wealth sources: 841,672 cash / 122,984 property equity / 455,253 investments / 43,318 businesses / 1,629 other debt
- Average investing: 161,931 lifetime contributions / 160,911 held cost basis / 294,342 held unrealized gain
- Inheritance: 93.8% of lives / 132,348 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

The market-calibration conclusion from 0.9.4 still holds: inheritance is not the dominant wealth source, and the headless policies underuse optional lifestyle consumption compared with a human. The 0.9.6 action economy prevents retry/grind exploits; 0.9.7 adds age eligibility and dependent-finance semantics without attempting to force an arbitrary millionaire percentage.

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

The first reusable interactive layer is now implemented. Timing, sequence-memory, grid-memory, and decision mechanics are available; acting auditions, pro-sports attempts, combat bouts, motorsport races, prison escape, and license checks are wired into live gameplay. Remaining depth:

- Direct interactive deployment and flight-specific challenge flows beyond the current reusable sequence/decision mechanics and license path.
- More sport-specific, acting-specific, and racing-specific variants so repeated careers do not feel like the same skin over one mechanic.
- Haptics/sound feedback, richer difficulty scaling, and device/accessibility QA.
- Event-driven minigame hooks where a challenge is optional and consequences remain valid when minigames are disabled.

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

1. Exact seeded replay includes state-scoped runtime IDs and has a 50-year serialization regression. Remaining replay risk is future code introducing wall-clock/random state outside seeded systems; keep the replay test mandatory.
2. The centralized action ledger now covers the major profitable/progression-bearing player actions, but every new action must be classified deliberately as unlimited configuration, resource-limited, yearly-limited, cooldown-based, or consequence-escalating. Avoid reintroducing ad-hoc button spam paths.
3. Simulation policies are separated and wealth-source diagnostics are available. Neutral and mixed populations should remain the balance baseline; do not tune core costs around a headless bot that still underuses optional lifestyle purchases.
4. Bulk simulation suppresses achievement/challenge evaluation and truncates timeline history intentionally for performance. Full-mode runs remain the correctness reference.
5. Save schema migration covers versions 1→6. Every future persisted state addition needs an explicit default/migration path, and old rewind snapshots must continue to migrate before restoration.
6. No runtime error boundary / last-known-good transaction backup exists yet around every important action. IndexedDB persistence is versioned, but crash-safe transactional recovery needs hardening.
7. Full React/Vite production builds require installed npm dependencies; local engine/tests are compiler-validated in the current workspace and GitHub Actions remains the authoritative dependency-backed mobile deployment gate.

## Save schema history

### Version 1

Initial centralized life state.

### Version 2

Added travel history and license state.

### Version 3

Added inheritance configuration and rewind snapshots; migration fills missing achievements/challenges/completed lives/special-career/flag structures.

### Version 4

Added persisted `idCounter` for deterministic state-scoped runtime IDs. Migration initializes a deterministic post-legacy counter and rewind restores migrate older snapshot payloads before use.

### Version 5

Added persistent family-planning/pregnancy state and targeted repair for obvious pre-fix runaway compensation/career saves from the first live mobile playtest.

### Version 6 — current

Added the persisted centralized `actionLedger` with per-age usage, last-used ages for cooldowns, and a revision counter used by `GameEngine` to detect failed-but-mutating outcomes. v5 migration preserves legacy annual career/family action markers where present.

## Next development sequence

1. Use continued human mobile playtesting to audit any remaining action that lacks a deliberate time/resource/consequence classification; add policies only where repetition creates an exploit or implausible same-year progression.
2. Build persistent school and workplace rosters with teacher/classmate/boss/coworker memories and target-aware event hooks.
3. Expand delayed consequences into parenting, crime/legal, property, business and special-career content.
4. Add richer autonomous descendant education, health, legal and household histories so generation handoffs preserve more than career/family state.
5. Add asset-specific wills plus fictionalized estate administration/tax rules without breaking the current multi-heir settlement.
6. Deepen special-career modules one family at a time without replacing working core systems.
7. Expand the minigame framework with deployment/flight variants, event hooks, richer path-specific challenge sets, and full accessibility/device QA.
8. Perform target-device mobile/accessibility/PWA QA and add crash-safe last-known-good transaction recovery around major engine actions.
9. Expand regional names substantially and verify long-dynasty repetition rates.
10. Run save-migration, large-family, full-mode and 10k/100k bulk simulation gates before release labeling.
