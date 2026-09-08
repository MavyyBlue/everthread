# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `16fa2ef74f9b9bf55df62e23efa2d8c15f600b8c`.

- GitHub Actions run #56 (`34280932226`), job `102245248914`, completed successfully on 2026-09-08.
- Run #56 expanded uploaded correction commit `3ea3f22ad6a2d8e44a20e8c6b78fd76fbc5909d7` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4E1 Combat Sports Persistent Fight Network passed 51/51 checks after run #55 correctly exposed a real missing-head-coach succession edge case and the production roster logic was fixed rather than weakening the regression.
- Phase 4D8B path-specific multi-year career arcs remained green at 68/68 checks.
- Phase 4Q1 AI Interaction Testbench remained green at 41/41 checks and remains test-only.
- Existing specialized suites remained green, including 82/82 core, 77/77 Career World, 48/48 lifecycle, 37/37 generic career-story, 25/25 influence, and 8/8 contextual-information checks.
- Pages artifact `10077583075` deployed successfully. Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4E1 combat-sports persistent fight network — green

Combat sports now uses generic `SocialWorld` ownership under `special-combat-*` for persistent coaches, training partners, and recurring rivals. Exact rivals are used in sanctioned fictional bout history, NPC memories, and relationship consequences. Leave Path archives the gym/circuit without deleting people or history, and legal re-entry creates a new active chapter. Passive roster maintenance uses deterministic substreams and does not consume the core player RNG stream.

The combat ecosystem is live and playable through the existing Career → Life Paths actions. People → Career Worlds discovers the persistent combat affiliations without a separate People implementation, and Career Identity projects active combat roles over unrelated autonomous NPC occupations without mutating `NpcLifeSystem` career truth.

## Current work — Phase 4E2 military service ecosystem

This overlay is **deployment pending** until GitHub Actions passes. It builds on the run #56 baseline and preserves the existing military enlistment, training, rank progression, finance, commitment, and Leave Path authorities.

### Persistent unit ownership

Military service gains a generic persistent organization namespace under `special-military-*` rather than widening the six-deep `SpecialCareerWorldKind`.

- ordinary `Npc` records own exact commanders, service peers, and support personnel;
- generic `SocialWorld` records own active/former unit membership and posting history;
- ordinary Relationships own boss/coworker ties and their later personal evolution;
- the existing flat military special-career track keeps bounded current-unit metrics and exact recent references only.

The first annual service-processing pass after enlistment creates a persistent fictional unit with a bounded command team, service peers, and support personnel. Old active military saves without a unit gain one naturally on their next Age Up without a save migration.

### Service consequences and continuity

Annual unit processing uses a dedicated deterministic substream and does not consume `state.rngCounter`.

- dead personnel leave active affiliation and are replaced only to bounded minimums;
- loss of a commander establishes one exact living replacement rather than leaving phantom authority;
- command support, unit cohesion, unit prestige, and service standing remain bounded projections;
- strong command/cohesion can modestly improve confidence/discipline, while poor support/cohesion can add stress;
- existing generic rank progression remains the sole promotion authority;
- when that authority creates a rank-up, the military layer contextualizes the existing timeline entry to the exact current commander/unit and gives that commander a shared memory rather than creating a duplicate promotion;
- postings last a deterministic bounded 3–6 years, then archive as service history and create a new exact unit chapter;
- unit names are kept distinct across long service histories, with bounded NPC growth.

This remains gameplay-focused and abstract/non-operational. No practical military or weapons instruction is added.

### Career identity, exit, and People continuity

Career Identity now recognizes active military-world affiliation for NPC profiles: exact commanders, command staff, service peers, and unit specialists outrank an unrelated autonomous standard occupation in presentation while the underlying NPC career truth remains untouched.

The player’s existing branch-aware identity is preserved, with one consistency fix: a branch already named `Air Service` now displays as `Air Service`, not `Air Service Service`.

People → Career Worlds already discovers all `special-*` organizations, so current and former military contacts work without parallel People UI. Leave Path archives the current unit immediately while preserving every NPC, relationship, memory, and prior posting. A later legal re-entry creates a new active military posting while prior units stay historical.

No structured player-save object or migration is added; save schema remains 9.

### 4E2 validation

`militaryCareerWorldRegression.ts` adds 65 focused checks covering age/record enlistment gates, bounded roster creation, exact commander ownership, People integration, player/NPC career identity, read-only projections, existing training/action-economy behavior, RNG discipline, annual idempotence, relationship clocks, dead-peer replacement, command succession, exact promotion context/memory, posting rotation/history, Leave Path archival behavior, legal re-entry through the real `GameEngine`, normal Age Up integration, long-service population bounds, and unique persistent unit identities.

The general 41/41 AI interaction testbench remains unchanged in this slice because there is not yet a shared exported military-enlist availability gate that covers both age/criminal-record eligibility and commitment rules. 4E2 avoids duplicating those rules inside test-only code; its integration regression calls the real existing `GameEngine.enlist()` / `GameEngine.ageUp()` path instead. Semantic military actions can be added later when availability can reuse one authoritative gate.

## Phase 4 exit line

The agreed development timeline is now explicit:

**4E2 Military → 4E3 Politics → one focused Phase 4 integration/consistency closeout → Phase 5 Generations / Estates.**

Royalty, organized crime, fictional intelligence organizations, commune/casino/zoo/museum, and other special-career breadth remain valid future expansions but do not block Phase 5.

## Phase 4Q1 AI interaction testbench — green

`src/tests/aiInteractionTestbench.ts` is a regression-only semantic interface over the real `GameEngine`.

- Five semantic screens mirror Life, People, Activities, Career, and Assets.
- Stable semantic actions call real public GameEngine methods rather than parallel gameplay logic.
- Exact NPC/entity inspection, before/after state diffs, invariant watches, and deterministic scenario transcripts are available to future feature regressions.
- Supplied fixtures are cloned, assigned `ai-test-*` slots, and isolated from real IndexedDB/localStorage through disposable test persistence.
- Test metadata stays outside `GameState` and save schema 9.
- The suite runs inside `npm test`, so a semantic interaction failure blocks the production build/deployment gate.

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
