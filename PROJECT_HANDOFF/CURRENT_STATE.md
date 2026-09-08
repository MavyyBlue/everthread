# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green deployment baseline is expanded commit `4f29030464088383d99520998fd056d51a0b6f46`.

- GitHub Actions run #41 (`34195742362`), job `101962949260`, completed successfully on 2026-09-08.
- Source-overlay import, dependency install, engine/test typechecks, all regression suites, the production build, Pages artifact upload, and Pages deployment all passed.
- Run #41 expanded uploaded commit `ce9e92fbc9bc984370b7b04212470d93430a3433` into the build-bot commit above.
- Regression counts included core 82/82, special-career world 77/77, music 76/76, social affiliation 23/23, modeling 46/46, racing 86/86, coherence 37/37, stress/career freedom 64/64, event-target roles 4/4, commitment exclusivity 10/10, and career/relationship coherence 19/19.
- The pre-4D6 career identity / relationship consistency pass is therefore green: special careers project correctly on the Life profile, special Career World roles take presentation precedence over unrelated autonomous standard jobs, romantic exclusivity is enforced, and committed adults receive Hook Up rather than a duplicate Ask Out path.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4D6 leader / rival consequences

Phase 4D6 is now implementation/deployment pending. Its purpose is to make the recurring people inside special Career Worlds shape actual career outcomes instead of functioning mainly as labels and relationship flavor.

### Shared influence architecture

- New `SpecialCareerInfluenceSystem.ts` is a shared layer for acting, music, sports, modeling, racing, and directing.
- It reads existing Career World membership plus authoritative Relationship/NPC state. It does **not** create another relationship or affiliation authority.
- Leader support is derived from the existing leader relationship, hidden opinion, compatibility, and bounded personality effects.
- Rival pressure uses explicit `:rivals` groups when a path provides them. Acting, directing, and other worlds without an explicit rival group can derive a competitive peer from poor relationship history, competitive/aggressive traits, and remembered career hostility without overwriting that NPC's relationship type.
- The layer writes only flat primitive metrics into the existing special-career track: leader support, rival pressure, conduct risk, opportunity modifier, current leader/rival IDs, counts, and one bounded pending follow-up. This does not justify schema 10.
- Influence randomness uses a career-world/year namespaced seeded RNG rather than consuming the shared gameplay RNG or shifting the existing ecosystem RNG stream.

### Systemic consequences

- Leader support can produce mentorship: small skill/reputation growth, reduced stress, improved leader relationship, and an NPC memory.
- Strong leaders can advocate for the player, increasing the quality of the next career cycle and scheduling a next-age follow-up whose success still depends on the relationship remaining healthy.
- Weak leader support plus existing stress incidents/scandal/high strain can produce a conduct review and warning. This layer intentionally does **not** fire/release the player; `StressConsequenceSystem` and the path-specific contract/lifecycle modules retain formal release authority.
- High rival pressure can escalate into conflict, relationship/hidden-opinion damage, stress, an opportunity penalty, and a delayed grudge follow-up. Repeated hostility becomes a permanent NPC memory rather than parallel rivalry state.
- Delayed leader/rival follow-ups can recover, follow through, cool off, or deepen depending on the current relationship and stress state when the next age arrives. Archived acting/directing worlds can still resolve a scheduled follow-up because the exact world/NPC IDs are retained.
- Only one pending influence follow-up is retained per career path. Rival grudges outrank conduct reviews, and conduct reviews outrank advocacy if multiple follow-ups compete in the same career cycle. This keeps persisted state bounded.

### Career-cycle integration

- Persistent career momentum now receives a bounded opportunity modifier from the influence layer. Sports seasons/renewals, modeling cycles, racing seasons/contracts, and the music annual lifecycle already consume shared momentum, so leader/rival consequences reach those systems without bespoke parallel formulas.
- Acting/directing project impact receives the same bounded modifier before existing release economics, awards/scandals, and follow-up offer generation. This lets recurring production relationships affect later opportunity quality naturally.
- Effective rivalry pressure passed into existing cycle/scandal logic is the stronger of the old explicit-rival pressure and the new shared influence pressure.
- Existing Career Worlds UI actions (`Seek guidance`, `Ease rivalry`, `Build chemistry`) remain on the normal NPC interaction action economy. Improving those relationships can now change next-year support/pressure rather than requiring new spam-able career buttons.

### Validation added in this patch

- New deterministic `specialCareerInfluenceRegression.ts` covers leader support, explicit rivals, bounded modifiers, conduct-risk growth, competitive-peer fallback without relationship-type mutation, all six supported Career World kinds, same-age idempotency, leader-review recovery, permanent rival grudges, persistent-career momentum integration, and temporary acting-project integration.
- A targeted strict TypeScript compile of the changed modules/tests against typed compatibility stubs passes.
- A deterministic executable smoke test of the real influence module passed leader/rival projection, same-age idempotency, and delayed permanent-grudge behavior.
- GitHub Actions remains the authority for full repository typechecks, all existing regressions, production build, and Pages deployment. Treat Phase 4D6 as **deployment pending** until the post-upload workflow passes every gate.

## Next after Phase 4D6 is green

Continue the Phase 4D deep-cycle roadmap with broader retirement/end-state handling across older special paths, then targeted multi-year special-career event chains grounded in the persistent NPCs and consequence state established here.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays in the central action economy.
- Formal dismissal/release must remain owned by the existing stress or path-specific lifecycle system; leader/rival influence must not become a second employment authority.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk is still above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
