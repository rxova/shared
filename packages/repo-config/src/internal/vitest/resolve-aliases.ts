import { join } from "node:path";
import type { AliasEntry, BaseVitestOptions } from "@/vitest/vitest.types";

/**
 * `@/` as the package's own `src/`, then whatever the package adds, in order.
 * A record becomes string aliases; a list passes through, so a `RegExp` `find`
 * still works.
 */
export const resolveAliases = (
  root: string,
  alias: NonNullable<BaseVitestOptions["alias"]> = {},
): AliasEntry[] => [
  { find: /^@\//, replacement: `${join(root, "src")}/` },
  ...(Array.isArray(alias)
    ? (alias as readonly AliasEntry[])
    : Object.entries(alias as Readonly<Record<string, string>>).map(([find, replacement]) => ({
        find,
        replacement,
      }))),
];
