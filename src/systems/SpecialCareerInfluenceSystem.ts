import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import type { GameState, Npc, SocialWorld } from '../types/game';
import type { SpecialCareerWorldKind } from './SpecialCareerWorldSystem';

type Track = Record<string, number | string | boolean>;
type FollowupKind = 'leader_advocacy' | 'leader_review' | 'rival_grudge';

export interface SpecialCareerInfluenceView {
  kind: SpecialCareerWorldKind;
  leaderNpcId?: string;
  rivalNpcId?: string;
  leaderSupport: number;
  rivalPressure: number;
  opportunityModifier: number;
  conductRisk: number;
}

function track(state:GameState,kind:SpecialCareerWorldKind):Track {return (state.specialCareers[kind]??={}) as Track;}
function n(record:Track,key:string,def=0){return typeof record[key]==='number'?record[key] as number:def;}
function s(record:Track,key:string,def=''){return typeof record[key]==='string'?record[key] as string:def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function relation(state:GameState,npcId?:string){return npcId?state.relationships.find(rel=>rel.npcId===npcId&&!rel.estranged):undefined;}
function participant(state:GameState,world:SocialWorld,npcId:string){const member=world.members.find(item=>item.npcId===npcId);return Boolean(member&&state.npcs[npcId]?.alive&&(member.leftAge===undefined||member.leftAge===state.character.age));}
function normalizedOpinion(npc:Npc){return clamp((npc.hiddenOpinion+100)/2);}
function traitBonus(npc:Npc|undefined,traits:string[],amount:number){if(!npc)return 0;return traits.reduce((sum,trait)=>sum+(npc.traits.includes(trait)?amount:0),0);}
function negativeCareerMemories(npc:Npc|undefined){return npc?.memories.filter(memory=>memory.sentiment<=-5&&(memory.kind.includes('career')||memory.kind.includes('special_'))).length??0;}

function leaderFor(state:GameState,world:SocialWorld){return world.members.find(member=>member.role==='leader'&&participant(state,world,member.npcId));}
function explicitRivalIds(world:SocialWorld){return new Set(world.groups.filter(group=>group.kind.includes(':rivals')).flatMap(group=>group.memberNpcIds));}

function rivalCandidate(state:GameState,world:SocialWorld,leaderNpcId?:string){
  const explicit=explicitRivalIds(world);
  const candidates=world.members
    .filter(member=>member.npcId!==leaderNpcId&&participant(state,world,member.npcId))
    .map(member=>{
      const npc=state.npcs[member.npcId];const rel=relation(state,member.npcId);if(!npc||!rel)return undefined;
      const explicitBonus=explicit.has(member.npcId)?18:0;
      const personality=traitBonus(npc,['competitive','aggressive'],7)+traitBonus(npc,['ambitious','stubborn'],3);
      const grudge=Math.min(15,negativeCareerMemories(npc)*3);
      const pressure=clamp((100-rel.score)*.78+explicitBonus+personality+grudge);
      return {npcId:npc.id,pressure,explicit:explicit.has(npc.id)};
    })
    .filter((entry):entry is {npcId:string;pressure:number;explicit:boolean}=>Boolean(entry))
    .sort((a,b)=>Number(b.explicit)-Number(a.explicit)||b.pressure-a.pressure||a.npcId.localeCompare(b.npcId));
  const best=candidates[0];
  return best&&(best.explicit||best.pressure>=34)?best:undefined;
}

function supportFor(state:GameState,npcId?:string){
  const npc=npcId?state.npcs[npcId]:undefined;const rel=relation(state,npcId);if(!npc||!rel)return 50;
  const temperament=traitBonus(npc,['responsible','patient','generous','loyal'],1.5)-traitBonus(npc,['selfish','reckless'],1.5);
  return clamp(rel.score*.70+normalizedOpinion(npc)*.15+rel.compatibility*.15+temperament);
}

function careerConductRisk(state:GameState,career:Track,world:SocialWorld,leaderSupport:number){
  const incidents=n(career,`stressIncidents:${world.id}`);const scandals=n(career,'scandals');
  return clamp(state.character.secondary.stress*.45+Math.max(0,50-leaderSupport)*.55+incidents*7+scandals*3);
}

function baseOpportunityModifier(leaderSupport:number,rivalPressure:number){
  return clamp((leaderSupport-50)*.12-Math.max(0,rivalPressure-45)*.09,-12,12);
}

export function specialCareerInfluenceView(state:GameState,world:SocialWorld,kind:SpecialCareerWorldKind):SpecialCareerInfluenceView {
  const leader=leaderFor(state,world);const leaderSupport=supportFor(state,leader?.npcId);const rival=rivalCandidate(state,world,leader?.npcId);
  const career=(state.specialCareers[kind]??{}) as Track;const rivalPressure=rival?.pressure??0;const opportunityModifier=baseOpportunityModifier(leaderSupport,rivalPressure);const conductRisk=careerConductRisk(state,career,world,leaderSupport);
  return {kind,leaderNpcId:leader?.npcId,rivalNpcId:rival?.npcId,leaderSupport,rivalPressure,opportunityModifier,conductRisk};
}

function addMemory(state:GameState,npcId:string|undefined,kind:string,sentiment:number,summary:string,permanent=false){
  if(!npcId)return;const npc=state.npcs[npcId];if(!npc)return;
  npc.memories.push({id:makeStateId(state,'memory'),year:state.currentYear,age:state.character.age,kind,sentiment,summary,permanent});
  npc.memories=npc.memories.slice(-36);
}

function rememberEvent(state:GameState,career:Track,text:string,npcIds:string[]|undefined,importance:1|2|3=1){
  career.influenceLastEvent=text;setN(career,'influenceEventCount',n(career,'influenceEventCount')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance,text,npcIds});
}

function followupPriority(kind:FollowupKind){return kind==='rival_grudge'?3:kind==='leader_review'?2:1;}
function scheduleFollowup(career:Track,state:GameState,world:SocialWorld,npcId:string,kind:FollowupKind,strength:number){
  const existing=s(career,'influenceFollowupKind') as FollowupKind|'';
  if(existing&&followupPriority(existing)>followupPriority(kind))return;
  career.influenceFollowupKind=kind;career.influenceFollowupNpcId=npcId;career.influenceFollowupWorldId=world.id;
  setN(career,'influenceFollowupDueAge',state.character.age+1);setN(career,'influenceFollowupStrength',strength);
}

function clearFollowup(career:Track){
  delete career.influenceFollowupKind;delete career.influenceFollowupNpcId;delete career.influenceFollowupWorldId;
  delete career.influenceFollowupDueAge;delete career.influenceFollowupStrength;
}
function resolvedFollowupModifier(career:Track,state:GameState,world:SocialWorld){
  return n(career,'influenceFollowupResolvedAge',-1)===state.character.age&&s(career,'influenceFollowupResolvedWorldId')===world.id?n(career,'influenceFollowupModifier'):0;
}

/** Resolve an already-scheduled leader/rival consequence without creating a new annual incident. */
export function resolveSpecialCareerInfluenceFollowup(state:GameState,kind:SpecialCareerWorldKind,world:SocialWorld){
  const career=track(state,kind);const followup=s(career,'influenceFollowupKind') as FollowupKind|'';if(!followup)return 0;
  if(s(career,'influenceFollowupWorldId')!==world.id||state.character.age<n(career,'influenceFollowupDueAge',Infinity))return 0;
  const npcId=s(career,'influenceFollowupNpcId');const npc=npcId?state.npcs[npcId]:undefined;const rel=relation(state,npcId);const strength=n(career,'influenceFollowupStrength',1);let modifier=0;
  if(!npc?.alive||!rel){clearFollowup(career);return 0;}
  if(followup==='leader_advocacy'){
    if(rel.score>=65){setN(career,'reputation',clamp(n(career,'reputation',45)+2));modifier=clamp(Math.round(strength),3,6);rel.score=clamp(rel.score+1);const text=`${npc.firstName} ${npc.lastName} followed through on earlier support from ${world.name}, improving the quality of opportunities reaching you.`;rememberEvent(state,career,text,[npc.id],2);addMemory(state,npc.id,'career_leader_followthrough',5,`${state.character.firstName}'s work justified your professional support.`);}
  }else if(followup==='leader_review'){
    if(rel.score>=50&&state.character.secondary.stress<85){setN(career,'reputation',clamp(n(career,'reputation',45)+1));modifier=2;const text=`A follow-up review with ${npc.firstName} ${npc.lastName} ended on steadier terms after you improved your professional standing.`;rememberEvent(state,career,text,[npc.id],1);addMemory(state,npc.id,'career_review_recovery',4,`${state.character.firstName} responded constructively after a difficult professional review.`);}
    else{setN(career,'reputation',clamp(n(career,'reputation',45)-2));state.character.secondary.stress=clamp(state.character.secondary.stress+2);modifier=-clamp(Math.round(2+strength),3,5);const text=`${npc.firstName} ${npc.lastName}'s earlier warning carried into another review, weakening your standing in ${world.name}.`;rememberEvent(state,career,text,[npc.id],2);addMemory(state,npc.id,'career_review_grudge',-8,`${state.character.firstName}'s professional warning remained unresolved.`,true);}
  }else{
    if(rel.score>=45){state.character.secondary.stress=clamp(state.character.secondary.stress-2);modifier=2;const text=`The professional feud with ${npc.firstName} ${npc.lastName} cooled before it could follow you further.`;rememberEvent(state,career,text,[npc.id],1);addMemory(state,npc.id,'career_rival_detente',4,`Your rivalry with ${state.character.firstName} cooled after a tense period.`);}
    else{setN(career,'reputation',clamp(n(career,'reputation',45)-1));state.character.secondary.stress=clamp(state.character.secondary.stress+2);setN(career,'rivalGrudges',n(career,'rivalGrudges')+1);modifier=-clamp(Math.round(2+strength*.5),3,5);const text=`${npc.firstName} ${npc.lastName}'s grudge carried into the next career cycle and narrowed some of your professional opportunities.`;rememberEvent(state,career,text,[npc.id],2);addMemory(state,npc.id,'career_rival_grudge',-8,`Your professional grudge against ${state.character.firstName} deepened.`,true);}
  }
  career.influenceFollowupResolvedWorldId=world.id;setN(career,'influenceFollowupResolvedAge',state.character.age);setN(career,'influenceFollowupModifier',modifier);clearFollowup(career);return modifier;
}

/**
 * Annual 4D6 influence layer. It reads persistent Career World relationships, writes only flat
 * career-track metrics/memories/timeline consequences, and leaves dismissal/release authority to
 * the existing stress and career-cycle systems.
 */
export function processSpecialCareerInfluenceYear(state:GameState,kind:SpecialCareerWorldKind,world:SocialWorld):SpecialCareerInfluenceView {
  const career=track(state,kind);resolveSpecialCareerInfluenceFollowup(state,kind,world);const followupModifier=resolvedFollowupModifier(career,state,world);
  const eligible=world.active||world.endedAge===state.character.age;
  if(!eligible){const view=specialCareerInfluenceView(state,world,kind);return {...view,opportunityModifier:clamp(view.opportunityModifier+followupModifier,-12,12)};}
  if(n(career,'lastInfluenceAge',-1)===state.character.age&&s(career,'lastInfluenceWorldId')===world.id){const view=specialCareerInfluenceView(state,world,kind);return {...view,opportunityModifier:clamp(n(career,'opportunityModifier',view.opportunityModifier),-12,12)};}
  setN(career,'lastInfluenceAge',state.character.age);career.lastInfluenceWorldId=world.id;
  const rng=createRng(`${state.seed}-career-influence-${world.id}-${state.currentYear}`);let view=specialCareerInfluenceView(state,world,kind);let modifier=view.opportunityModifier+followupModifier;
  const leader=view.leaderNpcId?state.npcs[view.leaderNpcId]:undefined;const leaderRel=relation(state,view.leaderNpcId);const skillKey=kind==='modeling'?'technique':'skill';const skill=n(career,skillKey,30);

  if(leader&&leaderRel&&view.leaderSupport>=68&&rng.chance(clamp(.08+(view.leaderSupport-68)/240,.08,.24))){
    if(skill<80&&rng.chance(.56)){
      const gain=rng.int(1,3);setN(career,skillKey,clamp(skill+gain));setN(career,'reputation',clamp(n(career,'reputation',45)+1));leaderRel.score=clamp(leaderRel.score+2);state.character.secondary.stress=clamp(state.character.secondary.stress-1);setN(career,'leaderMentorships',n(career,'leaderMentorships')+1);modifier+=2;
      const text=`${leader.firstName} ${leader.lastName} took a direct mentoring role in ${world.name}, sharpening your professional skill and confidence.`;rememberEvent(state,career,text,[leader.id],2);addMemory(state,leader.id,'career_mentorship',6,`You mentored ${state.character.firstName} through ${world.name}.`);
    }else{
      const boost=rng.int(3,6);modifier+=boost;setN(career,'reputation',clamp(n(career,'reputation',45)+2));leaderRel.score=clamp(leaderRel.score+1);setN(career,'leaderAdvocacyCount',n(career,'leaderAdvocacyCount')+1);
      const text=`${leader.firstName} ${leader.lastName} advocated for you inside ${world.name}, improving the caliber of opportunities around your next career cycle.`;rememberEvent(state,career,text,[leader.id],2);addMemory(state,leader.id,'career_advocacy',5,`You backed ${state.character.firstName} for stronger professional opportunities.`);scheduleFollowup(career,state,world,leader.id,'leader_advocacy',boost);
    }
  }else if(leader&&leaderRel&&(view.conductRisk>=62||view.leaderSupport<=42)&&(state.character.secondary.stress>=65||n(career,`stressIncidents:${world.id}`)>=2||n(career,'scandals')>=1)&&rng.chance(clamp(.07+Math.max(0,45-view.leaderSupport)/220+Math.max(0,view.conductRisk-60)/180,.07,.32))){
    setN(career,'reputation',clamp(n(career,'reputation',45)-2));state.character.secondary.stress=clamp(state.character.secondary.stress+3);leaderRel.score=clamp(leaderRel.score-3);const warnings=n(career,'leaderWarnings')+1;setN(career,'leaderWarnings',warnings);modifier-=3;
    const text=`${leader.firstName} ${leader.lastName} called you into a conduct review at ${world.name}. No release occurred, but your professional standing took a hit.`;rememberEvent(state,career,text,[leader.id],warnings>=2?2:1);addMemory(state,leader.id,'career_conduct_review',warnings>=2?-8:-6,`${state.character.firstName} required a professional conduct review in ${world.name}.`,warnings>=2);scheduleFollowup(career,state,world,leader.id,'leader_review',warnings);
  }

  view=specialCareerInfluenceView(state,world,kind);const rival=view.rivalNpcId?state.npcs[view.rivalNpcId]:undefined;const rivalRel=relation(state,view.rivalNpcId);
  if(rival&&rivalRel&&view.rivalPressure>=55&&rng.chance(clamp(.07+(view.rivalPressure-55)/250+state.character.secondary.stress/1200,.07,.28))){
    const drop=rng.int(2,5);rivalRel.score=clamp(rivalRel.score-drop);rival.hiddenOpinion=Math.max(-100,Math.min(100,rival.hiddenOpinion-rng.int(2,5)));state.character.secondary.stress=clamp(state.character.secondary.stress+rng.int(2,4));const conflicts=n(career,'rivalConflicts')+1;setN(career,'rivalConflicts',conflicts);modifier-=rng.int(2,5);
    const text=`Competition with ${rival.firstName} ${rival.lastName} inside ${world.name} escalated into a professional conflict, adding pressure around your next opportunities.`;rememberEvent(state,career,text,[rival.id],conflicts>=2?2:1);addMemory(state,rival.id,'career_rival_conflict',conflicts>=2?-8:-6,`Your professional rivalry with ${state.character.firstName} escalated in ${world.name}.`,conflicts>=2);scheduleFollowup(career,state,world,rival.id,'rival_grudge',conflicts);
  }

  view=specialCareerInfluenceView(state,world,kind);modifier=clamp(modifier,-12,12);setN(career,'leaderSupport',view.leaderSupport);setN(career,'rivalPressure',view.rivalPressure);setN(career,'conductRisk',view.conductRisk);setN(career,'opportunityModifier',modifier);
  if(view.leaderNpcId)career.leaderNpcId=view.leaderNpcId;if(view.rivalNpcId)career.rivalNpcId=view.rivalNpcId;
  return {...view,opportunityModifier:n(career,'opportunityModifier',modifier)};
}
