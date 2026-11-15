"use client";

import { createElement, useCallback, useSyncExternalStore, type ElementType, type ReactNode } from "react";
import { useEngine, useMounted } from "@/lib/build/BuildProvider";

/**
 * True once any layer in `section` has started building (or always, in instant mode).
 * Subscribes with a boolean snapshot, so it re-renders only when that flips.
 */
function useSectionStarted(section: string): boolean {
  const engine = useEngine();
  const mounted = useMounted();
  const started = useCallback(() => {
    if (engine.config.instant) return true;
    for (const layer of engine.layers.values()) {
      if (layer.section === section && layer.status !== "pending") return true;
    }
    return false;
  }, [engine, section]);
  const value = useSyncExternalStore(engine.subscribe, started, () => true);
  return !mounted || value;
}

type Props = {
  section: string;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

/**
 * Non-buildable chrome (borders, grids, dividers) that should stay invisible
 * until its section starts building, so the page really looks empty at first.
 */
export function Reveal({ section, as = "div", className, children }: Props) {
  const on = useSectionStarted(section);
  return createElement(
    as,
    {
      className,
      "data-reveal": "",
      style: { opacity: on ? 1 : 0, transition: "opacity 700ms ease" },
    },
    children,
  );
}
