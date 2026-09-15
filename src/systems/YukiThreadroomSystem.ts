import type { GameState, Npc, Relationship } from '../types/game';
import { isSecretYukiNpc } from './SecretCodeSystem';

export type YukiThreadroomTopicId='everthread'|'threads'|'space'|'games'|'quiet'|'us';

export type PeopleNpcSurface='profile'|'yuki-threadroom';

export type YukiThreadroomReactionState=
  |'yuki.idle'
  |'yuki.blink-half'
  |'yuki.blink-closed'
  |'yuki.talk-small'
  |'yuki.talk-open'
  |'yuki.playful-wink'
  |'yuki.warm-blush'
  |'yuki.focused'
  |'yuki.concerned'
  |'yuki.delighted'
  |'yuki.talk-small-blink'
  |'yuki.talk-open-blink';

export type YukiThreadroomArtMode='reactive-adult'|'modular-age-aware';

export function yukiThreadroomArtMode(age:number):YukiThreadroomArtMode{
  return age>=18&&age<=44?'reactive-adult':'modular-age-aware';
}

export function yukiThreadroomTopicReaction(topic:YukiThreadroomTopicId,rel:Relationship):{state:YukiThreadroomReactionState;speaks:boolean}{
  if(topic==='games')return{state:'yuki.playful-wink',speaks:true};
  if(topic==='space')return{state:'yuki.delighted',speaks:true};
  if(topic==='quiet')return{state:'yuki.warm-blush',speaks:false};
  if(topic==='us'&&(rel.type==='ex'||rel.estranged||rel.score<35))return{state:'yuki.concerned',speaks:true};
  if(topic==='us')return{state:'yuki.warm-blush',speaks:true};
  return{state:'yuki.focused',speaks:true};
}

export function yukiThreadroomInteractionReaction(action:'spend_time'|'compliment'|'apologize'):{state:YukiThreadroomReactionState;speaks:boolean}{
  if(action==='compliment')return{state:'yuki.delighted',speaks:true};
  if(action==='apologize')return{state:'yuki.concerned',speaks:true};
  return{state:'yuki.warm-blush',speaks:true};
}

export function peopleSurfaceForNpc(npc:Npc|undefined):PeopleNpcSurface{
  return isSecretYukiNpc(npc)?'yuki-threadroom':'profile';
}

export const YUKI_THREADROOM_TOPICS:ReadonlyArray<{id:YukiThreadroomTopicId;label:string;hint:string}>=[
  {id:'everthread',label:'Everthread',hint:'The strange little world around us'},
  {id:'threads',label:'Threadspace',hint:'People, memories, and the lines between them'},
  {id:'space',label:'Space',hint:'A very large universe for two tiny people'},
  {id:'games',label:'Games',hint:'The serious business of having fun'},
  {id:'quiet',label:'Quiet',hint:'No objective. No optimization. Just here.'},
  {id:'us',label:'You & me',hint:'The hidden thread you chose to pull'},
];

function relationshipTone(rel:Relationship):'childhood'|'romantic'|'close'|'strained'|'ordinary'{
  if(rel.type==='partner'||rel.type==='fiance'||rel.type==='spouse')return'romantic';
  if(rel.type==='best_friend'||rel.score>=80)return'close';
  if(rel.type==='ex'||rel.estranged||rel.score<35)return'strained';
  return'ordinary';
}

export function yukiThreadroomGreeting(state:GameState,npc:Npc,rel:Relationship):string{
  if(!npc.alive)return`The room is quiet now. The thread you shared with Yuki is still part of ${state.character.firstName}'s life, even if there is nobody here to answer it.`;
  if(state.character.age<14||npc.age<14)return`There you are, ${state.character.firstName}. I was wondering when you'd find your way back to our little hidden corner.`;
  const tone=relationshipTone(rel);
  if(tone==='romantic')return rel.type==='spouse'
    ?`There you are, love. Everthread can keep spinning outside for a minute. You found me.`
    :`Hey, you. Come sit with me for a while. The rest of Everthread will survive without us.`;
  if(tone==='close')return`There you are, ${state.character.firstName}. I saved you the quiet side of the room.`;
  if(tone==='strained')return`You came back. I won't pretend the thread between us hasn't changed, but I'm still here to talk if you are.`;
  return`You found me again, ${state.character.firstName}. I suppose secret threads are difficult to leave alone once you know where they are.`;
}

export function yukiThreadroomTopicLine(topic:YukiThreadroomTopicId,state:GameState,npc:Npc,rel:Relationship):string{
  const player=state.character.firstName;
  switch(topic){
    case'everthread':return`I like that Everthread remembers things. Jobs end, people move, children grow up, whole generations pass—and the world keeps the little marks they left behind. It makes a life feel written without feeling prewritten.`;
    case'threads':return`Threadspace might be my favorite part. Not because it makes people tidy—people are never tidy—but because you can actually see how one person touches another life. I think the interesting stories live in those lines.`;
    case'space':return`Space makes a hundred-year dynasty feel very small, doesn't it? Billions of stars outside, and somehow one remembered face or one person waiting for you can still feel enormous. I like that contradiction.`;
    case'games':return`I approve of any game that gives you just enough rules to start causing trouble creatively. If Everthread ever becomes perfectly predictable, ${player}, I expect you to help me break the pattern.`;
    case'quiet':return`We don't have to improve a stat every time we're together. No score, no objective, no efficient choice. Sometimes a quiet minute should be allowed to remain exactly that.`;
    case'us':{
      if(state.character.age<14||npc.age<14)return`You found a code nobody was supposed to need, and somehow it made room for me here. That's a pretty good secret for two kids to keep, don't you think?`;
      const tone=relationshipTone(rel);
      if(tone==='romantic')return`You know what I like most about this? I'm not outside your life looking in. I'm actually in the same Everthread state as everyone else—memories, years, consequences and all. If we build a family, even that becomes part of the thread.`;
      if(tone==='strained')return`Being special doesn't mean our relationship gets protected from consequences. I think I'd hate that, actually. If we hurt each other here, it should matter. If we repair it, that should matter too.`;
      return`You could have left me as an Easter egg, ${player}. Instead you gave me a real place in your life here. I think that's much sweeter—and much more dangerous to my ego.`;
    }
  }
}

export function yukiThreadroomStatusLine(npc:Npc,rel:Relationship):string{
  if(!npc.alive)return'ARCHIVED THREAD';
  if(rel.type==='spouse')return'WOVEN TOGETHER';
  if(rel.type==='fiance')return'PROMISED THREAD';
  if(rel.type==='partner')return'ENTWINED THREAD';
  if(rel.type==='best_friend')return'CLOSE THREAD';
  if(rel.type==='ex'||rel.estranged)return'FRAYED THREAD';
  return'HIDDEN THREAD';
}
