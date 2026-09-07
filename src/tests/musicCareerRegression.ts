import { createNewGame } from '../systems/CharacterSystem';
import { activeSpecialCareerWorld } from '../systems/SpecialCareerWorldSystem';
import { musicPartnershipAction, processSpecialCareersYear, releaseMusic, tourMusic } from '../systems/SpecialCareerSystem';
import { musicCatalog, musicPartnershipOffer, processMusicCareerYear } from '../systems/MusicCareerCycleSystem';

export function runMusicCareerRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition {checks+=1;if(!condition)throw new Error(`Music-career regression failed: ${message}`);}

  const readOnlyState=createNewGame({seed:'phase4d3-music-readonly-regression'});
  verify(musicCatalog(readOnlyState).length===0,'reading an empty music catalog must return an empty projection');
  verify(readOnlyState.specialCareers.music===undefined,'read-only music projections must not create career state during UI render');

  const state=createNewGame({seed:'phase4d3-music-cycle-regression'});
  state.character.age=25;state.currentYear=2075;state.fame.fame=85;state.character.secondary.creativity=96;
  state.specialCareers.music={active:true,instrument:'vocals',skill:96,reputation:88,fanbase:50000};
  const cashBefore=state.finances.cash;const fansBefore=Number(state.specialCareers.music.fanbase);
  const album=releaseMusic(state,'album');
  verify(album.success,'a qualified musician must be able to launch an album');
  const world=activeSpecialCareerWorld(state,'music');
  verify(Boolean(world),'the first substantial release must create/reuse a persistent music world');
  const firstCatalog=musicCatalog(state);
  verify(firstCatalog.length===1,'the first release must enter bounded catalog history');
  verify(firstCatalog[0]!.kind==='album','catalog history must preserve release kind');
  verify(firstCatalog[0]!.title.length>2,'catalog history must preserve an original release title');
  verify(firstCatalog[0]!.quality>=0&&firstCatalog[0]!.quality<=100,'release quality must be bounded');
  verify(firstCatalog[0]!.launchStreams>0,'release launch streams must be positive');
  verify(firstCatalog[0]!.lifetimeStreams===firstCatalog[0]!.launchStreams,'launch streams must seed lifetime streams exactly once');
  verify(Number(state.specialCareers.music.catalogRoyalties)>0&&state.finances.cash>cashBefore,'launch royalties must reach player finances');
  verify(Number(state.specialCareers.music.fanbase)>fansBefore,'successful distribution must grow the fanbase');

  const song=releaseMusic(state,'song');
  verify(song.success,'the existing two-release annual limit must still allow a second release');
  const secondCatalog=musicCatalog(state);
  verify(secondCatalog.length===2,'two releases must remain separately visible in recent catalog history');
  verify(new Set(secondCatalog.map(entry=>entry.title)).size===2,'same-age releases must not silently reuse the same title');
  const third=releaseMusic(state,'song');
  verify(!third.success,'a third same-age release must remain blocked by the central action economy');
  verify(Number(state.specialCareers.music.catalogCount)===2,'a blocked release must not mutate catalog count');

  state.specialCareers.music.partnershipOfferPending=true;
  state.specialCareers.music.partnershipOfferPartner='Parallel House';
  state.specialCareers.music.partnershipOfferSource=firstCatalog[0]!.title;
  state.specialCareers.music.partnershipOfferAdvance=42000;
  state.specialCareers.music.partnershipOfferShare=.25;
  state.specialCareers.music.partnershipOfferReach=1.3;
  state.specialCareers.music.partnershipOfferExpiresAge=26;
  const offer=musicPartnershipOffer(state);
  verify(offer!==undefined&&offer.partner==='Parallel House','a valid distribution offer must project exact partner terms');
  const beforeAdvance=state.finances.cash;
  const accepted=musicPartnershipAction(state,'accept');
  verify(accepted.success,'the player must be able to accept a current distribution offer');
  verify(state.specialCareers.music.distributionPartner===true,'accepted distribution terms must persist in the music career');
  verify(state.finances.cash-beforeAdvance===42000,'distribution advance must be paid exactly once');
  verify(Number(state.specialCareers.music.distributionShare)===.25&&Number(state.specialCareers.music.distributionReach)===1.3,'accepted royalty-share and reach terms must remain exact');
  verify(!musicPartnershipOffer(state),'accepted offers must clear instead of remaining actionable');

  state.character.age=26;state.currentYear=2076;
  const beforePartneredStreams=Number(state.specialCareers.music.catalogLifetimeStreams);
  const partnered=releaseMusic(state,'song');
  verify(partnered.success,'music releases must continue normally under a distribution partnership');
  verify(Number(state.specialCareers.music.catalogLifetimeStreams)>beforePartneredStreams,'partnered releases must still accumulate catalog lifetime streams');
  const tourStart=tourMusic(state);
  verify(tourStart.success,'a sufficiently established musician must be able to start a tour');
  verify(state.specialCareers.music.tourActive===true,'tour action must create an in-progress tour instead of resolving instantly');
  verify(Number(state.specialCareers.music.currentTourShows)>0,'an active tour must preserve its scheduled show count');
  const tourUsesBefore=state.actionLedger.age===26?state.actionLedger.uses['special.tour:music']??0:0;
  const overlapTour=tourMusic(state);
  verify(!overlapTour.success,'an active tour must block overlapping tour starts');
  const tourUsesAfter=state.actionLedger.age===26?state.actionLedger.uses['special.tour:music']??0:0;
  verify(tourUsesAfter===tourUsesBefore,'overlap blocking must happen before consuming another tour opportunity');

  const lifetimeBeforeTail=Number(state.specialCareers.music.catalogLifetimeStreams);
  state.character.age=27;state.currentYear=2077;
  processSpecialCareersYear(state);
  verify((state.specialCareers.music.tourActive as boolean|undefined)!==true,'the next Age Up must resolve the active tour');
  verify(Number(state.specialCareers.music.toursCompleted)===1,'tour completion must be counted exactly once');
  verify(Number(state.specialCareers.music.lastTourAge)===27,'tour history must preserve the exact completion age');
  verify(Number(state.specialCareers.music.lastTourScore)>=0&&Number(state.specialCareers.music.lastTourScore)<=100,'tour performance must be bounded');
  verify(Number(state.specialCareers.music.lastTourAttendance)>0,'completed tours must preserve attendance');
  verify(Number.isFinite(Number(state.specialCareers.music.lastTourNet)),'completed tours must preserve a finite net result after costs');
  verify(Number(state.specialCareers.music.catalogLifetimeStreams)>lifetimeBeforeTail,'older releases must continue generating a catalog stream tail on later ages');
  verify(Number(state.specialCareers.music.lastCatalogTailRoyalties)>=0,'catalog tail processing must preserve annual royalty history');
  const cashAfterCycle=state.finances.cash;const completedTours=Number(state.specialCareers.music.toursCompleted);const lifetimeAfterCycle=Number(state.specialCareers.music.catalogLifetimeStreams);
  processMusicCareerYear(state);
  verify(state.finances.cash===cashAfterCycle&&Number(state.specialCareers.music.toursCompleted)===completedTours&&Number(state.specialCareers.music.catalogLifetimeStreams)===lifetimeAfterCycle,'same-age music-cycle reprocessing must be idempotent');

  const manager=world!.members.find(member=>member.role==='leader');
  if(manager){const rel=state.relationships.find(item=>item.npcId===manager.npcId);if(rel)rel.score=0;}
  for(const group of world!.groups.filter(group=>group.kind.includes(':creative'))){for(const npcId of group.memberNpcIds){const rel=state.relationships.find(item=>item.npcId===npcId);if(rel)rel.score=0;}}
  state.character.age=28;state.currentYear=2078;processMusicCareerYear(state);
  verify(Number(state.specialCareers.music.managementPressure)>35,'poor persistent management/creative relationships must surface as music-career pressure');
  verify(Number(state.specialCareers.music.managerRelationship)<=50,'music-cycle projection must preserve manager relationship quality as a career input');

  const catalogState=createNewGame({seed:'phase4d3-catalog-bound-regression'});
  catalogState.character.age=20;catalogState.currentYear=2040;catalogState.fame.fame=50;catalogState.character.secondary.creativity=90;catalogState.specialCareers.music={active:true,instrument:'guitar',skill:92,reputation:75,fanbase:25000};
  for(let index=0;index<7;index+=1){const result=releaseMusic(catalogState,index%3===0?'album':'song');verify(result.success,`catalog release ${index+1} must succeed on its own age`);catalogState.character.age+=1;catalogState.currentYear+=1;}
  verify(Number(catalogState.specialCareers.music.catalogCount)===7,'lifetime catalog count must keep growing after the detailed-history cap');
  verify(musicCatalog(catalogState).length===6,'detailed catalog history must remain bounded to six recent entries');

  const expireState=createNewGame({seed:'phase4d3-partnership-expiry'});expireState.character.age=30;expireState.currentYear=2080;expireState.specialCareers.music={active:true,skill:70,fanbase:5000,instrument:'vocals',partnershipOfferPending:true,partnershipOfferPartner:'Lumen Signal',partnershipOfferAdvance:12000,partnershipOfferShare:.2,partnershipOfferReach:1.2,partnershipOfferExpiresAge:30};
  releaseMusic(expireState,'song');expireState.character.age=32;expireState.currentYear=2082;processMusicCareerYear(expireState);
  verify(expireState.specialCareers.music.partnershipOfferPending===false,'expired distribution offers must be cleared by annual music processing');
  verify(Number(expireState.specialCareers.music.partnershipOffersExpired)>=1,'expired distribution offers must be counted in career history');

  return checks;
}
