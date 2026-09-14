# Everthread — Living World Program

Status: **Active Mavyy-approved program. Phase 8 is certified / closed; Phase 9 Shared Lives is active with 9A next.**

Approved: 2026-09-13 after Phase 7 closeout.

Current certified program baseline:
- newest certified gameplay/source: Run #137 / `e1aa213fac4e03ab9a4af3039d9605852289b899`;
- package: `everthread-life-unwritten@0.12.0`;
- certified save schema: **16**;
- Phase 7: **closed**;
- Phase 8A: **certified / closed**;
- Phase 8B: **certified / closed**;
- Phase 8C: **certified / closed**;
- Phase 8D: **certified / closed**;
- Phase 8E: **certified / closed**;
- Phase 8: **CLOSED**;
- next slice: **Phase 9A — NPC Interests & Preferences**.

This is the authoritative roadmap chosen by Mavyy and Yuki after the required post-Phase-7 brainstorm.

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

`countryId/city` remain the single physical/legal/economic location authority. New player-facing lives begin in Everthread. Hidden `namePoolCountryId` separately preserves procedural cultural/name diversity without becoming a second residence field. Schema-14 saves migrate current local context into Everthread deterministically while preserving remote NPCs and historical records; migration is idempotent, gameplay-RNG neutral, and runtime-ID neutral. Later emigration remains durable.

Do not reopen this ownership split casually in later slices. Certified Phase 8B projects places over these authorities without a parallel home/location ledger; Phase 8C must preserve that boundary while adding routing.

### Phase 8B — Town Place Registry & 2D Flat Map — CERTIFIED Run #127; presentation correction certified Run #129

Core 8B certified on expanded source `f3fcb537545c2a454d98db22600346baf54e194e` in Run #127. The player-supplied authored-map / flush-Threadspace correction is certified on expanded source `109438ec2d50308c62c061a1c6bed7e0849e157b` in Run #129, save schema **15**, dedicated regression **46/46**, canonical preflight 4/4, and 176-module production build.

One authored registry now defines **24 stable places across 6 districts** with identity, category, map/layout metadata, visibility, activity tags, importance, and optional routing metadata. `TownMapSystem` projects this data read-only over existing `GameState`; browsing is deterministic, gameplay-RNG neutral, runtime-ID neutral, and adds no durable map/camera/filter/discovery state.

The lazy-loaded Map tab is mobile-first: the authored 1536×961 town artwork is the native coordinate surface; the workspace is edge-to-edge beneath the header and above bottom navigation like People Threadspace; initial view covers/fills the workspace while Fit Map exposes the complete-town overview; touch pan, pinch/wheel zoom, large markers, bottom-sheet details, search/category filters, progressive marker/label disclosure, and viewport culling remain supported. Blackline Freight Yard discovery derives from existing organized-crime/legal state. Players who have emigrated can still browse Everthread without rewriting their authoritative residence.

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

Closeout proves every established primary/Assets owner remains reachable; all 28 institution routes still terminate in mature reachable owners; canonical Assets gameplay families remain exposed; map/profile/route browsing is read-only and RNG/runtime-ID neutral; schema-14→16 migration is deterministic/idempotent; emigration and underworld visibility remain projections of existing truth; and 360/390/412/430px map-camera behavior remains finite and usable. Remaining People/Map secondary controls were raised to the established 44px touch target. No old navigation was retired, save schema remains 16, and no Phase 9 mechanics were introduced.

**Phase 8 — Everthread: Home is CLOSED.** Preserve its authority boundaries throughout Shared Lives: Map is navigation/projection, Threadspace is relationship projection, Player Profile is identity/ownership projection, personal inventory owns only ordinary non-financial possessions, and mature system owners retain gameplay consequences.

# Phase 9 — Shared Lives

## Intent

Make relationships feel like histories between people. Replace generic score-only social clicks with one reusable shared-experience framework for outings, dates, youth social life, gifts, and cross-world chemistry.

### Phase 9A — NPC Interests & Preferences

Meaningful NPCs receive compact persistent procedural preferences: likes, indifference, dislikes, and occasional strong aversions across coherent interest tags. Preferences are stable/deterministic; traits influence rather than replace them. Reveal only what the player could plausibly know.

### Phase 9B — Shared Experience Foundation

Use one evaluation path conceptually shaped as:

`player + exact NPC + relationship context + place + activity + preferences/context -> experience result`

Return concise coherent prose plus a bounded enjoyment/approval score for the visual meter. RelationshipSystem remains authoritative for relationship changes; NPC memories remain authoritative for meaningful remembered history.

### Phase 9C — Childhood & Youth Social Life

Use the same framework for play dates, sleepovers, parks, home visits, mall/game-store/arcade outings, school friends, siblings, and age-appropriate social events. Childhood should become an actual social life rather than a waiting room for adulthood.

### Phase 9D — Dating & Romantic Momentum

Separate **Ask on Date** from **Ask Out / Become Partners**. An eligible NPC may accept or reject an individual date. If accepted, the player chooses an appropriate location/activity and receives a coherent date result. Successful dates build bounded hidden romantic momentum/history. Roughly three genuinely successful dates can unlock the attempt to become official partners, but never guarantee acceptance. Rejection does not automatically eliminate future possibility.

Preserve existing age, orientation, commitment, attraction, household, family-planning, breakup/divorce/reconciliation, and exact-NPC rules.

### Phase 9E — Real Gifts

Gift becomes inventory-driven. The player chooses an owned item; the exact gift is evaluated against the NPC's preferences/context; the UI shows concise reaction text and a Gift Approval meter; relationship/opinion consequences follow; the item transfers exactly once. Meaningful gifts may create NPC memories. Do not create a large parallel NPC inventory unless possession later has independent gameplay value.

### Phase 9F — Cross-World Chemistry

Reuse shared experiences with school peers, family, friends, coworkers/managers, teammates/coaches, actors, musicians, models, racers, combat peers, military peers, and political contacts. Any school/work/career chemistry effect must flow through the authority that already owns that concept.

### Phase 9G — Phase 9 Closeout

Cover good/bad outings, rejection/retry, incompatible targets, stale/dead IDs, gift duplication/loss, same-year limits, save/load/rewind, descendant continuation, exact-target consequences, determinism, bounded histories, testbench parity, and the full canonical wall.

# Phase 10 — Living Everthread

## Intent

Once place and shared experiences are independently stable, let the town accumulate generational meaning without becoming a city-management simulator.

### Phase 10A — Residential Life

Project the player's residence and meaningful NPC households from existing Property/NPC household truth. Support coherent home visits, sleepovers, and family visits; allow inherited homes to remain recognizable family landmarks. Never create a second property/household ledger.

### Phase 10B — Working Everthread

Project current workplaces, institutions, and player-founded businesses into appropriate districts. Ownership, revenue, employment, bankruptcy, school membership, and career results remain with existing systems.

### Phase 10C — Generational Place Memory

Allow meaningful locations to carry bounded legacy context: inherited family homes, surviving family businesses, and significant life memories that reference where they happened. Record milestones, not every routine visit.

### Phase 10D — Living Map Projection

The map may highlight lightweight derived context such as: You live here, You work here, Your child attends here, Property owned, Your company, Current school, or a relevant social location. Do not render hundreds of background NPC pins; use relevance, simulation tiers, filters, culling, and progressive disclosure.

### Phase 10E — Program Closeout

Validate multi-generation behavior, migration/rewind, estate/accounting integrity, map performance, Threadspace ↔ Map ↔ Player Profile navigation, action-access parity, mobile/accessibility, and the complete CI/certification wall.

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

Begin **Phase 9A — NPC Interests & Preferences** from certified Run #137 / schema-16 Phase 8 closeout. Add compact persistent preferences to meaningful NPCs through the existing NPC authority, keep generation/migration/browsing deterministic and bounded, let traits influence rather than replace preference identity, and reveal only plausibly knowable information. Do not begin 9B Shared Experience Foundation until 9A is independently certified and synchronized.
