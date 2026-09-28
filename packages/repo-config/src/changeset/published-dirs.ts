import type { PackageManifest } from "@/manifest/manifest.types";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The directory names under `packages/` whose manifest is not private: the
 * packages that publish, read from the manifests rather than listed, so a new
 * package is covered the moment it exists.
 */
export const publishedDirs = (root: string): string[] => {
  const packages = join(root, "packages");
  if (!existsSync(packages)) return [];
  return readdirSync(packages).filter((dir) => {
    const manifest = join(packages, dir, "package.json");
    if (!existsSync(manifest)) return false;
    return (JSON.parse(readFileSync(manifest, "utf8")) as PackageManifest).private !== true;
  });
};
