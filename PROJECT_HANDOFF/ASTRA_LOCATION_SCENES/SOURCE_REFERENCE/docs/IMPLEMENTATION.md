# Implementation guide

## Source of truth

This handoff was grounded in `MavyyBlue/everthread`, inspected main snapshot `e1787ac018d47b580dd49ac9854c087fc07ec729`. The existing handoff identifies gameplay baseline `d3760daa841f21e4a73bd4a22bbcd5f6560b08a4`, Run 185, save schema 17. These are different roles: inspected source snapshot versus certified gameplay baseline. This package creates no new certification.

Verify changes since that snapshot before implementing. Start with [townPlaces.ts](https://github.com/MavyyBlue/everthread/blob/e1787ac018d47b580dd49ac9854c087fc07ec729/src/data/townPlaces.ts), `TownMapScreen.tsx`, `ActivitiesScreen.tsx`, `CareerScreen.tsx`, `AssetsScreen.tsx`, `SpecialCareerWorldPanel.tsx`, `CreditBankingPanel.tsx`, `GameEngine.ts`, `institutionRouting.ts`, and the shared-experience, residential-life, working-world and career-exit systems. Action definitions link their specific source owner.

## Navigation and component boundaries

Add a UI-only location route with the canonical `placeId`. A pin opens `LocationScene(placeId)`, replacing the legacy service-tab chooser. It must not mount a full Activities, Career or Assets page behind a sheet. Preserve the map’s camera, zoom, search and selected pin when returning.

Suggested components are `LocationScene`, `SceneObjectButton`, `LocationActionSheet`, `FocusedPanelHost`, and the existing global event/minigame hosts. Extract reusable leaf content from legacy screens rather than embedding their headers, tab strips or unrelated lists. The scene owns appearance and local navigation. Existing systems own records, eligibility, quotes, costs, rewards, randomness and mutations.

The UI route state may contain `{placeId, objectId, sheetStack, selectedTargetId}`. Do not add this navigation state to the save or increment the save schema for this redesign. Opening, closing, inspecting, searching, or returning to a room must not consume time, money, an action, RNG or a calendar advance.

Keep an explicit action allowlist keyed by `actionId`. The JSON `binding` field is documentation, not executable JavaScript: never use `eval`, string-based method lookup, or direct dynamic execution. `integration/scene-contract.ts` demonstrates the dispatch boundary. An unimplemented entry has an unavailable state, never a fallback to a generic screen.

## Scene geometry and layers

Every background is authored at 1024 × 1536. Reserve safe-area-aware header and footer space, then contain the image in the remaining rectangle. Do not use `cover`: cropping disconnects buttons from objects.

For available dimensions `W,H`, use `s = min(W/1024, H/1536)`, `artW=1024*s`, `artH=1536*s`, `left=(W-artW)/2`, `top=(H-artH)/2`. All JSON anchors and hit rectangles are normalized to this art rectangle, not the whole screen. A rectangle `[x,y,w,h]` becomes `[left+x*artW, top+y*artH, w*artW, h*artH]`. Recompute after resize, safe-area changes and larger text. Use the supplied geometry helpers or equivalent.

Draw layers in this order: environment, optional subtle ground shadow, transparent prop, semantic object buttons/highlights, location chrome. Local sheets sit above the scene; existing mandatory events and minigames retain the application’s established overlay priority. These are relative layers, not globally reserved z-index numbers.

Props include transparent padding. Use the recorded `alphaBounds` as the SVG viewBox around an `<image>` referencing the original PNG. `propPlacement.width` is a fraction of the scene width; cap visual height at `maxHeight` of the scene height; horizontally center the visible bounds and place their bottom at `baseline`. The prototype implements this exact algorithm. Do not stretch props, treat their padded square as their visual bounds, or bake the prop into the background.

The SVG hotspot assets are rectangle guides/highlights, not object cutouts. Use them selectively on focus/press if desired. Hit testing should use semantic buttons. Keep buttons at least 48 CSS pixels in both dimensions; if expansion would collide, use the always-available Things to do list. Narrow landscape and extreme text zoom should prioritize that list rather than squeeze the scene.

## Object menus and popup behavior

Every object opens only its declared `actionIds`. A short action sheet has the place label, object title, one supporting sentence, actions, and Close. A complex operation opens a focused second sheet or leaf panel for its specific records, target selection and quote. Keep that panel’s text scrollable independently of the scene.

Back order: dismiss a nested picker/confirmation, return to its object menu, close the object menu, then return from the location to the preserved map. Wire this to Android/system Back as well as visible Back and Escape. The offline specimen implements Escape and sheet controls; production system-Back integration is required. Do not silently navigate away during an unresolved engine transaction.

Use the existing minigame host for challenges, including the racing swipe/dodge and combat pattern-memory games. Preserve their skill-based alternatives and exact outcome application. After the existing host completes, restore the same place and present the engine result once. An interrupting mandatory event wins the established global priority; suspend local presentation, not game authority.

## Commands, gates and confirmations

Read current eligibility when rendering and recheck it immediately before dispatch. Also validate selected target IDs and item IDs at commit time. Never rely on a stale UI snapshot, action label, age-only shortcut, or disabled CSS. Disable repeat submission while a mutation is pending. Refresh projections after the existing engine completes and show its actual failure reason or result.

Music desk: use `leaveSpecialCareer('music')` and `retireSpecialCareer('music')` with their existing separate exit and retirement gates. Retain active-project and contract restrictions and completed history. The booth uses `musicRelease('song')` and `musicRelease('album')`; the rehearsal and record objects map separately. Do not substitute generic work retirement. Racing retirement must retain its owning wrapper where required.

A confirmation is mandatory for leaving a path, retirement, property/vehicle sales, borrowing, purchases and other consequential commitments. Show the current authoritative cost, obligations and consequence text before commit. A non-destructive command can run from its sheet when the existing game permits it. The design preview’s `risk` flag is an initial presentation hint; nested financial operations still require their own confirmation.

Companion choices come from current eligible NPC projections, never all known NPCs. Shared experiences and residential plans preserve their place/activity/plan IDs. Romantic dates require an accepted eligible date plan and the existing invitation flow. Do not turn a date hotspot into a shortcut that bypasses consent or relationship gates.

## Location-specific constraints

| Area | Required behavior |
|---|---|
| Realty | Preserve purchase, owned-home and landlord actions. Existing `rentProperty(id)` rents a property out; it does not sign a tenant lease. The inspected source has no tenant lease-selection/signing command. Display current rented residence from its projection; do not add fake working lease buttons. |
| Residential | Show the current household/residence projection. The illustrated buildings do not imply ownership. Preserve eligible household-plan logic. |
| Market / diner / mall | Filter existing personal-item inventory/catalogue entries by relevant kind. Never create arbitrary priced stock, nourishment mechanics or purchase APIs. Show an honest empty state if the catalogue has no relevant items. |
| Hospital | Expose existing checkups, active-condition treatments and relevant recovery/counseling choices. Preserve clinical eligibility and current action costs. |
| School / college | Preserve compulsory enrollment, age rules, existing school-world ownership, qualifications and program costs. Do not invent internships or admission paths. |
| Courthouse / public safety | Show legal status, pending cases and existing records. No general crime catalogue, fabricated police-report command, emergency-call command or police job board. |
| Correctional | Inmate actions only while actually imprisoned. Outside prison, use public/read-only status. Preserve existing prison challenge and case handling. |
| Airport | Existing temporary trips, age limits and guardian-funded family trips. This design adds no immigration/move-country system. |
| Blackline | Apply the exact existing `underworld_discovery` gate before route entry, preload, title, accessibility tree and action output. Preserve criminal-world eligibility. The general Crime catalogue is separate and must remain accessible under its own existing rules. |

Legacy actions without a map location must remain reachable through appropriate personal/phone/Life controls. This includes social media, general Crime, risky habits, unusual ventures/royalty, relevant personal collections/pets and boating-license flows. Do not attach these to the park or silently remove them. Keep their existing ownership and eligibility. Yuki Aster’s unique Threadroom retains its exact NPC-ID-based routing.

## Accessibility and states

Use real buttons with object names and `aria-haspopup="dialog"`; the number and sprite are decoration. Match keyboard order to the JSON `order`. Provide Things to do with the identical object/action set for screen readers, low vision, missed taps and art-load failure. No action depends on color, hover, precise artwork recognition or motion.

Trap focus inside the active dialog, focus its title on entry, support Escape/Back, and restore focus to the invoker. Closed overlays must not remain focusable. Respect reduced motion; keep press effects to a gentle outline/glow. Preserve 200% text zoom without clipped actions. Do not rely solely on the prototype’s 1.35× review switch as an accessibility test.

States to implement: loading artwork (skeleton plus usable list), ready, focus/pressed, unavailable (real reason), empty records (appropriate next step), submitting, engine error (retry only when safe), success, disconnected/missing-art fallback, and hidden/undiscovered. A missing image must not prevent an action list from opening. A missing adapter must never mutate state or navigate to a generic screen.

## Performance and rollout

Lazy-load the active scene and its one prop; do not preload all 25 environments. One decoded 1024 × 1536 RGBA background uses about 6 MiB, independent of compressed file size. Prefer an active scene plus at most one nearby cached scene, release stale references, and pause work while a mandatory overlay is active. Derive optimized web assets in the game build only after alpha/visual comparison; the included PNGs are originals.

Integrate park and studio behind a feature flag, validate routing and engine parity, then expand in small location groups. Reuse leaf panels; avoid duplicate mutation logic. Run the project’s required existing tests and real Android interaction checks before removing old route entrypoints. This package does not authorize or supply a save migration.
