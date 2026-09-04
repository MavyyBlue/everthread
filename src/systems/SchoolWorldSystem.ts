import { getNamePool } from '../data/names';
import { groupTemplatesForAge, schoolProfileFor } from '../data/schools';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { actionAllowed, consumeAction } from '../core/actionEconomy';
import type { EducationRecord, EngineResult, GameState, Npc, Orientation, RelationshipType, SchoolGroupKind, SocialWorld, SocialWorldGroup, SocialWorldMemberRole } from '../types/game';

const SCHOOL_RELATIONSHIP_TYPES = new Set<RelationshipType>(['classmate','teacher','principal','coach']);
const NPC_TRAITS = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];

export function educationRecordKey(record: EducationRecord) {
  return `${record.stage}|${record.startAge}|${record.institution}|${record.programId ?? ''}`;
}

export function currentSchoolWorld(state: GameState): SocialWorld | undefined {
  return state.socialWorlds.find(world => world.kind === 'school' && world.active && world.school);
}

export function schoolWorldForEducationRecord(state: GameState, record: EducationRecord): SocialWorld | undefined {
  const key = educationRecordKey(record);
  return state.socialWorlds.find(world => world.kind === 'school' && world.school?.educationKey === key);
}

function activeEducationRecord(state: GameState) {
  return [...state.education].reverse().find(record => !record.graduated && !record.droppedOut && !record.endAge);
}

function schoolRosterSize(state: GameState, record: EducationRecord) {
  const stage = schoolProfileFor(state.character.countryId).stages.find(item => item.stage === record.stage);
  if (stage) return { classmates: stage.classmateCount, teachers: stage.teacherCount };
  if (['university','community_college','graduate','professional','trade'].includes(record.stage)) return { classmates: 9, teachers: 3 };
  return { classmates: 7, teachers: 2 };
}

function relationshipTypeForRole(role: SocialWorldMemberRole): RelationshipType | undefined {
  if (role === 'classmate') return 'classmate';
  if (role === 'teacher') return 'teacher';
  if (role === 'principal') return 'principal';
  if (role === 'coach') return 'coach';
  return undefined;
}

function addSchoolRelationship(state: GameState, npc: Npc, role: SocialWorldMemberRole, yearsKnown: number, rng: ReturnType<typeof createRng>) {
  const type = relationshipTypeForRole(role);
  if (!type) return;
  const existing = state.relationships.find(rel => rel.npcId === npc.id);
  if (existing) {
    if (SCHOOL_RELATIONSHIP_TYPES.has(existing.type)) existing.type = type;
    existing.yearsKnown = Math.max(existing.yearsKnown, yearsKnown);
    return;
  }
  state.relationships.push({
    id: makeStateId(state,'rel'), npcId: npc.id, type,
    score: role === 'classmate' ? rng.int(35,68) : role === 'principal' ? rng.int(28,55) : rng.int(32,62),
    attraction: role === 'classmate' ? rng.int(0,55) : 0,
    compatibility: rng.int(30,88), yearsKnown,
  });
}

function createSchoolNpc(state: GameState, role: SocialWorldMemberRole, worldKey: string, ordinal: number, yearsKnown: number, rng: ReturnType<typeof createRng>, usedNames: Set<string>): Npc {
  const pool = getNamePool(state.character.countryId);
  let firstName = rng.pick(pool.first);
  let lastName = rng.pick(pool.last);
  for (let tries = 0; tries < 12 && usedNames.has(`${firstName}|${lastName}`); tries += 1) {
    firstName = rng.pick(pool.first); lastName = rng.pick(pool.last);
  }
  usedNames.add(`${firstName}|${lastName}`);
  const age = role === 'classmate'
    ? Math.max(4, state.character.age + rng.int(-1,1))
    : role === 'principal'
      ? Math.max(32, state.character.age + rng.int(24,48))
      : Math.max(23, state.character.age + rng.int(17,39));
  const id = makeStateId(state, `school-${role}-${worldKey.replace(/[^a-z0-9]/gi,'').slice(-12)}-${ordinal}`);
  const npc: Npc = {
    id, firstName, lastName, age, alive:true, health:rng.int(60,98), happiness:rng.int(42,92),
    wealth: role === 'classmate' ? rng.int(0,2500) : rng.int(8000,110000),
    countryId:state.character.countryId, city:state.character.city,
    sexuality:rng.pick<Orientation>(['straight','straight','bisexual','pansexual','gay','lesbian','asexual']), fertility:rng.int(20,90),
    maritalStatus:'single',
    traits:rng.shuffle(NPC_TRAITS).slice(0,3), hiddenOpinion:rng.int(-8,35), memories:[], parentIds:[], childIds:[], simulationTier:'background',
  };
  state.npcs[id] = npc;
  addSchoolRelationship(state,npc,role,yearsKnown,rng);
  return npc;
}

function groupKindWeight(kind: SchoolGroupKind) {
  return kind === 'academic' ? 1.1 : kind === 'sport' ? 1 : kind === 'arts' ? .95 : kind === 'leadership' ? .75 : .85;
}

function createSchoolGroups(state: GameState, record: EducationRecord, classmates: Npc[], teachers: Npc[], worldKey: string, rng: ReturnType<typeof createRng>): SocialWorldGroup[] {
  const referenceAge = Math.max(record.startAge, Math.min(record.endAge ? record.endAge - 1 : Math.max(state.character.age, record.startAge + 2), record.startAge + 3));
  const candidates = groupTemplatesForAge(referenceAge);
  const desired = record.stage === 'primary' ? 5 : 7;
  const selected = rng.shuffle(candidates)
    .sort((a,b) => b.weight * groupKindWeight(b.kind) - a.weight * groupKindWeight(a.kind))
    .slice(0,Math.min(desired,candidates.length));
  return selected.map((template,index) => {
    const memberCount = Math.min(classmates.length, rng.int(3, Math.min(6,classmates.length)));
    const memberNpcIds = rng.shuffle(classmates).slice(0,memberCount).map(npc => npc.id);
    if (template.kind === 'sport' && teachers.length) memberNpcIds.push(teachers[index % teachers.length]!.id);
    return {
      id: makeStateId(state,`school-group-${worldKey.replace(/[^a-z0-9]/gi,'').slice(-10)}-${template.id}`),
      name:template.name, kind:template.kind, minAge:template.minAge, memberNpcIds:[...new Set(memberNpcIds)], prestige:rng.int(35,78),
    };
  });
}

function createSchoolWorld(state: GameState, record: EducationRecord, active: boolean, announce: boolean): SocialWorld {
  const key = educationRecordKey(record);
  const rng = createRng(`${state.seed}-school-world-${key}`);
  const duration = Math.max(0, (record.endAge ?? state.character.age) - record.startAge);
  const roster = schoolRosterSize(state,record);
  const usedNames = new Set<string>();
  const classmates: Npc[] = [];
  const teachers: Npc[] = [];
  for (let i=0;i<roster.classmates;i+=1) classmates.push(createSchoolNpc(state,'classmate',key,i,duration,rng,usedNames));
  for (let i=0;i<roster.teachers;i+=1) teachers.push(createSchoolNpc(state,'teacher',key,i,duration,rng,usedNames));
  const principal = createSchoolNpc(state,'principal',key,0,duration,rng,usedNames);
  const groups = createSchoolGroups(state,record,classmates,teachers,key,rng);
  const members = [
    ...classmates.map(npc => ({npcId:npc.id,role:'classmate' as const,joinedAge:record.startAge,...(record.endAge?{leftAge:record.endAge}:{}),groupIds:groups.filter(group=>group.memberNpcIds.includes(npc.id)).map(group=>group.id)})),
    ...teachers.map((npc,index) => ({npcId:npc.id,role:(groups.some(group=>group.kind==='sport'&&group.memberNpcIds.includes(npc.id))&&index===0?'coach':'teacher') as SocialWorldMemberRole,joinedAge:record.startAge,...(record.endAge?{leftAge:record.endAge}:{}),groupIds:groups.filter(group=>group.memberNpcIds.includes(npc.id)).map(group=>group.id)})),
    {npcId:principal.id,role:'principal' as const,joinedAge:record.startAge,...(record.endAge?{leftAge:record.endAge}:{}),groupIds:[] as string[]},
  ];
  const world: SocialWorld = {
    id:makeStateId(state,'social-school'), kind:'school', name:record.institution, countryId:state.character.countryId, city:state.character.city,
    startedAge:record.startAge, ...(record.endAge?{endedAge:record.endAge}:{}), active,
    members, groups,
    school:{stage:record.stage,educationKey:key,attendance:clamp(82 + state.character.secondary.discipline*.12),conduct:clamp(76 + state.character.secondary.discipline*.14),socialStanding:50,honors:0,disciplinaryActions:0,principalNpcId:principal.id},
  };
  state.socialWorlds.push(world);
  if (announce) state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`You entered a new social world at ${record.institution}: ${classmates.length} classmates, ${teachers.length} teachers, and school activities that can follow you through this stage.`,npcIds:[...classmates.slice(0,3).map(npc=>npc.id),principal.id]});
  return world;
}

function archiveWorld(world: SocialWorld, age: number) {
  world.active = false;
  world.endedAge ??= age;
  for (const member of world.members) member.leftAge ??= age;
  for (const group of world.groups) if (group.playerJoinedAge !== undefined && group.playerLeftAge === undefined) group.playerLeftAge = age;
}

export function ensureSchoolWorldForEducationRecord(state: GameState, record: EducationRecord, announce=true): SocialWorld {
  state.socialWorlds ??= [];
  const existing = schoolWorldForEducationRecord(state,record);
  if (existing) {
    existing.active = !record.graduated && !record.droppedOut && !record.endAge;
    if (!existing.active && record.endAge) archiveWorld(existing,record.endAge);
    return existing;
  }
  return createSchoolWorld(state,record,!record.graduated&&!record.droppedOut&&!record.endAge,announce);
}

export function syncSchoolWorlds(state: GameState, announce=true) {
  state.socialWorlds ??= [];
  const active = activeEducationRecord(state);
  for (const world of state.socialWorlds.filter(world=>world.kind==='school'&&world.active)) {
    if (!active || world.school?.educationKey !== educationRecordKey(active)) archiveWorld(world,state.character.age);
  }
  if (active) ensureSchoolWorldForEducationRecord(state,active,announce);
}

/** v6→v7 compatibility: reconstruct school contexts from education history without rewriting the history itself. */
export function migrateLegacySchoolWorlds(state: GameState) {
  state.socialWorlds ??= [];
  if (state.socialWorlds.length) return;
  for (const record of state.education ?? []) ensureSchoolWorldForEducationRecord(state,record,false);
  syncSchoolWorlds(state,false);
}

function addMemory(state: GameState, npcId: string, kind: string, sentiment: number, summary: string, permanent=false) {
  const npc = state.npcs[npcId]; if (!npc) return;
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent:permanent||Math.abs(sentiment)>=8});
  npc.memories = npc.memories.slice(-36);
}

function schoolRelation(state: GameState, npcId: string) { return state.relationships.find(rel=>rel.npcId===npcId); }

export function schoolAdmissionsFactors(state: GameState) {
  const worlds = state.socialWorlds.filter(world=>world.kind==='school'&&world.school);
  if (!worlds.length) return {conduct:65,involvement:0,honors:0,socialStanding:50};
  const conduct = worlds.reduce((sum,world)=>sum+(world.school?.conduct??65),0)/worlds.length;
  const socialStanding = worlds.reduce((sum,world)=>sum+(world.school?.socialStanding??50),0)/worlds.length;
  const honors = worlds.reduce((sum,world)=>sum+(world.school?.honors??0),0);
  const groups = worlds.flatMap(world=>world.groups).filter(group=>group.playerJoinedAge!==undefined);
  const leadership = groups.filter(group=>['captain','officer','leader'].includes(group.playerRole??'')).length;
  const involvement = clamp(groups.length*14 + leadership*12 + Math.min(25,honors*5));
  return {conduct:clamp(conduct),involvement,honors,socialStanding:clamp(socialStanding)};
}

export function joinSchoolGroup(state: GameState, groupId: string): EngineResult {
  const world = currentSchoolWorld(state); if (!world?.school) return {success:false,messages:[{text:'You are not currently part of an active school community.'}]};
  const group = world.groups.find(item=>item.id===groupId); if (!group) return {success:false,messages:[{text:'That school activity is not available.'}]};
  if (state.character.age < group.minAge) return {success:false,messages:[{text:`${group.name} is not available at your current age.`}]};
  if (group.playerJoinedAge !== undefined && group.playerLeftAge === undefined) return {success:false,messages:[{text:`You are already part of ${group.name}.`}]};
  const activeGroups = world.groups.filter(item=>item.playerJoinedAge!==undefined&&item.playerLeftAge===undefined);
  if (activeGroups.length >= 3) return {success:false,messages:[{text:'You are already committed to three major school activities. Leave one before joining another.'}]};
  const gate=consumeAction(state,[{policy:'school.group.join'},{policy:'school.group.join.target',target:group.id}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  group.playerJoinedAge=state.character.age;delete group.playerLeftAge;
  const leadershipBase=state.character.secondary.charisma*.35+state.character.secondary.discipline*.35+state.character.secondary.reputation*.3;
  group.playerRole=leadershipBase>82?'officer':'member';
  world.school.socialStanding=clamp(world.school.socialStanding+4);
  for(const npcId of group.memberNpcIds.filter(id=>state.npcs[id]).slice(0,5)){const rel=schoolRelation(state,npcId);if(rel)rel.score=clamp(rel.score+2);addMemory(state,npcId,'school_group',4,`${state.character.firstName} joined ${group.name}.`);}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`You joined ${group.name} at ${world.name}.`,npcIds:group.memberNpcIds.slice(0,4)});
  return {success:true,messages:[{text:`You joined ${group.name}. It will now contribute to your school involvement and admissions profile.`}]};
}

export function leaveSchoolGroup(state: GameState, groupId: string): EngineResult {
  const world=currentSchoolWorld(state);const group=world?.groups.find(item=>item.id===groupId);if(!world||!group||group.playerJoinedAge===undefined||group.playerLeftAge!==undefined)return{success:false,messages:[{text:'You are not an active member of that school activity.'}]};
  group.playerLeftAge=state.character.age;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:1,text:`You left ${group.name}.`});return{success:true,messages:[{text:`You left ${group.name}.`}]};
}

export function attendSchoolGroup(state: GameState, groupId: string): EngineResult {
  const world=currentSchoolWorld(state);if(!world?.school)return{success:false,messages:[{text:'You are not currently enrolled in a school community.'}]};const group=world.groups.find(item=>item.id===groupId);if(!group||group.playerJoinedAge===undefined||group.playerLeftAge!==undefined)return{success:false,messages:[{text:'Join that activity before spending extra time on it.'}]};
  const gate=consumeAction(state,[{policy:'school.group.activity.total'},{policy:'school.group.activity.target',target:group.id}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-school-group`,state.rngCounter);const kind=group.kind as SchoolGroupKind;
  if(kind==='academic'){state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance+rng.int(3,6));state.character.stats.intelligence=clamp(state.character.stats.intelligence+1);}
  if(kind==='sport'){state.character.secondary.athleticism=clamp(state.character.secondary.athleticism+rng.int(2,5));state.character.stats.health=clamp(state.character.stats.health+1);}
  if(kind==='arts'){state.character.secondary.creativity=clamp(state.character.secondary.creativity+rng.int(2,5));state.character.stats.happiness=clamp(state.character.stats.happiness+2);}
  if(kind==='service'){state.character.secondary.reputation=clamp(state.character.secondary.reputation+3);state.character.secondary.karma+=2;}
  if(kind==='leadership'){state.character.secondary.charisma=clamp(state.character.secondary.charisma+3);state.character.secondary.confidence=clamp(state.character.secondary.confidence+2);}
  if(kind==='social'){state.character.stats.happiness=clamp(state.character.stats.happiness+3);state.character.secondary.confidence=clamp(state.character.secondary.confidence+2);}
  group.prestige=clamp(group.prestige+rng.int(0,3));world.school.socialStanding=clamp(world.school.socialStanding+3);
  for(const npcId of rng.shuffle(group.memberNpcIds.filter(id=>Boolean(state.npcs[id]))).slice(0,3)){const rel=schoolRelation(state,npcId);if(rel)rel.score=clamp(rel.score+rng.int(1,4));addMemory(state,npcId,'school_group',3,`${state.character.firstName} spent time with ${group.name}.`);}
  const leadershipSignal=state.character.secondary.charisma*.35+state.character.secondary.discipline*.25+world.school.socialStanding*.2+group.prestige*.2;
  if(group.playerRole==='member'&&leadershipSignal>=68&&rng.chance(.32)){group.playerRole=group.kind==='sport'?'captain':'officer';state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`You took on a ${group.playerRole} role in ${group.name}.`});}
  else if(group.playerRole==='officer'&&leadershipSignal>=82&&rng.chance(.24)){group.playerRole='leader';state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`You became a student leader in ${group.name}.`});}
  state.rngCounter=rng.counter();state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:1,text:`You committed extra time to ${group.name}.`,npcIds:group.memberNpcIds.slice(0,3)});return{success:true,messages:[{text:`You put serious time into ${group.name} this year.`}]};
}

export function cheatAtSchool(state: GameState): EngineResult {
  const world=currentSchoolWorld(state);if(!world?.school)return{success:false,messages:[{text:'You are not currently enrolled.'}]};if(state.character.age<10)return{success:false,messages:[{text:'That kind of academic shortcut is not available at your age.'}]};
  const gate=consumeAction(state,{policy:'school.risk'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-school-risk`,state.rngCounter);const detection=clamp(30+(100-world.school.conduct)*.2+(100-state.character.secondary.discipline)*.12,12,68)/100;const caught=rng.chance(detection);
  if(caught){world.school.conduct=clamp(world.school.conduct-18);world.school.disciplinaryActions+=1;state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance-5);state.character.secondary.reputation=clamp(state.character.secondary.reputation-4);state.character.secondary.stress=clamp(state.character.secondary.stress+6);const authority=world.members.filter(member=>['teacher','principal'].includes(member.role)).map(member=>member.npcId);for(const npcId of authority){const rel=schoolRelation(state,npcId);if(rel)rel.score=clamp(rel.score-7);addMemory(state,npcId,'academic_misconduct',-9,`${state.character.firstName} was caught cheating.`,true);}state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:3,text:`You were caught cheating at ${world.name}. The disciplinary record now follows this school stage.`,npcIds:authority.slice(0,2)});}else{world.school.conduct=clamp(world.school.conduct-4);state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance+rng.int(5,9));state.character.secondary.stress=clamp(state.character.secondary.stress+2);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:1,text:'You used an academic shortcut and were not caught, but it still became part of your conduct trajectory.'});}
  state.rngCounter=rng.counter();return{success:!caught,messages:[{text:caught?'You were caught. Your academic performance, conduct, and reputation took a hit.':'You got away with it this time. Your grade improved, but your conduct slipped.'}]};
}

export function volunteerAtSchool(state: GameState): EngineResult {
  const world=currentSchoolWorld(state);if(!world?.school)return{success:false,messages:[{text:'You are not currently enrolled.'}]};const gate=consumeAction(state,{policy:'school.community'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  world.school.conduct=clamp(world.school.conduct+5);world.school.socialStanding=clamp(world.school.socialStanding+4);state.character.secondary.reputation=clamp(state.character.secondary.reputation+3);state.character.secondary.karma+=2;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:1,text:`You volunteered around ${world.name} and became more visible as a dependable student.`});return{success:true,messages:[{text:'You volunteered at school. Conduct, reputation, and social standing improved.'}]};
}

export function noteStudying(state: GameState) {
  const world=currentSchoolWorld(state);if(!world?.school)return;world.school.attendance=clamp(world.school.attendance+3);world.school.conduct=clamp(world.school.conduct+2);for(const member of world.members.filter(member=>member.role==='teacher')){const npc=state.npcs[member.npcId];if(npc)npc.hiddenOpinion=clamp(npc.hiddenOpinion+2,-100,100);}
}

export function noteSkippingClass(state: GameState) {
  const world=currentSchoolWorld(state);if(!world?.school)return;world.school.attendance=clamp(world.school.attendance-12);world.school.conduct=clamp(world.school.conduct-6);
  if(world.school.attendance<55||world.school.conduct<45){world.school.disciplinaryActions+=1;state.character.secondary.reputation=clamp(state.character.secondary.reputation-2);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`Your attendance or conduct at ${world.name} fell low enough to trigger a formal warning.`});}
}

export function processSchoolWorldYear(state: GameState) {
  syncSchoolWorlds(state,true);const world=currentSchoolWorld(state);if(!world?.school)return;
  const rng=createRng(`${state.seed}-school-year`,state.rngCounter);const school=world.school;
  school.attendance=clamp(school.attendance+rng.int(-3,3)+(state.character.secondary.discipline>=70?1:0));
  const conductTarget=clamp(45+state.character.secondary.discipline*.5);school.conduct=clamp(school.conduct+(conductTarget-school.conduct)*.08+rng.int(-2,2));
  const classmates=world.members.filter(member=>member.role==='classmate').map(member=>schoolRelation(state,member.npcId)).filter(Boolean);
  const averageRel=classmates.length?classmates.reduce((sum,rel)=>sum+rel!.score,0)/classmates.length:50;
  school.socialStanding=clamp(school.socialStanding*.78+averageRel*.14+state.character.secondary.reputation*.08+rng.int(-2,2));
  for(const member of world.members.filter(member=>member.role==='classmate')){
    const rel=schoolRelation(state,member.npcId);const npc=state.npcs[member.npcId];if(!rel||!npc?.alive)continue;
    if(rel.type==='classmate'&&rel.score>=84&&rng.chance(.22)){rel.type='friend';addMemory(state,npc.id,'friendship',8,`Became friends with ${state.character.firstName} after knowing each other through school.`,true);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:2,text:`${npc.firstName}, one of your schoolmates, became a real friend.`,npcIds:[npc.id]});}
    else if(rel.type==='classmate'&&rel.score<=18&&rng.chance(.20)){rel.type='enemy';addMemory(state,npc.id,'rivalry',-8,`A school rivalry with ${state.character.firstName} became openly hostile.`,true);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'relationship',importance:2,text:`Your school friction with ${npc.firstName} hardened into an enemy relationship.`,npcIds:[npc.id]});}
  }
  const activeGroups=world.groups.filter(group=>group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined);
  if(activeGroups.length){state.character.stats.happiness=clamp(state.character.stats.happiness+Math.min(2,activeGroups.length));state.character.secondary.stress=clamp(state.character.secondary.stress+Math.max(0,activeGroups.length-2));}
  if(state.character.secondary.academicPerformance>=88&&school.conduct>=65&&rng.chance(.20+Math.min(.20,activeGroups.length*.03))){school.honors+=1;state.character.secondary.reputation=clamp(state.character.secondary.reputation+2);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`You earned academic recognition at ${world.name}.`});}
  if((school.conduct<40||school.attendance<50)&&rng.chance(.30)){school.disciplinaryActions+=1;state.character.secondary.academicPerformance=clamp(state.character.secondary.academicPerformance-3);state.character.stats.happiness=clamp(state.character.stats.happiness-2);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:2,text:`Persistent attendance or conduct problems led to disciplinary action at ${world.name}.`});}
  if(classmates.length&&rng.chance(.24)){
    const rel=rng.pick(classmates)!;const npc=state.npcs[rel.npcId]!;const positive=rng.chance(clamp((rel.compatibility+school.socialStanding)/200,.25,.8));const delta=positive?rng.int(3,7):-rng.int(3,7);rel.score=clamp(rel.score+delta);npc.hiddenOpinion=clamp(npc.hiddenOpinion+delta*.35,-100,100);addMemory(state,npc.id,'school_year',delta,positive?`Shared a good school year with ${state.character.firstName}.`:`Had friction with ${state.character.firstName} at school.`);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'school',importance:1,text:positive?`You and ${npc.firstName} grew closer during the school year.`:`You and ${npc.firstName} clashed during the school year.`,npcIds:[npc.id],relationshipDelta:delta});
  }
  state.rngCounter=rng.counter();
}

export function canJoinMoreSchoolGroups(state: GameState) {
  const world=currentSchoolWorld(state);if(!world)return false;return world.groups.filter(group=>group.playerJoinedAge!==undefined&&group.playerLeftAge===undefined).length<3&&actionAllowed(state,{policy:'school.group.join'});
}
