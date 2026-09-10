# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `20071886751402a89e23a2f049b11ffb4f628ca1`.

- GitHub Actions run #68 (`34422782158`) completed successfully on 2026-09-10 UTC.
- Run #68 expanded upload commit `9607516872d7fd53d7fb007b8c638bc668364443` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, full regressions, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 46/46.
- Family continuity regression: 18/18.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 remains closed. Persistent Career World ecosystems, integration/coherence closeout, random-event consequences, AI Interaction Testbench coverage, and unified People Threadspace are green. Threadspace connection labels remain presentation-only and OFF by default.

## Phase 5A — estate and family-continuity foundation — green

`EstateSystem.ts` remains the authority for estate planning, preview, debt settlement, liquidation, spouse/child residuary shares, specific bequests, protected minor inheritance, and settlement consumed by descendant continuation.

Green family continuity now includes:

- legal spouse becomes widowed at protagonist death;
- dating/engaged survivor becomes single and clears stale deceased-partner state;
- surviving committed partners retain bereavement history without granting unmarried estate-spouse rights;
- protected inheritance for selected and off-screen minors releases at adulthood;
- parent/stepparent affinity at 20 or below can create bounded household friction;
- repeated household friction can contribute to adult separation/divorce without making it player-controlled or guaranteed;
- loyal/calm couples receive stability protection and tension history is cooldown-bounded.

## Current work — Everthread visual identity pass

Mavyy supplied three original teal-and-gold player crest assets: woman, man, and gender-neutral. The current visual pass must preserve simulation architecture and user customization while establishing an unmistakable Everthread presentation language.

Pending overlay behavior:

- replace the old CSS-drawn player face with the supplied crest selected from `Character.genderIdentity`;
- woman → female crest, man → male crest, nonbinary/other → neutral crest;
- creation UI previews the crest before creating a life;
- the active crest updates automatically after descendant continuation because the authoritative active `Character` drives it;
- Life Saves use the same authoritative player crest rather than an unrelated monogram;
- add reusable teal-and-gold framing, jewel/glow accents, refined cards, navigation, sheets, events, stats, and Age Up styling without copying another life simulator's UI;
- keep theme mode, arbitrary accent color, text scale, high-contrast, and reduced-motion support;
- add optional offline-safe typeface choices and custom text color with an automatic theme-following option;
- visual preferences remain presentation-only and require no save-schema bump;
- fold in the previously queued unique export filename fix while `MetaSheet` is already being modified: character name + generation + age + UI-only UTC timestamp;
- never place wall-clock export timestamps into seeded simulation state.

The supplied art assets are production inputs. Do not regenerate or restyle them unless Mavyy explicitly requests an art edit.

The visual pass is not green until both TypeScript gates, every established regression, the new visual-identity regression, production build, Pages artifact upload, and live Pages deployment all pass.

## Phase 5 next slices after visual QA

Continue without replacing the estate/family foundation:

- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- audit whether NPC-parent death inheritance during an active minor life should use the same protected-inheritance authority;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation; and
- further death → estate review → descendant continuation polish only where playtesting proves it useful.

## Known quality / architecture issues

- Exact seeded replay serialization remains mandatory; UI clock values must never enter simulation state or runtime IDs.
- Every meaningful player action stays under controlled system/GameEngine ownership; appearance settings remain presentation-only.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- GitHub Actions currently warns that several Node-20-targeted actions are being forced onto Node 24; this is nonblocking but should remain visible.
