import type { Npc } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { ensureNpcLife } from '../systems/NpcLifeSystem';
import { npcCareerProjection, npcSpecialCareerOccupation, playerCareerLabel } from '../systems/CareerIdentitySystem';
import { canAskOutNpc, canHookUpWithNpc, canReconcileWithNpc, changeRelationshipType, hookUpWithNpc, hookupDiscoveryChance } from '../systems/RelationshipSystem';

function makeNpc(state:ReturnType<typeof createNewGame>,id:string,firstName:string,age:number,traits:string[]=[]):Npc{
  return {id,firstName,lastName:'Vale',age,alive:true,health:90,happiness:70,wealth:25000,countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus:'single',traits,hiddenOpinion:50,memories:[],parentIds:[],childIds:[]};
}

export function runCareerRelationshipCoherenceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Career / relationship coherence regression failed: ${message}`);}

  const player=createNewGame({seed:'career-profile-special'});player.character.age=27;player.specialCareers.modeling={active:true,jobs:3,technique:68};
  verify(playerCareerLabel(player)==='Model','active professional modeling must replace the unemployed life-profile label');
  player.specialCareers.music={active:true,professionalStartAge:25,songsReleased:2,instrument:'vocals'};
  verify(playerCareerLabel(player).includes('Model')&&playerCareerLabel(player).includes('Recording Artist'),'two active special careers must both remain visible in the player career identity');

  const npcState=createNewGame({seed:'npc-special-career-profile'});npcState.character.age=30;
  const nora=makeNpc(npcState,'nora-career','Nora',38,['ambitious','responsible']);nora.careerId='coffee_bakery_2';npcState.npcs[nora.id]=nora;ensureNpcLife(npcState,nora);
  const ordinaryIncome=nora.life!.finance.annualIncome;
  npcState.socialWorlds.push({
    id:'special-music-orbit',kind:'organization',name:'Orbit Records',countryId:npcState.character.countryId,city:npcState.character.city,startedAge:27,active:true,
    members:[{npcId:nora.id,role:'leader',joinedAge:27,groupIds:['orbit-management']}],
    groups:[{id:'orbit-management',name:'Management',kind:'special:music:management',minAge:16,memberNpcIds:[nora.id],prestige:72}],
  });
  const occupation=npcSpecialCareerOccupation(npcState,nora.id);
  verify(occupation?.title==='Music Manager','special music-world leader must project as a music manager rather than an unrelated standard job');
  const npcProfile=npcCareerProjection(npcState,nora);
  verify(npcProfile.career==='Music Manager · Orbit Records','NPC profile must show the active special-career role and organization');
  verify(npcProfile.annualIncome>ordinaryIncome&&npcProfile.annualIncome>50000,'NPC special-career profile income must reflect the professional role rather than barista income');
  npcState.socialWorlds[0]!.active=false;
  verify(npcCareerProjection(npcState,nora).career==='Barista','archived special-career affiliation must stop overriding a current ordinary career');

  const romance=createNewGame({seed:'hookup-fallout-1'});romance.character.age=28;romance.character.orientation='pansexual';romance.rngCounter=0;
  const spouse=makeNpc(romance,'spouse-npc','Morgan',29,['jealous','loyal']);spouse.maritalStatus='married';spouse.hiddenOpinion=90;
  const target=makeNpc(romance,'hookup-target','Riley',28,['romantic']);target.hiddenOpinion=100;
  const ex=makeNpc(romance,'ex-npc','Avery',30,['calm']);
  romance.npcs[spouse.id]=spouse;romance.npcs[target.id]=target;romance.npcs[ex.id]=ex;
  romance.relationships.push(
    {id:'rel-spouse',npcId:spouse.id,type:'spouse',score:90,attraction:90,compatibility:90,yearsKnown:6},
    {id:'rel-target',npcId:target.id,type:'friend',score:100,attraction:100,compatibility:100,yearsKnown:2},
    {id:'rel-ex',npcId:ex.id,type:'ex',score:70,attraction:70,compatibility:70,yearsKnown:5},
  );
  verify(!canAskOutNpc(romance,target.id),'Ask Out must disappear when the player already has a partner, fiance, or spouse');
  verify(canHookUpWithNpc(romance,target.id),'adult committed players must receive Hook Up on an otherwise date-eligible NPC');
  verify(!canReconcileWithNpc(romance,ex.id),'reconciliation must not create a second current partner while another commitment is active');
  verify(!changeRelationshipType(romance,target.id,'ask_out').success,'engine must reject Ask Out while another romantic commitment exists');
  verify(romance.relationships.find(rel=>rel.npcId===target.id)?.type==='friend','blocked Ask Out must not mutate the target relationship type');
  verify(hookupDiscoveryChance(2,'spouse',spouse)>hookupDiscoveryChance(1,'spouse',spouse),'repeat hookups must increase discovery risk');
  const hookup=hookUpWithNpc(romance,target.id);
  verify(hookup.success,'high-attraction deterministic hookup fixture must succeed');
  verify(Number(romance.flags[`hookupCount:${target.id}`])===1,'successful hookup must persist a per-NPC repeat count');
  verify(romance.relationships.find(rel=>rel.npcId===target.id)?.type==='friend','hookup must not silently convert the target into a second partner');
  verify(Number(romance.flags.infidelityDiscoveries)===1,'deterministic spouse fixture must receive the adverse discovery event');
  verify(romance.relationships.find(rel=>rel.npcId===spouse.id)?.type==='ex'&&romance.npcs[spouse.id]?.maritalStatus==='divorced','severe discovered infidelity can end the existing marriage without creating duplicate partners');
  verify(romance.timeline.some(entry=>entry.text.includes('found out about your hookup')),'partner fallout must be recorded in the life timeline');

  const teen=createNewGame({seed:'hookup-adult-boundary'});teen.character.age=17;
  const teenPartner=makeNpc(teen,'teen-partner','Kai',17);const teenTarget=makeNpc(teen,'teen-target','Rowan',17);
  teen.npcs[teenPartner.id]=teenPartner;teen.npcs[teenTarget.id]=teenTarget;
  teen.relationships.push({id:'teen-partner-rel',npcId:teenPartner.id,type:'partner',score:80,attraction:80,compatibility:80,yearsKnown:1},{id:'teen-target-rel',npcId:teenTarget.id,type:'friend',score:80,attraction:80,compatibility:80,yearsKnown:1});
  verify(!canHookUpWithNpc(teen,teenTarget.id),'Hook Up must remain adult-only even though teen dating itself is supported');

  return checks;
}
