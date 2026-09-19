# Astra Yuki location-scene handoff

This folder is the durable continuation point for Everthread's post-Phase-10 illustrated location rollout.

## Current certified status

- Newest certified gameplay source: **Run #238** / `1f3786df83a37a4756a2da670566b0ceeb5fc2b3`.
- **Everthread College is certified/player-accepted Location #15**: initial scene Run #237, player-driven campus-life/dorm revision Run #238.
- College's single Admissions Kiosk, living Library, and Residence Life preserve Education/SchoolWorld/Shared Lives/Working owners. Optional dorm residency belongs to ResidentialLife and is not a property/rent/loan authority.
- The Astra archive-provenance closeout remains Run #222 / `0d33b637849d9aa7965997c3fef271af5d819b78`; its five-part source package remains non-runtime provenance.
- Dedicated scene totals: **15 scenes / 46 semantic groups / 89 scene action bindings / 28 selected Astra runtime assets**.
- Location Scene regression: **205/205**. Residential Life **90/90**; Working Everthread **51/51**; Living Map Projection **55/55**.
- QA-4 remains the final QA-infrastructure baseline: `core=81+1/82 specialized=76+1/77 overlap=0`.
- Certified save schema is **18** because campus housing adds legitimate durable ResidentialLife state with deterministic empty-state migration.
- **Location #16 is deliberately unchosen.** After this documentation synchronization is Green, select exactly one of the remaining **10** Astra-backed locations; Mavyy may choose the creative candidate, followed by the normal fresh repository owner/source/test audit.

## What is stored here

- `IMPLEMENTATION_PLAYBOOK.md` — the preservation-first implementation method used for Locations #1–#15.
- `CERTIFIED_SCENE_LEDGER.md` — which Astra scenes/assets are already runtime-certified and where.
- `PACKAGE_INVENTORY.md` — original Astra package counts plus the remaining 10 scene candidates.
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
