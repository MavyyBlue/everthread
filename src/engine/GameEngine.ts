import type { EngineResult, GameState } from '../types/game';
import { createNewGame, type CharacterCreationOptions } from '../systems/CharacterSystem';
import { ageUp, finalizeAgeUp, rewindToAge } from '../systems/AgingSystem';
import { resolvePendingEvent, forceEvent } from '../systems/EventSystem';
import { interactWithNpc, meetPotentialPartner, changeRelationshipType, haveChild } from '../systems/RelationshipSystem';
import { studyHarder, skipClass, enrollProgram, dropOut } from '../systems/EducationSystem';
import { attendSchoolGroup, cheatAtSchool, joinSchoolGroup, leaveSchoolGroup, volunteerAtSchool } from '../systems/SchoolWorldSystem';
import { applyForJob, workHarder, askForRaise, resign, retire, takeFreelanceGig } from '../systems/CareerSystem';
import { performWellnessActivity, riskyHabit, enterRehab, seekTreatment } from '../systems/HealthSystem';
import { buyProperty, rentOutProperty, renovateProperty, sellProperty, buyVehicle, repairVehicle, buyCollectible } from '../systems/PropertySystem';
import { buySecurity, sellSecurity } from '../systems/InvestmentSystem';
import { startBusiness, tuneBusiness, addBusinessProduct } from '../systems/BusinessSystem';
import { adoptPet, petInteraction } from '../systems/PetSystem';
import { commitCrime, resolveLegalCase, prisonActivity, attemptEscape } from '../systems/CrimeSystem';
import { postContent, fameActivity } from '../systems/FameSystem';
import { travel, emigrate, takeLicenseTest } from '../systems/TravelSystem';
import { continueAsChild, setWill } from '../systems/GenerationSystem';
import { activateChallenge, evaluateAchievements, evaluateChallenges } from '../systems/AchievementSystem';
import { checkDeath } from '../systems/DeathSystem';
import * as Special from '../systems/SpecialCareerSystem';
import { enforceStateInvariants } from '../core/invariants';
import { saveGame, saveSettings } from '../services/SaveSystem';

export type Listener=()=>void;

export class GameEngine {
  private state:GameState;
  private listeners=new Set<Listener>();
  private saveQueue:Promise<void>=Promise.resolve();
  private revision=0;
  constructor(state?:GameState){this.state=state??createNewGame();}
  getState(){return this.state;}
  getRevision(){return this.revision;}
  subscribe(listener:Listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  replaceState(state:GameState){this.state=enforceStateInvariants(state);this.emit();}
  newLife(options:CharacterCreationOptions={}){const settings=structuredClone(this.state.settings);this.state=createNewGame(options);Object.assign(this.state.settings,settings);this.emit(true);return this.state;}
  async flushSaves(){await this.saveQueue.catch(()=>undefined);}
  private emit(save=false){enforceStateInvariants(this.state);this.revision+=1;for(const listener of this.listeners)listener();if(save||this.state.settings.autoSave)this.queueSave();}
  private queueSave(){this.saveQueue=this.saveQueue.catch(()=>undefined).then(()=>saveGame(this.state)).catch(err=>console.error('Autosave failed',err));}
  private run(action:()=>EngineResult,save=true){const beforeRng=this.state.rngCounter;const beforeId=this.state.idCounter;const beforeActionRevision=this.state.actionLedger?.revision??0;const result=action();const mutatedOnOutcome=this.state.rngCounter!==beforeRng||this.state.idCounter!==beforeId||(this.state.actionLedger?.revision??0)!==beforeActionRevision;if(result.success||result.stateChanges||mutatedOnOutcome)this.emit(save);return result;}

  ageUp(){return this.run(()=>ageUp(this.state),true);}
  resolveEvent(choiceId:string){return this.run(()=>{const result=resolvePendingEvent(this.state,choiceId);if(result.success)finalizeAgeUp(this.state);return result;},true);}
  performActivity(activity:string,...args:unknown[]):EngineResult{
    const map:Record<string,()=>EngineResult>={
      gym:()=>performWellnessActivity(this.state,'gym'),running:()=>performWellnessActivity(this.state,'running'),walking:()=>performWellnessActivity(this.state,'walking'),martial_arts:()=>performWellnessActivity(this.state,'martial_arts'),meditation:()=>performWellnessActivity(this.state,'meditation'),diet:()=>performWellnessActivity(this.state,'diet'),
      study:()=>studyHarder(this.state),skip_class:()=>skipClass(this.state),school_cheat:()=>cheatAtSchool(this.state),school_volunteer:()=>volunteerAtSchool(this.state),meet_date:()=>meetPotentialPartner(this.state),
      freelance_writing:()=>takeFreelanceGig(this.state,'writing'),freelance_programming:()=>takeFreelanceGig(this.state,'programming'),freelance_design:()=>takeFreelanceGig(this.state,'design'),
    };const fn=map[activity];return fn?this.run(fn):{success:false,messages:[{text:`Unknown activity: ${activity}`}]};
  }
  interactWithCharacter(npcId:string,action:string){return this.run(()=>interactWithNpc(this.state,npcId,action));}
  relationshipAction(npcId:string,action:'ask_out'|'propose'|'marry'|'break_up'|'divorce'|'reconcile'){return this.run(()=>changeRelationshipType(this.state,npcId,action));}
  haveChild(partnerId?:string,adopt=false){return this.run(()=>haveChild(this.state,partnerId,adopt));}
  enroll(programId:string){return this.run(()=>enrollProgram(this.state,programId));} dropOut(){return this.run(()=>dropOut(this.state));}
  joinSchoolGroup(groupId:string){return this.run(()=>joinSchoolGroup(this.state,groupId));} leaveSchoolGroup(groupId:string){return this.run(()=>leaveSchoolGroup(this.state,groupId));} attendSchoolGroup(groupId:string){return this.run(()=>attendSchoolGroup(this.state,groupId));}
  applyForJob(jobId:string){return this.run(()=>applyForJob(this.state,jobId));} workHarder(){return this.run(()=>workHarder(this.state));} askForRaise(){return this.run(()=>askForRaise(this.state));} resign(){return this.run(()=>resign(this.state));} retire(){return this.run(()=>retire(this.state));}
  purchaseProperty(typeId:string,mortgage=true){const r=this.run(()=>buyProperty(this.state,typeId,mortgage));if(r.success)this.state.flags.propertiesEver=Number(this.state.flags.propertiesEver??0)+1;return r;} rentProperty(id:string){return this.run(()=>rentOutProperty(this.state,id));} renovateProperty(id:string){return this.run(()=>renovateProperty(this.state,id));} sellProperty(id:string){return this.run(()=>sellProperty(this.state,id));}
  purchaseVehicle(typeId:string){const r=this.run(()=>buyVehicle(this.state,typeId));if(r.success)this.state.flags.vehiclesOwned=Number(this.state.flags.vehiclesOwned??0)+1;return r;} repairVehicle(id:string){return this.run(()=>repairVehicle(this.state,id));} purchaseCollectible(id:string){return this.run(()=>buyCollectible(this.state,id));}
  invest(securityId:string,amount:number){return this.run(()=>buySecurity(this.state,securityId,amount));} sellInvestment(securityId:string,units?:number){return this.run(()=>sellSecurity(this.state,securityId,units));}
  startBusiness(industryId:string,name:string){return this.run(()=>startBusiness(this.state,industryId,name));} tuneBusiness(id:string,field:'priceIndex'|'marketingBudget'|'compensationIndex',value:number){return this.run(()=>tuneBusiness(this.state,id,field,value));} addBusinessProduct(id:string){return this.run(()=>addBusinessProduct(this.state,id));}
  adoptPet(variantId:string,name?:string){const r=this.run(()=>adoptPet(this.state,variantId,name));if(r.success)this.state.flags.petsOwned=Number(this.state.flags.petsOwned??0)+1;return r;} petAction(id:string,action:'walk'|'feed'|'treat'|'vet'|'spend_time'|'rehome'){return this.run(()=>petInteraction(this.state,id,action));}
  commitCrime(crimeId:string){return this.run(()=>commitCrime(this.state,crimeId));} resolveCase(lawyer:'public'|'budget'|'experienced'|'elite',plea:'contest'|'plead'){return this.run(()=>resolveLegalCase(this.state,lawyer,plea));} prisonAction(action:'exercise'|'work'|'befriend'|'behave'|'trouble'|'appeal'){return this.run(()=>prisonActivity(this.state,action));} escape(score:number){const r=this.run(()=>attemptEscape(this.state,score));if(r.success)this.state.flags.escapes=Number(this.state.flags.escapes??0)+1;return r;}
  post(platform:'loop'|'video'|'photo'|'micro'|'live'){return this.run(()=>postContent(this.state,platform));} fameAction(action:'interview'|'commercial'|'book'|'event'|'endorsement'|'respond_fans'){return this.run(()=>fameActivity(this.state,action));}
  travel(countryId:string,city?:string,withFamily=false){return this.run(()=>travel(this.state,countryId,city,withFamily));} emigrate(countryId:string,city?:string){return this.run(()=>emigrate(this.state,countryId,city));} license(kind:'driving'|'boating'|'pilot',score:number){return this.run(()=>takeLicenseTest(this.state,kind,score));}
  startSpecial(kind:Parameters<typeof Special.startSpecialOrganization>[1]){return this.run(()=>Special.startSpecialOrganization(this.state,kind));} runSpecial(kind:Parameters<typeof Special.runSpecialOrganization>[1],action:string){return this.run(()=>Special.runSpecialOrganization(this.state,kind,action));}
  actingLesson(){return this.run(()=>Special.takeActingLesson(this.state));} actingAudition(score?:number){return this.run(()=>Special.auditionActing(this.state,score));} actingAgent(){return this.run(()=>Special.hireActingAgent(this.state));}
  musicPractice(instrument?:string){return this.run(()=>Special.practiceMusic(this.state,instrument));} musicRelease(kind:'song'|'album'){return this.run(()=>Special.releaseMusic(this.state,kind));} musicTour(){return this.run(()=>Special.tourMusic(this.state));}
  sportsJoin(sport:string){return this.run(()=>Special.joinSportsPath(this.state,sport));} sportsTrain(){return this.run(()=>Special.trainSport(this.state));} sportsPro(score?:number){return this.run(()=>Special.pursueProSports(this.state,score));}
  combatTrain(){return this.run(()=>Special.trainCombat(this.state));} combatFight(score?:number){return this.run(()=>Special.takeFight(this.state,score));}
  enlist(branch:string,officer=false){return this.run(()=>Special.enlistMilitary(this.state,branch,officer));} militaryTrain(){return this.run(()=>Special.militaryTraining(this.state));}
  campaign(level:number){return this.run(()=>Special.enterPolitics(this.state,level));} politicalAction(action:'speech'|'policy'|'press'|'fundraise'){return this.run(()=>Special.politicalAction(this.state,action));}
  royalDuty(){return this.run(()=>Special.royalDuty(this.state));} model(action:'lesson'|'audition'|'photoshoot'|'runway'){return this.run(()=>Special.modelingAction(this.state,action));} race(action:'join'|'train'|'race',score?:number){return this.run(()=>Special.racingAction(this.state,action,score));} directFilm(budget:number){return this.run(()=>Special.directFilm(this.state,budget));}
  joinCrimeOrg(){return this.run(()=>Special.joinCrimeOrganization(this.state));} crimeOrgAction(action:'earn'|'contribute'|'reputation'|'informant'){return this.run(()=>Special.crimeOrganizationAction(this.state,action));}
  riskyHabit(kind:'alcohol'|'gambling'|'smoking'|'fictional_substance'){return this.run(()=>riskyHabit(this.state,kind));} rehab(kind:string){return this.run(()=>enterRehab(this.state,kind));} treat(conditionId:string,kind:'general'|'specialist'|'emergency'){return this.run(()=>seekTreatment(this.state,conditionId,kind));}
  activateChallenge(id:string){const ok=activateChallenge(this.state,id);if(ok){evaluateChallenges(this.state);this.emit(true);}return ok;}
  continueAsChild(id:string){return this.run(()=>continueAsChild(this.state,id),true);} setWill(beneficiaries:Array<{npcId:string;percentage:number}>){return this.run(()=>setWill(this.state,beneficiaries));}
  rewind(age:number){return this.run(()=>rewindToAge(this.state,age),true);} forceEvent(id:string){return this.run(()=>forceEvent(this.state,id),false);} forceDeath(){return this.run(()=>({success:checkDeath(this.state,true),messages:[{text:'Forced death check executed.'}]}),true);}
  debugPatch(patch:Partial<{age:number;money:number;health:number;happiness:number;intelligence:number;appearance:number}>){if(!this.state.flags.sandbox&&!this.state.flags.debugEnabled)return{success:false,messages:[{text:'Debug changes require sandbox or development mode.'}]};if(patch.age!==undefined)this.state.character.age=Math.max(0,Math.floor(patch.age));if(patch.money!==undefined)this.state.finances.cash=patch.money;for(const key of ['health','happiness','intelligence','appearance'] as const)if(patch[key]!==undefined)this.state.character.stats[key]=Math.max(0,Math.min(100,patch[key]!));this.emit(true);return{success:true,messages:[{text:'Debug state updated.'}]};}
  updateSettings(patch:Partial<GameState['settings']>){Object.assign(this.state.settings,patch);saveSettings(this.state.settings);this.emit(true);}
}
