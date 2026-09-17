# Everthread Astra location implementation playbook

This is the method that produced the certified location-scene chain through Nightjar Diner. It exists so a fresh chat can continue without reverse-engineering eight prior slices or accidentally creating parallel truth.

## 1. Start from certification, never memory

Before choosing a location, identify the newest genuinely certified expanded source and restore/read that source. Read `CURRENT_STATE.md`, `ROADMAP.md`, `DEVELOPMENT.md`, recent `CHANGELOG.md`, the latest successful GitHub Actions run, and the current location-scene source/tests.

At this handoff checkpoint the certified gameplay/source is Run #212 / `7dde94325f56a2f44172b5de65709700b5ad73ea`, but a future chat must verify whether a newer certified expanded source exists and use it instead.

Do not begin implementation from an upload wrapper commit, an older artifact, or a local candidate directory.

## 2. Select exactly one remaining source scene after a fresh owner audit

Use `PACKAGE_INVENTORY.md` only to identify candidates. For the candidate under review:

1. Read its Astra background, prop, hotspot SVGs, `data/location-scenes.json`, `docs/LOCATION-BLUEPRINTS.md`, and `docs/ACTION-MAP.md`.
2. Locate the current Everthread Town Place and routing entry.
3. Locate every existing system that already owns the proposed actions/state.
4. Locate the current UI that exposes those owners.
5. Locate connected regression suites and save/determinism constraints.
6. Reject or narrow any Astra interaction whose gameplay authority does not exist in the certified source.

Ask: **Which existing system should own this?** If the answer is “a new scene-local ledger,” stop and redesign.

Examples already established:

- Hearthline artwork suggested leasing breadth, but certified Everthread did not own tenant lease-signing; the scene reused real property/mortgage/residence/landlord owners instead.
- Nightjar's broad counter concept was narrowed to six real Nightjar personal items because Everthread did not own a food/nourishment economy.
- Crossroads collectible browsing shows a read-only base estimate and never consumes RNG; the existing `PropertySystem` purchase action remains the only place that rolls price/authenticity/condition/value.

## 3. Runtime art import is intentionally tiny

The Astra source archive is non-runtime design input. For one scene slice, normally copy only:

- one selected background to `public/location-scenes/backgrounds/<place>.png`
- one selected transparent prop to `public/location-scenes/props/<prop>.png`

Do not copy the whole Astra source package into `public/`.

Use the original `asset-manifest.json`/`CHECKSUMS.sha256` to verify bytes. Backgrounds are authored at 1024×1536. Props include alpha bounds used to keep foreground placement inside the immersive stage. Hotspot SVGs are geometry/design references; the runtime semantic target remains the normalized `hitRect` stored in scene data.

## 4. `src/data/locationScenes.ts` owns scene presentation metadata

For the new scene:

- extend `LocationScenePlaceId`
- define any bounded scene-specific action ID type
- add actions to `LOCATION_SCENE_ACTIONS`
- add exactly one `LOCATION_SCENES` definition with label/tagline/background/prop/canvas/alpha bounds/prop placement/groups

Every action is one of three presentation contracts:

- `kind:'action'` — direct controlled engine/system action; no duplicated logic in the component
- `kind:'companion'` — social/date choice routed through `companionPlan`
- `kind:'panel'` — focused UI that reads owner projections and commits through existing `GameEngine`/system actions

Group `hitRect` values are normalized `[x, y, width, height]` stage coordinates. Keep large mobile touch targets and let the illustrated prop/background remain decorative rather than becoming simulation truth.

## 5. Date/social actions are declarative

Since Run #210, companion/date scene routing must be declared on the action itself:

```ts
companionPlan:{kind:'shared'|'date', placeId:'...', activityId:'...'}
```

`LocationScene`/`LocationSceneSystem` consume this generically. Do not add a hardcoded per-location companion registry.

For romantic dates, the NPC profile only schedules/accepts the existing `relationship.romance.pendingDate`. Compatible scene actions then surface that accepted NPC. Completing one date consumes the single pending plan everywhere through the existing Romantic Date owner. Do not create a calendar, reservation ledger, second invitation state, or scene-local date state.

## 6. `src/systems/LocationSceneSystem.ts` is projection/availability glue, not a new simulation owner

Use it for read-only scene projections and owner-backed availability. Typical responsibilities:

- project existing catalogues for the current place
- expose current owner status/gates to the scene
- enumerate eligible companions using Shared Experience / Romantic Date projections
- filter real residential/social/inventory/property options
- keep browsing deterministic and RNG-neutral

It must not create durable scene truth. No duplicate balances, inventory, relationships, residence records, debt, family links, date plans, or event queues.

If a legacy UI contains a duplicated eligibility rule needed by the scene, prefer moving that rule behind the authoritative system and making both old UI and scene consume the same helper. Do not weaken the rule.

## 7. Focused panels are thin adapters

Create a small domain panel only when a semantic object needs richer UI than a simple action/companion picker. Certified examples include:

- `BankLocationPanel`
- `MotorsLocationPanel`
- `RealtyLocationPanel`
- `ResidentialLocationPanel`
- `MallLocationPanel`
- `DinerLocationPanel`

A panel may format/read data and call controlled actions. It does not directly mutate critical state.

Nightjar is the clean example: `DinerLocationPanel` reads the real place-filtered personal inventory catalogue, displays existing ownership, uses `personalItemPurchaseStatus`, and commits via `gameEngine.purchasePersonalItem`. Cash, item instances, gifting, limits, and removal stay with their existing owners.

## 8. `src/components/LocationScene.tsx` remains the reusable shell

Preserve existing behavior:

- immersive full-bleed background/prop composition
- semantic object focus
- bottom-sheet detail presentation
- system Back/local unwind behavior
- safe-area/mobile ergonomics
- generic companion picker
- map state preservation

Add only the routing necessary for the new action/panel type. Prefer metadata-driven routing over another chain of location-specific special cases when the existing contract can express it.

## 9. Regression coverage expands the existing Location Scene suite

Do not create a new registered suite merely because a location was added. Expand `src/tests/locationSceneRegression.ts` unless a genuinely separate subsystem exists.

For each scene slice, cover at least:

- exact scene registration and action order
- exact semantic group/action mapping
- background/prop provenance and placement bounds
- availability/gating through the real owner
- read-only browsing/projection neutrality: no state, RNG counter, runtime-ID, or action-ledger mutation
- stale/ineligible companion handling
- actual successful owner commit for each new action family
- resulting authoritative state/timeline/history/accounting effects
- no duplicate execution from one player action
- preservation of every older scene

For shopping panels, prove purchase commits through the existing inventory/property owner. For date scenes, prove a scheduled accepted NPC becomes eligible and the authoritative pending plan clears on completion. For residential scenes, prove projections come from real households/residence. For finance/assets, prove liabilities/payoffs remain reconciled.

## 10. Validation ladder

Use this order:

1. focused Location Scene regression
2. directly connected owner suites
3. explicit Engine/Test/App/Node TypeScript gates when useful
4. full unchanged QA-4 wall
5. production build
6. canonical `npm run preflight`

QA-4 is closed infrastructure. The required handshake remains exactly:

`core=81+1/82 specialized=76+1/77 overlap=0`

Do not create QA-5, shorten the 25-life smoke, reduce Integrated Long-Life, or rewrite the runner to accommodate a scene slice.

If the caller times out while the canonical command is still running, do not call it Green. Run the **same** command detached and read its real exit/report. Never substitute a shortened command.

## 11. Overlay packaging

Package against the newest certified expanded source, not an upload wrapper. `everthread-patch.json` stays format 1 with an exact `base` commit and explicit `delete` list (normally empty).

Before handing Mavyy the ZIP:

- simulate the importer against an immutable certified source restore
- verify the exact persistent diff
- byte-compare every overlay output with the tested candidate
- verify no unexpected docs/workflows/dependencies/QA topology/save-schema files are present
- compute the ZIP SHA-256

Local success is only **candidate** status.

## 12. Certification and device gate

After upload:

1. identify the workflow run and wrapper
2. verify the importer-created expanded commit
3. verify the persistent diff exactly
4. require canonical preflight Green
5. require certified artifact upload Green
6. require Pages artifact/deployment Green
7. record source/dependency/lock/artifact hashes
8. only then call the slice CI-certified
9. perform direct Android/player acceptance
10. only after player acceptance, synchronize documentation/handoff

The next location does not begin until that synchronization certifies.

## 13. Mobile/device acceptance checklist

On the actual Android build check:

- entry from Town Map
- background and prop composition on narrow portrait screens
- semantic targets and large touch areas
- rapid open/close/reopen of focused sheets
- system Back unwinding before leaving the scene
- safe-area behavior
- repeated taps/double activation
- owner-specific success/failure messaging
- read-only browsing neutrality where relevant
- scheduled-date eligibility for date-capable scenes
- cold reopen/save persistence
- no duplicate money/items/relationship/date effects

## 14. Long-term rule

A location scene is a **window into existing Everthread systems**, not permission to create another version of them. The art may suggest interactions; the certified simulation decides what is real.
