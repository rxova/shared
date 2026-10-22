import { baseVitestConfig } from "@rxova/repo-config/vitest";

// `src/env.ts` and `src/react.ts` are the other entries' barrels: re-exports only, like index.ts.
export default baseVitestConfig({
  root: import.meta.dirname,
  exclude: ["src/env.ts", "src/react.ts"],
});
