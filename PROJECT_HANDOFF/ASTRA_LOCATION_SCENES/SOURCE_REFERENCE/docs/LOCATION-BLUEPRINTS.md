# Location blueprints

All coordinates refer to the contained 2:3 scene rectangle. Close is present on every object sheet.

## Central Everthread Bank

A clearer view of your finances.

Canonical ID: `central-everthread-bank`. Background: `assets/backgrounds/central-everthread-bank.png`. Foreground prop: `assets/props/service-kiosk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Banking kiosk | Transparent PNG | Money summary; Bills & Payments; Close |
| 2. Teller counter | Background hotspot | Your accounts; Credit offers; Borrowing; Close |
| 3. Advisor office | Background hotspot | Investments; Credit history; Close |

## Loomline Motors

Your next set of keys.

Canonical ID: `loomline-motors`. Background: `assets/backgrounds/loomline-motors.png`. Foreground prop: `assets/props/showroom-car.png`.

| Object | Art | Options |
|---|---|---|
| 1. Showroom car | Transparent PNG | Browse vehicles; Close |
| 2. Service bay | Background hotspot | Your vehicles; Close |
| 3. Finance office | Background hotspot | Vehicle financing; Driving licence; Close |

Driving licence is an existing action regrouped here; retain all vehicle types and age-specific purchasing rules.

## Hearthline Realty & Leasing

Somewhere to call home.

Canonical ID: `hearthline-realty`. Background: `assets/backgrounds/hearthline-realty.png`. Foreground prop: `assets/props/home-model.png`.

| Object | Art | Options |
|---|---|---|
| 1. Home display | Transparent PNG | Browse homes; Close |
| 2. Property wall | Background hotspot | Mortgage options; Current residence; Close |
| 3. Property office | Background hotspot | Your homes & rentals; Close |

Rent out is landlord functionality. The inspected source has a rented-home projection but no tenant lease-signing or lease-selection command. Do not invent working tenant lease controls.

## Threadwell Residential District

The familiar part of town.

Canonical ID: `threadwell-residential`. Background: `assets/backgrounds/threadwell-residential.png`. Foreground prop: `assets/props/neighborhood-board.png`.

| Object | Art | Options |
|---|---|---|
| 1. Neighborhood board | Transparent PNG | Current residence; People connected here; Close |
| 2. Home entrance | Background hotspot | Home visits; Hang out at home; Cook together; Have a sleepover; Close |
| 3. Courtyard | Background hotspot | Cook together date; Close |

This is a neighborhood scene, not a depiction of the player owning the pictured home. Residence is always projected from current save authority.

## Crossroads Mall

An afternoon with possibilities.

Canonical ID: `crossroads-mall`. Background: `assets/backgrounds/crossroads-mall.png`. Foreground prop: `assets/props/shopping-display.png`.

| Object | Art | Options |
|---|---|---|
| 1. Shopping counter | Transparent PNG | Clothing & personal items; Collectibles; Close |
| 2. Gift boutique | Background hotspot | Browse gifts; Your purchases; Close |
| 3. Mall concourse | Background hotspot | Browse together; Play games together; Catch a movie; Mall date; Close |

## Nightjar Diner

Your usual corner, a new conversation.

Canonical ID: `nightjar-diner`. Background: `assets/backgrounds/nightjar-diner.png`. Foreground prop: `assets/props/diner-table.png`.

| Object | Art | Options |
|---|---|---|
| 1. Your table | Transparent PNG | Share a meal; Diner date; Close |
| 2. Diner counter | Background hotspot | Food & household items; Close |
| 3. Window booth | Background hotspot | Share a meal; Close |

Only use existing food-item catalogue entries; do not fabricate a priced diner menu or nourishment mechanic.

## Weaver Park

A little room to breathe.

Canonical ID: `weaver-park`. Background: `assets/backgrounds/weaver-park.png`. Foreground prop: `assets/props/park-bench.png`.

| Object | Art | Options |
|---|---|---|
| 1. Park bench | Transparent PNG | Walk together; Play outside; Park date; Close |
| 2. Walking trail | Background hotspot | Walk; Run; Close |
| 3. Quiet pavilion | Background hotspot | Meditate; Close |

## Everthread Market

Everyday things, close to home.

Canonical ID: `everthread-market`. Background: `assets/backgrounds/everthread-market.png`. Foreground prop: `assets/props/grocery-cart.png`.

| Object | Art | Options |
|---|---|---|
| 1. Shopping cart | Transparent PNG | Food & household items; Close |
| 2. Produce stand | Background hotspot | Eat intentionally; Close |
| 3. Pantry shelves | Background hotspot | Your purchases; Close |

Grocery transactions are a proposed catalogue filter, not a new inventory/economy system. Render an empty shelf state if no existing item qualifies.

## Everthread Community School

A place to learn and belong.

Canonical ID: `everthread-school`. Background: `assets/backgrounds/everthread-school.png`. Foreground prop: `assets/props/student-desk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Study desk | Transparent PNG | Study harder; Skip class; Close |
| 2. Classroom | Background hotspot | School record; Leave education; Close |
| 3. Activity board | Background hotspot | Clubs & teams; Volunteer; School social; Close |

Keep compulsory-school, age, enrollment and current school-world ownership. Academic shortcut remains in a school-only overflow if already allowed.

## Everthread College

Make space for your next chapter.

Canonical ID: `everthread-college`. Background: `assets/backgrounds/everthread-college.png`. Foreground prop: `assets/props/service-kiosk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Campus kiosk | Transparent PNG | Programs & admissions; Close |
| 2. College library | Background hotspot | Study harder; School record; Close |
| 3. Admissions office | Background hotspot | Programs & admissions; Leave education; Close |

## Everthread General Hospital

Care, one step at a time.

Canonical ID: `everthread-general-hospital`. Background: `assets/backgrounds/everthread-general-hospital.png`. Foreground prop: `assets/props/medical-trolley.png`.

| Object | Art | Options |
|---|---|---|
| 1. Care station | Transparent PNG | Health overview; Conditions & treatment; Close |
| 2. Consultation rooms | Background hotspot | Conditions & treatment; Close |
| 3. Support rooms | Background hotspot | Therapy; Recovery support; Close |

## Pulseworks Gym

Build strength at your pace.

Canonical ID: `pulseworks-gym`. Background: `assets/backgrounds/pulseworks-gym.png`. Foreground prop: `assets/props/fitness-bench.png`.

| Object | Art | Options |
|---|---|---|
| 1. Training bench | Transparent PNG | Work out; Train together; Workout date; Close |
| 2. Fitness floor | Background hotspot | Work out; Close |
| 3. Martial arts room | Background hotspot | Martial arts; Combat training; Take a fight; Leave path; Close |

Combat is an existing career regrouped into a dedicated room; preserve pattern-memory minigame and skill alternative.

## Silverframe Studios

Every frame tells a story.

Canonical ID: `silverframe-studios`. Background: `assets/backgrounds/silverframe-studios.png`. Foreground prop: `assets/props/film-camera.png`.

| Object | Art | Options |
|---|---|---|
| 1. Camera rig | Transparent PNG | Direct indie film; Direct major film; Close |
| 2. Casting room | Background hotspot | Acting lesson; Find an agent; Audition; Close |
| 3. Production office | Background hotspot | Film career records; Leave path; Retire; Leave path; Retire; Close |

## Threadtone Music Studio

Find your sound. Make it yours.

Canonical ID: `threadtone-music-studio`. Background: `assets/backgrounds/threadtone-music-studio.png`. Foreground prop: `assets/props/producer-desk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Producer’s desk | Transparent PNG | Leave Music Path; Retire; Close |
| 2. Rehearsal nook | Background hotspot | Practice vocals; Tour; Close |
| 3. Recording booth | Background hotspot | Release Song; Release Album; Close |
| 4. Record shelf | Background hotspot | Your music; Distribution offers; Close |

## Facet Modeling Agency

Make an impression that lasts.

Canonical ID: `facet-modeling-agency`. Background: `assets/backgrounds/facet-modeling-agency.png`. Foreground prop: `assets/props/fashion-mirror.png`.

| Object | Art | Options |
|---|---|---|
| 1. Portfolio mirror | Transparent PNG | Modeling lesson; Agency contracts; Close |
| 2. Photo studio | Background hotspot | Audition; Photoshoot; Close |
| 3. Runway room | Background hotspot | Runway; Leave path; Retire; Close |

## Everthread Speedway

Find your line.

Canonical ID: `everthread-speedway`. Background: `assets/backgrounds/everthread-speedway.png`. Foreground prop: `assets/props/pit-console.png`.

| Object | Art | Options |
|---|---|---|
| 1. Pit console | Transparent PNG | Join motorsport; Team contracts; Leave path; Retire; Close |
| 2. Circuit entrance | Background hotspot | Race; Season record; Close |
| 3. Training bay | Background hotspot | Train; Close |

## Everthread Stadium

The work behind the moment.

Canonical ID: `everthread-stadium`. Background: `assets/backgrounds/everthread-stadium.png`. Foreground prop: `assets/props/trophy-display.png`.

| Object | Art | Options |
|---|---|---|
| 1. Team cabinet | Transparent PNG | Choose a sport; Contracts & renewals; Leave path; Retire; Close |
| 2. Training room | Background hotspot | Train; Seek pro contract; Close |
| 3. Team office | Background hotspot | Team & season; Go to a game; Stadium date; Close |

## Everthread Defense Garrison

Service, discipline and commitment.

Canonical ID: `everthread-defense-garrison`. Background: `assets/backgrounds/everthread-defense-garrison.png`. Foreground prop: `assets/props/records-desk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Personnel desk | Transparent PNG | Enlist Army; Officer path; Leave path; Close |
| 2. Training courtyard | Background hotspot | Train; Close |
| 3. Personnel office | Background hotspot | Service record; Close |

## Everthread City Hall

A voice in the life of the town.

Canonical ID: `everthread-city-hall`. Background: `assets/backgrounds/everthread-city-hall.png`. Foreground prop: `assets/props/records-desk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Civic desk | Transparent PNG | Public office; Leave path; Close |
| 2. Council chamber | Background hotspot | Run local; Run regional; Run national; Give a speech; Close |
| 3. Company desk | Background hotspot | Start a company; Your companies; Close |

## Everthread Courthouse

Clarity for the next decision.

Canonical ID: `everthread-courthouse`. Background: `assets/backgrounds/everthread-courthouse.png`. Foreground prop: `assets/props/records-desk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Case desk | Transparent PNG | Your case; Close |
| 2. Courtroom | Background hotspot | Legal status; Close |
| 3. Consultation room | Background hotspot | Your case; Legal record; Close |

No committing-crime buttons in the courthouse. Only pending cases, legal status and existing records.

## Everthread Public Safety Center

Your public safety point.

Canonical ID: `public-safety-center`. Background: `assets/backgrounds/public-safety-center.png`. Foreground prop: `assets/props/service-kiosk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Information kiosk | Transparent PNG | Legal status; Close |
| 2. Public counter | Background hotspot | Your case; Close |
| 3. Records room | Background hotspot | Legal record; Close |

The inspected build has no separate report-crime, emergency-call or public-police-job action. Keep those absent; current job listings remain at Loomworks.

## Everthread Correctional Center

A day at a time.

Canonical ID: `everthread-correctional`. Background: `assets/backgrounds/everthread-correctional.png`. Foreground prop: `assets/props/ledger-table.png`.

| Object | Art | Options |
|---|---|---|
| 1. Common-room table | Transparent PNG | Work; Make a friend; Keep good conduct; Cause trouble; Close |
| 2. Exercise yard | Background hotspot | Exercise; Sentence & status; Attempt escape; Close |
| 3. Case-review room | Background hotspot | Appeal; Your case; Close |

Use read-only public status if not imprisoned; do not expose inmate actions or imply player incarceration. No invented prison visits.

## Everthread Air Terminal

A little farther from the everyday.

Canonical ID: `everthread-air-terminal`. Background: `assets/backgrounds/everthread-air-terminal.png`. Foreground prop: `assets/props/service-kiosk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Travel kiosk | Transparent PNG | Plan a vacation; Plan a family trip; Close |
| 2. Check-in counter | Background hotspot | Plan a family trip; Close |
| 3. Departure lounge | Background hotspot | Plan a vacation; Pilot licence; Close |

Trips are temporary. Preserve travel age rules and guardian-funded family trips. No moving-country action is added.

## Loomworks Business District

Build the working part of your life.

Canonical ID: `loomworks-business-district`. Background: `assets/backgrounds/loomworks-business-district.png`. Foreground prop: `assets/props/work-desk.png`.

| Object | Art | Options |
|---|---|---|
| 1. Work desk | Transparent PNG | Work harder; Ask for a raise; Resign; Retire from working life; Your workplace; Close |
| 2. Employment office | Background hotspot | Job listings; Part-time work; Writing; Programming; Design; Close |
| 3. Company office | Background hotspot | Start a company; Your companies; Close |

## Blackline Freight Yard

Some doors open through your story.

Canonical ID: `blackline-freight-yard`. Background: `assets/backgrounds/blackline-freight-yard.png`. Foreground prop: `assets/props/ledger-table.png`.

| Object | Art | Options |
|---|---|---|
| 1. Back-office ledger | Transparent PNG | Join organization; Contribute; Leave path; Close |
| 2. Warehouse entrance | Background hotspot | Earning job; Close |
| 3. Back office | Background hotspot | Organization record; Become informant; Close |

Exact underworld_discovery gate must run before route entry, preload, titles and accessibility output. General crime must not become newly discovery-locked because it is not the same system.
