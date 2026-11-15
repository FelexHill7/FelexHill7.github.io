import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { site } from "@/data/portfolio";
import { fill, getLiveStats } from "@/lib/live";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const live = await getLiveStats();
  const description = fill(site.description, live);
  return {
    title: `${site.name} — AI Engineer & Software Developer`,
    description,
    metadataBase: new URL(site.url),
    openGraph: {
      title: `${site.name} — AI Engineer & Software Developer`,
      description,
      type: "website",
    },
  };
}

// Hides buildable layers before first paint so SSR'd text never flashes
// before the swarm "types" it.
const antiFlash = `document.documentElement.classList.add('build-pending')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlash }} />
      </head>
      <body className="bg-bg font-sans text-fg">{children}</body>
    </html>
  );
}
