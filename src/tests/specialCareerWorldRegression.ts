import { createNewGame } from '../systems/CharacterSystem';
import { ensureSpecialCareerWorld, processSpecialCareerWorldsYear, specialCareerWorlds } from '../systems/SpecialCareerWorldSystem';

function assert(condition:unknown,message:string):asserts condition{
  if(!condition)throw new Error(`Special-career world regression failed: ${message}`);
}

export function runSpecialCareerWorldRegression(){
  const state=createNewGame({seed:'phase4-special-career-world-regression'});
  state.character.age=24;
  state.currentYear=2050;

  const originalNpcCount=Object.keys(state.npcs).length;
  const firstProduction=ensureSpecialCareerWorld(state,'acting','supporting',{forceNew:true,announce:false});
  assert(firstProduction.kind==='organization','acting productions must use organization social worlds');
  assert(firstProduction.active,'new acting production must be active');
  assert(firstProduction.members.length>=8,'acting production must create a meaningful recurring cast and crew');
  assert(Object.keys(state.npcs).length>originalNpcCount,'career worlds must persist their NPCs in authoritative state');

  const sameProduction=ensureSpecialCareerWorld(state,'acting','supporting',{announce:false});
  assert(sameProduction.id===firstProduction.id,'non-forced ensure must reuse the active career world');

  const secondProduction=ensureSpecialCareerWorld(state,'acting','lead',{forceNew:true,announce:false});
  assert(secondProduction.id!==firstProduction.id,'a newly booked production must create distinct history');
  assert(!firstProduction.active&&firstProduction.endedAge===24,'the previous production must archive instead of disappearing');
  assert(firstProduction.members.every(member=>member.leftAge===24),'archived production members must receive a leave age');

  state.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:78,fitness:84};
  const team=ensureSpecialCareerWorld(state,'sports','Basketball',{announce:false});
  const teamId=team.id;
  state.character.age=25;
  state.currentYear=2051;
  processSpecialCareerWorldsYear(state);
  assert(team.active,'persistent sports teams must survive Age Up while the pro career is active');
  assert((state.specialCareers.sports?.worldPrestige as number|undefined)!==undefined,'annual processing must expose bounded career-world prestige');
  assert(!secondProduction.active&&secondProduction.endedAge===25,'temporary productions must close after their active year');
  assert(specialCareerWorlds(state,'sports').some(world=>world.id===teamId),'sports team history must remain addressable');

  state.specialCareers.sports.active=false;
  state.character.age=26;
  state.currentYear=2052;
  processSpecialCareerWorldsYear(state);
  assert(!team.active&&team.endedAge===26,'ending the special career must archive its persistent world');

  return 12;
}
