import { createNewGame } from '../systems/CharacterSystem';
import { activeSpecialCareerWorld, ensureSpecialCareerWorld, specialCareerWorlds } from '../systems/SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships, processSpecialCareerEcosystemsYear } from '../systems/SpecialCareerEcosystemSystem';
import { modelingAgencyAction, modelingAgencyOffer, modelingCampaignHistory, modelingCareerAction, processModelingCareerYear } from '../systems/ModelingCareerCycleSystem';
import { createRng } from '../core/rng';

export function runModelingCareerRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition {checks+=1;if(!condition)throw new Error(`Modeling-career regression failed: ${message}`);}

  const readOnly=createNewGame({seed:'phase4d4-model-readonly'});
  verify(modelingCampaignHistory(readOnly).length===0,'reading empty modeling history must return an empty projection');
  verify(modelingAgencyOffer(readOnly)===undefined,'reading an empty agency offer must return undefined');
  verify(readOnly.specialCareers.modeling===undefined,'read-only modeling projections must not create career state');

  const legacy=createNewGame({seed:'phase4d4-model-legacy-world'});legacy.character.age=21;legacy.currentYear=2047;legacy.character.stats.appearance=100;legacy.character.secondary.charisma=80;legacy.specialCareers.modeling={active:true,technique:35,jobs:4,reputation:36,years:1};
  const legacyWorld=ensureSpecialCareerWorld(legacy,'modeling','photoshoot',{announce:false});ensureSpecialCareerRelationships(legacy,legacyWorld);const worldId=legacyWorld.id;const npcIds=legacyWorld.members.map(member=>member.npcId).join('|');
  legacy.specialCareers.modeling.worldId=worldId;legacy.specialCareers.modeling.worldName=legacyWorld.name;legacy.specialCareers.modeling.worldStartedAge=19;
  processModelingCareerYear(legacy,legacy.specialCareers.modeling as Record<string,number|string|boolean>,legacyWorld,{momentum:65,chemistry:60,rivalry:35,prestige:70},createRng('phase4d4-legacy-model-cycle'));
  verify(activeSpecialCareerWorld(legacy,'modeling')?.id===worldId,'4D4 must preserve an existing modeling world instead of replacing the agency/network');
  verify(legacyWorld.members.map(member=>member.npcId).join('|')===npcIds,'4D4 must preserve existing modeling NPC relationships instead of regenerating the roster');
  verify(Boolean(modelingAgencyOffer(legacy)),'an established legacy model without representation must receive a bounded first agency offer');
  verify(modelingCampaignHistory(legacy).length===0,'4D4 must not fabricate detailed campaign history for pre-4D4 instant jobs');

  legacy.actionLedger.age=legacy.character.age;legacy.actionLedger.uses={};
  const legacyOffer=modelingAgencyOffer(legacy)!;const accept=modelingAgencyAction(legacy,'accept');
  verify(accept.success,'a valid modeling representation offer must be acceptable');
  verify(legacy.specialCareers.modeling.agencyContractActive===true,'accepted representation must create an active contract');
  verify(legacy.specialCareers.modeling.agencyName===legacyWorld.name,'accepted representation must use the existing persistent agency world');
  verify(Number(legacy.specialCareers.modeling.agencyContractRemaining)===legacyOffer.years,'accepted representation must preserve the exact offered term');
  verify(Number(legacy.specialCareers.modeling.agencyCommission)===legacyOffer.commission,'accepted representation must preserve exact commission terms');
  verify(specialCareerWorlds(legacy,'modeling').length===1,'accepting agency terms must not create a duplicate modeling world');

  legacy.character.age=22;legacy.currentYear=2048;legacy.actionLedger.age=22;legacy.actionLedger.uses={};
  const cashBefore=legacy.finances.cash;const campaign=modelingCareerAction(legacy,'photoshoot');
  verify(campaign.success,'a strong established model must be able to book a photoshoot campaign');
  verify(legacy.specialCareers.modeling.campaignActive===true,'a successful modeling booking must enter an active campaign period instead of resolving instantly');
  verify(typeof legacy.specialCareers.modeling.currentCampaignTitle==='string','active campaigns must preserve an exact title');
  verify(['editorial','commercial'].includes(String(legacy.specialCareers.modeling.currentCampaignKind)),'photoshoot bookings must resolve to editorial or commercial campaign types');
  verify(Number(legacy.specialCareers.modeling.currentCampaignGross)>0,'active campaigns must preserve gross booked compensation');
  verify(Number(legacy.specialCareers.modeling.currentCampaignAdvance)>0&&legacy.finances.cash>cashBefore,'campaign booking must pay only a bounded advance up front');
  const usesBefore=legacy.actionLedger.uses['special.model.total']??0;const overlap=modelingCareerAction(legacy,'runway');verify(!overlap.success,'an active modeling campaign must block overlapping campaign starts');verify((legacy.actionLedger.uses['special.model.total']??0)===usesBefore,'overlap blocking must happen before consuming another modeling opportunity');

  const cashAfterAdvance=legacy.finances.cash;legacy.character.age=23;legacy.currentYear=2049;processSpecialCareerEcosystemsYear(legacy);
  verify(legacy.specialCareers.modeling.campaignActive!==true,'the next Age Up ecosystem pass must resolve the active modeling campaign');
  verify(Number(legacy.specialCareers.modeling.campaignsCompleted)===1,'completed campaigns must be counted exactly once');
  verify(Number(legacy.specialCareers.modeling.lastCampaignAge)===23,'campaign history must preserve exact completion age');
  verify(Number(legacy.specialCareers.modeling.lastCampaignScore)>=0&&Number(legacy.specialCareers.modeling.lastCampaignScore)<=100,'campaign performance must remain bounded');
  verify(legacy.finances.cash!==cashAfterAdvance,'campaign completion must settle remaining compensation after the booking advance');
  verify(Number(legacy.specialCareers.modeling.agencyCommissionPaid)>0,'represented campaigns must account for agency commission');
  verify(modelingCampaignHistory(legacy).length===1,'completed campaigns must enter bounded detailed history');
  verify(Number(legacy.specialCareers.modeling.industryPressure)>=0&&Number(legacy.specialCareers.modeling.industryPressure)<=100,'industry pressure must remain bounded');
  const completed=Number(legacy.specialCareers.modeling.campaignsCompleted);const money=legacy.finances.cash;processSpecialCareerEcosystemsYear(legacy);verify(Number(legacy.specialCareers.modeling.campaignsCompleted)===completed&&legacy.finances.cash===money,'same-age modeling ecosystem processing must be idempotent');

  const contractState=createNewGame({seed:'phase4d4-model-contract-renewal'});contractState.character.age=30;contractState.currentYear=2060;contractState.character.stats.appearance=100;contractState.fame.fame=90;contractState.specialCareers.modeling={active:true,technique:95,reputation:95,jobs:8,agencyContractActive:true,agencyName:'Aster House',agencyContractYears:2,agencyContractRemaining:1,agencyCommission:.14,agencyReach:1.25,agencySignedAge:28,lastAgencyContractAge:29};const contractWorld=ensureSpecialCareerWorld(contractState,'modeling','agency',{announce:false});ensureSpecialCareerRelationships(contractState,contractWorld);for(const member of contractWorld.members){const rel=contractState.relationships.find(item=>item.npcId===member.npcId);if(rel&&rel.type!=='enemy')rel.score=95;}
  processModelingCareerYear(contractState,contractState.specialCareers.modeling as Record<string,number|string|boolean>,contractWorld,{momentum:95,chemistry:90,rivalry:15,prestige:90},createRng('phase4d4-renewal-rng'));
  verify(contractState.specialCareers.modeling.agencyContractActive===false,'an expiring modeling contract must leave active status before a renewal is accepted');
  verify(Boolean(modelingAgencyOffer(contractState))&&modelingAgencyOffer(contractState)?.kind==='renewal','a strong expiring contract must generate a renewal offer');
  const renewal=modelingAgencyOffer(contractState)!;contractState.actionLedger.age=30;contractState.actionLedger.uses={};verify(modelingAgencyAction(contractState,'accept').success,'a renewal offer must be actionable');verify(Number(contractState.specialCareers.modeling.agencyContractRemaining)===renewal.years,'renewal acceptance must reset the exact offered term');verify(Number(contractState.specialCareers.modeling.agencyRenewals)===1,'accepted renewals must be counted exactly once');

  const expiry=createNewGame({seed:'phase4d4-model-offer-expiry'});expiry.character.age=24;expiry.specialCareers.modeling={active:true,jobs:2,technique:50,reputation:45,agencyOfferPending:true,agencyOfferKind:'initial',agencyOfferAgency:'Lumen Model Group',agencyOfferYears:2,agencyOfferCommission:.18,agencyOfferReach:1.14,agencyOfferExpiresAge:24};const expiryWorld=ensureSpecialCareerWorld(expiry,'modeling','agency',{announce:false});expiry.character.age=26;processModelingCareerYear(expiry,expiry.specialCareers.modeling as Record<string,number|string|boolean>,expiryWorld,{momentum:50,chemistry:50,rivalry:30,prestige:55},createRng('phase4d4-expiry-rng'));verify(expiry.specialCareers.modeling.agencyOfferPending===false,'expired modeling agency offers must clear instead of persisting forever');verify(Number(expiry.specialCareers.modeling.agencyOffersExpired)>=1,'expired agency offers must be counted');

  const history=createNewGame({seed:'phase4d4-model-history-bound'});history.character.age=20;history.currentYear=2050;history.character.stats.appearance=100;history.character.secondary.charisma=90;history.specialCareers.modeling={active:true,technique:100,reputation:90,jobs:0};
  for(let index=0;index<7;index+=1){history.actionLedger.age=history.character.age;history.actionLedger.uses={};const booked=modelingCareerAction(history,index%3===0?'runway':'photoshoot');verify(booked.success,`modeling campaign ${index+1} must book in the deterministic high-skill fixture`);history.character.age+=1;history.currentYear+=1;processSpecialCareerEcosystemsYear(history);}
  verify(Number(history.specialCareers.modeling.campaignsCompleted)===7,'lifetime modeling campaign totals must keep growing past the detailed history cap');verify(modelingCampaignHistory(history).length===6,'detailed modeling campaign history must remain bounded to six recent campaigns');

  return checks;
}
