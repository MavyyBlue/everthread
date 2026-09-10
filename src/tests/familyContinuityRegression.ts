import { createNewGame } from '../systems/CharacterSystem';
import { checkDeath } from '../systems/DeathSystem';
import { familyConflictPressure, processFamilyConflictYear } from '../systems/FamilyConflictSystem';
import type { GameState, Npc, Relationship, RelationshipType } from '../types/game';

function makeNpc(state:GameState,id:string,name:string,maritalStatus:Npc['maritalStatus'],traits:string[]=['calm','loyal']):Npc{
  return {
    id,firstName:name,lastName:'Fixture',age:42,alive:true,health:85,happiness:75,wealth:25000,
    countryId:state.character.countryId,city:state.character.city,sexuality:'bisexual',fertility:60,maritalStatus,
    traits,hiddenOpinion:60,memories:[],parentIds:[],childIds:[],simulationTier:'full',
  };
}

function relation(id:string,npcId:string,type:RelationshipType,score:number):Relationship{
  return{id,npcId,type,score,attraction:0,compatibility:60,yearsKnown:10};
}

function emptyAdult(seed:string){
  const state=createNewGame({seed});state.character.age=40;state.currentYear=2066;state.npcs={};state.relationships=[];return state;
}

export function runFamilyContinuityRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Family continuity regression failed: ${message}`);}

  const dating=emptyAdult('death-dating-cleanup');
  const date=makeNpc(dating,'dating-survivor','Avery','dating');date.partnerId=dating.character.id;dating.npcs[date.id]=date;
  dating.relationships.push(relation('dating-rel',date.id,'partner',74));
  verify(checkDeath(dating,true),'forced-death fixture should die');
  verify(date.maritalStatus==='single','a surviving unmarried partner becomes single after player death');
  verify(date.partnerId===undefined,'a surviving unmarried partner clears the deceased player partner pointer');
  verify(date.memories.some(memory=>memory.kind==='bereavement'&&memory.permanent),'a surviving unmarried partner keeps a bereavement memory');
  verify(dating.completedLives.at(-1)?.spouse===undefined,'a dating partner is not recorded as a legal spouse in the completed life');

  const engaged=emptyAdult('death-engaged-cleanup');
  const fiance=makeNpc(engaged,'fiance-survivor','Morgan','engaged');fiance.partnerId=engaged.character.id;engaged.npcs[fiance.id]=fiance;
  engaged.relationships.push(relation('fiance-rel',fiance.id,'fiance',79));
  checkDeath(engaged,true);
  verify(fiance.maritalStatus==='single','a surviving fiancé becomes single after player death instead of remaining engaged');
  verify(fiance.memories.some(memory=>memory.kind==='bereavement'),'a surviving fiancé receives relationship-boundary bereavement history');

  const married=emptyAdult('death-married-still-widowed');
  const spouse=makeNpc(married,'spouse-survivor','Riley','married');spouse.partnerId=married.character.id;married.npcs[spouse.id]=spouse;
  married.relationships.push(relation('spouse-rel',spouse.id,'spouse',82));
  checkDeath(married,true);
  verify(spouse.maritalStatus==='widowed','legal spouse widowhood remains intact');
  verify(married.completedLives.at(-1)?.spouse==='Riley Fixture','completed life still records only the legal spouse');

  const calm=emptyAdult('family-pressure-threshold');
  const parent=makeNpc(calm,'parent','Parent','married');const step=makeNpc(calm,'step','Step','married');parent.partnerId=step.id;step.partnerId=parent.id;calm.npcs[parent.id]=parent;calm.npcs[step.id]=step;
  const parentRel=relation('parent-rel',parent.id,'parent',65);const stepRel=relation('step-rel',step.id,'stepparent',21);calm.relationships=[parentRel,stepRel];
  verify(familyConflictPressure(calm,parent.id,step.id)===0,'family pressure stays inactive above the 20-point threshold');
  stepRel.score=20;
  verify(familyConflictPressure(calm,parent.id,step.id)>0,'a parent/stepparent relationship score of 20 activates household friction');
  parentRel.score=10;stepRel.score=5;
  verify(familyConflictPressure(calm,parent.id,step.id)>.5,'hostility toward both adults creates stronger household pressure');

  const tension=emptyAdult('family-tension-cooldown');
  const tensionParent=makeNpc(tension,'tension-parent','Jordan','married');const tensionStep=makeNpc(tension,'tension-step','Casey','married');tensionParent.partnerId=tensionStep.id;tensionStep.partnerId=tensionParent.id;tension.npcs[tensionParent.id]=tensionParent;tension.npcs[tensionStep.id]=tensionStep;
  tension.relationships=[relation('tension-parent-rel',tensionParent.id,'parent',70),relation('tension-step-rel',tensionStep.id,'stepparent',8)];
  const firstEvents=processFamilyConflictYear(tension);
  verify(firstEvents===1,'low family affinity creates a visible household-tension consequence');
  verify(tension.timeline.some(entry=>entry.category==='family'&&entry.text.includes('spilled into')),'household tension is visible in family history');
  const firstMemoryCount=tensionParent.memories.filter(memory=>memory.kind.startsWith('family_household_tension:')).length;
  processFamilyConflictYear(tension);
  tension.currentYear+=1;processFamilyConflictYear(tension);
  verify(tensionParent.memories.filter(memory=>memory.kind.startsWith('family_household_tension:')).length===firstMemoryCount,'family tension respects its two-year cooldown instead of spamming every simulation pass');

  const separation=emptyAdult('family-conflict-5');separation.seed='family-conflict-5';separation.rngCounter=0;
  const hostileParent=makeNpc(separation,'hostile-parent','Taylor','married',['aggressive','reckless']);const hostileStep=makeNpc(separation,'hostile-step','Sam','married',['aggressive','reckless']);hostileParent.partnerId=hostileStep.id;hostileStep.partnerId=hostileParent.id;separation.npcs[hostileParent.id]=hostileParent;separation.npcs[hostileStep.id]=hostileStep;
  separation.relationships=[relation('hostile-parent-rel',hostileParent.id,'parent',0),relation('hostile-step-rel',hostileStep.id,'stepparent',0)];
  processFamilyConflictYear(separation);separation.currentYear+=2;processFamilyConflictYear(separation);
  verify(hostileParent.maritalStatus==='divorced'&&hostileStep.maritalStatus==='divorced','sustained severe family conflict can contribute to an NPC-parent divorce');
  verify(!hostileParent.partnerId&&!hostileStep.partnerId,'family-conflict separation clears both NPC partnership pointers');
  verify(separation.timeline.some(entry=>entry.category==='family'&&entry.text.includes('divorced')),'a conflict-driven parent divorce is recorded in family history');

  return checks;
}
