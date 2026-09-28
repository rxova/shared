import { describe, expect, it } from "vitest";
import type { HookInput } from "@/hooks/hook.types";
import { quickCheck } from "@/hooks/quick-check";
import { contextWith } from "@/internal/hooks/context.fixtures";

const edit = (file_path: unknown, cwd = "/repo"): HookInput => ({
  tool_name: "Edit",
  tool_input: { file_path },
  cwd,
});
const bin = (name: string) => `/repo/node_modules/.bin/${name}`;
const web = { "/repo/package.json": "{}", [bin("prettier")]: "", [bin("eslint")]: "" };

describe("quickCheck", () => {
  it("formats with Prettier and lints with ESLint, reporting lint problems back", () => {
    const context = contextWith({
      files: web,
      programs: {
        [`${bin("prettier")} --write --log-level warn /repo/src/a.ts`]: {},
        [`${bin("eslint")} --no-warn-ignored /repo/src/a.ts`]: {
          status: 1,
          stdout: "1:1 error no-unused-vars\n",
        },
      },
    });
    expect(quickCheck.run(edit("src/a.ts"), context)).toEqual({
      code: 2,
      message:
        "rx-ai quick-check: the linter reports problems in src/a.ts:\n1:1 error no-unused-vars",
    });
    expect(context.ran).toHaveLength(2);
  });

  it("is quiet when the linter passes, and ignores a formatter failure", () => {
    const context = contextWith({
      files: web,
      programs: {
        [`${bin("prettier")} --write --log-level warn /repo/src/a.ts`]: {
          status: 2,
          stderr: "syntax",
        },
        [`${bin("eslint")} --no-warn-ignored /repo/src/a.ts`]: {},
      },
    });
    expect(quickCheck.run(edit("/repo/src/a.ts"), context)).toEqual({ code: 0 });
  });

  it("prefers Biome when the project has it, and only formats non-code files", () => {
    const files = { "/repo/package.json": "{}", [bin("biome")]: "", [bin("eslint")]: "" };
    const context = contextWith({
      files,
      programs: { [`${bin("biome")} lint /repo/a.tsx`]: { status: 1, stderr: "lint/style" } },
    });
    expect(quickCheck.run(edit("/repo/a.tsx"), context).message).toContain("lint/style");
    const json = contextWith({ files });
    quickCheck.run(edit("/repo/data.json"), json);
    expect(json.ran).toEqual([`${bin("biome")} format --write /repo/data.json`]);
  });

  it("uses Ruff for Python, from the project venv or PATH", () => {
    const venv = contextWith({
      files: { "/py/pyproject.toml": "", "/py/.venv/bin/ruff": "" },
      programs: {
        "/py/.venv/bin/ruff check --quiet /py/app.py": { status: 1, stdout: "F401 unused import" },
      },
    });
    expect(quickCheck.run(edit("/py/app.py", "/py"), venv).message).toContain("F401");
    const path = contextWith({ files: { "/py/ruff.toml": "" } });
    expect(quickCheck.run(edit("/py/app.py", "/py"), path)).toEqual({ code: 0 });
    expect(path.ran).toEqual(["ruff format /py/app.py", "ruff check --quiet /py/app.py"]);
  });

  it("formats C# with dotnet format whitespace in the file’s folder, needing no project file", () => {
    const context = contextWith();
    expect(quickCheck.run(edit("/svc/src/Api/Program.cs", "/svc"), context)).toEqual({ code: 0 });
    expect(context.ran).toEqual([
      "dotnet format whitespace /svc/src/Api --folder --include /svc/src/Api/Program.cs",
    ]);
  });

  it("trims a long report to 40 lines", () => {
    const context = contextWith({
      files: web,
      programs: {
        [`${bin("eslint")} --no-warn-ignored /repo/a.js`]: { status: 1, stdout: "x\n".repeat(60) },
      },
    });
    expect(quickCheck.run(edit("/repo/a.js"), context).message?.split("\n")).toHaveLength(41);
  });

  it("does nothing for other files, outside a project, on Windows or without a path", () => {
    expect(quickCheck.run(edit("/repo/logo.png"), contextWith({ files: web })).code).toBe(0);
    expect(
      quickCheck.run(edit("/repo/README.md"), contextWith({ files: { "/repo/package.json": "" } }))
        .code,
    ).toBe(0);
    expect(quickCheck.run(edit("/nowhere/a.ts"), contextWith()).code).toBe(0);
    expect(
      quickCheck.run(edit("/repo/a.ts"), contextWith({ files: web, platform: "win32" })).code,
    ).toBe(0);
    expect(quickCheck.run({ tool_name: "Edit", tool_input: {} }, contextWith()).code).toBe(0);
    expect(
      quickCheck.run({ tool_name: "Edit", tool_input: { file_path: "a.ts" } }, contextWith()).code,
    ).toBe(0);
  });
});
