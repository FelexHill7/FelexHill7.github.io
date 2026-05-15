const yearNode = document.querySelector('#year');

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const GITHUB_USER = 'FelexHill7';
const DATA_URL = 'data/repos.json';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  CSS: '#563d7c',
  HTML: '#e34c26',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
};

const FEATURED_REPOS = [
  {
    name: 'cancerdetection',
    title: 'Breast Cancer Detection',
    description: 'End-to-end ML pipeline classifying breast tumors as benign or malignant using SVM, Logistic Regression, and Neural Networks — all achieving 96%+ accuracy.',
    bullets: [
      'Trained SVM, Logistic Regression & Neural Network classifiers',
      'Preprocessed clinical data with One-Hot Encoding & standardization',
      '96%+ accuracy across all models with F1 > 0.95',
      'PCA-based 2D/3D decision boundary visualizations',
      'Tech: Python, SciKit-Learn, TensorFlow, Pandas, Matplotlib',
    ],
    maxImages: 12,
  },
  {
    name: 'RxRead',
    title: 'RxRead — Handwriting OCR Comparison',
    description: 'Web app comparing four handwriting OCR backends side-by-side: a from-scratch ResNet-CRNN, Microsoft TrOCR (line and whole-image), and Google Gemini vision, with an optional prescription-mode post-processor.',
    bullets: [
      'From-scratch ResNet-18 + BiLSTM + CTC word-level CRNN (~24% CER)',
      'TrOCR & Gemini Vision backends for production-grade comparison',
      'Connected-component line detection with two-pass NMS',
      'Beam search + bigram LM rescoring + test-time augmentation',
      'Tech: PyTorch, Transformers, Flask, Google GenAI',
    ],
    maxImages: 8,
  },
  {
    name: 'weatherTrendForecasting',
    title: 'Weather Trend Forecasting',
    description: 'End-to-end data science project on the Global Weather Repository (40+ features, worldwide) with anomaly detection, SARIMA & Prophet forecasting, ensemble methods, and spatial visualization.',
    bullets: [
      'Anomaly detection: Z-score, IQR, Isolation Forest, LOF',
      'Time series: ADF stationarity, seasonal decomposition, ACF/PACF',
      'Forecasting: SARIMA(1,0,1)(1,1,1,12) + Prophet ensemble',
      'Climate analysis, air-quality correlation, spatial visualization',
      'Tech: Python, Pandas, statsmodels, Prophet, scikit-learn',
    ],
    maxImages: 12,
  },
];

const FEATURED_ORDER = FEATURED_REPOS.map((repo) => repo.name);
const FEATURED_CONFIG = FEATURED_REPOS.reduce((acc, repo) => {
  acc[repo.name] = repo;
  return acc;
}, {});

const REPO_DETAILS = {
  visionTransformer: {
    description: 'Vision Transformer (ViT) experiments in PyTorch — patch-based self-attention applied to image classification, with a focus on understanding how transformer architectures generalize beyond NLP.',
    bullets: ['Patch embedding + positional encoding', 'Multi-head self-attention on image tokens', 'Built and trained from scratch in PyTorch'],
  },
  weatherapp: {
    description: 'Lightweight weather client that pulls live conditions and short-range forecasts from a public weather API and renders them in a clean, responsive UI.',
    bullets: ['Live weather + forecast fetch', 'Location search and unit toggle', 'Responsive single-page layout'],
  },
  pomodoroapp: {
    description: 'A focus timer built around the Pomodoro technique — configurable work/break intervals, session counter, and minimal distraction-free interface.',
    bullets: ['Configurable work / short / long break cycles', 'Session counter and notifications', 'Minimal, focus-first UI'],
  },
  Calculator: {
    description: 'Java console calculator supporting standard arithmetic with input validation and graceful error handling. A small project focused on clean OOP structure.',
    bullets: ['Basic arithmetic operations', 'Input validation and error handling', 'Clean Java console interface'],
  },
  tictactoe: {
    description: 'Classic two-player Tic-Tac-Toe in Java with full win/draw detection — written as a small exercise in game state modeling and turn loops.',
    bullets: ['Two-player turn logic', 'Win and draw detection', 'Console-based UI'],
  },
  'lab3-ci-testing': {
    description: 'Python lab project demonstrating a full CI pipeline — automated test suite running on GitHub Actions with a build-status badge in the README.',
    bullets: ['GitHub Actions CI pipeline', 'Automated Python test suite', 'Build status badge integration'],
  },
  'SVM-monitoring': {
    description: 'Support Vector Machine classifier paired with lightweight model-performance monitoring — tracks key metrics across runs so model drift is easy to spot.',
    bullets: ['SVM classifier implementation', 'Run-over-run performance tracking', 'MIT-licensed and open source'],
  },
  IluvDocker: {
    description: 'Containerization lab packaging a small Python app into a Docker image — covers Dockerfile basics, image layering, and runtime configuration.',
    bullets: ['Dockerfile + image build', 'Python app containerization', 'Environment configuration via env vars'],
  },
  'UML-Test-1': {
    description: 'Software design exercise modeling an object-oriented system with UML — class diagrams, sequence diagrams, and the design patterns that link them.',
    bullets: ['Class and sequence diagrams', 'OOP design pattern modeling', 'Documentation-first design exercise'],
  },
  'k-means-visualization-demo': {
    description: 'Interactive demo that visualizes K-Means clustering as it converges — useful for building intuition around centroid initialization and assignment steps.',
    bullets: ['K-Means clustering from scratch', 'Step-by-step visualization', 'Python scientific computing stack'],
  },
  Bin2dec: {
    description: 'Small binary-to-decimal converter focused on solid input validation and a clean, beginner-friendly interface.',
    bullets: ['Binary → decimal conversion', 'Robust input validation', 'Minimal UI'],
  },
  PixelCraft: {
    description: 'Java image-processing tool that operates on raw pixel data — applies filters and transformations programmatically rather than through a GUI.',
    bullets: ['Pixel-level image manipulation', 'Filter and transform pipeline', 'Java graphics programming'],
  },
};

function renderFeaturedProjects(repos, featuredImages, featuredNotebooks, languagesMap) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return [];
  grid.innerHTML = '';

  const featuredRepos = FEATURED_ORDER
    .map((name) => {
      const repo = repos.find((r) => r.name === name);
      if (!repo) return null;
      const config = FEATURED_CONFIG[name] || {};
      const images = (featuredImages && featuredImages[name]) || [];
      const notebooks = (featuredNotebooks && featuredNotebooks[name]) || [];
      return {
        repo,
        title: config.title || repo.name,
        description: config.description || repo.description || 'A repository with visual outputs.',
        bullets: config.bullets || [],
        maxImages: config.maxImages || 6,
        images,
        notebooks,
      };
    })
    .filter(Boolean);

  if (featuredRepos.length === 0) {
    grid.innerHTML = '<p class="loading-text">No featured projects were found.</p>';
    return [];
  }

  for (const featured of featuredRepos) {
    const repo = featured.repo;
    const title = featured.title;
    const bulletsHTML = featured.bullets.length
      ? `<ul class="repo-bullets featured-bullets">${featured.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
      : '';

    const imageSet = featured.images.slice(0, featured.maxImages);
    const hasInitialImages = imageSet.length > 0;
    const hasNotebooks = featured.notebooks.length > 0;
    const hasAnyVisuals = hasInitialImages || hasNotebooks;

    const imgsHTML = imageSet
      .map(
        (src, i) =>
          `<img src="${src}" alt="${title} visualization ${i + 1}" loading="lazy" />`
      )
      .join('');
    const loadingHTML = hasNotebooks
      ? `<div class="gallery-loading" id="gallery-loading-${repo.name}">Extracting notebook visualizations…</div>`
      : '';

    const galleryHTML = hasAnyVisuals
      ? `
        <div class="featured-gallery">
          <div class="gallery-scroll" id="gallery-${repo.name}">
            ${imgsHTML}
            ${loadingHTML}
          </div>
          <div class="gallery-nav" id="gallery-nav-${repo.name}" ${imageSet.length > 1 ? '' : 'hidden'}>
            <button class="gallery-btn" onclick="scrollGallery('${repo.name}', -1)" aria-label="Previous">&#8249;</button>
            <span class="gallery-count" id="gallery-count-${repo.name}">${imageSet.length} visualization${imageSet.length === 1 ? '' : 's'}</span>
            <button class="gallery-btn" onclick="scrollGallery('${repo.name}', 1)" aria-label="Next">&#8250;</button>
          </div>
        </div>`
      : `<div class="featured-placeholder"><span>&#128202;</span> View visualizations on <a href="${repo.html_url}" target="_blank" rel="noreferrer">GitHub</a></div>`;

    const langColor = LANG_COLORS[repo.language] || '#8b8b8b';
    const sizeKB = repo.size;
    const sizeLabel = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const repoLangs = (languagesMap && languagesMap[repo.name]) || {};
    const langTotal = Object.values(repoLangs).reduce((a, b) => a + b, 0);
    const langEntries = Object.entries(repoLangs).sort((a, b) => b[1] - a[1]);
    let langBarHTML = '<div class="repo-lang-bar"><div class="lang-bar"></div></div>';
    let langLabelsHTML = '';
    if (langEntries.length > 0) {
      const segments = langEntries
        .map(([lang, bytes]) => {
          const pct = ((bytes / langTotal) * 100).toFixed(1);
          const color = LANG_COLORS[lang] || '#8b8b8b';
          return `<div class="lang-segment" style="width:${pct}%;background:${color}" title="${lang}: ${pct}%"></div>`;
        })
        .join('');
      langBarHTML = `<div class="repo-lang-bar"><div class="lang-bar">${segments}</div></div>`;

      langLabelsHTML = `<div class="repo-lang-labels">${langEntries
        .map(([lang, bytes]) => {
          const pct = ((bytes / langTotal) * 100).toFixed(1);
          const color = LANG_COLORS[lang] || '#8b8b8b';
          return `<span class="lang-legend-item"><span class="lang-dot" style="background:${color}"></span>${lang} <span class="lang-pct">${pct}%</span></span>`;
        })
        .join('')}</div>`;
    }

    const card = document.createElement('article');
    card.className = 'featured-card';
    card.innerHTML = `
      <div class="featured-content">
        <div class="featured-text">
          <div class="repo-header">
            <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${title}</a></h3>
            <div class="repo-badges">
              <span class="repo-badge featured-badge">Featured</span>
              ${repo.license ? `<span class="repo-license">${repo.license.spdx_id}</span>` : ''}
            </div>
          </div>
          <p class="featured-desc">${featured.description}</p>
          ${bulletsHTML}
          ${langBarHTML}
          ${langLabelsHTML}
          <div class="repo-stats">
            ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
            <span class="repo-stat" title="Stars">&#9733; ${repo.stargazers_count}</span>
            <span class="repo-stat" title="Forks">&#9741; ${repo.forks_count}</span>
            <span class="repo-stat" title="Size">&#128230; ${sizeLabel}</span>
          </div>
        </div>
        <div class="featured-visuals">
          ${galleryHTML}
        </div>
      </div>
    `;
    grid.appendChild(card);
  }

  return featuredRepos;
}

function scrollGallery(name, dir) {
  const el = document.getElementById(`gallery-${name}`);
  if (!el) return;
  const scrollAmount = el.clientWidth * 0.8;
  el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
}

const NOTEBOOK_MIME_PRIORITY = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];

function extractImagesFromNotebook(nb, max) {
  const dataUrls = [];
  for (const cell of nb.cells || []) {
    if (dataUrls.length >= max) break;
    for (const output of cell.outputs || []) {
      if (dataUrls.length >= max) break;
      const data = output.data;
      if (!data) continue;
      for (const mime of NOTEBOOK_MIME_PRIORITY) {
        if (!data[mime]) continue;
        const raw = Array.isArray(data[mime]) ? data[mime].join('') : data[mime];
        let dataUrl;
        if (mime === 'image/svg+xml') {
          dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(raw)))}`;
        } else {
          dataUrl = `data:${mime};base64,${raw.replace(/\s+/g, '')}`;
        }
        dataUrls.push(dataUrl);
        break;
      }
    }
  }
  return dataUrls;
}

async function fetchNotebookImages(notebookUrl, max) {
  try {
    const res = await fetch(notebookUrl);
    if (!res.ok) return [];
    const nb = await res.json();
    return extractImagesFromNotebook(nb, max);
  } catch (e) {
    console.warn(`notebook fetch failed for ${notebookUrl}:`, e);
    return [];
  }
}

async function enhanceWithNotebookImages(featuredItems) {
  for (const featured of featuredItems) {
    if (!featured.notebooks || featured.notebooks.length === 0) continue;

    const name = featured.repo.name;
    const scrollEl = document.getElementById(`gallery-${name}`);
    const loadingEl = document.getElementById(`gallery-loading-${name}`);
    const countEl = document.getElementById(`gallery-count-${name}`);
    const navEl = document.getElementById(`gallery-nav-${name}`);
    if (!scrollEl) continue;

    let total = featured.images.length;
    let remaining = featured.maxImages - total;

    for (const nbUrl of featured.notebooks) {
      if (remaining <= 0) break;
      const newImages = await fetchNotebookImages(nbUrl, remaining);
      for (const src of newImages) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = `${featured.title} visualization ${total + 1}`;
        img.src = src;
        scrollEl.insertBefore(img, loadingEl || null);
        total += 1;
      }
      remaining = featured.maxImages - total;
    }

    if (loadingEl) loadingEl.remove();
    if (countEl) countEl.textContent = `${total} visualization${total === 1 ? '' : 's'}`;
    if (navEl) {
      if (total > 1) navEl.removeAttribute('hidden');
      else navEl.setAttribute('hidden', '');
    }
  }
}

function renderRegularGrid(repos, languagesMap) {
  const grid = document.getElementById('repo-grid');
  if (!grid) return;
  grid.innerHTML = '';

  repos.forEach((repo) => {
    const card = document.createElement('article');
    card.className = 'project-card repo-card';

    const langColor = LANG_COLORS[repo.language] || '#8b8b8b';
    const updated = new Date(repo.pushed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const created = new Date(repo.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const sizeKB = repo.size;
    const sizeLabel = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const repoLangs = (languagesMap && languagesMap[repo.name]) || {};
    const langTotal = Object.values(repoLangs).reduce((a, b) => a + b, 0);
    const langEntries = Object.entries(repoLangs).sort((a, b) => b[1] - a[1]);
    let langBarHTML = '';
    let langLabelsHTML = '';
    if (langEntries.length > 0) {
      const segments = langEntries
        .map(([lang, bytes]) => {
          const pct = ((bytes / langTotal) * 100).toFixed(1);
          const color = LANG_COLORS[lang] || '#8b8b8b';
          return `<div class="lang-segment" style="width:${pct}%;background:${color}" title="${lang}: ${pct}%"></div>`;
        })
        .join('');
      langBarHTML = `<div class="repo-lang-bar"><div class="lang-bar">${segments}</div></div>`;

      langLabelsHTML = `<div class="repo-lang-labels">${langEntries
        .map(([lang, bytes]) => {
          const pct = ((bytes / langTotal) * 100).toFixed(1);
          const color = LANG_COLORS[lang] || '#8b8b8b';
          return `<span class="lang-legend-item"><span class="lang-dot" style="background:${color}"></span>${lang} <span class="lang-pct">${pct}%</span></span>`;
        })
        .join('')}</div>`;
    }

    const details = REPO_DETAILS[repo.name];
    const bulletsHTML = details && details.bullets
      ? `<ul class="repo-bullets">${details.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
      : '';

    card.innerHTML = `
      <div class="repo-header">
        <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a></h3>
        <div class="repo-badges">
          ${repo.license ? `<span class="repo-license">${repo.license.spdx_id}</span>` : ''}
          ${repo.fork ? '<span class="repo-badge fork-badge">Fork</span>' : ''}
        </div>
      </div>
      <p>${(details && details.description) || repo.description || 'No description provided.'}</p>
      ${bulletsHTML}
      ${langBarHTML}
      ${langLabelsHTML}
      <div class="repo-stats">
        ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
        <span class="repo-stat" title="Stars">&#9733; ${repo.stargazers_count}</span>
        <span class="repo-stat" title="Forks">&#9741; ${repo.forks_count}</span>
        <span class="repo-stat" title="Size">&#128230; ${sizeLabel}</span>
      </div>
      <div class="repo-dates">
        <span class="repo-updated">Created ${created}</span>
        <span class="repo-updated">Updated ${updated}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function buildLanguageChart(repos) {
  const langCount = {};
  repos.forEach((r) => {
    if (r.language) {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
  });

  const total = Object.values(langCount).reduce((a, b) => a + b, 0);
  if (total === 0) return;
  const sorted = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  const chart = document.getElementById('language-chart');
  if (!chart) return;
  chart.innerHTML = '';

  const bar = document.createElement('div');
  bar.className = 'lang-bar';
  sorted.forEach(([lang, count]) => {
    const seg = document.createElement('div');
    seg.className = 'lang-segment';
    seg.style.width = `${(count / total) * 100}%`;
    seg.style.background = LANG_COLORS[lang] || '#8b8b8b';
    seg.title = `${lang}: ${count} repo${count > 1 ? 's' : ''}`;
    bar.appendChild(seg);
  });
  chart.appendChild(bar);

  const legend = document.createElement('div');
  legend.className = 'lang-legend';
  sorted.forEach(([lang, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    const item = document.createElement('span');
    item.className = 'lang-legend-item';
    item.innerHTML = `<span class="lang-dot" style="background:${LANG_COLORS[lang] || '#8b8b8b'}"></span>${lang} <span class="lang-pct">${pct}%</span>`;
    legend.appendChild(item);
  });
  chart.appendChild(legend);
}

function buildActivityTimeline(repos) {
  const timeline = document.getElementById('activity-timeline');
  if (!timeline) return;

  const monthMap = {};
  repos.forEach((r) => {
    const d = new Date(r.pushed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  });

  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    months.push({ key, label, count: monthMap[key] || 0 });
  }

  const maxCount = Math.max(...months.map((m) => m.count), 1);

  timeline.innerHTML = `
    <div class="activity-bars">
      ${months
        .map(
          (m) => `
        <div class="activity-col">
          <div class="activity-bar-wrap">
            <div class="activity-bar" style="height:${(m.count / maxCount) * 100}%"
                 title="${m.count} repo${m.count !== 1 ? 's' : ''} updated in ${m.label}">
              ${m.count > 0 ? `<span class="activity-count">${m.count}</span>` : ''}
            </div>
          </div>
          <span class="activity-month">${m.label}</span>
        </div>`
        )
        .join('')}
    </div>
  `;
}

function renderStats(repos) {
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  set('stat-repos', repos.length);
  set('stat-languages', languages.length);
  set('stat-stars', totalStars);
  set('stat-forks', totalForks);
}

async function loadAndRender() {
  const grid = document.getElementById('repo-grid');
  try {
    const res = await fetch(`${DATA_URL}?v=${Date.now()}`);
    if (!res.ok) {
      throw new Error(`${DATA_URL} -> ${res.status}`);
    }
    const data = await res.json();
    const repos = Array.isArray(data.repos) ? data.repos : [];

    if (repos.length === 0) {
      const msg = 'Site data is still being generated. The Build site data workflow needs to finish — usually within a minute of the latest push.';
      const featuredGrid = document.getElementById('featured-grid');
      if (featuredGrid) featuredGrid.innerHTML = `<p class="loading-text">${msg}</p>`;
      if (grid) grid.innerHTML = `<p class="loading-text"><a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">Visit GitHub profile</a> in the meantime.</p>`;
      return;
    }

    const sorted = [...repos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    renderStats(sorted);
    buildLanguageChart(sorted);
    buildActivityTimeline(sorted);

    const featuredItems = renderFeaturedProjects(
      sorted,
      data.featured || {},
      data.featured_notebooks || {},
      data.languages || {}
    );
    const featuredNames = featuredItems.map((f) => f.repo.name);
    const regular = sorted.filter((r) => !featuredNames.includes(r.name));
    renderRegularGrid(regular, data.languages || {});

    enhanceWithNotebookImages(featuredItems);
  } catch (err) {
    console.error('loadAndRender failed:', err);
    const reason =
      location.protocol === 'file:'
        ? 'Open the page via a local web server (e.g. "python -m http.server"). Browsers block fetching local JSON from file:// URLs.'
        : 'Could not load site data. The build may not have run yet — push to main to trigger the Build site data workflow.';
    if (grid) {
      grid.innerHTML = `<p class="loading-text">${reason} <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">Visit GitHub profile</a></p>`;
    }
  }
}

loadAndRender();
