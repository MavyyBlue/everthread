# Everthread — Current State

Last handoff preparation: 2026-09-06/07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` at `a9f5900795231aadbb7038cf12f86bad59ab906c`.

- Phase 4D3 — Music Release / Album / Tour Cycles is deployed and green.
- GitHub Actions run #25 (`34079094425`) passed overlay import, engine/test type checks, regression suite, production build, Pages upload, deployment, and cleanup.
- Run #25 reported core regression 82/82, special-career regression 77/77, and music-career regression 52/52.
- Run #24 had failed only on two TypeScript control-flow assertions in the new music regression; the corrective overlay fixed those assertions without weakening the tested behavior, and run #25 is the authoritative green result.
- Phase 4D1 sports seasons/contracts, Phase 4D2 acting/directing cycles, and all Phase 4A–4C foundations remain green.
- `PROJECT_HANDOFF/` remains installed and the one-ZIP overlay importer is the normal mobile development workflow.

Verified Phase 4D3 behavior includes deterministic singles/albums with bounded catalog history, three-age catalog tails, fanbase/release trajectory, persistent music collaborators/management, multi-age tours, distribution-partnership offers and tradeoffs, relationship-driven management pressure, and Career Worlds music UI.

## Current work — post-4D3 playtest corrections

**Social Affiliation / Friends / Dating UX corrections** are implemented locally and packaged for deployment verification. Do not treat them as green until the intended GitHub Actions run completes successfully and expanded `main` source is spot-checked.

Reason for this corrective slice:

- Mavyy found that special-career NPCs whose relationship types are `coworker`/`boss` could also appear in the Work folder even though their affiliation was a special-career organization, not a workplace;
- Career Worlds intentionally preserves current and archived casts/teams/collectives as career history, but the UI did not make the distinction between persistent music collective relationships and temporary distribution offers clear enough;
- high-score classmates/coworkers/bosses/teachers could reach 100 without appearing in Friends & Social;
- Ask out was restricted to `Relationship.type === "friend"`, preventing otherwise eligible adult school/work/career connections from becoming romantic relationships.

Prepared correction behavior:

- Work folder membership is now driven by actual `SocialWorld(kind: "workplace")` affiliation, preventing special-career coworker/boss relationships from leaking into Work;
- Career Worlds continues to preserve current and archived special-career affiliation intentionally; archived career NPCs are history, not deleted relationships;
- Friends & Social also surfaces very close institutional relationships (score 90+) for classmate/teacher/principal/coach/coworker/boss types without overwriting their authoritative relationship type;
- this allows the same NPC to appear in Friends & Social plus School/Work/Career Worlds when both closeness and affiliation justify it;
- Ask out is available for eligible living `friend`, `best_friend`, `classmate`, `coworker`, `boss`, `teacher`, `principal`, and `coach` relationships;
- the existing teen/adult age boundary remains authoritative: minors cannot date adults, including teachers/bosses;
- family relationship types remain excluded from Ask out;
- successful dating changes the personal relationship to `partner` while School/Work/Career Worlds affiliation remains discoverable through the persistent Social World;
- Career Worlds music copy now clarifies that the persistent creative/management collective is separate from temporary distribution offers;
- no save-schema change is required.

## Validation completed before corrective packaging

- targeted social-affiliation runtime regression passes 23/23 checks;
- regression covers Work-folder isolation, Career Worlds history retention, close institutional Friends overlap, adult coworker/boss/classmate/teacher dating eligibility, minor/adult safety, family exclusion, and affiliation retention after romance;
- strict TypeScript check of the targeted social regression passes in the local production-compatible harness;
- People and Career Worlds TSX compile passes in the local mobile UI harness;
- changed PeopleGraph/PeopleScreen files were reconstructed from exact current Git blobs before editing;
- current package base is the verified Phase 4D3 `main` commit `a9f5900795231aadbb7038cf12f86bad59ab906c`.

GitHub Actions remains the authoritative dependency-backed deployment gate.

## Next implementation after this corrective slice is green

Phase 4D4 — Modeling Campaign / Agency Contract Cycles.

Preferred scope:

1. representation/agency contract lifecycle and bounded offers;
2. campaign bookings that persist as real career periods instead of isolated jobs;
3. editorial/commercial/runway campaign types with distinct pay/reputation/fame tradeoffs;
4. agency/creative-team relationships feeding booking quality and pressure;
5. campaign history, earnings, reputation, major-client progression, and contract renewal/release;
6. bounded overwork/image pressure consequences and clean end states;
7. preserve the existing modeling Social World/action limits unless genuinely new state requires more.

Do not start Phase 4D4 before verifying the social-affiliation correction upload is green.

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
- Phase 4 persistent special-career worlds, social consequences, sports seasons, screen-career productions, and music career cycles.
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
