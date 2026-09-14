# Everthread — Phase 7 Persistent World Consequences

## Status

**Phase 7A and all three Phase 7B slices are CI Green, certified, and deployed. Phase 7C — Persistent World Conditions is the active local candidate; canonical CI certification is pending.**

Newest certified repository source is docs-only GitHub Actions **Run #121** (`34796329373`), expanded source `c163e8d121c75465ec17d17aa54dd725edb05128`; newest gameplay-changing certified baseline remains **Run #120 / `4dd4378ec8986056fc3348dec5b2c6b1594b236b`**, package `everthread-life-unwritten@0.12.0`, save schema **13**. The Phase 7C candidate advances durable state to schema **14**.

## Why Phase 7A came first

Everthread already has multi-year consequences, persistent NPC targets, special-career stories, and system-owned financial/milestone events. The current mechanism is intentionally small: `DelayedEvent` stores an event ID, due age, and arbitrary payload; `EventSystem.processDelayedEvents()` scans due entries; ordinary event cooldown eligibility derives from position in `recentEventIds`. This works for the current scale but does not provide a single durable authority for exact cooldown ages, priority, chain identity, cancellation state, or completion history.

The post-6C Financial Pressure correction exposed the architectural pressure directly: FinanceSystem had to notice already-due delayed stories so it did not steal the single pending-event slot. The certified Phase 7A implementation removes that responsibility: Finance only requests a normal-priority consequence and the scheduler owns arbitration.

## Phase 7A goal

Create one authoritative, bounded, deterministic consequence scheduler that lets any system say “this consequence should matter later” without knowing queue arbitration details.

The scheduler should own:

- stable consequence IDs and optional chain IDs;
- source/origin event or system and origin age;
- exact event definition ID;
- due age plus optional earliest/latest due window where justified;
- explicit priority class and deterministic tie-breaking;
- exact target references for NPCs and, where needed, assets, businesses, schools/social worlds, careers, or other durable entities;
- validity/cancellation requirements such as target alive, relationship still present/type-compatible, asset still owned, world still relevant, or required state/flags;
- dedupe keys so repeated annual systems cannot queue the same unresolved consequence indefinitely;
- completion/cancellation state/history sufficient for debugging and future chain logic without retaining unbounded payloads;
- exact event cooldown ages rather than inferring cooldown solely from the bounded order of `recentEventIds`;
- bounded pruning rules for completed/cancelled history and old cooldown entries.

## Authority boundaries

- `EventSystem`/a dedicated consequence module owns scheduling, validation, arbitration, completion, cancellation, and cooldown bookkeeping.
- Finance, parenting, school, property, business, relationship, career, and world-condition systems may request/schedule consequences but do not decide whether they can overwrite `pendingEvent`.
- `pendingEvent` remains the one unresolved player-facing event gate; Age Up remains blocked until required choices resolve.
- Existing event definitions remain data-driven. Dedicated/system stories stay outside the 691-event random pool unless intentionally promoted into random content.
- Do not duplicate NPC, relationship, asset, business, education, employment, or SocialWorld truth inside consequence records. Store stable references plus the minimum immutable origin context required to tell the story.
- Never silently retarget a consequence whose exact target became invalid. Cancel it deterministically unless the event definition explicitly permits a fallback target policy.

## Compatibility and migration

Phase 7A advanced save schema **12 → 13** because persistent scheduler/cooldown metadata is new durable state. Schema 13 is now the certified baseline.

Migration requirements:

- deterministic, RNG-neutral, and idempotent;
- preserve current `pendingEvent` exactly enough for old saves to resolve the choice they already saw;
- normalize existing `delayedEvents` into scheduler-compatible entries without changing their due age, event ID, exact NPC payload, origin age, or required relationship semantics;
- preserve special-career delayed stories and the existing delayed romance/follow-up chains;
- preserve Financial Pressure deferral behavior while moving priority arbitration out of FinanceSystem;
- preserve random-event selection behavior and the established random library count;
- keep long-life/generation state bounded;
- synchronize new-game save version with `SaveSystem.SAVE_VERSION` or an equivalent single authority so schema numbers cannot drift between CharacterSystem and SaveSystem.

## Certified Phase 7A implementation snapshot

- `src/systems/ConsequenceSystem.ts` is the scheduler authority. `state.delayedEvents` remains the one active queue; `consequenceScheduler` stores only exact cooldown ages and bounded completion/cancellation history.
- Active queue bound: 96. Completion/cancellation history bound: 160. Exact event cooldown ledger bound: 256.
- Scheduling records stable ID, optional chain ID, origin, due/earliest/latest age, priority, exact target references, validity requirements, and a dedupe key. Failed duplicate/queue-full scheduling does not consume a runtime ID.
- Due order is deterministic: priority → due age → scheduled age → stable ID. Invalid exact targets cancel into history; they are never silently replaced.
- `pendingEvent` remains the one player-facing unresolved gate. Due same-age backlog is surfaced before Age Up advances again.
- Existing `DelayedEvent` APIs remain compatible through deterministic normalization/migration. Legacy entries without an explicit dedupe key receive a stable per-entry compatibility key, so migration does not silently collapse distinct old queued stories.
- Financial Pressure and special-career story openings now use the scheduler rather than owning pending-event arbitration.
- `src/core/saveVersion.ts` is the shared schema-version authority for new lives and SaveSystem.
- Random event library remains 691; no Phase 7A content expansion is included.

## Phase 7A QA gate — certified in Run #112

The dedicated persistent-consequence regression is **36/36** in canonical Run #112 and protects: exact cooldown age behavior; deterministic priority/tie order; no pending-event overwrite; due-window handling; exact NPC persistence; dead/invalid target cancellation; required-relationship cancellation; dedupe; completion/cancellation history; bounded pruning; legacy delayed-event migration; pending-event migration; special-career compatibility; Financial Pressure priority; random-pool count/RNG parity; save round-trip; rewind interaction; descendant transition behavior; and long-life queue bounds.

Both TypeScript gates, every existing regression, Phase 7A 36/36, Integrated Long-Life, production build, certified artifact restore smoke, and Pages deployment passed in Run #112. Phase 7A is green.

## Phase 7B — Systemic delayed stories — CERTIFIED

The certified first 7B1 slice turns earlier player actions into exact multi-year follow-ups through existing authorities. Five probability-zero systemic definitions are outside the 691-event random library and are requested only by real actions: child time, academic misconduct, friend arguments, reconciliation, and marriage.

`SystemicStorySystem` is deliberately a stateless request bridge. `ConsequenceSystem` remains the scheduler authority; Relationship/NPC/SchoolWorld/SocialWorld remain truth owners. Stories persist exact NPC or `social_world` refs, cancel invalid targets, dedupe unresolved repeats, and consume no gameplay RNG when scheduled. The school story adds a narrow data-driven school-world effect so later resolution changes the persistent conduct/social-standing record already used by admissions.

Dedicated `phase7BSystemicStoryRegression.ts` is **33/33 in Run #115**. The complete regression wall, certified artifact restore smoke, 167-module production build, and Pages deployment are green. The required live Feedback Inbox refresh was completed again after Run #117 before Phase 7B2 selection; no unresolved reports were present.

**Certified Phase 7B2 — Ownership & Workplace Echoes:** five additional probability-zero stories are action-driven by property renovation, business founding, business product launch, manager feedback, and formal coworker concerns. Exact property/business/SocialWorld/NPC refs are scheduled through the same authority. Sold/missing properties cancel; archived workplace history may still surface through the same persistent world/person; dead/missing people or worlds cancel rather than retarget. Property effects update exact condition/value, business effects update exact demand/reputation, and workplace/NPC effects reuse existing authorities. Dedicated regression is **35/35 in Run #118**; save schema remains 13 and the random pool remains 691.

**Certified Phase 7B3 — Special-Career Long-Tail Echoes:** five probability-zero stories are requested only by explicit actions in Combat, Military, and Politics. Combat training binds the exact coach/world/career for three years; a sanctioned bout binds the exact rival/world/career for two years; military training schedules a three-year service echo with exact posting/commander when that world already exists; policy and press actions schedule two-year political echoes with exact office/chief or opposition leader when available. Military/politics may fall back to career-only targeting rather than violating their certified rule that entry actions do not create persistent worlds before annual processing.

This slice deliberately leaves `SpecialCareerStorySystem` unchanged: its annual Phase 4D8 mentor/rival/path scanner remains a separate established content mechanism. Phase 7B3 adds no second scanner. `ChoiceEffect.specialCareer` is narrow and can adjust only bounded `skill`, `reputation`, or `approval`; it cannot author lifecycle outcomes such as fights, championships, contracts, elections, terms, ranks, promotions, projects, or retirements. Dedicated regression is **36/36 in Run #120**; full wall/build, certified restore smoke, artifact publication, and Pages deployment are green. Save schema remains 13 and random pool remains 691.

## Phase 7C — Persistent world conditions — LOCAL CANDIDATE

Phase 7C adds one bounded persistent-world context authority instead of another economy, event queue, or shadow simulation. `WorldConditionSystem` owns only condition lifecycle: stable ID, definition ID, exact scope/country, start/end year, intensity, definition start cooldowns, and bounded resolved history. Existing systems remain authoritative for the values they already own.

Seven original data-driven definitions live in `src/data/worldConditions.ts` outside the 691-event random library:

- country: **Growth Wave**, **Economic Slowdown**, **Cost Surge**, **Housing Squeeze**;
- global: **Travel Disruption**, **Media Frenzy**, **Market Jitters**.

Country conditions stay bound to the country where they started. Leaving that country makes them irrelevant without deleting them; returning before expiry restores their relevance. Global conditions follow the player across countries. Active conditions are capped at **4** and resolved history at **48**. Exclusive groups prevent contradictory same-region cycles; durable per-definition cooldown years prevent immediate repeats.

Annual generation/expiry runs immediately after year/age advancement and before `EconomySystem`. It uses an isolated deterministic RNG stream derived from game seed/year/country and never advances `state.rngCounter`, so Phase 7C does not reshuffle unrelated NPC, career, investment, or event randomness. It creates no `DelayedEvent` or `pendingEvent`; material condition starts/expiry are inspectable through bounded timeline history instead.

Effects flow through existing authorities:

- `EconomySystem`: inflation, salary growth pressure, housing growth, business-demand growth;
- `CareerSystem`: application score pressure and bounded layoff chance;
- `BusinessSystem` and `PropertySystem`: consume the already-authoritative economy demand/housing indices;
- `InvestmentSystem`: regime drift/volatility modifiers without extra draws;
- `TravelSystem`: trip-cost multiplier;
- `FameSystem`: organic audience growth, scandal pressure, paid-publicity economics;
- `FinanceSystem`: ordinary household living-cost pressure only—tax, debt, collateral, bankruptcy, and accounting authorities are not rewritten.

The Life screen includes a compact mobile **World around you** card with relevant condition title, country/global scope, intensity, years remaining, description, and effect summary. This is a read-only projection; React owns no condition state.

Phase 7C advances save schema **13 → 14**. Migration initializes empty world-condition state for old saves, creates no retroactive condition history, consumes no gameplay RNG/runtime ID, and is idempotent. Rewind/import/descendant flows continue through the shared SaveSystem/current-version authority.

Dedicated `phase7CWorldConditionRegression.ts` is **42/42 locally** and covers definition isolation, schema migration, deterministic generation, bounds, expiry/history, exclusive groups/cooldowns, country/global relevance, UI projection, real downstream effects, existing RNG draw shapes, save round-trip, queue isolation, exact country scope, and invariants. Both TypeScript gates and the complete regression wall pass; Integrated Long-Life remains 105/105 and all Phase 7A/B suites remain green. Production build passes at **170 modules**. Canonical GitHub Actions is still the final certification authority.

When Phase 7C is certified/deployed, perform an explicit **Phase 7 closeout synchronization** and verify feedback one last time. Only after that closeout is certified is Phase 7 considered closed. Then **stop implementation planning**: Mavyy and Yuki will brainstorm what comes next before any new macro phase or roadmap exists.

## First files to inspect before Phase 7B implementation

- `src/types/game.ts`
- `src/systems/EventSystem.ts`
- `src/systems/AgingSystem.ts`
- `src/services/SaveSystem.ts`
- `src/systems/CharacterSystem.ts`
- `src/systems/SpecialCareerStorySystem.ts`
- `src/systems/FinanceSystem.ts`
- all call sites that push to or filter `state.delayedEvents`
- event/coherence/special-career regression suites plus core save/rewind/dynasty tests

## Preserve these 7A boundaries during 7B

Do not inflate event counts, redesign the event sheet, add a parallel story graph, rewrite unrelated systems, or begin broad national/world-event content before the scheduler foundation is certified. Phase 7A is infrastructure with observable compatibility behavior, not a content-count milestone.
