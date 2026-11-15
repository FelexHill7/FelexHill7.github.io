"use client";

import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { experience, experienceSection } from "@/data/portfolio";
import { SectionHeader } from "./SectionHeader";

const S = "experience";

export function Experience() {
  return (
    <BuildSection
      id={S}
      index={3}
      className="mx-auto max-w-[1400px] scroll-mt-20 px-6 py-28 lg:px-10 lg:py-40"
    >
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeader section={S} eyebrow={experienceSection.eyebrow} headline={experienceSection.headline} />
        </div>

        <div className="relative lg:col-span-7">
          <Reveal section={S} className="absolute bottom-6 left-[7px] top-6 w-px bg-white/[0.08]" />
          <ol className="flex flex-col gap-6">
            {experience.map((job, i) => {
              const base = 10 + i * 20;
              const id = `${S}-${i}`;
              return (
                <li key={job.company} className="relative pl-10">
                  <Buildable
                    id={`${id}-dot`}
                    kind="box"
                    section={S}
                    order={base}
                    duration={350}
                    as="span"
                    className="absolute left-0 top-8 block h-[15px] w-[15px] rounded-full border-[3px] border-bg bg-accent shadow-[0_0_0_1px_rgba(47,107,255,0.6)]"
                  />
                  <Buildable
                    id={`${id}-card`}
                    kind="box"
                    section={S}
                    order={base + 1}
                    as="div"
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-6 lg:p-7"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <Buildable
                        id={`${id}-role`}
                        kind="text"
                        section={S}
                        order={base + 2}
                        as="h3"
                        className="block text-[22px] font-semibold tracking-tight"
                      >
                        {job.role}
                      </Buildable>
                      <Buildable
                        id={`${id}-period`}
                        kind="text"
                        section={S}
                        order={base + 3}
                        as="span"
                        className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45"
                      >
                        {job.location ? `${job.period} · ${job.location}` : job.period}
                      </Buildable>
                    </div>
                    <Buildable
                      id={`${id}-company`}
                      kind="text"
                      section={S}
                      order={base + 4}
                      as="p"
                      className="mt-1 block text-[15px] text-orange"
                    >
                      {job.company}
                    </Buildable>
                    {job.stack && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {job.stack.map((tech, k) => (
                          <Buildable
                            key={tech}
                            id={`${id}-s${k}`}
                            kind="chip"
                            section={S}
                            order={base + 10 + k * 0.1}
                            as="span"
                            className="inline-flex h-6 items-center rounded border border-white/10 px-2 font-mono text-[10.5px] text-white/55"
                          >
                            {tech}
                          </Buildable>
                        ))}
                      </div>
                    )}
                    <ul className="mt-5 flex flex-col gap-2.5">
                      {job.bullets.map((b, k) => (
                        <li key={k} className="flex gap-3 text-[15px] leading-[1.6] text-white/60">
                          <span className="mt-[11px] h-px w-3 shrink-0 bg-white/30" />
                          <Buildable id={`${id}-b${k}`} kind="text" section={S} order={base + 5 + k} as="span" className="block">
                            {b}
                          </Buildable>
                        </li>
                      ))}
                    </ul>
                  </Buildable>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </BuildSection>
  );
}
