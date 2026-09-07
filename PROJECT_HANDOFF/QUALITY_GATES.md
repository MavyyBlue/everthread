# Everthread — Quality Gates / Definition of Done

“Implemented” means code exists. “Done” means the feature integrates correctly, preserves existing behavior, survives saves, and passes the appropriate gates.

## Definition of done — every meaningful update

An update is done only when:

- purpose and affected systems are clear;
- existing relevant code was inspected before changes;
- unrelated functionality was preserved;
- state mutations occur in the proper system/engine layer;
- action-economy classification is explicit for meaningful player actions;
- deterministic RNG / state-scoped IDs are respected;
- old saves remain valid, or an explicit migration exists;
- mobile UI is usable at phone widths without tiny/hover-only controls;
- regressions cover the new behavior and likely failure mode;
- local available checks pass;
- GitHub Actions type-check + regression + production build + Pages deployment pass;
- expanded `main` files are spot-checked when upload wiring is a risk;
- `PROJECT_HANDOFF/` is updated when the update changes project state or next steps.

## System/mechanic update gate

Require:

- clear owning system;
- reusable API rather than UI mutation;
- no duplicate authoritative state;
- bounded yearly/cooldown/resource behavior where applicable;
- deterministic state transitions;
- idempotence when a yearly processor could be invoked twice;
- connected consequences into at least one relevant neighboring system when the mechanic is intended to be systemic;
- regression for success, failure/boundary, and a preservation/cleanup path.

Examples: contracts must expire cleanly; archived worlds must remain history; death/NPC removal must not leave impossible active interactions.

## UI update gate

Require:

- UI reads authoritative state rather than recreating simulation truth;
- UI actions call engine/system APIs;
- disabled states match engine gates but never replace engine enforcement;
- important information fits 360px-class mobile layouts;
- tap targets remain practical;
- no required hover behavior;
- archived/current states are clearly distinguishable;
- empty states exist;
- player-facing labels do not expose internal IDs or implementation jargon.

## Save/schema update gate

A schema bump is justified only for genuinely new persisted structure that cannot be represented safely by existing state.

Require:

- `SAVE_VERSION` bump;
- migration from previous schema;
- defaults for missing fields;
- old rewind snapshots migrate before restoration;
- deterministic migration without consuming unrelated player RNG;
- regression loading/migrating old state;
- generational handoff behavior reviewed if the new state belongs to the protagonist;
- import/export compatibility reviewed.

Never bump schema just to add another primitive field to an already generic persisted record.

## Persistent NPC/social-world update gate

Require:

- NPC identity remains in authoritative `state.npcs`;
- affiliation belongs in `SocialWorld`;
- player relationship remains in `state.relationships`;
- affiliation must survive relationship-type changes;
- dead NPCs cannot perform living interactions;
- archived institutions/worlds preserve history without remaining active;
- no duplicate NPC/world creation on repeated ensure/sync;
- background/full simulation tiers used deliberately;
- long-life population growth remains bounded.

## Event/content update gate

Require:

- original Everthread wording/names;
- state-conditional eligibility;
- no meaningless duplicate variants solely to inflate counts;
- target-aware NPC context when a persistent person matters;
- immediate/delayed effects point to exact targets;
- follow-ups preserve payload/context;
- cooldown/repetition risk considered;
- content audit/regression updated when applicable.

## Performance update gate

Require targeted profiling when an update can grow with age, NPC count, timeline length, generations, worlds, or content count.

Watch for:

- unbounded arrays;
- duplicate yearly work;
- full-population expensive passes;
- repeated derived calculations;
- huge rendered lists;
- accidental retention of dead/irrelevant temporary objects.

Use bounded histories, simulation tiers, memoization/selectors/virtualization only where justified.

## Bug-fix gate

1. Reproduce.
2. Identify root cause.
3. Fix the owning layer.
4. Add regression that fails before the fix.
5. Verify adjacent behavior.
6. Avoid unrelated rewrite.
7. If the first fix fails, acknowledge it and change approach rather than stacking patches blindly.

## Deployment gate

GitHub Actions is authoritative for dependency-backed production readiness.

No phase is promoted as green while the newest intended run is failed, cancelled without a succeeding run, or still in progress.
