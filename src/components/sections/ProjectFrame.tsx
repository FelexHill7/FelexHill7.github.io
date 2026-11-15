"use client";

import { useEffect, useState } from "react";
import type { ProjectImage, ResolvedProject } from "@/data/portfolio";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Screenshot frame for a project. Shows the project's images (manual override
 * or found in its GitHub repo), crossfading between them; otherwise renders a
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

function Gallery({ images, onError }: { images: ProjectImage[]; onError: (src: string) => void }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const current = index % images.length;

  useEffect(() => {
    if (images.length < 2 || hovered) return;
    const t = window.setInterval(() => setIndex((i) => i + 1), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [images.length, hovered]);

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden bg-[#0e0e10]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {images.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {/* blurred copy fills the frame behind plots and odd aspect ratios */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            loading={i === 0 ? "eager" : "lazy"}
            onError={() => onError(img.src)}
            className="absolute inset-0 h-full w-full object-contain p-3"
          />
        </div>
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1.5 rounded-full bg-black/50 px-2 py-1.5 backdrop-blur">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
