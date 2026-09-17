# Astra Yuki location-scene handoff

This folder is the durable continuation point for Everthread's post-Phase-10 illustrated location rollout.

## Current certified status

- Newest certified gameplay/source: **Run #212** / `7dde94325f56a2f44172b5de65709700b5ad73ea`.
- Nightjar Diner is certified Location #8 and has passed direct Android/player acceptance.
- Dedicated scene totals: **8 scenes / 25 semantic groups / 48 scene action bindings / 16 selected Astra runtime assets**.
- Location Scene regression: **99/99**.
- QA-4 remains the final QA-infrastructure baseline: `core=81+1/82 specialized=76+1/77 overlap=0`.
- Save schema remains **17**.
- **Location #9 is deliberately unchosen.** Select exactly one remaining Astra-backed location only after a fresh repository owner/source/test audit.

## What is stored here

- `IMPLEMENTATION_PLAYBOOK.md` — the preservation-first implementation method used for Locations #1–#8.
- `CERTIFIED_SCENE_LEDGER.md` — which Astra scenes/assets are already runtime-certified and where.
- `PACKAGE_INVENTORY.md` — original Astra package counts plus the remaining 17 scene candidates.
- `SOURCE_REFERENCE/` — exact lightweight reference material from Astra Yuki's original v1 handoff: manifests, data, design docs, hotspot/UI SVGs, integration contract, prompt provenance, and validation metadata.
- `SOURCE_PACKAGE/` — checksum/reconstruction contract for the **exact original** `everthread-location-scenes-v1.zip`.

The full original Astra ZIP is 89,718,869 bytes. Because GitHub browser/mobile uploads cap each file at 25 MiB, its preservation contract uses four raw byte parts under `SOURCE_PACKAGE/parts/`. **Archive completeness is determined by presence + checksum, not this sentence:** if any of the four files listed in `SOURCE_PACKAGE/PARTS.sha256` is missing, finish that non-runtime archive upload before Location #9. The parts are not runtime assets. Reconstruct them only for source review; import exactly one chosen background/prop pair into `public/location-scenes/` per bounded certified scene slice.

## Fresh-chat bootstrap

A fresh Yuki should read, in this order:

1. `PROJECT_HANDOFF/CURRENT_STATE.md`
2. `PROJECT_HANDOFF/ROADMAP.md`
3. `DEVELOPMENT.md`
4. recent `CHANGELOG.md`
5. this file
6. `IMPLEMENTATION_PLAYBOOK.md`
7. `CERTIFIED_SCENE_LEDGER.md`
8. `PACKAGE_INVENTORY.md`
9. current `src/data/locationScenes.ts`, `src/systems/LocationSceneSystem.ts`, `src/components/LocationScene.tsx`, and `src/tests/locationSceneRegression.ts`
10. only then the Astra source references for the one candidate being audited.

Repository truth always outranks the Astra action map. The source package is design input, not an implementation mandate.
