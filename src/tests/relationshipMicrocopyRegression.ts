import type { RelationshipInteractionAction } from '../systems/RelationshipSystem';
import { interactWithNpc, relationshipInteractionText } from '../systems/RelationshipSystem';
import { createNewGame } from '../systems/CharacterSystem';

const cases:Array<{action:RelationshipInteractionAction;timeline:string;memory:string}>=[
  {action:'conversation',timeline:'You had a conversation with Nora.',memory:'Alex had a conversation with you.'},
  {action:'compliment',timeline:'You complimented Nora.',memory:'Alex complimented you.'},
  {action:'insult',timeline:'You insulted Nora.',memory:'Alex insulted you.'},
  {action:'spend_time',timeline:'You spent time with Nora.',memory:'Alex spent time with you.'},
  {action:'give_money',timeline:'You gave Nora some money.',memory:'Alex gave you some money.'},
  {action:'gift',timeline:'You gave Nora a gift.',memory:'Alex gave you a gift.'},
  {action:'ask_money',timeline:'You asked Nora for money.',memory:'Alex asked you for money.'},
  {action:'argue',timeline:'You argued with Nora.',memory:'Alex argued with you.'},
  {action:'apologize',timeline:'You apologized to Nora.',memory:'Alex apologized to you.'},
  {action:'prank',timeline:'You pranked Nora.',memory:'Alex pranked you.'},
  {action:'fight',timeline:'You fought with Nora.',memory:'Alex fought with you.'},
  {action:'counseling',timeline:'You went to counseling with Nora.',memory:'Alex went to counseling with you.'},
  {action:'vacation',timeline:'You went on vacation with Nora.',memory:'Alex went on vacation with you.'},
];

export function runRelationshipMicrocopyRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Relationship microcopy regression failed: ${message}`);}

  for(const item of cases){
    const copy=relationshipInteractionText(item.action,'Alex','Nora');
    verify(copy.timeline===item.timeline,`${item.action} timeline copy should be natural and action-specific`);
    verify(copy.memory===item.memory,`${item.action} NPC-memory copy should be natural and action-specific`);

    const state=createNewGame({seed:`microcopy-${item.action}`,countryId:'us'});
    state.character.firstName='Alex';state.character.age=30;state.currentYear=2056;state.finances.cash=10000;
    const rel=state.relationships[0]!;const npc=state.npcs[rel.npcId]!;
    npc.firstName='Nora';npc.age=50;npc.alive=true;npc.wealth=10000;npc.hiddenOpinion=70;rel.score=70;
    const beforeTimeline=state.timeline.length;const beforeMemories=npc.memories.length;
    const result=interactWithNpc(state,npc.id,item.action);
    verify(result.success,`${item.action} should preserve the existing successful interaction path`);
    verify(state.timeline.length===beforeTimeline+1&&state.timeline.at(-1)?.text===item.timeline,`${item.action} should write the polished timeline copy`);
    verify(npc.memories.length===beforeMemories+1&&npc.memories.at(-1)?.summary===item.memory,`${item.action} should write the polished NPC-memory copy`);
  }

  const broken=cases.flatMap(item=>[item.timeline,item.memory]).some(text=>/You (conversation|compliment|spend time|gift|apologize|prank|argue|insult) with /.test(text)||/chose to (conversation|compliment|spend time|gift|apologize|prank|argue|insult)/.test(text));
  verify(!broken,'polished copy set should not contain the old verb-template grammar defects');
  return checks;
}
