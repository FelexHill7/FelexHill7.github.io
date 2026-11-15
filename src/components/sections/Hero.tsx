"use client";

import dynamic from "next/dynamic";
import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { ObjectBoundary } from "@/components/three/ObjectBoundary";
import { hero } from "@/data/portfolio";

const HeroObject = dynamic(() => import("@/components/three/HeroObject"), {
  ssr: false,
  loading: () => null,
});

const S = "hero";

type HeroProps = {
  /** Intro copy with live tokens already filled in. */
  intro: string;
  /** Stats with auto values already resolved. */
  stats: { label: string; value: string }[];
};

export function Hero({ intro, stats }: HeroProps) {
  return (
    <BuildSection
      id={S}
      index={0}
      as="section"
      className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col px-6 pt-28 lg:px-10 lg:pt-36"
    >
      <Reveal section={S} className="spec-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ---------- copy ---------- */}
        <div className="lg:col-span-7">
          <div className="mb-8 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-orange">
            <Buildable
              id="hero-dot"
              kind="box"
              section={S}
              order={7}
              duration={320}
              as="span"
              className="block h-1.5 w-1.5 rounded-full bg-green shadow-[0_0_10px_1px_rgba(34,211,127,0.7)]"
            />
            <Buildable id="hero-eyebrow" kind="text" glitch section={S} order={8} as="span" className="block">
              {hero.eyebrow}
            </Buildable>
          </div>

          <h1 className="text-[clamp(52px,7.6vw,118px)] font-bold leading-[0.92] tracking-[-0.045em]">
            <Buildable id="hero-h1a" kind="text" section={S} order={9} as="span" className="block text-white">
              {hero.headline[0]}
            </Buildable>
            <Buildable id="hero-h1b" kind="text" section={S} order={10} as="span" className="block text-white/40">
              {hero.headline[1]}
            </Buildable>
          </h1>

          <Buildable
            id="hero-intro"
            kind="text"
            section={S}
            order={11}
            as="p"
            className="mt-8 block max-w-[560px] text-[17px] leading-[1.6] text-white/60"
          >
            {intro}
          </Buildable>

          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Buildable
              id="hero-cta-primary"
              kind="box"
              section={S}
              order={12}
              as="a"
              href={hero.primaryCta.href}
              className="inline-flex h-12 items-center rounded-md bg-white px-6 text-[14px] font-semibold text-black transition-colors hover:bg-white/90"
            >
              {hero.primaryCta.label}
            </Buildable>
            <Buildable
              id="hero-cta-secondary"
              kind="box"
              section={S}
              order={13}
              as="a"
              href={hero.secondaryCta.href}
              className="group inline-flex h-12 items-center gap-2 text-[14px] font-medium text-white/80 transition-colors hover:text-white"
            >
              {hero.secondaryCta.label}
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Buildable>
          </div>
        </div>

        {/* ---------- 3D object ---------- */}
        <div className="lg:col-span-5">
          <Buildable
            id="hero-object"
            kind="image"
            section={S}
            order={14}
            as="div"
            className="relative ml-auto aspect-square w-full max-w-[520px]"
          >
            <ObjectBoundary>
              <HeroObject />
            </ObjectBoundary>
          </Buildable>
        </div>
      </div>

      {/* ---------- stats ---------- */}
      <Reveal
        section={S}
        className="mt-16 grid grid-cols-2 gap-y-10 border-t border-white/10 pb-12 pt-7 md:grid-cols-4 lg:mt-20"
      >
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex flex-col gap-3">
            <Buildable
              id={`hero-stat-label-${i}`}
              kind="text"
              section={S}
              order={15 + i * 2}
              as="span"
              className="block font-mono text-[10px] uppercase tracking-[0.24em] text-white/40"
            >
              {stat.label}
            </Buildable>
            <Buildable
              id={`hero-stat-value-${i}`}
              kind="text"
              section={S}
              order={16 + i * 2}
              as="span"
              className="block text-[44px] font-semibold leading-none tracking-[-0.03em] text-white lg:text-[52px]"
            >
              {stat.value}
            </Buildable>
          </div>
        ))}
      </Reveal>
    </BuildSection>
  );
}
