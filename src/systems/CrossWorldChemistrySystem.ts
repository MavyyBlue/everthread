import { CROSS_WORLD_CHEMISTRY_PLANS, crossWorldChemistryPlanById } from '../data/crossWorldChemistry';
import { TOWN_PLACES } from '../data/townPlaces';
import type { GameState, RelationshipType, SocialWorld, SocialWorldMember } from '../types/game';
import type { CrossWorldChemistryContext, CrossWorldChemistryContextKind, CrossWorldChemistryPlan } from '../types/crossWorldChemistry';
import { sharedExperienceAvailability } from './SharedExperienceSystem';

const FAMILY_TYPES=new Set<RelationshipType>(['parent','stepparent','grandparent','sibling','half_sibling','stepsibling','aunt_uncle','cousin','niece_nephew','child','grandchild']);
const FRIEND_TYPES=new Set<RelationshipType>(['friend','best_friend','partner','fiance','spouse']);
const townPlaceById=Object.fromEntries(TOWN_PLACES.map(place=>[place.id,place])) as Record<string,(typeof TOWN_PLACES)[number]>;

const organizationPrefixes:readonly [string,CrossWorldChemistryContextKind][]=[
  ['special-acting-','acting'],['special-music-','music'],['special-sports-','sports'],['special-modeling-','modeling'],['special-racing-','racing'],['special-directing-','directing'],
  ['special-combat-','combat'],['special-military-','military'],['special-politics-','politics'],
];

function organizationKind(world:SocialWorld){return organizationPrefixes.find(([prefix])=>world.id.startsWith(prefix))?.[1];}
function memberGroups(world:SocialWorld,member:SocialWorldMember){return member.groupIds.map(id=>world.groups.find(group=>group.id===id)).filter((group):group is SocialWorld['groups'][number]=>Boolean(group));}
function excludedProfessionalGroup(world:SocialWorld,member:SocialWorldMember){return memberGroups(world,member).some(group=>group.kind.endsWith(':rivals')||group.kind.endsWith(':opposition'));}

function professionalRoleLabel(world:SocialWorld,member:SocialWorldMember,kind:CrossWorldChemistryContextKind){
  const group=memberGroups(world,member)[0];const suffix=group?.kind.split(':').at(-1)??'';
  if(kind==='acting'||kind==='directing')return suffix==='cast'?'Castmate':suffix==='production_leads'||suffix==='department_heads'||suffix==='producers'?'Production lead':'Crew';
  if(kind==='music')return suffix==='creative'?'Creative partner':suffix==='management'?'Management':'Tour crew';
  if(kind==='sports')return suffix==='team'?'Teammate':suffix==='coaching'?'Coach':'Career contact';
  if(kind==='modeling')return suffix==='agency'?'Agency contact':suffix==='campaign'?'Campaign teammate':'Industry contact';
  if(kind==='racing')return suffix==='race_team'?'Race teammate':suffix==='engineering'?'Engineer':'Racing contact';
  if(kind==='combat')return suffix==='coaches'?'Coach':suffix==='training'?'Training partner':'Combat contact';
  if(kind==='military')return suffix==='command'?(member.role==='leader'?'Commander':'Command team'):suffix==='peers'?'Service peer':'Unit support';
  if(kind==='politics')return suffix==='staff'?(member.role==='leader'?'Senior staff':'Staff'):suffix==='coalition'?'Coalition contact':'Political contact';
  return member.role==='leader'?'Lead contact':'Career contact';
}

function labelForKind(kind:CrossWorldChemistryContextKind){
  if(kind==='school')return'School connection';if(kind==='family')return'Family';if(kind==='friend')return'Friendship';if(kind==='workplace')return'Workplace';
  if(kind==='acting')return'Acting world';if(kind==='music')return'Music world';if(kind==='sports')return'Sports world';if(kind==='modeling')return'Modeling world';if(kind==='racing')return'Racing world';if(kind==='directing')return'Film world';if(kind==='combat')return'Combat world';if(kind==='military')return'Military world';return'Political world';
}

function activeMember(world:SocialWorld,npcId:string){return world.active?world.members.find(member=>member.npcId===npcId&&member.leftAge===undefined):undefined;}

/** Pure context projection. It reads existing Relationship/SocialWorld truth and creates no parallel membership state. */
export function crossWorldChemistryContext(state:GameState,npcId:string):CrossWorldChemistryContext|undefined{
  const npc=state.npcs[npcId];const rel=state.relationships.find(item=>item.npcId===npcId);
  if(!npc?.alive||!rel||rel.estranged||rel.type==='enemy')return;

  const organizationMatches=state.socialWorlds
    .filter(world=>world.kind==='organization'&&world.active)
    .map(world=>({world,member:activeMember(world,npcId),kind:organizationKind(world)}))
    .filter((entry):entry is {world:SocialWorld;member:SocialWorldMember;kind:CrossWorldChemistryContextKind}=>Boolean(entry.member&&entry.kind))
    .filter(entry=>!excludedProfessionalGroup(entry.world,entry.member))
    .sort((a,b)=>b.world.startedAge-a.world.startedAge||a.world.id.localeCompare(b.world.id));
  const professional=organizationMatches[0];
  if(professional)return{kind:professional.kind,label:labelForKind(professional.kind),roleLabel:professionalRoleLabel(professional.world,professional.member,professional.kind),worldId:professional.world.id,worldName:professional.world.name};

  const workplace=state.socialWorlds.filter(world=>world.kind==='workplace'&&world.active).map(world=>({world,member:activeMember(world,npcId)})).find(entry=>entry.member&&['coworker','direct_report','boss'].includes(entry.member.role));
  if(workplace?.member)return{kind:'workplace',label:'Workplace',roleLabel:workplace.member.role==='boss'?'Manager':workplace.member.role==='direct_report'?'Direct report':'Coworker',worldId:workplace.world.id,worldName:workplace.world.name};

  const school=state.socialWorlds.filter(world=>world.kind==='school'&&world.active).map(world=>({world,member:activeMember(world,npcId)})).find(entry=>entry.member?.role==='classmate');
  if(school?.member&&state.character.age>=18)return{kind:'school',label:'School connection',roleLabel:'Classmate',worldId:school.world.id,worldName:school.world.name};

  if(state.character.age<18)return;
  if(FAMILY_TYPES.has(rel.type))return{kind:'family',label:'Family',roleLabel:rel.type.replaceAll('_',' ')};
  if(FRIEND_TYPES.has(rel.type))return{kind:'friend',label:'Friendship',roleLabel:rel.type.replaceAll('_',' ')};
  return;
}

export function projectCrossWorldChemistryPlans(state:GameState,npcId:string):CrossWorldChemistryPlan[]{
  const context=crossWorldChemistryContext(state,npcId);const npc=state.npcs[npcId];if(!context||!npc)return[];
  return CROSS_WORLD_CHEMISTRY_PLANS.filter(plan=>plan.contextKinds.includes(context.kind)&&state.character.age>=plan.minAge&&npc.age>=plan.minAge).map(plan=>{
    const availability=sharedExperienceAvailability(state,npcId,plan.placeId,plan.activityId,`chemistry:${plan.id}`);
    return{...plan,npcId,placeLabel:townPlaceById[plan.placeId]?.label??plan.placeId,context,allowed:availability.allowed,...(!availability.allowed&&availability.reason?{reason:availability.reason}:{})};
  });
}

export function crossWorldChemistryPlanFor(state:GameState,npcId:string,planId:string){
  if(!crossWorldChemistryPlanById[planId])return undefined;
  return projectCrossWorldChemistryPlans(state,npcId).find(plan=>plan.id===planId);
}
