import type { PackageConfig } from "@/config/config.types";
import { compact } from "@/internal/config/compact";
import { parseBinChecks } from "@/internal/config/parse-bin-checks";
import { parseFixtureRuns } from "@/internal/config/parse-fixture-runs";
import { readEnum } from "@/internal/config/read-enum";

type PackSmokeConfig = NonNullable<PackageConfig["packSmoke"]>;

/** A package's `repoConfig.packSmoke`, checked. */
export const parsePackSmokeConfig = (
  section: Record<string, unknown>,
  path: string,
): PackSmokeConfig =>
  compact<PackSmokeConfig>({
    load: readEnum(section, "load", path, ["auto", "never"]),
    bins: parseBinChecks(section.bins, `${path}.bins`),
    run: parseFixtureRuns(section.run, `${path}.run`),
  });
