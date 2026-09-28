import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readFile } from "@/internal/config/read-file";
import type { Reader } from "@/config/config.types";
import type { PackageManifest } from "@/manifest/manifest.types";

/**
 * Every directory under `<root>/packages` with a manifest, and the manifest,
 * sorted by directory. `published` keeps only the ones that are not private:
 * the packages that publish, read from the manifests rather than listed, so a
 * new package is covered the moment it exists.
 */
export const packageManifests = (
  root: string,
  { published = false, read = readFile }: { published?: boolean; read?: Reader } = {},
): { dir: string; manifest: PackageManifest }[] => {
  const packages = join(root, "packages");
  if (!existsSync(packages)) return [];
  return readdirSync(packages, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((dir) => {
      const text = read(join(packages, dir, "package.json"));
      if (text === undefined) return [];
      const manifest = JSON.parse(text) as PackageManifest;
      return published && manifest.private === true ? [] : [{ dir, manifest }];
    });
};
