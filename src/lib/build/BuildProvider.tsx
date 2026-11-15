"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { BuildEngine, detectConfig } from "./engine";

const EngineContext = createContext<BuildEngine | null>(null);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(() => new BuildEngine(detectConfig()));

  useEffect(() => {
    // The inline script in layout.tsx adds `build-pending` before paint so SSR'd
    // content never flashes. Once layers have registered (layout effects ran) we
    // hand control to the per-layer styles.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => document.documentElement.classList.remove("build-pending")),
    );
    const onVisibility = () => engine.setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [engine]);

  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export function useEngine(): BuildEngine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error("useEngine must be used inside <BuildProvider>");
  return engine;
}

/** Re-renders the caller whenever global engine state changes (throttled). */
export function useEngineVersion(): number {
  const engine = useEngine();
  return useSyncExternalStore(engine.subscribe, engine.getVersion, () => 0);
}

/** True only after hydration — used to avoid SSR/client markup mismatches. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
