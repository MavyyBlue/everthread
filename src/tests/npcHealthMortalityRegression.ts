import type { GameState, Npc, Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { illnesses } from '../data/illnesses';
import { validateState } from '../core/invariants';
import {
  ensureNpcLife,
  npcHealthIsTerminal,
  npcMortalityChance,
  processNpcLives,
  repairLegacyLivingNpcHealth,
} from '../systems/NpcLifeSystem';
import { exportSave, importSave } from '../services/SaveSystem';

function isolatedState(seed:string){
  const state=createNewGame({seed});
  state.character.age=30;
  state.currentYear=2056;
  state.npcs={};
  state.relationships=[];
  state.timeline=[];
  state.legacy.familyTreeNpcIds=[];
  return state;
}

function fixtureNpc(state:GameState,id:string,age=30,health=80):Npc{
  return {
    id,firstName:'Morgan',lastName:'Fixture',age,alive:true,health,happiness:75,wealth:0,
    countryId:state.character.countryId,city:state.character.city,sexuality:'pansexual',fertility:60,maritalStatus:'single',
    traits:['responsible'],hiddenOpinion:50,memories:[],parentIds:[],childIds:[],simulationTier:'full',
  };
}

function addNpc(state:GameState,npc:Npc,relationship?:Relationship){
  state.npcs[npc.id]=npc;
  if(relationship)state.relationships.push(relationship);
  ensureNpcLife(state,npc);
  return npc;
}

function alive(state:GameState,id:string){return state.npcs[id]?.alive===true;}
function health(state:GameState,id:string){return state.npcs[id]?.health;}
function maritalStatus(state:GameState,id:string){return state.npcs[id]?.maritalStatus;}
function partnerId(state:GameState,id:string){return state.npcs[id]?.partnerId;}
function deathEntries(state:GameState,id:string){return state.timeline.filter(entry=>entry.npcIds?.includes(id)&&entry.text.includes('died')).length;}

export function runNpcHealthMortalityRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`NPC health / mortality regression failed: ${message}`);}

  verify(npcHealthIsTerminal({health:0}),'zero NPC health should be terminal');
  verify(!npcHealthIsTerminal({health:1}),'positive NPC health should remain a potentially survivable state');

  const validationState=isolatedState('npc-health-validation');
  const validationNpc=addNpc(validationState,fixtureNpc(validationState,'validation-npc',40,80));
  validationNpc.health=0;
  verify(validateState(validationState).some(error=>error.includes('alive with terminal health')),'state validation should detect a living NPC at terminal health');

  const directRepairState=isolatedState('npc-health-direct-repair');
  const directRepairNpc=addNpc(directRepairState,fixtureNpc(directRepairState,'direct-repair',55,80));
  directRepairNpc.health=0;
  verify(repairLegacyLivingNpcHealth(directRepairState)===1&&alive(directRepairState,directRepairNpc.id)&&health(directRepairState,directRepairNpc.id)===1,'legacy vitality repair should preserve a living zero-health NPC at critical health 1 instead of killing during load');

  const importState=isolatedState('npc-health-import-repair');
  const importedNpc=addNpc(importState,fixtureNpc(importState,'import-repair',61,80));
  importedNpc.health=0;
  const restored=importSave(exportSave(importState));
  verify(restored.saveVersion===11&&alive(restored,importedNpc.id)&&health(restored,importedNpc.id)===1,'current-schema load should repair legacy living zero health without a schema bump');
  verify(!validateState(restored).some(error=>error.includes('alive with terminal health')),'repaired current-schema save should validate without a living-terminal-health contradiction');

  const deadImportState=isolatedState('npc-health-dead-preserve');
  const deadNpc=addNpc(deadImportState,fixtureNpc(deadImportState,'dead-preserve',72,80));
  deadNpc.health=0;deadNpc.alive=false;
  const restoredDead=importSave(exportSave(deadImportState));
  verify(!alive(restoredDead,deadNpc.id)&&health(restoredDead,deadNpc.id)===0,'load repair must not alter the health of an NPC who was already dead');

  const terminalState=isolatedState('npc-health-terminal-parent');
  terminalState.character.age=35;
  const parent=fixtureNpc(terminalState,'terminal-parent',64,80);parent.childIds=[terminalState.character.id];parent.wealth=10000;
  addNpc(terminalState,parent,{id:'terminal-parent-rel',npcId:parent.id,type:'parent',score:90,attraction:0,compatibility:80,yearsKnown:35});
  parent.life!.finance.propertyValue=0;parent.life!.finance.debt=0;parent.health=0;
  const cashBefore=terminalState.finances.cash;
  processNpcLives(terminalState);
  verify(!alive(terminalState,parent.id)&&health(terminalState,parent.id)===0,'a living NPC entering yearly simulation at zero health should die deterministically through NPC death cleanup');
  verify(deathEntries(terminalState,parent.id)===1,'terminal NPC death should produce one family-relevant death timeline entry');
  verify(terminalState.finances.cash>cashBefore&&Number(terminalState.flags.inheritanceReceived??0)>0,'terminal death should still execute ordinary NPC inheritance cleanup');
  const cashAfterDeath=terminalState.finances.cash;const inheritanceAfterDeath=Number(terminalState.flags.inheritanceReceived??0);const timelineAfterDeath=deathEntries(terminalState,parent.id);
  processNpcLives(terminalState);
  verify(terminalState.finances.cash===cashAfterDeath&&Number(terminalState.flags.inheritanceReceived??0)===inheritanceAfterDeath&&deathEntries(terminalState,parent.id)===timelineAfterDeath,'already-dead NPCs must not duplicate inheritance or death processing on later years');

  const backgroundState=isolatedState('npc-health-background-terminal');
  const background=fixtureNpc(backgroundState,'background-terminal',78,.5);background.simulationTier='background';
  addNpc(backgroundState,background);background.life!.health.conditions=[];
  processNpcLives(backgroundState);
  verify(!alive(backgroundState,background.id)&&health(backgroundState,background.id)===0,'coarse background odd-year health drain must still resolve terminal health instead of skipping mortality entirely');

  let criticalSurvivorHealth:number|undefined;
  for(let index=0;index<40&&!criticalSurvivorHealth;index+=1){
    const criticalState=isolatedState(`npc-health-critical-survival-${index}`);
    const critical=fixtureNpc(criticalState,`critical-${index}`,30,5);
    addNpc(criticalState,critical);critical.life!.health.conditions=[];
    processNpcLives(criticalState);
    if(alive(criticalState,critical.id))criticalSurvivorHealth=health(criticalState,critical.id);
  }
  verify(typeof criticalSurvivorHealth==='number'&&criticalSurvivorHealth>0,'severe but positive health should remain survivable rather than becoming an automatic death threshold');

  const riskState=isolatedState('npc-health-risk-curve');
  const young=addNpc(riskState,fixtureNpc(riskState,'risk-young',40,50));young.life!.health.conditions=[];
  const old=addNpc(riskState,fixtureNpc(riskState,'risk-old',85,50));old.life!.health.conditions=[];
  verify(npcMortalityChance(old)>npcMortalityChance(young),'NPC mortality probability should rise with advanced age at equal health and condition state');

  const illnessState=isolatedState('npc-health-illness-risk');
  const healthyRisk=addNpc(illnessState,fixtureNpc(illnessState,'risk-healthy',60,50));healthyRisk.life!.health.conditions=[];
  const illRisk=addNpc(illnessState,fixtureNpc(illnessState,'risk-ill',60,50));illRisk.life!.health.conditions=[];
  const cardiovascular=illnesses.find(item=>item.id==='cardiovascular_disease');
  verify(!!cardiovascular,'mortality fixture requires the cardiovascular disease definition');
  illRisk.life!.health.conditions.push({illnessId:cardiovascular.id,name:cardiovascular.name,severity:70,diagnosedAge:59,chronic:true,treated:false,years:1});
  verify(npcMortalityChance(illRisk)>npcMortalityChance(healthyRisk),'serious illness should add mortality pressure beyond age and raw health alone');

  const spouseState=isolatedState('npc-health-spouse-cleanup');
  const dyingSpouse=fixtureNpc(spouseState,'dying-spouse',70,80);const survivor=fixtureNpc(spouseState,'surviving-spouse',69,88);
  dyingSpouse.partnerId=survivor.id;survivor.partnerId=dyingSpouse.id;dyingSpouse.maritalStatus='married';survivor.maritalStatus='married';
  addNpc(spouseState,dyingSpouse);addNpc(spouseState,survivor);
  survivor.life!.legal.sentenceRemaining=5;survivor.imprisoned=true;dyingSpouse.health=0;
  processNpcLives(spouseState);
  verify(!alive(spouseState,dyingSpouse.id)&&maritalStatus(spouseState,survivor.id)==='widowed'&&partnerId(spouseState,survivor.id)===undefined,'terminal NPC death should preserve ordinary surviving-spouse widowhood and partnership cleanup');

  const illnessTerminalState=isolatedState('npc-health-illness-terminal');
  const illnessTerminal=fixtureNpc(illnessTerminalState,'illness-terminal',50,1);
  addNpc(illnessTerminalState,illnessTerminal);
  illnessTerminal.life!.health.conditions=[{illnessId:cardiovascular.id,name:cardiovascular.name,severity:80,diagnosedAge:49,chronic:true,treated:false,years:1}];
  processNpcLives(illnessTerminalState);
  verify(!alive(illnessTerminalState,illnessTerminal.id)&&health(illnessTerminalState,illnessTerminal.id)===0,'illness drain that reaches zero during health processing should resolve death in the same simulated year');

  return checks;
}
