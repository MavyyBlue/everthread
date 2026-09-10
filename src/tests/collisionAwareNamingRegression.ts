import { createRng } from '../core/rng';
import { getNamePool, getNpcFirstNames, npcFirstNameGenderCounts, npcGenderForFirstName } from '../data/names';
import type { GameState, Npc, Orientation } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { npcGender } from '../systems/NpcIdentitySystem';
import { pickCollisionAwareNpcName, resolveCollisionAwareName } from '../systems/NpcNamingSystem';
import { haveChild, meetPotentialPartner } from '../systems/RelationshipSystem';
import { ensureSchoolWorldForEducationRecord } from '../systems/SchoolWorldSystem';
import { ensureWorkplaceForCareerRecord } from '../systems/WorkplaceSystem';
import { ensureSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { ensureCombatCareerWorld } from '../systems/CombatCareerWorldSystem';
import { ensureMilitaryCareerWorld } from '../systems/MilitaryCareerWorldSystem';
import { ensurePoliticsCareerWorld } from '../systems/PoliticsCareerWorldSystem';

function adult(seed:string,orientation:Orientation='pansexual',gender:'woman'|'man'|'nonbinary'='man'){
  const sex=gender==='woman'?'female':gender==='man'?'male':'intersex';
  const state=createNewGame({seed,countryId:'us',sex,genderIdentity:gender,orientation});
  state.character.age=28;state.currentYear=2054;
  return state;
}

function fixtureNpc(state:GameState,id:string,firstName:string,lastName:string):Npc{
  return{id,firstName,lastName,age:30,alive:true,health:90,happiness:70,wealth:10000,countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:70,maritalStatus:'single',traits:['calm'],hiddenOpinion:0,memories:[],parentIds:[],childIds:[]};
}

function fullName(npc:Pick<Npc,'firstName'|'lastName'>){return `${npc.firstName}|${npc.lastName}`;}
function castNames(state:GameState){return new Set([`${state.character.firstName}|${state.character.lastName}`,...Object.values(state.npcs).map(fullName)]);}
function worldMemberNames(state:GameState,npcIds:string[]){return npcIds.map(id=>state.npcs[id]).filter((npc):npc is Npc=>Boolean(npc)).map(fullName);}
function worldNamesAvoidPrior(state:GameState,prior:Set<string>,npcIds:string[]){const names=worldMemberNames(state,npcIds);return new Set(names).size===names.length&&names.every(name=>!prior.has(name));}

export function runCollisionAwareNamingRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Collision-aware naming regression failed: ${message}`);}

  const us=getNamePool('us');const female=getNpcFirstNames('us','female');const male=getNpcFirstNames('us','male');const nonbinary=getNpcFirstNames('us','nonbinary');
  const counts=npcFirstNameGenderCounts('us');
  verify(counts.female===60&&counts.male===54&&counts.nonbinary===6,'active US pool must retain the exact 60/54/6 names that encode 50/45/5 generation weighting');
  verify(us.first.length===120,'regional active pool should retain 120 first names');
  verify(new Set([...female,...male,...nonbinary]).size===120,'gendered first-name buckets should stay disjoint so the 60/54/6 weighting is exact');

  const unique=resolveCollisionAwareName('us',female[0]!,us.last[0]!,[],{});
  verify(unique.firstName===female[0]&&unique.lastName===us.last[0],'an ordinary unused initial draw should remain unchanged');
  const collision=resolveCollisionAwareName('us',female[0]!,us.last[0]!,[{firstName:female[0]!,lastName:us.last[1]!}],{});
  verify(collision.firstName!==female[0],'an avoidable first-name collision should prefer an unused first name');
  verify(female.includes(collision.firstName),'female initial draws must stay inside the female pool during collision resolution');
  const maleCollision=resolveCollisionAwareName('us',male[0]!,us.last[0]!,[{firstName:male[0]!,lastName:us.last[1]!}],{});
  verify(male.includes(maleCollision.firstName),'male initial draws must stay inside the male pool during collision resolution');
  const nonbinaryCollision=resolveCollisionAwareName('us',nonbinary[0]!,us.last[0]!,[{firstName:nonbinary[0]!,lastName:us.last[1]!}],{});
  verify(nonbinary.includes(nonbinaryCollision.firstName),'non-binary initial draws must stay inside the non-binary pool during collision resolution');

  const everyDrawKeepsGender=us.first.every(firstName=>{
    const expected=npcGenderForFirstName('us',firstName);const resolved=resolveCollisionAwareName('us',firstName,us.last[0]!,[{firstName,lastName:us.last[1]!}],{});
    return expected!==undefined&&npcGenderForFirstName('us',resolved.firstName)===expected;
  });
  verify(everyDrawKeepsGender,'collision cleanup must preserve the gender bucket for every active first-name draw');

  const fixed=resolveCollisionAwareName('us',female[0]!,us.last[0]!,[{firstName:female[0]!,lastName:us.last[0]!}],{fixedLastName:us.last[0]!});
  verify(fixed.lastName===us.last[0]&&fixed.firstName!==female[0],'family surname should stay fixed while an avoidable child-name collision is resolved');

  const saturatedFemale=female.map((firstName,index)=>({firstName,lastName:us.last[index%us.last.length]!}));
  const saturatedA=resolveCollisionAwareName('us',female[0]!,us.last[0]!,saturatedFemale,{fixedLastName:us.last[0]!});
  const saturatedB=resolveCollisionAwareName('us',female[0]!,us.last[0]!,saturatedFemale,{fixedLastName:us.last[0]!});
  verify(saturatedA.lastName===us.last[0]&&female.includes(saturatedA.firstName),'a saturated first-name pool should degrade gracefully without crossing gender or surname constraints');
  verify(JSON.stringify(saturatedA)===JSON.stringify(saturatedB),'saturated-pool fallback should be deterministic');

  const skewed=[...saturatedFemale,{firstName:female[0]!,lastName:us.last[2]!}];
  const lowCollision=resolveCollisionAwareName('us',female[0]!,us.last[0]!,skewed,{fixedLastName:us.last[0]!});
  verify(lowCollision.firstName!==female[0],'when every name is used, fallback should prefer a lower-frequency name');

  const mx=getNamePool('mx');const mxInitial=mx.first[0]!;const mxGender=npcGenderForFirstName('mx',mxInitial)!;
  const mxResolved=resolveCollisionAwareName('mx',mxInitial,mx.last[0]!,[{firstName:mxInitial,lastName:mx.last[1]!}],{});
  verify(getNpcFirstNames('mx',mxGender).includes(mxResolved.firstName),'collision resolution should remain inside the selected regional name pool');

  const state=adult('naming-picker');state.npcs={};state.character.lastName=us.last[0]!;
  const flexibleSeed='naming-picker-rng';const flexiblePreview=createRng(flexibleSeed);const flexibleInitial=flexiblePreview.pick(female);state.character.firstName=flexibleInitial;
  const rngFlexible=createRng(flexibleSeed);const beforeFlexible=rngFlexible.counter();const pickedFlexible=pickCollisionAwareNpcName(state,rngFlexible,{gender:'female'});
  verify(rngFlexible.counter()-beforeFlexible===2,'flexible name generation should consume exactly the initial first/last draws, not collision retry RNG');
  verify(pickedFlexible.firstName!==flexibleInitial,'the controlled player should participate in collision avoidance');
  const fixedSeed='naming-picker-fixed';const fixedPreview=createRng(fixedSeed);const fixedInitial=fixedPreview.pick(female);state.character.firstName=fixedInitial;
  const rngFixed=createRng(fixedSeed);const beforeFixed=rngFixed.counter();const pickedFixed=pickCollisionAwareNpcName(state,rngFixed,{gender:'female',fixedLastName:'Family'});
  verify(rngFixed.counter()-beforeFixed===1&&pickedFixed.lastName==='Family','fixed-surname generation should consume only one first-name draw');
  verify(pickedFixed.firstName!==fixedInitial,'fixed-surname generation should still resolve an avoidable player-name collision');
  const deterministicState=adult('naming-deterministic');const nameA=pickCollisionAwareNpcName(deterministicState,createRng('same-name-seed'));const nameB=pickCollisionAwareNpcName(deterministicState,createRng('same-name-seed'));
  verify(JSON.stringify(nameA)===JSON.stringify(nameB),'same state and RNG seed should resolve to the same name');

  let parentsClean=true;
  for(let i=0;i<120;i+=1){const life=createNewGame({seed:`naming-parent-${i}`,countryId:'us'});const names=[`${life.character.firstName}|${life.character.lastName}`,...Object.values(life.npcs).map(fullName)];parentsClean&&=new Set(names).size===names.length;}
  verify(parentsClean,'new-life parent creation should avoid exact collisions with the player and each other in ordinary casts');

  const meet=adult('naming-meet','lesbian','woman');
  const preview=createRng(meet.seed,meet.rngCounter);preview.int(-4,4);const predictedFirst=preview.pick(female);
  const blocker=fixtureNpc(meet,'name-blocker',predictedFirst,'Existing');meet.npcs[blocker.id]=blocker;
  const beforeMeetIds=new Set(Object.keys(meet.npcs));const meetResult=meetPotentialPartner(meet);const met=Object.values(meet.npcs).find(npc=>!beforeMeetIds.has(npc.id));
  verify(meetResult.success&&Boolean(met),'Meet Someone should still create an NPC under collision-aware naming');
  verify(Boolean(met&&met.firstName!==predictedFirst),'Meet Someone should avoid a known first-name collision when the target-gender pool has alternatives');
  verify(Boolean(met&&npcGender(meet,met)==='female'),'collision avoidance must not break orientation-selected target gender');

  const adoption=adult('naming-child');const childPreview=createRng(adoption.seed,adoption.rngCounter);const predictedChildFirst=childPreview.pick(us.first);
  adoption.npcs['child-name-blocker']=fixtureNpc(adoption,'child-name-blocker',predictedChildFirst,adoption.character.lastName);
  const beforeChildIds=new Set(Object.keys(adoption.npcs));const adopted=haveChild(adoption,undefined,true);const child=Object.values(adoption.npcs).find(npc=>!beforeChildIds.has(npc.id));
  verify(adopted.success&&Boolean(child),'player adoption should still create a child');
  verify(Boolean(child&&child.lastName===adoption.character.lastName),'player child naming should preserve the family surname');
  verify(Boolean(child&&child.firstName!==predictedChildFirst),'player child naming should avoid an avoidable first-name collision');

  const school=adult('naming-school');school.character.age=16;school.currentYear=2042;const schoolPrior=castNames(school);
  const schoolWorld=ensureSchoolWorldForEducationRecord(school,{stage:'secondary',institution:'Naming Secondary',startAge:14,graduated:false,droppedOut:false,scholarship:false,performance:70},false);
  verify(worldNamesAvoidPrior(school,schoolPrior,schoolWorld.members.map(member=>member.npcId)),'school roster creation should avoid exact cast collisions and internal duplicates');

  const workplace=adult('naming-workplace');const workplacePrior=castNames(workplace);
  const workplaceWorld=ensureWorkplaceForCareerRecord(workplace,{jobId:'fixture-job',title:'Fixture Worker',company:'Naming Works',startAge:28,salary:50000,performance:60,level:1},'full_time',false);
  verify(worldNamesAvoidPrior(workplace,workplacePrior,workplaceWorld.members.map(member=>member.npcId)),'workplace roster creation should use collision-aware names');

  const special=adult('naming-special');const specialPrior=castNames(special);const specialWorld=ensureSpecialCareerWorld(special,'acting','Naming',{announce:false});
  verify(worldNamesAvoidPrior(special,specialPrior,specialWorld.members.map(member=>member.npcId)),'standard special-career rosters should use collision-aware names');

  const combat=adult('naming-combat');const combatPrior=castNames(combat);const combatWorld=ensureCombatCareerWorld(combat,{announce:false});
  verify(worldNamesAvoidPrior(combat,combatPrior,combatWorld.members.map(member=>member.npcId)),'combat-career rosters should use collision-aware names');

  const military=adult('naming-military');const militaryPrior=castNames(military);const militaryWorld=ensureMilitaryCareerWorld(military,{announce:false});
  verify(worldNamesAvoidPrior(military,militaryPrior,militaryWorld.members.map(member=>member.npcId)),'military-career rosters should use collision-aware names');

  const politics=adult('naming-politics');politics.specialCareers.politics={office:1,active:true};const politicsPrior=castNames(politics);const politicsWorld=ensurePoliticsCareerWorld(politics,{announce:false});
  verify(Boolean(politicsWorld&&worldNamesAvoidPrior(politics,politicsPrior,politicsWorld.members.map(member=>member.npcId))),'politics-career rosters should use collision-aware names');

  return checks;
}
