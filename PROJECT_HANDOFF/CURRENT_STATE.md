# Everthread — Current State

Last handoff preparation: 2026-09-10  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `c57dfc3440a51f299867a3330ec8f2278dd66e67`.

- GitHub Actions Run #77 (`34519148544`) completed successfully on 2026-09-10 UTC.
- Run #77 expanded corrective upload commit `7f95eaa22cd53657ae10f3aadb97d22bc5a372b0` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, the full established regression suite, production build, Pages artifact upload, and Pages deployment passed.
- Core regression: 82/82.
- People Threadspace: 57/57.
- Phase 5 estate planning: 46/46.
- Family continuity: 18/18.
- Visual identity: 12/12.
- Family reproduction: 51/51.
- Secret-code regression: 18/18.
- Rewind scaling regression: 16/16.
- NPC household coherence regression: 35/35.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and exact histories must never be copied into production/default fixtures.

## Green systems immediately relevant to current work

- Phase 4 remains closed; persistent career ecosystems, coherence closeout, random-event consequences, AI Interaction Testbench, and People Threadspace are green.
- Phase 5A estate/family-continuity foundation is green and must be extended rather than replaced.
- Run #69 visual identity is green; supplied player crest art remains authoritative and must not be regenerated/restyled without Mavyy's request.
- Runs #70–#72 established reproductive compatibility, NPC gender/reproductive identity, Family Planning profile ownership, immediate Threadspace invalidation, Activities → Social Meet Someone, uniform standalone adoption control, and expanded regional name pools.
- Run #74 established the Sandbox-only secret-code system. Code `9426` creates one persistent Yuki Aster friend through normal NPC/relationship authority, supports ordinary romance/family progression, preserves age gates and reproductive compatibility, consumes no simulation RNG, and is idempotent per life.

## Current corrective program

Long-form playtesting exposed several real scale/coherence issues. Their authoritative sequence and status live in:

`PROJECT_HANDOFF/POST_RUN74_DIAGNOSTIC_POLISH.md`

Do not reorder or combine these slices casually. Each slice should reach CI Green before the next one is promoted unless a discovered dependency makes the ordering unsafe.

Current status:

1. **Save / rewind scaling — CI Green (Run #75).**
2. **Player partner/spouse ↔ NPC household coherence — CI Green (Run #77).**
3. **NPC health / mortality semantics — Local Green; upload/CI pending.**
4. Age-aware reproduction — Queued.
5. NPC gender / sexual-orientation coherence — Queued.
6. Collision-aware naming — Queued.
7. Relationship/event microcopy polish — Queued.
8. Integrated long-life QA — Queued.

## Slice 1 implementation — CI Green

`RewindSystem.ts` now owns bounded rewind retention and capture policy:

- maximum 10 recent yearly rewind points;
- maximum 6,000,000 combined snapshot characters while retaining at least the newest point;
- duplicate ages keep the newest captured version;
- malformed entries are discarded;
- snapshots remain self-contained JSON with `yearlySnapshots` and the transient `ageUpLocked` runtime guard removed before encoding, preserving exact restore semantics without recursive history.

`SaveSystem.migrateSave()` normalizes rewind arrays for old and current schema-9 saves before cloning the rest of the loaded state, avoiding unnecessary duplication of legacy oversized snapshot arrays. Save schema remains 9.

`importSave()` temporarily accepts legitimate pre-fix exports up to 40,000,000 characters so they can be loaded and immediately normalized; this is a recovery ceiling, not the new desired steady-state save size.

A dedicated `rewindScalingRegression.ts` covers count/budget retention, duplicate-age handling, malformed records, live capture, Age Up + rewind restoration, oversized legacy import recovery, and current-schema normalization.

Local checks completed before packaging:

- changed TS files transpile with zero syntax diagnostics;
- `RewindSystem.ts` passes standalone strict TypeScript checking;
- source-integrity reconstruction for modified `SaveSystem.ts`, `AgingSystem.ts`, and `runRegression.ts` matches the exact Run #74 Git blob hashes after removing only intended edits;
- applying the new retention algorithm to the supplied diagnostic save projects an approximately 64% export-size reduction while retaining recent rewind points.

Run #75 passed both TypeScript gates, every established regression, Rewind Scaling 16/16, production build, Pages artifact upload, and live deployment. Slice 1 is **CI Green**.

## Slice 2 implementation — CI Green

Root cause: `NpcLifeSystem` already knew whether an NPC had an active player romance for autonomous matchmaking, but household state only treated `npc.partnerId` as partnered. Player romance is authoritative in `state.relationships`, while `npc.partnerId` belongs to NPC-to-NPC partnerships, so player spouses could remain `independent` with stale `family` housing.

The pending Slice 2 overlay:

- adds a single `syncNpcHouseholdProjection()` authority in `NpcLifeSystem`;
- projects a living adult player partner/fiance/spouse as `partnered`, using `shared` housing when they do not own property;
- never writes the controlled protagonist into `npc.partnerId`, and removes legacy player-character partner IDs if encountered;
- preserves real NPC-to-NPC `partnerId` relationships;
- preserves NPC-owned property as `owning` through relationship transitions;
- gives custody/institutional state and minor/dependent state priority over romance;
- immediately resynchronizes household state after Ask Out, Proposal, Marriage, Breakup, Divorce, Reconcile, and discovered-infidelity relationship endings;
- restores `maritalStatus='dating'` on successful reconciliation instead of leaving a stale divorced status;
- keeps completed-player-death survivors independent rather than allowing an old spouse relationship record to resurrect shared housing on load;
- works through descendant continuation: when an NPC spouse becomes spouse of the new controlled descendant, the obsolete NPC-to-NPC pointer to the now-player character is removed and household state is rebuilt from player relationship truth;
- uses no new persisted structure and adds no new main-RNG draw, so save schema remains 9.

A dedicated synthetic `npcHouseholdCoherenceRegression.ts` passes **35/35** in Run #77 across dating, engagement, marriage, divorce, reconciliation, breakup, ownership, stale-save repair, custody/release, NPC-to-NPC couples, player death, teen relationships, and descendant continuation. The supplied real save was used only as diagnosis: under the green logic its stale spouse household projects as `partnered/shared`; none of its private seed/IDs/history are shipped in fixtures.

Run #76 failed only because the new regression held TypeScript-narrowed object references across mutations. The corrective Run #77 test re-reads authoritative state after each mutation; production Slice 2 logic was unchanged. Run #77 passed both TypeScript gates, all regressions, production build, Pages artifact upload, and live deployment. Slice 2 is **CI Green**.


## Slice 3 implementation — Local Green / CI pending

Root cause: NPC health can clamp to `0` during ordinary aging/condition drain, but the existing death path remained probabilistic (maximum 55%) and background odd-year simulation returned before any mortality resolution. This allowed living NPCs at zero health to persist.

The pending Slice 3 overlay:

- defines health `<= 0` as terminal during NPC simulation while keeping any positive health probabilistic/survivable;
- routes terminal health through the existing centralized NPC death cleanup rather than an invariant-side kill;
- resolves zero health before unrelated annual processing and immediately after health degradation;
- closes the background odd-year skip that could leave a zero-health NPC alive;
- makes defensive NPC death handling idempotent, preventing duplicate inheritance/death cleanup;
- preserves existing age/illness mortality pressure for positive-health NPCs;
- repairs legacy/current schema-9 living zero-health NPCs to health `1` during load, avoiding a build-update mass death while eliminating the contradictory state;
- leaves already-dead zero-health NPCs unchanged;
- adds validator coverage for any future living terminal-health contradiction;
- keeps save schema at 9 and introduces no persisted field.

Dedicated `npcHealthMortalityRegression.ts`: **18/18 isolated local runtime checks passed**. Combined local source also retains **NPC Household Coherence 35/35**. The real diagnostic save was used only as diagnosis: its 7 living zero-health NPCs normalize to living health-1 critical NPCs on import, with no remaining living terminal-health records and 7 rewind snapshots retained.

This slice is **not green** until GitHub Actions passes both TypeScript gates, every established regression plus NPC Health / Mortality, production build, Pages artifact upload, and live Pages deployment.

## Known continuing quality / architecture issues

- NPC gender/sexual-orientation matchmaking remains intentionally simplified until Slice 5.
- Player-romance/NPC-household projection correction is CI Green in Run #77.
- NPC zero-health terminal semantics are implemented locally in Slice 3 and pending CI verification.
- Biological conception lacks an age-aware fertility curve until Slice 4.
- Name collisions remain possible despite expanded pools until Slice 6.
- Relationship interaction microcopy has known grammatical templates until Slice 7.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- The production application chunk remains above the preferred size threshold; broader code splitting remains future work.
- GitHub Actions Node-20-targeted action warnings remain nonblocking technical debt.
