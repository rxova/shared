import { describe, expect, it } from "vitest";
import type { Limit, StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { limitSegments } from "@/internal/statusline/limit-segments";
import { readStatusInput } from "@/internal/statusline/read-status-input";

const NOW = 1_800_000_000;
const FIVE_HOURS = 5 * 3600;
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
const texts = (overrides: Partial<StatusInput> = {}) =>
  limitSegments(input(overrides), facts()).map(({ text }) => text);
const fiveHour = (usedPercentage: number, resetsIn?: number): Limit => ({
  label: "5h",
  usedPercentage,
  resetsAt: resetsIn === undefined ? undefined : NOW + resetsIn,
  windowSeconds: FIVE_HOURS,
});

describe("limitSegments", () => {
  it("is empty without limits, spend or session details", () => {
    expect(texts()).toEqual(["", ""]);
  });

  it("shows a limit with its reset and a plain pace when it will last", () => {
    expect(texts({ limits: [fiveHour(35, FIVE_HOURS / 2)] })[0]).toBe(
      "5H ███▌────── 35% ↺ 2h30m 0.7×",
    );
  });

  it("warns when a limit runs out before it resets", () => {
    expect(texts({ limits: [fiveHour(80, FIVE_HOURS / 2)] })[0]).toBe(
      "5H ████████── 80% ↺ 2h30m ⚠ out in 37m",
    );
    const [painted] = limitSegments(
      input({ limits: [fiveHour(80, FIVE_HOURS / 2)] }),
      facts({ mode: "truecolor" }),
    );
    expect(painted?.text).toContain("\u001b[1;38;2;243;139;168m⚠ out in 37m\u001b[0m");
  });

  it("leaves out the reset and pace when the reset is unknown or past", () => {
    expect(texts({ limits: [fiveHour(60)] })[0]).toBe("5H ██████──── 60%");
    expect(texts({ limits: [fiveHour(60, -10)] })[0]).toBe("5H ██████──── 60%");
  });

  it("leaves out the pace early in the window", () => {
    expect(texts({ limits: [fiveHour(2, FIVE_HOURS - 60)] })[0]).toBe("5H ▎───────── 2% ↺ 4h59m");
  });

  it("ranks the five-hour limit over the weekly one", () => {
    const [five, week] = limitSegments(
      input({
        limits: [fiveHour(10), { label: "7d", usedPercentage: 20, windowSeconds: 604_800 }],
      }),
      facts(),
    );
    expect(five?.text.startsWith("5H")).toBe(true);
    expect(week?.text.startsWith("7D")).toBe(true);
    expect(five?.priority).toBeGreaterThan(week?.priority ?? Infinity);
  });

  it("shows the spend limit with as much as is known", () => {
    const spend = (value: StatusInput["spend"]) => texts({ spend: value }).at(-2);
    expect(spend({ usedPercentage: 42, usedUsd: 21, limitUsd: 50, period: "monthly" })).toBe(
      "SPEND $21.00/$50.00 42% monthly",
    );
    expect(spend({ usedPercentage: 42, usedUsd: 21 })).toBe("SPEND $21.00 42%");
    expect(spend({ usedPercentage: 42 })).toBe("SPEND 42%");
  });

  it("lists the session details, skipping the default output style", () => {
    expect(
      texts({
        agent: "reviewer",
        vimMode: "INSERT",
        outputStyle: "Explanatory",
        addedDirs: 2,
        sessionName: "fix the bug",
        version: "2.1.0",
      }).at(-1),
    ).toBe("@reviewer INSERT ✎ Explanatory +2 dirs “fix the bug” v2.1.0");
    expect(texts({ outputStyle: "default", version: "2.1.0" }).at(-1)).toBe("v2.1.0");
  });

  it("ranks limits over the spend limit over the session details", () => {
    const ranked = limitSegments(
      input({ limits: [fiveHour(10)], spend: { usedPercentage: 1 }, version: "2" }),
      facts(),
    )
      .toSorted((a, b) => b.priority - a.priority)
      .map(({ text }) => text.split(" ")[0]);
    expect(ranked).toEqual(["5H", "SPEND", "v2"]);
  });
});
