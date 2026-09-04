import { countryById } from '../data/countries';
import { educationById, educationPrograms } from '../data/education';
import { schoolProfileFor } from '../data/schools';
import type { EducationProgram } from '../types/content';
import type { EducationRecord, EngineResult, GameState } from '../types/game';
import { clamp } from '../core/math';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { consumeAction } from '../core/actionEconomy';
import { ensureSchoolWorldForEducationRecord, noteSkippingClass, noteStudying, schoolAdmissionsFactors, syncSchoolWorlds } from './SchoolWorldSystem';

function activeRecord(state:GameState) { return [...state.education].reverse().find(r=>!r.graduated&&!r.droppedOut&&!r.endAge); }

function finishRecord(record:EducationRecord,age:number){record.graduated=true;record.endAge=age;}

function schoolInstitution(state:GameState,label:string){return `${state.character.city} ${label}`;}

function transitionCompulsorySchool(state:GameState) {
  const age=state.character.age;
  const profile=schoolProfileFor(state.character.countryId);
  const startingStage=profile.stages.find(stage=>stage.startAge===age);
  if(startingStage&&!state.education.some(record=>record.stage===startingStage.stage&&record.startAge===startingStage.startAge)){
    const previous=activeRecord(state);
    if(previous&&['primary','middle','secondary'].includes(previous.stage))finishRecord(previous,age);
    const record:EducationRecord={stage:startingStage.stage,institution:schoolInstitution(state,startingStage.label),startAge:age,graduated:false,droppedOut:false,scholarship:false,performance:state.character.secondary.academicPerformance};
    state.education.push(record);ensureSchoolWorldForEducationRecord(state,record,true);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'school',importance:3,text:`You started ${startingStage.label.toLowerCase()} at ${record.institution}.`});
  }
  const finalStage=profile.stages.at(-1);
  if(finalStage&&age===finalStage.endAge){
    const current=activeRecord(state);
    if(current?.stage==='secondary'){finishRecord(current,age);current.performance=state.character.secondary.academicPerformance;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'school',importance:3,text:'You graduated from secondary school.'});}
  }
}

function processAcademicYear(state:GameState,record:EducationRecord){
  const rng=createRng(`${state.seed}-academics`,state.rngCounter);
  const isPostSecondary=['university','community_college','graduate','professional','trade'].includes(record.stage);
  const disciplineBonus=state.character.secondary.discipline>65?2:state.character.secondary.discipline<35?-1:0;
  const intelligenceBonus=state.character.stats.intelligence>75?1:0;
  state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance+rng.int(isPostSecondary?-3:-4,isPostSecondary?4:5)+disciplineBonus+intelligenceBonus);
  state.character.secondary.stress=clamp(state.character.secondary.stress+(isPostSecondary?2:1)+(state.character.secondary.academicPerformance<45?1:0)-1);
  record.performance=state.character.secondary.academicPerformance;
  state.rngCounter=rng.counter();
}

export function processEducationYear(state:GameState) {
  const age=state.character.age;
  transitionCompulsorySchool(state);
  const current=activeRecord(state);
  if(current){
    const def=current.programId?educationById[current.programId]:undefined;
    if(def&&['university','community_college','graduate','professional','trade'].includes(current.stage)&&age-current.startAge>=def.years){
      finishRecord(current,age);current.performance=state.character.secondary.academicPerformance;
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'school',importance:3,text:`You graduated from ${current.institution} in ${def.name}.`});
      state.character.stats.happiness=clamp(state.character.stats.happiness+6);state.character.stats.intelligence=clamp(state.character.stats.intelligence+Math.min(8,def.years*2));
    }else processAcademicYear(state,current);
  }
  syncSchoolWorlds(state,true);
}

export function studyHarder(state:GameState):EngineResult {
  const active=activeRecord(state);if(!active)return{success:false,messages:[{text:'You are not currently enrolled in school.'}]};
  const gate=consumeAction(state,{policy:'education.effort'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance+7);active.performance=state.character.secondary.academicPerformance;state.character.stats.intelligence=clamp(state.character.stats.intelligence+1);state.character.secondary.stress=clamp(state.character.secondary.stress+3);state.character.stats.happiness=clamp(state.character.stats.happiness-1);noteStudying(state);
  return{success:true,messages:[{text:'You studied harder. Academic performance improved, at the cost of a little stress.'}]};
}

export function skipClass(state:GameState):EngineResult {
  const active=activeRecord(state);if(!active)return{success:false,messages:[{text:'You are not currently enrolled.'}]};
  const gate=consumeAction(state,{policy:'education.effort'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(state.seed,state.rngCounter);state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance-rng.int(3,8));active.performance=state.character.secondary.academicPerformance;state.character.stats.happiness=clamp(state.character.stats.happiness+3);state.character.secondary.discipline=clamp(state.character.secondary.discipline-2);state.rngCounter=rng.counter();noteSkippingClass(state);return{success:true,messages:[{text:'You skipped class. It was fun in the moment, but attendance, conduct, and your transcript remember it.'}]};
}

function familyNeedBonus(state:GameState){return state.character.familyWealthTier==='poor'?12:state.character.familyWealthTier==='working'?7:state.character.familyWealthTier==='middle'?3:0;}

export function admissionProfile(state:GameState,program:EducationProgram){
  const school=schoolAdmissionsFactors(state);const academic=state.character.secondary.academicPerformance;const intelligence=state.character.stats.intelligence;const discipline=state.character.secondary.discipline;const reputation=state.character.secondary.reputation;
  const score=clamp(academic*.34+intelligence*.25+discipline*.11+school.conduct*.10+school.involvement*.10+reputation*.05+school.socialStanding*.03+Math.min(10,school.honors*1.5));
  const threshold=clamp(38+program.minIntelligence*.45,45,78);
  return{score,threshold,competitive:score>=threshold&&intelligence>=Math.max(20,program.minIntelligence-18),...school};
}

export function enrollProgram(state:GameState,programId:string):EngineResult {
  if(state.character.age<17)return{success:false,messages:[{text:'Post-secondary applications are not available yet.'}]};if(activeRecord(state))return{success:false,messages:[{text:'You are already enrolled in a program.'}]};
  const program=educationById[programId];if(!program)return{success:false,messages:[{text:'That program does not exist.'}]};
  const requiresDegree=['graduate','professional'].includes(program.kind);if(requiresDegree&&!state.education.some(e=>e.graduated&&['university','graduate'].includes(e.stage)))return{success:false,messages:[{text:'This program requires a prior university qualification.'}]};
  const gate=consumeAction(state,{policy:'education.enroll'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const profile=admissionProfile(state,program);const rng=createRng(`${state.seed}-admissions`,state.rngCounter);
  const margin=profile.score-profile.threshold;const acceptanceChance=clamp(55+margin*3,12,100)/100;const accepted=profile.competitive&&rng.chance(acceptanceChance);
  if(!accepted){state.rngCounter=rng.counter();state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:1,text:`Your application to ${program.name} was not accepted. Your admissions profile scored ${Math.round(profile.score)} against a competitive benchmark near ${Math.round(profile.threshold)}.`});return{success:false,messages:[{text:`Your application was not accepted. Admissions profile: ${Math.round(profile.score)}/100. School performance, conduct, activities, and prior education all contribute.`}]};}
  const country=countryById[state.character.countryId];const annualTuition=Math.round(program.tuition*(country?.universityCost??18000)/18000);
  const need=familyNeedBonus(state);const scholarshipChance=clamp(10+Math.max(0,profile.score-62)*2+need,0,88)/100;const scholarship=rng.chance(scholarshipChance);const scholarshipPercent=scholarship?(profile.score>=88?.65:profile.score>=78?.45:.25):0;const total=Math.round(annualTuition*program.years*(1-scholarshipPercent));
  if(state.finances.cash>=total)state.finances.cash-=total;else{const needed=Math.max(0,total-state.finances.cash);state.finances.cash=0;if(needed>0)state.finances.liabilities.push({id:makeStateId(state,'loan'),kind:'student',principal:needed,balance:needed,annualRate:.047,annualPayment:Math.round(needed/10+needed*.047),remainingYears:10});}
  const record:EducationRecord={stage:program.kind,institution:`${state.character.city} Institute of ${program.name.replace(/ — .*/, '')}`,programId,major:program.name,startAge:state.character.age,graduated:false,droppedOut:false,scholarship,scholarshipPercent,admissionScore:profile.score,performance:state.character.secondary.academicPerformance};state.education.push(record);ensureSchoolWorldForEducationRecord(state,record,true);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:3,text:`You were accepted into ${program.name}${scholarship?` with a ${Math.round(scholarshipPercent*100)}% scholarship`:''}.`});state.rngCounter=rng.counter();return{success:true,messages:[{text:`Accepted into ${program.name}. Admissions profile ${Math.round(profile.score)}/100. Estimated total tuition after aid: ${total.toLocaleString()}.`}]};
}

export function canDropOut(state:GameState):boolean {
  const active=activeRecord(state);if(!active)return false;
  if(!['primary','middle','secondary'].includes(active.stage))return true;
  const profile=schoolProfileFor(state.character.countryId);
  return active.stage==='secondary'&&state.character.age>=profile.minimumLeavingAge;
}

export function dropOut(state:GameState):EngineResult {const active=activeRecord(state);if(!active)return{success:false,messages:[{text:'There is no active program to leave.'}]};if(!canDropOut(state)){const leavingAge=schoolProfileFor(state.character.countryId).minimumLeavingAge;return{success:false,messages:[{text:`Compulsory schooling cannot be left before age ${leavingAge} in this country's simplified school profile.`}]};}active.droppedOut=true;active.endAge=state.character.age;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:3,text:`You dropped out of ${active.institution}.`});syncSchoolWorlds(state,false);return{success:true,messages:[{text:'You left your program. The decision is part of your permanent life history.'}]};}

export function availablePrograms(state:GameState){return educationPrograms.filter(program=>state.character.age>=17&&state.character.stats.intelligence>=program.minIntelligence-18);}
