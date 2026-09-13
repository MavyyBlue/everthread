# Everthread — Current State

## Live continuation note — Run #111 certified; Phase 7A local candidate

Phase 6 remains closed. The authoritative certified baseline is GitHub Actions **Run #111** (`34774175236`) on expanded source commit `576f9402deb854f8d5bd11891610e035cdd6d7ec`. Package remains `everthread-life-unwritten@0.12.0`; certified save schema remains **12**. Player-visible central feedback status/disposition is certified and deployed. Phase 7A is now the active local gameplay candidate and intentionally advances candidate save schema **12 → 13**.

Run #111 certified secure player-visible feedback read-back on top of the central Supabase inbox: token-authenticated status lookup, reviewer disposition/message projection, Feedback Central Inbox **23/23**, and successful Pages deployment from the expanded source build identified by `build-info.json`.

Last handoff preparation: 2026-09-13
Repository: `MavyyBlue/everthread`
Default branch: `main`
Public build line: `0.12.0 pre-release`
Certified save schema: `12`
Local Phase 7A candidate schema: `13`

## Last fully verified repository baseline — Run #111

- Expanded certified source: `576f9402deb854f8d5bd11891610e035cdd6d7ec`.
- Upload wrapper: `6569c4c718eeae817847bf75b10c70116e1ecfe4`.
- Run #111 passed Engine TypeScript, Test TypeScript, complete regression wall, production build, certified-baseline restore smoke, artifact publication, and Pages deployment.
- Core 82/82; AI Interaction Testbench 41/41; Integrated Long-Life 105/105; Activity-specific Minigame 19/19; Activity Feedback Reporting 20/20; Feedback Central Inbox 23/23; every established suite green.
- Vite 7.3.6 transformed 163 modules. Existing >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `f342ec71c823f45f76d661d96f0ed3d1cdf415ab99e6c36054f2da8f1cbdf0e8`.
- Certified dependency SHA-256: `16270fbffb002a5bf803f8b3e024999beb6f0ca85d9bea92aa629d6b121f450a`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact: `everthread-certified-preflight-576f9402deb854f8d5bd11891610e035cdd6d7ec`, artifact ID `10323017491`, digest `12529cb08519f0176778cf9161b73b83beb0592ba5778f9c3420a8261d8c733a`.
- Pages artifact ID `10322703128`, digest `7dabf6647ee2da91cd9a42789a0321aeb608774b3ff3763bca1af20d59f88055`; deployment reported success.

## Phase 7A — Persistent Consequence Foundation local candidate

- `state.delayedEvents` remains the **single authoritative active consequence queue** for backward compatibility; no shadow active queue was introduced.
- New `ConsequenceSystem` owns scheduling, deterministic priority/tie order, exact due windows, dedupe, target validity/cancellation, completion/cancellation history, exact event cooldown ages, and bounded retention.
- Durable `consequenceScheduler` metadata adds exact cooldown ages plus bounded history; candidate schema advances **12 → 13** through one `CURRENT_SAVE_VERSION` authority shared by CharacterSystem and SaveSystem.
- Schema-12 migration is deterministic, idempotent, RNG-neutral, preserves old `pendingEvent`, normalizes existing delayed entries, reconstructs cooldown ages from bounded legacy history, and preserves exact NPC/origin/relationship semantics.
- Finance no longer owns pending-event arbitration. Financial Pressure is a normal-priority scheduler request; higher-priority due stories remain ahead of it while the pressure notice stays in the same-age backlog.
- Special-career stories schedule high-priority exact-target consequences with stable chain IDs and validity requirements instead of relying on loose payload-only semantics.
- Age Up checks an already-due backlog before advancing the year, so multiple same-age consequences are surfaced/resolved rather than silently drifting overdue.
- Descendant continuation resets the previous protagonist scheduler queue/history/cooldowns, preserving the established per-life ownership boundary.
- Random-event content remains exactly **691** definitions; Phase 7A adds no event-count inflation and no gameplay RNG for scheduler bookkeeping.
- Local verification: both TypeScript gates pass; complete established regression wall passes; dedicated **Phase 7A Persistent Consequence 36/36** passes, including preservation of distinct schema-12 queued entries that lacked an explicit dedupe key; Integrated Long-Life remains 105/105; Feedback Reporting 20/20; Feedback Central Inbox 23/23; production build passes at **165 modules**. GitHub Actions remains final certification authority.

## Feedback queue snapshot reviewed against Run #111 / `576f9402…`

- Active technical reports requiring immediate action: **0**.
- Active experience reports requiring immediate action: **0**.
- Active normal-priority suggestion backlog: **1** — `ET-20260913-BE8649B9`, requesting that unavailable early-life actions/career paths be hidden or progressively disclosed to reduce interface clutter.
- Test reports `ET-20260913-A527E2A6` and `ET-20260913-55F088C9` are resolved as successful pipeline tests.
- Central review checkpoint has been advanced to Run #111 with **3 reviewed reports**. The early-life visibility suggestion is intentionally retained for a later UX/polish slice and does not block Phase 7A.

## Phase 6 closeout guarantees

Phase 6A–6C plus the post-6C household-finance correction are now certified foundations. Preserve these behaviors while Phase 7 expands consequences:

- Cash, revolving credit, assets, debt, and estate value remain distinct accounting concepts.
- Personal borrowing uses shared underwriting and real FinanceSystem liabilities; bankruptcy is an explicit guarded player decision, never a silent score reset.
- New generated lives begin with $0 personally owned cash. Ordinary supported-child costs belong to the supporting household rather than becoming hidden player debt.
- Financial independence is explicit state. Age 18 surfaces a player decision before ordinary independent living costs begin; home ownership establishes independence.
- Independent annual shortfalls may create labeled hardship debt and a player-facing Financial Pressure event. The player may reduce debt, review bankruptcy options, or carry the debt.
- Severe hardship never silently liquidates investments or automatically files bankruptcy.
- Due delayed stories retain priority over a newly created financial-pressure notice; finance consequences must not overwrite unrelated story continuity.
- System-owned milestone/crisis events remain outside the established 691-event random library.

## Active implementation — Phase 7A: Persistent Consequence Foundation

Do not begin Phase 7 by adding large event counts. First create one bounded, authoritative persistent consequence scheduler that later systems can safely consume.

The local Phase 7A candidate now provides exact event cooldown ages, stable consequence/chain IDs, origin event and origin age, exact target references, due-age windows, explicit priority, cancellation/validity conditions, deduplication, completion/cancellation history, deterministic ordering, bounded retention, and save migration. Existing `DelayedEvent` callers remain compatible through normalization into the same authoritative active queue.

Priority belongs to the scheduler rather than individual feature systems. Finance, parenting, school, property, business, relationships, and special careers should schedule consequences without independently deciding whether they may steal the pending-event slot.

Phase 7A advances candidate save schema **12 → 13** because durable consequence/cooldown metadata is real persistent state. Migration is deterministic, RNG-neutral, idempotent, preserves old pending/delayed event completion, and new-game/save migration share `CURRENT_SAVE_VERSION`. Canonical CI must still certify this before schema 13 becomes the certified baseline.

Read `PROJECT_HANDOFF/PHASE7_PERSISTENT_CONSEQUENCES.md` before implementation, then inspect `src/types/game.ts`, `src/systems/EventSystem.ts`, `src/systems/AgingSystem.ts`, `src/services/SaveSystem.ts`, `src/systems/SpecialCareerStorySystem.ts`, and all existing delayed-event call sites before editing.

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
