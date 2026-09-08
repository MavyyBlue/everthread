# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `a585471648bd9cfa3ed29b13dfb2e45dbbde6def`.

- GitHub Actions run #57 (`34285299697`), job `102259367746`, completed successfully on 2026-09-08.
- Run #57 expanded uploaded commit `1b78e6ea958b18b7814b93c50b71105bd0ed5145` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4E2 Military Service Ecosystem passed 65/65 checks.
- Phase 4E1 Combat Sports Persistent Fight Network remained green at 51/51 checks.
- Phase 4D8B path-specific multi-year career arcs remained green at 68/68 checks.
- Phase 4Q1 AI Interaction Testbench remained green at 41/41 checks and remains test-only.
- Existing specialized suites remained green, including 82/82 core, 77/77 Career World, 48/48 lifecycle, 37/37 generic career-story, 25/25 influence, and 8/8 contextual-information checks.
- Pages artifact `10079232516` deployed successfully. Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4E1 combat-sports persistent fight network — green

Combat sports uses generic `SocialWorld` ownership under `special-combat-*` for persistent coaches, training partners, and recurring rivals. Exact rivals are used in sanctioned fictional bout history, NPC memories, and relationship consequences. Leave Path archives the gym/circuit without deleting people or history, and legal re-entry creates a new active chapter. Passive roster maintenance uses deterministic substreams and does not consume the core player RNG stream.

The combat ecosystem is live and playable through the existing Career → Life Paths actions. People → Career Worlds discovers the persistent combat affiliations without a separate People implementation, and Career Identity projects active combat roles over unrelated autonomous NPC occupations without mutating `NpcLifeSystem` career truth.

## Phase 4E2 military service ecosystem — green

Military service uses generic `SocialWorld` ownership under `special-military-*` for exact commanders, service peers, and support personnel. Persistent postings last a bounded 3–6 years, archive cleanly, and preserve every NPC/relationship/history link. Command succession maintains one exact living leader, passive unit processing uses a deterministic substream, and existing generic military rank progression remains the sole promotion authority.

Career Identity projects exact military-world roles over unrelated autonomous jobs while leaving underlying NPC career truth untouched. People → Career Worlds discovers current/former unit affiliations automatically. Leave Path archives the current posting immediately, and later legal re-entry creates a new unit chapter. The player’s branch-aware career label avoids duplicated `Service` wording.

## Current work — Phase 4E3 politics ecosystem

This overlay is **deployment pending** until GitHub Actions passes. It builds directly on the run #57 baseline and preserves the existing campaign outcome, campaign cost, political action economy, approval drift, commitment, and Leave Path authorities.

### Persistent office ownership

Politics gains a generic persistent organization namespace under `special-politics-*` rather than widening the six-deep `SpecialCareerWorldKind`.

- ordinary `Npc` records own exact staff, political allies, and recurring opposition figures;
- generic `SocialWorld` records own active/former political-office affiliation history;
- ordinary Relationships own coworker/enemy ties and their later personal evolution;
- the existing flat politics special-career track keeps only bounded current-office metrics and exact recent references.

A successful existing election still decides whether the player holds office. On the next annual political processing pass, Everthread creates the persistent political world around that office. Losing an election does not create a phantom office world.

### Office continuity and relationship-driven consequences

Annual political-world processing uses a dedicated deterministic substream and does not consume `state.rngCounter`.

- active office staff, coalition allies, and opposition remain bounded small rosters;
- deceased personnel leave active affiliation and are replaced only to configured minimums;
- loss of a chief of staff or principal opposition leader establishes an exact living successor without deleting the former NPC;
- staff support, coalition support, opposition pressure, office prestige, and political standing remain bounded projections;
- strong staff/coalition relationships can modestly improve approval/confidence, while weak support or intense opposition can add stress or approval pressure;
- ordinary relationship and hidden-opinion state can drift from sustained approval, so political career outcomes are not isolated from persistent NPC sentiment;
- read-only Career Identity projects current staff/allies/opponents as political roles instead of unrelated autonomous jobs while the political affiliation is active.

Politics remains fictional/abstract. This slice does not provide practical campaigning, lobbying, fundraising, persuasion, or electioneering instructions.

### Terms, elections, and office history

The existing `enterPolitics()` result remains the only election authority. The political Career World observes that result rather than rolling a second election.

- the first office chapter receives a bounded four-year term marker;
- a later same-level election win renews the same office chapter instead of duplicating it;
- winning a different office level archives the prior office and creates a new persistent political chapter;
- selected strong living staff/allies/opponents may continue into the next chapter, preserving believable political history while limiting NPC growth;
- an unrenewed term archives the current office, clears the active political commitment, and leaves former political people/history intact;
- Leave Path archives the active political world immediately and a later legal return creates a new chapter rather than resurrecting an archived one.

No structured player-save object or migration is added; save schema remains 9. Existing politics saves with office state gain their first persistent office naturally through annual processing.

### 4E3 validation

`politicsCareerWorldRegression.ts` adds a broad focused suite covering existing age/budget/commitment campaign gates, deterministic office-world creation, bounded exact rosters, People integration, player/NPC career identity, read-only projections, core-RNG discipline, annual idempotence, relationship clocks, staff/opposition succession, approval/support consequences, same-level reelection, higher-office transitions, selective persistent carryover, term expiry, Leave Path/re-entry through the real `GameEngine`, deterministic seeded casts, unique office identities, and multi-term population bounds.

The general 41/41 AI interaction testbench remains unchanged in this slice; 4E3 integration uses the real `GameEngine.campaign()` / `GameEngine.ageUp()` path directly rather than adding a duplicate politics-availability implementation to test-only code.

## Phase 4 exit line

The agreed development timeline remains explicit:

**4E3 Politics → one focused Phase 4 integration/consistency closeout → Phase 5 Generations / Estates.**

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
