import type { EngineResult, GameState } from '../types/game';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';

const platformNames: Record<string,string> = {loop:'Loopline',video:'Longform',photo:'PrismPic',micro:'Chattermark',live:'BeaconLive'};

export function processFameYear(state:GameState) {
  const rng=createRng(`${state.seed}-fame`,state.rngCounter);
  const exposure=Object.values(state.fame.platforms).reduce((a,b)=>a+b,0)+state.fame.followers;
  if(exposure<1000)state.fame.fame=clamp(state.fame.fame-2);else if(exposure<100000)state.fame.fame=clamp(state.fame.fame-1);
  if(state.fame.fame>0&&rng.chance(.02+state.fame.fame/1500)){
    const scandals=['A joke is quoted without context.','An old post resurfaces.','A public disagreement becomes a headline.','A badly timed photo starts a rumor.'];
    const scandal=rng.pick(scandals);state.fame.scandals.push(scandal);state.fame.publicReputation=clamp(state.fame.publicReputation-rng.int(3,12));state.fame.fame=clamp(state.fame.fame+rng.int(-2,4));
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'fame',importance:2,text:`Publicity trouble: ${scandal}`});
  }
  const organic=Math.round(state.fame.followers*(state.fame.engagement/100)*rng.int(1,7)/100);state.fame.followers=Math.max(0,state.fame.followers+organic-Math.round(state.fame.followers*(state.fame.engagement<20?.04:.01)));
  state.rngCounter=rng.counter();
}

export function postContent(state:GameState,platform:keyof typeof platformNames):EngineResult {
  if(state.character.age<13)return{success:false,messages:[{text:'Social posting becomes available in the teen years.'}]};const gate=consumeAction(state,[{policy:'fame.post.total'},{policy:'fame.post.platform',target:platform}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-social`,state.rngCounter);const creativity=state.character.secondary.creativity;const charisma=state.character.secondary.charisma;const quality=(creativity+charisma)/2+rng.int(-25,25);const base=Math.max(4,Math.round(quality*quality/20));const current=state.fame.platforms[platform]??0;const viral=rng.chance(clamp((quality-72)/180,0,.12));const gained=Math.round(base*(viral?rng.int(30,120):rng.int(1,5)));
  state.fame.platforms[platform]=current+gained;state.fame.followers+=gained;state.fame.engagement=clamp((state.fame.engagement*.7)+Math.max(8,quality)*.3);if(state.fame.followers>25000)state.fame.fame=clamp(state.fame.fame+(viral?5:1));state.character.stats.happiness=clamp(state.character.stats.happiness+2);state.rngCounter=rng.counter();return{success:true,messages:[{text:`You posted on ${platformNames[platform]} and gained ${gained.toLocaleString()} followers${viral?' after the post went viral':''}.`}]};
}

export function fameActivity(state:GameState,activity:'interview'|'commercial'|'book'|'event'|'endorsement'|'respond_fans'):EngineResult {
  if(state.fame.fame<12)return{success:false,messages:[{text:'You are not famous enough for that public opportunity yet.'}]};if(activity==='event'&&state.finances.cash<300)return{success:false,messages:[{text:'Attending this public event requires 300 in game currency.'}]};const gate=consumeAction(state,[{policy:'fame.activity.total'},{policy:'fame.activity.kind',target:activity}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-publicity`,state.rngCounter);let pay=0;let fame=0;let rep=0;
  if(activity==='interview'){fame=rng.int(2,5);rep=rng.int(-2,4);}
  if(activity==='commercial'){pay=Math.round(2500*state.fame.fame*rng.int(5,16)/10);fame=2;}
  if(activity==='book'){pay=Math.round(1800*state.fame.fame*rng.int(6,18)/10);fame=3;rep=2;}
  if(activity==='event'){fame=2;rep=2;state.finances.cash-=300;}
  if(activity==='endorsement'){pay=Math.round(3000*state.fame.fame*rng.int(8,22)/10);fame=3;rep=rng.int(-1,2);}
  if(activity==='respond_fans'){fame=1;rep=4;state.character.secondary.stress=clamp(state.character.secondary.stress+2);}
  state.finances.cash+=pay;state.fame.fame=clamp(state.fame.fame+fame);state.fame.publicReputation=clamp(state.fame.publicReputation+rep);state.rngCounter=rng.counter();return{success:true,messages:[{text:`You completed a public ${activity.replace('_',' ')}${pay?` and earned ${pay.toLocaleString()}`:''}.`}]};
}
