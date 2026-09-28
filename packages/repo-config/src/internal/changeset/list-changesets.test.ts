import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listChangesets } from "@/internal/changeset/list-changesets";

describe("listChangesets", () => {
  it("lists the changeset files, README and config aside, sorted", () => {
    const root = mkdtempSync(join(tmpdir(), "list-changesets-"));
    try {
      expect(listChangesets(root)).toEqual([]);
      mkdirSync(join(root, ".changeset"));
      for (const file of ["b.md", "a.md", "README.md", "config.json"]) {
        writeFileSync(join(root, ".changeset", file), "");
      }
      expect(listChangesets(root)).toEqual([".changeset/a.md", ".changeset/b.md"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
