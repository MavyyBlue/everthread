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
import { runActionVfxRegression } from './actionVfxRegression';
import { runNpcAssetOwnershipRegression } from './npcAssetOwnershipRegression';
import { runTimelineScalingRegression } from './timelineScalingRegression';
import { runFamilyTopologyRegression } from './familyTopologyRegression';
import { runDynastyTransitionRegression } from './dynastyTransitionRegression';
import { runCreditBankingRegression } from './creditBankingRegression';
import { runAssetFinancingRegression } from './assetFinancingRegression';
import { runAssetDelinquencyRegression } from './assetDelinquencyRegression';
import { runPaymentAssetManagementRegression } from './paymentAssetManagementRegression';
import { runPersonalBorrowingRegression } from './personalBorrowingRegression';
import { runHouseholdFinanceRegression } from './householdFinanceRegression';
import { runIntegratedLongLifeRegression } from './integratedLongLifeRegression';
import { runPersistentConsequenceRegression } from './persistentConsequenceRegression';
import { runPhase7BSystemicStoryRegression } from './phase7BSystemicStoryRegression';
import { runPhase7B2OwnershipWorkRegression } from './phase7B2OwnershipWorkRegression';
import { runPhase7B3SpecialCareerEchoRegression } from './phase7B3SpecialCareerEchoRegression';
import { runPhase7CWorldConditionRegression } from './phase7CWorldConditionRegression';
import { runPhase8ASettingFoundationRegression } from './phase8ASettingFoundationRegression';
import { runPhase8BTownMapRegression } from './phase8BTownMapRegression';
import { runPhase8CInstitutionRoutingRegression } from './phase8CInstitutionRoutingRegression';
import { runPhase8DPlayerProfileInventoryRegression } from './phase8DPlayerProfileInventoryRegression';
import { runThreadspaceLoadRecoveryRegression } from './threadspaceLoadRecoveryRegression';
import { runPhase8ECloseoutRegression } from './phase8ECloseoutRegression';
import { runPhase9ANpcPreferencesRegression } from './phase9ANpcPreferencesRegression';
import { runPhase9BSharedExperienceRegression } from './phase9BSharedExperienceRegression';
import { runPhase9CYouthSocialRegression } from './phase9CYouthSocialRegression';
import { runPhase9DDatingMomentumRegression } from './phase9DDatingMomentumRegression';
import { runPhase9ERealGiftsRegression } from './phase9ERealGiftsRegression';
import { runPhase9FCrossWorldChemistryRegression } from './phase9FCrossWorldChemistryRegression';
import { runPhase9GSharedLivesCloseoutRegression } from './phase9GSharedLivesCloseoutRegression';
import { runPhase10AResidentialLifeRegression } from './phase10AResidentialLifeRegression';
import { runPhase10BWorkingEverthreadRegression } from './phase10BWorkingEverthreadRegression';
import { runPhase10CGenerationalPlaceMemoryRegression } from './phase10CGenerationalPlaceMemoryRegression';
import { runPhase10DLivingMapProjectionRegression } from './phase10DLivingMapProjectionRegression';
import { runPrePhase10EPlayerUxRegression } from './prePhase10EPlayerUxRegression';
import { runPhase10EProgramCloseoutRegression } from './phase10EProgramCloseoutRegression';
import { runUiIconographyRegression } from './uiIconographyRegression';
import { runCharacterVisualRegression } from './characterVisualRegression';
import { runFamilyVisualInheritanceRegression } from './familyVisualInheritanceRegression';
import { runProgressiveDisclosureRegression } from './progressiveDisclosureRegression';
import { runYukiThreadroomArtRegression } from './yukiThreadroomArtRegression';
import { runLocationSceneRegression } from './locationSceneRegression';

import type { RegressionExecutionClass } from './regressionMetadata';

export interface RegressionSuiteDefinition {
  id:string;
  label:string;
  executionClass:RegressionExecutionClass;
  run:()=>number|Promise<number>;
}

// Order is certification-sensitive: keep this aligned with the historical serial regression wall.
export const regressionRegistry:readonly RegressionSuiteDefinition[]=[
  {id:"special-career-world",label:"Special-career world regression",executionClass:'standard',run:runSpecialCareerWorldRegression},
  {id:"music-career",label:"Music career regression",executionClass:'standard',run:runMusicCareerRegression},
  {id:"social-affiliation",label:"Social-affiliation regression",executionClass:'standard',run:runSocialAffiliationRegression},
  {id:"modeling-career",label:"Modeling career regression",executionClass:'standard',run:runModelingCareerRegression},
  {id:"racing-career",label:"Racing career regression",executionClass:'standard',run:runRacingCareerRegression},
  {id:"coherence",label:"Coherence regression",executionClass:'standard',run:runCoherenceRegression},
  {id:"stress-career",label:"Stress / career-freedom regression",executionClass:'standard',run:runStressCareerRegression},
  {id:"event-target",label:"Event-target role regression",executionClass:'standard',run:runEventTargetRegression},
  {id:"commitment-exclusivity",label:"Commitment exclusivity regression",executionClass:'standard',run:runCommitmentExclusivityRegression},
  {id:"career-relationship-coherence",label:"Career / relationship coherence regression",executionClass:'standard',run:runCareerRelationshipCoherenceRegression},
  {id:"special-career-influence",label:"Special-career influence regression",executionClass:'standard',run:runSpecialCareerInfluenceRegression},
  {id:"contextual-info",label:"Contextual info regression",executionClass:'standard',run:runContextualInfoRegression},
  {id:"special-career-lifecycle",label:"Special-career lifecycle regression",executionClass:'standard',run:runSpecialCareerLifecycleRegression},
  {id:"special-career-story",label:"Special-career story regression",executionClass:'standard',run:runSpecialCareerStoryRegression},
  {id:"special-career-path-story",label:"Special-career path-story regression",executionClass:'standard',run:runSpecialCareerPathStoryRegression},
  {id:"combat-career-world",label:"Combat-career world regression",executionClass:'standard',run:runCombatCareerWorldRegression},
  {id:"military-career-world",label:"Military-career world regression",executionClass:'standard',run:runMilitaryCareerWorldRegression},
  {id:"politics-career-world",label:"Politics-career world regression",executionClass:'standard',run:runPoliticsCareerWorldRegression},
  {id:"phase-4-closeout",label:"Phase 4 closeout regression",executionClass:'standard',run:runPhase4CloseoutRegression},
  {id:"event-coherence",label:"Random-event coherence regression",executionClass:'standard',run:runEventCoherenceRegression},
  {id:"people-workspace",label:"People Threadspace regression",executionClass:'standard',run:runPeopleWorkspaceRegression},
  {id:"ai-interaction",label:"AI interaction testbench regression",executionClass:'standard',run:runAiInteractionRegression},
  {id:"estate-planning",label:"Phase 5 estate-planning regression",executionClass:'standard',run:runEstatePlanningRegression},
  {id:"estate-administration",label:"Phase 5 estate-administration regression",executionClass:'standard',run:runEstateAdministrationRegression},
  {id:"family-continuity",label:"Family continuity regression",executionClass:'standard',run:runFamilyContinuityRegression},
  {id:"visual-identity",label:"Visual identity regression",executionClass:'standard',run:runVisualIdentityRegression},
  {id:"family-reproduction",label:"Family reproduction regression",executionClass:'standard',run:runFamilyReproductionRegression},
  {id:"secret-code",label:"Secret-code regression",executionClass:'standard',run:runSecretCodeRegression},
  {id:"rewind-scaling",label:"Rewind scaling regression",executionClass:'standard',run:runRewindScalingRegression},
  {id:"npc-household-coherence",label:"NPC household coherence regression",executionClass:'standard',run:runNpcHouseholdCoherenceRegression},
  {id:"npc-health-mortality",label:"NPC health / mortality regression",executionClass:'standard',run:runNpcHealthMortalityRegression},
  {id:"age-aware-reproduction",label:"Age-aware reproduction regression",executionClass:'standard',run:runAgeAwareReproductionRegression},
  {id:"npc-orientation-coherence",label:"NPC orientation coherence regression",executionClass:'standard',run:runNpcOrientationCoherenceRegression},
  {id:"collision-aware-naming",label:"Collision-aware naming regression",executionClass:'standard',run:runCollisionAwareNamingRegression},
  {id:"relationship-microcopy",label:"Relationship microcopy regression",executionClass:'standard',run:runRelationshipMicrocopyRegression},
  {id:"action-vfx",label:"Action VFX regression",executionClass:'standard',run:runActionVfxRegression},
  {id:"npc-asset-ownership",label:"NPC asset ownership regression",executionClass:'standard',run:runNpcAssetOwnershipRegression},
  {id:"timeline-scaling",label:"Timeline scaling regression",executionClass:'standard',run:runTimelineScalingRegression},
  {id:"family-topology",label:"Family topology regression",executionClass:'standard',run:runFamilyTopologyRegression},
  {id:"dynasty-transition",label:"Dynasty transition regression",executionClass:'standard',run:runDynastyTransitionRegression},
  {id:"credit-banking",label:"Credit & banking regression",executionClass:'standard',run:runCreditBankingRegression},
  {id:"asset-financing",label:"Asset financing regression",executionClass:'standard',run:runAssetFinancingRegression},
  {id:"asset-delinquency",label:"Asset delinquency regression",executionClass:'standard',run:runAssetDelinquencyRegression},
  {id:"payment-asset-management",label:"Payment & asset management regression",executionClass:'standard',run:runPaymentAssetManagementRegression},
  {id:"personal-borrowing",label:"Personal borrowing & recovery regression",executionClass:'standard',run:runPersonalBorrowingRegression},
  {id:"household-finance",label:"Household finance & crisis regression",executionClass:'standard',run:runHouseholdFinanceRegression},
  {id:"integrated-long-life",label:"Integrated long-life regression",executionClass:'heavy',run:runIntegratedLongLifeRegression},
  {id:"persistent-consequence",label:"Phase 7A persistent consequence regression",executionClass:'standard',run:runPersistentConsequenceRegression},
  {id:"phase-7-bsystemic-story",label:"Phase 7B1 systemic story regression",executionClass:'standard',run:runPhase7BSystemicStoryRegression},
  {id:"phase-7-b-2-ownership-work",label:"Phase 7B2 ownership/work regression",executionClass:'standard',run:runPhase7B2OwnershipWorkRegression},
  {id:"phase-7-b-3-special-career-echo",label:"Phase 7B3 special-career echo regression",executionClass:'standard',run:runPhase7B3SpecialCareerEchoRegression},
  {id:"phase-7-cworld-condition",label:"Phase 7C world-condition regression",executionClass:'standard',run:runPhase7CWorldConditionRegression},
  {id:"phase-8-asetting-foundation",label:"Phase 8A setting-foundation regression",executionClass:'standard',run:runPhase8ASettingFoundationRegression},
  {id:"phase-8-btown-map",label:"Phase 8B town-map regression",executionClass:'standard',run:runPhase8BTownMapRegression},
  {id:"phase-8-cinstitution-routing",label:"Phase 8C institution-routing regression",executionClass:'standard',run:runPhase8CInstitutionRoutingRegression},
  {id:"phase-8-dplayer-profile-inventory",label:"Phase 8D player-profile/inventory regression",executionClass:'standard',run:runPhase8DPlayerProfileInventoryRegression},
  {id:"threadspace-load-recovery",label:"Threadspace load recovery regression",executionClass:'standard',run:runThreadspaceLoadRecoveryRegression},
  {id:"phase-8-ecloseout",label:"Phase 8E closeout regression",executionClass:'standard',run:runPhase8ECloseoutRegression},
  {id:"phase-9-anpc-preferences",label:"Phase 9A NPC-preference regression",executionClass:'standard',run:runPhase9ANpcPreferencesRegression},
  {id:"phase-9-bshared-experience",label:"Phase 9B shared-experience regression",executionClass:'standard',run:runPhase9BSharedExperienceRegression},
  {id:"phase-9-cyouth-social",label:"Phase 9C youth-social regression",executionClass:'standard',run:runPhase9CYouthSocialRegression},
  {id:"phase-9-ddating-momentum",label:"Phase 9D dating/momentum regression",executionClass:'standard',run:runPhase9DDatingMomentumRegression},
  {id:"phase-9-ereal-gifts",label:"Phase 9E real-gifts regression",executionClass:'standard',run:runPhase9ERealGiftsRegression},
  {id:"phase-9-fcross-world-chemistry",label:"Phase 9F cross-world chemistry regression",executionClass:'standard',run:runPhase9FCrossWorldChemistryRegression},
  {id:"phase-9-gshared-lives-closeout",label:"Phase 9G Shared Lives closeout regression",executionClass:'standard',run:runPhase9GSharedLivesCloseoutRegression},
  {id:"phase-10-aresidential-life",label:"Phase 10A Residential Life regression",executionClass:'standard',run:runPhase10AResidentialLifeRegression},
  {id:"phase-10-bworking-everthread",label:"Phase 10B Working Everthread regression",executionClass:'standard',run:runPhase10BWorkingEverthreadRegression},
  {id:"phase-10-cgenerational-place-memory",label:"Phase 10C Generational Place Memory regression",executionClass:'standard',run:runPhase10CGenerationalPlaceMemoryRegression},
  {id:"phase-10-dliving-map-projection",label:"Phase 10D Living Map Projection regression",executionClass:'standard',run:runPhase10DLivingMapProjectionRegression},
  {id:"pre-phase-10-eplayer-ux",label:"Pre-Phase 10E player-UX regression",executionClass:'standard',run:runPrePhase10EPlayerUxRegression},
  {id:"phase-10-eprogram-closeout",label:"Phase 10E Program Closeout regression",executionClass:'standard',run:runPhase10EProgramCloseoutRegression},
  {id:"ui-iconography",label:"UI iconography & theme reactivity regression",executionClass:'standard',run:runUiIconographyRegression},
  {id:"character-visual",label:"Character Visual regression",executionClass:'standard',run:runCharacterVisualRegression},
  {id:"family-visual-inheritance",label:"Family Visual Inheritance regression",executionClass:'standard',run:runFamilyVisualInheritanceRegression},
  {id:"progressive-disclosure",label:"Progressive-disclosure UX regression",executionClass:'standard',run:runProgressiveDisclosureRegression},
  {id:"yuki-threadroom-art",label:"Yuki Threadroom art regression",executionClass:'standard',run:runYukiThreadroomArtRegression},
  {id:"location-scene",label:"Location scene first-slice regression",executionClass:'standard',run:runLocationSceneRegression},
];
