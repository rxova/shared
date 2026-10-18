import { describe, expect, it } from "vitest";
import { opencodeInput } from "@/internal/statusline/opencode-input";

const NOW = 1_800_000_000;

describe("opencodeInput", () => {
  it("names the host when the session has no model yet", () => {
    const input = opencodeInput({}, NOW);
    expect(input.model).toBe("OpenCode");
    expect(input.contextTokens).toBeUndefined();
    expect(input.limits).toEqual([]);
  });

  it("counts the window the way OpenCode's own display does", () => {
    const input = opencodeInput(
      { tokens: { input: 10, output: 5, reasoning: 2, cache: { read: 80, write: 3 } } },
      NOW,
    );
    expect(input.contextTokens).toBe(100);
  });

  it("treats a missing part of the count as zero", () => {
    expect(opencodeInput({ tokens: { input: 7 } }, NOW).contextTokens).toBe(7);
  });

  it("reports the cache share of what was read back", () => {
    expect(opencodeInput({ tokens: { input: 25, cache: { read: 75 } } }, NOW).cache).toEqual({
      hitRatio: 0.75,
      warm: true,
    });
  });

  it("leaves the cache out when nothing was read from it", () => {
    expect(opencodeInput({ tokens: { input: 10 } }, NOW).cache).toBeUndefined();
    expect(opencodeInput({ tokens: {} }, NOW).cache).toBeUndefined();
  });

  it("measures elapsed time from when the session started", () => {
    expect(opencodeInput({ startedAt: NOW - 90 }, NOW).durationMs).toBe(90_000);
    expect(opencodeInput({ startedAt: NOW + 30 }, NOW).durationMs).toBe(0);
    expect(opencodeInput({}, NOW).durationMs).toBeUndefined();
  });

  it("falls back to the session's directory for the project", () => {
    expect(opencodeInput({ cwd: "/w/app" }, NOW).projectDir).toBe("/w/app");
    expect(opencodeInput({ cwd: "/w/app", projectDir: "/w" }, NOW).projectDir).toBe("/w");
  });

  it("defaults the window to 200k until the model says otherwise", () => {
    expect(opencodeInput({}, NOW).contextSize).toBe(200_000);
    expect(opencodeInput({ contextSize: 1_000_000 }, NOW).contextSize).toBe(1_000_000);
  });

  it("carries the model, version, cost and running shells through", () => {
    const input = opencodeInput(
      { model: "gpt-5", version: "2.0.1", costUsd: 0.42, sessionId: "s1" },
      NOW,
    );
    expect(input).toMatchObject({
      model: "gpt-5",
      version: "2.0.1",
      costUsd: 0.42,
      sessionId: "s1",
    });
  });
});
