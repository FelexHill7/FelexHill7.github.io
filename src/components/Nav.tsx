"use client";

import { Buildable } from "@/components/build/Buildable";
import { Reveal } from "@/components/build/Reveal";
import { links, nav, site } from "@/data/portfolio";

export function Nav() {
  return (
    <Reveal
      section="hero"
      as="header"
      className="fixed inset-x-0 top-0 z-20 border-b border-white/[0.06] bg-bg/70 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <a href="#" className="flex items-center gap-2.5">
          <Buildable
            id="nav-logo"
            kind="box"
            section="hero"
            order={0}
            duration={600}
            as="span"
            className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white"
          >
            <span className="h-2 w-2 rounded-[2px] bg-accent" />
          </Buildable>
          <Buildable
            id="nav-name"
            kind="text"
            section="hero"
            order={1}
            as="span"
            className="block text-[15px] font-semibold tracking-tight"
          >
            {site.name}
          </Buildable>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item, i) => (
            <Buildable
              key={item.href}
              id={`nav-link-${i}`}
              kind="chip"
              section="hero"
              order={2 + i}
              as="a"
              href={item.href}
              {...(item.href.startsWith("#") ? {} : { target: "_blank", rel: "noreferrer" })}
              className="text-[13px] text-white/65 transition-colors hover:text-white"
            >
              {item.label}
            </Buildable>
          ))}
        </nav>

        <Buildable
          id="nav-github"
          kind="box"
          section="hero"
          order={6}
          as="a"
          href={links.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-2 rounded-full border border-white/15 px-3.5 text-[12px] font-medium transition-colors hover:bg-white hover:text-black"
        >
          <GitHubMark className="h-3.5 w-3.5" />
          GitHub
        </Buildable>
      </div>
    </Reveal>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
