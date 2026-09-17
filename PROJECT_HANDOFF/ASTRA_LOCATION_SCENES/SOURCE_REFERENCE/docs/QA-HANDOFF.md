# Verification and integration acceptance

This is a design kit, not an integrated build. `review/validation.json` records structural and asset checks. The static overview and contact sheets were visually inspected. The JavaScript syntax is checked. The local browser walkthrough could not run because session policy blocked local preview URLs; no browser execution or live-game regression pass is claimed.

The preview has intentional fixtures: Alex is a sample companion; prices, catalogues, records, availability and blocked reasons are samples; challenge buttons show a return specimen rather than a playable minigame. Some leaf panels demonstrate only layout and record hierarchy. Implement the real leaf forms using their owning systems before enabling those actions in the game.

## Required integration checks

1. Open all 25 canonical pins (apply discovery rules first); each opens its matching scene and returns to the same map camera. Confirm all 29 legacy map service entrypoints have a focused destination.
2. Studio desk shows Leave Music Path / Retire / Close; booth shows Release Song / Release Album / Close. Park never exposes Social Media, general Crime or Healthcare tabs.
3. Compare game state before/after scene browsing, opening/closing sheets, list search and cancellation: no state mutation, RNG consumption or calendar advance.
4. Recheck eligibility on dispatch. Verify unavailable, retired, active-project, empty-record and age-boundary states using existing game fixtures.
5. For each bound operation, compare cost, time, result, saved records and notifications against its previous owning flow. One tap commits once; double taps, Back and errors cannot duplicate a mutation.
6. Test financial quotes and confirmations, landlord versus tenant semantics, accepted date targets, compulsory school, prison status and exact Blackline discovery. Retain non-map actions elsewhere.
7. Complete racing and combat challenges through their existing hosts, plus skill alternatives. Confirm a single result, correct interrupted-event order, and return to the same room.
8. Inspect 360/390/430 px phones, tablet, landscape, safe areas, light/dark themes, 200% text zoom, reduced motion and artwork failure. Check readable labels and non-overlapping expanded targets.
9. Test keyboard Tab/Shift-Tab, Escape, Android Back, TalkBack reading order, focus trapping/restoration, and the equivalent Things to do list.
10. Measure cold loading and decoded memory on an Android device. Preserve save schema 17 unless a separately approved gameplay change requires otherwise. Run the repository’s current required gates before release.

Known limitations: some secondary interaction targets are painted into the environment, not separate sprites; no character animation is included; no real tenant lease-signing API exists in the inspected source; the standalone prototype has no Android history integration and no persistent state. These are documented boundaries, not completed gameplay features.
