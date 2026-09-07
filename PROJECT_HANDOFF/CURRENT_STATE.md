# Everthread — Current State

Last handoff preparation: 2026-09-07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `7822c241610c1244e11d56d286eb1a13659ab0aa`.

- Phase 4D4 — Modeling Campaign / Agency Contract Cycles plus generalized music corrections are deployed and green.
- GitHub Actions run #29 (`34089476559`) passed overlay import, engine/test type checks, all regression suites, production build, Pages upload, deployment, and cleanup.
- Run #29 uploaded head: `2c6f3f93a96e8e049f4885a0e6269fc475176f7a`.
- Run #29 job: `101639877814`.
- Expanded bot commit: `7822c241610c1244e11d56d286eb1a13659ab0aa`, tree `556aeccad1f00198436911501753dd3cde0d6fde`.
- Pages artifact: `10006327454`.
- Run #29 reported core 82/82, special-career 77/77, music 76/76, social-affiliation 23/23, and modeling 46/46: **304 checks passed** across those gates.
- Save schema remains 9.

Verified Phase 4D4 behavior:

- existing modeling worlds, NPCs, aggregate jobs, technique, reputation, chemistry, rivals, and prestige survive the upgrade;
- new modeling bookings create one-year campaign periods with exact economics and bounded detailed history;
- agency representation is a separate tradeoff contract layered over the persistent modeling network;
- agency terms expire/renew/end cleanly without deleting authentic affiliation history;
- pre-4D4 jobs are not retroactively fabricated into detailed campaigns;
- childhood music practice no longer starts professional music tenure;
- professional music years normalize from persisted professional evidence;
- historical release titles remain collision-aware beyond the six-slot recent catalog;
- tour operating costs were rebalanced upward while preserving existing music lifecycle behavior.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, and character histories must never be copied into production/default fixtures or auto-loaded for another player.

## Current work — Phase 4D5

**Phase 4D5 — Racing Seasons / Team Contract / Championship Cycles** is implemented locally and packaged only after local validation. It is NOT green until the intended GitHub Actions upload run succeeds and expanded `main` is spot-checked.

### Phase 4D5 racing behavior

- `specialCareers.racing` remains the authoritative racing track; no parallel career state is introduced;
- pre-4D5 `seasons` / `titles` remain legitimate aggregate history and are never backfilled with invented race-by-race detail;
- an existing persistent racing team world and its NPC roster are reused during legacy normalization rather than replaced;
- new Race actions begin a bounded 18–24 round season that resolves on the next Age Up instead of immediately resolving one isolated event;
- the central `special.race` policy still enforces one major racing season commitment per age and overlap is blocked before another action claim is consumed;
- season resolution stores exact team, races, wins, podiums, points, championship position, performance score, incidents, mechanical issues, prize money, and outcome;
- only six recent detailed seasons use rotating primitive slots while lifetime season/win/podium/points/title aggregates keep growing;
- team/engineering relationships, team chemistry, rivalry, prestige, fitness, stress, reputation, momentum, skill, and optional racing minigame score feed deterministic season performance;
- incidents and mechanical trouble remain abstract gameplay consequences with bounded health/stress effects and no real-world driving instruction;
- new entrants sign bounded multi-year developmental team contracts instead of entering a contractless permanent team;
- legacy active racers gain generalized contract state without resetting their existing team, roster, seasons, titles, skill, or reputation;
- contracts tick once per age, preserve exact salary, and can produce renewals, releases, free agency, or eventual retirement;
- renewal offers keep the existing team world; accepting a new-team offer creates a new team world only at acceptance time and archives the former team as history;
- pending contract offers preserve exact team/term/salary and expire cleanly;
- free agents retain `racingPathway` history without retaining a fake current team world;
- explicit retirement archives the current team and permanently blocks new racing seasons in that life;
- an expiring contract at age 60 retires cleanly after the final season;
- completed-season salary and prize money are age-stamped before release/renewal/retirement and enter normal annual finance/tax/debt processing;
- no save-schema bump is required.

### Local validation completed before packaging

- dedicated racing-career synthetic regression: **86/86 checks**;
- existing modeling synthetic regression remains **46/46**;
- existing music synthetic regression remains **76/76**;
- targeted TypeScript semantic checks pass for the new racing system, shared ecosystem changes, action policies, and reconstructed finance integration in the local harness;
- syntax/transpile checks pass across every changed production/test TS/TSX file;
- racing regression covers read-only projections, fresh entry contracts, persistent team relationships, one-season-per-age gating, multi-round settlement, bounded incidents/mechanical issues, finance accrual/tax participation, same-age idempotence, legacy-world preservation, no fake historical backfill, renewals, poor-contract release, free agency, new-team movement, offer expiry, explicit retirement, final-season retirement pay, and six-slot bounded history.

GitHub Actions remains the authoritative dependency-backed integration/build/deploy gate.

## Next after Phase 4D5 is green

Preferred next slice: deeper cross-career rival/leader consequences and targeted special-career event chains, while continuing to close remaining retirement/end-state gaps without broad rewrites.

## Existing major completed foundations

- Core Age Up transaction and pending-event lock.
- Save migrations through schema 9.
- Central action-economy ledger.
- Persistent school and workplace social worlds.
- Full NPC life simulation and adult descendant biography handoff.
- Multi-slot saves, generations, legacy/past lives.
- Standard careers, finance, assets, investments, businesses.
- Health, crime/legal/prison, fame, pets, travel.
- Phase 4A persistent special-career worlds.
- Phase 4B career ecosystem consequences.
- Phase 4C Career Worlds UI and social consequences.
- Phase 4D1 sports seasons/contracts.
- Phase 4D2 acting/directing productions.
- Phase 4D3 music release/catalog/tour/distribution cycles.
- Post-4D3 social-affiliation/friendship/dating correction.
- Phase 4D4 modeling campaign/agency contract cycles plus generalized music quality corrections.
- 691 event definitions as of the 0.12.0 tracking baseline.
- Mobile-first React/PWA shell.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization regression remains mandatory; do not introduce wall-clock IDs/randomness.
- Every meaningful new player action must be explicitly classified in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent career worlds add NPC/history load; continue population/performance profiling as Phase 4 grows.
- Flat primitive special-career records are acceptable while bounded/readable; reconsider schema 10 if future systems genuinely require nested persistent histories.
- Existing older direct `SpecialCareerSystem` exports remain compatibility paths; player-facing GameEngine routes own 4D4 modeling, corrected music practice, and the 4D5 racing lifecycle. Avoid creating new alternate mutation routes.
- Real player saves may be inspected for QA evidence but must never be shipped, auto-loaded, or copied into production/default regression fixtures.
- Handoff docs must update in meaningful normal bundles so current/next state never drifts behind code.
