import { appendFileSync } from "node:fs";
import { runTool } from "@/internal/init/run-tool";
import { LOCKFILE_REPAIRS } from "@/internal/lockfile/lockfile-repairs";
import { runCommand } from "@/internal/verify/run-command";
import type { Tool } from "@/init/init.types";
import type { Runner } from "@/verify/verify.types";

/**
 * `rxova-repo-config fix-lockfile`: repairs `pnpm-lock.yaml` after a
 * dependency bump that only edited a manifest, as Dependabot does in a pnpm
 * workspace. Runs `pnpm install --lockfile-only --no-frozen-lockfile
 * --ignore-scripts`, then `pnpm dedupe --ignore-scripts`, then asks git
 * whether the lockfile differs from the commit (`git status --porcelain --
 * pnpm-lock.yaml`), so an install the workflow ran before this command counts
 * too. Prints one summary line and, when `GITHUB_OUTPUT` is set, appends
 * `changed=true` or `changed=false` to it, so the workflow commits only when
 * there is something to commit. Run from the repository root. Returns the
 * process exit code: 1 when a pnpm or git command fails.
 */
export const fixLockfileCommand = ({
  run = runCommand,
  tool = runTool,
  env = process.env,
  append = appendFileSync,
}: {
  run?: Runner;
  tool?: Tool;
  env?: NodeJS.ProcessEnv;
  append?: (file: string, contents: string) => void;
} = {}): number => {
  for (const command of LOCKFILE_REPAIRS) {
    try {
      run(command);
    } catch (failure) {
      console.error(`fix-lockfile failed — \`${command}\`: ${(failure as Error).message}`);
      return 1;
    }
  }
  let status: string;
  try {
    status = tool("git", ["status", "--porcelain", "--", "pnpm-lock.yaml"]);
  } catch (failure) {
    console.error(`fix-lockfile failed — \`git status\`: ${(failure as Error).message}`);
    return 1;
  }
  const changed = status !== "";
  console.log(
    changed
      ? "fix-lockfile: pnpm-lock.yaml changed; commit it"
      : "fix-lockfile: pnpm-lock.yaml was already up to date",
  );
  if (env.GITHUB_OUTPUT) append(env.GITHUB_OUTPUT, `changed=${String(changed)}\n`);
  return 0;
};
