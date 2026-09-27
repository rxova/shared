import { git } from '@rxova/helpers';
import type { Git } from './scope.types.js';
import { appendFileSync } from 'node:fs';
import { decideScope } from './decide-scope.js';

/**
 * `rxova-tooling check-scope`: reports whether the pushed range changed code,
 * as the `code-changed` output the rest of the workflow gates on. Reads
 * `BASE_SHA` and `HEAD_SHA`; writes to `GITHUB_OUTPUT` when set. Always exits 0.
 */
export const checkScopeCommand = (
  env: NodeJS.ProcessEnv = process.env,
  { run = git }: { run?: Git } = {},
): number => {
  const verdict = decideScope(env.BASE_SHA, env.HEAD_SHA, run);

  console.log(`check-scope: ${verdict.reason}`);
  console.log(`check-scope: code-changed=${String(verdict.codeChanged)}`);

  if (env.GITHUB_OUTPUT) {
    appendFileSync(env.GITHUB_OUTPUT, `code-changed=${String(verdict.codeChanged)}\n`);
  }
  return 0;
};
