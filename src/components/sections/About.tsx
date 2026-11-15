"use client";

import Image from "next/image";
import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { about, type education as educationData } from "@/data/portfolio";
import { SectionHeader } from "./SectionHeader";

const S = "about";

type AboutProps = {
  /** About paragraphs with live tokens filled in. */
  body: string[];
  education: typeof educationData;
};

export function About({ body, education }: AboutProps) {
  return (
    <BuildSection
      id={S}
      index={4}
      className="mx-auto max-w-[1400px] scroll-mt-20 px-6 py-28 lg:px-10 lg:py-40"
    >
      <Reveal section={S} className="mb-20 h-px w-full bg-white/[0.08] lg:mb-28" />

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeader section={S} eyebrow={about.eyebrow} headline={about.headline} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7 lg:pt-16">
          {body.map((para, i) => (
            <Buildable
              key={i}
              id={`${S}-body-${i}`}
              kind="text"
              section={S}
              order={3 + i}
              as="p"
              className="block text-[19px] leading-[1.6] text-white/70"
            >
              {para}
            </Buildable>
          ))}
        </div>
      </div>

      {/* education */}
      <div className="mt-24 grid grid-cols-1 gap-10 lg:mt-32 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Buildable
            id={`${S}-edu-eyebrow`}
            kind="text"
            glitch
            section={S}
            order={10}
            as="p"
            className="block font-mono text-[11px] uppercase tracking-[0.22em] text-orange"
          >
            {about.educationEyebrow}
          </Buildable>
        </div>
        <ol className="flex flex-col lg:col-span-7">
          {education.map((e, i) => {
            const base = 11 + i * 5;
            return (
              <li key={e.school} className="flex gap-5 border-t border-white/[0.08] py-7">
                <Buildable
                  id={`${S}-edu-${i}-logo`}
                  kind="box"
                  section={S}
                  order={base}
                  duration={600}
                  as="span"
                  className={`relative block h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-white/10 ${e.logoFill ? "" : "p-1"}`}
                >
                  <Image src={e.logo} alt={`${e.school} logo`} width={48} height={48} className="h-full w-full object-contain" />
                </Buildable>
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:gap-10">
                <div>
                  <Buildable id={`${S}-edu-${i}-school`} kind="text" section={S} order={base + 1} as="h3" className="block text-[20px] font-semibold tracking-tight">
                    {e.school}
                  </Buildable>
                  <Buildable id={`${S}-edu-${i}-degree`} kind="text" section={S} order={base + 2} as="p" className="mt-1 block text-[15px] text-white/75">
                    {e.degree}
                  </Buildable>
                  <Buildable id={`${S}-edu-${i}-detail`} kind="text" section={S} order={base + 4} as="p" className="mt-2 block text-[14px] leading-[1.6] text-white/50">
                    {e.detail}
                  </Buildable>
                </div>
                <Buildable
                  id={`${S}-edu-${i}-period`}
                  kind="text"
                  section={S}
                  order={base + 3}
                  as="span"
                  className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 md:pt-1.5"
                >
                  {e.period}
                </Buildable>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* skills */}
      <div className="mt-20 grid grid-cols-1 gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Buildable
            id={`${S}-skills-eyebrow`}
            kind="text"
            glitch
            section={S}
            order={30}
            as="p"
            className="block font-mono text-[11px] uppercase tracking-[0.22em] text-orange"
          >
            {about.skillsEyebrow}
          </Buildable>
        </div>
        <div className="flex flex-col gap-7 lg:col-span-7">
          {about.skills.map((group, g) => {
            const base = 31 + g * 10;
            return (
              <div key={group.group} className="grid grid-cols-1 gap-3 md:grid-cols-[140px_1fr] md:gap-8">
                <Buildable
                  id={`${S}-skill-${g}-label`}
                  kind="text"
                  section={S}
                  order={base}
                  as="span"
                  className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 md:pt-2"
                >
                  {group.group}
                </Buildable>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, k) => (
                    <Buildable
                      key={item}
                      id={`${S}-skill-${g}-${k}`}
                      kind="chip"
                      section={S}
                      order={base + 1 + k}
                      as="span"
                      className="inline-flex h-8 items-center rounded-md border border-white/10 px-3 font-mono text-[12px] text-white/70"
                    >
                      {item}
                    </Buildable>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BuildSection>
  );
}
