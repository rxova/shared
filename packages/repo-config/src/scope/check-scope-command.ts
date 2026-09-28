import { readFile } from "@/internal/config/read-file";
import { gitReader } from "@/internal/scope/git-reader";
import type { Reader } from "@/config/config.types";
import type { Git, Scope } from "@/scope/scope.types";
import { appendFileSync } from "node:fs";
import { readConfig } from "@/config/read-config";
import { decideScope } from "@/scope/decide-scope";

/**
 * `rxova-repo-config check-scope`: reports what the range changed, as the
 * outputs the rest of the workflow gates on. `code-changed` is false for a
 * release commit or a documentation-only range, `docs-only` is true for the
 * latter, and `docs-changed` is true when the docs site's sources moved. What
 * counts as documentation is `repoConfig.scope`. Reads `BASE_SHA` and
 * `HEAD_SHA`; writes to `GITHUB_OUTPUT` when set. Always exits 0: an invalid
 * `repoConfig` is reported and runs everything, the answer that cannot hide a
 * failure.
 */
export const checkScopeCommand = (
  env: NodeJS.ProcessEnv = process.env,
  {
    run = gitReader,
    root = process.cwd(),
    read = readFile,
  }: { run?: Git; root?: string; read?: Reader } = {},
): number => {
  let verdict: Scope;
  try {
    verdict = decideScope(env.BASE_SHA, env.HEAD_SHA, run, readConfig(root, read).scope);
  } catch (failure) {
    console.error(`check-scope: ${(failure as Error).message}`);
    verdict = {
      codeChanged: true,
      docsOnly: false,
      docsChanged: true,
      reason: "invalid repoConfig, running everything",
    };
  }

  const outputs = [
    `code-changed=${String(verdict.codeChanged)}`,
    `docs-only=${String(verdict.docsOnly)}`,
    `docs-changed=${String(verdict.docsChanged)}`,
  ];
  console.log(`check-scope: ${verdict.reason}`);
  for (const output of outputs) console.log(`check-scope: ${output}`);

  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, outputs.map((o) => `${o}\n`).join(""));
  return 0;
};
