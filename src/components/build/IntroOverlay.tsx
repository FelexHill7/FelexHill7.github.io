"use client";

import { useEngine, useEngineVersion, useMounted } from "@/lib/build/BuildProvider";

/** Center icon + "Assembling page…" label shown while the swarm swirls before building. */
export function IntroOverlay() {
  const engine = useEngine();
  useEngineVersion();
  const mounted = useMounted();
  if (!mounted || engine.config.instant) return null;
  const show = engine.phase === "intro";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center gap-4"
      style={{ opacity: show ? 1 : 0, transition: "opacity 500ms ease" }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] shadow-[0_0_40px_-6px_rgba(47,107,255,0.6)]">
        <div className="h-3 w-3 rounded-[3px] bg-accent" />
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
        Assembling page<span className="intro-ellipsis" />
      </div>
    </div>
  );
}
