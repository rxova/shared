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
