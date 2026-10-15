import { describe, expect, it } from "vitest";
import type { GitState, StatusFacts } from "@/internal/statusline/statusline.types";
import { readStatusInput } from "@/internal/statusline/read-status-input";
import { visibleWidth } from "@/internal/statusline/visible-width";
import { renderStatusline } from "@/statusline/render-statusline";

const NOW = 1_800_000_000;
const git: GitState = {
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
  lastCommitAt: NOW - 120,
};
const facts = (overrides: Partial<StatusFacts> = {}): StatusFacts => ({
  git,
  history: [50_000],
  now: NOW,
  columns: 200,
  mode: "none",
  ...overrides,
});
const full = readStatusInput(
  JSON.stringify({
    version: "2.1.0",
    model: { display_name: "Claude Opus 4.7" },
    workspace: { current_dir: "/w/shared", repo: { owner: "rxova", name: "shared" } },
    cost: { total_cost_usd: 1.5, total_duration_ms: 1_800_000, total_api_duration_ms: 900_000 },
    context_window: { current_usage: { input_tokens: 50_000 } },
    rate_limits: { five_hour: { used_percentage: 35, resets_at: NOW + 9000 } },
  }),
);

describe("renderStatusline", () => {
  it("renders identity, context and limits as three rows", () => {
    expect(renderStatusline(full, facts())).toEqual([
      "◆ Opus 4.7 ┃ rxova/shared ┃ ⎇ main ✓ ┃ ⟲ 2m",
      "CTX ████──────────── 25% 50k/200k ┃ $1.50 $3.00/h ┃ ◷ 30m api 50%",
      "5H ███▌────── 35% ↺ 2h30m 0.7× ┃ v2.1.0",
    ]);
  });

  it("leaves out an empty row", () => {
    expect(renderStatusline(readStatusInput("{}"), facts({ git: undefined, history: [] }))).toEqual(
      ["◆ Claude", `CTX ${"─".repeat(16)} 0% 0/200k`],
    );
  });

  it("drops the least important segments of each row to fit a narrow terminal", () => {
    const columns = visibleWidth("◆ Opus 4.7 ┃ ⎇ main ✓");
    const rows = renderStatusline(full, facts({ columns }));
    expect(rows).toEqual([
      "◆ Opus 4.7 ┃ ⎇ main ✓",
      "CTX ████──────────── 25% 50k/200k",
      "5H ███▌────── 35% ↺ 2h30m 0.7×",
    ]);
  });

  it("keeps each row's most important segment however narrow the terminal", () => {
    expect(renderStatusline(full, facts({ columns: 1 })).map((row) => row.split(" ")[0])).toEqual([
      "◆",
      "CTX",
      "5H",
    ]);
  });

  it("paints the separator in colour mode", () => {
    const [identity] = renderStatusline(full, facts({ mode: "truecolor" }));
    expect(identity).toContain("\u001b[38;2;88;91;112m ┃ \u001b[0m");
  });
});
