import type { GameEventDefinition } from '../types/game';

export const systemicConsequenceEvents:GameEventDefinition[]=[
  {
    id:'systemic_parenting_presence_return',category:'family',title:'They Remember You Showing Up',
    descriptions:[
      '{NPC_FIRST} brings up a small memory from when you made time for them at age {ORIGIN_AGE}. It mattered more than you knew.',
      'Years later, {NPC_FIRST} remembers a day when you chose to be present. They want to know whether that closeness still matters to you.',
      '{NPC_FIRST} tells you that one ordinary stretch of time together became one of the memories they kept. The conversation turns unexpectedly important.',
    ],
    minAge:0,maxAge:110,probability:0,cooldown:99,tags:['family','systemic','delayed','phase7b1'],choices:[
      {id:'lean_in',label:'Tell them they still matter',effects:{relationship:{npcSelector:'payload',delta:10},stats:{happiness:3},secondary:{karma:2}}},
      {id:'listen',label:'Listen to what they remember',effects:{relationship:{npcSelector:'payload',delta:6},secondary:{confidence:1,stress:-1}}},
      {id:'minimize',label:'Brush it off as no big deal',effects:{relationship:{npcSelector:'payload',delta:-8},stats:{happiness:-2},secondary:{stress:2}}},
    ],
  },
  {
    id:'systemic_school_conduct_return',category:'school',title:'The Shortcut Comes Back',
    descriptions:[
      'A later reference or application reaches {WORLD_NAME}, and an old academic shortcut from age {ORIGIN_AGE} comes back into the conversation.',
      '{WORLD_NAME} is asked about your old student record. One academic shortcut is still part of the story they can tell about you.',
      'Something you once treated as a school shortcut has lasted longer than the moment itself. {WORLD_NAME} now wants your response on record.',
    ],
    minAge:10,maxAge:110,probability:0,cooldown:99,tags:['school','systemic','delayed','phase7b1'],choices:[
      {id:'own_it',label:'Take responsibility for it',effects:{school:{conduct:8,socialStanding:2},secondary:{discipline:3,reputation:2,stress:2,karma:2}}},
      {id:'repair_record',label:'Ask how you can repair the record',effects:{school:{conduct:12,socialStanding:4},secondary:{discipline:2,reputation:3,stress:3,karma:2}}},
      {id:'dismiss_it',label:'Say it should not matter anymore',effects:{school:{conduct:-7,socialStanding:-4},secondary:{discipline:-2,reputation:-3,stress:2}}},
    ],
  },
  {
    id:'systemic_friend_argument_return',category:'friends',title:'The Argument Still Has Edges',
    descriptions:[
      '{NPC_FIRST} brings up the argument you had at age {ORIGIN_AGE}. Time passed, but apparently the sharpest part of it did not.',
      'A conversation with {NPC_FIRST} circles back to an old fight between you. Neither of you remembers it as casually as you hoped.',
      '{NPC_FIRST} admits that an old argument still affects how they read you now. You finally have room to address it directly.',
    ],
    minAge:8,maxAge:110,probability:0,cooldown:99,tags:['friends','systemic','delayed','phase7b1'],choices:[
      {id:'own_part',label:'Own your part in the argument',effects:{relationship:{npcSelector:'payload',delta:9},secondary:{karma:2,confidence:2,stress:-1}}},
      {id:'talk_it_out',label:'Talk through what actually happened',effects:{relationship:{npcSelector:'payload',delta:5},secondary:{charisma:2,stress:2}}},
      {id:'double_down',label:'Stand by everything you said',effects:{relationship:{npcSelector:'payload',delta:-10},secondary:{willpower:2,stress:3}}},
    ],
  },
  {
    id:'systemic_reconciliation_checkin',category:'romance',title:'The Second Chance Check-In',
    descriptions:[
      '{NPC_FIRST} asks whether trying again actually changed what broke between you the first time.',
      'The reunion with {NPC_FIRST} is no longer new. Now comes the harder question: did the two of you rebuild anything, or just restart it?',
      '{NPC_FIRST} wants an honest check-in about your second chance together. Old history is in the room even when neither of you names it.',
    ],
    minAge:14,maxAge:110,probability:0,cooldown:99,tags:['romance','systemic','delayed','phase7b1'],choices:[
      {id:'be_honest',label:'Talk honestly about what changed',effects:{relationship:{npcSelector:'payload',delta:9},secondary:{confidence:2,stress:2,karma:1}}},
      {id:'choose_reset',label:'Choose a fresh start together',effects:{relationship:{npcSelector:'payload',delta:6},stats:{happiness:3},secondary:{stress:-2}}},
      {id:'avoid_old_wounds',label:'Avoid reopening old wounds',effects:{relationship:{npcSelector:'payload',delta:-7},secondary:{stress:2}}},
    ],
  },
  {
    id:'systemic_marriage_expectations_return',category:'romance',title:'What Are We Building?',
    descriptions:[
      'A few years into marriage, {NPC_FIRST} asks what the two of you are actually building together beyond simply staying married.',
      '{NPC_FIRST} wants to compare the marriage you imagined with the one you are living. The differences are not all bad, but they are real.',
      'Ordinary married life with {NPC_FIRST} has accumulated routines, compromises, and assumptions. One evening, those assumptions finally become a conversation.',
    ],
    minAge:18,maxAge:110,probability:0,cooldown:99,tags:['romance','systemic','delayed','phase7b1'],choices:[
      {id:'prioritize_us',label:'Make the relationship a priority',effects:{relationship:{npcSelector:'payload',delta:9},stats:{happiness:3},secondary:{karma:1}}},
      {id:'renegotiate',label:'Renegotiate what you both need',effects:{relationship:{npcSelector:'payload',delta:5},secondary:{confidence:2,charisma:2,stress:2}}},
      {id:'brush_off',label:'Say things are fine as they are',effects:{relationship:{npcSelector:'payload',delta:-9},stats:{happiness:-2},secondary:{stress:3}}},
    ],
  },
  {
    id:'systemic_property_renovation_return',category:'asset',title:'What the Renovation Changed',
    descriptions:[
      'Two years after the work at {PROPERTY_NAME}, the choices behind that renovation are showing in the property itself.',
      '{PROPERTY_NAME} has had time to live with the renovation you completed at age {ORIGIN_AGE}. Some decisions aged better than others.',
      'The renovation at {PROPERTY_NAME} is no longer new. Now you can see what actually held up and what needs another decision.',
    ],
    minAge:18,maxAge:110,probability:0,cooldown:99,tags:['asset','systemic','delayed','phase7b2'],choices:[
      {id:'protect_work',label:'Keep protecting the work you did',effects:{property:{condition:8,marketValuePercent:1.5},secondary:{discipline:2,stress:1}}},
      {id:'refine',label:'Refine the parts that did not age well',effects:{property:{condition:5,marketValuePercent:2},secondary:{creativity:2,stress:2}}},
      {id:'coast',label:'Leave it alone for now',effects:{property:{condition:-6,marketValuePercent:-1},secondary:{stress:-1}}},
    ],
  },
  {
    id:'systemic_business_founder_return',category:'business',title:'The Company You Actually Built',
    descriptions:[
      'A few years after founding {BUSINESS_NAME}, the company has become something more specific than the idea you started with.',
      '{BUSINESS_NAME} has survived long enough for people to form an opinion about what kind of company it is—and what kind of founder you are.',
      'The early improvisation around {BUSINESS_NAME} has hardened into habits. You have a chance to decide which ones become culture.',
    ],
    minAge:18,maxAge:110,probability:0,cooldown:99,tags:['business','systemic','delayed','phase7b2'],choices:[
      {id:'protect_trust',label:'Protect the trust you have built',effects:{business:{reputation:8,demand:2},secondary:{reputation:2,karma:1}}},
      {id:'focus_market',label:'Focus harder on what customers want',effects:{business:{reputation:3,demand:8},secondary:{confidence:2,stress:2}}},
      {id:'chase_growth',label:'Push growth even if the culture strains',effects:{business:{reputation:-5,demand:10},secondary:{stress:4,willpower:2}}},
    ],
  },
  {
    id:'systemic_business_product_return',category:'business',title:'The Launch Has a Reputation Now',
    descriptions:[
      'The product expansion at {BUSINESS_NAME} has had time to settle into the market. Customers remember more than the launch-day numbers.',
      'A product line you launched through {BUSINESS_NAME} is now part of how people describe the company.',
      '{BUSINESS_NAME} is getting feedback on the direction you chose at age {ORIGIN_AGE}. The launch is old news; its reputation is not.',
    ],
    minAge:18,maxAge:110,probability:0,cooldown:99,tags:['business','systemic','delayed','phase7b2'],choices:[
      {id:'improve',label:'Refine the product around the feedback',effects:{business:{reputation:7,demand:3},secondary:{creativity:2,stress:2}}},
      {id:'double_down',label:'Double down on the strongest demand',effects:{business:{reputation:2,demand:8},secondary:{confidence:2}}},
      {id:'move_on',label:'Stop letting one launch define the company',effects:{business:{reputation:1,demand:-5},secondary:{stress:-2}}},
    ],
  },
  {
    id:'systemic_workplace_feedback_return',category:'work',title:'The Standard You Asked For',
    descriptions:[
      'At {WORLD_NAME}, {NPC_FIRST} brings up the feedback conversation you asked for at age {ORIGIN_AGE}. It changed the standard they use when judging your work.',
      '{NPC_FIRST} remembers that you once asked for direct feedback at {WORLD_NAME}. Now they want to know what you actually did with it.',
      'A past feedback conversation with {NPC_FIRST} at {WORLD_NAME} has become part of your professional reputation there.',
    ],
    minAge:16,maxAge:110,probability:0,cooldown:99,tags:['work','systemic','delayed','phase7b2'],choices:[
      {id:'show_growth',label:'Show how you acted on the feedback',effects:{relationship:{npcSelector:'payload',delta:6},workplace:{reputation:7,tension:-3},secondary:{reputation:2,confidence:2}}},
      {id:'ask_again',label:'Ask what they would challenge you on now',effects:{relationship:{npcSelector:'payload',delta:4},workplace:{culture:4,reputation:3},secondary:{charisma:2,stress:2}}},
      {id:'reject_standard',label:'Say their standard never fit you',effects:{relationship:{npcSelector:'payload',delta:-7},workplace:{tension:6,reputation:-4},secondary:{stress:2,willpower:2}}},
    ],
  },
  {
    id:'systemic_workplace_concern_return',category:'work',title:'The Concern Did Not Disappear',
    descriptions:[
      'The workplace concern involving {NPC_FIRST} at {WORLD_NAME} has had a longer afterlife than the original meeting suggested.',
      '{WORLD_NAME} circles back to the concern you raised about {NPC_FIRST} at age {ORIGIN_AGE}. The formal process ended; the social consequences did not.',
      '{NPC_FIRST} wants to address what happened after you raised a workplace concern at {WORLD_NAME}. Time has changed the temperature, not the history.',
    ],
    minAge:16,maxAge:110,probability:0,cooldown:99,tags:['work','systemic','delayed','phase7b2'],choices:[
      {id:'set_boundary',label:'Keep the boundary clear and professional',effects:{relationship:{npcSelector:'payload',delta:-2},workplace:{tension:-5,reputation:4},secondary:{discipline:2}}},
      {id:'repair',label:'Try to repair the working relationship',effects:{relationship:{npcSelector:'payload',delta:8},workplace:{tension:-4,culture:3},secondary:{charisma:2,stress:1}}},
      {id:'reignite',label:'Reopen the argument',effects:{relationship:{npcSelector:'payload',delta:-10},workplace:{tension:8,reputation:-3},secondary:{stress:4}}},
    ],
  },

];

export const systemicConsequenceEventById:Record<string,GameEventDefinition>=Object.fromEntries(systemicConsequenceEvents.map(event=>[event.id,event]));
