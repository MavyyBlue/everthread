# Astra Yuki location-scene handoff

This folder is the durable continuation point for Everthread's post-Phase-10 illustrated location rollout.

## Current certified status

- Newest certified gameplay source: **Run #235** / `a1cfded8bc8453e16af955f3297bd2b8285ad3bf`.
- **Loomworks Business District is certified Location #14** (initial scene Run #234) and its actual-location workplace correction is certified in Run #235; direct Android/player acceptance is complete.
- Loomworks is an employment/application + company-services hub, not a universal workplace. Suitable ordinary full-time/part-time work resolves to real implemented location scenes and gains conditional **Your Workplace** UI there; locations preserve their original authored purpose. Unmapped jobs remain district-level rather than inventing a Loomworks workplace.
- The Astra archive-provenance closeout remains Run #222 / `0d33b637849d9aa7965997c3fef271af5d819b78`; its five-part source package remains non-runtime provenance.
- Dedicated scene totals: **14 scenes / 43 semantic groups / 83 scene action bindings / 27 selected Astra runtime assets**.
- Location Scene regression: **182/182**. Working Everthread and Living Map Projection: **50/50** each.
- QA-4 remains the final QA-infrastructure baseline: `core=81+1/82 specialized=76+1/77 overlap=0`.
- Save schema remains **17**.
- This docs sync also repairs stale Run #232 / “Location #14 unchosen” wording still present in the Run #235 certified handoff files. Gameplay source was unaffected.
- **Location #15 is deliberately unchosen.** After this documentation synchronization is Green, select exactly one of the remaining **11** Astra-backed locations; Mavyy may choose the creative candidate, followed by the normal fresh repository owner/source/test audit.

## What is stored here

- `IMPLEMENTATION_PLAYBOOK.md` — the preservation-first implementation method used for Locations #1–#14.
- `CERTIFIED_SCENE_LEDGER.md` — which Astra scenes/assets are already runtime-certified and where.
- `PACKAGE_INVENTORY.md` — original Astra package counts plus the remaining 11 scene candidates.
- `SOURCE_REFERENCE/` — exact lightweight reference material from Astra Yuki's original v1 handoff: manifests, data, design docs, hotspot/UI SVGs, integration contract, prompt provenance, and validation metadata.
- `SOURCE_PACKAGE/` — checksum/reconstruction contract for the **exact original** `everthread-location-scenes-v1.zip`.

The full original Astra ZIP is 89,718,869 bytes. GitHub's mobile/web commit path rejected 24 MiB parts (24 MiB = 25,165,824 bytes), so the preservation contract uses five raw byte parts under `SOURCE_PACKAGE/parts/`, each no larger than 20,000,000 bytes. **Run #222 certifies the archive as complete:** all five listed parts are present in the authoritative folder, repository blob identities match the generated chunks, no stray duplicate chunks remain, and reconstruction yields SHA-256 `220503b851ef4e49a79ff3bc553ca887effb7e23733de1ab2f6e30e555d2f3f1`. The parts are not runtime assets. Reconstruct them only for source review; import exactly one chosen background/prop pair into `public/location-scenes/` per bounded certified scene slice.

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
