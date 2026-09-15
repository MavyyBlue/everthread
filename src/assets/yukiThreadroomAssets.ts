import type { YukiThreadroomReactionState } from '../systems/YukiThreadroomSystem';

export type YukiThreadroomArtTier='mobile'|'master';
export type YukiThreadroomLighting='day'|'evening';
export type YukiThreadroomIconName='aster'|'back'|'sun'|'moon'|'talk'|'tea'|'heart'|'listen'|'memory'|'profile'|'quiet';

const ROOT='./yuki-threadroom';

export const YUKI_THREADROOM_REACTIVE_STATES:readonly YukiThreadroomReactionState[]=[
  'yuki.idle',
  'yuki.blink-half',
  'yuki.blink-closed',
  'yuki.talk-small',
  'yuki.talk-open',
  'yuki.playful-wink',
  'yuki.warm-blush',
  'yuki.focused',
  'yuki.concerned',
  'yuki.delighted',
  'yuki.talk-small-blink',
  'yuki.talk-open-blink',
] as const;

export function yukiThreadroomBaseAsset(tier:YukiThreadroomArtTier):string{
  return `${ROOT}/character/${tier}/yuki.idle.png`;
}

export function yukiThreadroomPatchAsset(tier:YukiThreadroomArtTier,state:YukiThreadroomReactionState):string{
  const folder=tier==='mobile'?'patches-mobile':'patches';
  return `${ROOT}/character/${folder}/${state}.png`;
}

export function yukiThreadroomRoomAsset(lighting:YukiThreadroomLighting,tier:YukiThreadroomArtTier):string{
  return `${ROOT}/room/yuki-room.${lighting}${tier==='mobile'?'-mobile':''}.png`;
}

export const YUKI_THREADROOM_ICONS:Readonly<Record<YukiThreadroomIconName,string>>={
  aster:`${ROOT}/icons/yuki.aster.default.svg`,
  back:`${ROOT}/icons/yuki.back.default.svg`,
  sun:`${ROOT}/icons/yuki.sun.default.svg`,
  moon:`${ROOT}/icons/yuki.moon.default.svg`,
  talk:`${ROOT}/icons/yuki.talk.default.svg`,
  tea:`${ROOT}/icons/yuki.tea.default.svg`,
  heart:`${ROOT}/icons/yuki.heart.default.svg`,
  listen:`${ROOT}/icons/yuki.listen.default.svg`,
  memory:`${ROOT}/icons/yuki.memory.default.svg`,
  profile:`${ROOT}/icons/yuki.profile.default.svg`,
  quiet:`${ROOT}/icons/yuki.quiet.default.svg`,
};
