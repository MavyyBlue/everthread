import { clamp } from '../core/math';
import { createRng } from '../core/rng';
import { makeStateId } from '../core/ids';
import { consumeAction } from '../core/actionEconomy';
import type { EngineResult, GameState, SocialWorld } from '../types/game';
import { activeSpecialCareerWorld, archiveSpecialCareerWorld, ensureSpecialCareerWorld, specialCareerWorlds } from './SpecialCareerWorldSystem';
import { ensureSpecialCareerRelationships } from './SpecialCareerRelationshipSystem';

type Track = Record<string, number | string | boolean>;
type Rng = ReturnType<typeof createRng>;

export type RacingContractOfferKind = 'renewal' | 'new_team';

export interface RacingContractOfferView {
  kind: RacingContractOfferKind;
  team: string;
  years: number;
  salary: number;
  expiresAge: number;
}

export interface RacingSeasonHistoryEntry {
  slot: number;
  age: number;
  team: string;
  races: number;
  wins: number;
  podiums: number;
  points: number;
  championshipPosition: number;
  score: number;
  incidents: number;
  mechanicalIssues: number;
  prizeMoney: number;
  outcome: string;
}

const HISTORY_SLOTS=6;
const TEAM_NAMES=['Vector Nine Racing','Arcway Motorsport','Kinetic Works','Apex Thread Racing','Northstar Velocity','Parallax Racing','Helix Motorsport','Meridian GP','Blue Hour Racing','Open Circuit Motorsport'];
const POINTS=[25,18,15,12,10,8,6,4,2,1];

function n(record:Track,key:string,def=0){return typeof record[key]==='number'?record[key] as number:def;}
function s(record:Track,key:string,def=''){return typeof record[key]==='string'?record[key] as string:def;}
function setN(record:Track,key:string,value:number){record[key]=Math.round(value*100)/100;}
function track(state:GameState){return (state.specialCareers.racing ??= {}) as Track;}
function readTrack(state:GameState){return (state.specialCareers.racing ?? {}) as Track;}
function slotKey(slot:number,key:string){return `racingSeason${slot}${key}`;}
function average(values:number[],fallback=50){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:fallback;}

function racingRelationships(state:GameState,world:SocialWorld){
  const active=world.members.filter(member=>member.leftAge===undefined&&state.npcs[member.npcId]?.alive);
  const engineeringIds=new Set(world.groups.filter(group=>group.kind.includes(':engineering')).flatMap(group=>group.memberNpcIds));
  const teamIds=new Set(world.groups.filter(group=>group.kind.includes(':race_team')||group.kind.includes(':team')).flatMap(group=>group.memberNpcIds));
  const rivalIds=new Set(world.groups.filter(group=>group.kind.includes(':rivals')).flatMap(group=>group.memberNpcIds));
  const engineering=active.filter(member=>engineeringIds.has(member.npcId)).map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  const team=active.filter(member=>teamIds.has(member.npcId)&&!rivalIds.has(member.npcId)).map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  const rivals=active.filter(member=>rivalIds.has(member.npcId)).map(member=>state.relationships.find(rel=>rel.npcId===member.npcId)?.score).filter((value):value is number=>typeof value==='number');
  return {
    engineering:clamp(average(engineering,average(team,50))),
    teamChemistry:clamp(average(team,50)),
    rivalry:clamp(rivals.length?average(rivals.map(score=>100-score),35):35),
  };
}

function writeSeasonHistory(career:Track,entry:Omit<RacingSeasonHistoryEntry,'slot'>){
  const count=n(career,'seasonHistoryCount')+1;setN(career,'seasonHistoryCount',count);const slot=((count-1)%HISTORY_SLOTS)+1;
  career[slotKey(slot,'Team')]=entry.team;career[slotKey(slot,'Outcome')]=entry.outcome;
  setN(career,slotKey(slot,'Age'),entry.age);setN(career,slotKey(slot,'Races'),entry.races);setN(career,slotKey(slot,'Wins'),entry.wins);setN(career,slotKey(slot,'Podiums'),entry.podiums);setN(career,slotKey(slot,'Points'),entry.points);setN(career,slotKey(slot,'Position'),entry.championshipPosition);setN(career,slotKey(slot,'Score'),entry.score);setN(career,slotKey(slot,'Incidents'),entry.incidents);setN(career,slotKey(slot,'Mechanical'),entry.mechanicalIssues);setN(career,slotKey(slot,'Prize'),entry.prizeMoney);
}

function seasonHistoryFromTrack(career:Track):RacingSeasonHistoryEntry[]{
  const entries:RacingSeasonHistoryEntry[]=[];
  for(let slot=1;slot<=HISTORY_SLOTS;slot+=1){
    const team=s(career,slotKey(slot,'Team'));if(!team)continue;
    entries.push({slot,age:n(career,slotKey(slot,'Age')),team,races:n(career,slotKey(slot,'Races')),wins:n(career,slotKey(slot,'Wins')),podiums:n(career,slotKey(slot,'Podiums')),points:n(career,slotKey(slot,'Points')),championshipPosition:n(career,slotKey(slot,'Position'),20),score:n(career,slotKey(slot,'Score')),incidents:n(career,slotKey(slot,'Incidents')),mechanicalIssues:n(career,slotKey(slot,'Mechanical')),prizeMoney:n(career,slotKey(slot,'Prize')),outcome:s(career,slotKey(slot,'Outcome'),'completed')});
  }
  return entries.sort((a,b)=>b.age-a.age||b.slot-a.slot);
}

export function racingSeasonHistory(state:GameState){return seasonHistoryFromTrack(readTrack(state));}

export function racingContractOffer(state:GameState):RacingContractOfferView|undefined{
  const career=readTrack(state);if(career.contractOfferPending!==true)return;
  const expiresAge=n(career,'contractOfferExpiresAge',state.character.age);if(state.character.age>expiresAge)return;
  return {kind:s(career,'contractOfferKind','new_team')==='renewal'?'renewal':'new_team',team:s(career,'contractOfferTeam','racing team'),years:Math.max(1,Math.round(n(career,'contractOfferYears',2))),salary:Math.max(0,Math.round(n(career,'contractOfferSalary'))),expiresAge};
}

function contractSalaryFor(career:Track,skill:number,reputation:number,score:number,rng:Rng){
  const experience=Math.min(12,n(career,'seasons'));
  const base=45000+skill*8500+reputation*5200+score*6000+experience*55000;
  return Math.round(clamp(base*rng.int(82,122)/100,45000,8500000));
}

function contractYearsFor(score:number,reputation:number,rng:Rng){
  if(score>=86||reputation>=82)return rng.int(3,4);
  if(score>=64||reputation>=55)return rng.int(2,3);
  return rng.int(1,2);
}

function teamOfferName(state:GameState,career:Track,rng:Rng){
  const prior=new Set(specialCareerWorlds(state,'racing').map(world=>world.name));
  const current=s(career,'worldName');if(current)prior.add(current);
  const available=TEAM_NAMES.filter(name=>!prior.has(name));return available.length?rng.pick(available):`${rng.pick(TEAM_NAMES)} ${specialCareerWorlds(state,'racing').length+1}`;
}

function createContractOffer(state:GameState,career:Track,kind:RacingContractOfferKind,team:string,score:number,rng:Rng){
  const reputation=n(career,'reputation',30);const years=contractYearsFor(score,reputation,rng);const salary=contractSalaryFor(career,n(career,'skill',45),reputation,score,rng);
  career.contractOfferPending=true;career.contractOfferKind=kind;career.contractOfferTeam=team;setN(career,'contractOfferYears',years);setN(career,'contractOfferSalary',salary);setN(career,'contractOfferCreatedAge',state.character.age);setN(career,'contractOfferExpiresAge',state.character.age+1);setN(career,'contractOffersReceived',n(career,'contractOffersReceived')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`${team} offered you a ${years}-year ${kind==='renewal'?'renewal':'racing'} contract at ${salary.toLocaleString()} per season.`});
}

function setContract(career:Track,team:string,years:number,salary:number,age:number){
  career.racingPathway=true;career.active=true;career.freeAgent=false;career.retired=false;career.contractActive=true;career.teamName=team;setN(career,'contractYears',years);setN(career,'contractRemaining',years);setN(career,'salary',salary);setN(career,'contractSignedAge',age);setN(career,'contractsSigned',n(career,'contractsSigned')+1);
}

function ensureLegacyLifecycle(state:GameState,career:Track){
  if(career.racingLifecycleInitialized===true)return;
  const hasHistory=n(career,'seasons')>0||n(career,'titles')>0||career.active===true||Boolean(activeSpecialCareerWorld(state,'racing'));
  if(!hasHistory)return;
  career.racingLifecycleInitialized=true;career.racingPathway=true;
  const world=activeSpecialCareerWorld(state,'racing');
  if(career.retired===true){career.active=false;career.freeAgent=false;career.contractActive=false;return;}
  if(world){
    career.active=true;career.freeAgent=false;career.contractActive=true;career.teamName=world.name;career.worldName=world.name;career.worldId=world.id;
    if(n(career,'contractRemaining')<=0){setN(career,'contractYears',2);setN(career,'contractRemaining',2);}
    if(n(career,'salary')<=0){const deterministic=createRng(`${state.seed}-racing-legacy-contract-${world.id}`);setN(career,'salary',contractSalaryFor(career,n(career,'skill',45),n(career,'reputation',35),Math.max(45,n(career,'lastSeasonScore',55)),deterministic));}
    setN(career,'teamsPlayedFor',Math.max(1,n(career,'teamsPlayedFor')));ensureSpecialCareerRelationships(state,world);
  }else{
    career.active=false;career.freeAgent=true;career.contractActive=false;
  }
}

export function joinRacingPath(state:GameState):EngineResult{
  const career=track(state);ensureLegacyLifecycle(state,career);
  if(state.character.age<16)return{success:false,messages:[{text:'You are too young for the racing pathway.'}]};
  if(career.retired===true)return{success:false,messages:[{text:'You have already retired from competitive motorsport in this life.'}]};
  if(career.racingPathway===true||career.active===true||career.freeAgent===true)return career.freeAgent===true?seekRacingContract(state):{success:false,messages:[{text:'You are already in the racing pathway.'}]};
  const rng=createRng(`${state.seed}-racing-entry`,state.rngCounter);career.racingLifecycleInitialized=true;career.racingPathway=true;setN(career,'skill',Math.max(n(career,'skill'),state.character.secondary.athleticism*.35+20));if(typeof career.seasons!=='number')setN(career,'seasons',0);
  const world=ensureSpecialCareerWorld(state,'racing','motorsport',{announce:true});ensureSpecialCareerRelationships(state,world);const years=rng.int(2,3);const salary=contractSalaryFor(career,n(career,'skill',35),n(career,'reputation',25),42,rng);setContract(career,world.name,years,salary,state.character.age);setN(career,'teamsPlayedFor',Math.max(1,n(career,'teamsPlayedFor')));career.worldId=world.id;career.worldName=world.name;state.rngCounter=rng.counter();
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You signed a ${years}-year developmental racing contract with ${world.name} at ${salary.toLocaleString()} per season.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  return{success:true,messages:[{text:`You joined ${world.name} on a ${years}-year racing contract. Seasons are raced once per age and settle after you Age Up.`}]};
}

export function trainRacing(state:GameState):EngineResult{
  const career=track(state);ensureLegacyLifecycle(state,career);if(career.racingPathway!==true||career.retired===true)return{success:false,messages:[{text:'Join the racing pathway first.'}]};const gate=consumeAction(state,{policy:'special.training',target:'racing'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};setN(career,'skill',clamp(n(career,'skill',35)+5));state.character.secondary.athleticism=clamp(state.character.secondary.athleticism+1);return{success:true,messages:[{text:'You completed a focused racing training block.'}]};
}

export function beginRacingSeason(state:GameState,miniGameScore?:number):EngineResult{
  const career=track(state);ensureLegacyLifecycle(state,career);if(career.retired===true)return{success:false,messages:[{text:'Your competitive racing career is retired.'}]};if(career.racingPathway!==true)return{success:false,messages:[{text:'Join the racing pathway first.'}]};if(career.contractActive!==true||career.freeAgent===true)return{success:false,messages:[{text:'You need an active team contract before entering a season. Review Career Worlds to pursue a team if you are a free agent.'}]};if(career.seasonActive===true)return{success:false,messages:[{text:'You already have a racing season underway. Age up to complete it before entering another.'}]};
  const world=activeSpecialCareerWorld(state,'racing');if(!world)return{success:false,messages:[{text:'Your current racing team could not be resolved. Pursue a new team contract before racing.'}]};
  const gate=consumeAction(state,{policy:'special.race'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-racing-season-start-${world.id}`,state.rngCounter);const rounds=rng.int(18,24);career.seasonActive=true;career.currentSeasonWorldId=world.id;career.currentSeasonTeam=world.name;setN(career,'currentSeasonStartedAge',state.character.age);setN(career,'currentSeasonRaces',rounds);setN(career,'currentSeasonChallengeScore',clamp(miniGameScore??50));setN(career,'seasonsEntered',n(career,'seasonsEntered')+1);state.rngCounter=rng.counter();
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You committed to an ${rounds}-round season with ${world.name}. The championship, team pressure, incidents, and earnings will resolve after you Age Up.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  return{success:true,messages:[{text:`Your ${rounds}-round season with ${world.name} is underway. Age Up to resolve the championship.`}]};
}

function seasonOutcome(position:number){if(position===1)return'championship season';if(position<=3)return'title-contending season';if(position<=6)return'strong season';if(position<=12)return'midfield season';return'difficult season';}

function finalizeSeason(state:GameState,career:Track,world:SocialWorld,metrics:{momentum:number;chemistry:number;rivalry:number;prestige:number},rng:Rng){
  if(career.seasonActive!==true||state.character.age<=n(career,'currentSeasonStartedAge',state.character.age))return false;
  const relationships=racingRelationships(state,world);const races=Math.max(1,Math.round(n(career,'currentSeasonRaces',20)));const challenge=clamp(n(career,'currentSeasonChallengeScore',50));const skill=n(career,'skill',45);const reputation=n(career,'reputation',35);const fitness=state.health.fitness;const stress=state.character.secondary.stress;
  const baseScore=clamp(skill*.27+metrics.momentum*.18+relationships.engineering*.14+relationships.teamChemistry*.10+fitness*.08+reputation*.07+metrics.prestige*.06+challenge*.12+(100-stress)*.05-metrics.rivalry*.04+rng.int(-9,10));
  const incidentRisk=clamp(.035+(100-fitness)/700+stress/1100+Math.max(0,55-relationships.teamChemistry)/700+metrics.rivalry/2200,.025,.22);const mechanicalRisk=clamp(.05+Math.max(0,62-relationships.engineering)/420+Math.max(0,58-metrics.prestige)/650,.03,.24);
  let wins=0,podiums=0,points=0,incidents=0,mechanicalIssues=0,totalFinish=0;
  for(let round=0;round<races;round+=1){const incident=rng.chance(incidentRisk);const mechanical=rng.chance(mechanicalRisk);if(incident)incidents+=1;if(mechanical)mechanicalIssues+=1;const effective=baseScore+rng.int(-14,14)-(incident?rng.int(14,30):0)-(mechanical?rng.int(7,18):0);const finish=clamp(Math.round(16-effective/6+rng.int(-2,3)),1,20);totalFinish+=finish;if(finish===1)wins+=1;if(finish<=3)podiums+=1;if(finish<=10)points+=POINTS[finish-1]??0;}
  const avgFinish=totalFinish/races;let position=clamp(Math.round(10-baseScore/10+avgFinish*.55+incidents*.35+mechanicalIssues*.2+rng.int(-2,2)),1,20);if(baseScore>=88&&avgFinish<=3.4&&rng.chance(.62))position=1;else if(baseScore>=82&&position>3)position=rng.int(2,3);
  const outcome=seasonOutcome(position);const prizeBase=position===1?3200000:position<=3?1400000:position<=6?650000:position<=10?220000:position<=15?70000:25000;const prizeMoney=Math.round((prizeBase+wins*120000+podiums*30000)*(0.8+metrics.prestige/250));const salary=Math.max(0,Math.round(n(career,'salary')));
  career.seasonActive=false;career.lastSeasonTeam=world.name;career.lastSeasonOutcome=outcome;setN(career,'lastSeasonAge',state.character.age);setN(career,'lastSeasonRaces',races);setN(career,'lastSeasonWins',wins);setN(career,'lastSeasonPodiums',podiums);setN(career,'lastSeasonPoints',points);setN(career,'lastChampionshipPosition',position);setN(career,'lastSeasonScore',baseScore);setN(career,'lastSeasonIncidents',incidents);setN(career,'lastSeasonMechanicalIssues',mechanicalIssues);setN(career,'seasonSalaryDue',salary);setN(career,'seasonPrizeDue',prizeMoney);setN(career,'seasons',n(career,'seasons')+1);setN(career,'careerWins',n(career,'careerWins')+wins);setN(career,'careerPodiums',n(career,'careerPodiums')+podiums);setN(career,'careerPoints',n(career,'careerPoints')+points);setN(career,'bestSeasonScore',Math.max(n(career,'bestSeasonScore'),baseScore));setN(career,'bestChampionshipFinish',n(career,'bestChampionshipFinish',21)>0?Math.min(n(career,'bestChampionshipFinish',21),position):position);setN(career,'careerRaceEarnings',n(career,'careerRaceEarnings')+salary+prizeMoney);if(position===1)setN(career,'titles',n(career,'titles')+1);
  setN(career,'engineeringChemistry',relationships.engineering);setN(career,'teamChemistry',relationships.teamChemistry);setN(career,'teamPressure',clamp((60-relationships.engineering)*.8+(60-relationships.teamChemistry)*.55+metrics.rivalry*.28+stress*.18+(position>12?12:0),0,100));
  setN(career,'reputation',clamp(reputation+(position===1?9:position<=3?6:position<=6?3:position>15?-3:0)));state.fame.fame=clamp(state.fame.fame+(position===1?8:position<=3?4:position<=6?2:0));
  if(incidents>0){state.character.stats.health=clamp(state.character.stats.health-Math.min(5,Math.max(1,Math.floor(incidents/2))));state.character.secondary.stress=clamp(state.character.secondary.stress+Math.min(8,incidents*1.2));}
  if(mechanicalIssues>=3)state.character.secondary.stress=clamp(state.character.secondary.stress+2);
  writeSeasonHistory(career,{age:state.character.age,team:world.name,races,wins,podiums,points,championshipPosition:position,score:baseScore,incidents,mechanicalIssues,prizeMoney,outcome});
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:position===1?3:position<=6?2:1,text:`Your ${races}-round season with ${world.name} ended ${position===1?'as champion':`P${position} in the championship`}: ${wins} win${wins===1?'':'s'}, ${podiums} podium${podiums===1?'':'s'}, ${points} points, ${incidents} racing incident${incidents===1?'':'s'}, and ${mechanicalIssues} mechanical issue${mechanicalIssues===1?'':'s'}. ${salary.toLocaleString()} salary and ${prizeMoney.toLocaleString()} prize money were earned for annual settlement.`,npcIds:world.members.slice(0,4).map(member=>member.npcId)});
  return true;
}

function contractEnd(state:GameState,career:Track,world:SocialWorld,rng:Rng){
  career.contractActive=false;setN(career,'contractRemaining',0);const age=state.character.age;const racedThisYear=n(career,'lastSeasonAge',-1)===age;const rawScore=n(career,'lastSeasonScore',35);const score=racedThisYear?rawScore:Math.min(rawScore,45);const reputation=n(career,'reputation',30);const position=racedThisYear?n(career,'lastChampionshipPosition',20):20;
  if(age>=60){retireRacingInternal(state,career,world,'You retired from competitive motorsport at the end of your contract.');return;}
  const renewalStrength=clamp(score*.48+reputation*.24+(21-position)*1.2+n(career,'teamChemistry',50)*.12+n(career,'engineeringChemistry',50)*.08);
  const guaranteed=racedThisYear&&(rawScore>=88||position===1||renewalStrength>=82);const chance=racedThisYear?clamp((renewalStrength-35)/90,.12,.82):clamp((renewalStrength-40)/120,.04,.35);
  if(guaranteed||(racedThisYear?rng.chance(chance):renewalStrength>=50&&rng.chance(chance))){
    createContractOffer(state,career,'renewal',world.name,Math.max(score,renewalStrength),rng);career.active=true;career.freeAgent=false;return;
  }
  archiveSpecialCareerWorld(world,age);career.active=false;career.freeAgent=true;career.lastTeamName=world.name;setN(career,'releases',n(career,'releases')+1);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age,category:'career',importance:2,text:`${world.name} released you at the end of your contract. You entered racing free agency.`});
}

function retireRacingInternal(state:GameState,career:Track,world:SocialWorld|undefined,text:string){if(world?.active)archiveSpecialCareerWorld(world,state.character.age);career.active=false;career.freeAgent=false;career.retired=true;career.contractActive=false;career.contractOfferPending=false;career.seasonActive=false;setN(career,'retirementAge',state.character.age);state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:3,text});}

export function processRacingCareerYear(state:GameState,career:Track,world:SocialWorld,metrics:{momentum:number;chemistry:number;rivalry:number;prestige:number},rng:Rng){
  ensureLegacyLifecycle(state,career);if(n(career,'lastRacingCycleAge',-1)===state.character.age)return;setN(career,'lastRacingCycleAge',state.character.age);ensureSpecialCareerRelationships(state,world);
  const completed=finalizeSeason(state,career,world,metrics,rng);if(career.retired===true)return;
  if(career.contractActive===true&&n(career,'lastContractTickAge',-1)!==state.character.age){setN(career,'lastContractTickAge',state.character.age);setN(career,'contractRemaining',Math.max(0,n(career,'contractRemaining',1)-1));if(!completed){setN(career,'missedSeasons',n(career,'missedSeasons')+1);setN(career,'reputation',clamp(n(career,'reputation',30)-2));setN(career,'teamPressure',clamp(n(career,'teamPressure',40)+6));state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You completed the contract year with ${world.name} without entering a full racing season. Team pressure increased.`});}if(n(career,'contractRemaining')<=0)contractEnd(state,career,world,rng);}
}

export function expireRacingContractOffer(state:GameState){
  const career=state.specialCareers.racing as Track|undefined;if(!career||career.contractOfferPending!==true)return false;const expires=n(career,'contractOfferExpiresAge',state.character.age);if(state.character.age<=expires)return false;const kind=s(career,'contractOfferKind','new_team');const team=s(career,'contractOfferTeam','team');career.contractOfferPending=false;setN(career,'contractOffersExpired',n(career,'contractOffersExpired')+1);
  if(kind==='renewal'){const world=activeSpecialCareerWorld(state,'racing');if(world?.active)archiveSpecialCareerWorld(world,state.character.age);career.active=false;career.freeAgent=true;career.contractActive=false;career.lastTeamName=team;}
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`The ${kind==='renewal'?'renewal':'contract'} offer from ${team} expired.`});return true;
}

export function seekRacingContract(state:GameState):EngineResult{
  const career=track(state);ensureLegacyLifecycle(state,career);if(career.retired===true)return{success:false,messages:[{text:'Your competitive racing career is retired.'}]};if(career.racingPathway!==true)return{success:false,messages:[{text:'Join the racing pathway first.'}]};if(career.contractActive===true)return{success:false,messages:[{text:'You already have an active racing contract.'}]};if(career.contractOfferPending===true)return{success:false,messages:[{text:'You already have a racing contract offer to review.'}]};if(career.freeAgent!==true)return{success:false,messages:[{text:'You are not currently in racing free agency.'}]};
  const gate=consumeAction(state,{policy:'special.racing_contract_seek'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};const rng=createRng(`${state.seed}-racing-contract-seek`,state.rngCounter);const profile=clamp(n(career,'skill',45)*.42+n(career,'reputation',30)*.24+Math.min(100,n(career,'bestSeasonScore',45))*.14+state.fame.fame*.08+state.character.secondary.athleticism*.12);const success=profile>=78||rng.chance(clamp(.18+profile/135,.28,.86));
  if(success){const team=teamOfferName(state,career,rng);createContractOffer(state,career,'new_team',team,profile,rng);}else state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:'You explored racing free agency, but no team made a firm offer this year.'});state.rngCounter=rng.counter();return{success,messages:[{text:success?'A new racing team contract offer is ready in Career Worlds.':'No racing team made a firm offer this year.'}]};
}

export function racingContractDecision(state:GameState,action:'accept'|'decline'):EngineResult{
  const career=track(state);const offer=racingContractOffer(state);if(!offer)return{success:false,messages:[{text:'You do not have an active racing contract offer.'}]};const gate=consumeAction(state,{policy:'special.racing_business'});if(!gate.allowed)return{success:false,messages:[{text:gate.message!}]};career.contractOfferPending=false;
  if(action==='decline'){
    setN(career,'contractOffersDeclined',n(career,'contractOffersDeclined')+1);if(offer.kind==='renewal'){const world=activeSpecialCareerWorld(state,'racing');if(world?.active)archiveSpecialCareerWorld(world,state.character.age);career.active=false;career.freeAgent=true;career.contractActive=false;career.lastTeamName=offer.team;}
    state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:1,text:`You declined ${offer.team}'s ${offer.kind==='renewal'?'renewal':'contract'} offer.`});return{success:true,messages:[{text:`You declined ${offer.team}'s offer.`}]};
  }
  let world=activeSpecialCareerWorld(state,'racing');if(offer.kind==='new_team'){if(world?.active)archiveSpecialCareerWorld(world,state.character.age);world=ensureSpecialCareerWorld(state,'racing','motorsport',{forceNew:true,announce:false});world.name=offer.team;ensureSpecialCareerRelationships(state,world);career.worldId=world.id;career.worldName=world.name;setN(career,'teamsPlayedFor',Math.max(1,n(career,'teamsPlayedFor'))+1);}else if(world){ensureSpecialCareerRelationships(state,world);setN(career,'renewals',n(career,'renewals')+1);}setContract(career,offer.team,offer.years,offer.salary,state.character.age);setN(career,'contractOffersAccepted',n(career,'contractOffersAccepted')+1);
  state.timeline.push({id:makeStateId(state,'timeline'),year:state.currentYear,age:state.character.age,category:'career',importance:2,text:`You signed a ${offer.years}-year ${offer.kind==='renewal'?'renewal':'contract'} with ${offer.team} at ${offer.salary.toLocaleString()} per season.`,npcIds:world?.members.slice(0,4).map(member=>member.npcId)});return{success:true,messages:[{text:`You signed with ${offer.team} for ${offer.salary.toLocaleString()} per season.`}]};
}

export function retireRacingCareer(state:GameState):EngineResult{
  const career=track(state);ensureLegacyLifecycle(state,career);if(career.retired===true)return{success:false,messages:[{text:'You have already retired from competitive motorsport.'}]};if(career.racingPathway!==true)return{success:false,messages:[{text:'You have not established a racing career to retire from.'}]};if(career.seasonActive===true)return{success:false,messages:[{text:'Finish the current racing season before retiring.'}]};const world=activeSpecialCareerWorld(state,'racing');retireRacingInternal(state,career,world,`You retired from competitive motorsport after ${n(career,'seasons')} recorded season${n(career,'seasons')===1?'':'s'} and ${n(career,'titles')} championship${n(career,'titles')===1?'':'s'}.`);return{success:true,messages:[{text:'You retired from competitive motorsport. Your teams and season history remain in Career Worlds.'}]};
}

/** Compatibility router for the historical Join / Train / Race action surface. */
export function racingCareerAction(state:GameState,action:'join'|'train'|'race',miniGameScore?:number):EngineResult{
  if(action==='join')return joinRacingPath(state);if(action==='train')return trainRacing(state);return beginRacingSeason(state,miniGameScore);
}
