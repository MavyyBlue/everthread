import type { GameState } from '../types/game';
import { crimes } from '../data/crimes';
import { DATING_MIN_AGE } from '../systems/RelationshipSystem';
import { THERAPY_MIN_AGE } from '../systems/StressConsequenceSystem';
import { SOCIAL_MEDIA_MIN_AGE } from '../systems/FameSystem';
import { RISKY_HABIT_MIN_AGE, WELLNESS_MIN_AGES } from '../systems/HealthSystem';
import { FAMILY_TRAVEL_MIN_AGE, INDEPENDENT_TRAVEL_MIN_AGE, LICENSE_MIN_AGES } from '../systems/TravelSystem';
import { FREELANCE_MIN_AGE, MINIMUM_FULL_TIME_JOB_AGE } from '../systems/CareerSystem';
import { MINIMUM_PART_TIME_JOB_AGE } from '../systems/WorkplaceSystem';
import { ACADEMIC_SHORTCUT_MIN_AGE } from '../systems/SchoolWorldSystem';
import { isSpecialCareerPathActive, type SpecialCareerPathKey } from '../systems/CommitmentSystem';
import {
  ACTING_AUDITION_MIN_AGE,
  MUSIC_RELEASE_MIN_AGE,
  SPECIAL_CAREER_MIN_AGES,
  SPORTS_PRO_MIN_AGE,
} from '../systems/SpecialCareerSystem';
import { COMBAT_FIGHT_MIN_AGE } from '../systems/CombatCareerWorldSystem';

export type WellnessActivityId=keyof typeof WELLNESS_MIN_AGES;
export type LicenseKind=keyof typeof LICENSE_MIN_AGES;

export function activitiesDisclosure(state:GameState){
  const age=state.character.age;
  const wellness=(Object.keys(WELLNESS_MIN_AGES) as WellnessActivityId[]).filter(id=>age>=WELLNESS_MIN_AGES[id]);
  const licenses=(Object.keys(LICENSE_MIN_AGES) as LicenseKind[]).filter(kind=>age>=LICENSE_MIN_AGES[kind]);
  const crimeAvailable=Boolean(state.flags.pendingCharge)||state.legal.imprisoned||crimes.some(crime=>crime.minAge<=age);
  return{
    meetSomeone:age>=DATING_MIN_AGE,
    wellness,
    therapy:age>=THERAPY_MIN_AGE,
    travel:age>=FAMILY_TRAVEL_MIN_AGE,
    independentTravel:age>=INDEPENDENT_TRAVEL_MIN_AGE,
    licenses,
    socialMedia:age>=SOCIAL_MEDIA_MIN_AGE,
    crime:crimeAvailable,
    riskyHabits:age>=RISKY_HABIT_MIN_AGE,
    unusualVentures:age>=INDEPENDENT_TRAVEL_MIN_AGE,
  };
}

export function careerDisclosure(state:GameState){
  const age=state.character.age;
  return{
    fullTimeWork:Boolean(state.employment.current)||age>=MINIMUM_FULL_TIME_JOB_AGE,
    partTimeWork:(state.employment.partTimeJobs??[]).length>0||age>=MINIMUM_PART_TIME_JOB_AGE,
    freelance:age>=FREELANCE_MIN_AGE,
    academicShortcut:age>=ACADEMIC_SHORTCUT_MIN_AGE,
  };
}

export function schoolGroupAgeVisible(age:number,minAge:number,joined=false){return joined||age>=minAge;}

export function specialPathAgeVisible(state:GameState,key:SpecialCareerPathKey){
  if(isSpecialCareerPathActive(state,key))return true;
  const history=state.specialCareers[key];
  if(history&&Object.keys(history).length>0)return true;
  if(key==='royalty')return state.flags.royalBirth===true;
  return state.character.age>=SPECIAL_CAREER_MIN_AGES[key as keyof typeof SPECIAL_CAREER_MIN_AGES];
}

export function specialActionAgeVisible(state:GameState,path:SpecialCareerPathKey,action:string){
  const age=state.character.age;
  if(!specialPathAgeVisible(state,path))return false;
  if(path==='acting'&&action==='Audition')return age>=ACTING_AUDITION_MIN_AGE;
  if(path==='music'&&['Release song','Release album'].includes(action))return age>=MUSIC_RELEASE_MIN_AGE;
  if(path==='sports'&&action==='Seek pro contract')return age>=SPORTS_PRO_MIN_AGE;
  if(path==='combat'&&action==='Take fight')return age>=COMBAT_FIGHT_MIN_AGE;
  return true;
}
