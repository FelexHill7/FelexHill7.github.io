/**
 * Live values for the site, computed on the server. The page re-renders at
 * most once a day (see `revalidate` in app/page.tsx), so these stay current
 * without redeploying.
 *
 * - projects: public, non-fork repos on GitHub
 * - since:    the year the GitHub account was created
 * - year:     year of study, from profile.programStart
 *
 * GitHub is called unauthenticated unless GITHUB_TOKEN is set (recommended on
 * Vercel to avoid the shared-IP rate limit). If GitHub fails, values fall back
 * to the last snapshot in data/repos.json, then to static defaults.
 */

import reposSnapshot from "../../data/repos.json";
import { hero, profile, type Stat } from "@/data/portfolio";

export type LiveStats = {
  projects: number;
  since: number;
  year: number;
  yearOrdinal: string;
};

const DAY = 60 * 60 * 24;
const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"];

type Repo = { fork?: boolean; archived?: boolean; created_at?: string };

function github<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-site",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers, next: { revalidate: DAY } }).then((res) => {
    if (!res.ok) throw new Error(`GitHub ${path} → ${res.status}`);
    return res.json() as Promise<T>;
  });
}

function yearOfStudy(start: string, years: number, now = new Date()): number {
  const s = new Date(`${start}T00:00:00`);
  let elapsed = now.getFullYear() - s.getFullYear();
  const beforeAnniversary =
    now.getMonth() < s.getMonth() || (now.getMonth() === s.getMonth() && now.getDate() < s.getDate());
  if (beforeAnniversary) elapsed -= 1;
  return Math.min(years, Math.max(1, elapsed + 1));
}

export async function getLiveStats(): Promise<LiveStats> {
  const year = yearOfStudy(profile.programStart, profile.programYears);
  const user = profile.githubUser;

  const snapshotRepos = (reposSnapshot as { repos?: Repo[] }).repos ?? [];
  let projects = snapshotRepos.filter((r) => !r.fork).length;
  let since = new Date(profile.programStart).getFullYear();

  const [repos, account] = await Promise.allSettled([
    github<Repo[]>(`/users/${user}/repos?per_page=100&type=owner`),
    github<{ created_at?: string }>(`/users/${user}`),
  ]);
  if (repos.status === "fulfilled" && Array.isArray(repos.value)) {
    projects = repos.value.filter((r) => !r.fork && !r.archived).length;
  }
  if (account.status === "fulfilled" && account.value.created_at) {
    since = new Date(account.value.created_at).getFullYear();
  }

  return { projects, since, year, yearOrdinal: ORDINALS[year - 1] ?? `${year}th` };
}

/** Replace {yearOrdinal} / {YearOrdinal} tokens in copy. */
export function fill(text: string, live: LiveStats): string {
  const o = live.yearOrdinal;
  return text
    .replaceAll("{yearOrdinal}", o)
    .replaceAll("{YearOrdinal}", o.charAt(0).toUpperCase() + o.slice(1));
}

/** Hero stats with auto values resolved to display strings. */
export function resolveStats(live: LiveStats, stats: Stat[] = hero.stats): { label: string; value: string }[] {
  return stats.map((s) => {
    switch (s.auto) {
      case "projects":
        return { label: s.label, value: String(live.projects).padStart(2, "0") };
      case "year":
        return { label: s.label, value: String(live.year) };
      case "since":
        return { label: s.label, value: String(live.since) };
      default:
        return { label: s.label, value: s.value ?? "" };
    }
  });
}
