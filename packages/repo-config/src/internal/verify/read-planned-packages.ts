import { isRecord } from "@/internal/config/is-record";
import type { PlannedPackage } from "@/verify/verify.types";

/**
 * The packages in turbo's dry-run JSON that run one of `tasks`, in the order
 * they first appear. A package with no such script (`<NONEXISTENT>`) runs
 * nothing and is left out; one running several tasks adds up their inputs and
 * is a hit only when every one of them is.
 */
export const readPlannedPackages = (json: string, tasks: string[]): PlannedPackage[] => {
  let plan: unknown;
  try {
    plan = JSON.parse(json);
  } catch {
    throw new Error("turbo's --dry=json output is not JSON");
  }
  if (!isRecord(plan) || !Array.isArray(plan.tasks)) {
    throw new Error("turbo's --dry=json output has no task list");
  }
  const packages = new Map<string, PlannedPackage>();
  for (const task of plan.tasks as unknown[]) {
    if (
      !isRecord(task) ||
      typeof task.task !== "string" ||
      !tasks.includes(task.task) ||
      typeof task.package !== "string" ||
      task.command === "<NONEXISTENT>"
    ) {
      continue;
    }
    const weight = isRecord(task.inputs) ? Object.keys(task.inputs).length : 0;
    const hit = isRecord(task.cache) && task.cache.status === "HIT";
    const known = packages.get(task.package);
    if (known === undefined) {
      packages.set(task.package, { name: task.package, weight, hit });
    } else {
      known.weight += weight;
      known.hit &&= hit;
    }
  }
  return [...packages.values()];
};
