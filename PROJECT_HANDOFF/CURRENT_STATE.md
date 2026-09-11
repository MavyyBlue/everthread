# Everthread — Current State

Last handoff preparation: 2026-09-10  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `9ed003f97cf16c1df22ac44506d62766681dfc38`.

- GitHub Actions Run #88 (`34546954038`) completed successfully on 2026-09-11 UTC.
- Run #88 expanded upload commit `1946bed3739da73bae8c682f09bd7730c4d9b160` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, every established regression, production build, Pages artifact upload, and Pages deployment passed.
- Integrated long-life regression: 105/105.
- Pages artifact: `10179381674`, 7,001,236 bytes, SHA-256 `42e7d14426ccb3b6802ca10085779892dc9147725a5b91f659632d10c9e7bc6e`.
- Core regression: 82/82.
- People Threadspace: 57/57.
- Phase 5 estate planning: 46/46.
- Family continuity: 18/18.
- Visual identity: 12/12.
- Family reproduction: 51/51.
- Secret-code regression: 18/18.
- Rewind scaling regression: 16/16.
- NPC household coherence regression: 35/35.
- NPC health / mortality regression: 18/18.
- Age-aware reproduction regression: 21/21.
- NPC orientation coherence regression: 55/55.
- Collision-aware naming regression: 32/32.
- Relationship microcopy regression: 66/66.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and exact histories must never be copied into production/default fixtures.

## Green systems immediately relevant to current work

- Phase 4 remains closed; persistent career ecosystems, coherence closeout, random-event consequences, AI Interaction Testbench, and People Threadspace are green.
- Phase 5A estate/family-continuity foundation is green and must be extended rather than replaced.
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

A dedicated synthetic `npcHouseholdCoherenceRegression.ts` passes **35/35** in Run #77 across dating, engagement, marriage, divorce, reconciliation, breakup, ownership, stale-save repair, custody/release, NPC-to-NPC couples, player death, teen relationships, and descendant continuation. The supplied real save was used only as diagnosis: under the green logic its stale spouse household projects as `partnered/shared`; none of its private seed/IDs/history are shipped in fixtures.

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

Dedicated `npcHealthMortalityRegression.ts`: **18/18 checks passed in Run #79**. NPC Household Coherence remained **35/35**, every established regression stayed green, and the production build, Pages artifact, and live deployment passed. The real diagnostic save was used only as diagnosis: its 7 living zero-health NPCs normalize to living health-1 critical NPCs on import, with no remaining living terminal-health records and 7 rewind snapshots retained. Slice 3 is **CI Green**.


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

## Canonical pre-deployment QA — infrastructure bootstrap

A new infrastructure pass is being introduced after the corrective closeout. It does not replace any existing QA asset. `scripts/everthread-preflight.mjs` orchestrates the existing engine typecheck, test typecheck, complete regression wall, and production build through `npm run preflight`; `npm run preflight:deep` adds the existing content audit and 1,000-life bulk simulation. The runner emits `.everthread/preflight-report.json` on pass or failure.

The intended GitHub workflow will call the same canonical preflight, move dependency installation to `package-lock.json` + `npm ci`, bootstrap the currently missing lockfile exactly once, and create a certified source artifact from the exact verified commit so future development sessions can run the same preflight before packaging an overlay. CI Green remains authoritative even after local Preflight Green. See `PROJECT_HANDOFF/PREFLIGHT_QA.md`.

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
