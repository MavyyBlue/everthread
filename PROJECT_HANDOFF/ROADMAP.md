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
7. **Pre-4D6 coherence pass:** green.
8. **Pre-4D6 systemic strain & career-freedom pass:** green.
9. **Pre-4D6 career identity / relationship consistency:** green.
10. **4D6 Deeper rival / leader consequences:** green.
11. **4D7A Special-career lifecycle foundation:** green; verified by run #47.
12. **4D7B Retirement/comeback + residual end-state economics:** green; verified by run #48.
13. **4D8A Targeted career-story foundation:** green; verified by run #50.
14. **4D8B Path-specific multi-year arcs:** green; verified by run #54 (`34276175071`) on expanded baseline `3f63ceea5272b8419e31e099bf1a9cc84f0ccab8`. Path-story regression passed 68/68 and AI testbench remained 41/41.
15. **4D8C Optional hardening/content expansion:** deferred unless later playtesting exposes a concrete need.

### Phase 4E — Additional persistent special-career ecosystems

1. **4E1 Combat Sports Persistent Fight Network:** green; verified by run #56 (`34280932226`) on expanded baseline `16fa2ef74f9b9bf55df62e23efa2d8c15f600b8c`. Combat regression 51/51.
2. **4E2 Military Service Ecosystem:** green; verified by run #57 (`34285299697`) on expanded baseline `a585471648bd9cfa3ed29b13dfb2e45dbbde6def`. Military regression 65/65.
3. **4E3 Politics Ecosystem:** green; verified by run #59 (`34287594480`) on expanded baseline `7e098777cdc3173b49b880797f8670661c470361`. Politics regression 80/80; all earlier suites remained green. Run #58 was correctly rejected as a no-op because the wrong ZIP had been uploaded; #59 is the verified feature deployment.
4. **Later special-career breadth:** royalty, organized crime, fictional intelligence/other organizations, commune/casino/zoo/museum remain valid later expansion targets, but they do **not** block Phase 5.

### Phase 4 closeout gate — current / deployment pending

The final Phase 4 pass is integration and consistency work, not another feature-family expansion.

- unify the player-facing Career Worlds catalog across acting/music/sports/combat/military/politics/modeling/racing/directing;
- show combat, military, and politics current/history chapters in the existing Career Worlds bottom sheet using their real system projections;
- harden `enforceStateInvariants()` / `validateState()` against duplicate active worlds, orphan supplemental worlds, stale active/archived metadata, duplicate/asymmetric membership, and invalid group prestige;
- make the AI testbench Career observation use the same nine-kind catalog;
- verify cross-career coexistence, commitment capacity, Leave Path history, Career Identity, save round trips/migration repair, and repeated career-chapter population bounds through a dedicated 88-check closeout suite;
- keep save schema 9 and preserve all existing career outcome authorities.

If this gate passes the full CI/build/deploy pipeline, **Phase 4 is complete and Phase 5 becomes the current macro phase.**

### Phase 4Q — Cross-cutting quality infrastructure

**4Q1 AI Interaction Testbench:** green; verified by run #53 (`34270610218`) on expanded baseline `e55a43b1c3b90f93a080e73fe98dd81c40a9b871`. The regression-only semantic interface uses real `GameEngine` actions, exact entity inspection, deterministic transcripts, diffs, invariant watches, and isolated in-memory persistence. It adds no player UI, player-save metadata, save schema, or parallel gameplay implementation.

Future Q passes should remain rare and justified by cross-system leverage; gameplay expansion remains the primary direction.

### Current compatibility rules

- Existing saves above the two-career cap preserve established paths.
- Training-only legacy acting/music/modeling flags do not consume professional slots without real evidence.
- Explicitly leaving a path preserves history but frees capacity; professional re-entry can reactivate it later.
- Same-age return after Leave Path or creative retirement is blocked; the player must Age Up before return/comeback.
- Acting, music, modeling, and directing can return after retirement; professional sports and motorsport retirement are final for that life.
- Voluntary exit/retirement respects live project, tour, campaign, season, representation, and contract obligations.
- Sports renewal remains a player decision rather than silent auto-renewal.
- Final-period compensation settles before end-state changes.
- Music distribution agreements are separate business terms from active Career World participation.
- Career stories/influence use existing Social World + Relationship + NPC memory ownership and never invent a parallel professional graph.
- Archived Career Worlds remain archived when later story content references them.
- Persistent special-career worlds may use generic `SocialWorld` ownership without joining the six-deep `SpecialCareerWorldKind` when lifecycle semantics differ.
- Political and military persistence observes existing authoritative election/promotion results rather than rolling a second authority.
- The invariant layer may repair impossible Career World topology but must not invent career results, contracts, elections, promotions, retirements, or relationships.
- Testbench commands route through real GameEngine APIs; observation uses real read-only projections/catalogs.
- Test-only state stays cloned, uses `ai-test-*` slot IDs, and persists only to disposable in-memory storage.

## Phase 5 — Generations / Estates

**Next after the Phase 4 closeout is green.** Planned direction:

- asset-specific wills rather than only broad inherit-business/property toggles;
- fictionalized estate administration and tax/settlement handling;
- richer NPC-owned assets and businesses so family wealth exists beyond a single controlled character;
- broader kin taxonomy only where it improves real family-tree behavior and UI clarity;
- inheritance consequences that preserve one authoritative asset/debt truth without duplication exploits;
- large-family and multi-generation performance validation; and
- stronger death → estate review → descendant continuation flow so dynasty play becomes a defining Everthread loop.

Phase 5 should build on the current descendant/estate foundation rather than replacing it. Existing three-/eight-generation regression behavior and estate anti-duplication rules remain compatibility requirements.

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
- continued expansion of AI semantic interaction coverage as authoritative shared gates become available.

## Scope philosophy

Do not finish Everthread by maximizing feature count. Finish systems by adding enough persistence, interaction, consequence, UI clarity, and replay variety that independent systems combine into memorable life stories.
