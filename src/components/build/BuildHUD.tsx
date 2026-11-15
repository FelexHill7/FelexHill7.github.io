"use client";

import { useEngine, useEngineVersion, useMounted } from "@/lib/build/BuildProvider";
import { AGENT_COLORS } from "@/lib/build/swarm";

const DOTS = AGENT_COLORS.slice(0, 5);

export function BuildHUD() {
  const engine = useEngine();
  useEngineVersion();
  const mounted = useMounted();
  if (!mounted || engine.config.instant) return null;

  const { total, builtCount, phase } = engine;
  const agents = engine.config.agents;
  const pct = total ? builtCount / total : 0;
  const done = phase === "done";
  const paused = engine.paused;

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    engine.replay();
  };

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#141416]/85 py-1.5 pl-3 pr-1.5 font-mono text-[11px] text-white/70 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md sm:bottom-5 sm:gap-3 sm:py-2 sm:pl-3.5 sm:pr-2"
    >
      <span className="flex items-center gap-1">
        {DOTS.map((c, i) => (
          <span
            key={c}
            className={`h-1.5 w-1.5 rounded-full ${done || paused ? "" : "animate-pulse"}`}
            style={{ background: c, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>

      {done ? (
        <span className="whitespace-nowrap">
          Built by {agents} agents in {engine.elapsedSeconds}s
        </span>
      ) : (
        <>
          <span className="whitespace-nowrap tabular-nums">
            <span className="hidden sm:inline">{agents} agents · </span>
            {builtCount} / {total} layers
          </span>
          <span className="hidden h-[2px] w-16 overflow-hidden rounded bg-white/10 sm:block">
            <span
              className="block h-full bg-accent transition-[width] duration-300"
              style={{ width: `${pct * 100}%` }}
            />
          </span>
        </>
      )}

      <span className="h-3 w-px bg-white/10" />

      <span className="flex items-center gap-0.5">
        {!done && (
          <>
            <HudButton onClick={() => (paused ? engine.resume() : engine.pause())}>
              {paused ? "Resume" : "Pause"}
            </HudButton>
            <HudButton onClick={() => engine.skip()}>Skip</HudButton>
          </>
        )}
        <HudButton onClick={replay}>Replay</HudButton>
      </span>
    </div>
  );
}

function HudButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2 py-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:px-2.5"
    >
      {children}
    </button>
  );
}
