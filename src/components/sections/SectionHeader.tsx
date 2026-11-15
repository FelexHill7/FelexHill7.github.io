"use client";

import { Buildable } from "@/components/build/Buildable";

type Props = {
  section: string;
  eyebrow: string;
  headline: [string, string] | string[];
  /** Orders used: base, base+1, base+2 */
  base?: number;
  className?: string;
};

/** Orange bracketed eyebrow + two-tone headline, shared by every section. */
export function SectionHeader({ section, eyebrow, headline, base = 0, className }: Props) {
  return (
    <div className={className}>
      <Buildable
        id={`${section}-eyebrow`}
        kind="text"
        glitch
        section={section}
        order={base}
        as="p"
        className="block font-mono text-[11px] uppercase tracking-[0.22em] text-orange"
      >
        {eyebrow}
      </Buildable>
      <h2 className="mt-6 text-[clamp(40px,5.4vw,78px)] font-bold leading-[0.95] tracking-[-0.04em]">
        <Buildable id={`${section}-h2a`} kind="text" section={section} order={base + 1} as="span" className="block text-white">
          {headline[0]}
        </Buildable>
        <Buildable id={`${section}-h2b`} kind="text" section={section} order={base + 2} as="span" className="block text-white/40">
          {headline[1]}
        </Buildable>
      </h2>
    </div>
  );
}
