const yearNode = document.querySelector('#year');

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

// GitHub repo fetching
const GITHUB_USER = 'FelexHill7';
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

// Featured projects config — shown first with notebook visuals
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
    notebooks: [
      'notebooks/model_comparison.ipynb',
      'notebooks/svm_classifier.ipynb',
      'notebooks/logistic_regression.ipynb',
      'notebooks/neural_network.ipynb',
    ],
    maxImages: 6,
  },
  {
    name: 'SVM-monitoring',
    title: 'SVM Performance Monitoring',
    description: 'Dockerized Flask API serving an SVM classifier with Prometheus metrics, Grafana dashboards, and Kubernetes deployment for real-time ML performance monitoring.',
    bullets: [
      'Flask API with /classify and /metrics endpoints',
      'Prometheus time-series metrics for CPU, memory & latency',
      'Grafana dashboards for real-time resource visualization',
      'Docker + Kubernetes deployment with cAdvisor monitoring',
      'Tested on 2,000 & 8,000 samples — 94.4% accuracy',
    ],
    notebooks: [],
    readmeImages: true,
    maxImages: 4,
  },
  {
    name: 'k-means-visualization-demo',
    title: 'K-Means Clustering Visualization',
    description: 'Interactive visualization of the K-Means clustering algorithm showing centroid movement, cluster assignments, and convergence across iterations.',
    bullets: [
      'K-Means algorithm implementation from scratch',
      'Animated centroid convergence visualization',
      'Configurable cluster count and data distribution',
      'Matplotlib scatter plots with decision boundaries',
      'Tech: Python, NumPy, Matplotlib, scikit-learn',
    ],
    notebooks: [],
    sourceFile: 'k-meansVisual.py',
    maxImages: 4,
  },
];

// Known repo details for richer bullet points
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

async function extractNotebookImages(repoName, notebookPath, maxImages) {
  try {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}/contents/${notebookPath}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const fileData = await res.json();
    // Notebook content is base64-encoded by GitHub API
    const content = atob(fileData.content.replace(/\n/g, ''));
    const nb = JSON.parse(content);
    const images = [];
    for (const cell of nb.cells || []) {
      if (images.length >= maxImages) break;
      for (const output of cell.outputs || []) {
        if (images.length >= maxImages) break;
        // Check for image in output data
        const data = output.data;
        if (data && data['image/png']) {
          const b64 = Array.isArray(data['image/png'])
            ? data['image/png'].join('')
            : data['image/png'];
          images.push(`data:image/png;base64,${b64}`);
        }
      }
    }
    return images;
  } catch {
    return [];
  }
}

async function renderFeaturedProjects(repos) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (const featured of FEATURED_REPOS) {
    const repo = repos.find((r) => r.name === featured.name);
    if (!repo) continue;

    const card = document.createElement('article');
    card.className = 'featured-card';

    // Fetch per-repo languages
    let langBarHTML = '';
    let langLabelsHTML = '';
    try {
      const langRes = await fetch(repo.languages_url);
      if (langRes.ok) {
        const repoLangs = await langRes.json();
        const langTotal = Object.values(repoLangs).reduce((a, b) => a + b, 0);
        const langEntries = Object.entries(repoLangs).sort((a, b) => b[1] - a[1]);
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
      }
    } catch {}

    // Collect notebook images
    let allImages = [];
    for (const nbPath of featured.notebooks) {
      const imgs = await extractNotebookImages(featured.name, nbPath, featured.maxImages - allImages.length);
      allImages = allImages.concat(imgs);
      if (allImages.length >= featured.maxImages) break;
    }

    // Build gallery HTML
    let galleryHTML = '';
    if (allImages.length > 0) {
      galleryHTML = `
        <div class="featured-gallery">
          <div class="gallery-scroll" id="gallery-${featured.name}">
            ${allImages.map((src, i) => `<img src="${src}" alt="${featured.title} visualization ${i + 1}" loading="lazy" />`).join('')}
          </div>
          ${allImages.length > 1 ? `
          <div class="gallery-nav">
            <button class="gallery-btn" onclick="scrollGallery('${featured.name}', -1)" aria-label="Previous">&#8249;</button>
            <span class="gallery-count">${allImages.length} visualizations</span>
            <button class="gallery-btn" onclick="scrollGallery('${featured.name}', 1)" aria-label="Next">&#8250;</button>
          </div>` : ''}
        </div>`;
    } else {
      // Fallback: show a code preview or placeholder
      galleryHTML = `<div class="featured-placeholder"><span>&#128202;</span> View visualizations on <a href="${repo.html_url}" target="_blank" rel="noreferrer">GitHub</a></div>`;
    }

    const bulletsHTML = `<ul class="repo-bullets featured-bullets">${featured.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;

    const sizeKB = repo.size;
    const sizeLabel = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    const langColor = LANG_COLORS[repo.language] || '#8b8b8b';

    card.innerHTML = `
      <div class="featured-content">
        <div class="featured-text">
          <div class="repo-header">
            <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${featured.title}</a></h3>
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
}

function scrollGallery(name, dir) {
  const el = document.getElementById(`gallery-${name}`);
  if (!el) return;
  const scrollAmount = el.clientWidth * 0.8;
  el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
}

async function fetchRepos() {
  const grid = document.getElementById('repo-grid');
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`
    );
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    // Filter out profile repo and forks (keep only originals), skip .github.io
    const filtered = repos.filter(
      (r) => !r.fork && r.name !== GITHUB_USER && r.name !== `${GITHUB_USER}.github.io`
    );

    // Compute stats
    const allRepos = repos.filter((r) => r.name !== GITHUB_USER);
    const languages = [...new Set(allRepos.map((r) => r.language).filter(Boolean))];
    const totalStars = allRepos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = allRepos.reduce((s, r) => s + r.forks_count, 0);

    document.getElementById('stat-repos').textContent = allRepos.length;
    document.getElementById('stat-languages').textContent = languages.length;
    document.getElementById('stat-stars').textContent = totalStars;
    document.getElementById('stat-forks').textContent = totalForks;

    // Language breakdown bar
    buildLanguageChart(allRepos);

    // Activity timeline
    buildActivityTimeline(allRepos);

    // Render featured projects first
    const featuredNames = FEATURED_REPOS.map((f) => f.name);
    await renderFeaturedProjects(repos);

    // Filter out featured repos from regular grid
    const regular = filtered.filter((r) => !featuredNames.includes(r.name));

    // Render cards with per-repo language bars and bullets
    grid.innerHTML = '';
    const langRequests = regular.map((repo) =>
      fetch(repo.languages_url)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({}))
    );
    const langResults = await Promise.all(langRequests);

    regular.forEach((repo, i) => {
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

      // Per-repo language bar
      const repoLangs = langResults[i];
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

      // Bullet points
      const details = REPO_DETAILS[repo.name];
      let bulletsHTML = '';
      if (details && details.bullets) {
        bulletsHTML = `<ul class="repo-bullets">${details.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
      }

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
  } catch (err) {
    grid.innerHTML = `<p class="loading-text">Could not load repositories. <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">Visit GitHub profile</a></p>`;
  }
}

function buildLanguageChart(repos) {
  const langCount = {};
  repos.forEach((r) => {
    if (r.language) {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
  });

  const total = Object.values(langCount).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  const chart = document.getElementById('language-chart');

  // Bar
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

  // Legend
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

  // Group repos by month of last push
  const monthMap = {};
  repos.forEach((r) => {
    const d = new Date(r.pushed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  });

  // Get last 12 months
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

fetchRepos();
