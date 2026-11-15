"use client";

import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { links, more } from "@/data/portfolio";
import type { OtherWork } from "@/lib/media";
import { SectionHeader } from "./SectionHeader";

const S = "more";

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  "Jupyter Notebook": "#DA5B0B",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  Go: "#00ADD8",
  Rust: "#dea584",
};

type Props = {
  repoCount: number;
  others: OtherWork[];
};

/** Resume + GitHub call-outs and a short list of other repos. */
export function MoreWork({ repoCount, others }: Props) {
  return (
    <BuildSection id={S} index={2} className="mx-auto max-w-[1400px] scroll-mt-20 px-6 pb-28 pt-8 lg:px-10 lg:pb-40">
      <Reveal section={S} className="mb-20 h-px w-full bg-white/[0.08] lg:mb-28" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <SectionHeader section={S} eyebrow={more.eyebrow} headline={more.headline} className="lg:col-span-6" />
        <Buildable
          id={`${S}-intro`}
          kind="text"
          section={S}
          order={3}
          as="p"
          className="block max-w-[520px] text-[17px] leading-[1.6] text-white/60 lg:col-span-5 lg:col-start-8 lg:self-end"
        >
          {more.intro}
        </Buildable>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-20">
        {/* ---------- resume ---------- */}
        <Buildable
          id={`${S}-resume`}
          kind="box"
          section={S}
          order={4}
          as="div"
          className="group relative flex flex-col justify-between gap-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20 sm:flex-row sm:items-end lg:p-9"
        >
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-orange">PDF</span>
            <h3 className="text-[32px] font-bold leading-none tracking-[-0.035em] lg:text-[40px]">{more.resume.title}</h3>
            <p className="max-w-[300px] text-[15px] leading-[1.6] text-white/55">{more.resume.body}</p>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <a
                href={links.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-[14px] font-semibold text-black transition-colors hover:bg-white/90"
              >
                {more.resume.open} ↗
              </a>
              <a
                href={links.resume}
                download
                className="text-[14px] font-medium text-white/75 underline-offset-4 hover:text-white hover:underline"
              >
                {more.resume.download}
              </a>
            </div>
          </div>
          <ResumeSheet />
        </Buildable>

        {/* ---------- github ---------- */}
        <Buildable
          id={`${S}-github`}
          kind="box"
          section={S}
          order={5}
          as="a"
          href={links.github}
          target="_blank"
          rel="noreferrer"
          className="group relative flex flex-col justify-between gap-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-white/20 lg:p-9"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-orange">OPEN SOURCE</span>
              <h3 className="text-[32px] font-bold leading-none tracking-[-0.035em] lg:text-[40px]">{more.github.title}</h3>
              <p className="max-w-[320px] text-[15px] leading-[1.6] text-white/55">
                {more.github.body}
              </p>
            </div>
            <span className="font-semibold leading-none tracking-[-0.04em] text-white text-[64px] tabular-nums lg:text-[84px]">
              {repoCount}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-[14px] font-medium text-white/85 group-hover:text-white">
            {more.github.cta}
            <span className="transition-transform group-hover:translate-x-0.5">↗</span>
          </span>
        </Buildable>
      </div>

      {/* ---------- other repos ---------- */}
      {others.length > 0 && (
        <div className="mt-16 lg:mt-20">
          <Buildable
            id={`${S}-recent-label`}
            kind="text"
            section={S}
            order={6}
            as="p"
            className="block font-mono text-[11px] uppercase tracking-[0.22em] text-white/45"
          >
            {more.recentLabel}
          </Buildable>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((r, i) => (
              <li key={r.name}>
                <Buildable
                  id={`${S}-repo-${i}`}
                  kind="box"
                  section={S}
                  order={7 + i}
                  duration={700}
                  as="a"
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col gap-3 rounded-xl border border-white/[0.08] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.02]"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono text-[13px] text-white/90">{r.name}</span>
                    <span className="text-white/40 transition-colors group-hover:text-white">↗</span>
                  </span>
                  <span className="line-clamp-2 text-[14px] leading-[1.55] text-white/50">{r.description}</span>
                  <span className="mt-auto flex items-center gap-4 font-mono text-[11px] text-white/40">
                    {r.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#8b8b94" }} />
                        {r.language}
                      </span>
                    )}
                    <span>Updated {r.updated}</span>
                  </span>
                </Buildable>
              </li>
            ))}
          </ul>
        </div>
      )}
    </BuildSection>
  );
}

/** Small stylised page standing in for a resume thumbnail. */
function ResumeSheet() {
  return (
    <div
      aria-hidden
      className="relative h-[180px] w-[140px] shrink-0 rotate-[4deg] rounded-md bg-[#f4f4f2] p-3.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:rotate-0 sm:h-[200px] sm:w-[155px]"
    >
      <div className="h-2.5 w-20 rounded-sm bg-black/80" />
      <div className="mt-1.5 h-1 w-24 rounded-sm bg-black/30" />
      {[0, 1, 2].map((b) => (
        <div key={b} className="mt-3.5">
          <div className="h-1.5 w-12 rounded-sm bg-[#2f6bff]" />
          {[0, 1, 2].map((l) => (
            <div key={l} className="mt-1.5 h-1 rounded-sm bg-black/15" style={{ width: `${92 - ((b + l) % 3) * 14}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
