import { makeStateId } from '../core/ids';
import type { EngineResult, GameState } from '../types/game';
import { isSpecialCareerPathActive, specialCareerPathLabel, type CommitmentGate, type SpecialCareerPathKey } from './CommitmentSystem';
import { archiveSpecialCareerWorld, specialCareerWorlds, type SpecialCareerWorldKind } from './SpecialCareerWorldSystem';
import { isCreativeComebackPath } from './SpecialCareerLifecycleSystem';

type Track = Record<string, number | string | boolean>;

const WORLD_KEYS = new Set<SpecialCareerPathKey>(['acting','music','sports','modeling','racing','directing']);

function career(state:GameState,key:SpecialCareerPathKey){return (state.specialCareers[key]??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?Number(record[key]):def;}
function activeWorlds(state:GameState,key:SpecialCareerPathKey){return WORLD_KEYS.has(key)?specialCareerWorlds(state,key as SpecialCareerWorldKind).filter(world=>world.active):[];}

export function specialCareerExitGate(state:GameState,key:SpecialCareerPathKey):CommitmentGate{
  if(!isSpecialCareerPathActive(state,key))return{allowed:false,message:`${specialCareerPathLabel(key)} is not currently an active special-career commitment.`};
  const c=career(state,key);
  if(key==='royalty'&&state.flags.royalBirth===true)return{allowed:false,message:'Inherited royalty is a life status rather than a career you can simply quit. A future abdication system can handle that separately.'};
  if((key==='acting'||key==='directing')&&c.currentProjectActive===true)return{allowed:false,message:'Finish the current production before leaving this career path.'};
  if(key==='music'&&c.tourActive===true)return{allowed:false,message:'Finish the current tour before leaving the music career path.'};
  if(key==='sports'&&c.pro===true&&n(c,'contractRemaining')>0)return{allowed:false,message:`Your professional sports contract has ${n(c,'contractRemaining')} year${n(c,'contractRemaining')===1?'':'s'} remaining. Finish the term before leaving the path.`};
  if(key==='modeling'){
    if(c.campaignActive===true)return{allowed:false,message:'Finish the current modeling campaign before leaving the path.'};
    if(c.agencyContractActive===true&&n(c,'agencyContractRemaining')>0)return{allowed:false,message:`Your modeling representation contract has ${n(c,'agencyContractRemaining')} year${n(c,'agencyContractRemaining')===1?'':'s'} remaining. Finish the term before leaving the path.`};
  }
  if(key==='racing'){
    if(c.seasonActive===true)return{allowed:false,message:'Finish the current racing season before leaving motorsport.'};
    if(c.contractActive===true&&n(c,'contractRemaining')>0)return{allowed:false,message:`Your racing contract has ${n(c,'contractRemaining')} year${n(c,'contractRemaining')===1?'':'s'} remaining. Finish the term before leaving motorsport.`};
  }
  return{allowed:true};
}

function closePersistentWorlds(state:GameState,key:SpecialCareerPathKey){for(const world of activeWorlds(state,key))archiveSpecialCareerWorld(world,state.character.age);}

/**
 * Called only after a successful professional action. Stepped-away paths resume normally; creative careers may
 * return from retirement after the lifecycle gate allows a later-age comeback. Athletic retirement remains final.
 */
export function reactivateSpecialCareerPath(state:GameState,key:SpecialCareerPathKey){
  const c=state.specialCareers[key] as Track|undefined;
  if(!c)return;
  const wasLeft=c.leftPath===true;const wasRetired=c.retired===true;
  if(wasRetired&&!isCreativeComebackPath(key))return;
  c.leftPath=false;
  if(wasLeft){c.lastReturnAge=state.character.age;c.returns=n(c,'returns')+1;}
  delete c.leftPathAge;
  if(wasRetired){c.retired=false;c.lastComebackAge=state.character.age;c.comebacks=n(c,'comebacks')+1;}
}

export function leaveSpecialCareer(state:GameState,key:SpecialCareerPathKey):EngineResult{
  const gate=specialCareerExitGate(state,key);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const c=career(state,key);const label=specialCareerPathLabel(key);
  c.leftPath=true;c.leftPathAge=state.character.age;c.active=false;
  if(key==='acting'||key==='directing'){c.offerPending=false;}
  if(key==='sports'){c.pro=false;c.freeAgent=false;c.renewalOfferPending=false;c.retired=false;c.contractRemaining=0;}
  if(key==='racing'){c.racingPathway=false;c.contractActive=false;c.contractOfferPending=false;c.freeAgent=false;c.retired=false;c.contractRemaining=0;}
  if(key==='modeling'){c.agencyOfferPending=false;c.agencyContractActive=false;c.agencyStatus='inactive';c.campaignActive=false;}
  if(key==='music'){c.partnershipOfferPending=false;c.distributionPartner=false;c.partnershipActive=false;}
  if(key==='politics'){c.office=0;}
  if(key==='military'){c.status='left service';}
  if(key==='crimeOrg'){c.rank='Former member';}
  closePersistentWorlds(state,key);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You stepped away from ${label}. Your completed history, skills, earnings, and relationships were preserved.`});
  return{success:true,messages:[{text:`You left ${label}. This special-career slot is now available again.`}]};
}
