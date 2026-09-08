# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

Current expanded `main` before the career/relationship consistency patch is `f59a494025099fee7efacc1028c3d6c95d0a1347`.

- GitHub Actions run #38 (`34191585874`), job `101950586478`, completed successfully on 2026-09-08.
- The run passed source-overlay import, dependency install, engine/test type checks, the regression suite, production build, Pages artifact upload, deployment, and cleanup.
- Run #38 tested the uploaded source commit `cbade560df5fa06527e64d2081800ef107370fbd`; the workflow expanded it into the build-bot commit above.
- Phase 4D5 Racing remains green.
- The pre-4D6 coherence pass remains green.
- The pre-4D6 systemic strain / recovery / career-freedom / event-role pass is now green as well; the prior handoff still described it as deployment-pending because that note predated run #38.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — pre-4D6 career identity & relationship consistency

Mavyy identified two playtest coherence problems before Phase 4D6. This patch is implemented locally and remains **deployment pending** until the next GitHub Actions run proves the exact overlay.

### Career identity coherence

- `CareerIdentitySystem.ts` is a read-only projection layer for player/NPC career presentation; it does not create a second authoritative career state.
- The Life profile now gives active established special-career commitments precedence over the ordinary employment fallback. A professional modeling path therefore reads `Model` instead of `Unemployed`.
- When two special-career commitments are active, both remain visible rather than silently hiding one.
- Player-facing special-career titles use current track context where available, such as recording artist, sport/athlete, military branch, model, racing driver, and director.
- NPC profile career identity now gives an active special Career World precedence over an unrelated autonomous standard job. Career World group + member role derive a professional title and retain the exact organization name.
- Example failure shape covered by regression: an NPC who has a standard Barista biography but is the active leader of Orbit Records management displays `Music Manager · Orbit Records`, not Barista.
- Special-career NPC income is shown as a deterministic **estimated** role income derived from career kind, role/group prestige, salary index, and a stable NPC-specific factor. This avoids presenting the unrelated standard-job wage as the special-career salary while making clear it is a projection rather than rewriting `NpcLifeState` finance history.
- Archived special Career Worlds stop overriding an NPC's current ordinary-career biography. Affiliation history remains visible through Social Worlds.
- The 42 KB autonomous `NpcLifeSystem` is deliberately not rewritten in this coherence patch; SocialWorld remains authoritative for professional affiliation and NpcLife remains authoritative for autonomous biography. A deeper unification of special-world NPC compensation can be considered later if it becomes gameplay-significant rather than display-only.

### Romantic exclusivity and Hook Up

- `RelationshipSystem` now owns current-romantic exclusivity for Ask Out, reconciliation, proposing, and marriage; UI checks mirror the same system rule rather than replacing it.
- A player who already has a living partner, fiancé, or spouse can no longer Ask Out another otherwise date-eligible NPC and accidentally create overlapping current partners.
- On an otherwise date-eligible adult NPC, `Ask out` becomes `Hook Up` while the player has another current romantic commitment.
- Hook Up is adult-only. Existing teen dating remains supported, but the hookup action is unavailable when either person is under 18.
- Hook Up uses the existing `relationship.milestone` action-economy budget for the exact NPC, so attempts cannot be rerolled freely in the same age.
- A successful hookup does not convert the target into a second partner. Their existing friend/classmate/coworker/boss/etc. relationship type remains intact.
- Successful hookups persist a per-target flat count in `GameFlags`; no save-schema bump is required.
- Discovery risk rises with consecutive successful hookups with the same NPC, with additional bounded pressure from engagement/marriage and a jealous current partner.
- If discovered, the current partner relationship loses score/opinion, records a permanent memory, increases stress, and creates a life-timeline consequence. A second bounded roll can end the relationship/engagement/marriage; marriage fallout records divorce state/counters correctly.
- Legacy saves with more than one current romantic commitment are handled defensively: each living commitment can independently discover the hookup, while new Ask Out/reconcile/propose/marry actions cannot create another duplicate commitment.

### Regression / local validation

- New deterministic `careerRelationshipCoherenceRegression.ts` covers player special-career profile identity, NPC special-world role precedence/fallback, special-career income projection, Ask Out exclusivity, Hook Up availability, reconciliation exclusivity, escalating discovery probability, non-creation of a second partner, discovered-infidelity fallout, and the adult-only hookup boundary.
- A targeted isolated TypeScript compile executed the actual changed CareerIdentity + RelationshipSystem modules against minimal typed infrastructure successfully.
- The seeded `hookup-fallout-1` fixture executed successfully: hookup accepted, discovery occurred, the spouse became an ex/divorced, and both the hookup and discovery were recorded without converting the target into a partner.
- Changed TS/TSX files pass syntax-oriented TypeScript transpilation.
- GitHub Actions remains the authority for full dependency-backed type checks, all existing regressions, production build, and Pages deployment.

## Next after this patch is green

**Phase 4D6 — deeper rival / leader consequences across special-career paths.** Use persistent leaders/rivals to influence advocacy, mentorship, conflict, conduct reviews, opportunity quality, delayed follow-ups, and remembered grudges. The existing stress/conduct framework should remain a shared consequence channel rather than spawning a parallel scripted-drama system.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful action stays in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main application chunk should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection is currently presentation-oriented; do not silently duplicate it into a second persistent career authority. If future gameplay needs exact career-world NPC compensation/history, integrate it deliberately with NpcLife rather than layering another truth on top.
