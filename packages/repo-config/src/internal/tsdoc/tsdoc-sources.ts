import { existsSync } from "node:fs";
import { join } from "node:path";
import { packageManifests } from "@/internal/packages/package-manifests";

/** One published package's public entry, and the tsconfig its program is built with. */
export interface TsdocSource {
  name: string;
  entry: string;
  tsconfig: string | undefined;
}

/**
 * The entry of every published package: `entries[name]` when the config names
 * one (a missing file is then an error), else `packages/<dir>/src/index.ts`
 * when it exists. The package's own `tsconfig.json` sets the compiler options,
 * when it has one. Paths are relative to `root`.
 */
export const tsdocSources = (
  root: string,
  entries: Readonly<Record<string, string>> = {},
): TsdocSource[] =>
  packageManifests(root, { published: true }).flatMap(({ dir, manifest }) => {
    const name = manifest.name ?? dir;
    const configured = entries[name];
    const entry = configured ?? `packages/${dir}/src/index.ts`;
    if (!existsSync(join(root, entry))) {
      if (configured === undefined) return [];
      throw new Error(`repoConfig.tsdoc.entries names ${entry} for ${name}, which does not exist`);
    }
    const tsconfig = `packages/${dir}/tsconfig.json`;
    return [{ name, entry, tsconfig: existsSync(join(root, tsconfig)) ? tsconfig : undefined }];
  });
