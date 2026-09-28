import type { PackageLlmsConfig } from "@/config/config.types";
import { idsFromSource } from "@/internal/llms/ids-from-source";
import { LLMS_FILE } from "@/internal/llms/llms-file";

/**
 * The terms a package's `llms.txt` must mention and does not: each
 * `requiredTerms` string, and each id `idsFrom` reads. With `idPattern`, a
 * match that is not one of those ids fails too: a stale name left behind by a
 * rename reads exactly like a real instruction.
 */
export const llmsTermFailures = (
  root: string,
  body: string,
  { requiredTerms = [], idPattern, idsFrom }: PackageLlmsConfig = {},
): string[] => {
  const ids = idsFrom === undefined ? [] : idsFromSource(root, idsFrom);
  const stale =
    idPattern === undefined
      ? []
      : [...new Set(body.match(new RegExp(idPattern, "g")) ?? [])].filter(
          (match) => !ids.includes(match),
        );
  return [
    ...requiredTerms
      .filter((term) => !body.includes(term))
      .map((term) => `${LLMS_FILE} does not mention "${term}"`),
    ...ids.filter((id) => !body.includes(id)).map((id) => `${LLMS_FILE} does not mention ${id}`),
    ...stale.map(
      (match) => `${LLMS_FILE} names ${match}, which is not one of the ids in ${String(idsFrom)}`,
    ),
  ];
};
