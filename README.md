# FelexHill7.github.io

Personal portfolio website built with vanilla HTML, CSS, and JavaScript. Live at **[felexhill7.github.io](https://felexhill7.github.io/)**.

## Features

- **Featured Projects** — Hand-curated cards for selected repositories with custom write-ups, key bullets, per-repo language bars, and a scrollable visualization gallery.
- **Notebook Scraping** — For featured repos backed by Jupyter notebooks, the browser fetches the `.ipynb` files directly from `raw.githubusercontent.com`, decodes the base64 cell-output images, and renders them inline. Nothing is downloaded or committed locally.
- **Dynamic GitHub Repos** — Pulls the rest of the public repositories from the GitHub API and renders them in a responsive grid.
- **Stats Overview** — Total public repos, languages used, stars, and forks at a glance.
- **Language Breakdown Chart** — Color-coded bar of languages across all repos plus per-repo breakdowns on each card.
- **Activity Timeline** — Twelve-month bar chart showing repo pushes per month.
- **Repo Cards** — Each card surfaces name, description, primary language, stars, forks, size, license, created and updated dates.
- **Responsive Design** — Three-column grid on desktop collapsing to a single column on mobile.
- **Smooth Animations** — Subtle fade-in reveal on scroll.

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (GitHub REST API)
- Node.js build step for the data pipeline
- GitHub Actions for the scheduled rebuild
- Google Fonts (Fraunces, Space Grotesk)

## Project Structure

```md
index.html                       — Page markup and structure
styles.css                       — All styling: cards, stats bar, charts, gallery
script.js                        — Renders cards, charts, timeline; fetches notebooks at runtime
scripts/build-data.js            — CI build step: queries GitHub API, writes data/repos.json
data/repos.json                  — Generated repo list, language breakdowns, featured sources
.github/workflows/build-data.yml — Daily + on-push workflow that runs the build step
```

## Data Pipeline

The browser does not call the GitHub API directly — the unauthenticated rate limit (60 req/hr) would block visitors quickly. Instead:

1. `.github/workflows/build-data.yml` runs on every push to `main`, once a day on a schedule, and via manual dispatch.
2. The job executes `scripts/build-data.js` under `GITHUB_TOKEN` (5000 req/hr authenticated quota).
3. The script writes `data/repos.json` containing slim repo metadata, per-repo language byte counts, image URLs for featured repos, and `.ipynb` URLs for repos whose visuals come from notebooks.
4. The workflow commits the regenerated `data/repos.json` back to `main` if it changed.

Featured visuals are referenced by URL only — image bytes never enter this repository.

## Local Preview

`index.html` fetches `data/repos.json`, which browsers refuse to load from `file://`. Run a local server instead:

```bash
npx serve .
# or
python -m http.server
```

To rebuild `data/repos.json` locally (optional — CI does it on push):

```bash
GITHUB_TOKEN=ghp_yourtoken node scripts/build-data.js
```

## Deploy to GitHub Pages

Because this repository is named `FelexHill7.github.io`, GitHub serves it automatically at `https://felexhill7.github.io/`.

1. Commit and push to the `main` branch.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for deployment.

## Customize

- **Hero, About, Contact** — Edit text directly in `index.html`.
- **Featured Projects** — Update the `FEATURED_REPOS` array in `script.js` (title, bullets, `maxImages`) and the `FEATURED` list in `scripts/build-data.js` (must match by `name`). Descriptions come from the GitHub repo itself.
- **Other Repo Descriptions** — Edit the description directly on the GitHub repo (`gh repo edit <repo> --description "..."`). The site picks it up on the next build.
- **Colors & Layout** — Adjust CSS custom properties at the top of `styles.css`.
- **GitHub User** — Change the `GITHUB_USER` constant in both `script.js` and `scripts/build-data.js` to point at a different profile.
- **Language Colors** — Update the `LANG_COLORS` map in `script.js` to tweak the dot/bar colors.
