import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [60, 75],
    // Project images found in your GitHub repos (see scripts/build-project-media.js).
    // Anything else is shown unoptimized, see ProjectFrame.
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/FelexHill7/**", search: "" },
      { protocol: "https", hostname: "user-images.githubusercontent.com", search: "" },
      { protocol: "https", hostname: "github.com", pathname: "/user-attachments/assets/**", search: "" },
    ],
  },
};

export default nextConfig;
