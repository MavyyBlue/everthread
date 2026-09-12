import type { GameState, Npc, Relationship } from '../types/game';
import { createNewGame } from '../systems/CharacterSystem';
import { actionAllowed } from '../core/actionEconomy';
import { validateState } from '../core/invariants';
import { migrateSave, SAVE_VERSION } from '../services/SaveSystem';
import { luxuryVehicleDefinitions, propertyDefinitions, vehicleDefinitions } from '../data/assets';
import { assetFinanceProgramById, assetFinancePrograms } from '../data/assetFinancing';
import { creditInstitutionById } from '../data/creditInstitutions';
import { acceptAssetFinanceOffer, bestAssetFinanceOffer, getAssetFinanceOffers } from '../systems/AssetFinancingSystem';
import { buyProperty, buyVehicle, financeProperty, financeVehicle } from '../systems/PropertySystem';
import { creditAvailable, getCreditProfile, getCreditUnderwritingSnapshot } from '../systems/CreditSystem';
import { netWorth, processAnnualFinance } from '../systems/FinanceSystem';
import { previewEstate } from '../systems/EstateSystem';

function setAge(state:GameState,age:number){state.character.age=age;state.currentYear=2026+age;state.actionLedger.age=age;state.actionLedger.uses={};}
function strongBorrower(seed:string){
  const state=createNewGame({seed});setAge(state,30);state.finances.cash=500000;state.finances.annualIncome=180000;
  state.employment.current={jobId:'finance-fixture',title:'Systems Lead',company:'Fixture Works',startAge:24,salary:180000,performance:82,level:4};
  state.finances.credit.history.closedGoodStanding=1;state.finances.credit.history.archivedAccountYears=8;state.finances.credit.history.onTimePayments=12;
  return state;
}
function makeHeir(state:GameState,id='finance-heir'){
  const base=structuredClone(Object.values(state.npcs)[0]!) as Npc;base.id=id;base.firstName='Ari';base.age=24;base.alive=true;base.partnerId=undefined;base.maritalStatus='single';base.parentIds=[state.character.id];base.childIds=[];base.memories=[];base.assetPortfolio={properties:[],businesses:[]};
  state.npcs[id]=base;const rel:Relationship={id:`rel-${id}`,npcId:id,type:'child',score:75,attraction:0,compatibility:60,yearsKnown:24};state.relationships.push(rel);return base;
}

export function runAssetFinancingRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Asset financing regression failed: ${message}`);}
  function approx(actual:number,expected:number,tolerance:number,message:string){verify(Math.abs(actual-expected)<=tolerance,`${message} (expected ${expected}±${tolerance}, got ${actual})`);}

  const definitions=assetFinancePrograms;verify(definitions.filter(item=>item.kind==='vehicle').length===3&&definitions.filter(item=>item.kind==='home').length===3,'marketplace has distinct reusable vehicle and home financing programs');
  verify(new Set(definitions.map(item=>item.id)).size===definitions.length,'financing program ids are unique and stable');
  verify(definitions.every(item=>Boolean(creditInstitutionById[item.institutionId])),'every financing program resolves to an existing CreditSystem institution');
  verify(definitions.every(item=>item.minDownPaymentRate>0&&item.termYears>0&&item.baseAnnualRate>0),'every financing program declares real down-payment, term, and APR requirements');
  verify(SAVE_VERSION===11,'Phase 6B1 remains schema-11 compatible rather than introducing unnecessary save churn');

  const browse=strongBorrower('asset-finance-browse');const browseBefore=JSON.stringify(browse);const browseRng=browse.rngCounter;const browseIds=browse.idCounter;const vehicleOffers=getAssetFinanceOffers(browse,{kind:'vehicle',price:22000,downPaymentRate:.2});
  verify(JSON.stringify(browse)===browseBefore,'browsing asset financing is strictly read-only');
  verify(browse.rngCounter===browseRng&&browse.idCounter===browseIds,'offer browsing consumes neither gameplay RNG nor persistent ids');
  verify(vehicleOffers.length===3&&vehicleOffers.every(offer=>offer.program.kind==='vehicle'),'vehicle marketplace exposes only vehicle programs');
  verify(vehicleOffers.filter(offer=>offer.eligible).length>=2,'strong established borrower sees multiple comparable vehicle approvals');
  verify(vehicleOffers.every(offer=>offer.downPayment===4400&&offer.amountFinanced===17600),'every lender quotes from the same requested cash down payment and financed principal');
  verify(vehicleOffers.every(offer=>offer.annualPayment>0&&offer.monthlyEquivalent>0&&offer.financeCharge>0&&offer.totalFinancingCost>22000),'offers expose payment obligation, finance charge, and full-term total cost');
  verify(vehicleOffers.every(offer=>Math.abs(offer.monthlyEquivalent-offer.annualPayment/12)<1),'monthly equivalent is a faithful presentation of the authoritative annual payment');
  const repeated=getAssetFinanceOffers(browse,{kind:'vehicle',price:22000,downPaymentRate:.2});verify(JSON.stringify(repeated)===JSON.stringify(vehicleOffers),'reopening the same marketplace never rerolls approval or terms');

  const down10=getAssetFinanceOffers(browse,{kind:'vehicle',price:22000,downPaymentRate:.1}).find(offer=>offer.id==='northstar_auto')!;const down35=getAssetFinanceOffers(browse,{kind:'vehicle',price:22000,downPaymentRate:.35}).find(offer=>offer.id==='northstar_auto')!;
  verify(down35.amountFinanced<down10.amountFinanced&&down35.annualPayment<down10.annualPayment,'larger down payment reduces principal and recurring payment');
  verify(down35.annualRate<=down10.annualRate,'larger down payment never receives a worse deterministic APR from the same lender');
  verify(down35.totalFinancingCost<down10.totalFinancingCost,'larger down payment reduces total financing cost for the same program');

  const thin=createNewGame({seed:'asset-finance-thin'});setAge(thin,30);thin.finances.cash=100000;thin.finances.annualIncome=80000;thin.employment.current={jobId:'thin',title:'Coordinator',company:'Fixture Works',startAge:29,salary:80000,performance:60,level:1};const thinOffers=getAssetFinanceOffers(thin,{kind:'vehicle',price:22000,downPaymentRate:.2});
  verify(thinOffers.every(offer=>!offer.eligible),'thin-file borrower is not silently treated as established credit');
  verify(thinOffers.some(offer=>Boolean(offer.reason?.includes('credit profile'))),'credit-based decline exposes the actual underwriting reason');
  const poorCash=strongBorrower('asset-finance-cash');poorCash.finances.cash=1000;const cashDecline=getAssetFinanceOffers(poorCash,{kind:'vehicle',price:22000,downPaymentRate:.2});verify(cashDecline.every(offer=>!offer.eligible),'lenders reject a down payment the player cannot actually fund');
  verify(cashDecline.some(offer=>Boolean(offer.reason?.includes('cash for this down payment'))),'cash decline is player-visible and specific');
  const lowIncome=strongBorrower('asset-finance-income');lowIncome.employment.current!.salary=8000;lowIncome.finances.annualIncome=8000;verify(getAssetFinanceOffers(lowIncome,{kind:'vehicle',price:22000,downPaymentRate:.2}).some(offer=>Boolean(offer.reason?.includes('annual income'))),'income requirement participates in underwriting');
  const bankrupt=strongBorrower('asset-finance-bankruptcy');bankrupt.flags.lastBankruptcyAge=29;verify(getAssetFinanceOffers(bankrupt,{kind:'home',price:200000,downPaymentRate:.2}).every(offer=>!offer.eligible),'recent bankruptcy constrains real home underwriting');
  verify(getAssetFinanceOffers(bankrupt,{kind:'home',price:200000,downPaymentRate:.2}).some(offer=>Boolean(offer.reason?.includes('recovery after bankruptcy'))),'bankruptcy decline explains the recovery requirement');

  const accept=strongBorrower('asset-finance-accept');const acceptBeforeCash=accept.finances.cash;const acceptCredit=creditAvailable(accept);const preview=bestAssetFinanceOffer(accept,{kind:'vehicle',price:22000,downPaymentRate:.2});verify(Boolean(preview),'strong borrower has a best eligible vehicle quote');
  const signed=acceptAssetFinanceOffer(accept,{kind:'vehicle',price:22000,downPaymentRate:.2},preview!.id);verify(signed.result.success&&Boolean(signed.loan)&&Boolean(signed.offer),'signing an eligible quote creates an authoritative liability');
  verify(signed.loan!.kind==='car'&&signed.loan!.principal===preview!.amountFinanced&&signed.loan!.balance===preview!.amountFinanced,'signed vehicle liability uses the exact previewed financed amount');
  verify(signed.loan!.annualRate===preview!.annualRate&&signed.loan!.annualPayment===preview!.annualPayment&&signed.loan!.remainingYears===preview!.termYears,'signed APR, payment, and term exactly match the preview');
  verify(accept.finances.cash===acceptBeforeCash-preview!.downPayment,'signing consumes only the quoted cash down payment up front');
  verify(creditAvailable(accept)===acceptCredit,'installment financing does not masquerade as revolving Credit Available');
  verify(accept.finances.credit.inquiries.at(-1)?.productId===preview!.program.id&&accept.finances.credit.inquiries.at(-1)?.outcome==='approved','signed financing creates durable approved credit history tied to the lender program');
  verify(!actionAllowed(accept,{policy:'credit.application.product',target:`asset:${preview!.id}`}), 'the same financing program cannot be rerolled by repeated formal applications in one age');

  const stale=strongBorrower('asset-finance-stale');const staleOffer=bestAssetFinanceOffer(stale,{kind:'vehicle',price:22000,downPaymentRate:.2})!;stale.finances.cash=0;const staleSigned=acceptAssetFinanceOffer(stale,{kind:'vehicle',price:22000,downPaymentRate:.2},staleOffer.id);verify(!staleSigned.result.success,'signing re-underwrites current state instead of trusting a stale UI quote');
  verify(stale.finances.liabilities.length===0&&stale.finances.credit.inquiries.length===0,'failed re-underwriting creates neither phantom debt nor a false approval inquiry');

  const repeatedApps=strongBorrower('asset-finance-action-cap');repeatedApps.employment.current!.salary=1000000;repeatedApps.finances.annualIncome=1000000;repeatedApps.finances.cash=1000000;const smallRequest={kind:'vehicle' as const,price:1000,downPaymentRate:.5};const smallOffers=getAssetFinanceOffers(repeatedApps,smallRequest).filter(offer=>offer.eligible);verify(smallOffers.length>=3,'high-capacity fixture can exercise the formal application cap');
  verify(acceptAssetFinanceOffer(repeatedApps,smallRequest,smallOffers[0]!.id).result.success,'first formal financing contract succeeds');verify(acceptAssetFinanceOffer(repeatedApps,smallRequest,smallOffers[1]!.id).result.success,'second distinct formal financing contract succeeds');verify(!acceptAssetFinanceOffer(repeatedApps,smallRequest,smallOffers[2]!.id).result.success,'third formal credit application in the same age is blocked by the shared credit action economy');
  verify(repeatedApps.finances.credit.inquiries.length===2,'blocked third attempt does not invent an inquiry');

  const vehicleState=strongBorrower('asset-finance-vehicle');const vehicle=vehicleDefinitions.find(item=>item.id==='economy_base')!;verify(Boolean(vehicle),'known economy vehicle fixture exists');const vehiclePreview=bestAssetFinanceOffer(vehicleState,{kind:'vehicle',price:vehicle.price,downPaymentRate:.2})!;const vehicleWorth=netWorth(vehicleState);const vehicleCash=vehicleState.finances.cash;const vehicleResult=financeVehicle(vehicleState,vehicle.id,vehiclePreview.id,.2);verify(vehicleResult.success,'vehicle Finance path completes through the reusable financing authority');
  const ownedVehicle=vehicleState.assets.vehicles.at(-1)!;const carLoan=vehicleState.finances.liabilities.find(item=>item.kind==='car'&&item.assetId===ownedVehicle.id);verify(Boolean(carLoan),'financed vehicle creates a persistent collateral-linked car liability');
  verify(carLoan!.principal===vehiclePreview.amountFinanced&&carLoan!.annualRate===vehiclePreview.annualRate&&carLoan!.annualPayment===vehiclePreview.annualPayment,'vehicle liability terms preserve preview→signed parity');
  verify(vehicleState.finances.cash===vehicleCash-vehiclePreview.downPayment,'vehicle Finance path deducts the quote down payment, not full price');approx(netWorth(vehicleState),vehicleWorth,.01,'vehicle financing exchanges cash/equity/debt without fabricating wealth');
  verify(vehicleState.timeline.at(-1)?.text.includes('financed')===true&&Boolean(vehicleState.timeline.at(-1)?.detail?.includes('APR')),'financed vehicle remains visible in durable life history with contract terms');
  verify(validateState(vehicleState).length===0,'financed vehicle state passes full invariants');

  const outrightVehicle=strongBorrower('asset-finance-vehicle-cash');const outrightVehicleCash=outrightVehicle.finances.cash;const outrightVehicleInquiries=outrightVehicle.finances.credit.inquiries.length;verify(buyVehicle(outrightVehicle,vehicle.id).success,'Buy Outright vehicle path remains available');verify(outrightVehicle.finances.cash===outrightVehicleCash-vehicle.price,'vehicle outright path pays full cash price');verify(!outrightVehicle.finances.liabilities.some(item=>item.kind==='car')&&outrightVehicle.finances.credit.inquiries.length===outrightVehicleInquiries,'vehicle outright purchase creates no lender debt or inquiry');verify(outrightVehicle.timeline.at(-1)?.text.includes('outright')===true,'material outright vehicle purchase is visible in life history');

  const specialized=strongBorrower('asset-finance-specialized');specialized.flags.boatLicense=true;const boat=luxuryVehicleDefinitions.find(item=>item.id==='boat_daycruiser')!;const boatOffer=bestAssetFinanceOffer(specialized,{kind:'vehicle',price:boat.price,downPaymentRate:.2})!;const boatFinance=financeVehicle(specialized,boat.id,boatOffer.id,.2);verify(!boatFinance.success&&Boolean(boatFinance.messages[0]?.text.includes('Specialized financing')),'road-vehicle lender programs cannot silently finance boats or aircraft');verify(!specialized.finances.liabilities.some(item=>item.kind==='car')&&specialized.finances.credit.inquiries.length===0,'unsupported specialized-vehicle financing creates no debt or inquiry');

  const homeState=strongBorrower('asset-finance-home');homeState.economy.housingIndex=1;const home=propertyDefinitions.find(item=>item.id==='starter_house_value')!;const homePrice=Math.round(home.basePrice*homeState.economy.housingIndex);verify(Boolean(home)&&homePrice>0,'known starter-home fixture exists');const homeOffers=getAssetFinanceOffers(homeState,{kind:'home',price:homePrice,downPaymentRate:.2});const homePreview=homeOffers.find(item=>item.eligible)!;verify(Boolean(homePreview),'strong borrower receives at least one home financing approval');const homeWorth=netWorth(homeState);const homeCash=homeState.finances.cash;const homeResult=financeProperty(homeState,home.id,homePreview.id,.2);verify(homeResult.success,'home Finance path completes through the same reusable financing authority');
  const ownedHome=homeState.assets.properties.at(-1)!;const mortgage=homeState.finances.liabilities.find(item=>item.id===ownedHome.mortgageId);verify(Boolean(mortgage)&&mortgage?.kind==='mortgage','financed home links property to a real mortgage liability');verify(mortgage!.assetId===ownedHome.id,'mortgage collateral link points back to the exact purchased home');verify(mortgage!.principal===homePreview.amountFinanced&&mortgage!.annualRate===homePreview.annualRate&&mortgage!.annualPayment===homePreview.annualPayment,'mortgage terms exactly match the player-visible lender quote');verify(homeState.finances.cash===homeCash-homePreview.downPayment,'home Finance path deducts the exact quoted down payment');approx(netWorth(homeState),homeWorth,.01,'home financing preserves accounting identity at purchase');verify(homeState.timeline.at(-1)?.detail?.includes(homePreview.program.name)===true,'home financing history preserves lender-program contract context');verify(validateState(homeState).length===0,'financed home state passes full invariants');

  const outrightHome=strongBorrower('asset-finance-home-cash');outrightHome.economy.housingIndex=1;const outrightHomeCash=outrightHome.finances.cash;const outrightHomeInquiries=outrightHome.finances.credit.inquiries.length;verify(buyProperty(outrightHome,home.id,false).success,'Buy Outright home path remains available');verify(outrightHome.finances.cash===outrightHomeCash-homePrice,'home outright path pays the full market price');verify(!outrightHome.assets.properties.at(-1)?.mortgageId&&!outrightHome.finances.liabilities.some(item=>item.kind==='mortgage'),'home outright purchase creates no mortgage');verify(outrightHome.finances.credit.inquiries.length===outrightHomeInquiries,'home outright purchase creates no credit inquiry');

  const annual=strongBorrower('asset-finance-annual');const annualPreview=bestAssetFinanceOffer(annual,{kind:'vehicle',price:22000,downPaymentRate:.2})!;const annualSigned=acceptAssetFinanceOffer(annual,{kind:'vehicle',price:22000,downPaymentRate:.2},annualPreview.id);const beforeAnnualBalance=annualSigned.loan!.balance;processAnnualFinance(annual);const afterAnnualLoan=annual.finances.liabilities.find(item=>item.id===annualSigned.loan!.id);verify(Boolean(afterAnnualLoan)&&afterAnnualLoan!.balance<beforeAnnualBalance,'existing annual finance machinery services the new car liability');verify(afterAnnualLoan!.remainingYears===annualPreview.termYears-1,'annual finance decrements the signed financing term exactly once');

  const estate=strongBorrower('asset-finance-estate');makeHeir(estate);const estatePreviewOffer=bestAssetFinanceOffer(estate,{kind:'vehicle',price:22000,downPaymentRate:.2})!;const estateResult=financeVehicle(estate,vehicle.id,estatePreviewOffer.id,.2);verify(estateResult.success,'estate fixture acquires financed vehicle');const estateCarDebt=estate.finances.liabilities.filter(item=>item.kind==='car').reduce((sum,item)=>sum+item.balance,0);verify(previewEstate(estate).debtObligations>=estateCarDebt,'car financing is included in estate debt obligations rather than disappearing at death');

  const saved=migrateSave(structuredClone(homeState));const savedHome=saved.assets.properties.find(item=>item.id===ownedHome.id);const savedMortgage=saved.finances.liabilities.find(item=>item.id===mortgage!.id);verify(saved.saveVersion===11&&Boolean(savedHome)&&Boolean(savedMortgage),'schema-11 save normalization preserves financed home asset and liability');verify(savedMortgage!.annualRate===mortgage!.annualRate&&savedMortgage!.annualPayment===mortgage!.annualPayment&&savedMortgage!.assetId===savedHome!.id,'save round trip preserves signed contract terms and collateral link');verify(saved.finances.credit.inquiries.some(item=>item.productId===homePreview.program.id),'save round trip preserves financing inquiry/lender history');verify(validateState(saved).length===0,'saved financed-asset state remains invariant-clean');

  const underwriting=getCreditUnderwritingSnapshot(homeState);verify(underwriting.profile.score===getCreditProfile(homeState).score,'asset underwriting consumes the CreditSystem profile as its single score authority');verify(underwriting.annualDebtPayments>=mortgage!.annualPayment,'underwriting debt burden includes persistent installment payment obligations after signing');verify(Boolean(assetFinanceProgramById[homePreview.program.id]),'signed lender program remains resolvable for history/UI presentation');

  return checks;
}
