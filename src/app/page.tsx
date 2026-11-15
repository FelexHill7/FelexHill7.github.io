import { BuildProvider } from "@/lib/build/BuildProvider";
import { AgentSwarm } from "@/components/build/AgentSwarm";
import { BuildHUD } from "@/components/build/BuildHUD";
import { IntroOverlay } from "@/components/build/IntroOverlay";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { MoreWork } from "@/components/sections/MoreWork";
import { Experience } from "@/components/sections/Experience";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { about, education, hero, more } from "@/data/portfolio";
import { fill, getLiveStats, resolveStats } from "@/lib/live";
import { getOtherWorks, getProjects } from "@/lib/media";

// Re-render at most once a day so project count, year of study, etc. stay current.
export const revalidate = 86400;

export default async function Page() {
  const live = await getLiveStats();

  return (
    <BuildProvider>
      <IntroOverlay />
      <Nav />
      <main>
        <Hero intro={fill(hero.intro, live)} stats={resolveStats(live)} />
        <Work projects={getProjects()} />
        <MoreWork repoCount={live.projects} others={getOtherWorks(more.recentCount)} />
        <Experience />
        <About
          body={about.body.map((p) => fill(p, live))}
          education={education.map((e) => ({ ...e, detail: fill(e.detail, live) }))}
        />
        <Contact />
      </main>
      <Footer />
      <AgentSwarm />
      <BuildHUD />
    </BuildProvider>
  );
}
