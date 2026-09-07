# Everthread — Architecture & Techniques

## Core ownership model

Everthread has one authoritative `GameState`.

Preferred direction:

UI → `GameEngine` / system API → controlled state mutation → autosave / Age Up processing → UI render.

React screens display state and request actions. They should not directly mutate critical age, money, relationship, family, work, health, asset, legal, investment, or progression state.

## System boundaries

Keep major domains modular:

- Character
- Aging
- Events
- Relationships
- NPC autonomy
- Education / schools
- Career / workplaces
- Special careers / organizations
- Finance
- Health
- Assets/property
- Investments
- Business
- Crime/legal/prison
- Fame
- Pets/travel
- Generations/inheritance
- Save/migrations

Prefer small reusable APIs over giant condition chains.

## Data-driven simulation

Use structured content/state and generic engines when possible.

Examples:

- events defined as data with conditions/outcomes/follow-ups;
- Social Worlds shared by schools, workplaces, and special-career organizations;
- action policies defined centrally;
- job/education/content databases separated from UI;
- NPC biography state separated from relationship state.

Do not create a parallel subsystem when the existing model already expresses the concept.

## Affiliation vs relationship

This is a major Everthread design technique.

An NPC’s relationship type answers “what is this person to the player now?”

A Social World answers “where/how did these people know each other?”

Therefore:

- a classmate can become a friend/spouse and remain in School;
- a coworker can become an enemy/partner and remain in Work;
- a castmate/team rival can change personal relationship and remain in Career Worlds.

Never encode persistent institutional affiliation only inside `Relationship.type`.

## Deterministic RNG

Core simulation uses seeded RNG.

Rules:

- do not use `Math.random()` for simulation state;
- do not use wall-clock values for runtime IDs;
- use state-scoped `makeStateId`;
- use independent deterministic substreams when a new subsystem should not perturb the main RNG sequence;
- exact replay regression remains mandatory;
- migrations should not consume player RNG unless explicitly part of old behavior.

## Yearly processor idempotence

A yearly system that changes contracts, seasons, delayed consequences, or other once-per-age state must defend against duplicate execution when double processing would corrupt progression.

Technique: persist a last-processed age/year marker in the already appropriate state and return early for repeated processing.

Phase 4B uses this for special-career ecosystem processing so duplicate calls cannot burn two contract years or roll awards/scandals twice.

## Period accrual before end-state transitions

When one Age Up represents a completed period of work, resolve what was earned during that period before changing the player's end-of-period status.

Example: a professional sports season is played under the contract that existed during that season. Its salary is stamped to `seasonSalaryDue` / `lastSeasonAge` before renewal, release, or retirement. Annual finance then pays that age-stamped earned salary even if the player is a free agent or retired by the time finance processing runs.

This avoids order-dependent losses without reordering the global Age Up pipeline. Prefer an explicit age-stamped accrual over keeping an invalid status temporarily alive just so another system can see it.


## Multi-age project lifecycle without duplicate state

For careers where a project should take meaningful time, do not resolve the entire career event in the button click. Start the project in the existing special-career track, bind it to the exact persistent `SocialWorld`, and let the next Age Up archive/finalize that world.

Phase 4D2 uses this for acting/directing:

- the action creates/commits the production and records primitive project context;
- the active Social World remains the authoritative cast/crew/producer affiliation;
- another project is blocked while that world is active, before another major action claim is consumed;
- the next Age Up archives the world, resolves the shared project-impact score, then applies path-specific release economics/reception;
- the archived world remains history and the primitive track stores only career-summary values needed for UI/future progression;
- follow-up offers are bounded primitive opportunities with explicit expiry, not permanent parallel objects.

Use this pattern when a future career needs a season/project/release lifecycle but does not yet justify a new save-schema structure.

## Central action economy

Every meaningful clickable action must be classified as one of:

- unlimited/configuration;
- resource-limited;
- per-age limited;
- cooldown-based;
- consequence-escalating.

Use `src/core/actionEconomy.ts`.

UI disabled states mirror policy for UX, but engine/system enforcement remains authoritative.

Failed-but-executed random attempts generally consume their opportunity; blocked actions should not partially consume compound claims.

## Persistent social worlds

`SocialWorld` is the reusable institution/organization layer.

Current consumers:

- school;
- workplace;
- Phase 4 special-career organization worlds.

Worlds own memberships/groups/affiliation history. NPC objects own the person. Relationships own the player-facing personal bond.

Archive old worlds instead of deleting their history.

## NPC simulation tiers

Important people receive full annual simulation. Background acquaintances can use cheaper cadence.

Promote meaningful family/friend/enemy/romantic characters to full simulation as required.

New persistent systems must respect the population budget rather than making every background NPC expensive forever.

## Save migration discipline

Current save schema: 9.

Schema changes are costly and must be justified.

When bumping:

- initialize missing fields deterministically;
- preserve old meaning;
- migrate rewind snapshots;
- test old-save migration;
- consider generational continuation;
- never silently discard major player history.

## Mobile-first technique

Primary design widths: 360 / 390 / 412 / 430px.

Favor:

- bottom navigation/sheets;
- clear cards and hierarchy;
- 44px+ meaningful touch controls;
- compact stat grids;
- safe-area padding;
- readable text;
- no hover-only behavior;
- limited simultaneous dense controls.

## Simulation-first consequence design

Features should interact.

Examples:

- school history affects admissions/careers;
- workplace relationships affect performance;
- career-world chemistry affects momentum/project outcomes;
- crime/legal history affects work;
- health affects sports/lifespan;
- wealth affects assets/business;
- children/relationships affect inheritance/generations.

Avoid isolated meters that never matter anywhere else.

## Testing technique

Use deterministic setups with controlled seeds and state.

High-value regression patterns:

- same seed + same history ⇒ identical result;
- compare two states that differ in one intended variable;
- call yearly processor twice to test idempotence;
- archive/end a system and verify history remains while active behavior stops;
- generation handoff and old-save migration;
- stress long lives/many generations for bounded growth.

GitHub Actions remains the final dependency-backed build gate.
