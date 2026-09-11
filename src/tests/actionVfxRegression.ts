import {
  ACTION_VFX_ASSETS,
  EVERTHREAD_UI_ICONS,
  captureActionVfxSnapshot,
  careerActionVfx,
  deriveActionVfxKinds,
  resolvedActionVfxKinds,
  type ActionVfxKind,
} from '../core/actionVfx';
import { createNewGame } from '../systems/CharacterSystem';

export function runActionVfxRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Action VFX regression failed: ${message}`);}

  const careerCases:Array<[string,ActionVfxKind]>=[
    ['acting','acting'],['music','music'],['sports','professionalSports'],['combat','combatSports'],['modeling','modeling'],['racing','motorsport'],['crimeOrg','organizedCrime'],
  ];
  for(const [path,kind] of careerCases) verify(careerActionVfx(path)===kind,`${path} should resolve to its supplied action icon`);
  verify(careerActionVfx('politics')===undefined,'unsupported paths should not invent an unrelated icon');

  const expectedAssets:Record<ActionVfxKind,string>={
    acting:'./vfx/action/acting.png',music:'./vfx/action/music.png',professionalSports:'./vfx/action/professional-sports.png',combatSports:'./vfx/action/combat-sports.png',modeling:'./vfx/action/modeling.png',motorsport:'./vfx/action/motorsport.png',organizedCrime:'./vfx/action/organized-crime.png',chemistryGain:'./vfx/action/chemistry-followers.png',followersGain:'./vfx/action/chemistry-followers.png',relationshipGain:'./vfx/action/relationship-gain.png',stressReduction:'./vfx/action/stress-reduction.png',stressIncrease:'./vfx/action/stress-increase.png',moneyLoss:'./vfx/action/money-loss.png',relationshipLoss:'./vfx/action/relationship-loss.png',
  };
  for(const [kind,path] of Object.entries(expectedAssets) as Array<[ActionVfxKind,string]>) verify(ACTION_VFX_ASSETS[kind]===path,`${kind} should point at the intended supplied asset`);
  verify(EVERTHREAD_UI_ICONS.cash==='./icons/cash.png','Life cash should use the supplied static cash icon');
  verify(EVERTHREAD_UI_ICONS.deceased==='./icons/deceased-stamp.png','Threadspace deaths should use the supplied deceased stamp');

  const state=createNewGame({seed:'action-vfx-regression'});state.character.age=30;state.finances.cash=5000;state.character.secondary.stress=40;state.fame.followers=1200;
  const relationship=state.relationships[0]!;relationship.score=55;
  const before=captureActionVfxSnapshot(state);
  verify(before.cash===5000&&before.stress===40&&before.followers===1200,'snapshot should capture UI-relevant scalar values before an action');
  verify(before.relationshipScores[relationship.npcId]===55,'snapshot should capture existing relationship scores by NPC');

  state.finances.cash=4400;state.character.secondary.stress=49;state.fame.followers=1280;relationship.score=61;
  let derived=deriveActionVfxKinds(before,state);
  verify(derived.includes('moneyLoss'),'cash decreases should emit money-loss feedback');
  verify(derived.includes('stressIncrease')&&!derived.includes('stressReduction'),'stress increases should emit only adverse stress feedback');
  verify(derived.includes('followersGain'),'follower increases should emit follower feedback');
  verify(derived.includes('relationshipGain')&&!derived.includes('relationshipLoss'),'relationship increases should emit positive relationship feedback');

  const second=captureActionVfxSnapshot(state);state.character.secondary.stress=42;relationship.score=48;
  derived=deriveActionVfxKinds(second,state);
  verify(derived.includes('stressReduction')&&!derived.includes('stressIncrease'),'stress recovery should emit the supplied reduction icon');
  verify(derived.includes('relationshipLoss')&&!derived.includes('relationshipGain'),'relationship decreases should emit adverse relationship feedback');

  const third=captureActionVfxSnapshot(state);const priorIds=new Set(state.relationships.map(item=>item.npcId));
  state.relationships.push({id:'vfx-new-rel',npcId:'vfx-new-npc',type:'friend',score:90,attraction:0,compatibility:50,yearsKnown:0});
  derived=deriveActionVfxKinds(third,state);
  verify(!derived.includes('relationshipGain'),'a brand-new relationship should not masquerade as a score increase without a prior value');
  state.relationships=state.relationships.filter(item=>priorIds.has(item.npcId));

  const fourth=captureActionVfxSnapshot(state);state.character.secondary.stress+=3;
  let resolved=resolvedActionVfxKinds(false,{primary:'music',derive:true},fourth,state);
  verify(!resolved.includes('music')&&resolved.includes('stressIncrease'),'failed-but-executed actions should suppress positive primary confetti while preserving real adverse changes');
  resolved=resolvedActionVfxKinds(true,{primary:'music',derive:false},fourth,state);
  verify(resolved.length===1&&resolved[0]==='music','successful explicit actions should emit their primary domain icon even without derived effects');

  const fifth=captureActionVfxSnapshot(state);relationship.score+=5;
  resolved=resolvedActionVfxKinds(true,{primary:'chemistryGain',derive:true,suppressDerived:['relationshipGain']},fifth,state);
  verify(resolved.includes('chemistryGain')&&!resolved.includes('relationshipGain'),'Build Chemistry should use the person-plus icon without duplicating the heart-plus burst');

  const sixth=captureActionVfxSnapshot(state);state.finances.cash-=100;state.character.secondary.stress+=2;
  resolved=resolvedActionVfxKinds(true,{primary:'acting',derive:true},sixth,state);
  verify(resolved.includes('acting')&&resolved.includes('moneyLoss')&&resolved.includes('stressIncrease'),'a successful career action may combine its domain icon with real adverse consequence icons');
  verify(new Set(resolved).size===resolved.length,'resolved VFX kinds should be deduplicated within one press burst');

  const seventh=captureActionVfxSnapshot(state);state.finances.cash-=75;
  resolved=resolvedActionVfxKinds(true,undefined,seventh,state);
  verify(resolved.includes('moneyLoss'),'plain successful button results should derive money-loss feedback by default');

  const eighth=captureActionVfxSnapshot(state);state.finances.cash-=25;state.character.secondary.stress+=4;
  resolved=resolvedActionVfxKinds(false,undefined,eighth,state);
  verify(resolved.includes('moneyLoss')&&resolved.includes('stressIncrease'),'plain failed-but-executed button results should still derive real adverse consequences by default');

  const ninth=captureActionVfxSnapshot(state);relationship.score+=4;
  resolved=resolvedActionVfxKinds(true,{primary:'music'},ninth,state);
  verify(resolved.includes('music')&&resolved.includes('relationshipGain'),'primary-only requests should keep automatic derived consequences without requiring derive:true');

  const tenth=captureActionVfxSnapshot(state);state.finances.cash-=50;
  resolved=resolvedActionVfxKinds(true,{derive:false},tenth,state);
  verify(!resolved.includes('moneyLoss'),'derive:false should remain an explicit opt-out for exceptional UI actions');

  return checks;
}
