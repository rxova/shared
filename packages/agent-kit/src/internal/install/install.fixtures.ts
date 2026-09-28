import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { vi } from "vitest";
import type { InstallEnv } from "@/install/install.types";

/** Writes `files` (relative paths to contents) under `root`. */
export const writeTree = (root: string, files: Record<string, string>): void => {
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
};

const doc = (name: string, body: string) =>
  `---\nname: ${name}\ndescription: ${name} does a thing\n---\n\n${body}\n`;

/**
 * A scratch home, project and built package. Two agents and two skills: `rx-planner` and
 * `rx-verify` are in the core profile, `rx-pitch` and `rx-demo` are not; `rx-verify` has a
 * supporting file. The io records what a command printed.
 */
export const scratchEnv = (version = "1.0.0") => {
  const root = mkdtempSync(join(tmpdir(), "rx-ai-install-"));
  const packageDir = join(root, "pkg");
  writeTree(packageDir, {
    "package.json": JSON.stringify({ version }),
    "content/agents/rx-planner.md": doc("rx-planner", "plans"),
    "content/agents/rx-pitch.md": doc("rx-pitch", "pitches"),
    "content/skills/rx-verify/SKILL.md": doc("rx-verify", "verifies"),
    "content/skills/rx-verify/notes/extra.md": "extra",
    "content/skills/rx-demo/SKILL.md": doc("rx-demo", "demos"),
    "dist/hooks.js": "// runner",
  });
  const env: InstallEnv = {
    home: join(root, "home"),
    cwd: join(root, "project"),
    configHome: join(root, "home", ".config"),
    packageDir,
    io: { out: vi.fn(), err: vi.fn() },
  };
  return { root, env, target: join(root, "home", ".claude") };
};
