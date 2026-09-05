export interface PartTimeJobDefinition {
  id: string;
  title: string;
  industry: string;
  minAge: number;
  hourlyRate: number;
  stress: number;
  preferredStat?: 'charisma' | 'discipline' | 'intelligence' | 'creativity' | 'athleticism';
}

export const partTimeJobs: PartTimeJobDefinition[] = [
  {id:'pt_shop',title:'Shop Assistant',industry:'Retail',minAge:16,hourlyRate:15,stress:34,preferredStat:'charisma'},
  {id:'pt_cafe',title:'Cafe Crew',industry:'Coffee & Bakery',minAge:16,hourlyRate:15,stress:38,preferredStat:'charisma'},
  {id:'pt_food',title:'Restaurant Crew',industry:'Food Service',minAge:16,hourlyRate:16,stress:48,preferredStat:'discipline'},
  {id:'pt_library',title:'Library Aide',industry:'Library & Archives',minAge:16,hourlyRate:16,stress:20,preferredStat:'intelligence'},
  {id:'pt_office',title:'Office Assistant',industry:'Office Administration',minAge:17,hourlyRate:18,stress:28,preferredStat:'discipline'},
  {id:'pt_tutor',title:'Peer Tutor',industry:'Education',minAge:17,hourlyRate:20,stress:27,preferredStat:'intelligence'},
  {id:'pt_support',title:'Support Assistant',industry:'Customer Support',minAge:16,hourlyRate:17,stress:42,preferredStat:'charisma'},
  {id:'pt_events',title:'Event Assistant',industry:'Hospitality',minAge:17,hourlyRate:18,stress:44,preferredStat:'charisma'},
  {id:'pt_design',title:'Junior Design Assistant',industry:'Design',minAge:18,hourlyRate:22,stress:33,preferredStat:'creativity'},
  {id:'pt_lab',title:'Lab Assistant',industry:'Science',minAge:18,hourlyRate:22,stress:35,preferredStat:'intelligence'},
  {id:'pt_fitness',title:'Recreation Assistant',industry:'Social Services',minAge:17,hourlyRate:18,stress:31,preferredStat:'athleticism'},
  {id:'pt_admin',title:'Records Assistant',industry:'Government',minAge:18,hourlyRate:20,stress:29,preferredStat:'discipline'},
];

export const partTimeJobById = Object.fromEntries(partTimeJobs.map(job=>[job.id,job])) as Record<string,PartTimeJobDefinition>;

const departmentByIndustry: Record<string,string[]> = {
  Technology:['Product Engineering','Platform','Applications','Operations'],
  Data:['Analytics','Insights','Data Operations','Research'],
  Medicine:['Clinical Services','Patient Care','Diagnostics','Operations'],
  Education:['Learning','Student Services','Curriculum','Administration'],
  Finance:['Advisory','Markets','Operations','Client Services'],
  Retail:['Sales Floor','Customer Experience','Operations','Merchandising'],
  'Food Service':['Kitchen','Front of House','Operations','Guest Experience'],
  Government:['Public Services','Policy','Operations','Community Programs'],
  default:['Operations','Client Services','Projects','Administration'],
};

export function departmentsForIndustry(industry:string){return departmentByIndustry[industry]??departmentByIndustry.default!;}

export function workplaceRosterSize(level:number,partTime=false){
  if(partTime)return{coworkers:3,bosses:1,teams:1};
  if(level>=5)return{coworkers:7,bosses:1,teams:3};
  if(level>=3)return{coworkers:6,bosses:1,teams:2};
  return{coworkers:5,bosses:1,teams:2};
}
