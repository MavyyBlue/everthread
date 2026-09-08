# Everthread — Roadmap

This is sequencing guidance, not a rigid promise. Mavyy controls creative direction.

## Current macro phase — Phase 4: Special-Career Ecosystems

### Phase 4A — Persistent career worlds
Status: green.

### Phase 4B — Career ecosystem consequences
Status: green.

### Phase 4C — Career Worlds UI + social consequences
Status: green.

### Phase 4D — Deep career cycles

1. **4D1 Professional Sports Seasons & Contract Lifecycle:** green.
2. **4D2 Acting & Directing Production Cycles:** green.
3. **4D3 Music Release / Album / Tour Cycles:** green.
4. **Post-4D3 Social Affiliation / Friends / Dating correction:** green.
5. **4D4 Modeling Campaign / Agency Contract Cycles:** green.
6. **4D5 Racing Seasons / Team Contract / Championship Cycles:** green.
7. **Pre-4D6 coherence pass:** green. Current/former People ordering, centralized school/work/special-career commitment limits, and context/maturity-safe procedural event eligibility.
8. **Pre-4D6 systemic strain & career-freedom pass:** green. High-stress consequences, recovery, explicit Leave Path semantics, contract-aware exits, sports renewal decisions, and role/age-aware procedural targeting.
9. **Pre-4D6 career identity / relationship consistency:** green. Special-career identity is coherent across Life/People presentation; committed adults use the Hook Up route rather than creating duplicate current partners.
10. **4D6 Deeper rival / leader consequences across paths:** green. Persistent leaders/rivals feed opportunity, mentorship/advocacy, conduct pressure, professional conflict, delayed follow-ups, and remembered grudges while existing lifecycle/stress systems retain formal release authority.
11. **4D7A Special-career lifecycle foundation:** green; verified by run #47.
12. **4D7B Player-facing retirement/comeback + residual end-state economics:** green; verified by run #48. Compact lifecycle status/actions are live; creative comebacks and final athletic retirement are coherent; music residual royalties preserve signed distribution terms without phantom career/world progression.
13. **4D8A Targeted career-story foundation:** green; verified by run #50. Exact persistent Career World NPCs can carry bounded three-beat mentor/rivalry chains across years and archived worlds through the existing delayed-event system.
14. **4D8B Path-specific multi-year arcs:** green; verified by run #54 (`34276175071`) on expanded baseline `3f63ceea5272b8419e31e099bf1a9cc84f0ccab8`. Six two-beat history arcs resurface exact recently archived collaborators in acting, music, modeling, sports, racing, and directing. The path-story suite passed 68/68 and the AI testbench remained 41/41.
15. **4D8C Optional hardening/content expansion:** deferred unless playtesting or queue/performance profiling exposes a concrete need. Candidate later additions include true repeat-collaborator casting and story-originated opportunity offers routed through existing path-specific lifecycle APIs.

### Phase 4E — Additional persistent special-career ecosystems

In progress. These paths reuse persistent NPC/Social World ownership where recurring people materially change the simulation, without forcing every organization into the six-deep-career lifecycle type.

1. **4E1 Combat Sports Persistent Fight Network:** green; verified by run #56 (`34280932226`) on expanded baseline `16fa2ef74f9b9bf55df62e23efa2d8c15f600b8c`. Persistent gym/circuit worlds now contain exact coaches, training partners, recurring rivals, exact-NPC fight history, bounded roster succession, People/Career identity integration, Leave Path continuity, and AI-semantic combat coverage. Combat regression passed 51/51 after CI caught and the production fix resolved missing head-coach succession.
2. **4E2 Military Service Ecosystem:** current / deployment pending. Add recurring command, peer, and support relationships; persistent posting/service history; exact commander context for promotions; bounded command succession; People/Career identity continuity; and abstract/non-operational annual unit consequences while preserving the existing enlistment, training, rank, pay, and career-freedom authorities.
3. **4E3 Politics Ecosystem:** next. Persistent campaign/office staff, colleagues/opponents/constituents as appropriate, office history, and relationship-driven political consequences.
4. **Later special-career breadth:** royalty, organized crime, fictional intelligence/other organizations, commune/casino/zoo/museum remain valid later expansion targets, but they do **not** block Phase 5.

### Phase 4 closeout gate

Phase 4 has an explicit exit line rather than an open-ended feature bucket:

**4E2 Military → 4E3 Politics → one focused Phase 4 integration/consistency closeout → Phase 5.**

The closeout is for concrete bugs, cross-system consistency, save/performance checks, and regressions exposed by 4E2/4E3. It is not a reason to add every remaining special career before Phase 5. Later Phase-4-style ecosystems may resume after the generational foundation is stronger.

### Phase 4Q — Cross-cutting quality infrastructure

**4Q1 AI Interaction Testbench:** green; verified by run #53 (`34270610218`) on expanded baseline `e55a43b1c3b90f93a080e73fe98dd81c40a9b871`. The 41/41 regression-only semantic interface uses real `GameEngine` actions, exact entity inspection, deterministic transcripts, diffs, invariant watches, and isolated in-memory persistence. It adds no player UI, player save metadata, save schema, or parallel gameplay implementation.

Future Q passes should remain rare and justified by cross-system leverage; gameplay expansion remains the primary direction.

### Current compatibility rules

- Existing saves above the two-career cap preserve all established paths.
- Training-only legacy acting/music/modeling flags do not consume professional slots without real evidence.
- Explicitly leaving a path preserves history but frees capacity; professional re-entry can reactivate it later.
- Same-age return after Leave Path or creative retirement is blocked; the player must Age Up before a return/comeback attempt.
- Acting, music, modeling, and directing can return after retirement; professional sports and motorsport retirement are final for that life.
- Voluntary exit/retirement respects live project, tour, campaign, season, representation, and contract obligations.
- Sports renewal remains a player decision rather than silent auto-renewal.
- Final-period compensation is settled before end-state changes.
- Music distribution agreements are separate business terms from active Career World participation; residual catalog royalties keep the agreed share/reach rules after exit.
- Procedural relationship stories require a plausible target, not merely any living NPC of a broad category.
- Leader/rival influence and career-story chains use the existing Social World + Relationship + NPC memory ownership model; neither may introduce a parallel professional-relationship graph.
- Influence/story consequences can alter relationships, pressure, reputation, fame, attributes, or opportunity context but do not independently fire/release, contract, hire, cast, or reactivate the player.
- Generic mentor/rival openings use current/just-ended worlds; path-specific reunion/history openings use only bounded recently archived worlds.
- Multi-year career stories keep exact NPC continuity across delayed beats and cancel safely if that NPC is no longer valid.
- Archived Career Worlds remain archived when a later story references them.
- Story queue growth stays bounded; do not flood Age Up with stacked narrative interruptions.
- Testbench commands must route through real GameEngine APIs; availability should reuse real gates/projections when available.
- Persistent special-career worlds may use the generic `SocialWorld` model without joining the six-deep `SpecialCareerWorldKind` when their lifecycle semantics differ; `special-*` affiliation still belongs to the same People/history ownership model.
- Test-only state must be cloned, use `ai-test-*` slot IDs, and persist only to disposable in-memory storage during regression execution.

### Later Phase 4 extensions

After the Phase 4 closeout, additional organization breadth waits until it is justified by the later roadmap. Persistent people and systemic consequences remain the quality bar; raw feature count is not completion.

Before introducing richer structured persisted Phase 4 objects, decide whether save schema 10 is justified. Flat bounded primitive additions remain acceptable while schema 9 can represent them safely.

## Phase 5 — Generations / estates

Begins after 4E2, 4E3, and the focused Phase 4 closeout. Planned: asset-specific wills, fictionalized estate administration/tax handling, richer NPC-owned assets/businesses, broader kin taxonomy if justified, and large-family/multi-generation performance validation.

## Phase 6 — Credit / debt

Planned: vehicle financing, repossession, creditworthiness/history, personal-loan UI, voluntary bankruptcy, longer recovery consequences, and hardship events.

## Phase 7 — Persistent world consequences

Planned: exact event cooldown tracking, expanded delayed consequence chains, more persistent target-aware follow-ups, parenting/property/business/school/special-career delayed consequences, and deeper national/world events.

## Cross-cutting later gates

- crash-safe last-known-good transaction recovery;
- target-device QA at 360/390/412/430;
- screen reader / keyboard accessibility;
- PWA install/offline upgrade QA;
- iOS/Android standalone behavior;
- regional name-pool expansion and long-dynasty repetition analysis;
- code splitting for the growing application chunk;
- generalized balance simulations informed by real player saves without shipping those saves as fixtures;
- continued expansion of AI semantic interaction coverage as new player-facing systems are added.

## Scope philosophy

Do not finish Everthread by maximizing feature count. Finish systems by adding enough persistence, interaction, consequence, UI clarity, and replay variety that independent systems combine into memorable life stories.
