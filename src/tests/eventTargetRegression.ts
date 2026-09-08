import { createNewGame } from '../systems/CharacterSystem';
import { eventById } from '../data/events';
import { eventEligibleForState, forceEvent } from '../systems/EventSystem';

export function runEventTargetRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Event-target regression failed: ${message}`);}

  const state=createNewGame({seed:'event-target-role-regression'});
  state.character.age=19;state.currentYear=2045;
  state.relationships=state.relationships.filter(rel=>!['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew'].includes(rel.type));

  const newbornId='event-target-newborn';
  state.npcs[newbornId]={id:newbornId,firstName:'Nova',lastName:'Tester',age:0,alive:true,health:90,happiness:80,wealth:0,countryId:state.character.countryId,city:state.character.city,sexuality:'straight',fertility:50,maritalStatus:'single',traits:[],hiddenOpinion:60,memories:[],parentIds:[state.character.id],childIds:[]} as any;
  state.relationships.push({id:'rel-event-target-newborn',npcId:newbornId,type:'child',score:80,attraction:0,compatibility:70,yearsKnown:0} as any);

  const favor=eventById['family_family_favor_1'];
  const siblingCompetition=eventById['family_sibling_competition_1'];
  verify(Boolean(favor&&siblingCompetition)&&!eventEligibleForState(state,favor),'Family Favor must reject a family pool containing only a newborn, even though a living family relationship exists');

  const siblingId='event-target-sibling';
  state.npcs[siblingId]={id:siblingId,firstName:'Avery',lastName:'Tester',age:22,alive:true,health:85,happiness:70,wealth:4000,countryId:state.character.countryId,city:state.character.city,sexuality:'straight',fertility:50,maritalStatus:'single',traits:[],hiddenOpinion:15,memories:[],parentIds:[],childIds:[]} as any;
  state.relationships.push({id:'rel-event-target-sibling',npcId:siblingId,type:'sibling',score:55,attraction:0,compatibility:65,yearsKnown:19} as any);
  verify(eventEligibleForState(state,favor),'Family Favor must become eligible when a capable-age living relative exists');

  forceEvent(state,'family_family_favor_1');
  verify(state.pendingEvent?.payload?.npcId===siblingId,'Family Favor must bind to the capable-age relative and never target the newborn');

  const noSibling=createNewGame({seed:'event-target-sibling-role-regression'});noSibling.character.age=19;noSibling.currentYear=2045;
  noSibling.relationships=noSibling.relationships.filter(rel=>!['sibling','half_sibling','stepsibling'].includes(rel.type));
  verify(!eventEligibleForState(noSibling,siblingCompetition),'Sibling Competition must require an actual sibling-type relationship rather than any generic family member');

  return checks;
}
