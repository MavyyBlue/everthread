# Everthread — Living World Program

Status: **Active Mavyy-approved program. Phases 8A and 8B are certified; Phase 8C is next.**

Approved: 2026-09-13 after Phase 7 closeout.

Current certified program baseline:
- newest certified repository/gameplay source: Run #127 / `f3fcb537545c2a454d98db22600346baf54e194e`;
- package: `everthread-life-unwritten@0.12.0`;
- certified save schema: **15**;
- Phase 7: **closed**;
- Phase 8A: **certified / closed**;
- Phase 8B: **certified / closed**;
- next slice: **Phase 8C — Institution Routing**.

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

### Phase 8B — Town Place Registry & 2D Flat Map — CERTIFIED Run #127

Certified on expanded source `f3fcb537545c2a454d98db22600346baf54e194e`, save schema **15**, dedicated regression **41/41**, canonical preflight 4/4, and 175-module production build.

One authored registry now defines **24 stable places across 6 districts** with identity, category, map/layout metadata, visibility, activity tags, importance, and optional routing metadata. `TownMapSystem` projects this data read-only over existing `GameState`; browsing is deterministic, gameplay-RNG neutral, runtime-ID neutral, and adds no durable map/camera/filter/discovery state.

The lazy-loaded Map tab is mobile-first: touch pan, pinch/wheel zoom, Fit Map, large markers, bottom-sheet details, search/category filters, progressive marker/label disclosure, and viewport culling. Blackline Freight Yard discovery derives from existing organized-crime/legal state. Players who have emigrated can still browse Everthread without rewriting their authoritative residence.

Place routing metadata points only to mature existing screens; 8B deliberately does **not** execute institution mechanics. Finance, relationships, property, education, career, legal, and other results remain owned by their established systems.

### Phase 8C — Institution Routing

Redistribute existing entry points into believable places without duplicating mechanics. Bank routes finance/credit/investment; Dealership routes vehicles/financing; Realty routes homes/rentals; City Hall routes company formation/civic functions; schools route education; Hospital routes health; career locations route existing career-world authorities.

Keep old entry points until feature parity is proven. Never remove the mature Assets access path first and discover later that an existing action became unreachable.

### Phase 8D — Player Profile & Personal Inventory

The player's own name becomes tappable from Life and Threadspace. Their profile houses personal inventory: existing collectibles, gift items, and meaningful possessions/keepsakes where justified.

Inventory must not become a shadow asset ledger. Valuable collectibles, estate value, net worth, ownership, and financing reconcile exactly once through existing authorities.

### Phase 8E — Phase 8 Closeout

Prove every former Assets action remains reachable, old saves migrate safely, map browsing is deterministic/RNG-neutral, mobile interaction is accessible, and long-life/dynasty performance remains bounded before retiring old navigation.

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

Begin **Phase 8C — Institution Routing** from certified Run #127 / schema-15 Phase 8B. Route existing mature actions through believable places while keeping those existing system owners authoritative and retaining legacy/contextual entry points until parity is proven. Do not begin Phase 8D Player Profile & Personal Inventory until 8C is independently certified.
