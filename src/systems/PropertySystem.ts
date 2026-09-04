import { propertyDefinitions, vehicleDefinitions, luxuryVehicleDefinitions, collectibleDefinitions } from '../data/assets';
import type { EngineResult, GameState } from '../types/game';
import { makeStateId } from '../core/ids';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';

export function buyProperty(state:GameState,typeId:string,useMortgage=true):EngineResult {
  if(state.character.age<18)return{success:false,messages:[{text:'You must be an adult to purchase property.'}]};
  const def=propertyDefinitions.find(p=>p.id===typeId);if(!def)return{success:false,messages:[{text:'Unknown property type.'}]};
  const price=Math.round(def.basePrice*state.economy.housingIndex); const down=useMortgage?Math.round(price*.2):price;
  if(state.finances.cash<down)return{success:false,messages:[{text:`You need ${down.toLocaleString()} available for this purchase${useMortgage?' including the down payment':''}.`}]};
  if(useMortgage){
    const balance=price-down;const annualPayment=Math.round(balance/30+balance*.052);const carryingCost=annualPayment+Math.round(price*.018);const income=Math.max(state.finances.annualIncome,state.employment.current?.salary??0);const recentBankruptcy=state.flags.lastBankruptcyAge!==undefined&&state.character.age-Number(state.flags.lastBankruptcyAge)<5;
    if(recentBankruptcy)return{success:false,messages:[{text:'A recent bankruptcy prevents a new mortgage under the current game rules.'}]};
    if((income<=0&&state.finances.cash<price*.6)||(income>0&&carryingCost>income*.42&&state.finances.cash<price*.6))return{success:false,messages:[{text:'The mortgage would be unaffordable under the current income and cash rules.'}]};
  }
  state.finances.cash-=down; const propertyId=makeStateId(state,'property'); let mortgageId: string|undefined;
  if(useMortgage){const balance=price-down;mortgageId=makeStateId(state,'loan');state.finances.liabilities.push({id:mortgageId,kind:'mortgage',principal:balance,balance,annualRate:.052,annualPayment:Math.round(balance/30+balance*.052),remainingYears:30,assetId:propertyId});}
  state.assets.properties.push({id:propertyId,typeId:def.id,name:def.name,location:state.character.city,purchasePrice:price,marketValue:price,condition:90,age:0,amenities:[...def.amenities],mortgageId});
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'asset',importance:3,text:`You purchased a ${def.name} in ${state.character.city}.`,moneyDelta:-down});
  return{success:true,messages:[{text:`Purchased ${def.name} for ${price.toLocaleString()}.`}]};
}

export function processPropertiesYear(state:GameState) {
  const rng=createRng(`${state.seed}-property`,state.rngCounter);
  for(const p of state.assets.properties){const def=propertyDefinitions.find(d=>d.id===p.typeId);p.age+=1;p.condition=clamp(p.condition-rng.int(0,3));const marketMove=(state.economy.housingIndex-1)*.035+(rng.next()-.5)*(def?.appreciationVolatility??.06);p.marketValue=Math.max(1000,Math.round(p.marketValue*(1+marketMove)));
    if(p.rental?.occupied && rng.chance((100-p.rental.reliability)/700)){p.rental.occupied=false;state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'asset',importance:2,text:`A tenant moved out of your ${p.name}.`});}
    else if(p.rental && !p.rental.occupied && rng.chance(.42)){p.rental.occupied=true;p.rental.reliability=rng.int(35,95);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'asset',importance:1,text:`You found a new tenant for your ${p.name}.`});}
  }
  for(const v of state.assets.vehicles){v.age+=1;v.mileage+=rng.int(3500,16000);v.condition=clamp(v.condition-rng.int(1,7));const def=[...vehicleDefinitions,...luxuryVehicleDefinitions].find(x=>x.id===v.typeId);v.value=Math.max(200,Math.round(v.value*(1-(def?.depreciation??.16)*(v.condition<40?1.15:.9))));}
  state.rngCounter=rng.counter();
}

export function renovateProperty(state:GameState,propertyId:string):EngineResult {
  const p=state.assets.properties.find(p=>p.id===propertyId);if(!p)return{success:false,messages:[{text:'Property not found.'}]};const cost=Math.round(p.marketValue*.04);if(state.finances.cash<cost)return{success:false,messages:[{text:`Renovation requires ${cost.toLocaleString()}.`}]};
  state.finances.cash-=cost;p.condition=clamp(p.condition+25);p.marketValue=Math.round(p.marketValue*1.055);return{success:true,messages:[{text:`Renovation complete. Condition is now ${p.condition}%.`}]};
}

export function rentOutProperty(state:GameState,propertyId:string):EngineResult {
  const p=state.assets.properties.find(p=>p.id===propertyId);if(!p)return{success:false,messages:[{text:'Property not found.'}]};
  p.rental={annualRent:Math.round(p.marketValue*.065),reliability:60,occupied:false};return{success:true,messages:[{text:`${p.name} is now listed for rent.`}]};
}

export function sellProperty(state:GameState,propertyId:string):EngineResult {
  const i=state.assets.properties.findIndex(p=>p.id===propertyId);if(i<0)return{success:false,messages:[{text:'Property not found.'}]};const p=state.assets.properties[i]!;const mortgage=p.mortgageId?state.finances.liabilities.find(l=>l.id===p.mortgageId):undefined;const payoff=mortgage?.balance??0;const proceeds=Math.max(0,p.marketValue-payoff-Math.round(p.marketValue*.035));state.finances.cash+=proceeds;if(mortgage)state.finances.liabilities=state.finances.liabilities.filter(l=>l.id!==mortgage.id);state.assets.properties.splice(i,1);return{success:true,messages:[{text:`Sold ${p.name}. Net proceeds: ${proceeds.toLocaleString()}.`}]};
}

export function buyVehicle(state:GameState,typeId:string):EngineResult {
  if(state.character.age<16)return{success:false,messages:[{text:'You are too young to purchase a vehicle.'}]};const def=[...vehicleDefinitions,...luxuryVehicleDefinitions].find(v=>v.id===typeId);if(!def)return{success:false,messages:[{text:'Unknown vehicle.'}]};
  if(def.category==='boat'&&!state.flags.boatLicense)return{success:false,messages:[{text:'A boating license is required for this purchase.'}]};if(def.category==='aircraft'&&!state.flags.pilotLicense)return{success:false,messages:[{text:'A pilot license is required for this purchase.'}]};
  if(state.finances.cash<def.price)return{success:false,messages:[{text:`You need ${def.price.toLocaleString()} cash.`}]};state.finances.cash-=def.price;state.assets.vehicles.push({id:makeStateId(state,'vehicle'),typeId:def.id,name:def.name,purchasePrice:def.price,value:def.price,age:0,condition:100,mileage:0,category:def.category});return{success:true,messages:[{text:`Purchased ${def.name}.`}]};
}

export function repairVehicle(state:GameState,vehicleId:string):EngineResult {
  const v=state.assets.vehicles.find(v=>v.id===vehicleId);if(!v)return{success:false,messages:[{text:'Vehicle not found.'}]};const cost=Math.round((100-v.condition)*Math.max(80,v.value*.0015));if(cost<=0)return{success:false,messages:[{text:'This vehicle is already in excellent condition.'}]};if(state.finances.cash<cost)return{success:false,messages:[{text:`Repairs require ${cost.toLocaleString()}.`}]};state.finances.cash-=cost;v.condition=100;return{success:true,messages:[{text:`Repaired ${v.name} for ${cost.toLocaleString()}.`}]};
}

export function buyCollectible(state:GameState,itemId:string):EngineResult {
  const def=collectibleDefinitions.find(i=>i.id===itemId);if(!def)return{success:false,messages:[{text:'Collectible not found.'}]};const rng=createRng(state.seed,state.rngCounter);const price=Math.round(def.baseValue*rng.int(70,145)/100);if(state.finances.cash<price)return{success:false,messages:[{text:`You need ${price.toLocaleString()} cash.`}]};state.finances.cash-=price;const authentic=!rng.chance(def.fakeChance);state.assets.collectibles.push({id:makeStateId(state,'collectible'),itemId:def.id,name:def.name,estimatedValue:authentic?Math.round(price*rng.int(90,160)/100):Math.round(price*.1),authenticity:authentic?rng.int(88,100):rng.int(5,35),condition:rng.int(55,98),rarity:def.rarity});state.rngCounter=rng.counter();return{success:true,messages:[{text:`Purchased ${def.name} for ${price.toLocaleString()}. Authenticity is not guaranteed until appraised.`}]};
}
