# Certified location-scene ledger

These are the Astra-backed scenes already integrated into runtime. Do not re-import or create alternate owners for them.

| # | Scene | Run | Expanded source | Runtime background | Runtime prop |
|---:|---|---:|---|---|---|
| 1 | Weaver Park | #187 | `c68757f75f38f76fc616589450b1a39b41e1b6d0` | `assets/backgrounds/weaver-park.png` · `bd4596b29bee…` | `assets/props/park-bench.png` · `dc5f6997b4e7…` |
| 2 | Threadtone Music Studio | #187 | `c68757f75f38f76fc616589450b1a39b41e1b6d0` | `assets/backgrounds/threadtone-music-studio.png` · `f0856578d2d1…` | `assets/props/producer-desk.png` · `595a4f095768…` |
| 3 | Central Everthread Bank | #192 | `1f5c8d598b6f277f26ffda5d7683d7474141200e` | `assets/backgrounds/central-everthread-bank.png` · `3a0ce1037162…` | `assets/props/service-kiosk.png` · `f2c1753dab0e…` |
| 4 | Loomline Motors | #203 | `bde2f4a7498c2b677f27f8c805372ceb9019ef95` | `assets/backgrounds/loomline-motors.png` · `6ee2b67b5ce2…` | `assets/props/showroom-car.png` · `c42a557d32f5…` |
| 5 | Hearthline Realty & Leasing | #205 | `5ea3d448a90c8b82044d33b5f4e31ef99e5b80e9` | `assets/backgrounds/hearthline-realty.png` · `864246397fa4…` | `assets/props/home-model.png` · `033b7f1b227a…` |
| 6 | Threadwell Residential District | #207 | `90e16923efa896da52750e7241b5387ca02da1ad` | `assets/backgrounds/threadwell-residential.png` · `36fff3545a82…` | `assets/props/neighborhood-board.png` · `99e9b64315a7…` |
| 7 | Crossroads Mall | #209 | `487ea66dd589bf7d35efce29ab8ebba8a5313b44` | `assets/backgrounds/crossroads-mall.png` · `a5bbcf760b9e…` | `assets/props/shopping-display.png` · `8ecac9fa34b7…` |
| 8 | Nightjar Diner | #212 | `7dde94325f56a2f44172b5de65709700b5ad73ea` | `assets/backgrounds/nightjar-diner.png` · `75b96fd0517b…` | `assets/props/diner-table.png` · `82b42285b9f5…` |
| 9 | Pulseworks Gym | #224 | `08a27517d42081ddb22c6587308a15da55669d2c` | `assets/backgrounds/pulseworks-gym.png` · `37e765635d61…` | `assets/props/fitness-bench.png` · `84533c2f1bb8…` |
| 10 | Everthread Community School | #226 | `72666ff23d167c4088bde1b13fd5a1a121bf45af` | `assets/backgrounds/everthread-school.png` · `7d4d8765ead3…` | `assets/props/student-desk.png` · `55c28824a9e4…` |
| 11 | Everthread Market / Grocery Store | #228 | `96042ae010c5962f59b466c89e82bce0c2bf9a5c` | `assets/backgrounds/everthread-market.png` · `813943fc560b…` | `assets/props/grocery-cart.png` · `2b3842409d91…` |

Run #210 is a cross-scene dating-navigation hotfix rather than a new location. It made accepted `relationship.romance.pendingDate` plans consumable by every compatible scene action through declarative `companionPlan` metadata. Nightjar immediately reuses that contract for `date.diner`.

Run #224 adds Pulseworks as a thin projection over existing wellness, Shared Experience `gym_session`, and Romantic Date `gym_session` owners. Astra combat challenge/lifecycle controls remain deliberately unshipped in this bounded slice rather than creating a parallel combat/minigame authority.

Run #226 adds Everthread Community School as a thin projection over `EducationSystem`, `SchoolWorldSystem`, current-school peer truth, Shared Experience `school_social`, and existing institution locality. College/external-school truth remains outside the Community School scene.

Run #228 adds Everthread Market / Grocery Store as a thin projection over the existing Everthread Market Personal Inventory catalogue/ownership/purchase path plus the existing wellness `diet` action. Hunger, consumable grocery quantities, pantry state, and alternate household-budget truth remain deliberately unshipped.

After Run #228 the certified scene totals are **11 / 34 / 63 / 22** (scenes / semantic groups / action bindings / selected Astra runtime assets).
