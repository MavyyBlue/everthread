# Everthread — Post-Run-74 Diagnostic Polish Timeline

Purpose: convert defects and scale risks exposed by long-form mobile playtesting into bounded corrective slices before returning to planned Phase 5 dynasty/estate expansion.

Authoritative starting baseline: `032e88c6f49bb8808b97c2d8a9e8bc0fe7c50a2a` (Run #74, fully green).

Real player saves are diagnostic evidence only. Never copy a tester's seed, slot ID, character/NPC IDs, names, or exact history into production fixtures. Reproduce each failure shape with fabricated deterministic state.

Status vocabulary: `Queued` → `Investigating` → `Implementing` → `Local Green` → `Uploaded` → `CI Green`.

## Slice 1 — Save / rewind scaling

Status: **CI Green — Run #75 (`34516468949`), expanded baseline `1d3eb34ef90dfef5be8b870cc709b17a03d308aa`.**

Observed failure shape: a long Sandbox life produced an approximately 23 MB export, with 35 full-state rewind snapshots accounting for roughly 93.5% of the file. The existing importer also rejected files above 15,000,000 characters, which meant a legitimate pre-fix export could become too large to re-import.

Implementation contract:

- preserve Sandbox rewind and exact retained-state restoration;
- keep at most 10 recent yearly rewind points, matching the existing player-facing list size;
- additionally cap combined retained snapshot payload at 6,000,000 characters, always preserving at least the newest point;
- when replaying an age after rewind, keep only the newest snapshot for that age;
- normalize malformed/oversized current-schema rewind arrays on load without a save-schema bump;
- normalize before cloning the rest of a loaded state so legacy oversized snapshot arrays do not get duplicated unnecessarily during migration;
- accept legacy exports up to 40,000,000 characters so legitimate pre-fix saves can be imported once and immediately compacted;
- keep individual snapshot state self-contained and deterministic; do not introduce wall-clock data, asynchronous compression, or an external dependency;
- never persist the transient `ageUpLocked` runtime guard inside a rewind snapshot, and clear that guard while migrating legacy snapshot states;
- retained snapshots still migrate through `migrateSave()` before restoration;
- descendant continuation still clears rewind history as already established.

Synthetic regression coverage: count cap, newest retention, replay-age deduplication, malformed-entry cleanup, payload budget, live capture, real Age Up capture + rewind, oversized legacy import recovery, and schema-9 normalization without schema bump.

Diagnostic projection against the supplied stress save (not shipped as a fixture): 35 snapshots / ~19.1M snapshot characters would normalize to 7 recent snapshots / ~5.95M snapshot characters; the pretty exported file projects from ~22.97M to ~8.19M characters, roughly a 64% reduction.

## Slice 2 — Player partner/spouse ↔ NPC household coherence

Status: **Local Green — upload/CI pending**.

Goal: player romance remains authoritative in `state.relationships`, while `NpcLifeSystem` correctly projects active partner/fiance/spouse household status and shared-housing semantics. Do not misuse NPC↔NPC `partnerId` as a second player-relationship authority.

Implementation:

- `syncNpcHouseholdProjection()` is the reusable NPC-life projection authority for household status/housing;
- living adult player partner/fiance/spouse relationships project as partnered/shared unless the NPC owns property;
- custody and minor/dependent state override romance projection;
- genuine NPC↔NPC `partnerId` links remain intact; obsolete `partnerId` values pointing at the controlled protagonist are removed;
- household projection is refreshed by `ensureNpcLife()`, yearly NPC finance/release processing, and successful player relationship transitions;
- successful reconciliation restores dating marital status; discovered-infidelity relationship endings reproject immediately;
- player death does not leave/recreate shared housing, and descendant continuation converts the surviving NPC spouse cleanly from NPC↔NPC pointer semantics to player relationship truth;
- no save-schema bump or new main-RNG consumption.

Synthetic regression: **35/35 local runtime checks passed** across dating, engagement, marriage, breakup/divorce, reconciliation, owned property, stale-save repair, legacy player partner IDs, custody/release, NPC↔NPC partnership preservation, player death/reload, teen romance, and descendant continuation.

The real diagnostic save was used only to reproduce/verify the failure shape and is not shipped as a fixture. Under the pending correction its stale player-spouse household projects as `partnered/shared`.

## Slice 3 — NPC health / mortality semantics

Status: **Queued**.

Goal: eliminate contradictory living NPCs at zero health without turning invariants into a mass-death shortcut. Trace health depletion first, define a clear terminal/critical-health contract, then keep death cleanup centralized.

Regression targets: health reaches zero, severe-but-positive survival, elderly mortality, illness mortality, partner/family cleanup, no duplicate death processing.

## Slice 4 — Age-aware reproduction

Status: **Queued**.

Goal: preserve fertility stats, reproductive compatibility, pregnancy timing, adoption, family graph linkage, and action economy while adding biologically age-sensitive conception pressure. No magical age exception and no change to the player-only intersex limitation until separately designed.

Regression targets: young-adult baseline, advancing age curve, incompatible pairings, nonbinary reproductive-sex authority, adoption unaffected, pregnancy/action consumption unchanged.

## Slice 5 — NPC gender / sexual-orientation coherence

Status: **Queued**.

Goal: make generated gender, orientation, romantic compatibility, and autonomous matchmaking coherent while preserving established identity and history on old saves wherever possible. Identity must not be inferred from first-name semantics once persisted.

Regression targets: generation distribution, orientation-compatible matching, legacy odd combinations, nonbinary handling, autonomous couples, player romance gates, no reproductive-identity regression.

## Slice 6 — Collision-aware naming

Status: **Queued**.

Goal: keep the expanded regional name pools and exact 50/45/5 gender distribution, but preferentially select unused or low-collision names among the relevant cast before graceful fallback. Preserve deterministic RNG behavior.

Regression targets: deterministic output, regional/gender pools, no avoidable collision in ordinary casts, fallback under saturated pools, descendants/special-career NPC creation.

## Slice 7 — Relationship/event microcopy polish

Status: **Queued**.

Goal: replace grammatical templates such as `You conversation with ...` / `You compliment with ...` with action-specific natural wording without altering outcomes, memories, action economy, or RNG.

Regression targets: every relationship interaction verb, timeline wording, NPC-memory wording where applicable.

## Slice 8 — Integrated long-life QA

Status: **Queued**.

Goal: synthetic multi-decade/high-NPC/high-child-count validation across save growth, rewind, marriages/divorces/reconciliation, deaths, reproduction, naming, family linkage, and descendant continuation. This is the closeout gate for the corrective pass, not a new endless feature phase.

After Slice 8 is CI Green, return to the planned Phase 5 estate/dynasty roadmap unless new playtesting exposes a concrete blocking defect.
