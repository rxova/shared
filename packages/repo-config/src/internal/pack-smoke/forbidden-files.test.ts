import { describe, expect, it } from "vitest";
import { forbiddenFiles } from "@/internal/pack-smoke/forbidden-files";

describe("forbiddenFiles", () => {
  it("passes a tarball of built files", () => {
    expect(forbiddenFiles(["LICENSE", "dist/index.js", "dist/src.js"], ["dist"])).toEqual([]);
  });

  it("names sources, tests, specs, __tests__ and e2e suites", () => {
    const contents = [
      "src/index.ts",
      "e2e/app.ts",
      "dist/__tests__/helpers.js",
      "dist/index.test.js",
      "dist/index.spec.d.ts",
      "dist/latest.js",
    ];
    expect(forbiddenFiles(contents, ["dist"])).toEqual(contents.slice(0, 5));
  });

  it("allows what a files entry of the same kind names on purpose", () => {
    const contents = ["src/index.ts", "e2e/fixtures.json", "dist/a.test.js", "dist/__tests__/x.js"];
    expect(
      forbiddenFiles(contents, ["./src", "e2e/fixtures.json", "dist/*.test.js", "dist/__tests__"]),
    ).toEqual([]);
  });

  it("does not let a broader entry excuse a test file under it", () => {
    expect(forbiddenFiles(["dist/a.test.js", "src/a.ts"], ["dist", "src/b.ts"])).toEqual([
      "dist/a.test.js",
      "src/a.ts",
    ]);
  });
});
