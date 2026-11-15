"use client";

import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { contact, links } from "@/data/portfolio";

const S = "contact";

export function Contact() {
  return (
    <BuildSection
      id={S}
      index={4}
      className="mx-auto max-w-[1400px] scroll-mt-20 px-6 py-28 lg:px-10 lg:py-44"
    >
      <Reveal section={S} className="mb-20 h-px w-full bg-white/[0.08] lg:mb-28" />

      <Buildable
        id={`${S}-eyebrow`}
        kind="text"
        glitch
        section={S}
        order={0}
        as="p"
        className="block font-mono text-[11px] uppercase tracking-[0.22em] text-orange"
      >
        {contact.eyebrow}
      </Buildable>

      <Buildable
        id={`${S}-headline`}
        kind="text"
        section={S}
        order={1}
        as="h2"
        className="mt-6 block max-w-[900px] text-[clamp(44px,6.4vw,96px)] font-bold leading-[0.95] tracking-[-0.045em]"
      >
        {contact.headline}
      </Buildable>

      <Buildable
        id={`${S}-subline`}
        kind="text"
        section={S}
        order={2}
        as="p"
        className="mt-8 block max-w-[560px] text-[17px] leading-[1.6] text-white/60"
      >
        {contact.subline}
      </Buildable>

      <Buildable
        id={`${S}-email`}
        kind="box"
        section={S}
        order={3}
        as="a"
        href={`mailto:${links.email}`}
        className="group mt-12 flex h-[76px] w-full max-w-[760px] items-center justify-between rounded-2xl bg-white pl-6 pr-3 text-black transition-colors hover:bg-white/90 sm:h-[88px] sm:pl-8"
      >
        <span className="flex min-w-0 flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-black/50">{contact.emailCta}</span>
          <span className="truncate text-[18px] font-semibold tracking-tight sm:text-[24px]">{links.email}</span>
        </span>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-transform group-hover:translate-x-1 sm:h-14 sm:w-14">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </Buildable>

      <Buildable
        id={`${S}-github`}
        kind="chip"
        section={S}
        order={4}
        as="a"
        href={links.github}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
      >
        {contact.githubCta} ↗
      </Buildable>
    </BuildSection>
  );
}
