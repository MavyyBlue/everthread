# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `3f63ceea5272b8419e31e099bf1a9cc84f0ccab8`.

- GitHub Actions run #54 (`34276175071`), job `102229611302`, completed successfully on 2026-09-08.
- Run #54 expanded uploaded commit `af8ab50b3a5bdd59822e41144fa2033a864febc4` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4D8B path-specific multi-year career arcs passed 68/68 checks; the dedicated special-career story registry is now 18 beats while remaining outside the ordinary random-event pool.
- Phase 4Q1 AI Interaction Testbench remained green at 41/41 checks and successfully exercised the 4D8B player-flow regression.
- Existing specialized suites remained green, including 82/82 core, 77/77 Career World, 48/48 lifecycle, 37/37 generic career-story, 25/25 influence, and 8/8 contextual-information checks.
- Pages artifact `10075800421` deployed successfully. Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4E1 combat-sports persistent fight network

This overlay is **deployment pending** until GitHub Actions passes. 4D8C remains optional because run #54 exposed no queue, lifecycle, or performance defect that justifies delaying the next gameplay ecosystem. 4E1 therefore begins the next outward Phase 4 expansion with combat sports.

### Persistent combat Career World

Combat sports now uses the same authoritative ownership model as the rest of Everthread without being forced into the six-deep-career lifecycle type:

- normal `Npc` records own persistent coaches, training partners, and circuit rivals;
- the existing `SocialWorld` model owns gym/circuit affiliation history under `special-combat-*`;
- the ordinary Relationship system owns coach/coworker/enemy relationships and later personal evolution; and
- the existing combat special-career track stores only bounded career metrics and exact recent references.

A first successful training block creates one persistent combat organization with an original gym identity, a bounded coaching team, training partners, and recurring rivals. Annual processing uses a dedicated deterministic substream to replace dead roster members only up to minimum group size, drift gym prestige, and derive coach support, training chemistry, rivalry pressure, and career momentum. The core player RNG stream is not consumed by passive roster/world maintenance.

Combat deliberately remains outside `SpecialCareerWorldKind` for this slice. That type still describes the six deep acting/music/sports/modeling/racing/directing ecosystems with their own lifecycle/story configuration. Reusing `SocialWorld` directly avoids widening every deep-career `Record<SpecialCareerWorldKind,...>` merely to gain persistence.

### Exact opponents and systemic consequences

The old anonymous combat opponent roll is replaced by exact persistent rivals from the active combat world.

- A sanctioned fictional bout selects a living NPC from the persisted rival group.
- The exact opponent ID, world ID, result, age, and purse are retained on bounded combat-track markers.
- Timeline history names and links the exact opponent.
- The rival receives a `combat_bout` memory and the normal relationship/hidden-opinion system changes.
- Existing abstract striking/grappling/defense/stamina/fight-IQ, health, fame, reputation, purse, and title mechanics remain the outcome inputs/consequences.
- The existing `special.fight` action budget still permits at most two major bouts per age.
- Dead rivals cannot remain eligible opponents; bounded annual roster maintenance replaces them without deleting the old NPC or affiliation history.

This remains gameplay-focused and abstract. It does not add practical real-world fighting instruction.

### Career identity, exit, and People continuity

Combat-world affiliation integrates with existing cross-system coherence:

- active combat commitment continues to display the player as `Combat Athlete`;
- active coach/athlete affiliation can override an unrelated autonomous standard job in NPC profile presentation, using the same read-only role/income projection rule established for other special careers;
- People → Career Worlds already discovers all `special-*` organization affiliations, so combat contacts appear there without a parallel People implementation;
- Leave Path archives the active combat world while preserving every NPC, relationship, memory, and former affiliation; and
- a later legal re-entry creates a new active combat world while the earlier one remains archived.

No player save metadata or structured state object is added; save schema remains 9.

### 4E1 validation

`combatCareerWorldRegression.ts` adds 51 focused checks covering underage gating, bounded world creation, exact coaches/rivals, People affiliation, NPC/player career identity, action-economy limits, exact fight targets/memories/timeline references, core RNG discipline, annual idempotence, dead-roster replacement, read-only projections, Leave Path archive semantics, re-entry without world resurrection, and AI-testbench semantic training/fighting through the real `GameEngine`.

The AI testbench gains `career.combat.train` and `career.combat.fight` commands. Their availability reuses `specialCareerStartGate`, `isSpecialCareerPathActive`, and the real action-economy policies rather than duplicating combat eligibility rules. Its invariant watch also rejects multiple simultaneously active `special-combat-*` worlds.

## Phase 4Q1 AI interaction testbench — green

`src/tests/aiInteractionTestbench.ts` is a regression-only semantic interface over the real `GameEngine`.

- Five semantic screens mirror Life, People, Activities, Career, and Assets.
- Stable semantic actions call real public GameEngine methods rather than parallel gameplay logic.
- Exact NPC/entity inspection, before/after state diffs, invariant watches, and deterministic scenario transcripts are available to future feature regressions.
- Supplied fixtures are cloned, assigned `ai-test-*` slots, and isolated from real IndexedDB/localStorage through disposable test persistence.
- Test metadata stays outside `GameState` and save schema 9.
- The suite runs inside `npm test`, so a semantic interaction failure blocks the production build/deployment gate.

4D8B was the first gameplay slice to actively use this testbench; 4E1 extends the semantic surface to combat training and exact-NPC bouts.

## Next after 4E1 is green

Human playtesting should verify that recurring coaches/rivals feel like a real career circle rather than decorative names, while deterministic regression watches exact-target integrity, world duplication, and roster bounds. If that foundation is healthy, continue Phase 4E with another currently shallow special path—military or politics are the strongest next candidates because both already have annual progression but lack persistent people around the player.

4D8C stays available only if story pacing/queue behavior later reveals a concrete defect. Do not expand 4D story counts merely because the slot exists.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI and AI testbench must not directly mutate critical career state during interaction execution.
- AI observation/projection code must remain read-only; setup fixtures may be fabricated before the isolated engine is created.
- Testbench action availability should reuse real gates/projections whenever one exists rather than duplicating eligibility rules.
- Formal dismissal/release remains owned by existing stress or path-specific lifecycle systems; story/influence systems are not firing authorities.
- Distribution agreements are business terms, not proof of active music Career World participation.
- Career stories and new special-career ecosystems must use real persistent NPCs and Social World history; do not invent a second NPC/professional relationship graph.
- Not every persistent special-career organization must be added to the six-deep `SpecialCareerWorldKind`; reuse generic Social World ownership when lifecycle semantics differ and integration does not require widening the deep-career type.
- Story queue growth and archived-world scans must remain bounded as more chains are added.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk remains above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
