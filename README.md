# Felex Hill — portfolio

Personal portfolio where **the page builds itself**. A swarm of cursor "agents" claims each element, draws a design-tool selection box around it, types the text in or drags the box out, then flocks to the next section as you scroll.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and React Three Fiber. The site keeps itself current: stats come from GitHub and the calendar, and project images are pulled from each repo by a scheduled GitHub Actions job.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Only one Next.js dev server can run per project. If you see "Another next dev server is already running", stop the PID it prints.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run build:media` | Rescan GitHub repos for project images (needs `GITHUB_TOKEN`) |
| `npm run build:data` | Regenerate `data/repos.json` for the legacy site |

## Edit content

Hand-written copy lives in [`src/data/portfolio.ts`](src/data/portfolio.ts): hero, projects, experience, education, skills, contact, footer and links. Items marked `TODO` are placeholders.

The **More work** section, after Work, links your resume and GitHub. It also lists your most recently updated repos that aren't already featured, taken from the daily `data/repos.json` snapshot. Its copy and the number of repos shown are under `more` in the same file.

Some values update themselves, so you don't edit them by hand:

| Value | Source | Refreshed |
| --- | --- | --- |
| PROJECTS stat | Public, non-fork, non-archived repos on GitHub | Daily, on the server |
| YEAR stat | Years since `profile.programStart`, rolling over each anniversary | Daily |
| SINCE stat | Year the GitHub account was created | Daily |
| "third-year" in copy | Same as YEAR; write `{yearOrdinal}` or `{YearOrdinal}` in any text | Daily |
| Project images | Found in each project's repo by GitHub Actions | Daily |

The page uses `revalidate = 86400`, so Vercel re-renders it at most once a day. If GitHub can't be reached, the stats fall back to the last snapshot in `data/repos.json`.

## Project images

`scripts/build-project-media.js` scans every public repo and picks up to four images per repo, in this order:

1. Images referenced in the repo's README.
2. Image files in the repo, ranked by how screenshot-like the path is. Icons, badges, datasets and test fixtures are skipped.
3. Plots rendered inside Jupyter notebook outputs. These have no URL, so they are decoded and saved to `public/projects/auto/<repo>/`.

Results go to `data/project-media.json`. A project gets the images of the repo in its GitHub link, or of `repo` if you set it. Several images appear in a slider that auto-advances while on screen and has previous/next arrows, dots and swipe. Clicking an image opens it full screen, with a link to the file on GitHub (or to the repo, for notebook plots). A project with none shows a generated mock-up in its accent colour. Images are served through Next.js image optimization, which resizes them and converts them to WebP. To pin a specific screenshot, put it in `public/projects/` and set `image: "/projects/<file>.png"` on the project.

**Auto-added projects:** tag any repo with the GitHub topic `portfolio-project` and the next run appends it to the Work section. It uses the repo's description, top languages, topics and homepage, which becomes a Live link. Forks are never auto-added.

## GitHub Actions

`.github/workflows/deploy.yml` runs on every push to `main`, daily at 06:00 UTC, and on manual dispatch. It:

1. Regenerates `data/repos.json` for the legacy site.
2. Rescans repos for project images and auto projects.
3. Commits `data/` and `public/projects/auto/` if anything changed. That push triggers a Vercel redeploy of this site.
4. Publishes the legacy site to GitHub Pages.

## How the build animation works

| Piece | File | Role |
| --- | --- | --- |
| Engine | `src/lib/build/engine.ts` | Registry of layers and sections, build queue, Pause / Skip / Replay, elapsed clock |
| Swarm | `src/lib/build/swarm.ts` | Single-canvas renderer for cursors, selection boxes, dimension tags, guides and edit chips; assigns every agent a job |
| `<Buildable>` | `src/components/build/Buildable.tsx` | Wraps an element. Kinds: `text` types in, `box` / `image` get dragged out, `chip` gets a click and red edit flash |
| `<BuildSection>` | `src/components/build/BuildSection.tsx` | Arms a section when it scrolls into view |
| `<Reveal>` | `src/components/build/Reveal.tsx` | Non-buildable chrome, such as rules and grids, that appears with its section |
| HUD | `src/components/build/BuildHUD.tsx` | Bottom pill with agent count, layer progress and controls |

Every visible cursor has a job:

- **Builders.** One per element being built, up to 5 at once on desktop and 2 on mobile. Only elements that are on screen start building; anything below the fold waits until it is scrolled into view. Text gets an I-beam on the caret. Boxes get one cursor dragging the corner and one holding the anchor.
- **Claimers.** Each parks on the corner of an upcoming element and outlines where it will go. The cursor that claims an element is the one that builds it.
- **Spare agents** leave the screen while others are working. When nothing on screen needs building, all of them drift in faded flocks around a slow circle until there is work again.

Pacing lives at the top of `src/lib/build/engine.ts`: `SUMMARY_PACE` slows paragraph-length text and `PACE` slows everything else.

To add an element to the show:

```tsx
<Buildable id="unique-id" kind="text" section="about" order={12} as="p" className="...">
  Text that will be typed in
</Buildable>
```

`order` is the build order inside the section, and ids must be unique across the page. The animation always plays, and the HUD's Skip button is the opt-out. To honour `prefers-reduced-motion` instead, see the comment in `detectConfig()` in `engine.ts`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo. The Next.js preset needs no extra settings.
3. Optional: add a `GITHUB_TOKEN` environment variable, a fine-grained token with public read-only access. This avoids GitHub's rate limit on Vercel's shared IPs. Without it, stats fall back to the snapshot when the limit is hit.
4. Deploy. Every push to `main`, including the daily data commits, redeploys.

Or from the CLI:

```bash
npx vercel          # first deploy, follow the prompts
npx vercel --prod   # production
```

## Project structure

```text
src/app/                 layout, page (server: live stats, project merge), global styles
src/components/build/    animation system: Buildable, BuildSection, Reveal, AgentSwarm, HUD, intro
src/components/sections/ Hero, Work, Experience, About, Contact, Footer, project frame
src/components/three/    3D hero object and its WebGL fallback
src/data/portfolio.ts    all hand-written content
src/lib/build/           engine and canvas swarm
src/lib/live.ts          auto-updating stats and copy tokens
src/lib/media.ts         joins projects with repo images and auto projects
scripts/                 data builders run by GitHub Actions
data/                    generated JSON (committed by the workflow)
public/projects/auto/    notebook plots extracted by the workflow
legacy/                  previous vanilla HTML/JS site, still published to GitHub Pages
```

## Legacy site

The previous vanilla HTML/JS site lives in [`legacy/`](legacy/). The workflow still publishes it to GitHub Pages, together with `data/repos.json`. Once the Vercel deployment is live, you can point your domain at it and drop the Pages steps from the workflow.
