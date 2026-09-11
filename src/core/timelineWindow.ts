export const TIMELINE_INITIAL_RENDER=120;
export const TIMELINE_RENDER_STEP=120;

export interface TimelineWindow<T>{
  entries:T[];
  hiddenCount:number;
  visibleCount:number;
}

/**
 * Keep the full authoritative timeline in state while rendering only the most
 * recent window. Older history remains available in deterministic chunks, so a
 * life with thousands of entries does not create thousands of DOM nodes at once.
 */
export function timelineWindow<T>(entries:T[],requested=TIMELINE_INITIAL_RENDER):TimelineWindow<T>{
  const visible=Math.max(1,Math.floor(Number.isFinite(requested)?requested:TIMELINE_INITIAL_RENDER));
  const start=Math.max(0,entries.length-visible);
  return{entries:entries.slice(start),hiddenCount:start,visibleCount:entries.length-start};
}
