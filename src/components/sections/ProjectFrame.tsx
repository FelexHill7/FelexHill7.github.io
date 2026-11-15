"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectImage, ResolvedProject } from "@/data/portfolio";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Screenshot frame for a project. Shows the project's images (manual override
 * or found in its GitHub repo) in a slider; otherwise renders a
 * deterministic mock product UI in the project's accent colour.
 */
export function ProjectFrame({ project }: { project: ResolvedProject }) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const images = project.images.filter((img) => !failed.has(img.src));
  const accent = project.accent ?? "#2f6bff";
  const seed = hash(project.slug);
  const bars = Array.from({ length: 14 }, (_, i) => 28 + ((seed >> (i * 2)) % 61));
  const host = project.links[0]?.href.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? project.slug;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
      {/* browser chrome */}
      <div className="flex h-9 items-center gap-2 border-b border-white/[0.07] bg-[#141416] px-3">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="ml-3 flex h-5 flex-1 items-center rounded-md bg-white/[0.05] px-2.5 font-mono text-[10px] text-white/40">
          {host}
        </span>
      </div>

      {images.length ? (
        <Gallery images={images} onError={(src) => setFailed((f) => new Set(f).add(src))} />
      ) : (
        <div className="relative aspect-[16/10] w-full overflow-hidden p-5">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-25 blur-3xl"
            style={{ background: accent }}
          />
          <div className="grid h-full grid-cols-[72px_1fr] gap-4">
            {/* sidebar */}
            <div className="flex flex-col gap-2 border-r border-white/[0.07] pr-4">
              <div className="mb-3 h-5 w-5 rounded-md" style={{ background: accent }} />
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-2 rounded-full bg-white/[0.08]" style={{ width: `${55 + ((seed >> i) % 40)}%` }} />
              ))}
            </div>
            {/* main */}
            <div className="flex min-h-0 flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{project.title}</div>
                <div className="flex gap-1.5">
                  <span className="h-4 w-12 rounded bg-white/[0.07]" />
                  <span className="h-4 w-8 rounded" style={{ background: accent }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {project.stack.slice(0, 3).map((s, i) => (
                  <div key={s} className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-2.5">
                    <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/35">{s}</div>
                    <div className="mt-1 text-[15px] font-semibold tracking-tight text-white/85">
                      {(((seed >> (i * 3)) % 90) + 10).toString().padStart(2, "0")}.{(seed >> (i + 5)) % 10}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex min-h-0 flex-1 items-end gap-[3px] rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: accent,
                      opacity: 0.25 + ((i % 4) * 0.2),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SLIDE_MS = 4500;
const SWIPE_PX = 40;

/** next/image can only optimise hosts allowed in next.config.ts; anything else is shown as-is. */
const OPTIMIZABLE =
  /^(\/(?!\/)|https:\/\/raw\.githubusercontent\.com\/FelexHill7\/|https:\/\/user-images\.githubusercontent\.com\/|https:\/\/github\.com\/user-attachments\/assets\/)[^?]*$/;

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return visible;
}

/**
 * Horizontal slider: auto-advances while on screen, with arrows, dots and swipe.
 * A clone of the first slide sits at the end so the loop always pans forward.
 */
function Gallery({ images, onError }: { images: ProjectImage[]; onError: (src: string) => void }) {
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame);
  const pageVisible = usePageVisible();
  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0); // 0..count, where count is the clone of slide 0
  const [animate, setAnimate] = useState(true);
  const swipeX = useRef<number | null>(null);
  const count = images.length;
  const multi = count > 1;
  const slides = multi ? [...images, images[0]] : images;
  const current = index % count;

  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const go = useCallback(
    (dir: 1 | -1) => {
      const i = indexRef.current;
      if (dir === 1) {
        setAnimate(true);
        setIndex(Math.min(i + 1, count));
      } else if (i === 0) {
        // jump to the clone without animating, then pan back one slide
        setAnimate(false);
        setIndex(count);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setAnimate(true);
            setIndex(count - 1);
          }),
        );
      } else {
        setAnimate(true);
        setIndex(i - 1);
      }
    },
    [count],
  );

  // after panning onto the clone, snap back to the real first slide
  const onTransitionEnd = () => {
    if (index === count) {
      setAnimate(false);
      setIndex(0);
    }
  };

  // auto-advance only while visible on screen, tab active and not hovered;
  // the timer restarts after every manual move
  useEffect(() => {
    if (!multi || !inView || !pageVisible || hovered) return;
    const t = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [multi, inView, pageVisible, hovered, index, go]);

  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  return (
    <div
      ref={frame}
      className="group/gallery relative aspect-[16/10] w-full touch-pan-y overflow-hidden bg-[#0e0e10]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => (swipeX.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipeX.current === null || !multi) return;
        const dx = e.clientX - swipeX.current;
        swipeX.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
      }}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translate3d(${-index * 100}%,0,0)`,
          transition: animate ? "transform 700ms cubic-bezier(0.65, 0, 0.35, 1)" : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {slides.map((img, i) => {
          const optimize = OPTIMIZABLE.test(img.src);
          return (
            <div key={`${img.src}-${i}`} className="relative h-full w-full shrink-0 overflow-hidden" aria-hidden={i % count !== current}>
              {/* blurred backdrop from a 64px thumbnail, blurred at quarter size then scaled up */}
              <div className="absolute left-0 top-0 h-1/4 w-1/4 origin-top-left scale-[4.4] opacity-30 blur-md">
                <Image src={img.src} alt="" fill sizes="64px" quality={60} unoptimized={!optimize} className="object-cover" />
              </div>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 1024px) 760px, 100vw"
                quality={75}
                unoptimized={!optimize}
                draggable={false}
                onError={() => onError(img.src)}
                className="select-none object-contain p-3"
              />
            </div>
          );
        })}
      </div>

      {multi && (
        <>
          <GalleryArrow dir={-1} onClick={() => go(-1)} />
          <GalleryArrow dir={1} onClick={() => go(1)} />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1.5 backdrop-blur">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Show image ${i + 1} of ${count}`}
                onClick={() => {
                  setAnimate(true);
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] tabular-nums text-white/70 backdrop-blur">
            {current + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}

function GalleryArrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next image" : "Previous image"}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className={`absolute top-1/2 ${dir === 1 ? "right-3" : "left-3"} flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white opacity-0 backdrop-blur transition hover:bg-black/75 focus-visible:opacity-100 group-hover/gallery:opacity-100 [@media(hover:none)]:opacity-100`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}
