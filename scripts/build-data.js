#!/usr/bin/env node
/**
 * Pre-bakes data/repos.json by hitting the GitHub API once.
 * Runs in CI under a GITHUB_TOKEN so it can use the 5000/hr authenticated quota
 * instead of the 60/hr unauthenticated cap the browser would otherwise hit.
 *
 * Featured visuals come from two sources, both fetched at runtime by the browser
 * (no notebook bytes / images committed to this repo):
 *   1. Standalone image files in the repo (raw.githubusercontent.com URLs)
 *   2. .ipynb files — browser fetches the notebook, decodes base64 cell outputs
 */

const fs = require('fs/promises');
const path = require('path');

const GITHUB_USER = 'FelexHill7';
const TOKEN = process.env.GITHUB_TOKEN || '';

const HEADERS = {
  'User-Agent': `${GITHUB_USER}-site-build`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

const FEATURED = [
  { name: 'cancerdetection', maxImages: 12 },
  { name: 'RxRead', maxImages: 8 },
  { name: 'weatherTrendForecasting', maxImages: 12 },
];
const FEATURED_NAMES = new Set(FEATURED.map((f) => f.name));

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp']);

async function gh(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${url} -> ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchTree(repo) {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`;
  try {
    const data = await gh(url);
    return Array.isArray(data.tree) ? data.tree : [];
  } catch (e) {
    console.warn(`tree failed for ${repo.name}:`, e.message);
    return [];
  }
}

function rawUrl(repo, filePath) {
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${filePath}`;
}

async function collectFeaturedSources(repo, maxImages) {
  const tree = await fetchTree(repo);
  const imageUrls = [];
  const notebookUrls = [];
  for (const item of tree) {
    if (item.type !== 'blob') continue;
    const lower = item.path.toLowerCase();
    if (lower.endsWith('.ipynb')) {
      notebookUrls.push(rawUrl(repo, item.path));
      continue;
    }
    const ext = lower.split('.').pop();
    if (IMAGE_EXTENSIONS.has(ext) && imageUrls.length < maxImages) {
      imageUrls.push(rawUrl(repo, item.path));
    }
  }
  return { imageUrls, notebookUrls };
}

function slimRepo(r) {
  return {
    name: r.name,
    description: r.description,
    html_url: r.html_url,
    language: r.language,
    default_branch: r.default_branch,
    size: r.size,
    stargazers_count: r.stargazers_count,
    forks_count: r.forks_count,
    license: r.license ? { spdx_id: r.license.spdx_id } : null,
    fork: r.fork,
    created_at: r.created_at,
    pushed_at: r.pushed_at,
    updated_at: r.updated_at,
  };
}

async function main() {
  const root = path.join(__dirname, '..');
  const dataDir = path.join(root, 'data');
  await fs.mkdir(dataDir, { recursive: true });

  console.log(`fetching repo list for ${GITHUB_USER}...`);
  const allRepos = await gh(
    `https://api.github.com/users/${GITHUB_USER}/repos?sort=created&per_page=100`
  );

  const owned = allRepos.filter(
    (r) =>
      r.owner &&
      r.owner.login === GITHUB_USER &&
      (!r.fork || FEATURED_NAMES.has(r.name)) &&
      r.name !== GITHUB_USER &&
      r.name !== `${GITHUB_USER}.github.io`
  );

  const languages = {};
  for (const r of owned) {
    try {
      languages[r.name] = await gh(r.languages_url);
    } catch (e) {
      console.warn(`languages failed for ${r.name}:`, e.message);
      languages[r.name] = {};
    }
  }

  const featured = {};
  const featuredNotebooks = {};
  for (const cfg of FEATURED) {
    const repo = owned.find((r) => r.name === cfg.name);
    if (!repo) {
      console.warn(`featured repo ${cfg.name} not present in owned repo list`);
      featured[cfg.name] = [];
      continue;
    }
    console.log(`scraping featured sources for ${repo.name} (max ${cfg.maxImages})...`);
    const { imageUrls, notebookUrls } = await collectFeaturedSources(repo, cfg.maxImages);
    featured[repo.name] = imageUrls;
    // Only expose notebooks if we don't already have enough raw images — saves the browser fetch.
    if (imageUrls.length < cfg.maxImages && notebookUrls.length > 0) {
      featuredNotebooks[repo.name] = notebookUrls;
    }
    console.log(`  -> ${imageUrls.length} image URL(s), ${(featuredNotebooks[repo.name] || []).length} notebook URL(s)`);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    user: GITHUB_USER,
    repos: owned.map(slimRepo),
    languages,
    featured,
    featured_notebooks: featuredNotebooks,
  };
  await fs.writeFile(
    path.join(dataDir, 'repos.json'),
    JSON.stringify(out, null, 2) + '\n'
  );
  console.log(`done. ${owned.length} repos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
