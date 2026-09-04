# Everthread Changelog

## 0.10.0 — 2026-09-04 — Persistent School Social Worlds

### Added

- Save schema v7 with a persisted generic `SocialWorld` layer for schools now and workplaces/organizations later. Existing v6 education history reconstructs compatible archived/current school contexts during migration.
- Country-profile school progression with varied stage start/transition ages and simplified minimum school-leaving ages while preserving the established primary/middle/secondary education record taxonomy.
- Persistent school rosters with classmates, teachers, coaches, and school leadership stored as ordinary NPCs with memories, relationship state, aging, careers, and later-life continuity.
- School clubs, teams, service groups, arts, academic organizations, social groups, and leadership paths tied to recurring roster NPCs.
- Persistent attendance, conduct, social standing, honors, disciplinary history, academic-shortcut consequences, and school volunteering.
- Admissions profiles that combine academics, intelligence, discipline, conduct, involvement, reputation, school standing, and honors; scholarships can cover different proportions of tuition.
- Target-aware school events for recurring classmates and school authorities. Event effects and memories bind to the same NPC shown in the event copy.
- Shared-world history in People sheets so former classmates remain identifiable by the institution/role through which the player knew them.
- Background NPC simulation tier for ordinary school acquaintances; meaningful friends, rivals, romantic relationships, and family automatically receive the full annual autonomy pass.
- Explicit simulation seed prefixes for independent population batches plus streaming simulation aggregation to avoid retaining complete result objects for every finished life.
- Regression coverage for school-world migration, country school profiles, persistent rosters, bounded group activity, conduct/attendance, admissions weighting, compulsory-school leaving rules, and school-friend romance age safety.

### Changed

- School affiliation is no longer encoded solely by `Relationship.type`. A former classmate can become a friend, enemy, partner, or spouse and still remain discoverable in People → School through persisted institutional membership.
- Childhood education transitions are profile-driven rather than one global 5→11→14→18 schedule.
- Compulsory school cannot be dropped before the profile's minimum leaving age; post-secondary programs remain voluntarily leaveable.
- Teen/adult relationship milestone validation now applies to existing school friends too, closing a path that could bypass the normal dating-age rules.
- School activity effort uses the centralized action ledger, preventing join/participation/academic-risk reroll spam.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 64/64 regression cases pass.
- 72 TS/TSX source files pass syntax transpilation in the dependency-limited workspace.
- Two distinct 500-life neutral batches (1,000 unique lives total): zero anomalies and zero forced terminal deaths.
- Two distinct 500-life mixed-policy batches (1,000 unique lives total): zero anomalies and zero forced terminal deaths.
- Additional final 500-life mixed-policy sanity batch after age-boundary fixes: zero anomalies and zero forced terminal deaths.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

## 0.9.9 — 2026-09-04 — Life Saves & Dynamic Family Legacy

### Added

- Real multi-slot life saves backed by the existing IndexedDB/local fallback store. Independent new lives no longer overwrite `slot-1`.
- Account-level active-save tracking so Everthread reopens the last selected life and safely falls back to another surviving slot when needed.
- `Life Saves` tab with an expandable Ongoing Lives folder for switching between independent lives and deleting saved lineages, plus an account-level Past Lives folder aggregated from surviving saves.
- Dynamic Family Legacy showcase that ranks living and completed lives using a bounded legacy score across longevity, primary stats, logarithmic wealth, fame, family, career, and major milestones.
- Completed-life generation metadata for new deaths, with index-based generation inference for older saves.
- Regression coverage for collision-free slot allocation, earlier-generation legacy selection, and automatic best-life fallback when the featured save is removed.

### Changed

- The former `Past Lives` meta tab is now `Life Saves`.
- Creating a custom or random independent life allocates a separate save slot and preserves account-level settings.
- Switching saves flushes pending writes and saves the current life before loading the target slot.
- Imported JSON is installed as a new independent life save instead of silently overwriting an existing slot ID.
- Deleting the only remaining life save is blocked; create another life first so the runtime always retains one authoritative state.
- The Family Legacy card keeps its existing visual role but can feature any surviving generation, including an earlier completed generation when that life scores better than the current protagonist.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 57/57 regression cases pass.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 637,451, millionaire rate 40.5%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 840,742, millionaire rate 45.3%, zero anomalies and zero forced terminal deaths.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

Everthread is pre-release. Versions below are development milestones, not public release promises.

## 0.9.8 — 2026-09-04 — Relationship Trees & First Playable Minigames

### Added

- Relationship folders in the People tab: Player Family, Relatives, Friends & Social, Romantic History, School, and Work.
- Mobile relationship-tree view rooted on the player, with persisted NPC parent/child/partner edges and direct fallback edges only when a folder member would otherwise be disconnected.
- Known connection details in NPC sheets so parent, child, and partner links are visible outside the tree.
- Reusable full-screen minigame overlay with timing, sequence-memory, grid-memory, and decision challenge mechanics.
- Interactive minigame integration for acting auditions, professional-sports attempts, combat bouts, motorsport races, and prison escape.
- Character-skill accessibility resolution for minigames and license tests when the minigame preference is disabled.
- Regression coverage for folder classification, non-invented NPC graph edges, extended-family tree linkage, minigame outcome direction, and seeded accessibility resolution.

### Changed

- People search remains global, while the default People surface now prioritizes relationship folders over one long flat list.
- Minigame scores are bounded modifiers to existing simulation formulas; character skill, circumstances, and seeded RNG still resolve final outcomes.
- Timing challenges fall back to sequence-memory play when the device reports a reduced-motion preference.
- Career-screen job/program derivation is recalculated on each engine render instead of being memoized against mutable `GameState` identity.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 55/55 regression cases pass.
- React/TSX source passes a shimmed TypeScript UI compile in the dependency-limited workspace; the dependency-backed Vite production build remains the GitHub Actions deployment gate.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 637,451, millionaire rate 40.5%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 840,742, millionaire rate 45.3%, zero anomalies and zero forced terminal deaths.

## 0.9.7 — 2026-09-04 — Childhood Eligibility & Dependent Finances

### Added

- Explicit age eligibility for investment trading, travel, structured wellness, pet adoption, and collectible-market purchases at both engine and mobile-UI layers.
- Childhood wellness unlocks by activity: walking at 3, running at 5, martial arts/meditation at 6, intentional diet activity at 10, and gym at 13.
- Regression coverage for newborn investment/travel blocking, age-staged wellness unlocks, dependent-minor finance, and guardian-supported shortfalls.

### Changed

- Investment buying and selling now require age 18. Pet adoption unlocks at age 5, and collectible-market purchases at age 12.
- Independent vacations now require age 18. Family trips become available at age 5, require a living parent/stepparent/grandparent while under 18, and draw the trip cost from the guardian's simulated household wealth rather than the child's personal cash.
- Dependent minors no longer pay ordinary baseline living, lifestyle, child, pet, property, vehicle, or debt-service costs from personal cash. Taxes still apply to actual taxable teen income.
- Negative cash while under 18 is normalized through tracked guardian support instead of being converted into an unsecured personal loan.
- Student or other explicit liabilities can still exist in state, but ordinary annual debt payments do not begin while the player is a dependent minor.

### Fixed

- Newborn characters could buy and sell securities.
- Newborn characters could initiate vacations and family trips.
- Newborns could use gym/running/walking/meditation/diet/martial-arts actions before any age eligibility existed.
- Newborns could also initiate pet adoption and collectible-market purchases if starting household cash happened to be high enough.
- A dependent child could reach adulthood already carrying ordinary personal insolvency debt because year-end shortfall handling treated minors like independent adults.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 51/51 regression cases pass.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 637,451, millionaire rate 40.5%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 840,742, millionaire rate 45.3%, zero anomalies and zero forced terminal deaths.

## 0.9.6 — 2026-09-04 — Action Economy & Exploit Hardening

### Added

- Central persisted action ledger with data-defined per-age limits and multi-year cooldowns. A single action can claim multiple limits atomically, such as both a yearly application budget and a one-attempt-per-listing rule.
- Save schema v6 with v5→v6 migration. Existing annual career/family action markers are preserved in the new ledger so updating a save cannot refresh already-used attempts.
- Read-only action-gate queries for React so mobile buttons can disable when their meaningful yearly opportunity has been spent, while the engine remains the authoritative enforcement layer.
- Anti-reroll regression coverage for job applications, wellness/stat grinding, NPC interaction grinding, publicity income, business launches/products, property renovation, collectible hunting, action-ledger migration, and failed-outcome engine notifications.

### Changed

- Job applications are limited to five serious attempts per age and one attempt per exact listing; a failed interview consumes the attempt instead of allowing infinite RNG retries.
- Freelance work, school effort, enrollment, wellness, treatment, rehab, risky habits, meeting people, NPC interactions, relationship milestones, fame posts/opportunities, travel, licenses, crime/prison actions, pet care, collectible hunting, business founding/product launches, and major special-career actions now use explicit yearly opportunity budgets or cooldowns.
- Time-intensive special-career actions now model annual opportunity cost: training, auditions, music releases/tours, pro-contract attempts, fights, campaigns, political moves, royal duties, modeling work, races, films, criminal-organization work, and specialized-organization decisions are bounded at the simulation layer.
- Major property renovations now have a two-age cooldown and improve condition without creating guaranteed immediate net-worth arbitrage.
- Business founding is limited to one company per age and each business can complete one major product launch per age.
- Collectible hunting is limited to four major acquisitions per age and one attempt per exact collectible definition.
- Relationship marriage/reconciliation milestone counters now live in `RelationshipSystem`, not the UI-facing engine wrapper, so headless/system callers cannot bypass them.
- Acting lessons now check adult affordability before consuming the yearly training opportunity; already-represented actors and already-committed sports paths reject duplicate setup actions.
- GameEngine now emits/autosaves failed outcomes when RNG, deterministic IDs, or the action ledger changed. A rejection, loss, failed audition, failed crime, or other consumed attempt therefore persists instead of silently becoming rerollable after a render/save boundary.
- React external-store subscriptions now use a private engine revision snapshot instead of mutable `GameState` object identity, so engine emissions reliably trigger UI updates even without an unrelated local React state change.
- Career, education, People, Activities, Assets, pet, business, collectible, and special-career mobile controls visually disable when the central engine policy says their opportunity is exhausted.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 47/47 regression cases pass.
- All 66 TypeScript/TSX source files pass a TypeScript syntax/transpile parse; the dependency-backed React/Vite build remains a GitHub Actions deployment gate.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 655,640, millionaire rate 40.7%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 823,294, millionaire rate 44.5%, zero anomalies and zero forced terminal deaths.

## 0.9.5 — 2026-09-04 — First Mobile Playtest Hardening

### Added

- Save schema v5 with migration support for family-planning state and targeted repair of the pre-0.9.5 runaway salary exploit.
- One-year pregnancy state for biological parenting; successful conception resolves into birth after the next Age Up rather than creating a child instantly.
- Compact mobile money formatting for million, billion, trillion and quadrillion-scale values.
- Regression coverage for senior-career experience gates, annual career-action limits, pregnancy timing, v4 exploit-save repair and extreme mobile money formatting.

### Changed

- Higher-level standard jobs now require actual relevant industry experience before they appear as qualified listings.
- A successful new hire prevents another job start in the same age.
- `Work harder` and `Ask for raise` are each annual-focus actions and cannot be spammed repeatedly within one age.
- Standard-career salary growth and raises respect a role-market ceiling instead of compounding without bound.
- Sibling first names avoid duplicates while unused regional names are available.
- PWA navigation uses network-first loading with cached offline fallback; service-worker registration explicitly checks for updates.

### Fixed

- Players can no longer become level-six executives at age 18–20 with no relevant work history simply by passing a difficult interview.
- Repeated same-year raise requests can no longer turn ordinary salaries into trillion/quadrillion-scale compensation.
- Repeated same-year `Work harder` actions can no longer instantly max performance/stress.
- Repeated family taps can no longer generate many independent births in the same year.
- Existing v4 saves that clearly match the runaway-compensation exploit are repaired on load: salary and impossible role level are normalized and the identifiable exploit-year net cash windfall is reverted. Existing children are never deleted by migration.
- Extreme money values no longer overflow the Life, Career and Assets mobile cards.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 37/37 regression cases pass.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 651,017, millionaire rate 40.7%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 819,767, millionaire rate 44.6%, zero anomalies and zero forced terminal deaths.

## 0.9.4 — 2026-09-04 — Estate Threads & Economic Calibration

### Added

- Multi-heir estate settlement with normalized living beneficiary shares, non-mortgage debt settlement, proportional investment division, deterministic retained-asset allocation, and fairness-driven liquidation of indivisible assets when necessary.
- Offscreen sibling inheritance accounting so NPC heirs receive their share instead of the controlled descendant inheriting every retained asset.
- Player inheritance from wealthy NPC parents, including lifetime inheritance and inheritance-count tracking.
- Continued-descendant preservation for established standard careers, spouses/partners, children and deeper derived family relationships such as grandparents and grandchildren.
- Wealth-source diagnostics for cash, property equity, investments, businesses, vehicles, collectibles and debt.
- Investment diagnostics for lifetime contributions, withdrawals, held cost basis and held market gain.
- Three-generation continuation regression and exact wealth-source reconciliation regression.

### Changed

- Fictional security long-run drifts and market-regime central tendency were reduced to fit Everthread's bounded relative economy. Volatility, bubbles and crashes remain intentionally meaningful.
- Annual finance processing now includes modest after-tax-income-scaled discretionary lifestyle spending for ordinary recurring consumption not represented by explicit purchases.
- Underwater property equity is reported as negative equity instead of being hidden at zero in balance diagnostics.
- A deceased player's NPC record now preserves its own parent links, allowing the next protagonist to derive grandparents after a generation handoff.

### Fixed

- Selected descendants no longer receive 100% of retained investments, properties, businesses and collectibles while siblings divide only cash.
- Wealthy NPC parents no longer skip the player when distributing inheritance simply because the player is not stored inside the NPC map.
- Adult descendants no longer lose an existing standard career when control passes to them.
- Generation handoffs no longer flatten deeper supported family relationships out of the playable relationship view.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 32/32 regression cases pass.
- Three sequential generation handoffs preserve lineage and pass state invariants in regression.
- Neutral 1,000-life bulk run: median lifespan 82, median net worth 686,454, millionaire rate 41.1%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 853,976, millionaire rate 45.6%, zero anomalies and zero forced terminal deaths.
- On the same neutral seeds, average held investment gain fell from roughly 1.54M before market calibration to roughly 257k after calibration; average lifetime inheritance is roughly 133k, confirming inheritance was not the primary wealth distortion.

## 0.9.3 — 2026-09-04 — Deterministic Replay & Balance Policies

### Added

- Save-persisted state-scoped runtime ID generation keyed by the life seed and a monotonic `idCounter`.
- Save schema v4 with explicit v3→v4 migration for deterministic ID state.
- Legacy rewind snapshots are migrated before restoration, including the new ID counter.
- Exact-history replay regression: two independent 50-year runs with the same seed/actions must serialize identically, including generated IDs and NPC/event history.
- Runtime-ID uniqueness regression across long generated lives.
- Six independent simulation decision policies: neutral, conservative, reckless, social, family-focused, and career-focused.
- Mixed-policy population simulation separate from life aspiration profiles such as academic, creative, athletic, entrepreneurial, and criminal.
- Wealth percentile reporting at p10/p25/p75/p90/p99.

### Changed

- Replaced all 71 wall-clock runtime ID creation sites in simulation systems with deterministic state-scoped IDs.
- Neutral simulation job selection no longer sorts primarily by maximum salary; career-focused policy retains deliberate salary optimization while conservative policy favors lower stress/risk.
- Investment, property, education, relationship, wellness, event-choice, and family behavior now vary by simulation policy.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 27/27 regression cases pass.
- Replay-safe 1,000-life bulk run completes with zero anomalies and identical aggregate results to the pre-ID migration baseline.
- Neutral 1,000-life run: median lifespan 83, median net worth 865,919, millionaire rate 46.6%, marriage rate 52.2%, zero anomalies.
- Mixed-policy 1,000-life run: median lifespan 82, median net worth 1,094,138, millionaire rate 52.6%, marriage rate 54.5%, zero anomalies.

## 0.9.2 — 2026-09-04 — Living World & Delayed Consequences

### Added

- Autonomous close-family NPC career selection using real job IDs, promotion/loss/retirement progression, wealth drift, linked partners, marriage/divorce/widowhood, bounded child generation, and inheritance to living children.
- Family-tree derivation for autonomous births, including niece/nephew and grandchild relationships where applicable.
- Bidirectional NPC-partner invariant checks and repair; player romantic partners are excluded from autonomous matchmaking.
- Delayed-event context payloads that can retain a specific NPC target and original decision age across future years.
- Persistent-target text templating for delayed consequences (`{NPC_NAME}`, `{NPC_FIRST}`, `{ORIGIN_AGE}`).
- Five first-class delayed-consequence chains: romantic secrecy, family financial favors, ignored health warnings, workplace shortcuts, and broken confidences.
- Four regression checks covering delayed target fidelity, cancellation when a required relationship disappears, origin-age context, and consequence-chain wiring.

### Changed

- Random/forced target-aware events can bind a persistent romantic, family, or friend NPC before the decision is shown, so prose and effects refer to the same person.
- Timeline entries generated by targeted events retain the affected NPC ID.
- Delayed relationship effects now explicitly resolve against the saved payload target rather than selecting another living relationship.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 24/24 regression cases pass.
- 1,000-life bulk run completed with zero detected structural anomalies and zero forced terminal-age deaths.
- Current audited content count: 679 event definitions, including 199 relationship-focused and 83 work/career events.

## 0.9.1 — 2026-09-03 — Verification & Simulation Hardening

### Added

- Deterministic regression suite with 18 core/integration checks.
- Headless multi-life simulation harness with full and bulk modes.
- 1,000-life bulk validation path and aggregate reporting for lifespan, wealth, education, career, marriage, children, crime, convictions, fame and death causes.
- Executable content audit.
- `DEVELOPMENT.md`, `CONTENT.md`, and `CHANGELOG.md` project continuity files.
- Economy-state fields for last cost/wage/housing index movement.
- Insolvency pressure handling: annual cash shortfalls become structured unsecured debt; sustained hardship can trigger foreclosure and bankruptcy.
- Mortgage affordability underwriting and a five-year post-bankruptcy mortgage restriction.

### Changed

- Event selection now uses category-indexed routine pools plus a small exact-probability rare-event pass instead of evaluating/rolling all 670 definitions every year.
- Economy indices now model bounded relative conditions instead of unbounded century-long nominal inflation.
- Existing standard-career salaries follow wage-index movement so long-held jobs do not become economically frozen.
- Achievement evaluation no longer runs redundantly twice on ordinary no-event age-ups; progress lookup and metric evaluation are cached per pass.
- Bulk simulations may suppress achievement/challenge evaluation and truncate timeline history for performance; full mode remains the correctness reference.

### Fixed

- Adult player dating generation can no longer create a minor potential partner.
- Biological-child action now validates the minimum parenting age of both participants.
- Duplicate active spouses are repaired by state invariants.
- Descendant continuation no longer pays retained asset value again as full liquid inheritance.
- Mortgages on retained inherited properties now remain in the descendant's liabilities.
- Descendant relationship reconstruction preserves parents, siblings, partners/spouses and children instead of flattening most surviving NPCs into friends.
- Annual business owner distributions are not credited a second time in finance processing.
- Death timeline ordering and legacy simulated-year double-counting issues identified in the foundation pass remain corrected.
- Foreclosure equity now offsets a cash shortfall exactly once and preserves any excess residual cash rather than double-consuming proceeds.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 18/18 regression cases pass.
- 1,000-life bulk run completed with zero detected state anomalies and no forced terminal-age deaths.

### Known follow-up

- Simulation policy over-optimizes investments and job selection, so its millionaire/career distributions are not yet neutral balance targets.
- Vehicle repossession, richer creditworthiness, and voluntary bankruptcy UI remain incomplete; engine-level shortfall debt, foreclosure, bankruptcy and mortgage underwriting now function.
- Exact replay is not yet guaranteed because generated object IDs still include wall-clock time.

## 0.9.0 — 2026-09-03 — Foundation Build

- Established Everthread: Life Unwritten branding and mobile application shell.
- Added authoritative `GameState`, seeded RNG, systems architecture, Age Up loop and timeline.
- Added character generation, relationships/family, education, standard careers, finances, health, crime/legal/prison, investments, businesses, property, pets, travel, fame and special-career foundations.
- Added death summaries, completed lives, legacy state and descendant continuation.
- Added IndexedDB persistence, settings persistence, save migration through schema version 3, JSON import/export, autosave and rewind-enabled snapshots.
- Added achievements/challenges, settings/past-life/sandbox sheets, mobile bottom navigation, event/death sheets, theme/accessibility controls and PWA scaffolding.
- Added large original content databases for events, careers, health, crimes, properties, pets, countries, achievements and challenges.
