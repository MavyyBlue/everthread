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
function hasSpecialCareerWorld(state:GameState,key:SpecialCareerPathKey){return (state.socialWorlds??[]).some(world=>world.kind==='organization'&&world.active&&world.id.startsWith(`special-${String(key)}-`));}

export function isActivelyEnrolled(state:GameState){
  return state.education.some(record=>!record.graduated&&!record.droppedOut&&!record.endAge);
}

/**
 * A special-career slot represents a real current commitment, not raw skill practice or lifetime history.
 * Legacy saves sometimes carry active=true from old acting/music/modeling training behavior, so those paths
 * require professional evidence unless the player has explicitly left the path. Completed history is preserved.
 */
export function isSpecialCareerPathActive(state:GameState,key:SpecialCareerPathKey){
  const career=state.specialCareers[key];
  if(key==='royalty'&&state.flags.royalBirth===true)return true;
  if(!career)return false;
  if(career.retired===true||career.leftPath===true)return false;
  if(key==='acting')return career.currentProjectActive===true||career.offerPending===true||n(career,'credits')>0||n(career,'agent')>0||hasSpecialCareerWorld(state,key);
  if(key==='music')return career.tourActive===true||career.partnershipActive===true||typeof career.professionalStartAge==='number'||n(career,'songsReleased')+n(career,'albumsReleased')>0||hasSpecialCareerWorld(state,key);
  if(key==='modeling')return career.campaignActive===true||career.agencyContractActive===true||career.agencyOfferPending===true||n(career,'jobs')>0||hasSpecialCareerWorld(state,key);
  if(key==='racing')return career.racingPathway===true||career.active===true||career.freeAgent===true||hasSpecialCareerWorld(state,key);
  if(key==='directing')return career.currentProjectActive===true||career.offerPending===true||n(career,'filmsDirected')>0||hasSpecialCareerWorld(state,key);
  if(key==='sports')return career.active===true||career.pro===true||career.freeAgent===true||career.renewalOfferPending===true;
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
  // Existing/legacy paths stay usable so an old conflicting save is never bricked.
  if(isSpecialCareerPathActive(state,key))return{allowed:true};
  const hasFullTime=Boolean(state.employment.current);const hasPartTime=(state.employment.partTimeJobs??[]).length>0;
  if(hasFullTime||hasPartTime){
    const workLabel=hasFullTime&&hasPartTime?'full-time and part-time jobs':hasFullTime?'full-time job':'part-time job';
    return{allowed:false,message:`Leave your ${workLabel} before starting a special career. Special careers cannot be combined with ordinary full-time or part-time employment.`};
  }
  const capacity=specialCareerCapacity(state);
  if(capacity.active.length>=capacity.limit){
    const context=capacity.inSchool?'while enrolled in school':'at the same time';
    return{allowed:false,message:`You can pursue only ${capacity.limit} active special career path${capacity.limit===1?'':'s'} ${context}. End or retire from an active special career before starting another.`};
  }
  return{allowed:true};
}

export function fullTimeJobGate(state:GameState):CommitmentGate{
  const special=activeSpecialCareerPaths(state);
  if(special.length>0)return{allowed:false,message:`Full-time jobs are unavailable while you are pursuing ${special.length===1?specialCareerPathLabel(special[0]):'active special careers'}. Leave or retire from your active special career commitment${special.length===1?'':'s'} before taking ordinary full-time work.`};
  if(isActivelyEnrolled(state))return{allowed:false,message:'Full-time jobs are unavailable while you are actively enrolled in school.'};
  return{allowed:true};
}

export function partTimeJobGate(state:GameState):CommitmentGate{
  const special=activeSpecialCareerPaths(state);
  if(special.length>0)return{allowed:false,message:`Part-time jobs are unavailable while you are pursuing ${special.length===1?specialCareerPathLabel(special[0]):'active special careers'}. Leave or retire from your active special career commitment${special.length===1?'':'s'} before taking ordinary part-time work.`};
  return{allowed:true};
}

export function schoolEnrollmentGate(state:GameState):CommitmentGate{
  if(state.employment.current)return{allowed:false,message:'Leave your full-time job before enrolling in school.'};
  const special=activeSpecialCareerPaths(state);
  if(special.length>1)return{allowed:false,message:'School allows only one active special career path. End or retire from the extra special-career commitment before enrolling.'};
  if(special.length>0&&(state.employment.partTimeJobs??[]).length>0)return{allowed:false,message:'If you enroll while pursuing a special career, you must leave your part-time job first.'};
  return{allowed:true};
}
