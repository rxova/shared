import type { Tool } from "@/init/init.types";

/**
 * Runs Prettier on the files init rewrote or added, so a rename that changes
 * the width of a Markdown table does not fail the format check. Never throws:
 * when Prettier cannot run it says so and init carries on. A dry run only
 * counts the files.
 */
export const formatFiles = (
  run: Tool,
  root: string,
  files: readonly string[],
  dryRun: boolean,
): void => {
  if (files.length === 0) return;
  const count = `${String(files.length)} file(s)`;
  if (dryRun) {
    console.log(`init: would format ${count}`);
    return;
  }
  try {
    run("pnpm", ["-C", root, "exec", "prettier", "--write", "--ignore-unknown", ...files]);
    console.log(`init: formatted ${count}`);
  } catch {
    console.log(`init: could not run prettier on ${count}; format them before you commit`);
  }
};
