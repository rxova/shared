import { describe, expect, it } from "vitest";
import { readStatusInput } from "@/internal/statusline/read-status-input";

const read = (json: unknown) => readStatusInput(JSON.stringify(json));

const DEFAULTS = {
  sessionId: "",
  model: "Claude",
  modelId: "",
  cwd: "",
  projectDir: "",
  addedDirs: 0,
  fastMode: false,
  thinking: false,
  linesAdded: 0,
  linesRemoved: 0,
  contextSize: 200_000,
  limits: [],
};

describe("readStatusInput", () => {
  it.each(["", "not json", "null", "[1, 2]", '"text"', "{}"])(
    "falls back to defaults for %j",
    (raw) => {
      const input = readStatusInput(raw);
      expect(input).toMatchObject(DEFAULTS);
      for (const key of ["contextTokens", "cache", "spend", "pr", "repo", "costUsd"] as const)
        expect(input[key]).toBeUndefined();
    },
  );

  it("reads a full Claude Code status payload", () => {
    const input = read({
      session_id: "abc-123",
      version: "2.1.0",
      cwd: "/ignored",
      model: { id: "claude-opus-4-7", display_name: "Claude Opus 4.7" },
      workspace: {
        current_dir: "/w/app/src",
        project_dir: "/w/app",
        repo: { owner: "rxova", name: "shared" },
        git_worktree: "feat-x",
        added_dirs: ["/a", "/b"],
      },
      output_style: { name: "Explanatory" },
      agent: { name: "reviewer" },
      vim: { mode: "INSERT" },
      session_name: "fix the bug",
      fast_mode: true,
      thinking: { enabled: true },
      effort: { level: "high" },
      cost: {
        total_cost_usd: 1.25,
        total_duration_ms: 60_000,
        total_api_duration_ms: 30_000,
        total_lines_added: 12,
        total_lines_removed: 3,
      },
      context_window: {
        context_window_size: 200_000,
        used_percentage: 99,
        current_usage: {
          input_tokens: 1000,
          output_tokens: 7777,
          cache_creation_input_tokens: 2000,
          cache_read_input_tokens: 47_000,
        },
      },
      prompt_cache: { hit_ratio: 0.9, ttl: "1h", expires_at: 1_800_000_300, warm: true },
      rate_limits: {
        five_hour: { used_percentage: 42, resets_at: 1_800_003_600 },
        seven_day: { used_percentage: 7.5 },
        spend_limit: { used_percentage: 20, used_usd: 10, limit_usd: 50, period: "monthly" },
      },
      pr: { number: 42, url: "https://x.test/pr/42", review_state: "approved", kind: "pr" },
    });
    expect(input).toEqual({
      sessionId: "abc-123",
      model: "Opus 4.7",
      modelId: "claude-opus-4-7",
      version: "2.1.0",
      cwd: "/w/app/src",
      projectDir: "/w/app",
      repo: "rxova/shared",
      worktree: "feat-x",
      addedDirs: 2,
      outputStyle: "Explanatory",
      agent: "reviewer",
      vimMode: "INSERT",
      sessionName: "fix the bug",
      fastMode: true,
      thinking: true,
      effort: "high",
      costUsd: 1.25,
      durationMs: 60_000,
      apiDurationMs: 30_000,
      linesAdded: 12,
      linesRemoved: 3,
      contextSize: 200_000,
      contextTokens: 50_000,
      cache: { hitRatio: 0.9, ttl: "1h", expiresAt: 1_800_000_300, warm: true },
      limits: [
        { label: "5h", usedPercentage: 42, resetsAt: 1_800_003_600, windowSeconds: 18_000 },
        { label: "7d", usedPercentage: 7.5, resetsAt: undefined, windowSeconds: 604_800 },
      ],
      spend: { usedPercentage: 20, usedUsd: 10, limitUsd: 50, period: "monthly" },
      pr: { number: 42, url: "https://x.test/pr/42", reviewState: "approved", kind: "pr" },
    });
  });

  it("falls back from the workspace directory to cwd, and from the project to cwd", () => {
    expect(read({ cwd: "/w/app" })).toMatchObject({ cwd: "/w/app", projectDir: "/w/app" });
  });

  it("uses the model id when there is no display name, and Claude when there is neither", () => {
    expect(read({ model: { id: "claude-sonnet-4-6" } }).model).toBe("claude-sonnet-4-6");
    expect(read({ model: { display_name: "" } }).model).toBe("Claude");
  });

  it("assumes a 1M context for a [1m] model with no size given", () => {
    expect(read({ model: { id: "claude-opus-4-7[1m]" } }).contextSize).toBe(1_000_000);
    expect(
      read({ model: { id: "claude-opus-4-7[1m]" }, context_window: { context_window_size: 500 } })
        .contextSize,
    ).toBe(500);
  });

  it("sums whichever usage fields are present", () => {
    const input = read({ context_window: { current_usage: { cache_read_input_tokens: 9000 } } });
    expect(input.contextTokens).toBe(9000);
  });

  it("estimates the tokens from the used percentage without usage", () => {
    expect(
      read({ context_window: { context_window_size: 1_000_000, used_percentage: 12.5 } })
        .contextTokens,
    ).toBe(125_000);
  });

  it("names the repository only with both owner and name", () => {
    expect(read({ workspace: { repo: { owner: "rxova" } } }).repo).toBeUndefined();
    expect(read({ workspace: { repo: { name: "shared" } } }).repo).toBeUndefined();
  });

  it("takes the worktree name from the older worktree field", () => {
    expect(read({ worktree: { name: "wt" } }).worktree).toBe("wt");
  });

  it("ignores mistyped fields", () => {
    const input = read({
      session_id: 7,
      fast_mode: "true",
      thinking: { enabled: 1 },
      workspace: { added_dirs: "/a" },
      cost: { total_cost_usd: "1.25", total_lines_added: null },
      rate_limits: { five_hour: { used_percentage: "50" }, seven_day: { used_percentage: 3 } },
      pr: { number: "42" },
    });
    expect(input).toMatchObject({
      sessionId: "",
      fastMode: false,
      thinking: false,
      addedDirs: 0,
      linesAdded: 0,
    });
    expect(input.costUsd).toBeUndefined();
    expect(input.pr).toBeUndefined();
    expect(input.limits.map(({ label }) => label)).toEqual(["7d"]);
  });

  it("reads an empty prompt_cache as a cold cache", () => {
    expect(read({ prompt_cache: {} }).cache).toEqual({
      hitRatio: undefined,
      ttl: undefined,
      expiresAt: undefined,
      warm: false,
    });
  });

  it("reads a spend limit with only its percentage", () => {
    expect(read({ rate_limits: { spend_limit: { used_percentage: 5 } } }).spend).toEqual({
      usedPercentage: 5,
      usedUsd: undefined,
      limitUsd: undefined,
      period: undefined,
    });
  });

  it("reads a GitLab merge request", () => {
    expect(read({ pr: { number: 7, kind: "mr", review_state: "draft" } }).pr).toEqual({
      number: 7,
      url: undefined,
      reviewState: "draft",
      kind: "mr",
    });
  });
});
