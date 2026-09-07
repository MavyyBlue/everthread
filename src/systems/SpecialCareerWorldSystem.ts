import { getNamePool } from '../data/names';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, Npc, Orientation, SocialWorld, SocialWorldMemberRole } from '../types/game';
import { ensureNpcLife } from './NpcLifeSystem';

export type SpecialCareerWorldKind = 'acting' | 'music' | 'sports' | 'modeling' | 'racing' | 'directing';

type Track = Record<string, number | string | boolean>;

type GroupTemplate = {
  name: string;
  kind: string;
  min: number;
  max: number;
  leader?: boolean;
  ageOffset: [number, number];
};

type WorldTemplate = {
  names: string[];
  groups: GroupTemplate[];
  persistent: boolean;
};

const NPC_TRAITS = ['generous','selfish','loyal','jealous','ambitious','reckless','calm','romantic','aggressive','responsible','curious','private','witty','stubborn','patient','competitive'];

const WORLD_TEMPLATES: Record<SpecialCareerWorldKind, WorldTemplate> = {
  acting: {
    names: ['Glass Meridian','Borrowed Summer','Night Signal','Paper Kingdom','The Quiet Orbit','Second Sunrise','Velvet Static','The Last Lantern'],
    persistent: false,
    groups: [
      {name:'Cast',kind:'cast',min:4,max:7,ageOffset:[-8,22]},
      {name:'Production Leads',kind:'production_leads',min:2,max:3,leader:true,ageOffset:[4,28]},
      {name:'Crew',kind:'crew',min:2,max:4,ageOffset:[-3,24]},
    ],
  },
  music: {
    names: ['Northline Sound','Satellite Room','Open Circuit','Blue Hour Collective','Static Garden','Horizon Sessions'],
    persistent: true,
    groups: [
      {name:'Creative Partners',kind:'creative',min:2,max:4,ageOffset:[-6,14]},
      {name:'Management',kind:'management',min:1,max:2,leader:true,ageOffset:[4,24]},
      {name:'Tour Crew',kind:'tour_crew',min:2,max:4,ageOffset:[-4,20]},
    ],
  },
  sports: {
    names: ['Comets','Forge','Halos','Atlas','Pulse','Voyagers','Crown','Wildfire'],
    persistent: true,
    groups: [
      {name:'Teammates',kind:'team',min:6,max:10,ageOffset:[-5,8]},
      {name:'Coaching Staff',kind:'coaching',min:2,max:3,leader:true,ageOffset:[8,28]},
      {name:'Rivals',kind:'rivals',min:2,max:4,ageOffset:[-5,8]},
    ],
  },
  modeling: {
    names: ['Aster House','Lumen Model Group','Frame & Field','Northglass Agency','Form Studio','Velvet Line'],
    persistent: true,
    groups: [
      {name:'Agency',kind:'agency',min:2,max:4,leader:true,ageOffset:[2,22]},
      {name:'Campaign Team',kind:'campaign',min:2,max:4,ageOffset:[-5,18]},
      {name:'Industry Rivals',kind:'rivals',min:2,max:3,ageOffset:[-4,10]},
    ],
  },
  racing: {
    names: ['Vector Nine Racing','Arcway Motorsport','Kinetic Works','Apex Thread Racing','Northstar Velocity','Parallax Racing'],
    persistent: true,
    groups: [
      {name:'Race Team',kind:'race_team',min:3,max:5,ageOffset:[-4,18]},
      {name:'Engineering',kind:'engineering',min:2,max:3,leader:true,ageOffset:[4,24]},
      {name:'Rival Drivers',kind:'rivals',min:2,max:4,ageOffset:[-5,10]},
    ],
  },
  directing: {
    names: ['Low Tide City','The Far Window','Ash & Neon','Paper Moons','A Place Between','Tomorrow in Reverse','The Long Echo'],
    persistent: false,
    groups: [
      {name:'Cast',kind:'cast',min:4,max:7,ageOffset:[-10,24]},
      {name:'Department Heads',kind:'department_heads',min:3,max:5,leader:true,ageOffset:[4,28]},
      {name:'Producers',kind:'producers',min:1,max:3,leader:true,ageOffset:[6,30]},
    ],
  },
};

function track(state:GameState,kind:SpecialCareerWorldKind):Track {
  return (state.specialCareers[kind] ??= {});
}

function numberValue(record:Track,key:string,def=0){
  return typeof record[key]==='number' ? record[key] as number : def;
}

function worldPrefix(kind:SpecialCareerWorldKind){return `special-${kind}-`;}

export function specialCareerWorlds(state:GameState,kind?:SpecialCareerWorldKind){
  const worlds=state.socialWorlds.filter(world=>world.kind==='organization');
  return kind ? worlds.filter(world=>world.id.startsWith(worldPrefix(kind))) : worlds.filter(world=>Object.keys(WORLD_TEMPLATES).some(key=>world.id.startsWith(`special-${key}-`)));
}

export function activeSpecialCareerWorld(state:GameState,kind:SpecialCareerWorldKind){
  return specialCareerWorlds(state,kind).find(world=>world.active);
}

export function archiveSpecialCareerWorld(world:SocialWorld,age:number){
  world.active=false;
  world.endedAge??=age;
  for(const member of world.members)member.leftAge??=age;
}

function uniqueName(state:GameState,rng:ReturnType<typeof createRng>,used:Set<string>){
  const pool=getNamePool(state.character.countryId);
  let firstName=rng.pick(pool.first);let lastName=rng.pick(pool.last);
  for(let tries=0;tries<16&&used.has(`${firstName}|${lastName}`);tries+=1){firstName=rng.pick(pool.first);lastName=rng.pick(pool.last);}
  used.add(`${firstName}|${lastName}`);
  return{firstName,lastName};
}

function createCareerNpc(state:GameState,kind:SpecialCareerWorldKind,group:GroupTemplate,ordinal:number,rng:ReturnType<typeof createRng>,used:Set<string>):Npc{
  const {firstName,lastName}=uniqueName(state,rng,used);
  const minimumAge=kind==='acting'||kind==='modeling'?14:16;
  const age=Math.max(minimumAge,state.character.age+rng.int(group.ageOffset[0],group.ageOffset[1]));
  const id=makeStateId(state,`special-${kind}-npc`);
  const npc:Npc={
    id,firstName,lastName,age,alive:true,health:rng.int(58,98),happiness:rng.int(42,91),wealth:rng.int(2500,240000),
    countryId:state.character.countryId,city:state.character.city,
    sexuality:rng.pick<Orientation>(['straight','straight','straight','bisexual','pansexual','gay','lesbian','asexual']),fertility:rng.int(18,88),maritalStatus:'single',
    traits:rng.shuffle(NPC_TRAITS).slice(0,3),hiddenOpinion:rng.int(-10,36),memories:[],parentIds:[],childIds:[],simulationTier:'background',
  };
  state.npcs[id]=npc;
  ensureNpcLife(state,npc);
  return npc;
}

function worldName(state:GameState,kind:SpecialCareerWorldKind,context:string,rng:ReturnType<typeof createRng>){
  const base=rng.pick(WORLD_TEMPLATES[kind].names);
  if(kind==='sports')return `${state.character.city} ${base}`;
  if(kind==='music'&&context)return `${base} — ${context}`;
  return base;
}

export function ensureSpecialCareerWorld(
  state:GameState,
  kind:SpecialCareerWorldKind,
  context='',
  options:{forceNew?:boolean;announce?:boolean}={},
):SocialWorld{
  state.socialWorlds??=[];
  const existing=activeSpecialCareerWorld(state,kind);
  if(existing&&!options.forceNew)return existing;
  if(existing&&options.forceNew)archiveSpecialCareerWorld(existing,state.character.age);

  const template=WORLD_TEMPLATES[kind];
  const ordinal=specialCareerWorlds(state,kind).length+1;
  const rng=createRng(`${state.seed}-special-world-${kind}-${state.character.age}-${ordinal}-${context}`);
  const id=makeStateId(state,`special-${kind}`);
  const used=new Set<string>();
  const members:SocialWorld['members']=[];
  const groups:SocialWorld['groups']=[];

  for(const groupTemplate of template.groups){
    const groupId=makeStateId(state,`special-${kind}-group`);
    const count=rng.int(groupTemplate.min,groupTemplate.max);
    const memberNpcIds:string[]=[];
    for(let index=0;index<count;index+=1){
      const npc=createCareerNpc(state,kind,groupTemplate,index,rng,used);
      const role:SocialWorldMemberRole=groupTemplate.leader&&index===0?'leader':'member';
      memberNpcIds.push(npc.id);
      members.push({npcId:npc.id,role,joinedAge:state.character.age,groupIds:[groupId]});
    }
    groups.push({id:groupId,name:groupTemplate.name,kind:`special:${kind}:${groupTemplate.kind}`,minAge:kind==='acting'||kind==='modeling'?14:16,memberNpcIds,prestige:rng.int(42,78)});
  }

  const name=worldName(state,kind,context,rng);
  const world:SocialWorld={id,kind:'organization',name,countryId:state.character.countryId,city:state.character.city,startedAge:state.character.age,active:true,members,groups};
  state.socialWorlds.push(world);
  const career=track(state,kind);career.worldId=world.id;career.worldName=world.name;career.worldStartedAge=state.character.age;
  const average=groups.length?groups.reduce((sum,group)=>sum+group.prestige,0)/groups.length:50;career.worldPrestige=Math.round(average);

  if(options.announce!==false){
    state.timeline.push({
      id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,
      text:`Your ${kind==='sports'?'professional sports':kind} career now has a persistent world at ${world.name}, with recurring colleagues, staff, and rivals.`,
      npcIds:members.slice(0,4).map(member=>member.npcId),
    });
  }
  return world;
}

function shouldHavePersistentWorld(state:GameState,kind:SpecialCareerWorldKind){
  const career=state.specialCareers[kind] as Track|undefined;if(!career)return false;
  if(kind==='music')return career.active===true&&(numberValue(career,'songsReleased')>0||numberValue(career,'albumsReleased')>0||numberValue(career,'fanbase')>=2500);
  if(kind==='sports')return career.active===true&&career.pro===true;
  if(kind==='modeling')return career.active===true&&numberValue(career,'jobs')>0;
  if(kind==='racing')return career.active===true;
  return false;
}

export function syncSpecialCareerWorlds(state:GameState){
  for(const kind of ['music','sports','modeling','racing'] as const){
    const active=activeSpecialCareerWorld(state,kind);
    if(shouldHavePersistentWorld(state,kind)){if(!active)ensureSpecialCareerWorld(state,kind,String((state.specialCareers[kind] as Track|undefined)?.instrument??''),{announce:false});}
    else if(active)archiveSpecialCareerWorld(active,state.character.age);
  }
}

export function processSpecialCareerWorldsYear(state:GameState){
  syncSpecialCareerWorlds(state);
  for(const world of specialCareerWorlds(state)){
    const kind=(Object.keys(WORLD_TEMPLATES) as SpecialCareerWorldKind[]).find(candidate=>world.id.startsWith(worldPrefix(candidate)));
    if(!kind)continue;
    const template=WORLD_TEMPLATES[kind];
    if(world.active&&!template.persistent&&state.character.age>world.startedAge){archiveSpecialCareerWorld(world,state.character.age);continue;}
    if(!world.active)continue;
    const rng=createRng(`${state.seed}-special-world-year-${world.id}-${state.currentYear}`);
    for(const group of world.groups)group.prestige=clamp(group.prestige+rng.int(-2,3));
    for(const member of world.members){const npc=state.npcs[member.npcId];if(!npc?.alive)member.leftAge??=state.character.age;}
    const livePrestige=world.groups.length?world.groups.reduce((sum,group)=>sum+group.prestige,0)/world.groups.length:50;
    const career=track(state,kind);career.worldPrestige=Math.round(livePrestige);
  }
}
