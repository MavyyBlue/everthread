/** Integration scaffolding, not an implementation of Everthread gameplay. */
export type Rect = readonly [number, number, number, number];
export type Availability = { available: true } | { available: false; reason: string };
export interface ActionContext {
  placeId: string;
  actionId: string;
  targetId?: string;
  itemId?: string;
}
export interface ActionAdapter {
  /** Read authoritative current state; recheck IDs, ownership and engine gates. */
  availability(context: ActionContext): Availability;
  /** Open the focused leaf flow or call the existing command exactly once. */
  execute(context: ActionContext): Promise<void>;
}
export function containedScene(width: number, height: number) {
  const scale = Math.max(0, Math.min(width / 1024, height / 1536));
  const w = 1024 * scale, h = 1536 * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}
export function placeRect(rect: Rect, stage: ReturnType<typeof containedScene>) {
  return { x: stage.x + rect[0] * stage.width, y: stage.y + rect[1] * stage.height,
    width: rect[2] * stage.width, height: rect[3] * stage.height };
}
export function propRect(bounds: Rect, width = .62, maxHeight = .32, baseline = .90): Rect {
  let w = width, h = w * bounds[3] / bounds[2] / 1.5;
  if (h > maxHeight) { h = maxHeight; w = h * 1.5 * bounds[2] / bounds[3]; }
  return [.5 - w / 2, baseline - h, w, h];
}
/** UI-level serialization. Engine validation and atomicity remain authoritative. */
export function createDispatcher(adapters: ReadonlyMap<string, ActionAdapter>) {
  let pending = false;
  return async (context: ActionContext): Promise<Availability> => {
    if (pending) return { available: false, reason: 'An action is already in progress.' };
    const adapter = adapters.get(context.actionId);
    if (!adapter) return { available: false, reason: 'This action is not connected yet.' };
    pending = true;
    try {
      const gate = adapter.availability(context);
      if (!gate.available) return gate;
      await adapter.execute(context);
      return { available: true };
    } finally { pending = false; }
  };
}
// Bind literal action IDs to hand-written adapters. Never execute JSON binding strings.
// Example bindings to implement inside the game's own validated UI flow:
// music.song -> gameEngine.musicRelease('song')
// music.album -> gameEngine.musicRelease('album')
// music.leave -> gate + confirmation -> gameEngine.leaveSpecialCareer('music')
// music.retire -> retirement gate + confirmation -> gameEngine.retireSpecialCareer('music')
// Any asynchronous picker must recheck state AGAIN when its final confirm is submitted.
