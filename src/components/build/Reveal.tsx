"use client";

import { createElement, type ElementType, type ReactNode } from "react";
import { useEngine, useEngineVersion, useMounted } from "@/lib/build/BuildProvider";

/** True once any layer in `section` has started building (or always, in instant mode). */
function useSectionStarted(section: string): boolean {
  const engine = useEngine();
  useEngineVersion();
  const mounted = useMounted();
  if (!mounted || engine.config.instant) return true;
  for (const layer of engine.layers.values()) {
    if (layer.section === section && layer.status !== "pending") return true;
  }
  return false;
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
