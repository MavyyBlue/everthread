import {
  YUKI_THREADROOM_ICONS,
  YUKI_THREADROOM_REACTIVE_STATES,
  yukiThreadroomBaseAsset,
  yukiThreadroomPatchAsset,
  yukiThreadroomRoomAsset,
} from '../assets/yukiThreadroomAssets';
import { createNewGame } from '../systems/CharacterSystem';
import { redeemSecretCode, YUKI_SECRET_CODE } from '../systems/SecretCodeSystem';
import {
  yukiThreadroomArtMode,
  yukiThreadroomInteractionReaction,
  yukiThreadroomTopicReaction,
} from '../systems/YukiThreadroomSystem';

export function runYukiThreadroomArtRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Yuki Threadroom art regression failed: ${message}`);}

  verify(yukiThreadroomArtMode(0)==='modular-age-aware','newborn Yuki must use the age-aware fallback instead of the age-30 painted sprite');
  verify(yukiThreadroomArtMode(17)==='modular-age-aware','child and teen Yuki must not use the adult painted room sprite');
  verify(yukiThreadroomArtMode(18)==='reactive-adult'&&yukiThreadroomArtMode(44)==='reactive-adult','adult stage should use the reactive painted Yuki sprite');
  verify(yukiThreadroomArtMode(45)==='modular-age-aware'&&yukiThreadroomArtMode(65)==='modular-age-aware','mature and elder Yuki must fall back to age-aware modular portrait art until matching painted variants exist');

  verify(YUKI_THREADROOM_REACTIVE_STATES.length===12&&new Set(YUKI_THREADROOM_REACTIVE_STATES).size===12,'reactive controller must expose the twelve coordinated artwork states exactly once');
  verify(yukiThreadroomBaseAsset('mobile').endsWith('/character/mobile/yuki.idle.png')&&yukiThreadroomBaseAsset('master').endsWith('/character/master/yuki.idle.png'),'mobile and master bases should resolve to separate size tiers');
  verify(yukiThreadroomPatchAsset('mobile','yuki.warm-blush').endsWith('/character/patches-mobile/yuki.warm-blush.png'),'mobile expression should use the mobile face-patch tier');
  verify(yukiThreadroomPatchAsset('master','yuki.talk-open-blink').endsWith('/character/patches/yuki.talk-open-blink.png'),'master speaking blink should use the master face-patch tier');
  verify(yukiThreadroomRoomAsset('day','mobile').endsWith('/room/yuki-room.day-mobile.png')&&yukiThreadroomRoomAsset('evening','master').endsWith('/room/yuki-room.evening.png'),'room lighting should preserve matched mobile/master background variants');
  verify(Object.keys(YUKI_THREADROOM_ICONS).length===11&&Object.values(YUKI_THREADROOM_ICONS).every(path=>path.endsWith('.svg')),'Threadroom controls should use the compact editable SVG icon set rather than loading raster icon families');

  const state=createNewGame({seed:'yuki-threadroom-art',sandbox:true});state.character.age=24;redeemSecretCode(state,YUKI_SECRET_CODE);
  const yuki=Object.values(state.npcs).find(npc=>npc.firstName==='Yuki'&&npc.lastName==='Aster')!;
  const rel=state.relationships.find(item=>item.npcId===yuki.id)!;
  const before=JSON.stringify(state);const rngBefore=state.rngCounter;
  verify(yukiThreadroomTopicReaction('games',rel).state==='yuki.playful-wink','games topic should map to the playful reaction without touching simulation state');
  verify(yukiThreadroomTopicReaction('space',rel).state==='yuki.delighted','space topic should map to the delighted reaction');
  verify(yukiThreadroomTopicReaction('quiet',rel).state==='yuki.warm-blush'&&!yukiThreadroomTopicReaction('quiet',rel).speaks,'quiet topic should be a warm static moment rather than animated speech');
  verify(yukiThreadroomTopicReaction('everthread',rel).state==='yuki.focused'&&yukiThreadroomTopicReaction('threads',rel).state==='yuki.focused','world and Threadspace topics should use the focused listening/talking state');
  verify(yukiThreadroomInteractionReaction('spend_time').state==='yuki.warm-blush','ordinary spend-time success should map to warmth');
  verify(yukiThreadroomInteractionReaction('compliment').state==='yuki.delighted','ordinary compliment success should map to delight');
  verify(yukiThreadroomInteractionReaction('apologize').state==='yuki.concerned','ordinary apology success should map to concern/listening');
  verify(JSON.stringify(state)===before&&state.rngCounter===rngBefore,'pure Threadroom presentation selection must consume no gameplay RNG or hidden simulation state');
  rel.type='ex';rel.score=20;
  verify(yukiThreadroomTopicReaction('us',rel).state==='yuki.concerned','strained relationship context should make the You & me topic visually concerned instead of blindly affectionate');

  return checks;
}
