# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `e55a43b1c3b90f93a080e73fe98dd81c40a9b871`.

- GitHub Actions run #53 (`34270610218`), job `102210955082`, completed successfully on 2026-09-08.
- Run #53 expanded uploaded commit `d650a668ef8dc2ae9a24d96490ea7db59d23de5b` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4Q1 AI Interaction Testbench passed 41/41 checks and remains test-only; no player UI, player-save metadata, or schema changes were introduced.
- Phase 4D8A targeted multi-year career stories remain green at 37/37 checks.
- Existing specialized suites remained green, including 48/48 special-career lifecycle checks, 25/25 influence checks, and 8/8 contextual-information checks.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4D8B path-specific multi-year career arcs

This overlay is **deployment pending** until GitHub Actions passes. 4D8B extends the 4D8A scheduler rather than creating a second narrative engine.

### Recent-history resurfacing

The generic 4D8A mentor/rival lane is intentionally unchanged: it begins only from a current or just-completed Career World. 4D8B adds a separate read-only candidate projection for recently archived professional worlds so old career history can surface later without reactivating the archived world.

- Acting can reconnect with former cast/crew from a production archived within the last six years.
- Music can reconnect with former management/creative collaborators from a recently archived music world.
- Professional sports can resurface former coaching/team relationships for up to seven years after a team world ends.
- Modeling can reconnect with former agency/campaign contacts.
- Motorsport can resurface former engineering/race-team contacts for up to seven years.
- Directing can reconnect with former department heads/producers/cast.
- Exact targets must still be living, connected, non-estranged, non-enemy former collaborators with a sufficient relationship score.
- The system chooses at most one strongest eligible collaborator per archived world and weights recency, relationship strength, hidden opinion, and leadership role.
- Path-specific stories use a five-year per-career cooldown and bounded lineage markers on the existing flat special-career track.

### Shared scheduler and lifecycle safety

Path stories share the same 4D8 scheduler, deterministic RNG substream, one-start-per-age rule, and two-beat queue cap as mentor/rival stories.

- `storyPathLastStartAge`, `storyPathArcStarts`, `storyPathLastNpcId`, `storyPathLastWorldId`, and `storyPathLastArc` are bounded primitives on the existing career track; no new structured story graph or schema migration is added.
- Direct queue validation binds each path arc to the correct career kind, a recent archived Career World, an exact eligible former member, and real career evidence.
- Story choices use only existing EventSystem effects: relationship/hidden opinion, happiness, fame/public reputation, confidence, creativity, charisma, athleticism, discipline/willpower/karma, and stress.
- No path-story effect creates a project, release, contract, team, agency agreement, Career World, retirement, dismissal, or comeback.
- Creative careers remain retired/stepped-away until a later successful professional action passes the normal `specialCareerStartGate` / re-entry rules.
- Professional sports and motorsport retirement remain final for the life even when former colleagues reconnect socially.
- Archived worlds remain archived throughout every story beat.

### 4D8B content

The dedicated special-career story registry grows from 6 to 18 beats while remaining outside the ordinary 691-event random pool.

Six new two-beat path arcs are defined:

- Acting — `The Cast List Again` → `One More Scene`
- Music — `The Song That Came Back` → `Second Life`
- Modeling — `The Old Booking Book` → `Back in the Room`
- Professional sports — `Message From the Old Locker Room` → `What They Remember`
- Motorsport — `An Old Engineer Calls` → `The Data They Kept`
- Directing — `The Crew Still Talks` → `Another Set, Maybe`

These are deliberately opportunity-context stories rather than automatic employment offers. Their consequences feed systems the real career mechanics already consume, so later auditions, releases, bookings, seasons, free-agent profiles, or directing work can benefit or suffer naturally without bypassing lifecycle ownership.

### 4D8B validation

`specialCareerPathStoryRegression.ts` adds 68 focused checks covering:

- all six path-specific candidate families and exact archived-world targets;
- active/just-ended/too-old world exclusion;
- dead/estranged target cancellation before a new opening;
- path/career mismatch rejection;
- bounded cooldown and lineage markers;
- no core-RNG consumption by direct queueing or annual story scanning;
- exact NPC continuity across delayed beats and changing personal relationship types;
- archived-world preservation and no retirement/comeback mutation;
- final sports/racing retirement protection;
- same-age scanner idempotence and one-start-per-age bounds; and
- a real AI-testbench playthrough that Ages Up through `GameEngine`, receives the new acting reunion event, resolves the choice through EventSystem, and verifies zero invariant failures.

The existing 4D8A regression remains 37 checks and now expects the combined 18-event dedicated registry.

## Phase 4Q1 AI interaction testbench — green

`src/tests/aiInteractionTestbench.ts` is a regression-only semantic interface over the real `GameEngine`.

- Five semantic screens mirror Life, People, Activities, Career, and Assets.
- Stable semantic actions call real public GameEngine methods rather than parallel gameplay logic.
- Exact NPC/entity inspection, before/after state diffs, invariant watches, and deterministic scenario transcripts are available to future feature regressions.
- Supplied fixtures are cloned, assigned `ai-test-*` slots, and isolated from real IndexedDB/localStorage through disposable test persistence.
- Test metadata stays outside `GameState` and save schema 9.
- The suite runs inside `npm test`, so a semantic interaction failure blocks the production build/deployment gate.

4D8B is the first gameplay slice to actively use this testbench as part of its own feature validation.

## Next after 4D8B is green

Playtest the path-specific history arcs for pacing, repetition, and whether career consequences feel meaningful. Then either:

- perform a small 4D8C hardening/content pass if queue/performance/player feedback reveals a real need; or
- move to the next persistent special-career ecosystem rather than expanding counts for their own sake.

A later deeper career-story pass can add true repeat-collaborator project casting or explicit story-originated opportunity offers, but those must route through existing path-specific start/offer systems and lifecycle gates rather than directly mutating career state from EventSystem.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI and AI testbench must not directly mutate critical career state during interaction execution.
- AI observation/projection code must remain read-only; setup fixtures may be fabricated before the isolated engine is created.
- Testbench action availability should reuse real gates/projections whenever one exists rather than duplicating eligibility rules.
- Formal dismissal/release remains owned by existing stress or path-specific lifecycle systems; story/influence systems are not firing authorities.
- Distribution agreements are business terms, not proof of active music Career World participation.
- Career stories must use real persistent NPCs and Social World history; do not invent a second NPC/professional relationship graph.
- Story queue growth and archived-world scans must remain bounded as more chains are added.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk remains above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
