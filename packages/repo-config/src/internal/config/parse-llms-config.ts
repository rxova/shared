import type { LlmsConfig } from "@/config/config.types";
import { assertOnlyKeys } from "@/internal/config/assert-only-keys";
import { compact } from "@/internal/config/compact";
import { failConfig } from "@/internal/config/fail-config";
import { readBoolean } from "@/internal/config/read-boolean";
import { readEnum } from "@/internal/config/read-enum";
import { readPattern } from "@/internal/config/read-pattern";
import { readStrings } from "@/internal/config/read-strings";
import { readString } from "@/internal/config/read-string";

/**
 * An `llms` section, checked. A package's own `package.json` may set only the
 * per-package keys; `entries`, `sections` and `rootIndex` are the repository's.
 */
export const parseLlmsConfig = (
  section: Record<string, unknown>,
  path: string,
  { packageLevel = false }: { packageLevel?: boolean } = {},
): LlmsConfig => {
  const perPackage = ["api", "requiredTerms", "idPattern", "idsFrom"];
  assertOnlyKeys(
    section,
    path,
    packageLevel ? perPackage : [...perPackage, "entries", "sections", "rootIndex"],
  );
  const idsFrom = readString(section, "idsFrom", path);
  if (idsFrom !== undefined && !/^[^#]+#[A-Za-z_$][\w$]*$/.test(idsFrom)) {
    return failConfig(`${path}.idsFrom`, 'a "path/to/file.ts#EXPORT_NAME" reference');
  }
  return compact<LlmsConfig>({
    api: readEnum(section, "api", path, ["exact", "documented", "props", "none"]),
    requiredTerms: readStrings(section, "requiredTerms", path),
    idPattern: readPattern(section, "idPattern", path, "g"),
    idsFrom,
    entries: readEnum(section, "entries", path, ["index", "subpaths"]),
    sections: readStrings(section, "sections", path),
    rootIndex: readBoolean(section, "rootIndex", path),
  });
};
