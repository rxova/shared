import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Reader } from "@/config/config.types";
import type { PackageManifest } from "@/manifest/manifest.types";

/**
 * The version of every named, versioned workspace package under `roots`, by
 * name. A directory without a manifest, a name or a version is left out.
 */
export const workspaceVersions = (
  root: string,
  read: Reader,
  roots: readonly string[] = ["packages", "apps"],
): Record<string, string> => {
  const versions: Record<string, string> = {};
  for (const top of roots) {
    const dir = join(root, top);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir).sort()) {
      const text = read(join(dir, entry, "package.json"));
      if (text === undefined) continue;
      const { name, version } = JSON.parse(text) as PackageManifest;
      if (name !== undefined && version !== undefined) versions[name] = version;
    }
  }
  return versions;
};
