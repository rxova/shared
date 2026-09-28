import { readFileSync } from "node:fs";
import { join } from "node:path";
import { packageRoot } from "@/internal/cli/package-root";

/** The `version` of this package's manifest. */
export const packageVersion = (from: string): string =>
  (JSON.parse(readFileSync(join(packageRoot(from), "package.json"), "utf8")) as { version: string })
    .version;
