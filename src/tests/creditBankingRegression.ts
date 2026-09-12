import type { GameState, Npc, Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { SAVE_VERSION, migrateSave } from '../services/SaveSystem';
import { actionAllowed } from '../core/actionEconomy';
import { validateState } from '../core/invariants';
import { netWorth, processAnnualFinance, wealthBreakdown } from '../systems/FinanceSystem';
import { previewEstate } from '../systems/EstateSystem';
import {
  applyForCreditCard,
  chargeCreditCard,
  closeCreditCard,
  creditAvailable,
  creditCardDebt,
  getCreditOffers,
  getCreditProfile,
  payCreditCard,
  processAnnualCredit,
  securedCreditDeposits,
} from '../systems/CreditSystem';

function setAge(state:GameState,age:number){state.character.age=age;state.currentYear=2026+age;state.actionLedger.age=age;state.actionLedger.uses={};}
function makeHeir(state:GameState,id='credit-heir'){
  const base=structuredClone(Object.values(state.npcs)[0]!) as Npc;base.id=id;base.firstName='Ari';base.age=24;base.alive=true;base.partnerId=undefined;base.maritalStatus='single';base.parentIds=[state.character.id];base.childIds=[];base.memories=[];base.assetPortfolio={properties:[],businesses:[]};
  state.npcs[id]=base;const rel:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:75,attraction:0,compatibility:60,yearsKnown:24};state.relationships.push(rel);return base;
}

export function runCreditBankingRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Credit & banking regression failed: ${message}`);}
  function approx(actual:number,expected:number,tolerance:number,message:string){verify(Math.abs(actual-expected)<=tolerance,`${message} (expected ${expected}±${tolerance}, got ${actual})`);}

  const fresh=createNewGame({seed:'credit-fresh'});
  verify(fresh.saveVersion===12&&SAVE_VERSION===12,'Phase 6A credit state remains valid under current save schema 12');
  verify(Array.isArray(fresh.finances.credit.accounts)&&fresh.finances.credit.accounts.length===0,'fresh lives initialize an empty credit-account authority');
  verify(fresh.finances.credit.transactions.length===0&&fresh.finances.credit.inquiries.length===0,'fresh credit history begins empty');
  verify(creditAvailable(fresh)===0&&creditCardDebt(fresh)===0&&securedCreditDeposits(fresh)===0,'fresh lives do not invent borrowing capacity, revolving debt, or secured deposits');
  verify(getCreditProfile(fresh).rating==='Building','a fresh thin file is visibly labeled as building rather than pretending to be established');

  const legacy=createNewGame({seed:'credit-v10-migration'});legacy.saveVersion=10;const legacyRng=legacy.rngCounter;delete (legacy.finances as unknown as {credit?:unknown}).credit;
  const migrated=migrateSave(legacy);
  verify(migrated.saveVersion===12&&Boolean(migrated.finances.credit),'v10 saves migrate to current schema 12 with credit state');
  verify(migrated.rngCounter===legacyRng,'credit migration consumes no player RNG');
  verify(migrated.finances.credit.accounts.length===0&&validateState(migrated).length===0,'credit migration is empty, deterministic, and invariant-clean');
  const remigrated=migrateSave(migrated);verify(JSON.stringify(remigrated.finances.credit)===JSON.stringify(migrated.finances.credit),'current-schema credit normalization is idempotent');

  const teen=createNewGame({seed:'credit-teen'});setAge(teen,16);teen.finances.cash=1000;
  const browseBefore=JSON.stringify(teen);const teenOffers=getCreditOffers(teen);verify(JSON.stringify(teen)===browseBefore,'browsing credit offers is strictly read-only');
  const seedOffer=teenOffers.find(offer=>offer.product.id==='hearthline_seed');verify(Boolean(seedOffer),'age 16 marketplace exposes the starter secured card');
  verify(seedOffer?.eligible===true&&seedOffer.startingLimit===200,'starter secured offer is visibly eligible with a fixed 200 line');
  verify(seedOffer?.product.depositRequired===200&&seedOffer.product.annualFee===0,'starter contract exposes its refundable deposit and annual fee terms');
  const northstarTeen=teenOffers.find(offer=>offer.product.id==='northstar_foundation');verify(Boolean(northstarTeen)&&northstarTeen?.eligible===false,'age-gated established card can be inspected but not accepted by a 16-year-old');
  verify(Boolean(northstarTeen?.reason?.includes('age 18')),'locked offer explains the age requirement');

  const worthBefore=netWorth(teen);const cashBefore=teen.finances.cash;const apply=applyForCreditCard(teen,'hearthline_seed');verify(apply.success,'eligible secured-card application succeeds');
  const card=teen.finances.credit.accounts.find(account=>account.productId==='hearthline_seed')!;verify(Boolean(card)&&card.status==='open','approved application creates one persistent open account');
  verify(card.creditLimit===200&&creditAvailable(teen)===200,'approved account exposes its actual available credit');
  verify(teen.finances.cash===cashBefore-200&&securedCreditDeposits(teen)===200,'secured deposit moves cash into a refundable deposit asset');
  approx(netWorth(teen),worthBefore,.01,'placing a secured deposit does not destroy net worth');
  verify(teen.finances.credit.inquiries.length===1&&teen.finances.credit.inquiries[0]?.outcome==='approved','formal approval creates a persistent inquiry record');
  verify(teen.finances.credit.transactions.some(tx=>tx.kind==='secured_deposit'&&tx.amount===200),'secured deposit appears in credit transaction history');
  verify(teen.timeline.some(entry=>entry.text.includes('approved your Seed Secured')),'credit approval is visible in the life timeline');
  verify(!actionAllowed(teen,{policy:'credit.application.product',target:'hearthline_seed'}),'the same product cannot be formally re-applied for in the same year');

  const netBeforeCharge=netWorth(teen);const charge=chargeCreditCard(teen,card.id,100);verify(charge.success,'open card supports a representative player-directed purchase');
  verify(card.balance===100&&creditAvailable(teen)===100&&creditCardDebt(teen)===100,'card purchase updates balance, debt, and available credit without touching cash');
  approx(netWorth(teen),netBeforeCharge-100,.01,'unsecured card spending reduces net worth because it creates a real liability');
  verify(card.statementBalance===100&&card.minimumDue===25,'purchase creates a visible statement balance and bounded minimum payment');
  verify(teen.finances.credit.transactions.some(tx=>tx.kind==='purchase'&&tx.amount===100),'purchase is recorded in the current-year transaction ledger');
  verify(!chargeCreditCard(teen,card.id,101).success,'card rejects a purchase above remaining available credit');

  const worthBeforePayment=netWorth(teen);const payment=payCreditCard(teen,card.id,100);verify(payment.success,'player can explicitly pay a card from cash');
  verify(Number(card.balance)===0&&creditAvailable(teen)===200,'payment restores available credit');
  verify(card.paymentsTowardStatement===100&&card.statementBalance===100,'full payment remains attached to the current statement until annual reporting');
  approx(netWorth(teen),worthBeforePayment,.01,'repaying revolving debt moves cash and liability together without changing net worth again');
  const annualPaid=processAnnualCredit(teen);verify(annualPaid.interest===0&&annualPaid.fees===0,'paid-in-full no-fee card accrues no annual credit cost');
  verify(teen.finances.credit.history.onTimePayments===1&&card.onTimePayments===1,'paid statement becomes positive payment history');
  verify(Number(card.statementBalance)===0&&Number(card.minimumDue)===0&&Number(card.paymentsTowardStatement)===0,'annual statement roll resets paid obligations cleanly');

  setAge(teen,17);const scoreAfterPositive=getCreditProfile(teen).score;verify(scoreAfterPositive>520,'established on-time history improves the derived credit score');
  card.autoPay=false;chargeCreditCard(teen,card.id,80);const beforeMissedBalance=card.balance;const missedCosts=processAnnualCredit(teen);verify(teen.finances.credit.history.missedPayments===1&&card.missedPayments===1,'unpaid statement records a missed payment');
  verify(card.balance>beforeMissedBalance&&missedCosts.interest>0,'missed revolving balance accrues contract interest');
  verify(teen.finances.credit.derogatories.some(item=>item.kind==='missed_payment'),'missed payment creates bounded derogatory history');
  verify(teen.timeline.some(entry=>entry.text.includes('missed the required payment')),'missed-payment consequence is durable in the player life timeline');
  verify(getCreditProfile(teen).score<scoreAfterPositive,'missed payment visibly damages derived creditworthiness');

  const decline=createNewGame({seed:'credit-decline'});setAge(decline,18);decline.finances.cash=1000;const declineBefore=JSON.stringify(decline.finances.credit.accounts);const declined=applyForCreditCard(decline,'northstar_foundation');verify(!declined.success,'thin-file applicant below underwriting requirements is declined');
  verify(JSON.stringify(decline.finances.credit.accounts)===declineBefore,'decline never creates a phantom account');
  verify(decline.finances.credit.inquiries.length===1&&decline.finances.credit.inquiries[0]?.outcome==='declined','decline persists as a formal inquiry');
  verify(Boolean(decline.finances.credit.inquiries[0]?.reason),'decline stores an understandable underwriting reason');
  applyForCreditCard(decline,'keystone_start');verify(!actionAllowed(decline,{policy:'credit.application.total'}),'formal applications are bounded per year instead of rerollable');

  const established=createNewGame({seed:'credit-established'});setAge(established,16);established.finances.cash=5000;verify(applyForCreditCard(established,'hearthline_seed').success,'established fixture opens starter card');const establishedCard=established.finances.credit.accounts[0]!;
  chargeCreditCard(established,establishedCard.id,50);payCreditCard(established,establishedCard.id,50);processAnnualCredit(established);setAge(established,18);established.employment.current={jobId:'credit-fixture',title:'Assistant',company:'Fixture Co',startAge:18,salary:30000,performance:65,level:1};
  const improvedOffers=getCreditOffers(established);const foundation=improvedOffers.find(offer=>offer.product.id==='northstar_foundation');verify(Boolean(foundation),'established-credit marketplace continues to expose better cards');
  verify(foundation?.eligible===true,'positive history plus income unlocks a better unsecured offer');
  verify((foundation?.startingLimit??0)>=1000,'better offer computes a meaningful underwriting-based starting line');
  const atlas=improvedOffers.find(offer=>offer.product.id==='atlas_reserve');verify(atlas===undefined||atlas.eligible===false,'premium product remains gated until the file is genuinely mature');

  const closeState=createNewGame({seed:'credit-close'});setAge(closeState,16);closeState.finances.cash=900;applyForCreditCard(closeState,'hearthline_seed');const closeCard=closeState.finances.credit.accounts[0]!;const postDepositCash=closeState.finances.cash;
  chargeCreditCard(closeState,closeCard.id,25);verify(!closeCreditCard(closeState,closeCard.id).success,'account with a balance cannot be closed to escape debt');payCreditCard(closeState,closeCard.id,25);const cashBeforeClose=closeState.finances.cash;verify(closeCreditCard(closeState,closeCard.id).success,'zero-balance account can be closed in good standing');
  verify(closeCard.status==='closed'&&closeState.finances.cash===cashBeforeClose+200&&closeState.finances.cash===postDepositCash+175,'closing secured card returns its refundable deposit to cash without refunding prior purchases');
  verify(closeState.finances.credit.history.closedGoodStanding===1&&securedCreditDeposits(closeState)===0,'good-standing closure persists compact positive history and clears deposit asset');
  verify(closeState.finances.credit.transactions.some(tx=>tx.kind==='deposit_refund'),'deposit refund remains visible in transaction history');
  verify(closeState.timeline.some(entry=>entry.text.includes('closed Seed Secured in good standing')),'account closure remains visible in durable life history');

  const bankrupt=createNewGame({seed:'credit-bankruptcy'});setAge(bankrupt,30);bankrupt.finances.cash=5000;bankrupt.employment.current={jobId:'bankruptcy-fixture',title:'Technician',company:'Fixture Co',startAge:25,salary:50000,performance:65,level:1};bankrupt.finances.credit.history.closedGoodStanding=1;bankrupt.finances.credit.history.archivedAccountYears=5;bankrupt.finances.credit.history.onTimePayments=3;applyForCreditCard(bankrupt,'northstar_foundation');const bankruptCard=bankrupt.finances.credit.accounts[0]!;chargeCreditCard(bankrupt,bankruptCard.id,100);bankrupt.finances.liabilities.push({id:'bankruptcy-personal',kind:'personal',principal:90000,balance:90000,annualRate:.12,annualPayment:1000,remainingYears:8});bankrupt.finances.cash=-100000;bankrupt.flags.cashShortfallYears=4;processAnnualFinance(bankrupt);
  verify(Number(bankrupt.flags.bankruptcies??0)>=1,'existing insolvency path still reaches bankruptcy with active credit cards');
  verify(bankruptCard.status==='defaulted'&&bankruptCard.balance===0,'bankruptcy closes and discharges active revolving accounts instead of leaving impossible live debt');
  verify(bankrupt.finances.credit.derogatories.some(item=>item.kind==='bankruptcy')&&bankrupt.finances.credit.derogatories.some(item=>item.kind==='default'),'bankruptcy and discharged-card default both persist in credit history');
  verify(creditAvailable(bankrupt)===0,'defaulted cards no longer expose borrowing capacity after bankruptcy');

  const estate=createNewGame({seed:'credit-estate'});setAge(estate,45);estate.finances.cash=1000;makeHeir(estate);applyForCreditCard(estate,'hearthline_seed');const estateCard=estate.finances.credit.accounts[0]!;chargeCreditCard(estate,estateCard.id,75);const estatePreview=previewEstate(estate);const expectedGross=estate.finances.cash+securedCreditDeposits(estate)+estate.assets.vehicles.reduce((sum,item)=>sum+item.value*.96,0)+estate.assets.collectibles.reduce((sum,item)=>sum+item.estimatedValue,0)+estate.investments.positions.reduce((sum,item)=>sum+item.units*(estate.investments.prices[item.securityId]??0),0)+estate.businesses.filter(item=>!item.bankrupt).reduce((sum,item)=>sum+item.valuation,0)+estate.assets.properties.reduce((sum,item)=>sum+item.marketValue,0);
  verify(estatePreview.grossEstateValue>0,'estate preview remains available with active revolving credit');
  verify(estatePreview.debtObligations>=75,'credit-card balances are real estate obligations rather than disappearing at death');
  verify(estatePreview.grossEstateValue>=estate.finances.cash+200,'refundable secured deposits are represented as estate value');
  verify(wealthBreakdown(estate).creditCardDebt===75&&wealthBreakdown(estate).securedCreditDeposits===200,'wealth breakdown exposes revolving debt and refundable deposit separately');
  verify(Number.isFinite(expectedGross),'estate integration fixture remains numerically sane');

  const bounded=createNewGame({seed:'credit-bounds'});setAge(bounded,16);bounded.finances.cash=5000;applyForCreditCard(bounded,'hearthline_seed');const boundedCard=bounded.finances.credit.accounts[0]!;
  for(let year=0;year<12;year++){setAge(bounded,16+year);for(let use=0;use<4;use++){const room=boundedCard.creditLimit-boundedCard.balance;if(room>=5)chargeCreditCard(bounded,boundedCard.id,5);}if(boundedCard.balance>0)payCreditCard(bounded,boundedCard.id,boundedCard.balance);processAnnualCredit(bounded);}
  verify(bounded.finances.credit.transactions.length<=160,'credit transaction history remains hard-bounded across years of use');
  verify(bounded.finances.credit.inquiries.length<=24&&bounded.finances.credit.derogatories.length<=20,'inquiry and derogatory histories remain bounded');
  verify(validateState(bounded).length===0,'long-running credit fixture remains invariant-clean');

  const corrupt=migrateSave(structuredClone(bounded));const corruptCard=corrupt.finances.credit.accounts[0]!;corruptCard.balance=999999;corruptCard.creditLimit=200;corruptCard.minimumDue=99999;corrupt.finances.credit.transactions=Array.from({length:220},(_,index)=>({id:`tx-${index}`,accountId:corruptCard.id,institutionId:corruptCard.institutionId,productId:corruptCard.productId,year:corrupt.currentYear,age:corrupt.character.age,kind:'purchase' as const,amount:1,description:'fixture'}));const repaired=migrateSave(corrupt);
  verify(repaired.finances.credit.accounts[0]!.balance<=repaired.finances.credit.accounts[0]!.creditLimit,'save normalization repairs impossible revolving balances');
  verify(repaired.finances.credit.transactions.length<=160,'save normalization trims oversized credit transaction history');
  verify(validateState(repaired).length===0,'repaired credit save passes full validation');

  return checks;
}
