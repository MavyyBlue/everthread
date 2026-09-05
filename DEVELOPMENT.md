# Everthread — Development Status

Last updated: 2026-09-04  
Current build line: 0.11.0 pre-release  
Save schema: 8

## Product direction

Everthread: Life Unwritten is an original, mobile-first procedural life simulator. The central interaction is Age Up: one year advances the world, connected systems process in a deterministic order, events may interrupt for a decision, consequences persist, and death can hand the family thread to a descendant.

The project is intentionally data-driven. React renders and requests actions; simulation systems own critical mutations. One `GameState` is the authoritative runtime/save state.

## Current architecture

- `src/engine/GameEngine.ts` — public action façade used by UI.
- `src/types/` — authoritative state and content contracts.
- `src/core/` — RNG, math, deterministic IDs, invariant enforcement, and the centralized action-economy ledger/policies.
- `src/systems/` — isolated simulation domains, including persistent social-world ownership for schools, workplaces, and future organizations.
- `src/data/` — external content definitions for events, jobs, education, countries, health, crime, assets, achievements, and challenges.
- `src/services/SaveSystem.ts` — IndexedDB/local fallback, schema migration, account-level multi-slot life saves, active-slot tracking, JSON import/export.
- `src/screens/` and `src/components/` — mobile UI only; critical state is not intended to be mutated here.
- `src/tests/` — deterministic regression suite, content audit, and multi-life simulation harness.
- `src/minigames/` — reusable minigame definitions plus interactive timing, sequence, grid-memory, and decision challenge components with character-skill accessibility resolution.

## Implemented foundations

These are functioning systems rather than navigation placeholders, though some still need additional depth.


### Persistent workplace social worlds (0.11.0)

Work is now the second consumer of the persisted Social World layer. Employers own workplace membership, roles, departments, culture, morale, tension, and reputation; ordinary NPC records still own the people; RelationshipSystem still owns the player's evolving personal relationship with them. Former coworkers therefore remain part of work history when a friendship, rivalry, romance, promotion, resignation, or job change alters the current relationship.

- v7→v8 migration initializes part-time employment history and reconstructs persistent workplace worlds for existing current/historical careers.
- Full-time employers generate persistent managers/coworkers, bounded team membership, departments, workplace metrics, and senior-character direct reports.
- Promotions within the same employer preserve the workplace; resignation, firing, layoff, retirement, and employer changes archive it without deleting former coworkers.
- Workplace actions cover collaboration, networking, manager feedback, and formal coworker concerns through the central action economy.
- Career processing now includes workplace-sensitive performance, bonuses, layoffs, demotions, manager effects, morale/tension, and bounded staff turnover.
- Target-aware work events bind exact current coworkers/managers for credit disputes, reviews, rumors, team feuds, after-hours connections, formal claims, and bonus pools.
- Part-time work is now real persisted employment with pay, performance, hours/week, independent small workplace rosters, and a shared weekly capacity that tightens around school/full-time commitments.
- Work affiliation is independent of relationship type: a coworker can become a friend/enemy/partner and still remain discoverable in People → Work.
- Generational handoff clears the previous protagonist's social worlds and reconstructs worlds appropriate to the controlled descendant, preventing inherited offices/schools from leaking across protagonists.
- Verification before deployment: 71/71 regressions; 1,000 neutral and 1,000 mixed-policy lives completed with zero anomalies and zero forced terminal deaths.

### Persistent school social worlds (0.10.0)

School is now the first consumer of a generic persisted Social World layer. Institutions own membership/roles/groups, NPC records own the people, and RelationshipSystem owns the player's evolving relationship with them. This keeps school affiliation intact when a classmate becomes a friend/enemy/partner and gives the upcoming workplace phase the same reusable foundation.

- v6→v7 migration reconstructs school worlds from existing education records without rewriting old education history.
- Country profiles vary entry/transition/leaving ages while retaining primary/middle/secondary compatibility for existing career/content logic.
- Persistent rosters include classmates, teachers, coaches, and leadership; People → School is affiliation-driven rather than relationship-type-only.
- Clubs/teams/groups, attendance, conduct, social standing, honors, discipline, volunteering, academic risk, and admissions/scholarship weighting are implemented.
- School-targeted events bind exact roster NPCs so event copy, effects, memories, and People history refer to the same person.
- Ordinary school acquaintances use a cheaper background simulation tier; important relationships automatically receive full autonomy.
- Compulsory school leaving and school-friend romance age boundaries are enforced at the engine layer.
- Verification: 64/64 regressions; 1,000 distinct neutral and 1,000 distinct mixed-policy population lives completed with zero anomalies/forced terminal deaths, plus a final 500-life mixed sanity batch.

- Seeded character generation and advanced starting-stat controls.
- Centralized primary/secondary stats and talents.
- Ordered one-year Age Up transaction with double-activation lock.
- Event interruption: Age Up pauses final death resolution until a decision is resolved.
- Data-driven event conditions, weighted outcomes, effects, rare-event handling, target-aware context payloads, and delayed consequences.
- Mobile life timeline and death summary.
- Persistent NPC records, relationship scores, memories, personality response modifiers, NPC aging, health drift, real career progression, linked autonomous partnerships, marriage/divorce/widowhood, bounded autonomous children, inheritance, and death.
- Dating, partner/fiancé/spouse/ex states, marriage/divorce/reconciliation, biological children and adoption.
- Country-profile childhood schooling with persistent classmates/teachers/leaders, clubs/teams/groups, conduct/attendance/honors, admissions profiles, scholarships, student debt, graduation/dropout rules, and post-secondary progression.
- 51 standard-career ladders / 306 job positions with requirements, interviews, salary, performance, promotion/demotion, termination/layoff, bonuses, raises, retirement, freelance gigs, persistent workplaces, and real part-time employment.
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
- Achievements, challenges, progress UI, multi-slot Life Saves, aggregated past-life history, dynamic best-life Family Legacy showcase, death records, and descendant continuation.
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

### Life Saves and dynamic Family Legacy (0.9.9)

The former single-slot `Past Lives` surface is now a true account-level save manager without changing the authoritative per-life `GameState` model.

- Independent new lives allocate stable `slot-N` identifiers in the existing save store instead of replacing `slot-1`. The last selected slot is remembered separately from simulation state.
- The Life Saves tab exposes Ongoing Lives for switching/deleting independent lineages and Past Lives for completed characters aggregated from every surviving lineage.
- Pending autosaves are flushed before switching or deleting. Current state is explicitly persisted before normal switches/new-life creation, preventing queued writes from crossing slot boundaries.
- Imported save JSON becomes a new independent slot rather than overwriting a matching source slot ID.
- Completed deaths record their generation going forward; older saves infer completed-life generation from chronological lineage order, so schema 6 remains compatible without a migration bump.
- Family Legacy is derived from all surviving current/completed lives. Its bounded score combines longevity, primary stats, logarithmic net worth, fame, family, career, and major milestones; a stronger Generation 2 can therefore remain featured while a weaker Generation 4 is active.
- Deleting the save that owns the current featured life automatically removes those candidates and promotes the next-highest surviving life. Individual ancestors inside a surviving lineage are not independently deletable, preserving generation/inheritance continuity.
- Validation after this pass: 57/57 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

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

- Framework-independent deterministic regression suite: 64 passing tests.
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

0.10.0 now provides the persistent school social layer: rosters, teachers/leaders, recurring classmates, activity groups, conduct/attendance/honors, profile-driven stage timing, targeted school events, and richer admissions/scholarship scoring. Remaining depth after this milestone:

- Larger school-event libraries and multi-year school consequence chains.
- More nuanced transfers, expulsions/re-entry, boarding/private/public variants, and school-specific facilities/culture.
- Richer team seasons, competitions, elections, awards, and group-specific minigames.
- More country/subregion profile variation beyond the current simplified profiles.
- Alumni reunions and later-life resurfacing events that explicitly leverage archived school worlds.

### Workplace

0.11.0 completes the persistent workplace foundation identified in the original scope gap: managers/coworkers, departments/roles, workplace metrics, recurring interactions, layoffs, demotions, bonuses, reporting/dispute paths, rumor/feud/social events, relationship evolution, employer history, and multiple part-time jobs with shared hour limits all use the same Social World/NPC/Relationship architecture. Future additions are depth rather than missing foundation:

- More industry-specific workplace cultures, hazards, unions/professional bodies, schedules, and employer archetypes.
- Richer multi-year workplace consequence chains and alumni/former-coworker resurfacing.
- More nuanced management spans, departments, transfers, mentorship, performance reviews, and severance/benefits.
- Workplace-specific minigames only where they add meaningful optional interaction without replacing character skill.

### Special careers

The state tracks and basic actions are real, but most special paths are not yet at the specification's intended depth. Acting, music, sports, combat, politics, military, royalty, modeling, racing, directing, organized crime and specialized organizations need dedicated content/events, progression gates, contracts, rivals/teams/casts/staff, retirement/end states, and richer mobile screens.

### Minigames

The first reusable interactive layer is now implemented. Timing, sequence-memory, grid-memory, and decision mechanics are available; acting auditions, pro-sports attempts, combat bouts, motorsport races, prison escape, and license checks are wired into live gameplay. Remaining depth:

- Direct interactive deployment and flight-specific challenge flows beyond the current reusable sequence/decision mechanics and license path.
- More sport-specific, acting-specific, and racing-specific variants so repeated careers do not feel like the same skin over one mechanic.
- Haptics/sound feedback, richer difficulty scaling, and device/accessibility QA.
- Event-driven minigame hooks where a challenge is optional and consequences remain valid when minigames are disabled.

### Events / consequences

691 event definitions exist and routine selection is efficient. The first five multi-year consequence chains now preserve exact NPC/origin-age context. Remaining work:

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
5. Save schema migration covers versions 1→8. Every future persisted state addition needs an explicit default/migration path, and old rewind snapshots must continue to migrate before restoration.
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

### Version 6

Added the persisted centralized `actionLedger` with per-age usage, last-used ages for cooldowns, and a revision counter used by `GameEngine` to detect failed-but-mutating outcomes. v5 migration preserves legacy annual career/family action markers where present.


### Version 7

Added persisted `socialWorlds` for school/workplace/organization membership and school-specific roster/group/conduct state. v6 migration reconstructs school worlds from existing education records so old lives retain their educational history while gaining persistent school affiliations.

### Version 8 — current

Added persisted workplace-specific Social World state plus real `partTimeJobs` / `partTimeHistory`. v7 migration reconstructs workplace worlds from existing career records, while generational handoff rebuilds social worlds for the newly controlled descendant rather than carrying the prior protagonist's institutions forward.

## Next development sequence

1. Complete the 0.11.0 phone/browser playtest and repair any workplace UI, save-migration, affiliation, or part-time-hour issue before the next deepening phase.
2. Phase 3: deepen NPC autonomy across education, health, household moves, crime/legal history, fame, imprisonment, finances, adoption, and memory/opinion-driven decisions.
3. Phase 4: deepen special-career ecosystems with persistent teams/casts/rivals/staff, contracts, seasons, scandals, awards, retirement, and path-specific events.
4. Phase 5: deepen generations/estates with asset-specific wills, fictionalized estate administration, richer NPC ownership, and broader kin taxonomy/performance validation.
5. Phase 6: finish credit/debt with vehicle finance, repossession, creditworthiness, voluntary bankruptcy, recovery, and hardship consequences.
6. Phase 7: expand exact cooldowns, long-term delayed consequences, persistent target-aware follow-ups, and national/world events across the whole simulation.
7. Perform target-device mobile/accessibility/PWA QA and add crash-safe last-known-good transaction recovery around major engine actions.
8. Expand regional names substantially and verify long-dynasty repetition rates.
9. Run save-migration, large-family, full-mode and 10k/100k bulk simulation gates before release labeling.
