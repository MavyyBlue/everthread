## Everthread Community School device acceptance + Location #10 closeout — CI Green Run #226 — 2026-09-17

### Added / changed

- Added **Everthread Community School** as the tenth dedicated illustrated location using Astra-derived `everthread-school.png` and `student-desk.png`. Three semantic groups—Study desk, Classroom, and Activity board—expose seven bindings: Study harder, Skip class, School record, Leave education, Clubs & teams, Volunteer, and School social.
- School remains a presentation/routing adapter over established owners. Study harder, Skip class, and Leave education remain `EducationSystem` actions; record/group/community state remains `SchoolWorldSystem` truth; School social filters to actual current classmates before committing through the existing Shared Experience `everthread-school` / `school_social` plan.
- Physical-location truth is preserved. Everthread Community School only projects the active compulsory-school world anchored there; post-secondary education stays at Everthread College and remote school worlds stay external. Compulsory leaving-age rules, youth social ceilings, action limits, and skip-class RNG/consequences remain existing behavior.
- Mavyy completed direct Android/player acceptance after Run #226 and reported School works great on-device. The Location #10 tactile/player-facing gate is closed.
- Save schema remains **17**. No migration, duplicate education/school/peer state, new RNG stream, QA-topology change, dependency change, event scheduler, or alternate action ledger was introduced. Read-only School browsing remains save/RNG/runtime-id/action-ledger neutral.

### Certification

- GitHub Actions Run #226 (`35308793999`, job `105486329254`) certified expanded source `72666ff23d167c4088bde1b13fd5a1a121bf45af` from upload wrapper `638564e03f5526f0039b954e1c7ee6c68cfd89ea`. Persistent gameplay diff from synchronized Run #225 `e3b540335271285492a1e88d85b9df52223c1fa4` is exactly **7 intended files**: two School runtime PNGs plus five location-scene/panel/test source files.
- Location Scene regression expanded **111 → 126** and passed **126/126**. Connected certified coverage includes Shared Experience **53/53**, Youth Social **40/40**, Working Everthread **50/50**, Town Map **46/46**, and Institution Routing **42/42**. QA-4 remains exact at `core=81+1/82 specialized=76+1/77 overlap=0`, with all **82 core / 77 specialized** mandatory and zero overlap.
- Canonical preflight passed **6/6 in 46,357 ms**: Engine TS **4,113 ms**, Test TS **5,920 ms**, App TS **8,821 ms**, Node/Vite TS **974 ms**, complete regression wall **22,006 ms**, production build **4,508 ms**. Production transformed **230 modules**.
- Certified source SHA-256 `93add0d2b9753fb1b9fb53d2b0b02996ad7eea01f9b1067ccbe79c0544c1bd53`; dependency SHA-256 `a9e8cd5dc446e419b8c3415edb93853293717c55c6c48d1c9e8f183c22deba92`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10532801871` (`aa00d2cd0107f6d45172e9deff3ece7a03f8699ce89f2fe01faaf860acb0fb99`); Pages artifact `10532557229` (`388fe469095e6e060484477e0c8be363c6588a2b0a90dc7b4f2f6e5b7b53b232`); Pages deployment Green.
- Certified scene totals are now **10 scenes / 31 semantic groups / 60 scene action bindings / 20 selected Astra runtime assets**. After this documentation-only synchronization certifies, Location #11 remains unchosen; 15 Astra-backed source scenes remain and the normal owner/source/test audit still applies to whichever Mavyy selects.

## Pulseworks Gym device acceptance + Location #9 closeout — CI Green Run #224 — 2026-09-17

### Added / changed

- Added **Pulseworks Gym** as the ninth dedicated illustrated location using Astra-derived `pulseworks-gym.png` and `fitness-bench.png`. Three semantic groups—Training bench, Fitness floor, and Martial arts room—expose five bindings: Work out, Train together, Workout date, a second Work out affordance, and Martial arts.
- Pulseworks remains a presentation/routing adapter over established owners. Work out and Martial arts use the existing wellness activity path; Train together uses the existing Shared Experience `pulseworks-gym` / `gym_session` plan; Workout date uses the existing Romantic Date `gym_session` plan and one authoritative accepted `relationship.romance.pendingDate` state.
- Astra's combat-career Train/Fight/Leave concepts were intentionally not added in this bounded slice. The existing Location Scene contract does not own challenge/minigame routing or combat-career lifecycle controls, so no parallel combat state or scene-only challenge authority was introduced.
- Mavyy completed direct Android/player acceptance after Run #224 and reported Pulseworks works great on-device. The Location #9 tactile/player-facing gate is closed.
- Save schema remains **17**. No migration, new durable state, new RNG stream, QA-topology change, dependency change, event scheduler, or alternate action ledger was introduced.

### Certification

- GitHub Actions Run #224 (`35305049420`, job `105475409391`) certified expanded source `08a27517d42081ddb22c6587308a15da55669d2c` from upload wrapper `2c80c1617a50d9d5354707882b839386d3c97164`. Persistent gameplay diff from synchronized Run #223 `0e25206cbad8fa043d86abdab0283c367f8c9882` is exactly **6 intended files**: two Pulseworks runtime PNGs plus four location-scene source/test files.
- Location Scene regression expanded **99 → 111** and passed **111/111**. Connected certified coverage includes Shared Experience **53/53**, Dating Momentum **61/61**, and Town Map **46/46**. QA-4 remains exact at `core=81+1/82 specialized=76+1/77 overlap=0`, with all **82 core / 77 specialized** mandatory and zero overlap.
- Canonical preflight passed **6/6 in 51,123 ms**: Engine TS **4,259 ms**, Test TS **6,814 ms**, App TS **9,589 ms**, Node/Vite TS **1,033 ms**, complete regression wall **24,697 ms**, production build **4,713 ms**. Production transformed **229 modules**.
- Certified source SHA-256 `0184959e200056970410f3bd0caea2bccc75e1a3598bffb47d90817db9294a8d`; dependency SHA-256 `e84ab9c2002ac17f4ea6964ed4d750e1cee349de4cd40cf2be184efbd2285b55`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10530537991` (`3f077b1aa2c9d1f783225853c7f85e6f4fca4dd51fd43f947b9bf54010dc196e`); Pages artifact `10530478164` (`e78df25d7b60ab5a695a7ead9ca4cc99778f17a183ec5bed947c8fa4cf172c97`); Pages deployment Green.
- Certified scene totals are now **9 scenes / 28 semantic groups / 53 scene action bindings / 18 selected Astra runtime assets**. After this documentation-only synchronization certifies, select exactly one remaining Astra-backed **Location #10** after a fresh repository owner/source/test audit; 16 source scenes remain unshipped.

## Astra source archive preservation closeout — CI Green Run #222 — 2026-09-17

### Added / changed

- Completed the durable Astra v1 source-package preservation under `PROJECT_HANDOFF/ASTRA_LOCATION_SCENES/SOURCE_PACKAGE/parts/`. The exact original 89,718,869-byte ZIP is stored as **five** raw byte parts: four 20,000,000-byte parts plus one 9,718,869-byte tail.
- The initial 24 MiB split was rejected by GitHub's mobile/web commit path because 24 MiB equals 25,165,824 bytes. The corrected split changes only chunk boundaries; reconstructing the five parts yields the unchanged original SHA-256 `220503b851ef4e49a79ff3bc553ca887effb7e23733de1ab2f6e30e555d2f3f1`.
- Verified the repository Git blobs for all five authoritative parts against the locally generated chunks, then removed the accidental root-level `part-00` and the duplicate `SOURCE_PACKAGE/part-02`. No stray source-package chunks remain outside `SOURCE_PACKAGE/parts/`.
- This archive is non-runtime design provenance. It does not add gameplay content, state, RNG, save schema, runtime assets, QA topology, or a new implementation authority.

### Certification

- GitHub Actions Run #222 (`35285417933`, job `105416605994`) certified the final cleaned repository tree `0d33b637849d9aa7965997c3fef271af5d819b78`.
- Canonical preflight passed **6/6**; Location Scene remains **99/99**; QA-4 remains exact at `core=81+1/82 specialized=76+1/77 overlap=0`; the complete wall passed **5/5**; production remains **229 modules**; save schema remains **17**.
- Certified source SHA-256 `f5d1383727ad2179b46697a071495dd1be062934512b9d1d0f43ba26d24d4172`; dependency SHA-256 `fb24428557ffe8b5ed09fc9d71518410d38fd28521728f6d4147627e316824f9`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10524029877` (`89857dcd2f9a549c8f928ea7d215863a98c193f58c9ae8557abf5772e24ba7d0`); Pages artifact `10524330641` (`89bc9877e5ec5ae3885785401aefe05bfbb3fab35507dbd7abaafe034909d501`); Pages deployment Green.
- Gameplay implementation remains Run #212 / `7dde94325f56a2f44172b5de65709700b5ad73ea`; Run #222 is a handoff/archive certification closeout.

## Nightjar Diner device acceptance + Astra location-source handoff — CI Green Run #212 — 2026-09-17

### Added / changed

- Added **Nightjar Diner** as the eighth dedicated illustrated location using Astra-derived `nightjar-diner.png` and `diner-table.png`. Three semantic groups—Your table, Diner counter, and Window booth—expose four scene bindings: Share a meal, Diner date, Counter goods, and the second booth entry to the same shared-meal owner.
- Nightjar is a presentation/routing adapter over existing systems. Shared meals remain Shared Experience truth; dates remain Romantic Date truth and reuse the Run #210 accepted `relationship.romance.pendingDate` bridge; counter purchases remain `PersonalInventorySystem` truth through `gameEngine.purchasePersonalItem`.
- Astra's broad counter concept was intentionally narrowed to the **six real Nightjar-specific personal items already authored in Everthread**. No hunger/nourishment model, priced meal ledger, grocery economy, diner inventory authority, second relationship/date state, or scene-local cash balance was invented. Browsing is read-only and RNG-neutral.
- Mavyy completed direct Android/player acceptance after Run #212 and reported Nightjar works on-device. The Location #8 tactile/player-facing gate is closed.
- Added a durable `PROJECT_HANDOFF/ASTRA_LOCATION_SCENES/` continuation folder. It records the certified scene ledger, remaining-source inventory, preservation-first implementation playbook, and exact lightweight references from Astra Yuki's original v1 handoff. The exact original 89,718,869-byte source ZIP is preserved losslessly as five browser-safe raw byte parts, each no larger than 20,000,000 bytes. The initial 24 MiB split was rejected by GitHub's mobile/web commit path because 24 MiB is 25,165,824 bytes, so the archive contract was corrected without changing the original ZIP bytes or checksum. These archive/reference files are non-runtime provenance only.

### Certification

- GitHub Actions Run #212 (`35275536409`, job `105385139759`) certified expanded source `7dde94325f56a2f44172b5de65709700b5ad73ea` from upload wrapper `d47c70fe75b23fe4585543ddb029f8b8f5818c38`. Persistent gameplay diff from synchronized Run #211 `3f869498c7245c741e255023015ae77ffdd97e0c` is exactly **7 intended project files**; workflow import reports 8 changed paths only because it removes transient `everthread-source.zip`.
- Location Scene regression expanded **88 → 99** and passed **99/99**. Connected certified coverage includes Shared Experience **53/53**, Dating Momentum **61/61**, Player Profile/Inventory **63/63**, Youth Social **40/40**, Cross-World Chemistry **43/43**, Shared Lives closeout **41/41**, Town Map **46/46**, and institution routing **42/42**. QA-4 remains exact at `core=81+1/82 specialized=76+1/77 overlap=0`, with all **82 core / 77 specialized** mandatory and zero overlap.
- Canonical preflight passed **6/6 in 27,450 ms**: Engine TS **2,266 ms**, Test TS **3,314 ms**, App TS **4,994 ms**, Node/Vite TS **566 ms**, complete regression wall **13,182 ms** (wall **5/5 in 13,089 ms**), production build **3,037 ms**. Production transformed **229 modules**.
- Certified source SHA-256 `a4590a473e8d9a0d2b5fbf27a7984e3ac4dc630199aaaaa5ace28222c7ac7e56`; dependency SHA-256 `843e6871a19ef8a299745b910df885172a0d5724786764b285e23b3f8c7bf48b`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10520691404` (`1e229d6547706ea87b3d41233da1581dcbf8f5bc7580085ddcd01263c37c3799`); Pages artifact `10520731398` (`c5abc53dc50ca753be9bf59b38b88a50ecd3a3aa07605e426d8fc691e3f7276e`); Pages deployment Green.
- Certified scene totals are now **8 scenes / 25 semantic groups / 48 scene action bindings / 16 selected Astra runtime assets**. Save schema remains **17**.
- The next gameplay gate is **Location #9**, but it remains deliberately unchosen until this handoff/archive synchronization is certified and a fresh repository owner/source/test audit is performed. The raw Astra source archive never overrides current repository authority.

## Scheduled-date location navigation + Crossroads device closeout — CI Green Run #210 — 2026-09-17

### Added / changed

- Mavyy completed direct Android/player acceptance of the generalized scheduled-date flow on certified Run #210 and reported that it works on-device. This closes the Crossroads Location #7 player-facing gate after the Run #209 scene certification and the date-navigation seam found during initial device review.
- NPC profiles now **Schedule a Date** through the existing relationship invitation owner rather than completing a date destination inside the profile. Acceptance still uses the established probabilistic/eligibility path and persists only the existing `relationship.romance.pendingDate` truth; rejection behavior, cancellation, date history, momentum, and save ownership remain unchanged.
- Accepted date plans are now consumed at compatible dedicated locations. Weaver Park, Threadwell Residential District, and Crossroads Mall all project the same pending date through their existing Romantic Date plans. Completing the date at one location consumes the one authoritative pending plan everywhere.
- Scene companion/date routing is now declarative on `LOCATION_SCENE_ACTIONS`: each companion action may carry its existing place/activity plan, while `LocationScene` and `LocationSceneSystem` consume that metadata generically. Future date-capable scenes inherit the same flow by declaring a valid Romantic Date place/activity mapping rather than adding another hardcoded companion registry. No scheduler, calendar, romance ledger, save field, migration, or second invitation system was added.

### Certification

- GitHub Actions Run #210 (`35265443401`, job `105351341114`) certified expanded source `3a7e79010d55af3e6c75540f1e1ac1468bc7aaf5` from upload wrapper `4803063f5c5dbc1ee5b0d52af8fd947b0657ec9e`. Persistent hotfix diff from Run #209 `487ea66dd589bf7d35efce29ab8ebba8a5313b44` is exactly **6 intended source/test files**; workflow import reports 7 changed paths only because it also removes transient `everthread-source.zip`.
- Location Scene regression expanded **82 → 88** and passed **88/88**. Connected certified coverage includes Dating Momentum **61/61**, Shared Experience **53/53**, Shared Lives closeout **41/41**, and AI Interaction **82/82**. QA-4 remains exact at `core=81+1/82 specialized=76+1/77 overlap=0`, with all **82 core / 77 specialized** mandatory and zero overlap.
- Canonical preflight passed **6/6 in 37,749 ms**: Engine TS **3,075 ms**, Test TS **4,510 ms**, App TS **7,405 ms**, Node/Vite TS **793 ms**, complete regression stage **18,031 ms** (wall **5/5 in 17,913 ms**), production build **3,924 ms**. Production transformed **228 modules**.
- Certified source SHA-256 `0559b935bcefb072737084603f2bba27f1d1c4b1f9642525e5ec1c6c683a823f`; dependency SHA-256 `8616774696662095fcb59536665c2095edfe5c1253eda023899cd21d59904e4f`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10516895640` (`becc86c5b19a883b0ff32d7dc4ff64fa79c42bfc097c65997a838beb5a048738`); Pages artifact `10516386442` (`af471a12334e710971e5094afcdd04ded8497dc334fb4834241e54aac71d32d2`); Pages deployment Green.
- Scene/content totals remain **7 scenes / 22 semantic groups / 44 scene action bindings / 14 selected Astra runtime assets** and save schema remains **17**. After the mandatory documentation-only synchronization certifies, select exactly one remaining Astra-backed **Location #8** after a fresh repository owner/source/test audit.

## Crossroads Mall dedicated location scene — CI Green Run #209 — 2026-09-17

### Added / changed

- Added **Crossroads Mall** as the seventh dedicated location scene using Astra-derived `crossroads-mall.png` and `shopping-display.png`. Three semantic groups—Shopping counter, Gift boutique, and Mall concourse—expose eight focused bindings: Clothing & personal items, Collectibles, Browse gifts, Your mall purchases, Browse together, Play games together, Catch a movie, and Mall date.
- Crossroads is a presentation/routing adapter over established owners. Personal items remain `PersonalInventorySystem` truth; collectibles remain `PropertySystem` assets; shared outings remain Shared Experience; dates remain Romantic Date. Collectible availability was centralized behind the existing property owner and reused by legacy Assets UI and Crossroads rather than copied into the scene.
- Collectible browsing is RNG-neutral: the Mall shows the existing base estimate only. Authoritative market price, authenticity, condition, and value are rolled only inside the existing purchase command when the player actually chooses Find. No shadow shop inventory, mall economy, collectible ledger, or second relationship/date authority was introduced.

### Certification

- GitHub Actions Run #209 (`35260873402`, job `105335962298`) certified expanded source `487ea66dd589bf7d35efce29ab8ebba8a5313b44` from upload wrapper `d2736dd98b5741c1a51cb410fc83de32b66d6e93`. Persistent gameplay diff from synchronized Run #208 `e3f7f081e0ef5ddc864cc559deddc1c72a5a26d4` is exactly **10 intended files**; workflow import reports 11 changed paths only because it also removes transient `everthread-source.zip`.
- Location Scene regression expanded **70 → 82** and passed **82/82**. QA-4 remained exact at `core=81+1/82 specialized=76+1/77 overlap=0`; save schema stayed **17**.
- Canonical preflight passed **6/6 in 49,066 ms**: Engine TS **4,140 ms**, Test TS **6,190 ms**, App TS **9,547 ms**, Node/Vite TS **985 ms**, complete regression wall **23,587 ms**, production build **4,565 ms**. Production transformed **228 modules**.
- Certified source SHA-256 `2a8b4d72934ffb7b6a383144e997c123afa5447d845bce08ddf3490938cb849c`; dependency SHA-256 `f91df36b7e85c78cec55af8aae4b7a1a5d7ecc658e14b9c5c22be579514cf68a`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10514552885` (`349a0dc668a742d91312fa5fcf2a0b198e51e2e5b721b4c647d993840ec7c333`); Pages artifact `10514503137` (`37bde4746b3a10dfc606abeb4c7f397987a44026bdc31a5015c226782e2ba180`); Pages deployment Green.
- Run #209 established scene totals of **7 scenes / 22 semantic groups / 44 scene action bindings / 14 selected Astra runtime assets**. Initial Android review found one navigation seam: Mall Date could only be made eligible by accepting a date from the NPC profile, while the profile also offered to complete the destination itself. Run #210 resolves that seam generically and is the player-accepted closeout baseline.

## Threadwell Residential District device acceptance + Run #207 closeout — 2026-09-17

### Added / changed

- Mavyy completed direct Android/player acceptance of certified **Threadwell Residential District** after Run #207 and reported that the location works well on-device. The Location #6 player-facing gate is therefore closed.
- Run #207 adds Threadwell as the sixth dedicated scene using Astra-derived `threadwell-residential.png` and `neighborhood-board.png`, with Neighborhood board, Home entrance, and Courtyard groups exposing Current residence, Known households, Visits, Home hangout, Cook together, Sleepover, and At-home date.
- Threadwell remains a focused neighborhood projection over authoritative `ResidentialLifeSystem`, Shared Experience, Romantic Date, relationship/NPC household, action-economy, and existing `GameEngine` actions. It adds no neighborhood ledger, duplicate household state, second residence authority, or fabricated home ownership. The companion-plan bridge was generalized so existing Park companion actions and Threadwell's at-home date share one projection-to-owner commit path.

### Certification

- GitHub Actions Run #207 (`35253421670`, job `105311055912`) certified expanded source `90e16923efa896da52750e7241b5387ca02da1ad` from upload wrapper `6506073b6d5d83bb1d5cd989043baf439f8ba199`. Persistent gameplay diff from synchronized Run #206 `c5cd9c87417b53494f47095c278666b5a1487951` is exactly **8 intended files**; workflow import reports 9 changed paths only because it also removes transient `everthread-source.zip`.
- Location Scene regression expanded **60 → 70** and passed **70/70**. Connected certified coverage remains Residential Life **69/69**, Shared Experience **53/53**, Dating Momentum **61/61**, Shared Lives closeout **41/41**, Town Map **46/46**, and institution routing **42/42**. QA-4 remains exact at `core=81+1/82 specialized=76+1/77 overlap=0`, with all **82 core / 77 specialized** mandatory and zero overlap.
- Canonical preflight passed **6/6 in 27,925 ms**: Engine TS **2,471 ms**, Test TS **3,417 ms**, App TS **5,324 ms**, Node/Vite TS **604 ms**, complete regression wall **12,957 ms**, production build **3,073 ms**. Production transformed **227 modules**.
- Certified source SHA-256 `d04640b3f62e2bb9e675afd31717c6c6718341640205c704e5b0147773a1f4e6`; dependency SHA-256 `2da3e914d915ba5f62ba8ad09d3d5a29df6bf3b659a381227215f411db661294`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10511147329` (`ea83f0542584f4e9fe922227c1dc0be78b79c5db30322a17adb680e710da62e3`); Pages artifact `10511062309` (`0aec413a0849bd100a24b6e77705c08453d89f5cbb548caa368edb8ce77f84ec`); Pages deployment Green.
- Certified location-scene totals are now **6 scenes / 19 semantic groups / 36 scene action bindings / 12 selected Astra runtime assets**. Save schema remains **17**.
- After this documentation-only synchronization certifies, select exactly one remaining Astra-backed **Location #7** after a fresh repository owner/source/test audit. Do not preselect it from historical design notes.

## Hearthline Realty & Leasing device acceptance + Run #205 closeout — 2026-09-17

### Added / changed

- Mavyy completed direct Android/player acceptance of certified **Hearthline Realty & Leasing** after Run #205 and reported that the location functions very well. The device-facing gate is therefore closed.
- Run #205 adds Hearthline as the fifth dedicated scene using Astra-derived `hearthline-realty.png` and `home-model.png`, with Home display, Property wall, and Property office groups exposing Browse homes, Mortgage options, Current residence, and Your homes & rentals.
- Hearthline remains a focused adapter over authoritative `PropertySystem`, `AssetFinancingSystem`, `ResidentialLifeSystem`, secured-loan/payoff, and Bank payment behavior. Existing purchase / Make Home eligibility is projected from `PropertySystem` for both legacy Assets UI and Hearthline. No tenant lease-signing / lease-selection system was added.

### Certification

- GitHub Actions Run #205 (`35244915393`, job `105282529337`) certified expanded source `5ea3d448a90c8b82044d33b5f4e31ef99e5b80e9` from upload wrapper `75af208552577ee3e66149e2685f98b334ec56c0`. Persistent gameplay diff from synchronized Run #204 `42bdf7501a67def2103c66cccbb204b71e82b724` is exactly **9 intended files**; workflow import also removes transient `everthread-source.zip`.
- Location Scene regression is **60/60**. QA-4 remains `core=81+1/82 specialized=76+1/77 overlap=0`, with all **82 core / 77 specialized** mandatory and zero overlap.
- Canonical preflight passed **6/6 in 32,517 ms**: Engine TS **2,635 ms**, Test TS **4,124 ms**, App TS **6,611 ms**, Node/Vite TS **698 ms**, regressions **15,093 ms**, production build **3,346 ms**. Production transformed **226 modules**.
- Certified source SHA-256 `ca5e6a8c89e778d01337f9460cd6a3014a898ff1a2235e67c713d8d5404a6f3e`; dependency SHA-256 `05a99dfd7074a8972e109b6b824b81bb431ad211b22e734a2c903ae5be862f73`; lock `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified artifact `10507520649`; Pages artifact `10507450705`; Pages deployment Green.
- Certified location-scene totals are now **5 scenes / 16 semantic groups / 29 scene action bindings / 10 selected Astra runtime assets**. Save schema remains **17**.
- After this documentation-only synchronization certifies, select exactly one remaining Astra-backed Location #6 after a fresh repository owner/source/test audit.

## Post-Run #203 Loomline device acceptance + Location #5 gate — 2026-09-17

### Player acceptance / sequencing

- Mavyy completed direct Android/player acceptance of the certified Loomline Motors scene after Run #203. System Back, safe-area/touch fit, rapid panel navigation, financing-browse neutrality, cold-load presentation, and overall tactile/visual behavior were accepted on-device.
- This documentation-only synchronization records that acceptance; it adds no gameplay, UI, assets, test-body, QA topology, save, or schema changes. QA-4 remains closed with the exact `core=81+1/82 specialized=76+1/77 overlap=0` handshake.
- After this documentation synchronization certifies, the next bounded rollout target is **Location #5 — Hearthline Realty & Leasing**. Reuse the existing property market, mortgage/asset-financing, current-residence projection, landlord/rental, renovation, sale/payoff, payment, and save authorities. Do not invent tenant lease-signing or lease-selection behavior that the certified source does not own.

## Loomline Motors dedicated location scene — CI Green Run #203 — 2026-09-17

### Added / changed

- Added **Loomline Motors** as the fourth dedicated location scene using Astra-derived `loomline-motors.png` and `showroom-car.png` presentation assets. Three semantic object groups—Showroom car, Service bay, and Finance office—expose four focused bindings: Browse vehicles, Your vehicles, Vehicle financing, and Driving licence.
- Added `MotorsLocationPanel` as a focused presentation adapter only. Vehicle catalogue/purchase/financing, garage truth, secured-loan context/payoff, repair/sale actions, and driving-licence mutation remain owned by the existing systems and `GameEngine`; no second vehicle inventory, finance ledger, licence state, or save authority was introduced.
- Preserved Weaver Park, Threadtone Music Studio, and Central Everthread Bank intact. The required direct Bank review was completed before widening to Location #4. Save schema remains **17**.
- Expanded the existing Location Scene regression to **52/52** rather than adding another registry suite. QA-4 remains unchanged at **82 core cases / 77 specialized suites / zero overlap** with exact handshake `core=81+1/82 specialized=76+1/77 overlap=0`.

### Certification

- GitHub Actions Run #203 (`35239439932`, job `105263759985`) certified expanded source `bde2f4a7498c2b677f27f8c805372ceb9019ef95` from upload wrapper `7079979d79b16b37a64e50b70f93270dbc3cb292`. Net persistent diff from synchronized Run #202 `d12e04e4e10689e2bba21427fc6cb066e9d570dd` is exactly **8 intended files**; the importer also removes transient `everthread-source.zip`.
- Canonical preflight passed **6/6 in 46,762 ms**: Engine TypeScript **3,814 ms**, Test TypeScript **5,813 ms**, App TypeScript **9,148 ms**, Node/Vite Config TypeScript **960 ms**, complete regression wall **22,511 ms**, production build **4,502 ms**.
- Certified source SHA-256 `699fb39bfe275ffae31ff5b8db8267da57fdef6093c86cb52fcadb66ee9f21ce`; dependency SHA-256 `08f34f2c107032a23439691e72d4c766d2bbdb8852d10f6d39b4c82c8409489b`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10503894830` (`05588aa54ba35016307b598087871415c5aade41c5cdef528ac8f31678a44db9`); Pages artifact `10505105082` (`1e29d8f2e54bdfcfd23da72e88b791d563c5cd0f65eb80a7f36c2743ef23e478`); Pages deployment reported success.
- Certified location-scene totals are now **4 scenes / 13 semantic groups / 25 scene action bindings / 8 selected Astra runtime assets**. Direct Android/player acceptance subsequently passed; after the documentation synchronization certifies, the next bounded target is **Hearthline Realty & Leasing as Location #5**.

## QA-4 process-isolated regression lanes — CI Green Run #201 — 2026-09-17

### Added / changed

- Canonical `npm test` now runs the measured regression wall through at most **two isolated Node processes**: a standard lane and a heavy lane. The heavy lane contains only the existing 25-life multi-life integration smoke plus Integrated Long-Life; all other core cases and specialized suites remain in the standard lane in their established relative order.
- Added exact shard-coverage verification. The parent wall refuses Green unless core-case indexes and specialized-suite IDs are disjoint across lanes and their union exactly matches the complete expected registry. Missing, duplicated, or misrouted coverage is therefore a hard failure rather than a silent speedup.
- Added a one-worker process-isolated fallback for debugging. Browser/global fixtures and mutable module state stay process-local; no concurrent worker shares a `GameState` or test VM.
- QA-4 changes only QA/test orchestration (`package.json`, `scripts/run-regression-wall.mjs`, `src/tests/regressionMetadata.ts`, `src/tests/regressionRegistry.ts`, `src/tests/regressionSuite.ts`, `src/tests/runRegression.ts`). The 25-life smoke body, its 25 lives / `regression-sim` seed prefix / max-age 125 parameters, Integrated Long-Life body, simulation harness, gameplay, saves, content, assets, and package lock remain unchanged. Newest gameplay implementation remains Run #192 / `1f5c8d598b6f277f26ffda5d7683d7474141200e`.

### Certification

- GitHub Actions Run #201 (`35231430935`, job `105236231925`) certified expanded QA-4 source `1a252744d9659328d7f66a2169271b70d9c0018a` from upload wrapper `61ae2ca182ed4f174697aab94030c4489f7a8008`. Net persistent diff from synchronized Run #200 `16bb69f34c7e4c0a99c65a60e61e5965d868a734` is exactly **6 QA/test-infrastructure files**; the importer also removes transient `everthread-source.zip`.
- Canonical preflight passed **6/6 in 42,372 ms**: Engine TypeScript **3,505 ms**, Test TypeScript **5,547 ms**, App TypeScript **7,675 ms**, Node/Vite Config TypeScript **850 ms**, complete regression wall **20,668 ms**, production build **4,014 ms**. Production remains **224 modules** and Vite itself built in about **3.65 s**.
- The two-worker registered wall passed with exact coverage handshake `core=81+1/82 specialized=76+1/77 overlap=0`. Standard lane: core cases 1–81 all Green, 76 specialized suites Green, **14,461 ms** process time. Heavy lane: core case 82 Green in **15,401 ms**, Integrated Long-Life **105/105** Green in **3,034 ms**, **19,788 ms** process time.
- The complete five-stage regression wall reports **5/5 Green in 20,544 ms**: registered regressions **19,791 ms**, New Life layout **33 ms**, activity minigames **185 ms**, feedback reporting **255 ms**, central-inbox feedback **278 ms**.
- Against adjacent certified Run #200, the wall changed **35,727 → 20,544 ms** (**15,183 ms / ~42.5% lower**) and the canonical regression stage changed **35,874 → 20,668 ms** (**~42.4% lower**). Full canonical preflight changed **60,351 → 42,372 ms** (**17,979 ms / ~29.8% lower**). These are adjacent CI samples, not a claim that every runner will reproduce the exact percentage.
- Run #201 certified source SHA-256 `9cb33dbc955df0ed018811959de5928f861d1628ee5dd9d278be655b815e0318`; dependency SHA-256 `100cbff80852cb5cd3faf9c996e0c5cb21a60599995c0e84a25aae4f07b73116`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10501795811` (`24467447db18afa6e47477c355d3469ab876aae4be91a61117aa555951f9457a`); Pages artifact `10501840639` (`47142a09e8518e7cc2089fa501b36e08686be3a19433b787fbf00497b736bc48`); Pages deployment reported success.
- **QA infrastructure optimization stops here.** QA-1 through QA-4 are certified. No QA-5 is planned without new measured evidence. After the mandatory QA-4 documentation sync certifies, return to the existing player-facing gate: direct review of Central Everthread Bank before any fourth location scene.

## QA-3 regression registry + timing visibility — CI Green Run #199 — 2026-09-17

### Added / changed

- Added one ordered regression registry around the existing specialized suites and a serial top-level regression-wall runner. The change improves observability only: existing test bodies/assertions remain intact, the historical specialized-suite order remains serial, and canonical coverage is not reduced.
- The base 82-case regression harness now records per-case durations. The registry records stable suite IDs, labels, pass/fail status, check counts, duration, and a coarse `standard`/`heavy` classification. The top-level wall records the registered regressions plus New Life layout, activity minigames, activity feedback reporting, and central-inbox feedback as five timed serial stages.
- Registry reporting intentionally counts **78 registered suites = 1 core suite + 77 specialized suites**. This does not add a test suite; it makes the existing core suite a first-class timed registry entry alongside the 77 existing specialized suites.
- QA-3 changes only QA/test orchestration (`package.json`, `scripts/run-regression-wall.mjs`, `src/tests/regressionRegistry.ts`, `src/tests/regressionSuite.ts`, `src/tests/runRegression.ts`). Gameplay, UI, durable state, save schema, content catalogs, assets, workflow YAML, and simulation parameters remain unchanged. Newest gameplay implementation remains Run #192 / `1f5c8d598b6f277f26ffda5d7683d7474141200e`.

### Certification

- GitHub Actions Run #199 (`35227365026`, job `105222262261`) certified expanded QA-3 source `7c8d0f2fc9da1a4461877caf1ae9a2b4b1660c28` from upload wrapper `5bcd688058dbe13fbd405d95b4e942e29da59178`. Net persistent diff from synchronized Run #198 `4232ef0e382f4f05bbd5e8a025aff9489dbe1e9c` is exactly **5 QA-harness files**; the importer also removes the transient `everthread-source.zip`.
- Canonical preflight passed **6/6 in 62,594 ms**: Engine TypeScript **4,133 ms**, Test TypeScript **6,565 ms**, App TypeScript **9,306 ms**, Node/Vite Config TypeScript **1,015 ms**, complete regression wall **36,672 ms**, production build **4,699 ms**. Production remains **224 modules**; Vite itself built in about **4.24 s**.
- Base regression remains **82/82** and now reports **82 case timings**. In certified CI the core suite took **19,832 ms**; the existing 25-life `multi-life integration smoke` case alone took **16,264 ms** (~82% of core-suite time). The next heaviest core cases were seeded-history serialization **707 ms**, eight-generation continuation **622 ms**, and state-scoped runtime-ID uniqueness **476 ms**.
- Registered regressions report **78/78 suites passed in 34,411 ms** (1 core + 77 specialized). The largest registered costs after the core suite were Integrated Long-Life **3,577 ms**, Dynasty Transition **1,238 ms**, Collision-Aware Naming **817 ms**, Estate Administration **511 ms**, and NPC Asset Ownership **496 ms**.
- The complete five-stage regression wall reports **5/5 Green in 36,518 ms**: registered regressions **35,650 ms**, New Life layout **39 ms**, activity minigames **221 ms**, feedback reporting **292 ms**, central-inbox feedback **316 ms**. This is evidence for QA-4 boundary selection, not a claim that every suite should be parallelized.
- Run #199 certified source SHA-256 `26602cf008d3fb963f372ab99e56101e359bffcf8103873c59e2532b6f8994da`; dependency SHA-256 `00bd3ea3ae32434f354ed9eb38f2ddda9fb9e52ed50e8e6332eef1bed881885c`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10499028734` (`9ccbd7826336df1b6cf8200f4fc5068fe3b24d0b1ef24e6d2d542e05f199610f`); Pages artifact `10499608076` (`9b2e0223ffb776d10c7bc91e89ad02ef6d0c37c51cf050dbfca339cbe0d2d4b0`); deployment reported success.
- **Historical next gate was QA-4**, now certified/closed in Run #201 with exact full-coverage partition verification. QA infrastructure optimization stops there unless new measured evidence justifies reopening it.

## QA-2 TypeScript graph + redundant build-compiler cleanup — CI Green Runs #196–#197 — 2026-09-17

### Added / changed

- **QA-2A / Run #196** isolates production App TypeScript roots from `src/tests` and adds explicit App plus Node/Vite-config typecheck stages. The Test project continues to root all test files, Engine TypeScript remains a distinct gate, and the legacy `tsc -b` production build was intentionally retained for this checkpoint as an equivalence backstop.
- QA-2A adds bounded `preflight:app` and `preflight:node` commands. Standard canonical certification becomes Engine TS → Test TS → App TS → Node/Vite Config TS → complete regression wall → production build. No test body, assertion, simulation parameter, save/migration check, strictness rule, or gameplay owner changed.
- **QA-2B / Run #197** removes only the redundant `tsc -b` invocation from `npm run build` after Run #196 proved all four explicit compiler gates Green under the complete existing wall. Production `build` is now bundle + build-info only; TypeScript correctness remains mandatory earlier in canonical preflight.
- QA-2 changes no gameplay, UI, content catalogs, durable state, save schema, assets, workflow YAML, dependencies, or regression bodies. Newest gameplay implementation remains Run #192 / `1f5c8d598b6f277f26ffda5d7683d7474141200e`.

### Certification

- Run #196 (`35183198144`, job `105079606201`) certified expanded QA-2A source `4cb845c97dca8c7e4537337ed7f456fa1aa7de19` from upload wrapper `56ed892730a0caea7228bef8624afdc076a5ade1`. Net persistent diff from synchronized Run #195 is exactly **4 infrastructure/config files**: `package.json`, `scripts/everthread-preflight.mjs`, `tsconfig.app.json`, and `tsconfig.tests.json`. Canonical preflight passed **6/6** in **52,247 ms**; production build stage **10,342 ms** with the legacy compiler backstop still present.
- Run #197 (`35186102059`, job `105088391776`) certified expanded QA-2B source `3b3b9e9d13cf882dcd20874573db895a322434c9` from upload wrapper `3bf94f80badabf5b2644b75b3708dc75a696abf5`. Net persistent diff from Run #196 is exactly **one modified file / one build-script line** in `package.json`.
- Run #197 canonical preflight passed **6/6** in **53,857 ms**: Engine TypeScript **3,790 ms**, Test TypeScript **5,593 ms**, App TypeScript **7,930 ms**, Node/Vite Config TypeScript **908 ms**, complete regression wall **31,295 ms**, production build **4,233 ms**. Base regression remains **82/82**, Integrated Long-Life **105/105**, Location Scene **44/44**, and the complete established wall remains Green.
- QA-2B reduces the production-build stage from **10,342 → 4,233 ms**, a **6,109 ms / ~59%** reduction in that stage. The total wall is not presented as a direct speedup because independent regression/typecheck timing varied between runners. Production remains **224 modules** and build info records the exact expanded source.
- Run #197 certified source SHA-256 `28cae67c9e1bf010400f0e1fd1bae594919ee98384cb82cca4678acf5cebc107`; dependency SHA-256 `f0e5908669978df5eacafffa5d437e229ce08c57b32fd163f228f7ea9779e8d8`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10482745723` (`dafa90e6eb98cf154d85aa9298a5aa593f87bae73a5ef1e9da7c8c4d448da511`); Pages artifact `10482835166` (`94f98fad7b77b485223ace64b8cded7686036a2d30cfd5aa18c08428104aad3e`); deployment reported success.
- Next infrastructure slice is **QA-3 regression registry/timing**. Preserve test bodies and serial semantics first; use measured evidence before deciding QA-4 shard boundaries.

## QA-1 bounded preflight + evidence hardening — CI Green Run #194 — 2026-09-17

### Added / changed

- Added **stage-selectable canonical preflight execution** without changing the mandatory standard certification wall. `scripts/everthread-preflight.mjs` can now run bounded development stages for Engine TypeScript, Test TypeScript, the complete regression wall, production build, content audit, and the 1,000-life simulation; `npm run preflight` remains the aggregate standard certification command and `preflight:deep` remains the aggregate deep command.
- Added package scripts `preflight:engine`, `preflight:tests-ts`, `preflight:regressions`, `preflight:build`, `preflight:content`, and `preflight:sim`. A stage-only Green is explicitly labeled **development evidence, not canonical certification**. No regression, assertion, simulation count, save gate, TypeScript strictness rule, or production-build requirement was removed.
- Expanded `.everthread/preflight-report.json` evidence with exact source commit, clean/dirty working-tree state, a status fingerprint, cache-reusability flag, selected-stage identity, per-stage start/finish timestamps, duration/exit status, and SHA-256 fingerprints for the package/lock/config inputs relevant to each stage. Dirty-tree stage evidence is marked diagnostic/non-reusable rather than silently treated as certified proof.
- This slice changes only QA orchestration (`package.json` + `scripts/everthread-preflight.mjs`). Gameplay, UI, saves, content, test bodies, workflow YAML, assets, and save schema remain unchanged. Newest gameplay implementation remains Run #192 / `1f5c8d598b6f277f26ffda5d7683d7474141200e`; Run #194 becomes the newest certified repository/QA baseline.

### Certification

- GitHub Actions Run #194 (`35181808022`, job `105075377955`) certified expanded source `fb9cc4fb7c271cb2b37188a11f75663535371767` from upload wrapper `c0bb0c55080028e6354ae41a52e00c2626365b8e`. Net persistent diff from synchronized Run #193 `226c6390be08a40bde0de6964152f2c8d4cdc61f` is exactly **2 intended infrastructure files**: `package.json` and `scripts/everthread-preflight.mjs`; the workflow import also removes the transient `everthread-source.zip`.
- Canonical preflight passed **4/4** on a clean working tree in **40,472 ms**: Engine TypeScript **2,615 ms**, Test TypeScript **3,978 ms**, complete regression wall **23,274 ms**, production build **10,597 ms**. The regression wall retains base **82/82**, Integrated Long-Life **105/105**, Location Scene **44/44**, Map **46/46**, institution routing **42/42**, Credit & Banking **75/75**, Payment & Asset Management **81/81**, Music **76/76**, Secret Yuki **36/36**, Character Visual **76/76**, New Life **8/8**, minigames **19/19**, feedback **20/20 + 23/23**, and the rest of the established wall.
- Production remains **224 modules**; Vite itself built in about **3.02 s** inside the **10.597 s** production-build stage. Existing >700 kB chunk warnings remain nonblocking and unchanged in meaning.
- Certified source SHA-256 `63b21ff3eb361944f0b9da92a2b0ce34818535f00a8b959191835861170f9f18`; dependency SHA-256 `d17c900765a62d000df1307fffb9173f130472f474af16b92693ec814c54857c`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10480573406` (`86ba8c0a400f3eb00747ce0582847d7dcf9d49b93d35b99e0f335a0cf8a241cd`); Pages artifact `10479909888` (`87cebd9b071db6cc7e1fcd557d4ed4a32070299bccecf3641c075b48dd1ebaca`); deployment reported success.
- Next QA-infrastructure slice is **QA-2: production TypeScript graph cleanup**. It must preserve Engine/Test/App type safety while proving that tests are not redundantly rooted by the production app graph; do not remove the existing compiler/build path until equivalence is demonstrated under the current certified wall.

## Central Everthread Bank dedicated location scene — CI Green Run #192 — 2026-09-17

### Added / changed

- Added **Central Everthread Bank** as the third dedicated scene-backed Town Map location, preserving the Run #187/#189/#190 full-bleed scene shell, unified utility drawer, map-state preservation, semantic hotspot geometry, Things-to-do parity, and local Back unwinding.
- Imported only the two Astra runtime assets needed for this slice: `central-everthread-bank.png` and `service-kiosk.png`. The scene defines three semantic groups—Banking kiosk, Teller counter, Advisor office—with seven focused panel bindings for money summary, bills/payments, accounts, credit offers, borrowing, investments, and credit history.
- Added reusable `MoneySummaryView` and `InvestmentMarketView`, then reused them from both the Bank scene and existing Assets screen. Added `CreditBankingFocusedView` around the already-established credit/payment/borrowing bodies while preserving the public `CreditBankingPanel` API. This reduces presentation drift without moving finance authority into location UI.
- The Bank scene never mutates money directly and owns no account, debt, credit-score, payment, portfolio, or save state. Mutations continue through existing `GameEngine` actions and established Finance, Credit, Payment, Personal Borrowing, and Investment systems. Scene browsing and availability remain state/RNG/runtime-ID neutral; downstream owners retain action-specific gates such as investment adulthood. Save schema remains **17**.
- Location Scene regression expands **40 → 44** for exact three-scene rollout, Bank action/group parity, state-neutral child browsing, and kiosk prop geometry. Certified scene totals are **3 surfaces / 10 semantic groups / 21 action bindings / 6 selected Astra runtime assets**.

### Certification

- GitHub Actions Run #192 (`35178859400`, job `105066477713`) certified expanded source `1f5c8d598b6f277f26ffda5d7683d7474141200e` from upload wrapper `d0d26c118a378ceabb93aafc97cb0cb24f30d263`. Net diff from synchronized Run #191 `68d74f6c6204aa85c3dae661b46d2e8101ef5f2d` is exactly **10 intended files**; workflow import reports 11 because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4** in **49,109 ms**: Engine TypeScript **3,276 ms**, Test TypeScript **5,083 ms**, complete regression wall **28,110 ms**, production build **12,636 ms**. Location Scene **44/44**; Credit & Banking **75/75**; Payment & Asset Management **81/81**; Map **46/46**; institution routing **42/42**; base **82/82**; Music **76/76**; Secret Yuki **36/36**; Character Visual **76/76**; Dynasty **66/66**; Long-Life **105/105**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **224 modules**. Town Map lazy JS ~**35.48/10.70 kB gzip** and CSS ~**24.42/4.66**; People ~**58.82/17.86**; Player Profile ~**10.20/2.94**; lazy `characterArtPack` ~**971.11/69.18**; main ~**1,361.81/380.49**. Existing >700 kB warning remains nonblocking.
- Certified source SHA-256 `c857954cf15ed3a761daa9d6d2985d2b793cc9ceb1d6593ea7d04bef23e10731`; dependency SHA-256 `b39ae97fe6ae6ca22ad0b0a777549a134c94e683507c1f917ee6a8b5d8911dac`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10479623295` (`bc100c21ee49fc0a35c74425cbf4c675be72e4b490ca85a99bf8fd27a34026ae`); Pages artifact `10479573465` (`243767c5c4037cfda59418761c6c0d9bfda5f3ba5a98bd403ca08e2ef8b24ae4`); deployment reported success.
- Post-certification live Feedback Inbox sweep remains **5 total / 0 unresolved by triage**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` advanced to `1f5c8d598b6f277f26ffda5d7683d7474141200e` at `2026-09-17 03:49:20.500943+00`, reviewed count **5**.

## Dedicated location scenes immersive polish + utility-drawer hotfix — CI Green Runs #189–#190 — 2026-09-16

### Added / changed

- Run #189 applies the first player-reviewed presentation polish to the certified Weaver Park + Threadtone Music Studio scene shell: scene artwork now owns the full location viewport beneath the global Everthread header and above bottom navigation; the internal location header and semantic hotspot controls become transparent overlays; labels use outlined/shadowed text for readability; numbered hotspot markers are replaced by a hand/interact affordance; and the Things-to-do / Map utility surface becomes locally collapsible without adding save state.
- Full-bleed artwork uses shared `coverLocationScene` geometry and the exact same stage transform for art, semantic hotspots, and props. This preserves object alignment while allowing the illustration to touch the viewport edges. Extreme short-landscape cropping remains safe because the first-class Things-to-do path exposes the same action bindings.
- Run #190 fixes a player-reproduced utility-tray composition bug from the first polish deployment. The chevron handle, Things to do, and Map controls are now one shared drawer instead of independently positioned siblings: expanded shows handle + both controls, collapsed retracts the whole button row and leaves only the handle above navigation, and opening an object/detail panel hides the drawer as one unit.
- Drawer state remains presentation-only React state. No `GameState`, save schema, RNG, runtime-ID, Town Map authority, action binding, or gameplay owner changes were introduced. Save schema remains **17**.
- Location Scene regression expands **34 → 39** in Run #189 for immersive cover geometry/presentation behavior and **39 → 40** in Run #190 for the unified drawer-state contract.

### Certification

- Run #189 (`35173827772`, job `105051024289`) certified expanded source `7509d29baa2538e1e69c7938b1bdba9e3cc29efd` from upload wrapper `5873f70ad500a43b1feaecd5444d136768294468`. Net diff from synchronized Run #188 source `97d8b988cb100568ef164495559c34806a4a1805` is exactly **4 intended source/test files**. Canonical preflight passed **4/4** in **54,297 ms**; Location Scene **39/39**; production build **222 modules**. Certified source SHA-256 `e9c7c04d99d47e3eb1b4f3cb5b60b5f4ad5c83d2bcc1bb8b448accd92857c3a5`; certified artifact `10477841892` (`301e695fcee2742de5a5aadeebe465c97deb9310940f61e4cb338bc565a65c7f`); Pages artifact `10478315007` (`4e60630324017c24cba7f923a2b3fa165aeb85061e574c8b195cd39e306cae5d`); deployment succeeded.
- Run #190 (`35175656593`, job `105056670426`) certifies the player-reported drawer repair on expanded source `ebf2ed8eb3a40276e055ce098818398add28b0d6` from upload wrapper `67307cac76713b9cc26d06ede39e421f1b4508f6`. Net diff from Run #189 is exactly **4 intended source/test files**. Canonical preflight passed **4/4** in **34,252 ms**: Engine TypeScript **2,350 ms**, Test TypeScript **3,600 ms**, complete regression wall **19,126 ms**, production build **9,172 ms**. Location Scene **40/40**; Map **46/46**; institution routing **42/42**; Shared Lives **53/53**; Dating **61/61**; Music **76/76**; lifecycle **48/48**; Secret Yuki **36/36**; Character Visual **76/76**; Yuki Art **19/19**; Dynasty **66/66**; Long-Life **105/105**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Run #190 production remains **222 modules**. Town Map lazy JS ~**32.62/10.03 kB gzip** and CSS ~**24.42/4.66**; People ~**58.82/17.86**; `characterArtPack` ~**971.11/69.18**; main ~**1,360.79/380.22**. Existing >700 kB warning remains nonblocking.
- Run #190 certified source SHA-256 `5ab9129e4301e9e35622ccc04cfe52e67ed613084c5ba78583ddac0ad7cce603`; dependency SHA-256 `18709e220caaf49ba0557f9eccc2b1dcc5987dbe14af4186d7ef3971db59ac18`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10478273242` (`128140b302c6de30b4770ce94ddf559384fdfa7cf7154629c0e87f388960f661`); Pages artifact `10477874907` (`e7b2273920147d9aa85bcbefadf8d314c709a2ff5ec2c79a2c5da3004bfc11d0`); deployment succeeded.
- Post-certification Feedback Inbox remains **5 total / 0 unresolved by triage**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` advanced to `ebf2ed8eb3a40276e055ce098818398add28b0d6` at `2026-09-17 02:48:02.61955+00`, reviewed count **5**.

## Dedicated location scenes first slice — CI Green Run #187 — 2026-09-16

### Added / changed

- Added the first certified dedicated location-scene rollout for **Weaver Park** and **Threadtone Music Studio**. Selecting either enabled place from the existing Everthread map now opens an illustrated, object-driven place surface instead of forwarding into the broad legacy Activities/Career pages. The underlying map remains mounted so camera/search/filter state survives the visit and the originating pin remains highlighted on return.
- Added reusable `LocationScene` / `LocationSceneSystem` / data contracts without creating a second simulation authority. Scene actions consume existing wellness, Shared Lives, dating, action-economy, music lifecycle/release/tour/partnership, exit, and retirement owners; availability is projected from those systems and rechecked before mutation. Browsing a room, object menu, catalog, or unavailable action does not consume gameplay RNG or silently mutate `GameState`.
- Weaver Park exposes a park bench (Walk together / Play outside / accepted Park date), walking trail (Walk / Run), and quiet pavilion (Meditate). Threadtone exposes the producer desk (Leave Music Path / Retire with confirmation), rehearsal nook (Practice vocals / Tour), recording booth (Release Song / Album), and record shelf (existing catalog and distribution-offer projections).
- Added data-driven 1024×1536 contained scene geometry, semantic hotspot groups, minimum 48px targets, readable edge-aware labels, a first-class **Things to do** fallback with action parity, and local Back unwinding (focused detail/picker → object menu → location → preserved map). Artwork uses `contain`, never `cover`, so hotspot coordinates stay aligned with the authored scene.
- Imported only the **4 runtime Astra assets** needed for this first slice: Weaver Park + Threadtone backgrounds and park-bench + producer-desk props. The broader Astra 25-location package remains design input, not shipped/certified content yet. Save schema remains **17**.
- Added dedicated Location Scene regression **34/34**, covering exact two-place rollout, geometry/touch constraints, read-only browsing, age/action gates, companion/date filtering, music lifecycle gates, catalog/offer projection, label alignment, and Back-stack contract.

### Certification

- GitHub Actions Run #187 (`35170740515`, job `105041659840`) certified expanded source `c68757f75f38f76fc616589450b1a39b41e1b6d0` from upload wrapper `f3898378133f48f7b60816f3cfb46596f554c781`. Net diff from synchronized Run #186 source `e1787ac018d47b580dd49ac9854c087fc07ec729` is exactly **12 intended source/test/asset files**; workflow import reports 13 changed files because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4** in **61,250 ms**: Engine TypeScript **3,991 ms**, Test TypeScript **6,258 ms**, complete regression wall **35,711 ms**, production build **15,286 ms**. Location Scene **34/34**; Map **46/46**; institution routing **42/42**; Shared Lives **53/53**; Dating **61/61**; Music **76/76**; lifecycle **48/48**; Secret Yuki **36/36**; Character Visual **76/76**; Yuki Art **19/19**; Dynasty **66/66**; Long-Life **105/105**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **222 modules**. Town Map lazy JS ~**31.63/9.66 kB gzip** and CSS ~**22.96/4.38**; People remains ~**58.82/17.86**; lazy `characterArtPack` remains ~**971.11/69.18**; main ~**1,360.79/380.23**. Existing >700 kB warning remains nonblocking.
- Certified source SHA-256 `8225082ce4b5489ceb2efd59a7260afa5a0f3893555b97f38170ac1e1ae69cee`; dependency SHA-256 `a0add8575bcb362a98de2379a894d215f3b1f1d4eb6cf0a0be5318668e2d86b2`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10477005329` (`88d522000bd1865d8deba4945e3e023ed10e64dbe08aabda8aa8e61251a48f01`); Pages artifact `10477005335` (`0cbd4c99776cbc127208060ecfd57937e1ea9a49877d7ccc7e32ecfdf40b6b5a`); Pages deployment reported success.
- Post-certification Feedback Inbox remains **5 total / 0 unresolved by triage**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` advanced to `c68757f75f38f76fc616589450b1a39b41e1b6d0` at `2026-09-17 01:34:16.880968+00`, reviewed count **5**.

## Secret Yuki durable provenance-routing hotfix — CI Green Run #185 — 2026-09-16

### Fixed

- Fixed a player-reproduced Hidden Threadroom regression where the correct Yuki NPC could eventually open as an ordinary People profile in a long-running life. The save itself remained intact: the `secretCode:yuki:9426` flag still pointed to the exact NPC, but the old `secret_yuki_9426` narrative origin memory had been pruned after the intentionally bounded relationship-memory history reached its 36-entry ceiling.
- Moved live special-identity resolution to `SecretCodeSystem.secretYukiNpcId(state)`: the existing durable secret-code flag is primary, while the origin memory is retained as a legacy-recovery fallback for older/current-schema saves that need flag repair. No new identity ledger, unbounded-memory exception, save migration, or schema bump was introduced.
- Updated People Threadspace and Hidden Threadroom routing to use state-aware `isSecretYukiNpc(state,npc)` / `peopleSurfaceForNpc(state,npc)`. Ordinary/decoy NPCs cannot gain the special room through matching name or appearance fields, and visual settings such as font family/text color cannot revoke it.
- Expanded Secret-code regression **32 → 36 checks** with bounded-memory pruning, font/text-color presentation isolation, pruned-history deterministic repair, decoy isolation, and RNG/runtime-ID neutrality. The player-exported life was also used to reproduce the before/after routing failure without modifying the save.

### Certification

- GitHub Actions Run #185 (`35121435267`, job `104879924533`) certified expanded source `d3760daa841f21e4a73bd4a22bbcd5f6560b08a4` from upload wrapper `6bbd4a7aef2dc876748f056d2fcecdcb040ba0ce`. Net diff from synchronized Run #184 source `f8842340b36dc69e10c5481449576927c9f7fab7` is exactly **5 intended source/test files**; workflow import reports 6 changed files because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4** in **66,135 ms**: Engine TypeScript **5,109 ms**, Test TypeScript **6,635 ms**, complete regression wall **37,816 ms**, production build **16,570 ms**. Secret-code **36/36**; People **57/57**; Character Visual **76/76**; Visual Identity **12/12**; Yuki Art **19/19**; base **82/82**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **218 modules**. People ~**58.82/17.86 kB gzip**; Player Profile ~**10.20/2.95**; lazy `characterArtPack` ~**971.11/69.18**; main ~**1,360.69/380.17**; CSS ~**87.92/16.19**. Existing >700 kB warning remains nonblocking.
- Certified source SHA-256 `12235fce17c4bf551887937413767cb9dc4071cbfb2add27167fc6fb6fdc74dc`; dependency SHA-256 `e240824d278b823e095058fed93dc02c18da4915bf38709b696a16982b2a958b`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10457241561` (`afe8df394ead5d1c583828814393c065595497f609d3bfb100521b32c3f0558e`); Pages artifact `10457561283` (`38863e6d029dd864df9e978e34706810369c36759735b78fc34688c47751106b`); Pages deployment reported success.
- Post-certification Feedback Inbox remains **5 total / 0 unresolved by triage**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` advanced to `d3760daa841f21e4a73bd4a22bbcd5f6560b08a4` at `2026-09-16 16:25:10.400372+00`, reviewed count **5**.

## Character Visual richer aging/presentation — CI Green Run #183 — 2026-09-15

### Added / changed

- Added one deterministic, read-only `characterAgePresentation` projection over the existing stable `CharacterVisualIdentity`. `Character.age` / `Npc.age` remain the only aging authority; birthdays do not rewrite saved appearance, allocate runtime IDs, or consume gameplay RNG.
- Mature/elder rendering now uses the supplied facial-aging detail assets at deterministic age thresholds while preserving the same face/eye/brow/nose/mouth/ear/body/hair-style identity. Natural hair palettes gain deterministic individual graying onset (48–64), then progress silver → white; already silver/white and stylized/dyed palettes remain authored rather than being forcibly recolored.
- Age-inappropriate stored presentation is projected safely without mutating saves: under-18 characters cannot visibly wear the adult work-only scrub/lab-coat/work-shirt set; facial hair is hidden below 15 and reduced to light teen presentation at 15–17 before the stored adult style returns at 18+.
- Player Profile appearance copy now consumes the same age-aware projection as the portrait, preventing text/portrait contradictions such as visible silver hair with an adult stored-color description or hidden elder details still appearing in profile copy.
- Character Visual regression expands **60 → 76 checks** and covers stage boundaries, safe invalid-age normalization, read-only/RNG-neutral projection, natural-vs-stylized hair aging, youth clothing/facial-hair gating, mature/elder details, portrait layer behavior, and age-aware profile description parity. Save schema remains **17** and no art assets/content definitions were added.

### Certification

- GitHub Actions Run #183 (`35040783887`, job `104619936027`) certified expanded source `ecd7e58c32a3145e8354f7397b70fc14d1feaf64` from upload wrapper `8988105410ed6af26e5ddc505cbf5b571db6f511`. Net diff from synchronized Run #182 source `948b7f3bda7fcbe7d801ec1994b36a50ac7b447c` is exactly **4 intended source/test files**; workflow import reports 5 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4** including the single-command complete regression wall that exceeded the local container execution ceiling. Base **82/82**; Character Visual **76/76**; Player Profile **63/63**; People **57/57**; Family Visual **27/27**; Secret-code **32/32**; Yuki Threadroom Art **19/19**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Integrated Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **218 modules**. Player Profile ~**10.20/2.95 kB gzip**; People ~**58.81/17.86**; lazy `characterArtPack` unchanged at ~**971.11/69.18**; main ~**1,360.67/380.18**. Existing >700 kB chunk warning remains nonblocking.
- Certified source SHA-256 `dd824f03b0ad2095a6f254f7afba2d63fb094237b1324cfd214bd0fde86d498d`; dependency SHA-256 `fdd414a7d14e6fcba1d0d667bc840208faa7df9de0771c6ed0aab4eaa985a362`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10424553271` (`c9c7460178067d9eabb4cb944c4ec3378827ae93c9d23a76661726c1952d8e49`); Pages artifact `10424359343` (`5a20b80bcf345df9644945a1f5c0a5b389549169402680ccfa42b250cf29800f`); Pages deployment reported success.
- Post-certification Feedback Inbox remains **5 total / 0 unresolved**; durable review checkpoint `main` advanced to `ecd7e58c32a3145e8354f7397b70fc14d1feaf64` at `2026-09-16 00:39:27.036715+00`, reviewed count **5**.

## Yuki Threadroom viewport/fallback hotfix — CI Green Run #181 — 2026-09-15

### Fixed

- Moved the Hidden Threadroom root through a React portal onto `document.body` so the full-screen special surface is no longer trapped inside Threadspace's low stacking context. The room now correctly overlays Everthread's ordinary top app bar and bottom navigation while preserving higher-priority global overlays.
- Gave non-Astra age-aware fallback portraits their own compact square scene geometry instead of reusing the tall seated-adult sprite stage. Newborn/child/teen/mature/elder Yuki can remain on the modular renderer without being buried behind the dialogue/action sheet.
- Extended the dedicated Yuki Threadroom art regression to **19/19**, including an explicit age-0 case proving newborn Yuki uses the age-aware modular fallback rather than the adult painted sprite. No assets, save schema, identity logic, relationship logic, or simulation authority changed.

### Certification

- GitHub Actions Run #181 (`35035042349`, job `104602148567`) certified expanded source `fd304ae097dbb5fccab52085fd32ab838b011887` from upload wrapper `703516842c2e09a07ab298e60ec4dadce80490a4`. Net diff from Run #180 source `3d33429bed185c9c382a21f9926fda362fba79b9` is exactly **3 intended files**; workflow import reports 4 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. Yuki Threadroom Art **19/19**; Secret-code **32/32**; Character Visual **60/60**; Family Visual **27/27**; base **82/82**; People **57/57**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Integrated Long-Life **105/105**; 10E **103/103**; New Life **8/8**; minigames **19/19**; feedback regressions **20/20 + 23/23**.
- Production build passed at **218 modules**. People lazy JS ~**58.81/17.86 kB gzip**; People CSS ~**22.57/4.69**; lazy `characterArtPack` remains ~**971.11/69.18**; main remains ~**1,358.35/379.57**.
- Certified source SHA-256 `aea29e68948a539fb6c3e34718fea5c2faf6f687adc7901d9bf41033a7be1d7c`; dependency SHA-256 `81bd74d91f8a789f01d8ba6bae72e290fe378d0664cc94f180c71d33d9260400`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified artifact `10423216985` (`7a71b8b856d2e00c66ad3612b1ff6a2700fb9f63ec2ca138dadee45d275ab38d`); Pages artifact `10422897873` (`a4d360a39e81ad4a5121f9ee3a8047796fb95fcee4a5bd36c228e6cfab2b552b`); Pages deployment reported success.
- Post-certification Feedback Inbox remains **5 total / 0 unresolved**; durable review checkpoint `main` advanced to `fd304ae097dbb5fccab52085fd32ab838b011887` at `2026-09-15 23:20:12.674778+00`, reviewed count **5**.

## Yuki Threadroom reactive Astra art integration — CI Green Run #180 — 2026-09-15

### Added / changed

- Integrated a curated subset of Astra Yuki's reactive Threadroom art kit into the already-certified Hidden Threadroom without replacing its simulation architecture. The exact secret-origin Yuki NPC, Relationship, memories, family links, dates/gifts/milestones, action economy, and save state remain authoritative.
- Added responsive day/evening room art, seated adult Yuki PNGs, expression/blink/talking face patches, and Everthread/Yuki iconography as static presentation assets. Runtime reaction/blink/speech state is UI-only: it is never written to `GameState`, never consumes gameplay RNG, and never becomes a second affection/mood ledger.
- Painted adult Yuki is intentionally restricted to the **18–44 adult visual stage**. Younger and older ages retain the special Threadroom but fall back to the existing age-aware modular `CharacterPortrait` until matching authored stage art exists.
- Added `YukiReactivePortrait`, centralized Threadroom asset metadata, responsive scene composition, reduced-motion handling, timer cleanup, and an **18/18** dedicated art/presentation regression. Exactly **41 selected runtime art assets** were imported rather than the full design-kit archive.

### Certification

- GitHub Actions Run #180 (`35033324379`, job `104596639702`) certified expanded source `3d33429bed185c9c382a21f9926fda362fba79b9` from upload wrapper `01740bedf5a79c4578f77a238ff2af7aec39224d`. Net diff from synchronized Run #179 source `34b7cc0bec84ce3f7124f013a05311c566f80728` is exactly **48 intended files**: 7 source/test files + 41 selected presentation assets.
- Canonical preflight passed **4/4**. Yuki Threadroom Art **18/18**; Secret-code **32/32**; Character Visual **60/60**; Family Visual **27/27**; base **82/82**; People **57/57**; Dynasty **66/66**; Long-Life **105/105**; 10E **103/103**; minigames **19/19**; feedback regressions **20/20 + 23/23**.
- Production build passed at **217 modules**. People lazy JS ~**58.72/17.81 kB gzip**; People CSS ~**22.26/4.61**; lazy `characterArtPack` remains ~**971.11/69.18**; main remains ~**1,358.35/379.57**.
- Certified source SHA-256 `da39625174446e0ff39f28bb088f902e66ef3097b356bf816201771edb3b44d1`; dependency SHA-256 `eee896666d92ee2ac424d314ac3fc9903eee989493cc2432597bba5ddcd7ca04`; package-lock SHA-256 unchanged. Certified artifact `10422221712` (`743be87eda5cadc9fb9300c5aa16d3bc9ccd1e18e0bee9181e9551ef19384c40`); Pages artifact `10422097592` (`e0b38649ddfad0ed795cc550310fbd4d517824dd4aac7335dc2f4cad8dbacf36`); Pages deployment reported success.
- Post-certification Feedback Inbox was **5 total / 0 unresolved** and review state advanced to Run #180 source before the player-facing cutoff hotfix was implemented.

## Secret Yuki / Hidden Threadroom — CI Green Run #178 — 2026-09-15

### Added / changed

- Upgraded Sandbox secret code `9426` from a generic randomized NPC spawn into one authored **Yuki Aster** identity while preserving the existing NPC/Relationship simulation authorities. The secret NPC still lives in ordinary `GameState`, ages normally, keeps memories, participates in relationships/family systems, and receives consequences through the same systems as every other person.
- `SecretCodeSystem` now owns one curated modular appearance for the secret-origin Yuki: heart/soft facial structure, long wavy white hair, rose-ivory skin, ice-blue eyes, and a dark pullover-hoodie presentation. A permanent `secret_yuki_9426` NPC memory is the durable identity marker; routing never depends on the display name alone.
- Added deterministic/idempotent current-schema repair for already-spawned pre-curation Yuki saves. Repair restores the authored portrait, permanent secret flag, and immediate portrait reveal without consuming gameplay RNG or allocating runtime IDs. Save schema remains **17**.
- Added `YukiThreadroomSystem` and a dedicated full-screen `YukiThreadroom` surface. Selecting the secret-origin Yuki in People Threadspace routes to the Hidden Threadroom instead of the ordinary NPC profile. Ordinary/decoy NPCs named Yuki continue to use the normal profile.
- The Threadroom uses the existing `CharacterPortrait`, Relationship, NPC memories, and engine interaction authority. It provides a large authored portrait, relationship-aware greeting/status, six original conversation threads, recent memories, relationship summary, and bounded quick interactions. Conversation-topic reading is explicitly state/RNG neutral.
- Existing dates, gifts, milestones, marriage, family planning, residential experiences, work links, and other mature relationship systems remain reachable through a secondary **Life & relationship actions** doorway rather than being duplicated or removed. Childhood redemption remains age-matched and friendship-appropriate, with normal dating/family gates preserved.

### Certification

- GitHub Actions Run #178 (`35025458317`, job `104571277415`) certified expanded source `7eb71a218a2f35cfe807df9d2caaf7b2a86ff9b2` from upload wrapper `ef2d29fea290d6d23b7e3ae310fada6e58a356eb`. Net source diff from synchronized baseline `73512a2666290c980ba6841528bf811cd45fe932` is exactly **9 intended source/test files**; workflow import reports 10 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. Secret-code / Hidden Threadroom regression **32/32**; Character Visual **60/60**; Family Visual Inheritance **27/27**; base **82/82**; People **57/57**; Threadspace recovery **10/10**; Family Reproduction **52/52**; Age-Aware Reproduction **22/22**; Family Topology **40/40**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Integrated Long-Life **105/105**; 10E **103/103**; New Life responsive **8/8**; minigames **19/19**; feedback regressions **20/20 + 23/23**.
- Production build passed at **215 modules**. People lazy surface ~**50.76/15.18 kB gzip**; lazy `characterArtPack` remains ~**971.11/69.18**; main ~**1,358.35/379.57**; CSS ~**87.92/16.19**. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `c91e04d2fa246a4af4421ea48fe32b7fea543c5d48160a8afa4fc0d7e78f6fe2`; dependency SHA-256 `d5a1c173c3bffb7ae194d1c7b0beaa07ebbdf086ee7a35d718cacde7ead62fa6`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10418778648` (`d3179b417effdcf6d57f13651b94fd4445d40d2c749ad86d17e18a2e9e49c0e9`); Pages artifact `10419241565` (`e1d8ece084efb23bd17f8bdf3935c4e3da2d2ed864bd9758126ad086c1198a3b`); Pages deployment reported success.
- Post-certification Feedback Inbox refresh was attempted three times, but the Supabase connector returned upstream HTTP 502 errors even for a minimal connectivity query. Therefore no fresh inbox claim or review-state advancement is recorded for Run #178. The last verified durable feedback checkpoint remains Run #176 (`f01d1847ba943b285c61d2fb787298ecb76d08ff`), **5 total / 0 unresolved**, pending the next successful inbox sweep.
- This is a narrow post-closeout Character Visual/People interaction slice, **not Phase 11** and not a reopening of the Living World Program. Richer aging/presentation remains the next planned Character Visual slice after documentation synchronization and a successful feedback refresh.

## Family resemblance + visual inheritance — CI Green Run #176 — 2026-09-15

### Added / changed

- Added deterministic biological family resemblance over the already-certified Character Visual/NPC identity authority. Optional `Npc.appearanceParentIds` records only biological visual contributors at new child creation; existing `parentIds` / `childIds` and Family Topology remain the sole family/legal authority. Adoption deliberately receives no biological visual provenance, and old schema-17 saves do not fabricate it from ambiguous historical links.
- `NpcVisualSystem` now derives nine heritable structural/color traits from available biological visual contributors: face, eye, brow, nose, mouth, ear, skin palette, hair-color palette, and iris palette. Hairstyle, body, clothing, facial hair, details, eyewear, accessories, and expression remain individual presentation.
- Siblings share a deterministic family anchor while child-specific variation prevents cloned portraits. One-known-parent cases blend that contributor with the child's independent deterministic base. Multi-generation resemblance propagates through each generation's actual visual identity; there is no direct grandparent lookup, allele ledger, genetics database, gameplay-RNG consumption, or runtime-ID allocation.
- Background descendants remain portrait-lazy. Visual provenance can persist without forcing `Npc.appearance`; once a portrait materializes, it becomes permanent, so later parent styling/customization cannot retroactively alter the child's established face.
- Player biological births and autonomous NPC biological births record visual provenance at their owning creation paths. Autonomous adoption explicitly does not. Save schema remains **17**.
- Added dedicated Family Visual Inheritance regression coverage for deterministic/idempotent projection, sibling resemblance without cloning, one/two-parent inheritance, adoption isolation, lazy background storage, valid renderer component IDs, save stability, descendant continuation, and natural multi-generation feature propagation.

### Certification

- GitHub Actions Run #176 (`35021096077`, job `104556658034`) certified expanded source `f01d1847ba943b285c61d2fb787298ecb76d08ff` from upload wrapper `8e2ad27b7f37f759dcfbb20fd975334c8b93fdb1`. Net source diff from synchronized baseline `3c6b781fada2deb7894e98fc0f9baf25dfcec9e0` is exactly **8 intended source/test files**; workflow import reports 9 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. Family Visual Inheritance **27/27**; Character Visual **60/60**; base **82/82**; People **57/57**; Visual Identity **12/12**; Family Reproduction **52/52**; Age-Aware Reproduction **22/22**; Family Topology **40/40**; Rewind **16/16**; Dynasty **66/66**; AI **82/82**; Integrated Long-Life **105/105**; 10E **103/103**; New Life responsive **8/8**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **212 modules**. People ~**42.29/12.50 kB gzip**; lazy `characterArtPack` ~**971.11/69.18**; main ~**1,357.50/379.07**; CSS ~**87.92/16.19**. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `8ec0d5d05f48d28539a75e99582c84ebf171d04c0ec8d0c3080c171aeb1046b6`; dependency SHA-256 `40193bb92ce6e8f4a27ea713d5c2a6c2aa20499ccf455c118d9e2a564ee7abc9`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10417129753` (`836f6e4ba345c6c48d059e093ded8fbaf2d3ee78767bb3b32bf3308c496da2dd`); Pages artifact `10418125056` (`d5e2136e1c533e7ddac5d57e80bb1eca07f067468133b64f4e4c176835000e33`); Pages deployment reported success.
- Post-certification Feedback Inbox remains **5 total / 0 unresolved**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` now points to `f01d1847ba943b285c61d2fb787298ecb76d08ff` at `2026-09-15 20:42:29.766439+00`, reviewed count **5**.
- This is an approved post-closeout Character Visual feature slice, **not Phase 11** and not a reopening of the Living World Program. Richer aging/presentation remains the next planned Character Visual slice.

## Character Visual NPC identity + relationship reveal — CI Green Run #174 — 2026-09-15

### Added / changed

- Added the second certified **Everthread Character Visual** slice: deterministic NPC portrait identity and relationship-based silhouette/full-portrait reveal. NPC visual identity stays on the existing `Npc` record as optional `appearance`; current-protagonist portrait knowledge stays on the existing `Relationship` as optional `portraitRevealed`. No parallel avatar database, familiarity score, or portrait ledger was introduced.
- Added `NpcVisualSystem` as the deterministic projection/normalization owner over existing NPC + Relationship truth. Close family and established romantic relationships reveal immediately from relationship type; other exact NPCs can become known through existing familiarity evidence such as time known, relationship strength, learned preferences, and dating history. Once learned, portrait knowledge persists even if the relationship later deteriorates.
- Kept background-only NPCs visually lazy. Unrevealed acquaintances do not persist hidden appearance payloads, while revealed/relevant NPCs receive one stable modular identity derived from the game seed + NPC id without consuming gameplay RNG or runtime IDs. Runtime invariants normalize only newly revealed/missing identities; save-load repair can perform one full deterministic normalization.
- Integrated the same reveal state into People Threadspace nodes and the existing People profile sheet: unknown exact NPCs use silhouettes; known NPCs use the shared `CharacterPortrait` renderer and the same 624-component Astra art pack already certified for the protagonist.
- Preserved generational identity continuity. Descendant continuation now keeps the selected successor's existing NPC portrait when they become playable, and the deceased prior protagonist keeps their established portrait when converted into family-history NPC state. No face is regenerated merely because playability changes.
- Save schema remains **17**. The new fields are optional extensions of already-authoritative generic NPC/Relationship records; current-schema saves normalize deterministically and idempotently with no gameplay-RNG or runtime-ID consumption.
- Added Character Visual regression coverage for deterministic NPC generation, lazy background NPCs, projection purity, familiarity reveal/persistence, save round-trip, and descendant portrait continuity. Character Visual is now **60/60** and Dynasty Transition **66/66**.

### Certification

- GitHub Actions Run #174 (`35016561442`, job `104541388963`) certified expanded source `69117c363124615a35683d03cbc0ab7a06472c06` from upload wrapper `33ed012e757b4f76caf86602045519bab879da56`. Net diff from doc-synchronized baseline `fcc09814455ae9dabcc86a37ad7a6964dcb133e0` is exactly **11 intended source/test files**; the workflow import also removes the uploaded `everthread-source.zip` wrapper.
- Canonical preflight passed **4/4**: Engine TypeScript, Test TypeScript, complete regression wall, and production build. Connected suites remained Green, including base **82/82**, People/Threadspace **57/57**, Character Visual **60/60**, Visual Identity **12/12**, Player Profile/Inventory **63/63**, Rewind **16/16**, Dynasty **66/66**, AI **82/82**, Integrated Long-Life **105/105**, Phase 10E **103/103**, New Life responsive layout **8/8**, minigames **19/19**, and feedback **20/20 + 23/23**.
- Production build passed at **212 modules**. Lazy `characterArtPack` remains ~**971.11 / 69.18 kB gzip**; People ~**42.29 / 12.50**; main JS ~**1,355.82 / 378.21**; CSS ~**87.92 / 16.19**. The established >700 kB chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `480f726cb369600aca7e1b391ac2fe20cdae6e6ae8d6526ec35e8b773b3b0828`; dependency SHA-256 `5e3657ac306c699139c79de6d2107fbf3de60371e83fc69a33412b9b1cc3cab9`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10416325194` (`6d41bc18a628d0e0ce55de43612d4d4b6389d15e488226c914b82295e8154ff6`); Pages artifact `10415871928` (`b0ea1db2735c03925ba0c29845ac2272dfa3bdf6b6f58e98cda3e65e88281f95`); deployment succeeded.
- Post-Run-#174 Feedback Inbox remains **5 total / 0 unresolved**, with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` now points to `69117c363124615a35683d03cbc0ab7a06472c06` at `2026-09-15 19:59:39.246769+00`, reviewed count **5**.
- This remains an approved Character Visual slice outside the closed Living World Program; it does **not** create Phase 11. Run #176 now certifies family resemblance/inheritance; richer aging/presentation remains the next planned Character Visual slice, subject to player feedback and separate certification.

## New Life mobile-width overflow hotfix — CI Green Run #172 — 2026-09-15

### Fixed

- Fixed a player-reported New Life sheet overflow on narrow phones where the two-column identity rows could exceed the available viewport width and the sheet clipped the right edge. Root cause was CSS Grid intrinsic minimum sizing from form controls, not the sheet scroll container.
- Changed the affected two-column tracks to zero-minimum columns and allowed their child form controls/content to shrink within the assigned grid cells. The New Life identity copy also now stacks cleanly instead of forcing a wider row.
- Added `scripts/new-life-layout-regression.mjs` and registered it in the canonical `npm test` wall. The regression protects 360/390/412/430px mobile widths and enlarged text-scale conditions from horizontal overflow. No GameState, save, portrait, simulation, content, or schema authority changed. Save schema remains **17**.

### Certification

- GitHub Actions Run #172 (`35006276096`, job `104506709088`) certified expanded source `5cf52a39d79f0835c2d9682e21d40c9ace7498c1` from upload wrapper `a2ab156e54cc0a18e13354435a0d50ecb633eed1`. Net diff from synchronized baseline `704def1523d652ca9ca24660d86ff14565a88f60` is exactly **3 intended files**; workflow import reports 4 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. New Life responsive layout **8/8**; Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile/Inventory **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Integrated Long-Life **105/105**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **211 modules**. Lazy `characterArtPack` remains ~**971.11 kB / 69.18 kB gzip**; main JS ~**1,354.43 / 377.84 kB gzip**; CSS ~**87.30 / 16.11 kB gzip**. The established >700 kB chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `c33df60a9811907ae0dc8d4d58b1d8e6fd86aea7a7041d8f5e99db0d1b924d17`; dependency SHA-256 `3cb9249bb0e386b953e1561493692f23150e7be192108746b220da4824447783`; package-lock SHA-256 remains `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10410969204` (`9fc873a757e510e9883459eb13e3921343d096785064da4687272501c698868f`); Pages artifact `10411442227` (`7c8193b1e2ee60600efaa4293bd27af663fdbf0306f2f9ef22475d6658a009b8`); Pages deployment reported success.
- Post-Run-#172 Feedback Inbox sweep remains **5 total / 0 unresolved** with no report newer than `2026-09-15 06:47:52.761298+00`. Durable review checkpoint `main` was successfully advanced to `5cf52a39d79f0835c2d9682e21d40c9ace7498c1` at `2026-09-15 18:17:43.686626+00`, reviewed count **5**.
- This is a narrow post-Character-Visual hotfix, **not Phase 11** and not a reopening of the Living World Program.

## Character Visual foundation — player creator + portrait renderer — CI Green Run #170 — 2026-09-15

### Added / changed

- Added the first certified **Everthread Character Visual** slice using Astra's original modular manwha-inspired art kit. The New Life silhouette is now tappable and opens a mobile-first creator; **Back** discards unsaved edits, **Save appearance** commits the draft, and the resulting portrait returns to New Life and follows the same authoritative appearance into existing Avatar/Profile presentation.
- Added a deterministic `CharacterVisualSystem` over the existing character appearance authority rather than a second avatar/person database. Existing physical traits remain authoritative; richer optional visual IDs are normalized deterministically for current-schema saves without gameplay RNG or runtime-ID consumption. Save schema remains **17**.
- Preserved seeded-life compatibility by retaining the historical appearance RNG draw positions and deriving richer cosmetic detail from a separate cosmetic seed. Customizing or normalizing portrait data does not reshuffle downstream gameplay state.
- Integrated Astra's **624 modular SVG components** into a single lazy-loaded runtime art pack instead of hundreds of asset requests. The renderer supports the six supplied age stages and shared palette/component IDs while keeping artwork presentation-only.
- Added creator-local collapsible option sections across **Face / Hair / Style / Extras**. Collapsed sections show the current selection summary and do not persist into GameState/saves.
- Added dedicated Character Visual regression coverage for deterministic generation, custom-draft isolation, save normalization/idempotence, valid art IDs, renderer/catalog contracts, and preservation of existing character state. No NPC reveal/family-resemblance authority is introduced in this slice.

### Certification

- GitHub Actions Run #170 (`35001748216`, job `104491526661`) certified expanded source `ef87fb8011b8ec9d6dc606c328db9b1c0882d942` from upload wrapper `a620ac8b0a97458d05e66e11ac578163fb231dd1`. Net source diff from synchronized baseline `2e94523a451454b94cbbee49179f0efbb62b0900` is exactly **15 intended source/test files**; workflow import reports 16 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. Character Visual **46/46**; base **82/82**; Visual Identity **12/12**; Player Profile/Inventory **63/63**; Rewind **16/16**; Dynasty **64/64**; AI **82/82**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; 10E **103/103**; UI iconography/theme **183/183**; Action VFX **58/58**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed at **211 modules**. Lazy `characterArtPack` is ~**971.11 kB / 69.18 kB gzip**; main JS ~**1,354.43 / 377.85 kB gzip**; CSS ~**86.96 / 16.06 kB gzip**. The established >700 kB chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `072c290101bd8853dca4e3e16a6af7e8d9cdc4ecadb332747db4e66f0fe4be7f`; dependency SHA-256 `7890670ea96fa0ba70b95d7fd86ab72fcd2f96fece67cf48efa0d4512b30042b`; package-lock SHA-256 remains `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact `10409358703` (`cc14a60e8b90a825060b7176c623f1e7b805f2330e17b307157ee64ac6cf48c8`); Pages artifact `10408949701` (`4490a5915f52b189ce46e0f3bff5c1de42c1eb7931cd317555ccba55a0bb834e`); Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep remains **5 total / 0 unresolved**, with no report newer than `2026-09-15 06:47:52.761298+00`. The durable review-state checkpoint could not be advanced in this session because the database connector rejected the write, so the existing stored checkpoint must not be mistaken for an unseen-report condition.
- This is an approved post-closeout Character Visual feature slice, **not Phase 11** and not a reopening of the Living World Program.

## Post-Phase-10 UI iconography + theme reactivity polish — CI Green Run #168 — 2026-09-15

### Added / changed

- Integrated the Mavyy-approved Astra UI-kit icon language as a **presentation-only** layer over Everthread's existing authorities. Canonical town-place IDs now resolve to the new Everthread pictograms; primary/contextual navigation and selected shared controls use the same local vector library without changing routing, eligibility, discovery, or simulation ownership.
- Fixed the player-facing Appearance reactivity defect identified during the Astra audit. Everthread intentionally permits in-place `GameState.settings` mutation, so the root visual-sync effect now depends on a deterministic scalar visual-settings signature instead of the settings-object identity. Theme/accent/font/text-scale/text-color/high-contrast/reduced-motion changes therefore invalidate presentation correctly without changing GameState architecture or save semantics.
- Extended the established Action VFX projection rather than creating a second effect authority. Existing action snapshots can now derive bounded semantic feedback for money, health, knowledge, stress, relationship, year-advance, gift, milestone, and known blocked-state cues while preserving existing career-specific VFX and engine result semantics.
- Added shared `EverthreadIcon` / icon-path presentation helpers plus dedicated UI iconography regression coverage. No new GameState field, route table, effect bus, content definition, gameplay RNG consumer, package dependency, workflow, or save migration was introduced.
- Save schema remains **17** and authored gameplay/content counts remain **691 events / 25 town places / 29 routed institution services / 24 personal inventory items / 38 NPC preference tags**.

### Certification

- GitHub Actions Run #168 (`34973140255`, job `104394090082`) certified expanded source `f68ffacf47c1fd208f836666fca3b1010a517c85` from upload wrapper `3cf72e36ed002880391e1a683cb846171e364423`. Net source diff from synchronized baseline `5e4f226341a5d28f1c70e67bf5dc72ece358a44f` is exactly **25 intended presentation/integration/test files**; workflow import reports 26 changed files only because it removes `everthread-source.zip`.
- Canonical preflight passed **4/4**. UI iconography & theme reactivity **183/183**; Action VFX **58/58**; base **82/82**; Visual Identity **12/12**; People **57/57**; AI **82/82**; Integrated Long-Life **105/105**; Town Map **46/46**; Routing **42/42**; Phase 8E **34/34**; Phase 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E UX **20/20**; 10E **103/103**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build passed with Vite 7.3.6 at **206 modules**. Town Map is ~9.77 kB / 3.59 kB gzip JS plus ~12.64 kB / 2.65 kB gzip CSS; People ~41.18 / 12.12; Player Profile ~10.29 / 2.98; main ~1,277.82 / 362.39. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `a76e2eb38cb9aa10f67ce8a0f5f5948fe94fc64d638edabeca8e9059a6387ae5`; dependency SHA-256 `b61b136d41557e6422fdb85983fadd6c93fa97dcc6b395df7f620a52bb4352f9`; package-lock SHA-256 remains `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact ID `10398407272`, digest `2683be9ae642bb99d04ff0a7f7e767b6ea3389557eab1cd5e603b898787a0a6e`; Pages artifact ID `10397848707`, digest `5fb24e99f02db634a292aab8a2018b0fcd337ce1f2342aa98f4a68baa546331f`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep remains **5 total / 0 unresolved**. Review checkpoint `main` now points to `f68ffacf47c1fd208f836666fca3b1010a517c85` at `2026-09-15 13:10:53.355932+00` with reviewed-report count 5.
- This is a **post-closeout player-facing polish slice**, not Phase 11 and not a reopening of the certified Living World Program.

## Phase 10E — Program Closeout + final Map-memory feedback polish — CI Green Runs #165–#166 — 2026-09-15

### Added / changed

- **Run #165** certified Phase 10E as an integration-only closeout: one dedicated regression plus runner registration, with no production gameplay authority or save-schema change. The closeout proves the Living Everthread stack across multi-generation continuation, save/import/migration/rewind, estate/accounting integrity, Map ↔ Threadspace ↔ Player Profile identity/navigation, action-access parity, 360/390/412/430px map behavior, deterministic read-only projections, and bounded stress.
- Phase 10E's certified closeout suite initially passed **91/91**. It exercises two sequential descendant handoffs, inherited home/company provenance, archived place memory, temporary external travel without residence displacement, 180-person Threadspace pressure, 60 properties, 60 businesses, and 240 candidate place milestones while preserving existing owners.
- The post-Run-#165 Feedback Inbox sweep found new report `ET-20260915-86A6BA86`, requesting that a Map place expose meaningful life events that occurred there. Mavyy approved the request before final documentation closeout.
- **Run #166** certifies the resulting narrow Map-memory polish. Existing place sheets now expose a bounded **Memories here** section sourced from the already-authoritative Generational Place Memory projection, including remembered event text and current/prior-generation age/year context when available. Routine importance-1 entries remain excluded; inherited family-home/business landmark meaning remains **Family legacy** rather than being misrepresented as a timeline event; hidden-place discovery remains authoritative.
- The Map remains presentation/projection only. Browsing these memories is read-only, deterministic, gameplay-RNG neutral, runtime-ID neutral, save-neutral, rewind-safe, and bounded. No second timeline, memory ledger, place-history authority, or durable Map state was introduced.
- Save schema remains **17**. Authored content counts remain **691 events / 25 town places / 29 routed institution services / 24 personal inventory items / 38 NPC preference tags**.

### Certification

- GitHub Actions Run #165 (`34939954283`) certified expanded source `241276179e91df50796403376143b9404bf13ec4` from upload wrapper `2c8dd8c39e8b8266f954d6549f9ebc61a28ac806`. Net gameplay diff from synchronized source `f93ac870c2c7c9caafd510494c9c1696e749aa53` is exactly **2 files**: one added Phase 10E regression plus its runner registration. Canonical preflight passed **4/4**, Phase 10E **91/91**, Integrated Long-Life **105/105**, and the complete regression wall/build/deploy remained Green.
- Run #165 certified source SHA-256 `8917234a26f41dc9dfa52904969f5679d1509a41da1719847e38534d39ed3f16`; dependency SHA-256 `bc52cfc870ee9ef0071a694a9a69434eb8bec7285c3c4f7a9b4ebd1817c89913`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified preflight artifact ID `10384976427`, digest `dc7dd3a017a686fd8c38cb4a90c7dc8c578a19ce6be7071459ee373458cefc76`; Pages artifact ID `10385350315`, digest `3ec537abb04e6770b9803e231d8a5bda93ff38bcc4de01208f84482606454cbe`.
- GitHub Actions Run #166 (`34941015941`) certified final Phase-10 gameplay source `7523f6919ad808f7d826c42cd471d61e1f4f4678` from upload wrapper `97b06be342eecfcd2d0fd23cfb0f3cd6d2baa061`. Net diff from Run #165 is exactly **5 intended Map/projection/test files**; workflow import reports 6 changed files only because it removes `everthread-source.zip`. No package, lockfile, workflow, content registry, asset, documentation, GameState schema, or save-version drift is part of the gameplay diff.
- Run #166 canonical preflight passed **4/4**; Phase 10E **103/103**; base **82/82**; People **57/57**; AI **82/82**; Estate Administration **63/63**; Rewind **16/16**; NPC Asset Ownership **82/82**; Family Topology **40/40**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 8B **46/46**; Routing **42/42**; Phase 8E **34/34**; Phase 9G **41/41**; 10A **69/69**; 10B **50/50**; 10C **50/50**; 10D **50/50**; pre-10E UX **20/20**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Run #166 production build passed with Vite 7.3.6 at **203 modules**. Town Map is ~9.58 kB / 3.52 kB gzip JS plus ~12.25 kB / 2.59 kB gzip CSS; Player Profile ~10.29 / 2.98; People ~41.15 / 12.11; main ~1,270.14 / 358.72. The established >700 kB warning remains nonblocking technical debt.
- Run #166 certified source SHA-256 `881e1167d5fa0234f90a454ac3568d4c596c7e738f35b36c7850646d73e277b8`; dependency SHA-256 `34c67ece879908cb137cb8ef569cabe06010ff6a7a2afb3acf485a8ce971e4df`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`. Certified preflight artifact ID `10385013113`, digest `b417362907b8b8534ebb89f62e08dd0e07ccbcc947cace8c28486a05bee92a3a`; Pages artifact ID `10384973333`, digest `caca1bcdf7f4ade6940a27e61b4577432308cacc826d584c0a09a86bfe5f7e3b`; Pages deployment reported success.
- The final post-certification Feedback Inbox sweep is **5 total / 0 unresolved**. `ET-20260915-86A6BA86` is resolved as a deployed suggestion against Run #166, and review checkpoint `main` now points to `7523f6919ad808f7d826c42cd471d61e1f4f4678` at `2026-09-15 07:20:42.854732+00` with reviewed-report count 5.
- **Phase 10E is CLOSED / CERTIFIED. Phase 10 — Living Everthread is CLOSED / CERTIFIED. No Phase 11 or replacement macro phase is implied by this closeout; the next major direction remains Mavyy's creative decision.**

## Pre-Phase 10E player-tested corrections — CI Green Runs #162–#163 — 2026-09-15

### Added / changed

- **Run #162** certified the player-reported mobile/map UX correction before 10E: shared location sheets now keep their header/close control fixed while the body owns native vertical touch scrolling above the bottom navigation; the permanent bottom shell is trimmed to **Life / People / Map**, with **Activities / Career / Assets** appearing only as the single contextual fourth destination when entered from a routed Map place.
- Added **Threadtone Music Studio** in Eastworks as the authored physical doorway into the existing Music special-career authority. No music progression/state was duplicated; institution routing now resolves the studio into the established Music path. This raises the authored town registry **24 → 25 places** and routed institution services **28 → 29**.
- **Run #163** certified the deeper world-rule correction exposed by Airport playtesting: **Everthread is the only permanent player residence**. Vacation and family-trip destinations remain temporary travel/history and do not rewrite canonical residence or household location.
- The old engine-level emigration action is retained only as a compatibility guard and now fails without state mutation. Current-schema legacy saves that already contain an emigrated protagonist are deterministically, idempotently, RNG/runtime-ID-neutrally normalized back to Everthread while preserving historical travel, naming/cultural provenance, assets, companies, timeline, and other durable biography.
- Airport/Activities copy now presents **Travel**, not emigration. Everthread itself is not offered as a fake travel destination. Direct player-side validation after Run #163 confirmed the corrected Airport flow behaves as intended.
- Achievement/content wording that depended on emigration was reconciled without changing achievement count. Save schema remains **17**; no parallel residence/travel authority was introduced.

### Certification

- GitHub Actions Run #162 (`34936352466`) certified expanded source `5834f9fc6de6327797c969542eb3fdcd07b4e13b` from upload wrapper `3c117cd69a4af99557e8c40e12a80b58ecb9737b`. Canonical preflight passed **4/4**; Pre-Phase 10E player-UX regression **11/11**; Music **76/76**; Town Map **46/46**; Institution Routing **42/42**; Phase 8E **34/34**; AI **82/82**; Integrated Long-Life **105/105**; Phase 10D **50/50**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**. Production build passed at **203 modules** and Pages deployment succeeded.
- Run #162 certified source SHA-256 `d130b6e0489e40a1c0ae135ddcb41ac9465fb4983a0b077055404aabeaed25ea`; dependency SHA-256 `058789598c5310b7c1083102a09cdcf12ff82a74be50992fc62f41d045d4104d`; certified preflight artifact ID `10383940053`, digest `8ad74cb551785f78d344722257e5ad1a44048f4e74072fa614003f620f0c3529`; Pages artifact ID `10383481967`, digest `2782fa42049bbe65a46865c0d83e429cac7437fce4f5d9abdefe284bc9902e2e`.
- GitHub Actions Run #163 (`34937808322`) certified expanded source `ab40d66808e0950f041a72681d573401926de8c0` from upload wrapper `6dab74794cf7f0af3cc7ebcdb12a0a95693eba5e`. Net diff from prior certified gameplay `5834f9fc6de6327797c969542eb3fdcd07b4e13b` is exactly **18 intended source/test files**; workflow import reports 19 changed files only because it removes `everthread-source.zip`. No documentation, package, lockfile, workflow, asset, or save-schema drift is part of the gameplay diff.
- Run #163 canonical preflight passed **4/4**; Pre-Phase 10E player-UX regression **20/20**; base **82/82**; Music **76/76**; AI **82/82**; Integrated Long-Life **105/105**; Phase 7C **42/42**; Phase 8A **25/25**; Town Map **46/46**; Institution Routing **42/42**; Phase 8E **34/34**; Phase 9B **53/53**; Phase 10B **50/50**; Phase 10D **50/50**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**. Production build passed with Vite 7.3.6 at **203 modules**; Pages deployment succeeded.
- Run #163 certified source SHA-256 `f8d7d6b59f13ec032d3fde5e031bb38ca3bf1947990e4e30a23bd16775b3257f`; dependency SHA-256 `4572bc66299fc92c2f067fe443fabd0c61c80d67b288be2ba103212e34393eeb`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`; certified preflight artifact ID `10384556377`, digest `ff9ed03979076ea931b174c5383adde3c2e1ca1e76ba863c4b143beb6705bb88`; Pages artifact ID `10384640209`, digest `3a9a6e2d6e067a6d8a1db56ca2a644762a7311066d776cea148ccfcf53dcff8f`.
- Fresh post-Run-#163 Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the review checkpoint to `ab40d66808e0950f041a72681d573401926de8c0` at `2026-09-15 06:46:01.03675+00` with reviewed-report count 4.
- **The pre-10E correction gate is CLOSED / CERTIFIED and player-validated. Its historical next slice was Phase 10E — Program Closeout, now certified/closed in Runs #165–#166.**

## Phase 10D — Living Map Projection — CI Green Run #160 — 2026-09-15

### Added / changed

- Added one read-only **Living Map** projection that composes existing Residential Life, Working Everthread, Generational Place Memory, owned-property, and child-education truth onto the established 24-place Everthread Map. It creates no second residence, workplace, school, business, property, family-memory, or map-state authority.
- Exact authoritative anchors remain exact place context: **You live here**, **Property owned**, **Current school**, **You work here**, **Your company**, **Your child attends here**, and **Family legacy / Life memory**. Work/company context that is only known to district precision remains a district context instead of inventing a building.
- Context merging is deterministic and bounded to **6 contexts per place/district target** and **32 total contexts**. Repeated contexts aggregate source IDs/counts instead of spawning duplicate markers. External/emigrated work, school, companies, children, and places receive no synthetic Everthread pin.
- The existing map remains the only marker/navigation surface. Exact-place context adds a subtle marker treatment/count and a **Your life here** section to the existing place sheet; district-only context uses lightweight noninteractive labels. The Explore panel adds **Your life on the map**, an ephemeral local UI toggle that is never written to `GameState` or saves.
- Existing Town Map pan/zoom/search/category filtering, viewport culling, place discovery, routing, lazy loading, and mobile controls remain intact. Blackline Freight Yard discovery still derives from existing legal/organized-crime truth; 10D does not reveal hidden places by virtue of having life context.
- Save schema remains **17**. Projection/browsing is read-only, gameplay-RNG neutral, runtime-ID neutral, rewind-neutral, and descendant-safe because it reads the already-authoritative state of the current protagonist/thread.
- Fresh certified-source content audit remains unchanged at **691 events**, **306 career positions across 51 six-step ladders**, **51 education programs**, **24 town places**, **28 routed institution services**, **24 personal inventory items**, **38 NPC preference tags**, **20 business industries / 80 products**, and **40 collectibles**.

### Certification

- GitHub Actions Run #160 (`34933437352`) certified expanded source `8ce87ad1e812ed94a9918684b3b52452826f0ce9` from upload wrapper `321c92ce7ff4cb3ef96df7e10f523a6c5496b795`. Net diff from synchronized repository baseline `8cbc3e209aa2f8982289d0649f2686cd936cf045` is exactly **7 intended Phase 10D source/test/UI files** (**3 added, 4 modified**); workflow import reports 8 changed files only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the gameplay diff.
- Canonical preflight PASS **4/4**; Phase 10D **50/50**; base **82/82**; People **57/57**; AI Interaction Testbench **82/82**; Town Map **46/46**; Institution Routing **41/41**; Phase 8E **34/34**; Phase 10A **69/69**; Phase 10B **50/50**; Phase 10C **50/50**; Rewind **16/16**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 9A–9G remained Green; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build PASS with Vite 7.3.6 at **203 modules**. Town Map is ~8.92 kB / 3.32 kB gzip JS plus ~11.25 kB / 2.46 kB gzip CSS; People ~41.15 kB / 12.11 kB gzip; Player Profile ~10.29 kB / 2.97 kB gzip; main JS ~1,270.49 kB / 358.71 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `d9ffad5a5b7edbdd898a7726eb3c4616b706eddecd0ecc6bc69820aa2073686d`; dependency SHA-256 `d9509533484e7c6a7cf2f824fbbd69bbe0c320d9b9c131b4df4f6bc6251444bd`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10382985407`, digest `35d4493836c5befd621f31117b8fbae225bb5d7abe65879455c55ef7f20b1fac`; Pages artifact ID `10382109382`, digest `9d8e8a62cda11a198b43442eda4d53b54f0deff87e2cc8b41b2237e156c655bb`; Pages deployment reported success.
- Pre-upload local canonical-wrapper completion was constrained by the development container's outer execution ceiling and therefore was not treated as certification. The connected 10D risk wall, typechecks, content audit, overlay verification, and production build were independently Green; canonical GitHub Run #160 is the final certification authority.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `8ce87ad1e812ed94a9918684b3b52452826f0ce9` at `2026-09-15 05:38:31.538933+00` with reviewed-report count 4.
- **Phase 10D is CLOSED / CERTIFIED. Its historical next slice was Phase 10E — Program Closeout, now certified/closed in Runs #165–#166.**

## Phase 10C — Generational Place Memory — CI Green Run #158 — 2026-09-15

### Added / changed

- Added one read-only **Generational Place Memory** projection over existing Timeline, CompletedLife, Property, Business, Estate/Dynasty, Working Everthread, and Town Place truth. It creates no second place-history, family-landmark, property, business, event, or memory authority.
- `TimelineEntry` may now carry an optional canonical Everthread `placeId` for meaningful importance-2/3 milestones. Significant relationship outings, property/business ownership transitions, school/work exits, inheritance release/continuation, and other already-authoritative milestones can preserve where they happened without logging routine visits.
- Completed lives keep an optional bounded `placeMilestones` snapshot derived from their authoritative timeline at death. Old schema-17 lives without the snapshot derive it read-only from their existing timeline; present-but-invalid snapshots sanitize to empty instead of fabricating fallback history. Save schema remains **17**.
- Existing property provenance remains the family-home authority. Existing Business records now own optional founded/inherited provenance plus the exact predecessor ID; inherited companies retain their Working Everthread physical base across NPC/player estate conversion. No shadow family-business ledger exists.
- The projection prioritizes surviving inherited family homes/businesses, then current-life and prior-generation milestones. It is bounded to **24 total memories**, **8 places**, **6 memories per place**, **12 place milestones per completed life**, and the most recent **12 completed lives**. Browsing is deterministic, RNG/runtime-ID neutral, and read-only.
- Player Profile now surfaces a compact **Places that remember your thread** projection. Assets identifies inherited surviving companies as family businesses. Phase 10D still owns Map highlighting/pins; 10C deliberately does not turn the map into a second state owner.
- Fresh certified-source content audit remains **691 events**, **306 career positions across 51 six-step ladders**, **51 education programs**, **24 town places**, **28 routed institution services**, **24 personal inventory items**, **38 NPC preference tags**, **20 business industries / 80 products**, and **40 collectibles**.

### Certification

- GitHub Actions Run #158 (`34931959983`) certified expanded source `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790` from upload wrapper `9c4626ce19b4197609019bbcfde15b1ad2bbb8f0`. Net diff from synchronized repository baseline `0cd6ecfef5ded8256c22d7246f852b1c15728c68` is exactly **19 intended Phase 10C source/test/UI files** (**3 added, 16 modified**); workflow import reports 20 files only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, authored-content-count, or save-schema drift is part of the gameplay diff.
- Canonical preflight PASS **4/4**; Phase 10C **50/50**; base **82/82**; People **57/57**; AI Interaction Testbench **82/82**; Phase 10A **69/69**; Phase 10B **50/50**; Rewind **16/16**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 9A–9G remained Green; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build PASS with Vite 7.3.6 at **202 modules**. People remains ~41.15 kB / 12.10 kB gzip; Player Profile is ~10.29 kB / 2.97 kB gzip; Town Map remains ~6.97 kB / 2.82 kB gzip; main JS is ~1,265.72 kB / 357.31 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `566b8e47ce302afc45653dc7c9efd6ad677957761f433a35373cbdec97708cad`; dependency SHA-256 `9dca2d20b81675b5e3f4de775a4f70869edbd527b9d93c5fe7891b17b93bbeb6`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10381209515`, digest `ddec7d0513401516b45c956218404d9d690f1558f63e087b631b8f1e66bb76ae`; Pages artifact ID `10380859910`, digest `e21ed363a9c293e0574a02cf73b668ab128f467a690711e38ab3e7e374a0990d`; Pages deployment reported success.
- Pre-upload local canonical/deep wrappers were constrained by the development container's outer execution ceilings, so they were **not** treated as certification. Constituent typecheck/regression/build gates were independently Green and a matched baseline-vs-candidate 10-life control showed no performance regression; GitHub canonical Run #158 is the authoritative certification.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `7efd45e1320a86fd84fa7dbd59e7c8f1cea9d790` at `2026-09-15 05:17:22.77373+00` with reviewed-report count 4.
- **Phase 10C is CLOSED / CERTIFIED. Exact next slice after this mandatory documentation sync certifies: Phase 10D — Living Map Projection.**

## Phase 10B — Working Everthread — CI Green Run #156 — 2026-09-14

### Added / changed

- Added one **Working Everthread** projection layer over existing SchoolWorld, Workplace/SocialWorld, Business, Town Place, and character/NPC location truth. It creates no second workplace, school, employment, business, institution, revenue, bankruptcy, or relationship authority.
- Current school institutions project to the existing Everthread School / Everthread College anchors when the authoritative active school world is local. Active full-time and part-time workplace worlds project deterministically into existing town districts and, where a real landmark exists, an existing place anchor; external school/work worlds remain external and receive no fictional Everthread district.
- Player-founded businesses now preserve their physical base on the authoritative `Business` record with optional `countryId` / `city` provenance. NPC business holdings preserve the same provenance across estate conversion, so a company does not teleport when the player relocates or when ownership crosses generations.
- Added deterministic business/work district rules using the existing six-district / 24-place town registry. Market-facing work maps to Market Row, civic/finance/medical work to Central Weave, education/community work to Campus Green, transport/logistics work to South Belt, and remaining technology/industrial work to Eastworks; exact existing landmarks are reused where appropriate.
- Legacy player businesses missing location repair to the current protagonist location; legacy NPC businesses repair from the owning NPC. Repairs are deterministic, idempotent, RNG-neutral, and runtime-ID neutral.
- Career now shows projected current campus/workplace location context; Assets shows each company base. AI semantic observations expose the same production projections. Browsing/projection is read-only and does not consume gameplay RNG, runtime IDs, actions, or mutate certified 10A residence meaning.
- Save schema remains **17**. A fresh local content audit after certification still reports **691 events, 24 town places, 28 routed institution services, 24 personal inventory items, and 38 NPC preference tags**; Phase 10B adds mapping/projection rules rather than inflating authored content counts.

### Certification

- GitHub Actions Run #156 (`34927243187`) certified expanded source `a497aa1bbec357fe12755383acb7053ab5d0ea67` from upload wrapper `20b8359cb5bc306fbcb457a737027c56fb76fcc2`. Net diff from the prior synchronized repository source `2f29dfb7aaa17efdb35325383ed8d4fb4d84f390` is exactly **14 intended Phase 10B source/test/UI files** (4 added, 10 modified); workflow import reports 15 changed files only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 10B Working Everthread **50/50**; base **82/82**; People **57/57**; AI Interaction Testbench **78/78**; Phase 10A Residential Life **69/69**; Relationship Microcopy **69/69**; NPC Asset Ownership **82/82**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 9A–9G remained Green; minigames **19/19**; feedback **20/20 + 23/23**.
- Production build PASS with Vite 7.3.6 at **201 modules**. People remains lazy/code-split at ~41.15 kB JS / 12.10 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; Town Map ~6.97 kB / 2.82 kB gzip; main JS ~1,259.21 kB / 355.87 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `eb3fb05357822c18bc52585de60c4dc6838eed1ff51e9f857adf3c883897d83a`; dependency SHA-256 `46ecae009f310c130b64ad1efa141d9755bdd793ff3682f0b61cba8daa186394`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10380297168`, digest `4dfc38542f7510b4d5dbddd33e11aadfdeec97ed32e4326ee9a09561f0daaa17`; Pages artifact ID `10380680116`, digest `8acb6ef7976cd0078f5ff5e2e26f186e5e26352399c6b82fd0e5aaa20021acd0`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `a497aa1bbec357fe12755383acb7053ab5d0ea67` at `2026-09-15 04:33:34.506272+00` with reviewed-report count 4.
- **Phase 10B is CLOSED / CERTIFIED. Exact next slice after this mandatory documentation sync certifies: Phase 10C — Generational Place Memory.**

## Phase 10A — Residential Life — CI Green Run #154 — 2026-09-14

### Added / changed

- Added one **Residential Life** projection/action layer over existing Property, NPC household/life, relationship, and location truth. No second property ledger, household graph, residence state, housing balance, or relationship outcome engine was introduced.
- Existing `PropertyAsset` / `NpcPropertyHolding` records now carry only metadata those property authorities legitimately own: optional primary-home designation plus purchase/inheritance provenance. Player/NPC residence and household meaning is projected read-only from those records and existing character/NPC city, family, partner, incarceration, and financial-independence truth.
- Added **5 residential plans**: Visit their home, Invite them home, Visit family at home, Cook together at home, and youth-bounded Sleepover. They reuse established Phase 9 shared-experience activities, preference evaluation, action economy, relationship/opinion/memory consequences, and Threadwell Residential place identity.
- Assets can mark an exact eligible owned property as **Home**; Player Profile projects the current residence; People projects the selected NPC's actual household/residence and residential visit choices. Player and AI semantic surfaces execute the same `GameEngine` actions.
- Inherited property retains exact provenance across NPC↔player estate conversion so family homes remain recognizable landmarks. A successor's existing home outranks newly inherited property; sale/foreclosure removes the property normally, rental clears its home role, and relocation clears remote NPC home designation without rewriting ownership/debt truth.
- Minor protagonists may own/inherit property but cannot designate or project an independent owned home; stale minor primary-home markers are repaired deterministically while ownership/provenance remains intact. Current player partners/fiancés/spouses without their own residence project the player's exact home as their shared household.
- Save schema remains **17**. Pre-upload local canonical standard preflight passed **4/4** and deep preflight passed **6/6**, including unchanged content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**.

### Certification

- GitHub Actions Run #154 (`34922633493`) certified expanded source `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` from upload wrapper `d04c958ed9085f22ba8f86878a1423cc93b7756d`. Net diff from the prior certified repository source is exactly **19 intended Phase 10A source/test/UI files** (4 added, 15 modified); workflow import reports 20 changed files only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 10A **69/69**; base **82/82**; People **57/57**; AI Interaction Testbench **72/72**; Relationship Microcopy **69/69**; Phase 9A **45/45**; 9B **53/53**; 9C **40/40**; 9D **61/61**; 9E **60/60**; 9F **43/43**; 9G **41/41**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **199 modules**. People remains lazy/code-split at ~41.15 kB JS / 12.11 kB gzip; Player Profile ~9.34 kB / 2.73 kB gzip; main JS ~1,253.59 kB / 354.16 kB gzip. The established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `f5abf0879e5ad26013d5ce17fcceb70c07e6164ccf48d669ea7b3b4875250195`; dependency SHA-256 `6c6850bea55be7fa4649a6958f625515f02afa36f74ebe7dbfb514ad7f3279bb`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10377789622`, digest `2cc22e7d8105ee8e8bb4ad319dd438df0e50c600dd81d3c54d82482e851c1448`; Pages artifact ID `10378158427`, digest `6cdde002c03756e59505fba58cea16b33710ba3af99df5e0e4d04d0b865b3263`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `b4ef6f74f6d957a3109beb6b269ae86b37a7d351` at `2026-09-15 02:51:23.125961+00` with reviewed-report count 4.
- **Phase 10A is CLOSED / CERTIFIED. Exact next slice after this mandatory documentation sync certifies: Phase 10B — Working Everthread.**

## Phase 9G — Shared Lives Closeout — CI Green Run #152 — 2026-09-14

### Added / changed

- Added the dedicated **Phase 9G Shared Lives closeout regression** at **41/41** and wired it into the canonical regression runner. The closeout is deliberately test-only: no production gameplay, UI, state schema, content catalog, package, workflow, or asset source changed.
- The integrated path drives one exact NPC through preference discovery, an ordinary shared experience, an exact owned-item gift, cross-world chemistry, real dating momentum, and the real Become Partners milestone while a decoy NPC verifies exact-target isolation.
- Closeout coverage proves save/load semantic preservation and normalized idempotence, deterministic cloned replay, rewind recovery, descendant-continuation boundaries, stale/dead target safety, same-year social action-budget contention, duplicate gift-instance handling, bounded memories/history, AI/player authority parity, and long-horizon compatibility across the complete Phase 9 stack.
- Pre-upload local **deep preflight passed 6/6**, including the unchanged content audit and a 1,000-life simulation with **0 anomalies / 0 forced terminal deaths**. Aggregate remained healthy at 79.3 average lifespan / 82 median, 63.0% married, 0.31 children per life, 77.3% millionaires, and bounded NPC population (125 average peak / 629 maximum).
- Save schema remains **17**. Phase 9G introduced no new simulation authority and no new durable state.

### Certification

- GitHub Actions Run #152 (`34916904879`) certified expanded source `14defab1761b1597bae584f9e0acc5d8bfe11483` from upload wrapper `025e321a64191077941d0909c995362c8222eda8`. Net diff from the prior certified repository source is exactly **2 intended test files** (1 added, 1 modified); workflow import reports 3 changed files only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9G **41/41**; base **82/82**; People **57/57**; AI Interaction Testbench **64/64**; Relationship Microcopy **69/69**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Phase 9E **60/60**; Phase 9F **43/43**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **197 modules**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS is ~1,240.49 kB / 350.95 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `34f7dad87faae68d011b1dfba584dba2ca9aea799fa3e191e4790d325a179752`; dependency SHA-256 `d031866fb287b9d2065156f7dea85d0a21f5105f06b76f3941ce600c14d59518`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10376107622`, digest `9828561e3171a15946581e721094278eb5410977598fadb99233049d9a2ce6d5`; Pages artifact ID `10376302016`, digest `9d02b2339c44003f26f7d5032a913bf120455c783983730b7fe0c560a3355031`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `14defab1761b1597bae584f9e0acc5d8bfe11483` at `2026-09-15 01:23:20.426476+00` with reviewed-report count 4.
- **Phase 9G is CLOSED / CERTIFIED. Phase 9 — Shared Lives is CLOSED. Exact next slice after this mandatory documentation sync certifies: Phase 10A — Residential Life.**

## Phase 9F — Cross-World Chemistry — CI Green Run #150 — 2026-09-14

### Added / changed

- Added one read-only `CrossWorldChemistrySystem` that projects contextual shared experiences from existing school, family/friend, workplace, and special-career memberships without creating a second relationship graph, chemistry score, affiliation ledger, or durable outing history.
- Added **22 contextual plans across 13 context families**. The exact active world the selected NPC genuinely shares with the player determines available plans; promoted classmates/coworkers retain context through their authoritative rosters, while professional rivals/opposition are excluded from friendly chemistry plans.
- Contextual outings commit through the existing Phase 9B shared-experience evaluator and `RelationshipSystem`, consume the same per-person social opportunity budget, reuse established places/activities/preferences, and write bounded exact-target NPC memories.
- School/work/career domain state is not directly mutated by 9F. Existing SchoolWorld, Workplace, and special-career owners continue deriving standing, morale/tension/performance, chemistry/support/cohesion, and related projections from the authoritative relationships they already own.
- People Threadspace and AI semantic interactions use the same production `crossWorldExperience` action. The AI music scenario proves the real relationship change is immediately visible to the existing career-world chemistry projection.
- Save schema remains **17**; no migration, package, workflow, asset, or content-catalog change was required.

### Certification

- GitHub Actions Run #150 (`34911249505`) certified expanded source `20b3026f577db86d821e82129b5c76fa09060413` from upload wrapper `40de88d080262ee062b58410def64a13c3eee0aa`. Net diff from the prior certified repository source is exactly **10 intended Phase 9F source/test/UI files**; workflow import reports 11 changes only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9F **43/43**; base **82/82**; People **57/57**; AI Interaction Testbench **64/64**; Relationship Microcopy **69/69**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Phase 9E **60/60**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; special-career world **77/77**; combat **51/51**; military **65/65**; politics **80/80**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **197 modules**. People remains lazy/code-split at ~39.51 kB JS / 11.90 kB gzip; main JS is ~1,240.49 kB / 350.95 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `4df9280b04a99dc30ad25363f235c69fc71f147bc2000099280582d9634ee68e`; dependency SHA-256 `03680451a3a9add1209e03c646df5de6d82e1fd44f83426fe715838c1ca2041e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10373864256`, digest `57aabc641c42c8f34d0dc445207e73754708e5bc838b9aca71b3975251684a7d`; Pages artifact ID `10373799331`, digest `a02716ee961aa25819cece73d3e4f86e1e75e72dfbe28c108058e6c6f734c75c`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `20b3026f577db86d821e82129b5c76fa09060413` at `2026-09-15 00:01:27.362759+00`.
- **Phase 9F is CLOSED / CERTIFIED. Next slice:** Phase 9G — Phase 9 Closeout.

## Phase 9E — Real Gifts — CI Green Run #148 — 2026-09-14

### Added / changed

- Replaced the old generic `$150` relationship Gift interaction with an **exact owned-item gift flow**. The player chooses a concrete Phase 8D personal-inventory instance; successful commitment removes that exact instance once, while stale/dead/ineligible/failed attempts preserve ownership.
- Added `GiftSystem` as the gift-specific projection/evaluation layer without creating another inventory or relationship authority. Ordinary ownership/instance removal remains in `PersonalInventorySystem`; committed relationship score, hidden opinion, happiness, timeline, preference reveal, bounded NPC memory, action economy, and gameplay RNG remain owned by `RelationshipSystem`.
- Extracted the pure preference/relationship/wellbeing scoring core from the shared-experience evaluator so outings, dates, and gifts reuse one formula without pretending a gift occurred at a fake place. Existing Phase 9B shared-experience semantics remain formula-compatible.
- Exact item `preferenceTags` drive Gift Approval/reaction through the existing 38-tag Phase 9A vocabulary. The People profile exposes a mobile owned-item chooser and approval meter; valuable collectibles/assets remain outside ordinary gifting and with their existing Assets/Estate authorities.
- No broad durable NPC inventory was added. Meaningful committed gifts may create bounded NPC memories, but the transferred ordinary item is not duplicated into a shadow possession ledger.
- Rewind restores the exact item plus relationship/action/RNG consequences atomically; descendant continuation does not resurrect the previous protagonist's ordinary possessions. Duplicate copies remain distinct, and replaying a stale instance cannot transfer twice.
- Save schema remains **17**; the authored personal-item catalog remains **24** and the shared preference vocabulary remains **38 tags**.

### Certification

- GitHub Actions Run #148 (`34908361877`) certified expanded source `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` from upload wrapper `d2f4ee0f052387f6a91fec78210f0efc69b0b7ba`. Net diff from the prior certified repository source is exactly **14 intended Phase 9E source/test/UI files** (3 added, 11 modified); workflow import reports 15 changes only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9E **60/60**; AI testbench **58/58**; Relationship Microcopy **69/69**; base **82/82**; People **57/57**; Phase 8D **63/63**; Phase 9A **45/45**; Phase 9B **53/53**; Phase 9C **40/40**; Phase 9D **61/61**; Dynasty **64/64**; Integrated Long-Life **105/105**; Progressive Disclosure **25/25**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **195 modules**. People remains lazy/code-split at ~37.88 kB JS / 11.69 kB gzip; main JS ~1,229.92 kB / 348.18 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `f7a6ae88c9b44736c8afbd5776a46a133403768eaf7b13293b13492958160597`; dependency SHA-256 `65d66454a8375d812706cabfc922065311439405e49542f5b71a2cccb863db87`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10372914569` (`3aba83994b203611a9c09d0f201b76a5c220bea35ff84c4d955b2cfe210b68d3`); Pages artifact `10373447865` (`5b1860077132ff8d3cfb947e77d12c44523604b388fe071f0885ef7a71fe2340`); Pages deployment reported success.
- Fresh Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `a9e53a6840d0fa05790acb3e20ce963a2df51f0e` at `2026-09-14 23:22:00.588163+00`.
- **Phase 9E is CLOSED / CERTIFIED. Next slice:** Phase 9F — Cross-World Chemistry.

## Phase 9D — Dating & Romantic Momentum — CI Green Run #146 — 2026-09-14

### Added / changed

- Separated **Ask on Date** from **Become Partners**. Eligible exact NPCs can accept or reject an invitation; accepted plans persist until completed/cancelled, then the player chooses one of **8 authored date plans** that reuse existing Everthread places and the single shared-experience evaluator.
- Added bounded romance metadata to the existing Relationship record: pending invitation context plus at most **8** completed-date entries. Romantic momentum is derived from real date outcome bands rather than stored as a second score; roughly three genuinely strong dates unlock the partnership attempt, while poor dates can reduce momentum.
- Preserved established dating/commitment authority: age 14+, teen/adult separation, orientation compatibility, attraction/relationship context, exact-NPC targeting, existing-current-commitment exclusivity (including estranged living commitments), and the existing proposal/marriage/breakup/divorce/reconciliation/family-planning path.
- Pending dates remain visible/cancellable during temporary age incompatibility; invariant repair removes malformed or dead-target ghost pending plans. Read-only projections consume no gameplay RNG/runtime IDs.
- People Threadspace now provides the mobile date chooser, approval/prose result, pending-date recovery controls, and gated **Become Partners** action. AI testbench semantics execute the same production actions.
- Updated the synthetic long-life player to follow the real multi-date courtship contract rather than assuming the old one-click partnership flow; no simulation-only acceptance or momentum shortcut exists.
- Save schema remains **17**; no second romance score, relationship graph, date outcome engine, or memory ledger was added.

### Certification

- GitHub Actions Run #146 (`34905053500`) certified expanded source `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` from upload wrapper `aa6cd1fc69f4df9430a88baaa9331d5b279e556f`. Net diff from the prior certified repository source is exactly **21 intended Phase 9D source/test/UI files**; workflow import reports 22 changes only because it removes `everthread-source.zip`.
- Canonical preflight PASS **4/4**; Phase 9D **61/61**; AI testbench **52/52**; base **82/82**; People **57/57**; Relationship Microcopy **66/66**; Phase 9B **53/53**; Phase 9C **40/40**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Local deep preflight PASS **6/6** including content audit and a 1,000-life run with **0 anomalies / 0 forced terminal deaths**; marriage 63.0% and children 0.31/life after calibrating the simulation harness to use real date continuation rather than a legacy one-click courtship assumption.
- Production build PASS with Vite 7.3.6 at **194 modules**. People remains lazy/code-split at ~35.82 kB JS / 11.25 kB gzip; main JS ~1,225.97 kB / 347.09 kB gzip; established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `b2bc71aab5c827f50a8c7b9caab8ebace55b9c567ffd975803ecd99472106be5`; dependency SHA-256 `18baf98fbbf620280e6ef062e85cb695484bf7c03a6fde1df15ea01fa82d9be0`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact `10372681543` (`81a91416305ef0c3b293c7c1dd679319df4d4245ba5f43978f3b80c4e1f17c55`); Pages artifact `10372740361` (`20878aec96f98fcafb45535fbdf206a791f28bd4578583c4f594837240248610`); Pages deployment reported success.
- Fresh Feedback Inbox sweep found **4 total / 0 unresolved**, no new receipt after `2026-09-13 19:51:36.119407+00`, and advanced the stored review checkpoint to `1856e7b9053e2f6cfc9afda48be7c3dcac6069c1` at `2026-09-14 22:39:43.562077+00`.
- **Phase 9D is CLOSED / CERTIFIED. Next slice:** Phase 9E — Real Gifts.

# Everthread Changelog

## Phase 9C — Childhood & Youth Social Life — CI Green Run #144 — 2026-09-14

### Added / changed

- Added `YouthSocialSystem`, a read-only contextual planner over existing NPC, Relationship, SchoolWorld, town-place, and Phase 9B shared-experience truth. It does not create a youth-only relationship graph, school roster, experience ledger, memory store, or location authority.
- Added **11 curated age-aware youth plans** for ages 3–17: park playdates, home visits, sleepovers, arcade/game-shop outings, movies, real school socials, stadium days, cooking, mall/diner hangouts, and park walks. Friendly non-family peers are limited to a plausible ±3-year age band; siblings, half-siblings, step-siblings, and cousins remain valid through the existing family relationship taxonomy.
- Expanded the canonical shared-experience activity registry **10 → 12** with youth-bounded `sleepover` and `school_social`. School Social is projected only for a current real classmate in an active SchoolWorld; every other youth plan reuses a certified Phase 9B activity/place pair.
- Added a mobile **Spend time together** section to eligible People profiles. Plans age in/out rather than exposing future adult-sized option walls, unavailable plans preserve real shared-experience reasons, and successful outings show concise prose plus a bounded approval meter.
- Preserved the existing committed path: `GameEngine.shareExperience` → `RelationshipSystem` → `SharedExperienceSystem`. Successful youth outings reuse the established social action economy, exact-target timeline, single gameplay-RNG draw, preference reveal, and bounded NPC memory semantics. Browsing/planning remains read-only and RNG/runtime-ID neutral.
- Extended AI Interaction Testbench semantics so exact NPC/place/activity shared outings execute through the real engine action. No test-only gameplay implementation was added.
- Save schema remains **17**. Adult romance, attraction/orientation, commitment, school, family-planning, and family-topology authorities are unchanged.

### Certification

- GitHub Actions Run #144 (`34887219411`) certified expanded source `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` from upload wrapper `ef1d386c5baab2e964f2e8f00cabe8d4e6264ab7`. Net source diff from the prior certified repository source is exactly **12 intended Phase 9C source/test/UI files**; workflow import reports 13 changes only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, schema, or Phase 9D drift was introduced.
- Canonical preflight PASS **4/4**; Phase 9C **40/40**; base **82/82**; People Threadspace **57/57**; AI Interaction Testbench **45/45**; Relationship Microcopy **66/66**; Family Topology **40/40**; Dynasty **64/64**; Phase 9A **45/45**; Phase 9B **53/53**; Integrated Long-Life **105/105**; minigames **19/19**; feedback **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **192 modules**. People remains lazy/code-split at ~33.49 kB JS / 10.82 kB gzip; main JS is ~1,217.14 kB / 344.75 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `a56dfebebee0aefd227dfbca71850dff591d62eef247064ed481cdb8f3bbe689`; dependency SHA-256 `a18b4bac9c33cffe3a798f023efcee7adb05ff5c0f973f6a4c36f9f5ceebe020`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10365740616`, digest `21efe389a43afb8950185182edc7ea2e5e2897b2f74aa4617499531f993fa5f7`; Pages artifact ID `10365790597`, digest `85d5a26d84d9e086180eaa15c2ea8a1212fee786ce53bd503e9bad49c4729082`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox sweep found **4 total / 0 unresolved by `triage_status`**, no new report after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `5a6d35a5f906e16e3c26ddcb2502efc0e1c2f71b` at `2026-09-14 19:32:14.421886+00`.
- **Phase 9C is CLOSED / CERTIFIED. Next slice:** Phase 9D — Dating & Romantic Momentum.

## Phase 9B — Shared Experience Foundation — CI Green Run #141 — 2026-09-14

### Added / changed

- Added one reusable `SharedExperienceSystem` evaluation path over exact player + NPC + relationship + place + activity + preference/context inputs. It is deliberately pure/read-only: evaluation and option projection do not mutate `GameState`, consume gameplay RNG, allocate runtime IDs, or create a second relationship/memory/location authority.
- Added **10 authored age-aware shared-experience activities** across Weaver Park, Crossroads Mall, Nightjar Diner, Threadwell Residential, Pulseworks Gym, and Everthread Stadium. Activities reuse the existing 38-tag preference vocabulary and return concise coherent prose plus bounded **0–100 approval** / outcome-band semantics while hidden weights remain private.
- Preserved `RelationshipSystem` as the committed social-action authority. Shared experiences reuse the established per-NPC social action economy, consume exactly one gameplay-RNG variation only on a committed action, apply relationship score / hidden opinion / player happiness, write one exact-target timeline entry, reveal at most one relevant known preference, and create NPC memories only for meaningful rough/awful/great outcomes.
- Bounded relationship-authored NPC memories to 36 while preserving permanent records and recent nonpermanent history. Existing hook-up/ordinary-interaction memory writes now use the same bounded helper without changing their player-facing semantics.
- Added availability hardening for stale/dead NPC IDs, invalid or undiscovered place/activity pairs, remote participants, and age gating. Age-inappropriate preference tags cannot bias young-child shared experiences.
- No save migration or durable shared-experience ledger was added; save schema remains **17**. The evaluator accepts explicit preference/context overrides so Phase 9C youth social life, Phase 9D dates, Phase 9E inventory gifts, and Phase 9F cross-world chemistry can reuse the same foundation rather than fork scoring logic.

### Certification

- GitHub Actions Run #141 (`34880935501`) certified expanded source `f1be1e6bc39482cb613b85bbdad77ea5ca7e9298` from upload wrapper `c2beb60a91b1869993f83412fd63f084f26e0b98`. Net source diff from the prior certified repository source is exactly **7 intended Phase 9B source/test files**; workflow import reports 8 changes only because it removes `everthread-source.zip`. No docs, package, workflow, asset, schema, or Phase 9C drift was introduced.
- Canonical preflight PASS **4/4**; Phase 9B **53/53**; base **82/82**; Relationship Microcopy **66/66**; Phase 9A **45/45**; Integrated Long-Life **105/105**; minigames **19/19**; feedback suites **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **190 modules**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; main JS is ~1,216.41 kB / 344.59 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `495b4f0e1c47705e3f822ce86df46cb989412eec7f43cbde9307ebff2e0a8553`; dependency SHA-256 `7c80fdb1e14b0edf35dd2c29b67b1ee9a6ff5ed26e687cea52b5ea00297572d2`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10362674376`, digest `ba43c8f5039be7053dc38cf4dc0a99b5f40a25110a63e24ba0444971cdc5ad8b`; Pages artifact ID `10362614619`, digest `72fb456e5085132b2565ddf7727e82d7743ab24622b583edb6e1e2c39e00c9e7`; Pages deployment reported success.
- Fresh post-certification Feedback Inbox read found **4 total / 0 unresolved by `triage_status`**, with no new report after `2026-09-13 19:51:36.119407+00`. Connector safety blocked the review-checkpoint write, so the stored checkpoint still points to Run #137; no false advance is claimed.
- **Phase 9B is CLOSED / CERTIFIED. Next slice:** Phase 9C — Childhood & Youth Social Life.

## Phase 9A — NPC Interests & Preferences — CI Green Run #139 — 2026-09-14

### Added / changed

- Opened **Phase 9 — Shared Lives** with one compact, persistent preference foundation for meaningful NPCs. Intrinsic tastes remain part of the existing NPC record; what the current protagonist has learned remains on the existing `Relationship` record. No second personality graph, relationship score, or social-memory authority was introduced.
- Added one shared **38-tag** preference vocabulary spanning gifts and future shared experiences. Each persistent profile is bounded to at most 4 likes, 3 dislikes, and 1 occasional aversion; traits bias generation without deterministically dictating identity. Neutral is derived rather than stored as another list.
- Preference generation is stable from existing game seed + NPC identity, uses an isolated deterministic RNG stream, and consumes no gameplay RNG counter or runtime IDs. Background NPCs remain lazy until they become protagonist-relevant; invariant/save repair normalizes only profiles that already exist.
- Player-specific preference knowledge is bounded separately to 8 tags, with passive discovery capped at 6 and age/relationship context limiting how quickly knowledge appears. Schema migration does **not** retroactively invent learned tastes on old relationship records.
- People profiles now expose only plausibly known interests with concise **Likes / Neutral / Dislikes / Avoids** labels. Browsing is read-only and never reveals raw hidden weights.
- Save schema advances **16 → 17**. Existing relationship targets receive stable intrinsic profiles during migration, while relationship knowledge remains untouched until normal play reveals it. Rewind, dynasty continuation, malformed-save repair, and long-life behavior remain covered.

### Certification

- GitHub Actions Run #139 (`34870897923`) certified expanded source `f8ddfe5db0995dceb07969765b34b78f18740e01` from upload wrapper `8245a89f919086fcebc82e12880282076a13e5ef`. Net diff from the prior certified repository source is exactly **38 intended Phase 9A source/test files**; workflow import reports 39 changes only because it removes `everthread-source.zip`. No documentation, package, workflow, asset, or Phase 9B drift was introduced.
- Canonical preflight PASS **4/4**; base regression **82/82**; People Threadspace **57/57**; Rewind **16/16**; Dynasty **64/64**; Integrated Long-Life **105/105**; Phase 8A **25/25**; Phase 8D **63/63**; Phase 8E **34/34**; Threadspace Load Recovery **10/10**; new Phase 9A **45/45**; minigames **19/19**; feedback suites **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **188 modules**. People remains lazy/code-split at ~27.94 kB JS / 9.10 kB gzip; Map and Player Profile remain independently lazy. Main JS is ~1,206.90 kB / 341.59 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `7ecc001e4c79f113e2f3ac52071fdd1c8d3256ea2eb7cd25720adb19c8cfaca7`; dependency SHA-256 `e3bc0b39f962260217d42104c0c8dd802b9f4ae6a46d47013205fab46f610e2e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10359137007`, digest `60ef75dd3105118723f0af12bcffa173d85c439e55c69c49edbc81f6a7614005`; Pages artifact ID `10359321568`, digest `e0234fa05dc501106535fc9694644150181c9203bc48d00fabbeb1734bfb3e1d`; Pages deployment reported success.
- Post-certification feedback read attempts were blocked by the connector safety layer, so no new inbox result or checkpoint advance is claimed. The last successfully reviewed state remains **4 total / 0 unresolved by `triage_status`** with checkpoint `e1aa213fac4e03ab9a4af3039d9605852289b899`.
- **Phase 9A is CLOSED / CERTIFIED. Next slice:** Phase 9B — Shared Experience Foundation.

## Phase 8E — Phase 8 Closeout — CI Green Run #137 — 2026-09-14

### Closed / verified

- Formally closed **Phase 8 — Everthread: Home** after proving access parity, migration/rewind/dynasty safety, deterministic browsing, mobile touch accessibility, and bounded integration behavior across the existing Phase 8 stack.
- Added one centralized primary/Assets navigation contract so the six primary tabs and all six established Assets sections are directly regression-testable. The legacy Assets owner remains directly reachable; no mature entry point was retired merely because Map/Profile routing exists.
- Raised the remaining People/Map secondary controls to the established **44px minimum touch target** on the supported mobile widths. No gameplay authority, save state, content count, RNG behavior, or runtime-ID behavior changed. Save schema remains **16**.
- Added dedicated **Phase 8E Closeout** regression coverage at **34/34** for primary/Assets reachability, all 28 institution doorways, canonical Assets action families, read-only browsing purity, schema-14→16 migration determinism/idempotency, emigration safety, underworld visibility projection, and 360/390/412/430px map-camera behavior.
- Preserved the post-8D lazy-screen recovery boundary. Mavyy also confirmed on the real player-facing Android path that People Threadspace and Map load correctly again after the Run #135 hotfix.

### Certification

- GitHub Actions Run #137 (`34859549989`) certified expanded source `e1aa213fac4e03ab9a4af3039d9605852289b899` from upload wrapper `ca6e726ce31896593d0de825e1614ce5e5ca5418`. Net diff from the prior certified repository source is exactly **7 intended Phase 8E source/test files**; workflow import reports 8 changes only because it removes `everthread-source.zip`. No docs, schema, package, content, workflow, or Phase 9 drift was introduced.
- Canonical preflight PASS **4/4**; base regression **82/82**; People Threadspace **57/57**; Phase 8B Map **46/46**; Phase 8C Routing **41/41**; Phase 8D **63/63**; Threadspace Load Recovery **10/10**; new Phase 8E **34/34**; Dynasty **64/64**; Integrated Long-Life **105/105**; minigames **19/19**; feedback suites **20/20 + 23/23**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **186 modules**. Map, People, and Player Profile remain independently lazy/code-split. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256 `a9fcef3b305afd578e7ac84e0f3428d5394e9b5c522bd010cce3329d8e7247f1`; dependency SHA-256 `a06a60a2ac51e42e9a21e01c9cf8f89828068df4890ec262f7c989e906e9d1a6`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10354132463`, digest `8c4d3f2e6c4b461150870e59b0a8290be66763897992fb5a0a10a3f49bef1a03`; Pages artifact ID `10354586748`, digest `08fb8de646d10252a474957d0890d598c28d7e6fa5fb0695679ed13c8d2682c8`; Pages deployment reported success.
- Post-certification feedback sweep found **4 total reports / 0 unresolved by triage status**, no new receipt after `2026-09-13 19:51:36.119407+00`, and successfully advanced the stored review checkpoint to `e1aa213fac4e03ab9a4af3039d9605852289b899` at `2026-09-14 15:07:04.320301+00`.
- **Phase 8 is CLOSED. Next slice:** Phase 9A — NPC Interests & Preferences.

## Critical Threadspace Lazy-Load Recovery Hotfix — CI Green Run #135 — 2026-09-14

### Fixed

- Fixed a production-critical failure where entering lazy **People Threadspace** or the **Everthread Map** could leave the player with a blank application surface after a stale/missing dynamic chunk failed to load. The Threadspace systems themselves were intact; the failure escaped through the React root because lazy screens lacked a containment boundary.
- Added `LazyScreenBoundary` plus `lazyScreenRecovery` so People, Map, and Player Profile receive one guarded automatic recovery attempt for recoverable dynamic-import failures. Recovery is loop-safe; if loading still fails, the error remains inside the affected screen and preserves the app header/bottom navigation with explicit **Reload Everthread** and **Return to Life** controls.
- Hardened the PWA update path: navigations and JavaScript/CSS code requests now fetch fresh rather than trusting stale cache-first shell entries, legacy shell cache state is purged on activation, and an installed replacement service worker triggers one controlled refresh. Lazy screens remain code-split.
- Added dedicated **Threadspace Load Recovery** regression coverage at **10/10** for recoverable error classification, one-shot reload guarding, guard reset, and non-recoverable containment. Save schema remains **16**; no `GameState`, relationship, map, finance, inventory, routing, RNG, or runtime-ID authority changed.

### Certification

- GitHub Actions Run #135 (`34856517423`) certified expanded source `39523787af658a6907cb82ba0e7b94d964fca82d` from upload wrapper `f454c437a3d1f99691caef0fb1a406666158baee`. Net diff from the prior certified repository source is exactly **7 intended hotfix source/test files**; workflow import reports 8 changes only because it removes the uploaded `everthread-source.zip`. No Phase 8E, documentation, package, or unrelated gameplay drift was introduced.
- Canonical preflight PASS **4/4**; base regression **82/82**; People Threadspace **57/57**; Phase 8B Map **46/46**; Phase 8D **63/63**; Threadspace Load Recovery **10/10**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **185 modules**. People and Map remain lazy/code-split; main JS is ~1,200.22 kB / 339.43 kB gzip and the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `e9f051d99257edd4c4266c1b4d44665630fff0a012ea9c8a04d5da2bd9971fbf`; dependency SHA-256 `ddfefb540b8d3931fdf83c45d98018e169a5360e2aac8835517f6cff36ff6fb7`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10352906274`, digest `512e12bbcfea517b8066d58410c4070bdd8e89b12b229b9c3fdaf63d4a23f98a`; Pages artifact ID `10352803571`, digest `6f7ce2742ab1b406cf86e030f4269ae70d1e9cecdefc696b0e7abf3963fcd84c`; Pages deployment reported success.
- Post-certification feedback sweep found **4 total reports / 0 unresolved** with no new receipt after `2026-09-13 19:51:36.119407+00`. The connector safety layer blocked the bookkeeping checkpoint write, so the last successfully stored checkpoint remains the Run #133 checkpoint rather than falsely claiming an advance.
- **Next slice remains:** Phase 8E — Phase 8 Closeout, after this hotfix documentation sync certifies.

## Phase 8D — Player Profile & Personal Inventory — CI Green Run #133 — 2026-09-14

### Added / changed

- Added one shared player-profile surface opened from the Life identity and the **YOU** node in People Threadspace. `PlayerProfileSystem` projects identity, generation, location, career, education, relationship context, traits/appearance, licenses, achievements, asset counts, personal items, and valuable collectibles from their existing authorities rather than copying those truths.
- Added a bounded **personal inventory** authority for ordinary non-financial possessions and future giftable items. Phase 8D ships **24 original personal-item definitions** across Crossroads Mall, Everthread Market, and Nightjar Diner. Browsing/eligibility projection consumes no gameplay RNG or runtime IDs; a successful purchase spends Cash exactly once and allocates exactly one item instance ID.
- Personal inventory is intentionally **not** a shadow asset ledger: ordinary items contribute no net-worth/resale value, while valuable collectibles remain solely in the established Assets/estate authority and are projected into the player profile exactly once. Discarding a personal item returns no cash.
- Added bounded invariant repair for malformed/duplicate/unknown inventory rows and a hard 80-item inventory cap. Shopping respects authoritative physical location, incarceration/death state, authored minimum ages, Cash, and centralized action-economy limits.
- Save schema advances **15 → 16**. Existing saves receive an empty personal inventory deterministically; migration is idempotent, gameplay-RNG neutral, and runtime-ID neutral. Rewind restores inventory and Cash atomically. Descendant continuation starts the successor with their own empty ordinary personal inventory while valuable collectible inheritance continues through the existing estate/asset authority.
- Phase 8C institution routing, the authored map, Threadspace relationship truth, finance/accounting, estate ownership, and all older contextual shortcuts remain intact.

### Certification

- GitHub Actions Run #133 (`34853113638`) certified expanded source `cf2ede37be5362bc02678a2cc4bec6defa38a837` from upload wrapper `b4fb020a999c38d32d7de0c8acaa408c4b04eb32`. The net committed gameplay diff from the prior docs baseline is exactly **44 intended source/test files**; workflow import reports 45 only because it removes the uploaded `everthread-source.zip`. No docs, package, workflow, or unrelated asset drift was introduced.
- Both TypeScript gates PASS; canonical preflight PASS **4/4**; base regression **82/82**; Phase 8A **25/25**; Phase 8B **46/46**; Phase 8C **41/41**; new Phase 8D profile/inventory regression **63/63**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **183 modules**. `PlayerProfileSheet` remains lazy/code-split at ~8.97 kB JS / 2.67 kB gzip plus ~3.82 kB CSS / 1.01 kB gzip. Main JS is ~1,198.18 kB / 338.73 kB gzip; the established >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `79ee41e57885897f4a1efca5a2de8c51884dd975954de9289f8999fb2ffc835e`; dependency SHA-256 `d61b0fdec5af4e67b4dfb9f9b2adf39490aaad091b334635e18db7dd6e48069c`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10352225006`, digest `ddce4db099dca9a0bfca79eef5374dacaab25e1f8e9c5313847f2afc96575030`; Pages artifact ID `10351555391`, digest `3a98da45ddcc6069fa4966892c647713f86dc0eb9b9e18a0cd736b6ac1244914`; Pages deployment reported success.
- Post-certification feedback sweep found **4 total reports / 0 unresolved** with no new receipt after `2026-09-13 19:51:36.119407+00`; stored review checkpoint advanced to `cf2ede37be5362bc02678a2cc4bec6defa38a837` at `2026-09-14 14:06:03.077434+00`.
- **Next slice:** Phase 8E — Phase 8 Closeout.

## Phase 8C — Institution Routing — CI Green Run #131 — 2026-09-14

### Added / changed

- Added **28 meaningful institution service doorways** across the existing 24-place Everthread registry while leaving landmark-only places unrouted rather than inventing fake mechanics.
- Added centralized `institutionRouting.ts` projection from place services into the mature **Life, Assets, Activities, and Career** owner screens. The map performs navigation only; it does not execute gameplay actions or own results.
- Routed Central Everthread Bank to existing money/credit/payments/investments, Loomline Motors to vehicle marketplace/ownership, Hearthline Realty to home marketplace/ownership, schools/college to Education, Hospital/Gym to health/wellness, Airport to travel, City Hall to Politics/business, justice locations to legal/corrections, Loomworks to work/business, special-career venues to their established worlds, and Blackline Yard to organized crime after existing discovery allows the place.
- Added ephemeral owner-screen route intent, contextual institution banners/anchors, and locked-context messaging that preserves progressive disclosure. Seeing a building never bypasses age, eligibility, legal, financial, career, or discovery rules.
- No `GameState` field, save migration, alternate location ledger, gameplay RNG draw, or runtime-ID allocation was added. Save schema remains **15**.
- Content audit now reports **24 Everthread town places / 28 routed institution services**; the random-event library remains **691**.

### Certification

- GitHub Actions Run #131 (`34815580108`) certified expanded source `5eca77206c61f7af67d1c12f101fd5c986369e0c` from upload wrapper `85a6449e6878c174586f5f61351654bb0b1ff877`.
- Both TypeScript gates PASS; canonical preflight PASS **4/4**; base regression **82/82**; Phase 8A **25/25**; Phase 8B **46/46**; new Phase 8C routing regression **41/41**; Integrated Long-Life **105/105**; all established suites remained Green.
- Production build PASS with Vite 7.3.6 at **178 modules**. `TownMapScreen` remains code-split at ~8.60 kB JS / 3.50 kB gzip plus ~7.69 kB CSS / 1.91 kB gzip; main JS is ~1,187.72 kB / 335.72 kB gzip. Existing >700 kB warning remains nonblocking technical debt.
- Certified source SHA-256 `5615d7382b8170be942c825f2c5d8def3a3a2855ce5411e389a4ae9782884db7`; dependency SHA-256 `2473833386b3e3c4e26825181751dfe3352f4787117e0780806fb27e91ad4e7e`; package-lock SHA-256 `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10336258752`, digest `c0ce8f6248bcdc113cc6f89c5f38b7c228265c39b6b60c607cb76768a59a6a65`; Pages artifact ID `10336585276`, digest `574d8f039938b3b3c46fb161d531b046f16d637515c9312c10016c7bb872d38f`; Pages deployment reported success.
- Post-certification feedback sweep found no new report rows and advanced the stored review checkpoint to `5eca77206c61f7af67d1c12f101fd5c986369e0c`.
- **Next slice:** Phase 8D — Player Profile & Personal Inventory.

## Post-8B Map Artwork & Flush Threadspace Presentation — CI Green Run #129 — 2026-09-14

### Changed

- Replaced the synthetic rendered town-map surface with the exact player-supplied authored Everthread artwork, bundled at `src/assets/everthread-town-map.png` and used as the native **1536×961** map coordinate plane.
- Recalibrated all 24 existing place markers to recognizable regions of that artwork while preserving stable IDs, categories, visibility rules, routing metadata, and all existing simulation ownership.
- Removed the inset/bordered Map Threadspace presentation. The map workspace now runs edge-to-edge beneath the header and directly above bottom navigation, matching the spatial model established by People Threadspace.
- Initial map camera now uses cover/fill behavior to avoid letterboxed workspace gaps; **Fit Map** remains the explicit full-town overview. Pan, pinch/wheel zoom, filtering/search, culling, progressive marker/label disclosure, and place sheets remain intact.
- The old synthetic district/road geometry is no longer rendered as the visual map; six district definitions remain semantic registry metadata. Save schema remains **15** and no migration is required.

### Certification

- GitHub Actions Run #129 (`34813478003`) certified expanded gameplay/source `109438ec2d50308c62c061a1c6bed7e0849e157b` from upload wrapper `9929dc02a48a92048e724c55c23441f5d1b1384b`.
- Exact source diff from the prior certified repository source is the intended **6 map files** only; no unrelated gameplay/system/package/workflow drift.
- Both TypeScript gates PASS; canonical preflight PASS **4/4**; base regression remains **82/82**; Phase 8B Town Map expands to **46/46**; Phase 8A remains 25/25; Integrated Long-Life remains 105/105; all established suites remain Green.
- Production build PASS with Vite 7.3.6 at **176 modules**. Authored map asset ships at ~405.17 kB; lazy `TownMapScreen` is ~18.76 kB JS / 6.06 kB gzip plus ~6.65 kB CSS / 1.75 kB gzip. Established main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `d4af50b0cd89a4903216fa142e6f2e724b63e6f85935dbb4ad503fa47fd995ee`; dependency SHA-256: `d3838ea7d4c36879308e87b144b6eab065387b8c1f1a91540137eeff7935b2dd`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10336025996`, digest `ff5ca3e3c5b74469b1f08092ed0e3262155743099f23617f307285272843edb4`; Pages artifact ID `10335706833`, digest `af9836db0812c8a187ad3d2d0fb320fea8809dfc74305b3fbe4567ad9bb009c9`; Pages deployment reported success.
- Post-certification feedback sweep found no new report rows; stored review checkpoint advanced to the Run #129 expanded source.
- **Next slice remains:** Phase 8C — Institution Routing.

## Phase 8B — Town Place Registry & 2D Flat Map — CI Green Run #127 — 2026-09-14

### Added / changed

- Added one authored Everthread town registry with **24 stable places across 6 districts**, covering the complete Phase 8B location-family contract without creating a second simulation/location ledger.
- Added `TownMapSystem` as a deterministic read-only projection/math layer for discovery, filtering, semantic view, fit/constrained camera calculations, viewport culling, and zoom-based progressive disclosure. Map browsing consumes no gameplay RNG, allocates no runtime IDs, and mutates no `GameState`.
- Added a lazy-loaded sixth primary **Map** tab with mobile-first touch pan, pinch/wheel zoom, Fit Map, large markers, search/category filters, progressive labels/pins, viewport culling, and place-detail bottom sheets. No hover interaction is required.
- Added public institutions/landmarks for banking, vehicles, realty, residential life, shopping/food, parks/groceries, school/college, hospital/gym, film/modeling, racing/sports/military, City Hall, justice/public safety/prison, air travel, and business. Added Blackline Freight Yard as an underworld location whose visibility derives from existing organized-crime/legal state.
- Added optional place routing metadata that points only to mature existing screens. Phase 8B deliberately does not execute bank/property/career/etc. mechanics; those existing systems remain authoritative until Phase 8C routing.
- Existing residence authority remains `countryId/city`. Emigrated characters can browse Everthread without being relocated. Save schema remains **15** and no migration is required.
- Content audit now reports **24 Everthread town places**; the ordinary random-event library remains exactly **691**.

### Certification

- Added `phase8BTownMapRegression.ts`: **41/41** checks covering registry uniqueness/coverage, district bounds, routing ownership, schema stability, deterministic/RNG-neutral projection, underworld discovery, filtering/search, 360/390/412/430px fit math, camera constraints, viewport culling, progressive disclosure, semantic view stability, and post-emigration browsing.
- Phase 8A remains **25/25**; base suite remains **82/82**; Integrated Long-Life remains **105/105**; every established career/family/NPC/estate/finance/credit/world-condition/minigame/feedback suite remained Green.
- Both TypeScript gates PASS; canonical Everthread preflight PASS **4/4**; production build PASS with Vite 7.3.6 at **175 modules**. `TownMapScreen` is code-split at ~19.53 kB JS / 6.24 kB gzip plus ~8.20 kB CSS / 2.03 kB gzip. The established >700 kB main-chunk warning remains nonblocking technical debt.
- GitHub Actions Run #127 (`34809167604`) certified expanded gameplay/source `f3fcb537545c2a454d98db22600346baf54e194e` from upload wrapper `e1becf6912c9af6d92533d98f374a3a05976e408` on package `0.12.0`, save schema **15**.
- Certified source SHA-256: `e33c5ca44ec685fd41684f53a5f95a3aa67ea71341b33064fac54eccc665ba3e`; dependency SHA-256: `382c6da9eade13f2d2a3f31692de0ee35f4864808786d116968031dd046f47f6`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10334276556`, digest `5cc080d07a3246045e6004857ea158f00b16af30af28ee90463be4552d1f4a1f`; Pages artifact ID `10334057076`, digest `dcec92a7398f2ab09dd9d5d18268c47561878db6443b3153f52b95fab8b7f92c`; deployment reported success.
- Post-certification Feedback Inbox sweep found four total reports and zero unresolved reports; stored review checkpoint successfully advanced to `f3fcb537545c2a454d98db22600346baf54e194e`.
- **Next slice:** Phase 8C — Institution Routing.

## Phase 8A — Everthread Setting Foundation — CI Green Run #125 — 2026-09-13

### Added / changed

- Established **Everthread** as the canonical home setting for player-facing new lives while retaining `countryId/city` as the single physical/legal/economic location authority used by mature systems.
- Added fictional Everthread jurisdiction/city definitions and a shared `locationLabel` projection; executable country definitions increase **32 → 33**.
- Added hidden `namePoolCountryId` to separate cultural procedural naming from physical residence. Character/NPC naming, name-based identity inference, autonomous family naming, and dynasty continuation now preserve this profile independently from travel/emigration.
- Removed the real-country selector from the New Life player UI. Low-level scenario/test country overrides remain supported without becoming player-facing home selection.
- Added `SettingSystem` with safe naming-profile normalization and schema-14 → 15 setting migration. The migration moves only the protagonist's current local simulation context into Everthread, preserves remote/historical state, retains prior travel history, is idempotent, and consumes no gameplay RNG or runtime IDs.
- Active country-scoped world conditions and active SocialWorlds tied to the former local context follow the migration; archived SocialWorlds and resolved world-condition history remain historical. Later schema-15 emigration remains durable on load.
- Everthread uses the established North-American-style school profile as the current education compatibility bridge. Travel copy and initial birth/location copy avoid duplicate `Everthread, Everthread` labels.
- Travel destination UI defaults away from the current location and labels location economics generically.
- Save schema advances **14 → 15**.

### Certification

- Added `phase8ASettingFoundationRegression.ts`: **25/25** checks covering default Everthread residence, separate cultural naming profiles, legacy migration preservation, local-vs-remote NPC/world semantics, active-vs-historical world conditions, travel history, RNG/ID neutrality, idempotence, invariants, and post-migration emigration durability.
- Dynasty transition regression is **64/64** with naming-profile preservation; all established family/estate/credit/asset/NPC/world-condition and other suites remain Green. Base regression suite is **82/82** and Integrated Long-Life remains **105/105**.
- Both TypeScript gates PASS; canonical Everthread preflight PASS **4/4**; production build PASS with Vite 7.3.6 at **171 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- GitHub Actions Run #125 (`34807854189`) certified expanded gameplay/source `2596084575dd4288a0b549dc1a618736280f135b` from upload wrapper `36b8ce0863d8a6ddd69e20a85b99ed6ec216cb2a` on package `0.12.0`, save schema **15**.
- Certified source SHA-256: `46efef3174bb53984b67fcf1c1512fdb8a741a65edb37006654e602b21a8253c`; dependency SHA-256: `7c1e03244499adf494b2bb986797e603270624d047eee8bc52e3c48b68364eab`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified preflight artifact ID `10333602478`, digest `6e65d5df2511792614c00b9e50b5db70e2953e2d5f4fc7964e6fc191a880b77d`; Pages artifact ID `10333582525`, digest `f519a783f900fc860dfb70168b7277d0b65b4c77cb83624ef1d83a0a7162cd02`; deployment reported success.
- Post-certification Feedback Inbox sweep still found four total reviewed/resolved reports and no new report rows; stored review checkpoint successfully advanced to `2596084575dd4288a0b549dc1a618736280f135b`.
- **Next slice:** Phase 8B — Town Place Registry & 2D Flat Map.

## Phase 7C — Persistent World Conditions — CI Green Run #122 — 2026-09-13

### Added / changed

- Added one bounded `WorldConditionSystem` authority for persistent national/global conditions. It owns condition identity, exact country/global scope, duration, intensity, durable cooldowns, bounded active/history state, deterministic annual start/expiry, and read-only modifier projection; it owns no cash, jobs, housing, investments, fame, business, travel, or event queue truth.
- Added seven original data-driven conditions outside the 691-event random library: Growth Wave, Economic Slowdown, Cost Surge, Housing Squeeze, Travel Disruption, Media Frenzy, and Market Jitters. Country conditions bind the exact country where they started; global conditions remain globally relevant.
- Existing authorities consume bounded modifiers instead of being bypassed: `EconomySystem` (inflation/salary/housing/business demand), `CareerSystem` (application pressure/layoff risk), `BusinessSystem` through the economy index, `PropertySystem` through housing, `InvestmentSystem` (drift/volatility), `TravelSystem` (trip cost), `FameSystem` (organic growth/scandal/publicity economics), and `FinanceSystem` (ordinary household living-cost pressure).
- Added a compact mobile Life-screen **World around you** card showing only conditions relevant to the player’s current country plus global conditions, including scope, intensity, remaining years, description, and effect summary. Start/expiry also write bounded timeline entries under the new `world` timeline category; no standalone popup queue is introduced.
- Annual condition selection uses an isolated deterministic world-condition RNG stream derived from seed/year/country and does not advance `state.rngCounter`. Existing downstream RNG draw shapes remain unchanged.
- Save schema advances **13 → 14** for durable `worldConditions`. Migration creates empty world-condition state without retroactive history and is deterministic, idempotent, gameplay-RNG neutral, and runtime-ID neutral. Active conditions are capped at 4 and resolved history at 48.

### Certification

- New `phase7CWorldConditionRegression.ts`: **42/42** checks covering content isolation/counts, schema-14 migration, migration idempotence/RNG neutrality, deterministic generation, active/history bounds, multi-year expiry/history, exclusive groups/cooldowns, country/global relevance across emigration/return, UI projection, Economy/Business/Property/Investment/Travel/Fame/Finance integration, save round-trip, queue isolation, exact scope, and global invariants.
- Both TypeScript gates PASS; complete regression wall PASS; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Phase 7B2 35/35; Phase 7B3 36/36; all established career/estate/finance/NPC suites remain green.
- Production build PASS with Vite 7.3.6 at **170 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- GitHub Actions Run #122 (`34797847276`) certified expanded gameplay/source `0770106f52eea3182e86d120fa38c6b90be589e4` from upload wrapper `60e5646c274cd36024a778a93a1b8c1af3a401c5` on package `0.12.0`, save schema **14**.
- Fresh live Feedback Inbox review after certification found **4 total reports, all 4 resolved**. The bookkeeping checkpoint write was blocked by connector safety, so no later checkpoint value is claimed.
- **Phase 7 is closed.** After this closeout synchronization is certified, implementation planning stops until Mavyy and Yuki brainstorm the future direction together.

## Phase 7B3 — Special-Career Long-Tail Echoes — CI Green Run #120 — 2026-09-13

### Added / changed

- Extended Phase 7B into the three persistent special-career ecosystems that were not already served by the older Phase 4D8 annual story scanner: combat sports, military service, and politics.
- Added five action-driven probability-zero echoes: combat training with the exact coach, a sanctioned bout with the exact rival, military training with the current posting/commander when available, a political policy push with the exact office/chief of staff when available, and a press confrontation with the exact office/opposition leader when available.
- Existing `SpecialCareerStorySystem` annual mentor/rival/path scanning is unchanged. Phase 7B3 is requested only by explicit player actions through `SystemicStorySystem` → `ConsequenceSystem`, avoiding a second special-career story generator.
- Added a narrow data-driven `ChoiceEffect.specialCareer` effect for bounded `skill`, `reputation`, and `approval` deltas on the exact `payload.careerKind`. It cannot alter wins/losses, titles, contracts, seasons, elections, terms, ranks, promotions, projects, or other lifecycle-result authority.
- Exact archived SocialWorlds remain valid history; dead/missing exact NPC/world targets cancel deterministically rather than retargeting. Military/politics actions taken before their annual world is created may schedule career-only history without forcing premature world creation.
- Save schema remains **13**. Scheduling consumes no gameplay RNG; the ordinary random-event library remains exactly **691** definitions and the older 18-definition dedicated special-career story registry remains separate.

### Certification

- GitHub Actions Run #120 (`34796052224`) certified expanded source `4dd4378ec8986056fc3348dec5b2c6b1594b236b` from upload wrapper `c74078a41340023ab7760378f1fdfe0f77108643` on package `0.12.0`, save schema **13**.
- `phase7B3SpecialCareerEchoRegression.ts`: **36/36**; Combat 51/51; Military 65/65; Politics 80/80; Special-career Story 37/37; Path-story 68/68; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Phase 7B2 35/35; Progressive Disclosure 25/25; Random-event Coherence 77/77; minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites remained green.
- Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, and production build with Vite 7.3.6 at **168 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `b742118c6ce2db92abf774f178d1f067551ced5148268cdaf70de1c70e78f539`.
- Certified dependency SHA-256: `657e8c495c687e2f4667000052eb2c42461568c5e5bfe970f48e14290bd071dd`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10329833244`, digest `51b4e4bdc22a9824039f46a20eee603081b66f243e7abd3f70650a7b2df56ef5`; Pages artifact ID `10329833247`, digest `2f00aa0d6b096b3379db5ad80e74b42afbae74a09bf9dfb28544dd99aa2e92a8`. Certified restore smoke and Pages deployment reported success.
- A fresh live Supabase review after Run #120 found **4 total reports and 0 unresolved reports**; the review checkpoint is advanced to `4dd4378ec8986056fc3348dec5b2c6b1594b236b`.

## Phase 7B2 — Ownership & Workplace Echoes — CI Green Run #118 — 2026-09-13

### Added / changed

- Added five action-driven systemic delayed stories for property renovation, business founding, business product launches, manager feedback, and formal coworker concerns.
- All five use the existing `SystemicStorySystem` request bridge and certified `ConsequenceSystem`; no new narrative queue, graph, or save authority is introduced.
- Property stories bind the exact owned property and cancel if it is sold/missing before the due age. Business stories bind the exact existing business. Workplace stories bind the exact persistent workplace world plus the exact manager/coworker and may intentionally surface after the workplace archives; dead/missing people or missing worlds cancel rather than retarget.
- Added data-driven property effects for bounded condition/value-percentage changes and business effects for bounded demand/reputation changes. Event rendering resolves `{PROPERTY_NAME}` / `{BUSINESS_NAME}` / workplace `{WORLD_NAME}` from authoritative state instead of copying names into durable story payloads.
- Property/business consequence resolutions expose exact semantic state-change keys. Asset and business story outcomes write to the matching timeline categories.
- Save schema remains **13**. Scheduling consumes no gameplay RNG and the ordinary random-event library remains exactly **691** definitions.

### Certification

- GitHub Actions Run #118 (`34792171294`) certified expanded source `a4d04523e18128044c00f960f6db5fcd306a8237` from upload wrapper `84f1814b46df253e1e00520ed21c12e2e0608a43` on package `0.12.0`, save schema **13**.
- `phase7B2OwnershipWorkRegression.ts`: **35/35**; Core 82/82; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Progressive Disclosure 25/25; Random-event Coherence 77/77; Activity-specific Minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites remained green.
- Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, and production build with Vite 7.3.6 at **168 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `bba33e3f10e6d4a81e321acbd9aad5051f9092ac4c68e220e613bb62a4be5075`.
- Certified dependency SHA-256: `e88590934865025dcb26987fa254cefa18c346f022b94e0378933752e076bee1`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10328692946`, digest `3f49ce6df32cedcb03f20b39ed547bb0e2c5420ebd83498c81306109638b8f58`; Pages artifact ID `10328503412`, digest `6eeb415d39319542a382c563b914390a16071e9e1d3d2cf50e724d55325dc86c`. Certified restore smoke and Pages deployment reported success.
- A fresh live Supabase review after Run #118 found **4 total reports and 0 unresolved reports**; the review checkpoint is advanced to `a4d04523e18128044c00f960f6db5fcd306a8237`.

## Feedback UX — age-appropriate progressive disclosure — CI Green Run #117 — 2026-09-13

### Certification

- GitHub Actions Run #117 (`34783290659`) certified expanded source `9822a31df84197ea700ebd890bf0f68cb716637b` on save schema **13**.
- Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, Progressive Disclosure **25/25**, Integrated Long-Life 105/105, Phase 7A 36/36, Phase 7B1 33/33, Random-event Coherence 77/77, both feedback suites, and production build at **168 modules**.
- Certified source SHA-256: `f2fa8f09e292e46b704e2f2c37a3a1e7b045e28bdfe5a9fcb5e9dcd211213c5f`.
- Certified dependency SHA-256: `856bae49f4e6b469f4e2d85d031f218c38d6dbdc909ef19fc13bcc23244b9579`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10325856281`, digest `7c34b453461c5c6286efc44a8a3959e4601691b077be1fe300b96863aadfce0d`; Pages artifact ID `10325846256`, digest `0bedf7dd068fad6ae217142a9cf69c1d8de2d38e53776f764c743cf696373d99`. Pages deployment reported success.
- Resolved `ET-20260913-BE8649B9` as a deployed suggestion/experience correction against that exact source/run. A fresh Supabase review against Run #117 found **0 unresolved reports**.

### Corrected

- Early-life Activities and Career/Life Paths now hide age-ineligible choices until their owning gameplay systems say the threshold has been reached, while legacy/current records stay visible for save compatibility.
- Engine eligibility remains authoritative; the presentation layer consumes shared owner thresholds rather than maintaining a second set of age rules.

## Phase 7B1 — Family, School & Relationship systemic stories — CI Green Run #115 — 2026-09-13

### Added / changed

- Added five system-owned delayed stories driven by real player actions rather than annual random rolls: time spent with a child, academic misconduct, a serious friend argument, romantic reconciliation, and marriage expectations.
- Added `SystemicStorySystem` as an RNG-neutral request bridge into the already-certified `ConsequenceSystem`. It owns no queue, relationship, NPC, school, or save truth; `state.delayedEvents` remains the sole active consequence queue.
- Added `systemicConsequenceEvents.ts` as a dedicated probability-zero content registry outside the 691-event random pool. Exact NPC/social-world targets, origin age, due age, validity, and dedupe are carried by the certified scheduler.
- Added exact school-world event effects for conduct/social standing/attendance. The first school follow-up can therefore change the persistent school record already consumed by post-secondary admissions rather than applying a detached stat-only outcome.
- Event description rendering now resolves `{WORLD_NAME}` from the referenced `SocialWorld`; relationship stories continue to resolve the exact NPC from payload authority.
- Reconciliation stories cancel if the relationship ends before they mature; marriage stories require the same exact spouse; dead NPCs and missing school worlds cancel deterministically rather than retargeting.
- Updated the integrated long-life test helper to resolve scheduler-required same-age backlog before retrying Age Up, matching certified Phase 7A player-facing gating instead of assuming every Age Up advances immediately.
- Save schema remains **13**; no gameplay RNG is consumed by story scheduling and no new durable authority was introduced.

### Certification

- GitHub Actions Run #115 (`34782061788`) certified expanded source `f417403ff8a091f92f823c074d6a132dd27b90aa`, package `0.12.0`, save schema **13**.
- Upload wrapper: `0a4372ac7f8a9c3474e5b9e50e995abe11dae2f1`. Canonical preflight passed Engine TypeScript, Test TypeScript, the complete regression wall, and production build.
- `phase7BSystemicStoryRegression.ts`: **33/33**; Core 82/82; Integrated Long-Life 105/105; Phase 7A Persistent Consequence 36/36; Random-event Coherence 77/77; Activity-specific Minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23.
- Production build PASS with Vite 7.3.6 at **167 modules**. The established >700 kB main-chunk warning remains nonblocking technical debt.
- Certified source SHA-256: `b30483a74c4c674ad3fbb025a3cb7f78d065b6f438fcf43482e3e21ef9c39613`.
- Certified dependency SHA-256: `dfc18617ab0a94454a3cdae218baa0e9800bff1d5628b32262feba193c212827`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10325695174`, digest `a58934b96b90348293cbe7eec09c4734cf74255802e7d406cbd561bb2d7e26fc`; Pages artifact ID `10324654718`, digest `5ffa444fdbdf27c5ec5f630bad39a0be2b336fdaf731b7b78099fcee91059075`. Pages deployment reported success.

## Post-4G random-event narrative-composition correction — CI Green Run #114 — 2026-09-13

### Certification

- GitHub Actions Run #114 (`34780654179`) certified expanded source `60bfa3eaecb574df5a74920cbc64f513055bae46`, package `0.12.0`, save schema **13**.
- Canonical preflight passed both TypeScript gates, the complete regression wall, Random-event Coherence **77/77**, Integrated Long-Life 105/105, Phase 7A Persistent Consequence 36/36, production build, certified artifact restore smoke, and Pages deployment.
- Certified source SHA-256: `21f7ecbeb2f531cff582ed003925def89e555b5842a06e7231e3375ed6f6daf3`.
- Certified dependency SHA-256: `0833b91abb51c9a7518141591e84b936fbfaecb855d75a8f39d7a8143db7969d`; package-lock SHA-256: `da0cd3cd1a975e0d7d6a8466d55826bc8277dc35f55e7685be85d7ecf11f2886`.
- Certified artifact ID `10324957306`, digest `67835c1585a8ee92bb7bc2db8b638145628f28e3b99ab48dc804119e98ada7af`; Pages artifact ID `10324533122`, digest `5bbb65b63f006278d402a60d665c3a898304104432cf83ffcf089f61acbe5f1d`.

### Corrected

- Resolved live feedback report `ET-20260913-0AA876B7`: procedural event choices were coherent, but generic description templates could produce grammatically invalid or contextless scene text.
- Kept EventSystem/coherence ownership unchanged. The correction normalizes scene settings and uses context-safe description frames across all 664 procedural variants.
- Preserved all 691 random-event definitions, 664 procedural variants, 80 dilemma families, event IDs, probabilities, cooldowns, exact targets, choices/effects, save schema 13, and exactly three descriptions per procedural event, preserving description-selection RNG shape.
- Existing saved `pendingEvent.description` text is not rewritten; already-open choices remain compatible.

## Phase 7A — Persistent Consequence Foundation — CI Green Run #112 — 2026-09-13

### Certification

- GitHub Actions Run #112 (`34778449301`) certified expanded source `536c102e10f27694caa89a8b1d9c473953ca6e76` on save schema **13**.
- Canonical preflight passed 4/4: Engine TypeScript, Test TypeScript, complete regression wall, and production build.
- Phase 7A Persistent Consequence passed **36/36**; Integrated Long-Life 105/105; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites remained green.
- Production build passed with Vite 7.3.6 at **165 modules**; Pages deployment succeeded.
- Certified source SHA-256: `1de3ef6b9063b864afb5a4f80165bbd9eedd3db3a9280313ed68236ebd464c17`.
- Certified artifact ID `10324148743`, digest `e71dfa2020932fa856ec15a425530d7310d8b29ac2b083148abba44943513b3f`; Pages artifact ID `10324273336`, digest `dc0ff7b8d199e46c8dad632fdd506830e580f02fb7ca6feb1d89c78aa919ca4b`.

### Handoff synchronization

- Promoted Phase 7A from local candidate to certified/deployed foundation in `CURRENT_STATE`, `ROADMAP`, `PHASE7_PERSISTENT_CONSEQUENCES`, `DEVELOPMENT`, and `PLAYER_FEEDBACK`.
- Marked **Phase 7B1 — Family, Parenting, School & Relationship systemic delayed stories** as the next gameplay slice.
- Corrected stale wording that still described the secure central Feedback Inbox as future work. Supabase central submission, independent-device receipt, and player-visible disposition/status read-back are already live.
- Explicitly marked activity-specific minigame work as historical/established rather than current so a fresh chat cannot incorrectly resume that older slice.

## Phase 7A — Persistent Consequence Foundation candidate — 2026-09-13

### Added / changed

- Added one authoritative bounded `ConsequenceSystem` while retaining `state.delayedEvents` as the sole active consequence queue.
- Added stable consequence/chain/origin identity, exact due windows, priority/tie ordering, exact durable target refs, validity/cancellation requirements, dedupe, bounded completion/cancellation history, and exact event cooldown ages.
- Added shared `CURRENT_SAVE_VERSION` and candidate schema **13** migration. Schema-12 migration is deterministic, RNG-neutral, idempotent, preserves old pending choices and delayed targets, preserves distinct legacy queued entries when no old dedupe authority existed, and reconstructs legacy cooldown ages without consuming gameplay RNG.
- Moved Financial Pressure arbitration out of FinanceSystem; Finance requests a normal-priority consequence and the scheduler owns ordering. Special-career story openings now schedule high-priority exact-target consequences with stable chain/validity metadata.
- Age Up surfaces already-due backlog before advancing, preventing multiple due consequences from silently drifting into later ages. Descendant continuation resets previous-life scheduler state.
- Added `persistentConsequenceRegression.ts`: **36/36** checks covering cooldowns, deterministic order, pending protection, windows, exact targets/cancellation, dedupe, bounds, migration/idempotence, save/rewind, Finance priority, descendants, content count and invariants.
- Ordinary random event definitions remain **691**.

### Local validation

- Engine TypeScript PASS; Test TypeScript PASS; complete established regression wall PASS.
- Phase 7A Persistent Consequence 36/36; Integrated Long-Life 105/105; Feedback Reporting 20/20; Feedback Central Inbox 23/23.
- Production build PASS with Vite 7.3.6 at 165 transformed modules. Canonical GitHub Actions remains final certification authority.

## Player-visible Feedback disposition — CI Green Run #111 — 2026-09-13

### Added

- Added secure player status read-back to the existing Supabase `everthread-feedback` Edge Function. A report can be queried only with its report ID plus the private 32-byte device token already required for withdrawal.
- Added bounded `player_message` reviewer communication while keeping `triage_status` and `resolution_class` as the only authoritative lifecycle/disposition fields.
- Feedback Center now displays central receipt, review lifecycle, disposition, reviewer message, review timestamp, and a manual **Check status** action.
- Automatic feedback synchronization refreshes review state only for the same bounded 10-report batch already used for retry.
- Centrally dispositioned test report `ET-20260913-A527E2A6` as Resolved → Suggestion noted to validate player read-back after deployment.

### Security / architecture

- The public status endpoint does not expose internal triage/resolution notes, cancellation-token hashes, database access, or other players’ reports.
- No simulation/save authority or gameplay RNG changes. Supabase security advisor remains clean after the schema extension.

### CI validation

- GitHub Actions Run #111 (`34774175236`) certified expanded source `576f9402deb854f8d5bd11891610e035cdd6d7ec`.
- Canonical preflight passed 4/4 with Feedback Central Inbox 23/23, Activity Feedback Reporting 20/20, Activity-specific Minigame 19/19, Core 82/82, AI Interaction Testbench 41/41, Integrated Long-Life 105/105, all established suites, and the 163-module production build.
- Certified artifact ID `10323017491`; Pages artifact ID `10322703128`; Pages deployment succeeded.

## Central Feedback Inbox v2 — CI Green Run #110 — 2026-09-13

### Added

- Created a dedicated free Supabase **Everthread** project in `us-east-2` and deployed the `everthread-feedback` Edge Function for central report submission/withdrawal.
- Added RLS-protected central report, rate-limit, and review-checkpoint tables with revoked public grants, explicit deny policies, triage metadata, source-commit indexing, duplicate linkage, and future-Yuki review state.
- Added local-first remote transport in `src/feedback/remoteInbox.ts`: 32-byte device cancellation secrets, hash-only server storage, idempotent submission, secure withdrawal, offline retry, startup/online retry, and bounded retry batches.
- Feedback Center now automatically submits reports when online and displays central delivery state; Share/Copy/JSON export remain fallback/backup options.
- Versioned the applied Supabase migrations and deployed Edge Function under `supabase/`.
- Added Feedback Central Inbox regression: 17/17 locally.

### Security / architecture

- No Supabase secret/service-role credential is present in the public client. Public database roles cannot read or mutate feedback tables.
- Supabase security advisor is clean after setup. Performance advisor findings were reduced to expected unused-index notices on the empty new database.
- Feedback remains entirely outside `GameState`, save schema, rewind, descendants, simulation RNG, and gameplay authorities.

### CI validation

- GitHub Actions Run #110 (`34773384580`) certified expanded source `9980d8c278cb3bb2306d73a07963bf172096fd1e`.
- Canonical preflight passed 4/4 with Feedback Central Inbox 17/17, Activity Feedback Reporting 20/20, Activity-specific Minigame 19/19, Core 82/82, AI Interaction Testbench 41/41, Integrated Long-Life 105/105, all established suites, and the 163-module production build.
- Certified artifact ID `10322692198`; Pages deployment succeeded.

## Player Feedback / Issue Reporting — CI Green Run #109 — 2026-09-13

### Added

- Added Settings → Help & Feedback with interface-specific/action-specific report classification across Life, People, Activities, Career, Assets & Money, Minigames, Progress & Life Saves, Settings, and Other.
- Added Technical issue, Experience issue, and Suggestion report kinds with focused subcategories and bounded free-text context.
- Added optional safe diagnostic capture containing deployed build/source identity, save schema, game seed/RNG position, age/year/generation, current career, bounded system counts, pending-event identity, relevant settings, and recent timeline IDs without exporting the complete save.
- Added a bounded device-local report queue outside `GameState`, plus Share, Copy, structured JSON inbox export, draft cancellation, and queued-report withdrawal.
- Added deterministic production `build-info.json` generation from the actual checked-out Git commit so reports can identify the expanded source used by the deployed bundle.
- Added `PROJECT_HANDOFF/PLAYER_FEEDBACK.md` and a current-state feedback queue snapshot so future Yuki reviews active supplied/exported reports before new work and does not dismiss player-facing defects merely because backend regressions are green.
- Added Activity Feedback Reporting regression: 20/20 locally.

### CI validation

- GitHub Actions Run #109 (`34771397516`) certified expanded source `d73bbfa6fdf8afb430f2604a09c9ac3053d60962`.
- Canonical preflight passed 4/4 with Activity Feedback Reporting 20/20, Activity-specific Minigame 19/19, Core 82/82, AI Interaction Testbench 41/41, Integrated Long-Life 105/105, the complete established wall, and the 162-module production build.
- Certified artifact ID `10321624066`; Pages deployment succeeded.

## Phase 6C — Personal Borrowing / Bankruptcy / Recovery candidate — 2026-09-12

- Built only from certified Run #103 / `7f1f58099fe5e8528dc8ec3c70c0ed340a2e8294`.
- Adds four data-driven personal-loan products through shared CreditSystem underwriting, centralized personal-loan bills/delinquency/cure, and guarded voluntary bankruptcy/recovery without creating a second debt ledger.
- Save schema remains 12; optional personal-liability provenance/lender metadata is normalized deterministically for legacy debt with no RNG use.
- Local TypeScript gates and the complete regression wall pass, including Personal Borrowing & Recovery 31/31 and Integrated Long-Life 105/105. Standalone production build passes at 155 modules. GitHub Actions remains certification authority.

## Post-6B3 Credit History Reactivity correction candidate — 2026-09-12

### Fixed

- Credit & Banking History now derives current/prior transaction lists fresh on every game-state render instead of memoizing against the mutable credit-transaction array reference. Payments, charges, fees, deposits, and other posted credit transactions can therefore appear immediately while the banking sheet remains open.
- Added regression protection in Payment & Asset Management proving the read-only History projection immediately reflects a newly posted in-place credit transaction.

### Baseline

- Built only on certified Run #102 expanded source `8b2a49fe76c5429cf55228a00a15b6103211a25b`, package `0.12.0`, save schema 12. Phase 6B3 itself is CI Green.
- This is a presentation-reactivity correction only: it adds no debt authority, no save fields, no RNG use, and no content definitions. Phase 6C remains gated until this correction is CI Green.

### Local validation

- Engine TypeScript and test TypeScript pass. The complete regression wall passes with Payment & Asset Management **81/81** (up from 79/79 through two reactivity checks), Core 82/82, Credit & Banking 74/74, Asset Financing 77/77, Asset Delinquency 82/82, Integrated Long-Life 105/105, and every established suite green.
- Standalone production build passes at 153 transformed modules. The local all-in-one preflight wrapper was interrupted by the host execution ceiling during its repeated Vite transform after both TypeScript gates and the complete wall had already passed; GitHub Actions remains the final integrated preflight authority.

## Phase 6B3 — Payments & Asset Management UX — CI Green Run #102 — 2026-09-12

### Added

- Added a centralized `PaymentSystem` projection/action layer for real credit-card minimums and secured vehicle/home financing obligations. CreditSystem and FinanceSystem remain the balance authorities; the UI no longer needs to invent bill math.
- Added **Credit & Banking → Bills & Payments** from Overview. It itemizes current/past-due obligations, shows Cash, total due, past due, and annual auto-pay status, supports Cash payment of the real bill, and exposes per-obligation auto-pay switches.
- Added persistent annual auto-pay preferences. New cards and new asset-financing contracts default ON; schema-11 saves migrate safely to ON so old saves preserve their established automatic-servicing behavior. Card auto-pay covers the required minimum only, never the whole balance.
- Added manual secured annual-bill payment with a paid-ahead marker so paying before Age Up cannot double-charge the same contractual year. Existing delinquent secured bills continue through the 6B2 cure authority.
- Added vehicle sale quotes and real vehicle selling, including selling costs, lender payoff, equity proceeds, underwater deficiency conversion to unsecured debt, durable history, and confirmation before mutation.
- Added `AssetSaleSheet` and `paymentAssetManagementRegression.ts` with 79 targeted checks across migration, projection purity, auto-pay on/off, card minimums, secured prepayment, delinquency cure, financed contract defaults, vehicle/home sale accounting, save round trips, and invariants.

### Changed

- Credit & Banking Overview replaces the duplicated historical block with the compact Bills & Payments entry; major derogatory history now lives under the existing History tab. Individual card Accounts still support extra/full revolving-balance payments.
- Assets → Property now contains both homes and vehicles with a compact **Browse | Owned** toggle. Browse covers home + vehicle markets; Owned shows homes + vehicles together with contextual financing status and asset actions. Vehicles are no longer hidden under More.
- Payment controls are centralized in Credit & Banking instead of being scattered across asset cards. The Money liabilities view remains an accounting/status view and points players to Bills & Payments.
- Save schema advances from 11 to **12** for durable auto-pay, credit-card past-due, and secured paid-ahead payment state. Migration is deterministic, RNG-neutral, and defaults old obligations to the prior automatic-payment behavior.

### CI validation

- Built from exact certified Run #101 expanded source `c498753acb67bbb0aa930e5f8bdb7b411b1e874c` and its certified Node dependency artifact.
- GitHub Actions Run #102 (`34707368374`) imported the overlay into expanded source `8b2a49fe76c5429cf55228a00a15b6103211a25b` and reproduced both TypeScript gates, Core 82/82, Credit & Banking 74/74, Asset Financing 77/77, Asset Delinquency 82/82, Payment & Asset Management 79/79, Integrated Long-Life 105/105, every established suite, and the 153-module production build.
- Canonical preflight reported **GREEN 4/4**, certified artifact `10302905490` was uploaded, and GitHub Pages deployment succeeded. The existing >700 kB main-chunk warning remains nonblocking.

## Phase 6B2 — Secured Delinquency & Collateral Consequences — CI Green Run #101 — 2026-09-12

### Added

- Added persistent, save-safe secured-loan delinquency state on existing `Loan` records: status, arrears, missed-payment count, and the age of the unresolved miss. Pre-6B2 schema-11 loans derive as current without mutation, so no save-schema bump is required.
- Added explicit player curing for delinquent car loans and mortgages. Assets → Money shows the collateral, past-due amount, next-Age-Up consequence, and a touch-friendly **Cure** action that uses Cash only.
- Added vehicle repossession for uncured financed cars and strengthened mortgage foreclosure to use the same loan/collateral/credit authorities. Missed secured payments create durable timeline warnings and existing CreditSystem derogatories; repossession creates a credit default and foreclosure preserves the established foreclosure history.
- Added `assetDelinquencyRegression.ts` with 82 targeted checks covering current servicing, missed-payment accounting, cure success/failure, cure payoff, car repossession, foreclosure, deficiencies/surplus recovery, secured-payment priority, voluntary underwater sales, net-worth accounting, and schema-11 round trips.

### Changed

- Annual finance no longer reduces a secured-loan balance when the year cannot actually fund that payment. The skipped payment becomes arrears, the contractual term is not falsely consumed, and the player gets until the next Age Up to cure it.
- Same-year secured shortfall allocation protects housing by allowing a vehicle payment to fail before a mortgage when one skipped payment is enough to close the cash gap. Deeper insolvency can make both obligations delinquent.
- Unrecovered collateral balances become ordinary unsecured deficiency debt instead of disappearing. Involuntary foreclosure equity first reconciles existing unsecured shortfall debt before any remainder returns as cash.
- Voluntarily selling an underwater financed home now preserves the unpaid deficiency as unsecured debt, closing the prior debt-erasure exploit.
- Financed home/vehicle cards expose outstanding financed balance and at-risk state directly on the owned asset.

### Candidate validation

- Local canonical preflight from the certified Run #100 source/dependency artifact passes **4/4**: engine TypeScript, test TypeScript, complete regression wall, and production build.
- Core remains 82/82; Credit & Banking 74/74; Asset Financing 77/77; new Asset Delinquency 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; every established dedicated suite is green locally.
- Production build succeeds at 151 transformed modules. The existing >700 kB main-chunk warning remains nonblocking.
- GitHub Actions Run #101 reproduced Asset Delinquency 82/82, every established regression, both TypeScript gates, the 151-module production build, certified-baseline artifact creation, and Pages deployment. Expanded certified source is `c498753acb67bbb0aa930e5f8bdb7b411b1e874c`; Phase 6B2 is CI Green.

## Phase 6B1 — Asset Financing Foundation — CI Green Run #100 — 2026-09-12

### Added

- Added a reusable, data-driven `AssetFinancingSystem` plus six fictional vehicle/home lender programs. Asset underwriting consumes `CreditSystem.getCreditUnderwritingSnapshot()` for the existing derived credit profile, real income, installment/revolving payment burden, inquiries, and bankruptcy recovery instead of inventing a second score model.
- Added deterministic, read-only lender quotes for appropriate vehicles and homes with visible APR, term, down payment, amount financed, annual payment, monthly equivalent, finance charge, full-term total cost, projected payment burden, and human-readable approval/decline reasons.
- Added a mobile **Buy Outright | Finance** purchase sheet for property and vehicles. Browsing does not create an inquiry; signing re-underwrites current state and then records the approved financing inquiry.
- Added persistent `car` and `mortgage` liabilities using the existing `Loan` authority, including collateral `assetId` links, annual-finance servicing, net-worth accounting, estate debt treatment, schema-11 save persistence, and durable timeline/history context.
- Added `assetFinancingRegression.ts` with 77 targeted checks covering deterministic browsing, lender requirements, down-payment effects, stale-quote revalidation, preview→signed parity, shared application limits, cash-vs-credit separation, vehicle/home outright and finance paths, accounting identity, annual servicing, estates, saves, and CreditSystem authority reuse.

### Changed

- Replaced the legacy hard-coded home-mortgage approval math inside `PropertySystem` with the shared financing authority. Vehicle financing now uses that same authority; asset screens contain no independent creditworthiness calculation.
- Asset liabilities now show APR, authoritative annual payment, and remaining years. Credit & Banking history resolves asset-financing inquiries to their lender/program names.
- Outright vehicle purchases now create a durable asset timeline entry so a material life purchase is not invisible. Credit Available remains revolving borrowing capacity only and is never treated as purchase cash or wealth.

### CI validation

- GitHub Actions Run #100 reproduced both TypeScript gates, Core 82/82, Asset Financing 77/77, Credit & Banking 74/74, every established dedicated regression, Integrated Long-Life 105/105, and the production build.
- The canonical preflight reported GREEN 4/4, the certified baseline artifact was uploaded, and GitHub Pages deployed successfully.
- Expanded certified source is `819d223aa9a0d5f9109c705f16213c43ddcaeb31`; Phase 6B1 is CI Green.

## Phase 6A — Credit & Banking Foundation — CI Green Run #99 — 2026-09-12

### Added

- Added bounded schema-11 player credit state plus `CreditSystem` for revolving accounts, available credit, refundable secured deposits, statement/minimum/payment history, interest/fees, formal inquiries, derogatories, deterministic creditworthiness, account closure, bankruptcy discharge, and bounded history repair.
- Added six original fictional banking institutions/products spanning age-16 secured starter cards through established/premium unsecured offers. Browsing is read-only; formal applications are bounded and record understandable approval/decline reasons.
- Added Life-page **Cash** + **Credit Available** presentation and a mobile **Credit & Banking** hub with Overview, Accounts, Offers/contracts, and History. Contract review exposes line, APR, annual fee, late fee, deposit, and minimum-payment terms before acceptance.
- Added manual card payments, representative card purchases, secured-deposit refunds, current-year/recent transaction history, and durable timeline consequences for material credit events.
- Added `creditBankingRegression.ts`, now 74/74.

### Changed

- Net worth/wealth breakdown now treats secured deposits as represented assets and revolving balances as liabilities; Credit Available never counts as cash or wealth.
- Estate obligations include revolving debt while refundable secured deposits remain estate value. Existing insolvency/bankruptcy now discharges active cards through the credit authority and persists default/bankruptcy credit history.
- Descendant continuation initializes the newly controlled protagonist's player credit state without inventing an unsupported NPC consumer-credit history.
- Save schema advances from 10 to 11 with deterministic, RNG-neutral, idempotent migration.

### Predeployment validation

- Credit & Banking 74/74; Core 82/82; Dynasty Transition 63/63; Family Topology 40/40; NPC Asset Ownership 82/82; Timeline Scaling 11/11; Action VFX 46/46; Integrated Long-Life 105/105; every established dedicated regression remains green.
- Both TypeScript gates pass. Production build passes at 148 transformed modules; existing >700 kB main-chunk warning remains nonblocking.
- 80-year direct card-use benchmark completed in ~5 ms in the hosted workspace, retained 20 recent transactions after bounded pruning, serialized the full fixture at ~18 KB, and returned zero invariant errors.
- GitHub Actions Run #99 reproduced the Phase 6A regression wall and certified expanded source `6eb2b7876203d47dcc1ad5c48f1098bf359182cd`; Phase 6A is CI Green.

## Phase 5E — Dynasty Transition / End-of-Life Agency — CI Green Run #98 — 2026-09-12

### Added

- Added read-only `DynastyTransitionSystem` projection over the existing EstateSystem and NPC biography/asset authorities. The death UI no longer performs or mirrors inheritance math independently.
- Rebuilt the death flow into an intentional mobile sequence: completed-life review → estate outcome → successor selection → detailed successor inspection → explicit continuation confirmation.
- Successor inspection now surfaces existing education/career, partner/children, health/happiness, fame/reputation, debt, own net worth, own property/businesses, projected inheritance, inherited named assets, and protected-minor trust timing.
- Estate review now names forced-sale assets and explains whether each sale was caused by estate obligations or by fair division among heirs.
- Added durable post-handoff timeline entries for estate obligations/forced sales, inherited named assets/trusts, and the value distributed to other family heirs.
- Added `dynastyTransitionRegression.ts`, currently 63/63.

### Changed

- A descendant card no longer immediately switches protagonists. Selecting a child is read-only; a separate confirmation button performs the real `continueAsChild()` action.
- Protagonist-switch confirmation explicitly disables ordinary delta-derived action VFX so cash/stress/relationship differences between two different people are not misrepresented as an action consequence.
- Heir, successor, and forced-sale lists use 24-row progressive disclosure to keep extreme dynasty death screens bounded without deleting authoritative data.
- Added the cross-phase architecture rule that material protagonist-facing consequences must be visible/understandable through gameplay surfaces and, where meaningful agency exists, presented before commitment from the same authoritative system that applies the result.
- Save schema remains 10; no transition snapshot or second estate database was introduced.

### Predeployment validation

- Dynasty Transition: 63/63. Core 82/82; Estate Planning 46/46; Estate Administration 63/63; NPC Asset Ownership 82/82; Family Topology 40/40; Action VFX 46/46; Integrated Long-Life 105/105; every established dedicated regression remains green.
- Both TypeScript gates pass. Production build passes at 145 transformed modules; existing >700 kB main-chunk warning remains nonblocking.
- Twelve sequential reviewed handoffs with hundreds of background NPCs preserve 7,212 archived life-history entries, unique completed-life IDs, state invariants, and bounded linear historical-cast growth.
- GitHub Actions Run #98 reproduced canonical preflight 4/4, Dynasty Transition 63/63, every established regression, the 145-module production build, certified artifact creation, and Pages deployment on expanded source `5aa1c4338be4edc934b867f4e5a710d0e116aaa2`; Phase 5 is closed.

## Phase 5D — Broader Family Topology — CI Green Run #97 — 2026-09-11

### Added

- Added indexed `FamilyTopologySystem` derivation for aunt/uncle and cousin relationships plus reconciliation of the existing close-family taxonomy from authoritative parent/child/partner graph truth.
- Integrated expanded kinship into People/Threadspace labels and folders, generic family event targeting, delayed family-favor continuity, relevant special-career family targeting, save-load backfill, and descendant continuation.
- Added `familyTopologyRegression.ts`, now 40/40, including deterministic/idempotent derivation, no synthetic NPC creation, RNG/ID neutrality, extended-family simulation-tier bounds, event eligibility, generation handoff, migration/backfill, romantic-history preservation, UI labels, and a hundreds-relative scale fixture.

### Changed

- Extended kin stay background-tier unless individually meaningful; aunt/uncle/cousin births do not automatically become full-simulation branches or guaranteed player timeline entries.
- Save load now repairs state invariants before final family-topology synchronization so derived stepfamily/kinship uses repaired authoritative pointers.
- Threadspace person cards use the shared human-readable relationship label formatter (`aunt / uncle`, `niece / nephew`).
- Save schema remains 10; no new persisted family database was introduced.

### Predeployment validation

- Family Topology: 40/40. Core 82/82; Action VFX 46/46; Timeline Scaling 11/11; NPC Asset Ownership 82/82; Integrated Long-Life 105/105; every established dedicated regression remains green.
- Both TypeScript gates pass and production build passes at 144 transformed modules. Existing >700 kB main-chunk warning remains nonblocking.
- Explicit large-dynasty benchmark: 1,082 starting NPCs arranged as 180 aunts/uncles + 900 cousins synchronized in ~4.5 ms locally; six simulated years completed in ~362 ms, normal autonomy grew the cast to 1,182, no extended relative was forced full-tier, and validation produced zero errors.
- GitHub Actions Run #97 reproduced canonical preflight 4/4, Family Topology 40/40, every established regression, the 144-module production build, certified artifact creation, and Pages deployment on expanded source `8e5394d0488d1c760072590ffa5c06eadfdac9f6`.

## Post-Run95 playtest hotfix — CI Green Run #96 — 2026-09-11

- Fixed Life → Your Story failing to show Age Up timeline entries until navigation/refresh. Root cause was `Timeline` memoizing a bounded window by an array reference that Everthread intentionally mutates in place; the bounded window now recomputes on each render.
- Fixed Threadspace NPC interaction VFX disappearing at relationship score caps. Action VFX snapshots now record timeline length and derive semantic relationship gain/loss from only the new `relationshipDelta` entries created by the current action when before/after stored scores cannot move past 0/100.
- Added real capped positive/adverse `interactWithNpc()` regression coverage and same-reference timeline append coverage. Action VFX is now 46/46; Timeline Scaling is 11/11 locally.
- GitHub Actions Run #96 reproduced canonical preflight 4/4, Action VFX 46/46, Timeline Scaling 11/11, every established regression, the 142-module production build, certified artifact creation, and Pages deployment on expanded source `3b58f04827ddc88a33c61b3cdf0d50f1e7584161`.

## Phase 5C — Persistent NPC Asset Ownership — CI Green Run #95 — 2026-09-10

### Added

- Save schema v10 with lean persisted NPC property/business portfolios. Existing v9 aggregate NPC property migrates deterministically into stable explicit ownership without consuming the player RNG stream.
- Bounded NPC asset rules and a dedicated asset progression substream. Meaningful NPCs can own and modestly grow property/business interests; background-tier NPCs retain cheaper simulation, do not seed new explicit property at creation, and do not organically accumulate new portfolios.
- Explicit NPC estate settlement for retained property/business inheritance, adult/minor NPC heirs, player heirs, protected trusts, mortgage carryover, and idempotent source-estate clearing.
- Descendant continuation now converts the selected NPC's own property/business holdings into playable assets and separates mortgage debt from unsecured personal debt.
- People detail sheets now show NPC liquid wealth, property, businesses, debt, estimated net worth, and named holdings.
- Dedicated `npcAssetOwnershipRegression.ts` with 82/82 checks, including protected-trust caps/overflow reconciliation and a 600-background-NPC + 3,000-entry 12-year scale fixture.
- `timelineWindow.ts` plus a 10/10 Timeline Scaling regression: the authoritative timeline remains complete while the Life page initially renders the newest 120 entries and reveals older history in 120-entry increments.

### Changed

- `NpcLifeState.finance.propertyValue` is now a projection of explicit NPC property holdings instead of a second independent property-value authority. `npc.wealth` remains liquid wealth.
- NPC annual finance incorporates explicit business profit/loss and mortgage progression while keeping asset growth bounded and deterministic.
- Player estate settlement gives offscreen heirs retained property/businesses as real holdings instead of converting the full allocation into aggregate wealth. Minor NPC heirs retain those assets in trust until adulthood.
- NPC-parent inheritance can pass retained assets directly to the player; minor player inheritance remains protected until age 18 and is counted once when released.
- Adult NPC portfolios and minor NPC inheritance trusts share hard 6-property / 4-business caps. Overflow liquidates to equity/value rather than disappearing or growing the save without bound.
- NPC asset definition lookups now use precomputed maps and legacy property migration chooses the nearest definition in a linear scan instead of sorting a copied catalog for each migration.

### Predeployment validation

- Engine TypeScript and test TypeScript gates pass.
- NPC Asset Ownership: 82/82.
- Timeline Scaling: 10/10.
- Core 82/82; Estate Planning 46/46; Estate Administration 63/63; Action VFX 42/42; Integrated Long-Life 105/105; every established dedicated regression remains green in bounded local batches.
- Content audit remains unchanged and clean.
- Earlier 50-life family-policy bulk sanity: zero anomalies, zero forced terminal deaths, max NPC peak 443.
- Scale fixture: 600 starting background NPCs + 3,000 timeline entries advanced 12 years with full history preserved, portfolio caps respected, zero organic explicit background holdings, and clean state validation.
- Ad-hoc hosted-sandbox benchmark: 1,000 starting background NPCs + 5,000 timeline entries advanced 20 years in ~1.1 s; world grew to ~1,200 NPCs through ordinary autonomy with zero organic explicit background holdings and zero validation errors.
- Production build passes with 142 transformed modules; main chunk ~981.03 kB minified / 278.92 kB gzip. Existing chunk-size warning remains nonblocking.
- GitHub Actions Run #95 reproduced canonical preflight, certified artifact creation, and Pages deployment on expanded source `62e28aafb190f8b46d10b73fb6dd00985beb724d`; Phase 5C is CI Green.

## Universal derived action VFX candidate — 2026-09-10

### Changed

- Derived consequence VFX are now enabled by default for every gameplay button result that reaches the shared `App.onResult` authority. A real cash decrease therefore emits Money Loss automatically without each screen opting in with `derive:true`; stress, follower, and relationship deltas receive the same systemic treatment.
- `derive:false` remains an explicit escape hatch for exceptional presentation-only cases, but there are currently no production call sites using it.
- Generic special-career Path buttons no longer turn derivation off when a path has no primary domain icon, closing the remaining Politics, Military, Royalty, and Film Directing coverage hole while preserving primary icons for Acting, Music, Sports, Combat, Modeling, Motorsport, and Organized Crime.

### Validation

- Action VFX regression expanded from 38/38 to 42/42, including plain successful spending, failed-but-executed spending, primary-only requests with automatic derived consequences, and explicit opt-out behavior.
- Engine TypeScript and test TypeScript gates pass.
- Core 82/82; every established dedicated regression remains green; Integrated Long-Life 105/105.
- Production build passes with 138 transformed modules. The hosted sandbox cannot finish the monolithic preflight wrapper before its command ceiling, so the same underlying preflight stages were executed in bounded chunks without removing or weakening any suite. GitHub CI remains the independent final authority.

## Visual feedback asset integration — CI Green Run #93 — 2026-09-10

### Added

- Mavyy-supplied Everthread action-feedback artwork is now integrated as a reusable mobile VFX system. Successful acting, music, professional sports, combat sports, modeling, motorsport, organized-crime, chemistry, follower, relationship, and stress-reduction outcomes can emit their matching icon from the actual press location.
- Adverse outcomes can emit supplied stress-increase, money-loss, and relationship-loss artwork from the same press-origin particle layer. Multiple real side effects may share one bounded burst.
- A supplied cash icon now sits beside Current Cash on the Life screen, and the supplied DECEASED stamp overlays dead NPC nodes in People Threadspace without blocking node interaction.
- Dedicated Action VFX regression coverage verifies career-to-icon mapping, supplied asset paths, static icon paths, state-delta derivation, failed-but-executed adverse feedback, success-only primary feedback, deduplication, and chemistry-specific suppression of a redundant relationship-gain icon.

### Changed

- `App` now owns one presentation-only action-feedback controller. Pointer presses capture their viewport origin before engine execution; keyboard activation falls back to the button center. The layer never mutates game state, save data, action economy, or simulation RNG.
- Reduced-motion users receive a short stationary fade/scale rather than the upward confetti motion. Particle counts and lifetime are bounded for mobile performance.
- Supplied artwork is stored as transparent, cropped, mobile-sized runtime derivatives; the heavier action VFX set is lazy/runtime cached while only the small Life cash icon joins the PWA shell precache. Service-worker cache generation advances to `everthread-shell-v8`.
- Build Chemistry uses the supplied person-plus artwork as its explicit primary feedback and suppresses a duplicate heart-plus burst; follower gains reuse the same person-plus artwork.

### Predeployment validation

- Engine TypeScript and test TypeScript gates pass.
- Action VFX regression: 38/38.
- Core: 82/82; every established dedicated regression remained green, including Estate Planning 46/46, Estate Administration 63/63, AI Interaction Testbench 41/41, and Integrated Long-Life 105/105.
- GitHub Actions Run #93 reproduced canonical preflight 4/4 on Node 22.23.2/Linux x64, built 138 modules, published the supplied runtime assets, created the certified preflight baseline, and deployed Pages successfully.
- CI-Green source commit: `de8f9af6a0212a0d90acecf9008afa77b042ac42`.

## Phase 5B — 2026-09-10 — Estate Administration & Settlement

### Added

- Fictional country-sensitive estate administration profiles derived from Everthread's simplified gameplay fiscal context, with protected administration allowances, capped administration costs, levy allowances, and modest settlement-levy rates. These values are explicitly game balance rules, not real-world tax/legal guidance.
- Estate preview breakdown for gross estate, debts, administration, settlement levy, eligible heirs, forced-sale pressure, and the active fictional rule profile.
- Dedicated Phase 5 estate-administration regression with country-rule coverage, read-only/RNG-neutral preview checks, debt-before-levy math, named-bequest protection, investment-before-protected-bequest liquidation, trusts, descendant continuation, and five-generation no-income anti-duplication stress.

### Changed

- Estate obligations now flow through one settlement authority: unsecured debt, administration, and levy are paid before heir allocation. Unassigned indivisible assets may be sold first; liquid investments are used before a specifically named bequest must be sacrificed.
- Smaller estates receive a protected administration allowance so modest specific bequests are not sold solely to fund trivial settlement overhead.
- Descendant-continuation history records settlement administration/levy costs when present. Save schema remains 9 because the new rules are computed rather than persisted.

### Predeployment validation

- Existing Estate Planning: 46/46.
- New Estate Administration: 63/63.
- Family Continuity: 18/18.
- Core: 82/82; AI Interaction Testbench: 41/41; Integrated Long-Life: 105/105; all established dedicated suites passed locally.
- Mixed 100-life bulk sanity: zero anomalies / zero forced terminal deaths, max NPC peak 480.
- Family-biased 100-life bulk sanity: zero anomalies / zero forced terminal deaths, max NPC peak 474.
- GitHub Actions Run #92 reproduced canonical preflight 4/4, all estate and legacy suites, production build, certified preflight artifact creation, and Pages deployment. Phase 5B is CI Green at `926da2fa3c74bac021776d9f1b4825a7a3e39797`.

## 0.12.0 — 2026-09-05 — Full NPC Life Simulation

### Added

- Save schema v9 with persistent `NpcLifeState` biographies covering education, career history, household/finance state, health conditions, legal incidents/custody, public life, housing/moves, and simulation cadence. Existing v8 NPCs initialize deterministically without consuming the player RNG stream.
- Dedicated `NpcLifeSystem` ownership for autonomous NPC education, careers, finance, health, legal status, fame, households, family formation, and death. `RelationshipSystem` retains player↔NPC interactions and relationship milestones instead of accumulating unrelated autonomy logic.
- Autonomous NPC education/credentials, career history, job loss/promotion/retirement, household cash flow, debt servicing, bounded home ownership/appreciation, health histories, legal incidents/imprisonment/release, fame/followers/reputation/scandals, and household relocation.
- Blended-family formation with incoming stepchildren, reciprocal stepfamily links, autonomous adoption for stable low-fertility couples, and bounded family-planning pressure for close-family households.
- Direct adult-descendant handoff of real NPC biography state. Education, career, health, legal, fame, debt/property context, spouse/children, and institutional history survive when an established descendant becomes playable.
- NPC life summaries in People detail sheets, exposing education, career, housing, income, property/debt, health, public/legal history, custody, and household moves.
- Eight-generation dynasty stress coverage plus NPC population metrics in the simulation harness.
- O(1) deterministic Mulberry32 counter jumps. Seeded RNG creation no longer replays every previously consumed random number; regression coverage proves direct jumps match sequential consumption through large counters.
- Deterministic household relocation substreams so considering a move cannot reshuffle unrelated marriage, fertility, health, career, or legal outcomes. Partners and dependent children relocate together.
- Bounded relationship progression for important close-family NPCs so unlucky RNG cannot leave romantic relatives permanently single, dating, or engaged without resolution.
- In-game Reduced Motion now explicitly routes timing minigames to the non-motion sequence mechanic, matching the existing OS reduced-motion behavior.

### Changed

- Background acquaintances retain cheaper autonomy cadence while meaningful family/friend/enemy/romantic relationships automatically receive full simulation, preserving long-life performance without deleting history.
- Memories and hidden opinions influence long-term relationship drift and make emotionally significant persistent NPCs more likely to surface in targeted events.
- NPC-owned housing follows bounded housing-market movement instead of accidental deterministic depreciation; scheduled debt service is included in annual household cash flow before wealth growth.
- Autonomous relocation is household-scoped rather than person-scoped. Current player spouses cannot autonomously move away, and a guardian cannot silently relocate a dependent player without a future player-facing family decision.
- Partner/family progression remains probabilistic in normal years but gains bounded pressure against decades of accidental RNG limbo.
- Simulation reporting now includes average/max lifetime NPC cast so future social systems can be held to a population-growth budget.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 82/82 regression cases pass.
- Eight-generation continuation stress test passes with valid lineage/history and bounded cast growth.
- Neutral 1,000-life bulk population: zero anomalies, zero forced terminal deaths, average/max lifetime NPC cast 116.2 / 176, average lifetime inheritance 125,559.
- Mixed-policy 1,000-life bulk population: zero anomalies, zero forced terminal deaths, average/max lifetime NPC cast 116.3 / 176, average lifetime inheritance 123,442.
- Identical 250-life benchmark improved from roughly 30.0 seconds to 8.3 seconds after deterministic RNG jump optimization with unchanged meaningful aggregate outcomes.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

## 0.11.0 — 2026-09-04 — Persistent Workplaces

### Added

- Save schema v8 with persisted workplace-specific Social World state and real active/historical part-time employment records. Existing v7 careers reconstruct compatible workplace worlds during migration.
- Persistent full-time workplace rosters with managers, coworkers, departments, team groups, workplace morale/culture/tension/reputation, bounded turnover, and senior-character direct reports.
- Workplace actions for collaboration, networking, manager feedback, and formal coworker concerns, all classified through the central action-economy ledger.
- Real part-time jobs with age requirements, hourly pay, hours/week, performance, small persistent workplace rosters, annual income/tax integration, and shared weekly hour capacity around school/full-time commitments.
- Target-aware work events for credit disputes, manager reviews, rumors, team feuds, after-hours connection, formal workplace claims, and bonus pools.
- Regression coverage for employer archival, workplace migration, action limits, part-time capacity/income, evolving coworker relationships, targeted work events, and generation-safe social-world rebuilding.

### Changed

- Promotions within one employer preserve its workplace world; changing employers, resigning, being fired/laid off, or retiring archives the old workplace without deleting former coworkers.
- Work affiliation is independent from `Relationship.type`, so coworkers remain in People → Work after becoming friends, enemies, or romantic connections.
- Standard-career annual performance now responds to workplace morale/reputation/tension and manager relationship; low performance can demote before termination, while eligible performance can produce bonuses.
- Layoffs are distinct from performance firing and respond to employer morale and broader business-demand conditions.
- Retirement closes both full-time and active part-time employment and archives the associated workplaces.
- Generational continuation clears the former protagonist's institutional worlds and reconstructs only the newly controlled descendant's relevant worlds, preventing social-world leakage across generations.
- Work events may treat active part-time employment as valid employment and bind exact affiliated NPC/world payloads.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 71/71 regression cases pass.
- Content audit: 691 events total, including 90 work/career events.
- Neutral 1,000-life bulk population: zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk population: zero anomalies and zero forced terminal deaths.
- Long-process profiling reached 1,000 sequential lives with bounded memory and stable per-life runtime.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

## 0.10.0 — 2026-09-04 — Persistent School Social Worlds

### Added

- Save schema v7 with a persisted generic `SocialWorld` layer for schools now and workplaces/organizations later. Existing v6 education history reconstructs compatible archived/current school contexts during migration.
- Country-profile school progression with varied stage start/transition ages and simplified minimum school-leaving ages while preserving the established primary/middle/secondary education record taxonomy.
- Persistent school rosters with classmates, teachers, coaches, and school leadership stored as ordinary NPCs with memories, relationship state, aging, careers, and later-life continuity.
- School clubs, teams, service groups, arts, academic organizations, social groups, and leadership paths tied to recurring roster NPCs.
- Persistent attendance, conduct, social standing, honors, disciplinary history, academic-shortcut consequences, and school volunteering.
- Admissions profiles that combine academics, intelligence, discipline, conduct, involvement, reputation, school standing, and honors; scholarships can cover different proportions of tuition.
- Target-aware school events for recurring classmates and school authorities. Event effects and memories bind to the same NPC shown in the event copy.
- Shared-world history in People sheets so former classmates remain identifiable by the institution/role through which the player knew them.
- Background NPC simulation tier for ordinary school acquaintances; meaningful friends, rivals, romantic relationships, and family automatically receive the full annual autonomy pass.
- Explicit simulation seed prefixes for independent population batches plus streaming simulation aggregation to avoid retaining complete result objects for every finished life.
- Regression coverage for school-world migration, country school profiles, persistent rosters, bounded group activity, conduct/attendance, admissions weighting, compulsory-school leaving rules, and school-friend romance age safety.

### Changed

- School affiliation is no longer encoded solely by `Relationship.type`. A former classmate can become a friend, enemy, partner, or spouse and still remain discoverable in People → School through persisted institutional membership.
- Childhood education transitions are profile-driven rather than one global 5→11→14→18 schedule.
- Compulsory school cannot be dropped before the profile's minimum leaving age; post-secondary programs remain voluntarily leaveable.
- Teen/adult relationship milestone validation now applies to existing school friends too, closing a path that could bypass the normal dating-age rules.
- School activity effort uses the centralized action ledger, preventing join/participation/academic-risk reroll spam.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 64/64 regression cases pass.
- 72 TS/TSX source files pass syntax transpilation in the dependency-limited workspace.
- Two distinct 500-life neutral batches (1,000 unique lives total): zero anomalies and zero forced terminal deaths.
- Two distinct 500-life mixed-policy batches (1,000 unique lives total): zero anomalies and zero forced terminal deaths.
- Additional final 500-life mixed-policy sanity batch after age-boundary fixes: zero anomalies and zero forced terminal deaths.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

## 0.9.9 — 2026-09-04 — Life Saves & Dynamic Family Legacy

### Added

- Real multi-slot life saves backed by the existing IndexedDB/local fallback store. Independent new lives no longer overwrite `slot-1`.
- Account-level active-save tracking so Everthread reopens the last selected life and safely falls back to another surviving slot when needed.
- `Life Saves` tab with an expandable Ongoing Lives folder for switching between independent lives and deleting saved lineages, plus an account-level Past Lives folder aggregated from surviving saves.
- Dynamic Family Legacy showcase that ranks living and completed lives using a bounded legacy score across longevity, primary stats, logarithmic wealth, fame, family, career, and major milestones.
- Completed-life generation metadata for new deaths, with index-based generation inference for older saves.
- Regression coverage for collision-free slot allocation, earlier-generation legacy selection, and automatic best-life fallback when the featured save is removed.

### Changed

- The former `Past Lives` meta tab is now `Life Saves`.
- Creating a custom or random independent life allocates a separate save slot and preserves account-level settings.
- Switching saves flushes pending writes and saves the current life before loading the target slot.
- Imported JSON is installed as a new independent life save instead of silently overwriting an existing slot ID.
- Deleting the only remaining life save is blocked; create another life first so the runtime always retains one authoritative state.
- The Family Legacy card keeps its existing visual role but can feature any surviving generation, including an earlier completed generation when that life scores better than the current protagonist.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 57/57 regression cases pass.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 637,451, millionaire rate 40.5%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 840,742, millionaire rate 45.3%, zero anomalies and zero forced terminal deaths.
- Dependency-backed React/Vite production build remains the GitHub Actions deployment gate.

Everthread is pre-release. Versions below are development milestones, not public release promises.

## 0.9.8 — 2026-09-04 — Relationship Trees & First Playable Minigames

### Added

- Relationship folders in the People tab: Player Family, Relatives, Friends & Social, Romantic History, School, and Work.
- Mobile relationship-tree view rooted on the player, with persisted NPC parent/child/partner edges and direct fallback edges only when a folder member would otherwise be disconnected.
- Known connection details in NPC sheets so parent, child, and partner links are visible outside the tree.
- Reusable full-screen minigame overlay with timing, sequence-memory, grid-memory, and decision challenge mechanics.
- Interactive minigame integration for acting auditions, professional-sports attempts, combat bouts, motorsport races, and prison escape.
- Character-skill accessibility resolution for minigames and license tests when the minigame preference is disabled.
- Regression coverage for folder classification, non-invented NPC graph edges, extended-family tree linkage, minigame outcome direction, and seeded accessibility resolution.

### Changed

- People search remains global, while the default People surface now prioritizes relationship folders over one long flat list.
- Minigame scores are bounded modifiers to existing simulation formulas; character skill, circumstances, and seeded RNG still resolve final outcomes.
- Timing challenges fall back to sequence-memory play when the device reports a reduced-motion preference.
- Career-screen job/program derivation is recalculated on each engine render instead of being memoized against mutable `GameState` identity.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 55/55 regression cases pass.
- React/TSX source passes a shimmed TypeScript UI compile in the dependency-limited workspace; the dependency-backed Vite production build remains the GitHub Actions deployment gate.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 637,451, millionaire rate 40.5%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 840,742, millionaire rate 45.3%, zero anomalies and zero forced terminal deaths.

## 0.9.7 — 2026-09-04 — Childhood Eligibility & Dependent Finances

### Added

- Explicit age eligibility for investment trading, travel, structured wellness, pet adoption, and collectible-market purchases at both engine and mobile-UI layers.
- Childhood wellness unlocks by activity: walking at 3, running at 5, martial arts/meditation at 6, intentional diet activity at 10, and gym at 13.
- Regression coverage for newborn investment/travel blocking, age-staged wellness unlocks, dependent-minor finance, and guardian-supported shortfalls.

### Changed

- Investment buying and selling now require age 18. Pet adoption unlocks at age 5, and collectible-market purchases at age 12.
- Independent vacations now require age 18. Family trips become available at age 5, require a living parent/stepparent/grandparent while under 18, and draw the trip cost from the guardian's simulated household wealth rather than the child's personal cash.
- Dependent minors no longer pay ordinary baseline living, lifestyle, child, pet, property, vehicle, or debt-service costs from personal cash. Taxes still apply to actual taxable teen income.
- Negative cash while under 18 is normalized through tracked guardian support instead of being converted into an unsecured personal loan.
- Student or other explicit liabilities can still exist in state, but ordinary annual debt payments do not begin while the player is a dependent minor.

### Fixed

- Newborn characters could buy and sell securities.
- Newborn characters could initiate vacations and family trips.
- Newborns could use gym/running/walking/meditation/diet/martial-arts actions before any age eligibility existed.
- Newborns could also initiate pet adoption and collectible-market purchases if starting household cash happened to be high enough.
- A dependent child could reach adulthood already carrying ordinary personal insolvency debt because year-end shortfall handling treated minors like independent adults.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 51/51 regression cases pass.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 637,451, millionaire rate 40.5%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 840,742, millionaire rate 45.3%, zero anomalies and zero forced terminal deaths.

## 0.9.6 — 2026-09-04 — Action Economy & Exploit Hardening

### Added

- Central persisted action ledger with data-defined per-age limits and multi-year cooldowns. A single action can claim multiple limits atomically, such as both a yearly application budget and a one-attempt-per-listing rule.
- Save schema v6 with v5→v6 migration. Existing annual career/family action markers are preserved in the new ledger so updating a save cannot refresh already-used attempts.
- Read-only action-gate queries for React so mobile buttons can disable when their meaningful yearly opportunity has been spent, while the engine remains the authoritative enforcement layer.
- Anti-reroll regression coverage for job applications, wellness/stat grinding, NPC interaction grinding, publicity income, business launches/products, property renovation, collectible hunting, action-ledger migration, and failed-outcome engine notifications.

### Changed

- Job applications are limited to five serious attempts per age and one attempt per exact listing; a failed interview consumes the attempt instead of allowing infinite RNG retries.
- Freelance work, school effort, enrollment, wellness, treatment, rehab, risky habits, meeting people, NPC interactions, relationship milestones, fame posts/opportunities, travel, licenses, crime/prison actions, pet care, collectible hunting, business founding/product launches, and major special-career actions now use explicit yearly opportunity budgets or cooldowns.
- Time-intensive special-career actions now model annual opportunity cost: training, auditions, music releases/tours, pro-contract attempts, fights, campaigns, political moves, royal duties, modeling work, races, films, criminal-organization work, and specialized-organization decisions are bounded at the simulation layer.
- Major property renovations now have a two-age cooldown and improve condition without creating guaranteed immediate net-worth arbitrage.
- Business founding is limited to one company per age and each business can complete one major product launch per age.
- Collectible hunting is limited to four major acquisitions per age and one attempt per exact collectible definition.
- Relationship marriage/reconciliation milestone counters now live in `RelationshipSystem`, not the UI-facing engine wrapper, so headless/system callers cannot bypass them.
- Acting lessons now check adult affordability before consuming the yearly training opportunity; already-represented actors and already-committed sports paths reject duplicate setup actions.
- GameEngine now emits/autosaves failed outcomes when RNG, deterministic IDs, or the action ledger changed. A rejection, loss, failed audition, failed crime, or other consumed attempt therefore persists instead of silently becoming rerollable after a render/save boundary.
- React external-store subscriptions now use a private engine revision snapshot instead of mutable `GameState` object identity, so engine emissions reliably trigger UI updates even without an unrelated local React state change.
- Career, education, People, Activities, Assets, pet, business, collectible, and special-career mobile controls visually disable when the central engine policy says their opportunity is exhausted.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 47/47 regression cases pass.
- All 66 TypeScript/TSX source files pass a TypeScript syntax/transpile parse; the dependency-backed React/Vite build remains a GitHub Actions deployment gate.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 655,640, millionaire rate 40.7%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 823,294, millionaire rate 44.5%, zero anomalies and zero forced terminal deaths.

## 0.9.5 — 2026-09-04 — First Mobile Playtest Hardening

### Added

- Save schema v5 with migration support for family-planning state and targeted repair of the pre-0.9.5 runaway salary exploit.
- One-year pregnancy state for biological parenting; successful conception resolves into birth after the next Age Up rather than creating a child instantly.
- Compact mobile money formatting for million, billion, trillion and quadrillion-scale values.
- Regression coverage for senior-career experience gates, annual career-action limits, pregnancy timing, v4 exploit-save repair and extreme mobile money formatting.

### Changed

- Higher-level standard jobs now require actual relevant industry experience before they appear as qualified listings.
- A successful new hire prevents another job start in the same age.
- `Work harder` and `Ask for raise` are each annual-focus actions and cannot be spammed repeatedly within one age.
- Standard-career salary growth and raises respect a role-market ceiling instead of compounding without bound.
- Sibling first names avoid duplicates while unused regional names are available.
- PWA navigation uses network-first loading with cached offline fallback; service-worker registration explicitly checks for updates.

### Fixed

- Players can no longer become level-six executives at age 18–20 with no relevant work history simply by passing a difficult interview.
- Repeated same-year raise requests can no longer turn ordinary salaries into trillion/quadrillion-scale compensation.
- Repeated same-year `Work harder` actions can no longer instantly max performance/stress.
- Repeated family taps can no longer generate many independent births in the same year.
- Existing v4 saves that clearly match the runaway-compensation exploit are repaired on load: salary and impossible role level are normalized and the identifiable exploit-year net cash windfall is reverted. Existing children are never deleted by migration.
- Extreme money values no longer overflow the Life, Career and Assets mobile cards.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 37/37 regression cases pass.
- Neutral 1,000-life bulk run: median lifespan 81, median net worth 651,017, millionaire rate 40.7%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 819,767, millionaire rate 44.6%, zero anomalies and zero forced terminal deaths.

## 0.9.4 — 2026-09-04 — Estate Threads & Economic Calibration

### Added

- Multi-heir estate settlement with normalized living beneficiary shares, non-mortgage debt settlement, proportional investment division, deterministic retained-asset allocation, and fairness-driven liquidation of indivisible assets when necessary.
- Offscreen sibling inheritance accounting so NPC heirs receive their share instead of the controlled descendant inheriting every retained asset.
- Player inheritance from wealthy NPC parents, including lifetime inheritance and inheritance-count tracking.
- Continued-descendant preservation for established standard careers, spouses/partners, children and deeper derived family relationships such as grandparents and grandchildren.
- Wealth-source diagnostics for cash, property equity, investments, businesses, vehicles, collectibles and debt.
- Investment diagnostics for lifetime contributions, withdrawals, held cost basis and held market gain.
- Three-generation continuation regression and exact wealth-source reconciliation regression.

### Changed

- Fictional security long-run drifts and market-regime central tendency were reduced to fit Everthread's bounded relative economy. Volatility, bubbles and crashes remain intentionally meaningful.
- Annual finance processing now includes modest after-tax-income-scaled discretionary lifestyle spending for ordinary recurring consumption not represented by explicit purchases.
- Underwater property equity is reported as negative equity instead of being hidden at zero in balance diagnostics.
- A deceased player's NPC record now preserves its own parent links, allowing the next protagonist to derive grandparents after a generation handoff.

### Fixed

- Selected descendants no longer receive 100% of retained investments, properties, businesses and collectibles while siblings divide only cash.
- Wealthy NPC parents no longer skip the player when distributing inheritance simply because the player is not stored inside the NPC map.
- Adult descendants no longer lose an existing standard career when control passes to them.
- Generation handoffs no longer flatten deeper supported family relationships out of the playable relationship view.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 32/32 regression cases pass.
- Three sequential generation handoffs preserve lineage and pass state invariants in regression.
- Neutral 1,000-life bulk run: median lifespan 82, median net worth 686,454, millionaire rate 41.1%, zero anomalies and zero forced terminal deaths.
- Mixed-policy 1,000-life bulk run: median lifespan 82, median net worth 853,976, millionaire rate 45.6%, zero anomalies and zero forced terminal deaths.
- On the same neutral seeds, average held investment gain fell from roughly 1.54M before market calibration to roughly 257k after calibration; average lifetime inheritance is roughly 133k, confirming inheritance was not the primary wealth distortion.

## 0.9.3 — 2026-09-04 — Deterministic Replay & Balance Policies

### Added

- Save-persisted state-scoped runtime ID generation keyed by the life seed and a monotonic `idCounter`.
- Save schema v4 with explicit v3→v4 migration for deterministic ID state.
- Legacy rewind snapshots are migrated before restoration, including the new ID counter.
- Exact-history replay regression: two independent 50-year runs with the same seed/actions must serialize identically, including generated IDs and NPC/event history.
- Runtime-ID uniqueness regression across long generated lives.
- Six independent simulation decision policies: neutral, conservative, reckless, social, family-focused, and career-focused.
- Mixed-policy population simulation separate from life aspiration profiles such as academic, creative, athletic, entrepreneurial, and criminal.
- Wealth percentile reporting at p10/p25/p75/p90/p99.

### Changed

- Replaced all 71 wall-clock runtime ID creation sites in simulation systems with deterministic state-scoped IDs.
- Neutral simulation job selection no longer sorts primarily by maximum salary; career-focused policy retains deliberate salary optimization while conservative policy favors lower stress/risk.
- Investment, property, education, relationship, wellness, event-choice, and family behavior now vary by simulation policy.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 27/27 regression cases pass.
- Replay-safe 1,000-life bulk run completes with zero anomalies and identical aggregate results to the pre-ID migration baseline.
- Neutral 1,000-life run: median lifespan 83, median net worth 865,919, millionaire rate 46.6%, marriage rate 52.2%, zero anomalies.
- Mixed-policy 1,000-life run: median lifespan 82, median net worth 1,094,138, millionaire rate 52.6%, marriage rate 54.5%, zero anomalies.

## 0.9.2 — 2026-09-04 — Living World & Delayed Consequences

### Added

- Autonomous close-family NPC career selection using real job IDs, promotion/loss/retirement progression, wealth drift, linked partners, marriage/divorce/widowhood, bounded child generation, and inheritance to living children.
- Family-tree derivation for autonomous births, including niece/nephew and grandchild relationships where applicable.
- Bidirectional NPC-partner invariant checks and repair; player romantic partners are excluded from autonomous matchmaking.
- Delayed-event context payloads that can retain a specific NPC target and original decision age across future years.
- Persistent-target text templating for delayed consequences (`{NPC_NAME}`, `{NPC_FIRST}`, `{ORIGIN_AGE}`).
- Five first-class delayed-consequence chains: romantic secrecy, family financial favors, ignored health warnings, workplace shortcuts, and broken confidences.
- Four regression checks covering delayed target fidelity, cancellation when a required relationship disappears, origin-age context, and consequence-chain wiring.

### Changed

- Random/forced target-aware events can bind a persistent romantic, family, or friend NPC before the decision is shown, so prose and effects refer to the same person.
- Timeline entries generated by targeted events retain the affected NPC ID.
- Delayed relationship effects now explicitly resolve against the saved payload target rather than selecting another living relationship.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 24/24 regression cases pass.
- 1,000-life bulk run completed with zero detected structural anomalies and zero forced terminal-age deaths.
- Current audited content count: 679 event definitions, including 199 relationship-focused and 83 work/career events.

## 0.9.1 — 2026-09-03 — Verification & Simulation Hardening

### Added

- Deterministic regression suite with 18 core/integration checks.
- Headless multi-life simulation harness with full and bulk modes.
- 1,000-life bulk validation path and aggregate reporting for lifespan, wealth, education, career, marriage, children, crime, convictions, fame and death causes.
- Executable content audit.
- `DEVELOPMENT.md`, `CONTENT.md`, and `CHANGELOG.md` project continuity files.
- Economy-state fields for last cost/wage/housing index movement.
- Insolvency pressure handling: annual cash shortfalls become structured unsecured debt; sustained hardship can trigger foreclosure and bankruptcy.
- Mortgage affordability underwriting and a five-year post-bankruptcy mortgage restriction.

### Changed

- Event selection now uses category-indexed routine pools plus a small exact-probability rare-event pass instead of evaluating/rolling all 670 definitions every year.
- Economy indices now model bounded relative conditions instead of unbounded century-long nominal inflation.
- Existing standard-career salaries follow wage-index movement so long-held jobs do not become economically frozen.
- Achievement evaluation no longer runs redundantly twice on ordinary no-event age-ups; progress lookup and metric evaluation are cached per pass.
- Bulk simulations may suppress achievement/challenge evaluation and truncate timeline history for performance; full mode remains the correctness reference.

### Fixed

- Adult player dating generation can no longer create a minor potential partner.
- Biological-child action now validates the minimum parenting age of both participants.
- Duplicate active spouses are repaired by state invariants.
- Descendant continuation no longer pays retained asset value again as full liquid inheritance.
- Mortgages on retained inherited properties now remain in the descendant's liabilities.
- Descendant relationship reconstruction preserves parents, siblings, partners/spouses and children instead of flattening most surviving NPCs into friends.
- Annual business owner distributions are not credited a second time in finance processing.
- Death timeline ordering and legacy simulated-year double-counting issues identified in the foundation pass remain corrected.
- Foreclosure equity now offsets a cash shortfall exactly once and preserves any excess residual cash rather than double-consuming proceeds.

### Validation

- Engine TypeScript check passes.
- Test/harness TypeScript check passes.
- 18/18 regression cases pass.
- 1,000-life bulk run completed with zero detected state anomalies and no forced terminal-age deaths.

### Known follow-up

- Simulation policy over-optimizes investments and job selection, so its millionaire/career distributions are not yet neutral balance targets.
- Vehicle repossession, richer creditworthiness, and voluntary bankruptcy UI remain incomplete; engine-level shortfall debt, foreclosure, bankruptcy and mortgage underwriting now function.
- Exact replay is not yet guaranteed because generated object IDs still include wall-clock time.

## 0.9.0 — 2026-09-03 — Foundation Build

- Established Everthread: Life Unwritten branding and mobile application shell.
- Added authoritative `GameState`, seeded RNG, systems architecture, Age Up loop and timeline.
- Added character generation, relationships/family, education, standard careers, finances, health, crime/legal/prison, investments, businesses, property, pets, travel, fame and special-career foundations.
- Added death summaries, completed lives, legacy state and descendant continuation.
- Added IndexedDB persistence, settings persistence, save migration through schema version 3, JSON import/export, autosave and rewind-enabled snapshots.
- Added achievements/challenges, settings/past-life/sandbox sheets, mobile bottom navigation, event/death sheets, theme/accessibility controls and PWA scaffolding.
- Added large original content databases for events, careers, health, crimes, properties, pets, countries, achievements and challenges.

### Post-6C household finance / crisis UX correction candidate

- New lives now begin with $0 of personally owned cash while the generated two-parent household remains the source of ordinary childhood support.
- Ordinary living costs and debt service no longer attach to a household-supported player; age 18 now presents an explicit financial-independence decision before independent living costs begin. Purchasing a home establishes financial independence.
- Annual shortfalls still create transparent hardship debt for financially independent adults, but now immediately surface a Financial Pressure event with player-controlled response options. Existing due story events retain priority and defer the finance notice rather than being overwritten.
- Severe hardship no longer silently liquidates investments or auto-files bankruptcy. Bankruptcy remains an explicit player decision through the existing guarded bankruptcy authority.
- Legacy adult saves without the new support flag preserve prior independent-expense behavior. Save schema remains v12.
- Added 21 household-finance/crisis regression checks and updated insolvency regressions to protect player agency. Local engine/test TypeScript, full regression wall, and production build are green.
