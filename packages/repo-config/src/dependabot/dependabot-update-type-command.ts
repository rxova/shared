import { appendFileSync } from "node:fs";
import { highestUpdateType } from "@/internal/dependabot/highest-update-type";
import { parseDependabotMetadata } from "@/internal/dependabot/parse-dependabot-metadata";
import { runTool } from "@/internal/init/run-tool";
import type { Tool } from "@/init/init.types";

/**
 * `rxova-repo-config dependabot-update-type`: reads the largest semver update
 * a Dependabot pull request makes from its own commit, the first of
 * `BASE_SHA..HEAD_SHA` (later ones may be a lockfile refresh). Appends
 * `update-type=version-update:semver-<major|minor|patch>` and
 * `dependency-names=<a,b>` to `GITHUB_OUTPUT` when set, and prints both. A
 * commit without Dependabot's metadata, or a range without commits, gives an
 * empty `update-type`, which a workflow reads as "do not auto-merge". Returns
 * the process exit code: 1 when the range is missing or git fails.
 */
export const dependabotUpdateTypeCommand = (
  env: NodeJS.ProcessEnv = process.env,
  {
    tool = runTool,
    append = appendFileSync,
  }: { tool?: Tool; append?: (file: string, contents: string) => void } = {},
): number => {
  const base = env.BASE_SHA;
  const head = env.HEAD_SHA;
  if (!base || !head) {
    console.error("dependabot-update-type: BASE_SHA and HEAD_SHA must be set");
    return 1;
  }
  if (base.startsWith("-") || head.startsWith("-")) {
    console.error("dependabot-update-type: a revision starting with a dash reads as a git option");
    return 1;
  }

  let message = "";
  try {
    const first = tool("git", ["rev-list", "--reverse", `${base}..${head}`]).split("\n")[0] ?? "";
    if (first !== "") message = tool("git", ["log", "-1", "--format=%B", first]);
  } catch (failure) {
    console.error(`dependabot-update-type failed — ${(failure as Error).message}`);
    return 1;
  }

  const { names, updateTypes } = parseDependabotMetadata(message);
  const highest = highestUpdateType(updateTypes);
  const outputs = [
    `update-type=${highest === undefined ? "" : `version-update:semver-${highest}`}`,
    `dependency-names=${names.join(",")}`,
  ];
  for (const output of outputs) console.log(`dependabot-update-type: ${output}`);
  if (env.GITHUB_OUTPUT) append(env.GITHUB_OUTPUT, outputs.map((o) => `${o}\n`).join(""));
  return 0;
};
