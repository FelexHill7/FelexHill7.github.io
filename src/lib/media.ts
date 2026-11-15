/**
 * Joins the hand-written projects in src/data/portfolio.ts with the data that
 * GitHub Actions generates daily in data/project-media.json:
 *   - images found in each project's repo
 *   - repos tagged with the `portfolio-project` topic, appended as extra projects
 */

import mediaData from "../../data/project-media.json";
import { profile, projects, type ProjectImage, type ResolvedProject } from "@/data/portfolio";

type AutoProject = {
  repo: string;
  title: string;
  description: string;
  stack: string[];
  links: { label: string; href: string }[];
  live: boolean;
  year: string;
};

type MediaFile = {
  media: Record<string, { images: (ProjectImage & { source: string })[] }>;
  autoProjects: AutoProject[];
};

const data = mediaData as MediaFile;
const ACCENTS = ["#2f6bff", "#ff7a1a", "#a764ff", "#22d37f", "#ff4fa3", "#3ad7ff", "#ffd23f"];

const repoUrl = new RegExp(`^https://github\\.com/${profile.githubUser}/([^/#?]+)/?$`, "i");

function repoOf(p: { repo?: string; links: { href: string }[] }): string | undefined {
  if (p.repo) return p.repo;
  for (const l of p.links) {
    const m = repoUrl.exec(l.href);
    if (m) return m[1];
  }
  return undefined;
}

function imagesFor(repo: string | undefined): ProjectImage[] {
  if (!repo) return [];
  const entry = Object.entries(data.media).find(([name]) => name.toLowerCase() === repo.toLowerCase());
  return entry ? entry[1].images.map(({ src, alt }) => ({ src, alt })) : [];
}

function firstSentence(text: string): string {
  const s = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return s.length > 90 ? `${s.slice(0, 87).trimEnd()}…` : s;
}

export function getProjects(): ResolvedProject[] {
  const manual: ResolvedProject[] = projects.map((p) => ({
    ...p,
    images: p.image ? [{ src: p.image, alt: `${p.title} screenshot` }] : imagesFor(repoOf(p)),
  }));

  const used = new Set(manual.map((p) => repoOf(p)?.toLowerCase()).filter(Boolean));
  const auto: ResolvedProject[] = data.autoProjects
    .filter((a) => !used.has(a.repo.toLowerCase()))
    .map((a, i) => ({
      slug: a.repo.toLowerCase(),
      title: a.title,
      role: "Open source",
      year: a.year,
      oneLiner: firstSentence(a.description),
      description: a.description,
      stack: a.stack,
      links: a.links,
      live: a.live,
      repo: a.repo,
      accent: ACCENTS[(manual.length + i) % ACCENTS.length],
      images: imagesFor(a.repo),
    }));

  return [...manual, ...auto];
}
