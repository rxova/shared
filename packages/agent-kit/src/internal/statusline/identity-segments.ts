import { basename, relative } from "node:path";
import type { Segment, StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { formatDuration } from "@/internal/statusline/format-duration";
import { hyperlink } from "@/internal/statusline/hyperlink";
import { paint } from "@/internal/statusline/paint";
import { THEME } from "@/internal/statusline/theme";

/** The first line: model and effort, project and worktree, git state, pull request, lines changed. */
export const identitySegments = (input: StatusInput, facts: StatusFacts): Segment[] => {
  const { mode, git } = facts;
  const dim = (text: string) => paint(THEME.dim, text, mode);
  const levels = ["low", "medium", "high", "xhigh", "max"];
  const effort = levels.indexOf(input.effort ?? "") + 1;
  const model = [
    paint(THEME.model, `◆ ${input.model}`, mode, true),
    input.contextSize >= 1_000_000 ? dim("1M") : "",
    input.fastMode ? paint(THEME.cost, "↯fast", mode) : "",
    effort > 0
      ? paint(THEME.model, "●".repeat(effort), mode) +
        paint(THEME.track, "○".repeat(5 - effort), mode)
      : "",
    input.thinking ? dim("∴") : "",
  ]
    .filter((part) => part !== "")
    .join(" ");

  const sub = relative(input.projectDir, input.cwd);
  const project = [
    paint(THEME.project, input.repo ?? basename(input.projectDir), mode, true),
    sub !== "" && !sub.startsWith("..") ? dim(`›${sub}`) : "",
    input.worktree === undefined ? "" : dim(` ◫ ${input.worktree}`),
  ].join("");

  let branch = "";
  let age = "";
  if (git !== undefined) {
    const dirty = git.staged + git.modified + git.untracked + git.conflicts > 0;
    const counts = [
      git.staged > 0 ? paint(THEME.clean, `+${String(git.staged)}`, mode) : "",
      git.modified > 0 ? paint(THEME.dirty, `~${String(git.modified)}`, mode) : "",
      git.untracked > 0 ? dim(`?${String(git.untracked)}`) : "",
      git.conflicts > 0 ? paint(THEME.warn, `✗${String(git.conflicts)}`, mode, true) : "",
      git.ahead > 0 ? paint(THEME.text, `⇡${String(git.ahead)}`, mode) : "",
      git.behind > 0 ? paint(THEME.warn, `⇣${String(git.behind)}`, mode) : "",
      git.stashes > 0 ? dim(`≡${String(git.stashes)}`) : "",
      git.hasUpstream || git.detached ? "" : dim("⊘"),
    ].filter((part) => part !== "");
    branch = [
      paint(
        dirty ? THEME.dirty : THEME.clean,
        `${git.detached ? "@" : "⎇ "}${git.branch}`,
        mode,
        true,
      ),
      dirty ? "" : paint(THEME.clean, "✓", mode),
      ...counts,
    ]
      .filter((part) => part !== "")
      .join(" ");
    if (git.lastCommitAt !== undefined)
      age = dim(`⟲ ${formatDuration(facts.now - git.lastCommitAt)}`);
  }

  let pr = "";
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
    pr =
      hyperlink(input.pr.url, paint(THEME.link, name, mode, true)) +
      (mark === "" ? "" : ` ${paint(color, mark, mode)}`);
  }

  const lines =
    input.linesAdded + input.linesRemoved === 0
      ? ""
      : `${paint(THEME.added, `+${String(input.linesAdded)}`, mode)} ${paint(THEME.removed, `−${String(input.linesRemoved)}`, mode)}`;

  return [
    { text: model, priority: 10 },
    { text: project, priority: 8 },
    { text: branch, priority: 9 },
    { text: pr, priority: 7 },
    { text: lines, priority: 6 },
    { text: age, priority: 3 },
  ];
};
