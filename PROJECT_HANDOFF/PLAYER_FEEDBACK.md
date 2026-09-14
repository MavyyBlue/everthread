# Everthread — Player Feedback & Issue Review

Player feedback is a first-class development input alongside GitHub Actions, regression suites, and direct playtesting.

## Authority boundary

Player reports are QA/development metadata, never simulation truth.

- Never store report queues or delivery metadata inside `GameState`, life saves, rewind snapshots, descendants, event queues, or gameplay history.
- Creating, viewing, submitting, retrying, exporting, sharing, or withdrawing a report must not consume gameplay RNG or mutate simulation state.
- Diagnostic capture is a bounded read-only projection. Never attach a complete save automatically.
- A green backend regression does **not** invalidate a player report. If backend authority is correct, continue into action binding, stale projections, render invalidation, navigation, disabled state, touch behavior, accessibility, presentation timing, and unclear UX.

## Current architecture

Feedback transport/status was certified through Run #111 and remains deployed in the current gameplay/source baseline: **Run #118 / expanded source `a4d04523e18128044c00f960f6db5fcd306a8237` / save schema 13**.

Central Feedback Inbox infrastructure:

- Supabase project: **Everthread**
- Project ref: `oyzcwkirqivbauqfqhbk`
- Region: `us-east-2`
- Public Edge Function: `everthread-feedback` (live version 2 adds token-authenticated player status read-back)
- Reports table: `public.everthread_feedback_reports`
- Review checkpoint: `public.everthread_feedback_review_state`, key `main`
- Rate-limit table: `public.everthread_feedback_rate_limits`
- Device report storage: `everthread-feedback-reports-v1`
- Device delivery metadata: `everthread-feedback-sync-v1`

The public game never receives database read access or a service-role/secret key. `anon` and `authenticated` have explicit deny policies and revoked table grants. The public Edge Function validates origin, report schema, interface/action/category IDs, payload size, and a bounded per-client submission rate before using server-side credentials. Supabase security advisors were clean after setup.

Each device creates a 32-byte cancellation secret for a report. The raw secret remains only in device-local delivery metadata; the database stores only its SHA-256 hash. Retried submissions are idempotent by report ID + secret. Withdrawal and player-visible status lookup require the same secret. Status lookup returns only safe lifecycle/disposition fields; internal triage notes and the rest of the inbox are never exposed to the public client.

## Player lifecycle

1. Open **Settings → Help & Feedback → Report issue or suggestion**.
2. Choose interface, action, report kind, and category.
3. Describe what happened and optionally include safe diagnostics.
4. Everthread saves the report locally first.
5. When online, the client submits it automatically to the central Feedback Inbox.
6. Failed deliveries remain local and retry on app startup, when the Feedback Center opens, and when the browser returns online. Startup retries are bounded to 10 reports per pass.
7. The player may Share/Copy/Export a JSON backup at any time.
8. After central receipt, **My Reports** can refresh the report’s review lifecycle and disposition using the private per-report token. Player-facing states are projections of authoritative `triage_status` / `resolution_class`; no second status ledger exists.
9. A reviewer may provide a bounded `player_message` for safe player-facing context. Never copy private triage notes into it.
10. **Cancel report** marks the local report withdrawn and propagates withdrawal to the central inbox when reachable.

A cancelled draft is discarded. A queued report that was never successfully delivered may resolve its remote withdrawal as “not found”; that is valid because no central report existed. A report that may have reached the server before a lost response is still safely withdrawable because retries reuse the same private cancellation secret.

## Future-Yuki mandatory review protocol

Before beginning a new implementation slice or after identifying a newly certified expanded source:

1. Identify the newest genuinely certified Everthread source and canonical Actions run first.
2. Read this file and `CURRENT_STATE.md`.
3. Query Supabase project `oyzcwkirqivbauqfqhbk` directly. Do **not** ask Mavyy to export JSON first when the connector is available.
4. Read `public.everthread_feedback_review_state` for key `main`.
5. Query active reports from `public.everthread_feedback_reports` where `status='queued'`, prioritizing `triage_status='new'` and reports received after the previous checkpoint.
6. Compare each report's `source_commit` with the newest certified baseline. A report from an older build may already be fixed, but it still requires verification before closure.
7. Group obvious duplicates while preserving every original report ID. Never overwrite one player's report with another.
8. Triage technical reports through backend authority first, then the actual interface path if backend checks are green.
9. Mark reviewed reports with `reviewed_at`, `reviewed_against_commit`, appropriate `triage_status`, priority, and notes. Use `duplicate_of` only when the duplicate relationship is clear.
10. When a player should see the outcome, set `resolution_class` and a concise `player_message`. Keep internal reasoning in `triage_notes` / `resolution_notes`; never expose those fields through the public endpoint.
11. After the review pass, update `everthread_feedback_review_state` with the certified commit used for review, the check time, the newest report receipt time seen when available, and reviewed-count snapshot.
12. Summarize the actionable queue in `CURRENT_STATE.md`; do not copy the entire database into the handoff.

If Supabase access is unavailable, say so explicitly and fall back to any supplied `everthread-feedback-inbox-*.json` files or pasted `ET-*` reports. Never conclude that there are no reports merely because the device-local queue is inaccessible remotely.

## Triage classes

Valid resolution classes:

- `backend_defect`
- `interface_defect`
- `experience_design`
- `expected_but_unclear`
- `suggestion`
- `unable_to_reproduce`
- `withdrawn_by_player`

For a real defect use:

`report → reproduce → locate authority → root cause → inspect dependencies → narrow fix → regression → connected suites → full wall → production build → canonical CI certification → resolution note`

A report is not resolved merely because a local patch works. Resolution should point to the fixing expanded-source commit, protecting regression, and canonical Actions run.

## Privacy / security rules

- Never expose Supabase service-role or secret credentials in Everthread source, Pages assets, reports, handoff docs, or player-visible UI.
- Do not add unrestricted Data API policies to make client code easier.
- Do not store raw IP addresses in the feedback database. The Edge Function uses a one-way request fingerprint only for short-window rate limiting.
- Do not put the cancellation secret inside exported report JSON or the report database row in plaintext.
- Do not accept arbitrary diagnostics blobs beyond the bounded report contract.
- Preserve RLS, explicit deny policies, server-side validation, body limits, and rate limiting when editing the feedback endpoint.

## Current queue snapshot

Last central review checkpoint: certified **Run #118 / `a4d04523e18128044c00f960f6db5fcd306a8237`**.

- Reviewed reports in checkpoint: **4**.
- `ET-20260913-A527E2A6`: **resolved → suggestion**, automatic-delivery/status test.
- `ET-20260913-55F088C9`: **resolved → suggestion**, independent-device submission/status test.
- `ET-20260913-0AA876B7`: **resolved → backend_defect**, fixed/deployed in Run #114.
- `ET-20260913-BE8649B9`: **resolved → suggestion**, fixed/deployed in Run #117. Early-life Activities and Career/Life Paths hide age-ineligible choices until unlock while gameplay guards remain authoritative.
- Central unresolved reports after the Run #118 review: **0**.
- Review-state checkpoint is advanced to `a4d04523e18128044c00f960f6db5fcd306a8237` with four reviewed reports; newest received report remains 2026-09-13 19:51:36 UTC.
- Player-visible disposition read-back remains certified and deployed.
- Phase 7B2 is certified in Run #118. Refresh the live inbox again immediately before beginning the next special-career Phase 7B slice.
