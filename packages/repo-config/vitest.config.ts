import { baseVitestConfig } from "./src/vitest/base-vitest-config.ts";

// The subpath entries' barrels: re-exports only, like index.ts.
export default baseVitestConfig({
  root: import.meta.dirname,
  exclude: ["src/tsdown.ts", "src/vitest.ts", "src/playwright.ts", "src/knip.ts"],
});
