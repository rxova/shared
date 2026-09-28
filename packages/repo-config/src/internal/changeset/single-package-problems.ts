import type { Reader } from "@/config/config.types";
import { packagesNamed } from "@/internal/changeset/packages-named";

/** One line per changeset that does not name exactly one package. */
export const singlePackageProblems = (files: string[], read: Reader): string[] =>
  files.flatMap((file) => {
    const body = read(file);
    if (body === undefined) return [`  ${file}: could not be read`];
    const count = packagesNamed(body);
    return count === 1 ? [] : [`  ${file}: names ${String(count)} packages, expected 1`];
  });
