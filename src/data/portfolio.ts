/**
 * All site copy lives here. Edit freely — components only read from this file.
 * Items marked TODO are placeholders waiting for your real details.
 *
 * Auto-updating values (see src/lib/live.ts, refreshed daily on the server):
 *   {yearOrdinal} / {YearOrdinal} in any text → "third" / "Third", from `profile.programStart`
 *   stats with `auto` → computed instead of hard-coded
 */

export const profile = {
  githubUser: "FelexHill7",
  /** First day of your degree; YEAR rolls over every anniversary of this date. */
  programStart: "2024-09-01",
  programYears: 4,
};

export const site = {
  name: "Felex Hill",
  location: "Toronto, Canada",
  url: "https://felexhill.vercel.app",
  description:
    "Felex Hill — {yearOrdinal}-year Computer Science student at York University and AI engineer building ML-powered products.",
};

export const links = {
  github: "https://github.com/FelexHill7",
  linkedin: "https://www.linkedin.com/in/felex-hill-1b530b330/", 
  email: "helex.fill28@gmail.com", // TODO: add your email
  resume: "/FelexHill_Resume_YU.pdf", // file lives in /public
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
  { label: "Resume", href: links.resume },
];

export const hero = {
  eyebrow: "AI ENGINEER · SOFTWARE DEVELOPER",
  headline: ["Products that", "ship."],
  intro:
    "I'm a {yearOrdinal}-year Computer Science student at York University, specializing in software development. I build AI and software products: training the models, shipping the apps around them, and making sure they hold up in the real world.",
  primaryCta: { label: "View my work", href: "#work" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
  stats: [
    { label: "INTERNSHIPS", value: "2" },
    { label: "PROJECTS", auto: "projects" }, // your public, non-fork GitHub repos
    { label: "YEAR", auto: "year" }, // year of study, from profile.programStart
    { label: "SINCE", auto: "since" }, // year you joined GitHub
  ] as Stat[],
};

export type Stat = { label: string; value?: string; auto?: "projects" | "year" | "since" };

export type Project = {
  slug: string;
  title: string;
  role: string;
  year: string;
  oneLiner: string;
  description: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** Shown where links would be, e.g. "Private repository" for closed-source work. */
  note?: string;
  live?: boolean;
  /**
   * GitHub repo name to pull images from. Defaults to the repo in the GitHub link.
   * Images are found by scripts/build-project-media.js (runs daily in GitHub Actions).
   */
  repo?: string;
  /** Manual screenshot override, e.g. "/projects/closetai.png" in /public. */
  image?: string;
  accent?: string;
};

export type ProjectImage = { src: string; alt: string };

/** A project with its images resolved (manual override, repo images, or none → mock frame). */
export type ResolvedProject = Project & { images: ProjectImage[] };

export const projects: Project[] = [
  {
    slug: "closetai",
    title: "ClosetAI",
    role: "Data Scientist / Lead Engineer",
    year: "2026",
    oneLiner: "AI outfit generation from the clothes you already own",
    description:
      "An end-to-end app that generates outfits from your existing closet. I built it with Next.js and TypeScript, designed a RAG recommendation pipeline over each user's closet using embeddings and semantic retrieval, and automated clothing tagging with the OpenAI API using structured outputs. The backend is REST APIs in Node.js on PostgreSQL with Clerk auth and cloud storage, deployed on Vercel.",
    stack: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Supabase", "OpenAI API", "Vercel"],
    // private codebase (someone else's product), so no public links
    links: [],
    note: "Private repository",
    live: true,
    accent: "#2f6bff",
  },
  {
    slug: "nano-infer",
    title: "nano-infer",
    role: "Solo build",
    year: "2026",
    oneLiner: "From-scratch LLM inference engine, 1.87× faster decoding",
    description:
      "A PyTorch LLM inference engine built from first principles: causal attention with multi-head, grouped-query and multi-query variants in one module, RoPE, RMSNorm + SwiGLU decoder blocks and KV-cached sampling. An append-only KV cache and optimized decoding raised CPU throughput 1.87× (78 → 146 tok/s), with numerical parity against PyTorch's scaled-dot-product attention verified by automated tests.",
    stack: ["Python", "PyTorch", "Transformers", "RoPE", "KV Cache", "pytest"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/nano-infer" }],
    accent: "#a764ff",
  },
  {
    slug: "weather-trend-forecasting",
    title: "Weather Trend Forecasting",
    role: "Solo build",
    year: "2026",
    oneLiner: "Ensemble forecasting that cut RMSE 47.7%",
    description:
      "A time-series forecasting pipeline on 139K rows × 41 features from the Global Weather Repository, with 1–30 day lag and rolling-window features. SARIMA, Prophet and XGBoost are ensembled by inverse-RMSE weighting, reducing forecast RMSE 47.7% over the baseline. Multivariate anomalies are detected with Isolation Forest and LOF and explored through PCA and an interactive Folium map.",
    stack: ["Python", "Pandas", "scikit-learn", "XGBoost", "statsmodels", "Prophet", "Folium"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/weatherTrendForecasting" }],
    accent: "#3ad7ff",
  },
  {
    slug: "cartpole-rl",
    title: "Reinforcement Learning on CartPole",
    role: "Solo build",
    year: "2026",
    oneLiner: "REINFORCE, DQN and Actor-Critic, compared head to head",
    description:
      "REINFORCE, DQN and Actor-Critic implemented from scratch on a shared trainer, so the comparison is controlled. DQN uses a replay buffer and target network, and REINFORCE is stabilized with return normalization and gradient clipping. A CLI runs multi-seed, 500+ episode experiments and generates learning curves and rollout visualizations automatically.",
    stack: ["Python", "PyTorch", "Gymnasium", "Matplotlib"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/cartpole-rl-comparison" }],
    accent: "#ffd23f",
  },
  {
    slug: "vision-transformer",
    title: "Vision Transformer (ViT)",
    role: "Solo build",
    year: "2026",
    oneLiner: "63.99% on CIFAR-100 with 20× fewer parameters than ViT-Base",
    description:
      "A Vision Transformer built from scratch with patch embeddings and multi-head self-attention, trained with AdamW, a cosine learning-rate schedule, Mixup and mixed precision. It reaches 63.99% top-1 accuracy on CIFAR-100, beating the original ViT-Base (~55%) with 20× fewer parameters.",
    stack: ["Python", "PyTorch", "CIFAR-100", "AMP"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/visionTransformer" }],
    accent: "#ff3b3b",
  },
  {
    slug: "rxread",
    title: "RxRead",
    role: "Solo build",
    year: "2026",
    oneLiner: "Handwriting OCR, four backends side by side",
    description:
      "Web app that compares four handwriting-OCR backends on the same input: a from-scratch ResNet-18 + BiLSTM + CTC CRNN (~24% CER), Microsoft TrOCR at line and page level, and Gemini Vision, with an optional prescription-mode post-processor.",
    stack: ["PyTorch", "Transformers", "Flask", "Google GenAI"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/RxRead" }],
    accent: "#ff7a1a",
  },
  {
    slug: "citation-knowledge-agent",
    title: "Citation Knowledge Agent",
    role: "Solo build",
    year: "2026",
    oneLiner: "Agent that maps a paper's citation graph",
    description:
      "Starting from a seed arXiv paper, the agent discovers references through OpenAlex, classifies them (foundation / baseline / other) with Gemini, stores the graph, and answers questions over it through MCP tools.",
    stack: ["Python", "Gemini", "OpenAlex", "MCP", "SQLite"],
    links: [
      { label: "GitHub", href: "https://github.com/FelexHill7/citation-knowledge-agent" },
    ],
    accent: "#22d37f",
  },
  {
    slug: "cancerdetection",
    title: "Breast Cancer Detection",
    role: "ML pipeline",
    year: "2025",
    oneLiner: "Benign vs. malignant classification at 96%+ accuracy",
    description:
      "End-to-end ML pipeline on clinical tumour data: one-hot encoding and standardization, SVM, logistic regression and neural-network classifiers all above 96% accuracy with F1 > 0.95, and PCA-based 2D/3D decision-boundary visualizations.",
    stack: ["Python", "scikit-learn", "TensorFlow", "Pandas"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/cancerdetection" }],
    accent: "#ff4fa3",
  },
];

export const work = {
  eyebrow: "[01] WORK",
  headline: ["Proof lives in", "what I've shipped."],
};

export const more = {
  eyebrow: "[02] MORE WORK",
  headline: ["There's more", "where that came from."],
  intro:
    "The projects above are the highlights. My resume has the full picture, and GitHub has everything else I've built, from coursework to late-night experiments.",
  resume: {
    title: "Resume",
    body: "Experience, education and skills on one page.",
    open: "Open resume",
    download: "Download PDF",
  },
  github: {
    title: "GitHub",
    body: "Public repositories, from coursework to research experiments, updated as I ship.",
    cta: "View all repositories",
  },
  recentLabel: "RECENTLY ON GITHUB",
  /** How many other repos to list (excludes ones already featured in Work). */
  recentCount: 6,
};

export const experienceSection = {
  eyebrow: "[03] EXPERIENCE",
  headline: ["Where I've", "worked."],
};

export const experience: {
  company: string;
  role: string;
  period: string;
  location?: string;
  stack?: string[];
  bullets: string[];
}[] = [
  {
    company: "Product Management Accelerator (PMA)",
    role: "AI Engineer Intern",
    period: "Aug – Nov 2026",
    bullets: [
      "Built and evaluated LLM-powered features end to end, from prompt and retrieval design to shipped product surfaces.", // TODO: replace with your real PMA work (not on your resume yet)
      "Owned data pipelines and evaluation harnesses so model changes could be measured before release.",
    ],
  },
  {
    company: "ClosetAI",
    role: "Data Scientist / Lead Engineer",
    period: "Mar – Dec 2026",
    stack: ["TypeScript", "SQL", "React", "Next.js", "Node.js", "PostgreSQL", "Supabase", "Clerk", "AWS S3", "Cloudflare R2", "Vercel"],
    bullets: [
      "Built and deployed an end-to-end AI outfit generation app with React, Next.js and TypeScript, working from users' existing closets.",
      "Designed a RAG recommendation pipeline using embeddings, semantic retrieval and vector databases over user closet data.",
      "Integrated the OpenAI API to automate clothing tagging, using structured outputs and typed error handling for reliability.",
      "Built REST APIs in Node.js with PostgreSQL, Clerk auth and cloud storage on AWS S3 / Cloudflare R2, deployed on Vercel.",
    ],
  },
  {
    company: "Vybe",
    role: "Software Developer Intern",
    period: "Feb – Apr 2026",
    stack: ["Java", "Spring Boot", "Hibernate", "JUnit", "React", "TypeScript", "MySQL", "Docker", "Gemini API", "Google Cloud"],
    bullets: [
      "Built a scalable AI-powered food-delivery platform with personalized recommendations and real-time, location-based offers.",
      "Integrated the Google Gemini API for LLM-powered features, prompt engineering and API-based inference.",
      "Developed Spring Boot RESTful microservices and API gateways with OAuth2/JWT for secure inter-service communication.",
      "Collaborated with a cross-functional team in Agile sprints, iterating on features based on code reviews and feedback.",
    ],
  },
];

export const education = [
  {
    school: "York University",
    /** Logo tile in /public/logos. `logoFill` makes the logo fill the tile edge to edge. */
    logo: "/logos/york-university.png",
    logoFill: false,
    degree: "Hons. B.A.Sc., Computer Science for Software Development",
    period: "2024 – 2028",
    detail: "Lassonde School of Engineering · {YearOrdinal} year · GPA 3.8/4.0 · Toronto, ON",
    coursework: [
      "Machine Learning",
      "Data Science and Application",
      "Design and Analysis of Algorithms",
      "Data Structures & Algorithms",
      "Object-Oriented Programming",
      "Software Design",
      "Cloud Computing",
    ],
  },
  {
    school: "Tsinghua University",
    logo: "/logos/tsinghua-university.png",
    logoFill: false,
    degree: "International Summer School, Generative AI",
    period: "July 2026",
    detail: "GPA 4.0/4.0 · Beijing, China",
    coursework: [
      "Deep Reinforcement Learning",
      "Transformer-based NLP",
      "Diffusion Models",
      "Training & Inference",
      "Data Science for LLMs",
      "RAG Systems",
      "LLMs for Legal Intelligence",
      "Generative AI for Medicine",
    ],
  },
];

export const about = {
  eyebrow: "[04] ABOUT",
  educationEyebrow: "[05] EDUCATION",
  skillsEyebrow: "STACK",
  headline: ["Applied AI,", "built properly."],
  body: [
    "I'm a {yearOrdinal}-year Computer Science student at York University (Software Development specialization), based in Toronto.",
    "I care most about applied AI and medtech: taking a model from a notebook to something a person can actually use, and making it reliable along the way.",
  ],
  skills: [
    { group: "Languages", items: ["Python", "SQL", "C++", "Java", "TypeScript", "JavaScript", "Bash"] },
    { group: "ML / AI", items: ["PyTorch", "scikit-learn", "TensorFlow", "XGBoost", "statsmodels", "Prophet", "Gymnasium", "Reinforcement Learning", "LLMs", "RAG"] },
    { group: "LLM tools", items: ["OpenAI API", "Google Gemini API", "MCP", "Elasticsearch"] },
    { group: "Data", items: ["NumPy", "Pandas", "Matplotlib", "Folium", "Feature Engineering", "Time-Series Analysis", "Anomaly Detection"] },
    { group: "Frameworks", items: ["Flask", "FastAPI", "React", "Next.js", "Node.js", "Spring Boot", "JUnit", "REST APIs"] },
    { group: "Cloud / DevOps", items: ["Docker", "Kubernetes", "Git", "AWS (S3)", "Google Cloud", "Vercel", "Prometheus", "Grafana"] },
    { group: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Supabase"] },
  ],
};

export const contact = {
  eyebrow: "[06] CONTACT",
  headline: "Have a hard problem to build?",
  subline:
    "I'm open to internships, research collaborations and ambitious side projects in applied AI and medtech.",
  emailCta: "Email me",
  githubCta: "Follow on GitHub",
};

export const footer = {
  bio: "Felex Hill — CS student and AI engineer in Toronto, building ML-powered products that ship.",
  columns: [
    {
      title: "Work",
      links: projects.slice(0, 4).map((p) => ({ label: p.title, href: `#${p.slug}` })),
    },
    {
      title: "Resources",
      links: [
        { label: "Resume", href: links.resume },
        { label: "GitHub", href: links.github },
        { label: "LinkedIn", href: links.linkedin },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "Email", href: `mailto:${links.email}` },
        { label: site.location, href: "#contact" },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Felex Hill. Assembled live by a swarm of agents.`,
};
