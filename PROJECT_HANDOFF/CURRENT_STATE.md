# Everthread — Current State

Last handoff preparation: 2026-09-06/07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified baseline

Phase 4B — Career Ecosystems is deployed and green.

Verified behavior includes:

- persistent special-career organization worlds for acting, music, professional sports, modeling, motorsport, and directing;
- actual persistent NPC casts, teammates, staff, leaders, and rivals;
- career-world NPCs linked into the normal Relationship/NPC graph;
- yearly career momentum;
- awards and scandals;
- sports contract expiration / renewal / release;
- acting/directing project completion history;
- same-age idempotence guard for annual ecosystem processing;
- one-ZIP overlay deployment workflow;
- GitHub Actions type-check, regression, build, and Pages deployment all green.

## Last completed phase

Phase 4C — Career Worlds UI + Social Consequences is deployed and green.

Verified in GitHub Actions run #20 (`34075080076`) against the uploaded commit and expanded source. The workflow passed source import, dependency install, engine/tests type-checking, the regression suite, production build, Pages artifact upload, and Pages deployment.

The build-bot expanded source is committed on `main` at `28f4925811d9ddbc3192e110172c40370b64b951`.

Verified Phase 4C behavior includes:

- player-facing special-career ecosystem information in Career → Life Paths;
- current world name, prestige, chemistry, rivalry pressure, momentum, leaders, rivals, contracts, awards/scandals, and world history;
- career-world NPC interactions that use the real relationship/action systems;
- career chemistry affecting later momentum/project outcomes;
- a dedicated affiliation-driven People → Career Worlds folder;
- career-world affiliation preserved independently of current relationship type;
- expanded special-career regression coverage at 28 checks;
- deterministic regression proof that stronger career chemistry improves otherwise-identical seeded career momentum;
- one-ZIP overlay workflow preserved unrelated repository source.

## Current work

Phase 4D — Deep Career Cycles is next. No Phase 4D source change has been deployed yet.

## Immediate next implementation

Phase 4D should deepen the career loops themselves rather than adding another visibility layer.

Preferred sequence:

1. richer sports seasons and team contract state;
2. acting/directing production cycles and project offers;
3. music release/album/tour cycles and management/label pressure;
4. modeling campaign/agency contracts;
5. racing seasons/team contract progression;
6. path-specific rival/manager/castmate consequences;
7. retirement/end-state handling for the six Phase 4 career worlds;
8. targeted special-career event chains.

Do not jump to save schema 10 merely because Phase 4 is growing. Continue using existing `SocialWorld` plus primitive special-career track fields while that remains structurally honest. Introduce schema 10 only when genuinely structured persisted state requires it.

## Existing major completed foundations

- Core Age Up transaction and pending-event lock.
- Save migrations through schema 9.
- Central action-economy ledger.
- Persistent school social worlds.
- Persistent workplace social worlds.
- Full NPC life simulation and adult descendant biography handoff.
- Multi-slot saves, legacy/past lives, generations.
- Standard careers, finance, assets, investments, businesses.
- Health, crime/legal/prison, fame, pets, travel.
- Existing special-career tracks and minigames.
- 691 event definitions as of the 0.12.0 project tracking.
- Mobile-first React/PWA shell.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization regression remains mandatory; do not introduce wall-clock IDs/randomness.
- Every meaningful new player action must be explicitly classified in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Long-lived special-career worlds add persistent NPCs; continue population/performance profiling as Phase 4 grows.
- Handoff docs must be updated whenever a phase materially changes current state, next work, architecture, deployment, or quality gates.
