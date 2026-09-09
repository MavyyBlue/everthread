import type { ChoiceEffect, EventChoice, GameEventDefinition } from '../types/game';

export type CoherentTargetSelector = 'friend' | 'family' | 'romantic' | 'school_peer' | 'school_authority' | 'work' | 'work_peer' | 'work_boss';

const PROCEDURAL_PATTERN = /_\d+$/;

function direct(id:string,label:string,effects:ChoiceEffect):EventChoice{return{id,label,effects};}
function risk(id:string,label:string,goodText:string,goodEffects:ChoiceEffect,badText:string,badEffects:ChoiceEffect,goodWeight=55):EventChoice{
  return{id,label,outcomes:[{weight:goodWeight,text:goodText,effects:goodEffects},{weight:100-goodWeight,text:badText,effects:badEffects}]};
}
function target(delta:number):ChoiceEffect['relationship']{return{npcSelector:'payload',delta};}
function variant(event:GameEventDefinition){const match=event.id.match(/_(\d+)$/);return Math.max(1,Number(match?.[1]??1));}

export const COHERENT_PROCEDURAL_TITLES = new Set<string>([
  'The Missing Toy','The Unfair Rule','The Secret Club','The Broken Thing','The New Kid','The Dare','The Stray Animal','The Last Treat',
  'The Surprise Quiz','Group Project Gravity','Borrowed Notes','The Presentation',"Teacher’s Favorite",'Club Election','Academic Shortcut','The Rumor Desk',
  'The Overshare','The Forgotten Plan','The Favor','The New Crowd','The Honest Opinion','The Loan Request','The Bad Joke','The Old Grudge',
  'Family Favor','Old Comparison','Money Between Relatives','The Care Question','Unexpected Guest','Family Secret','Sibling Competition','The Apology Window',
  'Mixed Signals','The Ex Question','Future Plans','The Forgotten Date','Jealous Moment','Unexpected Gift','Phone Face Down','The Big Question',
  'Credit Where Due','Impossible Deadline','Boss Wants a Word','Coworker Meltdown','The Shortcut','Office Rumor','Client Disaster','Promotion Whisper',
  'Unexpected Refund','Convenient Upgrade','Fee With Attitude','The Bargain','Shared Expense','Cash Windfall',
  'Not Quite Right','Persistent Ache','Sleep Debt','Stress Signal','Fitness Slump','Routine Check',
  'Wrong Turn, Maybe','Local Invitation','Weather Pivot','Lost Item','Overbooked',
  'Recognized in Public','Quote Goes Sideways','Fan Gift','Brand Offer','Trending Clip',
  'Questionable Opportunity','Witnessed Trouble','Found Wallet','Suspicious Package','Old Acquaintance',
  'The Unlabeled Box','Coincidence Stack','The Tiny Parade','Mysterious Contest','The Prophecy Coupon',
]);

export function isProceduralLifeEvent(event:GameEventDefinition){return PROCEDURAL_PATTERN.test(event.id)&&COHERENT_PROCEDURAL_TITLES.has(event.title);}

/**
 * Returns undefined when EventSystem should keep its legacy inference,
 * null when this event intentionally has no exact NPC target, or a selector
 * when the event should bind one exact persistent relationship.
 */
export function coherentTargetSelector(event:GameEventDefinition):CoherentTargetSelector|null|undefined{
  if(event.id==='late_life_reunion')return'friend';
  if(!isProceduralLifeEvent(event))return undefined;
  if(event.category==='friends')return'friend';
  if(event.category==='family')return'family';
  if(event.category==='romance')return'romantic';
  if(event.category==='school'){
    if(['Group Project Gravity','Borrowed Notes',"Teacher’s Favorite",'Club Election','The Rumor Desk'].includes(event.title))return'school_peer';
    return null;
  }
  if(event.category==='work'){
    if(['Credit Where Due','Coworker Meltdown','Office Rumor'].includes(event.title))return'work_peer';
    if(['Impossible Deadline','Boss Wants a Word','Promotion Whisper'].includes(event.title))return'work_boss';
    return null;
  }
  return null;
}

export function coherentEventChoices(event:GameEventDefinition):EventChoice[]{
  if(!isProceduralLifeEvent(event)){
    if(event.id==='late_life_reunion')return[
      direct('reply_warmly','Reply warmly',{relationship:target(7),stats:{happiness:4},secondary:{stress:-2}}),
      direct('reply_carefully','Reply, but keep some distance',{relationship:target(2),secondary:{willpower:2}}),
      direct('leave_unanswered','Leave the message unanswered',{relationship:target(-4),secondary:{stress:-1}}),
    ];
    return event.choices;
  }

  const v=variant(event);
  switch(event.title){
    // Childhood
    case 'The Missing Toy': return[
      direct('help_search','Help search for it',{stats:{happiness:1},secondary:{karma:3,willpower:1}}),
      direct('explain_yourself','Explain what you know',{secondary:{confidence:2,reputation:1}}),
      direct('blame_someone','Blame somebody else',{stats:{happiness:1},secondary:{karma:-3,reputation:-2}}),
    ];
    case 'The Unfair Rule': return[
      direct('follow_rule','Follow the rule anyway',{secondary:{discipline:3,willpower:1},stats:{happiness:-2}}),
      direct('ask_why','Ask why the rule exists',{secondary:{confidence:2,charisma:1}}),
      risk('break_rule','Break it when nobody is looking','You get away with it.',{stats:{happiness:4},secondary:{discipline:-2}},'You get caught almost immediately.',{stats:{happiness:-3},secondary:{discipline:-3,reputation:-2}},55),
    ];
    case 'The Secret Club': return[
      direct('join_club','Join the secret club',{stats:{happiness:4},secondary:{charisma:2,confidence:1}}),
      direct('make_own','Start your own rival club',{stats:{happiness:3},secondary:{creativity:3,confidence:2}}),
      direct('decline_club','Decline politely',{secondary:{willpower:2}}),
    ];
    case 'The Broken Thing': return[
      direct('tell_truth','Tell the truth about what happened',{secondary:{karma:3,discipline:2},stats:{happiness:-1}}),
      direct('help_fix','Help fix or replace it',{secondary:{karma:2,creativity:1},stats:{happiness:1}}),
      direct('pretend_nothing','Pretend you saw nothing',{secondary:{karma:-2,stress:2}}),
    ];
    case 'The New Kid': return[
      direct('say_hello','Go say hello',{stats:{happiness:3},secondary:{charisma:2,karma:2}}),
      direct('invite_group','Invite them into the group',{stats:{happiness:3},secondary:{confidence:2,karma:3}}),
      direct('keep_playing','Keep doing your own thing',{secondary:{willpower:1}}),
    ];
    case 'The Dare': return[
      direct('refuse_dare','Refuse the dare',{secondary:{willpower:3,discipline:2}}),
      risk('take_dare','Take the dare','It is ridiculous and harmless.',{stats:{happiness:5},secondary:{confidence:2}},'It ends with a bump and an embarrassed explanation.',{stats:{health:-2,happiness:-2},secondary:{stress:2}},68),
      direct('change_dare','Suggest a safer dare',{stats:{happiness:2},secondary:{creativity:2,charisma:1}}),
    ];
    case 'The Stray Animal': return[
      direct('find_help','Find an adult who can help',{secondary:{karma:3,discipline:2},stats:{happiness:2}}),
      direct('stay_with_it','Stay nearby until it is safe',{secondary:{karma:4},stats:{happiness:3}}),
      direct('leave_it','Leave it alone',{secondary:{willpower:1},stats:{happiness:-1}}),
    ];
    case 'The Last Treat': return[
      direct('share_treat','Split it',{stats:{happiness:2},secondary:{karma:3}}),
      direct('take_treat','Claim it first',{stats:{happiness:4},secondary:{karma:-2}}),
      direct('give_away','Let somebody else have it',{stats:{happiness:1},secondary:{karma:4,willpower:1}}),
    ];

    // School
    case 'The Surprise Quiz': return[
      direct('focus_quiz','Focus and do your best',{secondary:{academicPerformance:4,discipline:2,stress:2}}),
      direct('educated_guess','Use careful guesses',{secondary:{academicPerformance:1,confidence:2}}),
      risk('cheat_quiz','Sneak a look at somebody else’s answers','Nobody notices this time.',{secondary:{academicPerformance:3,karma:-3,discipline:-2}},'The shortcut is obvious.',{secondary:{academicPerformance:-6,reputation:-5,discipline:-4},stats:{happiness:-3}},35),
    ];
    case 'Group Project Gravity': return[
      direct('organize_group','Organize the workload',{relationship:target(5),secondary:{academicPerformance:4,discipline:2,stress:2}}),
      direct('ask_partner','Ask your classmate what they can own',{relationship:target(7),secondary:{academicPerformance:2,charisma:2}}),
      direct('coast_group','Let the group carry you',{relationship:target(-8),secondary:{academicPerformance:-4,discipline:-3},stats:{happiness:2}}),
    ];
    case 'Borrowed Notes': return[
      direct('share_notes','Share your notes',{relationship:target(7),secondary:{karma:2,academicPerformance:1}}),
      direct('study_together','Offer to study together instead',{relationship:target(9),secondary:{academicPerformance:3,charisma:2,stress:1}}),
      direct('decline_notes','Keep your notes to yourself',{relationship:target(-3),secondary:{willpower:2}}),
    ];
    case 'The Presentation': return[
      direct('present_confidently','Present with confidence',{secondary:{academicPerformance:4,confidence:4,charisma:2,stress:2}}),
      direct('stick_notes','Stick closely to your notes',{secondary:{academicPerformance:2,discipline:2,stress:1}}),
      risk('improvise','Improvise most of it','The room responds to your energy.',{secondary:{academicPerformance:2,charisma:4,confidence:3}},'The missing preparation becomes visible.',{secondary:{academicPerformance:-4,stress:4,confidence:-2}},48),
    ];
    case "Teacher’s Favorite": return[
      direct('defuse_favorite','Defuse the accusation',{relationship:target(4),secondary:{charisma:3,reputation:2}}),
      direct('acknowledge_help','Acknowledge the help you receive',{relationship:target(2),secondary:{karma:2,confidence:1}}),
      direct('snap_back','Snap back at them',{relationship:target(-7),secondary:{reputation:-3,stress:3},stats:{happiness:1}}),
    ];
    case 'Club Election': return[
      direct('run_positive','Run a positive campaign',{relationship:target(4),secondary:{charisma:4,confidence:4,reputation:3}}),
      direct('support_peer','Support your classmate instead',{relationship:target(8),secondary:{karma:3,reputation:2}}),
      risk('campaign_hard','Campaign aggressively','You make yourself hard to ignore.',{relationship:target(1),secondary:{confidence:5,reputation:2,stress:3}},'People get tired of the intensity.',{relationship:target(-5),secondary:{reputation:-4,stress:5}},55),
    ];
    case 'Academic Shortcut': return[
      direct('do_work','Do the work properly',{secondary:{academicPerformance:5,discipline:4,stress:2}}),
      direct('ask_help','Ask for legitimate help',{secondary:{academicPerformance:3,charisma:1,stress:-1}}),
      risk('take_shortcut','Use the shortcut','It works this once.',{secondary:{academicPerformance:2,discipline:-3,karma:-2}},'The shortcut costs you academically.',{secondary:{academicPerformance:-7,reputation:-4,discipline:-4}},40),
    ];
    case 'The Rumor Desk': return[
      direct('stop_rumor','Refuse to spread it',{relationship:target(3),secondary:{karma:3,reputation:3}}),
      direct('warn_subject','Warn your classmate privately',{relationship:target(8),secondary:{karma:4,charisma:1}}),
      direct('spread_rumor','Pass it along',{relationship:target(-10),secondary:{karma:-5,reputation:-4},stats:{happiness:2}}),
    ];

    // Friends
    case 'The Overshare': return[
      direct('keep_confidence','Keep their confidence',{relationship:target(7),secondary:{karma:3,willpower:2}}),
      direct('offer_support','Offer support without prying',{relationship:target(9),secondary:{charisma:2,karma:2},stats:{happiness:1}}),
      direct('repeat_secret','Repeat it to somebody else',{relationship:target(-12),secondary:{karma:-6,reputation:-4},stats:{happiness:1}}),
    ];
    case 'The Forgotten Plan': return[
      direct('reschedule','Reschedule without making it a fight',{relationship:target(5),secondary:{stress:-2,charisma:1}}),
      direct('say_hurt','Tell them it hurt your feelings',{relationship:target(2),secondary:{confidence:3,stress:1}}),
      direct('cancel_back','Cancel the next plan out of spite',{relationship:target(-7),secondary:{karma:-2},stats:{happiness:1}}),
    ];
    case 'The Favor': return[
      direct('help_friend','Help them out',{relationship:target(8),secondary:{karma:3},stats:{happiness:2}}),
      direct('limited_help','Offer limited help',{relationship:target(4),secondary:{willpower:2,stress:1}}),
      direct('refuse_favor','Say no',{relationship:target(-3),secondary:{willpower:3}}),
    ];
    case 'The New Crowd': return[
      direct('meet_crowd','Give the new crowd a chance',{relationship:target(5),secondary:{charisma:3,confidence:2}}),
      direct('talk_friend','Tell your friend you feel pushed out',{relationship:target(3),secondary:{confidence:3,stress:1}}),
      direct('withdraw','Pull away from the friendship',{relationship:target(-8),secondary:{stress:-1},stats:{happiness:-2}}),
    ];
    case 'The Honest Opinion': return[
      direct('kind_honesty','Be honest but kind',{relationship:target(6),secondary:{charisma:3,karma:2}}),
      direct('pure_praise','Give them the praise they want',{relationship:target(4),secondary:{karma:-1},stats:{happiness:1}}),
      direct('brutal_honesty','Be brutally honest',{relationship:target(-6),secondary:{confidence:2,reputation:-2}}),
    ];
    case 'The Loan Request': {
      const loan=450+v*75;
      return[
        direct('lend_friend',`Lend ${loan.toLocaleString('en-US')}`,{money:-loan,relationship:target(8),secondary:{karma:3,stress:2}}),
        direct('gift_friend',`Give ${Math.round(loan*.4).toLocaleString('en-US')} with no repayment expected`,{money:-Math.round(loan*.4),relationship:target(6),secondary:{karma:4}}),
        direct('decline_loan','Decline the loan',{relationship:target(-3),secondary:{willpower:3,stress:1}}),
      ];
    }
    case 'The Bad Joke': return[
      direct('apologize_joke','Apologize for the joke',{relationship:target(7),secondary:{karma:2,charisma:1}}),
      direct('check_in','Check in with your friend privately',{relationship:target(8),secondary:{charisma:2,stress:1}}),
      direct('double_down','Double down on the joke',{relationship:target(-9),secondary:{reputation:-3,karma:-3},stats:{happiness:1}}),
    ];
    case 'The Old Grudge': return[
      direct('resolve_grudge','Try to finally resolve it',{relationship:target(9),secondary:{stress:2,willpower:2}}),
      direct('set_boundary_grudge','Set a boundary and move forward',{relationship:target(1),secondary:{willpower:4,stress:-1}}),
      direct('reopen_grudge','Reopen every old detail',{relationship:target(-10),secondary:{stress:5},stats:{happiness:-2}}),
    ];

    // Family
    case 'Family Favor': return[
      direct('do_family_favor','Make time to help',{relationship:target(8),secondary:{karma:3,stress:2}}),
      direct('partial_family_favor','Offer a smaller amount of help',{relationship:target(4),secondary:{willpower:2}}),
      direct('decline_family_favor','Decline the favor',{relationship:target(-4),secondary:{willpower:3}}),
    ];
    case 'Old Comparison': return[
      direct('laugh_comparison','Brush off the comparison',{relationship:target(2),secondary:{confidence:3,stress:-2}}),
      direct('address_comparison','Say the comparison bothers you',{relationship:target(3),secondary:{confidence:4,stress:1}}),
      direct('compete_comparison','Turn it into a competition',{relationship:target(-4),secondary:{confidence:2,stress:3}}),
    ];
    case 'Money Between Relatives': {
      const amount=300+v*90;
      return[
        direct('pay_share',`Cover ${amount.toLocaleString('en-US')} of the disputed expense`,{money:-amount,relationship:target(7),secondary:{karma:2}}),
        direct('split_share','Propose an even split',{money:-Math.round(amount*.5),relationship:target(3),secondary:{confidence:2,stress:1}}),
        direct('refuse_share','Refuse to pay',{relationship:target(-7),secondary:{willpower:3,stress:3}}),
      ];
    }
    case 'The Care Question': return[
      direct('take_care_role','Take on more of the care',{relationship:target(9),secondary:{karma:4,stress:6},stats:{happiness:-1}}),
      direct('share_care_role','Help organize shared support',{relationship:target(6),secondary:{charisma:2,stress:3}}),
      direct('cannot_care','Say you cannot take this on',{relationship:target(-4),secondary:{willpower:4,stress:2}}),
    ];
    case 'Unexpected Guest': return[
      direct('welcome_guest','Make room for them',{relationship:target(7),secondary:{karma:2,stress:2},stats:{happiness:2}}),
      direct('short_visit','Welcome them, but set a limit',{relationship:target(3),secondary:{willpower:3}}),
      direct('send_away','Tell them this is not a good time',{relationship:target(-6),secondary:{stress:-2,confidence:2}}),
    ];
    case 'Family Secret': return[
      direct('listen_secret','Listen without judging',{relationship:target(7),secondary:{charisma:2,karma:2}}),
      direct('ask_questions','Ask careful questions',{relationship:target(4),secondary:{confidence:2,stress:1}}),
      direct('spread_family_secret','Tell another relative',{relationship:target(-10),secondary:{karma:-5,reputation:-3}}),
    ];
    case 'Sibling Competition': return[
      direct('friendly_compete','Keep the competition friendly',{relationship:target(4),secondary:{confidence:2,stress:1}}),
      direct('team_up_sibling','Turn it into teamwork',{relationship:target(8),secondary:{charisma:2,karma:2}}),
      direct('must_win_sibling','Make winning personal',{relationship:target(-7),secondary:{stress:4,confidence:2}}),
    ];
    case 'The Apology Window': return[
      direct('apologize_family','Offer a sincere apology',{relationship:target(10),secondary:{karma:3,stress:2}}),
      direct('meet_halfway','Ask to meet halfway',{relationship:target(5),secondary:{confidence:2,charisma:2}}),
      direct('wait_apology','Wait for them to apologize first',{relationship:target(-3),secondary:{willpower:2,stress:2}}),
    ];

    // Romance
    case 'Mixed Signals': return[
      direct('ask_directly','Ask what they mean',{relationship:target(5),secondary:{confidence:3,charisma:2,stress:-1}}),
      direct('give_space','Give them some space',{relationship:target(1),secondary:{willpower:2}}),
      direct('assume_worst','Assume the worst',{relationship:target(-5),secondary:{stress:4},stats:{happiness:-3}}),
    ];
    case 'The Ex Question': return[
      direct('talk_ex_openly','Talk about it openly',{relationship:target(5),secondary:{confidence:2,stress:1}}),
      direct('set_ex_boundary','Set a boundary around the topic',{relationship:target(2),secondary:{willpower:3}}),
      direct('get_jealous_ex','Get openly jealous',{relationship:target(-7),secondary:{stress:5},stats:{happiness:-3}}),
    ];
    case 'Future Plans': return[
      direct('share_future','Share what you actually want',{relationship:target(7),secondary:{confidence:3},stats:{happiness:2}}),
      direct('ask_future','Ask what they want first',{relationship:target(5),secondary:{charisma:2}}),
      direct('avoid_future','Change the subject',{relationship:target(-4),secondary:{stress:-1},stats:{happiness:1}}),
    ];
    case 'The Forgotten Date': return[
      direct('talk_date','Talk about why it mattered',{relationship:target(3),secondary:{confidence:2,stress:1}}),
      direct('forgive_date','Forgive it and make a new plan',{relationship:target(7),stats:{happiness:3},secondary:{karma:2}}),
      direct('punish_date','Make them feel guilty all day',{relationship:target(-8),secondary:{karma:-3,stress:3}}),
    ];
    case 'Jealous Moment': return[
      direct('reassure_jealous','Offer reassurance',{relationship:target(6),secondary:{charisma:2,stress:-1}}),
      direct('discuss_jealous','Discuss the jealousy directly',{relationship:target(3),secondary:{confidence:3,stress:2}}),
      direct('mock_jealous','Mock the reaction',{relationship:target(-9),secondary:{reputation:-2},stats:{happiness:1}}),
    ];
    case 'Unexpected Gift': return[
      direct('accept_gift','Accept it warmly',{relationship:target(7),stats:{happiness:4},secondary:{karma:1}}),
      direct('ask_gift','Ask what inspired it',{relationship:target(5),secondary:{charisma:2}}),
      direct('decline_gift','Decline because it feels like too much',{relationship:target(-2),secondary:{willpower:3}}),
    ];
    case 'Phone Face Down': return[
      direct('ask_phone','Ask about it without accusing',{relationship:target(3),secondary:{confidence:3,stress:2}}),
      direct('trust_phone','Choose to trust them',{relationship:target(5),secondary:{willpower:2,stress:-2}}),
      direct('accuse_phone','Accuse them of hiding something',{relationship:target(-8),secondary:{stress:6},stats:{happiness:-3}}),
    ];
    case 'The Big Question': return[
      direct('answer_honestly','Answer honestly',{relationship:target(7),secondary:{confidence:4},stats:{happiness:2}}),
      direct('need_time','Ask for time to think',{relationship:target(1),secondary:{willpower:3,stress:2}}),
      direct('avoid_big_question','Refuse to answer',{relationship:target(-6),secondary:{stress:3}}),
    ];

    // Work
    case 'Credit Where Due': return[
      direct('document_credit','Document your contribution',{relationship:target(-2),secondary:{workPerformance:3,confidence:3,reputation:2},workplace:{reputation:3,tension:1}}),
      direct('talk_credit','Talk to the coworker privately',{relationship:target(5),secondary:{workPerformance:2,stress:2},workplace:{tension:-3,culture:2}}),
      direct('let_credit_go','Let it go this time',{relationship:target(-2),secondary:{stress:3,workPerformance:-1},workplace:{tension:2}}),
    ];
    case 'Impossible Deadline': return[
      direct('renegotiate_deadline','Renegotiate the deadline',{relationship:target(3),secondary:{workPerformance:3,confidence:3,stress:2},workplace:{tension:-2,reputation:2}}),
      direct('push_deadline','Push hard to meet it',{relationship:target(1),secondary:{workPerformance:5,stress:7,discipline:3},stats:{happiness:-2}}),
      direct('refuse_deadline','Refuse the deadline as unrealistic',{relationship:target(-5),secondary:{workPerformance:-2,confidence:2,stress:2},workplace:{tension:5}}),
    ];
    case 'Boss Wants a Word': return[
      direct('listen_boss','Listen carefully',{relationship:target(5),secondary:{workPerformance:3,discipline:2,stress:2},workplace:{reputation:2}}),
      direct('advocate_boss','Advocate for your work',{relationship:target(2),secondary:{confidence:4,charisma:2,workPerformance:2},workplace:{reputation:3}}),
      direct('defensive_boss','Get defensive',{relationship:target(-8),secondary:{workPerformance:-4,stress:5},workplace:{tension:6,reputation:-4}}),
    ];
    case 'Coworker Meltdown': return[
      direct('help_coworker','Help them stabilize the workload',{relationship:target(8),secondary:{workPerformance:2,karma:3,stress:3},workplace:{morale:3,culture:3}}),
      direct('tell_manager','Tell the manager the team needs help',{relationship:target(1),secondary:{confidence:2,stress:2},workplace:{tension:-2,reputation:2}}),
      direct('ignore_coworker','Ignore it and protect your own workload',{relationship:target(-5),secondary:{workPerformance:2,willpower:2},workplace:{morale:-2}}),
    ];
    case 'The Shortcut': return[
      direct('proper_process','Use the proper process',{secondary:{workPerformance:3,discipline:4,stress:2},workplace:{reputation:2}}),
      risk('use_shortcut','Use the shortcut','It saves the deadline.',{secondary:{workPerformance:4,stress:-2,discipline:-2},workplace:{tension:-1}},'The shortcut creates cleanup work.',{secondary:{workPerformance:-6,stress:5,reputation:-3},workplace:{tension:5,reputation:-3}},58),
      direct('propose_change','Propose changing the process officially',{secondary:{confidence:3,charisma:2,workPerformance:2},workplace:{culture:3,reputation:2}}),
    ];
    case 'Office Rumor': return[
      direct('stop_office_rumor','Do not repeat it',{relationship:target(2),secondary:{discipline:2,reputation:2},workplace:{tension:-2,culture:2}}),
      direct('check_officially','Seek official clarification',{relationship:target(1),secondary:{confidence:2,stress:1},workplace:{tension:-3,reputation:2}}),
      direct('spread_office_rumor','Pass it along',{relationship:target(4),secondary:{reputation:-4,stress:2},workplace:{tension:6,culture:-3}}),
    ];
    case 'Client Disaster': return[
      direct('own_client_problem','Own your part and fix it',{secondary:{workPerformance:5,discipline:3,stress:5,reputation:2},workplace:{reputation:4,tension:-2}}),
      direct('explain_client_problem','Explain what was and was not yours',{secondary:{confidence:3,workPerformance:2,stress:3},workplace:{reputation:1}}),
      direct('deflect_client_problem','Deflect responsibility',{secondary:{workPerformance:-4,reputation:-4,stress:2},workplace:{tension:5,reputation:-5}}),
    ];
    case 'Promotion Whisper': return[
      direct('prepare_promotion','Quietly prepare for the opening',{relationship:target(2),secondary:{workPerformance:5,discipline:3,confidence:2},workplace:{reputation:3}}),
      direct('ask_promotion','Ask your boss what would make you competitive',{relationship:target(5),secondary:{workPerformance:3,charisma:3,confidence:3},workplace:{reputation:2}}),
      direct('campaign_promotion','Campaign loudly for it',{relationship:target(-2),secondary:{confidence:4,reputation:-2,stress:3},workplace:{tension:4}}),
    ];

    // Money
    case 'Unexpected Refund': {
      const refund=220+v*85;return[
        direct('bank_refund','Put the refund into cash reserves',{money:refund,secondary:{discipline:3}}),
        direct('spend_refund','Spend part of the refund',{money:Math.round(refund*.35),stats:{happiness:4},secondary:{discipline:-1}}),
        direct('share_refund','Use part of it generously',{money:Math.round(refund*.55),secondary:{karma:3},stats:{happiness:2}}),
      ];
    }
    case 'Convenient Upgrade': {
      const cost=300+v*95;return[
        direct('skip_upgrade','Skip the upgrade',{secondary:{discipline:3,willpower:2}}),
        direct('buy_upgrade',`Buy it for ${cost.toLocaleString('en-US')}`,{money:-cost,stats:{happiness:5},secondary:{discipline:-1}}),
        direct('wait_sale','Wait and compare options',{secondary:{discipline:2,willpower:2},stats:{happiness:1}}),
      ];
    }
    case 'Fee With Attitude': {
      const fee=90+v*35;return[
        direct('pay_fee',`Pay the ${fee.toLocaleString('en-US')} fee`,{money:-fee,secondary:{stress:-1}}),
        risk('contest_fee','Contest the fee','The fee is reversed.',{money:fee,secondary:{confidence:2,stress:-1}},'The fee stands after a frustrating dispute.',{money:-fee,secondary:{stress:4}},48),
        direct('budget_fee','Pay it and adjust the budget',{money:-fee,secondary:{discipline:3,stress:1}}),
      ];
    }
    case 'The Bargain': {
      const cost=180+v*70;return[
        direct('buy_bargain',`Buy the useful item for ${cost.toLocaleString('en-US')}`,{money:-cost,stats:{happiness:3},secondary:{discipline:1}}),
        direct('skip_bargain','Skip it because you do not need it',{secondary:{discipline:3,willpower:2}}),
        direct('compare_bargain','Compare prices first',{secondary:{discipline:2},stats:{happiness:1}}),
      ];
    }
    case 'Shared Expense': {
      const cost=240+v*45;return[
        direct('pay_fair_share',`Pay your ${cost.toLocaleString('en-US')} share`,{money:-cost,secondary:{discipline:2,stress:-1}}),
        direct('recalculate_share','Recalculate what everyone owes',{money:-Math.round(cost*.75),secondary:{confidence:2,stress:2}}),
        direct('refuse_shared_expense','Refuse the expense',{secondary:{willpower:3,stress:3}}),
      ];
    }
    case 'Cash Windfall': {
      const gain=500+v*140;return[
        direct('save_windfall',`Save the ${gain.toLocaleString('en-US')} windfall`,{money:gain,secondary:{discipline:3}}),
        direct('enjoy_windfall','Use part of it for fun',{money:Math.round(gain*.5),stats:{happiness:5}}),
        risk('risk_windfall','Try to turn it into more','The gamble pays off.',{money:Math.round(gain*1.6),stats:{happiness:5}},'Most of the windfall disappears.',{money:Math.round(gain*.15),stats:{happiness:-3},secondary:{stress:4}},38),
      ];
    }

    // Health
    case 'Not Quite Right': return[
      direct('rest_not_right','Rest and monitor it',{stats:{health:3,happiness:1},secondary:{stress:-3}}),
      direct('check_not_right','Get it checked',{money:-(120+v*10),stats:{health:5},secondary:{discipline:2,stress:-2}}),
      risk('ignore_not_right','Ignore it','It passes on its own.',{stats:{health:1}},'You feel worse for pushing through.',{stats:{health:-4,happiness:-2},secondary:{stress:4}},45),
    ];
    case 'Persistent Ache': return[
      direct('rest_ache','Reduce strain for a while',{stats:{health:3},secondary:{stress:-2,discipline:2}}),
      direct('care_ache','Seek professional care',{money:-(180+v*15),stats:{health:6},secondary:{stress:-2}}),
      direct('push_ache','Push through it',{stats:{health:-4,happiness:-1},secondary:{stress:4,willpower:1}}),
    ];
    case 'Sleep Debt': return[
      direct('sleep_early','Protect your sleep schedule',{stats:{health:3,happiness:2},secondary:{stress:-5,discipline:3}}),
      direct('slow_evening','Cut back your evening obligations',{stats:{health:2},secondary:{stress:-4,willpower:2}}),
      direct('keep_sleep_debt','Keep running on too little sleep',{stats:{health:-3,happiness:-2},secondary:{stress:5,discipline:-2}}),
    ];
    case 'Stress Signal': return[
      direct('reduce_stress_load','Reduce your load',{stats:{health:2,happiness:2},secondary:{stress:-7,willpower:2}}),
      direct('talk_stress','Get support',{money:-(100+v*10),stats:{health:2},secondary:{stress:-5,confidence:1}}),
      direct('ignore_stress_signal','Keep pushing',{stats:{health:-3,happiness:-2},secondary:{stress:6}}),
    ];
    case 'Fitness Slump': return[
      direct('gentle_fitness','Scale activity back and rebuild',{stats:{health:3},secondary:{athleticism:2,discipline:2,stress:-1}}),
      direct('rest_fitness','Take a recovery break',{stats:{health:2,happiness:1},secondary:{stress:-3}}),
      direct('overtrain_fitness','Train harder out of frustration',{stats:{health:-3},secondary:{athleticism:1,stress:5}}),
    ];
    case 'Routine Check': return[
      direct('attend_check','Attend the check',{money:-(140+v*12),stats:{health:5},secondary:{discipline:2,stress:-2}}),
      direct('change_habit','Use it as motivation to improve habits',{stats:{health:3},secondary:{discipline:4}}),
      direct('skip_check','Skip it',{secondary:{stress:-1,discipline:-2}}),
    ];

    // Travel
    case 'Wrong Turn, Maybe': return[
      risk('take_detour','Take the interesting detour','The detour becomes the best part of the trip.',{stats:{happiness:6},secondary:{creativity:3}},'You lose time and patience.',{stats:{happiness:-1},secondary:{stress:3}},70),
      direct('stay_route','Stay on the planned route',{stats:{happiness:2},secondary:{stress:-2}}),
      direct('ask_directions','Ask someone for directions',{secondary:{charisma:2,confidence:1},stats:{happiness:2}}),
    ];
    case 'Local Invitation': return[
      direct('accept_invitation','Accept the invitation',{stats:{happiness:5},secondary:{charisma:3,confidence:2}}),
      direct('brief_invitation','Stop by briefly',{stats:{happiness:3},secondary:{charisma:2}}),
      direct('decline_invitation','Decline and keep your plans',{secondary:{willpower:2},stats:{happiness:1}}),
    ];
    case 'Weather Pivot': return[
      direct('new_weather_plan','Make a new indoor plan',{money:-(70+v*10),stats:{happiness:4},secondary:{creativity:2,stress:-1}}),
      direct('wait_weather','Wait it out',{stats:{happiness:1},secondary:{stress:-2}}),
      risk('ignore_weather','Continue anyway','The weather eases up.',{stats:{happiness:4}},'The outing becomes miserable.',{stats:{health:-2,happiness:-3},secondary:{stress:3}},42),
    ];
    case 'Lost Item': {
      const replacement=160+v*45;return[
        direct('search_item','Retrace your steps carefully',{secondary:{discipline:2,stress:2},stats:{happiness:1}}),
        risk('ask_lost_found','Ask around and check lost-and-found','Someone turned it in.',{stats:{happiness:5},secondary:{charisma:1,stress:-3}},'It is gone for good.',{money:-replacement,stats:{happiness:-4},secondary:{stress:4}},58),
        direct('replace_item',`Replace it for ${replacement.toLocaleString('en-US')}`,{money:-replacement,stats:{happiness:-1},secondary:{stress:-1}}),
      ];
    }
    case 'Overbooked': {
      const extra=220+v*55;return[
        direct('accept_delay','Accept the inconvenience',{stats:{happiness:-1},secondary:{stress:3,willpower:2}}),
        direct('pay_alternative',`Pay ${extra.toLocaleString('en-US')} for the easier alternative`,{money:-extra,stats:{happiness:3},secondary:{stress:-3}}),
        risk('negotiate_overbook','Negotiate for a better solution','You get a useful upgrade.',{stats:{happiness:5},secondary:{confidence:2,charisma:2}},'You spend a long time arguing and get nowhere.',{stats:{happiness:-2},secondary:{stress:4}},55),
      ];
    }

    // Fame
    case 'Recognized in Public': return[
      direct('greet_public','Be warm with the people who recognize you',{fame:2,reputation:4,secondary:{karma:2}}),
      direct('brief_public','Keep it brief and polite',{fame:1,reputation:2,secondary:{stress:-1}}),
      direct('dismiss_public','Brush them off',{fame:-1,reputation:-5,secondary:{stress:-2}}),
    ];
    case 'Quote Goes Sideways': return[
      direct('clarify_quote','Clarify what you meant',{fame:1,reputation:4,secondary:{stress:3,confidence:2}}),
      direct('ignore_quote','Let the cycle move on',{fame:-1,secondary:{stress:-2}}),
      risk('joke_quote','Make a joke about it','The joke resets the tone.',{fame:4,reputation:2,stats:{happiness:2}},'The second quote travels farther than the first.',{fame:3,reputation:-6,secondary:{stress:5}},48),
    ];
    case 'Fan Gift': return[
      direct('thank_fan','Thank the fan publicly',{fame:2,reputation:4,secondary:{karma:2}}),
      direct('private_thanks','Send a private thank-you',{reputation:3,secondary:{karma:3,stress:-1}}),
      direct('decline_fan_gift','Decline the gift politely',{fame:-1,reputation:1,secondary:{willpower:2}}),
    ];
    case 'Brand Offer': {
      const fee=1400+v*250;return[
        direct('take_brand',`Take the ${fee.toLocaleString('en-US')} endorsement`,{money:fee,fame:3,reputation:-1,secondary:{stress:2}}),
        direct('decline_brand','Decline the endorsement',{fame:-1,reputation:3,secondary:{willpower:2}}),
        risk('negotiate_brand','Negotiate better terms','They improve the offer.',{money:Math.round(fee*1.35),fame:2,reputation:1,secondary:{confidence:2}},'The brand walks away.',{fame:-1,secondary:{stress:2}},52),
      ];
    }
    case 'Trending Clip': return[
      direct('embrace_clip','Lean into the clip',{fame:5,reputation:1,stats:{happiness:3}}),
      direct('context_clip','Add context without feeding it too much',{fame:1,reputation:3,secondary:{confidence:2}}),
      direct('ignore_clip','Ignore it',{fame:-1,secondary:{stress:-3}}),
    ];

    // Crime / legal — intentionally abstract gameplay consequences only.
    case 'Questionable Opportunity': return[
      direct('walk_questionable','Walk away',{legalHeat:-2,secondary:{karma:2,willpower:3}}),
      direct('warn_questionable','Tell the person not to involve you again',{legalHeat:-1,secondary:{confidence:2,reputation:1}}),
      risk('take_questionable','Take the questionable opportunity','You get a small fictional payoff.',{money:350+v*25,legalHeat:4,secondary:{karma:-3,criminalNotoriety:3}},'The situation immediately attracts scrutiny.',{money:-120,legalHeat:9,secondary:{karma:-4,criminalNotoriety:4,reputation:-3}},34),
    ];
    case 'Witnessed Trouble': return[
      direct('call_help','Call for help',{legalHeat:-1,secondary:{karma:4,reputation:2},stats:{happiness:1}}),
      direct('leave_scene','Get yourself out of the situation',{secondary:{willpower:2,stress:1}}),
      risk('intervene_trouble','Intervene without escalating it','The situation settles safely.',{secondary:{karma:4,reputation:3},stats:{happiness:2}},'It gets messy before help arrives.',{stats:{health:-2},secondary:{stress:5}},68),
    ];
    case 'Found Wallet': {
      const cash=180+v*25;return[
        direct('return_wallet','Return the wallet intact',{secondary:{karma:5,reputation:3},stats:{happiness:2}}),
        direct('turn_in_wallet','Turn it in to lost-and-found',{secondary:{karma:4,discipline:2}}),
        direct('keep_wallet_cash',`Keep the ${cash.toLocaleString('en-US')} cash`,{money:cash,legalHeat:3,secondary:{karma:-6,reputation:-2}}),
      ];
    }
    case 'Suspicious Package': return[
      direct('leave_package','Leave it alone and alert staff',{legalHeat:-1,secondary:{discipline:3,willpower:2}}),
      direct('move_away','Move away from the area',{secondary:{willpower:2,stress:1}}),
      direct('mess_package','Mess with it anyway',{legalHeat:4,secondary:{stress:5,discipline:-4},stats:{happiness:-2}}),
    ];
    case 'Old Acquaintance': return[
      direct('decline_old_acquaintance','Decline the favor',{legalHeat:-1,secondary:{willpower:3,karma:2}}),
      direct('cut_contact','Cut contact',{legalHeat:-2,secondary:{willpower:4,stress:1}}),
      risk('accept_old_acquaintance','Accept the fictional favor','You get paid and hear nothing more.',{money:420+v*30,legalHeat:5,secondary:{criminalNotoriety:4,karma:-3}},'The favor creates legal trouble.',{money:-180,legalHeat:10,secondary:{criminalNotoriety:5,reputation:-4,karma:-4}},32),
    ];

    // Strange
    case 'The Unlabeled Box': return[
      risk('open_box','Open the box','It contains harmless oddities.',{stats:{happiness:5},secondary:{creativity:3}},'It contains junk and an unpleasant smell.',{stats:{happiness:-2},secondary:{stress:2}},60),
      direct('leave_box','Leave it alone',{secondary:{willpower:2}}),
      direct('document_box','Take a picture and move on',{secondary:{creativity:2},stats:{happiness:2}}),
    ];
    case 'Coincidence Stack': return[
      direct('track_coincidences','Write the coincidences down',{secondary:{creativity:4},stats:{happiness:3}}),
      direct('laugh_coincidences','Laugh it off',{stats:{happiness:4},secondary:{stress:-2}}),
      direct('obsess_coincidences','Spend the day obsessing over them',{stats:{happiness:1},secondary:{creativity:2,stress:5}}),
    ];
    case 'The Tiny Parade': return[
      direct('join_parade','Join the tiny parade',{stats:{happiness:6},secondary:{charisma:2,creativity:2}}),
      direct('watch_parade','Watch from the side',{stats:{happiness:4},secondary:{stress:-1}}),
      direct('leave_parade','Continue with your day',{secondary:{willpower:1}}),
    ];
    case 'Mysterious Contest': return[
      risk('enter_contest','Enter the contest','You somehow win a small prize.',{money:220+v*20,stats:{happiness:5},secondary:{confidence:2}},'You lose spectacularly but get a story out of it.',{stats:{happiness:2},secondary:{creativity:2}},42),
      direct('observe_contest','Watch first',{stats:{happiness:3},secondary:{creativity:2}}),
      direct('skip_contest','Skip the unclear contest',{secondary:{willpower:2}}),
    ];
    case 'The Prophecy Coupon': return[
      direct('keep_coupon','Keep the prophecy coupon',{stats:{happiness:3},secondary:{creativity:3}}),
      direct('use_coupon','Use the discount and ignore the prophecy',{money:60+v*5,stats:{happiness:2},secondary:{willpower:2}}),
      direct('discard_coupon','Throw it away',{secondary:{willpower:2,stress:-1}}),
    ];
    default:return event.choices;
  }
}

export function eventImpactDomains(choice:EventChoice){
  const domains=new Set<string>();
  const inspect=(effect:ChoiceEffect|undefined)=>{
    if(!effect)return;
    if(effect.stats)domains.add('stats');
    if(effect.secondary)domains.add('secondary');
    if(effect.money!==undefined)domains.add('money');
    if(effect.relationship)domains.add('relationship');
    if(effect.fame!==undefined||effect.reputation!==undefined)domains.add('fame');
    if(effect.workplace)domains.add('workplace');
    if(effect.health!==undefined)domains.add('health');
    if(effect.legalHeat!==undefined)domains.add('legal');
    if(effect.schedule)domains.add('delayed');
  };
  inspect(choice.effects);for(const outcome of choice.outcomes??[])inspect(outcome.effects);return domains;
}
