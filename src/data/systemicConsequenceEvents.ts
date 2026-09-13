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
];

export const systemicConsequenceEventById:Record<string,GameEventDefinition>=Object.fromEntries(systemicConsequenceEvents.map(event=>[event.id,event]));
