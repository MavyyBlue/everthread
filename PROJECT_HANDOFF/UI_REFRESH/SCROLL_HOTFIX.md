# NPC profile scroll / navigation overlap hotfix

## Status and baseline

Mavyy reported that NPC profile content is cut off at the bottom and cannot be scrolled clear of navigation. Mavyy also asked whether Schedule a Date remained available. The Life/NPC refresh is certified by successful GitHub Run #240 (35424360146), expanded source 8a560ee15514425a85cca7b5973f89df246ffe8e, but player acceptance is blocked by this layout defect. This hotfix remains pending CI and Android acceptance.

## Root cause and bounded correction

PeopleScreen is a fixed, overflow-hidden screen with z-index 1. Its nested BottomSheet has z-index 80, but that value is trapped inside the screen's stacking context; the app navigation is z-index 25 outside it. The profile's scroll area can therefore end behind the navigation even at its maximum scroll position. Increasing only the nested sheet z-index would not escape that context.

Live DOM inspection reproduced this on the deployed Run #240 app: the sheet body's bottom was y=935 and navigation began at y=866, leaving 69px covered. The sheet's ancestor was .screen.people-workspace-screen with computed z-index 1; navigation was 25. These coordinates describe the remote browser viewport, not Mavyy's device dimensions.

The only runtime edit is src/screens/PeopleScreen.tsx. It renders the existing personSheet through React createPortal into document.body, following the already-established YukiThreadroom overlay approach. The existing sheet backdrop and bounded flex scroll body can now sit above navigation in the root stacking context. The shared BottomSheet, screen dimensions, scroll CSS, map, and gameplay owners are unchanged. Section buttons also reset the existing sheet-body scrollTop to zero, so switching from a deeply scrolled About view starts Memories or Interact at the top. The existing document-undefined fallback preserves non-DOM rendering.

## Schedule a Date verification

Retained path: NPC profile → Interact → Dating → Schedule a Date. Dating is a native expandable group. Existing canAskNpcOnDate / romanticDateTargetAvailability gates still apply; nothing in this hotfix changes them. Parents are not romantic candidates, so the parent profile shown in the report correctly lacks the option. Eligible mutually compatible teen/teen or adult/adult social candidates can be invited subject to existing relationship/commitment and annual invitation rules. An accepted plan shows Date planned and Cancel date plans, and completion continues at a compatible Map location.

## Verification

16 targeted DOM checks with real React DOM and JSDOM pass: body-level modal containment, absence from the clipped screen, preserved scroll-body element, section scroll reset, unchanged serialized game state on browsing, correct parent exclusion, portal close/unmount cleanup, eligible-friend invite visibility, correct Dating grouping, existing askOnDate routing, annual invitation exhaustion, accepted-plan cancellation, no duplicate invitation, and visible Date planned summary. These are DOM/interaction tests, not a layout engine or device scroll test. Fixtures are fabricated and contain no user save data.

Final canonical preflight evidence is in QA/scroll-hotfix-preflight.json and QA/scroll-hotfix-preflight.log. All six standard gates pass, with unchanged QA-4 coverage core=81+1/82 specialized=76+1/77 overlap=0 and all auxiliary stages. No tests or limits are removed. Runtime hash is recorded alongside the report.

Local verification uses the unchanged package-lock dependency tree restored earlier with npm ci, on Node 24.19.0. The source checkout matches the commit named by Run #240's certified artifact metadata. The archived certified source/dependencies were not restored; do not claim their hashes were verified. As in the initial UI refresh, the local tsx CLI needs a temporary node --import tsx launcher because its IPC socket cannot run here. This adapter changes only local node_modules, preserves every canonical runner and test invocation, and is restored after testing. It is absent from the overlay. CI uses its normal Node 22 setup.

Cloud Browser can inspect the deployed public app but cannot access localhost or file previews. The earlier URL-policy denial was respected. The new portal was checked in DOM tests; physical scrolling and post-deploy visual acceptance remain outstanding.

## Apply and accept

The ZIP is a format-1 overlay based on 8a560ee15514425a85cca7b5973f89df246ffe8e with no deletions. Require fresh GitHub certification and Pages deployment. Then on Android open a long NPC About section and scroll to the final content; it must be fully visible above the sheet bottom and navigation must not overlay the open modal. Switch among Interact/About/Memories after scrolling: each starts at the top. Close and reopen; verify People pan/zoom and navigation still work. Check an eligible unrelated dating candidate, expand Dating, and verify Schedule a Date or the existing accepted-date controls. Verify Yuki's dedicated room and its ordinary details route still close correctly. No save migration is required.
