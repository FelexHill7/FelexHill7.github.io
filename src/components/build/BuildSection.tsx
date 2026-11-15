"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { useEngine } from "@/lib/build/BuildProvider";

type Props = {
  /** Section id, referenced by every <Buildable section="..."> inside. */
  id: string;
  /** Page order. Index 0 (hero) is armed immediately; others arm on scroll. */
  index: number;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

/**
 * Registers a section with the engine and arms it when it enters the viewport.
 * Already-built sections stay built; the arm is one-way until Replay.
 */
export function BuildSection({ id, index, as = "section", className, children }: Props) {
  const engine = useEngine();
  const ref = useRef<HTMLElement | null>(null);
  const visible = useRef(false);

  useLayoutEffect(() => {
    engine.registerSection(id, index);
  }, [engine, id, index]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) engine.arm(id);
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [engine, id]);

  // After Replay the observer won't re-fire for a section that stayed in view.
  useEffect(() => {
    let lastReplay = engine.replayCount;
    return engine.subscribe(() => {
      if (engine.replayCount === lastReplay) return;
      lastReplay = engine.replayCount;
      window.setTimeout(() => {
        if (visible.current) engine.arm(id);
      }, 800);
    });
  }, [engine, id]);

  return createElement(as, { ref, id, className, "data-section": id }, children);
}
