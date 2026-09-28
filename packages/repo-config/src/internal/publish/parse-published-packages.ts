import { isRecord } from "@/internal/config/is-record";
import type { PublishedPackage } from "@/internal/publish/published-package.types";

/** `changesets/action`'s `publishedPackages` output, checked: a non-empty array of `{ name, version }`. */
export const parsePublishedPackages = (value: string): PublishedPackage[] => {
  const parsed: unknown = JSON.parse(value === "" ? "[]" : value);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("PUBLISHED_PACKAGES lists no published package");
  }
  return parsed.map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item.name !== "string" ||
      item.name === "" ||
      typeof item.version !== "string" ||
      item.version === ""
    ) {
      throw new Error(
        `PUBLISHED_PACKAGES holds an entry that is not { name, version }: ${JSON.stringify(item)}`,
      );
    }
    return { name: item.name, version: item.version };
  });
};
