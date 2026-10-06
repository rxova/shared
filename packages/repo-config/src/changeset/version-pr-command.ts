import { appendFileSync } from "node:fs";
import { nonEmpty } from "@/internal/changeset/non-empty";
import { listChangesets } from "@/internal/changeset/list-changesets";
import { versionPrBody } from "@/internal/changeset/version-pr-body";
import { versionScriptEnv } from "@/internal/changeset/version-script-env";
import { workspaceVersions } from "@/internal/changeset/workspace-versions";
import { readFile } from "@/internal/config/read-file";
import { runTool } from "@/internal/init/run-tool";
import { runCommand } from "@/internal/verify/run-command";
import type { Reader } from "@/config/config.types";
import type { Tool } from "@/init/init.types";
import type { Runner } from "@/verify/verify.types";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config version-pr`: opens or updates the version pull request,
 * and publishes nothing. Run from a checkout of the base branch whose git
 * credentials can push.
 *
 * With pending changesets it resets `VERSION_BRANCH` (default
 * `changeset-release/<base>`) to the base, runs `VERSION_SCRIPT` (default
 * `pnpm exec changeset version`), commits the result as `COMMIT_MESSAGE`
 * (default `chore: version packages`), force-pushes the branch, then edits the
 * open pull request from it into the base or creates one, titled `PR_TITLE`
 * (default `chore: version packages`), with a body listing each workspace
 * package whose version moved. The base is `BASE_BRANCH`, else the branch
 * checked out. The version script gets `GITHUB_TOKEN` from `GH_TOKEN` when
 * only that is set, for the changelog preset. When `GITHUB_OUTPUT` is set it appends `pull-request=<number>`
 * (empty when there is none) and `changed=true|false`. Returns the process
 * exit code: 1 when a command fails.
 */
export const versionPrCommand = (
  env: NodeJS.ProcessEnv = process.env,
  {
    root = process.cwd(),
    run = runCommand,
    tool = runTool,
    read = readFile,
    pending = listChangesets,
    append = appendFileSync,
  }: {
    root?: string;
    run?: Runner;
    tool?: Tool;
    read?: Reader;
    pending?: (root: string) => string[];
    append?: (file: string, contents: string) => void;
  } = {},
): number => {
  const finish = (pullRequest: string, changed: boolean) => {
    if (env.GITHUB_OUTPUT) {
      append(env.GITHUB_OUTPUT, `pull-request=${pullRequest}\nchanged=${String(changed)}\n`);
    }
    return 0;
  };

  try {
    if (pending(root).length === 0) {
      console.log("version-pr: no pending changesets, nothing to version");
      return finish("", false);
    }

    const base = nonEmpty(env.BASE_BRANCH) ?? tool("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
    if (base === "" || base === "HEAD") {
      throw new Error("cannot tell the base branch from a detached HEAD; set BASE_BRANCH");
    }
    const branch = nonEmpty(env.VERSION_BRANCH) ?? `changeset-release/${base}`;
    const title = nonEmpty(env.PR_TITLE) ?? "chore: version packages";
    const roots = readConfig(root, read).changeset?.roots;

    tool("git", ["switch", "-C", branch]);
    const before = workspaceVersions(root, read, roots);
    run(nonEmpty(env.VERSION_SCRIPT) ?? "pnpm exec changeset version", versionScriptEnv(env));
    const after = workspaceVersions(root, read, roots);

    if (tool("git", ["status", "--porcelain"]) === "") {
      console.log("version-pr: versioning changed nothing, nothing to commit");
      return finish("", false);
    }

    tool("git", ["add", "-A"]);
    tool("git", ["commit", "-m", nonEmpty(env.COMMIT_MESSAGE) ?? "chore: version packages"]);
    tool("git", ["push", "--force", "origin", branch]);

    const body = versionPrBody(before, after);
    const open = tool("gh", [
      "pr",
      "list",
      "--head",
      branch,
      "--base",
      base,
      "--state",
      "open",
      "--json",
      "number",
      "--jq",
      ".[0].number",
    ]);
    let pullRequest: string;
    if (open !== "" && open !== "null") {
      tool("gh", ["pr", "edit", open, "--title", title, "--body", body]);
      pullRequest = open;
      console.log(`version-pr: updated pull request #${pullRequest}`);
    } else {
      const url = tool("gh", [
        "pr",
        "create",
        "--base",
        base,
        "--head",
        branch,
        "--title",
        title,
        "--body",
        body,
      ]);
      pullRequest = /\/pull\/(\d+)\s*$/.exec(url)?.[1] ?? "";
      console.log(`version-pr: opened ${url}`);
    }
    return finish(pullRequest, true);
  } catch (failure) {
    console.error(`version-pr failed — ${(failure as Error).message}`);
    return 1;
  }
};
