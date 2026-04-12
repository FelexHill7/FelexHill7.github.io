# FelexHill7.github.io

Personal portfolio website built with vanilla HTML, CSS, and JavaScript. Live at **[felexhill7.github.io](https://felexhill7.github.io/)**.

## Features

- **Dynamic GitHub Repos** — Automatically fetches and displays all public repositories from the GitHub API.
- **Stats Overview** — Shows total repos, languages used, stars, and forks at a glance.
- **Language Breakdown Chart** — Visual bar chart of languages across all repos with a color-coded legend.
- **Repo Cards** — Each repo is displayed with its name, description, primary language, stars, forks, size, license, and last updated date.
- **Responsive Design** — Adapts from 3-column grid on desktop to single-column on mobile.
- **Smooth Animations** — Fade-in reveal effects on scroll.

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (GitHub REST API)
- Google Fonts (Fraunces, Space Grotesk)

## Project Structure

```
index.html   — Page markup and structure
styles.css   — All styling including repo cards, stats bar, and language chart
script.js    — GitHub API fetch, repo card rendering, language chart builder
```

## Local Preview

Open `index.html` directly in a browser, or use a local server:

```bash
npx serve .
```

## Deploy to GitHub Pages

Because this repository is named `FelexHill7.github.io`, GitHub serves it automatically at:

`https://felexhill7.github.io/`

1. Commit and push to the `main` branch.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`.
5. Save and wait for deployment.

## Customize

- **Content** — Edit text and sections in `index.html`.
- **Colors & Layout** — Adjust CSS custom properties and styles in `styles.css`.
- **GitHub User** — Change the `GITHUB_USER` constant in `script.js` to show a different profile's repos.
- **Language Colors** — Update the `LANG_COLORS` map in `script.js` to add or change language dot colors.
