import type { GameEventDefinition, RelationshipType } from '../types/game';

/**
 * Story follow-ups only need the exact NPC to remain alive and connected to the player.
 * Career affiliation itself is preserved by Social World history, so a colleague can later
 * become a friend, enemy, partner, or other personal relationship without breaking the arc.
 */
export const SPECIAL_CAREER_STORY_RELATIONSHIPS: RelationshipType[] = [
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','niece_nephew',
  'friend','best_friend','enemy','coworker','classmate','boss','teacher','principal','coach',
  'partner','fiance','spouse','ex','child','grandchild',
];

const keepTarget = (eventId:string,years:number) => ({
  eventId,
  years,
  npcSelector:'payload',
  requiredRelationshipTypes:SPECIAL_CAREER_STORY_RELATIONSHIPS,
} as const);

/** 4D8A generic mentor/rival chains. */
export const specialCareerGenericStoryEvents: GameEventDefinition[] = [
  {
    id:'special_career_mentor_opening',category:'work',title:'A Door Held Open',
    descriptions:['{NPC_NAME} tells you they see more in your career than your latest result. They offer to invest real time in helping you sharpen what comes next.'],
    minAge:13,maxAge:110,probability:0,cooldown:99,tags:['special-career','career-story','mentor','delayed'],choices:[
      {id:'accept',label:'Accept the guidance',effects:{relationship:{npcSelector:'payload',delta:7},secondary:{confidence:3,discipline:2},schedule:keepTarget('special_career_mentor_followthrough',2)}},
      {id:'cautious',label:'Learn, but keep some distance',effects:{relationship:{npcSelector:'payload',delta:3},secondary:{confidence:1,stress:1},schedule:keepTarget('special_career_mentor_followthrough',3)}},
      {id:'decline',label:'Thank them and decline',effects:{relationship:{npcSelector:'payload',delta:-2},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_mentor_followthrough',category:'work',title:'They Remembered',
    descriptions:['Years after that offer of guidance, {NPC_NAME} reaches out with an introduction that could put your name in a room you are not usually in.'],
    minAge:15,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','mentor','delayed'],choices:[
      {id:'take_intro',label:'Take the introduction',effects:{relationship:{npcSelector:'payload',delta:5},fame:2,reputation:3,secondary:{stress:2},schedule:keepTarget('special_career_mentor_legacy',2)}},
      {id:'prove_it',label:'Ask for a chance to prove yourself first',effects:{relationship:{npcSelector:'payload',delta:2},secondary:{confidence:4,discipline:2},schedule:keepTarget('special_career_mentor_legacy',2)}},
      {id:'pass',label:'Pass on the opportunity',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{stress:-2,willpower:2}}},
    ],
  },
  {
    id:'special_career_mentor_legacy',category:'work',title:'The Name Behind the Door',
    descriptions:['The professional connection with {NPC_NAME} has lasted long enough to become part of the story people tell about how your career changed.'],
    minAge:17,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','mentor','delayed'],choices:[
      {id:'thank',label:'Tell them what their support meant',effects:{relationship:{npcSelector:'payload',delta:6},stats:{happiness:4},secondary:{karma:2}}},
      {id:'pay_forward',label:'Promise to pay it forward',effects:{relationship:{npcSelector:'payload',delta:4},reputation:3,secondary:{karma:4,confidence:2}}},
      {id:'move_on',label:'Keep the relationship professional',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{confidence:2,willpower:2}}},
    ],
  },
  {
    id:'special_career_rival_opening',category:'work',title:'A Line in the Sand',
    descriptions:['Competition with {NPC_NAME} stops feeling incidental. One sharp exchange makes it clear that both of you now remember exactly who the other person is.'],
    minAge:13,maxAge:110,probability:0,cooldown:99,tags:['special-career','career-story','rivalry','delayed'],choices:[
      {id:'deescalate',label:'Try to lower the temperature',effects:{relationship:{npcSelector:'payload',delta:6},secondary:{stress:1,willpower:2},schedule:keepTarget('special_career_rival_followthrough',1)}},
      {id:'compete',label:'Meet the challenge head-on',effects:{relationship:{npcSelector:'payload',delta:-6},secondary:{confidence:4,stress:2},schedule:keepTarget('special_career_rival_followthrough',1)}},
      {id:'public',label:'Make the rivalry public',effects:{relationship:{npcSelector:'payload',delta:-12},fame:2,reputation:-4,secondary:{stress:5},schedule:keepTarget('special_career_rival_followthrough',1)}},
    ],
  },
  {
    id:'special_career_rival_followthrough',category:'work',title:'The Rivalry Follows',
    descriptions:['A year later, the tension with {NPC_NAME} has not disappeared. Even people outside the original moment seem to know there is history between you.'],
    minAge:14,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','rivalry','delayed'],choices:[
      {id:'private',label:'Talk to them privately',effects:{relationship:{npcSelector:'payload',delta:8},secondary:{stress:2,confidence:2},schedule:keepTarget('special_career_rival_legacy',2)}},
      {id:'outperform',label:'Let the work answer for you',effects:{relationship:{npcSelector:'payload',delta:-4},fame:1,secondary:{confidence:3,stress:3},schedule:keepTarget('special_career_rival_legacy',2)}},
      {id:'distance',label:'Stop feeding the feud',effects:{relationship:{npcSelector:'payload',delta:2},secondary:{stress:-3,willpower:3},schedule:keepTarget('special_career_rival_legacy',3)}},
    ],
  },
  {
    id:'special_career_rival_legacy',category:'work',title:'What the Feud Became',
    descriptions:['Enough time has passed that you and {NPC_NAME} can finally see what the rivalry actually became: a grudge, a strange form of respect, or something neither of you needs anymore.'],
    minAge:16,maxAge:115,probability:0,cooldown:99,tags:['special-career','career-story','rivalry','delayed'],choices:[
      {id:'truce',label:'Call a real truce',effects:{relationship:{npcSelector:'payload',delta:10},stats:{happiness:2},secondary:{stress:-4,karma:2}}},
      {id:'respect',label:'Acknowledge the mutual respect',effects:{relationship:{npcSelector:'payload',delta:5},secondary:{confidence:2,stress:-1}}},
      {id:'keep_fire',label:'Keep the rivalry alive',effects:{relationship:{npcSelector:'payload',delta:-7},fame:1,reputation:-2,secondary:{stress:2,confidence:2}}},
    ],
  },
];

/**
 * 4D8B path-specific two-beat arcs. They are deliberately consequence-only: choices affect
 * existing relationship/public/stat systems that future career mechanics already consume, but
 * never directly create a contract, project, release, Career World, comeback, or retirement.
 */
export const specialCareerPathStoryEvents: GameEventDefinition[] = [
  {
    id:'special_career_acting_reunion_opening',category:'work',title:'The Cast List Again',
    descriptions:['A familiar name from an older production appears on your phone. {NPC_NAME} wants to reconnect after realizing how much of that project still follows both of you.'],
    minAge:15,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','acting','reunion','delayed'],choices:[
      {id:'reconnect',label:'Reconnect properly',effects:{relationship:{npcSelector:'payload',delta:6},stats:{happiness:1},secondary:{confidence:2},schedule:keepTarget('special_career_acting_reunion_followthrough',1)}},
      {id:'professional',label:'Keep it professional',effects:{relationship:{npcSelector:'payload',delta:3},reputation:1,secondary:{stress:1},schedule:keepTarget('special_career_acting_reunion_followthrough',2)}},
      {id:'leave_past',label:'Leave that project in the past',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_acting_reunion_followthrough',category:'work',title:'One More Scene',
    descriptions:['The renewed connection with {NPC_NAME} turns into an informal read-through. Nothing is promised, but the old chemistry is suddenly useful again.'],
    minAge:16,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','acting','reunion','delayed'],choices:[
      {id:'read_together',label:'Read together',effects:{relationship:{npcSelector:'payload',delta:5},fame:2,secondary:{confidence:3,creativity:1}}},
      {id:'stay_in_touch',label:'Keep the connection warm',effects:{relationship:{npcSelector:'payload',delta:3},reputation:2,secondary:{confidence:1}}},
      {id:'pass',label:'Pass for now',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{stress:-2,willpower:2}}},
    ],
  },
  {
    id:'special_career_music_reconnection_opening',category:'work',title:'The Song That Came Back',
    descriptions:['{NPC_NAME} sends you a message about an older piece of your music that has started finding listeners again. The conversation pulls an old creative connection back into the present.'],
    minAge:14,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','music','reconnection','delayed'],choices:[
      {id:'lean_in',label:'Lean into the renewed attention',effects:{relationship:{npcSelector:'payload',delta:5},fame:1,secondary:{creativity:2},schedule:keepTarget('special_career_music_reconnection_followthrough',1)}},
      {id:'watch',label:'Watch what happens first',effects:{relationship:{npcSelector:'payload',delta:2},secondary:{stress:-1},schedule:keepTarget('special_career_music_reconnection_followthrough',2)}},
      {id:'leave_it',label:'Let the old release stay old',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_music_reconnection_followthrough',category:'work',title:'Second Life',
    descriptions:['The unexpected attention has lasted. {NPC_NAME} asks what you want the old work to mean now that a different audience has found it.'],
    minAge:15,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','music','reconnection','delayed'],choices:[
      {id:'revisit',label:'Revisit the creative spark',effects:{relationship:{npcSelector:'payload',delta:4},fame:3,reputation:2,secondary:{creativity:3}}},
      {id:'credit_them',label:'Publicly credit their part in it',effects:{relationship:{npcSelector:'payload',delta:6},stats:{happiness:2},fame:1,secondary:{karma:2}}},
      {id:'move_on',label:'Enjoy it and move on',effects:{secondary:{stress:-2,confidence:2}}},
    ],
  },
  {
    id:'special_career_modeling_reunion_opening',category:'work',title:'The Old Booking Book',
    descriptions:['{NPC_NAME} reaches out from your earlier modeling network. They remember how you worked together and want to see who you have become since then.'],
    minAge:15,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','modeling','reunion','delayed'],choices:[
      {id:'meet',label:'Meet and catch up',effects:{relationship:{npcSelector:'payload',delta:5},secondary:{charisma:2},schedule:keepTarget('special_career_modeling_reunion_followthrough',1)}},
      {id:'professional',label:'Keep it businesslike',effects:{relationship:{npcSelector:'payload',delta:3},reputation:1,secondary:{stress:1},schedule:keepTarget('special_career_modeling_reunion_followthrough',2)}},
      {id:'decline',label:'Decline politely',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_modeling_reunion_followthrough',category:'work',title:'Back in the Room',
    descriptions:['A later invitation puts you and {NPC_NAME} in the same professional room again. The old connection is visible, but so are the boundaries you built since then.'],
    minAge:16,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','modeling','reunion','delayed'],choices:[
      {id:'return_room',label:'Work the room together',effects:{relationship:{npcSelector:'payload',delta:5},fame:2,reputation:2,secondary:{charisma:3,confidence:2}}},
      {id:'boundaries',label:'Reconnect on your terms',effects:{relationship:{npcSelector:'payload',delta:3},reputation:1,secondary:{willpower:3,stress:-2}}},
      {id:'pass',label:'Pass on the reunion',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{stress:-2}}},
    ],
  },
  {
    id:'special_career_sports_legacy_opening',category:'work',title:'Message From the Old Locker Room',
    descriptions:['{NPC_NAME} reaches out from an earlier chapter of your sports career. They want to compare memories of the seasons that changed both of you.'],
    minAge:18,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','sports','legacy','delayed'],choices:[
      {id:'meet',label:'Meet in person',effects:{relationship:{npcSelector:'payload',delta:6},stats:{happiness:2},secondary:{stress:-2},schedule:keepTarget('special_career_sports_legacy_followthrough',1)}},
      {id:'call',label:'Have a long call',effects:{relationship:{npcSelector:'payload',delta:3},secondary:{confidence:2},schedule:keepTarget('special_career_sports_legacy_followthrough',2)}},
      {id:'decline',label:'Keep that chapter closed',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_sports_legacy_followthrough',category:'work',title:'What They Remember',
    descriptions:['The conversation with {NPC_NAME} becomes less about scores and more about what your shared career meant. Other people begin asking for that version of the story too.'],
    minAge:19,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','sports','legacy','delayed'],choices:[
      {id:'share',label:'Share the story publicly',effects:{relationship:{npcSelector:'payload',delta:5},fame:2,reputation:3,secondary:{athleticism:2,confidence:2}}},
      {id:'thank',label:'Thank them privately',effects:{relationship:{npcSelector:'payload',delta:6},stats:{happiness:3},secondary:{karma:2,stress:-2}}},
      {id:'private',label:'Keep it between you',effects:{relationship:{npcSelector:'payload',delta:2},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_racing_reunion_opening',category:'work',title:'An Old Engineer Calls',
    descriptions:['{NPC_NAME} calls with notes from your time around the same racing team. They still remember the details everyone else forgot.'],
    minAge:18,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','racing','reunion','delayed'],choices:[
      {id:'compare_notes',label:'Compare notes',effects:{relationship:{npcSelector:'payload',delta:5},secondary:{athleticism:1,confidence:2},schedule:keepTarget('special_career_racing_reunion_followthrough',1)}},
      {id:'catch_up',label:'Just catch up',effects:{relationship:{npcSelector:'payload',delta:3},secondary:{stress:-1},schedule:keepTarget('special_career_racing_reunion_followthrough',2)}},
      {id:'leave_it',label:'Leave the old data alone',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_racing_reunion_followthrough',category:'work',title:'The Data They Kept',
    descriptions:['{NPC_NAME} returns with a clearer picture of what your old team learned from those seasons. It is history, but some of the insight still applies to you.'],
    minAge:19,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','racing','reunion','delayed'],choices:[
      {id:'use_insight',label:'Use the insight',effects:{relationship:{npcSelector:'payload',delta:4},fame:1,reputation:2,secondary:{athleticism:3,confidence:3}}},
      {id:'credit_team',label:'Credit the old team',effects:{relationship:{npcSelector:'payload',delta:6},reputation:3,secondary:{karma:1}}},
      {id:'archive',label:'Archive it and move on',effects:{secondary:{stress:-2,willpower:2}}},
    ],
  },
  {
    id:'special_career_directing_reunion_opening',category:'work',title:'The Crew Still Talks',
    descriptions:['{NPC_NAME} tells you people from an older set still talk about the way that production came together. They want to reconnect without pretending the years between never happened.'],
    minAge:22,maxAge:112,probability:0,cooldown:99,tags:['special-career','career-story','directing','reunion','delayed'],choices:[
      {id:'reconnect',label:'Reconnect creatively',effects:{relationship:{npcSelector:'payload',delta:5},secondary:{creativity:2,confidence:2},schedule:keepTarget('special_career_directing_reunion_followthrough',1)}},
      {id:'professional',label:'Keep it professional',effects:{relationship:{npcSelector:'payload',delta:3},reputation:1,schedule:keepTarget('special_career_directing_reunion_followthrough',2)}},
      {id:'decline',label:'Leave the set in the past',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
  {
    id:'special_career_directing_reunion_followthrough',category:'work',title:'Another Set, Maybe',
    descriptions:['The renewed connection with {NPC_NAME} turns into a real creative conversation. It is not a production offer, but it reminds both of you why the collaboration worked.'],
    minAge:23,maxAge:114,probability:0,cooldown:99,tags:['special-career','career-story','directing','reunion','delayed'],choices:[
      {id:'develop',label:'Develop the idea together',effects:{relationship:{npcSelector:'payload',delta:5},fame:2,reputation:2,secondary:{creativity:3,confidence:2,stress:2}}},
      {id:'keep_small',label:'Keep it as a small creative exercise',effects:{relationship:{npcSelector:'payload',delta:3},secondary:{creativity:2,stress:-1}}},
      {id:'pass',label:'Pass on the idea',effects:{relationship:{npcSelector:'payload',delta:-1},secondary:{willpower:2}}},
    ],
  },
];

/**
 * Dedicated story registry. These definitions never enter the ordinary random-event pool;
 * SpecialCareerStorySystem schedules exact persistent NPCs through DelayedEvent.
 */
export const specialCareerStoryEvents: GameEventDefinition[] = [
  ...specialCareerGenericStoryEvents,
  ...specialCareerPathStoryEvents,
];

export const specialCareerStoryEventById = Object.fromEntries(
  specialCareerStoryEvents.map(event=>[event.id,event]),
) as Record<string,GameEventDefinition>;
