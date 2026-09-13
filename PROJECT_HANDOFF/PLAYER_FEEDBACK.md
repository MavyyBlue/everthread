# Everthread — Player Feedback & Issue Review

This file defines the durable handoff protocol for player-reported technical defects, experience problems, and suggestions. Player feedback is a first-class development input alongside GitHub Actions, regression suites, and direct playtesting.

## Authority boundary

Player reports are **QA/development metadata**, not simulation state.

- Never store report queues inside `GameState`, life saves, rewind snapshots, descendants, event queues, or gameplay history.
- Creating, viewing, exporting, sharing, or withdrawing a report must not consume gameplay RNG or mutate simulation state.
- The reporting client may read a bounded diagnostic projection from the current life solely to help reproduction.
- Do not include the complete save by default. The v1 diagnostic packet captures build/source identity, save schema, game seed/RNG position, age/year/generation, current career, bounded system counts, selected settings, pending event identity, and recent timeline IDs.

The first implementation uses device-local `localStorage` under `everthread-feedback-reports-v1`, capped at 100 reports. It deliberately does **not** embed a GitHub token or other repository credential in the public GitHub Pages client. A future secure feedback service may replace or supplement the local/share/export path, but must preserve this report schema or provide an explicit migration.

## Player lifecycle

A player can:

1. open **Settings → Help & Feedback → Report issue or suggestion**;
2. choose the affected interface;
3. choose an action specific to that interface;
4. classify the report as **Technical issue**, **Experience issue**, or **Suggestion**;
5. choose a more specific category;
6. describe what happened or what they would change;
7. optionally include the safe diagnostic packet;
8. save the report to the device queue;
9. Share, Copy, or Export the report/inbox for review;
10. cancel a queued report, which marks it `withdrawn` rather than silently erasing review history.

Cancelling an unsubmitted draft simply discards the draft. Cancelling a queued report records a withdrawal timestamp/reason. If the player already shared/exported the original report, they should share/export the updated inbox so reviewers can see the withdrawal.

## Future-Yuki review protocol

On every context reset or before beginning a new implementation slice:

1. Identify the newest genuinely certified expanded source and canonical GitHub Actions run first.
2. Read this file and the **Feedback queue snapshot** in `CURRENT_STATE.md`.
3. Check the current conversation / Project files for any `everthread-feedback-inbox-*.json` exports or pasted `ET-YYYYMMDD-*` reports supplied by Mavyy or testers.
4. If a future secure feedback backend is documented here, query that authoritative inbox too. Do not invent one or assume a local device queue is remotely accessible.
5. Ignore reports marked `withdrawn` for active work unless another independent active report identifies the same problem.
6. Group obvious duplicates by interface, action, category, build/source commit, and symptom, while preserving the original report IDs.
7. Maintain an actionable list in `CURRENT_STATE.md` keyed to the certified commit against which the inbox was last reviewed.
8. Prioritize reproducible data-loss/save-integrity, crash, accounting, family/relationship corruption, determinism, Age Up duplication, and blocked-primary-action defects ahead of cosmetic suggestions.

## Triage rule: backend green does not invalidate a player report

For a technical report, use this order:

1. Reproduce the reported player path on the reported build when practical.
2. Identify the authoritative owning system and run the relevant backend/testbench/regression checks.
3. If the backend is wrong, classify **Backend defect** and fix the authority/root cause.
4. If the backend is correct, continue into the actual UI path: action binding, stale projection, render invalidation, navigation, disabled state, sheet/overlay state, touch interaction, focus/accessibility, presentation timing, or unclear result communication.
5. If mechanics and UI are correct but the player reasonably believed the feature was broken, classify **Expected behavior / unclear presentation** and improve the UX/copy rather than dismissing the report.
6. If technically correct but frustrating/confusing/repetitive/awkward, classify **Experience/design issue**.
7. If reproduction is inconclusive, classify **Unable to reproduce**; keep the report searchable so matching future reports can reopen it.
8. Suggestions are creative/product input, not failed tests.

Valid resolution classes:

- `backend_defect`
- `interface_defect`
- `experience_design`
- `expected_but_unclear`
- `suggestion`
- `unable_to_reproduce`
- `withdrawn_by_player`

## Fix workflow

For a real defect:

`report → reproduce → locate authority → root cause → inspect dependencies → narrow fix → regression → connected suites → full wall → production build → canonical CI certification → resolution note`

A resolved report should be traceable to the fixing expanded-source commit, the regression/suite that now protects it, and the canonical Actions run that certified it. Do not mark a report fixed merely because a local build works.

Repeated experience reports should be treated as design evidence even when no backend defect exists. Repeated technical reports that escaped CI should inform new regression or player-journey coverage.

## Feedback queue snapshot

Last reviewed certified baseline: **Run #108**, expanded source `1d8bb06619f6f5fb1ed8254edba4623dfdd9c406`.

- Active technical reports known to the repository/handoff: **0**
- Active experience reports known to the repository/handoff: **0**
- Active suggestions known to the repository/handoff: **0**
- Withdrawn reports known to the repository/handoff: **0**
- Secure centralized submission backend: **not yet present**

This snapshot only means no reports have been imported or supplied to the development context as of the listed certified baseline. Device-local queues on players' phones are not remotely visible. Update this snapshot whenever a newer certified commit is reviewed together with newly supplied/exported feedback.
