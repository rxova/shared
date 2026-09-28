import { describe, expect, it } from "vitest";
import { missingTargets } from "@/internal/pack-smoke/missing-targets";

describe("missingTargets", () => {
  const contents = ["package.json", "dist/index.js", "dist/index.d.ts", "dist/utils/a.js"];

  it("names each target the tarball lacks", () => {
    expect(
      missingTargets(
        {
          exports: {
            ".": {
              types: { import: "./dist/index.d.ts", require: "./dist/index.d.cts" },
              import: "./dist/index.js",
              require: "./dist/index.cjs",
            },
            "./package.json": "./package.json",
          },
        },
        contents,
      ),
    ).toEqual(["dist/index.d.cts", "dist/index.cjs"]);
  });

  it("wants at least one file for a subpath pattern", () => {
    expect(missingTargets({ exports: { "./utils/*": "./dist/utils/*.js" } }, contents)).toEqual([]);
    expect(missingTargets({ exports: { "./x/*": "./dist/x/*.js" } }, contents)).toEqual([
      "dist/x/*.js",
    ]);
  });
});
