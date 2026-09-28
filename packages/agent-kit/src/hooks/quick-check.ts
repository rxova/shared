import { dirname, extname, isAbsolute, resolve } from "node:path";
import type { HookSpec } from "@/hooks/hook.types";
import { fileChecks } from "@/internal/hooks/file-checks";
import { findUp } from "@/internal/hooks/find-up";

/**
 * After a file is edited: formats it with the project's formatter and lints it with the project's
 * linter, then reports any lint problems straight back to the agent, so they are fixed while the
 * change is fresh. Uses only tools the project already has; does nothing on Windows.
 */
export const quickCheck: HookSpec = {
  on: [{ event: "PostToolUse", matcher: "Edit|Write|MultiEdit" }],
  timeout: 30,
  summary: "format and lint each edited file with the project’s own tools; report problems back",
  run: (input, context) => {
    const path = input.tool_input?.file_path;
    if (typeof path !== "string" || context.platform === "win32") return { code: 0 };
    const file = isAbsolute(path) ? path : resolve(input.cwd ?? ".", path);
    const root =
      extname(file) === ".cs"
        ? dirname(file)
        : findUp(dirname(file), ["package.json", "pyproject.toml", "ruff.toml"], context.exists);
    if (root === undefined) return { code: 0 };

    const problems = fileChecks(file, root, context)
      .map(({ program, args, reports }) => ({ reports, result: context.run(program, args, root) }))
      .filter(({ reports, result }) => reports && result.status !== 0 && result.status !== null)
      .map(({ result }) => `${result.stdout}${result.stderr}`.trim())
      .filter((output) => output !== "");
    if (problems.length === 0) return { code: 0 };
    const report = problems.join("\n").split("\n").slice(0, 40).join("\n");
    return {
      code: 2,
      message: `rx-ai quick-check: the linter reports problems in ${path}:\n${report}`,
    };
  },
};
