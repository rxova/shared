import { describe, expect, it } from "vitest";
import { packPackages } from "@/internal/verify/pack-packages";

const pkg = (name: string, weight: number) => ({ name, weight, hit: false });
const names = (lists: { name: string }[][]) => lists.map((list) => list.map(({ name }) => name));

describe("packPackages", () => {
  it("deals the heaviest first, each to the lightest list", () => {
    const packages = [pkg("a", 1), pkg("b", 5), pkg("c", 3), pkg("d", 3), pkg("e", 2)];
    expect(names(packPackages(packages, 2))).toEqual([
      ["b", "e"],
      ["c", "d", "a"],
    ]);
  });

  it("breaks ties by name and by list order, whatever the input order", () => {
    const packages = [pkg("z", 2), pkg("y", 2), pkg("x", 2)];
    expect(names(packPackages(packages, 2))).toEqual([["x", "z"], ["y"]]);
    expect(names(packPackages(packages.toReversed(), 2))).toEqual([["x", "z"], ["y"]]);
  });

  it("leaves no list empty when packages weigh nothing", () => {
    expect(names(packPackages([pkg("a", 0), pkg("b", 0), pkg("c", 0)], 3))).toEqual([
      ["a"],
      ["b"],
      ["c"],
    ]);
  });
});
