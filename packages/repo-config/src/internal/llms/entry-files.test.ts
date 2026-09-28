import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { entryFiles } from "@/internal/llms/entry-files";

const pkg = mkdtempSync(join(tmpdir(), "entry-files-"));
for (const file of ["src/index.ts", "src/devtools/index.ts", "src/internal/helper.ts"]) {
  mkdirSync(join(pkg, file, ".."), { recursive: true });
  writeFileSync(join(pkg, file), "");
}

afterAll(() => {
  rmSync(pkg, { recursive: true, force: true });
});

describe("entryFiles", () => {
  it("reads the index, and the subpath indexes when asked", () => {
    expect(entryFiles(pkg)).toEqual([join(pkg, "src", "index.ts")]);
    expect(entryFiles(pkg, "subpaths")).toEqual([
      join(pkg, "src", "index.ts"),
      join(pkg, "src", "devtools", "index.ts"),
    ]);
  });

  it("is empty for a package without sources", () => {
    expect(entryFiles(join(pkg, "missing"), "subpaths")).toEqual([]);
  });
});
