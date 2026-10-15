import { describe, expect, it } from "vitest";
import type { StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { contextSegments } from "@/internal/statusline/context-segments";
import { readStatusInput } from "@/internal/statusline/read-status-input";

const NOW = 1_800_000_000;
const input = (overrides: Partial<StatusInput> = {}): StatusInput => ({
  ...readStatusInput("{}"),
  ...overrides,
});
const facts = (overrides: Partial<StatusFacts> = {}): StatusFacts => ({
  history: [],
  now: NOW,
  columns: 200,
  mode: "none",
  ...overrides,
});
const segments = (inputOverrides: Partial<StatusInput> = {}, factOverrides = {}) => {
  const [context, cost, cache, trend, time] = contextSegments(
    input(inputOverrides),
    facts(factOverrides),
  ).map(({ text }) => text);
  return { context, cost, cache, trend, time };
};

describe("contextSegments", () => {
  it("shows an empty gauge and nothing else before the first response", () => {
    expect(segments()).toEqual({
      context: `CTX ${"─".repeat(16)} 0% 0/200k`,
      cost: "",
      cache: "",
      trend: "",
      time: "",
    });
  });

  it("fills the gauge to the share of the context used", () => {
    expect(segments({ contextTokens: 50_000 }).context).toBe(
      `CTX ████${"─".repeat(12)} 25% 50k/200k`,
    );
  });

  it("measures against a 1M context", () => {
    expect(segments({ contextTokens: 500_000, contextSize: 1_000_000 }).context).toBe(
      `CTX ████████${"─".repeat(8)} 50% 500k/1M`,
    );
  });

  it("shows a full gauge past 100%", () => {
    expect(segments({ contextTokens: 250_000 }).context).toBe(
      `CTX ${"█".repeat(16)} 125% 250k/200k`,
    );
  });

  it("does not divide by a zero context size", () => {
    expect(segments({ contextTokens: 10, contextSize: 0 }).context).toBe(
      `CTX ${"─".repeat(16)} 0% 10/0`,
    );
  });

  it("colours the gauge by how full it is", () => {
    const [context] = contextSegments(
      input({ contextTokens: 190_000 }),
      facts({ mode: "truecolor" }),
    );
    expect(context?.text).toContain("\u001b[1;38;2;243;139;168m95%\u001b[0m");
  });

  it("draws the trend and the turns left from the history", () => {
    expect(segments({}, { history: [20_000, 40_000, 60_000] }).trend).toBe("▁▅█ ≈7 turns");
  });

  it("draws the trend without an estimate until two turns have grown it", () => {
    expect(segments({}, { history: [5, 5] }).trend).toBe("▁▁");
    expect(segments({}, { history: [5] }).trend).toBe("");
  });

  it("draws only the latest 12 points of a long history", () => {
    const history = Array.from({ length: 20 }, (_, index) => index * 1000);
    const [sparkline] = (segments({}, { history }).trend ?? "").split(" ");
    expect(sparkline).toHaveLength(12);
  });

  it("shows a cold cache", () => {
    expect(segments({ cache: { warm: false } }).cache).toBe("CACHE cold");
    expect(segments({ cache: { warm: false, hitRatio: 0.874, expiresAt: NOW + 300 } }).cache).toBe(
      "CACHE 87% cold",
    );
  });

  it("counts down a warm cache to its expiry", () => {
    expect(segments({ cache: { warm: true, hitRatio: 0.9, expiresAt: NOW + 300 } }).cache).toBe(
      "CACHE 90% ⏲ 5m",
    );
  });

  it("warns when a warm cache expires within a minute", () => {
    const cache = { warm: true, expiresAt: NOW + 45 };
    expect(segments({ cache }).cache).toBe("CACHE ⏲ 45s");
    const [, , painted] = contextSegments(input({ cache }), facts({ mode: "truecolor" }));
    expect(painted?.text).toContain("\u001b[38;2;243;139;168m⏲ 45s\u001b[0m");
    const [, , calm] = contextSegments(
      input({ cache: { warm: true, expiresAt: NOW + 60 } }),
      facts({ mode: "truecolor" }),
    );
    expect(calm?.text).toContain("\u001b[38;2;148;226;213m⏲ 1m\u001b[0m");
  });

  it("says warm, with its ttl, without a future expiry", () => {
    expect(segments({ cache: { warm: true, ttl: "1h" } }).cache).toBe("CACHE warm 1h");
    expect(segments({ cache: { warm: true, expiresAt: NOW } }).cache).toBe("CACHE warm");
  });

  it("shows the cost, with the hourly rate after a minute", () => {
    expect(segments({ costUsd: 1.5, durationMs: 1_800_000 }).cost).toBe("$1.50 $3.00/h");
    expect(segments({ costUsd: 1.5, durationMs: 59_000 }).cost).toBe("$1.50");
    expect(segments({ costUsd: 1.5 }).cost).toBe("$1.50");
    expect(segments({ costUsd: 0, durationMs: 1_800_000 }).cost).toBe("$0.00");
  });

  it("shows the session time and the share spent waiting on the API", () => {
    expect(segments({ durationMs: 3_900_000, apiDurationMs: 1_950_000 }).time).toBe(
      "◷ 1h05m api 50%",
    );
    expect(segments({ durationMs: 3_900_000 }).time).toBe("◷ 1h05m");
    expect(segments({ durationMs: 0, apiDurationMs: 10 }).time).toBe("◷ 0s");
  });

  it("ranks the context first, then cost, cache, trend and time", () => {
    const ranked = contextSegments(
      input({ cache: { warm: false }, costUsd: 1, durationMs: 1000 }),
      facts({ history: [1, 2] }),
    )
      .toSorted((a, b) => b.priority - a.priority)
      .map(({ text }) => text.split(" ")[0]);
    expect(ranked).toEqual(["CTX", "$1.00", "CACHE", "▁█", "◷"]);
  });
});
