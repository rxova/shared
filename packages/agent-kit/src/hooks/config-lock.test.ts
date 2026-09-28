import { describe, expect, it } from "vitest";
import { contextWith } from "@/internal/hooks/context.fixtures";
import type { HookInput } from "@/hooks/hook.types";
import { configLock } from "@/hooks/config-lock";

const edit = (file_path: unknown, tool_name = "Edit", cwd?: string): HookInput => ({
  tool_name,
  tool_input: { file_path },
  ...(cwd === undefined ? {} : { cwd }),
});
const existing = contextWith({
  files: {
    "/repo/eslint.config.js": "",
    "/repo/packages/a/tsconfig.build.json": "",
    "/repo/.prettierrc": "",
    "/repo/vitest.config.ts": "",
    "/repo/src/app.ts": "",
    "/repo/stylecop.json": "",
    "/repo/Directory.Build.props": "",
  },
});

describe("configLock", () => {
  it.each([
    ["/repo/eslint.config.js", "Edit"],
    ["/repo/packages/a/tsconfig.build.json", "Write"],
    ["/repo/.prettierrc", "MultiEdit"],
    ["/repo/vitest.config.ts", "Edit"],
    ["/repo/stylecop.json", "Edit"],
  ])("blocks changing an existing %s", (path, tool) => {
    const verdict = configLock(edit(path, tool), existing);
    expect(verdict.block).toBe(true);
    expect(verdict).toMatchObject({ reason: expect.stringContaining("ask the user") as string });
  });

  it("resolves a relative path against the session directory", () => {
    expect(configLock(edit("eslint.config.js", "Edit", "/repo"), existing).block).toBe(true);
  });

  it("allows creating a config, and editing any other file", () => {
    expect(configLock(edit("/repo/biome.json", "Write"), existing).block).toBe(false);
    expect(configLock(edit("/repo/src/app.ts"), existing).block).toBe(false);
    expect(configLock(edit("/repo/Directory.Build.props"), existing).block).toBe(false);
  });

  it("ignores reads, other tools and a missing path", () => {
    expect(configLock(edit("/repo/eslint.config.js", "Read"), existing).block).toBe(false);
    expect(configLock(edit(42), existing).block).toBe(false);
    expect(configLock({}, existing).block).toBe(false);
  });
});
