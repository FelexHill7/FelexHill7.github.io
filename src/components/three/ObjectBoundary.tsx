"use client";

import { Component, type ReactNode } from "react";

/** Same layer sizes as the 3D network in HeroObject. */
const LAYERS = [4, 7, 7, 5, 2];
/** Nodes drawn lit, as if a signal is passing through. */
const LIT = new Set(["1-2", "2-4", "3-1", "4-0"]);

/** Static, flat drawing of the hero network for when WebGL is unavailable or fails. */
function ObjectFallback() {
  const pts = LAYERS.map((n, l) =>
    Array.from({ length: n }, (_, i) => ({ x: 40 + l * 80, y: 200 + (i - (n - 1) / 2) * 44, id: `${l}-${i}` })),
  );
  return (
    <div aria-hidden className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="h-[78%] w-[78%]">
        <defs>
          <radialGradient id="fb-node" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#7d9dff" />
            <stop offset="60%" stopColor="#1b56ff" />
            <stop offset="100%" stopColor="#0f2f99" />
          </radialGradient>
          <radialGradient id="fb-glow">
            <stop offset="0%" stopColor="#ffb21c" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffb21c" stopOpacity="0" />
          </radialGradient>
        </defs>
        {pts.slice(0, -1).map((layer, l) =>
          layer.flatMap((a) =>
            pts[l + 1].map((b) => (
              <line key={`${a.id}>${b.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#5b7dff" strokeOpacity="0.18" strokeWidth="1" />
            )),
          ),
        )}
        {pts.flat().map((p) =>
          LIT.has(p.id) ? (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r="22" fill="url(#fb-glow)" />
              <circle cx={p.x} cy={p.y} r="9" fill="#ffb21c" />
            </g>
          ) : (
            <circle key={p.id} cx={p.x} cy={p.y} r="9" fill="url(#fb-node)" />
          ),
        )}
      </svg>
    </div>
  );
}

type State = { failed: boolean };

export class ObjectBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") console.warn("3D object disabled:", error);
  }

  render() {
    return this.state.failed ? <ObjectFallback /> : this.props.children;
  }
}
