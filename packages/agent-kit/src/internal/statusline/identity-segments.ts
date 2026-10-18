import { basename, relative } from "node:path";
import type {
  Run,
  Segment,
  StatusFacts,
  StatusInput,
} from "@/internal/statusline/statusline.types";
import { formatDuration } from "@/internal/statusline/format-duration";
import { joinRuns } from "@/internal/statusline/join-runs";
import { run } from "@/internal/statusline/run";
import { THEME } from "@/internal/statusline/theme";

const SPACE = run(THEME.dim, " ");

/** The first line: model and effort, project and worktree, git state, pull request, lines changed. */
export const identitySegments = (input: StatusInput, facts: StatusFacts): Segment[] => {
  const { git } = facts;
  const dim = (text: string) => run(THEME.dim, text);
  const levels = ["low", "medium", "high", "xhigh", "max"];
  const effort = levels.indexOf(input.effort ?? "") + 1;
  const model = joinRuns(
    [
      [run(THEME.model, `◆ ${input.model}`, true)],
      input.contextSize >= 1_000_000 ? [dim("1M")] : [],
      input.fastMode ? [run(THEME.cost, "↯fast")] : [],
      effort > 0
        ? [run(THEME.model, "●".repeat(effort)), run(THEME.track, "○".repeat(5 - effort))]
        : [],
      input.thinking ? [dim("∴")] : [],
    ],
    SPACE,
  );

  const sub = relative(input.projectDir, input.cwd);
  const project = [
    run(THEME.project, input.repo ?? basename(input.projectDir), true),
    ...(sub !== "" && !sub.startsWith("..") ? [dim(`›${sub}`)] : []),
    ...(input.worktree === undefined ? [] : [dim(` ◫ ${input.worktree}`)]),
  ];

  let branch: Run[] = [];
  let age: Run[] = [];
  if (git !== undefined) {
    const dirty = git.staged + git.modified + git.untracked + git.conflicts > 0;
    const counts: Run[][] = [
      git.staged > 0 ? [run(THEME.clean, `+${String(git.staged)}`)] : [],
      git.modified > 0 ? [run(THEME.dirty, `~${String(git.modified)}`)] : [],
      git.untracked > 0 ? [dim(`?${String(git.untracked)}`)] : [],
      git.conflicts > 0 ? [run(THEME.warn, `✗${String(git.conflicts)}`, true)] : [],
      git.ahead > 0 ? [run(THEME.text, `⇡${String(git.ahead)}`)] : [],
      git.behind > 0 ? [run(THEME.warn, `⇣${String(git.behind)}`)] : [],
      git.stashes > 0 ? [dim(`≡${String(git.stashes)}`)] : [],
      git.hasUpstream || git.detached ? [] : [dim("⊘")],
    ];
    branch = joinRuns(
      [
        [run(dirty ? THEME.dirty : THEME.clean, `${git.detached ? "@" : "⎇ "}${git.branch}`, true)],
        dirty ? [] : [run(THEME.clean, "✓")],
        ...counts,
      ],
      SPACE,
    );
    if (git.lastCommitAt !== undefined)
      age = [dim(`⟲ ${formatDuration(facts.now - git.lastCommitAt)}`)];
  }

  let pr: Run[] = [];
  if (input.pr !== undefined) {
    const states: Record<string, readonly [string, (typeof THEME)[keyof typeof THEME]]> = {
      approved: ["✓", THEME.clean],
      pending: ["◷", THEME.dirty],
      changes_requested: ["✗", THEME.warn],
      draft: ["◌", THEME.dim],
    };
    const [mark, color] = states[input.pr.reviewState ?? ""] ?? ["", THEME.link];
    const name =
      input.pr.kind === "mr" ? `MR !${String(input.pr.number)}` : `PR #${String(input.pr.number)}`;
    pr = [
      run(THEME.link, name, true, input.pr.url),
      ...(mark === "" ? [] : [SPACE, run(color, mark)]),
    ];
  }

  const lines =
    input.linesAdded + input.linesRemoved === 0
      ? []
      : [
          run(THEME.added, `+${String(input.linesAdded)}`),
          SPACE,
          run(THEME.removed, `−${String(input.linesRemoved)}`),
        ];

  return [
    { runs: model, priority: 10 },
    { runs: project, priority: 8 },
    { runs: branch, priority: 9 },
    { runs: pr, priority: 7 },
    { runs: lines, priority: 6 },
    { runs: age, priority: 3 },
  ];
};
