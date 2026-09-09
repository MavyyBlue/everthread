import { formatRegressionReport, runRegressionSuite } from './regressionSuite';
import { runSpecialCareerWorldRegression } from './specialCareerWorldRegression';
import { runMusicCareerRegression } from './musicCareerRegression';
import { runSocialAffiliationRegression } from './socialAffiliationRegression';
import { runModelingCareerRegression } from './modelingCareerRegression';
import { runRacingCareerRegression } from './racingCareerRegression';
import { runCoherenceRegression } from './coherenceRegression';
import { runStressCareerRegression } from './stressCareerRegression';
import { runEventTargetRegression } from './eventTargetRegression';
import { runCommitmentExclusivityRegression } from './commitmentExclusivityRegression';
import { runCareerRelationshipCoherenceRegression } from './careerRelationshipCoherenceRegression';
import { runSpecialCareerInfluenceRegression } from './specialCareerInfluenceRegression';
import { runContextualInfoRegression } from './contextualInfoRegression';
import { runSpecialCareerLifecycleRegression } from './specialCareerLifecycleRegression';
import { runSpecialCareerStoryRegression } from './specialCareerStoryRegression';
import { runSpecialCareerPathStoryRegression } from './specialCareerPathStoryRegression';
import { runCombatCareerWorldRegression } from './combatCareerWorldRegression';
import { runMilitaryCareerWorldRegression } from './militaryCareerWorldRegression';
import { runPoliticsCareerWorldRegression } from './politicsCareerWorldRegression';
import { runPhase4CloseoutRegression } from './phase4CloseoutRegression';
import { runEventCoherenceRegression } from './eventCoherenceRegression';
import { runPeopleWorkspaceRegression } from './peopleWorkspaceRegression';
import { runAiInteractionRegression } from './aiInteractionRegression';

declare const process:{exitCode?:number};
const report=runRegressionSuite();
console.log(formatRegressionReport(report));
try{const checks=runSpecialCareerWorldRegression();console.log(`Special-career world regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runMusicCareerRegression();console.log(`Music career regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runSocialAffiliationRegression();console.log(`Social-affiliation regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runModelingCareerRegression();console.log(`Modeling career regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runRacingCareerRegression();console.log(`Racing career regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runCoherenceRegression();console.log(`Coherence regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runStressCareerRegression();console.log(`Stress / career-freedom regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runEventTargetRegression();console.log(`Event-target role regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runCommitmentExclusivityRegression();console.log(`Commitment exclusivity regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runCareerRelationshipCoherenceRegression();console.log(`Career / relationship coherence regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runSpecialCareerInfluenceRegression();console.log(`Special-career influence regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runContextualInfoRegression();console.log(`Contextual info regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runSpecialCareerLifecycleRegression();console.log(`Special-career lifecycle regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runSpecialCareerStoryRegression();console.log(`Special-career story regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runSpecialCareerPathStoryRegression();console.log(`Special-career path-story regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runCombatCareerWorldRegression();console.log(`Combat-career world regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runMilitaryCareerWorldRegression();console.log(`Military-career world regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runPoliticsCareerWorldRegression();console.log(`Politics-career world regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runPhase4CloseoutRegression();console.log(`Phase 4 closeout regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runEventCoherenceRegression();console.log(`Random-event coherence regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runPeopleWorkspaceRegression();console.log(`People Threadspace regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=await runAiInteractionRegression();console.log(`AI interaction testbench regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
if(report.failed)process.exitCode=1;
