import { createNewGame } from '../systems/CharacterSystem';
import { cureSecuredLoan, getSecuredLoanStatus, processAnnualFinance, wealthBreakdown } from '../systems/FinanceSystem';
import { sellProperty } from '../systems/PropertySystem';
import { migrateSave, SAVE_VERSION } from '../services/SaveSystem';
import type { GameState, Loan, PropertyAsset, VehicleAsset } from '../types/game';

function adult(seed:string,age=30){
  const state=createNewGame({seed});
  state.character.age=age;
  state.currentYear=state.character.birthYear+age;
  state.finances.cash=0;
  state.finances.liabilities=[];
  state.employment.current=undefined;
  state.employment.partTimeJobs=[];
  state.businesses=[];
  state.pets=[];
  state.assets={properties:[],vehicles:[],collectibles:[]};
  state.investments.positions=[];
  state.economy.inflationIndex=1;
  state.economy.housingIndex=1;
  state.economy.salaryIndex=1;
  state.finances.credit.derogatories=[];
  return state;
}

function addCar(state:GameState,{value=22000,balance=18000,payment=5000,rate=.05,delinquent=false}:{value?:number;balance?:number;payment?:number;rate?:number;delinquent?:boolean}={}){
  const vehicle:VehicleAsset={id:'car-asset',typeId:'compact_hatchback',name:'Fixture Hatchback',purchasePrice:value,value,age:1,condition:90,mileage:12000,category:'car'};
  const loan:Loan={id:'car-loan',kind:'car',principal:balance,balance,annualRate:rate,annualPayment:payment,remainingYears:4,assetId:vehicle.id,...(delinquent?{delinquency:{status:'delinquent',arrears:payment,missedPayments:1,lastMissedPaymentAge:state.character.age-1}}:{})};
  state.assets.vehicles.push(vehicle);state.finances.liabilities.push(loan);return{vehicle,loan};
}

function addHome(state:GameState,{value=300000,balance=200000,payment=25000,rate=.052,delinquent=false}:{value?:number;balance?:number;payment?:number;rate?:number;delinquent?:boolean}={}){
  const property:PropertyAsset={id:'home-asset',typeId:'starter_house_standard',name:'Fixture Home',location:state.character.city,purchasePrice:value,marketValue:value,condition:86,age:8,amenities:[],mortgageId:'home-loan'};
  const loan:Loan={id:'home-loan',kind:'mortgage',principal:balance,balance,annualRate:rate,annualPayment:payment,remainingYears:20,assetId:property.id,...(delinquent?{delinquency:{status:'delinquent',arrears:payment,missedPayments:1,lastMissedPaymentAge:state.character.age-1}}:{})};
  state.assets.properties.push(property);state.finances.liabilities.push(loan);return{property,loan};
}

function approx(actual:number,expected:number,tolerance:number,message:string){
  if(Math.abs(actual-expected)>tolerance)throw new Error(`Asset delinquency regression failed: ${message} (${actual} vs ${expected})`);
}

export function runAssetDelinquencyRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Asset delinquency regression failed: ${message}`);}
  function verifyApprox(actual:number,expected:number,tolerance:number,message:string){checks+=1;approx(actual,expected,tolerance,message);}

  verify(SAVE_VERSION===11,'Phase 6B2 remains backward-compatible with schema 11');

  const legacy=adult('secured-status-legacy');const {loan:legacyCar}=addCar(legacy);
  const legacyStatus=getSecuredLoanStatus(legacy,legacyCar);
  verify(Boolean(legacyStatus),'a legacy secured car loan exposes a derived status');
  verify(legacyStatus!.status==='current'&&legacyStatus!.arrears===0&&legacyStatus!.missedPayments===0,'missing delinquency fields read as current without migration');
  verify(legacyCar.delinquency===undefined,'read-only status inspection does not mutate legacy loan state');
  verify(legacyStatus!.collateralName==='Fixture Hatchback'&&legacyStatus!.consequence==='repossession','car status resolves real collateral and consequence');
  verify(getSecuredLoanStatus(legacy,{id:'personal',kind:'personal',principal:100,balance:100,annualRate:.1,annualPayment:20,remainingYears:1})===undefined,'unsecured loans do not masquerade as collateral-backed loans');

  const current=adult('secured-current-payment');const {loan:currentCar}=addCar(current);current.finances.cash=100000;
  processAnnualFinance(current);
  verify(current.assets.vehicles.some(item=>item.id==='car-asset'),'a current car loan does not seize collateral');
  verify(current.finances.liabilities.some(item=>item.id==='car-loan'),'a normally amortizing car loan remains active');
  verifyApprox(currentCar.balance,13900,.01,'a current annual car payment amortizes principal after interest');
  verify(currentCar.remainingYears===3,'a current secured payment advances the contractual term');
  verify(getSecuredLoanStatus(current,currentCar)?.status==='current','a paid secured loan remains current');
  verify(!current.finances.credit.derogatories.some(item=>item.kind==='missed_payment'),'a paid secured loan creates no missed-payment derogatory');

  const missedCar=adult('secured-car-miss');const {loan:missedCarLoan}=addCar(missedCar);missedCar.finances.cash=21000;
  processAnnualFinance(missedCar);
  const missedCarStatus=getSecuredLoanStatus(missedCar,missedCarLoan)!;
  verify(missedCarStatus.status==='delinquent','a cash shortfall can make a financed vehicle delinquent instead of pretending the payment cleared');
  verifyApprox(missedCarStatus.arrears,5000,.01,'the full skipped annual vehicle payment becomes visible arrears');
  verify(missedCarStatus.missedPayments===1&&missedCarStatus.lastMissedPaymentAge===30,'vehicle delinquency records one missed payment at the correct age');
  verifyApprox(missedCarLoan.balance,18900,.01,'a missed vehicle payment leaves interest accrued and does not reduce principal');
  verify(missedCarLoan.remainingYears===4,'a missed vehicle payment does not consume a loan year');
  verify(missedCar.finances.cash>0,'skipping the unaffordable secured payment releases cash instead of leaving negative cash');
  verify(!missedCar.finances.liabilities.some(item=>item.kind==='personal'),'a secured payment release prevents unnecessary unsecured shortfall debt when it fully covers the gap');
  verify(missedCar.assets.vehicles.some(item=>item.id==='car-asset'),'the first missed vehicle payment leaves a cure window before repossession');
  verify(missedCar.finances.credit.derogatories.some(item=>item.kind==='missed_payment'&&item.summary.includes('Fixture Hatchback')),'a secured miss reaches the existing credit-history authority');
  verify(missedCar.timeline.some(item=>item.text.includes('before your next Age Up')&&item.text.includes('repossession')),'the timeline gives an explicit cure deadline and consequence');

  const cureLow=structuredClone(missedCar);cureLow.finances.cash=4999;
  const lowResult=cureSecuredLoan(cureLow,'car-loan');
  verify(!lowResult.success,'curing delinquency fails when cash cannot cover the past-due amount');
  verify(getSecuredLoanStatus(cureLow,'car-loan')?.status==='delinquent','a failed cure attempt does not clear delinquency');
  verifyApprox(cureLow.finances.cash,4999,.01,'a failed cure attempt does not charge partial cash');

  const cured=structuredClone(missedCar);cured.finances.cash=6000;const beforeCureBalance=cured.finances.liabilities.find(item=>item.id==='car-loan')!.balance;
  const cureResult=cureSecuredLoan(cured,'car-loan');const curedLoan=cured.finances.liabilities.find(item=>item.id==='car-loan')!;
  verify(cureResult.success,'a player with enough cash can explicitly cure a secured delinquency');
  verifyApprox(cured.finances.cash,1000,.01,'curing uses cash rather than revolving credit capacity');
  verifyApprox(curedLoan.balance,beforeCureBalance-5000,.01,'the cured past-due payment actually reduces the loan balance');
  verify(curedLoan.remainingYears===3,'curing restores the loan to the term it would have had after an on-time payment');
  verify(getSecuredLoanStatus(cured,curedLoan)?.status==='current','a cured secured loan returns to current status');
  verify(cured.timeline.some(item=>item.text.includes('cured the past-due payment')),'a cure creates durable timeline history');
  verify(!cureSecuredLoan(cured,'car-loan').success,'a current loan cannot be charged for the same cure twice');

  const payoff=adult('secured-cure-payoff');const {property:payoffHome,loan:payoffLoan}=addHome(payoff,{balance:1000,payment:1000});payoffLoan.delinquency={status:'delinquent',arrears:1000,missedPayments:1,lastMissedPaymentAge:payoff.character.age};payoff.finances.cash=1000;
  verify(cureSecuredLoan(payoff,payoffLoan.id).success,'a final past-due payment can cure and pay off a mortgage');
  verify(!payoff.finances.liabilities.some(item=>item.id===payoffLoan.id),'a fully cured payoff removes the settled mortgage liability');
  verify(payoffHome.mortgageId===undefined,'a paid-off mortgage clears the property collateral link');

  const repo=adult('secured-repo');const {loan:repoLoan}=addCar(repo,{value:5000,balance:20000,payment:5000});repo.finances.cash=23000;processAnnualFinance(repo);
  verify(getSecuredLoanStatus(repo,repoLoan)?.status==='delinquent','repossession fixture first enters delinquency');
  repo.character.age+=1;repo.currentYear+=1;repo.finances.cash=50000;processAnnualFinance(repo);
  verify(!repo.assets.vehicles.some(item=>item.id==='car-asset'),'uncured vehicle delinquency repossesses the collateral on the next age');
  verify(!repo.finances.liabilities.some(item=>item.id==='car-loan'),'repossession removes the original secured car loan');
  verify(Number(repo.flags.repossessions??0)===1,'repossession is counted exactly once');
  verify(repo.finances.credit.derogatories.some(item=>item.kind==='default'&&item.summary.includes('Repossession')),'repossession persists as a major credit default');
  verify(repo.finances.liabilities.some(item=>item.kind==='personal'),'a repossession deficiency survives as unsecured debt instead of disappearing');
  verify(repo.timeline.some(item=>item.text.includes('repossessed')&&item.text.includes('deficiency debt')),'repossession timeline explains the remaining deficiency');
  const repoCount=Number(repo.flags.repossessions??0);processAnnualFinance(repo);verify(Number(repo.flags.repossessions??0)===repoCount,'a resolved repossession cannot fire twice');

  const surplusRepo=adult('secured-repo-surplus');const {loan:surplusLoan}=addCar(surplusRepo,{value:50000,balance:10000,payment:3000});surplusLoan.delinquency={status:'delinquent',arrears:3000,missedPayments:1,lastMissedPaymentAge:surplusRepo.character.age-1};surplusRepo.finances.cash=25000;
  processAnnualFinance(surplusRepo);
  verify(!surplusRepo.assets.vehicles.length&&!surplusRepo.finances.liabilities.some(item=>item.id==='car-loan'),'surplus repossession still closes collateral and secured liability');
  verify(!surplusRepo.finances.liabilities.some(item=>item.kind==='personal'),'surplus recovery does not invent deficiency debt');
  verify(surplusRepo.finances.cash>25000,'value above the loan payoff can return surplus cash even after annual living costs');

  const missedHome=adult('secured-home-miss',40);const {loan:missedHomeLoan}=addHome(missedHome);missedHome.finances.cash=35000;
  processAnnualFinance(missedHome);const missedHomeStatus=getSecuredLoanStatus(missedHome,missedHomeLoan)!;
  verify(missedHomeStatus.status==='delinquent'&&missedHomeStatus.consequence==='foreclosure','a mortgage shortfall enters visible foreclosure-risk delinquency');
  verifyApprox(missedHomeStatus.arrears,25000,.01,'the skipped mortgage payment becomes visible arrears');
  verifyApprox(missedHomeLoan.balance,210400,.01,'a missed mortgage payment accrues interest without fake amortization');
  verify(missedHome.assets.properties.some(item=>item.id==='home-asset'),'the first missed mortgage payment preserves the home during the cure window');
  verify(missedHome.finances.credit.derogatories.some(item=>item.kind==='missed_payment'&&item.summary.includes('Fixture Home')),'a missed mortgage payment reaches credit history');

  const homeCure=structuredClone(missedHome);homeCure.finances.cash=25000;
  verify(cureSecuredLoan(homeCure,'home-loan').success,'a delinquent mortgage can be cured before the next Age Up');
  verify(getSecuredLoanStatus(homeCure,'home-loan')?.status==='current','a cured mortgage leaves foreclosure risk');
  homeCure.character.age+=1;homeCure.currentYear+=1;homeCure.finances.cash=100000;processAnnualFinance(homeCure);
  verify(homeCure.assets.properties.some(item=>item.id==='home-asset'),'a cured mortgage is not foreclosed next year');

  const foreclosure=adult('secured-foreclosure',40);const {loan:foreclosureLoan}=addHome(foreclosure,{value:300000,balance:200000,payment:25000});foreclosureLoan.delinquency={status:'delinquent',arrears:25000,missedPayments:1,lastMissedPaymentAge:39};foreclosure.finances.cash=0;
  processAnnualFinance(foreclosure);
  verify(!foreclosure.assets.properties.some(item=>item.id==='home-asset'),'uncured mortgage delinquency forecloses the collateral on the next age');
  verify(!foreclosure.finances.liabilities.some(item=>item.id==='home-loan'),'foreclosure removes the original mortgage liability');
  verify(Number(foreclosure.flags.foreclosures??0)===1,'foreclosure is recorded exactly once');
  verify(foreclosure.finances.credit.derogatories.some(item=>item.kind==='foreclosure'),'foreclosure persists in credit history');
  verify(!foreclosure.finances.liabilities.some(item=>item.kind==='personal'),'a well-equitied foreclosure does not create deficiency debt');
  verify(foreclosure.finances.cash>0,'remaining foreclosure equity is returned as cash before ordinary annual costs');

  const underwater=adult('secured-foreclosure-deficiency',40);const {loan:underwaterLoan}=addHome(underwater,{value:100000,balance:180000,payment:20000});underwaterLoan.delinquency={status:'delinquent',arrears:20000,missedPayments:1,lastMissedPaymentAge:39};underwater.finances.cash=50000;
  processAnnualFinance(underwater);
  verify(underwater.finances.liabilities.some(item=>item.kind==='personal'),'an underwater foreclosure converts the unrecovered secured balance into unsecured deficiency debt');
  verify(underwater.timeline.some(item=>item.text.includes('foreclosure')&&item.text.includes('deficiency debt')),'underwater foreclosure explains the deficiency in durable history');

  const priority=adult('secured-priority',40);const {loan:priorityCar}=addCar(priority);const {loan:priorityHome}=addHome(priority);priority.finances.cash=53000;
  processAnnualFinance(priority);
  verify(getSecuredLoanStatus(priority,priorityCar)?.status==='delinquent','when one secured payment must fail, vehicle financing is missed before housing');
  verify(getSecuredLoanStatus(priority,priorityHome)?.status==='current','default payment priority protects the home when the vehicle miss covers the cash gap');
  verify(priority.assets.properties.length===1&&priority.assets.vehicles.length===1,'priority selection itself does not prematurely seize either asset');

  const both=adult('secured-both-miss',40);const {loan:bothCar}=addCar(both);const {loan:bothHome}=addHome(both);both.finances.cash=20000;
  processAnnualFinance(both);
  verify(getSecuredLoanStatus(both,bothCar)?.status==='delinquent','a deep shortfall can miss the vehicle payment');
  verify(getSecuredLoanStatus(both,bothHome)?.status==='delinquent','a deep shortfall can also miss the mortgage after the vehicle payment is released');
  verify(both.finances.liabilities.some(item=>item.kind==='personal'),'cash needs beyond both skipped secured payments remain explicit unsecured debt');

  const underwaterSale=adult('secured-voluntary-sale-deficiency',35);const {property:underwaterSaleHome}=addHome(underwaterSale,{value:100000,balance:120000,payment:12000});underwaterSale.finances.cash=1000;
  const saleResult=sellProperty(underwaterSale,underwaterSaleHome.id);
  verify(saleResult.success,'an underwater financed home can still be sold voluntarily');
  verify(!underwaterSale.assets.properties.length&&!underwaterSale.finances.liabilities.some(item=>item.id==='home-loan'),'voluntary sale closes the property and original mortgage');
  const saleDeficiency=underwaterSale.finances.liabilities.find(item=>item.kind==='personal');
  verify(Boolean(saleDeficiency),'an underwater voluntary sale cannot erase debt by selling the collateral');
  verifyApprox(saleDeficiency!.balance,23500,.01,'voluntary-sale deficiency equals mortgage payoff minus net sale recovery');
  verify(Number(underwaterSale.flags.foreclosures??0)===0,'a voluntary underwater sale is not falsely recorded as foreclosure');

  const equitySale=adult('secured-voluntary-sale-equity',35);const {property:equityHome}=addHome(equitySale,{value:300000,balance:100000,payment:12000});equitySale.finances.cash=0;
  verify(sellProperty(equitySale,equityHome.id).success,'an equitied financed home can be sold');
  verifyApprox(equitySale.finances.cash,189500,.01,'voluntary sale returns exact net equity after payoff and selling costs');
  verify(!equitySale.finances.liabilities.some(item=>item.kind==='personal'),'an equitied sale does not create deficiency debt');

  const worthState=adult('secured-worth');const {loan:worthLoan}=addCar(worthState);worthLoan.balance=18900;worthLoan.delinquency={status:'delinquent',arrears:5000,missedPayments:1,lastMissedPaymentAge:30};
  const breakdown=wealthBreakdown(worthState);
  verifyApprox(breakdown.liabilities,18900,.01,'arrears are not double-counted on top of the authoritative loan balance');
  verifyApprox(breakdown.otherLiabilities,18900,.01,'delinquent car debt remains visible in normal liability accounting');

  const saveState=adult('secured-save-roundtrip');const {loan:saveLoan}=addCar(saveState);saveLoan.delinquency={status:'delinquent',arrears:5000,missedPayments:1,lastMissedPaymentAge:30};
  const restored=migrateSave(structuredClone(saveState));const restoredLoan=restored.finances.liabilities.find(item=>item.id==='car-loan')!;
  verify(restored.saveVersion===11,'secured delinquency persists without forcing a schema bump');
  verify(restoredLoan.delinquency?.status==='delinquent'&&restoredLoan.delinquency.arrears===5000,'schema-11 save roundtrip preserves new optional delinquency state');
  verify(getSecuredLoanStatus(restored,restoredLoan)?.consequence==='repossession','restored delinquency still resolves its collateral consequence');

  const legacySave=adult('secured-old-save');const {loan:legacySaveLoan}=addCar(legacySave);delete legacySaveLoan.delinquency;
  const legacyRestored=migrateSave(structuredClone(legacySave));
  verify(getSecuredLoanStatus(legacyRestored,'car-loan')?.status==='current','pre-6B2 schema-11 secured loans remain valid and current after load');

  return checks;
}
