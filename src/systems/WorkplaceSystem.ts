import { getNamePool } from '../data/names';
import { countryById } from '../data/countries';
import { jobById } from '../data/jobs';
import { departmentsForIndustry, partTimeJobById, partTimeJobs, workplaceRosterSize } from '../data/workplaces';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { actionAllowed, consumeAction } from '../core/actionEconomy';
import type { CareerRecord, EngineResult, GameState, Npc, Orientation, PartTimeCareerRecord, Relationship, RelationshipType, SocialWorld, SocialWorldMemberRole } from '../types/game';

const WORK_RELATIONSHIP_TYPES = new Set<RelationshipType>(['coworker','boss']);
const NPC_TRAITS = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];

export function employmentRecordKey(record: CareerRecord, kind: 'full_time'|'part_time'='full_time') {
  return `${kind}|${record.startAge}|${record.company}`;
}

export function workplaceForCareerRecord(state: GameState, record: CareerRecord, kind: 'full_time'|'part_time'='full_time') {
  const key=employmentRecordKey(record,kind);
  return state.socialWorlds.find(world=>world.kind==='workplace'&&world.workplace?.employmentKey===key);
}

export function currentWorkplaceWorld(state: GameState): SocialWorld | undefined {
  const current=state.employment.current;
  if(current){const exact=workplaceForCareerRecord(state,current,'full_time');if(exact?.active)return exact;}
  return state.socialWorlds.find(world=>world.kind==='workplace'&&world.active&&world.workplace?.employmentKind==='part_time');
}

export function activeWorkplaceWorlds(state: GameState) {
  return state.socialWorlds.filter(world=>world.kind==='workplace'&&world.active&&world.workplace);
}

function relationshipTypeForRole(role: SocialWorldMemberRole): RelationshipType | undefined {
  if(role==='boss')return'boss';
  if(role==='coworker'||role==='direct_report')return'coworker';
  return undefined;
}

function workRelation(state:GameState,npcId:string){return state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged);}

function addWorkRelationship(state:GameState,npc:Npc,role:SocialWorldMemberRole,yearsKnown:number,rng:ReturnType<typeof createRng>){
  const type=relationshipTypeForRole(role);if(!type)return;
  const existing=state.relationships.find(rel=>rel.npcId===npc.id);
  if(existing){
    if(WORK_RELATIONSHIP_TYPES.has(existing.type))existing.type=type;
    existing.yearsKnown=Math.max(existing.yearsKnown,yearsKnown);return;
  }
  state.relationships.push({
    id:makeStateId(state,'rel'),npcId:npc.id,type,
    score:role==='boss'?rng.int(34,62):rng.int(38,68),
    attraction:role==='boss'?rng.int(0,35):rng.int(0,58),compatibility:rng.int(32,88),yearsKnown,
  });
}

function uniqueNpcName(state:GameState,rng:ReturnType<typeof createRng>,used:Set<string>){
  const pool=getNamePool(state.character.countryId);let firstName=rng.pick(pool.first);let lastName=rng.pick(pool.last);
  for(let tries=0;tries<14&&used.has(`${firstName}|${lastName}`);tries+=1){firstName=rng.pick(pool.first);lastName=rng.pick(pool.last);}
  used.add(`${firstName}|${lastName}`);return{firstName,lastName};
}

function createWorkNpc(state:GameState,role:SocialWorldMemberRole,worldKey:string,ordinal:number,record:CareerRecord,industry:string,rng:ReturnType<typeof createRng>,used:Set<string>):Npc{
  const {firstName,lastName}=uniqueNpcName(state,rng,used);
  const elapsed=Math.max(0,state.character.age-record.startAge);
  const ageAtStart=role==='boss'?Math.max(24,record.startAge+rng.int(7,24)):Math.max(16,record.startAge+rng.int(-5,12));
  const id=makeStateId(state,`work-${role}-${worldKey.replace(/[^a-z0-9]/gi,'').slice(-12)}-${ordinal}`);
  const npc:Npc={
    id,firstName,lastName,age:Math.max(16,ageAtStart+elapsed),alive:true,health:rng.int(58,98),happiness:rng.int(40,91),wealth:rng.int(5000,180000),
    careerId:jobById[record.jobId]?.industry===industry?record.jobId:undefined,countryId:state.character.countryId,city:state.character.city,
    sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(18,88),maritalStatus:'single',
    traits:rng.shuffle(NPC_TRAITS).slice(0,3),hiddenOpinion:rng.int(-6,34),memories:[],parentIds:[],childIds:[],simulationTier:'background',
  };
  state.npcs[id]=npc;addWorkRelationship(state,npc,role,Math.max(0,elapsed),rng);return npc;
}

function createTeamGroups(state:GameState,department:string,peers:Npc[],boss:Npc,worldKey:string,teamCount:number,rng:ReturnType<typeof createRng>){
  const suffix=['Core Team','Projects','Operations','Client Team'];
  return Array.from({length:teamCount},(_,index)=>{
    const count=Math.min(peers.length,Math.max(2,rng.int(2,Math.min(5,peers.length))));
    const ids=rng.shuffle(peers).slice(0,count).map(npc=>npc.id);if(index===0)ids.push(boss.id);
    return{id:makeStateId(state,`work-team-${worldKey.replace(/[^a-z0-9]/gi,'').slice(-10)}-${index}`),name:`${department} ${suffix[index%suffix.length]}`,kind:'team',minAge:16,memberNpcIds:[...new Set(ids)],prestige:rng.int(38,78)};
  });
}

function createWorkplaceWorld(state:GameState,record:CareerRecord,kind:'full_time'|'part_time',active:boolean,announce:boolean):SocialWorld{
  const key=employmentRecordKey(record,kind);const job=jobById[record.jobId];const part=partTimeJobById[record.jobId];const industry=job?.industry??part?.industry??'General';
  const rng=createRng(`${state.seed}-workplace-${key}`);const level=Math.max(1,record.level??1);const roster=workplaceRosterSize(level,kind==='part_time');const used=new Set<string>();
  const department=rng.pick(departmentsForIndustry(industry));const peers:Npc[]=[];
  for(let i=0;i<roster.coworkers;i+=1)peers.push(createWorkNpc(state,'coworker',key,i,record,industry,rng,used));
  const boss=createWorkNpc(state,'boss',key,0,record,industry,rng,used);const groups=createTeamGroups(state,department,peers,boss,key,roster.teams,rng);
  const members=[
    ...peers.map(npc=>({npcId:npc.id,role:'coworker' as const,joinedAge:record.startAge,...(record.endAge?{leftAge:record.endAge}:{}),groupIds:groups.filter(group=>group.memberNpcIds.includes(npc.id)).map(group=>group.id)})),
    {npcId:boss.id,role:'boss' as const,joinedAge:record.startAge,...(record.endAge?{leftAge:record.endAge}:{}),groupIds:groups.filter(group=>group.memberNpcIds.includes(boss.id)).map(group=>group.id)},
  ];
  const world:SocialWorld={
    id:makeStateId(state,'social-workplace'),kind:'workplace',name:record.company,countryId:state.character.countryId,city:state.character.city,startedAge:record.startAge,
    ...(record.endAge?{endedAge:record.endAge}:{}),active,members,groups,
    workplace:{employmentKey:key,employmentKind:kind,industry,department,morale:rng.int(45,72),culture:rng.int(42,76),tension:rng.int(18,45),reputation:50,managerNpcId:boss.id,layoffs:0,disputes:0},
  };
  state.socialWorlds.push(world);
  if(announce)state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You joined the ${department} workplace at ${record.company}, meeting ${peers.length} recurring coworkers and your manager, ${boss.firstName} ${boss.lastName}.`,npcIds:[boss.id,...peers.slice(0,3).map(npc=>npc.id)]});
  return world;
}

function archiveWorld(world:SocialWorld,age:number){
  world.active=false;world.endedAge??=age;for(const member of world.members)member.leftAge??=age;
}

export function ensureWorkplaceForCareerRecord(state:GameState,record:CareerRecord,kind:'full_time'|'part_time'='full_time',announce=true){
  state.socialWorlds??=[];const existing=workplaceForCareerRecord(state,record,kind);const active=!record.endAge;
  if(existing){existing.active=active;if(!active&&record.endAge)archiveWorld(existing,record.endAge);return existing;}
  return createWorkplaceWorld(state,record,kind,active,announce);
}

export function syncWorkplaceWorlds(state:GameState,announce=true){
  state.socialWorlds??=[];
  const activeKeys=new Set<string>();
  if(state.employment.current){activeKeys.add(employmentRecordKey(state.employment.current,'full_time'));ensureWorkplaceForCareerRecord(state,state.employment.current,'full_time',announce);}
  for(const record of state.employment.partTimeJobs??[]){activeKeys.add(employmentRecordKey(record,'part_time'));ensureWorkplaceForCareerRecord(state,record,'part_time',announce);}
  for(const world of state.socialWorlds.filter(world=>world.kind==='workplace'&&world.active&&world.workplace))if(!activeKeys.has(world.workplace!.employmentKey))archiveWorld(world,state.character.age);
}

/** v7→v8 compatibility: create deterministic workplace history for employment that predates persistent work worlds. */
export function migrateLegacyWorkplaceWorlds(state:GameState){
  state.socialWorlds??=[];state.employment.partTimeJobs??=[];state.employment.partTimeHistory??=[];
  for(const record of state.employment.history??[])ensureWorkplaceForCareerRecord(state,record,'full_time',false);
  if(state.employment.current)ensureWorkplaceForCareerRecord(state,state.employment.current,'full_time',false);
  for(const record of state.employment.partTimeHistory??[])ensureWorkplaceForCareerRecord(state,record,'part_time',false);
  for(const record of state.employment.partTimeJobs??[])ensureWorkplaceForCareerRecord(state,record,'part_time',false);
  syncWorkplaceWorlds(state,false);
}

function memberRole(world:SocialWorld,npcId:string){return world.members.find(member=>member.npcId===npcId&&member.leftAge===undefined)?.role;}
export function workplaceRoleForNpc(state:GameState,npcId:string){for(const world of state.socialWorlds.filter(w=>w.kind==='workplace')){const member=world.members.find(item=>item.npcId===npcId);if(member)return{world,role:member.role};}return undefined;}

function workplaceRecord(state:GameState,world:SocialWorld):CareerRecord|PartTimeCareerRecord|undefined{
  const key=world.workplace?.employmentKey;if(!key)return undefined;
  if(world.workplace?.employmentKind==='full_time'){const all=[...(state.employment.history??[]),...(state.employment.current?[state.employment.current]:[])];return all.find(record=>employmentRecordKey(record,'full_time')===key);}
  return [...(state.employment.partTimeHistory??[]),...(state.employment.partTimeJobs??[])].find(record=>employmentRecordKey(record,'part_time')===key);
}

function addMemory(state:GameState,npcId:string,kind:string,sentiment:number,summary:string,permanent=false){const npc=state.npcs[npcId];if(!npc)return;npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent:permanent||Math.abs(sentiment)>=9});npc.memories=npc.memories.slice(-36);}

function replaceDepartedMember(state:GameState,world:SocialWorld,role:'coworker'|'boss',record:CareerRecord,rng:ReturnType<typeof createRng>){
  const cap=world.workplace?.employmentKind==='part_time'?9:18;if(world.members.length>=cap)return;
  const used=new Set(world.members.map(member=>state.npcs[member.npcId]).filter(Boolean).map(npc=>`${npc!.firstName}|${npc!.lastName}`));
  const npc=createWorkNpc(state,role,world.workplace!.employmentKey,world.members.length,record,world.workplace!.industry,rng,used);
  world.members.push({npcId:npc.id,role,joinedAge:state.character.age,groupIds:[]});
  if(role==='boss')world.workplace!.managerNpcId=npc.id;
  else{const group=world.groups.length?rng.pick(world.groups):undefined;if(group){group.memberNpcIds.push(npc.id);world.members.at(-1)!.groupIds=[group.id];}}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`${npc.firstName} ${npc.lastName} joined ${world.name} as your ${role==='boss'?'new manager':'coworker'}.`,npcIds:[npc.id]});
}

export function processWorkplaceYear(state:GameState){
  syncWorkplaceWorlds(state,false);const rng=createRng(`${state.seed}-workplace-year`,state.rngCounter);
  for(const world of activeWorkplaceWorlds(state)){
    const workplace=world.workplace!;const record=workplaceRecord(state,world);if(!record)continue;
    const activeMembers=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);
    if(workplace.employmentKind==='full_time'){
      const peerMembers=activeMembers.filter(member=>['coworker','direct_report'].includes(member.role));
      const desiredReports=record.level>=5?2:record.level>=4?1:0;
      const ranked=peerMembers.slice().sort((a,b)=>(workRelation(state,b.npcId)?.compatibility??0)-(workRelation(state,a.npcId)?.compatibility??0));
      for(const [index,member] of ranked.entries())member.role=index<desiredReports?'direct_report':'coworker';
    }
    const relations=activeMembers.map(member=>workRelation(state,member.npcId)).filter((rel):rel is Relationship=>Boolean(rel));
    const avg=relations.length?relations.reduce((sum,rel)=>sum+rel.score,0)/relations.length:50;
    const bossId=workplace.managerNpcId;const bossRel=bossId?workRelation(state,bossId):undefined;
    workplace.morale=clamp(workplace.morale+rng.int(-2,2)+(avg>=62?1:avg<35?-2:0));
    workplace.culture=clamp(workplace.culture+rng.int(-1,1)+(state.character.secondary.reputation>=70?1:0));
    workplace.tension=clamp(workplace.tension+rng.int(-2,2)+(avg<38?3:0)+(state.character.secondary.stress>75?2:-1));
    workplace.reputation=clamp(workplace.reputation+(record.performance>=70?2:record.performance<35?-2:0));
    if(bossRel){if(bossRel.score<24)record.performance=clamp(record.performance-2);else if(bossRel.score>=78)record.performance=clamp(record.performance+1);}
    if(workplace.tension>=75)state.character.secondary.stress=clamp(state.character.secondary.stress+2);

    for(const member of activeMembers){
      const rel=workRelation(state,member.npcId);if(!rel)continue;
      if(rel.type==='coworker'&&rel.score>=80&&rng.chance(.14)){rel.type='friend';addMemory(state,member.npcId,'work_friendship',7,`Working together at ${world.name} turned into a real friendship.`,true);}
      else if(rel.type==='coworker'&&rel.score<=18&&rng.chance(.18)){rel.type='enemy';workplace.tension=clamp(workplace.tension+6);addMemory(state,member.npcId,'work_rivalry',-8,`Workplace tension at ${world.name} hardened into a rivalry.`,true);}
    }

    const peers=activeMembers.filter(member=>['coworker','direct_report'].includes(member.role));
    if(peers.length&&rng.chance(workplace.employmentKind==='part_time'?.025:.04)){
      const leaving=rng.pick(peers);leaving.leftAge=state.character.age;const npc=state.npcs[leaving.npcId];if(npc)addMemory(state,npc.id,'work_departure',1,`Left the team at ${world.name}.`,true);replaceDepartedMember(state,world,'coworker',record,rng);
    }
    const bossMember=bossId?world.members.find(member=>member.npcId===bossId&&member.leftAge===undefined):undefined;
    if(bossMember&&rng.chance(.025)){bossMember.leftAge=state.character.age;const oldBoss=state.npcs[bossMember.npcId];if(oldBoss)addMemory(state,oldBoss.id,'work_departure',1,`Stopped managing the team at ${world.name}.`,true);replaceDepartedMember(state,world,'boss',record,rng);}
  }
  state.rngCounter=rng.counter();
}

function primaryWorkplace(state:GameState){return currentWorkplaceWorld(state);}

export function collaborateAtWork(state:GameState):EngineResult{
  const world=primaryWorkplace(state);if(!world?.workplace)return{success:false,messages:[{text:'You do not currently have a workplace to collaborate in.'}]};
  const gate=consumeAction(state,[{policy:'workplace.activity.total'},{policy:'workplace.activity.kind',target:'collaborate'}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-work-collaborate`,state.rngCounter);const peers=world.members.filter(member=>member.leftAge===undefined&&['coworker','direct_report'].includes(member.role)&&state.npcs[member.npcId]?.alive);const target=peers.length?rng.pick(peers):undefined;
  const record=workplaceRecord(state,world);if(record)record.performance=clamp(record.performance+rng.int(3,5));state.character.secondary.workPerformance=state.employment.current?.performance??state.character.secondary.workPerformance;state.character.secondary.stress=clamp(state.character.secondary.stress+2);world.workplace.morale=clamp(world.workplace.morale+3);world.workplace.tension=clamp(world.workplace.tension-2);
  if(target){const rel=workRelation(state,target.npcId);if(rel)rel.score=clamp(rel.score+rng.int(3,6));addMemory(state,target.npcId,'work_collaboration',5,`${state.character.firstName} worked closely with you on an important project.`);}
  state.rngCounter=rng.counter();return{success:true,messages:[{text:target?`You collaborated closely with ${state.npcs[target.npcId]!.firstName}. Your work and team relationships improved.`:'You put focused effort into helping your team.'}]};
}

export function networkAtWork(state:GameState):EngineResult{
  const world=primaryWorkplace(state);if(!world?.workplace)return{success:false,messages:[{text:'You do not currently have a workplace network.'}]};
  const gate=consumeAction(state,[{policy:'workplace.activity.total'},{policy:'workplace.activity.kind',target:'network'}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-work-network`,state.rngCounter);const members=rng.shuffle(world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive)).slice(0,3);
  for(const member of members){const rel=workRelation(state,member.npcId);if(rel)rel.score=clamp(rel.score+rng.int(1,4));addMemory(state,member.npcId,'work_network',3,`${state.character.firstName} made an effort to build a stronger professional connection.`);}
  state.character.secondary.charisma=clamp(state.character.secondary.charisma+2);state.character.secondary.reputation=clamp(state.character.secondary.reputation+2);world.workplace.reputation=clamp(world.workplace.reputation+4);state.rngCounter=rng.counter();return{success:true,messages:[{text:'You invested time in your workplace network and professional reputation.'}]};
}

export function askBossForFeedback(state:GameState):EngineResult{
  const world=primaryWorkplace(state);const bossId=world?.workplace?.managerNpcId;const boss=bossId?state.npcs[bossId]:undefined;if(!world?.workplace||!boss?.alive)return{success:false,messages:[{text:'You do not currently have an available manager to ask.'}]};
  const gate=consumeAction(state,{policy:'workplace.feedback',target:world.id});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rel=workRelation(state,boss.id);const record=workplaceRecord(state,world);const rng=createRng(`${state.seed}-boss-feedback`,state.rngCounter);const reception=(rel?.score??45)+boss.hiddenOpinion+state.character.secondary.reputation*.25+rng.int(-12,12);
  const gain=reception>=80?rng.int(5,8):reception>=45?rng.int(2,5):0;if(record)record.performance=clamp(record.performance+gain);if(reception<35){state.character.secondary.stress=clamp(state.character.secondary.stress+4);if(rel)rel.score=clamp(rel.score-2);}else{state.character.secondary.confidence=clamp(state.character.secondary.confidence+2);if(rel)rel.score=clamp(rel.score+2);}world.workplace.reputation=clamp(world.workplace.reputation+(reception>=45?2:-2));addMemory(state,boss.id,'work_feedback',reception>=45?4:-3,`${state.character.firstName} asked for direct feedback about their work.`);state.rngCounter=rng.counter();return{success:true,messages:[{text:reception>=80?`${boss.firstName} gives you unusually useful feedback. Your performance improves noticeably.`:reception>=45?`${boss.firstName} gives you constructive feedback.`:`${boss.firstName} is not especially receptive, and the conversation is uncomfortable.`}]};
}

export function reportCoworkerIssue(state:GameState,npcId:string):EngineResult{
  const info=workplaceRoleForNpc(state,npcId);if(!info?.world.active||!info.world.workplace||!['coworker','direct_report'].includes(info.role))return{success:false,messages:[{text:'That person is not a current coworker you can raise a workplace concern about.'}]};
  const bossId=info.world.workplace.managerNpcId;const boss=bossId?state.npcs[bossId]:undefined;const target=state.npcs[npcId];if(!boss?.alive||!target?.alive)return{success:false,messages:[{text:'The workplace reporting path is not available right now.'}]};
  const gate=consumeAction(state,[{policy:'workplace.report'},{policy:'workplace.report.target',target:npcId}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-work-report`,state.rngCounter);const bossRel=workRelation(state,boss.id);const targetRel=workRelation(state,target.id);const credible=state.character.secondary.reputation*.35+(bossRel?.score??45)*.3+state.character.secondary.discipline*.2+info.world.workplace.reputation*.15+rng.int(-22,22);const accepted=credible>=48;
  info.world.workplace.disputes+=1;
  if(accepted){info.world.workplace.tension=clamp(info.world.workplace.tension-4);info.world.workplace.reputation=clamp(info.world.workplace.reputation+2);if(targetRel)targetRel.score=clamp(targetRel.score-10);if(bossRel)bossRel.score=clamp(bossRel.score+3);addMemory(state,target.id,'work_report',-10,`${state.character.firstName} raised a formal workplace concern involving you.`,true);addMemory(state,boss.id,'work_report',4,`${state.character.firstName} raised a workplace concern through the formal channel.`);}
  else{info.world.workplace.tension=clamp(info.world.workplace.tension+7);state.character.secondary.stress=clamp(state.character.secondary.stress+5);if(targetRel)targetRel.score=clamp(targetRel.score-14);if(bossRel)bossRel.score=clamp(bossRel.score-2);addMemory(state,target.id,'work_report',-12,`${state.character.firstName} raised a workplace concern that did not resolve cleanly.`,true);}
  state.rngCounter=rng.counter();return{success:true,messages:[{text:accepted?'Your concern is taken seriously and handled through the workplace process.':'The concern does not resolve cleanly, and workplace tension rises.'}]};
}

export function partTimeHourLimit(state:GameState){const inSchool=state.education.some(record=>!record.graduated&&!record.droppedOut&&!record.endAge);if(state.employment.current&&inSchool)return 10;if(state.employment.current)return 15;if(inSchool)return 20;return 30;}
export function totalPartTimeHours(state:GameState){return (state.employment.partTimeJobs??[]).reduce((sum,record)=>sum+record.hoursPerWeek,0);}
export function availablePartTimeJobs(state:GameState){return partTimeJobs.filter(job=>state.character.age>=job.minAge&&!state.employment.partTimeJobs?.some(record=>record.jobId===job.id));}

export function startPartTimeJob(state:GameState,jobId:string,hoursPerWeek=10):EngineResult{
  const def=partTimeJobById[jobId];if(!def)return{success:false,messages:[{text:'That part-time role is no longer available.'}]};if(state.character.age<def.minAge)return{success:false,messages:[{text:`${def.title} is not available at your age.`}]};
  state.employment.partTimeJobs??=[];state.employment.partTimeHistory??=[];if(state.employment.partTimeJobs.some(record=>record.jobId===jobId))return{success:false,messages:[{text:'You already hold that part-time role.'}]};if(state.employment.partTimeJobs.length>=3)return{success:false,messages:[{text:'You cannot hold more than three part-time jobs at once.'}]};
  const hours=Math.max(5,Math.min(15,Math.round(hoursPerWeek/5)*5));if(totalPartTimeHours(state)+hours>partTimeHourLimit(state))return{success:false,messages:[{text:`Your current school/work commitments leave room for only ${partTimeHourLimit(state)} part-time hours per week.`}]};
  const gate=consumeAction(state,[{policy:'career.part_time.start'},{policy:'career.part_time.job',target:jobId}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-part-time-application`,state.rngCounter);const preferred=def.preferredStat?Number((state.character.secondary as unknown as Record<string,number>)[def.preferredStat]??(state.character.stats as unknown as Record<string,number>)[def.preferredStat]??50):50;const score=preferred*.35+state.character.secondary.discipline*.25+state.character.secondary.charisma*.2+state.character.secondary.reputation*.2+rng.int(-18,18);const success=score>=40;state.rngCounter=rng.counter();
  if(!success)return{success:false,messages:[{text:`You applied for the ${def.title} shift, but the employer chose someone else.`}]};
  const country=countryById[state.character.countryId];const annual=Math.round(def.hourlyRate*hours*52*(country?.salaryMultiplier??1)*state.economy.salaryIndex);const company=`${def.industry} ${rng.pick(['Co-op','Services','Center','Group','Works','Collective'])}`;state.rngCounter=rng.counter();const record:PartTimeCareerRecord={jobId:def.id,title:def.title,company,startAge:state.character.age,salary:annual,performance:52,level:1,hoursPerWeek:hours};state.employment.partTimeJobs.push(record);state.employment.retired=false;state.employment.partTimeJobIds=[...new Set([...(state.employment.partTimeJobIds??[]),jobId])];ensureWorkplaceForCareerRecord(state,record,'part_time',true);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You started part-time work as ${def.title} for about ${hours} hours per week.`});return{success:true,messages:[{text:`You started as a part-time ${def.title} (${hours} hours/week, about ${annual.toLocaleString()} per year).`}]};
}

export function quitPartTimeJob(state:GameState,jobId:string):EngineResult{
  const record=state.employment.partTimeJobs?.find(item=>item.jobId===jobId);if(!record)return{success:false,messages:[{text:'You do not currently hold that part-time job.'}]};record.endAge=state.character.age;state.employment.partTimeHistory??=[];state.employment.partTimeHistory.push({...record});state.employment.partTimeJobs=state.employment.partTimeJobs.filter(item=>item!==record);state.employment.partTimeJobIds=(state.employment.partTimeJobIds??[]).filter(id=>id!==jobId);syncWorkplaceWorlds(state,false);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You left your part-time role as ${record.title}.`});return{success:true,messages:[{text:`You left the ${record.title} job.`}]};
}

export function processPartTimeWorkYear(state:GameState){
  state.employment.partTimeJobs??=[];state.employment.partTimeHistory??=[];const rng=createRng(`${state.seed}-part-time-year`,state.rngCounter);const ended:PartTimeCareerRecord[]=[];
  for(const record of state.employment.partTimeJobs){const def=partTimeJobById[record.jobId];if(!def)continue;const wage=state.economy.lastSalaryGrowthRate??0;if(wage)record.salary=Math.max(1,Math.round(record.salary*(1+wage)));record.performance=clamp(record.performance+rng.int(-5,5)+(state.character.secondary.discipline>65?2:0)-Math.round(state.character.secondary.stress/55));state.character.secondary.stress=clamp(state.character.secondary.stress+Math.max(0,Math.round(def.stress*record.hoursPerWeek/320)));if(record.performance<18&&rng.chance(.28)){record.endAge=state.character.age;ended.push(record);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You lost your part-time job as ${record.title} after a poor run of performance.`});}}
  if(ended.length){for(const record of ended)state.employment.partTimeHistory.push({...record});state.employment.partTimeJobs=state.employment.partTimeJobs.filter(record=>!ended.includes(record));state.employment.partTimeJobIds=state.employment.partTimeJobs.map(record=>record.jobId);syncWorkplaceWorlds(state,false);}state.rngCounter=rng.counter();
}

export function canReportCoworker(state:GameState,npcId:string){const info=workplaceRoleForNpc(state,npcId);return Boolean(info?.world.active&&['coworker','direct_report'].includes(info.role)&&actionAllowed(state,[{policy:'workplace.report'},{policy:'workplace.report.target',target:npcId}]));}
