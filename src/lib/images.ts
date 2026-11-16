/** next/image can only optimise hosts allowed in next.config.ts; anything else is shown as-is. */
const OPTIMIZABLE =
  /^(\/(?!\/)|https:\/\/raw\.githubusercontent\.com\/FelexHill7\/|https:\/\/user-images\.githubusercontent\.com\/|https:\/\/github\.com\/user-attachments\/assets\/)[^?]*$/;

export function canOptimize(src: string): boolean {
  return OPTIMIZABLE.test(src);
}

/**
 * Where "view source" should go for a project image:
 * - repo files (raw.githubusercontent.com) → the file's page on github.com
 * - plots extracted from notebooks (/projects/auto/...) → the project's repo
 * - anything else → the original image
 */
export function sourceLink(src: string, repoUrl?: string): { href: string; label: string } {
  const raw = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/.exec(src);
  if (raw) return { href: `https://github.com/${raw[1]}/${raw[2]}/blob/${raw[3]}/${raw[4]}`, label: "View on GitHub" };
  if (src.startsWith("/projects/auto/") && repoUrl) return { href: repoUrl, label: "View repo on GitHub" };
  return { href: src, label: "Open original" };
}
