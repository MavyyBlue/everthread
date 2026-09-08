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

/**
 * Phase 4D8A starter chains. These definitions never enter the random-event pool directly;
 * SpecialCareerStorySystem schedules the opening beat against an exact persistent Career World NPC.
 */
export const specialCareerStoryEvents: GameEventDefinition[] = [
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

export const specialCareerStoryEventById = Object.fromEntries(
  specialCareerStoryEvents.map(event=>[event.id,event]),
) as Record<string,GameEventDefinition>;
