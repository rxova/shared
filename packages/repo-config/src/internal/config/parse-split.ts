import type { Step } from "@/config/config.types";
import { compact } from "@/internal/config/compact";
import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";
import { readCount } from "@/internal/config/read-count";

/**
 * A step's `split`, checked: `true` (read as `{}`) or `{ max }`, `max` a
 * positive integer; undefined when it is absent. Whether the step can be split
 * at all is `parseSteps`'s call, which sees the command.
 */
export const parseSplit = (step: Record<string, unknown>, path: string): Step["split"] => {
  const { split } = step;
  if (split === undefined) return undefined;
  if (split === true) return {};
  if (!isRecord(split)) return failConfig(`${path}.split`, "true or a { max } object");
  return compact({ max: readCount(split, "max", `${path}.split`) });
};
