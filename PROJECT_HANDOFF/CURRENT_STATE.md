# Everthread — Current State

Last handoff preparation: 2026-09-08  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

The latest fully green expanded baseline is commit `f11ff2aadc9df6d8ea7c9ef6e45dd8ed691f9243`.

- GitHub Actions run #44 (`34250769441`), job `102144340270`, completed successfully on 2026-09-08.
- Source-overlay import, dependency install, engine/test typechecks, the regression suite, production build, Pages artifact upload, and Pages deployment all passed.
- Run #44 expanded uploaded commit `f9bddaaad3a51b3960248fac6cb668a694494c4a` into the build-bot commit above.
- Phase 4D6 leader/rival consequences remain green from run #43.
- The contextual-information mobile polish is now also green: the fixed header `ⓘ` uses a press-and-hold floating preview that follows the pointer and disappears on release, while repeated Career World explanation paragraphs were removed from gameplay cards.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — Phase 4D7A special-career lifecycle foundation

Phase 4D7 is being split into bounded slices so retirement/end-state work does not destabilize the already-green deep career cycles. 4D7A establishes a shared lifecycle projection and transition layer for acting, music, professional sports, modeling, motorsport, and directing. It is **deployment pending** until the next uploaded overlay passes GitHub Actions.

### Shared lifecycle model

- New `SpecialCareerLifecycleSystem.ts` distinguishes not started, developing, active/between work, live project/season, pending offer, contracted, free agent, stepped away, and retired states without creating a second source of career truth.
- Existing path-specific fields, Social Worlds, `CommitmentSystem`, and `SpecialCareerExitSystem` remain authoritative inputs. The lifecycle system is a normalized view/transition layer over those sources.
- `leftPath` remains the reversible voluntary step-away state. Completed credits, releases, bookings, seasons, earnings, skills, reputation, NPC relationships, and archived Career Worlds remain history.
- Formal retirement is now distinct from stepping away. Acting, music, modeling, and directing may attempt a later-age comeback; professional sports and motorsport retirement are final for that life.
- Same-age return after stepping away or creative retirement is blocked by the shared `CommitmentSystem` start/re-entry gate. The same gate feeds UI availability and `GameEngine`, so the player must Age Up before attempting a return and lifecycle toggling cannot become a same-year reroll/path-swap exploit.
- Live binding obligations still block voluntary retirement: acting/directing production, music tour, modeling campaign/representation term, professional-sports contract, and racing season/contract.
- Existing forced retirement/release owners remain untouched. The shared voluntary retirement transition must not become a second dismissal authority.

### Persistent Career World protection

- Persistent Career World synchronization now explicitly treats `leftPath` and `retired` as inactive, even if historical counters or a legacy `active` flag remain present.
- A stepped-away or retired music/modeling/sports/racing career therefore cannot silently recreate a current organization merely because old releases, jobs, seasons, or other history still exists.
- Archived worlds and NPC relationships remain available as history.

### Contextual-information UI rule

Mavyy approved the contextual-information pattern as a permanent UI rule.

- Developer/system explanation copy belongs in the relevant header `ⓘ` preview instead of being repeated inside gameplay cards unless the player needs the text to make an immediate decision.
- The preview now measures its rendered content and automatically reduces its text scale when needed so the complete explanation remains visible within the available pointer-relative viewport area rather than becoming a scrolling mini-document.
- Career contextual information now includes compact lifecycle status for established deep careers in addition to the existing leader/rival influence projection.
- The preview remains read-only and does not consume an action, advance RNG, autosave an outcome, or mutate simulation state.

### Validation added in this patch

- New deterministic `specialCareerLifecycleRegression.ts` covers six-path lifecycle projection, reversible step-away, same-age return blocking, creative retirement/comeback, final athletic retirement, binding retirement gates, history preservation, RNG preservation, and persistent-world non-resurrection.
- `contextualInfoRegression.ts` now covers the pure auto-fit scale calculation in addition to read-only influence projection behavior.
- Existing stress/career-freedom tests remain compatible: direct helper reactivation still preserves the old low-level contract, while player-facing same-age return prevention is enforced by the shared commitment/start gate used by both UI availability and `GameEngine`.
- No save-schema bump is required; lifecycle markers remain bounded primitive fields in existing special-career tracks.
- GitHub Actions remains the authority for full semantic typechecks, all regressions, production build, and Pages deployment.

## Next after 4D7A is green

Continue with **Phase 4D7B — player-facing retirement/comeback and residual end-state economics**:

- expose compact lifecycle actions/statuses in Life Paths without reintroducing explanatory clutter;
- make retirement/comeback routes explicit for acting, music, modeling, and directing;
- keep sports/racing retirement final and coherent with their existing lifecycle owners;
- normalize any remaining annual processors that still infer current activity from historical evidence;
- preserve post-career residual economics where appropriate, especially music catalog royalties, without recreating an active professional world;
- regression-test Age Up after leaving/retirement so no phantom projects, seasons, career-year progression, or world resurrection occurs.

After 4D7 is fully green, proceed to targeted multi-year special-career event chains grounded in persistent NPCs and lifecycle history.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful player action stays in the central action economy.
- Formal dismissal/release must remain owned by the existing stress or path-specific lifecycle system; shared lifecycle/influence code must not become a second employment authority.
- Music's legacy annual lifecycle still derives some internal activity fields from release history; 4D7B must normalize that behavior around explicit left/retired state while deciding how residual catalog royalties continue after career exit.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The main production application chunk is still above the preferred size threshold and should eventually be code-split.
- Flat primitive special-career/flag records remain acceptable for this pass; schema 10 is not justified yet.
- Special Career World NPC role/income projection remains presentation-oriented; future exact NPC special-career compensation must integrate deliberately with `NpcLifeSystem` rather than layering another truth on top.
