import type { JobDefinition } from '../types/content';

type Ladder = {
  industry: string;
  education: string;
  base: number;
  stress: number;
  risk: number;
  fame: number;
  titles: string[];
  stat?: JobDefinition['statRequirements'];
};

const ladders: Ladder[] = [
  { industry:'Retail', education:'secondary', base:24000, stress:38, risk:8, fame:2, titles:['Shop Assistant','Senior Shop Assistant','Floor Supervisor','Store Manager','District Manager','Retail Operations Director'], stat:{charisma:35,discipline:30} },
  { industry:'Food Service', education:'secondary', base:23000, stress:52, risk:13, fame:3, titles:['Counter Crew','Line Cook','Shift Lead','Kitchen Manager','Restaurant Manager','Regional Hospitality Manager'], stat:{discipline:30} },
  { industry:'Coffee & Bakery', education:'secondary', base:23500, stress:36, risk:8, fame:2, titles:['Cafe Assistant','Barista','Lead Barista','Cafe Supervisor','Cafe Manager','Area Manager'], stat:{charisma:30} },
  { industry:'Hospitality', education:'secondary', base:26000, stress:40, risk:7, fame:2, titles:['Hotel Attendant','Guest Services Agent','Front Desk Supervisor','Hotel Manager','Regional Director','Hospitality Executive'], stat:{charisma:40} },
  { industry:'Office Administration', education:'secondary', base:30000, stress:30, risk:2, fame:1, titles:['Office Assistant','Administrative Coordinator','Executive Assistant','Office Manager','Operations Manager','Chief Administrative Officer'], stat:{discipline:40} },
  { industry:'Technology', education:'computer_science', base:52000, stress:43, risk:2, fame:8, titles:['Junior Software Developer','Software Developer','Senior Software Engineer','Engineering Lead','Engineering Director','Chief Technology Officer'], stat:{intelligence:60,discipline:45} },
  { industry:'Data', education:'computer_science', base:55000, stress:42, risk:2, fame:6, titles:['Data Technician','Data Analyst','Data Scientist','Senior Data Scientist','Analytics Director','Chief Data Officer'], stat:{intelligence:63} },
  { industry:'Cybersecurity', education:'computer_science', base:57000, stress:55, risk:3, fame:4, titles:['Security Analyst','Security Engineer','Senior Security Engineer','Security Architect','Security Director','Chief Security Officer'], stat:{intelligence:62,discipline:50} },
  { industry:'Medicine', education:'medical_school', base:72000, stress:74, risk:14, fame:12, titles:['Medical Resident','General Physician','Senior Physician','Medical Specialist','Department Chief','Hospital Medical Director'], stat:{intelligence:72,discipline:65} },
  { industry:'Nursing', education:'nursing', base:48000, stress:68, risk:16, fame:3, titles:['Staff Nurse','Senior Nurse','Charge Nurse','Nurse Practitioner','Nursing Director','Chief Nursing Officer'], stat:{intelligence:52,discipline:58} },
  { industry:'Dentistry', education:'dental_school', base:78000, stress:48, risk:7, fame:5, titles:['Dental Associate','Dentist','Senior Dentist','Practice Partner','Clinic Director','Dental Group Executive'], stat:{intelligence:68,discipline:58} },
  { industry:'Veterinary Medicine', education:'veterinary_school', base:62000, stress:60, risk:15, fame:4, titles:['Veterinary Intern','Veterinarian','Senior Veterinarian','Practice Partner','Clinic Director','Veterinary Network Director'], stat:{intelligence:66,discipline:55} },
  { industry:'Law', education:'law_school', base:62000, stress:70, risk:3, fame:12, titles:['Legal Associate','Attorney','Senior Attorney','Partner','Managing Partner','General Counsel'], stat:{intelligence:67,charisma:48} },
  { industry:'Education', education:'education', base:38000, stress:47, risk:4, fame:3, titles:['Teaching Assistant','Teacher','Senior Teacher','Department Chair','Assistant Principal','School Principal'], stat:{intelligence:52,charisma:42} },
  { industry:'University', education:'graduate_school', base:46000, stress:43, risk:2, fame:7, titles:['Research Assistant','Lecturer','Assistant Professor','Associate Professor','Professor','Dean'], stat:{intelligence:70,discipline:58} },
  { industry:'Civil Engineering', education:'engineering', base:56000, stress:46, risk:8, fame:3, titles:['Graduate Engineer','Civil Engineer','Senior Civil Engineer','Project Engineer','Engineering Manager','Infrastructure Director'], stat:{intelligence:62,discipline:48} },
  { industry:'Mechanical Engineering', education:'engineering', base:58000, stress:46, risk:9, fame:4, titles:['Graduate Mechanical Engineer','Mechanical Engineer','Senior Mechanical Engineer','Principal Engineer','Engineering Manager','Technical Director'], stat:{intelligence:64} },
  { industry:'Electrical Engineering', education:'engineering', base:60000, stress:49, risk:10, fame:4, titles:['Graduate Electrical Engineer','Electrical Engineer','Senior Electrical Engineer','Systems Architect','Engineering Manager','Technical Director'], stat:{intelligence:65} },
  { industry:'Science', education:'science', base:48000, stress:40, risk:8, fame:8, titles:['Lab Technician','Research Scientist','Senior Scientist','Principal Scientist','Research Director','Chief Science Officer'], stat:{intelligence:68,discipline:52} },
  { industry:'Finance', education:'finance', base:54000, stress:64, risk:2, fame:9, titles:['Financial Analyst','Senior Analyst','Portfolio Associate','Portfolio Manager','Investment Director','Chief Investment Officer'], stat:{intelligence:60,discipline:52} },
  { industry:'Accounting', education:'finance', base:45000, stress:48, risk:2, fame:2, titles:['Accounts Assistant','Accountant','Senior Accountant','Finance Manager','Controller','Chief Financial Officer'], stat:{intelligence:54,discipline:60} },
  { industry:'Banking', education:'finance', base:48000, stress:56, risk:2, fame:4, titles:['Banking Associate','Relationship Banker','Senior Banker','Branch Manager','Regional Director','Banking Executive'], stat:{charisma:46,discipline:48} },
  { industry:'Journalism', education:'communications', base:34000, stress:55, risk:8, fame:18, titles:['News Assistant','Reporter','Senior Reporter','Correspondent','Editor','News Director'], stat:{intelligence:50,charisma:45,creativity:45} },
  { industry:'Publishing', education:'english', base:33000, stress:40, risk:1, fame:7, titles:['Editorial Assistant','Editor','Senior Editor','Acquisitions Editor','Editorial Director','Publisher'], stat:{intelligence:52,creativity:50} },
  { industry:'Government', education:'political_science', base:39000, stress:48, risk:3, fame:8, titles:['Civic Clerk','Policy Assistant','Policy Analyst','Senior Policy Advisor','Department Director','Permanent Secretary'], stat:{intelligence:55,discipline:55} },
  { industry:'Aviation', education:'pilot_license', base:52000, stress:62, risk:28, fame:8, titles:['Flight Instructor','Regional First Officer','Regional Captain','Airline First Officer','Airline Captain','Chief Pilot'], stat:{intelligence:56,discipline:62} },
  { industry:'Emergency Services', education:'secondary', base:42000, stress:76, risk:42, fame:6, titles:['Emergency Responder','Senior Responder','Crew Lead','Station Supervisor','District Commander','Service Chief'], stat:{athleticism:50,discipline:55} },
  { industry:'Construction', education:'trade_school', base:38000, stress:52, risk:34, fame:2, titles:['Construction Laborer','Skilled Tradesperson','Site Foreperson','Site Manager','Project Manager','Construction Director'], stat:{athleticism:42,discipline:42} },
  { industry:'Electrical Trade', education:'trade_school', base:41000, stress:45, risk:25, fame:2, titles:['Electrical Apprentice','Electrician','Master Electrician','Site Supervisor','Contract Manager','Trade Company Director'], stat:{intelligence:45,discipline:50} },
  { industry:'Plumbing Trade', education:'trade_school', base:40000, stress:42, risk:20, fame:2, titles:['Plumbing Apprentice','Plumber','Master Plumber','Site Supervisor','Contract Manager','Trade Company Director'], stat:{discipline:48} },
  { industry:'Transportation', education:'secondary', base:36000, stress:51, risk:24, fame:2, titles:['Delivery Driver','Commercial Driver','Route Supervisor','Fleet Coordinator','Fleet Manager','Logistics Director'], stat:{discipline:45} },
  { industry:'Logistics', education:'business', base:43000, stress:54, risk:5, fame:2, titles:['Logistics Coordinator','Logistics Analyst','Senior Planner','Operations Manager','Supply Chain Director','Chief Operations Officer'], stat:{intelligence:52,discipline:55} },
  { industry:'Marketing', education:'communications', base:42000, stress:49, risk:1, fame:12, titles:['Marketing Assistant','Marketing Specialist','Campaign Manager','Brand Manager','Marketing Director','Chief Marketing Officer'], stat:{charisma:48,creativity:52} },
  { industry:'Advertising', education:'communications', base:43000, stress:60, risk:1, fame:14, titles:['Account Assistant','Copywriter','Senior Creative','Creative Lead','Creative Director','Agency Executive'], stat:{creativity:62,charisma:44} },
  { industry:'Design', education:'art', base:39000, stress:44, risk:1, fame:10, titles:['Junior Designer','Designer','Senior Designer','Design Lead','Design Director','Chief Design Officer'], stat:{creativity:65} },
  { industry:'Architecture', education:'architecture', base:52000, stress:59, risk:3, fame:9, titles:['Architectural Assistant','Architect','Senior Architect','Project Architect','Design Principal','Studio Director'], stat:{intelligence:60,creativity:58} },
  { industry:'Real Estate', education:'secondary', base:33000, stress:46, risk:2, fame:10, titles:['Leasing Assistant','Property Agent','Senior Agent','Broker','Office Director','Real Estate Executive'], stat:{charisma:56} },
  { industry:'Human Resources', education:'business', base:42000, stress:45, risk:1, fame:2, titles:['HR Coordinator','HR Specialist','HR Business Partner','HR Manager','People Director','Chief People Officer'], stat:{charisma:46,discipline:50} },
  { industry:'Manufacturing', education:'secondary', base:35000, stress:48, risk:23, fame:1, titles:['Production Worker','Machine Operator','Team Lead','Production Supervisor','Plant Manager','Manufacturing Director'], stat:{discipline:48} },
  { industry:'Agriculture', education:'secondary', base:32000, stress:42, risk:26, fame:2, titles:['Farm Hand','Equipment Operator','Field Supervisor','Farm Manager','Operations Director','Agricultural Executive'], stat:{athleticism:35,discipline:48} },
  { industry:'Social Services', education:'psychology', base:36000, stress:64, risk:8, fame:2, titles:['Community Assistant','Case Worker','Senior Case Worker','Program Manager','Regional Director','Agency Director'], stat:{charisma:45,discipline:50} },
  { industry:'Mental Wellness', education:'psychology', base:47000, stress:57, risk:2, fame:5, titles:['Counseling Assistant','Counselor','Therapist','Senior Therapist','Clinical Director','Wellness Network Director'], stat:{intelligence:56,charisma:55} },
  { industry:'Hospitality Culinary', education:'trade_school', base:33000, stress:66, risk:17, fame:18, titles:['Prep Cook','Cook','Sous Chef','Head Chef','Executive Chef','Culinary Director'], stat:{creativity:52,discipline:50} },
  { industry:'Aviation Maintenance', education:'trade_school', base:46000, stress:48, risk:18, fame:2, titles:['Maintenance Apprentice','Aircraft Technician','Senior Technician','Maintenance Lead','Maintenance Manager','Engineering Director'], stat:{intelligence:52,discipline:62} },
  { industry:'Public Transit', education:'secondary', base:37000, stress:45, risk:18, fame:1, titles:['Transit Operator','Senior Operator','Route Coordinator','Depot Supervisor','Operations Manager','Transit Director'], stat:{discipline:48} },
  { industry:'Library & Archives', education:'history', base:34000, stress:24, risk:1, fame:3, titles:['Library Assistant','Librarian','Senior Librarian','Collections Manager','Library Director','Chief Archivist'], stat:{intelligence:52,discipline:48} },
  { industry:'Environmental Services', education:'science', base:43000, stress:41, risk:12, fame:4, titles:['Field Technician','Environmental Analyst','Senior Analyst','Project Manager','Program Director','Sustainability Executive'], stat:{intelligence:55} },
  { industry:'Biotechnology', education:'science', base:56000, stress:53, risk:8, fame:10, titles:['Lab Associate','Biotech Scientist','Senior Scientist','Research Lead','Research Director','Biotech Executive'], stat:{intelligence:69,discipline:55} },
  { industry:'Pharmaceutical Research', education:'science', base:58000, stress:55, risk:7, fame:7, titles:['Research Associate','Drug Research Scientist','Senior Scientist','Program Lead','Research Director','Pharma Executive'], stat:{intelligence:70,discipline:55} },
  { industry:'Insurance', education:'business', base:42000, stress:43, risk:1, fame:1, titles:['Claims Assistant','Claims Specialist','Senior Underwriter','Team Manager','Regional Director','Insurance Executive'], stat:{intelligence:48,discipline:52} },
  { industry:'Customer Support', education:'secondary', base:28000, stress:52, risk:1, fame:1, titles:['Support Agent','Senior Support Agent','Team Lead','Support Manager','Customer Experience Director','Service Executive'], stat:{charisma:42,discipline:40} }
];

const levelMultipliers = [1, 1.25, 1.6, 2.05, 2.8, 4.2];

export const jobs: JobDefinition[] = ladders.flatMap((ladder, ladderIndex) =>
  ladder.titles.map((title, level) => {
    const id = `${ladder.industry.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${level + 1}`;
    const nextTitle = ladder.titles[level + 1];
    return {
      id,
      title,
      industry: ladder.industry,
      salaryRange: [
        Math.round(ladder.base * levelMultipliers[level]! * .88),
        Math.round(ladder.base * levelMultipliers[level]! * 1.18),
      ],
      educationRequirement: ladder.education,
      experienceRequirement: Math.max(0, level * 2 - (level >= 4 ? 1 : 0)),
      statRequirements: Object.fromEntries(Object.entries(ladder.stat ?? {}).map(([k,v]) => [k, Math.min(90, Number(v) + level * 3)])),
      promotionPath: nextTitle ? `${ladder.industry.toLowerCase().replace(/[^a-z0-9]+/g,'_')}_${level + 2}` : undefined,
      famePotential: Math.min(100, ladder.fame + level * 3),
      stress: Math.min(95, ladder.stress + level * 3),
      healthRisk: Math.min(90, ladder.risk + level * 2),
      minAge: level === 0 ? 16 : 18,
    } satisfies JobDefinition;
  })
);

export const jobById = Object.fromEntries(jobs.map(job => [job.id, job])) as Record<string, JobDefinition>;
