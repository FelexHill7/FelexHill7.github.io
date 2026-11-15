"use client";

import { Buildable } from "@/components/build/Buildable";
import { BuildSection } from "@/components/build/BuildSection";
import { Reveal } from "@/components/build/Reveal";
import { footer, site } from "@/data/portfolio";

const S = "footer";

export function Footer() {
  return (
    <BuildSection id={S} index={6} as="footer" className="mx-auto max-w-[1400px] px-6 pb-28 pt-10 lg:px-10 lg:pb-32">
      <Reveal section={S} className="mb-12 h-px w-full bg-white/[0.08]" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:gap-x-14">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <Buildable
              id={`${S}-logo`}
              kind="box"
              section={S}
              order={0}
              duration={450}
              as="span"
              className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white"
            >
              <span className="h-2 w-2 rounded-[2px] bg-accent" />
            </Buildable>
            <Buildable id={`${S}-name`} kind="text" section={S} order={1} as="span" className="block text-[15px] font-semibold tracking-tight">
              {site.name}
            </Buildable>
          </div>
          <Buildable id={`${S}-bio`} kind="text" section={S} order={2} as="p" className="mt-5 block max-w-[280px] text-[14px] leading-[1.6] text-white/55">
            {footer.bio}
          </Buildable>
        </div>

        {footer.columns.map((col, c) => {
          const base = 10 + c * 10;
          return (
            <div key={col.title}>
              <Buildable
                id={`${S}-col-${c}`}
                kind="text"
                section={S}
                order={base}
                as="h3"
                className="block font-mono text-[11px] uppercase tracking-[0.22em] text-white/45"
              >
                {col.title}
              </Buildable>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l, k) => (
                  <li key={l.label + k}>
                    <Buildable
                      id={`${S}-col-${c}-${k}`}
                      kind="chip"
                      section={S}
                      order={base + 1 + k}
                      as="a"
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                      className="text-[14px] text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Buildable>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-16 flex flex-col gap-3 border-t border-white/[0.08] pt-6 font-mono text-[11px] text-white/40 md:flex-row md:items-center md:justify-between">
        <Buildable id={`${S}-copy`} kind="text" section={S} order={50} as="span" className="block">
          {footer.copyright}
        </Buildable>
        <Buildable id={`${S}-loc`} kind="text" section={S} order={51} as="span" className="block uppercase tracking-[0.18em]">
          {site.location}
        </Buildable>
      </div>
    </BuildSection>
  );
}
