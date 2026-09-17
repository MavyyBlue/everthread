# Action map

Bindings below are source-grounded implementation notes, not executable strings. Panel extractions and proposed catalogue filters require adapter work. Preserve owning-system gates and inspect current source before implementation.

## music.leave — Leave Music Path

Step away from music while keeping your completed history.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('music')`
- Gate: specialCareerExitGate(state, music); preserve active-project/contract blocks.
- Source owner: `src/engine/GameEngine.ts`

## music.retire — Retire

Review retirement from your music career.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retireSpecialCareer('music')`
- Gate: specialCareerRetirementGate(state, music); do not substitute age alone or ordinary work retirement.
- Source owner: `src/engine/GameEngine.ts`

## music.song — Release Song

Put your next song out into the world.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.musicRelease('song')`
- Gate: specialActionAgeVisible; specialCareerStartGate(music); special.music_release.
- Source owner: `src/engine/GameEngine.ts`

## music.album — Release Album

Bring a collection of songs together.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.musicRelease('album')`
- Gate: Same shared release quota as a song; current game computes availability.
- Source owner: `src/engine/GameEngine.ts`

## music.practice — Practice vocals

Spend time developing your voice.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.musicPractice('vocals')`
- Gate: Training availability from CareerScreen; special.training music.
- Source owner: `src/engine/GameEngine.ts`

## music.tour — Tour

Take your music on the road.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.musicTour()`
- Gate: specialCareerStartGate(music), special.tour music; retain active-tour restrictions.
- Source owner: `src/engine/GameEngine.ts`

## music.catalog — Your music

Releases, tours, achievements and career history.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Filter music lifecycle and music world projections only.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## music.partnership — Distribution offers

Review only your current music partnership offers.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Music offer projection; accept/decline via gameEngine.musicPartnership(action).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## wellness.walk — Walk

Take an easy walk through the park.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('walking')`
- Gate: activitiesDisclosure + WELLNESS_MIN_AGES; wellness.total and wellness.activity walking.
- Source owner: `src/engine/GameEngine.ts`

## wellness.run — Run

Follow the running trail at your own pace.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('running')`
- Gate: activitiesDisclosure + WELLNESS_MIN_AGES; wellness.total and wellness.activity running.
- Source owner: `src/engine/GameEngine.ts`

## wellness.meditate — Meditate

Settle into a quiet moment.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('meditation')`
- Gate: activitiesDisclosure + WELLNESS_MIN_AGES; wellness.total and wellness.activity meditation.
- Source owner: `src/engine/GameEngine.ts`

## wellness.gym — Work out

Use the fitness area for a workout.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('gym')`
- Gate: activitiesDisclosure + WELLNESS_MIN_AGES; wellness.total and wellness.activity gym.
- Source owner: `src/engine/GameEngine.ts`

## wellness.martial — Martial arts

Practice in the martial arts area.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('martial_arts')`
- Gate: activitiesDisclosure + WELLNESS_MIN_AGES; wellness.total and wellness.activity martial_arts.
- Source owner: `src/engine/GameEngine.ts`

## wellness.diet — Eat intentionally

Make a considered food choice.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('diet')`
- Gate: activitiesDisclosure + WELLNESS_MIN_AGES; wellness.total and wellness.activity diet.
- Source owner: `src/engine/GameEngine.ts`

## shared.park.walk — Walk together

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'park_walk')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; park_walk age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.park.play — Play outside

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'park_play')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; park_play age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.mall.browse — Browse together

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'mall_browse')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; mall_browse age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.mall.games — Play games together

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'mall_games')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; mall_games age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.mall.movie — Catch a movie

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'movie_outing')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; movie_outing age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.diner.meal — Share a meal

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'diner_meal')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; diner_meal age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.home.hangout — Hang out at home

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'home_hangout')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; home_hangout age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.home.sleepover — Have a sleepover

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'sleepover')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; sleepover age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.home.cook — Cook together

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'cook_together')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; cook_together age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.gym.together — Train together

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'gym_session')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; gym_session age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.school.social — School social

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'school_social')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; school_social age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## shared.stadium.event — Go to a game

Choose someone to spend this time with.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.shareExperience(npcId, placeId, 'stadium_event')`
- Gate: Exact allowed plan from projectSharedExperienceOptions; sharedExperienceAvailability; placeId and NPC ID required; stadium_event age/relationship rules.
- Source owner: `src/data/sharedExperiences.ts`

## date.park — Park date

Choose an eligible person with accepted date plans.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.romanticDate(npcId, placeId, 'park_walk')`
- Gate: Do not auto-accept a date. Preserve invite acceptance, age, relationship, pending-plan and exact-place rules.
- Source owner: `src/data/romanticDates.ts`

## date.mall — Mall date

Choose an eligible person with accepted date plans.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.romanticDate(npcId, placeId, 'mall_browse')`
- Gate: Do not auto-accept a date. Preserve invite acceptance, age, relationship, pending-plan and exact-place rules.
- Source owner: `src/data/romanticDates.ts`

## date.diner — Diner date

Choose an eligible person with accepted date plans.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.romanticDate(npcId, placeId, 'diner_meal')`
- Gate: Do not auto-accept a date. Preserve invite acceptance, age, relationship, pending-plan and exact-place rules.
- Source owner: `src/data/romanticDates.ts`

## date.home — Cook together date

Choose an eligible person with accepted date plans.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.romanticDate(npcId, placeId, 'cook_together')`
- Gate: Do not auto-accept a date. Preserve invite acceptance, age, relationship, pending-plan and exact-place rules.
- Source owner: `src/data/romanticDates.ts`

## date.gym — Workout date

Choose an eligible person with accepted date plans.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.romanticDate(npcId, placeId, 'gym_session')`
- Gate: Do not auto-accept a date. Preserve invite acceptance, age, relationship, pending-plan and exact-place rules.
- Source owner: `src/data/romanticDates.ts`

## date.stadium — Stadium date

Choose an eligible person with accepted date plans.

- Presentation: companion; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.romanticDate(npcId, placeId, 'stadium_event')`
- Gate: Do not auto-accept a date. Preserve invite acceptance, age, relationship, pending-plan and exact-place rules.
- Source owner: `src/data/romanticDates.ts`

## bank.summary — Money summary

Cash, assets, liabilities and net worth.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Read current financial summary; cash and available credit remain distinct.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## bank.accounts — Your accounts

Balances, credit limits and account controls.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Extract only the accounts body of CreditBankingPanel.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/CreditBankingPanel.tsx`

## bank.payments — Bills & Payments

Required payments, arrears and auto-pay.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Extract payment obligation list and exact-obligation controls.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/CreditBankingPanel.tsx`

## bank.offers — Credit offers

Review terms before applying.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Extract offer list; gameEngine.applyForCreditCard(productId).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/CreditBankingPanel.tsx`

## bank.borrowing — Borrowing

Personal loans and debt options.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Extract personal borrowing body, exact quotes, and bankruptcy review.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/CreditBankingPanel.tsx`

## bank.history — Credit history

Review your recorded credit history.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Credit history projection only.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/CreditBankingPanel.tsx`

## bank.invest — Investments

Browse your fictional in-game market.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Extract securities/positions; gameEngine.invest or sellInvestment after quote review.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## motors.catalog — Browse vehicles

Compare cars and other available vehicles.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Filter existing vehicle catalogue; use AssetPurchaseSheet with exact typeId.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## motors.owned — Your vehicles

Repair, financing status and sale options.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Owned vehicle projection; repairVehicle, AssetSaleSheet with exact vehicle ID.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## motors.finance — Vehicle financing

Compare current terms on a selected vehicle.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `AssetPurchaseSheet vehicle financing branch, exact typeId and offerId.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/AssetPurchaseSheet.tsx`

## homes.catalog — Browse homes

Explore homes available to buy.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Homes-only market; AssetPurchaseSheet home branch.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## homes.owned — Your homes & rentals

Make a home, renovate, rent out or sell.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Owned properties only; setHome, renovateProperty, rentProperty, AssetSaleSheet.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## homes.mortgage — Mortgage options

Review financing for a selected home.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Home quote and mortgage offer branch of AssetPurchaseSheet.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/AssetPurchaseSheet.tsx`

## homes.residence — Current residence

Your family home, rented home or owned residence.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `playerResidenceProjection(state).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/ResidentialLifeSystem.ts`

## home.visits — Home visits

See which home visits you can arrange.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `projectResidentialPlans(state,npcId); execute exact residentialExperience(npcId,plan.id).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/ResidentialLifeSystem.ts`

## home.neighbors — People connected here

See known household and neighborhood connections.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Read existing household/LivingMap projections; do not imply live physical presence.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/LivingMapSystem.ts`

## shop.gifts — Browse gifts

Choose an item from the existing gift catalogue.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Filter personal-item catalogue by existing store/category metadata; purchasePersonalItem(itemId).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/PersonalInventorySystem.ts`

## shop.style — Clothing & personal items

Browse the personal items available to you.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing personal inventory catalogue and purchase gate.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/PersonalInventorySystem.ts`

## shop.collection — Collectibles

Review available collectible items.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing collectible catalogue; purchaseCollectible(id).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## shop.groceries — Food & household items

See the stock supported by the current catalogue.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Only existing suitable personal-item catalogue rows; otherwise show honest empty state.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/PersonalInventorySystem.ts`

## shop.inventory — Your purchases

View the personal items you already own.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Read existing personal inventory; never copy item instances into location state.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/systems/PersonalInventorySystem.ts`

## school.groups — Clubs & teams

Join, participate in or leave your school groups.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Exact current school groups; joinSchoolGroup, attendSchoolGroup, leaveSchoolGroup.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## school.records — School record

Attendance, conduct, academics and education history.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Current education and school world projections only.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## college.admissions — Programs & admissions

Compare available study and training programs.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing program list and admissionProfile; gameEngine.enroll(programId).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## health.conditions — Conditions & treatment

Review any active conditions and care options.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Exact condition IDs; gameEngine.treat(conditionId, general or specialist).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## health.rehab — Recovery support

Review rehabilitation for existing dependencies.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing addictions only; gameEngine.rehab(kind).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## health.status — Health overview

A focused view of your current health.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Read health conditions and current health/stress projections.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## film.records — Film career records

Projects, offers and people from your film work.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Only acting and directing projections from SpecialCareerWorldPanel.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## model.contracts — Agency contracts

Representation, current terms and offers.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Modeling-only offer projection and modelingAgency(seek/accept/decline).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## race.contracts — Team contracts

Current contract and available team offers.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Racing-only projection; racingContract(seek/accept/decline).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## race.season — Season record

Standings, completed races and season history.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Racing season/lifecycle read projections only.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## sports.join — Choose a sport

View the sports paths available to you.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing sports list; gameEngine.sportsJoin(sport).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## sports.contracts — Contracts & renewals

Review your current team contract.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Sports renewal projection; sportsContract(accept/decline).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## sports.record — Team & season

Your sport, team and recorded seasons.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Sports-only lifecycle and world projections.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## military.record — Service record

Your branch, rank and service history.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Military-only world and career projections.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## politics.record — Public office

Office, approval and civic career connections.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Politics-only world/career projection.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/components/SpecialCareerWorldPanel.tsx`

## business.start — Start a company

Choose an industry and name for your company.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing company-formation form; gameEngine.startBusiness(industryId,name).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## business.manage — Your companies

Manage products, pricing, pay and marketing.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Exact business ID; tuneBusiness and addBusinessProduct.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/AssetsScreen.tsx`

## legal.status — Legal status

Review pending proceedings and current status.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Read legal state; no crime catalogue at civic service desks.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## legal.case — Your case

Review a pending case and representation choices.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Pending charge branch only; resolveCase(lawyer,plea) after consequence review.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## legal.history — Legal record

View the record the game already keeps.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Read existing legal history only; empty if absent.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## prison.status — Sentence & status

Your current correctional status.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing imprisonment/security/sentenceRemaining projection.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## travel.vacation — Plan a vacation

Choose a destination and review your trip.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing destination selector; gameEngine.travel(destinationId).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## travel.family — Plan a family trip

Choose a trip with your family.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing selector; gameEngine.travel(destinationId,undefined,true); guardian rules.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/ActivitiesScreen.tsx`

## work.jobs — Job listings

Browse work you can apply for.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing qualified full-time listings; applyForJob(jobId).`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## work.parttime — Part-time work

Review flexible jobs and existing commitments.

- Presentation: catalog; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Existing part-time options and hour cap; startPartTimeJob or quitPartTimeJob.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## work.team — Your workplace

Coworkers, manager and workplace context.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Current workplace projection; collaborateAtWork, networkAtWork, askBossFeedback.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## crime.record — Organization record

Your rank, standing and organization history.

- Presentation: panel; consequence hint: normal; status: existing-projection-needs-focused-panel.
- Binding / extraction: `Organized crime projection only; discovery stays authoritative.`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/screens/CareerScreen.tsx`

## license.driving — Driving licence

Take the existing driving test.

- Presentation: challenge; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.license('driving', score)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## license.pilot — Pilot licence

Take the existing pilot test.

- Presentation: challenge; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.license('pilot', score)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## school.study — Study harder

Put extra effort into your current studies.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('study')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## school.skip — Skip class

Review the consequences of missing class.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('skip_class')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## school.volunteer — Volunteer

Take part in your school community.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('school_volunteer')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## school.dropout — Leave education

Review whether you can leave your current program.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.dropOut()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## health.therapy — Therapy

Make time for structured support.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.therapy()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## combat.train — Combat training

Practice with your combat sports path.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.combatTrain()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## combat.fight — Take a fight

Begin the established combat challenge.

- Presentation: challenge; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.combatFight(score)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## acting.lesson — Acting lesson

Develop your performance skills.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.actingLesson()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## acting.agent — Find an agent

Seek representation for your acting career.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.actingAgent()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## acting.audition — Audition

Enter the existing acting challenge.

- Presentation: challenge; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.actingAudition(score)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## directing.indie — Direct indie film

Review the existing independent-film commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.directFilm(1500000)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## directing.major — Direct major film

Review the existing major-film commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.directFilm(25000000)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## model.lesson — Modeling lesson

Work on your modeling skills.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.model('lesson')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## model.audition — Audition

Apply for your next modeling opportunity.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.model('audition')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## model.shoot — Photoshoot

Take a professional photography booking.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.model('photoshoot')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## model.runway — Runway

Step into your next runway booking.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.model('runway')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## race.join — Join motorsport

Review entry into the racing path.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.race('join')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## race.train — Train

Work on your racing skills.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.race('train')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## race.race — Race

Launch the lane-dodging racing minigame.

- Presentation: challenge; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.race('race', score)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## sports.train — Train

Develop your current sports path.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.sportsTrain()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## sports.pro — Seek pro contract

Start the existing sports contract challenge.

- Presentation: challenge; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.sportsPro(score)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## military.army — Enlist Army

Review your service commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.enlist('Army')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## military.officer — Officer path

Review the Air Service officer route.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.enlist('Air Service', true)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## military.train — Train

Develop your service skills.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.militaryTrain()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## politics.local — Run local

Review a local election campaign.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.campaign(1)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## politics.regional — Run regional

Review a regional election campaign.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.campaign(3)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## politics.national — Run national

Review a national election campaign.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.campaign(4)`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## politics.speech — Give a speech

Address your public audience.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.politicalAction('speech')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## work.harder — Work harder

Put additional effort into your current role.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.workHarder()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## work.raise — Ask for a raise

Ask about your compensation.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.askForRaise()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## work.resign — Resign

Review leaving your current full-time role.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.resign()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## work.retire — Retire from working life

Review ordinary-work retirement.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retire()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## crime.join — Join organization

Review this fictional career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.joinCrimeOrg()`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## crime.earn — Earning job

An abstract risk-and-reward game action.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.crimeOrgAction('earn')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## crime.contribute — Contribute

Review a contribution to your organization.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.crimeOrgAction('contribute')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## crime.informant — Become informant

Review the consequences of this decision.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.crimeOrgAction('informant')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## prison.exercise — Exercise

Available only under your current correctional rules.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.prisonAction('exercise')`
- Gate: Imprisoned only; prison.total + prison.kind; pending-event authority.
- Source owner: `src/engine/GameEngine.ts`

## prison.work — Work

Available only under your current correctional rules.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.prisonAction('work')`
- Gate: Imprisoned only; prison.total + prison.kind; pending-event authority.
- Source owner: `src/engine/GameEngine.ts`

## prison.befriend — Make a friend

Available only under your current correctional rules.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.prisonAction('befriend')`
- Gate: Imprisoned only; prison.total + prison.kind; pending-event authority.
- Source owner: `src/engine/GameEngine.ts`

## prison.behave — Keep good conduct

Available only under your current correctional rules.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.prisonAction('behave')`
- Gate: Imprisoned only; prison.total + prison.kind; pending-event authority.
- Source owner: `src/engine/GameEngine.ts`

## prison.trouble — Cause trouble

Available only under your current correctional rules.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.prisonAction('trouble')`
- Gate: Imprisoned only; prison.total + prison.kind; pending-event authority.
- Source owner: `src/engine/GameEngine.ts`

## prison.appeal — Appeal

Available only under your current correctional rules.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.prisonAction('appeal')`
- Gate: Imprisoned only; prison.total + prison.kind; pending-event authority.
- Source owner: `src/engine/GameEngine.ts`

## prison.escape — Attempt escape

Launch the existing abstract procedural challenge.

- Presentation: challenge; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.escape(score)`
- Gate: Imprisoned only; prison.escape; existing minigame/skill resolution.
- Source owner: `src/engine/GameEngine.ts`

## acting.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('acting')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## acting.retire — Retire

Review retirement eligibility and your current commitments.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retireSpecialCareer('acting')`
- Gate: specialCareerRetirementGate for this exact deep career; racing uses its own retirement wrapper.
- Source owner: `src/engine/GameEngine.ts`

## directing.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('directing')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## directing.retire — Retire

Review retirement eligibility and your current commitments.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retireSpecialCareer('directing')`
- Gate: specialCareerRetirementGate for this exact deep career; racing uses its own retirement wrapper.
- Source owner: `src/engine/GameEngine.ts`

## modeling.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('modeling')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## modeling.retire — Retire

Review retirement eligibility and your current commitments.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retireSpecialCareer('modeling')`
- Gate: specialCareerRetirementGate for this exact deep career; racing uses its own retirement wrapper.
- Source owner: `src/engine/GameEngine.ts`

## racing.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('racing')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## racing.retire — Retire

Review retirement eligibility and your current commitments.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retireSpecialCareer('racing')`
- Gate: specialCareerRetirementGate for this exact deep career; racing uses its own retirement wrapper.
- Source owner: `src/engine/GameEngine.ts`

## sports.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('sports')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## sports.retire — Retire

Review retirement eligibility and your current commitments.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.retireSpecialCareer('sports')`
- Gate: specialCareerRetirementGate for this exact deep career; racing uses its own retirement wrapper.
- Source owner: `src/engine/GameEngine.ts`

## military.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('military')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## politics.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('politics')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## crimeOrg.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('crimeOrg')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## combat.leave — Leave path

Review leaving this career commitment.

- Presentation: action; consequence hint: confirm; status: existing-command.
- Binding / extraction: `gameEngine.leaveSpecialCareer('combat')`
- Gate: specialCareerExitGate for this exact path.
- Source owner: `src/engine/GameEngine.ts`

## freelance.writing — Writing

Choose a freelance task in this field.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('freelance_writing')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## freelance.programming — Programming

Choose a freelance task in this field.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('freelance_programming')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`

## freelance.design — Design

Choose a freelance task in this field.

- Presentation: action; consequence hint: normal; status: existing-command.
- Binding / extraction: `gameEngine.performActivity('freelance_design')`
- Gate: Use the existing domain eligibility and action ledger.
- Source owner: `src/engine/GameEngine.ts`
