import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { expandGlobs } from "@/internal/files/expand-globs";

const root = mkdtempSync(join(tmpdir(), "expand-globs-"));
for (const path of [
  "README.md",
  "packages/a/README.md",
  "packages/a/llms.txt",
  "packages/b/llms.txt",
  "packages/b/docs/deep.md",
  "docs/x.md",
]) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), "");
}

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("expandGlobs", () => {
  it("expands globs, files and directories, once each, sorted", () => {
    expect(
      expandGlobs(root, [
        "README.md",
        "packages/*/README.md",
        "./packages/*/llms.txt",
        "docs/",
        "README.md",
      ]),
    ).toEqual([
      "README.md",
      "docs/x.md",
      "packages/a/README.md",
      "packages/a/llms.txt",
      "packages/b/llms.txt",
    ]);
  });

  it("crosses directories with **, from the root too", () => {
    expect(expandGlobs(root, ["packages/**/*.md"])).toEqual([
      "packages/a/README.md",
      "packages/b/docs/deep.md",
    ]);
    expect(expandGlobs(root, ["*.md"])).toEqual(["README.md"]);
  });

  it("skips what does not exist", () => {
    expect(expandGlobs(root, ["missing.md", "missing/*.md"])).toEqual([]);
  });
});
