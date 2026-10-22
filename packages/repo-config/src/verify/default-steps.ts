import type { Step } from "@/config/config.types";

/**
 * The pre-push gate a repository gets when it names none: the same ordered
 * list CI runs, so a green push means a green pipeline.
 */
export const defaultSteps = (): Step[] => [
  { name: "lint", command: "pnpm lint" },
  { name: "format", command: "pnpm format:check" },
  { name: "build", command: "pnpm exec turbo run build" },
  { name: "typecheck", command: "pnpm exec turbo run typecheck" },
  { name: "unit tests", command: "pnpm exec turbo run test" },
  { name: "package exports", command: "pnpm run check:exports" },
  // `--if-present`: a repository with no package that bans a global has no
  // such script, and a gate step is not a reason to make it invent one.
  { name: "bundle globals", command: "pnpm run --if-present check:bundle" },
  { name: "pack smoke", command: "pnpm run pack:smoke" },
  { name: "dependency versions", command: "pnpm run sherif:check" },
  { name: "unused code", command: "pnpm run knip:check" },
  // Kept after the two above: `pnpm dedupe --check` removes the modules
  // directory when CI is set, so a step after it runs without node_modules.
  { name: "dependency dedupe", command: "pnpm exec turbo run //#dedupe:check" },
  { name: "audit", command: "pnpm run audit:check" },
];
