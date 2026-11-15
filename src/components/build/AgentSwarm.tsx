"use client";

import { useEffect, useRef } from "react";
import { useEngine, useEngineVersion, useMounted } from "@/lib/build/BuildProvider";
import { Swarm } from "@/lib/build/swarm";

/** Full-screen canvas overlay that renders the agent cursors and selection chrome. */
export function AgentSwarm() {
  const engine = useEngine();
  const version = useEngineVersion();
  const mounted = useMounted();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const swarmRef = useRef<Swarm | null>(null);
  const instant = engine.config.instant;

  useEffect(() => {
    if (!mounted || instant || !canvasRef.current) return;
    const swarm = new Swarm(engine, canvasRef.current);
    swarmRef.current = swarm;
    swarm.start();
    return () => {
      swarm.destroy();
      swarmRef.current = null;
    };
  }, [mounted, engine, instant]);

  // Restart the loop after Replay or when the tab becomes visible again.
  useEffect(() => {
    const swarm = swarmRef.current;
    if (!swarm) return;
    if (engine.hidden) swarm.stop();
    else if (engine.phase !== "done" && !swarm.running) swarm.start();
  }, [version, engine]);

  if (!mounted || engine.config.instant) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
      style={{ opacity: engine.phase === "done" ? 0 : 1, transition: "opacity 900ms ease" }}
    />
  );
}
