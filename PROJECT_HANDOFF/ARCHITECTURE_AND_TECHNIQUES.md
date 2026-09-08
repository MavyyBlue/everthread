# Everthread — Architecture & Techniques

## Core ownership model

Everthread has one authoritative `GameState`. Preferred direction remains UI → `GameEngine` / system API → controlled state mutation → autosave / Age Up processing → UI render. React screens display state and request actions; they do not directly mutate critical simulation state.

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

Historical professional evidence and current commitment are different facts. A career may have credits/releases/bookings/seasons forever without remaining an active commitment forever. `SpecialCareerExitSystem.ts` therefore uses an explicit flat `leftPath` marker:

- professional history stays intact;
- `leftPath=true` overrides historical evidence for active-capacity calculations;
- successful professional re-entry clears `leftPath`;
- existing legacy over-cap saves preserve their paths;
- training/practice alone still does not establish acting/music/modeling as a professional commitment.

Do not clear historical counters to make a slot available. Current participation and lifetime history must remain separately recoverable.

## Unified deep-career lifecycle

`SpecialCareerLifecycleSystem.ts` is a normalized view/transition layer over existing path-specific state; it is not another source of truth. Acting, music, sports, modeling, racing, and directing can project states such as developing, between work, project/season active, offer pending, contracted, free agent, stepped away, or retired.

- `leftPath` is reversible voluntary step-away.
- Formal retirement is distinct from Leave Path.
- Acting, music, modeling, and directing may attempt a later-age comeback.
- Professional sports and motorsport retirement are final for that life.
- Same-age return after leaving/retiring is blocked to prevent lifecycle toggling from becoming a reroll/path-swap exploit.
- `careerPauseYears` accumulates inactive gaps on re-entry so career-year accounting can exclude retired/stepped-away years where a path derives duration from calendar age.
- Path-specific lifecycle owners remain authoritative when they already have richer retirement logic; for example, player-facing motorsport retirement routes through `RacingCareerCycleSystem`.

## Voluntary exit vs involuntary end state

Leaving by player choice is not the same operation as retirement, release, dismissal, or institutional removal.

Voluntary Leave Path/retirement can be blocked by a live binding commitment: acting/directing production, music tour, modeling campaign/representation term, sports contract, racing season/contract. Once that obligation ends the player may step away or retire if the relevant lifecycle allows it.

Involuntary end states remain allowed to supersede those restrictions when the owning lifecycle requires it. A contract must not become immunity from consequences. Inherited royalty is a life status rather than ordinary quit-able employment; future abdication should be its own lifecycle.

## Decision-based contract renewal

Offers create decisions, not silent buffs. Professional sports follows the established racing/modeling philosophy at term end: complete the final period and stamp salary first; end the old contract; persist exact renewal terms when offered; keep the exact team world coherent while a decision is pending; acceptance restores the contract; decline/expiry archives the former team and enters free agency.

A missing/corrupt team world must not consume the player's renewal action or silently destroy a pending offer.

## Stress is a risk pressure, not a deterministic punishment

`StressConsequenceSystem.ts` owns the cross-system high-strain framework. Below 90 stress there is no new high-strain incident modifier; from 90–100 incident probability rises but remains capped below certainty. At most one new stress incident is generated per age. Temporary fictionalized strain states can increase risk and decay with recovery. Three incidents make formal review possible; they do not guarantee dismissal.

Recovery remains systemic player agency through bounded wellness/therapy and qualifying successful relationship time.

## Procedural event target-role contracts

Event category alone is not enough to prove a story makes sense. Eligibility and target selection must operate over the same plausible NPC candidate set. Reusable `target:*` tags can constrain age, adult/minor role, relationship subtype, or care-needs context. If a relationship story cannot resolve a plausible target, it is ineligible rather than rendered with a generic or unrelated person.

## Central action economy

Every meaningful repeatable outcome-generating action remains classified through `src/core/actionEconomy.ts`. UI disabled states should mirror system gates, while system/engine enforcement remains authoritative. Controlled lifecycle transitions such as Leave Path/Retire are system actions even when they do not consume a random-outcome opportunity.

## Contextual-information UI rule

Developer/system explanation copy belongs in the relevant fixed header `ⓘ` press-and-hold preview instead of being repeated inside gameplay cards unless the player needs the text to make an immediate decision.

- The header info button remains fixed while the floating preview follows the active press/pointer.
- The preview closes immediately on release/cancel/lost pointer capture.
- It is read-only and never consumes actions, advances RNG, autosaves an outcome, or mutates state.
- It measures rendered content and automatically reduces text scale to keep the complete explanation visible within available viewport space instead of becoming a scrolling mini-document.
- Immediate gameplay gating reasons (for example, why a live contract prevents retirement) may remain beside/under the relevant disabled action because the player needs them to make a decision.

## Testing technique

High-value regressions include deterministic state comparisons, same-age idempotence, final-period accrual before status change, exact offer terms, archive-without-delete behavior, explicit exit/re-entry, passive residual income without lifecycle resurrection, pause-aware career-year accounting, plausible event target pools, and old-save compatibility.

Specialized suites cover core, special-career worlds, music, social affiliation, modeling, racing, coherence, stress/career freedom, event-target role coherence, commitment exclusivity, career/relationship coherence, leader/rival influence, contextual information, and unified special-career lifecycle behavior. GitHub Actions remains the final dependency-backed semantic typecheck/build/deploy gate.

## Mobile-first technique

Primary widths remain 360 / 390 / 412 / 430px. Favor bottom navigation/sheets, 44px+ meaningful touch controls, compact readable cards, safe-area padding, and explanatory disabled states for locked commitments. The growing main application chunk remains a future code-splitting target.
