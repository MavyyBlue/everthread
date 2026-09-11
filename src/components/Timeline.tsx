import { useMemo, useState } from 'react';
import type { TimelineEntry } from '../types/game';
import { formatMoney } from '../core/format';
import { TIMELINE_INITIAL_RENDER, TIMELINE_RENDER_STEP, timelineWindow } from '../core/timelineWindow';

const symbols:Record<string,string>={birth:'◉',family:'⌂',school:'▤',relationship:'♡',career:'▣',money:'¤',health:'+',crime:'!',legal:'§',fame:'★',asset:'◆',business:'▦',travel:'✦',achievement:'✹',death:'◇',random:'•'};

export function Timeline({entries}:{entries:TimelineEntry[]}){
  const [requested,setRequested]=useState(TIMELINE_INITIAL_RENDER);
  const window=useMemo(()=>timelineWindow(entries,requested),[entries,requested]);
  return <div className="timeline" aria-label="Life timeline">
    {[...window.entries].reverse().map(entry=><article className={`timeline-entry importance-${entry.importance}`} key={entry.id}><div className="timeline-age"><span className="timeline-symbol" aria-hidden="true">{symbols[entry.category]??'•'}</span><strong>{entry.age}</strong></div><div className="timeline-copy">{entry.title&&<h3>{entry.title}</h3>}<p>{entry.text}</p>{entry.moneyDelta!==undefined&&entry.moneyDelta!==0&&<small>{entry.moneyDelta>0?'+':''}{formatMoney(entry.moneyDelta)} game currency</small>}{entry.detail&&<details><summary>Details</summary><p>{entry.detail}</p></details>}</div></article>)}
    {window.hiddenCount>0&&<button className="timeline-load-more" type="button" onClick={()=>setRequested(value=>value+TIMELINE_RENDER_STEP)}>Show older entries <small>{window.hiddenCount.toLocaleString()} remaining</small></button>}
  </div>;
}
