import { readFile } from "@/internal/config/read-file";
import type { Reader, RepoConfig } from "@/config/config.types";
import { join } from "node:path";
import { parseConfig } from "@/config/parse-config";

/**
 * The `repoConfig` settings of the repository at `root`, or none. Read from the
 * root `package.json`, so a repository that is happy with the defaults writes
 * nothing and one that is not has no extra file to find.
 */
export const readConfig = (root: string, read: Reader = readFile): RepoConfig => {
  const manifest = read(join(root, "package.json"));
  if (manifest === undefined) return {};
  return parseConfig((JSON.parse(manifest) as { repoConfig?: unknown }).repoConfig);
};
