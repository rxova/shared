import { atom, read, update } from "claude-code";
import type { EngineInterface, Register } from "claude-code";

import { baseName } from "./base-name";
import { prLabel } from "./pr-label";
import { parsePrs } from "./parse-prs";
import { parseWorktrees } from "./parse-worktrees";

const PANE = "rx-worktrees";
const view = atom({ plugin: "rx-worktrees", key: "view" } as const, {
  rows: [],
  error: null,
  isLoading: false,
});

/** Reads the worktrees and their pull requests into the pane's state. */
const refresh = async ($: EngineInterface): Promise<void> => {
  await update($, view, (current) => ({ ...current, isLoading: true }));

  const list = await $.process.run(["git", "worktree", "list", "--porcelain"]);
  if (list.exitCode !== 0) {
    await update($, view, () => ({
      rows: [],
      error: list.stderr.trim() || "Not a git repository.",
      isLoading: false,
    }));
    return;
  }

  const prs = await $.process
    .run([
      "gh",
      "pr",
      "list",
      "--state",
      "all",
      "--limit",
      "200",
      "--json",
      "headRefName,number,state",
    ])
    .then((run) => parsePrs(run.exitCode === 0 ? run.stdout : "[]"))
    .catch(() => parsePrs("[]"));

  const rows = parseWorktrees(list.stdout).map((row) => ({
    ...row,
    pr: prs.get(row.branch) ?? null,
  }));
  await update($, view, () => ({ rows, error: null, isLoading: false }));
};

/** Runs `git worktree prune` (records of worktrees whose folder is gone) and reads the list again. */
const prune = async ($: EngineInterface): Promise<void> => {
  const run = await $.process.run(["git", "worktree", "prune", "--verbose"]);
  const pruned = `${run.stdout}\n${run.stderr}`
    .split("\n")
    .filter((line) => line.startsWith("Removing")).length;
  $.ui.toast(
    run.exitCode === 0
      ? `rx-worktrees: pruned ${pruned} stale worktree record(s)`
      : `rx-worktrees: prune failed: ${run.stderr.trim()}`,
  );
  await refresh($);
};

export const register: Register = (on) => {
  on("session.start", async ($, e, next) => {
    await $.command.register({
      name: "worktrees",
      description: "Show the git worktrees of this repository with their pull requests",
    });

    return next(e);
  });

  on("command.run", { command: "worktrees" }, async ($) => {
    await $.ui.open({ id: PANE, title: "Worktrees" });
    await refresh($);

    return { text: "Worktrees pane opened." };
  });

  on("ui.render", { component: "Pane", requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e);
    const { rows, error, isLoading } = await read($, view);
    const prunable = rows.filter((row) => row.isPrunable).length;

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={1}>
          <Button
            key="refresh"
            hotkey="r"
            label={isLoading ? "Loading" : "Refresh"}
            onPress={() => refresh($)}
          />
          {prunable > 0 && (
            <Button key="prune" hotkey="p" label={`Prune ${prunable}`} onPress={() => prune($)} />
          )}
        </Box>
        {error !== null && <Text color="red">{error}</Text>}
        {error === null && rows.length === 0 && (
          <Text dimColor>{isLoading ? "Reading worktrees." : "No worktrees."}</Text>
        )}
        {rows.map((row) => (
          <Button
            key={`row-${row.path}`}
            plain
            onPress={async (press) => {
              await $.ui.copy({ text: row.path, surface: press.surface });
              $.ui.toast(`Copied ${row.path}`);
            }}
          >
            {row.branch}{" "}
            <Text dimColor>
              {prLabel(row.pr)}
              {row.isPrunable ? " · prunable" : ""} · {baseName(row.path)}
            </Text>
          </Button>
        ))}
      </Box>
    );
  });
};
