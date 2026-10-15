import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { baseBuildConfig } from "@rxova/repo-config/tsdown";
import { build } from "tsdown";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { main } from "@/statusline/statusline-entry";

const EMPTY_CONTEXT = `CTX ${"─".repeat(16)} 0% 0/200k`;

describe("main", () => {
  it("renders the rows for the input on stdin, one per line, from the facts it gathers", () => {
    const seen: StatusInput[] = [];
    const output = main(
      JSON.stringify({
        session_id: "s1",
        model: { display_name: "Claude Sonnet 4.6" },
        context_window: { current_usage: { input_tokens: 100_000 } },
        rate_limits: { seven_day: { used_percentage: 10 } },
      }),
      (input): StatusFacts => {
        seen.push(input);
        return { history: [], now: 0, columns: 200, mode: "none" };
      },
    );
    expect(output).toBe(
      [
        "◆ Sonnet 4.6",
        `CTX ████████${"─".repeat(8)} 50% 100k/200k`,
        `7D █${"─".repeat(9)} 10%`,
      ].join("\n"),
    );
    expect(seen.map(({ sessionId, contextTokens }) => ({ sessionId, contextTokens }))).toEqual([
      { sessionId: "s1", contextTokens: 100_000 },
    ]);
  });

  it("renders the defaults for input it cannot read", () => {
    expect(main("not json", () => ({ history: [], now: 0, columns: 200, mode: "none" }))).toBe(
      `◆ Claude\n${EMPTY_CONTEXT}`,
    );
  });
});

// Building and spawning Node can take several seconds on a cold CI runner.
const SPAWN_TIMEOUT = 60_000;

describe("the built status line as a process", () => {
  const packageDir = fileURLToPath(new URL("../..", import.meta.url));
  const script = join(packageDir, "dist", "statusline.js");
  // Git hooks export GIT_DIR and friends, which would point git at this repository instead.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
  );
  let scratch = "";

  // `pnpm test` does not build first, so build the one file the installer copies, the way
  // tsdown.config.ts does, into dist.
  beforeAll(async () => {
    await build({
      ...baseBuildConfig({
        entry: { statusline: "src/statusline/statusline-entry.ts" },
        dts: false,
        clean: false,
      }),
      cwd: packageDir,
      config: false,
      logLevel: "silent",
    });
    scratch = mkdtempSync(join(tmpdir(), "rx-ai-statusline-e2e-"));
  }, SPAWN_TIMEOUT);

  afterAll(() => {
    if (scratch !== "") rmSync(scratch, { recursive: true, force: true });
  });

  const run = (input: string) =>
    spawnSync(process.execPath, [script], {
      input,
      encoding: "utf8",
      env: {
        ...env,
        RX_STATUSLINE_COLOR: "none",
        COLUMNS: "200",
        TMPDIR: scratch,
        TEMP: scratch,
        TMP: scratch,
      },
    });

  it(
    "reads git and records the session history while rendering",
    () => {
      const repo = join(scratch, "project");
      expect(spawnSync("git", ["init", "-q", "-b", "main", repo], { env }).status).toBe(0);
      writeFileSync(join(repo, "notes.txt"), "draft");
      const result = run(
        JSON.stringify({
          session_id: "e2e-session",
          model: { display_name: "Claude Opus 4.7" },
          workspace: { current_dir: repo, project_dir: repo },
          context_window: {
            current_usage: { input_tokens: 1000, cache_read_input_tokens: 49_000 },
          },
          cost: { total_cost_usd: 1.5 },
        }),
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toBe(
        [
          `◆ Opus 4.7 ┃ ${basename(repo)} ┃ ⎇ main ?1 ⊘`,
          `CTX ████${"─".repeat(12)} 25% 50k/200k ┃ $1.50`,
          "",
        ].join("\n"),
      );
      expect(
        JSON.parse(readFileSync(join(scratch, "rx-ai-statusline", "e2e-session.json"), "utf8")),
      ).toEqual([50_000]);
    },
    SPAWN_TIMEOUT,
  );

  it(
    "prints the defaults for unreadable input outside a repository",
    () => {
      const result = run("not json");
      expect(result.status).toBe(0);
      expect(result.stdout).toBe(`◆ Claude\n${EMPTY_CONTEXT}\n`);
    },
    SPAWN_TIMEOUT,
  );
});
