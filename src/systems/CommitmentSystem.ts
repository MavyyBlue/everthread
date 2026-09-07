import type { GameState } from '../types/game';

export type SpecialCareerPathKey = keyof GameState['specialCareers'];

export interface CommitmentGate {
  allowed: boolean;
  message?: string;
}

const SPECIAL_PATH_LABELS: Record<SpecialCareerPathKey,string> = {
  acting:'Acting', music:'Music', sports:'Professional sports', combat:'Combat sports', politics:'Politics', royalty:'Royalty', military:'Military', crimeOrg:'Organized crime', modeling:'Modeling', racing:'Motorsport', directing:'Film directing', secretAgency:'Intelligence service', commune:'Commune leadership', casino:'Casino', zoo:'Zoo', museum:'Museum',
};

function n(record:Record<string,number|string|boolean>|undefined,key:string){return typeof record?.[key]==='number'?Number(record[key]):0;}
function hasSpecialCareerWorld(state:GameState,key:SpecialCareerPathKey){return (state.socialWorlds??[]).some(world=>world.kind==='organization'&&world.id.startsWith(`special-${String(key)}-`));}

export function isActivelyEnrolled(state:GameState){
  return state.education.some(record=>!record.graduated&&!record.droppedOut&&!record.endAge);
}

/**
 * A special-career slot represents a real established/pursued path, not raw skill practice.
 * Legacy saves sometimes carry active=true from old acting/music/modeling training behavior,
 * so those paths require professional evidence instead of trusting the raw flag alone.
 */
export function isSpecialCareerPathActive(state:GameState,key:SpecialCareerPathKey){
  const career=state.specialCareers[key];
  if(key==='royalty'&&state.flags.royalBirth===true)return true;
  if(!career)return false;
  if(career.retired===true)return false;
  if(key==='acting')return career.currentProjectActive===true||career.offerPending===true||n(career,'credits')>0||n(career,'agent')>0||hasSpecialCareerWorld(state,key);
  if(key==='music')return career.tourActive===true||career.partnershipActive===true||typeof career.professionalStartAge==='number'||n(career,'songsReleased')+n(career,'albumsReleased')>0||hasSpecialCareerWorld(state,key);
  if(key==='modeling')return career.campaignActive===true||career.agencyContractActive===true||career.agencyOfferPending===true||n(career,'jobs')>0||hasSpecialCareerWorld(state,key);
  if(key==='racing')return career.racingPathway===true||career.active===true||career.freeAgent===true||hasSpecialCareerWorld(state,key);
  if(key==='directing')return career.currentProjectActive===true||career.offerPending===true||n(career,'filmsDirected')>0||hasSpecialCareerWorld(state,key);
  if(key==='sports')return career.active===true||career.pro===true||career.freeAgent===true;
  if(key==='politics')return career.active===true||n(career,'office')>0;
  if(key==='royalty')return career.active===true;
  return career.active===true;
}

export function activeSpecialCareerPaths(state:GameState):SpecialCareerPathKey[]{
  return (Object.keys(SPECIAL_PATH_LABELS) as SpecialCareerPathKey[]).filter(key=>isSpecialCareerPathActive(state,key));
}

export function specialCareerPathLabel(key:SpecialCareerPathKey){return SPECIAL_PATH_LABELS[key];}
export function specialCareerPathLimit(state:GameState){return isActivelyEnrolled(state)?1:2;}

export function specialCareerCapacity(state:GameState){
  const active=activeSpecialCareerPaths(state);const inSchool=isActivelyEnrolled(state);const limit=inSchool?1:2;
  return{active,limit,inSchool,overLimit:active.length>limit};
}

export function specialCareerStartGate(state:GameState,key:SpecialCareerPathKey):CommitmentGate{
  if(isSpecialCareerPathActive(state,key))return{allowed:true};
  const capacity=specialCareerCapacity(state);
  if(capacity.active.length>=capacity.limit){
    const context=capacity.inSchool?'while enrolled in school':'at the same time';
    return{allowed:false,message:`You can pursue only ${capacity.limit} active special career path${capacity.limit===1?'':'s'} ${context}. End or retire from an active special career before starting another.`};
  }
  if(capacity.inSchool&&(Boolean(state.employment.current)||(state.employment.partTimeJobs??[]).length>0)){
    return{allowed:false,message:'While enrolled, starting a special career requires leaving your regular and part-time jobs first.'};
  }
  return{allowed:true};
}

export function fullTimeJobGate(state:GameState):CommitmentGate{
  if(isActivelyEnrolled(state))return{allowed:false,message:'Full-time jobs are unavailable while you are actively enrolled in school. Part-time work remains available unless you are also pursuing a special career.'};
  return{allowed:true};
}

export function partTimeJobGate(state:GameState):CommitmentGate{
  if(isActivelyEnrolled(state)&&activeSpecialCareerPaths(state).length>0)return{allowed:false,message:'Part-time jobs are unavailable while you are balancing school with an active special career.'};
  return{allowed:true};
}

export function schoolEnrollmentGate(state:GameState):CommitmentGate{
  if(state.employment.current)return{allowed:false,message:'Leave your full-time job before enrolling in school.'};
  const special=activeSpecialCareerPaths(state);
  if(special.length>1)return{allowed:false,message:'School allows only one active special career path. End or retire from the extra special-career commitment before enrolling.'};
  if(special.length>0&&(state.employment.partTimeJobs??[]).length>0)return{allowed:false,message:'If you enroll while pursuing a special career, you must leave your part-time job first.'};
  return{allowed:true};
}
