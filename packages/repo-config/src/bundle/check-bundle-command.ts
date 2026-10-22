import { bannedHits } from "@/internal/bundle/banned-hits";
import { entryChunks } from "@/internal/bundle/entry-chunks";
import { readFile } from "@/internal/config/read-file";
import type { Reader } from "@/config/config.types";
import { join } from "node:path";
import { readPackageConfig } from "@/config/read-package-config";

/**
 * `rxova-repo-config check-bundle`: a built entry, and every chunk it reaches,
 * mentions none of the identifiers `repoConfig.bundle.banned` lists
 * (`process` by default).
 *
 * A free `process` in a browser entry is not a runtime error waiting to
 * happen — it is a build error in somebody else's repository. Turbopack
 * resolves the reference to `node:process` and refuses to put it in a service
 * worker or edge chunk, so the consumer's build fails on an import they never
 * made. The entries are `repoConfig.bundle.entries` (`dist/index.js` by
 * default); a subpath that wants the reference simply is not listed. Returns
 * the process exit code.
 */
export const checkBundleCommand = (
  dir: string = process.cwd(),
  read: Reader = readFile,
): number => {
  try {
    const { entries = ["dist/index.js"], banned = ["process"] } =
      readPackageConfig(dir, read).bundle ?? {};
    const missing = entries.filter((entry) => read(join(dir, entry)) === undefined);
    if (missing.length > 0) {
      console.error(`check-bundle: build first — no ${missing.join(", ")} in ${dir}`);
      return 1;
    }
    const files = [...new Set(entries.flatMap((entry) => entryChunks(dir, entry, read)))];
    const hits = files.flatMap((file) => {
      const code = read(join(dir, file));
      return code === undefined ? [] : bannedHits(file, code, banned);
    });
    if (hits.length > 0) {
      console.error(
        [
          "check-bundle: these entries reach an identifier a bundler would have to resolve:",
          ...hits.map(({ file, line, name }) => `  ${file}:${String(line)} ${name}`),
        ].join("\n"),
      );
      return 1;
    }
    console.log(`check-bundle: ${String(files.length)} file(s) free of ${banned.join(", ")}`);
    return 0;
  } catch (failure) {
    console.error(`check-bundle failed — ${(failure as Error).message}`);
    return 1;
  }
};
