import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { readFile } from "@/internal/config/read-file";
import { LOCKFILE_REPAIRS } from "@/internal/lockfile/lockfile-repairs";
import { runCommand } from "@/internal/verify/run-command";
import type { Reader } from "@/config/config.types";
import type { Runner } from "@/verify/verify.types";

/**
 * `rxova-repo-config fix-lockfile`: repairs `pnpm-lock.yaml` after a
 * dependency bump that only edited a manifest, as Dependabot does in a pnpm
 * workspace. Runs `pnpm install --lockfile-only --no-frozen-lockfile
 * --ignore-scripts`, then `pnpm dedupe --ignore-scripts`, and compares the
 * lockfile's contents before and after. Prints one summary line and, when
 * `GITHUB_OUTPUT` is set, appends `changed=true` or `changed=false` to it, so
 * the workflow commits only when there is something to commit. Run from the
 * repository root. Returns the process exit code: 1 when a pnpm command fails.
 */
export const fixLockfileCommand = ({
  root = process.cwd(),
  run = runCommand,
  read = readFile,
  env = process.env,
  append = appendFileSync,
}: {
  root?: string;
  run?: Runner;
  read?: Reader;
  env?: NodeJS.ProcessEnv;
  append?: (file: string, contents: string) => void;
} = {}): number => {
  const lockfile = join(root, "pnpm-lock.yaml");
  const before = read(lockfile);
  for (const command of LOCKFILE_REPAIRS) {
    try {
      run(command);
    } catch (failure) {
      console.error(`fix-lockfile failed — \`${command}\`: ${(failure as Error).message}`);
      return 1;
    }
  }
  const changed = read(lockfile) !== before;
  console.log(
    changed
      ? "fix-lockfile: pnpm-lock.yaml changed; commit it"
      : "fix-lockfile: pnpm-lock.yaml was already up to date",
  );
  if (env.GITHUB_OUTPUT) append(env.GITHUB_OUTPUT, `changed=${String(changed)}\n`);
  return 0;
};
