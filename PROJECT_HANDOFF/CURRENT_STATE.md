# Everthread — Current State

Last handoff preparation: 2026-09-10  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `fbc5c3ae84897a50c21f730ac59d8cab60d3d9ac`.

- GitHub Actions run #71 (`34440231888`) completed successfully on 2026-09-10 UTC.
- Run #71 expanded upload commit `95b754f55f0d763260f243e38d883197d614cf02` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, full regressions, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 46/46.
- Family continuity regression: 18/18.
- Visual identity regression: 12/12.
- Family reproduction regression: 37/37.
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

## NPC identity + Threadspace family-planning UX coherence — green

Run #71 established persistent visible NPC gender, matching reproductive identity, profile-owned Family Planning controls, descendant identity preservation, autonomous reproductive compatibility, and immediate Threadspace graph invalidation through the GameEngine revision.

Green behavior includes:

- procedural NPC gender remains 50% female / 45% male / 5% nonbinary;
- generated first names correspond to NPC gender;
- binary NPC reproductive sex matches gender and nonbinary NPCs receive deterministic 50/50 female/male reproductive sex;
- procedural NPCs never receive the player-only intersex option;
- active partner/fiance/spouse profiles own Try for a Child and Adopt Child;
- single-parent adoption remains available from Threadspace;
- Meet a Person is currently a standalone Threadspace control;
- closing NPC profiles reflects relationship/new-person changes immediately without tab remounts;
- descendant continuation preserves established NPC gender/reproductive identity;
- autonomous couples use the same biological-compatibility authority and can adopt when biological conception is unavailable.

## Current work — People polish + naming variety

Mavyy's real-device QA after run #71 requested three small quality improvements:

- make the standalone single-parent Adopt Child Threadspace button the same dimensions as the Filters toggle;
- move Meet Someone out of Threadspace and into the Activities screen while preserving the same `social.meet` action-economy/system path;
- substantially expand procedural names to reduce obvious repeated first names such as multiple Noras/Naomis in one life.

Pending overlay behavior:

- Threadspace Filters and standalone Adopt Child share the same responsive width/minimum-height presentation token;
- Meet Someone lives in Activities → Social and is no longer rendered as a Threadspace floating action;
- each of the seven regional name pools expands from 20 to 120 first names and from 20 to 120 surnames;
- each expanded first-name pool remains exactly 60 female / 54 male / 6 nonbinary so the existing one-draw deterministic generation still produces the authoritative 50/45/5 gender odds without adding RNG consumption;
- all first and last names are unique within their regional pool and every active first name resolves to an NPC gender;
- family-reproduction regression coverage locks the expanded pool counts, uniqueness, and gender mapping;
- save schema remains 9.

This overlay is not green until both TypeScript gates, every established regression, production build, Pages artifact upload, and live Pages deployment all pass.

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
