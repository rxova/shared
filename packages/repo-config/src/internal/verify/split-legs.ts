import type { Step } from "@/config/config.types";
import { packPackages } from "@/internal/verify/pack-packages";
import { readPlannedPackages } from "@/internal/verify/read-planned-packages";
import { turboTasks } from "@/internal/verify/turbo-tasks";
import type { DryRun, Leg } from "@/verify/verify.types";

/**
 * The jobs a `split` step fans out to. Turbo's dry run says which packages
 * would miss the cache; those are dealt by weight into at most `split.max`
 * jobs (default 8), each filtered to its packages. The hits all join the
 * lightest job: replaying them is nearly free, and a job of their own would
 * pay a whole runner's setup. With nothing to run, one job replays it all.
 */
export const splitLegs = (step: Step, split: { max?: number }, dryRun: DryRun): Leg[] => {
  const whole = [{ name: step.name, only: step.name, filter: "" }];
  const packages = readPlannedPackages(dryRun(step.command), turboTasks(step.command));
  const misses = packages.filter(({ hit }) => !hit);
  if (misses.length === 0) return whole;

  const lists = packPackages(misses, Math.min(split.max ?? 8, misses.length));
  // Weighed as `packPackages` weighs them, so the lightest is the one it would pick next.
  const weight = (list: typeof misses) =>
    list.reduce((sum, item) => sum + Math.max(1, item.weight), 0);
  const lightest = lists.reduce((min, list) => (weight(list) < weight(min) ? list : min));
  const hits = packages.filter(({ hit }) => hit).map(({ name }) => name);

  return lists.map((list) => {
    const names = list.map(({ name }) => name);
    if (list === lightest) names.push(...hits.toSorted());
    const more = names.length > 1 ? ` +${String(names.length - 1)}` : "";
    return {
      name: `${step.name} · ${names.slice(0, 1).join("")}${more}`,
      only: step.name,
      filter: names.join(","),
    };
  });
};
