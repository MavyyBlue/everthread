# Everthread — Current State

Last handoff preparation: 2026-09-10  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `8fa76e03916d2a10559260c07dd718faa4c07bc6`.

- GitHub Actions run #72 (`34489240798`) completed successfully on 2026-09-10 UTC.
- Run #72 expanded upload commit `764b93cc513e93243e1bd57af00d715c3e2d902b` into the build-bot commit above.
- Source-overlay import, dependency install, both TypeScript gates, full regressions, production build, Pages artifact upload, and Pages deployment all passed.
- Core regression suite: 82/82.
- Phase 4 closeout: 88/88.
- Random-event coherence: 72/72.
- People Threadspace: 57/57.
- AI Interaction Testbench: 41/41.
- Phase 5 estate-planning regression: 46/46.
- Family continuity regression: 18/18.
- Visual identity regression: 12/12.
- Family reproduction regression: 51/51.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Phase 4 — closed

Phase 4 remains closed. Persistent Career World ecosystems, integration/coherence closeout, random-event consequences, AI Interaction Testbench coverage, and unified People Threadspace are green. Threadspace connection labels remain presentation-only and OFF by default.

## Phase 5A — estate and family-continuity foundation — green

`EstateSystem.ts` remains the authority for estate planning, preview, debt settlement, liquidation, spouse/child residuary shares, specific bequests, protected minor inheritance, and settlement consumed by descendant continuation.

Green continuity includes widowhood/unmarried-partner death cleanup, protected minor inheritance, spouse/child estate shares, parent/stepparent household friction, and bounded autonomous separation/divorce consequences.

## Everthread visual identity — green

Run #69 established the first Everthread-specific teal/gold presentation language while preserving player theme, accent, typeface, text-color, text-scale, contrast, and motion preferences. Supplied woman/man/gender-neutral crest assets remain production inputs and must not be regenerated or restyled without Mavyy's request. Unique save-export filenames are also green.

## Family reproduction + NPC identity — green

Runs #70–#71 established biological compatibility, partnered adoption coherence, persistent visible NPC gender, matching reproductive identity, profile-owned Family Planning controls, descendant identity preservation, autonomous reproductive compatibility, and immediate Threadspace graph invalidation through the GameEngine revision.

Green behavior includes:

- procedural NPC gender remains 50% female / 45% male / 5% nonbinary;
- generated first names correspond to NPC gender;
- binary NPC reproductive sex matches gender and nonbinary NPCs receive deterministic 50/50 female/male reproductive sex;
- procedural NPCs never receive the player-only intersex option;
- active partner/fiance/spouse profiles own Try for a Child and Adopt Child;
- biological incompatibility mutes Try for a Child at both UI and system layers;
- partnered adoption records both adults; single-parent adoption remains supported;
- closing NPC profiles reflects relationship/new-person changes immediately without tab remounts;
- descendant continuation preserves established NPC gender/reproductive identity;
- autonomous couples use the same biological-compatibility authority and can adopt when biological conception is unavailable.

## People polish + naming variety — green

Run #72 moved Meet Someone to Activities → Social, made the standalone Threadspace Adopt Child control match Filters dimensions, and expanded each of the seven regional pools from 20 to 120 first names and from 20 to 120 surnames.

Each first-name pool contains exactly 60 female / 54 male / 6 nonbinary names, preserving the authoritative 50/45/5 distribution without changing the existing single-draw deterministic NPC generation path. All first and last names are unique inside each regional pool and every active first name resolves to an NPC gender.

## Current work — Sandbox secret-code legacy feature

Mavyy requested the first Sandbox-only secret code as a project-start easter egg. Code `9426` represents 09/04/2026, the date Everthread development began.

Pending overlay behavior:

- Sandbox contains an `Enter Secret Code` control that opens a compact touch-friendly number pad;
- secret-code redemption is system-owned through `SecretCodeSystem` and `GameEngine`, not direct UI state mutation;
- code `9426` creates one persistent `Yuki Aster` NPC as a normal Friend in Friends & Social;
- Yuki is age-matched to the protagonist when redeemed, uses female gender/reproductive sex, pansexual orientation, strong initial friendship/compatibility, and ordinary persistent NPC-life state;
- normal Ask Out → Partner → Proposal → Marriage behavior is preserved rather than bypassed;
- biological family planning follows the existing reproductive-compatibility authority, so compatible protagonists can Try for a Child while incompatible pairings retain the muted option/adoption path;
- childhood redemption creates an age-matched friend and retains normal dating-age restrictions;
- the code is idempotent: one Yuki per life, even after repeated entry;
- invalid codes and non-Sandbox redemption attempts do not mutate state;
- the fixed secret-code effect does not consume the simulation RNG stream;
- the redemption marker uses the existing generic `flags` map, so save schema remains 9;
- a dedicated secret-code regression covers sandbox gating, invalid-code safety, Friends & Social membership, identity, romance progression, family-planning coherence, age gating, RNG preservation, and duplicate prevention.

This overlay is not green until both TypeScript gates, every established regression, the new secret-code regression, production build, Pages artifact upload, and live Pages deployment all pass.

## Phase 5 next slices after corrective QA

Continue without replacing the estate/family foundation:

- fictionalized estate administration / settlement consequences;
- richer NPC-owned assets and businesses so family wealth exists outside the controlled protagonist;
- audit whether NPC-parent death inheritance during an active minor life should use the same protected-inheritance authority;
- broader kin taxonomy only where it improves real family-tree behavior;
- stronger dynasty wealth/history summaries;
- large-family/multi-generation performance validation; and
- further death → estate review → descendant continuation polish where playtesting proves useful.

## Known quality / architecture issues

- NPC gender/sexual-orientation matchmaking remains intentionally simplified and should be deepened separately rather than mixed into reproductive identity.
- Exact seeded replay serialization remains mandatory; UI clock values must never enter simulation state or runtime IDs.
- Every meaningful player action stays under controlled system/GameEngine ownership; appearance settings remain presentation-only.
- AI observation/projection code remains read-only.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world, People graph, estate, and dynasty population/performance profiling remains important across long generations.
- The production application chunk remains above the preferred size threshold; broader code-splitting remains future work.
- GitHub Actions currently warns that several Node-20-targeted actions are being forced onto Node 24; this is nonblocking but should remain visible.
