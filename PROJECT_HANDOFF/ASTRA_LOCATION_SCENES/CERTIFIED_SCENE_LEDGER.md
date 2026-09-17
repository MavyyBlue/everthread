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

Run #210 is a cross-scene dating-navigation hotfix rather than a new location. It made accepted `relationship.romance.pendingDate` plans consumable by every compatible scene action through declarative `companionPlan` metadata. Nightjar immediately reuses that contract for `date.diner`.

After Run #212 the certified scene totals are **8 / 25 / 48 / 16** (scenes / semantic groups / action bindings / selected Astra runtime assets).
