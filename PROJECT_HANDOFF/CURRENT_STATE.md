# Everthread — Current State

Last handoff preparation: 2026-09-07  
Repository: `MavyyBlue/everthread`  
Default branch: `main`  
Public build line: `0.12.0 pre-release`  
Current save schema: `9`

## Last fully verified repository baseline

`main` is `2dccb47ba0a27587cfda7ff48402b558b7100ee2`, tree `b7024d7ee5a0de49a839d880d0b232376191efe6`.

- Phase 4D5 Racing is green.
- The pre-4D6 coherence pass is also green.
- GitHub Actions run #32 (`34148978761`), job `101827001795`, passed overlay import, engine/test type checks, every regression suite, production build, Pages upload, deployment, and cleanup.
- Run #32 uploaded head: `53df92eab41719416feaaf6eeb4bff07736cacc4`.
- Expanded bot commit: `2dccb47ba0a27587cfda7ff48402b558b7100ee2`.
- Run #32 reported core 82/82, special-career 77/77, music 76/76, social-affiliation 23/23, modeling 46/46, racing 86/86, and coherence 37/37: **427 checks passed**.
- Production build transformed 104 modules and deployed successfully to GitHub Pages.
- Pages artifact: `10028684986`, 760367 bytes, SHA-256 `d3f2d9b635b0d6fae6a2a072856616e2ec349064dfac6ec67b71d44788cc4f63`.
- The primary application chunk was 726.49 kB minified / 208.88 kB gzip. Code splitting remains a visible later performance task, not a current release blocker.
- Save schema remains 9.

Real player saves remain diagnostic evidence only. Personal save JSON, seeds, slot IDs, NPC IDs, character names, and histories must never be copied into production/default fixtures.

## Current work — pre-4D6 stress, recovery, career freedom & event-role coherence

This integrated pass is implemented and locally validated, but remains **deployment pending** until a GitHub Actions run proves the exact overlay.

### Stress consequence framework

- Stress below 90 does not receive the new high-strain incident modifier.
- At 90+ stress, deterministic probability rises toward 100 stress but never reaches certainty.
- Temporary gameplay strain states are `Burnout`, `Emotional Volatility`, and `Chronic Strain`; they are simulation modifiers, not clinical diagnoses.
- At most one new stress incident can be generated per age.
- Full-time and part-time workplace incidents can be mistakes, conflicts, or minor accidents and feed the exact job record, workplace tension/reputation, health, relationships, and persistent per-workplace incident counts.
- School incidents can affect attendance, conduct, academic performance, happiness, and school relationships.
- Persistent special-career worlds can receive strain-related professional mistakes/conflicts/accidents.
- Three incidents create review eligibility rather than automatic firing/dismissal. Reviews consider performance/standing, leader relationship, incident count, and current stress.
- Ordinary full-time or part-time work can end in a warning or dismissal without mutating another employer; post-secondary school can result in probation or dismissal; compulsory school uses support/discipline rather than automatic expulsion.
- Contracted special careers can still be involuntarily released for serious repeated incidents. Voluntary contract restrictions do not provide immunity from employer/team consequences.
- Stress consequences run after annual finance settlement so work already completed that year remains paid/taxed even if the position ends afterward.

### Recovery

- `Spend Time` now also reduces stress when the relationship is healthy; relief scales with relationship strength and closeness.
- Hostile relationships do not function as free stress recovery and can feel tense instead.
- Existing Meditation remains the modest broadly available recovery action.
- Therapy unlocks at age 13, uses the existing wellness action economy, removes substantially more stress, and reduces temporary strain severity.
- Therapy is guardian-supported for minors in the simulation; independent adults pay 600 in game currency. Insufficient funds block before action consumption.

### Special-career freedom and contracts

- `SpecialCareerExitSystem` owns voluntary Leave Path eligibility.
- Leaving a path preserves completed credits/releases/bookings/seasons, awards, earnings, skills, NPC relationships, and archived Career Worlds.
- An explicit `leftPath` marker overrides historical professional evidence so a voluntarily left career actually frees one of the two special-career commitment slots.
- Successful professional re-entry clears `leftPath`; returning to a career does not erase its earlier history.
- Acting/directing productions, music tours, modeling campaigns, live modeling representation terms, professional sports contracts, racing seasons, and racing contracts can temporarily lock voluntary exit.
- Inherited royalty is not treated as ordinary employment; a future abdication mechanic should own that lifecycle.
- Existing involuntary retirement/release remains separate from voluntary Leave Path.

### Professional sports renewal correction

- Sports contracts no longer silently auto-renew at term end.
- Final-season salary is stamped before contract resolution as before.
- A successful team renewal becomes a player-facing offer with exact team, years, salary, and expiry.
- The player may accept, decline into free agency, or leave the sports path once the previous term is complete.
- A valid pending renewal preserves the exact current team world/roster while the decision remains available, but `pro=false` prevents a phantom additional season.
- Offer expiry or decline archives the former team and moves the player to free agency.
- The established hard-age sports retirement rule remains an involuntary end-state and may supersede a nominal live term, preserving Phase 4D1 compatibility.

### Event target-role coherence

- Relationship-dependent procedural events now filter the target pool before eligibility and use that same pool for actual target selection.
- Reusable target tags support minimum/maximum NPC age, adult/minor targets, relationship-role filters, and care-needs context.
- Existing generated content receives compatibility rules: Family Favor requires a capable-age relative; Money Between Relatives requires an adult target; Care Question requires plausible care need; Sibling Competition requires an actual sibling-type relationship; Friend Loan requires a mature-enough friend.
- A newborn can still be the subject of child-appropriate family stories, but cannot be selected as the actor in an adult-like favor/finance scenario.

### Local validation

- Synthetic stress/career-freedom regression: **64/64**.
- Synthetic event-target role regression: **4/4**.
- The stress/career harness compiles and executes the actual staged Commitment, Exit, Sports-contract, Stress, and Event-system modules against fabricated infrastructure only.
- Changed TS/TSX files have passed syntax-oriented TypeScript validation; remaining standalone diagnostics are expected missing-module diagnostics from the partial staging tree.
- No staged simulation file contains `Math.random()`.
- GitHub Actions remains the final dependency-backed engine/test typecheck, complete regression, production build, and Pages deployment authority.

If the existing 427 checks remain unchanged, the next CI run is expected to report 427 + 64 + 4 = **495 checks**. Do not call that count verified until GitHub prints it.

## Next after this pass is green

**Phase 4D6 — deeper rival / leader consequences across special-career paths.** The new stress/conduct framework should become one of the consequence channels used by bosses, managers, coaches, teachers, peers, and rivals rather than creating a separate scripted drama layer.

## Known quality / architecture issues to keep visible

- Exact seeded replay serialization remains mandatory; do not introduce wall-clock IDs or unseeded simulation randomness.
- Every meaningful action stays in the central action economy.
- No universal runtime error boundary / last-known-good transaction recovery exists yet.
- Final 360/390/412/430 device, accessibility, PWA/install/offline QA remains later work.
- Persistent world population/performance profiling remains important as Phase 4 grows.
- The ~726 kB main chunk should eventually be code-split.
- Flat primitive special-career records remain acceptable for this pass; schema 10 is not justified yet.
