# Everthread — Current State

Last handoff preparation: 2026-09-06/07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `29b25374d6c87a01b21477066c4be922c126b993`.

- Phase 4C — Career Worlds UI + Social Consequences is deployed and green.
- `PROJECT_HANDOFF/` is installed in the repository and its installation run #21 completed green.
- The one-ZIP overlay importer is the normal mobile development workflow.
- Special-career regression coverage at the Phase 4C baseline is 28 checks.

Verified Phase 4C behavior includes persistent career worlds in Career → Life Paths, Career Worlds in People, relationship-driven chemistry/rivalry, contracts, awards/scandals, and project impact.

## Current work — Phase 4D1

**Professional Sports Seasons & Contract Lifecycle** is implemented locally and packaged for deployment verification. Do not treat it as green until the newest intended GitHub Actions run completes successfully and the expanded source is spot-checked.

Prepared Phase 4D1 behavior:

- each professional Age Up resolves exactly one sport-specific season/circuit year;
- basketball/baseball/football/soccer/hockey/volleyball use team-season records, while tennis/golf use circuit-event results;
- season performance is driven by skill, fitness, existing career momentum, team chemistry, world prestige, stress, age, and deterministic variance;
- bounded missed-time/injury pressure can reduce appearances, health, fitness, and season performance;
- season records, outcomes, appearances, successes, best-season score, honors, championships, and career totals persist in the existing primitive special-career track;
- relationship consequences continue: coaches react to strong/poor seasons and championships can intensify the persistent rival relationship;
- contract years tick only after a completed season;
- renewal now considers season performance, momentum, reputation, chemistry, fitness, and age;
- non-renewal produces a real free-agent state and archives the former team world without deleting its history;
- later successful pro-contract actions create another persistent team and increment contract/team history;
- professional retirement is now an explicit end state rather than a silent random `active=false`; age 48 is a hard playing-career boundary, with earlier late-career retirement pressure;
- the final season is played before retirement and its salary remains earned;
- annual finance pays an age-stamped completed-season salary even if contract resolution releases or retires the player before finance runs;
- initial pro signings now initialize `contractRemaining` immediately and track pro contracts / teams played for;
- Career UI exposes pro/free-agent/retired status plus season count, and active sports worlds show season record/performance/career totals;
- the Life Paths sports card now exposes all eight already-supported sports instead of only basketball, and retired/inactive states mirror engine eligibility;
- regression target expands from 28 to 41 special-career checks;
- no save-schema bump: all new persisted values remain primitives inside the already persisted special-career record.

## Validation completed before packaging

- exact deployed FinanceSystem and CareerScreen baselines were reconstructed locally and their Git blob hashes matched `main` before applying edits;
- local TypeScript systems/test subset compiles;
- strict SpecialCareerWorldPanel compile passes;
- special-career regression source type-checks with the local validation harness;
- deterministic runtime sanity verifies season 1, same-age idempotence, season 2, contract resolution, released-season salary payment, and age-48 retirement;
- local finance case paid exactly the completed-season salary despite `pro=false` / free agency.

GitHub Actions remains the authoritative dependency-backed deployment gate.

## Next implementation after Phase 4D1 is green

Phase 4D2 — Acting & Directing Production Cycles.

Preferred scope:

1. project offers rather than every successful action immediately becoming an undifferentiated one-year production;
2. role/budget/production-tier effects;
3. production lifecycle and release/completion outcomes;
4. cast/producer/director relationship consequences;
5. project pay timing and career impact;
6. offer rejection/acceptance opportunity cost where appropriate;
7. awards/scandal follow-ups that reference the exact archived production.

Do not start Phase 4D2 before verifying the Phase 4D1 upload is green.

## Later Phase 4D sequence

1. Acting/directing production cycles.
2. Music single/album/tour cycles and management pressure.
3. Modeling campaign/agency contracts.
4. Racing seasons/team contracts/championships.
5. Cross-path rival/leader consequences and retirement/end states.
6. Targeted special-career event chains.

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
