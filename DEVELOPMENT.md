# Everthread — Development Status

Last updated: 2026-09-17
Current build line: 0.12.0 pre-release
Certified save schema: 17
Newest certified expanded gameplay/source: Run #192 / `1f5c8d598b6f277f26ffda5d7683d7474141200e`
Certified gameplay baseline: Run #192 / `1f5c8d598b6f277f26ffda5d7683d7474141200e`

## Product direction

Everthread: Life Unwritten is an original, mobile-first procedural life simulator. The central interaction is Age Up: one year advances the world, connected systems process in a deterministic order, events may interrupt for a decision, consequences persist, and death can hand the family thread to a descendant.

The project is intentionally data-driven. React renders and requests actions; simulation systems own critical mutations. One `GameState` is the authoritative runtime/save state.

## Current architecture

- `src/engine/GameEngine.ts` — public action façade used by UI.
- `src/types/` — authoritative state and content contracts.
- `src/core/` — RNG, math, deterministic IDs, invariant enforcement, and the centralized action-economy ledger/policies.
- `src/systems/` — isolated simulation domains, including persistent social-world ownership for schools, workplaces, and future organizations.
- `src/data/` — external content definitions for events, jobs, education, countries, health, crime, assets, achievements, and challenges.
- `src/services/SaveSystem.ts` — IndexedDB/local fallback, schema migration, account-level multi-slot life saves, active-slot tracking, JSON import/export.
- `src/screens/` and `src/components/` — mobile UI only; critical state is not intended to be mutated here.
- `src/tests/` — deterministic regression suite, content audit, and multi-life simulation harness.
- `src/minigames/` — reusable minigame definitions plus activity-specific and generic challenge components with character-skill accessibility resolution.
- `src/feedback/` — report catalog/schema plus local-first central-inbox transport, bounded safe diagnostics, withdrawal, retry, copy/share/export; all deliberately outside `GameState`.
- `supabase/` — versioned central Feedback Inbox migrations and Edge Function source. Supabase is an online-services layer only; it owns no simulation truth.

## Newest certified location-scene slice — Run #192 — Central Everthread Bank

Run #192 adds the third dedicated illustrated location without creating a second finance engine.

- Expanded certified source `1f5c8d598b6f277f26ffda5d7683d7474141200e` from wrapper `d0d26c118a378ceabb93aafc97cb0cb24f30d263`; Actions Run `35178859400`, job `105066477713`. Diff from synchronized Run #191 `68d74f6c6204aa85c3dae661b46d2e8101ef5f2d` is exactly **10 intended source/test/asset files**.
- Central Everthread Bank adds three semantic scene groups and seven focused finance bindings while the Town Map remains the navigation owner. `BankLocationPanel` contains presentation routing only; `MoneySummaryView`, `InvestmentMarketView`, and `CreditBankingFocusedView` reuse existing Finance/Credit/Payment/Borrowing/Investment systems and `GameEngine` mutations. No scene balance, account ledger, credit score, liability, portfolio, or save state is introduced.
- `AssetsScreen` now consumes the same reusable money/investment views, reducing UI-rule drift instead of copying logic. Existing `CreditBankingPanel` behavior/API remains preserved while its internal focused bodies can also render in the location scene.
- Certified scene totals: **3 surfaces / 10 semantic groups / 21 action bindings / 6 selected Astra runtime assets**. Town places remain **25**, routed institution services **29**, and save schema **17**.
- Location Scene **44/44**; Credit & Banking **75/75**; Payment & Asset Management **81/81**; Map **46/46**; institution routing **42/42**; complete established wall Green. Canonical preflight **4/4 Green in 49,109 ms**.
- Production **224 modules**; Town Map JS ~**35.48/10.70 gzip kB**, CSS ~**24.42/4.66**; People ~**58.82/17.86**; character-art pack ~**971.11/69.18**; main ~**1,361.81/380.49**.
- Certification hashes/artifacts: source `c857954cf15ed3a761daa9d6d2985d2b793cc9ceb1d6593ea7d04bef23e10731`; dependencies `b39ae97fe6ae6ca22ad0b0a777549a134c94e683507c1f917ee6a8b5d8911dac`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10479623295`; Pages artifact `10479573465`; deployment succeeded.
- Feedback sweep is **5 total / 0 unresolved** and checkpointed against Run #192 at `2026-09-17 03:49:20.500943+00`.
- Next step is player-facing Bank review. Do not begin a fourth location until that pass is accepted.

## Prior certified presentation/navigation polish — Runs #189–#190 — immersive scenes + unified utility drawer

Runs #189–#190 preserve the Run #187 action/authority foundation while incorporating direct player review of the first two rooms.

- Run #189 expanded source `7509d29baa2538e1e69c7938b1bdba9e3cc29efd` switches the scene shell to edge-to-edge cover geometry with shared stage math for artwork/hotspots/props, transparent overlay header/hotspots, outlined label text, hand interact affordances, and a locally collapsible utility surface. No scene state enters `GameState`; no gameplay owner changes.
- Run #190 expanded source `ebf2ed8eb3a40276e055ce098818398add28b0d6` fixes the player-reported drawer bug by making the handle + Things to do + Map one shared utility drawer. Expanded/collapsed/hidden behavior is projected by `locationSceneUtilityTrayState`; collapsing retracts the entire footer row, and opening an object panel hides the drawer as one unit.
- Location Scene regression is now **40/40**. Canonical Run #190 preflight is **4/4 Green** in **34,252 ms**. Connected Map **46/46**, institution routing **42/42**, Shared Lives **53/53**, Dating **61/61**, Music **76/76**, lifecycle **48/48**, Secret Yuki **36/36**, Character Visual **76/76**, Dynasty **66/66**, Long-Life **105/105**, plus the complete established wall remain Green.
- Production remains **222 modules**; Town Map lazy JS ~**32.62/10.03 kB gzip**, CSS ~**24.42/4.66**, People ~**58.82/17.86**, character-art pack ~**971.11/69.18**, main ~**1,360.79/380.22**.
- Run #190 certification: wrapper `67307cac76713b9cc26d06ede39e421f1b4508f6`; Actions Run ID `35175656593`; job `105056670426`; source SHA `5ab9129e4301e9e35622ccc04cfe52e67ed613084c5ba78583ddac0ad7cce603`; dependency SHA `18709e220caaf49ba0557f9eccc2b1dcc5987dbe14af4186d7ef3971db59ac18`; artifact `10478273242` (`128140b302c6de30b4770ce94ddf559384fdfa7cf7154629c0e87f388960f661`); Pages `10477874907` (`e7b2273920147d9aa85bcbefadf8d314c709a2ff5ec2c79a2c5da3004bfc11d0`); deployment succeeded.
- Feedback Inbox remains **5 total / 0 unresolved by triage**; checkpoint `main` now points to Run #190 at `2026-09-17 02:48:02.61955+00`.
- At Run #190, the next gate was player-facing review of the polished Weaver Park + Threadtone shell before widening migration; Run #192 subsequently passed that gate by certifying Central Everthread Bank as the third scene.

## Prior certified presentation/navigation slice — Run #187 — dedicated location scenes foundation

Run #187 certifies the first two dedicated illustrated place surfaces without changing simulation/save authority.

- Expanded certified source: `c68757f75f38f76fc616589450b1a39b41e1b6d0`, schema **17**. Upload wrapper `f3898378133f48f7b60816f3cfb46596f554c781`; Actions Run ID `35170740515`; job `105041659840`. Base synchronized source was Run #186 `e1787ac018d47b580dd49ac9854c087fc07ec729`; net diff is exactly **12 intended source/test/asset files**.
- Weaver Park and Threadtone Music Studio are the only enabled scene routes. The Town Map remains the navigation authority; opening a scene keeps the map mounted and local camera/filter/search state intact. Returning preserves the originating pin highlight rather than remounting or forwarding into a legacy mega-screen.
- `LocationSceneSystem` is a gate/projection adapter over existing owners only. Wellness, Shared Lives, dating, music lifecycle/release/tour/partnership, career exit/retirement, and the central action economy remain authoritative. Scene browsing is read-only; mutations recheck the existing gate immediately before calling the owning action. No location balance, career shadow, duplicate relationship state, or scene save state exists.
- Shared `LocationScene` presentation uses contained 1024×1536 geometry, ≥48px semantic targets, readable labels independent from raw hotspot size, first-class **Things to do** parity, focus containment, and local Back unwinding before returning to the preserved map. The first slice imports only four runtime Astra assets; the remaining source-drop scenes are not yet shipped.
- Location Scene regression is **34/34**. Connected gates remain Map **46/46**, institution routing **42/42**, Shared Lives **53/53**, Dating **61/61**, Music **76/76**, lifecycle **48/48**, Secret Yuki **36/36**, Character Visual **76/76**, Dynasty **66/66**, Long-Life **105/105**, plus the complete established wall. Canonical preflight is **4/4 Green** in **61,250 ms**.
- Production: **222 modules**; Town Map lazy JS ~**31.63/9.66 kB gzip**, Town Map CSS ~**22.96/4.38**, People ~**58.82/17.86**, character-art pack ~**971.11/69.18**, main ~**1,360.79/380.23**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `8225082ce4b5489ceb2efd59a7260afa5a0f3893555b97f38170ac1e1ae69cee`; dependency SHA `a0add8575bcb362a98de2379a894d215f3b1f1d4eb6cf0a0be5318668e2d86b2`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10477005329` (`88d522000bd1865d8deba4945e3e023ed10e64dbe08aabda8aa8e61251a48f01`); Pages artifact `10477005335` (`0cbd4c99776cbc127208060ecfd57937e1ea9a49877d7ccc7e32ecfdf40b6b5a`); deployment succeeded.
- Feedback Inbox remains **5 total / 0 unresolved by triage**. Durable checkpoint `main` advanced to Run #187 source at `2026-09-17 01:34:16.880968+00`, reviewed count **5**.
- Next step is player-facing review of these two certified rooms before widening the rollout to more Astra location scenes. Do not bulk-import or migrate the remaining places merely because assets exist.

## Prior certified post-closeout hotfix — Run #185 — Secret Yuki durable provenance routing

Run #185 fixes a player-reproduced Hidden Threadroom routing failure without changing saves, bounded-memory policy, or ordinary NPC simulation.

- Expanded certified source: `d3760daa841f21e4a73bd4a22bbcd5f6560b08a4`, schema **17**. Upload wrapper `6bbd4a7aef2dc876748f056d2fcecdcb040ba0ce`; Actions Run ID `35121435267`; job `104879924533`. Base synchronized source was Run #184 `f8842340b36dc69e10c5481449576927c9f7fab7`; net diff is exactly **5 intended source/test files**.
- Root cause: Secret Yuki routing treated the bounded `secret_yuki_9426` NPC memory as the live identity test. Relationship/NPC memories are intentionally capped; once a long-running Yuki reached the 36-entry relationship-memory ceiling, that old origin memory could be pruned even though `state.flags['secretCode:yuki:9426']` still pointed to the exact authored NPC. Threadspace then fell back to the ordinary profile.
- `SecretCodeSystem.secretYukiNpcId(state)` now makes the durable secret-code flag the primary provenance authority. The origin memory remains only a legacy-recovery fallback for older saves whose flag must be repaired. `isSecretYukiNpc` and `peopleSurfaceForNpc` are state-aware, so display name, copied appearance, font, and text-color choices cannot grant or revoke special routing.
- The fix preserves bounded narrative history instead of making old memories immortal. It introduces no second NPC identity store: the flag already existed and simply becomes the routing authority it was meant to be. Save schema stays **17**; no migration or content change is required. Existing deterministic normalization still repairs portrait/reveal/flag state without consuming gameplay RNG or allocating runtime IDs.
- Secret-code regression expands **32 → 36 checks**, including bounded-memory pruning, font/text-color presentation changes, decoy isolation, pruned-history repair, legacy recovery, and RNG/runtime-ID neutrality. The reported exported life was also reproduced directly: the same NPC routes to `profile` before the correction and `yuki-threadroom` after it without editing the save.
- Canonical preflight is **4/4 Green** in **66,135 ms**: Engine TypeScript **5,109 ms**, Test TypeScript **6,635 ms**, complete regression wall **37,816 ms**, production build **16,570 ms**. Connected gates include base **82/82**, People **57/57**, Character Visual **76/76**, Visual Identity **12/12**, Yuki Art **19/19**, Dynasty **66/66**, Long-Life **105/105**, 10E **103/103**, New Life **8/8**, minigames **19/19**, and feedback **20/20 + 23/23**.
- Production: **218 modules**; People ~**58.82/17.86 kB gzip**, Player Profile ~**10.20/2.95**, character-art pack ~**971.11/69.18**, main ~**1,360.69/380.17**, CSS ~**87.92/16.19**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `12235fce17c4bf551887937413767cb9dc4071cbfb2add27167fc6fb6fdc74dc`; dependency SHA `e240824d278b823e095058fed93dc02c18da4915bf38709b696a16982b2a958b`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10457241561` (`afe8df394ead5d1c583828814393c065595497f609d3bfb100521b32c3f0558e`); Pages artifact `10457561283` (`38863e6d029dd864df9e978e34706810369c36759735b78fc34688c47751106b`); deployment succeeded.
- Feedback Inbox remains **5 total / 0 unresolved by triage**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable checkpoint `main` advanced to Run #185 source at `2026-09-16 16:25:10.400372+00`, reviewed count **5**.
- After the mandatory documentation sync, feature sequencing returns to player review/feedback. No new macro phase is implied.

## Prior certified Character Visual slice — Run #183 — richer aging/presentation

Run #183 makes the existing modular portrait identity visibly age without creating a second aging authority or mutating saved appearance.

- Expanded certified source: `ecd7e58c32a3145e8354f7397b70fc14d1feaf64`, schema **17**. Upload wrapper `8988105410ed6af26e5ddc505cbf5b571db6f511`; Actions Run ID `35040783887`; job `104619936027`. Base synchronized source was Run #182 `948b7f3bda7fcbe7d801ec1994b36a50ac7b447c`; net diff is exactly **4 intended source/test files**.
- `CharacterVisualSystem.characterAgePresentation` is a pure projection over stable `CharacterVisualIdentity` + authoritative person age. It normalizes invalid ages read-only, consumes no gameplay RNG, allocates no runtime IDs, and never rewrites the underlying portrait identity.
- Natural hair palettes gain deterministic person-specific graying onset in the 48–64 range, then silver → white progression. Already silver/white and stylized/dyed palettes remain authored. Mature/elder stages add the existing aging-detail assets, while youth projection suppresses adult work clothing and age-inappropriate facial hair.
- `CharacterPortrait` now uses age-aware palette tokens as well as age-aware layers. `PlayerProfileSystem` passes real age into the same appearance-description projection so text and rendered portrait stay consistent.
- Character Visual regression is **76/76**; Player Profile **63/63**; People **57/57**; Family Visual **27/27**; Dynasty **66/66**; Long-Life **105/105**; Yuki art **19/19**; canonical preflight **4/4 Green**. GitHub's single-command wall completes successfully even though the local container ceiling also timed out on unchanged Run #182.
- Production: **218 modules**; Player Profile ~**10.20/2.95 kB gzip**, People ~**58.81/17.86**, character-art pack ~**971.11/69.18**, main ~**1,360.67/380.18**.
- Certified source SHA `dd824f03b0ad2095a6f254f7afba2d63fb094237b1324cfd214bd0fde86d498d`; dependency SHA `fdd414a7d14e6fcba1d0d667bc840208faa7df9de0771c6ed0aab4eaa985a362`; certified artifact `10424553271`; Pages artifact `10424359343`; deployment succeeded.
- Feedback: **5 total / 0 unresolved**. Review checkpoint `main` advanced to Run #183 source at `2026-09-16 00:39:27.036715+00`, reviewed count **5**.
- Next Character Visual slice is intentionally **not precommitted** here. Player review/feedback may choose the next general visual improvement; future authored Yuki age-stage PNG families can plug into the existing stage contract without changing this age authority.

## Prior certified post-closeout hotfix — Run #181 — Yuki Threadroom viewport/fallback

Run #181 closes the player-facing cutoff found after Run #180 without changing simulation/save authorities.

- Expanded certified source: `fd304ae097dbb5fccab52085fd32ab838b011887`, schema **17**. Upload wrapper `703516842c2e09a07ab298e60ec4dadce80490a4`; Actions Run ID `35035042349`; job `104602148567`. Base gameplay source was Run #180 `3d33429bed185c9c382a21f9926fda362fba79b9`; net diff is exactly **3 intended files**.
- `YukiThreadroom` now portals its full-screen root to `document.body`, escaping Threadspace's stacking context so normal app header/bottom navigation cannot cover the room.
- Modular age-aware fallback portraits use separate compact scene geometry; the painted Astra adult sprite remains restricted to ages 18–44. Dedicated Threadroom art regression is **19/19**, including age 0.
- Canonical preflight **4/4 Green**; complete wall remains Green. Production: **218 modules**, People ~**58.81/17.86 kB gzip**, People CSS ~**22.57/4.69**, character-art pack ~**971.11/69.18**, main ~**1,358.35/379.57**.
- Certified source SHA `aea29e68948a539fb6c3e34718fea5c2faf6f687adc7901d9bf41033a7be1d7c`; dependency SHA `81bd74d91f8a789f01d8ba6bae72e290fe378d0664cc94f180c71d33d9260400`; certified artifact `10423216985`; Pages artifact `10422897873`; deployment succeeded.
- Feedback: **5 total / 0 unresolved**. Review checkpoint `main` advanced to Run #181 source at `2026-09-15 23:20:12.674778+00`, reviewed count **5**.

## Prior certified post-closeout slice — Run #180 — Reactive Astra Yuki Threadroom art

- Expanded certified source `3d33429bed185c9c382a21f9926fda362fba79b9`, schema **17**; Run ID `35033324379`, job `104596639702`; exactly **48 intended files** (7 source/test + 41 presentation assets).
- Reactive adult Threadroom art is presentation-only over the existing Run #178 Yuki NPC/Relationship authorities. Day/evening backgrounds, seated adult PNGs, face patches, icons, blink/speech/reaction timers, reduced-motion behavior, and responsive scene layout do not create durable room state or consume gameplay RNG.
- Painted art is age-gated to **18–44**; all other ages retain the special room with modular age-aware portrait fallback. Run #181 hardens that fallback layout.
- Run #180 canonical preflight **4/4**, Yuki Threadroom Art **18/18**, production **217 modules**.

## Prior certified post-closeout slice — Run #178 — Secret Yuki / Hidden Threadroom

Run #178 gives the Sandbox secret-origin Yuki one authored visual identity and one unique People interaction surface without creating a parallel NPC, relationship, affection, family, or save authority.

- Expanded certified source: `7eb71a218a2f35cfe807df9d2caaf7b2a86ff9b2`, schema **17**. Upload wrapper `ef2d29fea290d6d23b7e3ae310fada6e58a356eb`; Actions Run ID `35025458317`; job `104571277415`. Base synchronized source was `73512a2666290c980ba6841528bf811cd45fe932`; net diff is exactly **9 intended source/test files**.
- Secret code `9426` still creates one ordinary persistent NPC + Relationship. `SecretCodeSystem` materializes the authored Yuki portrait and records a permanent `secret_yuki_9426` origin memory. Run #185 supersedes that bounded narrative memory as the live routing authority: the existing `secretCode:yuki:9426` flag is durable provenance. Name matching alone never grants special routing.
- `normalizeSecretYukiState` repairs already-spawned pre-curation Yuki saves deterministically/idempotently on current-schema load: same NPC, same relationship/history, curated portrait + reveal restored, no gameplay RNG/runtime IDs consumed. Save schema remains **17**.
- `YukiThreadroomSystem.peopleSurfaceForNpc` owns the routing projection. Secret-origin Yuki opens a dedicated full-screen Hidden Threadroom from Threadspace; ordinary NPCs, including decoys with the same name/identity fields but no origin memory, keep the normal People profile.
- The Threadroom is presentation over existing authorities: `CharacterPortrait`, NPC memories, Relationship, action-economy gates, and `GameEngine.interactWithCharacter`. Six conversation topics plus greetings/status are read-only projections; quick interactions use ordinary engine actions; mature dates/gifts/milestones/family/residential systems remain reachable through the existing profile actions doorway.
- Canonical preflight **4/4 Green**. Secret-code/Threadroom **32/32**; Character Visual **60/60**; Family Visual **27/27**; base **82/82**; People **57/57**; Threadspace recovery **10/10**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback regressions **20/20 + 23/23**.
- Production build: **215 modules**; People lazy surface ~**50.76/15.18 kB gzip**; lazy character-art pack ~**971.11/69.18**; main ~**1,358.35/379.57**; CSS ~**87.92/16.19**. Existing large-chunk warning remains nonblocking.
- Certified source SHA `c91e04d2fa246a4af4421ea48fe32b7fea543c5d48160a8afa4fc0d7e78f6fe2`; dependency SHA `d5a1c173c3bffb7ae194d1c7b0beaa07ebbdf086ee7a35d718cacde7ead62fa6`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10418778648`; Pages artifact `10419241565`; deployment succeeded.
- The earlier Run #178 Supabase outage later recovered. Run #181 now holds the current verified Feedback Inbox checkpoint at **5 total / 0 unresolved**.
- Run #183 now certifies richer general aging/presentation over these same stable identities. Additional bespoke Yuki age-stage art can plug into the existing Threadroom visual-stage contract when authored; it is not a blocker. No Phase 11 label is implied.

## Prior certified Character Visual slice — Run #176 — Family resemblance + visual inheritance

Run #176 extends the certified NPC portrait authority into biological family resemblance without introducing a genetics database or changing family/legal topology ownership.

- Expanded certified source: `f01d1847ba943b285c61d2fb787298ecb76d08ff`, schema **17**. Upload wrapper `8e2ad27b7f37f759dcfbb20fd975334c8b93fdb1`; Actions Run ID `35021096077`; job `104556658034`. Base synchronized source was `3c6b781fada2deb7894e98fc0f9baf25dfcec9e0`; net diff is exactly **8 intended source/test files**.
- Optional `Npc.appearanceParentIds` records only biological **visual provenance** at child creation. Existing `parentIds` / `childIds` and Family Topology remain the sole family/legal relationship authority. Adoption intentionally receives no biological visual provenance, and old schema-17 saves do not infer it retroactively from ambiguous historical parent links.
- `NpcVisualSystem` deterministically mixes nine structural/color traits from available biological visual contributors: face, eyes, brows, nose, mouth, ears, skin palette, hair-color palette, and iris palette. Hair style, body, clothing, facial hair, details, eyewear, accessories, and expression remain the child's individual presentation.
- Siblings share a deterministic family anchor while child-specific variation prevents clone-like portraits. One-known-parent cases mix that parent's traits with the child's independent deterministic base rather than fabricating an unknown contributor.
- Visual inheritance remains lazy. Background descendants can retain provenance without materializing `Npc.appearance`; the first materialized portrait becomes permanent, so later parent styling/customization cannot rewrite an existing child. Multi-generation resemblance flows naturally through each generation's stored/projected identity without grandparent lookup or a parallel genetics ledger.
- Biological player/NPC and autonomous NPC births record provenance at the owning creation paths; autonomous adoption explicitly does not. Read-only inheritance projection consumes no gameplay RNG and allocates no runtime IDs. Save schema remains **17**.
- Canonical preflight **4/4 Green**. Family Visual Inheritance **27/27**; Character Visual **60/60**; base **82/82**; People **57/57**; Visual Identity **12/12**; Family Reproduction **52/52**; Age-Aware Reproduction **22/22**; Family Topology **40/40**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: **212 modules**; lazy character-art pack ~**971.11/69.18 kB gzip**; People ~**42.29/12.50**; main ~**1,357.50/379.07**; CSS ~**87.92/16.19**. Existing large-chunk warning remains nonblocking.
- Certified source SHA `8ec0d5d05f48d28539a75e99582c84ebf171d04c0ec8d0c3080c171aeb1046b6`; dependency SHA `40193bb92ce6e8f4a27ea713d5c2a6c2aa20499ccf455c118d9e2a564ee7abc9`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10417129753`; Pages artifact `10418125056`; deployment succeeded.
- Feedback sweep: **5 total / 0 unresolved**. Review checkpoint `main` successfully advanced to Run #176 source at `2026-09-15 20:42:29.766439+00`, reviewed count **5**.
- Run #178 now certifies the narrow Secret Yuki / Hidden Threadroom slice over this visual foundation. Richer aging/presentation remains the next planned Character Visual slice. No Phase 11 label is implied.

## Prior certified Character Visual slice — Run #174 — NPC identity + relationship reveal

Run #174 extends the Run #170 player Character Visual foundation to exact NPCs without creating a second person, relationship, or portrait authority.

- Expanded certified source: `69117c363124615a35683d03cbc0ab7a06472c06`, schema **17**. Upload wrapper `33ed012e757b4f76caf86602045519bab879da56`; Actions Run ID `35016561442`; job `104541388963`. Base doc-synchronized source was `fcc09814455ae9dabcc86a37ad7a6964dcb133e0`; net diff is exactly **11 intended source/test files**.
- `NpcVisualSystem` derives stable NPC portrait identity from existing NPC identity plus a deterministic seed stream. Optional `Npc.appearance` owns the exact face; optional `Relationship.portraitRevealed` stores only protagonist-specific learned portrait knowledge when relationship type alone does not already imply familiarity.
- Close family and established romantic relationships reveal immediately. Other relationships reveal from existing familiarity evidence; learned portrait knowledge does not regress when scores later fall. Unrevealed/background-only NPCs remain visually lazy to protect long-life save size and runtime cost.
- People Threadspace nodes and the existing People profile sheet consume the same reveal projection and `CharacterPortrait` renderer. Unknown exact NPCs use silhouettes; known NPCs use their stable modular portrait.
- Descendant continuation preserves the successor's existing NPC appearance exactly, and conversion of the deceased prior protagonist into family-history NPC state preserves the protagonist portrait. Playability changes never regenerate identity.
- Save/load repair is deterministic/idempotent and consumes no gameplay RNG/runtime IDs. Runtime invariants avoid repeatedly rebuilding already-stable revealed portraits. Save schema remains **17**.
- Canonical preflight **4/4 Green**. Character Visual **60/60**; base **82/82**; People **57/57**; Visual Identity **12/12**; Player Profile **63/63**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: **212 modules**; lazy character-art pack ~**971.11/69.18 kB gzip**; People ~**42.29/12.50**; main ~**1,355.82/378.21**; CSS ~**87.92/16.19**. Existing large-chunk warning remains nonblocking.
- Certified source SHA `480f726cb369600aca7e1b391ac2fe20cdae6e6ae8d6526ec35e8b773b3b0828`; dependency SHA `5e3657ac306c699139c79de6d2107fbf3de60371e83fc69a33412b9b1cc3cab9`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10416325194`; Pages artifact `10415871928`; deployment succeeded.
- Feedback sweep: **5 total / 0 unresolved**. Review checkpoint `main` successfully advanced to Run #174 source at `2026-09-15 19:59:39.246769+00`, reviewed count **5**.
- Run #176 now certifies family resemblance/inheritance over this identity/reveal foundation. Richer aging/presentation behavior remains the next planned Character Visual slice; no Phase 11 label is implied.

## Newest certified hotfix — Run #172 — New Life responsive width

Run #172 fixes the narrow-phone New Life clipping reported by Mavyy without changing any simulation or portrait authority.

- Expanded certified source: `5cf52a39d79f0835c2d9682e21d40c9ace7498c1`, schema **17**. Upload wrapper `a2ab156e54cc0a18e13354435a0d50ecb633eed1`; Actions Run ID `35006276096`; job `104506709088`. Base synchronized source was `704def1523d652ca9ca24660d86ff14565a88f60`; net diff is exactly **3 intended files**.
- Root cause: intrinsic minimum sizing from New Life form controls forced two-column grid rows wider than the phone viewport while the sheet hid horizontal overflow. The fix uses zero-minimum grid tracks plus shrink-safe child/form-control sizing; no global overflow masking was added.
- Added canonical New Life responsive layout regression **8/8** covering 360/390/412/430px and enlarged text-scale cases.
- Canonical preflight **4/4 Green**. Character Visual remains **46/46**; base **82/82**; Player Profile **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build remains **211 modules**; lazy character-art pack ~**971.11/69.18 kB gzip**; main ~**1,354.43/377.84**; CSS ~**87.30/16.11**. Existing large-chunk warning remains nonblocking.
- Certified source SHA `c33df60a9811907ae0dc8d4d58b1d8e6fd86aea7a7041d8f5e99db0d1b924d17`; dependency SHA `3cb9249bb0e386b953e1561493692f23150e7be192108746b220da4824447783`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10410969204`; Pages artifact `10411442227`; deployment succeeded.
- Feedback sweep: **5 total / 0 unresolved**. Review checkpoint `main` successfully advanced to Run #172 source at `2026-09-15 18:17:43.686626+00`, reviewed count **5**.

## Current Character Visual baseline

### Player Character Creator + portrait foundation — CI Green Run #170 (preserved under Runs #172 and #174)

Run #170 establishes the first certified Character Visual slice without creating a parallel person/avatar authority.

- Newest certified gameplay/source: Run #170 / `ef87fb8011b8ec9d6dc606c328db9b1c0882d942`, schema **17**. Upload wrapper `a620ac8b0a97458d05e66e11ac578163fb231dd1`; Actions Run ID `35001748216`; job `104491526661`.
- `CharacterVisualSystem` enriches the existing authoritative appearance profile with stable optional art-component IDs and deterministic normalization. Current-schema old saves remain supported; normalization is idempotent and gameplay-RNG/runtime-ID neutral.
- Historical appearance RNG draw positions are preserved; richer cosmetic detail derives from a separate cosmetic seed so identical seeded lives remain identical outside appearance.
- `CharacterPortrait` renders Astra's 624 modular SVG components through a lazy runtime art pack. `CharacterCreator` is a mobile-first New Life draft editor; Back discards unsaved edits, Save commits the draft, and Avatar/Profile surfaces consume the same appearance identity.
- Creator option groups are local collapsible accordions across Face/Hair/Style/Extras and never persist into GameState.
- Run #174 certifies NPC portrait identity/reveal over this foundation, and Run #176 certifies family resemblance/inheritance. Richer aging/presentation behavior remains deferred to the next certified slice.
- Canonical preflight **4/4 Green**. Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: **211 modules**; lazy character-art pack ~**971.11 / 69.18 kB gzip**; main ~**1,354.43 / 377.85**; existing large-chunk warning remains nonblocking.
- Certified source SHA `072c290101bd8853dca4e3e16a6af7e8d9cdc4ecadb332747db4e66f0fe4be7f`; dependency SHA `7890670ea96fa0ba70b95d7fd86ab72fcd2f96fece67cf48efa0d4512b30042b`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10409358703`; Pages artifact `10408949701`; deployment succeeded.
- Fresh post-Run-#170 Feedback Inbox sweep: **5 total / 0 unresolved**; no new report receipt after `2026-09-15 06:47:52.761298+00`. Durable feedback checkpoint remains on its previous stored value because the connector rejected the checkpoint write in this session.

## Current post-closeout player-facing polish baseline

### Astra UI iconography + Appearance reactivity — CI Green Run #168

Run #168 is a narrow presentation/integration correction on top of the closed Living World Program. It does **not** create a new macro phase or simulation authority.

- Newest certified gameplay/source: Run #168 / `f68ffacf47c1fd208f836666fca3b1010a517c85`, schema **17**. Upload wrapper `3cf72e36ed002880391e1a683cb846171e364423`; Actions Run ID `34973140255`; job `104394090082`.
- Appearance reactivity now follows a deterministic scalar visual-settings signature, so in-place settings mutation correctly refreshes theme/accent/font/text color/text scale/high contrast/reduced motion without requiring immutable GameState replacement.
- Astra's original icon geometry is integrated as a local presentation library. Existing town-place IDs, navigation routes, discovery, eligibility, Action VFX ownership, and simulation state remain authoritative.
- Canonical preflight **4/4 Green**. UI iconography/theme **183/183**; Action VFX **58/58**; Visual Identity **12/12**; base **82/82**; AI **82/82**; Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 10E **103/103**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: Vite 7.3.6, **206 modules**. Town Map ~9.77 / 3.59 gzip JS + ~12.64 / 2.65 gzip CSS; People ~41.18 / 12.12; Player Profile ~10.29 / 2.98; main ~1,277.82 / 362.39. Existing >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `a76e2eb38cb9aa10f67ce8a0f5f5948fe94fc64d638edabeca8e9059a6387ae5`; dependency SHA-256 `b61b136d41557e6422fdb85983fadd6c93fa97dcc6b395df7f620a52bb4352f9`; package-lock SHA unchanged. Certified preflight artifact `10398407272`; Pages artifact `10397848707`; deployment succeeded.
- Feedback Inbox after Run #168: **5 total / 0 unresolved**; checkpoint advanced to `f68ffacf47c1fd208f836666fca3b1010a517c85` at `2026-09-15 13:10:53.355932+00`.
- No macro phase is active. Mavyy still controls the next major creative direction.

## Certified Phase 10 closeout / current baseline

### Phase 10E + final Map-memory polish — CI Green Runs #165–#166

Phase 10 is now **CLOSED / CERTIFIED**. Run #165 added integration-only closeout coverage and no production authority; Run #166 certified the final player-requested Map-memory presentation over existing 10C/10D projections.

- Newest certified gameplay/source: Run #166 / `7523f6919ad808f7d826c42cd471d61e1f4f4678`, schema **17**. Phase 10E's initial closeout source is Run #165 / `241276179e91df50796403376143b9404bf13ec4`.
- Run #166 canonical preflight: **4/4 Green**. Phase 10E **103/103**; base **82/82**; AI **82/82**; Estate Administration **63/63**; Rewind **16/16**; NPC Assets **82/82**; Family Topology **40/40**; Dynasty **64/64**; Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 8E **34/34**; 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E UX **20/20**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- `Memories here` is a bounded read-only view of existing Generational Place Memory. It exposes meaningful event text plus generation/age/year context without adding a timeline ledger or Map state. Hidden-place discovery and importance thresholds remain authoritative.
- Production build: Vite 7.3.6, **203 modules**. Town Map ~9.58 kB / 3.52 kB gzip JS + ~12.25 kB / 2.59 kB gzip CSS; Player Profile ~10.29 / 2.98; People ~41.15 / 12.11; main ~1,270.14 / 358.72. Existing >700 kB warning remains nonblocking technical debt.
- Certified content remains **691 events / 25 town places / 29 routed institution services / 24 personal inventory items / 38 NPC preference tags**.
- Feedback Inbox after Run #166: **5 total / 0 unresolved**. `ET-20260915-86A6BA86` is resolved by Run #166; checkpoint is `7523f6919ad808f7d826c42cd471d61e1f4f4678` at `2026-09-15 07:20:42.854732+00`.
- No new macro implementation phase is active after this mandatory documentation sync. Mavyy controls the next major creative direction.

## Historical pre-10E correction gate

### Player-tested Map/navigation/Music + Everthread-home corrections — CI Green Runs #162–#163

Runs #162/#163 preserve the certified Phase 10D architecture while fixing player-found UX/world-rule defects before closeout. Run #162 makes all shared Map location sheets vertically touch-scrollable above navigation, trims permanent bottom navigation to **Life / People / Map** with one routed contextual fourth owner, and adds **Threadtone Music Studio** as a real Map doorway into the existing Music career system. Run #163 establishes **Everthread as the only permanent player residence** while preserving vacations/family trips as temporary travel; the compatibility `emigrate` action is mutation-free and old current-schema emigrated saves repair deterministically to Everthread.

- Newest certified gameplay/source: Run #163 / `ab40d66808e0950f041a72681d573401926de8c0`, schema **17**. Run #162 gameplay/source: `5834f9fc6de6327797c969542eb3fdcd07b4e13b`.
- Canonical Run #163 preflight: **4/4 Green**. Pre-10E UX **20/20**; base **82/82**; Music **76/76**; AI **82/82**; Long-Life **105/105**; 8A **25/25**; Town Map **46/46**; Routing **42/42**; 8E **34/34**; 9B **53/53**; 10B **50/50**; 10D **50/50**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: Vite 7.3.6, **203 modules**. Town Map remains ~8.92 kB / 3.32 kB gzip JS; main ~1,269.79 kB / 358.61 kB gzip. Existing >700 kB warning remains nonblocking technical debt.
- Certified content totals now include **25 town places / 29 routed institution services**; the only new authored place/service is Threadtone Music Studio. Other major catalog counts remain unchanged.
- Fresh post-certification Feedback Inbox sweep: **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`; review checkpoint advanced to `ab40d66808e0950f041a72681d573401926de8c0` at `2026-09-15 06:46:01.03675+00`.
- Direct player-side verification confirmed the Run #163 Airport behavior works as intended.
- **Historical next slice from this point was Phase 10E — Program Closeout; it is now certified/closed in Runs #165–#166.**

## Historical certified Phase 10D

### Phase 10D — Living Map Projection (CI Green Run #160)

Run #160 / `8ce87ad1e812ed94a9918684b3b52452826f0ce9` is the certified Phase 10D gameplay/source baseline on save schema **17**. Canonical preflight passed **4/4** stages and Pages deployment succeeded.

- `LivingMapSystem` is a read-only bounded composition over certified Residential Life, Working Everthread, Generational Place Memory, owned Property, child education, and Town Place truth. It writes no map/context state into `GameState`.
- Exact authoritative anchors become place context; district-only work/business mappings remain district context rather than fabricating exact buildings. External/emigrated contexts remain external.
- Seven context kinds are supported: home, property, school, work, business, child school, and legacy. Repeated same-kind context aggregates instead of creating duplicate markers. Hard bounds are **6 contexts per target / 32 contexts total**.
- The existing 24 map markers are decorated rather than duplicated. Context count/ring treatment, the **Your life here** sheet section, district labels, and the **Your life on the map** Explore toggle are presentation only. The toggle, camera, filters, and selection remain ephemeral UI state.
- Existing discovery/search/routing/culling behavior stays authoritative; hidden Blackline discovery is not bypassed by context. Projection reads consume no gameplay RNG/runtime IDs and save schema remains **17**.
- Canonical CI: base **82/82**, AI **82/82**, People **57/57**, Town Map **46/46**, Routing **41/41**, Phase 8E **34/34**, Rewind **16/16**, NPC Asset Ownership **82/82**, Dynasty **64/64**, Integrated Long-Life **105/105**, 10A **69/69**, 10B **50/50**, 10C **50/50**, 10D **50/50**, Progressive Disclosure **25/25**, minigames **19/19**, feedback **20/20 + 23/23**.
- Production build transformed **203 modules**. Town Map ~8.92 kB / 3.32 kB gzip JS and ~11.25 kB / 2.46 kB gzip CSS; Player Profile ~10.29 kB / 2.97 kB gzip; People ~41.15 kB / 12.11 kB gzip; main ~1,270.49 kB / 358.71 kB gzip. Existing main-chunk warning remains nonblocking.
- Certified source SHA-256 `d9ffad5a5b7edbdd898a7726eb3c4616b706eddecd0ecc6bc69820aa2073686d`; dependency SHA-256 `d9509533484e7c6a7cf2f824fbbd69bbe0c320d9b9c131b4df4f6bc6251444bd`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10382985407` (`35d4493836c5befd621f31117b8fbae225bb5d7abe65879455c55ef7f20b1fac`); Pages artifact `10382109382` (`9d8e8a62cda11a198b43442eda4d53b54f0deff87e2cc8b41b2237e156c655bb`).
- Fresh post-certification content audit is unchanged at **691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 NPC preference tags**.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `8ce87ad1e812ed94a9918684b3b52452826f0ce9` at `2026-09-15 05:38:31.538933+00`.
- Pre-upload local canonical wrapper was container-time-limited and is not claimed as a completed canonical preflight; GitHub Run #160 is certification authority.

**Historical Run #160 handoff:** Phase 10E was the intended next slice, but direct playtesting inserted and certified the narrow Runs #162–#163 correction gate before closeout.

## Prior certified Phase 10B

### Phase 10B — Working Everthread (CI Green Run #156)

Run #156 / `a497aa1bbec357fe12755383acb7053ab5d0ea67` is the certified Phase 10B gameplay/source baseline on save schema **17**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- `WorkingEverthreadSystem` is a **read-only projection** over authoritative SchoolWorld, Workplace/SocialWorld, Business, Town Place, and location truth. It creates no durable work-location ledger and writes no projection back into `GameState`.
- Active local school worlds resolve to the existing School/College anchors; active local workplace worlds resolve by real industry to existing Everthread districts/landmarks. Remote worlds remain remote and receive no Everthread district.
- Player businesses now persist optional founding `countryId` / `city` on the existing `Business` record; `NpcBusinessHolding` preserves the same provenance through estate conversion. Companies therefore remain where they were founded when protagonists relocate or ownership passes to descendants.
- New/legacy business-location repair remains deterministic, idempotent, RNG-neutral, and runtime-ID neutral. Player legacy businesses repair from the protagonist location; NPC legacy businesses repair from the owning NPC location.
- Career and Assets expose the derived location labels; AI semantic inspection observes the same projections. Phase 10A residence projection remains unchanged and isolated.
- Dedicated Working Everthread regression **50/50**; AI **78/78**; base **82/82**; People **57/57**; Phase 10A **69/69**; Relationship Microcopy **69/69**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; the established regression wall remained Green.
- Production build transformed **201 modules**. People remains lazy/code-split at ~41.15 kB JS / 12.10 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; Town Map ~6.97 kB / 2.82 kB gzip; main JS ~1,259.21 kB / 355.87 kB gzip; existing main-chunk warning remains nonblocking.
- Certified source SHA-256 `eb3fb05357822c18bc52585de60c4dc6838eed1ff51e9f857adf3c883897d83a`; dependency SHA-256 `46ecae009f310c130b64ad1efa141d9755bdd793ff3682f0b61cba8daa186394`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10380297168` (`4dfc38542f7510b4d5dbddd33e11aadfdeec97ed32e4326ee9a09561f0daaa17`); Pages artifact `10380680116` (`8acb6ef7976cd0078f5ff5e2e26f186e5e26352399c6b82fd0e5aaa20021acd0`).
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `a497aa1bbec357fe12755383acb7053ab5d0ea67` at `2026-09-15 04:33:34.506272+00`.
- Fresh local content audit after certification remained unchanged at 691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 NPC preference tags.

**Historical handoff from Phase 10B:** Phase 10C and Phase 10D later certified; direct playtesting then inserted the now-certified Runs #162–#163 correction gate before the live Phase 10E target.

### Phase 10A — Residential Life (CI Green Run #154)

Run #154 / `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` is the certified Phase 10A gameplay/source baseline on save schema **17**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- Residence is **projection over existing truth**, not a new top-level authority. `PropertyAsset` / `NpcPropertyHolding` own only primary-home and provenance metadata; Property/NPC household/location/relationship systems retain ownership, debt, household, city, family, partner, and consequence truth.
- `ResidentialLifeSystem` projects player/NPC household residence read-only and exposes 5 contextual residential plans. Visit outcomes commit through the certified Phase 9 shared-experience / `RelationshipSystem` path and existing per-person social budget.
- Assets exposes exact-property **Make Home**; Player Profile shows current residence; People shows exact NPC household/home and visit options. AI semantic parity uses the same production engine actions.
- Inherited-home provenance survives estate conversion without overriding a successor's existing home. Sale/foreclosure/rental/relocation behavior preserves existing property/debt authorities. Minors may own inherited property but cannot project/designate it as an independent home before adulthood.
- Dedicated Residential Life regression **69/69**; AI **72/72**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Estate Planning/Admin **46/46 + 63/63**; Asset Financing **77/77**; Delinquency **82/82**; Payment/Assets **81/81**; Phase 8D **63/63**; Phase 9B **53/53**; 9C **40/40**; 9F **43/43**; 9G **41/41**; People **57/57**; Integrated Long-Life **105/105**.
- Pre-upload local standard preflight **4/4** and deep preflight **6/6** passed, including unchanged content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**.
- Production build transformed **199 modules**. People remains lazy/code-split at ~41.15 kB JS / 12.11 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; main JS ~1,253.59 kB / 354.16 kB gzip; existing main-chunk warning remains nonblocking.
- Certified source SHA-256 `f5abf0879e5ad26013d5ce17fcceb70c07e6164ccf48d669ea7b3b4875250195`; dependency SHA-256 `6c6850bea55be7fa4649a6958f625515f02afa36f74ebe7dbfb514ad7f3279bb`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10377789622` (`2cc22e7d8105ee8e8bb4ad319dd438df0e50c600dd81d3c54d82482e851c1448`); Pages artifact `10378158427` (`6cdde002c03756e59505fba58cea16b33710ba3af99df5e0e4d04d0b865b3263`).
- Post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt, and advanced the checkpoint to `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` at `2026-09-15 02:51:23.125961+00`.

**Exact next slice after this documentation sync certifies:** Phase 10B — Working Everthread. Project current workplaces, institutions, and player-founded businesses into the town from their existing authoritative systems; do not create a second workplace/business/institution ledger.

### Phase 9G — Shared Lives Closeout (CI Green Run #152)

Run #152 / `14defab1761b1597bae584f9e0acc5d8bfe11483` is the certified Phase 9 closeout gameplay/test baseline on save schema **17**. Canonical preflight passed 4/4 stages and Pages deployment succeeded. Phase 9 is now **CLOSED** at the gameplay/source level; the mandatory documentation sync is the final boundary before Phase 10A implementation.

- Phase 9G adds **no production gameplay code**. The committed diff is exactly one new integrated closeout regression plus runner wiring. No new authority, durable state, schema migration, content catalog, UI surface, package, workflow, or asset change was introduced.
- Dedicated Shared Lives closeout regression is **41/41**. It proves one exact NPC can accumulate coherent Phase 9A→9F history through preferences, shared experiences, exact-item gifting, cross-world chemistry, dating momentum, and partnership without leaking consequences to a decoy target.
- Save/load normalized idempotence, deterministic cloned replay, rewind, descendant continuation, stale/dead IDs, same-year action-budget contention, duplicate gift copies, bounded memories/history, and existing AI/player paths are covered together rather than only per-feature.
- Canonical CI remained Green: base **82/82**, People **57/57**, AI **64/64**, Relationship Microcopy **69/69**, Phase 9A **45/45**, 9B **53/53**, 9C **40/40**, 9D **61/61**, 9E **60/60**, 9F **43/43**, 9G **41/41**, Rewind **16/16**, Dynasty **64/64**, Integrated Long-Life **105/105**, Progressive Disclosure **25/25**, minigames **19/19**, and feedback **20/20 + 23/23**.
- Pre-upload local deep preflight passed **6/6**, including content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**; NPC population remained bounded at 125 average peak / 629 maximum.
- Production build remains **197 modules**. People stays lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS stays ~1,240.49 kB / 350.95 kB gzip; existing main-chunk warning remains nonblocking.
- Certified source SHA-256 `34f7dad87faae68d011b1dfba584dba2ca9aea799fa3e191e4790d325a179752`; dependency SHA-256 `d031866fb287b9d2065156f7dea85d0a21f5105f06b76f3941ce600c14d59518`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10376107622` (`9828561e3171a15946581e721094278eb5410977598fadb99233049d9a2ce6d5`); Pages artifact `10376302016` (`9d02b2339c44003f26f7d5032a913bf120455c783983730b7fe0c560a3355031`).
- Post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt, and advanced the checkpoint to `14defab1761b1597bae584f9e0acc5d8bfe11483` at `2026-09-15 01:23:20.426476+00`.

**Historical handoff from Phase 9G:** Phase 10A — Residential Life, now certified in Run #154. The live target is Phase 10B — Working Everthread after the mandatory 10A documentation sync certifies.

### Phase 9F — Cross-World Chemistry (CI Green Run #150)

Run #150 / `20b3026f577db86d821e82129b5c76fa09060413` is the certified Phase 9F historical gameplay/source baseline on save schema **17** and closes **Phase 9F**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- `CrossWorldChemistrySystem` is projection-only over authoritative Relationship, SchoolWorld, Workplace, family/friend, and special-career membership. It owns no chemistry score, affiliation graph, relationship state, or durable outing ledger.
- The authored layer contains **22 contextual plans across 13 context families**. Promoted coworkers/classmates retain their real world context from the owning roster; professional rivals/opposition are deliberately excluded from friendly chemistry plans.
- Contextual outings commit through the certified shared-experience/`RelationshipSystem` path and consume the existing per-person social budget. Existing place/activity/preference definitions are reused; no parallel experience evaluator was added.
- School/work/career progression is not directly mutated by 9F. Existing SchoolWorld, Workplace, and special-career projections respond because they already derive social standing, morale/tension/performance, chemistry/support/cohesion, and related context from real relationships.
- People Threadspace and AI semantic interactions expose the same exact contextual plan/action. The AI music scenario proves a real relationship improvement immediately raises the existing career-world chemistry projection.
- Save schema remains **17**. Dedicated Phase 9F regression is **43/43**. AI interaction testbench is **64/64**, Relationship Microcopy **69/69**, Phase 9A **45/45**, Phase 9B **53/53**, Phase 9C **40/40**, Phase 9D **61/61**, Phase 9E **60/60**, People **57/57**, Rewind **16/16**, Dynasty **64/64**, Integrated Long-Life **105/105**, special-career world **77/77**, combat **51/51**, military **65/65**, politics **80/80**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23**; the complete established wall remained Green.
- Production build transformed **197 modules**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS is ~1,240.49 kB / 350.95 kB gzip; the established main-chunk warning remains nonblocking.
- Certified source SHA-256 `4df9280b04a99dc30ad25363f235c69fc71f147bc2000099280582d9634ee68e`; dependency SHA-256 `03680451a3a9add1209e03c646df5de6d82e1fd44f83426fe715838c1ca2041e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10373864256` (`57aabc641c42c8f34d0dc445207e73754708e5bc838b9aca71b3975251684a7d`); Pages artifact `10373799331` (`a02716ee961aa25819cece73d3e4f86e1e75e72dfbe28c108058e6c6f734c75c`).
- Post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt, and advanced the review checkpoint to `20b3026f577db86d821e82129b5c76fa09060413` at `2026-09-15 00:01:27.362759+00`.

**Historical handoff from 9F:** Phase 9G — Shared Lives Closeout, now certified in Run #152. The live target is Phase 10A — Residential Life after this mandatory documentation sync certifies.

### Phase 9E — Real Gifts (CI Green Run #148)

Run #148 / `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` is the active certified gameplay/source baseline on save schema **17** and closes **Phase 9E**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- Real Gifts now selects an **exact owned personal-item instance** instead of fabricating a `$150` present. `PersonalInventorySystem` remains the sole ordinary-item ownership/removal authority; successful commitment removes one exact instance once, while failed/stale/ineligible attempts preserve it.
- `GiftSystem` projects/evaluates gift choices using the existing Phase 9A 38-tag preference vocabulary and the pure scoring core shared with Phase 9B experiences. It does not create a fake outing/location or a second relationship evaluator.
- `RelationshipSystem` remains authoritative for committed score/opinion/happiness/timeline/memory/preference-reveal/action-economy/RNG consequences. Meaningful gifts may create bounded NPC memories, but no broad NPC inventory/shadow possession ledger exists.
- People Threadspace exposes a mobile exact-item chooser and Gift Approval result. Valuable collectibles/assets remain with their existing Assets/Estate owners. AI semantic parity executes the same exact item-instance engine action.
- Rewind restores inventory plus social consequences atomically; duplicate copies remain distinct; stale instance IDs cannot transfer twice; descendant continuation does not recreate the previous protagonist's ordinary possessions.
- Save schema remains **17**; personal-item catalog remains **24** and preference vocabulary remains **38**.
- Dedicated Phase 9E regression is **60/60**. AI interaction testbench is **58/58**, Relationship Microcopy **69/69**, Phase 8D **63/63**, Phase 9A **45/45**, Phase 9B **53/53**, Phase 9C **40/40**, Phase 9D **61/61**, People **57/57**, Rewind **16/16**, Dynasty **64/64**, Integrated Long-Life **105/105**, Progressive Disclosure **25/25**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23**; the complete established wall remained Green.
- Production build transformed **195 modules**. People remains lazy/code-split at ~37.88 kB JS / 11.69 kB gzip; main JS is ~1,229.92 kB / 348.18 kB gzip; the established main-chunk warning remains nonblocking.
- Certified source SHA-256 `f7a6ae88c9b44736c8afbd5776a46a133403768eaf7b13293b13492958160597`; dependency SHA-256 `65d66454a8375d812706cabfc922065311439405e49542f5b71a2cccb863db87`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10372914569` (`3aba83994b203611a9c09d0f201b76a5c220bea35ff84c4d955b2cfe210b68d3`); Pages artifact `10373447865` (`5b1860077132ff8d3cfb947e77d12c44523604b388fe071f0885ef7a71fe2340`).
- Post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt, and advanced the review checkpoint to `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` at `2026-09-14 23:22:00.588163+00`.

**Historical handoff from 9E:** Phase 9F — Cross-World Chemistry, certified in Run #150 and followed by certified 9G closeout in Run #152. The live target is Phase 10A — Residential Life after the mandatory Phase 9 closeout docs sync certifies.

### Phase 9D — Dating & Romantic Momentum (CI Green Run #146)

Run #146 / `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` is the active certified gameplay/source baseline on save schema **17** and closes **Phase 9D**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- Dating is now a real two-step flow: **Ask on Date** may be accepted/rejected; an accepted invitation persists on the existing `Relationship` until the player completes or cancels it. The player then chooses one of **8 authored date plans** across existing Everthread places/activities.
- `RomanticDateSystem` is projection/eligibility logic over existing NPC, Relationship, orientation, commitment, town-place, and shared-experience truth. `RelationshipSystem` remains the mutation authority for invitations, completed date consequences, relationship score/opinion/happiness, attraction, exact-target timeline, memories, action economy, and gameplay RNG.
- Bounded romantic history lives on the existing Relationship record: at most **8** date entries. Hidden momentum is derived from outcome bands (great/good help, rough/awful can subtract); **3 momentum** unlocks the *attempt* to **Become Partners**, but acceptance remains probabilistic and never guaranteed.
- Existing certified romance rules stay intact: minimum dating age 14, teen↔teen/adult↔adult boundaries, orientation compatibility, exact-NPC targeting, current commitment exclusivity including estranged living partners/fiancés/spouses, and the established proposal/marriage/breakup/divorce/reconciliation/family-planning owners.
- Pending accepted dates survive temporary age incompatibility so the player can still see/cancel them; invariant repair removes malformed/dead-target ghost pending dates. Browsing/options are read-only and RNG/runtime-ID neutral.
- People Threadspace exposes the new mobile Dating surface, last-date approval/prose, pending-date recovery/cancel controls, and **Become Partners** only when momentum is ready. AI semantic parity uses the same production engine path.
- Save schema remains **17**; no migration or second romance score/graph/date engine/memory ledger was introduced.
- Dedicated Phase 9D regression is **61/61**. Phase 9B remains **53/53**, Phase 9C **40/40**, People **57/57**, AI interaction testbench **52/52**, Relationship Microcopy **66/66**, Dynasty **64/64**, Integrated Long-Life **105/105**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23**; the complete established wall remained Green.
- Local deep preflight also passed **6/6**, including content audit and a **1,000-life simulation** with 0 anomalies / 0 forced terminal deaths; average/median lifespan 79.3/82.0, married 63.0%, children 0.31/life, crime 6.8%, convicted 6.1%, fame 25+ 5.1%, and bounded NPC peak population (125 average / 629 max).
- Production build transformed **194 modules**. People remains lazy/code-split at ~35.82 kB JS / 11.25 kB gzip; main JS is ~1,225.97 kB / 347.09 kB gzip; the established main-chunk warning remains nonblocking.
- Certified source SHA-256 `b2bc71aab5c827f50a8c7b9caab8ebace55b9c567ffd975803ecd99472106be5`; dependency SHA-256 `18baf98fbbf620280e6ef062e85cb695484bf7c03a6fde1df15ea01fa82d9be0`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10372681543` (`81a91416305ef0c3b293c7c1dd679319df4d4245ba5f43978f3b80c4e1f17c55`); Pages artifact `10372740361` (`20878aec96f98fcafb45535fbdf206a791f28bd4578583c4f594837240248610`).
- Post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt, and advanced the review checkpoint to `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` at `2026-09-14 22:39:43.562077+00`.

**Historical handoff from 9D:** Phase 9E — Real Gifts, now certified in Run #148.

### Phase 9C — Childhood & Youth Social Life (CI Green Run #144)

Run #144 / `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` is the active certified gameplay/source baseline on save schema **17** and closes **Phase 9C**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- `YouthSocialSystem` is a read-only planner over existing Relationship/NPC/SchoolWorld/town-place/shared-experience truth. It creates no durable youth ledger and no second relationship, school, memory, or location authority.
- **11 curated youth plans** cover ages 3–17 with progressive age filtering: park playdates, home visits, sleepovers, arcade/game outings, movies, current-school socials, stadium trips, cooking, mall/diner hangouts, and park walks. Friendly non-family peers are bounded to a ±3-year age band; existing sibling/half-sibling/step-sibling/cousin relationships remain valid family targets without fabricated peer records.
- The canonical shared-experience registry grows **10 → 12** with youth-bounded `sleepover` and `school_social`. School Social is available only for a current real classmate in an active SchoolWorld. All other plans reuse established 9B activity/place definitions.
- People Threadspace exposes **Spend time together** on eligible youth profiles with real availability reasons and a bounded approval/prose result. The committed action remains `GameEngine.shareExperience` → `RelationshipSystem` → `SharedExperienceSystem`; browsing/planning remains read-only and gameplay-RNG/runtime-ID neutral.
- AI interaction semantics now cover shared outings by exact NPC/place/activity IDs through the real engine. AI testbench regression advances to **45/45** without creating a QA-only gameplay path.
- No save migration is required; schema remains **17**. Adult romance rules, attraction/orientation gates, family planning, school authority, and exact-target relationship behavior remain preserved.
- Dedicated Phase 9C regression is **40/40**. Phase 9B remains **53/53**, People **57/57**, Relationship Microcopy **66/66**, Family Topology **40/40**, Dynasty **64/64**, Integrated Long-Life **105/105**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23**; the complete established wall remained Green.
- Production build transformed **192 modules**. People remains lazy/code-split at ~33.49 kB JS / 10.82 kB gzip; main JS is ~1,217.14 kB / 344.75 kB gzip; the established main-chunk warning remains nonblocking.
- Certified source SHA-256 `a56dfebebee0aefd227dfbca71850dff591d62eef247064ed481cdb8f3bbe689`; dependency SHA-256 `a18b4bac9c33cffe3a798f023efcee7adb05ff5c0f973f6a4c36f9f5ceebe020`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10365740616` (`21efe389a43afb8950185182edc7ea2e5e2897b2f74aa4617499531f993fa5f7`); Pages artifact `10365790597` (`85d5a26d84d9e086180eaa15c2ea8a1212fee786ce53bd503e9bad49c4729082`).
- Post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt, and successfully advanced the review checkpoint to `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` at `2026-09-14 19:32:14.421886+00`.

**Historical handoff from 9C:** Phase 9D — Dating & Romantic Momentum, now certified in Run #146.

### Phase 9B — Shared Experience Foundation (CI Green Run #141)

Run #141 / `f1be1e6bc39482cb613b85bbdad77ea5ca7e9298` is the active certified gameplay/source baseline on save schema **17** and closes **Phase 9B**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- `SharedExperienceSystem` owns one pure reusable evaluation path over exact player/NPC/relationship/place/activity/preference context. Read-only evaluation and option projection consume no gameplay RNG, allocate no runtime IDs, and create no durable parallel state.
- The initial registry contains **10** age-aware shared-experience activities across Weaver Park, Crossroads Mall, Nightjar Diner, Threadwell Residential, Pulseworks Gym, and Everthread Stadium. Results expose bounded 0–100 approval plus coherent prose/outcome semantics while raw preference weights stay hidden.
- `RelationshipSystem` remains the committed-action authority. It consumes the existing social action economy, draws exactly one gameplay-RNG variation, applies relationship/opinion/happiness consequences, records the exact target once, reveals at most one relevant preference through Phase 9A knowledge, and writes only meaningful bounded NPC memories.
- Availability rejects stale/dead NPCs, bad place/activity pairs, undiscovered places, remote participants, and underage participants without mutation. Age-inappropriate taste tags do not influence younger participants.
- No save migration is required; schema remains **17**. The evaluator accepts explicit preference/context inputs so later dates, gifts, childhood social life, and cross-world chemistry reuse this path rather than creating parallel scoring systems.
- Dedicated Phase 9B regression is **53/53**. Relationship Microcopy remains **66/66**, Phase 9A **45/45**, Integrated Long-Life **105/105**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23**; the complete established wall remained Green.
- Production build transformed **190 modules**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; main JS is ~1,216.41 kB / 344.59 kB gzip; established main-chunk warning remains nonblocking.
- Certified source SHA-256 `495b4f0e1c47705e3f822ce86df46cb989412eec7f43cbde9307ebff2e0a8553`; dependency SHA-256 `7c80fdb1e14b0edf35dd2c29b67b1ee9a6ff5ed26e687cea52b5ea00297572d2`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10362674376` (`ba43c8f5039be7053dc38cf4dc0a99b5f40a25110a63e24ba0444971cdc5ad8b`); Pages artifact `10362614619` (`72fb456e5085132b2565ddf7727e82d7743ab24622b583edb6e1e2c39e00c9e7`).
- Fresh post-certification Feedback Inbox read found **4 total / 0 unresolved** and no new receipt. The checkpoint write was blocked by connector safety, so the stored review checkpoint remains Run #137 even though the live read is current.

**Exact next slice:** Phase 9C — Childhood & Youth Social Life. Reuse the certified shared-experience evaluator and existing relationship/preference authorities; do not fork a youth-only social ledger.

### Phase 9A — NPC Interests & Preferences (CI Green Run #139)

Run #139 / `f8ddfe5db0995dceb07969765b34b78f18740e01` certified **Phase 9A** on save schema **17**. Canonical preflight passed 4/4 stages and Pages deployment succeeded; this historical baseline has since been superseded by certified Phase 9B.

- `NpcPreferenceSystem` owns compact intrinsic preference profiles on existing NPC records only; Relationship remains the owner of protagonist-specific learned preference tags. Traits bias profile generation but do not replace preference identity.
- The shared catalog contains **38** age-aware tags. Stored NPC profiles are capped at 4 likes / 3 dislikes / 1 aversion; relationship knowledge is capped at 8 tags, with passive knowledge capped at 6.
- Generation is stable from seed + NPC identity through an isolated deterministic RNG stream and consumes no gameplay RNG counter/runtime IDs. Background NPC storage remains lazy until the protagonist can actually know something about that NPC.
- Schema **16→17** migration creates stable intrinsic profiles for existing relationship targets but deliberately leaves `knownPreferenceTags` absent so upgrades do not fabricate historical social knowledge. Normal play reveals knowledge later.
- People profiles project only known preferences. Read-only profile browsing does not mutate state or reveal hidden weights.
- Dedicated Phase 9A regression is **45/45**. People **57/57**, Rewind **16/16**, Dynasty **64/64**, Integrated Long-Life **105/105**, Phase 8A **25/25**, Phase 8D **63/63**, Phase 8E **34/34**, recovery **10/10**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23** remained Green.
- Production build transformed **188 modules**. People remains lazy/code-split; established main-chunk size warning remains nonblocking.
- Certified source SHA-256 `7ecc001e4c79f113e2f3ac52071fdd1c8d3256ea2eb7cd25720adb19c8cfaca7`; preflight artifact `10359137007` (`60ef75dd3105118723f0af12bcffa173d85c439e55c69c49edbc81f6a7614005`); Pages artifact `10359321568` (`e0234fa05dc501106535fc9694644150181c9203bc48d00fabbeb1734bfb3e1d`).
- Post-certification feedback read attempts were blocked by connector safety. No new inbox result or review-checkpoint advance is claimed; the last successfully reviewed state remains Run #137 / 4 resolved reports.

**Historical handoff from 9A:** Phase 9B — Shared Experience Foundation, now certified in Run #141.

### Phase 8E — Phase 8 Closeout (CI Green Run #137)

Run #137 / `e1aa213fac4e03ab9a4af3039d9605852289b899` is the active certified gameplay/source baseline on save schema **16** and formally closes **Phase 8 — Everthread: Home**. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- `src/core/navigation.ts` centralizes the six primary destinations and the six established Assets sections for direct parity testing; the Assets owner remains a first-class reachable surface.
- Phase 8E makes no gameplay-authority or save-state changes. It proves that Map/Profile routing complements rather than replaces mature Life/People/Activities/Career/Assets access.
- Remaining People/Map secondary controls meet the established **44px minimum touch target**.
- Dedicated Phase 8E Closeout regression is **34/34**. People remains **57/57**, Map **46/46**, Routing **41/41**, Profile/Inventory **63/63**, Threadspace recovery **10/10**, Rewind **16/16**, Dynasty **64/64**, AI testbench **41/41**, Integrated Long-Life **105/105**, base **82/82**, minigames **19/19**, and feedback **20/20 + 23/23**.
- Production build transformed **186 modules**. Map, People, and Player Profile remain independently lazy/code-split.
- Certified source SHA-256 `a9fcef3b305afd578e7ac84e0f3428d5394e9b5c522bd010cce3329d8e7247f1`; preflight artifact `10354132463` (`8c4d3f2e6c4b461150870e59b0a8290be66763897992fb5a0a10a3f49bef1a03`); Pages artifact `10354586748` (`08fb8de646d10252a474957d0890d598c28d7e6fa5fb0695679ed13c8d2682c8`).
- Post-certification feedback sweep remains 4 total / 0 unresolved by triage status with no new report. Stored review checkpoint successfully advanced to Run #137 at `2026-09-14 15:07:04.320301+00`.

**Exact next slice:** Phase 9A — NPC Interests & Preferences. Do not begin broader Shared Lives work ahead of that certified slice.

### Critical Threadspace lazy-load recovery hotfix (CI Green Run #135)

Run #135 / `39523787af658a6907cb82ba0e7b94d964fca82d` is the active certified gameplay/source baseline on save schema **16**. It is a narrow production hotfix after Phase 8D and before Phase 8E; no Phase 8E feature work is included. Canonical preflight passed 4/4 stages and Pages deployment succeeded.

- Lazy People/Map/Profile module-load failures are contained below the app shell instead of escaping to the React root.
- Recoverable dynamic-import failures receive one loop-safe automatic reload; persistent failure preserves header/navigation and exposes Reload Everthread / Return to Life.
- PWA navigation and JS/CSS code fetches prefer fresh network code and legacy shell cache state is purged on service-worker activation. Lazy screens remain code-split.
- Dedicated Threadspace Load Recovery regression is **10/10**; People Threadspace remains **57/57**, Map **46/46**, Phase 8D **63/63**, Integrated Long-Life **105/105**, base **82/82**, and all established suites are Green.
- Production build transformed **185 modules**. Save schema remains **16** and no simulation authority changed.
- Certified source SHA-256 `e9f051d99257edd4c4266c1b4d44665630fff0a012ea9c8a04d5da2bd9971fbf`; preflight artifact `10352906274` (`512e12bbcfea517b8066d58410c4070bdd8e89b12b229b9c3fdaf63d4a23f98a`); Pages artifact `10352803571` (`6f7ce2742ab1b406cf86e030f4269ae70d1e9cecdefc696b0e7abf3963fcd84c`).
- Fresh feedback sweep found 4 total / 0 unresolved with no new report. Connector safety blocked the review-state checkpoint write, so the last successfully stored checkpoint remains Run #133.

**Exact next slice:** Phase 8E — Phase 8 Closeout. Resume only after this hotfix documentation sync is certified.

### Phase 8D — Player Profile & Personal Inventory (CI Green Run #133)

Run #133 / `cf2ede37be5362bc02678a2cc4bec6defa38a837` is the active certified gameplay/source baseline on save schema **16**. Canonical preflight passed 4/4 stages; Phase 8D regression is **63/63**; Phase 8C remains 41/41; Phase 8B remains 46/46; Phase 8A remains 25/25; Integrated Long-Life remains 105/105; all established suites are Green; production build transformed **183 modules**; certified restore smoke/artifact publication and Pages deployment succeeded.

- `PersonalInventorySystem` is the sole owner for ordinary personal possessions. It supports deterministic eligibility, exact Cash purchase, bounded instance ownership, discard-without-refund, and invariant repair while consuming no gameplay RNG.
- The inventory is capped at 80 rows and is deliberately non-financial: personal items do not count toward net worth or estate value. Existing valuable collectibles remain owned by Assets/Estate and are only projected into the profile.
- `PlayerProfileSystem` is read-only projection over existing character, legacy, location, career, education, relationship, appearance, achievement, asset, collectible, and personal-inventory truth. The same lazy `PlayerProfileSheet` opens from Life and the player's Threadspace **YOU** node.
- Schema 15→16 migration creates empty personal inventory deterministically and idempotently with no gameplay-RNG or runtime-ID draw. Rewind restores inventory with the saved state; descendant continuation does not copy ordinary items to the successor, while valuable collectible inheritance stays with established estate logic.
- Phase 8D adds **24** authored personal-item definitions. Shopping is available only when existing location/life/legal/age/Cash/action-economy rules permit it.
- Certified source SHA-256 `79ee41e57885897f4a1efca5a2de8c51884dd975954de9289f8999fb2ffc835e`; preflight artifact `10352225006` (`ddce4db099dca9a0bfca79eef5374dacaab25e1f8e9c5313847f2afc96575030`); Pages artifact `10351555391` (`3a98da45ddcc6069fa4966892c647713f86dc0eb9b9e18a0cd736b6ac1244914`).

**Exact next slice:** Phase 8E — Phase 8 Closeout. Prove navigation/access parity, migration/rewind/dynasty safety, deterministic browsing, mobile/accessibility, and bounded performance before any old navigation is retired or Phase 9 begins.

### Phase 8C — Institution Routing (CI Green Run #131)

Run #131 / `5eca77206c61f7af67d1c12f101fd5c986369e0c` is the active certified gameplay/source baseline on save schema **15**. Canonical preflight passed 4/4 stages; Phase 8C regression is **41/41**; Phase 8B remains 46/46; Phase 8A remains 25/25; Integrated Long-Life remains 105/105; all established suites are Green; production build transformed **178 modules**; certified restore smoke/artifact publication and Pages deployment succeeded.

- The existing 24-place registry now exposes **28 real service doorways** without inventing mechanics for landmark-only locations.
- `institutionRouting.ts` is a UI-only resolver from place service metadata to the four mature owner screens: Life, Assets, Activities, and Career.
- Owner screens consume ephemeral route intent for the appropriate view/anchor and remain authoritative for eligibility, progressive disclosure, actions, money, cooldowns, consequences, RNG, and durable state.
- Bank, vehicle, property, school/college, hospital/gym, airport, civic/business, justice, ordinary-work, special-career, and organized-crime locations now route into their established systems.
- Routing adds no `GameState` field, no alternate location ledger, no runtime-ID/RNG consumption, and no save migration. Save schema remains **15**.
- Certified source SHA-256 `5615d7382b8170be942c825f2c5d8def3a3a2855ce5411e389a4ae9782884db7`; preflight artifact `10336258752` (`c0ce8f6248bcdc113cc6f89c5f38b7c228265c39b6b60c607cb76768a59a6a65`); Pages artifact `10336585276` (`574d8f039938b3b3c46fb161d531b046f16d637515c9312c10016c7bb872d38f`).

**Historical next slice after Phase 8C:** Phase 8D — Player Profile & Personal Inventory, now certified in Run #133. The active target is Phase 8E closeout.

### Phase 8B — Town Place Registry & 2D Flat Map (CI Green; presentation correction Run #129)

Run #129 / `109438ec2d50308c62c061a1c6bed7e0849e157b` is the active certified gameplay/source baseline on save schema **15**. Canonical preflight passed 4/4 stages; Phase 8B regression is **46/46**; Phase 8A remains 25/25; the full established wall remains Green; production build transformed **176 modules**; certified restore smoke/artifact publication and Pages deployment succeeded.

Architecture:

- `src/data/townPlaces.ts` is the static authored place registry: 24 places across 6 districts. Stable IDs/layout/category/activity metadata live here; simulation results do not. Marker coordinates now use the supplied map artwork's native 1536×961 plane.
- `TownMapSystem` is a read-only map projection/math layer. It derives discovery, search/category filtering, semantic view, camera fitting/constraints, culling, and progressive marker/label visibility without mutating `GameState`, consuming gameplay RNG, or allocating runtime IDs.
- Map camera, zoom, search, categories, and selection remain component-local UI state and are intentionally absent from save schema 15.
- `TownMapScreen` is lazy-loaded as the sixth primary tab. It renders the player-supplied authored map artwork as the real visual surface and uses a People-Threadspace-style edge-to-edge workspace beneath the header and above bottom navigation, with cover/fill on entry plus Fit Map for the full-town view. Touch pan, pinch/wheel zoom, large markers, viewport culling, progressive disclosure, and place-detail bottom sheets remain 360/390/412/430px-first.
- Blackline Freight Yard visibility derives from existing organized-crime/legal state; no parallel discovery ledger exists.
- Permanent player emigration is retired by Run #163. External travel remains temporary and browsing the Everthread map does not rewrite residence.
- Place routing metadata is descriptive/forward-compatible only in 8B and points to mature existing tabs. It does not execute institution actions or own finance/property/career/education/legal outcomes.
- Phase 8A remains foundational: Everthread is canonical home and `namePoolCountryId` remains naming culture, never residence.

Post-certification Feedback Inbox sweep found the report table still at four rows with no new receipts; the previously reviewed queue was zero unresolved. The stored review checkpoint was advanced to the Run #129 expanded source.

**Historical next slice after 8B:** Phase 8C — Institution Routing, now certified in Run #131.

## Closed implementation phase

### Phase 7C — Persistent World Conditions (CI Green, Run #122)

Run #122 / `0770106f52eea3182e86d120fa38c6b90be589e4` is the active certified gameplay/source baseline on save schema 14. A fresh post-certification Feedback Inbox review found **4 total reports, all 4 resolved**; connector safety blocked the bookkeeping checkpoint write, so no newer stored checkpoint is claimed.

Phase 7C adds one bounded `WorldConditionSystem` owner for multi-year national/global context. It persists only condition identity/scope/country/duration/intensity plus bounded resolved history and start cooldowns. It owns no economy balances, career records, investments, assets, business revenue, travel state, fame state, or event queue. Seven data-driven conditions project modifiers into the existing owners: Economy, Career, Business/Property through economy indices, Investment, Travel, Fame, and Finance.

Country conditions remain attached to the exact country where they began; emigration makes them irrelevant without deleting history, and returning while one is still active makes it visible/relevant again. Global conditions continue across countries. Annual condition generation uses an isolated deterministic world stream and does not advance the shared gameplay RNG counter. Active state is capped at 4 and resolved history at 48.

The Life screen exposes a compact **World around you** card with title/scope/intensity/remaining years/description/effect summary for currently relevant conditions. Start/expiry use timeline history; Phase 7C creates no parallel popup/delayed-event queue.

Certified save schema is **14**. Schema-13 migration initializes empty world-condition state deterministically with no retroactive conditions, no gameplay RNG consumption, and no runtime-ID consumption. The ordinary random-event pool remains exactly 691.

Canonical Run #122 passed Phase 7C **42/42**, both TypeScript gates, the complete regression wall, Integrated Long-Life 105/105, Phase 7A 36/36, Phase 7B1 33/33, Phase 7B2 35/35, Phase 7B3 36/36, and every established career/finance/family/NPC suite. Production build is green at **170 modules**; certified restore smoke, artifact publication, and Pages deployment succeeded.

**Phase 7 is closed. Stop implementation planning here.** The next product direction must be brainstormed with Mavyy before any new macro phase, feature program, or implementation roadmap is defined.

## Recent corrective history

### Post-6B3 Credit History live-reactivity correction (predeployment candidate)

- Built only on certified Run #102 / `8b2a49fe76c5429cf55228a00a15b6103211a25b`; Phase 6B3 is CI Green on save schema 12.
- Credit & Banking Overview, account details, and Bills & Payments already re-render from the authoritative engine revision. The History transaction lists alone used `useMemo` dependencies keyed to `state.finances.credit.transactions`, while CreditSystem appends transactions in place.
- The correction removes that unnecessary memoization and derives bounded current/prior history directly on render. No debt math, save state, RNG, action economy, or content changes.
- Payment & Asset Management regression now proves the shared read-only History projection immediately reflects newly posted in-place credit transactions; the suite is 81/81 locally.
- Both TypeScript gates, the complete regression wall, and the standalone 153-module production build pass locally. The all-in-one local preflight wrapper is host-time-limited during its repeated Vite transform, so GitHub Actions remains the integrated certification authority.

## Implemented foundations
### Phase 6B3 — Payments & asset management UX (CI Green, Run #102)

- Built only on certified Run #101 / `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`; Phase 6B2 was CI Green.
- Added centralized `PaymentSystem` projection/actions over existing CreditSystem/FinanceSystem truth. Credit-card minimums plus car/mortgage annual obligations are itemized without introducing a second balance ledger.
- Credit & Banking Overview now opens **Bills & Payments** for Cash payment, past-due cure, and annual auto-pay preference. Card auto-pay covers only the required minimum; individual Accounts preserve optional extra/full balance payments.
- Secured manual bill payment credits the next Age Up through `prepaidThroughAge`, preventing duplicate amortization. Auto-pay OFF deliberately creates the same real delinquency/collateral-risk path established in 6B2.
- Property consolidates homes + vehicles with **Browse | Owned**. Owned vehicles can now be sold through a preview/confirmation sheet; financed sale proceeds settle lender payoff first and preserve any deficiency as unsecured debt.
- Save schema advances to 12 with deterministic v11 migration for `autoPay`, `pastDueAmount`, and `prepaidThroughAge`; legacy obligations default to auto-pay ON to preserve old behavior.
- Added Payment & Asset Management regression 79/79. GitHub Actions Run #102 reproduced the complete wall, canonical preflight GREEN 4/4, the 153-module production build, certified-baseline artifact creation, and Pages deployment. Expanded certified source is `8b2a49fe76c5429cf55228a00a15b6103211a25b`.

### Phase 6B2 — Secured delinquency / collateral consequences (CI Green, Run #101)

- Built only on certified Run #100 / `819d223aa9a0d5f9109c705f16213c43ddcaeb31`; Phase 6B1 is CI Green.
- Existing `Loan` remains the liability authority. Secured car/mortgage loans may now persist optional delinquency state (current/delinquent, arrears, missed payments, last missed age) without introducing a second debt ledger or save-schema bump.
- Annual finance no longer amortizes a secured payment that cash flow could not actually fund. A missed payment accrues interest, preserves the remaining term, enters CreditSystem missed-payment history, and creates a durable warning with a one-Age-Up cure window.
- Assets → Money and owned asset cards expose collateral risk. The player can cure the full past-due amount with Cash before aging; Credit Available is not a cure source.
- Leaving a delinquent car unresolved into the next Age Up can repossess the vehicle; leaving a delinquent mortgage unresolved can foreclose the home. Recovery is applied to the secured balance, surplus/equity is represented, and unrecovered deficiency becomes ordinary unsecured debt instead of vanishing.
- In involuntary foreclosure, residual equity reconciles existing unsecured shortfall debt before any remainder returns as cash. Voluntary underwater home sales likewise preserve a real deficiency, closing a debt-erasure exploit.
- Same-year secured shortfall allocation protects housing first by missing car financing before a mortgage when that alone closes the gap; deeper insolvency can make both obligations delinquent.
- Added `assetDelinquencyRegression.ts`: 82/82 locally. Full canonical local preflight from the certified Run #100 artifact is GREEN 4/4; production build succeeds at 151 transformed modules.
- GitHub Actions Run #101 certified expanded source `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`; Asset Delinquency is 82/82 and Phase 6B2 is CI Green.

### Phase 6B1 — Asset Financing foundation (CI Green, Run #100)

- GitHub Actions Run #100 certified expanded source `819d223aa9a0d5f9109c705f16213c43ddcaeb31` from the 6B1 overlay.
- `AssetFinancingSystem` uses `CreditSystem` underwriting as the single creditworthiness authority for deterministic home/vehicle quotes and exact signed `car`/`mortgage` liabilities.
- Mobile **Buy Outright | Finance** exposes lender, approval/decline reason, APR, term, down payment, financed principal, payment obligation, finance charge, full-term cost, and projected burden before commitment.
- Asset Financing is 77/77; Credit & Banking 74/74; Core 82/82; Integrated Long-Life 105/105; all established suites, both TypeScript gates, production build, certified artifact creation, and Pages deployment are green.
- Save schema remains 11.

### Phase 6A — Credit & Banking foundation (CI Green, Run #99)

- Built on certified Run #98 / `5aa1c4338be4edc934b867f4e5a710d0e116aaa2`; GitHub Actions Run #99 certified expanded source `6eb2b7876203d47dcc1ad5c48f1098bf359182cd`.
- Save schema 11 introduces bounded persistent player revolving-credit state with deterministic v10 migration.
- Added `CreditSystem`, six fictional institutions/products, secured starter credit from age 16, deterministic credit profile/offer projection, bounded applications/inquiries, account balances/available credit, statements/minimums, manual payments, interest/fees, account closure/refundable deposits, transaction history, and bankruptcy/estate integration.
- Life shows Cash and Credit Available as separate adjacent values and opens a mobile Credit & Banking hub for Overview, Accounts, Offers/contracts, and History.
- Credit Available never counts as owned wealth. Secured deposits remain assets; card balances remain liabilities.
- Credit & Banking regression is 74/74; Core 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; established suites are green.


### Phase 5C — Persistent NPC asset ownership (CI Green, Run #95)

Phase 5C moves meaningful family wealth beyond aggregate NPC property numbers while preserving the bounded simulation-tier architecture.

- Save schema v10 adds lean `NpcAssetPortfolio` state for individually addressable NPC properties and business interests. Existing v9 aggregate NPC property migrates deterministically into a stable explicit holding without consuming player RNG.
- `npc.wealth` remains liquid wealth; NPC property value is a projection of explicit holdings, and reconciled NPC net worth uses property equity, active business value, and unsecured debt without double-counting mortgages.
- Meaningful NPCs can organically acquire/progress a small bounded portfolio through a dedicated deterministic asset substream. Background-tier NPCs can retain/progress existing or inherited holdings but cannot seed new explicit property at creation or organically accumulate new ones during coarse simulation.
- Player estates can pass retained property/businesses to offscreen adult NPC heirs as real holdings. Minor NPC heirs hold retained assets in protected trusts until adulthood. Adult portfolios and minor trusts are both hard-capped at 6 properties / 4 businesses; overflow liquidates to represented value instead of growing saves without bound.
- NPC death settlement transfers retained assets to player/NPC children, carries mortgage obligations once, preserves the established 55% NPC-estate distribution tuning, and clears the source estate so settlement is idempotent.
- Descendant continuation now preserves the selected NPC's own property/businesses, reconstructs mortgages once, separates unsecured personal debt, and merges personal holdings with the deceased protagonist's estate by stable asset ID.
- People detail sheets expose liquid wealth, property/business value, debt, estimated net worth, and individually named holdings.
- Life timeline presentation now keeps the full authoritative history while rendering the newest 120 entries first and revealing older history in 120-entry increments, preventing multi-thousand-entry lives from creating multi-thousand-node timeline DOMs.
- Dedicated NPC Asset Ownership regression: 82/82. Run #96 deploys Timeline Scaling 11/11 and Action VFX 46/46. Core 82/82, Estate Planning 46/46, Estate Administration 63/63, Integrated Long-Life 105/105, and every established dedicated suite remains green. Both TypeScript gates and the 142-module production build passed; Pages deployed successfully. The earlier 50-life family-policy bulk sanity produced zero anomalies/forced terminal deaths; scale hardening additionally validates 600 starting background NPCs + 3,000 timeline entries over 12 years, while an ad-hoc 1,000-NPC + 5,000-entry / 20-year benchmark completed in ~1.1 s with zero organic explicit background holdings and zero validation errors.
- Run #95 expanded to certified source `62e28aafb190f8b46d10b73fb6dd00985beb724d`; Phase 5C is CI Green.

### Post-Run95 playtest hotfix — CI Green, Run #96

- Life → Your Story no longer memoizes its bounded timeline window by array identity. Because authoritative `GameState` is mutated in place and revisioned externally, Age Up can append entries to the same array reference; recomputing the 120-entry window per render makes the new year visible immediately without navigation or refresh.
- Action VFX snapshots record the timeline length at press time. Newly appended `relationshipDelta` values act as a semantic fallback when relationship scores clamp at 0 or 100, so valid NPC interactions still emit relationship gain/loss VFX even when the stored score cannot move farther. Historical entries are excluded.
- Run #96 reproduced Action VFX 46/46, Timeline Scaling 11/11, Core 82/82, NPC Asset Ownership 82/82, Integrated Long-Life 105/105, every established suite, both TypeScript gates, and the 142-module production build. Expanded certified source is `3b58f04827ddc88a33c61b3cdf0d50f1e7584161`.

### Phase 5D — Broader family topology (CI Green, Run #97)

- `FamilyTopologySystem` derives authoritative player kinship from existing family graph edges using parent/child indexes rather than pairwise NPC comparison. It introduces aunt/uncle and cousin while reconciling the established close-family taxonomy from the same source of truth.
- No NPCs are spawned to fill a family tree. Topology synchronization is deterministic, idempotent, RNG-neutral, runtime-ID-neutral, preserves existing affinity/compatibility, and preserves active/historical romantic labels rather than silently rewriting them.
- Extended kin remain background-tier unless the ordinary meaningful-relationship threshold makes an individual worth full simulation. Their births and ordinary life changes do not automatically flood the player's timeline.
- People folders, Threadspace labels/projection, generic family event selection, delayed family-favor targeting, special-career family targeting, save backfill, and descendant continuation all consume the expanded taxonomy.
- Save loading repairs invariants before deriving topology, and descendant handoff resynchronizes kinship so prior sibling/niece relationships become aunt/cousin when control moves down a generation.
- Save schema remains 10 because topology is fully derivable from existing parent/child/partner truth.
- Family Topology regression: 40/40. Run #97 reproduced every established suite, both TypeScript gates, the 144-module production build, certified artifact creation, and Pages deployment. Expanded certified source is `8e5394d0488d1c760072590ffa5c06eadfdac9f6`.
- Scale proof: a 1,082-NPC real extended-family graph with 180 aunts/uncles and 900 cousins synchronized in ~4.5 ms locally and advanced six years in ~362 ms; normal autonomy grew the cast to 1,182, no extended kin were forced full-tier, and validation returned zero errors.

### Phase 5E — Dynasty transition / end-of-life agency (predeployment candidate)

- Added `DynastyTransitionSystem`, a read-only projection over the authoritative EstateSystem + existing NPC biography/assets. It does not create a second inheritance calculation and consumes no gameplay RNG or runtime IDs.
- Death is now an intentional mobile flow: review the completed life and estate outcome, inspect living-child successor candidates, then explicitly confirm the descendant to continue. A child card no longer instantly commits the generation switch.
- Successor inspection exposes the life already in progress: age/location, education, career, partner/children, health/happiness, fame/reputation, existing debt, personal net worth, owned property/businesses, projected inheritance, named inherited assets, and protected-minor trust timing.
- Estate review exposes gross estate, family distributable value, debts, administration, levy, heir allocations, retained assets, and named forced sales with obligation-vs-fairness reason. It is the same projection used to prove what continuation will apply.
- Confirmed continuation suppresses ordinary action-delta VFX because the before/after states belong to different protagonists; otherwise a generational switch could incorrectly look like money/stress/relationship gain or loss.
- The new protagonist timeline preserves the important settlement story after the death overlay closes: inheritance/trust, obligations and forced sales, named inherited assets, and value distributed to other family heirs.
- Extreme heir/successor/sale lists use 24-row progressive disclosure rather than mounting an unbounded death-screen DOM. Authoritative lists remain complete.
- Dedicated Dynasty Transition regression currently passes 63/63. It proves read-only/RNG-neutral review, written-plan context, adult/minor successor biography, named forced-sale reasons, exact preview→continuation inheritance/asset parity, durable post-handoff history, and 12 reviewed sequential handoffs over hundreds of NPCs with 7,212 archived timeline entries.
- Save schema remains 10; no new persisted transition state is needed. Full established regression wall and both TypeScript gates remain green; production build currently transforms 145 modules.

These are functioning systems rather than navigation placeholders, though some still need additional depth.

### Full NPC life simulation (0.12.0)

Phase 3 moves autonomous people from lightweight surrounding state into persistent resumable biographies while preserving simulation tiers for performance. `NpcLifeSystem` owns autonomous life domains; ordinary NPC records remain the identity/family graph, Social Worlds remain affiliation history, and RelationshipSystem remains the player-facing relationship domain.

- v8→v9 migration deterministically initializes missing NPC education, career, finance/household, health, legal, public-life, and simulation-cadence state without advancing the player RNG stream.
- Important NPCs progress through education, real career history, household cash flow, debt/property, illness, legal incidents/imprisonment/release, fame/reputation/followers, family formation, adoption, household moves, retirement, inheritance, and death. Background acquaintances retain cheaper cadence until a meaningful relationship promotes them to full simulation.
- Blended-family formation can introduce partner children and derives real stepfamily links. Stable low-fertility close-family couples can adopt, while family/relationship progression has bounded pressure against decades of accidental RNG limbo.
- Adult descendant continuation transfers the selected NPC's accumulated biography directly instead of reconstructing major education/health/legal/fame/debt history from generic defaults.
- People detail sheets expose the NPC biography so offscreen life changes remain visible to the player.
- Household relocation moves partners and dependent children together, protects current player spouses/dependent players from silent autonomous moves, and uses a deterministic household-specific RNG substream so relocation cannot perturb unrelated life outcomes.
- Hidden opinion plus recent emotional memory influence relationship drift and targeted-event relevance.
- NPC housing appreciation/debt service uses the bounded economy and real household cash-flow accounting.
- Seeded RNG counter jumps are O(1) while remaining sequence-identical, reducing long simulation cost across every system.
- Verification: 82/82 regressions; eight-generation dynasty stress passes; final neutral/mixed 1,000-life populations each complete with zero anomalies/forced terminal deaths and average lifetime casts ~116 NPCs (max 176).


### Persistent workplace social worlds (0.11.0)

Work is now the second consumer of the persisted Social World layer. Employers own workplace membership, roles, departments, culture, morale, tension, and reputation; ordinary NPC records still own the people; RelationshipSystem still owns the player's evolving personal relationship with them. Former coworkers therefore remain part of work history when a friendship, rivalry, romance, promotion, resignation, or job change alters the current relationship.

- v7→v8 migration initializes part-time employment history and reconstructs persistent workplace worlds for existing current/historical careers.
- Full-time employers generate persistent managers/coworkers, bounded team membership, departments, workplace metrics, and senior-character direct reports.
- Promotions within the same employer preserve the workplace; resignation, firing, layoff, retirement, and employer changes archive it without deleting former coworkers.
- Workplace actions cover collaboration, networking, manager feedback, and formal coworker concerns through the central action economy.
- Career processing now includes workplace-sensitive performance, bonuses, layoffs, demotions, manager effects, morale/tension, and bounded staff turnover.
- Target-aware work events bind exact current coworkers/managers for credit disputes, reviews, rumors, team feuds, after-hours connections, formal claims, and bonus pools.
- Part-time work is now real persisted employment with pay, performance, hours/week, independent small workplace rosters, and a shared weekly capacity that tightens around school/full-time commitments.
- Work affiliation is independent of relationship type: a coworker can become a friend/enemy/partner and still remain discoverable in People → Work.
- Generational handoff clears the previous protagonist's social worlds and reconstructs worlds appropriate to the controlled descendant, preventing inherited offices/schools from leaking across protagonists.
- Verification before deployment: 71/71 regressions; 1,000 neutral and 1,000 mixed-policy lives completed with zero anomalies and zero forced terminal deaths.

### Persistent school social worlds (0.10.0)

School is now the first consumer of a generic persisted Social World layer. Institutions own membership/roles/groups, NPC records own the people, and RelationshipSystem owns the player's evolving relationship with them. This keeps school affiliation intact when a classmate becomes a friend/enemy/partner and gives the upcoming workplace phase the same reusable foundation.

- v6→v7 migration reconstructs school worlds from existing education records without rewriting old education history.
- Country profiles vary entry/transition/leaving ages while retaining primary/middle/secondary compatibility for existing career/content logic.
- Persistent rosters include classmates, teachers, coaches, and leadership; People → School is affiliation-driven rather than relationship-type-only.
- Clubs/teams/groups, attendance, conduct, social standing, honors, discipline, volunteering, academic risk, and admissions/scholarship weighting are implemented.
- School-targeted events bind exact roster NPCs so event copy, effects, memories, and People history refer to the same person.
- Ordinary school acquaintances use a cheaper background simulation tier; important relationships automatically receive full autonomy.
- Compulsory school leaving and school-friend romance age boundaries are enforced at the engine layer.
- Verification: 64/64 regressions; 1,000 distinct neutral and 1,000 distinct mixed-policy population lives completed with zero anomalies/forced terminal deaths, plus a final 500-life mixed sanity batch.

- Seeded character generation and advanced starting-stat controls.
- Centralized primary/secondary stats and talents.
- Ordered one-year Age Up transaction with double-activation lock.
- Event interruption: Age Up pauses final death resolution until a decision is resolved.
- Data-driven event conditions, weighted outcomes, effects, rare-event handling, target-aware context payloads, and delayed consequences.
- Mobile life timeline and death summary.
- Persistent NPC records, relationship scores, memories, personality response modifiers, NPC aging, health drift, real career progression, linked autonomous partnerships, marriage/divorce/widowhood, bounded autonomous children, inheritance, and death.
- Dating, partner/fiancé/spouse/ex states, marriage/divorce/reconciliation, biological children and adoption.
- Country-profile childhood schooling with persistent classmates/teachers/leaders, clubs/teams/groups, conduct/attendance/honors, admissions profiles, scholarships, student debt, graduation/dropout rules, and post-secondary progression.
- 51 standard-career ladders / 306 job positions with requirements, interviews, salary, performance, promotion/demotion, termination/layoff, bonuses, raises, retirement, freelance gigs, persistent workplaces, and real part-time employment.
- Annual finances, tax, baseline living costs, dependent/pet/asset costs, loans, net worth, and yearly summaries.
- Dynamic bounded economy for cost, wage, housing, business-demand, and market-cycle pressure.
- Fictional investment market with stocks, funds, bonds, speculative assets, regimes, buy/sell, and portfolio history.
- Property purchase, mortgage, appreciation/condition, renovation, sale, and basic rental flow.
- Vehicles, boats/aircraft definitions, collectibles, and purchase/condition/value state.
- Business founding, products, employees, demand, reputation, annual P&L, valuation, growth, and bankruptcy state.
- Health conditions, treatment, wellness, fitness, addiction/recovery state.
- Abstract crime, detection, legal cases, lawyer tiers, conviction, prison, prison activities, appeal, and abstract escape outcome.
- Fame/social posting/publicity actions.
- Pets with annual aging/health and interactions.
- Travel, legacy-emigration compatibility repair, visited locations, and license checks.
- Acting, music, sports, combat sports, military, politics, royalty, modeling, racing, directing, organized-crime, museum, zoo, fictional intelligence agency, commune, and casino state tracks.
- Achievements, challenges, progress UI, multi-slot Life Saves, aggregated past-life history, dynamic best-life Family Legacy showcase, death records, and descendant continuation.
- Rewind snapshots for rewind-enabled saves.
- Theme, accent, text scaling, reduced motion, high contrast, sound, haptics, optional notification preference, profanity preference, minigame preference, and autosave preference.
- PWA manifest/service worker scaffolding and app-background autosave.
- JSON save export/import with validation and schema migration.
- Sandbox/debug surface for age, cash, forced death, RNG inspection, and rewind snapshots.


### First mobile playtest hardening (0.9.5)

The first live human playtest exposed same-year action exploits that headless simulations did not reproduce naturally. The 0.9.5 pass hardens those systems at the simulation layer rather than only disabling buttons in React.

- Standard-career applications now enforce actual relevant industry experience for non-entry roles; interview difficulty is no longer a substitute for experience.
- Starting a new job is limited to once per age after a successful hire, preventing same-year job hopping.
- `Work harder` and `Ask for raise` are each limited to one use per age, and standard-role compensation is bounded against the current market pay band so annual raises cannot compound into runaway values.
- Save schema v5 repairs obvious v4 runaway-compensation saves: impossible salary is normalized, an experience-inappropriate current role is corrected, and a clearly identifiable exploit-year cash windfall is reverted without touching ordinary saves or sandbox saves.
- Biological parenting now creates a one-year pregnancy state instead of an immediate birth. A successful conception resolves after the next Age Up, same-year retry spam is blocked, and sibling names avoid duplicates while unused regional names remain.
- Mobile money labels use compact notation for million-plus values so debug/sandbox/extreme-save values cannot widen cards off-screen.
- PWA navigation now prefers the network while retaining an offline fallback, and service-worker cache versioning/update checks make new phone builds surface more reliably after deployment.
- Validation after these changes: 37/37 regressions; neutral and mixed-policy 1,000-life runs both completed with zero anomalies and zero forced terminal deaths.

### Life Saves and dynamic Family Legacy (0.9.9)

The former single-slot `Past Lives` surface is now a true account-level save manager without changing the authoritative per-life `GameState` model.

- Independent new lives allocate stable `slot-N` identifiers in the existing save store instead of replacing `slot-1`. The last selected slot is remembered separately from simulation state.
- The Life Saves tab exposes Ongoing Lives for switching/deleting independent lineages and Past Lives for completed characters aggregated from every surviving lineage.
- Pending autosaves are flushed before switching or deleting. Current state is explicitly persisted before normal switches/new-life creation, preventing queued writes from crossing slot boundaries.
- Imported save JSON becomes a new independent slot rather than overwriting a matching source slot ID.
- Completed deaths record their generation going forward; older saves infer completed-life generation from chronological lineage order, so schema 6 remains compatible without a migration bump.
- Family Legacy is derived from all surviving current/completed lives. Its bounded score combines longevity, primary stats, logarithmic net worth, fame, family, career, and major milestones; a stronger Generation 2 can therefore remain featured while a weaker Generation 4 is active.
- Deleting the save that owns the current featured life automatically removes those candidates and promotes the next-highest surviving life. Individual ancestors inside a surviving lineage are not independently deletable, preserving generation/inheritance continuity.
- Validation after this pass: 57/57 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Relationship graph and playable minigames (0.9.8)

The People tab now uses the persistent NPC graph as a navigation surface instead of presenting every relationship as one flat list. The first real minigame layer also connects player execution to existing simulation outcomes without replacing character progression.

- People now opens into relationship folders: Player Family, Relatives, Friends & Social, Romantic History, School, and Work. Search still spans all direct player relationships.
- Opening a folder renders a mobile relationship tree rooted on the player. Structural edges come only from persisted `parentIds`, `childIds`, and `partnerId`; disconnected direct relationships receive a player link so the tree stays navigable without inventing NPC-to-NPC connections.
- Extended-family branches prefer known intermediate connections. For example, a niece/nephew with a known sibling parent hangs beneath that sibling instead of also receiving a redundant direct edge to the player.
- NPC detail sheets now expose known parent, child, and partner connections alongside memories and interactions.
- The reusable minigame layer now supports timing, sequence-memory, grid-memory, and safety-oriented decision mechanics. Reduced-motion environments automatically substitute a non-motion sequence challenge for timing games.
- Acting auditions, pro-sports contract attempts, combat bouts, motorsport races, and prison-escape attempts now accept minigame performance scores as bounded modifiers. Character stats/skills and seeded world RNG remain part of the final outcome.
- License quizzes remain interactive; when the minigame preference is disabled, licenses and supported special challenges resolve from character skill plus a pure seeded challenge score. Accessibility skip resolution does not mutate the core RNG outside the engine action.
- Validation after this pass: 55/55 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Childhood eligibility and dependent finances (0.9.7)

The second live playtest exposed a separate class of bug from same-year spam: some systems had frequency limits but no concept of whether the player was old enough to perform the action at all.

- Investment trading is adult-only at age 18+ at the system layer and presents a locked mobile state before adulthood. Pet adoption unlocks at age 5 and collectible-market purchases at age 12.
- Independent vacations are adult-only. Family trips unlock at age 5, require a living guardian while the player is a minor, and charge the guardian NPC's simulated household wealth instead of the child's personal cash.
- Structured wellness now unlocks in stages: walking 3+, running 5+, martial arts/meditation 6+, intentional diet activity 10+, gym 13+.
- Dependent minors do not personally absorb ordinary baseline/lifestyle/dependent/pet/property/vehicle costs or annual loan payments. Teen income can still be taxed when actual taxable income exists.
- A negative under-18 cash balance is covered by tracked guardian support instead of becoming an unsecured 12% personal loan.
- Validation after this pass: 51/51 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

### Action economy and anti-reroll hardening (0.9.6)

The first human playtest showed that isolated cooldown fixes were not enough: many buttons represented a full year of meaningful effort but could be tapped repeatedly until the random result became favorable. Everthread now treats yearly opportunity/time as a first-class simulation resource.

- `src/core/actionEconomy.ts` is the central policy registry and ledger API. Systems claim one or more policies atomically; React only queries the same policies for presentation.
- Failed random outcomes consume their opportunity when the attempt itself happened. Rejected job applications, failed auditions, lost fights, failed treatment and similar outcomes cannot be rerolled for free in the same age.
- Career, education, wellness/health, social/relationship, parenting, fame, travel/license, crime/prison, pets, collectibles, business progression, property renovation and major special-career actions now have explicit yearly limits or cooldowns where repetition would otherwise trivialize progression.
- Pure configuration/reallocation actions that do not generate a new outcome, such as investment allocation or business pricing/pay settings, remain intentionally flexible rather than receiving arbitrary cooldowns.
- `GameEngine.run()` now detects action-ledger/RNG/ID mutation even when an action returns `success:false`, ensuring a consumed failed attempt still notifies subscribers and autosaves.
- The React store subscribes to a private engine revision number rather than mutable `GameState` object identity, so every engine emission reliably invalidates the UI snapshot.
- Save schema v6 persists the ledger and migrates legacy annual career/family markers into it.
- Relationship marriage/reconciliation counters were moved into the owning relationship domain instead of being patched after the engine action emitted.
- Mobile controls on the major action surfaces disable once the same engine policy is exhausted, so the player receives immediate feedback instead of learning only from an error toast.
- Validation after this pass: 47/47 regressions; neutral and mixed-policy 1,000-life populations both completed with zero anomalies and zero forced terminal deaths.

## Verification milestone

Added in the current hardening pass:

- Framework-independent deterministic regression suite: 64 passing tests.
- Multi-life simulation harness with `full` and faster `bulk` modes, independent aspiration profiles, six behavior policies, and wealth-percentile reporting.
- 1,000-life bulk run completed with zero detected structural state anomalies.
- Content audit executable from source data.
- Event selection refactored from scanning/rolling all 670 definitions every year to category-indexed routine selection plus a small exact-probability rare-event pass.
- Adult dating age bounds fixed.
- Parenting now rejects a biological path when either partner is below the game's minimum parenting age.
- Descendant inheritance no longer duplicates retained estate assets as full cash value; inherited mortgages remain attached to retained properties.
- Descendant relationship rebuilding now preserves parent/sibling/spouse/child structure instead of converting nearly everyone into a generic friend.
- Economy indices changed to bounded relative conditions so century-long lives do not destroy fixed game-currency milestones through nominal inflation.
- Existing standard-career wages now move with the same wage index used by newly hired workers.
- Achievement evaluation reduced from duplicate annual evaluation and optimized with indexed progress / per-evaluation metric caching.
- Multi-heir estate settlement now normalizes living beneficiaries, pays non-mortgage estate debts, divides investments proportionally, allocates retained businesses/properties/collectibles against heir entitlements, and sells indivisible assets when retaining them would badly violate the estate split.
- NPC heirs receive their offscreen estate value instead of the controlled descendant silently receiving every retained asset.
- Continued adult descendants preserve an established standard career, spouse/partner, children, grandchildren, grandparents, siblings/half-siblings and selected friendship context where the persistent NPC graph supports it.
- Wealthy NPC parents can now leave inheritance directly to the player character; lifetime inheritance and inheritance count are tracked for achievements/diagnostics.
- Investment lifetime contributions/withdrawals and current cost basis/gain are tracked for balance analysis.
- Long-run fictional security drift was recalibrated for the bounded relative economy; volatility, bubbles and crashes remain while average real compounding is lower.
- Annual finances now include modest income-scaled discretionary lifestyle costs so high earners do not unrealistically bank every unspent salary dollar.
- Three-generation continuation and wealth-source reconciliation are covered by regression tests.

### Latest 1,000-life balance samples

Neutral-policy sample after the 0.9.8 relationship/minigame pass (headless balance behavior unchanged):

- Average / median lifespan: 78.6 / 81
- Average / median net worth: 1,210,543 / 637,451
- Wealth p10 / p25 / p75 / p90 / p99: 95 / 196,880 / 1,586,107 / 3,038,895 / 6,699,815
- Millionaire ending net worth: 40.5%
- Marriage frequency: 51.9%
- Average children: 0.53
- Any crime / conviction: 6.8% / 6.7%
- Fame 25+: 5.7%
- Average ending wealth sources: 707,011 cash / 117,743 property equity / 372,394 investments / 15,046 businesses / 1,651 other debt
- Average investing: 125,965 lifetime contributions / 125,034 held cost basis / 247,360 held unrealized gain
- Inheritance: 94.6% of lives receive some inheritance / 131,793 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

Mixed-policy sample:

- Average / median lifespan: 79.1 / 82
- Average / median net worth: 1,461,598 / 840,742
- Wealth p10 / p25 / p75 / p90 / p99: 4,863 / 244,661 / 1,759,906 / 3,533,598 / 9,083,312
- Millionaire ending net worth: 45.3%
- Marriage frequency: 54.8%
- Average children: 0.69
- Average ending wealth sources: 841,672 cash / 122,984 property equity / 455,253 investments / 43,318 businesses / 1,629 other debt
- Average investing: 161,931 lifetime contributions / 160,911 held cost basis / 294,342 held unrealized gain
- Inheritance: 93.8% of lives / 132,348 average lifetime inheritance
- Forced terminal-age deaths / anomalies: 0 / 0

The market-calibration conclusion from 0.9.4 still holds: inheritance is not the dominant wealth source, and the headless policies underuse optional lifestyle consumption compared with a human. The 0.9.6 action economy prevents retry/grind exploits; 0.9.7 adds age eligibility and dependent-finance semantics without attempting to force an arbitrary millionaire percentage.

## Partially complete / needs deeper implementation

### NPC simulation

0.12.0 completes the Phase 3 foundation identified in the original scope gap. NPCs now persist education/credentials, real career histories, household cash flow/debt/property, health conditions, legal incidents/custody, fame/public reputation, household moves, partnership/family/adoption/blended-family state, emotionally relevant memories/opinions, inheritance, and death. Adult descendant handoff consumes that real history directly. Future NPC work is additional depth rather than a missing life-simulation foundation:

- More occupation/education-specific autonomous choices, richer household consumption, and NPC-owned businesses/vehicles/individual property assets rather than aggregate property value.
- More nuanced chronic-health treatment trajectories, criminal/legal branching, public-life careers, friendships between NPCs, and explicit non-player social organizations.
- Wider kin taxonomy (aunts/uncles/cousins) and more complex multi-household custody/guardianship where later generation work justifies it.
- Continued very-large-dynasty profiling as special careers, organizations, and world systems add more persistent NPC affiliations.

### Supplied action/static feedback assets — CI Green + universal-derivation hardening candidate

Mavyy supplied an original Everthread icon set for press-origin action feedback plus static Cash and DECEASED UI markers. The current candidate adds one reusable, presentation-only VFX authority instead of per-screen animation code: successful career/domain actions may request a primary icon while real post-action deltas derive stress, money, follower, and relationship feedback. Disabled actions do not execute and therefore do not emit; failed-but-executed actions may still show real adverse deltas. Touch origin is captured globally, keyboard activation uses the control center, reduced-motion avoids travel animation, and the effect never consumes game RNG or mutates saves.

The supplied artwork is technically processed only for transparency/cropping/downscaling; it is not regenerated or restyled. Static Cash appears on Life and DECEASED overlays dead Threadspace nodes. GitHub Run #93 made the asset integration CI Green at `de8f9af6a0212a0d90acecf9008afa77b042ac42` with Action VFX 38/38 and canonical preflight 4/4.

The current hardening candidate changes derived consequences from opt-in to default-on at the shared result resolver. Plain gameplay buttons now automatically emit Money Loss for real cash decreases, alongside stress/follower/relationship deltas; primary-domain requests automatically combine with those consequences; `derive:false` remains the intentional opt-out. Generic Path buttons no longer disable derivation simply because they lack a primary icon. Action VFX is 42/42 locally, every legacy suite is green, and production build passes.

### Generations and inheritance

The green Phase 5A foundation performs multi-heir estate settlement, proportional investment division, deterministic indivisible-asset allocation/sale, offscreen sibling inheritance, asset-specific property/business/collectible bequests, spouse/child residuary shares, protected minor trusts, and preservation of established adult descendant careers/spouses/children plus deeper family derivation.

Phase 5B is CI Green in Run #92 and adds fictional country-sensitive estate settlement rules without new persisted state: protected administration allowances, capped administration costs, levy allowances/rates, debt-before-levy calculation, and a single obligation path that can liquidate unassigned assets/investments before sacrificing a named bequest. Preview UI exposes the breakdown and explicitly labels the values as fictional gameplay rules. Dedicated estate-administration regression includes five-generation no-income anti-duplication stress. Save schema remains 9.

Next Phase 5 work after the universal-derived-VFX hardening reaches CI Green:

- NPC-owned businesses and individually addressable properties/assets rather than the current aggregate NPC property-value model.
- Aunt/uncle/cousin relationship types if the relationship model is expanded beyond the current supported taxonomy.
- Broader large-family performance validation across many sequential generations.
- Stronger death → estate review → descendant-selection presentation and consequences.

### Finance/debt

Loans, mortgage underwriting, annual shortfall debt, foreclosure, bankruptcy and a five-year post-bankruptcy mortgage lock now work as engine systems. Remaining depth:

- Car loans and optional personal-loan acquisition UI.
- Repossession for financed vehicles.
- Richer missed-payment / creditworthiness state instead of the current mortgage-miss counter.
- Voluntary bankruptcy UI and longer recovery consequences.
- Financial-hardship event chains and creditor/household consequences.
- More nuanced affordability rules across countries and household structures.

### Education / school social life

0.10.0 now provides the persistent school social layer: rosters, teachers/leaders, recurring classmates, activity groups, conduct/attendance/honors, profile-driven stage timing, targeted school events, and richer admissions/scholarship scoring. Remaining depth after this milestone:

- Larger school-event libraries and multi-year school consequence chains.
- More nuanced transfers, expulsions/re-entry, boarding/private/public variants, and school-specific facilities/culture.
- Richer team seasons, competitions, elections, awards, and group-specific minigames.
- More country/subregion profile variation beyond the current simplified profiles.
- Alumni reunions and later-life resurfacing events that explicitly leverage archived school worlds.

### Workplace

0.11.0 completes the persistent workplace foundation identified in the original scope gap: managers/coworkers, departments/roles, workplace metrics, recurring interactions, layoffs, demotions, bonuses, reporting/dispute paths, rumor/feud/social events, relationship evolution, employer history, and multiple part-time jobs with shared hour limits all use the same Social World/NPC/Relationship architecture. Future additions are depth rather than missing foundation:

- More industry-specific workplace cultures, hazards, unions/professional bodies, schedules, and employer archetypes.
- Richer multi-year workplace consequence chains and alumni/former-coworker resurfacing.
- More nuanced management spans, departments, transfers, mentorship, performance reviews, and severance/benefits.
- Workplace-specific minigames only where they add meaningful optional interaction without replacing character skill.

### Special careers

The state tracks and basic actions are real, but most special paths are not yet at the specification's intended depth. Acting, music, sports, combat, politics, military, royalty, modeling, racing, directing, organized crime and specialized organizations need dedicated content/events, progression gates, contracts, rivals/teams/casts/staff, retirement/end states, and richer mobile screens.

### Minigames

The first reusable interactive layer is now implemented. Timing, sequence-memory, grid-memory, and decision mechanics are available; acting auditions, pro-sports attempts, combat bouts, motorsport races, prison escape, and license checks are wired into live gameplay. Remaining depth:

- Direct interactive deployment and flight-specific challenge flows beyond the current reusable sequence/decision mechanics and license path.
- More sport-specific, acting-specific, and racing-specific variants so repeated careers do not feel like the same skin over one mechanic.
- Haptics/sound feedback, richer difficulty scaling, and device/accessibility QA.
- Event-driven minigame hooks where a challenge is optional and consequences remain valid when minigames are disabled.

### Events / consequences

691 event definitions exist and routine selection is efficient. The first five multi-year consequence chains now preserve exact NPC/origin-age context. Remaining work:

- Expand delayed consequences across parenting, crime/legal history, property, business, school, and special careers.
- Event cooldown currently follows recent-event history rather than storing an exact last-trigger year.
- Convert more existing relationship events to pre-bind specific persistent NPCs.
- National/world event layer remains shallow.
- More special-career, business, legal, prison, property, parenting and old-age follow-ups are needed.

### Mobile / accessibility / PWA QA

The shell is mobile-first and has safe-area CSS/accessibility settings, but final device QA has not been completed for all target widths (360/390/412/430px), browser screen readers, keyboard-only use, installability, offline cache upgrades, iOS standalone behavior, and Android standalone behavior.

## Known architecture / quality issues

1. Exact seeded replay includes state-scoped runtime IDs and has a 50-year serialization regression. Remaining replay risk is future code introducing wall-clock/random state outside seeded systems; keep the replay test mandatory.
2. The centralized action ledger now covers the major profitable/progression-bearing player actions, but every new action must be classified deliberately as unlimited configuration, resource-limited, yearly-limited, cooldown-based, or consequence-escalating. Avoid reintroducing ad-hoc button spam paths.
3. Simulation policies are separated and wealth-source diagnostics are available. Neutral and mixed populations should remain the balance baseline; do not tune core costs around a headless bot that still underuses optional lifestyle purchases.
4. Bulk simulation suppresses achievement/challenge evaluation and truncates timeline history intentionally for performance. Full-mode runs remain the correctness reference.
5. Save schema migration covers versions 1→12. Every future persisted state addition needs an explicit default/migration path, and old rewind snapshots must continue to migrate before restoration.
6. No runtime error boundary / last-known-good transaction backup exists yet around every important action. IndexedDB persistence is versioned, but crash-safe transactional recovery needs hardening.
7. Full React/Vite production builds require installed npm dependencies; local engine/tests are compiler-validated in the current workspace and GitHub Actions remains the authoritative dependency-backed mobile deployment gate.

## Save schema history

### Version 1

Initial centralized life state.

### Version 2

Added travel history and license state.

### Version 3

Added inheritance configuration and rewind snapshots; migration fills missing achievements/challenges/completed lives/special-career/flag structures.

### Version 4

Added persisted `idCounter` for deterministic state-scoped runtime IDs. Migration initializes a deterministic post-legacy counter and rewind restores migrate older snapshot payloads before use.

### Version 5

Added persistent family-planning/pregnancy state and targeted repair for obvious pre-fix runaway compensation/career saves from the first live mobile playtest.

### Version 6

Added the persisted centralized `actionLedger` with per-age usage, last-used ages for cooldowns, and a revision counter used by `GameEngine` to detect failed-but-mutating outcomes. v5 migration preserves legacy annual career/family action markers where present.


### Version 7

Added persisted `socialWorlds` for school/workplace/organization membership and school-specific roster/group/conduct state. v6 migration reconstructs school worlds from existing education records so old lives retain their educational history while gaining persistent school affiliations.

### Version 8

Added persisted workplace-specific Social World state plus real `partTimeJobs` / `partTimeHistory`. v7 migration reconstructs workplace worlds from existing career records, while generational handoff rebuilds social worlds for the newly controlled descendant rather than carrying the prior protagonist's institutions forward.

### Version 9

Added persistent `NpcLifeState` biographies and simulation tiers. v8 migration deterministically initializes missing NPC education/career/finance/health/legal/public-life/household state without consuming the player RNG stream; adult descendant handoff can now transfer this accumulated history directly.

### Version 10

Added lean persistent NPC property/business portfolios and protected NPC asset trusts. v9 migration deterministically promotes legacy aggregate NPC property value into bounded explicit holdings without consuming player RNG. Phase 5D and Phase 5E add no new persisted fields: broader kinship and the death/estate/successor review are deterministic projections over existing authoritative state while remaining on schema 10.


### Version 11

Adds bounded player revolving-credit authority under `finances.credit`: accounts, current/recent transactions, formal inquiries, derogatory history, and compact archived positive-history summaries. v10 migration initializes an empty deterministic credit state without consuming gameplay RNG.

### Version 12 — current

Adds durable payment-management state while preserving existing debt authorities: per-card/per-secured-loan annual auto-pay preference, explicit card past-due amount, and secured-loan paid-ahead age. v11 migration defaults existing obligations to auto-pay ON, carries no new RNG consumption, and preserves 6B2 delinquency state.

## Next development sequence

1. Certify the post-6B3 Credit History live-reactivity correction against Run #102 / `8b2a49fe76c5429cf55228a00a15b6103211a25b`. Do not begin 6C until this correction is GitHub Actions Green.
2. Phase 6C: deepen personal loans, voluntary bankruptcy, recovery/rehabilitation, and hardship consequences using the same payment/credit/finance authorities.
3. Phase 7: expand exact cooldowns, long-term delayed consequences, persistent target-aware follow-ups, and national/world events across the whole simulation.
4. Perform target-device mobile/accessibility/PWA QA and add crash-safe last-known-good transaction recovery around major engine actions.
5. Expand regional names substantially and verify long-dynasty repetition rates.
6. Run save-migration, large-family, full-mode and 10k/100k bulk simulation gates before release labeling.

## Post-6C household-finance correction candidate

The current correction separates household support from personal finances. Newborn cash is zero, ordinary supported-child costs are excluded from the player's annual ledger, and financial independence is explicit state rather than inferred solely from age. Existing adult saves without the flag migrate to independent behavior for compatibility. System-owned milestone/crisis events live outside the random-event content pool so the established 691-event pool and RNG behavior remain stable. Financial crisis events do not overwrite already-due delayed stories. Automatic insolvency bankruptcy was removed in favor of the existing voluntary bankruptcy authority. Save schema remains 12.

Local QA: engine TypeScript PASS; test TypeScript PASS; core 82/82; Credit & Banking 75/75; Personal Borrowing & Recovery 31/31; Household Finance & Crisis 21/21; Integrated Long-Life 105/105; all other established suites PASS; production build PASS at 155 modules. CI certification is still required.
