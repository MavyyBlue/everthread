import { propertyDefinitions, vehicleDefinitions, luxuryVehicleDefinitions, collectibleDefinitions } from '../data/assets';
import type { EngineResult, GameState } from '../types/game';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import { createRng } from '../core/rng';
import { clamp } from '../core/math';
import { acceptAssetFinanceOffer, bestAssetFinanceOffer, getAssetFinanceOffers } from './AssetFinancingSystem';

export function buyProperty(state:GameState,typeId:string,useMortgage=true,offerId?:string,downPaymentRate=.2):EngineResult {
  if(state.character.age<18)return{success:false,messages:[{text:'You must be an adult to purchase property.'}]};
  const def=propertyDefinitions.find(p=>p.id===typeId);if(!def)return{success:false,messages:[{text:'Unknown property type.'}]};
  const price=Math.round(def.basePrice*state.economy.housingIndex);
  let amountDue=price;let mortgageId:string|undefined;let financeMessage:string|undefined;let financeDetail:string|undefined;
  if(useMortgage){
    const request={kind:'home' as const,price,downPaymentRate};const chosen=offerId?getAssetFinanceOffers(state,request).find(offer=>offer.id===offerId):bestAssetFinanceOffer(state,request);
    if(!chosen){const reasons=getAssetFinanceOffers(state,request).map(offer=>offer.reason).filter(Boolean);return{success:false,messages:[{text:reasons[0]?`No current home-finance offer is available: ${reasons[0]}`:'No current home-finance offer is available.'}]};}
    const application=acceptAssetFinanceOffer(state,request,chosen.id);if(!application.result.success||!application.loan||!application.offer)return application.result;
    mortgageId=application.loan.id;amountDue=application.offer.downPayment;financeMessage=application.result.messages[0]?.text;financeDetail=`${application.offer.institutionName} · ${application.offer.program.name} · ${(application.offer.annualRate*100).toFixed(1)}% APR · ${application.offer.termYears} years · ${application.offer.annualPayment.toLocaleString()} annual payment`;
  } else if(state.finances.cash<price)return{success:false,messages:[{text:`You need ${price.toLocaleString()} available for this purchase.`}]};
  if(!useMortgage)state.finances.cash-=price;
  const propertyId=makeStateId(state,'property');
  if(mortgageId){const loan=state.finances.liabilities.find(item=>item.id===mortgageId);if(loan)loan.assetId=propertyId;}
  state.assets.properties.push({id:propertyId,typeId:def.id,name:def.name,location:state.character.city,purchasePrice:price,marketValue:price,condition:90,age:0,amenities:[...def.amenities],mortgageId});
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'asset',importance:3,text:useMortgage?`You purchased a ${def.name} in ${state.character.city} with financing.`:`You purchased a ${def.name} in ${state.character.city} outright.`,moneyDelta:-amountDue,...(financeDetail?{detail:financeDetail}:{})});
  return{success:true,stateChanges:useMortgage?['property','financingLiability','creditInquiry']:['property'],messages:[...(financeMessage?[{text:financeMessage}]:[]),{text:`Purchased ${def.name} for ${price.toLocaleString()}${useMortgage?` with ${amountDue.toLocaleString()} down`:' outright'}.`}]};
}

export function financeProperty(state:GameState,typeId:string,offerId:string,downPaymentRate=.2){return buyProperty(state,typeId,true,offerId,downPaymentRate);}

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
  const p=state.assets.properties.find(p=>p.id===propertyId);if(!p)return{success:false,messages:[{text:'Property not found.'}]};const cost=Math.round(p.marketValue*.04);if(state.finances.cash<cost)return{success:false,messages:[{text:`Renovation requires ${cost.toLocaleString()}.`}]};const gate=consumeAction(state,{policy:'property.renovate',target:propertyId});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};
  state.finances.cash-=cost;p.condition=clamp(p.condition+25);p.marketValue=Math.round(p.marketValue*1.025);return{success:true,messages:[{text:`Renovation complete. Condition is now ${p.condition}%.`}]};
}

export function rentOutProperty(state:GameState,propertyId:string):EngineResult {
  const p=state.assets.properties.find(p=>p.id===propertyId);if(!p)return{success:false,messages:[{text:'Property not found.'}]};
  p.rental={annualRent:Math.round(p.marketValue*.065),reliability:60,occupied:false};return{success:true,messages:[{text:`${p.name} is now listed for rent.`}]};
}

export function sellProperty(state:GameState,propertyId:string):EngineResult {
  const i=state.assets.properties.findIndex(p=>p.id===propertyId);if(i<0)return{success:false,messages:[{text:'Property not found.'}]};const p=state.assets.properties[i]!;const mortgage=p.mortgageId?state.finances.liabilities.find(l=>l.id===p.mortgageId):undefined;const payoff=mortgage?.balance??0;const proceeds=Math.max(0,p.marketValue-payoff-Math.round(p.marketValue*.035));state.finances.cash+=proceeds;if(mortgage)state.finances.liabilities=state.finances.liabilities.filter(l=>l.id!==mortgage.id);state.assets.properties.splice(i,1);return{success:true,messages:[{text:`Sold ${p.name}. Net proceeds: ${proceeds.toLocaleString()}.`}]};
}

function vehicleDefinition(typeId:string){return[...vehicleDefinitions,...luxuryVehicleDefinitions].find(v=>v.id===typeId);}
function vehiclePurchaseGate(state:GameState,typeId:string):EngineResult|undefined {
  if(state.character.age<16)return{success:false,messages:[{text:'You are too young to purchase a vehicle.'}]};const def=vehicleDefinition(typeId);if(!def)return{success:false,messages:[{text:'Unknown vehicle.'}]};
  if(def.category==='boat'&&!state.flags.boatLicense)return{success:false,messages:[{text:'A boating license is required for this purchase.'}]};if(def.category==='aircraft'&&!state.flags.pilotLicense)return{success:false,messages:[{text:'A pilot license is required for this purchase.'}]};
}

export function buyVehicle(state:GameState,typeId:string):EngineResult {
  const gate=vehiclePurchaseGate(state,typeId);if(gate)return gate;const def=vehicleDefinition(typeId)!;
  if(state.finances.cash<def.price)return{success:false,messages:[{text:`You need ${def.price.toLocaleString()} cash.`}]};state.finances.cash-=def.price;const vehicleId=makeStateId(state,'vehicle');state.assets.vehicles.push({id:vehicleId,typeId:def.id,name:def.name,purchasePrice:def.price,value:def.price,age:0,condition:100,mileage:0,category:def.category});state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'asset',importance:2,text:`You purchased a ${def.name} outright.`,moneyDelta:-def.price});return{success:true,stateChanges:['vehicle'],messages:[{text:`Purchased ${def.name}.`}]};
}

export function financeVehicle(state:GameState,typeId:string,offerId:string,downPaymentRate=.2):EngineResult {
  const gate=vehiclePurchaseGate(state,typeId);if(gate)return gate;const def=vehicleDefinition(typeId)!;if(def.category==='boat'||def.category==='aircraft')return{success:false,messages:[{text:'Specialized financing is not available for boats or aircraft yet.'}]};const request={kind:'vehicle' as const,price:def.price,downPaymentRate};const application=acceptAssetFinanceOffer(state,request,offerId);if(!application.result.success||!application.loan||!application.offer)return application.result;
  const vehicleId=makeStateId(state,'vehicle');application.loan.assetId=vehicleId;state.assets.vehicles.push({id:vehicleId,typeId:def.id,name:def.name,purchasePrice:def.price,value:def.price,age:0,condition:100,mileage:0,category:def.category});state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'asset',importance:3,text:`You financed a ${def.name} through ${application.offer.institutionName}.`,moneyDelta:-application.offer.downPayment,detail:`${application.offer.program.name} · ${(application.offer.annualRate*100).toFixed(1)}% APR · ${application.offer.termYears} years · ${application.offer.annualPayment.toLocaleString()} annual payment`});return{success:true,stateChanges:['vehicle','financingLiability','creditInquiry'],messages:[...application.result.messages,{text:`Purchased ${def.name} with ${application.offer.downPayment.toLocaleString()} down and ${application.offer.amountFinanced.toLocaleString()} financed.`}]};
}

export function repairVehicle(state:GameState,vehicleId:string):EngineResult {
  const v=state.assets.vehicles.find(v=>v.id===vehicleId);if(!v)return{success:false,messages:[{text:'Vehicle not found.'}]};const cost=Math.round((100-v.condition)*Math.max(80,v.value*.0015));if(cost<=0)return{success:false,messages:[{text:'This vehicle is already in excellent condition.'}]};if(state.finances.cash<cost)return{success:false,messages:[{text:`Repairs require ${cost.toLocaleString()}.`}]};state.finances.cash-=cost;v.condition=100;return{success:true,messages:[{text:`Repaired ${v.name} for ${cost.toLocaleString()}.`}]};
}

export function buyCollectible(state:GameState,itemId:string):EngineResult {
  if(state.character.age<12)return{success:false,messages:[{text:'Collectible-market purchases become available at age 12.'}]};
  const def=collectibleDefinitions.find(i=>i.id===itemId);if(!def)return{success:false,messages:[{text:'Collectible not found.'}]};const rng=createRng(state.seed,state.rngCounter);const price=Math.round(def.baseValue*rng.int(70,145)/100);if(state.finances.cash<price)return{success:false,messages:[{text:`You need ${price.toLocaleString()} cash.`}]};const gate=consumeAction(state,[{policy:'collectible.purchase.total'},{policy:'collectible.purchase.item',target:itemId}]);if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};state.finances.cash-=price;const authentic=!rng.chance(def.fakeChance);state.assets.collectibles.push({id:makeStateId(state,'collectible'),itemId:def.id,name:def.name,estimatedValue:authentic?Math.round(price*rng.int(90,160)/100):Math.round(price*.1),authenticity:authentic?rng.int(88,100):rng.int(5,35),condition:rng.int(55,98),rarity:def.rarity});state.rngCounter=rng.counter();return{success:true,messages:[{text:`Purchased ${def.name} for ${price.toLocaleString()}. Authenticity is not guaranteed until appraised.`}]};
}
