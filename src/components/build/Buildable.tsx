"use client";

import {
  createElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useEngine } from "@/lib/build/BuildProvider";
import type { LayerKind } from "@/lib/build/engine";
import { TYPE_START } from "@/lib/build/swarm";

const SCRAMBLE = "█▓▒░#%&@/\\<>|{}[]0123456789ABCDEFXYZ";
/** Typing scramble skips block glyphs, which read as big dotted squares at headline size. */
const TYPE_SCRAMBLE = "#%&@/<>{}[]=+*0123456789ABCDEFXYZ";

type BuildableProps = {
  /** Unique across the page. */
  id: string;
  /** Section id this layer belongs to (see <BuildSection>). */
  section: string;
  /** Build order inside the section. */
  order: number;
  /** text: types in · box/image: placeholder then fade · chip: red edit flash. */
  kind?: LayerKind;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Red scrambled overlay text while typing (eyebrow labels). */
  glitch?: boolean;
  /** Force a duration in ms. */
  duration?: number;
  href?: string;
  target?: string;
  rel?: string;
} & Omit<HTMLAttributes<HTMLElement>, "id" | "children" | "style" | "className">;

function childrenToString(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (Array.isArray(children)) return children.map(childrenToString).join("");
  return String(children);
}

function scrambled(len: number, seed: number): string {
  let s = "";
  let x = seed * 9301 + 49297;
  for (let i = 0; i < len; i++) {
    x = (x * 9301 + 49297) % 233280;
    s += i % 7 === 3 ? " " : SCRAMBLE[x % SCRAMBLE.length];
  }
  return s;
}

export function Buildable({
  id,
  section,
  order,
  kind = "text",
  as = "span",
  className,
  style,
  children,
  glitch,
  duration,
  ...rest
}: BuildableProps) {
  const engine = useEngine();
  const ref = useRef<HTMLElement | null>(null);
  const text = kind === "text" ? childrenToString(children) : "";

  useLayoutEffect(() => {
    engine.register({
      id,
      kind,
      section,
      order,
      el: ref.current,
      chars: text.length,
      duration,
    });
    return () => engine.unregister(id);
  }, [engine, id, kind, section, order, text.length, duration]);

  // The engine notifies every frame while building; the snapshot only changes when
  // something visible does (a character typed, a fade step, a colour flip), so
  // React re-renders far less often.
  const subscribe = useCallback((cb: () => void) => engine.subscribeLayer(id, cb), [engine, id]);
  const getSnapshot = useCallback((): string => {
    const l = engine.layers.get(id);
    if (!l) return engine.config.instant ? "built:0" : "pending:0";
    if (l.status !== "building") return `${l.status}:0`;
    const p = l.progress;
    if (kind === "text") {
      const typeProgress = Math.max(0, (p - TYPE_START) / (1 - TYPE_START));
      return `building:${Math.floor(typeProgress * text.length)}`;
    }
    if (kind === "chip") return `building:${p < 0.75 ? 0 : 1}`;
    return `building:${p < 0.55 ? 0 : Math.round(Math.min(1, (p - 0.55) / 0.35) * 40) / 40}`;
  }, [engine, id, kind, text.length]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "built:0");
  const sep = snapshot.indexOf(":");
  const status = snapshot.slice(0, sep);
  /** typed characters (text), edit-done flag (chip) or content opacity (box / image) */
  const step = parseFloat(snapshot.slice(sep + 1));

  const base = {
    ref,
    "data-buildable": "",
    "data-status": status,
    ...rest,
  };

  /* ---------- pending: reserve space, stay invisible ---------- */
  if (status === "pending") {
    return createElement(
      as,
      { ...base, className, style: { ...style, visibility: "hidden" as const } },
      kind === "text" ? text : children,
    );
  }

  /* ---------- built ---------- */
  if (status === "built") {
    return createElement(as, { ...base, className, style }, kind === "text" ? text : children);
  }

  /* ---------- building ---------- */
  if (kind === "text") {
    const n = step;
    const typed = text.slice(0, n);
    let scramble = "";
    const end = Math.min(text.length, n + 2);
    for (let i = n; i < end; i++) {
      scramble +=
        text[i] === " " ? " " : TYPE_SCRAMBLE[(Math.random() * TYPE_SCRAMBLE.length) | 0];
    }
    const seed = n;
    return createElement(
      as,
      { ...base, className: cx(className, "relative"), style },
      <>
        <span className="invisible" aria-hidden>
          {text}
        </span>
        <span className="absolute inset-0" aria-hidden>
          {typed}
          <span className="text-accent/70">{scramble}</span>
          <span
            data-caret=""
            className="ml-px inline-block h-[0.85em] w-[2px] translate-y-[0.1em] bg-accent"
          />
        </span>
        {glitch && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 -translate-y-[90%] whitespace-nowrap font-mono text-[0.8em] tracking-[0.18em] text-danger/80"
            >
              {scrambled(Math.min(28, text.length), seed)}
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-[18%] top-full -translate-y-[10%] whitespace-nowrap font-mono text-[0.7em] tracking-[0.2em] text-danger/60"
            >
              {scrambled(Math.min(18, Math.floor(text.length * 0.6)), seed + 7)}
            </span>
          </>
        )}
      </>,
    );
  }

  if (kind === "chip") {
    return createElement(
      as,
      {
        ...base,
        className,
        style: { ...style, color: step === 0 ? "#ff6b6b" : undefined },
      },
      children,
    );
  }

  // box / image: content fades in behind the canvas placeholder once it is dragged out
  return createElement(
    as,
    { ...base, className, style: { ...style, opacity: step } },
    children,
  );
}

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}
