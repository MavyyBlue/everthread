# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `1ca34dfe3e89fc6053aa5755db6207980177020c`.

- GitHub Actions run #43 (`34248195297`), job `102135540104`, completed successfully on 2026-09-08.
- Source-overlay import, dependency install, engine/test typechecks, the regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Run #43 expanded uploaded commit `345c5948bf6e85c8f3b2bab7efd048b65515d172` into the build-bot commit above.
- Phase 4D6 leader/rival consequences are therefore green in the public build. The shared influence layer, delayed follow-ups, persistent NPC memories, career-cycle opportunity integration, and read-only contextual influence projection all passed the repository deployment gate.
- The earlier career identity / relationship consistency pass remains green: special careers project correctly on the Life profile, special Career World roles take presentation precedence over unrelated autonomous standard jobs, romantic exclusivity is enforced, and committed adults receive Hook Up rather than a duplicate Ask Out path.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — contextual information mobile polish

A small presentation-only patch is prepared for the header information control and Career Worlds sheet. It is **deployment pending** until the next uploaded overlay passes GitHub Actions.

### Press-and-hold contextual information

- The existing header `ⓘ` control remains in the same fixed app-bar position.
- Instead of opening a persistent bottom sheet, pressing and holding the control opens a compact floating explanation next to the active pointer/touch position.
- The preview follows pointer movement while the press is held, clamps horizontally to the viewport, flips above/below the pointer based on available space, and disappears immediately on pointer release/cancel/lost capture.
- Keyboard Enter/Space gets the same hold-to-preview lifecycle and closes on key release or blur.
- The preview is pointer-transparent/read-only and does not consume an action, advance RNG, autosave an outcome, or mutate `GameState`.
- The control uses pointer capture plus `touch-action:none` only on the info button so holding it does not accidentally scroll the page while the floating explanation follows the finger.

### Career Worlds explanation cleanup

- The repeated inline paragraph explaining `Build chemistry`, `Seek guidance`, and `Ease rivalry` has been removed from every active Career World card and moved into the Career contextual-information preview.
- The music-only paragraph explaining that a collective persists independently from distribution deals has also moved out of the Career World card and appears in contextual information only while an active music world exists.
- Dynamic Career World facts, offers, audience/catalog state, contracts, seasons, campaigns, chemistry/prestige/rivalry metrics, and action buttons remain unchanged.
- The compact contextual preview retains the live 4D6 leader/rival influence projection without creating another simulation authority.

### Validation for this patch

- The patch touches presentation only: `ContextualInfoButton.tsx`, `SpecialCareerWorldPanel.tsx`, and this handoff file. No save/schema, action-economy, RNG, or simulation processing changes are required.
- Static source checks confirm the two long Career World helper paragraphs no longer render inline and their information is present in the contextual-info component.
- Local TypeScript transpilation/syntax checks are used where available in the sandbox; dependency-backed semantic typecheck, regressions, production build, and Pages deployment remain GitHub Actions' authority.

## Next after this UI patch is green

Continue the Phase 4D deep-cycle roadmap with broader retirement/end-state handling across older special paths, then targeted multi-year special-career event chains grounded in the persistent NPCs and consequence state established by 4D6.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays in the central action economy.
- Formal dismissal/release must remain owned by the existing stress or path-specific lifecycle system; leader/rival influence must not become a second employment authority.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk is still above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
