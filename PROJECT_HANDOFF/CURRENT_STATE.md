# Everthread — Current State

## READ THIS FIRST IN A NEW CHAT

The newest certified expanded **gameplay/source** is **GitHub Actions Run #190** (`35175656593`) on expanded source **`ebf2ed8eb3a40276e055ce098818398add28b0d6`**, save schema **17**. Runs #189–#190 player-harden the Run #187 dedicated location-scene foundation with immersive full-bleed presentation and a unified collapsible utility drawer while preserving the existing Town Map, gameplay action owners, action economy, and all save/simulation authorities. **Phase 10 — Living Everthread and the Living World Program remain CLOSED / CERTIFIED; this location-scene rollout is post-closeout presentation/navigation work, not Phase 11.**

- Package: `everthread-life-unwritten@0.12.0`
- Certified save schema: **17**
- Phases 4–7: **CLOSED / preserved**
- Phase 8 — Everthread: Home: **CLOSED / CERTIFIED**
- Phase 9 — Shared Lives: **CLOSED / CERTIFIED**
- Phase 10 — Living Everthread: **CLOSED / CERTIFIED**
- Phase 10A — Residential Life: **CERTIFIED / CLOSED**
- Phase 10B — Working Everthread: **CERTIFIED / CLOSED**
- Phase 10C — Generational Place Memory: **CERTIFIED / CLOSED**
- Phase 10D — Living Map Projection: **CERTIFIED / CLOSED**
- Phase 10E — Program Closeout: **CERTIFIED / CLOSED in Runs #165–#166**
- Final Phase-10 feedback polish: **CERTIFIED / CLOSED in Run #166**
- Feedback Inbox is verified **5 total / 0 unresolved by triage**; durable review-state points to newest gameplay source `ebf2ed8eb3a40276e055ce098818398add28b0d6` at `2026-09-17 02:48:02.61955+00`, reviewed count **5**.
- Direct Android/player-side QA previously confirmed the Map sheet/navigation/Music Studio corrections and Everthread-only Airport travel rule.
- Current active player-facing direction is the dedicated **location-scene rollout**. Run #187 certifies Weaver Park + Threadtone Music Studio as the first two scene-backed map places; Runs #189–#190 incorporate the first direct player-review presentation pass and drawer hotfix. Expand further only after player review confirms the polished interaction model; the remaining Astra location assets are not yet certified/shipped. Character Visual remains a separate approved direction with Runs #170–#185 preserved, and additional Yuki age-stage art can still plug into that existing contract later. No Phase 11 label is implied.

If memory, an older handoff, or a historical chat conflicts with this status, the certified repository wins. Read `LIVING_WORLD_PROGRAM.md` before designing the next macro direction so closed authority boundaries are preserved.

Last handoff synchronization: 2026-09-16
Repository: `MavyyBlue/everthread`
Default branch: `main`
Public build line: `0.12.0 pre-release`
Certified save schema: `17`
Candidate save schema: none

## Newest certified gameplay/source — Runs #189–#190 — immersive scene polish + utility-drawer repair

- Run #189: upload wrapper `5873f70ad500a43b1feaecd5444d136768294468`; expanded source `7509d29baa2538e1e69c7938b1bdba9e3cc29efd`; Actions Run ID `35173827772`; job `105051024289`. It changes exactly **4 source/test files** over synchronized Run #188 `97d8b988cb100568ef164495559c34806a4a1805`.
- Run #189 makes artwork full-bleed with one shared cover transform for background/hotspots/props, makes the internal header/hotspots transparent overlays, gives copy black-outline/shadow readability, replaces numbered hotspot badges with a hand interaction affordance, and adds a local collapsible utility surface. No gameplay/save authority changes.
- Player testing exposed one composition bug: the chevron was positioned independently from Things to do + Map. Run #190 repairs this by making all three one shared utility drawer. `locationSceneUtilityTrayState` projects `expanded | collapsed | hidden`; collapsed retracts the complete button row and leaves only the handle above navigation; object/detail panels hide the whole drawer.
- Run #190: upload wrapper `67307cac76713b9cc26d06ede39e421f1b4508f6`; expanded certified source `ebf2ed8eb3a40276e055ce098818398add28b0d6`; Actions Run ID `35175656593`; job `105056670426`. Net diff from Run #189 is exactly **4 intended source/test files**.
- Location Scene regression **40/40**; Map **46/46**; institution routing **42/42**; Shared Lives **53/53**; Dating **61/61**; Music **76/76**; lifecycle **48/48**; Secret Yuki **36/36**; Character Visual **76/76**; Yuki Art **19/19**; Dynasty **66/66**; Long-Life **105/105**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**. Canonical Run #190 preflight **4/4 Green**, **34,252 ms** total.
- Production build **222 modules**. Town Map ~**32.62/10.03 gzip kB** JS and ~**24.42/4.66** CSS; People ~**58.82/17.86**; character-art pack ~**971.11/69.18**; main ~**1,360.79/380.22**.
- Run #190 source SHA `5ab9129e4301e9e35622ccc04cfe52e67ed613084c5ba78583ddac0ad7cce603`; dependency SHA `18709e220caaf49ba0557f9eccc2b1dcc5987dbe14af4186d7ef3971db59ac18`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10478273242` (`128140b302c6de30b4770ce94ddf559384fdfa7cf7154629c0e87f388960f661`); Pages artifact `10477874907` (`e7b2273920147d9aa85bcbefadf8d314c709a2ff5ec2c79a2c5da3004bfc11d0`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved by triage**; checkpoint `main` → `ebf2ed8eb3a40276e055ce098818398add28b0d6` at `2026-09-17 02:48:02.61955+00`.
- Next gate remains another player-facing pass of the polished Park + Threadtone shell before widening migration to additional Astra locations.

## Prior certified gameplay/source — Run #187 — dedicated location scenes first slice

- Upload wrapper `f3898378133f48f7b60816f3cfb46596f554c781`; expanded certified source `c68757f75f38f76fc616589450b1a39b41e1b6d0`; Actions Run ID `35170740515`; job `105041659840`. Net diff from synchronized Run #186 `e1787ac018d47b580dd49ac9854c087fc07ec729` is exactly **12 intended source/test/asset files**.
- Only Weaver Park and Threadtone Music Studio are scene-enabled. The map stays mounted underneath; returning preserves local map camera/filter/search state and keeps the originating pin selected. Other town places continue their existing behavior until separately migrated/certified.
- Weaver Park routes park-bench social/date actions, trail wellness, and pavilion meditation through existing owners. Threadtone routes music exit/retirement, practice/tour, song/album release, catalog, and partnership-offer interactions through existing music/career/action-economy authorities. No duplicate action implementation or scene-owned simulation state is introduced.
- Shared room geometry is data-driven and uses authored 1024×1536 `contain` layout, semantic hotspots, ≥48px targets, readable label anchoring, and a **Things to do** fallback with action parity. Android/system Back unwinds detail/picker → object menu → room → preserved map.
- Four Astra runtime assets are shipped for the two certified scenes. The rest of the 25-location source drop remains unshipped design input. Save schema remains **17**.
- Location Scene regression **34/34**; Map **46/46**; institution routing **42/42**; Shared Lives **53/53**; Dating **61/61**; Music **76/76**; lifecycle **48/48**; Secret Yuki **36/36**; Character Visual **76/76**; Yuki Art **19/19**; Dynasty **66/66**; Long-Life **105/105**; feedback **20/20 + 23/23**. Canonical preflight **4/4 Green**, **61,250 ms** total.
- Production build **222 modules**. Town Map ~**31.63/9.66 gzip kB** JS and ~**22.96/4.38** CSS; People ~**58.82/17.86**; character-art pack ~**971.11/69.18**; main ~**1,360.79/380.23**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `8225082ce4b5489ceb2efd59a7260afa5a0f3893555b97f38170ac1e1ae69cee`; dependency SHA `a0add8575bcb362a98de2379a894d215f3b1f1d4eb6cf0a0be5318668e2d86b2`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10477005329` (`88d522000bd1865d8deba4945e3e023ed10e64dbe08aabda8aa8e61251a48f01`); Pages artifact `10477005335` (`0cbd4c99776cbc127208060ecfd57937e1ea9a49877d7ccc7e32ecfdf40b6b5a`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved by triage**; checkpoint `main` → `c68757f75f38f76fc616589450b1a39b41e1b6d0` at `2026-09-17 01:34:16.880968+00`.
- Player review of these two rooms is the gate before expanding scene migration to additional locations.

## Prior certified gameplay/source — Run #185 — Secret Yuki durable provenance-routing hotfix

- Upload wrapper `6bbd4a7aef2dc876748f056d2fcecdcb040ba0ce`; expanded certified source `d3760daa841f21e4a73bd4a22bbcd5f6560b08a4`; Actions Run ID `35121435267`; job `104879924533`. Net diff from synchronized Run #184 `f8842340b36dc69e10c5481449576927c9f7fab7` is exactly **5 intended source/test files**.
- Player reproduction exposed an authority bug rather than save corruption: the exact secret Yuki NPC and `secretCode:yuki:9426` flag still existed, but the old `secret_yuki_9426` origin memory had been pruned after the NPC reached the intentional 36-entry relationship-memory ceiling. Because routing still inspected that bounded memory, Threadspace opened the ordinary profile.
- `secretYukiNpcId(state)` now resolves the existing durable secret-code flag first and only uses the origin memory as a legacy-recovery fallback. `isSecretYukiNpc(state,npc)` and `peopleSurfaceForNpc(state,npc)` route the exact flagged NPC. Ordinary/decoy Yukis remain ordinary even if names or visual fields match.
- Font family, text color, theme, and other presentation settings cannot affect provenance. No memory cap was weakened, no new identity ledger was added, no save schema/migration/content change was introduced, and normalization remains deterministic/RNG- and runtime-ID-neutral.
- Secret-code regression **36/36**; People **57/57**; Character Visual **76/76**; Visual Identity **12/12**; Yuki Art **19/19**; base **82/82**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**. Canonical preflight **4/4 Green**, **66,135 ms** total.
- Production build **218 modules**. People ~**58.82/17.86 gzip kB**; Player Profile ~**10.20/2.95**; character-art pack ~**971.11/69.18**; main ~**1,360.69/380.17**; CSS ~**87.92/16.19**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `12235fce17c4bf551887937413767cb9dc4071cbfb2add27167fc6fb6fdc74dc`; dependency SHA `e240824d278b823e095058fed93dc02c18da4915bf38709b696a16982b2a958b`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10457241561` (`afe8df394ead5d1c583828814393c065595497f609d3bfb100521b32c3f0558e`); Pages artifact `10457561283` (`38863e6d029dd864df9e978e34706810369c36759735b78fc34688c47751106b`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved by triage**; checkpoint `main` → `d3760daa841f21e4a73bd4a22bbcd5f6560b08a4` at `2026-09-16 16:25:10.400372+00`.

## Prior certified gameplay/source — Run #183 — Character Visual richer aging/presentation

- Upload wrapper `8988105410ed6af26e5ddc505cbf5b571db6f511`; expanded certified source `ecd7e58c32a3145e8354f7397b70fc14d1feaf64`; Actions Run ID `35040783887`; job `104619936027`. Net diff from synchronized Run #182 `948b7f3bda7fcbe7d801ec1994b36a50ac7b447c` is exactly **4 intended source/test files**.
- One pure `characterAgePresentation` projection derives visible stage presentation from authoritative person age + stable visual identity. No age shadow field, save mutation, migration, runtime-ID allocation, or gameplay-RNG consumption is introduced. Save schema stays **17**.
- Natural hair colors gray on a deterministic person-specific 48–64 onset and then progress silver → white; already silver/white and stylized/dyed colors remain authored. Underage work clothing is projected to youth-casual clothing, facial hair is hidden below 15/light-only at 15–17, and mature/elder ages layer the supplied facial-aging details.
- `CharacterPortrait` and Player Profile now share the same age-aware visual/palette/description projection, preventing mismatched visible age details or hair-color copy.
- Character Visual **76/76**; Player Profile **63/63**; People **57/57**; Family Visual **27/27**; Secret-code **32/32**; Yuki Art **19/19**; base **82/82**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**. Canonical preflight **4/4 Green**.
- Production build **218 modules**. Player Profile ~**10.20/2.95 gzip kB**; People ~**58.81/17.86**; character-art pack ~**971.11/69.18**; main ~**1,360.67/380.18**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `dd824f03b0ad2095a6f254f7afba2d63fb094237b1324cfd214bd0fde86d498d`; dependency SHA `fdd414a7d14e6fcba1d0d667bc840208faa7df9de0771c6ed0aab4eaa985a362`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10424553271` (`c9c7460178067d9eabb4cb944c4ec3378827ae93c9d23a76661726c1952d8e49`); Pages artifact `10424359343` (`5a20b80bcf345df9644945a1f5c0a5b389549169402680ccfa42b250cf29800f`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved**; checkpoint `main` → `ecd7e58c32a3145e8354f7397b70fc14d1feaf64` at `2026-09-16 00:39:27.036715+00`.

## Prior certified gameplay/source — Run #181 — Yuki Threadroom viewport/fallback hotfix

- Upload wrapper `703516842c2e09a07ab298e60ec4dadce80490a4`; expanded certified source `fd304ae097dbb5fccab52085fd32ab838b011887`; Actions Run ID `35035042349`; job `104602148567`. Net diff from Run #180 `3d33429bed185c9c382a21f9926fda362fba79b9` is exactly **3 intended files**.
- Full-screen Threadroom now portals to `document.body`, so ordinary app chrome cannot cover the special surface. Higher-priority global overlays retain their own layering authority.
- Non-Astra fallback portraits use dedicated compact square scene geometry. Painted/reactive Astra Yuki remains adult-stage-only (18–44); age 0/child/teen/mature/elder keep modular age-aware portrait rendering.
- Yuki Threadroom Art regression **19/19**; Secret-code **32/32**; Character Visual **60/60**; Family Visual **27/27**; base **82/82**; People **57/57**; Dynasty **66/66**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**. Canonical preflight **4/4 Green**.
- Production build **218 modules**. People ~**58.81/17.86 gzip kB**; People CSS ~**22.57/4.69**; character-art pack ~**971.11/69.18**; main ~**1,358.35/379.57**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `aea29e68948a539fb6c3e34718fea5c2faf6f687adc7901d9bf41033a7be1d7c`; dependency SHA `81bd74d91f8a789f01d8ba6bae72e290fe378d0664cc94f180c71d33d9260400`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10423216985` (`7a71b8b856d2e00c66ad3612b1ff6a2700fb9f63ec2ca138dadee45d275ab38d`); Pages artifact `10422897873` (`a4d360a39e81ad4a5121f9ee3a8047796fb95fcee4a5bd36c228e6cfab2b552b`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved**; checkpoint `main` → `fd304ae097dbb5fccab52085fd32ab838b011887` at `2026-09-15 23:20:12.674778+00`.

## Prior certified gameplay/source — Run #180 — Reactive Astra Yuki Threadroom art

- Upload wrapper `01740bedf5a79c4578f77a238ff2af7aec39224d`; expanded source `3d33429bed185c9c382a21f9926fda362fba79b9`; Run ID `35033324379`; job `104596639702`; exactly **48 intended files** (7 source/test + 41 selected presentation assets).
- Reactive painting, day/evening backgrounds, face patches, icons, timers, and responsive composition remain UI-only over the existing Yuki NPC/Relationship. No special affection/mood ledger or animation save state exists.
- Painted adult art is restricted to ages 18–44; other ages use the modular portrait inside the same special room. Run #181 fixes the player-reported full-screen stacking/fallback geometry issue.
- Run #180 canonical preflight **4/4 Green**, Yuki Threadroom Art **18/18**, production **217 modules**.

## Prior certified gameplay/source — Run #178 — Secret Yuki / Hidden Threadroom

- Upload wrapper `ef2d29fea290d6d23b7e3ae310fada6e58a356eb`; expanded certified source `7eb71a218a2f35cfe807df9d2caaf7b2a86ff9b2`; Actions Run ID `35025458317`; job `104571277415`. Net diff from synchronized baseline `73512a2666290c980ba6841528bf811cd45fe932` is exactly **9 intended source/test files**.
- Secret code `9426` creates the same single persistent Yuki Aster NPC + Relationship as before, but now materializes one curated stable portrait. A `secret_yuki_9426` NPC memory records the secret origin, but Run #185 supersedes it as the live routing authority: the already-existing `secretCode:yuki:9426` flag is durable provenance because NPC narrative memory is bounded. Display name alone is never sufficient for special behavior.
- `normalizeSecretYukiState` repairs already-spawned randomized/current-schema Yuki saves to the authored identity and portrait reveal without recreating the NPC, changing relationship/history, consuming gameplay RNG, or allocating runtime IDs. Save schema remains **17**.
- People selection routes the exact secret-origin Yuki to the dedicated full-screen Hidden Threadroom. Ordinary NPCs—including decoys with the same name/visual fields that are not the flagged secret NPC—continue to use the ordinary profile.
- Hidden Threadroom presentation consumes the existing `CharacterPortrait`, Relationship, NPC memory, action-economy, and GameEngine authorities. Six authored conversation topics plus relationship-aware greeting/status are read-only projections. Quick interactions call ordinary engine social actions; mature dates, gifts, milestones, family planning, residential experiences, and other systems remain available through the existing profile actions doorway.
- Childhood redemption remains age-matched/friendship-appropriate and all established dating/reproduction age/sex gates remain authoritative.
- Secret-code / Hidden Threadroom regression **32/32**; Character Visual **60/60**; Family Visual **27/27**; base **82/82**; People **57/57**; Threadspace recovery **10/10**; Family Reproduction **52/52**; Age-Aware Reproduction **22/22**; Family Topology **40/40**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life responsive **8/8**; minigames **19/19**; feedback regressions **20/20 + 23/23**. Canonical preflight **4/4 Green**.
- Production build **215 modules**. Lazy character-art pack ~**971.11/69.18 gzip kB**; People ~**50.76/15.18**; main ~**1,358.35/379.57**; CSS ~**87.92/16.19**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `c91e04d2fa246a4af4421ea48fe32b7fea543c5d48160a8afa4fc0d7e78f6fe2`; dependency SHA `d5a1c173c3bffb7ae194d1c7b0beaa07ebbdf086ee7a35d718cacde7ead62fa6`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10418778648` (`d3179b417effdcf6d57f13651b94fd4445d40d2c749ad86d17e18a2e9e49c0e9`); Pages artifact `10419241565` (`e1d8ece084efb23bd17f8bdf3935c4e3da2d2ed864bd9758126ad086c1198a3b`); deployment succeeded.
- The transient post-Run-#178 Supabase outage later recovered; current durable feedback checkpoint is Run #181.
- Run #183 certifies the richer general aging/presentation slice; the next visual slice is selected after player review/feedback.

## Prior certified gameplay/source — Run #176 — Family resemblance + visual inheritance

- Upload wrapper `8e2ad27b7f37f759dcfbb20fd975334c8b93fdb1`; expanded certified source `f01d1847ba943b285c61d2fb787298ecb76d08ff`; Actions Run ID `35021096077`; job `104556658034`. Net diff from synchronized baseline `3c6b781fada2deb7894e98fc0f9baf25dfcec9e0` is exactly **8 intended source/test files**.
- Existing family topology remains authoritative. Optional `Npc.appearanceParentIds` stores only biological visual provenance for new modeled biological children; adoption does not set it, and old saves do not infer biological provenance from historical `parentIds`.
- `NpcVisualSystem` inherits nine structural/color traits from available biological visual contributors while leaving hairstyle, body, clothing, facial hair, details, eyewear, accessories, and expression individual. Siblings share a deterministic family anchor plus child-specific variation, preventing clone-like families.
- One-known-parent children blend that known contributor with their own deterministic base. Multi-generation resemblance propagates through the parent's actual visual identity rather than direct grandparent lookup. Once `Npc.appearance` materializes, that exact face is permanent and parent appearance/style changes cannot retroactively rewrite it.
- Background descendants remain visually lazy: provenance can persist without forcing a portrait into every NPC record. Inheritance projection is deterministic and gameplay-RNG/runtime-ID neutral. Save schema remains **17**.
- Family Visual Inheritance regression **27/27**; Character Visual **60/60**; base **82/82**; People **57/57**; Visual Identity **12/12**; Family Reproduction **52/52**; Age-Aware Reproduction **22/22**; Family Topology **40/40**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life responsive **8/8**; minigames **19/19**; feedback **20/20 + 23/23**. Canonical preflight **4/4 Green**.
- Production build **212 modules**. Lazy character-art pack ~**971.11/69.18 gzip kB**; People ~**42.29/12.50**; main ~**1,357.50/379.07**; CSS ~**87.92/16.19**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `8ec0d5d05f48d28539a75e99582c84ebf171d04c0ec8d0c3080c171aeb1046b6`; dependency SHA `40193bb92ce6e8f4a27ea713d5c2a6c2aa20499ccf455c118d9e2a564ee7abc9`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10417129753` (`836f6e4ba345c6c48d059e093ded8fbaf2d3ee78767bb3b32bf3308c496da2dd`); Pages artifact `10418125056` (`d5e2136e1c533e7ddac5d57e80bb1eca07f067468133b64f4e4c176835000e33`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved**. Review checkpoint `main` → `f01d1847ba943b285c61d2fb787298ecb76d08ff` at `2026-09-15 20:42:29.766439+00`, reviewed count **5**.
- Next planned Character Visual slice: richer aging/presentation behavior over the same stable identities.

## Prior certified gameplay/source — Run #174 — NPC Character Visual identity + relationship reveal

- Upload wrapper `33ed012e757b4f76caf86602045519bab879da56`; expanded certified source `69117c363124615a35683d03cbc0ab7a06472c06`; Actions Run ID `35016561442`; job `104541388963`. Net diff from doc-synchronized baseline `fcc09814455ae9dabcc86a37ad7a6964dcb133e0` is exactly **11 intended source/test files**.
- Existing NPC/Relationship truth remains authoritative. `Npc.appearance` optionally stores the exact stable modular portrait identity; `Relationship.portraitRevealed` stores only protagonist-specific learned face knowledge when relationship type does not already imply that the face is known. No duplicate NPC graph, avatar database, or familiarity score exists.
- Close family and established romantic types reveal immediately. Other exact NPCs can reveal through existing familiarity evidence such as time known, relationship strength, learned preferences, and dating history. Learned portrait knowledge persists when relationship state later worsens.
- Background-only and unrevealed NPCs remain visually lazy. Read-only projection and deterministic normalization consume neither gameplay RNG nor runtime IDs. Runtime invariants only normalize newly revealed/missing identities; save-load repair may fully normalize current-schema data once.
- Threadspace nodes and People profiles render silhouettes or the same `CharacterPortrait` identity according to the reveal projection. Descendant continuation preserves the successor's existing NPC face, and the deceased prior protagonist preserves their existing portrait in family-history NPC state.
- Save schema remains **17**. Character Visual **60/60** and Dynasty Transition **66/66** now cover the new contracts. Canonical preflight **4/4**; base **82/82**; People **57/57**; Visual Identity **12/12**; Player Profile **63/63**; Rewind **16/16**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life responsive **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build **212 modules**. Lazy character-art pack ~**971.11/69.18 gzip kB**; People ~**42.29/12.50**; main ~**1,355.82/378.21**; CSS ~**87.92/16.19**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `480f726cb369600aca7e1b391ac2fe20cdae6e6ae8d6526ec35e8b773b3b0828`; dependency SHA `5e3657ac306c699139c79de6d2107fbf3de60371e83fc69a33412b9b1cc3cab9`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10416325194` (`6d41bc18a628d0e0ce55de43612d4d4b6389d15e488226c914b82295e8154ff6`); Pages artifact `10415871928` (`b0ea1db2735c03925ba0c29845ac2272dfa3bdf6b6f58e98cda3e65e88281f95`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved**. Review checkpoint `main` → `69117c363124615a35683d03cbc0ab7a06472c06` at `2026-09-15 19:59:39.246769+00`, reviewed count **5**.
- Run #176 now certifies family resemblance/inheritance using the existing family topology and visual identities. Richer aging/presentation remains the next planned Character Visual slice.

## Prior certified gameplay/source — Run #172 — New Life responsive hotfix

- Upload wrapper `a2ab156e54cc0a18e13354435a0d50ecb633eed1`; expanded certified source `5cf52a39d79f0835c2d9682e21d40c9ace7498c1`; Actions Run ID `35006276096`; job `104506709088`. Net diff from synchronized baseline `704def1523d652ca9ca24660d86ff14565a88f60` is exactly **3 intended files**.
- Fixes New Life horizontal clipping on narrow phones at the owning layout rule: two-column rows now use zero-minimum grid tracks and their controls/content can shrink inside the grid. The sheet's overflow behavior was not used to hide the symptom.
- Added New Life responsive layout regression **8/8**, covering 360/390/412/430px and enlarged text-scale cases. No GameState, save, RNG, portrait identity, content, or schema changes; save schema remains **17**.
- Canonical preflight **4/4**; Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build **211 modules**. Lazy character-art pack ~**971.11/69.18 gzip kB**; main ~**1,354.43/377.84**; CSS ~**87.30/16.11**. Existing >700 kB warning remains nonblocking.
- Certified source SHA `c33df60a9811907ae0dc8d4d58b1d8e6fd86aea7a7041d8f5e99db0d1b924d17`; dependency SHA `3cb9249bb0e386b953e1561493692f23150e7be192108746b220da4824447783`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10410969204` (`9fc873a757e510e9883459eb13e3921343d096785064da4687272501c698868f`); Pages artifact `10411442227` (`7c8193b1e2ee60600efaa4293bd27af663fdbf0306f2f9ef22475d6658a009b8`); deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved**. Review checkpoint `main` → `5cf52a39d79f0835c2d9682e21d40c9ace7498c1` at `2026-09-15 18:17:43.686626+00`, reviewed count **5**.

## Prior certified gameplay/source — Run #170 — Character Visual foundation

- Upload wrapper `a620ac8b0a97458d05e66e11ac578163fb231dd1`; expanded certified source `ef87fb8011b8ec9d6dc606c328db9b1c0882d942`; Actions Run ID `35001748216`; job `104491526661`. Net diff from synchronized baseline `2e94523a451454b94cbbee49179f0efbb62b0900` is exactly **15 intended source/test files**.
- New Life now exposes a tappable portrait/silhouette that opens a mobile Character Creator. Back discards working edits; Save commits the draft and returns the resulting portrait to New Life. Creator option sections are collapsible local UI state with selected-value summaries.
- Existing `character.appearance` remains the identity authority. Richer component IDs are optional/backward-compatible; deterministic normalization is idempotent and consumes no gameplay RNG/runtime IDs. Historical appearance RNG draw placement is preserved, with richer cosmetics derived separately so seeded gameplay outside appearance does not drift.
- Astra's **624 modular SVG assets** are compiled into one lazy character-art runtime pack. The same stable portrait identity can render through six supplied age stages without creating a second character record. Player Avatar/Profile surfaces read the same appearance.
- Save schema remains **17**. NPC reveal/familiarity, family resemblance/inheritance, and deeper aging are not implemented in this slice.
- Canonical preflight **4/4**; Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build **211 modules**. Lazy character-art pack ~**971.11/69.18 gzip kB**; main ~**1,354.43/377.85**; CSS ~**86.96/16.06**. Established >700 kB chunk warning remains nonblocking.
- Certified source SHA `072c290101bd8853dca4e3e16a6af7e8d9cdc4ecadb332747db4e66f0fe4be7f`; dependency SHA `7890670ea96fa0ba70b95d7fd86ab72fcd2f96fece67cf48efa0d4512b30042b`; lock SHA `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10409358703` (`cc14a60e8b90a825060b7176c623f1e7b805f2330e17b307157ee64ac6cf48c8`); Pages artifact `10408949701` (`4490a5915f52b189ce46e0f3bff5c1de42c1eb7931cd317555ccba55a0bb834e`); Pages deployment succeeded.
- Fresh Feedback Inbox sweep: **5 total / 0 unresolved**; no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint remains at its prior stored value because the connector rejected the write in this session.

## Newest certified gameplay/source — Run #168 — post-closeout UI iconography / theme reactivity

- Upload wrapper `3cf72e36ed002880391e1a683cb846171e364423`; expanded certified source `f68ffacf47c1fd208f836666fca3b1010a517c85`; Actions Run ID `34973140255`; job `104394090082`. Net diff from synchronized baseline `5e4f226341a5d28f1c70e67bf5dc72ece358a44f` is exactly **25 intended presentation/integration/test files**.
- Appearance/theme synchronization now keys off a deterministic scalar signature of visual settings, closing the in-place-mutation render gap identified by the Astra audit without changing GameState ownership or save semantics.
- The approved Astra icon set is integrated as local vector presentation: 25 canonical Map place pictograms plus shared navigation/control/result glyphs. Existing place IDs, routing, discovery, eligibility, VFX snapshot authority, and gameplay systems remain unchanged.
- Canonical preflight **4/4**; UI iconography/theme **183/183**; Action VFX **58/58**; Visual Identity **12/12**; base **82/82**; People **57/57**; AI **82/82**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 8E **34/34**; 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E **20/20**; 10E **103/103**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build **206 modules**. Town Map ~9.77/3.59 gzip JS + ~12.64/2.65 CSS; People ~41.18/12.12; Player Profile ~10.29/2.98; main ~1,277.82/362.39. Existing >700 kB warning remains nonblocking.
- Certified source SHA-256 `a76e2eb38cb9aa10f67ce8a0f5f5948fe94fc64d638edabeca8e9059a6387ae5`; dependency SHA-256 `b61b136d41557e6422fdb85983fadd6c93fa97dcc6b395df7f620a52bb4352f9`; lock SHA unchanged `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10398407272` (`2683be9ae642bb99d04ff0a7f7e767b6ea3389557eab1cd5e603b898787a0a6e`); Pages artifact `10397848707` (`5fb24e99f02db634a292aab8a2018b0fcd337ce1f2342aa98f4a68baa546331f`); Pages deployment succeeded.
- Feedback Inbox: **5 total / 0 unresolved**; checkpoint `main` → `f68ffacf47c1fd208f836666fca3b1010a517c85` at `2026-09-15 13:10:53.355932+00`.
- This slice does not reopen the Living World Program or define a successor macro phase.

## Newest certified gameplay/source — Run #166 — Phase 10 final closeout

- Run #165 upload wrapper `2c8dd8c39e8b8266f954d6549f9ebc61a28ac806`; expanded source `241276179e91df50796403376143b9404bf13ec4`; Actions Run ID `34939954283`. Run #165 certified the integration-only Phase 10E closeout at **91/91** with no production gameplay changes.
- Run #166 upload wrapper `97b06be342eecfcd2d0fd23cfb0f3cd6d2baa061`; expanded certified source `7523f6919ad808f7d826c42cd471d61e1f4f4678`; Actions Run ID `34941015941`. Net diff from Run #165 is exactly **5 intended Map/projection/test files**.
- Existing place sheets now expose bounded **Memories here** from Generational Place Memory: actual meaningful event text plus current/prior-generation age/year context when available. Importance-1 routine history is excluded, family landmarks remain distinct legacy context, and hidden-place discovery cannot be bypassed.
- Run #166 canonical preflight **4/4**; Phase 10E **103/103**; base **82/82**; People **57/57**; AI **82/82**; Estate Administration **63/63**; Rewind **16/16**; NPC Assets **82/82**; Family Topology **40/40**; Dynasty **64/64**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 8E **34/34**; 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E **20/20**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production: Vite 7.3.6, **203 modules**. Town Map ~9.58 / 3.52 gzip JS + ~12.25 / 2.59 gzip CSS; Player Profile ~10.29 / 2.98; People ~41.15 / 12.11; main ~1,270.14 / 358.72. Existing >700 kB warning remains nonblocking.
- Certified source SHA-256 `881e1167d5fa0234f90a454ac3568d4c596c7e738f35b36c7850646d73e277b8`; dependency SHA-256 `34c67ece879908cb137cb8ef569cabe06010ff6a7a2afb3acf485a8ce971e4df`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10385013113`, digest `b417362907b8b8534ebb89f62e08dd0e07ccbcc947cace8c28486a05bee92a3a`; Pages artifact ID `10384973333`, digest `caca1bcdf7f4ade6940a27e61b4577432308cacc826d584c0a09a86bfe5f7e3b`; Pages deployment succeeded.
- Certified content totals remain **691 events / 25 town places / 29 routed services / 24 personal inventory items / 38 preference tags**.
- Feedback is **5 total / 0 unresolved**; `ET-20260915-86A6BA86` resolved as a deployed suggestion with fix commit `7523f691...` and certification Run #166.
- **Phase 10E and Phase 10 are CLOSED / CERTIFIED.**

## Prior certified gameplay/source — Run #163 — pre-Phase 10E player-tested corrections

- Run #162 upload wrapper: `3c117cd69a4af99557e8c40e12a80b58ecb9737b`; expanded certified source: `5834f9fc6de6327797c969542eb3fdcd07b4e13b`; Actions Run ID `34936352466`.
- Run #163 upload wrapper: `6dab74794cf7f0af3cc7ebcdb12a0a95693eba5e`; expanded certified source: `ab40d66808e0950f041a72681d573401926de8c0`; Actions Run ID `34937808322`.
- Run #162 fixes shared Map sheet vertical touch scrolling/stacking, trims permanent bottom navigation to **Life / People / Map** with one contextual routed fourth tab, and adds **Threadtone Music Studio** as the 25th authored place / 29th routed service into the existing Music owner.
- Run #163 makes **Everthread the only permanent player residence**. Vacations and family trips remain temporary external travel; they never rewrite canonical residence. The compatibility emigration action is mutation-free; legacy current-schema emigrated saves normalize deterministically/idempotently back to Everthread without consuming RNG/runtime IDs or discarding historical travel/biography.
- Save schema remains **17**. No second residence, household, travel-history, Map, or Music-career authority was introduced.
- Run #163 canonical preflight **4/4**. Pre-10E UX **20/20**; base **82/82**; Music **76/76**; AI **82/82**; Integrated Long-Life **105/105**; Phase 7C **42/42**; 8A **25/25**; Town Map **46/46**; Routing **42/42**; 8E **34/34**; 9B **53/53**; 10B **50/50**; 10D **50/50**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: Vite 7.3.6, **203 modules transformed**. Town Map ~8.92 kB / 3.32 kB gzip JS; Player Profile ~10.29 / 2.97; People ~41.15 / 12.10; main ~1,269.79 / 358.61. Established >700 kB warning remains nonblocking technical debt.
- Run #163 certified source SHA-256 `f8d7d6b59f13ec032d3fde5e031bb38ca3bf1947990e4e30a23bd16775b3257f`; dependency SHA-256 `4572bc66299fc92c2f067fe443fabd0c61c80d67b288be2ba103212e34393eeb`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10384556377`, digest `ff9ed03979076ea931b174c5383adde3c2e1ca1e76ba863c4b143beb6705bb88`; Pages artifact ID `10384640209`, digest `3a9a6e2d6e067a6d8a1db56ca2a644762a7311066d776cea148ccfcf53dcff8f`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `ab40d66808e0950f041a72681d573401926de8c0` at `2026-09-15 06:46:01.03675+00`.
- Certified content totals: **691 events / 25 town places / 29 routed institution services / 24 personal inventory items / 38 NPC preference tags**.
- Direct player-side verification confirmed the Airport fix works.
- **This historical pre-10E gate is CLOSED / CERTIFIED. Phase 10E subsequently closed in Runs #165–#166.**

## Prior certified gameplay/source — Run #160 — Phase 10D Living Map Projection

- Upload wrapper: `321c92ce7ff4cb3ef96df7e10f523a6c5496b795`.
- Expanded certified source: `8ce87ad1e812ed94a9918684b3b52452826f0ce9`.
- GitHub Actions Run #160: `34933437352`.
- Net diff from synchronized repository source `8cbc3e209aa2f8982289d0649f2686cd936cf045` is exactly **7 intended Phase 10D source/test/UI files** (**3 added, 4 modified**). Workflow import reports 8 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. `LivingMapSystem` is read-only projection over Residential Life, Working Everthread, Generational Place Memory, Property, child education, and Town Place truth; there is no persisted living-map/context/pin ledger.
- Exact facts project to existing place anchors; district-only work/company facts stay district-level. External/emigrated facts do not receive synthetic Everthread placement.
- The existing 24 map markers gain bounded context treatment/counts and a **Your life here** section. District context is lightweight/noninteractive. **Your life on the map** is an ephemeral Explore toggle; camera/filter/selection state remains presentation-only.
- Context is bounded to **6 per target / 32 total** and same-kind context aggregates source IDs/counts. Map discovery/search/routing/culling remain intact; hidden-place discovery is not bypassed.
- Phase 10D regression **50/50**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **82/82**; Town Map **46/46**; Routing **41/41**; Phase 8E **34/34**; Rewind **16/16**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 10A **69/69**; Phase 10B **50/50**; Phase 10C **50/50**; Phase 9A–9G remained Green; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: Vite 7.3.6, **203 modules transformed**. Town Map ~8.92 kB / 3.32 kB gzip JS + ~11.25 kB / 2.46 kB gzip CSS; People ~41.15 kB / 12.11 kB gzip; Player Profile ~10.29 kB / 2.97 kB gzip; main ~1,270.49 kB / 358.71 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `d9ffad5a5b7edbdd898a7726eb3c4616b706eddecd0ecc6bc69820aa2073686d`.
- Certified dependency SHA-256: `d9509533484e7c6a7cf2f824fbbd69bbe0c320d9b9c131b4df4f6bc6251444bd`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10382985407`, digest `35d4493836c5befd621f31117b8fbae225bb5d7abe65879455c55ef7f20b1fac`.
- Pages artifact ID `10382109382`, digest `9d8e8a62cda11a198b43442eda4d53b54f0deff87e2cc8b41b2237e156c655bb`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `8ce87ad1e812ed94a9918684b3b52452826f0ce9` at `2026-09-15 05:38:31.538933+00`.
- Fresh certified-source content audit remains unchanged at 691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 NPC preference tags.
- Pre-upload local canonical wrapper was container-time-limited; GitHub Run #160 is the final certification authority.
- **Phase 10D is CLOSED / CERTIFIED. Its historical next step was 10E; the later player-tested correction gate in Runs #162–#163 is now the live certified boundary.**

## Prior certified gameplay/source — Run #158 — Phase 10C Generational Place Memory

- Upload wrapper: `9c4626ce19b4197609019bbcfde15b1ad2bbb8f0`.
- Expanded certified source: `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790`.
- GitHub Actions Run #158: `34931959983`.
- Net diff from synchronized repository source `0cd6ecfef5ded8256c22d7246f852b1c15728c68` is exactly **19 intended Phase 10C source/test/UI files** (**3 added, 16 modified**). Workflow import reports 20 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. Meaningful Timeline milestones may carry an optional canonical `placeId`; CompletedLife may carry a bounded derived `placeMilestones` index. This does not replace the full Timeline, and legacy schema-17 completed lives without the snapshot derive it on read.
- Existing inherited property provenance remains family-home truth. Existing Business records now preserve optional founded/inherited provenance and immediate predecessor identity; inherited companies keep their Working Everthread base through NPC/player estate conversion. Unknown old family provenance is never invented.
- `GenerationalPlaceMemorySystem` projects surviving family homes/businesses plus significant current/prior-generation milestones read-only. Bounds: **24 total memories**, **8 places**, **6 memories/place**, **12 completed-life place milestones**, recent **12 completed lives**. Family landmarks receive priority under caps.
- Player Profile surfaces a compact place-legacy section and Assets identifies surviving inherited family companies. Map rendering remains Phase 10D responsibility; 10C adds no persisted map marker/filter/camera state.
- Phase 10C regression **50/50**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **82/82**; Rewind **16/16**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 10A **69/69**; Phase 10B **50/50**; Phase 9A–9G remained Green; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: Vite 7.3.6, **202 modules transformed**. People ~41.15 kB / 12.10 kB gzip; Player Profile ~10.29 kB / 2.97 kB gzip; Town Map ~6.97 kB / 2.82 kB gzip; main ~1,265.72 kB / 357.31 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `566b8e47ce302afc45653dc7c9efd6ad677957761f433a35373cbdec97708cad`.
- Certified dependency SHA-256: `9dca2d20b81675b5e3f4de775a4f70869edbd527b9d93c5fe7891b17b93bbeb6`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10381209515`, digest `ddec7d0513401516b45c956218404d9d690f1558f63e087b631b8f1e66bb76ae`.
- Pages artifact ID `10380859910`, digest `e21ed363a9c293e0574a02cf73b668ab128f467a690711e38ab3e7e374a0990d`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790` at `2026-09-15 05:17:22.77373+00`.
- Fresh certified-source content audit remains **691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 NPC preference tags**.
- Local canonical/deep wrappers were constrained by the development container execution ceiling and are not claimed as a local 6/6. Run #158 is the certification authority; independent local gates and matched baseline performance control were Green pre-upload.
- **Phase 10C is CLOSED / CERTIFIED. Exact next slice after this docs sync certifies: Phase 10D — Living Map Projection.**

## Prior certified gameplay/source — Run #156 — Phase 10B Working Everthread

- Upload wrapper: `20b8359cb5bc306fbcb457a737027c56fb76fcc2`.
- Expanded certified source: `a497aa1bbec357fe12755383acb7053ab5d0ea67`.
- GitHub Actions Run #156: `34927243187`.
- Net diff from the prior synchronized repository source `2f29dfb7aaa17efdb35325383ed8d4fb4d84f390` is exactly **14 intended Phase 10B source/test/UI files** (4 added, 10 modified). Workflow import reports 15 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. Work-place meaning is projected over existing SchoolWorld, Workplace/SocialWorld, Business, Town Place, and character/NPC location truth; there is no persisted Working Everthread ledger.
- Local current schools resolve to the existing School/College anchors. Active full-time/part-time workplace worlds resolve deterministically by industry to existing districts and landmarks. Remote work/school worlds stay remote and receive no Everthread district.
- Player-founded businesses preserve their physical base on the existing Business record; NPC business holdings preserve that base through estate conversion. Relocating a protagonist does not teleport a company, and inherited companies do not rebase to the successor. Legacy repairs are deterministic/idempotent and consume no gameplay RNG/runtime IDs.
- Career and Assets surface the derived work/company location labels; AI semantic inspection exposes the same projections. Projection browsing is read-only and leaves certified 10A residence meaning unchanged.
- Phase 10B regression **50/50**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **78/78**; Relationship Microcopy **69/69**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 10A **69/69**; Phase 9A–9G remained Green; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build: Vite 7.3.6, **201 modules transformed**. People ~41.15 kB / 12.10 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; Town Map ~6.97 kB / 2.82 kB gzip; main ~1,259.21 kB / 355.87 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `eb3fb05357822c18bc52585de60c4dc6838eed1ff51e9f857adf3c883897d83a`.
- Certified dependency SHA-256: `46ecae009f310c130b64ad1efa141d9755bdd793ff3682f0b61cba8daa186394`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10380297168`, digest `4dfc38542f7510b4d5dbddd33e11aadfdeec97ed32e4326ee9a09561f0daaa17`.
- Pages artifact ID `10380680116`, digest `8acb6ef7976cd0078f5ff5e2e26f186e5e26352399c6b82fd0e5aaa20021acd0`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `a497aa1bbec357fe12755383acb7053ab5d0ea67` at `2026-09-15 04:33:34.506272+00`.
- Fresh local content audit after certification remained unchanged at 691 events / 24 town places / 28 routed institution services / 24 personal inventory items / 38 NPC preference tags.
- **Phase 10B is CLOSED / CERTIFIED. Exact next slice after this docs sync certifies: Phase 10C — Generational Place Memory.**

## Prior certified gameplay/source — Run #154 — Phase 10A Residential Life

- Upload wrapper: `d04c958ed9085f22ba8f86878a1423cc93b7756d`.
- Expanded certified source: `b4ef6f74f6d957a3109beb6b269ae86b37a7d351`.
- GitHub Actions Run #154: `34922633493`.
- Net diff from the prior certified repository source is exactly **19 intended Phase 10A source/test/UI files** (4 added, 15 modified). Workflow import reports 20 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, content-catalog, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. Residential identity is a projection over existing Property/NPC household/location/relationship truth; the only durable additions are optional primary-home and provenance metadata on the existing property records that own those concepts.
- `ResidentialLifeSystem` projects the player residence and meaningful NPC households without a second residence/household ledger. Five residential plans reuse existing shared-experience activities, preference evaluation, RelationshipSystem consequences, bounded memories, gameplay RNG, and per-person social action budget.
- Assets marks an exact eligible owned property as Home; Player Profile projects that residence; People projects exact NPC household/home context and visits; AI semantic commands call the same engine actions.
- Inherited homes preserve exact provenance across estate conversion and can remain family landmarks. Existing successor homes outrank newly inherited property. Sale/foreclosure remove the property normally; rental and relocation clear only stale residential role. Minors retain property ownership/inheritance but cannot designate/project an independent owned home before adulthood.
- Phase 10A regression **69/69**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **72/72**; Relationship Microcopy **69/69**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Estate Planning/Admin **46/46 + 63/63**; Asset Financing **77/77**; Delinquency **82/82**; Payment/Assets **81/81**; Integrated Long-Life **105/105**; Phase 9A **45/45**; 9B **53/53**; 9C **40/40**; 9D **61/61**; 9E **60/60**; 9F **43/43**; 9G **41/41**; minigames **19/19**; feedback **20/20 + 23/23**.
- Pre-upload local deep preflight **6/6** included content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**; macro profile remained aligned with the certified Phase 9 baseline.
- Production build: Vite 7.3.6, **199 modules transformed**. People ~41.15 kB / 12.11 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; main ~1,253.59 kB / 354.16 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `f5abf0879e5ad26013d5ce17fcceb70c07e6164ccf48d669ea7b3b4875250195`.
- Certified dependency SHA-256: `6c6850bea55be7fa4649a6958f625515f02afa36f74ebe7dbfb514ad7f3279bb`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10377789622`, digest `2cc22e7d8105ee8e8bb4ad319dd438df0e50c600dd81d3c54d82482e851c1448`.
- Pages artifact ID `10378158427`, digest `6cdde002c03756e59505fba58cea16b33710ba3af99df5e0e4d04d0b865b3263`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the checkpoint to `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` at `2026-09-15 02:51:23.125961+00`.
- **Phase 10A is CLOSED / CERTIFIED. Exact next slice after this docs sync certifies: Phase 10B — Working Everthread.**

## Prior certified gameplay/source — Run #152 — Phase 9G Shared Lives Closeout

- Upload wrapper: `025e321a64191077941d0909c995362c8222eda8`.
- Expanded certified source: `14defab1761b1597bae584f9e0acc5d8bfe11483`.
- GitHub Actions Run #152: `34916904879`.
- Net diff from the prior certified repository source is exactly **2 intended test files** (1 added, 1 modified). Workflow import reports 3 changed files only because it removes `everthread-source.zip`; there is no production gameplay/UI/documentation/package/workflow/asset/save-schema drift in the Phase 9G source diff.
- Save schema remains **17**. Phase 9G is test-only integration certification; no new simulation authority or durable state was added.
- Dedicated closeout regression **41/41** proves one exact NPC can traverse the complete Shared Lives stack—preferences, shared experiences, real gifts, cross-world chemistry, dating momentum, partnership—while exact-target isolation, action-budget behavior, save/load normalization, deterministic replay, rewind, descendant continuation, stale/dead targets, duplicate gift instances, and bounded histories stay coherent.
- Canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **64/64**; Relationship Microcopy **69/69**; Phase 9A **45/45**; 9B **53/53**; 9C **40/40**; 9D **61/61**; 9E **60/60**; 9F **43/43**; 9G **41/41**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Pre-upload local deep preflight **6/6** included the content audit and 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**. Aggregate: lifespan 79.3 average / 82 median; married 63.0%; children 0.31/life; millionaires 77.3%; NPC population 125 average peak / 629 max.
- Production build: Vite 7.3.6, **197 modules transformed**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS ~1,240.49 kB / 350.95 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `34f7dad87faae68d011b1dfba584dba2ca9aea799fa3e191e4790d325a179752`.
- Certified dependency SHA-256: `d031866fb287b9d2065156f7dea85d0a21f5105f06b76f3941ce600c14d59518`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10376107622`, digest `9828561e3171a15946581e721094278eb5410977598fadb99233049d9a2ce6d5`.
- Pages artifact ID `10376302016`, digest `9d02b2339c44003f26f7d5032a913bf120455c783983730b7fe0c560a3355031`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `14defab1761b1597bae584f9e0acc5d8bfe11483` at `2026-09-15 01:23:20.426476+00`.
- **Phase 9G is CLOSED / CERTIFIED. Phase 9 — Shared Lives is CLOSED. Historical handoff: Phase 10A Residential Life, now certified in Run #154.**

## Prior certified gameplay/source — Run #150 — Phase 9F Cross-World Chemistry

- Upload wrapper: `40de88d080262ee062b58410def64a13c3eee0aa`.
- Expanded certified source: `20b3026f577db86d821e82129b5c76fa09060413`.
- GitHub Actions Run #150: `34911249505`.
- Net diff from the prior certified repository source is exactly **10 intended Phase 9F source/test/UI files** (4 added, 6 modified). Workflow import reports 11 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, content-catalog, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. `CrossWorldChemistrySystem` is a read-only projection over existing Relationship, SchoolWorld, Workplace, family/friend, and special-career world membership; it creates no second affiliation graph, chemistry score, relationship state, or durable outing ledger.
- The authored layer contains **22 cross-world plans across 13 context families**. It chooses the exact active world the selected NPC genuinely shares with the player, including promoted classmates/coworkers that retain real world membership, while professional rivals/opposition are excluded from friendly chemistry plans.
- Committed contextual outings reuse the certified shared-experience path and `RelationshipSystem`; they consume the same per-person social budget, use existing places/activities/preferences, and write bounded exact-target memories. No school/work/career stat is mutated directly by the projection layer.
- Existing world owners observe the changed authoritative relationship naturally: SchoolWorld social standing, Workplace morale/tension/performance, and special-career chemistry/support/cohesion continue to derive from their own established relationship inputs rather than receiving duplicate hidden bonuses.
- People Threadspace exposes contextual shared-world plans only when appropriate. AI semantic parity discovers and executes the same exact professional plan through `GameEngine.crossWorldExperience`; a music-world regression proves the existing career chemistry projection rises from the real relationship change.
- Phase 9F regression **43/43**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **64/64**; Relationship Microcopy **69/69**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Phase 9E **60/60**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; special-career world **77/77**; combat **51/51**; military **65/65**; politics **80/80**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build: Vite 7.3.6, **197 modules transformed**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS ~1,240.49 kB / 350.95 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `4df9280b04a99dc30ad25363f235c69fc71f147bc2000099280582d9634ee68e`.
- Certified dependency SHA-256: `03680451a3a9add1209e03c646df5de6d82e1fd44f83426fe715838c1ca2041e`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10373864256`, digest `57aabc641c42c8f34d0dc445207e73754708e5bc838b9aca71b3975251684a7d`.
- Pages artifact ID `10373799331`, digest `a02716ee961aa25819cece73d3e4f86e1e75e72dfbe28c108058e6c6f734c75c`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `20b3026f577db86d821e82129b5c76fa09060413` at `2026-09-15 00:01:27.362759+00`.
- **Phase 9F is CLOSED / CERTIFIED. Historical handoff: Phase 9G Shared Lives Closeout, now certified in Run #152.**

## Prior certified gameplay/source — Run #148 — Phase 9E Real Gifts

- Upload wrapper: `d2f4ee0f052387f6a91fec78210f0efc69b0b7ba`.
- Expanded certified source: `a9e53a6840d0fa05790acb3e20ce963a2df51f0e`.
- GitHub Actions Run #148: `34908361877`.
- Net diff from the prior certified repository source is exactly **14 intended Phase 9E source/test/UI files** (3 added, 11 modified). Workflow import reports 15 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, content-catalog, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. The old generic `$150` Gift interaction is retired; the player chooses one exact owned Phase 8D personal-item instance.
- `PersonalInventorySystem` remains sole owner of ordinary personal-item instances and exact removal. `GiftSystem` is projection/evaluation only; `RelationshipSystem` owns committed relationship/opinion/happiness/timeline/memory/preference/action-economy/RNG consequences.
- Gift preference evaluation reuses the pure shared scoring core and the existing 38-tag preference vocabulary. There is no fake gift location, second relationship engine, or broad NPC inventory. Valuable collectibles/assets remain with their existing authorities.
- Failed/stale/dead/ineligible attempts preserve ownership; committed good or bad gifts transfer the exact instance once. Duplicate copies remain independent and stale instance IDs cannot transfer twice. Rewind restores inventory plus consequences atomically; descendant continuation does not recreate prior ordinary possessions.
- People Threadspace provides a mobile owned-item chooser and Gift Approval/reaction result; AI semantics execute the same exact-instance engine action.
- Phase 9E regression **60/60**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **58/58**; Relationship Microcopy **69/69**; Phase 8D **63/63**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build: Vite 7.3.6, **195 modules transformed**. People remains lazy/code-split at ~37.88 kB JS / 11.69 kB gzip; main JS ~1,229.92 kB / 348.18 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `f7a6ae88c9b44736c8afbd5776a46a133403768eaf7b13293b13492958160597`.
- Certified dependency SHA-256: `65d66454a8375d812706cabfc922065311439405e49542f5b71a2cccb863db87`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10372914569`, digest `3aba83994b203611a9c09d0f201b76a5c220bea35ff84c4d955b2cfe210b68d3`.
- Pages artifact ID `10373447865`, digest `5b1860077132ff8d3cfb947e77d12c44523604b388fe071f0885ef7a71fe2340`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` at `2026-09-14 23:22:00.588163+00`.
- **Phase 9E is CLOSED / CERTIFIED. It was succeeded by certified Phase 9F in Run #150.**

## Prior certified gameplay/source — Run #146 — Phase 9D Dating & Romantic Momentum

- Upload wrapper: `aa6cd1fc69f4df9430a88baaa9331d5b279e556f`.
- Expanded certified source: `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1`.
- GitHub Actions Run #146: `34905053500`.
- Net diff from the prior certified repository source is exactly **21 intended Phase 9D source/test/UI files**. Workflow import reports 22 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, or save-schema drift is part of the committed gameplay diff.
- Save schema remains **17**. Phase 9D separates **Ask on Date** from **Become Partners** without creating a second romance score or graph.
- **8 authored date plans** reuse existing Everthread places and shared-experience activities. Accepted invitations persist on the existing Relationship until completion/cancellation. Completed dates write a bounded **8-entry** relationship-owned date history; hidden romantic momentum is derived from outcome bands, with **3 momentum** required before Become Partners can even be attempted. Partnership acceptance remains probabilistic.
- `RomanticDateSystem` owns projection/availability only. `RelationshipSystem` owns invitations, committed date mutation, score/opinion/happiness/attraction, exact-target timeline, memories, action economy, and gameplay RNG.
- Existing age/orientation/commitment rules are preserved, including teen↔teen/adult↔adult boundaries and estranged living commitments counting as current commitments. Pending teen dates remain visible/cancellable across temporary age incompatibility; invariant repair removes dead-target/malformed ghost plans.
- People Threadspace provides the mobile date chooser, approval result, pending recovery/cancel controls, and gated Become Partners action. AI semantics use the same engine actions.
- Phase 9D regression **61/61**; canonical preflight **4/4**. Base **82/82**; People **57/57**; AI **52/52**; Relationship Microcopy **66/66**; Dynasty **64/64**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Local deep preflight **6/6** included content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**; average/median lifespan 79.3/82.0, married 63.0%, children 0.31/life, and bounded NPC population.
- Production build: Vite 7.3.6, **194 modules transformed**. People remains lazy/code-split at ~35.82 kB JS / 11.25 kB gzip; main JS ~1,225.97 kB / 347.09 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `b2bc71aab5c827f50a8c7b9caab8ebace55b9c567ffd975803ecd99472106be5`.
- Certified dependency SHA-256: `18baf98fbbf620280e6ef062e85cb695484bf7c03a6fde1df15ea01fa82d9be0`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10372681543`, digest `81a91416305ef0c3b293c7c1dd679319df4d4245ba5f43978f3b80c4e1f17c55`.
- Pages artifact ID `10372740361`, digest `20878aec96f98fcafb45535fbdf206a791f28bd4578583c4f594837240248610`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` at `2026-09-14 22:39:43.562077+00`.
- **Phase 9D is CLOSED / CERTIFIED. It was succeeded by certified Phase 9E in Run #148.**

## Prior certified gameplay/source — Run #144 — Phase 9C Childhood & Youth Social Life

- Upload wrapper: `ef1d386c5baab2e964f2e8f00cabe8d4e6264ab7`.
- Expanded certified source: `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b`.
- GitHub Actions Run #144: `34887219411`.
- Net diff from the prior certified repository source is exactly **12 intended Phase 9C source/test/UI files**. Workflow import reports 13 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, save-schema, or Phase 9D drift is part of the committed gameplay diff.
- Save schema remains **17**. `YouthSocialSystem` is a read-only contextual projection over existing NPC, `Relationship`, SchoolWorld, town-place, and Phase 9B shared-experience truth; it creates no youth-only relationship graph, outing ledger, school roster, location state, or memory authority.
- Phase 9C adds **11 curated age-aware youth plans** for ages 3–17. Eligible targets remain real classmates/friends/best friends plus siblings, half-siblings, step-siblings, and cousins. Non-family peer plans enforce a bounded ±3-year age band; family plans preserve real kin links without fabricating peer records. Estranged, dead, stale, remote, or otherwise invalid targets are rejected through existing authorities.
- The shared-experience registry expands **10 → 12** with youth-bounded `sleepover` and `school_social` activities. School Social appears only for a current real classmate in an active SchoolWorld; all other youth plans are contextual labels over the existing certified 9B activity/place pairs.
- People Threadspace now exposes a mobile **Spend time together** section on eligible youth profiles. Plans age in/out instead of showing an adult-sized wall of future buttons, unavailable contextual plans surface the real 9B reason, and successful outings show concise prose plus a bounded approval meter. Commits still route through `GameEngine.shareExperience` → `RelationshipSystem` → `SharedExperienceSystem`.
- AI semantic parity now invokes shared outings by exact NPC/place/activity IDs through the same engine action. No UI-only gameplay path exists.
- Phase 9C regression **40/40**; canonical preflight **4/4**. Base **82/82**; People Threadspace **57/57**; AI interaction testbench **45/45**; Relationship Microcopy **66/66**; Family Topology **40/40**; Dynasty **64/64**; Phase 9A **45/45**; Phase 9B **53/53**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build: Vite 7.3.6, **192 modules transformed**. People remains lazy/code-split at ~33.49 kB JS / 10.82 kB gzip; main JS ~1,217.14 kB / 344.75 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `a56dfebebee0aefd227dfbca71850dff591d62eef247064ed481cdb8f3bbe689`.
- Certified dependency SHA-256: `a18b4bac9c33cffe3a798f023efcee7adb05ff5c0f973f6a4c36f9f5ceebe020`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10365740616`, digest `21efe389a43afb8950185182edc7ea2e5e2897b2f74aa4617499531f993fa5f7`.
- Pages artifact ID `10365790597`, digest `85d5a26d84d9e086180eaa15c2ea8a1212fee786ce53bd503e9bad49c4729082`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` at `2026-09-14 19:32:14.421886+00`.
- **Phase 9C is CLOSED / CERTIFIED. It was succeeded by certified Phase 9D in Run #146.**

## Newest certified gameplay/source — Run #141 — Phase 9B Shared Experience Foundation

- Upload wrapper: `c2beb60a91b1869993f83412fd63f084f26e0b98`.
- Expanded certified source: `f1be1e6bc39482cb613b85bbdad77ea5ca7e9298`.
- GitHub Actions Run #141: `34880935501`.
- Net diff from the prior certified repository source is exactly **7 intended Phase 9B source/test files**. Workflow import reports 8 changed files only because it removes `everthread-source.zip`; no documentation, package, workflow, asset, save-schema, or Phase 9C drift is part of the committed gameplay diff.
- Save schema remains **17**. Phase 9B adds one reusable pure shared-experience evaluator shaped around exact player + NPC + relationship + place + activity + preference/context inputs; it introduces no second relationship score, memory ledger, location authority, or durable experience ledger.
- `RelationshipSystem` remains the mutation authority for relationship score, hidden opinion, player happiness, exact-target timeline history, bounded NPC memories, action-economy consumption, and the committed gameplay-RNG draw. `SharedExperienceSystem` evaluates only; read-only projections/previews consume no gameplay RNG or runtime IDs.
- The foundation ships **10 authored shared-experience activities** across Weaver Park, Crossroads Mall, Nightjar Diner, Threadwell Residential, Pulseworks Gym, and Everthread Stadium. Evaluation returns bounded 0–100 approval, coherent result prose, consequence suggestions, and meaningful-memory signaling while keeping raw preference weights hidden.
- Age-inappropriate preference tags cannot influence younger participants. Availability rejects stale/dead targets, wrong place/activity pairs, undiscovered places, remote participants, and underage participants before mutation. Existing social opportunity limits still cap substantial per-NPC interactions and repeated same-activity use.
- Meaningful lived experiences may reveal at most one relevant preference through the existing Phase 9A knowledge authority. Rough/awful/great outcomes can become bounded NPC memories; ordinary mixed/good outcomes do not spam memory history.
- Phase 9B regression **53/53**; canonical preflight **4/4**. Base **82/82**; Relationship Microcopy **66/66**; Phase 9A **45/45**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build: Vite 7.3.6, **190 modules transformed**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; main JS ~1,216.41 kB / 344.59 kB gzip. Established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256: `495b4f0e1c47705e3f822ce86df46cb989412eec7f43cbde9307ebff2e0a8553`.
- Certified dependency SHA-256: `7c80fdb1e14b0edf35dd2c29b67b1ee9a6ff5ed26e687cea52b5ea00297572d2`.
- Certified package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10362674376`, digest `ba43c8f5039be7053dc38cf4dc0a99b5f40a25110a63e24ba0444971cdc5ad8b`.
- Pages artifact ID `10362614619`, digest `72fb456e5085132b2565ddf7727e82d7743ab24622b583edb6e1e2c39e00c9e7`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox read found **4 total / 0 unresolved**, with no new receipt after `2026-09-13 19:51:36.119407+00`. Connector safety blocked the review-state checkpoint write, so the stored checkpoint remains Run #137 even though the live inbox read is current.
- **Phase 9B is CLOSED / CERTIFIED. Exact next slice: Phase 9C — Childhood & Youth Social Life.**

## Prior certified gameplay/source — Run #139 — Phase 9A NPC Interests & Preferences

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
- **Phase 9A is CLOSED / CERTIFIED. It was succeeded by certified Phase 9B in Run #141.**

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
- Migration and every-load naming normalization consume no gameplay RNG and allocate no runtime IDs. Run #163 later superseded permanent-emigration durability: legacy emigrated current-schema saves normalize back to Everthread while preserving travel/biography.
- Dynasty continuation preserves the successor's naming profile separately from physical location.
- Everthread uses the established North-American-style school profile as a compatibility bridge for current education rules.
- Travel/location copy uses one `locationLabel` projection so Everthread is not rendered as `Everthread, Everthread`.
- Executable country/profile definitions increase **32 → 33**: Everthread plus the existing 32 external travel destinations and hidden naming-profile sources. Regional name-pool count remains 7.

This setting ownership split remains a compatibility boundary beneath Phase 8B. Do not turn `namePoolCountryId` into a second residence field and do not replace `countryId/city` with a parallel town-state ledger in later map/routing work.

## Certified Phase 8B — Town Place Registry & 2D Flat Map

Phase 8B makes Everthread a first-class, mobile navigation surface without creating a second simulation.

- `src/data/townPlaces.ts` is the single authored static registry: **24 stable places across 6 districts** on the authored map's native **1536×961** coordinate plane. Every place has a stable ID, label/short label, category, district, description, activity tags, visibility rule, importance, map metadata, and optional routing metadata.
- Required location families are represented: Central Everthread Bank, dealership, realty/leasing, residential district, mall, diner, park, grocery, school, college, hospital, gym, film studio, modeling agency, speedway, stadium, military base, City Hall, courthouse/public safety/prison, air terminal, business district, and the discoverable Blackline Freight Yard.
- `TownMapSystem` is a **read-only projection** owner for map discovery/filtering/camera math/culling/semantic view only. It does not mutate simulation truth, consume gameplay RNG, allocate runtime IDs, or persist camera/search/filter/selection state.
- The Map is a sixth primary mobile tab and `TownMapScreen` lazy-loads separately. The player-supplied authored town artwork is the real visual map surface; the Threadspace workspace is edge-to-edge beneath the header and above bottom navigation, with cover/fill on entry plus Fit Map for full-town overview. Interaction supports touch pan, pinch zoom, wheel zoom, large markers, search/category filters, zoom-based marker/label disclosure, viewport culling, and bottom-sheet place details with no hover dependency.
- Blackline Freight Yard discovery derives from existing organized-crime participation or meaningful legal state; there is no separate discovered-place ledger.
- Run #163 retired permanent player emigration. External trips remain temporary; the map never rewrites authoritative residence.
- Place `route` metadata points only at mature existing screens. **Phase 8B does not execute bank/property/career/etc. actions from the map.** Those owners remain unchanged until 8C.
- Save schema remains **15**. No migration was required.

## Historical Phase 9C implementation contract — now certified

Phase 9B is certified. Reuse the single shared-experience evaluator for age-appropriate childhood and youth social life: play dates, sleepovers, parks, home visits, mall/game-store/arcade-style outings, school friends, siblings, and related social events. RelationshipSystem stays authoritative for relationship consequences, Phase 9A stays authoritative for learned preferences, NPC memory stays on the NPC, and place/location truth remains with the existing Everthread/location owners.

Do not create a youth-only relationship score, shadow social ledger, duplicate friend state, or a second experience evaluator. Phase 9C is now certified and closed.

### Certified Phase 9F — Cross-World Chemistry

Run #150 certified one read-only cross-world context projection over existing school, family/friend, workplace, and special-career membership. Contextual outings commit through the certified shared-experience/Relationship path; domain owners continue deriving school/work/career chemistry from the authoritative relationships they already own. No cross-world relationship state, second affiliation graph, chemistry score, or durable outing ledger exists. Dedicated regression is **43/43** and AI semantic parity is **64/64**.

### Certified Phase 9G / Phase 9 closeout

Run #152 certified the test-only Shared Lives integration closeout at **41/41** with the full canonical wall Green. No production gameplay fix was required. Phase 9 is closed while preserving one Relationship authority, the shared preference/evaluation path, bounded exact-target memories/history, real inventory gifting, romantic momentum on existing relationships, social-world roster ownership, deterministic save/rewind behavior, and AI/player action parity.

### Certified Phase 10D + pre-10E correction boundary

Run #158 certified Generational Place Memory at **50/50** with the complete canonical wall Green. Meaningful place history remains bounded projection over Timeline/CompletedLife plus existing Property/Business/Estate/Working Everthread/Town Place truth; no global visited-place or family-landmark ledger exists.

After the certified Runs #162–#163 correction documentation sync certifies, begin **Phase 10E — Program Closeout**. Prove the full Living Everthread stack across Residential Life, Working Everthread, Generational Place Memory, and Living Map Projection: multi-generation continuation, save/load/migration/rewind, estate/accounting integrity, Threadspace ↔ Map ↔ Player Profile navigation, action-access parity, mobile/accessibility, bounded map performance, deterministic read-only projection, and the complete CI wall. Closeout should certify integration and polish rather than add a competing simulation authority.

## Historical feedback snapshot after Run #141 / `f1be1e6…`

- Fresh Supabase read contains **4 report rows / 0 unresolved by `triage_status`**; no new report row has appeared since `2026-09-13 19:51:36.119407+00`.
- The attempted post-Run-#141 checkpoint write was blocked by connector safety. `everthread_feedback_review_state.main` therefore still points to `e1aa213fac4e03ab9a4af3039d9605852289b899` at `2026-09-14 15:07:04.320301+00` with reviewed-report count 4.
- The live inbox snapshot is current even though checkpoint persistence is stale. No feedback item preempts Phase 9C.

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
