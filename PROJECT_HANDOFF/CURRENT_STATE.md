# Everthread — Current State

Last handoff preparation: 2026-09-07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `1b8c5f656b3dc6e4a071cd7d17d173fb8e546666`, tree `759a2a2e445b4d1acc4d64adf96a2af72a9b1864`.

- Phase 4D5 — Racing Seasons / Team Contracts / Championship Cycles is deployed and green.
- GitHub Actions run #31 (`34141759533`) passed overlay import, engine/test type checks, every regression suite, production build, Pages upload, deployment, and cleanup.
- Run #31 uploaded head: `2f20c1c1ef8dc1ef2e0b7c5ac19c625dfa8a7c36`.
- Run #31 job: `101805078385`.
- Expanded bot commit: `1b8c5f656b3dc6e4a071cd7d17d173fb8e546666`.
- Pages artifact: `10026169984`.
- Run #31 reported core 82/82, special-career 77/77, music 76/76, social-affiliation 23/23, modeling 46/46, and racing 86/86: **390 checks passed** across those gates.
- Production build transformed 103 modules and deployed successfully to GitHub Pages.
- The main application chunk was 717.26 kB minified (206.01 kB gzip), so future route/code splitting remains a visible performance task rather than a release blocker.
- Save schema remains 9.

Verified Phase 4D5 behavior includes persistent legacy team preservation, non-fabricated pre-4D5 racing history, multi-round Age Up season resolution, bounded detailed standings, contract renewals/releases/free agency/team movement, deterministic relationship-driven performance, normal finance/tax integration for salary and prize income, and clean retirement/final-season settlement.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, and character histories must never be copied into production/default fixtures or auto-loaded for another player.

## Current work — pre-4D6 coherence pass

This pass is intentionally corrective and cross-system. It should be deployed and verified before Phase 4D6 begins.

### People folder current/former clarity

- School, Work, and Career Worlds continue to preserve both current and former institutional relationships.
- Membership remains derived from persistent `SocialWorld` history rather than rewriting `Relationship.type`.
- Current affiliations sort before former affiliations even when a former relationship has a higher personal score.
- Former affiliations remain selectable/history-preserving but are visually muted in the relationship tree.
- Current/fomer projection records exact role, world name, start age, and end age where available.
- Current cards receive an explicit CURRENT badge; former cards appear underneath current affiliations.

### Career / education commitment rules

- Outside active school enrollment, the player may pursue at most **two established special-career paths** at once.
- During active school enrollment, the limit is **one established special-career path**.
- School always blocks starting a full-time regular job.
- School with no active special career still permits part-time work.
- School plus an active special career blocks starting both full-time and part-time regular work.
- Starting a special career while enrolled requires regular and part-time jobs to be left first.
- Enrolling while holding a full-time job is blocked; the game never silently resigns on the player's behalf.
- Enrolling with more than one established special career is blocked.
- Enrolling with one special career plus an existing part-time job is blocked until the player leaves the part-time job.
- Existing older saves above the new special-career limit preserve every established path. Existing paths stay usable; only additional path starts are blocked until capacity is available.
- Raw historical `active=true` flags from old acting/music/modeling training are not sufficient evidence of a professional commitment. Real evidence such as credits/projects/representation, releases/professional worlds, or modeling bookings/agency state is required.
- Preparatory acting lessons, music practice, and modeling lessons can build skill without silently consuming a professional-career slot.
- Royal birth is an inherited current special-life commitment rather than an optional path the player can be unexpectedly blocked from acknowledging later.
- Player-facing enforcement is centralized through `CommitmentSystem` + `GameEngine`; UI disabled states mirror the same gates.

### Event context / maturity coherence

- Procedural friend events require a living, non-estranged friend and bind effects to that exact NPC.
- Procedural family events require real living family context and bind effects to an actual eligible relative.
- Procedural romance/school context uses real eligible persistent NPC context where appropriate.
- Procedural events without a legitimate target suppress generic relationship fallback, preventing unrelated NPC relationships from changing because of an untargeted story.
- Generic family dilemmas that assume meaningful independence are pushed out of early childhood; money/care-heavy variants use stronger teen maturity floors.
- Friend loan requests, generic health/travel/strange procedural scenarios, and similarly independent choices receive age floors appropriate to the choices they present.
- Genuine childhood-specific events remain available at young ages.
- Fixed events with explicit `requires:*` / `target:*` tags retain their existing contextual contracts.

### Local validation before packaging

- dedicated synthetic coherence regression: **37/37 checks passed** in the local focused harness;
- coverage includes current-vs-former ordering, legacy-over-cap preservation, school/work/special-career mutual-exclusion rules, preparatory-vs-professional evidence, inherited royalty commitment, missing-friend rejection, maturity floors, exact friend/family binding, and prevention of untargeted relationship leakage;
- no real player save data is used by the regression fixture;
- changed TS/TSX files receive syntax/transpile validation before packaging;
- GitHub Actions remains the authoritative dependency-backed semantic typecheck, full regression, build, and deploy gate.

## Next after this coherence pass is green

**Phase 4D6 — deeper rival / leader consequences across special-career paths.** Build on the now-stable career lifecycles and clarified commitment rules rather than adding another isolated career.

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
- Phase 4D5 racing season/team-contract/championship cycles.
- 691 event definitions as of the 0.12.0 tracking baseline.
- Mobile-first React/PWA shell.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization regression remains mandatory; do not introduce wall-clock IDs/randomness.
- Every meaningful new player action must be explicitly classified in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent career worlds add NPC/history load; continue population/performance profiling as Phase 4 grows.
- The 717 kB minified main chunk should eventually be code-split rather than merely raising the warning threshold.
- Flat primitive special-career records are acceptable while bounded/readable; reconsider schema 10 if future systems genuinely require nested persistent histories.
- Existing older direct `SpecialCareerSystem` exports remain compatibility paths; player-facing GameEngine routes own corrected practice and modern career lifecycles. Avoid creating new alternate mutation routes that bypass commitment gates.
- Real player saves may be inspected for QA evidence but must never be shipped, auto-loaded, or copied into production/default regression fixtures.
- Handoff docs must update in meaningful normal bundles so current/next state never drifts behind code.
