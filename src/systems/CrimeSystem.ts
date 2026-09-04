import { crimeById, crimes } from '../data/crimes';
import type { EngineResult, GameState } from '../types/game';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';

export function availableCrimes(state:GameState){return crimes.filter(c=>state.character.age>=c.minAge);}

export function commitCrime(state:GameState,crimeId:string):EngineResult {
  const crime=crimeById[crimeId];if(!crime)return{success:false,messages:[{text:'Unknown crime.'}]};if(state.character.age<crime.minAge)return{success:false,messages:[{text:'That crime is not available at your age.'}]};if(state.legal.imprisoned&&crimeId!=='prison_contraband'&&crimeId!=='escape_attempt')return{success:false,messages:[{text:'That action is unavailable while imprisoned.'}]};if(state.flags.pendingCharge)return{success:false,messages:[{text:'Resolve your current criminal case before creating another major incident.'}]};
  const gate=consumeAction(state,[{policy:'crime.total'},{policy:'crime.kind',target:crimeId}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  const rng=createRng(`${state.seed}-crime`,state.rngCounter);const aptitude=state.character.talents.crime/100;const notorietyPenalty=state.character.secondary.criminalNotoriety/260;const successChance=clamp((crime.baseSuccess+aptitude*.22-notorietyPenalty)*100,5,92)/100;const success=rng.chance(successChance);
  let reward=0;if(success&&crime.rewardRange[1]>0){reward=rng.int(crime.rewardRange[0],crime.rewardRange[1]);state.finances.cash+=reward;}
  const injured=rng.chance(crime.injuryChance*(success?.7:1.2));if(injured){const damage=rng.int(4,20);state.character.stats.health=clamp(state.character.stats.health-damage);}
  state.character.secondary.criminalNotoriety=clamp(state.character.secondary.criminalNotoriety+crime.notoriety*(success?.45:.7));state.character.secondary.karma-=Math.max(1,Math.round(crime.notoriety/5));
  const detected=rng.chance(clamp((crime.detectionChance+(success?0:.14)+state.character.secondary.criminalNotoriety/240)*100,4,96)/100);
  state.legal.criminalRecord.push({crimeId,age:state.character.age,convicted:false});
  let text=success?`You committed ${crime.name.toLowerCase()}${reward?` and gained ${reward.toLocaleString()}`:''}.`:`Your attempt at ${crime.name.toLowerCase()} failed.`;
  if(injured)text+=' You were injured in the process.';
  if(detected){state.legal.investigationHeat=clamp(state.legal.investigationHeat+crime.notoriety);state.flags.pendingCharge=crimeId;text+=' Authorities connected you to the incident.';}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'crime',importance:detected?3:2,text,moneyDelta:reward});state.rngCounter=rng.counter();
  return{success,messages:[{text}],stateChanges:detected?['pendingCharge']:undefined};
}

export function resolveLegalCase(state:GameState,lawyer:'public'|'budget'|'experienced'|'elite',plea:'contest'|'plead'):EngineResult {
  const crimeId=String(state.flags.pendingCharge??'');const crime=crimeById[crimeId];if(!crime)return{success:false,messages:[{text:'There is no pending criminal case.'}]};
  const lawyerSkill={public:.18,budget:.26,experienced:.42,elite:.58}[lawyer];const cost={public:0,budget:900,experienced:7500,elite:35000}[lawyer];if(state.finances.cash<cost)return{success:false,messages:[{text:`You cannot afford this lawyer (${cost.toLocaleString()}).`}]};state.finances.cash-=cost;
  const rng=createRng(`${state.seed}-legal`,state.rngCounter);const evidence=clamp(crime.detectionChance+.18+state.legal.investigationHeat/250,0,1);const prior=state.legal.criminalRecord.filter(r=>r.convicted).length*.045;let convictionChance=clamp((evidence-lawyerSkill+prior-(plea==='plead'?.12:0))*100,7,94)/100;const convicted=rng.chance(convictionChance);const record=[...state.legal.criminalRecord].reverse().find(r=>r.crimeId===crimeId&&!r.convicted);if(record)record.convicted=convicted;
  delete state.flags.pendingCharge;state.legal.investigationHeat=clamp(state.legal.investigationHeat-(convicted?5:18));let text='';
  if(convicted){const years=Math.max(0,rng.int(crime.sentenceRange[0],crime.sentenceRange[1])-(plea==='plead'?1:0));if(record)record.sentenceYears=years;if(years>0){state.legal.imprisoned=true;state.legal.sentenceRemaining=years;state.legal.prisonSecurity=years>=10?'maximum':years>=5?'medium':'minimum';state.legal.paroleEligible=years>=2;}text=years>0?`You were convicted and sentenced to ${years} year${years===1?'':'s'} in prison.`:'You were convicted and received a non-custodial sentence.';state.character.stats.happiness=clamp(state.character.stats.happiness-(years>0?18:8));}
  else{text='You were not convicted.';state.character.stats.happiness=clamp(state.character.stats.happiness+7);}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'legal',importance:3,text});state.rngCounter=rng.counter();return{success:!convicted,messages:[{text}]};
}

export function processLegalYear(state:GameState){
  if(state.legal.imprisoned){state.legal.sentenceRemaining=Math.max(0,state.legal.sentenceRemaining-1);state.character.stats.happiness=clamp(state.character.stats.happiness-3);state.character.secondary.stress=clamp(state.character.secondary.stress+2);
    if(state.legal.sentenceRemaining<=0){state.legal.imprisoned=false;state.legal.prisonSecurity=undefined;state.legal.paroleEligible=false;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'legal',importance:3,text:'You completed your prison sentence and were released.'});}
  }
  state.legal.investigationHeat=clamp(state.legal.investigationHeat-3);
}

export function prisonActivity(state:GameState,activity:'exercise'|'work'|'befriend'|'behave'|'trouble'|'appeal'):EngineResult {
  if(!state.legal.imprisoned)return{success:false,messages:[{text:'You are not in prison.'}]};if(activity==='appeal'&&state.finances.cash<2500)return{success:false,messages:[{text:'You cannot afford an appeal.'}]};const gate=consumeAction(state,[{policy:'prison.total'},{policy:'prison.kind',target:activity}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-prison`,state.rngCounter);let text='';
  if(activity==='exercise'){state.health.fitness=clamp(state.health.fitness+5);state.character.secondary.athleticism=clamp(state.character.secondary.athleticism+2);text='You exercised in prison.';}
  if(activity==='work'){const pay=rng.int(5,35);state.finances.cash+=pay;state.character.secondary.discipline=clamp(state.character.secondary.discipline+2);text=`You worked a prison job and earned ${pay}.`;}
  if(activity==='befriend'){state.character.stats.happiness=clamp(state.character.stats.happiness+2);state.character.secondary.charisma=clamp(state.character.secondary.charisma+2);text='You made an effort to get along with other prisoners.';}
  if(activity==='behave'){state.character.secondary.reputation=clamp(state.character.secondary.reputation+2);if(state.legal.paroleEligible&&rng.chance(.22)){state.legal.sentenceRemaining=Math.max(0,state.legal.sentenceRemaining-1);text='Your good behavior earned sentence credit.';}else text='You kept your head down and behaved.';}
  if(activity==='trouble'){state.character.secondary.criminalNotoriety=clamp(state.character.secondary.criminalNotoriety+4);if(rng.chance(.45)){state.legal.sentenceRemaining+=1;text='You started trouble and had a year added to your sentence.';}else text='You started trouble and avoided extra time this time.';}
  if(activity==='appeal'){const cost=2500;state.finances.cash-=cost;if(rng.chance(.18)){state.legal.sentenceRemaining=Math.max(0,Math.floor(state.legal.sentenceRemaining*.6));text='Your appeal reduced the remaining sentence.';}else text='Your appeal was denied.';}
  state.rngCounter=rng.counter();return{success:true,messages:[{text}]};
}

export function attemptEscape(state:GameState,score:number):EngineResult {
  if(!state.legal.imprisoned)return{success:false,messages:[{text:'You are not imprisoned.'}]};const gate=consumeAction(state,{policy:'prison.escape'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-escape`,state.rngCounter);const security={juvenile:20,minimum:35,medium:55,maximum:72}[state.legal.prisonSecurity??'minimum'];const success=rng.chance(clamp(score+state.character.talents.crime*.25+state.character.secondary.athleticism*.15-security,5,80)/100);
  if(success){state.legal.imprisoned=false;state.flags.fugitive=true;state.character.secondary.criminalNotoriety=clamp(state.character.secondary.criminalNotoriety+15);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'legal',importance:3,text:'You escaped from custody and became a fugitive.'});}
  else{state.legal.sentenceRemaining+=rng.int(1,4);state.character.stats.health=clamp(state.character.stats.health-rng.int(0,8));}
  state.rngCounter=rng.counter();return{success,messages:[{text:success?'You escaped. The game now tracks your fugitive status.':'The escape failed and your sentence increased.'}]};
}
