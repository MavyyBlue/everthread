# Everthread — Life journal and NPC profile refresh

Status: implementation candidate on CI-Green Run #239. GitHub certification and Android/player visual acceptance are still required. This package is an overlay; it is not a standalone replacement repository.

## What Mavyy asked for

A sleeker, less cluttered player-facing UI that keeps Everthread's identity, especially NPC profiles. Your Life Timeline should be the Life page focal point without removing the player profile or Persistent Worlds.

## Shipped presentation changes

- Life: compact tappable avatar/name/profile row, four primary stats, collapsed Life & finances with visible Cash, collapsed Persistent Worlds with live active count/stable state, then the prominent Your Life Timeline. Profile and inventory still open through the established callback. Banking still uses CreditBankingPanel and the existing routed banking view. The Age Up control and all of its gates are retained.
- Timeline: stronger heading and spacing; quiet thread line and gold milestone detail. The existing bounded Timeline component, newest-first ordering, money/detail display and Show older entries control are unchanged.
- NPC: portrait/reveal or silhouette, relationship label, age/career summary and compact relationship/compatibility values. Interact is the default section; About contains identity, learned interests, connections, their life and shared worlds; Memories retains the existing five latest memories.
- Actions: Talk, Compliment and Spend time are prominent. Other actions remain available through named native details/summary groups. Empty relationship-choice groups are omitted using the same existing eligibility predicates. Disabled social actions show Used this year and the owner-provided explanation as a title. Dating shows Date planned when an accepted plan exists.
- Visual language: existing teal, gold, surfaces, typography and user-configurable appearance variables. No new raster art, remote fonts, UI libraries or dependencies. Phone stats use two columns through 520px; larger widths use four.

## Source and authority audit

Baseline commit: cd6d115c0db5b6a1513e5209976dafb999797c5a.
Verified successful workflow: https://github.com/MavyyBlue/everthread/actions/runs/35415723021 (Run #239).
Its certified-source artifact metadata names that exact expanded commit. Local git checkout matches the commit.

Only four runtime files change: src/screens/LifeScreen.tsx, src/screens/LifeScreen.css, src/screens/PeopleScreen.tsx and src/screens/NpcProfile.css. Existing callbacks, action gates, relationship/career/residential/date/gift projections and engine action calls remain authoritative. The change introduces no save fields, schema changes, RNG usage, runtime IDs, duplicated NPC identities, relationship values or economic state. Native disclosure open state and selected profile section remain local to UI. Selecting a new NPC resets the section and gift picker. Secret Yuki continues using the dedicated Threadroom route; only its optional ordinary details view shares the new profile presentation.

## Verification evidence and limits

The QA directory contains the final preflight report, full preflight log, component-check results and runtime file hashes. Canonical preflight passes 6/6 stages: engine, tests, app and node TypeScript, complete regression wall and production build. The existing QA-4 partition is preserved exactly: core=81+1/82 specialized=76+1/77 overlap=0; the four auxiliary wall stages also pass. Production transforms 241 modules. The pre-existing bundle-size warning remains.

16 component interaction checks pass using React's test renderer in a separate scratch test installation. They exercise player-profile and banking reachability, initial NPC interaction presentation, section navigation, preservation of the serialized state during browsing, About content, section reset on NPC selection, routing Talk to the existing conversation action, action exhaustion and deceased-NPC handling. They do not claim browser or visual coverage; test-only dependencies are not included in the product or lockfile.

Environment limitations are explicit:
- Downloading the certified artifact returned HTTP 403, so its archived source/dependency hashes could not be restored/verified. The exact certified commit was cloned and npm ci restored the unchanged checked-in package lock instead. Local Node is v24.19.0; CI uses Node 22.
- The default tsx CLI failed before running any test because its IPC socket was unavailable in this environment. For local verification only, node_modules/.bin/tsx was temporarily replaced with a launcher for the same installed tsx loader via node --import. The canonical npm scripts, QA runner, fixtures, partition checks, workers, limits and assertions were unchanged. The original local launcher was restored after validation. No launcher or node_modules payload is in this overlay.
- Cloud Browser could not reach localhost and explicitly disallowed file-protocol previews. No workaround was attempted after that denial. Responsive CSS was reviewed, but no screenshot, browser interaction result, pixel comparison or physical-device acceptance is claimed.

The report's commit identifies the baseline; it records a dirty candidate tree and is not a certification of that baseline alone. Runtime hashes bind the tested files to this overlay. A green local result does not replace GitHub certification.

## Integration and review

1. Check the current repository against the base commit before import. If main has advanced, reconcile these four UI files and run preflight again; do not blindly overwrite newer work.
2. Upload the overlay through the existing everthread-source.zip workflow. The bundle format is 1, base is Run #239's expanded commit, delete is empty. Do not upload node_modules or the temporary test tooling.
3. Require a fresh successful GitHub canonical preflight, certified artifact and Pages deployment before calling the change CI Green.
4. On Android, check 320/360/390/430px widths where available, large text, light/dark/custom themes and reduced motion. Confirm the timeline heading/events are visible early; primary stats wrap cleanly; Persistent Worlds expands to real conditions; finances and player profile/inventory remain reachable; the Age Up dock does not cover the last timeline entry.
5. Open familiar, unfamiliar, youth, adult, current partner, coworker and deceased profiles. Check all three sections, close/reopen and selecting another NPC. Check gift inventory, home/shared-world outings, date invitation/cancellation, partner/family gates and coworker concerns. Exhaust a social action and confirm the explanation. Revisit secret Yuki and verify the dedicated room still opens.
6. Check long names/careers/memories and old timeline pagination. Ensure keyboard focus remains visible on native summaries and section buttons. Native summary controls use 48–52px minimum height; profile section buttons use 48px.
7. After Mavyy accepts the player-facing result, synchronize current status and close the slice before returning to Location #16 or broader UI work.

Rollback: restore these four UI files from the baseline (remove the two newly added CSS files). This has no save migration to reverse.
