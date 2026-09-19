# Astra source-package inventory

Original package: `everthread-location-scenes-v1.zip` · SHA-256 `220503b851ef4e49a79ff3bc553ca887effb7e23733de1ab2f6e30e555d2f3f1` · 89,718,869 bytes.

Astra v1 source counts:

- 25 illustrated location backgrounds
- 19 transparent PNG props
- 76 SVG hotspot guides
- 17 SVG UI assets
- 76 semantic interaction groups and 142 action definitions in the original design data
- offline review/prototype/source-generation material and implementation notes

These source counts are **not** runtime content counts. Only assets explicitly copied into `public/location-scenes/` by a certified slice are runtime assets.

## Already certified

- Location #1: **Weaver Park** (`weaver-park`) — Run #187
- Location #2: **Threadtone Music Studio** (`threadtone-music-studio`) — Run #187
- Location #3: **Central Everthread Bank** (`central-everthread-bank`) — Run #192
- Location #4: **Loomline Motors** (`loomline-motors`) — Run #203
- Location #5: **Hearthline Realty & Leasing** (`hearthline-realty`) — Run #205
- Location #6: **Threadwell Residential District** (`threadwell-residential`) — Run #207
- Location #7: **Crossroads Mall** (`crossroads-mall`) — Run #209
- Location #8: **Nightjar Diner** (`nightjar-diner`) — Run #212
- Location #9: **Pulseworks Gym** (`pulseworks-gym`) — Run #224
- Location #10: **Everthread Community School** (`everthread-school`) — Run #226
- Location #11: **Everthread Market / Grocery Store** (`everthread-market`) — Run #228
- Location #12: **Everthread City Hall** (`everthread-city-hall`) — Run #230
- Location #13: **Everthread Courthouse** (`everthread-courthouse`) — Run #232
- Location #14: **Loomworks Business District** (`loomworks-business-district`) — Run #234; physical-workplace correction Run #235
- Location #15: **Everthread College** (`everthread-college`) — Run #237; campus-life/dorm revision Run #238

## Remaining Astra-backed candidates

Exactly **10** source scenes remain unshipped. Do not preselect one from this list; perform a fresh owner/source/test audit against the newest certified repository first.

- `blackline-freight-yard`
- `everthread-air-terminal`
- `everthread-correctional`
- `everthread-defense-garrison`
- `everthread-general-hospital`
- `everthread-speedway`
- `everthread-stadium`
- `facet-modeling-agency`
- `public-safety-center`
- `silverframe-studios`

The original action map for any remaining candidate is advisory. If it requests gameplay Everthread does not currently own, narrow or reinterpret the scene around real owners rather than inventing a parallel system. Hearthline (no fake tenant lease-signing), Nightjar (no fake food/nourishment economy), Pulseworks (no scene-local combat challenge/lifecycle authority), School (no duplicate enrollment/peer truth or College locality leakage), Market (no hunger/consumable-grocery/pantry-budget shadow state), City Hall (no municipal ledger/permit-fee/election-scheduler or duplicate company authority), Courthouse (no shadow docket/lawyer inventory/sentencing ledger/legal wallet or prison/appeal leakage), Loomworks (employment/application hub only; real jobs use conditional workplace UI at suitable real venues, unmapped work stays district-level), and College (one admissions surface; Library reuses real classmates/groups; optional dorm residency belongs to ResidentialLife rather than Property/rent/loan truth) are precedent.
