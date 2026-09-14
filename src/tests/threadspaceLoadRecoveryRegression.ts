import { clearLazyScreenRetry, isRecoverableLazyScreenError, lazyScreenRetryKey, shouldReloadLazyScreen } from '../core/lazyScreenRecovery';

function verify(condition:unknown,message:string):asserts condition{if(!condition)throw new Error(`Threadspace load recovery regression failed: ${message}`);}

function memoryStorage(){const data=new Map<string,string>();return{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};}

export function runThreadspaceLoadRecoveryRegression(){let checks=0;const check=(condition:unknown,message:string)=>{verify(condition,message);checks+=1;};
  check(isRecoverableLazyScreenError(new TypeError('Failed to fetch dynamically imported module: /assets/PeopleScreen-old.js')),'dynamic-import fetch failures must be classified as recoverable');
  check(isRecoverableLazyScreenError(new Error('Importing a module script failed.')),'module-script failures must be classified as recoverable');
  check(isRecoverableLazyScreenError(new Error('ChunkLoadError: Loading chunk 42 failed.')),'chunk-load failures must be classified as recoverable');
  check(!isRecoverableLazyScreenError(new Error('Player profile projection invariant failed')),'ordinary gameplay/render exceptions must not trigger an automatic reload');
  check(lazyScreenRetryKey('people')!==lazyScreenRetryKey('map'),'People and Map must use independent one-shot retry guards');
  const storage=memoryStorage();
  check(shouldReloadLazyScreen('people',storage),'the first People lazy-load failure must permit one recovery reload');
  check(!shouldReloadLazyScreen('people',storage),'a repeated People failure in the same session must not create a reload loop');
  check(shouldReloadLazyScreen('map',storage),'Map must still receive its own independent recovery attempt');
  clearLazyScreenRetry('people',storage);
  check(shouldReloadLazyScreen('people',storage),'a later successful import may clear the People retry guard for future deployments');
  clearLazyScreenRetry('map',storage);
  check(shouldReloadLazyScreen('map',storage),'the Map retry guard must also be independently clearable');
  return checks;
}
