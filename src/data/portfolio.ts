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
  location: "Toronto / Mississauga, Canada",
  url: "https://felexhill7.github.io",
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
    oneLiner: "AI outfit-recommendation app",
    description:
      "An outfit-recommendation app that learns your wardrobe and your taste. I led the engineering and the modelling: garment tagging, an embedding-based recommender, and the mobile-first app that puts it in front of users.",
    stack: ["Python", "PyTorch", "FastAPI", "React Native", "PostgreSQL"],
    links: [
      { label: "GitHub", href: "https://github.com/FelexHill7" }, // TODO: repo link
    ],
    live: true,
    accent: "#2f6bff",
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
    slug: "nano-infer",
    title: "nano-infer",
    role: "Solo build",
    year: "2026",
    oneLiner: "From-scratch LLM inference engine",
    description:
      "A PyTorch inference engine written from first principles: MHA/GQA/MQA in one attention module, RoPE, an append-only KV cache with numerical parity against scaled_dot_product_attention, RMSNorm + SwiGLU decoder blocks, and KV-cached greedy/top-k sampling. Trains a 1M-parameter GQA transformer end to end.",
    stack: ["Python", "PyTorch", "CUDA"],
    links: [{ label: "GitHub", href: "https://github.com/FelexHill7/nano-infer" }],
    accent: "#a764ff",
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

export const experienceSection = {
  eyebrow: "[02] EXPERIENCE",
  headline: ["Where I've", "worked."],
};

export const experience = [
  {
    company: "Product Management Accelerator (PMA)",
    role: "AI Engineer Intern",
    period: "Aug – Nov 2026",
    location: "Remote",
    bullets: [
      "Built and evaluated LLM-powered features end to end, from prompt and retrieval design to shipped product surfaces.", // TODO: refine
      "Owned data pipelines and evaluation harnesses so model changes could be measured before release.",
    ],
  },
  {
    company: "Vybe",
    role: "Software Development Intern",
    period: "Feb – Apr 2026",
    location: "Toronto, ON",
    bullets: [
      "Shipped full-stack features across a TypeScript codebase with a focus on performance and reliability.", // TODO: refine
      "Worked in a small team with code review, CI and weekly releases.",
    ],
  },
];

export const education = [
  {
    school: "York University",
    degree: "B.Sc. Computer Science — Software Development specialization",
    period: "2024 – present", // TODO: confirm start year
    detail: "{YearOrdinal} year. Toronto, ON.",
  },
  {
    school: "Tsinghua University International Summer School",
    degree: "Generative AI",
    period: "July 2026",
    detail:
      "Deep learning, generative AI, large language models, reinforcement learning, training and inference.",
  },
];

export const about = {
  eyebrow: "[03] ABOUT",
  educationEyebrow: "[04] EDUCATION",
  skillsEyebrow: "STACK",
  headline: ["Applied AI,", "built properly."],
  body: [
    "I'm a {yearOrdinal}-year Computer Science student at York University (Software Development specialization), based in Toronto and Mississauga.",
    "I care most about applied AI and medtech: taking a model from a notebook to something a person can actually use, and making it reliable along the way.",
  ],
  skills: [
    { group: "ML / AI", items: ["PyTorch", "TensorFlow", "scikit-learn", "Transformers", "LLMs & RAG", "RL"] },
    { group: "Software", items: ["TypeScript", "Python", "Java", "Next.js", "React", "Node.js"] },
    { group: "Infra & data", items: ["PostgreSQL", "Docker", "GitHub Actions", "FastAPI", "Flask"] },
  ],
};

export const contact = {
  eyebrow: "[05] CONTACT",
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
