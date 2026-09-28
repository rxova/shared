import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { LlmsConfig } from "@/config/config.types";
import { llmsApiFailures } from "@/internal/llms/llms-api-failures";
import { LLMS_FILE } from "@/internal/llms/llms-file";
import { llmsStructureFailures } from "@/internal/llms/llms-structure-failures";
import { llmsTermFailures } from "@/internal/llms/llms-term-failures";
import type { Failure, PublishedPackage } from "@/internal/llms/llms.types";

/**
 * Every way one package's `llms.txt` can be missing, unshipped, malformed or
 * stale, under `config` (the repository's `repoConfig.llms` merged with the
 * package's own): its shape, its table against the source, and the terms it
 * must mention.
 */
export const checkLlmsPackage = (
  root: string,
  pkg: PublishedPackage,
  config: LlmsConfig = {},
): Failure[] => {
  const pkgDir = join(root, "packages", pkg.dir);
  const path = join(pkgDir, LLMS_FILE);
  if (!existsSync(path)) {
    return [{ where: pkg.name, reason: `has no ${LLMS_FILE}; every published package ships one` }];
  }
  const body = readFileSync(path, "utf8");
  return [
    ...llmsStructureFailures(pkg, body, config),
    ...llmsApiFailures(pkgDir, body, config),
    ...llmsTermFailures(root, body, config),
  ].map((reason) => ({ where: pkg.name, reason }));
};
