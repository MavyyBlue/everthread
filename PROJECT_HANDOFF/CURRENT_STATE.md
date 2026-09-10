# Everthread — Current State

Last handoff preparation: 2026-09-10  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `032e88c6f49bb8808b97c2d8a9e8bc0fe7c50a2a`.

- GitHub Actions Run #74 (`34498329874`) completed successfully on 2026-09-10 UTC.
- Both TypeScript gates, the full established regression suite, production build, Pages artifact upload, and Pages deployment passed.
- Core regression: 82/82.
- People Threadspace: 57/57.
- Phase 5 estate planning: 46/46.
- Family continuity: 18/18.
- Visual identity: 12/12.
- Family reproduction: 51/51.
- Secret-code regression: 18/18.
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

1. **Save / rewind scaling — Local preflight complete; upload/CI pending.**
2. Player partner/spouse ↔ NPC household coherence — Queued.
3. NPC health / mortality semantics — Queued.
4. Age-aware reproduction — Queued.
5. NPC gender / sexual-orientation coherence — Queued.
6. Collision-aware naming — Queued.
7. Relationship/event microcopy polish — Queued.
8. Integrated long-life QA — Queued.

## Slice 1 implementation — pending GitHub verification

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

This slice is **not green** until GitHub Actions passes both TypeScript gates, every regression including Rewind Scaling, production build, Pages artifact upload, and live Pages deployment.

## Known continuing quality / architecture issues

- NPC gender/sexual-orientation matchmaking remains intentionally simplified until Slice 5.
- Player-romance/NPC-household projection mismatch is queued for Slice 2.
- Living NPCs at zero health are queued for Slice 3.
- Biological conception lacks an age-aware fertility curve until Slice 4.
- Name collisions remain possible despite expanded pools until Slice 6.
- Relationship interaction microcopy has known grammatical templates until Slice 7.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- The production application chunk remains above the preferred size threshold; broader code splitting remains future work.
- GitHub Actions Node-20-targeted action warnings remain nonblocking technical debt.
