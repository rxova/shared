import { describe, expect, it } from "vitest";
import type { StatusFacts } from "@/internal/statusline/statusline.types";
import { opencodeRows } from "@/statusline/opencode-rows";

const NOW = 1_800_000_000;
const facts = (overrides: Partial<StatusFacts> = {}): StatusFacts => ({
  history: [],
  now: NOW,
  columns: 200,
  mode: "none",
  ...overrides,
});
const text = (rows: readonly (readonly { text: string }[])[]) =>
  rows.map((cells) => cells.map(({ text: part }) => part).join(""));

describe("opencodeRows", () => {
  it("draws the model and the window for a bare session", () => {
    expect(text(opencodeRows({}, facts()))).toEqual([
      "◆ OpenCode",
      `CTX ${"─".repeat(16)} 0% 0/200k`,
    ]);
  });

  it("fills the gauge from OpenCode's token count", () => {
    const rows = text(opencodeRows({ model: "gpt-5", tokens: { input: 100_000 } }, facts()));
    expect(rows[0]).toBe("◆ gpt-5");
    expect(rows[1]).toContain("50% 100k/200k");
  });

  it("shows the cache share once the model reads from it", () => {
    const rows = text(
      opencodeRows({ tokens: { input: 20_000, cache: { read: 80_000 } } }, facts()),
    );
    expect(rows[1]).toContain("CACHE 80%");
  });

  it("gives every cell a hex colour, never an escape code", () => {
    const cells = opencodeRows({ model: "gpt-5" }, facts()).flat();
    expect(cells.every(({ fg }) => /^#[0-9a-f]{6}$/.test(fg))).toBe(true);
    expect(cells.some(({ text: part }) => part.includes("\u001b"))).toBe(false);
  });

  it("draws the git row when the working tree is known", () => {
    const rows = text(
      opencodeRows(
        {},
        facts({
          git: {
            branch: "main",
            detached: false,
            ahead: 0,
            behind: 0,
            hasUpstream: true,
            staged: 2,
            modified: 0,
            untracked: 0,
            conflicts: 0,
            stashes: 0,
          },
        }),
      ),
    );
    expect(rows[0]).toContain("⎇ main +2");
  });

  it("drops the least important segments when the terminal is narrow", () => {
    const wide = text(opencodeRows({ model: "gpt-5", costUsd: 2 }, facts()))[1] ?? "";
    const narrow =
      text(opencodeRows({ model: "gpt-5", costUsd: 2 }, facts({ columns: 24 })))[1] ?? "";
    expect(wide).toContain("$2.00");
    expect(narrow).not.toContain("$2.00");
  });
});
