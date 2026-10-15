import { describe, expect, it } from "vitest";
import { readGit } from "@/internal/statusline/read-git";

const STATUS = "# branch.oid abc\n# branch.head main\n# branch.upstream origin/main\n? a.ts\n";

/** A fake git that answers only for `/repo`, with `answers` keyed by the subcommand's flags. */
const git =
  (answers: { full?: string; plain?: string; log?: string }) => (args: readonly string[]) => {
    if (args[0] !== "-C" || args[1] !== "/repo") return undefined;
    const rest = args.slice(2).join(" ");
    if (rest === "status --porcelain=v2 --branch --show-stash") return answers.full;
    if (rest === "status --porcelain=v2 --branch") return answers.plain;
    if (rest === "log -1 --format=%ct") return answers.log;
    return undefined;
  };

describe("readGit", () => {
  it("reads the status and the last commit time in `cwd`", () => {
    expect(readGit("/repo", git({ full: STATUS, log: "1700000000\n" }))).toMatchObject({
      branch: "main",
      hasUpstream: true,
      untracked: 1,
      lastCommitAt: 1_700_000_000,
    });
  });

  it("falls back to plain --branch on a git without --show-stash", () => {
    expect(readGit("/repo", git({ plain: STATUS }))).toMatchObject({ branch: "main" });
  });

  it("leaves the commit time out when there is no commit yet or the log fails", () => {
    expect(readGit("/repo", git({ full: STATUS, log: "" }))).not.toHaveProperty("lastCommitAt");
    expect(readGit("/repo", git({ full: STATUS }))).not.toHaveProperty("lastCommitAt");
  });

  it("is undefined outside a repository", () => {
    expect(readGit("/elsewhere", git({ full: STATUS, plain: STATUS }))).toBeUndefined();
  });

  it("does not run git without a directory", () => {
    let calls = 0;
    expect(
      readGit("", () => {
        calls += 1;
        return STATUS;
      }),
    ).toBeUndefined();
    expect(calls).toBe(0);
  });
});
