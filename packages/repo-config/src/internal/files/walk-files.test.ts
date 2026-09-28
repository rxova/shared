import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkFiles } from "@/internal/files/walk-files";

describe("walkFiles", () => {
  it("lists nested files, skipping node_modules and dot-directories", () => {
    const root = mkdtempSync(join(tmpdir(), "walk-files-"));
    try {
      for (const path of ["b.md", "a/c.md", "a/d/e.mdx", "node_modules/x.md", ".git/y.md"]) {
        mkdirSync(join(root, path, ".."), { recursive: true });
        writeFileSync(join(root, path), "");
      }
      expect(walkFiles(root)).toEqual(["a/c.md", "a/d/e.mdx", "b.md"]);
      expect(walkFiles(join(root, "missing"))).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
