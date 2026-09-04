import type { EducationProgram } from '../types/content';

const universityMajors = [
  ['biology','Biology',['science','medicine']], ['chemistry','Chemistry',['science','medicine']], ['computer_science','Computer Science',['technology','data','cybersecurity']],
  ['software_engineering','Software Engineering',['technology']], ['civil_engineering','Civil Engineering',['engineering']], ['mechanical_engineering','Mechanical Engineering',['engineering']],
  ['electrical_engineering','Electrical Engineering',['engineering']], ['finance','Finance',['finance','banking']], ['economics','Economics',['finance','government']],
  ['business','Business Administration',['business','marketing','management']], ['political_science','Political Science',['government','politics']], ['english','English',['publishing','journalism']],
  ['history','History',['education','archives']], ['psychology','Psychology',['wellness','social_services']], ['education','Education',['education']],
  ['nursing','Nursing',['nursing','medicine']], ['mathematics','Mathematics',['science','data','finance']], ['physics','Physics',['science','engineering']],
  ['art','Visual Arts',['design','modeling']], ['music','Music',['music','entertainment']], ['communications','Communications',['journalism','marketing','entertainment']],
  ['criminal_justice','Criminal Justice',['government','legal']], ['architecture','Architecture',['architecture']], ['environmental_science','Environmental Science',['science','environment']],
  ['sociology','Sociology',['social_services','government']], ['philosophy','Philosophy',['law','education']], ['accounting','Accounting',['finance','accounting']],
  ['hospitality','Hospitality Management',['hospitality','business']], ['film','Film Production',['entertainment','directing']], ['theatre','Theatre Arts',['acting','entertainment']],
  ['sports_science','Sports Science',['sports','fitness']], ['public_health','Public Health',['medicine','government']], ['marketing','Marketing',['marketing','business']],
  ['graphic_design','Graphic Design',['design','advertising']], ['geology','Geology',['science','engineering']], ['international_relations','International Relations',['government','politics']],
] as const;

export const educationPrograms: EducationProgram[] = [
  ...universityMajors.map(([id,name,tags]) => ({ id, name, kind:'university', years:4, tuition:18000, minIntelligence:42, careerTags:[...tags] })),
  { id:'community_business', name:'Community College — Business', kind:'community_college', years:2, tuition:6500, minIntelligence:30, careerTags:['business','office'] },
  { id:'community_it', name:'Community College — Information Technology', kind:'community_college', years:2, tuition:7000, minIntelligence:35, careerTags:['technology','support'] },
  { id:'graduate_school', name:'Graduate Research Degree', kind:'graduate', years:2, tuition:22000, minIntelligence:65, careerTags:['science','university'] },
  { id:'medical_school', name:'Medical School', kind:'professional', years:4, tuition:42000, minIntelligence:72, careerTags:['medicine'] },
  { id:'law_school', name:'Law School', kind:'professional', years:3, tuition:36000, minIntelligence:66, careerTags:['law'] },
  { id:'business_school', name:'Graduate Business School', kind:'professional', years:2, tuition:34000, minIntelligence:58, careerTags:['business','finance'] },
  { id:'dental_school', name:'Dental School', kind:'professional', years:4, tuition:39000, minIntelligence:68, careerTags:['dentistry'] },
  { id:'veterinary_school', name:'Veterinary School', kind:'professional', years:4, tuition:35000, minIntelligence:67, careerTags:['veterinary'] },
  { id:'nursing_school', name:'Nursing School', kind:'professional', years:3, tuition:16000, minIntelligence:52, careerTags:['nursing'] },
  { id:'trade_electrical', name:'Electrical Trade School', kind:'trade', years:2, tuition:9000, minIntelligence:32, careerTags:['electrical_trade'] },
  { id:'trade_plumbing', name:'Plumbing Trade School', kind:'trade', years:2, tuition:8500, minIntelligence:28, careerTags:['plumbing_trade'] },
  { id:'trade_culinary', name:'Culinary Institute', kind:'trade', years:2, tuition:12000, minIntelligence:28, careerTags:['culinary'] },
  { id:'trade_aviation_maintenance', name:'Aviation Maintenance School', kind:'trade', years:2, tuition:15000, minIntelligence:45, careerTags:['aviation_maintenance'] },
  { id:'trade_automotive', name:'Automotive Technology School', kind:'trade', years:2, tuition:10000, minIntelligence:32, careerTags:['automotive'] },
  { id:'trade_cosmetology', name:'Cosmetology Academy', kind:'trade', years:1, tuition:9000, minIntelligence:24, careerTags:['beauty','modeling'] },
];

export const educationById = Object.fromEntries(educationPrograms.map(p => [p.id,p])) as Record<string,EducationProgram>;
