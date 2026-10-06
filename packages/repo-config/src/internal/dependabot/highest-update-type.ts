import type { SemverUpdate } from "@/internal/dependabot/dependabot.types";

/** The largest of `updateTypes` (major over minor over patch), or undefined when there is none. */
export const highestUpdateType = (updateTypes: readonly SemverUpdate[]): SemverUpdate | undefined =>
  (["major", "minor", "patch"] as const).find((type) => updateTypes.includes(type));
