# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `67d54a4fc103f52c7c5839eb52aee54bc0cb1138`.

- GitHub Actions run #70 (`34430142245`) completed successfully on 2026-09-10 UTC.
- Run #70 expanded upload commit `8f7f015164208fdd8e7350509c8f1bd983d59326` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, full regressions, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 46/46.
- Family continuity regression: 18/18.
- Visual identity regression: 12/12.
- Family reproduction regression: 13/13.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 remains closed. Persistent Career World ecosystems, integration/coherence closeout, random-event consequences, AI Interaction Testbench coverage, and unified People Threadspace are green. Threadspace connection labels remain presentation-only and OFF by default.

## Phase 5A — estate and family-continuity foundation — green

`EstateSystem.ts` remains the authority for estate planning, preview, debt settlement, liquidation, spouse/child residuary shares, specific bequests, protected minor inheritance, and settlement consumed by descendant continuation.

Green continuity includes widowhood/unmarried-partner death cleanup, protected minor inheritance, spouse/child estate shares, parent/stepparent household friction, and bounded autonomous separation/divorce consequences.

## Everthread visual identity — green

Run #69 established the first Everthread-specific teal/gold presentation language while preserving player theme, accent, typeface, text-color, text-scale, contrast, and motion preferences. Supplied woman/man/gender-neutral crest assets remain production inputs and must not be regenerated or restyled without Mavyy's request. Unique save-export filenames are also green.

## Family reproduction authority — green

Run #70 established system-level biological compatibility and partnered adoption coherence:

- female/male reproductive pairings can use the biological child path;
- female/female and male/male pairings cannot create biological pregnancy through the current model;
- nonbinary protagonist identity defers to the protagonist's existing biological sex;
- intersex protagonist reproductive capability remains unavailable pending a richer model;
- incompatible attempts fail before consuming the yearly child-attempt action;
- partnered adoption records both adults as parents;
- single-parent adoption remains supported;
- schema 9 remained sufficient for the additive Run-70 compatibility field.

## Current work — NPC identity + Threadspace family-planning UX coherence

Mavyy's real-device QA after run #70 requested a persistent, visible NPC gender model and a cleaner People/Threadspace interaction layout.

Pending overlay behavior:

- every procedurally created NPC receives one of three NPC genders with default odds of exactly 50% female, 45% male, and 5% nonbinary;
- the active regional first-name pools encode those same weights and every generated first name maps to the rolled NPC gender;
- female NPCs use female reproductive sex and male NPCs use male reproductive sex;
- nonbinary NPCs receive a deterministic 50/50 female/male reproductive-sex assignment;
- procedurally generated NPCs never use the player-only intersex option;
- legacy Run-70 NPC reproductive-sex state is normalized into the new `gender` + `reproductiveSex` authority without renaming existing people;
- every NPC profile adds a Gender stat card beside Relationship, Compatibility, Age, and Marriage;
- active partner/fiance/spouse profiles own a Family Planning section containing `Try for a Child` and `Adopt Child`;
- `Try for a Child` stays visible but muted/disabled when the current pairing cannot conceive; adoption remains available;
- partnered adoption continues recording both adults; the existing single-parent adoption path is preserved outside the Filters panel;
- `Meet a Person` becomes a floating Threadspace control directly beneath Filters and hides whenever Filters is open;
- family-planning controls are removed from the Filters panel;
- descendant continuation preserves the descendant NPC's established gender/reproductive identity instead of rerolling it during protagonist conversion;
- autonomous NPC couples use the same reproductive compatibility authority, routing biologically incompatible couples toward adoption instead of offscreen biological births;
- no save-schema bump is required because the new NPC identity fields are additive and legacy state has deterministic normalization.

### Threadspace stale-projection root cause

`GameEngine` correctly emits a new revision after gameplay actions, but it mutates the authoritative `GameState` in place. `PeopleWorkspace` currently memoizes `buildPeopleWorkspaceModel(state)` only by the stable `state` object identity, so relationship changes and newly created people can remain visually stale until the People screen remounts.

The pending fix passes the engine revision into `PeopleWorkspace` and memoizes the graph on `[state, revision]`. This refreshes graph data after real engine mutations while preserving local camera/filter state and avoiding expensive graph rebuilds during ordinary pan/zoom gestures.

This overlay is not green until both TypeScript gates, every established regression, the expanded family-reproduction regression, production build, Pages artifact upload, and live Pages deployment all pass.

## Phase 5 next slices after corrective QA

Continue without replacing the estate/family foundation:

- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- audit whether NPC-parent death inheritance during an active minor life should use the same protected-inheritance authority;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation; and
- further death → estate review → descendant continuation polish where playtesting proves useful.

## Known quality / architecture issues

- NPC gender/sexual-orientation matchmaking remains intentionally simplified and should be deepened separately rather than mixed into reproductive identity.
- Exact seeded replay serialization remains mandatory; UI clock values must never enter simulation state or runtime IDs.
- Every meaningful player action stays under controlled system/GameEngine ownership; appearance settings remain presentation-only.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- GitHub Actions currently warns that several Node-20-targeted actions are being forced onto Node 24; this is nonblocking but should remain visible.
