import type { EngineResult, GameState } from '../types/game';
import { enforceStateInvariants } from '../core/invariants';
import { makeStateId } from '../core/ids';
import { migrateSave } from '../services/SaveSystem';
import { processEconomyYear } from './EconomySystem';
import { processHealthYear } from './HealthSystem';
import { ageNpcs, processFamilyPlanningYear } from './RelationshipSystem';
import { processEducationYear } from './EducationSystem';
import { processSchoolWorldYear } from './SchoolWorldSystem';
import { processCareerYear } from './CareerSystem';
import { processMarketYear } from './InvestmentSystem';
import { processBusinessesYear } from './BusinessSystem';
import { processPropertiesYear } from './PropertySystem';
import { processPetsYear } from './PetSystem';
import { processFameYear } from './FameSystem';
import { processLegalYear } from './CrimeSystem';
import { processSpecialCareersYear } from './SpecialCareerSystem';
import { processAnnualFinance } from './FinanceSystem';
import { triggerRandomEvent } from './EventSystem';
import { evaluateAchievements, evaluateChallenges } from './AchievementSystem';
import { checkDeath } from './DeathSystem';

function snapshotForRewind(state:GameState){if(!state.flags.rewindEnabled)return;const clone=structuredClone(state);clone.yearlySnapshots=[];const encoded=JSON.stringify(clone);state.yearlySnapshots.push({age:state.character.age,state:encoded});state.yearlySnapshots=state.yearlySnapshots.slice(-35);}

export function ageUp(state:GameState):EngineResult {
  if(!state.character.alive)return{success:false,messages:[{text:'This life has ended. Continue as a descendant or begin a new life.'}]};
  if(state.pendingEvent)return{success:false,messages:[{text:'Resolve the current event before aging again.'}]};
  if(state.flags.ageUpLocked)return{success:false,messages:[{text:'Aging is already being processed.'}]};
  state.flags.ageUpLocked=true;snapshotForRewind(state);
  try{
    state.character.age+=1;state.currentYear+=1;
    // World and economy state first; systems below consume the new-year indices.
    processEconomyYear(state);
    processHealthYear(state);
    ageNpcs(state);
    processFamilyPlanningYear(state);
    processEducationYear(state);
    processSchoolWorldYear(state);
    processCareerYear(state);
    processMarketYear(state);
    processBusinessesYear(state);
    processPropertiesYear(state);
    processPetsYear(state);
    processFameYear(state);
    processLegalYear(state);
    processSpecialCareersYear(state);
    processAnnualFinance(state);

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

export function finalizeAgeUp(state:GameState){
  if(!state.flags.pendingDeathCheck)return false;delete state.flags.pendingDeathCheck;const died=checkDeath(state);evaluateAchievements(state);evaluateChallenges(state);enforceStateInvariants(state);return died;
}

export function rewindToAge(state:GameState,age:number):EngineResult {if(!state.flags.rewindEnabled)return{success:false,messages:[{text:'Rewind is disabled for this save.'}]};const snap=[...state.yearlySnapshots].reverse().find(s=>s.age===age);if(!snap)return{success:false,messages:[{text:'No yearly snapshot is available for that age.'}]};const restored=migrateSave(JSON.parse(snap.state) as unknown);const preservedSnapshots=state.yearlySnapshots.filter(s=>s.age<=age);for(const key of Object.keys(state) as Array<keyof GameState>) delete (state as unknown as Record<string,unknown>)[key as string];Object.assign(state,restored);state.yearlySnapshots=preservedSnapshots;state.flags.rewinds=Number(state.flags.rewinds??0)+1;return{success:true,messages:[{text:`Rewound to age ${age}. This save remains marked as rewind-enabled.`}]};}
