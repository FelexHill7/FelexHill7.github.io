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

    // Render cards
    grid.innerHTML = '';
    filtered.forEach((repo) => {
      const card = document.createElement('article');
      card.className = 'project-card repo-card';

      const langColor = LANG_COLORS[repo.language] || '#8b8b8b';
      const updated = new Date(repo.pushed_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const sizeKB = repo.size;
      const sizeLabel = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

      card.innerHTML = `
        <div class="repo-header">
          <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a></h3>
          ${repo.license ? `<span class="repo-license">${repo.license.spdx_id}</span>` : ''}
        </div>
        <p>${repo.description || 'No description provided.'}</p>
        <div class="repo-stats">
          ${repo.language ? `<span class="repo-lang"><span class="lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
          <span class="repo-stat" title="Stars">&#9733; ${repo.stargazers_count}</span>
          <span class="repo-stat" title="Forks">&#9741; ${repo.forks_count}</span>
          <span class="repo-stat" title="Size">&#128230; ${sizeLabel}</span>
        </div>
        <div class="repo-updated">Updated ${updated}</div>
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

fetchRepos();
