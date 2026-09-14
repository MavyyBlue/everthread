# Everthread — Current State

## READ THIS FIRST IN A NEW CHAT

The newest certified expanded **gameplay/source** is **GitHub Actions Run #139** (`34870897923`) on expanded source **`f8ddfe5db0995dceb07969765b34b78f18740e01`**. This is the certified Phase 9A NPC Interests & Preferences baseline on schema 17. The documentation-only synchronization based on it changes no gameplay; after that sync certifies, its expanded docs commit becomes the newest repository source while Run #139 remains the gameplay baseline.

- Package: `everthread-life-unwritten@0.12.0`
- Certified save schema: **17**
- Phase 7 — Persistent World Consequences: **CLOSED**
- Current approved macro program: **Living World Program**
- Phase 8 — Everthread: Home: **CLOSED / CERTIFIED**
- Phase 8A — Everthread Setting Foundation: **CERTIFIED / CLOSED**
- Phase 8B — Town Place Registry & 2D Flat Map: **CERTIFIED / CLOSED**
- Phase 8C — Institution Routing: **CERTIFIED / CLOSED**
- Phase 8D — Player Profile & Personal Inventory: **CERTIFIED / CLOSED**
- Phase 8E — Phase 8 Closeout: **CERTIFIED / CLOSED**
- Phase 9A — NPC Interests & Preferences: **CERTIFIED / CLOSED**
- Exact next implementation slice: **Phase 9B — Shared Experience Foundation**
- Phase 9 — Shared Lives: **ACTIVE**
- Planned Phase 10: **Living Everthread**
- Last successfully reviewed Supabase Feedback Inbox state: **4 total reports; all 4 triage-resolved; no new report rows since 2026-09-13 19:51:36 UTC**.
- Last successful stored review checkpoint remains `e1aa213fac4e03ab9a4af3039d9605852289b899` at `2026-09-14 15:07:04.320301+00` with reviewed-report count 4. Post-Run-#139 read attempts were blocked by connector safety, so no newer inbox/checkpoint state is claimed.
- Real-device player QA after the Run #135 critical recovery hotfix confirmed the original Android failure path works again: Map and People Threadspace load normally, and Player Profile is healthy.

If memory, an older handoff, or a historical chat conflicts with this status, the certified repository wins. Read `LIVING_WORLD_PROGRAM.md` before designing or implementing the next slice.

Last handoff synchronization: 2026-09-14
Repository: `MavyyBlue/everthread`
Default branch: `main`
Public build line: `0.12.0 pre-release`
Certified save schema: `17`
Candidate save schema: none

## Newest certified gameplay/source — Run #139 — Phase 9A NPC Interests & Preferences

- Upload wrapper: `8245a89f919086fcebc82e12880282076a13e5ef`.
- Expanded certified source: `f8ddfe5db0995dceb07969765b34b78f18740e01`.
- GitHub Actions Run #139: `34870897923`.
- Net diff from the prior certified repository source is exactly **38 intended Phase 9A source/test files**. Workflow import reports 39 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, or Phase 9B drift is part of the committed gameplay diff.
- Save schema advances **16 → 17**. `NpcPreferenceSystem` gives protagonist-relevant NPCs stable intrinsic likes/dislikes/occasional aversions while existing Relationship records own what the current protagonist has learned.
- One shared **38-tag** age-aware vocabulary is reused across NPC tastes and existing Phase 8D personal-item preference tags. Profiles are bounded to 4 likes / 3 dislikes / 1 aversion; relationship knowledge is bounded to 8 tags with passive discovery capped at 6.
- Preference generation is deterministic from existing seed + NPC identity through an isolated RNG stream. It does not consume gameplay RNG counters or runtime IDs. Traits bias outcomes without dictating them. Background NPC storage remains lazy until they become protagonist-relevant.
- Schema migration does **not** write learned preference knowledge onto old relationship records. Existing relationship targets receive stable intrinsic profiles, while protagonist knowledge starts from actual post-upgrade play. Rewind/dynasty semantics preserve the NPC's identity while successor protagonists do not inherit someone else's learned social knowledge.
- People profile projection shows only plausibly known tags as Likes / Neutral / Dislikes / Avoids; browsing is read-only and does not expose hidden weights.
- Phase 9A regression **45/45**; canonical preflight **4/4**. Base **82/82**; People **57/57**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 8A **25/25**; Phase 8D **63/63**; Phase 8E **34/34**; Threadspace recovery **10/10**; all established suites remained Green.
- Production build: Vite 7.3.6, **188 modules transformed**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; main JS ~1,206.90 kB / 341.59 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `7ecc001e4c79f113e2f3ac52071fdd1c8d3256ea2eb7cd25720adb19c8cfaca7`.
- Certified dependency SHA-256: `e3bc0b39f962260217d42104c0c8dd802b9f4ae6a46d47013205fab46f610e2e`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10359137007`, digest `60ef75dd3105118723f0af12bcffa173d85c439e55c69c49edbc81f6a7614005`.
- Pages artifact ID `10359321568`, digest `e0234fa05dc501106535fc9694644150181c9203bc48d00fabbeb1734bfb3e1d`; Pages deployment reported success.
- Post-certification feedback read attempts were blocked by connector safety, so the last successfully reviewed state/checkpoint remains the Run #137 snapshot (4 total / 0 unresolved by `triage_status`).
- **Phase 9A is CLOSED / CERTIFIED. Exact next slice: Phase 9B — Shared Experience Foundation.**

## Newest certified gameplay/source — Run #137 — Phase 8E Closeout

- Upload wrapper: `ca6e726ce31896593d0de825e1614ce5e5ca5418`.
- Expanded certified source: `e1aa213fac4e03ab9a4af3039d9605852289b899`.
- GitHub Actions Run #137: `34859549989`.
- Net diff from the prior certified repository source is exactly **7 intended Phase 8E source/test files**. Workflow import reports 8 changed files only because it also removes the uploaded `everthread-source.zip`; no documentation, save-schema, package, content, workflow, or Phase 9 drift is part of the committed gameplay diff.
- `src/core/navigation.ts` centralizes the six primary tabs and six established Assets sections for direct closeout parity coverage. Existing navigation is preserved rather than retired for cleanliness.
- Remaining People/Map secondary controls now meet the established **44px minimum touch target**. No gameplay authority, `GameState`, RNG, runtime-ID, or content count changed. Save schema remains **16**.
- Phase 8E Closeout regression **34/34** proves primary/Assets reachability, all 28 institution routes, canonical Assets action families, browsing purity, schema-14→16 deterministic/idempotent migration, emigration safety, underworld projection semantics, and supported 360/390/412/430px map-camera behavior.
- Canonical preflight passed **4/4**. Base **82/82**; People **57/57**; Map **46/46**; Routing **41/41**; Profile/Inventory **63/63**; Threadspace Load Recovery **10/10**; Phase 8E **34/34**; Dynasty **64/64**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build: Vite 7.3.6, **186 modules transformed**. Map, People, and Player Profile remain independently lazy/code-split. Established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `a9fcef3b305afd578e7ac84e0f3428d5394e9b5c522bd010cce3329d8e7247f1`.
- Certified dependency SHA-256: `a06a60a2ac51e42e9a21e01c9cf8f89828068df4890ec262f7c989e906e9d1a6`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10354132463`, digest `8c4d3f2e6c4b461150870e59b0a8290be66763897992fb5a0a10a3f49bef1a03`.
- Pages artifact ID `10354586748`, digest `08fb8de646d10252a474957d0890d598c28d7e6fa5fb0695679ed13c8d2682c8`; Pages deployment reported success.
- Post-certification feedback sweep: 4 total / 0 unresolved by triage status, no new receipt; stored checkpoint advanced successfully to Run #137 / `e1aa213fac4e03ab9a4af3039d9605852289b899` at `2026-09-14 15:07:04.320301+00`.
- **Phase 8 is formally CLOSED. Exact next slice: Phase 9A — NPC Interests & Preferences.**

## Newest certified gameplay/source — Run #135 — Critical Threadspace lazy-load recovery hotfix

- Upload wrapper: `f454c437a3d1f99691caef0fb1a406666158baee`.
- Expanded certified source: `39523787af658a6907cb82ba0e7b94d964fca82d`.
- GitHub Actions Run #135: `34856517423`.
- Net diff from the prior certified repository source is exactly **7 intended hotfix source/test files**. Workflow import reports 8 changes only because it also removes the uploaded `everthread-source.zip`; no Phase 8E, docs, package, save-schema, or unrelated gameplay drift is part of the committed diff.
- Root cause: stale/missing lazy dynamic chunks could fail while opening People Threadspace, Town Map, or Player Profile; without a screen-level error boundary the React error could escape to the app root and make the header/navigation appear to disappear.
- `LazyScreenBoundary` and `lazyScreenRecovery` now contain lazy-screen failures, allow one guarded automatic recovery reload for recoverable dynamic-import failures, prevent reload loops, and preserve explicit **Reload Everthread** / **Return to Life** escape controls if recovery still fails.
- PWA navigation and JavaScript/CSS code fetches now prefer fresh network responses instead of cache-first stale shell code; the legacy shell cache is purged on activation and an installed replacement worker performs one controlled refresh. People, Map, and Player Profile remain lazy/code-split.
- Save schema remains **16**. No `GameState`, relationship, map, finance, inventory, routing, RNG, runtime-ID, or simulation authority changed.
- Canonical preflight passed **4/4**. Base regression **82/82**; People Threadspace **57/57**; Phase 8B Map **46/46**; Phase 8D **63/63**; Threadspace Load Recovery **10/10**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build: Vite 7.3.6, **185 modules transformed**. Lazy Map ~8.60 kB JS / 3.50 kB gzip; People ~27.46 kB / 8.93 kB gzip; Player Profile ~8.97 kB / 2.67 kB gzip. Main JS ~1,200.22 kB / 339.43 kB gzip; established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `e9f051d99257edd4c4266c1b4d44665630fff0a012ea9c8a04d5da2bd9971fbf`.
- Certified dependency SHA-256: `ddfefb540b8d3931fdf83c45d98018e169a5360e2aac8835517f6cff36ff6fb7`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10352906274`, digest `512e12bbcfea517b8066d58410c4070bdd8e89b12b229b9c3fdaf63d4a23f98a`.
- Pages artifact ID `10352803571`, digest `6f7ce2742ab1b406cf86e030f4269ae70d1e9cecdefc696b0e7abf3963fcd84c`; Pages deployment reported success.
- Post-certification feedback sweep: 4 total / 0 unresolved, no new receipt. Review-state bookkeeping write was blocked by connector safety, so the last successfully stored checkpoint remains the Run #133 / `cf2ede37be5362bc02678a2cc4bec6defa38a837` checkpoint.

## Newest certified gameplay/source — Run #133 — Phase 8D Player Profile & Personal Inventory

- Upload wrapper: `b4fb020a999c38d32d7de0c8acaa408c4b04eb32`.
- Expanded certified source: `cf2ede37be5362bc02678a2cc4bec6defa38a837`.
- GitHub Actions Run #133: `34853113638`.
- Net diff from the prior certified repository source is exactly **44 intended source/test files**. Workflow import reports 45 changed files only because it also removes the uploaded `everthread-source.zip`; no documentation, package, workflow, or unrelated asset drift is part of the committed gameplay diff.
- Save schema advances **15 → 16**. `personalInventory` is a bounded ordinary-possession owner initialized empty for existing saves through deterministic/idempotent migration with no gameplay RNG or runtime-ID consumption.
- `PersonalInventorySystem` owns ordinary non-financial personal possessions only: deterministic browse/eligibility, Cash-only purchase, one exact item instance per successful purchase, discard with no refund, 80-item hard cap, action-economy limits, and invariant repair. It does not own valuable collectibles, property, vehicles, businesses, financing, or net worth.
- Phase 8D adds **24 authored personal items** from Crossroads Mall, Everthread Market, and Nightjar Diner. Ordinary items have no resale/net-worth value and are designed as future gift/keepsake content.
- `PlayerProfileSystem` projects existing identity/location/career/education/relationship/appearance/license/achievement/asset/collectible/inventory truth read-only. One lazy profile sheet opens from both Life and the player's **YOU** node in People Threadspace.
- Valuable collectibles remain authoritative Assets/Estate holdings and appear in the profile by projection only. Descendant continuation starts a successor with empty ordinary personal inventory while existing valuable collectible inheritance remains unchanged. Rewind restores personal inventory and Cash atomically from the snapshot.
- Canonical preflight passed **4/4** stages. Base regression remains **82/82**; Phase 8A **25/25**; Phase 8B **46/46**; Phase 8C **41/41**; Phase 8D **63/63**; Integrated Long-Life **105/105**; every established suite remained Green.
- Production build: Vite 7.3.6, **183 modules transformed**. Lazy `PlayerProfileSheet` is ~8.97 kB JS / 2.67 kB gzip plus ~3.82 kB CSS / 1.01 kB gzip. Main JS is ~1,198.18 kB / 338.73 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `79ee41e57885897f4a1efca5a2de8c51884dd975954de9289f8999fb2ffc835e`.
- Certified dependency SHA-256: `d61b0fdec5af4e67b4dfb9f9b2adf39490aaad091b334635e18db7dd6e48069c`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10352225006`, digest `ddce4db099dca9a0bfca79eef5374dacaab25e1f8e9c5313847f2afc96575030`.
- Pages artifact ID `10351555391`, digest `3a98da45ddcc6069fa4966892c647713f86dc0eb9b9e18a0cd736b6ac1244914`; Pages deployment reported success.
- Post-certification feedback sweep found 4 total reports / 0 unresolved and no new receipt after `2026-09-13 19:51:36.119407+00`; stored checkpoint advanced to `cf2ede37be5362bc02678a2cc4bec6defa38a837` at `2026-09-14 14:06:03.077434+00`.

## Newest certified gameplay/source — Run #131 — Phase 8C Institution Routing

- Upload wrapper: `85a6449e6878c174586f5f61351654bb0b1ff877`.
- Expanded certified source: `5eca77206c61f7af67d1c12f101fd5c986369e0c`.
- GitHub Actions Run #131: `34815580108`.
- Net diff from the prior certified repository source is exactly **17 intended source/test files**. Workflow import reports 18 changed files only because it also removes the uploaded `everthread-source.zip`; the committed gameplay diff contains the intended 17 files and no docs, save-schema, workflow, package, or unrelated asset drift.
- The authored town registry now exposes **28 meaningful institution service doorways across the existing 24 places**. Landmark-only places remain landmarks rather than receiving fake mechanics.
- `src/core/institutionRouting.ts` is the centralized UI routing projection. It resolves place services only into the four mature owner screens — **Life, Assets, Activities, Career** — and never performs bank, property, vehicle, education, healthcare, travel, legal, business, or career actions itself.
- Existing owner screens accept ephemeral route intent and show contextual institution banners/anchors while preserving their own eligibility, progressive disclosure, costs, cooldowns, accounting, consequences, and RNG semantics. Seeing a building never grants permission to bypass the owning system.
- Central Everthread Bank routes established money, credit/banking, bills/payments, and investments; Loomline Motors routes vehicle marketplace/ownership; Hearthline Realty routes home marketplace/ownership; schools/college route Education; Hospital/Gym route existing health/wellness; Airport routes travel; City Hall routes Politics/business; justice facilities route the existing legal/corrections surface; career venues route their established special-career worlds; Loomworks routes ordinary employment/business; Blackline routes organized crime only after its existing discovery rule exposes the place.
- Routing requests, banners, selection, and anchors remain UI-only. `GameState`, physical `countryId/city` authority, map camera state, runtime IDs, RNG counters, and save format are unchanged. Save schema remains **15**.
- Canonical preflight passed **4/4** stages. Base regression remains **82/82**; Phase 8A **25/25**; Phase 8B **46/46**; new Phase 8C Institution Routing regression **41/41**; Integrated Long-Life **105/105**; every established suite remained Green.
- Production build: Vite 7.3.6, **178 modules transformed**. Authored map remains bundled at ~405.17 kB. `TownMapScreen` remains code-split at ~8.60 kB JS / 3.50 kB gzip plus ~7.69 kB CSS / 1.91 kB gzip. Main JS is ~1,187.72 kB / 335.72 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `5615d7382b8170be942c825f2c5d8def3a3a2855ce5411e389a4ae9782884db7`.
- Certified dependency SHA-256: `2473833386b3e3c4e26825181751dfe3352f4787117e0780806fb27e91ad4e7e`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10336258752`, digest `c0ce8f6248bcdc113cc6f89c5f38b7c228265c39b6b60c607cb76768a59a6a65`.
- Pages artifact ID `10336585276`, digest `574d8f039938b3b3c46fb161d531b046f16d637515c9312c10016c7bb872d38f`; Pages deployment reported success.
- Post-certification feedback sweep found no new report rows; stored review checkpoint advanced to `5eca77206c61f7af67d1c12f101fd5c986369e0c` at `2026-09-14 06:58:41.568166+00` with reviewed-report count 4.

## Newest certified gameplay/source — Run #129 — Phase 8B map artwork / Threadspace presentation correction

- Upload wrapper: `9929dc02a48a92048e724c55c23441f5d1b1384b`.
- Expanded certified source: `109438ec2d50308c62c061a1c6bed7e0849e157b`.
- GitHub Actions Run #129: `34813478003`.
- Net diff from the prior certified repository source is exactly **6 intended map files**: the authored map artwork, recalibrated place coordinates, `TownMapScreen`/CSS, map projection math, and the Phase 8B regression. No save-schema, finance, relationship, career, workflow, package, or unrelated asset drift.
- The player-supplied authored artwork is bundled as `src/assets/everthread-town-map.png` and is the map's native **1536×961** world-coordinate plane. The prior synthetic road/district rendering is no longer the visual map surface; district definitions remain semantic registry metadata.
- Map Threadspace now uses the same edge-to-edge workspace model as People Threadspace: the map is flush beneath the header and above the bottom navigation rather than sitting inside an inset bordered card. Initial camera uses cover/fill behavior; **Fit Map** remains available for the complete-town overview.
- All **24 place markers** were recalibrated against recognizable regions of the authored artwork while retaining the existing place IDs/categories/authority boundaries.
- Canonical preflight passed **4/4** stages: Engine TypeScript, Test TypeScript, complete regression wall, and production build.
- Dedicated Phase 8B regression expanded to **46/46**. Phase 8A remains **25/25**; Integrated Long-Life remains **105/105**; all established suites remained Green.
- Production build: Vite 7.3.6, **176 modules transformed**. The bundled map image is ~405.17 kB; `TownMapScreen` remains lazy/code-split at ~18.76 kB JS / 6.06 kB gzip plus ~6.65 kB CSS / 1.75 kB gzip. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `d4af50b0cd89a4903216fa142e6f2e724b63e6f85935dbb4ad503fa47fd995ee`.
- Certified dependency SHA-256: `d3838ea7d4c36879308e87b144b6eab065387b8c1f1a91540137eeff7935b2dd`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10336025996`, digest `ff5ca3e3c5b74469b1f08092ed0e3262155743099f23617f307285272843edb4`.
- Pages artifact ID `10335706833`, digest `af9836db0812c8a187ad3d2d0fb320fea8809dfc74305b3fbe4567ad9bb009c9`; Pages deployment reported success.

## Certified Phase 8A — Everthread Setting Foundation

Phase 8A establishes Everthread as the canonical home setting without rewriting mature location-dependent systems or creating parallel truth.

- `countryId` / `city` remain the single physical/legal/economic location authority used by travel, education, finance/economics, estate rules, world conditions, SocialWorlds, careers, and other location consumers.
- Everthread is a fictional `CountryDefinition` compatibility jurisdiction with canonical city label `Everthread`. New player-facing lives begin there; the New Life UI no longer asks the player to select a real-world country.
- Cultural naming origin is now represented separately by hidden `namePoolCountryId`. It drives procedural name/gender-name inference where appropriate and is not presented as residence.
- Existing saves migrate **14 → 15** deterministically: the protagonist's current local context moves to Everthread, local NPCs/current active SocialWorlds/current active country conditions follow that context, remote NPCs and archived/historical records remain historical, and old travel history is retained.
- Migration and every-load naming normalization consume no gameplay RNG and allocate no runtime IDs. Remigration is idempotent; later emigration survives subsequent loads instead of being forced back to Everthread.
- Dynasty continuation preserves the successor's naming profile separately from physical location.
- Everthread uses the established North-American-style school profile as a compatibility bridge for current education rules.
- Travel/location copy uses one `locationLabel` projection so Everthread is not rendered as `Everthread, Everthread`.
- Executable country definitions increase **32 → 33**: Everthread plus the existing 32 real-world travel/emigration destinations and hidden naming-profile sources. Regional name-pool count remains 7.

This setting ownership split remains a compatibility boundary beneath Phase 8B. Do not turn `namePoolCountryId` into a second residence field and do not replace `countryId/city` with a parallel town-state ledger in later map/routing work.

## Certified Phase 8B — Town Place Registry & 2D Flat Map

Phase 8B makes Everthread a first-class, mobile navigation surface without creating a second simulation.

- `src/data/townPlaces.ts` is the single authored static registry: **24 stable places across 6 districts** on the authored map's native **1536×961** coordinate plane. Every place has a stable ID, label/short label, category, district, description, activity tags, visibility rule, importance, map metadata, and optional routing metadata.
- Required location families are represented: Central Everthread Bank, dealership, realty/leasing, residential district, mall, diner, park, grocery, school, college, hospital, gym, film studio, modeling agency, speedway, stadium, military base, City Hall, courthouse/public safety/prison, air terminal, business district, and the discoverable Blackline Freight Yard.
- `TownMapSystem` is a **read-only projection** owner for map discovery/filtering/camera math/culling/semantic view only. It does not mutate simulation truth, consume gameplay RNG, allocate runtime IDs, or persist camera/search/filter/selection state.
- The Map is a sixth primary mobile tab and `TownMapScreen` lazy-loads separately. The player-supplied authored town artwork is the real visual map surface; the Threadspace workspace is edge-to-edge beneath the header and above bottom navigation, with cover/fill on entry plus Fit Map for full-town overview. Interaction supports touch pan, pinch zoom, wheel zoom, large markers, search/category filters, zoom-based marker/label disclosure, viewport culling, and bottom-sheet place details with no hover dependency.
- Blackline Freight Yard discovery derives from existing organized-crime participation or meaningful legal state; there is no separate discovered-place ledger.
- Players who emigrate can still browse Everthread as their hometown projection; the map never rewrites authoritative `countryId/city`.
- Place `route` metadata points only at mature existing screens. **Phase 8B does not execute bank/property/career/etc. actions from the map.** Those owners remain unchanged until 8C.
- Save schema remains **15**. No migration was required.

## Approved next slice — Phase 9B: Shared Experience Foundation

Phase 9A is certified. Build one reusable shared-experience evaluator shaped around the exact player, exact NPC, relationship context, place, activity, and the 9A preference vocabulary. RelationshipSystem remains authoritative for relationship changes; NPC memories remain authoritative for meaningful remembered history.

Do not jump ahead to childhood/youth social expansion, dating momentum, inventory gifts, or cross-world chemistry until 9B is independently certified and synchronized.

## Feedback queue snapshot after Run #139 / `f8ddfe5d…`

- Supabase contains **4 report rows**; all 4 are triage-resolved and no new report row has appeared since `2026-09-13 19:51:36.119407+00`.
- Review checkpoint key `main` successfully advanced to `e1aa213fac4e03ab9a4af3039d9605852289b899` at `2026-09-14 15:07:04.320301+00` with reviewed-report count 4.
- The post-Run-#139 live read attempt was blocked by connector safety, so no newer queue state is claimed. Last successfully reviewed state remains four triage-resolved reports and no known item preempted Phase 9A. Before 9B implementation, retry the live inbox read if the connector permits.

## Phase 7C baseline preserved beneath Phase 8B

Phase 7 remains closed. `WorldConditionSystem` remains the sole bounded world-condition owner; ConsequenceSystem remains the sole persistent consequence scheduler; all Phase 6 finance/credit/asset/accounting guarantees and the established family/NPC/career authorities remain intact. Phase 8A changed setting semantics only where required and certified the complete regression wall before becoming baseline.

## Phase 6 closeout guarantees

Phase 6A–6C plus the post-6C household-finance correction remain certified foundations. Preserve these behaviors in the closed Phase 7 baseline and in any future work chosen after brainstorming:

- Cash, revolving credit, assets, debt, and estate value remain distinct accounting concepts.
- Personal borrowing uses shared underwriting and real FinanceSystem liabilities; bankruptcy is an explicit guarded player decision, never a silent score reset.
- New generated lives begin with $0 personally owned cash. Ordinary supported-child costs belong to the supporting household rather than becoming hidden player debt.
- Financial independence is explicit state. Age 18 surfaces a player decision before ordinary independent living costs begin; home ownership establishes independence.
- Independent annual shortfalls may create labeled hardship debt and a player-facing Financial Pressure event. The player may reduce debt, review bankruptcy options, or carry the debt.
- Severe hardship never silently liquidates investments or automatically files bankruptcy.
- Due delayed stories retain priority over a newly created financial-pressure notice; finance consequences must not overwrite unrelated story continuity.
- System-owned milestone/crisis events remain outside the established 691-event random library.

## Phase 7B1 — Family, Parenting, School & Relationship systemic delayed stories — certified

Certified in Run #115 / `f417403ff8a091f92f823c074d6a132dd27b90aa` on save schema **13**.

The first 7B1 slice is intentionally action-driven rather than another random-story pool. Five real player actions can now request exact future consequences through the certified scheduler:

- spending time with a child → a two-year parenting-memory follow-up on that exact child;
- taking an academic shortcut → a two-year school-record follow-up on that exact persistent `SocialWorld`;
- arguing with a friend/best friend → a two-year conflict-memory follow-up that can still find the same person if the relationship later evolves;
- reconciling with an ex → a two-year second-chance check-in requiring the exact relationship to remain romantic;
- marrying → a three-year expectations check-in requiring the exact spouse to still be the spouse.

`SystemicStorySystem` is a request bridge only. It stores no state and owns no queue. `ConsequenceSystem` still owns ordering/dedupe/validity/history; RelationshipSystem still owns relationships; NPCs own memories/opinion; SchoolWorldSystem/SocialWorld own school truth. Invalid exact targets cancel deterministically instead of being replaced.

The new probability-zero `systemicConsequenceEvents` registry stays outside the 691 random definitions. `ChoiceEffect.school` lets a delayed school decision modify the exact targeted school record, so conduct/social-standing consequences flow into the existing admissions profile. Event rendering resolves the school name from `worldId`; no copied school identity is persisted in story state.

Dedicated 7B1 regression is **33/33** in canonical Run #115. Both TypeScript gates, complete regression wall, Integrated Long-Life 105/105, Phase 7A 36/36, Random-event Coherence 77/77, minigame 19/19, feedback suites, global invariants, certified artifact restore smoke, and production build at **167 modules** are green. The long-life harness resolves scheduler-required same-age backlog before retrying Age Up, preserving certified Phase 7A gating.

Phase 7A, all Phase 7B slices, and Phase 7C are certified baseline behavior. **Phase 7 is closed.** The required brainstorm has now occurred; post-Phase-7 implementation must follow the Mavyy-approved `LIVING_WORLD_PROGRAM.md` unless he changes direction.

## Green systems immediately relevant to current work

- Phase 4 remains closed; persistent career ecosystems, coherence closeout, random-event consequences, AI Interaction Testbench, and People Threadspace are green.
- Phase 5A estate/family-continuity foundation is green and must be extended rather than replaced.
- Phase 5B estate administration is CI Green in Run #92: fictional country-sensitive administration/levy rules, one-authority obligation settlement, preview breakdown, named-bequest protection, and five-generation anti-duplication stress are now baseline behavior.
- Universal derived consequence VFX, the Run #96 timeline/VFX playtest hotfix, Phase 5C NPC-owned assets/businesses, Phase 5D broader family topology, Phase 5E dynasty transition, and the complete Phase 6 stack remain certified foundations through Run #106.
- Run #69 visual identity is green; supplied player crest art remains authoritative and must not be regenerated/restyled without Mavyy's request.
- Runs #70–#72 established reproductive compatibility, NPC gender/reproductive identity, Family Planning profile ownership, immediate Threadspace invalidation, Activities → Social Meet Someone, uniform standalone adoption control, and expanded regional name pools.
- Run #74 established the Sandbox-only secret-code system. Code `9426` creates one persistent Yuki Aster friend through normal NPC/relationship authority, supports ordinary romance/family progression, preserves age gates and reproductive compatibility, consumes no simulation RNG, and is idempotent per life.

## Current corrective program

Long-form playtesting exposed several real scale/coherence issues. Their authoritative sequence and status live in:

`PROJECT_HANDOFF/POST_RUN74_DIAGNOSTIC_POLISH.md`

Do not reorder or combine these slices casually. Each slice should reach CI Green before the next one is promoted unless a discovered dependency makes the ordering unsafe.

Current status:

1. **Save / rewind scaling — CI Green (Run #75).**
2. **Player partner/spouse ↔ NPC household coherence — CI Green (Run #77).**
3. **NPC health / mortality semantics — CI Green (Run #79).**
4. **Age-aware reproduction — CI Green (Run #80).**
5. **NPC gender / sexual-orientation coherence — CI Green (Run #81).**
6. **Collision-aware naming — CI Green (Run #82).**
7. **Relationship/event microcopy polish — CI Green (Run #84).**
8. **Integrated long-life QA — CI Green (Run #88).**

## Slice 1 implementation — CI Green

`RewindSystem.ts` now owns bounded rewind retention and capture policy:

- maximum 10 recent yearly rewind points;
- maximum 6,000,000 combined snapshot characters while retaining at least the newest point;
- duplicate ages keep the newest captured version;
- malformed entries are discarded;
- snapshots remain self-contained JSON with `yearlySnapshots` and the transient `ageUpLocked` runtime guard removed before encoding, preserving exact restore semantics without recursive history.

`SaveSystem.migrateSave()` normalizes rewind arrays for old and current schema-9 saves before cloning the rest of the loaded state, avoiding unnecessary duplication of legacy oversized snapshot arrays. Save schema remains 9.

`importSave()` temporarily accepts legitimate pre-fix exports up to 40,000,000 characters so they can be loaded and immediately normalized; this is a recovery ceiling, not the new desired steady-state save size.

A dedicated `rewindScalingRegression.ts` covers count/budget retention, duplicate-age handling, malformed records, live capture, Age Up + rewind restoration, oversized legacy import recovery, and current-schema normalization.

Local checks completed before packaging:

- changed TS files transpile with zero syntax diagnostics;
- `RewindSystem.ts` passes standalone strict TypeScript checking;
- source-integrity reconstruction for modified `SaveSystem.ts`, `AgingSystem.ts`, and `runRegression.ts` matches the exact Run #74 Git blob hashes after removing only intended edits;
- applying the new retention algorithm to the supplied diagnostic save projects an approximately 64% export-size reduction while retaining recent rewind points.

Run #75 passed both TypeScript gates, every established regression, Rewind Scaling 16/16, production build, Pages artifact upload, and live deployment. Slice 1 is **CI Green**.

## Slice 2 implementation — CI Green

Root cause: `NpcLifeSystem` already knew whether an NPC had an active player romance for autonomous matchmaking, but household state only treated `npc.partnerId` as partnered. Player romance is authoritative in `state.relationships`, while `npc.partnerId` belongs to NPC-to-NPC partnerships, so player spouses could remain `independent` with stale `family` housing.

The pending Slice 2 overlay:

- adds a single `syncNpcHouseholdProjection()` authority in `NpcLifeSystem`;
- projects a living adult player partner/fiance/spouse as `partnered`, using `shared` housing when they do not own property;
- never writes the controlled protagonist into `npc.partnerId`, and removes legacy player-character partner IDs if encountered;
- preserves real NPC-to-NPC `partnerId` relationships;
- preserves NPC-owned property as `owning` through relationship transitions;
- gives custody/institutional state and minor/dependent state priority over romance;
- immediately resynchronizes household state after Ask Out, Proposal, Marriage, Breakup, Divorce, Reconcile, and discovered-infidelity relationship endings;
- restores `maritalStatus='dating'` on successful reconciliation instead of leaving a stale divorced status;
- keeps completed-player-death survivors independent rather than allowing an old spouse relationship record to resurrect shared housing on load;
- works through descendant continuation: when an NPC spouse becomes spouse of the new controlled descendant, the obsolete NPC-to-NPC pointer to the now-player character is removed and household state is rebuilt from player relationship truth;
- uses no new persisted structure and adds no new main-RNG draw, so save schema remains 9.

A dedicated synthetic `npcHouseholdCoherenceRegression.ts` passes **36/36** in Run #77 across dating, engagement, marriage, divorce, reconciliation, breakup, ownership, stale-save repair, custody/release, NPC-to-NPC couples, player death, teen relationships, and descendant continuation. The supplied real save was used only as diagnosis: under the green logic its stale spouse household projects as `partnered/shared`; none of its private seed/IDs/history are shipped in fixtures.

Run #76 failed only because the new regression held TypeScript-narrowed object references across mutations. The corrective Run #77 test re-reads authoritative state after each mutation; production Slice 2 logic was unchanged. Run #77 passed both TypeScript gates, all regressions, production build, Pages artifact upload, and live deployment. Slice 2 is **CI Green**.


## Slice 3 implementation — CI Green

Root cause: NPC health can clamp to `0` during ordinary aging/condition drain, but the existing death path remained probabilistic (maximum 55%) and background odd-year simulation returned before any mortality resolution. This allowed living NPCs at zero health to persist.

The green Slice 3 implementation:

- defines health `<= 0` as terminal during NPC simulation while keeping any positive health probabilistic/survivable;
- routes terminal health through the existing centralized NPC death cleanup rather than an invariant-side kill;
- resolves zero health before unrelated annual processing and immediately after health degradation;
- closes the background odd-year skip that could leave a zero-health NPC alive;
- makes defensive NPC death handling idempotent, preventing duplicate inheritance/death cleanup;
- preserves existing age/illness mortality pressure for positive-health NPCs;
- repairs legacy/current schema-9 living zero-health NPCs to health `1` during load, avoiding a build-update mass death while eliminating the contradictory state;
- leaves already-dead zero-health NPCs unchanged;
- adds validator coverage for any future living terminal-health contradiction;
- keeps save schema at 9 and introduces no persisted field.

Dedicated `npcHealthMortalityRegression.ts`: **18/18 checks passed in Run #79**. NPC Household Coherence remained **36/36**, every established regression stayed green, and the production build, Pages artifact, and live deployment passed. The real diagnostic save was used only as diagnosis: its 7 living zero-health NPCs normalize to living health-1 critical NPCs on import, with no remaining living terminal-health records and 7 rewind snapshots retained. Slice 3 is **CI Green**.


## Slice 4 implementation — CI Green

`ReproductionSystem` now owns one shared reproductive-age factor for player and NPC biological family planning. The existing stored fertility stat and young-adult annual chance remain the baseline; age multiplies the chance rather than mutating fertility. Female reproductive-age pressure increases materially through later adulthood and reaches zero at 53, while male decline is slower and extends beyond the old autonomous-NPC age-52 cutoff.

`biologicalChildGate()` now exposes `ageFactor` and `conceptionChance`. When the age factor reaches zero the biological path is disabled with adoption still available; this rejection happens before the child-attempt action or RNG stream is consumed. Viable attempts retain the same one chance draw and pregnancy timing/multiples flow as before.

`NpcLifeSystem` removes the blunt `npc.age>52||partner.age>52` family cutoff and multiplies autonomous biological family pressure by the same pair age factor. Its bounded long-marriage biological fallback now requires meaningful age-adjusted fertility, preventing the fallback from overriding age viability. Existing autonomous adoption rules are otherwise unchanged.

People → Family Planning gives qualitative feedback when reproductive age materially reduces conception odds; it does not expose the simulation weight as medical advice. No new persisted state, no schema bump, and no additional main-RNG draw.

Dedicated `ageAwareReproductionRegression.ts`: **21/21 checks passed in Run #80**, covering the shared curve, baseline preservation, player gates/chance, blocked-attempt economy/RNG safety, adoption, older-male viability, nonbinary reproductive-sex authority, pregnancy timing, and autonomous NPC family behavior. Every established regression stayed green; production build, Pages artifact upload, and deployment also passed. Slice 4 is **CI Green**.

## Slice 5 implementation — CI Green

Root cause: procedural NPC factories chose `sexuality` independently from the gender identity later established by `NpcIdentitySystem`, while player romance still used a deliberately permissive compatibility placeholder. This allowed contradictory generated labels (for example, a male NPC generated as lesbian) and let player/autonomous romance ignore persisted orientation.

The local Slice 5 work introduces `NpcOrientationSystem.ts` as one shared authority:

- generated orientation is coherent with the NPC's already-established gender identity, not reproductive sex;
- generator normalization is **creation-only**. Existing/authored NPC sexualities are not rewritten by `ensureNpcLife()` or save migration, preserving established save history;
- generated orientation uses an NPC-scoped deterministic RNG substream, so assigning orientation does not consume the main simulation RNG stream;
- `straight`, `gay`, `lesbian`, `bisexual`, and `pansexual` attraction semantics are modeled against gender identity;
- asexuality is treated as sexual orientation, not automatically aromantic: asexual characters may still form romantic relationships because Everthread does not yet persist a separate romantic-orientation field, while sexual compatibility remains false;
- nonbinary generation uses coherent bisexual/pansexual/asexual labels rather than forcing binary-only labels;
- `playerNpcRomanticallyCompatible()`, `playerNpcSexuallyCompatible()`, and `npcNpcRomanticallyCompatible()` centralize mutual compatibility;
- `pickRomanticTargetGender()` selects a target gender the initiating orientation can actually be attracted to.

Integration completed locally:

- new-life parent creation;
- Meet Someone and newly created children;
- autonomous NPC partners and children;
- school-world NPCs;
- workplace NPCs;
- standard special-career world NPCs;
- combat-career world NPCs;
- military-career world NPCs;
- politics-career world NPCs;
- player Ask Out availability/engine validation;
- player Hook Up availability/engine validation;
- People profile Orientation display.

Existing romances are not retroactively dissolved. Reconciliation remains available to established exes so legacy relationship history is not invalidated merely because the newer compatibility authority exists.

`9426` receives no special bypass: Yuki Aster keeps her authored female + pansexual identity and passes the same ordinary romance compatibility authority as every other NPC.

Dedicated local `npcOrientationCoherenceRegression.ts`: **37/37 checks passed** before this handoff packaging checkpoint. Adjacent local suites also remained green: Family Reproduction 51/51, NPC Household Coherence 35/35, NPC Health / Mortality 18/18, and Age-Aware Reproduction 21/21. A 200-seed deterministic new-life audit produced 0 incoherent generated orientation labels and 0 incompatible generated parent couples while retaining main-RNG parity.

The supplied diagnostic save was used only for validation and is **not included** in this handoff bundle. Its 9 existing gender/orientation oddities remained 9 after the local Slice 5 logic (no historical rewrite); Yuki remained female + pansexual and ordinarily romance-compatible; rewind normalization remained at 7 snapshots.

Run #81 (`34539481495`) passed both TypeScript gates, core regression 82/82, dedicated NPC orientation coherence 55/55, every adjacent regression, production build, Pages artifact upload, and deployment. The overlay expanded into `f5f09267bf430695ab6bf5478232522c1274e76d`. Slice 5 is **CI Green**.

## Slice 6 implementation — CI Green

Collision-aware naming now has one creation-time authority in `NpcNamingSystem.ts`. It preserves the original regional/gender bucket selected by the first random draw, then resolves avoidable first-name/full-name collisions deterministically without retry RNG. Existing NPC names and legacy saves are never rewritten.

Integration covers new-life parents, Meet Someone, player births/adoption, autonomous NPC partners/children, school rosters, workplace rosters, standard special-career worlds, combat, military, and politics. Intentional family surnames remain fixed while the first name is resolved. Save schema remains 9.

Run #82 (`34540916777`) passed both TypeScript gates, core regression 82/82, NPC orientation coherence 55/55, collision-aware naming **32/32**, every established adjacent regression, production build, Pages artifact upload, and live deployment. The overlay expanded into `7e86c3a9d5fa56a03d3b760b4305a92bf92f789b`. The earlier handoff note that said 33 naming checks was a bookkeeping error; the actual repository suite contains and passed 32 checks. Slice 6 is **CI Green**.

## Slice 7 implementation — CI Green

Run #83 (`34542005844`) imported the initial Slice 7 overlay and expanded it to `1ec4d6397ee39857d649bb9440cbe92c731e150f`, then failed at the engine TypeScript gate before regressions/build. Root cause: the new `as const` interaction-effect map inferred a union whose entries without `karma` did not expose an optional `karma` property at `spec.karma`. The correction preserved the same 13 action keys and all runtime values while giving the effect map an explicit shared `{base:number; happiness:number; karma?:number}` value type. No simulation behavior changed.

Root cause: `interactWithNpc()` projected internal action IDs directly into two generic English templates for timeline and NPC-memory text. That produced grammatical output such as `You conversation with ...` and `Alex chose to compliment.` even though the underlying interaction outcomes were correct.

The green implementation keeps the interaction engine untouched and adds explicit copy projection only:

- all 13 existing relationship interaction actions now have natural action-specific timeline and NPC-memory wording;
- examples include `You had a conversation with Nora.`, `You complimented Nora.`, `You spent time with Nora.`, `You apologized to Nora.`, and `You argued with Nora.`;
- money, gift, fight, counseling, and vacation actions receive equally explicit wording rather than relying on underscore replacement;
- `RelationshipInteractionAction` is derived from the authoritative interaction-effect table, and the copy table is typed against that union so adding a new effect without copy becomes a TypeScript error;
- relationship score changes, happiness/karma effects, money transfer logic, action economy, RNG draws, memory kind/sentiment/permanence, timeline importance/category, and all milestone/romance logic remain unchanged;
- save schema remains 9 and no persisted field changes.

A focused `relationshipMicrocopyRegression.ts` exercises every interaction verb through both the pure copy projection and the real `interactWithNpc()` path, checking successful execution plus exact timeline and NPC-memory wording. Run #84 (`34542840262`) passed both TypeScript gates, core 82/82, Relationship Microcopy **66/66**, every established regression including orientation 55/55 and naming 32/32, production build, Pages artifact upload, and deployment. The corrected overlay expanded into `2487a0bc79abc16473cb91e74f220071e4b23959`. Slice 7 is **CI Green**.

## Slice 8 implementation — CI Green

The final corrective slice began as regression-only, then correctly exposed one fixture-only TypeScript issue plus two layers of long-life family-population growth.

Run #85 (`34544430607`) exposed only fixture TypeScript narrowing. Run #86 (`34544985042`) reached runtime and exposed erroneous full-tier ownership for unrepresented distant descendants. Run #87 (`34545986347`) proved that first production fix was incomplete, with the unchanged `<500` retained-cast guard reporting a concrete maximum peak of 513 NPC records.

The final production correction in `NpcLifeSystem`:

- makes a newborn's own representable player relationship authoritative for full/background simulation tier;
- repairs legacy unrepresented descendants that were persisted as full-tier back to background cadence during ordinary annual simulation;
- allows those background descendants to keep aging, working, partnering, and retaining genealogy;
- prevents unrepresented background descendant branches from recursively producing further invisible generations unless they later become meaningful/player-facing and are promoted back to full simulation;
- preserves existing NPC records and parent/child links;
- keeps save schema 9 and does not alter ordinary player-facing/full-tier RNG behavior.

Run #88 (`34546954038`) expanded to `9ed003f97cf16c1df22ac44506d62766681dfc38`. Both TypeScript gates passed, every established regression remained green, and Integrated Long-Life completed **105/105 runtime checks** with the original `<500` family-population guard unchanged. Production build, Pages artifact upload, and deployment all passed. Slice 8 and the complete post-Run-74 corrective program are **CI Green**.

## Canonical pre-deployment QA — active infrastructure

The QA bootstrap is complete and active. `scripts/everthread-preflight.mjs` orchestrates the engine typecheck, test typecheck, complete regression wall, and production build through `npm run preflight`; `npm run preflight:deep` adds the content audit and bulk simulation. The runner emits `.everthread/preflight-report.json` on pass or failure.

GitHub installs the committed lock with `npm ci`, calls the same canonical preflight, and publishes a 90-day certified preflight artifact containing the exact tracked source plus the locked Linux-x64/Node-22 dependency tree and separate source/dependency/lock hashes. The combined artifact was proven restorable for offline sandbox verification during Run #91 bootstrap and is now refreshed after every green candidate. Predeployment Green reduces bad uploads; CI Green remains the release authority. See `PROJECT_HANDOFF/PREFLIGHT_QA.md`.

## Known continuing quality / architecture issues

- NPC gender/sexual-orientation coherence is CI Green in Run #81.
- Player-romance/NPC-household projection correction is CI Green in Run #77.
- NPC zero-health terminal semantics are CI Green in Run #79.
- Age-aware biological conception is CI Green in Run #80.
- Collision-aware naming is CI Green in Run #82.
- Relationship interaction microcopy is CI Green in Run #84.
- Integrated long-life QA is CI Green in Run #88 at 105/105 runtime checks; the post-Run-74 corrective program is closed.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- The production application chunk remains above the preferred size threshold; broader code splitting remains future work.
- GitHub Actions Node-20-targeted action warnings remain nonblocking technical debt.

## Post-Run #104 household-finance correction — certified Run #106

The player-reported childhood/support-debt and financial-crisis visibility correction is certified in Run #106 / expanded commit `5e8fd2cd51199b66e1239ecdd0fecf527f49c6c6`. Newborn personal cash is $0; household-supported living costs do not become protagonist debt; adulthood financial independence is explicit; hardship is surfaced through player-facing choices; silent automatic bankruptcy is removed; and due delayed stories retain priority. Save schema remains 12. Run #105 is excluded because its incorrectly named bundle was never imported.
