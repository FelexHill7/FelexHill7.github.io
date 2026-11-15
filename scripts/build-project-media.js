#!/usr/bin/env node
/**
 * Scans every public, non-fork repo for images and writes data/project-media.json,
 * which the Next.js site uses for project screenshot frames. Runs daily in
 * .github/workflows/deploy.yml; the commit it makes triggers a Vercel redeploy.
 *
 * Image sources, in priority order (max MAX_IMAGES per repo):
 *   1. Images referenced in the README (the author's own choice)
 *   2. Image files in the repo, ranked by how screenshot-like their path is
 *   3. Plots rendered inside Jupyter notebook outputs. These have no URL, so
 *      they are decoded and saved to public/projects/auto/<repo>/.
 *
 * Repos tagged with the GitHub topic `portfolio-project` are also exported as
 * auto projects, which the site appends to the Work section.
 *
 * Usage: GITHUB_TOKEN=... node scripts/build-project-media.js
 */

const fs = require('fs/promises');
const path = require('path');

const GITHUB_USER = 'FelexHill7';
const AUTO_TOPIC = 'portfolio-project';
const MAX_IMAGES = 4;
const MAX_NOTEBOOK_IMAGES = 3;
const MAX_NOTEBOOK_BYTES = 15 * 1024 * 1024;
const MIN_IMAGE_BYTES = 8 * 1024; // smaller files are almost always icons
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const root = path.resolve(__dirname, '..');
const outFile = path.join(root, 'data', 'project-media.json');
const autoDir = path.join(root, 'public', 'projects', 'auto');

const IMAGE_EXT = /\.(png|jpe?g|gif|webp)$/i;
const SKIP_DIRS = /(^|\/)(node_modules|\.github|vendor|venv|\.venv|env|site-packages|dist|build|out|coverage|__pycache__|\.next|public\/favicon)(\/|$)/i;
const ICONISH = /(favicon|icon|logo|apple-touch|sprite|avatar|badge|emoji|cursor|spinner|loader)/i;
const GOOD_NAME = /(screenshot|screen|demo|preview|hero|banner|cover|showcase|ui|app|dashboard|result|output|plot|chart|figure|curve|matrix|comparison)/i;
const GOOD_DIR = /(^|\/)(docs?|assets|images?|img|media|screenshots?|outputs?|results?|figures?|plots?|reports?)(\/|$)/i;
const DATA_DIR = /(^|\/)(data|datasets?|samples?|tests?|fixtures|examples\/data|raw|train|val|valid|test_images)(\/|$)/i;
const GH_ATTACHMENT = /^https:\/\/(user-images\.githubusercontent\.com|private-user-images\.githubusercontent\.com|github\.com\/user-attachments\/assets)\//i;
const BADGE = /(shields\.io|badge|travis-ci|codecov|circleci|badgen|github\.com\/[^/]+\/[^/]+\/(actions\/)?workflows)/i;

async function gh(url, { raw = false } = {}) {
  const headers = {
    Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
    'User-Agent': 'portfolio-media-builder',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const err = new Error(`${res.status} ${url}`);
    err.status = res.status;
    throw err;
  }
  return raw ? res.text() : res.json();
}

const rawUrl = (repo, p) =>
  `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${p
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

function prettyAlt(repo, p) {
  const base = path.basename(p).replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return `${repo.name} — ${base || 'image'}`;
}

/* ---------- 1. README images ---------- */

async function readmeImages(repo) {
  let md;
  try {
    md = await gh(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/readme`, { raw: true });
  } catch (e) {
    if (e.status !== 404) console.warn(`  readme ${repo.name}: ${e.message}`);
    return [];
  }
  const found = [];
  const mdImg = /!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
  const htmlImg = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = mdImg.exec(md))) found.push({ src: m[2], alt: m[1] });
  while ((m = htmlImg.exec(md))) {
    const alt = /\balt=["']([^"']*)["']/i.exec(m[0]);
    found.push({ src: m[1], alt: alt ? alt[1] : '' });
  }

  const out = [];
  for (const { src, alt } of found) {
    if (BADGE.test(src) || /\.svg(\?|$)/i.test(src)) continue;
    let url = src;
    if (!/^https?:\/\//i.test(src)) {
      const rel = src.replace(/^\.?\//, '').split('#')[0].split('?')[0];
      url = rawUrl(repo, decodeURIComponent(rel));
    } else {
      // github.com/<u>/<r>/blob/<branch>/path → raw
      url = url.replace(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\//i, 'https://raw.githubusercontent.com/$1/$2/');
      // only real image files or GitHub-uploaded attachments; skips stats cards and other generated widgets
      const pathname = (() => {
        try {
          return new URL(url).pathname;
        } catch {
          return '';
        }
      })();
      if (!IMAGE_EXT.test(pathname) && !GH_ATTACHMENT.test(url)) continue;
    }
    if (ICONISH.test(url)) continue;
    out.push({ src: url, alt: alt || prettyAlt(repo, url), source: 'readme' });
  }
  return out;
}

/* ---------- 2. image files in the tree ---------- */

function scoreFile(item) {
  const p = item.path;
  const name = path.basename(p);
  let s = 0;
  if (GOOD_NAME.test(name)) s += 5;
  if (GOOD_DIR.test(p)) s += 3;
  if (DATA_DIR.test(p)) s -= 6;
  if (/\.(png|webp)$/i.test(name)) s += 1;
  s -= p.split('/').length * 0.3; // shallower is more likely intentional
  if (item.size > 60 * 1024) s += 1;
  return s;
}

function fileImages(repo, tree) {
  return tree
    .filter(
      (t) =>
        t.type === 'blob' &&
        IMAGE_EXT.test(t.path) &&
        !SKIP_DIRS.test(t.path) &&
        !ICONISH.test(path.basename(t.path)) &&
        (t.size ?? 0) >= MIN_IMAGE_BYTES &&
        (t.size ?? 0) <= MAX_IMAGE_BYTES,
    )
    .map((t) => ({ t, score: scoreFile(t) }))
    .filter((x) => x.score > -2)
    .sort((a, b) => b.score - a.score)
    .map(({ t }) => ({ src: rawUrl(repo, t.path), alt: prettyAlt(repo, t.path), source: 'file' }));
}

/* ---------- 3. notebook output images ---------- */

async function notebookImages(repo, tree, limit) {
  const notebooks = tree
    .filter((t) => t.type === 'blob' && t.path.endsWith('.ipynb') && !SKIP_DIRS.test(t.path))
    .filter((t) => (t.size ?? 0) <= MAX_NOTEBOOK_BYTES)
    // results / comparison notebooks first, then larger ones (more plots)
    .sort((a, b) => Number(GOOD_NAME.test(b.path)) - Number(GOOD_NAME.test(a.path)) || (b.size ?? 0) - (a.size ?? 0));

  const out = [];
  const dir = path.join(autoDir, repo.name);
  for (const nb of notebooks) {
    if (out.length >= limit) break;
    let json;
    try {
      const res = await fetch(rawUrl(repo, nb.path));
      if (!res.ok) continue;
      json = await res.json();
    } catch {
      continue;
    }
    let k = 0;
    for (const cell of json.cells ?? []) {
      for (const o of cell.outputs ?? []) {
        if (out.length >= limit) break;
        const png = o.data?.['image/png'];
        if (!png) continue;
        const b64 = Array.isArray(png) ? png.join('') : png;
        const buf = Buffer.from(b64.replace(/\s+/g, ''), 'base64');
        if (buf.length < MIN_IMAGE_BYTES) continue;
        const file = `${path.basename(nb.path, '.ipynb')}-${k++}.png`;
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, file), buf);
        out.push({
          src: `/projects/auto/${repo.name}/${file}`,
          alt: prettyAlt(repo, `${nb.path} plot ${k}`),
          source: 'notebook',
        });
      }
    }
  }
  return out;
}

/* ---------- auto projects ---------- */

async function autoProject(repo) {
  let languages = {};
  try {
    languages = await gh(`https://api.github.com/repos/${GITHUB_USER}/${repo.name}/languages`);
  } catch {
    /* optional */
  }
  const langs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([l]) => l)
    .slice(0, 4);
  const topics = (repo.topics ?? []).filter((t) => t !== AUTO_TOPIC && t !== 'portfolio');
  const links = [{ label: 'GitHub', href: repo.html_url }];
  if (repo.homepage) links.unshift({ label: 'Live', href: repo.homepage });
  return {
    repo: repo.name,
    title: repo.name,
    description: repo.description ?? '',
    stack: [...new Set([...langs, ...topics.slice(0, 3)])].slice(0, 6),
    links,
    live: Boolean(repo.homepage),
    year: String(new Date(repo.created_at).getFullYear()),
    pushedAt: repo.pushed_at,
  };
}

/* ---------- main ---------- */

async function main() {
  const repos = (await gh(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner&sort=pushed`)).filter(
    // forks are scanned too (team projects often live in a fork), but never auto-added as projects
    (r) => !r.archived && !r.private,
  );
  console.log(`Scanning ${repos.length} repos for images…`);

  await fs.rm(autoDir, { recursive: true, force: true });

  const media = {};
  const autoProjects = [];
  for (const repo of repos) {
    let tree = [];
    try {
      const t = await gh(
        `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`,
      );
      tree = Array.isArray(t.tree) ? t.tree : [];
    } catch (e) {
      if (e.status !== 409) console.warn(`  tree ${repo.name}: ${e.message}`); // 409 = empty repo
    }

    const images = [];
    const seen = new Set();
    const add = (list) => {
      for (const img of list) {
        if (images.length >= MAX_IMAGES) return;
        if (seen.has(img.src)) continue;
        seen.add(img.src);
        images.push(img);
      }
    };
    add(await readmeImages(repo));
    add(fileImages(repo, tree));
    if (images.length < MAX_IMAGES) {
      add(await notebookImages(repo, tree, Math.min(MAX_NOTEBOOK_IMAGES, MAX_IMAGES - images.length)));
    }

    if (images.length) media[repo.name] = { images };
    if (!repo.fork && (repo.topics ?? []).includes(AUTO_TOPIC)) autoProjects.push(await autoProject(repo));
    console.log(`  ${repo.name}: ${images.length} image(s)${images.length ? ` [${images.map((i) => i.source).join(', ')}]` : ''}`);
  }

  const payload = { user: GITHUB_USER, autoTopic: AUTO_TOPIC, media, autoProjects };
  const prev = await fs.readFile(outFile, 'utf8').catch(() => '');
  const prevBody = prev ? JSON.stringify({ ...JSON.parse(prev), generatedAt: undefined }) : '';
  // keep the timestamp stable when nothing changed, so the workflow makes no commit
  const generatedAt =
    prevBody === JSON.stringify({ ...payload, generatedAt: undefined }) && prev
      ? JSON.parse(prev).generatedAt
      : new Date().toISOString();
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, `${JSON.stringify({ generatedAt, ...payload }, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outFile)}: ${Object.keys(media).length} repos with images, ${autoProjects.length} auto project(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
