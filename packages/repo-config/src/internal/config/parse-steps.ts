import type { Step } from "@/config/config.types";
import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";

/**
 * `repoConfig.verify.steps`, checked: an array of `{ name, command }` pairs of
 * non-empty strings, each optionally marked `skipOnRelease`.
 */
export const parseSteps = (value: unknown): Step[] => {
  if (!Array.isArray(value)) return failConfig("repoConfig.verify.steps", "an array");
  return value.map((step: unknown, index) => {
    const at = `repoConfig.verify.steps[${String(index)}]`;
    if (
      !isRecord(step) ||
      typeof step.name !== "string" ||
      step.name === "" ||
      typeof step.command !== "string" ||
      step.command === ""
    ) {
      return failConfig(at, "a { name, command } pair of strings");
    }
    const { skipOnRelease } = step;
    if (skipOnRelease === undefined) return { name: step.name, command: step.command };
    if (typeof skipOnRelease !== "boolean") return failConfig(`${at}.skipOnRelease`, "a boolean");
    return { name: step.name, command: step.command, skipOnRelease };
  });
};
