import type { Manifest } from "@/install/install.types";
import { fromTarget } from "@/internal/install/from-target";
import { isRecord } from "@/internal/install/is-record";
import { readJson } from "@/internal/install/read-json";
import { MANIFEST } from "@/internal/install/install-paths";

/**
 * The manifest of the last install into `target`, or undefined when there is none. A manifest
 * from before profiles existed reads as the `core` profile with no items recorded, and
 * as not having created `settings.json`.
 */
export const readManifest = (target: string): Manifest | undefined => {
  const value = readJson(fromTarget(target, MANIFEST));
  if (!isRecord(value) || typeof value.version !== "string" || !Array.isArray(value.files))
    return undefined;
  const strings = (list: unknown) =>
    Array.isArray(list) ? list.filter((entry): entry is string => typeof entry === "string") : [];
  return {
    version: value.version,
    profile: typeof value.profile === "string" ? value.profile : "core",
    items: strings(value.items),
    files: strings(value.files),
    createdSettings: value.createdSettings === true,
  };
};
