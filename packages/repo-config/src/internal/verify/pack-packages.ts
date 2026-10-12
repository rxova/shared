import type { PlannedPackage } from "@/verify/verify.types";

/**
 * Deals `packages` into `bins` lists of near-equal weight: heaviest first, each
 * to the lightest list so far (longest processing time first). Ties go by
 * name, then to the first list, so the same plan comes out every time. A
 * weight counts as at least 1, so no list is left empty while packages remain.
 */
export const packPackages = (packages: PlannedPackage[], bins: number): PlannedPackage[][] => {
  // Names are unique, so two packages never compare equal.
  const sorted = packages.toSorted((a, b) => b.weight - a.weight || (a.name < b.name ? -1 : 1));
  const lists = Array.from({ length: bins }, () => ({
    weight: 0,
    packages: [] as PlannedPackage[],
  }));
  for (const item of sorted) {
    const lightest = lists.reduce((min, list) => (list.weight < min.weight ? list : min));
    lightest.packages.push(item);
    lightest.weight += Math.max(1, item.weight);
  }
  return lists.map((list) => list.packages);
};
