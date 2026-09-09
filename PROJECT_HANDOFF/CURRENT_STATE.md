# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline entering Phase 5 is commit `a2fdde1e091747812d6875285c22828153c981ee`.

- GitHub Actions run #65 (`34314240397`) completed successfully on 2026-09-09.
- Run #65 expanded upload commit `7f84a4f77825ebaaadf770651833c917f41672ec` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4H People Threadspace and its final connection-label playtest polish are green.
- Phase 4G Random Event Coherence remains 72/72 and all established Phase 4 regressions remained green through run #65.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 is closed after run #65. The persistent Career World ecosystems, integration/coherence closeout, random-event consequence layer, AI Interaction Testbench, and unified People Threadspace are all green.

### Threadspace final state

`PeopleWorkspaceSystem.ts` remains a read-only projection over the seven established People categories. One canonical node exists per NPC even when several categories/worlds connect to that person. Real parent/child and partner structure remains graph-owned simulation truth rather than invented UI relationships.

`PeopleWorkspace.tsx` is a mobile-first shared graph workspace with category expansion, pan/pinch/wheel navigation, Focus on You, Fit Visible, search/filtering, viewport culling, and the existing rich NPC profile sheet. Connection labels are presentation-only, OFF by default, and when enabled sit directly beneath their associated NPC node rather than over the graph line.

Threadspace camera/filter/layout state is not persisted into `GameState`.

## Current work — Phase 5A Estate Planning & Asset Bequests — deployment pending

Phase 5 begins by deepening the existing `GenerationSystem` estate authority rather than replacing it.

### Estate authority

A dedicated `EstateSystem.ts` owns estate planning, read-only estate preview, debt settlement, asset liquidation priority, residuary shares, specific bequests, and the final settlement consumed by descendant continuation.

Planned/implemented in this bundle:

- existing percentage wills remain the residuary-estate authority;
- an empty will means equal shares among living children;
- specific properties, operating businesses, and collectibles may be left to a named living child;
- a specific bequest takes priority over percentage balancing but never causes estate obligations to disappear;
- unassigned transferable assets are liquidated before specifically bequeathed assets when debt requires sales;
- investments are now available to satisfy remaining unsecured estate obligations rather than passing untouched while debt vanishes;
- stale/deceased-beneficiary bequests fall back to normal estate handling;
- unassigned property/business retention preferences remain backward-compatible fallback behavior;
- the selected descendant receives exactly the same settlement shown by the read-only preview;
- the deceased protagonist's personal estate plan resets after generational handoff instead of leaking into the next protagonist.

The new asset-bequest field is backward-compatible and optional in schema 9. New lives initialize it, and `migrateSave()` normalizes missing/invalid lists on every load, including rewind restoration. A schema bump is deliberately not required for this additive structure.

### Player UX

Assets gains an **Estate** tab for adults with living children.

- Shows estimated distributable estate and obligations.
- Allows editable percentage shares with an Equal Shares reset.
- Allows fallback keep/sell preferences for unassigned properties and businesses.
- Allows specific owned properties, operating businesses, and collectibles to be assigned to an individual living child.
- Shows a per-child projected inheritance summary from the same estate planner used by actual settlement.

The death sheet now includes an estate review and shows each eligible descendant's projected inheritance before the player chooses who to continue as.

All estate-plan mutations route through `GameEngine` into `EstateSystem`; UI does not directly mutate inheritance state.

### Phase 5A regression / deployment gate

`estatePlanningRegression.ts` adds focused coverage for:

- schema-9 compatibility and missing-bequest normalization without RNG consumption;
- adult estate-plan gates;
- specific property/business/collectible bequests;
- read-only preview behavior;
- retention-preference fallback;
- debt sale priority and insolvency;
- investments paying estate obligations before inheritance;
- zero-residuary-share heirs receiving a named bequest;
- preview-to-continuation equality;
- estate-plan reset on descendant continuation; and
- dead-beneficiary fallback.

Phase 5A is not green until GitHub Actions passes:

- engine and tests TypeScript gates;
- every established regression from Phases 1–4;
- the new estate-planning regression;
- production Vite build;
- Pages artifact upload; and
- live Pages deployment.

If CI finds a real flaw, fix the owning layer rather than weakening the regression.

## Phase 5 next slices after 5A is green

Continue the roadmap without replacing the estate foundation:

- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation beyond the already-green three-/eight-generation foundation; and
- further death → estate review → descendant continuation polish where playtesting proves it useful.

## Phase 4Q1 AI Interaction Testbench — green baseline

`src/tests/aiInteractionTestbench.ts` remains regression-only and uses real `GameEngine` actions. Five semantic screens mirror Life, People, Activities, Career, and Assets. Exact NPC/entity inspection, before/after diffs, invariant watches, deterministic transcripts, disposable persistence, and read-only People projection remain green. Test metadata stays outside `GameState`.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than creating another career truth.
