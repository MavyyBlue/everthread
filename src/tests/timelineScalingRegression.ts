import { TIMELINE_INITIAL_RENDER, TIMELINE_RENDER_STEP, timelineWindow } from '../core/timelineWindow';
import type { TimelineEntry } from '../types/game';

export function runTimelineScalingRegression(){
  let checks=0;function verify(condition:unknown,message:string):asserts condition{checks+=1;if(!condition)throw new Error(`Timeline scaling regression failed: ${message}`);}
  const entries:TimelineEntry[]=Array.from({length:5000},(_,index)=>({id:`timeline-${index}`,year:2000+(index%80),age:index%100,category:'random',importance:1,text:`Entry ${index}`}));
  const originalFirst=entries[0]!.id;const originalLast=entries.at(-1)!.id;
  const initial=timelineWindow(entries);
  verify(TIMELINE_INITIAL_RENDER===120&&TIMELINE_RENDER_STEP===120,'timeline rendering uses bounded mobile-friendly window and deterministic expansion step');
  verify(initial.visibleCount===120&&initial.hiddenCount===4880,'a 5,000-entry life initially renders only the newest 120 records');
  verify(initial.entries[0]!.id==='timeline-4880'&&initial.entries.at(-1)!.id==='timeline-4999','initial render window preserves chronological source order and contains the newest history');
  verify(entries.length===5000&&entries[0]!.id===originalFirst&&entries.at(-1)!.id===originalLast,'windowing never mutates or truncates the authoritative timeline');
  const expanded=timelineWindow(entries,TIMELINE_INITIAL_RENDER+TIMELINE_RENDER_STEP);
  verify(expanded.visibleCount===240&&expanded.hiddenCount===4760,'one expansion reveals exactly one additional history chunk');
  verify(expanded.entries[0]!.id==='timeline-4760'&&expanded.entries.at(-1)!.id==='timeline-4999','expanded window keeps the newest entry while revealing older history');
  const all=timelineWindow(entries,10000);verify(all.visibleCount===5000&&all.hiddenCount===0,'players can still reveal the complete timeline when they choose');
  const short=timelineWindow(entries.slice(0,80));verify(short.visibleCount===80&&short.hiddenCount===0,'short lives render in full without unnecessary pagination');
  const invalid=timelineWindow(entries,Number.NaN);verify(invalid.visibleCount===TIMELINE_INITIAL_RENDER,'invalid requested window falls back to the bounded default');
  const minimum=timelineWindow(entries,0);verify(minimum.visibleCount===1&&minimum.hiddenCount===4999,'window helper never returns an empty view for a non-empty timeline');

  const mutable=entries.slice(0,130);const firstMutableWindow=timelineWindow(mutable);
  const appended={...entries[130]!,id:'timeline-live-append'};mutable.push(appended);
  const secondMutableWindow=timelineWindow(mutable);
  verify(firstMutableWindow.entries.at(-1)?.id!==appended.id&&secondMutableWindow.entries.at(-1)?.id===appended.id,'same-reference timeline appends must be visible on the next render calculation');
  return checks;
}
