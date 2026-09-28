import { describe, expect, it } from "vitest";
import { dualBuildConfig } from "@/tsdown/dual-build-config";

describe("dualBuildConfig", () => {
  it("builds ESM and CJS for any platform, es2020, with fixed extensions and types", () => {
    expect(dualBuildConfig()).toEqual({
      entry: { index: "src/index.ts" },
      format: ["esm", "cjs"],
      platform: "neutral",
      target: "es2020",
      fixedExtension: true,
      treeshake: true,
      dts: true,
      clean: true,
    });
  });

  it("lets a package keep .js/.cjs names and add its own fields", () => {
    const config = dualBuildConfig({
      fixedExtension: false,
      minify: true,
      entry: { a: "src/a.ts" },
    });
    expect(config).toMatchObject({
      fixedExtension: false,
      minify: true,
      entry: { a: "src/a.ts" },
      format: ["esm", "cjs"],
    });
  });
});
