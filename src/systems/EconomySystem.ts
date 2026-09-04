import type { GameState } from '../types/game';
import { clamp } from '../core/math';
import { createRng } from '../core/rng';

export function processEconomyYear(state:GameState) {
  const rng=createRng(`${state.seed}-economy`,state.rngCounter);
  const recession=rng.chance(.055);
  const boom=!recession&&rng.chance(.08);

  // Everthread uses real-ish game currency rather than century-long nominal dollars. These indices
  // model relative pressure and cycles around a baseline, which keeps fixed salaries, achievements,
  // tuition and wealth goals meaningful even in 100+ year lives.
  const oldInflation=state.economy.inflationIndex;
  const oldSalary=state.economy.salaryIndex;
  const oldHousing=state.economy.housingIndex;

  const costShock=(rng.int(-2,4)+(recession?1:0))/100;
  const salaryShock=costShock*.55+rng.int(-1,2)/100+(boom?.015:recession?-.018:0);
  const housingShock=costShock*.45+rng.int(-3,4)/100+(boom?.045:recession?-.065:0);

  state.economy.inflationIndex=clamp(oldInflation*(1+costShock)+(1-oldInflation)*.07,.78,1.65);
  state.economy.salaryIndex=clamp(oldSalary*(1+salaryShock)+(1-oldSalary)*.06,.72,1.90);
  state.economy.housingIndex=clamp(oldHousing*(1+housingShock)+(1.03-oldHousing)*.045,.55,2.40);
  state.economy.businessDemandIndex=clamp(state.economy.businessDemandIndex*(1+(boom?.06:recession?-.07:rng.int(-2,3)/100))+(1-state.economy.businessDemandIndex)*.04,.60,1.70);

  state.economy.lastInflationRate=oldInflation===0?0:state.economy.inflationIndex/oldInflation-1;
  state.economy.lastSalaryGrowthRate=oldSalary===0?0:state.economy.salaryIndex/oldSalary-1;
  state.economy.lastHousingGrowthRate=oldHousing===0?0:state.economy.housingIndex/oldHousing-1;
  state.economy.year=state.currentYear;
  if(recession) state.flags.recessionYear=state.currentYear;
  if(boom) state.flags.boomYear=state.currentYear;
  state.rngCounter=rng.counter();
}
