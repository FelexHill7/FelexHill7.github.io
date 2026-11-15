"use client";

import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { work, type ResolvedProject } from "@/data/portfolio";
import { SectionHeader } from "./SectionHeader";
import { ProjectFrame } from "./ProjectFrame";

const S = "work";

export function Work({ projects }: { projects: ResolvedProject[] }) {
  return (
    <BuildSection
      id={S}
      index={1}
      className="mx-auto max-w-[1400px] scroll-mt-20 px-6 pb-20 pt-28 lg:px-10 lg:pb-32 lg:pt-40"
    >
      <SectionHeader section={S} eyebrow={work.eyebrow} headline={work.headline} />
      <div className="mt-20 flex flex-col gap-28 lg:mt-28 lg:gap-40">
        {projects.map((p, i) => (
          <ProjectBlock key={p.slug} project={p} index={i} base={10 + i * 20} />
        ))}
      </div>
    </BuildSection>
  );
}

function ProjectBlock({ project: p, index, base }: { project: ResolvedProject; index: number; base: number }) {
  const num = String(index + 1).padStart(2, "0");
  const flip = index % 2 === 1;
  return (
    <article id={p.slug} className="scroll-mt-24">
      <Reveal section={S} className="mb-10 h-px w-full bg-white/[0.08]" />
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
          <Buildable
            id={`${p.slug}-eyebrow`}
            kind="text"
            glitch
            section={S}
            order={base}
            as="p"
            className="block font-mono text-[11px] uppercase tracking-[0.22em] text-orange"
          >
            {`${num} — ${p.role} · ${p.year}`}
          </Buildable>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Buildable
              id={`${p.slug}-title`}
              kind="text"
              section={S}
              order={base + 1}
              as="h3"
              className="block text-[clamp(34px,3.6vw,52px)] font-bold leading-[1] tracking-[-0.035em]"
            >
              {p.title}
            </Buildable>
            {p.live && (
              <Buildable
                id={`${p.slug}-live`}
                kind="box"
                section={S}
                order={base + 2}
                duration={500}
                as="span"
                className="inline-flex h-6 items-center gap-1.5 rounded-full border border-green/30 bg-green/10 px-2.5 font-mono text-[10px] tracking-[0.18em] text-green"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_8px_1px_rgba(34,211,127,0.8)]" />
                LIVE
              </Buildable>
            )}
          </div>

          <Buildable
            id={`${p.slug}-oneliner`}
            kind="text"
            section={S}
            order={base + 3}
            as="p"
            className="mt-3 block text-[17px] text-white/80"
          >
            {p.oneLiner}
          </Buildable>

          <Buildable
            id={`${p.slug}-desc`}
            kind="text"
            section={S}
            order={base + 4}
            as="p"
            className="mt-5 block max-w-[520px] text-[15px] leading-[1.65] text-white/55"
          >
            {p.description}
          </Buildable>

          <div className="mt-7 flex flex-wrap gap-2">
            {p.stack.map((tech, k) => (
              <Buildable
                key={tech}
                id={`${p.slug}-stack-${k}`}
                kind="chip"
                section={S}
                order={base + 5 + k}
                as="span"
                className="inline-flex h-7 items-center rounded-md border border-white/10 px-2.5 font-mono text-[11px] text-white/65"
              >
                {tech}
              </Buildable>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            {p.links.map((l, k) => (
              <Buildable
                key={l.href + k}
                id={`${p.slug}-link-${k}`}
                kind="chip"
                section={S}
                order={base + 14 + k}
                as="a"
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                {l.label} ↗
              </Buildable>
            ))}
          </div>
        </div>

        <Buildable
          id={`${p.slug}-frame`}
          kind="image"
          section={S}
          order={base + 17}
          as="div"
          className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}
        >
          <ProjectFrame project={p} />
        </Buildable>
      </div>
    </article>
  );
}
