import type { GameState, SettingsState } from '../types/game';
import { enforceStateInvariants, validateState } from '../core/invariants';
import { jobById, jobs } from '../data/jobs';
import { countryById } from '../data/countries';
import { migrateLegacySchoolWorlds } from '../systems/SchoolWorldSystem';

const DB_NAME='everthread';const DB_VERSION=1;const STORE='saves';const ACTIVE_SLOT_KEY='everthread-active-save-slot';export const SAVE_VERSION=7;

function canUseIndexedDb(){return typeof indexedDB!=='undefined';}
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'slotId'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}

function stripRuntime(state:GameState){const copy=structuredClone(state);delete copy.flags.ageUpLocked;return copy;}

export function migrateSave(raw:unknown):GameState {
  if(!raw||typeof raw!=='object')throw new Error('Save is not an object');const state=structuredClone(raw) as GameState;let version=Number(state.saveVersion??1);
  if(version<2){state.travel=state.travel??{visitedCountries:[state.character.countryId],visitedCities:[state.character.city],emigrations:0,licenses:{driving:false,boating:false,pilot:false}};version=2;}
  if(version<3){state.inheritance=state.inheritance??{will:[],inheritBusinesses:true,inheritProperties:true};state.yearlySnapshots=state.yearlySnapshots??[];version=3;}
  if(version<4){const entityCount=Object.keys(state.npcs??{}).length+(state.relationships?.length??0)+(state.timeline?.length??0)+(state.delayedEvents?.length??0)+(state.businesses?.length??0)+(state.pets?.length??0)+(state.finances?.liabilities?.length??0)+(state.health?.conditions?.length??0);state.idCounter=10000+entityCount;version=4;}
  if(version<5){
    state.familyPlanning=state.familyPlanning??{};
    state.flags=state.flags??{sandbox:false,rewindEnabled:false,debugEnabled:false};
    const current=state.employment?.current;
    const job=current?jobById[current.jobId]:undefined;
    if(current&&job){
      const country=countryById[state.character.countryId];
      const marketHigh=job.salaryRange[1]*(country?.salaryMultiplier??1)*(state.economy?.salaryIndex??1);
      const hardCeiling=Math.max(1,Math.round(marketHigh*1.6));
      const runawayCompensation=Number.isFinite(current.salary)&&current.salary>hardCeiling*100;
      if(runawayCompensation&&!state.flags.sandbox){
        const summary=state.finances?.lastYearSummary;
        if(summary&&summary.income>hardCeiling*100&&summary.netChange>0){
          const priorCash=state.finances.cash-summary.netChange;
          if(priorCash>=-hardCeiling*2&&priorCash<hardCeiling*50){
            state.finances.cash=Math.max(0,Math.round(priorCash));
            state.finances.annualIncome=0;state.finances.annualExpenses=0;state.finances.taxesPaid=0;
            delete state.finances.lastYearSummary;
            state.flags.compensationCashRepairApplied=true;
          }
        }
      }
      if(!Number.isFinite(current.salary)||current.salary>hardCeiling){
        current.salary=hardCeiling;
        state.flags.compensationRepairApplied=true;
      }
      const relevantYears=[...state.employment.history,current].reduce((years,record)=>{
        const previous=jobById[record.jobId];if(!previous||previous.industry!==job.industry)return years;
        return years+Math.max(0,(record.endAge??state.character.age)-record.startAge);
      },0);
      if(relevantYears<job.experienceRequirement){
        const replacement=jobs.filter(candidate=>candidate.industry===job.industry&&candidate.minAge<=state.character.age&&candidate.experienceRequirement<=relevantYears).sort((a,b)=>a.experienceRequirement-b.experienceRequirement).at(-1);
        if(replacement){
          const salaryMultiplier=(country?.salaryMultiplier??1)*(state.economy?.salaryIndex??1);
          current.jobId=replacement.id;current.title=replacement.title;current.level=Number(replacement.id.match(/_(\d+)$/)?.[1]??1);
          current.salary=Math.round(((replacement.salaryRange[0]+replacement.salaryRange[1])/2)*salaryMultiplier);
          state.flags.careerProgressionRepairApplied=true;
        }
      }
    }
    version=5;
  }
  if(version<6){
    state.actionLedger=state.actionLedger??{age:state.character.age,uses:{},lastUsedAge:{},revision:0};
    const legacyAgeActions:[string,string][]=[
      ['lastJobStartAge','career.job_start'],['lastWorkHarderAge','career.work_harder'],['lastRaiseRequestAge','career.raise'],
      ['lastChildAttemptAge','family.child_attempt'],['lastAdoptionAge','family.adoption'],
    ];
    for(const [flagKey,actionKey] of legacyAgeActions){
      const usedAge=Number(state.flags?.[flagKey]??Number.NaN);
      if(Number.isFinite(usedAge)){
        state.actionLedger.lastUsedAge[actionKey]=usedAge;
        if(usedAge===state.character.age)state.actionLedger.uses[actionKey]=Math.max(1,state.actionLedger.uses[actionKey]??0);
      }
    }
    state.actionLedger.revision=Number.isFinite(state.actionLedger.revision)?state.actionLedger.revision:0;
    version=6;
  }
  if(version<7){
    state.socialWorlds=state.socialWorlds??[];
    migrateLegacySchoolWorlds(state);
    version=7;
  }
  if(version>SAVE_VERSION)throw new Error(`Save version ${version} is newer than this build supports.`);state.saveVersion=SAVE_VERSION;state.idCounter=Number.isFinite(state.idCounter)?state.idCounter:10000;state.achievements=state.achievements??[];state.challenges=state.challenges??[];state.completedLives=state.completedLives??[];state.specialCareers=state.specialCareers??{};state.familyPlanning=state.familyPlanning??{};state.socialWorlds=state.socialWorlds??[];state.actionLedger=state.actionLedger??{age:state.character.age,uses:{},lastUsedAge:{},revision:0};state.actionLedger.revision=Number.isFinite(state.actionLedger.revision)?state.actionLedger.revision:0;state.flags=state.flags??{sandbox:false,rewindEnabled:false,debugEnabled:false};return enforceStateInvariants(state);
}

export async function saveGame(state:GameState):Promise<void>{state.lastSavedAt=new Date().toISOString();const clean=stripRuntime(state);if(!canUseIndexedDb()){localStorage.setItem(`everthread-save-${state.slotId}`,JSON.stringify(clean));return;}const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(clean);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();}

export async function loadGame(slotId='slot-1'):Promise<GameState|undefined>{let raw:unknown;if(!canUseIndexedDb()){const text=localStorage.getItem(`everthread-save-${slotId}`);raw=text?JSON.parse(text):undefined;}else{const db=await openDb();raw=await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(slotId);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});db.close();}return raw?migrateSave(raw):undefined;}

export async function loadAllGames():Promise<GameState[]>{
  let raw:unknown[]=[];
  if(!canUseIndexedDb()){
    const keys:string[]=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith('everthread-save-'))keys.push(key);}
    raw=keys.map(k=>{const text=localStorage.getItem(k);return text?JSON.parse(text):undefined;}).filter(Boolean);
  }else{
    const db=await openDb();raw=await new Promise<unknown[]>((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result as unknown[]);req.onerror=()=>reject(req.error);});db.close();
  }
  const games:GameState[]=[];
  for(const item of raw){try{games.push(migrateSave(item));}catch(error){console.warn('Skipping unreadable Everthread save',error);}}
  return games.sort((a,b)=>(b.lastSavedAt??'').localeCompare(a.lastSavedAt??''));
}

export async function listSaveSlots():Promise<Array<{slotId:string;name:string;age:number;alive:boolean;generation:number;lastSavedAt?:string}>>{return (await loadAllGames()).map(s=>({slotId:s.slotId,name:`${s.character.firstName} ${s.character.lastName}`,age:s.character.age,alive:s.character.alive,generation:s.legacy.generation,lastSavedAt:s.lastSavedAt}));}

export function nextSaveSlotId(existingIds:string[]):string{const used=new Set(existingIds);for(let index=1;index<100000;index++){const id=`slot-${index}`;if(!used.has(id))return id;}throw new Error('No save slot is available.');}
export async function allocateSaveSlotId():Promise<string>{return nextSaveSlotId((await listSaveSlots()).map(slot=>slot.slotId));}
export function getActiveSaveSlotId():string|undefined{if(typeof localStorage==='undefined')return undefined;return localStorage.getItem(ACTIVE_SLOT_KEY)??undefined;}
export function setActiveSaveSlotId(slotId:string|undefined){if(typeof localStorage==='undefined')return;if(slotId)localStorage.setItem(ACTIVE_SLOT_KEY,slotId);else localStorage.removeItem(ACTIVE_SLOT_KEY);}

export async function deleteSave(slotId:string):Promise<void>{if(!canUseIndexedDb()){localStorage.removeItem(`everthread-save-${slotId}`);return;}const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(slotId);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();}

export function exportSave(state:GameState):string{return JSON.stringify(stripRuntime(state),null,2);}
export function importSave(json:string):GameState{if(json.length>15_000_000)throw new Error('Save file is too large.');const raw=JSON.parse(json) as unknown;const migrated=migrateSave(raw);const errors=validateState(migrated);if(errors.length)throw new Error(`Save validation failed: ${errors.join('; ')}`);return migrated;}

const SETTINGS_KEY='everthread-settings';
export function saveSettings(settings:SettingsState){if(typeof localStorage!=='undefined')localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}
export function loadSettings():Partial<SettingsState>{if(typeof localStorage==='undefined')return{};try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)??'{}') as Partial<SettingsState>;}catch{return{};}}
