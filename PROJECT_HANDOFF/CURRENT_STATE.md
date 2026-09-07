# Everthread — Current State

Last handoff preparation: 2026-09-06/07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `48c97c3fc05adc1c409993919e392848300e3b08`.

- Phase 4D1 — Professional Sports Seasons & Contract Lifecycle is deployed and green.
- GitHub Actions run #22 (`34076274130`) passed overlay import, dependency install, type checks, regression suite, production build, Pages upload, deployment, and cleanup.
- The deployed special-career regression reports 41 checks at the Phase 4D1 baseline.
- `PROJECT_HANDOFF/` remains installed and the one-ZIP overlay importer is the normal mobile development workflow.

Verified Phase 4D1 behavior includes one season per pro Age Up, sport-specific team/circuit results, missed-time pressure, persistent season/career totals, earned-season salary accrual before contract resolution, performance-aware renewals, free agency/team history, explicit retirement, all eight supported sports in the mobile UI, and preserved team/rival worlds.

## Current work — Phase 4D2

**Acting & Directing Production Cycles** is implemented locally and packaged for deployment verification. Do not treat it as green until the newest intended GitHub Actions run completes successfully and the expanded source is spot-checked.

Prepared Phase 4D2 behavior:

- acting/directing actions now start a production instead of instantly resolving the final release;
- active acting/directing worlds persist through the current age and release on the next Age Up;
- overlapping acting roles or directing features are blocked before consuming another major opportunity, preventing a new action from silently archiving the project already underway;
- acting productions preserve exact role, booked pay, source, project name, start age, release age, reception, impact, and performance bonus;
- directing productions preserve exact budget, player stake, director fee, backing source, release reception, box office, commercial result, and project history;
- the shared cast/crew chemistry, prestige, reputation, fame, and project-impact score now feed path-specific release outcomes rather than only a generic score;
- exceptional acting releases can generate a follow-up supporting/lead offer with bounded pay and expiry;
- successful directing releases can generate a studio-backed follow-up offer with bounded budget/fee and an expiry long enough to respect the existing two-age directing cooldown;
- pending acting offers are accepted through the existing acting action; pending directing offers use the existing directing action, so no parallel action system or new action policy is introduced;
- offer expiry is explicit and bounded instead of allowing opportunities to persist forever;
- studio-backed directing offers do not charge the normal self-backed production stake;
- Career Worlds UI exposes pending offers, active production details, and latest acting/directing release summaries;
- active project social actions continue using the normal NPC relationship/action-economy system;
- regression target expands from 41 to 77 reported special-career checks;
- save schema remains 9 because all additions are primitive fields inside the already persisted special-career records plus existing Social Worlds.

## Validation completed before Phase 4D2 packaging

- full local TypeScript systems/test harness compiles;
- strict SpecialCareerWorldPanel TSX compile passes;
- deterministic acting runtime verifies offer acceptance, exact booking pay, overlap blocking, next-age archival/release, reception/bonus history, guaranteed exceptional follow-up offer, and bounded offer expiry;
- deterministic directing runtime verifies zero-stake studio-backed acceptance, exact director fee, no same-action release, overlap blocking, next-age archival/release, box office, and exactly one commercial outcome;
- no save-schema bump or new action-economy policy is required.

GitHub Actions remains the authoritative dependency-backed deployment gate.

## Next implementation after Phase 4D2 is green

Phase 4D3 — Music Release / Album / Tour Cycles.

Preferred scope:

1. distinguish singles, albums, and tours as persistent career periods rather than isolated cash actions;
2. management/creative-partner pressure and relationship consequences;
3. release quality, chart/stream trajectory, fanbase growth/decline, and catalog history;
4. tour scale, costs, performance, fatigue, and career impact;
5. label/management-style offers or representation pressure using original fictional structures;
6. bounded multi-year consequences and exact release/tour references;
7. preserve the existing music world and action limits rather than inventing a parallel career state.

Do not start Phase 4D3 before verifying the Phase 4D2 upload is green.

## Later Phase 4D sequence

1. Music release/album/tour cycles and management pressure.
2. Modeling campaign/agency contracts.
3. Racing seasons/team contracts/championships.
4. Cross-path rival/leader consequences and remaining retirement/end states.
5. Targeted special-career event chains.

## Existing major completed foundations

- Core Age Up transaction and pending-event lock.
- Save migrations through schema 9.
- Central action-economy ledger.
- Persistent school and workplace social worlds.
- Full NPC life simulation and adult descendant biography handoff.
- Multi-slot saves, generations, legacy/past lives.
- Standard careers, finance, assets, investments, businesses.
- Health, crime/legal/prison, fame, pets, travel.
- Existing special-career tracks and minigames.
- 691 event definitions as of the 0.12.0 tracking baseline.
- Mobile-first React/PWA shell.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization regression remains mandatory; do not introduce wall-clock IDs/randomness.
- Every meaningful new player action must be explicitly classified in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent career worlds add NPC history; continue population/performance profiling as Phase 4 grows.
- Handoff docs must update with meaningful phase bundles so current/next state never drifts behind code.
