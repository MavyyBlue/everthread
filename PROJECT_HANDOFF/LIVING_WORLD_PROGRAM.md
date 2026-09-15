# Everthread — Living World Program

Status: **CLOSED / CERTIFIED. The Mavyy-approved Living World Program completed Phases 8, 9, and 10 in Run #166. Post-closeout Runs #168, #170, #172, and #174 add approved presentation/character-visual/mobile-UX work without reopening the program. Character Visual is a separate approved feature direction, not Phase 11.**

Approved: 2026-09-13 after Phase 7 closeout. Closed: 2026-09-15 after Run #166.

Final certified program baseline:
- final certified Living World Program gameplay/source: Run #166 / `7523f6919ad808f7d826c42cd471d61e1f4f4678`;
- newest certified post-closeout gameplay/source: Run #174 / `69117c363124615a35683d03cbc0ab7a06472c06`;
- package: `everthread-life-unwritten@0.12.0`;
- certified save schema: **17**;
- Phase 7: **closed**;
- Phase 8A–8E / Phase 8: **certified / CLOSED**;
- Phase 9A–9G / Phase 9: **certified / CLOSED**;
- Phase 10A–10E / Phase 10: **certified / CLOSED**;
- pre-10E player-tested correction gate: **certified / closed (Runs #162–#163)**;
- final Map-memory feedback polish: **certified / closed (Run #166)**;
- current approved feature direction: **Character Visual**, developed as certified slices outside the closed Living World Program; no Phase 11 label is implied.

This remains the authority-boundary record for the closed Living World Program. Future work must preserve these certified contracts unless Mavyy deliberately reopens a design decision with migration/QA coverage.

Post-closeout certification notes: Run #168 (`34973140255`) integrates the approved Astra presentation iconography and repairs Appearance/theme reactivity. Run #170 (`35001748216`) establishes the player Character Visual foundation on `ef87fb8011b8ec9d6dc606c328db9b1c0882d942`: one existing appearance authority, deterministic/RNG-neutral enrichment, a mobile New Life creator, and a lazy modular portrait renderer. Run #172 (`35006276096`) certifies the narrow-phone New Life responsive-width hotfix on `5cf52a39d79f0835c2d9682e21d40c9ace7498c1` with a dedicated 8/8 layout regression and no simulation/save/schema changes. Run #174 (`35016561442`) certifies deterministic NPC portrait identity and relationship-based reveal on `69117c363124615a35683d03cbc0ab7a06472c06` while keeping identity on existing NPC records, learned reveal knowledge on existing Relationships, background visuals lazy, and descendant portrait continuity intact. None of these slices reopens the Living World Program or creates a macro phase.

## North star

**Everthread becomes a place. Relationships become shared experiences. The town remembers the lives lived inside it.**

Everthread should become the fictional town where the player's life takes place. Threadspace answers **who** matters. The Everthread map answers **where** life happens. The player profile/inventory answers **what the player owns, carries, collects, or can give**. Existing simulation authorities still decide **what the action means and what changes afterward**.

## Program-wide rules

- Player intent comes first. Physicalizing systems must reduce abstraction without creating navigation tax; contextual shortcuts remain valid.
- The map is a projection/navigation surface, not a second simulation or second source of truth.
- Finance/Credit, Property/Assets, Business, Education/SchoolWorld, RelationshipSystem, NPC memories, SocialWorlds, special-career systems, and ConsequenceSystem retain their established ownership.
- Map pan/zoom/filter/selection state stays outside `GameState` unless durable simulation meaning is explicitly justified.
- Browsing, previews, recommendation lists, migrations, and read-only projections do not consume gameplay RNG.
- Shared experiences can be excellent, mediocre, awkward, rejected, or surprising. Do not expose raw weights until NPCs become optimization spreadsheets.
- Histories, memories, location projections, and background simulation remain bounded for century-long lives and many generations.

# Phase 8 — Everthread: Home

## Intent

Turn Everthread from the title of the game into the canonical setting, then make the town a first-class mobile navigation surface over the mature simulation. Phase 8 is about **place, access, identity, and migration safety**. It must not simultaneously attempt the entire social-experience redesign.

### Phase 8A — Everthread Setting Foundation — CERTIFIED Run #125

Certified on expanded source `2596084575dd4288a0b549dc1a618736280f135b`, save schema **15**, dedicated regression **25/25**, canonical preflight 4/4, and 171-module production build.

`countryId/city` remain the single physical/legal/economic location authority. New player-facing lives begin in Everthread. Hidden `namePoolCountryId` separately preserves procedural cultural/name diversity without becoming a second residence field. Schema-14 saves migrate current local context into Everthread deterministically while preserving remote NPCs and historical records; migration is idempotent, gameplay-RNG neutral, and runtime-ID neutral. At the time of Run #125 later emigration remained durable; Run #163 superseded that rule by making Everthread the only permanent player residence while preserving temporary travel and naming/cultural provenance.

Do not reopen this ownership split casually in later slices. Certified Phase 8B projects places over these authorities without a parallel home/location ledger; Phase 8C must preserve that boundary while adding routing.

### Phase 8B — Town Place Registry & 2D Flat Map — CERTIFIED Run #127; presentation correction certified Run #129

Core 8B certified on expanded source `f3fcb537545c2a454d98db22600346baf54e194e` in Run #127. The player-supplied authored-map / flush-Threadspace correction is certified on expanded source `109438ec2d50308c62c061a1c6bed7e0849e157b` in Run #129, save schema **15**, dedicated regression **46/46**, canonical preflight 4/4, and 176-module production build.

One authored registry now defines **24 stable places across 6 districts** with identity, category, map/layout metadata, visibility, activity tags, importance, and optional routing metadata. `TownMapSystem` projects this data read-only over existing `GameState`; browsing is deterministic, gameplay-RNG neutral, runtime-ID neutral, and adds no durable map/camera/filter/discovery state.

The lazy-loaded Map tab is mobile-first: the authored 1536×961 town artwork is the native coordinate surface; the workspace is edge-to-edge beneath the header and above bottom navigation like People Threadspace; initial view covers/fills the workspace while Fit Map exposes the complete-town overview; touch pan, pinch/wheel zoom, large markers, bottom-sheet details, search/category filters, progressive marker/label disclosure, and viewport culling remain supported. Blackline Freight Yard discovery derives from existing organized-crime/legal state. At the time of Run #129 emigrated players could browse Everthread without relocation; Run #163 later retired permanent player emigration and preserves this projection rule for temporary/external context.

Place routing metadata points only to mature existing screens; 8B deliberately does **not** execute institution mechanics. Finance, relationships, property, education, career, legal, and other results remain owned by their established systems.

### Phase 8C — Institution Routing — CERTIFIED Run #131

Certified in Run #131: **28 institution service doorways** now route believable Everthread places into the established Life, Assets, Activities, and Career owners without duplicating mechanics. Bank routes finance/credit/payments/investment; Dealership routes vehicle marketplace/ownership; Realty routes home marketplace/ownership; City Hall routes company/civic functions; schools route Education; Hospital/Gym route health/wellness; Airport routes travel; justice locations route legal/corrections; and career landmarks route existing career-world authorities.

Old/contextual entry points remain available. Route intent is ephemeral UI state, and every mature owner still decides eligibility, costs, actions, accounting, consequences, and RNG. Save schema remains 15.

### Phase 8D — Player Profile & Personal Inventory — CERTIFIED Run #133

Certified in Run #133 on expanded source `cf2ede37be5362bc02678a2cc4bec6defa38a837`, save schema **16**, dedicated regression **63/63**, canonical preflight 4/4, and a 183-module production build.

The player's name is tappable from Life and the **YOU** node in Threadspace, opening one shared lazy profile sheet. `PlayerProfileSystem` projects existing identity, generation, location, career, education, relationship, appearance, licenses, achievements, asset counts, valuable collectibles, and personal possessions without copying those authorities.

A new bounded `PersonalInventorySystem` owns only ordinary non-financial possessions. Phase 8D adds **24** original personal-item definitions sold through existing Everthread places. Browsing is deterministic/RNG-neutral; purchases spend Cash once and allocate one runtime ID only on success; inventory is capped at 80 and invariant-repaired. Ordinary items do not count toward net worth or estate value. Valuable collectibles remain solely with Assets/Estate and are projected into the profile exactly once.

Schema-15 saves migrate to schema 16 with an empty personal inventory deterministically and idempotently. Rewind restores inventory normally. Descendant continuation deliberately does not copy ordinary personal items to the successor, while valuable collectible inheritance stays with the existing estate authority. This creates the ownership foundation required for Phase 9 gift transfer without introducing a second asset ledger.

### Post-8D Critical Threadspace Load Recovery Hotfix — CERTIFIED Run #135

Run #135 / `39523787af658a6907cb82ba0e7b94d964fca82d` fixes a production-critical deployment/cache failure that could blank the app when a lazy People, Map, or Player Profile chunk failed to load. This is a reliability correction, not a new simulation system. Lazy-screen failures are contained below the app shell, recoverable dynamic-import failures get one guarded reload, and persistent failures preserve navigation with explicit escape controls. PWA code/navigation fetches now avoid stale cache-first JavaScript/CSS and legacy shell cache state is purged during service-worker activation.

Preserve this boundary in later work: People, Map, and Player Profile should remain independently lazy/code-split, but no lazy feature may be able to take down the root app shell. Save schema remains 16; no gameplay authority changed. Dedicated recovery regression is 10/10 and canonical Run #135 preflight/deploy is Green.

### Phase 8E — Phase 8 Closeout — CERTIFIED Run #137

Certified in Run #137 on expanded source `e1aa213fac4e03ab9a4af3039d9605852289b899`, save schema **16**, dedicated regression **34/34**, canonical preflight 4/4, and a 186-module production build.

Closeout proves every established primary/Assets owner remains reachable; all 28 institution routes still terminate in mature reachable owners; canonical Assets gameplay families remain exposed; map/profile/route browsing is read-only and RNG/runtime-ID neutral; schema-14→16 migration is deterministic/idempotent; then-current emigration and underworld visibility remained projections of existing truth; and 360/390/412/430px map-camera behavior remains finite and usable. Remaining People/Map secondary controls were raised to the established 44px touch target. No old navigation was retired, save schema remains 16, and no Phase 9 mechanics were introduced.

**Phase 8 — Everthread: Home is CLOSED.** Preserve its authority boundaries throughout Shared Lives: Map is navigation/projection, Threadspace is relationship projection, Player Profile is identity/ownership projection, personal inventory owns only ordinary non-financial possessions, and mature system owners retain gameplay consequences.

# Phase 9 — Shared Lives

## Intent

Make relationships feel like histories between people. Replace generic score-only social clicks with one reusable shared-experience framework for outings, dates, youth social life, gifts, and cross-world chemistry.

### Phase 9A — NPC Interests & Preferences — CERTIFIED Run #139

Certified in Run #139 on expanded source `f8ddfe5db0995dceb07969765b34b78f18740e01`, save schema **17**, dedicated regression **45/45**, canonical preflight 4/4, and a 188-module production build.

`NpcPreferenceSystem` adds one shared **38-tag** age-aware preference vocabulary and bounded intrinsic profiles on existing NPC records: at most 4 likes, 3 dislikes, and 1 occasional aversion. Neutral remains derived. Traits bias deterministic generation but never fully dictate identity. Generation uses an isolated seed + NPC-ID stream and consumes no gameplay RNG/runtime IDs.

Protagonist-specific knowledge belongs to the existing Relationship record and is independently bounded to 8 tags (passive discovery capped at 6). Schema-16 saves migrate intrinsic profiles for existing relationship targets but do not fabricate historical learned knowledge. Background NPC preference storage stays lazy until the person becomes relevant. Rewind and dynasty continuation preserve intrinsic identity while successor protagonists do not inherit the prior protagonist's learned knowledge.

People profiles reveal only plausibly known preference labels; raw weights remain hidden. The shared tag vocabulary intentionally aligns with Phase 8D personal-item tags so later outings/dates/gifts can consume one taxonomy rather than creating parallel definitions.

### Phase 9B — Shared Experience Foundation — CERTIFIED Run #141

Certified in Run #141 on expanded source `f1be1e6bc39482cb613b85bbdad77ea5ca7e9298`, save schema **17**, dedicated regression **53/53**, canonical preflight 4/4, and a 190-module production build.

One reusable evaluation path now follows the intended shape:

`player + exact NPC + relationship context + place + activity + preferences/context -> experience result`

`SharedExperienceSystem` is a pure evaluator/projection layer. It returns concise coherent prose, bounded 0–100 approval, outcome band, exact target/place/activity identity, consequence suggestions, preference-signal context, and meaningful-memory signaling without mutating `GameState`, consuming gameplay RNG, or allocating runtime IDs. The initial authored registry contains **10** age-aware activities across six canonical Everthread places.

`RelationshipSystem` remains authoritative for committed social mutation: action-economy use, relationship score, hidden opinion, player happiness, exact-target timeline history, the single committed gameplay-RNG draw, preference reveal through the existing Phase 9A authority, and bounded NPC memory writes. No parallel relationship score, experience ledger, or memory authority exists. The evaluator already accepts explicit preference/context overrides so Phase 9C youth social life, Phase 9D dates, Phase 9E gifts, and Phase 9F cross-world chemistry can reuse one path instead of forking scoring logic.

### Phase 9C — Childhood & Youth Social Life — CERTIFIED Run #144

Certified in Run #144 on expanded source `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b`, save schema **17**, dedicated regression **40/40**, canonical preflight 4/4, and a 192-module production build.

`YouthSocialSystem` projects age-appropriate plans from existing NPC, Relationship, SchoolWorld, place, and Phase 9B shared-experience truth. It introduces no youth-only relationship graph, school roster, experience ledger, memory store, or location authority. The authored layer contains **11 curated plans** spanning playdates, home visits, sleepovers, arcade/game outings, movies, real school socials, stadium trips, cooking, mall/diner hangouts, and park walks for ages 3–17.

Classmates/friends/best friends remain the established relationship records; siblings, half-siblings, step-siblings, and cousins remain the established family relationship taxonomy. Non-family youth peers stay within a bounded ±3-year age band. A School Social is offered only when the selected NPC is a current real classmate in an active SchoolWorld, so school context is projected rather than duplicated.

The shared activity registry expands **10 → 12** with youth-bounded `sleepover` and `school_social`; all other youth plans reuse the certified Phase 9B activity/place pairs. The People profile exposes a mobile **Spend time together** chooser and bounded approval result, while committed actions still route through `GameEngine.shareExperience` and `RelationshipSystem`. AI-testbench semantic parity uses the same exact-NPC/place/activity engine action. Browsing remains read-only and RNG/runtime-ID neutral; successful actions preserve the established one-draw/action-economy/timeline/preference/memory behavior.

Childhood now has a real social action surface without weakening adult relationship rules or creating a second social simulation.

### Phase 9D — Dating & Romantic Momentum — CERTIFIED Run #146

Certified in Run #146 on expanded source `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1`, save schema **17**, dedicated regression **61/61**, canonical preflight 4/4, local deep preflight 6/6, and a 194-module production build.

Dating is now intentionally distinct from partnership. **Ask on Date** may be accepted or rejected; an accepted invitation persists on the existing Relationship until completed or cancelled. The player then chooses among **8 authored date plans** that reuse certified Everthread places, preference tags, and the single shared-experience evaluator. Read-only date planning consumes no gameplay RNG/runtime IDs.

Completed dates append to an **8-entry bounded history on the existing Relationship record**. Hidden romantic momentum is derived from those outcome bands rather than stored as a second score: good/great dates build it, rough/awful dates can reduce it, and reaching 3 momentum only unlocks the attempt to **Become Partners**. The milestone itself remains probabilistic.

`RelationshipSystem` remains authoritative for invitation/date/milestone mutation, relationship score, hidden opinion, attraction, happiness, exact-target timeline, memories, action economy, and RNG. Existing age/orientation/current-commitment rules remain intact, including estranged living commitments; temporary teen age-boundary incompatibility does not trap a pending date, and invariants remove dead-target/malformed ghost plans. People and AI semantic surfaces use the same production actions.

The long-life harness now follows the real multi-date courtship contract without any test-only romance shortcut. Deep preflight's 1,000-life run completed with 0 anomalies and bounded population.

### Phase 9E — Real Gifts — CERTIFIED Run #148

Certified in Run #148 on expanded source `a9e53a6840d0fa05790acb3e20ce963a2df51f0e`, save schema **17**, dedicated regression **60/60**, canonical preflight 4/4, and a **195-module** production build.

Gift is now inventory-driven. The player chooses an exact owned Phase 8D personal-item instance from the People profile; the old generic `$150` Gift action refuses rather than fabricating a present. `PersonalInventorySystem` remains the ownership/removal authority, while `RelationshipSystem` owns committed relationship/opinion/happiness/timeline/memory/preference/action-economy/RNG consequences.

`GiftSystem` evaluates the exact item's existing `preferenceTags` through the pure preference/relationship/wellbeing scoring core shared with Phase 9B experiences. This reuses the 38-tag Phase 9A vocabulary without inventing a fake location or a second gift-outcome engine. People shows concise reaction text plus Gift Approval; AI semantic actions use the same exact instance ID.

Failed/stale/dead/ineligible attempts preserve ownership; a successful committed gift—good or bad—removes exactly one instance. Duplicate copies remain independent, stale instance replay cannot duplicate transfer, rewind restores inventory and consequences atomically, and descendants do not inherit the prior protagonist's ordinary possessions by accident. Valuable collectibles/assets stay with their existing authorities. No broad durable NPC inventory was added.

### Phase 9F — Cross-World Chemistry — CERTIFIED Run #150

Certified in Run #150 on expanded source `20b3026f577db86d821e82129b5c76fa09060413`, save schema **17**, dedicated regression **43/43**, AI semantic parity **64/64**, canonical preflight 4/4, and a **197-module** production build.

`CrossWorldChemistrySystem` is a read-only projection over existing school, family/friend, workplace, and special-career memberships. The authored layer contains **22 contextual plans across 13 context families** and uses the exact active world the selected NPC genuinely shares with the player. Promoted classmates/coworkers retain their real world context through the authoritative rosters; professional rivals/opposition are excluded from friendly chemistry plans.

Committed actions reuse the certified shared-experience evaluator and `RelationshipSystem`, consume the established per-person social budget, use existing places/activities/preferences, and write bounded exact-target memories. No school/work/career stat is mutated directly by the projection. Instead, SchoolWorld, Workplace, and special-career owners continue deriving standing/morale/chemistry/support/cohesion from the authoritative relationships they already own. A music-world regression proves that the existing career chemistry projection rises from the same real relationship changed by the contextual outing.

No cross-world relationship state, second affiliation graph, chemistry score, or durable outing ledger was added. Save/rewind/determinism, stale/dead/estranged safety, exact-target identity, AI/player action parity, and all established career-world regressions remain Green.

### Phase 9G — Shared Lives Closeout — CERTIFIED Run #152

Certified in Run #152 on expanded source `14defab1761b1597bae584f9e0acc5d8bfe11483`, save schema **17**, dedicated integration regression **41/41**, canonical preflight 4/4, and a **197-module** production build. The committed 9G diff is test-only: one new closeout regression plus runner wiring, with no production gameplay, UI, schema, content, package, workflow, or asset change.

The closeout drives one exact NPC through the complete Phase 9 stack—preference discovery, ordinary shared experience, exact-item gift, cross-world chemistry, three real dates, and Become Partners—while a decoy target verifies no consequence leakage. Combined coverage proves save/load normalized idempotence, deterministic replay, rewind recovery, descendant-continuation boundaries, stale/dead target handling, same-year social-budget contention, duplicate item-instance safety, bounded memories/history, and existing player/AI authority parity.

Pre-upload local deep preflight passed **6/6**, including unchanged content audit and a **1,000-life simulation with 0 anomalies / 0 forced terminal deaths**. No production integration defect required a 9G gameplay patch.

**Phase 9 — Shared Lives is CLOSED.** Preserve the single relationship graph, shared preference vocabulary/evaluator, exact-target memories, action economy, personal-inventory authority, romance metadata bounds, social-world roster ownership, deterministic save/rewind behavior, and player/AI action parity as Phase 10 begins.

# Phase 10 — Living Everthread

## Intent

Once place and shared experiences are independently stable, let the town accumulate generational meaning without becoming a city-management simulator.

### Phase 10A — Residential Life — CERTIFIED Run #154

Certified in Run #154 on expanded source `b4ef6f74f6d957a3109beb6b269ae86b37a7d351`, save schema **17**, dedicated regression **69/69**, AI semantic interaction **72/72**, canonical preflight **4/4**, and a **199-module** production build. Pre-upload local deep preflight passed **6/6** including unchanged content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**.

Residence is projected from existing Property/NPC household/location/relationship truth. Existing property records own only optional primary-home and inheritance provenance metadata; no parallel residence state, property ledger, household graph, or housing balance exists. Assets can designate an eligible exact owned property as Home; Player Profile projects the current residence; People projects exact NPC household/home context; current partners without their own residence share the player's projected home.

Five residential plans reuse existing Phase 9 shared-experience activities/evaluator, RelationshipSystem consequences, bounded memories, gameplay RNG, and per-person social budget. Inherited-home provenance survives estate conversion so family landmarks remain recognizable; successor homes outrank newly inherited property; sale/foreclosure/rental/relocation keep property/debt authority coherent. Minors may own/inherit property but cannot designate/project an independent owned home before adulthood.

**Phase 10A is CLOSED / CERTIFIED.** Preserve this authority split as later place-meaning slices build on residence context.

### Phase 10B — Working Everthread — CERTIFIED Run #156

Certified in Run #156 on expanded source `a497aa1bbec357fe12755383acb7053ab5d0ea67`, save schema **17**, dedicated regression **50/50**, AI semantic interaction **78/78**, canonical preflight **4/4**, and a **201-module** production build.

`WorkingEverthreadSystem` is read-only projection over existing SchoolWorld, Workplace/SocialWorld, Business, Town Place, and location truth. Current local schools map to the existing School/College anchors; active local full-time and part-time workplace worlds map deterministically by authoritative industry into existing Everthread districts/landmarks. Remote worlds remain remote and receive no synthetic Everthread district.

Player-founded companies preserve physical-base provenance on the existing Business record; NPC business holdings preserve it across estate conversion. Relocation therefore does not teleport companies and inherited businesses remain where they were founded. Legacy player/NPC business location repair is deterministic, idempotent, RNG-neutral, and runtime-ID neutral. Career/Assets/AI consume the same projections; no `workingEverthread` / `workLocations` shadow state is persisted into `GameState`.

**Phase 10B is CLOSED / CERTIFIED.** Preserve this authority split when 10C adds bounded generational place meaning.

### Phase 10C — Generational Place Memory — CERTIFIED Run #158

Certified in Run #158 on expanded source `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790`, save schema **17**, dedicated regression **50/50**, AI semantic interaction **82/82**, canonical preflight **4/4**, and a **202-module** production build.

Meaningful locations now carry bounded legacy context without a new place-history authority. `TimelineEntry.placeId` is optional canonical context for importance-2/3 milestones already owned by existing systems. Completed lives keep only a bounded derived place-milestone index (maximum 12) while preserving their full authoritative Timeline; old schema-17 lives without the index derive it read-only.

Inherited Property provenance remains the family-home authority. Business records now own optional founded/inherited provenance plus immediate predecessor identity; Working Everthread still owns physical company placement. Estate/Dynasty conversion preserves those existing records rather than creating shadow family-landmark state. Unknown legacy provenance is not fabricated.

`GenerationalPlaceMemorySystem` is read-only and deterministic. It prioritizes surviving inherited homes/businesses, then current/prior-generation milestones, with hard bounds of **24 memories / 8 places / 6 memories per place / 12 recent completed lives**. Player Profile can show the projection; Map rendering is intentionally deferred to 10D. Browsing/projection consumes no gameplay RNG/runtime IDs and does not mutate GameState.

Fresh certified-source content audit remains unchanged at 691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 preference tags. Local deep-wrapper completion was constrained by the development container; canonical GitHub Run #158 is the final certification authority.

**Phase 10C is CLOSED / CERTIFIED.** Preserve this ownership split when 10D adds living map context.

### Phase 10D — Living Map Projection — CERTIFIED Run #160

Certified in Run #160 on expanded source `8ce87ad1e812ed94a9918684b3b52452826f0ce9`, save schema **17**, dedicated regression **50/50**, AI semantic interaction **82/82**, canonical preflight **4/4**, and a **203-module** production build.

`LivingMapSystem` is a bounded read-only composition layer over certified Residential Life, Working Everthread, Generational Place Memory, owned Property, child education, and the Town Place registry. It never persists marker/context/filter/camera/selection state into `GameState` and never becomes an ownership authority.

Exact facts remain exact: current home/property, school, exact workplace/company anchors, child school, and legacy attach only to real existing place IDs. Work/company facts known only to a district remain district-level context rather than fabricating a specific building. External truth stays external; legacy emigrated state is normalized by the Run #163 compatibility rule. Same-kind facts aggregate; hard bounds are **6 contexts per target / 32 contexts total**.

The existing 24 markers are decorated rather than multiplied. Exact places can show context count/ring treatment and a **Your life here** section in the existing bottom sheet; district-only context uses lightweight noninteractive labels. The Explore panel's **Your life on the map** toggle is ephemeral UI state. Existing discovery, search, category filtering, routing, viewport culling, gesture camera, and lazy loading remain intact.

Fresh certified-source content audit remains unchanged at 691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 preference tags. GitHub Run #160 is the certification authority; the pre-upload local wrapper was container-time-limited rather than treated as Green.

**Phase 10D is CLOSED / CERTIFIED.** Preserve this projection-only boundary during Phase 10E closeout.

### Pre-10E player-tested correction gate — CERTIFIED Runs #162–#163

Direct mobile playtesting after 10D exposed two categories of issues that were fixed before closeout rather than normalized as acceptable debt. Run #162 certified shared Map-sheet touch scrolling/stacking, the three-permanent-plus-one-contextual bottom navigation model, and **Threadtone Music Studio** as a real Eastworks doorway into the existing Music career authority. The town registry is therefore now **25 authored places / 29 routed services** without adding a second Music system or Map authority.

Run #163 certified the deeper setting rule: **Everthread is the only permanent player residence**. External countries remain temporary vacation/family-trip destinations and naming/cultural profile sources. The compatibility emigration action no longer mutates state, and legacy schema-17 emigrated saves deterministically normalize the current household/local context back to Everthread while preserving durable biography/travel. The repair is idempotent, RNG-neutral, runtime-ID-neutral, and requires no schema bump.

Canonical Run #163 preflight passed **4/4** with the expanded pre-10E UX regression **20/20**, Integrated Long-Life **105/105**, Town Map **46/46**, Routing **42/42**, 10B **50/50**, 10D **50/50**, minigames **19/19**, feedback **20/20 + 23/23**, and a **203-module** build. Direct player-side validation confirmed the Airport behavior works as intended.

**The pre-10E correction gate is CLOSED / CERTIFIED.** Phase 10E must close the program from certified gameplay/source `ab40d66808e0950f041a72681d573401926de8c0` (or the docs-only descendant once this synchronization certifies), not from the older Run #160 source.

### Phase 10E — Program Closeout — CERTIFIED Runs #165–#166

Run #165 certified the integration closeout on expanded source `241276179e91df50796403376143b9404bf13ec4`, schema **17**, canonical preflight **4/4**, and dedicated Phase 10E regression **91/91**. The closeout adds no simulation authority: it proves multi-generation continuation, save/import/migration/rewind, estate/accounting integrity, Map ↔ Threadspace ↔ Player Profile identity/navigation, all routed owner access, Everthread-only residence with temporary travel, supported phone-width map behavior, deterministic projections, and bounded high-count stress.

The immediate post-closeout Feedback Inbox sweep surfaced `ET-20260915-86A6BA86`: Map places with meaningful life history should expose the actual remembered event. Mavyy approved this as final player-facing polish before documentation closure. Run #166 certifies the narrow correction on expanded source `7523f6919ad808f7d826c42cd471d61e1f4f4678`. Existing place sheets now show bounded **Memories here** derived from Generational Place Memory, including event text and generation/age/year context. Importance-1 routine history stays excluded; family landmarks remain legacy context; hidden-place discovery remains authoritative; browsing is read-only/RNG-ID neutral.

Run #166 canonical preflight passed **4/4** and expands Phase 10E to **103/103** while Integrated Long-Life remains **105/105**, Town Map **46/46**, Routing **42/42**, 10A **69/69**, 10B **50/50**, 10C **50/50**, 10D **50/50**, pre-10E UX **20/20**, Progressive Disclosure **25/25**, minigames **19/19**, and feedback **20/20 + 23/23**. Production remains **203 modules**. Save schema remains **17** and content remains **691 events / 25 town places / 29 routed services**.

**Phase 10E is CLOSED / CERTIFIED. Phase 10 — Living Everthread is CLOSED / CERTIFIED. The Living World Program is CLOSED.**

# Slice certification discipline

For every slice: inspect certified truth and feedback → locate existing authority → implement narrowly → add deterministic regression coverage → connected tests → full wall → both TypeScript gates → production build → exact-source/overlay verification → GitHub Actions certification/deployment → feedback sweep → documentation synchronization.

## Mandatory documentation synchronization rule

After every successfully certified **gameplay, feature, fix, migration, or architecture-changing source commit**, synchronize handoff/tracking documents **before starting the next implementation slice**.

Update every materially affected source of truth, including as applicable:

- `PROJECT_HANDOFF/CURRENT_STATE.md`;
- the active phase/program handoff;
- `PROJECT_HANDOFF/ROADMAP.md` when sequencing/status changes;
- `PROJECT_HANDOFF/PLAYER_FEEDBACK.md` when feedback status changes;
- root `DEVELOPMENT.md`;
- root `CHANGELOG.md`;
- root `CONTENT.md` when counts/content changed.

The sync records the certified run/expanded commit, schema, relevant tests, authority decisions, caveats, feedback state, and exact next slice.

**Recursion guard:** a documentation-only synchronization commit does not require another documentation-only synchronization merely to record its own commit/run number. After that sync certifies, future work should recognize it as the newest certified repository source while retaining the prior gameplay-changing commit separately as the gameplay baseline. If docs-only certification exposes a material new fact, correct it before gameplay work resumes.

This replaces the older practice of waiting for the next meaningful bundle to catch documentation up.

# Next implementation target

There is **no automatic next implementation phase** after the certified Living World Program closeout. Begin a new macro program only after Mavyy chooses the creative direction. Concrete player-reported defects may still preempt planning through the established feedback gate.
