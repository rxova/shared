import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { LLMS_FILE } from "@/internal/llms/llms-file";
import type { Failure, PublishedPackage } from "@/internal/llms/llms.types";

/** The root index exists and links every published package's `llms.txt`. */
export const checkRootIndex = (root: string, packages: PublishedPackage[]): Failure[] => {
  const path = join(root, LLMS_FILE);
  if (!existsSync(path)) {
    return [{ where: LLMS_FILE, reason: "is missing at the repository root" }];
  }

  const body = readFileSync(path, "utf8");
  return packages
    .filter((pkg) => !body.includes(`](packages/${pkg.dir}/${LLMS_FILE})`))
    .map((pkg) => ({
      where: LLMS_FILE,
      reason: `does not link packages/${pkg.dir}/${LLMS_FILE}, so ${pkg.name} is missing from the index`,
    }));
};
