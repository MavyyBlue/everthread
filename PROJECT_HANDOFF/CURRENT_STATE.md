# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `e3ffe021f29af0284cd346034b35b9d5c1476f9e`.

- GitHub Actions run #67 (`34323865611`) completed successfully on 2026-09-09.
- Run #67 expanded upload commit `de3a213a8b289fb478fa5963c637c276d1b75876` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 46/46.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 is closed after run #65. Persistent Career World ecosystems, integration/coherence closeout, random-event consequence behavior, AI Interaction Testbench coverage, and unified People Threadspace are green. Threadspace connection labels remain presentation-only and OFF by default.

## Phase 5A — Estate Planning & Asset Bequests — green, family-continuity playtest correction pending

Run #67 established the corrected Phase 5A estate baseline after successful real-device playtesting through descendant continuation.

### Green estate authority

`EstateSystem.ts` remains the single authority for estate planning, read-only preview, debt settlement, liquidation priority, residuary shares, specific bequests, protected minor inheritance, and final settlement consumed by descendant continuation.

Established green behavior:

- percentage wills control the residuary estate;
- specific properties, operating businesses, and collectibles can be bequeathed;
- specific bequests outrank balancing but cannot erase estate debt;
- unassigned assets are liquidated before named bequests where possible;
- investments can satisfy estate obligations;
- stale/deceased-beneficiary bequests fall back to normal handling;
- preview and actual settlement use the same allocator;
- estate plans reset on protagonist handoff;
- spouse + children default to a fictional 50% spouse / 50% children residuary split;
- spouse-only and children-only estates resolve coherently;
- explicit modern wills can include spouse and children;
- old child-only Phase 5A wills remain backward-compatible and do not silently disinherit a spouse;
- specific asset bequests can target a spouse or child;
- a surviving legal spouse becomes widowed at player death and keeps bereavement history;
- a selected child under 18 receives the exact settlement into a protected trust rather than spendable player systems;
- trust cash, property, businesses, collectibles, investments, and inherited mortgages release into the authoritative systems at age 18;
- pending/received inheritance counters transition at release rather than at childhood continuation;
- off-screen minor child beneficiaries hold protected inheritance value until adulthood;
- schema 9 remains sufficient for the additive estate/trust state.

Trust assets intentionally remain protected/frozen until adulthood rather than being simulated as a second independently managed property/business portfolio. Richer NPC/trust-owned asset simulation belongs to the later Phase 5 NPC-wealth slice and must not create a parallel ownership authority.

## Current corrective work — generational relationship continuity

A three-generation real-device playtest after run #67 confirmed widowhood and protected trusts, then exposed two additional relationship-coherence gaps.

### Unmarried partner death boundary

Root cause: `DeathSystem` cleaned up only a legal `spouse`. If the deceased protagonist had a living `partner` or `fiance`, the survivor could remain `dating` or `engaged` after descendant continuation even though the protagonist had died.

Pending corrective behavior:

- resolve the one living active romantic survivor across `partner`, `fiance`, or `spouse` at player death;
- spouse remains `widowed`;
- dating/engaged survivor becomes `single`;
- clear any stale pointer to the deceased protagonist;
- retain a permanent bereavement memory for every surviving committed partner;
- reset stale partnered/shared NPC household state where applicable;
- do not turn an unmarried partner into an estate spouse heir;
- completed-life `spouse` remains reserved for the legal spouse.

### Parent / stepparent household friction

Real playtesting also demonstrated that the player's relationship with a parent/stepparent could be driven extremely low through repeated conflict while the NPC couple's partnership remained almost completely isolated from that household hostility.

The pending `FamilyConflictSystem` is a cross-system consequence bridge, not a second relationship database:

- only current player `parent` / `stepparent` NPC couples are eligible;
- a player relationship score of 20 or lower activates household pressure;
- hostility toward both adults creates stronger pressure than hostility toward one;
- a bounded household-tension consequence is recorded in both NPC memories and the family timeline;
- tension has a two-year cooldown to prevent timeline/memory spam;
- repeated tension can contribute to separation/divorce rather than guaranteeing it;
- dating/engaged couples can separate after sustained tension;
- married couples can divorce after sustained tension;
- loyal/calm couples receive stability protection;
- separation clears both NPC partnership pointers and repairs immediate household status;
- the historical parent/stepparent relationship to the player is preserved rather than deleting a person from the family graph;
- no new save schema field is required.

The corrective regression adds explicit coverage for dating/fiance death cleanup, preserved legal-spouse widowhood, the <=20 friction threshold, escalating dual-parent hostility, cooldown behavior, visible tension history, and a deterministic sustained-conflict divorce path.

This correction is not green until GitHub Actions passes both TypeScript gates, every established regression, the new family-continuity regression, production build, Pages artifact upload, and live Pages deployment.

## Phase 5 next slices after the family-continuity correction is green

Continue the roadmap without replacing the estate foundation:

- fix unique, identifiable save-export filenames;
- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation; and
- further death → estate review → descendant continuation polish only where playtesting proves it useful.

## Known quality / architecture issues to keep visible

- Save export downloads currently reuse character/age-based filenames and can collide when multiple exports are made from the same life state. Mavyy explicitly requested a unique, identifiable export filename after the inheritance/family-continuity corrections are green.
- Exact seeded replay serialization remains mandatory; do not introduce wall-clock values into simulation state or runtime IDs.
- Every meaningful player action stays under controlled system/GameEngine ownership.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than creating another career truth.
