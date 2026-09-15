## New Life mobile-width overflow hotfix — CI Green Run #172 — 2026-09-15

### Fixed

- Fixed a player-reported New Life sheet overflow on narrow phones where the two-column identity rows could exceed the available viewport width and the sheet clipped the right edge. Root cause was CSS Grid intrinsic minimum sizing from form controls, not the sheet scroll container.
- Changed the affected two-column tracks to zero-minimum columns and allowed their child form controls/content to shrink within the assigned grid cells. The New Life identity copy also now stacks cleanly instead of forcing a wider row.
- Added `scripts/new-life-layout-regression.mjs` and registered it in the canonical `npm test` wall. The regression protects 360/390/412/430px mobile widths and enlarged text-scale conditions from horizontal overflow. No GameState, save, portrait, simulation, content, or schema authority changed. Save schema remains **17**.

### Certification

- GitHub Actions Run #172 (`35006276096`, job `104506709088`) certified expanded source `5cf52a39d79f0835c2d9682e21d40c9ace7498c1` from upload wrapper `a2ab156e54cc0a18e13354435a0d50ecb633eed1`. Net diff from synchronized baseline `704def1523d652ca9ca24660d86ff14565a88f60` is exactly **3 intended files**; workflow import reports 4 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. New Life responsive layout **8/8**; Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile/Inventory **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Integrated Long-Life **105/105**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **211 modules**. Lazy `characterArtPack` remains ~**971.11 kB / 69.18 kB gzip**; main JS ~**1,354.43 / 377.84 kB gzip**; CSS ~**87.30 / 16.11 kB gzip**. The established >700 kB chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `c33df60a9811907ae0dc8d4d58b1d8e6fd86aea7a7041d8f5e99db0d1b924d17`; dependency SHA-256 `3cb9249bb0e386b953e1561493692f23150e7be192108746b220da4824447783`; package-lock SHA-256 remains `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10410969204` (`9fc873a757e510e9883459eb13e3921343d096785064da4687272501c698868f`); Pages artifact `10411442227` (`7c8193b1e2ee60600efaa4293bd27af663fdbf0306f2f9ef22475d6658a009b8`); Pages deployment reported success.
- Post-Run-#172 Feedback Inbox sweep remains **5 total / 0 unresolved** with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` was successfully advanced to `5cf52a39d79f0835c2d9682e21d40c9ace7498c1` at `2026-09-15 18:17:43.686626+00`, reviewed count **5**.
- This is a narrow post-Character-Visual hotfix, **not Phase 11** and not a reopening of the Living World Program.

## Character Visual foundation — player creator + portrait renderer — CI Green Run #170 — 2026-09-15

### Added / changed

- Added the first certified **Everthread Character Visual** slice using Astra's original modular manwha-inspired art kit. The New Life silhouette is now tappable and opens a mobile-first creator; **Back** discards unsaved edits, **Save appearance** commits the draft, and the resulting portrait returns to New Life and follows the same authoritative appearance into existing Avatar/Profile presentation.
- Added a deterministic `CharacterVisualSystem` over the existing character appearance authority rather than a second avatar/person database. Existing physical traits remain authoritative; richer optional visual IDs are normalized deterministically for current-schema saves without gameplay RNG or runtime-ID consumption. Save schema remains **17**.
- Preserved seeded-life compatibility by retaining the historical appearance RNG draw positions and deriving richer cosmetic detail from a separate cosmetic seed. Customizing or normalizing portrait data does not reshuffle downstream gameplay state.
- Integrated Astra's **624 modular SVG components** into a single lazy-loaded runtime art pack instead of hundreds of asset requests. The renderer supports the six supplied age stages and shared palette/component IDs while keeping artwork presentation-only.
- Added creator-local collapsible option sections across **Face / Hair / Style / Extras**. Collapsed sections show the current selection summary and do not persist into GameState/saves.
- Added dedicated Character Visual regression coverage for deterministic generation, custom-draft isolation, save normalization/idempotence, valid art IDs, renderer/catalog contracts, and preservation of existing character state. No NPC reveal/family-resemblance authority is introduced in this slice.

### Certification

- GitHub Actions Run #170 (`35001748216`, job `104491526661`) certified expanded source `ef87fb8011b8ec9d6dc606c328db9b1c0882d942` from upload wrapper `a620ac8b0a97458d05e66e11ac578163fb231dd1`. Net source diff from synchronized baseline `2e94523a451454b94cbbee49179f0efbb62b0900` is exactly **15 intended source/test files**; workflow import reports 16 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile/Inventory **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **211 modules**. Lazy `characterArtPack` is ~**971.11 kB / 69.18 kB gzip**; main JS ~**1,354.43 / 377.85 kB gzip**; CSS ~**86.96 / 16.06 kB gzip**. The established >700 kB chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `072c290101bd8853dca4e3e16a6af7e8d9cdc4ecadb332747db4e66f0fe4be7f`; dependency SHA-256 `7890670ea96fa0ba70b95d7fd86ab72fcd2f96fece67cf48efa0d4512b30042b`; package-lock SHA-256 remains `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10409358703` (`cc14a60e8b90a825060b7176c623f1e7b805f2330e17b307157ee64ac6cf48c8`); Pages artifact `10408949701` (`4490a5915f52b189ce46e0f3bff5c1de42c1eb7931cd317555ccba55a0bb834e`); Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep remains **5 total / 0 unresolved**, with no report newer than `2026-09-15 06:47:52.761298+00`. The durable review-state checkpoint could not be advanced in this session because the database connector rejected the write, so the existing stored checkpoint must not be mistaken for an unseen-report condition.
- This is an approved post-closeout Character Visual feature slice, **not Phase 11** and not a reopening of the Living World Program.

## Post-Phase-10 UI iconography + theme reactivity polish — CI Green Run #168 — 2026-09-15

### Added / changed

- Integrated the Mavyy-approved Astra UI-kit icon language as a **presentation-only** layer over Everthread's existing authorities. Canonical town-place IDs now resolve to the new Everthread pictograms; primary/contextual navigation and selected shared controls use the same local vector library without changing routing, eligibility, discovery, or simulation ownership.
- Fixed the player-facing Appearance reactivity defect identified during the Astra audit. Everthread intentionally permits in-place `GameState.settings` mutation, so the root visual-sync effect now depends on a deterministic scalar visual-settings signature instead of the settings-object identity. Theme/accent/font/text-scale/text-color/high-contrast/reduced-motion changes therefore invalidate presentation correctly without changing GameState architecture or save semantics.
- Extended the established Action VFX projection rather than creating a second effect authority. Existing action snapshots can now derive bounded semantic feedback for money, health, knowledge, stress, relationship, year-advance, gift, milestone, and known blocked-state cues while preserving existing career-specific VFX and engine result semantics.
- Added shared `EverthreadIcon` / icon-path presentation helpers plus dedicated UI iconography regression coverage. No new GameState field, route table, effect bus, content definition, gameplay RNG consumer, package dependency, workflow, or save migration was introduced.
- Save schema remains **17** and authored gameplay/content counts remain **691 events / 25 town places / 29 routed institution services / 24 personal inventory items / 38 NPC preference tags**.

### Certification

- GitHub Actions Run #168 (`34973140255`, job `104394090082`) certified expanded source `f68ffacf47c1fd208f836666fca3b1010a517c85` from upload wrapper `3cf72e36ed002880391e1a683cb846171e364423`. Net source diff from synchronized baseline `5e4f226341a5d28f1c70e67bf5dc72ece358a44f` is exactly **25 intended presentation/integration/test files**; workflow import reports 26 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. UI iconography & theme reactivity **183/183**; Action VFX **58/58**; base **82/82**; Visual Identity **12/12**; People **57/57**; AI **82/82**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; Phase 8E **34/34**; Phase 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E UX **20/20**; 10E **103/103**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed with Vite 7.3.6 at **206 modules**. Town Map is ~9.77 kB / 3.59 kB gzip JS plus ~12.64 kB / 2.65 kB gzip CSS; People ~41.18 / 12.12; Player Profile ~10.29 / 2.98; main ~1,277.82 / 362.39. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `a76e2eb38cb9aa10f67ce8a0f5f5948fe94fc64d638edabeca8e9059a6387ae5`; dependency SHA-256 `b61b136d41557e6422fdb85983fadd6c93fa97dcc6b395df7f620a52bb4352f9`; package-lock SHA-256 remains `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact ID `10398407272`, digest `2683be9ae642bb99d04ff0a7f7e767b6ea3389557eab1cd5e603b898787a0a6e`; Pages artifact ID `10397848707`, digest `5fb24e99f02db634a292aab8a2018b0fcd337ce1f2342aa98f4a68baa546331f`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep remains **5 total / 0 unresolved**. Review checkpoint `main` now points to `f68ffacf47c1fd208f836666fca3b1010a517c85` at `2026-09-15 13:10:53.355932+00` with reviewed-report count 5.
- This is a **post-closeout player-facing polish slice**, not Phase 11 and not a reopening of the certified Living World Program.

## Phase 10E — Program Closeout + final Map-memory feedback polish — CI Green Runs #165–#166 — 2026-09-15

### Added / changed

- **Run #165** certified Phase 10E as an integration-only closeout: one dedicated regression plus runner registration, with no production gameplay authority or save-schema change. The closeout proves the Living Everthread stack across multi-generation continuation, save/import/migration/rewind, estate/accounting integrity, Map ↔ Threadspace ↔ Player Profile identity/navigation, action-access parity, 360/390/412/430px map behavior, deterministic read-only projections, and bounded stress.
- Phase 10E's certified closeout suite initially passed **91/91**. It exercises two sequential descendant handoffs, inherited home/company provenance, archived place memory, temporary external travel without residence displacement, 180-person Threadspace pressure, 60 properties, 60 businesses, and 240 candidate place milestones while preserving existing owners.
- The post-Run-#165 Feedback Inbox sweep found new report `ET-20260915-86A6BA86`, requesting that a Map place expose meaningful life events that occurred there. Mavyy approved the request before final documentation closeout.
- **Run #166** certifies the resulting narrow Map-memory polish. Existing place sheets now expose a bounded **Memories here** section sourced from the already-authoritative Generational Place Memory projection, including remembered event text and current/prior-generation age/year context when available. Routine importance-1 entries remain excluded; inherited family-home/business landmark meaning remains **Family legacy** rather than being misrepresented as a timeline event; hidden-place discovery remains authoritative.
- The Map remains presentation/projection only. Browsing these memories is read-only, deterministic, gameplay-RNG neutral, runtime-ID neutral, save-neutral, rewind-safe, and bounded. No second timeline, memory ledger, place-history authority, or durable Map state was introduced.
- Save schema remains **17**. Authored content counts remain **691 events / 25 town places / 29 routed institution services / 24 personal inventory items / 38 NPC preference tags**.

### Certification

- GitHub Actions Run #165 (`34939954283`) certified expanded source `241276179e91df50796403376143b9404bf13ec4` from upload wrapper `2c8dd8c39e8b8266f954d6549f9ebc61a28ac806`. Net gameplay diff from synchronized source `f93ac870c2c7c9caafd510494c9c1696e749aa53` is exactly **2 files**: one added Phase 10E regression plus its runner registration. Canonical preflight passed **4/4**, Phase 10E **91/91**, Integrated Long-Life **105/105**, and the complete regression wall/build/deploy remained Green.
- Run #165 certified source SHA-256 `8917234a26f41dc9dfa52904969f5679d1509a41da1719847e38534d39ed3f16`; dependency SHA-256 `bc52cfc870ee9ef0071a694a9a69434eb8bec7285c3c4f7a9b4ebd1817c89913`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified preflight artifact ID `10384976427`, digest `dc7dd3a017a686fd8c38cb4a90c7dc8c578a19ce6be7071459ee373458cefc76`; Pages artifact ID `10385350315`, digest `3ec537abb04e6770b9803e231d8a5bda93ff38bcc4de01208f84482606454cbe`.
- GitHub Actions Run #166 (`34941015941`) certified final Phase-10 gameplay source `7523f6919ad808f7d826c42cd471d61e1f4f4678` from upload wrapper `97b06be342eecfcd2d0fd23cfb0f3cd6d2baa061`. Net diff from Run #165 is exactly **5 intended Map/projection/test files**; workflow import reports 6 changed files only because it removes `everthread-source.zip`. No package, lockfile, workflow, content registry, asset, documentation, GameState schema, or save-version drift is part of the gameplay diff.
- Run #166 canonical preflight passed **4/4**; Phase 10E **103/103**; base **82/82**; People **57/57**; AI **82/82**; Estate Administration **63/63**; Rewind **16/16**; NPC Asset Ownership **82/82**; Family Topology **40/40**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 8B **46/46**; Routing **42/42**; Phase 8E **34/34**; Phase 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E UX **20/20**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Run #166 production build passed with Vite 7.3.6 at **203 modules**. Town Map is ~9.58 kB / 3.52 kB gzip JS plus ~12.25 kB / 2.59 kB gzip CSS; Player Profile ~10.29 / 2.98; People ~41.15 / 12.11; main ~1,270.14 / 358.72. The established >700 kB warning remains nonblocking technical debt.
- Run #166 certified source SHA-256 `881e1167d5fa0234f90a454ac3568d4c596c7e738f35b36c7850646d73e277b8`; dependency SHA-256 `34c67ece879908cb137cb8ef569cabe06010ff6a7a2afb3acf485a8ce971e4df`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact ID `10385013113`, digest `b417362907b8b8534ebb89f62e08dd0e07ccbcc947cace8c28486a05bee92a3a`; Pages artifact ID `10384973333`, digest `caca1bcdf7f4ade6940a27e61b4577432308cacc826d584c0a09a86bfe5f7e3b`; Pages deployment reported success.
- The final post-certification Feedback Inbox sweep is **5 total / 0 unresolved**. `ET-20260915-86A6BA86` is resolved as a deployed suggestion against Run #166, and review checkpoint `main` now points to `7523f6919ad808f7d826c42cd471d61e1f4f4678` at `2026-09-15 07:20:42.854732+00` with reviewed-report count 5.
- **Phase 10E is CLOSED / CERTIFIED. Phase 10 — Living Everthread is CLOSED / CERTIFIED. No Phase 11 or replacement macro phase is implied by this closeout; the next major direction remains Mavyy's creative decision.**

## Pre-Phase 10E player-tested corrections — CI Green Runs #162–#163 — 2026-09-15

### Added / changed

- **Run #162** certified the player-reported mobile/map UX correction before 10E: shared location sheets now keep their header/close control fixed while the body owns native vertical touch scrolling above the bottom navigation; the permanent bottom shell is trimmed to **Life / People / Map**, with **Activities / Career / Assets** appearing only as the single contextual fourth destination when entered from a routed Map place.
- Added **Threadtone Music Studio** in Eastworks as the authored physical doorway into the existing Music special-career authority. No music progression/state was duplicated; institution routing now resolves the studio into the established Music path. This raises the authored town registry **24 → 25 places** and routed institution services **28 → 29**.
- **Run #163** certified the deeper world-rule correction exposed by Airport playtesting: **Everthread is the only permanent player residence**. Vacation and family-trip destinations remain temporary travel/history and do not rewrite canonical residence or household location.
- The old engine-level emigration action is retained only as a compatibility guard and now fails without state mutation. Current-schema legacy saves that already contain an emigrated protagonist are deterministically, idempotently, RNG/runtime-ID-neutrally normalized back to Everthread while preserving historical travel, naming/cultural provenance, assets, companies, timeline, and other durable biography.
- Airport/Activities copy now presents **Travel**, not emigration. Everthread itself is not offered as a fake travel destination. Direct player-side validation after Run #163 confirmed the corrected Airport flow behaves as intended.
- Achievement/content wording that depended on emigration was reconciled without changing achievement count. Save schema remains **17**; no parallel residence/travel authority was introduced.

### Certification

- GitHub Actions Run #162 (`34936352466`) certified expanded source `5834f9fc6de6327797c969542eb3fdcd07b4e13b` from upload wrapper `3c117cd69a4af99557e8c40e12a80b58ecb9737b`. Canonical preflight passed **4/4**; Pre-Phase 10E player-UX regression **11/11**; Music **76/76**; Town Map **46/46**; Institution Routing **42/42**; Phase 8E **34/34**; AI **82/82**; Integrated Long-Life **105/105**; Phase 10D **50/50**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**. Production build passed at **203 modules** and Pages deployment succeeded.
- Run #162 certified source SHA-256 `d130b6e0489e40a1c0ae135ddcb41ac9465fb4983a0b077055404aabeaed25ea`; dependency SHA-256 `058789598c5310b7c1083102a09cdcf12ff82a74be50992fc62f41d045d4104d`; certified preflight artifact ID `10383940053`, digest `8ad74cb551785f78d344722257e5ad1a44048f4e74072fa614003f620f0c3529`; Pages artifact ID `10383481967`, digest `2782fa42049bbe65a46865c0d83e429cac7437fce4f5d9abdefe284bc9902e2e`.
- GitHub Actions Run #163 (`34937808322`) certified expanded source `ab40d66808e0950f041a72681d573401926de8c0` from upload wrapper `6dab74794cf7f0af3cc7ebcdb12a0a95693eba5e`. Net diff from prior certified gameplay `5834f9fc6de6327797c969542eb3fdcd07b4e13b` is exactly **18 intended source/test files**; workflow import reports 19 changed files only because it removes `everthread-source.zip`. No documentation, package, lockfile, workflow, asset, or save-schema drift is part of the gameplay diff.
- Run #163 canonical preflight passed **4/4**; Pre-Phase 10E player-UX regression **20/20**; base **82/82**; Music **76/76**; AI **82/82**; Integrated Long-Life **105/105**; Phase 7C **42/42**; Phase 8A **25/25**; Town Map **46/46**; Institution Routing **42/42**; Phase 8E **34/34**; Phase 9B **53/53**; Phase 10B **50/50**; Phase 10D **50/50**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**. Production build passed with Vite 7.3.6 at **203 modules**; Pages deployment succeeded.
- Run #163 certified source SHA-256 `f8d7d6b59f13ec032d3fde5e031bb38ca3bf1947990e4e30a23bd16775b3257f`; dependency SHA-256 `4572bc66299fc92c2f067fe443fabd0c61c80d67b288be2ba103212e34393eeb`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified preflight artifact ID `10384556377`, digest `ff9ed03979076ea931b174c5383adde3c2e1ca1e76ba863c4b143beb6705bb88`; Pages artifact ID `10384640209`, digest `3a9a6e2d6e067a6d8a1db56ca2a644762a7311066d776cea148ccfcf53dcff8f`.
- Fresh post-Run-#163 Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the review checkpoint to `ab40d66808e0950f041a72681d573401926de8c0` at `2026-09-15 06:46:01.03675+00` with reviewed-report count 4.
- **The pre-10E correction gate is CLOSED / CERTIFIED and player-validated. Its historical next slice was Phase 10E — Program Closeout, now certified/closed in Runs #165–#166.**

## Phase 10D — Living Map Projection — CI Green Run #160 — 2026-09-15

### Added / changed

- Added one read-only **Living Map** projection that composes existing Residential Life, Working Everthread, Generational Place Memory, owned-property, and child-education truth onto the established 24-place Everthread Map. It creates no second residence, workplace, school, business, property, family-memory, or map-state authority.
- Exact authoritative anchors remain exact place context: **You live here**, **Property owned**, **Current school**, **You work here**, **Your company**, **Your child attends here**, and **Family legacy / Life memory**. Work/company context that is only known to district precision remains a district context instead of inventing a building.
- Context merging is deterministic and bounded to **6 contexts per place/district target** and **32 total contexts**. Repeated contexts aggregate source IDs/counts instead of spawning duplicate markers. External/emigrated work, school, companies, children, and places receive no synthetic Everthread pin.
- The existing map remains the only marker/navigation surface. Exact-place context adds a subtle marker treatment/count and a **Your life here** section to the existing place sheet; district-only context uses lightweight noninteractive labels. The Explore panel adds **Your life on the map**, an ephemeral local UI toggle that is never written to `GameState` or saves.
- Existing Town Map pan/zoom/search/category filtering, viewport culling, place discovery, routing, lazy loading, and mobile controls remain intact. Blackline Freight Yard discovery still derives from existing legal/organized-crime truth; 10D does not reveal hidden places by virtue of having life context.
- Save schema remains **17**. Projection/browsing is read-only, gameplay-RNG neutral, runtime-ID neutral, rewind-neutral, and descendant-safe because it reads the already-authoritative state of the current protagonist/thread.
- Fresh certified-source content audit remains unchanged at **691 events**, **306 career positions across 51 six-step ladders**, **51 education programs**, **24 town places**, **28 routed institution services**, **24 personal inventory items**, **38 NPC preference tags**, **20 business industries / 80 products**, and **40 collectibles**.

### Certification

- GitHub Actions Run #160 (`34933437352`) certified expanded source `8ce87ad1e812ed94a9918684b3b52452826f0ce9` from upload wrapper `321c92ce7ff4cb3ef96df7e10f523a6c5496b795`. Net diff from synchronized repository baseline `8cbc3e209aa2f8982289d0649f2686cd936cf045` is exactly **7 intended Phase 10D source/test/UI files** (**3 added, 4 modified**); workflow import reports 8 changed files only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the gameplay diff.
- Canonical preflight PASS **4/4**; Phase 10D **50/50**; base **82/82**; People **57/57**; AI Interaction Testbench **82/82**; Town Map **46/46**; Institution Routing **41/41**; Phase 8E **34/34**; Phase 10A **69/69**; Phase 10B **50/50**; Phase 10C **50/50**; Rewind **16/16**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 9A–9G remained Green; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build PASS with Vite 7.3.6 at **203 modules**. Town Map is ~8.92 kB / 3.32 kB gzip JS plus ~11.25 kB / 2.46 kB gzip CSS; People ~41.15 kB / 12.11 kB gzip; Player Profile ~10.29 kB / 2.97 kB gzip; main JS ~1,270.49 kB / 358.71 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `d9ffad5a5b7edbdd898a7726eb3c4616b706eddecd0ecc6bc69820aa2073686d`; dependency SHA-256 `d9509533484e7c6a7cf2f824fbbd69bbe0c320d9b9c131b4df4f6bc6251444bd`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10382985407`, digest `35d4493836c5befd621f31117b8fbae225bb5d7abe65879455c55ef7f20b1fac`; Pages artifact ID `10382109382`, digest `9d8e8a62cda11a198b43442eda4d53b54f0deff87e2cc8b41b2237e156c655bb`; Pages deployment reported success.
- Pre-upload local canonical-wrapper completion was constrained by the development container's outer execution ceiling and therefore was not treated as certification. The connected 10D risk wall, typechecks, content audit, overlay verification, and production build were independently Green; canonical GitHub Run #160 is the final certification authority.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `8ce87ad1e812ed94a9918684b3b52452826f0ce9` at `2026-09-15 05:38:31.538933+00` with reviewed-report count 4.
- **Phase 10D is CLOSED / CERTIFIED. Its historical next slice was Phase 10E — Program Closeout, now certified/closed in Runs #165–#166.**

## Phase 10C — Generational Place Memory — CI Green Run #158 — 2026-09-15

### Added / changed

- Added one read-only **Generational Place Memory** projection over existing Timeline, CompletedLife, Property, Business, Estate/Dynasty, Working Everthread, and Town Place truth. It creates no second place-history, family-landmark, property, business, event, or memory authority.
- `TimelineEntry` may now carry an optional canonical Everthread `placeId` for meaningful importance-2/3 milestones. Significant relationship outings, property/business ownership transitions, school/work exits, inheritance release/continuation, and other already-authoritative milestones can preserve where they happened without logging routine visits.
- Completed lives keep an optional bounded `placeMilestones` snapshot derived from their authoritative timeline at death. Old schema-17 lives without the snapshot derive it read-only from their existing timeline; present-but-invalid snapshots sanitize to empty instead of fabricating fallback history. Save schema remains **17**.
- Existing property provenance remains the family-home authority. Existing Business records now own optional founded/inherited provenance plus the exact predecessor ID; inherited companies retain their Working Everthread physical base across NPC/player estate conversion. No shadow family-business ledger exists.
- The projection prioritizes surviving inherited family homes/businesses, then current-life and prior-generation milestones. It is bounded to **24 total memories**, **8 places**, **6 memories per place**, **12 place milestones per completed life**, and the most recent **12 completed lives**. Browsing is deterministic, RNG/runtime-ID neutral, and read-only.
- Player Profile now surfaces a compact **Places that remember your thread** projection. Assets identifies inherited surviving companies as family businesses. Phase 10D still owns Map highlighting/pins; 10C deliberately does not turn the map into a second state owner.
- Fresh certified-source content audit remains **691 events**, **306 career positions across 51 six-step ladders**, **51 education programs**, **24 town places**, **28 routed institution services**, **24 personal inventory items**, **38 NPC preference tags**, **20 business industries / 80 products**, and **40 collectibles**.

### Certification

- GitHub Actions Run #158 (`34931959983`) certified expanded source `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790` from upload wrapper `9c4626ce19b4197609019bbcfde15b1ad2bbb8f0`. Net diff from synchronized repository baseline `0cd6ecfef5ded8256c22d7246f852b1c15728c68` is exactly **19 intended Phase 10C source/test/UI files** (**3 added, 16 modified**); workflow import reports 20 files only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the gameplay diff.
- Canonical preflight PASS **4/4**; Phase 10C **50/50**; base **82/82**; People **57/57**; AI Interaction Testbench **82/82**; Phase 10A **69/69**; Phase 10B **50/50**; Rewind **16/16**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 9A–9G remained Green; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build PASS with Vite 7.3.6 at **202 modules**. People remains ~41.15 kB / 12.10 kB gzip; Player Profile is ~10.29 kB / 2.97 kB gzip; Town Map remains ~6.97 kB / 2.82 kB gzip; main JS is ~1,265.72 kB / 357.31 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `566b8e47ce302afc45653dc7c9efd6ad677957761f433a35373cbdec97708cad`; dependency SHA-256 `9dca2d20b81675b5e3f4de775a4f70869edbd527b9d93c5fe7891b17b93bbeb6`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10381209515`, digest `ddec7d0513401516b45c956218404d9d690f1558f63e087b631b8f1e66bb76ae`; Pages artifact ID `10380859910`, digest `e21ed363a9c293e0574a02cf73b668ab128f467a690711e38ab3e7e374a0990d`; Pages deployment reported success.
- Pre-upload local canonical/deep wrappers were constrained by the development container's outer execution ceilings, so they were **not** treated as certification. Constituent typecheck/regression/build gates were independently Green and a matched baseline-vs-candidate 10-life control showed no performance regression; GitHub canonical Run #158 is the authoritative certification.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790` at `2026-09-15 05:17:22.77373+00` with reviewed-report count 4.
- **Phase 10C is CLOSED / CERTIFIED. Exact next slice after this mandatory documentation sync certifies: Phase 10D — Living Map Projection.**

## Phase 10B — Working Everthread — CI Green Run #156 — 2026-09-14

### Added / changed

- Added one **Working Everthread** projection layer over existing SchoolWorld, Workplace/SocialWorld, Business, Town Place, and character/NPC location truth. It creates no second workplace, school, employment, business, institution, revenue, bankruptcy, or relationship authority.
- Current school institutions project to the existing Everthread School / Everthread College anchors when the authoritative active school world is local. Active full-time and part-time workplace worlds project deterministically into existing town districts and, where a real landmark exists, an existing place anchor; external school/work worlds remain external and receive no fictional Everthread district.
- Player-founded businesses now preserve their physical base on the authoritative `Business` record with optional `countryId` / `city` provenance. NPC business holdings preserve the same provenance across estate conversion, so a company does not teleport when the player relocates or when ownership crosses generations.
- Added deterministic business/work district rules using the existing six-district / 24-place town registry. Market-facing work maps to Market Row, civic/finance/medical work to Central Weave, education/community work to Campus Green, transport/logistics work to South Belt, and remaining technology/industrial work to Eastworks; exact existing landmarks are reused where appropriate.
- Legacy player businesses missing location repair to the current protagonist location; legacy NPC businesses repair from the owning NPC. Repairs are deterministic, idempotent, RNG-neutral, and runtime-ID neutral.
- Career now shows projected current campus/workplace location context; Assets shows each company base. AI semantic observations expose the same production projections. Browsing/projection is read-only and does not consume gameplay RNG, runtime IDs, actions, or mutate certified 10A residence meaning.
- Save schema remains **17**. A fresh local content audit after certification still reports **691 events, 24 town places, 28 routed institution services, 24 personal inventory items, and 38 NPC preference tags**; Phase 10B adds mapping/projection rules rather than inflating authored content counts.

### Certification

- GitHub Actions Run #156 (`34927243187`) certified expanded source `a497aa1bbec357fe12755383acb7053ab5d0ea67` from upload wrapper `20b8359cb5bc306fbcb457a737027c56fb76fcc2`. Net diff from the prior synchronized repository source `2f29dfb7aaa17efdb35325383ed8d4fb4d84f390` is exactly **14 intended Phase 10B source/test/UI files** (4 added, 10 modified); workflow import reports 15 changed files only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 10B Working Everthread **50/50**; base **82/82**; People **57/57**; AI Interaction Testbench **78/78**; Phase 10A Residential Life **69/69**; Relationship Microcopy **69/69**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 9A–9G remained Green; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build PASS with Vite 7.3.6 at **201 modules**. People remains lazy/code-split at ~41.15 kB JS / 12.10 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; Town Map ~6.97 kB / 2.82 kB gzip; main JS ~1,259.21 kB / 355.87 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `eb3fb05357822c18bc52585de60c4dc6838eed1ff51e9f857adf3c883897d83a`; dependency SHA-256 `46ecae009f310c130b64ad1efa141d9755bdd793ff3682f0b61cba8daa186394`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10380297168`, digest `4dfc38542f7510b4d5dbddd33e11aadfdeec97ed32e4326ee9a09561f0daaa17`; Pages artifact ID `10380680116`, digest `8acb6ef7976cd0078f5ff5e2e26f186e5e26352399c6b82fd0e5aaa20021acd0`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `a497aa1bbec357fe12755383acb7053ab5d0ea67` at `2026-09-15 04:33:34.506272+00` with reviewed-report count 4.
- **Phase 10B is CLOSED / CERTIFIED. Exact next slice after this mandatory documentation sync certifies: Phase 10C — Generational Place Memory.**

## Phase 10A — Residential Life — CI Green Run #154 — 2026-09-14

### Added / changed

- Added one **Residential Life** projection/action layer over existing Property, NPC household/life, relationship, and location truth. No second property ledger, household graph, residence state, housing balance, or relationship outcome engine was introduced.
- Existing `PropertyAsset` / `NpcPropertyHolding` records now carry only metadata those property authorities legitimately own: optional primary-home designation plus purchase/inheritance provenance. Player/NPC residence and household meaning is projected read-only from those records and existing character/NPC city, family, partner, incarceration, and financial-independence truth.
- Added **5 residential plans**: Visit their home, Invite them home, Visit family at home, Cook together at home, and youth-bounded Sleepover. They reuse established Phase 9 shared-experience activities, preference evaluation, action economy, relationship/opinion/memory consequences, and Threadwell Residential place identity.
- Assets can mark an exact eligible owned property as **Home**; Player Profile projects the current residence; People projects the selected NPC's actual household/residence and residential visit choices. Player and AI semantic surfaces execute the same `GameEngine` actions.
- Inherited property retains exact provenance across NPC↔player estate conversion so family homes remain recognizable landmarks. A successor's existing home outranks newly inherited property; sale/foreclosure removes the property normally, rental clears its home role, and relocation clears remote NPC home designation without rewriting ownership/debt truth.
- Minor protagonists may own/inherit property but cannot designate or project an independent owned home; stale minor primary-home markers are repaired deterministically while ownership/provenance remains intact. Current player partners/fiancés/spouses without their own residence project the player's exact home as their shared household.
- Save schema remains **17**. Pre-upload local canonical standard preflight passed **4/4** and deep preflight passed **6/6**, including unchanged content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**.

### Certification

- GitHub Actions Run #154 (`34922633493`) certified expanded source `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` from upload wrapper `d04c958ed9085f22ba8f86878a1423cc93b7756d`. Net diff from the prior certified repository source is exactly **19 intended Phase 10A source/test/UI files** (4 added, 15 modified); workflow import reports 20 changed files only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 10A **69/69**; base **82/82**; People **57/57**; AI Interaction Testbench **72/72**; Relationship Microcopy **69/69**; Phase 9A **45/45**; 9B **53/53**; 9C **40/40**; 9D **61/61**; 9E **60/60**; 9F **43/43**; 9G **41/41**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **199 modules**. People remains lazy/code-split at ~41.15 kB JS / 12.11 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; main JS ~1,253.59 kB / 354.16 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `f5abf0879e5ad26013d5ce17fcceb70c07e6164ccf48d669ea7b3b4875250195`; dependency SHA-256 `6c6850bea55be7fa4649a6958f625515f02afa36f74ebe7dbfb514ad7f3279bb`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10377789622`, digest `2cc22e7d8105ee8e8bb4ad319dd438df0e50c600dd81d3c54d82482e851c1448`; Pages artifact ID `10378158427`, digest `6cdde002c03756e59505fba58cea16b33710ba3af99df5e0e4d04d0b865b3263`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` at `2026-09-15 02:51:23.125961+00` with reviewed-report count 4.
- **Phase 10A is CLOSED / CERTIFIED. Exact next slice after this mandatory documentation sync certifies: Phase 10B — Working Everthread.**

## Phase 9G — Shared Lives Closeout — CI Green Run #152 — 2026-09-14

### Added / changed

- Added the dedicated **Phase 9G Shared Lives closeout regression** at **41/41** and wired it into the canonical regression runner. The closeout is deliberately test-only: no production gameplay, UI, state schema, content catalog, package, workflow, or asset source changed.
- The integrated path drives one exact NPC through preference discovery, an ordinary shared experience, an exact owned-item gift, cross-world chemistry, real dating momentum, and the real Become Partners milestone while a decoy NPC verifies exact-target isolation.
- Closeout coverage proves save/load semantic preservation and normalized idempotence, deterministic cloned replay, rewind recovery, descendant-continuation boundaries, stale/dead target safety, same-year social action-budget contention, duplicate gift-instance handling, bounded memories/history, AI/player authority parity, and long-horizon compatibility across the complete Phase 9 stack.
- Pre-upload local **deep preflight passed 6/6**, including the unchanged content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**. Aggregate remained healthy at 79.3 average lifespan / 82 median, 63.0% married, 0.31 children per life, 77.3% millionaires, and bounded NPC population (125 average peak / 629 maximum).
- Save schema remains **17**. Phase 9G introduced no new simulation authority and no new durable state.

### Certification

- GitHub Actions Run #152 (`34916904879`) certified expanded source `14defab1761b1597bae584f9e0acc5d8bfe11483` from upload wrapper `025e321a64191077941d0909c995362c8222eda8`. Net diff from the prior certified repository source is exactly **2 intended test files** (1 added, 1 modified); workflow import reports 3 changed files only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9G **41/41**; base **82/82**; People **57/57**; AI Interaction Testbench **64/64**; Relationship Microcopy **69/69**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Phase 9E **60/60**; Phase 9F **43/43**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **197 modules**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS is ~1,240.49 kB / 350.95 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `34f7dad87faae68d011b1dfba584dba2ca9aea799fa3e191e4790d325a179752`; dependency SHA-256 `d031866fb287b9d2065156f7dea85d0a21f5105f06b76f3941ce600c14d59518`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10376107622`, digest `9828561e3171a15946581e721094278eb5410977598fadb99233049d9a2ce6d5`; Pages artifact ID `10376302016`, digest `9d02b2339c44003f26f7d5032a913bf120455c783983730b7fe0c560a3355031`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `14defab1761b1597bae584f9e0acc5d8bfe11483` at `2026-09-15 01:23:20.426476+00` with reviewed-report count 4.
- **Phase 9G is CLOSED / CERTIFIED. Phase 9 — Shared Lives is CLOSED. Exact next slice after this mandatory documentation sync certifies: Phase 10A — Residential Life.**

## Phase 9F — Cross-World Chemistry — CI Green Run #150 — 2026-09-14

### Added / changed

- Added one read-only `CrossWorldChemistrySystem` that projects contextual shared experiences from existing school, family/friend, workplace, and special-career memberships without creating a second relationship graph, chemistry score, affiliation ledger, or durable outing history.
- Added **22 contextual plans across 13 context families**. The exact active world the selected NPC genuinely shares with the player determines available plans; promoted classmates/coworkers retain context through their authoritative rosters, while professional rivals/opposition are excluded from friendly chemistry plans.
- Contextual outings commit through the existing Phase 9B shared-experience evaluator and `RelationshipSystem`, consume the same per-person social opportunity budget, reuse established places/activities/preferences, and write bounded exact-target NPC memories.
- School/work/career domain state is not directly mutated by 9F. Existing SchoolWorld, Workplace, and special-career owners continue deriving standing, morale/tension/performance, chemistry/support/cohesion, and related projections from the authoritative relationships they already own.
- People Threadspace and AI semantic interactions use the same production `crossWorldExperience` action. The AI music scenario proves the real relationship change is immediately visible to the existing career-world chemistry projection.
- Save schema remains **17**; no migration, package, workflow, asset, or content-catalog change was required.

### Certification

- GitHub Actions Run #150 (`34911249505`) certified expanded source `20b3026f577db86d821e82129b5c76fa09060413` from upload wrapper `40de88d080262ee062b58410def64a13c3eee0aa`. Net diff from the prior certified repository source is exactly **10 intended Phase 9F source/test/UI files**; workflow import reports 11 changes only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9F **43/43**; base **82/82**; People **57/57**; AI Interaction Testbench **64/64**; Relationship Microcopy **69/69**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Phase 9E **60/60**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; special-career world **77/77**; combat **51/51**; military **65/65**; politics **80/80**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **197 modules**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS is ~1,240.49 kB / 350.95 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `4df9280b04a99dc30ad25363f235c69fc71f147bc2000099280582d9634ee68e`; dependency SHA-256 `03680451a3a9add1209e03c646df5de6d82e1fd44f83426fe715838c1ca2041e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10373864256`, digest `57aabc641c42c8f34d0dc445207e73754708e5bc838b9aca71b3975251684a7d`; Pages artifact ID `10373799331`, digest `a02716ee961aa25819cece73d3e4f86e1e75e72dfbe28c108058e6c6f734c75c`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `20b3026f577db86d821e82129b5c76fa09060413` at `2026-09-15 00:01:27.362759+00`.
- **Phase 9F is CLOSED / CERTIFIED. Next slice:** Phase 9G — Phase 9 Closeout.

## Phase 9E — Real Gifts — CI Green Run #148 — 2026-09-14

### Added / changed

- Replaced the old generic `$150` relationship Gift interaction with an **exact owned-item gift flow**. The player chooses a concrete Phase 8D personal-inventory instance; successful commitment removes that exact instance once, while stale/dead/ineligible/failed attempts preserve ownership.
- Added `GiftSystem` as the gift-specific projection/evaluation layer without creating another inventory or relationship authority. Ordinary ownership/instance removal remains in `PersonalInventorySystem`; committed relationship score, hidden opinion, happiness, timeline, preference reveal, bounded NPC memory, action economy, and gameplay RNG remain owned by `RelationshipSystem`.
- Extracted the pure preference/relationship/wellbeing scoring core from the shared-experience evaluator so outings, dates, and gifts reuse one formula without pretending a gift occurred at a fake place. Existing Phase 9B shared-experience semantics remain formula-compatible.
- Exact item `preferenceTags` drive Gift Approval/reaction through the existing 38-tag Phase 9A vocabulary. The People profile exposes a mobile owned-item chooser and approval meter; valuable collectibles/assets remain outside ordinary gifting and with their existing Assets/Estate authorities.
- No broad durable NPC inventory was added. Meaningful committed gifts may create bounded NPC memories, but the transferred ordinary item is not duplicated into a shadow possession ledger.
- Rewind restores the exact item plus relationship/action/RNG consequences atomically; descendant continuation does not resurrect the previous protagonist's ordinary possessions. Duplicate copies remain distinct, and replaying a stale instance cannot transfer twice.
- Save schema remains **17**; the authored personal-item catalog remains **24** and the shared preference vocabulary remains **38 tags**.

### Certification

- GitHub Actions Run #148 (`34908361877`) certified expanded source `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` from upload wrapper `d2f4ee0f052387f6a91fec78210f0efc69b0b7ba`. Net diff from the prior certified repository source is exactly **14 intended Phase 9E source/test/UI files** (3 added, 11 modified); workflow import reports 15 changes only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9E **60/60**; AI testbench **58/58**; Relationship Microcopy **69/69**; base **82/82**; People **57/57**; Phase 8D **63/63**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **195 modules**. People remains lazy/code-split at ~37.88 kB JS / 11.69 kB gzip; main JS ~1,229.92 kB / 348.18 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `f7a6ae88c9b44736c8afbd5776a46a133403768eaf7b13293b13492958160597`; dependency SHA-256 `65d66454a8375d812706cabfc922065311439405e49542f5b71a2cccb863db87`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10372914569` (`3aba83994b203611a9c09d0f201b76a5c220bea35ff84c4d955b2cfe210b68d3`); Pages artifact `10373447865` (`5b1860077132ff8d3cfb947e77d12c44523604b388fe071f0885ef7a71fe2340`); Pages deployment reported success.
- Fresh Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` at `2026-09-14 23:22:00.588163+00`.
- **Phase 9E is CLOSED / CERTIFIED. Next slice:** Phase 9F — Cross-World Chemistry.

## Phase 9D — Dating & Romantic Momentum — CI Green Run #146 — 2026-09-14

### Added / changed

- Separated **Ask on Date** from **Become Partners**. Eligible exact NPCs can accept or reject an invitation; accepted plans persist until completed/cancelled, then the player chooses one of **8 authored date plans** that reuse existing Everthread places and the single shared-experience evaluator.
- Added bounded romance metadata to the existing Relationship record: pending invitation context plus at most **8** completed-date entries. Romantic momentum is derived from real date outcome bands rather than stored as a second score; roughly three genuinely strong dates unlock the partnership attempt, while poor dates can reduce momentum.
- Preserved established dating/commitment authority: age 14+, teen/adult separation, orientation compatibility, attraction/relationship context, exact-NPC targeting, existing-current-commitment exclusivity (including estranged living commitments), and the existing proposal/marriage/breakup/divorce/reconciliation/family-planning path.
- Pending dates remain visible/cancellable during temporary age incompatibility; invariant repair removes malformed or dead-target ghost pending plans. Read-only projections consume no gameplay RNG/runtime IDs.
- People Threadspace now provides the mobile date chooser, approval/prose result, pending-date recovery controls, and gated **Become Partners** action. AI testbench semantics execute the same production actions.
- Updated the synthetic long-life player to follow the real multi-date courtship contract rather than assuming the old one-click partnership flow; no simulation-only acceptance or momentum shortcut exists.
- Save schema remains **17**; no second romance score, relationship graph, date outcome engine, or memory ledger was added.

### Certification

- GitHub Actions Run #146 (`34905053500`) certified expanded source `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` from upload wrapper `aa6cd1fc69f4df9430a88baaa9331d5b279e556f`. Net diff from the prior certified repository source is exactly **21 intended Phase 9D source/test/UI files**; workflow import reports 22 changes only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9D **61/61**; AI testbench **52/52**; base **82/82**; People **57/57**; Relationship Microcopy **66/66**; Phase 9B **53/53**; Phase 9C **40/40**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Local deep preflight PASS **6/6** including content audit and a 1,000-life run with **0 anomalies / 0 forced terminal deaths**; marriage 63.0% and children 0.31/life after calibrating the simulation harness to use real date continuation rather than a legacy one-click courtship assumption.
- Production build PASS with Vite 7.3.6 at **194 modules**. People remains lazy/code-split at ~35.82 kB JS / 11.25 kB gzip; main JS ~1,225.97 kB / 347.09 kB gzip; established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `b2bc71aab5c827f50a8c7b9caab8ebace55b9c567ffd975803ecd99472106be5`; dependency SHA-256 `18baf98fbbf620280e6ef062e85cb695484bf7c03a6fde1df15ea01fa82d9be0`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10372681543` (`81a91416305ef0c3b293c7c1dd679319df4d4245ba5f43978f3b80c4e1f17c55`); Pages artifact `10372740361` (`20878aec96f98fcafb45535fbdf206a791f28bd4578583c4f594837240248610`); Pages deployment reported success.
- Fresh Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` at `2026-09-14 22:39:43.562077+00`.
- **Phase 9D is CLOSED / CERTIFIED. Next slice:** Phase 9E — Real Gifts.

# Everthread Changelog

## Phase 9C — Childhood & Youth Social Life — CI Green Run #144 — 2026-09-14

### Added / changed

- Added `YouthSocialSystem`, a read-only contextual planner over existing NPC, Relationship, SchoolWorld, town-place, and Phase 9B shared-experience truth. It does not create a youth-only relationship graph, school roster, experience ledger, memory store, or location authority.
- Added **11 curated age-aware youth plans** for ages 3–17: park playdates, home visits, sleepovers, arcade/game-shop outings, movies, real school socials, stadium days, cooking, mall/diner hangouts, and park walks. Friendly non-family peers are limited to a plausible ±3-year age band; siblings, half-siblings, step-siblings, and cousins remain valid through the existing family relationship taxonomy.
- Expanded the canonical shared-experience activity registry **10 → 12** with youth-bounded `sleepover` and `school_social`. School Social is projected only for a current real classmate in an active SchoolWorld; every other youth plan reuses a certified Phase 9B activity/place pair.
- Added a mobile **Spend time together** section to eligible People profiles. Plans age in/out rather than exposing future adult-sized option walls, unavailable plans preserve real shared-experience reasons, and successful outings show concise prose plus a bounded approval meter.
- Preserved the existing committed path: `GameEngine.shareExperience` → `RelationshipSystem` → `SharedExperienceSystem`. Successful youth outings reuse the established social action economy, exact-target timeline, single gameplay-RNG draw, preference reveal, and bounded NPC memory semantics. Browsing/planning remains read-only and RNG/runtime-ID neutral.
- Extended AI Interaction Testbench semantics so exact NPC/place/activity shared outings execute through the real engine action. No test-only gameplay implementation was added.
- Save schema remains **17**. Adult romance, attraction/orientation, commitment, school, family-planning, and family-topology authorities are unchanged.

### Certification

- GitHub Actions Run #144 (`34887219411`) certified expanded source `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` from upload wrapper `ef1d386c5baab2e964f2e8f00cabe8d4e6264ab7`. Net source diff from the prior certified repository source is exactly **12 intended Phase 9C source/test/UI files**; workflow import reports 13 changes only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, schema, or Phase 9D drift was introduced.
- Canonical preflight PASS **4/4**; Phase 9C **40/40**; base **82/82**; People Threadspace **57/57**; AI Interaction Testbench **45/45**; Relationship Microcopy **66/66**; Family Topology **40/40**; Dynasty **64/64**; Phase 9A **45/45**; Phase 9B **53/53**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **192 modules**. People remains lazy/code-split at ~33.49 kB JS / 10.82 kB gzip; main JS is ~1,217.14 kB / 344.75 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `a56dfebebee0aefd227dfbca71850dff591d62eef247064ed481cdb8f3bbe689`; dependency SHA-256 `a18b4bac9c33cffe3a798f023efcee7adb05ff5c0f973f6a4c36f9f5ceebe020`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10365740616`, digest `21efe389a43afb8950185182edc7ea2e5e2897b2f74aa4617499531f993fa5f7`; Pages artifact ID `10365790597`, digest `85d5a26d84d9e086180eaa15c2ea8a1212fee786ce53bd503e9bad49c4729082`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` at `2026-09-14 19:32:14.421886+00`.
- **Phase 9C is CLOSED / CERTIFIED. Next slice:** Phase 9D — Dating & Romantic Momentum.

## Phase 9B — Shared Experience Foundation — CI Green Run #141 — 2026-09-14

### Added / changed

- Added one reusable `SharedExperienceSystem` evaluation path over exact player + NPC + relationship + place + activity + preference/context inputs. It is deliberately pure/read-only: evaluation and option projection do not mutate `GameState`, consume gameplay RNG, allocate runtime IDs, or create a second relationship/memory/location authority.
- Added **10 authored age-aware shared-experience activities** across Weaver Park, Crossroads Mall, Nightjar Diner, Threadwell Residential, Pulseworks Gym, and Everthread Stadium. Activities reuse the existing 38-tag preference vocabulary and return concise coherent prose plus bounded **0–100 approval** / outcome-band semantics while hidden weights remain private.
- Preserved `RelationshipSystem` as the committed social-action authority. Shared experiences reuse the established per-NPC social action economy, consume exactly one gameplay-RNG variation only on a committed action, apply relationship score / hidden opinion / player happiness, write one exact-target timeline entry, reveal at most one relevant known preference, and create NPC memories only for meaningful rough/awful/great outcomes.
- Bounded relationship-authored NPC memories to 36 while preserving permanent records and recent nonpermanent history. Existing hook-up/ordinary-interaction memory writes now use the same bounded helper without changing their player-facing semantics.
- Added availability hardening for stale/dead NPC IDs, invalid or undiscovered place/activity pairs, remote participants, and age gating. Age-inappropriate preference tags cannot bias young-child shared experiences.
- No save migration or durable shared-experience ledger was added; save schema remains **17**. The evaluator accepts explicit preference/context overrides so Phase 9C youth social life, Phase 9D dates, Phase 9E inventory gifts, and Phase 9F cross-world chemistry can reuse the same foundation rather than fork scoring logic.

### Certification

- GitHub Actions Run #141 (`34880935501`) certified expanded source `f1be1e6bc39482cb613b85bbdad77ea5ca7e9298` from upload wrapper `c2beb60a91b1869993f83412fd63f084f26e0b98`. Net source diff from the prior certified repository source is exactly **7 intended Phase 9B source/test files**; workflow import reports 8 changes only because it removes `everthread-source.zip`. No docs, package, workflow, asset, schema, or Phase 9C drift was introduced.
- Canonical preflight PASS **4/4**; Phase 9B **53/53**; base **82/82**; Relationship Microcopy **66/66**; Phase 9A **45/45**; Integrated Long-Life **105/105**; minigames **19/19**; feedback suites **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **190 modules**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; main JS is ~1,216.41 kB / 344.59 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `495b4f0e1c47705e3f822ce86df46cb989412eec7f43cbde9307ebff2e0a8553`; dependency SHA-256 `7c80fdb1e14b0edf35dd2c29b67b1ee9a6ff5ed26e687cea52b5ea00297572d2`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10362674376`, digest `ba43c8f5039be7053dc38cf4dc0a99b5f40a25110a63e24ba0444971cdc5ad8b`; Pages artifact ID `10362614619`, digest `72fb456e5085132b2565ddf7727e82d7743ab24622b583edb6e1e2c39e00c9e7`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox read found **4 total / 0 unresolved by `triage_status`**, with no new report after `2026-09-13 19:51:36.119407+00`. Connector safety blocked the review-checkpoint write, so the stored checkpoint still points to Run #137; no false advance is claimed.
- **Phase 9B is CLOSED / CERTIFIED. Next slice:** Phase 9C — Childhood & Youth Social Life.

## Phase 9A — NPC Interests & Preferences — CI Green Run #139 — 2026-09-14

### Added / changed

- Opened **Phase 9 — Shared Lives** with one compact, persistent preference foundation for meaningful NPCs. Intrinsic tastes remain part of the existing NPC record; what the current protagonist has learned remains on the existing `Relationship` record. No second personality graph, relationship score, or social-memory authority was introduced.
- Added one shared **38-tag** preference vocabulary spanning gifts and future shared experiences. Each persistent profile is bounded to at most 4 likes, 3 dislikes, and 1 occasional aversion; traits bias generation without deterministically dictating identity. Neutral is derived rather than stored as another list.
- Preference generation is stable from existing game seed + NPC identity, uses an isolated deterministic RNG stream, and consumes no gameplay RNG counter or runtime IDs. Background NPCs remain lazy until they become protagonist-relevant; invariant/save repair normalizes only profiles that already exist.
- Player-specific preference knowledge is bounded separately to 8 tags, with passive discovery capped at 6 and age/relationship context limiting how quickly knowledge appears. Schema migration does **not** retroactively invent learned tastes on old relationship records.
- People profiles now expose only plausibly known interests with concise **Likes / Neutral / Dislikes / Avoids** labels. Browsing is read-only and never reveals raw hidden weights.
- Save schema advances **16 → 17**. Existing relationship targets receive stable intrinsic profiles during migration, while relationship knowledge remains untouched until normal play reveals it. Rewind, dynasty continuation, malformed-save repair, and long-life behavior remain covered.

### Certification

- GitHub Actions Run #139 (`34870897923`) certified expanded source `f8ddfe5db0995dceb07969765b34b78f18740e01` from upload wrapper `8245a89f919086fcebc82e12880282076a13e5ef`. Net diff from the prior certified repository source is exactly **38 intended Phase 9A source/test files**; workflow import reports 39 changes only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, or Phase 9B drift was introduced.
- Canonical preflight PASS **4/4**; base regression **82/82**; People Threadspace **57/57**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 8A **25/25**; Phase 8D **63/63**; Phase 8E **34/34**; Threadspace Load Recovery **10/10**; new Phase 9A **45/45**; minigames **19/19**; feedback suites **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **188 modules**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; Map and Player Profile remain independently lazy. Main JS is ~1,206.90 kB / 341.59 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `7ecc001e4c79f113e2f3ac52071fdd1c8d3256ea2eb7cd25720adb19c8cfaca7`; dependency SHA-256 `e3bc0b39f962260217d42104c0c8dd802b9f4ae6a46d47013205fab46f610e2e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10359137007`, digest `60ef75dd3105118723f0af12bcffa173d85c439e55c69c49edbc81f6a7614005`; Pages artifact ID `10359321568`, digest `e0234fa05dc501106535fc9694644150181c9203bc48d00fabbeb1734bfb3e1d`; Pages deployment reported success.
- Post-certification feedback read attempts were blocked by the connector safety layer, so no new inbox result or checkpoint advance is claimed. The last successfully reviewed state remains **4 total / 0 unresolved by `triage_status`** with checkpoint `e1aa213fac4e03ab9a4af3039d9605852289b899`.
- **Phase 9A is CLOSED / CERTIFIED. Next slice:** Phase 9B — Shared Experience Foundation.

## Phase 8E — Phase 8 Closeout — CI Green Run #137 — 2026-09-14

### Closed / verified

- Formally closed **Phase 8 — Everthread: Home** after proving access parity, migration/rewind/dynasty safety, deterministic browsing, mobile touch accessibility, and bounded integration behavior across the existing Phase 8 stack.
- Added one centralized primary/Assets navigation contract so the six primary tabs and all six established Assets sections are directly regression-testable. The legacy Assets owner remains directly reachable; no mature entry point was retired merely because Map/Profile routing exists.
- Raised the remaining People/Map secondary controls to the established **44px minimum touch target** on the supported mobile widths. No gameplay authority, save state, content count, RNG behavior, or runtime-ID behavior changed. Save schema remains **16**.
- Added dedicated **Phase 8E Closeout** regression coverage at **34/34** for primary/Assets reachability, all 28 institution doorways, canonical Assets action families, read-only browsing purity, schema-14→16 migration determinism/idempotency, emigration safety, underworld visibility projection, and 360/390/412/430px map-camera behavior.
- Preserved the post-8D lazy-screen recovery boundary. Mavyy also confirmed on the real player-facing Android path that People Threadspace and Map load correctly again after the Run #135 hotfix.

### Certification

- GitHub Actions Run #137 (`34859549989`) certified expanded source `e1aa213fac4e03ab9a4af3039d9605852289b899` from upload wrapper `ca6e726ce31896593d0de825e1614ce5e5ca5418`. Net diff from the prior certified repository source is exactly **7 intended Phase 8E source/test files**; workflow import reports 8 changes only because it removes `everthread-source.zip`. No docs, schema, package, content, workflow, or Phase 9 drift was introduced.
- Canonical preflight PASS **4/4**; base regression **82/82**; People Threadspace **57/57**; Phase 8B Map **46/46**; Phase 8C Routing **41/41**; Phase 8D **63/63**; Threadspace Load Recovery **10/10**; new Phase 8E **34/34**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback suites **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **186 modules**. Map, People, and Player Profile remain independently lazy/code-split. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `a9fcef3b305afd578e7ac84e0f3428d5394e9b5c522bd010cce3329d8e7247f1`; dependency SHA-256 `a06a60a2ac51e42e9a21e01c9cf8f89828068df4890ec262f7c989e906e9d1a6`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10354132463`, digest `8c4d3f2e6c4b461150870e59b0a8290be66763897992fb5a0a10a3f49bef1a03`; Pages artifact ID `10354586748`, digest `08fb8de646d10252a474957d0890d598c28d7e6fa5fb0695679ed13c8d2682c8`; Pages deployment reported success.
- Post-certification feedback sweep found **4 total reports / 0 unresolved by triage status**, no new receipt after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `e1aa213fac4e03ab9a4af3039d9605852289b899` at `2026-09-14 15:07:04.320301+00`.
- **Phase 8 is CLOSED. Next slice:** Phase 9A — NPC Interests & Preferences.

## Critical Threadspace Lazy-Load Recovery Hotfix — CI Green Run #135 — 2026-09-14

### Fixed

- Fixed a production-critical failure where entering lazy **People Threadspace** or the **Everthread Map** could leave the player with a blank application surface after a stale/missing dynamic chunk failed to load. The Threadspace systems themselves were intact; the failure escaped through the React root because lazy screens lacked a containment boundary.
- Added `LazyScreenBoundary` plus `lazyScreenRecovery` so People, Map, and Player Profile receive one guarded automatic recovery attempt for recoverable dynamic-import failures. Recovery is loop-safe; if loading still fails, the error remains inside the affected screen and preserves the app header/bottom navigation with explicit **Reload Everthread** and **Return to Life** controls.
- Hardened the PWA update path: navigations and JavaScript/CSS code requests now fetch fresh rather than trusting stale cache-first shell entries, legacy shell cache state is purged on activation, and an installed replacement service worker triggers one controlled refresh. Lazy screens remain code-split.
- Added dedicated **Threadspace Load Recovery** regression coverage at **10/10** for recoverable error classification, one-shot reload guarding, guard reset, and non-recoverable containment. Save schema remains **16**; no `GameState`, relationship, map, finance, inventory, routing, RNG, or runtime-ID authority changed.

### Certification

- GitHub Actions Run #135 (`34856517423`) certified expanded source `39523787af658a6907cb82ba0e7b94d964fca82d` from upload wrapper `f454c437a3d1f99691caef0fb1a406666158baee`. Net diff from the prior certified repository source is exactly **7 intended hotfix source/test files**; workflow import reports 8 changes only because it removes the uploaded `everthread-source.zip`. No Phase 8E, documentation, package, or unrelated gameplay drift was introduced.
- Canonical preflight PASS **4/4**; base regression **82/82**; People Threadspace **57/57**; Phase 8B Map **46/46**; Phase 8D **63/63**; Threadspace Load Recovery **10/10**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **185 modules**. People and Map remain lazy/code-split; main JS is ~1,200.22 kB / 339.43 kB gzip and the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `e9f051d99257edd4c4266c1b4d44665630fff0a012ea9c8a04d5da2bd9971fbf`; dependency SHA-256 `ddfefb540b8d3931fdf83c45d98018e169a5360e2aac8835517f6cff36ff6fb7`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10352906274`, digest `512e12bbcfea517b8066d58410c4070bdd8e89b12b229b9c3fdaf63d4a23f98a`; Pages artifact ID `10352803571`, digest `6f7ce2742ab1b406cf86e030f4269ae70d1e9cecdefc696b0e7abf3963fcd84c`; Pages deployment reported success.
- Post-certification feedback sweep found **4 total reports / 0 unresolved** with no new receipt after `2026-09-13 19:51:36.119407+00`. The connector safety layer blocked the bookkeeping checkpoint write, so the last successfully stored checkpoint remains the Run #133 checkpoint rather than falsely claiming an advance.
- **Next slice remains:** Phase 8E — Phase 8 Closeout, after this hotfix documentation sync certifies.

## Phase 8D — Player Profile & Personal Inventory — CI Green Run #133 — 2026-09-14

### Added / changed

- Added one shared player-profile surface opened from the Life identity and the **YOU** node in People Threadspace. `PlayerProfileSystem` projects identity, generation, location, career, education, relationship context, traits/appearance, licenses, achievements, asset counts, personal items, and valuable collectibles from their existing authorities rather than copying those truths.
- Added a bounded **personal inventory** authority for ordinary non-financial possessions and future giftable items. Phase 8D ships **24 original personal-item definitions** across Crossroads Mall, Everthread Market, and Nightjar Diner. Browsing/eligibility projection consumes no gameplay RNG or runtime IDs; a successful purchase spends Cash exactly once and allocates exactly one item instance ID.
- Personal inventory is intentionally **not** a shadow asset ledger: ordinary items contribute no net-worth/resale value, while valuable collectibles remain solely in the established Assets/estate authority and are projected into the player profile exactly once. Discarding a personal item returns no cash.
- Added bounded invariant repair for malformed/duplicate/unknown inventory rows and a hard 80-item inventory cap. Shopping respects authoritative physical location, incarceration/death state, authored minimum ages, Cash, and centralized action-economy limits.
- Save schema advances **15 → 16**. Existing saves receive an empty personal inventory deterministically; migration is idempotent, gameplay-RNG neutral, and runtime-ID neutral. Rewind restores inventory and Cash atomically. Descendant continuation starts the successor with their own empty ordinary personal inventory while valuable collectible inheritance continues through the existing estate/asset authority.
- Phase 8C institution routing, the authored map, Threadspace relationship truth, finance/accounting, estate ownership, and all older contextual shortcuts remain intact.

### Certification

- GitHub Actions Run #133 (`34853113638`) certified expanded source `cf2ede37be5362bc02678a2cc4bec6defa38a837` from upload wrapper `b4fb020a999c38d32d7de0c8acaa408c4b04eb32`. The net committed gameplay diff from the prior docs baseline is exactly **44 intended source/test files**; workflow import reports 45 only because it removes the uploaded `everthread-source.zip`. No docs, package, workflow, or unrelated asset drift was introduced.
- Both TypeScript gates PASS; canonical preflight PASS **4/4**; base regression **82/82**; Phase 8A **25/25**; Phase 8B **46/46**; Phase 8C **41/41**; new Phase 8D profile/inventory regression **63/63**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **183 modules**. `PlayerProfileSheet` remains lazy/code-split at ~8.97 kB JS / 2.67 kB gzip plus ~3.82 kB CSS / 1.01 kB gzip. Main JS is ~1,198.18 kB / 338.73 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `79ee41e57885897f4a1efca5a2de8c51884dd975954de9289f8999fb2ffc835e`; dependency SHA-256 `d61b0fdec5af4e67b4dfb9f9b2adf39490aaad091b334635e18db7dd6e48069c`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10352225006`, digest `ddce4db099dca9a0bfca79eef5374dacaab25e1f8e9c5313847f2afc96575030`; Pages artifact ID `10351555391`, digest `3a98da45ddcc6069fa4966892c647713f86dc0eb9b9e18a0cd736b6ac1244914`; Pages deployment reported success.
- Post-certification feedback sweep found **4 total reports / 0 unresolved** with no new receipt after `2026-09-13 19:51:36.119407+00`; stored review checkpoint advanced to `cf2ede37be5362bc02678a2cc4bec6defa38a837` at `2026-09-14 14:06:03.077434+00`.
- **Next slice:** Phase 8E — Phase 8 Closeout.

## Phase 8C — Institution Routing — CI Green Run #131 — 2026-09-14

### Added / changed

- Added **28 meaningful institution service doorways** across the existing 24-place Everthread registry while leaving landmark-only places unrouted rather than inventing fake mechanics.
- Added centralized `institutionRouting.ts` projection from place services into the mature **Life, Assets, Activities, and Career** owner screens. The map performs navigation only; it does not execute gameplay actions or own results.
- Routed Central Everthread Bank to existing money/credit/payments/investments, Loomline Motors to vehicle marketplace/ownership, Hearthline Realty to home marketplace/ownership, schools/college to Education, Hospital/Gym to health/wellness, Airport to travel, City Hall to Politics/business, justice locations to legal/corrections, Loomworks to work/business, special-career venues to their established worlds, and Blackline Yard to organized crime after existing discovery allows the place.
- Added ephemeral owner-screen route intent, contextual institution banners/anchors, and locked-context messaging that preserves progressive disclosure. Seeing a building never bypasses age, eligibility, legal, financial, career, or discovery rules.
- No `GameState` field, save migration, alternate location ledger, gameplay RNG draw, or runtime-ID allocation was added. Save schema remains **15**.
- Content audit now reports **24 Everthread town places / 28 routed institution services**; the random-event library remains **691**.

### Certification

- GitHub Actions Run #131 (`34815580108`) certified expanded source `5eca77206c61f7af67d1c12f101fd5c986369e0c` from upload wrapper `85a6449e6878c174586f5f61351654bb0b1ff877`.
- Both TypeScript gates PASS; canonical preflight PASS **4/4**; base regression **82/82**; Phase 8A **25/25**; Phase 8B **46/46**; new Phase 8C routing regression **41/41**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **178 modules**. `TownMapScreen` remains code-split at ~8.60 kB JS / 3.50 kB gzip plus ~7.69 kB CSS / 1.91 kB gzip; main JS is ~1,187.72 kB / 335.72 kB gzip. Existing >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `5615d7382b8170be942c825f2c5d8def3a3a2855ce5411e389a4ae9782884db7`; dependency SHA-256 `2473833386b3e3c4e26825181751dfe3352f4787117e0780806fb27e91ad4e7e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10336258752`, digest `c0ce8f6248bcdc113cc6f89c5f38b7c228265c39b6b60c607cb76768a59a6a65`; Pages artifact ID `10336585276`, digest `574d8f039938b3b3c46fb161d531b046f16d637515c9312c10016c7bb872d38f`; Pages deployment reported success.
- Post-certification feedback sweep found no new report rows and advanced the stored review checkpoint to `5eca77206c61f7af67d1c12f101fd5c986369e0c`.
- **Next slice:** Phase 8D — Player Profile & Personal Inventory.

## Post-8B Map Artwork & Flush Threadspace Presentation — CI Green Run #129 — 2026-09-14

### Changed

- Replaced the synthetic rendered town-map surface with the exact player-supplied authored Everthread artwork, bundled at `src/assets/everthread-town-map.png` and used as the native **1536×961** map coordinate plane.
- Recalibrated all 24 existing place markers to recognizable regions of that artwork while preserving stable IDs, categories, visibility rules, routing metadata, and all existing simulation ownership.
- Removed the inset/bordered Map Threadspace presentation. The map workspace now runs edge-to-edge beneath the header and directly above bottom navigation, matching the spatial model established by People Threadspace.
- Initial map camera now uses cover/fill behavior to avoid letterboxed workspace gaps; **Fit Map** remains the explicit full-town overview. Pan, pinch/wheel zoom, filtering/search, culling, progressive marker/label disclosure, and place sheets remain intact.
- The old synthetic district/road geometry is no longer rendered as the visual map; six district definitions remain semantic registry metadata. Save schema remains **15** and no migration is required.

### Certification

- GitHub Actions Run #129 (`34813478003`) certified expanded gameplay/source `109438ec2d50308c62c061a1c6bed7e0849e157b` from upload wrapper `9929dc02a48a92048e724c55c23441f5d1b1384b`.
- Exact source diff from the prior certified repository source is the intended **6 map files** only; no unrelated gameplay/system/package/workflow drift.
- Both TypeScript gates PASS; canonical preflight PASS **4/4**; base regression remains **82/82**; Phase 8B Town Map expands to **46/46**; Phase 8A remains 25/25; Integrated Long-Life remains 105/105; all established suites remain Green.
- Production build PASS with Vite 7.3.6 at **176 modules**. Authored map asset ships at ~405.17 kB; lazy `TownMapScreen` is ~18.76 kB JS / 6.06 kB gzip plus ~6.65 kB CSS / 1.75 kB gzip. Established main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `d4af50b0cd89a4903216fa142e6f2e724b63e6f85935dbb4ad503fa47fd995ee`; dependency SHA-256: `d3838ea7d4c36879308e87b144b6eab065387b8c1f1a91540137eeff7935b2dd`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10336025996`, digest `ff5ca3e3c5b74469b1f08092ed0e3262155743099f23617f307285272843edb4`; Pages artifact ID `10335706833`, digest `af9836db0812c8a187ad3d2d0fb320fea8809dfc74305b3fbe4567ad9bb009c9`; Pages deployment reported success.
- Post-certification feedback sweep found no new report rows; stored review checkpoint advanced to the Run #129 expanded source.
- **Next slice remains:** Phase 8C — Institution Routing.

## Phase 8B — Town Place Registry & 2D Flat Map — CI Green Run #127 — 2026-09-14

### Added / changed

- Added one authored Everthread town registry with **24 stable places across 6 districts**, covering the complete Phase 8B location-family contract without creating a second simulation/location ledger.
- Added `TownMapSystem` as a deterministic read-only projection/math layer for discovery, filtering, semantic view, fit/constrained camera calculations, viewport culling, and zoom-based progressive disclosure. Map browsing consumes no gameplay RNG, allocates no runtime IDs, and mutates no `GameState`.
- Added a lazy-loaded sixth primary **Map** tab with mobile-first touch pan, pinch/wheel zoom, Fit Map, large markers, search/category filters, progressive labels/pins, viewport culling, and place-detail bottom sheets. No hover interaction is required.
- Added public institutions/landmarks for banking, vehicles, realty, residential life, shopping/food, parks/groceries, school/college, hospital/gym, film/modeling, racing/sports/military, City Hall, justice/public safety/prison, air travel, and business. Added Blackline Freight Yard as an underworld location whose visibility derives from existing organized-crime/legal state.
- Added optional place routing metadata that points only to mature existing screens. Phase 8B deliberately does not execute bank/property/career/etc. mechanics; those existing systems remain authoritative until Phase 8C routing.
- Existing residence authority remains `countryId/city`. Emigrated characters can browse Everthread without being relocated. Save schema remains **15** and no migration is required.
- Content audit now reports **24 Everthread town places**; the ordinary random-event library remains exactly **691**.

### Certification

- Added `phase8BTownMapRegression.ts`: **41/41** checks covering registry uniqueness/coverage, district bounds, routing ownership, schema stability, deterministic/RNG-neutral projection, underworld discovery, filtering/search, 360/390/412/430px fit math, camera constraints, viewport culling, progressive disclosure, semantic view stability, and post-emigration browsing.
- Phase 8A remains **25/25**; base suite remains **82/82**; Integrated Long-Life remains **105/105**; every established career/family/NPC/estate/finance/credit/world-condition/minigame/feedback suite remained Green.
- Both TypeScript gates PASS; canonical Everthread preflight PASS **4/4**; production build PASS with Vite 7.3.6 at **175 modules**. `TownMapScreen` is code-split at ~19.53 kB JS / 6.24 kB gzip plus ~8.20 kB CSS / 2.03 kB gzip. The established >700 kB main-chunk warning remains nonblocking technical debt.
- GitHub Actions Run #127 (`34809167604`) certified expanded gameplay/source `f3fcb537545c2a454d98db22600346baf54e194e` from upload wrapper `e1becf6912c9af6d92533d98f374a3a05976e408` on package `0.12.0`, save schema **15**.
- Certified source SHA-256: `e33c5ca44ec685fd41684f53a5f95a3aa67ea71341b33064fac54eccc665ba3e`; dependency SHA-256: `382c6da9eade13f2d2a3f31692de0ee35f4864808786d116968031dd046f47f6`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10334276556`, digest `5cc080d07a3246045e6004857ea158f00b16af30af28ee90463be4552d1f4a1f`; Pages artifact ID `10334057076`, digest `dcec92a7398f2ab09dd9d5d18268c47561878db6443b3153f52b95fab8b7f92c`; deployment reported success.
- Post-certification Feedback Inbox sweep found four total reports and zero unresolved reports; stored review checkpoint successfully advanced to `f3fcb537545c2a454d98db22600346baf54e194e`.
- **Next slice:** Phase 8C — Institution Routing.

## Phase 8A — Everthread Setting Foundation — CI Green Run #125 — 2026-09-13

### Added / changed

- Established **Everthread** as the canonical home setting for player-facing new lives while retaining `countryId/city` as the single physical/legal/economic location authority used by mature systems.
- Added fictional Everthread jurisdiction/city definitions and a shared `locationLabel` projection; executable country definitions increase **32 → 33**.
- Added hidden `namePoolCountryId` to separate cultural procedural naming from physical residence. Character/NPC naming, name-based identity inference, autonomous family naming, and dynasty continuation now preserve this profile independently from travel/emigration.
- Removed the real-country selector from the New Life player UI. Low-level scenario/test country overrides remain supported without becoming player-facing home selection.
- Added `SettingSystem` with safe naming-profile normalization and schema-14 → 15 setting migration. The migration moves only the protagonist's current local simulation context into Everthread, preserves remote/historical state, retains prior travel history, is idempotent, and consumes no gameplay RNG or runtime IDs.
- Active country-scoped world conditions and active SocialWorlds tied to the former local context follow the migration; archived SocialWorlds and resolved world-condition history remain historical. Later schema-15 emigration remains durable on load.
- Everthread uses the established North-American-style school profile as the current education compatibility bridge. Travel copy and initial birth/location copy avoid duplicate `Everthread, Everthread` labels.
- Travel destination UI defaults away from the current location and labels location economics generically.
- Save schema advances **14 → 15**.

### Certification

- Added `phase8ASettingFoundationRegression.ts`: **25/25** checks covering default Everthread residence, separate cultural naming profiles, legacy migration preservation, local-vs-remote NPC/world semantics, active-vs-historical world conditions, travel history, RNG/ID neutrality, idempotence, invariants, and post-migration emigration durability.
- Dynasty transition regression is **64/64** with naming-profile preservation; all established family/estate/credit/asset/NPC/world-condition and other suites remain Green. Base regression suite is **82/82** and Integrated Long-Life remains **105/105**.
- Both TypeScript gates PASS; canonical Everthread preflight PASS **4/4**; production build PASS with Vite 7.3.6 at **171 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- GitHub Actions Run #125 (`34807854189`) certified expanded gameplay/source `2596084575dd4288a0b549dc1a618736280f135b` from upload wrapper `36b8ce0863d8a6ddd69e20a85b99ed6ec216cb2a` on package `0.12.0`, save schema **15**.
- Certified source SHA-256: `46efef3174bb53984b67fcf1c1512fdb8a741a65edb37006654e602b21a8253c`; dependency SHA-256: `7c1e03244499adf494b2bb986797e603270624d047eee8bc52e3c48b68364eab`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10333602478`, digest `6e65d5df2511792614c00b9e50b5db70e2953e2d5f4fc7964e6fc191a880b77d`; Pages artifact ID `10333582525`, digest `f519a783f900fc860dfb70168b7277d0b65b4c77cb83624ef1d83a0a7162cd02`; deployment reported success.
- Post-certification Feedback Inbox sweep still found four total reviewed/resolved reports and no new report rows; stored review checkpoint successfully advanced to `2596084575dd4288a0b549dc1a618736280f135b`.
- **Next slice:** Phase 8B — Town Place Registry & 2D Flat Map.

## Phase 7C — Persistent World Conditions — CI Green Run #122 — 2026-09-13

### Added / changed

- Added one bounded `WorldConditionSystem` authority for persistent national/global conditions. It owns condition identity, exact country/global scope, duration, intensity, durable cooldowns, bounded active/history state, deterministic annual start/expiry, and read-only modifier projection; it owns no cash, jobs, housing, investments, fame, business, travel, or event queue truth.
- Added seven original data-driven conditions outside the 691-event random library: Growth Wave, Economic Slowdown, Cost Surge, Housing Squeeze, Travel Disruption, Media Frenzy, and Market Jitters. Country conditions bind the exact country where they started; global conditions remain globally relevant.
- Existing authorities consume bounded modifiers instead of being bypassed: `EconomySystem` (inflation/salary/housing/business demand), `CareerSystem` (application pressure/layoff risk), `BusinessSystem` through the economy index, `PropertySystem` through housing, `InvestmentSystem` (drift/volatility), `TravelSystem` (trip cost), `FameSystem` (organic growth/scandal/publicity economics), and `FinanceSystem` (ordinary household living-cost pressure).
- Added a compact mobile Life-screen **World around you** card showing only conditions relevant to the player’s current country plus global conditions, including scope, intensity, remaining years, description, and effect summary. Start/expiry also write bounded timeline entries under the new `world` timeline category; no standalone popup queue is introduced.
- Annual condition selection uses an isolated deterministic world-condition RNG stream derived from seed/year/country and does not advance `state.rngCounter`. Existing downstream RNG draw shapes remain unchanged.
- Save schema advances **13 → 14** for durable `worldConditions`. Migration creates empty world-condition state without retroactive history and is deterministic, idempotent, gameplay-RNG neutral, and runtime-ID neutral. Active conditions are capped at 4 and resolved history at 48.

### Certification

- New `phase7CWorldConditionRegression.ts`: **42/42** checks covering content isolation/counts, schema-14 migration, migration idempotence/RNG neutrality, deterministic generation, active/history bounds, multi-year expiry/history, exclusive groups/cooldowns, country/global relevance across emigration/return, UI projection, Economy/Business/Property/Investment/Travel/Fame/Finance integration, save round-trip, queue isolation, exact scope, and global invariants.
- Both TypeScript gates PASS; complete regression wall PASS; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Phase 7B2 35/35; Phase 7B3 36/36; all established career/estate/finance/NPC suites remain green.
- Production build PASS with Vite 7.3.6 at **170 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- GitHub Actions Run #122 (`34797847276`) certified expanded gameplay/source `0770106f52eea3182e86d120fa38c6b90be589e4` from upload wrapper `60e5646c274cd36024a778a93a1b8c1af3a401c5` on package `0.12.0`, save schema **14**.
- Fresh live Feedback Inbox review after certification found **4 total reports, all 4 resolved**. The bookkeeping checkpoint write was blocked by connector safety, so no later checkpoint value is claimed.
- **Phase 7 is closed.** After this closeout synchronization is certified, implementation planning stops until Mavyy and Yuki brainstorm the future direction together.

## Phase 7B3 — Special-Career Long-Tail Echoes — CI Green Run #120 — 2026-09-13

### Added / changed

- Extended Phase 7B into the three persistent special-career ecosystems that were not already served by the older Phase 4D8 annual story scanner: combat sports, military service, and politics.
- Added five action-driven probability-zero echoes: combat training with the exact coach, a sanctioned bout with the exact rival, military training with the current posting/commander when available, a political policy push with the exact office/chief of staff when available, and a press confrontation with the exact office/opposition leader when available.
- Existing `SpecialCareerStorySystem` annual mentor/rival/path scanning is unchanged. Phase 7B3 is requested only by explicit player actions through `SystemicStorySystem` → `ConsequenceSystem`, avoiding a second special-career story generator.
- Added a narrow data-driven `ChoiceEffect.specialCareer` effect for bounded `skill`, `reputation`, and `approval` deltas on the exact `payload.careerKind`. It cannot alter wins/losses, titles, contracts, seasons, elections, terms, ranks, promotions, projects, or other lifecycle-result authority.
- Exact archived SocialWorlds remain valid history; dead/missing exact NPC/world targets cancel deterministically rather than retargeting. Military/politics actions taken before their annual world is created may schedule career-only history without forcing premature world creation.
- Save schema remains **13**. Scheduling consumes no gameplay RNG; the ordinary random-event library remains exactly **691** definitions and the older 18-definition dedicated special-career story registry remains separate.

### Certification

- GitHub Actions Run #120 (`34796052224`) certified expanded source `4dd4378ec8986056fc3348dec5b2c6b1594b236b` from upload wrapper `c74078a41340023ab7760378f1fdfe0f77108643` on package `0.12.0`, save schema **13**.
- `phase7B3SpecialCareerEchoRegression.ts`: **36/36**; Combat 51/51; Military 65/65; Politics 80/80; Special-career Story 37/37; Path-story 68/68; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Phase 7B2 35/35; Progressive Disclosure 25/25; Random-event Coherence 77/77; minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites remained green.
- Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, and production build with Vite 7.3.6 at **168 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `b742118c6ce2db92abf774f178d1f067551ced5148268cdaf70de1c70e78f539`.
- Certified dependency SHA-256: `657e8c495c687e2f4667000052eb2c42461568c5e5bfe970f48e14290bd071dd`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10329833244`, digest `51b4e4bdc22a9824039f46a20eee603081b66f243e7abd3f70650a7b2df56ef5`; Pages artifact ID `10329833247`, digest `2f00aa0d6b096b3379db5ad80e74b42afbae74a09bf9dfb28544dd99aa2e92a8`. Certified restore smoke and Pages deployment reported success.
- A fresh live Supabase review after Run #120 found **4 total reports and 0 unresolved reports**; the review checkpoint is advanced to `4dd4378ec8986056fc3348dec5b2c6b1594b236b`.

## Phase 7B2 — Ownership & Workplace Echoes — CI Green Run #118 — 2026-09-13

### Added / changed

- Added five action-driven systemic delayed stories for property renovation, business founding, business product launches, manager feedback, and formal coworker concerns.
- All five use the existing `SystemicStorySystem` request bridge and certified `ConsequenceSystem`; no new narrative queue, graph, or save authority is introduced.
- Property stories bind the exact owned property and cancel if it is sold/missing before the due age. Business stories bind the exact existing business. Workplace stories bind the exact persistent workplace world plus the exact manager/coworker and may intentionally surface after the workplace archives; dead/missing people or missing worlds cancel rather than retarget.
- Added data-driven property effects for bounded condition/value-percentage changes and business effects for bounded demand/reputation changes. Event rendering resolves `{PROPERTY_NAME}` / `{BUSINESS_NAME}` / workplace `{WORLD_NAME}` from authoritative state instead of copying names into durable story payloads.
- Property/business consequence resolutions expose exact semantic state-change keys. Asset and business story outcomes write to the matching timeline categories.
- Save schema remains **13**. Scheduling consumes no gameplay RNG and the ordinary random-event library remains exactly **691** definitions.

### Certification

- GitHub Actions Run #118 (`34792171294`) certified expanded source `a4d04523e18128044c00f960f6db5fcd306a8237` from upload wrapper `84f1814b46df253e1e00520ed21c12e2e0608a43` on package `0.12.0`, save schema **13**.
- `phase7B2OwnershipWorkRegression.ts`: **35/35**; Core 82/82; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Progressive Disclosure 25/25; Random-event Coherence 77/77; Activity-specific Minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites remained green.
- Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, and production build with Vite 7.3.6 at **168 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `bba33e3f10e6d4a81e321acbd9aad5051f9092ac4c68e220e613bb62a4be5075`.
- Certified dependency SHA-256: `e88590934865025dcb26987fa254cefa18c346f022b94e0378933752e076bee1`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10328692946`, digest `3f49ce6df32cedcb03f20b39ed547bb0e2c5420ebd83498c81306109638b8f58`; Pages artifact ID `10328503412`, digest `6eeb415d39319542a382c563b914390a16071e9e1d3d2cf50e724d55325dc86c`. Certified restore smoke and Pages deployment reported success.
- A fresh live Supabase review after Run #118 found **4 total reports and 0 unresolved reports**; the review checkpoint is advanced to `a4d04523e18128044c00f960f6db5fcd306a8237`.

## Feedback UX — age-appropriate progressive disclosure — CI Green Run #117 — 2026-09-13

### Certification

- GitHub Actions Run #117 (`34783290659`) certified expanded source `9822a31df84197ea700ebd890bf0f68cb716637b` on save schema **13**.
- Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, Progressive Disclosure **25/25**, Integrated Long-Life 105/105, Phase 7A 36/36, Phase 7B1 33/33, Random-event Coherence 77/77, both feedback suites, and production build at **168 modules**.
- Certified source SHA-256: `f2fa8f09e292e46b704e2f2c37a3a1e7b045e28bdfe5a9fcb5e9dcd211213c5f`.
- Certified dependency SHA-256: `856bae49f4e6b469f4e2d85d031f218c38d6dbdc909ef19fc13bcc23244b9579`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10325856281`, digest `7c34b453461c5c6286efc44a8a3959e4601691b077be1fe300b96863aadfce0d`; Pages artifact ID `10325846256`, digest `0bedf7dd068fad6ae217142a9cf69c1d8de2d38e53776f764c743cf696373d99`. Pages deployment reported success.
- Resolved `ET-20260913-BE8649B9` as a deployed suggestion/experience correction against that exact source/run. A fresh Supabase review against Run #117 found **0 unresolved reports**.

### Corrected

- Early-life Activities and Career/Life Paths now hide age-ineligible choices until their owning gameplay systems say the threshold has been reached, while legacy/current records stay visible for save compatibility.
- Engine eligibility remains authoritative; the presentation layer consumes shared owner thresholds rather than maintaining a second set of age rules.

## Phase 7B1 — Family, School & Relationship systemic stories — CI Green Run #115 — 2026-09-13

### Added / changed

- Added five system-owned delayed stories driven by real player actions rather than annual random rolls: time spent with a child, academic misconduct, a serious friend argument, romantic reconciliation, and marriage expectations.
- Added `SystemicStorySystem` as an RNG-neutral request bridge into the already-certified `ConsequenceSystem`. It owns no queue, relationship, NPC, school, or save truth; `state.delayedEvents` remains the sole active consequence queue.
- Added `systemicConsequenceEvents.ts` as a dedicated probability-zero content registry outside the 691-event random pool. Exact NPC/social-world targets, origin age, due age, validity, and dedupe are carried by the certified scheduler.
- Added exact school-world event effects for conduct/social standing/attendance. The first school follow-up can therefore change the persistent school record already consumed by post-secondary admissions rather than applying a detached stat-only outcome.
- Event description rendering now resolves `{WORLD_NAME}` from the referenced `SocialWorld`; relationship stories continue to resolve the exact NPC from payload authority.
- Reconciliation stories cancel if the relationship ends before they mature; marriage stories require the same exact spouse; dead NPCs and missing school worlds cancel deterministically rather than retargeting.
- Updated the integrated long-life test helper to resolve scheduler-required same-age backlog before retrying Age Up, matching certified Phase 7A player-facing gating instead of assuming every Age Up advances immediately.
- Save schema remains **13**; no gameplay RNG is consumed by story scheduling and no new durable authority was introduced.

### Certification

- GitHub Actions Run #115 (`34782061788`) certified expanded source `f417403ff8a091f92f823c074d6a132dd27b90aa`, package `0.12.0`, save schema **13**.
- Upload wrapper: `0a4372ac7f8a9c3474e5b9e50e995abe11dae2f1`. Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, and production build.
- `phase7BSystemicStoryRegression.ts`: **33/33**; Core 82/82; Integrated Long-Life 105/105; Phase 7A Persistent Consequence 36/36; Random-event Coherence 77/77; Activity-specific Minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23.
- Production build PASS with Vite 7.3.6 at **167 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `b30483a74c4c674ad3fbb025a3cb7f78d065b6f438fcf43482e3e21ef9c39613`.
- Certified dependency SHA-256: `dfc18617ab0a94454a3cdae218baa0e9800bff1d5628b32262feba193c212827`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10325695174`, digest `a58934b96b90348293cbe7eec09c4734cf74255802e7d406cbd561bb2d7e26fc`; Pages artifact ID `10324654718`, digest `5ffa444fdbdf27c5ec5f630bad39a0be2b336fdaf731b7b78099fcee91059075`. Pages deployment reported success.

## Post-4G random-event narrative-composition correction — CI Green Run #114 — 2026-09-13

### Certification

- GitHub Actions Run #114 (`34780654179`) certified expanded source `60bfa3eaecb574df5a74920cbc64f513055bae46`, package `0.12.0`, save schema **13**.
- Canonical preflight passed both TypeScript gates, the complete regression wall, Random-event Coherence **77/77**, Integrated Long-Life 105/105, Phase 7A Persistent Consequence 36/36, production build, certified artifact restore smoke, and Pages deployment.
- Certified source SHA-256: `21f7ecbeb2f531cff582ed003925def89e555b5842a06e7231e3375ed6f6daf3`.
- Certified dependency SHA-256: `0833b91abb51c9a7518141591e84b936fbfaecb855d75a8f39d7a8143db7969d`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10324957306`, digest `67835c1585a8ee92bb7bc2db8b638145628f28e3b99ab48dc804119e98ada7af`; Pages artifact ID `10324533122`, digest `5bbb65b63f006278d402a60d665c3a898304104432cf83ffcf089f61acbe5f1d`.

### Corrected

- Resolved live feedback report `ET-20260913-0AA876B7`: procedural event choices were coherent, but generic description templates could produce grammatically invalid or contextless scene text.
- Kept EventSystem/coherence ownership unchanged. The correction normalizes scene settings and uses context-safe description frames across all 664 procedural variants.
- Preserved all 691 random-event definitions, 664 procedural variants, 80 dilemma families, event IDs, probabilities, cooldowns, exact targets, choices/effects, save schema 13, and exactly three descriptions per procedural event, preserving description-selection RNG shape.
- Existing saved `pendingEvent.description` text is not rewritten; already-open choices remain compatible.

## Phase 7A — Persistent Consequence Foundation — CI Green Run #112 — 2026-09-13

### Certification

- GitHub Actions Run #112 (`34778449301`) certified expanded source `536c102e10f27694caa89a8b1d9c473953ca6e76` on save schema **13**.
- Canonical preflight passed 4/4: Engine TypeScript, Test TypeScript, complete regression wall, and production build.
- Phase 7A Persistent Consequence passed **36/36**; Integrated Long-Life 105/105; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites remained green.
- Production build passed with Vite 7.3.6 at **165 modules**; Pages deployment succeeded.
- Certified source SHA-256: `1de3ef6b9063b864afb5a4f80165bbd9eedd3db3a9280313ed68236ebd464c17`.
- Certified artifact ID `10324148743`, digest `e71dfa2020932fa856ec15a425530d7310d8b29ac2b083148abba44943513b3f`; Pages artifact ID `10324273336`, digest `dc0ff7b8d199e46c8dad632fdd506830e580f02fb7ca6feb1d89c78aa919ca4b`.

### Handoff synchronization

- Promoted Phase 7A from local candidate to certified/deployed foundation in `CURRENT_STATE`, `ROADMAP`, `PHASE7_PERSISTENT_CONSEQUENCES`, `DEVELOPMENT`, and `PLAYER_FEEDBACK`.
- Marked **Phase 7B1 — Family, Parenting, School & Relationship systemic delayed stories** as the next gameplay slice.
- Corrected stale wording that still described the secure central Feedback Inbox as future work. Supabase central submission, independent-device receipt, and player-visible disposition/status read-back are already live.
- Explicitly marked activity-specific minigame work as historical/established rather than current so a fresh chat cannot incorrectly resume that older slice.

## Phase 7A — Persistent Consequence Foundation candidate — 2026-09-13

### Added / changed

- Added one authoritative bounded `ConsequenceSystem` while retaining `state.delayedEvents` as the sole active consequence queue.
- Added stable consequence/chain/origin identity, exact due windows, priority/tie ordering, exact durable target refs, validity/cancellation requirements, dedupe, bounded completion/cancellation history, and exact event cooldown ages.
- Added shared `CURRENT_SAVE_VERSION` and candidate schema **13** migration. Schema-12 migration is deterministic, RNG-neutral, idempotent, preserves old pending choices and delayed targets, preserves distinct legacy queued entries when no old dedupe authority existed, and reconstructs legacy cooldown ages without consuming gameplay RNG.
- Moved Financial Pressure arbitration out of FinanceSystem; Finance requests a normal-priority consequence and the scheduler owns ordering. Special-career story openings now schedule high-priority exact-target consequences with stable chain/validity metadata.
- Age Up surfaces already-due backlog before advancing, preventing multiple due consequences from silently drifting into later ages. Descendant continuation resets previous-life scheduler state.
- Added `persistentConsequenceRegression.ts`: **36/36** checks covering cooldowns, deterministic order, pending protection, windows, exact targets/cancellation, dedupe, bounds, migration/idempotence, save/rewind, Finance priority, descendants, content count and invariants.
- Ordinary random event definitions remain **691**.

### Local validation

- Engine TypeScript PASS; Test TypeScript PASS; complete established regression wall PASS.
- Phase 7A Persistent Consequence 36/36; Integrated Long-Life 105/105; Feedback Reporting 20/20; Feedback Central Inbox 23/23.
- Production build PASS with Vite 7.3.6 at 165 transformed modules. Canonical GitHub Actions remains final certification authority.

## Player-visible Feedback disposition — CI Green Run #111 — 2026-09-13

### Added

- Added secure player status read-back to the existing Supabase `everthread-feedback` Edge Function. A report can be queried only with its report ID plus the private 32-byte device token already required for withdrawal.
- Added bounded `player_message` reviewer communication while keeping `triage_status` and `resolution_class` as the only authoritative lifecycle/disposition fields.
- Feedback Center now displays central receipt, review lifecycle, disposition, reviewer message, review timestamp, and a manual **Check status** action.
- Automatic feedback synchronization refreshes review state only for the same bounded 10-report batch already used for retry.
- Centrally dispositioned test report `ET-20260913-A527E2A6` as Resolved → Suggestion noted to validate player read-back after deployment.

### Security / architecture

- The public status endpoint does not expose internal triage/resolution notes, cancellation-token hashes, database access, or other players’ reports.
- No simulation/save authority or gameplay RNG changes. Supabase security advisor remains clean after the schema extension.

### CI validation

- GitHub Actions Run #111 (`34774175236`) certified expanded source `576f9402deb854f8d5bd11891610e035cdd6d7ec`.
- Canonical preflight passed 4/4 with Feedback Central Inbox 23/23, Activity Feedback Reporting 20/20, Activity-specific Minigame 19/19, Core 82/82, AI Interaction Testbench 41/41, Integrated Long-Life 105/105, all established suites, and the 163-module production build.
- Certified artifact ID `10323017491`; Pages artifact ID `10322703128`; Pages deployment succeeded.

## Central Feedback Inbox v2 — CI Green Run #110 — 2026-09-13

### Added

- Created a dedicated free Supabase **Everthread** project in `us-east-2` and deployed the `everthread-feedback` Edge Function for central report submission/withdrawal.
- Added RLS-protected central report, rate-limit, and review-checkpoint tables with revoked public grants, explicit deny policies, triage metadata, source-commit indexing, duplicate linkage, and future-Yuki review state.
- Added local-first remote transport in `src/feedback/remoteInbox.ts`: 32-byte device cancellation secrets, hash-only server storage, idempotent submission, secure withdrawal, offline retry, startup/online retry, and bounded retry batches.
- Feedback Center now automatically submits reports when online and displays central delivery state; Share/Copy/JSON export remain fallback/backup options.
- Versioned the applied Supabase migrations and deployed Edge Function under `supabase/`.
- Added Feedback Central Inbox regression: 17/17 locally.

### Security / architecture

- No Supabase secret/service-role credential is present in the public client. Public database roles cannot read or mutate feedback tables.
- Supabase security advisor is clean after setup. Performance advisor findings were reduced to expected unused-index notices on the empty new database.
- Feedback remains entirely outside `GameState`, save schema, rewind, descendants, simulation RNG, and gameplay authorities.

### CI validation

- GitHub Actions Run #110 (`34773384580`) certified expanded source `9980d8c278cb3bb2306d73a07963bf172096fd1e`.
- Canonical preflight passed 4/4 with Feedback Central Inbox 17/17, Activity Feedback Reporting 20/20, Activity-specific Minigame 19/19, Core 82/82, AI Interaction Testbench 41/41, Integrated Long-Life 105/105, all established suites, and the 163-module production build.
- Certified artifact ID `10322692198`; Pages deployment succeeded.

## Player Feedback / Issue Reporting — CI Green Run #109 — 2026-09-13

### Added

- Added Settings → Help & Feedback with interface-specific/action-specific report classification across Life, People, Activities, Career, Assets & Money, Minigames, Progress & Life Saves, Settings, and Other.
- Added Technical issue, Experience issue, and Suggestion report kinds with focused subcategories and bounded free-text context.
- Added optional safe diagnostic capture containing deployed build/source identity, save schema, game seed/RNG position, age/year/generation, current career, bounded system counts, pending-event identity, relevant settings, and recent timeline IDs without exporting the complete save.
- Added a bounded device-local report queue outside `GameState`, plus Share, Copy, structured JSON inbox export, draft cancellation, and queued-report withdrawal.
- Added deterministic production `build-info.json` generation from the actual checked-out Git commit so reports can identify the expanded source used by the deployed bundle.
- Added `PROJECT_HANDOFF/PLAYER_FEEDBACK.md` and a current-state feedback queue snapshot so future Yuki reviews active supplied/exported reports before new work and does not dismiss player-facing defects merely because backend regressions are green.
- Added Activity Feedback Reporting regression: 20/20 locally.

### CI validation

- GitHub Actions Run #109 (`34771397516`) certified expanded source `d73bbfa6fdf8afb430f2604a09c9ac3053d60962`.
- Canonical preflight passed 4/4 with Activity Feedback Reporting 20/20, Activity-specific Minigame 19/19, Core 82/82, AI Interaction Testbench 41/41, Integrated Long-Life 105/105, the complete established wall, and the 162-module production build.
- Certified artifact ID `10321624066`; Pages deployment succeeded.

## Phase 6C — Personal Borrowing / Bankruptcy / Recovery candidate — 2026-09-12

- Built only from certified Run #103 / `7f1f58099fe5e8528dc8ec3c70c0ed340a2e8294`.
- Adds four data-driven personal-loan products through shared CreditSystem underwriting, centralized personal-loan bills/delinquency/cure, and guarded voluntary bankruptcy/recovery without creating a second debt ledger.
- Save schema remains 12; optional personal-liability provenance/lender metadata is normalized deterministically for legacy debt with no RNG use.
- Local TypeScript gates and the complete regression wall pass, including Personal Borrowing & Recovery 31/31 and Integrated Long-Life 105/105. Standalone production build passes at 155 modules. GitHub Actions remains certification authority.

## Post-6B3 Credit History Reactivity correction candidate — 2026-09-12

### Fixed

- Credit & Banking History now derives current/prior transaction lists fresh on every game-state render instead of memoizing against the mutable credit-transaction array reference. Payments, charges, fees, deposits, and other posted credit transactions can therefore appear immediately while the banking sheet remains open.
- Added regression protection in Payment & Asset Management proving the read-only History projection immediately reflects a newly posted in-place credit transaction.

### Baseline

- Built only on certified Run #102 expanded source `8b2a49fe76c5429cf55228a00a15b6103211a25b`, package `0.12.0`, save schema 12. Phase 6B3 itself is CI Green.
- This is a presentation-reactivity correction only: it adds no debt authority, no save fields, no RNG use, and no content definitions. Phase 6C remains gated until this correction is CI Green.

### Local validation

- Engine TypeScript and test TypeScript pass. The complete regression wall passes with Payment & Asset Management **81/81** (up from 79/79 through two reactivity checks), Core 82/82, Credit & Banking 74/74, Asset Financing 77/77, Asset Delinquency 82/82, Integrated Long-Life 105/105, and every established suite green.
- Standalone production build passes at 153 transformed modules. The local all-in-one preflight wrapper was interrupted by the host execution ceiling during its repeated Vite transform after both TypeScript gates and the complete wall had already passed; GitHub Actions remains the final integrated preflight authority.

## Phase 6B3 — Payments & Asset Management UX — CI Green Run #102 — 2026-09-12

### Added

- Added a centralized `PaymentSystem` projection/action layer for real credit-card minimums and secured vehicle/home financing obligations. CreditSystem and FinanceSystem remain the balance authorities; the UI no longer needs to invent bill math.
- Added **Credit & Banking → Bills & Payments** from Overview. It itemizes current/past-due obligations, shows Cash, total due, past due, and annual auto-pay status, supports Cash payment of the real bill, and exposes per-obligation auto-pay switches.
- Added persistent annual auto-pay preferences. New cards and new asset-financing contracts default ON; schema-11 saves migrate safely to ON so old saves preserve their established automatic-servicing behavior. Card auto-pay covers the required minimum only, never the whole balance.
- Added manual secured annual-bill payment with a paid-ahead marker so paying before Age Up cannot double-charge the same contractual year. Existing delinquent secured bills continue through the 6B2 cure authority.
- Added vehicle sale quotes and real vehicle selling, including selling costs, lender payoff, equity proceeds, underwater deficiency conversion to unsecured debt, durable history, and confirmation before mutation.
- Added `AssetSaleSheet` and `paymentAssetManagementRegression.ts` with 79 targeted checks across migration, projection purity, auto-pay on/off, card minimums, secured prepayment, delinquency cure, financed contract defaults, vehicle/home sale accounting, save round trips, and invariants.

### Changed

- Credit & Banking Overview replaces the duplicated historical block with the compact Bills & Payments entry; major derogatory history now lives under the existing History tab. Individual card Accounts still support extra/full revolving-balance payments.
- Assets → Property now contains both homes and vehicles with a compact **Browse | Owned** toggle. Browse covers home + vehicle markets; Owned shows homes + vehicles together with contextual financing status and asset actions. Vehicles are no longer hidden under More.
- Payment controls are centralized in Credit & Banking instead of being scattered across asset cards. The Money liabilities view remains an accounting/status view and points players to Bills & Payments.
- Save schema advances from 11 to **12** for durable auto-pay, credit-card past-due, and secured paid-ahead payment state. Migration is deterministic, RNG-neutral, and defaults old obligations to the prior automatic-payment behavior.

### CI validation

- Built from exact certified Run #101 expanded source `c498753acb67bbb0aa930e5f8bdb7b411b1e874c` and its certified Node dependency artifact.
- GitHub Actions Run #102 (`34707368374`) imported the overlay into expanded source `8b2a49fe76c5429cf55228a00a15b6103211a25b` and reproduced both TypeScript gates, Core 82/82, Credit & Banking 74/74, Asset Financing 77/77, Asset Delinquency 82/82, Payment & Asset Management 79/79, Integrated Long-Life 105/105, every established suite, and the 153-module production build.
- Canonical preflight reported **GREEN 4/4**, certified artifact `10302905490` was uploaded, and GitHub Pages deployment succeeded. The existing >700 kB main-chunk warning remains nonblocking.

## Phase 6B2 — Secured Delinquency & Collateral Consequences — CI Green Run #101 — 2026-09-12

### Added

- Added persistent, save-safe secured-loan delinquency state on existing `Loan` records: status, arrears, missed-payment count, and the age of the unresolved miss. Pre-6B2 schema-11 loans derive as current without mutation, so no save-schema bump is required.
- Added explicit player curing for delinquent car loans and mortgages. Assets → Money shows the collateral, past-due amount, next-Age-Up consequence, and a touch-friendly **Cure** action that uses Cash only.
- Added vehicle repossession for uncured financed cars and strengthened mortgage foreclosure to use the same loan/collateral/credit authorities. Missed secured payments create durable timeline warnings and existing CreditSystem derogatories; repossession creates a credit default and foreclosure preserves the established foreclosure history.
- Added `assetDelinquencyRegression.ts` with 82 targeted checks covering current servicing, missed-payment accounting, cure success/failure, cure payoff, car repossession, foreclosure, deficiencies/surplus recovery, secured-payment priority, voluntary underwater sales, net-worth accounting, and schema-11 round trips.

### Changed

- Annual finance no longer reduces a secured-loan balance when the year cannot actually fund that payment. The skipped payment becomes arrears, the contractual term is not falsely consumed, and the player gets until the next Age Up to cure it.
- Same-year secured shortfall allocation protects housing by allowing a vehicle payment to fail before a mortgage when one skipped payment is enough to close the cash gap. Deeper insolvency can make both obligations delinquent.
- Unrecovered collateral balances become ordinary unsecured deficiency debt instead of disappearing. Involuntary foreclosure equity first reconciles existing unsecured shortfall debt before any remainder returns as cash.
- Voluntarily selling an underwater financed home now preserves the unpaid deficiency as unsecured debt, closing the prior debt-erasure exploit.
- Financed home/vehicle cards expose outstanding financed balance and at-risk state directly on the owned asset.

### Candidate validation

- Local canonical preflight from the certified Run #100 source/dependency artifact passes **4/4**: engine TypeScript, test TypeScript, complete regression wall, and production build.
- Core remains 82/82; Credit & Banking 74/74; Asset Financing 77/77; new Asset Delinquency 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; every established dedicated suite is green locally.
- Production build succeeds at 151 transformed modules. The existing >700 kB main-chunk warning remains nonblocking.
- GitHub Actions Run #101 reproduced Asset Delinquency 82/82, every established regression, both TypeScript gates, the 151-module production build, certified-baseline artifact creation, and Pages deployment. Expanded certified source is `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`; Phase 6B2 is CI Green.

## Phase 6B1 — Asset Financing Foundation — CI Green Run #100 — 2026-09-12

### Added

- Added a reusable, data-driven `AssetFinancingSystem` plus six fictional vehicle/home lender programs. Asset underwriting consumes `CreditSystem.getCreditUnderwritingSnapshot()` for the existing derived credit profile, real income, installment/revolving payment burden, inquiries, and bankruptcy recovery instead of inventing a second score model.
- Added deterministic, read-only lender quotes for appropriate vehicles and homes with visible APR, term, down payment, amount financed, annual payment, monthly equivalent, finance charge, full-term total cost, projected payment burden, and human-readable approval/decline reasons.
- Added a mobile **Buy Outright | Finance** purchase sheet for property and vehicles. Browsing does not create an inquiry; signing re-underwrites current state and then records the approved financing inquiry.
- Added persistent `car` and `mortgage` liabilities using the existing `Loan` authority, including collateral `assetId` links, annual-finance servicing, net-worth accounting, estate debt treatment, schema-11 save persistence, and durable timeline/history context.
- Added `assetFinancingRegression.ts` with 77 targeted checks covering deterministic browsing, lender requirements, down-payment effects, stale-quote revalidation, preview→signed parity, shared application limits, cash-vs-credit separation, vehicle/home outright and finance paths, accounting identity, annual servicing, estates, saves, and CreditSystem authority reuse.

### Changed

- Replaced the legacy hard-coded home-mortgage approval math inside `PropertySystem` with the shared financing authority. Vehicle financing now uses that same authority; asset screens contain no independent creditworthiness calculation.
- Asset liabilities now show APR, authoritative annual payment, and remaining years. Credit & Banking history resolves asset-financing inquiries to their lender/program names.
- Outright vehicle purchases now create a durable asset timeline entry so a material life purchase is not invisible. Credit Available remains revolving borrowing capacity only and is never treated as purchase cash or wealth.

### CI validation

- GitHub Actions Run #100 reproduced both TypeScript gates, Core 82/82, Asset Financing 77/77, Credit & Banking 74/74, every established dedicated regression, Integrated Long-Life 105/105, and the production build.
- The canonical preflight reported GREEN 4/4, the certified baseline artifact was uploaded, and GitHub Pages deployed successfully.
- Expanded certified source is `819d223aa9a0d5f9109c705f16213c43ddcaeb31`; Phase 6B1 is CI Green.

## Phase 6A — Credit & Banking Foundation — CI Green Run #99 — 2026-09-12

### Added

- Added bounded schema-11 player credit state plus `CreditSystem` for revolving accounts, available credit, refundable secured deposits, statement/minimum/payment history, interest/fees, formal inquiries, derogatories, deterministic creditworthiness, account closure, bankruptcy discharge, and bounded history repair.
- Added six original fictional banking institutions/products spanning age-16 secured starter cards through established/premium unsecured offers. Browsing is read-only; formal applications are bounded and record understandable approval/decline reasons.
- Added Life-page **Cash** + **Credit Available** presentation and a mobile **Credit & Banking** hub with Overview, Accounts, Offers/contracts, and History. Contract review exposes line, APR, annual fee, late fee, deposit, and minimum-payment terms before acceptance.
- Added manual card payments, representative card purchases, secured-deposit refunds, current-year/recent transaction history, and durable timeline consequences for material credit events.
- Added `creditBankingRegression.ts`, now 74/74.

### Changed

- Net worth/wealth breakdown now treats secured deposits as represented assets and revolving balances as liabilities; Credit Available never counts as cash or wealth.
- Estate obligations include revolving debt while refundable secured deposits remain estate value. Existing insolvency/bankruptcy now discharges active cards through the credit authority and persists default/bankruptcy credit history.
- Descendant continuation initializes the newly controlled protagonist's player credit state without inventing an unsupported NPC consumer-credit history.
- Save schema advances from 10 to 11 with deterministic, RNG-neutral, idempotent migration.

### Predeployment validation

- Credit & Banking 74/74; Core 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; every established dedicated regression remains green.
- Both TypeScript gates pass. Production build passes at 148 transformed modules; existing >700 kB main-chunk warning remains nonblocking.
- 80-year direct card-use benchmark completed in ~5 ms in the hosted workspace, retained 20 recent transactions after bounded pruning, serialized the full fixture at ~18 KB, and returned zero invariant errors.
- GitHub Actions Run #99 reproduced the Phase 6A regression wall and certified expanded source `6eb2b7876203d47dcc1ad5c48f1098bf359182cd`; Phase 6A is CI Green.

## Phase 5E — Dynasty Transition / End-of-Life Agency — CI Green Run #98 — 2026-09-12

### Added

- Added read-only `DynastyTransitionSystem` projection over the existing EstateSystem and NPC biography/asset authorities. The death UI no longer performs or mirrors inheritance math independently.
- Rebuilt the death flow into an intentional mobile sequence: completed-life review → estate outcome → successor selection → detailed successor inspection → explicit continuation confirmation.
- Successor inspection now surfaces existing education/career, partner/children, health/happiness, fame/reputation, debt, own net worth, own property/businesses, projected inheritance, inherited named assets, and protected-minor trust timing.
- Estate review now names forced-sale assets and explains whether each sale was caused by estate obligations or by fair division among heirs.
- Added durable post-handoff timeline entries for estate obligations/forced sales, inherited named assets/trusts, and the value distributed to other family heirs.
- Added `dynastyTransitionRegression.ts`, currently 63/63.

### Changed

- A descendant card no longer immediately switches protagonists. Selecting a child is read-only; a separate confirmation button performs the real `continueAsChild()` action.
- Protagonist-switch confirmation explicitly disables ordinary delta-derived action VFX so cash/stress/relationship differences between two different people are not misrepresented as an action consequence.
- Heir, successor, and forced-sale lists use 24-row progressive disclosure to keep extreme dynasty death screens bounded without deleting authoritative data.
- Added the cross-phase architecture rule that material protagonist-facing consequences must be visible/understandable through gameplay surfaces and, where meaningful agency exists, presented before commitment from the same authoritative system that applies the result.
- Save schema remains 10; no transition snapshot or second estate database was introduced.

### Predeployment validation

- Dynasty Transition: 63/63. Core 82/82; Estate Planning 46/46; Estate Administration 63/63; NPC Asset Ownership 82/82; Family Topology 40/40; Action VFX 46/46; Integrated Long-Life 105/105; every established dedicated regression remains green.
- Both TypeScript gates pass. Production build passes at 145 transformed modules; existing >700 kB main-chunk warning remains nonblocking.
- Twelve sequential reviewed handoffs with hundreds of background NPCs preserve 7,212 archived life-history entries, unique completed-life IDs, state invariants, and bounded linear historical-cast growth.
- GitHub Actions Run #98 reproduced canonical preflight 4/4, Dynasty Transition 63/63, every established regression, the 145-module production build, certified artifact creation, and Pages deployment on expanded source `5aa1c4338be4edc934b867f4e5a710d0e116aaa2`; Phase 5 is closed.

## Phase 5D — Broader Family Topology — CI Green Run #97 — 2026-09-11

### Added

- Added indexed `FamilyTopologySystem` derivation for aunt/uncle and cousin relationships plus reconciliation of the existing close-family taxonomy from authoritative parent/child/partner graph truth.
- Integrated expanded kinship into People/Threadspace labels and folders, generic family event targeting, delayed family-favor continuity, relevant special-career family targeting, save-load backfill, and descendant continuation.
- Added `familyTopologyRegression.ts`, now 40/40, including deterministic/idempotent derivation, no synthetic NPC creation, RNG/ID neutrality, extended-family simulation-tier bounds, event eligibility, generation handoff, migration/backfill, romantic-history preservation, UI labels, and a hundreds-relative scale fixture.

### Changed

- Extended kin stay background-tier unless individually meaningful; aunt/uncle/cousin births do not automatically become full-simulation branches or guaranteed player timeline entries.
- Save load now repairs state invariants before final family-topology synchronization so derived stepfamily/kinship uses repaired authoritative pointers.
- Threadspace person cards use the shared human-readable relationship label formatter (`aunt / uncle`, `niece / nephew`).
- Save schema remains 10; no new persisted family database was introduced.

### Predeployment validation

- Family Topology: 40/40. Core 82/82; Action VFX 46/46; Timeline Scaling 11/11; NPC Asset Ownership 82/82; Integrated Long-Life 105/105; every established dedicated regression remains green.
- Both TypeScript gates pass and production build passes at 144 transformed modules. Existing >700 kB main-chunk warning remains nonblocking.
- Explicit large-dynasty benchmark: 1,082 starting NPCs arranged as 180 aunts/uncles + 900 cousins synchronized in ~4.5 ms locally; six simulated years completed in ~362 ms, normal autonomy grew the cast to 1,182, no extended relative was forced full-tier, and validation produced zero errors.
- GitHub Actions Run #97 reproduced canonical preflight 4/4, Family Topology 40/40, every established regression, the 144-module production build, certified artifact creation, and Pages deployment on expanded source `8e5394d0488d1c760072590ffa5c06eadfdac9f6`.

## Post-Run95 playtest hotfix — CI Green Run #96 — 2026-09-11

- Fixed Life → Your Story failing to show Age Up timeline entries until navigation/refresh. Root cause was `Timeline` memoizing a bounded window by an array reference that Everthread intentionally mutates in place; the bounded window now recomputes on each render.
- Fixed Threadspace NPC interaction VFX disappearing at relationship score caps. Action VFX snapshots now record timeline length and derive semantic relationship gain/loss from only the new `relationshipDelta` entries created by the current action when before/after stored scores cannot move past 0/100.
- Added real capped positive/adverse `interactWithNpc()` regression coverage and same-reference timeline append coverage. Action VFX is now 46/46; Timeline Scaling is 11/11 locally.
- GitHub Actions Run #96 reproduced canonical preflight 4/4, Action VFX 46/46, Timeline Scaling 11/11, every established regression, the 142-module production build, certified artifact creation, and Pages deployment on expanded source `3b58f04827ddc88a33c61b3cdf0d50f1e7584161`.

## Phase 5C — Persistent NPC Asset Ownership — CI Green Run #95 — 2026-09-10

### Added

- Save schema v10 with lean persisted NPC property/business portfolios. Existing v9 aggregate NPC property migrates deterministically into stable explicit ownership without consuming the player RNG stream.
- Bounded NPC asset rules and a dedicated asset progression substream. Meaningful NPCs can own and modestly grow property/business interests; background-tier NPCs retain cheaper simulation, do not seed new explicit property at creation, and do not organically accumulate new portfolios.
- Explicit NPC estate settlement for retained property/business inheritance, adult/minor NPC heirs, player heirs, protected trusts, mortgage carryover, and idempotent source-estate clearing.
- Descendant continuation now converts the selected NPC's own property/business holdings into playable assets and separates mortgage debt from unsecured personal debt.
- People detail sheets now show NPC liquid wealth, property, businesses, debt, estimated net worth, and named holdings.
- Dedicated `npcAssetOwnershipRegression.ts` with 82/82 checks, including protected-trust caps/overflow reconciliation and a 600-background-NPC + 3,000-entry 12-year scale fixture.
- `timelineWindow.ts` plus a 10/10 Timeline Scaling regression: the authoritative timeline remains complete while the Life page initially renders the newest 120 entries and reveals older history in 120-entry increments.

### Changed

- `NpcLifeState.finance.propertyValue` is now a projection of explicit NPC property holdings instead of a second independent property-value authority. `npc.wealth` remains liquid wealth.
- NPC annual finance incorporates explicit business profit/loss and mortgage progression while keeping asset growth bounded and deterministic.
- Player estate settlement gives offscreen heirs retained property/businesses as real holdings instead of converting the full allocation into aggregate wealth. Minor NPC heirs retain those assets in trust until adulthood.
- NPC-parent inheritance can pass retained assets directly to the player; minor player inheritance remains protected until age 18 and is counted once when released.
- Adult NPC portfolios and minor NPC inheritance trusts share hard 6-property / 4-business caps. Overflow liquidates to equity/value rather than disappearing or growing the save without bound.
- NPC asset definition lookups now use precomputed maps and legacy property migration chooses the nearest definition in a linear scan instead of sorting a copied catalog for each migration.

### Predeployment validation

- Engine TypeScript and test TypeScript gates pass.
- NPC Asset Ownership: 82/82.
- Timeline Scaling: 10/10.
- Core 82/82; Estate Planning 46/46; Estate Administration 63/63; Action VFX 42/42; Integrated Long-Life 105/105; every established dedicated regression remains green in bounded local batches.
- Content audit remains unchanged and clean.
- Earlier 50-life family-policy bulk sanity: zero anomalies, zero forced terminal deaths, max NPC peak 443.
- Scale fixture: 600 starting background NPCs + 3,000 timeline entries advanced 12 years with full history preserved, portfolio caps respected, zero organic explicit background holdings, and clean state validation.
- Ad-hoc hosted-sandbox benchmark: 1,000 starting background NPCs + 5,000 timeline entries advanced 20 years in ~1.1 s; world grew to ~1,200 NPCs through ordinary autonomy with zero organic explicit background holdings and zero validation errors.
- Production build passes with 142 transformed modules; main chunk ~981.03 kB minified / 278.92 kB gzip. Existing chunk-size warning remains nonblocking.
- GitHub Actions Run #95 reproduced canonical preflight, certified artifact creation, and Pages deployment on expanded source `62e28aafb190f8b46d10b73fb6dd00985beb724d`; Phase 5C is CI Green.

## Universal derived action VFX candidate — 2026-09-10

### Changed

- Derived consequence VFX are now enabled by default for every gameplay button result that reaches the shared `App.onResult` authority. A real cash decrease therefore emits Money Loss automatically without each screen opting in with `derive:true`; stress, follower, and relationship deltas receive the same systemic treatment.
- `derive:false` remains an explicit escape hatch for exceptional presentation-only cases, but there are currently no production call sites using it.
- Generic special-career Path buttons no longer turn derivation off when a path has no primary domain icon, closing the remaining Politics, Military, Royalty, and Film Directing coverage hole while preserving primary icons for Acting, Music, Sports, Combat, Modeling, Motorsport, and Organized Crime.

### Validation

- Action VFX regression expanded from 38/38 to 42/42, including plain successful spending, failed-but-executed spending, primary-only requests with automatic derived consequences, and explicit opt-out behavior.
- Engine TypeScript and test TypeScript gates pass.
- Core 82/82; every established dedicated regression remains green; Integrated Long-Life 105/105.
- Production build passes with 138 transformed modules. The hosted sandbox cannot finish the monolithic preflight wrapper before its command ceiling, so the same underlying preflight stages were executed in bounded chunks without removing or weakening any suite. GitHub CI remains the independent final authority.

## Visual feedback asset integration — CI Green Run #93 — 2026-09-10

### Added

- Mavyy-supplied Everthread action-feedback artwork is now integrated as a reusable mobile VFX system. Successful acting, music, professional sports, combat sports, modeling, motorsport, organized-crime, chemistry, follower, relationship, and stress-reduction outcomes can emit their matching icon from the actual press location.
- Adverse outcomes can emit supplied stress-increase, money-loss, and relationship-loss artwork from the same press-origin particle layer. Multiple real side effects may share one bounded burst.
- A supplied cash icon now sits beside Current Cash on the Life screen, and the supplied DECEASED stamp overlays dead NPC nodes in People Threadspace without blocking node interaction.
- Dedicated Action VFX regression coverage verifies career-to-icon mapping, supplied asset paths, static icon paths, state-delta derivation, failed-but-executed adverse feedback, success-only primary feedback, deduplication, and chemistry-specific suppression of a redundant relationship-gain icon.

### Changed

- `App` now owns one presentation-only action-feedback controller. Pointer presses capture their viewport origin before engine execution; keyboard activation falls back to the button center. The layer never mutates game state, save data, action economy, or simulation RNG.
- Reduced-motion users receive a short stationary fade/scale rather than the upward confetti motion. Particle counts and lifetime are bounded for mobile performance.
- Supplied artwork is stored as transparent, cropped, mobile-sized runtime derivatives; the heavier action VFX set is lazy/runtime cached while only the small Life cash icon joins the PWA shell precache. Service-worker cache generation advances to `everthread-shell-v8`.
- Build Chemistry uses the supplied person-plus artwork as its explicit primary feedback and suppresses a duplicate heart-plus burst; follower gains reuse the same person-plus artwork.

### Predeployment validation

- Engine TypeScript and test TypeScript gates pass.
- Action VFX regression: 38/38.
- Core: 82/82; every established dedicated regression remained green, including Estate Planning 46/46, Estate Administration 63/63, AI Interaction Testbench 41/41, and Integrated Long-Life 105/105.
- GitHub Actions Run #93 reproduced canonical preflight 4/4 on Node 22.23.2/Linux x64, built 138 modules, published the supplied runtime assets, created the certified preflight baseline, and deployed Pages successfully.
- CI-Green source commit: `de8f9af6a0212a0d90acecf9008afa77b042ac42`.

## Phase 5B — 2026-09-10 — Estate Administration & Settlement

### Added

- Fictional country-sensitive estate administration profiles derived from Everthread's simplified gameplay fiscal context, with protected administration allowances, capped administration costs, levy allowances, and modest settlement-levy rates. These values are explicitly game balance rules, not real-world tax/legal guidance.
- Estate preview breakdown for gross estate, debts, administration, settlement levy, eligible heirs, forced-sale pressure, and the active fictional rule profile.
- Dedicated Phase 5 estate-administration regression with country-rule coverage, read-only/RNG-neutral preview checks, debt-before-levy math, named-bequest protection, investment-before-protected-bequest liquidation, trusts, descendant continuation, and five-generation no-income anti-duplication stress.

### Changed

- Estate obligations now flow through one settlement authority: unsecured debt, administration, and levy are paid before heir allocation. Unassigned indivisible assets may be sold first; liquid investments are used before a specifically named bequest must be sacrificed.
- Smaller estates receive a protected administration allowance so modest specific bequests are not sold solely to fund trivial settlement overhead.
- Descendant-continuation history records settlement administration/levy costs when present. Save schema remains 9 because the new rules are computed rather than persisted.

### Predeployment validation

- Existing Estate Planning: 46/46.
- New Estate Administration: 63/63.
- Family Continuity: 18/18.
- Core: 82/82; AI Interaction Testbench: 41/41; Integrated Long-Life: 105/105; all established dedicated suites passed locally.
- Mixed 100-life bulk sanity: zero anomalies / zero forced terminal deaths, max NPC peak 480.
- Family-biased 100-life bulk sanity: zero anomalies / zero forced terminal deaths, max NPC peak 474.
- GitHub Actions Run #92 reproduced canonical preflight 4/4, all estate and legacy suites, production build, certified preflight artifact creation, and Pages deployment. Phase 5B is CI Green at `926da2fa3c74bac021776d9f1b4825a7a3e39797`.

## 0.12.0 — 2026-09-05 — Full NPC Life Simulation

### Added

- Save schema v9 with persistent `NpcLifeState` biographies covering education, career history, household/finance state, health conditions, legal incidents/custody, public life, housing/moves, and simulation cadence. Existing v8 NPCs initialize deterministically without consuming the player RNG stream.
- Dedicated `NpcLifeSystem` ownership for autonomous NPC education, careers, finance, health, legal status, fame, households, family formation, and death. `RelationshipSystem` retains player↔NPC interactions and relationship milestones instead of accumulating unrelated autonomy logic.
- Autonomous NPC education/credentials, career history, job loss/promotion/retirement, household cash flow, debt servicing, bounded home ownership/appreciation, health histories, legal incidents/imprisonment/release, fame/followers/reputation/scandals, and household relocation.
- Blended-family formation with incoming stepchildren, reciprocal stepfamily links, autonomous adoption for stable low-fertility couples, and bounded family-planning pressure for close-family households.
- Direct adult-descendant handoff of real NPC biography state. Education, career, health, legal, fame, debt/property context, spouse/children, and institutional history survive when an established descendant becomes playable.
- NPC life summaries in People detail sheets, exposing education, career, housing, income, property/debt, health, public/legal history, custody, and household moves.
- Eight-generation dynasty stress coverage plus NPC population metrics in the simulation harness.
- O(1) deterministic Mulberry32 counter jumps. Seeded RNG creation no longer replays every previously consumed random number; regression coverage proves direct jumps match sequential consumption through large counters.
- Deterministic household relocation substreams so considering a move cannot reshuffle unrelated marriage, fertility, health, career, or legal outcomes. Partners and dependent children relocate together.
- Bounded relationship progression for important close-family NPCs so unlucky RNG cannot leave romantic relatives permanently single, dating, or engaged without resolution.
- In-game Reduced Motion now explicitly routes timing minigames to the non-motion sequence mechanic, matching the existing OS reduced-motion behavior.

### Changed

- Background acquaintances retain cheaper autonomy cadence while meaningful family/friend/enemy/romantic relationships automatically receive full simulation, preserving long-life performance without deleting history.
- Memories and hidden opinions influence long-term relationship drift and make emotionally significant persistent NPCs more likely to surface in targeted events.
- NPC-owned housing follows bounded housing-market movement instead of accidental deterministic depreciation; scheduled debt service is included in annual household cash flow before wealth growth.
- Autonomous relocation is household-scoped rather than person-scoped. Current player spouses cannot autonomously move away, and a guardian cannot silently relocate a dependent player without a future player-facing family decision.
- Partner/family progression remains probabilistic in normal years but gains bounded pressure against decades of accidental RNG limbo.
- Simulation reporting now includes average/max lifetime NPC cast so future social systems can be held to a population-growth budget.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 82/82 regression cases pass.
- Eight-generation continuation stress test passes with valid lineage/history and bounded cast growth.
- Neutral 1,000-life bulk population: zero anomalies, zero forced terminal deaths, average/max lifetime NPC cast 116.2 / 176, average lifetime inheritance 125,559.
- Mixed-policy 1,000-life bulk population: zero anomalies, zero forced terminal deaths, average/max lifetime NPC cast 116.3 / 176, average lifetime inheritance 123,442.
- Identical 250-life benchmark improved from roughly 30.0 seconds to 8.3 seconds after deterministic RNG jump optimization with unchanged meaningful aggregate outcomes.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

## 0.11.0 — 2026-09-04 — Persistent Workplaces

### Added

- Save schema v8 with persisted workplace-specific Social World state and real active/historical part-time employment records. Existing v7 careers reconstruct compatible workplace worlds during migration.
- Persistent full-time workplace rosters with managers, coworkers, departments, team groups, workplace morale/culture/tension/reputation, bounded turnover, and senior-character direct reports.
- Workplace actions for collaboration, networking, manager feedback, and formal coworker concerns, all classified through the central action-economy ledger.
- Real part-time jobs with age requirements, hourly pay, hours/week, performance, small persistent workplace rosters, annual income/tax integration, and shared weekly hour capacity around school/full-time commitments.
- Target-aware work events for credit disputes, manager reviews, rumors, team feuds, after-hours connection, formal workplace claims, and bonus pools.
- Regression coverage for employer archival, workplace migration, action limits, part-time capacity/income, evolving coworker relationships, targeted work events, and generation-safe social-world rebuilding.

### Changed

- Promotions within one employer preserve its workplace world; changing employers, resigning, being fired/laid off, or retiring archives the old workplace without deleting former coworkers.
- Work affiliation is independent from `Relationship.type`, so coworkers remain in People → Work after becoming friends, enemies, or romantic connections.
- Standard-career annual performance now responds to workplace morale/reputation/tension and manager relationship; low performance can demote before termination, while eligible performance can produce bonuses.
- Layoffs are distinct from performance firing and respond to employer morale and broader business-demand conditions.
- Retirement closes both full-time and active part-time employment and archives the associated workplaces.
- Generational continuation clears the former protagonist's institutional worlds and reconstructs only the newly controlled descendant's relevant worlds, preventing social-world leakage across generations.
- Work events may treat active part-time employment as valid employment and bind exact affiliated NPC/world payloads.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 71/71 regression cases pass.
- Content audit: 691 events total, including 90 work/career events.
- Neutral 1,000-life bulk population: zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk population: zero anomalies and zero forced terminal deaths.
- Long-process profiling reached 1,000 sequential lives with bounded memory and stable per-life runtime.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

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

### Post-6C household finance / crisis UX correction candidate

- New lives now begin with $0 of personally owned cash while the generated two-parent household remains the source of ordinary childhood support.
- Ordinary living costs and debt service no longer attach to a household-supported player; age 18 now presents an explicit financial-independence decision before independent living costs begin. Purchasing a home establishes financial independence.
- Annual shortfalls still create transparent hardship debt for financially independent adults, but now immediately surface a Financial Pressure event with player-controlled response options. Existing due story events retain priority and defer the finance notice rather than being overwritten.
- Severe hardship no longer silently liquidates investments or auto-files bankruptcy. Bankruptcy remains an explicit player decision through the existing guarded bankruptcy authority.
- Legacy adult saves without the new support flag preserve prior independent-expense behavior. Save schema remains v12.
- Added 21 household-finance/crisis regression checks and updated insolvency regressions to protect player agency. Local engine/test TypeScript, full regression wall, and production build are green.
