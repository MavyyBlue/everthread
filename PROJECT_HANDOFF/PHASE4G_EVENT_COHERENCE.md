# Phase 4G — Random Event Coherence & Consequences

Status: deployment pending. Base: `8d5527a045f02d3a15d6831be079ac7d5f6c9de5`. Save schema remains 9.

Phase 4 was deliberately reopened for polish before Phase 5. Phase 5 remains Generations / Estates and is not redefined by this work.

## Scope

- Preserve the established 691-event random-life pool and its 664 procedural variants / 80 procedural dilemma families.
- Replace broad category-level procedural decisions at runtime with dilemma-specific choices through `EventCoherenceSystem.ts`; the underlying event database stays intact.
- Bind friend, family, romance, selected school, and selected workplace dilemmas to exact persistent NPC relationships instead of allowing generic relationship spillover.
- Require real travel history before procedural travel vignettes can fire.
- Make the fixed late-life reunion bind an exact living friend and use reunion-specific decisions.
- Synchronize event-driven `workPerformance` with the authoritative current employment record and `academicPerformance` with the authoritative active education record.
- Record meaningful target NPC memories naming the event and chosen decision.
- Record actual event money / relationship deltas in timeline history and expose important deltas through `EngineResult.stateChanges` for the AI semantic surface.
- Keep all random-event resolution inside the existing EventSystem / GameEngine authority. No second event engine and no test-only gameplay path.

## Regression

`eventCoherenceRegression.ts` adds a focused 72-check suite. It audits the whole procedural library in aggregate rather than inflating counts with one assertion per variant. Coverage includes library counts, 80/80 dilemma-profile coverage, distinct and consequential choices, category-appropriate impact domains, exact friend/family/romance/work/school targeting, financial and relationship history, NPC memories, career/education authority synchronization, travel eligibility, exact late-life reunion targeting, legacy in-progress pending-event compatibility, and AI observation/execution of coherent pending-event choices through the existing semantic testbench.

Wire the suite into `src/tests/runRegression.ts`; failure blocks the normal build/deploy pipeline.

## Next

Only after 4G is green: Phase 4H People workspace redesign. Preserve the seven existing People categories but present them as togglable graph hubs in one pannable/zoomable original Everthread node workspace, with one canonical NPC node per person, labeled associations, filters, and the existing NPC profile sheet as the node detail surface. Update AI semantic coverage alongside the finished People interaction model.
