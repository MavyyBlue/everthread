# Everthread — Current State

Last handoff preparation: 2026-09-06/07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `452c140b76f942f93a135885c5aff265e0c8d7f9`.

- Phase 4D2 — Acting & Directing Production Cycles is deployed and green.
- GitHub Actions run #23 (`34077126826`) passed overlay import, dependency install, type checks, regression suite, production build, Pages upload, deployment, and cleanup.
- The deployed special-career regression reports 77 checks at the Phase 4D2 baseline.
- Phase 4D1 sports seasons/contracts and all Phase 4A–4C foundations remain green.
- `PROJECT_HANDOFF/` remains installed and the one-ZIP overlay importer is the normal mobile development workflow.

Verified Phase 4D2 behavior includes multi-age acting/directing productions, overlap protection, exact production history, path-specific release economics/reception, acting follow-up offers, studio-backed directing offers, bounded offer expiry, persistent casts/crew, and Career Worlds production/offer UI.

## Current work — Phase 4D3

**Music Release / Album / Tour Cycles** is implemented locally and packaged for deployment verification. Do not treat it as green until the newest intended GitHub Actions run completes successfully and expanded `main` source is spot-checked.

Prepared Phase 4D3 behavior:

- singles and albums receive deterministic original titles, bounded quality/reception, launch streams, launch royalties, fan growth, and exact age history;
- detailed recent catalog history is bounded to six releases while lifetime catalog count/streams/royalties continue accumulating;
- each catalog release produces a deterministic three-age declining stream/royalty tail instead of disappearing after launch;
- release reach uses skill, creativity, reputation, persistent creative-partner relationships, manager relationship, fame, fanbase, and distribution terms;
- inactive/weak catalog momentum can produce bounded fanbase decline rather than permanent one-way growth;
- tours now start as an in-progress commitment and resolve on the next Age Up instead of paying instantly;
- tour scale is selected from current fanbase (clubs/theaters/arenas) and stores exact show count, attendance, gross, costs, net, performance, fan gain, fatigue, and completion age;
- overlapping tours are blocked before consuming another tour action claim;
- same-age music lifecycle processing is idempotent, preventing duplicate catalog royalties or duplicate tour completion;
- persistent manager/creative relationships are projected into `managementPressure`, `creativeChemistry`, and tour/release outcomes;
- high-quality releases can generate fictional distribution-partnership offers with explicit advance, royalty share, reach boost, source release, and expiry;
- partnership accept/decline is a controlled engine action using the new central `special.music_business` one-per-age policy;
- accepting a partnership pays the recorded advance exactly once and trades future royalty share for broader reach;
- Career Worlds UI exposes partnership offers, recent catalog, fanbase/lifetime streams, management pressure, active tours, latest tour economics, and distribution terms;
- music regression is a separate deterministic suite and currently passes 52 checks in the local harness;
- save schema remains 9 because bounded catalog entries and lifecycle state use primitive keys in the existing persisted music track plus the existing music Social World.

## Validation completed before Phase 4D3 packaging

- MusicCareerCycleSystem / SpecialCareerSystem / action-economy/test harness type-check passes with production-compatible signatures;
- deterministic music runtime passes all 50 prepared regression checks;
- stricter Career Worlds TSX compile passes;
- syntax transpilation passes for every changed TS/TSX file;
- existing 77-check special-career regression is left intact and the new music regression is invoked separately by `runRegression.ts`;
- no migration or duplicate music-world state is introduced.

GitHub Actions remains the authoritative dependency-backed deployment gate.

## Next implementation after Phase 4D3 is green

Phase 4D4 — Modeling Campaign / Agency Contract Cycles.

Preferred scope:

1. representation/agency contract lifecycle and bounded offers;
2. campaign bookings that persist as real career periods instead of isolated jobs;
3. editorial/commercial/runway campaign types with distinct pay/reputation/fame tradeoffs;
4. agency/creative-team relationships feeding booking quality and pressure;
5. campaign history, earnings, reputation, major-client progression, and contract renewal/release;
6. bounded overwork/image pressure consequences and clean end states;
7. preserve the existing modeling Social World/action limits unless genuinely new state requires more.

Do not start Phase 4D4 before verifying the Phase 4D3 upload is green.

## Later Phase 4D sequence

1. Modeling campaign/agency contracts.
2. Racing seasons/team contracts/championships.
3. Cross-path rival/leader consequences and remaining retirement/end states.
4. Targeted special-career event chains.

## Existing major completed foundations

- Core Age Up transaction and pending-event lock.
- Save migrations through schema 9.
- Central action-economy ledger.
- Persistent school and workplace social worlds.
- Full NPC life simulation and adult descendant biography handoff.
- Multi-slot saves, generations, legacy/past lives.
- Standard careers, finance, assets, investments, businesses.
- Health, crime/legal/prison, fame, pets, travel.
- Phase 4 persistent special-career worlds, social consequences, sports seasons, and screen-career productions.
- 691 event definitions as of the 0.12.0 tracking baseline.
- Mobile-first React/PWA shell.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization regression remains mandatory; do not introduce wall-clock IDs/randomness.
- Every meaningful new player action must be explicitly classified in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent career worlds add NPC/history load; continue population/performance profiling as Phase 4 grows.
- Flat primitive special-career records are acceptable while bounded and readable; reconsider schema 10 if future systems require genuinely nested persistent histories rather than numbered bounded slots.
- Handoff docs must update with meaningful phase bundles so current/next state never drifts behind code.
