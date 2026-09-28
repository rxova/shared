import type { UserConfig } from "tsdown";
import { baseBuildConfig } from "@/tsdown/base-build-config";

/**
 * The build for a library that serves `require()` and runs in browsers as well
 * as Node: ESM and CJS side by side, platform-neutral, es2020 syntax,
 * tree-shaken.
 *
 * `fixedExtension` is on, so the formats cannot collide: `.mjs`/`.cjs` with
 * `.d.mts`/`.d.cts`. A package whose exports map already names `.js`/`.cjs`
 * passes `fixedExtension: false`.
 */
export const dualBuildConfig = (overrides: UserConfig = {}): UserConfig =>
  baseBuildConfig({
    format: ["esm", "cjs"],
    platform: "neutral",
    target: "es2020",
    fixedExtension: true,
    treeshake: true,
    ...overrides,
  });
