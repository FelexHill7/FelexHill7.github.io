"use client";

import { Component, type ReactNode } from "react";

/** Static stand-in for the 3D object when WebGL is unavailable or fails. */
function ObjectFallback() {
  return (
    <div aria-hidden className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[62%] w-[62%]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#5b8bff_0%,#1b56ff_35%,rgba(27,86,255,0.15)_70%,transparent_72%)] blur-[1px]" />
        <div className="absolute inset-[14%] rounded-full border-[14px] border-[#1b56ff]/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-5 w-5 rounded-full bg-[#ffb21c] shadow-[0_0_24px_6px_rgba(255,178,28,0.55)]"
            style={{ transform: `rotate(${deg}deg) translate(0, -43%) translate(-50%, -50%)` }}
          />
        ))}
      </div>
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
