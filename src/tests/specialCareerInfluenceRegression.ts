import { createNewGame } from '../systems/CharacterSystem';
import { ensureSpecialCareerWorld, archiveSpecialCareerWorld, type SpecialCareerWorldKind } from '../systems/SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships, processSpecialCareerEcosystemsYear, specialCareerWorldView } from '../systems/SpecialCareerEcosystemSystem';
import { processSpecialCareerInfluenceYear, resolveSpecialCareerInfluenceFollowup, specialCareerInfluenceView } from '../systems/SpecialCareerInfluenceSystem';
import type { GameState, SocialWorld } from '../types/game';

type Track = Record<string,number|string|boolean>;
function track(state:GameState,kind:SpecialCareerWorldKind){return (state.specialCareers[kind]??={}) as Track;}
function rel(state:GameState,npcId:string){const value=state.relationships.find(item=>item.npcId===npcId);if(!value)throw new Error(`missing relationship ${npcId}`);return value;}
function leaderId(world:SocialWorld){const value=world.members.find(member=>member.role==='leader')?.npcId;if(!value)throw new Error('missing career leader');return value;}
function explicitRivalId(world:SocialWorld){const ids=new Set(world.groups.filter(group=>group.kind.includes(':rivals')).flatMap(group=>group.memberNpcIds));const value=world.members.find(member=>ids.has(member.npcId))?.npcId;if(!value)throw new Error('missing explicit career rival');return value;}
function prepWorld(state:GameState,kind:SpecialCareerWorldKind,context='regression'){const world=ensureSpecialCareerWorld(state,kind,context,{announce:false});ensureSpecialCareerRelationships(state,world);return world;}
function setLeaderSupport(state:GameState,world:SocialWorld,score:number,opinion:number,compatibility:number){const id=leaderId(world);const relation=rel(state,id);relation.score=score;relation.compatibility=compatibility;state.npcs[id]!.hiddenOpinion=opinion;return id;}
function setAllNonLeaderScores(state:GameState,world:SocialWorld,score:number){for(const member of world.members){if(member.role==='leader')continue;const relation=state.relationships.find(item=>item.npcId===member.npcId);if(relation)relation.score=score;}}

export function runSpecialCareerInfluenceRegression(){
  let checks=0;
  function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Special-career influence regression failed: ${message}`);}

  const sports=createNewGame({seed:'influence-view-sports'});sports.character.age=28;sports.currentYear=2058;sports.character.secondary.stress=25;sports.specialCareers.sports={active:true,pro:true,sport:'Basketball',skill:80,fitness:85,reputation:65,contractRemaining:2,salary:500000};
  const sportsWorld=prepWorld(sports,'sports','Basketball');const coach=setLeaderSupport(sports,sportsWorld,92,80,90);const explicitRival=explicitRivalId(sportsWorld);rel(sports,explicitRival).score=12;sports.npcs[explicitRival]!.traits=['competitive','aggressive','ambitious'];
  const strongView=specialCareerInfluenceView(sports,sportsWorld,'sports');
  verify(strongView.leaderNpcId===coach&&strongView.leaderSupport>=80,'1 persistent leader relationship must resolve into strong bounded support');
  verify(strongView.rivalNpcId===explicitRival&&strongView.rivalPressure>=80,'2 explicit Career World rivals must resolve into high professional pressure');
  verify(strongView.opportunityModifier>=-12&&strongView.opportunityModifier<=12,'3 opportunity influence must remain bounded');

  const hostile=structuredClone(sports);hostile.character.secondary.stress=92;const hostileCoach=leaderId(hostile.socialWorlds.find(world=>world.id===sportsWorld.id)!);rel(hostile,hostileCoach).score=18;rel(hostile,hostileCoach).compatibility=20;hostile.npcs[hostileCoach]!.hiddenOpinion=-80;track(hostile,'sports')[`stressIncidents:${sportsWorld.id}`]=2;
  const hostileView=specialCareerInfluenceView(hostile,hostile.socialWorlds.find(world=>world.id===sportsWorld.id)!,'sports');
  verify(hostileView.leaderSupport<strongView.leaderSupport,'4 poor leader history must materially lower support');
  verify(hostileView.conductRisk>strongView.conductRisk,'5 stress incidents and weak leadership support must raise conduct-review risk');

  const acting=createNewGame({seed:'influence-fallback-acting'});acting.character.age=27;acting.currentYear=2057;acting.specialCareers.acting={active:true,skill:70,reputation:60,currentProjectActive:true};const actingWorld=prepWorld(acting,'acting','supporting');
  setLeaderSupport(acting,actingWorld,75,40,70);setAllNonLeaderScores(acting,actingWorld,90);
  const fallback=actingWorld.members.find(member=>member.role!=='leader')!;rel(acting,fallback.npcId).score=16;acting.npcs[fallback.npcId]!.traits=['competitive','stubborn','ambitious'];
  const actingView=specialCareerInfluenceView(acting,actingWorld,'acting');
  verify(actingView.rivalNpcId===fallback.npcId,'6 temporary screen careers without a rivals group must still identify a competitive peer as professional pressure');
  verify(acting.relationships.find(item=>item.npcId===fallback.npcId)?.type==='coworker','7 fallback professional rivalry must not overwrite the authoritative personal relationship type');
  verify(specialCareerWorldView(acting,actingWorld)?.rivalNpcId===fallback.npcId,'8 the shared Career World projection must expose fallback rivals so existing Ease rivalry UI works across paths');

  const kinds:SpecialCareerWorldKind[]=['acting','music','sports','modeling','racing','directing'];
  for(const kind of kinds){const state=createNewGame({seed:`influence-all-${kind}`});state.character.age=30;state.currentYear=2060;track(state,kind).active=true;if(kind==='modeling')track(state,kind).technique=65;else track(state,kind).skill=65;const world=prepWorld(state,kind,kind);const result=processSpecialCareerInfluenceYear(state,kind,world);verify(Number.isFinite(result.leaderSupport)&&Number.isFinite(result.opportunityModifier),`9 ${kind} must participate in the shared leader/rival influence layer`);}

  const repeat=createNewGame({seed:'influence-idempotent'});repeat.character.age=31;repeat.currentYear=2061;repeat.specialCareers.music={active:true,skill:72,reputation:60,songsReleased:2,fanbase:8000};const repeatWorld=prepWorld(repeat,'music','vocals');setLeaderSupport(repeat,repeatWorld,82,65,80);const first=processSpecialCareerInfluenceYear(repeat,'music',repeatWorld);const timelineAfter=repeat.timeline.length;const eventCount=Number(track(repeat,'music').influenceEventCount??0);const second=processSpecialCareerInfluenceYear(repeat,'music',repeatWorld);
  verify(Number(track(repeat,'music').lastInfluenceAge)===31&&typeof track(repeat,'music').lastInfluenceWorldId==='string','15 annual influence processing must stamp a bounded current-world idempotency marker');
  verify(repeat.timeline.length===timelineAfter&&Number(track(repeat,'music').influenceEventCount??0)===eventCount&&second.opportunityModifier===first.opportunityModifier,'16 repeated processing in the same age must not reroll leader/rival consequences');

  const review=createNewGame({seed:'influence-review-followup'});review.character.age=35;review.currentYear=2065;review.character.secondary.stress=70;review.specialCareers.music={active:true,reputation:50,influenceFollowupKind:'leader_review',influenceFollowupDueAge:35,influenceFollowupStrength:1};const reviewWorld=prepWorld(review,'music','vocals');const reviewLeader=setLeaderSupport(review,reviewWorld,65,20,65);track(review,'music').influenceFollowupNpcId=reviewLeader;track(review,'music').influenceFollowupWorldId=reviewWorld.id;const reviewBefore=Number(track(review,'music').reputation);const reviewModifier=resolveSpecialCareerInfluenceFollowup(review,'music',reviewWorld);
  verify(reviewModifier===2&&Number(track(review,'music').reputation)===reviewBefore+1,'17 a repaired leader relationship and manageable stress must turn a scheduled conduct follow-up into recovery');
  verify(review.npcs[reviewLeader]!.memories.some(memory=>memory.kind==='career_review_recovery'),'18 recovered reviews must persist in the exact leader NPC memory history');
  verify(track(review,'music').influenceFollowupKind===undefined,'19 resolved influence follow-ups must clear their pending fields');

  const grudge=createNewGame({seed:'influence-rival-grudge'});grudge.character.age=34;grudge.currentYear=2064;grudge.character.secondary.stress=60;grudge.specialCareers.sports={active:true,reputation:55,influenceFollowupKind:'rival_grudge',influenceFollowupDueAge:34,influenceFollowupStrength:2};const grudgeWorld=prepWorld(grudge,'sports','Basketball');const grudgeRival=explicitRivalId(grudgeWorld);rel(grudge,grudgeRival).score=20;track(grudge,'sports').influenceFollowupNpcId=grudgeRival;track(grudge,'sports').influenceFollowupWorldId=grudgeWorld.id;const grudgeStress=grudge.character.secondary.stress;const grudgeModifier=resolveSpecialCareerInfluenceFollowup(grudge,'sports',grudgeWorld);
  verify(grudgeModifier===-3&&Number(track(grudge,'sports').rivalGrudges)===1&&grudge.character.secondary.stress>grudgeStress,'20 an unresolved rival feud must carry bounded adverse pressure into the next career cycle');
  verify(grudge.npcs[grudgeRival]!.memories.some(memory=>memory.kind==='career_rival_grudge'&&memory.permanent===true),'21 repeated professional hostility must be remembered as a permanent NPC grudge rather than parallel relationship state');

  const baseMusic=createNewGame({seed:'influence-momentum-compare'});baseMusic.character.age=29;baseMusic.currentYear=2059;baseMusic.character.secondary.stress=30;baseMusic.specialCareers.music={active:true,skill:72,reputation:58,songsReleased:2,fanbase:12000};const baseMusicWorld=prepWorld(baseMusic,'music','vocals');setAllNonLeaderScores(baseMusic,baseMusicWorld,70);const supportive=structuredClone(baseMusic);const obstructed=structuredClone(baseMusic);const supportWorld=supportive.socialWorlds.find(world=>world.id===baseMusicWorld.id)!;const obstructWorld=obstructed.socialWorlds.find(world=>world.id===baseMusicWorld.id)!;setLeaderSupport(supportive,supportWorld,95,90,95);setAllNonLeaderScores(supportive,supportWorld,88);setLeaderSupport(obstructed,obstructWorld,15,-90,15);setAllNonLeaderScores(obstructed,obstructWorld,18);for(const member of obstructWorld.members){if(member.role!=='leader')obstructed.npcs[member.npcId]!.traits=['competitive','aggressive'];}
  processSpecialCareerEcosystemsYear(supportive);processSpecialCareerEcosystemsYear(obstructed);
  verify(Number(track(supportive,'music').careerMomentum)>Number(track(obstructed,'music').careerMomentum),'22 leader advocacy/support and rival pressure must feed the shared momentum used by persistent career cycles');
  verify(Number(track(supportive,'music').opportunityModifier)>Number(track(obstructed,'music').opportunityModifier),'23 the career track must expose the bounded opportunity consequence that produced the momentum difference');

  const screenBase=createNewGame({seed:'influence-screen-compare'});screenBase.character.age=29;screenBase.currentYear=2059;screenBase.character.secondary.stress=25;screenBase.specialCareers.acting={active:true,skill:70,reputation:55,currentProjectActive:true,currentProjectRole:'supporting',currentProjectPay:12000,currentProjectSource:'audition'};const screenWorld=prepWorld(screenBase,'acting','supporting');track(screenBase,'acting').currentProjectWorldId=screenWorld.id;track(screenBase,'acting').currentProjectName=screenWorld.name;const screenSupport=structuredClone(screenBase);const screenHostile=structuredClone(screenBase);screenSupport.character.age=30;screenSupport.currentYear=2060;screenHostile.character.age=30;screenHostile.currentYear=2060;const screenSupportWorld=screenSupport.socialWorlds.find(world=>world.id===screenWorld.id)!;const screenHostileWorld=screenHostile.socialWorlds.find(world=>world.id===screenWorld.id)!;archiveSpecialCareerWorld(screenSupportWorld,30);archiveSpecialCareerWorld(screenHostileWorld,30);setLeaderSupport(screenSupport,screenSupportWorld,96,90,95);setAllNonLeaderScores(screenSupport,screenSupportWorld,90);setLeaderSupport(screenHostile,screenHostileWorld,12,-90,15);setAllNonLeaderScores(screenHostile,screenHostileWorld,15);for(const member of screenHostileWorld.members){if(member.role!=='leader')screenHostile.npcs[member.npcId]!.traits=['competitive','aggressive'];}
  processSpecialCareerEcosystemsYear(screenSupport);processSpecialCareerEcosystemsYear(screenHostile);
  verify(Number(track(screenSupport,'acting').lastProjectScore)>Number(track(screenHostile,'acting').lastProjectScore),'24 the same influence layer must affect acting/directing project impact instead of existing only in persistent careers');
  verify(screenSupportWorld.groups.some(group=>group.kind.endsWith(':resolved'))&&screenHostileWorld.groups.some(group=>group.kind.endsWith(':resolved')),'25 temporary projects must still finalize exactly through the existing resolved-project lifecycle');

  return checks;
}
