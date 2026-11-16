/**
 * Swarm — single-canvas renderer for the agent cursors and the design-tool
 * chrome (selection boxes, handles, dimension tags, guides, edit flashes).
 *
 * Every active layer gets a *lead* agent that performs the action:
 *   text  → an I-beam cursor pinned to the caret while characters type in
 *   box   → an arrow cursor that drags the selection corner out from the
 *           origin, while a second agent holds the anchor corner
 *   chip  → an arrow cursor that clicks the chip (ripple), then marquee
 * Spare agents *claim* upcoming layers: they park on the element's corner and
 * outline where it will go. When that layer starts, its claimer becomes the
 * lead, so the cursor that claimed an element is the one that builds it.
 * Assignments are persistent (no reshuffling when the active set changes).
 *
 * It owns the rAF loop and drives engine.tick().
 */

import type { BuildEngine, Layer } from "./engine";

export const AGENT_COLORS = [
  "#ff4fa3", // pink
  "#2f6bff", // blue
  "#ffd23f", // yellow
  "#22d37f", // green
  "#a764ff", // purple
  "#ff7a1a", // orange
  "#3ad7ff", // cyan
  "#ff3b3b", // red
];

const BLUE = "#2f6bff";
const RED = "#ff3b3b";
const PLACEHOLDER = "#1b1b1f";
const BG = "#0b0b0c";

/** Box growth happens between these progress values (lead flies in first). */
const GROW_START = 0.14;
const GROW_END = 0.52;
/** Text starts typing at this progress (lead reaches the caret first). */
export const TYPE_START = 0.1;

type Role = "free" | "lead" | "ibeam" | "hold" | "claim";

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  scale: number;
  phase: number;
  dir: 1 | -1;
  orbitR: number;
  ox: number;
  oy: number;
  cross: boolean;
  role: Role;
  /** Layer id this agent is working on (build or claim), null when free. */
  job: string | null;
  name: string;
  /** Wander target for free agents. */
  wx: number;
  wy: number;
  wUntil: number;
  trail: number[];
}

interface Want {
  l: Layer;
  r: Rect;
  need: number;
  claim: boolean;
}

interface Cross {
  x: number;
  y: number;
  born: number;
  color: string;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export class Swarm {
  running = false;

  private ctx: CanvasRenderingContext2D;
  private raf = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private agents: Agent[] = [];
  private crosses: Cross[] = [];
  private frame = 0;
  private lastNow = 0;
  private doneAt = 0;
  private monoFont = "ui-monospace, Menlo, monospace";

  constructor(
    private engine: BuildEngine,
    private canvas: HTMLCanvasElement,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
    window.addEventListener("resize", this.resize);
    const fam = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-jetbrains")
      .trim();
    if (fam) this.monoFont = `${fam}, ui-monospace, monospace`;
    this.spawn();
  }

  private spawn() {
    const n = this.engine.config.agents;
    const cx = this.w / 2;
    const cy = this.h / 2;
    this.agents = Array.from({ length: n }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const r = 200 + Math.random() * 400;
      return {
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        vx: 0,
        vy: 0,
        angle: a,
        color: AGENT_COLORS[i % AGENT_COLORS.length],
        scale: 0.7 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        dir: Math.random() < 0.5 ? 1 : -1,
        orbitR: 46 + Math.random() * 110,
        ox: Math.random() * 2 - 1,
        oy: Math.random() * 2 - 1,
        cross: Math.random() < 0.28,
        role: "free",
        job: null,
        name: `agent-${String(i + 1).padStart(2, "0")}`,
        wx: cx,
        wy: cy,
        wUntil: 0,
        trail: [],
      };
    });
  }

  private resize = () => {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.lastNow = 0;
    this.doneAt = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.resize);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    // Paused: freeze the last frame and stop the loop. AgentSwarm restarts it on resume.
    if (this.engine.isPaused) {
      this.running = false;
      return;
    }
    this.frame++;
    // Idle orbit is slow, so drawing every other frame (~30 fps) looks the same at half the cost.
    if (this.idle && this.frame % 2 === 1) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    this.engine.tick(now);
    const dt = this.lastNow ? Math.min(2.5, (now - this.lastNow) / 16.667) : 1;
    this.lastNow = now;
    this.rects.clear();
    this.carets.clear();

    this.update(now, dt);
    this.draw(now);

    if (this.engine.phase === "done") {
      if (!this.doneAt) this.doneAt = now;
      if (now - this.doneAt > 1800) {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.running = false;
        return;
      }
    } else {
      this.doneAt = 0;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  /* ---------- geometry helpers ---------- */

  /** Layout reads are cached for the frame: each one can force a reflow. */
  private rects = new Map<string, Rect | null>();
  private carets = new Map<string, DOMRect | null>();

  private rectOf(l: Layer): Rect | null {
    const hit = this.rects.get(l.id);
    if (hit !== undefined) return hit;
    const r = l.el?.getBoundingClientRect();
    const rect = !r || (r.width === 0 && r.height === 0) ? null : { x: r.left, y: r.top, w: r.width, h: r.height };
    this.rects.set(l.id, rect);
    return rect;
  }

  /**
   * True while building has nothing to do on screen (no builders, no claims):
   * the visitor hasn't scrolled to the next unbuilt element yet.
   */
  private idle = false;

  private isBox(l: Layer) {
    return l.kind === "box" || l.kind === "image";
  }

  private growth(l: Layer) {
    return this.isBox(l) ? easeOut(clamp01((l.progress - GROW_START) / (GROW_END - GROW_START))) : 1;
  }

  private caretOf(l: Layer): DOMRect | null {
    const hit = this.carets.get(l.id);
    if (hit !== undefined) return hit;
    const r = l.el?.querySelector("[data-caret]")?.getBoundingClientRect() ?? null;
    this.carets.set(l.id, r);
    return r;
  }

  /** Where the lead agent works: caret, dragged corner, or chip centre. */
  private anchorOf(l: Layer, r: Rect): Point {
    if (l.kind === "text") {
      const c = this.caretOf(l);
      if (c) return { x: c.left + 1, y: c.top + c.height / 2 };
      return { x: r.x + r.w, y: r.y + r.h };
    }
    if (l.kind === "chip") return { x: r.x + r.w / 2 + 3, y: r.y + r.h / 2 + 2 };
    const g = this.growth(l);
    return { x: r.x + r.w * g, y: r.y + r.h * g };
  }

  /* ---------- simulation ---------- */

  private jobs = new Map<string, number[]>();

  private releaseAll() {
    if (!this.jobs.size) return;
    this.jobs.clear();
    for (const a of this.agents) a.job = null;
  }

  /**
   * Work out who does what this frame. Active layers need a lead (+ a corner
   * holder for boxes); visible upcoming layers each get one claimer. Free
   * agents are matched to the nearest open job; an active build may take a
   * claimer away from the least urgent claim if nobody else is free.
   */
  private assignJobs(): Map<string, Want> {
    const { engine, agents, h } = this;
    const wanted: Want[] = [];
    for (const l of engine.getActive()) {
      const r = this.rectOf(l);
      if (r) wanted.push({ l, r, need: this.isBox(l) ? 2 : 1, claim: false });
    }
    const maxClaims = Math.max(0, agents.length - engine.config.maxConcurrent * 2);
    let claims = 0;
    for (const l of engine.getQueue(maxClaims * 3)) {
      if (claims >= maxClaims) break;
      const r = this.rectOf(l);
      if (!r || r.y > h + 40 || r.y + r.h < -40) continue; // only claim what's on screen
      wanted.push({ l, r, need: 1, claim: true });
      claims++;
    }
    const byId = new Map(wanted.map((w) => [w.l.id, w]));

    // release finished / no-longer-wanted jobs and surplus agents
    for (const [id, idxs] of this.jobs) {
      const w = byId.get(id);
      if (!w) {
        for (const i of idxs) agents[i].job = null;
        this.jobs.delete(id);
        continue;
      }
      while (idxs.length > w.need) agents[idxs.pop()!].job = null;
    }

    // fill open slots, builds first (wanted is already in priority order)
    for (const w of wanted) {
      let idxs = this.jobs.get(w.l.id);
      if (!idxs) {
        idxs = [];
        this.jobs.set(w.l.id, idxs);
      }
      while (idxs.length < w.need) {
        let best = -1;
        let bestD = Infinity;
        for (let i = 0; i < agents.length; i++) {
          if (agents[i].job) continue;
          const d = (agents[i].x - w.r.x) ** 2 + (agents[i].y - w.r.y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        if (best < 0 && !w.claim) best = this.stealClaim(wanted);
        if (best < 0) break;
        agents[best].job = w.l.id;
        idxs.push(best);
      }
      if (!idxs.length) this.jobs.delete(w.l.id);
    }
    return byId;
  }

  /**
   * Target on the idle orbit for the n-th free agent: a few flocks spaced around
   * a wide ellipse, each a short arc of cursors, circling once every ~40 s.
   */
  private orbitFrame(now: number) {
    const { w, h, agents } = this;
    const flocks = Math.max(1, Math.min(5, Math.round(agents.length / 7)));
    const rx = Math.min(w * 0.38, 560);
    const ry = Math.min(h * 0.3, 280);
    const spin = now * 0.00015;
    return (rank: number, a: Agent) => {
      const flock = rank % flocks;
      const member = Math.floor(rank / flocks);
      const ang = spin + (flock / flocks) * Math.PI * 2 - member * 0.055;
      return {
        x: w / 2 + Math.cos(ang) * rx + a.ox * 18,
        y: h * 0.52 + Math.sin(ang) * ry + a.oy * 18,
      };
    };
  }

  private stealClaim(wanted: Want[]): number {
    for (let k = wanted.length - 1; k >= 0; k--) {
      const w = wanted[k];
      if (!w.claim) continue;
      const idxs = this.jobs.get(w.l.id);
      if (!idxs?.length) continue;
      const i = idxs.pop()!;
      if (!idxs.length) this.jobs.delete(w.l.id);
      this.agents[i].job = null;
      return i;
    }
    return -1;
  }

  private update(now: number, dt: number) {
    const { engine, agents, w, h } = this;
    const phase = engine.phase;
    const maxSpeed = (engine.config.mobile ? 9 : 14) * dt;

    let wants: Map<string, Want> | null = null;
    if (phase === "building") wants = this.assignJobs();
    else this.releaseAll();
    this.idle = phase === "building" && this.jobs.size === 0;
    const orbit = this.orbitFrame(now);
    let freeRank = 0;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      a.role = "free";
      let tx: number;
      let ty: number;
      let snap = false;

      const want = a.job && wants ? wants.get(a.job) : undefined;

      if (phase === "intro") {
        const ang = now * 0.0013 * a.dir + a.phase;
        const r = a.orbitR * (1 + 0.14 * Math.sin(now * 0.002 + a.phase));
        tx = w / 2 + Math.cos(ang) * r;
        ty = h / 2 - 12 + Math.sin(ang) * r * 0.7;
      } else if (phase === "done") {
        tx = a.ox > 0 ? w + 320 : -320;
        ty = -240 + a.oy * 200;
      } else if (want) {
        snap = true;
        const slot = this.jobs.get(want.l.id)?.indexOf(i) ?? 0;
        if (want.claim) {
          // parked on the element's top-left corner, gently bobbing
          a.role = "claim";
          tx = want.r.x - 1;
          ty = want.r.y - 1 + Math.sin(now * 0.003 + a.phase) * 1.5;
        } else if (slot === 0) {
          a.role = want.l.kind === "text" ? "ibeam" : "lead";
          const p = this.anchorOf(want.l, want.r);
          tx = p.x;
          ty = p.y;
        } else {
          a.role = "hold";
          tx = want.r.x - 1;
          ty = want.r.y - 1;
        }
      } else if (this.idle) {
        // nothing to build on screen: drift in small flocks around a slow, wide circle
        const p = orbit(freeRank++, a);
        tx = p.x;
        ty = p.y;
      } else {
        // others are working: leave the screen so every visible cursor is one doing a job
        if (now > a.wUntil) {
          a.wx = w * 0.15 + Math.random() * w * 0.7;
          a.wy = h + 60 + Math.random() * 80;
          a.wUntil = now + 2500 + Math.random() * 2500;
        }
        tx = a.wx;
        ty = a.wy;
      }

      const dx = tx - a.x;
      const dy = ty - a.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (snap) {
        // workers fly in fast, then lock onto their anchor so they visibly drive it
        if (dist < 60) {
          a.vx = (tx - a.x) * 0.6;
          a.vy = (ty - a.y) * 0.6;
          a.x = tx;
          a.y = ty;
        } else {
          // fast enough to follow a caret jumping to the next line
          const sp = Math.min(maxSpeed * 3, dist * 0.4 * dt);
          a.vx = (dx / dist) * sp;
          a.vy = (dy / dist) * sp;
          a.x += a.vx;
          a.y += a.vy;
        }
        const speed = Math.hypot(a.vx, a.vy);
        if (speed > 1.2) a.angle = Math.atan2(a.vy, a.vx);
      } else {
        const cap = phase === "building" ? maxSpeed * 0.6 : maxSpeed;
        const sp = Math.min(cap, dist * 0.14 * dt);
        a.vx += ((dx / dist) * sp - a.vx) * 0.13 * dt;
        a.vy += ((dy / dist) * sp - a.vy) * 0.13 * dt;

        // light separation so flocks read as groups, not a blob
        for (let k = 0; k < agents.length; k++) {
          if (k === i) continue;
          const b = agents[k];
          const sx = a.x - b.x;
          const sy = a.y - b.y;
          const d2 = sx * sx + sy * sy;
          if (d2 < 400 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = ((20 - d) / 20) * 0.5;
            a.vx += (sx / d) * f;
            a.vy += (sy / d) * f;
          }
        }
        a.x += a.vx;
        a.y += a.vy;
        const speed = Math.hypot(a.vx, a.vy);
        if (speed > 0.6) a.angle = Math.atan2(a.vy, a.vx);
      }

      a.trail.push(a.x, a.y);
      if (a.trail.length > 18) a.trail.splice(0, 2);

      const speed = Math.hypot(a.vx, a.vy);
      if (a.cross && speed > 5 && (this.frame + i) % 7 === 0) {
        this.crosses.push({ x: a.x, y: a.y, born: now, color: a.color });
      }
    }

    if (this.crosses.length > 140) this.crosses.splice(0, this.crosses.length - 140);
    let drop = 0;
    while (drop < this.crosses.length && now - this.crosses[drop].born >= 700) drop++;
    if (drop) this.crosses.splice(0, drop);
  }

  /* ---------- rendering ---------- */

  private draw(now: number) {
    const { ctx, w, h, engine } = this;
    ctx.clearRect(0, 0, w, h);

    if (engine.phase === "building") {
      this.drawClaims(now);
      for (const l of engine.getActive()) this.drawLayer(l, now);
    }

    ctx.lineWidth = 1;
    for (const c of this.crosses) {
      ctx.strokeStyle = c.color;
      ctx.globalAlpha = (1 - (now - c.born) / 700) * 0.8;
      ctx.beginPath();
      ctx.moveTo(c.x - 4, c.y);
      ctx.lineTo(c.x + 4, c.y);
      ctx.moveTo(c.x, c.y - 4);
      ctx.lineTo(c.x, c.y + 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // busy agents drawn last so roaming ones never cover them
    for (const a of this.agents) if (a.role === "free") this.drawAgent(a);
    for (const a of this.agents) if (a.role !== "free") this.drawAgent(a);
    for (const a of this.agents) if (a.role === "lead" || a.role === "ibeam") this.drawTag(a);
  }

  /** Dashed outline, in the claimer's colour, of each element waiting to be built. */
  private drawClaims(now: number) {
    const { ctx, agents } = this;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.lineDashOffset = -now / 60;
    for (const a of agents) {
      if (a.role !== "claim" || !a.job) continue;
      const l = this.engine.layers.get(a.job);
      const r = l && this.rectOf(l);
      if (!r) continue;
      // fade in as the claimer arrives
      const d = Math.hypot(a.x - r.x, a.y - r.y);
      const k = Math.max(0, 1 - d / 120);
      if (k <= 0) continue;
      ctx.globalAlpha = 0.45 * k;
      ctx.strokeStyle = a.color;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w, r.h);
    }
    ctx.restore();
  }

  /** Figma-style name pill next to a cursor that is actively building. */
  private drawTag(a: Agent) {
    const { ctx } = this;
    ctx.save();
    ctx.font = `9px ${this.monoFont}`;
    const tw = ctx.measureText(a.name).width;
    const x = Math.min(this.w - tw - 14, a.x + (a.role === "ibeam" ? 8 : 12));
    const y = Math.min(this.h - 18, a.y + (a.role === "ibeam" ? 10 : 16));
    ctx.fillStyle = a.color;
    ctx.beginPath();
    ctx.roundRect(x, y, tw + 10, 14, 3);
    ctx.fill();
    ctx.fillStyle = "#0b0b0c";
    ctx.textBaseline = "middle";
    ctx.fillText(a.name, x + 5, y + 7.5);
    ctx.restore();
  }

  private drawAgent(a: Agent) {
    const { ctx } = this;
    const fade = this.idle ? 0.55 : 1;
    const t = a.trail;
    const n = t.length / 2;
    if (n > 2) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = a.color;
      for (let k = 1; k < n; k++) {
        ctx.globalAlpha = (k / n) * 0.35 * fade;
        ctx.beginPath();
        ctx.moveTo(t[(k - 1) * 2], t[(k - 1) * 2 + 1]);
        ctx.lineTo(t[k * 2], t[k * 2 + 1]);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = fade;
    ctx.save();
    ctx.translate(a.x, a.y);

    if (a.role === "ibeam") {
      // text-tool cursor centred on the caret
      // soft glow from a wide translucent stroke under a crisp one (shadowBlur is costly)
      ctx.strokeStyle = a.color;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 8);
      ctx.moveTo(-3.5, -8);
      ctx.lineTo(3.5, -8);
      ctx.moveTo(-3.5, 8);
      ctx.lineTo(3.5, 8);
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
      return;
    }

    const isWorker = a.role !== "free";
    // once parked on its job a worker points like a real pointer; in flight it follows its motion
    const parked = isWorker && Math.hypot(a.vx, a.vy) < 4;
    const s = isWorker ? 1.05 : a.scale;
    ctx.rotate(parked ? 0 : a.angle + Math.PI * 0.75);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(3.6, 10.6);
    ctx.lineTo(6.3, 16.4);
    ctx.lineTo(8.4, 15.4);
    ctx.lineTo(5.8, 9.8);
    ctx.lineTo(10.6, 9.8);
    ctx.closePath();
    ctx.fillStyle = isWorker ? a.color : "rgba(11,11,12,0.85)";
    ctx.fill();
    ctx.lineWidth = 1.4 / s;
    ctx.lineJoin = "round";
    ctx.strokeStyle = isWorker ? "#0b0b0c" : a.color;
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private drawLayer(l: Layer, now: number) {
    const r = this.rectOf(l);
    if (!r) return;
    const { ctx, w, h } = this;
    const p = l.progress;
    const elapsed = now - l.startedAt;

    if (l.kind === "chip") {
      const pad = 5;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      ctx.save();
      // click ripple
      if (elapsed < 380) {
        const k = elapsed / 380;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 1 - k;
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + 18 * k, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (elapsed > 120) {
        const pulse = 0.55 + 0.45 * Math.sin(now * 0.025);
        ctx.strokeStyle = RED;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.45 + 0.55 * pulse;
        ctx.setLineDash([3, 2]);
        ctx.lineDashOffset = -now / 25;
        ctx.strokeRect(r.x - pad + 0.5, r.y - pad + 0.5, r.w + pad * 2, r.h + pad * 2);
        ctx.setLineDash([]);
        ctx.fillStyle = RED;
        ctx.globalAlpha = pulse;
        ctx.fillRect(r.x - pad - 1, r.y - pad - 9, 14, 6);
        if (Math.floor(now / 120) % 2 === 0) ctx.fillRect(r.x + r.w - 6, r.y + r.h + pad + 3, 10, 5);
      }
      ctx.restore();
      return;
    }

    const isText = l.kind === "text";
    const pad = isText ? 6 : 0;
    const g = this.growth(l);
    const bx = r.x - pad;
    const by = r.y - pad;
    const bw = isText ? r.w + pad * 2 : Math.max(2, r.w * g);
    const bh = isText ? r.h + pad * 2 : Math.max(2, r.h * g);
    const fade = Math.min(1, elapsed / 140);

    ctx.save();

    // guide lines snap across the viewport while the element is being placed
    if (!this.engine.config.mobile && p < 0.45) {
      ctx.globalAlpha = 0.32 * (1 - p / 0.45) * fade;
      ctx.lineWidth = 1;
      ctx.strokeStyle = BLUE;
      ctx.beginPath();
      ctx.moveTo(0, by + 0.5);
      ctx.lineTo(w, by + 0.5);
      ctx.moveTo(0, by + bh + 0.5);
      ctx.lineTo(w, by + bh + 0.5);
      ctx.stroke();
      ctx.strokeStyle = RED;
      ctx.beginPath();
      ctx.moveTo(bx + 0.5, 0);
      ctx.lineTo(bx + 0.5, h);
      ctx.moveTo(bx + bw + 0.5, 0);
      ctx.lineTo(bx + bw + 0.5, h);
      ctx.stroke();
    }

    ctx.globalAlpha = fade;
    if (isText) {
      ctx.fillStyle = "rgba(47,107,255,0.04)";
      ctx.fillRect(bx, by, bw, bh);
    } else {
      const pa = p < GROW_START ? 0 : p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.3);
      ctx.globalAlpha = pa * fade;
      ctx.fillStyle = PLACEHOLDER;
      ctx.fillRect(bx, by, bw, bh);
      ctx.globalAlpha = fade;
    }

    // selection outline + handles
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, by + 0.5, bw, bh);
    const hs = 6;
    const corners: Array<[number, number, boolean]> = [
      [bx, by, false],
      [bx + bw, by, false],
      [bx, by + bh, false],
      [bx + bw, by + bh, !isText && p < GROW_END],
    ];
    for (const [hx, hy, active] of corners) {
      ctx.fillStyle = active ? BLUE : BG;
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
      ctx.strokeRect(hx - hs / 2 + 0.5, hy - hs / 2 + 0.5, hs - 1, hs - 1);
    }

    // dimension tag
    const label = `${Math.round(bw)} × ${Math.round(bh)}`;
    ctx.font = `10px ${this.monoFont}`;
    const tw = ctx.measureText(label).width;
    const tagW = tw + 12;
    const tagH = 16;
    const tx = Math.min(w - tagW - 4, Math.max(4, bx + bw / 2 - tagW / 2));
    const ty = by + bh + 7;
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.roundRect(tx, ty, tagW, tagH, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(label, tx + 6, ty + tagH / 2 + 0.5);

    ctx.restore();
  }
}
