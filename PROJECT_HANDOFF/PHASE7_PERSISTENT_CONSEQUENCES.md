# Everthread — Phase 7 Persistent World Consequences

## Status

**Phase 7A, Phase 7B1, and Phase 7B2 are CI Green, certified, and deployed. Run #117 certified the cross-cutting progressive-disclosure correction; Run #118 certified Ownership & Workplace Echoes.**

Newest certified gameplay/source baseline: GitHub Actions **Run #118** (`34792171294`), expanded source `a4d04523e18128044c00f960f6db5fcd306a8237`, package `everthread-life-unwritten@0.12.0`, certified save schema **13**. Run #118 preserved Phase 7A scheduler authority, Phase 7B1 33/33, and progressive disclosure while certifying Phase 7B2 at 35/35.

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

## Phase 7B — Systemic delayed stories — IN PROGRESS

The certified first 7B1 slice turns earlier player actions into exact multi-year follow-ups through existing authorities. Five probability-zero systemic definitions are outside the 691-event random library and are requested only by real actions: child time, academic misconduct, friend arguments, reconciliation, and marriage.

`SystemicStorySystem` is deliberately a stateless request bridge. `ConsequenceSystem` remains the scheduler authority; Relationship/NPC/SchoolWorld/SocialWorld remain truth owners. Stories persist exact NPC or `social_world` refs, cancel invalid targets, dedupe unresolved repeats, and consume no gameplay RNG when scheduled. The school story adds a narrow data-driven school-world effect so later resolution changes the persistent conduct/social-standing record already used by admissions.

Dedicated `phase7BSystemicStoryRegression.ts` is **33/33 in Run #115**. The complete regression wall, certified artifact restore smoke, 167-module production build, and Pages deployment are green. The required live Feedback Inbox refresh was completed again after Run #117 before Phase 7B2 selection; no unresolved reports were present.

**Certified Phase 7B2 — Ownership & Workplace Echoes:** five additional probability-zero stories are action-driven by property renovation, business founding, business product launch, manager feedback, and formal coworker concerns. Exact property/business/SocialWorld/NPC refs are scheduled through the same authority. Sold/missing properties cancel; archived workplace history may still surface through the same persistent world/person; dead/missing people or worlds cancel rather than retarget. Property effects update exact condition/value, business effects update exact demand/reputation, and workplace/NPC effects reuse existing authorities. Dedicated regression is **35/35 in Run #118**; save schema remains 13 and the random pool remains 691.

Special-career long-tail stories are the next planned 7B slice. They should bind exact persistent career worlds/projects/contracts/people through existing career authorities and the same scheduler rather than becoming a parallel career-story state machine.

## Phase 7C — Persistent world conditions

After scheduler and delayed-story foundations are stable, add national/world conditions with multi-year duration and real systemic effects. Conditions should modify existing authorities—employment, salary pressure, business demand, housing, investments, travel, fame/media, finance, etc.—instead of existing as standalone flavor popups.

World conditions must remain bounded, deterministic under the seed, inspectable enough for player understanding, and compatible with dynasty-scale simulation.

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
