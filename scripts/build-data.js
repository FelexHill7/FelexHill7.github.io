#!/usr/bin/env node
/**
 * Pre-bakes data/repos.json + data/images/* by hitting the GitHub API once.
 * Runs in CI under a GITHUB_TOKEN so it can use the 5000/hr authenticated quota
 * instead of the 60/hr unauthenticated cap the browser would otherwise hit.
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

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp'];

const NOTEBOOK_IMAGE_MIME = [
  { mime: 'image/png', ext: 'png', encoding: 'base64' },
  { mime: 'image/jpeg', ext: 'jpg', encoding: 'base64' },
  { mime: 'image/gif', ext: 'gif', encoding: 'base64' },
  { mime: 'image/svg+xml', ext: 'svg', encoding: 'utf8' },
];

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

async function fetchNotebookContent(repoName, notebookPath) {
  const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/${encodeURIComponent(notebookPath).replace(/%2F/g, '/')}`;
  const fileData = await gh(url);
  if (fileData.content && fileData.encoding === 'base64') {
    return Buffer.from(fileData.content, 'base64').toString('utf8');
  }
  if (fileData.download_url) {
    const r = await fetch(fileData.download_url, { headers: HEADERS });
    if (r.ok) return await r.text();
  }
  return null;
}

async function extractNotebookImages(repoName, notebookPath, maxImages) {
  const content = await fetchNotebookContent(repoName, notebookPath);
  if (!content) return [];
  const nb = JSON.parse(content);
  const images = [];
  for (const cell of nb.cells || []) {
    if (images.length >= maxImages) break;
    for (const output of cell.outputs || []) {
      if (images.length >= maxImages) break;
      const data = output.data;
      if (!data) continue;
      for (const { mime, ext, encoding } of NOTEBOOK_IMAGE_MIME) {
        if (!data[mime]) continue;
        const raw = Array.isArray(data[mime]) ? data[mime].join('') : data[mime];
        images.push({ source: 'notebook', ext, encoding, raw });
        break;
      }
    }
  }
  return images;
}

async function collectFeaturedImages(repo, maxImages) {
  const tree = await fetchTree(repo);
  const images = [];

  const notebookPaths = tree
    .filter((i) => i.type === 'blob' && i.path.toLowerCase().endsWith('.ipynb'))
    .map((i) => i.path);

  for (const nbPath of notebookPaths) {
    if (images.length >= maxImages) break;
    try {
      const more = await extractNotebookImages(repo.name, nbPath, maxImages - images.length);
      images.push(...more);
    } catch (e) {
      console.warn(`notebook ${nbPath} failed:`, e.message);
    }
  }

  if (images.length < maxImages) {
    const imagePaths = tree
      .filter(
        (i) =>
          i.type === 'blob' &&
          IMAGE_EXTENSIONS.includes(i.path.split('.').pop().toLowerCase())
      )
      .map((i) => i.path);
    for (const p of imagePaths) {
      if (images.length >= maxImages) break;
      images.push({
        source: 'raw',
        url: `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${p}`,
      });
    }
  }

  return images;
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
  const imagesDir = path.join(dataDir, 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  // Clear stale images so renames/removals don't leave orphans
  for (const f of await fs.readdir(imagesDir).catch(() => [])) {
    await fs.unlink(path.join(imagesDir, f));
  }

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

  // Languages for every owned repo (so the regular grid still gets per-repo bars)
  const languages = {};
  for (const r of owned) {
    if (FEATURED_NAMES.has(r.name)) continue;
    try {
      languages[r.name] = await gh(r.languages_url);
    } catch (e) {
      console.warn(`languages failed for ${r.name}:`, e.message);
      languages[r.name] = {};
    }
  }

  // Featured: gather images, write to data/images/, record relative paths
  const featured = {};
  for (const cfg of FEATURED) {
    const repo = owned.find((r) => r.name === cfg.name);
    if (!repo) {
      console.warn(`featured repo ${cfg.name} not present in owned repo list`);
      featured[cfg.name] = [];
      continue;
    }
    console.log(`collecting images for ${repo.name} (max ${cfg.maxImages})...`);
    const items = await collectFeaturedImages(repo, cfg.maxImages);
    const urls = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.source === 'raw') {
        urls.push(item.url);
        continue;
      }
      const filename = `${repo.name}-${i}.${item.ext}`;
      const filepath = path.join(imagesDir, filename);
      if (item.encoding === 'base64') {
        await fs.writeFile(filepath, Buffer.from(item.raw, 'base64'));
      } else {
        await fs.writeFile(filepath, item.raw, 'utf8');
      }
      urls.push(`data/images/${filename}`);
    }
    featured[repo.name] = urls;
    console.log(`  -> ${urls.length} image(s)`);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    user: GITHUB_USER,
    repos: owned.map(slimRepo),
    languages,
    featured,
  };
  await fs.writeFile(
    path.join(dataDir, 'repos.json'),
    JSON.stringify(out, null, 2) + '\n'
  );
  console.log(`done. ${owned.length} repos, ${Object.values(featured).flat().length} featured images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
