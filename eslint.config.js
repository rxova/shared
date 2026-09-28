import { rxova } from "@rxova/repo-config/eslint";
import tseslint from "typescript-eslint";

export default rxova({
  tsconfigRootDir: import.meta.dirname,
  strict: true,
  node: true,
  tests: true,
  // The scripts write to stdout: that is their output contract.
  consoleAllowed: ["packages/repo-config/**", "packages/agent-kit/src/internal/cli/console-io.ts"],
  extends: [tseslint.configs.stylisticTypeChecked],
  rules: {
    // A module names its own package's files as `@/…`, so a file can move
    // without its importers changing and a path never says `../../`.
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["./*", "../*"],
            message: "Import through the @/… alias, not a relative path.",
          },
        ],
      },
    ],
  },
});
