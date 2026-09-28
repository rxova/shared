import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { writeTree } from "@/internal/install/install.fixtures";
import { removeFiles } from "@/internal/install/remove-files";

const target = mkdtempSync(join(tmpdir(), "rx-ai-remove-"));
afterAll(() => {
  rmSync(target, { recursive: true, force: true });
});

describe("removeFiles", () => {
  it("removes the files and the directories they empty, and no more", () => {
    writeTree(target, {
      "skills/rx-a/SKILL.md": "",
      "skills/rx-a/deep/more.md": "",
      "skills/other/SKILL.md": "",
    });
    removeFiles(target, ["skills/rx-a/SKILL.md", "skills/rx-a/deep/more.md", "gone.md"]);
    expect(existsSync(join(target, "skills/rx-a"))).toBe(false);
    expect(readdirSync(join(target, "skills"))).toEqual(["other"]);
    expect(existsSync(target)).toBe(true);
  });

  it("stops quietly at a directory that is already gone", () => {
    expect(() => {
      removeFiles(join(target, "missing"), ["a/b.md"]);
    }).not.toThrow();
  });
});
