import type { Tool } from "@/init/init.types";
import { labelsOf } from "@/internal/changeset/labels-of";

/**
 * The pull request's labels as they are now, read with `gh` when `PR_NUMBER`
 * names one, so a re-run sees a label added after the event that started it.
 * Falls back to `PR_LABELS` when `PR_NUMBER` is unset or not a number, and
 * when `gh` cannot read them, saying so in one line. Never throws.
 */
export const liveLabels = (env: NodeJS.ProcessEnv, tool: Tool): string[] => {
  const number = env.PR_NUMBER ?? "";
  if (!/^\d+$/.test(number)) return labelsOf(env.PR_LABELS);
  try {
    return labelsOf(
      tool("gh", [
        "pr",
        "view",
        number,
        "--json",
        "labels",
        "--jq",
        '[.labels[].name] | join(",")',
      ]),
    );
  } catch {
    console.log(
      `check-changeset: could not read the current labels of #${number}; using PR_LABELS`,
    );
    return labelsOf(env.PR_LABELS);
  }
};
