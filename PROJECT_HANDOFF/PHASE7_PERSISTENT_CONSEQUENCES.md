# Everthread — Phase 7 Persistent World Consequences

## Status

**Active local candidate: Phase 7A — Persistent Consequence Foundation. GitHub Actions certification pending.**

Certified starting baseline: GitHub Actions Run #111 (`34774175236`), expanded source `576f9402deb854f8d5bd11891610e035cdd6d7ec`, package `everthread-life-unwritten@0.12.0`, certified save schema 12. Phase 6 is closed. The local Phase 7A candidate advances schema to **13** and has passed both TypeScript gates, the complete established regression wall, dedicated Phase 7A Persistent Consequence **36/36**, Integrated Long-Life 105/105, and a 165-module production build. Do not call 7A CI Green until the overlay is imported and canonical preflight/Pages succeed.

## Why Phase 7A comes first

Everthread already has multi-year consequences, persistent NPC targets, special-career stories, and system-owned financial/milestone events. The current mechanism is intentionally small: `DelayedEvent` stores an event ID, due age, and arbitrary payload; `EventSystem.processDelayedEvents()` scans due entries; ordinary event cooldown eligibility derives from position in `recentEventIds`. This works for the current scale but does not provide a single durable authority for exact cooldown ages, priority, chain identity, cancellation state, or completion history.

The post-6C Financial Pressure correction exposed the architectural pressure directly: FinanceSystem had to notice already-due delayed stories so it did not steal the single pending-event slot. The Phase 7A candidate removes that responsibility: Finance only requests a normal-priority consequence and the scheduler owns arbitration.

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

Phase 7A advances save schema **12 → 13** in the local candidate because persistent scheduler/cooldown metadata is new durable state.

Migration requirements:

- deterministic, RNG-neutral, and idempotent;
- preserve current `pendingEvent` exactly enough for old saves to resolve the choice they already saw;
- normalize existing `delayedEvents` into scheduler-compatible entries without changing their due age, event ID, exact NPC payload, origin age, or required relationship semantics;
- preserve special-career delayed stories and the existing delayed romance/follow-up chains;
- preserve Financial Pressure deferral behavior while moving priority arbitration out of FinanceSystem;
- preserve random-event selection behavior and the established random library count;
- keep long-life/generation state bounded;
- synchronize new-game save version with `SaveSystem.SAVE_VERSION` or an equivalent single authority so schema numbers cannot drift between CharacterSystem and SaveSystem.

## Local implementation snapshot

- `src/systems/ConsequenceSystem.ts` is the scheduler authority. `state.delayedEvents` remains the one active queue; `consequenceScheduler` stores only exact cooldown ages and bounded completion/cancellation history.
- Active queue bound: 96. Completion/cancellation history bound: 160. Exact event cooldown ledger bound: 256.
- Scheduling records stable ID, optional chain ID, origin, due/earliest/latest age, priority, exact target references, validity requirements, and a dedupe key. Failed duplicate/queue-full scheduling does not consume a runtime ID.
- Due order is deterministic: priority → due age → scheduled age → stable ID. Invalid exact targets cancel into history; they are never silently replaced.
- `pendingEvent` remains the one player-facing unresolved gate. Due same-age backlog is surfaced before Age Up advances again.
- Existing `DelayedEvent` APIs remain compatible through deterministic normalization/migration. Legacy entries without an explicit dedupe key receive a stable per-entry compatibility key, so migration does not silently collapse distinct old queued stories.
- Financial Pressure and special-career story openings now use the scheduler rather than owning pending-event arbitration.
- `src/core/saveVersion.ts` is the shared schema-version authority for new lives and SaveSystem.
- Random event library remains 691; no Phase 7A content expansion is included.

## Phase 7A QA gate

Add a dedicated persistent-consequence regression suite before promotion. At minimum protect: exact cooldown age behavior; deterministic priority/tie order; no pending-event overwrite; due-window handling; exact NPC persistence; dead/invalid target cancellation; required-relationship cancellation; dedupe; completion/cancellation history; bounded pruning; legacy delayed-event migration; pending-event migration; special-career compatibility; Financial Pressure priority; random-pool count/RNG parity; save round-trip; rewind interaction; descendant transition behavior; and long-life queue bounds.

Both TypeScript gates, every existing regression, the new Phase 7A suite, Integrated Long-Life, production build, certified artifact restore smoke, and Pages deployment must pass before 7A is called green.

## Phase 7B — Systemic delayed stories

Only after 7A is CI Green, expand authored/systemic follow-ups across parenting/family, school, friendships/romance, property, business, employment, and special careers. Earlier choices should resurface through the same real NPCs/assets/worlds and produce cross-system effects rather than isolated flavor text.

Examples of desired systemic interaction include school conduct affecting later admissions/careers, parenting history affecting adult-child relationships, property choices producing later financial/household consequences, business decisions affecting staff/reputation/wealth, and special-career choices following the protagonist into later chapters or retirement.

## Phase 7C — Persistent world conditions

After scheduler and delayed-story foundations are stable, add national/world conditions with multi-year duration and real systemic effects. Conditions should modify existing authorities—employment, salary pressure, business demand, housing, investments, travel, fame/media, finance, etc.—instead of existing as standalone flavor popups.

World conditions must remain bounded, deterministic under the seed, inspectable enough for player understanding, and compatible with dynasty-scale simulation.

## First files to inspect before implementation

- `src/types/game.ts`
- `src/systems/EventSystem.ts`
- `src/systems/AgingSystem.ts`
- `src/services/SaveSystem.ts`
- `src/systems/CharacterSystem.ts`
- `src/systems/SpecialCareerStorySystem.ts`
- `src/systems/FinanceSystem.ts`
- all call sites that push to or filter `state.delayedEvents`
- event/coherence/special-career regression suites plus core save/rewind/dynasty tests

## Do not do in 7A

Do not inflate event counts, redesign the event sheet, add a parallel story graph, rewrite unrelated systems, or begin broad national/world-event content before the scheduler foundation is certified. Phase 7A is infrastructure with observable compatibility behavior, not a content-count milestone.
