# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `7e098777cdc3173b49b880797f8670661c470361`.

- GitHub Actions run #59 (`34287594480`), job `102266664547`, completed successfully on 2026-09-08.
- Run #59 expanded corrected upload commit `422fe138e7210702c4527e20ec2777835edea21c` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4E3 Politics Persistent Career Ecosystem passed 80/80 checks.
- Phase 4E2 Military remained green at 65/65 and Phase 4E1 Combat remained green at 51/51.
- Phase 4D8B path stories remained green at 68/68 and Phase 4Q1 AI Interaction Testbench remained green at 41/41.
- Existing specialized suites remained green, including 82/82 core, 77/77 Career World, 48/48 lifecycle, 37/37 generic career-story, 25/25 influence, and 8/8 contextual-information checks.
- Pages artifact `10080087689` deployed successfully. Save schema remains 9.
- The production main JS chunk is about 841.03 kB minified / 239.04 kB gzip. The existing >700 kB warning remains tracked optimization debt, not a current deployment blocker.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4E1 — Combat Sports Persistent Fight Network — green

Combat sports uses generic `SocialWorld` ownership under `special-combat-*` for exact coaches, training partners, and recurring rivals. Sanctioned fictional bouts target exact persisted rivals; memories, timeline entries, relationship consequences, succession, Leave Path archival, and later legal re-entry all preserve the same NPC/world history.

## Phase 4E2 — Military Service Ecosystem — green

Military service uses `special-military-*` worlds for exact commanders, service peers, and support personnel. Bounded posting rotations, command succession, promotion context, People/Career identity continuity, and deterministic passive unit processing preserve existing enlistment/rank/pay authority.

## Phase 4E3 — Politics Ecosystem — green

Politics uses `special-politics-*` worlds for exact staff, political allies, and recurring opposition. Four-year terms, same-level renewal at the term boundary, higher-office transitions, selective personnel continuity, relationship-driven office pressure/support, succession, People/Career identity, Leave Path, and re-entry preserve the existing election/campaign authority rather than creating a second election roll.

## Current work — Phase 4 integration / consistency closeout

This overlay is **deployment pending** until GitHub Actions passes. It is deliberately a closeout/hardening pass rather than another special-career expansion. Its purpose is to make the Phase 4 architecture behave consistently as one product before Phase 5 begins.

### Unified player-facing Career Worlds

`CareerWorldCatalogSystem.ts` becomes the read-only catalog for the nine Phase 4 persistent Career World families:

- acting, music, professional sports, modeling, racing, and directing;
- combat sports;
- military service; and
- politics.

Career → Life Paths → Career Worlds previously rendered only the original six deep-career world types even though combat, military, and politics already had real persistent `SocialWorld` records and appeared in People → Career Worlds. The closeout removes that UI split.

The existing bottom sheet now includes current/history chapters for all nine families. Combat, military, and politics receive compact live cards using their real read-only world projections and ordinary relationship interactions. No duplicate UI-only world state is introduced.

### Career World structural invariants

`enforceStateInvariants()` now repairs structural Career World inconsistencies that can become damaging across long saves while leaving actual career outcomes to their owning systems.

- at most one active Career World per Phase 4 path;
- track-referenced current worlds are preferred when resolving impossible duplicates;
- displaced duplicates are archived rather than deleted;
- orphan active combat/military/politics worlds are archived when the owning career is no longer active;
- duplicate member/group membership is collapsed by exact NPC identity;
- member ↔ group links are reconciled symmetrically;
- archived worlds receive closed member affiliations and termination metadata;
- stale termination metadata is removed from valid active worlds; and
- group prestige is kept finite and bounded.

`validateState()` reports these conditions before repair so imported/corrupt/legacy saves and regression fixtures cannot silently carry impossible Career World topology.

This does not change save schema, create new career outcomes, reroll elections/promotions/contracts, or erase historical NPCs.

### AI testbench consistency

The regression-only AI testbench Career observation now uses the same nine-kind Career World catalog as the player-facing Career Worlds panel. Its duplicate-active-world watch also covers all nine families rather than the original six plus combat only. The testbench remains isolated, read-only during observation, and absent from production UI/save metadata.

### Closeout regression

`phase4CloseoutRegression.ts` adds 88 deterministic checks covering catalog completeness, structural validation/repair, duplicate/orphan world handling, group symmetry and bounded metrics, deep and supplemental Career World coexistence, commitment-capacity behavior, Leave Path continuity, People/Career Identity coherence, save-schema-9 round trips and migration repair, AI observation consistency, and repeated multi-chapter population bounds.

The closeout does not add Phase 4 feature breadth. Royalty, organized crime, fictional intelligence organizations, commune/casino/zoo/museum and other future ecosystems remain deferred and do not block Phase 5.

## Phase 4 exit condition

If this closeout overlay passes GitHub Actions—including both TypeScript gates, every existing regression, the new 88-check closeout suite, production build, artifact upload, and Pages deployment—**Phase 4 is complete**.

The next macro phase is **Phase 5 — Generations / Estates**.

## Phase 4Q1 AI Interaction Testbench — green

`src/tests/aiInteractionTestbench.ts` is a regression-only semantic interface over the real `GameEngine`.

- Five semantic screens mirror Life, People, Activities, Career, and Assets.
- Stable semantic actions call real public GameEngine methods rather than parallel gameplay logic.
- Exact NPC/entity inspection, before/after state diffs, invariant watches, and deterministic scenario transcripts are available to feature regressions.
- Supplied fixtures are cloned, assigned `ai-test-*` slots, and isolated from real IndexedDB/localStorage through disposable test persistence.
- Test metadata stays outside `GameState` and save schema 9.
- The suite runs inside `npm test`, so semantic interaction failures block production build/deployment.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI and AI testbench must not directly mutate critical state during interaction execution.
- AI observation/projection code must remain read-only; setup fixtures may be fabricated before the isolated engine is created.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important across long dynasties.
- The production application chunk remains above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable through this closeout; schema 10 is not justified by Phase 4 alone.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than creating another career truth.
