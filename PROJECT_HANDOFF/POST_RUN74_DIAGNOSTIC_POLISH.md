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

Status: **CI Green — Run #77 (`34519148544`), expanded baseline `c57dfc3440a51f299867a3330ec8f2278dd66e67`.**

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

Synthetic regression: **35/35 checks passed in Run #77** across dating, engagement, marriage, breakup/divorce, reconciliation, owned property, stale-save repair, legacy player partner IDs, custody/release, NPC↔NPC partnership preservation, player death/reload, teen romance, and descendant continuation. Run #76 exposed a test-only TypeScript narrowing defect; the corrected test re-reads authoritative state after mutations and Run #77 passed without changing production Slice 2 behavior.

The real diagnostic save was used only to reproduce/verify the failure shape and is not shipped as a fixture. Under the green correction its stale player-spouse household projects as `partnered/shared`.

## Slice 3 — NPC health / mortality semantics

Status: **CI Green — Run #79 (`34520653552`), expanded baseline `25330555f2f9b826791eccd0d5e3be85e957bf77`.**

Goal: eliminate contradictory living NPCs at zero health without turning save migration or generic invariants into a mass-death shortcut. Zero is terminal during NPC simulation; positive health, including critically low positive values, remains survivable and uses the existing probabilistic mortality model.

Implementation:

- `npcHealthIsTerminal()` defines the terminal threshold as health `<= 0`;
- `processNpcLives()` resolves terminal health through the existing centralized `handleNpcDeath()` path before unrelated annual systems continue, and checks again immediately after health degradation;
- the coarse background odd-year path now resolves a health drop to zero instead of `continue`-skipping mortality;
- `processNpcHealthYear()` stops additional condition/recovery/onset work once health reaches zero;
- `handleNpcDeath()` is idempotent so already-dead NPCs cannot duplicate inheritance, widowhood, or death-history effects if called defensively;
- `npcMortalityChance()` remains probabilistic for positive-health NPCs and is exported for focused regression coverage; advanced age and serious conditions still increase risk;
- existing saves with living zero-health NPCs are repaired on load to health `1`, preserving those established lives rather than killing several NPCs merely because the build changed; future simulation can then resolve their critical state normally;
- dead zero-health NPCs are left untouched;
- state validation now explicitly reports any living NPC that somehow remains at terminal health;
- no save-schema bump and no new persisted field.

Synthetic regression: **18/18 checks passed in Run #79** across terminal threshold semantics, validator detection, legacy/direct repair, schema-9 import repair, dead-NPC preservation, deterministic terminal death, ordinary inheritance cleanup, duplicate-death prevention, background-cadence terminal death, critically low positive survival, age/illness mortality pressure, spouse/widowhood cleanup, and same-year illness-drain death. Existing Slice 2 household regression remained **35/35** and every established suite stayed green.

Diagnostic verification against the supplied stress save (not shipped): all **7** previously living zero-health NPCs import as living health-1 critical NPCs; zero living terminal-health contradictions remain, save schema stays 9, and Slice 1 rewind normalization still retains 7 snapshots. Run #79 passed both TypeScript gates, all regressions, production build, Pages artifact upload, and live deployment.

## Slice 4 — Age-aware reproduction

Status: **Local Green — upload/CI pending**.

Goal: preserve fertility stats, reproductive compatibility, pregnancy timing, adoption, family graph linkage, and action economy while adding biologically age-sensitive conception pressure. No magical age exception and no change to the player-only intersex limitation until separately designed.

Implementation:

- `ReproductionSystem` owns one shared, smooth gameplay reproductive-age curve instead of separate player/NPC age rules;
- young-adult fertility keeps the pre-Slice-4 baseline, including the existing 92% high-fertility annual ceiling, then age multiplies that chance rather than rewriting stored fertility;
- female reproductive-age pressure rises substantially through the late thirties/forties, becomes exceptionally low around 50, and reaches zero at 53; male reproductive-age decline is slower and no longer inherits the old NPC-only age-52 cutoff;
- player `biologicalChildGate()` returns the age factor and age-adjusted conception chance, and blocks only when the shared curve reaches zero or an existing compatibility rule already blocks the pairing;
- age-ineligible biological attempts fail before action/RNG consumption, while viable attempts use the same single RNG chance draw as before;
- People → Family Planning gives qualitative age-pressure feedback without presenting the gameplay curve as a clinical percentage;
- autonomous NPC biological family expansion uses the same pair age factor and can no longer force a child through the long-marriage fallback when age-adjusted fertility is too low;
- autonomous adoption probability/eligibility is otherwise unchanged, as are player adoption, pregnancy timing, multiples, family linkage, nonbinary reproductive-sex authority, and the current player-intersex limitation;
- no save-schema bump, persisted field, or additional main-RNG draw.

Dedicated synthetic `ageAwareReproductionRegression.ts`: **21/21 local runtime checks passed** covering young-adult baseline preservation, progressive age pressure, late-age floor/zero behavior, slower male decline, reproductive-sex compatibility, player gate/chance integration, no RNG/action consumption for age-blocked attempts, adoption independence, older-male/younger-female viability, nonbinary reproductive-sex authority, pregnancy timing/action economy, and autonomous-family age behavior.

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
