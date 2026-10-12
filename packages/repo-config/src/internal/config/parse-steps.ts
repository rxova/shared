import type { Step } from "@/config/config.types";
import { compact } from "@/internal/config/compact";
import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";
import { parseSplit } from "@/internal/config/parse-split";
import { readBoolean } from "@/internal/config/read-boolean";
import { readString } from "@/internal/config/read-string";
import { turboTasks } from "@/internal/verify/turbo-tasks";

/**
 * `repoConfig.verify.steps`, checked: an array of `{ name, command }` pairs of
 * non-empty strings, each optionally marked `skipOnRelease`, and placed in a
 * fan-out job by `group` or `split` (one or the other; `split` only where the
 * command runs `turbo run <task>`). Other keys are dropped.
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
    const group = readString(step, "group", at);
    const split = parseSplit(step, at);
    if (split !== undefined && group !== undefined) {
      return failConfig(at, "either in a group or split, not both");
    }
    if (split !== undefined && turboTasks(step.command).length === 0) {
      return failConfig(`${at}.split`, "on a step whose command runs `turbo run <task>`");
    }
    return compact<Step>({
      name: step.name,
      command: step.command,
      skipOnRelease: readBoolean(step, "skipOnRelease", at),
      group,
      split,
    });
  });
};
