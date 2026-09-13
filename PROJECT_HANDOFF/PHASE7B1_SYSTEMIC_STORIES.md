# Everthread — Phase 7B1 Systemic Stories

## Status

**Local candidate is green; canonical GitHub Actions certification is pending.**

Certified base: Run #114 (`34780654179`) / expanded source `60bfa3eaecb574df5a74920cbc64f513055bae46` / package `0.12.0` / save schema **13**.

## Goal

Make concrete player choices resurface years later through the exact people and worlds involved. This slice deliberately starts with family/parenting, school, friendship, and romance because those systems already persist the identities and history needed for understandable long-term consequences.

## Ownership

- `ConsequenceSystem` remains the only scheduler/active-queue/history/cooldown authority.
- `state.delayedEvents` remains the only active consequence queue.
- `SystemicStorySystem` is stateless glue that requests consequences after authoritative actions; it owns no durable truth.
- `RelationshipSystem` remains relationship authority; NPC objects remain memory/hidden-opinion authority.
- `SchoolWorldSystem` / `SocialWorld.school` remain school-record authority.
- `systemicConsequenceEvents.ts` is content only. Its five probability-zero definitions never enter the 691-event random pool.
- `pendingEvent` remains the one unresolved player-facing event gate. Required same-age backlog must be resolved before Age Up proceeds.

## Candidate story set

1. **Parenting presence** — successful Spend Time with a `child` schedules a two-year exact-child memory follow-up. Dead/missing/non-child targets cancel.
2. **School conduct** — an executed academic shortcut schedules a two-year exact-school-world record follow-up. Resolution can alter that persistent school's conduct/social standing, which already flows into admissions.
3. **Friend argument** — Argue with a friend/best friend schedules a two-year exact-person conflict echo. It may still surface if the same relationship later becomes romantic or hostile, but estranged/missing/dead targets do not retarget.
4. **Reconciliation** — successful Reconcile schedules a two-year exact-partner check-in; it cancels if the relationship is no longer current romance before due age.
5. **Marriage expectations** — successful Marriage schedules a three-year exact-spouse check-in; divorce before due age cancels it.

All scheduling uses stable origin context, exact target refs, validity, chain IDs, and unresolved dedupe keys. Scheduling consumes no gameplay RNG. No new durable fields are required, so save schema stays 13.

## Event effects

Relationship story choices mutate the existing exact `Relationship`, NPC hidden opinion, and bounded NPC memories through normal `EventSystem` effect handling.

The school story adds `ChoiceEffect.school` for bounded deltas to `attendance`, `conduct`, and `socialStanding` on the exact `payload.worldId`. There is no current-school fallback: a missing referenced world cancels before surfacing. `{WORLD_NAME}` is rendered from the referenced SocialWorld rather than copied into persisted payload. School conduct/social-standing changes are exposed through `EngineResult.stateChanges` and feed the existing admissions profile.

## QA

Dedicated `phase7BSystemicStoryRegression.ts`: **33/33 locally**.

Coverage includes random-pool isolation, action wiring, exact NPC/social-world targeting, due ages, validity, no-retarget cancellation, dedupe without ID consumption, save round-trip, relationship evolution, spouse/reconciliation invalidation, exact school-name rendering, school-record mutation, admissions propagation, semantic state-change reporting, RNG-neutral direct scheduling, schema stability, and global invariants.

The complete regression wall is green locally: Core 82/82; Integrated Long-Life 105/105; Phase 7A Persistent Consequence 36/36; Random-event Coherence 77/77; Activity-specific Minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites green. Production build passes with Vite 7.3.6 at **167 modules**; the established main-chunk warning remains nonblocking.

The first full-wall attempt exposed a stale stress-harness assumption: a due same-age systemic consequence correctly blocked Age Up under Phase 7A rules. The harness now resolves required pending backlog and retries Age Up, preserving rather than weakening the production gate.

## Promotion rule

Do not call Phase 7B1 certified until the exact uploaded candidate is imported and canonical GitHub Actions passes both TypeScript gates, the complete regression wall including 7B1 33/33, production build, certified artifact restore smoke, and Pages deployment. After certification, synchronize Run/commit/artifact hashes in the handoff and promote the expanded source as the new baseline.
