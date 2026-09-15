import type { CSSProperties } from 'react';
import { EVERTHREAD_ICON_PATHS, type EverthreadIconName } from '../core/everthreadIcons';

/** Trusted, packaged Everthread vector geometry. Accessible names belong on the surrounding control. */
export function EverthreadIcon({name,size=24,className,style}:{name:EverthreadIconName;size?:number;className?:string;style?:CSSProperties}){
  return <svg className={className} aria-hidden="true" focusable="false" width={size} height={size}
    viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={style}
    dangerouslySetInnerHTML={{__html:EVERTHREAD_ICON_PATHS[name]}}/>;
}
