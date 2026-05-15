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

// Featured projects config — display metadata for repos pre-baked by scripts/build-data.js
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
  'Calculator': {
    bullets: ['Basic arithmetic operations', 'Clean Java console interface', 'Input validation & error handling'],
  },
  'tictactoe': {
    bullets: ['Two-player game logic', 'Win/draw detection algorithm', 'Java console-based UI'],
  },
  'lab3-ci-testing': {
    bullets: ['GitHub Actions CI pipeline', 'Automated Python test suite', 'Build status badge integration'],
  },
  'SVM-monitoring': {
    bullets: ['Support Vector Machine classifier', 'Model performance monitoring', 'MIT licensed open-source project'],
  },
  'Ticketing-Site': {
    bullets: ['Event ticketing platform', 'Java-based backend architecture', 'User booking & management flow'],
  },
  'cancerdetection': {
    bullets: ['ML classification model', 'Jupyter Notebook analysis', 'Medical dataset preprocessing'],
  },
  'IluvDocker': {
    bullets: ['Docker container setup', 'Python app containerization', 'Lab test environment config'],
  },
  'UML-Test-1': {
    bullets: ['UML diagram modeling', 'Software design patterns', 'Class & sequence diagrams'],
  },
  'k-means-visualization-demo': {
    bullets: ['K-Means clustering algorithm', 'Interactive data visualization', 'Python scientific computing'],
  },
  'Bin2dec': {
    bullets: ['Binary to decimal converter', 'Input validation logic', 'Clean user interface'],
  },
  'PixelCraft': {
    bullets: ['Image manipulation tool', 'Pixel-level processing', 'Java graphics programming'],
  },
  'bookstore-lab5': {
    bullets: ['Tree traversal algorithms', 'Binary search tree operations', 'Java data structures lab'],
  },
  'bookstore-lab2': {
    bullets: ['Bookstore inventory system', 'Data structure fundamentals', 'Java OOP design'],
  },
  'app-ideas': {
    bullets: ['Curated project ideas collection', 'Beginner to advanced projects', 'Community coding resource'],
  },
};

function renderFeaturedProjects(repos, featuredImages, languagesMap) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return [];
  grid.innerHTML = '';

  const featuredRepos = FEATURED_ORDER
    .map((name) => {
      const repo = repos.find((r) => r.name === name);
      if (!repo) return null;
      const config = FEATURED_CONFIG[name] || {};
      const images = (featuredImages && featuredImages[name]) || [];
      return {
        repo,
        title: config.title || repo.name,
        description: config.description || repo.description || 'A repository with visual outputs.',
        bullets: config.bullets || [],
        maxImages: config.maxImages || 6,
        images,
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
    const galleryHTML = imageSet.length
      ? `
        <div class="featured-gallery">
          <div class="gallery-scroll" id="gallery-${repo.name}">
            ${imageSet
              .map(
                (src, i) =>
                  `<img src="${src}" alt="${title} visualization ${i + 1}" loading="lazy" />`
              )
              .join('')}
          </div>
          ${imageSet.length > 1
            ? `
          <div class="gallery-nav">
            <button class="gallery-btn" onclick="scrollGallery('${repo.name}', -1)" aria-label="Previous">&#8249;</button>
            <span class="gallery-count">${imageSet.length} visualizations</span>
            <button class="gallery-btn" onclick="scrollGallery('${repo.name}', 1)" aria-label="Next">&#8250;</button>
          </div>`
            : ''}
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

  return featuredRepos.map((item) => item.repo.name);
}

function scrollGallery(name, dir) {
  const el = document.getElementById(`gallery-${name}`);
  if (!el) return;
  const scrollAmount = el.clientWidth * 0.8;
  el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
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
      <p>${repo.description || 'No description provided.'}</p>
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

    const featuredNames = renderFeaturedProjects(sorted, data.featured || {}, data.languages || {});
    const regular = sorted.filter((r) => !featuredNames.includes(r.name));
    renderRegularGrid(regular, data.languages || {});
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
