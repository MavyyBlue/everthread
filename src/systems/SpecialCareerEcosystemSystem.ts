import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, RelationshipType, SocialWorld } from '../types/game';
import { archiveSpecialCareerWorld, specialCareerWorlds, type SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;

const AWARD_LABELS: Record<SpecialCareerWorldKind,string> = {
  acting:'Threadlight Performance Prize',
  music:'Resonance Honor',
  sports:'League Excellence Honor',
  modeling:'Atelier Distinction',
  racing:'Circuit Laureate',
  directing:'Meridian Director Prize',
};

function track(state:GameState,kind:SpecialCareerWorldKind):Track {
  return (state.specialCareers[kind] ??= {}) as Track;
}

function numberValue(record:Track,key:string,def=0){
  return typeof record[key]==='number' ? record[key] as number : def;
}

function setNumber(record:Track,key:string,value:number){
  record[key]=Math.round(value*100)/100;
}

function careerSkill(kind:SpecialCareerWorldKind,career:Track){
  if(kind==='modeling')return numberValue(career,'technique',25);
  return numberValue(career,'skill',kind==='sports'||kind==='racing'?45:30);
}

export function specialCareerWorldKind(world:SocialWorld):SpecialCareerWorldKind|undefined {
  return (['acting','music','sports','modeling','racing','directing'] as const).find(kind=>world.id.startsWith(`special-${kind}-`));
}

function memberGroupKind(world:SocialWorld,npcId:string){
  const member=world.members.find(item=>item.npcId===npcId);
  const group=member?.groupIds.map(id=>world.groups.find(candidate=>candidate.id===id)).find(Boolean);
  return group?.kind??'';
}

function relationshipTypeForCareerMember(world:SocialWorld,npcId:string):RelationshipType {
  const member=world.members.find(item=>item.npcId===npcId);
  const groupKind=memberGroupKind(world,npcId);
  if(groupKind.includes(':rivals'))return'enemy';
  if(member?.role==='leader')return'boss';
  return'coworker';
}

export function ensureSpecialCareerRelationships(state:GameState,world:SocialWorld){
  const kind=specialCareerWorldKind(world);if(!kind)return;
  const rng=createRng(`${state.seed}-special-rel-${world.id}`);
  for(const member of world.members){
    const npc=state.npcs[member.npcId];if(!npc)continue;
    const existing=state.relationships.find(rel=>rel.npcId===npc.id);
    if(existing)continue;
    const type=relationshipTypeForCareerMember(world,npc.id);
    const hostile=type==='enemy';
    state.relationships.push({
      id:makeStateId(state,'rel'),npcId:npc.id,type,
      score:hostile?rng.int(12,32):type==='boss'?rng.int(38,62):rng.int(42,70),
      attraction:hostile?rng.int(0,28):rng.int(0,52),compatibility:rng.int(28,88),yearsKnown:Math.max(0,state.character.age-world.startedAge),
    });
    npc.memories.push({
      id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind:`special_${kind}`,
      sentiment:hostile?-5:3,
      summary:hostile?`You became a professional rival of ${state.character.firstName} through ${world.name}.`:`You met ${state.character.firstName} through ${world.name}.`,
    });
  }
}

function careerRival(state:GameState,world:SocialWorld){
  const group=world.groups.find(item=>item.kind.includes(':rivals'));
  const id=group?.memberNpcIds.find(npcId=>state.npcs[npcId]?.alive);
  return id?state.npcs[id]:undefined;
}

export interface SpecialCareerWorldView {
  kind: SpecialCareerWorldKind;
  prestige: number;
  chemistry: number;
  rivalry: number;
  memberCount: number;
  leaderNpcId?: string;
  rivalNpcId?: string;
  peerNpcId?: string;
}

function average(values:number[],fallback=50){
  return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:fallback;
}

/** Read-only projection shared by annual simulation and mobile career UI. */
export function specialCareerWorldView(state:GameState,world:SocialWorld):SpecialCareerWorldView|undefined {
  const kind=specialCareerWorldKind(world);if(!kind)return;
  const liveMembers=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);
  const relevantMembers=world.active?liveMembers:world.members.filter(member=>Boolean(state.npcs[member.npcId]));
  const rival=careerRival(state,world);
  const leader=relevantMembers.find(member=>member.role==='leader'&&state.npcs[member.npcId]?.alive);
  const supportRelations=relevantMembers
    .filter(member=>member.npcId!==rival?.id)
    .map(member=>state.relationships.find(rel=>rel.npcId===member.npcId))
    .filter((rel):rel is GameState['relationships'][number]=>Boolean(rel));
  const chemistry=clamp(average(supportRelations.map(rel=>rel.score),50));
  const rivalRel=rival?state.relationships.find(rel=>rel.npcId===rival.id):undefined;
  const rivalry=rivalRel?clamp(100-rivalRel.score):0;
  const prestigeGroups=world.groups.filter(group=>!group.kind.endsWith(':resolved'));
  const prestige=clamp(average(prestigeGroups.map(group=>group.prestige),50));
  const peer=relevantMembers
    .filter(member=>member.role!=='leader'&&member.npcId!==rival?.id&&state.npcs[member.npcId]?.alive)
    .map(member=>({member,rel:state.relationships.find(rel=>rel.npcId===member.npcId)}))
    .filter((entry):entry is {member:SocialWorld['members'][number];rel:GameState['relationships'][number]}=>Boolean(entry.rel))
    .sort((a,b)=>a.rel.score-b.rel.score)[0]?.member;
  return {kind,prestige,chemistry,rivalry,memberCount:relevantMembers.length,leaderNpcId:leader?.npcId,rivalNpcId:rival?.id,peerNpcId:peer?.npcId};
}

function addCareerMemory(state:GameState,npcId:string|undefined,kind:string,sentiment:number,summary:string,permanent=false){
  if(!npcId)return;const npc=state.npcs[npcId];if(!npc)return;
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent});
  npc.memories=npc.memories.slice(-36);
}

function awardCareer(state:GameState,kind:SpecialCareerWorldKind,career:Track,world:SocialWorld,rivalId:string|undefined){
  setNumber(career,'awards',numberValue(career,'awards')+1);
  state.fame.fame=clamp(state.fame.fame+4);
  state.fame.publicReputation=clamp(state.fame.publicReputation+3);
  const award=AWARD_LABELS[kind];
  state.timeline.push({
    id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'fame',importance:3,
    text:`You received the ${award} for your work in ${world.name}.`,npcIds:rivalId?[rivalId]:undefined,
  });
  addCareerMemory(state,rivalId,'career_award_rivalry',-4,`${state.character.firstName}'s ${award} intensified your professional rivalry.`,true);
}

function careerScandal(state:GameState,kind:SpecialCareerWorldKind,career:Track,world:SocialWorld,rivalId:string|undefined,rng:ReturnType<typeof createRng>){
  const rival=rivalId?state.npcs[rivalId]:undefined;
  const text=rng.pick([
    rival?`A tense exchange with ${rival.firstName} ${rival.lastName} from ${world.name} became public.`:`A tense exchange connected to ${world.name} became public.`,
    `A behind-the-scenes disagreement from ${world.name} spilled into public view.`,
    `A poorly handled interview about ${world.name} triggered a brief backlash.`,
  ]);
  setNumber(career,'scandals',numberValue(career,'scandals')+1);
  state.fame.scandals.push(`${state.currentYear}:${kind}:${world.id}`);
  state.fame.publicReputation=clamp(state.fame.publicReputation-7);
  setNumber(career,'reputation',clamp(numberValue(career,'reputation',45)-5));
  state.character.secondary.stress=clamp(state.character.secondary.stress+5);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'fame',importance:2,text,npcIds:rivalId?[rivalId]:undefined});
  addCareerMemory(state,rivalId,'career_scandal',-6,text,true);
}

function processSportsContract(state:GameState,career:Track,world:SocialWorld,momentum:number,rng:ReturnType<typeof createRng>){
  if(career.pro!==true)return;
  let remaining=numberValue(career,'contractRemaining',Math.max(1,numberValue(career,'contractYears',1)));
  remaining=Math.max(0,remaining-1);setNumber(career,'contractRemaining',remaining);
  if(remaining>0)return;
  const renewalChance=clamp(22+momentum*.62+numberValue(career,'reputation',45)*.16,18,88)/100;
  if(rng.chance(renewalChance)){
    const years=rng.int(1,4);const current=Math.max(50000,numberValue(career,'salary',80000));
    const salary=Math.round(clamp(current*rng.int(92,132)/100,60000,6500000));
    setNumber(career,'contractYears',years);setNumber(career,'contractRemaining',years);setNumber(career,'salary',salary);
    setNumber(career,'contractRenewals',numberValue(career,'contractRenewals')+1);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`${world.name} renewed your contract for ${years} year${years===1?'':'s'} at ${salary.toLocaleString()} per year.`});
  }else{
    career.pro=false;career.releasedAge=state.character.age;setNumber(career,'contractRemaining',0);archiveSpecialCareerWorld(world,state.character.age);
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text:`${world.name} did not renew your professional contract. You became a free agent.`});
  }
}

function processPersistentCareerYear(state:GameState,kind:SpecialCareerWorldKind,world:SocialWorld){
  const career=track(state,kind);
  if(numberValue(career,'lastEcosystemAge',-1)===state.character.age)return;
  setNumber(career,'lastEcosystemAge',state.character.age);
  const rng=createRng(`${state.seed}-special-ecosystem-${world.id}-${state.currentYear}`);
  ensureSpecialCareerRelationships(state,world);
  const view=specialCareerWorldView(state,world)!;
  const prestige=view.prestige;const chemistry=view.chemistry;
  const skill=careerSkill(kind,career);const reputation=numberValue(career,'reputation',45);
  // Career relationships are simulation inputs, not cosmetic labels: supportive casts/teams/staff raise momentum,
  // while toxic worlds increase scandal pressure below. The weights stay bounded and preserve skill as the largest factor.
  const momentum=clamp(skill*.40+prestige*.25+reputation*.17+state.fame.fame*.10+chemistry*.08+rng.int(-10,10));
  setNumber(career,'worldPrestige',prestige);setNumber(career,'careerChemistry',chemistry);setNumber(career,'rivalryTemperature',view.rivalry);setNumber(career,'careerMomentum',momentum);setNumber(career,'ecosystemYears',numberValue(career,'ecosystemYears')+1);

  const rival=view.rivalNpcId?state.npcs[view.rivalNpcId]:undefined;if(rival)career.rivalNpcId=rival.id;
  for(const member of world.members){
    const rel=state.relationships.find(item=>item.npcId===member.npcId);if(!rel)continue;
    rel.yearsKnown=Math.max(rel.yearsKnown,state.character.age-world.startedAge+1);
    if(rel.type==='coworker'||rel.type==='boss')rel.score=clamp(rel.score+rng.int(-2,3)+(momentum>=78?1:0));
    else if(rel.type==='enemy')rel.score=clamp(rel.score+rng.int(-2,1));
  }

  if(kind==='sports')processSportsContract(state,career,world,momentum,rng);
  if(!world.active)return;

  const awardChance=momentum>=68?clamp((momentum-58)/130,.04,.27):0;
  if(awardChance&&rng.chance(awardChance))awardCareer(state,kind,career,world,rival?.id);
  const chemistryRisk=Math.max(0,55-chemistry)/1900;
  const rivalryRisk=view.rivalry/6000;
  const scandalChance=clamp(.012+(100-state.fame.publicReputation)/1800+state.character.secondary.stress/3200+chemistryRisk+rivalryRisk,.01,.13);
  if(rng.chance(scandalChance))careerScandal(state,kind,career,world,rival?.id,rng);

  if(rival&&rng.chance(.14)){
    const rel=state.relationships.find(item=>item.npcId===rival.id);if(rel)rel.score=clamp(rel.score-rng.int(1,4));
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`Your rivalry with ${rival.firstName} ${rival.lastName} sharpened during your time with ${world.name}.`,npcIds:[rival.id]});
  }
}

function finalizeTemporaryProject(state:GameState,kind:'acting'|'directing',world:SocialWorld){
  const career=track(state,kind);const rng=createRng(`${state.seed}-special-project-${world.id}-${state.currentYear}`);
  ensureSpecialCareerRelationships(state,world);
  const view=specialCareerWorldView(state,world)!;
  const prestige=view.prestige;const chemistry=view.chemistry;
  const score=clamp(careerSkill(kind,career)*.44+prestige*.27+numberValue(career,'reputation',40)*.12+state.fame.fame*.07+chemistry*.10+rng.int(-12,14));
  setNumber(career,'projectsCompleted',numberValue(career,'projectsCompleted')+1);setNumber(career,'projectChemistry',chemistry);setNumber(career,'rivalryTemperature',view.rivalry);setNumber(career,'lastProjectScore',score);setNumber(career,'bestProjectScore',Math.max(numberValue(career,'bestProjectScore'),score));
  const rival=view.rivalNpcId?state.npcs[view.rivalNpcId]:undefined;if(rival)career.rivalNpcId=rival.id;
  if(score>=78&&rng.chance(clamp((score-64)/70,.12,.42)))awardCareer(state,kind,career,world,rival?.id);
  const scandalChance=clamp(.01+(100-state.fame.publicReputation)/2000+state.character.secondary.stress/3600+Math.max(0,55-chemistry)/2300+view.rivalry/7500,.01,.10);
  if(rng.chance(scandalChance))careerScandal(state,kind,career,world,rival?.id,rng);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:score>=80?2:1,text:`${world.name} completed its run with a career impact score of ${Math.round(score)}/100.`});
}

export function processSpecialCareerEcosystemsYear(state:GameState){
  for(const world of specialCareerWorlds(state)){
    if(world.active)ensureSpecialCareerRelationships(state,world);
    const kind=specialCareerWorldKind(world);if(!kind)continue;
    if((kind==='acting'||kind==='directing')&&!world.active&&world.endedAge===state.character.age&&!world.groups.some(group=>group.kind.endsWith(':resolved'))){
      finalizeTemporaryProject(state,kind,world);
      world.groups.push({id:makeStateId(state,`special-${kind}-resolved`),name:'Completed Project',kind:`special:${kind}:resolved`,minAge:0,memberNpcIds:[],prestige:Number(track(state,kind).lastProjectScore??50)});
      continue;
    }
    if(world.active&&['music','sports','modeling','racing'].includes(kind))processPersistentCareerYear(state,kind,world);
  }
}
