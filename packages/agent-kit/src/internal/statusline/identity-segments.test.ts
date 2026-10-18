import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { GitState, StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { identitySegments } from "@/internal/statusline/identity-segments";
import { paintRuns } from "@/internal/statusline/paint-runs";
import { readStatusInput } from "@/internal/statusline/read-status-input";

const NOW = 1_800_000_000;
const input = (overrides: Partial<StatusInput> = {}): StatusInput => ({
  ...readStatusInput("{}"),
  model: "Opus 4.7",
  cwd: "/w/app",
  projectDir: "/w/app",
  ...overrides,
});
const clean: GitState = {
  branch: "main",
  detached: false,
  ahead: 0,
  behind: 0,
  hasUpstream: true,
  staged: 0,
  modified: 0,
  untracked: 0,
  conflicts: 0,
  stashes: 0,
};
const facts = (overrides: Partial<StatusFacts> = {}): StatusFacts => ({
  history: [],
  now: NOW,
  columns: 200,
  mode: "none",
  ...overrides,
});
const segments = (inputOverrides: Partial<StatusInput> = {}, git?: GitState) => {
  const [model, project, branch, pr, lines, age] = identitySegments(
    input(inputOverrides),
    facts({ git }),
  ).map(({ runs }) => paintRuns(runs, "none"));
  return { model, project, branch, pr, lines, age };
};
const link = (url: string, text: string) => `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;

describe("identitySegments", () => {
  it("shows the model alone when nothing else is known", () => {
    expect(segments()).toEqual({
      model: "◆ Opus 4.7",
      project: "app",
      branch: "",
      pr: "",
      lines: "",
      age: "",
    });
  });

  it("marks a 1M context, fast mode, the effort level and thinking", () => {
    expect(
      segments({ contextSize: 1_000_000, fastMode: true, effort: "high", thinking: true }).model,
    ).toBe("◆ Opus 4.7 1M ↯fast ●●●○○ ∴");
  });

  it.each([
    ["low", "●○○○○"],
    ["medium", "●●○○○"],
    ["xhigh", "●●●●○"],
    ["max", "●●●●●"],
  ])("draws effort %s as %s", (effort, dots) => {
    expect(segments({ effort }).model).toBe(`◆ Opus 4.7 ${dots}`);
  });

  it("leaves out an effort level it does not know", () => {
    expect(segments({ effort: "turbo" }).model).toBe("◆ Opus 4.7");
  });

  it("names the project by its repository, else its folder, with the subfolder and worktree", () => {
    expect(segments({ repo: "rxova/shared" }).project).toBe("rxova/shared");
    expect(segments({ cwd: "/w/app/src/x", worktree: "feat-x" }).project).toBe(
      `app›${join("src", "x")} ◫ feat-x`,
    );
  });

  it("does not show a working directory outside the project", () => {
    expect(segments({ cwd: "/elsewhere" }).project).toBe("app");
  });

  it("shows a clean branch with its upstream as a tick", () => {
    expect(segments({}, clean).branch).toBe("⎇ main ✓");
  });

  it("counts every kind of change, the distance to the upstream and the stashes", () => {
    expect(
      segments(
        {},
        {
          ...clean,
          staged: 1,
          modified: 2,
          untracked: 3,
          conflicts: 1,
          ahead: 2,
          behind: 1,
          stashes: 4,
        },
      ).branch,
    ).toBe("⎇ main +1 ~2 ?3 ✗1 ⇡2 ⇣1 ≡4");
  });

  it("counts untracked files alone as dirty", () => {
    expect(segments({}, { ...clean, untracked: 1 }).branch).toBe("⎇ main ?1");
  });

  it("marks a branch with no upstream", () => {
    expect(segments({}, { ...clean, hasUpstream: false }).branch).toBe("⎇ main ✓ ⊘");
  });

  it("shows a detached HEAD by commit, without the no-upstream mark", () => {
    expect(
      segments({}, { ...clean, branch: "abc1234", detached: true, hasUpstream: false }).branch,
    ).toBe("@abc1234 ✓");
  });

  it("colours a branch with conflicts as dirty and the conflicts as a warning", () => {
    const [, , branch] = identitySegments(
      input(),
      facts({ git: { ...clean, conflicts: 2 }, mode: "truecolor" }),
    );
    const painted = paintRuns(branch?.runs ?? [], "truecolor");
    expect(painted).toContain("\u001b[1;38;2;249;226;175m⎇ main\u001b[0m");
    expect(painted).toContain("\u001b[1;38;2;243;139;168m✗2\u001b[0m");
  });

  it("shows how long ago the last commit was", () => {
    expect(segments({}, { ...clean, lastCommitAt: NOW - 3900 }).age).toBe("⟲ 1h05m");
  });

  it.each([
    ["approved", " ✓"],
    ["pending", " ◷"],
    ["changes_requested", " ✗"],
    ["draft", " ◌"],
    ["merged", ""],
    [undefined, ""],
  ])("links the pull request and marks review state %s", (reviewState, mark) => {
    expect(segments({ pr: { number: 42, url: "https://x.test/42", reviewState } }).pr).toBe(
      link("https://x.test/42", "PR #42") + mark,
    );
  });

  it("names a GitLab merge request, unlinked without a url", () => {
    expect(segments({ pr: { number: 7, kind: "mr", reviewState: "approved" } }).pr).toBe("MR !7 ✓");
  });

  it("shows lines added and removed once either is non-zero", () => {
    expect(segments({ linesAdded: 12, linesRemoved: 3 }).lines).toBe("+12 −3");
    expect(segments({ linesRemoved: 5 }).lines).toBe("+0 −5");
  });

  it("ranks the model first and the commit age last", () => {
    const ranked = identitySegments(
      input({ linesAdded: 1, pr: { number: 1 } }),
      facts({ git: { ...clean, lastCommitAt: NOW } }),
    )
      .toSorted((a, b) => b.priority - a.priority)
      .map(({ runs }) => paintRuns(runs, "none").split(" ")[0]);
    expect(ranked).toEqual(["◆", "⎇", "app", "PR", "+1", "⟲"]);
  });
});
