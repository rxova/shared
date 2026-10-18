import { describe, expect, it } from "vitest";
import type { StatusFacts } from "@/internal/statusline/statusline.types";
import { readStatusInput } from "@/internal/statusline/read-status-input";
import { renderStatusline } from "@/statusline/render-statusline";
import { statuslineRows } from "@/statusline/statusline-rows";

const NOW = 1_800_000_000;
const facts = (overrides: Partial<StatusFacts> = {}): StatusFacts => ({
  git: {
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
  },
  history: [],
  now: NOW,
  columns: 200,
  mode: "none",
  ...overrides,
});
const full = readStatusInput(
  JSON.stringify({
    model: { display_name: "Opus 5" },
    workspace: { current_dir: "/w", project_dir: "/w" },
    context_window: { context_window_size: 200_000, current_usage: { input_tokens: 50_000 } },
    cost: { total_cost_usd: 1.5, total_duration_ms: 1_800_000 },
    rate_limits: { five_hour: { used_percentage: 35, resets_at: NOW + 9000 } },
  }),
);
const text = (rows: readonly (readonly { text: string }[])[]) =>
  rows.map((cells) => cells.map(({ text: part }) => part).join(""));

describe("statuslineRows", () => {
  it("says exactly what the painted line says, cell by cell", () => {
    expect(text(statuslineRows(full, facts()))).toEqual(renderStatusline(full, facts()));
  });

  it("leaves out an empty row, as the painted line does", () => {
    const bare = readStatusInput("{}");
    const only = facts({ git: undefined, history: [] });
    expect(statuslineRows(bare, only)).toHaveLength(2);
    expect(text(statuslineRows(bare, only))).toEqual(renderStatusline(bare, only));
  });

  it("drops the same segments as the painted line when the terminal is narrow", () => {
    const narrow = facts({ columns: 24 });
    expect(text(statuslineRows(full, narrow))).toEqual(renderStatusline(full, narrow));
  });

  it("carries each run's colour as hex rather than escape codes", () => {
    const [identity = []] = statuslineRows(full, facts());
    expect(identity[0]).toEqual({ text: "◆ Opus 5", fg: "#cba6f7", bold: true, href: undefined });
    expect(identity.every(({ fg }) => /^#[0-9a-f]{6}$/.test(fg))).toBe(true);
  });

  it("keeps a pull request's link on its cell", () => {
    const withPr = readStatusInput(
      JSON.stringify({ pr: { number: 7, url: "https://x.test/7" }, workspace: {} }),
    );
    const [identity = []] = statuslineRows(withPr, facts());
    expect(identity.find(({ text: part }) => part === "PR #7")?.href).toBe("https://x.test/7");
  });
});
