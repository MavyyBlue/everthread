import { countryById } from '../data/countries';
import { educationById, educationPrograms } from '../data/education';
import type { EngineResult, GameState } from '../types/game';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';

function activeRecord(state:GameState) { return [...state.education].reverse().find(r=>!r.graduated&&!r.droppedOut&&!r.endAge); }

export function processEducationYear(state:GameState) {
  const age=state.character.age;
  const timeline=(text:string,importance:1|2|3=2)=>state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'school',importance,text});
  if(age===5 && !state.education.some(e=>e.stage==='primary')) {
    state.education.push({stage:'primary',institution:`${state.character.city} Primary School`,startAge:age,graduated:false,droppedOut:false,scholarship:false,performance:state.character.secondary.academicPerformance});
    timeline('You started primary school.',3);
  }
  if(age===11) {
    const prev=activeRecord(state); if(prev){prev.graduated=true;prev.endAge=age;}
    state.education.push({stage:'middle',institution:`${state.character.city} Middle School`,startAge:age,graduated:false,droppedOut:false,scholarship:false,performance:state.character.secondary.academicPerformance});
    timeline('You started middle school.',3);
  }
  if(age===14) {
    const prev=activeRecord(state); if(prev){prev.graduated=true;prev.endAge=age;}
    state.education.push({stage:'secondary',institution:`${state.character.city} Secondary School`,startAge:age,graduated:false,droppedOut:false,scholarship:false,performance:state.character.secondary.academicPerformance});
    timeline('You started secondary school.',3);
  }
  if(age===18) {
    const prev=activeRecord(state); if(prev?.stage==='secondary'){prev.graduated=true;prev.endAge=age; timeline('You graduated from secondary school.',3);}
  }

  const post=activeRecord(state);
  if(post && ['university','community_college','graduate','professional','trade'].includes(post.stage) && post.programId) {
    const def=educationById[post.programId];
    if(def && age-post.startAge>=def.years) {
      post.graduated=true; post.endAge=age; post.performance=state.character.secondary.academicPerformance;
      timeline(`You graduated from ${post.institution} in ${def.name}.`,3);
      state.character.stats.happiness=clamp(state.character.stats.happiness+6);
      state.character.stats.intelligence=clamp(state.character.stats.intelligence+Math.min(8,def.years*2));
    } else {
      const rng=createRng(state.seed,state.rngCounter);
      const stress=Math.max(0,55-state.character.secondary.discipline);
      state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance+rng.int(-3,4)+(state.character.secondary.discipline>65?2:0));
      state.character.secondary.stress=clamp(state.character.secondary.stress+Math.round(stress/25)-1);
      state.rngCounter=rng.counter();
    }
  }
}

export function studyHarder(state:GameState):EngineResult {
  const active=activeRecord(state);
  if(!active) return {success:false,messages:[{text:'You are not currently enrolled in school.'}]};
  state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance+7);
  state.character.stats.intelligence=clamp(state.character.stats.intelligence+1);
  state.character.secondary.stress=clamp(state.character.secondary.stress+3);
  state.character.stats.happiness=clamp(state.character.stats.happiness-1);
  return {success:true,messages:[{text:'You studied harder. Academic performance improved, at the cost of a little stress.'}]};
}

export function skipClass(state:GameState):EngineResult {
  const active=activeRecord(state); if(!active) return {success:false,messages:[{text:'You are not currently enrolled.'}]};
  const rng=createRng(state.seed,state.rngCounter);
  state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance-rng.int(3,8));
  state.character.stats.happiness=clamp(state.character.stats.happiness+3); state.character.secondary.discipline=clamp(state.character.secondary.discipline-2);
  state.rngCounter=rng.counter(); return {success:true,messages:[{text:'You skipped class. Fun now; transcript later.'}]};
}

export function enrollProgram(state:GameState,programId:string):EngineResult {
  if(state.character.age<17) return {success:false,messages:[{text:'Post-secondary applications are not available yet.'}]};
  if(activeRecord(state)) return {success:false,messages:[{text:'You are already enrolled in a program.'}]};
  const program=educationById[programId]; if(!program) return {success:false,messages:[{text:'That program does not exist.'}]};
  if(state.character.stats.intelligence<program.minIntelligence) return {success:false,messages:[{text:`Your current academic profile is not competitive for ${program.name}.`}]};
  const requiresDegree=['graduate','professional'].includes(program.kind);
  if(requiresDegree && !state.education.some(e=>e.graduated&&['university','graduate'].includes(e.stage))) return {success:false,messages:[{text:'This program requires a prior university qualification.'}]};
  const country=countryById[state.character.countryId];
  const annualTuition=Math.round(program.tuition*(country?.universityCost??18000)/18000);
  const rng=createRng(state.seed,state.rngCounter);
  const scholarship=state.character.secondary.academicPerformance>=82 && rng.chance(.45);
  const total=annualTuition*program.years*(scholarship?.35:1);
  if(state.finances.cash>=total) state.finances.cash-=total;
  else {
    const needed=Math.max(0,total-state.finances.cash); state.finances.cash=0;
    state.finances.liabilities.push({id:makeStateId(state,'loan'),kind:'student',principal:needed,balance:needed,annualRate:.047,annualPayment:Math.round(needed/10+needed*.047),remainingYears:10});
  }
  state.education.push({stage:program.kind,institution:`${state.character.city} Institute of ${program.name.replace(/ — .*/, '')}`,programId,major:program.name,startAge:state.character.age,graduated:false,droppedOut:false,scholarship,performance:state.character.secondary.academicPerformance});
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:3,text:`You enrolled in ${program.name}${scholarship?' with a scholarship':''}.`});
  state.rngCounter=rng.counter(); return {success:true,messages:[{text:`You enrolled in ${program.name}. Estimated total tuition: ${Math.round(total).toLocaleString()}.`}]};
}

export function dropOut(state:GameState):EngineResult {
  const active=activeRecord(state); if(!active) return {success:false,messages:[{text:'There is no active program to leave.'}]};
  active.droppedOut=true; active.endAge=state.character.age;
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:3,text:`You dropped out of ${active.institution}.`});
  return {success:true,messages:[{text:'You left your program. The decision is part of your permanent life history.'}]};
}

export function availablePrograms(state:GameState) {
  return educationPrograms.filter(p=>state.character.age>=17 && state.character.stats.intelligence>=p.minIntelligence-12);
}
