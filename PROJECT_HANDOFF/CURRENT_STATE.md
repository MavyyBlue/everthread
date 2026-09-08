# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `8c714ad594c3eff4d762713f9fd89ae9c2df01ab`.

- GitHub Actions run #48 (`34262635682`), job `102184141302`, completed successfully on 2026-09-08.
- Run #48 expanded uploaded commit `daf83dd3068136924afe7af9298bc153857d99c9` into the build-bot commit above.
- Source-overlay import, dependency install, engine/test typechecks, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- The suite included 82 core regressions plus specialized suites; Phase 4D7 lifecycle coverage passed 48/48 and contextual information passed 8/8.
- Phase 4D6 leader/rival consequences, contextual-information mobile polish, 4D7A lifecycle foundation, and 4D7B player-facing retirement/comeback plus residual music economics are green and public.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4D8A targeted multi-year career-story foundation

This overlay is **deployment pending** until GitHub Actions passes. It builds on existing Social Worlds, Relationships, NPC memories, Career World influence, and the global delayed-event queue rather than introducing a parallel story graph.

### Story ownership and scheduling

- `SpecialCareerStorySystem.ts` scans current or just-completed deep Career Worlds after the age's career cycles settle.
- It can start a story only from an exact persistent Career World NPC. 4D8A uses two general arc families: leader/mentor support and professional rivalry.
- At most one new special-career chain may start in an age, and no new opening is added when two special-career story beats are already queued.
- Story scanning is idempotent per age through `flags.specialCareerStoryScanAge` and uses a deterministic career-story substream that does not consume the core `rngCounter`.
- Mentor and rivalry openings have multi-year per-career cooldown markers stored as bounded primitives on the existing special-career track. No schema bump is required.
- Acting/directing projects that finish this age may seed a story from the people who just worked on them. Older archived worlds do not generate fresh story openings forever.

### Delayed event-chain integration

- Six new data-defined career-story beats live in `src/data/specialCareerStoryEvents.ts`: three mentor beats and three rivalry beats.
- They are not part of the ordinary random event pool. The story system queues the opening against an exact NPC, and the existing delayed-event mechanism carries later beats across years.
- Follow-up choices use `npcSelector:'payload'`, so the exact person is retained instead of being re-selected later.
- Follow-ups require the persisted relationship/NPC to remain available. If the NPC dies or the relationship is no longer valid, the due event cancels cleanly instead of substituting a generic stranger.
- Career affiliation remains owned by Social World history. A former colleague may become a friend, enemy, partner, spouse, or ex without losing the fact that the story began through a Career World.
- Archived Career Worlds are not reactivated by later story beats.

### First 4D8A content

**Mentor arc:** a strong Career World leader can offer guidance; accepting or cautiously engaging may lead years later to an introduction/opportunity and then a final legacy conversation about what that support meant.

**Rivalry arc:** a high-pressure rival can turn routine competition personal; the feud resurfaces a year later and can eventually become a truce, mutual respect, or a lasting rivalry depending on player choices.

The effects intentionally feed existing systems—relationship score, hidden opinion/memory through normal event resolution, stress, confidence, fame/public reputation, happiness, karma, and timeline history. They do not create a second professional-relationship authority or directly fire/release the player.

### Validation added in this patch

`specialCareerStoryRegression.ts` adds deterministic coverage for:

- six unique data-defined story beats;
- exact leader/rival targeting;
- opening queue duplicate prevention and per-career cooldown stamps;
- no core RNG consumption during queueing/scanning;
- multi-year mentor progression through all three beats;
- relationship-type evolution without losing the exact NPC;
- archived-world follow-ups without Career World resurrection;
- dead-NPC cancellation of delayed follow-ups;
- mentor/rival candidate eligibility from real influence state;
- estranged-target rejection;
- just-ended project eligibility versus stale archived-world exclusion;
- same-age scan idempotence; and
- delayed-story queue pressure limits.

## Next after 4D8A is green

Proceed to **Phase 4D8B — path-specific career arcs**. Prioritize content that existing state can already support without new core architecture:

- acting/directing repeat collaborators and reunion projects;
- music catalog sleeper-hit / former-manager / reunion arcs;
- modeling agency reunion and reputation recovery/fallout;
- sports/racing former team, coach, final-season, and post-retirement relationship follow-ups;
- creative retirement/comeback opportunities that respect 4D7 lifecycle gates rather than bypassing them.

After 4D8B, evaluate whether a 4D8C hardening/content pass is useful before extending persistent-world depth to other special paths.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays under controlled system/GameEngine ownership. UI must not directly mutate critical career state.
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
