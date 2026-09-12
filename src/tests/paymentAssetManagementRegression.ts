import type { CreditAccount } from '../types/credit';
import type { GameState, Loan, PropertyAsset, VehicleAsset } from '../types/game';
import { validateState } from '../core/invariants';
import { createNewGame } from '../systems/CharacterSystem';
import { acceptAssetFinanceOffer, bestAssetFinanceOffer } from '../systems/AssetFinancingSystem';
import { processAnnualCredit, payCreditCard } from '../systems/CreditSystem';
import { getSecuredLoanStatus, processAnnualFinance, scheduledLoanPaymentAmount } from '../systems/FinanceSystem';
import { getPaymentObligations, migratePaymentState, payPaymentObligation, paymentSummary, setPaymentAutoPay } from '../systems/PaymentSystem';
import { getPropertySaleQuote, getVehicleSaleQuote, sellProperty, sellVehicle } from '../systems/PropertySystem';
import { migrateSave, SAVE_VERSION } from '../services/SaveSystem';

function adult(seed:string,age=30){
  const state=createNewGame({seed});
  state.character.age=age;
  state.currentYear=state.character.birthYear+age;
  state.actionLedger.age=age;
  state.actionLedger.uses={};
  state.finances.cash=100000;
  state.finances.annualIncome=0;
  state.finances.liabilities=[];
  state.finances.credit.accounts=[];
  state.finances.credit.transactions=[];
  state.finances.credit.inquiries=[];
  state.finances.credit.derogatories=[];
  state.finances.credit.history={onTimePayments:0,latePayments:0,missedPayments:0,defaults:0,closedGoodStanding:0,archivedAccountYears:0};
  state.assets={properties:[],vehicles:[],collectibles:[]};
  state.investments.positions=[];
  state.businesses=[];
  state.pets=[];
  state.employment.current=undefined;
  state.employment.partTimeJobs=[];
  state.employment.partTimeHistory=[];
  state.economy.inflationIndex=1;
  state.economy.housingIndex=1;
  state.economy.salaryIndex=1;
  return state;
}

function addCard(state:GameState,{balance=1000,minimumDue=50,autoPay=true,pastDue=0,rate=.2}:{balance?:number;minimumDue?:number;autoPay?:boolean;pastDue?:number;rate?:number}={}){
  const account:CreditAccount={id:'card-account',institutionId:'northstar',productId:'northstar_foundation',productName:'Fixture Card',openedYear:state.currentYear-5,openedAge:state.character.age-5,status:'open',creditLimit:5000,balance,annualRate:rate,annualFee:0,lateFee:30,securedDeposit:0,statementBalance:balance,minimumDue,paymentsTowardStatement:0,statementAge:state.character.age,onTimePayments:0,latePayments:0,missedPayments:0,autoPay,pastDueAmount:pastDue};
  state.finances.credit.accounts.push(account);return account;
}

function addCar(state:GameState,{value=22000,balance=18000,payment=5000,rate=.05,autoPay=true,delinquent=false}:{value?:number;balance?:number;payment?:number;rate?:number;autoPay?:boolean;delinquent?:boolean}={}){
  const vehicle:VehicleAsset={id:'car-asset',typeId:'economy_base',name:'Fixture Hatchback',purchasePrice:value,value,age:1,condition:90,mileage:12000,category:'car'};
  const loan:Loan={id:'car-loan',kind:'car',principal:balance,balance,annualRate:rate,annualPayment:payment,remainingYears:4,assetId:vehicle.id,autoPay,...(delinquent?{delinquency:{status:'delinquent' as const,arrears:payment,missedPayments:1,lastMissedPaymentAge:state.character.age-1}}:{})};
  state.assets.vehicles.push(vehicle);state.finances.liabilities.push(loan);return{vehicle,loan};
}

function addHome(state:GameState,{value=300000,balance=200000,payment=25000,rate=.05,autoPay=true}:{value?:number;balance?:number;payment?:number;rate?:number;autoPay?:boolean}={}){
  const property:PropertyAsset={id:'home-asset',typeId:'starter_house_standard',name:'Fixture Home',location:state.character.city,purchasePrice:value,marketValue:value,condition:88,age:8,amenities:[],mortgageId:'home-loan'};
  const loan:Loan={id:'home-loan',kind:'mortgage',principal:balance,balance,annualRate:rate,annualPayment:payment,remainingYears:20,assetId:property.id,autoPay};
  state.assets.properties.push(property);state.finances.liabilities.push(loan);return{property,loan};
}

function approx(actual:number,expected:number,tolerance:number,message:string){if(Math.abs(actual-expected)>tolerance)throw new Error(`Payment & asset management regression failed: ${message} (${actual} vs ${expected})`);}

export function runPaymentAssetManagementRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Payment & asset management regression failed: ${message}`);}

  const fresh=createNewGame({seed:'payment-fresh'});
  verify(SAVE_VERSION===12&&fresh.saveVersion===12,'Phase 6B3 advances new lives and save service to schema 12');

  const legacy=adult('payment-v11');legacy.saveVersion=11;const legacyRng=legacy.rngCounter;const legacyCard=addCard(legacy,{autoPay:true});delete legacyCard.autoPay;delete legacyCard.pastDueAmount;const legacyCar=addCar(legacy,{autoPay:true});delete legacyCar.loan.autoPay;
  const migrated=migrateSave(structuredClone(legacy));const migratedCard=migrated.finances.credit.accounts.find(item=>item.id===legacyCard.id)!;const migratedCar=migrated.finances.liabilities.find(item=>item.id===legacyCar.loan.id)!;
  verify(migrated.saveVersion===12,'schema-11 saves migrate to schema 12');
  verify(migrated.rngCounter===legacyRng,'payment-state migration is RNG-neutral');
  verify(migratedCard.autoPay===true&&migratedCard.pastDueAmount===0,'legacy card accounts default safely to minimum-payment auto-pay with no invented arrears');
  verify(migratedCar.autoPay===true,'legacy secured loans default safely to annual auto-pay');
  verify(validateState(migrated).length===0,'schema-12 payment migration remains invariant-clean');
  const remigrated=migrateSave(structuredClone(migrated));verify(JSON.stringify(remigrated)===JSON.stringify(migrated),'schema-12 normalization is idempotent');

  const preserve=adult('payment-preserve');const preserveCard=addCard(preserve,{autoPay:false,pastDue:40});const preserveCar=addCar(preserve,{autoPay:false}).loan;preserveCar.prepaidThroughAge=preserve.character.age+1;migratePaymentState(preserve);
  verify(preserveCard.autoPay===false&&preserveCard.pastDueAmount===40,'explicit card auto-pay opt-out and arrears survive normalization');
  verify(preserveCar.autoPay===false&&preserveCar.prepaidThroughAge===preserve.character.age+1,'secured opt-out and paid-ahead marker survive normalization');

  const projection=adult('payment-projection');const projectedCard=addCard(projection,{balance:800,minimumDue:40,pastDue:15});const projectedCar=addCar(projection);const projectedHome=addHome(projection);projection.finances.liabilities.push({id:'student-loan',kind:'student',principal:10000,balance:9000,annualRate:.04,annualPayment:1500,remainingYears:7});const projectionBefore=JSON.stringify(projection);const obligations=getPaymentObligations(projection);
  verify(JSON.stringify(projection)===projectionBefore,'payment-obligation projection is read-only');
  verify(obligations.length===3,'Bills & Payments exposes cards, cars, and mortgages without inventing aggregate or student-loan bills');
  verify(obligations.some(item=>item.id===`credit:${projectedCard.id}`&&item.kind==='credit_card'&&item.balance===800),'credit-card obligation preserves authoritative balance');
  verify(obligations.some(item=>item.id===`loan:${projectedCar.loan.id}`&&item.kind==='vehicle'&&item.title===projectedCar.vehicle.name),'vehicle financing resolves its real collateral name');
  verify(obligations.some(item=>item.id===`loan:${projectedHome.loan.id}`&&item.kind==='mortgage'&&item.title===projectedHome.property.name),'mortgage financing resolves its real collateral name');
  verify(obligations[0]?.status==='past_due'&&obligations[0]?.pastDue===15,'past-due bills sort ahead of current obligations');
  const summary=paymentSummary(projection);verify(summary.obligations.length===3&&summary.pastDue===15&&summary.autoPayCount===3,'overview payment summary reconciles itemized obligations');

  const pref=adult('payment-preference');const prefCard=addCard(pref);const prefLoan=addCar(pref).loan;
  verify(setPaymentAutoPay(pref,`credit:${prefCard.id}`,false).success&&prefCard.autoPay===false,'card auto-pay can be disabled from the centralized payment layer');
  verify(setPaymentAutoPay(pref,`loan:${prefLoan.id}`,false).success&&prefLoan.autoPay===false,'secured-loan auto-pay can be disabled from the centralized payment layer');
  verify(setPaymentAutoPay(pref,`credit:${prefCard.id}`,true).success&&(prefCard as CreditAccount).autoPay===true,'card auto-pay can be re-enabled');
  verify(setPaymentAutoPay(pref,`loan:${prefLoan.id}`,true).success&&(prefLoan as Loan).autoPay===true,'secured-loan auto-pay can be re-enabled');
  verify(!setPaymentAutoPay(pref,'loan:not-real',true).success,'payment preferences reject stale obligations safely');

  const cardAuto=adult('card-autopay');cardAuto.finances.cash=100;const cardAutoAccount=addCard(cardAuto,{balance:1000,minimumDue:50,autoPay:true,rate:.2});const autoCash=cardAuto.finances.cash;processAnnualCredit(cardAuto);
  verify(cardAuto.finances.cash===autoCash-50,'card auto-pay deducts exactly the required minimum from cash');
  verify(cardAutoAccount.onTimePayments===1&&cardAuto.finances.credit.history.onTimePayments===1,'successful minimum auto-pay records on-time history');
  verify(cardAuto.finances.credit.transactions.some(item=>item.kind==='payment'&&item.amount===50),'card auto-pay creates a normal payment transaction');
  verify(cardAutoAccount.balance>950,'minimum auto-pay does not silently pay the full revolving balance');
  verify(cardAutoAccount.pastDueAmount===0,'successful card auto-pay leaves no past-due amount');

  const cardPartial=adult('card-partial');cardPartial.finances.cash=10;const partialAccount=addCard(cardPartial,{balance:1000,minimumDue:50,autoPay:true,rate:0});processAnnualCredit(cardPartial);
  verify(cardPartial.finances.cash===0,'card auto-pay uses available cash toward the required minimum');
  verify(partialAccount.latePayments===1&&cardPartial.finances.credit.history.latePayments===1,'partial auto-pay records a late payment rather than a false on-time result');
  verify(partialAccount.pastDueAmount===40,'partial card auto-pay carries the exact unpaid required amount forward');

  const cardMiss=adult('card-miss');cardMiss.finances.cash=500;const missAccount=addCard(cardMiss,{balance:1000,minimumDue:50,autoPay:false,rate:0});const missCash=cardMiss.finances.cash;processAnnualCredit(cardMiss);
  verify(cardMiss.finances.cash===missCash,'card auto-pay opt-out leaves cash untouched');
  verify(missAccount.missedPayments===1&&cardMiss.finances.credit.history.missedPayments===1,'opted-out unpaid card minimum becomes a real missed payment');
  verify(missAccount.pastDueAmount===50,'opted-out missed card minimum becomes visible past due');
  verify(cardMiss.finances.credit.derogatories.some(item=>item.kind==='missed_payment'),'opted-out missed card payment reaches credit history');

  const cardManual=adult('card-manual');cardManual.finances.cash=500;const manualAccount=addCard(cardManual,{balance:1000,minimumDue:50,autoPay:false,rate:0});const manualResult=payPaymentObligation(cardManual,`credit:${manualAccount.id}`);
  verify(manualResult.success&&cardManual.finances.cash===450,'Bills & Payments can pay the current card bill from cash');
  verify(manualAccount.paymentsTowardStatement===50,'manual required card payment is credited to the current statement');
  verify(getPaymentObligations(cardManual).find(item=>item.sourceId===manualAccount.id)?.dueNow===0,'manually paid current card bill no longer shows an amount due');
  const extraResult=payCreditCard(cardManual,manualAccount.id,200);verify(extraResult.success&&manualAccount.balance===750,'account detail still supports extra revolving-balance payments beyond the required bill');

  const pastManual=adult('card-past-manual');pastManual.finances.cash=500;const pastAccount=addCard(pastManual,{balance:1000,minimumDue:90,autoPay:false,pastDue:40,rate:0});const pastResult=payPaymentObligation(pastManual,`credit:${pastAccount.id}`);
  verify(pastResult.success&&pastManual.finances.cash===460&&pastAccount.pastDueAmount===0,'Pay past due clears only the explicit card arrears from cash');
  const afterPastDue=getPaymentObligations(pastManual).find(item=>item.sourceId===pastAccount.id);verify(afterPastDue?.status==='current'&&afterPastDue.dueNow===50,'clearing card arrears leaves the separate current minimum visible rather than overpaying it');

  const securedManual=adult('secured-manual');securedManual.finances.cash=100000;const secured=addCar(securedManual);const scheduled=scheduledLoanPaymentAmount(secured.loan);const securedCash=securedManual.finances.cash;const securedPay=payPaymentObligation(securedManual,`loan:${secured.loan.id}`);
  verify(securedPay.success&&securedManual.finances.cash===securedCash-scheduled,'manual vehicle bill deducts the exact scheduled annual payment');
  approx(secured.loan.balance,13900,.01,'manual vehicle bill applies scheduled interest and principal exactly once');
  verify(secured.loan.remainingYears===3,'manual secured payment decrements the term once');
  verify(secured.loan.prepaidThroughAge===securedManual.character.age+1,'manual secured payment marks the next Age Up as already paid');
  verify(getPaymentObligations(securedManual).find(item=>item.sourceId===secured.loan.id)?.status==='paid_ahead','manually prepaid secured bill is visibly paid ahead');
  securedManual.character.age+=1;securedManual.currentYear+=1;const paidAheadBalance=secured.loan.balance;processAnnualFinance(securedManual);
  verify(secured.loan.balance===paidAheadBalance,'next Age Up does not double-charge or re-amortize a manually prepaid secured bill');
  verify(secured.loan.prepaidThroughAge===undefined,'paid-ahead marker is consumed after the covered Age Up');

  const securedAuto=adult('secured-auto');securedAuto.finances.cash=1000000;const autoSecured=addHome(securedAuto);const autoBefore=autoSecured.loan.balance;processAnnualFinance(securedAuto);
  verify(autoSecured.loan.balance<autoBefore&&autoSecured.loan.remainingYears===19,'secured auto-pay ON retains normal annual loan servicing');
  verify(getSecuredLoanStatus(securedAuto,autoSecured.loan)?.status==='current','successful secured auto-pay leaves collateral current');

  const securedOff=adult('secured-off');securedOff.finances.cash=1000000;const offSecured=addCar(securedOff,{autoPay:false});const offCash=securedOff.finances.cash;processAnnualFinance(securedOff);const offStatus=getSecuredLoanStatus(securedOff,offSecured.loan)!;
  verify(offSecured.loan.balance===18900,'secured auto-pay opt-out accrues interest without pretending the scheduled principal payment happened');
  verify(offStatus.status==='delinquent'&&offStatus.arrears===5000,'opted-out secured bill becomes real arrears');
  verify(offStatus.lastMissedPaymentAge===securedOff.character.age,'secured opt-out records the age of the missed bill');
  verify(securedOff.finances.cash<offCash&&securedOff.finances.cash>offCash-5000-50000,'ordinary annual living costs still process while the opted-out secured bill itself is not debited');
  setPaymentAutoPay(securedOff,`loan:${offSecured.loan.id}`,true);verify(getSecuredLoanStatus(securedOff,offSecured.loan)?.status==='delinquent','re-enabling secured auto-pay does not silently erase existing arrears');
  const cureCash=securedOff.finances.cash;const cure=payPaymentObligation(securedOff,`loan:${offSecured.loan.id}`);verify(cure.success&&securedOff.finances.cash===cureCash-5000,'Bills & Payments can cure a secured past-due amount from cash');
  verify(getSecuredLoanStatus(securedOff,offSecured.loan)?.status==='current','manual past-due payment returns secured collateral to current status');

  const insufficient=adult('payment-insufficient');insufficient.finances.cash=10;const insufficientLoan=addCar(insufficient).loan;verify(!payPaymentObligation(insufficient,`loan:${insufficientLoan.id}`).success,'manual payment refuses to overdraw cash');

  const signing=adult('payment-signing',35);signing.finances.cash=100000;signing.finances.annualIncome=200000;signing.employment.current={jobId:'fixture-job',title:'Fixture Executive',company:'Fixture Co',startAge:30,salary:200000,performance:80,level:3};signing.finances.credit.history.onTimePayments=20;signing.finances.credit.history.closedGoodStanding=1;signing.finances.credit.history.archivedAccountYears=10;const signRequest={kind:'vehicle' as const,price:22000,downPaymentRate:.2};const signOffer=bestAssetFinanceOffer(signing,signRequest);verify(Boolean(signOffer?.eligible),'strong borrower receives a vehicle financing offer for payment-default coverage');const signed=acceptAssetFinanceOffer(signing,signRequest,signOffer!.id);verify(signed.result.success&&signed.loan?.autoPay===true,'new financing contracts start with annual auto-pay enabled');

  const outrightSale=adult('vehicle-sale-outright');const outrightVehicle=addCar(outrightSale,{balance:0}).vehicle;outrightSale.finances.liabilities=[];const saleBefore=JSON.stringify(outrightSale);const outrightQuote=getVehicleSaleQuote(outrightSale,outrightVehicle.id)!;
  verify(JSON.stringify(outrightSale)===saleBefore,'vehicle sale quote is read-only');
  verify(outrightQuote.marketValue===22000&&outrightQuote.sellingCosts===880&&outrightQuote.loanPayoff===0,'outright vehicle quote itemizes value and selling costs');
  verify(outrightQuote.cashProceeds===21120&&outrightQuote.deficiency===0,'outright vehicle quote exposes exact net cash proceeds');
  const outrightCash=outrightSale.finances.cash;verify(sellVehicle(outrightSale,outrightVehicle.id).success,'owned-out-right vehicle can be sold');
  verify(outrightSale.assets.vehicles.length===0&&outrightSale.finances.cash===outrightCash+21120,'outright vehicle sale removes the asset and credits exact proceeds');
  verify(outrightSale.timeline.at(-1)?.text.includes('sold Fixture Hatchback')===true,'vehicle sale creates durable life history');

  const equitySale=adult('vehicle-sale-equity');const equity=addCar(equitySale,{balance:10000});const equityQuote=getVehicleSaleQuote(equitySale,equity.vehicle.id)!;verify(equityQuote.loanPayoff===10000&&equityQuote.cashProceeds===11120,'financed vehicle quote pays lender before calculating equity proceeds');const equityCash=equitySale.finances.cash;sellVehicle(equitySale,equity.vehicle.id);
  verify(!equitySale.finances.liabilities.some(item=>item.id===equity.loan.id),'financed vehicle sale removes the exact collateral loan');
  verify(equitySale.finances.cash===equityCash+11120&&!equitySale.finances.liabilities.some(item=>item.kind==='personal'),'positive-equity vehicle sale returns residual cash without inventing deficiency debt');

  const underwater=adult('vehicle-sale-underwater');const underwaterAsset=addCar(underwater,{balance:25000});const underwaterQuote=getVehicleSaleQuote(underwater,underwaterAsset.vehicle.id)!;verify(underwaterQuote.cashProceeds===0&&underwaterQuote.deficiency===3880,'underwater vehicle quote exposes the exact residual deficiency before sale');const underwaterCash=underwater.finances.cash;const underwaterResult=sellVehicle(underwater,underwaterAsset.vehicle.id);verify(underwaterResult.success&&underwater.finances.cash===underwaterCash,'underwater sale does not fabricate cash proceeds');
  verify(!underwater.assets.vehicles.length&&!underwater.finances.liabilities.some(item=>item.id===underwaterAsset.loan.id),'underwater sale removes both collateral and its secured loan');
  verify(underwater.finances.liabilities.some(item=>item.kind==='personal'&&item.balance===3880),'unrecovered vehicle payoff becomes exact unsecured deficiency debt');
  verify(underwater.timeline.at(-1)?.text.includes('unsecured deficiency debt')===true,'underwater vehicle deficiency is visible in durable history');
  verify(validateState(underwater).length===0,'underwater vehicle sale remains invariant-clean');

  const homeSale=adult('home-sale');const homeAsset=addHome(homeSale,{value:300000,balance:200000});const homeQuoteBefore=JSON.stringify(homeSale);const homeQuote=getPropertySaleQuote(homeSale,homeAsset.property.id)!;verify(JSON.stringify(homeSale)===homeQuoteBefore,'property sale quote remains read-only after payment UX consolidation');
  verify(homeQuote.sellingCosts===10500&&homeQuote.loanPayoff===200000&&homeQuote.cashProceeds===89500,'property sale still itemizes costs, payoff, and equity proceeds correctly');const homeCash=homeSale.finances.cash;sellProperty(homeSale,homeAsset.property.id);verify(homeSale.finances.cash===homeCash+89500&&!homeSale.finances.liabilities.some(item=>item.id===homeAsset.loan.id),'property sale preserves established mortgage payoff accounting');

  const persisted=adult('payment-persist');const persistedCard=addCard(persisted,{autoPay:false,pastDue:40});const persistedCar=addCar(persisted,{autoPay:false}).loan;persistedCar.prepaidThroughAge=persisted.character.age+1;const persistedVehicleId=persistedCar.assetId!;const restored=migrateSave(JSON.parse(JSON.stringify(persisted)) as unknown);const restoredCard=restored.finances.credit.accounts.find(item=>item.id===persistedCard.id)!;const restoredCar=restored.finances.liabilities.find(item=>item.id===persistedCar.id)!;
  verify(restored.saveVersion===12&&restoredCard.autoPay===false&&restoredCard.pastDueAmount===40,'schema-12 save roundtrip preserves card payment preferences and arrears');
  verify(restoredCar.autoPay===false&&restoredCar.prepaidThroughAge===persisted.character.age+1,'schema-12 save roundtrip preserves secured payment preference and paid-ahead state');
  sellVehicle(restored,persistedVehicleId);const postSale=migrateSave(JSON.parse(JSON.stringify(restored)) as unknown);verify(!postSale.assets.vehicles.some(item=>item.id===persistedVehicleId),'sold vehicles do not resurrect after save normalization');
  verify(validateState(postSale).length===0,'payment-management save roundtrip remains invariant-clean');

  return checks;
}
