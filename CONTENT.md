# Everthread — Content Inventory

Last audited: 2026-09-12  
Source of truth: executable definitions under `src/data/`; use `npm run content:audit` after dependencies are installed.

## Phase 5D systems note

No executable content-database counts change in Phase 5D. Aunt/uncle/cousin support is a derived family-topology integration over existing NPC graph truth and existing family-event libraries, not duplicate content inflation. Generic family events and relevant special-career selectors can now target extended kin where their existing semantics permit it.

## Phase 5E systems note

No executable content-database counts change in Phase 5E. The update strengthens the player-visible death/estate/descendant transition using existing life history, estate rules, NPC biographies, assets, trusts, and family state. Forced-sale explanations and successor previews are projections of authoritative systems rather than duplicate event/content rows.

## Phase 6A systems/content note

The executable life-event/career/etc. content counts remain unchanged. Phase 6A adds a separate data-driven credit marketplace with **6 fictional institutions / 6 card products**; these are finance-system definitions rather than life-event rows and should not be counted as artificial event-library growth. Products vary by age, secured-deposit requirement, credit/income/history thresholds, line ranges, APR, and fees.

## Phase 6B1 systems/content note

The executable life-event/career/etc. counts remain unchanged. Phase 6B1 adds **6 fictional asset-financing programs** in a separate lender marketplace: **3 vehicle programs / 3 home programs** across the existing fictional banking institutions. Programs vary by minimum age, credit score, income, balance/payment burden, down payment, term, APR/risk pricing, recent inquiries, and bankruptcy-recovery period. These are system definitions, not padded event rows.

## Phase 6B2 systems/content note

No executable content-database counts change in Phase 6B2. Secured-loan delinquency, cure windows, repossession, foreclosure, deficiency handling, and collateral-risk UI are systemic consequences over existing financed assets and existing credit history rather than new random-event rows. The dedicated Asset Delinquency regression contains 82 checks; this is QA coverage, not content inflation.

## Current counts

| Content family | Current | Production target | Status |
|---|---:|---:|---|
| Life event definitions | 691 | 500+ | Met numerically; consequence depth still expanding |
| Dedicated special-career story beats | 18 | — | 6 generic mentor/rival beats + 12 path-specific beats; delayed-only registry |
| Standard career positions | 306 | 150+ | Met; 51 six-step ladders |
| Career ladders / industries | 51 | — | Broad base established |
| Education programs | 51 | 40+ | Met |
| Illness / health definitions | 112 | 100+ | Met |
| Relationship-focused events | 199 | 100+ | Met numerically |
| Work/career events | 90 | 75+ | Met numerically |
| Crime definitions | 50 | 50+ | Met |
| Achievements | 124 | 100+ | Met |
| Challenges | 56 | 50+ | Met |
| Property variants | 60 | 50+ | Met |
| Pet variants | 50 | 50+ | Met |
| Vehicle / boat / aircraft definitions | 47 | — | Needs more breadth for 75+ general possessions target |
| Fictional securities | 18 | — | Functional starter market |
| Business industries | 20 | — | Functional base |
| Business product lines | 80 | 50+ products/industries | Met combined target |
| Collectible definitions | 40 | — | Needs expansion |
| Countries | 32 | 30+ | Met |
| Regional name pools | 7 | hundreds of names per region | Expanded; country/subregion depth still useful |
| First names per regional pool | 120 | hundreds/region | 6× increase; 840 total active first-name entries |
| Last names per regional pool | 120 | hundreds/region | 6× increase; 840 total surname entries |

## Action-economy coverage

0.9.6 adds a centralized, data-defined opportunity ledger across gameplay actions. This is systems coverage rather than content count: career applications/effort/raises/freelance, education effort/enrollment, wellness/treatment/rehab/habits, social interactions and relationship milestones, family planning/adoption, fame, travel/licenses, crime/prison, pets, collectibles, business founding/product launches, property renovation, and major special-career actions now have explicit yearly limits or cooldowns where repeated taps would otherwise create free progression or RNG rerolls.

Not every button should have a cooldown. Investment buy/sell and business tuning are examples of deliberate allocation/configuration actions that may remain flexible because repeated use at the same game state does not create a new random reward. New content should declare its action-economy classification when it introduces a repeatable player action.

## Event inventory

- Work: 90
- School: 77
- Romance: 66
- Childhood: 64
- Friends: 66
- Family: 66
- Money: 50
- Health: 50
- Travel: 40
- Fame: 40
- Crime/legal: 40
- Strange: 40
- Relationship-specific fixed: 1
- Aging-specific fixed: 1

Total ordinary/random event definitions: 691.

Routine events use multiple description variants and data-defined choices. The 691 count is based on distinct event definitions produced from scenario families rather than copies of identical prose. Five explicit delayed-consequence chains cover romantic secrecy, family favors, ignored health warnings, workplace shortcuts, and broken confidences with persistent context.

Special-career story definitions are intentionally counted separately because they never enter the ordinary random-event pool. Phase 4D8A introduced six exact-NPC mentor/rival beats. Phase 4D8B adds twelve path-specific beats across acting, music, modeling, professional sports, motorsport, and directing, bringing the dedicated registry to 18. These stories are scheduled through Career World history and `DelayedEvent`, not selected as generic random work events.

## Careers

The standard job database contains 51 industries/ladders with six positions each (306 positions). Examples include technology, medicine, nursing, dentistry, veterinary medicine, law, education, university research, multiple engineering disciplines, science, finance, accounting, banking, journalism, government, aviation, emergency services, trades, logistics, marketing, design, real estate, manufacturing, social services, mental wellness, aviation maintenance, transit, environmental services, biotechnology, pharmaceutical research, insurance, and customer support.

A numerical job count is not considered sufficient by itself. Higher-level positions enforce relevant experience; applications, job starts, annual effort, raises, and freelance opportunities are rate-limited through the central action ledger. 0.11.0 adds persistent managers/coworkers, employer history, workplace metrics/actions/events, layoffs/demotions/bonuses, and real hour-limited part-time employment. Remaining career-content work is primarily industry-specific hazards/opportunities, richer schedules/management structures, and longer workplace consequence chains.

### Special-career story content

The 18 dedicated story beats are structured as reusable consequences over existing career state rather than a separate narrative graph.

- Generic mentor chain: 3 beats.
- Generic rivalry chain: 3 beats.
- Acting reunion: 2 beats — `The Cast List Again` → `One More Scene`.
- Music reconnection: 2 beats — `The Song That Came Back` → `Second Life`.
- Modeling reunion: 2 beats — `The Old Booking Book` → `Back in the Room`.
- Professional sports legacy: 2 beats — `Message From the Old Locker Room` → `What They Remember`.
- Motorsport reunion: 2 beats — `An Old Engineer Calls` → `The Data They Kept`.
- Directing reunion: 2 beats — `The Crew Still Talks` → `Another Set, Maybe`.

The path-specific openings select exact living former collaborators from bounded recently archived Career Worlds. Choices affect existing relationship/hidden-opinion, fame/public-reputation, happiness, confidence, creativity, charisma, athleticism, stress, willpower, and karma systems. They do not directly create career contracts, projects, releases, representation, comebacks, or retirement transitions.

Biological parenting now uses a one-year pregnancy state and resolves births on a future Age Up rather than creating unlimited instant children from repeated taps. Existing pre-0.9.5 children are preserved by migration.

### Combat-career world content (4E1)

4E1 adds systems-backed procedural career-world content rather than ordinary random-event definitions, so the 691-event count does not change. Combat sports now has eight original gym/circuit organization names and three role groups—coaching team, training partners, and circuit rivals. The rosters are persistent NPCs with bounded annual replacement, not disposable flavor names. Exact rivals can become the named opponent in sanctioned fictional bout history and continue to exist through People → Career Worlds after the player leaves the path.

This is intentionally a depth pass rather than a raw content-count inflation pass. Future combat content should build consequences around the persistent coach/rival network instead of creating near-duplicate anonymous fight descriptions.

## Education

51 post-secondary definitions cover university subjects, professional schools, graduate study, community-college/trade style programs, and career-tag links. Core childhood schooling is generated by the education system rather than represented as separate data rows.

0.10.0 adds persistent school rosters, teachers/leaders, clubs/teams/groups, conduct/attendance/honors, country-profile stage variation, targeted school events, and richer admissions/scholarship weighting. Remaining education content priorities are deeper transfers/expulsions/re-entry, richer competitions/elections/awards, alumni resurfacing, and more country/subregion profiles.

## Workplace social worlds

0.11.0 makes workplaces the second production consumer of Social Worlds. Full-time and part-time employers persist manager/coworker membership independently from evolving personal relationships; job changes archive rather than erase workplace history. Workplace actions/events use exact affiliated NPCs, and the central action economy prevents same-year networking/feedback/report rerolls. Part-time employment is now persisted with pay, performance and a shared weekly hour budget.

## NPC life simulation

0.12.0 adds persistent resumable NPC biographies rather than new raw content rows. Important NPCs can accumulate education/credentials, real career histories, income/debt/aggregate property, illness histories, legal incidents/custody, fame/reputation/followers, household moves, partnerships, blended families, adoption, inheritance, and death. Background acquaintances retain a cheaper cadence until their relationship becomes meaningful. The player can inspect these histories in People, and an adult descendant carries the accumulated biography into playable state.

Simulation reports now track lifetime NPC cast size as a first-class performance/content budget. Final 1,000-life neutral and mixed samples average about 116 persistent lifetime NPC records with a maximum of 176, including deceased relatives and archived school/work contacts deliberately retained for history.

## Health

112 illness/condition definitions span common, chronic, genetic, infectious, mental-wellness, injury, and age-related categories. They contain prevalence, severity, health drain, mortality contribution, chronic chance, treatment cost, and treatment effectiveness.

Future health content should prioritize differentiated recovery/follow-up events and profession/activity interactions rather than simply adding diagnoses.

## Assets and economy

- 60 property variants from 20 property archetypes across value/standard/premium market tiers.
- 47 vehicle/boat/aircraft definitions.
- 18 fictional securities; long-run drifts were recalibrated in 0.9.4 for the bounded relative economy while preserving volatility regimes.
- 20 business industries with 80 total product lines.
- 50 pet variants.
- 40 collectible definitions.

Still needed: more ordinary possessions, car-loan variants, rare collectible families, rental tenant content, business-product depth, property events, and specialized organization assets.

## Achievements and challenges

- 124 original achievements.
- 56 original challenges.

Counts exceed the initial target. Continue auditing for goals that are genuinely different rather than adding near-duplicate thresholds.

## Names

The seven regional pools now contain 120 first names and 120 surnames each: 840 active first-name entries and 840 surnames across the regional data. Each regional first-name pool keeps the authoritative 50/45/5 NPC-gender distribution as 60 female, 54 male, and 6 nonbinary entries.

This is a substantial repetition reduction over the original 20/20 development pools while preserving regional flavor and the existing single-draw seeded generation path. Future naming work should deepen country/subregion-specific pools and can add stronger first-name uniqueness preference for especially large lifetime casts if playtesting still shows distracting repetition.

## Content still needed most

1. Country/subregion-specific naming depth beyond the expanded regional base.
2. Deeper school consequence/alumni/competition content on the new persistent school-world foundation.
3. Deeper industry-specific workplace drama, management, schedules, and former-coworker consequence chains on the completed persistent workplace foundation.
4. Delayed consequence chains across relationships, parenting, crime, health and career.
5. Deep acting/music/sports/combat/politics/military/modeling/racing/directing event libraries.
6. Business, investment, property, landlord and insolvency event libraries.
7. Prison/legal follow-ups and post-release consequences.
8. Parenting milestones from infancy through adult children.
9. Old-age, retirement, caregiving and legacy events.
10. Specialized organization content for museums, zoos, casino/resort, commune, and fictional intelligence agency systems.

## 0.9.7 systems note

No content-database counts changed in 0.9.7. The milestone adds age eligibility for investments/travel/wellness and dependent-minor finance handling; these are systemic rules rather than new content entries.

## 0.9.9 systems note

No executable content-database counts changed in 0.9.9. The milestone adds account-level multi-slot Life Saves and a derived Family Legacy ranking layer. Completed-life generation is now recorded for new deaths and inferred for older lineages. Deleting an independent save removes that lineage from both the aggregated Past Lives folder and best-life ranking; individual completed ancestors remain structurally attached to their surviving family save.

## 0.9.8 systems note

No content-database counts changed in 0.9.8. The milestone adds relationship-folder/tree presentation derived from persistent NPC state and the first playable minigame mechanics. Future content work should populate School and Work folders with persistent classmates/teachers/bosses/coworkers and add path-specific minigame prompt/variant libraries rather than duplicating the framework.
