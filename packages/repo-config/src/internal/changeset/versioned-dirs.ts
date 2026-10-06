import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { publishedDirs } from "@/changeset/published-dirs";

/**
 * The directory names under `packages/` that `check-changeset` holds to a
 * changeset: the published ones, or with `includePrivate` every package with a
 * manifest, for a repository that versions its private packages.
 */
export const versionedDirs = (root: string, includePrivate: boolean): string[] => {
  if (!includePrivate) return publishedDirs(root);
  const packages = join(root, "packages");
  if (!existsSync(packages)) return [];
  return readdirSync(packages).filter((dir) => existsSync(join(packages, dir, "package.json")));
};
