# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `6899cbd84775720cb17394f358aaa4a2ba486418`.

- GitHub Actions run #47 (`34259848499`), job `102174773799`, completed successfully on 2026-09-08.
- Run #47 expanded uploaded commit `a267ad105ed7e7201d34ffe3ebc4deacb6dd608a` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- The full suite included 82 core regressions plus specialized suites; Phase 4D7A's lifecycle suite passed 38/38 and contextual information passed 8/8.
- Phase 4D6 leader/rival consequences and the contextual-information mobile polish remain green.
- Phase 4D7A special-career lifecycle foundation is green and public.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4D7B player-facing end states and residual economics

This overlay is **deployment pending** until GitHub Actions passes. It builds directly on the green 4D7A lifecycle foundation rather than introducing another career-state authority.

### Player-facing lifecycle UI

- Life Paths now surfaces the normalized lifecycle status for acting, music, professional sports, modeling, motorsport, and film directing directly in each path card.
- The existing special-career capacity card remains the compact place for current commitment exits.
- Established deep careers expose a separate `Retire` action when the shared lifecycle retirement gate allows it. Binding productions, tours, representation terms, sports contracts, and racing seasons/contracts still block voluntary retirement.
- Motorsport retirement is routed through the existing racing lifecycle owner rather than bypassing it with the generic transition.
- Stepped-away and retired creative paths remain visible as historical lifecycle rows. When re-entry is allowed, the UI explains that the next successful professional action starts the return/comeback; the existing professional action buttons remain the actual re-entry route.
- Professional sports and motorsport retirement remain final for that life.
- No extra explanatory developer paragraph is added to gameplay cards. New system context goes into the Career `ⓘ` preview under the approved contextual-information UI rule.

### Music residual economics

- Leaving or retiring from music no longer erases an accepted distribution agreement. Distribution is a separate business term from active Career World participation.
- Recent released catalog can continue its existing bounded stream/royalty tail after the player steps away or retires.
- Passive catalog processing does not reactivate music, does not resurrect a Career World, does not advance active career years, and does not apply active manager-pressure/stress consequences.
- Residual royalties remain subject to the already-signed distribution share/reach terms, preventing retirement/exit from becoming a royalty-share exploit.
- Music career-year accounting now tracks cumulative inactive gaps through `careerPauseYears`, so a later creative comeback does not count retired/stepped-away years as active professional years.
- Same-age residual processing remains idempotent through the existing `lastMusicCycleAge` guard.

### Contextual-information UI rule

Mavyy approved this as a permanent UI rule:

- Developer/system explanation copy belongs in the relevant header `ⓘ` preview instead of being repeated inside gameplay cards unless the player needs the text to make an immediate decision.
- The preview follows the press/hold pointer, disappears on release, is read-only, and dynamically reduces its text scale to keep all explanation visible inside its available viewport area.
- 4D7B adds music residual royalty/distribution context to that Career information popup when a music career exists.

### Validation added in this patch

The lifecycle regression expands beyond the green 38-check 4D7A baseline to cover:

- leaving music while preserving signed distribution terms;
- retirement archiving the music Career World while preserving distribution terms;
- post-retirement residual catalog royalties;
- no phantom active career/world/career-year progression during residual processing;
- no active management-pressure or stress effects while retired;
- same-age residual idempotence;
- comeback pause-year accounting; and
- career-year totals that exclude the retired gap after comeback.

No save-schema bump is required. `careerPauseYears` is a bounded primitive on the existing music/special-career track and older saves default cleanly to zero.

## Next after 4D7B is green

Finish any remaining 4D7 end-state edge cases revealed by Actions/playtesting, then proceed to **Phase 4D8 — targeted multi-year special-career event chains** grounded in persistent NPCs and lifecycle history.

The first 4D8 chains should favor systems already rich enough to support real continuity: mentor/manager arcs, rivalry escalation/cooling, comeback opportunities, repeated project collaborators, team/agency reunions, and crisis follow-ups. They should use existing Social Worlds, NPC memories, relationships, delayed consequences, action economy, and lifecycle states rather than introducing a parallel story graph.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI must not directly mutate critical career state.
- Formal dismissal/release remains owned by existing stress or path-specific lifecycle systems; shared lifecycle/influence code is not a second firing authority.
- Distribution agreements are business terms, not proof of active music Career World participation.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk remains above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
