import { describe, expect, it } from "vitest";
import { exportTargets } from "@/internal/pack-smoke/export-targets";

describe("exportTargets", () => {
  it("collects exports, main, module, types, typings and bins once each", () => {
    expect(
      exportTargets({
        exports: { ".": { types: "./dist/index.d.ts", default: "./dist/index.js" } },
        main: "./dist/index.js",
        module: "dist/index.mjs",
        types: "./dist/index.d.ts",
        typings: "",
        bin: { tool: "./dist/cli.js" },
      }),
    ).toEqual(["dist/index.d.ts", "dist/index.js", "dist/index.mjs", "dist/cli.js"]);
  });

  it("reads a string bin, and a manifest that points nowhere", () => {
    expect(exportTargets({ bin: "./cli.js" })).toEqual(["cli.js"]);
    expect(exportTargets({})).toEqual([]);
  });
});
