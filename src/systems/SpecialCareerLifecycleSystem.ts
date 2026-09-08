import { makeStateId } from '../core/ids';
import type { EngineResult, GameState } from '../types/game';
import { isSpecialCareerPathActive, specialCareerPathLabel, type CommitmentGate, type SpecialCareerPathKey } from './CommitmentSystem';
import { archiveSpecialCareerWorld, specialCareerWorlds, type SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;

export type DeepCareerPath = Extract<SpecialCareerPathKey,'acting'|'music'|'sports'|'modeling'|'racing'|'directing'>;
export type SpecialCareerLifecycleStage =
  | 'not_started'
  | 'developing'
  | 'active'
  | 'project_active'
  | 'offer_pending'
  | 'contracted'
  | 'free_agent'
  | 'left'
  | 'retired';

export interface SpecialCareerLifecycleView {
  key: DeepCareerPath;
  label: string;
  stage: SpecialCareerLifecycleStage;
  status: string;
  established: boolean;
  activeCommitment: boolean;
  leftPath: boolean;
  retired: boolean;
  comebackAllowed: boolean;
  retirementFinal: boolean;
}

const DEEP_PATHS:DeepCareerPath[]=['acting','music','sports','modeling','racing','directing'];
const CREATIVE_COMEBACK_PATHS=new Set<DeepCareerPath>(['acting','music','modeling','directing']);

function career(state:GameState,key:SpecialCareerPathKey){return (state.specialCareers[key]??={}) as Track;}
function readCareer(state:GameState,key:SpecialCareerPathKey){return (state.specialCareers[key]??{}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function hasWorldHistory(state:GameState,key:DeepCareerPath){return specialCareerWorlds(state,key as SpecialCareerWorldKind).length>0;}
function activeWorlds(state:GameState,key:DeepCareerPath){return specialCareerWorlds(state,key as SpecialCareerWorldKind).filter(world=>world.active);}

export function hasEstablishedDeepCareer(state:GameState,key:DeepCareerPath){
  const c=readCareer(state,key);
  if(key==='acting')return n(c,'credits')>0||c.currentProjectActive===true||c.offerPending===true||hasWorldHistory(state,key);
  if(key==='music')return typeof c.professionalStartAge==='number'||n(c,'songsReleased')+n(c,'albumsReleased')>0||c.tourActive===true||hasWorldHistory(state,key);
  if(key==='sports')return c.pro===true||c.freeAgent===true||c.renewalOfferPending===true||n(c,'seasonsPlayed')>0||n(c,'proContracts')>0||hasWorldHistory(state,key);
  if(key==='modeling')return n(c,'jobs')>0||c.campaignActive===true||c.agencyContractActive===true||c.agencyOfferPending===true||hasWorldHistory(state,key);
  if(key==='racing')return c.racingPathway===true||c.contractActive===true||c.freeAgent===true||n(c,'seasons')>0||n(c,'contractsSigned')>0||hasWorldHistory(state,key);
  return n(c,'filmsDirected')>0||c.currentProjectActive===true||c.offerPending===true||hasWorldHistory(state,key);
}

function lifecycleStatus(state:GameState,key:DeepCareerPath){
  const c=readCareer(state,key);
  if(c.retired===true)return{stage:'retired' as const,status:'Retired'};
  if(c.leftPath===true)return{stage:'left' as const,status:'Stepped away'};
  if(key==='acting'||key==='directing'){
    if(c.currentProjectActive===true)return{stage:'project_active' as const,status:'In production'};
    if(c.offerPending===true)return{stage:'offer_pending' as const,status:'Offer pending'};
    if(hasEstablishedDeepCareer(state,key))return{stage:'active' as const,status:'Between productions'};
    return{stage:'not_started' as const,status:'Not started'};
  }
  if(key==='music'){
    if(c.tourActive===true)return{stage:'project_active' as const,status:'On tour'};
    if(c.partnershipOfferPending===true)return{stage:'offer_pending' as const,status:'Distribution decision'};
    if(c.distributionPartner===true||c.partnershipActive===true)return{stage:'contracted' as const,status:'Active with distribution'};
    if(hasEstablishedDeepCareer(state,key))return{stage:'active' as const,status:'Independent artist'};
    if(c.musicPathway===true)return{stage:'developing' as const,status:'Developing'};
    return{stage:'not_started' as const,status:'Not started'};
  }
  if(key==='sports'){
    if(c.renewalOfferPending===true)return{stage:'offer_pending' as const,status:'Renewal decision'};
    if(c.pro===true)return{stage:'contracted' as const,status:'Under contract'};
    if(c.freeAgent===true)return{stage:'free_agent' as const,status:'Free agent'};
    if(c.active===true)return{stage:'developing' as const,status:'Sports pathway'};
    return hasEstablishedDeepCareer(state,key)?{stage:'active' as const,status:'Between teams'}:{stage:'not_started' as const,status:'Not started'};
  }
  if(key==='modeling'){
    if(c.campaignActive===true)return{stage:'project_active' as const,status:'Campaign underway'};
    if(c.agencyOfferPending===true)return{stage:'offer_pending' as const,status:'Agency decision'};
    if(c.agencyContractActive===true)return{stage:'contracted' as const,status:'Represented'};
    if(hasEstablishedDeepCareer(state,key))return{stage:'active' as const,status:'Independent model'};
    return{stage:'not_started' as const,status:'Not started'};
  }
  if(c.seasonActive===true)return{stage:'project_active' as const,status:'Season underway'};
  if(c.contractOfferPending===true)return{stage:'offer_pending' as const,status:'Contract decision'};
  if(c.contractActive===true)return{stage:'contracted' as const,status:'Under contract'};
  if(c.freeAgent===true)return{stage:'free_agent' as const,status:'Free agent'};
  if(c.racingPathway===true)return{stage:'developing' as const,status:'Racing pathway'};
  return hasEstablishedDeepCareer(state,key)?{stage:'active' as const,status:'Between teams'}:{stage:'not_started' as const,status:'Not started'};
}

export function specialCareerLifecycleView(state:GameState,key:DeepCareerPath):SpecialCareerLifecycleView{
  const c=readCareer(state,key);const established=hasEstablishedDeepCareer(state,key);const current=lifecycleStatus(state,key);const retirementFinal=(key==='sports'||key==='racing')&&c.retired===true;
  return{
    key,label:specialCareerPathLabel(key),stage:current.stage,status:current.status,established,
    activeCommitment:isSpecialCareerPathActive(state,key),leftPath:c.leftPath===true,retired:c.retired===true,
    comebackAllowed:established&&CREATIVE_COMEBACK_PATHS.has(key)&&(c.leftPath===true||c.retired===true),retirementFinal,
  };
}

export function specialCareerLifecycleViews(state:GameState){
  return DEEP_PATHS.map(key=>specialCareerLifecycleView(state,key)).filter(view=>view.established||view.activeCommitment||view.leftPath||view.retired);
}

export { specialCareerReentryGate } from './CommitmentSystem';

function bindingRetirementBlock(state:GameState,key:DeepCareerPath):string|undefined{
  const c=readCareer(state,key);
  if((key==='acting'||key==='directing')&&c.currentProjectActive===true)return'Finish the current production before retiring.';
  if(key==='music'&&c.tourActive===true)return'Finish the current tour before retiring from music.';
  if(key==='sports'&&c.pro===true&&n(c,'contractRemaining')>0)return`Your professional sports contract has ${n(c,'contractRemaining')} year${n(c,'contractRemaining')===1?'':'s'} remaining. Finish the term before retiring voluntarily.`;
  if(key==='modeling'){
    if(c.campaignActive===true)return'Finish the current modeling campaign before retiring.';
    if(c.agencyContractActive===true&&n(c,'agencyContractRemaining')>0)return`Your modeling representation contract has ${n(c,'agencyContractRemaining')} year${n(c,'agencyContractRemaining')===1?'':'s'} remaining. Finish the term before retiring.`;
  }
  if(key==='racing'){
    if(c.seasonActive===true)return'Finish the current racing season before retiring.';
    if(c.contractActive===true&&n(c,'contractRemaining')>0)return`Your racing contract has ${n(c,'contractRemaining')} year${n(c,'contractRemaining')===1?'':'s'} remaining. Finish the term before retiring voluntarily.`;
  }
  return undefined;
}

export function specialCareerRetirementGate(state:GameState,key:DeepCareerPath):CommitmentGate{
  const c=readCareer(state,key);
  if(c.retired===true)return{allowed:false,message:`You have already retired from ${specialCareerPathLabel(key)}.`};
  if(c.leftPath===true)return{allowed:false,message:`You already stepped away from ${specialCareerPathLabel(key)}. Return to the career before choosing a formal retirement.`};
  if(!hasEstablishedDeepCareer(state,key))return{allowed:false,message:`You need an established ${specialCareerPathLabel(key)} career before retirement is meaningful.`};
  const blocked=bindingRetirementBlock(state,key);if(blocked)return{allowed:false,message:blocked};
  return{allowed:true};
}

function closeWorlds(state:GameState,key:DeepCareerPath){for(const world of activeWorlds(state,key))archiveSpecialCareerWorld(world,state.character.age);}

/** Shared voluntary retirement transition. Path-specific forced retirement/release processors remain authoritative. */
export function retireSpecialCareer(state:GameState,key:DeepCareerPath):EngineResult{
  const gate=specialCareerRetirementGate(state,key);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const c=career(state,key);c.retired=true;c.leftPath=false;c.active=false;c.retirementAge=state.character.age;c.retirements=n(c,'retirements')+1;
  if(key==='acting'||key==='directing'){c.currentProjectActive=false;c.offerPending=false;}
  if(key==='music'){c.tourActive=false;c.partnershipOfferPending=false;c.partnershipActive=false;}
  if(key==='sports'){c.pro=false;c.freeAgent=false;c.renewalOfferPending=false;c.contractRemaining=0;}
  if(key==='modeling'){c.campaignActive=false;c.agencyOfferPending=false;c.agencyContractActive=false;c.agencyStatus='retired';}
  if(key==='racing'){c.racingPathway=false;c.seasonActive=false;c.contractActive=false;c.contractOfferPending=false;c.freeAgent=false;c.contractRemaining=0;}
  closeWorlds(state,key);
  const comeback=CREATIVE_COMEBACK_PATHS.has(key);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`You retired from ${specialCareerPathLabel(key)}. Your completed work, professional history, earnings, and relationships were preserved.`});
  return{success:true,messages:[{text:comeback?`You retired from ${specialCareerPathLabel(key)}. A future comeback remains possible after you age up.`:`You retired from ${specialCareerPathLabel(key)}. This competitive retirement is final for this life.`}]};
}

export function isCreativeComebackPath(key:SpecialCareerPathKey):key is Extract<DeepCareerPath,'acting'|'music'|'modeling'|'directing'>{return CREATIVE_COMEBACK_PATHS.has(key as DeepCareerPath);}
