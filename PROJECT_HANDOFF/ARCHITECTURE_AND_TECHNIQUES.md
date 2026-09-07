# Everthread — Architecture & Techniques

## Core ownership model

Everthread has one authoritative `GameState`.

Preferred direction: UI → `GameEngine` / system API → controlled state mutation → autosave / Age Up processing → UI render.

React screens display state and request actions. They should not directly mutate critical age, money, relationship, family, work, health, asset, legal, investment, or progression state.

## System boundaries

Keep major domains modular: Character, Aging, Events, Relationships, NPC autonomy, Education/schools, Career/workplaces, Special careers/organizations, Finance, Health, Assets/property, Investments, Business, Crime/legal/prison, Fame, Pets/travel, Generations/inheritance, and Save/migrations.

Prefer small reusable APIs over giant condition chains.

## Data-driven simulation

Use structured content/state and generic engines when possible. Social Worlds are shared by schools, workplaces, and special-career organizations; action policies remain central; NPC biography state remains separate from player relationship state. Do not create a parallel subsystem when the existing model already expresses the concept.

## Affiliation vs relationship

An NPC’s relationship type answers “what is this person to the player now?” A Social World answers “where/how did these people know each other?”

A classmate can become a friend/spouse and remain in School; a coworker can become an enemy/partner and remain in Work; a castmate/team rival/creative partner can change personal relationship and remain in Career Worlds. Never encode persistent institutional affiliation only inside `Relationship.type`.

## Deterministic RNG

Core simulation uses seeded RNG.

- no `Math.random()` for simulation state;
- no wall-clock runtime IDs;
- use state-scoped `makeStateId`;
- use independent deterministic substreams when a new subsystem should not perturb the main RNG sequence;
- exact replay regression remains mandatory;
- migrations should not consume player RNG unless explicitly part of old behavior.

## Yearly processor idempotence

A yearly system that changes contracts, seasons, delayed consequences, royalties, tours, campaigns, or other once-per-age state must defend against duplicate execution.

Persist a last-processed age/year marker in the appropriate existing state and return early for repeated processing. Phase 4 uses this for ecosystem years, sports seasons/contracts, music catalog/tour processing, modeling campaign/agency processing, and racing season/contract processing.

## Period accrual before end-state transitions

When one Age Up represents a completed period of work, resolve what was earned during that period before changing end-of-period status.

Professional sports stamps `seasonSalaryDue` / `lastSeasonAge` before renewal, release, or retirement. Phase 4D5 racing follows the same ownership rule with age-stamped `seasonSalaryDue` plus `seasonPrizeDue` before renewal, release, team movement, or retirement. Annual Finance can then pay and tax what was actually earned even if career status changes later in the same Age Up.

Prefer an explicit age-stamped accrual over temporarily keeping an invalid status alive just so another system can see it.

## Multi-age project and season lifecycle without duplicate state

For careers where a project or season should take meaningful time, do not resolve the entire career event in the button click. Start the period in the existing special-career track, bind it to the exact persistent Social World, and let a later Age Up finalize it.

Phase 4D2 uses this for acting/directing. Phase 4D4 uses it for modeling campaigns: booking starts the campaign and pays only an advance; the next Age Up settles performance, remaining compensation, bonus, commission, reputation/fame effects, pressure, and history. Phase 4D5 uses it for motorsport: Race starts an 18–24 round season and the next Age Up resolves the championship, wins/podiums/points, incidents/mechanical issues, earnings, pressure, and contract consequences.

Use this pattern when a future career needs a season/project lifecycle but does not yet justify a new save schema.

## Bounded flat history inside generic career tracks

The special-career tracks are intentionally generic persisted records. Primitive additions do not require a schema bump, but they must stay understandable and bounded.

Phase 4D3 music uses numbered recent-catalog slots rather than an unbounded hidden array/string blob. Phase 4D4 modeling mirrors that pattern with six rotating detailed campaign slots while retaining lifetime campaign/earnings aggregates. Phase 4D5 racing uses six rotating detailed season slots while lifetime seasons, wins, podiums, points, titles, earnings, teams, and best-result aggregates continue independently.

Do not encode arbitrary nested state as serialized JSON strings merely to avoid a migration. If several future systems genuinely need nested persistent histories, introduce a real typed structure and schema migration instead.

## Multi-age passive tails

A release can keep mattering after the click without becoming an unbounded yearly object.

Phase 4D3 music applies deterministic, capped three-age stream/royalty tails to recent catalog slots. Every slot carries a last-processed age while the music career carries `lastMusicCycleAge`, so duplicate calls cannot mint royalties twice.

This pattern is appropriate for residual income/attention that should decay predictably and then stop being actively processed.

## Tradeoff and term contracts

Offers should create an actual decision, not a free buff.

Phase 4D3 distribution partnerships exchange an advance and reach multiplier for a future royalty share. Phase 4D4 agency contracts exchange booking reach/representation upside for explicit commission and term limits. Phase 4D5 racing contracts preserve exact team, term, salary, offer type, and expiry; renewals retain an authentic current team while new-team contracts change affiliation only after acceptance.

A persistent organization/world and a temporary business or employment contract are separate facts. Ending a contract should not delete authentic affiliation history.

## Persistent modeling network vs representation

The existing modeling `SocialWorld(kind: "organization")` is the persistent professional network: agency staff, campaign team contacts, and rivals. Formal representation is contract state layered onto that world.

Rules:

- do not create a second modeling world merely because representation is accepted, renewed, declined, or lost;
- an unrepresented model can remain connected to the same network;
- pre-4D4 aggregate `jobs` remain valid historical facts;
- do not fabricate detailed campaign records for old instant jobs;
- new completed campaigns append only bounded recent detail plus lifetime aggregates;
- renewal/release changes contract status, not historical affiliation.

## Persistent racing team vs team contract

The racing `SocialWorld(kind: "organization")` owns real team affiliation, recurring engineering/team contacts, and rivals. The racing track owns the current contract, season, free-agency, and retirement state.

Rules:

- legacy racers reuse their existing active team world and NPC roster when 4D5 initializes contract lifecycle state;
- pre-4D5 `seasons` and `titles` remain aggregate history and are never retroactively converted into invented detailed championship records;
- a renewal keeps the same team world and relationships;
- release or declined/expired renewal archives the former team world and moves the driver into free agency without erasing history;
- a new-team offer must not create a team world merely by existing; create/archive affiliation only when the player accepts the contract;
- a free agent keeps `racingPathway` history without a fake active team;
- retirement archives active team affiliation, blocks future racing seasons, and preserves old teams/season records;
- a final season still accrues salary/prize before release, contract expiry, team movement, or retirement.

## Skill pathway vs professional career activation

Training/practice and professional tenure are different concepts.

Music practice may build skill during childhood, but it must not automatically mark the player as a professional musician or increment professional career years. The first real release starts professional tenure, and annual processing derives `years` from recoverable professional evidence.

Use the same distinction for future careers where childhood training precedes professional entry.

## Historical uniqueness without unbounded state

A bounded detailed UI history must not accidentally make generation logic forget older history.

Music keeps only six detailed recent catalog slots, but title selection can also read exact prior release names from the existing career timeline. This avoids casual lifetime title reuse without introducing an unbounded parallel title array or a save migration.

Generation should remain deterministic from seed + career ordinal. Timeline inspection is used only as historical collision evidence, not as hidden random state.

## Shared special-career relationship initialization

Career-world member relationship initialization lives in `SpecialCareerRelationshipSystem.ts` rather than being owned by the ecosystem processor itself.

This keeps one deterministic implementation for leader/boss, rival/enemy, and peer/coworker relationship creation while allowing individual career-cycle systems to ensure their world is socially initialized without creating a circular dependency through `SpecialCareerEcosystemSystem`.

`SpecialCareerEcosystemSystem` re-exports the helper for source compatibility with existing callers.

## Central action economy

Every meaningful clickable action must be classified as unlimited/configuration, resource-limited, per-age limited, cooldown-based, or consequence-escalating.

Use `src/core/actionEconomy.ts`. UI disabled states mirror policy for UX, but engine/system enforcement remains authoritative. Failed-but-executed random attempts generally consume their opportunity; blocked actions should not partially consume claims.

Current Phase 4 business/contract policies include `special.music_business`, `special.model.agency_seek`, `special.model.business`, `special.racing_contract_seek`, and `special.racing_business`. Existing `special.race` remains the one-season-per-age racing commitment gate.

## Persistent social worlds

`SocialWorld` is the reusable institution/organization layer. Current consumers include school, workplace, and Phase 4 special-career organization worlds.

Worlds own memberships/groups/affiliation history. NPC objects own the person. Relationships own the player-facing personal bond. Archive old worlds instead of deleting history.

## NPC simulation tiers

Important people receive full annual simulation; background acquaintances can use cheaper cadence. Promote meaningful family/friend/enemy/romantic characters when required. New persistent systems must respect the population budget rather than making every background NPC expensive forever.

## Save migration discipline

Current save schema: 9.

Bump only for genuinely new persisted structure that existing state cannot safely represent. When bumping, initialize deterministically, preserve old meaning, migrate rewind snapshots, test old-save migration, consider generation continuation, and never silently discard major player history.

Phase 4D4 and Phase 4D5 remain within bounded primitive special-career state and therefore do not justify schema 10.

## Mobile-first technique

Primary widths: 360 / 390 / 412 / 430px. Favor bottom navigation/sheets, clear cards, 44px+ meaningful touch controls, compact stat grids, safe-area padding, readable text, no hover-only behavior, and limited simultaneous dense controls.

## Simulation-first consequence design

Features should interact: school history affects admissions/careers; workplace relationships affect performance; career-world chemistry affects momentum/projects/releases/tours/campaigns/racing seasons; crime/legal history affects work; health affects sports/lifespan; wealth affects assets/business; children/relationships affect inheritance/generations.

Avoid isolated meters that never matter anywhere else.

## Testing technique

Use deterministic setups with controlled seeds/state. High-value patterns include same seed + same history ⇒ identical result; compare states differing in one intended variable; call yearly processors twice to test idempotence; archive/end and verify history remains; generation handoff and old-save migration; and stress long lives/many generations for bounded growth.

Keep specialized regression suites separate when that makes failures easier to diagnose. Music, modeling, and racing each have dedicated career regressions.

For racing specifically, regression coverage should include legacy-team preservation, no fake historical backfill, overlap blocking before action consumption, salary/prize accrual before end-state transitions, renewal/release/free-agency movement, offer expiry, final-season retirement pay, deterministic standings, and bounded six-slot history.

GitHub Actions remains the final dependency-backed build gate.

## Real-save diagnostic policy

Real player saves can reveal state combinations, bugs, and balance problems synthetic tests miss. They are diagnostic evidence only.

When a playtest save exposes a problem:

1. identify the generalized owning-system failure;
2. build a fabricated deterministic regression that reproduces the failure shape;
3. fix the owning system without save-specific conditionals;
4. preserve unrelated existing state/history;
5. never copy the player's seed, slot, NPCs, character history, or save JSON into production/default fixtures;
6. never make a fresh install or new life auto-load a tester's save.

Balance observations from real saves should inform generalized simulations and tuning, not hard-coded corrections for one life.

## Folder membership is a projection, not a second relationship type

People folders may overlap when different facts justify membership.

- School / Work / Career Worlds membership should primarily come from persistent SocialWorld affiliation, not generic Relationship labels.
- A career-world peer may use `Relationship.type = "coworker"` for interaction semantics while still not belonging in Work unless they also share a real workplace.
- Archived SocialWorlds preserve institutional history unless the product explicitly introduces a current-only view.
- Friends & Social may project a very close institutional connection without overwriting classmate/coworker/boss/teacher state.
- Changing the personal relationship to partner/spouse/friend must not delete original School/Work/Career Worlds history.

## Dating eligibility is separate from institutional affiliation

`Relationship.type` should not require converting every classmate/coworker/boss/teacher into `friend` before romance is possible.

For Ask out:

- enforce living NPC and teen/adult age compatibility first;
- permit only explicitly supported non-family relationship categories;
- family types remain blocked regardless of score;
- successful romance changes personal relationship state while SocialWorld preserves where the pair originally knew each other;
- UI visibility mirrors the same system helper used by the relationship action so button and engine cannot silently disagree.
