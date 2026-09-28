import { workspaceVersion } from "@/internal/changeset/workspace-version";
import { readFile } from "@/internal/config/read-file";
import { runCommand } from "@/internal/verify/run-command";
import type { Reader } from "@/config/config.types";
import type { Runner } from "@/verify/verify.types";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config version`: the release job's `version` script.
 *
 * Runs `changeset version`, then — with `repoConfig.changeset.syncRootVersionFrom`
 * — copies that package's new version into the root `package.json`, then
 * `pnpm install --lockfile-only`. The last step is the point: `changeset
 * version` rewrites the `workspace:` ranges apps and examples use, which
 * leaves `pnpm-lock.yaml` stale, and the version commit then fails every
 * `--frozen-lockfile` install on main. Run from the repository root. Returns
 * the process exit code.
 */
export const versionCommand = ({
  root = process.cwd(),
  run = runCommand,
  read = readFile,
  write = writeFileSync,
}: {
  root?: string;
  run?: Runner;
  read?: Reader;
  write?: (file: string, contents: string) => void;
} = {}): number => {
  try {
    const path = join(root, "package.json");
    const config = readConfig(root, read).changeset ?? {};
    run("pnpm exec changeset version");
    const source = config.syncRootVersionFrom;
    if (source !== undefined) {
      // The config came from this file, so it is there to read.
      const manifest = JSON.parse(String(read(path))) as Record<string, unknown>;
      const version = workspaceVersion(root, source, read, config.roots);
      if (manifest.version === version) {
        console.log(`version: the root is already at ${version}`);
      } else {
        write(path, `${JSON.stringify({ ...manifest, version }, null, 2)}\n`);
        console.log(`version: the root follows ${source} to ${version}`);
      }
    }
    run("pnpm install --lockfile-only");
    return 0;
  } catch (failure) {
    console.error(`version failed — ${(failure as Error).message}`);
    return 1;
  }
};
