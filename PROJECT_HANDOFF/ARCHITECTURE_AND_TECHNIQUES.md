# Everthread — Architecture & Techniques

## Core ownership model

Everthread has one authoritative `GameState`. Preferred direction remains UI → `GameEngine` / system API → controlled state mutation → autosave / Age Up processing → UI render. React screens display state and request actions; they do not directly mutate critical simulation state.

The test-only AI interaction layer follows the same ownership direction: semantic command → `GameEngine` → controlled system mutation → semantic observation. It must never become a second gameplay engine.

## Determinism, saves, and yearly processors

Core simulation uses seeded RNG, state-scoped `makeStateId`, and no `Math.random()` for simulation state. Yearly processors that can award money, advance contracts, resolve projects/seasons, or create incidents must be idempotent per age. Current save schema remains 9; bounded primitive additions to existing flags/special-career tracks do not by themselves justify schema 10.

Real player saves are diagnostic evidence only. Generalize the failure shape into fabricated deterministic regression fixtures; never ship a tester's seed, IDs, NPCs, or history.

## Period accrual before end-state transitions

When an Age Up represents completed work, settle what was earned before changing end-of-period status. Sports and racing stamp final-period earnings before renewal/release/retirement. The stress consequence processor runs after annual finance settlement so a dismissal caused by that year's strain does not retroactively erase already-earned wages.

Residual economics are different from active employment. A completed music catalog may continue its bounded stream/royalty tail after the player steps away or retires. That passive income must not reactivate a Career World, advance active career years, or apply active manager/stress consequences. Existing signed distribution share/reach terms continue to govern those royalties.

## Social worlds and affiliation history

`SocialWorld` owns school/work/career affiliation history. NPC objects own people; `Relationship` owns the current personal bond. Archive worlds/memberships rather than deleting them. Current affiliations sort above muted former affiliations in People, but former NPCs/history remain reachable.

## Commitment capacity and explicit exit state

`CommitmentSystem.ts` owns active special-career capacity, enrollment compatibility, work/school restrictions, and player-facing same-age re-entry gating. Outside school the limit is two established special paths; during active enrollment it is one.

Historical professional evidence and current commitment are different facts. A career may have credits/releases/bookings/seasons forever without remaining an active commitment forever. `SpecialCareerExitSystem.ts` therefore uses an explicit flat `leftPath` marker. Completed history is preserved, `leftPath=true` overrides historical evidence for active-capacity calculations, and successful professional re-entry clears the marker. Do not clear historical counters to make a slot available.

## Unified deep-career lifecycle

`SpecialCareerLifecycleSystem.ts` is a normalized view/transition layer over existing path-specific state; it is not another source of truth. Acting, music, sports, modeling, racing, and directing can project developing, between work, project/season active, offer pending, contracted, free agent, stepped away, or retired states.

- `leftPath` is reversible voluntary step-away.
- Formal retirement is distinct from Leave Path.
- Acting, music, modeling, and directing may attempt a later-age comeback.
- Professional sports and motorsport retirement are final for that life.
- Same-age return after leaving/retiring is blocked to prevent lifecycle toggling from becoming a reroll/path-swap exploit.
- `careerPauseYears` accumulates inactive gaps on re-entry so career-year accounting can exclude retired/stepped-away years.
- Path-specific lifecycle owners remain authoritative when they already have richer retirement logic; player-facing motorsport retirement routes through `RacingCareerCycleSystem`.

## Voluntary exit vs involuntary end state

Leaving by player choice is not the same operation as retirement, release, dismissal, or institutional removal. Voluntary Leave Path/retirement can be blocked by a live binding commitment. Involuntary end states remain allowed to supersede those restrictions when the owning lifecycle requires it. A contract must not become immunity from consequences.

## Special-career story-chain ownership

`SpecialCareerStorySystem.ts` is a scheduler over existing state, not a new narrative-state authority.

- A new chain must originate from a real current or just-completed Career World and an exact persistent NPC selected from existing leader/rival influence state.
- The system stores only bounded scan/cooldown counters plus ordinary `DelayedEvent` entries. It does not add a second story graph to `GameState`.
- The opening beat is queued only after the age's career worlds/projects/contracts have processed, so story eligibility reflects the career state that actually survived the year.
- Story scanning uses a dedicated deterministic substream and does not advance the global `rngCounter`.
- `specialCareerStoryScanAge` makes the annual scan idempotent even when no story starts.
- At most one new career story starts per age, with a hard cap on queued special-career story beats before another opening can be added.
- Follow-up choices use the existing delayed-event scheduler with `npcSelector:'payload'`, which preserves the exact NPC across years. Required relationship-type metadata is used primarily as a living/connected-target validity contract.
- Social World history remains the affiliation record. A career NPC may later become a friend, enemy, romantic partner, spouse, ex, or other relationship type without losing the historical career connection.
- Follow-ups may occur after the original Career World is archived, but they must never reactivate that world merely to tell a story.
- Dead/invalid exact targets cancel the due follow-up instead of substituting another NPC.
- Story choices should preferentially feed systems already present—relationship/hidden opinion, NPC memory, stress, confidence, fame/reputation, finances, lifecycle gates, offers, or delayed consequences—rather than inventing isolated story-only stats.
- Story systems do not independently fire/release the player. Formal career end states remain with lifecycle/stress/path-specific owners.

## AI interaction testbench isolation

`src/tests/aiInteractionTestbench.ts` is a regression-only semantic interface, not a player feature.

- It is reachable only from test modules and the regression runner. `App.tsx`, `main.tsx`, player screens, and production systems do not import it.
- A supplied fixture is cloned before use. The caller-owned object is never the engine's mutable state.
- The clone is reassigned to an `ai-test-*` slot id so even a forced GameEngine save cannot use a player slot key.
- During the harness lifetime, `indexedDB` is disabled and `localStorage` is replaced with a private in-memory `Storage` implementation. The engine therefore exercises its ordinary save path while all writes remain disposable test-process memory.
- The harness flushes the engine save queue before restoring global persistence objects. Never restore persistence while a queued test save can still run.
- Testbench-only metadata—selected semantic screen, observations, diffs, transcripts, and invariant reports—must stay outside `GameState` and therefore outside save schema/migrations.
- Semantic actions use stable IDs and entity IDs, never screen coordinates or CSS selectors.
- Commands call public `GameEngine` methods. Do not reproduce the underlying outcome logic inside the harness.
- Availability reuses existing read-only gates/projections whenever practical. Relationship actions use the RelationshipSystem availability helpers; deep-career actions use commitment/exit/lifecycle gates.
- Pending required events impose an interface-level action lock so the semantic surface matches the real modal player flow.
- Private test setup commands may force deterministic fixtures/events, but they are not advertised as player actions and must not become production UI.
- Every executed command should immediately run state validation/invariant watches and emit a compact before/after diff so the exact corrupting interaction can be identified.
- Deterministic scenario transcripts should omit wall-clock persistence metadata such as `lastSavedAt` from their semantic comparison surface.

The testbench should grow alongside future player features. When a new player interaction matters to regression coverage, add a semantic command that routes to the same engine API rather than inventing a special testing mutation shortcut.

## Decision-based contract renewal

Offers create decisions, not silent buffs. Professional sports follows the established racing/modeling philosophy at term end: complete the final period and stamp salary first; end the old contract; persist exact renewal terms when offered; keep the exact team world coherent while a decision is pending; acceptance restores the contract; decline/expiry archives the former team and enters free agency.

A missing/corrupt team world must not consume the player's renewal action or silently destroy a pending offer.

## Stress is a risk pressure, not a deterministic punishment

`StressConsequenceSystem.ts` owns the cross-system high-strain framework. Below 90 stress there is no new high-strain incident modifier; from 90–100 incident probability rises but remains capped below certainty. At most one new stress incident is generated per age. Temporary fictionalized strain states can increase risk and decay with recovery. Three incidents make formal review possible; they do not guarantee dismissal.

Recovery remains systemic player agency through bounded wellness/therapy and qualifying successful relationship time.

## Procedural event target-role contracts

Event category alone is not enough to prove a story makes sense. Eligibility and target selection must operate over the same plausible NPC candidate set. Reusable `target:*` tags can constrain age, adult/minor role, relationship subtype, or care-needs context. If a relationship story cannot resolve a plausible target, it is ineligible rather than rendered with a generic or unrelated person.

Delayed chains with an exact payload target must preserve that exact target across future beats. A future story should cancel when its required target is no longer valid rather than silently rerolling to another NPC.

## Central action economy

Every meaningful repeatable outcome-generating action remains classified through `src/core/actionEconomy.ts`. UI disabled states should mirror system gates, while system/engine enforcement remains authoritative. Controlled lifecycle transitions such as Leave Path/Retire are system actions even when they do not consume a random-outcome opportunity. Required Age Up story events are consequences, not repeatable tap actions, so they do not need a separate action-economy policy.

## Contextual-information UI rule

Developer/system explanation copy belongs in the relevant fixed header `ⓘ` press-and-hold preview instead of being repeated inside gameplay cards unless the player needs the text to make an immediate decision.

- The header info button remains fixed while the floating preview follows the active press/pointer.
- The preview closes immediately on release/cancel/lost pointer capture.
- It is read-only and never consumes actions, advances RNG, autosaves an outcome, or mutates state.
- It measures rendered content and automatically reduces text scale to keep the complete explanation visible within available viewport space instead of becoming a scrolling mini-document.
- Immediate gameplay gating reasons may remain beside/under the relevant disabled action because the player needs them to make a decision.

4D8 story events themselves are gameplay content and therefore appear through the normal event-decision surface; they do not require explanatory paragraphs in Career cards.

## Additional special-career world technique

The six-deep `SpecialCareerWorldKind` is a lifecycle/story configuration type, not a requirement that every persistent special-career organization must join that union. For paths such as combat sports, prefer the existing generic `SocialWorld` + `Npc` + Relationship ownership model with a stable `special-<path>-*` ID namespace when doing so avoids widening unrelated deep-career maps.

- NPC identity/life history remains in ordinary `Npc` records.
- Organization membership/roles/groups/history remains in `SocialWorld`.
- Personal relationship type/score remains in RelationshipSystem state.
- The special-career track stores bounded metrics and exact recent IDs only; do not create a second roster or professional-relationship graph.
- Leave/retirement transitions archive current affiliation rather than deleting people/history.
- Read-only Career Identity projection may override an unrelated autonomous standard occupation while an NPC has an active special-career affiliation, but it must not mutate `NpcLifeSystem` career truth.
- Passive roster maintenance uses a dedicated deterministic substream where possible; outcome-generating player actions continue to consume the authoritative core RNG stream.
- People → Career Worlds should discover generic `special-*` organization affiliation rather than requiring path-specific People UI.
- Promote a path into a broader shared type only when several systems genuinely need the same lifecycle contract; do not broaden a type solely for presentation convenience.

## Player-visible systemic truth and agency

Material protagonist-facing simulation must not live only in hidden state. Everthread may simulate large amounts of background world activity, but when a process substantially changes the player character's life, relationships, wealth, legal status, health, career, family, assets, inheritance, or future options, the player needs an appropriate gameplay surface that explains what happened.

- Visibility and mechanical truth must share the same authority. UI previews/projectors read the owning system; they do not reimplement outcome math in components.
- When the fiction supports meaningful player choice, show enough consequence/context before commitment for that choice to be intentional. Do not silently auto-resolve decisions that are supposed to belong to the protagonist.
- After a major transition, preserve the important consequence in durable player-visible history (timeline/profile/asset/relationship state) so closing a modal does not erase understanding of what just happened.
- Background NPC/world simulation may stay summarized for scale. The moment background activity materially touches the protagonist, surface the relevant result without dumping internal simulation noise.
- Scale presentation with summaries, bounded windows, folders, progressive disclosure, and drill-down rather than deleting authoritative history or mounting every record at once.
- Player-facing copy explains gameplay cause/effect, not implementation internals. Developer diagnostics stay in QA/handoff tooling.
- Regressions for major systems should include parity checks where practical: what the player previewed/saw must match what the authoritative action ultimately applied.

This rule is cross-phase. Credit/debt, crime/legal outcomes, health, careers, fame, relationships, family, estates, businesses, politics, and future systems all inherit it.

## Testing technique

High-value regressions include deterministic state comparisons, same-age idempotence, final-period accrual before status change, exact offer terms, archive-without-delete behavior, explicit exit/re-entry, passive residual income without lifecycle resurrection, pause-aware career-year accounting, plausible event target pools, exact delayed-event target continuity, dead-target cancellation, bounded story queues, old-save compatibility, semantic interaction transcripts, read-only observation, exact-entity inspection, persistence isolation, and per-command invariant watches.

Specialized suites cover core, special-career worlds, music, social affiliation, modeling, racing, coherence, stress/career freedom, event-target role coherence, commitment exclusivity, career/relationship coherence, leader/rival influence, contextual information, unified lifecycle behavior, targeted special-career story chains, combat-career world behavior, and the AI interaction testbench. GitHub Actions remains the final dependency-backed semantic typecheck/build/deploy gate.

The existing workflow already runs `npm test` before production build. Keeping the AI suite inside `runRegression.ts` means a semantic interaction failure stops deployment without changing the mobile upload workflow.

## Mobile-first technique

Primary widths remain 360 / 390 / 412 / 430px. Favor bottom navigation/sheets, 44px+ meaningful touch controls, compact readable cards, safe-area padding, and explanatory disabled states for locked commitments. The growing main application chunk remains a future code-splitting target.
