import type { Step } from "@/config/config.types";
import { splitLegs } from "@/internal/verify/split-legs";
import type { DryRun, Leg } from "@/verify/verify.types";

/**
 * `verify --plan`: the gate as parallel jobs, in list order. A step is a job
 * of its own; steps sharing a `group` are one job, where the group's first
 * step stands; a `split` step is as many jobs as `splitLegs` deals it into.
 * Each job runs `verify --only <only>`, plus `--filter <filter>` when set.
 */
export const planSteps = (steps: Step[], dryRun: DryRun): Leg[] => {
  const legs: Leg[] = [];
  const groups = new Map<string, Leg>();
  for (const step of steps) {
    const { name, group, split } = step;
    if (split !== undefined) {
      legs.push(...splitLegs(step, split, dryRun));
    } else if (group === undefined) {
      legs.push({ name, only: name, filter: "" });
    } else {
      const leg = groups.get(group);
      if (leg === undefined) {
        const first = { name: group, only: name, filter: "" };
        groups.set(group, first);
        legs.push(first);
      } else {
        leg.only += `,${name}`;
      }
    }
  }
  return legs;
};
