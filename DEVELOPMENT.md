# Everthread — Development Status

Last updated: 2026-09-12  
Current build line: 0.12.0 pre-release  
Save schema: 12

## Product direction

Everthread: Life Unwritten is an original, mobile-first procedural life simulator. The central interaction is Age Up: one year advances the world, connected systems process in a deterministic order, events may interrupt for a decision, consequences persist, and death can hand the family thread to a descendant.

The project is intentionally data-driven. React renders and requests actions; simulation systems own critical mutations. One `GameState` is the authoritative runtime/save state.

## Current architecture

- `src/engine/GameEngine.ts` — public action façade used by UI.
- `src/types/` — authoritative state and content contracts.
- `src/core/` — RNG, math, deterministic IDs, invariant enforcement, and the centralized action-economy ledger/policies.
- `src/systems/` — isolated simulation domains, including persistent social-world ownership for schools, workplaces, and future organizations.
- `src/data/` — external content definitions for events, jobs, education, countries, health, crime, assets, achievements, and challenges.
- `src/services/SaveSystem.ts` — IndexedDB/local fallback, schema migration, account-level multi-slot life saves, active-slot tracking, JSON import/export.
- `src/screens/` and `src/components/` — mobile UI only; critical state is not intended to be mutated here.
- `src/tests/` — deterministic regression suite, content audit, and multi-life simulation harness.
- `src/minigames/` — reusable minigame definitions plus interactive timing, sequence, grid-memory, and decision challenge components with character-skill accessibility resolution.

## Current implementation slice

### Phase 6C — Personal Borrowing / Bankruptcy / Recovery (predeployment candidate)

- Built only on certified Run #103 / `7f1f58099fe5e8528dc8ec3c70c0ed340a2e8294`.
- Personal-loan offers consume CreditSystem underwriting/inquiry limits; accepted contracts remain authoritative FinanceSystem liabilities. PaymentSystem projects their bills, auto-pay, paid-ahead payments, delinquency, and cure.
- Voluntary bankruptcy is serious-distress gated, preserves secured/student debt, discharges eligible unsecured personal/card debt, and retains the existing multi-year credit recovery consequences.
- Save schema remains 12; optional loan provenance/lender metadata is normalized deterministically without RNG.
- Local TypeScript gates and the complete wall pass; Personal Borrowing & Recovery is 31/31 and Integrated Long-Life remains 105/105. Standalone production build passes at 155 modules. GitHub Actions remains final certification authority.

## Current corrective slice

### Post-6B3 Credit History live-reactivity correction (predeployment candidate)

- Built only on certified Run #102 / `8b2a49fe76c5429cf55228a00a15b6103211a25b`; Phase 6B3 is CI Green on save schema 12.
- Credit & Banking Overview, account details, and Bills & Payments already re-render from the authoritative engine revision. The History transaction lists alone used `useMemo` dependencies keyed to `state.finances.credit.transactions`, while CreditSystem appends transactions in place.
- The correction removes that unnecessary memoization and derives bounded current/prior history directly on render. No debt math, save state, RNG, action economy, or content changes.
- Payment & Asset Management regression now proves the shared read-only History projection immediately reflects newly posted in-place credit transactions; the suite is 81/81 locally.
- Both TypeScript gates, the complete regression wall, and the standalone 153-module production build pass locally. The all-in-one local preflight wrapper is host-time-limited during its repeated Vite transform, so GitHub Actions remains the integrated certification authority.

## Implemented foundations
### Phase 6B3 — Payments & asset management UX (CI Green, Run #102)

- Built only on certified Run #101 / `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`; Phase 6B2 was CI Green.
- Added centralized `PaymentSystem` projection/actions over existing CreditSystem/FinanceSystem truth. Credit-card minimums plus car/mortgage annual obligations are itemized without introducing a second balance ledger.
- Credit & Banking Overview now opens **Bills & Payments** for Cash payment, past-due cure, and annual auto-pay preference. Card auto-pay covers only the required minimum; individual Accounts preserve optional extra/full balance payments.
- Secured manual bill payment credits the next Age Up through `prepaidThroughAge`, preventing duplicate amortization. Auto-pay OFF deliberately creates the same real delinquency/collateral-risk path established in 6B2.
- Property consolidates homes + vehicles with **Browse | Owned**. Owned vehicles can now be sold through a preview/confirmation sheet; financed sale proceeds settle lender payoff first and preserve any deficiency as unsecured debt.
- Save schema advances to 12 with deterministic v11 migration for `autoPay`, `pastDueAmount`, and `prepaidThroughAge`; legacy obligations default to auto-pay ON to preserve old behavior.
- Added Payment & Asset Management regression 79/79. GitHub Actions Run #102 reproduced the complete wall, canonical preflight GREEN 4/4, the 153-module production build, certified-baseline artifact creation, and Pages deployment. Expanded certified source is `8b2a49fe76c5429cf55228a00a15b6103211a25b`.

### Phase 6B2 — Secured delinquency / collateral consequences (CI Green, Run #101)

- Built only on certified Run #100 / `819d223aa9a0d5f9109c705f16213c43ddcaeb31`; Phase 6B1 is CI Green.
- Existing `Loan` remains the liability authority. Secured car/mortgage loans may now persist optional delinquency state (current/delinquent, arrears, missed payments, last missed age) without introducing a second debt ledger or save-schema bump.
- Annual finance no longer amortizes a secured payment that cash flow could not actually fund. A missed payment accrues interest, preserves the remaining term, enters CreditSystem missed-payment history, and creates a durable warning with a one-Age-Up cure window.
- Assets → Money and owned asset cards expose collateral risk. The player can cure the full past-due amount with Cash before aging; Credit Available is not a cure source.
- Leaving a delinquent car unresolved into the next Age Up can repossess the vehicle; leaving a delinquent mortgage unresolved can foreclose the home. Recovery is applied to the secured balance, surplus/equity is represented, and unrecovered deficiency becomes ordinary unsecured debt instead of vanishing.
- In involuntary foreclosure, residual equity reconciles existing unsecured shortfall debt before any remainder returns as cash. Voluntary underwater home sales likewise preserve a real deficiency, closing a debt-erasure exploit.
- Same-year secured shortfall allocation protects housing first by missing car financing before a mortgage when that alone closes the gap; deeper insolvency can make both obligations delinquent.
- Added `assetDelinquencyRegression.ts`: 82/82 locally. Full canonical local preflight from the certified Run #100 artifact is GREEN 4/4; production build succeeds at 151 transformed modules.
- GitHub Actions Run #101 certified expanded source `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`; Asset Delinquency is 82/82 and Phase 6B2 is CI Green.

### Phase 6B1 — Asset Financing foundation (CI Green, Run #100)

- GitHub Actions Run #100 certified expanded source `819d223aa9a0d5f9109c705f16213c43ddcaeb31` from the 6B1 overlay.
- `AssetFinancingSystem` uses `CreditSystem` underwriting as the single creditworthiness authority for deterministic home/vehicle quotes and exact signed `car`/`mortgage` liabilities.
- Mobile **Buy Outright | Finance** exposes lender, approval/decline reason, APR, term, down payment, financed principal, payment obligation, finance charge, full-term cost, and projected burden before commitment.
- Asset Financing is 77/77; Credit & Banking 74/74; Core 82/82; Integrated Long-Life 105/105; all established suites, both TypeScript gates, production build, certified artifact creation, and Pages deployment are green.
- Save schema remains 11.

### Phase 6A — Credit & Banking foundation (CI Green, Run #99)

- Built on certified Run #98 / `5aa1c4338be4edc934b867f4e5a710d0e116aaa2`; GitHub Actions Run #99 certified expanded source `6eb2b7876203d47dcc1ad5c48f1098bf359182cd`.
- Save schema 11 introduces bounded persistent player revolving-credit state with deterministic v10 migration.
- Added `CreditSystem`, six fictional institutions/products, secured starter credit from age 16, deterministic credit profile/offer projection, bounded applications/inquiries, account balances/available credit, statements/minimums, manual payments, interest/fees, account closure/refundable deposits, transaction history, and bankruptcy/estate integration.
- Life shows Cash and Credit Available as separate adjacent values and opens a mobile Credit & Banking hub for Overview, Accounts, Offers/contracts, and History.
- Credit Available never counts as owned wealth. Secured deposits remain assets; card balances remain liabilities.
- Credit & Banking regression is 74/74; Core 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; established suites are green.


### Phase 5C — Persistent NPC asset ownership (CI Green, Run #95)

Phase 5C moves meaningful family wealth beyond aggregate NPC property numbers while preserving the bounded simulation-tier architecture.

- Save schema v10 adds lean `NpcAssetPortfolio` state for individually addressable NPC properties and business interests. Existing v9 aggregate NPC property migrates deterministically into a stable explicit holding without consuming player RNG.
- `npc.wealth` remains liquid wealth; NPC property value is a projection of explicit holdings, and reconciled NPC net worth uses property equity, active business value, and unsecured debt without double-counting mortgages.
- Meaningful NPCs can organically acquire/progress a small bounded portfolio through a dedicated deterministic asset substream. Background-tier NPCs can retain/progress existing or inherited holdings but cannot seed new explicit property at creation or organically accumulate new ones during coarse simulation.
- Player estates can pass retained property/businesses to offscreen adult NPC heirs as real holdings. Minor NPC heirs hold retained assets in protected trusts until adulthood. Adult portfolios and minor trusts are both hard-capped at 6 properties / 4 businesses; overflow liquidates to represented value instead of growing saves without bound.
- NPC death settlement transfers retained assets to player/NPC children, carries mortgage obligations once, preserves the established 55% NPC-estate distribution tuning, and clears the source estate so settlement is idempotent.
- Descendant continuation now preserves the selected NPC's own property/businesses, reconstructs mortgages once, separates unsecured personal debt, and merges personal holdings with the deceased protagonist's estate by stable asset ID.
- People detail sheets expose liquid wealth, property/business value, debt, estimated net worth, and individually named holdings.
- Life timeline presentation now keeps the full authoritative history while rendering the newest 120 entries first and revealing older history in 120-entry increments, preventing multi-thousand-entry lives from creating multi-thousand-node timeline DOMs.
- Dedicated NPC Asset Ownership regression: 82/82. Run #96 deploys Timeline Scaling 11/11 and Action VFX 46/46. Core 82/82, Estate Planning 46/46, Estate Administration 63/63, Integrated Long-Life 105/105, and every established dedicated suite remains green. Both TypeScript gates and the 142-module production build passed; Pages deployed successfully. The earlier 50-life family-policy bulk sanity produced zero anomalies/forced terminal deaths; scale hardening additionally validates 600 starting background NPCs + 3,000 timeline entries over 12 years, while an ad-hoc 1,000-NPC + 5,000-entry / 20-year benchmark completed in ~1.1 s with zero organic explicit background holdings and zero validation errors.
- Run #95 expanded to certified source `62e28aafb190f8b46d10b73fb6dd00985beb724d`; Phase 5C is CI Green.

### Post-Run95 playtest hotfix — CI Green, Run #96

- Life → Your Story no longer memoizes its bounded timeline window by array identity. Because authoritative `GameState` is mutated in place and revisioned externally, Age Up can append entries to the same array reference; recomputing the 120-entry window per render makes the new year visible immediately without navigation or refresh.
- Action VFX snapshots record the timeline length at press time. Newly appended `relationshipDelta` values act as a semantic fallback when relationship scores clamp at 0 or 100, so valid NPC interactions still emit relationship gain/loss VFX even when the stored score cannot move farther. Historical entries are excluded.
- Run #96 reproduced Action VFX 46/46, Timeline Scaling 11/11, Core 82/82, NPC Asset Ownership 82/82, Integrated Long-Life 105/105, every established suite, both TypeScript gates, and the 142-module production build. Expanded certified source is `3b58f04827ddc88a33c61b3cdf0d50f1e7584161`.

### Phase 5D — Broader family topology (CI Green, Run #97)

- `FamilyTopologySystem` derives authoritative player kinship from existing family graph edges using parent/child indexes rather than pairwise NPC comparison. It introduces aunt/uncle and cousin while reconciling the established close-family taxonomy from the same source of truth.
- No NPCs are spawned to fill a family tree. Topology synchronization is deterministic, idempotent, RNG-neutral, runtime-ID-neutral, preserves existing affinity/compatibility, and preserves active/historical romantic labels rather than silently rewriting them.
- Extended kin remain background-tier unless the ordinary meaningful-relationship threshold makes an individual worth full simulation. Their births and ordinary life changes do not automatically flood the player's timeline.
- People folders, Threadspace labels/projection, generic family event selection, delayed family-favor targeting, special-career family targeting, save backfill, and descendant continuation all consume the expanded taxonomy.
- Save loading repairs invariants before deriving topology, and descendant handoff resynchronizes kinship so prior sibling/niece relationships become aunt/cousin when control moves down a generation.
- Save schema remains 10 because topology is fully derivable from existing parent/child/partner truth.
- Family Topology regression: 40/40. Run #97 reproduced every established suite, both TypeScript gates, the 144-module production build, certified artifact creation, and Pages deployment. Expanded certified source is `8e5394d0488d1c760072590ffa5c06eadfdac9f6`.
- Scale proof: a 1,082-NPC real extended-family graph with 180 aunts/uncles and 900 cousins synchronized in ~4.5 ms locally and advanced six years in ~362 ms; normal autonomy grew the cast to 1,182, no extended kin were forced full-tier, and validation returned zero errors.

### Phase 5E — Dynasty transition / end-of-life agency (predeployment candidate)

- Added `DynastyTransitionSystem`, a read-only projection over the authoritative EstateSystem + existing NPC biography/assets. It does not create a second inheritance calculation and consumes no gameplay RNG or runtime IDs.
- Death is now an intentional mobile flow: review the completed life and estate outcome, inspect living-child successor candidates, then explicitly confirm the descendant to continue. A child card no longer instantly commits the generation switch.
- Successor inspection exposes the life already in progress: age/location, education, career, partner/children, health/happiness, fame/reputation, existing debt, personal net worth, owned property/businesses, projected inheritance, named inherited assets, and protected-minor trust timing.
- Estate review exposes gross estate, family distributable value, debts, administration, levy, heir allocations, retained assets, and named forced sales with obligation-vs-fairness reason. It is the same projection used to prove what continuation will apply.
- Confirmed continuation suppresses ordinary action-delta VFX because the before/after states belong to different protagonists; otherwise a generational switch could incorrectly look like money/stress/relationship gain or loss.
- The new protagonist timeline preserves the important settlement story after the death overlay closes: inheritance/trust, obligations and forced sales, named inherited assets, and value distributed to other family heirs.
- Extreme heir/successor/sale lists use 24-row progressive disclosure rather than mounting an unbounded death-screen DOM. Authoritative lists remain complete.
- Dedicated Dynasty Transition regression currently passes 63/63. It proves read-only/RNG-neutral review, written-plan context, adult/minor successor biography, named forced-sale reasons, exact preview→continuation inheritance/asset parity, durable post-handoff history, and 12 reviewed sequential handoffs over hundreds of NPCs with 7,212 archived timeline entries.
- Save schema remains 10; no new persisted transition state is needed. Full established regression wall and both TypeScript gates remain green; production build currently transforms 145 modules.

These are functioning systems rather than navigation placeholders, though some still need additional depth.

### Full NPC life simulation (0.12.0)

Phase 3 moves autonomous people from lightweight surrounding state into persistent resumable biographies while preserving simulation tiers for performance. `NpcLifeSystem` owns autonomous life domains; ordinary NPC records remain the identity/family graph, Social Worlds remain affiliation history, and RelationshipSystem remains the player-facing relationship domain.

- v8→v9 migration deterministically initializes missing NPC education, career, finance/household, health, legal, public-life, and simulation-cadence state without advancing the player RNG stream.
- Important NPCs progress through education, real career history, household cash flow, debt/property, illness, legal incidents/imprisonment/release, fame/reputation/followers, family formation, adoption, household moves, retirement, inheritance, and death. Background acquaintances retain cheaper cadence until a meaningful relationship promotes them to full simulation.
- Blended-family formation can introduce partner children and derives real stepfamily links. Stable low-fertility close-family couples can adopt, while family/relationship progression has bounded pressure against decades of accidental RNG limbo.
- Adult descendant continuation transfers the selected NPC's accumulated biography directly instead of reconstructing major education/health/legal/fame/debt history from generic defaults.
- People detail sheets expose the NPC biography so offscreen life changes remain visible to the player.
- Household relocation moves partners and dependent children together, protects current player spouses/dependent players from silent autonomous moves, and uses a deterministic household-specific RNG substream so relocation cannot perturb unrelated life outcomes.
- Hidden opinion plus recent emotional memory influence relationship drift and targeted-event relevance.
- NPC housing appreciation/debt service uses the bounded economy and real household cash-flow accounting.
- Seeded RNG counter jumps are O(1) while remaining sequence-identical, reducing long simulation cost across every system.
- Verification: 82/82 regressions; eight-generation dynasty stress passes; final neutral/mixed 1,000-life populations each complete with zero anomalies/forced terminal deaths and average lifetime casts ~116 NPCs (max 176).


### Persistent workplace social worlds (0.11.0)

Work is now the second consumer of the persisted Social World layer. Employers own workplace membership, roles, departments, culture, morale, tension, and reputation; ordinary NPC records still own the people; RelationshipSystem still owns the player's evolving personal relationship with them. Former coworkers therefore remain part of work history when a friendship, rivalry, romance, promotion, resignation, or job change alters the current relationship.

- v7→v8 migration initializes part-time employment history and reconstructs persistent workplace worlds for existing current/historical careers.
- Full-time employers generate persistent managers/coworkers, bounded team membership, departments, workplace metrics, and senior-character direct reports.
- Promotions within the same employer preserve the workplace; resignation, firing, layoff, retirement, and employer changes archive it without deleting former coworkers.
- Workplace actions cover collaboration, networking, manager feedback, and formal coworker concerns through the central action economy.
- Career processing now includes workplace-sensitive performance, bonuses, layoffs, demotions, manager effects, morale/tension, and bounded staff turnover.
- Target-aware work events bind exact current coworkers/managers for credit disputes, reviews, rumors, team feuds, after-hours connections, formal claims, and bonus pools.
- Part-time work is now real persisted employment with pay, performance, hours/week, independent small workplace rosters, and a shared weekly capacity that tightens around school/full-time commitments.
- Work affiliation is independent of relationship type: a coworker can become a friend/enemy/partner and still remain discoverable in People → Work.
- Generational handoff clears the previous protagonist's social worlds and reconstructs worlds appropriate to the controlled descendant, preventing inherited offices/schools from leaking across protagonists.
- Verification before deployment: 71/71 regressions; 1,000 neutral and 1,000 mixed-policy lives completed with zero anomalies and zero forced terminal deaths.

### Persistent school social worlds (0.10.0)

School is now the first consumer of a generic persisted Social World layer. Institutions own membership/roles/groups, NPC records own the people, and RelationshipSystem owns the player's evolving relationship with them. This keeps school affiliation intact when a classmate becomes a friend/enemy/partner and gives the upcoming workplace phase the same reusable foundation.

- v6→v7 migration reconstructs school worlds from existing education records without rewriting old education history.
- Country profiles vary entry/transition/leaving ages while retaining primary/middle/secondary compatibility for existing career/content logic.
- Persistent rosters include classmates, teachers, coaches, and leadership; People → School is affiliation-driven rather than relationship-type-only.
- Clubs/teams/groups, attendance, conduct, social standing, honors, discipline, volunteering, academic risk, and admissions/scholarship weighting are implemented.
- School-targeted events bind exact roster NPCs so event copy, effects, memories, and People history refer to the same person.
- Ordinary school acquaintances use a cheaper background simulation tier; important relationships automatically receive full autonomy.
- Compulsory school leaving and school-friend romance age boundaries are enforced at the engine layer.
- Verification: 64/64 regressions; 1,000 distinct neutral and 1,000 distinct mixed-policy population lives completed with zero anomalies/forced terminal deaths, plus a final 500-life mixed sanity batch.

- Seeded character generation and advanced starting-stat controls.
- Centralized primary/secondary stats and talents.
- Ordered one-year Age Up transaction with double-activation lock.
- Event interruption: Age Up pauses final death resolution until a decision is resolved.
- Data-driven event conditions, weighted outcomes, effects, rare-event handling, target-aware context payloads, and delayed consequences.
- Mobile life timeline and death summary.
- Persistent NPC records, relationship scores, memories, personality response modifiers, NPC aging, health drift, real career progression, linked autonomous partnerships, marriage/divorce/widowhood, bounded autonomous children, inheritance, and death.
- Dating, partner/fiancé/spouse/ex states, marriage/divorce/reconciliation, biological children and adoption.
- Country-profile childhood schooling with persistent classmates/teachers/leaders, clubs/teams/groups, conduct/attendance/honors, admissions profiles, scholarships, student debt, graduation/dropout rules, and post-secondary progression.
- 51 standard-career ladders / 306 job positions with requirements, interviews, salary, performance, promotion/demotion, termination/layoff, bonuses, raises, retirement, freelance gigs, persistent workplaces, and real part-time employment.
- Annual finances, tax, baseline living costs, dependent/pet/asset costs, loans, net worth, and yearly summaries.
- Dynamic bounded economy for cost, wage, housing, business-demand, and market-cycle pressure.
- Fictional investment market with stocks, funds, bonds, speculative assets, regimes, buy/sell, and portfolio history.
- Property purchase, mortgage, appreciation/condition, renovation, sale, and basic rental flow.
- Vehicles, boats/aircraft definitions, collectibles, and purchase/condition/value state.
- Business founding, products, employees, demand, reputation, annual P&L, valuation, growth, and bankruptcy state.
- Health conditions, treatment, wellness, fitness, addiction/recovery state.
- Abstract crime, detection, legal cases, lawyer tiers, conviction, prison, prison activities, appeal, and abstract escape outcome.
- Fame/social posting/publicity actions.
- Pets with annual aging/health and interactions.
- Travel, emigration, visited locations, and license checks.
- Acting, music, sports, combat sports, military, politics, royalty, modeling, racing, directing, organized-crime, museum, zoo, fictional intelligence agency, commune, and casino state tracks.
- Achievements, challenges, progress UI, multi-slot Life Saves, aggregated past-life history, dynamic best-life Family Legacy showcase, death records, and descendant continuation.
- Rewind snapshots for rewind-enabled saves.
- Theme, accent, text scaling, reduced motion, high contrast, sound, haptics, optional notification preference, profanity preference, minigame preference, and autosave preference.
- PWA manifest/service worker scaffolding and app-background autosave.
- JSON save export/import with validation and schema migration.
- Sandbox/debug surface for age, cash, forced death, RNG inspection, and rewind snapshots.


### First mobile playtest hardening (0.9.5)

The first live human playtest exposed same-year action exploits that headless simulations did not reproduce naturally. The 0.9.5 pass hardens those systems at the simulation layer rather than only disabling buttons in React.

- Standard-career applications now enforce actual relevant industry experience for non-entry roles; interview difficulty is no longer a substitute for experience.
- Starting a new job is limited to once per age after a successful hire, preventing same-year job hopping.
- `Work harder` and `Ask for raise` are each limited to one use per age, and standard-role compensation is bounded against the current market pay band so annual raises cannot compound into runaway values.
- Save schema v5 repairs obvious v4 runaway-compensation saves: impossible salary is normalized, an experience-inappropriate current role is corrected, and a clearly identifiable exploit-year cash windfall is reverted without touching ordinary saves or sandbox saves.
- Biological parenting now creates a one-year pregnancy state instead of an immediate birth. A successful conception resolves after the next Age Up, same-year retry spam is blocked, and sibling names avoid duplicates while unused regional names remain.
- Mobile money labels use compact notation for million-plus values so debug/sandbox/extreme-save values cannot widen cards off-screen.
- PWA navigation now prefers the network while retaining an offline fallback, and service-worker cache versioning/update checks make new phone builds surface more reliably after deployment.
- Validation after these changes: 37/37 regressions; neutral and mixed-policy 1,000-life runs both completed with zero anomalies and zero forced terminal deaths.

### Life Saves and dynamic Family Legacy (0.9.9)

The former single-slot `Past Lives` surface is now a true account-level save manager without changing the authoritative per-life `GameState` model.

- Independent new lives allocate stable `slot-N` identifiers in the existing save store instead of replacing `slot-1`. The last selected slot is remembered separately from simulation state.
- The Life Saves tab exposes Ongoing Lives for switching/deleting independent lineages and Past Lives for completed characters aggregated from every surviving lineage.
- Pending autosaves are flushed before switching or deleting. Current state is explicitly persisted before normal switches/new-life creation, preventing queued writes from crossing slot boundaries.
- Imported save JSON becomes a new independent slot rather than overwriting a matching source slot ID.
- Completed deaths record their generation going forward; older saves infer completed-life generation from chronological lineage order, so schema 6 remains compatible without a migration bump.
- Family Legacy is derived from all surviving current/completed lives. Its bounded score combines longevity, primary stats, logarithmic net worth, fame, family, career, and major milestones; a stronger Generation 2 can therefore remain featured while a weaker Generation 4 is active.
- Deleting the save that owns the current featured life automatically removes those candidates and promotes the next-highest surviving life. Individual ancestors inside a surviving lineage are not independently deletable, preserving generation/inheritance continuity.
- Validation after this pass: 57/57 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Relationship graph and playable minigames (0.9.8)

The People tab now uses the persistent NPC graph as a navigation surface instead of presenting every relationship as one flat list. The first real minigame layer also connects player execution to existing simulation outcomes without replacing character progression.

- People now opens into relationship folders: Player Family, Relatives, Friends & Social, Romantic History, School, and Work. Search still spans all direct player relationships.
- Opening a folder renders a mobile relationship tree rooted on the player. Structural edges come only from persisted `parentIds`, `childIds`, and `partnerId`; disconnected direct relationships receive a player link so the tree stays navigable without inventing NPC-to-NPC connections.
- Extended-family branches prefer known intermediate connections. For example, a niece/nephew with a known sibling parent hangs beneath that sibling instead of also receiving a redundant direct edge to the player.
- NPC detail sheets now expose known parent, child, and partner connections alongside memories and interactions.
- The reusable minigame layer now supports timing, sequence-memory, grid-memory, and safety-oriented decision mechanics. Reduced-motion environments automatically substitute a non-motion sequence challenge for timing games.
- Acting auditions, pro-sports contract attempts, combat bouts, motorsport races, and prison-escape attempts now accept minigame performance scores as bounded modifiers. Character stats/skills and seeded world RNG remain part of the final outcome.
- License quizzes remain interactive; when the minigame preference is disabled, licenses and supported special challenges resolve from character skill plus a pure seeded challenge score. Accessibility skip resolution does not mutate the core RNG outside the engine action.
- Validation after this pass: 55/55 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Childhood eligibility and dependent finances (0.9.7)

The second live playtest exposed a separate class of bug from same-year spam: some systems had frequency limits but no concept of whether the player was old enough to perform the action at all.

- Investment trading is adult-only at age 18+ at the system layer and presents a locked mobile state before adulthood. Pet adoption unlocks at age 5 and collectible-market purchases at age 12.
- Independent vacations are adult-only. Family trips unlock at age 5, require a living guardian while the player is a minor, and charge the guardian NPC's simulated household wealth instead of the child's personal cash.
- Structured wellness now unlocks in stages: walking 3+, running 5+, martial arts/meditation 6+, intentional diet activity 10+, gym 13+.
- Dependent minors do not personally absorb ordinary baseline/lifestyle/dependent/pet/property/vehicle costs or annual loan payments. Teen income can still be taxed when actual taxable income exists.
- A negative under-18 cash balance is covered by tracked guardian support instead of becoming an unsecured 12% personal loan.
- Validation after this pass: 51/51 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Action economy and anti-reroll hardening (0.9.6)

The first human playtest showed that isolated cooldown fixes were not enough: many buttons represented a full year of meaningful effort but could be tapped repeatedly until the random result became favorable. Everthread now treats yearly opportunity/time as a first-class simulation resource.

- `src/core/actionEconomy.ts` is the central policy registry and ledger API. Systems claim one or more policies atomically; React only queries the same policies for presentation.
- Failed random outcomes consume their opportunity when the attempt itself happened. Rejected job applications, failed auditions, lost fights, failed treatment and similar outcomes cannot be rerolled for free in the same age.
- Career, education, wellness/health, social/relationship, parenting, fame, travel/license, crime/prison, pets, collectibles, business progression, property renovation and major special-career actions now have explicit yearly limits or cooldowns where repetition would otherwise trivialize progression.
- Pure configuration/reallocation actions that do not generate a new outcome, such as investment allocation or business pricing/pay settings, remain intentionally flexible rather than receiving arbitrary cooldowns.
- `GameEngine.run()` now detects action-ledger/RNG/ID mutation even when an action returns `success:false`, ensuring a consumed failed attempt still notifies subscribers and autosaves.
- The React store subscribes to a private engine revision number rather than mutable `GameState` object identity, so every engine emission reliably invalidates the UI snapshot.
- Save schema v6 persists the ledger and migrates legacy annual career/family markers into it.
- Relationship marriage/reconciliation counters were moved into the owning relationship domain instead of being patched after the engine action emitted.
- Mobile controls on the major action surfaces disable once the same engine policy is exhausted, so the player receives immediate feedback instead of learning only from an error toast.
- Validation after this pass: 47/47 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

## Verification milestone

Added in the current hardening pass:

- Framework-independent deterministic regression suite: 64 passing tests.
- Multi-life simulation harness with `full` and faster `bulk` modes, independent aspiration profiles, six behavior policies, and wealth-percentile reporting.
- 1,000-life bulk run completed with zero detected structural state anomalies.
- Content audit executable from source data.
- Event selection refactored from scanning/rolling all 670 definitions every year to category-indexed routine selection plus a small exact-probability rare-event pass.
- Adult dating age bounds fixed.
- Parenting now rejects a biological path when either partner is below the game's minimum parenting age.
- Descendant inheritance no longer duplicates retained estate assets as full cash value; inherited mortgages remain attached to retained properties.
- Descendant relationship rebuilding now preserves parent/sibling/spouse/child structure instead of converting nearly everyone into a generic friend.
- Economy indices changed to bounded relative conditions so century-long lives do not destroy fixed game-currency milestones through nominal inflation.
- Existing standard-career wages now move with the same wage index used by newly hired workers.
- Achievement evaluation reduced from duplicate annual evaluation and optimized with indexed progress / per-evaluation metric caching.
- Multi-heir estate settlement now normalizes living beneficiaries, pays non-mortgage estate debts, divides investments proportionally, allocates retained businesses/properties/collectibles against heir entitlements, and sells indivisible assets when retaining them would badly violate the estate split.
- NPC heirs receive their offscreen estate value instead of the controlled descendant silently receiving every retained asset.
- Continued adult descendants preserve an established standard career, spouse/partner, children, grandchildren, grandparents, siblings/half-siblings and selected friendship context where the persistent NPC graph supports it.
- Wealthy NPC parents can now leave inheritance directly to the player character; lifetime inheritance and inheritance count are tracked for achievements/diagnostics.
- Investment lifetime contributions/withdrawals and current cost basis/gain are tracked for balance analysis.
- Long-run fictional security drift was recalibrated for the bounded relative economy; volatility, bubbles and crashes remain while average real compounding is lower.
- Annual finances now include modest income-scaled discretionary lifestyle costs so high earners do not unrealistically bank every unspent salary dollar.
- Three-generation continuation and wealth-source reconciliation are covered by regression tests.

### Latest 1,000-life balance samples

Neutral-policy sample after the 0.9.8 relationship/minigame pass (headless balance behavior unchanged):

- Average / median lifespan: 78.6 / 81
- Average / median net worth: 1,210,543 / 637,451
- Wealth p10 / p25 / p75 / p90 / p99: 95 / 196,880 / 1,586,107 / 3,038,895 / 6,699,815
- Millionaire ending net worth: 40.5%
- Marriage frequency: 51.9%
- Average children: 0.53
- Any crime / conviction: 6.8% / 6.7%
- Fame 25+: 5.7%
- Average ending wealth sources: 707,011 cash / 117,743 property equity / 372,394 investments / 15,046 businesses / 1,651 other debt
- Average investing: 125,965 lifetime contributions / 125,034 held cost basis / 247,360 held unrealized gain
- Inheritance: 94.6% of lives receive some inheritance / 131,793 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

Mixed-policy sample:

- Average / median lifespan: 79.1 / 82
- Average / median net worth: 1,461,598 / 840,742
- Wealth p10 / p25 / p75 / p90 / p99: 4,863 / 244,661 / 1,759,906 / 3,533,598 / 9,083,312
- Millionaire ending net worth: 45.3%
- Marriage frequency: 54.8%
- Average children: 0.69
- Average ending wealth sources: 841,672 cash / 122,984 property equity / 455,253 investments / 43,318 businesses / 1,629 other debt
- Average investing: 161,931 lifetime contributions / 160,911 held cost basis / 294,342 held unrealized gain
- Inheritance: 93.8% of lives / 132,348 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

The market-calibration conclusion from 0.9.4 still holds: inheritance is not the dominant wealth source, and the headless policies underuse optional lifestyle consumption compared with a human. The 0.9.6 action economy prevents retry/grind exploits; 0.9.7 adds age eligibility and dependent-finance semantics without attempting to force an arbitrary millionaire percentage.

## Partially complete / needs deeper implementation

### NPC simulation

0.12.0 completes the Phase 3 foundation identified in the original scope gap. NPCs now persist education/credentials, real career histories, household cash flow/debt/property, health conditions, legal incidents/custody, fame/public reputation, household moves, partnership/family/adoption/blended-family state, emotionally relevant memories/opinions, inheritance, and death. Adult descendant handoff consumes that real history directly. Future NPC work is additional depth rather than a missing life-simulation foundation:

- More occupation/education-specific autonomous choices, richer household consumption, and NPC-owned businesses/vehicles/individual property assets rather than aggregate property value.
- More nuanced chronic-health treatment trajectories, criminal/legal branching, public-life careers, friendships between NPCs, and explicit non-player social organizations.
- Wider kin taxonomy (aunts/uncles/cousins) and more complex multi-household custody/guardianship where later generation work justifies it.
- Continued very-large-dynasty profiling as special careers, organizations, and world systems add more persistent NPC affiliations.

### Supplied action/static feedback assets — CI Green + universal-derivation hardening candidate

Mavyy supplied an original Everthread icon set for press-origin action feedback plus static Cash and DECEASED UI markers. The current candidate adds one reusable, presentation-only VFX authority instead of per-screen animation code: successful career/domain actions may request a primary icon while real post-action deltas derive stress, money, follower, and relationship feedback. Disabled actions do not execute and therefore do not emit; failed-but-executed actions may still show real adverse deltas. Touch origin is captured globally, keyboard activation uses the control center, reduced-motion avoids travel animation, and the effect never consumes game RNG or mutates saves.

The supplied artwork is technically processed only for transparency/cropping/downscaling; it is not regenerated or restyled. Static Cash appears on Life and DECEASED overlays dead Threadspace nodes. GitHub Run #93 made the asset integration CI Green at `de8f9af6a0212a0d90acecf9008afa77b042ac42` with Action VFX 38/38 and canonical preflight 4/4.

The current hardening candidate changes derived consequences from opt-in to default-on at the shared result resolver. Plain gameplay buttons now automatically emit Money Loss for real cash decreases, alongside stress/follower/relationship deltas; primary-domain requests automatically combine with those consequences; `derive:false` remains the intentional opt-out. Generic Path buttons no longer disable derivation simply because they lack a primary icon. Action VFX is 42/42 locally, every legacy suite is green, and production build passes.

### Generations and inheritance

The green Phase 5A foundation performs multi-heir estate settlement, proportional investment division, deterministic indivisible-asset allocation/sale, offscreen sibling inheritance, asset-specific property/business/collectible bequests, spouse/child residuary shares, protected minor trusts, and preservation of established adult descendant careers/spouses/children plus deeper family derivation.

Phase 5B is CI Green in Run #92 and adds fictional country-sensitive estate settlement rules without new persisted state: protected administration allowances, capped administration costs, levy allowances/rates, debt-before-levy calculation, and a single obligation path that can liquidate unassigned assets/investments before sacrificing a named bequest. Preview UI exposes the breakdown and explicitly labels the values as fictional gameplay rules. Dedicated estate-administration regression includes five-generation no-income anti-duplication stress. Save schema remains 9.

Next Phase 5 work after the universal-derived-VFX hardening reaches CI Green:

- NPC-owned businesses and individually addressable properties/assets rather than the current aggregate NPC property-value model.
- Aunt/uncle/cousin relationship types if the relationship model is expanded beyond the current supported taxonomy.
- Broader large-family performance validation across many sequential generations.
- Stronger death → estate review → descendant-selection presentation and consequences.

### Finance/debt

Loans, mortgage underwriting, annual shortfall debt, foreclosure, bankruptcy and a five-year post-bankruptcy mortgage lock now work as engine systems. Remaining depth:

- Car loans and optional personal-loan acquisition UI.
- Repossession for financed vehicles.
- Richer missed-payment / creditworthiness state instead of the current mortgage-miss counter.
- Voluntary bankruptcy UI and longer recovery consequences.
- Financial-hardship event chains and creditor/household consequences.
- More nuanced affordability rules across countries and household structures.

### Education / school social life

0.10.0 now provides the persistent school social layer: rosters, teachers/leaders, recurring classmates, activity groups, conduct/attendance/honors, profile-driven stage timing, targeted school events, and richer admissions/scholarship scoring. Remaining depth after this milestone:

- Larger school-event libraries and multi-year school consequence chains.
- More nuanced transfers, expulsions/re-entry, boarding/private/public variants, and school-specific facilities/culture.
- Richer team seasons, competitions, elections, awards, and group-specific minigames.
- More country/subregion profile variation beyond the current simplified profiles.
- Alumni reunions and later-life resurfacing events that explicitly leverage archived school worlds.

### Workplace

0.11.0 completes the persistent workplace foundation identified in the original scope gap: managers/coworkers, departments/roles, workplace metrics, recurring interactions, layoffs, demotions, bonuses, reporting/dispute paths, rumor/feud/social events, relationship evolution, employer history, and multiple part-time jobs with shared hour limits all use the same Social World/NPC/Relationship architecture. Future additions are depth rather than missing foundation:

- More industry-specific workplace cultures, hazards, unions/professional bodies, schedules, and employer archetypes.
- Richer multi-year workplace consequence chains and alumni/former-coworker resurfacing.
- More nuanced management spans, departments, transfers, mentorship, performance reviews, and severance/benefits.
- Workplace-specific minigames only where they add meaningful optional interaction without replacing character skill.

### Special careers

The state tracks and basic actions are real, but most special paths are not yet at the specification's intended depth. Acting, music, sports, combat, politics, military, royalty, modeling, racing, directing, organized crime and specialized organizations need dedicated content/events, progression gates, contracts, rivals/teams/casts/staff, retirement/end states, and richer mobile screens.

### Minigames

The first reusable interactive layer is now implemented. Timing, sequence-memory, grid-memory, and decision mechanics are available; acting auditions, pro-sports attempts, combat bouts, motorsport races, prison escape, and license checks are wired into live gameplay. Remaining depth:

- Direct interactive deployment and flight-specific challenge flows beyond the current reusable sequence/decision mechanics and license path.
- More sport-specific, acting-specific, and racing-specific variants so repeated careers do not feel like the same skin over one mechanic.
- Haptics/sound feedback, richer difficulty scaling, and device/accessibility QA.
- Event-driven minigame hooks where a challenge is optional and consequences remain valid when minigames are disabled.

### Events / consequences

691 event definitions exist and routine selection is efficient. The first five multi-year consequence chains now preserve exact NPC/origin-age context. Remaining work:

- Expand delayed consequences across parenting, crime/legal history, property, business, school, and special careers.
- Event cooldown currently follows recent-event history rather than storing an exact last-trigger year.
- Convert more existing relationship events to pre-bind specific persistent NPCs.
- National/world event layer remains shallow.
- More special-career, business, legal, prison, property, parenting and old-age follow-ups are needed.

### Mobile / accessibility / PWA QA

The shell is mobile-first and has safe-area CSS/accessibility settings, but final device QA has not been completed for all target widths (360/390/412/430px), browser screen readers, keyboard-only use, installability, offline cache upgrades, iOS standalone behavior, and Android standalone behavior.

## Known architecture / quality issues

1. Exact seeded replay includes state-scoped runtime IDs and has a 50-year serialization regression. Remaining replay risk is future code introducing wall-clock/random state outside seeded systems; keep the replay test mandatory.
2. The centralized action ledger now covers the major profitable/progression-bearing player actions, but every new action must be classified deliberately as unlimited configuration, resource-limited, yearly-limited, cooldown-based, or consequence-escalating. Avoid reintroducing ad-hoc button spam paths.
3. Simulation policies are separated and wealth-source diagnostics are available. Neutral and mixed populations should remain the balance baseline; do not tune core costs around a headless bot that still underuses optional lifestyle purchases.
4. Bulk simulation suppresses achievement/challenge evaluation and truncates timeline history intentionally for performance. Full-mode runs remain the correctness reference.
5. Save schema migration covers versions 1→12. Every future persisted state addition needs an explicit default/migration path, and old rewind snapshots must continue to migrate before restoration.
6. No runtime error boundary / last-known-good transaction backup exists yet around every important action. IndexedDB persistence is versioned, but crash-safe transactional recovery needs hardening.
7. Full React/Vite production builds require installed npm dependencies; local engine/tests are compiler-validated in the current workspace and GitHub Actions remains the authoritative dependency-backed mobile deployment gate.

## Save schema history

### Version 1

Initial centralized life state.

### Version 2

Added travel history and license state.

### Version 3

Added inheritance configuration and rewind snapshots; migration fills missing achievements/challenges/completed lives/special-career/flag structures.

### Version 4

Added persisted `idCounter` for deterministic state-scoped runtime IDs. Migration initializes a deterministic post-legacy counter and rewind restores migrate older snapshot payloads before use.

### Version 5

Added persistent family-planning/pregnancy state and targeted repair for obvious pre-fix runaway compensation/career saves from the first live mobile playtest.

### Version 6

Added the persisted centralized `actionLedger` with per-age usage, last-used ages for cooldowns, and a revision counter used by `GameEngine` to detect failed-but-mutating outcomes. v5 migration preserves legacy annual career/family action markers where present.


### Version 7

Added persisted `socialWorlds` for school/workplace/organization membership and school-specific roster/group/conduct state. v6 migration reconstructs school worlds from existing education records so old lives retain their educational history while gaining persistent school affiliations.

### Version 8

Added persisted workplace-specific Social World state plus real `partTimeJobs` / `partTimeHistory`. v7 migration reconstructs workplace worlds from existing career records, while generational handoff rebuilds social worlds for the newly controlled descendant rather than carrying the prior protagonist's institutions forward.

### Version 9

Added persistent `NpcLifeState` biographies and simulation tiers. v8 migration deterministically initializes missing NPC education/career/finance/health/legal/public-life/household state without consuming the player RNG stream; adult descendant handoff can now transfer this accumulated history directly.

### Version 10

Added lean persistent NPC property/business portfolios and protected NPC asset trusts. v9 migration deterministically promotes legacy aggregate NPC property value into bounded explicit holdings without consuming player RNG. Phase 5D and Phase 5E add no new persisted fields: broader kinship and the death/estate/successor review are deterministic projections over existing authoritative state while remaining on schema 10.


### Version 11

Adds bounded player revolving-credit authority under `finances.credit`: accounts, current/recent transactions, formal inquiries, derogatory history, and compact archived positive-history summaries. v10 migration initializes an empty deterministic credit state without consuming gameplay RNG.

### Version 12 — current

Adds durable payment-management state while preserving existing debt authorities: per-card/per-secured-loan annual auto-pay preference, explicit card past-due amount, and secured-loan paid-ahead age. v11 migration defaults existing obligations to auto-pay ON, carries no new RNG consumption, and preserves 6B2 delinquency state.

## Next development sequence

1. Certify the post-6B3 Credit History live-reactivity correction against Run #102 / `8b2a49fe76c5429cf55228a00a15b6103211a25b`. Do not begin 6C until this correction is GitHub Actions Green.
2. Phase 6C: deepen personal loans, voluntary bankruptcy, recovery/rehabilitation, and hardship consequences using the same payment/credit/finance authorities.
3. Phase 7: expand exact cooldowns, long-term delayed consequences, persistent target-aware follow-ups, and national/world events across the whole simulation.
4. Perform target-device mobile/accessibility/PWA QA and add crash-safe last-known-good transaction recovery around major engine actions.
5. Expand regional names substantially and verify long-dynasty repetition rates.
6. Run save-migration, large-family, full-mode and 10k/100k bulk simulation gates before release labeling.
