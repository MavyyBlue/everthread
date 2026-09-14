import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RETRY_PREFIX='everthread-lazy-screen-retry:';
const RECOVERABLE_PATTERNS=[
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'chunkloaderror',
  'loading chunk',
  'failed to fetch',
  'error loading dynamically imported module',
];

function errorText(error:unknown){
  if(error instanceof Error)return `${error.name} ${error.message}`.toLowerCase();
  return String(error??'').toLowerCase();
}

export function isRecoverableLazyScreenError(error:unknown){
  const text=errorText(error);
  return RECOVERABLE_PATTERNS.some(pattern=>text.includes(pattern));
}

export function lazyScreenRetryKey(screenId:string){return `${RETRY_PREFIX}${screenId}`;}

export function shouldReloadLazyScreen(screenId:string,storage:Pick<Storage,'getItem'|'setItem'>){
  const key=lazyScreenRetryKey(screenId);
  if(storage.getItem(key)==='1')return false;
  storage.setItem(key,'1');
  return true;
}

export function clearLazyScreenRetry(screenId:string,storage:Pick<Storage,'removeItem'>){storage.removeItem(lazyScreenRetryKey(screenId));}

export function lazyWithScreenRecovery<T extends ComponentType<any>>(
  screenId:string,
  importer:()=>Promise<{default:T}>,
):LazyExoticComponent<T>{
  return lazy(async()=>{
    try{
      const module=await importer();
      if(typeof window!=='undefined')clearLazyScreenRetry(screenId,window.sessionStorage);
      return module;
    }catch(error){
      if(typeof window!=='undefined'&&isRecoverableLazyScreenError(error)&&shouldReloadLazyScreen(screenId,window.sessionStorage)){
        window.location.reload();
        return await new Promise<never>(()=>{});
      }
      throw error;
    }
  });
}
