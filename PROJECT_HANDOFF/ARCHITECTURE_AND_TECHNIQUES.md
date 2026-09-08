# Everthread — Architecture & Techniques

## Core ownership model

Everthread has one authoritative `GameState`. Preferred direction remains UI → `GameEngine` / system API → controlled state mutation → autosave / Age Up processing → UI render. React screens display state and request actions; they do not directly mutate critical simulation state.

## Determinism, saves, and yearly processors

Core simulation uses seeded RNG, state-scoped `makeStateId`, and no `Math.random()` for simulation state. Yearly processors that can award money, advance contracts, resolve projects/seasons, or create incidents must be idempotent per age. Current save schema remains 9; bounded primitive additions to existing flags/special-career tracks do not by themselves justify schema 10.

Real player saves are diagnostic evidence only. Generalize the failure shape into fabricated deterministic regression fixtures; never ship a tester's seed, IDs, NPCs, or history.

## Period accrual before end-state transitions

When an Age Up represents completed work, settle what was earned before changing end-of-period status. Sports and racing stamp final-period earnings before renewal/release/retirement. The stress consequence processor runs after annual finance settlement so a dismissal caused by that year's strain does not retroactively erase already-earned wages.

## Social worlds and affiliation history

`SocialWorld` owns school/work/career affiliation history. NPC objects own people; `Relationship` owns the current personal bond. Archive worlds/memberships rather than deleting them. Current affiliations sort above muted former affiliations in People, but former NPCs/history remain reachable.

## Commitment capacity and explicit exit state

`CommitmentSystem.ts` owns active special-career capacity, enrollment compatibility, and work/school restrictions. Outside school the limit is two established special paths; during active enrollment it is one.

Historical professional evidence and current commitment are different facts. A career may have credits/releases/bookings/seasons forever without remaining an active commitment forever. `SpecialCareerExitSystem.ts` therefore uses an explicit flat `leftPath` marker:

- professional history stays intact;
- `leftPath=true` overrides historical evidence for active-capacity calculations;
- successful professional re-entry clears `leftPath`;
- existing legacy over-cap saves preserve their paths;
- training/practice alone still does not establish acting/music/modeling as a professional commitment.

Do not clear historical counters to make a slot available. Current participation and lifetime history must remain separately recoverable.

## Unified deep-career lifecycle

`SpecialCareerLifecycleSystem.ts` is the normalization layer for acting, music, professional sports, modeling, motorsport, and directing. It does not replace path-specific cycle systems. It reads their authoritative fields and exposes a consistent lifecycle vocabulary for UI/gating: developing, active/between work, live project/season, pending offer, contracted, free agent, stepped away, and retired.

Keep these distinctions stable:

- **Stepped away (`leftPath`)** is a reversible voluntary exit that frees commitment capacity while preserving career history.
- **Retired** is a formal career end state. Acting, music, modeling, and directing may attempt a later comeback; professional sports and motorsport retirement is final for the current life.
- **Release/free agency** is an involuntary or contract-driven employment state, not retirement.
- **Between projects** is still an active professional path until the player explicitly leaves or retires.
- **Historical evidence** never reactivates a retired/left Career World by itself.

Same-age return after Leave Path or creative retirement is blocked by `CommitmentSystem.specialCareerReentryGate()`, which is consumed by `specialCareerStartGate()` and therefore shared by UI availability and `GameEngine` enforcement. This prevents lifecycle toggling from becoming a same-year reroll while keeping the low-level reactivation helper reusable for deterministic migrations/tests.

## Voluntary exit vs involuntary end state

Leaving by player choice is not the same operation as retirement, release, dismissal, or institutional removal.

Voluntary Leave Path or retirement can be blocked by a live binding commitment: acting/directing production, music tour, modeling campaign/representation term, sports contract, racing season/contract. Once that obligation ends the player may step away; formal retirement follows the same binding-obligation protection.

Involuntary end states remain allowed to supersede those restrictions when the owning lifecycle requires it. Examples include the existing hard-age sports retirement and employer/team release after repeated serious conduct incidents. A contract must not become immunity from consequences.

Inherited royalty is a life status rather than ordinary quit-able employment; future abdication should be its own lifecycle.

## Decision-based contract renewal

Offers create decisions, not silent buffs. Professional sports follows the established racing/modeling philosophy at term end:

- complete the final period and stamp salary first;
- end the old contract;
- if the team wants the player back, persist an exact renewal offer (team, term, salary, expiry);
- keep the exact team world active while a valid renewal is pending, but keep `pro=false` so no phantom season resolves;
- acceptance restores the contract on that same team;
- decline/expiry archives the former team and enters free agency.

A missing/corrupt team world must not consume the player's renewal action or silently destroy a pending offer.

## Stress is a risk pressure, not a deterministic punishment

`StressConsequenceSystem.ts` owns the cross-system high-strain framework.

- below 90 stress: no new high-strain incident modifier;
- 90–100: incident probability rises but remains capped below certainty;
- at most one new stress incident is generated per age;
- temporary fictionalized strain states can increase risk and decay with recovery;
- incident/review histories are bounded flat counters keyed to the authentic current institution/world, including separate full-time and part-time workplace records;
- three incidents make formal review possible; they do not guarantee dismissal, and dismissal closes only the exact affected employment/career institution;
- review outcomes use existing performance/standing and leader relationships where available.

The shared leader/rival influence layer consumes this pressure rather than duplicating another dismissal authority.

## Recovery is systemic player agency

Stress needs credible relief routes or it becomes a punishment meter.

- Meditation remains modest bounded recovery through the central wellness action budget.
- Therapy unlocks in the teen years, uses the same wellness budget, gives stronger relief, and can reduce temporary strain. Adult cost checks happen before action consumption.
- Spend Time can reduce stress after a successful relationship interaction; stronger close relationships generally provide more relief, while hostile relationships do not.

Recovery effects are owned by systems/GameEngine orchestration, not UI mutation.

## Procedural event target-role contracts

Event category alone is not enough to prove a story makes sense. Eligibility and target selection must operate over the same plausible NPC candidate set.

Reusable `target:*` tags can constrain minimum/maximum NPC age, adult/minor role, relationship subtype, or care-needs context. Existing procedural content can receive compatibility rules until content data is explicitly tagged.

If a relationship story cannot resolve a plausible target, it is ineligible rather than rendered with a generic person or allowed to mutate an unrelated relationship. This is how Everthread avoids newborns asking for adult favors, non-siblings appearing in sibling competition, and similar context failures.

## Contextual explanation UI rule

Gameplay surfaces should show state, choices, consequences, and immediately decision-relevant warnings. Developer/system explanation copy should not accumulate inside cards merely because a mechanic is complex.

When a new implementation needs explanatory context:

- add or update that screen's fixed header `ⓘ` contextual preview;
- keep the preview press-and-hold/touch-friendly and read-only;
- keep implementation explanations out of gameplay cards unless the player needs the text to decide what a visible action will do;
- dynamically auto-fit the preview's typography/spacing to the available pointer-relative viewport so the complete explanation remains visible without turning the preview into a scrollable documentation sheet;
- preserve accessibility: keyboard hold/release must mirror touch behavior, and explanatory text must not be hover-only in a way that excludes touch users;
- never let opening/holding the information preview consume an action, advance RNG, autosave an outcome, or mutate `GameState`.

This rule applies across Life, People, Activities, Career, Assets, and future primary screens.

## Central action economy

Every meaningful clickable action remains classified through `src/core/actionEconomy.ts`. Therapy reuses `wellness.total` + a `wellness.activity:therapy` target; sports renewal reuses the established professional-contract decision budget. UI disabled states should mirror system gates, while system/engine enforcement remains authoritative.

## Testing technique

High-value regressions include deterministic state comparisons, same-age idempotence, final-period accrual before status change, exact offer terms, archive-without-delete behavior, explicit exit/re-entry, lifecycle non-resurrection, plausible event target pools, and old-save compatibility.

Specialized suites currently cover core, special-career worlds, music, social affiliation, modeling, racing, coherence, stress/career freedom, event-target role coherence, commitment exclusivity, career/relationship coherence, special-career influence, contextual information, and deep-career lifecycle state. GitHub Actions remains the final dependency-backed semantic typecheck/build/deploy gate.

## Mobile-first technique

Primary widths remain 360 / 390 / 412 / 430px. Favor bottom navigation/sheets, 44px+ meaningful touch controls, compact readable cards, safe-area padding, contextual explanations, and concise decision-specific disabled states for locked commitments. The growing main application chunk remains a future code-splitting target.
