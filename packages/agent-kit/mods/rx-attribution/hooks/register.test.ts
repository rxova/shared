import type { On } from "claude-code";
import { expect, test } from "claude-code/testing";

const URL = "https://github.com/rxova/shared/pull/42";
const BODY = "Adds a thing.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)";

const ran = (stdout: string) => ({
  value: {
    exitCode: 0,
    stdout,
    stderr: "",
    isStdoutTruncated: false,
    isStderrTruncated: false,
  },
});

test("the commit trailer and the PR footer are empty", async ($) => {
  expect((await $.attribution.text({ kind: "commit", text: "Co-Authored-By: Claude" })).text).toBe(
    "",
  );
  expect(
    (await $.attribution.text({ kind: "pr", text: "🤖 Generated with Claude Code" })).text,
  ).toBe("");
});

test("an opened PR whose body carries the footer is cleaned", async ($, on) => {
  const edits: string[] = [];
  on("tool.call", { tool: "Bash" }, () => ({
    result: { stdout: URL, stderr: "", interrupted: false },
    text: URL,
  }));
  on("process.run", ($, e) => {
    if (e.argv.includes("view")) return ran(BODY);
    edits.push(e.init?.stdin ?? "");
    return ran("");
  });

  const call = await $.tool.call({ tool: "Bash", command: "gh pr create --fill" });

  expect(edits).toEqual(["Adds a thing."]);
  expect(call.context?.join("\n")).toContain("removed attribution");
});

test(
  "with fixPrBody off the footer is only reported",
  { options: { fixPrBody: false } },
  async ($, on) => {
    const argvs: string[][] = [];
    on("tool.call", { tool: "Bash" }, () => ({
      result: { stdout: URL, stderr: "", interrupted: false },
      text: URL,
    }));
    on("process.run", ($, e) => {
      argvs.push([...e.argv]);
      return ran(BODY);
    });

    const call = await $.tool.call({ tool: "Bash", command: "gh pr edit 42 --body x" });

    expect(argvs.length).toBe(1);
    expect(call.context?.join("\n")).toContain("carries attribution");
  },
);

test(
  "a commit by someone else is flagged",
  { options: { authorEmail: "me@example.com" } },
  async ($, on) => {
    on("tool.call", { tool: "Bash" }, () => ({
      result: { stdout: "", stderr: "", interrupted: false },
      text: "[main abc123] feat: x",
    }));
    on("process.run", () =>
      ran(
        "Bot <bot@example.com>\nMe <me@example.com>\nfeat: x\n\nCo-Authored-By: Claude <noreply@anthropic.com>",
      ),
    );

    const call = await $.tool.call({ tool: "Bash", command: 'git commit -m "feat: x"' });
    const note = call.context?.join("\n") ?? "";

    expect(note).toContain("author is Bot <bot@example.com>");
    expect(note).not.toContain("committer is");
    expect(note).toContain("Co-Authored-By");
  },
);

test("other commands pass untouched", async ($, on) => {
  on("tool.call", { tool: "Bash" }, () => ({
    result: { stdout: "ok", stderr: "", interrupted: false },
    text: "ok",
  }));

  const call = await $.tool.call({ tool: "Bash", command: "ls" });

  expect(call.context).toBeUndefined();
});

const COMMITTED = "Me <me@example.com>\nMe <me@example.com>\nfeat: x";

/** Answers a commit and its git log with `log`; returns the directories git log ran in. */
const answerCommit = (on: On, log = COMMITTED): (string | undefined)[] => {
  const dirs: (string | undefined)[] = [];
  on("tool.call", { tool: "Bash" }, () => ({
    result: { stdout: "", stderr: "", interrupted: false },
    text: "[main abc123] feat: x",
  }));
  on("process.run", ($, e) => {
    dirs.push(e.init?.cwd);
    return ran(log);
  });
  return dirs;
};

test(
  "a commit after `cd <dir>;` is read in that directory, not the session's",
  { options: { authorEmail: "me@example.com" } },
  async ($, on) => {
    const dirs = answerCommit(on);

    const call = await $.tool.call({
      tool: "Bash",
      command: "cd /work/tree; git add -A; git commit -qm x",
    });

    expect(dirs).toEqual(["/work/tree"]);
    expect(call.context).toBeUndefined();
  },
);

test("every cd before the commit counts, relative ones onto the one before", async ($, on) => {
  const dirs = answerCommit(on);

  await $.tool.call({
    tool: "Bash",
    command: 'cd /repo && pnpm install; cd "packages/a" && git -C sub commit -m x && cd /elsewhere',
  });

  expect(dirs).toEqual(["/repo/packages/a/sub"]);
});

test("a git -C on its own is the directory", async ($, on) => {
  const dirs = answerCommit(on);

  await $.tool.call({ tool: "Bash", command: "git -C /other commit -m x" });

  expect(dirs).toEqual(["/other"]);
});

test("without any cd the session's own directory is read", async ($, on) => {
  const dirs = answerCommit(on);

  await $.tool.call({ tool: "Bash", command: 'git commit -m "feat: x"' });

  expect(dirs).toEqual([undefined]);
});

for (const command of [
  'cd "$W" && git commit -m x',
  "cd ~/repo; git commit -m x",
  "cd - && git commit -m x",
]) {
  test(
    `a directory only the shell knows skips the check: ${command}`,
    { options: { authorEmail: "me@example.com" } },
    async ($, on) => {
      const dirs = answerCommit(on, "Bot <bot@example.com>\nBot <bot@example.com>\nx");

      const call = await $.tool.call({ tool: "Bash", command });

      expect(dirs).toEqual([]);
      expect(call.context).toBeUndefined();
    },
  );
}

test("a long run of repeated options does not hang the check", async ($, on) => {
  const dirs = answerCommit(on);
  const started = Date.now();

  await $.tool.call({
    tool: "Bash",
    command: `git ${'-C "!" '.repeat(5000)}status && git commit -m x`,
  });

  expect(dirs).toEqual([undefined]);
  expect(Date.now() - started).toBeLessThan(1000);
});
