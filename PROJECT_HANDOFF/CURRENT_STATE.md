# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `ffa07d891fd812d4d0a8b4f5f5d3b14218fcac18`.

- GitHub Actions run #50 (`34266625933`), job `102197486549`, completed successfully on 2026-09-08.
- Run #50 expanded uploaded commit `126bb733409c78e2807a0b0e1948aa49aa37bf40` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4D8A targeted multi-year career stories passed 37/37 after the regression correction in run #50.
- Existing specialized suites remained green, including 48/48 special-career lifecycle checks, 25/25 influence checks, and 8/8 contextual-information checks.
- Phase 4D6 leader/rival consequences, contextual-information mobile polish, 4D7 lifecycle/end-state work, and 4D8A mentor/rival story foundation are green and public.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4Q1 AI interaction testbench

This overlay is **deployment pending** until GitHub Actions passes. 4Q1 is a cross-cutting QA infrastructure pass inserted before 4D8B. It does not replace, recreate, or visually alter the player interface.

### Player separation contract

- The player application remains `App.tsx` → the existing screens/components → `GameEngine` → authoritative `GameState`/systems → `SaveSystem`.
- The AI testbench exists only under `src/tests/` and is imported only by the regression runner. Production source does not import it.
- The production Vite entrypoint remains unchanged. No AI mode, developer menu, test button, hidden player route, or alternate player interface is added.
- The testbench never receives a live player state object by reference. Supplied fixtures are `structuredClone`d before use.
- Every testbench life is reassigned to an `ai-test-*` slot id before GameEngine interaction.
- During regression execution, browser persistence globals are replaced with an isolated in-memory `Storage` shim and `indexedDB` is disabled for the harness lifetime. Forced GameEngine autosaves therefore write only to disposable test memory.
- The original global persistence objects are restored only after the isolated engine's save queue is flushed.
- Testbench metadata such as screen selection, before/after observations, transcripts, and diffs lives outside `GameState`; it is not added to save schema 9.

### Semantic AI interface

`src/tests/aiInteractionTestbench.ts` adds a machine-readable interaction surface over the real `GameEngine` rather than a second gameplay implementation.

- Five semantic screens mirror the player navigation domains: `life`, `people`, `activities`, `career`, and `assets`.
- Observations expose stable IDs, exact NPC/entity IDs, current state summaries, pending-event choices, special-career lifecycle projections, Career Worlds, and current assets rather than relying on pixel coordinates or CSS selectors.
- Stable action IDs route through the same public `GameEngine` APIs the player interface uses: Age Up/event choices, relationship interactions and milestones, wellness, standard career actions, deep-career actions, lifecycle exit/retirement, and representative asset/investment/business actions.
- Relationship-specific availability reuses `canAskOutNpc`, `canHookUpWithNpc`, and `canReconcileWithNpc`.
- Deep-career start/exit/retirement availability reuses `CommitmentSystem`, `SpecialCareerExitSystem`, and `SpecialCareerLifecycleSystem` gates.
- Required pending events semantically block non-event interactions so the harness reflects the player's modal interaction contract even if a lower-level engine method could otherwise be called directly.
- Private setup commands such as forced events are test-only commands and are never exposed by player UI action lists.

### Interaction diagnostics

Every semantic command produces:

- the command and authoritative `EngineResult`;
- before/after screen observations;
- a bounded machine-readable state diff;
- immediate `validateState()` results plus focused watches for negative age, non-finite cash, duplicate active spouses, duplicate delayed-event IDs, and duplicate active deep-career worlds.

The harness also exposes `inspectNpc()`, `inspectCareer()`, `inspectTimeline()`, `availableActions()`, and deterministic `runScenario()` transcripts. The goal is to make multi-step feature validation easy enough to run before packaging future gameplay work.

### Validation added in 4Q1

`aiInteractionRegression.ts` adds 41 focused checks covering:

- cloned fixture ownership and `ai-test-*` slot isolation;
- read-only observation;
- semantic coverage for all five navigation domains;
- GameEngine routing and action-ledger mutation;
- before/after diffs and invariant watches;
- real NPC creation, inspection, exact targeting, and Ask Out eligibility;
- unresolved-event blocking and exact EventSheet choice projection;
- event resolution through GameEngine;
- in-memory save interception with no caller-owned state mutation;
- normalized special-career lifecycle/Career World inspection;
- semantic retirement using the real lifecycle owner and archive behavior;
- archived Career World affiliation history on exact NPCs;
- deterministic identical transcripts for identical seeded scripts; and
- mutation-free rejection of unknown semantic commands.

`runRegression.ts` now awaits the AI interaction suite after the existing specialized regressions. Because the current deployment workflow already runs `npm test` before `npm run build`, a 4Q1 failure automatically prevents production build and Pages deployment without requiring a workflow rewrite.

This meaningful bundle also explicitly deletes the stale root `everthread-source-fixed.zip` left behind by the earlier filename mistake. The active mobile importer still recognizes only the exact root file `everthread-source.zip`.

## Next after 4Q1 is green

Return immediately to **Phase 4D8B — path-specific career arcs** and use the new semantic harness for implementation validation before packaging. Priorities remain:

- acting/directing repeat collaborators and reunion projects;
- music catalog sleeper-hit / former-manager / reunion arcs;
- modeling agency reunion and reputation recovery/fallout;
- sports/racing former team, coach, final-season, and post-retirement relationship follow-ups;
- creative retirement/comeback opportunities that respect 4D7 lifecycle gates rather than bypassing them.

As future systems are added, extend semantic action coverage alongside the player-facing feature instead of creating a separate test-only gameplay rule set.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI and AI testbench must not directly mutate critical career state during interaction execution.
- AI observation/projection code must remain read-only; setup fixtures may be fabricated before the isolated engine is created.
- Testbench action availability should reuse real gates/projections whenever one exists rather than duplicating eligibility rules.
- Formal dismissal/release remains owned by existing stress or path-specific lifecycle systems; story/influence systems are not firing authorities.
- Distribution agreements are business terms, not proof of active music Career World participation.
- Career stories must use real persistent NPCs and Social World history; do not invent a second NPC/professional relationship graph.
- Story queue growth must stay bounded as more chains are added.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk remains above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
