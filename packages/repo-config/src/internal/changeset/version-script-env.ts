import { nonEmpty } from "@/internal/changeset/non-empty";

/**
 * The environment the version script runs in: `env`, with `GITHUB_TOKEN` taken
 * from `GH_TOKEN` when only that is set. `gh` reads `GH_TOKEN`, while the
 * changelog preset reads pull request and author links through `GITHUB_TOKEN`,
 * so a caller sets one token.
 */
export const versionScriptEnv = (env: NodeJS.ProcessEnv): NodeJS.ProcessEnv => {
  const token = nonEmpty(env.GH_TOKEN);
  if (token === undefined || nonEmpty(env.GITHUB_TOKEN) !== undefined) return env;
  return { ...env, GITHUB_TOKEN: token };
};
