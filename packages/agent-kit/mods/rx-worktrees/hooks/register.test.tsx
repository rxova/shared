import { expect, test } from "claude-code/testing";

const PORCELAIN = [
  "worktree /repo/shared\nHEAD aaa\nbranch refs/heads/main",
  "worktree /tmp/wt/feat-x\nHEAD bbb\nbranch refs/heads/feat/x",
  "worktree /tmp/wt/gone\nHEAD ccc\nbranch refs/heads/fix/y\nprunable gitdir file points to non-existent location",
].join("\n\n");

const PRS = JSON.stringify([
  { headRefName: "feat/x", number: 12, state: "MERGED" },
  { headRefName: "fix/y", number: 13, state: "OPEN" },
]);

const PANE = {
  component: "Pane",
  requestId: "rx-worktrees",
  props: {
    title: "Worktrees",
    isFocused: true,
    bodyColumns: 80,
    placement: "dock",
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const;

const RUN = {
  command: "worktrees",
  args: "",
  origin: { kind: "composer" },
  presentation: { isFullscreen: true, columns: 200 },
} as const;

const ran = (stdout: string) => ({
  value: { exitCode: 0, stdout, stderr: "", isStdoutTruncated: false, isStderrTruncated: false },
});

for (const surface of ["terminal", "desktop"] as const) {
  test(`the pane lists worktrees with their PRs and prunes on ${surface}`, async ($, on) => {
    const argvs: string[] = [];
    on("process.run", ($, e) => {
      argvs.push(e.argv.join(" "));
      if (e.argv[0] === "gh") return ran(PRS);
      if (e.argv.includes("prune"))
        return ran("Removing worktrees/gone: gitdir file points to non-existent location");
      return ran(PORCELAIN);
    });
    on("ui.open", () => ({ value: { isPlaced: true } }));

    await $.command.run(RUN);
    const ui = await $.ui.mount({ plugin: "rx-worktrees", surface, ...PANE });

    expect((await ui.find({ key: "row-/tmp/wt/feat-x" }))?.text).toContain("#12 merged");
    expect((await ui.find({ key: "row-/repo/shared" }))?.text).toContain("no PR");
    expect((await ui.find({ key: "prune" }))?.text).toContain("Prune 1");

    await ui.press({ key: "prune" });
    expect(argvs).toContain("git worktree prune --verbose");
    await ui.unmount();
  });
}

test("outside a repository the pane says so", async ($, on) => {
  on("process.run", () => ({
    value: {
      exitCode: 128,
      stdout: "",
      stderr: "fatal: not a git repository",
      isStdoutTruncated: false,
      isStderrTruncated: false,
    },
  }));
  on("ui.open", () => ({ value: { isPlaced: true } }));

  await $.command.run(RUN);
  const ui = await $.ui.mount({ plugin: "rx-worktrees", surface: "terminal", ...PANE });

  expect(await ui.find({ type: "Text", text: /not a git repository/ })).toBeDefined();
});
