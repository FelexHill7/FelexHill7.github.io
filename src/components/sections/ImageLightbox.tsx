"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectImage } from "@/data/portfolio";
import { canOptimize, sourceLink } from "@/lib/images";

type Props = {
  images: ProjectImage[];
  index: number;
  title: string;
  /** Project's GitHub repo, used as the source link for notebook plots. */
  repoUrl?: string;
  onIndex: (i: number) => void;
  onClose: () => void;
};

/**
 * Full-screen viewer for a project image: large and centred over a dimmed page,
 * with previous/next, a link to the image on GitHub, Esc / outside click to close.
 */
export function ImageLightbox({ images, index, title, repoUrl, onIndex, onClose }: Props) {
  const [shown, setShown] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const img = images[index];
  const source = sourceLink(img.src, repoUrl);

  const step = useCallback((dir: 1 | -1) => onIndex((index + dir + count) % count), [index, count, onIndex]);

  // fade in, lock page scroll, focus the close button, restore focus on close
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => setShown(true));
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) step(1);
      else if (e.key === "ArrowLeft" && count > 1) step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, step, onClose]);

  /** Close when the click lands in the letterbox around the picture, not on the picture itself. */
  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (!el.naturalWidth) return;
    const r = el.getBoundingClientRect();
    const s = Math.min(r.width / el.naturalWidth, r.height / el.naturalHeight);
    const w = el.naturalWidth * s;
    const h = el.naturalHeight * s;
    const x0 = r.left + (r.width - w) / 2;
    const y0 = r.top + (r.height - h) / 2;
    const inside = e.clientX >= x0 && e.clientX <= x0 + w && e.clientY >= y0 && e.clientY <= y0 + h;
    if (!inside) onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image ${index + 1} of ${count}`}
      className="fixed inset-0 z-[80] flex flex-col bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: shown ? 1 : 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="min-w-0 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
          <span className="text-white">{title}</span>
          {count > 1 && <span className="ml-3 tabular-nums">{index + 1} / {count}</span>}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition-colors hover:bg-white/90"
          >
            {source.label} ↗
          </a>
          <button
            ref={closeBtn}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="relative mx-3 flex-1 transition-transform duration-300 sm:mx-20"
        style={{ transform: shown ? "scale(1)" : "scale(0.97)" }}
      >
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          sizes="100vw"
          quality={75}
          unoptimized={!canOptimize(img.src)}
          onClick={onImageClick}
          className="object-contain"
        />
      </div>

      <p className="px-5 py-4 text-center text-[13px] text-white/50 sm:px-8">{img.alt}</p>

      {count > 1 && (
        <>
          <LightboxArrow dir={-1} onClick={() => step(-1)} />
          <LightboxArrow dir={1} onClick={() => step(1)} />
        </>
      )}
    </div>,
    document.body,
  );
}

function LightboxArrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next image" : "Previous image"}
      onClick={onClick}
      className={`absolute top-1/2 ${dir === 1 ? "right-3 sm:right-6" : "left-3 sm:left-6"} flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={dir === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );
}
