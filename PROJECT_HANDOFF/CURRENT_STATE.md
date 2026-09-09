# Everthread — Current State

Last handoff preparation: 2026-09-09  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `2a9258b7516ff02ea877555ae666290f25404bbe`.

- GitHub Actions run #66 (`34318688088`) completed successfully on 2026-09-09.
- Run #66 expanded upload commit `5b891e8a4663a868f7b04191f812dfd17870f7e9` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, the full regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 28/28.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 is closed after run #65. Persistent Career World ecosystems, integration/coherence closeout, random-event consequence behavior, AI Interaction Testbench coverage, and unified People Threadspace are green. Threadspace connection labels remain presentation-only and OFF by default.

## Current work — Phase 5A Estate Planning & Asset Bequests — green foundation, playtest corrective patch pending

Run #66 established the Phase 5A green baseline. Mavyy then successfully playtested death → estate review → Generation 2 continuation and confirmed assets were distributed and visible in the descendant life. That playtest exposed three estate/family coherence defects which must be corrected before Phase 5A is called complete.

### Existing Phase 5A authority

`EstateSystem.ts` owns estate planning, read-only estate preview, debt settlement, asset liquidation priority, residuary shares, specific bequests, and settlement consumed by descendant continuation.

The established green behavior remains authoritative:

- percentage wills control the residuary estate;
- specific properties, operating businesses, and collectibles can be bequeathed;
- specific bequests outrank balancing but cannot erase estate debt;
- unassigned assets are liquidated before named bequests where possible;
- investments can satisfy estate obligations;
- stale/deceased-beneficiary bequests fall back to normal handling;
- unassigned property/business retention preferences remain available;
- preview and actual settlement use the same allocator;
- estate plans reset on protagonist handoff;
- schema 9 remains sufficient for additive estate state.

### Playtest correction 1 — surviving spouse state

Root cause: `DeathSystem` captured the spouse in the completed-life record but did not transition the surviving spouse NPC from `married` to `widowed`. After descendant continuation, the new protagonist therefore saw a living parent whose profile still claimed they were married to the deceased prior protagonist.

Corrective behavior in the pending bundle:

- player death immediately transitions the living spouse NPC to `widowed`;
- a bereavement memory is retained on that exact spouse;
- a stale player-partner pointer is cleared if present;
- the spouse relationship remains available to estate settlement while the death screen is active;
- descendant family reconstruction therefore observes the survivor as widowed rather than inventing a still-living marriage.

### Playtest correction 2 — spouse inheritance

The run #66 allocator considered only living children as heirs. The pending correction expands estate eligibility to the living, non-estranged spouse plus living children.

Everthread's fictional default family-share rule is:

- spouse + children: spouse receives 50% of the residuary estate; children divide the remaining 50%;
- spouse only: spouse receives 100%;
- children only: children divide the residuary estate equally;
- a new explicit will may set custom percentages across the living spouse and children;
- specific properties, businesses, and collectibles may be left to either a spouse or child.

Backward compatibility: a child-only will authored by the run #66 UI is interpreted as relative percentages inside the children's 50% pool while the surviving spouse receives the default 50%. This prevents the previous UI limitation from silently disinheriting an existing spouse. Once the user saves a new plan containing the spouse, those explicit percentages become authoritative.

### Playtest correction 3 — protected inheritance for minors

A controlled descendant below age 18 must not instantly receive a massive spendable fortune, property, business, investment portfolio, or attached mortgage.

The pending correction adds an additive schema-9 protected estate trust:

- death-sheet preview marks child inheritances that will be held until age 18;
- choosing a minor descendant stores their exact selected settlement in `inheritance.trust` rather than player cash/assets;
- the Assets → Estate tab shows the protected trust but ordinary money/property/business/investment controls cannot spend or manage it;
- normal Age Up to 18 releases trust cash, properties, businesses, collectibles, investments, and inherited property mortgages into the authoritative player systems;
- inheritance counters move from pending to received only at release;
- the continuation timeline states that the inheritance is protected until adulthood instead of claiming immediate receipt;
- off-screen minor child beneficiaries receive a lightweight protected inheritance value on the NPC and it joins NPC wealth at adulthood instead of immediately becoming spendable wealth.

Trust assets intentionally remain protected/frozen until adulthood in this correction rather than being simulated as a second independently managed property/business portfolio. Richer NPC/trust-owned asset simulation belongs to the later Phase 5 NPC-wealth slice and must not create a parallel ownership authority now.

### Phase 5A corrective regression gate

`estatePlanningRegression.ts` retains the existing Phase 5A coverage and adds checks for:

- legacy child-only will spouse protection;
- explicit spouse percentage shares;
- specific spouse asset bequests;
- surviving spouse `widowed` state and bereavement memory at death;
- widowed spouse estate eligibility;
- minor descendant continuation with no immediate inherited cash/property control;
- exact protected-trust creation;
- Age Up release at 18;
- inherited property release from trust;
- pending/received inheritance counter transition; and
- off-screen minor sibling inheritance protection.

The correction is not green until GitHub Actions passes both TypeScript gates, every established regression, the expanded estate-planning regression, production build, Pages artifact upload, and live Pages deployment.

## Phase 5 next slices after Phase 5A correction is green

Continue the roadmap without replacing the estate foundation:

- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation; and
- further death → estate review → descendant continuation polish only where playtesting proves it useful.

## Known quality / architecture issues to keep visible

- Save export downloads currently reuse character/age-based filenames and can collide when multiple exports are made from the same life state. Mavyy explicitly requested a unique, identifiable export filename after the inheritance-coherence corrections are green.
- Exact seeded replay serialization remains mandatory; do not introduce wall-clock values into simulation state or runtime IDs.
- Every meaningful player action stays under controlled system/GameEngine ownership.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than creating another career truth.
