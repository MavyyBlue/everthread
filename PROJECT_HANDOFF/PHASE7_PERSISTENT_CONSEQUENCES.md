# Everthread — Phase 7 Persistent World Consequences

## Status

**Phase 7 is CLOSED. Phase 7A, all three Phase 7B slices, and Phase 7C are CI Green, certified, and deployed.**

Newest certified gameplay/source baseline is GitHub Actions **Run #122** (`34797847276`), expanded source `0770106f52eea3182e86d120fa38c6b90be589e4`, package `everthread-life-unwritten@0.12.0`, save schema **14**. Run #122 certified Phase 7C at 42/42 while preserving the scheduler, all Phase 7B authority boundaries, and every established regression suite.

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

## Phase 7C — Persistent world conditions — CERTIFIED

Run #122 certified one bounded persistent-world context authority instead of another economy, event queue, or shadow simulation. `WorldConditionSystem` owns only condition lifecycle: stable ID, definition ID, exact scope/country, start/end year, intensity, definition cooldowns, and bounded resolved history. Existing systems remain authoritative for the values they already own.

Seven original data-driven definitions live in `src/data/worldConditions.ts` outside the 691-event random library: four country-scoped conditions (Growth Wave, Economic Slowdown, Cost Surge, Housing Squeeze) and three global conditions (Travel Disruption, Media Frenzy, Market Jitters). Country conditions remain bound to their origin country; global conditions follow the player. Active conditions are capped at 4 and resolved history at 48.

Annual generation/expiry runs before the ordinary economy pass using an isolated deterministic seed/year/country stream and does not advance `state.rngCounter`. Effects flow through existing Economy, Career, Business/Property, Investment, Travel, Fame, and Finance authorities. Phase 7C creates no `DelayedEvent`/`pendingEvent` queue. The Life screen exposes a compact read-only **World around you** projection; starts/expiries use bounded timeline history.

Phase 7C advanced save schema **13 → 14** with deterministic, idempotent, RNG-neutral, runtime-ID-neutral migration that initializes empty condition state for old saves and creates no retroactive history. Dedicated regression is **42/42 in Run #122**. Both TypeScript gates, the complete regression wall, Integrated Long-Life 105/105, all Phase 7A/B suites, certified restore smoke, artifact publication, the **170-module** production build, and Pages deployment are green.

Certification evidence:
- expanded source `0770106f52eea3182e86d120fa38c6b90be589e4`
- source SHA-256 `68e4de3efd82b607323dd30077c083712caaa2fad06016a5dd63bce886337338`
- dependency SHA-256 `17bbe76f88a9e07edafce170006116f5f23c5ff2c4b9e550d88191e7a617bb13`
- package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`
- certified artifact `10330720998`, digest `b51b536835184ad4944631cfe73591cc9964f8d1ec6350c2f06e74220aab61d7`
- Pages artifact `10330661334`, digest `03c1a3d1229797859118a26d3a1020638e070e6effc561d20c0f13d0bd720b6e`

**Phase 7 is closed. Stop implementation planning here.** Mavyy and Yuki will brainstorm what comes next before any new macro phase or implementation roadmap is created.

## Historical Phase 7A/B implementation inspection list

- `src/types/game.ts`
- `src/systems/EventSystem.ts`
- `src/systems/AgingSystem.ts`
- `src/services/SaveSystem.ts`
- `src/systems/CharacterSystem.ts`
- `src/systems/SpecialCareerStorySystem.ts`
- `src/systems/FinanceSystem.ts`
- all call sites that push to or filter `state.delayedEvents`
- event/coherence/special-career regression suites plus core save/rewind/dynasty tests

## Preserved 7A boundaries that governed 7B

Do not inflate event counts, redesign the event sheet, add a parallel story graph, rewrite unrelated systems, or begin broad national/world-event content before the scheduler foundation is certified. Phase 7A is infrastructure with observable compatibility behavior, not a content-count milestone.
