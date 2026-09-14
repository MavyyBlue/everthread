# Everthread — Project Handoff

This folder exists for one purpose: let Yuki resume Everthread development accurately after a context limit, new chat, or long break without reconstructing the project from memory.

It is not player-facing documentation. It is the continuity layer for development.

## Read order for a fresh chat

1. `CURRENT_STATE.md` — what is verified, what is in progress, what comes next.
2. `PLAYER_FEEDBACK.md` — where player reports are reviewed, triaged, withdrawn, and turned into certified fixes.
3. `WORKFLOW.md` — how Everthread updates are built, packaged, uploaded, verified, and promoted.
4. `QUALITY_GATES.md` — what “done” means for each kind of change.
5. `ARCHITECTURE_AND_TECHNIQUES.md` — rules and techniques that protect saves, determinism, mobile UX, and existing systems.
6. `ROADMAP.md` — planned phases and implementation sequence.
7. Repository root `DEVELOPMENT.md`, `CHANGELOG.md`, and `CONTENT.md` — authoritative broader history and content counts.
8. Inspect the actual source files touched by the current phase before editing them.

## Non-negotiable continuity rules

- Current repository behavior is authoritative unless Mavyy explicitly changes direction.
- Preserve unrelated working systems.
- Never replace a working subsystem with a shortcut just to make a new feature easier.
- One authoritative `GameState`; critical mutations happen through systems/engine actions, not directly in React UI.
- Save compatibility, deterministic simulation, action-economy limits, mobile UX, and regression coverage are part of the feature.
- Material protagonist-facing consequences must be visible and understandable through gameplay surfaces; when meaningful agency exists, the player should see enough context before committing, using the same system authority that applies the result.
- A phase is not “green” until the dependency-backed GitHub Actions run passes type checks, regressions, production build, and Pages deployment.
- Every meaningful phase bundle must update this handoff folder in the same deployment so documentation does not drift behind code.
- Before new feature work, review the player-feedback snapshot and any supplied/exported active reports; a green backend regression never by itself invalidates a player-facing defect report.
- If this folder disagrees with the current repository, inspect the repository and repair the handoff rather than trusting stale notes.

## Fresh-chat restart instruction

A new chat should begin by reading this folder and the root project tracking files, then inspecting the exact source files named in `CURRENT_STATE.md`. Do not ask Mavyy to repeat already documented decisions. Continue from the recorded “Next implementation” section unless Mavyy changes direction.

Everthread is built as one interconnected simulation, not a collection of isolated feature pages.

- `PHASE6_CREDIT_DEBT.md` — closed Phase 6 credit/debt architecture and the Run #106 household-finance/crisis-agency closeout on schema 12.
- `PHASE7_PERSISTENT_CONSEQUENCES.md` — active Phase 7 plan and authority boundaries across 7A/7B/7C.
- `PHASE7C_WORLD_CONDITIONS.md` — certified Phase 7C contract, ownership, schema-14 migration, modifiers, UI projection, and QA gates. Phase 7 is closed.

- `PLAYER_FEEDBACK.md` — player report schema/lifecycle, future-Yuki inbox review protocol, triage classes, and the rule that backend-green reports still require interface/experience investigation.
