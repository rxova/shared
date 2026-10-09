import { rxova } from "@rxova/repo-config/eslint";
import tseslint from "typescript-eslint";

export default rxova({
  tsconfigRootDir: import.meta.dirname,
  strict: true,
  node: true,
  tests: true,
  // The scripts write to stdout: that is their output contract.
  consoleAllowed: ["packages/repo-config/**", "packages/agent-kit/src/internal/cli/console-io.ts"],
  // Claude Code mods: each runs in Claude Code's hooks environment, imports its own files by
  // relative path and is typed against the `claude-code` module the engine lays beside it, so
  // `claude plugin validate` and `claude plugin test` check them instead.
  ignores: ["packages/agent-kit/mods/**"],
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
