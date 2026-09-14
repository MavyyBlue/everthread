import type { EngineResult, GameState } from '../types/game';
import { enforceStateInvariants } from '../core/invariants';
import { makeStateId } from '../core/ids';
import { captureRewindSnapshot, normalizeRewindSnapshots } from './RewindSystem';
import { migrateSave } from '../services/SaveSystem';
import { processEconomyYear } from './EconomySystem';
import { processWorldConditionsYear } from './WorldConditionSystem';
import { processHealthYear } from './HealthSystem';
import { processFamilyPlanningYear } from './RelationshipSystem';
import { initializeMissingNpcLives, processNpcLives } from './NpcLifeSystem';
import { processEducationYear } from './EducationSystem';
import { processSchoolWorldYear } from './SchoolWorldSystem';
import { processCareerYear } from './CareerSystem';
import { processPartTimeWorkYear, processWorkplaceYear } from './WorkplaceSystem';
import { processMarketYear } from './InvestmentSystem';
import { processBusinessesYear } from './BusinessSystem';
import { processPropertiesYear } from './PropertySystem';
import { processPetsYear } from './PetSystem';
import { processFameYear } from './FameSystem';
import { processLegalYear } from './CrimeSystem';
import { processSpecialCareersYear } from './SpecialCareerSystem';
import { processMilitaryCareerYear } from './MilitaryCareerWorldSystem';
import { processPoliticsCareerYear } from './PoliticsCareerWorldSystem';
import { processSpecialCareerStoriesYear } from './SpecialCareerStorySystem';
import { processAnnualFinance } from './FinanceSystem';
import { processStressConsequencesYear } from './StressConsequenceSystem';
import { processDelayedEvents, triggerRandomEvent } from './EventSystem';
import { scheduleConsequence } from './ConsequenceSystem';
import { evaluateAchievements, evaluateChallenges } from './AchievementSystem';
import { checkDeath } from './DeathSystem';
import { processNpcInheritanceTrusts, releaseMatureInheritanceTrust } from './EstateSystem';
import { processFamilyConflictYear } from './FamilyConflictSystem';

export function ageUp(state:GameState):EngineResult {
  if(!state.character.alive)return{success:false,messages:[{text:'This life has ended. Continue as a descendant or begin a new life.'}]};
  if(state.pendingEvent)return{success:false,messages:[{text:'Resolve the current event before aging again.'}]};
  const dueBeforeAging=processDelayedEvents(state);if(dueBeforeAging){state.pendingEvent=dueBeforeAging;return{success:false,messages:[{text:'A consequence from this year needs your attention before aging again.'}],events:[dueBeforeAging],stateChanges:['pendingEvent']};}
  if(state.flags.ageUpLocked)return{success:false,messages:[{text:'Aging is already being processed.'}]};
  state.flags.ageUpLocked=true;captureRewindSnapshot(state);
  try{
    state.character.age+=1;state.currentYear+=1;
    processWorldConditionsYear(state);
    processEconomyYear(state);
    releaseMatureInheritanceTrust(state);
    processHealthYear(state);
    processNpcLives(state);
    processFamilyConflictYear(state);
    processNpcInheritanceTrusts(state);
    processFamilyPlanningYear(state);
    processEducationYear(state);
    processSchoolWorldYear(state);
    processWorkplaceYear(state);
    processCareerYear(state);
    processPartTimeWorkYear(state);
    processMarketYear(state);
    processBusinessesYear(state);
    processPropertiesYear(state);
    processPetsYear(state);
    processFameYear(state);
    processLegalYear(state);
    processSpecialCareersYear(state);
    processMilitaryCareerYear(state);
    processPoliticsCareerYear(state);
    processSpecialCareerStoriesYear(state);
    processAnnualFinance(state);
    if(state.character.age===18&&state.flags.financiallyIndependent!==true){scheduleConsequence(state,{eventId:'financial_independence_transition',dueAge:state.character.age,payload:{originAge:state.character.age},priority:'critical',origin:{kind:'system',id:'age_milestone',age:state.character.age},dedupeKey:'milestone:financial_independence'});}
    processStressConsequencesYear(state);
    initializeMissingNpcLives(state);

    if(state.legal.imprisoned)state.flags.prisonYears=Number(state.flags.prisonYears??0)+1;
    state.legacy.totalYearsSimulated+=1;
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'random',importance:1,text:`Age ${state.character.age} began.`});
    state.flags.pendingDeathCheck=true;
    const pending=triggerRandomEvent(state);
    enforceStateInvariants(state);
    if(!pending){finalizeAgeUp(state);}
    return{success:true,messages:[{text:`You are now ${state.character.age}.`}],events:pending?[pending]:undefined,stateChanges:['age','year','annualSystems']};
  } finally {state.flags.ageUpLocked=false;}
}

export function finalizeAgeUp(state:GameState){if(!state.flags.pendingDeathCheck)return false;delete state.flags.pendingDeathCheck;const died=checkDeath(state);evaluateAchievements(state);evaluateChallenges(state);enforceStateInvariants(state);return died;}
export function rewindToAge(state:GameState,age:number):EngineResult {if(!state.flags.rewindEnabled)return{success:false,messages:[{text:'Rewind is disabled for this save.'}]};const snap=[...state.yearlySnapshots].reverse().find(s=>s.age===age);if(!snap)return{success:false,messages:[{text:'No yearly snapshot is available for that age.'}]};const restored=migrateSave(JSON.parse(snap.state) as unknown);const preservedSnapshots=normalizeRewindSnapshots(state.yearlySnapshots.filter(s=>s.age<=age));for(const key of Object.keys(state) as Array<keyof GameState>) delete (state as unknown as Record<string,unknown>)[key as string];Object.assign(state,restored);state.yearlySnapshots=preservedSnapshots;state.flags.rewinds=Number(state.flags.rewinds??0)+1;return{success:true,messages:[{text:`Rewound to age ${age}. This save remains marked as rewind-enabled.`}]};}
