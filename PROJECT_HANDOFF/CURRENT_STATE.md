# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `b7cd8d7806dce3e7e6ca677622ea7b7878f13ddd`.

- GitHub Actions run #62 (`34305181164`) completed successfully on 2026-09-09.
- Run #62 expanded correction upload commit `82490825179333f71104e1ca4f69896e6af2ee2c` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Phase 4G Random Event Coherence passed 72/72 checks after the run #61 failures were fixed at their real causes: curly-apostrophe dilemma recognition and backward-compatible legacy semantic choice aliases.
- Phase 4F closeout remained green at 88/88; Politics 80/80, Military 65/65, Combat 51/51, path stories 68/68, lifecycle 48/48, and the AI Interaction Testbench 41/41 all remained green.
- Pages artifact `10086397606` deployed successfully.
- Production main JS is about 887.01 kB minified / 250.12 kB gzip. The >700 kB warning remains tracked optimization debt, not a deployment blocker.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 status

Phase 4 was originally closed after the integration gate, then deliberately reopened for polish at Mavyy's direction before Phase 5. This does not change Phase 5's intended Generations / Estates scope.

### Phase 4E1 — Combat Sports Persistent Fight Network — green

Combat sports uses generic `SocialWorld` ownership under `special-combat-*` for exact coaches, training partners, and recurring rivals. Sanctioned fictional bouts target exact persisted rivals; memories, timeline entries, relationship consequences, succession, Leave Path archival, and later legal re-entry preserve the same NPC/world history.

### Phase 4E2 — Military Service Ecosystem — green

Military service uses `special-military-*` worlds for exact commanders, service peers, and support personnel. Bounded posting rotations, command succession, promotion context, People/Career identity continuity, and deterministic passive unit processing preserve existing enlistment/rank/pay authority.

### Phase 4E3 — Politics Ecosystem — green

Politics uses `special-politics-*` worlds for exact staff, political allies, and recurring opposition. Four-year terms, same-level renewal at the term boundary, higher-office transitions, selective personnel continuity, relationship-driven office pressure/support, succession, People/Career identity, Leave Path, and re-entry preserve the existing election/campaign authority rather than creating a second election roll.

### Phase 4F — Integration & Consistency Closeout — green

Run #60 (`34289835933`) verified the nine-family Career World catalog and structural Career World invariant layer. The expanded baseline from that gate was `8d5527a045f02d3a15d6831be079ac7d5f6c9de5` and the dedicated closeout suite passed 88/88.

- Career UI recognizes acting, music, sports, combat, military, politics, modeling, racing, and directing worlds.
- Impossible duplicate active worlds are conservatively archived rather than erased.
- member/group symmetry, bounded prestige, stale termination metadata, and supplemental-world ownership are repaired without inventing career results.
- AI Career observation uses the same persistent Career World catalog.

### Phase 4G — Random Event Coherence & Consequences — green

Run #62 verified the event-coherence layer at 72/72 checks.

- The random pool remains 691 events, including 664 procedural variants across 80 dilemma families.
- Procedural dilemmas use situation-specific choices rather than broad category-generic buttons.
- target-aware social/family/romance/school/work events bind the exact persistent NPC when appropriate.
- event relationship changes affect that exact relationship and write meaningful NPC memories.
- money, work-performance, and academic-performance consequences synchronize with their authoritative systems rather than only secondary display stats.
- travel vignettes require genuine travel history where the content assumes it.
- timeline and semantic results preserve meaningful event deltas.
- pre-4G pending procedural events remain resolvable; hidden legacy semantic aliases map old callers onto the equivalent coherent modern choice without exposing stale choices to the player.

## Current work — Phase 4H People Threadspace — deployment pending

Phase 4H replaces the old one-folder-at-a-time People tree presentation with one unified, mobile-first relationship workspace while preserving the existing NPC/Relationship/SocialWorld truth underneath it.

### Threadspace model

`PeopleWorkspaceSystem.ts` is a read-only projection over the existing seven People categories:

- Player Family
- Relatives
- Friends & Social
- Romantic History
- School
- Work
- Career Worlds

One canonical node is produced per NPC. A person who is simultaneously a friend, coworker, former classmate, and Career World leader remains one person with multiple labeled category memberships rather than duplicated UI identities.

Real parent/child and partner links remain graph edges. The projection never invents NPC-to-NPC friendships or other social facts that the simulation does not own.

### Threadspace interaction / mobile UX

`PeopleWorkspace.tsx` provides the player-facing graph workspace.

- all seven category hubs occupy the same logical space around the player;
- tapping a hub expands/collapses its NPC nodes;
- multiple hubs may be expanded simultaneously;
- blank-space finger dragging pans the workspace;
- two-finger pinch zooms around the gesture midpoint; desktop wheel zoom is also supported;
- Focus on You and Fit Visible controls recover navigation quickly;
- a collapsible filter panel controls category visibility, deceased NPCs, former affiliations, minimum relationship strength, and search by name/relationship/role/world;
- pressing an NPC opens the existing rich NPC profile sheet, preserving relationship actions, milestones, life/career/finance/health/legal/public history, workplace concerns, shared worlds, and memories.

Camera position, zoom, filter state, and graph layout are presentation state only. They are not written into `GameState`, so save schema remains 9.

### Sustainable layout / performance

The layout uses deterministic category sectors and expanding radial rings rather than a giant fixed DOM tree.

- category hubs stay close to the player while NPCs expand outward inside their category sector;
- canonical nodes receive stable deterministic coordinates for a given model/view;
- logical coordinate space may become large without allocating a huge bitmap or DOM canvas;
- React node rendering is viewport-culled;
- SVG edges are rendered only when both endpoints are in the culled viewport set;
- the People screen is lazy-loaded from `App.tsx`, allowing Vite to split Threadspace code/CSS away from the initial application path.

The dedicated regression includes dense-cast layout checks at 180 and 1,000 people to prevent overlapping-node/boundary-pile regressions.

### AI People semantic coverage

The regression-only AI interface is expanded alongside the actual People redesign rather than in a separate feature phase.

- People observation includes the same canonical seven-category workspace projection.
- exact multi-category membership is visible semantically.
- the existing bounded convenience actions remain, plus a generic exact-NPC interaction command for NPCs beyond the convenience list.
- Argue, Meet someone, workplace concerns, Try for child, and Adopt are represented through real `GameEngine` actions and existing gates.
- adult family-planning presentation boundaries remain aligned with the player People UI.
- `inspectPeopleWorkspace()` is a read-only exact projection helper.

The testbench remains isolated from production UI/player saves and adds no test-only `GameState` properties.

### 4H deployment gate

`peopleWorkspaceRegression.ts` is the dedicated integration/stress suite. 4H is not green until GitHub Actions passes:

- engine and tests TypeScript gates;
- every existing regression including 4G 72/72 and AI 41/41;
- the new Threadspace regression;
- production Vite build;
- Pages artifact upload; and
- live Pages deployment.

If CI exposes a real flaw, fix the root cause rather than weakening the regression.

## Phase 4Q1 AI Interaction Testbench — green baseline

`src/tests/aiInteractionTestbench.ts` is a regression-only semantic interface over the real `GameEngine`.

- Five semantic screens mirror Life, People, Activities, Career, and Assets.
- Stable semantic actions call real public GameEngine methods rather than parallel gameplay logic.
- Exact NPC/entity inspection, before/after state diffs, invariant watches, and deterministic scenario transcripts are available to feature regressions.
- Supplied fixtures are cloned, assigned `ai-test-*` slots, and isolated from real IndexedDB/localStorage through disposable test persistence.
- Test metadata stays outside `GameState` and save schema 9.
- The established AI regression is 41/41 on the run #62 baseline; 4H adds People-specific semantic coverage through its dedicated regression without weakening those 41 checks.

## Phase 4 exit condition

After 4H passes the full CI/build/deploy gate, Phase 4 closes again. Do not create another polish subphase unless playtesting or CI identifies a concrete defect that would be irresponsible to carry forward.

The next macro phase remains **Phase 5 — Generations / Estates**, with its original purpose unchanged.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI and AI testbench must not directly mutate critical state during interaction execution.
- AI observation/projection code must remain read-only; setup fixtures may be fabricated before the isolated engine is created.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world and People-graph population/performance profiling remains important across long dynasties.
- The production application chunk remains above the preferred size threshold; Threadspace is lazy-loaded so this feature should not unnecessarily inflate the initial path, but broader code-splitting remains future work.
- Flat primitive special-career/flag records remain acceptable; schema 10 is not justified by Phase 4 polish alone.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than creating another career truth.
