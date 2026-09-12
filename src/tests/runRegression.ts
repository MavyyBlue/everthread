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
import { runEstatePlanningRegression } from './estatePlanningRegression';
import { runEstateAdministrationRegression } from './estateAdministrationRegression';
import { runFamilyContinuityRegression } from './familyContinuityRegression';
import { runVisualIdentityRegression } from './visualIdentityRegression';
import { runFamilyReproductionRegression } from './familyReproductionRegression';
import { runSecretCodeRegression } from './secretCodeRegression';
import { runRewindScalingRegression } from './rewindScalingRegression';
import { runNpcHouseholdCoherenceRegression } from './npcHouseholdCoherenceRegression';
import { runNpcHealthMortalityRegression } from './npcHealthMortalityRegression';
import { runAgeAwareReproductionRegression } from './ageAwareReproductionRegression';
import { runNpcOrientationCoherenceRegression } from './npcOrientationCoherenceRegression';
import { runCollisionAwareNamingRegression } from './collisionAwareNamingRegression';
import { runRelationshipMicrocopyRegression } from './relationshipMicrocopyRegression';
import { runIntegratedLongLifeRegression } from './integratedLongLifeRegression';
import { runActionVfxRegression } from './actionVfxRegression';
import { runNpcAssetOwnershipRegression } from './npcAssetOwnershipRegression';
import { runTimelineScalingRegression } from './timelineScalingRegression';
import { runFamilyTopologyRegression } from './familyTopologyRegression';
import { runDynastyTransitionRegression } from './dynastyTransitionRegression';
import { runCreditBankingRegression } from './creditBankingRegression';
import { runAssetFinancingRegression } from './assetFinancingRegression';
import { runAssetDelinquencyRegression } from './assetDelinquencyRegression';
import { runPaymentAssetManagementRegression } from './paymentAssetManagementRegression';

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
try{const checks=runEstatePlanningRegression();console.log(`Phase 5 estate-planning regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runEstateAdministrationRegression();console.log(`Phase 5 estate-administration regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runFamilyContinuityRegression();console.log(`Family continuity regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runVisualIdentityRegression();console.log(`Visual identity regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runFamilyReproductionRegression();console.log(`Family reproduction regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runSecretCodeRegression();console.log(`Secret-code regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runRewindScalingRegression();console.log(`Rewind scaling regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runNpcHouseholdCoherenceRegression();console.log(`NPC household coherence regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runNpcHealthMortalityRegression();console.log(`NPC health / mortality regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runAgeAwareReproductionRegression();console.log(`Age-aware reproduction regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runNpcOrientationCoherenceRegression();console.log(`NPC orientation coherence regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runCollisionAwareNamingRegression();console.log(`Collision-aware naming regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runRelationshipMicrocopyRegression();console.log(`Relationship microcopy regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runActionVfxRegression();console.log(`Action VFX regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runNpcAssetOwnershipRegression();console.log(`NPC asset ownership regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runTimelineScalingRegression();console.log(`Timeline scaling regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runFamilyTopologyRegression();console.log(`Family topology regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runDynastyTransitionRegression();console.log(`Dynasty transition regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runCreditBankingRegression();console.log(`Credit & banking regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runAssetFinancingRegression();console.log(`Asset financing regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runAssetDelinquencyRegression();console.log(`Asset delinquency regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runPaymentAssetManagementRegression();console.log(`Payment & asset management regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runIntegratedLongLifeRegression();console.log(`Integrated long-life regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
if(report.failed)process.exitCode=1;
