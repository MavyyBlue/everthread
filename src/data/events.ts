import type { EventChoice, GameEventDefinition } from '../types/game';

const slug = (s:string) => s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

type ScenarioFamily = {
  category: string;
  minAge: number;
  maxAge: number;
  probability: number;
  cooldown: number;
  tags: string[];
  settings: string[];
  dilemmas: Array<{ title:string; text:string }>;
  choices: (index:number) => EventChoice[];
};

const socialChoices = (i:number): EventChoice[] => [
  { id:'kind', label:['Be kind','Help out','Hear them out'][i%3]!, effects:{ stats:{happiness:2}, secondary:{karma:2,charisma:1}, relationship:{delta:7} } },
  { id:'bold', label:['Make it interesting','Take a chance','Say what you think'][i%3]!, outcomes:[
    {weight:62,text:'It lands better than expected.',effects:{stats:{happiness:4},secondary:{confidence:3},relationship:{delta:4}}},
    {weight:38,text:'The moment gets awkward fast.',effects:{stats:{happiness:-2},secondary:{stress:3},relationship:{delta:-4}}},
  ]},
  { id:'leave', label:['Stay out of it','Walk away','Keep your distance'][i%3]!, effects:{ secondary:{willpower:1}, relationship:{delta:-1} } },
];

const schoolChoices = (i:number): EventChoice[] => [
  {id:'study',label:['Take it seriously','Prepare properly','Do the work'][i%3]!,effects:{secondary:{academicPerformance:5,discipline:2},stats:{intelligence:1,happiness:-1}}},
  {id:'social',label:['Make it social','Ask a classmate for help','Turn it into a group effort'][i%3]!,effects:{secondary:{charisma:2,academicPerformance:2},relationship:{delta:5}}},
  {id:'skip',label:['Wing it','Ignore it','Do literally anything else'][i%3]!,outcomes:[
    {weight:45,text:'Somehow, you get away with it.',effects:{stats:{happiness:3},secondary:{discipline:-2}}},
    {weight:55,text:'The shortcut is extremely visible.',effects:{stats:{happiness:-2},secondary:{academicPerformance:-5,reputation:-2}}},
  ]},
];

const workChoices = (i:number): EventChoice[] => [
  {id:'professional',label:['Handle it professionally','Do the boring sensible thing','Keep it clean'][i%3]!,effects:{secondary:{workPerformance:5,discipline:2,reputation:2},stats:{happiness:-1}}},
  {id:'ambitious',label:['Use it as an opportunity','Take charge','Make your case'][i%3]!,outcomes:[
    {weight:65,text:'Your initiative gets noticed.',effects:{secondary:{workPerformance:4,confidence:3},stats:{happiness:2}}},
    {weight:35,text:'It comes across as a little too eager.',effects:{secondary:{workPerformance:-2,stress:3}}},
  ]},
  {id:'chaos',label:['Choose chaos','Make it somebody else’s problem','Say the quiet part out loud'][i%3]!,outcomes:[
    {weight:28,text:'Against all workplace logic, it works.',effects:{stats:{happiness:5},secondary:{reputation:-1}}},
    {weight:72,text:'There is now a meeting about the meeting.',effects:{stats:{happiness:-3},secondary:{workPerformance:-6,stress:5,reputation:-4}}},
  ]},
];

const moneyChoices = (i:number): EventChoice[] => [
  {id:'save',label:['Keep the money','Take the safe option','Protect your budget'][i%3]!,effects:{money:250 + (i%5)*100,secondary:{discipline:2}}},
  {id:'spend',label:['Treat yourself','Spend for convenience','Upgrade something'][i%3]!,effects:{money:-(180 + (i%4)*120),stats:{happiness:4},secondary:{discipline:-1}}},
  {id:'risk',label:['Take the gamble','Try to turn it into more','Choose the risky option'][i%3]!,outcomes:[
    {weight:38,text:'The risk pays off.',effects:{money:900 + i*35,stats:{happiness:5}}},
    {weight:62,text:'The money leaves faster than it arrived.',effects:{money:-(500+i*20),stats:{happiness:-3},secondary:{stress:4}}},
  ]},
];

const healthChoices = (i:number): EventChoice[] => [
  {id:'rest',label:['Rest and recover','Take it easy','Listen to your body'][i%3]!,effects:{stats:{health:4,happiness:1},secondary:{stress:-4}}},
  {id:'care',label:['Seek professional care','Book an appointment','Get it checked'][i%3]!,effects:{money:-(150+i*15),stats:{health:6},secondary:{stress:-2}}},
  {id:'ignore',label:['Ignore it','Push through','Pretend it is nothing'][i%3]!,outcomes:[
    {weight:40,text:'It settles down on its own.',effects:{stats:{health:1}}},
    {weight:60,text:'That was not a brilliant plan.',effects:{stats:{health:-5,happiness:-2},secondary:{stress:4}}},
  ]},
];

const fameChoices = (i:number): EventChoice[] => [
  {id:'grace',label:['Handle it gracefully','Keep it classy','Be generous in public'][i%3]!,effects:{fame:2,reputation:4,secondary:{karma:2}}},
  {id:'viral',label:['Lean into the attention','Make it a moment','Post about it immediately'][i%3]!,outcomes:[
    {weight:57,text:'The moment takes off online.',effects:{fame:6,reputation:1}},
    {weight:43,text:'The internet decides the bit is tired by lunchtime.',effects:{fame:-2,reputation:-3,secondary:{stress:4}}},
  ]},
  {id:'private',label:['Keep it private','Decline attention','Disappear for the day'][i%3]!,effects:{fame:-1,stats:{happiness:2},secondary:{stress:-3}}},
];

const travelChoices = (i:number): EventChoice[] => [
  {id:'explore',label:['Explore','Follow the detour','Go see what is there'][i%3]!,outcomes:[
    {weight:70,text:'The detour becomes the best story of the trip.',effects:{stats:{happiness:6},secondary:{creativity:2}}},
    {weight:30,text:'You get tired, mildly lost, and very aware of your shoes.',effects:{stats:{health:-1,happiness:-1},secondary:{stress:2}}},
  ]},
  {id:'comfort',label:['Choose comfort','Stick to the plan','Take the easy route'][i%3]!,effects:{money:-(80+i*12),stats:{happiness:3},secondary:{stress:-2}}},
  {id:'social',label:['Talk to people','Join the group','Accept the invitation'][i%3]!,effects:{stats:{happiness:4},secondary:{charisma:3,confidence:2}}},
];

const weirdChoices = (i:number): EventChoice[] => [
  {id:'yes',label:['Absolutely','Investigate','This seems like a story'][i%3]!,outcomes:[
    {weight:55,text:'You gain a strange but harmless story.',effects:{stats:{happiness:5},secondary:{creativity:4}}},
    {weight:45,text:'You immediately understand why sensible people walked away.',effects:{stats:{happiness:-1},money:-(30+i*8),secondary:{stress:3}}},
  ]},
  {id:'no',label:['Nope','Leave immediately','Respectfully decline reality'][i%3]!,effects:{secondary:{willpower:2},stats:{happiness:1}}},
  {id:'profit',label:['Try to profit from it','Take a picture and monetize it','Find a buyer for the weirdness'][i%3]!,outcomes:[
    {weight:35,text:'Someone actually pays you.',effects:{money:500+i*20,fame:1}},
    {weight:65,text:'There is, tragically, no market for this.',effects:{secondary:{reputation:-1}}},
  ]},
];

const crimeChoices = (i:number): EventChoice[] => [
  {id:'walk',label:['Walk away','Stay out of it','Do not make this your problem'][i%3]!,effects:{secondary:{karma:2,willpower:2},legalHeat:-2}},
  {id:'intervene',label:['Intervene carefully','Call for help','Help the victim'][i%3]!,outcomes:[
    {weight:74,text:'Your intervention helps without making things worse.',effects:{secondary:{karma:4,reputation:3},stats:{happiness:2}}},
    {weight:26,text:'The situation turns messy before it settles.',effects:{stats:{health:-2},secondary:{stress:4}}},
  ]},
  {id:'tempted',label:['Get involved','Take the questionable opportunity','Make a bad decision'][i%3]!,outcomes:[
    {weight:34,text:'You get away with a small gain.',effects:{money:300+i*18,secondary:{criminalNotoriety:3,karma:-3},legalHeat:4}},
    {weight:66,text:'The situation attracts exactly the wrong attention.',effects:{money:-120,secondary:{criminalNotoriety:4,karma:-4,reputation:-3},legalHeat:8}},
  ]},
];

const familyChoices = (i:number): EventChoice[] => [
  {id:'support',label:['Show up for them','Offer support','Make time'][i%3]!,effects:{stats:{happiness:3},secondary:{karma:3},relationship:{delta:9}}},
  {id:'boundary',label:['Set a boundary','Be honest','Say no this time'][i%3]!,effects:{secondary:{willpower:3,confidence:2},relationship:{delta:-2}}},
  {id:'avoid',label:['Avoid the whole thing','Pretend you missed the message','Stay out late'][i%3]!,effects:{stats:{happiness:1},secondary:{stress:-1},relationship:{delta:-6}}},
];

const families: ScenarioFamily[] = [
  {
    category:'childhood',minAge:3,maxAge:10,probability:.12,cooldown:2,tags:['childhood'],
    settings:['the playground','a rainy afternoon indoors','a neighbor’s yard','a family gathering','the school bus','a birthday party','the local park','a cluttered kitchen'],
    dilemmas:[
      {title:'The Missing Toy',text:'another child insists a favorite toy disappeared after you were nearby'},
      {title:'The Unfair Rule',text:'an adult announces a rule that feels spectacularly unfair'},
      {title:'The Secret Club',text:'a group of kids offers you entry into a very serious club with a very silly password'},
      {title:'The Broken Thing',text:'something fragile breaks and nobody saw exactly how'},
      {title:'The New Kid',text:'someone new is standing alone and trying not to look nervous'},
      {title:'The Dare',text:'a friend proposes a dare that is mostly foolish and only slightly impressive'},
      {title:'The Stray Animal',text:'a lost-looking animal wanders close enough to become everyone’s immediate concern'},
      {title:'The Last Treat',text:'there is exactly one treat left and more than one person has noticed'},
    ], choices:socialChoices,
  },
  {
    category:'school',minAge:6,maxAge:22,probability:.13,cooldown:1,tags:['school'],
    settings:['before a big test','during group work','at lunch','after class','during a school assembly','at practice','in the library','on presentation day','during club time'],
    dilemmas:[
      {title:'The Surprise Quiz',text:'a teacher announces work nobody seems emotionally prepared for'},
      {title:'Group Project Gravity',text:'your group has discovered that deadlines move faster than people'},
      {title:'Borrowed Notes',text:'a classmate asks for your notes five minutes before they desperately need them'},
      {title:'The Presentation',text:'your turn to present arrives sooner than your confidence does'},
      {title:'Teacher’s Favorite',text:'someone accuses you of getting special treatment'},
      {title:'Club Election',text:'a school club needs a leader and your name enters the conversation'},
      {title:'Academic Shortcut',text:'you are offered a suspiciously easy way around some work'},
      {title:'The Rumor Desk',text:'a ridiculous rumor starts moving through the student body'},
    ], choices:schoolChoices,
  },
  {
    category:'friends',minAge:8,maxAge:95,probability:.09,cooldown:2,tags:['relationship'],
    settings:['over lunch','late at night','during a long walk','in a group chat','at a celebration','on a dull weekend','during a shared errand','after an awkward silence'],
    dilemmas:[
      {title:'The Overshare',text:'a friend tells you something deeply personal and asks you not to repeat it'},
      {title:'The Forgotten Plan',text:'a friend completely forgets plans you were actually looking forward to'},
      {title:'The Favor',text:'a friend needs a favor that will cost you time and patience'},
      {title:'The New Crowd',text:'your friend has started spending time with people who do not seem thrilled about you'},
      {title:'The Honest Opinion',text:'a friend asks for an honest opinion and clearly hopes honesty means praise'},
      {title:'The Loan Request',text:'a friend asks to borrow money and promises this will be simple'},
      {title:'The Bad Joke',text:'a joke lands badly and the room gets quiet in a very specific way'},
      {title:'The Old Grudge',text:'a small argument somehow finds a grudge that was supposed to be buried'},
    ], choices:socialChoices,
  },
  {
    category:'family',minAge:4,maxAge:100,probability:.11,cooldown:2,tags:['family'],
    settings:['at dinner','during a holiday','on a family call','after unexpected news','during a visit','at a reunion','while helping with chores','during a tense drive'],
    dilemmas:[
      {title:'Family Favor',text:'a relative asks for help with something inconvenient but important to them'},
      {title:'Old Comparison',text:'someone compares your life to another relative’s life, with charts only they can see'},
      {title:'Money Between Relatives',text:'money enters a family conversation and immediately changes the temperature'},
      {title:'The Care Question',text:'a relative needs more support than before and the family is deciding who can provide it'},
      {title:'Unexpected Guest',text:'a relative arrives with less notice than a weather alert'},
      {title:'Family Secret',text:'you learn a piece of family history that explains several weird silences'},
      {title:'Sibling Competition',text:'a harmless comparison turns into a real competition'},
      {title:'The Apology Window',text:'someone in the family is clearly waiting for an apology neither side enjoys giving'},
    ], choices:familyChoices,
  },
  {
    category:'romance',minAge:14,maxAge:95,probability:.09,cooldown:2,tags:['relationship','romance'],
    settings:['on a date','during a quiet evening','after a message arrives','at a party','during a weekend away','over breakfast','after a small argument','while making plans'],
    dilemmas:[
      {title:'Mixed Signals',text:'someone you like says something that could mean three completely different things'},
      {title:'The Ex Question',text:'the subject of an ex-partner appears with no warning and too much detail'},
      {title:'Future Plans',text:'a casual conversation suddenly becomes about where this relationship is going'},
      {title:'The Forgotten Date',text:'an important date has been forgotten by exactly one person'},
      {title:'Jealous Moment',text:'a harmless interaction triggers a surprisingly jealous reaction'},
      {title:'Unexpected Gift',text:'a romantic gesture appears, and it is either sweet or mildly alarming'},
      {title:'Phone Face Down',text:'a phone is turned face-down with suspiciously theatrical timing'},
      {title:'The Big Question',text:'you are asked for an answer that could change the relationship'},
    ], choices:socialChoices,
  },
  {
    category:'work',minAge:16,maxAge:82,probability:.13,cooldown:1,tags:['work','requires:employed'],
    settings:['during a team meeting','ten minutes before closing','on a crowded workday','during performance review week','after a client call','in the break room','during a deadline crunch','while your boss is away','during a company event','on a quiet morning'],
    dilemmas:[
      {title:'Credit Where Due',text:'someone presents an idea you did most of the work on'},
      {title:'Impossible Deadline',text:'a deadline arrives that appears to have been designed by an enemy of clocks'},
      {title:'Boss Wants a Word',text:'your boss asks to speak privately without explaining why'},
      {title:'Coworker Meltdown',text:'a coworker is overwhelmed and the rest of the team is pretending not to notice'},
      {title:'The Shortcut',text:'a faster process would save time but bends a company rule'},
      {title:'Office Rumor',text:'a rumor about layoffs starts moving faster than official communication'},
      {title:'Client Disaster',text:'a client is furious about a problem that is only partly your fault'},
      {title:'Promotion Whisper',text:'you hear that a higher position may open soon'},
    ], choices:workChoices,
  },
  {
    category:'money',minAge:14,maxAge:100,probability:.10,cooldown:2,tags:['money'],
    settings:['while checking your account','after opening the mail','during a shopping trip','while planning the month','after a surprise payment','during a sale','while comparing prices','at the end of the year'],
    dilemmas:[
      {title:'Unexpected Refund',text:'you discover money coming back that you had already emotionally buried'},
      {title:'Convenient Upgrade',text:'an upgrade you do not need is being extremely persuasive'},
      {title:'Fee With Attitude',text:'a fee appears with the confidence of someone who knows you hate paperwork'},
      {title:'The Bargain',text:'something useful is discounted enough to make your budget nervous'},
      {title:'Shared Expense',text:'a group expense turns into a debate about who owes what'},
      {title:'Cash Windfall',text:'a small unexpected windfall gives you options'},
    ], choices:moneyChoices,
  },
  {
    category:'health',minAge:5,maxAge:110,probability:.09,cooldown:2,tags:['health'],
    settings:['after waking up','during exercise','after a stressful week','while traveling','during a routine day','after poor sleep','during a busy month','after noticing a change'],
    dilemmas:[
      {title:'Not Quite Right',text:'you feel off in a way that is difficult to describe but easy to notice'},
      {title:'Persistent Ache',text:'a minor ache has stayed longer than invited'},
      {title:'Sleep Debt',text:'your sleep schedule has become more concept than schedule'},
      {title:'Stress Signal',text:'your body is making a fairly direct complaint about your stress level'},
      {title:'Fitness Slump',text:'your usual activity suddenly feels much harder than expected'},
      {title:'Routine Check',text:'a routine health check offers a chance to address a small concern early'},
    ], choices:healthChoices,
  },
  {
    category:'travel',minAge:8,maxAge:100,probability:.08,cooldown:3,tags:['travel'],
    settings:['at a train station','in an unfamiliar neighborhood','near a busy market','at the hotel','during a road trip','at an airport','on a hiking trail','beside the water'],
    dilemmas:[
      {title:'Wrong Turn, Maybe',text:'the route looks wrong but considerably more interesting'},
      {title:'Local Invitation',text:'someone friendly invites you to join a small local gathering'},
      {title:'Weather Pivot',text:'the weather destroys the plan and creates several new ones'},
      {title:'Lost Item',text:'you realize something important is not where you thought it was'},
      {title:'Overbooked',text:'a booking problem leaves you choosing between inconvenience and expense'},
    ], choices:travelChoices,
  },
  {
    category:'fame',minAge:16,maxAge:100,probability:.08,cooldown:2,tags:['fame','requires:famous'],
    settings:['outside a venue','after an interview','during an online trend','at a public event','while leaving work','during a livestream','after a fan post','during a quiet day off'],
    dilemmas:[
      {title:'Recognized in Public',text:'someone recognizes you and suddenly three more people notice'},
      {title:'Quote Goes Sideways',text:'a short quote from you is spreading without the sentence around it'},
      {title:'Fan Gift',text:'a fan sends a thoughtful gift that is also just a little intense'},
      {title:'Brand Offer',text:'a company offers money for an endorsement that is not exactly prestigious'},
      {title:'Trending Clip',text:'an old clip of you resurfaces and starts trending'},
    ], choices:fameChoices,
  },
  {
    category:'crime_legal',minAge:13,maxAge:100,probability:.07,cooldown:3,tags:['crime','legal'],
    settings:['on a quiet street','outside a crowded venue','near a shop','during a late commute','in a parking area','at a party','near your workplace','while traveling'],
    dilemmas:[
      {title:'Questionable Opportunity',text:'someone offers you quick money for something they carefully avoid describing as legal'},
      {title:'Witnessed Trouble',text:'you see a situation that may need help before it gets worse'},
      {title:'Found Wallet',text:'you find a wallet with enough cash to make morality briefly inconvenient'},
      {title:'Suspicious Package',text:'an unattended package attracts attention and several bad ideas'},
      {title:'Old Acquaintance',text:'someone from a rougher chapter of your life proposes a profitable favor'},
    ], choices:crimeChoices,
  },
  {
    category:'strange',minAge:3,maxAge:110,probability:.06,cooldown:4,tags:['strange','luck'],
    settings:['behind a thrift store','at a nearly empty fair','during a power outage','on a foggy morning','inside an old building','at a roadside stop','during a neighborhood festival','after midnight'],
    dilemmas:[
      {title:'The Unlabeled Box',text:'you find a box with no label and far too much tape'},
      {title:'Coincidence Stack',text:'the same bizarre coincidence happens three times in one day'},
      {title:'The Tiny Parade',text:'a tiny parade appears with no clear audience and tremendous commitment'},
      {title:'Mysterious Contest',text:'a handwritten sign invites strangers to a contest with unclear rules'},
      {title:'The Prophecy Coupon',text:'a fortune-teller hands you a prediction on the back of a discount coupon'},
    ], choices:weirdChoices,
  },
];

function makeFamilyEvents(family:ScenarioFamily): GameEventDefinition[] {
  return family.settings.flatMap((setting, sIndex) => family.dilemmas.map((dilemma,dIndex) => {
    const index = sIndex * family.dilemmas.length + dIndex;
    const id = `${family.category}_${slug(dilemma.title)}_${sIndex+1}`;
    const descriptionVariants = [
      `While ${setting}, ${dilemma.text}.`,
      `${setting[0]!.toUpperCase()}${setting.slice(1)}, ${dilemma.text}. The moment is now very much yours to deal with.`,
      `You are ${setting} when ${dilemma.text}. There is an uncomfortable amount of eye contact.`,
    ];
    return {
      id, category:family.category, title:dilemma.title, descriptions:descriptionVariants,
      minAge:family.minAge, maxAge:family.maxAge, probability:family.probability,
      cooldown:family.cooldown + (index % 2), tags:family.tags, choices:family.choices(index),
    };
  }));
}

const fixedEvents: GameEventDefinition[] = [
  {
    id:'romance_boundary_crossed',category:'romance',title:'A Line Gets Blurry',
    descriptions:['A private conversation with someone outside your relationship becomes more flirtatious than you intended. {NPC_FIRST} has no idea.'],
    minAge:18,maxAge:90,probability:.018,cooldown:18,tags:['romance','relationship','requires:romantic','target:romantic'],choices:[
      {id:'hide',label:'Hide it and move on',effects:{relationship:{npcSelector:'payload',delta:-1},stats:{happiness:3},secondary:{karma:-5,stress:2},schedule:{eventId:'delayed_affair_discovery',years:3,npcSelector:'payload',requiredRelationshipTypes:['partner','fiance','spouse']}}},
      {id:'confess_now',label:'Tell your partner what happened',effects:{relationship:{npcSelector:'payload',delta:-9},stats:{happiness:-3},secondary:{karma:3,stress:4}}},
      {id:'end_contact',label:'End the outside flirtation',effects:{relationship:{npcSelector:'payload',delta:2},secondary:{karma:2,willpower:3},stats:{happiness:-1}}},
    ]
  },
  {
    id:'family_favor_request',category:'family',title:'A Favor With Weight',
    descriptions:['{NPC_NAME} asks you for a substantial loan after a rough stretch. They promise they will remember who helped when things were ugly.'],
    minAge:18,maxAge:95,probability:.02,cooldown:16,tags:['family','money','requires:family','target:family'],choices:[
      {id:'lend',label:'Lend the money',effects:{money:-3000,relationship:{npcSelector:'payload',delta:8},secondary:{karma:3},schedule:{eventId:'delayed_family_favor_return',years:2,npcSelector:'payload',requiredRelationshipTypes:['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew']}}},
      {id:'gift',label:'Give a smaller amount as a gift',effects:{money:-1200,relationship:{npcSelector:'payload',delta:6},secondary:{karma:4}}},
      {id:'decline',label:'Say you cannot do it',effects:{relationship:{npcSelector:'payload',delta:-4},secondary:{stress:1}}},
    ]
  },
  {
    id:'delayed_family_favor_return',category:'family',title:'The Favor Comes Back',
    descriptions:['Two years after you helped, {NPC_NAME} contacts you again. They have not forgotten the loan—or what it meant at the time.'],
    minAge:18,maxAge:110,probability:0,cooldown:99,tags:['family','money','delayed'],choices:[
      {id:'repayment',label:'Accept repayment',effects:{money:3300,relationship:{npcSelector:'payload',delta:3},stats:{happiness:2}}},
      {id:'forgive',label:'Tell them to keep it',effects:{relationship:{npcSelector:'payload',delta:8},secondary:{karma:5},stats:{happiness:3}}},
      {id:'ask_more',label:'Ask for extra for the trouble',effects:{money:3800,relationship:{npcSelector:'payload',delta:-8},secondary:{karma:-3}}},
    ]
  },
  {
    id:'health_warning_signal',category:'health',title:'A Small Warning',
    descriptions:['You notice a recurring health concern that is easy to dismiss because it has not stopped you from living normally.'],
    minAge:20,maxAge:85,probability:.02,cooldown:14,tags:['health','aging'],choices:[
      {id:'check',label:'Get it checked',effects:{money:-240,health:3,secondary:{stress:-2,discipline:2}}},
      {id:'adjust',label:'Take better care of yourself',effects:{health:1,secondary:{discipline:3,stress:-1}}},
      {id:'ignore',label:'Ignore it for now',effects:{stats:{happiness:1},secondary:{stress:-1},schedule:{eventId:'delayed_health_warning_return',years:2}}},
    ]
  },
  {
    id:'delayed_health_warning_return',category:'health',title:'The Warning Returns',
    descriptions:['The health concern you ignored at age {ORIGIN_AGE} returns strongly enough that pretending not to notice is no longer convincing.'],
    minAge:22,maxAge:110,probability:0,cooldown:99,tags:['health','delayed'],choices:[
      {id:'care',label:'Seek care now',effects:{money:-700,health:1,secondary:{stress:3}}},
      {id:'rest',label:'Reduce your workload and recover',effects:{health:-1,stats:{happiness:-2},secondary:{stress:-5}}},
      {id:'keep_ignoring',label:'Keep pushing through',effects:{health:-8,stats:{happiness:-3},secondary:{stress:7,discipline:-2}}},
    ]
  },
  {
    id:'work_shortcut_offer',category:'work',title:'The Convenient Shortcut',
    descriptions:['A rushed deadline leaves you with a tempting option: sign off on work you did not fully review and hope the missing details never matter.'],
    minAge:18,maxAge:74,probability:.019,cooldown:15,tags:['work','requires:employed'],choices:[
      {id:'shortcut',label:'Take the shortcut',effects:{secondary:{workPerformance:4,stress:-3,karma:-3},schedule:{eventId:'delayed_work_shortcut_audit',years:2}}},
      {id:'slow_down',label:'Do it properly',effects:{secondary:{workPerformance:2,discipline:4,stress:3}}},
      {id:'raise_risk',label:'Tell your manager the deadline is unsafe',effects:{secondary:{confidence:3,reputation:2,stress:2}}},
    ]
  },
  {
    id:'delayed_work_shortcut_audit',category:'work',title:'That Shortcut Has a Receipt',
    descriptions:['A review traces an old mistake back to work you approved two years ago. The shortcut saved time then; it has excellent memory now.'],
    minAge:20,maxAge:90,probability:0,cooldown:99,tags:['work','delayed'],choices:[
      {id:'own_it',label:'Own the mistake',effects:{secondary:{workPerformance:-5,reputation:2,stress:6,karma:2},stats:{happiness:-3}}},
      {id:'deflect',label:'Deflect responsibility',outcomes:[{weight:35,text:'The explanation is accepted, narrowly.',effects:{secondary:{reputation:-2,stress:3,karma:-3}}},{weight:65,text:'The paper trail is clearer than your explanation.',effects:{secondary:{workPerformance:-12,reputation:-8,stress:9,karma:-5},stats:{happiness:-6}}}]},
      {id:'fix',label:'Fix the damage before arguing',effects:{secondary:{workPerformance:-2,discipline:4,stress:7},money:-400,stats:{happiness:-2}}},
    ]
  },
  {
    id:'friend_confidence_shared',category:'friends',title:'Not Yours to Tell',
    descriptions:['{NPC_NAME} trusts you with something deeply personal and asks you not to repeat it.'],
    minAge:13,maxAge:100,probability:.022,cooldown:16,tags:['friends','relationship','requires:friend','target:friend'],choices:[
      {id:'keep',label:'Keep their confidence',effects:{relationship:{npcSelector:'payload',delta:7},secondary:{karma:3,willpower:2}}},
      {id:'tell_one',label:'Tell one other person',effects:{relationship:{npcSelector:'payload',delta:-2},secondary:{karma:-4},stats:{happiness:2},schedule:{eventId:'delayed_friend_confidence_breach',years:2,npcSelector:'payload',requiredRelationshipTypes:['friend','best_friend','enemy']}}},
      {id:'use_it',label:'Use it during an argument later',effects:{relationship:{npcSelector:'payload',delta:-16},secondary:{karma:-7,reputation:-3},schedule:{eventId:'delayed_friend_confidence_breach',years:1,npcSelector:'payload',requiredRelationshipTypes:['friend','best_friend','enemy']}}},
    ]
  },
  {
    id:'delayed_friend_confidence_breach',category:'friends',title:'Secrets Travel',
    descriptions:['{NPC_NAME} learns that the private thing they trusted you with did not stay private.'],
    minAge:14,maxAge:110,probability:0,cooldown:99,tags:['friends','relationship','delayed'],choices:[
      {id:'apologize',label:'Apologize without excuses',effects:{relationship:{npcSelector:'payload',delta:-10},secondary:{karma:2,stress:5},stats:{happiness:-3}}},
      {id:'minimize',label:'Say it was not a big deal',effects:{relationship:{npcSelector:'payload',delta:-24},secondary:{karma:-4,reputation:-4},stats:{happiness:-5}}},
      {id:'repair',label:'Try to repair the trust',effects:{relationship:{npcSelector:'payload',delta:-6},money:-150,secondary:{stress:6,willpower:2},stats:{happiness:-2}}},
    ]
  },
  {
    id:'delayed_affair_discovery', category:'romance', title:'Old Secret, New Problem',
    descriptions:['Something you thought was buried in the past reaches your partner through somebody else. The timing could hardly be worse.'],
    minAge:18,maxAge:100,probability:0,cooldown:99,tags:['relationship','delayed'],choices:[
      {id:'confess',label:'Tell the full truth',effects:{relationship:{npcSelector:'payload',delta:-18},secondary:{karma:3,stress:8},stats:{happiness:-6}}},
      {id:'deny',label:'Deny it',outcomes:[{weight:25,text:'They believe you for now.',effects:{relationship:{npcSelector:'payload',delta:-4},secondary:{karma:-5}}},{weight:75,text:'The denial makes everything worse.',effects:{relationship:{npcSelector:'payload',delta:-35},secondary:{karma:-8,reputation:-5},stats:{happiness:-10}}}]},
      {id:'leave',label:'End the relationship',effects:{relationship:{npcSelector:'payload',delta:-60},stats:{happiness:-12},secondary:{stress:10}}},
    ]
  },
  {
    id:'work_layoff_wave',category:'work',title:'Layoff Wave',descriptions:['Your employer announces a restructuring. People start reading ordinary calendar invites like coded warnings.'],
    minAge:18,maxAge:75,probability:.018,cooldown:12,tags:['work','requires:employed'],choices:[
      {id:'prepare',label:'Prepare quietly',effects:{secondary:{discipline:4,stress:3}}},
      {id:'network',label:'Start networking',effects:{secondary:{charisma:3,confidence:2},money:-100}},
      {id:'ignore',label:'Ignore the rumors',effects:{stats:{happiness:2},secondary:{stress:-2}}},
    ]
  },
  {
    id:'inheritance_notice',category:'money',title:'An Old Envelope',descriptions:['A legal notice arrives: a relative has left you something in their estate.'],
    minAge:18,maxAge:100,probability:.012,cooldown:20,tags:['family','money'],choices:[
      {id:'accept',label:'Accept the inheritance',outcomes:[{weight:70,text:'The inheritance is modest but meaningful.',effects:{money:12000,stats:{happiness:4}}},{weight:25,text:'The estate is larger than anyone expected.',effects:{money:85000,stats:{happiness:7}}},{weight:5,text:'The relative was quietly wealthy.',effects:{money:650000,stats:{happiness:10}}}]},
      {id:'decline',label:'Decline it',effects:{secondary:{karma:4},stats:{happiness:1}}},
    ]
  },
  {
    id:'lottery_jackpot',category:'money',title:'Impossible Numbers',descriptions:['The numbers line up. Then you check again. And again. Your fictional lottery ticket has won an absurd jackpot.'],
    minAge:18,maxAge:100,probability:.00008,cooldown:100,tags:['luck','lottery'],choices:[
      {id:'claim',label:'Claim the jackpot',effects:{money:24000000,stats:{happiness:20},secondary:{stress:8},fame:8}},
      {id:'anonymous',label:'Claim it as privately as possible',effects:{money:23500000,stats:{happiness:18},secondary:{stress:2}}},
    ]
  },
  {
    id:'late_life_reunion',category:'relationships',title:'A Name From Decades Ago',descriptions:['A person you have not spoken to in decades reaches out with a simple message: “I was thinking about you.”'],
    minAge:45,maxAge:105,probability:.025,cooldown:15,tags:['relationship','aging'],choices:socialChoices(42)
  },
  {
    id:'midlife_reassessment',category:'aging',title:'The Middle Distance',descriptions:['You catch yourself measuring life less by what you planned and more by what actually happened.'],
    minAge:38,maxAge:58,probability:.035,cooldown:10,tags:['aging','moral'],choices:[
      {id:'change',label:'Change something important',effects:{stats:{happiness:5},secondary:{confidence:5,stress:2}}},
      {id:'appreciate',label:'Appreciate what you built',effects:{stats:{happiness:6},secondary:{stress:-4}}},
      {id:'avoid',label:'Buy something unnecessary instead',effects:{money:-1800,stats:{happiness:4},secondary:{stress:-1}}},
    ]
  },
];

export const lifeEvents: GameEventDefinition[] = [...families.flatMap(makeFamilyEvents), ...fixedEvents];
export const eventById = Object.fromEntries(lifeEvents.map(event => [event.id,event])) as Record<string,GameEventDefinition>;
