import { jobById } from '../data/jobs';
import type { GameState, Npc, SocialWorld, SocialWorldMember } from '../types/game';
import { activeSpecialCareerPaths, type SpecialCareerPathKey } from './CommitmentSystem';

type SpecialWorldKind = 'acting' | 'music' | 'sports' | 'combat' | 'military' | 'modeling' | 'racing' | 'directing';
type Track = Record<string, number | string | boolean>;

export interface NpcCareerProjection {
  career: string;
  annualIncome: number;
  specialCareer?: {
    kind: SpecialWorldKind;
    title: string;
    organization: string;
    worldId: string;
  };
}

const PLAYER_SPECIAL_TITLES: Record<SpecialCareerPathKey,string> = {
  acting:'Actor',
  music:'Musician',
  sports:'Professional Athlete',
  combat:'Combat Athlete',
  politics:'Politician',
  royalty:'Royal',
  military:'Military Service',
  crimeOrg:'Organized Crime',
  modeling:'Model',
  racing:'Racing Driver',
  directing:'Film Director',
  secretAgency:'Intelligence Agent',
  commune:'Commune Leader',
  casino:'Casino Operator',
  zoo:'Zoo Director',
  museum:'Museum Director',
};

function specialTrack(state:GameState,key:SpecialCareerPathKey){return state.specialCareers[key] as Track|undefined;}

function playerSpecialTitle(state:GameState,key:SpecialCareerPathKey){
  const track=specialTrack(state,key);
  if(key==='music'&&String(track?.instrument??'').toLowerCase()==='vocals')return 'Recording Artist';
  if(key==='sports'&&typeof track?.sport==='string'&&track.sport.trim())return track.pro===true?`Professional ${track.sport} Athlete`:`${track.sport} Athlete`;
  if(key==='military'&&typeof track?.branch==='string'&&track.branch.trim())return /service$/i.test(track.branch.trim())?track.branch.trim():`${track.branch.trim()} Service`;
  return PLAYER_SPECIAL_TITLES[key];
}

/** Current player-facing career identity. Special-career commitments take precedence over the ordinary employment fallback. */
export function playerCareerLabel(state:GameState){
  const special=activeSpecialCareerPaths(state).map(key=>playerSpecialTitle(state,key));
  if(special.length)return special.join(' · ');
  return state.employment.current?.title??(state.character.age<18?'Growing up':'Unemployed');
}

function specialWorldKind(world:SocialWorld):SpecialWorldKind|undefined {
  return (['acting','music','sports','combat','military','modeling','racing','directing'] as const).find(kind=>world.id.startsWith(`special-${kind}-`));
}

function memberGroup(world:SocialWorld,member:SocialWorldMember){
  return member.groupIds.map(id=>world.groups.find(group=>group.id===id)).find(Boolean);
}

function groupTag(groupKind:string){return groupKind.split(':').at(-1)??'';}

function roleTitle(kind:SpecialWorldKind,tag:string,member:SocialWorldMember){
  if(kind==='acting'){
    if(tag==='cast')return 'Actor';
    if(tag==='production_leads')return member.role==='leader'?'Production Lead':'Production Staff';
    if(tag==='crew')return 'Film Crew';
  }
  if(kind==='music'){
    if(tag==='creative')return 'Recording Artist';
    if(tag==='management')return member.role==='leader'?'Music Manager':'Artist Management';
    if(tag==='tour_crew')return 'Tour Crew';
  }
  if(kind==='sports'){
    if(tag==='coaching')return member.role==='leader'?'Head Coach':'Coach';
    return 'Professional Athlete';
  }
  if(kind==='combat'){
    if(tag==='coaches')return member.role==='leader'?'Head Combat Coach':'Combat Coach';
    return 'Combat Athlete';
  }
  if(kind==='military'){
    if(tag==='command')return member.role==='leader'?'Unit Commander':'Command Staff';
    if(tag==='peers')return 'Service Peer';
    if(tag==='support')return 'Unit Specialist';
    return 'Service Member';
  }
  if(kind==='modeling'){
    if(tag==='agency')return member.role==='leader'?'Agency Director':'Modeling Agent';
    if(tag==='campaign')return 'Campaign Creative';
    if(tag==='rivals')return 'Model';
  }
  if(kind==='racing'){
    if(tag==='engineering')return member.role==='leader'?'Lead Race Engineer':'Race Engineer';
    if(tag==='rivals')return 'Racing Driver';
    return 'Race Team Member';
  }
  if(kind==='directing'){
    if(tag==='cast')return 'Actor';
    if(tag==='department_heads')return 'Department Head';
    if(tag==='producers')return member.role==='leader'?'Executive Producer':'Producer';
  }
  return member.role==='leader'?'Career Lead':'Career Professional';
}

function roleBaseIncome(kind:SpecialWorldKind,tag:string,member:SocialWorldMember){
  if(kind==='acting')return tag==='cast'?85000:tag==='production_leads'?(member.role==='leader'?125000:82000):56000;
  if(kind==='music')return tag==='creative'?90000:tag==='management'?(member.role==='leader'?115000:76000):54000;
  if(kind==='sports')return tag==='coaching'?(member.role==='leader'?145000:95000):190000;
  if(kind==='combat')return tag==='coaches'?(member.role==='leader'?115000:82000):tag==='rivals'?90000:70000;
  if(kind==='military')return tag==='command'?(member.role==='leader'?105000:78000):tag==='support'?62000:56000;
  if(kind==='modeling')return tag==='agency'?(member.role==='leader'?105000:78000):tag==='campaign'?72000:82000;
  if(kind==='racing')return tag==='engineering'?(member.role==='leader'?150000:115000):tag==='rivals'?185000:98000;
  if(kind==='directing')return tag==='cast'?90000:tag==='department_heads'?110000:member.role==='leader'?155000:120000;
  return 70000;
}

function stableIncomeFactor(id:string){
  let hash=0;
  for(let index=0;index<id.length;index+=1)hash=(Math.imul(hash,31)+id.charCodeAt(index))>>>0;
  return .92+(hash%17)/100;
}

export function npcSpecialCareerOccupation(state:GameState,npcId:string){
  const worlds=state.socialWorlds
    .filter(world=>world.kind==='organization'&&world.active&&specialWorldKind(world)&&world.members.some(member=>member.npcId===npcId&&member.leftAge===undefined))
    .sort((a,b)=>b.startedAge-a.startedAge);
  for(const world of worlds){
    const kind=specialWorldKind(world);if(!kind)continue;
    const member=world.members.find(item=>item.npcId===npcId&&item.leftAge===undefined);if(!member)continue;
    const group=memberGroup(world,member);const tag=groupTag(group?.kind??'');
    const title=roleTitle(kind,tag,member);
    const prestige=group?.prestige??(world.groups.length?world.groups.reduce((sum,item)=>sum+item.prestige,0)/world.groups.length:50);
    const prestigeFactor=.84+Math.max(0,Math.min(100,prestige))/300;
    const salaryIndex=Number.isFinite(state.economy.salaryIndex)&&state.economy.salaryIndex>0?state.economy.salaryIndex:1;
    const annualIncome=Math.max(0,Math.round(roleBaseIncome(kind,tag,member)*prestigeFactor*salaryIndex*stableIncomeFactor(npcId)));
    return {kind,title,organization:world.name,worldId:world.id,annualIncome};
  }
  return undefined;
}

/** Read-only NPC profile projection. Active special-career affiliation outranks an unrelated autonomous standard job. */
export function npcCareerProjection(state:GameState,npc:Npc):NpcCareerProjection {
  const special=npcSpecialCareerOccupation(state,npc.id);
  if(special)return {career:`${special.title} · ${special.organization}`,annualIncome:special.annualIncome,specialCareer:special};
  const life=npc.life;
  const job=npc.careerId?jobById[npc.careerId]:undefined;
  return {
    career:life?.career.retired?'Retired':job?.title??(npc.careerId?'Working':'Not currently employed'),
    annualIncome:life?.finance.annualIncome??0,
  };
}
