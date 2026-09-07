# Everthread — Current State

Last handoff preparation: 2026-09-07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `b24fd4f09864dcd91dac65ea88649bc0d92f4c12`.

- Post-4D3 Social Affiliation / Friends / Dating corrections are deployed and green.
- GitHub Actions run #26 (`34081682400`) passed overlay import, engine/test type checks, regression suite, production build, Pages upload, deployment, and cleanup.
- Run #26 uploaded head: `ffb74f7904dd0dbab3e94db7f5d4a2c2548eedf2`.
- Run #26 reported core regression 82/82, special-career regression 77/77, music-career regression 52/52, and social-affiliation regression 23/23.
- Expanded bot commit after that run is the verified baseline above.
- Save schema remains 9.

Verified social-affiliation behavior:

- Work folder membership comes from actual workplace SocialWorld affiliation, not generic coworker/boss relationship labels.
- Career Worlds retains current and archived special-career affiliation as history.
- score-90+ institutional relationships can overlap into Friends & Social without losing their school/work/career identity.
- eligible adult classmates/coworkers/bosses/teachers/principals/coaches can use Ask out while teen/adult boundaries and family exclusions remain enforced.
- successful romance changes the personal relationship while persistent SocialWorld history remains discoverable.

## Current work — Phase 4D4 plus generalized music corrections

**Phase 4D4 — Modeling Campaign / Agency Contract Cycles** is implemented locally and packaged only after local validation. It is NOT green until the intended GitHub Actions upload run succeeds and expanded `main` is spot-checked.

The same normal bundle also includes generalized fixes/balance corrections exposed by long-form playtesting:

### Music corrections

- music practice is now a childhood skill/pathway action instead of starting professional career years;
- practice is blocked before age 5 and must not create an age-0 professional music career;
- the first real release stamps `professionalStartAge`;
- annual music processing normalizes professional `years` from a recoverable professional start/world start, repairing inflated legacy values without rewriting old timeline history;
- release-title selection is deterministic by career ordinal and consults exact prior release names preserved in timeline history, so titles that rotated out of the six-slot recent catalog are not casually reused;
- theater/arena/club tour operating costs are materially higher so touring remains lucrative without routinely behaving like near-frictionless revenue;
- the existing three-age catalog tail, distribution tradeoff, persistent music world, and action limits remain intact.

These fixes were generalized from real-playtest observations. Personal user saves, seeds, NPC IDs, life history, and save slots are NOT included in source, default data, or regression fixtures.

### Phase 4D4 modeling behavior

- the existing `specialCareers.modeling` track remains authoritative; no parallel modeling state was introduced;
- an existing persistent modeling SocialWorld is reused as the professional network and is not replaced when representation begins or ends;
- pre-4D4 instant jobs remain legitimate aggregate history, but the game does not fabricate detailed campaign records retroactively;
- successful photoshoot/runway/audition bookings now begin one-year campaigns rather than paying the entire outcome instantly;
- campaigns preserve exact title/client/type, gross booking value, agency commission, advance, start age, completion age, performance, reception, bonus, and net compensation;
- only six recent detailed campaigns are kept in rotating primitive slots while lifetime campaign totals/earnings continue growing;
- editorial, commercial, and runway campaigns have distinct economics and pressure profiles;
- active campaigns block overlap before another modeling opportunity is consumed;
- formal representation is a separate tradeoff contract layered over the persistent modeling network;
- agency offers store exact term, commission, reach, type, and expiry;
- seek/accept/decline use central action policies;
- agency contracts count down yearly and can renew or end cleanly while affiliation history remains;
- high-quality campaigns and established legacy careers can generate bounded representation offers;
- an offer that expires during an annual pass cannot silently regenerate in the same pass;
- campaign quality/booking probability use appearance, technique, charisma, reputation, persistent relationships, prestige, career momentum, fame, and deterministic RNG;
- campaign/industry pressure is bounded and may increase stress/hurt happiness at high levels without adding body/medical mechanics;
- no save-schema bump is required.

## Local validation completed before packaging

- dedicated music-career synthetic regression: **76 checks**;
- dedicated modeling-career synthetic regression: **46 checks**;
- targeted TypeScript semantic checks for the new/changed system files pass in the local deterministic harness;
- syntax/transpile checks pass across all production-target TS/TSX files;
- modeling regression verifies existing world/NPC preservation, no fake backfill, contracts, campaign settlement, overlap prevention, pressure bounds, renewals, offer expiry, idempotence, and six-slot bounded history;
- music regression verifies childhood practice gating, professional-year normalization, lifetime title uniqueness including old timeline history, tour cost floor, distribution/tour/catalog behavior, and idempotence.

GitHub Actions remains the authoritative dependency-backed integration/build/deploy gate.

## Next after Phase 4D4 is green

Phase 4D5 — Racing Seasons / Team Contract / Championship Cycles.

Preferred scope:

1. real yearly race seasons rather than one isolated race result;
2. team contracts, renewal/release/team movement while preserving prior team worlds;
3. championships, standings/season records, best-season/career totals;
4. engineering/team relationships feeding performance and pressure;
5. bounded crash/mechanical/fatigue consequences at abstract gameplay level;
6. clean retirement/end states and no duplicate yearly settlement;
7. retain existing racing action economy and persistent race-team world wherever possible.

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
- 691 event definitions as of the 0.12.0 tracking baseline.
- Mobile-first React/PWA shell.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization regression remains mandatory; do not introduce wall-clock IDs/randomness.
- Every meaningful new player action must be explicitly classified in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent career worlds add NPC/history load; continue population/performance profiling as Phase 4 grows.
- Flat primitive special-career records are acceptable while bounded/readable; reconsider schema 10 if future systems genuinely require nested persistent histories.
- Existing older direct `SpecialCareerSystem` exports remain compatibility paths; player-facing GameEngine routes own the new 4D4 modeling and corrected music-practice behavior. Avoid creating new alternate mutation routes.
- Real player saves may be inspected for QA evidence but must never be shipped, auto-loaded, or copied into production/default regression fixtures.
- Handoff docs must update in meaningful normal bundles so current/next state never drifts behind code.
