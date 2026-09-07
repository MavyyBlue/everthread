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

A yearly system that changes contracts, seasons, delayed consequences, royalties, tours, or other once-per-age state must defend against duplicate execution.

Persist a last-processed age/year marker in the appropriate existing state and return early for repeated processing. Phase 4 uses this for ecosystem years, sports seasons/contracts, and Phase 4D3 music catalog/tour processing.

## Period accrual before end-state transitions

When one Age Up represents a completed period of work, resolve what was earned during that period before changing end-of-period status.

Example: a professional sports season stamps `seasonSalaryDue` / `lastSeasonAge` before renewal, release, or retirement. Annual finance can then pay what was actually earned even if status changes later in the same Age Up.

Prefer an explicit age-stamped accrual over temporarily keeping an invalid status alive just so another system can see it.

## Multi-age project lifecycle without duplicate state

For careers where a project should take meaningful time, do not resolve the entire career event in the button click. Start the project in the existing special-career track, bind it to the exact persistent Social World, and let a later Age Up finalize it.

Phase 4D2 uses this for acting/directing: the action commits the production; the active world remains cast/crew affiliation; overlap is blocked before consuming another opportunity; the next Age Up archives/finalizes; primitive summary state remains for UI/future progression; follow-up offers are bounded and expire.

Use this pattern when a future career needs a season/project lifecycle but does not yet justify a new save schema.

## Bounded flat history inside generic career tracks

The special-career tracks are intentionally generic persisted records. Primitive additions do not require a schema bump, but they must stay understandable and bounded.

Phase 4D3 music uses numbered recent-catalog slots rather than an unbounded hidden array/string blob:

- lifetime catalog count/streams/royalties remain aggregate primitives;
- only six detailed recent releases are retained in rotating primitive slots;
- each slot records title, kind, launch age, quality, launch/lifetime streams, latest tail, reception, and last processed age;
- older detail can fall out of the bounded recent window while timeline history and lifetime aggregates remain intact.

Do not encode arbitrary nested state as serialized JSON strings merely to avoid a migration. If several future systems genuinely need nested persistent histories, introduce a real typed structure and schema migration instead.

## Multi-age passive tails

A release can keep mattering after the click without becoming an unbounded yearly object.

Phase 4D3 music applies deterministic, capped three-age stream/royalty tails to recent catalog slots. Every slot carries a `LastProcessedAge`, while the music career carries `lastMusicCycleAge`, so duplicate calls cannot mint royalties twice.

This pattern is appropriate for residual income/attention that should decay predictably and then stop being actively processed.

## Tradeoff contracts

Offers should create an actual decision, not a free buff.

Phase 4D3 distribution partnerships exchange an advance and reach multiplier for a future royalty share. Terms are stored exactly, offers expire, and accept/decline routes through a dedicated central action-economy policy. Future contract systems should likewise make both upside and cost explicit.

## Central action economy

Every meaningful clickable action must be classified as unlimited/configuration, resource-limited, per-age limited, cooldown-based, or consequence-escalating.

Use `src/core/actionEconomy.ts`. UI disabled states mirror policy for UX, but engine/system enforcement remains authoritative. Failed-but-executed random attempts generally consume their opportunity; blocked actions should not partially consume claims.

Phase 4D3 adds `special.music_business` for partnership accept/decline so business decisions cannot be spammed independently of career simulation.

## Persistent social worlds

`SocialWorld` is the reusable institution/organization layer. Current consumers include school, workplace, and Phase 4 special-career organization worlds.

Worlds own memberships/groups/affiliation history. NPC objects own the person. Relationships own the player-facing personal bond. Archive old worlds instead of deleting history.

## NPC simulation tiers

Important people receive full annual simulation; background acquaintances can use cheaper cadence. Promote meaningful family/friend/enemy/romantic characters when required. New persistent systems must respect the population budget rather than making every background NPC expensive forever.

## Save migration discipline

Current save schema: 9.

Bump only for genuinely new persisted structure that existing state cannot safely represent. When bumping, initialize deterministically, preserve old meaning, migrate rewind snapshots, test old-save migration, consider generation continuation, and never silently discard major player history.

## Mobile-first technique

Primary widths: 360 / 390 / 412 / 430px. Favor bottom navigation/sheets, clear cards, 44px+ meaningful touch controls, compact stat grids, safe-area padding, readable text, no hover-only behavior, and limited simultaneous dense controls.

## Simulation-first consequence design

Features should interact: school history affects admissions/careers; workplace relationships affect performance; career-world chemistry affects momentum/projects/releases/tours; crime/legal history affects work; health affects sports/lifespan; wealth affects assets/business; children/relationships affect inheritance/generations.

Avoid isolated meters that never matter anywhere else.

## Testing technique

Use deterministic setups with controlled seeds/state. High-value patterns include same seed + same history ⇒ identical result; compare states differing in one intended variable; call yearly processors twice to test idempotence; archive/end and verify history remains; generation handoff and old-save migration; and stress long lives/many generations for bounded growth.

Keep specialized regression suites separate when that makes failures easier to diagnose. Phase 4D3 adds a dedicated music-career regression rather than folding another large block into the existing special-career world suite.

GitHub Actions remains the final dependency-backed build gate.

## Folder membership is a projection, not a second relationship type

People folders may overlap when different facts justify membership.

Use these rules:

- School / Work / Career Worlds membership should primarily come from persistent `SocialWorld` affiliation, not from re-reading a generic `Relationship.type` label;
- a career-world peer may use `Relationship.type = "coworker"` for personal interaction semantics while still not belonging in Work unless that NPC also has a real workplace affiliation;
- archived Social Worlds preserve institutional history unless the product explicitly introduces a current-only view;
- Friends & Social may project a very close institutional connection without overwriting the underlying classmate/coworker/boss/teacher relationship type;
- changing the personal relationship to partner/spouse/friend must not delete the NPC's original School/Work/Career Worlds history.

This keeps affiliation and personal relationship state independent and prevents one reused relationship label from leaking NPCs into the wrong folder.

## Dating eligibility is separate from institutional affiliation

`Relationship.type` should not require a player to first convert every classmate/coworker/boss/teacher into `friend` before romance becomes possible.

For Ask out:

- enforce living NPC and teen/adult age compatibility first;
- permit only explicitly supported non-family relationship categories;
- family types remain blocked regardless of score;
- a successful romance changes the personal relationship state while the Social World continues to preserve where the pair originally knew each other;
- UI visibility mirrors the same system helper used by the relationship action, so the button and engine cannot silently disagree.
