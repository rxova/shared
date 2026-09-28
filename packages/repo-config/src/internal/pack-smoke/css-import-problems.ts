import { dirname, join, normalize } from "node:path/posix";
import type { PackageManifest } from "@/manifest/manifest.types";
import { exportTargets } from "@/internal/pack-smoke/export-targets";
import { readIfPresent } from "@/internal/pack-smoke/read-if-present";

/**
 * Every relative `@import` in an exported stylesheet that points at nothing in
 * the tarball, as `target: @import 'specifier'`. Consumers import these
 * stylesheets, so a dangling import fails their build rather than ours. Bare
 * imports (`@import 'normalize.css'`) are the consumer resolver's business;
 * wildcard targets are skipped. `read` reads a file inside the installed package.
 */
export const cssImportProblems = (
  manifest: PackageManifest,
  contents: readonly string[],
  read: (path: string) => string,
): string[] =>
  exportTargets(manifest)
    .filter((target) => target.endsWith(".css") && !target.includes("*"))
    .flatMap((target) => {
      const css = readIfPresent(read, target);
      if (css === undefined) return [];
      return [...css.matchAll(/@import\s+(?:url\(\s*)?['"](\.{1,2}\/[^'"]+)['"]/g)]
        .map(([, specifier = ""]) => specifier)
        .filter((specifier) => !contents.includes(normalize(join(dirname(target), specifier))))
        .map((specifier) => `${target}: @import '${specifier}'`);
    });
