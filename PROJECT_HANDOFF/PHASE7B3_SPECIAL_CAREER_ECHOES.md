# Phase 7B3 — Special-Career Long-Tail Echoes

## Status

**CI Green, certified, and deployed in GitHub Actions Run #120 (`34796052224`).**

Certified expanded source **Run #120 / `4dd4378ec8986056fc3348dec5b2c6b1594b236b`**, from wrapper `c74078a41340023ab7760378f1fdfe0f77108643`. Package `0.12.0`, save schema **13**.

## Goal

Extend Phase 7B's action-driven delayed consequences into the persistent Combat, Military, and Politics ecosystems without replacing or extending the older Phase 4D8 annual `SpecialCareerStorySystem` scanner and without creating copied career state.

## Ownership

- `ConsequenceSystem` remains the sole scheduler/queue/history/cooldown authority.
- `SystemicStorySystem` remains stateless request glue.
- Combat results, records, rivals, coaches, and combat SocialWorlds remain owned by `CombatCareerWorldSystem` and the existing special-career track.
- Military service, postings, commanders, promotions, rank, and unit SocialWorlds remain owned by `MilitaryCareerWorldSystem` plus existing career state.
- Politics elections, terms, approval, staff/opposition, and office SocialWorlds remain owned by `PoliticsCareerWorldSystem` / existing political actions.
- `SpecialCareerStorySystem` remains unchanged and continues to own only its established annual mentor/rival/path story scan over the six Phase 4D persistent career families.

## Five action-driven echoes

1. **Combat training → 3 years.** Exact combat career + exact training world + exact coach. Dead/missing coach/world cancels; archived world remains valid history.
2. **Sanctioned combat bout → 2 years.** Exact combat career + exact fight world + exact opponent. Scheduling occurs regardless of win/loss; the fight result remains owned by CombatCareerWorldSystem.
3. **Military training → 3 years.** Exact military career always. If annual service processing has already created a posting, the exact posting + commander are also bound. If not, schedule career-only; never create a unit early merely for story context.
4. **Political policy action → 2 years.** Exact politics career always; exact office + chief of staff when already available.
5. **Political press action → 2 years.** Exact politics career always; exact office + opposition leader when already available.

All five definitions are probability-zero `systemicConsequenceEvents`, outside both the 691 ordinary random-event definitions and the older 18-definition special-career story registry.

## Effects

`ChoiceEffect.specialCareer` supports only bounded numeric deltas for `skill`, `reputation`, and `approval` on the exact `payload.careerKind`. This is intentionally not a generic career mutation bag.

It must never set or reroll:

- fight wins/losses/titles;
- seasons/championships;
- contracts/salary terms;
- elections/terms/offices;
- military rank/promotions/postings;
- production/release/campaign results;
- retirements or comeback state.

Those remain owned by their established lifecycle systems. Echo choices can additionally use existing Relationship/NPC memory, player secondary stats, fame/public reputation, and timeline authorities.

## Determinism / compatibility

- Scheduling itself consumes no gameplay RNG.
- Existing action RNG/result semantics remain unchanged.
- Duplicate unresolved echoes fail before runtime-ID allocation.
- Save round-trip preserves exact refs and no schema bump is required.
- Archived worlds remain valid references; missing/dead exact targets cancel deterministically and never retarget.
- Descendant/scheduler lifecycle remains unchanged through existing Phase 7A ownership.

## Local QA

`phase7B3SpecialCareerEchoRegression.ts`: **36/36**.

Also green locally: Engine TypeScript, Test TypeScript, complete regression wall, Combat 51/51, Military 65/65, Politics 80/80, Special-career Story 37/37, Special-career Path-story 68/68, Integrated Long-Life 105/105, Phase 7A 36/36, Phase 7B1 33/33, Phase 7B2 35/35, Progressive Disclosure 25/25, Random-event Coherence 77/77, minigame 19/19, Feedback Reporting 20/20, Feedback Central Inbox 23/23, and production build at **168 modules**.

Canonical Run #120 passed Phase 7B3 **36/36**, both TypeScript gates, the complete regression wall, Combat 51/51, Military 65/65, Politics 80/80, Special-career Story 37/37, Path-story 68/68, Integrated Long-Life 105/105, Phase 7A 36/36, Phase 7B1 33/33, Phase 7B2 35/35, Progressive Disclosure 25/25, Random-event Coherence 77/77, both feedback suites, certified restore smoke, the 168-module production build, artifact publication, and Pages deployment.

Certified source SHA-256: `b742118c6ce2db92abf774f178d1f067551ced5148268cdaf70de1c70e78f539`. Certified artifact ID `10329833244`; Pages artifact ID `10329833247`.

## Post-Phase-7 project rule

After Phase 7 is fully complete, **stop implementation planning**. Do not invent or start a next macro phase until Mavyy and Yuki explicitly brainstorm what Everthread should become next.
