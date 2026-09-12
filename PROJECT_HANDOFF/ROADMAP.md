# Everthread — Roadmap

This is sequencing guidance, not a rigid promise. Mavyy controls creative direction.

## Current macro phase — Phase 6: Credit / Debt

Phase 4 and Phase 5 are closed. People Threadspace and the post-Run-74 corrective closeout are green, Run #91 established the canonical pre-deployment QA/certified-baseline infrastructure, and Run #102 (`8b2a49fe76c5429cf55228a00a15b6103211a25b`) is the latest certified source baseline. Phase 6 deepens credit/debt while consuming the existing Finance/Asset/Estate authorities rather than replacing them.

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
14. **4D8B Path-specific multi-year arcs:** green; verified by run #54 (`34276175071`). Path-story regression passed 68/68 and AI testbench remained 41/41.
15. **4D8C Optional hardening/content expansion:** deferred unless later playtesting exposes a concrete need.

### Phase 4E — Additional persistent special-career ecosystems

1. **4E1 Combat Sports Persistent Fight Network:** green; verified by run #56 (`34280932226`) on expanded baseline `16fa2ef74f9b9bf55df62e23efa2d8c15f600b8c`. Combat regression 51/51.
2. **4E2 Military Service Ecosystem:** green; verified by run #57 (`34285299697`) on expanded baseline `a585471648bd9cfa3ed29b13dfb2e45dbbde6def`. Military regression 65/65.
3. **4E3 Politics Ecosystem:** green; verified by run #59 (`34287594480`) on expanded baseline `7e098777cdc3173b49b880797f8670661c470361`. Politics regression 80/80.
4. **Later special-career breadth:** royalty, organized crime, fictional intelligence/other organizations, commune/casino/zoo/museum remain valid later expansion targets, but they do **not** block Phase 5.

### Phase 4F — Integration & Consistency Closeout
Status: green; verified by run #60 (`34289835933`) on expanded baseline `8d5527a045f02d3a15d6831be079ac7d5f6c9de5`. Closeout regression 88/88.

- unified player-facing Career Worlds catalog across nine persistent career families;
- structural Career World validation/repair for duplicate/orphan worlds, membership topology, stale active/archived metadata, and bounded group values;
- shared AI/player Career World catalog semantics;
- cross-career coexistence, Leave Path history, save round-trip, migration repair, and repeated-chapter population validation.

### Phase 4G — Random Event Coherence & Consequences
Status: green; verified by run #62 (`34305181164`) on expanded baseline `b7cd8d7806dce3e7e6ca677622ea7b7878f13ddd`. Random-event coherence regression 72/72.

- preserve the 691-event library / 664 procedural variants / 80 dilemma families;
- replace broad generic procedural decision sets with situation-specific choices;
- bind exact NPC targets where the event premise requires a person;
- make consequences meaningfully affect the systems the dilemma is about;
- synchronize work and academic event effects with authoritative career/education records;
- preserve money/relationship deltas and meaningful target memories;
- maintain compatibility for old pending procedural events and old semantic choice callers without showing obsolete choices to new players.

### Phase 4H — People Threadspace
Status: **green**.

Goal: preserve all existing People simulation truth while replacing the one-folder-at-a-time presentation with one unified, original, mobile-first node workspace.

Implementation direction:

- keep the established seven categories: Player Family, Relatives, Friends & Social, Romantic History, School, Work, Career Worlds;
- represent each NPC once canonically even when several categories/affiliations point to them;
- category hubs expand/collapse their NPC nodes inside one shared pannable workspace;
- multiple category graphs may remain open at once;
- preserve real parent/child/partner edges and never invent NPC-to-NPC social facts;
- tap an NPC node to open the existing rich NPC profile/action sheet;
- support touch panning, pinch zoom, Focus on You, Fit Visible, search, relationship-strength filtering, deceased/former-affiliation filters, and per-category visibility;
- keep camera/filter/layout state out of `GameState` and the save schema;
- deterministic sector/ring layout plus viewport culling must remain usable for very large lifetime casts;
- lazy-load the People/Threadspace UI so graph code/CSS does not unnecessarily inflate the initial application path;
- expose the same canonical graph projection to the AI testbench;
- expand People semantic coverage for exact-NPC interaction, Argue, Meet someone, workplace concerns, Try for child, and Adopt through real `GameEngine` actions;
- add a dedicated Threadspace regression including multi-category canonical identity, filtering, real structural links, AI parity, caller isolation, and 180/1,000-person layout stress.

**4H is green only after both TypeScript gates, all existing regressions, the new Threadspace suite, production build, artifact upload, and Pages deployment pass.**

After 4H is green, Phase 4 closes again. Do not add another planned Phase 4 polish slice; only a concrete defect found by CI/playtesting may interrupt the transition.

### Phase 4Q — Cross-cutting quality infrastructure

**4Q1 AI Interaction Testbench:** green baseline; verified at 41/41 through run #62. The regression-only semantic interface uses real `GameEngine` actions, exact entity inspection, deterministic transcripts, diffs, invariant watches, and isolated in-memory persistence. It adds no player UI, player-save metadata, save schema, or parallel gameplay implementation.

4H extends the People semantic surface in the same testbench as part of the real People redesign rather than creating a separate QA feature phase.

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
- Random-event coherence must preserve exact saved pending-event completion across upgrades.
- Threadspace is a projection of NPC/Relationship/SocialWorld truth; it must never become a second relationship database.
- Testbench commands route through real GameEngine APIs; observation uses real read-only projections/catalogs.
- Test-only state stays cloned, uses `ai-test-*` slot IDs, and persists only to disposable in-memory storage.

## Phase 5 — Generations / Estates

**Closed. Preserve these guarantees while later finance/debt systems interact with estates and descendants.**

1. **Phase 5A — Estate planning + family continuity foundation:** green. Asset-specific property/business/collectible bequests, spouse/child residuary shares, debt-first settlement, protected minor trusts, widowhood cleanup, and descendant handoff are implemented. Estate Planning remains 46/46 and Family Continuity 18/18.
2. **Phase 5B — Fictional estate administration + settlement levy:** green; verified by Run #92. Country-sensitive fictional settlement profiles add protected administration allowances, capped administration costs, levy allowances/rates, one-authority obligation settlement, preview UI, specific-bequest protection, and multi-generation anti-duplication stress coverage.
3. **Phase 5C — Richer NPC-owned assets/businesses:** green; verified by Run #95. Meaningful NPCs carry bounded, individually addressable property/business portfolios; player↔NPC and NPC↔NPC estate transfer preserves retained assets and mortgages exactly once; descendant continuation carries the selected NPC's own holdings into playable state. Save schema is 10 with deterministic v9 migration. NPC Asset Ownership is 82/82. Run #96 subsequently certified the immediate timeline-reactivity and capped relationship-VFX hotfix, bringing deployed Timeline Scaling to 11/11 and Action VFX to 46/46 on expanded baseline `3b58f04827ddc88a33c61b3cdf0d50f1e7584161`.
4. **Phase 5D — Broader family topology:** green; verified by Run #97 on expanded baseline `8e5394d0488d1c760072590ffa5c06eadfdac9f6`. Aunt/uncle/cousin and the established close-family taxonomy derive from authoritative parent/child truth with indexed topology; People/Threadspace/events/continuation consume it; extended kin stay background-tier unless individually meaningful. Family Topology is 40/40 and the 1,082-NPC real-family benchmark remained bounded and state-valid.
5. **Phase 5E — Dynasty-scale validation + death/estate continuation flow:** green; verified by Run #98 on expanded baseline `5aa1c4338be4edc934b867f4e5a710d0e116aaa2`. Death is an intentional life-review → estate-outcome → inspect-successor → confirm-continuation flow. `DynastyTransitionSystem` projects existing Estate/NPC truth read-only; preview→continuation parity, named forced-sale reasons, bounded large-list presentation, and durable handoff consequences are regression-protected. Dynasty Transition is 63/63; Phase 5 is closed on schema 10.

Existing three-/eight-generation regression behavior, specific-bequest guarantees, protected minor inheritance, and estate anti-duplication rules are compatibility requirements for every later Phase 5 slice.

## Phase 6 — Credit / debt

**Current. Credit/debt must remain a visible player system and one accounting authority, not a collection of purchase-screen shortcuts.**

1. **Phase 6A — Credit & Banking Foundation:** CI Green Run #99. Save schema 11 adds bounded revolving-credit state, six fictional institutions/products, age-16 secured starter cards, deterministic underwriting/inquiries, visible contract terms, payments/statements/interest/fees, refundable deposits, transaction history, derived creditworthiness, evolving offers, bankruptcy/estate integration, and the Life-page Cash + Credit Available / Credit & Banking surfaces. Credit & Banking is 74/74.
2. **Phase 6B1 — Asset Financing Foundation:** CI Green Run #100 on expanded source `819d223aa9a0d5f9109c705f16213c43ddcaeb31`. Adds **Buy Outright** and **Finance** paths for eligible vehicles/homes through one reusable `AssetFinancingSystem` that consumes CreditSystem underwriting truth. Contracts expose lender, approval/decline reason, down payment, principal, APR, term, payment, finance charge, full-term cost, and projected burden; signing re-underwrites and creates the exact real `car`/`mortgage` liability. Asset Financing is 77/77.
3. **Phase 6B2 — Secured delinquency / collateral consequences:** CI Green Run #101 on expanded source `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`. Missed secured payments become persistent arrears rather than fake amortization; the player gets a one-Age-Up cure window; uncured cars can be repossessed and uncured mortgages foreclosed; surplus/deficiency settlement stays in the real finance/asset/credit authorities; underwater voluntary home sales cannot erase debt. Asset Delinquency is 82/82.
4. **Phase 6B3 — Payments & Asset Management UX:** CI Green Run #102 on expanded source `8b2a49fe76c5429cf55228a00a15b6103211a25b`. Save schema 12 adds durable annual auto-pay preference, explicit card past-due state, and secured paid-ahead state. Credit & Banking centralizes Bills & Payments; Property consolidates home/vehicle Browse + Owned views; vehicle selling performs real payoff/equity/deficiency accounting. Payment & Asset Management is 79/79 in Run #102.
5. **Post-6B3 Credit History live-reactivity correction:** current predeployment candidate. Remove History-tab transaction memoization that can retain stale projections when CreditSystem appends to its bounded transaction array in place. No schema/content/math change.
6. **Phase 6C — Personal borrowing + recovery:** only after the post-6B3 correction is CI Green. Add personal-loan offers where useful, voluntary bankruptcy/player decision flow, longer recovery/derogatory consequences, hardship events, and recovery pathways. Existing automatic severe-insolvency protection remains compatible until intentionally replaced/extended.

Compatibility requirements: Credit Available is never cash/net worth; browsing offers never rerolls outcomes or creates inquiries; formal applications are bounded; signed terms remain inspectable; secured deposits stay represented value; liabilities survive into estate settlement; history storage stays bounded; and material approvals/declines/delinquency/default consequences remain player-visible.

## Phase 7 — Persistent world consequences

Planned: exact event cooldown tracking, expanded delayed consequence chains, more persistent target-aware follow-ups, parenting/property/business/school/special-career delayed consequences, and deeper national/world events.

## Cross-cutting later gates

- crash-safe last-known-good transaction recovery;
- target-device QA at 360/390/412/430;
- screen reader / keyboard accessibility;
- PWA install/offline upgrade QA;
- iOS/Android standalone behavior;
- regional name-pool expansion and long-dynasty repetition analysis;
- broader code splitting for the growing application chunk;
- generalized balance simulations informed by real player saves without shipping those saves as fixtures;
- continued expansion of AI semantic interaction coverage alongside authoritative player systems.

## Scope philosophy

Do not finish Everthread by maximizing feature count. Finish systems by adding enough persistence, interaction, consequence, UI clarity, and replay variety that independent systems combine into memorable life stories.
