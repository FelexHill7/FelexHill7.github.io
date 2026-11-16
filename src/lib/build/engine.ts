/**
 * BuildEngine — the orchestrator behind the "page builds itself" effect.
 *
 * Every <Buildable> registers a *layer* (id, kind, section, order, DOM node).
 * Sections arm themselves when they scroll into view. The engine runs a queue:
 * armed sections' pending layers start building in order, at most
 * `maxConcurrent` at a time, and the AgentSwarm canvas reads the active layers
 * every frame to know where to fly and what to draw.
 *
 * Framework-free on purpose: React subscribes through useSyncExternalStore.
 */

export type LayerKind = "text" | "box" | "chip" | "image";
export type LayerStatus = "pending" | "building" | "built";
export type Phase = "intro" | "building" | "done";

export interface Layer {
  id: string;
  kind: LayerKind;
  section: string;
  order: number;
  el: HTMLElement | null;
  status: LayerStatus;
  progress: number;
  duration: number;
  startedAt: number;
}

export interface LayerInput {
  id: string;
  kind: LayerKind;
  section: string;
  order: number;
  el: HTMLElement | null;
  /** Text length; sets the typing duration. */
  chars?: number;
  /** Override the computed duration in ms. */
  duration?: number;
}

export interface EngineConfig {
  agents: number;
  maxConcurrent: number;
  /** Multiplier on all durations (mobile uses < 1). */
  speed: number;
  mobile: boolean;
  /** prefers-reduced-motion: everything is built immediately, swarm hidden. */
  instant: boolean;
}

const CHAR_MS = 20;
const MIN_START_GAP_MS = 130;

/** Text longer than this is a summary paragraph and types more slowly, so it can be read. */
const SUMMARY_CHARS = 80;
const SUMMARY_PACE = 1.3;
/** Everything else (headings, labels, boxes, chips) is slowed slightly so it doesn't overwhelm. */
const PACE = 1.15;

function baseDuration(input: LayerInput): number {
  if (input.duration) return input.duration * PACE;
  switch (input.kind) {
    case "text": {
      const chars = input.chars ?? 0;
      const base = Math.min(3000, 420 + chars * CHAR_MS);
      return base * (chars > SUMMARY_CHARS ? SUMMARY_PACE : PACE);
    }
    case "chip":
      return 560 * PACE;
    case "image":
      return 1500 * PACE;
    case "box":
    default:
      return 1100 * PACE;
  }
}

/** True when the element is actually on screen (any part of it above the fold). */
function onScreen(el: HTMLElement | null): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight - 24;
}

export class BuildEngine {
  config: EngineConfig;
  readonly layers = new Map<string, Layer>();
  readonly sectionIndex = new Map<string, number>();
  readonly armed = new Set<string>();

  phase: Phase;
  paused = false; // user pause
  hidden = false; // tab hidden
  version = 0;
  replayCount = 0;
  introDuration = 2300;
  introStartedAt = 0;

  private elapsedMs = 0;
  private lastTick = 0;
  private lastStartAt = 0;
  private lastGlobalEmit = 0;
  private pausedAt = 0;
  private layerListeners = new Map<string, Set<() => void>>();
  private globalListeners = new Set<() => void>();

  constructor(config: EngineConfig) {
    this.config = config;
    this.phase = config.instant ? "done" : "intro";
  }

  /* ---------- registration ---------- */

  registerSection(id: string, index: number) {
    this.sectionIndex.set(id, index);
    if (this.config.instant || index === 0) this.armed.add(id);
    this.queue = null;
  }

  arm(section: string) {
    if (this.armed.has(section)) return;
    this.armed.add(section);
    this.queue = null;
    this.emitGlobal(true);
  }

  /**
   * Build state of layers that unmounted, keyed by id. A layer that re-registers
   * (its text changed, hot reload, a remount) keeps its state instead of going
   * back to "pending", which would hide it for good once the page is done.
   */
  private remembered = new Map<string, Pick<Layer, "status" | "progress" | "startedAt">>();

  register(input: LayerInput): Layer {
    const prev = this.remembered.get(input.id);
    this.remembered.delete(input.id);
    // nothing builds after the page is done, so late arrivals appear already built
    const instant = this.config.instant || this.phase === "done";
    const layer: Layer = {
      id: input.id,
      kind: input.kind,
      section: input.section,
      order: input.order,
      el: input.el,
      status: prev?.status ?? (instant ? "built" : "pending"),
      progress: prev?.progress ?? (instant ? 1 : 0),
      duration: baseDuration(input) * this.config.speed,
      startedAt: prev?.startedAt ?? 0,
    };
    this.layers.set(layer.id, layer);
    this.queue = null;
    this.emitLayer(layer.id);
    this.emitGlobal(true);
    return layer;
  }

  unregister(id: string) {
    const l = this.layers.get(id);
    if (l) this.remembered.set(id, { status: l.status, progress: l.progress, startedAt: l.startedAt });
    this.layers.delete(id);
    this.queue = null;
    this.emitGlobal(true);
  }

  /* ---------- subscriptions ---------- */

  subscribe = (fn: () => void) => {
    this.globalListeners.add(fn);
    return () => {
      this.globalListeners.delete(fn);
    };
  };

  getVersion = () => this.version;

  subscribeLayer(id: string, fn: () => void) {
    let set = this.layerListeners.get(id);
    if (!set) {
      set = new Set();
      this.layerListeners.set(id, set);
    }
    set.add(fn);
    return () => {
      set!.delete(fn);
    };
  }


  private emitLayer(id: string) {
    this.layerListeners.get(id)?.forEach((fn) => fn());
  }

  private emitGlobal(force = false) {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    if (!force && now - this.lastGlobalEmit < 250) return;
    this.lastGlobalEmit = now;
    this.version++;
    this.globalListeners.forEach((fn) => fn());
  }

  /* ---------- derived state ---------- */

  get total() {
    return this.layers.size;
  }

  get builtCount() {
    let n = 0;
    this.layers.forEach((l) => l.status === "built" && n++);
    return n;
  }

  get elapsedSeconds() {
    return Math.round(this.elapsedMs / 1000);
  }

  get isPaused() {
    return this.paused || this.hidden;
  }

  getActive(): Layer[] {
    const out: Layer[] = [];
    this.layers.forEach((l) => l.status === "building" && out.push(l));
    out.sort((a, b) => a.startedAt - b.startedAt);
    return out;
  }

  /** Upcoming layers in build order (armed sections only), for agents to claim. */
  getQueue(limit: number): Layer[] {
    return this.pendingCandidates().slice(0, limit);
  }

  /** Sorted pending queue, rebuilt only when layers, statuses or armed sections change. */
  private queue: Layer[] | null = null;

  private pendingCandidates(): Layer[] {
    if (this.queue) return this.queue;
    const out: Layer[] = [];
    this.layers.forEach((l) => {
      if (l.status === "pending" && this.armed.has(l.section)) out.push(l);
    });
    out.sort((a, b) => {
      const sa = this.sectionIndex.get(a.section) ?? 99;
      const sb = this.sectionIndex.get(b.section) ?? 99;
      return sa - sb || a.order - b.order;
    });
    this.queue = out;
    return out;
  }

  /* ---------- controls ---------- */

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.pausedAt = performance.now();
    this.emitGlobal(true);
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.shiftClocks(performance.now() - this.pausedAt);
    this.emitGlobal(true);
  }

  setHidden(hidden: boolean) {
    if (this.hidden === hidden) return;
    this.hidden = hidden;
    if (hidden) this.pausedAt = performance.now();
    else this.shiftClocks(performance.now() - this.pausedAt);
    this.emitGlobal(true);
  }

  private shiftClocks(ms: number) {
    this.introStartedAt += ms;
    this.lastStartAt += ms;
    this.layers.forEach((l) => {
      if (l.status === "building") l.startedAt += ms;
    });
    this.lastTick = 0;
  }

  skip() {
    this.queue = null;
    this.sectionIndex.forEach((_, id) => this.armed.add(id));
    this.layers.forEach((l) => {
      l.status = "built";
      l.progress = 1;
      this.emitLayer(l.id);
    });
    this.phase = "done";
    this.paused = false;
    this.emitGlobal(true);
  }

  replay() {
    this.queue = null;
    this.remembered.clear();
    const now = performance.now();
    this.armed.clear();
    this.sectionIndex.forEach((idx, id) => idx === 0 && this.armed.add(id));
    this.layers.forEach((l) => {
      l.status = "pending";
      l.progress = 0;
      l.startedAt = 0;
      this.emitLayer(l.id);
    });
    this.phase = "intro";
    this.paused = false;
    this.elapsedMs = 0;
    this.lastTick = 0;
    this.lastStartAt = 0;
    this.introStartedAt = now;
    this.replayCount++;
    this.emitGlobal(true);
  }

  /* ---------- main loop (driven by the swarm's rAF) ---------- */

  tick(now: number) {
    if (this.phase === "done" || this.isPaused) {
      this.lastTick = now;
      return;
    }
    if (this.lastTick === 0) this.lastTick = now;
    this.elapsedMs += Math.min(100, now - this.lastTick);
    this.lastTick = now;

    if (this.phase === "intro") {
      if (this.introStartedAt === 0) this.introStartedAt = now;
      if (now - this.introStartedAt >= this.introDuration) {
        this.phase = "building";
        this.emitGlobal(true);
      }
      return;
    }

    // advance active layers
    const active: Layer[] = [];
    let changed = false;
    this.layers.forEach((l) => {
      if (l.status !== "building") return;
      l.progress = Math.min(1, (now - l.startedAt) / l.duration);
      if (l.progress >= 1) {
        l.status = "built";
        changed = true;
      } else {
        active.push(l);
      }
      this.emitLayer(l.id);
    });

    // start new ones
    // Only elements the visitor can see start building, in order; anything below
    // the fold waits (the swarm idles) until it is scrolled into view.
    const gap = MIN_START_GAP_MS * (this.config.mobile ? 2 : 1);
    const visible =
      active.length < this.config.maxConcurrent && now - this.lastStartAt >= gap
        ? this.pendingCandidates().slice(0, 40).filter((l) => onScreen(l.el))
        : [];
    while (active.length < this.config.maxConcurrent && visible.length) {
      // stagger starts so parallel builds don't all fire on the same frame
      if (now - this.lastStartAt < gap) break;
      const next = visible.shift()!;
      next.status = "building";
      this.queue = null;
      next.startedAt = now;
      next.progress = 0;
      this.lastStartAt = now;
      active.push(next);
      this.emitLayer(next.id);
      changed = true;
    }

    if (this.layers.size > 0 && this.builtCount === this.layers.size) {
      this.phase = "done";
      changed = true;
    }

    this.emitGlobal(changed);
  }
}

export function detectConfig(): EngineConfig {
  if (typeof window === "undefined") {
    return { agents: 36, maxConcurrent: 5, speed: 1, mobile: false, instant: false };
  }
  // The build animation is the point of the site, so it always plays; the HUD's
  // Skip button is the opt-out. Flip this to honour prefers-reduced-motion instead:
  //   const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const instant = false;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  return {
    agents: mobile ? 12 : 36,
    maxConcurrent: mobile ? 2 : 5,
    speed: mobile ? 0.6 : 1,
    mobile,
    instant,
  };
}
