import type { SchoolGroupKind } from '../types/game';

export interface SchoolStageProfile {
  stage: 'primary' | 'middle' | 'secondary';
  label: string;
  startAge: number;
  endAge: number;
  classmateCount: number;
  teacherCount: number;
}

export interface SchoolProfile {
  id: string;
  minimumLeavingAge: number;
  stages: SchoolStageProfile[];
}

export interface SchoolGroupTemplate {
  id: string;
  name: string;
  kind: SchoolGroupKind;
  minAge: number;
  maxAge: number;
  weight: number;
}

const northAmerican: SchoolProfile = {
  id: 'north-american', minimumLeavingAge:16,
  stages: [
    { stage:'primary', label:'Primary School', startAge:5, endAge:11, classmateCount:7, teacherCount:2 },
    { stage:'middle', label:'Middle School', startAge:11, endAge:14, classmateCount:8, teacherCount:3 },
    { stage:'secondary', label:'Secondary School', startAge:14, endAge:18, classmateCount:9, teacherCount:3 },
  ],
};

const commonwealth: SchoolProfile = {
  id: 'commonwealth', minimumLeavingAge:16,
  stages: [
    { stage:'primary', label:'Primary School', startAge:5, endAge:11, classmateCount:7, teacherCount:2 },
    { stage:'middle', label:'Lower Secondary School', startAge:11, endAge:15, classmateCount:8, teacherCount:3 },
    { stage:'secondary', label:'Upper Secondary School', startAge:15, endAge:18, classmateCount:9, teacherCount:3 },
  ],
};

const continental: SchoolProfile = {
  id: 'continental', minimumLeavingAge:16,
  stages: [
    { stage:'primary', label:'Primary Academy', startAge:6, endAge:12, classmateCount:7, teacherCount:2 },
    { stage:'middle', label:'Lower Secondary Academy', startAge:12, endAge:15, classmateCount:8, teacherCount:3 },
    { stage:'secondary', label:'Upper Secondary Academy', startAge:15, endAge:18, classmateCount:9, teacherCount:3 },
  ],
};

const eastAsian: SchoolProfile = {
  id: 'east-asian', minimumLeavingAge:17,
  stages: [
    { stage:'primary', label:'Elementary School', startAge:6, endAge:12, classmateCount:8, teacherCount:2 },
    { stage:'middle', label:'Junior Secondary School', startAge:12, endAge:15, classmateCount:9, teacherCount:3 },
    { stage:'secondary', label:'Senior Secondary School', startAge:15, endAge:18, classmateCount:10, teacherCount:3 },
  ],
};

const laterStart: SchoolProfile = {
  id: 'later-start', minimumLeavingAge:16,
  stages: [
    { stage:'primary', label:'Primary School', startAge:6, endAge:12, classmateCount:7, teacherCount:2 },
    { stage:'middle', label:'Intermediate School', startAge:12, endAge:16, classmateCount:8, teacherCount:3 },
    { stage:'secondary', label:'Secondary School', startAge:16, endAge:18, classmateCount:9, teacherCount:3 },
  ],
};

const PROFILE_BY_COUNTRY: Record<string, SchoolProfile> = {};
for (const id of ['us','ca','mx','br','ar','cl']) PROFILE_BY_COUNTRY[id] = northAmerican;
for (const id of ['gb','ie','au','nz','za','ng','in','sg','ph']) PROFILE_BY_COUNTRY[id] = commonwealth;
for (const id of ['fr','de','es','pt','it','nl','be','se','no','dk','pl','gr','tr','eg','ae']) PROFILE_BY_COUNTRY[id] = continental;
for (const id of ['jp','kr']) PROFILE_BY_COUNTRY[id] = eastAsian;

export function schoolProfileFor(countryId: string): SchoolProfile {
  return PROFILE_BY_COUNTRY[countryId] ?? laterStart;
}

export const schoolGroupTemplates: SchoolGroupTemplate[] = [
  { id:'reading_circle', name:'Reading Circle', kind:'academic', minAge:6, maxAge:13, weight:8 },
  { id:'science_club', name:'Science Club', kind:'academic', minAge:9, maxAge:30, weight:10 },
  { id:'math_team', name:'Math Team', kind:'academic', minAge:10, maxAge:30, weight:7 },
  { id:'debate_society', name:'Debate Society', kind:'academic', minAge:12, maxAge:30, weight:8 },
  { id:'robotics_club', name:'Robotics Club', kind:'academic', minAge:12, maxAge:30, weight:7 },
  { id:'art_studio', name:'Art Studio', kind:'arts', minAge:6, maxAge:30, weight:9 },
  { id:'school_choir', name:'School Choir', kind:'arts', minAge:7, maxAge:30, weight:9 },
  { id:'drama_society', name:'Drama Society', kind:'arts', minAge:11, maxAge:30, weight:8 },
  { id:'dance_collective', name:'Dance Collective', kind:'arts', minAge:10, maxAge:30, weight:6 },
  { id:'football_club', name:'Football Club', kind:'sport', minAge:7, maxAge:30, weight:9 },
  { id:'basketball_club', name:'Basketball Club', kind:'sport', minAge:9, maxAge:30, weight:8 },
  { id:'track_team', name:'Track Team', kind:'sport', minAge:10, maxAge:30, weight:8 },
  { id:'swim_team', name:'Swim Team', kind:'sport', minAge:8, maxAge:30, weight:6 },
  { id:'student_newspaper', name:'Student Newspaper', kind:'service', minAge:11, maxAge:30, weight:7 },
  { id:'volunteer_circle', name:'Volunteer Circle', kind:'service', minAge:10, maxAge:30, weight:7 },
  { id:'student_council', name:'Student Council', kind:'leadership', minAge:11, maxAge:30, weight:6 },
  { id:'peer_support', name:'Peer Support Group', kind:'social', minAge:12, maxAge:30, weight:6 },
  { id:'games_club', name:'Games Club', kind:'social', minAge:8, maxAge:30, weight:7 },
  { id:'campus_radio', name:'Campus Radio', kind:'arts', minAge:17, maxAge:30, weight:7 },
  { id:'research_society', name:'Research Society', kind:'academic', minAge:17, maxAge:30, weight:8 },
  { id:'entrepreneur_circle', name:'Entrepreneur Circle', kind:'leadership', minAge:17, maxAge:30, weight:7 },
];

export function groupTemplatesForAge(age: number) {
  return schoolGroupTemplates.filter(group => age >= group.minAge && age <= group.maxAge);
}
