import { illnesses, illnessById } from '../data/illnesses';
import type { EngineResult, GameState } from '../types/game';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';

export function processHealthYear(state:GameState) {
  const rng=createRng(`${state.seed}-health`,state.rngCounter); const age=state.character.age;
  const agingDrain=age<40?0:age<60?.5:age<75?1.2:age<90?2.3:3.7;
  const stressDrain=state.character.secondary.stress>70?1.5:state.character.secondary.stress>45?.5:0;
  const fitnessBenefit=(state.health.fitness-50)/65;
  state.character.stats.health=clamp(state.character.stats.health-agingDrain-stressDrain+fitnessBenefit+rng.int(-1,1));
  state.health.fitness=clamp(state.health.fitness-(age>50?1:0)+rng.int(-1,1));
  state.health.wellness=clamp(state.health.wellness+(state.character.stats.happiness-50)/45-(state.character.secondary.stress-40)/50+rng.int(-2,2));

  for(const condition of state.health.conditions){
    const def=illnessById[condition.illnessId]; if(!def)continue;
    const drain=def.healthDrain*(condition.severity/100)*(condition.treated?.55:1);state.character.stats.health=clamp(state.character.stats.health-drain);
    if(!condition.chronic && rng.chance((condition.treated?def.treatmentEffectiveness:.22))){
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'health',importance:2,text:`You recovered from ${condition.name}.`});condition.severity=0;
    } else condition.severity=clamp(condition.severity+rng.int(-4,5));
  }
  state.health.conditions=state.health.conditions.filter(c=>c.severity>0);

  const candidate=illnesses.filter(i=>age>=i.minAge && !state.health.conditions.some(c=>c.illnessId===i.id));
  const healthRisk=(100-state.character.stats.health)/100; const geneticMod=state.character.traits.includes('frail')?1.4:1;
  for(let tries=0;tries<Math.min(4,candidate.length);tries++){
    const def=rng.pick(candidate); let ageMod=1;if(def.category==='age_related')ageMod=Math.max(.2,(age-45)/30);if(def.category==='injury')ageMod=.7+state.character.secondary.athleticism/180;
    if(rng.chance(def.prevalence*(.65+healthRisk)*geneticMod*ageMod)){
      const severity=rng.int(def.severityRange[0],def.severityRange[1]); const chronic=rng.chance(def.chronicChance);
      state.health.conditions.push({id:makeStateId(state,'condition'),illnessId:def.id,name:def.name,severity,diagnosedAge:age,chronic,treated:false});
      state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'health',importance:severity>50?3:2,text:`You developed ${def.name}.`});break;
    }
  }

  for(const addiction of state.health.addictions){
    addiction.years+=1;if(addiction.recovering)addiction.severity=clamp(addiction.severity-rng.int(5,14));else addiction.severity=clamp(addiction.severity+rng.int(-2,5));
    state.character.stats.health=clamp(state.character.stats.health-addiction.severity/35);state.character.stats.happiness=clamp(state.character.stats.happiness-addiction.severity/45);state.finances.cash-=Math.round(addiction.severity*25);
  }
  state.health.addictions=state.health.addictions.filter(a=>a.severity>2);
  state.rngCounter=rng.counter();
}

export function seekTreatment(state:GameState,conditionId:string,kind:'general'|'specialist'|'emergency'='general'):EngineResult {
  const condition=state.health.conditions.find(c=>c.id===conditionId);if(!condition)return{success:false,messages:[{text:'Condition not found.'}]};const def=illnessById[condition.illnessId];if(!def)return{success:false,messages:[{text:'Treatment data unavailable.'}]};
  const mult={general:1,specialist:2.2,emergency:4}[kind];const cost=Math.round(def.treatmentCost*mult);if(state.finances.cash<cost&&state.character.age>=18)return{success:false,messages:[{text:`Treatment would cost ${cost.toLocaleString()} in game currency.`}]};if(state.character.age>=18)state.finances.cash-=cost;
  const rng=createRng(state.seed,state.rngCounter);const effectiveness=Math.min(.95,def.treatmentEffectiveness+(kind==='specialist'?.14:kind==='emergency'?.08:0));condition.treated=true;
  const success=rng.chance(effectiveness);condition.severity=clamp(condition.severity-(success?rng.int(20,50):rng.int(3,12)));state.character.stats.health=clamp(state.character.stats.health+(success?6:1));state.rngCounter=rng.counter();
  return{success,messages:[{text:success?`Treatment for ${condition.name} was effective.`:`Treatment helped only a little this time. This is a game outcome, not medical guidance.`}]};
}

export function performWellnessActivity(state:GameState,activity:'gym'|'running'|'walking'|'martial_arts'|'meditation'|'diet'):EngineResult {
  const effects={gym:[5,1,2],running:[6,1,1],walking:[3,2,-1],martial_arts:[5,2,3],meditation:[0,4,-7],diet:[2,2,-1]}[activity];
  state.health.fitness=clamp(state.health.fitness+effects[0]);state.character.stats.health=clamp(state.character.stats.health+effects[1]);state.character.secondary.stress=clamp(state.character.secondary.stress+effects[2]);
  state.character.secondary.athleticism=clamp(state.character.secondary.athleticism+(activity==='gym'||activity==='running'||activity==='martial_arts'?2:0));state.character.stats.happiness=clamp(state.character.stats.happiness+2);
  if(activity==='martial_arts')state.character.talents.combat=clamp(state.character.talents.combat+2);
  return{success:true,messages:[{text:`You spent time on ${activity.replace('_',' ')}.`}]};
}

export function riskyHabit(state:GameState,kind:'alcohol'|'gambling'|'smoking'|'fictional_substance'):EngineResult {
  if(state.character.age<16)return{success:false,messages:[{text:'That activity is unavailable at your age.'}]};const existing=state.health.addictions.find(a=>a.kind===kind);const rng=createRng(state.seed,state.rngCounter);
  const risk=state.character.secondary.addictionSusceptibility/220+(existing?.severity??0)/180;if(existing)existing.severity=clamp(existing.severity+rng.int(1,6));else if(rng.chance(risk))state.health.addictions.push({kind,severity:rng.int(8,22),years:0,recovering:false});
  const cost=kind==='gambling'?rng.int(50,1200):rng.int(20,180);state.finances.cash-=cost;state.character.stats.happiness=clamp(state.character.stats.happiness+rng.int(-2,4));state.rngCounter=rng.counter();return{success:true,messages:[{text:`You engaged in ${kind.replace('_',' ')}. The game tracks health, money, and addiction risk abstractly.`}]};
}

export function enterRehab(state:GameState,kind:string):EngineResult {
  const addiction=state.health.addictions.find(a=>a.kind===kind);if(!addiction)return{success:false,messages:[{text:'No matching addiction is active.'}]};const cost=3200;if(state.finances.cash<cost)return{success:false,messages:[{text:`Rehabilitation costs ${cost.toLocaleString()} in game currency.`}]};state.finances.cash-=cost;addiction.recovering=true;state.character.secondary.stress=clamp(state.character.secondary.stress+4);return{success:true,messages:[{text:'You entered rehabilitation. Recovery will progress over future years.'}]};
}
