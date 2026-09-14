# Everthread — Phase 7B2 Ownership & Workplace Echoes

## Status

**Local candidate. Canonical GitHub Actions certification pending.**

Built from certified Run #117 (`34783290659`) / expanded source `9822a31df84197ea700ebd890bf0f68cb716637b` / package `0.12.0` / save schema **13**. The live Supabase inbox was refreshed before implementation and contained **0 unresolved reports**.

## Goal

Make ownership and ordinary work decisions acquire believable multi-year history without creating copied finance, asset, business, employment, relationship, or narrative state.

## Ownership

- `ConsequenceSystem` remains the sole scheduler/queue/history/cooldown authority.
- `SystemicStorySystem` remains stateless request glue only.
- `PropertySystem` / `state.assets.properties` remain property truth.
- `BusinessSystem` / `state.businesses` remain business truth.
- `WorkplaceSystem` / persistent workplace `SocialWorld`s remain ordinary employment-world truth.
- `Relationship` and NPC hidden opinion/memories remain person-to-person work-history truth.
- `systemicConsequenceEvents.ts` is content only. Phase 7B2 definitions are probability zero and never enter the 691-event random pool.

## Candidate story set

1. **Property renovation** — successful renovation schedules a two-year exact-property check-in. Selling/removing that property before due age cancels the consequence rather than selecting another property.
2. **Business founding** — founding a company schedules a three-year exact-business founder/culture reflection.
3. **Business product launch** — adding a product line schedules a two-year exact-business market/reputation echo. Unresolved repeats on the same business dedupe.
4. **Manager feedback** — asking the exact current manager for feedback schedules a two-year exact-workplace + exact-manager professional follow-up. It may surface after leaving because archived workplace worlds are durable history; a dead/missing manager or missing world cancels.
5. **Formal coworker concern** — raising a formal issue schedules a two-year exact-workplace + exact-coworker aftermath. Archived workplace history remains eligible; dead/missing exact people cancel instead of retargeting.

## Event effects

`ChoiceEffect.property` applies bounded condition deltas and modest percentage market-value adjustments to the exact `payload.propertyId`. `ChoiceEffect.business` applies bounded demand/reputation deltas to the exact `payload.businessId`. Existing `ChoiceEffect.workplace` and relationship effect handling continue to mutate exact workplace/NPC truth.

`{PROPERTY_NAME}` and `{BUSINESS_NAME}` render from live authoritative records; workplace `{WORLD_NAME}` and `{NPC_FIRST}` render from exact references. Names are not duplicated into durable story payloads. Asset/business resolutions emit exact semantic `stateChanges` and use matching timeline categories.

## Determinism / saves

Scheduling consumes no gameplay RNG. Originating workplace actions keep their existing RNG use and schedule only after the action RNG counter is committed. Save schema stays 13. Existing saves require no migration. Random-event definitions remain exactly 691.

## QA

Dedicated `phase7B2OwnershipWorkRegression.ts`: **35/35 locally**.

Coverage: random-pool isolation; action hooks; exact property/business/world/NPC refs; due ages; dedupe without ID consumption; save round-trip; property/business name rendering; exact property condition/value mutation; exact business demand/reputation mutation; semantic state changes; correct asset/business timeline categories; sold/missing target cancellation; normal workplace RNG preservation; archived-workplace persistence; exact manager/coworker relationship and memory effects; dead target cancellation; RNG-neutral direct scheduling; schema 13; global invariants.

Full local wall is green: Core 82/82; Integrated Long-Life 105/105; Phase 7A 36/36; Phase 7B1 33/33; Phase 7B2 35/35; Progressive Disclosure 25/25; Random-event Coherence 77/77; Activity-specific Minigame 19/19; Feedback Reporting 20/20; Feedback Central Inbox 23/23; all established suites green. Both TypeScript gates and the 168-module production build pass.

## Next boundary

Do not call 7B2 certified until the uploaded expanded source passes canonical Actions, certified restore artifact creation, and Pages deployment. After certification, refresh live feedback before beginning the planned special-career long-tail Phase 7B slice.
