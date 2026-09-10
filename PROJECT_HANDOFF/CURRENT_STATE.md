# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `c371ef4c0805dbbc8c46d6ee68bd9b0c95a0a33d`.

- GitHub Actions run #69 (`34428133164`) completed successfully on 2026-09-10 UTC.
- Run #69 expanded upload commit `529349d28524533a4bfd156d2397462dc132b779` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, full regressions, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 46/46.
- Family continuity regression: 18/18.
- Visual identity regression: 12/12.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 remains closed. Persistent Career World ecosystems, integration/coherence closeout, random-event consequences, AI Interaction Testbench coverage, and unified People Threadspace are green. Threadspace connection labels remain presentation-only and OFF by default.

## Phase 5A — estate and family-continuity foundation — green

`EstateSystem.ts` remains the authority for estate planning, preview, debt settlement, liquidation, spouse/child residuary shares, specific bequests, protected minor inheritance, and settlement consumed by descendant continuation.

Green family continuity includes:

- legal spouse becomes widowed at protagonist death;
- dating/engaged survivor becomes single and clears stale deceased-partner state;
- surviving committed partners retain bereavement history without granting unmarried estate-spouse rights;
- protected inheritance for selected and off-screen minors releases at adulthood;
- parent/stepparent affinity at 20 or below can create bounded household friction;
- repeated household friction can contribute to adult separation/divorce without making it player-controlled or guaranteed;
- loyal/calm couples receive stability protection and tension history is cooldown-bounded.

## Everthread visual identity pass — green

Run #69 established the first Everthread-specific visual language while preserving player appearance preferences.

Green behavior includes:

- supplied woman, man, and gender-neutral teal/gold crests are production assets and are selected from the active `Character.genderIdentity`;
- creation previews the crest and descendant continuation naturally updates the active crest through the authoritative character;
- Life Saves use the same crest authority;
- reusable teal/gold framing, jewel/glow accents, refined cards, navigation, sheets, events, stats, and Age Up styling are deployed;
- theme mode, arbitrary accent color, text scale, high contrast, and reduced motion remain supported;
- offline-safe typeface and optional custom text-color controls are available;
- save exports now use unique character + generation + age + UI-only UTC timestamp filenames;
- export clock values never enter seeded simulation state.

The supplied art assets are production inputs. Do not regenerate or restyle them unless Mavyy explicitly requests an art edit.

## Current corrective work — biological parenting coherence

Real-device playtesting after run #69 exposed a family-planning authority gap: `haveChild()` currently treats any current partner as biologically compatible because NPCs did not previously carry reproductive-sex information.

The corrective overlay establishes a narrow, deterministic reproductive identity layer without creating another character database:

- NPC reproductive sex is explicit for newly generated romantic prospects and can be deterministically derived for legacy NPCs without consuming simulation RNG;
- `Try for child` uses biological sex, not gender identity or sexual orientation, to determine current conception compatibility;
- the current model allows the biological path only for female/male reproductive pairings;
- female/female and male/male pairings do not expose or execute `Try for child`;
- a nonbinary protagonist is evaluated from the existing authoritative `Character.sex`, so gender identity itself neither blocks nor enables biological parenting;
- intersex reproductive capability remains conservative until a richer fertility/reproductive-role model is intentionally designed;
- incompatible biological attempts fail before consuming the yearly child-attempt action or creating pregnancy state;
- adoption remains available regardless of biological compatibility;
- if a current partner participates in adoption, the adopted child records both the protagonist and partner as parents and the partner records the child;
- single-parent adoption remains available as before;
- no save-schema bump is required because the additive NPC sex field is optional for legacy saves and has a deterministic fallback.

This corrective patch is not green until both TypeScript gates, every established regression, the family-continuity and visual-identity suites, the new family-reproduction regression, production build, Pages artifact upload, and live Pages deployment all pass.

## Phase 5 next slices after corrective QA

Continue without replacing the estate/family foundation:

- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- audit whether NPC-parent death inheritance during an active minor life should use the same protected-inheritance authority;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation; and
- further death → estate review → descendant continuation polish only where playtesting proves it useful.

## Known quality / architecture issues

- NPC gender/sexual-orientation matchmaking remains intentionally simplified and should be deepened separately rather than folded into the biological-parenting correction.
- Exact seeded replay serialization remains mandatory; UI clock values must never enter simulation state or runtime IDs.
- Every meaningful player action stays under controlled system/GameEngine ownership; appearance settings remain presentation-only.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- GitHub Actions currently warns that several Node-20-targeted actions are being forced onto Node 24; this is nonblocking but should remain visible.
